browserifyRequire=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"C:\\work\\PrivateSky\\privatesky\\engine\\pskbuildtemp\\nodeShims.js":[function(require,module,exports){
;$$.__runtimeModules["assert"] = require("assert");
$$.__runtimeModules["crypto"] = require("crypto");
$$.__runtimeModules["zlib"] = require("zlib");
$$.__runtimeModules["util"] = require("util");
$$.__runtimeModules["path"] = require("path");

},{"assert":"assert","crypto":"crypto","path":"path","util":"util","zlib":"zlib"}],"C:\\work\\PrivateSky\\privatesky\\engine\\pskbuildtemp\\pskModules.js":[function(require,module,exports){
;$$.__runtimeModules["soundpubsub"] = require("soundpubsub");
$$.__runtimeModules["callflow"] = require("callflow");
$$.__runtimeModules["dicontainer"] = require("dicontainer");
$$.__runtimeModules["signsensus"] = require("signsensus");

},{"callflow":"callflow","dicontainer":"C:\\work\\PrivateSky\\privatesky\\modules\\dicontainer\\lib\\container.js","signsensus":"C:\\work\\PrivateSky\\privatesky\\modules\\signsensus\\lib\\index.js","soundpubsub":"C:\\work\\PrivateSky\\privatesky\\modules\\soundpubsub\\index.js"}],"C:\\work\\PrivateSky\\privatesky\\engine\\pskbuildtemp\\pskruntime.js":[function(require,module,exports){
if(typeof(global) == "undefined"){
    if(typeof(window) !== "undefined") {
        global = window;
    }
}

if(typeof(global.$$) == "undefined"){
    global.$$ = {};

    if(typeof(window) == "undefined") {
        window = global;
    }
    window.$$ = global.$$;
}

if(typeof($$["__runtimeModules"]) == "undefined"){
    $$.__runtimeModules = {};
    console.log("Defining $$.__runtimeModules", $$.__runtimeModules)
}

if(typeof($$["browserRuntime"]) == "undefined") {
    require("./nodeShims")
} else {
    console.log("Defining fs...");
    $$.__runtimeModules["fs"] = {

    };
}
global.require = $$.require;
require("./pskModules");





},{"./nodeShims":"C:\\work\\PrivateSky\\privatesky\\engine\\pskbuildtemp\\nodeShims.js","./pskModules":"C:\\work\\PrivateSky\\privatesky\\engine\\pskbuildtemp\\pskModules.js"}],"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\choreographies\\SwarmDebug.js":[function(require,module,exports){
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


},{"fs":false,"util":"util"}],"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\choreographies\\swarmInstancesManager.js":[function(require,module,exports){


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



},{}],"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\choreographies\\utilityFunctions\\base.js":[function(require,module,exports){
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
},{"../../parallelJoinPoint":"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\parallelJoinPoint.js","../../serialJoinPoint":"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\serialJoinPoint.js","../SwarmDebug":"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\choreographies\\SwarmDebug.js"}],"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\choreographies\\utilityFunctions\\callflow.js":[function(require,module,exports){
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
},{"./base":"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\choreographies\\utilityFunctions\\base.js"}],"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\choreographies\\utilityFunctions\\swarm.js":[function(require,module,exports){
exports.createForObject = function(valueObject, thisObject, localId){
	return require("./base").createForObject(valueObject, thisObject, localId);
};
},{"./base":"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\choreographies\\utilityFunctions\\base.js"}],"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\loadLibrary.js":[function(require,module,exports){
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
},{}],"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\parallelJoinPoint.js":[function(require,module,exports){

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
},{}],"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\safe-uuid.js":[function(require,module,exports){

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
},{"crypto":"crypto"}],"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\serialJoinPoint.js":[function(require,module,exports){

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
},{}],"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\swarmDescription.js":[function(require,module,exports){
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
},{"./choreographies/utilityFunctions/callflow":"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\choreographies\\utilityFunctions\\callflow.js"}],"C:\\work\\PrivateSky\\privatesky\\modules\\dicontainer\\lib\\container.js":[function(require,module,exports){
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

},{}],"C:\\work\\PrivateSky\\privatesky\\modules\\signsensus\\lib\\index.js":[function(require,module,exports){

},{}],"C:\\work\\PrivateSky\\privatesky\\modules\\soundpubsub\\index.js":[function(require,module,exports){
module.exports = {
					beesHealer: require("./lib/beesHealer"),
					soundPubSub: require("./lib/soundPubSub").soundPubSub
					//folderMQ: require("./lib/folderMQ")
};
},{"./lib/beesHealer":"C:\\work\\PrivateSky\\privatesky\\modules\\soundpubsub\\lib\\beesHealer.js","./lib/soundPubSub":"C:\\work\\PrivateSky\\privatesky\\modules\\soundpubsub\\lib\\soundPubSub.js"}],"C:\\work\\PrivateSky\\privatesky\\modules\\soundpubsub\\lib\\Queue.js":[function(require,module,exports){
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
},{}],"C:\\work\\PrivateSky\\privatesky\\modules\\soundpubsub\\lib\\beesHealer.js":[function(require,module,exports){

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
},{}],"C:\\work\\PrivateSky\\privatesky\\modules\\soundpubsub\\lib\\soundPubSub.js":[function(require,module,exports){
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
},{"./Queue":"C:\\work\\PrivateSky\\privatesky\\modules\\soundpubsub\\lib\\Queue.js"}],"callflow":[function(require,module,exports){

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
},{"./lib/choreographies/swarmInstancesManager":"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\choreographies\\swarmInstancesManager.js","./lib/choreographies/utilityFunctions/swarm":"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\choreographies\\utilityFunctions\\swarm.js","./lib/loadLibrary":"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\loadLibrary.js","./lib/parallelJoinPoint":"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\parallelJoinPoint.js","./lib/safe-uuid":"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\safe-uuid.js","./lib/serialJoinPoint":"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\serialJoinPoint.js","./lib/swarmDescription":"C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\lib\\swarmDescription.js"}]},{},["C:\\work\\PrivateSky\\privatesky\\engine\\pskbuildtemp\\pskruntime.js"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9lbmdpbmUvcHNrYnVpbGR0ZW1wL25vZGVTaGltcy5qcyIsIi4uL2VuZ2luZS9wc2tidWlsZHRlbXAvcHNrTW9kdWxlcy5qcyIsIi4uL2VuZ2luZS9wc2tidWlsZHRlbXAvcHNrcnVudGltZS5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL2Nob3Jlb2dyYXBoaWVzL1N3YXJtRGVidWcuanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9jaG9yZW9ncmFwaGllcy9zd2FybUluc3RhbmNlc01hbmFnZXIuanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9jaG9yZW9ncmFwaGllcy91dGlsaXR5RnVuY3Rpb25zL2Jhc2UuanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9jaG9yZW9ncmFwaGllcy91dGlsaXR5RnVuY3Rpb25zL2NhbGxmbG93LmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvdXRpbGl0eUZ1bmN0aW9ucy9zd2FybS5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL2xvYWRMaWJyYXJ5LmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvcGFyYWxsZWxKb2luUG9pbnQuanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9zYWZlLXV1aWQuanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9zZXJpYWxKb2luUG9pbnQuanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9zd2FybURlc2NyaXB0aW9uLmpzIiwiLi4vbW9kdWxlcy9kaWNvbnRhaW5lci9saWIvY29udGFpbmVyLmpzIiwiLi4vbW9kdWxlcy9zaWduc2Vuc3VzL2xpYi9pbmRleC5qcyIsIi4uL21vZHVsZXMvc291bmRwdWJzdWIvaW5kZXguanMiLCIuLi9tb2R1bGVzL3NvdW5kcHVic3ViL2xpYi9RdWV1ZS5qcyIsIi4uL21vZHVsZXMvc291bmRwdWJzdWIvbGliL2JlZXNIZWFsZXIuanMiLCIuLi9tb2R1bGVzL3NvdW5kcHVic3ViL2xpYi9zb3VuZFB1YlN1Yi5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVNQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiOyQkLl9fcnVudGltZU1vZHVsZXNbXCJhc3NlcnRcIl0gPSByZXF1aXJlKFwiYXNzZXJ0XCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcImNyeXB0b1wiXSA9IHJlcXVpcmUoXCJjcnlwdG9cIik7XG4kJC5fX3J1bnRpbWVNb2R1bGVzW1wiemxpYlwiXSA9IHJlcXVpcmUoXCJ6bGliXCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcInV0aWxcIl0gPSByZXF1aXJlKFwidXRpbFwiKTtcbiQkLl9fcnVudGltZU1vZHVsZXNbXCJwYXRoXCJdID0gcmVxdWlyZShcInBhdGhcIik7XG4iLCI7JCQuX19ydW50aW1lTW9kdWxlc1tcInNvdW5kcHVic3ViXCJdID0gcmVxdWlyZShcInNvdW5kcHVic3ViXCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcImNhbGxmbG93XCJdID0gcmVxdWlyZShcImNhbGxmbG93XCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcImRpY29udGFpbmVyXCJdID0gcmVxdWlyZShcImRpY29udGFpbmVyXCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcInNpZ25zZW5zdXNcIl0gPSByZXF1aXJlKFwic2lnbnNlbnN1c1wiKTtcbiIsImlmKHR5cGVvZihnbG9iYWwpID09IFwidW5kZWZpbmVkXCIpe1xyXG4gICAgaWYodHlwZW9mKHdpbmRvdykgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICBnbG9iYWwgPSB3aW5kb3c7XHJcbiAgICB9XHJcbn1cclxuXHJcbmlmKHR5cGVvZihnbG9iYWwuJCQpID09IFwidW5kZWZpbmVkXCIpe1xyXG4gICAgZ2xvYmFsLiQkID0ge307XHJcblxyXG4gICAgaWYodHlwZW9mKHdpbmRvdykgPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHdpbmRvdyA9IGdsb2JhbDtcclxuICAgIH1cclxuICAgIHdpbmRvdy4kJCA9IGdsb2JhbC4kJDtcclxufVxyXG5cclxuaWYodHlwZW9mKCQkW1wiX19ydW50aW1lTW9kdWxlc1wiXSkgPT0gXCJ1bmRlZmluZWRcIil7XHJcbiAgICAkJC5fX3J1bnRpbWVNb2R1bGVzID0ge307XHJcbiAgICBjb25zb2xlLmxvZyhcIkRlZmluaW5nICQkLl9fcnVudGltZU1vZHVsZXNcIiwgJCQuX19ydW50aW1lTW9kdWxlcylcclxufVxyXG5cclxuaWYodHlwZW9mKCQkW1wiYnJvd3NlclJ1bnRpbWVcIl0pID09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgIHJlcXVpcmUoXCIuL25vZGVTaGltc1wiKVxyXG59IGVsc2Uge1xyXG4gICAgY29uc29sZS5sb2coXCJEZWZpbmluZyBmcy4uLlwiKTtcclxuICAgICQkLl9fcnVudGltZU1vZHVsZXNbXCJmc1wiXSA9IHtcclxuXHJcbiAgICB9O1xyXG59XHJcbmdsb2JhbC5yZXF1aXJlID0gJCQucmVxdWlyZTtcclxucmVxdWlyZShcIi4vcHNrTW9kdWxlc1wiKTtcclxuXHJcblxyXG5cclxuXHJcbiIsIi8qXHJcbkluaXRpYWwgTGljZW5zZTogKGMpIEF4aW9sb2dpYyBSZXNlYXJjaCAmIEFsYm9haWUgU8OubmljxIMuXHJcbkNvbnRyaWJ1dG9yczogQXhpb2xvZ2ljIFJlc2VhcmNoICwgUHJpdmF0ZVNreSBwcm9qZWN0XHJcbkNvZGUgTGljZW5zZTogTEdQTCBvciBNSVQuXHJcbiovXHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xyXG52YXIgZnMgPSByZXF1aXJlKFwiZnNcIik7XHJcbmdsb2JhbC5jcHJpbnQgPSBjb25zb2xlLmxvZztcclxuZ2xvYmFsLndwcmludCA9IGNvbnNvbGUud2FybjtcclxuZ2xvYmFsLmRwcmludCA9IGNvbnNvbGUuZGVidWc7XHJcbmdsb2JhbC5lcHJpbnQgPSBjb25zb2xlLmVycm9yO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBTaG9ydGN1dCB0byBKU09OLnN0cmluZ2lmeVxyXG4gKiBAcGFyYW0gb2JqXHJcbiAqL1xyXG5nbG9iYWwuSiA9IGZ1bmN0aW9uIChvYmopIHtcclxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmopO1xyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIFByaW50IHN3YXJtIGNvbnRleHRzIChNZXNzYWdlcykgYW5kIGVhc2llciB0byByZWFkIGNvbXBhcmVkIHdpdGggSlxyXG4gKiBAcGFyYW0gb2JqXHJcbiAqIEByZXR1cm4ge3N0cmluZ31cclxuICovXHJcbmV4cG9ydHMuY2xlYW5EdW1wID0gZnVuY3Rpb24gKG9iaikge1xyXG4gICAgdmFyIG8gPSBvYmoudmFsdWVPZigpO1xyXG4gICAgdmFyIG1ldGEgPSB7XHJcbiAgICAgICAgc3dhcm1UeXBlTmFtZTpvLm1ldGEuc3dhcm1UeXBlTmFtZVxyXG4gICAgfTtcclxuICAgIHJldHVybiBcIlxcdCBzd2FybUlkOiBcIiArIG8ubWV0YS5zd2FybUlkICsgXCJ7XFxuXFx0XFx0bWV0YTogXCIgICAgKyBKKG1ldGEpICtcclxuICAgICAgICBcIlxcblxcdFxcdHB1YmxpYzogXCIgICAgICAgICsgSihvLnB1YmxpY1ZhcnMpICtcclxuICAgICAgICBcIlxcblxcdFxcdHByb3RlY3RlZDogXCIgICAgICsgSihvLnByb3RlY3RlZFZhcnMpICtcclxuICAgICAgICBcIlxcblxcdFxcdHByaXZhdGU6IFwiICAgICAgICsgSihvLnByaXZhdGVWYXJzKSArIFwiXFxuXFx0fVxcblwiO1xyXG59XHJcblxyXG4vL00gPSBleHBvcnRzLmNsZWFuRHVtcDtcclxuLyoqXHJcbiAqIEV4cGVyaW1lbnRhbCBmdW5jdGlvbnNcclxuICovXHJcblxyXG5cclxuLypcclxuXHJcbmxvZ2dlciAgICAgID0gbW9uaXRvci5sb2dnZXI7XHJcbmFzc2VydCAgICAgID0gbW9uaXRvci5hc3NlcnQ7XHJcbnRocm93aW5nICAgID0gbW9uaXRvci5leGNlcHRpb25zO1xyXG5cclxuXHJcbnZhciB0ZW1wb3JhcnlMb2dCdWZmZXIgPSBbXTtcclxuXHJcbnZhciBjdXJyZW50U3dhcm1Db21JbXBsID0gbnVsbDtcclxuXHJcbmxvZ2dlci5yZWNvcmQgPSBmdW5jdGlvbihyZWNvcmQpe1xyXG4gICAgaWYoY3VycmVudFN3YXJtQ29tSW1wbD09PW51bGwpe1xyXG4gICAgICAgIHRlbXBvcmFyeUxvZ0J1ZmZlci5wdXNoKHJlY29yZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGN1cnJlbnRTd2FybUNvbUltcGwucmVjb3JkTG9nKHJlY29yZCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbnZhciBjb250YWluZXIgPSByZXF1aXJlKFwiZGljb250YWluZXJcIikuY29udGFpbmVyO1xyXG5cclxuY29udGFpbmVyLnNlcnZpY2UoXCJzd2FybUxvZ2dpbmdNb25pdG9yXCIsIFtcInN3YXJtaW5nSXNXb3JraW5nXCIsIFwic3dhcm1Db21JbXBsXCJdLCBmdW5jdGlvbihvdXRPZlNlcnZpY2Usc3dhcm1pbmcsIHN3YXJtQ29tSW1wbCl7XHJcblxyXG4gICAgaWYob3V0T2ZTZXJ2aWNlKXtcclxuICAgICAgICBpZighdGVtcG9yYXJ5TG9nQnVmZmVyKXtcclxuICAgICAgICAgICAgdGVtcG9yYXJ5TG9nQnVmZmVyID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgdG1wID0gdGVtcG9yYXJ5TG9nQnVmZmVyO1xyXG4gICAgICAgIHRlbXBvcmFyeUxvZ0J1ZmZlciA9IFtdO1xyXG4gICAgICAgIGN1cnJlbnRTd2FybUNvbUltcGwgPSBzd2FybUNvbUltcGw7XHJcbiAgICAgICAgbG9nZ2VyLnJlY29yZCA9IGZ1bmN0aW9uKHJlY29yZCl7XHJcbiAgICAgICAgICAgIGN1cnJlbnRTd2FybUNvbUltcGwucmVjb3JkTG9nKHJlY29yZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0bXAuZm9yRWFjaChmdW5jdGlvbihyZWNvcmQpe1xyXG4gICAgICAgICAgICBsb2dnZXIucmVjb3JkKHJlY29yZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pXHJcblxyXG4qL1xyXG5nbG9iYWwudW5jYXVnaHRFeGNlcHRpb25TdHJpbmcgPSBcIlwiO1xyXG5nbG9iYWwudW5jYXVnaHRFeGNlcHRpb25FeGlzdHMgPSBmYWxzZTtcclxuaWYodHlwZW9mIGdsb2JhbC5nbG9iYWxWZXJib3NpdHkgPT0gJ3VuZGVmaW5lZCcpe1xyXG4gICAgZ2xvYmFsLmdsb2JhbFZlcmJvc2l0eSA9IGZhbHNlO1xyXG59XHJcblxyXG52YXIgREVCVUdfU1RBUlRfVElNRSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuZnVuY3Rpb24gZ2V0RGVidWdEZWx0YSgpe1xyXG4gICAgdmFyIGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICByZXR1cm4gY3VycmVudFRpbWUgLSBERUJVR19TVEFSVF9USU1FO1xyXG59XHJcblxyXG4vKipcclxuICogRGVidWcgZnVuY3Rpb25zLCBpbmZsdWVuY2VkIGJ5IGdsb2JhbFZlcmJvc2l0eSBnbG9iYWwgdmFyaWFibGVcclxuICogQHBhcmFtIHR4dFxyXG4gKi9cclxuZHByaW50ID0gZnVuY3Rpb24gKHR4dCkge1xyXG4gICAgaWYgKGdsb2JhbFZlcmJvc2l0eSA9PSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXNBZGFwdGVyLmluaXRpbGlzZWQgKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiREVCVUc6IFtcIiArIHRoaXNBZGFwdGVyLm5vZGVOYW1lICsgXCJdKFwiICsgZ2V0RGVidWdEZWx0YSgpKyBcIik6XCIrdHh0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiREVCVUc6IChcIiArIGdldERlYnVnRGVsdGEoKSsgXCIpOlwiK3R4dCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiREVCVUc6IFwiICsgdHh0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBvYnNvbGV0ZSE/XHJcbiAqIEBwYXJhbSB0eHRcclxuICovXHJcbmdsb2JhbC5hcHJpbnQgPSBmdW5jdGlvbiAodHh0KSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIkRFQlVHOiBbXCIgKyB0aGlzQWRhcHRlci5ub2RlTmFtZSArIFwiXTogXCIgKyB0eHQpO1xyXG59XHJcblxyXG5cclxuXHJcbi8qKlxyXG4gKiBVdGlsaXR5IGZ1bmN0aW9uIHVzdWFsbHkgdXNlZCBpbiB0ZXN0cywgZXhpdCBjdXJyZW50IHByb2Nlc3MgYWZ0ZXIgYSB3aGlsZVxyXG4gKiBAcGFyYW0gbXNnXHJcbiAqIEBwYXJhbSB0aW1lb3V0XHJcbiAqL1xyXG5nbG9iYWwuZGVsYXlFeGl0ID0gZnVuY3Rpb24gKG1zZywgcmV0Q29kZSx0aW1lb3V0KSB7XHJcbiAgICBpZihyZXRDb2RlID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgcmV0Q29kZSA9IEV4aXRDb2Rlcy5Vbmtub3duRXJyb3I7XHJcbiAgICB9XHJcblxyXG4gICAgaWYodGltZW91dCA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgIHRpbWVvdXQgPSAxMDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYobXNnID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgbXNnID0gXCJEZWxheWluZyBleGl0IHdpdGggXCIrIHRpbWVvdXQgKyBcIm1zXCI7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2cobXNnKTtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHByb2Nlc3MuZXhpdChyZXRDb2RlKTtcclxuICAgIH0sIHRpbWVvdXQpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gbG9jYWxMb2cgKGxvZ1R5cGUsIG1lc3NhZ2UsIGVycikge1xyXG4gICAgdmFyIHRpbWUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgdmFyIG5vdyA9IHRpbWUuZ2V0RGF0ZSgpICsgXCItXCIgKyAodGltZS5nZXRNb250aCgpICsgMSkgKyBcIixcIiArIHRpbWUuZ2V0SG91cnMoKSArIFwiOlwiICsgdGltZS5nZXRNaW51dGVzKCk7XHJcbiAgICB2YXIgbXNnO1xyXG5cclxuICAgIG1zZyA9ICdbJyArIG5vdyArICddWycgKyB0aGlzQWRhcHRlci5ub2RlTmFtZSArICddICcgKyBtZXNzYWdlO1xyXG5cclxuICAgIGlmIChlcnIgIT0gbnVsbCAmJiBlcnIgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgbXNnICs9ICdcXG4gICAgIEVycjogJyArIGVyci50b1N0cmluZygpO1xyXG4gICAgICAgIGlmIChlcnIuc3RhY2sgJiYgZXJyLnN0YWNrICE9IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgbXNnICs9ICdcXG4gICAgIFN0YWNrOiAnICsgZXJyLnN0YWNrICsgJ1xcbic7XHJcbiAgICB9XHJcblxyXG4gICAgY3ByaW50KG1zZyk7XHJcbiAgICBpZih0aGlzQWRhcHRlci5pbml0aWxpc2VkKXtcclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKGdldFN3YXJtRmlsZVBhdGgodGhpc0FkYXB0ZXIuY29uZmlnLmxvZ3NQYXRoICsgXCIvXCIgKyBsb2dUeXBlKSwgbXNnKTtcclxuICAgICAgICB9IGNhdGNoKGVycil7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGluZyB0byB3cml0ZSBsb2dzIGluIFwiLCB0aGlzQWRhcHRlci5jb25maWcubG9nc1BhdGggKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZ2xvYmFsLnByaW50ZiA9IGZ1bmN0aW9uICguLi5wYXJhbXMpIHtcclxuICAgIHZhciBhcmdzID0gW107IC8vIGVtcHR5IGFycmF5XHJcbiAgICAvLyBjb3B5IGFsbCBvdGhlciBhcmd1bWVudHMgd2Ugd2FudCB0byBcInBhc3MgdGhyb3VnaFwiXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGFyZ3MucHVzaChwYXJhbXNbaV0pO1xyXG4gICAgfVxyXG4gICAgdmFyIG91dCA9IHV0aWwuZm9ybWF0LmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgY29uc29sZS5sb2cob3V0KTtcclxufVxyXG5cclxuZ2xvYmFsLnNwcmludGYgPSBmdW5jdGlvbiAoLi4ucGFyYW1zKSB7XHJcbiAgICB2YXIgYXJncyA9IFtdOyAvLyBlbXB0eSBhcnJheVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhcmdzLnB1c2gocGFyYW1zW2ldKTtcclxuICAgIH1cclxuICAgIHJldHVybiB1dGlsLmZvcm1hdC5hcHBseSh0aGlzLCBhcmdzKTtcclxufVxyXG5cclxuIiwiXHJcblxyXG5mdW5jdGlvbiBTd2FybXNJbnN0YW5jZXNNYW5hZ2VyKCl7XHJcbiAgICB2YXIgc3dhcm1BbGl2ZUluc3RhbmNlcyA9IHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy53YWl0Rm9yU3dhcm0gPSBmdW5jdGlvbihjYWxsYmFjaywgc3dhcm0sIGtlZXBBbGl2ZUNoZWNrKXtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZG9Mb2dpYygpe1xyXG4gICAgICAgICAgICB2YXIgc3dhcm1JZCA9IHN3YXJtLmdldElubmVyVmFsdWUoKS5tZXRhLnN3YXJtSWQ7XHJcbiAgICAgICAgICAgIHZhciB3YXRjaGVyID0gc3dhcm1BbGl2ZUluc3RhbmNlc1tzd2FybUlkXTtcclxuICAgICAgICAgICAgaWYoIXdhdGNoZXIpe1xyXG4gICAgICAgICAgICAgICAgd2F0Y2hlciA9IHtcclxuICAgICAgICAgICAgICAgICAgICBzd2FybTpzd2FybSxcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazpjYWxsYmFjayxcclxuICAgICAgICAgICAgICAgICAgICBrZWVwQWxpdmVDaGVjazprZWVwQWxpdmVDaGVja1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc3dhcm1BbGl2ZUluc3RhbmNlc1tzd2FybUlkXSA9IHdhdGNoZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGZpbHRlcigpe1xyXG4gICAgICAgICAgICByZXR1cm4gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpLm1ldGEuc3dhcm1JZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vJCQudWlkR2VuZXJhdG9yLndhaXRfZm9yX2NvbmRpdGlvbihjb25kaXRpb24sZG9Mb2dpYyk7XHJcbiAgICAgICAgc3dhcm0ub2JzZXJ2ZShkb0xvZ2ljLCBudWxsLCBmaWx0ZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNsZWFuU3dhcm1XYWl0ZXIoc3dhcm1TZXJpYWxpc2F0aW9uKXsgLy8gVE9ETzogYWRkIGJldHRlciBtZWNoYW5pc21zIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXHJcbiAgICAgICAgdmFyIHN3YXJtSWQgPSBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5zd2FybUlkO1xyXG4gICAgICAgIHZhciB3YXRjaGVyID0gc3dhcm1BbGl2ZUluc3RhbmNlc1tzd2FybUlkXTtcclxuXHJcbiAgICAgICAgaWYoIXdhdGNoZXIpe1xyXG4gICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIud2FybmluZyhcIkludmFsaWQgc3dhcm0gcmVjZWl2ZWQ6IFwiICsgc3dhcm1JZCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBhcmdzID0gc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuYXJncztcclxuICAgICAgICBhcmdzLnB1c2goc3dhcm1TZXJpYWxpc2F0aW9uKTtcclxuXHJcbiAgICAgICAgd2F0Y2hlci5jYWxsYmFjay5hcHBseShudWxsLCBhcmdzKTtcclxuICAgICAgICBpZighd2F0Y2hlci5rZWVwQWxpdmVDaGVjaygpKXtcclxuICAgICAgICAgICAgZGVsZXRlIHN3YXJtQWxpdmVJbnN0YW5jZXNbc3dhcm1JZF07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmV2aXZlX3N3YXJtID0gZnVuY3Rpb24oc3dhcm1TZXJpYWxpc2F0aW9uKXtcclxuXHJcblxyXG4gICAgICAgIHZhciBzd2FybUlkICAgICA9IHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLnN3YXJtSWQ7XHJcbiAgICAgICAgdmFyIHN3YXJtVHlwZSAgID0gc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuc3dhcm1UeXBlTmFtZTtcclxuICAgICAgICB2YXIgaW5zdGFuY2UgICAgPSBzd2FybUFsaXZlSW5zdGFuY2VzW3N3YXJtSWRdO1xyXG5cclxuICAgICAgICB2YXIgc3dhcm07XHJcblxyXG4gICAgICAgIGlmKGluc3RhbmNlKXtcclxuICAgICAgICAgICAgc3dhcm0gPSBpbnN0YW5jZS5zd2FybTtcclxuXHJcbiAgICAgICAgfSAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzd2FybSA9ICQkLnN3YXJtLmNyZWF0ZShzd2FybVR5cGUsIHVuZGVmaW5lZCwgc3dhcm1TZXJpYWxpc2F0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmNvbW1hbmQgPT0gXCJhc3luY1JldHVyblwiKXtcclxuICAgICAgICAgICAgY2xlYW5Td2FybVdhaXRlcihzd2FybVNlcmlhbGlzYXRpb24pO1xyXG4gICAgICAgIH0gZWxzZSAgICAgaWYoc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuY29tbWFuZCA9PSBcImV4ZWN1dGVTd2FybVBoYXNlXCIpe1xyXG4gICAgICAgICAgICBzd2FybS5ydW5QaGFzZShzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5waGFzZU5hbWUsIHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmFyZ3MpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5rbm93biBjb21tYW5kXCIsc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuY29tbWFuZCwgXCJpbiBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5jb21tYW5kXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHN3YXJtO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuJCQuc3dhcm1zSW5zdGFuY2VzTWFuYWdlciA9IG5ldyBTd2FybXNJbnN0YW5jZXNNYW5hZ2VyKCk7XHJcblxyXG5cclxuIiwidmFyIGJlZXNIZWFsZXIgPSAkJC5yZXF1aXJlKFwic291bmRwdWJzdWJcIikuYmVlc0hlYWxlcjtcclxudmFyIHN3YXJtRGVidWcgPSByZXF1aXJlKFwiLi4vU3dhcm1EZWJ1Z1wiKTtcclxuXHJcbmV4cG9ydHMuY3JlYXRlRm9yT2JqZWN0ID0gZnVuY3Rpb24odmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpe1xyXG5cdHZhciByZXQgPSB7fTtcclxuXHJcblx0ZnVuY3Rpb24gZmlsdGVyRm9yU2VyaWFsaXNhYmxlICh2YWx1ZU9iamVjdCl7XHJcblx0XHRyZXR1cm4gdmFsdWVPYmplY3QubWV0YS5zd2FybUlkO1xyXG5cdH1cclxuXHJcblx0dmFyIHN3YXJtRnVuY3Rpb24gPSBmdW5jdGlvbihjb250ZXh0LCBwaGFzZU5hbWUpe1xyXG5cdFx0dmFyIGFyZ3MgPVtdO1xyXG5cdFx0Zm9yKHZhciBpID0gMjsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKyl7XHJcblx0XHRcdGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vbWFrZSB0aGUgZXhlY3V0aW9uIGF0IGxldmVsIDAgIChhZnRlciBhbGwgcGVuZGluZyBldmVudHMpIGFuZCB3YWl0IHRvIGhhdmUgYSBzd2FybUlkXHJcblx0XHRyZXQub2JzZXJ2ZShmdW5jdGlvbigpe1xyXG5cdFx0XHRiZWVzSGVhbGVyLmFzSlNPTih2YWx1ZU9iamVjdCwgcGhhc2VOYW1lLCBhcmdzLCBmdW5jdGlvbihlcnIsanNNc2cpe1xyXG5cdFx0XHRcdGpzTXNnLm1ldGEudGFyZ2V0ID0gY29udGV4dDtcclxuXHRcdFx0XHQkJC5QU0tfUHViU3ViLnB1Ymxpc2goJCQuQ09OU1RBTlRTLlNXQVJNX0ZPUl9FWEVDVVRJT04sIGpzTXNnKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9LG51bGwsZmlsdGVyRm9yU2VyaWFsaXNhYmxlKTtcclxuXHJcblx0XHRyZXQubm90aWZ5KCk7XHJcblxyXG5cclxuXHRcdHJldHVybiB0aGlzT2JqZWN0O1xyXG5cdH07XHJcblxyXG5cdHZhciBhc3luY1JldHVybiA9IGZ1bmN0aW9uKGVyciwgcmVzdWx0KXtcclxuXHRcdHZhciBjb250ZXh0ID0gdmFsdWVPYmplY3QucHJvdGVjdGVkVmFycy5jb250ZXh0O1xyXG5cclxuXHRcdGlmKCFjb250ZXh0ICYmIHZhbHVlT2JqZWN0Lm1ldGEud2FpdFN0YWNrKXtcclxuXHRcdFx0Y29udGV4dCA9IHZhbHVlT2JqZWN0Lm1ldGEud2FpdFN0YWNrLnBvcCgpO1xyXG5cdFx0XHR2YWx1ZU9iamVjdC5wcm90ZWN0ZWRWYXJzLmNvbnRleHQgPSBjb250ZXh0O1xyXG5cdFx0fVxyXG5cclxuXHRcdGJlZXNIZWFsZXIuYXNKU09OKHZhbHVlT2JqZWN0LCBcIl9fcmV0dXJuX19cIiwgW2VyciwgcmVzdWx0XSwgZnVuY3Rpb24oZXJyLGpzTXNnKXtcclxuXHRcdFx0anNNc2cubWV0YS5jb21tYW5kID0gXCJhc3luY1JldHVyblwiO1xyXG5cdFx0XHRpZighY29udGV4dCl7XHJcblx0XHRcdFx0Y29udGV4dCA9IHZhbHVlT2JqZWN0Lm1ldGEuaG9tZVNlY3VyaXR5Q29udGV4dDsvL1RPRE86IENIRUNLIFRISVNcclxuXHJcblx0XHRcdH1cclxuXHRcdFx0anNNc2cubWV0YS50YXJnZXQgPSBjb250ZXh0O1xyXG5cclxuXHRcdFx0aWYoIWNvbnRleHQpe1xyXG5cdFx0XHRcdCQkLmVycm9ySGFuZGxlci5lcnJvcihuZXcgRXJyb3IoXCJBc3luY2hyb25vdXMgcmV0dXJuIGluc2lkZSBvZiBhIHN3YXJtIHRoYXQgZG9lcyBub3Qgd2FpdCBmb3IgcmVzdWx0c1wiKSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JCQuUFNLX1B1YlN1Yi5wdWJsaXNoKCQkLkNPTlNUQU5UUy5TV0FSTV9GT1JfRVhFQ1VUSU9OLCBqc01zZyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH07XHJcblxyXG5cdGZ1bmN0aW9uIGhvbWUoZXJyLCByZXN1bHQpe1xyXG5cdFx0YmVlc0hlYWxlci5hc0pTT04odmFsdWVPYmplY3QsIFwiaG9tZVwiLCBbZXJyLCByZXN1bHRdLCBmdW5jdGlvbihlcnIsanNNc2cpe1xyXG5cdFx0XHR2YXIgY29udGV4dCA9IHZhbHVlT2JqZWN0Lm1ldGEuaG9tZUNvbnRleHQ7XHJcblx0XHRcdGpzTXNnLm1ldGEudGFyZ2V0ID0gY29udGV4dDtcclxuXHRcdFx0JCQuUFNLX1B1YlN1Yi5wdWJsaXNoKCQkLkNPTlNUQU5UUy5TV0FSTV9GT1JfRVhFQ1VUSU9OLCBqc01zZyk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cclxuXHJcblx0ZnVuY3Rpb24gd2FpdFJlc3VsdHMoY2FsbGJhY2ssIGtlZXBBbGl2ZUNoZWNrLCBzd2FybSl7XHJcblx0XHRpZighc3dhcm0pe1xyXG5cdFx0XHRzd2FybSA9IHRoaXM7XHJcblx0XHR9XHJcblx0XHRpZigha2VlcEFsaXZlQ2hlY2spe1xyXG5cdFx0XHRrZWVwQWxpdmVDaGVjayA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR2YXIgaW5uZXIgPSBzd2FybS5nZXRJbm5lclZhbHVlKCk7XHJcblx0XHRpZighaW5uZXIubWV0YS53YWl0U3RhY2spe1xyXG5cdFx0XHRpbm5lci5tZXRhLndhaXRTdGFjayA9IFtdO1xyXG5cdFx0XHRpbm5lci5tZXRhLndhaXRTdGFjay5wdXNoKCQkLnNlY3VyaXR5Q29udGV4dClcclxuXHRcdH1cclxuXHRcdCQkLnN3YXJtc0luc3RhbmNlc01hbmFnZXIud2FpdEZvclN3YXJtKGNhbGxiYWNrLCBzd2FybSwga2VlcEFsaXZlQ2hlY2spO1xyXG5cdH1cclxuXHJcblxyXG5cdGZ1bmN0aW9uIGdldElubmVyVmFsdWUoKXtcclxuXHRcdHJldHVybiB2YWx1ZU9iamVjdDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHJ1blBoYXNlKGZ1bmN0TmFtZSwgYXJncyl7XHJcblx0XHR2YXIgZnVuYyA9IHZhbHVlT2JqZWN0Lm15RnVuY3Rpb25zW2Z1bmN0TmFtZV07XHJcblx0XHRpZihmdW5jKXtcclxuXHRcdFx0ZnVuYy5hcHBseSh0aGlzT2JqZWN0LCBhcmdzKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihmdW5jdE5hbWUsIHZhbHVlT2JqZWN0LCBcIkZ1bmN0aW9uIFwiICsgZnVuY3ROYW1lICsgXCIgZG9lcyBub3QgZXhpc3QhXCIpO1xyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHVwZGF0ZShzZXJpYWxpc2F0aW9uKXtcclxuXHRcdGJlZXNIZWFsZXIuanNvblRvTmF0aXZlKHNlcmlhbGlzYXRpb24sdmFsdWVPYmplY3QpO1xyXG5cdH1cclxuXHJcblxyXG5cdGZ1bmN0aW9uIHZhbHVlT2YoKXtcclxuXHRcdHZhciByZXQgPSB7fTtcclxuXHRcdHJldC5tZXRhICAgICAgICAgICAgICAgID0gdmFsdWVPYmplY3QubWV0YTtcclxuXHRcdHJldC5wdWJsaWNWYXJzICAgICAgICAgID0gdmFsdWVPYmplY3QucHVibGljVmFycztcclxuXHRcdHJldC5wcml2YXRlVmFycyAgICAgICAgID0gdmFsdWVPYmplY3QucHJpdmF0ZVZhcnM7XHJcblx0XHRyZXQucHJvdGVjdGVkVmFycyAgICAgICA9IHZhbHVlT2JqZWN0LnByb3RlY3RlZFZhcnM7XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdG9TdHJpbmcgKCl7XHJcblx0XHRyZXR1cm4gc3dhcm1EZWJ1Zy5jbGVhbkR1bXAodGhpc09iamVjdC52YWx1ZU9mKCkpO1xyXG5cdH1cclxuXHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZVBhcmFsbGVsKGNhbGxiYWNrKXtcclxuXHRcdHJldHVybiByZXF1aXJlKFwiLi4vLi4vcGFyYWxsZWxKb2luUG9pbnRcIikuY3JlYXRlSm9pblBvaW50KHRoaXNPYmplY3QsIGNhbGxiYWNrLCAkJC5fX2ludGVybi5ta0FyZ3MoYXJndW1lbnRzLDEpKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZVNlcmlhbChjYWxsYmFjayl7XHJcblx0XHRyZXR1cm4gcmVxdWlyZShcIi4uLy4uL3NlcmlhbEpvaW5Qb2ludFwiKS5jcmVhdGVTZXJpYWxKb2luUG9pbnQodGhpc09iamVjdCwgY2FsbGJhY2ssICQkLl9faW50ZXJuLm1rQXJncyhhcmd1bWVudHMsMSkpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaW5zcGVjdCgpe1xyXG5cdFx0cmV0dXJuIHN3YXJtRGVidWcuY2xlYW5EdW1wKHRoaXNPYmplY3QudmFsdWVPZigpKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNvbnN0cnVjdG9yKCl7XHJcblx0XHRyZXR1cm4gU3dhcm1EZXNjcmlwdGlvbjtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGVuc3VyZUxvY2FsSWQoKXtcclxuXHRcdGlmKCF2YWx1ZU9iamVjdC5sb2NhbElkKXtcclxuXHRcdFx0dmFsdWVPYmplY3QubG9jYWxJZCA9IHZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1UeXBlTmFtZSArIFwiLVwiICsgbG9jYWxJZDtcclxuXHRcdFx0bG9jYWxJZCsrO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gb2JzZXJ2ZShjYWxsYmFjaywgd2FpdEZvck1vcmUsIGZpbHRlcil7XHJcblx0XHRpZighd2FpdEZvck1vcmUpe1xyXG5cdFx0XHR3YWl0Rm9yTW9yZSA9IGZ1bmN0aW9uICgpe1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGVuc3VyZUxvY2FsSWQoKTtcclxuXHJcblx0XHQkJC5QU0tfUHViU3ViLnN1YnNjcmliZSh2YWx1ZU9iamVjdC5sb2NhbElkLCBjYWxsYmFjaywgd2FpdEZvck1vcmUsIGZpbHRlcik7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0b0pTT04ocHJvcCl7XHJcblx0XHQvL3ByZXZlbnRpbmcgbWF4IGNhbGwgc3RhY2sgc2l6ZSBleGNlZWRpbmcgb24gcHJveHkgYXV0byByZWZlcmVuY2luZ1xyXG5cdFx0Ly9yZXBsYWNlIHt9IGFzIHJlc3VsdCBvZiBKU09OKFByb3h5KSB3aXRoIHRoZSBzdHJpbmcgW09iamVjdCBwcm90ZWN0ZWQgb2JqZWN0XVxyXG5cdFx0cmV0dXJuIFwiW09iamVjdCBwcm90ZWN0ZWQgb2JqZWN0XVwiO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0SlNPTmFzeW5jKGNhbGxiYWNrKXtcclxuXHRcdC8vbWFrZSB0aGUgZXhlY3V0aW9uIGF0IGxldmVsIDAgIChhZnRlciBhbGwgcGVuZGluZyBldmVudHMpIGFuZCB3YWl0IHRvIGhhdmUgYSBzd2FybUlkXHJcblx0XHRyZXQub2JzZXJ2ZShmdW5jdGlvbigpe1xyXG5cdFx0XHRiZWVzSGVhbGVyLmFzSlNPTih2YWx1ZU9iamVjdCwgbnVsbCwgbnVsbCxjYWxsYmFjayk7XHJcblx0XHR9LG51bGwsZmlsdGVyRm9yU2VyaWFsaXNhYmxlKTtcclxuXHRcdHJldC5ub3RpZnkoKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG5vdGlmeShldmVudCl7XHJcblx0XHRpZighZXZlbnQpe1xyXG5cdFx0XHRldmVudCA9IHZhbHVlT2JqZWN0O1xyXG5cdFx0fVxyXG5cdFx0ZW5zdXJlTG9jYWxJZCgpO1xyXG5cdFx0JCQuUFNLX1B1YlN1Yi5wdWJsaXNoKHZhbHVlT2JqZWN0LmxvY2FsSWQsIGV2ZW50KTtcclxuXHR9XHJcblxyXG5cdHJldC5zd2FybSAgICAgICAgICAgPSBzd2FybUZ1bmN0aW9uO1xyXG5cdHJldC5ub3RpZnkgICAgICAgICAgPSBub3RpZnk7XHJcblx0cmV0LmdldEpTT05hc3luYyAgICA9IGdldEpTT05hc3luYztcclxuXHRyZXQudG9KU09OICAgICAgICAgID0gdG9KU09OO1xyXG5cdHJldC5vYnNlcnZlICAgICAgICAgPSBvYnNlcnZlO1xyXG5cdHJldC5pbnNwZWN0ICAgICAgICAgPSBpbnNwZWN0O1xyXG5cdHJldC5qb2luICAgICAgICAgICAgPSBjcmVhdGVQYXJhbGxlbDtcclxuXHRyZXQucGFyYWxsZWwgICAgICAgID0gY3JlYXRlUGFyYWxsZWw7XHJcblx0cmV0LnNlcmlhbCAgICAgICAgICA9IGNyZWF0ZVNlcmlhbDtcclxuXHRyZXQudmFsdWVPZiAgICAgICAgID0gdmFsdWVPZjtcclxuXHRyZXQudXBkYXRlICAgICAgICAgID0gdXBkYXRlO1xyXG5cdHJldC5ydW5QaGFzZSAgICAgICAgPSBydW5QaGFzZTtcclxuXHRyZXQub25SZXR1cm4gICAgICAgID0gd2FpdFJlc3VsdHM7XHJcblx0cmV0Lm9uUmVzdWx0ICAgICAgICA9IHdhaXRSZXN1bHRzO1xyXG5cdHJldC5hc3luY1JldHVybiAgICAgPSBhc3luY1JldHVybjtcclxuXHRyZXQucmV0dXJuICAgICAgICAgID0gYXN5bmNSZXR1cm47XHJcblx0cmV0LmdldElubmVyVmFsdWUgICA9IGdldElubmVyVmFsdWU7XHJcblx0cmV0LmhvbWUgICAgICAgICAgICA9IGhvbWU7XHJcblx0cmV0LnRvU3RyaW5nICAgICAgICA9IHRvU3RyaW5nO1xyXG5cdHJldC5jb25zdHJ1Y3RvciAgICAgPSBjb25zdHJ1Y3RvcjtcclxuXHJcblx0cmV0dXJuIHJldDtcclxuXHJcbn07IiwiZXhwb3J0cy5jcmVhdGVGb3JPYmplY3QgPSBmdW5jdGlvbih2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCl7XHJcblx0dmFyIHJldCA9IHJlcXVpcmUoXCIuL2Jhc2VcIikuY3JlYXRlRm9yT2JqZWN0KHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0LCBsb2NhbElkKTtcclxuXHJcblx0cmV0LnN3YXJtICAgICAgICAgICA9IG51bGw7XHJcblx0cmV0Lm9uUmV0dXJuICAgICAgICA9IG51bGw7XHJcblx0cmV0Lm9uUmVzdWx0ICAgICAgICA9IG51bGw7XHJcblx0cmV0LmFzeW5jUmV0dXJuICAgICA9IG51bGw7XHJcblx0cmV0LnJldHVybiAgICAgICAgICA9IG51bGw7XHJcblx0cmV0LmhvbWUgICAgICAgICAgICA9IG51bGw7XHJcblxyXG5cdHJldHVybiByZXQ7XHJcbn07IiwiZXhwb3J0cy5jcmVhdGVGb3JPYmplY3QgPSBmdW5jdGlvbih2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCl7XHJcblx0cmV0dXJuIHJlcXVpcmUoXCIuL2Jhc2VcIikuY3JlYXRlRm9yT2JqZWN0KHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0LCBsb2NhbElkKTtcclxufTsiLCIvKlxyXG5Jbml0aWFsIExpY2Vuc2U6IChjKSBBeGlvbG9naWMgUmVzZWFyY2ggJiBBbGJvYWllIFPDrm5pY8SDLlxyXG5Db250cmlidXRvcnM6IEF4aW9sb2dpYyBSZXNlYXJjaCAsIFByaXZhdGVTa3kgcHJvamVjdFxyXG5Db2RlIExpY2Vuc2U6IExHUEwgb3IgTUlULlxyXG4qL1xyXG5cclxuLy92YXIgZnMgPSByZXF1aXJlKFwiZnNcIik7XHJcbi8vdmFyIHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcclxuXHJcbmZ1bmN0aW9uIHdyYXBDYWxsKG9yaWdpbmFsLCBwcmVmaXhOYW1lKXtcclxuICAgIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKXtcclxuICAgICAgICAvL2NvbnNvbGUubG9nKFwicHJlZml4TmFtZVwiLCBwcmVmaXhOYW1lKVxyXG4gICAgICAgIHZhciBwcmV2aW91c1ByZWZpeCA9ICQkLmxpYnJhcnlQcmVmaXg7XHJcbiAgICAgICAgJCQubGlicmFyeVByZWZpeCA9IHByZWZpeE5hbWU7XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICB2YXIgcmV0ID0gb3JpZ2luYWwuYXBwbHkodGhpcywgYXJncyk7XHJcbiAgICAgICAgICAgICQkLmxpYnJhcnlQcmVmaXggPSBwcmV2aW91c1ByZWZpeCA7XHJcbiAgICAgICAgfWNhdGNoKGVycil7XHJcbiAgICAgICAgICAgICQkLmxpYnJhcnlQcmVmaXggPSBwcmV2aW91c1ByZWZpeCA7XHJcbiAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gU3dhcm1MaWJyYXJ5KHByZWZpeE5hbWUsIGZvbGRlcil7XHJcbiAgICAkJC5saWJyYXJpZXNbcHJlZml4TmFtZV0gPSB0aGlzO1xyXG4gICAgdmFyIHByZWZpeGVkUmVxdWlyZSA9IHdyYXBDYWxsKGZ1bmN0aW9uKHBhdGgpe1xyXG4gICAgICAgIHJldHVybiByZXF1aXJlKHBhdGgpO1xyXG4gICAgfSwgcHJlZml4TmFtZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5jbHVkZUFsbEluUm9vdChmb2xkZXIpIHtcclxuICAgICAgICByZXR1cm4gJCQucmVxdWlyZShmb2xkZXIpOyAvLyBhIGxpYnJhcnkgaXMganVzdCBhIG1vZHVsZVxyXG4gICAgICAgIC8vdmFyIHN0YXQgPSBmcy5zdGF0U3luYyhwYXRoKTtcclxuICAgICAgICAvKnZhciBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGZvbGRlcik7XHJcbiAgICAgICAgZmlsZXMuZm9yRWFjaChmdW5jdGlvbihmaWxlTmFtZSl7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJMb2FkaW5nIFwiLCBmaWxlTmFtZSk7XHJcbiAgICAgICAgICAgIHZhciBleHQgPSBmaWxlTmFtZS5zdWJzdHIoZmlsZU5hbWUubGFzdEluZGV4T2YoJy4nKSArIDEpO1xyXG4gICAgICAgICAgICBpZihleHQudG9Mb3dlckNhc2UoKSA9PSBcImpzXCIpe1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZnVsbFBhdGggPSBwYXRoLnJlc29sdmUoZm9sZGVyICsgXCIvXCIgKyBmaWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJlZml4ZWRSZXF1aXJlKGZ1bGxQYXRoKTtcclxuICAgICAgICAgICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkqL1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICBmdW5jdGlvbiB3cmFwU3dhcm1SZWxhdGVkRnVuY3Rpb25zKHNwYWNlLCBwcmVmaXhOYW1lKXtcclxuICAgICAgICB2YXIgcmV0ID0ge307XHJcbiAgICAgICAgdmFyIG5hbWVzID0gW1wiY3JlYXRlXCIsIFwiZGVzY3JpYmVcIiwgXCJzdGFydFwiLCBcInJlc3RhcnRcIl07XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaTxuYW1lcy5sZW5ndGg7IGkrKyApe1xyXG4gICAgICAgICAgICByZXRbbmFtZXNbaV1dID0gd3JhcENhbGwoc3BhY2VbbmFtZXNbaV1dLCBwcmVmaXhOYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNhbGxmbG93cyAgICAgICAgPSB0aGlzLmNhbGxmbG93ICAgPSB3cmFwU3dhcm1SZWxhdGVkRnVuY3Rpb25zKCQkLmNhbGxmbG93cywgcHJlZml4TmFtZSk7XHJcbiAgICB0aGlzLnN3YXJtcyAgICAgICAgICAgPSB0aGlzLnN3YXJtICAgICAgPSB3cmFwU3dhcm1SZWxhdGVkRnVuY3Rpb25zKCQkLnN3YXJtcywgcHJlZml4TmFtZSk7XHJcbiAgICB0aGlzLmNvbnRyYWN0cyAgICAgICAgPSB0aGlzLmNvbnRyYWN0ICAgPSB3cmFwU3dhcm1SZWxhdGVkRnVuY3Rpb25zKCQkLmNvbnRyYWN0cywgcHJlZml4TmFtZSk7XHJcbiAgICBpbmNsdWRlQWxsSW5Sb290KGZvbGRlciwgcHJlZml4TmFtZSk7XHJcbn1cclxuXHJcbmV4cG9ydHMubG9hZExpYnJhcnkgPSBmdW5jdGlvbihwcmVmaXhOYW1lLCBmb2xkZXIpe1xyXG4gICAgdmFyIGV4aXN0aW5nID0gJCQubGlicmFyaWVzW3ByZWZpeE5hbWVdO1xyXG4gICAgaWYoZXhpc3RpbmcgKXtcclxuICAgICAgICBpZihmb2xkZXIpIHtcclxuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLndhcm5pbmcoXCJSZXVzaW5nIGFscmVhZHkgbG9hZGVkIGxpYnJhcnkgXCIgKyBwcmVmaXhOYW1lICsgXCJjb3VsZCBiZSBhbiBlcnJvciFcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBleGlzdGluZztcclxuICAgIH1cclxuICAgIC8vdmFyIGFic29sdXRlUGF0aCA9IHBhdGgucmVzb2x2ZShmb2xkZXIpO1xyXG4gICAgcmV0dXJuIG5ldyBTd2FybUxpYnJhcnkocHJlZml4TmFtZSwgZm9sZGVyKTtcclxufSIsIlxyXG52YXIgam9pbkNvdW50ZXIgPSAwO1xyXG5cclxuZnVuY3Rpb24gUGFyYWxsZWxKb2luUG9pbnQoc3dhcm0sIGNhbGxiYWNrLCBhcmdzKXtcclxuICAgIGpvaW5Db3VudGVyKys7XHJcbiAgICB2YXIgY2hhbm5lbElkID0gXCJQYXJhbGxlbEpvaW5Qb2ludFwiICsgam9pbkNvdW50ZXI7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICB2YXIgY291bnRlciA9IDA7XHJcbiAgICB2YXIgc3RvcE90aGVyRXhlY3V0aW9uICAgICA9IGZhbHNlO1xyXG5cclxuICAgIGZ1bmN0aW9uIGV4ZWN1dGlvblN0ZXAoc3RlcEZ1bmMsIGxvY2FsQXJncywgc3RvcCl7XHJcblxyXG4gICAgICAgIHRoaXMuZG9FeGVjdXRlID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYoc3RvcE90aGVyRXhlY3V0aW9uKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgICAgICBzdGVwRnVuYy5hcHBseShzd2FybSwgbG9jYWxBcmdzKTtcclxuICAgICAgICAgICAgICAgIGlmKHN0b3Ape1xyXG4gICAgICAgICAgICAgICAgICAgIHN0b3BPdGhlckV4ZWN1dGlvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vZXZlcnl0aW5nIGlzIGZpbmVcclxuICAgICAgICAgICAgfSBjYXRjaChlcnIpe1xyXG4gICAgICAgICAgICAgICAgYXJncy51bnNoaWZ0KGVycik7XHJcbiAgICAgICAgICAgICAgICBzZW5kRm9yU291bmRFeGVjdXRpb24oY2FsbGJhY2ssIGFyZ3MsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvL3N0b3AgaXQsIGRvIG5vdCBjYWxsIGFnYWluIGFueXRoaW5nXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpe1xyXG4gICAgICAgICQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihcImludmFsaWQgam9pblwiLHN3YXJtLCBcImludmFsaWQgZnVuY3Rpb24gYXQgam9pbiBpbiBzd2FybVwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgJCQuUFNLX1B1YlN1Yi5zdWJzY3JpYmUoY2hhbm5lbElkLGZ1bmN0aW9uKGZvckV4ZWN1dGlvbil7XHJcbiAgICAgICAgaWYoc3RvcE90aGVyRXhlY3V0aW9uKXtcclxuICAgICAgICAgICAgcmV0dXJuIDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgaWYoZm9yRXhlY3V0aW9uLmRvRXhlY3V0ZSgpKXtcclxuICAgICAgICAgICAgICAgIGRlY0NvdW50ZXIoKTtcclxuICAgICAgICAgICAgfSAvLyBoYWQgYW4gZXJyb3IuLi5cclxuICAgICAgICB9IGNhdGNoKGVycil7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgLy8kJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IoXCJfX2ludGVybmFsX19cIixzd2FybSwgXCJleGNlcHRpb24gaW4gdGhlIGV4ZWN1dGlvbiBvZiB0aGUgam9pbiBmdW5jdGlvbiBvZiBhIHBhcmFsbGVsIHRhc2tcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5jQ291bnRlcigpe1xyXG4gICAgICAgIGlmKHRlc3RJZlVuZGVySW5zcGVjdGlvbigpKXtcclxuICAgICAgICAgICAgLy9wcmV2ZW50aW5nIGluc3BlY3RvciBmcm9tIGluY3JlYXNpbmcgY291bnRlciB3aGVuIHJlYWRpbmcgdGhlIHZhbHVlcyBmb3IgZGVidWcgcmVhc29uXHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJwcmV2ZW50aW5nIGluc3BlY3Rpb25cIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY291bnRlcisrO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHRlc3RJZlVuZGVySW5zcGVjdGlvbigpe1xyXG4gICAgICAgIHZhciByZXMgPSBmYWxzZTtcclxuICAgICAgICB2YXIgY29uc3RBcmd2ID0gcHJvY2Vzcy5leGVjQXJndi5qb2luKCk7XHJcbiAgICAgICAgaWYoY29uc3RBcmd2LmluZGV4T2YoXCJpbnNwZWN0XCIpIT09LTEgfHwgY29uc3RBcmd2LmluZGV4T2YoXCJkZWJ1Z1wiKSE9PS0xKXtcclxuICAgICAgICAgICAgLy9vbmx5IHdoZW4gcnVubmluZyBpbiBkZWJ1Z1xyXG4gICAgICAgICAgICB2YXIgY2FsbHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s7XHJcbiAgICAgICAgICAgIGlmKGNhbGxzdGFjay5pbmRleE9mKFwiRGVidWdDb21tYW5kUHJvY2Vzc29yXCIpIT09LTEpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJEZWJ1Z0NvbW1hbmRQcm9jZXNzb3IgZGV0ZWN0ZWQhXCIpO1xyXG4gICAgICAgICAgICAgICAgcmVzID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNlbmRGb3JTb3VuZEV4ZWN1dGlvbihmdW5jdCwgYXJncywgc3RvcCl7XHJcbiAgICAgICAgdmFyIG9iaiA9IG5ldyBleGVjdXRpb25TdGVwKGZ1bmN0LCBhcmdzLCBzdG9wKTtcclxuICAgICAgICAkJC5QU0tfUHViU3ViLnB1Ymxpc2goY2hhbm5lbElkLCBvYmopOyAvLyBmb3JjZSBleGVjdXRpb24gdG8gYmUgXCJzb3VuZFwiXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVjQ291bnRlcigpe1xyXG4gICAgICAgIGNvdW50ZXItLTtcclxuICAgICAgICBpZihjb3VudGVyID09IDApIHtcclxuICAgICAgICAgICAgYXJncy51bnNoaWZ0KG51bGwpO1xyXG4gICAgICAgICAgICBzZW5kRm9yU291bmRFeGVjdXRpb24oY2FsbGJhY2ssIGFyZ3MsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGRlZmF1bHRQcm9ncmVzc1JlcG9ydChlcnIsIHJlcyl7XHJcbiAgICAgICAgaWYoZXJyKSB7XHJcbiAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdGV4dDpcIlBhcmFsbGVsIGV4ZWN1dGlvbiBwcm9ncmVzcyBldmVudFwiLFxyXG4gICAgICAgICAgICBzd2FybTpzd2FybSxcclxuICAgICAgICAgICAgYXJnczphcmdzLFxyXG4gICAgICAgICAgICBjdXJyZW50UmVzdWx0OnJlc1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbWtGdW5jdGlvbihuYW1lKXtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncyl7XHJcbiAgICAgICAgICAgIHZhciBmID0gZGVmYXVsdFByb2dyZXNzUmVwb3J0O1xyXG4gICAgICAgICAgICBpZihuYW1lICE9IFwicHJvZ3Jlc3NcIil7XHJcbiAgICAgICAgICAgICAgICBmID0gaW5uZXIubXlGdW5jdGlvbnNbbmFtZV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGFyZ3MgPSAkJC5fX2ludGVybi5ta0FyZ3MoYXJncywgMCk7XHJcbiAgICAgICAgICAgIHNlbmRGb3JTb3VuZEV4ZWN1dGlvbihmLCBhcmdzLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBfX3Byb3h5T2JqZWN0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgdGhpcy5nZXQgPSBmdW5jdGlvbih0YXJnZXQsIHByb3AsIHJlY2VpdmVyKXtcclxuICAgICAgICBpZihpbm5lci5teUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wKSB8fCBwcm9wID09IFwicHJvZ3Jlc3NcIil7XHJcbiAgICAgICAgICAgIGluY0NvdW50ZXIoKTtcclxuICAgICAgICAgICAgcmV0dXJuIG1rRnVuY3Rpb24ocHJvcCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzd2FybVtwcm9wXTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIF9fcHJveHlPYmplY3Q7XHJcblxyXG4gICAgdGhpcy5fX3NldFByb3h5T2JqZWN0ID0gZnVuY3Rpb24ocCl7XHJcbiAgICAgICAgX19wcm94eU9iamVjdCA9IHA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydHMuY3JlYXRlSm9pblBvaW50ID0gZnVuY3Rpb24oc3dhcm0sIGNhbGxiYWNrLCBhcmdzKXtcclxuICAgIHZhciBqcCA9IG5ldyBQYXJhbGxlbEpvaW5Qb2ludChzd2FybSwgY2FsbGJhY2ssIGFyZ3MpO1xyXG4gICAgdmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xyXG4gICAgdmFyIHAgPSBuZXcgUHJveHkoaW5uZXIsIGpwKTtcclxuICAgIGpwLl9fc2V0UHJveHlPYmplY3QocCk7XHJcbiAgICByZXR1cm4gcDtcclxufTsiLCJcclxuZnVuY3Rpb24gZW5jb2RlKGJ1ZmZlcikge1xyXG4gICAgcmV0dXJuIGJ1ZmZlci50b1N0cmluZygnYmFzZTY0JylcclxuICAgICAgICAucmVwbGFjZSgvXFwrL2csICcnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXC8vZywgJycpXHJcbiAgICAgICAgLnJlcGxhY2UoLz0rJC8sICcnKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIHN0YW1wV2l0aFRpbWUoYnVmLCBzYWx0LCBtc2FsdCl7XHJcbiAgICBpZighc2FsdCl7XHJcbiAgICAgICAgc2FsdCA9IDE7XHJcbiAgICB9XHJcbiAgICBpZighbXNhbHQpe1xyXG4gICAgICAgIG1zYWx0ID0gMTtcclxuICAgIH1cclxuICAgIHZhciBkYXRlID0gbmV3IERhdGU7XHJcbiAgICB2YXIgY3QgPSBNYXRoLmZsb29yKGRhdGUuZ2V0VGltZSgpIC8gc2FsdCk7XHJcbiAgICB2YXIgY291bnRlciA9IDA7XHJcbiAgICB3aGlsZShjdCA+IDAgKXtcclxuICAgICAgICAvL2NvbnNvbGUubG9nKFwiQ291bnRlclwiLCBjb3VudGVyLCBjdCk7XHJcbiAgICAgICAgYnVmW2NvdW50ZXIqbXNhbHRdID0gTWF0aC5mbG9vcihjdCAlIDI1Nik7XHJcbiAgICAgICAgY3QgPSBNYXRoLmZsb29yKGN0IC8gMjU2KTtcclxuICAgICAgICBjb3VudGVyKys7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qXHJcbiAgICBUaGUgdWlkIGNvbnRhaW5zIGFyb3VuZCAyNTYgYml0cyBvZiByYW5kb21uZXNzIGFuZCBhcmUgdW5pcXVlIGF0IHRoZSBsZXZlbCBvZiBzZWNvbmRzLiBUaGlzIFVVSUQgc2hvdWxkIGJ5IGNyeXB0b2dyYXBoaWNhbGx5IHNhZmUgKGNhbiBub3QgYmUgZ3Vlc3NlZClcclxuXHJcbiAgICBXZSBnZW5lcmF0ZSBhIHNhZmUgVUlEIHRoYXQgaXMgZ3VhcmFudGVlZCB1bmlxdWUgKGJ5IHVzYWdlIG9mIGEgUFJORyB0byBnZW5lYXRlIDI1NiBiaXRzKSBhbmQgdGltZSBzdGFtcGluZyB3aXRoIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyBhdCB0aGUgbW9tZW50IHdoZW4gaXMgZ2VuZXJhdGVkXHJcbiAgICBUaGlzIG1ldGhvZCBzaG91bGQgYmUgc2FmZSB0byB1c2UgYXQgdGhlIGxldmVsIG9mIHZlcnkgbGFyZ2UgZGlzdHJpYnV0ZWQgc3lzdGVtcy5cclxuICAgIFRoZSBVVUlEIGlzIHN0YW1wZWQgd2l0aCB0aW1lIChzZWNvbmRzKTogZG9lcyBpdCBvcGVuIGEgd2F5IHRvIGd1ZXNzIHRoZSBVVUlEPyBJdCBkZXBlbmRzIGhvdyBzYWZlIGlzIFwiY3J5cHRvXCIgUFJORywgYnV0IGl0IHNob3VsZCBiZSBubyBwcm9ibGVtLi4uXHJcblxyXG4gKi9cclxuXHJcbmV4cG9ydHMuc2FmZV91dWlkID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgIHJlcXVpcmUoJ2NyeXB0bycpLnJhbmRvbUJ5dGVzKDM2LCBmdW5jdGlvbiAoZXJyLCBidWYpIHtcclxuICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhbXBXaXRoVGltZShidWYsIDEwMDAsIDMpO1xyXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIGVuY29kZShidWYpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5cclxuLypcclxuICAgIFRyeSB0byBnZW5lcmF0ZSBhIHNtYWxsIFVJRCB0aGF0IGlzIHVuaXF1ZSBhZ2FpbnN0IGNoYW5jZSBpbiB0aGUgc2FtZSBtaWxsaXNlY29uZCBzZWNvbmQgYW5kIGluIGEgc3BlY2lmaWMgY29udGV4dCAoZWcgaW4gdGhlIHNhbWUgY2hvcmVvZ3JhcGh5IGV4ZWN1dGlvbilcclxuICAgIFRoZSBpZCBjb250YWlucyBhcm91bmQgNio4ID0gNDggIGJpdHMgb2YgcmFuZG9tbmVzcyBhbmQgYXJlIHVuaXF1ZSBhdCB0aGUgbGV2ZWwgb2YgbWlsbGlzZWNvbmRzXHJcbiAgICBUaGlzIG1ldGhvZCBpcyBzYWZlIG9uIGEgc2luZ2xlIGNvbXB1dGVyIGJ1dCBzaG91bGQgYmUgdXNlZCB3aXRoIGNhcmUgb3RoZXJ3aXNlXHJcbiAgICBUaGlzIFVVSUQgaXMgbm90IGNyeXB0b2dyYXBoaWNhbGx5IHNhZmUgKGNhbiBiZSBndWVzc2VkKVxyXG4gKi9cclxuZXhwb3J0cy5zaG9ydF91dWlkID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgIHJlcXVpcmUoJ2NyeXB0bycpLnJhbmRvbUJ5dGVzKDEyLCBmdW5jdGlvbiAoZXJyLCBidWYpIHtcclxuICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhbXBXaXRoVGltZShidWYsMSwyKTtcclxuICAgICAgICBjYWxsYmFjayhudWxsLCBlbmNvZGUoYnVmKSk7XHJcbiAgICB9KTtcclxufSIsIlxyXG52YXIgam9pbkNvdW50ZXIgPSAwO1xyXG5cclxuZnVuY3Rpb24gU2VyaWFsSm9pblBvaW50KHN3YXJtLCBjYWxsYmFjaywgYXJncyl7XHJcblxyXG4gICAgam9pbkNvdW50ZXIrKztcclxuXHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICB2YXIgY2hhbm5lbElkID0gXCJTZXJpYWxKb2luUG9pbnRcIiArIGpvaW5Db3VudGVyO1xyXG5cclxuICAgIGlmKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKXtcclxuICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IoXCJ1bmtub3duXCIsIHN3YXJtLCBcImludmFsaWQgZnVuY3Rpb24gZ2l2ZW4gdG8gc2VyaWFsIGluIHN3YXJtXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaW5uZXIgPSBzd2FybS5nZXRJbm5lclZhbHVlKCk7XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGRlZmF1bHRQcm9ncmVzc1JlcG9ydChlcnIsIHJlcyl7XHJcbiAgICAgICAgaWYoZXJyKSB7XHJcbiAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgIH1cclxuXHJcblxyXG4gICAgdmFyIGZ1bmN0aW9uQ291bnRlciAgICAgPSAwO1xyXG4gICAgdmFyIGV4ZWN1dGlvbkNvdW50ZXIgICAgPSAwO1xyXG5cclxuICAgIHZhciBwbGFubmVkRXhlY3V0aW9ucyAgID0gW107XHJcbiAgICB2YXIgcGxhbm5lZEFyZ3VtZW50cyAgICA9IHt9O1xyXG5cclxuICAgIGZ1bmN0aW9uIG1rRnVuY3Rpb24obmFtZSwgcG9zKXtcclxuICAgICAgICAvL2NvbnNvbGUubG9nKFwiQ3JlYXRpbmcgZnVuY3Rpb24gXCIsIG5hbWUsIHBvcyk7XHJcbiAgICAgICAgcGxhbm5lZEFyZ3VtZW50c1twb3NdID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiB0cmlnZ2V0TmV4dFN0ZXAoKXtcclxuICAgICAgICAgICAgaWYocGxhbm5lZEV4ZWN1dGlvbnMubGVuZ3RoID09IGV4ZWN1dGlvbkNvdW50ZXIgfHwgcGxhbm5lZEFyZ3VtZW50c1tleGVjdXRpb25Db3VudGVyXSApICB7XHJcbiAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLnB1Ymxpc2goY2hhbm5lbElkLCBzZWxmKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGYgPSBmdW5jdGlvbiAoLi4uYXJncyl7XHJcbiAgICAgICAgICAgIGlmKGV4ZWN1dGlvbkNvdW50ZXIgIT0gcG9zKSB7XHJcbiAgICAgICAgICAgICAgICBwbGFubmVkQXJndW1lbnRzW3Bvc10gPSBhcmdzO1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIkRlbGF5aW5nIGZ1bmN0aW9uOlwiLCBleGVjdXRpb25Db3VudGVyLCBwb3MsIHBsYW5uZWRBcmd1bWVudHMsIGFyZ3VtZW50cywgZnVuY3Rpb25Db3VudGVyKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBfX3Byb3h5O1xyXG4gICAgICAgICAgICB9IGVsc2V7XHJcbiAgICAgICAgICAgICAgICBpZihwbGFubmVkQXJndW1lbnRzW3Bvc10pe1xyXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJFeGVjdXRpbmcgIGZ1bmN0aW9uOlwiLCBleGVjdXRpb25Db3VudGVyLCBwb3MsIHBsYW5uZWRBcmd1bWVudHMsIGFyZ3VtZW50cywgZnVuY3Rpb25Db3VudGVyKTtcclxuXHRcdFx0XHRcdGFyZ3MgPSBwbGFubmVkQXJndW1lbnRzW3Bvc107XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYW5uZWRBcmd1bWVudHNbcG9zXSA9IGFyZ3M7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJpZ2dldE5leHRTdGVwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9fcHJveHk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBmID0gZGVmYXVsdFByb2dyZXNzUmVwb3J0O1xyXG4gICAgICAgICAgICBpZihuYW1lICE9IFwicHJvZ3Jlc3NcIil7XHJcbiAgICAgICAgICAgICAgICBmID0gaW5uZXIubXlGdW5jdGlvbnNbbmFtZV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgICAgICBmLmFwcGx5KHNlbGYsYXJncyk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICAgICAgICAgICAgICBhcmdzLnVuc2hpZnQoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShzd2FybSxhcmdzKTsgLy9lcnJvclxyXG4gICAgICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIudW5zdWJzY3JpYmUoY2hhbm5lbElkLHJ1bk5leHRGdW5jdGlvbik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vdGVybWluYXRlIGV4ZWN1dGlvbiB3aXRoIGFuIGVycm9yLi4uIVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGV4ZWN1dGlvbkNvdW50ZXIrKztcclxuXHJcbiAgICAgICAgICAgIHRyaWdnZXROZXh0U3RlcCgpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIF9fcHJveHk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxhbm5lZEV4ZWN1dGlvbnMucHVzaChmKTtcclxuICAgICAgICBmdW5jdGlvbkNvdW50ZXIrKztcclxuICAgICAgICByZXR1cm4gZjtcclxuICAgIH1cclxuXHJcbiAgICAgdmFyIGZpbmlzaGVkID0gZmFsc2U7XHJcblxyXG4gICAgZnVuY3Rpb24gcnVuTmV4dEZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaWYoZXhlY3V0aW9uQ291bnRlciA9PSBwbGFubmVkRXhlY3V0aW9ucy5sZW5ndGggKXtcclxuICAgICAgICAgICAgaWYoIWZpbmlzaGVkKXtcclxuICAgICAgICAgICAgICAgIGFyZ3MudW5zaGlmdChudWxsKTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHN3YXJtLGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgJCQuUFNLX1B1YlN1Yi51bnN1YnNjcmliZShjaGFubmVsSWQscnVuTmV4dEZ1bmN0aW9uKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic2VyaWFsIGNvbnN0cnVjdCBpcyB1c2luZyBmdW5jdGlvbnMgdGhhdCBhcmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzLi4uXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGxhbm5lZEV4ZWN1dGlvbnNbZXhlY3V0aW9uQ291bnRlcl0oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgJCQuUFNLX1B1YlN1Yi5zdWJzY3JpYmUoY2hhbm5lbElkLHJ1bk5leHRGdW5jdGlvbik7IC8vIGZvcmNlIGl0IHRvIGJlIFwic291bmRcIlxyXG5cclxuXHJcbiAgICB0aGlzLmdldCA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpe1xyXG4gICAgICAgIGlmKHByb3AgPT0gXCJwcm9ncmVzc1wiIHx8IGlubmVyLm15RnVuY3Rpb25zLmhhc093blByb3BlcnR5KHByb3ApKXtcclxuICAgICAgICAgICAgcmV0dXJuIG1rRnVuY3Rpb24ocHJvcCwgZnVuY3Rpb25Db3VudGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN3YXJtW3Byb3BdO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBfX3Byb3h5O1xyXG4gICAgdGhpcy5zZXRQcm94eU9iamVjdCA9IGZ1bmN0aW9uKHApe1xyXG4gICAgICAgIF9fcHJveHkgPSBwO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnRzLmNyZWF0ZVNlcmlhbEpvaW5Qb2ludCA9IGZ1bmN0aW9uKHN3YXJtLCBjYWxsYmFjaywgYXJncyl7XHJcbiAgICB2YXIganAgPSBuZXcgU2VyaWFsSm9pblBvaW50KHN3YXJtLCBjYWxsYmFjaywgYXJncyk7XHJcbiAgICB2YXIgaW5uZXIgPSBzd2FybS5nZXRJbm5lclZhbHVlKCk7XHJcbiAgICB2YXIgcCA9IG5ldyBQcm94eShpbm5lciwganApO1xyXG4gICAganAuc2V0UHJveHlPYmplY3QocCk7XHJcbiAgICByZXR1cm4gcDtcclxufSIsImZ1bmN0aW9uIFN3YXJtU3BhY2Uoc3dhcm1UeXBlLCB1dGlscykge1xyXG5cclxuICAgIHZhciBiZWVzSGVhbGVyID0gJCQucmVxdWlyZShcInNvdW5kcHVic3ViXCIpLmJlZXNIZWFsZXI7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0RnVsbE5hbWUoc2hvcnROYW1lKXtcclxuICAgICAgICB2YXIgZnVsbE5hbWU7XHJcbiAgICAgICAgaWYoc2hvcnROYW1lICYmIHNob3J0TmFtZS5pbmNsdWRlcyhcIi5cIikpIHtcclxuICAgICAgICAgICAgZnVsbE5hbWUgPSBzaG9ydE5hbWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZnVsbE5hbWUgPSAkJC5saWJyYXJ5UHJlZml4ICsgXCIuXCIgKyBzaG9ydE5hbWU7IC8vVE9ETzogY2hlY2sgbW9yZSBhYm91dCAuICE/XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmdWxsTmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBWYXJEZXNjcmlwdGlvbihkZXNjKXtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpbml0OmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXN0b3JlOmZ1bmN0aW9uKGpzb25TdHJpbmcpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoanNvblN0cmluZyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRvSnNvblN0cmluZzpmdW5jdGlvbih4KXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBTd2FybURlc2NyaXB0aW9uKHN3YXJtVHlwZU5hbWUsIGRlc2NyaXB0aW9uKXtcclxuXHJcbiAgICAgICAgc3dhcm1UeXBlTmFtZSA9IGdldEZ1bGxOYW1lKHN3YXJtVHlwZU5hbWUpO1xyXG5cclxuICAgICAgICB2YXIgbG9jYWxJZCA9IDA7ICAvLyB1bmlxdWUgZm9yIGVhY2ggc3dhcm1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlVmFycyhkZXNjcil7XHJcbiAgICAgICAgICAgIHZhciBtZW1iZXJzID0ge307XHJcbiAgICAgICAgICAgIGZvcih2YXIgdiBpbiBkZXNjcil7XHJcbiAgICAgICAgICAgICAgICBtZW1iZXJzW3ZdID0gbmV3IFZhckRlc2NyaXB0aW9uKGRlc2NyW3ZdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbWVtYmVycztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZU1lbWJlcnMoZGVzY3Ipe1xyXG4gICAgICAgICAgICB2YXIgbWVtYmVycyA9IHt9O1xyXG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gZGVzY3JpcHRpb24pe1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHYgIT0gXCJwdWJsaWNcIiAmJiB2ICE9IFwicHJpdmF0ZVwiKXtcclxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzW3ZdID0gZGVzY3JpcHRpb25bdl07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG1lbWJlcnM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgcHVibGljVmFycyA9IGNyZWF0ZVZhcnMoZGVzY3JpcHRpb24ucHVibGljKTtcclxuICAgICAgICB2YXIgcHJpdmF0ZVZhcnMgPSBjcmVhdGVWYXJzKGRlc2NyaXB0aW9uLnByaXZhdGUpO1xyXG4gICAgICAgIHZhciBteUZ1bmN0aW9ucyA9IGNyZWF0ZU1lbWJlcnMoZGVzY3JpcHRpb24pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVQaGFzZSh0aGlzSW5zdGFuY2UsIGZ1bmMpe1xyXG4gICAgICAgICAgICB2YXIgcGhhc2UgPSBmdW5jdGlvbiguLi5hcmdzKXtcclxuICAgICAgICAgICAgICAgIHZhciByZXQ7XHJcbiAgICAgICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgICAgICAgICAgJCQuUFNLX1B1YlN1Yi5ibG9ja0NhbGxCYWNrcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldCA9IGZ1bmMuYXBwbHkodGhpc0luc3RhbmNlLCBhcmdzKTtcclxuICAgICAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLnJlbGVhc2VDYWxsQmFja3MoKTtcclxuICAgICAgICAgICAgICAgIH1jYXRjaChlcnIpe1xyXG4gICAgICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIucmVsZWFzZUNhbGxCYWNrcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9keW5hbWljIG5hbWVkIGZ1bmMgaW4gb3JkZXIgdG8gaW1wcm92ZSBjYWxsc3RhY2tcclxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHBoYXNlLCBcIm5hbWVcIiwge2dldDogZnVuY3Rpb24oKXtyZXR1cm4gc3dhcm1UeXBlTmFtZStcIi5cIitmdW5jLm5hbWV9fSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwaGFzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGlzZSA9IGZ1bmN0aW9uKHNlcmlhbGlzZWRWYWx1ZXMpe1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgICAgICAgICAgIHB1YmxpY1ZhcnM6e1xyXG5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwcml2YXRlVmFyczp7XHJcblxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHByb3RlY3RlZFZhcnM6e1xyXG5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBteUZ1bmN0aW9uczp7XHJcblxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHV0aWxpdHlGdW5jdGlvbnM6e1xyXG5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBtZXRhOntcclxuICAgICAgICAgICAgICAgICAgICBzd2FybVR5cGVOYW1lOnN3YXJtVHlwZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1EZXNjcmlwdGlvbjpkZXNjcmlwdGlvblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgICAgIGZvcih2YXIgdiBpbiBwdWJsaWNWYXJzKXtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdWJsaWNWYXJzW3ZdID0gcHVibGljVmFyc1t2XS5pbml0KCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gcHJpdmF0ZVZhcnMpe1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnByaXZhdGVWYXJzW3ZdID0gcHJpdmF0ZVZhcnNbdl0uaW5pdCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgICAgIGlmKHNlcmlhbGlzZWRWYWx1ZXMpe1xyXG4gICAgICAgICAgICAgICAgYmVlc0hlYWxlci5qc29uVG9OYXRpdmUoc2VyaWFsaXNlZFZhbHVlcywgcmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGlzZUZ1bmN0aW9ucyA9IGZ1bmN0aW9uKHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0KXtcclxuXHJcbiAgICAgICAgICAgIGZvcih2YXIgdiBpbiBteUZ1bmN0aW9ucyl7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZU9iamVjdC5teUZ1bmN0aW9uc1t2XSA9IGNyZWF0ZVBoYXNlKHRoaXNPYmplY3QsIG15RnVuY3Rpb25zW3ZdKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxvY2FsSWQrKztcclxuICAgICAgICAgICAgdmFsdWVPYmplY3QudXRpbGl0eUZ1bmN0aW9ucyA9IHV0aWxzLmNyZWF0ZUZvck9iamVjdCh2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbih0YXJnZXQsIHByb3BlcnR5LCByZWNlaXZlcil7XHJcblxyXG5cclxuICAgICAgICAgICAgaWYocHVibGljVmFycy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQucHVibGljVmFyc1twcm9wZXJ0eV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHByaXZhdGVWYXJzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5wcml2YXRlVmFyc1twcm9wZXJ0eV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHRhcmdldC51dGlsaXR5RnVuY3Rpb25zLmhhc093blByb3BlcnR5KHByb3BlcnR5KSlcclxuICAgICAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQudXRpbGl0eUZ1bmN0aW9uc1twcm9wZXJ0eV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICBpZihteUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQubXlGdW5jdGlvbnNbcHJvcGVydHldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZih0YXJnZXQucHJvdGVjdGVkVmFycy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQucHJvdGVjdGVkVmFyc1twcm9wZXJ0eV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiBwcm9wZXJ0eSAhPSBcInN5bWJvbFwiKSB7XHJcbiAgICAgICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IocHJvcGVydHksIHRhcmdldCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2V0ID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUsIHJlY2VpdmVyKXtcclxuXHJcbiAgICAgICAgICAgIGlmKHRhcmdldC51dGlsaXR5RnVuY3Rpb25zLmhhc093blByb3BlcnR5KHByb3BlcnR5KSB8fCB0YXJnZXQubXlGdW5jdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XHJcbiAgICAgICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IocHJvcGVydHkpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVHJ5aW5nIHRvIG92ZXJ3cml0ZSBpbW11dGFibGUgbWVtYmVyXCIgKyBwcm9wZXJ0eSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHByaXZhdGVWYXJzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnByaXZhdGVWYXJzW3Byb3BlcnR5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9IGVsc2VcclxuICAgICAgICAgICAgaWYocHVibGljVmFycy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5wdWJsaWNWYXJzW3Byb3BlcnR5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnByb3RlY3RlZFZhcnNbcHJvcGVydHldID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFwcGx5ID0gZnVuY3Rpb24odGFyZ2V0LCB0aGlzQXJnLCBhcmd1bWVudHNMaXN0KXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJQcm94eSBhcHBseVwiKTtcclxuICAgICAgICAgICAgLy92YXIgZnVuYyA9IHRhcmdldFtdXHJcbiAgICAgICAgICAgIC8vc3dhcm1HbG9iYWxzLmV4ZWN1dGlvblByb3ZpZGVyLmV4ZWN1dGUobnVsbCwgdGhpc0FyZywgZnVuYywgYXJndW1lbnRzTGlzdClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgdGhpcy5pc0V4dGVuc2libGUgPSBmdW5jdGlvbih0YXJnZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaGFzID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wKSB7XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC5wdWJsaWNWYXJzW3Byb3BdIHx8IHRhcmdldC5wcm90ZWN0ZWRWYXJzW3Byb3BdKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5vd25LZXlzID0gZnVuY3Rpb24odGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0Lm93bktleXModGFyZ2V0LnB1YmxpY1ZhcnMpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihzZXJpYWxpc2VkVmFsdWVzKXtcclxuICAgICAgICAgICAgdmFyIHZhbHVlT2JqZWN0ID0gc2VsZi5pbml0aWFsaXNlKHNlcmlhbGlzZWRWYWx1ZXMpO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IFByb3h5KHZhbHVlT2JqZWN0LHNlbGYpO1xyXG4gICAgICAgICAgICBzZWxmLmluaXRpYWxpc2VGdW5jdGlvbnModmFsdWVPYmplY3QscmVzdWx0KTtcclxuICAgICAgICAgICAgaWYoIXNlcmlhbGlzZWRWYWx1ZXMpe1xyXG4gICAgICAgICAgICAgICAgJCQudWlkR2VuZXJhdG9yLnNhZmVfdXVpZChmdW5jdGlvbiAoZXJyLCByZXN1bHQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCF2YWx1ZU9iamVjdC5tZXRhLnN3YXJtSWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZU9iamVjdC5tZXRhLnN3YXJtSWQgPSByZXN1bHQ7ICAvL2RvIG5vdCBvdmVyd3JpdGUhISFcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVPYmplY3QudXRpbGl0eUZ1bmN0aW9ucy5ub3RpZnkoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBkZXNjcmlwdGlvbnMgPSB7fTtcclxuXHJcbiAgICB0aGlzLmRlc2NyaWJlID0gZnVuY3Rpb24gZGVzY3JpYmVTd2FybShzd2FybVR5cGVOYW1lLCBkZXNjcmlwdGlvbil7XHJcbiAgICAgICAgc3dhcm1UeXBlTmFtZSA9IGdldEZ1bGxOYW1lKHN3YXJtVHlwZU5hbWUpO1xyXG5cclxuICAgICAgICB2YXIgcG9pbnRQb3MgPSBzd2FybVR5cGVOYW1lLmxhc3RJbmRleE9mKCcuJyk7XHJcbiAgICAgICAgdmFyIHNob3J0TmFtZSA9IHN3YXJtVHlwZU5hbWUuc3Vic3RyKCBwb2ludFBvcysgMSk7XHJcbiAgICAgICAgdmFyIGxpYnJhcnlOYW1lID0gc3dhcm1UeXBlTmFtZS5zdWJzdHIoMCwgcG9pbnRQb3MpO1xyXG4gICAgICAgIGlmKCFsaWJyYXJ5TmFtZSl7XHJcbiAgICAgICAgICAgIGxpYnJhcnlOYW1lID0gXCJnbG9iYWxcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBkZXNjcmlwdGlvbiA9IG5ldyBTd2FybURlc2NyaXB0aW9uKHN3YXJtVHlwZU5hbWUsIGRlc2NyaXB0aW9uKTtcclxuICAgICAgICBpZihkZXNjcmlwdGlvbnNbc3dhcm1UeXBlTmFtZV0gIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLndhcm5pbmcoXCJEdXBsaWNhdGUgc3dhcm0gZGVzY3JpcHRpb24gXCIrIHN3YXJtVHlwZU5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZGVzY3JpcHRpb25zW3N3YXJtVHlwZU5hbWVdID0gZGVzY3JpcHRpb247XHJcblxyXG4gICAgICAgIGlmKCQkLnJlZ2lzdGVyU3dhcm1EZXNjcmlwdGlvbil7XHJcblx0XHRcdCQkLnJlZ2lzdGVyU3dhcm1EZXNjcmlwdGlvbihsaWJyYXJ5TmFtZSwgc2hvcnROYW1lLCBzd2FybVR5cGVOYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRlc2NyaXB0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlU3dhcm0oc3dhcm1UeXBlTmFtZSwgZGVzY3JpcHRpb24sIGluaXRpYWxWYWx1ZXMpe1xyXG4gICAgICAgIHN3YXJtVHlwZU5hbWUgPSBnZXRGdWxsTmFtZShzd2FybVR5cGVOYW1lKTtcclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGlmKHVuZGVmaW5lZCA9PSBkZXNjcmlwdGlvbil7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zW3N3YXJtVHlwZU5hbWVdKGluaXRpYWxWYWx1ZXMpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVzY3JpYmUoc3dhcm1UeXBlTmFtZSwgZGVzY3JpcHRpb24pKGluaXRpYWxWYWx1ZXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaChlcnIpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNyZWF0ZVN3YXJtIGVycm9yXCIsIGVycik7XHJcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci5lcnJvcihlcnIsIGFyZ3VtZW50cywgXCJXcm9uZyBuYW1lIG9yIGRlc2NyaXB0aW9uc1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZXN0YXJ0ID0gZnVuY3Rpb24oc3dhcm1UeXBlTmFtZSwgaW5pdGlhbFZhbHVlcyl7XHJcbiAgICAgICAgc3dhcm1UeXBlTmFtZSA9IGdldEZ1bGxOYW1lKHN3YXJtVHlwZU5hbWUpO1xyXG4gICAgICAgIHZhciBkZXNjID0gZGVzY3JpcHRpb25zW3N3YXJtVHlwZU5hbWVdO1xyXG5cclxuICAgICAgICBpZihkZXNjKXtcclxuICAgICAgICAgICAgcmV0dXJuIGRlc2MoaW5pdGlhbFZhbHVlcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKHN3YXJtVHlwZU5hbWUsaW5pdGlhbFZhbHVlcyxcclxuICAgICAgICAgICAgICAgIFwiRmFpbGVkIHRvIHJlc3RhcnQgYSBzd2FybSB3aXRoIHR5cGUgXCIgKyBzd2FybVR5cGVOYW1lICsgXCJcXG4gTWF5YmUgZGlmZnJlbnQgc3dhcm0gc3BhY2UgKHVzZWQgZmxvdyBpbnN0ZWFkIG9mIHN3YXJtIT8pXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oc3dhcm1UeXBlTmFtZSwgLi4ucGFyYW1zKXtcclxuICAgICAgICBzd2FybVR5cGVOYW1lID0gZ2V0RnVsbE5hbWUoc3dhcm1UeXBlTmFtZSk7XHJcbiAgICAgICAgdmFyIGRlc2MgPSBkZXNjcmlwdGlvbnNbc3dhcm1UeXBlTmFtZV07XHJcbiAgICAgICAgaWYoIWRlc2Mpe1xyXG4gICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IobnVsbCwgc3dhcm1UeXBlTmFtZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcmVzID0gZGVzYygpO1xyXG5cclxuICAgICAgICBpZihwYXJhbXMubGVuZ3RoID4gMSl7XHJcbiAgICAgICAgICAgIHZhciBhcmdzID1bXTtcclxuICAgICAgICAgICAgZm9yKHZhciBpID0gMDtpIDwgcGFyYW1zLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgICAgIGFyZ3MucHVzaChwYXJhbXNbaV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlcy5zd2FybS5hcHBseShyZXMsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0cy5jcmVhdGVTd2FybUVuZ2luZSA9IGZ1bmN0aW9uKHN3YXJtVHlwZSwgdXRpbHMpe1xyXG4gICAgaWYodHlwZW9mIHV0aWxzID09IFwidW5kZWZpbmVkXCIpe1xyXG4gICAgICAgIHV0aWxzID0gcmVxdWlyZShcIi4vY2hvcmVvZ3JhcGhpZXMvdXRpbGl0eUZ1bmN0aW9ucy9jYWxsZmxvd1wiKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgU3dhcm1TcGFjZShzd2FybVR5cGUsIHV0aWxzKTtcclxufTsiLCJpZih0eXBlb2Ygc2luZ2xldG9uX2NvbnRhaW5lcl9tb2R1bGVfd29ya2Fyb3VuZF9mb3Jfd2lyZWRfbm9kZV9qc19jYWNoaW5nID09ICd1bmRlZmluZWQnKSB7XHJcbiAgICBzaW5nbGV0b25fY29udGFpbmVyX21vZHVsZV93b3JrYXJvdW5kX2Zvcl93aXJlZF9ub2RlX2pzX2NhY2hpbmcgICA9IG1vZHVsZTtcclxufSBlbHNlIHtcclxuICAgIG1vZHVsZS5leHBvcnRzID0gc2luZ2xldG9uX2NvbnRhaW5lcl9tb2R1bGVfd29ya2Fyb3VuZF9mb3Jfd2lyZWRfbm9kZV9qc19jYWNoaW5nIC5leHBvcnRzO1xyXG4gICAgcmV0dXJuIG1vZHVsZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZWQgYnkgc2FsYm9haWUgb24gNC8yNy8xNS5cclxuICovXHJcbmZ1bmN0aW9uIENvbnRhaW5lcihlcnJvckhhbmRsZXIpe1xyXG4gICAgdmFyIHRoaW5ncyA9IHt9OyAgICAgICAgLy90aGUgYWN0dWFsIHZhbHVlcyBmb3Igb3VyIHNlcnZpY2VzLCB0aGluZ3NcclxuICAgIHZhciBpbW1lZGlhdGUgPSB7fTsgICAgIC8vaG93IGRlcGVuZGVuY2llcyB3ZXJlIGRlY2xhcmVkXHJcbiAgICB2YXIgY2FsbGJhY2tzID0ge307ICAgICAvL2NhbGxiYWNrIHRoYXQgc2hvdWxkIGJlIGNhbGxlZCBmb3IgZWFjaCBkZXBlbmRlbmN5IGRlY2xhcmF0aW9uXHJcbiAgICB2YXIgZGVwc0NvdW50ZXIgPSB7fTsgICAvL2NvdW50IGRlcGVuZGVuY2llc1xyXG4gICAgdmFyIHJldmVyc2VkVHJlZSA9IHt9OyAgLy9yZXZlcnNlZCBkZXBlbmRlbmNpZXMsIG9wcG9zaXRlIG9mIGltbWVkaWF0ZSBvYmplY3RcclxuXHJcbiAgICAgdGhpcy5kdW1wID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgY29uc29sZS5sb2coXCJDb25hdGluZXIgZHVtcFxcbiBUaGluZ3M6XCIsIHRoaW5ncywgXCJcXG5EZXBzIGNvdW50ZXI6IFwiLCBkZXBzQ291bnRlciwgXCJcXG5TdHJpZ2h0OlwiLCBpbW1lZGlhdGUsIFwiXFxuUmV2ZXJzZWQ6XCIsIHJldmVyc2VkVHJlZSk7XHJcbiAgICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluY0NvdW50ZXIobmFtZSl7XHJcbiAgICAgICAgaWYoIWRlcHNDb3VudGVyW25hbWVdKXtcclxuICAgICAgICAgICAgZGVwc0NvdW50ZXJbbmFtZV0gPSAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGRlcHNDb3VudGVyW25hbWVdKys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluc2VydERlcGVuZGVuY3lpblJUKG5vZGVOYW1lLCBkZXBlbmRlbmNpZXMpe1xyXG4gICAgICAgIGRlcGVuZGVuY2llcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW1OYW1lKXtcclxuICAgICAgICAgICAgdmFyIGwgPSByZXZlcnNlZFRyZWVbaXRlbU5hbWVdO1xyXG4gICAgICAgICAgICBpZighbCl7XHJcbiAgICAgICAgICAgICAgICBsID0gcmV2ZXJzZWRUcmVlW2l0ZW1OYW1lXSA9IHt9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxbbm9kZU5hbWVdID0gbm9kZU5hbWU7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gZGlzY292ZXJVcE5vZGVzKG5vZGVOYW1lKXtcclxuICAgICAgICB2YXIgcmVzID0ge307XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIERGUyhubil7XHJcbiAgICAgICAgICAgIHZhciBsID0gcmV2ZXJzZWRUcmVlW25uXTtcclxuICAgICAgICAgICAgZm9yKHZhciBpIGluIGwpe1xyXG4gICAgICAgICAgICAgICAgaWYoIXJlc1tpXSl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzW2ldID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBERlMoaSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIERGUyhub2RlTmFtZSk7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHJlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVzZXRDb3VudGVyKG5hbWUpe1xyXG4gICAgICAgIHZhciBkZXBlbmRlbmN5QXJyYXkgPSBpbW1lZGlhdGVbbmFtZV07XHJcbiAgICAgICAgdmFyIGNvdW50ZXIgPSAwO1xyXG4gICAgICAgIGlmKGRlcGVuZGVuY3lBcnJheSl7XHJcbiAgICAgICAgICAgIGRlcGVuZGVuY3lBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGRlcCl7XHJcbiAgICAgICAgICAgICAgICBpZih0aGluZ3NbZGVwXSA9PSBudWxsKXtcclxuICAgICAgICAgICAgICAgICAgICBpbmNDb3VudGVyKG5hbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRlcisrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBkZXBzQ291bnRlcltuYW1lXSA9IGNvdW50ZXI7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkNvdW50ZXIgZm9yIFwiLCBuYW1lLCAnIGlzICcsIGNvdW50ZXIpO1xyXG4gICAgICAgIHJldHVybiBjb3VudGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qIHJldHVybnMgdGhvc2UgdGhhdCBhcmUgcmVhZHkgdG8gYmUgcmVzb2x2ZWQqL1xyXG4gICAgZnVuY3Rpb24gcmVzZXRVcENvdW50ZXJzKG5hbWUpe1xyXG4gICAgICAgIHZhciByZXQgPSBbXTtcclxuICAgICAgICAvL2NvbnNvbGUubG9nKCdSZXNldGluZyB1cCBjb3VudGVycyBmb3IgJywgbmFtZSwgXCJSZXZlcnNlOlwiLCByZXZlcnNlZFRyZWVbbmFtZV0pO1xyXG4gICAgICAgIHZhciB1cHMgPSByZXZlcnNlZFRyZWVbbmFtZV07XHJcbiAgICAgICAgZm9yKHZhciB2IGluIHVwcyl7XHJcbiAgICAgICAgICAgIGlmKHJlc2V0Q291bnRlcih2KSA9PSAwKXtcclxuICAgICAgICAgICAgICAgIHJldC5wdXNoKHYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAgICAgVGhlIGZpcnN0IGFyZ3VtZW50IGlzIGEgbmFtZSBmb3IgYSBzZXJ2aWNlLCB2YXJpYWJsZSxhICB0aGluZyB0aGF0IHNob3VsZCBiZSBpbml0aWFsaXNlZCwgcmVjcmVhdGVkLCBldGNcclxuICAgICAgICAgVGhlIHNlY29uZCBhcmd1bWVudCBpcyBhbiBhcnJheSB3aXRoIGRlcGVuZGVuY2llc1xyXG4gICAgICAgICB0aGUgbGFzdCBhcmd1bWVudCBpcyBhIGZ1bmN0aW9uKGVyciwuLi4pIHRoYXQgaXMgY2FsbGVkIHdoZW4gZGVwZW5kZW5jaWVzIGFyZSByZWFkeSBvciByZWNhbGxlZCB3aGVuIGFyZSBub3QgcmVhZHkgKHN0b3Agd2FzIGNhbGxlZClcclxuICAgICAgICAgSWYgZXJyIGlzIG5vdCB1bmRlZmluZWQgaXQgbWVhbnMgdGhhdCBvbmUgb3IgYW55IHVuZGVmaW5lZCB2YXJpYWJsZXMgYXJlIG5vdCByZWFkeSBhbmQgdGhlIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIGFnYWluIGxhdGVyXHJcbiAgICAgICAgIEFsbCB0aGUgb3RoZXIgYXJndW1lbnRzIGFyZSB0aGUgY29ycmVzcG9uZGluZyBhcmd1bWVudHMgb2YgdGhlIGNhbGxiYWNrIHdpbGwgYmUgdGhlIGFjdHVhbCB2YWx1ZXMgb2YgdGhlIGNvcnJlc3BvbmRpbmcgZGVwZW5kZW5jeVxyXG4gICAgICAgICBUaGUgY2FsbGJhY2sgZnVuY3Rpb25zIHNob3VsZCByZXR1cm4gdGhlIGN1cnJlbnQgdmFsdWUgKG9yIG51bGwpXHJcbiAgICAgKi9cclxuICAgIHRoaXMuZGVjbGFyZURlcGVuZGVuY3kgPSBmdW5jdGlvbihuYW1lLCBkZXBlbmRlbmN5QXJyYXksIGNhbGxiYWNrKXtcclxuICAgICAgICBpZihjYWxsYmFja3NbbmFtZV0pe1xyXG4gICAgICAgICAgICBlcnJvckhhbmRsZXIuaWdub3JlUG9zc2libGVFcnJvcihcIkR1cGxpY2F0ZSBkZXBlbmRlbmN5OlwiICsgbmFtZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2FsbGJhY2tzW25hbWVdID0gY2FsbGJhY2s7XHJcbiAgICAgICAgICAgIGltbWVkaWF0ZVtuYW1lXSAgID0gZGVwZW5kZW5jeUFycmF5O1xyXG4gICAgICAgICAgICBpbnNlcnREZXBlbmRlbmN5aW5SVChuYW1lLCBkZXBlbmRlbmN5QXJyYXkpO1xyXG4gICAgICAgICAgICB0aGluZ3NbbmFtZV0gPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHVuc2F0aXNmaWVkQ291bnRlciA9IHJlc2V0Q291bnRlcihuYW1lKTtcclxuICAgICAgICBpZih1bnNhdGlzZmllZENvdW50ZXIgPT0gMCApe1xyXG4gICAgICAgICAgICBjYWxsRm9yVGhpbmcobmFtZSwgZmFsc2UpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNhbGxGb3JUaGluZyhuYW1lLCB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgICAgY3JlYXRlIGEgc2VydmljZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnNlcnZpY2UgPSBmdW5jdGlvbihuYW1lLCBkZXBlbmRlbmN5QXJyYXksIGNvbnN0cnVjdG9yKXtcclxuICAgICAgICB0aGlzLmRlY2xhcmVEZXBlbmRlbmN5KG5hbWUsIGRlcGVuZGVuY3lBcnJheSwgY29uc3RydWN0b3IpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICB2YXIgc3Vic3lzdGVtQ291bnRlciA9IDA7XHJcbiAgICAvKlxyXG4gICAgIGNyZWF0ZSBhIGFub255bW91cyBzdWJzeXN0ZW1cclxuICAgICAqL1xyXG4gICAgdGhpcy5zdWJzeXN0ZW0gPSBmdW5jdGlvbihkZXBlbmRlbmN5QXJyYXksIGNvbnN0cnVjdG9yKXtcclxuICAgICAgICBzdWJzeXN0ZW1Db3VudGVyKys7XHJcbiAgICAgICAgdGhpcy5kZWNsYXJlRGVwZW5kZW5jeShcImRpY29udGFpbmVyX3N1YnN5c3RlbV9wbGFjZWhvbGRlclwiICsgc3Vic3lzdGVtQ291bnRlciwgZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLyogbm90IGRvY3VtZW50ZWQuLiBsaW1ibyBzdGF0ZSovXHJcbiAgICB0aGlzLmZhY3RvcnkgPSBmdW5jdGlvbihuYW1lLCBkZXBlbmRlbmN5QXJyYXksIGNvbnN0cnVjdG9yKXtcclxuICAgICAgICB0aGlzLmRlY2xhcmVEZXBlbmRlbmN5KG5hbWUsIGRlcGVuZGVuY3lBcnJheSwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb25zdHJ1Y3RvcigpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2FsbEZvclRoaW5nKG5hbWUsIG91dE9mU2VydmljZSl7XHJcbiAgICAgICAgdmFyIGFyZ3MgPSBpbW1lZGlhdGVbbmFtZV0ubWFwKGZ1bmN0aW9uKGl0ZW0pe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpbmdzW2l0ZW1dO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGFyZ3MudW5zaGlmdChvdXRPZlNlcnZpY2UpO1xyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgdmFyIHZhbHVlID0gY2FsbGJhY2tzW25hbWVdLmFwcGx5KHt9LGFyZ3MpO1xyXG4gICAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICAgICAgZXJyb3JIYW5kbGVyLnRocm93RXJyb3IoZXJyKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBpZihvdXRPZlNlcnZpY2UgfHwgdmFsdWU9PT1udWxsKXsgICAvL2VuYWJsZSByZXR1cm5pbmcgYSB0ZW1wb3JhcnkgZGVwZW5kZW5jeSByZXNvbHV0aW9uIVxyXG4gICAgICAgICAgICBpZih0aGluZ3NbbmFtZV0pe1xyXG4gICAgICAgICAgICAgICAgdGhpbmdzW25hbWVdID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHJlc2V0VXBDb3VudGVycyhuYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJTdWNjZXNzIHJlc29sdmluZyBcIiwgbmFtZSwgXCI6XCIsIHZhbHVlLCBcIk90aGVyIHJlYWR5OlwiLCBvdGhlclJlYWR5KTtcclxuICAgICAgICAgICAgaWYoIXZhbHVlKXtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gIHtcInBsYWNlaG9sZGVyXCI6IG5hbWV9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaW5nc1tuYW1lXSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB2YXIgb3RoZXJSZWFkeSA9IHJlc2V0VXBDb3VudGVycyhuYW1lKTtcclxuICAgICAgICAgICAgb3RoZXJSZWFkeS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xyXG4gICAgICAgICAgICAgICAgY2FsbEZvclRoaW5nKGl0ZW0sIGZhbHNlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgICAgRGVjbGFyZSB0aGF0IGEgbmFtZSBpcyByZWFkeSwgcmVzb2x2ZWQgYW5kIHNob3VsZCB0cnkgdG8gcmVzb2x2ZSBhbGwgb3RoZXIgd2FpdGluZyBmb3IgaXRcclxuICAgICAqL1xyXG4gICAgdGhpcy5yZXNvbHZlICAgID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpe1xyXG4gICAgICAgIHRoaW5nc1tuYW1lXSA9IHZhbHVlO1xyXG4gICAgICAgIHZhciBvdGhlclJlYWR5ID0gcmVzZXRVcENvdW50ZXJzKG5hbWUpO1xyXG5cclxuICAgICAgICBvdGhlclJlYWR5LmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XHJcbiAgICAgICAgICAgIGNhbGxGb3JUaGluZyhpdGVtLCBmYWxzZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuXHJcblxyXG4gICAgdGhpcy5pbnN0YW5jZUZhY3RvcnkgPSBmdW5jdGlvbihuYW1lLCBkZXBlbmRlbmN5QXJyYXksIGNvbnN0cnVjdG9yKXtcclxuICAgICAgICBlcnJvckhhbmRsZXIubm90SW1wbGVtZW50ZWQoXCJpbnN0YW5jZUZhY3RvcnkgaXMgcGxhbm5lZCBidXQgbm90IGltcGxlbWVudGVkXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgICAgRGVjbGFyZSB0aGF0IGEgc2VydmljZSBvciBmZWF0dXJlIGlzIG5vdCB3b3JraW5nIHByb3Blcmx5LiBBbGwgc2VydmljZXMgZGVwZW5kaW5nIG9uIHRoaXMgd2lsbCBnZXQgbm90aWZpZWRcclxuICAgICAqL1xyXG4gICAgdGhpcy5vdXRPZlNlcnZpY2UgICAgPSBmdW5jdGlvbihuYW1lKXtcclxuICAgICAgICB0aGluZ3NbbmFtZV0gPSBudWxsO1xyXG4gICAgICAgIHZhciB1cE5vZGVzID0gZGlzY292ZXJVcE5vZGVzKG5hbWUpO1xyXG4gICAgICAgIHVwTm9kZXMuZm9yRWFjaChmdW5jdGlvbihub2RlKXtcclxuICAgICAgICAgICAgdGhpbmdzW25hbWVdID0gbnVsbDtcclxuICAgICAgICAgICAgY2FsbEZvclRoaW5nKG5vZGUsIHRydWUpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnRzLm5ld0NvbnRhaW5lciAgICA9IGZ1bmN0aW9uKGNoZWNrc0xpYnJhcnkpe1xyXG4gICAgcmV0dXJuIG5ldyBDb250YWluZXIoY2hlY2tzTGlicmFyeSk7XHJcbn1cclxuXHJcbi8vZXhwb3J0cy5jb250YWluZXIgPSBuZXcgQ29udGFpbmVyKCQkLmVycm9ySGFuZGxlcik7XHJcbiIsIiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdFx0XHRcdFx0YmVlc0hlYWxlcjogcmVxdWlyZShcIi4vbGliL2JlZXNIZWFsZXJcIiksXHJcblx0XHRcdFx0XHRzb3VuZFB1YlN1YjogcmVxdWlyZShcIi4vbGliL3NvdW5kUHViU3ViXCIpLnNvdW5kUHViU3ViXHJcblx0XHRcdFx0XHQvL2ZvbGRlck1ROiByZXF1aXJlKFwiLi9saWIvZm9sZGVyTVFcIilcclxufTsiLCJmdW5jdGlvbiBRdWV1ZUVsZW1lbnQoY29udGVudCkge1xyXG5cdHRoaXMuY29udGVudCA9IGNvbnRlbnQ7XHJcblx0dGhpcy5uZXh0ID0gbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gUXVldWUoKSB7XHJcblx0dGhpcy5oZWFkID0gbnVsbDtcclxuXHR0aGlzLnRhaWwgPSBudWxsO1xyXG5cclxuXHR0aGlzLnB1c2ggPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuXHRcdGxldCBuZXdFbGVtZW50ID0gbmV3IFF1ZXVlRWxlbWVudCh2YWx1ZSk7XHJcblx0XHRpZiAoIXRoaXMuaGVhZCkge1xyXG5cdFx0XHR0aGlzLmhlYWQgPSBuZXdFbGVtZW50O1xyXG5cdFx0XHR0aGlzLnRhaWwgPSBuZXdFbGVtZW50O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy50YWlsLm5leHQgPSBuZXdFbGVtZW50O1xyXG5cdFx0XHR0aGlzLnRhaWwgPSBuZXdFbGVtZW50XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0dGhpcy5wb3AgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRpZiAoIXRoaXMuaGVhZCkge1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHRcdGNvbnN0IGhlYWRDb3B5ID0gdGhpcy5oZWFkO1xyXG5cdFx0dGhpcy5oZWFkID0gdGhpcy5oZWFkLm5leHQ7XHJcblx0XHRyZXR1cm4gaGVhZENvcHkuY29udGVudDtcclxuXHR9O1xyXG5cclxuXHR0aGlzLmZyb250ID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuaGVhZCA/IHRoaXMuaGVhZC5jb250ZW50IDogdW5kZWZpbmVkO1xyXG5cdH07XHJcblxyXG5cdHRoaXMuaXNFbXB0eSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmhlYWQgPT0gbnVsbDtcclxuXHR9O1xyXG5cclxuXHR0aGlzW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiogKCkge1xyXG5cdFx0bGV0IGhlYWQgPSB0aGlzLmhlYWQ7XHJcblx0XHR3aGlsZShoZWFkICE9PSBudWxsKSB7XHJcblx0XHRcdHlpZWxkIGhlYWQuY29udGVudDtcclxuXHRcdFx0aGVhZCA9IGhlYWQubmV4dDtcclxuXHRcdH1cclxuXHR9LmJpbmQodGhpcyk7XHJcbn1cclxuXHJcblF1ZXVlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuXHRsZXQgc3RyaW5naWZpZWRRdWV1ZSA9ICcnO1xyXG5cdGxldCBpdGVyYXRvciA9IHRoaXMuaGVhZDtcclxuXHR3aGlsZSAoaXRlcmF0b3IpIHtcclxuXHRcdHN0cmluZ2lmaWVkUXVldWUgKz0gYCR7SlNPTi5zdHJpbmdpZnkoaXRlcmF0b3IuY29udGVudCl9IGA7XHJcblx0XHRpdGVyYXRvciA9IGl0ZXJhdG9yLm5leHQ7XHJcblx0fVxyXG5cdHJldHVybiBzdHJpbmdpZmllZFF1ZXVlXHJcbn07XHJcblxyXG5RdWV1ZS5wcm90b3R5cGUuaW5zcGVjdCA9IFF1ZXVlLnByb3RvdHlwZS50b1N0cmluZztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUXVldWU7IiwiXHJcbi8qXHJcbiAgICBQcmVwYXJlIHRoZSBzdGF0ZSBvZiBhIHN3YXJtIHRvIGJlIHNlcmlhbGlzZWRcclxuKi9cclxuXHJcbmV4cG9ydHMuYXNKU09OID0gZnVuY3Rpb24odmFsdWVPYmplY3QsIHBoYXNlTmFtZSwgYXJncywgY2FsbGJhY2spe1xyXG5cclxuICAgICAgICB2YXIgdmFsdWVPYmplY3QgPSB2YWx1ZU9iamVjdC52YWx1ZU9mKCk7XHJcbiAgICAgICAgdmFyIHJlcyA9IHt9O1xyXG4gICAgICAgIHJlcy5wdWJsaWNWYXJzICAgICAgICAgID0gdmFsdWVPYmplY3QucHVibGljVmFycztcclxuICAgICAgICByZXMucHJpdmF0ZVZhcnMgICAgICAgICA9IHZhbHVlT2JqZWN0LnByaXZhdGVWYXJzO1xyXG4gICAgICAgIHJlcy5tZXRhICAgICAgICAgICAgICAgID0ge307XHJcblxyXG4gICAgICAgIHJlcy5tZXRhLnN3YXJtVHlwZU5hbWUgID0gdmFsdWVPYmplY3QubWV0YS5zd2FybVR5cGVOYW1lO1xyXG4gICAgICAgIHJlcy5tZXRhLnN3YXJtSWQgICAgICAgID0gdmFsdWVPYmplY3QubWV0YS5zd2FybUlkO1xyXG4gICAgICAgIHJlcy5tZXRhLnRhcmdldCAgICAgICAgID0gdmFsdWVPYmplY3QubWV0YS50YXJnZXQ7XHJcblxyXG4gICAgICAgIGlmKCFwaGFzZU5hbWUpe1xyXG4gICAgICAgICAgICByZXMubWV0YS5jb21tYW5kICAgID0gXCJzdG9yZWRcIjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXMubWV0YS5waGFzZU5hbWUgID0gcGhhc2VOYW1lO1xyXG4gICAgICAgICAgICByZXMubWV0YS5hcmdzICAgICAgID0gYXJncztcclxuICAgICAgICAgICAgcmVzLm1ldGEuY29tbWFuZCAgICA9IHZhbHVlT2JqZWN0Lm1ldGEuY29tbWFuZCB8fCBcImV4ZWN1dGVTd2FybVBoYXNlXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXMubWV0YS53YWl0U3RhY2sgID0gdmFsdWVPYmplY3QubWV0YS53YWl0U3RhY2s7IC8vVE9ETzogdGhpbmsgaWYgaXMgbm90IGJldHRlciB0byBiZSBkZWVwIGNsb25lZCBhbmQgbm90IHJlZmVyZW5jZWQhISFcclxuXHJcbiAgICAgICAgaWYoY2FsbGJhY2spe1xyXG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL2NvbnNvbGUubG9nKFwiYXNKU09OOlwiLCByZXMsIHZhbHVlT2JqZWN0KTtcclxuICAgICAgICByZXR1cm4gcmVzO1xyXG59XHJcblxyXG5leHBvcnRzLmpzb25Ub05hdGl2ZSA9IGZ1bmN0aW9uKHNlcmlhbGlzZWRWYWx1ZXMsIHJlc3VsdCl7XHJcblxyXG4gICAgZm9yKHZhciB2IGluIHNlcmlhbGlzZWRWYWx1ZXMucHVibGljVmFycyl7XHJcbiAgICAgICAgcmVzdWx0LnB1YmxpY1ZhcnNbdl0gPSBzZXJpYWxpc2VkVmFsdWVzLnB1YmxpY1ZhcnNbdl07XHJcblxyXG4gICAgfTtcclxuICAgIGZvcih2YXIgdiBpbiBzZXJpYWxpc2VkVmFsdWVzLnByaXZhdGVWYXJzKXtcclxuICAgICAgICByZXN1bHQucHJpdmF0ZVZhcnNbdl0gPSBzZXJpYWxpc2VkVmFsdWVzLnByaXZhdGVWYXJzW3ZdO1xyXG4gICAgfTtcclxuXHJcbiAgICBmb3IodmFyIHYgaW4gc2VyaWFsaXNlZFZhbHVlcy5tZXRhKXtcclxuICAgICAgICByZXN1bHQubWV0YVt2XSA9IHNlcmlhbGlzZWRWYWx1ZXMubWV0YVt2XTtcclxuICAgIH07XHJcblxyXG59IiwiLypcclxuSW5pdGlhbCBMaWNlbnNlOiAoYykgQXhpb2xvZ2ljIFJlc2VhcmNoICYgQWxib2FpZSBTw65uaWPEgy5cclxuQ29udHJpYnV0b3JzOiBBeGlvbG9naWMgUmVzZWFyY2ggLCBQcml2YXRlU2t5IHByb2plY3RcclxuQ29kZSBMaWNlbnNlOiBMR1BMIG9yIE1JVC5cclxuKi9cclxuXHJcblxyXG4vKipcclxuICogICBVc3VhbGx5IGFuIGV2ZW50IGNvdWxkIGNhdXNlIGV4ZWN1dGlvbiBvZiBvdGhlciBjYWxsYmFjayBldmVudHMgLiBXZSBzYXkgdGhhdCBpcyBhIGxldmVsIDEgZXZlbnQgaWYgaXMgY2F1c2VlZCBieSBhIGxldmVsIDAgZXZlbnQgYW5kIHNvIG9uXHJcbiAqXHJcbiAqICAgICAgU291bmRQdWJTdWIgcHJvdmlkZXMgaW50dWl0aXZlIHJlc3VsdHMgcmVnYXJkaW5nIHRvIGFzeW5jaHJvbm91cyBjYWxscyBvZiBjYWxsYmFja3MgYW5kIGNvbXB1dGVkIHZhbHVlcy9leHByZXNzaW9uczpcclxuICogICB3ZSBwcmV2ZW50IGltbWVkaWF0ZSBleGVjdXRpb24gb2YgZXZlbnQgY2FsbGJhY2tzIHRvIGVuc3VyZSB0aGUgaW50dWl0aXZlIGZpbmFsIHJlc3VsdCBpcyBndWFyYW50ZWVkIGFzIGxldmVsIDAgZXhlY3V0aW9uXHJcbiAqICAgd2UgZ3VhcmFudGVlIHRoYXQgYW55IGNhbGxiYWNrIGZ1bmN0aW9uIGlzIFwicmUtZW50cmFudFwiXHJcbiAqICAgd2UgYXJlIGFsc28gdHJ5aW5nIHRvIHJlZHVjZSB0aGUgbnVtYmVyIG9mIGNhbGxiYWNrIGV4ZWN1dGlvbiBieSBsb29raW5nIGluIHF1ZXVlcyBhdCBuZXcgbWVzc2FnZXMgcHVibGlzaGVkIGJ5XHJcbiAqICAgdHJ5aW5nIHRvIGNvbXBhY3QgdGhvc2UgbWVzc2FnZXMgKHJlbW92aW5nIGR1cGxpY2F0ZSBtZXNzYWdlcywgbW9kaWZ5aW5nIG1lc3NhZ2VzLCBvciBhZGRpbmcgaW4gdGhlIGhpc3Rvcnkgb2YgYW5vdGhlciBldmVudCAsZXRjKVxyXG4gKlxyXG4gKiAgICAgIEV4YW1wbGUgb2Ygd2hhdCBjYW4gYmUgd3Jvbmcgd2l0aG91dCBub24tc291bmQgYXN5bmNocm9ub3VzIGNhbGxzOlxyXG5cclxuICogIFN0ZXAgMDogSW5pdGlhbCBzdGF0ZTpcclxuICogICBhID0gMDtcclxuICogICBiID0gMDtcclxuICpcclxuICogIFN0ZXAgMTogSW5pdGlhbCBvcGVyYXRpb25zOlxyXG4gKiAgIGEgPSAxO1xyXG4gKiAgIGIgPSAtMTtcclxuICpcclxuICogIC8vIGFuIG9ic2VydmVyIHJlYWN0cyB0byBjaGFuZ2VzIGluIGEgYW5kIGIgYW5kIGNvbXB1dGUgQ09SUkVDVCBsaWtlIHRoaXM6XHJcbiAqICAgaWYoIGEgKyBiID09IDApIHtcclxuICogICAgICAgQ09SUkVDVCA9IGZhbHNlO1xyXG4gKiAgICAgICBub3RpZnkoLi4uKTsgLy8gYWN0IG9yIHNlbmQgYSBub3RpZmljYXRpb24gc29tZXdoZXJlLi5cclxuICogICB9IGVsc2Uge1xyXG4gKiAgICAgIENPUlJFQ1QgPSBmYWxzZTtcclxuICogICB9XHJcbiAqXHJcbiAqICAgIE5vdGljZSB0aGF0OiBDT1JSRUNUIHdpbGwgYmUgdHJ1ZSBpbiB0aGUgZW5kICwgYnV0IG1lYW50aW1lLCBhZnRlciBhIG5vdGlmaWNhdGlvbiB3YXMgc2VudCBhbmQgQ09SUkVDVCB3YXMgd3JvbmdseSwgdGVtcG9yYXJpbHkgZmFsc2UhXHJcbiAqICAgIHNvdW5kUHViU3ViIGd1YXJhbnRlZSB0aGF0IHRoaXMgZG9lcyBub3QgaGFwcGVuIGJlY2F1c2UgdGhlIHN5bmNyb25vdXMgY2FsbCB3aWxsIGJlZm9yZSBhbnkgb2JzZXJ2ZXIgKGJvdCBhc2lnbmF0aW9uIG9uIGEgYW5kIGIpXHJcbiAqXHJcbiAqICAgTW9yZTpcclxuICogICB5b3UgY2FuIHVzZSBibG9ja0NhbGxCYWNrcyBhbmQgcmVsZWFzZUNhbGxCYWNrcyBpbiBhIGZ1bmN0aW9uIHRoYXQgY2hhbmdlIGEgbG90IGEgY29sbGVjdGlvbiBvciBiaW5kYWJsZSBvYmplY3RzIGFuZCBhbGxcclxuICogICB0aGUgbm90aWZpY2F0aW9ucyB3aWxsIGJlIHNlbnQgY29tcGFjdGVkIGFuZCBwcm9wZXJseVxyXG4gKi9cclxuXHJcbi8vIFRPRE86IG9wdGltaXNhdGlvbiE/IHVzZSBhIG1vcmUgZWZmaWNpZW50IHF1ZXVlIGluc3RlYWQgb2YgYXJyYXlzIHdpdGggcHVzaCBhbmQgc2hpZnQhP1xyXG4vLyBUT0RPOiBzZWUgaG93IGJpZyB0aG9zZSBxdWV1ZXMgY2FuIGJlIGluIHJlYWwgYXBwbGljYXRpb25zXHJcbi8vIGZvciBhIGZldyBodW5kcmVkcyBpdGVtcywgcXVldWVzIG1hZGUgZnJvbSBhcnJheSBzaG91bGQgYmUgZW5vdWdoXHJcbi8vKiAgIFBvdGVudGlhbCBUT0RPczpcclxuLy8gICAgKiAgICAgcHJldmVudCBhbnkgZm9ybSBvZiBwcm9ibGVtIGJ5IGNhbGxpbmcgY2FsbGJhY2tzIGluIHRoZSBleHBlY3RlZCBvcmRlciAhP1xyXG4vLyogICAgIHByZXZlbnRpbmcgaW5maW5pdGUgbG9vcHMgZXhlY3V0aW9uIGNhdXNlIGJ5IGV2ZW50cyE/XHJcbi8vKlxyXG4vLypcclxuLy8gVE9ETzogZGV0ZWN0IGluZmluaXRlIGxvb3BzIChvciB2ZXJ5IGRlZXAgcHJvcGFnYXRpb24pIEl0IGlzIHBvc3NpYmxlIT9cclxuXHJcbmNvbnN0IFF1ZXVlID0gcmVxdWlyZSgnLi9RdWV1ZScpO1xyXG5cclxuZnVuY3Rpb24gU291bmRQdWJTdWIoKXtcclxuXHJcblx0LyoqXHJcblx0ICogcHVibGlzaFxyXG5cdCAqICAgICAgUHVibGlzaCBhIG1lc3NhZ2Uge09iamVjdH0gdG8gYSBsaXN0IG9mIHN1YnNjcmliZXJzIG9uIGEgc3BlY2lmaWMgdG9waWNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbXMge1N0cmluZ3xOdW1iZXJ9IHRhcmdldCwgIHtPYmplY3R9IG1lc3NhZ2VcclxuXHQgKiBAcmV0dXJuIG51bWJlciBvZiBjaGFubmVsIHN1YnNjcmliZXJzIHRoYXQgd2lsbCBiZSBub3RpZmllZFxyXG5cdCAqL1xyXG5cdHRoaXMucHVibGlzaCA9IGZ1bmN0aW9uKHRhcmdldCwgbWVzc2FnZSl7XHJcblx0XHRpZighaW52YWxpZENoYW5uZWxOYW1lKHRhcmdldCkgJiYgIWludmFsaWRNZXNzYWdlVHlwZShtZXNzYWdlKSAmJiBjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XSAhPSB1bmRlZmluZWQpe1xyXG5cdFx0XHRjb21wYWN0QW5kU3RvcmUodGFyZ2V0LCBtZXNzYWdlKTtcclxuXHRcdFx0ZGlzcGF0Y2hOZXh0KCk7XHJcblx0XHRcdHJldHVybiBjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XS5sZW5ndGg7XHJcblx0XHR9IGVsc2V7XHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdC8qKlxyXG5cdCAqIHN1YnNjcmliZVxyXG5cdCAqICAgICAgU3Vic2NyaWJlIC8gYWRkIGEge0Z1bmN0aW9ufSBjYWxsQmFjayBvbiBhIHtTdHJpbmd8TnVtYmVyfXRhcmdldCBjaGFubmVsIHN1YnNjcmliZXJzIGxpc3QgaW4gb3JkZXIgdG8gcmVjZWl2ZVxyXG5cdCAqICAgICAgbWVzc2FnZXMgcHVibGlzaGVkIGlmIHRoZSBjb25kaXRpb25zIGRlZmluZWQgYnkge0Z1bmN0aW9ufXdhaXRGb3JNb3JlIGFuZCB7RnVuY3Rpb259ZmlsdGVyIGFyZSBwYXNzZWQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW1zIHtTdHJpbmd8TnVtYmVyfXRhcmdldCwge0Z1bmN0aW9ufWNhbGxCYWNrLCB7RnVuY3Rpb259d2FpdEZvck1vcmUsIHtGdW5jdGlvbn1maWx0ZXJcclxuXHQgKlxyXG5cdCAqICAgICAgICAgIHRhcmdldCAgICAgIC0gY2hhbm5lbCBuYW1lIHRvIHN1YnNjcmliZVxyXG5cdCAqICAgICAgICAgIGNhbGxiYWNrICAgIC0gZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gYSBtZXNzYWdlIHdhcyBwdWJsaXNoZWQgb24gdGhlIGNoYW5uZWxcclxuXHQgKiAgICAgICAgICB3YWl0Rm9yTW9yZSAtIGEgaW50ZXJtZWRpYXJ5IGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgYSBzdWNjZXNzZnVseSBtZXNzYWdlIGRlbGl2ZXJ5IGluIG9yZGVyXHJcblx0ICogICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGRlY2lkZSBpZiBhIG5ldyBtZXNzYWdlcyBpcyBleHBlY3RlZC4uLlxyXG5cdCAqICAgICAgICAgIGZpbHRlciAgICAgIC0gYSBmdW5jdGlvbiB0aGF0IHJlY2VpdmVzIHRoZSBtZXNzYWdlIGJlZm9yZSBpbnZvY2F0aW9uIG9mIGNhbGxiYWNrIGZ1bmN0aW9uIGluIG9yZGVyIHRvIGFsbG93XHJcblx0ICogICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGV2YW50IG1lc3NhZ2UgYmVmb3JlIGVudGVyaW5nIGluIG5vcm1hbCBjYWxsYmFjayBmbG93XHJcblx0ICogQHJldHVyblxyXG5cdCAqL1xyXG5cdHRoaXMuc3Vic2NyaWJlID0gZnVuY3Rpb24odGFyZ2V0LCBjYWxsQmFjaywgd2FpdEZvck1vcmUsIGZpbHRlcil7XHJcblx0XHRpZighaW52YWxpZENoYW5uZWxOYW1lKHRhcmdldCkgJiYgIWludmFsaWRGdW5jdGlvbihjYWxsQmFjaykpe1xyXG5cclxuXHRcdFx0dmFyIHN1YnNjcmliZXIgPSB7XCJjYWxsQmFja1wiOmNhbGxCYWNrLCBcIndhaXRGb3JNb3JlXCI6d2FpdEZvck1vcmUsIFwiZmlsdGVyXCI6ZmlsdGVyfTtcclxuXHRcdFx0dmFyIGFyciA9IGNoYW5uZWxTdWJzY3JpYmVyc1t0YXJnZXRdO1xyXG5cdFx0XHRpZihhcnIgPT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0XHRhcnIgPSBbXTtcclxuXHRcdFx0XHRjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XSA9IGFycjtcclxuXHRcdFx0fVxyXG5cdFx0XHRhcnIucHVzaChzdWJzY3JpYmVyKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQvKipcclxuXHQgKiB1bnN1YnNjcmliZVxyXG5cdCAqICAgICAgVW5zdWJzY3JpYmUvcmVtb3ZlIHtGdW5jdGlvbn0gY2FsbEJhY2sgZnJvbSB0aGUgbGlzdCBvZiBzdWJzY3JpYmVycyBvZiB0aGUge1N0cmluZ3xOdW1iZXJ9IHRhcmdldCBjaGFubmVsXHJcblx0ICpcclxuXHQgKiBAcGFyYW1zIHtTdHJpbmd8TnVtYmVyfSB0YXJnZXQsIHtGdW5jdGlvbn0gY2FsbEJhY2ssIHtGdW5jdGlvbn0gZmlsdGVyXHJcblx0ICpcclxuXHQgKiAgICAgICAgICB0YXJnZXQgICAgICAtIGNoYW5uZWwgbmFtZSB0byB1bnN1YnNjcmliZVxyXG5cdCAqICAgICAgICAgIGNhbGxiYWNrICAgIC0gcmVmZXJlbmNlIG9mIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB0aGF0IHdhcyB1c2VkIGFzIHN1YnNjcmliZVxyXG5cdCAqICAgICAgICAgIGZpbHRlciAgICAgIC0gcmVmZXJlbmNlIG9mIHRoZSBvcmlnaW5hbCBmaWx0ZXIgZnVuY3Rpb25cclxuXHQgKiBAcmV0dXJuXHJcblx0ICovXHJcblx0dGhpcy51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKHRhcmdldCwgY2FsbEJhY2ssIGZpbHRlcil7XHJcblx0XHRpZighaW52YWxpZEZ1bmN0aW9uKGNhbGxCYWNrKSl7XHJcblx0XHRcdHZhciBnb3RpdCA9IGZhbHNlO1xyXG5cdFx0XHRpZihjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XSl7XHJcblx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGNoYW5uZWxTdWJzY3JpYmVyc1t0YXJnZXRdLmxlbmd0aDtpKyspe1xyXG5cdFx0XHRcdFx0dmFyIHN1YnNjcmliZXIgPSAgY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF1baV07XHJcblx0XHRcdFx0XHRpZihzdWJzY3JpYmVyLmNhbGxCYWNrID09PSBjYWxsQmFjayAmJiAoZmlsdGVyID09IHVuZGVmaW5lZCB8fCBzdWJzY3JpYmVyLmZpbHRlciA9PT0gZmlsdGVyICkpe1xyXG5cdFx0XHRcdFx0XHRnb3RpdCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdHN1YnNjcmliZXIuZm9yRGVsZXRlID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0c3Vic2NyaWJlci5jYWxsQmFjayA9IG51bGw7XHJcblx0XHRcdFx0XHRcdHN1YnNjcmliZXIuZmlsdGVyID0gbnVsbDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYoIWdvdGl0KXtcclxuXHRcdFx0XHR3cHJpbnQoXCJVbmFibGUgdG8gdW5zdWJzY3JpYmUgYSBjYWxsYmFjayB0aGF0IHdhcyBub3Qgc3Vic2NyaWJlZCFcIik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQvKipcclxuXHQgKiBibG9ja0NhbGxCYWNrc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtc1xyXG5cdCAqIEByZXR1cm5cclxuXHQgKi9cclxuXHR0aGlzLmJsb2NrQ2FsbEJhY2tzID0gZnVuY3Rpb24oKXtcclxuXHRcdGxldmVsKys7XHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogcmVsZWFzZUNhbGxCYWNrc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtc1xyXG5cdCAqIEByZXR1cm5cclxuXHQgKi9cclxuXHR0aGlzLnJlbGVhc2VDYWxsQmFja3MgPSBmdW5jdGlvbigpe1xyXG5cdFx0bGV2ZWwtLTtcclxuXHRcdC8vaGFjay9vcHRpbWlzYXRpb24gdG8gbm90IGZpbGwgdGhlIHN0YWNrIGluIGV4dHJlbWUgY2FzZXMgKG1hbnkgZXZlbnRzIGNhdXNlZCBieSBsb29wcyBpbiBjb2xsZWN0aW9ucyxldGMpXHJcblx0XHR3aGlsZShsZXZlbCA9PSAwICYmIGRpc3BhdGNoTmV4dCh0cnVlKSl7XHJcblx0XHRcdC8vbm90aGluZ1xyXG5cdFx0fVxyXG5cclxuXHRcdHdoaWxlKGxldmVsID09IDAgJiYgY2FsbEFmdGVyQWxsRXZlbnRzKCkpe1xyXG5cclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQvKipcclxuXHQgKiBhZnRlckFsbEV2ZW50c1xyXG5cdCAqXHJcblx0ICogQHBhcmFtcyB7RnVuY3Rpb259IGNhbGxiYWNrXHJcblx0ICpcclxuXHQgKiAgICAgICAgICBjYWxsYmFjayAtIGZ1bmN0aW9uIHRoYXQgbmVlZHMgdG8gYmUgaW52b2tlZCBvbmNlIGFsbCBldmVudHMgYXJlIGRlbGl2ZXJlZFxyXG5cdCAqIEByZXR1cm5cclxuXHQgKi9cclxuXHR0aGlzLmFmdGVyQWxsRXZlbnRzID0gZnVuY3Rpb24oY2FsbEJhY2spe1xyXG5cdFx0aWYoIWludmFsaWRGdW5jdGlvbihjYWxsQmFjaykpe1xyXG5cdFx0XHRhZnRlckV2ZW50c0NhbGxzLnB1c2goY2FsbEJhY2spO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5ibG9ja0NhbGxCYWNrcygpO1xyXG5cdFx0dGhpcy5yZWxlYXNlQ2FsbEJhY2tzKCk7XHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogaGFzQ2hhbm5lbFxyXG5cdCAqXHJcblx0ICogQHBhcmFtcyB7U3RyaW5nfE51bWJlcn0gY2hhbm5lbFxyXG5cdCAqXHJcblx0ICogICAgICAgICAgY2hhbm5lbCAtIG5hbWUgb2YgdGhlIGNoYW5uZWwgdGhhdCBuZWVkIHRvIGJlIHRlc3RlZCBpZiBwcmVzZW50XHJcblx0ICogQHJldHVyblxyXG5cdCAqL1xyXG5cdHRoaXMuaGFzQ2hhbm5lbCA9IGZ1bmN0aW9uKGNoYW5uZWwpe1xyXG5cdFx0cmV0dXJuICFpbnZhbGlkQ2hhbm5lbE5hbWUoY2hhbm5lbCkgJiYgY2hhbm5lbFN1YnNjcmliZXJzW2NoYW5uZWxdICE9IHVuZGVmaW5lZCA/IHRydWUgOiBmYWxzZTtcclxuXHR9O1xyXG5cclxuXHQvKipcclxuXHQgKiBhZGRDaGFubmVsXHJcblx0ICpcclxuXHQgKiBAcGFyYW1zIHtTdHJpbmd9IGNoYW5uZWxcclxuXHQgKlxyXG5cdCAqICAgICAgICAgIGNoYW5uZWwgLSBuYW1lIG9mIGEgY2hhbm5lbCB0aGF0IG5lZWRzIHRvIGJlIGNyZWF0ZWQgYW5kIGFkZGVkIHRvIHNvdW5kcHVic3ViIHJlcG9zaXRvcnlcclxuXHQgKiBAcmV0dXJuXHJcblx0ICovXHJcblx0dGhpcy5hZGRDaGFubmVsID0gZnVuY3Rpb24oY2hhbm5lbCl7XHJcblx0XHRpZighaW52YWxpZENoYW5uZWxOYW1lKGNoYW5uZWwpICYmICF0aGlzLmhhc0NoYW5uZWwoY2hhbm5lbCkpe1xyXG5cdFx0XHRjaGFubmVsU3Vic2NyaWJlcnNbY2hhbm5lbF0gPSBbXTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQvKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHByb3RlY3RlZCBzdHVmZiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXHJcblx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdC8vIG1hcCBjaGFubmVsTmFtZSAob2JqZWN0IGxvY2FsIGlkKSAtPiBhcnJheSB3aXRoIHN1YnNjcmliZXJzXHJcblx0dmFyIGNoYW5uZWxTdWJzY3JpYmVycyA9IHt9O1xyXG5cclxuXHQvLyBtYXAgY2hhbm5lbE5hbWUgKG9iamVjdCBsb2NhbCBpZCkgLT4gcXVldWUgd2l0aCB3YWl0aW5nIG1lc3NhZ2VzXHJcblx0dmFyIGNoYW5uZWxzU3RvcmFnZSA9IHt9O1xyXG5cclxuXHQvLyBvYmplY3RcclxuXHR2YXIgdHlwZUNvbXBhY3RvciA9IHt9O1xyXG5cclxuXHQvLyBjaGFubmVsIG5hbWVzXHJcblx0dmFyIGV4ZWN1dGlvblF1ZXVlID0gbmV3IFF1ZXVlKCk7XHJcblx0dmFyIGxldmVsID0gMDtcclxuXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiByZWdpc3RlckNvbXBhY3RvclxyXG5cdCAqXHJcblx0ICogICAgICAgQW4gY29tcGFjdG9yIHRha2VzIGEgbmV3RXZlbnQgYW5kIGFuZCBvbGRFdmVudCBhbmQgcmV0dXJuIHRoZSBvbmUgdGhhdCBzdXJ2aXZlcyAob2xkRXZlbnQgaWZcclxuXHQgKiAgaXQgY2FuIGNvbXBhY3QgdGhlIG5ldyBvbmUgb3IgdGhlIG5ld0V2ZW50IGlmIGNhbid0IGJlIGNvbXBhY3RlZClcclxuXHQgKlxyXG5cdCAqIEBwYXJhbXMge1N0cmluZ30gdHlwZSwge0Z1bmN0aW9ufSBjYWxsQmFja1xyXG5cdCAqXHJcblx0ICogICAgICAgICAgdHlwZSAgICAgICAgLSBjaGFubmVsIG5hbWUgdG8gdW5zdWJzY3JpYmVcclxuXHQgKiAgICAgICAgICBjYWxsQmFjayAgICAtIGhhbmRsZXIgZnVuY3Rpb24gZm9yIHRoYXQgc3BlY2lmaWMgZXZlbnQgdHlwZVxyXG5cdCAqIEByZXR1cm5cclxuXHQgKi9cclxuXHR0aGlzLnJlZ2lzdGVyQ29tcGFjdG9yID0gZnVuY3Rpb24odHlwZSwgY2FsbEJhY2spIHtcclxuXHRcdGlmKCFpbnZhbGlkRnVuY3Rpb24oY2FsbEJhY2spKXtcclxuXHRcdFx0dHlwZUNvbXBhY3Rvclt0eXBlXSA9IGNhbGxCYWNrO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdC8qKlxyXG5cdCAqIGRpc3BhdGNoTmV4dFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGZyb21SZWxlYXNlQ2FsbEJhY2tzOiBoYWNrIHRvIHByZXZlbnQgdG9vIG1hbnkgcmVjdXJzaXZlIGNhbGxzIG9uIHJlbGVhc2VDYWxsQmFja3NcclxuXHQgKiBAcmV0dXJuIHtCb29sZWFufVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGRpc3BhdGNoTmV4dChmcm9tUmVsZWFzZUNhbGxCYWNrcyl7XHJcblx0XHRpZihsZXZlbCA+IDApIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0bGV0IGNoYW5uZWxOYW1lID0gZXhlY3V0aW9uUXVldWUuZnJvbnQoKTtcclxuXHRcdGlmKGNoYW5uZWxOYW1lICE9IHVuZGVmaW5lZCl7XHJcblx0XHRcdHNlbGYuYmxvY2tDYWxsQmFja3MoKTtcclxuXHRcdFx0dHJ5e1xyXG5cdFx0XHRcdGxldCBtZXNzYWdlO1xyXG5cdFx0XHRcdGlmKCFjaGFubmVsc1N0b3JhZ2VbY2hhbm5lbE5hbWVdLmlzRW1wdHkoKSkge1xyXG5cdFx0XHRcdFx0bWVzc2FnZSA9IGNoYW5uZWxzU3RvcmFnZVtjaGFubmVsTmFtZV0uZnJvbnQoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYobWVzc2FnZSA9PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRcdFx0aWYoIWNoYW5uZWxzU3RvcmFnZVtjaGFubmVsTmFtZV0uaXNFbXB0eSgpKXtcclxuXHRcdFx0XHRcdFx0d3ByaW50KFwiQ2FuJ3QgdXNlIGFzIG1lc3NhZ2UgaW4gYSBwdWIvc3ViIGNoYW5uZWwgdGhpcyBvYmplY3Q6IFwiICsgbWVzc2FnZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRleGVjdXRpb25RdWV1ZS5wb3AoKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0aWYobWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXggPT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0XHRcdFx0bWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXggPSAwO1xyXG5cdFx0XHRcdFx0XHRmb3IodmFyIGkgPSBjaGFubmVsU3Vic2NyaWJlcnNbY2hhbm5lbE5hbWVdLmxlbmd0aC0xOyBpID49IDAgOyBpLS0pe1xyXG5cdFx0XHRcdFx0XHRcdHZhciBzdWJzY3JpYmVyID0gIGNoYW5uZWxTdWJzY3JpYmVyc1tjaGFubmVsTmFtZV1baV07XHJcblx0XHRcdFx0XHRcdFx0aWYoc3Vic2NyaWJlci5mb3JEZWxldGUgPT0gdHJ1ZSl7XHJcblx0XHRcdFx0XHRcdFx0XHRjaGFubmVsU3Vic2NyaWJlcnNbY2hhbm5lbE5hbWVdLnNwbGljZShpLDEpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSBlbHNle1xyXG5cdFx0XHRcdFx0XHRtZXNzYWdlLl9fdHJhbnNtaXNpb25JbmRleCsrO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly9UT0RPOiBmb3IgaW1tdXRhYmxlIG9iamVjdHMgaXQgd2lsbCBub3Qgd29yayBhbHNvLCBmaXggZm9yIHNoYXBlIG1vZGVsc1xyXG5cdFx0XHRcdFx0aWYobWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXggPT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0XHRcdFx0d3ByaW50KFwiQ2FuJ3QgdXNlIGFzIG1lc3NhZ2UgaW4gYSBwdWIvc3ViIGNoYW5uZWwgdGhpcyBvYmplY3Q6IFwiICsgbWVzc2FnZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR2YXIgc3Vic2NyaWJlciA9IGNoYW5uZWxTdWJzY3JpYmVyc1tjaGFubmVsTmFtZV1bbWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXhdO1xyXG5cdFx0XHRcdFx0aWYoc3Vic2NyaWJlciA9PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRcdFx0XHRkZWxldGUgbWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXg7XHJcblx0XHRcdFx0XHRcdGNoYW5uZWxzU3RvcmFnZVtjaGFubmVsTmFtZV0ucG9wKCk7XHJcblx0XHRcdFx0XHR9IGVsc2V7XHJcblx0XHRcdFx0XHRcdGlmKHN1YnNjcmliZXIuZmlsdGVyID09IHVuZGVmaW5lZCB8fCAoIWludmFsaWRGdW5jdGlvbihzdWJzY3JpYmVyLmZpbHRlcikgJiYgc3Vic2NyaWJlci5maWx0ZXIobWVzc2FnZSkpKXtcclxuXHRcdFx0XHRcdFx0XHRpZighc3Vic2NyaWJlci5mb3JEZWxldGUpe1xyXG5cdFx0XHRcdFx0XHRcdFx0c3Vic2NyaWJlci5jYWxsQmFjayhtZXNzYWdlKTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmKHN1YnNjcmliZXIud2FpdEZvck1vcmUgJiYgIWludmFsaWRGdW5jdGlvbihzdWJzY3JpYmVyLndhaXRGb3JNb3JlKSAmJlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQhc3Vic2NyaWJlci53YWl0Rm9yTW9yZShtZXNzYWdlKSl7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHRzdWJzY3JpYmVyLmZvckRlbGV0ZSA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGNhdGNoKGVycil7XHJcblx0XHRcdFx0d3ByaW50KFwiRXZlbnQgY2FsbGJhY2sgZmFpbGVkOiBcIisgc3Vic2NyaWJlci5jYWxsQmFjayArXCJlcnJvcjogXCIgKyBlcnIuc3RhY2spO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vXHJcblx0XHRcdGlmKGZyb21SZWxlYXNlQ2FsbEJhY2tzKXtcclxuXHRcdFx0XHRsZXZlbC0tO1xyXG5cdFx0XHR9IGVsc2V7XHJcblx0XHRcdFx0c2VsZi5yZWxlYXNlQ2FsbEJhY2tzKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9IGVsc2V7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNvbXBhY3RBbmRTdG9yZSh0YXJnZXQsIG1lc3NhZ2Upe1xyXG5cdFx0dmFyIGdvdENvbXBhY3RlZCA9IGZhbHNlO1xyXG5cdFx0dmFyIGFyciA9IGNoYW5uZWxzU3RvcmFnZVt0YXJnZXRdO1xyXG5cdFx0aWYoYXJyID09IHVuZGVmaW5lZCl7XHJcblx0XHRcdGFyciA9IG5ldyBRdWV1ZSgpO1xyXG5cdFx0XHRjaGFubmVsc1N0b3JhZ2VbdGFyZ2V0XSA9IGFycjtcclxuXHRcdH1cclxuXHJcblx0XHRpZihtZXNzYWdlICYmIG1lc3NhZ2UudHlwZSAhPSB1bmRlZmluZWQpe1xyXG5cdFx0XHR2YXIgdHlwZUNvbXBhY3RvckNhbGxCYWNrID0gdHlwZUNvbXBhY3RvclttZXNzYWdlLnR5cGVdO1xyXG5cclxuXHRcdFx0aWYodHlwZUNvbXBhY3RvckNhbGxCYWNrICE9IHVuZGVmaW5lZCl7XHJcblx0XHRcdFx0Zm9yKGxldCBjaGFubmVsIG9mIGFycikge1xyXG5cdFx0XHRcdFx0aWYodHlwZUNvbXBhY3RvckNhbGxCYWNrKG1lc3NhZ2UsIGNoYW5uZWwpID09PSBjaGFubmVsKSB7XHJcblx0XHRcdFx0XHRcdGlmKGNoYW5uZWwuX190cmFuc21pc2lvbkluZGV4ID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRcdFx0XHRnb3RDb21wYWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYoIWdvdENvbXBhY3RlZCAmJiBtZXNzYWdlKXtcclxuXHRcdFx0YXJyLnB1c2gobWVzc2FnZSk7XHJcblx0XHRcdGV4ZWN1dGlvblF1ZXVlLnB1c2godGFyZ2V0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHZhciBhZnRlckV2ZW50c0NhbGxzID0gbmV3IFF1ZXVlKCk7XHJcblx0ZnVuY3Rpb24gY2FsbEFmdGVyQWxsRXZlbnRzICgpe1xyXG5cdFx0aWYoIWFmdGVyRXZlbnRzQ2FsbHMuaXNFbXB0eSgpKXtcclxuXHRcdFx0dmFyIGNhbGxCYWNrID0gYWZ0ZXJFdmVudHNDYWxscy5wb3AoKTtcclxuXHRcdFx0Ly9kbyBub3QgY2F0Y2ggZXhjZXB0aW9ucyBoZXJlLi5cclxuXHRcdFx0Y2FsbEJhY2soKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiAhYWZ0ZXJFdmVudHNDYWxscy5pc0VtcHR5KCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpbnZhbGlkQ2hhbm5lbE5hbWUobmFtZSl7XHJcblx0XHR2YXIgcmVzdWx0ID0gZmFsc2U7XHJcblx0XHRpZighbmFtZSB8fCAodHlwZW9mIG5hbWUgIT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgbmFtZSAhPSBcIm51bWJlclwiKSl7XHJcblx0XHRcdHJlc3VsdCA9IHRydWU7XHJcblx0XHRcdHdwcmludChcIkludmFsaWQgY2hhbm5lbCBuYW1lOiBcIiArIG5hbWUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpbnZhbGlkTWVzc2FnZVR5cGUobWVzc2FnZSl7XHJcblx0XHR2YXIgcmVzdWx0ID0gZmFsc2U7XHJcblx0XHRpZighbWVzc2FnZSB8fCB0eXBlb2YgbWVzc2FnZSAhPSBcIm9iamVjdFwiKXtcclxuXHRcdFx0cmVzdWx0ID0gdHJ1ZTtcclxuXHRcdFx0d3ByaW50KFwiSW52YWxpZCBtZXNzYWdlcyB0eXBlczogXCIgKyBtZXNzYWdlKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpbnZhbGlkRnVuY3Rpb24oY2FsbGJhY2spe1xyXG5cdFx0dmFyIHJlc3VsdCA9IGZhbHNlO1xyXG5cdFx0aWYoIWNhbGxiYWNrIHx8IHR5cGVvZiBjYWxsYmFjayAhPSBcImZ1bmN0aW9uXCIpe1xyXG5cdFx0XHRyZXN1bHQgPSB0cnVlO1xyXG5cdFx0XHR3cHJpbnQoXCJFeHBlY3RlZCB0byBiZSBmdW5jdGlvbiBidXQgaXM6IFwiICsgY2FsbGJhY2spO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydHMuc291bmRQdWJTdWIgPSBuZXcgU291bmRQdWJTdWIoKTsiLCJcclxuLy92YXIgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xyXG5cclxuZnVuY3Rpb24gZGVmYXVsdEVycm9ySGFuZGxpbmdJbXBsZW1lbnRhdGlvbihlcnIsIHJlcyl7XHJcblx0Ly9jb25zb2xlLmxvZyhlcnIuc3RhY2spO1xyXG5cdGlmKGVycikgdGhyb3cgZXJyO1xyXG5cdHJldHVybiByZXM7XHJcbn1cclxuXHJcblxyXG5pZih0eXBlb2YoZ2xvYmFsLiQkKSA9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICBnbG9iYWwuJCQgPSB7fTtcclxufVxyXG5cclxuJCQuZXJyb3JIYW5kbGVyID0ge1xyXG4gICAgICAgIGVycm9yOmZ1bmN0aW9uKGVyciwgYXJncywgbXNnKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyLCBcIlVua25vd24gZXJyb3IgZnJvbSBmdW5jdGlvbiBjYWxsIHdpdGggYXJndW1lbnRzOlwiLCBhcmdzLCBcIk1lc3NhZ2U6XCIsIG1zZyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aHJvd0Vycm9yOmZ1bmN0aW9uKGVyciwgYXJncywgbXNnKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyLCBcIlVua25vd24gZXJyb3IgZnJvbSBmdW5jdGlvbiBjYWxsIHdpdGggYXJndW1lbnRzOlwiLCBhcmdzLCBcIk1lc3NhZ2U6XCIsIG1zZyk7XHJcbiAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlnbm9yZVBvc3NpYmxlRXJyb3I6IGZ1bmN0aW9uKG5hbWUpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhuYW1lKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN5bnRheEVycm9yOmZ1bmN0aW9uKHByb3BlcnR5LCBzd2FybSwgdGV4dCl7XHJcbiAgICAgICAgICAgIC8vdGhyb3cgbmV3IEVycm9yKFwiTWlzc3BlbGxlZCBtZW1iZXIgbmFtZSBvciBvdGhlciBpbnRlcm5hbCBlcnJvciFcIik7XHJcbiAgICAgICAgICAgIHZhciBzd2FybU5hbWU7XHJcbiAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBzd2FybSA9PSBcInN0cmluZ1wiKXtcclxuICAgICAgICAgICAgICAgICAgICBzd2FybU5hbWUgPSBzd2FybTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZVxyXG4gICAgICAgICAgICAgICAgaWYoc3dhcm0gJiYgc3dhcm0ubWV0YSl7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1OYW1lICA9IHN3YXJtLm1ldGEuc3dhcm1UeXBlTmFtZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1OYW1lID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpLm1ldGEuc3dhcm1UeXBlTmFtZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaChlcnIpe1xyXG4gICAgICAgICAgICAgICAgc3dhcm1OYW1lID0gZXJyLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYocHJvcGVydHkpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJXcm9uZyBtZW1iZXIgbmFtZSBcIiwgcHJvcGVydHksICBcIiBpbiBzd2FybSBcIiwgc3dhcm1OYW1lKTtcclxuICAgICAgICAgICAgICAgIGlmKHRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5rbm93biBzd2FybVwiLCBzd2FybU5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgd2FybmluZzpmdW5jdGlvbihtc2cpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtc2cpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4kJC51aWRHZW5lcmF0b3IgPSByZXF1aXJlKFwiLi9saWIvc2FmZS11dWlkXCIpO1xyXG5cclxuJCQuc2FmZUVycm9ySGFuZGxpbmcgPSBmdW5jdGlvbihjYWxsYmFjayl7XHJcbiAgICAgICAgaWYoY2FsbGJhY2spe1xyXG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2s7XHJcbiAgICAgICAgfSBlbHNle1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmYXVsdEVycm9ySGFuZGxpbmdJbXBsZW1lbnRhdGlvbjtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuJCQuX19pbnRlcm4gPSB7XHJcbiAgICAgICAgbWtBcmdzOmZ1bmN0aW9uKGFyZ3MscG9zKXtcclxuICAgICAgICAgICAgdmFyIGFyZ3NBcnJheSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSBwb3M7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgICAgIGFyZ3NBcnJheS5wdXNoKGFyZ3NbaV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBhcmdzQXJyYXk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiQkLl9fZ2xvYmFsID0ge1xyXG5cclxuICAgIH07XHJcblxyXG5cclxuJCQuX19nbG9iYWwub3JpZ2luYWxSZXF1aXJlID0gcmVxdWlyZTtcclxuXHJcbmlmKHR5cGVvZigkJC5fX3J1bnRpbWVNb2R1bGVzKSA9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAkJC5fX3J1bnRpbWVNb2R1bGVzID0ge307XHJcbn1cclxuXHJcblxyXG4vKlxyXG4gcmVxdWlyZSBhbmQgcmVxdWlyZUxpYnJhcnkgYXJlIG92ZXJ3cml0aW5nIHRoZSBub2RlLmpzIGRlZmF1bHRzIGluIGxvYWRpbmcgbW9kdWxlcyBmb3IgaW5jcmVhc2luZyBzZWN1cml0eSBhbmQgc3BlZWQuXHJcbiBXZSBndWFyYW50ZWUgdGhhdCBlYWNoIG1vZHVsZSBvciBsaWJyYXJ5IGlzIGxvYWRlZCBvbmx5IG9uY2UgYW5kIG9ubHkgZnJvbSBhIHNpbmdsZSBmb2xkZXIuLi4gVXNlIHRoZSBzdGFuZGFyZCByZXF1aXJlIGlmIHlvdSBuZWVkIHNvbWV0aGluZyBlbHNlIVxyXG5cclxuIEJ5IGRlZmF1bHQgd2UgZXhwZWN0IHRvIHJ1biBmcm9tIGEgcHJpdmF0ZXNreSBWTSBlbmdpbmUgKCBhIHByaXZhdGVza3kgbm9kZSkgYW5kIHRoZXJlZm9yZSB0aGUgY2FsbGZsb3cgc3RheXMgaW4gdGhlIG1vZHVsZXMgZm9sZGVyIHRoZXJlLlxyXG4gQW55IG5ldyB1c2Ugb2YgY2FsbGZsb3cgKGFuZCByZXF1aXJlIG9yIHJlcXVpcmVMaWJyYXJ5KSBjb3VsZCByZXF1aXJlIGNoYW5nZXMgdG8gJCQuX19nbG9iYWwuX19sb2FkTGlicmF5Um9vdCBhbmQgJCQuX19nbG9iYWwuX19sb2FkTW9kdWxlc1Jvb3RcclxuICovXHJcbi8vJCQuX19nbG9iYWwuX19sb2FkTGlicmFyeVJvb3QgICAgPSBfX2Rpcm5hbWUgKyBcIi8uLi8uLi9saWJyYXJpZXMvXCI7XHJcbi8vJCQuX19nbG9iYWwuX19sb2FkTW9kdWxlc1Jvb3QgICA9IF9fZGlybmFtZSArIFwiLy4uLy4uL21vZHVsZXMvXCI7XHJcblxyXG52YXIgbG9hZGVkTW9kdWxlcyA9IHt9O1xyXG4kJC5yZXF1aXJlID0gZnVuY3Rpb24obmFtZSl7XHJcblx0dmFyIGV4aXN0aW5nTW9kdWxlID0gbG9hZGVkTW9kdWxlc1tuYW1lXTtcclxuXHJcblx0aWYoIWV4aXN0aW5nTW9kdWxlKXtcclxuICAgICAgICBleGlzdGluZ01vZHVsZSA9ICQkLl9fcnVudGltZU1vZHVsZXNbbmFtZV07XHJcbiAgICAgICAgaWYoIWV4aXN0aW5nTW9kdWxlKXtcclxuICAgICAgICAgICAgLy92YXIgYWJzb2x1dGVQYXRoID0gcGF0aC5yZXNvbHZlKCAkJC5fX2dsb2JhbC5fX2xvYWRNb2R1bGVzUm9vdCArIG5hbWUpO1xyXG4gICAgICAgICAgICBleGlzdGluZ01vZHVsZSA9ICQkLl9fZ2xvYmFsLm9yaWdpbmFsUmVxdWlyZShuYW1lKTtcclxuICAgICAgICAgICAgbG9hZGVkTW9kdWxlc1tuYW1lXSA9IGV4aXN0aW5nTW9kdWxlO1xyXG4gICAgICAgIH1cclxuXHR9XHJcblx0cmV0dXJuIGV4aXN0aW5nTW9kdWxlO1xyXG59O1xyXG5cclxudmFyIHN3YXJtVXRpbHMgPSByZXF1aXJlKFwiLi9saWIvY2hvcmVvZ3JhcGhpZXMvdXRpbGl0eUZ1bmN0aW9ucy9zd2FybVwiKTtcclxuXHJcbiQkLmRlZmF1bHRFcnJvckhhbmRsaW5nSW1wbGVtZW50YXRpb24gPSBkZWZhdWx0RXJyb3JIYW5kbGluZ0ltcGxlbWVudGF0aW9uO1xyXG5cclxudmFyIGNhbGxmbG93TW9kdWxlID0gcmVxdWlyZShcIi4vbGliL3N3YXJtRGVzY3JpcHRpb25cIik7XHJcbiQkLmNhbGxmbG93cyAgICAgICAgPSBjYWxsZmxvd01vZHVsZS5jcmVhdGVTd2FybUVuZ2luZShcImNhbGxmbG93XCIpO1xyXG4kJC5jYWxsZmxvdyAgICAgICAgID0gJCQuY2FsbGZsb3dzO1xyXG4kJC5mbG93ICAgICAgICAgICAgID0gJCQuY2FsbGZsb3dzO1xyXG4kJC5mbG93cyAgICAgICAgICAgID0gJCQuY2FsbGZsb3dzO1xyXG5cclxuJCQuc3dhcm1zICAgICAgICAgICA9IGNhbGxmbG93TW9kdWxlLmNyZWF0ZVN3YXJtRW5naW5lKFwic3dhcm1cIiwgc3dhcm1VdGlscyk7XHJcbiQkLnN3YXJtICAgICAgICAgICAgPSAkJC5zd2FybXM7XHJcbiQkLmNvbnRyYWN0cyAgICAgICAgPSBjYWxsZmxvd01vZHVsZS5jcmVhdGVTd2FybUVuZ2luZShcImNvbnRyYWN0XCIsIHN3YXJtVXRpbHMpO1xyXG4kJC5jb250cmFjdCAgICAgICAgID0gJCQuY29udHJhY3RzO1xyXG5cclxuXHJcbiQkLlBTS19QdWJTdWIgPSAkJC5yZXF1aXJlKFwic291bmRwdWJzdWJcIikuc291bmRQdWJTdWI7XHJcblxyXG4kJC5zZWN1cml0eUNvbnRleHQgPSBcInN5c3RlbVwiO1xyXG4kJC5saWJyYXJ5UHJlZml4ID0gXCJnbG9iYWxcIjtcclxuJCQubGlicmFyaWVzID0ge1xyXG4gICAgZ2xvYmFsOntcclxuXHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuXHJcbiQkLmxvYWRMaWJyYXJ5ID0gcmVxdWlyZShcIi4vbGliL2xvYWRMaWJyYXJ5XCIpLmxvYWRMaWJyYXJ5O1xyXG5cclxuJCQucmVxdWlyZUxpYnJhcnkgPSBmdW5jdGlvbihuYW1lKXtcclxuICAgIC8vdmFyIGFic29sdXRlUGF0aCA9IHBhdGgucmVzb2x2ZSggICQkLl9fZ2xvYmFsLl9fbG9hZExpYnJhcnlSb290ICsgbmFtZSk7XHJcbiAgICByZXR1cm4gJCQubG9hZExpYnJhcnkobmFtZSxuYW1lKTtcclxufTtcclxuXHJcbiQkLnJlZ2lzdGVyU3dhcm1EZXNjcmlwdGlvbiA9ICBmdW5jdGlvbihsaWJyYXJ5TmFtZSxzaG9ydE5hbWUsIGRlc2NyaXB0aW9uKXtcclxuICAgIGlmKCEkJC5saWJyYXJpZXNbbGlicmFyeU5hbWVdKXtcclxuICAgICAgICAkJC5saWJyYXJpZXNbbGlicmFyeU5hbWVdID0ge307XHJcbiAgICB9XHJcbiAgICAkJC5saWJyYXJpZXNbbGlicmFyeU5hbWVdW3Nob3J0TmFtZV0gPSBkZXNjcmlwdGlvbjtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBcdFx0XHRcdGNyZWF0ZVN3YXJtRW5naW5lOiByZXF1aXJlKFwiLi9saWIvc3dhcm1EZXNjcmlwdGlvblwiKS5jcmVhdGVTd2FybUVuZ2luZSxcclxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVKb2luUG9pbnQ6IHJlcXVpcmUoXCIuL2xpYi9wYXJhbGxlbEpvaW5Qb2ludFwiKS5jcmVhdGVKb2luUG9pbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlU2VyaWFsSm9pblBvaW50OiByZXF1aXJlKFwiLi9saWIvc2VyaWFsSm9pblBvaW50XCIpLmNyZWF0ZVNlcmlhbEpvaW5Qb2ludCxcclxuXHRcdFx0XHRcdFwic2FmZS11dWlkXCI6IHJlcXVpcmUoXCIuL2xpYi9zYWZlLXV1aWRcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1JbnN0YW5jZU1hbmFnZXI6IHJlcXVpcmUoXCIuL2xpYi9jaG9yZW9ncmFwaGllcy9zd2FybUluc3RhbmNlc01hbmFnZXJcIilcclxuXHRcdFx0XHR9OyJdfQ==
