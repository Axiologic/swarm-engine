var contract = contracts.describeSwarm("DAOShares", {
    public:{
        value: "number",
        owner: "agent"
    },
    protected:{
        transaction:"giveShares"
    },
    create:function(owner){
        this.value          = 0;
        this.owner          = owner;
    },
    addValue:function(howMuch, transaction){
        this.value          += howMuch;
        this.transaction    += transaction;
    },
    verifyChange: function(validCallback){  //used in the consensus algorithm
        var previousState = this.loadValidatedState();
        if(previousState.value > this.value){
            if(this.transaction.amount != previousState.value - this.value){
                validCallback(new Error("invalid"))
            }
            verifySignature(this.transaction.giver, this.owner, this.transaction.giverSignature,validCallback);
        } //else accept it happily as it increases
        else {
            if(this.transaction.amount != this.value - previousState.value ){
                validCallback(new Error("invalid"))
            }
            validCallback(null, true);
        }
    }
});



var contract = contracts.describeSwarm("giveShares", {
    protected:{
        state   : "string",
        amount  : "number",
        toWhom  : "agent",
        giver   : "agent",
        giverContract:  "contract",
        targetContract: "contract",
        giverSignature:"SignSensusSignature"
    },
    give:function(who, toWhom, howMuch){
        this.state          = "given";
        this.amount         = howMuch;
        this.giverContract  = contracts.reviveContract(who);
        this.targetContract = contracts.reviveContract(toWhom);
        this.giverContract.addValue(-howMuch, this);
        this.targetContract.addValue(howMuch, this);
        this.giverSignature = this.signState();
    },
    verification: function(resultCallback){  //used in the consensus algoritm
        this.giverContract.verifyChange(resultCallback);
        this.targetContract.verifyChange(resultCallback);
    }
});


var giverShares = contracts.reviveContract(url);

var newShares = contracts.startSwarm("DAOShares");

newShares.create("agentId");

giverShares.give(giverShares.owner, "agentId", 10);




daoShares.request(id, signature, toWhom, benefit);
var url = newContract.blockchainURL();
// send this to a user and the user wil revive the contravt on his computer with a code like:

var contractRequest =
contractRequest.accept();


