
var flow = require("../lib/index.js");
var f = flow.createSwarm("stepExample", {
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
        this.doStep(3);
    },
    doStep:function(a){
        this.result = this.a1 + this.a2 + a;
    },
    doResult:function(){
        return this.result;
    }
});

f.begin(1, 2);
console.log(f.doResult());
