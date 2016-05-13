
var flow = require("../lib/index.js");

var subSwarm = flow.describeSwarm("subSwarm",{
    public:{
        value:"int"
    },
    doSomething:function(v1, v2){
        this.value = v1 * v2;
        this.return(null,v1 + v2);
    }
});

var f = flow.createSwarm("simpleSwarm", {
    begin:function(a1,a2){

        /*var newSwarm = flow.startSwarm("subSwarm");
        newSwarm.swarm("agent", "doSomething", a1,a2);
        */
        var newSwarm = flow.startSwarm("subSwarm", "agent", "doSomething", a1,a2);
        this.wait(this.afterExecution, newSwarm, this.keepAlive);
    },
    keepAlive:function(){
        return false;
    },
    afterExecution: function(err, res, wholeSwarm){
        var newSwarm = flow.restartSwarm("subSwarm", wholeSwarm);
        console.log(`After restart newSwarm.value should be 2 and is ${newSwarm.value}`);
        console.log(`res should be 3 and is ${res} `);
        this.return(null,res);
    }
});

f.begin(1,2);

//assert to check swarmAliveInstances
