pskruntimeRequire=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"/home/sinica/work/privatesky/engine/pskbuildtemp/pskModules.js":[function(require,module,exports){
;$$.__runtimeModules["soundpubsub"] = require("soundpubsub");
$$.__runtimeModules["callflow"] = require("callflow");
$$.__runtimeModules["soundpubsub"] = require("soundpubsub");
$$.__runtimeModules["callflow"] = require("callflow");
$$.__runtimeModules["dicontainer"] = require("dicontainer");

},{"callflow":"callflow","dicontainer":"dicontainer","soundpubsub":"soundpubsub"}],"/home/sinica/work/privatesky/engine/pskbuildtemp/pskruntime.js":[function(require,module,exports){
if (typeof(global) == "undefined") {
    if (typeof(window) !== "undefined") {
        global = window;
    }
}

if (typeof(global.$$) == "undefined") {
    global.$$ = {};

    if (typeof(window) == "undefined") {
        window = global;
    }
    window.$$ = global.$$;
}


$$.__global = {

};

require("../../modules/callflow/lib/overwriteRequire")
require("./pskModules");

console.log("Loading runtime");




},{"../../modules/callflow/lib/overwriteRequire":"/home/sinica/work/privatesky/modules/callflow/lib/overwriteRequire.js","./pskModules":"/home/sinica/work/privatesky/engine/pskbuildtemp/pskModules.js"}],"/home/sinica/work/privatesky/modules/callflow/lib/choreographies/SwarmDebug.js":[function(require,module,exports){
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


},{"fs":false,"util":"util"}],"/home/sinica/work/privatesky/modules/callflow/lib/choreographies/swarmInstancesManager.js":[function(require,module,exports){


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



},{}],"/home/sinica/work/privatesky/modules/callflow/lib/choreographies/utilityFunctions/base.js":[function(require,module,exports){
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
},{"../../parallelJoinPoint":"/home/sinica/work/privatesky/modules/callflow/lib/parallelJoinPoint.js","../../serialJoinPoint":"/home/sinica/work/privatesky/modules/callflow/lib/serialJoinPoint.js","../SwarmDebug":"/home/sinica/work/privatesky/modules/callflow/lib/choreographies/SwarmDebug.js","soundpubsub":"soundpubsub"}],"/home/sinica/work/privatesky/modules/callflow/lib/choreographies/utilityFunctions/callflow.js":[function(require,module,exports){
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
},{"./base":"/home/sinica/work/privatesky/modules/callflow/lib/choreographies/utilityFunctions/base.js"}],"/home/sinica/work/privatesky/modules/callflow/lib/choreographies/utilityFunctions/swarm.js":[function(require,module,exports){
exports.createForObject = function(valueObject, thisObject, localId){
	return require("./base").createForObject(valueObject, thisObject, localId);
};
},{"./base":"/home/sinica/work/privatesky/modules/callflow/lib/choreographies/utilityFunctions/base.js"}],"/home/sinica/work/privatesky/modules/callflow/lib/loadLibrary.js":[function(require,module,exports){
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
},{}],"/home/sinica/work/privatesky/modules/callflow/lib/overwriteRequire.js":[function(require,module,exports){

/*
 require and requireLibrary are overwriting the node.js defaults in loading modules for increasing security and speed.
 We guarantee that each module or library is loaded only once and only from a single folder... Use the standard require if you need something else!

 */

if(typeof(global.$$) == "undefined") {
    global.$$ = {};
}

console.log("Booting...");
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
        try{
            result = arr[i](request);
            if(result != undefined){
                //console.log("returning result for ", request, !!result);
                $$.__runtimeModules[request] = result;
                break;
            }
        } catch(err){
            if(err.type != "PSKIgnorableError"){
                console.log("Failed in step", i, request, err);
            }
        }
    }

    if(!result){
        console.log("Failed to load module ", request, result);
    }

    enableRequire(request);
    return result;
}


if (typeof($$.require) == "undefined") {
    $$.__runtimeModules = {};

    if (!weAreInbrowser) {  //we are in node

        $$.__runtimeModules["crypto"] = require("crypto");
        $$.__runtimeModules["util"] = require("util");

        console.log("Redefining require for node");
        var Module = require('module');
        $$.__originalRequire = Module._load;

        function newLoader(request) {
            //preventRecursiveRequire(request);

            var self = this;
            function originalRequire(...args){
                return $$.__originalRequire.apply(self,args);
            }

            return tryRequireSequence([requireFromCache, pskruntimeRequire, originalRequire], request);
        }

        Module._load = newLoader;

    } else {
        console.log("Defining global require in browser");

        window.require = function(request){

            return tryRequireSequence([requireFromCache, browserRequire, pskruntimeRequire], request);
        }
    }

    $$.require = require;
}

},{"crypto":"crypto","module":false,"util":"util"}],"/home/sinica/work/privatesky/modules/callflow/lib/parallelJoinPoint.js":[function(require,module,exports){

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
},{}],"/home/sinica/work/privatesky/modules/callflow/lib/safe-uuid.js":[function(require,module,exports){

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
},{"crypto":"crypto"}],"/home/sinica/work/privatesky/modules/callflow/lib/serialJoinPoint.js":[function(require,module,exports){

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
},{}],"/home/sinica/work/privatesky/modules/callflow/lib/swarmDescription.js":[function(require,module,exports){
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
},{"./choreographies/utilityFunctions/callflow":"/home/sinica/work/privatesky/modules/callflow/lib/choreographies/utilityFunctions/callflow.js","soundpubsub":"soundpubsub"}],"/home/sinica/work/privatesky/modules/soundpubsub/lib/Queue.js":[function(require,module,exports){
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
},{}],"/home/sinica/work/privatesky/modules/soundpubsub/lib/beesHealer.js":[function(require,module,exports){

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
},{}],"/home/sinica/work/privatesky/modules/soundpubsub/lib/soundPubSub.js":[function(require,module,exports){
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
},{"./Queue":"/home/sinica/work/privatesky/modules/soundpubsub/lib/Queue.js"}],"callflow":[function(require,module,exports){

//var path = require("path");

function defaultErrorHandlingImplementation(err, res){
	//console.log(err.stack);
	if(err) throw err;
	return res;
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

require("./lib/overwriteRequire");

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
},{"./lib/choreographies/swarmInstancesManager":"/home/sinica/work/privatesky/modules/callflow/lib/choreographies/swarmInstancesManager.js","./lib/choreographies/utilityFunctions/swarm":"/home/sinica/work/privatesky/modules/callflow/lib/choreographies/utilityFunctions/swarm.js","./lib/loadLibrary":"/home/sinica/work/privatesky/modules/callflow/lib/loadLibrary.js","./lib/overwriteRequire":"/home/sinica/work/privatesky/modules/callflow/lib/overwriteRequire.js","./lib/parallelJoinPoint":"/home/sinica/work/privatesky/modules/callflow/lib/parallelJoinPoint.js","./lib/safe-uuid":"/home/sinica/work/privatesky/modules/callflow/lib/safe-uuid.js","./lib/serialJoinPoint":"/home/sinica/work/privatesky/modules/callflow/lib/serialJoinPoint.js","./lib/swarmDescription":"/home/sinica/work/privatesky/modules/callflow/lib/swarmDescription.js","soundpubsub":"soundpubsub"}],"dicontainer":[function(require,module,exports){
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
},{"./lib/beesHealer":"/home/sinica/work/privatesky/modules/soundpubsub/lib/beesHealer.js","./lib/soundPubSub":"/home/sinica/work/privatesky/modules/soundpubsub/lib/soundPubSub.js"}]},{},["/home/sinica/work/privatesky/engine/pskbuildtemp/pskruntime.js"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJlbmdpbmUvcHNrYnVpbGR0ZW1wL3Bza01vZHVsZXMuanMiLCJlbmdpbmUvcHNrYnVpbGR0ZW1wL3Bza3J1bnRpbWUuanMiLCJtb2R1bGVzL2NhbGxmbG93L2xpYi9jaG9yZW9ncmFwaGllcy9Td2FybURlYnVnLmpzIiwibW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvc3dhcm1JbnN0YW5jZXNNYW5hZ2VyLmpzIiwibW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvdXRpbGl0eUZ1bmN0aW9ucy9iYXNlLmpzIiwibW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvdXRpbGl0eUZ1bmN0aW9ucy9jYWxsZmxvdy5qcyIsIm1vZHVsZXMvY2FsbGZsb3cvbGliL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvc3dhcm0uanMiLCJtb2R1bGVzL2NhbGxmbG93L2xpYi9sb2FkTGlicmFyeS5qcyIsIm1vZHVsZXMvY2FsbGZsb3cvbGliL292ZXJ3cml0ZVJlcXVpcmUuanMiLCJtb2R1bGVzL2NhbGxmbG93L2xpYi9wYXJhbGxlbEpvaW5Qb2ludC5qcyIsIm1vZHVsZXMvY2FsbGZsb3cvbGliL3NhZmUtdXVpZC5qcyIsIm1vZHVsZXMvY2FsbGZsb3cvbGliL3NlcmlhbEpvaW5Qb2ludC5qcyIsIm1vZHVsZXMvY2FsbGZsb3cvbGliL3N3YXJtRGVzY3JpcHRpb24uanMiLCJtb2R1bGVzL3NvdW5kcHVic3ViL2xpYi9RdWV1ZS5qcyIsIm1vZHVsZXMvc291bmRwdWJzdWIvbGliL2JlZXNIZWFsZXIuanMiLCJtb2R1bGVzL3NvdW5kcHVic3ViL2xpYi9zb3VuZFB1YlN1Yi5qcyIsIm1vZHVsZXMvY2FsbGZsb3cvaW5kZXguanMiLCJtb2R1bGVzL2RpY29udGFpbmVyL2xpYi9jb250YWluZXIuanMiLCJtb2R1bGVzL3NvdW5kcHVic3ViL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCI7JCQuX19ydW50aW1lTW9kdWxlc1tcInNvdW5kcHVic3ViXCJdID0gcmVxdWlyZShcInNvdW5kcHVic3ViXCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcImNhbGxmbG93XCJdID0gcmVxdWlyZShcImNhbGxmbG93XCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcInNvdW5kcHVic3ViXCJdID0gcmVxdWlyZShcInNvdW5kcHVic3ViXCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcImNhbGxmbG93XCJdID0gcmVxdWlyZShcImNhbGxmbG93XCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcImRpY29udGFpbmVyXCJdID0gcmVxdWlyZShcImRpY29udGFpbmVyXCIpO1xuIiwiaWYgKHR5cGVvZihnbG9iYWwpID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBpZiAodHlwZW9mKHdpbmRvdykgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgZ2xvYmFsID0gd2luZG93O1xuICAgIH1cbn1cblxuaWYgKHR5cGVvZihnbG9iYWwuJCQpID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBnbG9iYWwuJCQgPSB7fTtcblxuICAgIGlmICh0eXBlb2Yod2luZG93KSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHdpbmRvdyA9IGdsb2JhbDtcbiAgICB9XG4gICAgd2luZG93LiQkID0gZ2xvYmFsLiQkO1xufVxuXG5cbiQkLl9fZ2xvYmFsID0ge1xuXG59O1xuXG5yZXF1aXJlKFwiLi4vLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvb3ZlcndyaXRlUmVxdWlyZVwiKVxucmVxdWlyZShcIi4vcHNrTW9kdWxlc1wiKTtcblxuY29uc29sZS5sb2coXCJMb2FkaW5nIHJ1bnRpbWVcIik7XG5cblxuXG4iLCIvKlxuSW5pdGlhbCBMaWNlbnNlOiAoYykgQXhpb2xvZ2ljIFJlc2VhcmNoICYgQWxib2FpZSBTw65uaWPEgy5cbkNvbnRyaWJ1dG9yczogQXhpb2xvZ2ljIFJlc2VhcmNoICwgUHJpdmF0ZVNreSBwcm9qZWN0XG5Db2RlIExpY2Vuc2U6IExHUEwgb3IgTUlULlxuKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcblxuZ2xvYmFsLmNwcmludCA9IGNvbnNvbGUubG9nO1xuZ2xvYmFsLndwcmludCA9IGNvbnNvbGUud2Fybjtcbmdsb2JhbC5kcHJpbnQgPSBjb25zb2xlLmRlYnVnO1xuZ2xvYmFsLmVwcmludCA9IGNvbnNvbGUuZXJyb3I7XG5cblxuLyoqXG4gKiBTaG9ydGN1dCB0byBKU09OLnN0cmluZ2lmeVxuICogQHBhcmFtIG9ialxuICovXG5nbG9iYWwuSiA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqKTtcbn1cblxuXG4vKipcbiAqIFByaW50IHN3YXJtIGNvbnRleHRzIChNZXNzYWdlcykgYW5kIGVhc2llciB0byByZWFkIGNvbXBhcmVkIHdpdGggSlxuICogQHBhcmFtIG9ialxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5leHBvcnRzLmNsZWFuRHVtcCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgbyA9IG9iai52YWx1ZU9mKCk7XG4gICAgdmFyIG1ldGEgPSB7XG4gICAgICAgIHN3YXJtVHlwZU5hbWU6by5tZXRhLnN3YXJtVHlwZU5hbWVcbiAgICB9O1xuICAgIHJldHVybiBcIlxcdCBzd2FybUlkOiBcIiArIG8ubWV0YS5zd2FybUlkICsgXCJ7XFxuXFx0XFx0bWV0YTogXCIgICAgKyBKKG1ldGEpICtcbiAgICAgICAgXCJcXG5cXHRcXHRwdWJsaWM6IFwiICAgICAgICArIEooby5wdWJsaWNWYXJzKSArXG4gICAgICAgIFwiXFxuXFx0XFx0cHJvdGVjdGVkOiBcIiAgICAgKyBKKG8ucHJvdGVjdGVkVmFycykgK1xuICAgICAgICBcIlxcblxcdFxcdHByaXZhdGU6IFwiICAgICAgICsgSihvLnByaXZhdGVWYXJzKSArIFwiXFxuXFx0fVxcblwiO1xufVxuXG4vL00gPSBleHBvcnRzLmNsZWFuRHVtcDtcbi8qKlxuICogRXhwZXJpbWVudGFsIGZ1bmN0aW9uc1xuICovXG5cblxuLypcblxubG9nZ2VyICAgICAgPSBtb25pdG9yLmxvZ2dlcjtcbmFzc2VydCAgICAgID0gbW9uaXRvci5hc3NlcnQ7XG50aHJvd2luZyAgICA9IG1vbml0b3IuZXhjZXB0aW9ucztcblxuXG52YXIgdGVtcG9yYXJ5TG9nQnVmZmVyID0gW107XG5cbnZhciBjdXJyZW50U3dhcm1Db21JbXBsID0gbnVsbDtcblxubG9nZ2VyLnJlY29yZCA9IGZ1bmN0aW9uKHJlY29yZCl7XG4gICAgaWYoY3VycmVudFN3YXJtQ29tSW1wbD09PW51bGwpe1xuICAgICAgICB0ZW1wb3JhcnlMb2dCdWZmZXIucHVzaChyZWNvcmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnRTd2FybUNvbUltcGwucmVjb3JkTG9nKHJlY29yZCk7XG4gICAgfVxufVxuXG52YXIgY29udGFpbmVyID0gcmVxdWlyZShcImRpY29udGFpbmVyXCIpLmNvbnRhaW5lcjtcblxuY29udGFpbmVyLnNlcnZpY2UoXCJzd2FybUxvZ2dpbmdNb25pdG9yXCIsIFtcInN3YXJtaW5nSXNXb3JraW5nXCIsIFwic3dhcm1Db21JbXBsXCJdLCBmdW5jdGlvbihvdXRPZlNlcnZpY2Usc3dhcm1pbmcsIHN3YXJtQ29tSW1wbCl7XG5cbiAgICBpZihvdXRPZlNlcnZpY2Upe1xuICAgICAgICBpZighdGVtcG9yYXJ5TG9nQnVmZmVyKXtcbiAgICAgICAgICAgIHRlbXBvcmFyeUxvZ0J1ZmZlciA9IFtdO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHRtcCA9IHRlbXBvcmFyeUxvZ0J1ZmZlcjtcbiAgICAgICAgdGVtcG9yYXJ5TG9nQnVmZmVyID0gW107XG4gICAgICAgIGN1cnJlbnRTd2FybUNvbUltcGwgPSBzd2FybUNvbUltcGw7XG4gICAgICAgIGxvZ2dlci5yZWNvcmQgPSBmdW5jdGlvbihyZWNvcmQpe1xuICAgICAgICAgICAgY3VycmVudFN3YXJtQ29tSW1wbC5yZWNvcmRMb2cocmVjb3JkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRtcC5mb3JFYWNoKGZ1bmN0aW9uKHJlY29yZCl7XG4gICAgICAgICAgICBsb2dnZXIucmVjb3JkKHJlY29yZCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pXG5cbiovXG5nbG9iYWwudW5jYXVnaHRFeGNlcHRpb25TdHJpbmcgPSBcIlwiO1xuZ2xvYmFsLnVuY2F1Z2h0RXhjZXB0aW9uRXhpc3RzID0gZmFsc2U7XG5pZih0eXBlb2YgZ2xvYmFsLmdsb2JhbFZlcmJvc2l0eSA9PSAndW5kZWZpbmVkJyl7XG4gICAgZ2xvYmFsLmdsb2JhbFZlcmJvc2l0eSA9IGZhbHNlO1xufVxuXG52YXIgREVCVUdfU1RBUlRfVElNRSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG5mdW5jdGlvbiBnZXREZWJ1Z0RlbHRhKCl7XG4gICAgdmFyIGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgcmV0dXJuIGN1cnJlbnRUaW1lIC0gREVCVUdfU1RBUlRfVElNRTtcbn1cblxuLyoqXG4gKiBEZWJ1ZyBmdW5jdGlvbnMsIGluZmx1ZW5jZWQgYnkgZ2xvYmFsVmVyYm9zaXR5IGdsb2JhbCB2YXJpYWJsZVxuICogQHBhcmFtIHR4dFxuICovXG5kcHJpbnQgPSBmdW5jdGlvbiAodHh0KSB7XG4gICAgaWYgKGdsb2JhbFZlcmJvc2l0eSA9PSB0cnVlKSB7XG4gICAgICAgIGlmICh0aGlzQWRhcHRlci5pbml0aWxpc2VkICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJERUJVRzogW1wiICsgdGhpc0FkYXB0ZXIubm9kZU5hbWUgKyBcIl0oXCIgKyBnZXREZWJ1Z0RlbHRhKCkrIFwiKTpcIit0eHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJERUJVRzogKFwiICsgZ2V0RGVidWdEZWx0YSgpKyBcIik6XCIrdHh0KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiREVCVUc6IFwiICsgdHh0KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBvYnNvbGV0ZSE/XG4gKiBAcGFyYW0gdHh0XG4gKi9cbmdsb2JhbC5hcHJpbnQgPSBmdW5jdGlvbiAodHh0KSB7XG4gICAgY29uc29sZS5sb2coXCJERUJVRzogW1wiICsgdGhpc0FkYXB0ZXIubm9kZU5hbWUgKyBcIl06IFwiICsgdHh0KTtcbn1cblxuXG5cbi8qKlxuICogVXRpbGl0eSBmdW5jdGlvbiB1c3VhbGx5IHVzZWQgaW4gdGVzdHMsIGV4aXQgY3VycmVudCBwcm9jZXNzIGFmdGVyIGEgd2hpbGVcbiAqIEBwYXJhbSBtc2dcbiAqIEBwYXJhbSB0aW1lb3V0XG4gKi9cbmdsb2JhbC5kZWxheUV4aXQgPSBmdW5jdGlvbiAobXNnLCByZXRDb2RlLHRpbWVvdXQpIHtcbiAgICBpZihyZXRDb2RlID09IHVuZGVmaW5lZCl7XG4gICAgICAgIHJldENvZGUgPSBFeGl0Q29kZXMuVW5rbm93bkVycm9yO1xuICAgIH1cblxuICAgIGlmKHRpbWVvdXQgPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgdGltZW91dCA9IDEwMDtcbiAgICB9XG5cbiAgICBpZihtc2cgPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgbXNnID0gXCJEZWxheWluZyBleGl0IHdpdGggXCIrIHRpbWVvdXQgKyBcIm1zXCI7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2cobXNnKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcHJvY2Vzcy5leGl0KHJldENvZGUpO1xuICAgIH0sIHRpbWVvdXQpO1xufVxuXG5cbmZ1bmN0aW9uIGxvY2FsTG9nIChsb2dUeXBlLCBtZXNzYWdlLCBlcnIpIHtcbiAgICB2YXIgdGltZSA9IG5ldyBEYXRlKCk7XG4gICAgdmFyIG5vdyA9IHRpbWUuZ2V0RGF0ZSgpICsgXCItXCIgKyAodGltZS5nZXRNb250aCgpICsgMSkgKyBcIixcIiArIHRpbWUuZ2V0SG91cnMoKSArIFwiOlwiICsgdGltZS5nZXRNaW51dGVzKCk7XG4gICAgdmFyIG1zZztcblxuICAgIG1zZyA9ICdbJyArIG5vdyArICddWycgKyB0aGlzQWRhcHRlci5ub2RlTmFtZSArICddICcgKyBtZXNzYWdlO1xuXG4gICAgaWYgKGVyciAhPSBudWxsICYmIGVyciAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbXNnICs9ICdcXG4gICAgIEVycjogJyArIGVyci50b1N0cmluZygpO1xuICAgICAgICBpZiAoZXJyLnN0YWNrICYmIGVyci5zdGFjayAhPSB1bmRlZmluZWQpXG4gICAgICAgICAgICBtc2cgKz0gJ1xcbiAgICAgU3RhY2s6ICcgKyBlcnIuc3RhY2sgKyAnXFxuJztcbiAgICB9XG5cbiAgICBjcHJpbnQobXNnKTtcbiAgICBpZih0aGlzQWRhcHRlci5pbml0aWxpc2VkKXtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgdmFyIGZzID0gcmVxdWlyZShcImZzXCIpO1xuICAgICAgICAgICAgZnMuYXBwZW5kRmlsZVN5bmMoZ2V0U3dhcm1GaWxlUGF0aCh0aGlzQWRhcHRlci5jb25maWcubG9nc1BhdGggKyBcIi9cIiArIGxvZ1R5cGUpLCBtc2cpO1xuICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZhaWxpbmcgdG8gd3JpdGUgbG9ncyBpbiBcIiwgdGhpc0FkYXB0ZXIuY29uZmlnLmxvZ3NQYXRoICk7XG4gICAgICAgIH1cblxuICAgIH1cbn1cblxuXG5nbG9iYWwucHJpbnRmID0gZnVuY3Rpb24gKC4uLnBhcmFtcykge1xuICAgIHZhciBhcmdzID0gW107IC8vIGVtcHR5IGFycmF5XG4gICAgLy8gY29weSBhbGwgb3RoZXIgYXJndW1lbnRzIHdlIHdhbnQgdG8gXCJwYXNzIHRocm91Z2hcIlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFyZ3MucHVzaChwYXJhbXNbaV0pO1xuICAgIH1cbiAgICB2YXIgb3V0ID0gdXRpbC5mb3JtYXQuYXBwbHkodGhpcywgYXJncyk7XG4gICAgY29uc29sZS5sb2cob3V0KTtcbn1cblxuZ2xvYmFsLnNwcmludGYgPSBmdW5jdGlvbiAoLi4ucGFyYW1zKSB7XG4gICAgdmFyIGFyZ3MgPSBbXTsgLy8gZW1wdHkgYXJyYXlcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcmdzLnB1c2gocGFyYW1zW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHV0aWwuZm9ybWF0LmFwcGx5KHRoaXMsIGFyZ3MpO1xufVxuXG4iLCJcblxuZnVuY3Rpb24gU3dhcm1zSW5zdGFuY2VzTWFuYWdlcigpe1xuICAgIHZhciBzd2FybUFsaXZlSW5zdGFuY2VzID0ge1xuXG4gICAgfVxuXG4gICAgdGhpcy53YWl0Rm9yU3dhcm0gPSBmdW5jdGlvbihjYWxsYmFjaywgc3dhcm0sIGtlZXBBbGl2ZUNoZWNrKXtcblxuICAgICAgICBmdW5jdGlvbiBkb0xvZ2ljKCl7XG4gICAgICAgICAgICB2YXIgc3dhcm1JZCA9IHN3YXJtLmdldElubmVyVmFsdWUoKS5tZXRhLnN3YXJtSWQ7XG4gICAgICAgICAgICB2YXIgd2F0Y2hlciA9IHN3YXJtQWxpdmVJbnN0YW5jZXNbc3dhcm1JZF07XG4gICAgICAgICAgICBpZighd2F0Y2hlcil7XG4gICAgICAgICAgICAgICAgd2F0Y2hlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3dhcm06c3dhcm0sXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOmNhbGxiYWNrLFxuICAgICAgICAgICAgICAgICAgICBrZWVwQWxpdmVDaGVjazprZWVwQWxpdmVDaGVja1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzd2FybUFsaXZlSW5zdGFuY2VzW3N3YXJtSWRdID0gd2F0Y2hlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGZpbHRlcigpe1xuICAgICAgICAgICAgcmV0dXJuIHN3YXJtLmdldElubmVyVmFsdWUoKS5tZXRhLnN3YXJtSWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyQkLnVpZEdlbmVyYXRvci53YWl0X2Zvcl9jb25kaXRpb24oY29uZGl0aW9uLGRvTG9naWMpO1xuICAgICAgICBzd2FybS5vYnNlcnZlKGRvTG9naWMsIG51bGwsIGZpbHRlcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xlYW5Td2FybVdhaXRlcihzd2FybVNlcmlhbGlzYXRpb24peyAvLyBUT0RPOiBhZGQgYmV0dGVyIG1lY2hhbmlzbXMgdG8gcHJldmVudCBtZW1vcnkgbGVha3NcbiAgICAgICAgdmFyIHN3YXJtSWQgPSBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5zd2FybUlkO1xuICAgICAgICB2YXIgd2F0Y2hlciA9IHN3YXJtQWxpdmVJbnN0YW5jZXNbc3dhcm1JZF07XG5cbiAgICAgICAgaWYoIXdhdGNoZXIpe1xuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLndhcm5pbmcoXCJJbnZhbGlkIHN3YXJtIHJlY2VpdmVkOiBcIiArIHN3YXJtSWQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFyZ3MgPSBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5hcmdzO1xuICAgICAgICBhcmdzLnB1c2goc3dhcm1TZXJpYWxpc2F0aW9uKTtcblxuICAgICAgICB3YXRjaGVyLmNhbGxiYWNrLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICBpZighd2F0Y2hlci5rZWVwQWxpdmVDaGVjaygpKXtcbiAgICAgICAgICAgIGRlbGV0ZSBzd2FybUFsaXZlSW5zdGFuY2VzW3N3YXJtSWRdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yZXZpdmVfc3dhcm0gPSBmdW5jdGlvbihzd2FybVNlcmlhbGlzYXRpb24pe1xuXG5cbiAgICAgICAgdmFyIHN3YXJtSWQgICAgID0gc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuc3dhcm1JZDtcbiAgICAgICAgdmFyIHN3YXJtVHlwZSAgID0gc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuc3dhcm1UeXBlTmFtZTtcbiAgICAgICAgdmFyIGluc3RhbmNlICAgID0gc3dhcm1BbGl2ZUluc3RhbmNlc1tzd2FybUlkXTtcblxuICAgICAgICB2YXIgc3dhcm07XG5cbiAgICAgICAgaWYoaW5zdGFuY2Upe1xuICAgICAgICAgICAgc3dhcm0gPSBpbnN0YW5jZS5zd2FybTtcblxuICAgICAgICB9ICAgZWxzZSB7XG4gICAgICAgICAgICBzd2FybSA9ICQkLnN3YXJtLmNyZWF0ZShzd2FybVR5cGUsIHVuZGVmaW5lZCwgc3dhcm1TZXJpYWxpc2F0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmNvbW1hbmQgPT0gXCJhc3luY1JldHVyblwiKXtcbiAgICAgICAgICAgIGNsZWFuU3dhcm1XYWl0ZXIoc3dhcm1TZXJpYWxpc2F0aW9uKTtcbiAgICAgICAgfSBlbHNlICAgICBpZihzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5jb21tYW5kID09IFwiZXhlY3V0ZVN3YXJtUGhhc2VcIil7XG4gICAgICAgICAgICBzd2FybS5ydW5QaGFzZShzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5waGFzZU5hbWUsIHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmFyZ3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbmtub3duIGNvbW1hbmRcIixzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5jb21tYW5kLCBcImluIHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmNvbW1hbmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3dhcm07XG4gICAgfVxufVxuXG5cbiQkLnN3YXJtc0luc3RhbmNlc01hbmFnZXIgPSBuZXcgU3dhcm1zSW5zdGFuY2VzTWFuYWdlcigpO1xuXG5cbiIsInZhciBiZWVzSGVhbGVyID0gcmVxdWlyZShcInNvdW5kcHVic3ViXCIpLmJlZXNIZWFsZXI7XG52YXIgc3dhcm1EZWJ1ZyA9IHJlcXVpcmUoXCIuLi9Td2FybURlYnVnXCIpO1xuXG5leHBvcnRzLmNyZWF0ZUZvck9iamVjdCA9IGZ1bmN0aW9uKHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0LCBsb2NhbElkKXtcblx0dmFyIHJldCA9IHt9O1xuXG5cdGZ1bmN0aW9uIGZpbHRlckZvclNlcmlhbGlzYWJsZSAodmFsdWVPYmplY3Qpe1xuXHRcdHJldHVybiB2YWx1ZU9iamVjdC5tZXRhLnN3YXJtSWQ7XG5cdH1cblxuXHR2YXIgc3dhcm1GdW5jdGlvbiA9IGZ1bmN0aW9uKGNvbnRleHQsIHBoYXNlTmFtZSl7XG5cdFx0dmFyIGFyZ3MgPVtdO1xuXHRcdGZvcih2YXIgaSA9IDI7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspe1xuXHRcdFx0YXJncy5wdXNoKGFyZ3VtZW50c1tpXSk7XG5cdFx0fVxuXG5cdFx0Ly9tYWtlIHRoZSBleGVjdXRpb24gYXQgbGV2ZWwgMCAgKGFmdGVyIGFsbCBwZW5kaW5nIGV2ZW50cykgYW5kIHdhaXQgdG8gaGF2ZSBhIHN3YXJtSWRcblx0XHRyZXQub2JzZXJ2ZShmdW5jdGlvbigpe1xuXHRcdFx0YmVlc0hlYWxlci5hc0pTT04odmFsdWVPYmplY3QsIHBoYXNlTmFtZSwgYXJncywgZnVuY3Rpb24oZXJyLGpzTXNnKXtcblx0XHRcdFx0anNNc2cubWV0YS50YXJnZXQgPSBjb250ZXh0O1xuXHRcdFx0XHQkJC5QU0tfUHViU3ViLnB1Ymxpc2goJCQuQ09OU1RBTlRTLlNXQVJNX0ZPUl9FWEVDVVRJT04sIGpzTXNnKTtcblx0XHRcdH0pO1xuXHRcdH0sbnVsbCxmaWx0ZXJGb3JTZXJpYWxpc2FibGUpO1xuXG5cdFx0cmV0Lm5vdGlmeSgpO1xuXG5cblx0XHRyZXR1cm4gdGhpc09iamVjdDtcblx0fTtcblxuXHR2YXIgYXN5bmNSZXR1cm4gPSBmdW5jdGlvbihlcnIsIHJlc3VsdCl7XG5cdFx0dmFyIGNvbnRleHQgPSB2YWx1ZU9iamVjdC5wcm90ZWN0ZWRWYXJzLmNvbnRleHQ7XG5cblx0XHRpZighY29udGV4dCAmJiB2YWx1ZU9iamVjdC5tZXRhLndhaXRTdGFjayl7XG5cdFx0XHRjb250ZXh0ID0gdmFsdWVPYmplY3QubWV0YS53YWl0U3RhY2sucG9wKCk7XG5cdFx0XHR2YWx1ZU9iamVjdC5wcm90ZWN0ZWRWYXJzLmNvbnRleHQgPSBjb250ZXh0O1xuXHRcdH1cblxuXHRcdGJlZXNIZWFsZXIuYXNKU09OKHZhbHVlT2JqZWN0LCBcIl9fcmV0dXJuX19cIiwgW2VyciwgcmVzdWx0XSwgZnVuY3Rpb24oZXJyLGpzTXNnKXtcblx0XHRcdGpzTXNnLm1ldGEuY29tbWFuZCA9IFwiYXN5bmNSZXR1cm5cIjtcblx0XHRcdGlmKCFjb250ZXh0KXtcblx0XHRcdFx0Y29udGV4dCA9IHZhbHVlT2JqZWN0Lm1ldGEuaG9tZVNlY3VyaXR5Q29udGV4dDsvL1RPRE86IENIRUNLIFRISVNcblxuXHRcdFx0fVxuXHRcdFx0anNNc2cubWV0YS50YXJnZXQgPSBjb250ZXh0O1xuXG5cdFx0XHRpZighY29udGV4dCl7XG5cdFx0XHRcdCQkLmVycm9ySGFuZGxlci5lcnJvcihuZXcgRXJyb3IoXCJBc3luY2hyb25vdXMgcmV0dXJuIGluc2lkZSBvZiBhIHN3YXJtIHRoYXQgZG9lcyBub3Qgd2FpdCBmb3IgcmVzdWx0c1wiKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkJC5QU0tfUHViU3ViLnB1Ymxpc2goJCQuQ09OU1RBTlRTLlNXQVJNX0ZPUl9FWEVDVVRJT04sIGpzTXNnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fTtcblxuXHRmdW5jdGlvbiBob21lKGVyciwgcmVzdWx0KXtcblx0XHRiZWVzSGVhbGVyLmFzSlNPTih2YWx1ZU9iamVjdCwgXCJob21lXCIsIFtlcnIsIHJlc3VsdF0sIGZ1bmN0aW9uKGVycixqc01zZyl7XG5cdFx0XHR2YXIgY29udGV4dCA9IHZhbHVlT2JqZWN0Lm1ldGEuaG9tZUNvbnRleHQ7XG5cdFx0XHRqc01zZy5tZXRhLnRhcmdldCA9IGNvbnRleHQ7XG5cdFx0XHQkJC5QU0tfUHViU3ViLnB1Ymxpc2goJCQuQ09OU1RBTlRTLlNXQVJNX0ZPUl9FWEVDVVRJT04sIGpzTXNnKTtcblx0XHR9KTtcblx0fVxuXG5cblxuXHRmdW5jdGlvbiB3YWl0UmVzdWx0cyhjYWxsYmFjaywga2VlcEFsaXZlQ2hlY2ssIHN3YXJtKXtcblx0XHRpZighc3dhcm0pe1xuXHRcdFx0c3dhcm0gPSB0aGlzO1xuXHRcdH1cblx0XHRpZigha2VlcEFsaXZlQ2hlY2spe1xuXHRcdFx0a2VlcEFsaXZlQ2hlY2sgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHZhciBpbm5lciA9IHN3YXJtLmdldElubmVyVmFsdWUoKTtcblx0XHRpZighaW5uZXIubWV0YS53YWl0U3RhY2spe1xuXHRcdFx0aW5uZXIubWV0YS53YWl0U3RhY2sgPSBbXTtcblx0XHRcdGlubmVyLm1ldGEud2FpdFN0YWNrLnB1c2goJCQuc2VjdXJpdHlDb250ZXh0KVxuXHRcdH1cblx0XHQkJC5zd2FybXNJbnN0YW5jZXNNYW5hZ2VyLndhaXRGb3JTd2FybShjYWxsYmFjaywgc3dhcm0sIGtlZXBBbGl2ZUNoZWNrKTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gZ2V0SW5uZXJWYWx1ZSgpe1xuXHRcdHJldHVybiB2YWx1ZU9iamVjdDtcblx0fVxuXG5cdGZ1bmN0aW9uIHJ1blBoYXNlKGZ1bmN0TmFtZSwgYXJncyl7XG5cdFx0dmFyIGZ1bmMgPSB2YWx1ZU9iamVjdC5teUZ1bmN0aW9uc1tmdW5jdE5hbWVdO1xuXHRcdGlmKGZ1bmMpe1xuXHRcdFx0ZnVuYy5hcHBseSh0aGlzT2JqZWN0LCBhcmdzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKGZ1bmN0TmFtZSwgdmFsdWVPYmplY3QsIFwiRnVuY3Rpb24gXCIgKyBmdW5jdE5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdCFcIik7XG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiB1cGRhdGUoc2VyaWFsaXNhdGlvbil7XG5cdFx0YmVlc0hlYWxlci5qc29uVG9OYXRpdmUoc2VyaWFsaXNhdGlvbix2YWx1ZU9iamVjdCk7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIHZhbHVlT2YoKXtcblx0XHR2YXIgcmV0ID0ge307XG5cdFx0cmV0Lm1ldGEgICAgICAgICAgICAgICAgPSB2YWx1ZU9iamVjdC5tZXRhO1xuXHRcdHJldC5wdWJsaWNWYXJzICAgICAgICAgID0gdmFsdWVPYmplY3QucHVibGljVmFycztcblx0XHRyZXQucHJpdmF0ZVZhcnMgICAgICAgICA9IHZhbHVlT2JqZWN0LnByaXZhdGVWYXJzO1xuXHRcdHJldC5wcm90ZWN0ZWRWYXJzICAgICAgID0gdmFsdWVPYmplY3QucHJvdGVjdGVkVmFycztcblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0ZnVuY3Rpb24gdG9TdHJpbmcgKCl7XG5cdFx0cmV0dXJuIHN3YXJtRGVidWcuY2xlYW5EdW1wKHRoaXNPYmplY3QudmFsdWVPZigpKTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gY3JlYXRlUGFyYWxsZWwoY2FsbGJhY2spe1xuXHRcdHJldHVybiByZXF1aXJlKFwiLi4vLi4vcGFyYWxsZWxKb2luUG9pbnRcIikuY3JlYXRlSm9pblBvaW50KHRoaXNPYmplY3QsIGNhbGxiYWNrLCAkJC5fX2ludGVybi5ta0FyZ3MoYXJndW1lbnRzLDEpKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZVNlcmlhbChjYWxsYmFjayl7XG5cdFx0cmV0dXJuIHJlcXVpcmUoXCIuLi8uLi9zZXJpYWxKb2luUG9pbnRcIikuY3JlYXRlU2VyaWFsSm9pblBvaW50KHRoaXNPYmplY3QsIGNhbGxiYWNrLCAkJC5fX2ludGVybi5ta0FyZ3MoYXJndW1lbnRzLDEpKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGluc3BlY3QoKXtcblx0XHRyZXR1cm4gc3dhcm1EZWJ1Zy5jbGVhbkR1bXAodGhpc09iamVjdC52YWx1ZU9mKCkpO1xuXHR9XG5cblx0ZnVuY3Rpb24gY29uc3RydWN0b3IoKXtcblx0XHRyZXR1cm4gU3dhcm1EZXNjcmlwdGlvbjtcblx0fVxuXG5cdGZ1bmN0aW9uIGVuc3VyZUxvY2FsSWQoKXtcblx0XHRpZighdmFsdWVPYmplY3QubG9jYWxJZCl7XG5cdFx0XHR2YWx1ZU9iamVjdC5sb2NhbElkID0gdmFsdWVPYmplY3QubWV0YS5zd2FybVR5cGVOYW1lICsgXCItXCIgKyBsb2NhbElkO1xuXHRcdFx0bG9jYWxJZCsrO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIG9ic2VydmUoY2FsbGJhY2ssIHdhaXRGb3JNb3JlLCBmaWx0ZXIpe1xuXHRcdGlmKCF3YWl0Rm9yTW9yZSl7XG5cdFx0XHR3YWl0Rm9yTW9yZSA9IGZ1bmN0aW9uICgpe1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZW5zdXJlTG9jYWxJZCgpO1xuXG5cdFx0JCQuUFNLX1B1YlN1Yi5zdWJzY3JpYmUodmFsdWVPYmplY3QubG9jYWxJZCwgY2FsbGJhY2ssIHdhaXRGb3JNb3JlLCBmaWx0ZXIpO1xuXHR9XG5cblx0ZnVuY3Rpb24gdG9KU09OKHByb3Ape1xuXHRcdC8vcHJldmVudGluZyBtYXggY2FsbCBzdGFjayBzaXplIGV4Y2VlZGluZyBvbiBwcm94eSBhdXRvIHJlZmVyZW5jaW5nXG5cdFx0Ly9yZXBsYWNlIHt9IGFzIHJlc3VsdCBvZiBKU09OKFByb3h5KSB3aXRoIHRoZSBzdHJpbmcgW09iamVjdCBwcm90ZWN0ZWQgb2JqZWN0XVxuXHRcdHJldHVybiBcIltPYmplY3QgcHJvdGVjdGVkIG9iamVjdF1cIjtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldEpTT05hc3luYyhjYWxsYmFjayl7XG5cdFx0Ly9tYWtlIHRoZSBleGVjdXRpb24gYXQgbGV2ZWwgMCAgKGFmdGVyIGFsbCBwZW5kaW5nIGV2ZW50cykgYW5kIHdhaXQgdG8gaGF2ZSBhIHN3YXJtSWRcblx0XHRyZXQub2JzZXJ2ZShmdW5jdGlvbigpe1xuXHRcdFx0YmVlc0hlYWxlci5hc0pTT04odmFsdWVPYmplY3QsIG51bGwsIG51bGwsY2FsbGJhY2spO1xuXHRcdH0sbnVsbCxmaWx0ZXJGb3JTZXJpYWxpc2FibGUpO1xuXHRcdHJldC5ub3RpZnkoKTtcblx0fVxuXG5cdGZ1bmN0aW9uIG5vdGlmeShldmVudCl7XG5cdFx0aWYoIWV2ZW50KXtcblx0XHRcdGV2ZW50ID0gdmFsdWVPYmplY3Q7XG5cdFx0fVxuXHRcdGVuc3VyZUxvY2FsSWQoKTtcblx0XHQkJC5QU0tfUHViU3ViLnB1Ymxpc2godmFsdWVPYmplY3QubG9jYWxJZCwgZXZlbnQpO1xuXHR9XG5cblx0cmV0LnN3YXJtICAgICAgICAgICA9IHN3YXJtRnVuY3Rpb247XG5cdHJldC5ub3RpZnkgICAgICAgICAgPSBub3RpZnk7XG5cdHJldC5nZXRKU09OYXN5bmMgICAgPSBnZXRKU09OYXN5bmM7XG5cdHJldC50b0pTT04gICAgICAgICAgPSB0b0pTT047XG5cdHJldC5vYnNlcnZlICAgICAgICAgPSBvYnNlcnZlO1xuXHRyZXQuaW5zcGVjdCAgICAgICAgID0gaW5zcGVjdDtcblx0cmV0LmpvaW4gICAgICAgICAgICA9IGNyZWF0ZVBhcmFsbGVsO1xuXHRyZXQucGFyYWxsZWwgICAgICAgID0gY3JlYXRlUGFyYWxsZWw7XG5cdHJldC5zZXJpYWwgICAgICAgICAgPSBjcmVhdGVTZXJpYWw7XG5cdHJldC52YWx1ZU9mICAgICAgICAgPSB2YWx1ZU9mO1xuXHRyZXQudXBkYXRlICAgICAgICAgID0gdXBkYXRlO1xuXHRyZXQucnVuUGhhc2UgICAgICAgID0gcnVuUGhhc2U7XG5cdHJldC5vblJldHVybiAgICAgICAgPSB3YWl0UmVzdWx0cztcblx0cmV0Lm9uUmVzdWx0ICAgICAgICA9IHdhaXRSZXN1bHRzO1xuXHRyZXQuYXN5bmNSZXR1cm4gICAgID0gYXN5bmNSZXR1cm47XG5cdHJldC5yZXR1cm4gICAgICAgICAgPSBhc3luY1JldHVybjtcblx0cmV0LmdldElubmVyVmFsdWUgICA9IGdldElubmVyVmFsdWU7XG5cdHJldC5ob21lICAgICAgICAgICAgPSBob21lO1xuXHRyZXQudG9TdHJpbmcgICAgICAgID0gdG9TdHJpbmc7XG5cdHJldC5jb25zdHJ1Y3RvciAgICAgPSBjb25zdHJ1Y3RvcjtcblxuXHRyZXR1cm4gcmV0O1xuXG59OyIsImV4cG9ydHMuY3JlYXRlRm9yT2JqZWN0ID0gZnVuY3Rpb24odmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpe1xuXHR2YXIgcmV0ID0gcmVxdWlyZShcIi4vYmFzZVwiKS5jcmVhdGVGb3JPYmplY3QodmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpO1xuXG5cdHJldC5zd2FybSAgICAgICAgICAgPSBudWxsO1xuXHRyZXQub25SZXR1cm4gICAgICAgID0gbnVsbDtcblx0cmV0Lm9uUmVzdWx0ICAgICAgICA9IG51bGw7XG5cdHJldC5hc3luY1JldHVybiAgICAgPSBudWxsO1xuXHRyZXQucmV0dXJuICAgICAgICAgID0gbnVsbDtcblx0cmV0LmhvbWUgICAgICAgICAgICA9IG51bGw7XG5cblx0cmV0dXJuIHJldDtcbn07IiwiZXhwb3J0cy5jcmVhdGVGb3JPYmplY3QgPSBmdW5jdGlvbih2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCl7XG5cdHJldHVybiByZXF1aXJlKFwiLi9iYXNlXCIpLmNyZWF0ZUZvck9iamVjdCh2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCk7XG59OyIsIi8qXG5Jbml0aWFsIExpY2Vuc2U6IChjKSBBeGlvbG9naWMgUmVzZWFyY2ggJiBBbGJvYWllIFPDrm5pY8SDLlxuQ29udHJpYnV0b3JzOiBBeGlvbG9naWMgUmVzZWFyY2ggLCBQcml2YXRlU2t5IHByb2plY3RcbkNvZGUgTGljZW5zZTogTEdQTCBvciBNSVQuXG4qL1xuXG4vL3ZhciBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcbi8vdmFyIHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcblxuZnVuY3Rpb24gd3JhcENhbGwob3JpZ2luYWwsIHByZWZpeE5hbWUpe1xuICAgIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcInByZWZpeE5hbWVcIiwgcHJlZml4TmFtZSlcbiAgICAgICAgdmFyIHByZXZpb3VzUHJlZml4ID0gJCQubGlicmFyeVByZWZpeDtcbiAgICAgICAgJCQubGlicmFyeVByZWZpeCA9IHByZWZpeE5hbWU7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIHZhciByZXQgPSBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICQkLmxpYnJhcnlQcmVmaXggPSBwcmV2aW91c1ByZWZpeCA7XG4gICAgICAgIH1jYXRjaChlcnIpe1xuICAgICAgICAgICAgJCQubGlicmFyeVByZWZpeCA9IHByZXZpb3VzUHJlZml4IDtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gU3dhcm1MaWJyYXJ5KHByZWZpeE5hbWUsIGZvbGRlcil7XG4gICAgJCQubGlicmFyaWVzW3ByZWZpeE5hbWVdID0gdGhpcztcbiAgICB2YXIgcHJlZml4ZWRSZXF1aXJlID0gd3JhcENhbGwoZnVuY3Rpb24ocGF0aCl7XG4gICAgICAgIHJldHVybiByZXF1aXJlKHBhdGgpO1xuICAgIH0sIHByZWZpeE5hbWUpO1xuXG4gICAgZnVuY3Rpb24gaW5jbHVkZUFsbEluUm9vdChmb2xkZXIpIHtcbiAgICAgICAgcmV0dXJuIHJlcXVpcmUoZm9sZGVyKTsgLy8gYSBsaWJyYXJ5IGlzIGp1c3QgYSBtb2R1bGVcbiAgICAgICAgLy92YXIgc3RhdCA9IGZzLnN0YXRTeW5jKHBhdGgpO1xuICAgICAgICAvKnZhciBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGZvbGRlcik7XG4gICAgICAgIGZpbGVzLmZvckVhY2goZnVuY3Rpb24oZmlsZU5hbWUpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIkxvYWRpbmcgXCIsIGZpbGVOYW1lKTtcbiAgICAgICAgICAgIHZhciBleHQgPSBmaWxlTmFtZS5zdWJzdHIoZmlsZU5hbWUubGFzdEluZGV4T2YoJy4nKSArIDEpO1xuICAgICAgICAgICAgaWYoZXh0LnRvTG93ZXJDYXNlKCkgPT0gXCJqc1wiKXtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZnVsbFBhdGggPSBwYXRoLnJlc29sdmUoZm9sZGVyICsgXCIvXCIgKyBmaWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHByZWZpeGVkUmVxdWlyZShmdWxsUGF0aCk7XG4gICAgICAgICAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkqL1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIHdyYXBTd2FybVJlbGF0ZWRGdW5jdGlvbnMoc3BhY2UsIHByZWZpeE5hbWUpe1xuICAgICAgICB2YXIgcmV0ID0ge307XG4gICAgICAgIHZhciBuYW1lcyA9IFtcImNyZWF0ZVwiLCBcImRlc2NyaWJlXCIsIFwic3RhcnRcIiwgXCJyZXN0YXJ0XCJdO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpPG5hbWVzLmxlbmd0aDsgaSsrICl7XG4gICAgICAgICAgICByZXRbbmFtZXNbaV1dID0gd3JhcENhbGwoc3BhY2VbbmFtZXNbaV1dLCBwcmVmaXhOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIHRoaXMuY2FsbGZsb3dzICAgICAgICA9IHRoaXMuY2FsbGZsb3cgICA9IHdyYXBTd2FybVJlbGF0ZWRGdW5jdGlvbnMoJCQuY2FsbGZsb3dzLCBwcmVmaXhOYW1lKTtcbiAgICB0aGlzLnN3YXJtcyAgICAgICAgICAgPSB0aGlzLnN3YXJtICAgICAgPSB3cmFwU3dhcm1SZWxhdGVkRnVuY3Rpb25zKCQkLnN3YXJtcywgcHJlZml4TmFtZSk7XG4gICAgdGhpcy5jb250cmFjdHMgICAgICAgID0gdGhpcy5jb250cmFjdCAgID0gd3JhcFN3YXJtUmVsYXRlZEZ1bmN0aW9ucygkJC5jb250cmFjdHMsIHByZWZpeE5hbWUpO1xuICAgIGluY2x1ZGVBbGxJblJvb3QoZm9sZGVyLCBwcmVmaXhOYW1lKTtcbn1cblxuZXhwb3J0cy5sb2FkTGlicmFyeSA9IGZ1bmN0aW9uKHByZWZpeE5hbWUsIGZvbGRlcil7XG4gICAgdmFyIGV4aXN0aW5nID0gJCQubGlicmFyaWVzW3ByZWZpeE5hbWVdO1xuICAgIGlmKGV4aXN0aW5nICl7XG4gICAgICAgIGlmKGZvbGRlcikge1xuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLndhcm5pbmcoXCJSZXVzaW5nIGFscmVhZHkgbG9hZGVkIGxpYnJhcnkgXCIgKyBwcmVmaXhOYW1lICsgXCJjb3VsZCBiZSBhbiBlcnJvciFcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV4aXN0aW5nO1xuICAgIH1cbiAgICAvL3ZhciBhYnNvbHV0ZVBhdGggPSBwYXRoLnJlc29sdmUoZm9sZGVyKTtcbiAgICByZXR1cm4gbmV3IFN3YXJtTGlicmFyeShwcmVmaXhOYW1lLCBmb2xkZXIpO1xufSIsIlxuLypcbiByZXF1aXJlIGFuZCByZXF1aXJlTGlicmFyeSBhcmUgb3ZlcndyaXRpbmcgdGhlIG5vZGUuanMgZGVmYXVsdHMgaW4gbG9hZGluZyBtb2R1bGVzIGZvciBpbmNyZWFzaW5nIHNlY3VyaXR5IGFuZCBzcGVlZC5cbiBXZSBndWFyYW50ZWUgdGhhdCBlYWNoIG1vZHVsZSBvciBsaWJyYXJ5IGlzIGxvYWRlZCBvbmx5IG9uY2UgYW5kIG9ubHkgZnJvbSBhIHNpbmdsZSBmb2xkZXIuLi4gVXNlIHRoZSBzdGFuZGFyZCByZXF1aXJlIGlmIHlvdSBuZWVkIHNvbWV0aGluZyBlbHNlIVxuXG4gKi9cblxuaWYodHlwZW9mKGdsb2JhbC4kJCkgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGdsb2JhbC4kJCA9IHt9O1xufVxuXG5jb25zb2xlLmxvZyhcIkJvb3RpbmcuLi5cIik7XG52YXIgd2VBcmVJbmJyb3dzZXIgPSAodHlwZW9mKCQkLmJyb3dzZXJSdW50aW1lKSAhPSBcInVuZGVmaW5lZFwiKTtcblxuXG52YXIgcGFzdFJlcXVlc3RzID0ge307XG5mdW5jdGlvbiBwcmV2ZW50UmVjdXJzaXZlUmVxdWlyZShyZXF1ZXN0KXtcbiAgICBpZihwYXN0UmVxdWVzdHNbcmVxdWVzdF0pe1xuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKFwiUHJldmVudGluZyByZWN1cnNpdmUgcmVxdWlyZSBmb3IgXCIgKyByZXF1ZXN0KTtcbiAgICAgICAgZXJyLnR5cGUgPSBcIlBTS0lnbm9yYWJsZUVycm9yXCJcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgIH1cblxufVxuXG5mdW5jdGlvbiBkaXNhYmxlUmVxdWlyZShyZXF1ZXN0KXtcbiAgICBwYXN0UmVxdWVzdHNbcmVxdWVzdF0gPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBlbmFibGVSZXF1aXJlKHJlcXVlc3Qpe1xuICAgIHBhc3RSZXF1ZXN0c1tyZXF1ZXN0XSA9IGZhbHNlO1xufVxuXG5cbmZ1bmN0aW9uIHJlcXVpcmVGcm9tQ2FjaGUocmVxdWVzdCl7XG4gICAgdmFyIGV4aXN0aW5nTW9kdWxlID0gJCQuX19ydW50aW1lTW9kdWxlc1tyZXF1ZXN0XTtcbiAgICByZXR1cm4gIGV4aXN0aW5nTW9kdWxlO1xufVxuXG5mdW5jdGlvbiB0cnlSZXF1aXJlU2VxdWVuY2UoYXJyLCByZXF1ZXN0KXtcblxuICAgIHByZXZlbnRSZWN1cnNpdmVSZXF1aXJlKHJlcXVlc3QpO1xuICAgIGRpc2FibGVSZXF1aXJlKHJlcXVlc3QpO1xuICAgIHZhciByZXN1bHQ7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIHJlc3VsdCA9IGFycltpXShyZXF1ZXN0KTtcbiAgICAgICAgICAgIGlmKHJlc3VsdCAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJyZXR1cm5pbmcgcmVzdWx0IGZvciBcIiwgcmVxdWVzdCwgISFyZXN1bHQpO1xuICAgICAgICAgICAgICAgICQkLl9fcnVudGltZU1vZHVsZXNbcmVxdWVzdF0gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgIGlmKGVyci50eXBlICE9IFwiUFNLSWdub3JhYmxlRXJyb3JcIil7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJGYWlsZWQgaW4gc3RlcFwiLCBpLCByZXF1ZXN0LCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYoIXJlc3VsdCl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIGxvYWQgbW9kdWxlIFwiLCByZXF1ZXN0LCByZXN1bHQpO1xuICAgIH1cblxuICAgIGVuYWJsZVJlcXVpcmUocmVxdWVzdCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuXG5pZiAodHlwZW9mKCQkLnJlcXVpcmUpID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAkJC5fX3J1bnRpbWVNb2R1bGVzID0ge307XG5cbiAgICBpZiAoIXdlQXJlSW5icm93c2VyKSB7ICAvL3dlIGFyZSBpbiBub2RlXG5cbiAgICAgICAgJCQuX19ydW50aW1lTW9kdWxlc1tcImNyeXB0b1wiXSA9IHJlcXVpcmUoXCJjcnlwdG9cIik7XG4gICAgICAgICQkLl9fcnVudGltZU1vZHVsZXNbXCJ1dGlsXCJdID0gcmVxdWlyZShcInV0aWxcIik7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJSZWRlZmluaW5nIHJlcXVpcmUgZm9yIG5vZGVcIik7XG4gICAgICAgIHZhciBNb2R1bGUgPSByZXF1aXJlKCdtb2R1bGUnKTtcbiAgICAgICAgJCQuX19vcmlnaW5hbFJlcXVpcmUgPSBNb2R1bGUuX2xvYWQ7XG5cbiAgICAgICAgZnVuY3Rpb24gbmV3TG9hZGVyKHJlcXVlc3QpIHtcbiAgICAgICAgICAgIC8vcHJldmVudFJlY3Vyc2l2ZVJlcXVpcmUocmVxdWVzdCk7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9yaWdpbmFsUmVxdWlyZSguLi5hcmdzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gJCQuX19vcmlnaW5hbFJlcXVpcmUuYXBwbHkoc2VsZixhcmdzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRyeVJlcXVpcmVTZXF1ZW5jZShbcmVxdWlyZUZyb21DYWNoZSwgcHNrcnVudGltZVJlcXVpcmUsIG9yaWdpbmFsUmVxdWlyZV0sIHJlcXVlc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgTW9kdWxlLl9sb2FkID0gbmV3TG9hZGVyO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJEZWZpbmluZyBnbG9iYWwgcmVxdWlyZSBpbiBicm93c2VyXCIpO1xuXG4gICAgICAgIHdpbmRvdy5yZXF1aXJlID0gZnVuY3Rpb24ocmVxdWVzdCl7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnlSZXF1aXJlU2VxdWVuY2UoW3JlcXVpcmVGcm9tQ2FjaGUsIGJyb3dzZXJSZXF1aXJlLCBwc2tydW50aW1lUmVxdWlyZV0sIHJlcXVlc3QpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgJCQucmVxdWlyZSA9IHJlcXVpcmU7XG59XG4iLCJcbnZhciBqb2luQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIFBhcmFsbGVsSm9pblBvaW50KHN3YXJtLCBjYWxsYmFjaywgYXJncyl7XG4gICAgam9pbkNvdW50ZXIrKztcbiAgICB2YXIgY2hhbm5lbElkID0gXCJQYXJhbGxlbEpvaW5Qb2ludFwiICsgam9pbkNvdW50ZXI7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBjb3VudGVyID0gMDtcbiAgICB2YXIgc3RvcE90aGVyRXhlY3V0aW9uICAgICA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gZXhlY3V0aW9uU3RlcChzdGVwRnVuYywgbG9jYWxBcmdzLCBzdG9wKXtcblxuICAgICAgICB0aGlzLmRvRXhlY3V0ZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZihzdG9wT3RoZXJFeGVjdXRpb24pe1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBzdGVwRnVuYy5hcHBseShzd2FybSwgbG9jYWxBcmdzKTtcbiAgICAgICAgICAgICAgICBpZihzdG9wKXtcbiAgICAgICAgICAgICAgICAgICAgc3RvcE90aGVyRXhlY3V0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy9ldmVyeXRpbmcgaXMgZmluZVxuICAgICAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgICAgIGFyZ3MudW5zaGlmdChlcnIpO1xuICAgICAgICAgICAgICAgIHNlbmRGb3JTb3VuZEV4ZWN1dGlvbihjYWxsYmFjaywgYXJncywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvL3N0b3AgaXQsIGRvIG5vdCBjYWxsIGFnYWluIGFueXRoaW5nXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZih0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgICQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihcImludmFsaWQgam9pblwiLHN3YXJtLCBcImludmFsaWQgZnVuY3Rpb24gYXQgam9pbiBpbiBzd2FybVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICQkLlBTS19QdWJTdWIuc3Vic2NyaWJlKGNoYW5uZWxJZCxmdW5jdGlvbihmb3JFeGVjdXRpb24pe1xuICAgICAgICBpZihzdG9wT3RoZXJFeGVjdXRpb24pe1xuICAgICAgICAgICAgcmV0dXJuIDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGlmKGZvckV4ZWN1dGlvbi5kb0V4ZWN1dGUoKSl7XG4gICAgICAgICAgICAgICAgZGVjQ291bnRlcigpO1xuICAgICAgICAgICAgfSAvLyBoYWQgYW4gZXJyb3IuLi5cbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgLy8kJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IoXCJfX2ludGVybmFsX19cIixzd2FybSwgXCJleGNlcHRpb24gaW4gdGhlIGV4ZWN1dGlvbiBvZiB0aGUgam9pbiBmdW5jdGlvbiBvZiBhIHBhcmFsbGVsIHRhc2tcIik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGluY0NvdW50ZXIoKXtcbiAgICAgICAgaWYodGVzdElmVW5kZXJJbnNwZWN0aW9uKCkpe1xuICAgICAgICAgICAgLy9wcmV2ZW50aW5nIGluc3BlY3RvciBmcm9tIGluY3JlYXNpbmcgY291bnRlciB3aGVuIHJlYWRpbmcgdGhlIHZhbHVlcyBmb3IgZGVidWcgcmVhc29uXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwicHJldmVudGluZyBpbnNwZWN0aW9uXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvdW50ZXIrKztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0ZXN0SWZVbmRlckluc3BlY3Rpb24oKXtcbiAgICAgICAgdmFyIHJlcyA9IGZhbHNlO1xuICAgICAgICB2YXIgY29uc3RBcmd2ID0gcHJvY2Vzcy5leGVjQXJndi5qb2luKCk7XG4gICAgICAgIGlmKGNvbnN0QXJndi5pbmRleE9mKFwiaW5zcGVjdFwiKSE9PS0xIHx8IGNvbnN0QXJndi5pbmRleE9mKFwiZGVidWdcIikhPT0tMSl7XG4gICAgICAgICAgICAvL29ubHkgd2hlbiBydW5uaW5nIGluIGRlYnVnXG4gICAgICAgICAgICB2YXIgY2FsbHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gICAgICAgICAgICBpZihjYWxsc3RhY2suaW5kZXhPZihcIkRlYnVnQ29tbWFuZFByb2Nlc3NvclwiKSE9PS0xKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRlYnVnQ29tbWFuZFByb2Nlc3NvciBkZXRlY3RlZCFcIik7XG4gICAgICAgICAgICAgICAgcmVzID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlbmRGb3JTb3VuZEV4ZWN1dGlvbihmdW5jdCwgYXJncywgc3RvcCl7XG4gICAgICAgIHZhciBvYmogPSBuZXcgZXhlY3V0aW9uU3RlcChmdW5jdCwgYXJncywgc3RvcCk7XG4gICAgICAgICQkLlBTS19QdWJTdWIucHVibGlzaChjaGFubmVsSWQsIG9iaik7IC8vIGZvcmNlIGV4ZWN1dGlvbiB0byBiZSBcInNvdW5kXCJcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWNDb3VudGVyKCl7XG4gICAgICAgIGNvdW50ZXItLTtcbiAgICAgICAgaWYoY291bnRlciA9PSAwKSB7XG4gICAgICAgICAgICBhcmdzLnVuc2hpZnQobnVsbCk7XG4gICAgICAgICAgICBzZW5kRm9yU291bmRFeGVjdXRpb24oY2FsbGJhY2ssIGFyZ3MsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBpbm5lciA9IHN3YXJtLmdldElubmVyVmFsdWUoKTtcblxuICAgIGZ1bmN0aW9uIGRlZmF1bHRQcm9ncmVzc1JlcG9ydChlcnIsIHJlcyl7XG4gICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0ZXh0OlwiUGFyYWxsZWwgZXhlY3V0aW9uIHByb2dyZXNzIGV2ZW50XCIsXG4gICAgICAgICAgICBzd2FybTpzd2FybSxcbiAgICAgICAgICAgIGFyZ3M6YXJncyxcbiAgICAgICAgICAgIGN1cnJlbnRSZXN1bHQ6cmVzXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWtGdW5jdGlvbihuYW1lKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3Mpe1xuICAgICAgICAgICAgdmFyIGYgPSBkZWZhdWx0UHJvZ3Jlc3NSZXBvcnQ7XG4gICAgICAgICAgICBpZihuYW1lICE9IFwicHJvZ3Jlc3NcIil7XG4gICAgICAgICAgICAgICAgZiA9IGlubmVyLm15RnVuY3Rpb25zW25hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFyZ3MgPSAkJC5fX2ludGVybi5ta0FyZ3MoYXJncywgMCk7XG4gICAgICAgICAgICBzZW5kRm9yU291bmRFeGVjdXRpb24oZiwgYXJncywgZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuIF9fcHJveHlPYmplY3Q7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wLCByZWNlaXZlcil7XG4gICAgICAgIGlmKGlubmVyLm15RnVuY3Rpb25zLmhhc093blByb3BlcnR5KHByb3ApIHx8IHByb3AgPT0gXCJwcm9ncmVzc1wiKXtcbiAgICAgICAgICAgIGluY0NvdW50ZXIoKTtcbiAgICAgICAgICAgIHJldHVybiBta0Z1bmN0aW9uKHByb3ApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzd2FybVtwcm9wXTtcbiAgICB9O1xuXG4gICAgdmFyIF9fcHJveHlPYmplY3Q7XG5cbiAgICB0aGlzLl9fc2V0UHJveHlPYmplY3QgPSBmdW5jdGlvbihwKXtcbiAgICAgICAgX19wcm94eU9iamVjdCA9IHA7XG4gICAgfVxufVxuXG5leHBvcnRzLmNyZWF0ZUpvaW5Qb2ludCA9IGZ1bmN0aW9uKHN3YXJtLCBjYWxsYmFjaywgYXJncyl7XG4gICAgdmFyIGpwID0gbmV3IFBhcmFsbGVsSm9pblBvaW50KHN3YXJtLCBjYWxsYmFjaywgYXJncyk7XG4gICAgdmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xuICAgIHZhciBwID0gbmV3IFByb3h5KGlubmVyLCBqcCk7XG4gICAganAuX19zZXRQcm94eU9iamVjdChwKTtcbiAgICByZXR1cm4gcDtcbn07IiwiXG5mdW5jdGlvbiBlbmNvZGUoYnVmZmVyKSB7XG4gICAgcmV0dXJuIGJ1ZmZlci50b1N0cmluZygnYmFzZTY0JylcbiAgICAgICAgLnJlcGxhY2UoL1xcKy9nLCAnJylcbiAgICAgICAgLnJlcGxhY2UoL1xcLy9nLCAnJylcbiAgICAgICAgLnJlcGxhY2UoLz0rJC8sICcnKTtcbn07XG5cbmZ1bmN0aW9uIHN0YW1wV2l0aFRpbWUoYnVmLCBzYWx0LCBtc2FsdCl7XG4gICAgaWYoIXNhbHQpe1xuICAgICAgICBzYWx0ID0gMTtcbiAgICB9XG4gICAgaWYoIW1zYWx0KXtcbiAgICAgICAgbXNhbHQgPSAxO1xuICAgIH1cbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlO1xuICAgIHZhciBjdCA9IE1hdGguZmxvb3IoZGF0ZS5nZXRUaW1lKCkgLyBzYWx0KTtcbiAgICB2YXIgY291bnRlciA9IDA7XG4gICAgd2hpbGUoY3QgPiAwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJDb3VudGVyXCIsIGNvdW50ZXIsIGN0KTtcbiAgICAgICAgYnVmW2NvdW50ZXIqbXNhbHRdID0gTWF0aC5mbG9vcihjdCAlIDI1Nik7XG4gICAgICAgIGN0ID0gTWF0aC5mbG9vcihjdCAvIDI1Nik7XG4gICAgICAgIGNvdW50ZXIrKztcbiAgICB9XG59XG5cbi8qXG4gICAgVGhlIHVpZCBjb250YWlucyBhcm91bmQgMjU2IGJpdHMgb2YgcmFuZG9tbmVzcyBhbmQgYXJlIHVuaXF1ZSBhdCB0aGUgbGV2ZWwgb2Ygc2Vjb25kcy4gVGhpcyBVVUlEIHNob3VsZCBieSBjcnlwdG9ncmFwaGljYWxseSBzYWZlIChjYW4gbm90IGJlIGd1ZXNzZWQpXG5cbiAgICBXZSBnZW5lcmF0ZSBhIHNhZmUgVUlEIHRoYXQgaXMgZ3VhcmFudGVlZCB1bmlxdWUgKGJ5IHVzYWdlIG9mIGEgUFJORyB0byBnZW5lYXRlIDI1NiBiaXRzKSBhbmQgdGltZSBzdGFtcGluZyB3aXRoIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyBhdCB0aGUgbW9tZW50IHdoZW4gaXMgZ2VuZXJhdGVkXG4gICAgVGhpcyBtZXRob2Qgc2hvdWxkIGJlIHNhZmUgdG8gdXNlIGF0IHRoZSBsZXZlbCBvZiB2ZXJ5IGxhcmdlIGRpc3RyaWJ1dGVkIHN5c3RlbXMuXG4gICAgVGhlIFVVSUQgaXMgc3RhbXBlZCB3aXRoIHRpbWUgKHNlY29uZHMpOiBkb2VzIGl0IG9wZW4gYSB3YXkgdG8gZ3Vlc3MgdGhlIFVVSUQ/IEl0IGRlcGVuZHMgaG93IHNhZmUgaXMgXCJjcnlwdG9cIiBQUk5HLCBidXQgaXQgc2hvdWxkIGJlIG5vIHByb2JsZW0uLi5cblxuICovXG5cbmV4cG9ydHMuc2FmZV91dWlkID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICByZXF1aXJlKCdjcnlwdG8nKS5yYW5kb21CeXRlcygzNiwgZnVuY3Rpb24gKGVyciwgYnVmKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc3RhbXBXaXRoVGltZShidWYsIDEwMDAsIDMpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCBlbmNvZGUoYnVmKSk7XG4gICAgfSk7XG59XG5cblxuLypcbiAgICBUcnkgdG8gZ2VuZXJhdGUgYSBzbWFsbCBVSUQgdGhhdCBpcyB1bmlxdWUgYWdhaW5zdCBjaGFuY2UgaW4gdGhlIHNhbWUgbWlsbGlzZWNvbmQgc2Vjb25kIGFuZCBpbiBhIHNwZWNpZmljIGNvbnRleHQgKGVnIGluIHRoZSBzYW1lIGNob3Jlb2dyYXBoeSBleGVjdXRpb24pXG4gICAgVGhlIGlkIGNvbnRhaW5zIGFyb3VuZCA2KjggPSA0OCAgYml0cyBvZiByYW5kb21uZXNzIGFuZCBhcmUgdW5pcXVlIGF0IHRoZSBsZXZlbCBvZiBtaWxsaXNlY29uZHNcbiAgICBUaGlzIG1ldGhvZCBpcyBzYWZlIG9uIGEgc2luZ2xlIGNvbXB1dGVyIGJ1dCBzaG91bGQgYmUgdXNlZCB3aXRoIGNhcmUgb3RoZXJ3aXNlXG4gICAgVGhpcyBVVUlEIGlzIG5vdCBjcnlwdG9ncmFwaGljYWxseSBzYWZlIChjYW4gYmUgZ3Vlc3NlZClcbiAqL1xuZXhwb3J0cy5zaG9ydF91dWlkID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICByZXF1aXJlKCdjcnlwdG8nKS5yYW5kb21CeXRlcygxMiwgZnVuY3Rpb24gKGVyciwgYnVmKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc3RhbXBXaXRoVGltZShidWYsMSwyKTtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgZW5jb2RlKGJ1ZikpO1xuICAgIH0pO1xufSIsIlxudmFyIGpvaW5Db3VudGVyID0gMDtcblxuZnVuY3Rpb24gU2VyaWFsSm9pblBvaW50KHN3YXJtLCBjYWxsYmFjaywgYXJncyl7XG5cbiAgICBqb2luQ291bnRlcisrO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBjaGFubmVsSWQgPSBcIlNlcmlhbEpvaW5Qb2ludFwiICsgam9pbkNvdW50ZXI7XG5cbiAgICBpZih0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgICQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihcInVua25vd25cIiwgc3dhcm0sIFwiaW52YWxpZCBmdW5jdGlvbiBnaXZlbiB0byBzZXJpYWwgaW4gc3dhcm1cIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgaW5uZXIgPSBzd2FybS5nZXRJbm5lclZhbHVlKCk7XG5cblxuICAgIGZ1bmN0aW9uIGRlZmF1bHRQcm9ncmVzc1JlcG9ydChlcnIsIHJlcyl7XG4gICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG5cbiAgICB2YXIgZnVuY3Rpb25Db3VudGVyICAgICA9IDA7XG4gICAgdmFyIGV4ZWN1dGlvbkNvdW50ZXIgICAgPSAwO1xuXG4gICAgdmFyIHBsYW5uZWRFeGVjdXRpb25zICAgPSBbXTtcbiAgICB2YXIgcGxhbm5lZEFyZ3VtZW50cyAgICA9IHt9O1xuXG4gICAgZnVuY3Rpb24gbWtGdW5jdGlvbihuYW1lLCBwb3Mpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiQ3JlYXRpbmcgZnVuY3Rpb24gXCIsIG5hbWUsIHBvcyk7XG4gICAgICAgIHBsYW5uZWRBcmd1bWVudHNbcG9zXSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBmdW5jdGlvbiB0cmlnZ2V0TmV4dFN0ZXAoKXtcbiAgICAgICAgICAgIGlmKHBsYW5uZWRFeGVjdXRpb25zLmxlbmd0aCA9PSBleGVjdXRpb25Db3VudGVyIHx8IHBsYW5uZWRBcmd1bWVudHNbZXhlY3V0aW9uQ291bnRlcl0gKSAge1xuICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIucHVibGlzaChjaGFubmVsSWQsIHNlbGYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGYgPSBmdW5jdGlvbiAoLi4uYXJncyl7XG4gICAgICAgICAgICBpZihleGVjdXRpb25Db3VudGVyICE9IHBvcykge1xuICAgICAgICAgICAgICAgIHBsYW5uZWRBcmd1bWVudHNbcG9zXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIkRlbGF5aW5nIGZ1bmN0aW9uOlwiLCBleGVjdXRpb25Db3VudGVyLCBwb3MsIHBsYW5uZWRBcmd1bWVudHMsIGFyZ3VtZW50cywgZnVuY3Rpb25Db3VudGVyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX19wcm94eTtcbiAgICAgICAgICAgIH0gZWxzZXtcbiAgICAgICAgICAgICAgICBpZihwbGFubmVkQXJndW1lbnRzW3Bvc10pe1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiRXhlY3V0aW5nICBmdW5jdGlvbjpcIiwgZXhlY3V0aW9uQ291bnRlciwgcG9zLCBwbGFubmVkQXJndW1lbnRzLCBhcmd1bWVudHMsIGZ1bmN0aW9uQ291bnRlcik7XG5cdFx0XHRcdFx0YXJncyA9IHBsYW5uZWRBcmd1bWVudHNbcG9zXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwbGFubmVkQXJndW1lbnRzW3Bvc10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2V0TmV4dFN0ZXAoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9fcHJveHk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZiA9IGRlZmF1bHRQcm9ncmVzc1JlcG9ydDtcbiAgICAgICAgICAgIGlmKG5hbWUgIT0gXCJwcm9ncmVzc1wiKXtcbiAgICAgICAgICAgICAgICBmID0gaW5uZXIubXlGdW5jdGlvbnNbbmFtZV07XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIGYuYXBwbHkoc2VsZixhcmdzKTtcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgYXJncy51bnNoaWZ0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHN3YXJtLGFyZ3MpOyAvL2Vycm9yXG4gICAgICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIudW5zdWJzY3JpYmUoY2hhbm5lbElkLHJ1bk5leHRGdW5jdGlvbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvL3Rlcm1pbmF0ZSBleGVjdXRpb24gd2l0aCBhbiBlcnJvci4uLiFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4ZWN1dGlvbkNvdW50ZXIrKztcblxuICAgICAgICAgICAgdHJpZ2dldE5leHRTdGVwKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBfX3Byb3h5O1xuICAgICAgICB9O1xuXG4gICAgICAgIHBsYW5uZWRFeGVjdXRpb25zLnB1c2goZik7XG4gICAgICAgIGZ1bmN0aW9uQ291bnRlcisrO1xuICAgICAgICByZXR1cm4gZjtcbiAgICB9XG5cbiAgICAgdmFyIGZpbmlzaGVkID0gZmFsc2U7XG5cbiAgICBmdW5jdGlvbiBydW5OZXh0RnVuY3Rpb24oKXtcbiAgICAgICAgaWYoZXhlY3V0aW9uQ291bnRlciA9PSBwbGFubmVkRXhlY3V0aW9ucy5sZW5ndGggKXtcbiAgICAgICAgICAgIGlmKCFmaW5pc2hlZCl7XG4gICAgICAgICAgICAgICAgYXJncy51bnNoaWZ0KG51bGwpO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHN3YXJtLGFyZ3MpO1xuICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLnVuc3Vic2NyaWJlKGNoYW5uZWxJZCxydW5OZXh0RnVuY3Rpb24pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNlcmlhbCBjb25zdHJ1Y3QgaXMgdXNpbmcgZnVuY3Rpb25zIHRoYXQgYXJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcy4uLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBsYW5uZWRFeGVjdXRpb25zW2V4ZWN1dGlvbkNvdW50ZXJdKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAkJC5QU0tfUHViU3ViLnN1YnNjcmliZShjaGFubmVsSWQscnVuTmV4dEZ1bmN0aW9uKTsgLy8gZm9yY2UgaXQgdG8gYmUgXCJzb3VuZFwiXG5cblxuICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wLCByZWNlaXZlcil7XG4gICAgICAgIGlmKHByb3AgPT0gXCJwcm9ncmVzc1wiIHx8IGlubmVyLm15RnVuY3Rpb25zLmhhc093blByb3BlcnR5KHByb3ApKXtcbiAgICAgICAgICAgIHJldHVybiBta0Z1bmN0aW9uKHByb3AsIGZ1bmN0aW9uQ291bnRlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN3YXJtW3Byb3BdO1xuICAgIH1cblxuICAgIHZhciBfX3Byb3h5O1xuICAgIHRoaXMuc2V0UHJveHlPYmplY3QgPSBmdW5jdGlvbihwKXtcbiAgICAgICAgX19wcm94eSA9IHA7XG4gICAgfVxufVxuXG5leHBvcnRzLmNyZWF0ZVNlcmlhbEpvaW5Qb2ludCA9IGZ1bmN0aW9uKHN3YXJtLCBjYWxsYmFjaywgYXJncyl7XG4gICAgdmFyIGpwID0gbmV3IFNlcmlhbEpvaW5Qb2ludChzd2FybSwgY2FsbGJhY2ssIGFyZ3MpO1xuICAgIHZhciBpbm5lciA9IHN3YXJtLmdldElubmVyVmFsdWUoKTtcbiAgICB2YXIgcCA9IG5ldyBQcm94eShpbm5lciwganApO1xuICAgIGpwLnNldFByb3h5T2JqZWN0KHApO1xuICAgIHJldHVybiBwO1xufSIsImZ1bmN0aW9uIFN3YXJtU3BhY2Uoc3dhcm1UeXBlLCB1dGlscykge1xuXG4gICAgdmFyIGJlZXNIZWFsZXIgPSByZXF1aXJlKFwic291bmRwdWJzdWJcIikuYmVlc0hlYWxlcjtcblxuICAgIGZ1bmN0aW9uIGdldEZ1bGxOYW1lKHNob3J0TmFtZSl7XG4gICAgICAgIHZhciBmdWxsTmFtZTtcbiAgICAgICAgaWYoc2hvcnROYW1lICYmIHNob3J0TmFtZS5pbmNsdWRlcyhcIi5cIikpIHtcbiAgICAgICAgICAgIGZ1bGxOYW1lID0gc2hvcnROYW1lO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnVsbE5hbWUgPSAkJC5saWJyYXJ5UHJlZml4ICsgXCIuXCIgKyBzaG9ydE5hbWU7IC8vVE9ETzogY2hlY2sgbW9yZSBhYm91dCAuICE/XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZ1bGxOYW1lO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIFZhckRlc2NyaXB0aW9uKGRlc2Mpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5pdDpmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdG9yZTpmdW5jdGlvbihqc29uU3RyaW5nKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShqc29uU3RyaW5nKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0b0pzb25TdHJpbmc6ZnVuY3Rpb24oeCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gU3dhcm1EZXNjcmlwdGlvbihzd2FybVR5cGVOYW1lLCBkZXNjcmlwdGlvbil7XG5cbiAgICAgICAgc3dhcm1UeXBlTmFtZSA9IGdldEZ1bGxOYW1lKHN3YXJtVHlwZU5hbWUpO1xuXG4gICAgICAgIHZhciBsb2NhbElkID0gMDsgIC8vIHVuaXF1ZSBmb3IgZWFjaCBzd2FybVxuXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZVZhcnMoZGVzY3Ipe1xuICAgICAgICAgICAgdmFyIG1lbWJlcnMgPSB7fTtcbiAgICAgICAgICAgIGZvcih2YXIgdiBpbiBkZXNjcil7XG4gICAgICAgICAgICAgICAgbWVtYmVyc1t2XSA9IG5ldyBWYXJEZXNjcmlwdGlvbihkZXNjclt2XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWVtYmVycztcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZU1lbWJlcnMoZGVzY3Ipe1xuICAgICAgICAgICAgdmFyIG1lbWJlcnMgPSB7fTtcbiAgICAgICAgICAgIGZvcih2YXIgdiBpbiBkZXNjcmlwdGlvbil7XG5cbiAgICAgICAgICAgICAgICBpZih2ICE9IFwicHVibGljXCIgJiYgdiAhPSBcInByaXZhdGVcIil7XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcnNbdl0gPSBkZXNjcmlwdGlvblt2XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWVtYmVycztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwdWJsaWNWYXJzID0gY3JlYXRlVmFycyhkZXNjcmlwdGlvbi5wdWJsaWMpO1xuICAgICAgICB2YXIgcHJpdmF0ZVZhcnMgPSBjcmVhdGVWYXJzKGRlc2NyaXB0aW9uLnByaXZhdGUpO1xuICAgICAgICB2YXIgbXlGdW5jdGlvbnMgPSBjcmVhdGVNZW1iZXJzKGRlc2NyaXB0aW9uKTtcblxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVQaGFzZSh0aGlzSW5zdGFuY2UsIGZ1bmMpe1xuICAgICAgICAgICAgdmFyIHBoYXNlID0gZnVuY3Rpb24oLi4uYXJncyl7XG4gICAgICAgICAgICAgICAgdmFyIHJldDtcbiAgICAgICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIuYmxvY2tDYWxsQmFja3MoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0ID0gZnVuYy5hcHBseSh0aGlzSW5zdGFuY2UsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLnJlbGVhc2VDYWxsQmFja3MoKTtcbiAgICAgICAgICAgICAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgJCQuUFNLX1B1YlN1Yi5yZWxlYXNlQ2FsbEJhY2tzKCk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vZHluYW1pYyBuYW1lZCBmdW5jIGluIG9yZGVyIHRvIGltcHJvdmUgY2FsbHN0YWNrXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocGhhc2UsIFwibmFtZVwiLCB7Z2V0OiBmdW5jdGlvbigpe3JldHVybiBzd2FybVR5cGVOYW1lK1wiLlwiK2Z1bmMubmFtZX19KTtcbiAgICAgICAgICAgIHJldHVybiBwaGFzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5pdGlhbGlzZSA9IGZ1bmN0aW9uKHNlcmlhbGlzZWRWYWx1ZXMpe1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIHB1YmxpY1ZhcnM6e1xuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwcml2YXRlVmFyczp7XG5cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHByb3RlY3RlZFZhcnM6e1xuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBteUZ1bmN0aW9uczp7XG5cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHV0aWxpdHlGdW5jdGlvbnM6e1xuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtZXRhOntcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1UeXBlTmFtZTpzd2FybVR5cGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICBzd2FybURlc2NyaXB0aW9uOmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuXG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gcHVibGljVmFycyl7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1YmxpY1ZhcnNbdl0gPSBwdWJsaWNWYXJzW3ZdLmluaXQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZvcih2YXIgdiBpbiBwcml2YXRlVmFycyl7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnByaXZhdGVWYXJzW3ZdID0gcHJpdmF0ZVZhcnNbdl0uaW5pdCgpO1xuICAgICAgICAgICAgfTtcblxuXG4gICAgICAgICAgICBpZihzZXJpYWxpc2VkVmFsdWVzKXtcbiAgICAgICAgICAgICAgICBiZWVzSGVhbGVyLmpzb25Ub05hdGl2ZShzZXJpYWxpc2VkVmFsdWVzLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmluaXRpYWxpc2VGdW5jdGlvbnMgPSBmdW5jdGlvbih2YWx1ZU9iamVjdCwgdGhpc09iamVjdCl7XG5cbiAgICAgICAgICAgIGZvcih2YXIgdiBpbiBteUZ1bmN0aW9ucyl7XG4gICAgICAgICAgICAgICAgdmFsdWVPYmplY3QubXlGdW5jdGlvbnNbdl0gPSBjcmVhdGVQaGFzZSh0aGlzT2JqZWN0LCBteUZ1bmN0aW9uc1t2XSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsb2NhbElkKys7XG4gICAgICAgICAgICB2YWx1ZU9iamVjdC51dGlsaXR5RnVuY3Rpb25zID0gdXRpbHMuY3JlYXRlRm9yT2JqZWN0KHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0LCBsb2NhbElkKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbih0YXJnZXQsIHByb3BlcnR5LCByZWNlaXZlcil7XG5cblxuICAgICAgICAgICAgaWYocHVibGljVmFycy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5wdWJsaWNWYXJzW3Byb3BlcnR5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYocHJpdmF0ZVZhcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQucHJpdmF0ZVZhcnNbcHJvcGVydHldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0YXJnZXQudXRpbGl0eUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXG4gICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnV0aWxpdHlGdW5jdGlvbnNbcHJvcGVydHldO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGlmKG15RnVuY3Rpb25zLmhhc093blByb3BlcnR5KHByb3BlcnR5KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0Lm15RnVuY3Rpb25zW3Byb3BlcnR5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGFyZ2V0LnByb3RlY3RlZFZhcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQucHJvdGVjdGVkVmFyc1twcm9wZXJ0eV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHR5cGVvZiBwcm9wZXJ0eSAhPSBcInN5bWJvbFwiKSB7XG4gICAgICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKHByb3BlcnR5LCB0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0ID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUsIHJlY2VpdmVyKXtcblxuICAgICAgICAgICAgaWYodGFyZ2V0LnV0aWxpdHlGdW5jdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpIHx8IHRhcmdldC5teUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IocHJvcGVydHkpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRyeWluZyB0byBvdmVyd3JpdGUgaW1tdXRhYmxlIG1lbWJlclwiICsgcHJvcGVydHkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihwcml2YXRlVmFycy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnByaXZhdGVWYXJzW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICBpZihwdWJsaWNWYXJzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQucHVibGljVmFyc1twcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnByb3RlY3RlZFZhcnNbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYXBwbHkgPSBmdW5jdGlvbih0YXJnZXQsIHRoaXNBcmcsIGFyZ3VtZW50c0xpc3Qpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJQcm94eSBhcHBseVwiKTtcbiAgICAgICAgICAgIC8vdmFyIGZ1bmMgPSB0YXJnZXRbXVxuICAgICAgICAgICAgLy9zd2FybUdsb2JhbHMuZXhlY3V0aW9uUHJvdmlkZXIuZXhlY3V0ZShudWxsLCB0aGlzQXJnLCBmdW5jLCBhcmd1bWVudHNMaXN0KVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuaXNFeHRlbnNpYmxlID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5oYXMgPSBmdW5jdGlvbih0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgICAgIGlmKHRhcmdldC5wdWJsaWNWYXJzW3Byb3BdIHx8IHRhcmdldC5wcm90ZWN0ZWRWYXJzW3Byb3BdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vd25LZXlzID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5vd25LZXlzKHRhcmdldC5wdWJsaWNWYXJzKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2VyaWFsaXNlZFZhbHVlcyl7XG4gICAgICAgICAgICB2YXIgdmFsdWVPYmplY3QgPSBzZWxmLmluaXRpYWxpc2Uoc2VyaWFsaXNlZFZhbHVlcyk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IFByb3h5KHZhbHVlT2JqZWN0LHNlbGYpO1xuICAgICAgICAgICAgc2VsZi5pbml0aWFsaXNlRnVuY3Rpb25zKHZhbHVlT2JqZWN0LHJlc3VsdCk7XG4gICAgICAgICAgICBpZighc2VyaWFsaXNlZFZhbHVlcyl7XG4gICAgICAgICAgICAgICAgJCQudWlkR2VuZXJhdG9yLnNhZmVfdXVpZChmdW5jdGlvbiAoZXJyLCByZXN1bHQpe1xuICAgICAgICAgICAgICAgICAgICBpZighdmFsdWVPYmplY3QubWV0YS5zd2FybUlkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1JZCA9IHJlc3VsdDsgIC8vZG8gbm90IG92ZXJ3cml0ZSEhIVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlT2JqZWN0LnV0aWxpdHlGdW5jdGlvbnMubm90aWZ5KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGRlc2NyaXB0aW9ucyA9IHt9O1xuXG4gICAgdGhpcy5kZXNjcmliZSA9IGZ1bmN0aW9uIGRlc2NyaWJlU3dhcm0oc3dhcm1UeXBlTmFtZSwgZGVzY3JpcHRpb24pe1xuICAgICAgICBzd2FybVR5cGVOYW1lID0gZ2V0RnVsbE5hbWUoc3dhcm1UeXBlTmFtZSk7XG5cbiAgICAgICAgdmFyIHBvaW50UG9zID0gc3dhcm1UeXBlTmFtZS5sYXN0SW5kZXhPZignLicpO1xuICAgICAgICB2YXIgc2hvcnROYW1lID0gc3dhcm1UeXBlTmFtZS5zdWJzdHIoIHBvaW50UG9zKyAxKTtcbiAgICAgICAgdmFyIGxpYnJhcnlOYW1lID0gc3dhcm1UeXBlTmFtZS5zdWJzdHIoMCwgcG9pbnRQb3MpO1xuICAgICAgICBpZighbGlicmFyeU5hbWUpe1xuICAgICAgICAgICAgbGlicmFyeU5hbWUgPSBcImdsb2JhbFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRlc2NyaXB0aW9uID0gbmV3IFN3YXJtRGVzY3JpcHRpb24oc3dhcm1UeXBlTmFtZSwgZGVzY3JpcHRpb24pO1xuICAgICAgICBpZihkZXNjcmlwdGlvbnNbc3dhcm1UeXBlTmFtZV0gIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci53YXJuaW5nKFwiRHVwbGljYXRlIHN3YXJtIGRlc2NyaXB0aW9uIFwiKyBzd2FybVR5cGVOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlc2NyaXB0aW9uc1tzd2FybVR5cGVOYW1lXSA9IGRlc2NyaXB0aW9uO1xuXG4gICAgICAgIGlmKCQkLnJlZ2lzdGVyU3dhcm1EZXNjcmlwdGlvbil7XG5cdFx0XHQkJC5yZWdpc3RlclN3YXJtRGVzY3JpcHRpb24obGlicmFyeU5hbWUsIHNob3J0TmFtZSwgc3dhcm1UeXBlTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlc2NyaXB0aW9uO1xuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlU3dhcm0oc3dhcm1UeXBlTmFtZSwgZGVzY3JpcHRpb24sIGluaXRpYWxWYWx1ZXMpe1xuICAgICAgICBzd2FybVR5cGVOYW1lID0gZ2V0RnVsbE5hbWUoc3dhcm1UeXBlTmFtZSk7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGlmKHVuZGVmaW5lZCA9PSBkZXNjcmlwdGlvbil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0aW9uc1tzd2FybVR5cGVOYW1lXShpbml0aWFsVmFsdWVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVzY3JpYmUoc3dhcm1UeXBlTmFtZSwgZGVzY3JpcHRpb24pKGluaXRpYWxWYWx1ZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNyZWF0ZVN3YXJtIGVycm9yXCIsIGVycik7XG4gICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIuZXJyb3IoZXJyLCBhcmd1bWVudHMsIFwiV3JvbmcgbmFtZSBvciBkZXNjcmlwdGlvbnNcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJlc3RhcnQgPSBmdW5jdGlvbihzd2FybVR5cGVOYW1lLCBpbml0aWFsVmFsdWVzKXtcbiAgICAgICAgc3dhcm1UeXBlTmFtZSA9IGdldEZ1bGxOYW1lKHN3YXJtVHlwZU5hbWUpO1xuICAgICAgICB2YXIgZGVzYyA9IGRlc2NyaXB0aW9uc1tzd2FybVR5cGVOYW1lXTtcblxuICAgICAgICBpZihkZXNjKXtcbiAgICAgICAgICAgIHJldHVybiBkZXNjKGluaXRpYWxWYWx1ZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKHN3YXJtVHlwZU5hbWUsaW5pdGlhbFZhbHVlcyxcbiAgICAgICAgICAgICAgICBcIkZhaWxlZCB0byByZXN0YXJ0IGEgc3dhcm0gd2l0aCB0eXBlIFwiICsgc3dhcm1UeXBlTmFtZSArIFwiXFxuIE1heWJlIGRpZmZyZW50IHN3YXJtIHNwYWNlICh1c2VkIGZsb3cgaW5zdGVhZCBvZiBzd2FybSE/KVwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc3RhcnQgPSBmdW5jdGlvbihzd2FybVR5cGVOYW1lLCAuLi5wYXJhbXMpe1xuICAgICAgICBzd2FybVR5cGVOYW1lID0gZ2V0RnVsbE5hbWUoc3dhcm1UeXBlTmFtZSk7XG4gICAgICAgIHZhciBkZXNjID0gZGVzY3JpcHRpb25zW3N3YXJtVHlwZU5hbWVdO1xuICAgICAgICBpZighZGVzYyl7XG4gICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IobnVsbCwgc3dhcm1UeXBlTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzID0gZGVzYygpO1xuXG4gICAgICAgIGlmKHBhcmFtcy5sZW5ndGggPiAxKXtcbiAgICAgICAgICAgIHZhciBhcmdzID1bXTtcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7aSA8IHBhcmFtcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKHBhcmFtc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXMuc3dhcm0uYXBwbHkocmVzLCBhcmdzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxufVxuXG5leHBvcnRzLmNyZWF0ZVN3YXJtRW5naW5lID0gZnVuY3Rpb24oc3dhcm1UeXBlLCB1dGlscyl7XG4gICAgaWYodHlwZW9mIHV0aWxzID09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICB1dGlscyA9IHJlcXVpcmUoXCIuL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvY2FsbGZsb3dcIik7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3dhcm1TcGFjZShzd2FybVR5cGUsIHV0aWxzKTtcbn07IiwiZnVuY3Rpb24gUXVldWVFbGVtZW50KGNvbnRlbnQpIHtcblx0dGhpcy5jb250ZW50ID0gY29udGVudDtcblx0dGhpcy5uZXh0ID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gUXVldWUoKSB7XG5cdHRoaXMuaGVhZCA9IG51bGw7XG5cdHRoaXMudGFpbCA9IG51bGw7XG5cblx0dGhpcy5wdXNoID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0bGV0IG5ld0VsZW1lbnQgPSBuZXcgUXVldWVFbGVtZW50KHZhbHVlKTtcblx0XHRpZiAoIXRoaXMuaGVhZCkge1xuXHRcdFx0dGhpcy5oZWFkID0gbmV3RWxlbWVudDtcblx0XHRcdHRoaXMudGFpbCA9IG5ld0VsZW1lbnQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudGFpbC5uZXh0ID0gbmV3RWxlbWVudDtcblx0XHRcdHRoaXMudGFpbCA9IG5ld0VsZW1lbnRcblx0XHR9XG5cdH07XG5cblx0dGhpcy5wb3AgPSBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKCF0aGlzLmhlYWQpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0XHRjb25zdCBoZWFkQ29weSA9IHRoaXMuaGVhZDtcblx0XHR0aGlzLmhlYWQgPSB0aGlzLmhlYWQubmV4dDtcblx0XHRyZXR1cm4gaGVhZENvcHkuY29udGVudDtcblx0fTtcblxuXHR0aGlzLmZyb250ID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLmhlYWQgPyB0aGlzLmhlYWQuY29udGVudCA6IHVuZGVmaW5lZDtcblx0fTtcblxuXHR0aGlzLmlzRW1wdHkgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuaGVhZCA9PSBudWxsO1xuXHR9O1xuXG5cdHRoaXNbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKiAoKSB7XG5cdFx0bGV0IGhlYWQgPSB0aGlzLmhlYWQ7XG5cdFx0d2hpbGUoaGVhZCAhPT0gbnVsbCkge1xuXHRcdFx0eWllbGQgaGVhZC5jb250ZW50O1xuXHRcdFx0aGVhZCA9IGhlYWQubmV4dDtcblx0XHR9XG5cdH0uYmluZCh0aGlzKTtcbn1cblxuUXVldWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuXHRsZXQgc3RyaW5naWZpZWRRdWV1ZSA9ICcnO1xuXHRsZXQgaXRlcmF0b3IgPSB0aGlzLmhlYWQ7XG5cdHdoaWxlIChpdGVyYXRvcikge1xuXHRcdHN0cmluZ2lmaWVkUXVldWUgKz0gYCR7SlNPTi5zdHJpbmdpZnkoaXRlcmF0b3IuY29udGVudCl9IGA7XG5cdFx0aXRlcmF0b3IgPSBpdGVyYXRvci5uZXh0O1xuXHR9XG5cdHJldHVybiBzdHJpbmdpZmllZFF1ZXVlXG59O1xuXG5RdWV1ZS5wcm90b3R5cGUuaW5zcGVjdCA9IFF1ZXVlLnByb3RvdHlwZS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBRdWV1ZTsiLCJcbi8qXG4gICAgUHJlcGFyZSB0aGUgc3RhdGUgb2YgYSBzd2FybSB0byBiZSBzZXJpYWxpc2VkXG4qL1xuXG5leHBvcnRzLmFzSlNPTiA9IGZ1bmN0aW9uKHZhbHVlT2JqZWN0LCBwaGFzZU5hbWUsIGFyZ3MsIGNhbGxiYWNrKXtcblxuICAgICAgICB2YXIgdmFsdWVPYmplY3QgPSB2YWx1ZU9iamVjdC52YWx1ZU9mKCk7XG4gICAgICAgIHZhciByZXMgPSB7fTtcbiAgICAgICAgcmVzLnB1YmxpY1ZhcnMgICAgICAgICAgPSB2YWx1ZU9iamVjdC5wdWJsaWNWYXJzO1xuICAgICAgICByZXMucHJpdmF0ZVZhcnMgICAgICAgICA9IHZhbHVlT2JqZWN0LnByaXZhdGVWYXJzO1xuICAgICAgICByZXMubWV0YSAgICAgICAgICAgICAgICA9IHt9O1xuXG4gICAgICAgIHJlcy5tZXRhLnN3YXJtVHlwZU5hbWUgID0gdmFsdWVPYmplY3QubWV0YS5zd2FybVR5cGVOYW1lO1xuICAgICAgICByZXMubWV0YS5zd2FybUlkICAgICAgICA9IHZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1JZDtcbiAgICAgICAgcmVzLm1ldGEudGFyZ2V0ICAgICAgICAgPSB2YWx1ZU9iamVjdC5tZXRhLnRhcmdldDtcblxuICAgICAgICBpZighcGhhc2VOYW1lKXtcbiAgICAgICAgICAgIHJlcy5tZXRhLmNvbW1hbmQgICAgPSBcInN0b3JlZFwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzLm1ldGEucGhhc2VOYW1lICA9IHBoYXNlTmFtZTtcbiAgICAgICAgICAgIHJlcy5tZXRhLmFyZ3MgICAgICAgPSBhcmdzO1xuICAgICAgICAgICAgcmVzLm1ldGEuY29tbWFuZCAgICA9IHZhbHVlT2JqZWN0Lm1ldGEuY29tbWFuZCB8fCBcImV4ZWN1dGVTd2FybVBoYXNlXCI7XG4gICAgICAgIH1cblxuICAgICAgICByZXMubWV0YS53YWl0U3RhY2sgID0gdmFsdWVPYmplY3QubWV0YS53YWl0U3RhY2s7IC8vVE9ETzogdGhpbmsgaWYgaXMgbm90IGJldHRlciB0byBiZSBkZWVwIGNsb25lZCBhbmQgbm90IHJlZmVyZW5jZWQhISFcblxuICAgICAgICBpZihjYWxsYmFjayl7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJhc0pTT046XCIsIHJlcywgdmFsdWVPYmplY3QpO1xuICAgICAgICByZXR1cm4gcmVzO1xufVxuXG5leHBvcnRzLmpzb25Ub05hdGl2ZSA9IGZ1bmN0aW9uKHNlcmlhbGlzZWRWYWx1ZXMsIHJlc3VsdCl7XG5cbiAgICBmb3IodmFyIHYgaW4gc2VyaWFsaXNlZFZhbHVlcy5wdWJsaWNWYXJzKXtcbiAgICAgICAgcmVzdWx0LnB1YmxpY1ZhcnNbdl0gPSBzZXJpYWxpc2VkVmFsdWVzLnB1YmxpY1ZhcnNbdl07XG5cbiAgICB9O1xuICAgIGZvcih2YXIgdiBpbiBzZXJpYWxpc2VkVmFsdWVzLnByaXZhdGVWYXJzKXtcbiAgICAgICAgcmVzdWx0LnByaXZhdGVWYXJzW3ZdID0gc2VyaWFsaXNlZFZhbHVlcy5wcml2YXRlVmFyc1t2XTtcbiAgICB9O1xuXG4gICAgZm9yKHZhciB2IGluIHNlcmlhbGlzZWRWYWx1ZXMubWV0YSl7XG4gICAgICAgIHJlc3VsdC5tZXRhW3ZdID0gc2VyaWFsaXNlZFZhbHVlcy5tZXRhW3ZdO1xuICAgIH07XG5cbn0iLCIvKlxuSW5pdGlhbCBMaWNlbnNlOiAoYykgQXhpb2xvZ2ljIFJlc2VhcmNoICYgQWxib2FpZSBTw65uaWPEgy5cbkNvbnRyaWJ1dG9yczogQXhpb2xvZ2ljIFJlc2VhcmNoICwgUHJpdmF0ZVNreSBwcm9qZWN0XG5Db2RlIExpY2Vuc2U6IExHUEwgb3IgTUlULlxuKi9cblxuXG4vKipcbiAqICAgVXN1YWxseSBhbiBldmVudCBjb3VsZCBjYXVzZSBleGVjdXRpb24gb2Ygb3RoZXIgY2FsbGJhY2sgZXZlbnRzIC4gV2Ugc2F5IHRoYXQgaXMgYSBsZXZlbCAxIGV2ZW50IGlmIGlzIGNhdXNlZWQgYnkgYSBsZXZlbCAwIGV2ZW50IGFuZCBzbyBvblxuICpcbiAqICAgICAgU291bmRQdWJTdWIgcHJvdmlkZXMgaW50dWl0aXZlIHJlc3VsdHMgcmVnYXJkaW5nIHRvIGFzeW5jaHJvbm91cyBjYWxscyBvZiBjYWxsYmFja3MgYW5kIGNvbXB1dGVkIHZhbHVlcy9leHByZXNzaW9uczpcbiAqICAgd2UgcHJldmVudCBpbW1lZGlhdGUgZXhlY3V0aW9uIG9mIGV2ZW50IGNhbGxiYWNrcyB0byBlbnN1cmUgdGhlIGludHVpdGl2ZSBmaW5hbCByZXN1bHQgaXMgZ3VhcmFudGVlZCBhcyBsZXZlbCAwIGV4ZWN1dGlvblxuICogICB3ZSBndWFyYW50ZWUgdGhhdCBhbnkgY2FsbGJhY2sgZnVuY3Rpb24gaXMgXCJyZS1lbnRyYW50XCJcbiAqICAgd2UgYXJlIGFsc28gdHJ5aW5nIHRvIHJlZHVjZSB0aGUgbnVtYmVyIG9mIGNhbGxiYWNrIGV4ZWN1dGlvbiBieSBsb29raW5nIGluIHF1ZXVlcyBhdCBuZXcgbWVzc2FnZXMgcHVibGlzaGVkIGJ5XG4gKiAgIHRyeWluZyB0byBjb21wYWN0IHRob3NlIG1lc3NhZ2VzIChyZW1vdmluZyBkdXBsaWNhdGUgbWVzc2FnZXMsIG1vZGlmeWluZyBtZXNzYWdlcywgb3IgYWRkaW5nIGluIHRoZSBoaXN0b3J5IG9mIGFub3RoZXIgZXZlbnQgLGV0YylcbiAqXG4gKiAgICAgIEV4YW1wbGUgb2Ygd2hhdCBjYW4gYmUgd3Jvbmcgd2l0aG91dCBub24tc291bmQgYXN5bmNocm9ub3VzIGNhbGxzOlxuXG4gKiAgU3RlcCAwOiBJbml0aWFsIHN0YXRlOlxuICogICBhID0gMDtcbiAqICAgYiA9IDA7XG4gKlxuICogIFN0ZXAgMTogSW5pdGlhbCBvcGVyYXRpb25zOlxuICogICBhID0gMTtcbiAqICAgYiA9IC0xO1xuICpcbiAqICAvLyBhbiBvYnNlcnZlciByZWFjdHMgdG8gY2hhbmdlcyBpbiBhIGFuZCBiIGFuZCBjb21wdXRlIENPUlJFQ1QgbGlrZSB0aGlzOlxuICogICBpZiggYSArIGIgPT0gMCkge1xuICogICAgICAgQ09SUkVDVCA9IGZhbHNlO1xuICogICAgICAgbm90aWZ5KC4uLik7IC8vIGFjdCBvciBzZW5kIGEgbm90aWZpY2F0aW9uIHNvbWV3aGVyZS4uXG4gKiAgIH0gZWxzZSB7XG4gKiAgICAgIENPUlJFQ1QgPSBmYWxzZTtcbiAqICAgfVxuICpcbiAqICAgIE5vdGljZSB0aGF0OiBDT1JSRUNUIHdpbGwgYmUgdHJ1ZSBpbiB0aGUgZW5kICwgYnV0IG1lYW50aW1lLCBhZnRlciBhIG5vdGlmaWNhdGlvbiB3YXMgc2VudCBhbmQgQ09SUkVDVCB3YXMgd3JvbmdseSwgdGVtcG9yYXJpbHkgZmFsc2UhXG4gKiAgICBzb3VuZFB1YlN1YiBndWFyYW50ZWUgdGhhdCB0aGlzIGRvZXMgbm90IGhhcHBlbiBiZWNhdXNlIHRoZSBzeW5jcm9ub3VzIGNhbGwgd2lsbCBiZWZvcmUgYW55IG9ic2VydmVyIChib3QgYXNpZ25hdGlvbiBvbiBhIGFuZCBiKVxuICpcbiAqICAgTW9yZTpcbiAqICAgeW91IGNhbiB1c2UgYmxvY2tDYWxsQmFja3MgYW5kIHJlbGVhc2VDYWxsQmFja3MgaW4gYSBmdW5jdGlvbiB0aGF0IGNoYW5nZSBhIGxvdCBhIGNvbGxlY3Rpb24gb3IgYmluZGFibGUgb2JqZWN0cyBhbmQgYWxsXG4gKiAgIHRoZSBub3RpZmljYXRpb25zIHdpbGwgYmUgc2VudCBjb21wYWN0ZWQgYW5kIHByb3Blcmx5XG4gKi9cblxuLy8gVE9ETzogb3B0aW1pc2F0aW9uIT8gdXNlIGEgbW9yZSBlZmZpY2llbnQgcXVldWUgaW5zdGVhZCBvZiBhcnJheXMgd2l0aCBwdXNoIGFuZCBzaGlmdCE/XG4vLyBUT0RPOiBzZWUgaG93IGJpZyB0aG9zZSBxdWV1ZXMgY2FuIGJlIGluIHJlYWwgYXBwbGljYXRpb25zXG4vLyBmb3IgYSBmZXcgaHVuZHJlZHMgaXRlbXMsIHF1ZXVlcyBtYWRlIGZyb20gYXJyYXkgc2hvdWxkIGJlIGVub3VnaFxuLy8qICAgUG90ZW50aWFsIFRPRE9zOlxuLy8gICAgKiAgICAgcHJldmVudCBhbnkgZm9ybSBvZiBwcm9ibGVtIGJ5IGNhbGxpbmcgY2FsbGJhY2tzIGluIHRoZSBleHBlY3RlZCBvcmRlciAhP1xuLy8qICAgICBwcmV2ZW50aW5nIGluZmluaXRlIGxvb3BzIGV4ZWN1dGlvbiBjYXVzZSBieSBldmVudHMhP1xuLy8qXG4vLypcbi8vIFRPRE86IGRldGVjdCBpbmZpbml0ZSBsb29wcyAob3IgdmVyeSBkZWVwIHByb3BhZ2F0aW9uKSBJdCBpcyBwb3NzaWJsZSE/XG5cbmNvbnN0IFF1ZXVlID0gcmVxdWlyZSgnLi9RdWV1ZScpO1xuXG5mdW5jdGlvbiBTb3VuZFB1YlN1Yigpe1xuXG5cdC8qKlxuXHQgKiBwdWJsaXNoXG5cdCAqICAgICAgUHVibGlzaCBhIG1lc3NhZ2Uge09iamVjdH0gdG8gYSBsaXN0IG9mIHN1YnNjcmliZXJzIG9uIGEgc3BlY2lmaWMgdG9waWNcblx0ICpcblx0ICogQHBhcmFtcyB7U3RyaW5nfE51bWJlcn0gdGFyZ2V0LCAge09iamVjdH0gbWVzc2FnZVxuXHQgKiBAcmV0dXJuIG51bWJlciBvZiBjaGFubmVsIHN1YnNjcmliZXJzIHRoYXQgd2lsbCBiZSBub3RpZmllZFxuXHQgKi9cblx0dGhpcy5wdWJsaXNoID0gZnVuY3Rpb24odGFyZ2V0LCBtZXNzYWdlKXtcblx0XHRpZighaW52YWxpZENoYW5uZWxOYW1lKHRhcmdldCkgJiYgIWludmFsaWRNZXNzYWdlVHlwZShtZXNzYWdlKSAmJiBjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XSAhPSB1bmRlZmluZWQpe1xuXHRcdFx0Y29tcGFjdEFuZFN0b3JlKHRhcmdldCwgbWVzc2FnZSk7XG5cdFx0XHRkaXNwYXRjaE5leHQoKTtcblx0XHRcdHJldHVybiBjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XS5sZW5ndGg7XG5cdFx0fSBlbHNle1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBzdWJzY3JpYmVcblx0ICogICAgICBTdWJzY3JpYmUgLyBhZGQgYSB7RnVuY3Rpb259IGNhbGxCYWNrIG9uIGEge1N0cmluZ3xOdW1iZXJ9dGFyZ2V0IGNoYW5uZWwgc3Vic2NyaWJlcnMgbGlzdCBpbiBvcmRlciB0byByZWNlaXZlXG5cdCAqICAgICAgbWVzc2FnZXMgcHVibGlzaGVkIGlmIHRoZSBjb25kaXRpb25zIGRlZmluZWQgYnkge0Z1bmN0aW9ufXdhaXRGb3JNb3JlIGFuZCB7RnVuY3Rpb259ZmlsdGVyIGFyZSBwYXNzZWQuXG5cdCAqXG5cdCAqIEBwYXJhbXMge1N0cmluZ3xOdW1iZXJ9dGFyZ2V0LCB7RnVuY3Rpb259Y2FsbEJhY2ssIHtGdW5jdGlvbn13YWl0Rm9yTW9yZSwge0Z1bmN0aW9ufWZpbHRlclxuXHQgKlxuXHQgKiAgICAgICAgICB0YXJnZXQgICAgICAtIGNoYW5uZWwgbmFtZSB0byBzdWJzY3JpYmVcblx0ICogICAgICAgICAgY2FsbGJhY2sgICAgLSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiBhIG1lc3NhZ2Ugd2FzIHB1Ymxpc2hlZCBvbiB0aGUgY2hhbm5lbFxuXHQgKiAgICAgICAgICB3YWl0Rm9yTW9yZSAtIGEgaW50ZXJtZWRpYXJ5IGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgYSBzdWNjZXNzZnVseSBtZXNzYWdlIGRlbGl2ZXJ5IGluIG9yZGVyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgICAgICB0byBkZWNpZGUgaWYgYSBuZXcgbWVzc2FnZXMgaXMgZXhwZWN0ZWQuLi5cblx0ICogICAgICAgICAgZmlsdGVyICAgICAgLSBhIGZ1bmN0aW9uIHRoYXQgcmVjZWl2ZXMgdGhlIG1lc3NhZ2UgYmVmb3JlIGludm9jYXRpb24gb2YgY2FsbGJhY2sgZnVuY3Rpb24gaW4gb3JkZXIgdG8gYWxsb3dcblx0ICogICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGV2YW50IG1lc3NhZ2UgYmVmb3JlIGVudGVyaW5nIGluIG5vcm1hbCBjYWxsYmFjayBmbG93XG5cdCAqIEByZXR1cm5cblx0ICovXG5cdHRoaXMuc3Vic2NyaWJlID0gZnVuY3Rpb24odGFyZ2V0LCBjYWxsQmFjaywgd2FpdEZvck1vcmUsIGZpbHRlcil7XG5cdFx0aWYoIWludmFsaWRDaGFubmVsTmFtZSh0YXJnZXQpICYmICFpbnZhbGlkRnVuY3Rpb24oY2FsbEJhY2spKXtcblxuXHRcdFx0dmFyIHN1YnNjcmliZXIgPSB7XCJjYWxsQmFja1wiOmNhbGxCYWNrLCBcIndhaXRGb3JNb3JlXCI6d2FpdEZvck1vcmUsIFwiZmlsdGVyXCI6ZmlsdGVyfTtcblx0XHRcdHZhciBhcnIgPSBjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XTtcblx0XHRcdGlmKGFyciA9PSB1bmRlZmluZWQpe1xuXHRcdFx0XHRhcnIgPSBbXTtcblx0XHRcdFx0Y2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF0gPSBhcnI7XG5cdFx0XHR9XG5cdFx0XHRhcnIucHVzaChzdWJzY3JpYmVyKTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIHVuc3Vic2NyaWJlXG5cdCAqICAgICAgVW5zdWJzY3JpYmUvcmVtb3ZlIHtGdW5jdGlvbn0gY2FsbEJhY2sgZnJvbSB0aGUgbGlzdCBvZiBzdWJzY3JpYmVycyBvZiB0aGUge1N0cmluZ3xOdW1iZXJ9IHRhcmdldCBjaGFubmVsXG5cdCAqXG5cdCAqIEBwYXJhbXMge1N0cmluZ3xOdW1iZXJ9IHRhcmdldCwge0Z1bmN0aW9ufSBjYWxsQmFjaywge0Z1bmN0aW9ufSBmaWx0ZXJcblx0ICpcblx0ICogICAgICAgICAgdGFyZ2V0ICAgICAgLSBjaGFubmVsIG5hbWUgdG8gdW5zdWJzY3JpYmVcblx0ICogICAgICAgICAgY2FsbGJhY2sgICAgLSByZWZlcmVuY2Ugb2YgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHRoYXQgd2FzIHVzZWQgYXMgc3Vic2NyaWJlXG5cdCAqICAgICAgICAgIGZpbHRlciAgICAgIC0gcmVmZXJlbmNlIG9mIHRoZSBvcmlnaW5hbCBmaWx0ZXIgZnVuY3Rpb25cblx0ICogQHJldHVyblxuXHQgKi9cblx0dGhpcy51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKHRhcmdldCwgY2FsbEJhY2ssIGZpbHRlcil7XG5cdFx0aWYoIWludmFsaWRGdW5jdGlvbihjYWxsQmFjaykpe1xuXHRcdFx0dmFyIGdvdGl0ID0gZmFsc2U7XG5cdFx0XHRpZihjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XSl7XG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XS5sZW5ndGg7aSsrKXtcblx0XHRcdFx0XHR2YXIgc3Vic2NyaWJlciA9ICBjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XVtpXTtcblx0XHRcdFx0XHRpZihzdWJzY3JpYmVyLmNhbGxCYWNrID09PSBjYWxsQmFjayAmJiAoZmlsdGVyID09IHVuZGVmaW5lZCB8fCBzdWJzY3JpYmVyLmZpbHRlciA9PT0gZmlsdGVyICkpe1xuXHRcdFx0XHRcdFx0Z290aXQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0c3Vic2NyaWJlci5mb3JEZWxldGUgPSB0cnVlO1xuXHRcdFx0XHRcdFx0c3Vic2NyaWJlci5jYWxsQmFjayA9IG51bGw7XG5cdFx0XHRcdFx0XHRzdWJzY3JpYmVyLmZpbHRlciA9IG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZighZ290aXQpe1xuXHRcdFx0XHR3cHJpbnQoXCJVbmFibGUgdG8gdW5zdWJzY3JpYmUgYSBjYWxsYmFjayB0aGF0IHdhcyBub3Qgc3Vic2NyaWJlZCFcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBibG9ja0NhbGxCYWNrc1xuXHQgKlxuXHQgKiBAcGFyYW1zXG5cdCAqIEByZXR1cm5cblx0ICovXG5cdHRoaXMuYmxvY2tDYWxsQmFja3MgPSBmdW5jdGlvbigpe1xuXHRcdGxldmVsKys7XG5cdH07XG5cblx0LyoqXG5cdCAqIHJlbGVhc2VDYWxsQmFja3Ncblx0ICpcblx0ICogQHBhcmFtc1xuXHQgKiBAcmV0dXJuXG5cdCAqL1xuXHR0aGlzLnJlbGVhc2VDYWxsQmFja3MgPSBmdW5jdGlvbigpe1xuXHRcdGxldmVsLS07XG5cdFx0Ly9oYWNrL29wdGltaXNhdGlvbiB0byBub3QgZmlsbCB0aGUgc3RhY2sgaW4gZXh0cmVtZSBjYXNlcyAobWFueSBldmVudHMgY2F1c2VkIGJ5IGxvb3BzIGluIGNvbGxlY3Rpb25zLGV0Yylcblx0XHR3aGlsZShsZXZlbCA9PSAwICYmIGRpc3BhdGNoTmV4dCh0cnVlKSl7XG5cdFx0XHQvL25vdGhpbmdcblx0XHR9XG5cblx0XHR3aGlsZShsZXZlbCA9PSAwICYmIGNhbGxBZnRlckFsbEV2ZW50cygpKXtcblxuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogYWZ0ZXJBbGxFdmVudHNcblx0ICpcblx0ICogQHBhcmFtcyB7RnVuY3Rpb259IGNhbGxiYWNrXG5cdCAqXG5cdCAqICAgICAgICAgIGNhbGxiYWNrIC0gZnVuY3Rpb24gdGhhdCBuZWVkcyB0byBiZSBpbnZva2VkIG9uY2UgYWxsIGV2ZW50cyBhcmUgZGVsaXZlcmVkXG5cdCAqIEByZXR1cm5cblx0ICovXG5cdHRoaXMuYWZ0ZXJBbGxFdmVudHMgPSBmdW5jdGlvbihjYWxsQmFjayl7XG5cdFx0aWYoIWludmFsaWRGdW5jdGlvbihjYWxsQmFjaykpe1xuXHRcdFx0YWZ0ZXJFdmVudHNDYWxscy5wdXNoKGNhbGxCYWNrKTtcblx0XHR9XG5cdFx0dGhpcy5ibG9ja0NhbGxCYWNrcygpO1xuXHRcdHRoaXMucmVsZWFzZUNhbGxCYWNrcygpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBoYXNDaGFubmVsXG5cdCAqXG5cdCAqIEBwYXJhbXMge1N0cmluZ3xOdW1iZXJ9IGNoYW5uZWxcblx0ICpcblx0ICogICAgICAgICAgY2hhbm5lbCAtIG5hbWUgb2YgdGhlIGNoYW5uZWwgdGhhdCBuZWVkIHRvIGJlIHRlc3RlZCBpZiBwcmVzZW50XG5cdCAqIEByZXR1cm5cblx0ICovXG5cdHRoaXMuaGFzQ2hhbm5lbCA9IGZ1bmN0aW9uKGNoYW5uZWwpe1xuXHRcdHJldHVybiAhaW52YWxpZENoYW5uZWxOYW1lKGNoYW5uZWwpICYmIGNoYW5uZWxTdWJzY3JpYmVyc1tjaGFubmVsXSAhPSB1bmRlZmluZWQgPyB0cnVlIDogZmFsc2U7XG5cdH07XG5cblx0LyoqXG5cdCAqIGFkZENoYW5uZWxcblx0ICpcblx0ICogQHBhcmFtcyB7U3RyaW5nfSBjaGFubmVsXG5cdCAqXG5cdCAqICAgICAgICAgIGNoYW5uZWwgLSBuYW1lIG9mIGEgY2hhbm5lbCB0aGF0IG5lZWRzIHRvIGJlIGNyZWF0ZWQgYW5kIGFkZGVkIHRvIHNvdW5kcHVic3ViIHJlcG9zaXRvcnlcblx0ICogQHJldHVyblxuXHQgKi9cblx0dGhpcy5hZGRDaGFubmVsID0gZnVuY3Rpb24oY2hhbm5lbCl7XG5cdFx0aWYoIWludmFsaWRDaGFubmVsTmFtZShjaGFubmVsKSAmJiAhdGhpcy5oYXNDaGFubmVsKGNoYW5uZWwpKXtcblx0XHRcdGNoYW5uZWxTdWJzY3JpYmVyc1tjaGFubmVsXSA9IFtdO1xuXHRcdH1cblx0fTtcblxuXHQvKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHByb3RlY3RlZCBzdHVmZiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cdHZhciBzZWxmID0gdGhpcztcblx0Ly8gbWFwIGNoYW5uZWxOYW1lIChvYmplY3QgbG9jYWwgaWQpIC0+IGFycmF5IHdpdGggc3Vic2NyaWJlcnNcblx0dmFyIGNoYW5uZWxTdWJzY3JpYmVycyA9IHt9O1xuXG5cdC8vIG1hcCBjaGFubmVsTmFtZSAob2JqZWN0IGxvY2FsIGlkKSAtPiBxdWV1ZSB3aXRoIHdhaXRpbmcgbWVzc2FnZXNcblx0dmFyIGNoYW5uZWxzU3RvcmFnZSA9IHt9O1xuXG5cdC8vIG9iamVjdFxuXHR2YXIgdHlwZUNvbXBhY3RvciA9IHt9O1xuXG5cdC8vIGNoYW5uZWwgbmFtZXNcblx0dmFyIGV4ZWN1dGlvblF1ZXVlID0gbmV3IFF1ZXVlKCk7XG5cdHZhciBsZXZlbCA9IDA7XG5cblxuXG5cdC8qKlxuXHQgKiByZWdpc3RlckNvbXBhY3RvclxuXHQgKlxuXHQgKiAgICAgICBBbiBjb21wYWN0b3IgdGFrZXMgYSBuZXdFdmVudCBhbmQgYW5kIG9sZEV2ZW50IGFuZCByZXR1cm4gdGhlIG9uZSB0aGF0IHN1cnZpdmVzIChvbGRFdmVudCBpZlxuXHQgKiAgaXQgY2FuIGNvbXBhY3QgdGhlIG5ldyBvbmUgb3IgdGhlIG5ld0V2ZW50IGlmIGNhbid0IGJlIGNvbXBhY3RlZClcblx0ICpcblx0ICogQHBhcmFtcyB7U3RyaW5nfSB0eXBlLCB7RnVuY3Rpb259IGNhbGxCYWNrXG5cdCAqXG5cdCAqICAgICAgICAgIHR5cGUgICAgICAgIC0gY2hhbm5lbCBuYW1lIHRvIHVuc3Vic2NyaWJlXG5cdCAqICAgICAgICAgIGNhbGxCYWNrICAgIC0gaGFuZGxlciBmdW5jdGlvbiBmb3IgdGhhdCBzcGVjaWZpYyBldmVudCB0eXBlXG5cdCAqIEByZXR1cm5cblx0ICovXG5cdHRoaXMucmVnaXN0ZXJDb21wYWN0b3IgPSBmdW5jdGlvbih0eXBlLCBjYWxsQmFjaykge1xuXHRcdGlmKCFpbnZhbGlkRnVuY3Rpb24oY2FsbEJhY2spKXtcblx0XHRcdHR5cGVDb21wYWN0b3JbdHlwZV0gPSBjYWxsQmFjaztcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIGRpc3BhdGNoTmV4dFxuXHQgKlxuXHQgKiBAcGFyYW0gZnJvbVJlbGVhc2VDYWxsQmFja3M6IGhhY2sgdG8gcHJldmVudCB0b28gbWFueSByZWN1cnNpdmUgY2FsbHMgb24gcmVsZWFzZUNhbGxCYWNrc1xuXHQgKiBAcmV0dXJuIHtCb29sZWFufVxuXHQgKi9cblx0ZnVuY3Rpb24gZGlzcGF0Y2hOZXh0KGZyb21SZWxlYXNlQ2FsbEJhY2tzKXtcblx0XHRpZihsZXZlbCA+IDApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0bGV0IGNoYW5uZWxOYW1lID0gZXhlY3V0aW9uUXVldWUuZnJvbnQoKTtcblx0XHRpZihjaGFubmVsTmFtZSAhPSB1bmRlZmluZWQpe1xuXHRcdFx0c2VsZi5ibG9ja0NhbGxCYWNrcygpO1xuXHRcdFx0dHJ5e1xuXHRcdFx0XHRsZXQgbWVzc2FnZTtcblx0XHRcdFx0aWYoIWNoYW5uZWxzU3RvcmFnZVtjaGFubmVsTmFtZV0uaXNFbXB0eSgpKSB7XG5cdFx0XHRcdFx0bWVzc2FnZSA9IGNoYW5uZWxzU3RvcmFnZVtjaGFubmVsTmFtZV0uZnJvbnQoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZihtZXNzYWdlID09IHVuZGVmaW5lZCl7XG5cdFx0XHRcdFx0aWYoIWNoYW5uZWxzU3RvcmFnZVtjaGFubmVsTmFtZV0uaXNFbXB0eSgpKXtcblx0XHRcdFx0XHRcdHdwcmludChcIkNhbid0IHVzZSBhcyBtZXNzYWdlIGluIGEgcHViL3N1YiBjaGFubmVsIHRoaXMgb2JqZWN0OiBcIiArIG1lc3NhZ2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRleGVjdXRpb25RdWV1ZS5wb3AoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZihtZXNzYWdlLl9fdHJhbnNtaXNpb25JbmRleCA9PSB1bmRlZmluZWQpe1xuXHRcdFx0XHRcdFx0bWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXggPSAwO1xuXHRcdFx0XHRcdFx0Zm9yKHZhciBpID0gY2hhbm5lbFN1YnNjcmliZXJzW2NoYW5uZWxOYW1lXS5sZW5ndGgtMTsgaSA+PSAwIDsgaS0tKXtcblx0XHRcdFx0XHRcdFx0dmFyIHN1YnNjcmliZXIgPSAgY2hhbm5lbFN1YnNjcmliZXJzW2NoYW5uZWxOYW1lXVtpXTtcblx0XHRcdFx0XHRcdFx0aWYoc3Vic2NyaWJlci5mb3JEZWxldGUgPT0gdHJ1ZSl7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhbm5lbFN1YnNjcmliZXJzW2NoYW5uZWxOYW1lXS5zcGxpY2UoaSwxKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZXtcblx0XHRcdFx0XHRcdG1lc3NhZ2UuX190cmFuc21pc2lvbkluZGV4Kys7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vVE9ETzogZm9yIGltbXV0YWJsZSBvYmplY3RzIGl0IHdpbGwgbm90IHdvcmsgYWxzbywgZml4IGZvciBzaGFwZSBtb2RlbHNcblx0XHRcdFx0XHRpZihtZXNzYWdlLl9fdHJhbnNtaXNpb25JbmRleCA9PSB1bmRlZmluZWQpe1xuXHRcdFx0XHRcdFx0d3ByaW50KFwiQ2FuJ3QgdXNlIGFzIG1lc3NhZ2UgaW4gYSBwdWIvc3ViIGNoYW5uZWwgdGhpcyBvYmplY3Q6IFwiICsgbWVzc2FnZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHZhciBzdWJzY3JpYmVyID0gY2hhbm5lbFN1YnNjcmliZXJzW2NoYW5uZWxOYW1lXVttZXNzYWdlLl9fdHJhbnNtaXNpb25JbmRleF07XG5cdFx0XHRcdFx0aWYoc3Vic2NyaWJlciA9PSB1bmRlZmluZWQpe1xuXHRcdFx0XHRcdFx0ZGVsZXRlIG1lc3NhZ2UuX190cmFuc21pc2lvbkluZGV4O1xuXHRcdFx0XHRcdFx0Y2hhbm5lbHNTdG9yYWdlW2NoYW5uZWxOYW1lXS5wb3AoKTtcblx0XHRcdFx0XHR9IGVsc2V7XG5cdFx0XHRcdFx0XHRpZihzdWJzY3JpYmVyLmZpbHRlciA9PSB1bmRlZmluZWQgfHwgKCFpbnZhbGlkRnVuY3Rpb24oc3Vic2NyaWJlci5maWx0ZXIpICYmIHN1YnNjcmliZXIuZmlsdGVyKG1lc3NhZ2UpKSl7XG5cdFx0XHRcdFx0XHRcdGlmKCFzdWJzY3JpYmVyLmZvckRlbGV0ZSl7XG5cdFx0XHRcdFx0XHRcdFx0c3Vic2NyaWJlci5jYWxsQmFjayhtZXNzYWdlKTtcblx0XHRcdFx0XHRcdFx0XHRpZihzdWJzY3JpYmVyLndhaXRGb3JNb3JlICYmICFpbnZhbGlkRnVuY3Rpb24oc3Vic2NyaWJlci53YWl0Rm9yTW9yZSkgJiZcblx0XHRcdFx0XHRcdFx0XHRcdCFzdWJzY3JpYmVyLndhaXRGb3JNb3JlKG1lc3NhZ2UpKXtcblxuXHRcdFx0XHRcdFx0XHRcdFx0c3Vic2NyaWJlci5mb3JEZWxldGUgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaChlcnIpe1xuXHRcdFx0XHR3cHJpbnQoXCJFdmVudCBjYWxsYmFjayBmYWlsZWQ6IFwiKyBzdWJzY3JpYmVyLmNhbGxCYWNrICtcImVycm9yOiBcIiArIGVyci5zdGFjayk7XG5cdFx0XHR9XG5cdFx0XHQvL1xuXHRcdFx0aWYoZnJvbVJlbGVhc2VDYWxsQmFja3Mpe1xuXHRcdFx0XHRsZXZlbC0tO1xuXHRcdFx0fSBlbHNle1xuXHRcdFx0XHRzZWxmLnJlbGVhc2VDYWxsQmFja3MoKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0gZWxzZXtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBjb21wYWN0QW5kU3RvcmUodGFyZ2V0LCBtZXNzYWdlKXtcblx0XHR2YXIgZ290Q29tcGFjdGVkID0gZmFsc2U7XG5cdFx0dmFyIGFyciA9IGNoYW5uZWxzU3RvcmFnZVt0YXJnZXRdO1xuXHRcdGlmKGFyciA9PSB1bmRlZmluZWQpe1xuXHRcdFx0YXJyID0gbmV3IFF1ZXVlKCk7XG5cdFx0XHRjaGFubmVsc1N0b3JhZ2VbdGFyZ2V0XSA9IGFycjtcblx0XHR9XG5cblx0XHRpZihtZXNzYWdlICYmIG1lc3NhZ2UudHlwZSAhPSB1bmRlZmluZWQpe1xuXHRcdFx0dmFyIHR5cGVDb21wYWN0b3JDYWxsQmFjayA9IHR5cGVDb21wYWN0b3JbbWVzc2FnZS50eXBlXTtcblxuXHRcdFx0aWYodHlwZUNvbXBhY3RvckNhbGxCYWNrICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRcdGZvcihsZXQgY2hhbm5lbCBvZiBhcnIpIHtcblx0XHRcdFx0XHRpZih0eXBlQ29tcGFjdG9yQ2FsbEJhY2sobWVzc2FnZSwgY2hhbm5lbCkgPT09IGNoYW5uZWwpIHtcblx0XHRcdFx0XHRcdGlmKGNoYW5uZWwuX190cmFuc21pc2lvbkluZGV4ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0Z290Q29tcGFjdGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYoIWdvdENvbXBhY3RlZCAmJiBtZXNzYWdlKXtcblx0XHRcdGFyci5wdXNoKG1lc3NhZ2UpO1xuXHRcdFx0ZXhlY3V0aW9uUXVldWUucHVzaCh0YXJnZXQpO1xuXHRcdH1cblx0fVxuXG5cdHZhciBhZnRlckV2ZW50c0NhbGxzID0gbmV3IFF1ZXVlKCk7XG5cdGZ1bmN0aW9uIGNhbGxBZnRlckFsbEV2ZW50cyAoKXtcblx0XHRpZighYWZ0ZXJFdmVudHNDYWxscy5pc0VtcHR5KCkpe1xuXHRcdFx0dmFyIGNhbGxCYWNrID0gYWZ0ZXJFdmVudHNDYWxscy5wb3AoKTtcblx0XHRcdC8vZG8gbm90IGNhdGNoIGV4Y2VwdGlvbnMgaGVyZS4uXG5cdFx0XHRjYWxsQmFjaygpO1xuXHRcdH1cblx0XHRyZXR1cm4gIWFmdGVyRXZlbnRzQ2FsbHMuaXNFbXB0eSgpO1xuXHR9XG5cblx0ZnVuY3Rpb24gaW52YWxpZENoYW5uZWxOYW1lKG5hbWUpe1xuXHRcdHZhciByZXN1bHQgPSBmYWxzZTtcblx0XHRpZighbmFtZSB8fCAodHlwZW9mIG5hbWUgIT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgbmFtZSAhPSBcIm51bWJlclwiKSl7XG5cdFx0XHRyZXN1bHQgPSB0cnVlO1xuXHRcdFx0d3ByaW50KFwiSW52YWxpZCBjaGFubmVsIG5hbWU6IFwiICsgbmFtZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdGZ1bmN0aW9uIGludmFsaWRNZXNzYWdlVHlwZShtZXNzYWdlKXtcblx0XHR2YXIgcmVzdWx0ID0gZmFsc2U7XG5cdFx0aWYoIW1lc3NhZ2UgfHwgdHlwZW9mIG1lc3NhZ2UgIT0gXCJvYmplY3RcIil7XG5cdFx0XHRyZXN1bHQgPSB0cnVlO1xuXHRcdFx0d3ByaW50KFwiSW52YWxpZCBtZXNzYWdlcyB0eXBlczogXCIgKyBtZXNzYWdlKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdGZ1bmN0aW9uIGludmFsaWRGdW5jdGlvbihjYWxsYmFjayl7XG5cdFx0dmFyIHJlc3VsdCA9IGZhbHNlO1xuXHRcdGlmKCFjYWxsYmFjayB8fCB0eXBlb2YgY2FsbGJhY2sgIT0gXCJmdW5jdGlvblwiKXtcblx0XHRcdHJlc3VsdCA9IHRydWU7XG5cdFx0XHR3cHJpbnQoXCJFeHBlY3RlZCB0byBiZSBmdW5jdGlvbiBidXQgaXM6IFwiICsgY2FsbGJhY2spO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG59XG5cbmV4cG9ydHMuc291bmRQdWJTdWIgPSBuZXcgU291bmRQdWJTdWIoKTsiLCJcbi8vdmFyIHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcblxuZnVuY3Rpb24gZGVmYXVsdEVycm9ySGFuZGxpbmdJbXBsZW1lbnRhdGlvbihlcnIsIHJlcyl7XG5cdC8vY29uc29sZS5sb2coZXJyLnN0YWNrKTtcblx0aWYoZXJyKSB0aHJvdyBlcnI7XG5cdHJldHVybiByZXM7XG59XG5cblxuJCQuZXJyb3JIYW5kbGVyID0ge1xuICAgICAgICBlcnJvcjpmdW5jdGlvbihlcnIsIGFyZ3MsIG1zZyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIsIFwiVW5rbm93biBlcnJvciBmcm9tIGZ1bmN0aW9uIGNhbGwgd2l0aCBhcmd1bWVudHM6XCIsIGFyZ3MsIFwiTWVzc2FnZTpcIiwgbXNnKTtcbiAgICAgICAgfSxcbiAgICAgICAgdGhyb3dFcnJvcjpmdW5jdGlvbihlcnIsIGFyZ3MsIG1zZyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIsIFwiVW5rbm93biBlcnJvciBmcm9tIGZ1bmN0aW9uIGNhbGwgd2l0aCBhcmd1bWVudHM6XCIsIGFyZ3MsIFwiTWVzc2FnZTpcIiwgbXNnKTtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSxcbiAgICAgICAgaWdub3JlUG9zc2libGVFcnJvcjogZnVuY3Rpb24obmFtZSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhuYW1lKTtcbiAgICAgICAgfSxcbiAgICAgICAgc3ludGF4RXJyb3I6ZnVuY3Rpb24ocHJvcGVydHksIHN3YXJtLCB0ZXh0KXtcbiAgICAgICAgICAgIC8vdGhyb3cgbmV3IEVycm9yKFwiTWlzc3BlbGxlZCBtZW1iZXIgbmFtZSBvciBvdGhlciBpbnRlcm5hbCBlcnJvciFcIik7XG4gICAgICAgICAgICB2YXIgc3dhcm1OYW1lO1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBzd2FybSA9PSBcInN0cmluZ1wiKXtcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1OYW1lID0gc3dhcm07XG4gICAgICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgaWYoc3dhcm0gJiYgc3dhcm0ubWV0YSl7XG4gICAgICAgICAgICAgICAgICAgIHN3YXJtTmFtZSAgPSBzd2FybS5tZXRhLnN3YXJtVHlwZU5hbWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1OYW1lID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpLm1ldGEuc3dhcm1UeXBlTmFtZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgc3dhcm1OYW1lID0gZXJyLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihwcm9wZXJ0eSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJXcm9uZyBtZW1iZXIgbmFtZSBcIiwgcHJvcGVydHksICBcIiBpbiBzd2FybSBcIiwgc3dhcm1OYW1lKTtcbiAgICAgICAgICAgICAgICBpZih0ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRleHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbmtub3duIHN3YXJtXCIsIHN3YXJtTmFtZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcbiAgICAgICAgd2FybmluZzpmdW5jdGlvbihtc2cpe1xuICAgICAgICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiQkLnVpZEdlbmVyYXRvciA9IHJlcXVpcmUoXCIuL2xpYi9zYWZlLXV1aWRcIik7XG5cbiQkLnNhZmVFcnJvckhhbmRsaW5nID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuICAgICAgICBpZihjYWxsYmFjayl7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2s7XG4gICAgICAgIH0gZWxzZXtcbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0RXJyb3JIYW5kbGluZ0ltcGxlbWVudGF0aW9uO1xuICAgICAgICB9XG4gICAgfTtcblxuJCQuX19pbnRlcm4gPSB7XG4gICAgICAgIG1rQXJnczpmdW5jdGlvbihhcmdzLHBvcyl7XG4gICAgICAgICAgICB2YXIgYXJnc0FycmF5ID0gW107XG4gICAgICAgICAgICBmb3IodmFyIGkgPSBwb3M7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICBhcmdzQXJyYXkucHVzaChhcmdzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhcmdzQXJyYXk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5yZXF1aXJlKFwiLi9saWIvb3ZlcndyaXRlUmVxdWlyZVwiKTtcblxudmFyIHN3YXJtVXRpbHMgPSByZXF1aXJlKFwiLi9saWIvY2hvcmVvZ3JhcGhpZXMvdXRpbGl0eUZ1bmN0aW9ucy9zd2FybVwiKTtcblxuJCQuZGVmYXVsdEVycm9ySGFuZGxpbmdJbXBsZW1lbnRhdGlvbiA9IGRlZmF1bHRFcnJvckhhbmRsaW5nSW1wbGVtZW50YXRpb247XG5cbnZhciBjYWxsZmxvd01vZHVsZSA9IHJlcXVpcmUoXCIuL2xpYi9zd2FybURlc2NyaXB0aW9uXCIpO1xuJCQuY2FsbGZsb3dzICAgICAgICA9IGNhbGxmbG93TW9kdWxlLmNyZWF0ZVN3YXJtRW5naW5lKFwiY2FsbGZsb3dcIik7XG4kJC5jYWxsZmxvdyAgICAgICAgID0gJCQuY2FsbGZsb3dzO1xuJCQuZmxvdyAgICAgICAgICAgICA9ICQkLmNhbGxmbG93cztcbiQkLmZsb3dzICAgICAgICAgICAgPSAkJC5jYWxsZmxvd3M7XG5cbiQkLnN3YXJtcyAgICAgICAgICAgPSBjYWxsZmxvd01vZHVsZS5jcmVhdGVTd2FybUVuZ2luZShcInN3YXJtXCIsIHN3YXJtVXRpbHMpO1xuJCQuc3dhcm0gICAgICAgICAgICA9ICQkLnN3YXJtcztcbiQkLmNvbnRyYWN0cyAgICAgICAgPSBjYWxsZmxvd01vZHVsZS5jcmVhdGVTd2FybUVuZ2luZShcImNvbnRyYWN0XCIsIHN3YXJtVXRpbHMpO1xuJCQuY29udHJhY3QgICAgICAgICA9ICQkLmNvbnRyYWN0cztcblxuXG4kJC5QU0tfUHViU3ViID0gcmVxdWlyZShcInNvdW5kcHVic3ViXCIpLnNvdW5kUHViU3ViO1xuXG4kJC5zZWN1cml0eUNvbnRleHQgPSBcInN5c3RlbVwiO1xuJCQubGlicmFyeVByZWZpeCA9IFwiZ2xvYmFsXCI7XG4kJC5saWJyYXJpZXMgPSB7XG4gICAgZ2xvYmFsOntcblxuICAgIH1cbn07XG5cblxuXG4kJC5sb2FkTGlicmFyeSA9IHJlcXVpcmUoXCIuL2xpYi9sb2FkTGlicmFyeVwiKS5sb2FkTGlicmFyeTtcblxucmVxdWlyZUxpYnJhcnkgPSBmdW5jdGlvbihuYW1lKXtcbiAgICAvL3ZhciBhYnNvbHV0ZVBhdGggPSBwYXRoLnJlc29sdmUoICAkJC5fX2dsb2JhbC5fX2xvYWRMaWJyYXJ5Um9vdCArIG5hbWUpO1xuICAgIHJldHVybiAkJC5sb2FkTGlicmFyeShuYW1lLG5hbWUpO1xufTtcblxuJCQucmVnaXN0ZXJTd2FybURlc2NyaXB0aW9uID0gIGZ1bmN0aW9uKGxpYnJhcnlOYW1lLHNob3J0TmFtZSwgZGVzY3JpcHRpb24pe1xuICAgIGlmKCEkJC5saWJyYXJpZXNbbGlicmFyeU5hbWVdKXtcbiAgICAgICAgJCQubGlicmFyaWVzW2xpYnJhcnlOYW1lXSA9IHt9O1xuICAgIH1cbiAgICAkJC5saWJyYXJpZXNbbGlicmFyeU5hbWVdW3Nob3J0TmFtZV0gPSBkZXNjcmlwdGlvbjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgXHRcdFx0XHRjcmVhdGVTd2FybUVuZ2luZTogcmVxdWlyZShcIi4vbGliL3N3YXJtRGVzY3JpcHRpb25cIikuY3JlYXRlU3dhcm1FbmdpbmUsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUpvaW5Qb2ludDogcmVxdWlyZShcIi4vbGliL3BhcmFsbGVsSm9pblBvaW50XCIpLmNyZWF0ZUpvaW5Qb2ludCxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlU2VyaWFsSm9pblBvaW50OiByZXF1aXJlKFwiLi9saWIvc2VyaWFsSm9pblBvaW50XCIpLmNyZWF0ZVNlcmlhbEpvaW5Qb2ludCxcblx0XHRcdFx0XHRcInNhZmUtdXVpZFwiOiByZXF1aXJlKFwiLi9saWIvc2FmZS11dWlkXCIpLFxuICAgICAgICAgICAgICAgICAgICBzd2FybUluc3RhbmNlTWFuYWdlcjogcmVxdWlyZShcIi4vbGliL2Nob3Jlb2dyYXBoaWVzL3N3YXJtSW5zdGFuY2VzTWFuYWdlclwiKVxuXHRcdFx0XHR9OyIsImlmKHR5cGVvZiBzaW5nbGV0b25fY29udGFpbmVyX21vZHVsZV93b3JrYXJvdW5kX2Zvcl93aXJlZF9ub2RlX2pzX2NhY2hpbmcgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzaW5nbGV0b25fY29udGFpbmVyX21vZHVsZV93b3JrYXJvdW5kX2Zvcl93aXJlZF9ub2RlX2pzX2NhY2hpbmcgICA9IG1vZHVsZTtcbn0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzaW5nbGV0b25fY29udGFpbmVyX21vZHVsZV93b3JrYXJvdW5kX2Zvcl93aXJlZF9ub2RlX2pzX2NhY2hpbmcgLmV4cG9ydHM7XG4gICAgcmV0dXJuIG1vZHVsZTtcbn1cblxuLyoqXG4gKiBDcmVhdGVkIGJ5IHNhbGJvYWllIG9uIDQvMjcvMTUuXG4gKi9cbmZ1bmN0aW9uIENvbnRhaW5lcihlcnJvckhhbmRsZXIpe1xuICAgIHZhciB0aGluZ3MgPSB7fTsgICAgICAgIC8vdGhlIGFjdHVhbCB2YWx1ZXMgZm9yIG91ciBzZXJ2aWNlcywgdGhpbmdzXG4gICAgdmFyIGltbWVkaWF0ZSA9IHt9OyAgICAgLy9ob3cgZGVwZW5kZW5jaWVzIHdlcmUgZGVjbGFyZWRcbiAgICB2YXIgY2FsbGJhY2tzID0ge307ICAgICAvL2NhbGxiYWNrIHRoYXQgc2hvdWxkIGJlIGNhbGxlZCBmb3IgZWFjaCBkZXBlbmRlbmN5IGRlY2xhcmF0aW9uXG4gICAgdmFyIGRlcHNDb3VudGVyID0ge307ICAgLy9jb3VudCBkZXBlbmRlbmNpZXNcbiAgICB2YXIgcmV2ZXJzZWRUcmVlID0ge307ICAvL3JldmVyc2VkIGRlcGVuZGVuY2llcywgb3Bwb3NpdGUgb2YgaW1tZWRpYXRlIG9iamVjdFxuXG4gICAgIHRoaXMuZHVtcCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcIkNvbmF0aW5lciBkdW1wXFxuIFRoaW5nczpcIiwgdGhpbmdzLCBcIlxcbkRlcHMgY291bnRlcjogXCIsIGRlcHNDb3VudGVyLCBcIlxcblN0cmlnaHQ6XCIsIGltbWVkaWF0ZSwgXCJcXG5SZXZlcnNlZDpcIiwgcmV2ZXJzZWRUcmVlKTtcbiAgICAgfVxuXG4gICAgZnVuY3Rpb24gaW5jQ291bnRlcihuYW1lKXtcbiAgICAgICAgaWYoIWRlcHNDb3VudGVyW25hbWVdKXtcbiAgICAgICAgICAgIGRlcHNDb3VudGVyW25hbWVdID0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlcHNDb3VudGVyW25hbWVdKys7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnNlcnREZXBlbmRlbmN5aW5SVChub2RlTmFtZSwgZGVwZW5kZW5jaWVzKXtcbiAgICAgICAgZGVwZW5kZW5jaWVzLmZvckVhY2goZnVuY3Rpb24oaXRlbU5hbWUpe1xuICAgICAgICAgICAgdmFyIGwgPSByZXZlcnNlZFRyZWVbaXRlbU5hbWVdO1xuICAgICAgICAgICAgaWYoIWwpe1xuICAgICAgICAgICAgICAgIGwgPSByZXZlcnNlZFRyZWVbaXRlbU5hbWVdID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsW25vZGVOYW1lXSA9IG5vZGVOYW1lO1xuICAgICAgICB9KVxuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gZGlzY292ZXJVcE5vZGVzKG5vZGVOYW1lKXtcbiAgICAgICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgICAgIGZ1bmN0aW9uIERGUyhubil7XG4gICAgICAgICAgICB2YXIgbCA9IHJldmVyc2VkVHJlZVtubl07XG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gbCl7XG4gICAgICAgICAgICAgICAgaWYoIXJlc1tpXSl7XG4gICAgICAgICAgICAgICAgICAgIHJlc1tpXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIERGUyhpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBERlMobm9kZU5hbWUpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMocmVzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNldENvdW50ZXIobmFtZSl7XG4gICAgICAgIHZhciBkZXBlbmRlbmN5QXJyYXkgPSBpbW1lZGlhdGVbbmFtZV07XG4gICAgICAgIHZhciBjb3VudGVyID0gMDtcbiAgICAgICAgaWYoZGVwZW5kZW5jeUFycmF5KXtcbiAgICAgICAgICAgIGRlcGVuZGVuY3lBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGRlcCl7XG4gICAgICAgICAgICAgICAgaWYodGhpbmdzW2RlcF0gPT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgIGluY0NvdW50ZXIobmFtZSlcbiAgICAgICAgICAgICAgICAgICAgY291bnRlcisrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgZGVwc0NvdW50ZXJbbmFtZV0gPSBjb3VudGVyO1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiQ291bnRlciBmb3IgXCIsIG5hbWUsICcgaXMgJywgY291bnRlcik7XG4gICAgICAgIHJldHVybiBjb3VudGVyO1xuICAgIH1cblxuICAgIC8qIHJldHVybnMgdGhvc2UgdGhhdCBhcmUgcmVhZHkgdG8gYmUgcmVzb2x2ZWQqL1xuICAgIGZ1bmN0aW9uIHJlc2V0VXBDb3VudGVycyhuYW1lKXtcbiAgICAgICAgdmFyIHJldCA9IFtdO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdSZXNldGluZyB1cCBjb3VudGVycyBmb3IgJywgbmFtZSwgXCJSZXZlcnNlOlwiLCByZXZlcnNlZFRyZWVbbmFtZV0pO1xuICAgICAgICB2YXIgdXBzID0gcmV2ZXJzZWRUcmVlW25hbWVdO1xuICAgICAgICBmb3IodmFyIHYgaW4gdXBzKXtcbiAgICAgICAgICAgIGlmKHJlc2V0Q291bnRlcih2KSA9PSAwKXtcbiAgICAgICAgICAgICAgICByZXQucHVzaCh2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIC8qXG4gICAgICAgICBUaGUgZmlyc3QgYXJndW1lbnQgaXMgYSBuYW1lIGZvciBhIHNlcnZpY2UsIHZhcmlhYmxlLGEgIHRoaW5nIHRoYXQgc2hvdWxkIGJlIGluaXRpYWxpc2VkLCByZWNyZWF0ZWQsIGV0Y1xuICAgICAgICAgVGhlIHNlY29uZCBhcmd1bWVudCBpcyBhbiBhcnJheSB3aXRoIGRlcGVuZGVuY2llc1xuICAgICAgICAgdGhlIGxhc3QgYXJndW1lbnQgaXMgYSBmdW5jdGlvbihlcnIsLi4uKSB0aGF0IGlzIGNhbGxlZCB3aGVuIGRlcGVuZGVuY2llcyBhcmUgcmVhZHkgb3IgcmVjYWxsZWQgd2hlbiBhcmUgbm90IHJlYWR5IChzdG9wIHdhcyBjYWxsZWQpXG4gICAgICAgICBJZiBlcnIgaXMgbm90IHVuZGVmaW5lZCBpdCBtZWFucyB0aGF0IG9uZSBvciBhbnkgdW5kZWZpbmVkIHZhcmlhYmxlcyBhcmUgbm90IHJlYWR5IGFuZCB0aGUgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgYWdhaW4gbGF0ZXJcbiAgICAgICAgIEFsbCB0aGUgb3RoZXIgYXJndW1lbnRzIGFyZSB0aGUgY29ycmVzcG9uZGluZyBhcmd1bWVudHMgb2YgdGhlIGNhbGxiYWNrIHdpbGwgYmUgdGhlIGFjdHVhbCB2YWx1ZXMgb2YgdGhlIGNvcnJlc3BvbmRpbmcgZGVwZW5kZW5jeVxuICAgICAgICAgVGhlIGNhbGxiYWNrIGZ1bmN0aW9ucyBzaG91bGQgcmV0dXJuIHRoZSBjdXJyZW50IHZhbHVlIChvciBudWxsKVxuICAgICAqL1xuICAgIHRoaXMuZGVjbGFyZURlcGVuZGVuY3kgPSBmdW5jdGlvbihuYW1lLCBkZXBlbmRlbmN5QXJyYXksIGNhbGxiYWNrKXtcbiAgICAgICAgaWYoY2FsbGJhY2tzW25hbWVdKXtcbiAgICAgICAgICAgIGVycm9ySGFuZGxlci5pZ25vcmVQb3NzaWJsZUVycm9yKFwiRHVwbGljYXRlIGRlcGVuZGVuY3k6XCIgKyBuYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrc1tuYW1lXSA9IGNhbGxiYWNrO1xuICAgICAgICAgICAgaW1tZWRpYXRlW25hbWVdICAgPSBkZXBlbmRlbmN5QXJyYXk7XG4gICAgICAgICAgICBpbnNlcnREZXBlbmRlbmN5aW5SVChuYW1lLCBkZXBlbmRlbmN5QXJyYXkpO1xuICAgICAgICAgICAgdGhpbmdzW25hbWVdID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB1bnNhdGlzZmllZENvdW50ZXIgPSByZXNldENvdW50ZXIobmFtZSk7XG4gICAgICAgIGlmKHVuc2F0aXNmaWVkQ291bnRlciA9PSAwICl7XG4gICAgICAgICAgICBjYWxsRm9yVGhpbmcobmFtZSwgZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbEZvclRoaW5nKG5hbWUsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKlxuICAgICAgICBjcmVhdGUgYSBzZXJ2aWNlXG4gICAgICovXG4gICAgdGhpcy5zZXJ2aWNlID0gZnVuY3Rpb24obmFtZSwgZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcil7XG4gICAgICAgIHRoaXMuZGVjbGFyZURlcGVuZGVuY3kobmFtZSwgZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcik7XG4gICAgfVxuXG5cbiAgICB2YXIgc3Vic3lzdGVtQ291bnRlciA9IDA7XG4gICAgLypcbiAgICAgY3JlYXRlIGEgYW5vbnltb3VzIHN1YnN5c3RlbVxuICAgICAqL1xuICAgIHRoaXMuc3Vic3lzdGVtID0gZnVuY3Rpb24oZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcil7XG4gICAgICAgIHN1YnN5c3RlbUNvdW50ZXIrKztcbiAgICAgICAgdGhpcy5kZWNsYXJlRGVwZW5kZW5jeShcImRpY29udGFpbmVyX3N1YnN5c3RlbV9wbGFjZWhvbGRlclwiICsgc3Vic3lzdGVtQ291bnRlciwgZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcik7XG4gICAgfVxuXG4gICAgLyogbm90IGRvY3VtZW50ZWQuLiBsaW1ibyBzdGF0ZSovXG4gICAgdGhpcy5mYWN0b3J5ID0gZnVuY3Rpb24obmFtZSwgZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcil7XG4gICAgICAgIHRoaXMuZGVjbGFyZURlcGVuZGVuY3kobmFtZSwgZGVwZW5kZW5jeUFycmF5LCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb25zdHJ1Y3RvcigpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGxGb3JUaGluZyhuYW1lLCBvdXRPZlNlcnZpY2Upe1xuICAgICAgICB2YXIgYXJncyA9IGltbWVkaWF0ZVtuYW1lXS5tYXAoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICByZXR1cm4gdGhpbmdzW2l0ZW1dO1xuICAgICAgICB9KTtcbiAgICAgICAgYXJncy51bnNoaWZ0KG91dE9mU2VydmljZSk7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGNhbGxiYWNrc1tuYW1lXS5hcHBseSh7fSxhcmdzKTtcbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgZXJyb3JIYW5kbGVyLnRocm93RXJyb3IoZXJyKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYob3V0T2ZTZXJ2aWNlIHx8IHZhbHVlPT09bnVsbCl7ICAgLy9lbmFibGUgcmV0dXJuaW5nIGEgdGVtcG9yYXJ5IGRlcGVuZGVuY3kgcmVzb2x1dGlvbiFcbiAgICAgICAgICAgIGlmKHRoaW5nc1tuYW1lXSl7XG4gICAgICAgICAgICAgICAgdGhpbmdzW25hbWVdID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZXNldFVwQ291bnRlcnMobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiU3VjY2VzcyByZXNvbHZpbmcgXCIsIG5hbWUsIFwiOlwiLCB2YWx1ZSwgXCJPdGhlciByZWFkeTpcIiwgb3RoZXJSZWFkeSk7XG4gICAgICAgICAgICBpZighdmFsdWUpe1xuICAgICAgICAgICAgICAgIHZhbHVlID0gIHtcInBsYWNlaG9sZGVyXCI6IG5hbWV9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpbmdzW25hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICB2YXIgb3RoZXJSZWFkeSA9IHJlc2V0VXBDb3VudGVycyhuYW1lKTtcbiAgICAgICAgICAgIG90aGVyUmVhZHkuZm9yRWFjaChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICAgICAgICBjYWxsRm9yVGhpbmcoaXRlbSwgZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgICAgICBEZWNsYXJlIHRoYXQgYSBuYW1lIGlzIHJlYWR5LCByZXNvbHZlZCBhbmQgc2hvdWxkIHRyeSB0byByZXNvbHZlIGFsbCBvdGhlciB3YWl0aW5nIGZvciBpdFxuICAgICAqL1xuICAgIHRoaXMucmVzb2x2ZSAgICA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKXtcbiAgICAgICAgdGhpbmdzW25hbWVdID0gdmFsdWU7XG4gICAgICAgIHZhciBvdGhlclJlYWR5ID0gcmVzZXRVcENvdW50ZXJzKG5hbWUpO1xuXG4gICAgICAgIG90aGVyUmVhZHkuZm9yRWFjaChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICAgIGNhbGxGb3JUaGluZyhpdGVtLCBmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cblxuXG4gICAgdGhpcy5pbnN0YW5jZUZhY3RvcnkgPSBmdW5jdGlvbihuYW1lLCBkZXBlbmRlbmN5QXJyYXksIGNvbnN0cnVjdG9yKXtcbiAgICAgICAgZXJyb3JIYW5kbGVyLm5vdEltcGxlbWVudGVkKFwiaW5zdGFuY2VGYWN0b3J5IGlzIHBsYW5uZWQgYnV0IG5vdCBpbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAgICBEZWNsYXJlIHRoYXQgYSBzZXJ2aWNlIG9yIGZlYXR1cmUgaXMgbm90IHdvcmtpbmcgcHJvcGVybHkuIEFsbCBzZXJ2aWNlcyBkZXBlbmRpbmcgb24gdGhpcyB3aWxsIGdldCBub3RpZmllZFxuICAgICAqL1xuICAgIHRoaXMub3V0T2ZTZXJ2aWNlICAgID0gZnVuY3Rpb24obmFtZSl7XG4gICAgICAgIHRoaW5nc1tuYW1lXSA9IG51bGw7XG4gICAgICAgIHZhciB1cE5vZGVzID0gZGlzY292ZXJVcE5vZGVzKG5hbWUpO1xuICAgICAgICB1cE5vZGVzLmZvckVhY2goZnVuY3Rpb24obm9kZSl7XG4gICAgICAgICAgICB0aGluZ3NbbmFtZV0gPSBudWxsO1xuICAgICAgICAgICAgY2FsbEZvclRoaW5nKG5vZGUsIHRydWUpO1xuICAgICAgICB9KVxuICAgIH1cbn1cblxuXG5leHBvcnRzLm5ld0NvbnRhaW5lciAgICA9IGZ1bmN0aW9uKGNoZWNrc0xpYnJhcnkpe1xuICAgIHJldHVybiBuZXcgQ29udGFpbmVyKGNoZWNrc0xpYnJhcnkpO1xufVxuXG4vL2V4cG9ydHMuY29udGFpbmVyID0gbmV3IENvbnRhaW5lcigkJC5lcnJvckhhbmRsZXIpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdFx0XHRcdFx0YmVlc0hlYWxlcjogcmVxdWlyZShcIi4vbGliL2JlZXNIZWFsZXJcIiksXG5cdFx0XHRcdFx0c291bmRQdWJTdWI6IHJlcXVpcmUoXCIuL2xpYi9zb3VuZFB1YlN1YlwiKS5zb3VuZFB1YlN1YlxuXHRcdFx0XHRcdC8vZm9sZGVyTVE6IHJlcXVpcmUoXCIuL2xpYi9mb2xkZXJNUVwiKVxufTsiXX0=
