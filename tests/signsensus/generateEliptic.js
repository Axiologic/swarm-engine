var crypto = require("crypto");

const assert = require('assert');



const sign = crypto.createSign('RSA-SHA256');

sign.update('some data to sign');

const alice = crypto.createECDH('secp521r1');
const aliceKey = alice.generateKeys();
const privateKey = alice.getPrivateKey();

console.log(sign.sign(privateKey, 'hex'));




return ;

for(var i=0; i<2; i++){
    var t = process.hrtime();



    sign.update('some data to sign');
    var signature = "";//sign.sign(alice.getPublicKey(), "hex");


    t = process.hrtime(t);
    console.log('Generating a new public key took %d seconds (or %d milliseconds)', t[0] + t[1]/1000000000, t[1]/ 1000000);
    console.log(alice.getPrivateKey("hex"), alice.getPublicKey("hex"), signature);
}


