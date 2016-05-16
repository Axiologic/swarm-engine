
var flow = require("../lib/index.js");

var f = flow.createSwarm("simpleSwarm", {
    type:"blob",       // flow, key, contract
    public:{
        result:"int"
    },
    start:function(fileName){
        this.transfer("context", fileName, "signal");
    },
    signal:function(res){
        //in res there is the BLOB file
    }
});

f.start("fileName");
