/*
Initial License: (c) Axiologic Research & Alboaie Sînică.
Contributors: Axiologic Research , PrivateSky project
Code License: LGPL or MIT.
*/

var path = require("path");

function defaultErrorHandlingImplementation(err, res){
    if(err) throw err;
    return res;
}

$$ = {
    errorHandler: {
        error:function(err, args, msg){
            console.log(err, "Unknown error from function call with arguments:", args, "Message:", msg);
        },
        syntaxError:function(property, swarm, text){
            //throw new Error("Misspelled member name or other internal error!");
            var swarmName;
            try{
                if(typeof swarm == "string"){
                    swarmName = swarm;
                } else
                if(swarm && swarm.meta){
                    swarmName  = swarm.meta.swarmTypeName;
                } else {
                    swarmName = swarm.getInnerValue().meta.swarmTypeName;
                }
            } catch(err){
                swarmName = err.toString();
            }
            if(property){
                console.log("Wrong member name ", property,  " in swarm ", swarmName);
                if(text) {
                    console.log(text);
                }
            } else {
                console.log("Unknown swarm", swarmName);
            }

        },
        warning:function(msg){
            console.log(msg);
        }
    },
    securityContext:"system",
    uidGenerator: require("./choreographies/safe-uuid.js"),
    safeErrorHandling:function(callback){
        if(callback){
            return callback;
        } else{
            return defaultErrorHandlingImplementation;
        }
    },
    libraryPrefix:"global",
    libraries: {
        global:{

        }
    },
    defaultErrorHandlingImplementation:defaultErrorHandlingImplementation,
    __intern:{
        mkArgs:function(args,pos){
            var argsArray = [];
            for(var i = pos; i < args.length; i++){
                argsArray.push(args[i]);
            }
            return argsArray;
        }
    }
};

$$.registerSwarmDescription =  function(libraryName,shortName, description){
    if(!$$.libraries[libraryName]){
        $$.libraries[libraryName] = {};
    }
    $$.libraries[libraryName][shortName] = description;
}


var swarmDescr = require("./choreographies/swarmDescription");


$$.callflows        = swarmDescr.createSwarmEngine("callflow");
$$.callflow         = $$.callflows;
$$.flow             = $$.callflows;
$$.flows            = $$.callflows;
$$.swarms           = swarmDescr.createSwarmEngine("swarm");
$$.swarm            = $$.swarms;
$$.contracts        = swarmDescr.createSwarmEngine("contract");
$$.contract         = $$.contracts;

$$.loadLibrary      = require("./util/loadLibrary").loadLibrary;

exports.enableTesting = function() {
    //$$.PSK_PubSub = require("./pubSub/InternalPubSub").internalBus;
    $$.PSK_PubSub = require("./pubSub/core/soundPubSub").soundPubSub;  //for testing

    require("./fakes/dummyVM");
    return exports;
}

var loadedModules = {

}

$$.requireModule = function(name){
    var existingModule = loadedModules[name];
    if(!existingModule){
        var absolutePath = path.resolve( __dirname + "/../modules/" + name);
        existingModule = require(absolutePath);
        loadedModules[name] = existingModule;
    } else {
        return existingModule;
    }
}


var fs = require("fs");

$$.ensureFolderExists = function(folder, callback){
    fs.exists(folder, function(res){
            if(!res){
                fs.mkdir(folder, callback);
            }
        });
}


$$.ensureLinkExists = function(existingPath, newPath, callback){
    fs.exists(newPath, function(res){
        if(!res){
            fs.ln(existingPath, newPath, callback);
        }
    });
}


$$.CONSTANTS = {
    SWARM_FOR_EXECUTION:"swarm_for_execution",
    INBOUND:"inbound",
    OUTBOUND:"outbound",
    PDS:"PrivateDataSystem",
    CRL:"CommunicationReplicationLayer"
}