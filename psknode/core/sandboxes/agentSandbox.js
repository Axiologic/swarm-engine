//command line script
//the first argument is a path to a configuration file


//var config = require("util/configLoader.js")(process.args[1]);
const fs = require("fs");
const path = require("path");

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
};

console.log("pskRootFolder", pskRootFolder);

console.log("Booting sandbox:", spaceName);

//TODO
// ??? why we need this? what changed?
process.chdir(path.join(process.env.PRIVATESKY_TMP, "sandboxes", spaceName));

require(path.join(process.cwd(), "bundles", "pskruntime.js"));
require(path.join(process.cwd(), "bundles", "psknode.js"));
require(path.join(process.cwd(), "bundles", "sandboxBase.js"));

require('launcher');

if(runInVM){

	const IsolatedVM = require('../modules/pskisolates');
	const shimsBundle = fs.readFileSync(`./bundles/sandboxBase.js`);
	const pskruntime = fs.readFileSync('./builds/devel/pskruntime.js');
	const pskNode = fs.readFileSync('./builds/devel/psknode.js');
	const constitution = fs.readFileSync(constitutionPath);

	$$.event('sandbox.start', {spaceName});

	IsolatedVM.getDefaultIsolate({shimsBundle: shimsBundle, browserifyBundles: [pskruntime, pskNode, constitution], config: IsolatedVM.IsolateConfig.defaultConfig}, (err, isolate) => {
		if (err) {
			throw err;
		}

		let folder = process.cwd();
    	const mq = require("foldermq");
    	const path = require("path");

        const inbound = mq.createQue(path.join(folder, "/mq/inbound/"), $$.defaultErrorHandlingImplementation);
        let outbound = mq.createQue(path.join(folder, "/mq/outbound/"), $$.defaultErrorHandlingImplementation);
        outbound.setIPCChannel(process);
        outbound = outbound.getHandler();

		const self = global;
		isolate.globalSetSync('returnSwarm', function(swarm) {
            outbound.sendSwarmForExecution.call(self, JSON.parse(swarm));
		});

        function catchingErrors(err){
            console.log("Got some errors", err);
            throw err;
        }

		isolate.run(`
            global.$$.PSK_PubSub.subscribe($$.CONSTANTS.SWARM_FOR_EXECUTION, function(swarm){
                console.log("returning");
                returnSwarm.apply(undefined, [JSON.stringify(swarm)]);
            });
		`).catch(catchingErrors);

        inbound.setIPCChannel(process);
        inbound.registerAsIPCConsumer(function(err, swarm){
			swarm = JSON.stringify(swarm);

			isolate.run(`
				require("callflow").swarmInstanceManager;
				//restore and execute this tasty swarm
				global.$$.swarmsInstancesManager.revive_swarm(JSON.parse('${swarm}'));
			`).catch(catchingErrors);
        });

		setInterval(async () => {
			const rawIsolate = isolate.rawIsolate;
			const cpuTime = rawIsolate.cpuTime;
			const wallTime = rawIsolate.wallTime;

			const heapStatistics = await rawIsolate.getHeapStatistics();
			const activeCPUTime = (cpuTime[0] + cpuTime[1] / 1e9) * 1000;
			const totalCPUTime = (wallTime[0] + wallTime[1] / 1e9) * 1000;
			const idleCPUTime = totalCPUTime - activeCPUTime;
			$$.event('sandbox.metrics', {heapStatistics, activeCPUTime, totalCPUTime, idleCPUTime});

		}, 10 * 1000) // 10 seconds

	});

    // const SandboxCreator = require('./sandboxCreator');
    // const vm = SandboxCreator.createVM(["./builds/devel/pskruntime", "dicontainer", "launcher", "yazl", "yauzl", "double-check", "psk-http-client", "pskcrypto", "virtualmq", "dicontainer", "foldermq", "interact", "swarmutils", "pskdb"]);

}else {
	console.log("Loading constitution from", constitutionPath);
	require(constitutionPath);

    require("callflow").swarmInstanceManager;

    let sand = require('agentBase').agentPubSub;

    global.$$.PSK_PubSub = sand.create(process.cwd());


    console.log(`Sandbox [${spaceName}] is running and waiting for swarms.`);
}
