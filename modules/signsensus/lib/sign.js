
const crypto = require('crypto');
const ssutil = require("./ssutil");





function SignsensusSignatureChain(agent, PROOF_BLOCK_SIZE , loader){

    if(!PROOF_BLOCK_SIZE ){
        PROOF_BLOCK_SIZE = 32;
    }

    if(loader){
        console.log("Loading previous signatures is not implemented yet. Starting from 0 for testing");
    }

    var counter = 0;
    var signatureIndex = [];


    var __internal = {};


    function generatePublicAndPrivateKeys(myCounter){



        var result = {}
        result.private = Buffer.alloc(32);
        crypto.randomFillSync(result.private);

        var proof = [];
        for(var i = 0 ; i < 64; i++){
            proof.push(ssutil.generatePosHashXTimes(result.private, i, PROOF_BLOCK_SIZE, 256)); //not 255 to not discolose much about the private key for digests with 0 in bytes
        }

        result.public = ssutil.hashStringArray(myCounter, proof, PROOF_BLOCK_SIZE);
        //console.log("Public key", myCounter, " :", result.public);

        return result;
    }

    signatureIndex.push(generatePublicAndPrivateKeys(counter));

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
        var debugInfo = [];

        for(var i = 0; i < 32; i++){
            if(!verificationMode){
                jumps = directDigest[i] + 1;
                proof.push(ssutil.generatePosHashXTimes(startFrom.private, i , PROOF_BLOCK_SIZE, jumps));
                debugInfo.push(jumps);
            } else { //verification mode
                jumps = 255 - directDigest[i];
                proof.push(ssutil.generatePosHashXTimes(startFrom[i], i , PROOF_BLOCK_SIZE, jumps ));
                debugInfo.push(jumps);
            }
            //console.log(proof[proof.length -1]);
        }

        for(var i = 0; i < 32; i++){
            if(!verificationMode){
                jumps = nonDigest[i] + 1 ;
                proof.push(ssutil.generatePosHashXTimes(startFrom.private, i + 32 , PROOF_BLOCK_SIZE, jumps));
                debugInfo.push(jumps);
            } else { //verification mode
                jumps = 255 - nonDigest[i];
                proof.push(ssutil.generatePosHashXTimes(startFrom[i + 32], i + 32 , PROOF_BLOCK_SIZE, jumps ));
                debugInfo.push(jumps);
            }
            //console.log(proof[proof.length -1]);
        }

        //console.log("Debug:", debugInfo.join(" "));
        return proof;
    }

    this.sign = function(digest) {

        var current = signatureIndex[counter];

        var next = generatePublicAndPrivateKeys(counter + 1);
        signatureIndex.push(next);

        var proof = computeHashes(digest, next.public, false, current)

        counter++;
        return ssutil.createSignature(agent, counter - 1, next.public, proof, PROOF_BLOCK_SIZE );
    }


    this.verify = function(digest, signature){

        var signJSON = ssutil.getJSONFromSignature(signature, PROOF_BLOCK_SIZE);

        var current = signatureIndex[signJSON.counter];
        var next = signatureIndex[signJSON.counter + 1];

        //console.log(signJSON);

        if(signJSON.nextPublic != next.public) {
            console.log("Found a signature with a fake next public!!!")
            return false;
        } // fake signature

        var proof = computeHashes(digest, next.public, true, signJSON.proof);


        var publicFromSignature = ssutil.hashStringArray(signJSON.counter, proof, PROOF_BLOCK_SIZE);

        //console.log(publicFromSignature, current.public)
        if(publicFromSignature == current.public){
            return true;
        } else {
            return false;
        }
    }
}


function AgentSafeBox(agentName, blockSize){

    var agentHash = ssutil.hashValues(agentName)
    var chain = new SignsensusSignatureChain(agentHash, blockSize);


    this.digest  = function(obj){
        var result = ssutil.dumpObjectForHashing(obj);
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


exports.getAgentSafeBox = function(agent, blockSize){
    var sb = new AgentSafeBox(agent, blockSize);

    return sb;

}
