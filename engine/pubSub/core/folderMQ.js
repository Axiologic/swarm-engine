
var beesHealer = require("../../choreographies/beesHealer");
var fs = require("fs");
var path = require("path");
//TODO: prevent a class of race condition type of errors by signaling with files metadata to the watcher when it is safe to consume

function FolderMQ(folder, callback){
    folder = path.normalize(folder);


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
        return path.normalize(folder + "/" + swarmRaw.meta.swarmId + "."+swarmRaw.meta.swarmTypeName);
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
                    writeFile(mkFileName(res), J(res), callback);
                });
            },
            sendSwarmForExecution: function(swarm, callback){
                if(!callback){
                    callback = $$.defaultErrorHandlingImplementation;
                }

                beesHealer.asJSON(swarm, swarm.meta.phaseName, null, function(err, res){
                    writeFile(mkFileName(res), J(res), callback);
                });
            }
        }
    };

    this.registerConsumer = function(callback){
        if(consumer){
            throw new Error("Only one consumer is allowed! "+folder);
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
        var fullPath = path.normalize(folder+"/"+filename);
        fs.readFile(fullPath, "utf8", function(err, data){
            if(!err){
                if(data!==""){
                    try{
                        var message = JSON.parse(data);
                    }catch(err){
                        console.log(err, data);
                    }
                    consumer(message);
                    fs.unlink(fullPath, function(err, res){if(err) throw err});
                }
            }
        });
    }

    function consumeAllExisting(){
        fs.readdir(folder,"utf8", function(err, files){
            if(err){
                $$.errorHandler.error(err)
            } else {
                watchFolder();
                files.forEach(function(filename){
                    if(filename.indexOf(in_progress)==-1){
                        consumeMessage(filename);
                    }
                });
            }
        });
    }

    var in_progress = ".in_progress";
    function writeFile(filename, content, callback){
        var tmpFilename = filename+in_progress;
        fs.writeFile(tmpFilename, content, function(error, res){
            if(!error){
                fs.rename(tmpFilename, filename, function(err, result){
                    if(err){
                        throw err;
                    }else{
                        callback(err, res);
                    }
                })
            }else{
                throw error;
            }
        });
    }

    var alreadyKnownChanges = {};

    function alreadyFiredChanges(filename, change){
        var res = false;
        if(alreadyKnownChanges[filename]){
           res = true;
        }else{
            alreadyKnownChanges[filename] = change;
        }

        return res;
    }

    function watchFolder(){
        fs.watch(folder, function(eventType, filename){
            //console.log("Watching:", eventType, filename);

            if (filename && (eventType == "change" || eventType == "rename")) {
                if(filename.indexOf(in_progress)==-1 && !alreadyFiredChanges(filename, eventType)){
                    consumeMessage(filename);
                }
            }
        });
    }
}

exports.getFolderQueue = function(folder, callback){
    return new FolderMQ(folder, callback);
};