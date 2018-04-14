/*
consensus helper functions
*/

var ssutil = require("./ssutil");

exports.getRandomInt = function (max) {
    if(!max){
        console.log("getRandomInt with undefined argument. Defaulting to 1000");
        max = 1000;
    }
    var n = Math.floor(Math.random() * max);
    return n;
}


function Pulse(signer, currentPulseNumber, block, newTransactions, vsd, top){
    this.signer         = signer;
    this.currentPulse   = currentPulseNumber;
    this.lset           = newTransactions;  //digest -> transaction
    this.ptBlock        = block;            //array of digests
    this.vsd            = vsd;
    this.top            = top;
}



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


exports.createTransaction = function(currentPulse, swarm){
    return new Transaction(currentPulse, swarm);
}

exports.createPulse = function(signer, currentPulseNumber, block, newTransactions ,vsd, last){
    return new Pulse(signer, currentPulseNumber, block, newTransactions, vsd, last);
}

exports.orderTransactions = function( pset){ //order in place the pset array
    var arr = [];
    if(typeof pset != "array"){

        for(var d in pset){
            arr.push(pset[d]);
        }

    } else {
        arr = pset;
    }

    arr.sort(function(t1, t2){
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
    return arr;
}

function getMajorityFieldInPulses(allPulses, fieldName, extractFieldName, votingBox){
    var counterFields = {};


    var majorityValue;
    var pulse;

    for(var  agent in allPulses){
        pulse = allPulses[agent];
        var v = pulse[fieldName];

        counterFields[v] = votingBox.vote(agent, counterFields[v])

    }


    for(var i in counterFields){
        if(votingBox.isMajoritarian(counterFields[i])){

            majorityValue = i;
            if(fieldName == extractFieldName){
                return majorityValue;
            } else {
                for(var agent in allPulses){
                    pulse = allPulses[agent];
                    if(pulse[fieldName] == majorityValue){
                        return pulse[extractFieldName];
                    }
                }
            }
        }
    }
    return "none"; //there is no majority
}

exports.detectMajoritarianVSD = function (pulse, pulsesHistory, votingBox){
    if(pulse == 0) return "none";
    var pulses = pulsesHistory[pulse];
    return getMajorityFieldInPulses(pulses, "vsd", "vsd", votingBox);
}

/*
    detect a candidate block
 */


exports.detectMajoritarianPTBlock = function(pulse, pulsesHistory, votingBox){
    if(pulse == 0) return "none";
    var pulses = pulsesHistory[pulse];
    var btBlock = getMajorityFieldInPulses(pulses,"blockDigest", "ptBlock", votingBox);
    return btBlock;
}


exports.makeSetFromBlock = function(knownTransactions, block){
    var result = {};
    for(var i = 0 ; i < block.length; i++ ){
        var item = block[i];
        result[item] = knownTransactions[item];
        if(!result.hasOwnProperty(item)){
            throw new Error("Do not give unknown transaction digests to makeSetFromBlock " + item);
        }
    }
    return result;
}




exports.setsConcat = function(target, from){
    for(var d in from){
        target[d] = from[d];
    }
    return target;
}


exports.setsRemoveArray = function(target, arr){
    arr.forEach(i => delete target[i]);
    return target;
}

exports.setsRemovePtBlockAndPastTransactions = function(target, arr, maxPulse){

    var toBeRemoved = [];
    for(var d in target){
            for(var i=0; i<arr.length; i++){
                if(arr[i] == d || target[d].CP <= maxPulse){
                    toBeRemoved.push(d);
                }
            }
    }

    toBeRemoved.forEach(i => delete target[i]);
    return target;
}



exports.createDemocraticVotingBox = function(shareHoldersCounter){

    return  {
        vote:function(agent, previosValue){
            if(!previosValue){
                previosValue = 0;
            }
            return previosValue + 1;
        },
        isMajoritarian:function(value){
            return value >= Math.floor(shareHoldersCounter/2) + 1;
        }
    };

}


