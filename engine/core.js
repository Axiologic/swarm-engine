/*
Initial License: (c) Axiologic Research & Alboaie Sînică.
Contributors: Axiologic Research , PrivateSky project
Code License: LGPL or MIT.
*/

var path = require("path");

function defaultErrorHandlingImplementation(err, res){
    //console.log(err.stack);
    if(err) throw err;
    return res;
}

$$ = {
    errorHandler: {
        error:function(err, args, msg){
            console.log(err, "Unknown error from function call with arguments:", args, "Message:", msg);
        },
        throwError:function(err, args, msg){
            console.log(err, "Unknown error from function call with arguments:", args, "Message:", msg);
            throw err;
        },
        ignorePossibleError: function(name){
            console.log(name);
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
    }
    return existingModule;
}

$$.requireLibrary = function(name){
    var absolutePath = path.resolve( __dirname + "/../libraries/" + name);
    return $$.loadLibrary(name,absolutePath);
}


var core = $$.requireLibrary("core");


$$.ensureFolderExists = function(folder, callback){

    var flow = $$.flow.start(core.mkDirRec);
    flow.make(folder, callback);

}


$$.ensureLinkExists = function(existingPath, newPath, callback){

    var flow = $$.flow.start(core.mkDirRec);
    flow.makeLink(existingPath, newPath, callback);
}




