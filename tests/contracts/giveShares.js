var contract = contracts.describeSwarm("DAOShares", {
    public:{
        value: "number",
        owner: "agent",
        onwerSignature:"SignSensusSignature"
    },
    changeValue:function(howMuch, transaction){
        this.value          += howMuch;
    },
    verification: function(validCallback){  //used in the consensus algoritm
        if(previousState.value > this.value){
            if(this.transaction.amount != previousState.value > this.value){
                validCallback(new Error("invalid"))
            }
            assertSignature(this.transaction.giver, this.owner, this.onwerSignature,validCallback);
        } //else accept it happily as it increases
        else {
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
        giverContract:  "swarm",
        targetContract: "swarm",
        giverSignature:"SignSensusSignature"
    },
    give:function(who, toWhom, howMuch){
        this.state          = "given";
        this.amount         = howMuch;
        this.giverContract  = contracts.reviveContract(who);
        this.targetContract = contracts.reviveContract(toWhom);
        this.giverContract.value -= howMuch;
        this.giverSignature = this.giverContract.signState();
        this.targetContract.value += howMuch;
    },
    verification: function(resultCallback){  //used in the consensus algoritm
        this.giverContract.verification();
        this.targetContract.verification();


        if(this.state == "accepted"){
            assertSignature(this.giverContract, this.giver, this.giverSignature, function(err, result){
                assertSignature(this, this.owner, this.onwerSignature,resultCallback);
            })
        }
    }
});


var giverShares = contracts.reviveContract(url);

var newShares = contracts.startSwarm("shareToADAO");

newShares.create("agentId");

giverShares.give()

newShares.



daoShares.request(id, signature, toWhom, benefit);
var url = newContract.blockchainURL();
// send this to a user and the user wil revive the contravt on his computer with a code like:

var contractRequest =
contractRequest.accept();


