
var ss = require("../../modules/signsensus");

require("../../engine/core").enableTesting();

var safeBox = ss.getAgentSafeBox("test");




var test = $$.flow.describe("signatureTest",{

    start:function(){
        this.obj = {
            name:"Hello World"
        }

        this.digest = safeBox.digest(this.obj);

        safeBox.sign(this.digest, this.getSignature);
    },
    getSignature:function(err,signature){
        this.signature = signature;
        safeBox.verify(this.digest, signature, this.printResults);
    },

    printResults:function(err,isGood){
        console.log(this.signature, isGood);
        if(isGood){
            console.log("Success");
        } else {
            console.log("Fail to verify");
        }
    }
})


test().start();
