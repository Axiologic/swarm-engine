const cutil  = require("../../../modules/signsensus/lib/consUtil");
const ssutil = require("../../../modules/signsensus/lib/ssutil");

var pset = require("./pds/utilityCreateSet").set;

var arr = cutil.orderTransactions(pset);


console.log(arr); //check the order, specially regarding the faked  T3 transaction that could oscillate to  be first or second: T1,3|T2|T4