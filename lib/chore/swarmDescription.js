
require("./safe-uuid");



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

function SwarmDescription(swarmTypeName, description){

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

    function createPhase(thisInstance, func){
        return function(){
            return func.apply(thisInstance, arguments);
        }
    }

    this.initialise = function(){

        var result = {
            publicVars:{

            },
            privateVars:{

            },
            myFunctions:{

            },
            meta:{
                swarmTypeName:swarmTypeName,
                swarmDescription:description
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

    this.initialiseFunctions = function(valueObject, thisObject){

        for(var v in myFunctions){
            valueObject.myFunctions[v] = createPhase(thisObject, myFunctions[v]);
        };

        var continueFunction = function(context, phaseName){
            var args =[];
            for(var i = 2;i < arguments.length; i++){
                args.push(arguments[i]);
            }

            __wait_for_condition(function(tryNumber){
                //console.log(valueObject.meta.swarmId, tryNumber)
                return valueObject.meta.swarmId;
            }, 1024, function(){
                var jsMsg = require("./beesHealer").asJSON(valueObject, phaseName, args);
                console.log(`publish in ${context}:`, jsMsg );
                __PSK_PubSub.publish(context, jsMsg);
            })
        }

        valueObject.myFunctions["swarm"] = continueFunction;
        valueObject.myFunctions["continue"] = continueFunction;

        var asyncReturn = function(err, result){

        }

        valueObject.myFunctions["home"]         = asyncReturn;
        valueObject.myFunctions["asyncReturn"]  = asyncReturn;

        valueObject.myFunctions["getInnerValue"]   = function(){
            return valueObject;
        };

        valueObject.myFunctions["runPhase"] = function(functName, args){
            valueObject.myFunctions[functName].apply(thisObject, args);
        }
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
        __sge.syntaxError("Unknown member " + property + " in swarm " + swarmTypeName);
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
    }

    var self = this;


    this.isExtensible = function(target) {
            return false;
        }

    this.has = function(target, prop) {
        if(publicVars[prop] || myFunctions[prop]) {
            return true;
        }
        return false;
    }


    return function(serialisedValues){
        var valueObject = self.initialise(serialisedValues);
        var result = new Proxy(valueObject,self);
        self.initialiseFunctions(valueObject,result);
        if(!serialisedValues){
            __safe_uuid(function (err, result){
                valueObject.meta.swarmId = result;
            });
        }

        return result;
    }
}


var descriptions = {

}


exports.describeSwarm = function describeSwarm(swarmTypeName, description){
    var description = new SwarmDescription(swarmTypeName, description)
    if(descriptions[swarmTypeName] != undefined){
        __sge.warning("Duplicate swarm description");
    }

    descriptions[swarmTypeName] = description;
    return description;
}

exports.createSwarm = function createSwarm(swarmTypeName, description, initialValues){
    try{
        if(undefined == description){
            return descriptions[swarmTypeName]();
        } else {
            return this.describeSwarm(swarmTypeName, description)(initialValues);
        }
    } catch(err){
        console.log(err);
        __sge.error(err, arguments, "Wrong name or descriptions");
    }
}


var swarmAliveInstances = {

}



function waitForSwarm(swarm, phaseId, callback){
    var swarmId = swarm.getInnerValue().meta.swarmId;
    var watcher = swarmAliveInstances[swarmId];
    if(!watcher){
        watcher = {
            swarm:swarm,
            observers:{}
        }
        swarmAliveInstances[swarmId] = watcher;
    }
    watcher.observers[phaseId] = callback;
}

function cleanSwarmWaiter(phaseId){

}

exports.revive_swarm = function(swarmSerialisation){
    var swarmId     = swarmSerialisation.meta.swarmId;
    var swarmType   = swarmSerialisation.meta.swarmTypeName;
    var instance    = swarmAliveInstances[swarmId];

    var swarm;

    if(instance){
        swarm = instance.swarm;

    }   else {
        swarm = exports.createSwarm(swarmType, undefined, swarmSerialisation);
    }

    if(swarmSerialisation.meta.command == "asyncReturn"){
        cleanSwarmWaiter(swarmSerialisation.meta.phaseId);
    } else     if(swarmSerialisation.meta.command == "executeSwarmPhase"){
        swarm.runPhase(swarmSerialisation.meta.phaseName, swarmSerialisation.meta.args);
    } else {
        console.log("Unknown command in swarmSerialisation.meta.command");
    }

    return swarm;
}