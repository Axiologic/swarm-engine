var contract = contracts.describeSwarm("standardConsentMicroContract", {
    protected:{
        state: "string",
        requster:"agent",
        requsterSignature:"signature",
        dataOwner:"agent",
        dataOwnerSignature:"signature",
        validUntil: "time",
        benefitToken: "token"
    },
    request:function(requster, dataOwner, validUntil, benefitToken){
        this.requster           = requster;
        this.dataOwnerSignature = dataOwner;
        this.benefitToken       = benefitToken;
        this.validUntil         = validUntil;
        this.state              = "requested";
        this.requsterSignature  = signState(this);
        this.save();
    },
    accept:function(){
        this.state  = "accepted";
        this.dataOwnerSignature = signState(this);
        this.save();
    },
    reject:function(){
        this.state  = "refused";
        this.dataOwnerSignature = signState(this);
        this.save();
    },
    withdraw:function(){
        this.state  = "refused";
        this.dataOwnerSignature = signState(this);
        this.save();
    },
    selfUpdateState:function(){
         if(currentTime() >= this.validUntil){
             this.state  = "expired";
         }
    },
    verification: function(resultCallback){  //used in the consensus algoritm
        var previousState = this.loadValidatedState();
        if(this.state == expired){
            if(currentTime() >= this.validUntil){
                resultCallback(null, true);
            } else {
                resultCallback(new Error("invalid check"));
            }
        }
        if(previousState == null){
            assertSignature(this, this.requster, this.requsterSignature, resultCallback)
        } else {
            assertSignature(this, this.dataOwnerSignature,this.dataOwnerSignature, resultCallback); //assume that only the data owner can change it
        }
    }
});


var newContract = contracts.startSwarm("standardConsentMicroContract");

newContract.request(id, signature, toWhom, benefit);
var url = newContract.blockchainURL();
// send this to a user and the user wil revive the contravt on his computer with a code like:

var contractRequest = contracts.reviveContract(url);
contractRequest.accept();


