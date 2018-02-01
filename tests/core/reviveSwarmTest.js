
var flow = require("../../engine/core").enableTesting();
var f = $$.swarms.create("simpleSwarm", {
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

eroare.. nu e terminat sau util...
/*
var storage = flow.createMemoryStorage();

f.begin();
storage.save(f);

var flowId = f.meta.swarmId()
f.dispose();


var newF = storage.revive(flowId);

newF.doStep(1);

setTimeout(function(){
    console.log(newF.result());
}, 2); */