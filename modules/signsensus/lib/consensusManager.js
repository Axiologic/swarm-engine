
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}



var ssutil = require("./ssutil");
var cutil = require("./cutil");


function orderTransactions(unorderedTransactions){

    return unorderedTransactions;
}

function Pulse(signer, currentPulseNumber, block, newTransactions, vsd){
    this.signer = signer;
    this.cp     = currentPulseNumber;
    this.lset   = newTransactions;
    this.ptBlock  = block;
    this.vsd    = vsd;
}


function ConsensusManager(delgatedAgentName, communicationOutlet, pdsAdapter, pulsePeriodicity, pulsesTimeout, stakeHolders){

    var currentPulse = 0;

    var knownTransactions = {};
    var lset = [];
    var pset = [];

    var ptBlock = [];

    var consensuses = [];
    var self = this;

    var pulsesHistory = {};

    this.nodeName = delgatedAgentName;


    function detectMajoritarianPtBlock(){
        var pulsesCPMinus1 = pulsesHistory[currentPulse-1];
        if(!pulsesCPMinus1){
            return false;
        }

        var allVSDs = {};
        for(var pulse in pulsesCPMinus1){
            var v = pulse.vsd;
            if(allVSDs[v] ){
                allVSDs[v]++;
            } else {
                allVSDs[v] = 1;
            }
        }

        for(var i in allVSDs){
            if(allVSDs[i] >= math.floor(stakeHolders/2) + 1){
                var vsd = allVSDs[i];
                for(var p in pulsesCPMinus1){
                    if(p.vsd == vsd){
                        ptBlock = p.ptBlock;
                        return true;
                    }
                }
            }
        }
        return false; //there is no majority
    }

    function detectNextBlockSet(){
        //ptBlock
    }

    function pulse(){
        var majoritatianVSD = detectMajoritarianPtBlock();// will also replace ptBlock
        var  vsd = pdsAdapter.computeVSD(ptBlock);
        if(vsd == majoritatianVSD){
            pdsAdapter.commit(ptBlock);                                 //step 1
        } else {
            // the node is badly out-of-sync
            //TODO: resync with the majoritarian nodes
            throw new Error("Sync not implemented yet");
        }

        var nextBlockSet = detectNextBlockSet();                        //step 2
        ptBlock     = pdsAdapter.makeBlock(nextBlockSet);               //step 3
        vsd     = pdsAdapter.computeVSD(ptBlock);                       //step 4

        var newPulse = new Pulse(this.nodeName, currentPulse, ptBlock, lset, vsd);

        communicationOutlet.broadcastPulse(self.nodeName, newPulse);    //step 5

        pset = pset.concat(lset);                                       //step 6
        lset = [];                                                      //step 7
        currentPulse++;                                                 //step 8
        setTimeout(pulse, pulsePeriodicity);                            //step 9
    }

    pulse();


    this.dump = function(){
        console.log("Node:", delgatedAgentName, "Consensus history:", consensuses.join(" "));
    }

    this.createTransactionFromSwarm = function(swarm){
        var t = cutil.createTransaction(currentPulse, swarm);
        lset.push(t);
        return t;
    }

    this.recordPulse = function(from, pulse){
        if(!pulsesHistory[pulse.cp]){
            pulsesHistory[pulse.cp] = {};
        }
        pulsesHistory[pulse.cp][from] = pulse;
    }
}

exports.createConsensusManager = function(delegatedAgent, communicationOutlet, pulse, stakeHolders){
        return new ConsensusManager(delegatedAgent, communicationOutlet, pulse, stakeHolders);
}


