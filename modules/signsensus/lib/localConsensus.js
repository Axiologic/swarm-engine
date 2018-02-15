
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function TransactionInput(){
    this.value = getRandomInt(100);
    this.compare = function(t){
        return this.value - t.value;
    }
}

function TransactionOutput(){
    this.value = getRandomInt(100);
    this.compare = function(t){
        return this.value - t.value;
    }
}

var ssutil = require("./ssutil");

var counter = 0;
function Transaction(swarm, input, output){
    if(!input){
        input = new TransactionInput();
    }
    if(!output){
        output = new TransactionInput();
    }

    this.input  = input;
    this.output = output;
    this.swarm  = swarm;
    var arr     = process.hrtime();
    this.second     = arr[0];

    var breakNanosecond = getRandomInt(3); //TODO: just for initial testing! remove this ;)

    if(!breakNanosecond){
        this.nanosecod  = arr[1];
    } else {
        this.nanosecod  = 0;
    }

    //this.digest = ssutil.hashValues(this);
    this.digest = "T"+ counter; //TODO:  this is for debug and tests only.. use the proper hashValues
    counter++;
}



function Sequence(owner){

}


function ConsensusManager(delgatedAgentName, communicationOutlet, pulseTime, stakeHolders){

    var currentOrder = [];


    var currentPulse = 0;

    var currentSeq = [];

    var knownTransactions = {};

    this.nodeName = delgatedAgentName;

    this.newTransaction = function(trans, from){
        if(!knownTransactions[trans.digest] ){
            knownTransactions[trans.digest] = trans;
            if(from == this.nodeName){
                communicationOutlet.broadcastTransaction(trans);
            }
            currentOrder.push([trans.digest, currentPulse]);
        }
    }

    this.receiveSequence = function(seq, from){

    }

    this.printCurrentSequence = function(){
        console.log("Consensus for", currentOrder.length, "transactions in " + delgatedAgentName, currentOrder.join(" "));
    }
}

exports.createConsensusManager = function(delegatedAgent, communicationOutlet, pulse, stakeHolders){
        return new ConsensusManager(delegatedAgent, communicationOutlet, pulse, stakeHolders);
}


exports.createTransaction = function(swarm){
    return new Transaction(swarm);
}

