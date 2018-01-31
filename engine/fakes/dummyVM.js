
var sd = require("../choreographies/swarmDescription");

function dummyVM(name){
    function solveSwarm(swarm){
        sd.revive_swarm(swarm);
    }

    $$.PSK_PubSub.subscribe(name, solveSwarm);
}



exports.system = new dummyVM("system");
exports.agent = new dummyVM("agent");