
var sd = require("../choreographies/swarmDescription");



function dummyVM(name){
    function solveSwarm(swarm){
        console.log("Got a swarm!")
        $$.swarms.revive_swarm(swarm);
    }
    $$.PSK_PubSub.subscribe($$.CONSTANTS.SWARM_FOR_EXECUTION, solveSwarm);
}



