
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



function Sequence(unorderedTransactions){
    this.orderedTransactions = [];
}


function ConsensusManager(delgatedAgentName, communicationOutlet, pulseTime, stakeHolders){

    var currentOrder = [];


    var currentPulse = 0;

    var currentSeq = [];

    var knownTransactions = {};
    var unorderedTransactions = [];

    var self = this;

    this.nodeName = delgatedAgentName;

    function getTransactionInfo(digest, transaction, from){

        if(transaction){
            unorderedTransactions.push([transaction.digest, currentPulse]);
        }

        var ti = knownTransactions[digest];
        if(!ti ){
             ti = {
                transaction:transaction,
                counter: 0,
                votedBy: {},
                originator: from
            };

             ti.vote = function(from, how){
                 ti.votedBy[from] = how;
             }

             ti.vote(self.nodeName, true);
            knownTransactions[digest] = ti;
        }
        return ti;
    }

    this.newTransaction = function(trans, from){
        getTransactionInfo(trans.digest, trans, from)
        if(from == this.nodeName){
            communicationOutlet.broadcastTransaction(trans);
        }
    }

    this.receiveSequence = function(seq, from){
        seq.orderedTransactions.forEach(function(transactionDigest){
            var ti = getTransactionInfo(transactionDigest, from);
        })
    }



    function pulse(){

        if(unorderedTransactions.length){
            currentSeq =  new Sequence(unorderedTransactions);
            communicationOutlet.broadcastSequence(currentSeq, self.nodeName);
        }
        setTimeout(pulse, pulseTime);
    }

    this.printCurrentSequence = function(){
        console.log("Consensus for", currentOrder.length, "transactions in " + delgatedAgentName,":", currentOrder.join(" "));
        console.log("Unordered ", unorderedTransactions.length, "transactions in " + delgatedAgentName,":", unorderedTransactions.join(" "));
    }

    pulse();
}

exports.createConsensusManager = function(delegatedAgent, communicationOutlet, pulse, stakeHolders){
        return new ConsensusManager(delegatedAgent, communicationOutlet, pulse, stakeHolders);
}


exports.createTransaction = function(swarm){
    return new Transaction(swarm);
}

