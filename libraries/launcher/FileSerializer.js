var launcher = $$.loadLibrary("launcher");
var fs = require("fs");

$$.jsonReadable = function(obj){
    return JSON.stringify(obj, null, 2);
};

launcher.callflow.describe("FileSerializer", {

    /************************************************ load   ***************************************************/
    load:function(swarmType, fileName, callback){
        this.callback   = callback;
        this.swarmType  = swarmType;
        this.fileName  = fileName;
        fs.readFile(fileName, this.__restoreSwarm);
    },
    /************************************************ store ******************************************************/
    __store:function(flow, fileName, callback){
        this.storeCallBack = $$.safeErrorHandling(callback);

        if(fileName) {
            this.fileName = fileName;
        }
        flow.getJSONasync(this.__doStoreResult);
    },
    __doStoreResult: function(err,res){
        var text = $$.jsonReadable(res);
        fs.writeFile(this.fileName, text, this.storeCallBack);
    },
    __restoreSwarm: function(err, jsonObject){
        var flow;
        if(err){
            flow = $$.callflow.start(this.swarmType);
        }
        else {
            try{
                flow = $$.callflow.restart(this.swarmType, JSON.parse(jsonObject));
            } catch (err){
                this.callback(err);
                return;
            }
        }

        flow.__serialiser = this;
        this.callback(null, flow);
    }
});