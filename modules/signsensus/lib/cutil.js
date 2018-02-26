/*
consensus helper functions
*/

var ssutil = require("./ssutil");


function Transaction(currentPulse, swarm){
    this.input      = swarm.input;
    this.output     = swarm.output;
    this.swarm      = swarm;
    var arr         = process.hrtime();
    this.second     = arr[0];
    this.nanosecod  = arr[1];
    this.CP         = currentPulse;
    this.digest     = ssutil.hashValues(this);
}


exports.createTransaction = function(currentPulse, swarm, input, output){
    return new Transaction(currentPulse, swarm, input, output);
}

exports.orderTransactions = function( pset){ //order in place the pset array
    pset.sort(function(t1, t2){
        if(t1.CP < t2.CP ) return -1;
        if(t1.CP > t2.CP ) return 1;
        if(t1.second < t2.second ) return -1;
        if(t1.second > t2.second ) return 1;
        if(t1.nanosecod < t2.nanosecod) return -1;
        if(t1.nanosecod > t2.nanosecod ) return 1;
        if(t1.digest < t2.digest ) return -1;
        if(t1.digest > t2.digest ) return 1;
        return 0; //only for identical transactions...
    })
    return pset;
}