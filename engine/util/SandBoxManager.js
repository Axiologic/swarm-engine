var mq = require("../pubSub/core/folderMQ");
const path = require('path');
var child_process = require("child_process");

var bootSandBox = $$.flow.describe("PrivateSky.swarm.engine.bootInLauncher", {
    boot:function(sandBox, spaceName, folder, codeFolder, callback){
        this.callback   = callback;
        this.folder     = folder;
        this.spaceName  = spaceName;
        this.sandBox    = sandBox;
        this.codeFolder    = codeFolder;

        var join = this.join(this.ensureFolders);

        join.folderShouldExist(this.folder + "/mq/", join.reportProgress);
        join.folderShouldExist(this.folder + "/code/", join.reportProgress);
        join.folderShouldExist(this.folder + "/tmp/", join.reportProgress);
    },
    folderShouldExist:  function(path, progress){
        $$.ensureFolderExists(path, progress);
    },
    linkShouldExist:    function(existingPath, newPath, progress){
        $$.ensureLinkExists(existingPath, newPath, progress);
    },
    reportProgress:function(err, res){
        //do exactly nothing for now ;)
    },
    ensureFolders: function(err, res){
        var join = this.join(this.runCode);
        join.linkShouldExist(this.folder + "/code/engine",   this.codeFolder + "/engine/",    join.reportProgress );
        join.linkShouldExist(this.folder + "/code/modules",  this.codeFolder + "/modules/",   join.reportProgress );
        join.linkShouldExist(this.folder + "/code/libraries",this.codeFolder + "/libraries/", join.reportProgress );
        this.sandBox.inbound = mq.getFolderQueue(this.folder + "/mq/inbound/", join.reportProgress);
        this.sandBox.outbound = mq.getFolderQueue(this.folder + "/mq/outbound/", join.reportProgress);
    },
    runCode: function(err, res){
        if(!err){
            var mainFile = this.folder + "/code/engine/sandbox.js";
            var args = [this.spaceName];
            console.log("Running: ", mainFile, args);
            //child_process.fork(mainFile, args, this.callback);
        }
    }

});

function SandBoxHandler(spaceName, folder, codeFolder, resultCallBack){

    var self = this;
    var mqHandler;

    bootSandBox().boot(this, spaceName,folder, codeFolder, function(err, childProcess){
        self.childProcess = childProcess;

        this.outbound.registerConsumer(function(swarm){
            $$.PSK_PubSub.publish($$.CONSTANTS.SWARM_FOR_EXECUTION, swarm);
        });

        mqHandler = this.inbound.getHandler();
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


function SandBoxManager(sandboxesFolder, codeFolder){
    var sandBoxes = {

    };

    $$.PSK_PubSub.subscribe($$.CONSTANTS.SWARM_FOR_EXECUTION, function(swarm){
        this.pushToSpaceASwarm(swarm.meta.target, swarm);
    });


    function startSandBox(spaceName, callback){
        var sandBox = new SandBoxHandler(spaceName, sandboxesFolder + "/"+ spaceName, codeFolder);
        sandBoxes[spaceName] = sandBox;
        return sandBox;
    }



    this.pushToSpaceASwarm = function(spaceName, swarm){
        var sandbox = sandBoxes[spaceName];
        if(!sandbox){
            sandbox = sandBoxes[spaceName] = startSandBox();
        }
        sandbox.send(swarm);
    }
}


exports.create = function(folder, codeFolder){
    new SandBoxManager(folder, codeFolder);
};


