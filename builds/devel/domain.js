require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
;$$.__runtimeModules["localNode"] = require("localNode");
$$.__runtimeModules["pds"] = require("pds");
$$.__runtimeModules["domain"] = require("domain");

},{"domain":undefined,"localNode":2,"pds":3}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],4:[function(require,module,exports){
/*
Initial License: (c) Axiologic Research & Alboaie Sînică.
Contributors: Axiologic Research , PrivateSky project
Code License: LGPL or MIT.
*/

var util = require("util");
var fs = require("fs");
global.cprint = console.log;
global.wprint = console.warn;
global.dprint = console.debug;
global.eprint = console.error;


/**
 * Shortcut to JSON.stringify
 * @param obj
 */
global.J = function (obj) {
    return JSON.stringify(obj);
}


/**
 * Print swarm contexts (Messages) and easier to read compared with J
 * @param obj
 * @return {string}
 */
exports.cleanDump = function (obj) {
    var o = obj.valueOf();
    var meta = {
        swarmTypeName:o.meta.swarmTypeName
    };
    return "\t swarmId: " + o.meta.swarmId + "{\n\t\tmeta: "    + J(meta) +
        "\n\t\tpublic: "        + J(o.publicVars) +
        "\n\t\tprotected: "     + J(o.protectedVars) +
        "\n\t\tprivate: "       + J(o.privateVars) + "\n\t}\n";
}

//M = exports.cleanDump;
/**
 * Experimental functions
 */


/*

logger      = monitor.logger;
assert      = monitor.assert;
throwing    = monitor.exceptions;


var temporaryLogBuffer = [];

var currentSwarmComImpl = null;

logger.record = function(record){
    if(currentSwarmComImpl===null){
        temporaryLogBuffer.push(record);
    } else {
        currentSwarmComImpl.recordLog(record);
    }
}

var container = require("dicontainer").container;

container.service("swarmLoggingMonitor", ["swarmingIsWorking", "swarmComImpl"], function(outOfService,swarming, swarmComImpl){

    if(outOfService){
        if(!temporaryLogBuffer){
            temporaryLogBuffer = [];
        }
    } else {
        var tmp = temporaryLogBuffer;
        temporaryLogBuffer = [];
        currentSwarmComImpl = swarmComImpl;
        logger.record = function(record){
            currentSwarmComImpl.recordLog(record);
        }

        tmp.forEach(function(record){
            logger.record(record);
        });
    }
})

*/
global.uncaughtExceptionString = "";
global.uncaughtExceptionExists = false;
if(typeof global.globalVerbosity == 'undefined'){
    global.globalVerbosity = false;
}

var DEBUG_START_TIME = new Date().getTime();

function getDebugDelta(){
    var currentTime = new Date().getTime();
    return currentTime - DEBUG_START_TIME;
}

/**
 * Debug functions, influenced by globalVerbosity global variable
 * @param txt
 */
dprint = function (txt) {
    if (globalVerbosity == true) {
        if (thisAdapter.initilised ) {
            console.log("DEBUG: [" + thisAdapter.nodeName + "](" + getDebugDelta()+ "):"+txt);
        }
        else {
            console.log("DEBUG: (" + getDebugDelta()+ "):"+txt);
            console.log("DEBUG: " + txt);
        }
    }
}

/**
 * obsolete!?
 * @param txt
 */
global.aprint = function (txt) {
    console.log("DEBUG: [" + thisAdapter.nodeName + "]: " + txt);
}



/**
 * Utility function usually used in tests, exit current process after a while
 * @param msg
 * @param timeout
 */
global.delayExit = function (msg, retCode,timeout) {
    if(retCode == undefined){
        retCode = ExitCodes.UnknownError;
    }

    if(timeout == undefined){
        timeout = 100;
    }

    if(msg == undefined){
        msg = "Delaying exit with "+ timeout + "ms";
    }

    console.log(msg);
    setTimeout(function () {
        process.exit(retCode);
    }, timeout);
}


function localLog (logType, message, err) {
    var time = new Date();
    var now = time.getDate() + "-" + (time.getMonth() + 1) + "," + time.getHours() + ":" + time.getMinutes();
    var msg;

    msg = '[' + now + '][' + thisAdapter.nodeName + '] ' + message;

    if (err != null && err != undefined) {
        msg += '\n     Err: ' + err.toString();
        if (err.stack && err.stack != undefined)
            msg += '\n     Stack: ' + err.stack + '\n';
    }

    cprint(msg);
    if(thisAdapter.initilised){
        try{
            fs.appendFileSync(getSwarmFilePath(thisAdapter.config.logsPath + "/" + logType), msg);
        } catch(err){
            console.log("Failing to write logs in ", thisAdapter.config.logsPath );
        }

    }
}


global.printf = function (...params) {
    var args = []; // empty array
    // copy all other arguments we want to "pass through"
    for (var i = 0; i < params.length; i++) {
        args.push(params[i]);
    }
    var out = util.format.apply(this, args);
    console.log(out);
}

global.sprintf = function (...params) {
    var args = []; // empty array
    for (var i = 0; i < params.length; i++) {
        args.push(params[i]);
    }
    return util.format.apply(this, args);
}


},{"fs":undefined,"util":undefined}],5:[function(require,module,exports){


function SwarmsInstancesManager(){
    var swarmAliveInstances = {

    }

    this.waitForSwarm = function(callback, swarm, keepAliveCheck){

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
            swarm = $$.swarm.create(swarmType, undefined, swarmSerialisation);
        }

        if(swarmSerialisation.meta.command == "asyncReturn"){
            cleanSwarmWaiter(swarmSerialisation);
        } else     if(swarmSerialisation.meta.command == "executeSwarmPhase"){
            swarm.runPhase(swarmSerialisation.meta.phaseName, swarmSerialisation.meta.args);
        } else {
            console.log("Unknown command",swarmSerialisation.meta.command, "in swarmSerialisation.meta.command");
        }

        return swarm;
    }
}


$$.swarmsInstancesManager = new SwarmsInstancesManager();



},{}],6:[function(require,module,exports){
var beesHealer = $$.require("soundpubsub").beesHealer;
var swarmDebug = require("../SwarmDebug");

exports.createForObject = function(valueObject, thisObject, localId){
	var ret = {};

	function filterForSerialisable (valueObject){
		return valueObject.meta.swarmId;
	}

	var swarmFunction = function(context, phaseName){
		var args =[];
		for(var i = 2; i < arguments.length; i++){
			args.push(arguments[i]);
		}

		//make the execution at level 0  (after all pending events) and wait to have a swarmId
		ret.observe(function(){
			beesHealer.asJSON(valueObject, phaseName, args, function(err,jsMsg){
				jsMsg.meta.target = context;
				$$.PSK_PubSub.publish($$.CONSTANTS.SWARM_FOR_EXECUTION, jsMsg);
			});
		},null,filterForSerialisable);

		ret.notify();


		return thisObject;
	};

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
			jsMsg.meta.target = context;

			if(!context){
				$$.errorHandler.error(new Error("Asynchronous return inside of a swarm that does not wait for results"));
			} else {
				$$.PSK_PubSub.publish($$.CONSTANTS.SWARM_FOR_EXECUTION, jsMsg);
			}
		});
	};

	function home(err, result){
		beesHealer.asJSON(valueObject, "home", [err, result], function(err,jsMsg){
			var context = valueObject.meta.homeContext;
			jsMsg.meta.target = context;
			$$.PSK_PubSub.publish($$.CONSTANTS.SWARM_FOR_EXECUTION, jsMsg);
		});
	}



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
		$$.swarmsInstancesManager.waitForSwarm(callback, swarm, keepAliveCheck);
	}


	function getInnerValue(){
		return valueObject;
	}

	function runPhase(functName, args){
		var func = valueObject.myFunctions[functName];
		if(func){
			func.apply(thisObject, args);
		} else {
			$$.errorHandler.syntaxError(functName, valueObject, "Function " + functName + " does not exist!");
		}

	}

	function update(serialisation){
		beesHealer.jsonToNative(serialisation,valueObject);
	}


	function valueOf(){
		var ret = {};
		ret.meta                = valueObject.meta;
		ret.publicVars          = valueObject.publicVars;
		ret.privateVars         = valueObject.privateVars;
		ret.protectedVars       = valueObject.protectedVars;
		return ret;
	}

	function toString (){
		return swarmDebug.cleanDump(thisObject.valueOf());
	}


	function createParallel(callback){
		return require("../../parallelJoinPoint").createJoinPoint(thisObject, callback, $$.__intern.mkArgs(arguments,1));
	}

	function createSerial(callback){
		return require("../../serialJoinPoint").createSerialJoinPoint(thisObject, callback, $$.__intern.mkArgs(arguments,1));
	}

	function inspect(){
		return swarmDebug.cleanDump(thisObject.valueOf());
	}

	function constructor(){
		return SwarmDescription;
	}

	function ensureLocalId(){
		if(!valueObject.localId){
			valueObject.localId = valueObject.meta.swarmTypeName + "-" + localId;
			localId++;
		}
	}

	function observe(callback, waitForMore, filter){
		if(!waitForMore){
			waitForMore = function (){
				return false;
			}
		}

		ensureLocalId();

		$$.PSK_PubSub.subscribe(valueObject.localId, callback, waitForMore, filter);
	}

	function toJSON(prop){
		//preventing max call stack size exceeding on proxy auto referencing
		//replace {} as result of JSON(Proxy) with the string [Object protected object]
		return "[Object protected object]";
	}

	function getJSONasync(callback){
		//make the execution at level 0  (after all pending events) and wait to have a swarmId
		ret.observe(function(){
			beesHealer.asJSON(valueObject, null, null,callback);
		},null,filterForSerialisable);
		ret.notify();
	}

	function notify(event){
		if(!event){
			event = valueObject;
		}
		ensureLocalId();
		$$.PSK_PubSub.publish(valueObject.localId, event);
	}

	ret.swarm           = swarmFunction;
	ret.notify          = notify;
	ret.getJSONasync    = getJSONasync;
	ret.toJSON          = toJSON;
	ret.observe         = observe;
	ret.inspect         = inspect;
	ret.join            = createParallel;
	ret.parallel        = createParallel;
	ret.serial          = createSerial;
	ret.valueOf         = valueOf;
	ret.update          = update;
	ret.runPhase        = runPhase;
	ret.onReturn        = waitResults;
	ret.onResult        = waitResults;
	ret.asyncReturn     = asyncReturn;
	ret.return          = asyncReturn;
	ret.getInnerValue   = getInnerValue;
	ret.home            = home;
	ret.toString        = toString;
	ret.constructor     = constructor;

	return ret;

};
},{"../../parallelJoinPoint":10,"../../serialJoinPoint":12,"../SwarmDebug":4}],7:[function(require,module,exports){
exports.createForObject = function(valueObject, thisObject, localId){
	var ret = require("./base").createForObject(valueObject, thisObject, localId);

	ret.swarm           = null;
	ret.onReturn        = null;
	ret.onResult        = null;
	ret.asyncReturn     = null;
	ret.return          = null;
	ret.home            = null;

	return ret;
};
},{"./base":6}],8:[function(require,module,exports){
exports.createForObject = function(valueObject, thisObject, localId){
	return require("./base").createForObject(valueObject, thisObject, localId);
};
},{"./base":6}],9:[function(require,module,exports){
/*
Initial License: (c) Axiologic Research & Alboaie Sînică.
Contributors: Axiologic Research , PrivateSky project
Code License: LGPL or MIT.
*/

//var fs = require("fs");
//var path = require("path");

function wrapCall(original, prefixName){
    return function(...args){
        //console.log("prefixName", prefixName)
        var previousPrefix = $$.libraryPrefix;
        $$.libraryPrefix = prefixName;
        try{
            var ret = original.apply(this, args);
            $$.libraryPrefix = previousPrefix ;
        }catch(err){
            $$.libraryPrefix = previousPrefix ;
            throw err;
        }
        return ret;
    }
}

function SwarmLibrary(prefixName, folder){
    $$.libraries[prefixName] = this;
    var prefixedRequire = wrapCall(function(path){
        return require(path);
    }, prefixName);

    function includeAllInRoot(folder) {
        return $$.require(folder); // a library is just a module
        //var stat = fs.statSync(path);
        /*var files = fs.readdirSync(folder);
        files.forEach(function(fileName){
            //console.log("Loading ", fileName);
            var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
            if(ext.toLowerCase() == "js"){
                try {
                    var fullPath = path.resolve(folder + "/" + fileName);
                    prefixedRequire(fullPath);
                }catch(e){
                    throw e;
                }
            }
        })*/
    }

    var self = this;

    function wrapSwarmRelatedFunctions(space, prefixName){
        var ret = {};
        var names = ["create", "describe", "start", "restart"];
        for(var i = 0; i<names.length; i++ ){
            ret[names[i]] = wrapCall(space[names[i]], prefixName);
        }
        return ret;
    }

    this.callflows        = this.callflow   = wrapSwarmRelatedFunctions($$.callflows, prefixName);
    this.swarms           = this.swarm      = wrapSwarmRelatedFunctions($$.swarms, prefixName);
    this.contracts        = this.contract   = wrapSwarmRelatedFunctions($$.contracts, prefixName);
    includeAllInRoot(folder, prefixName);
}

exports.loadLibrary = function(prefixName, folder){
    var existing = $$.libraries[prefixName];
    if(existing ){
        if(folder) {
            $$.errorHandler.warning("Reusing already loaded library " + prefixName + "could be an error!");
        }
        return existing;
    }
    //var absolutePath = path.resolve(folder);
    return new SwarmLibrary(prefixName, folder);
}
},{}],10:[function(require,module,exports){

var joinCounter = 0;

function ParallelJoinPoint(swarm, callback, args){
    joinCounter++;
    var channelId = "ParallelJoinPoint" + joinCounter;
    var self = this;
    var counter = 0;
    var stopOtherExecution     = false;

    function executionStep(stepFunc, localArgs, stop){

        this.doExecute = function(){
            if(stopOtherExecution){
                return false;
            }
            try{
                stepFunc.apply(swarm, localArgs);
                if(stop){
                    stopOtherExecution = true;
                    return false;
                }
                return true; //everyting is fine
            } catch(err){
                args.unshift(err);
                sendForSoundExecution(callback, args, true);
                return false; //stop it, do not call again anything
            }
        }
    }

    if(typeof callback !== "function"){
        $$.errorHandler.syntaxError("invalid join",swarm, "invalid function at join in swarm");
        return;
    }

    $$.PSK_PubSub.subscribe(channelId,function(forExecution){
        if(stopOtherExecution){
            return ;
        }

        try{
            if(forExecution.doExecute()){
                decCounter();
            } // had an error...
        } catch(err){
            //console.log(err);
            //$$.errorHandler.syntaxError("__internal__",swarm, "exception in the execution of the join function of a parallel task");
        }
    });

    function incCounter(){
        if(testIfUnderInspection()){
            //preventing inspector from increasing counter when reading the values for debug reason
            //console.log("preventing inspection");
            return;
        }
        counter++;
    }

    function testIfUnderInspection(){
        var res = false;
        var constArgv = process.execArgv.join();
        if(constArgv.indexOf("inspect")!==-1 || constArgv.indexOf("debug")!==-1){
            //only when running in debug
            var callstack = new Error().stack;
            if(callstack.indexOf("DebugCommandProcessor")!==-1){
                console.log("DebugCommandProcessor detected!");
                res = true;
            }
        }
        return res;
    }

    function sendForSoundExecution(funct, args, stop){
        var obj = new executionStep(funct, args, stop);
        $$.PSK_PubSub.publish(channelId, obj); // force execution to be "sound"
    }

    function decCounter(){
        counter--;
        if(counter == 0) {
            args.unshift(null);
            sendForSoundExecution(callback, args, false);
        }
    }

    var inner = swarm.getInnerValue();

    function defaultProgressReport(err, res){
        if(err) {
            throw err;
        }
        return {
            text:"Parallel execution progress event",
            swarm:swarm,
            args:args,
            currentResult:res
        };
    }

    function mkFunction(name){
        return function(...args){
            var f = defaultProgressReport;
            if(name != "progress"){
                f = inner.myFunctions[name];
            }
            var args = $$.__intern.mkArgs(args, 0);
            sendForSoundExecution(f, args, false);
            return __proxyObject;
        }
    }


    this.get = function(target, prop, receiver){
        if(inner.myFunctions.hasOwnProperty(prop) || prop == "progress"){
            incCounter();
            return mkFunction(prop);
        }
        return swarm[prop];
    };

    var __proxyObject;

    this.__setProxyObject = function(p){
        __proxyObject = p;
    }
}

exports.createJoinPoint = function(swarm, callback, args){
    var jp = new ParallelJoinPoint(swarm, callback, args);
    var inner = swarm.getInnerValue();
    var p = new Proxy(inner, jp);
    jp.__setProxyObject(p);
    return p;
};
},{}],11:[function(require,module,exports){

function encode(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '')
        .replace(/\//g, '')
        .replace(/=+$/, '');
};

function stampWithTime(buf, salt, msalt){
    if(!salt){
        salt = 1;
    }
    if(!msalt){
        msalt = 1;
    }
    var date = new Date;
    var ct = Math.floor(date.getTime() / salt);
    var counter = 0;
    while(ct > 0 ){
        //console.log("Counter", counter, ct);
        buf[counter*msalt] = Math.floor(ct % 256);
        ct = Math.floor(ct / 256);
        counter++;
    }
}

/*
    The uid contains around 256 bits of randomness and are unique at the level of seconds. This UUID should by cryptographically safe (can not be guessed)

    We generate a safe UID that is guaranteed unique (by usage of a PRNG to geneate 256 bits) and time stamping with the number of seconds at the moment when is generated
    This method should be safe to use at the level of very large distributed systems.
    The UUID is stamped with time (seconds): does it open a way to guess the UUID? It depends how safe is "crypto" PRNG, but it should be no problem...

 */

exports.safe_uuid = function(callback) {
    require('crypto').randomBytes(36, function (err, buf) {
        if (err) {
            callback(err);
            return;
        }
        stampWithTime(buf, 1000, 3);
        callback(null, encode(buf));
    });
}


/*
    Try to generate a small UID that is unique against chance in the same millisecond second and in a specific context (eg in the same choreography execution)
    The id contains around 6*8 = 48  bits of randomness and are unique at the level of milliseconds
    This method is safe on a single computer but should be used with care otherwise
    This UUID is not cryptographically safe (can be guessed)
 */
exports.short_uuid = function(callback) {
    require('crypto').randomBytes(12, function (err, buf) {
        if (err) {
            callback(err);
            return;
        }
        stampWithTime(buf,1,2);
        callback(null, encode(buf));
    });
}
},{"crypto":undefined}],12:[function(require,module,exports){

var joinCounter = 0;

function SerialJoinPoint(swarm, callback, args){

    joinCounter++;

    var self = this;
    var channelId = "SerialJoinPoint" + joinCounter;

    if(typeof callback !== "function"){
        $$.errorHandler.syntaxError("unknown", swarm, "invalid function given to serial in swarm");
        return;
    }

    var inner = swarm.getInnerValue();


    function defaultProgressReport(err, res){
        if(err) {
            throw err;
        }
        return res;
    }


    var functionCounter     = 0;
    var executionCounter    = 0;

    var plannedExecutions   = [];
    var plannedArguments    = {};

    function mkFunction(name, pos){
        //console.log("Creating function ", name, pos);
        plannedArguments[pos] = undefined;

        function triggetNextStep(){
            if(plannedExecutions.length == executionCounter || plannedArguments[executionCounter] )  {
                $$.PSK_PubSub.publish(channelId, self);
            }
        }

        var f = function (...args){
            if(executionCounter != pos) {
                plannedArguments[pos] = args;
                //console.log("Delaying function:", executionCounter, pos, plannedArguments, arguments, functionCounter);
                return __proxy;
            } else{
                if(plannedArguments[pos]){
                    //console.log("Executing  function:", executionCounter, pos, plannedArguments, arguments, functionCounter);
					args = plannedArguments[pos];
                } else {
                    plannedArguments[pos] = args;
                    triggetNextStep();
                    return __proxy;
                }
            }

            var f = defaultProgressReport;
            if(name != "progress"){
                f = inner.myFunctions[name];
            }


            try{
                f.apply(self,args);
            } catch(err){
                    args.unshift(err);
                    callback.apply(swarm,args); //error
                    $$.PSK_PubSub.unsubscribe(channelId,runNextFunction);
                return; //terminate execution with an error...!
            }
            executionCounter++;

            triggetNextStep();

            return __proxy;
        };

        plannedExecutions.push(f);
        functionCounter++;
        return f;
    }

     var finished = false;

    function runNextFunction(){
        if(executionCounter == plannedExecutions.length ){
            if(!finished){
                args.unshift(null);
                callback.apply(swarm,args);
                finished = true;
                $$.PSK_PubSub.unsubscribe(channelId,runNextFunction);
            } else {
                console.log("serial construct is using functions that are called multiple times...");
            }
        } else {
            plannedExecutions[executionCounter]();
        }
    }

    $$.PSK_PubSub.subscribe(channelId,runNextFunction); // force it to be "sound"


    this.get = function(target, prop, receiver){
        if(prop == "progress" || inner.myFunctions.hasOwnProperty(prop)){
            return mkFunction(prop, functionCounter);
        }
        return swarm[prop];
    }

    var __proxy;
    this.setProxyObject = function(p){
        __proxy = p;
    }
}

exports.createSerialJoinPoint = function(swarm, callback, args){
    var jp = new SerialJoinPoint(swarm, callback, args);
    var inner = swarm.getInnerValue();
    var p = new Proxy(inner, jp);
    jp.setProxyObject(p);
    return p;
}
},{}],13:[function(require,module,exports){
function SwarmSpace(swarmType, utils) {

    var beesHealer = $$.require("soundpubsub").beesHealer;

    function getFullName(shortName){
        var fullName;
        if(shortName && shortName.includes(".")) {
            fullName = shortName;
        } else {
            fullName = $$.libraryPrefix + "." + shortName; //TODO: check more about . !?
        }
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
            var phase = function(...args){
                var ret;
                try{
                    $$.PSK_PubSub.blockCallBacks();
                    ret = func.apply(thisInstance, args);
                    $$.PSK_PubSub.releaseCallBacks();
                }catch(err){
                    $$.PSK_PubSub.releaseCallBacks();
                    throw err;
                }
                return ret;
            }
            //dynamic named func in order to improve callstack
            Object.defineProperty(phase, "name", {get: function(){return swarmTypeName+"."+func.name}});
            return phase;
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
                utilityFunctions:{

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

        this.initialiseFunctions = function(valueObject, thisObject){

            for(var v in myFunctions){
                valueObject.myFunctions[v] = createPhase(thisObject, myFunctions[v]);
            };

            localId++;
            valueObject.utilityFunctions = utils.createForObject(valueObject, thisObject, localId);

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

            if(target.utilityFunctions.hasOwnProperty(property))
            {

                return target.utilityFunctions[property];
            }


            if(myFunctions.hasOwnProperty(property))
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

            if(target.utilityFunctions.hasOwnProperty(property) || target.myFunctions.hasOwnProperty(property)) {
                $$.errorHandler.syntaxError(property);
                throw new Error("Trying to overwrite immutable member" + property);
            }

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
            return true;
        }

        this.apply = function(target, thisArg, argumentsList){
            console.log("Proxy apply");
            //var func = target[]
            //swarmGlobals.executionProvider.execute(null, thisArg, func, argumentsList)
        }

        var self = this;

        this.isExtensible = function(target) {
            return false;
        };

        this.has = function(target, prop) {
            if(target.publicVars[prop] || target.protectedVars[prop]) {
                return true;
            }
            return false;
        };

        this.ownKeys = function(target) {
            return Reflect.ownKeys(target.publicVars);
        };

        return function(serialisedValues){
            var valueObject = self.initialise(serialisedValues);
            var result = new Proxy(valueObject,self);
            self.initialiseFunctions(valueObject,result);
            if(!serialisedValues){
                $$.uidGenerator.safe_uuid(function (err, result){
                    if(!valueObject.meta.swarmId){
                        valueObject.meta.swarmId = result;  //do not overwrite!!!
                    }
                    valueObject.utilityFunctions.notify();
                });
            }
            return result;
        }
    }

    var descriptions = {};

    this.describe = function describeSwarm(swarmTypeName, description){
        swarmTypeName = getFullName(swarmTypeName);

        var pointPos = swarmTypeName.lastIndexOf('.');
        var shortName = swarmTypeName.substr( pointPos+ 1);
        var libraryName = swarmTypeName.substr(0, pointPos);
        if(!libraryName){
            libraryName = "global";
        }

        var description = new SwarmDescription(swarmTypeName, description);
        if(descriptions[swarmTypeName] != undefined){
            $$.errorHandler.warning("Duplicate swarm description "+ swarmTypeName);
        }

        descriptions[swarmTypeName] = description;

        if($$.registerSwarmDescription){
			$$.registerSwarmDescription(libraryName, shortName, swarmTypeName);
        }
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
        } else {
            $$.errorHandler.syntaxError(swarmTypeName,initialValues,
                "Failed to restart a swarm with type " + swarmTypeName + "\n Maybe diffrent swarm space (used flow instead of swarm!?)");
        }
    }

    this.start = function(swarmTypeName, ...params){
        swarmTypeName = getFullName(swarmTypeName);
        var desc = descriptions[swarmTypeName];
        if(!desc){
            $$.errorHandler.syntaxError(null, swarmTypeName);
            return null;
        }
        var res = desc();

        if(params.length > 1){
            var args =[];
            for(var i = 0;i < params.length; i++){
                args.push(params[i]);
            }
            res.swarm.apply(res, args);
        }

        return res;
    }
}

exports.createSwarmEngine = function(swarmType, utils){
    if(typeof utils == "undefined"){
        utils = require("./choreographies/utilityFunctions/callflow");
    }
    return new SwarmSpace(swarmType, utils);
};
},{"./choreographies/utilityFunctions/callflow":7}],"callflow":[function(require,module,exports){

//var path = require("path");

function defaultErrorHandlingImplementation(err, res){
	//console.log(err.stack);
	if(err) throw err;
	return res;
}


if(typeof(global.$$) == "undefined") {
    global.$$ = {};
}

$$.errorHandler = {
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
    };

$$.uidGenerator = require("./lib/safe-uuid");

$$.safeErrorHandling = function(callback){
        if(callback){
            return callback;
        } else{
            return defaultErrorHandlingImplementation;
        }
    };

$$.__intern = {
        mkArgs:function(args,pos){
            var argsArray = [];
            for(var i = pos; i < args.length; i++){
                argsArray.push(args[i]);
            }
            return argsArray;
        }
    };

$$.__global = {

    };


$$.__global.originalRequire = require;

if(typeof($$.__runtimeModules) == "undefined") {
    $$.__runtimeModules = {};
}


/*
 require and requireLibrary are overwriting the node.js defaults in loading modules for increasing security and speed.
 We guarantee that each module or library is loaded only once and only from a single folder... Use the standard require if you need something else!

 By default we expect to run from a privatesky VM engine ( a privatesky node) and therefore the callflow stays in the modules folder there.
 Any new use of callflow (and require or requireLibrary) could require changes to $$.__global.__loadLibrayRoot and $$.__global.__loadModulesRoot
 */
//$$.__global.__loadLibraryRoot    = __dirname + "/../../libraries/";
//$$.__global.__loadModulesRoot   = __dirname + "/../../modules/";

var loadedModules = {};
$$.require = function(name){
	var existingModule = loadedModules[name];

	if(!existingModule){
        existingModule = $$.__runtimeModules[name];
        if(!existingModule){
            //var absolutePath = path.resolve( $$.__global.__loadModulesRoot + name);
            existingModule = $$.__global.originalRequire(name);
            loadedModules[name] = existingModule;
        }
	}
	return existingModule;
};

var swarmUtils = require("./lib/choreographies/utilityFunctions/swarm");

$$.defaultErrorHandlingImplementation = defaultErrorHandlingImplementation;

var callflowModule = require("./lib/swarmDescription");
$$.callflows        = callflowModule.createSwarmEngine("callflow");
$$.callflow         = $$.callflows;
$$.flow             = $$.callflows;
$$.flows            = $$.callflows;

$$.swarms           = callflowModule.createSwarmEngine("swarm", swarmUtils);
$$.swarm            = $$.swarms;
$$.contracts        = callflowModule.createSwarmEngine("contract", swarmUtils);
$$.contract         = $$.contracts;


$$.PSK_PubSub = $$.require("soundpubsub").soundPubSub;

$$.securityContext = "system";
$$.libraryPrefix = "global";
$$.libraries = {
    global:{

    }
};



$$.loadLibrary = require("./lib/loadLibrary").loadLibrary;

$$.requireLibrary = function(name){
    //var absolutePath = path.resolve(  $$.__global.__loadLibraryRoot + name);
    return $$.loadLibrary(name,name);
};

$$.registerSwarmDescription =  function(libraryName,shortName, description){
    if(!$$.libraries[libraryName]){
        $$.libraries[libraryName] = {};
    }
    $$.libraries[libraryName][shortName] = description;
}

module.exports = {
    				createSwarmEngine: require("./lib/swarmDescription").createSwarmEngine,
                    createJoinPoint: require("./lib/parallelJoinPoint").createJoinPoint,
                    createSerialJoinPoint: require("./lib/serialJoinPoint").createSerialJoinPoint,
					"safe-uuid": require("./lib/safe-uuid"),
                    swarmInstanceManager: require("./lib/choreographies/swarmInstancesManager")
				};
},{"./lib/choreographies/swarmInstancesManager":5,"./lib/choreographies/utilityFunctions/swarm":8,"./lib/loadLibrary":9,"./lib/parallelJoinPoint":10,"./lib/safe-uuid":11,"./lib/serialJoinPoint":12,"./lib/swarmDescription":13}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9lbmdpbmUvcHNrYnVpbGR0ZW1wL2RvbWFpbi5qcyIsIi4uL2xpYnJhcmllcy9sb2NhbE5vZGUvaW5kZXguanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9jaG9yZW9ncmFwaGllcy9Td2FybURlYnVnLmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvc3dhcm1JbnN0YW5jZXNNYW5hZ2VyLmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvdXRpbGl0eUZ1bmN0aW9ucy9iYXNlLmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvdXRpbGl0eUZ1bmN0aW9ucy9jYWxsZmxvdy5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvc3dhcm0uanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9sb2FkTGlicmFyeS5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL3BhcmFsbGVsSm9pblBvaW50LmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvc2FmZS11dWlkLmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvc2VyaWFsSm9pblBvaW50LmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvc3dhcm1EZXNjcmlwdGlvbi5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIjskJC5fX3J1bnRpbWVNb2R1bGVzW1wibG9jYWxOb2RlXCJdID0gcmVxdWlyZShcImxvY2FsTm9kZVwiKTtcbiQkLl9fcnVudGltZU1vZHVsZXNbXCJwZHNcIl0gPSByZXF1aXJlKFwicGRzXCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcImRvbWFpblwiXSA9IHJlcXVpcmUoXCJkb21haW5cIik7XG4iLCIiLCIvKlxyXG5Jbml0aWFsIExpY2Vuc2U6IChjKSBBeGlvbG9naWMgUmVzZWFyY2ggJiBBbGJvYWllIFPDrm5pY8SDLlxyXG5Db250cmlidXRvcnM6IEF4aW9sb2dpYyBSZXNlYXJjaCAsIFByaXZhdGVTa3kgcHJvamVjdFxyXG5Db2RlIExpY2Vuc2U6IExHUEwgb3IgTUlULlxyXG4qL1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcclxudmFyIGZzID0gcmVxdWlyZShcImZzXCIpO1xyXG5nbG9iYWwuY3ByaW50ID0gY29uc29sZS5sb2c7XHJcbmdsb2JhbC53cHJpbnQgPSBjb25zb2xlLndhcm47XHJcbmdsb2JhbC5kcHJpbnQgPSBjb25zb2xlLmRlYnVnO1xyXG5nbG9iYWwuZXByaW50ID0gY29uc29sZS5lcnJvcjtcclxuXHJcblxyXG4vKipcclxuICogU2hvcnRjdXQgdG8gSlNPTi5zdHJpbmdpZnlcclxuICogQHBhcmFtIG9ialxyXG4gKi9cclxuZ2xvYmFsLkogPSBmdW5jdGlvbiAob2JqKSB7XHJcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqKTtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBQcmludCBzd2FybSBjb250ZXh0cyAoTWVzc2FnZXMpIGFuZCBlYXNpZXIgdG8gcmVhZCBjb21wYXJlZCB3aXRoIEpcclxuICogQHBhcmFtIG9ialxyXG4gKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAqL1xyXG5leHBvcnRzLmNsZWFuRHVtcCA9IGZ1bmN0aW9uIChvYmopIHtcclxuICAgIHZhciBvID0gb2JqLnZhbHVlT2YoKTtcclxuICAgIHZhciBtZXRhID0ge1xyXG4gICAgICAgIHN3YXJtVHlwZU5hbWU6by5tZXRhLnN3YXJtVHlwZU5hbWVcclxuICAgIH07XHJcbiAgICByZXR1cm4gXCJcXHQgc3dhcm1JZDogXCIgKyBvLm1ldGEuc3dhcm1JZCArIFwie1xcblxcdFxcdG1ldGE6IFwiICAgICsgSihtZXRhKSArXHJcbiAgICAgICAgXCJcXG5cXHRcXHRwdWJsaWM6IFwiICAgICAgICArIEooby5wdWJsaWNWYXJzKSArXHJcbiAgICAgICAgXCJcXG5cXHRcXHRwcm90ZWN0ZWQ6IFwiICAgICArIEooby5wcm90ZWN0ZWRWYXJzKSArXHJcbiAgICAgICAgXCJcXG5cXHRcXHRwcml2YXRlOiBcIiAgICAgICArIEooby5wcml2YXRlVmFycykgKyBcIlxcblxcdH1cXG5cIjtcclxufVxyXG5cclxuLy9NID0gZXhwb3J0cy5jbGVhbkR1bXA7XHJcbi8qKlxyXG4gKiBFeHBlcmltZW50YWwgZnVuY3Rpb25zXHJcbiAqL1xyXG5cclxuXHJcbi8qXHJcblxyXG5sb2dnZXIgICAgICA9IG1vbml0b3IubG9nZ2VyO1xyXG5hc3NlcnQgICAgICA9IG1vbml0b3IuYXNzZXJ0O1xyXG50aHJvd2luZyAgICA9IG1vbml0b3IuZXhjZXB0aW9ucztcclxuXHJcblxyXG52YXIgdGVtcG9yYXJ5TG9nQnVmZmVyID0gW107XHJcblxyXG52YXIgY3VycmVudFN3YXJtQ29tSW1wbCA9IG51bGw7XHJcblxyXG5sb2dnZXIucmVjb3JkID0gZnVuY3Rpb24ocmVjb3JkKXtcclxuICAgIGlmKGN1cnJlbnRTd2FybUNvbUltcGw9PT1udWxsKXtcclxuICAgICAgICB0ZW1wb3JhcnlMb2dCdWZmZXIucHVzaChyZWNvcmQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjdXJyZW50U3dhcm1Db21JbXBsLnJlY29yZExvZyhyZWNvcmQpO1xyXG4gICAgfVxyXG59XHJcblxyXG52YXIgY29udGFpbmVyID0gcmVxdWlyZShcImRpY29udGFpbmVyXCIpLmNvbnRhaW5lcjtcclxuXHJcbmNvbnRhaW5lci5zZXJ2aWNlKFwic3dhcm1Mb2dnaW5nTW9uaXRvclwiLCBbXCJzd2FybWluZ0lzV29ya2luZ1wiLCBcInN3YXJtQ29tSW1wbFwiXSwgZnVuY3Rpb24ob3V0T2ZTZXJ2aWNlLHN3YXJtaW5nLCBzd2FybUNvbUltcGwpe1xyXG5cclxuICAgIGlmKG91dE9mU2VydmljZSl7XHJcbiAgICAgICAgaWYoIXRlbXBvcmFyeUxvZ0J1ZmZlcil7XHJcbiAgICAgICAgICAgIHRlbXBvcmFyeUxvZ0J1ZmZlciA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIHRtcCA9IHRlbXBvcmFyeUxvZ0J1ZmZlcjtcclxuICAgICAgICB0ZW1wb3JhcnlMb2dCdWZmZXIgPSBbXTtcclxuICAgICAgICBjdXJyZW50U3dhcm1Db21JbXBsID0gc3dhcm1Db21JbXBsO1xyXG4gICAgICAgIGxvZ2dlci5yZWNvcmQgPSBmdW5jdGlvbihyZWNvcmQpe1xyXG4gICAgICAgICAgICBjdXJyZW50U3dhcm1Db21JbXBsLnJlY29yZExvZyhyZWNvcmQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdG1wLmZvckVhY2goZnVuY3Rpb24ocmVjb3JkKXtcclxuICAgICAgICAgICAgbG9nZ2VyLnJlY29yZChyZWNvcmQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KVxyXG5cclxuKi9cclxuZ2xvYmFsLnVuY2F1Z2h0RXhjZXB0aW9uU3RyaW5nID0gXCJcIjtcclxuZ2xvYmFsLnVuY2F1Z2h0RXhjZXB0aW9uRXhpc3RzID0gZmFsc2U7XHJcbmlmKHR5cGVvZiBnbG9iYWwuZ2xvYmFsVmVyYm9zaXR5ID09ICd1bmRlZmluZWQnKXtcclxuICAgIGdsb2JhbC5nbG9iYWxWZXJib3NpdHkgPSBmYWxzZTtcclxufVxyXG5cclxudmFyIERFQlVHX1NUQVJUX1RJTUUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHJcbmZ1bmN0aW9uIGdldERlYnVnRGVsdGEoKXtcclxuICAgIHZhciBjdXJyZW50VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgcmV0dXJuIGN1cnJlbnRUaW1lIC0gREVCVUdfU1RBUlRfVElNRTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlYnVnIGZ1bmN0aW9ucywgaW5mbHVlbmNlZCBieSBnbG9iYWxWZXJib3NpdHkgZ2xvYmFsIHZhcmlhYmxlXHJcbiAqIEBwYXJhbSB0eHRcclxuICovXHJcbmRwcmludCA9IGZ1bmN0aW9uICh0eHQpIHtcclxuICAgIGlmIChnbG9iYWxWZXJib3NpdHkgPT0gdHJ1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzQWRhcHRlci5pbml0aWxpc2VkICkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHOiBbXCIgKyB0aGlzQWRhcHRlci5ub2RlTmFtZSArIFwiXShcIiArIGdldERlYnVnRGVsdGEoKSsgXCIpOlwiK3R4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHOiAoXCIgKyBnZXREZWJ1Z0RlbHRhKCkrIFwiKTpcIit0eHQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHOiBcIiArIHR4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogb2Jzb2xldGUhP1xyXG4gKiBAcGFyYW0gdHh0XHJcbiAqL1xyXG5nbG9iYWwuYXByaW50ID0gZnVuY3Rpb24gKHR4dCkge1xyXG4gICAgY29uc29sZS5sb2coXCJERUJVRzogW1wiICsgdGhpc0FkYXB0ZXIubm9kZU5hbWUgKyBcIl06IFwiICsgdHh0KTtcclxufVxyXG5cclxuXHJcblxyXG4vKipcclxuICogVXRpbGl0eSBmdW5jdGlvbiB1c3VhbGx5IHVzZWQgaW4gdGVzdHMsIGV4aXQgY3VycmVudCBwcm9jZXNzIGFmdGVyIGEgd2hpbGVcclxuICogQHBhcmFtIG1zZ1xyXG4gKiBAcGFyYW0gdGltZW91dFxyXG4gKi9cclxuZ2xvYmFsLmRlbGF5RXhpdCA9IGZ1bmN0aW9uIChtc2csIHJldENvZGUsdGltZW91dCkge1xyXG4gICAgaWYocmV0Q29kZSA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgIHJldENvZGUgPSBFeGl0Q29kZXMuVW5rbm93bkVycm9yO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKHRpbWVvdXQgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICB0aW1lb3V0ID0gMTAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKG1zZyA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgIG1zZyA9IFwiRGVsYXlpbmcgZXhpdCB3aXRoIFwiKyB0aW1lb3V0ICsgXCJtc1wiO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKG1zZyk7XHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBwcm9jZXNzLmV4aXQocmV0Q29kZSk7XHJcbiAgICB9LCB0aW1lb3V0KTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGxvY2FsTG9nIChsb2dUeXBlLCBtZXNzYWdlLCBlcnIpIHtcclxuICAgIHZhciB0aW1lID0gbmV3IERhdGUoKTtcclxuICAgIHZhciBub3cgPSB0aW1lLmdldERhdGUoKSArIFwiLVwiICsgKHRpbWUuZ2V0TW9udGgoKSArIDEpICsgXCIsXCIgKyB0aW1lLmdldEhvdXJzKCkgKyBcIjpcIiArIHRpbWUuZ2V0TWludXRlcygpO1xyXG4gICAgdmFyIG1zZztcclxuXHJcbiAgICBtc2cgPSAnWycgKyBub3cgKyAnXVsnICsgdGhpc0FkYXB0ZXIubm9kZU5hbWUgKyAnXSAnICsgbWVzc2FnZTtcclxuXHJcbiAgICBpZiAoZXJyICE9IG51bGwgJiYgZXJyICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIG1zZyArPSAnXFxuICAgICBFcnI6ICcgKyBlcnIudG9TdHJpbmcoKTtcclxuICAgICAgICBpZiAoZXJyLnN0YWNrICYmIGVyci5zdGFjayAhPSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIG1zZyArPSAnXFxuICAgICBTdGFjazogJyArIGVyci5zdGFjayArICdcXG4nO1xyXG4gICAgfVxyXG5cclxuICAgIGNwcmludChtc2cpO1xyXG4gICAgaWYodGhpc0FkYXB0ZXIuaW5pdGlsaXNlZCl7XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICBmcy5hcHBlbmRGaWxlU3luYyhnZXRTd2FybUZpbGVQYXRoKHRoaXNBZGFwdGVyLmNvbmZpZy5sb2dzUGF0aCArIFwiL1wiICsgbG9nVHlwZSksIG1zZyk7XHJcbiAgICAgICAgfSBjYXRjaChlcnIpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZhaWxpbmcgdG8gd3JpdGUgbG9ncyBpbiBcIiwgdGhpc0FkYXB0ZXIuY29uZmlnLmxvZ3NQYXRoICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufVxyXG5cclxuXHJcbmdsb2JhbC5wcmludGYgPSBmdW5jdGlvbiAoLi4ucGFyYW1zKSB7XHJcbiAgICB2YXIgYXJncyA9IFtdOyAvLyBlbXB0eSBhcnJheVxyXG4gICAgLy8gY29weSBhbGwgb3RoZXIgYXJndW1lbnRzIHdlIHdhbnQgdG8gXCJwYXNzIHRocm91Z2hcIlxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhcmdzLnB1c2gocGFyYW1zW2ldKTtcclxuICAgIH1cclxuICAgIHZhciBvdXQgPSB1dGlsLmZvcm1hdC5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgIGNvbnNvbGUubG9nKG91dCk7XHJcbn1cclxuXHJcbmdsb2JhbC5zcHJpbnRmID0gZnVuY3Rpb24gKC4uLnBhcmFtcykge1xyXG4gICAgdmFyIGFyZ3MgPSBbXTsgLy8gZW1wdHkgYXJyYXlcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgYXJncy5wdXNoKHBhcmFtc1tpXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdXRpbC5mb3JtYXQuYXBwbHkodGhpcywgYXJncyk7XHJcbn1cclxuXHJcbiIsIlxyXG5cclxuZnVuY3Rpb24gU3dhcm1zSW5zdGFuY2VzTWFuYWdlcigpe1xyXG4gICAgdmFyIHN3YXJtQWxpdmVJbnN0YW5jZXMgPSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMud2FpdEZvclN3YXJtID0gZnVuY3Rpb24oY2FsbGJhY2ssIHN3YXJtLCBrZWVwQWxpdmVDaGVjayl7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRvTG9naWMoKXtcclxuICAgICAgICAgICAgdmFyIHN3YXJtSWQgPSBzd2FybS5nZXRJbm5lclZhbHVlKCkubWV0YS5zd2FybUlkO1xyXG4gICAgICAgICAgICB2YXIgd2F0Y2hlciA9IHN3YXJtQWxpdmVJbnN0YW5jZXNbc3dhcm1JZF07XHJcbiAgICAgICAgICAgIGlmKCF3YXRjaGVyKXtcclxuICAgICAgICAgICAgICAgIHdhdGNoZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dhcm06c3dhcm0sXHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6Y2FsbGJhY2ssXHJcbiAgICAgICAgICAgICAgICAgICAga2VlcEFsaXZlQ2hlY2s6a2VlcEFsaXZlQ2hlY2tcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN3YXJtQWxpdmVJbnN0YW5jZXNbc3dhcm1JZF0gPSB3YXRjaGVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBmaWx0ZXIoKXtcclxuICAgICAgICAgICAgcmV0dXJuIHN3YXJtLmdldElubmVyVmFsdWUoKS5tZXRhLnN3YXJtSWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyQkLnVpZEdlbmVyYXRvci53YWl0X2Zvcl9jb25kaXRpb24oY29uZGl0aW9uLGRvTG9naWMpO1xyXG4gICAgICAgIHN3YXJtLm9ic2VydmUoZG9Mb2dpYywgbnVsbCwgZmlsdGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjbGVhblN3YXJtV2FpdGVyKHN3YXJtU2VyaWFsaXNhdGlvbil7IC8vIFRPRE86IGFkZCBiZXR0ZXIgbWVjaGFuaXNtcyB0byBwcmV2ZW50IG1lbW9yeSBsZWFrc1xyXG4gICAgICAgIHZhciBzd2FybUlkID0gc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuc3dhcm1JZDtcclxuICAgICAgICB2YXIgd2F0Y2hlciA9IHN3YXJtQWxpdmVJbnN0YW5jZXNbc3dhcm1JZF07XHJcblxyXG4gICAgICAgIGlmKCF3YXRjaGVyKXtcclxuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLndhcm5pbmcoXCJJbnZhbGlkIHN3YXJtIHJlY2VpdmVkOiBcIiArIHN3YXJtSWQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgYXJncyA9IHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmFyZ3M7XHJcbiAgICAgICAgYXJncy5wdXNoKHN3YXJtU2VyaWFsaXNhdGlvbik7XHJcblxyXG4gICAgICAgIHdhdGNoZXIuY2FsbGJhY2suYXBwbHkobnVsbCwgYXJncyk7XHJcbiAgICAgICAgaWYoIXdhdGNoZXIua2VlcEFsaXZlQ2hlY2soKSl7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBzd2FybUFsaXZlSW5zdGFuY2VzW3N3YXJtSWRdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJldml2ZV9zd2FybSA9IGZ1bmN0aW9uKHN3YXJtU2VyaWFsaXNhdGlvbil7XHJcblxyXG5cclxuICAgICAgICB2YXIgc3dhcm1JZCAgICAgPSBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5zd2FybUlkO1xyXG4gICAgICAgIHZhciBzd2FybVR5cGUgICA9IHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLnN3YXJtVHlwZU5hbWU7XHJcbiAgICAgICAgdmFyIGluc3RhbmNlICAgID0gc3dhcm1BbGl2ZUluc3RhbmNlc1tzd2FybUlkXTtcclxuXHJcbiAgICAgICAgdmFyIHN3YXJtO1xyXG5cclxuICAgICAgICBpZihpbnN0YW5jZSl7XHJcbiAgICAgICAgICAgIHN3YXJtID0gaW5zdGFuY2Uuc3dhcm07XHJcblxyXG4gICAgICAgIH0gICBlbHNlIHtcclxuICAgICAgICAgICAgc3dhcm0gPSAkJC5zd2FybS5jcmVhdGUoc3dhcm1UeXBlLCB1bmRlZmluZWQsIHN3YXJtU2VyaWFsaXNhdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5jb21tYW5kID09IFwiYXN5bmNSZXR1cm5cIil7XHJcbiAgICAgICAgICAgIGNsZWFuU3dhcm1XYWl0ZXIoc3dhcm1TZXJpYWxpc2F0aW9uKTtcclxuICAgICAgICB9IGVsc2UgICAgIGlmKHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmNvbW1hbmQgPT0gXCJleGVjdXRlU3dhcm1QaGFzZVwiKXtcclxuICAgICAgICAgICAgc3dhcm0ucnVuUGhhc2Uoc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEucGhhc2VOYW1lLCBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5hcmdzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVua25vd24gY29tbWFuZFwiLHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmNvbW1hbmQsIFwiaW4gc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuY29tbWFuZFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzd2FybTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbiQkLnN3YXJtc0luc3RhbmNlc01hbmFnZXIgPSBuZXcgU3dhcm1zSW5zdGFuY2VzTWFuYWdlcigpO1xyXG5cclxuXHJcbiIsInZhciBiZWVzSGVhbGVyID0gJCQucmVxdWlyZShcInNvdW5kcHVic3ViXCIpLmJlZXNIZWFsZXI7XHJcbnZhciBzd2FybURlYnVnID0gcmVxdWlyZShcIi4uL1N3YXJtRGVidWdcIik7XHJcblxyXG5leHBvcnRzLmNyZWF0ZUZvck9iamVjdCA9IGZ1bmN0aW9uKHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0LCBsb2NhbElkKXtcclxuXHR2YXIgcmV0ID0ge307XHJcblxyXG5cdGZ1bmN0aW9uIGZpbHRlckZvclNlcmlhbGlzYWJsZSAodmFsdWVPYmplY3Qpe1xyXG5cdFx0cmV0dXJuIHZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1JZDtcclxuXHR9XHJcblxyXG5cdHZhciBzd2FybUZ1bmN0aW9uID0gZnVuY3Rpb24oY29udGV4dCwgcGhhc2VOYW1lKXtcclxuXHRcdHZhciBhcmdzID1bXTtcclxuXHRcdGZvcih2YXIgaSA9IDI7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspe1xyXG5cdFx0XHRhcmdzLnB1c2goYXJndW1lbnRzW2ldKTtcclxuXHRcdH1cclxuXHJcblx0XHQvL21ha2UgdGhlIGV4ZWN1dGlvbiBhdCBsZXZlbCAwICAoYWZ0ZXIgYWxsIHBlbmRpbmcgZXZlbnRzKSBhbmQgd2FpdCB0byBoYXZlIGEgc3dhcm1JZFxyXG5cdFx0cmV0Lm9ic2VydmUoZnVuY3Rpb24oKXtcclxuXHRcdFx0YmVlc0hlYWxlci5hc0pTT04odmFsdWVPYmplY3QsIHBoYXNlTmFtZSwgYXJncywgZnVuY3Rpb24oZXJyLGpzTXNnKXtcclxuXHRcdFx0XHRqc01zZy5tZXRhLnRhcmdldCA9IGNvbnRleHQ7XHJcblx0XHRcdFx0JCQuUFNLX1B1YlN1Yi5wdWJsaXNoKCQkLkNPTlNUQU5UUy5TV0FSTV9GT1JfRVhFQ1VUSU9OLCBqc01zZyk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSxudWxsLGZpbHRlckZvclNlcmlhbGlzYWJsZSk7XHJcblxyXG5cdFx0cmV0Lm5vdGlmeSgpO1xyXG5cclxuXHJcblx0XHRyZXR1cm4gdGhpc09iamVjdDtcclxuXHR9O1xyXG5cclxuXHR2YXIgYXN5bmNSZXR1cm4gPSBmdW5jdGlvbihlcnIsIHJlc3VsdCl7XHJcblx0XHR2YXIgY29udGV4dCA9IHZhbHVlT2JqZWN0LnByb3RlY3RlZFZhcnMuY29udGV4dDtcclxuXHJcblx0XHRpZighY29udGV4dCAmJiB2YWx1ZU9iamVjdC5tZXRhLndhaXRTdGFjayl7XHJcblx0XHRcdGNvbnRleHQgPSB2YWx1ZU9iamVjdC5tZXRhLndhaXRTdGFjay5wb3AoKTtcclxuXHRcdFx0dmFsdWVPYmplY3QucHJvdGVjdGVkVmFycy5jb250ZXh0ID0gY29udGV4dDtcclxuXHRcdH1cclxuXHJcblx0XHRiZWVzSGVhbGVyLmFzSlNPTih2YWx1ZU9iamVjdCwgXCJfX3JldHVybl9fXCIsIFtlcnIsIHJlc3VsdF0sIGZ1bmN0aW9uKGVycixqc01zZyl7XHJcblx0XHRcdGpzTXNnLm1ldGEuY29tbWFuZCA9IFwiYXN5bmNSZXR1cm5cIjtcclxuXHRcdFx0aWYoIWNvbnRleHQpe1xyXG5cdFx0XHRcdGNvbnRleHQgPSB2YWx1ZU9iamVjdC5tZXRhLmhvbWVTZWN1cml0eUNvbnRleHQ7Ly9UT0RPOiBDSEVDSyBUSElTXHJcblxyXG5cdFx0XHR9XHJcblx0XHRcdGpzTXNnLm1ldGEudGFyZ2V0ID0gY29udGV4dDtcclxuXHJcblx0XHRcdGlmKCFjb250ZXh0KXtcclxuXHRcdFx0XHQkJC5lcnJvckhhbmRsZXIuZXJyb3IobmV3IEVycm9yKFwiQXN5bmNocm9ub3VzIHJldHVybiBpbnNpZGUgb2YgYSBzd2FybSB0aGF0IGRvZXMgbm90IHdhaXQgZm9yIHJlc3VsdHNcIikpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQkLlBTS19QdWJTdWIucHVibGlzaCgkJC5DT05TVEFOVFMuU1dBUk1fRk9SX0VYRUNVVElPTiwganNNc2cpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9O1xyXG5cclxuXHRmdW5jdGlvbiBob21lKGVyciwgcmVzdWx0KXtcclxuXHRcdGJlZXNIZWFsZXIuYXNKU09OKHZhbHVlT2JqZWN0LCBcImhvbWVcIiwgW2VyciwgcmVzdWx0XSwgZnVuY3Rpb24oZXJyLGpzTXNnKXtcclxuXHRcdFx0dmFyIGNvbnRleHQgPSB2YWx1ZU9iamVjdC5tZXRhLmhvbWVDb250ZXh0O1xyXG5cdFx0XHRqc01zZy5tZXRhLnRhcmdldCA9IGNvbnRleHQ7XHJcblx0XHRcdCQkLlBTS19QdWJTdWIucHVibGlzaCgkJC5DT05TVEFOVFMuU1dBUk1fRk9SX0VYRUNVVElPTiwganNNc2cpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHJcblxyXG5cdGZ1bmN0aW9uIHdhaXRSZXN1bHRzKGNhbGxiYWNrLCBrZWVwQWxpdmVDaGVjaywgc3dhcm0pe1xyXG5cdFx0aWYoIXN3YXJtKXtcclxuXHRcdFx0c3dhcm0gPSB0aGlzO1xyXG5cdFx0fVxyXG5cdFx0aWYoIWtlZXBBbGl2ZUNoZWNrKXtcclxuXHRcdFx0a2VlcEFsaXZlQ2hlY2sgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xyXG5cdFx0aWYoIWlubmVyLm1ldGEud2FpdFN0YWNrKXtcclxuXHRcdFx0aW5uZXIubWV0YS53YWl0U3RhY2sgPSBbXTtcclxuXHRcdFx0aW5uZXIubWV0YS53YWl0U3RhY2sucHVzaCgkJC5zZWN1cml0eUNvbnRleHQpXHJcblx0XHR9XHJcblx0XHQkJC5zd2FybXNJbnN0YW5jZXNNYW5hZ2VyLndhaXRGb3JTd2FybShjYWxsYmFjaywgc3dhcm0sIGtlZXBBbGl2ZUNoZWNrKTtcclxuXHR9XHJcblxyXG5cclxuXHRmdW5jdGlvbiBnZXRJbm5lclZhbHVlKCl7XHJcblx0XHRyZXR1cm4gdmFsdWVPYmplY3Q7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBydW5QaGFzZShmdW5jdE5hbWUsIGFyZ3Mpe1xyXG5cdFx0dmFyIGZ1bmMgPSB2YWx1ZU9iamVjdC5teUZ1bmN0aW9uc1tmdW5jdE5hbWVdO1xyXG5cdFx0aWYoZnVuYyl7XHJcblx0XHRcdGZ1bmMuYXBwbHkodGhpc09iamVjdCwgYXJncyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IoZnVuY3ROYW1lLCB2YWx1ZU9iamVjdCwgXCJGdW5jdGlvbiBcIiArIGZ1bmN0TmFtZSArIFwiIGRvZXMgbm90IGV4aXN0IVwiKTtcclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB1cGRhdGUoc2VyaWFsaXNhdGlvbil7XHJcblx0XHRiZWVzSGVhbGVyLmpzb25Ub05hdGl2ZShzZXJpYWxpc2F0aW9uLHZhbHVlT2JqZWN0KTtcclxuXHR9XHJcblxyXG5cclxuXHRmdW5jdGlvbiB2YWx1ZU9mKCl7XHJcblx0XHR2YXIgcmV0ID0ge307XHJcblx0XHRyZXQubWV0YSAgICAgICAgICAgICAgICA9IHZhbHVlT2JqZWN0Lm1ldGE7XHJcblx0XHRyZXQucHVibGljVmFycyAgICAgICAgICA9IHZhbHVlT2JqZWN0LnB1YmxpY1ZhcnM7XHJcblx0XHRyZXQucHJpdmF0ZVZhcnMgICAgICAgICA9IHZhbHVlT2JqZWN0LnByaXZhdGVWYXJzO1xyXG5cdFx0cmV0LnByb3RlY3RlZFZhcnMgICAgICAgPSB2YWx1ZU9iamVjdC5wcm90ZWN0ZWRWYXJzO1xyXG5cdFx0cmV0dXJuIHJldDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRvU3RyaW5nICgpe1xyXG5cdFx0cmV0dXJuIHN3YXJtRGVidWcuY2xlYW5EdW1wKHRoaXNPYmplY3QudmFsdWVPZigpKTtcclxuXHR9XHJcblxyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGVQYXJhbGxlbChjYWxsYmFjayl7XHJcblx0XHRyZXR1cm4gcmVxdWlyZShcIi4uLy4uL3BhcmFsbGVsSm9pblBvaW50XCIpLmNyZWF0ZUpvaW5Qb2ludCh0aGlzT2JqZWN0LCBjYWxsYmFjaywgJCQuX19pbnRlcm4ubWtBcmdzKGFyZ3VtZW50cywxKSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGVTZXJpYWwoY2FsbGJhY2spe1xyXG5cdFx0cmV0dXJuIHJlcXVpcmUoXCIuLi8uLi9zZXJpYWxKb2luUG9pbnRcIikuY3JlYXRlU2VyaWFsSm9pblBvaW50KHRoaXNPYmplY3QsIGNhbGxiYWNrLCAkJC5fX2ludGVybi5ta0FyZ3MoYXJndW1lbnRzLDEpKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGluc3BlY3QoKXtcclxuXHRcdHJldHVybiBzd2FybURlYnVnLmNsZWFuRHVtcCh0aGlzT2JqZWN0LnZhbHVlT2YoKSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0cmV0dXJuIFN3YXJtRGVzY3JpcHRpb247XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBlbnN1cmVMb2NhbElkKCl7XHJcblx0XHRpZighdmFsdWVPYmplY3QubG9jYWxJZCl7XHJcblx0XHRcdHZhbHVlT2JqZWN0LmxvY2FsSWQgPSB2YWx1ZU9iamVjdC5tZXRhLnN3YXJtVHlwZU5hbWUgKyBcIi1cIiArIGxvY2FsSWQ7XHJcblx0XHRcdGxvY2FsSWQrKztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG9ic2VydmUoY2FsbGJhY2ssIHdhaXRGb3JNb3JlLCBmaWx0ZXIpe1xyXG5cdFx0aWYoIXdhaXRGb3JNb3JlKXtcclxuXHRcdFx0d2FpdEZvck1vcmUgPSBmdW5jdGlvbiAoKXtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRlbnN1cmVMb2NhbElkKCk7XHJcblxyXG5cdFx0JCQuUFNLX1B1YlN1Yi5zdWJzY3JpYmUodmFsdWVPYmplY3QubG9jYWxJZCwgY2FsbGJhY2ssIHdhaXRGb3JNb3JlLCBmaWx0ZXIpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdG9KU09OKHByb3Ape1xyXG5cdFx0Ly9wcmV2ZW50aW5nIG1heCBjYWxsIHN0YWNrIHNpemUgZXhjZWVkaW5nIG9uIHByb3h5IGF1dG8gcmVmZXJlbmNpbmdcclxuXHRcdC8vcmVwbGFjZSB7fSBhcyByZXN1bHQgb2YgSlNPTihQcm94eSkgd2l0aCB0aGUgc3RyaW5nIFtPYmplY3QgcHJvdGVjdGVkIG9iamVjdF1cclxuXHRcdHJldHVybiBcIltPYmplY3QgcHJvdGVjdGVkIG9iamVjdF1cIjtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldEpTT05hc3luYyhjYWxsYmFjayl7XHJcblx0XHQvL21ha2UgdGhlIGV4ZWN1dGlvbiBhdCBsZXZlbCAwICAoYWZ0ZXIgYWxsIHBlbmRpbmcgZXZlbnRzKSBhbmQgd2FpdCB0byBoYXZlIGEgc3dhcm1JZFxyXG5cdFx0cmV0Lm9ic2VydmUoZnVuY3Rpb24oKXtcclxuXHRcdFx0YmVlc0hlYWxlci5hc0pTT04odmFsdWVPYmplY3QsIG51bGwsIG51bGwsY2FsbGJhY2spO1xyXG5cdFx0fSxudWxsLGZpbHRlckZvclNlcmlhbGlzYWJsZSk7XHJcblx0XHRyZXQubm90aWZ5KCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBub3RpZnkoZXZlbnQpe1xyXG5cdFx0aWYoIWV2ZW50KXtcclxuXHRcdFx0ZXZlbnQgPSB2YWx1ZU9iamVjdDtcclxuXHRcdH1cclxuXHRcdGVuc3VyZUxvY2FsSWQoKTtcclxuXHRcdCQkLlBTS19QdWJTdWIucHVibGlzaCh2YWx1ZU9iamVjdC5sb2NhbElkLCBldmVudCk7XHJcblx0fVxyXG5cclxuXHRyZXQuc3dhcm0gICAgICAgICAgID0gc3dhcm1GdW5jdGlvbjtcclxuXHRyZXQubm90aWZ5ICAgICAgICAgID0gbm90aWZ5O1xyXG5cdHJldC5nZXRKU09OYXN5bmMgICAgPSBnZXRKU09OYXN5bmM7XHJcblx0cmV0LnRvSlNPTiAgICAgICAgICA9IHRvSlNPTjtcclxuXHRyZXQub2JzZXJ2ZSAgICAgICAgID0gb2JzZXJ2ZTtcclxuXHRyZXQuaW5zcGVjdCAgICAgICAgID0gaW5zcGVjdDtcclxuXHRyZXQuam9pbiAgICAgICAgICAgID0gY3JlYXRlUGFyYWxsZWw7XHJcblx0cmV0LnBhcmFsbGVsICAgICAgICA9IGNyZWF0ZVBhcmFsbGVsO1xyXG5cdHJldC5zZXJpYWwgICAgICAgICAgPSBjcmVhdGVTZXJpYWw7XHJcblx0cmV0LnZhbHVlT2YgICAgICAgICA9IHZhbHVlT2Y7XHJcblx0cmV0LnVwZGF0ZSAgICAgICAgICA9IHVwZGF0ZTtcclxuXHRyZXQucnVuUGhhc2UgICAgICAgID0gcnVuUGhhc2U7XHJcblx0cmV0Lm9uUmV0dXJuICAgICAgICA9IHdhaXRSZXN1bHRzO1xyXG5cdHJldC5vblJlc3VsdCAgICAgICAgPSB3YWl0UmVzdWx0cztcclxuXHRyZXQuYXN5bmNSZXR1cm4gICAgID0gYXN5bmNSZXR1cm47XHJcblx0cmV0LnJldHVybiAgICAgICAgICA9IGFzeW5jUmV0dXJuO1xyXG5cdHJldC5nZXRJbm5lclZhbHVlICAgPSBnZXRJbm5lclZhbHVlO1xyXG5cdHJldC5ob21lICAgICAgICAgICAgPSBob21lO1xyXG5cdHJldC50b1N0cmluZyAgICAgICAgPSB0b1N0cmluZztcclxuXHRyZXQuY29uc3RydWN0b3IgICAgID0gY29uc3RydWN0b3I7XHJcblxyXG5cdHJldHVybiByZXQ7XHJcblxyXG59OyIsImV4cG9ydHMuY3JlYXRlRm9yT2JqZWN0ID0gZnVuY3Rpb24odmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpe1xyXG5cdHZhciByZXQgPSByZXF1aXJlKFwiLi9iYXNlXCIpLmNyZWF0ZUZvck9iamVjdCh2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCk7XHJcblxyXG5cdHJldC5zd2FybSAgICAgICAgICAgPSBudWxsO1xyXG5cdHJldC5vblJldHVybiAgICAgICAgPSBudWxsO1xyXG5cdHJldC5vblJlc3VsdCAgICAgICAgPSBudWxsO1xyXG5cdHJldC5hc3luY1JldHVybiAgICAgPSBudWxsO1xyXG5cdHJldC5yZXR1cm4gICAgICAgICAgPSBudWxsO1xyXG5cdHJldC5ob21lICAgICAgICAgICAgPSBudWxsO1xyXG5cclxuXHRyZXR1cm4gcmV0O1xyXG59OyIsImV4cG9ydHMuY3JlYXRlRm9yT2JqZWN0ID0gZnVuY3Rpb24odmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpe1xyXG5cdHJldHVybiByZXF1aXJlKFwiLi9iYXNlXCIpLmNyZWF0ZUZvck9iamVjdCh2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCk7XHJcbn07IiwiLypcclxuSW5pdGlhbCBMaWNlbnNlOiAoYykgQXhpb2xvZ2ljIFJlc2VhcmNoICYgQWxib2FpZSBTw65uaWPEgy5cclxuQ29udHJpYnV0b3JzOiBBeGlvbG9naWMgUmVzZWFyY2ggLCBQcml2YXRlU2t5IHByb2plY3RcclxuQ29kZSBMaWNlbnNlOiBMR1BMIG9yIE1JVC5cclxuKi9cclxuXHJcbi8vdmFyIGZzID0gcmVxdWlyZShcImZzXCIpO1xyXG4vL3ZhciBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XHJcblxyXG5mdW5jdGlvbiB3cmFwQ2FsbChvcmlnaW5hbCwgcHJlZml4TmFtZSl7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncyl7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcInByZWZpeE5hbWVcIiwgcHJlZml4TmFtZSlcclxuICAgICAgICB2YXIgcHJldmlvdXNQcmVmaXggPSAkJC5saWJyYXJ5UHJlZml4O1xyXG4gICAgICAgICQkLmxpYnJhcnlQcmVmaXggPSBwcmVmaXhOYW1lO1xyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgdmFyIHJldCA9IG9yaWdpbmFsLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgICAgICAgICAkJC5saWJyYXJ5UHJlZml4ID0gcHJldmlvdXNQcmVmaXggO1xyXG4gICAgICAgIH1jYXRjaChlcnIpe1xyXG4gICAgICAgICAgICAkJC5saWJyYXJ5UHJlZml4ID0gcHJldmlvdXNQcmVmaXggO1xyXG4gICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFN3YXJtTGlicmFyeShwcmVmaXhOYW1lLCBmb2xkZXIpe1xyXG4gICAgJCQubGlicmFyaWVzW3ByZWZpeE5hbWVdID0gdGhpcztcclxuICAgIHZhciBwcmVmaXhlZFJlcXVpcmUgPSB3cmFwQ2FsbChmdW5jdGlvbihwYXRoKXtcclxuICAgICAgICByZXR1cm4gcmVxdWlyZShwYXRoKTtcclxuICAgIH0sIHByZWZpeE5hbWUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluY2x1ZGVBbGxJblJvb3QoZm9sZGVyKSB7XHJcbiAgICAgICAgcmV0dXJuICQkLnJlcXVpcmUoZm9sZGVyKTsgLy8gYSBsaWJyYXJ5IGlzIGp1c3QgYSBtb2R1bGVcclxuICAgICAgICAvL3ZhciBzdGF0ID0gZnMuc3RhdFN5bmMocGF0aCk7XHJcbiAgICAgICAgLyp2YXIgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhmb2xkZXIpO1xyXG4gICAgICAgIGZpbGVzLmZvckVhY2goZnVuY3Rpb24oZmlsZU5hbWUpe1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiTG9hZGluZyBcIiwgZmlsZU5hbWUpO1xyXG4gICAgICAgICAgICB2YXIgZXh0ID0gZmlsZU5hbWUuc3Vic3RyKGZpbGVOYW1lLmxhc3RJbmRleE9mKCcuJykgKyAxKTtcclxuICAgICAgICAgICAgaWYoZXh0LnRvTG93ZXJDYXNlKCkgPT0gXCJqc1wiKXtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZ1bGxQYXRoID0gcGF0aC5yZXNvbHZlKGZvbGRlciArIFwiL1wiICsgZmlsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWZpeGVkUmVxdWlyZShmdWxsUGF0aCk7XHJcbiAgICAgICAgICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pKi9cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgZnVuY3Rpb24gd3JhcFN3YXJtUmVsYXRlZEZ1bmN0aW9ucyhzcGFjZSwgcHJlZml4TmFtZSl7XHJcbiAgICAgICAgdmFyIHJldCA9IHt9O1xyXG4gICAgICAgIHZhciBuYW1lcyA9IFtcImNyZWF0ZVwiLCBcImRlc2NyaWJlXCIsIFwic3RhcnRcIiwgXCJyZXN0YXJ0XCJdO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGk8bmFtZXMubGVuZ3RoOyBpKysgKXtcclxuICAgICAgICAgICAgcmV0W25hbWVzW2ldXSA9IHdyYXBDYWxsKHNwYWNlW25hbWVzW2ldXSwgcHJlZml4TmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jYWxsZmxvd3MgICAgICAgID0gdGhpcy5jYWxsZmxvdyAgID0gd3JhcFN3YXJtUmVsYXRlZEZ1bmN0aW9ucygkJC5jYWxsZmxvd3MsIHByZWZpeE5hbWUpO1xyXG4gICAgdGhpcy5zd2FybXMgICAgICAgICAgID0gdGhpcy5zd2FybSAgICAgID0gd3JhcFN3YXJtUmVsYXRlZEZ1bmN0aW9ucygkJC5zd2FybXMsIHByZWZpeE5hbWUpO1xyXG4gICAgdGhpcy5jb250cmFjdHMgICAgICAgID0gdGhpcy5jb250cmFjdCAgID0gd3JhcFN3YXJtUmVsYXRlZEZ1bmN0aW9ucygkJC5jb250cmFjdHMsIHByZWZpeE5hbWUpO1xyXG4gICAgaW5jbHVkZUFsbEluUm9vdChmb2xkZXIsIHByZWZpeE5hbWUpO1xyXG59XHJcblxyXG5leHBvcnRzLmxvYWRMaWJyYXJ5ID0gZnVuY3Rpb24ocHJlZml4TmFtZSwgZm9sZGVyKXtcclxuICAgIHZhciBleGlzdGluZyA9ICQkLmxpYnJhcmllc1twcmVmaXhOYW1lXTtcclxuICAgIGlmKGV4aXN0aW5nICl7XHJcbiAgICAgICAgaWYoZm9sZGVyKSB7XHJcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci53YXJuaW5nKFwiUmV1c2luZyBhbHJlYWR5IGxvYWRlZCBsaWJyYXJ5IFwiICsgcHJlZml4TmFtZSArIFwiY291bGQgYmUgYW4gZXJyb3IhXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXhpc3Rpbmc7XHJcbiAgICB9XHJcbiAgICAvL3ZhciBhYnNvbHV0ZVBhdGggPSBwYXRoLnJlc29sdmUoZm9sZGVyKTtcclxuICAgIHJldHVybiBuZXcgU3dhcm1MaWJyYXJ5KHByZWZpeE5hbWUsIGZvbGRlcik7XHJcbn0iLCJcclxudmFyIGpvaW5Db3VudGVyID0gMDtcclxuXHJcbmZ1bmN0aW9uIFBhcmFsbGVsSm9pblBvaW50KHN3YXJtLCBjYWxsYmFjaywgYXJncyl7XHJcbiAgICBqb2luQ291bnRlcisrO1xyXG4gICAgdmFyIGNoYW5uZWxJZCA9IFwiUGFyYWxsZWxKb2luUG9pbnRcIiArIGpvaW5Db3VudGVyO1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgdmFyIGNvdW50ZXIgPSAwO1xyXG4gICAgdmFyIHN0b3BPdGhlckV4ZWN1dGlvbiAgICAgPSBmYWxzZTtcclxuXHJcbiAgICBmdW5jdGlvbiBleGVjdXRpb25TdGVwKHN0ZXBGdW5jLCBsb2NhbEFyZ3MsIHN0b3Ape1xyXG5cclxuICAgICAgICB0aGlzLmRvRXhlY3V0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmKHN0b3BPdGhlckV4ZWN1dGlvbil7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAgICAgc3RlcEZ1bmMuYXBwbHkoc3dhcm0sIGxvY2FsQXJncyk7XHJcbiAgICAgICAgICAgICAgICBpZihzdG9wKXtcclxuICAgICAgICAgICAgICAgICAgICBzdG9wT3RoZXJFeGVjdXRpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOyAvL2V2ZXJ5dGluZyBpcyBmaW5lXHJcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICAgICAgICAgIGFyZ3MudW5zaGlmdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgc2VuZEZvclNvdW5kRXhlY3V0aW9uKGNhbGxiYWNrLCBhcmdzLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy9zdG9wIGl0LCBkbyBub3QgY2FsbCBhZ2FpbiBhbnl0aGluZ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKXtcclxuICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IoXCJpbnZhbGlkIGpvaW5cIixzd2FybSwgXCJpbnZhbGlkIGZ1bmN0aW9uIGF0IGpvaW4gaW4gc3dhcm1cIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgICQkLlBTS19QdWJTdWIuc3Vic2NyaWJlKGNoYW5uZWxJZCxmdW5jdGlvbihmb3JFeGVjdXRpb24pe1xyXG4gICAgICAgIGlmKHN0b3BPdGhlckV4ZWN1dGlvbil7XHJcbiAgICAgICAgICAgIHJldHVybiA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGlmKGZvckV4ZWN1dGlvbi5kb0V4ZWN1dGUoKSl7XHJcbiAgICAgICAgICAgICAgICBkZWNDb3VudGVyKCk7XHJcbiAgICAgICAgICAgIH0gLy8gaGFkIGFuIGVycm9yLi4uXHJcbiAgICAgICAgfSBjYXRjaChlcnIpe1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgIC8vJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKFwiX19pbnRlcm5hbF9fXCIsc3dhcm0sIFwiZXhjZXB0aW9uIGluIHRoZSBleGVjdXRpb24gb2YgdGhlIGpvaW4gZnVuY3Rpb24gb2YgYSBwYXJhbGxlbCB0YXNrXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluY0NvdW50ZXIoKXtcclxuICAgICAgICBpZih0ZXN0SWZVbmRlckluc3BlY3Rpb24oKSl7XHJcbiAgICAgICAgICAgIC8vcHJldmVudGluZyBpbnNwZWN0b3IgZnJvbSBpbmNyZWFzaW5nIGNvdW50ZXIgd2hlbiByZWFkaW5nIHRoZSB2YWx1ZXMgZm9yIGRlYnVnIHJlYXNvblxyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwicHJldmVudGluZyBpbnNwZWN0aW9uXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvdW50ZXIrKztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0ZXN0SWZVbmRlckluc3BlY3Rpb24oKXtcclxuICAgICAgICB2YXIgcmVzID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGNvbnN0QXJndiA9IHByb2Nlc3MuZXhlY0FyZ3Yuam9pbigpO1xyXG4gICAgICAgIGlmKGNvbnN0QXJndi5pbmRleE9mKFwiaW5zcGVjdFwiKSE9PS0xIHx8IGNvbnN0QXJndi5pbmRleE9mKFwiZGVidWdcIikhPT0tMSl7XHJcbiAgICAgICAgICAgIC8vb25seSB3aGVuIHJ1bm5pbmcgaW4gZGVidWdcclxuICAgICAgICAgICAgdmFyIGNhbGxzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrO1xyXG4gICAgICAgICAgICBpZihjYWxsc3RhY2suaW5kZXhPZihcIkRlYnVnQ29tbWFuZFByb2Nlc3NvclwiKSE9PS0xKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRGVidWdDb21tYW5kUHJvY2Vzc29yIGRldGVjdGVkIVwiKTtcclxuICAgICAgICAgICAgICAgIHJlcyA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZW5kRm9yU291bmRFeGVjdXRpb24oZnVuY3QsIGFyZ3MsIHN0b3Ape1xyXG4gICAgICAgIHZhciBvYmogPSBuZXcgZXhlY3V0aW9uU3RlcChmdW5jdCwgYXJncywgc3RvcCk7XHJcbiAgICAgICAgJCQuUFNLX1B1YlN1Yi5wdWJsaXNoKGNoYW5uZWxJZCwgb2JqKTsgLy8gZm9yY2UgZXhlY3V0aW9uIHRvIGJlIFwic291bmRcIlxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlY0NvdW50ZXIoKXtcclxuICAgICAgICBjb3VudGVyLS07XHJcbiAgICAgICAgaWYoY291bnRlciA9PSAwKSB7XHJcbiAgICAgICAgICAgIGFyZ3MudW5zaGlmdChudWxsKTtcclxuICAgICAgICAgICAgc2VuZEZvclNvdW5kRXhlY3V0aW9uKGNhbGxiYWNrLCBhcmdzLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBpbm5lciA9IHN3YXJtLmdldElubmVyVmFsdWUoKTtcclxuXHJcbiAgICBmdW5jdGlvbiBkZWZhdWx0UHJvZ3Jlc3NSZXBvcnQoZXJyLCByZXMpe1xyXG4gICAgICAgIGlmKGVycikge1xyXG4gICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHRleHQ6XCJQYXJhbGxlbCBleGVjdXRpb24gcHJvZ3Jlc3MgZXZlbnRcIixcclxuICAgICAgICAgICAgc3dhcm06c3dhcm0sXHJcbiAgICAgICAgICAgIGFyZ3M6YXJncyxcclxuICAgICAgICAgICAgY3VycmVudFJlc3VsdDpyZXNcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1rRnVuY3Rpb24obmFtZSl7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3Mpe1xyXG4gICAgICAgICAgICB2YXIgZiA9IGRlZmF1bHRQcm9ncmVzc1JlcG9ydDtcclxuICAgICAgICAgICAgaWYobmFtZSAhPSBcInByb2dyZXNzXCIpe1xyXG4gICAgICAgICAgICAgICAgZiA9IGlubmVyLm15RnVuY3Rpb25zW25hbWVdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBhcmdzID0gJCQuX19pbnRlcm4ubWtBcmdzKGFyZ3MsIDApO1xyXG4gICAgICAgICAgICBzZW5kRm9yU291bmRFeGVjdXRpb24oZiwgYXJncywgZmFsc2UpO1xyXG4gICAgICAgICAgICByZXR1cm4gX19wcm94eU9iamVjdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wLCByZWNlaXZlcil7XHJcbiAgICAgICAgaWYoaW5uZXIubXlGdW5jdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcCkgfHwgcHJvcCA9PSBcInByb2dyZXNzXCIpe1xyXG4gICAgICAgICAgICBpbmNDb3VudGVyKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBta0Z1bmN0aW9uKHByb3ApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3dhcm1bcHJvcF07XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBfX3Byb3h5T2JqZWN0O1xyXG5cclxuICAgIHRoaXMuX19zZXRQcm94eU9iamVjdCA9IGZ1bmN0aW9uKHApe1xyXG4gICAgICAgIF9fcHJveHlPYmplY3QgPSBwO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnRzLmNyZWF0ZUpvaW5Qb2ludCA9IGZ1bmN0aW9uKHN3YXJtLCBjYWxsYmFjaywgYXJncyl7XHJcbiAgICB2YXIganAgPSBuZXcgUGFyYWxsZWxKb2luUG9pbnQoc3dhcm0sIGNhbGxiYWNrLCBhcmdzKTtcclxuICAgIHZhciBpbm5lciA9IHN3YXJtLmdldElubmVyVmFsdWUoKTtcclxuICAgIHZhciBwID0gbmV3IFByb3h5KGlubmVyLCBqcCk7XHJcbiAgICBqcC5fX3NldFByb3h5T2JqZWN0KHApO1xyXG4gICAgcmV0dXJuIHA7XHJcbn07IiwiXHJcbmZ1bmN0aW9uIGVuY29kZShidWZmZXIpIHtcclxuICAgIHJldHVybiBidWZmZXIudG9TdHJpbmcoJ2Jhc2U2NCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcKy9nLCAnJylcclxuICAgICAgICAucmVwbGFjZSgvXFwvL2csICcnKVxyXG4gICAgICAgIC5yZXBsYWNlKC89KyQvLCAnJyk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBzdGFtcFdpdGhUaW1lKGJ1Ziwgc2FsdCwgbXNhbHQpe1xyXG4gICAgaWYoIXNhbHQpe1xyXG4gICAgICAgIHNhbHQgPSAxO1xyXG4gICAgfVxyXG4gICAgaWYoIW1zYWx0KXtcclxuICAgICAgICBtc2FsdCA9IDE7XHJcbiAgICB9XHJcbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlO1xyXG4gICAgdmFyIGN0ID0gTWF0aC5mbG9vcihkYXRlLmdldFRpbWUoKSAvIHNhbHQpO1xyXG4gICAgdmFyIGNvdW50ZXIgPSAwO1xyXG4gICAgd2hpbGUoY3QgPiAwICl7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkNvdW50ZXJcIiwgY291bnRlciwgY3QpO1xyXG4gICAgICAgIGJ1Zltjb3VudGVyKm1zYWx0XSA9IE1hdGguZmxvb3IoY3QgJSAyNTYpO1xyXG4gICAgICAgIGN0ID0gTWF0aC5mbG9vcihjdCAvIDI1Nik7XHJcbiAgICAgICAgY291bnRlcisrO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKlxyXG4gICAgVGhlIHVpZCBjb250YWlucyBhcm91bmQgMjU2IGJpdHMgb2YgcmFuZG9tbmVzcyBhbmQgYXJlIHVuaXF1ZSBhdCB0aGUgbGV2ZWwgb2Ygc2Vjb25kcy4gVGhpcyBVVUlEIHNob3VsZCBieSBjcnlwdG9ncmFwaGljYWxseSBzYWZlIChjYW4gbm90IGJlIGd1ZXNzZWQpXHJcblxyXG4gICAgV2UgZ2VuZXJhdGUgYSBzYWZlIFVJRCB0aGF0IGlzIGd1YXJhbnRlZWQgdW5pcXVlIChieSB1c2FnZSBvZiBhIFBSTkcgdG8gZ2VuZWF0ZSAyNTYgYml0cykgYW5kIHRpbWUgc3RhbXBpbmcgd2l0aCB0aGUgbnVtYmVyIG9mIHNlY29uZHMgYXQgdGhlIG1vbWVudCB3aGVuIGlzIGdlbmVyYXRlZFxyXG4gICAgVGhpcyBtZXRob2Qgc2hvdWxkIGJlIHNhZmUgdG8gdXNlIGF0IHRoZSBsZXZlbCBvZiB2ZXJ5IGxhcmdlIGRpc3RyaWJ1dGVkIHN5c3RlbXMuXHJcbiAgICBUaGUgVVVJRCBpcyBzdGFtcGVkIHdpdGggdGltZSAoc2Vjb25kcyk6IGRvZXMgaXQgb3BlbiBhIHdheSB0byBndWVzcyB0aGUgVVVJRD8gSXQgZGVwZW5kcyBob3cgc2FmZSBpcyBcImNyeXB0b1wiIFBSTkcsIGJ1dCBpdCBzaG91bGQgYmUgbm8gcHJvYmxlbS4uLlxyXG5cclxuICovXHJcblxyXG5leHBvcnRzLnNhZmVfdXVpZCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICByZXF1aXJlKCdjcnlwdG8nKS5yYW5kb21CeXRlcygzNiwgZnVuY3Rpb24gKGVyciwgYnVmKSB7XHJcbiAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YW1wV2l0aFRpbWUoYnVmLCAxMDAwLCAzKTtcclxuICAgICAgICBjYWxsYmFjayhudWxsLCBlbmNvZGUoYnVmKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuXHJcbi8qXHJcbiAgICBUcnkgdG8gZ2VuZXJhdGUgYSBzbWFsbCBVSUQgdGhhdCBpcyB1bmlxdWUgYWdhaW5zdCBjaGFuY2UgaW4gdGhlIHNhbWUgbWlsbGlzZWNvbmQgc2Vjb25kIGFuZCBpbiBhIHNwZWNpZmljIGNvbnRleHQgKGVnIGluIHRoZSBzYW1lIGNob3Jlb2dyYXBoeSBleGVjdXRpb24pXHJcbiAgICBUaGUgaWQgY29udGFpbnMgYXJvdW5kIDYqOCA9IDQ4ICBiaXRzIG9mIHJhbmRvbW5lc3MgYW5kIGFyZSB1bmlxdWUgYXQgdGhlIGxldmVsIG9mIG1pbGxpc2Vjb25kc1xyXG4gICAgVGhpcyBtZXRob2QgaXMgc2FmZSBvbiBhIHNpbmdsZSBjb21wdXRlciBidXQgc2hvdWxkIGJlIHVzZWQgd2l0aCBjYXJlIG90aGVyd2lzZVxyXG4gICAgVGhpcyBVVUlEIGlzIG5vdCBjcnlwdG9ncmFwaGljYWxseSBzYWZlIChjYW4gYmUgZ3Vlc3NlZClcclxuICovXHJcbmV4cG9ydHMuc2hvcnRfdXVpZCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICByZXF1aXJlKCdjcnlwdG8nKS5yYW5kb21CeXRlcygxMiwgZnVuY3Rpb24gKGVyciwgYnVmKSB7XHJcbiAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YW1wV2l0aFRpbWUoYnVmLDEsMik7XHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgZW5jb2RlKGJ1ZikpO1xyXG4gICAgfSk7XHJcbn0iLCJcclxudmFyIGpvaW5Db3VudGVyID0gMDtcclxuXHJcbmZ1bmN0aW9uIFNlcmlhbEpvaW5Qb2ludChzd2FybSwgY2FsbGJhY2ssIGFyZ3Mpe1xyXG5cclxuICAgIGpvaW5Db3VudGVyKys7XHJcblxyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgdmFyIGNoYW5uZWxJZCA9IFwiU2VyaWFsSm9pblBvaW50XCIgKyBqb2luQ291bnRlcjtcclxuXHJcbiAgICBpZih0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIil7XHJcbiAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKFwidW5rbm93blwiLCBzd2FybSwgXCJpbnZhbGlkIGZ1bmN0aW9uIGdpdmVuIHRvIHNlcmlhbCBpbiBzd2FybVwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBkZWZhdWx0UHJvZ3Jlc3NSZXBvcnQoZXJyLCByZXMpe1xyXG4gICAgICAgIGlmKGVycikge1xyXG4gICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHZhciBmdW5jdGlvbkNvdW50ZXIgICAgID0gMDtcclxuICAgIHZhciBleGVjdXRpb25Db3VudGVyICAgID0gMDtcclxuXHJcbiAgICB2YXIgcGxhbm5lZEV4ZWN1dGlvbnMgICA9IFtdO1xyXG4gICAgdmFyIHBsYW5uZWRBcmd1bWVudHMgICAgPSB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBta0Z1bmN0aW9uKG5hbWUsIHBvcyl7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkNyZWF0aW5nIGZ1bmN0aW9uIFwiLCBuYW1lLCBwb3MpO1xyXG4gICAgICAgIHBsYW5uZWRBcmd1bWVudHNbcG9zXSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdHJpZ2dldE5leHRTdGVwKCl7XHJcbiAgICAgICAgICAgIGlmKHBsYW5uZWRFeGVjdXRpb25zLmxlbmd0aCA9PSBleGVjdXRpb25Db3VudGVyIHx8IHBsYW5uZWRBcmd1bWVudHNbZXhlY3V0aW9uQ291bnRlcl0gKSAge1xyXG4gICAgICAgICAgICAgICAgJCQuUFNLX1B1YlN1Yi5wdWJsaXNoKGNoYW5uZWxJZCwgc2VsZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBmID0gZnVuY3Rpb24gKC4uLmFyZ3Mpe1xyXG4gICAgICAgICAgICBpZihleGVjdXRpb25Db3VudGVyICE9IHBvcykge1xyXG4gICAgICAgICAgICAgICAgcGxhbm5lZEFyZ3VtZW50c1twb3NdID0gYXJncztcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJEZWxheWluZyBmdW5jdGlvbjpcIiwgZXhlY3V0aW9uQ291bnRlciwgcG9zLCBwbGFubmVkQXJndW1lbnRzLCBhcmd1bWVudHMsIGZ1bmN0aW9uQ291bnRlcik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gX19wcm94eTtcclxuICAgICAgICAgICAgfSBlbHNle1xyXG4gICAgICAgICAgICAgICAgaWYocGxhbm5lZEFyZ3VtZW50c1twb3NdKXtcclxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiRXhlY3V0aW5nICBmdW5jdGlvbjpcIiwgZXhlY3V0aW9uQ291bnRlciwgcG9zLCBwbGFubmVkQXJndW1lbnRzLCBhcmd1bWVudHMsIGZ1bmN0aW9uQ291bnRlcik7XHJcblx0XHRcdFx0XHRhcmdzID0gcGxhbm5lZEFyZ3VtZW50c1twb3NdO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGFubmVkQXJndW1lbnRzW3Bvc10gPSBhcmdzO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXROZXh0U3RlcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfX3Byb3h5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgZiA9IGRlZmF1bHRQcm9ncmVzc1JlcG9ydDtcclxuICAgICAgICAgICAgaWYobmFtZSAhPSBcInByb2dyZXNzXCIpe1xyXG4gICAgICAgICAgICAgICAgZiA9IGlubmVyLm15RnVuY3Rpb25zW25hbWVdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAgICAgZi5hcHBseShzZWxmLGFyZ3MpO1xyXG4gICAgICAgICAgICB9IGNhdGNoKGVycil7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJncy51bnNoaWZ0KGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoc3dhcm0sYXJncyk7IC8vZXJyb3JcclxuICAgICAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLnVuc3Vic2NyaWJlKGNoYW5uZWxJZCxydW5OZXh0RnVuY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvL3Rlcm1pbmF0ZSBleGVjdXRpb24gd2l0aCBhbiBlcnJvci4uLiFcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBleGVjdXRpb25Db3VudGVyKys7XHJcblxyXG4gICAgICAgICAgICB0cmlnZ2V0TmV4dFN0ZXAoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBfX3Byb3h5O1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYW5uZWRFeGVjdXRpb25zLnB1c2goZik7XHJcbiAgICAgICAgZnVuY3Rpb25Db3VudGVyKys7XHJcbiAgICAgICAgcmV0dXJuIGY7XHJcbiAgICB9XHJcblxyXG4gICAgIHZhciBmaW5pc2hlZCA9IGZhbHNlO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJ1bk5leHRGdW5jdGlvbigpe1xyXG4gICAgICAgIGlmKGV4ZWN1dGlvbkNvdW50ZXIgPT0gcGxhbm5lZEV4ZWN1dGlvbnMubGVuZ3RoICl7XHJcbiAgICAgICAgICAgIGlmKCFmaW5pc2hlZCl7XHJcbiAgICAgICAgICAgICAgICBhcmdzLnVuc2hpZnQobnVsbCk7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShzd2FybSxhcmdzKTtcclxuICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIudW5zdWJzY3JpYmUoY2hhbm5lbElkLHJ1bk5leHRGdW5jdGlvbik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNlcmlhbCBjb25zdHJ1Y3QgaXMgdXNpbmcgZnVuY3Rpb25zIHRoYXQgYXJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcy4uLlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBsYW5uZWRFeGVjdXRpb25zW2V4ZWN1dGlvbkNvdW50ZXJdKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICQkLlBTS19QdWJTdWIuc3Vic2NyaWJlKGNoYW5uZWxJZCxydW5OZXh0RnVuY3Rpb24pOyAvLyBmb3JjZSBpdCB0byBiZSBcInNvdW5kXCJcclxuXHJcblxyXG4gICAgdGhpcy5nZXQgPSBmdW5jdGlvbih0YXJnZXQsIHByb3AsIHJlY2VpdmVyKXtcclxuICAgICAgICBpZihwcm9wID09IFwicHJvZ3Jlc3NcIiB8fCBpbm5lci5teUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wKSl7XHJcbiAgICAgICAgICAgIHJldHVybiBta0Z1bmN0aW9uKHByb3AsIGZ1bmN0aW9uQ291bnRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzd2FybVtwcm9wXTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgX19wcm94eTtcclxuICAgIHRoaXMuc2V0UHJveHlPYmplY3QgPSBmdW5jdGlvbihwKXtcclxuICAgICAgICBfX3Byb3h5ID0gcDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0cy5jcmVhdGVTZXJpYWxKb2luUG9pbnQgPSBmdW5jdGlvbihzd2FybSwgY2FsbGJhY2ssIGFyZ3Mpe1xyXG4gICAgdmFyIGpwID0gbmV3IFNlcmlhbEpvaW5Qb2ludChzd2FybSwgY2FsbGJhY2ssIGFyZ3MpO1xyXG4gICAgdmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xyXG4gICAgdmFyIHAgPSBuZXcgUHJveHkoaW5uZXIsIGpwKTtcclxuICAgIGpwLnNldFByb3h5T2JqZWN0KHApO1xyXG4gICAgcmV0dXJuIHA7XHJcbn0iLCJmdW5jdGlvbiBTd2FybVNwYWNlKHN3YXJtVHlwZSwgdXRpbHMpIHtcclxuXHJcbiAgICB2YXIgYmVlc0hlYWxlciA9ICQkLnJlcXVpcmUoXCJzb3VuZHB1YnN1YlwiKS5iZWVzSGVhbGVyO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldEZ1bGxOYW1lKHNob3J0TmFtZSl7XHJcbiAgICAgICAgdmFyIGZ1bGxOYW1lO1xyXG4gICAgICAgIGlmKHNob3J0TmFtZSAmJiBzaG9ydE5hbWUuaW5jbHVkZXMoXCIuXCIpKSB7XHJcbiAgICAgICAgICAgIGZ1bGxOYW1lID0gc2hvcnROYW1lO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZ1bGxOYW1lID0gJCQubGlicmFyeVByZWZpeCArIFwiLlwiICsgc2hvcnROYW1lOyAvL1RPRE86IGNoZWNrIG1vcmUgYWJvdXQgLiAhP1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZnVsbE5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gVmFyRGVzY3JpcHRpb24oZGVzYyl7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaW5pdDpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVzdG9yZTpmdW5jdGlvbihqc29uU3RyaW5nKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGpzb25TdHJpbmcpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0b0pzb25TdHJpbmc6ZnVuY3Rpb24oeCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gU3dhcm1EZXNjcmlwdGlvbihzd2FybVR5cGVOYW1lLCBkZXNjcmlwdGlvbil7XHJcblxyXG4gICAgICAgIHN3YXJtVHlwZU5hbWUgPSBnZXRGdWxsTmFtZShzd2FybVR5cGVOYW1lKTtcclxuXHJcbiAgICAgICAgdmFyIGxvY2FsSWQgPSAwOyAgLy8gdW5pcXVlIGZvciBlYWNoIHN3YXJtXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZVZhcnMoZGVzY3Ipe1xyXG4gICAgICAgICAgICB2YXIgbWVtYmVycyA9IHt9O1xyXG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gZGVzY3Ipe1xyXG4gICAgICAgICAgICAgICAgbWVtYmVyc1t2XSA9IG5ldyBWYXJEZXNjcmlwdGlvbihkZXNjclt2XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG1lbWJlcnM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVNZW1iZXJzKGRlc2NyKXtcclxuICAgICAgICAgICAgdmFyIG1lbWJlcnMgPSB7fTtcclxuICAgICAgICAgICAgZm9yKHZhciB2IGluIGRlc2NyaXB0aW9uKXtcclxuXHJcbiAgICAgICAgICAgICAgICBpZih2ICE9IFwicHVibGljXCIgJiYgdiAhPSBcInByaXZhdGVcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1t2XSA9IGRlc2NyaXB0aW9uW3ZdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBtZW1iZXJzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHB1YmxpY1ZhcnMgPSBjcmVhdGVWYXJzKGRlc2NyaXB0aW9uLnB1YmxpYyk7XHJcbiAgICAgICAgdmFyIHByaXZhdGVWYXJzID0gY3JlYXRlVmFycyhkZXNjcmlwdGlvbi5wcml2YXRlKTtcclxuICAgICAgICB2YXIgbXlGdW5jdGlvbnMgPSBjcmVhdGVNZW1iZXJzKGRlc2NyaXB0aW9uKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlUGhhc2UodGhpc0luc3RhbmNlLCBmdW5jKXtcclxuICAgICAgICAgICAgdmFyIHBoYXNlID0gZnVuY3Rpb24oLi4uYXJncyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmV0O1xyXG4gICAgICAgICAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIuYmxvY2tDYWxsQmFja3MoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXQgPSBmdW5jLmFwcGx5KHRoaXNJbnN0YW5jZSwgYXJncyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCQuUFNLX1B1YlN1Yi5yZWxlYXNlQ2FsbEJhY2tzKCk7XHJcbiAgICAgICAgICAgICAgICB9Y2F0Y2goZXJyKXtcclxuICAgICAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLnJlbGVhc2VDYWxsQmFja3MoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vZHluYW1pYyBuYW1lZCBmdW5jIGluIG9yZGVyIHRvIGltcHJvdmUgY2FsbHN0YWNrXHJcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwaGFzZSwgXCJuYW1lXCIsIHtnZXQ6IGZ1bmN0aW9uKCl7cmV0dXJuIHN3YXJtVHlwZU5hbWUrXCIuXCIrZnVuYy5uYW1lfX0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcGhhc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpc2UgPSBmdW5jdGlvbihzZXJpYWxpc2VkVmFsdWVzKXtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgICAgICAgICBwdWJsaWNWYXJzOntcclxuXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcHJpdmF0ZVZhcnM6e1xyXG5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwcm90ZWN0ZWRWYXJzOntcclxuXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbXlGdW5jdGlvbnM6e1xyXG5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB1dGlsaXR5RnVuY3Rpb25zOntcclxuXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbWV0YTp7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1UeXBlTmFtZTpzd2FybVR5cGVOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHN3YXJtRGVzY3JpcHRpb246ZGVzY3JpcHRpb25cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gcHVibGljVmFycyl7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVibGljVmFyc1t2XSA9IHB1YmxpY1ZhcnNbdl0uaW5pdCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZm9yKHZhciB2IGluIHByaXZhdGVWYXJzKXtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wcml2YXRlVmFyc1t2XSA9IHByaXZhdGVWYXJzW3ZdLmluaXQoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgICAgICBpZihzZXJpYWxpc2VkVmFsdWVzKXtcclxuICAgICAgICAgICAgICAgIGJlZXNIZWFsZXIuanNvblRvTmF0aXZlKHNlcmlhbGlzZWRWYWx1ZXMsIHJlc3VsdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpc2VGdW5jdGlvbnMgPSBmdW5jdGlvbih2YWx1ZU9iamVjdCwgdGhpc09iamVjdCl7XHJcblxyXG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gbXlGdW5jdGlvbnMpe1xyXG4gICAgICAgICAgICAgICAgdmFsdWVPYmplY3QubXlGdW5jdGlvbnNbdl0gPSBjcmVhdGVQaGFzZSh0aGlzT2JqZWN0LCBteUZ1bmN0aW9uc1t2XSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsb2NhbElkKys7XHJcbiAgICAgICAgICAgIHZhbHVlT2JqZWN0LnV0aWxpdHlGdW5jdGlvbnMgPSB1dGlscy5jcmVhdGVGb3JPYmplY3QodmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpe1xyXG5cclxuXHJcbiAgICAgICAgICAgIGlmKHB1YmxpY1ZhcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnB1YmxpY1ZhcnNbcHJvcGVydHldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZihwcml2YXRlVmFycy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQucHJpdmF0ZVZhcnNbcHJvcGVydHldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZih0YXJnZXQudXRpbGl0eUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXHJcbiAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnV0aWxpdHlGdW5jdGlvbnNbcHJvcGVydHldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYobXlGdW5jdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0Lm15RnVuY3Rpb25zW3Byb3BlcnR5XTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0LnByb3RlY3RlZFZhcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnByb3RlY3RlZFZhcnNbcHJvcGVydHldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZih0eXBlb2YgcHJvcGVydHkgIT0gXCJzeW1ib2xcIikge1xyXG4gICAgICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKHByb3BlcnR5LCB0YXJnZXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNldCA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcil7XHJcblxyXG4gICAgICAgICAgICBpZih0YXJnZXQudXRpbGl0eUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkgfHwgdGFyZ2V0Lm15RnVuY3Rpb25zLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xyXG4gICAgICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKHByb3BlcnR5KTtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRyeWluZyB0byBvdmVyd3JpdGUgaW1tdXRhYmxlIG1lbWJlclwiICsgcHJvcGVydHkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZihwcml2YXRlVmFycy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5wcml2YXRlVmFyc1twcm9wZXJ0eV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICAgIGlmKHB1YmxpY1ZhcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQucHVibGljVmFyc1twcm9wZXJ0eV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5wcm90ZWN0ZWRWYXJzW3Byb3BlcnR5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5hcHBseSA9IGZ1bmN0aW9uKHRhcmdldCwgdGhpc0FyZywgYXJndW1lbnRzTGlzdCl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUHJveHkgYXBwbHlcIik7XHJcbiAgICAgICAgICAgIC8vdmFyIGZ1bmMgPSB0YXJnZXRbXVxyXG4gICAgICAgICAgICAvL3N3YXJtR2xvYmFscy5leGVjdXRpb25Qcm92aWRlci5leGVjdXRlKG51bGwsIHRoaXNBcmcsIGZ1bmMsIGFyZ3VtZW50c0xpc3QpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHRoaXMuaXNFeHRlbnNpYmxlID0gZnVuY3Rpb24odGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmhhcyA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCkge1xyXG4gICAgICAgICAgICBpZih0YXJnZXQucHVibGljVmFyc1twcm9wXSB8fCB0YXJnZXQucHJvdGVjdGVkVmFyc1twcm9wXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMub3duS2V5cyA9IGZ1bmN0aW9uKHRhcmdldCkge1xyXG4gICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5vd25LZXlzKHRhcmdldC5wdWJsaWNWYXJzKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2VyaWFsaXNlZFZhbHVlcyl7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZU9iamVjdCA9IHNlbGYuaW5pdGlhbGlzZShzZXJpYWxpc2VkVmFsdWVzKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBQcm94eSh2YWx1ZU9iamVjdCxzZWxmKTtcclxuICAgICAgICAgICAgc2VsZi5pbml0aWFsaXNlRnVuY3Rpb25zKHZhbHVlT2JqZWN0LHJlc3VsdCk7XHJcbiAgICAgICAgICAgIGlmKCFzZXJpYWxpc2VkVmFsdWVzKXtcclxuICAgICAgICAgICAgICAgICQkLnVpZEdlbmVyYXRvci5zYWZlX3V1aWQoZnVuY3Rpb24gKGVyciwgcmVzdWx0KXtcclxuICAgICAgICAgICAgICAgICAgICBpZighdmFsdWVPYmplY3QubWV0YS5zd2FybUlkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVPYmplY3QubWV0YS5zd2FybUlkID0gcmVzdWx0OyAgLy9kbyBub3Qgb3ZlcndyaXRlISEhXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlT2JqZWN0LnV0aWxpdHlGdW5jdGlvbnMubm90aWZ5KCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgZGVzY3JpcHRpb25zID0ge307XHJcblxyXG4gICAgdGhpcy5kZXNjcmliZSA9IGZ1bmN0aW9uIGRlc2NyaWJlU3dhcm0oc3dhcm1UeXBlTmFtZSwgZGVzY3JpcHRpb24pe1xyXG4gICAgICAgIHN3YXJtVHlwZU5hbWUgPSBnZXRGdWxsTmFtZShzd2FybVR5cGVOYW1lKTtcclxuXHJcbiAgICAgICAgdmFyIHBvaW50UG9zID0gc3dhcm1UeXBlTmFtZS5sYXN0SW5kZXhPZignLicpO1xyXG4gICAgICAgIHZhciBzaG9ydE5hbWUgPSBzd2FybVR5cGVOYW1lLnN1YnN0ciggcG9pbnRQb3MrIDEpO1xyXG4gICAgICAgIHZhciBsaWJyYXJ5TmFtZSA9IHN3YXJtVHlwZU5hbWUuc3Vic3RyKDAsIHBvaW50UG9zKTtcclxuICAgICAgICBpZighbGlicmFyeU5hbWUpe1xyXG4gICAgICAgICAgICBsaWJyYXJ5TmFtZSA9IFwiZ2xvYmFsXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZGVzY3JpcHRpb24gPSBuZXcgU3dhcm1EZXNjcmlwdGlvbihzd2FybVR5cGVOYW1lLCBkZXNjcmlwdGlvbik7XHJcbiAgICAgICAgaWYoZGVzY3JpcHRpb25zW3N3YXJtVHlwZU5hbWVdICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci53YXJuaW5nKFwiRHVwbGljYXRlIHN3YXJtIGRlc2NyaXB0aW9uIFwiKyBzd2FybVR5cGVOYW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRlc2NyaXB0aW9uc1tzd2FybVR5cGVOYW1lXSA9IGRlc2NyaXB0aW9uO1xyXG5cclxuICAgICAgICBpZigkJC5yZWdpc3RlclN3YXJtRGVzY3JpcHRpb24pe1xyXG5cdFx0XHQkJC5yZWdpc3RlclN3YXJtRGVzY3JpcHRpb24obGlicmFyeU5hbWUsIHNob3J0TmFtZSwgc3dhcm1UeXBlTmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZXNjcmlwdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZVN3YXJtKHN3YXJtVHlwZU5hbWUsIGRlc2NyaXB0aW9uLCBpbml0aWFsVmFsdWVzKXtcclxuICAgICAgICBzd2FybVR5cGVOYW1lID0gZ2V0RnVsbE5hbWUoc3dhcm1UeXBlTmFtZSk7XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICBpZih1bmRlZmluZWQgPT0gZGVzY3JpcHRpb24pe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0aW9uc1tzd2FybVR5cGVOYW1lXShpbml0aWFsVmFsdWVzKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRlc2NyaWJlKHN3YXJtVHlwZU5hbWUsIGRlc2NyaXB0aW9uKShpbml0aWFsVmFsdWVzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDcmVhdGVTd2FybSBlcnJvclwiLCBlcnIpO1xyXG4gICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIuZXJyb3IoZXJyLCBhcmd1bWVudHMsIFwiV3JvbmcgbmFtZSBvciBkZXNjcmlwdGlvbnNcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVzdGFydCA9IGZ1bmN0aW9uKHN3YXJtVHlwZU5hbWUsIGluaXRpYWxWYWx1ZXMpe1xyXG4gICAgICAgIHN3YXJtVHlwZU5hbWUgPSBnZXRGdWxsTmFtZShzd2FybVR5cGVOYW1lKTtcclxuICAgICAgICB2YXIgZGVzYyA9IGRlc2NyaXB0aW9uc1tzd2FybVR5cGVOYW1lXTtcclxuXHJcbiAgICAgICAgaWYoZGVzYyl7XHJcbiAgICAgICAgICAgIHJldHVybiBkZXNjKGluaXRpYWxWYWx1ZXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihzd2FybVR5cGVOYW1lLGluaXRpYWxWYWx1ZXMsXHJcbiAgICAgICAgICAgICAgICBcIkZhaWxlZCB0byByZXN0YXJ0IGEgc3dhcm0gd2l0aCB0eXBlIFwiICsgc3dhcm1UeXBlTmFtZSArIFwiXFxuIE1heWJlIGRpZmZyZW50IHN3YXJtIHNwYWNlICh1c2VkIGZsb3cgaW5zdGVhZCBvZiBzd2FybSE/KVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKHN3YXJtVHlwZU5hbWUsIC4uLnBhcmFtcyl7XHJcbiAgICAgICAgc3dhcm1UeXBlTmFtZSA9IGdldEZ1bGxOYW1lKHN3YXJtVHlwZU5hbWUpO1xyXG4gICAgICAgIHZhciBkZXNjID0gZGVzY3JpcHRpb25zW3N3YXJtVHlwZU5hbWVdO1xyXG4gICAgICAgIGlmKCFkZXNjKXtcclxuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKG51bGwsIHN3YXJtVHlwZU5hbWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHJlcyA9IGRlc2MoKTtcclxuXHJcbiAgICAgICAgaWYocGFyYW1zLmxlbmd0aCA+IDEpe1xyXG4gICAgICAgICAgICB2YXIgYXJncyA9W107XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7aSA8IHBhcmFtcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2gocGFyYW1zW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXMuc3dhcm0uYXBwbHkocmVzLCBhcmdzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydHMuY3JlYXRlU3dhcm1FbmdpbmUgPSBmdW5jdGlvbihzd2FybVR5cGUsIHV0aWxzKXtcclxuICAgIGlmKHR5cGVvZiB1dGlscyA9PSBcInVuZGVmaW5lZFwiKXtcclxuICAgICAgICB1dGlscyA9IHJlcXVpcmUoXCIuL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvY2FsbGZsb3dcIik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IFN3YXJtU3BhY2Uoc3dhcm1UeXBlLCB1dGlscyk7XHJcbn07IiwiXHJcbi8vdmFyIHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRFcnJvckhhbmRsaW5nSW1wbGVtZW50YXRpb24oZXJyLCByZXMpe1xyXG5cdC8vY29uc29sZS5sb2coZXJyLnN0YWNrKTtcclxuXHRpZihlcnIpIHRocm93IGVycjtcclxuXHRyZXR1cm4gcmVzO1xyXG59XHJcblxyXG5cclxuaWYodHlwZW9mKGdsb2JhbC4kJCkgPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgZ2xvYmFsLiQkID0ge307XHJcbn1cclxuXHJcbiQkLmVycm9ySGFuZGxlciA9IHtcclxuICAgICAgICBlcnJvcjpmdW5jdGlvbihlcnIsIGFyZ3MsIG1zZyl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVyciwgXCJVbmtub3duIGVycm9yIGZyb20gZnVuY3Rpb24gY2FsbCB3aXRoIGFyZ3VtZW50czpcIiwgYXJncywgXCJNZXNzYWdlOlwiLCBtc2cpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGhyb3dFcnJvcjpmdW5jdGlvbihlcnIsIGFyZ3MsIG1zZyl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVyciwgXCJVbmtub3duIGVycm9yIGZyb20gZnVuY3Rpb24gY2FsbCB3aXRoIGFyZ3VtZW50czpcIiwgYXJncywgXCJNZXNzYWdlOlwiLCBtc2cpO1xyXG4gICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpZ25vcmVQb3NzaWJsZUVycm9yOiBmdW5jdGlvbihuYW1lKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobmFtZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzeW50YXhFcnJvcjpmdW5jdGlvbihwcm9wZXJ0eSwgc3dhcm0sIHRleHQpe1xyXG4gICAgICAgICAgICAvL3Rocm93IG5ldyBFcnJvcihcIk1pc3NwZWxsZWQgbWVtYmVyIG5hbWUgb3Igb3RoZXIgaW50ZXJuYWwgZXJyb3IhXCIpO1xyXG4gICAgICAgICAgICB2YXIgc3dhcm1OYW1lO1xyXG4gICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgICAgICBpZih0eXBlb2Ygc3dhcm0gPT0gXCJzdHJpbmdcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1OYW1lID0gc3dhcm07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2VcclxuICAgICAgICAgICAgICAgIGlmKHN3YXJtICYmIHN3YXJtLm1ldGEpe1xyXG4gICAgICAgICAgICAgICAgICAgIHN3YXJtTmFtZSAgPSBzd2FybS5tZXRhLnN3YXJtVHlwZU5hbWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3YXJtTmFtZSA9IHN3YXJtLmdldElubmVyVmFsdWUoKS5tZXRhLnN3YXJtVHlwZU5hbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICAgICAgICAgIHN3YXJtTmFtZSA9IGVyci50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHByb3BlcnR5KXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiV3JvbmcgbWVtYmVyIG5hbWUgXCIsIHByb3BlcnR5LCAgXCIgaW4gc3dhcm0gXCIsIHN3YXJtTmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZih0ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVua25vd24gc3dhcm1cIiwgc3dhcm1OYW1lKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9LFxyXG4gICAgICAgIHdhcm5pbmc6ZnVuY3Rpb24obXNnKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobXNnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuJCQudWlkR2VuZXJhdG9yID0gcmVxdWlyZShcIi4vbGliL3NhZmUtdXVpZFwiKTtcclxuXHJcbiQkLnNhZmVFcnJvckhhbmRsaW5nID0gZnVuY3Rpb24oY2FsbGJhY2spe1xyXG4gICAgICAgIGlmKGNhbGxiYWNrKXtcclxuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrO1xyXG4gICAgICAgIH0gZWxzZXtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRFcnJvckhhbmRsaW5nSW1wbGVtZW50YXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiQkLl9faW50ZXJuID0ge1xyXG4gICAgICAgIG1rQXJnczpmdW5jdGlvbihhcmdzLHBvcyl7XHJcbiAgICAgICAgICAgIHZhciBhcmdzQXJyYXkgPSBbXTtcclxuICAgICAgICAgICAgZm9yKHZhciBpID0gcG9zOyBpIDwgYXJncy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICBhcmdzQXJyYXkucHVzaChhcmdzW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYXJnc0FycmF5O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4kJC5fX2dsb2JhbCA9IHtcclxuXHJcbiAgICB9O1xyXG5cclxuXHJcbiQkLl9fZ2xvYmFsLm9yaWdpbmFsUmVxdWlyZSA9IHJlcXVpcmU7XHJcblxyXG5pZih0eXBlb2YoJCQuX19ydW50aW1lTW9kdWxlcykgPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgJCQuX19ydW50aW1lTW9kdWxlcyA9IHt9O1xyXG59XHJcblxyXG5cclxuLypcclxuIHJlcXVpcmUgYW5kIHJlcXVpcmVMaWJyYXJ5IGFyZSBvdmVyd3JpdGluZyB0aGUgbm9kZS5qcyBkZWZhdWx0cyBpbiBsb2FkaW5nIG1vZHVsZXMgZm9yIGluY3JlYXNpbmcgc2VjdXJpdHkgYW5kIHNwZWVkLlxyXG4gV2UgZ3VhcmFudGVlIHRoYXQgZWFjaCBtb2R1bGUgb3IgbGlicmFyeSBpcyBsb2FkZWQgb25seSBvbmNlIGFuZCBvbmx5IGZyb20gYSBzaW5nbGUgZm9sZGVyLi4uIFVzZSB0aGUgc3RhbmRhcmQgcmVxdWlyZSBpZiB5b3UgbmVlZCBzb21ldGhpbmcgZWxzZSFcclxuXHJcbiBCeSBkZWZhdWx0IHdlIGV4cGVjdCB0byBydW4gZnJvbSBhIHByaXZhdGVza3kgVk0gZW5naW5lICggYSBwcml2YXRlc2t5IG5vZGUpIGFuZCB0aGVyZWZvcmUgdGhlIGNhbGxmbG93IHN0YXlzIGluIHRoZSBtb2R1bGVzIGZvbGRlciB0aGVyZS5cclxuIEFueSBuZXcgdXNlIG9mIGNhbGxmbG93IChhbmQgcmVxdWlyZSBvciByZXF1aXJlTGlicmFyeSkgY291bGQgcmVxdWlyZSBjaGFuZ2VzIHRvICQkLl9fZ2xvYmFsLl9fbG9hZExpYnJheVJvb3QgYW5kICQkLl9fZ2xvYmFsLl9fbG9hZE1vZHVsZXNSb290XHJcbiAqL1xyXG4vLyQkLl9fZ2xvYmFsLl9fbG9hZExpYnJhcnlSb290ICAgID0gX19kaXJuYW1lICsgXCIvLi4vLi4vbGlicmFyaWVzL1wiO1xyXG4vLyQkLl9fZ2xvYmFsLl9fbG9hZE1vZHVsZXNSb290ICAgPSBfX2Rpcm5hbWUgKyBcIi8uLi8uLi9tb2R1bGVzL1wiO1xyXG5cclxudmFyIGxvYWRlZE1vZHVsZXMgPSB7fTtcclxuJCQucmVxdWlyZSA9IGZ1bmN0aW9uKG5hbWUpe1xyXG5cdHZhciBleGlzdGluZ01vZHVsZSA9IGxvYWRlZE1vZHVsZXNbbmFtZV07XHJcblxyXG5cdGlmKCFleGlzdGluZ01vZHVsZSl7XHJcbiAgICAgICAgZXhpc3RpbmdNb2R1bGUgPSAkJC5fX3J1bnRpbWVNb2R1bGVzW25hbWVdO1xyXG4gICAgICAgIGlmKCFleGlzdGluZ01vZHVsZSl7XHJcbiAgICAgICAgICAgIC8vdmFyIGFic29sdXRlUGF0aCA9IHBhdGgucmVzb2x2ZSggJCQuX19nbG9iYWwuX19sb2FkTW9kdWxlc1Jvb3QgKyBuYW1lKTtcclxuICAgICAgICAgICAgZXhpc3RpbmdNb2R1bGUgPSAkJC5fX2dsb2JhbC5vcmlnaW5hbFJlcXVpcmUobmFtZSk7XHJcbiAgICAgICAgICAgIGxvYWRlZE1vZHVsZXNbbmFtZV0gPSBleGlzdGluZ01vZHVsZTtcclxuICAgICAgICB9XHJcblx0fVxyXG5cdHJldHVybiBleGlzdGluZ01vZHVsZTtcclxufTtcclxuXHJcbnZhciBzd2FybVV0aWxzID0gcmVxdWlyZShcIi4vbGliL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvc3dhcm1cIik7XHJcblxyXG4kJC5kZWZhdWx0RXJyb3JIYW5kbGluZ0ltcGxlbWVudGF0aW9uID0gZGVmYXVsdEVycm9ySGFuZGxpbmdJbXBsZW1lbnRhdGlvbjtcclxuXHJcbnZhciBjYWxsZmxvd01vZHVsZSA9IHJlcXVpcmUoXCIuL2xpYi9zd2FybURlc2NyaXB0aW9uXCIpO1xyXG4kJC5jYWxsZmxvd3MgICAgICAgID0gY2FsbGZsb3dNb2R1bGUuY3JlYXRlU3dhcm1FbmdpbmUoXCJjYWxsZmxvd1wiKTtcclxuJCQuY2FsbGZsb3cgICAgICAgICA9ICQkLmNhbGxmbG93cztcclxuJCQuZmxvdyAgICAgICAgICAgICA9ICQkLmNhbGxmbG93cztcclxuJCQuZmxvd3MgICAgICAgICAgICA9ICQkLmNhbGxmbG93cztcclxuXHJcbiQkLnN3YXJtcyAgICAgICAgICAgPSBjYWxsZmxvd01vZHVsZS5jcmVhdGVTd2FybUVuZ2luZShcInN3YXJtXCIsIHN3YXJtVXRpbHMpO1xyXG4kJC5zd2FybSAgICAgICAgICAgID0gJCQuc3dhcm1zO1xyXG4kJC5jb250cmFjdHMgICAgICAgID0gY2FsbGZsb3dNb2R1bGUuY3JlYXRlU3dhcm1FbmdpbmUoXCJjb250cmFjdFwiLCBzd2FybVV0aWxzKTtcclxuJCQuY29udHJhY3QgICAgICAgICA9ICQkLmNvbnRyYWN0cztcclxuXHJcblxyXG4kJC5QU0tfUHViU3ViID0gJCQucmVxdWlyZShcInNvdW5kcHVic3ViXCIpLnNvdW5kUHViU3ViO1xyXG5cclxuJCQuc2VjdXJpdHlDb250ZXh0ID0gXCJzeXN0ZW1cIjtcclxuJCQubGlicmFyeVByZWZpeCA9IFwiZ2xvYmFsXCI7XHJcbiQkLmxpYnJhcmllcyA9IHtcclxuICAgIGdsb2JhbDp7XHJcblxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcblxyXG4kJC5sb2FkTGlicmFyeSA9IHJlcXVpcmUoXCIuL2xpYi9sb2FkTGlicmFyeVwiKS5sb2FkTGlicmFyeTtcclxuXHJcbiQkLnJlcXVpcmVMaWJyYXJ5ID0gZnVuY3Rpb24obmFtZSl7XHJcbiAgICAvL3ZhciBhYnNvbHV0ZVBhdGggPSBwYXRoLnJlc29sdmUoICAkJC5fX2dsb2JhbC5fX2xvYWRMaWJyYXJ5Um9vdCArIG5hbWUpO1xyXG4gICAgcmV0dXJuICQkLmxvYWRMaWJyYXJ5KG5hbWUsbmFtZSk7XHJcbn07XHJcblxyXG4kJC5yZWdpc3RlclN3YXJtRGVzY3JpcHRpb24gPSAgZnVuY3Rpb24obGlicmFyeU5hbWUsc2hvcnROYW1lLCBkZXNjcmlwdGlvbil7XHJcbiAgICBpZighJCQubGlicmFyaWVzW2xpYnJhcnlOYW1lXSl7XHJcbiAgICAgICAgJCQubGlicmFyaWVzW2xpYnJhcnlOYW1lXSA9IHt9O1xyXG4gICAgfVxyXG4gICAgJCQubGlicmFyaWVzW2xpYnJhcnlOYW1lXVtzaG9ydE5hbWVdID0gZGVzY3JpcHRpb247XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgXHRcdFx0XHRjcmVhdGVTd2FybUVuZ2luZTogcmVxdWlyZShcIi4vbGliL3N3YXJtRGVzY3JpcHRpb25cIikuY3JlYXRlU3dhcm1FbmdpbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlSm9pblBvaW50OiByZXF1aXJlKFwiLi9saWIvcGFyYWxsZWxKb2luUG9pbnRcIikuY3JlYXRlSm9pblBvaW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZVNlcmlhbEpvaW5Qb2ludDogcmVxdWlyZShcIi4vbGliL3NlcmlhbEpvaW5Qb2ludFwiKS5jcmVhdGVTZXJpYWxKb2luUG9pbnQsXHJcblx0XHRcdFx0XHRcInNhZmUtdXVpZFwiOiByZXF1aXJlKFwiLi9saWIvc2FmZS11dWlkXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgIHN3YXJtSW5zdGFuY2VNYW5hZ2VyOiByZXF1aXJlKFwiLi9saWIvY2hvcmVvZ3JhcGhpZXMvc3dhcm1JbnN0YW5jZXNNYW5hZ2VyXCIpXHJcblx0XHRcdFx0fTsiXX0=
