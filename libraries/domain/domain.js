$$.contract.describe("domain", {
    public:{
        shares      :"contract",
        agents      :"contract",
        stakeHolders:"contract"
    },
    create:function(ammount){
    }
});


$$.transaction.describe("domainTransaction", {
    public:{
        contractInstace:"contract"
    },
    create:function(contractName, action, args){
        currentDomain[contractName][action].apply(args);
    }
});