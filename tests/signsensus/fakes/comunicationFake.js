
var nodes = [];
var PDSFakes = [];

var cfg = require("./simulationConfig");
var pds = require("../../../modules/signsensus/lib/InMemoryPDS");
var cutil = require("../../../modules/signsensus/lib/cutil");

var com = {
    broadcastPulse: function(from, pulse){
        nodes.forEach( function(n){
                if(n.nodeName != from) {
                    n.newPulse(pulse, from);
                }
        });
    }
}


exports.init = function(){
    for(var i = 0; i < cfg.MAX_NODES; i++){
        var np = pds.newPDS();
        PDSFakes.push(np);
        nodes.push(consensus.createConsensusManager("Node"+i, com, np , cfg.PULSE_PERIODICITY, cfg.MAX_NODES));
    }
}


var counter = 0 ;
exports.generateRandomTransaction = function(){
    var i = getRandomInt(MAX_NODES);
    var node = nodes[i];
    var pds = PDSFakes[i].createForkedPDS();

    var swarm = {
        swarmName: "Swarm:" + counter
    };

    var howMany = getRandomInt(MAX_KEYS_COUNT/4) + 1;
    for(var i = 0; i< howMany; i++ ){
        var keyName = "key" + getRandomInt(MAX_KEYS_COUNT);

        var dice =  getRandomInt(6);

        if(dice == 0){  //concurrency issues
            keyName = "sameKey";
            pds.writeKey(keyName, getRandomInt(10000));
        }

        if(dice <= 4){
            pds.readKey(keyName);
        } else{
            pds.writeKey(keyName, getRandomInt(10000));
        }

    PDSFakes[i].computeSwarmTransactionDiff(swarm, pds);
    node.createTransactionFromSwarm(swarm);
    counter++;
}

expors.dumpVSDs = function(){
    nodes.forEach( node => console.log(node.dump()));
}