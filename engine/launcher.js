


//command line script
//the first argument is a path to a configuration file


//var config = require("util/configLoader.js")(process.args[1]);
require("./../builds/devel/pskruntime.js");


exports.core = require(__dirname+"/core");
const childProcess = require('child_process');
const path = require('path');

var tmpDir ;

if(process.env.PRIVATESKY_TMP){
    tmpDir = process.env.PRIVATESKY_TMP;
}
else
if(process.argv.length === 3){
    tmpDir = path.resolve(process.argv[2]);
    process.env.PRIVATESKY_TMP = tmpDir;

} else {
    tmpDir = require("os").tmpdir();
    process.env.PRIVATESKY_TMP = tmpDir;
}


var fs = require("fs");

var basePath =  tmpDir ;
fs.mkdir(basePath, function(){});

var cfgPath = basePath + "psk.config";


var codeFolder =  path.normalize(__dirname + "/../");

if(!process.env.PRIVATESKY_ROOT_FOLDER){
	process.env.PRIVATESKY_ROOT_FOLDER = codeFolder;
}

$$.container = require("../modules/dicontainer").newContainer($$.errorHandler);

$$.PSK_PubSub = require("./pubSub/launcherPubSub.js").create(basePath, codeFolder);

/*
$$.loadLibrary("crl", __dirname+"/../libraries/crl");
$$.loadLibrary("pds", __dirname+"/../libraries/pds");*/
$$.loadLibrary("pds", __dirname+"/../libraries/localNode");

var launcher = $$.loadLibrary("launcher", __dirname + "/../libraries/launcher");

$$.container.declareDependency($$.DI_components.swarmIsReady, [$$.DI_components.sandBoxReady, /*$$.DI_components.localNodeAPIs*/], function(fail, sReady, localNodeAPIs){
    if(!fail){
        console.log("Node launching...");
        $$.localNodeAPIs = localNodeAPIs;
        launchDomainSandbox('localhost');
        return true;
    }
    return false;
});

const domainSandboxes = {};

function launchDomainSandbox(name) {
    if(!domainSandboxes[name]) {
        const child = childProcess.fork('domainSandbox.js', [name], {cwd: __dirname});
        child.on('exit', (code, signal) => {
            console.log(`DomainSandbox [${name}] got an error code ${code}. Restarting...`);
            delete domainSandboxes[name];
            launchDomainSandbox(name);
        });

        domainSandboxes[name] = child;
    } else {
        console.log('Trying to start a sandbox for a domain that already has a sandbox');
    }

}


