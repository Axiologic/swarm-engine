
var path = require("path");
process.env.PRIVATESKY_TMP = path.normalize(__dirname + "../../../../tmp");
require("../../engine/launcher");//.core.enableTesting();



var f = $$.swarm.create("testSandBoxExecution", {
    public:{
        result:"int"
    },
    start:function(){
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

function runCode(){
    f.start();
}



$$.container.declareDependency("onlyNowICanRunThis", [$$.DI_components.swarmIsReady], function(fail, ready){
    //console.log("onlyNowICanRunThis", fail, ready);
    if(!fail){
       runCode();
    }
});

