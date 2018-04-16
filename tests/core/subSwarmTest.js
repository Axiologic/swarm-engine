
require("../../engine/core").enableTesting();

$$.swarm.describe("subSwarm",{
    public:{
        value:"int"
    },
    doSomething:function(v1, v2){
        this.value = v1 * v2;
        this.return(null,v1 + v2);
    }
});



var f = $$.swarm.create("simpleSwarm", {
    begin:function(a1,a2){
        var subSwarm = $$.swarm.create("subSwarm");
        subSwarm.swarm("agent", "doSomething","system", "begin", a1, a2);
        subSwarm.onReturn(this.afterExecution);
    },
    afterExecution: function(err, res, wholeSwarm){
        var newSwarm = $$.swarm.restart("subSwarm", wholeSwarm);
        console.log(`After restart newSwarm.value should be 2 and is ${newSwarm.value}`);
        console.log(`res should be 3 and is ${res} `);
        //this.return(null,res);
    }
});

$$.swarm.start("masterSwarm","system", "begin", 1, 2);

