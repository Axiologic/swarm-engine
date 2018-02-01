var mq = require("../pubSub/core/folderMQ");
const path = require('path');
var child_process = require("child_process");

var bootSandBox = $$.flow.describe("PrivateSky.swarm.engine.bootInLauncher", {
    boot:function(sandBox, spaceName, folder, codeFolder, callback){
        this.callback   = callback;
        this.folder     = folder;
        this.spaceName  = spaceName;
        this.sandBox    = sandBox;

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
        join.linkShouldExist(this.folder + "/code/engine",   codeFolder + "/engine/",    join.reportProgress );
        join.linkShouldExist(this.folder + "/code/modules",  codeFolder + "/modules/",   join.reportProgress );
        join.linkShouldExist(this.folder + "/code/libraries",codeFolder + "/libraries/", join.reportProgress );
        this.sandBox.pdsQueue = mq.getFolderQueue(this.folder + "/mq/pds/", join.reportProgress);
        this.sandBox.crlQueue = mq.getFolderQueue(this.folder + "/mq/crl/", join.reportProgress);
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

function SandBox(spaceName, folder, codeFolder, resultCallBack){

    var self = this;

    bootSandBox().boot(this, spaceName,folder, codeFolder, function(err, childProcess){
        self.childProcess = childProcess;
    });



}


function SandBoxManager(sandboxesFolder, codeFolder){
    var sandBoxes = {

    };


    this.enableSpaces = function(arr){
        arr.forEach(function(item){
            $$.PSK_PubSub.subscribe(item);
        })
    }

    this.startSandBox = function(spaceName, callback){
        var sandBox = new SandBox(spaceName, sandboxesFolder + "/"+ spaceName, codeFolder);
        sandBoxes[spaceName] = sandBox;
        return sandBox;
    }

    function pendingMessages(){

    }

    this.pushMessage(spaceName){

    }
}


exports.create = function(folder, codeFolder){
    new SandBoxManager(folder, codeFolder);
};


