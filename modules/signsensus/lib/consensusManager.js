



var ssutil = require("./ssutil");
var cutil = require("./consUtil");

var core = require("../../../engine/core");

$$.swarms.describe("pulseSwarm", {
    public:{

    },
    start:function(delgatedAgentName, communicationOutlet, pdsAdapter, pulsePeriodicity){
        this.delgatedAgentName  = delgatedAgentName;
        this.communicationOutlet= communicationOutlet;
        this.pdsAdapter         = pdsAdapter;
        this.pulsePeriodicity   = pulsePeriodicity;
        this.votingBox          = pdsAdapter.getShareHoldersVotingBox();

        this.currentPulse       = 0;
        this.lastPulseAchievedConsensus  = 0;


        this.lset               = {}; // digest -> transaction - localy generated set of transactions

        this.dset               = {}; // digest -> transaction - remotely delivered set of transactions that will be  next participate in consensus

        this.pset               = {}; // digest -> transaction  - consensus pending set


        this.pulsesHistory = {};

        this.nodeName = delgatedAgentName;
        this.vsd = this.pdsAdapter.computeVSD();

        this.beat();

    },
    beat:function(){

        var ptBlock             = null;
        var nextConsensusPulse  = this.lastPulseAchievedConsensus + 1;

        var majoritatianVSD = cutil.detectMajoritarianVSD(nextConsensusPulse,  this.pulsesHistory, this.votingBox);
        if(majoritatianVSD == "none"){
            majoritatianVSD = vsd; // we are alone or the network is down ;)
        }

        if(vsd == majoritatianVSD){
            ptBlock         = cutil.detectMajoritarianPTBlock(this.currentPulse, this.pulsesHistory, this.votingBox);

            if(ptBlock.length !=0){
                pdsAdapter.commit(cutil.makeSetFromBlock(this.pset, ptBlock));

                cutil.setsRemovePtBlockAndPastTransactions(this.pset, ptBlock, this.lastPulseAchievedConsensus); //cleanings
                this.vsd   = pdsAdapter.computeVSD();
                this.lastPulseAchievedConsensus = this.currentPulse;
                this.pset
            }//else: try again with the same lastPulseAchievedConsensus, the same pset, etc

        } else {
            // the node is badly out-of-sync
            //TODO: resync with the majoritarian nodes
            throw new Error("Sync not implemented yet");
        }


        var nextBlockSet    = cutil.detectNextBlockSet(this.currentPulse, this.pulsesHistory, this.votingBox, this.pset);
        ptBlock             = pdsAdapter.computePTBlock(nextBlockSet);
        var newPulse        = new Pulse(this.nodeName, this.currentPulse, ptBlock, this.lset, this.vsd);

        this.communicationOutlet.broadcastPulse(this.nodeName, newPulse);
        this.recordPulse(this.nodeName, newPulse);
        this.dset          = cutil.setsConcat(this.dset, this.lset);
        this.lset          = [];

        this.restartBeat();
    },

    restartBeat:function(){
        this.currentPulse++;
        setTimeout(this.beat, this.pulsePeriodicity);
    },

    dump : function(){
        console.log("Node:", this.delgatedAgentName, "Current VSD:", this.vsd);
    },

    createTransactionFromSwarm : function(swarm){
        var t = cutil.createTransaction(this.currentPulse, swarm);
        lset.push(t);
        return t;
    },

    recordPulse : function(from, pulse){
        pulse.blockDigest = ssutil.hashValues(pulse.ptBlock);

        if(!this.pulsesHistory[pulse.currentPulse]){
            this.pulsesHistory[pulse.currentPulse] = {};
        }
        this.pulsesHistory[pulse.currentPulse][from] = pulse;


        if(this.lastPulseAchievedConsensus >= pulse.currentPulse){
            if(this.lastPulseAchievedConsensus + 1 <= pulse.currentPulse ){
                for(var d in pulse.lset){
                    this.pset[d] = pulse.lset[d];// could still be important for consensus
                }
            } else {
                for(var d in pulse.lset){
                    this.dset[d] = pulse.lset[d];
                }
            }


        }//else ignore late pulses that could not contribute to consensus

        //TODO: ask for pulses that others received but we failed to receive
    }
});



exports.createConsensusManager = function(delegatedAgent, communicationOutlet, pulse, stakeHolders){
        var swarm = $$.swarms.start("pulseSwarm");
        swarm.start(delgatedAgentName, communicationOutlet, pdsAdapter, pulsePeriodicity,  stakeHolders);
    return swarm;
}


