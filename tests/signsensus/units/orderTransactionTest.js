const cutil  = require("../../../modules/signsensus/lib/cutil");
const ssutil = require("../../../modules/signsensus/lib/ssutil");

var pset = require("./pds/utilityCreateSet").set;

var arr = cutil.orderTransactions(pset);


console.log(arr); //check the order, specially regarding the faked transaction that could oscillate to  be first or second