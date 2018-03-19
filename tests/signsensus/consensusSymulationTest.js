const consensus = require("../../modules/signsensus/lib/consensusManager");

var cfg = require("./fakes/simulationConfig").config;
var network = require("./fakes/comunicationFake");

var cutil = require("../../modules/signsensus/lib/consUtil");

network.init();


var numberTransactions = 15;

while(numberTransactions > 0){
    setTimeout(function(){
        network.generateRandomTransaction();
    }, cutil.getRandomInt(cfg.SIMULATION_TIMEOUT));
    numberTransactions--;
}

setTimeout(function(){
    network.dumpVSDs();
    process.exit();
}, cfg.SIMULATION_TIMEOUT + 1000);


/*

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
 */