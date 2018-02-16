const { randomBytes } = require('crypto');
const secp256k1 = require('../../../node_modules/secp256k1');
// or require('secp256k1/elliptic')
//   if you want to use pure js implementation in node



var t = process.hrtime();

// generate message to sign
const msg = randomBytes(32)

// generate privKey
let privKey
do {
    privKey = randomBytes(32)
} while (!secp256k1.privateKeyVerify(privKey))
// get the public key in a compressed format
const pubKey = secp256k1.publicKeyCreate(privKey)
// sign the message
const sigObj = secp256k1.sign(msg, privKey);

t = process.hrtime(t);
console.log('Signing + generating a new public key took %d seconds (or %d milliseconds)', t[0] + t[1]/1000000000, t[1]/ 1000000);



console.log("Private", privKey.toString("hex"));
console.log("Public", pubKey.toString("hex"));
console.log("Signature", sigObj.signature.toString("hex"));
// verify the signature
console.log(secp256k1.verify(msg, sigObj.signature, pubKey))
// => true
