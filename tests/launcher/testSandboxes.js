
require("../../engine/launcher").core.enableTesting();

var f = $$.swarm.create("test12", {
    public:{
        result:"int"
    },
    start:function(){
        this.result = 0;
        console.log("start");
        this.swarm("space1/agent/agent_x", this.test1);
    },
    test1:function(value){
        console.log("test1");
        this.result += 1;
        this.swarm("space2/agent/agent_007", this.test2);
    },
    test2:function(value){
        console.log("test2");
        this.result += 2;
        this.swarm("crl/agent/jhon_smith", this.onResult);
    },
    onResult:function(err, text){
        console.log("Result:", this.result);
    }
});

f.start();

