
var core = $$.loadLibrary("core");

$$.callflows.describe("agent", {
    public:{
        spaceUrl:String,
        agentId:String
    },
    init:function(value){
        this.value = value;
    }
});


$$.callflows.describe("config", {
    protected:{
        privateKey:"PrivateKey"
    },
    public:{
        nodeAgent:core.agent,
        agents:Array
    },
    start:function(configFile){
        if(!this.privateKey){
            this.privateKey = "secret";
        }
    }
});