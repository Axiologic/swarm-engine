
var flow = require("../lib/index.js");

flow.describeSwarm("subSwarm",{
    doSomething:function(){
        this.return(null,1);
        this.return(null,2);
        this.return(null,3);
        this.return(null,4);
    }
});

var f = flow.createSwarm("simpleSwarm", {
    private:{
        count:"int"
    },
    begin:function(){
        this.count = 3; //allow only 3 messages
        flow.startSwarm("subSwarm", "agent", "doSomething").onReturn(this.afterExecution, this.waitForMore);
        },
    waitForMore:function(){
        this.count--;
        return this.count > 0;
    },
    afterExecution: function(err, res){
        console.log(this, `res should be <= 3 and is ${res} `);
    }
});


flow.startSwarm("simpleSwarm","system", "begin", 1, 2);
//f.begin(1,2);

//assert to check swarmAliveInstances
