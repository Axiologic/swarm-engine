
function fakePDSVerificationSpace(){

    function clone(a) {
        return JSON.parse(JSON.stringify(a));
    }

    var cset = {};
    var csetVersions = {};

    var pset = {};
    var psetVersions = {};

    this.readKey = function readKey(name){
        var k = cset [name];
        if(!k){
            k = cset[name] = 0;
            csetVersions[name] = 0;
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

    this.modifyKey = function modifyKey(name, value){
        var k = cset [name];
        if(!k){
            k = cset[name] = value;
            csetVersions[name] = 1;
        } else {
            csetVersions[name]++;
            cset[name] = k;
        }
        return  csetVersions[name];
    }

    function p_readKey(name){
        var k = pset [name];
        if(!k){
            k = pset[name] = 0;
            psetVersions[name] = 0;
        }
        return k;
    }

    function p_modifyKey(name, value){
        var k = pset[name];
        if(!k){
            k = pset[name] = value;
            psetVersions[name] = 1;
        } else {
            psetVersions[name]++;
            pset[name] = k;
        }
        return  psetVersions[name];
    }

    function p_getVersion(name){
        var k = psetVersions[name];
        if(!k){
            pset[name] = 0;
            k = psetVersions[name] = 0;
        }
        return k;
    }

    this.makeBlock = function(seqArray){
        var block =[];  //make a transactions block from seqArray by removing invalid transactions from the versions point of view
        pset = clone(cset);
        psetVersions = clone(csetVersions);

        return block;
    }

    function computeVSD(){

    }
}


exports.newPDS = function(){
    return fakePDSVerificationSpace();
}