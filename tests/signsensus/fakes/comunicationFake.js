
var nodes = [];
var PDSFakes = [];

var cfg = require("./simulationConfig").config;
var pds = require("../../../modules/signsensus/lib/InMemoryPDS");
var cutil = require("../../../modules/signsensus/lib/consUtil");
var consensus = require("../../../modules/signsensus/lib/consensusManager")

var com = {
    broadcastPulse: function(from, pulse){
        nodes.forEach( function(n){
                if(n.nodeName != from) {
                    n.recordPulse(from, pulse);
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
exports.generateRandomTransaction = function() {
    var i = cutil.getRandomInt(cfg.MAX_NODES);
    var node = nodes[i];
    var pdsHanlder = PDSFakes[i].getHandler();

    var swarm = {
        swarmName: "Swarm:" + counter
    };

    var howMany = cutil.getRandomInt(cfg.MAX_KEYS_COUNT / 4) + 1;
    for (var i = 0; i < howMany; i++) {
        var keyName = "key" + cutil.getRandomInt(cfg.MAX_KEYS_COUNT);

        var dice = cutil.getRandomInt(6);

        if (dice == 0) {  //concurrency issues
            keyName = "sameKey";
            pdsHanlder.writeKey(keyName, cutil.getRandomInt(10000));
        }

        if (dice <= 4) {
            pdsHanlder.readKey(keyName);
        } else {
            pdsHanlder.writeKey(keyName, cutil.getRandomInt(10000));
        }

        PDSFakes[i].computeSwarmTransactionDiff(swarm, pdsHanlder);
        node.createTransactionFromSwarm(swarm);
        counter++;
    }
}

exports.dumpVSDs = function(){
    nodes.forEach( node => console.log(node.dump()));
}