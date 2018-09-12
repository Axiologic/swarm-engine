pskruntimeRequire=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"/home/salboaie/work/privatesky/engine/pskbuildtemp/pskModules.js":[function(require,module,exports){
;$$.__runtimeModules["soundpubsub"] = require("soundpubsub");
$$.__runtimeModules["callflow"] = require("callflow");
$$.__runtimeModules["soundpubsub"] = require("soundpubsub");
$$.__runtimeModules["callflow"] = require("callflow");
$$.__runtimeModules["dicontainer"] = require("dicontainer");

},{"callflow":"callflow","dicontainer":"dicontainer","soundpubsub":"soundpubsub"}],"/home/salboaie/work/privatesky/engine/pskbuildtemp/pskruntime.js":[function(require,module,exports){

require("../../modules/callflow/lib/overwriteRequire")
require("./pskModules");

console.log("Loading runtime");




},{"../../modules/callflow/lib/overwriteRequire":"/home/salboaie/work/privatesky/modules/callflow/lib/overwriteRequire.js","./pskModules":"/home/salboaie/work/privatesky/engine/pskbuildtemp/pskModules.js"}],"/home/salboaie/work/privatesky/modules/callflow/lib/choreographies/SwarmDebug.js":[function(require,module,exports){
/*
Initial License: (c) Axiologic Research & Alboaie Sînică.
Contributors: Axiologic Research , PrivateSky project
Code License: LGPL or MIT.
*/

var util = require("util");

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
            var fs = require("fs");
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


},{"fs":false,"util":"util"}],"/home/salboaie/work/privatesky/modules/callflow/lib/choreographies/swarmInstancesManager.js":[function(require,module,exports){


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
            swarm.update(swarmSerialisation);

        } else {
            swarm = $$.swarm.create(swarmType, undefined, swarmSerialisation);
        }

        if (swarmSerialisation.meta.command == "asyncReturn") {
            $$.PSK_PubSub.publish($$.CONSTANTS.SWARM_RETURN, swarmSerialisation);
            // cleanSwarmWaiter(swarmSerialisation);
        } else if (swarmSerialisation.meta.command == "executeSwarmPhase") {
            swarm.runPhase(swarmSerialisation.meta.phaseName, swarmSerialisation.meta.args);
        } else {
            console.log("Unknown command", swarmSerialisation.meta.command, "in swarmSerialisation.meta.command");
        }

        return swarm;
    }
}


$$.swarmsInstancesManager = new SwarmsInstancesManager();



},{}],"/home/salboaie/work/privatesky/modules/callflow/lib/choreographies/utilityFunctions/base.js":[function(require,module,exports){
var beesHealer = require("soundpubsub").beesHealer;
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
},{"../../parallelJoinPoint":"/home/salboaie/work/privatesky/modules/callflow/lib/parallelJoinPoint.js","../../serialJoinPoint":"/home/salboaie/work/privatesky/modules/callflow/lib/serialJoinPoint.js","../SwarmDebug":"/home/salboaie/work/privatesky/modules/callflow/lib/choreographies/SwarmDebug.js","soundpubsub":"soundpubsub"}],"/home/salboaie/work/privatesky/modules/callflow/lib/choreographies/utilityFunctions/callflow.js":[function(require,module,exports){
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
},{"./base":"/home/salboaie/work/privatesky/modules/callflow/lib/choreographies/utilityFunctions/base.js"}],"/home/salboaie/work/privatesky/modules/callflow/lib/choreographies/utilityFunctions/swarm.js":[function(require,module,exports){
exports.createForObject = function(valueObject, thisObject, localId){
	return require("./base").createForObject(valueObject, thisObject, localId);
};
},{"./base":"/home/salboaie/work/privatesky/modules/callflow/lib/choreographies/utilityFunctions/base.js"}],"/home/salboaie/work/privatesky/modules/callflow/lib/loadLibrary.js":[function(require,module,exports){
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
        return require(folder); // a library is just a module
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
},{}],"/home/salboaie/work/privatesky/modules/callflow/lib/overwriteRequire.js":[function(require,module,exports){

/*
 require and requireLibrary are overwriting the node.js defaults in loading modules for increasing security and speed.
 We guarantee that each module or library is loaded only once and only from a single folder... Use the standard require if you need something else!

 */


if (typeof(window) !== "undefined") {
    global = window;
}


if(typeof(global.$$) == "undefined") {
    global.$$ = {};
    $$.__global = {

    };
}

if(typeof(global.functionUndefined) == "undefined"){
    global.functionUndefined = function(){
        console.log("Called of an undefined function!!!!");
        throw new Error("Called of an undefined function");
    }
    if(typeof(global.browserRequire) == "undefined"){
        global.browserRequire = global.functionUndefined;
    }

    if(typeof(global.domainRequire) == "undefined"){
        global.domainRequire = global.functionUndefined;
    }

    if(typeof(global.pskruntimeRequire) == "undefined"){
        global.pskruntimeRequire = global.functionUndefined;
    }
}

if(typeof($$.log) == "undefined") {
    $$.log = function(...args){
        console.log(args.join(" "));
    }
}


var weAreInbrowser = (typeof($$.browserRuntime) != "undefined");


var pastRequests = {};
function preventRecursiveRequire(request){
    if(pastRequests[request]){
        var err = new Error("Preventing recursive require for " + request);
        err.type = "PSKIgnorableError"
        throw err;
    }

}

function disableRequire(request){
    pastRequests[request] = true;
}

function enableRequire(request){
    pastRequests[request] = false;
}


function requireFromCache(request){
    var existingModule = $$.__runtimeModules[request];
    return  existingModule;
}

function tryRequireSequence(arr, request){
    preventRecursiveRequire(request);
    disableRequire(request);
    var result;
    for(var i = 0; i < arr.length; i++){
        var func = arr[i];
        try{

            if(func === global.functionUndefined) continue;
            result = func(request);
            if(result){
                //console.log("returning result for ", request, !!result);
                $$.__runtimeModules[request] = result;
                break;
            }
        } catch(err){
            if(err.type != "PSKIgnorableError"){
                $$.log("Require failed in ", func, request, err);
            }
        }
    }

    if(!result){
        $$.log("Failed to load module ", request, result);
    }

    enableRequire(request);
    return result;
}


if (typeof($$.require) == "undefined") {
    $$.__runtimeModules = {};

    if (!weAreInbrowser) {  //we are in node

        $$.__runtimeModules["crypto"] = require("crypto");
        $$.__runtimeModules["util"] = require("util");

        $$.log("Redefining require for node");
        var Module = require('module');
        $$.__originalRequire = Module._load;

        function newLoader(request) {
            //preventRecursiveRequire(request);

            var self = this;
            function originalRequire(...args){
                return $$.__originalRequire.apply(self,args);
            }

            return tryRequireSequence([requireFromCache, pskruntimeRequire, domainRequire, originalRequire], request);
        }

        Module._load = newLoader;

    } else {
        $$.log("Defining global require in browser");

        global.require = function(request){

            return tryRequireSequence([requireFromCache, browserRequire, domainRequire, pskruntimeRequire], request);
        }
    }

    $$.require = require;
}

},{"crypto":"crypto","module":false,"util":"util"}],"/home/salboaie/work/privatesky/modules/callflow/lib/parallelJoinPoint.js":[function(require,module,exports){

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
},{}],"/home/salboaie/work/privatesky/modules/callflow/lib/safe-uuid.js":[function(require,module,exports){

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
},{"crypto":"crypto"}],"/home/salboaie/work/privatesky/modules/callflow/lib/serialJoinPoint.js":[function(require,module,exports){

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
},{}],"/home/salboaie/work/privatesky/modules/callflow/lib/swarmDescription.js":[function(require,module,exports){
function SwarmSpace(swarmType, utils) {

    var beesHealer = require("soundpubsub").beesHealer;

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
},{"./choreographies/utilityFunctions/callflow":"/home/salboaie/work/privatesky/modules/callflow/lib/choreographies/utilityFunctions/callflow.js","soundpubsub":"soundpubsub"}],"/home/salboaie/work/privatesky/modules/soundpubsub/lib/Queue.js":[function(require,module,exports){
function QueueElement(content) {
	this.content = content;
	this.next = null;
}

function Queue() {
	this.head = null;
	this.tail = null;

	this.push = function (value) {
		let newElement = new QueueElement(value);
		if (!this.head) {
			this.head = newElement;
			this.tail = newElement;
		} else {
			this.tail.next = newElement;
			this.tail = newElement
		}
	};

	this.pop = function () {
		if (!this.head) {
			return null;
		}
		const headCopy = this.head;
		this.head = this.head.next;
		return headCopy.content;
	};

	this.front = function () {
		return this.head ? this.head.content : undefined;
	};

	this.isEmpty = function () {
		return this.head == null;
	};

	this[Symbol.iterator] = function* () {
		let head = this.head;
		while(head !== null) {
			yield head.content;
			head = head.next;
		}
	}.bind(this);
}

Queue.prototype.toString = function () {
	let stringifiedQueue = '';
	let iterator = this.head;
	while (iterator) {
		stringifiedQueue += `${JSON.stringify(iterator.content)} `;
		iterator = iterator.next;
	}
	return stringifiedQueue
};

Queue.prototype.inspect = Queue.prototype.toString;

module.exports = Queue;
},{}],"/home/salboaie/work/privatesky/modules/soundpubsub/lib/beesHealer.js":[function(require,module,exports){

/*
    Prepare the state of a swarm to be serialised
*/

exports.asJSON = function(valueObject, phaseName, args, callback){

        var valueObject = valueObject.valueOf();
        var res = {};
        res.publicVars          = valueObject.publicVars;
        res.privateVars         = valueObject.privateVars;
        res.meta                = {};

        res.meta.swarmTypeName  = valueObject.meta.swarmTypeName;
        res.meta.swarmId        = valueObject.meta.swarmId;
        res.meta.target         = valueObject.meta.target;

        if(!phaseName){
            res.meta.command    = "stored";
        } else {
            res.meta.phaseName  = phaseName;
            res.meta.args       = args;
            res.meta.command    = valueObject.meta.command || "executeSwarmPhase";
        }

        res.meta.waitStack  = valueObject.meta.waitStack; //TODO: think if is not better to be deep cloned and not referenced!!!

        if(callback){
            callback(null, res);
        }
        //console.log("asJSON:", res, valueObject);
        return res;
}

exports.jsonToNative = function(serialisedValues, result){

    for(var v in serialisedValues.publicVars){
        result.publicVars[v] = serialisedValues.publicVars[v];

    };
    for(var v in serialisedValues.privateVars){
        result.privateVars[v] = serialisedValues.privateVars[v];
    };

    for(var v in serialisedValues.meta){
        result.meta[v] = serialisedValues.meta[v];
    };

}
},{}],"/home/salboaie/work/privatesky/modules/soundpubsub/lib/soundPubSub.js":[function(require,module,exports){
/*
Initial License: (c) Axiologic Research & Alboaie Sînică.
Contributors: Axiologic Research , PrivateSky project
Code License: LGPL or MIT.
*/


/**
 *   Usually an event could cause execution of other callback events . We say that is a level 1 event if is causeed by a level 0 event and so on
 *
 *      SoundPubSub provides intuitive results regarding to asynchronous calls of callbacks and computed values/expressions:
 *   we prevent immediate execution of event callbacks to ensure the intuitive final result is guaranteed as level 0 execution
 *   we guarantee that any callback function is "re-entrant"
 *   we are also trying to reduce the number of callback execution by looking in queues at new messages published by
 *   trying to compact those messages (removing duplicate messages, modifying messages, or adding in the history of another event ,etc)
 *
 *      Example of what can be wrong without non-sound asynchronous calls:

 *  Step 0: Initial state:
 *   a = 0;
 *   b = 0;
 *
 *  Step 1: Initial operations:
 *   a = 1;
 *   b = -1;
 *
 *  // an observer reacts to changes in a and b and compute CORRECT like this:
 *   if( a + b == 0) {
 *       CORRECT = false;
 *       notify(...); // act or send a notification somewhere..
 *   } else {
 *      CORRECT = false;
 *   }
 *
 *    Notice that: CORRECT will be true in the end , but meantime, after a notification was sent and CORRECT was wrongly, temporarily false!
 *    soundPubSub guarantee that this does not happen because the syncronous call will before any observer (bot asignation on a and b)
 *
 *   More:
 *   you can use blockCallBacks and releaseCallBacks in a function that change a lot a collection or bindable objects and all
 *   the notifications will be sent compacted and properly
 */

// TODO: optimisation!? use a more efficient queue instead of arrays with push and shift!?
// TODO: see how big those queues can be in real applications
// for a few hundreds items, queues made from array should be enough
//*   Potential TODOs:
//    *     prevent any form of problem by calling callbacks in the expected order !?
//*     preventing infinite loops execution cause by events!?
//*
//*
// TODO: detect infinite loops (or very deep propagation) It is possible!?

const Queue = require('./Queue');

function SoundPubSub(){

	/**
	 * publish
	 *      Publish a message {Object} to a list of subscribers on a specific topic
	 *
	 * @params {String|Number} target,  {Object} message
	 * @return number of channel subscribers that will be notified
	 */
	this.publish = function(target, message){
		if(!invalidChannelName(target) && !invalidMessageType(message) && channelSubscribers[target] != undefined){
			compactAndStore(target, message);
			dispatchNext();
			return channelSubscribers[target].length;
		} else{
			return null;
		}
	};

	/**
	 * subscribe
	 *      Subscribe / add a {Function} callBack on a {String|Number}target channel subscribers list in order to receive
	 *      messages published if the conditions defined by {Function}waitForMore and {Function}filter are passed.
	 *
	 * @params {String|Number}target, {Function}callBack, {Function}waitForMore, {Function}filter
	 *
	 *          target      - channel name to subscribe
	 *          callback    - function to be called when a message was published on the channel
	 *          waitForMore - a intermediary function that will be called after a successfuly message delivery in order
	 *                          to decide if a new messages is expected...
	 *          filter      - a function that receives the message before invocation of callback function in order to allow
	 *                          relevant message before entering in normal callback flow
	 * @return
	 */
	this.subscribe = function(target, callBack, waitForMore, filter){
		if(!invalidChannelName(target) && !invalidFunction(callBack)){

			var subscriber = {"callBack":callBack, "waitForMore":waitForMore, "filter":filter};
			var arr = channelSubscribers[target];
			if(arr == undefined){
				arr = [];
				channelSubscribers[target] = arr;
			}
			arr.push(subscriber);
		}
	};

	/**
	 * unsubscribe
	 *      Unsubscribe/remove {Function} callBack from the list of subscribers of the {String|Number} target channel
	 *
	 * @params {String|Number} target, {Function} callBack, {Function} filter
	 *
	 *          target      - channel name to unsubscribe
	 *          callback    - reference of the original function that was used as subscribe
	 *          filter      - reference of the original filter function
	 * @return
	 */
	this.unsubscribe = function(target, callBack, filter){
		if(!invalidFunction(callBack)){
			var gotit = false;
			if(channelSubscribers[target]){
				for(var i = 0; i < channelSubscribers[target].length;i++){
					var subscriber =  channelSubscribers[target][i];
					if(subscriber.callBack === callBack && (filter == undefined || subscriber.filter === filter )){
						gotit = true;
						subscriber.forDelete = true;
						subscriber.callBack = null;
						subscriber.filter = null;
					}
				}
			}
			if(!gotit){
				wprint("Unable to unsubscribe a callback that was not subscribed!");
			}
		}
	};

	/**
	 * blockCallBacks
	 *
	 * @params
	 * @return
	 */
	this.blockCallBacks = function(){
		level++;
	};

	/**
	 * releaseCallBacks
	 *
	 * @params
	 * @return
	 */
	this.releaseCallBacks = function(){
		level--;
		//hack/optimisation to not fill the stack in extreme cases (many events caused by loops in collections,etc)
		while(level == 0 && dispatchNext(true)){
			//nothing
		}

		while(level == 0 && callAfterAllEvents()){

		}
	};

	/**
	 * afterAllEvents
	 *
	 * @params {Function} callback
	 *
	 *          callback - function that needs to be invoked once all events are delivered
	 * @return
	 */
	this.afterAllEvents = function(callBack){
		if(!invalidFunction(callBack)){
			afterEventsCalls.push(callBack);
		}
		this.blockCallBacks();
		this.releaseCallBacks();
	};

	/**
	 * hasChannel
	 *
	 * @params {String|Number} channel
	 *
	 *          channel - name of the channel that need to be tested if present
	 * @return
	 */
	this.hasChannel = function(channel){
		return !invalidChannelName(channel) && channelSubscribers[channel] != undefined ? true : false;
	};

	/**
	 * addChannel
	 *
	 * @params {String} channel
	 *
	 *          channel - name of a channel that needs to be created and added to soundpubsub repository
	 * @return
	 */
	this.addChannel = function(channel){
		if(!invalidChannelName(channel) && !this.hasChannel(channel)){
			channelSubscribers[channel] = [];
		}
	};

	/* ---------------------------------------- protected stuff ---------------------------------------- */
	var self = this;
	// map channelName (object local id) -> array with subscribers
	var channelSubscribers = {};

	// map channelName (object local id) -> queue with waiting messages
	var channelsStorage = {};

	// object
	var typeCompactor = {};

	// channel names
	var executionQueue = new Queue();
	var level = 0;



	/**
	 * registerCompactor
	 *
	 *       An compactor takes a newEvent and and oldEvent and return the one that survives (oldEvent if
	 *  it can compact the new one or the newEvent if can't be compacted)
	 *
	 * @params {String} type, {Function} callBack
	 *
	 *          type        - channel name to unsubscribe
	 *          callBack    - handler function for that specific event type
	 * @return
	 */
	this.registerCompactor = function(type, callBack) {
		if(!invalidFunction(callBack)){
			typeCompactor[type] = callBack;
		}
	};

	/**
	 * dispatchNext
	 *
	 * @param fromReleaseCallBacks: hack to prevent too many recursive calls on releaseCallBacks
	 * @return {Boolean}
	 */
	function dispatchNext(fromReleaseCallBacks){
		if(level > 0) {
			return false;
		}
		let channelName = executionQueue.front();
		if(channelName != undefined){
			self.blockCallBacks();
			try{
				let message;
				if(!channelsStorage[channelName].isEmpty()) {
					message = channelsStorage[channelName].front();
				}
				if(message == undefined){
					if(!channelsStorage[channelName].isEmpty()){
						wprint("Can't use as message in a pub/sub channel this object: " + message);
					}
					executionQueue.pop();
				} else {
					if(message.__transmisionIndex == undefined){
						message.__transmisionIndex = 0;
						for(var i = channelSubscribers[channelName].length-1; i >= 0 ; i--){
							var subscriber =  channelSubscribers[channelName][i];
							if(subscriber.forDelete == true){
								channelSubscribers[channelName].splice(i,1);
							}
						}
					} else{
						message.__transmisionIndex++;
					}
					//TODO: for immutable objects it will not work also, fix for shape models
					if(message.__transmisionIndex == undefined){
						wprint("Can't use as message in a pub/sub channel this object: " + message);
					}
					var subscriber = channelSubscribers[channelName][message.__transmisionIndex];
					if(subscriber == undefined){
						delete message.__transmisionIndex;
						channelsStorage[channelName].pop();
					} else{
						if(subscriber.filter == undefined || (!invalidFunction(subscriber.filter) && subscriber.filter(message))){
							if(!subscriber.forDelete){
								subscriber.callBack(message);
								if(subscriber.waitForMore && !invalidFunction(subscriber.waitForMore) &&
									!subscriber.waitForMore(message)){

									subscriber.forDelete = true;
								}
							}
						}
					}
				}
			} catch(err){
				wprint("Event callback failed: "+ subscriber.callBack +"error: " + err.stack);
			}
			//
			if(fromReleaseCallBacks){
				level--;
			} else{
				self.releaseCallBacks();
			}
			return true;
		} else{
			return false;
		}
	}

	function compactAndStore(target, message){
		var gotCompacted = false;
		var arr = channelsStorage[target];
		if(arr == undefined){
			arr = new Queue();
			channelsStorage[target] = arr;
		}

		if(message && message.type != undefined){
			var typeCompactorCallBack = typeCompactor[message.type];

			if(typeCompactorCallBack != undefined){
				for(let channel of arr) {
					if(typeCompactorCallBack(message, channel) === channel) {
						if(channel.__transmisionIndex === undefined) {
							gotCompacted = true;
							break;
						}
					}
				}
			}
		}

		if(!gotCompacted && message){
			arr.push(message);
			executionQueue.push(target);
		}
	}

	var afterEventsCalls = new Queue();
	function callAfterAllEvents (){
		if(!afterEventsCalls.isEmpty()){
			var callBack = afterEventsCalls.pop();
			//do not catch exceptions here..
			callBack();
		}
		return !afterEventsCalls.isEmpty();
	}

	function invalidChannelName(name){
		var result = false;
		if(!name || (typeof name != "string" && typeof name != "number")){
			result = true;
			wprint("Invalid channel name: " + name);
		}

		return result;
	}

	function invalidMessageType(message){
		var result = false;
		if(!message || typeof message != "object"){
			result = true;
			wprint("Invalid messages types: " + message);
		}
		return result;
	}

	function invalidFunction(callback){
		var result = false;
		if(!callback || typeof callback != "function"){
			result = true;
			wprint("Expected to be function but is: " + callback);
		}
		return result;
	}
}

exports.soundPubSub = new SoundPubSub();
},{"./Queue":"/home/salboaie/work/privatesky/modules/soundpubsub/lib/Queue.js"}],"callflow":[function(require,module,exports){

//var path = require("path");

function defaultErrorHandlingImplementation(err, res){
	//console.log(err.stack);
	if(err) throw err;
	return res;
}

require("./lib/overwriteRequire");



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


$$.PSK_PubSub = require("soundpubsub").soundPubSub;

$$.securityContext = "system";
$$.libraryPrefix = "global";
$$.libraries = {
    global:{

    }
};



$$.loadLibrary = require("./lib/loadLibrary").loadLibrary;

requireLibrary = function(name){
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
},{"./lib/choreographies/swarmInstancesManager":"/home/salboaie/work/privatesky/modules/callflow/lib/choreographies/swarmInstancesManager.js","./lib/choreographies/utilityFunctions/swarm":"/home/salboaie/work/privatesky/modules/callflow/lib/choreographies/utilityFunctions/swarm.js","./lib/loadLibrary":"/home/salboaie/work/privatesky/modules/callflow/lib/loadLibrary.js","./lib/overwriteRequire":"/home/salboaie/work/privatesky/modules/callflow/lib/overwriteRequire.js","./lib/parallelJoinPoint":"/home/salboaie/work/privatesky/modules/callflow/lib/parallelJoinPoint.js","./lib/safe-uuid":"/home/salboaie/work/privatesky/modules/callflow/lib/safe-uuid.js","./lib/serialJoinPoint":"/home/salboaie/work/privatesky/modules/callflow/lib/serialJoinPoint.js","./lib/swarmDescription":"/home/salboaie/work/privatesky/modules/callflow/lib/swarmDescription.js","soundpubsub":"soundpubsub"}],"dicontainer":[function(require,module,exports){
if(typeof singleton_container_module_workaround_for_wired_node_js_caching == 'undefined') {
    singleton_container_module_workaround_for_wired_node_js_caching   = module;
} else {
    module.exports = singleton_container_module_workaround_for_wired_node_js_caching .exports;
    return module;
}

/**
 * Created by salboaie on 4/27/15.
 */
function Container(errorHandler){
    var things = {};        //the actual values for our services, things
    var immediate = {};     //how dependencies were declared
    var callbacks = {};     //callback that should be called for each dependency declaration
    var depsCounter = {};   //count dependencies
    var reversedTree = {};  //reversed dependencies, opposite of immediate object

     this.dump = function(){
         console.log("Conatiner dump\n Things:", things, "\nDeps counter: ", depsCounter, "\nStright:", immediate, "\nReversed:", reversedTree);
     }

    function incCounter(name){
        if(!depsCounter[name]){
            depsCounter[name] = 1;
        } else {
            depsCounter[name]++;
        }
    }

    function insertDependencyinRT(nodeName, dependencies){
        dependencies.forEach(function(itemName){
            var l = reversedTree[itemName];
            if(!l){
                l = reversedTree[itemName] = {};
            }
            l[nodeName] = nodeName;
        })
    }


    function discoverUpNodes(nodeName){
        var res = {};

        function DFS(nn){
            var l = reversedTree[nn];
            for(var i in l){
                if(!res[i]){
                    res[i] = true;
                    DFS(i);
                }
            }
        }

        DFS(nodeName);
        return Object.keys(res);
    }

    function resetCounter(name){
        var dependencyArray = immediate[name];
        var counter = 0;
        if(dependencyArray){
            dependencyArray.forEach(function(dep){
                if(things[dep] == null){
                    incCounter(name)
                    counter++;
                }
            })
        }
        depsCounter[name] = counter;
        //console.log("Counter for ", name, ' is ', counter);
        return counter;
    }

    /* returns those that are ready to be resolved*/
    function resetUpCounters(name){
        var ret = [];
        //console.log('Reseting up counters for ', name, "Reverse:", reversedTree[name]);
        var ups = reversedTree[name];
        for(var v in ups){
            if(resetCounter(v) == 0){
                ret.push(v);
            }
        }
        return ret;
    }

    /*
         The first argument is a name for a service, variable,a  thing that should be initialised, recreated, etc
         The second argument is an array with dependencies
         the last argument is a function(err,...) that is called when dependencies are ready or recalled when are not ready (stop was called)
         If err is not undefined it means that one or any undefined variables are not ready and the callback will be called again later
         All the other arguments are the corresponding arguments of the callback will be the actual values of the corresponding dependency
         The callback functions should return the current value (or null)
     */
    this.declareDependency = function(name, dependencyArray, callback){
        if(callbacks[name]){
            errorHandler.ignorePossibleError("Duplicate dependency:" + name);
        } else {
            callbacks[name] = callback;
            immediate[name]   = dependencyArray;
            insertDependencyinRT(name, dependencyArray);
            things[name] = null;
        }

        var unsatisfiedCounter = resetCounter(name);
        if(unsatisfiedCounter == 0 ){
            callForThing(name, false);
        } else {
            callForThing(name, true);
        }
    }


    /*
        create a service
     */
    this.service = function(name, dependencyArray, constructor){
        this.declareDependency(name, dependencyArray, constructor);
    }


    var subsystemCounter = 0;
    /*
     create a anonymous subsystem
     */
    this.subsystem = function(dependencyArray, constructor){
        subsystemCounter++;
        this.declareDependency("dicontainer_subsystem_placeholder" + subsystemCounter, dependencyArray, constructor);
    }

    /* not documented.. limbo state*/
    this.factory = function(name, dependencyArray, constructor){
        this.declareDependency(name, dependencyArray, function(){
            return new constructor()
        });
    }

    function callForThing(name, outOfService){
        var args = immediate[name].map(function(item){
            return things[item];
        });
        args.unshift(outOfService);
        try{
            var value = callbacks[name].apply({},args);
        } catch(err){
            errorHandler.throwError(err);
        }


        if(outOfService || value===null){   //enable returning a temporary dependency resolution!
            if(things[name]){
                things[name] = null;
                resetUpCounters(name);
            }
        } else {
            //console.log("Success resolving ", name, ":", value, "Other ready:", otherReady);
            if(!value){
                value =  {"placeholder": name};
            }
            things[name] = value;
            var otherReady = resetUpCounters(name);
            otherReady.forEach(function(item){
                callForThing(item, false);
            });
        }
    }

    /*
        Declare that a name is ready, resolved and should try to resolve all other waiting for it
     */
    this.resolve    = function(name, value){
        things[name] = value;
        var otherReady = resetUpCounters(name);

        otherReady.forEach(function(item){
            callForThing(item, false);
        });
    };



    this.instanceFactory = function(name, dependencyArray, constructor){
        errorHandler.notImplemented("instanceFactory is planned but not implemented");
    }

    /*
        Declare that a service or feature is not working properly. All services depending on this will get notified
     */
    this.outOfService    = function(name){
        things[name] = null;
        var upNodes = discoverUpNodes(name);
        upNodes.forEach(function(node){
            things[name] = null;
            callForThing(node, true);
        })
    }
}


exports.newContainer    = function(checksLibrary){
    return new Container(checksLibrary);
}

//exports.container = new Container($$.errorHandler);

},{}],"soundpubsub":[function(require,module,exports){
module.exports = {
					beesHealer: require("./lib/beesHealer"),
					soundPubSub: require("./lib/soundPubSub").soundPubSub
					//folderMQ: require("./lib/folderMQ")
};
},{"./lib/beesHealer":"/home/salboaie/work/privatesky/modules/soundpubsub/lib/beesHealer.js","./lib/soundPubSub":"/home/salboaie/work/privatesky/modules/soundpubsub/lib/soundPubSub.js"}]},{},["/home/salboaie/work/privatesky/engine/pskbuildtemp/pskruntime.js"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJlbmdpbmUvcHNrYnVpbGR0ZW1wL3Bza01vZHVsZXMuanMiLCJlbmdpbmUvcHNrYnVpbGR0ZW1wL3Bza3J1bnRpbWUuanMiLCJtb2R1bGVzL2NhbGxmbG93L2xpYi9jaG9yZW9ncmFwaGllcy9Td2FybURlYnVnLmpzIiwibW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvc3dhcm1JbnN0YW5jZXNNYW5hZ2VyLmpzIiwibW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvdXRpbGl0eUZ1bmN0aW9ucy9iYXNlLmpzIiwibW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvdXRpbGl0eUZ1bmN0aW9ucy9jYWxsZmxvdy5qcyIsIm1vZHVsZXMvY2FsbGZsb3cvbGliL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvc3dhcm0uanMiLCJtb2R1bGVzL2NhbGxmbG93L2xpYi9sb2FkTGlicmFyeS5qcyIsIm1vZHVsZXMvY2FsbGZsb3cvbGliL292ZXJ3cml0ZVJlcXVpcmUuanMiLCJtb2R1bGVzL2NhbGxmbG93L2xpYi9wYXJhbGxlbEpvaW5Qb2ludC5qcyIsIm1vZHVsZXMvY2FsbGZsb3cvbGliL3NhZmUtdXVpZC5qcyIsIm1vZHVsZXMvY2FsbGZsb3cvbGliL3NlcmlhbEpvaW5Qb2ludC5qcyIsIm1vZHVsZXMvY2FsbGZsb3cvbGliL3N3YXJtRGVzY3JpcHRpb24uanMiLCJtb2R1bGVzL3NvdW5kcHVic3ViL2xpYi9RdWV1ZS5qcyIsIm1vZHVsZXMvc291bmRwdWJzdWIvbGliL2JlZXNIZWFsZXIuanMiLCJtb2R1bGVzL3NvdW5kcHVic3ViL2xpYi9zb3VuZFB1YlN1Yi5qcyIsIm1vZHVsZXMvY2FsbGZsb3cvaW5kZXguanMiLCJtb2R1bGVzL2RpY29udGFpbmVyL2xpYi9jb250YWluZXIuanMiLCJtb2R1bGVzL3NvdW5kcHVic3ViL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIjskJC5fX3J1bnRpbWVNb2R1bGVzW1wic291bmRwdWJzdWJcIl0gPSByZXF1aXJlKFwic291bmRwdWJzdWJcIik7XG4kJC5fX3J1bnRpbWVNb2R1bGVzW1wiY2FsbGZsb3dcIl0gPSByZXF1aXJlKFwiY2FsbGZsb3dcIik7XG4kJC5fX3J1bnRpbWVNb2R1bGVzW1wic291bmRwdWJzdWJcIl0gPSByZXF1aXJlKFwic291bmRwdWJzdWJcIik7XG4kJC5fX3J1bnRpbWVNb2R1bGVzW1wiY2FsbGZsb3dcIl0gPSByZXF1aXJlKFwiY2FsbGZsb3dcIik7XG4kJC5fX3J1bnRpbWVNb2R1bGVzW1wiZGljb250YWluZXJcIl0gPSByZXF1aXJlKFwiZGljb250YWluZXJcIik7XG4iLCJcbnJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9vdmVyd3JpdGVSZXF1aXJlXCIpXG5yZXF1aXJlKFwiLi9wc2tNb2R1bGVzXCIpO1xuXG5jb25zb2xlLmxvZyhcIkxvYWRpbmcgcnVudGltZVwiKTtcblxuXG5cbiIsIi8qXG5Jbml0aWFsIExpY2Vuc2U6IChjKSBBeGlvbG9naWMgUmVzZWFyY2ggJiBBbGJvYWllIFPDrm5pY8SDLlxuQ29udHJpYnV0b3JzOiBBeGlvbG9naWMgUmVzZWFyY2ggLCBQcml2YXRlU2t5IHByb2plY3RcbkNvZGUgTGljZW5zZTogTEdQTCBvciBNSVQuXG4qL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xuXG5nbG9iYWwuY3ByaW50ID0gY29uc29sZS5sb2c7XG5nbG9iYWwud3ByaW50ID0gY29uc29sZS53YXJuO1xuZ2xvYmFsLmRwcmludCA9IGNvbnNvbGUuZGVidWc7XG5nbG9iYWwuZXByaW50ID0gY29uc29sZS5lcnJvcjtcblxuXG4vKipcbiAqIFNob3J0Y3V0IHRvIEpTT04uc3RyaW5naWZ5XG4gKiBAcGFyYW0gb2JqXG4gKi9cbmdsb2JhbC5KID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmopO1xufVxuXG5cbi8qKlxuICogUHJpbnQgc3dhcm0gY29udGV4dHMgKE1lc3NhZ2VzKSBhbmQgZWFzaWVyIHRvIHJlYWQgY29tcGFyZWQgd2l0aCBKXG4gKiBAcGFyYW0gb2JqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydHMuY2xlYW5EdW1wID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciBvID0gb2JqLnZhbHVlT2YoKTtcbiAgICB2YXIgbWV0YSA9IHtcbiAgICAgICAgc3dhcm1UeXBlTmFtZTpvLm1ldGEuc3dhcm1UeXBlTmFtZVxuICAgIH07XG4gICAgcmV0dXJuIFwiXFx0IHN3YXJtSWQ6IFwiICsgby5tZXRhLnN3YXJtSWQgKyBcIntcXG5cXHRcXHRtZXRhOiBcIiAgICArIEoobWV0YSkgK1xuICAgICAgICBcIlxcblxcdFxcdHB1YmxpYzogXCIgICAgICAgICsgSihvLnB1YmxpY1ZhcnMpICtcbiAgICAgICAgXCJcXG5cXHRcXHRwcm90ZWN0ZWQ6IFwiICAgICArIEooby5wcm90ZWN0ZWRWYXJzKSArXG4gICAgICAgIFwiXFxuXFx0XFx0cHJpdmF0ZTogXCIgICAgICAgKyBKKG8ucHJpdmF0ZVZhcnMpICsgXCJcXG5cXHR9XFxuXCI7XG59XG5cbi8vTSA9IGV4cG9ydHMuY2xlYW5EdW1wO1xuLyoqXG4gKiBFeHBlcmltZW50YWwgZnVuY3Rpb25zXG4gKi9cblxuXG4vKlxuXG5sb2dnZXIgICAgICA9IG1vbml0b3IubG9nZ2VyO1xuYXNzZXJ0ICAgICAgPSBtb25pdG9yLmFzc2VydDtcbnRocm93aW5nICAgID0gbW9uaXRvci5leGNlcHRpb25zO1xuXG5cbnZhciB0ZW1wb3JhcnlMb2dCdWZmZXIgPSBbXTtcblxudmFyIGN1cnJlbnRTd2FybUNvbUltcGwgPSBudWxsO1xuXG5sb2dnZXIucmVjb3JkID0gZnVuY3Rpb24ocmVjb3JkKXtcbiAgICBpZihjdXJyZW50U3dhcm1Db21JbXBsPT09bnVsbCl7XG4gICAgICAgIHRlbXBvcmFyeUxvZ0J1ZmZlci5wdXNoKHJlY29yZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudFN3YXJtQ29tSW1wbC5yZWNvcmRMb2cocmVjb3JkKTtcbiAgICB9XG59XG5cbnZhciBjb250YWluZXIgPSByZXF1aXJlKFwiZGljb250YWluZXJcIikuY29udGFpbmVyO1xuXG5jb250YWluZXIuc2VydmljZShcInN3YXJtTG9nZ2luZ01vbml0b3JcIiwgW1wic3dhcm1pbmdJc1dvcmtpbmdcIiwgXCJzd2FybUNvbUltcGxcIl0sIGZ1bmN0aW9uKG91dE9mU2VydmljZSxzd2FybWluZywgc3dhcm1Db21JbXBsKXtcblxuICAgIGlmKG91dE9mU2VydmljZSl7XG4gICAgICAgIGlmKCF0ZW1wb3JhcnlMb2dCdWZmZXIpe1xuICAgICAgICAgICAgdGVtcG9yYXJ5TG9nQnVmZmVyID0gW107XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdG1wID0gdGVtcG9yYXJ5TG9nQnVmZmVyO1xuICAgICAgICB0ZW1wb3JhcnlMb2dCdWZmZXIgPSBbXTtcbiAgICAgICAgY3VycmVudFN3YXJtQ29tSW1wbCA9IHN3YXJtQ29tSW1wbDtcbiAgICAgICAgbG9nZ2VyLnJlY29yZCA9IGZ1bmN0aW9uKHJlY29yZCl7XG4gICAgICAgICAgICBjdXJyZW50U3dhcm1Db21JbXBsLnJlY29yZExvZyhyZWNvcmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdG1wLmZvckVhY2goZnVuY3Rpb24ocmVjb3JkKXtcbiAgICAgICAgICAgIGxvZ2dlci5yZWNvcmQocmVjb3JkKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSlcblxuKi9cbmdsb2JhbC51bmNhdWdodEV4Y2VwdGlvblN0cmluZyA9IFwiXCI7XG5nbG9iYWwudW5jYXVnaHRFeGNlcHRpb25FeGlzdHMgPSBmYWxzZTtcbmlmKHR5cGVvZiBnbG9iYWwuZ2xvYmFsVmVyYm9zaXR5ID09ICd1bmRlZmluZWQnKXtcbiAgICBnbG9iYWwuZ2xvYmFsVmVyYm9zaXR5ID0gZmFsc2U7XG59XG5cbnZhciBERUJVR19TVEFSVF9USU1FID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbmZ1bmN0aW9uIGdldERlYnVnRGVsdGEoKXtcbiAgICB2YXIgY3VycmVudFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICByZXR1cm4gY3VycmVudFRpbWUgLSBERUJVR19TVEFSVF9USU1FO1xufVxuXG4vKipcbiAqIERlYnVnIGZ1bmN0aW9ucywgaW5mbHVlbmNlZCBieSBnbG9iYWxWZXJib3NpdHkgZ2xvYmFsIHZhcmlhYmxlXG4gKiBAcGFyYW0gdHh0XG4gKi9cbmRwcmludCA9IGZ1bmN0aW9uICh0eHQpIHtcbiAgICBpZiAoZ2xvYmFsVmVyYm9zaXR5ID09IHRydWUpIHtcbiAgICAgICAgaWYgKHRoaXNBZGFwdGVyLmluaXRpbGlzZWQgKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHOiBbXCIgKyB0aGlzQWRhcHRlci5ub2RlTmFtZSArIFwiXShcIiArIGdldERlYnVnRGVsdGEoKSsgXCIpOlwiK3R4dCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHOiAoXCIgKyBnZXREZWJ1Z0RlbHRhKCkrIFwiKTpcIit0eHQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJERUJVRzogXCIgKyB0eHQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIG9ic29sZXRlIT9cbiAqIEBwYXJhbSB0eHRcbiAqL1xuZ2xvYmFsLmFwcmludCA9IGZ1bmN0aW9uICh0eHQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkRFQlVHOiBbXCIgKyB0aGlzQWRhcHRlci5ub2RlTmFtZSArIFwiXTogXCIgKyB0eHQpO1xufVxuXG5cblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9uIHVzdWFsbHkgdXNlZCBpbiB0ZXN0cywgZXhpdCBjdXJyZW50IHByb2Nlc3MgYWZ0ZXIgYSB3aGlsZVxuICogQHBhcmFtIG1zZ1xuICogQHBhcmFtIHRpbWVvdXRcbiAqL1xuZ2xvYmFsLmRlbGF5RXhpdCA9IGZ1bmN0aW9uIChtc2csIHJldENvZGUsdGltZW91dCkge1xuICAgIGlmKHJldENvZGUgPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgcmV0Q29kZSA9IEV4aXRDb2Rlcy5Vbmtub3duRXJyb3I7XG4gICAgfVxuXG4gICAgaWYodGltZW91dCA9PSB1bmRlZmluZWQpe1xuICAgICAgICB0aW1lb3V0ID0gMTAwO1xuICAgIH1cblxuICAgIGlmKG1zZyA9PSB1bmRlZmluZWQpe1xuICAgICAgICBtc2cgPSBcIkRlbGF5aW5nIGV4aXQgd2l0aCBcIisgdGltZW91dCArIFwibXNcIjtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBwcm9jZXNzLmV4aXQocmV0Q29kZSk7XG4gICAgfSwgdGltZW91dCk7XG59XG5cblxuZnVuY3Rpb24gbG9jYWxMb2cgKGxvZ1R5cGUsIG1lc3NhZ2UsIGVycikge1xuICAgIHZhciB0aW1lID0gbmV3IERhdGUoKTtcbiAgICB2YXIgbm93ID0gdGltZS5nZXREYXRlKCkgKyBcIi1cIiArICh0aW1lLmdldE1vbnRoKCkgKyAxKSArIFwiLFwiICsgdGltZS5nZXRIb3VycygpICsgXCI6XCIgKyB0aW1lLmdldE1pbnV0ZXMoKTtcbiAgICB2YXIgbXNnO1xuXG4gICAgbXNnID0gJ1snICsgbm93ICsgJ11bJyArIHRoaXNBZGFwdGVyLm5vZGVOYW1lICsgJ10gJyArIG1lc3NhZ2U7XG5cbiAgICBpZiAoZXJyICE9IG51bGwgJiYgZXJyICE9IHVuZGVmaW5lZCkge1xuICAgICAgICBtc2cgKz0gJ1xcbiAgICAgRXJyOiAnICsgZXJyLnRvU3RyaW5nKCk7XG4gICAgICAgIGlmIChlcnIuc3RhY2sgJiYgZXJyLnN0YWNrICE9IHVuZGVmaW5lZClcbiAgICAgICAgICAgIG1zZyArPSAnXFxuICAgICBTdGFjazogJyArIGVyci5zdGFjayArICdcXG4nO1xuICAgIH1cblxuICAgIGNwcmludChtc2cpO1xuICAgIGlmKHRoaXNBZGFwdGVyLmluaXRpbGlzZWQpe1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICB2YXIgZnMgPSByZXF1aXJlKFwiZnNcIik7XG4gICAgICAgICAgICBmcy5hcHBlbmRGaWxlU3luYyhnZXRTd2FybUZpbGVQYXRoKHRoaXNBZGFwdGVyLmNvbmZpZy5sb2dzUGF0aCArIFwiL1wiICsgbG9nVHlwZSksIG1zZyk7XG4gICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGluZyB0byB3cml0ZSBsb2dzIGluIFwiLCB0aGlzQWRhcHRlci5jb25maWcubG9nc1BhdGggKTtcbiAgICAgICAgfVxuXG4gICAgfVxufVxuXG5cbmdsb2JhbC5wcmludGYgPSBmdW5jdGlvbiAoLi4ucGFyYW1zKSB7XG4gICAgdmFyIGFyZ3MgPSBbXTsgLy8gZW1wdHkgYXJyYXlcbiAgICAvLyBjb3B5IGFsbCBvdGhlciBhcmd1bWVudHMgd2Ugd2FudCB0byBcInBhc3MgdGhyb3VnaFwiXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJncy5wdXNoKHBhcmFtc1tpXSk7XG4gICAgfVxuICAgIHZhciBvdXQgPSB1dGlsLmZvcm1hdC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICBjb25zb2xlLmxvZyhvdXQpO1xufVxuXG5nbG9iYWwuc3ByaW50ZiA9IGZ1bmN0aW9uICguLi5wYXJhbXMpIHtcbiAgICB2YXIgYXJncyA9IFtdOyAvLyBlbXB0eSBhcnJheVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFyZ3MucHVzaChwYXJhbXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gdXRpbC5mb3JtYXQuYXBwbHkodGhpcywgYXJncyk7XG59XG5cbiIsIlxuXG5mdW5jdGlvbiBTd2FybXNJbnN0YW5jZXNNYW5hZ2VyKCl7XG4gICAgdmFyIHN3YXJtQWxpdmVJbnN0YW5jZXMgPSB7XG5cbiAgICB9XG5cbiAgICB0aGlzLndhaXRGb3JTd2FybSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBzd2FybSwga2VlcEFsaXZlQ2hlY2spe1xuXG4gICAgICAgIGZ1bmN0aW9uIGRvTG9naWMoKXtcbiAgICAgICAgICAgIHZhciBzd2FybUlkID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpLm1ldGEuc3dhcm1JZDtcbiAgICAgICAgICAgIHZhciB3YXRjaGVyID0gc3dhcm1BbGl2ZUluc3RhbmNlc1tzd2FybUlkXTtcbiAgICAgICAgICAgIGlmKCF3YXRjaGVyKXtcbiAgICAgICAgICAgICAgICB3YXRjaGVyID0ge1xuICAgICAgICAgICAgICAgICAgICBzd2FybTpzd2FybSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6Y2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgICAgIGtlZXBBbGl2ZUNoZWNrOmtlZXBBbGl2ZUNoZWNrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN3YXJtQWxpdmVJbnN0YW5jZXNbc3dhcm1JZF0gPSB3YXRjaGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZmlsdGVyKCl7XG4gICAgICAgICAgICByZXR1cm4gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpLm1ldGEuc3dhcm1JZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vJCQudWlkR2VuZXJhdG9yLndhaXRfZm9yX2NvbmRpdGlvbihjb25kaXRpb24sZG9Mb2dpYyk7XG4gICAgICAgIHN3YXJtLm9ic2VydmUoZG9Mb2dpYywgbnVsbCwgZmlsdGVyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGVhblN3YXJtV2FpdGVyKHN3YXJtU2VyaWFsaXNhdGlvbil7IC8vIFRPRE86IGFkZCBiZXR0ZXIgbWVjaGFuaXNtcyB0byBwcmV2ZW50IG1lbW9yeSBsZWFrc1xuICAgICAgICB2YXIgc3dhcm1JZCA9IHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLnN3YXJtSWQ7XG4gICAgICAgIHZhciB3YXRjaGVyID0gc3dhcm1BbGl2ZUluc3RhbmNlc1tzd2FybUlkXTtcblxuICAgICAgICBpZighd2F0Y2hlcil7XG4gICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIud2FybmluZyhcIkludmFsaWQgc3dhcm0gcmVjZWl2ZWQ6IFwiICsgc3dhcm1JZCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYXJncyA9IHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmFyZ3M7XG4gICAgICAgIGFyZ3MucHVzaChzd2FybVNlcmlhbGlzYXRpb24pO1xuXG4gICAgICAgIHdhdGNoZXIuY2FsbGJhY2suYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgIGlmKCF3YXRjaGVyLmtlZXBBbGl2ZUNoZWNrKCkpe1xuICAgICAgICAgICAgZGVsZXRlIHN3YXJtQWxpdmVJbnN0YW5jZXNbc3dhcm1JZF07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJldml2ZV9zd2FybSA9IGZ1bmN0aW9uKHN3YXJtU2VyaWFsaXNhdGlvbil7XG5cblxuICAgICAgICB2YXIgc3dhcm1JZCAgICAgPSBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5zd2FybUlkO1xuICAgICAgICB2YXIgc3dhcm1UeXBlICAgPSBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5zd2FybVR5cGVOYW1lO1xuICAgICAgICB2YXIgaW5zdGFuY2UgICAgPSBzd2FybUFsaXZlSW5zdGFuY2VzW3N3YXJtSWRdO1xuXG4gICAgICAgIHZhciBzd2FybTtcblxuICAgICAgICBpZihpbnN0YW5jZSl7XG4gICAgICAgICAgICBzd2FybSA9IGluc3RhbmNlLnN3YXJtO1xuICAgICAgICAgICAgc3dhcm0udXBkYXRlKHN3YXJtU2VyaWFsaXNhdGlvbik7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN3YXJtID0gJCQuc3dhcm0uY3JlYXRlKHN3YXJtVHlwZSwgdW5kZWZpbmVkLCBzd2FybVNlcmlhbGlzYXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmNvbW1hbmQgPT0gXCJhc3luY1JldHVyblwiKSB7XG4gICAgICAgICAgICAkJC5QU0tfUHViU3ViLnB1Ymxpc2goJCQuQ09OU1RBTlRTLlNXQVJNX1JFVFVSTiwgc3dhcm1TZXJpYWxpc2F0aW9uKTtcbiAgICAgICAgICAgIC8vIGNsZWFuU3dhcm1XYWl0ZXIoc3dhcm1TZXJpYWxpc2F0aW9uKTtcbiAgICAgICAgfSBlbHNlIGlmIChzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5jb21tYW5kID09IFwiZXhlY3V0ZVN3YXJtUGhhc2VcIikge1xuICAgICAgICAgICAgc3dhcm0ucnVuUGhhc2Uoc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEucGhhc2VOYW1lLCBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5hcmdzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5rbm93biBjb21tYW5kXCIsIHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmNvbW1hbmQsIFwiaW4gc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuY29tbWFuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzd2FybTtcbiAgICB9XG59XG5cblxuJCQuc3dhcm1zSW5zdGFuY2VzTWFuYWdlciA9IG5ldyBTd2FybXNJbnN0YW5jZXNNYW5hZ2VyKCk7XG5cblxuIiwidmFyIGJlZXNIZWFsZXIgPSByZXF1aXJlKFwic291bmRwdWJzdWJcIikuYmVlc0hlYWxlcjtcbnZhciBzd2FybURlYnVnID0gcmVxdWlyZShcIi4uL1N3YXJtRGVidWdcIik7XG5cbmV4cG9ydHMuY3JlYXRlRm9yT2JqZWN0ID0gZnVuY3Rpb24odmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpe1xuXHR2YXIgcmV0ID0ge307XG5cblx0ZnVuY3Rpb24gZmlsdGVyRm9yU2VyaWFsaXNhYmxlICh2YWx1ZU9iamVjdCl7XG5cdFx0cmV0dXJuIHZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1JZDtcblx0fVxuXG5cdHZhciBzd2FybUZ1bmN0aW9uID0gZnVuY3Rpb24oY29udGV4dCwgcGhhc2VOYW1lKXtcblx0XHR2YXIgYXJncyA9W107XG5cdFx0Zm9yKHZhciBpID0gMjsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKyl7XG5cdFx0XHRhcmdzLnB1c2goYXJndW1lbnRzW2ldKTtcblx0XHR9XG5cblx0XHQvL21ha2UgdGhlIGV4ZWN1dGlvbiBhdCBsZXZlbCAwICAoYWZ0ZXIgYWxsIHBlbmRpbmcgZXZlbnRzKSBhbmQgd2FpdCB0byBoYXZlIGEgc3dhcm1JZFxuXHRcdHJldC5vYnNlcnZlKGZ1bmN0aW9uKCl7XG5cdFx0XHRiZWVzSGVhbGVyLmFzSlNPTih2YWx1ZU9iamVjdCwgcGhhc2VOYW1lLCBhcmdzLCBmdW5jdGlvbihlcnIsanNNc2cpe1xuXHRcdFx0XHRqc01zZy5tZXRhLnRhcmdldCA9IGNvbnRleHQ7XG5cdFx0XHRcdCQkLlBTS19QdWJTdWIucHVibGlzaCgkJC5DT05TVEFOVFMuU1dBUk1fRk9SX0VYRUNVVElPTiwganNNc2cpO1xuXHRcdFx0fSk7XG5cdFx0fSxudWxsLGZpbHRlckZvclNlcmlhbGlzYWJsZSk7XG5cblx0XHRyZXQubm90aWZ5KCk7XG5cblxuXHRcdHJldHVybiB0aGlzT2JqZWN0O1xuXHR9O1xuXG5cdHZhciBhc3luY1JldHVybiA9IGZ1bmN0aW9uKGVyciwgcmVzdWx0KXtcblx0XHR2YXIgY29udGV4dCA9IHZhbHVlT2JqZWN0LnByb3RlY3RlZFZhcnMuY29udGV4dDtcblxuXHRcdGlmKCFjb250ZXh0ICYmIHZhbHVlT2JqZWN0Lm1ldGEud2FpdFN0YWNrKXtcblx0XHRcdGNvbnRleHQgPSB2YWx1ZU9iamVjdC5tZXRhLndhaXRTdGFjay5wb3AoKTtcblx0XHRcdHZhbHVlT2JqZWN0LnByb3RlY3RlZFZhcnMuY29udGV4dCA9IGNvbnRleHQ7XG5cdFx0fVxuXG5cdFx0YmVlc0hlYWxlci5hc0pTT04odmFsdWVPYmplY3QsIFwiX19yZXR1cm5fX1wiLCBbZXJyLCByZXN1bHRdLCBmdW5jdGlvbihlcnIsanNNc2cpe1xuXHRcdFx0anNNc2cubWV0YS5jb21tYW5kID0gXCJhc3luY1JldHVyblwiO1xuXHRcdFx0aWYoIWNvbnRleHQpe1xuXHRcdFx0XHRjb250ZXh0ID0gdmFsdWVPYmplY3QubWV0YS5ob21lU2VjdXJpdHlDb250ZXh0Oy8vVE9ETzogQ0hFQ0sgVEhJU1xuXG5cdFx0XHR9XG5cdFx0XHRqc01zZy5tZXRhLnRhcmdldCA9IGNvbnRleHQ7XG5cblx0XHRcdGlmKCFjb250ZXh0KXtcblx0XHRcdFx0JCQuZXJyb3JIYW5kbGVyLmVycm9yKG5ldyBFcnJvcihcIkFzeW5jaHJvbm91cyByZXR1cm4gaW5zaWRlIG9mIGEgc3dhcm0gdGhhdCBkb2VzIG5vdCB3YWl0IGZvciByZXN1bHRzXCIpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQkLlBTS19QdWJTdWIucHVibGlzaCgkJC5DT05TVEFOVFMuU1dBUk1fRk9SX0VYRUNVVElPTiwganNNc2cpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9O1xuXG5cdGZ1bmN0aW9uIGhvbWUoZXJyLCByZXN1bHQpe1xuXHRcdGJlZXNIZWFsZXIuYXNKU09OKHZhbHVlT2JqZWN0LCBcImhvbWVcIiwgW2VyciwgcmVzdWx0XSwgZnVuY3Rpb24oZXJyLGpzTXNnKXtcblx0XHRcdHZhciBjb250ZXh0ID0gdmFsdWVPYmplY3QubWV0YS5ob21lQ29udGV4dDtcblx0XHRcdGpzTXNnLm1ldGEudGFyZ2V0ID0gY29udGV4dDtcblx0XHRcdCQkLlBTS19QdWJTdWIucHVibGlzaCgkJC5DT05TVEFOVFMuU1dBUk1fRk9SX0VYRUNVVElPTiwganNNc2cpO1xuXHRcdH0pO1xuXHR9XG5cblxuXG5cdGZ1bmN0aW9uIHdhaXRSZXN1bHRzKGNhbGxiYWNrLCBrZWVwQWxpdmVDaGVjaywgc3dhcm0pe1xuXHRcdGlmKCFzd2FybSl7XG5cdFx0XHRzd2FybSA9IHRoaXM7XG5cdFx0fVxuXHRcdGlmKCFrZWVwQWxpdmVDaGVjayl7XG5cdFx0XHRrZWVwQWxpdmVDaGVjayA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xuXHRcdGlmKCFpbm5lci5tZXRhLndhaXRTdGFjayl7XG5cdFx0XHRpbm5lci5tZXRhLndhaXRTdGFjayA9IFtdO1xuXHRcdFx0aW5uZXIubWV0YS53YWl0U3RhY2sucHVzaCgkJC5zZWN1cml0eUNvbnRleHQpXG5cdFx0fVxuXHRcdCQkLnN3YXJtc0luc3RhbmNlc01hbmFnZXIud2FpdEZvclN3YXJtKGNhbGxiYWNrLCBzd2FybSwga2VlcEFsaXZlQ2hlY2spO1xuXHR9XG5cblxuXHRmdW5jdGlvbiBnZXRJbm5lclZhbHVlKCl7XG5cdFx0cmV0dXJuIHZhbHVlT2JqZWN0O1xuXHR9XG5cblx0ZnVuY3Rpb24gcnVuUGhhc2UoZnVuY3ROYW1lLCBhcmdzKXtcblx0XHR2YXIgZnVuYyA9IHZhbHVlT2JqZWN0Lm15RnVuY3Rpb25zW2Z1bmN0TmFtZV07XG5cdFx0aWYoZnVuYyl7XG5cdFx0XHRmdW5jLmFwcGx5KHRoaXNPYmplY3QsIGFyZ3MpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IoZnVuY3ROYW1lLCB2YWx1ZU9iamVjdCwgXCJGdW5jdGlvbiBcIiArIGZ1bmN0TmFtZSArIFwiIGRvZXMgbm90IGV4aXN0IVwiKTtcblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIHVwZGF0ZShzZXJpYWxpc2F0aW9uKXtcblx0XHRiZWVzSGVhbGVyLmpzb25Ub05hdGl2ZShzZXJpYWxpc2F0aW9uLHZhbHVlT2JqZWN0KTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gdmFsdWVPZigpe1xuXHRcdHZhciByZXQgPSB7fTtcblx0XHRyZXQubWV0YSAgICAgICAgICAgICAgICA9IHZhbHVlT2JqZWN0Lm1ldGE7XG5cdFx0cmV0LnB1YmxpY1ZhcnMgICAgICAgICAgPSB2YWx1ZU9iamVjdC5wdWJsaWNWYXJzO1xuXHRcdHJldC5wcml2YXRlVmFycyAgICAgICAgID0gdmFsdWVPYmplY3QucHJpdmF0ZVZhcnM7XG5cdFx0cmV0LnByb3RlY3RlZFZhcnMgICAgICAgPSB2YWx1ZU9iamVjdC5wcm90ZWN0ZWRWYXJzO1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRmdW5jdGlvbiB0b1N0cmluZyAoKXtcblx0XHRyZXR1cm4gc3dhcm1EZWJ1Zy5jbGVhbkR1bXAodGhpc09iamVjdC52YWx1ZU9mKCkpO1xuXHR9XG5cblxuXHRmdW5jdGlvbiBjcmVhdGVQYXJhbGxlbChjYWxsYmFjayl7XG5cdFx0cmV0dXJuIHJlcXVpcmUoXCIuLi8uLi9wYXJhbGxlbEpvaW5Qb2ludFwiKS5jcmVhdGVKb2luUG9pbnQodGhpc09iamVjdCwgY2FsbGJhY2ssICQkLl9faW50ZXJuLm1rQXJncyhhcmd1bWVudHMsMSkpO1xuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlU2VyaWFsKGNhbGxiYWNrKXtcblx0XHRyZXR1cm4gcmVxdWlyZShcIi4uLy4uL3NlcmlhbEpvaW5Qb2ludFwiKS5jcmVhdGVTZXJpYWxKb2luUG9pbnQodGhpc09iamVjdCwgY2FsbGJhY2ssICQkLl9faW50ZXJuLm1rQXJncyhhcmd1bWVudHMsMSkpO1xuXHR9XG5cblx0ZnVuY3Rpb24gaW5zcGVjdCgpe1xuXHRcdHJldHVybiBzd2FybURlYnVnLmNsZWFuRHVtcCh0aGlzT2JqZWN0LnZhbHVlT2YoKSk7XG5cdH1cblxuXHRmdW5jdGlvbiBjb25zdHJ1Y3Rvcigpe1xuXHRcdHJldHVybiBTd2FybURlc2NyaXB0aW9uO1xuXHR9XG5cblx0ZnVuY3Rpb24gZW5zdXJlTG9jYWxJZCgpe1xuXHRcdGlmKCF2YWx1ZU9iamVjdC5sb2NhbElkKXtcblx0XHRcdHZhbHVlT2JqZWN0LmxvY2FsSWQgPSB2YWx1ZU9iamVjdC5tZXRhLnN3YXJtVHlwZU5hbWUgKyBcIi1cIiArIGxvY2FsSWQ7XG5cdFx0XHRsb2NhbElkKys7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gb2JzZXJ2ZShjYWxsYmFjaywgd2FpdEZvck1vcmUsIGZpbHRlcil7XG5cdFx0aWYoIXdhaXRGb3JNb3JlKXtcblx0XHRcdHdhaXRGb3JNb3JlID0gZnVuY3Rpb24gKCl7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRlbnN1cmVMb2NhbElkKCk7XG5cblx0XHQkJC5QU0tfUHViU3ViLnN1YnNjcmliZSh2YWx1ZU9iamVjdC5sb2NhbElkLCBjYWxsYmFjaywgd2FpdEZvck1vcmUsIGZpbHRlcik7XG5cdH1cblxuXHRmdW5jdGlvbiB0b0pTT04ocHJvcCl7XG5cdFx0Ly9wcmV2ZW50aW5nIG1heCBjYWxsIHN0YWNrIHNpemUgZXhjZWVkaW5nIG9uIHByb3h5IGF1dG8gcmVmZXJlbmNpbmdcblx0XHQvL3JlcGxhY2Uge30gYXMgcmVzdWx0IG9mIEpTT04oUHJveHkpIHdpdGggdGhlIHN0cmluZyBbT2JqZWN0IHByb3RlY3RlZCBvYmplY3RdXG5cdFx0cmV0dXJuIFwiW09iamVjdCBwcm90ZWN0ZWQgb2JqZWN0XVwiO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0SlNPTmFzeW5jKGNhbGxiYWNrKXtcblx0XHQvL21ha2UgdGhlIGV4ZWN1dGlvbiBhdCBsZXZlbCAwICAoYWZ0ZXIgYWxsIHBlbmRpbmcgZXZlbnRzKSBhbmQgd2FpdCB0byBoYXZlIGEgc3dhcm1JZFxuXHRcdHJldC5vYnNlcnZlKGZ1bmN0aW9uKCl7XG5cdFx0XHRiZWVzSGVhbGVyLmFzSlNPTih2YWx1ZU9iamVjdCwgbnVsbCwgbnVsbCxjYWxsYmFjayk7XG5cdFx0fSxudWxsLGZpbHRlckZvclNlcmlhbGlzYWJsZSk7XG5cdFx0cmV0Lm5vdGlmeSgpO1xuXHR9XG5cblx0ZnVuY3Rpb24gbm90aWZ5KGV2ZW50KXtcblx0XHRpZighZXZlbnQpe1xuXHRcdFx0ZXZlbnQgPSB2YWx1ZU9iamVjdDtcblx0XHR9XG5cdFx0ZW5zdXJlTG9jYWxJZCgpO1xuXHRcdCQkLlBTS19QdWJTdWIucHVibGlzaCh2YWx1ZU9iamVjdC5sb2NhbElkLCBldmVudCk7XG5cdH1cblxuXHRyZXQuc3dhcm0gICAgICAgICAgID0gc3dhcm1GdW5jdGlvbjtcblx0cmV0Lm5vdGlmeSAgICAgICAgICA9IG5vdGlmeTtcblx0cmV0LmdldEpTT05hc3luYyAgICA9IGdldEpTT05hc3luYztcblx0cmV0LnRvSlNPTiAgICAgICAgICA9IHRvSlNPTjtcblx0cmV0Lm9ic2VydmUgICAgICAgICA9IG9ic2VydmU7XG5cdHJldC5pbnNwZWN0ICAgICAgICAgPSBpbnNwZWN0O1xuXHRyZXQuam9pbiAgICAgICAgICAgID0gY3JlYXRlUGFyYWxsZWw7XG5cdHJldC5wYXJhbGxlbCAgICAgICAgPSBjcmVhdGVQYXJhbGxlbDtcblx0cmV0LnNlcmlhbCAgICAgICAgICA9IGNyZWF0ZVNlcmlhbDtcblx0cmV0LnZhbHVlT2YgICAgICAgICA9IHZhbHVlT2Y7XG5cdHJldC51cGRhdGUgICAgICAgICAgPSB1cGRhdGU7XG5cdHJldC5ydW5QaGFzZSAgICAgICAgPSBydW5QaGFzZTtcblx0cmV0Lm9uUmV0dXJuICAgICAgICA9IHdhaXRSZXN1bHRzO1xuXHRyZXQub25SZXN1bHQgICAgICAgID0gd2FpdFJlc3VsdHM7XG5cdHJldC5hc3luY1JldHVybiAgICAgPSBhc3luY1JldHVybjtcblx0cmV0LnJldHVybiAgICAgICAgICA9IGFzeW5jUmV0dXJuO1xuXHRyZXQuZ2V0SW5uZXJWYWx1ZSAgID0gZ2V0SW5uZXJWYWx1ZTtcblx0cmV0LmhvbWUgICAgICAgICAgICA9IGhvbWU7XG5cdHJldC50b1N0cmluZyAgICAgICAgPSB0b1N0cmluZztcblx0cmV0LmNvbnN0cnVjdG9yICAgICA9IGNvbnN0cnVjdG9yO1xuXG5cdHJldHVybiByZXQ7XG5cbn07IiwiZXhwb3J0cy5jcmVhdGVGb3JPYmplY3QgPSBmdW5jdGlvbih2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCl7XG5cdHZhciByZXQgPSByZXF1aXJlKFwiLi9iYXNlXCIpLmNyZWF0ZUZvck9iamVjdCh2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCk7XG5cblx0cmV0LnN3YXJtICAgICAgICAgICA9IG51bGw7XG5cdHJldC5vblJldHVybiAgICAgICAgPSBudWxsO1xuXHRyZXQub25SZXN1bHQgICAgICAgID0gbnVsbDtcblx0cmV0LmFzeW5jUmV0dXJuICAgICA9IG51bGw7XG5cdHJldC5yZXR1cm4gICAgICAgICAgPSBudWxsO1xuXHRyZXQuaG9tZSAgICAgICAgICAgID0gbnVsbDtcblxuXHRyZXR1cm4gcmV0O1xufTsiLCJleHBvcnRzLmNyZWF0ZUZvck9iamVjdCA9IGZ1bmN0aW9uKHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0LCBsb2NhbElkKXtcblx0cmV0dXJuIHJlcXVpcmUoXCIuL2Jhc2VcIikuY3JlYXRlRm9yT2JqZWN0KHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0LCBsb2NhbElkKTtcbn07IiwiLypcbkluaXRpYWwgTGljZW5zZTogKGMpIEF4aW9sb2dpYyBSZXNlYXJjaCAmIEFsYm9haWUgU8OubmljxIMuXG5Db250cmlidXRvcnM6IEF4aW9sb2dpYyBSZXNlYXJjaCAsIFByaXZhdGVTa3kgcHJvamVjdFxuQ29kZSBMaWNlbnNlOiBMR1BMIG9yIE1JVC5cbiovXG5cbi8vdmFyIGZzID0gcmVxdWlyZShcImZzXCIpO1xuLy92YXIgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuXG5mdW5jdGlvbiB3cmFwQ2FsbChvcmlnaW5hbCwgcHJlZml4TmFtZSl7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3Mpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwicHJlZml4TmFtZVwiLCBwcmVmaXhOYW1lKVxuICAgICAgICB2YXIgcHJldmlvdXNQcmVmaXggPSAkJC5saWJyYXJ5UHJlZml4O1xuICAgICAgICAkJC5saWJyYXJ5UHJlZml4ID0gcHJlZml4TmFtZTtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgdmFyIHJldCA9IG9yaWdpbmFsLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgJCQubGlicmFyeVByZWZpeCA9IHByZXZpb3VzUHJlZml4IDtcbiAgICAgICAgfWNhdGNoKGVycil7XG4gICAgICAgICAgICAkJC5saWJyYXJ5UHJlZml4ID0gcHJldmlvdXNQcmVmaXggO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBTd2FybUxpYnJhcnkocHJlZml4TmFtZSwgZm9sZGVyKXtcbiAgICAkJC5saWJyYXJpZXNbcHJlZml4TmFtZV0gPSB0aGlzO1xuICAgIHZhciBwcmVmaXhlZFJlcXVpcmUgPSB3cmFwQ2FsbChmdW5jdGlvbihwYXRoKXtcbiAgICAgICAgcmV0dXJuIHJlcXVpcmUocGF0aCk7XG4gICAgfSwgcHJlZml4TmFtZSk7XG5cbiAgICBmdW5jdGlvbiBpbmNsdWRlQWxsSW5Sb290KGZvbGRlcikge1xuICAgICAgICByZXR1cm4gcmVxdWlyZShmb2xkZXIpOyAvLyBhIGxpYnJhcnkgaXMganVzdCBhIG1vZHVsZVxuICAgICAgICAvL3ZhciBzdGF0ID0gZnMuc3RhdFN5bmMocGF0aCk7XG4gICAgICAgIC8qdmFyIGZpbGVzID0gZnMucmVhZGRpclN5bmMoZm9sZGVyKTtcbiAgICAgICAgZmlsZXMuZm9yRWFjaChmdW5jdGlvbihmaWxlTmFtZSl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiTG9hZGluZyBcIiwgZmlsZU5hbWUpO1xuICAgICAgICAgICAgdmFyIGV4dCA9IGZpbGVOYW1lLnN1YnN0cihmaWxlTmFtZS5sYXN0SW5kZXhPZignLicpICsgMSk7XG4gICAgICAgICAgICBpZihleHQudG9Mb3dlckNhc2UoKSA9PSBcImpzXCIpe1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmdWxsUGF0aCA9IHBhdGgucmVzb2x2ZShmb2xkZXIgKyBcIi9cIiArIGZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgcHJlZml4ZWRSZXF1aXJlKGZ1bGxQYXRoKTtcbiAgICAgICAgICAgICAgICB9Y2F0Y2goZSl7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSovXG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gd3JhcFN3YXJtUmVsYXRlZEZ1bmN0aW9ucyhzcGFjZSwgcHJlZml4TmFtZSl7XG4gICAgICAgIHZhciByZXQgPSB7fTtcbiAgICAgICAgdmFyIG5hbWVzID0gW1wiY3JlYXRlXCIsIFwiZGVzY3JpYmVcIiwgXCJzdGFydFwiLCBcInJlc3RhcnRcIl07XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGk8bmFtZXMubGVuZ3RoOyBpKysgKXtcbiAgICAgICAgICAgIHJldFtuYW1lc1tpXV0gPSB3cmFwQ2FsbChzcGFjZVtuYW1lc1tpXV0sIHByZWZpeE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgdGhpcy5jYWxsZmxvd3MgICAgICAgID0gdGhpcy5jYWxsZmxvdyAgID0gd3JhcFN3YXJtUmVsYXRlZEZ1bmN0aW9ucygkJC5jYWxsZmxvd3MsIHByZWZpeE5hbWUpO1xuICAgIHRoaXMuc3dhcm1zICAgICAgICAgICA9IHRoaXMuc3dhcm0gICAgICA9IHdyYXBTd2FybVJlbGF0ZWRGdW5jdGlvbnMoJCQuc3dhcm1zLCBwcmVmaXhOYW1lKTtcbiAgICB0aGlzLmNvbnRyYWN0cyAgICAgICAgPSB0aGlzLmNvbnRyYWN0ICAgPSB3cmFwU3dhcm1SZWxhdGVkRnVuY3Rpb25zKCQkLmNvbnRyYWN0cywgcHJlZml4TmFtZSk7XG4gICAgaW5jbHVkZUFsbEluUm9vdChmb2xkZXIsIHByZWZpeE5hbWUpO1xufVxuXG5leHBvcnRzLmxvYWRMaWJyYXJ5ID0gZnVuY3Rpb24ocHJlZml4TmFtZSwgZm9sZGVyKXtcbiAgICB2YXIgZXhpc3RpbmcgPSAkJC5saWJyYXJpZXNbcHJlZml4TmFtZV07XG4gICAgaWYoZXhpc3RpbmcgKXtcbiAgICAgICAgaWYoZm9sZGVyKSB7XG4gICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIud2FybmluZyhcIlJldXNpbmcgYWxyZWFkeSBsb2FkZWQgbGlicmFyeSBcIiArIHByZWZpeE5hbWUgKyBcImNvdWxkIGJlIGFuIGVycm9yIVwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXhpc3Rpbmc7XG4gICAgfVxuICAgIC8vdmFyIGFic29sdXRlUGF0aCA9IHBhdGgucmVzb2x2ZShmb2xkZXIpO1xuICAgIHJldHVybiBuZXcgU3dhcm1MaWJyYXJ5KHByZWZpeE5hbWUsIGZvbGRlcik7XG59IiwiXG4vKlxuIHJlcXVpcmUgYW5kIHJlcXVpcmVMaWJyYXJ5IGFyZSBvdmVyd3JpdGluZyB0aGUgbm9kZS5qcyBkZWZhdWx0cyBpbiBsb2FkaW5nIG1vZHVsZXMgZm9yIGluY3JlYXNpbmcgc2VjdXJpdHkgYW5kIHNwZWVkLlxuIFdlIGd1YXJhbnRlZSB0aGF0IGVhY2ggbW9kdWxlIG9yIGxpYnJhcnkgaXMgbG9hZGVkIG9ubHkgb25jZSBhbmQgb25seSBmcm9tIGEgc2luZ2xlIGZvbGRlci4uLiBVc2UgdGhlIHN0YW5kYXJkIHJlcXVpcmUgaWYgeW91IG5lZWQgc29tZXRoaW5nIGVsc2UhXG5cbiAqL1xuXG5cbmlmICh0eXBlb2Yod2luZG93KSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGdsb2JhbCA9IHdpbmRvdztcbn1cblxuXG5pZih0eXBlb2YoZ2xvYmFsLiQkKSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgZ2xvYmFsLiQkID0ge307XG4gICAgJCQuX19nbG9iYWwgPSB7XG5cbiAgICB9O1xufVxuXG5pZih0eXBlb2YoZ2xvYmFsLmZ1bmN0aW9uVW5kZWZpbmVkKSA9PSBcInVuZGVmaW5lZFwiKXtcbiAgICBnbG9iYWwuZnVuY3Rpb25VbmRlZmluZWQgPSBmdW5jdGlvbigpe1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNhbGxlZCBvZiBhbiB1bmRlZmluZWQgZnVuY3Rpb24hISEhXCIpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsZWQgb2YgYW4gdW5kZWZpbmVkIGZ1bmN0aW9uXCIpO1xuICAgIH1cbiAgICBpZih0eXBlb2YoZ2xvYmFsLmJyb3dzZXJSZXF1aXJlKSA9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgZ2xvYmFsLmJyb3dzZXJSZXF1aXJlID0gZ2xvYmFsLmZ1bmN0aW9uVW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmKHR5cGVvZihnbG9iYWwuZG9tYWluUmVxdWlyZSkgPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgIGdsb2JhbC5kb21haW5SZXF1aXJlID0gZ2xvYmFsLmZ1bmN0aW9uVW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmKHR5cGVvZihnbG9iYWwucHNrcnVudGltZVJlcXVpcmUpID09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICBnbG9iYWwucHNrcnVudGltZVJlcXVpcmUgPSBnbG9iYWwuZnVuY3Rpb25VbmRlZmluZWQ7XG4gICAgfVxufVxuXG5pZih0eXBlb2YoJCQubG9nKSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgJCQubG9nID0gZnVuY3Rpb24oLi4uYXJncyl7XG4gICAgICAgIGNvbnNvbGUubG9nKGFyZ3Muam9pbihcIiBcIikpO1xuICAgIH1cbn1cblxuXG52YXIgd2VBcmVJbmJyb3dzZXIgPSAodHlwZW9mKCQkLmJyb3dzZXJSdW50aW1lKSAhPSBcInVuZGVmaW5lZFwiKTtcblxuXG52YXIgcGFzdFJlcXVlc3RzID0ge307XG5mdW5jdGlvbiBwcmV2ZW50UmVjdXJzaXZlUmVxdWlyZShyZXF1ZXN0KXtcbiAgICBpZihwYXN0UmVxdWVzdHNbcmVxdWVzdF0pe1xuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKFwiUHJldmVudGluZyByZWN1cnNpdmUgcmVxdWlyZSBmb3IgXCIgKyByZXF1ZXN0KTtcbiAgICAgICAgZXJyLnR5cGUgPSBcIlBTS0lnbm9yYWJsZUVycm9yXCJcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgIH1cblxufVxuXG5mdW5jdGlvbiBkaXNhYmxlUmVxdWlyZShyZXF1ZXN0KXtcbiAgICBwYXN0UmVxdWVzdHNbcmVxdWVzdF0gPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBlbmFibGVSZXF1aXJlKHJlcXVlc3Qpe1xuICAgIHBhc3RSZXF1ZXN0c1tyZXF1ZXN0XSA9IGZhbHNlO1xufVxuXG5cbmZ1bmN0aW9uIHJlcXVpcmVGcm9tQ2FjaGUocmVxdWVzdCl7XG4gICAgdmFyIGV4aXN0aW5nTW9kdWxlID0gJCQuX19ydW50aW1lTW9kdWxlc1tyZXF1ZXN0XTtcbiAgICByZXR1cm4gIGV4aXN0aW5nTW9kdWxlO1xufVxuXG5mdW5jdGlvbiB0cnlSZXF1aXJlU2VxdWVuY2UoYXJyLCByZXF1ZXN0KXtcbiAgICBwcmV2ZW50UmVjdXJzaXZlUmVxdWlyZShyZXF1ZXN0KTtcbiAgICBkaXNhYmxlUmVxdWlyZShyZXF1ZXN0KTtcbiAgICB2YXIgcmVzdWx0O1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspe1xuICAgICAgICB2YXIgZnVuYyA9IGFycltpXTtcbiAgICAgICAgdHJ5e1xuXG4gICAgICAgICAgICBpZihmdW5jID09PSBnbG9iYWwuZnVuY3Rpb25VbmRlZmluZWQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgcmVzdWx0ID0gZnVuYyhyZXF1ZXN0KTtcbiAgICAgICAgICAgIGlmKHJlc3VsdCl7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcInJldHVybmluZyByZXN1bHQgZm9yIFwiLCByZXF1ZXN0LCAhIXJlc3VsdCk7XG4gICAgICAgICAgICAgICAgJCQuX19ydW50aW1lTW9kdWxlc1tyZXF1ZXN0XSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgaWYoZXJyLnR5cGUgIT0gXCJQU0tJZ25vcmFibGVFcnJvclwiKXtcbiAgICAgICAgICAgICAgICAkJC5sb2coXCJSZXF1aXJlIGZhaWxlZCBpbiBcIiwgZnVuYywgcmVxdWVzdCwgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmKCFyZXN1bHQpe1xuICAgICAgICAkJC5sb2coXCJGYWlsZWQgdG8gbG9hZCBtb2R1bGUgXCIsIHJlcXVlc3QsIHJlc3VsdCk7XG4gICAgfVxuXG4gICAgZW5hYmxlUmVxdWlyZShyZXF1ZXN0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5cbmlmICh0eXBlb2YoJCQucmVxdWlyZSkgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICQkLl9fcnVudGltZU1vZHVsZXMgPSB7fTtcblxuICAgIGlmICghd2VBcmVJbmJyb3dzZXIpIHsgIC8vd2UgYXJlIGluIG5vZGVcblxuICAgICAgICAkJC5fX3J1bnRpbWVNb2R1bGVzW1wiY3J5cHRvXCJdID0gcmVxdWlyZShcImNyeXB0b1wiKTtcbiAgICAgICAgJCQuX19ydW50aW1lTW9kdWxlc1tcInV0aWxcIl0gPSByZXF1aXJlKFwidXRpbFwiKTtcblxuICAgICAgICAkJC5sb2coXCJSZWRlZmluaW5nIHJlcXVpcmUgZm9yIG5vZGVcIik7XG4gICAgICAgIHZhciBNb2R1bGUgPSByZXF1aXJlKCdtb2R1bGUnKTtcbiAgICAgICAgJCQuX19vcmlnaW5hbFJlcXVpcmUgPSBNb2R1bGUuX2xvYWQ7XG5cbiAgICAgICAgZnVuY3Rpb24gbmV3TG9hZGVyKHJlcXVlc3QpIHtcbiAgICAgICAgICAgIC8vcHJldmVudFJlY3Vyc2l2ZVJlcXVpcmUocmVxdWVzdCk7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9yaWdpbmFsUmVxdWlyZSguLi5hcmdzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gJCQuX19vcmlnaW5hbFJlcXVpcmUuYXBwbHkoc2VsZixhcmdzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRyeVJlcXVpcmVTZXF1ZW5jZShbcmVxdWlyZUZyb21DYWNoZSwgcHNrcnVudGltZVJlcXVpcmUsIGRvbWFpblJlcXVpcmUsIG9yaWdpbmFsUmVxdWlyZV0sIHJlcXVlc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgTW9kdWxlLl9sb2FkID0gbmV3TG9hZGVyO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgJCQubG9nKFwiRGVmaW5pbmcgZ2xvYmFsIHJlcXVpcmUgaW4gYnJvd3NlclwiKTtcblxuICAgICAgICBnbG9iYWwucmVxdWlyZSA9IGZ1bmN0aW9uKHJlcXVlc3Qpe1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ5UmVxdWlyZVNlcXVlbmNlKFtyZXF1aXJlRnJvbUNhY2hlLCBicm93c2VyUmVxdWlyZSwgZG9tYWluUmVxdWlyZSwgcHNrcnVudGltZVJlcXVpcmVdLCByZXF1ZXN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICQkLnJlcXVpcmUgPSByZXF1aXJlO1xufVxuIiwiXG52YXIgam9pbkNvdW50ZXIgPSAwO1xuXG5mdW5jdGlvbiBQYXJhbGxlbEpvaW5Qb2ludChzd2FybSwgY2FsbGJhY2ssIGFyZ3Mpe1xuICAgIGpvaW5Db3VudGVyKys7XG4gICAgdmFyIGNoYW5uZWxJZCA9IFwiUGFyYWxsZWxKb2luUG9pbnRcIiArIGpvaW5Db3VudGVyO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgY291bnRlciA9IDA7XG4gICAgdmFyIHN0b3BPdGhlckV4ZWN1dGlvbiAgICAgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIGV4ZWN1dGlvblN0ZXAoc3RlcEZ1bmMsIGxvY2FsQXJncywgc3RvcCl7XG5cbiAgICAgICAgdGhpcy5kb0V4ZWN1dGUgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYoc3RvcE90aGVyRXhlY3V0aW9uKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgc3RlcEZ1bmMuYXBwbHkoc3dhcm0sIGxvY2FsQXJncyk7XG4gICAgICAgICAgICAgICAgaWYoc3RvcCl7XG4gICAgICAgICAgICAgICAgICAgIHN0b3BPdGhlckV4ZWN1dGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vZXZlcnl0aW5nIGlzIGZpbmVcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICBhcmdzLnVuc2hpZnQoZXJyKTtcbiAgICAgICAgICAgICAgICBzZW5kRm9yU291bmRFeGVjdXRpb24oY2FsbGJhY2ssIGFyZ3MsIHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy9zdG9wIGl0LCBkbyBub3QgY2FsbCBhZ2FpbiBhbnl0aGluZ1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IoXCJpbnZhbGlkIGpvaW5cIixzd2FybSwgXCJpbnZhbGlkIGZ1bmN0aW9uIGF0IGpvaW4gaW4gc3dhcm1cIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkJC5QU0tfUHViU3ViLnN1YnNjcmliZShjaGFubmVsSWQsZnVuY3Rpb24oZm9yRXhlY3V0aW9uKXtcbiAgICAgICAgaWYoc3RvcE90aGVyRXhlY3V0aW9uKXtcbiAgICAgICAgICAgIHJldHVybiA7XG4gICAgICAgIH1cblxuICAgICAgICB0cnl7XG4gICAgICAgICAgICBpZihmb3JFeGVjdXRpb24uZG9FeGVjdXRlKCkpe1xuICAgICAgICAgICAgICAgIGRlY0NvdW50ZXIoKTtcbiAgICAgICAgICAgIH0gLy8gaGFkIGFuIGVycm9yLi4uXG4gICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIC8vJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKFwiX19pbnRlcm5hbF9fXCIsc3dhcm0sIFwiZXhjZXB0aW9uIGluIHRoZSBleGVjdXRpb24gb2YgdGhlIGpvaW4gZnVuY3Rpb24gb2YgYSBwYXJhbGxlbCB0YXNrXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBpbmNDb3VudGVyKCl7XG4gICAgICAgIGlmKHRlc3RJZlVuZGVySW5zcGVjdGlvbigpKXtcbiAgICAgICAgICAgIC8vcHJldmVudGluZyBpbnNwZWN0b3IgZnJvbSBpbmNyZWFzaW5nIGNvdW50ZXIgd2hlbiByZWFkaW5nIHRoZSB2YWx1ZXMgZm9yIGRlYnVnIHJlYXNvblxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcInByZXZlbnRpbmcgaW5zcGVjdGlvblwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb3VudGVyKys7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGVzdElmVW5kZXJJbnNwZWN0aW9uKCl7XG4gICAgICAgIHZhciByZXMgPSBmYWxzZTtcbiAgICAgICAgdmFyIGNvbnN0QXJndiA9IHByb2Nlc3MuZXhlY0FyZ3Yuam9pbigpO1xuICAgICAgICBpZihjb25zdEFyZ3YuaW5kZXhPZihcImluc3BlY3RcIikhPT0tMSB8fCBjb25zdEFyZ3YuaW5kZXhPZihcImRlYnVnXCIpIT09LTEpe1xuICAgICAgICAgICAgLy9vbmx5IHdoZW4gcnVubmluZyBpbiBkZWJ1Z1xuICAgICAgICAgICAgdmFyIGNhbGxzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrO1xuICAgICAgICAgICAgaWYoY2FsbHN0YWNrLmluZGV4T2YoXCJEZWJ1Z0NvbW1hbmRQcm9jZXNzb3JcIikhPT0tMSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJEZWJ1Z0NvbW1hbmRQcm9jZXNzb3IgZGV0ZWN0ZWQhXCIpO1xuICAgICAgICAgICAgICAgIHJlcyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZW5kRm9yU291bmRFeGVjdXRpb24oZnVuY3QsIGFyZ3MsIHN0b3Ape1xuICAgICAgICB2YXIgb2JqID0gbmV3IGV4ZWN1dGlvblN0ZXAoZnVuY3QsIGFyZ3MsIHN0b3ApO1xuICAgICAgICAkJC5QU0tfUHViU3ViLnB1Ymxpc2goY2hhbm5lbElkLCBvYmopOyAvLyBmb3JjZSBleGVjdXRpb24gdG8gYmUgXCJzb3VuZFwiXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVjQ291bnRlcigpe1xuICAgICAgICBjb3VudGVyLS07XG4gICAgICAgIGlmKGNvdW50ZXIgPT0gMCkge1xuICAgICAgICAgICAgYXJncy51bnNoaWZ0KG51bGwpO1xuICAgICAgICAgICAgc2VuZEZvclNvdW5kRXhlY3V0aW9uKGNhbGxiYWNrLCBhcmdzLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaW5uZXIgPSBzd2FybS5nZXRJbm5lclZhbHVlKCk7XG5cbiAgICBmdW5jdGlvbiBkZWZhdWx0UHJvZ3Jlc3NSZXBvcnQoZXJyLCByZXMpe1xuICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGV4dDpcIlBhcmFsbGVsIGV4ZWN1dGlvbiBwcm9ncmVzcyBldmVudFwiLFxuICAgICAgICAgICAgc3dhcm06c3dhcm0sXG4gICAgICAgICAgICBhcmdzOmFyZ3MsXG4gICAgICAgICAgICBjdXJyZW50UmVzdWx0OnJlc1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1rRnVuY3Rpb24obmFtZSl7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKXtcbiAgICAgICAgICAgIHZhciBmID0gZGVmYXVsdFByb2dyZXNzUmVwb3J0O1xuICAgICAgICAgICAgaWYobmFtZSAhPSBcInByb2dyZXNzXCIpe1xuICAgICAgICAgICAgICAgIGYgPSBpbm5lci5teUZ1bmN0aW9uc1tuYW1lXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcmdzID0gJCQuX19pbnRlcm4ubWtBcmdzKGFyZ3MsIDApO1xuICAgICAgICAgICAgc2VuZEZvclNvdW5kRXhlY3V0aW9uKGYsIGFyZ3MsIGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybiBfX3Byb3h5T2JqZWN0O1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICB0aGlzLmdldCA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpe1xuICAgICAgICBpZihpbm5lci5teUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wKSB8fCBwcm9wID09IFwicHJvZ3Jlc3NcIil7XG4gICAgICAgICAgICBpbmNDb3VudGVyKCk7XG4gICAgICAgICAgICByZXR1cm4gbWtGdW5jdGlvbihwcm9wKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3dhcm1bcHJvcF07XG4gICAgfTtcblxuICAgIHZhciBfX3Byb3h5T2JqZWN0O1xuXG4gICAgdGhpcy5fX3NldFByb3h5T2JqZWN0ID0gZnVuY3Rpb24ocCl7XG4gICAgICAgIF9fcHJveHlPYmplY3QgPSBwO1xuICAgIH1cbn1cblxuZXhwb3J0cy5jcmVhdGVKb2luUG9pbnQgPSBmdW5jdGlvbihzd2FybSwgY2FsbGJhY2ssIGFyZ3Mpe1xuICAgIHZhciBqcCA9IG5ldyBQYXJhbGxlbEpvaW5Qb2ludChzd2FybSwgY2FsbGJhY2ssIGFyZ3MpO1xuICAgIHZhciBpbm5lciA9IHN3YXJtLmdldElubmVyVmFsdWUoKTtcbiAgICB2YXIgcCA9IG5ldyBQcm94eShpbm5lciwganApO1xuICAgIGpwLl9fc2V0UHJveHlPYmplY3QocCk7XG4gICAgcmV0dXJuIHA7XG59OyIsIlxuZnVuY3Rpb24gZW5jb2RlKGJ1ZmZlcikge1xuICAgIHJldHVybiBidWZmZXIudG9TdHJpbmcoJ2Jhc2U2NCcpXG4gICAgICAgIC5yZXBsYWNlKC9cXCsvZywgJycpXG4gICAgICAgIC5yZXBsYWNlKC9cXC8vZywgJycpXG4gICAgICAgIC5yZXBsYWNlKC89KyQvLCAnJyk7XG59O1xuXG5mdW5jdGlvbiBzdGFtcFdpdGhUaW1lKGJ1Ziwgc2FsdCwgbXNhbHQpe1xuICAgIGlmKCFzYWx0KXtcbiAgICAgICAgc2FsdCA9IDE7XG4gICAgfVxuICAgIGlmKCFtc2FsdCl7XG4gICAgICAgIG1zYWx0ID0gMTtcbiAgICB9XG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZTtcbiAgICB2YXIgY3QgPSBNYXRoLmZsb29yKGRhdGUuZ2V0VGltZSgpIC8gc2FsdCk7XG4gICAgdmFyIGNvdW50ZXIgPSAwO1xuICAgIHdoaWxlKGN0ID4gMCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiQ291bnRlclwiLCBjb3VudGVyLCBjdCk7XG4gICAgICAgIGJ1Zltjb3VudGVyKm1zYWx0XSA9IE1hdGguZmxvb3IoY3QgJSAyNTYpO1xuICAgICAgICBjdCA9IE1hdGguZmxvb3IoY3QgLyAyNTYpO1xuICAgICAgICBjb3VudGVyKys7XG4gICAgfVxufVxuXG4vKlxuICAgIFRoZSB1aWQgY29udGFpbnMgYXJvdW5kIDI1NiBiaXRzIG9mIHJhbmRvbW5lc3MgYW5kIGFyZSB1bmlxdWUgYXQgdGhlIGxldmVsIG9mIHNlY29uZHMuIFRoaXMgVVVJRCBzaG91bGQgYnkgY3J5cHRvZ3JhcGhpY2FsbHkgc2FmZSAoY2FuIG5vdCBiZSBndWVzc2VkKVxuXG4gICAgV2UgZ2VuZXJhdGUgYSBzYWZlIFVJRCB0aGF0IGlzIGd1YXJhbnRlZWQgdW5pcXVlIChieSB1c2FnZSBvZiBhIFBSTkcgdG8gZ2VuZWF0ZSAyNTYgYml0cykgYW5kIHRpbWUgc3RhbXBpbmcgd2l0aCB0aGUgbnVtYmVyIG9mIHNlY29uZHMgYXQgdGhlIG1vbWVudCB3aGVuIGlzIGdlbmVyYXRlZFxuICAgIFRoaXMgbWV0aG9kIHNob3VsZCBiZSBzYWZlIHRvIHVzZSBhdCB0aGUgbGV2ZWwgb2YgdmVyeSBsYXJnZSBkaXN0cmlidXRlZCBzeXN0ZW1zLlxuICAgIFRoZSBVVUlEIGlzIHN0YW1wZWQgd2l0aCB0aW1lIChzZWNvbmRzKTogZG9lcyBpdCBvcGVuIGEgd2F5IHRvIGd1ZXNzIHRoZSBVVUlEPyBJdCBkZXBlbmRzIGhvdyBzYWZlIGlzIFwiY3J5cHRvXCIgUFJORywgYnV0IGl0IHNob3VsZCBiZSBubyBwcm9ibGVtLi4uXG5cbiAqL1xuXG5leHBvcnRzLnNhZmVfdXVpZCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgcmVxdWlyZSgnY3J5cHRvJykucmFuZG9tQnl0ZXMoMzYsIGZ1bmN0aW9uIChlcnIsIGJ1Zikge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN0YW1wV2l0aFRpbWUoYnVmLCAxMDAwLCAzKTtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgZW5jb2RlKGJ1ZikpO1xuICAgIH0pO1xufVxuXG5cbi8qXG4gICAgVHJ5IHRvIGdlbmVyYXRlIGEgc21hbGwgVUlEIHRoYXQgaXMgdW5pcXVlIGFnYWluc3QgY2hhbmNlIGluIHRoZSBzYW1lIG1pbGxpc2Vjb25kIHNlY29uZCBhbmQgaW4gYSBzcGVjaWZpYyBjb250ZXh0IChlZyBpbiB0aGUgc2FtZSBjaG9yZW9ncmFwaHkgZXhlY3V0aW9uKVxuICAgIFRoZSBpZCBjb250YWlucyBhcm91bmQgNio4ID0gNDggIGJpdHMgb2YgcmFuZG9tbmVzcyBhbmQgYXJlIHVuaXF1ZSBhdCB0aGUgbGV2ZWwgb2YgbWlsbGlzZWNvbmRzXG4gICAgVGhpcyBtZXRob2QgaXMgc2FmZSBvbiBhIHNpbmdsZSBjb21wdXRlciBidXQgc2hvdWxkIGJlIHVzZWQgd2l0aCBjYXJlIG90aGVyd2lzZVxuICAgIFRoaXMgVVVJRCBpcyBub3QgY3J5cHRvZ3JhcGhpY2FsbHkgc2FmZSAoY2FuIGJlIGd1ZXNzZWQpXG4gKi9cbmV4cG9ydHMuc2hvcnRfdXVpZCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgcmVxdWlyZSgnY3J5cHRvJykucmFuZG9tQnl0ZXMoMTIsIGZ1bmN0aW9uIChlcnIsIGJ1Zikge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN0YW1wV2l0aFRpbWUoYnVmLDEsMik7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIGVuY29kZShidWYpKTtcbiAgICB9KTtcbn0iLCJcbnZhciBqb2luQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIFNlcmlhbEpvaW5Qb2ludChzd2FybSwgY2FsbGJhY2ssIGFyZ3Mpe1xuXG4gICAgam9pbkNvdW50ZXIrKztcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgY2hhbm5lbElkID0gXCJTZXJpYWxKb2luUG9pbnRcIiArIGpvaW5Db3VudGVyO1xuXG4gICAgaWYodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IoXCJ1bmtub3duXCIsIHN3YXJtLCBcImludmFsaWQgZnVuY3Rpb24gZ2l2ZW4gdG8gc2VyaWFsIGluIHN3YXJtXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xuXG5cbiAgICBmdW5jdGlvbiBkZWZhdWx0UHJvZ3Jlc3NSZXBvcnQoZXJyLCByZXMpe1xuICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuXG4gICAgdmFyIGZ1bmN0aW9uQ291bnRlciAgICAgPSAwO1xuICAgIHZhciBleGVjdXRpb25Db3VudGVyICAgID0gMDtcblxuICAgIHZhciBwbGFubmVkRXhlY3V0aW9ucyAgID0gW107XG4gICAgdmFyIHBsYW5uZWRBcmd1bWVudHMgICAgPSB7fTtcblxuICAgIGZ1bmN0aW9uIG1rRnVuY3Rpb24obmFtZSwgcG9zKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkNyZWF0aW5nIGZ1bmN0aW9uIFwiLCBuYW1lLCBwb3MpO1xuICAgICAgICBwbGFubmVkQXJndW1lbnRzW3Bvc10gPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgZnVuY3Rpb24gdHJpZ2dldE5leHRTdGVwKCl7XG4gICAgICAgICAgICBpZihwbGFubmVkRXhlY3V0aW9ucy5sZW5ndGggPT0gZXhlY3V0aW9uQ291bnRlciB8fCBwbGFubmVkQXJndW1lbnRzW2V4ZWN1dGlvbkNvdW50ZXJdICkgIHtcbiAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLnB1Ymxpc2goY2hhbm5lbElkLCBzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmID0gZnVuY3Rpb24gKC4uLmFyZ3Mpe1xuICAgICAgICAgICAgaWYoZXhlY3V0aW9uQ291bnRlciAhPSBwb3MpIHtcbiAgICAgICAgICAgICAgICBwbGFubmVkQXJndW1lbnRzW3Bvc10gPSBhcmdzO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJEZWxheWluZyBmdW5jdGlvbjpcIiwgZXhlY3V0aW9uQ291bnRlciwgcG9zLCBwbGFubmVkQXJndW1lbnRzLCBhcmd1bWVudHMsIGZ1bmN0aW9uQ291bnRlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9fcHJveHk7XG4gICAgICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICAgICAgaWYocGxhbm5lZEFyZ3VtZW50c1twb3NdKXtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIkV4ZWN1dGluZyAgZnVuY3Rpb246XCIsIGV4ZWN1dGlvbkNvdW50ZXIsIHBvcywgcGxhbm5lZEFyZ3VtZW50cywgYXJndW1lbnRzLCBmdW5jdGlvbkNvdW50ZXIpO1xuXHRcdFx0XHRcdGFyZ3MgPSBwbGFubmVkQXJndW1lbnRzW3Bvc107XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGxhbm5lZEFyZ3VtZW50c1twb3NdID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgdHJpZ2dldE5leHRTdGVwKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfX3Byb3h5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGYgPSBkZWZhdWx0UHJvZ3Jlc3NSZXBvcnQ7XG4gICAgICAgICAgICBpZihuYW1lICE9IFwicHJvZ3Jlc3NcIil7XG4gICAgICAgICAgICAgICAgZiA9IGlubmVyLm15RnVuY3Rpb25zW25hbWVdO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBmLmFwcGx5KHNlbGYsYXJncyk7XG4gICAgICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MudW5zaGlmdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShzd2FybSxhcmdzKTsgLy9lcnJvclxuICAgICAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLnVuc3Vic2NyaWJlKGNoYW5uZWxJZCxydW5OZXh0RnVuY3Rpb24pO1xuICAgICAgICAgICAgICAgIHJldHVybjsgLy90ZXJtaW5hdGUgZXhlY3V0aW9uIHdpdGggYW4gZXJyb3IuLi4hXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBleGVjdXRpb25Db3VudGVyKys7XG5cbiAgICAgICAgICAgIHRyaWdnZXROZXh0U3RlcCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gX19wcm94eTtcbiAgICAgICAgfTtcblxuICAgICAgICBwbGFubmVkRXhlY3V0aW9ucy5wdXNoKGYpO1xuICAgICAgICBmdW5jdGlvbkNvdW50ZXIrKztcbiAgICAgICAgcmV0dXJuIGY7XG4gICAgfVxuXG4gICAgIHZhciBmaW5pc2hlZCA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gcnVuTmV4dEZ1bmN0aW9uKCl7XG4gICAgICAgIGlmKGV4ZWN1dGlvbkNvdW50ZXIgPT0gcGxhbm5lZEV4ZWN1dGlvbnMubGVuZ3RoICl7XG4gICAgICAgICAgICBpZighZmluaXNoZWQpe1xuICAgICAgICAgICAgICAgIGFyZ3MudW5zaGlmdChudWxsKTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShzd2FybSxhcmdzKTtcbiAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgJCQuUFNLX1B1YlN1Yi51bnN1YnNjcmliZShjaGFubmVsSWQscnVuTmV4dEZ1bmN0aW9uKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzZXJpYWwgY29uc3RydWN0IGlzIHVzaW5nIGZ1bmN0aW9ucyB0aGF0IGFyZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMuLi5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwbGFubmVkRXhlY3V0aW9uc1tleGVjdXRpb25Db3VudGVyXSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgJCQuUFNLX1B1YlN1Yi5zdWJzY3JpYmUoY2hhbm5lbElkLHJ1bk5leHRGdW5jdGlvbik7IC8vIGZvcmNlIGl0IHRvIGJlIFwic291bmRcIlxuXG5cbiAgICB0aGlzLmdldCA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpe1xuICAgICAgICBpZihwcm9wID09IFwicHJvZ3Jlc3NcIiB8fCBpbm5lci5teUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wKSl7XG4gICAgICAgICAgICByZXR1cm4gbWtGdW5jdGlvbihwcm9wLCBmdW5jdGlvbkNvdW50ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzd2FybVtwcm9wXTtcbiAgICB9XG5cbiAgICB2YXIgX19wcm94eTtcbiAgICB0aGlzLnNldFByb3h5T2JqZWN0ID0gZnVuY3Rpb24ocCl7XG4gICAgICAgIF9fcHJveHkgPSBwO1xuICAgIH1cbn1cblxuZXhwb3J0cy5jcmVhdGVTZXJpYWxKb2luUG9pbnQgPSBmdW5jdGlvbihzd2FybSwgY2FsbGJhY2ssIGFyZ3Mpe1xuICAgIHZhciBqcCA9IG5ldyBTZXJpYWxKb2luUG9pbnQoc3dhcm0sIGNhbGxiYWNrLCBhcmdzKTtcbiAgICB2YXIgaW5uZXIgPSBzd2FybS5nZXRJbm5lclZhbHVlKCk7XG4gICAgdmFyIHAgPSBuZXcgUHJveHkoaW5uZXIsIGpwKTtcbiAgICBqcC5zZXRQcm94eU9iamVjdChwKTtcbiAgICByZXR1cm4gcDtcbn0iLCJmdW5jdGlvbiBTd2FybVNwYWNlKHN3YXJtVHlwZSwgdXRpbHMpIHtcblxuICAgIHZhciBiZWVzSGVhbGVyID0gcmVxdWlyZShcInNvdW5kcHVic3ViXCIpLmJlZXNIZWFsZXI7XG5cbiAgICBmdW5jdGlvbiBnZXRGdWxsTmFtZShzaG9ydE5hbWUpe1xuICAgICAgICB2YXIgZnVsbE5hbWU7XG4gICAgICAgIGlmKHNob3J0TmFtZSAmJiBzaG9ydE5hbWUuaW5jbHVkZXMoXCIuXCIpKSB7XG4gICAgICAgICAgICBmdWxsTmFtZSA9IHNob3J0TmFtZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZ1bGxOYW1lID0gJCQubGlicmFyeVByZWZpeCArIFwiLlwiICsgc2hvcnROYW1lOyAvL1RPRE86IGNoZWNrIG1vcmUgYWJvdXQgLiAhP1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdWxsTmFtZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBWYXJEZXNjcmlwdGlvbihkZXNjKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGluaXQ6ZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3RvcmU6ZnVuY3Rpb24oanNvblN0cmluZyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoanNvblN0cmluZyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdG9Kc29uU3RyaW5nOmZ1bmN0aW9uKHgpe1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIFN3YXJtRGVzY3JpcHRpb24oc3dhcm1UeXBlTmFtZSwgZGVzY3JpcHRpb24pe1xuXG4gICAgICAgIHN3YXJtVHlwZU5hbWUgPSBnZXRGdWxsTmFtZShzd2FybVR5cGVOYW1lKTtcblxuICAgICAgICB2YXIgbG9jYWxJZCA9IDA7ICAvLyB1bmlxdWUgZm9yIGVhY2ggc3dhcm1cblxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVWYXJzKGRlc2NyKXtcbiAgICAgICAgICAgIHZhciBtZW1iZXJzID0ge307XG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gZGVzY3Ipe1xuICAgICAgICAgICAgICAgIG1lbWJlcnNbdl0gPSBuZXcgVmFyRGVzY3JpcHRpb24oZGVzY3Jbdl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1lbWJlcnM7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVNZW1iZXJzKGRlc2NyKXtcbiAgICAgICAgICAgIHZhciBtZW1iZXJzID0ge307XG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gZGVzY3JpcHRpb24pe1xuXG4gICAgICAgICAgICAgICAgaWYodiAhPSBcInB1YmxpY1wiICYmIHYgIT0gXCJwcml2YXRlXCIpe1xuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzW3ZdID0gZGVzY3JpcHRpb25bdl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1lbWJlcnM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcHVibGljVmFycyA9IGNyZWF0ZVZhcnMoZGVzY3JpcHRpb24ucHVibGljKTtcbiAgICAgICAgdmFyIHByaXZhdGVWYXJzID0gY3JlYXRlVmFycyhkZXNjcmlwdGlvbi5wcml2YXRlKTtcbiAgICAgICAgdmFyIG15RnVuY3Rpb25zID0gY3JlYXRlTWVtYmVycyhkZXNjcmlwdGlvbik7XG5cbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlUGhhc2UodGhpc0luc3RhbmNlLCBmdW5jKXtcbiAgICAgICAgICAgIHZhciBwaGFzZSA9IGZ1bmN0aW9uKC4uLmFyZ3Mpe1xuICAgICAgICAgICAgICAgIHZhciByZXQ7XG4gICAgICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLmJsb2NrQ2FsbEJhY2tzKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldCA9IGZ1bmMuYXBwbHkodGhpc0luc3RhbmNlLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgJCQuUFNLX1B1YlN1Yi5yZWxlYXNlQ2FsbEJhY2tzKCk7XG4gICAgICAgICAgICAgICAgfWNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIucmVsZWFzZUNhbGxCYWNrcygpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2R5bmFtaWMgbmFtZWQgZnVuYyBpbiBvcmRlciB0byBpbXByb3ZlIGNhbGxzdGFja1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHBoYXNlLCBcIm5hbWVcIiwge2dldDogZnVuY3Rpb24oKXtyZXR1cm4gc3dhcm1UeXBlTmFtZStcIi5cIitmdW5jLm5hbWV9fSk7XG4gICAgICAgICAgICByZXR1cm4gcGhhc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluaXRpYWxpc2UgPSBmdW5jdGlvbihzZXJpYWxpc2VkVmFsdWVzKXtcblxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBwdWJsaWNWYXJzOntcblxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcHJpdmF0ZVZhcnM6e1xuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwcm90ZWN0ZWRWYXJzOntcblxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbXlGdW5jdGlvbnM6e1xuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB1dGlsaXR5RnVuY3Rpb25zOntcblxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbWV0YTp7XG4gICAgICAgICAgICAgICAgICAgIHN3YXJtVHlwZU5hbWU6c3dhcm1UeXBlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1EZXNjcmlwdGlvbjpkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cblxuICAgICAgICAgICAgZm9yKHZhciB2IGluIHB1YmxpY1ZhcnMpe1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdWJsaWNWYXJzW3ZdID0gcHVibGljVmFyc1t2XS5pbml0KCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gcHJpdmF0ZVZhcnMpe1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wcml2YXRlVmFyc1t2XSA9IHByaXZhdGVWYXJzW3ZdLmluaXQoKTtcbiAgICAgICAgICAgIH07XG5cblxuICAgICAgICAgICAgaWYoc2VyaWFsaXNlZFZhbHVlcyl7XG4gICAgICAgICAgICAgICAgYmVlc0hlYWxlci5qc29uVG9OYXRpdmUoc2VyaWFsaXNlZFZhbHVlcywgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pbml0aWFsaXNlRnVuY3Rpb25zID0gZnVuY3Rpb24odmFsdWVPYmplY3QsIHRoaXNPYmplY3Qpe1xuXG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gbXlGdW5jdGlvbnMpe1xuICAgICAgICAgICAgICAgIHZhbHVlT2JqZWN0Lm15RnVuY3Rpb25zW3ZdID0gY3JlYXRlUGhhc2UodGhpc09iamVjdCwgbXlGdW5jdGlvbnNbdl0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbG9jYWxJZCsrO1xuICAgICAgICAgICAgdmFsdWVPYmplY3QudXRpbGl0eUZ1bmN0aW9ucyA9IHV0aWxzLmNyZWF0ZUZvck9iamVjdCh2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpe1xuXG5cbiAgICAgICAgICAgIGlmKHB1YmxpY1ZhcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQucHVibGljVmFyc1twcm9wZXJ0eV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHByaXZhdGVWYXJzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnByaXZhdGVWYXJzW3Byb3BlcnR5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGFyZ2V0LnV0aWxpdHlGdW5jdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxuICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC51dGlsaXR5RnVuY3Rpb25zW3Byb3BlcnR5XTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICBpZihteUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5teUZ1bmN0aW9uc1twcm9wZXJ0eV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRhcmdldC5wcm90ZWN0ZWRWYXJzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnByb3RlY3RlZFZhcnNbcHJvcGVydHldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0eXBlb2YgcHJvcGVydHkgIT0gXCJzeW1ib2xcIikge1xuICAgICAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihwcm9wZXJ0eSwgdGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldCA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcil7XG5cbiAgICAgICAgICAgIGlmKHRhcmdldC51dGlsaXR5RnVuY3Rpb25zLmhhc093blByb3BlcnR5KHByb3BlcnR5KSB8fCB0YXJnZXQubXlGdW5jdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XG4gICAgICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKHByb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUcnlpbmcgdG8gb3ZlcndyaXRlIGltbXV0YWJsZSBtZW1iZXJcIiArIHByb3BlcnR5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYocHJpdmF0ZVZhcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRhcmdldC5wcml2YXRlVmFyc1twcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgaWYocHVibGljVmFycy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnB1YmxpY1ZhcnNbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldC5wcm90ZWN0ZWRWYXJzW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFwcGx5ID0gZnVuY3Rpb24odGFyZ2V0LCB0aGlzQXJnLCBhcmd1bWVudHNMaXN0KXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUHJveHkgYXBwbHlcIik7XG4gICAgICAgICAgICAvL3ZhciBmdW5jID0gdGFyZ2V0W11cbiAgICAgICAgICAgIC8vc3dhcm1HbG9iYWxzLmV4ZWN1dGlvblByb3ZpZGVyLmV4ZWN1dGUobnVsbCwgdGhpc0FyZywgZnVuYywgYXJndW1lbnRzTGlzdClcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmlzRXh0ZW5zaWJsZSA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaGFzID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgICAgICBpZih0YXJnZXQucHVibGljVmFyc1twcm9wXSB8fCB0YXJnZXQucHJvdGVjdGVkVmFyc1twcm9wXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub3duS2V5cyA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3Qub3duS2V5cyh0YXJnZXQucHVibGljVmFycyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNlcmlhbGlzZWRWYWx1ZXMpe1xuICAgICAgICAgICAgdmFyIHZhbHVlT2JqZWN0ID0gc2VsZi5pbml0aWFsaXNlKHNlcmlhbGlzZWRWYWx1ZXMpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBQcm94eSh2YWx1ZU9iamVjdCxzZWxmKTtcbiAgICAgICAgICAgIHNlbGYuaW5pdGlhbGlzZUZ1bmN0aW9ucyh2YWx1ZU9iamVjdCxyZXN1bHQpO1xuICAgICAgICAgICAgaWYoIXNlcmlhbGlzZWRWYWx1ZXMpe1xuICAgICAgICAgICAgICAgICQkLnVpZEdlbmVyYXRvci5zYWZlX3V1aWQoZnVuY3Rpb24gKGVyciwgcmVzdWx0KXtcbiAgICAgICAgICAgICAgICAgICAgaWYoIXZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1JZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZU9iamVjdC5tZXRhLnN3YXJtSWQgPSByZXN1bHQ7ICAvL2RvIG5vdCBvdmVyd3JpdGUhISFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZU9iamVjdC51dGlsaXR5RnVuY3Rpb25zLm5vdGlmeSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBkZXNjcmlwdGlvbnMgPSB7fTtcblxuICAgIHRoaXMuZGVzY3JpYmUgPSBmdW5jdGlvbiBkZXNjcmliZVN3YXJtKHN3YXJtVHlwZU5hbWUsIGRlc2NyaXB0aW9uKXtcbiAgICAgICAgc3dhcm1UeXBlTmFtZSA9IGdldEZ1bGxOYW1lKHN3YXJtVHlwZU5hbWUpO1xuXG4gICAgICAgIHZhciBwb2ludFBvcyA9IHN3YXJtVHlwZU5hbWUubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgICAgdmFyIHNob3J0TmFtZSA9IHN3YXJtVHlwZU5hbWUuc3Vic3RyKCBwb2ludFBvcysgMSk7XG4gICAgICAgIHZhciBsaWJyYXJ5TmFtZSA9IHN3YXJtVHlwZU5hbWUuc3Vic3RyKDAsIHBvaW50UG9zKTtcbiAgICAgICAgaWYoIWxpYnJhcnlOYW1lKXtcbiAgICAgICAgICAgIGxpYnJhcnlOYW1lID0gXCJnbG9iYWxcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkZXNjcmlwdGlvbiA9IG5ldyBTd2FybURlc2NyaXB0aW9uKHN3YXJtVHlwZU5hbWUsIGRlc2NyaXB0aW9uKTtcbiAgICAgICAgaWYoZGVzY3JpcHRpb25zW3N3YXJtVHlwZU5hbWVdICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIud2FybmluZyhcIkR1cGxpY2F0ZSBzd2FybSBkZXNjcmlwdGlvbiBcIisgc3dhcm1UeXBlTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBkZXNjcmlwdGlvbnNbc3dhcm1UeXBlTmFtZV0gPSBkZXNjcmlwdGlvbjtcblxuICAgICAgICBpZigkJC5yZWdpc3RlclN3YXJtRGVzY3JpcHRpb24pe1xuXHRcdFx0JCQucmVnaXN0ZXJTd2FybURlc2NyaXB0aW9uKGxpYnJhcnlOYW1lLCBzaG9ydE5hbWUsIHN3YXJtVHlwZU5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXNjcmlwdGlvbjtcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZVN3YXJtKHN3YXJtVHlwZU5hbWUsIGRlc2NyaXB0aW9uLCBpbml0aWFsVmFsdWVzKXtcbiAgICAgICAgc3dhcm1UeXBlTmFtZSA9IGdldEZ1bGxOYW1lKHN3YXJtVHlwZU5hbWUpO1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICBpZih1bmRlZmluZWQgPT0gZGVzY3JpcHRpb24pe1xuICAgICAgICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnNbc3dhcm1UeXBlTmFtZV0oaW5pdGlhbFZhbHVlcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRlc2NyaWJlKHN3YXJtVHlwZU5hbWUsIGRlc2NyaXB0aW9uKShpbml0aWFsVmFsdWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDcmVhdGVTd2FybSBlcnJvclwiLCBlcnIpO1xuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLmVycm9yKGVyciwgYXJndW1lbnRzLCBcIldyb25nIG5hbWUgb3IgZGVzY3JpcHRpb25zXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yZXN0YXJ0ID0gZnVuY3Rpb24oc3dhcm1UeXBlTmFtZSwgaW5pdGlhbFZhbHVlcyl7XG4gICAgICAgIHN3YXJtVHlwZU5hbWUgPSBnZXRGdWxsTmFtZShzd2FybVR5cGVOYW1lKTtcbiAgICAgICAgdmFyIGRlc2MgPSBkZXNjcmlwdGlvbnNbc3dhcm1UeXBlTmFtZV07XG5cbiAgICAgICAgaWYoZGVzYyl7XG4gICAgICAgICAgICByZXR1cm4gZGVzYyhpbml0aWFsVmFsdWVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihzd2FybVR5cGVOYW1lLGluaXRpYWxWYWx1ZXMsXG4gICAgICAgICAgICAgICAgXCJGYWlsZWQgdG8gcmVzdGFydCBhIHN3YXJtIHdpdGggdHlwZSBcIiArIHN3YXJtVHlwZU5hbWUgKyBcIlxcbiBNYXliZSBkaWZmcmVudCBzd2FybSBzcGFjZSAodXNlZCBmbG93IGluc3RlYWQgb2Ygc3dhcm0hPylcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oc3dhcm1UeXBlTmFtZSwgLi4ucGFyYW1zKXtcbiAgICAgICAgc3dhcm1UeXBlTmFtZSA9IGdldEZ1bGxOYW1lKHN3YXJtVHlwZU5hbWUpO1xuICAgICAgICB2YXIgZGVzYyA9IGRlc2NyaXB0aW9uc1tzd2FybVR5cGVOYW1lXTtcbiAgICAgICAgaWYoIWRlc2Mpe1xuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKG51bGwsIHN3YXJtVHlwZU5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlcyA9IGRlc2MoKTtcblxuICAgICAgICBpZihwYXJhbXMubGVuZ3RoID4gMSl7XG4gICAgICAgICAgICB2YXIgYXJncyA9W107XG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwO2kgPCBwYXJhbXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIGFyZ3MucHVzaChwYXJhbXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzLnN3YXJtLmFwcGx5KHJlcywgYXJncyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbn1cblxuZXhwb3J0cy5jcmVhdGVTd2FybUVuZ2luZSA9IGZ1bmN0aW9uKHN3YXJtVHlwZSwgdXRpbHMpe1xuICAgIGlmKHR5cGVvZiB1dGlscyA9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgdXRpbHMgPSByZXF1aXJlKFwiLi9jaG9yZW9ncmFwaGllcy91dGlsaXR5RnVuY3Rpb25zL2NhbGxmbG93XCIpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN3YXJtU3BhY2Uoc3dhcm1UeXBlLCB1dGlscyk7XG59OyIsImZ1bmN0aW9uIFF1ZXVlRWxlbWVudChjb250ZW50KSB7XG5cdHRoaXMuY29udGVudCA9IGNvbnRlbnQ7XG5cdHRoaXMubmV4dCA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIFF1ZXVlKCkge1xuXHR0aGlzLmhlYWQgPSBudWxsO1xuXHR0aGlzLnRhaWwgPSBudWxsO1xuXG5cdHRoaXMucHVzaCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdGxldCBuZXdFbGVtZW50ID0gbmV3IFF1ZXVlRWxlbWVudCh2YWx1ZSk7XG5cdFx0aWYgKCF0aGlzLmhlYWQpIHtcblx0XHRcdHRoaXMuaGVhZCA9IG5ld0VsZW1lbnQ7XG5cdFx0XHR0aGlzLnRhaWwgPSBuZXdFbGVtZW50O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnRhaWwubmV4dCA9IG5ld0VsZW1lbnQ7XG5cdFx0XHR0aGlzLnRhaWwgPSBuZXdFbGVtZW50XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMucG9wID0gZnVuY3Rpb24gKCkge1xuXHRcdGlmICghdGhpcy5oZWFkKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdFx0Y29uc3QgaGVhZENvcHkgPSB0aGlzLmhlYWQ7XG5cdFx0dGhpcy5oZWFkID0gdGhpcy5oZWFkLm5leHQ7XG5cdFx0cmV0dXJuIGhlYWRDb3B5LmNvbnRlbnQ7XG5cdH07XG5cblx0dGhpcy5mcm9udCA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5oZWFkID8gdGhpcy5oZWFkLmNvbnRlbnQgOiB1bmRlZmluZWQ7XG5cdH07XG5cblx0dGhpcy5pc0VtcHR5ID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLmhlYWQgPT0gbnVsbDtcblx0fTtcblxuXHR0aGlzW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiogKCkge1xuXHRcdGxldCBoZWFkID0gdGhpcy5oZWFkO1xuXHRcdHdoaWxlKGhlYWQgIT09IG51bGwpIHtcblx0XHRcdHlpZWxkIGhlYWQuY29udGVudDtcblx0XHRcdGhlYWQgPSBoZWFkLm5leHQ7XG5cdFx0fVxuXHR9LmJpbmQodGhpcyk7XG59XG5cblF1ZXVlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcblx0bGV0IHN0cmluZ2lmaWVkUXVldWUgPSAnJztcblx0bGV0IGl0ZXJhdG9yID0gdGhpcy5oZWFkO1xuXHR3aGlsZSAoaXRlcmF0b3IpIHtcblx0XHRzdHJpbmdpZmllZFF1ZXVlICs9IGAke0pTT04uc3RyaW5naWZ5KGl0ZXJhdG9yLmNvbnRlbnQpfSBgO1xuXHRcdGl0ZXJhdG9yID0gaXRlcmF0b3IubmV4dDtcblx0fVxuXHRyZXR1cm4gc3RyaW5naWZpZWRRdWV1ZVxufTtcblxuUXVldWUucHJvdG90eXBlLmluc3BlY3QgPSBRdWV1ZS5wcm90b3R5cGUudG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gUXVldWU7IiwiXG4vKlxuICAgIFByZXBhcmUgdGhlIHN0YXRlIG9mIGEgc3dhcm0gdG8gYmUgc2VyaWFsaXNlZFxuKi9cblxuZXhwb3J0cy5hc0pTT04gPSBmdW5jdGlvbih2YWx1ZU9iamVjdCwgcGhhc2VOYW1lLCBhcmdzLCBjYWxsYmFjayl7XG5cbiAgICAgICAgdmFyIHZhbHVlT2JqZWN0ID0gdmFsdWVPYmplY3QudmFsdWVPZigpO1xuICAgICAgICB2YXIgcmVzID0ge307XG4gICAgICAgIHJlcy5wdWJsaWNWYXJzICAgICAgICAgID0gdmFsdWVPYmplY3QucHVibGljVmFycztcbiAgICAgICAgcmVzLnByaXZhdGVWYXJzICAgICAgICAgPSB2YWx1ZU9iamVjdC5wcml2YXRlVmFycztcbiAgICAgICAgcmVzLm1ldGEgICAgICAgICAgICAgICAgPSB7fTtcblxuICAgICAgICByZXMubWV0YS5zd2FybVR5cGVOYW1lICA9IHZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1UeXBlTmFtZTtcbiAgICAgICAgcmVzLm1ldGEuc3dhcm1JZCAgICAgICAgPSB2YWx1ZU9iamVjdC5tZXRhLnN3YXJtSWQ7XG4gICAgICAgIHJlcy5tZXRhLnRhcmdldCAgICAgICAgID0gdmFsdWVPYmplY3QubWV0YS50YXJnZXQ7XG5cbiAgICAgICAgaWYoIXBoYXNlTmFtZSl7XG4gICAgICAgICAgICByZXMubWV0YS5jb21tYW5kICAgID0gXCJzdG9yZWRcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcy5tZXRhLnBoYXNlTmFtZSAgPSBwaGFzZU5hbWU7XG4gICAgICAgICAgICByZXMubWV0YS5hcmdzICAgICAgID0gYXJncztcbiAgICAgICAgICAgIHJlcy5tZXRhLmNvbW1hbmQgICAgPSB2YWx1ZU9iamVjdC5tZXRhLmNvbW1hbmQgfHwgXCJleGVjdXRlU3dhcm1QaGFzZVwiO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzLm1ldGEud2FpdFN0YWNrICA9IHZhbHVlT2JqZWN0Lm1ldGEud2FpdFN0YWNrOyAvL1RPRE86IHRoaW5rIGlmIGlzIG5vdCBiZXR0ZXIgdG8gYmUgZGVlcCBjbG9uZWQgYW5kIG5vdCByZWZlcmVuY2VkISEhXG5cbiAgICAgICAgaWYoY2FsbGJhY2spe1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzKTtcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKFwiYXNKU09OOlwiLCByZXMsIHZhbHVlT2JqZWN0KTtcbiAgICAgICAgcmV0dXJuIHJlcztcbn1cblxuZXhwb3J0cy5qc29uVG9OYXRpdmUgPSBmdW5jdGlvbihzZXJpYWxpc2VkVmFsdWVzLCByZXN1bHQpe1xuXG4gICAgZm9yKHZhciB2IGluIHNlcmlhbGlzZWRWYWx1ZXMucHVibGljVmFycyl7XG4gICAgICAgIHJlc3VsdC5wdWJsaWNWYXJzW3ZdID0gc2VyaWFsaXNlZFZhbHVlcy5wdWJsaWNWYXJzW3ZdO1xuXG4gICAgfTtcbiAgICBmb3IodmFyIHYgaW4gc2VyaWFsaXNlZFZhbHVlcy5wcml2YXRlVmFycyl7XG4gICAgICAgIHJlc3VsdC5wcml2YXRlVmFyc1t2XSA9IHNlcmlhbGlzZWRWYWx1ZXMucHJpdmF0ZVZhcnNbdl07XG4gICAgfTtcblxuICAgIGZvcih2YXIgdiBpbiBzZXJpYWxpc2VkVmFsdWVzLm1ldGEpe1xuICAgICAgICByZXN1bHQubWV0YVt2XSA9IHNlcmlhbGlzZWRWYWx1ZXMubWV0YVt2XTtcbiAgICB9O1xuXG59IiwiLypcbkluaXRpYWwgTGljZW5zZTogKGMpIEF4aW9sb2dpYyBSZXNlYXJjaCAmIEFsYm9haWUgU8OubmljxIMuXG5Db250cmlidXRvcnM6IEF4aW9sb2dpYyBSZXNlYXJjaCAsIFByaXZhdGVTa3kgcHJvamVjdFxuQ29kZSBMaWNlbnNlOiBMR1BMIG9yIE1JVC5cbiovXG5cblxuLyoqXG4gKiAgIFVzdWFsbHkgYW4gZXZlbnQgY291bGQgY2F1c2UgZXhlY3V0aW9uIG9mIG90aGVyIGNhbGxiYWNrIGV2ZW50cyAuIFdlIHNheSB0aGF0IGlzIGEgbGV2ZWwgMSBldmVudCBpZiBpcyBjYXVzZWVkIGJ5IGEgbGV2ZWwgMCBldmVudCBhbmQgc28gb25cbiAqXG4gKiAgICAgIFNvdW5kUHViU3ViIHByb3ZpZGVzIGludHVpdGl2ZSByZXN1bHRzIHJlZ2FyZGluZyB0byBhc3luY2hyb25vdXMgY2FsbHMgb2YgY2FsbGJhY2tzIGFuZCBjb21wdXRlZCB2YWx1ZXMvZXhwcmVzc2lvbnM6XG4gKiAgIHdlIHByZXZlbnQgaW1tZWRpYXRlIGV4ZWN1dGlvbiBvZiBldmVudCBjYWxsYmFja3MgdG8gZW5zdXJlIHRoZSBpbnR1aXRpdmUgZmluYWwgcmVzdWx0IGlzIGd1YXJhbnRlZWQgYXMgbGV2ZWwgMCBleGVjdXRpb25cbiAqICAgd2UgZ3VhcmFudGVlIHRoYXQgYW55IGNhbGxiYWNrIGZ1bmN0aW9uIGlzIFwicmUtZW50cmFudFwiXG4gKiAgIHdlIGFyZSBhbHNvIHRyeWluZyB0byByZWR1Y2UgdGhlIG51bWJlciBvZiBjYWxsYmFjayBleGVjdXRpb24gYnkgbG9va2luZyBpbiBxdWV1ZXMgYXQgbmV3IG1lc3NhZ2VzIHB1Ymxpc2hlZCBieVxuICogICB0cnlpbmcgdG8gY29tcGFjdCB0aG9zZSBtZXNzYWdlcyAocmVtb3ZpbmcgZHVwbGljYXRlIG1lc3NhZ2VzLCBtb2RpZnlpbmcgbWVzc2FnZXMsIG9yIGFkZGluZyBpbiB0aGUgaGlzdG9yeSBvZiBhbm90aGVyIGV2ZW50ICxldGMpXG4gKlxuICogICAgICBFeGFtcGxlIG9mIHdoYXQgY2FuIGJlIHdyb25nIHdpdGhvdXQgbm9uLXNvdW5kIGFzeW5jaHJvbm91cyBjYWxsczpcblxuICogIFN0ZXAgMDogSW5pdGlhbCBzdGF0ZTpcbiAqICAgYSA9IDA7XG4gKiAgIGIgPSAwO1xuICpcbiAqICBTdGVwIDE6IEluaXRpYWwgb3BlcmF0aW9uczpcbiAqICAgYSA9IDE7XG4gKiAgIGIgPSAtMTtcbiAqXG4gKiAgLy8gYW4gb2JzZXJ2ZXIgcmVhY3RzIHRvIGNoYW5nZXMgaW4gYSBhbmQgYiBhbmQgY29tcHV0ZSBDT1JSRUNUIGxpa2UgdGhpczpcbiAqICAgaWYoIGEgKyBiID09IDApIHtcbiAqICAgICAgIENPUlJFQ1QgPSBmYWxzZTtcbiAqICAgICAgIG5vdGlmeSguLi4pOyAvLyBhY3Qgb3Igc2VuZCBhIG5vdGlmaWNhdGlvbiBzb21ld2hlcmUuLlxuICogICB9IGVsc2Uge1xuICogICAgICBDT1JSRUNUID0gZmFsc2U7XG4gKiAgIH1cbiAqXG4gKiAgICBOb3RpY2UgdGhhdDogQ09SUkVDVCB3aWxsIGJlIHRydWUgaW4gdGhlIGVuZCAsIGJ1dCBtZWFudGltZSwgYWZ0ZXIgYSBub3RpZmljYXRpb24gd2FzIHNlbnQgYW5kIENPUlJFQ1Qgd2FzIHdyb25nbHksIHRlbXBvcmFyaWx5IGZhbHNlIVxuICogICAgc291bmRQdWJTdWIgZ3VhcmFudGVlIHRoYXQgdGhpcyBkb2VzIG5vdCBoYXBwZW4gYmVjYXVzZSB0aGUgc3luY3Jvbm91cyBjYWxsIHdpbGwgYmVmb3JlIGFueSBvYnNlcnZlciAoYm90IGFzaWduYXRpb24gb24gYSBhbmQgYilcbiAqXG4gKiAgIE1vcmU6XG4gKiAgIHlvdSBjYW4gdXNlIGJsb2NrQ2FsbEJhY2tzIGFuZCByZWxlYXNlQ2FsbEJhY2tzIGluIGEgZnVuY3Rpb24gdGhhdCBjaGFuZ2UgYSBsb3QgYSBjb2xsZWN0aW9uIG9yIGJpbmRhYmxlIG9iamVjdHMgYW5kIGFsbFxuICogICB0aGUgbm90aWZpY2F0aW9ucyB3aWxsIGJlIHNlbnQgY29tcGFjdGVkIGFuZCBwcm9wZXJseVxuICovXG5cbi8vIFRPRE86IG9wdGltaXNhdGlvbiE/IHVzZSBhIG1vcmUgZWZmaWNpZW50IHF1ZXVlIGluc3RlYWQgb2YgYXJyYXlzIHdpdGggcHVzaCBhbmQgc2hpZnQhP1xuLy8gVE9ETzogc2VlIGhvdyBiaWcgdGhvc2UgcXVldWVzIGNhbiBiZSBpbiByZWFsIGFwcGxpY2F0aW9uc1xuLy8gZm9yIGEgZmV3IGh1bmRyZWRzIGl0ZW1zLCBxdWV1ZXMgbWFkZSBmcm9tIGFycmF5IHNob3VsZCBiZSBlbm91Z2hcbi8vKiAgIFBvdGVudGlhbCBUT0RPczpcbi8vICAgICogICAgIHByZXZlbnQgYW55IGZvcm0gb2YgcHJvYmxlbSBieSBjYWxsaW5nIGNhbGxiYWNrcyBpbiB0aGUgZXhwZWN0ZWQgb3JkZXIgIT9cbi8vKiAgICAgcHJldmVudGluZyBpbmZpbml0ZSBsb29wcyBleGVjdXRpb24gY2F1c2UgYnkgZXZlbnRzIT9cbi8vKlxuLy8qXG4vLyBUT0RPOiBkZXRlY3QgaW5maW5pdGUgbG9vcHMgKG9yIHZlcnkgZGVlcCBwcm9wYWdhdGlvbikgSXQgaXMgcG9zc2libGUhP1xuXG5jb25zdCBRdWV1ZSA9IHJlcXVpcmUoJy4vUXVldWUnKTtcblxuZnVuY3Rpb24gU291bmRQdWJTdWIoKXtcblxuXHQvKipcblx0ICogcHVibGlzaFxuXHQgKiAgICAgIFB1Ymxpc2ggYSBtZXNzYWdlIHtPYmplY3R9IHRvIGEgbGlzdCBvZiBzdWJzY3JpYmVycyBvbiBhIHNwZWNpZmljIHRvcGljXG5cdCAqXG5cdCAqIEBwYXJhbXMge1N0cmluZ3xOdW1iZXJ9IHRhcmdldCwgIHtPYmplY3R9IG1lc3NhZ2Vcblx0ICogQHJldHVybiBudW1iZXIgb2YgY2hhbm5lbCBzdWJzY3JpYmVycyB0aGF0IHdpbGwgYmUgbm90aWZpZWRcblx0ICovXG5cdHRoaXMucHVibGlzaCA9IGZ1bmN0aW9uKHRhcmdldCwgbWVzc2FnZSl7XG5cdFx0aWYoIWludmFsaWRDaGFubmVsTmFtZSh0YXJnZXQpICYmICFpbnZhbGlkTWVzc2FnZVR5cGUobWVzc2FnZSkgJiYgY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF0gIT0gdW5kZWZpbmVkKXtcblx0XHRcdGNvbXBhY3RBbmRTdG9yZSh0YXJnZXQsIG1lc3NhZ2UpO1xuXHRcdFx0ZGlzcGF0Y2hOZXh0KCk7XG5cdFx0XHRyZXR1cm4gY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF0ubGVuZ3RoO1xuXHRcdH0gZWxzZXtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogc3Vic2NyaWJlXG5cdCAqICAgICAgU3Vic2NyaWJlIC8gYWRkIGEge0Z1bmN0aW9ufSBjYWxsQmFjayBvbiBhIHtTdHJpbmd8TnVtYmVyfXRhcmdldCBjaGFubmVsIHN1YnNjcmliZXJzIGxpc3QgaW4gb3JkZXIgdG8gcmVjZWl2ZVxuXHQgKiAgICAgIG1lc3NhZ2VzIHB1Ymxpc2hlZCBpZiB0aGUgY29uZGl0aW9ucyBkZWZpbmVkIGJ5IHtGdW5jdGlvbn13YWl0Rm9yTW9yZSBhbmQge0Z1bmN0aW9ufWZpbHRlciBhcmUgcGFzc2VkLlxuXHQgKlxuXHQgKiBAcGFyYW1zIHtTdHJpbmd8TnVtYmVyfXRhcmdldCwge0Z1bmN0aW9ufWNhbGxCYWNrLCB7RnVuY3Rpb259d2FpdEZvck1vcmUsIHtGdW5jdGlvbn1maWx0ZXJcblx0ICpcblx0ICogICAgICAgICAgdGFyZ2V0ICAgICAgLSBjaGFubmVsIG5hbWUgdG8gc3Vic2NyaWJlXG5cdCAqICAgICAgICAgIGNhbGxiYWNrICAgIC0gZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gYSBtZXNzYWdlIHdhcyBwdWJsaXNoZWQgb24gdGhlIGNoYW5uZWxcblx0ICogICAgICAgICAgd2FpdEZvck1vcmUgLSBhIGludGVybWVkaWFyeSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgY2FsbGVkIGFmdGVyIGEgc3VjY2Vzc2Z1bHkgbWVzc2FnZSBkZWxpdmVyeSBpbiBvcmRlclxuXHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gZGVjaWRlIGlmIGEgbmV3IG1lc3NhZ2VzIGlzIGV4cGVjdGVkLi4uXG5cdCAqICAgICAgICAgIGZpbHRlciAgICAgIC0gYSBmdW5jdGlvbiB0aGF0IHJlY2VpdmVzIHRoZSBtZXNzYWdlIGJlZm9yZSBpbnZvY2F0aW9uIG9mIGNhbGxiYWNrIGZ1bmN0aW9uIGluIG9yZGVyIHRvIGFsbG93XG5cdCAqICAgICAgICAgICAgICAgICAgICAgICAgICByZWxldmFudCBtZXNzYWdlIGJlZm9yZSBlbnRlcmluZyBpbiBub3JtYWwgY2FsbGJhY2sgZmxvd1xuXHQgKiBAcmV0dXJuXG5cdCAqL1xuXHR0aGlzLnN1YnNjcmliZSA9IGZ1bmN0aW9uKHRhcmdldCwgY2FsbEJhY2ssIHdhaXRGb3JNb3JlLCBmaWx0ZXIpe1xuXHRcdGlmKCFpbnZhbGlkQ2hhbm5lbE5hbWUodGFyZ2V0KSAmJiAhaW52YWxpZEZ1bmN0aW9uKGNhbGxCYWNrKSl7XG5cblx0XHRcdHZhciBzdWJzY3JpYmVyID0ge1wiY2FsbEJhY2tcIjpjYWxsQmFjaywgXCJ3YWl0Rm9yTW9yZVwiOndhaXRGb3JNb3JlLCBcImZpbHRlclwiOmZpbHRlcn07XG5cdFx0XHR2YXIgYXJyID0gY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF07XG5cdFx0XHRpZihhcnIgPT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0YXJyID0gW107XG5cdFx0XHRcdGNoYW5uZWxTdWJzY3JpYmVyc1t0YXJnZXRdID0gYXJyO1xuXHRcdFx0fVxuXHRcdFx0YXJyLnB1c2goc3Vic2NyaWJlcik7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiB1bnN1YnNjcmliZVxuXHQgKiAgICAgIFVuc3Vic2NyaWJlL3JlbW92ZSB7RnVuY3Rpb259IGNhbGxCYWNrIGZyb20gdGhlIGxpc3Qgb2Ygc3Vic2NyaWJlcnMgb2YgdGhlIHtTdHJpbmd8TnVtYmVyfSB0YXJnZXQgY2hhbm5lbFxuXHQgKlxuXHQgKiBAcGFyYW1zIHtTdHJpbmd8TnVtYmVyfSB0YXJnZXQsIHtGdW5jdGlvbn0gY2FsbEJhY2ssIHtGdW5jdGlvbn0gZmlsdGVyXG5cdCAqXG5cdCAqICAgICAgICAgIHRhcmdldCAgICAgIC0gY2hhbm5lbCBuYW1lIHRvIHVuc3Vic2NyaWJlXG5cdCAqICAgICAgICAgIGNhbGxiYWNrICAgIC0gcmVmZXJlbmNlIG9mIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB0aGF0IHdhcyB1c2VkIGFzIHN1YnNjcmliZVxuXHQgKiAgICAgICAgICBmaWx0ZXIgICAgICAtIHJlZmVyZW5jZSBvZiB0aGUgb3JpZ2luYWwgZmlsdGVyIGZ1bmN0aW9uXG5cdCAqIEByZXR1cm5cblx0ICovXG5cdHRoaXMudW5zdWJzY3JpYmUgPSBmdW5jdGlvbih0YXJnZXQsIGNhbGxCYWNrLCBmaWx0ZXIpe1xuXHRcdGlmKCFpbnZhbGlkRnVuY3Rpb24oY2FsbEJhY2spKXtcblx0XHRcdHZhciBnb3RpdCA9IGZhbHNlO1xuXHRcdFx0aWYoY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF0pe1xuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF0ubGVuZ3RoO2krKyl7XG5cdFx0XHRcdFx0dmFyIHN1YnNjcmliZXIgPSAgY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF1baV07XG5cdFx0XHRcdFx0aWYoc3Vic2NyaWJlci5jYWxsQmFjayA9PT0gY2FsbEJhY2sgJiYgKGZpbHRlciA9PSB1bmRlZmluZWQgfHwgc3Vic2NyaWJlci5maWx0ZXIgPT09IGZpbHRlciApKXtcblx0XHRcdFx0XHRcdGdvdGl0ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdHN1YnNjcmliZXIuZm9yRGVsZXRlID0gdHJ1ZTtcblx0XHRcdFx0XHRcdHN1YnNjcmliZXIuY2FsbEJhY2sgPSBudWxsO1xuXHRcdFx0XHRcdFx0c3Vic2NyaWJlci5maWx0ZXIgPSBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYoIWdvdGl0KXtcblx0XHRcdFx0d3ByaW50KFwiVW5hYmxlIHRvIHVuc3Vic2NyaWJlIGEgY2FsbGJhY2sgdGhhdCB3YXMgbm90IHN1YnNjcmliZWQhXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogYmxvY2tDYWxsQmFja3Ncblx0ICpcblx0ICogQHBhcmFtc1xuXHQgKiBAcmV0dXJuXG5cdCAqL1xuXHR0aGlzLmJsb2NrQ2FsbEJhY2tzID0gZnVuY3Rpb24oKXtcblx0XHRsZXZlbCsrO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiByZWxlYXNlQ2FsbEJhY2tzXG5cdCAqXG5cdCAqIEBwYXJhbXNcblx0ICogQHJldHVyblxuXHQgKi9cblx0dGhpcy5yZWxlYXNlQ2FsbEJhY2tzID0gZnVuY3Rpb24oKXtcblx0XHRsZXZlbC0tO1xuXHRcdC8vaGFjay9vcHRpbWlzYXRpb24gdG8gbm90IGZpbGwgdGhlIHN0YWNrIGluIGV4dHJlbWUgY2FzZXMgKG1hbnkgZXZlbnRzIGNhdXNlZCBieSBsb29wcyBpbiBjb2xsZWN0aW9ucyxldGMpXG5cdFx0d2hpbGUobGV2ZWwgPT0gMCAmJiBkaXNwYXRjaE5leHQodHJ1ZSkpe1xuXHRcdFx0Ly9ub3RoaW5nXG5cdFx0fVxuXG5cdFx0d2hpbGUobGV2ZWwgPT0gMCAmJiBjYWxsQWZ0ZXJBbGxFdmVudHMoKSl7XG5cblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIGFmdGVyQWxsRXZlbnRzXG5cdCAqXG5cdCAqIEBwYXJhbXMge0Z1bmN0aW9ufSBjYWxsYmFja1xuXHQgKlxuXHQgKiAgICAgICAgICBjYWxsYmFjayAtIGZ1bmN0aW9uIHRoYXQgbmVlZHMgdG8gYmUgaW52b2tlZCBvbmNlIGFsbCBldmVudHMgYXJlIGRlbGl2ZXJlZFxuXHQgKiBAcmV0dXJuXG5cdCAqL1xuXHR0aGlzLmFmdGVyQWxsRXZlbnRzID0gZnVuY3Rpb24oY2FsbEJhY2spe1xuXHRcdGlmKCFpbnZhbGlkRnVuY3Rpb24oY2FsbEJhY2spKXtcblx0XHRcdGFmdGVyRXZlbnRzQ2FsbHMucHVzaChjYWxsQmFjayk7XG5cdFx0fVxuXHRcdHRoaXMuYmxvY2tDYWxsQmFja3MoKTtcblx0XHR0aGlzLnJlbGVhc2VDYWxsQmFja3MoKTtcblx0fTtcblxuXHQvKipcblx0ICogaGFzQ2hhbm5lbFxuXHQgKlxuXHQgKiBAcGFyYW1zIHtTdHJpbmd8TnVtYmVyfSBjaGFubmVsXG5cdCAqXG5cdCAqICAgICAgICAgIGNoYW5uZWwgLSBuYW1lIG9mIHRoZSBjaGFubmVsIHRoYXQgbmVlZCB0byBiZSB0ZXN0ZWQgaWYgcHJlc2VudFxuXHQgKiBAcmV0dXJuXG5cdCAqL1xuXHR0aGlzLmhhc0NoYW5uZWwgPSBmdW5jdGlvbihjaGFubmVsKXtcblx0XHRyZXR1cm4gIWludmFsaWRDaGFubmVsTmFtZShjaGFubmVsKSAmJiBjaGFubmVsU3Vic2NyaWJlcnNbY2hhbm5lbF0gIT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGZhbHNlO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBhZGRDaGFubmVsXG5cdCAqXG5cdCAqIEBwYXJhbXMge1N0cmluZ30gY2hhbm5lbFxuXHQgKlxuXHQgKiAgICAgICAgICBjaGFubmVsIC0gbmFtZSBvZiBhIGNoYW5uZWwgdGhhdCBuZWVkcyB0byBiZSBjcmVhdGVkIGFuZCBhZGRlZCB0byBzb3VuZHB1YnN1YiByZXBvc2l0b3J5XG5cdCAqIEByZXR1cm5cblx0ICovXG5cdHRoaXMuYWRkQ2hhbm5lbCA9IGZ1bmN0aW9uKGNoYW5uZWwpe1xuXHRcdGlmKCFpbnZhbGlkQ2hhbm5lbE5hbWUoY2hhbm5lbCkgJiYgIXRoaXMuaGFzQ2hhbm5lbChjaGFubmVsKSl7XG5cdFx0XHRjaGFubmVsU3Vic2NyaWJlcnNbY2hhbm5lbF0gPSBbXTtcblx0XHR9XG5cdH07XG5cblx0LyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBwcm90ZWN0ZWQgc3R1ZmYgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdC8vIG1hcCBjaGFubmVsTmFtZSAob2JqZWN0IGxvY2FsIGlkKSAtPiBhcnJheSB3aXRoIHN1YnNjcmliZXJzXG5cdHZhciBjaGFubmVsU3Vic2NyaWJlcnMgPSB7fTtcblxuXHQvLyBtYXAgY2hhbm5lbE5hbWUgKG9iamVjdCBsb2NhbCBpZCkgLT4gcXVldWUgd2l0aCB3YWl0aW5nIG1lc3NhZ2VzXG5cdHZhciBjaGFubmVsc1N0b3JhZ2UgPSB7fTtcblxuXHQvLyBvYmplY3Rcblx0dmFyIHR5cGVDb21wYWN0b3IgPSB7fTtcblxuXHQvLyBjaGFubmVsIG5hbWVzXG5cdHZhciBleGVjdXRpb25RdWV1ZSA9IG5ldyBRdWV1ZSgpO1xuXHR2YXIgbGV2ZWwgPSAwO1xuXG5cblxuXHQvKipcblx0ICogcmVnaXN0ZXJDb21wYWN0b3Jcblx0ICpcblx0ICogICAgICAgQW4gY29tcGFjdG9yIHRha2VzIGEgbmV3RXZlbnQgYW5kIGFuZCBvbGRFdmVudCBhbmQgcmV0dXJuIHRoZSBvbmUgdGhhdCBzdXJ2aXZlcyAob2xkRXZlbnQgaWZcblx0ICogIGl0IGNhbiBjb21wYWN0IHRoZSBuZXcgb25lIG9yIHRoZSBuZXdFdmVudCBpZiBjYW4ndCBiZSBjb21wYWN0ZWQpXG5cdCAqXG5cdCAqIEBwYXJhbXMge1N0cmluZ30gdHlwZSwge0Z1bmN0aW9ufSBjYWxsQmFja1xuXHQgKlxuXHQgKiAgICAgICAgICB0eXBlICAgICAgICAtIGNoYW5uZWwgbmFtZSB0byB1bnN1YnNjcmliZVxuXHQgKiAgICAgICAgICBjYWxsQmFjayAgICAtIGhhbmRsZXIgZnVuY3Rpb24gZm9yIHRoYXQgc3BlY2lmaWMgZXZlbnQgdHlwZVxuXHQgKiBAcmV0dXJuXG5cdCAqL1xuXHR0aGlzLnJlZ2lzdGVyQ29tcGFjdG9yID0gZnVuY3Rpb24odHlwZSwgY2FsbEJhY2spIHtcblx0XHRpZighaW52YWxpZEZ1bmN0aW9uKGNhbGxCYWNrKSl7XG5cdFx0XHR0eXBlQ29tcGFjdG9yW3R5cGVdID0gY2FsbEJhY2s7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBkaXNwYXRjaE5leHRcblx0ICpcblx0ICogQHBhcmFtIGZyb21SZWxlYXNlQ2FsbEJhY2tzOiBoYWNrIHRvIHByZXZlbnQgdG9vIG1hbnkgcmVjdXJzaXZlIGNhbGxzIG9uIHJlbGVhc2VDYWxsQmFja3Ncblx0ICogQHJldHVybiB7Qm9vbGVhbn1cblx0ICovXG5cdGZ1bmN0aW9uIGRpc3BhdGNoTmV4dChmcm9tUmVsZWFzZUNhbGxCYWNrcyl7XG5cdFx0aWYobGV2ZWwgPiAwKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGxldCBjaGFubmVsTmFtZSA9IGV4ZWN1dGlvblF1ZXVlLmZyb250KCk7XG5cdFx0aWYoY2hhbm5lbE5hbWUgIT0gdW5kZWZpbmVkKXtcblx0XHRcdHNlbGYuYmxvY2tDYWxsQmFja3MoKTtcblx0XHRcdHRyeXtcblx0XHRcdFx0bGV0IG1lc3NhZ2U7XG5cdFx0XHRcdGlmKCFjaGFubmVsc1N0b3JhZ2VbY2hhbm5lbE5hbWVdLmlzRW1wdHkoKSkge1xuXHRcdFx0XHRcdG1lc3NhZ2UgPSBjaGFubmVsc1N0b3JhZ2VbY2hhbm5lbE5hbWVdLmZyb250KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYobWVzc2FnZSA9PSB1bmRlZmluZWQpe1xuXHRcdFx0XHRcdGlmKCFjaGFubmVsc1N0b3JhZ2VbY2hhbm5lbE5hbWVdLmlzRW1wdHkoKSl7XG5cdFx0XHRcdFx0XHR3cHJpbnQoXCJDYW4ndCB1c2UgYXMgbWVzc2FnZSBpbiBhIHB1Yi9zdWIgY2hhbm5lbCB0aGlzIG9iamVjdDogXCIgKyBtZXNzYWdlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZXhlY3V0aW9uUXVldWUucG9wKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYobWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXggPT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0XHRcdG1lc3NhZ2UuX190cmFuc21pc2lvbkluZGV4ID0gMDtcblx0XHRcdFx0XHRcdGZvcih2YXIgaSA9IGNoYW5uZWxTdWJzY3JpYmVyc1tjaGFubmVsTmFtZV0ubGVuZ3RoLTE7IGkgPj0gMCA7IGktLSl7XG5cdFx0XHRcdFx0XHRcdHZhciBzdWJzY3JpYmVyID0gIGNoYW5uZWxTdWJzY3JpYmVyc1tjaGFubmVsTmFtZV1baV07XG5cdFx0XHRcdFx0XHRcdGlmKHN1YnNjcmliZXIuZm9yRGVsZXRlID09IHRydWUpe1xuXHRcdFx0XHRcdFx0XHRcdGNoYW5uZWxTdWJzY3JpYmVyc1tjaGFubmVsTmFtZV0uc3BsaWNlKGksMSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2V7XG5cdFx0XHRcdFx0XHRtZXNzYWdlLl9fdHJhbnNtaXNpb25JbmRleCsrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvL1RPRE86IGZvciBpbW11dGFibGUgb2JqZWN0cyBpdCB3aWxsIG5vdCB3b3JrIGFsc28sIGZpeCBmb3Igc2hhcGUgbW9kZWxzXG5cdFx0XHRcdFx0aWYobWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXggPT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0XHRcdHdwcmludChcIkNhbid0IHVzZSBhcyBtZXNzYWdlIGluIGEgcHViL3N1YiBjaGFubmVsIHRoaXMgb2JqZWN0OiBcIiArIG1lc3NhZ2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR2YXIgc3Vic2NyaWJlciA9IGNoYW5uZWxTdWJzY3JpYmVyc1tjaGFubmVsTmFtZV1bbWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXhdO1xuXHRcdFx0XHRcdGlmKHN1YnNjcmliZXIgPT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0XHRcdGRlbGV0ZSBtZXNzYWdlLl9fdHJhbnNtaXNpb25JbmRleDtcblx0XHRcdFx0XHRcdGNoYW5uZWxzU3RvcmFnZVtjaGFubmVsTmFtZV0ucG9wKCk7XG5cdFx0XHRcdFx0fSBlbHNle1xuXHRcdFx0XHRcdFx0aWYoc3Vic2NyaWJlci5maWx0ZXIgPT0gdW5kZWZpbmVkIHx8ICghaW52YWxpZEZ1bmN0aW9uKHN1YnNjcmliZXIuZmlsdGVyKSAmJiBzdWJzY3JpYmVyLmZpbHRlcihtZXNzYWdlKSkpe1xuXHRcdFx0XHRcdFx0XHRpZighc3Vic2NyaWJlci5mb3JEZWxldGUpe1xuXHRcdFx0XHRcdFx0XHRcdHN1YnNjcmliZXIuY2FsbEJhY2sobWVzc2FnZSk7XG5cdFx0XHRcdFx0XHRcdFx0aWYoc3Vic2NyaWJlci53YWl0Rm9yTW9yZSAmJiAhaW52YWxpZEZ1bmN0aW9uKHN1YnNjcmliZXIud2FpdEZvck1vcmUpICYmXG5cdFx0XHRcdFx0XHRcdFx0XHQhc3Vic2NyaWJlci53YWl0Rm9yTW9yZShtZXNzYWdlKSl7XG5cblx0XHRcdFx0XHRcdFx0XHRcdHN1YnNjcmliZXIuZm9yRGVsZXRlID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2goZXJyKXtcblx0XHRcdFx0d3ByaW50KFwiRXZlbnQgY2FsbGJhY2sgZmFpbGVkOiBcIisgc3Vic2NyaWJlci5jYWxsQmFjayArXCJlcnJvcjogXCIgKyBlcnIuc3RhY2spO1xuXHRcdFx0fVxuXHRcdFx0Ly9cblx0XHRcdGlmKGZyb21SZWxlYXNlQ2FsbEJhY2tzKXtcblx0XHRcdFx0bGV2ZWwtLTtcblx0XHRcdH0gZWxzZXtcblx0XHRcdFx0c2VsZi5yZWxlYXNlQ2FsbEJhY2tzKCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2V7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gY29tcGFjdEFuZFN0b3JlKHRhcmdldCwgbWVzc2FnZSl7XG5cdFx0dmFyIGdvdENvbXBhY3RlZCA9IGZhbHNlO1xuXHRcdHZhciBhcnIgPSBjaGFubmVsc1N0b3JhZ2VbdGFyZ2V0XTtcblx0XHRpZihhcnIgPT0gdW5kZWZpbmVkKXtcblx0XHRcdGFyciA9IG5ldyBRdWV1ZSgpO1xuXHRcdFx0Y2hhbm5lbHNTdG9yYWdlW3RhcmdldF0gPSBhcnI7XG5cdFx0fVxuXG5cdFx0aWYobWVzc2FnZSAmJiBtZXNzYWdlLnR5cGUgIT0gdW5kZWZpbmVkKXtcblx0XHRcdHZhciB0eXBlQ29tcGFjdG9yQ2FsbEJhY2sgPSB0eXBlQ29tcGFjdG9yW21lc3NhZ2UudHlwZV07XG5cblx0XHRcdGlmKHR5cGVDb21wYWN0b3JDYWxsQmFjayAhPSB1bmRlZmluZWQpe1xuXHRcdFx0XHRmb3IobGV0IGNoYW5uZWwgb2YgYXJyKSB7XG5cdFx0XHRcdFx0aWYodHlwZUNvbXBhY3RvckNhbGxCYWNrKG1lc3NhZ2UsIGNoYW5uZWwpID09PSBjaGFubmVsKSB7XG5cdFx0XHRcdFx0XHRpZihjaGFubmVsLl9fdHJhbnNtaXNpb25JbmRleCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdGdvdENvbXBhY3RlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKCFnb3RDb21wYWN0ZWQgJiYgbWVzc2FnZSl7XG5cdFx0XHRhcnIucHVzaChtZXNzYWdlKTtcblx0XHRcdGV4ZWN1dGlvblF1ZXVlLnB1c2godGFyZ2V0KTtcblx0XHR9XG5cdH1cblxuXHR2YXIgYWZ0ZXJFdmVudHNDYWxscyA9IG5ldyBRdWV1ZSgpO1xuXHRmdW5jdGlvbiBjYWxsQWZ0ZXJBbGxFdmVudHMgKCl7XG5cdFx0aWYoIWFmdGVyRXZlbnRzQ2FsbHMuaXNFbXB0eSgpKXtcblx0XHRcdHZhciBjYWxsQmFjayA9IGFmdGVyRXZlbnRzQ2FsbHMucG9wKCk7XG5cdFx0XHQvL2RvIG5vdCBjYXRjaCBleGNlcHRpb25zIGhlcmUuLlxuXHRcdFx0Y2FsbEJhY2soKTtcblx0XHR9XG5cdFx0cmV0dXJuICFhZnRlckV2ZW50c0NhbGxzLmlzRW1wdHkoKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGludmFsaWRDaGFubmVsTmFtZShuYW1lKXtcblx0XHR2YXIgcmVzdWx0ID0gZmFsc2U7XG5cdFx0aWYoIW5hbWUgfHwgKHR5cGVvZiBuYW1lICE9IFwic3RyaW5nXCIgJiYgdHlwZW9mIG5hbWUgIT0gXCJudW1iZXJcIikpe1xuXHRcdFx0cmVzdWx0ID0gdHJ1ZTtcblx0XHRcdHdwcmludChcIkludmFsaWQgY2hhbm5lbCBuYW1lOiBcIiArIG5hbWUpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRmdW5jdGlvbiBpbnZhbGlkTWVzc2FnZVR5cGUobWVzc2FnZSl7XG5cdFx0dmFyIHJlc3VsdCA9IGZhbHNlO1xuXHRcdGlmKCFtZXNzYWdlIHx8IHR5cGVvZiBtZXNzYWdlICE9IFwib2JqZWN0XCIpe1xuXHRcdFx0cmVzdWx0ID0gdHJ1ZTtcblx0XHRcdHdwcmludChcIkludmFsaWQgbWVzc2FnZXMgdHlwZXM6IFwiICsgbWVzc2FnZSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRmdW5jdGlvbiBpbnZhbGlkRnVuY3Rpb24oY2FsbGJhY2spe1xuXHRcdHZhciByZXN1bHQgPSBmYWxzZTtcblx0XHRpZighY2FsbGJhY2sgfHwgdHlwZW9mIGNhbGxiYWNrICE9IFwiZnVuY3Rpb25cIil7XG5cdFx0XHRyZXN1bHQgPSB0cnVlO1xuXHRcdFx0d3ByaW50KFwiRXhwZWN0ZWQgdG8gYmUgZnVuY3Rpb24gYnV0IGlzOiBcIiArIGNhbGxiYWNrKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxufVxuXG5leHBvcnRzLnNvdW5kUHViU3ViID0gbmV3IFNvdW5kUHViU3ViKCk7IiwiXG4vL3ZhciBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5cbmZ1bmN0aW9uIGRlZmF1bHRFcnJvckhhbmRsaW5nSW1wbGVtZW50YXRpb24oZXJyLCByZXMpe1xuXHQvL2NvbnNvbGUubG9nKGVyci5zdGFjayk7XG5cdGlmKGVycikgdGhyb3cgZXJyO1xuXHRyZXR1cm4gcmVzO1xufVxuXG5yZXF1aXJlKFwiLi9saWIvb3ZlcndyaXRlUmVxdWlyZVwiKTtcblxuXG5cbiQkLmVycm9ySGFuZGxlciA9IHtcbiAgICAgICAgZXJyb3I6ZnVuY3Rpb24oZXJyLCBhcmdzLCBtc2cpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyLCBcIlVua25vd24gZXJyb3IgZnJvbSBmdW5jdGlvbiBjYWxsIHdpdGggYXJndW1lbnRzOlwiLCBhcmdzLCBcIk1lc3NhZ2U6XCIsIG1zZyk7XG4gICAgICAgIH0sXG4gICAgICAgIHRocm93RXJyb3I6ZnVuY3Rpb24oZXJyLCBhcmdzLCBtc2cpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyLCBcIlVua25vd24gZXJyb3IgZnJvbSBmdW5jdGlvbiBjYWxsIHdpdGggYXJndW1lbnRzOlwiLCBhcmdzLCBcIk1lc3NhZ2U6XCIsIG1zZyk7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0sXG4gICAgICAgIGlnbm9yZVBvc3NpYmxlRXJyb3I6IGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgICAgICAgY29uc29sZS5sb2cobmFtZSk7XG4gICAgICAgIH0sXG4gICAgICAgIHN5bnRheEVycm9yOmZ1bmN0aW9uKHByb3BlcnR5LCBzd2FybSwgdGV4dCl7XG4gICAgICAgICAgICAvL3Rocm93IG5ldyBFcnJvcihcIk1pc3NwZWxsZWQgbWVtYmVyIG5hbWUgb3Igb3RoZXIgaW50ZXJuYWwgZXJyb3IhXCIpO1xuICAgICAgICAgICAgdmFyIHN3YXJtTmFtZTtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2Ygc3dhcm0gPT0gXCJzdHJpbmdcIil7XG4gICAgICAgICAgICAgICAgICAgIHN3YXJtTmFtZSA9IHN3YXJtO1xuICAgICAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgIGlmKHN3YXJtICYmIHN3YXJtLm1ldGEpe1xuICAgICAgICAgICAgICAgICAgICBzd2FybU5hbWUgID0gc3dhcm0ubWV0YS5zd2FybVR5cGVOYW1lO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN3YXJtTmFtZSA9IHN3YXJtLmdldElubmVyVmFsdWUoKS5tZXRhLnN3YXJtVHlwZU5hbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgICAgIHN3YXJtTmFtZSA9IGVyci50b1N0cmluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocHJvcGVydHkpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiV3JvbmcgbWVtYmVyIG5hbWUgXCIsIHByb3BlcnR5LCAgXCIgaW4gc3dhcm0gXCIsIHN3YXJtTmFtZSk7XG4gICAgICAgICAgICAgICAgaWYodGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5rbm93biBzd2FybVwiLCBzd2FybU5hbWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG4gICAgICAgIHdhcm5pbmc6ZnVuY3Rpb24obXNnKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4kJC51aWRHZW5lcmF0b3IgPSByZXF1aXJlKFwiLi9saWIvc2FmZS11dWlkXCIpO1xuXG4kJC5zYWZlRXJyb3JIYW5kbGluZyA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcbiAgICAgICAgaWYoY2FsbGJhY2spe1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrO1xuICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICByZXR1cm4gZGVmYXVsdEVycm9ySGFuZGxpbmdJbXBsZW1lbnRhdGlvbjtcbiAgICAgICAgfVxuICAgIH07XG5cbiQkLl9faW50ZXJuID0ge1xuICAgICAgICBta0FyZ3M6ZnVuY3Rpb24oYXJncyxwb3Mpe1xuICAgICAgICAgICAgdmFyIGFyZ3NBcnJheSA9IFtdO1xuICAgICAgICAgICAgZm9yKHZhciBpID0gcG9zOyBpIDwgYXJncy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgYXJnc0FycmF5LnB1c2goYXJnc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXJnc0FycmF5O1xuICAgICAgICB9XG4gICAgfTtcblxuXG5cbnZhciBzd2FybVV0aWxzID0gcmVxdWlyZShcIi4vbGliL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvc3dhcm1cIik7XG5cbiQkLmRlZmF1bHRFcnJvckhhbmRsaW5nSW1wbGVtZW50YXRpb24gPSBkZWZhdWx0RXJyb3JIYW5kbGluZ0ltcGxlbWVudGF0aW9uO1xuXG52YXIgY2FsbGZsb3dNb2R1bGUgPSByZXF1aXJlKFwiLi9saWIvc3dhcm1EZXNjcmlwdGlvblwiKTtcbiQkLmNhbGxmbG93cyAgICAgICAgPSBjYWxsZmxvd01vZHVsZS5jcmVhdGVTd2FybUVuZ2luZShcImNhbGxmbG93XCIpO1xuJCQuY2FsbGZsb3cgICAgICAgICA9ICQkLmNhbGxmbG93cztcbiQkLmZsb3cgICAgICAgICAgICAgPSAkJC5jYWxsZmxvd3M7XG4kJC5mbG93cyAgICAgICAgICAgID0gJCQuY2FsbGZsb3dzO1xuXG4kJC5zd2FybXMgICAgICAgICAgID0gY2FsbGZsb3dNb2R1bGUuY3JlYXRlU3dhcm1FbmdpbmUoXCJzd2FybVwiLCBzd2FybVV0aWxzKTtcbiQkLnN3YXJtICAgICAgICAgICAgPSAkJC5zd2FybXM7XG4kJC5jb250cmFjdHMgICAgICAgID0gY2FsbGZsb3dNb2R1bGUuY3JlYXRlU3dhcm1FbmdpbmUoXCJjb250cmFjdFwiLCBzd2FybVV0aWxzKTtcbiQkLmNvbnRyYWN0ICAgICAgICAgPSAkJC5jb250cmFjdHM7XG5cblxuJCQuUFNLX1B1YlN1YiA9IHJlcXVpcmUoXCJzb3VuZHB1YnN1YlwiKS5zb3VuZFB1YlN1YjtcblxuJCQuc2VjdXJpdHlDb250ZXh0ID0gXCJzeXN0ZW1cIjtcbiQkLmxpYnJhcnlQcmVmaXggPSBcImdsb2JhbFwiO1xuJCQubGlicmFyaWVzID0ge1xuICAgIGdsb2JhbDp7XG5cbiAgICB9XG59O1xuXG5cblxuJCQubG9hZExpYnJhcnkgPSByZXF1aXJlKFwiLi9saWIvbG9hZExpYnJhcnlcIikubG9hZExpYnJhcnk7XG5cbnJlcXVpcmVMaWJyYXJ5ID0gZnVuY3Rpb24obmFtZSl7XG4gICAgLy92YXIgYWJzb2x1dGVQYXRoID0gcGF0aC5yZXNvbHZlKCAgJCQuX19nbG9iYWwuX19sb2FkTGlicmFyeVJvb3QgKyBuYW1lKTtcbiAgICByZXR1cm4gJCQubG9hZExpYnJhcnkobmFtZSxuYW1lKTtcbn07XG5cbiQkLnJlZ2lzdGVyU3dhcm1EZXNjcmlwdGlvbiA9ICBmdW5jdGlvbihsaWJyYXJ5TmFtZSxzaG9ydE5hbWUsIGRlc2NyaXB0aW9uKXtcbiAgICBpZighJCQubGlicmFyaWVzW2xpYnJhcnlOYW1lXSl7XG4gICAgICAgICQkLmxpYnJhcmllc1tsaWJyYXJ5TmFtZV0gPSB7fTtcbiAgICB9XG4gICAgJCQubGlicmFyaWVzW2xpYnJhcnlOYW1lXVtzaG9ydE5hbWVdID0gZGVzY3JpcHRpb247XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFx0XHRcdFx0Y3JlYXRlU3dhcm1FbmdpbmU6IHJlcXVpcmUoXCIuL2xpYi9zd2FybURlc2NyaXB0aW9uXCIpLmNyZWF0ZVN3YXJtRW5naW5lLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVKb2luUG9pbnQ6IHJlcXVpcmUoXCIuL2xpYi9wYXJhbGxlbEpvaW5Qb2ludFwiKS5jcmVhdGVKb2luUG9pbnQsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZVNlcmlhbEpvaW5Qb2ludDogcmVxdWlyZShcIi4vbGliL3NlcmlhbEpvaW5Qb2ludFwiKS5jcmVhdGVTZXJpYWxKb2luUG9pbnQsXG5cdFx0XHRcdFx0XCJzYWZlLXV1aWRcIjogcmVxdWlyZShcIi4vbGliL3NhZmUtdXVpZFwiKSxcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1JbnN0YW5jZU1hbmFnZXI6IHJlcXVpcmUoXCIuL2xpYi9jaG9yZW9ncmFwaGllcy9zd2FybUluc3RhbmNlc01hbmFnZXJcIilcblx0XHRcdFx0fTsiLCJpZih0eXBlb2Ygc2luZ2xldG9uX2NvbnRhaW5lcl9tb2R1bGVfd29ya2Fyb3VuZF9mb3Jfd2lyZWRfbm9kZV9qc19jYWNoaW5nID09ICd1bmRlZmluZWQnKSB7XG4gICAgc2luZ2xldG9uX2NvbnRhaW5lcl9tb2R1bGVfd29ya2Fyb3VuZF9mb3Jfd2lyZWRfbm9kZV9qc19jYWNoaW5nICAgPSBtb2R1bGU7XG59IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gc2luZ2xldG9uX2NvbnRhaW5lcl9tb2R1bGVfd29ya2Fyb3VuZF9mb3Jfd2lyZWRfbm9kZV9qc19jYWNoaW5nIC5leHBvcnRzO1xuICAgIHJldHVybiBtb2R1bGU7XG59XG5cbi8qKlxuICogQ3JlYXRlZCBieSBzYWxib2FpZSBvbiA0LzI3LzE1LlxuICovXG5mdW5jdGlvbiBDb250YWluZXIoZXJyb3JIYW5kbGVyKXtcbiAgICB2YXIgdGhpbmdzID0ge307ICAgICAgICAvL3RoZSBhY3R1YWwgdmFsdWVzIGZvciBvdXIgc2VydmljZXMsIHRoaW5nc1xuICAgIHZhciBpbW1lZGlhdGUgPSB7fTsgICAgIC8vaG93IGRlcGVuZGVuY2llcyB3ZXJlIGRlY2xhcmVkXG4gICAgdmFyIGNhbGxiYWNrcyA9IHt9OyAgICAgLy9jYWxsYmFjayB0aGF0IHNob3VsZCBiZSBjYWxsZWQgZm9yIGVhY2ggZGVwZW5kZW5jeSBkZWNsYXJhdGlvblxuICAgIHZhciBkZXBzQ291bnRlciA9IHt9OyAgIC8vY291bnQgZGVwZW5kZW5jaWVzXG4gICAgdmFyIHJldmVyc2VkVHJlZSA9IHt9OyAgLy9yZXZlcnNlZCBkZXBlbmRlbmNpZXMsIG9wcG9zaXRlIG9mIGltbWVkaWF0ZSBvYmplY3RcblxuICAgICB0aGlzLmR1bXAgPSBmdW5jdGlvbigpe1xuICAgICAgICAgY29uc29sZS5sb2coXCJDb25hdGluZXIgZHVtcFxcbiBUaGluZ3M6XCIsIHRoaW5ncywgXCJcXG5EZXBzIGNvdW50ZXI6IFwiLCBkZXBzQ291bnRlciwgXCJcXG5TdHJpZ2h0OlwiLCBpbW1lZGlhdGUsIFwiXFxuUmV2ZXJzZWQ6XCIsIHJldmVyc2VkVHJlZSk7XG4gICAgIH1cblxuICAgIGZ1bmN0aW9uIGluY0NvdW50ZXIobmFtZSl7XG4gICAgICAgIGlmKCFkZXBzQ291bnRlcltuYW1lXSl7XG4gICAgICAgICAgICBkZXBzQ291bnRlcltuYW1lXSA9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZXBzQ291bnRlcltuYW1lXSsrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zZXJ0RGVwZW5kZW5jeWluUlQobm9kZU5hbWUsIGRlcGVuZGVuY2llcyl7XG4gICAgICAgIGRlcGVuZGVuY2llcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW1OYW1lKXtcbiAgICAgICAgICAgIHZhciBsID0gcmV2ZXJzZWRUcmVlW2l0ZW1OYW1lXTtcbiAgICAgICAgICAgIGlmKCFsKXtcbiAgICAgICAgICAgICAgICBsID0gcmV2ZXJzZWRUcmVlW2l0ZW1OYW1lXSA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbFtub2RlTmFtZV0gPSBub2RlTmFtZTtcbiAgICAgICAgfSlcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIGRpc2NvdmVyVXBOb2Rlcyhub2RlTmFtZSl7XG4gICAgICAgIHZhciByZXMgPSB7fTtcblxuICAgICAgICBmdW5jdGlvbiBERlMobm4pe1xuICAgICAgICAgICAgdmFyIGwgPSByZXZlcnNlZFRyZWVbbm5dO1xuICAgICAgICAgICAgZm9yKHZhciBpIGluIGwpe1xuICAgICAgICAgICAgICAgIGlmKCFyZXNbaV0pe1xuICAgICAgICAgICAgICAgICAgICByZXNbaV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBERlMoaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgREZTKG5vZGVOYW1lKTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHJlcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXRDb3VudGVyKG5hbWUpe1xuICAgICAgICB2YXIgZGVwZW5kZW5jeUFycmF5ID0gaW1tZWRpYXRlW25hbWVdO1xuICAgICAgICB2YXIgY291bnRlciA9IDA7XG4gICAgICAgIGlmKGRlcGVuZGVuY3lBcnJheSl7XG4gICAgICAgICAgICBkZXBlbmRlbmN5QXJyYXkuZm9yRWFjaChmdW5jdGlvbihkZXApe1xuICAgICAgICAgICAgICAgIGlmKHRoaW5nc1tkZXBdID09IG51bGwpe1xuICAgICAgICAgICAgICAgICAgICBpbmNDb3VudGVyKG5hbWUpXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXIrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIGRlcHNDb3VudGVyW25hbWVdID0gY291bnRlcjtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkNvdW50ZXIgZm9yIFwiLCBuYW1lLCAnIGlzICcsIGNvdW50ZXIpO1xuICAgICAgICByZXR1cm4gY291bnRlcjtcbiAgICB9XG5cbiAgICAvKiByZXR1cm5zIHRob3NlIHRoYXQgYXJlIHJlYWR5IHRvIGJlIHJlc29sdmVkKi9cbiAgICBmdW5jdGlvbiByZXNldFVwQ291bnRlcnMobmFtZSl7XG4gICAgICAgIHZhciByZXQgPSBbXTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnUmVzZXRpbmcgdXAgY291bnRlcnMgZm9yICcsIG5hbWUsIFwiUmV2ZXJzZTpcIiwgcmV2ZXJzZWRUcmVlW25hbWVdKTtcbiAgICAgICAgdmFyIHVwcyA9IHJldmVyc2VkVHJlZVtuYW1lXTtcbiAgICAgICAgZm9yKHZhciB2IGluIHVwcyl7XG4gICAgICAgICAgICBpZihyZXNldENvdW50ZXIodikgPT0gMCl7XG4gICAgICAgICAgICAgICAgcmV0LnB1c2godik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICAvKlxuICAgICAgICAgVGhlIGZpcnN0IGFyZ3VtZW50IGlzIGEgbmFtZSBmb3IgYSBzZXJ2aWNlLCB2YXJpYWJsZSxhICB0aGluZyB0aGF0IHNob3VsZCBiZSBpbml0aWFsaXNlZCwgcmVjcmVhdGVkLCBldGNcbiAgICAgICAgIFRoZSBzZWNvbmQgYXJndW1lbnQgaXMgYW4gYXJyYXkgd2l0aCBkZXBlbmRlbmNpZXNcbiAgICAgICAgIHRoZSBsYXN0IGFyZ3VtZW50IGlzIGEgZnVuY3Rpb24oZXJyLC4uLikgdGhhdCBpcyBjYWxsZWQgd2hlbiBkZXBlbmRlbmNpZXMgYXJlIHJlYWR5IG9yIHJlY2FsbGVkIHdoZW4gYXJlIG5vdCByZWFkeSAoc3RvcCB3YXMgY2FsbGVkKVxuICAgICAgICAgSWYgZXJyIGlzIG5vdCB1bmRlZmluZWQgaXQgbWVhbnMgdGhhdCBvbmUgb3IgYW55IHVuZGVmaW5lZCB2YXJpYWJsZXMgYXJlIG5vdCByZWFkeSBhbmQgdGhlIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIGFnYWluIGxhdGVyXG4gICAgICAgICBBbGwgdGhlIG90aGVyIGFyZ3VtZW50cyBhcmUgdGhlIGNvcnJlc3BvbmRpbmcgYXJndW1lbnRzIG9mIHRoZSBjYWxsYmFjayB3aWxsIGJlIHRoZSBhY3R1YWwgdmFsdWVzIG9mIHRoZSBjb3JyZXNwb25kaW5nIGRlcGVuZGVuY3lcbiAgICAgICAgIFRoZSBjYWxsYmFjayBmdW5jdGlvbnMgc2hvdWxkIHJldHVybiB0aGUgY3VycmVudCB2YWx1ZSAob3IgbnVsbClcbiAgICAgKi9cbiAgICB0aGlzLmRlY2xhcmVEZXBlbmRlbmN5ID0gZnVuY3Rpb24obmFtZSwgZGVwZW5kZW5jeUFycmF5LCBjYWxsYmFjayl7XG4gICAgICAgIGlmKGNhbGxiYWNrc1tuYW1lXSl7XG4gICAgICAgICAgICBlcnJvckhhbmRsZXIuaWdub3JlUG9zc2libGVFcnJvcihcIkR1cGxpY2F0ZSBkZXBlbmRlbmN5OlwiICsgbmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFja3NbbmFtZV0gPSBjYWxsYmFjaztcbiAgICAgICAgICAgIGltbWVkaWF0ZVtuYW1lXSAgID0gZGVwZW5kZW5jeUFycmF5O1xuICAgICAgICAgICAgaW5zZXJ0RGVwZW5kZW5jeWluUlQobmFtZSwgZGVwZW5kZW5jeUFycmF5KTtcbiAgICAgICAgICAgIHRoaW5nc1tuYW1lXSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdW5zYXRpc2ZpZWRDb3VudGVyID0gcmVzZXRDb3VudGVyKG5hbWUpO1xuICAgICAgICBpZih1bnNhdGlzZmllZENvdW50ZXIgPT0gMCApe1xuICAgICAgICAgICAgY2FsbEZvclRoaW5nKG5hbWUsIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxGb3JUaGluZyhuYW1lLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLypcbiAgICAgICAgY3JlYXRlIGEgc2VydmljZVxuICAgICAqL1xuICAgIHRoaXMuc2VydmljZSA9IGZ1bmN0aW9uKG5hbWUsIGRlcGVuZGVuY3lBcnJheSwgY29uc3RydWN0b3Ipe1xuICAgICAgICB0aGlzLmRlY2xhcmVEZXBlbmRlbmN5KG5hbWUsIGRlcGVuZGVuY3lBcnJheSwgY29uc3RydWN0b3IpO1xuICAgIH1cblxuXG4gICAgdmFyIHN1YnN5c3RlbUNvdW50ZXIgPSAwO1xuICAgIC8qXG4gICAgIGNyZWF0ZSBhIGFub255bW91cyBzdWJzeXN0ZW1cbiAgICAgKi9cbiAgICB0aGlzLnN1YnN5c3RlbSA9IGZ1bmN0aW9uKGRlcGVuZGVuY3lBcnJheSwgY29uc3RydWN0b3Ipe1xuICAgICAgICBzdWJzeXN0ZW1Db3VudGVyKys7XG4gICAgICAgIHRoaXMuZGVjbGFyZURlcGVuZGVuY3koXCJkaWNvbnRhaW5lcl9zdWJzeXN0ZW1fcGxhY2Vob2xkZXJcIiArIHN1YnN5c3RlbUNvdW50ZXIsIGRlcGVuZGVuY3lBcnJheSwgY29uc3RydWN0b3IpO1xuICAgIH1cblxuICAgIC8qIG5vdCBkb2N1bWVudGVkLi4gbGltYm8gc3RhdGUqL1xuICAgIHRoaXMuZmFjdG9yeSA9IGZ1bmN0aW9uKG5hbWUsIGRlcGVuZGVuY3lBcnJheSwgY29uc3RydWN0b3Ipe1xuICAgICAgICB0aGlzLmRlY2xhcmVEZXBlbmRlbmN5KG5hbWUsIGRlcGVuZGVuY3lBcnJheSwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiBuZXcgY29uc3RydWN0b3IoKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxsRm9yVGhpbmcobmFtZSwgb3V0T2ZTZXJ2aWNlKXtcbiAgICAgICAgdmFyIGFyZ3MgPSBpbW1lZGlhdGVbbmFtZV0ubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgICAgcmV0dXJuIHRoaW5nc1tpdGVtXTtcbiAgICAgICAgfSk7XG4gICAgICAgIGFyZ3MudW5zaGlmdChvdXRPZlNlcnZpY2UpO1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBjYWxsYmFja3NbbmFtZV0uYXBwbHkoe30sYXJncyk7XG4gICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgIGVycm9ySGFuZGxlci50aHJvd0Vycm9yKGVycik7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmKG91dE9mU2VydmljZSB8fCB2YWx1ZT09PW51bGwpeyAgIC8vZW5hYmxlIHJldHVybmluZyBhIHRlbXBvcmFyeSBkZXBlbmRlbmN5IHJlc29sdXRpb24hXG4gICAgICAgICAgICBpZih0aGluZ3NbbmFtZV0pe1xuICAgICAgICAgICAgICAgIHRoaW5nc1tuYW1lXSA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmVzZXRVcENvdW50ZXJzKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIlN1Y2Nlc3MgcmVzb2x2aW5nIFwiLCBuYW1lLCBcIjpcIiwgdmFsdWUsIFwiT3RoZXIgcmVhZHk6XCIsIG90aGVyUmVhZHkpO1xuICAgICAgICAgICAgaWYoIXZhbHVlKXtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9ICB7XCJwbGFjZWhvbGRlclwiOiBuYW1lfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaW5nc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgdmFyIG90aGVyUmVhZHkgPSByZXNldFVwQ291bnRlcnMobmFtZSk7XG4gICAgICAgICAgICBvdGhlclJlYWR5LmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICAgICAgY2FsbEZvclRoaW5nKGl0ZW0sIGZhbHNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICAgICAgRGVjbGFyZSB0aGF0IGEgbmFtZSBpcyByZWFkeSwgcmVzb2x2ZWQgYW5kIHNob3VsZCB0cnkgdG8gcmVzb2x2ZSBhbGwgb3RoZXIgd2FpdGluZyBmb3IgaXRcbiAgICAgKi9cbiAgICB0aGlzLnJlc29sdmUgICAgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSl7XG4gICAgICAgIHRoaW5nc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICB2YXIgb3RoZXJSZWFkeSA9IHJlc2V0VXBDb3VudGVycyhuYW1lKTtcblxuICAgICAgICBvdGhlclJlYWR5LmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICBjYWxsRm9yVGhpbmcoaXRlbSwgZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG5cblxuICAgIHRoaXMuaW5zdGFuY2VGYWN0b3J5ID0gZnVuY3Rpb24obmFtZSwgZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcil7XG4gICAgICAgIGVycm9ySGFuZGxlci5ub3RJbXBsZW1lbnRlZChcImluc3RhbmNlRmFjdG9yeSBpcyBwbGFubmVkIGJ1dCBub3QgaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgLypcbiAgICAgICAgRGVjbGFyZSB0aGF0IGEgc2VydmljZSBvciBmZWF0dXJlIGlzIG5vdCB3b3JraW5nIHByb3Blcmx5LiBBbGwgc2VydmljZXMgZGVwZW5kaW5nIG9uIHRoaXMgd2lsbCBnZXQgbm90aWZpZWRcbiAgICAgKi9cbiAgICB0aGlzLm91dE9mU2VydmljZSAgICA9IGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgICB0aGluZ3NbbmFtZV0gPSBudWxsO1xuICAgICAgICB2YXIgdXBOb2RlcyA9IGRpc2NvdmVyVXBOb2RlcyhuYW1lKTtcbiAgICAgICAgdXBOb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5vZGUpe1xuICAgICAgICAgICAgdGhpbmdzW25hbWVdID0gbnVsbDtcbiAgICAgICAgICAgIGNhbGxGb3JUaGluZyhub2RlLCB0cnVlKTtcbiAgICAgICAgfSlcbiAgICB9XG59XG5cblxuZXhwb3J0cy5uZXdDb250YWluZXIgICAgPSBmdW5jdGlvbihjaGVja3NMaWJyYXJ5KXtcbiAgICByZXR1cm4gbmV3IENvbnRhaW5lcihjaGVja3NMaWJyYXJ5KTtcbn1cblxuLy9leHBvcnRzLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoJCQuZXJyb3JIYW5kbGVyKTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRcdFx0XHRcdGJlZXNIZWFsZXI6IHJlcXVpcmUoXCIuL2xpYi9iZWVzSGVhbGVyXCIpLFxuXHRcdFx0XHRcdHNvdW5kUHViU3ViOiByZXF1aXJlKFwiLi9saWIvc291bmRQdWJTdWJcIikuc291bmRQdWJTdWJcblx0XHRcdFx0XHQvL2ZvbGRlck1ROiByZXF1aXJlKFwiLi9saWIvZm9sZGVyTVFcIilcbn07Il19
