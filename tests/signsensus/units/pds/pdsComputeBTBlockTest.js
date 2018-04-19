var pdsFake = require("../../../../modules/signsensus/lib/InMemoryPDS");

var i = 100;
while(i>0){
    setTimeout(function(){
        var pds = pdsFake.newPDS("Node1", 5);

//var pset = require("../pds/utilityCreateSet").set;
        var pset = require("./TestTransaction.json");

        var block = pds.computePTBlock(pset);
        pds.commit(block);
        console.log(pds.getVSD());
    }, i);
    i--;
}
