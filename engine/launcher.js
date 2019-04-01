//command line script
//the first argument is a path to a configuration folder
//the second argument is a path to a temporary folder

require("./../builds/devel/pskruntime.js");
require('./../builds/devel/psknode');
require('./../builds/devel/virtualMQ');

exports.core = require(__dirname+"/core");
const childProcess = require('child_process');
const path = require('path');
const beesHealer = require("swarmutils").beesHealer;

var tmpDir = require("os").tmpdir();
var confDir = path.resolve("conf");

if(process.argv.length >= 3){
    confDir = path.resolve(process.argv[2]);
}

if(process.argv.length >= 4){
    tmpDir = path.resolve(process.argv[3]);
}

if(!process.env.PRIVATESKY_TMP){
    process.env.PRIVATESKY_TMP = tmpDir;
}

var fs = require("fs");

var basePath =  tmpDir ;
fs.mkdir(basePath, function(){});

var codeFolder =  path.normalize(__dirname + "/../");

if(!process.env.PRIVATESKY_ROOT_FOLDER){
	process.env.PRIVATESKY_ROOT_FOLDER = codeFolder;
}

$$.container = require("../modules/dicontainer").newContainer($$.errorHandler);

$$.PSK_PubSub = require("./pubSub/launcherPubSub.js").create(basePath, codeFolder);

$$.loadLibrary("pds", __dirname+"/../libraries/localNode");

//enabling blockchain from confDir
require('pskdb').startDB(confDir);

$$.container.declareDependency($$.DI_components.swarmIsReady, [$$.DI_components.sandBoxReady, /*$$.DI_components.localNodeAPIs*/], function(fail, sReady, localNodeAPIs){
    if(!fail){
        console.log("Node launching...");
        $$.localNodeAPIs = localNodeAPIs;
        //launchDomainSandbox('localhost');

        //launching domainSandbox based on info from blockchain
        let transaction = $$.blockchain.beginTransaction({});
        let domains = transaction.loadAssets("global.DomainReference");

        for(let i=0; i < domains.length; i++){
            let domain = domains[i];
            launchDomainSandbox(domain.alias, domain);
        }

        if(domains.length>0){
            //if we have children launcher will send exit event to them before exiting...
            require("./util/exitHandler")(domainSandboxes);
        }

        return true;
    }
    return false;
});

const domainSandboxes = {};

function launchDomainSandbox(name, configuration) {
    if(!domainSandboxes[name]) {
        const env = {config: JSON.parse(JSON.stringify(beesHealer.asJSON(configuration).publicVars))};

        if(Object.keys(env.config.remoteInterfaces).length  === 0 && Object.keys(env.config.localInterfaces).length === 0) {
            console.log(`Skipping starting domain ${name} due to missing both remoteInterfaces and localInterfaces`);
            return;
        }

        const child = childProcess.fork('domainSandbox.js', [name], {cwd: __dirname, env: {config: JSON.stringify(env.config)}});
        child.on('exit', (code, signal) => {
            console.log(`DomainSandbox [${name}] got an error code ${code}. Restarting...`);
            delete domainSandboxes[name];
            launchDomainSandbox(name, configuration);
        });

        domainSandboxes[name] = child;
    } else {
        console.log('Trying to start a sandbox for a domain that already has a sandbox');
    }
}
