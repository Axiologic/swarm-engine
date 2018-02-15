const consensus = require("../../modules/signsensus/lib/localConsensus");

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


var MAX_NODES = 5;
var SIMULATION_TIMEOUT = 1000;

var nodes = [];

var com = {
    broadcastTransaction: function(t){
        nodes.forEach( function(n){
            setTimeout(function(){
                n.newTransaction(t, n.nodeName);
            }, getRandomInt(SIMULATION_TIMEOUT))
        });
    },
    broadcastSequence: function(seq){
        nodes.forEach( function(n){
            setTimeout(function(){
                n.receiveSequence(seq, n.nodeName);
            }, getRandomInt(SIMULATION_TIMEOUT))
        });
    },
    requestTransaction: function(digest){

    }
}

for(var i = 0; i< MAX_NODES; i++){
    nodes.push(consensus.createConsensusManager("Node"+i, com, 100, MAX_NODES));
}



var numberTransactions = 10;
var counter = 0;


while(numberTransactions>0){
    setTimeout(function(){
        var i = getRandomInt(MAX_NODES);
        var n = nodes[i];
        console.log(i);
        n.newTransaction(consensus.createTransaction( "Transaction" + counter), n.nodeName);
        counter++;
    }, getRandomInt(SIMULATION_TIMEOUT));
    numberTransactions--;
}

setTimeout(function(){
    nodes.forEach( n => n.printCurrentSequence());
    process.exit();
}, SIMULATION_TIMEOUT + 1000);