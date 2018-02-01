Fails after latest changes!!

require("../../engine/core").enableTesting();

$$.swarms.describe("subSwarm",{
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

        /*var newSwarm = flow.startSwarm("subSwarm");
        newSwarm.swarm("agent", "doSomething", a1,a2);
        */
        flow.startSwarm("subSwarm", "agent", "doSomething", a1,a2).onReturn(this.afterExecution);

        //this.wait(this.afterExecution, newSwarm, this.keepAlive);

    },
    afterExecution: function(err, res, wholeSwarm){
        var newSwarm = flow.restartSwarm("subSwarm", wholeSwarm);
        console.log(`After restart newSwarm.value should be 2 and is ${newSwarm.value}`);
        console.log(`res should be 3 and is ${res} `);
        //this.return(null,res);
    }
});

for(var i = 0; i<=1024; i++){
    $$.swarms.start("simpleSwarm","system", "begin", 1, 2);
}
