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
const OwM = swarmUtils.OwM;
const {ManagerForAgents} = require('./ManagerForAgents');
const {PoolConfig, WorkerStrategies, getDefaultBootScriptPath} = require('syndicate');


$$.PSK_PubSub = require("soundpubsub").soundPubSub;

$$.log(`Booting domain ... ${process.env.PRIVATESKY_DOMAIN_NAME}`);
const se = pskruntimeRequire("swarm-engine");
se.initialise(process.env.PRIVATESKY_DOMAIN_NAME);

const config = JSON.parse(process.env.config);

if (typeof config.constitution !== "undefined" && config.constitution !== "undefined") {
    process.env.PRIVATESKY_DOMAIN_CONSTITUTION = config.constitution;
}

if (typeof config.workspace !== "undefined" && config.workspace !== "undefined") {
    process.env.DOMAIN_WORKSPACE = config.workspace;
}

//enabling blockchain from confDir
//validate path exists
const blockchainFolderStorageName = 'conf';

const workspace = path.resolve(process.env.DOMAIN_WORKSPACE);
const blockchainDir = path.join(workspace, process.env.DOMAIN_BLOCKCHAIN_STORAGE_FOLDER || blockchainFolderStorageName);

console.log("Using workspace", workspace);
let blockchain = require("blockchain");

let worldStateCache = blockchain.createWorldStateCache("fs", blockchainDir);
let historyStorage = blockchain.createHistoryStorage("fs", blockchainDir);
let consensusAlgorithm = blockchain.createConsensusAlgorithm("direct");
let signatureProvider = blockchain.createSignatureProvider("permissive");

blockchain.createBlockchain(worldStateCache, historyStorage, consensusAlgorithm, signatureProvider, true, false);

console.log("Agents will be using constitution file", process.env.PRIVATESKY_DOMAIN_CONSTITUTION);

$$.blockchain.start(() => {
    console.log('Blockchain loaded');

    const domainConfig = $$.blockchain.lookup('DomainConfig', process.env.PRIVATESKY_DOMAIN_NAME);

    if(!domainConfig) {
        throw new Error('Could not find any domain config for domain ' + process.env.PRIVATESKY_DOMAIN_NAME);
    }

    for (const alias in domainConfig.communicationInterfaces) {
        if (domainConfig.communicationInterfaces.hasOwnProperty(alias)) {
            let remoteUrls = domainConfig.communicationInterfaces[alias];
            let powerCordToDomain = new se.SmartRemoteChannelPowerCord([remoteUrls.virtualMQ+"/"], process.env.PRIVATESKY_DOMAIN_NAME, remoteUrls.zeroMQ);
            $$.swarmEngine.plug("*", powerCordToDomain);
        }
    }

    //const agentPC = new se.OuterIsolatePowerCord(["../bundles/pskruntime.js", "../bundles/sandboxBase.js", "../bundles/domain.js"]);

    const agents = $$.blockchain.loadAssets('Agent');

    if(agents.length === 0) {
        agents.push({alias: 'system'});
    }

    agents.forEach(agent => {
        const agentPC = new se.OuterThreadPowerCord(["../bundles/pskruntime.js", "../bundles/sandboxBase.js", process.env.PRIVATESKY_DOMAIN_CONSTITUTION]);
        $$.swarmEngine.plug(`${process.env.PRIVATESKY_DOMAIN_NAME}/agent/${agent.alias}`, agentPC);
    });

});

$$.event('status.domains.boot', {name: process.env.PRIVATESKY_DOMAIN_NAME});
