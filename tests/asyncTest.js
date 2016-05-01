
var flow = require("../lib/index.js");
var f = flow.createSwarm("asyncExample", {
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
        setTimeout(this.doStep, 1);
    },
    doStep:function(){
        this.result = this.a1 + this.a2;
    }
});


f.begin(1, 2);
setTimeout(function(){
    console.log(f.result);
}, 2);

