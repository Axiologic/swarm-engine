const path = require('path');
require("../utils/pingpongFork").enableLifeLine(1000);

/**
 * These need to be first to allow customization of behavior of libraries in bundles
 * Currently PSKLogger (used inside callflow) uses this
 */
process.env.PRIVATESKY_DOMAIN_NAME = process.argv[2] || "AnonymousDomain" + process.pid;
process.env.PRIVATESKY_DOMAIN_CONSTITUTION = "../bundles/domain.js";
process.env.PRIVATESKY_TMP = process.env.PRIVATESKY_TMP || path.resolve("../tmp");
process.env.DOMAIN_WORKSPACE = path.resolve(process.env.PRIVATESKY_TMP, "domainsWorkspace", process.env.PRIVATESKY_DOMAIN_NAME);
process.env.vmq_zeromq_sub_address = process.env.vmq_zeromq_sub_address || 'tcp://127.0.0.1:5000';

require('../../bundles/pskruntime');
require('../../bundles/psknode');
require('../../bundles/virtualMQ');

require('psk-http-client');
const folderMQ = require("foldermq");
const fs = require('fs');

const http = require('http');
const swarmUtils = require("swarmutils");
const SwarmPacker = swarmUtils.SwarmPacker;
const VirtualMQ = require('virtualmq');
const OwM = swarmUtils.OwM;
const {ManagerForAgents} = require('./ManagerForAgents');
const {PoolConfig, WorkerStrategies, getDefaultBootScriptPath} = require('syndicate');


$$.PSK_PubSub = require("soundpubsub").soundPubSub;

$$.log(`Booting domain ... ${process.env.PRIVATESKY_DOMAIN_NAME}`);

const domainConfig = JSON.parse(process.env.config);

if (typeof domainConfig.constitution !== "undefined" && domainConfig.constitution !== "undefined") {
    process.env.PRIVATESKY_DOMAIN_CONSTITUTION = domainConfig.constitution;
}

if (typeof domainConfig.workspace !== "undefined" && domainConfig.workspace !== "undefined") {
    process.env.DOMAIN_WORKSPACE = domainConfig.workspace;
}

//enabling blockchain from confDir
//validate path exists
const confDir = path.resolve(process.env.DOMAIN_WORKSPACE);

$$.log("Using workspace", confDir);
let blockchain = require("blockchain");

let worldStateCache = blockchain.createWorldStateCache("fs", confDir);
let historyStorage = blockchain.createHistoryStorage("fs", confDir);
let consensusAlgorithm = blockchain.createConsensusAlgorithm("direct");
let signatureProvider = blockchain.createSignatureProvider("permissive");

blockchain.createBlockchain(worldStateCache, historyStorage, consensusAlgorithm, signatureProvider, true, false);
$$.blockchain.start(() => {
    $$.log("blockchain loaded!");
});


$$.log("Agents will be using constitution file", process.env.PRIVATESKY_DOMAIN_CONSTITUTION);

const agentConfig = PoolConfig.createByOverwritingDefaults({
    maximumNumberOfWorkers: domainConfig.maximumNumberOfWorkers,
    workerStrategy: domainConfig.workerStrategy,
    bootScriptPath: './boot_script_facilitator.js',
    workerOptions: {
        cwd: process.env.DOMAIN_WORKSPACE,
        env: {
            args: JSON.stringify([
                path.resolve(`${__dirname}/../../bundles/pskruntime.js`),
                "syndicate",
                "loadThreadBootScript"
            ])
        },
        workerData: {
            constitutions: [
                path.resolve(process.env.PRIVATESKY_DOMAIN_CONSTITUTION)
            ]
        }
    }
});

new ManagerForAgents(agentConfig);

process.nextTick(() => { // to give time to initialize all top level variables
    for (const alias in domainConfig.communicationInterfaces) {
        if (domainConfig.communicationInterfaces.hasOwnProperty(alias)) {
            let remoteUrls = domainConfig.communicationInterfaces[alias];
            connectToRemote(alias, remoteUrls.virtualMQ, remoteUrls.zeroMQ);
        }
    }

    setTimeout(() => {
        for (let alias in domainConfig.localInterfaces) {
            if (domainConfig.localInterfaces.hasOwnProperty(alias)) {

                let path = domainConfig.localInterfaces[alias];
                connectLocally(alias, path);
            }
        }
    }, 100);
});


$$.event('status.domains.boot', {name: process.env.PRIVATESKY_DOMAIN_NAME});

let virtualReplyHandlerSet = false;

function connectToRemote(alias, virtualMQAddress, zeroMQAddress) {
    $$.remote.createRequestManager(1000);
    const listeningChannel = $$.remote.base64Encode(process.env.PRIVATESKY_DOMAIN_NAME);

    $$.log(`\n[***]Alias "${alias}" listening on virtualMQ: ${virtualMQAddress} channel ${listeningChannel} and zeroMQ: ${zeroMQAddress}\n`);

    const request = VirtualMQ.getVMQRequestFactory(virtualMQAddress, zeroMQAddress);

    request.createForwardChannel(listeningChannel, 'demo-public-key', (res) => {
        if (res.statusCode >= 400) {
            console.error('error creating channel', res.statusCode);
            // throw err;
            return;
        }

        request.receiveMessageFromZMQ(listeningChannel, 'someSignature', () => {
        }, (channel, message) => {
            $$.PSK_PubSub.publish($$.CONSTANTS.SWARM_FOR_EXECUTION, message);
        })
    });

    //we need only one subscriber to send all answers back to the network...
    if (!virtualReplyHandlerSet) {

        //subscribe on PubSub to catch all returning swarms and push them to network accordingly
        $$.PSK_PubSub.subscribe($$.CONSTANTS.SWARM_RETURN, (packedSwarm) => {
            const swarmHeader = SwarmPacker.getHeader(packedSwarm);

            const urlRegex = new RegExp(/^(www|http:|https:)+[^\s]+[\w]/);
            if (urlRegex.test(swarmHeader.swarmTarget)) {
                $$.remote.doHttpPost(swarmHeader.swarmTarget, packedSwarm, function (err, res) {
                    if (err) {
                        $$.error(err);
                    }
                });
            }
        }, () => true);

        virtualReplyHandlerSet = true;
    }

}

let localReplyHandlerSet = false;
const queues = {};

function connectLocally(alias, path2folder) {
    if (!queues[alias]) {
        path2folder = path.resolve(path2folder);
        fs.mkdir(path2folder, {recursive: true}, (err, res) => {
            const queue = folderMQ.createQue(path2folder, (err, res) => {
                if (!err) {
                    console.log(`\n[***]Alias <${alias}> listening local on ${path2folder}\n`);
                }
            });
            queue.registerConsumer((err, swarm) => {
                if (!err) {
                    $$.PSK_PubSub.publish($$.CONSTANTS.SWARM_FOR_EXECUTION, SwarmPacker.pack(OwM.prototype.convert(swarm)));
                }
            });
            queues[alias] = queue;
        });
    } else {
        console.log(`Alias ${alias} has already a local queue attached.`);
    }

    if (!localReplyHandlerSet) {
        $$.PSK_PubSub.subscribe($$.CONSTANTS.SWARM_RETURN, (packedSwarm) => {
            const swarmHeader = SwarmPacker.getHeader(packedSwarm);

            const urlRegex = new RegExp(/^(www|http:|https:)+[^\s]+[\w]/);
            if (!urlRegex.test(swarmHeader.swarmTarget)) {
                const q = folderMQ.createQue(swarmHeader.swarmTarget, (err, res) => {
                    if (!err) {
                        const swarm = SwarmPacker.unpack(packedSwarm);
                        q.getHandler().sendSwarmForExecution(swarm)
                    } else {
                        console.log(`Unable to send to folder ${swarmHeader.swarmTarget} swarm with id $swarm.meta.id`);
                    }
                });
            }
        }, () => true);
        localReplyHandlerSet = true;
    }
}
