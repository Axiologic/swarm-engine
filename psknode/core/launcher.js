//command line script
//the first argument is a path to a configuration folder
//the second argument is a path to a temporary folder
const path = require('path');

require(path.join(__dirname, '../bundles/pskruntime.js'));
require(path.join(__dirname, '../bundles/psknode.js'));

const childProcess = require('child_process');
const fs = require('fs');
const beesHealer = require('swarmutils').beesHealer;

//exports.core = require(__dirname+"/core");
require('launcher');

require("callflow");

var tmpDir = path.join(__dirname, "../../tmp");
var confDir = path.resolve(path.join(__dirname, "conf"));

if(process.argv.length >= 3){
    confDir = path.resolve(process.argv[2]);
}

if(process.argv.length >= 4){
    tmpDir = path.resolve(process.argv[3]);
}

if(!process.env.PRIVATESKY_TMP){
    process.env.PRIVATESKY_TMP = tmpDir;
}

var basePath =  tmpDir ;
fs.mkdir(basePath, function(){});

var codeFolder =  path.normalize(__dirname + "/../");

if(!process.env.PRIVATESKY_ROOT_FOLDER){
	process.env.PRIVATESKY_ROOT_FOLDER = codeFolder;
}

$$.container = require("dicontainer").newContainer({throwError:console.log});

$$.PSK_PubSub = require("domainBase").domainPubSub.create(basePath, codeFolder);

//TODO: cum ar fi mai bine oare sa tratam cazul in care nu se gaseste configuratia nodului PSK????
if (!fs.existsSync(confDir)) {
    console.log(`\n[::] Could not find conf directory!\n`);
}

//enabling blockchain from confDir
const blockchain = require('blockchain');
let worldStateCache = blockchain.createWorldStateCache("fs", confDir);
let historyStorage = blockchain.createHistoryStorage("fs", confDir);
let consensusAlgorithm = blockchain.createConsensusAlgorithm("direct");
let signatureProvider  =  blockchain.createSignatureProvider("permissive");

blockchain.createBlockchain(worldStateCache, historyStorage, consensusAlgorithm, signatureProvider, true, false);

var domainSandboxes = {};
function launchDomainSandbox(name, configuration) {
    if(!domainSandboxes[name]) {
        const env = {config: JSON.parse(JSON.stringify(beesHealer.asJSON(configuration).publicVars))};

        if(Object.keys(env.config.remoteInterfaces).length  === 0 && Object.keys(env.config.localInterfaces).length === 0) {
            console.log(`Skipping starting domain ${name} due to missing both remoteInterfaces and localInterfaces`);
            return;
        }

        var child_env = JSON.parse(JSON.stringify(process.env));
        child_env.config = JSON.stringify(env.config);
        child_env.PRIVATESKY_TMP = process.env.PRIVATESKY_TMP;
        child_env.PRIVATESKY_ROOT_FOLDER = process.env.PRIVATESKY_ROOT_FOLDER;

        const child = childProcess.fork(path.join(__dirname,'sandboxes/domainSandbox.js'), [name], {cwd: __dirname, env: child_env});
        child.on('exit', (code, signal) => {
            setTimeout(()=>{
                console.log(`DomainSandbox [${name}] got an error code ${code}. Restarting...`);
                delete domainSandboxes[name];
                launchDomainSandbox(name, configuration);
            }, 100);
        });

        domainSandboxes[name] = child;
    } else {
        console.log('Trying to start a sandbox for a domain that already has a sandbox');
    }
}

$$.container.declareDependency($$.DI_components.swarmIsReady, [$$.DI_components.sandBoxReady, /*$$.DI_components.localNodeAPIs*/], function(fail, sReady, localNodeAPIs){
    if(!fail){
        console.log("PSK Node launching...");
        $$.localNodeAPIs = localNodeAPIs;

        //launching domainSandbox based on info from blockchain

        $$.blockchain.start(()=>{
            let domains = $$.blockchain.loadAssets("DomainReference");

            for(let i=0; i < domains.length; i++){
                let domain = domains[i];
                launchDomainSandbox(domain.alias, domain);
            }

            if(domains.length>0){
                //if we have children launcher will send exit event to them before exiting...
                require('./utils/exitHandler')(domainSandboxes);
            }else{
                console.log(`\n[::] No domains were deployed.\n`);
            }
        });


        return true;
    }
    return false;
});
