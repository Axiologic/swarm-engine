
var cutil   = require("./consUtil");
var ssutil  = require("./ssutil");


function Storage(parentStorage, diskPersistence){  //TODO: refactoring after unit testing are completed... two classes: one the parent storage and 1 for handlers

    function clone(a) {  //TODO: better implementation
        return JSON.parse(JSON.stringify(a));
    }

    var cset            = {};  // containes all keys in parent storage, contains only keys touched in handlers
    var csetVersions    = {}; //meaningful only in parent storage



    var readSetVersions  = {}; //meaningful only in handlers

    var writeSetVersions = {}; // meaningful only in parent storage. Keep version for uncommitted local transactions...
    var writeSet        = {};   //contains only keys modified in handlers

    var vsd             = undefined; //only for parent storage

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

    this.getVersion = function(name, realVersion){
        if(parentStorage){
            return parentStorage.getVersion(name, realVersion);
        }
        var v ;

        if(realVersion){
            v = csetVersions[name];
        } else {
            v = writeSetVersions[name];
        }
        if(!v){
            var v = csetVersions[name];
            if(!v){
                cset[name] = 0;
                v = csetVersions[name] = 0;
            }
        }
        return v;
    }

    this.incTmpStorage = function(name){
        if(parentStorage){
            parentStorage.incTmpStorage(name);
        }
        var v = writeSetVersions[name];
        if(!v){
            var v = csetVersions[name];
            if(!v){
                cset[name] = 0;
                v = csetVersions[name] = 0;
                writeSetVersions[name] = 1;
            } else {
                writeSetVersions[name]++;
            }
        } else {
            writeSetVersions[name]++;
        }
        return  writeSetVersions[name];
    }

    this.writeKey = function modifyKey(name, value, incVersion){
        var k = this.readKey(name);

        if(!writeSet[name]){
            if(parentStorage){
                parentStorage.incTmpStorage(name);
            }
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

    function applyTransaction(t, checkRealVersion){
        for(var k in t.input){
            var transactionVersion = t.input[k];
            var currentVersion = self.getVersion(k, checkRealVersion);
            if(transactionVersion != currentVersion){
                //console.log(k, transactionVersion , currentVersion);
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
            if(applyTransaction(t, false)){
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
            if(!applyTransaction(t, true)){ //paranoid check,  fail to work if a majority is corrupted
                //pretty bad
                //throw new Error("Failed to commit an invalid block. This could be a nasty bug or the stakeholders majority is corrupted! It should never happen!");
                console.log("Failed to commit an invalid block. This could be a nasty bug or the stakeholders majority is corrupted! It should never happen!"); //TODO: replace with better error handling
            }
            i++;
        }
        this.getVSD(true);
        writeSetVersions = clone(csetVersions);
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