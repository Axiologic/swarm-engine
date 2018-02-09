
const crypto = require('crypto');
const dumper = require("./dumper");



function generatePosHashXTimes(buffer, pos, count){ //generate positional hash
    var result  = buffer.toString("hex");
    if(pos != -1 )
        result[pos] = 0;

    for(var i=0; i < count; i++){
        var hash = crypto.createHash('sha256');
        hash.update(result);
        result = hash.digest('hex');
    }
    return result;
}

function hashStringArray(arr){
    const hash = crypto.createHash('sha256');
    var result = "";
    arr.forEach(item => {
        result += item;
    });

    hash.update(result);
    return hash.digest('hex');
}

function generatePublicAndPrivateKeys(result){
    result.private = {
        pub1:null,
        pub2:null
    }

    result.private.p1 = Buffer.alloc(32);
    result.private.p2 = Buffer.alloc(32);
    crypto.randomFillSync(result.private.p1);
    crypto.randomFillSync(result.private.p2);

    var temp = [];

    for(var i = 0 ; i < 32; i++){
        temp.push(generatePosHashXTimes(result.private.p1, i, 256));
        temp.push(generatePosHashXTimes(result.private.p2, i, 256));
    }


    result.public = hashStringArray(temp);
}


function SignsensusSignatureChain(previousSignsensusSignature){

    var __next = null;
    var __internal = {};


    var __privateKey;


    if(!previousSignsensusSignature){
        this.counter = 0;
    } else {
        this.counter = previousSignsensusSignature.counter++;
    }


    generatePublicAndPrivateKeys(__internal);
    __privateKey        = __internal.private;
    this.publicKey      = __internal.public;




    this.proof = null;



    this.sign = function(digest) {

        if (this.proof) {
            console.log("Do not sign two times with a single public key. Ignoring this request! ...");
            return null;
        }


        __next = new SignsensusSignatureChain(this);


        this.proof = [];

        var digestForSigning = [digest,  __next.publicKey];

        var digest = hashStringArray(digestForSigning);
        const bufDigest = Buffer.from(digest, 'hex');

        for(var i=0; i < 32; i++){
            var counter = bufDigest[i];
            this.proof.push(generatePosHashXTimes(__privateKey.p1, i , counter + 1));
            this.proof.push(generatePosHashXTimes(__privateKey.p2, i , 256 - counter -1));
        }
        this.proof.push(__next.publicKey);

        return this;
    }


    this.verify = function(digest){
        var digestForSigning = [digest, __next.publicKey];

        var digest = hashStringArray(digestForSigning);
        const bufDigest = Buffer.from(digest, 'hex');

        var arr = [];
        for(var i=0; i < 32; i++){
            var counter = bufDigest[i];
            arr.push(generatePosHashXTimes(__privateKey.p1, i , 256 - counter -1));
            arr.push(generatePosHashXTimes(__privateKey.p2, i , counter + 1));
        }

        var publicFromDigest = hashStringArray(arr);

        console.log(publicFromDigest, this.publicKey);
        if(publicFromDigest == this.publicKey){
            return true;
        } else {
            return false;
        }
    }


    this.getTopOFChain = function(){
        if(__next) return __next.getCurrentSignature();
        else {
            return this;
        }
    }

    this.setProof = function(previousDigest, proofAsString){
        //TODO: will be used on consensus observers
    }

    this.getProof = function(proofAsString){
        //TODO: will be used on consensus observers
    }
}


function AgentSafeBox(agentName){


    var __public = "";
    var rootSignature = new SignsensusSignatureChain();


    this.digest  = function(obj){
        var result = dumper.dumpObjectForDigest(obj);
        var hash = crypto.createHash('sha256');
        hash.update(result);
        return hash.digest('hex');
    }

    this.sign  = function(digest, calback){
        var top = rootSignature.getTopOFChain();
        top.sign(digest);
        calback(null,top);
    }

    this.verify  = function(digest, signature, callback){
        callback(null, signature.verify(digest));
    }

    this.getCurrentPublicKey = function(){
        return  __public;
    }






}


exports.getAgentSafeBox = function(agent){
    var sb = new AgentSafeBox(agent);

    return sb;

}