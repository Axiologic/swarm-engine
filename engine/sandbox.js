//command line script
//the first argument is a path to a configuration file


//var config = require("util/configLoader.js")(process.args[1]);
const fs = require("fs");
const path = require("path");
const SandboxCreator = require('./sandboxCreator');
require('./core');

let spaceName = "self";

//---------------------------- ARGS pre-processing -----------------------------
let argv;
if (process.argv.length < 3) {
	console.log("Failed send args to sandbox process");
	return;
} else {
	argv = process.argv[2].split(",");
}

if (argv.length < 1 || argv[0] === "") {
	console.log("Failed to start sandbox with a space name");
	return;
} else {
	spaceName = argv[0];
}

if (argv.length < 2) {
	console.log("Failed to find root folder of installation into args. \nUsing default PRIVATESKY_ROOT_FOLDER value");
}
pskRootFolder = argv[1] || process.env.PRIVATESKY_ROOT_FOLDER;

//---------------------------- ARGS pre-processing -----------------------------

var oldLog = console.log;
console.log = function(...args){
	oldLog.apply(this, ["["+spaceName+"]"].concat(args));
}

console.log("pskRootFolder", pskRootFolder);

console.log("Booting sandbox:", spaceName);

//TODO
// ??? why we need this? what changed?
process.chdir($$.pathNormalize(path.join(process.env.PRIVATESKY_TMP, "sandboxes", spaceName)));

/*

Once everything it is tied done deployer needs to be run in order to get more dependencies ready for the sandbox

var deployer = require("./../deployer/Deployer.js");
//a minimal config example
var config = {
	"domain": spaceName,
	"modules": ["soundpubsub", "virtualmq"],
	"libraries": ["core", "crl"]
};

deployer.runBasicConfig(pskRootFolder, config, function (error, result) {
	if(error){
		console.log("[Sandbox Deployer - Error]", error);
	}else{
		console.log("[Sandbox Deployer - Result]", result);
	}
});*/

const vm = SandboxCreator.createVM();

vm.run(`
        'strict mode';
        // console.error('entering sandbox');
        require('./code/engine/core.js');

		require("callflow").swarmInstanceManager;
        
        const sand = require('./code/engine/pubSub/sandboxPubSub');
        
        global.$$.PSK_PubSub = sand.create(__dirname);

        $$.loadLibrary('testSwarms', 'code/libraries/testSwarms');
		
		console.log("Sandbox [${spaceName}] is running and waiting for swarms.");
`, process.cwd() + "/test.js");
