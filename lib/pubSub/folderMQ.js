
var beesHealer = require("../chore/beesHealer");
var fs = require("fs");


function FolderMQ(folder){

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
                throw new Error("Not implemented!");
            },
            addSwarm : function(swarm, callback){
                beesHealer.asJSON(swarm.valueOf(),null, null, function(err, res){
                    fs.writeFile(mkFileName(res),J(res), callback);
                });
            }
        }
    }

    this.registerConsumer = function(callback){
        if(consumer){
            throw new Error("Only one consumer is allowed!");
        }
        consumer = callback;
        fs.mkdir(folder, function(err,res){
            runAllExisting();
            watchFolder();
        })
    }

    /* ---------------- protected  functions */
    var consumer = null;
    var producer = null;

    function runAllExisting(){

    };

    function watchFolder(){
        fs.watch(folder, function(eventType, filename){
            console.log("Watching:", eventType, filename);
            if (filename && eventType == "change") {
                var fullPath = folder+"/"+filename;
                fs.readFile(fullPath, "utf8", function(err, data){
                    if(!err){
                        consumer(JSON.parse(data));
                        fs.unlink(fullPath, function(err, res){if(err) throw err});
                    }
                });
            }
        });
    };
}

exports.getFolderQueue = function(folder){
    return new FolderMQ(folder);
}