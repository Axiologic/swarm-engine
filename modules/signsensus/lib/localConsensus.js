
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}



var ssutil = require("./ssutil");


function orderTransactions(unorderedTransactions){

    return unorderedTransactions;
}

function Pulse(signer, number, newTransactions, orderedTransactions){
    this.signer                 = signer;
    this.pulseNumber            = number;
    this.newTransactions        = newTransactions;
    this.orderedTransactions    = orderedTransactions;
}


function ConsensusManager(delgatedAgentName, communicationOutlet, pulsePeriodicty, pulsesTimeout, stakeHolders){

    var currentPulse = 0;

    var currentConsent = [];

    var knownTransactions = {};
    var unorderedTransactions = [];



    var self = this;

    this.nodeName = delgatedAgentName;

    function getTransactionInfo(digest, transaction, from){
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

    var notBroadcasted;
    this.newTransaction = function(trans){
        getTransactionInfo(trans.digest, trans, this.nodeName);
        if(!notBroadcasted){
            notBroadcasted = [];
        }
        notBroadcasted.push(trans);
    }

    this.recordTransaction = function(trans, from){
        getTransactionInfo(trans.digest, trans, from);
    }

    var allPulses = {};
    function testOrInit(obj, prop){
        if(!obj[prop]){
            obj[prop] = {};
        }
    }

    this.newPulse = function(pulse, from){
        testOrInit(allPulses,pulse.pulseNumber);
        testOrInit(allPulses[pulse.pulseNumber], from);

        //TODO: validate does not exist
        allPulses[pulse.pulseNumber][from] = pulse;
    }


    function getTransaction (digest){
        var ti = getTransactionInfo(digest);
        return ti.transaction;
    }

    function pulse(){
        currentPulse++;
        if(unorderedTransactions.length){
            var transactionSequence = [];
            var newPulse = new Pulse(this.nodeName, currentPulse, notBroadcasted, transactionSequence );
            communicationOutlet.broadcastPulse(newPulse, self.nodeName);
        }
        setTimeout(pulse, pulsePeriodicty);
    }

    this.printCurrentSequence = function(){
        console.log("Consensus for", currentConsent.length, "transactions in " + delgatedAgentName,":", currentConsent.join(" "));
        console.log("Unordered ", unorderedTransactions.length, "transactions in " + delgatedAgentName,":", unorderedTransactions.join(" "));
    }

    pulse();
}

exports.createConsensusManager = function(delegatedAgent, communicationOutlet, pulse, stakeHolders){
        return new ConsensusManager(delegatedAgent, communicationOutlet, pulse, stakeHolders);
}


