
require("./safe-uuid");

var beesHealer = require("./beesHealer");

var swarmDebug = require("../SwarmDebug");


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

    var localId = 0;  // unique for each swarm

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
    var protectedVars = createVars(description.protected);
    var myFunctions = createMembers(description);

    function createPhase(thisInstance, func){
        return function(){
            return func.apply(thisInstance, arguments);
        }
    }

    this.initialise = function(serialisedValues){

        var result = {
            publicVars:{

            },
            privateVars:{

            },
            protectedVars:{

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

        for(var v in protectedVars){
            result.protectedVars[v] = protectedVars[v].init();
        };


        if(serialisedValues){
            beesHealer.jsonToNative(serialisedValues, result);
        }
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

            /*
            var lastArg = arguments[arguments.length -1];

            if(typeof lastArg == "function"){
                arguments.pop();
            }*/

            function filter (){
                return valueObject.meta.swarmId;
            }

            valueObject.myFunctions.observe(function(){  //make the execution at level 0  (after all pending events) and wait to have a swarmId
                beesHealer.asJSON(valueObject, phaseName, args, function(err,jsMsg){
                    __swarmGlobals.PSK_PubSub.publish(context, jsMsg);
                });
            },null,filter);

            valueObject.myFunctions.notify();


            return thisObject;
        };

        valueObject.myFunctions["swarm"] = continueFunction;
        valueObject.myFunctions["continue"] = continueFunction;

        /*valueObject.myFunctions["toString "] = function(){
            return valueObject.toString();
        }*/

        var asyncReturn = function(err, result){
            var context = valueObject.protectedVars.context;

            if(!context && valueObject.meta.waitStack){
                context = valueObject.meta.waitStack.pop();
                valueObject.protectedVars.context = context;
            }


            beesHealer.asJSON(valueObject, "__return__", [err, result], function(err,jsMsg){
                jsMsg.meta.command = "asyncReturn";

                if(!context){
                    context = valueObject.meta.homeSecurityContext;//TODO: CHECK THIS
                }

                if(!context){
                    __swarmGlobals.errorHandler.error(new Error("Asynchronous return inside of a swarm that does not wait for results"));
                } else {
                    __swarmGlobals.PSK_PubSub.publish(context, jsMsg);
                }
            });
        };

        valueObject.myFunctions["home"]   = function(err, result){
            beesHealer.asJSON(valueObject, "home", [err, result], function(err,jsMsg){
                var context = valueObject.meta.homeContext;
                __swarmGlobals.PSK_PubSub.publish(context, jsMsg);
            });
         };

        valueObject.myFunctions["asyncReturn"]  = asyncReturn;
        valueObject.myFunctions["return"]       = asyncReturn;

        function waitResults(callback, keepAliveCheck, swarm){
            if(!swarm){
                swarm = this;
            }
            if(!keepAliveCheck){
                keepAliveCheck = function(){
                    return false;
                }
            }
            var inner = swarm.getInnerValue();
            if(!inner.meta.waitStack){
                inner.meta.waitStack = [];
                inner.meta.waitStack.push(__swarmGlobals.securityContext)
            }
            waitForSwarm(callback, swarm, keepAliveCheck);
        }

        valueObject.myFunctions["onReturn"]  = waitResults;
        valueObject.myFunctions["onResult"]  = waitResults;

        valueObject.myFunctions["getInnerValue"]   = function(){
            return valueObject;
        };

        valueObject.myFunctions["runPhase"] = function(functName, args){
            var func = valueObject.myFunctions[functName];
            if(func){
                func.apply(thisObject, args);
            } else {
                __swarmGlobals.errorHandler.syntaxError(functName, valueObject);
            }

        }

        valueObject.myFunctions["update"] = function(serialisation){
            beesHealer.jsonToNative(serialisation,valueObject);
        }


        valueObject.myFunctions["valueOf"] = function valueOf(){
            var ret = {};
            ret.meta        = valueObject.meta;
            ret.public      = valueObject.publicVars;
            ret.private     = valueObject.privateVars;
            ret.protected   = valueObject.protectedVars;
            return ret;
        }

        valueObject.myFunctions["toString"] /*= thisObject.toString */ = function(){
            return swarmDebug.cleanDump(thisObject.valueOf());
        }

        valueObject.myFunctions["inspect"] /*= thisObject.inspect*/ = function(){
            return swarmDebug.cleanDump(thisObject.valueOf());
        }

        valueObject.myFunctions["constructor"] /*= thisObject.constructor */= function(){
            return SwarmDescription;
        }


        valueObject.myFunctions["observe"] = function (callback, waitForMore, filter){
            if(!waitForMore){
                waitForMore = function (){
                    return false;
                }
            }

            if(!valueObject.localId){
                valueObject.localId = swarmTypeName + "-" + localId;
                localId++;
            }
            __swarmGlobals.PSK_PubSub.subscribe(valueObject.localId, callback, waitForMore, filter);
        }

        valueObject.myFunctions["notify"] = function(event){
            if(!event){
                event = valueObject;
            }
            __swarmGlobals.PSK_PubSub.publish(valueObject.localId, event);
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

        if(typeof property != "symbol") {
            __swarmGlobals.errorHandler.syntaxError(property, target);
        }
        return undefined;
    }

    this.set = function(target, property, value, receiver){

        if(target.protectedVars.hasOwnProperty(property))
        {
            target.protectedVars[property] = value;
        }
        if(target.publicVars.hasOwnProperty(property))
        {
            target.publicVars[property] = value;
        } else {
            target.privateVars[property] = value;
        }
    }

    this.apply = function(target, thisArg, argumentsList){
        console.log("Proxy apply");
        //var func = target[]
        //swarmGlobals.executionProvider.execute(null, thisArg, func, argumentsList)
    }

    var self = this;


    this.isExtensible = function(target) {
            return false;
        }

    this.has = function(target, prop) {
        if(target.publicVars[prop] || target.protectedVars[prop]) {
            return true;
        }
        return false;
    }

    this.ownKeys = function(target) {
        return Reflect.ownKeys(target.publicVars);
    }


    return function(serialisedValues){
        var valueObject = self.initialise(serialisedValues);
        var result = new Proxy(valueObject,self);
        self.initialiseFunctions(valueObject,result);
        if(!serialisedValues){
            __swarmGlobals.uidGenerator.safe_uuid(function (err, result){
                valueObject.meta.swarmId = result;
                valueObject.myFunctions.notify();
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
            return descriptions[swarmTypeName](initialValues);
        } else {
            return this.describeSwarm(swarmTypeName, description)(initialValues);
        }
    } catch(err){
        console.log("CreateSwarm error", err);
        __sge.error(err, arguments, "Wrong name or descriptions");
    }
}

exports.restartSwarm = function(swarmTypeName, initialValues){
    var desc = descriptions[swarmTypeName];
    if(desc){
        return desc(initialValues);
    }
}

exports.startSwarm = function(swarmTypeName){
    var desc = descriptions[swarmTypeName];
    var res = desc();

    if(arguments.length > 1){
        var args =[];
        for(var i = 1;i < arguments.length; i++){
            args.push(arguments[i]);
        }
        res.swarm.apply(res, args);
    }

    return res;
}


var swarmAliveInstances = {

}



function waitForSwarm(callback, swarm, keepAliveCheck){

    function doLogic(){
        var swarmId = swarm.getInnerValue().meta.swarmId;
        var watcher = swarmAliveInstances[swarmId];
        if(!watcher){
            watcher = {
                swarm:swarm,
                callback:callback,
                keepAliveCheck:keepAliveCheck
            }
            swarmAliveInstances[swarmId] = watcher;
        }
    }

    function filter(){
        return swarm.getInnerValue().meta.swarmId;
    }

    //__swarmGlobals.uidGenerator.wait_for_condition(condition,doLogic);
    swarm.observe(doLogic, null, filter);
}

function cleanSwarmWaiter(swarmSerialisation){ // TODO: add better mechanisms to prevent memory leaks
    var swarmId = swarmSerialisation.meta.swarmId;
    var watcher = swarmAliveInstances[swarmId];

    if(!watcher){
        __swarmGlobals.errorHandler.warning("Invalid swarm received: " + swarmId);
        return;
    }

    var args = swarmSerialisation.meta.args;
    args.push(swarmSerialisation);

    watcher.callback.apply(null, args);
    if(!watcher.keepAliveCheck()){
        delete swarmAliveInstances[swarmId];
    }
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
        cleanSwarmWaiter(swarmSerialisation);
    } else     if(swarmSerialisation.meta.command == "executeSwarmPhase"){
        swarm.runPhase(swarmSerialisation.meta.phaseName, swarmSerialisation.meta.args);
    } else {
        console.log("Unknown command in swarmSerialisation.meta.command");
    }

    return swarm;
}