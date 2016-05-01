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
        syntaxError:function(msg){
            console.log("Error: ", msg);
        },
        warning:function(msg){
            console.log(msg);
        }
    },
    executionProvider: {
        execute: function(contextInfo, requestedContext, func, args){
            return func.apply(requestedContext, args);
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

    function createPhase(contextInfo, thisInstance, func){
       return function(){
          return swarmGlobals.executionProvider.execute(contextInfo, thisInstance, func, arguments);
       }
    }

    this.initialise = function(context){

        var result = {
            publicVars:{

            },
            privateVars:{

            },
            myFunctions:{

            },
            meta:{
                context:context
            }
        };

        for(var v in publicVars){
            result.publicVars[v] = publicVars[v].init();
        };

        for(var v in privateVars){
            result.privateVars[v] = privateVars[v].init();
        };


        return result;
    };

    this.initialiseFunctions = function(valueObject, context,thisObject){
        for(var v in myFunctions){
            valueObject.myFunctions[v] = createPhase(context,thisObject, myFunctions[v]);
        };
    }

    this.get = function(target, property, receiver){

        if(target.privateVars.hasOwnProperty(property))
        {
            return target.privateVars[property];
        }
        if(target.myFunctions.hasOwnProperty(property))
        {
            return target.myFunctions[property];
        }
        if(target.publicVars.hasOwnProperty(property))
        {
            return target.publicVars[property];
        }
        //console.log("Unknown member ", property );
        //__sge.syntaxError("Unknown member " + property + " in swarm " + name);
        return undefined;
    }

    this.set = function(target, property, value, receiver){

        if(target.privateVars.hasOwnProperty(property))
        {
            target.privateVars[property] = value;
        }
        if(target.publicVars.hasOwnProperty(property))
        {
            target.publicVars[property] = value;
        }
    }

    this.apply = function(target, thisArg, argumentsList){
        console.log("Proxy apply:", target, thisArg, argumentsList);
        //var func = target[]
        //swarmGlobals.executionProvider.execute(null, thisArg, func, argumentsList)
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

    var self = this;
    return function(context){
            var valueObject = self.initialise(context);
            var result = new Proxy(valueObject,self);
            self.initialiseFunctions(valueObject, context,result);
            return result;
    }
}


var descriptions = {

}


exports.describeSwarm = function (name, description){
    var description = new SwarmDescription(name, description)
    if(descriptions[name] != undefined){
        __sge.warning("Duplicate swarm description");
    }

    descriptions[name] != description;
    return description;
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