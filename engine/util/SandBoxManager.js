var mq = require("../pubSub/core/folderMQ");
const path = require('path');
var child_process = require("child_process");

var bootSandBox = $$.flow.describe("PrivateSky.swarm.engine.bootInLauncher", {
    boot:function(sandBox, spaceName, folder, codeFolder, callback){
        //console.log("Booting in ", folder, " context ", spaceName);

        this.callback   = callback;
        this.folder     = folder;
        this.spaceName  = spaceName;
        this.sandBox    = sandBox;
        this.codeFolder    = codeFolder;

        var task = this.serial(this.ensureFoldersExists);

        task.folderShouldExist(this.folder + "/mq/",    task.progress);
        task.folderShouldExist(this.folder + "/code/",  task.progress);
        task.folderShouldExist(this.folder + "/tmp/",   task.progress);
    },
    folderShouldExist:  function(path, progress){
        $$.ensureFolderExists(path, progress);
    },
    linkShouldExist:    function(existingPath, newPath, progress){
        $$.ensureLinkExists(existingPath, newPath, progress);
    },
    ensureFoldersExists: function(err, res){
        if(err){
            console.log(err);
        } else {
            var task = this.parallel(this.runCode);
            task.linkShouldExist(this.codeFolder + "/engine/",      this.folder + "/code/engine",       task.progress );
            task.linkShouldExist(this.codeFolder + "/modules/",     this.folder + "/code/modules",      task.progress );
            task.linkShouldExist(this.codeFolder + "/libraries/",   this.folder + "/code/libraries",    task.progress );
            this.sandBox.inbound = mq.getFolderQueue(this.folder + "/mq/inbound/", task.progress);
            this.sandBox.outbound = mq.getFolderQueue(this.folder + "/mq/outbound/", task.progress);
        }

    },
    runCode: function(err, res){
        if(!err){
            var mainFile = this.folder + "/code/engine/sandbox.js";
            var args = [this.spaceName];
            console.log("Running: ", mainFile, args);
            var child = child_process.fork(mainFile, args);
            this.callback(null, child);
        } else {
            console.log("Error executing sandbox!:", err);
            this.callback(err, null);
        }
    }

});

function SandBoxHandler(spaceName, folder, codeFolder, resultCallBack){

    var self = this;
    var mqHandler;


    bootSandBox().boot(this, spaceName,folder, codeFolder, function(err, childProcess){
        if(!err){
            self.childProcess = childProcess;


            self.outbound.registerConsumer(function(swarm){
                $$.PSK_PubSub.publish($$.CONSTANTS.SWARM_FOR_EXECUTION, swarm);
            });

            mqHandler = self.inbound.getHandler();
            if(pendingMessages.length){
                pendingMessages.map(function(item){
                    self.send(item);
                });
                pendingMessages = null;
            }
        }
    });

    var pendingMessages = [];

    this.send = function (swarm, callback) {
        if(mqHandler){
            mqHandler.sendSwarmForExecution(swarm, callback);
        } else {
            pendingMessages.push(swarm); //TODO: well, a deep clone will not be a better idea?
        }
    }

}


function SandBoxManager(sandboxesFolder, codeFolder, callback){
    var self = this;

    var sandBoxes = {

    };
    function belongsToReplicatedSpace(){
        return true;
    }

    //console.log("Subscribing to:", $$.CONSTANTS.SWARM_FOR_EXECUTION);
    $$.PSK_PubSub.subscribe($$.CONSTANTS.SWARM_FOR_EXECUTION, function(swarm){
        console.log("Executing in sandbox towards: ", swarm.meta.target);

        if(swarm.meta.target == "system"){
            $$.swarmsInstancesManager.revive_swarm(swarm);
            //$$.swarms.restart(swarm.meta.swarmTypeName, swarm);
        } else
        if(swarm.meta.target == "pds"){
            //
        } else
        if(belongsToReplicatedSpace(swarm.meta.target)){
            self.pushToSpaceASwarm(swarm.meta.target, swarm);
        } else {
            //TODO: send towards network
        }

    });


    function startSandBox(spaceName){
        var sandBox = new SandBoxHandler(spaceName, sandboxesFolder + "/" + spaceName, codeFolder);
        sandBoxes[spaceName] = sandBox;
        return sandBox;
    }


    this.pushToSpaceASwarm = function(spaceName, swarm, callback){

        console.log("pushToSpaceASwarm " , spaceName);
        var sandbox = sandBoxes[spaceName];
        if(!sandbox){
            sandbox = sandBoxes[spaceName] = startSandBox(spaceName);
        }
        sandbox.send(swarm, callback);
    }

    callback(null, this);
}


exports.create = function(folder, codeFolder, callback){
    new SandBoxManager(folder, codeFolder, callback);
};


