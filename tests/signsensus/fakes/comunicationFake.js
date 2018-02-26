
var nodes = [];
var PDSFakes = [];

var cfg = require("./simulationConfig");
var pds = require("./PDSFake");
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



exports.generateRandomTransaction = function(){
    var i = getRandomInt(MAX_NODES);
    var node = nodes[i];
    var pds = PDSFakes[i];

    var swarm = {
        input:{},
        output:{}
    };

    var howMany = getRandomInt(MAX_KEYS_COUNT/4) + 1;
    for(var i = 0; i< howMany; i++ ){
        var keyName = "key" + getRandomInt(MAX_KEYS_COUNT);

        var key = {};
        key.name    = keyName;
        var problemsDice =  getRandomInt(3); // one in 3 keys will create concurrency issues
        if(problemsDice){
            key.version = readKey(keyName);
        } else {

            var key = {};
            key.name    = keyName;
            key.version = modifyKey(keyName);
            result.output[keyName] = key;
        }
        result.input[keyName] = key;
    }

    var howMany = getRandomInt(MAX_KEYS_COUNT/8) + 1 ;
    for(var i = 0; i< howMany; i++ ){
        var keyName = "key" + getRandomInt(MAX_KEYS_COUNT);

        var key = {};
        key.name    = keyName;
        key.version = modifyKey(keyName);
        result.output[keyName] = key;
    }


    node.createTransactionFromSwarm(swarm);
}

expors.dumpVSDs = function(){
    nodes.forEach( node => console.log(node.dump()));
}