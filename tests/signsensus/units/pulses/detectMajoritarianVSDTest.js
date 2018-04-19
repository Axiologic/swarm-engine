const cutil = require("../../../../modules/signsensus/lib/consUtil");
const ssutil = require("../../../../modules/signsensus/lib/ssutil");
var lset = require("../pds/utilityCreateSet").set;

var pdsInM = require("../../../../modules/signsensus/lib/InMemoryPDS");

var pdsAdapter = pdsInM.newPDS(3);

var pulsesHistory = {

};
var currentPulse = 1;
var votingBox = pdsAdapter.getShareHoldersVotingBox();

var majoritarian = cutil.detectMajoritarianVSD(currentPulse, pulsesHistory, votingBox);

var pset = {};
var currentVSD = pdsAdapter.getVSD();
console.log(majoritarian); // should be none

function recordPulse(from, pulse){
    pulse.blockDigest = ssutil.hashValues(pulse.ptBlock);
    if(!pulsesHistory[pulse.currentPulse]){
        pulsesHistory[pulse.currentPulse] = {};
    }
    pulsesHistory[pulse.currentPulse][from] = pulse;

    for(var d in pulse.lset){
        pset[d] = pulse.lset[d];
    }

}

var transactions1  = lset;
var transactions2  = lset;
var transactions3  = lset;

var block1 = block2 = block3 = [];


var p1 = cutil.createPulse("agent1", currentPulse, block1, transactions1, currentVSD);
var p2 = cutil.createPulse("agent2", currentPulse, block2, transactions2, currentVSD);
var p3 = cutil.createPulse("agent3", currentPulse, block3, transactions3, currentVSD);

recordPulse("agent1", p1);
recordPulse("agent2", p2);
recordPulse("agent3", p3);


currentPulse++;


block1 = block2 =  pdsAdapter.computePTBlock(pset);
block3 = [];

p1 = cutil.createPulse("agent1", currentPulse, block1, {}, 100101010);
p2 = cutil.createPulse("agent2", currentPulse, block2, {}, 100101010);
p3 = cutil.createPulse("agent3", currentPulse, block3, {}, 10010101112);

recordPulse("agent1", p1);
recordPulse("agent2", p2);
recordPulse("agent3", p3);


currentPulse++;
var majoritarian = cutil.detectMajoritarianVSD(currentPulse, pulsesHistory, votingBox);

console.log(majoritarian); //