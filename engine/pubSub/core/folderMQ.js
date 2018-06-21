
var fs = require("fs");
var path = require("path");
var beesHealer = $$.requireModule("callflow").beesHealer;

//TODO: prevent a class of race condition type of errors by signaling with files metadata to the watcher when it is safe to consume

function FolderMQ(folder, callback = () => {}){

    if(typeof callback !== "function"){
        throw new Error("Second parameter should be a callback function");
    }

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
                }else if(typeof callback !== "function"){
                    throw new Error("Second parameter should be a callback function");
                }

                beesHealer.asJSON(swarm,null, null, function(err, res){
                    writeFile(mkFileName(res), J(res), callback);
                });
            },
            sendSwarmForExecution: function(swarm, callback){
                if(!callback){
                    callback = $$.defaultErrorHandlingImplementation;
                }else if(typeof callback !== "function"){
                    throw new Error("Second parameter should be a callback function");
                }

                beesHealer.asJSON(swarm, swarm.meta.phaseName, swarm.meta.args, function(err, res){
                    writeFile(mkFileName(res), J(res), callback);
                });
            }
        }
    };

    this.registerConsumer = function (callback, notifyReadStart = () => {}, shouldDeleteAfterRead = true, shouldWaitForMore = () => true) {
        if(typeof callback !== "function"){
            throw new Error("First parameter should be a callback function");
        }
        if (consumer) {
            throw new Error("Only one consumer is allowed! " + folder);
        }

        consumer = callback;
        fs.mkdir(folder, function (err, res) {
            consumeAllExisting(notifyReadStart, shouldDeleteAfterRead, shouldWaitForMore);
        });
    };

    this.writeMessage = writeFile;

    this.unlinkContent = function (messageId, callback) {
        const messagePath = path.join(folder, messageId);

        fs.unlink(messagePath, (err) => {
            callback(err);
        });
    };


    /* ---------------- protected  functions */
    var consumer = null;
    var producer = null;

    let counter = 0;
    function consumeMessage(filename, shouldDeleteAfterRead) {
        var fullPath = path.normalize(folder + "/" + filename);
        fs.readFile(fullPath, "utf8", function (err, data) {
            if (!err) {
                if (data !== "") {
                    try {
                        var message = JSON.parse(data);
                    } catch (err) {
                        console.log(err, data);
                    }

                    consumer(message, filename);
                    if (shouldDeleteAfterRead) {

                        fs.unlink(fullPath, function (err, res) {
                            if (err) throw err
                        });
                    }
                }
            }
        });
    }

    function consumeAllExisting(notifyReadStart, shouldDeleteAfterRead, shouldWaitForMore) {

        let currentFiles = [];

        fs.readdir(folder, 'utf8', function (err, files) {
            if (err) {
                $$.errorHandler.error(err);
                return;
            }

            currentFiles = files;

            for (let i = 0; i < files.length && shouldWaitForMore(); ++i) {
                if (path.extname(files[i]) !== in_progress) {
                    notifyReadStart();
                    consumeMessage(files[i], shouldDeleteAfterRead);
                }
            }
        });

        currentFiles.forEach(file => {
            if(fs.existsSync(path.basename(file)) && shouldWaitForMore()) {
                consumeMessage(path.basename(file), shouldDeleteAfterRead);
            }
        });

        if(shouldWaitForMore()) {
            watchFolder(notifyReadStart,shouldDeleteAfterRead, shouldWaitForMore);
        }
    }


    const in_progress = ".in_progress";
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

    function watchFolder(notifyReadStarts, shouldDeleteAfterRead, shouldWaitForMore){
        const watcher = fs.watch(folder, function(eventType, filename){
            // console.log("Watching:", eventType, filename);

            if(!shouldWaitForMore()) {
                watcher.close();
                return;
            }

            if (filename && (eventType === "change" || eventType === "rename")) {

                if(path.extname(filename) !== in_progress && !alreadyFiredChanges(filename, eventType)){
                    notifyReadStarts();
                    consumeMessage(filename, shouldDeleteAfterRead);
                }
            }
        });
    }
}

exports.getFolderQueue = function(folder, callback){
    return new FolderMQ(folder, callback);
};