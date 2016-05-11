/*
Initial License: (c) Axiologic Research & Alboaie Sînică.
Contributors: Axiologic Research , PrivateSky project
Code License: LGPL or MIT.
*/

var swarmDescr = require("./chore/swarmDescription");

__PSK_PubSub = require("./chore/InternalPubSub").internalBus;

var vms = require("./chore/dummyVM");


swarmGlobals = {
    errorHandler: {
        error:function(err, args, msg){
            console.log("Wnknown error from function call with arguments:", args, new Error(msg));
        },
        syntaxError:function(msg){
            console.log("Error: ", msg);
        },
        warning:function(msg){
            console.log(msg);
        }
    }
}

__sge = swarmGlobals.errorHandler;



exports.setErrorHandler = function(errorHandler){
    swarmGlobals.errorHandler = errorHandler;
}


exports.setExecutionProvider = function(executionProvider ){
    swarmGlobals.executionProvider  = executionProvider ;
}

exports.setStorageProvider = function(executionProvider){
    swarmGlobals.executionProvider  = executionProvider;
}


exports.describeSwarm    = swarmDescr.describeSwarm;
exports.createSwarm      = swarmDescr.createSwarm;
