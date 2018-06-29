$$.contract.describe("shares", {
    public:{
        total:"number",
        shares:"json"
    },
    allocate:function(ammount){
        var currentAgent = this.transaction.getSignatoryAgent();
        if(!total){
            this.total  = ammount;
            this.shares[currentAgent] = ammount;
            this.transaction.save();
        } else {
            if(this.domain.hasMajority(currentAgent)){
            var diff = ammount - this.total;
            if(diff >0){
                    this.total  = ammount;
                    this.shares[currentAgent] +=  diff;
                    this.transaction.save();
                }
            };
        }
    },
    give:function(toWhom, ammount){
        var currentAgent = this.transaction.getSignatoryAgent();
        var currentAmmount = this.shares[currentAgent];
        if(currentAmmount >= ammount){
            this.shares[currentAgent]   -=  ammount;
            this.shares[toWhom]         +=  ammount;
            this.transaction.save();
        }
    },
    getShares:function(agent){
        return this.shares[agent];
    }
});