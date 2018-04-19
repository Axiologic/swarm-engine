



var ssutil = require("./ssutil");
var cutil = require("./consUtil");
var fs = require("fs");
require("../../../engine/core").enableTesting();

var fs = require("fs");

function appendToCSV(filename,arr){
    var str = "";
    for(var i=0; i<arr.length-1; i++){
        str += arr[i] + " , ";
    }
    str += arr[arr.length-1] + "\n";
    fs.appendFileSync(filename, str);
}

function sortedDigests(set){
    var res =[];
    for( var d in set){
        res.push(d);
    }
    return ssutil.hashValues(res.sort());

}

//var detailedDebug = true;
var detailedDebug = false;


$$.flow.describe("pulseSwarm", {
    public:{

    },
    printState:function(){
        console.log(this.nodeName,",",this.currentPulse,",",this.vsd);
    },
    printPset: function(){
        var arr=[this.nodeName, this.currentPulse, this.topPulseConsensus,this.lastPulseAchievedConsensus, sortedDigests(this.pset), sortedDigests(this.dset),sortedDigests(this.lset), this.vsd];
        appendToCSV("data.csv",arr);
        // console.log(this.nodeName,",",this.currentPulse,",",Object.keys(this.pset).length);
    },

    start:function(delegatedAgentName, communicationOutlet, pdsAdapter, pulsePeriodicity){
        this.communicationOutlet= communicationOutlet;
        this.pdsAdapter         = pdsAdapter;
        this.pulsePeriodicity   = pulsePeriodicity;
        this.votingBox          = pdsAdapter.getShareHoldersVotingBox();

        this.currentPulse       = 0;
        this.lastPulseAchievedConsensus  = 0;


        this.lset               = {}; // digest -> transaction - localy generated set of transactions

        this.dset               = {}; // digest -> transaction - remotely delivered set of transactions that will be  next participate in consensus

        this.pset               = {}; // digest -> transaction  - consensus pending set

        this.topPulseConsensus = 0;

        this.pulsesHistory = {};
        this.extremesPset = {
            min:0,
            max:0
        };
        this.nodeName = delegatedAgentName;
        this.vsd = this.pdsAdapter.getVSD();

        this.level = 0;
        this.commitCounter = 0;

        this.beat();
    },
    beat:function(){
        var ptBlock             = null;
        var nextConsensusPulse  = this.topPulseConsensus + 1;
        var majoritarianVSD = "none";

        while(nextConsensusPulse <= this.currentPulse) {
            ptBlock = cutil.detectMajoritarianPTBlock(nextConsensusPulse, this.pulsesHistory, this.votingBox);
            majoritarianVSD = cutil.detectMajoritarianVSD(nextConsensusPulse, this.pulsesHistory, this.votingBox);


            if (ptBlock != "none" && this.vsd == majoritarianVSD) {
                //console.log(this.nodeName, ptBlock.length,this.vsd, majoritarianVSD, nextConsensusPulse);
                if (ptBlock.length /*&& this.hasAllTransactions(ptBlock)*/) {
                    this.pset = cutil.setsConcat(this.pset, this.dset);
                    this.dset = {};
                    var resultSet = cutil.makeSetFromBlock(this.pset, ptBlock)

                    this.commitCounter+= ptBlock.length;

                    this.pdsAdapter.commit(resultSet);
                    this.level++;
                    //fs.writeFileSync(this.level+"-"+this.vsd+"-"+this.nodeName, JSON.stringify(resultSet));
                    var topDigest = ptBlock[ptBlock.length - 1];
                    this.topPulseConsensus = this.pset[topDigest].CP;
                    cutil.setsRemovePtBlockAndPastTransactions(this.pset, ptBlock, this.topPulseConsensus); //cleanings
                    var oldVsd = this.vsd;
                    this.vsd = this.pdsAdapter.getVSD();

                    this.lastPulseAchievedConsensus = this.currentPulse;
                    //this.topPulseConsensus = nextConsensusPulse;

                    //this.print("\t\tBlock [" + this.dumpPtBlock(ptBlock) + "] at pulse " + nextConsensusPulse + " and VSD " + oldVsd.slice(0,8));
                    break;
                } else {
                    this.pset = cutil.setsConcat(this.pset, this.dset);
                    this.dset = {};
                    this.lastPulseAchievedConsensus = this.currentPulse;
                    this.topPulseConsensus = nextConsensusPulse;
                    //this.print("\t\tEmpty " + " at: " + nextConsensusPulse );
                    //console.log("\t\tmajoritarian ", majoritarianVSD.slice(0,8) , nextConsensusPulse);
                    break;
                }
            }
            nextConsensusPulse++;
        }
        //daca nu a reusit,ar trebui sa vada daca nu exista un alt last majoritar

        ptBlock             = this.pdsAdapter.computePTBlock(this.pset);
        var newPulse        = cutil.createPulse(this.nodeName, this.currentPulse, ptBlock, this.lset, this.vsd, this.topPulseConsensus, this.lastPulseAchievedConsensus);
        //console.log("\t\tPulse", this.nodeName, this.vsd.slice(0,8) );
        //this.print("Pulse" );
        this.recordPulse(this.nodeName, newPulse);
        var self = this;
        self.communicationOutlet.broadcastPulse(self.nodeName, newPulse);
        this.lset          = {};
        this.currentPulse++;
        setTimeout(this.beat, this.pulsePeriodicity);
    },
    dumpPtBlock: function (ptBlock) {
        return ptBlock.map(function (item){
            return item.slice(0,8);
        }).join(" ");
    },
    hasAllTransactions: function(ptBlock){
        for(var i = 0; i < ptBlock.length; i++){
            var item =  ptBlock[i];
            if(!this.pset.hasOwnProperty(item)){
                return false;
            }
        }
        return true;
    },
    dump : function(){
        this.print("Final");
    },
    print: function(str){
        if(!str){
            str = "State "
        }
        if(!detailedDebug){
            if(str == "Pulse") return;
        }

        function countSet(set){
            var l = 0;
            for(var v in set) l++;
            return l;
        }

        console.log( this.nodeName, " | ", str, " | ",
            "currentPulse:",this.currentPulse,"top:",this.topPulseConsensus,"LPAC:",this.lastPulseAchievedConsensus, "VSD:", this.vsd.slice(0,8),
            " | ", countSet(this.pset), countSet(this.dset), countSet(this.lset),
            " | ", this.commitCounter, toalGeneratedCounter,
            " | ", this.commitCounter / GLOBAL_MAX_TRANSACTION_TIME, " tranzactii pe secunda");

    },
    createTransactionFromSwarm : function(swarm){
        var t = cutil.createTransaction(this.currentPulse, swarm);
        this.lset[t.digest] = t;
        return t;
    },

    recordPulse : function(from, pulse){
        if( !pulse.ptBlock){
            pulse.ptBlock = [];
        }
        pulse.blockDigest = ssutil.hashValues(pulse.ptBlock);

        if(!this.pulsesHistory[pulse.currentPulse]){
            this.pulsesHistory[pulse.currentPulse] = {};
        }
        this.pulsesHistory[pulse.currentPulse][from] = pulse;

        //console.log(pulse.top, from);
        /*var h =  this.pulsesHistory[pulse.top];
         if(h){
         var p = [from];
         if(p){
         p.vsd = pulse.vsd;
         } else {
         console.log("-----------------------",pulse.top, from);
         this.pulsesHistory[pulse.top][from] = pulse;
         }
         } */

        if(pulse.currentPulse >= this.topPulseConsensus) {
            if (pulse.currentPulse <= this.lastPulseAchievedConsensus ) {
                for (var d in pulse.lset) {
                    this.pset[d] = pulse.lset[d];// could still be important for consensus
                }
            } else {
                for (var d in pulse.lset) {
                    this.dset[d] = pulse.lset[d];
                }
            }
        }
        //TODO: ask for pulses that others received but we failed to receive
    }
});



exports.createConsensusManager = function(delegatedAgent, communicationOutlet, pdsAdapter, pulsePeriodicity){
    var swarm = $$.flow.start("pulseSwarm");
    swarm.start(delegatedAgent, communicationOutlet, pdsAdapter, pulsePeriodicity);
    return swarm;
}