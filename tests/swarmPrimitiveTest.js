
var flow = require("../lib/index.js");
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
        this.swarm(this.context("agent"), "doStep", 1);
    },
    doStep:function(a){
        this.result = this.a1 + this.a2 + a;
    }
});


f.begin();
setTimeout(function(){
    console.log(f.result());
}, 2);