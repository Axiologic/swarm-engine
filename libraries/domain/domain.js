$$.flow.describe("Constitution", {
    public:{
        pdsInstance: "native",
        crlInstance: "native",
    },
    create:function(pdsInstance, crlInstance){
        this.pdsInstance = pdsInstance;
        this.crlInstance = crlInstance;
    },
    reviveContract:function(key){

    },
    saveTransaction:function(transaction){
        $$.pds.save(transaction);
    },
    setPublicDescription:{

    }
});

$$.contract.describe("domainInfo", {
    public:{
        parents:    "json",
        children:   "json",
        description: "string",
        adminAgent: "string",
    },
    addParent:function(newparrent){
        this.parents[newparrent] = pdsInstance;
        this.crlInstance = crlInstance;
    },
    setDescription:function(newDesc){
        this.description = newDesc;
    },
    allows:function(transaction, action, args){
        return this.assert(transaction.signer == this.adminAgent);
    }
});


$$.transaction.describe("domainTransaction", {
    public:{
        contractKey:"string",
        contract:"contract"
    },
    determineInput:function(){
        return this.declareInput([this.contractKey]);
    },
    determineOutput:function(){
        return this.declareOutput([this.contractKey]);
    },
    execute:function(key, action, args){
        this.contractKey        = key;
        this.action             = action;
        this.args               = args;
        var contract            = this.reviveContract(key);
        this.contract           = contract;

        if(contract.allows(action, args)){
            contract[action].apply(args);
            this.setOutput(key, this.contract)
        }
    },
    check:function(){               //executed in all nodes.
        this.previous = $$.reviveContract(this.contractKey);
        return this.contract.allows(this, this.action, this.args);
    }
});