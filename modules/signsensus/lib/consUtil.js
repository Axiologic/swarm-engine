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
    return 1;
}


function Pulse(signer, currentPulseNumber, block, newTransactions, vsd){
    this.signer     = signer;
    this.cp         = currentPulseNumber;
    this.lset       = newTransactions;  //digest -> transaction
    this.ptBlock    = block;            //array of digests
    this.vsd        = vsd;
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

exports.createPulse = function(signer, currentPulseNumber, block, newTransactions, vsd){
    return new Pulse(signer, currentPulseNumber, block, newTransactions, vsd);
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

function getMajorityFieldInPulses(allPulses, fieldName, extractFieldName, stakeHoldersVotingBox){
    var counterFields = {};


    var majorityValue;
    var pulse;

    for(var  agent in allPulses){
        pulse = allPulses[agent];
        var v = pulse[fieldName];

        counterFields[v] = stakeHoldersVotingBox.vote(agent, counterFields[v])

    }


    for(var i in counterFields){
        if(stakeHoldersVotingBox.isMajoritarian(counterFields[i])){

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

exports.detectMajoritarianVSD = function (currentPulse, pulsesHistory, stakeHoldersVotingBox){
    var pulsesCPMinus1 = pulsesHistory[currentPulse - 1];
    if(!pulsesCPMinus1){
        return "none"; //for booting empty spaces
    }

    return getMajorityFieldInPulses(pulsesCPMinus1, "vsd", "vsd", stakeHoldersVotingBox);
}

/*
    detect a candidate block

 */


exports.detectMajoritarianPTBlock = function(currentPulse, pulsesHistory, stakeHoldersVotingBox){
    var pulsesCPMinus1 = pulsesHistory[currentPulse - 1];

    if(!pulsesCPMinus1){
        return []; //there is none...
    }
    var btBlock = getMajorityFieldInPulses(pulsesCPMinus1,"blockDigest", "ptBlock", stakeHoldersVotingBox);
    if(btBlock != "none"){
        return btBlock;
    }
    return [];
}


exports.makeSetFromBlock = function(knownTransactions, block){
    var result = {};
    block.forEach(function(item){
        result[item] = knownTransactions[item];
        if(!result[item]){
            throw new Error("Do not give unknown transaction digests to makeSetFromBlock");
        }
    });
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


exports.createDemocraticStakeholdersVotingBox = function(shareHoldersCounter){

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




/*
unnecessary?, probably will be removed!!!
*/

exports.detectNextBlockSet = function(currentPulse, pulsesHistory, stakeHolders, pset){
    var pulsesCPMinus1 = pulsesHistory[currentPulse - 1];
    if(!pulsesCPMinus1){
        return {}; //for booting empty spaces
    }
    //

    var nextBlock = [];

    var tempPulses = {};
    for(var v in pulsesCPMinus1){
        tempPulses[v] = pulsesCPMinus1;
    }

    function majoritarianAtLevel(level){
        var counting = {};
        for(var a in tempPulses){
            var pulse = tempPulses[a];
            //console.log(pulse);
            if(pulse.ptBlock.length < level){
                var digest = pulse.ptBlock[level];
                if(counting[digest]){
                    counting[digest]++
                }    else {
                    counting[digest] = 1;
                }
            }
        }

        for(var d in counting){
            if(counting[d] >= math.floor(stakeHolders/2) + 1){
                return d;
            }
        }

        return "none";
    }

    var foundMajoritarian;
    var level = 0;
    do {
        foundMajoritarian = majoritarianAtLevel(level);
        nextBlock.push(foundMajoritarian);
        level++;
    } while(foundMajoritarian != "none");

    return exports.makeSetFromBlock(pset, nextBlock);
}
