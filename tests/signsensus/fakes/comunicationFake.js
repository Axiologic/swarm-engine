
var nodes = [];
var PDSFakes = [];

var cfg = require("./simulationConfig").config;
var pds = require("../../../modules/signsensus/lib/InMemoryPDS");
var cutil = require("../../../modules/signsensus/lib/consUtil");
var consensus = require("../../../modules/signsensus/lib/consensusManager");


var maxPulse = cfg.SIMULATION_TIMEOUT/cfg.PULSE_PERIODICITY + 1;

var afterFinish = {

};

var com = {
    broadcastPulse: function(from, pulse){
        nodes.forEach( function(n){
                if(n.nodeName != from) {
                    setTimeout(function(){
                        n.recordPulse(from, pulse);
                    }, cutil.getRandomInt(cfg.NETWORK_DELAY));
                } else {
                    if(pulse.currentPulse > 2 * maxPulse){
                        afterFinish[from] = true;
                    }
                }
        });


        if(Object.keys(afterFinish).length >= cfg.MAX_NODES){
            console.log(Object.keys(afterFinish).length , cfg.MAX_NODES);
            setTimeout(terminate, 1);
        }
    }
}

//network.generateRandomTransaction();
function terminate(){
    exports.dumpVSDs();
    console.log(exports.exportStatistics());
    process.exit();
}



exports.init = function(config){
    if(config){
        console.log("default config overwritten");
        cfg = config;
    }
    for(var i = 0; i < cfg.MAX_NODES; i++){
        var np = pds.newPDS(cfg.MAX_NODES);
        PDSFakes.push(np);
        nodes.push(consensus.createConsensusManager("Node"+i, com, np , cfg.PULSE_PERIODICITY, cfg.MAX_NODES));
    }
}


toalGeneratedCounter = 0 ;
exports.generateRandomTransaction = function() {
    var nodeNumber = cutil.getRandomInt(cfg.MAX_NODES);
    var node = nodes[nodeNumber];
    var pdsHanlder = PDSFakes[nodeNumber].getHandler();

    var swarm = {
        swarmName: "Swarm:" + toalGeneratedCounter
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
    }

    PDSFakes[nodeNumber].computeSwarmTransactionDiff(swarm, pdsHanlder);
    node.createTransactionFromSwarm(swarm);
    toalGeneratedCounter++;
}

exports.dumpVSDs = function(){
    nodes.forEach( node => node.dump());
}

exports.exportStatistics = function(){
    var results = [];
    nodes.forEach( node => {
        results.push(node.exportStatistics());
	});

    if(results.length<0){
        return {};
    }

    var stat = {};
    var indicators = Object.keys(results[0]);
    for(var i=0; i<indicators.length; i++){
        var ind = indicators[i];
        var value = 0;
        for(var j=0; j<nodes.length; j++){
            value +=results[j][ind];
        }
        value = value/nodes.length;
        stat[ind] = value;
    }
    return stat;
}