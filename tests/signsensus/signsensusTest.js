
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
    getSignature:function(err,res){
        safeBox.verify(this.digest, res, this.prinREsults);

    },

    prinREsults:function(err,res){
        if(res){
            console.log("Sucess");
        } else {
            console.log("fail");
        }
    }
})


test().start();
