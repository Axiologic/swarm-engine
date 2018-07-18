$$.contract.describe("shares", {
    public:{
        total:"number",
        shares:"json"
    },
    protected:{
        whoGives:"agent"
    },
    allocate:function(ammount){
        var currentAgent = this.transaction.signer;
        if(!total){
            this.total  = ammount;
            this.shares[currentAgent] = ammount;
        } else {
            if(this.domain.hasMajority(currentAgent)){
            var diff = ammount - this.total;
            if(diff >0){
                    this.total  = ammount;
                    this.shares[currentAgent] +=  diff;
                }
            }
        }
    },
    give:function(toWhom, amount){
        var currentAgent = this.transaction.signer;
        var currentAmmount = this.shares[currentAgent];
        this.ammount = ammount;
        this.toWhom = ammount;
        if(currentAmmount >= amount){
            this.shares[currentAgent]   -=  amount;
            this.shares[toWhom]         +=  amount;
        }
    },
    getShares:function(agent){
        return this.shares[agent];
    },
    allows:function(transaction, action, args){
        var previous    = transaction.previous;
        var signer      = transaction.signer;
        if(action == allocate && !previous.total){
            return true; //alocate only once, when is not allocated
        }

        if(action == give){
            this.assert(this.whoGives == signer);
            this.assert(this.ammount >= 0);
            assertIdenticalExcept(this.shares,previous.shares, [this.whoGives, this.toWhom], function(key, value1, value2){
                if(key == this.whoGives){
                    this.assert(value1 - value2 == this.ammount);
                } else
                if(key == this.toWhom){
                    this.assert(value2 - value1 == this.ammount);
                } else {
                    assert(false);
                }
            })
        }
       assert(false);
    }
});