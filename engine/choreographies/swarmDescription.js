
function SwarmSpace(swarmType)
{
    require("./safe-uuid");

    var beesHealer = require("./beesHealer");

    var swarmDebug = require("../util/SwarmDebug");

    function getFullName(shortName){
        var fullName;
        if(shortName && shortName.includes(".")) {
            fullName = shortName;
        } else {
            fullName = $$.libraryPrefix + "." + shortName;//TODO: check more about . !?
        }
        //console.log("getFullName:", $$.libraryPrefix, shortName, fullName );
        return fullName;
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

    function SwarmDescription(swarmTypeName, description){

        swarmTypeName = getFullName(swarmTypeName);

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
        var privateVars = createVars(description.private);
        var myFunctions = createMembers(description);

        function createPhase(thisInstance, func){
            return function(){
                var ret;
                try{
                    $$.PSK_PubSub.blockCallBacks();
                    ret = func.apply(thisInstance, arguments);
                    $$.PSK_PubSub.releaseCallBacks();
                }catch(err){
                    $$.PSK_PubSub.releaseCallBacks();
                    throw err;
                }
                return ret;
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

            for(var v in privateVars){
                result.privateVars[v] = privateVars[v].init();
            };


            if(serialisedValues){
                beesHealer.jsonToNative(serialisedValues, result);
            }
            return result;
        };

        function filterForSerialisable (valueObject){
            return valueObject.meta.swarmId;
        }


        this.initialiseFunctions = function(valueObject, thisObject){

            for(var v in myFunctions){
                valueObject.myFunctions[v] = createPhase(thisObject, myFunctions[v]);
            };

            var continueFunction = function(context, phaseName){
                var args =[];
                for(var i = 2;i < arguments.length; i++){
                    args.push(arguments[i]);
                }

                //make the execution at level 0  (after all pending events) and wait to have a swarmId
                valueObject.myFunctions.observe(function(){
                    beesHealer.asJSON(valueObject, phaseName, args, function(err,jsMsg){
                        $$.PSK_PubSub.publish(context, jsMsg);
                    });
                },null,filterForSerialisable);

                valueObject.myFunctions.notify();


                return thisObject;
            };

            valueObject.myFunctions["swarm"] = continueFunction;
            valueObject.myFunctions["continue"] = continueFunction;


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
                        $$.errorHandler.error(new Error("Asynchronous return inside of a swarm that does not wait for results"));
                    } else {
                        $$.PSK_PubSub.publish(context, jsMsg);
                    }
                });
            };

            valueObject.myFunctions["home"]   = function(err, result){
                beesHealer.asJSON(valueObject, "home", [err, result], function(err,jsMsg){
                    var context = valueObject.meta.homeContext;
                    $$.PSK_PubSub.publish(context, jsMsg);
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
                    inner.meta.waitStack.push($$.securityContext)
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
                    $$.errorHandler.syntaxError(functName, valueObject);
                }

            }

            valueObject.myFunctions["update"] = function(serialisation){
                beesHealer.jsonToNative(serialisation,valueObject);
            }


            valueObject.myFunctions["valueOf"] = function valueOf(){
                var ret = {};
                ret.meta                = valueObject.meta;
                ret.publicVars          = valueObject.publicVars;
                ret.privateVars         = valueObject.privateVars;
                ret.protectedVars       = valueObject.protectedVars;
                return ret;
            }

            valueObject.myFunctions["toString"] = thisObject.toString  = function(){
                return swarmDebug.cleanDump(thisObject.valueOf());
            }


            valueObject.myFunctions["join"] = function(callback){
                return require("./JoinPoint").createJoinPoint(thisObject, callback, $$.__intern.mkArgs(arguments,1));
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
                $$.PSK_PubSub.subscribe(valueObject.localId, callback, waitForMore, filter);
            }

            valueObject.myFunctions["toJSON"] = function(callback){
                //make the execution at level 0  (after all pending events) and wait to have a swarmId
                valueObject.myFunctions.observe(function(){
                    beesHealer.asJSON(valueObject, null, null,callback);
                },null,filterForSerialisable);
                valueObject.myFunctions.notify();
            }

            valueObject.myFunctions["notify"] = function(event){
                if(!event){
                    event = valueObject;
                }
                $$.PSK_PubSub.publish(valueObject.localId, event);
            }
        }

        var internalFunctions = { //TODO refactor to put all these functions here instead of the object itself!!!!
            toString:true,
            valueOf:true,
            toJSON:true,
            onReturn:true,
            swarm:true,
            join:true,
            inspect:true,
        }
        function internalFunction(name){
                return internalFunctions[name];

        }

        this.get = function(target, property, receiver){

            if(publicVars.hasOwnProperty(property))
            {
                return target.publicVars[property];
            }

            if(privateVars.hasOwnProperty(property))
            {
                return target.privateVars[property];
            }

            if(myFunctions.hasOwnProperty(property) || internalFunction(property))
            {
                return target.myFunctions[property];
            }

            if(target.protectedVars.hasOwnProperty(property))
            {
                return target.protectedVars[property];
            }

            if(typeof property != "symbol") {
                $$.errorHandler.syntaxError(property, target);
            }
            return undefined;
        }

        this.set = function(target, property, value, receiver){

            if(privateVars.hasOwnProperty(property))
            {
                target.privateVars[property] = value;
            } else
            if(publicVars.hasOwnProperty(property))
            {
                target.publicVars[property] = value;
            } else {
                target.protectedVars[property] = value;
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
                $$.uidGenerator.safe_uuid(function (err, result){
                    if(!valueObject.meta.swarmId){
                        valueObject.meta.swarmId = result;  //do not overwrite!!!
                    }
                    valueObject.myFunctions.notify();
                });
            }

            return result;
        }
    }


    var descriptions = {

    }


    this.describe = function describeSwarm(swarmTypeName, description){
        swarmTypeName = getFullName(swarmTypeName);

        var pointPos = swarmTypeName.lastIndexOf('.');
        var shortName = swarmTypeName.substr( pointPos+ 1);
        var libraryName = swarmTypeName.substr(0, pointPos);
        if(!libraryName){
            libraryName = "global";
        }

        var description = new SwarmDescription(swarmTypeName, description)
        if(descriptions[swarmTypeName] != undefined){
            $$.errorHandler.warning("Duplicate swarm description "+ swarmTypeName);
        }

        descriptions[swarmTypeName] = description;


        $$.registerSwarmDescription(libraryName, shortName, swarmTypeName);
        return description;
    }

    this.create = function createSwarm(swarmTypeName, description, initialValues){
        swarmTypeName = getFullName(swarmTypeName);
        try{
            if(undefined == description){
                return descriptions[swarmTypeName](initialValues);
            } else {
                return this.describe(swarmTypeName, description)(initialValues);
            }
        } catch(err){
            console.log("CreateSwarm error", err);
            $$.errorHandler.error(err, arguments, "Wrong name or descriptions");
        }
    }

    this.restart = function(swarmTypeName, initialValues){
        swarmTypeName = getFullName(swarmTypeName);
        var desc = descriptions[swarmTypeName];
        if(desc){
            return desc(initialValues);
        }
    }

    this.start = function(swarmTypeName){
        swarmTypeName = getFullName(swarmTypeName);
        var desc = descriptions[swarmTypeName];
        if(!desc){
            $$.errorHandler.syntaxError(null, swarmTypeName);
            return null;
        }
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

        //$$.uidGenerator.wait_for_condition(condition,doLogic);
        swarm.observe(doLogic, null, filter);
    }

    function cleanSwarmWaiter(swarmSerialisation){ // TODO: add better mechanisms to prevent memory leaks
        var swarmId = swarmSerialisation.meta.swarmId;
        var watcher = swarmAliveInstances[swarmId];

        if(!watcher){
            $$.errorHandler.warning("Invalid swarm received: " + swarmId);
            return;
        }

        var args = swarmSerialisation.meta.args;
        args.push(swarmSerialisation);

        watcher.callback.apply(null, args);
        if(!watcher.keepAliveCheck()){
            delete swarmAliveInstances[swarmId];
        }
    }

    this.revive_swarm = function(swarmSerialisation){


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

}




exports.createSwarmEngine = function(swarmType){
    return new SwarmSpace(swarmType);
}