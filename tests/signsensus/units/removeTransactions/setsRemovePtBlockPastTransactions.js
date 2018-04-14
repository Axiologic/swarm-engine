const cutil = require("../../../../modules/signsensus/lib/consUtil");
const ssutil = require("../../../../modules/signsensus/lib/ssutil");
var pset = require("../pds/utilityCreateSet").set;

var pdsInM = require("../../../../modules/signsensus/lib/InMemoryPDS");

var pdsAdapter = pdsInM.newPDS();

var pulsesHistory = {

};

var artificialCP = 1;
for( var d in pset){
    pset[d].CP = artificialCP++;
}

//console.log(pset);

var keys = Object.keys(pset);
var blockSet={};
//console.log(keys);
blockSet[keys[0]] = pset[keys[0]];
//console.log(blockSet);

//console.log(blockSet);
var ptBlock = pdsAdapter.computePTBlock(blockSet);
//console.log(ptBlock);

cutil.setsRemovePtBlockAndPastTransactions(pset,ptBlock,2);
console.log("Pset",pset);

