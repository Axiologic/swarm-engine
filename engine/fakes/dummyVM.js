
var sd = require("../choreographies/swarmDescription");


function dummyVM(name){


    function solveSwarm(swarm){
        $$.swarmsInstancesManager.revive_swarm(swarm);
    }

    $$.PSK_PubSub.subscribe(name, solveSwarm);

    console.log("Creating a fake execution context...");
}



dummyVM($$.CONSTANTS.SWARM_FOR_EXECUTION);