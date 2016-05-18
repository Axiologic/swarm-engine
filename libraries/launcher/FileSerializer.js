
var core = $$.loadLibrary("core");
var fs = require("fs");


core.callflow.describe("Serializer", {

    /************************************************ store ******************************************************/
    store:function(flow, fileName, callback){
        this.storeCallBack = $$.safeErrorHandling(callback);
        this.fileName = fileName;
        flow.toJSON(this.returnStoreResult);
    },
    returnStoreResult: function(err,res){
        fs.writeFile(this.fileName, J(res), this.storeCallBack);
    },

    /************************************************ load   ***************************************************/
    load:function(fileName, callback){
        fs.readFile(fileName, this.retoreSwarm);
    },
    retoreSwarm: function(err, jsonObject, callback){
        var flow;
        try{
            flow = $$.callflow.restore(JSON.parse(jsonObject));
        } catch (err){
            callback(err);
        }
        callback(null, flow);
    }
});
