//require("../../engine/core").enableTesting();
var assert=require("double-check").assert;
var f = $$.swarm.create("testSandBoxExecution", {
    public:{
        result:"int"
    },
    init:function(){
        this.result = 0;
        this.swarm("space1\\agent\\agent_x", "test1");

    },
    test1:function(){
        assert.equal(this.result,0,"Unexpected result");
        this.result += 1;
        this.swarm("space2\\agent\\agent_007", "test2");
    },
    test2:function(){
        assert.equal(this.result,1,"Unexpected result");
        this.result += 2;
        this.swarm("crl\\agent\\jhon_smith", "onResult");
    },
    onResult:function(err, text){
        assert.equal(err,null,"Error");
        assert.equal(this.result,3,"Unexpected result");

    }
});
