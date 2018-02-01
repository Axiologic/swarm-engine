
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
        spaces:Array,
        privateKey:"PrivateKey"
    },
    start:function(nodeAgent,  spaces){
        if(!this.privateKey){
            this.nodeAgent  = nodeAgent;
            this.spaces     = spaces;
            this.__boot();
        }
    },
    __boot:function(){
        this.privateKey = "secret";
        this.__serialiser.__store(this);
        //create folders for spaces
    }
});