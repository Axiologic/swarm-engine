
const crypto = require('crypto');
const hash = crypto.createHash('sha256');


function generatePosHashXTimes(buffer, pos, count){ //generate positional hash
    var result  = buffer.toString("hex");
    result[pos] = 0;


    for(var i=0; i< count; i++){
        var hash = crypto.createHash('sha256');
        hash.update(result);
        result = hash.digest('hex');
    }
    return result;
}

function hashStringArray(arr){
    const hash = crypto.createHash('sha256');
    arr.forEach(item => hash.update(item));
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


function SignsensusSignature(previousSignsensusSignature){

    var next = {};
    generatePublicAndPrivateKeys(next);

    var __privateKey;

    var privateKey;
    if(!previousSignsensusSignature){
        this.counter = 0;
        __privateKey = next.private;
        generatePublicAndPrivateKeys(next);
    } else {
        this.counter = previousSignsensusSignature.counter++;
    }

    this.proof = null;

    this.nextPublicKey = next.public;

    this.sign = function(digest) {
        if (this.proof) {
            console.log("Do not sign two times with a single public key");
            return null;
        }

        this.proof = [];

        var digestForSigning = [digest, this.nextPublicKey];

        var digest = hashStringArray(digestForSigning);
        const bufDigest = Buffer.from(digest, 'hex');

        for(var i=0; i < 32; i++){
            var counter = bufDigest[i];
            this.proof.push(generatePosHashXTimes(__privateKey.p1, i , counter));
            this.proof.push(generatePosHashXTimes(__privateKey.p2, i , 256 - counter));
        }
        this.proof.push(this.nextPublicKey);

        return this.proof;
        //..

    }


    this.verify = function(digest){

    }

    this.getNextPrivateKey(){
        return next.private;
    }
}


function AgentSafeBox(agentName){


    var __public = "";





    this.digest  = function(object){
    return "nimic";
    }

    this.sign  = function(digest, calback){

    }

    this.verify  = function(digest, signature, calback){
        callback(null, signature.verify(digest));
    }

    this.getCurrentPublicKey = function(){
        return  __public;
    }


    var certificate = {}

    generatePublicAndPrivateKeys(certificate);
    __public = certificate.public;

}


exports.getAgentSafeBox = function(agent){
    var sb = new AgentSafeBox(agent);

    var obj = {
        name:"Hello World"
    };

    console.log(sb.digest(obj), sb.getCurrentPublicKey());


    return sb;

}