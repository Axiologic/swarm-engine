/*
Initial License: (c) Axiologic Research & Alboaie Sînică.
Contributors: Axiologic Research , PrivateSky project
Code License: LGPL or MIT.
*/

swarmGlobals = {
    errorHandler: {
        error:function(err, args, msg){
            console.log("Wnknown error from function call with arguments:", args, new Error(msg));
        },
        warning:function(msg){
            console.log(msg);
        }
    },
    executionProvider: {
        execute: function(contextInfo, requestedContext, func, args){
            func.apply(requestedContext, args);
        }
    },
    storageProvider: require("./testStorage.js").createMemoryStorage()
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


var currentExecutionContext = {

}

exports.switchExecutionContext = function (newContext){
    currentExecutionContext = newContext;
}

function VarDescription(desc){
    return {
        init:function(){
            return undefined;
        },
        restore:function(jsonString){
            return JSON.parse(jsonString);
        },
        toJsonString:function(x){
            return JSON.stringify();
        }

    };
}

function SwarmDescription(name, description){

    function createVars(descr){
        var members = {};
        for(var v in descr){
                members[v] = new VarDescription(descr[v]);
        }
        return members;
    }

    function createMembers(descr){
        var members = {};
        for(var v in description){

            if(v != "public" && v != "private"){
                members[v] = description[v];
            }
        }
        return members;
    }

    var publicVars = createVars(description.public);
    var privateVars = createVars(description.private);
    var myFunctions = createMembers(description);

    function createPhase(initial, instance){
       return function(){
           initial.apply(instance, arguments)
       }
    }

    this.initialise = function(context){
        var result = {
            publicVars:{

            },
            protectedVars:{

            },
            myFunctions:{

            },
            meta:{
                context:context
            }
        }

        for(var v in publicVars){
            result.publicVars = publicVars[v].init();
        }

        for(var v in privateVars){
            result.privateVars = privateVars[v].init();
        }

        for(var v in myFunctions){
            result.myFunctions = createPhase(myFunctions[v]);
        }
        return result;
    };

    this.get = function(target, property, receiver){

    }

    this.set = function(target, property, value, receiver){

    }

    this.apply = function(target, thisArg, argumentsList){
        swarmGlobals.executionProvider.execute(target)
    },
    this.isExtensible = function(target) {
        return false;
    }

    this.has = function(target, prop) {
        if(publicVars[prop] || myFunctions[prop]) {
            return true;
        }
        return false;
    }

    return function(context){
        var instance = new Proxy(this.initialise(context), this);

    }
}


var descriptions = {

}


exports.describeSwarm = function (name, description){
    var description = new SwarmDescription(name, description)
    if(descriptions[name] != undefined){
        __sge.warning("Duplicate swarm description");
    }

    descriptionsp[name] != undefined
}

exports.createSwarm = function (name, description){
    try{
        if(undefined == description){
            return descriptions[name]();
        } else {
            return this.describeSwarm(name, description)();
        }
    } catch(err){
        __sge.error(err, arguments, "Wrong name or descriptions");
    }
}