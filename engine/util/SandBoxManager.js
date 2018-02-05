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

        var join = this.join(this.ensureFolders);

        this.folderShouldExist(this.folder + "/mq/",    join.progress);
        this.folderShouldExist(this.folder + "/code/",  join.progress);
        this.folderShouldExist(this.folder + "/tmp/",   join.progress);

        console.log("Booting: ", this.spaceName);
    },
    folderShouldExist:  function(path, progress){
        $$.ensureFolderExists(path, progress);
    },
    linkShouldExist:    function(existingPath, newPath, progress){
        $$.ensureLinkExists(existingPath, newPath, progress);
    },
    ensureFolders: function(err, res){
        if(err){
            console.log(err);
        } else {
            var join = this.join(this.runCode);
            this.linkShouldExist(this.codeFolder + "/engine/",      this.folder + "/code/engine",       join.progress );
            this.linkShouldExist(this.codeFolder + "/modules/",     this.folder + "/code/modules",      join.progress );
            this.linkShouldExist(this.codeFolder + "/libraries/",   this.folder + "/code/libraries",    join.progress );
            this.sandBox.inbound = mq.getFolderQueue(this.folder + "/mq/inbound/", join.progress);
            this.sandBox.outbound = mq.getFolderQueue(this.folder + "/mq/outbound/", join.progress);
        }

    },
    runCode: function(err, res){
        if(!err){
            var mainFile = this.folder + "/code/engine/sandbox.js";
            var args = [this.spaceName];
            //console.log("Running: ", mainFile, args);
            var child = child_process.fork(mainFile, args);

            this.callback(err, child);
        } else {
            console.log(err);
        }
    }

});

function SandBoxHandler(spaceName, folder, codeFolder, resultCallBack){

    var self = this;
    var mqHandler;

    bootSandBox().boot(this, spaceName,folder, codeFolder, function(err, childProcess){
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
    });

    var pendingMessages = [];

    this.send = function (swarm, callback) {
        if(mqHandler){
            mqHandler.addSwarm(swarm, callback);
        } else {
            pendingMessages.push(swarm); //TODO: well, a clone will not be better?
        }
    }

}


function SandBoxManager(sandboxesFolder, codeFolder, callback){
    var self = this;

    var sandBoxes = {

    };

    //console.log("Subscribing to:", $$.CONSTANTS.SWARM_FOR_EXECUTION);
    $$.PSK_PubSub.subscribe($$.CONSTANTS.SWARM_FOR_EXECUTION, function(swarm){
        console.log("Executing in sandbox towards: ", swarm.meta.target);
        self.pushToSpaceASwarm(swarm.meta.target, swarm);
    });


    function startSandBox(spaceName){
        var sandBox = new SandBoxHandler(spaceName, sandboxesFolder + "/" + spaceName, codeFolder);
        sandBoxes[spaceName] = sandBox;
        return sandBox;
    }


    this.pushToSpaceASwarm = function(spaceName, swarm, callback){
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


