
var cutil   = require("./cutil");
var ssutil  = require("./ssutil");


function Storage(parentStorage, diskPersistence){

    function clone(a) {
        return JSON.parse(JSON.stringify(a));
    }

    var cset            = {};
    var csetVersions    = {};

    var readSetVersions         = {};
    var writeSet        = {};

    var vsd             = undefined;

    var self = this;


    if( parentStorage){
        /* var tmp      = parentStorage.getInternalValues();
        cset         = clone(tmp.cset);
        csetVersions = clone(tmp.csetVersions); */
        //vsd          = parentStorage.getVSD();
    }

    this.readKey = function readKey(name){
        var k = cset [name];
        if(parentStorage){
            if(!k){
                k = parentStorage.readKey(name);
                cset[name] = k;
                readSetVersions[name] = parentStorage.getVersion(name);
            }
        } else {
            if(!k){
                k = cset[name] = 0;
                csetVersions[name] = 0;
            }
        }
        return k;
    }

    this.getVersion = function(name){
        var v = csetVersions[name];
        if(!v){
            cset[name] = 0;
            v = csetVersions[name] = 0;
        }
        return v;
    }

    this.writeKey = function modifyKey(name, value, incVersion){
        var k = this.readKey(name);

        if(!writeSet[name]){
            writeSet[name] = value;
        } else {

        }
        cset [name] = value;
        writeSet[name] = value;

        if(incVersion){
            var v = csetVersions[name];
            if(!v){
                csetVersions[name] = 1;
            } else {
                csetVersions[name] = csetVersions[name] + 1;
            }
        }

        return  readSetVersions[name] + 1;
    }

    this.getInputOutput = function () {
        return {
            input: readSetVersions,
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
            var currentVersion = self.getVersion(k);
            if(transactionVersion != currentVersion){
                //console.log(transactionVersion , currentVersion);
                return false;
            }
        }

        for(var k in t.output){
            self.writeKey(k, t.output[k], true);
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
                //throw new Error("Failed to commit an invalid block. This could be a nasty bug or the stakeholders majority is corrupted! It should never happen!");
                console.log("Failed to commit an invalid block. This could be a nasty bug or the stakeholders majority is corrupted! It should never happen!"); //TODO: replace with better error handling
            }
            i++;
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