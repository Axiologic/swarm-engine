//command line script
//the first argument is a path to a configuration file


//var config = require("util/configLoader.js")(process.args[1]);
const fs = require("fs");
const path = require("path");
require('../builds/devel/pskruntime');
require('../builds/devel/psknode');

require('./core');

let spaceName = "self";
let runInVM = false;
let constitutionPath = './builds/devel/domain.js';

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

if (process.argv.length < 4) {
	console.log("Failed to find root folder of installation into args. \nUsing default PRIVATESKY_ROOT_FOLDER value");
}
pskRootFolder = process.argv[3] || process.env.PRIVATESKY_ROOT_FOLDER;

if (process.argv.length < 5) {
	console.log("Failed to find constituion build file.");
}
if(process.argv[4]){
	constitutionPath = process.argv[4];
}

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


if(runInVM){

    const SandboxCreator = require('./sandboxCreator');
    const vm = SandboxCreator.createVM(["./builds/devel/pskruntime", "dicontainer", "launcher", "yazl", "yauzl", "double-check", "psk-http-client", "pskcrypto", "virtualmq", "dicontainer", "foldermq", "interact", "swarmutils", "pskdb"]);

    vm.run(`
        'strict mode';
        // console.error('entering sandbox');
        require('./builds/devel/pskruntime');
        //require('./code/engine/core.js');

        require("callflow").swarmInstanceManager;
        
        const sand = require('./code/engine/pubSub/sandboxPubSub');
        
        global.$$.PSK_PubSub = sand.create(__dirname);

        $$.loadLibrary('testSwarms', 'code/libraries/testSwarms');
        
        console.log("Sandbox [${spaceName}] is running and waiting for swarms.");
`, process.cwd() + "/vm.js");
}else {
	console.log("Loading constitution from", constitutionPath);
	require(constitutionPath);

    require("callflow").swarmInstanceManager;

    const sand = require('./code/engine/pubSub/sandboxPubSub');

    global.$$.PSK_PubSub = sand.create(process.cwd());


    console.log(`Sandbox [${spaceName}] is running and waiting for swarms.`);
}