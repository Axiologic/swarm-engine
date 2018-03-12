
var ss = require("../../../modules/signsensus/lib/sign");

require("../../../engine/core").enableTesting();

var safeBox = ss.getAgentSafeBox("testAgent", 63);




var test = $$.flow.describe("signatureTest",{

    start:function(){
        this.obj = {
            name:"Hello World"
        }

        this.digest = safeBox.digest(this.obj);

        for(var i=0; i<10; i++){
            var t = process.hrtime();

            safeBox.sign(this.digest, this.getSignature);

            t = process.hrtime(t);
            console.log('Signing + generating a new public key took %d seconds (or %d milliseconds)', t[0] + t[1]/1000000000, t[1]/ 1000000);
        }
    },
    getSignature:function(err,signature){
        this.signature = signature;
        console.log("Signature:", this.signature);
       safeBox.verify(this.digest, signature, this.printResults);
    },

    printResults:function(err,isGood){
        //console.log(this.signature, isGood);
        if(isGood){
            console.log("Success");
        } else {
            console.log("Fail to verify");
        }
    }
})


test().start();
