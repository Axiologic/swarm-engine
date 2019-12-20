/**
 * Test Integration Runner
 *
 */

const path = require('path');

const __dName = __dirname;
require(path.resolve(path.join(__dName, "../../bundles/pskruntime.js")));
require(path.resolve(path.join(__dName, "../../bundles/psknode.js")));
require(path.resolve(path.join(__dName, "../../bundles/consoleTools.js")));
require(path.resolve(path.join(__dName, "../../bundles/testsRuntime.js")));

const os = require('os');
const fs = require('fs');
const interact = require('interact');

const child_process = require('child_process');
const blockchain = require('blockchain');

const createKey = function (name) {
    let parsed = '' + name;
    parsed.replace(/^[A-Za-z0-9 ]+/g, ' ');
    return parsed
        .split(' ')
        .map((word, idx) =>
            idx === 0
                ? word.toLocaleLowerCase()
                : word.substr(0, 1).toLocaleUpperCase() + word.toLowerCase().substr(1)
        )
        .join('');
};

const rmDeep = folder => {
    if (fs.existsSync(folder)) {
        fs.readdirSync(folder).forEach(file => {
            const curPath = path.join(folder, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                rmDeep(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folder);
    }
};

const createConstitution = (prefix, describer, options) => {
    let opts = Object.assign(
        {
            nl: '\n',
            semi: ';',
            tab: '  '
        },
        options
    );

    const file = path.join(prefix, 'constitution.js');
    const contents = Object.keys(describer)
        .reduce((c, name) => {
            let line = "$$.swarms.describe('" + name + "', {";
            line += Object.keys(describer[name])
                .reduce((f, prop) => {
                    if (typeof describer[name][prop] === 'object') {
                        f.push(opts.nl + opts.tab + prop + ': ' + JSON.stringify(describer[name][prop]));
                    } else {
                        f.push(opts.nl + opts.tab + prop + ': ' + describer[name][prop].toString());
                    }
                    return f;
                }, [])
                .join(',');
            line += opts.nl + '})' + opts.semi;
            c.push(line);
            return c;
        }, [])
        .join(opts.nl);
    fs.writeFileSync(file, contents);
    return file;
};

const Tir = function () {
    const virtualMQ = require('virtualmq');
    const pingPongFork = require('../../core/utils/pingpongFork');

    const domainConfigs = {};
    const rootFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'psk_'));

    let testerNode = null;
    let virtualMQNode = null;
    let virtualMQPort = null;
    let zeroMQPort

    /**
     * Adds a domain to the configuration, in a fluent way.
     * Does not launch anything, just stores the configuration.
     *
     * @param string domain The name of the domain
     * @param array agents The agents to be inserted
     * @param object|string constitution The swarm describer, either as an object or as a string file path
     * @returns this
     */
    this._addDomain = (domain, agents, constitution) => {
        let workspace = path.join(rootFolder, 'nodes', createKey(domain));
        let domainConfig = {
            name: domain,
            agents,
            constitution,
            workspace: workspace,
            conf: path.join(workspace, 'conf'),
            inbound: path.join(workspace, 'inbound'),
            outbound: path.join(workspace, 'outbound')
        };
        domainConfigs[domain] = domainConfig;
        return this;
    };

    this.addDomain = function (domainName, agents) {
        let workspace = path.join(rootFolder, 'nodes', createKey(domainName));
        domainConfigs[domainName] = {
            name: domainName,
            agents,
            constitution: {},
            workspace: workspace,
            conf: path.join(workspace, 'conf')
        };

        return new SwarmDescriber(domainName);
    };

    this._createConstitution = createConstitution;

    function SwarmDescriber(domainName) {
        function describe(swarmName, swarmDescription) {
            domainConfigs[domainName].constitution.swarmName = swarmDescription;
        }

        this.swarms = {describe};
        this.swarm = {describe};
    }

    /**
     * Launches all the configured domains.
     *
     * @param integer tearDownAfter The number of miliseconds the TIR will tear down, even if the test fails. If missing, you must call tearDown
     * @param function callable The callback
     */
    this.launch = (tearDownAfter, callable) => {
        if (callable === undefined && tearDownAfter.call) {
            callable = tearDownAfter;
            tearDownAfter = null;
        }

        if (testerNode !== null) {
            throw new Error('Test node already launched!');
        }

        if (virtualMQNode !== null) {
            throw new Error('VirtualMQ node already launched!');
        }

        console.info('[TIR] setting working folder root', rootFolder);
        launchVirtualMQNode(100, rootFolder, (err, vmqPort) => {
            if (err) {
                throw err;
            }

            virtualMQPort = vmqPort;

            const confFolder = path.join(rootFolder, 'conf');

            console.info('[TIR] pskdb on', confFolder);

            let worldStateCache = blockchain.createWorldStateCache("fs", confFolder);
            let historyStorage = blockchain.createHistoryStorage("fs", confFolder);
            let consensusAlgorithm = blockchain.createConsensusAlgorithm("direct");
            let signatureProvider = blockchain.createSignatureProvider("permissive");

            blockchain.createBlockchain(worldStateCache, historyStorage, consensusAlgorithm, signatureProvider, true, false);

            fs.mkdirSync(path.join(rootFolder, 'nodes'));

            console.info('[TIR] start building nodes...');
            Object.keys(domainConfigs).forEach(name => {
                const domainConfig = domainConfigs[name];
                this.buildDomainConfiguration(domainConfig);
            });

            testerNode = pingPongFork.fork(
                path.resolve(path.join(__dName, "../../core/launcher.js")),
                [confFolder, rootFolder],
                {stdio: 'inherit'}
            );

            initializeSwarmEngine(virtualMQPort);

            console.log('swarm engine e gata');

            setTimeout(() => {
                if (tearDownAfter !== null) {
                    setTimeout(() => this.tearDown(1), tearDownAfter);
                }
                callable();
            }, 1000);
        });

    };

    function launchVirtualMQNode(maxTries, rootFolder, callback) {
        if (maxTries === 0) {
            return;
        }

        const virtualMQPort = getRandomPort();
        process.env.vmq_channel_storage = rootFolder;
        virtualMQNode = virtualMQ.createVirtualMQ(virtualMQPort, rootFolder, '', err => {
            if (err) {
                launchVirtualMQNode(maxTries - 1, rootFolder, callback);
                return
            }

            callback(undefined, virtualMQPort);
        });
    }

    function initializeSwarmEngine(port) {
        const se = require('swarm-engine');
        se.initialise();

        const powerCordToDomain = new se.SmartRemoteChannelPowerCord([`http://127.0.0.1:${port}/`]);
        $$.swarmEngine.plug("*", powerCordToDomain);

    }

    function getRandomPort() {
        const min = 9000;
        const max = 65535;
        return Math.floor(Math.random() * (max - min) + min);
    }

    /**
     * Builds the config for a node.
     *
     * @param object domainConfig The domain configuration stored by addDomain
     */
    this.buildDomainConfiguration = domainConfig => {
        console.info('[TIR] domain ' + domainConfig.name + ' in workspace', domainConfig.workspace);
        console.info('[TIR] domain ' + domainConfig.name + ' inbound', domainConfig.inbound);

        fs.mkdirSync(domainConfig.workspace);

        let constitutionFile = domainConfig.constitution;
        if (typeof domainConfig.constitution !== 'string') {
            constitutionFile = createConstitution(domainConfig.workspace, domainConfig.constitution);
        }

        const zeroMQPort = getRandomPort();
        const communicationInterfaces = {
            system: {
                virtualMQ: `http://127.0.0.1:${virtualMQPort}`,
                // zeroMQ: `tcp://127.0.0.1:${zeroMQPort}`
            }
        };

        $$.blockchain.startTransactionAs("secretAgent", "Domain", "add", domainConfig.name, "system", domainConfig.workspace, constitutionFile, communicationInterfaces);
        $$.blockchain.startTransactionAs("secretAgent", "Domain", "setMaximumNumberOfWorkers", domainConfig.name, 1);
        if (domainConfig.agents && Array.isArray(domainConfig.agents) && domainConfig.agents.length > 0) {

            let worldStateCache = blockchain.createWorldStateCache("fs", domainConfig.conf);
            let historyStorage = blockchain.createHistoryStorage("fs", domainConfig.conf);
            let consensusAlgorithm = blockchain.createConsensusAlgorithm("direct");
            let signatureProvider = blockchain.createSignatureProvider("permissive");
            blockchain.createBlockchain(worldStateCache, historyStorage, consensusAlgorithm, signatureProvider, true, true);

            console.info('[TIR] domain ' + domainConfig.name + ' starting defining agents...');

            domainConfig.agents.forEach(agentName => {
                console.info('[TIR] domain ' + domainConfig.name + ' agent', agentName);
                $$.blockchain.startTransactionAs("secretAgent", "Agents", "add", agentName, "public_key");
            });
        }
    };
    this.getDomainConfig = domainName => {
        return domainConfigs[domainName];
    };
    /**
     * Interacts with an agent of a domain.
     *
     * @param string domain The name of the domain
     * @param string agent The name of the agent
     * @returns swarm
     */
    this.interact = (domain, agent) => {
        const domainConfig = domainConfigs[domain];
        if (domainConfig === undefined) {
            throw new Error(
                'Could not find domain ' + domain + ' in ' + Object.keys(domainConfigs).join(', ')
            );
        } else {
            var returnChannel = path.join(
                domainConfig.outbound,
                Math.random()
                    .toString(36)
                    .substr(2, 9)
            );
            try {
                fs.mkdirSync(domainConfig.outbound);
            } catch (err) {
                //dir allready exists
            }
            console.info(
                '[TIR] Interacting with ' + domainConfig.name + '/' + agent + ' on',
                returnChannel
            );

            return interact.createNodeInteractionSpace(agent, domainConfig.inbound, returnChannel);
        }
    };

    /**
     * Tears down all the nodes
     *
     * @param exitStatus The exit status, to exit the process.
     */
    this.tearDown = exitStatus => {
        console.info('[TIR] Tearing down...');
        if (testerNode) {
            console.info('[TIR] Killing node', testerNode.pid);
            try {
                process.kill(testerNode.pid);
            } catch (e) {
                console.info('[TIR] Node already killed', testerNode.pid);
            }
            testerNode = null;
        }

        if (virtualMQNode) {
            console.log('[TIR] Killing VirtualMQ node', virtualMQNode.pid);
            try {
                process.kill(virtualMQNode.pid)
            } catch (e) {
                console.info('[TIR] VirtualMQ node already killed', virtualMQNode.pid);
            }
        }

        setTimeout(() => {
            try {
                console.info('[TIR] Removing temporary folder', rootFolder);
                rmDeep(rootFolder);
                console.info('[TIR] Temporary folder removed', rootFolder);
            } catch (e) {
                //just avoid to display error on console
            }

            if (exitStatus !== undefined) {
                process.exit(exitStatus);
            }
        }, 100);
    };
};

module.exports = new Tir();
