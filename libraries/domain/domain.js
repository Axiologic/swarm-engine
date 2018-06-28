$$.contract.describe("domainConstitution", {
    public:{
        pdsInstance: "native",
        shares      :"contract",
        agents      :"contract",
        stakeHolders:"contract"
    },
    create:function(pdsInstance){
    },
    getContract:function(name){

    },
    saveTransaction:function(){

    }
});

var domainReplicaAPIs = $$.contract.create("domainConstitution");

$$.transaction.describe("domainTransaction", {
    public:{
        contractInstace:"contract"
    },
    create:function(contractName, action, args){

        var smc = domainReplicaAPIs.getContract(contractName);
        smc.transaction = this;
        smc.domain = currentDomain;
        smc[action].apply(args);
    },
    save:function(){
        domainReplicaAPIs.saveTransaction(this);
    }
});