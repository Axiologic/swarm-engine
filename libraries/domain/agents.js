$$.contract.describe("agents", {
    public:{
        id:"int"
    },
    create:function(ammount){
    }
});

$$.contract.describe("agentList", {
    public:{
        list:"json"
    },
    create:function(ammount){
    }
});


$$.contract.describe("stakeHolders", {
    public:{
        list:"json"
    },
    add:function(agent, hashPublicKey){
        list[agent] = hashPublicKey;
    }
});