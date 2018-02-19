const consensus = require("../../modules/signsensus/lib/localConsensus");

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


var MAX_NODES = 5;
var SIMULATION_TIMEOUT = 1000;
var PULSE_TIMEOUT       = 300;
var MAX_KEY             = 10;

var nodes = [];



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
        }

        var howMany = getRandomInt(MAX_KEY/4) + 1;
        for(var i = 0; i< howMany; i++ ){
            var keyName = "key" + getRandomInt(MAX_KEY);

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

        var howMany = getRandomInt(MAX_KEY/8) + 1 ;
        for(var i = 0; i< howMany; i++ ){
            var keyName = "key" + getRandomInt(MAX_KEY);

            var key = {};
            key.name    = keyName;
            key.version = modifyKey(keyName);
            result.output[keyName] = key;
        }

        return result;
    }

}


var com = {
    broadcastTransaction: function(t, from){
        nodes.forEach( function(n){
            setTimeout(function(){
                if(n.nodeName != from) {
                    n.newTransaction(t, from);
                }
            }, getRandomInt(SIMULATION_TIMEOUT * 2))
        });
    },
    broadcastSequence: function(seq){
        nodes.forEach( function(n){
            setTimeout(function(){
                n.receiveSequence(seq, n.nodeName);
            }, getRandomInt(SIMULATION_TIMEOUT * 2))
        });
    },
    requestTransaction: function(digest, byWho, fromOther){
        setTimeout(function(){
            var t = nodes[fromOther].getTransaction(digest);
            if(t){
                nodes[byWho].newTransaction(t, fromOther);
            }
        }, getRandomInt(SIMULATION_TIMEOUT))
    }
}

for(var i = 0; i< MAX_NODES; i++){
    nodes.push(consensus.createConsensusManager("Node"+i, com, PULSE_TIMEOUT, MAX_NODES));
}



var numberTransactions = 15;
var counter = 0;


var fakePDS = new fakePDSVerificationSpace();

while(numberTransactions > 0){
    setTimeout(function(){
        var i = getRandomInt(MAX_NODES);
        var n = nodes[i];
        var inpOut = fakePDS.generateInputOut();
        n.newTransaction(consensus.createTransaction( "Transaction" + counter, inpOut.input, inpOut.output ), n.nodeName);
        counter++;
    }, getRandomInt(SIMULATION_TIMEOUT *2));
    numberTransactions--;
}

setTimeout(function(){
    nodes.forEach( n => n.printCurrentSequence());
    process.exit();
}, SIMULATION_TIMEOUT + 1000);