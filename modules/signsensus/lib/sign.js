
const crypto = require('crypto');
const dumper = require("./dumper");
const ssutil = require("./ssutil");


const PROOF_BLOCK_SIZE = 4;


function SignsensusSignatureChain(loader){

    if(loader){
        console.log("Loading previous signatures is not implemented yet. Starting from 0 for testing");
    }

    var counter = 0;
    var signatureIndex = [];


    var __internal = {};


    function generatePublicAndPrivateKeys(){
        var result = {}
        result.private = Buffer.alloc(32);
        crypto.randomFillSync(result.private);

        var proof = [];
        for(var i = 0 ; i < 64; i++){
            proof.push(ssutil.generatePosHashXTimes(result.private, i, PROOF_BLOCK_SIZE, 256)); //not 255 to not discolose much about the private key for digests with 0 in bytes
        }

        result.public = ssutil.hashStringArray(counter, proof, PROOF_BLOCK_SIZE);
        return result;
    }

    signatureIndex.push(generatePublicAndPrivateKeys());

    function computeHashes(digest, nextPublic,  verificationMode, startFrom){

        var digestForSigning = [digest, nextPublic];


        var digest = ssutil.hashValues(digestForSigning);
        const directDigest = Buffer.from(digest, 'hex');
        const nonDigest = Buffer.alloc(32);
        for(var i=0; i< 32; i++){
            nonDigest[i] = 255 - directDigest[i];
        }

        var proof = [];
        var jumps;
        for(var i = 0; i < 32; i++){

            if(!verificationMode){
                jumps = directDigest[i];
                proof.push(ssutil.generatePosHashXTimes(startFrom.private, i , PROOF_BLOCK_SIZE, jumps + 1));
                jumps = nonDigest[i];
                proof.push(ssutil.generatePosHashXTimes(startFrom.private, i + 32 , PROOF_BLOCK_SIZE, jumps + 1));
            } else { //verification mode
                jumps = directDigest[i];
                proof.push(ssutil.generatePosHashXTimes(startFrom[i], i , PROOF_BLOCK_SIZE, 256 - jumps ));
                jumps = nonDigest[i];
                proof.push(ssutil.generatePosHashXTimes(startFrom[i + 32], i + 32 , PROOF_BLOCK_SIZE, 256 - jumps ));
            }
        }
        return proof;
    }

    this.sign = function(digest) {

        var current = signatureIndex[counter];

        var next = generatePublicAndPrivateKeys();
        signatureIndex.push(next);

        var proof = computeHashes(digest, next.public, false, current)

        counter++;
        return ssutil.createSignature("agent", counter - 1, next.public, proof, PROOF_BLOCK_SIZE );
    }


    this.verify = function(digest, signature){

        var signJSON = ssutil.getJSONFromSignature(signature, PROOF_BLOCK_SIZE);

        var current = signatureIndex[signJSON.counter];
        var next = signatureIndex[signJSON.counter + 1];

        if(signJSON.nextPublic != next.public) return false; // fake signature

        var proof = computeHashes(digest, next.public, true, signJSON.proof);


        var publicFromSignature = ssutil.hashStringArray(signJSON.counter, proof, PROOF_BLOCK_SIZE);

        if(publicFromSignature == this.publicKey){
            return true;
        } else {
            return false;
        }
    }
}


function AgentSafeBox(agentName){

    var chain = new SignsensusSignatureChain();


    this.digest  = function(obj){
        var result = ssutil.dumpObjectForDigest(obj);
        var hash = crypto.createHash('sha256');
        hash.update(result);
        return hash.digest('hex');
    }

    this.sign  = function(digest, calback){
        calback(null,chain.sign(digest));
    }

    this.verify  = function(digest, signature, callback){
        callback(null, chain.verify(digest, signature));
    }
}


exports.getAgentSafeBox = function(agent){
    var sb = new AgentSafeBox(agent);

    return sb;

}
