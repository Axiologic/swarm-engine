
var f = $$.swarm.create("testSandBoxExecution", {
    public:{
        result:"int"
    },
    init:function(){
        this.result = 0;
        console.log("start");
        this.swarm("space1/agent/agent_x", "test1");
    },
    test1:function(value){
        console.log("test1");
        this.result += 1;
        this.swarm("space2/agent/agent_007", "test2");
    },
    test2:function(value){
        console.log("test2");
        this.result += 2;
        this.swarm("crl/agent/jhon_smith", "onResult");
    },
    onResult:function(err, text){
        console.log("Result:", this.result);
    }
});