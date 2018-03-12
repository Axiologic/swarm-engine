
var cutil   = require("./cutil");
var ssutil  = require("./ssutil");


function Storage(otherStorage, diskPersistence){

    function clone(a) {
        return JSON.parse(JSON.stringify(a));
    }

    var cset            = {};
    var csetVersions    = {};

    var readSet         = {};
    var writeSet        = {};

    var vsd             = undefined;

    var self = this;


    if( otherStorage){
        var tmp      = otherStorage.getInternalValues();
        cset         = clone(tmp.cset);
        csetVersions = clone(tmp.csetVersions);
        vsd          = tmp.vsd;
    }

    this.readKey = function readKey(name){
        var k = cset [name];
        if(!k){
            k = cset[name] = 0;
            csetVersions[name] = 0;
        }
        if(!readSet[name]){
            readSet[name] = csetVersions[name];
        }
        return k;
    }

    function getVersion(name){
        var k = csetVersions[name];
        if(!k){
            cset[name] = 0;
            k = csetVersions[name] = 0;
        }
        return k;
    }

    this.writeKey = function modifyKey(name, value){
        var k = cset [name];
        if(!k){
            k = cset[name] = value;
            csetVersions[name] = 1;
        } else {
            csetVersions[name]++;
            cset[name] = k;
        }
        if(!readSet[name]){
            readSet[name] = csetVersions[name];
        }
        if(!writeSet[name]){
            writeSet[name] = value;
        }
        return  csetVersions[name];
    }

    this.getInputOutput = function () {
        return {
            input: readSet,
            output: writeSet
        }
    }

    this.getInternalValues = function(){
        return {
            cset:cset,
            csetVersions:csetVersions,
            vsd:vsd
        }
    }

    function applyTransaction(t){
        for(var k in t.input){
            var transactionVersion = t.input[k];
            var currentVersion = getVersion(k);
            if(transactionVersion != currentVersion){
                return false;
            }
        }

        for(var k in t.output){
            self.writeKey(k, t.output[k]);
        }

        return true;
    }

    this.computePTBlock = function(nextBlockSet){   //make a transactions block from nextBlockSet by removing invalid transactions from the key versions point of view
        var validBlock = [];
        var orderedByTime = cutil.orderTransactions(nextBlockSet);
        var i = 0;

        while(i < orderedByTime.length){
            var t = orderedByTime[i];
            if(applyTransaction(t)){
                validBlock.push(t.digest);
            }
            i++;
        }
        return validBlock;
    }

    this.commit = function(blockSet){
        var i = 0;
        var orderedByTime = cutil.orderTransactions(blockSet);
        while(i < orderedByTime.length){
            var t = orderedByTime[i];
            if(!applyTransaction(t)){ //paranoid check,  fail to work if a majority is corrupted
                //pretty bad
                throw new Error("Failed to commit an invalid block. This could be a nasty bug or the stakeholders majority is corrupted! It should never happen!");
            }
        }
        this.getVSD(true);
    }

    this.getVSD = function(forceCalculation){
        if(!vsd || forceCalculation){
            var tmp = this.getInternalValues();
            vsd = ssutil.hashValues(tmp);
        }
        return vsd;
    }
}

function InMemoryPDS(storage, diskPersistence){

    var mainStorage = new Storage(storage);

    this.getHandler = function(){ // a way to work with PDS
        var tempStorage = new Storage(mainStorage);
        return tempStorage;
    }

    this.computeSwarmTransactionDiff = function(swarm, forkedPds){
        var inpOutp     = forkedPds.getInputOutput();
        swarm.input     = inpOutp.input;
        swarm.output    = inpOutp.output;
        return swarm;
    }

    this.computePTBlock = function(nextBlockSet){
        var tempStorage = new Storage(mainStorage);
        return tempStorage.computePTBlock(nextBlockSet);

    }

    this.commit = function(blockSet){
        mainStorage.commit(blockSet);
    }

    this.computeVSD = function (){
        return mainStorage.getVSD(false);
    }
}


exports.newPDS = function(){
    return new InMemoryPDS();
}