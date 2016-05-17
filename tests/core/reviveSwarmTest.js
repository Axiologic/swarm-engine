
var flow = require("../../lib/index.js");
var f = flow.createSwarm("simpleSwarm", {
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
    },
    doStep:function(a){
        this.result = this.a1 + this.a2 + a;
    }
});


var storage = flow.createMemoryStorage();

f.begin();
storage.save(f);

var flowId = f.meta.swarmId()
f.dispose();


var newF = storage.revive(flowId);

newF.doStep(1);

setTimeout(function(){
    console.log(newF.result());
}, 2);