
require("../../engine/core").enableTesting();

var f = $$.swarms.create("simpleSwarm", {
    type:"flow",       // flow, key, contract
    private:{
            a1: {
                type:"int",
                securityContext:"system"
                },
            a2:"int"
    },
    public:{
        result:"int"
    },
    begin:function(a1,a2){
        this.a1 = a1;
        this.a2 = a2;
        this.swarm("agent", "doStep", 3).onReturn(this.afterExecution);
    },
    doStep:function(a){
        this.result = this.a1 + this.a2 + a;
        this.return(null, this.result);
    },
    afterExecution: function(err, res, wholeSwarm){
        //console.log("afterExecution", wholeSwarm);
        console.log(`this.result should remain undefined and is ${this.result} but res should be 6 and is ${res}`);
        this.update(wholeSwarm);
        console.log(`After update this.result should be 6 and is ${this.result} `);
    }
});

f.begin(1,2);

//check f.result;
//assert to check swarmAliveInstances

var s = $$.swarm.create("swarmingHelloWorld", {
    start:function(msg){
        this.swarm(SecurityContext, "hello", msg);
    },
    hello:function(msg){
        console.log(msg)
    }
});

s.start("Hello World!")

Pornirea unui swarm se face folosind functia start:   $$.flow.start("simplestSwarm").

