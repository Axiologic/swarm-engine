const consensus = require("../../modules/signsensus/lib/localConsensus");

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


var MAX_NODES = 5;
var SIMULATION_TIMEOUT  = 1000;
var PULSE_PERIODICITY   = 300;

var PULSES_TIMEOUT      = 10;

var MAX_KEYS_COUNT      = 10;

var nodes = [];


var transactionCounter = 0;
function Transaction(swarm, input, output){
    this.input  = input;
    this.output = output;
    this.swarm  = swarm;
    this.pulseNumber  = 0; //will be modified by nodes

    var arr     = process.hrtime();
    this.second  = arr[0];
    this.nanosecod  = arr[1];

    //this.digest = ssutil.hashValues(this);
    this.digest = "T"+ transactionCounter; //TODO:  this is for debug and tests only.. use the proper hashValues
    transactionCounter++;
}




function TransactionInputOutput(keys){
    this.getKeys = function(){
        return keys;
    }
}


function fakePDSVerificationSpace(){

    var keys = {};

    function readKey(name){
        var k = keys[name];
        if(!k){
            k = keys[name] = 0;
        }
        return k;
    }

    function modifyKey(name){
        var k = keys[name];
        if(!k){
            k = keys[name] = 1;
        } else {
            k++;
            keys[name] = k;
        }
        return  k;
    }


    this.generateInputOut = function(){
        var result = {
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

        return result;
    }

}

var com = {
    broadcastPulse: function(pulse, from){
        nodes.forEach( function(n){
            setTimeout(function(){
                if(n.nodeName != from) {
                    n.newPulse(pulse, from);
                }
            }, getRandomInt(PULSE_PERIODICITY * 2))
        });
    },
    requestPulse: function(whoIsAsking, fromWho, pulseNumber){
        setTimeout(function(){
            var t = nodes[fromWho].getPulse(pulseNumber);
            if(t){
                nodes[whoIsAsking].newPulse(t, fromWho);
            }
        }, getRandomInt(PULSE_PERIODICITY * 2))
    }
}

for(var i = 0; i< MAX_NODES; i++){
    nodes.push(consensus.createConsensusManager("Node"+i, com, PULSE_PERIODICITY, MAX_NODES));
}



var numberTransactions = 15;
var counter = 0;


var fakePDS = new fakePDSVerificationSpace();

while(numberTransactions > 0){
    setTimeout(function(){
        var i = getRandomInt(MAX_NODES);
        var n = nodes[i];
        var inpOut = fakePDS.generateInputOut();
        n.newTransaction(new Transaction("TransactionSwarm" + counter, inpOut.input, inpOut.output ));
        counter++;
    }, getRandomInt(SIMULATION_TIMEOUT *2));
    numberTransactions--;
}

setTimeout(function(){
    nodes.forEach( n => n.printCurrentSequence());
    process.exit();
}, SIMULATION_TIMEOUT + 1000);