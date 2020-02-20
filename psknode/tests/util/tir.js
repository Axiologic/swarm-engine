/**
 * Test Integration Runner
 *
 */

const config = {
    addressForSubscribers: process.env.PSK_SUBSCRIBE_FOR_LOGS_ADDR || 'tcp://127.0.0.1:7001'
};

const path = require('path');

require(path.resolve(path.join(__dirname, "../../bundles/edfsBar.js")));
require(path.resolve(path.join(__dirname, "../../bundles/virtualMQ.js")));

const os = require('os');
const fs = require('fs');

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

function buildConstitutionFromDescription(describer, options) {
    let opts = Object.assign(
        {
            nl: '\n',
            semi: ';',
            tab: '  '
        },
        options
    );

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

    return contents;
}

function createConstitution(prefix, describer, options, constitutionSourcesFolder, callback) {
    const pskdomain = require('../../../modules/pskdomain');

    constitutionSourcesFolder = constitutionSourcesFolder || [];

    if (typeof constitutionSourcesFolder === 'string') {
        constitutionSourcesFolder = [constitutionSourcesFolder];
    }

    const contents = buildConstitutionFromDescription(describer, options);

    if (contents && contents !== '') {
        const tempConstitutionFolder = path.join(prefix, 'tmpConstitution');
        const file = path.join(tempConstitutionFolder, 'index.js');

        fs.mkdirSync(tempConstitutionFolder, {recursive: true});
        fs.writeFileSync(file, contents);
        constitutionSourcesFolder.push(tempConstitutionFolder);
    }

    console.log('[TIR] Will construct constitution from', constitutionSourcesFolder);
    pskdomain.createConstitutionFromSources(constitutionSourcesFolder, prefix, callback);
}

const Tir = function () {
    const virtualMQ = require('virtualmq');
    const pingPongFork = require('../../core/utils/pingpongFork');
    const EDFS = require('edfs');

    if (!$$.securityContext) {
        $$.securityContext = require("psk-security-context").createSecurityContext();
    }

    const edfsTransportStrategyName = 'tirTransport';
    const edfs = EDFS.attach(edfsTransportStrategyName);
    const domainConfigs = {};
    const rootFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'psk_'));

    let testerNode = null;
    let virtualMQNode = null;
    let virtualMQPort = null;
    let zeroMQPort = null;

    /**
     * Adds a domain to the configuration, in a fluent way.
     * Does not launch anything, just stores the configuration.
     *
     * @param {string} domainName The name of the domain
     * @param {array} agents The agents to be inserted
     * @param {string} constitutionSourceFolder
     * @param bundlesSourceFolder
     * @returns SwarmDescriber
     */
    this.addDomain = function (domainName, agents, constitutionSourceFolder, bundlesSourceFolder) {
        let workspace = path.join(rootFolder, 'nodes', createKey(domainName));
        domainConfigs[domainName] = {
            name: domainName,
            agents,
            constitution: {},
            constitutionSourceFolder,
            bundlesSourceFolder: bundlesSourceFolder || path.resolve(path.join(__dirname, '../../bundles')),
            workspace: workspace,
            blockchain: path.join(workspace, 'conf')
        };

        return new SwarmDescriber(domainName);
    };

    this._createConstitution = createConstitution;

    function SwarmDescriber(domainName) {
        function describe(swarmName, swarmDescription) {
            domainConfigs[domainName].constitution[swarmName] = swarmDescription;
        }

        this.swarms = {describe};
        this.swarm = {describe};
    }

    /**
     * Launches all the configured domains.
     *
     * @param {number|function} tearDownAfter The number of milliseconds the TIR will tear down, even if the test fails. If missing, you must call tearDown
     * @param {function} callable The callback
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

            if(Object.keys(domainConfigs).length === 0) { // no domain added
                prepareTeardownTimeout();
                callable(undefined, virtualMQPort);

                return;
            }

            launchLocalMonitor(callCallbackWhenAllDomainsStarted);

            const confFolder = path.join(rootFolder, 'conf');
            fs.mkdirSync(confFolder);
            fs.mkdirSync(path.join(rootFolder, 'nodes'));

            console.info('[TIR] pskdb on', confFolder);

            const defaultConstitutionBundlesPath = path.resolve(path.join(__dirname, "../../bundles"));
            const launcherBar = edfs.createBar();
            launcherBar.addFolder(defaultConstitutionBundlesPath, EDFS.constants.CSB.CONSTITUTION_FOLDER, (err) => {
                if(err) { throw err; }

                const launcherBarSeed = launcherBar.getSeed();
                edfs.loadCSB(launcherBarSeed, (err, launcherCSB) => {
                    if(err) { throw err; }

                    $$.blockchain = launcherCSB;
                    whenAllFinished(Object.values(domainConfigs), this.buildDomainConfiguration, (err) => {
                        if (err) {
                            throw err;
                        }

                        const seed = launcherCSB.getSeed().toString();

                        testerNode = pingPongFork.fork(
                            path.resolve(path.join(__dirname, "../../core/launcher.js")),
                            [seed, rootFolder],
                            {
                                stdio: 'inherit',
                                env: {
                                    PSK_PUBLISH_LOGS_ADDR: `tcp://127.0.0.1:${zeroMQPort}`
                                }
                            }
                        );

                        initializeSwarmEngine(virtualMQPort);
                        prepareTeardownTimeout();
                    });
                });
            });
        });

        let domainsLeftToStart = Object.keys(domainConfigs).length;

        function callCallbackWhenAllDomainsStarted() {
            domainsLeftToStart -= 1;

            if (domainsLeftToStart === 0) {
                callable(undefined, virtualMQPort);
            }
        }

        function prepareTeardownTimeout() {
            setTimeout(() => {
                if (tearDownAfter !== null) {
                    setTimeout(() => this.tearDown(1), tearDownAfter);
                }
            }, 1000);
        }
    };

    function launchVirtualMQNode(maxTries, storageFolder, callback) {
        if (maxTries === 0) {
            return;
        }

        if(typeof storageFolder === "function"){
            callback = storageFolder;
            storageFolder = maxTries;
            maxTries = 100;
        }

        if(typeof maxTries === "function"){
            callback = maxTries;
            storageFolder = rootFolder;
            maxTries = 100;
        }

        const virtualMQPort = getRandomPort();
        process.env.vmq_channel_storage = storageFolder;
        virtualMQNode = virtualMQ.createVirtualMQ(virtualMQPort, storageFolder, '', err => {
            if (err) {
                launchVirtualMQNode(maxTries - 1, storageFolder, callback);
                return
            }

            const edfsURL = `http://localhost:${virtualMQPort}`;
            $$.brickTransportStrategiesRegistry.add(edfsTransportStrategyName, new EDFS.HTTPBrickTransportStrategy(edfsURL));

            $$.securityContext.generateIdentity((err, agentId) => {
                if (err) {
                    return callback(err);
                }

                callback(undefined, virtualMQPort);
            });

        });
    }
    this.launchVirtualMQNode = launchVirtualMQNode;

    function launchLocalMonitor(maxTries, onBootMessage) {
        if (typeof maxTries === 'function') {
            onBootMessage = maxTries;
            maxTries = 100;
        }

        if (typeof maxTries !== 'number' || maxTries < 0) {
            maxTries = 100;
        }

        const zeromqName = 'zeromq';
        const zmq = require(zeromqName);
        const zmqReceiver = zmq.createSocket('sub');

        zmqReceiver.subscribe('events.status.domains.boot');
        zmqReceiver.on('message', onBootMessage);

        let portFound = false;

        while (!portFound && maxTries > 0) {
            zeroMQPort = getRandomPort();
            maxTries -= 1;
            try {
                zmqReceiver.bindSync(`tcp://127.0.0.1:${zeroMQPort}`);
                portFound = true;
            } catch (e) {
                console.log(e);
            } // port not found yet
        }

        if (!portFound) {
            throw new Error('Could not find a free port for zeromq');
        }

        console.log('[TIR] zeroMQ bound to address', `tcp://127.0.0.1:${zeroMQPort}`);

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
     * @param {object} domainConfig The domain configuration stored by addDomain
     * @param callback
     */
    this.buildDomainConfiguration = (domainConfig, callback) => {
        console.info('[TIR] domain ' + domainConfig.name + ' in workspace', domainConfig.workspace);
        console.info('[TIR] domain ' + domainConfig.name + ' inbound', domainConfig.inbound);

        fs.mkdirSync(domainConfig.workspace, {recursive: true});

        getConstitutionSeed((err, constitutionSeed) => {
            if (err) {
                return callback(err);
            }

            const zeroMQPort = getRandomPort();
            const communicationInterfaces = {
                system: {
                    virtualMQ: `http://127.0.0.1:${virtualMQPort}`,
                    // zeroMQ: `tcp://127.0.0.1:${zeroMQPort}`
                }
            };

            $$.blockchain.startTransactionAs("secretAgent", "Domain", "add", domainConfig.name, "system", domainConfig.workspace, constitutionSeed)
                .onCommit((err) => {
                    if (err) {
                        return callback(err);
                    }

                    if (domainConfig.agents && Array.isArray(domainConfig.agents) && domainConfig.agents.length > 0) {

                        edfs.loadCSB(constitutionSeed, (err, csb) => {
                            if (err) {
                                return callback(err);
                            }

                            let transactionsLeft = domainConfig.agents.length + 1;

                            console.info('[TIR] domain ' + domainConfig.name + ' starting defining agents...');

                            domainConfig.agents.forEach(agentName => {
                                console.info('[TIR] domain ' + domainConfig.name + ' agent', agentName);
                                csb.startTransactionAs("secretAgent", "Agents", "add", agentName, "public_key")
                                    .onCommit(maybeCallCallback);
                            });

                            csb.startTransactionAs('secretAgent', 'DomainConfigTransaction', 'add', domainConfig.name, communicationInterfaces)
                                .onCommit(maybeCallCallback);

                            function maybeCallCallback(err) {
                                if (err) {
                                    transactionsLeft = -1;
                                    return callback(err);
                                }

                                transactionsLeft -= 1;

                                if (transactionsLeft === 0) {
                                    callback();
                                }
                            }
                        });
                    } else {
                        callback();
                    }
                })
        });

        function getConstitutionSeed(callback) {
            getConstitutionFile((err, pathToConstitution) => {
                if (err) {
                    return callback(err);
                }


                const constitutionBundles = [pathToConstitution, domainConfig.bundlesSourceFolder];
                console.log("constitutionBundles", constitutionBundles);

                deployConstitutionCSB(constitutionBundles, domainConfig.name, (err, seedBuffer) => {
                    if (err) {
                        return callback(err);
                    }

                    callback(undefined, seedBuffer.toString());
                });
            })
        }

        function deployConstitutionCSB(constitutionPaths, domainName, callback) {

            if (typeof domainName === "function" && typeof callback === "undefined") {
                callback = domainName;
                domainName = "";
            }

            const constitutionArchive = edfs.createBar();

            const lastHandler = (err) => {
                if (err) {
                    return callback(err);
                }

                const seed = constitutionArchive.getSeed();
                callback(undefined, seed);
            };

            const __addNext = (index = 0) => {
                if (index >= constitutionPaths.length) {

                    if (domainName !== "") {
                        constitutionArchive.writeFile(EDFS.constants.CSB.DOMAIN_IDENTITY_FILE, domainName, lastHandler)
                    } else {
                        lastHandler();
                    }

                    return;
                }

                const currentPath = constitutionPaths[index];

                constitutionArchive.addFolder(currentPath, EDFS.constants.CSB.CONSTITUTION_FOLDER, (err) => {
                    if (err) {
                        return callback(err);
                    }

                    __addNext(index + 1);
                });
            };

            __addNext();
        }

        function getConstitutionFile(callback) {
            if (typeof domainConfig.constitution === 'string') {
                callback(undefined, domainConfig.constitution);
            } else {
                createConstitution(domainConfig.workspace, domainConfig.constitution, undefined, domainConfig.constitutionSourceFolder, callback);
            }
        }
    };

    this.getDomainConfig = domainName => {
        return domainConfigs[domainName];
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

    this.buildConstitution = function(path, targetArchive, callback){
        const pskdomain = require("pskdomain");
        process.env.PSK_ROOT_INSTALATION_FOLDER = require("path").join(__dirname, "../../../");
        pskdomain.createConstitutionFromSources(path, (err, fileName)=>{
            if(err){
                return callback(err);
            }
            const edfs = require("edfs");
            targetArchive.addFile(fileName, `${edfs.constants.CSB.CONSTITUTION_FOLDER}/domain.js`, callback);
        });
    }
};


function whenAllFinished(array, handler, callback) {
    let tasksLeft = array.length;

    if(tasksLeft === 0) {
        callback();
    }

    for (const task of array) {
        handler(task, (err) => {
            tasksLeft--;

            if (err) {
                tasksLeft = -1;
                return callback(err);
            }

            if (tasksLeft === 0) {
                callback(undefined);
            }
        });
    }
}

module.exports = new Tir();
