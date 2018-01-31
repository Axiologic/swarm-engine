
var launcher = $$.loadLibrary("launcher");

$$.callflows.describe("Agent", {
    public:{
        spaceUrl:String,
        agentId:String
    },
    init:function(value){
        this.value = value;
    }
});


$$.callflows.describe("Config", {
    public:{
        nodeAgent:launcher.Agent,
        agents:Array,
        privateKey:"PrivateKey"
    },
    start:function(configFile){
        if(!this.privateKey){
            this.__boot();
        }
    },
    __boot:function(){
        this.privateKey = "secret";
        this.__serialiser.__store(this);
    }
});