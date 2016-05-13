
var flow = require("../lib/index.js");

var f = flow.createSwarm("simpleSwarm", {
    type:"flow",       // flow, key, contract
    private:{
        a1:"int",
        a2:"int"
    },
    public:{
        result:"int"
    },
    begin:function(a1,a2){
        this.a1 = a1;
        this.a2 = a2;
        this.continue("agent", "doStep", 3);
        this.wait(this.afterExecution, this, this.keepAlive);
        //console.log(this.getInnerValue().meta.swarmId);
    },
    keepAlive:function(){
        return false;
    },
    doStep:function(a){
        this.result = this.a1 + this.a2 + a;
        this.return(null, this.result);
    },
    afterExecution: function(err, res, wholeSwarm){
        //console.log("afterExecution", wholeSwarm);
        console.log(`this.result should remain undefined and is ${this.result} but res should be 6 and is ${res}`);
        this.update(wholeSwarm)
        console.log(`After update this.result should be 6 and is ${this.result} `);
    }
});

f.begin(1,2);