
var beesHealer = require("../../choreographies/beesHealer");
var fs = require("fs");

//TODO: prevent a class of race condition type of errors by signaling with files metadata to the watcher when it is safe to consume

function FolderMQ(folder, callback){
    fs.mkdir(folder, function(err, res){
        fs.exists(folder, function(exists) {
            if (exists) {
                callback(null, folder)
            } else {
                callback(err);
            }
        });
    });

    function mkFileName(swarmRaw){
        return folder + "/" + swarmRaw.meta.swarmId + "."+swarmRaw.meta.swarmTypeName;
    }

    this.getHandler = function(){
        if(producer){
            throw new Error("Only one consumer is allowed!");
        }
        producer = true;
        return {
            addStream : function(stream, callback){
                throw new Error("Not implemented!");//TODO: implement
            },
            addSwarm : function(swarm, callback){
                if(!callback){
                    callback = $$.defaultErrorHandlingImplementation;
                }

                beesHealer.asJSON(swarm,null, null, function(err, res){
                    fs.writeFile(mkFileName(res),J(res), callback);
                });
            }
        }
    };

    this.registerConsumer = function(callback){
        if(consumer){
            throw new Error("Only one consumer is allowed!");
        }
        consumer = callback;
        fs.mkdir(folder, function(err,res){
            consumeAllExisting();
        })
    };

    /* ---------------- protected  functions */
    var consumer = null;
    var producer = null;

    function consumeMessage(filename){
        var fullPath = folder+"/"+filename;
        fs.readFile(fullPath, "utf8", function(err, data){
            if(!err){
                consumer(JSON.parse(data));
                fs.unlink(fullPath, function(err, res){if(err) throw err});
            }
        });
    }

    function consumeAllExisting(){
        fs.readdir(folder,"utf8", function(err, files){
            if(err){
                $$.errorHandler.error(err)
            } else {
                files.forEach(consumeMessage);
                watchFolder();
            }

        });
    }

    function watchFolder(){
        fs.watch(folder, function(eventType, filename){
            //console.log("Watching:", eventType, filename);
            if (filename && eventType == "change") {
                consumeMessage(filename);
            }
        });
    }
}

exports.getFolderQueue = function(folder, callback){
    return new FolderMQ(folder, callback);
};