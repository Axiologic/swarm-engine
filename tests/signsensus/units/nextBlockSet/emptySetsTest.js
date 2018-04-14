const cutil = require("../../../../modules/signsensus/lib/consUtil");
const ssutil = require("../../../../modules/signsensus/lib/ssutil");



var pulsesHistory = {};

var currentPulse = 1;

var votingBox = cutil.createDemocraticVotingBox(3);

var pset = {};

var res = cutil.detectNextBlockSet(currentPulse,pulsesHistory,votingBox,pset);
console.log(res);