(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

$$.__runtimeModules["assert"] = require("assert");
$$.__runtimeModules["crypto"] = require("crypto");
$$.__runtimeModules["zlib"] = require("zlib");


/*
assert
buffer
console
constants
crypto
domain
events
http
https
os
path
punycode
querystring
stream
string_decoder
timers
tty
url
util
vm
zlib
require()
*/
},{"assert":undefined,"crypto":undefined,"zlib":undefined}],2:[function(require,module,exports){
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
    require("./nodeModules")
}

$$.__runtimeModules["soundpubsub"] = require("soundpubsub");
$$.__runtimeModules["callflow"] = require("callflow");
$$.__runtimeModules["dicontainer"] = require("dicontainer");
$$.__runtimeModules["double-check"] = require("double-check");
$$.__runtimeModules["pskcrypto"] = require("pskcrypto");





},{"./nodeModules":1,"callflow":5,"dicontainer":16,"double-check":17,"pskcrypto":24,"soundpubsub":47}],3:[function(require,module,exports){
/*
 Initial License: (c) Axiologic Research & Alboaie Sînică.
 Contributors: Axiologic Research , PrivateSky project
 Code License: LGPL or MIT.
 */


var callflowModule = require("./../modules/callflow");



exports.enableTesting = function() {
    require("./fakes/dummyVM");
}

var core = $$.requireLibrary("core");


//TODO: SHOULD be moved in $$.__globals
$$.ensureFolderExists = function(folder, callback){

    var flow = $$.flow.start(core.mkDirRec);
    flow.make(folder, callback);
};

$$.ensureLinkExists = function(existingPath, newPath, callback){

    var flow = $$.flow.start(core.mkDirRec);
    flow.makeLink(existingPath, newPath, callback);
};
},{"./../modules/callflow":5,"./fakes/dummyVM":4}],4:[function(require,module,exports){
function dummyVM(name){
	function solveSwarm(swarm){
		$$.swarmsInstancesManager.revive_swarm(swarm);
	}

	$$.PSK_PubSub.subscribe(name, solveSwarm);
	console.log("Creating a fake execution context...");
}

global.vm = dummyVM($$.CONSTANTS.SWARM_FOR_EXECUTION);
},{}],5:[function(require,module,exports){
(function (__dirname){

var path = require("path");

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


/*
 require and requireLibrary are overwriting the node.js defaults in loading modules for increasing security and speed.
 We guarantee that each module or library is loaded only once and only from a single folder... Use the standard require if you need something else!

 By default we expect to run from a privatesky VM engine ( a privatesky node) and therefore the callflow stays in the modules folder there.
 Any new use of callflow (and require or requireLibrary) could require changes to $$.__global.__loadLibrayRoot and $$.__global.__loadModulesRoot
 */
$$.__global.__loadLibraryRoot    = __dirname + "/../../libraries/";
$$.__global.__loadModulesRoot   = __dirname + "/../../modules/";
var loadedModules = {};
$$.require = function(name){
	var existingModule = loadedModules[name];

	if(!existingModule){
        existingModule = $$.__runtimeModules[name];
        if(!existingModule){
            var absolutePath = path.resolve( $$.__global.__loadModulesRoot + name);
            existingModule = require(absolutePath);
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
    var absolutePath = path.resolve(  $$.__global.__loadLibraryRoot + name);
    return $$.loadLibrary(name,absolutePath);
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
}).call(this,require("path").join(__dirname,"..","modules","callflow"))

},{"./lib/choreographies/swarmInstancesManager":7,"./lib/choreographies/utilityFunctions/swarm":10,"./lib/loadLibrary":11,"./lib/parallelJoinPoint":12,"./lib/safe-uuid":13,"./lib/serialJoinPoint":14,"./lib/swarmDescription":15,"path":undefined}],6:[function(require,module,exports){
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


},{"fs":undefined,"util":undefined}],7:[function(require,module,exports){


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



},{}],8:[function(require,module,exports){
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
},{"../../parallelJoinPoint":12,"../../serialJoinPoint":14,"../SwarmDebug":6}],9:[function(require,module,exports){
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
},{"./base":8}],10:[function(require,module,exports){
exports.createForObject = function(valueObject, thisObject, localId){
	return require("./base").createForObject(valueObject, thisObject, localId);
};
},{"./base":8}],11:[function(require,module,exports){
/*
Initial License: (c) Axiologic Research & Alboaie Sînică.
Contributors: Axiologic Research , PrivateSky project
Code License: LGPL or MIT.
*/

var fs = require("fs");
var path = require("path");

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
    $$.libraries[prefixName] = this; // so other calls for loadLibrary will return inside of the files
    var prefixedRequire = wrapCall(function(path){
        return require(path);
    }, prefixName);

    function includeAllInRoot(folder, prefixName) {
        //var stat = fs.statSync(path); //TODO -- check agains folders with extension .js
        var files = fs.readdirSync(folder);
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
        })
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
    var absolutePath = path.resolve(folder);
    return new SwarmLibrary(prefixName, absolutePath);
}
},{"fs":undefined,"path":undefined}],12:[function(require,module,exports){

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
},{}],13:[function(require,module,exports){

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
},{"crypto":undefined}],14:[function(require,module,exports){

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
},{}],15:[function(require,module,exports){
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
},{"./choreographies/utilityFunctions/callflow":9}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){

/**
 * Generic function used to registers methods such as asserts, logging, etc. on the current context.
 * @param name {String)} - name of the method (use case) to be registered.
 * @param func {Function} - handler to be invoked.
 * @param paramsDescription {Object} - parameters descriptions
 * @param after {Function} - callback function to be called after the function has been executed.
 */
function addUseCase(name, func, paramsDescription, after){
    var newFunc = func;
    if(typeof after === "function") {
        newFunc = function(){
            let args = Array.from(arguments);
            func.apply(this, args);
            after();
        }
    }

    // some properties should not be overridden
    const protectedProperties = ['addCheck', 'addCase', 'register'];
    if(protectedProperties.indexOf(name) === -1){
        this[name] = newFunc;
    } else {
        throw new Error('Cant overwrite ' + name);
    }

    if(paramsDescription){
        this.params[name] = paramsDescription;
    }
}

/**
 * Creates an alias to an existing function.
 * @param name1 {String} - New function name.
 * @param name2 {String} - Existing function name.
 */
function alias(name1, name2){
    this[name1] = this[name2];
}

/**
 * Singleton for adding various functions for use cases regarding logging.
 * @constructor
 */
function LogsCore(){
    this.params = {};
}

/**
 * Singleton for adding your various functions for asserts.
 * @constructor
 */
function AssertCore(){
    this.params = {};
}

/**
 * Singleton for adding your various functions for checks.
 * @constructor
 */
function CheckCore(){
    this.params = {};
}

/**
 * Singleton for adding your various functions for generating exceptions.
 * @constructor
 */
function ExceptionsCore(){
    this.params = {};
}

/**
 * Singleton for adding your various functions for running tests.
 * @constructor
 */
function TestRunnerCore(){
}

LogsCore.prototype.addCase           = addUseCase;
AssertCore.prototype.addCheck        = addUseCase;
CheckCore.prototype.addCheck         = addUseCase;
ExceptionsCore.prototype.register    = addUseCase;

LogsCore.prototype.alias             = alias;
AssertCore.prototype.alias           = alias;
CheckCore.prototype.alias            = alias;
ExceptionsCore.prototype.alias       = alias;

// Create modules
var assertObj       = new AssertCore();
var checkObj        = new CheckCore();
var exceptionsObj   = new ExceptionsCore();
var loggerObj       = new LogsCore();
var testRunnerObj   = new TestRunnerCore();

// Export modules
exports.assert      = assertObj;
exports.check       = checkObj;
exports.exceptions  = checkObj;
exports.exceptions  = exceptionsObj;
exports.logger      = loggerObj;
exports.testRunner  = testRunnerObj;

// Initialise modules
require("./standardAsserts.js").init(exports);
require("./standardLogs.js").init(exports);
require("./standardExceptions.js").init(exports);
require("./standardChecks.js").init(exports);
require("./testRunner.js").init(exports);

// Global Uncaught Exception handler.
if(process.on)
{
    process.on('uncaughtException', function (err) {
		let tag = "uncaughtException";
		console.log(tag, err);
		console.log(tag, err.stack);
	});
}
},{"./standardAsserts.js":18,"./standardChecks.js":19,"./standardExceptions.js":20,"./standardLogs.js":21,"./testRunner.js":22}],18:[function(require,module,exports){
var logger = require("./checksCore.js").logger;

exports.init = function(sf){

    /**
     * Registering handler for failed asserts. The handler is doing logging and is throwing an error.
     * @param explanation {String} - failing reason message.
     */
    sf.exceptions.register('assertFail', function(explanation){
        let message = "Assert or invariant has failed " + (explanation ? explanation : "");
        let err = new Error(message);
        logger.recordAssert('[Fail] ' + message, err, true);
        throw err
    });

    /**
     * Registering assert for equality. If check fails, the assertFail is invoked.
     * @param v1 {String|Number|Object} - first value
     * @param v1 {String|Number|Object} - second value
     * @param explanation {String} - failing reason message in case the assert fails.
     */
    sf.assert.addCheck('equal', function(v1 , v2, explanation){
        if(v1 !== v2){
            if(!explanation){
                explanation =  "Assertion failed: [" + v1 + " !== " + v2 + "]";
            }
            sf.exceptions.assertFail(explanation);
        }
    });

    /**
     * Registering assert for inequality. If check fails, the assertFail is invoked.
     * @param v1 {String|Number|Object} - first value
     * @param v1 {String|Number|Object} - second value
     * @param explanation {String} - failing reason message in case the assert fails
     */
    sf.assert.addCheck('notEqual', function(v1, v2, explanation){
        if(v1 === v2){
            if(!explanation){
                explanation =  " ["+ v1 + " == " + v2 + "]";
            }
            sf.exceptions.assertFail(explanation);
        }
    });

    /**
     * Registering assert for evaluating an expression to true. If check fails, the assertFail is invoked.
     * @param b {Boolean} - result of an expression
     * @param explanation {String} - failing reason message in case the assert fails
     */
    sf.assert.addCheck('true', function(b, explanation){
        if(!b){
            if(!explanation){
                explanation =  " expression is false but is expected to be true";
            }
            sf.exceptions.assertFail(explanation);
        }
    });

    /**
     * Registering assert for evaluating an expression to false. If check fails, the assertFail is invoked.
     * @param b {Boolean} - result of an expression
     * @param explanation {String} - failing reason message in case the assert fails
     */
    sf.assert.addCheck('false', function(b, explanation){
        if(b){
            if(!explanation){
                explanation =  " expression is true but is expected to be false";
            }
            sf.exceptions.assertFail(explanation);
        }
    });

    /**
     * Registering assert for evaluating a value to null. If check fails, the assertFail is invoked.
     * @param b {Boolean} - result of an expression
     * @param explanation {String} - failing reason message in case the assert fails
     */
    sf.assert.addCheck('isNull', function(v1, explanation){
        if(v1 !== null){
            sf.exceptions.assertFail(explanation);
        }
    });

    /**
     * Registering assert for evaluating a value to be not null. If check fails, the assertFail is invoked.
     * @param b {Boolean} - result of an expression
     * @param explanation {String} - failing reason message in case the assert fails
     */
    sf.assert.addCheck('notNull', function(v1 , explanation){
        if(v1 === null && typeof v1 === "object"){
            sf.exceptions.assertFail(explanation);
        }
    });

    /**
     * Checks if all properties of the second object are own properties of the first object.
     * @param firstObj {Object} - first object
     * @param secondObj{Object} - second object
     * @returns {boolean} - returns true, if the check has passed or false otherwise.
     */
    function objectHasFields(firstObj, secondObj){
        for(let field in secondObj) {
            if (firstObj.hasOwnProperty(field)) {
                if (firstObj[field] !== secondObj[field]) {
                    return false;
                }
            }
            else{
                return false;
            }
        }
        return true;
    }

    function objectsAreEqual(firstObj, secondObj) {
        let areEqual = true;
        if(firstObj !== secondObj) {
            if(typeof firstObj !== typeof secondObj) {
                areEqual = false;
            } else if (Array.isArray(firstObj) && Array.isArray(secondObj)) {
	            firstObj.sort();
	            secondObj.sort();
		        if (firstObj.length !== secondObj.length) {
			        areEqual = false;
		        } else {
			        for (let i = 0; i < firstObj.length; ++i) {
				        if (!objectsAreEqual(firstObj[i], secondObj[i])) {
					        areEqual = false;
					        break;
				        }
			        }
		        }
	        } else if((typeof firstObj === 'function' && typeof secondObj === 'function') ||
		        (firstObj instanceof Date && secondObj instanceof Date) ||
		        (firstObj instanceof RegExp && secondObj instanceof RegExp) ||
		        (firstObj instanceof String && secondObj instanceof String) ||
		        (firstObj instanceof Number && secondObj instanceof Number)) {
                    areEqual = firstObj.toString() === secondObj.toString();
            } else if(typeof firstObj === 'object' && typeof secondObj === 'object') {
                areEqual = objectHasFields(firstObj, secondObj);
            // isNaN(undefined) returns true
            } else if(isNaN(firstObj) && isNaN(secondObj) && typeof firstObj === 'number' && typeof secondObj === 'number') {
                areEqual = true;
            } else {
                areEqual = false;
            }
        }

        return areEqual;
    }

    /**
     * Registering assert for evaluating if all properties of the second object are own properties of the first object.
     * If check fails, the assertFail is invoked.
     * @param firstObj {Object} - first object
     * @param secondObj{Object} - second object
     * @param explanation {String} - failing reason message in case the assert fails
     */
    sf.assert.addCheck("objectHasFields", function(firstObj, secondObj, explanation){
        if(!objectHasFields(firstObj, secondObj)) {
            sf.exceptions.assertFail(explanation);
        }
    });

    /**
     * Registering assert for evaluating if all element from the second array are present in the first array.
     * Deep comparison between the elements of the array is used.
     * If check fails, the assertFail is invoked.
     * @param firstArray {Array}- first array
     * @param secondArray {Array} - second array
     * @param explanation {String} - failing reason message in case the assert fails
     */
    sf.assert.addCheck("arraysMatch", function(firstArray, secondArray, explanation){
        if(firstArray.length !== secondArray.length){
            sf.exceptions.assertFail(explanation);
        }
        else {
            let result = objectsAreEqual(firstArray, secondArray);
            // const arraysDontMatch = secondArray.every(element => firstArray.indexOf(element) !== -1);
            // let arraysDontMatch = secondArray.some(function (expectedElement) {
            //     let found = firstArray.some(function(resultElement){
            //         return objectHasFields(resultElement,expectedElement);
            //     });
            //     return found === false;
            // });

            if(!result){
                sf.exceptions.assertFail(explanation);
            }
        }
    });

    // added mainly for test purposes, better test frameworks like mocha could be much better

    /**
     * Registering assert for checking if a function is failing.
     * If the function is throwing an exception, the test is passed or failed otherwise.
     * @param testName {String} - test name or description
     * @param func {Function} - function to be invoked
     */
    sf.assert.addCheck('fail', function(testName, func){
        try{
            func();
            logger.recordAssert("[Fail] " + testName);
        } catch(err){
            logger.recordAssert("[Pass] " + testName);
        }
    });

    /**
     * Registering assert for checking if a function is executed with no exceptions.
     * If the function is not throwing any exception, the test is passed or failed otherwise.
     * @param testName {String} - test name or description
     * @param func {Function} - function to be invoked
     */
    sf.assert.addCheck('pass', function(testName, func){
        try{
            func();
            logger.recordAssert("[Pass] " + testName);
        } catch(err){
            logger.recordAssert("[Fail] " + testName, err.stack);
        }
    });

    /**
     * Alias for the pass assert.
     */
    sf.assert.alias('test', 'pass');

    /**
     * Registering assert for checking if a callback function is executed before timeout is reached without any exceptions.
     * If the function is throwing any exception or the timeout is reached, the test is failed or passed otherwise.
     * @param testName {String} - test name or description
     * @param func {Function} - function to be invoked
     * @param timeout {Number} - number of milliseconds for the timeout check. Default to 500ms.
     */
    sf.assert.addCheck('callback', function(testName, func, timeout){

        if(!func || typeof func != "function"){
            throw new Error("Wrong usage of assert.callback!");
        }

        if(!timeout){
            timeout = 500;
        }

        var passed = false;
        function callback(){
            if(!passed){
                passed = true;
                logger.recordAssert("[Pass] " + testName);
                successTest();
            } else {
                logger.recordAssert("[Fail (multiple calls)] " + testName);
            }
        }
        
        try{
            func(callback);
        } catch(err){
            logger.recordAssert("[Fail] " + testName,  err, true);
        }

        function successTest(force){
            if(!passed){
                logger.recordAssert("[Fail Timeout] " + testName );
            }
        }

        setTimeout(successTest, timeout)
    });

    /**
     * Registering assert for checking if an array of callback functions are executed in a waterfall manner,
     * before timeout is reached without any exceptions.
     * If any of the functions is throwing any exception or the timeout is reached, the test is failed or passed otherwise.
     * @param testName {String} - test name or description
     * @param func {Function} - function to be invoked
     * @param timeout {Number} - number of milliseconds for the timeout check. Default to 500ms.
     */
    sf.assert.addCheck('steps', function(testName, arr, timeout){
        if(!timeout){
            timeout = 500;
        }

        var currentStep = 0;
        var passed = false;

        function next(){
            if(currentStep == arr.length){
                passed = true;
                logger.recordAssert("[Pass] " + testName );
                return;
            }

            var func = arr[currentStep];
            currentStep++;
            try{
                func(next);
            } catch(err){
                logger.recordAssert("[Fail] " + testName  + " [at step " + currentStep + "]", err);
            }
        }

        function successTest(force){
            if(!passed){
                logger.recordAssert("[Fail Timeout] " + testName  + " [at step " + currentStep + "]");
            }
        }

        setTimeout(successTest, timeout);
        next();
    });

    /**
     * Alias for the steps assert.
     */
    sf.assert.alias('waterfall', 'steps');

    /**
     * Registering assert for asynchronously printing all execution summary from logger.dumpWhys.
     * @param message {String} - message to be recorded
     * @param timeout {Number} - number of milliseconds for the timeout check. Default to 500ms.
     */
    sf.assert.addCheck('end', function(timeout, silence){
        if(!timeout){
            timeout = 1000;
        }

        function handler() {
            logger.dumpWhys().forEach(function(c){
                let executionSummary = c.getExecutionSummary();
                console.log(JSON.stringify(executionSummary, null, 4));
            });

            if(!silence){
                console.log("Forcing exit after", timeout, "ms");
            }
            process.exit(0);
        }

        setTimeout(handler, timeout);
    });

    /**
     * Registering assert for printing a message and asynchronously printing all logs from logger.dumpWhys.
     * @param message {String} - message to be recorded
     * @param timeout {Number} - number of milliseconds for the timeout check. Default to 500ms.
     */
    sf.assert.addCheck('begin', function(message, timeout){
        logger.recordAssert(message);
        sf.assert.end(timeout, true);
    });
}
},{"./checksCore.js":17}],19:[function(require,module,exports){
/*
    checks are like asserts but are intended to be used in production code to help debugging and signaling wrong behaviours

 */

exports.init = function(sf){
    sf.exceptions.register('checkFail', function(explanation, err){
        var stack;
        if(err){
            stack = err.stack;
        }
        console.log("Check failed ", explanation, err.stack)
    });

    sf.check.addCheck('equal', function(v1 , v2, explanation){

        if(v1 != v2){
            if(!explanation){
                explanation =  " ["+ v1 + " != " + v2 + "]";
            }

            sf.exceptions.checkFail(explanation);
        }
    });


    sf.check.addCheck('true', function(b, explanation){
        if(!b){
            if(!explanation){
                explanation =  " expression is false but is expected to be true";
            }

            sf.exceptions.checkFail(explanation);
        }
    });


    sf.check.addCheck('false', function(b, explanation){
        if(b){
            if(!explanation){
                explanation =  " expression is true but is expected to be false";
            }

            sf.exceptions.checkFail(explanation);
        }
    });

    sf.check.addCheck('notequal', function(v1 , v2, explanation){
        if(v1 == v2){
            if(!explanation){
                explanation =  " ["+ v1 + " == " + v2 + "]";
            }
            sf.exceptions.checkFail(explanation);
        }
    });


    /*
        added mainly for test purposes, better test frameworks like mocha could be much better :)
    */
    sf.check.addCheck('fail', function(testName ,func){
        try{
            func();
            console.log("[Fail] " + testName );
        } catch(err){
            console.log("[Pass] " + testName );
        }
    })


    sf.check.addCheck('pass', function(testName ,func){
        try{
            func();
            console.log("[Pass] " + testName );
        } catch(err){
            console.log("[Fail] " + testName  ,  err.stack);
        }
    });


    sf.check.alias('test','pass');


    sf.check.addCheck('callback', function(testName ,func, timeout){
        if(!timeout){
            timeout = 500;
        }
        var passed = false;
        function callback(){
            if(!passed){
                passed = true;
                console.log("[Pass] " + testName );
                SuccessTest();
            } else {
                console.log("[Fail (multiple calls)] " + testName );
            }
        }
        try{
            func(callback);
        } catch(err){
            console.log("[Fail] " + testName  ,  err.stack);
        }

        function SuccessTest(force){
            if(!passed){
                console.log("[Fail Timeout] " + testName );
            }
        }

        setTimeout(SuccessTest, timeout)
    });


    sf.check.addCheck('steps', function(testName , arr, timeout){
        var  currentStep = 0;
        var passed = false;
        if(!timeout){
            timeout = 500;
        }

        function next(){
            if(currentStep == arr.length){
                passed = true;
                console.log("[Pass] " + testName );
                return ;
            }
            var func = arr[currentStep];
            currentStep++;
            try{
                func(next);
            } catch(err){
                console.log("[Fail] " + testName  ,"\n\t" , err.stack + "\n\t" , " [at step ", currentStep + "]");
            }
        }

        function SuccessTest(force){
            if(!passed){
                console.log("[Fail Timeout] " + testName + "\n\t" , " [at step ", currentStep+ "]");
            }
        }

        setTimeout(SuccessTest, timeout);
        next();
    });

    sf.check.alias('waterfall','steps');
    sf.check.alias('notEqual','notequal');

    sf.check.addCheck('end', function(timeOut, silence){
        if(!timeOut){
            timeOut = 1000;
        }

        setTimeout(function(){
            if(!silence){
                console.log("Forcing exit after", timeOut, "ms");
            }
            process.exit(0);
        }, timeOut)
    });


    sf.check.addCheck('begin', function(message, timeOut){
        console.log(message);
        sf.check.end(timeOut, true);
    });


}
},{}],20:[function(require,module,exports){
exports.init = function(sf){
    /**
     * Registering unknown exception handler.
     */
    sf.exceptions.register('unknown', function(explanation){
        explanation = explanation || "";
        let message = "Unknown exception" + explanation;
        throw(message);
    });

    /**
     * Registering resend exception handler.
     */
    sf.exceptions.register('resend', function(exceptions){
        throw(exceptions);
    });

    /**
     * Registering notImplemented exception handler.
     */
    sf.exceptions.register('notImplemented', function(explanation){
        explanation = explanation || "";
        let message = "notImplemented exception" + explanation;
        throw(message);
    });

    /**
     * Registering security exception handler.
     */
    sf.exceptions.register('security', function(explanation){
        explanation = explanation || "";
        let message = "security exception" + explanation;
        throw(message);
    });

    /**
     * Registering duplicateDependency exception handler.
     */
    sf.exceptions.register('duplicateDependency', function(variable){
        variable = variable || "";
        let message = "duplicateDependency exception" + variable;
        throw(message);
    });
}
},{}],21:[function(require,module,exports){
const LOG_LEVELS = {
    HARD_ERROR:     0,  // system level critical error: hardError
    ERROR:          1,  // potentially causing user's data loosing error: error
    LOG_ERROR:      2,  // minor annoyance, recoverable error:   logError
    UX_ERROR:       3,  // user experience causing issues error:  uxError
    WARN:           4,  // warning,possible isues but somehow unclear behaviour: warn
    INFO:           5,  // store general info about the system working: info
    DEBUG:          6,  // system level debug: debug
    LOCAL_DEBUG:    7,  // local node/service debug: ldebug
    USER_DEBUG:     8,  // user level debug; udebug
    DEV_DEBUG:      9,  // development time debug: ddebug
    WHYS:            10, // whyLog for code reasoning
    TEST_RESULT:    11, // testResult to log running tests
}

exports.init = function(sf){

    /**
     * Records log messages from various use cases.
     * @param record {String} - log message.
     */
    sf.logger.record = function(record){
        var displayOnConsole = true;
        if(process.send) {
            process.send(record);
            displayOnConsole = false;
        }

        if(displayOnConsole) {
            let prettyLog = JSON.stringify(record, null, 2);
            console.log(prettyLog);
        }
    }

    /**
     * Adding case for logging system level critical errors.
     */
    sf.logger.addCase('hardError', function(message, exception, args, pos, data){
        sf.logger.record(createDebugRecord(LOG_LEVELS.HARD_ERROR, 'systemError', message, exception, true, args, pos, data));
    }, [
        {
            'message':'explanation'
        }
    ]);

    /**
     * Adding case for logging potentially causing user's data loosing errors.
     */
    sf.logger.addCase('error', function(message, exception, args, pos, data){
        sf.logger.record(createDebugRecord(LOG_LEVELS.ERROR, 'error', message, exception, true, args, pos, data));
    }, [
        {
            'message':'explanation'
        },
        {
            'exception':'exception'
        }
    ]);

    /**
     * Adding case for logging minor annoyance, recoverable errors.
     */
    sf.logger.addCase('logError', function(message, exception, args, pos, data){
        sf.logger.record(createDebugRecord(LOG_LEVELS.LOG_ERROR, 'logError', message, exception, true, args, pos, data));
    }, [
        {
            'message':'explanation'
        },
        {
            'exception':'exception'
        }
    ]);

    /**
     * Adding case for logging user experience causing issues errors.
     */
    sf.logger.addCase('uxError', function(message){
        sf.logger.record(createDebugRecord(LOG_LEVELS.UX_ERROR, 'uxError', message, null, false));
    }, [
        {
            'message':'explanation'
        }
    ]);

    /**
     * Adding case for logging throttling messages.
     */
    sf.logger.addCase('throttling', function(message){
        sf.logger.record(createDebugRecord(LOG_LEVELS.WARN, 'throttling', message, null, false));
    }, [
        {
            'message':'explanation'
        }
    ]);

    /**
     * Adding case for logging warning, possible issues, but somehow unclear behaviours.
     */
    sf.logger.addCase('warning', function(message){
        sf.logger.record(createDebugRecord(LOG_LEVELS.WARN, 'warning', message,null, false, arguments, 0));
    }, [
        {
            'message':'explanation'
        }
    ]);
    
    sf.logger.alias('warn', 'warning');

    /**
     * Adding case for logging general info about the system working.
     */
    sf.logger.addCase('info', function(message){
        sf.logger.record(createDebugRecord(LOG_LEVELS.INFO, 'info', message,null, false, arguments, 0));
    }, [
        {
            'message':'explanation'
        }
    ]);

    /**
     * Adding case for logging system level debug messages.
     */
    sf.logger.addCase('debug', function(message){
        sf.logger.record(createDebugRecord(LOG_LEVELS.DEBUG, 'debug', message,null, false, arguments, 0));
    }, [
        {
            'message':'explanation'
        }
    ]);


    /**
     * Adding case for logging local node/service debug messages.
     */
    sf.logger.addCase('ldebug', function(message){
        sf.logger.record(createDebugRecord(LOG_LEVELS.LOCAL_DEBUG, 'ldebug', message, null, false, arguments, 0));
    }, [
        {
            'message':'explanation'
        }
    ]);

    /**
     * Adding case for logging user level debug messages.
     */
    sf.logger.addCase('udebug', function(message){
        sf.logger.record(createDebugRecord(LOG_LEVELS.USER_DEBUG, 'udebug', message ,null, false, arguments, 0));
    }, [
        {
            'message':'explanation'
        }
    ]);

    /**
     * Adding case for logging development debug messages.
     */
    sf.logger.addCase('devel', function(message){
        sf.logger.record(createDebugRecord(LOG_LEVELS.DEV_DEBUG, 'devel', message, null, false, arguments, 0));
    }, [
        {
            'message':'explanation'
        }
    ]);

    /**
     * Adding case for logging "whys" reasoning messages.
     */
    sf.logger.addCase("logWhy", function(logOnlyCurrentWhyContext){
        sf.logger.record(createDebugRecord(LOG_LEVELS.WHYS, 'logwhy', undefined, undefined, undefined, undefined, undefined, undefined, logOnlyCurrentWhyContext))
    });

    /**
     * Adding case for logging asserts messages to running tests.
     */
    sf.logger.addCase("recordAssert", function (message, error,showStack){
        sf.logger.record(createDebugRecord(LOG_LEVELS.TEST_RESULT, 'assert', message, error, showStack));
    });

    /**
     * Generic method to create structured debug records based on the log level.
     * @param level {Number} - number from 1-11, used to identify the level of attention that a log entry should get from operations point of view
     * @param type {String} - identifier name for log type
     * @param message {String} - description of the debug record
     * @param exception {String} - exception details if any
     * @param saveStack {Boolean} - if set to true, the exception call stack will be added to the debug record
     * @param args {Array} - arguments of the caller function
     * @param pos {Number} - position
     * @param data {String|Number|Array|Object} - payload information
     * @param logOnlyCurrentWhyContext - if whys is enabled, only the current context will be logged
     * @returns Debug record model {Object} with the following fields:
     * [required]: level: *, type: *, timestamp: number, message: *, data: * and
     * [optional]: stack: *, exception: *, args: *, whyLog: *
     */
    function createDebugRecord(level, type, message, exception, saveStack, args, pos, data, logOnlyCurrentWhyContext){

        var ret = {
            level: level,
            type: type,
            timestamp: (new Date()).getTime(),
            message: message,
            data: data
        };

        if(saveStack){
            var stack = '';
            if(exception){
                stack = exception.stack;
            } else {
                stack  = (new Error()).stack;
            }
            ret.stack = stack;
        }

        if(exception){
            ret.exception = exception.message;
        }

        if(args){
            ret.args = JSON.parse(JSON.stringify(args));
        }

        if(process.env.RUN_WITH_WHYS){
            var why = require('whys');
            if(logOnlyCurrentWhyContext) {
                ret['whyLog'] = why.getGlobalCurrentContext().getExecutionSummary();
            }else{
                ret['whyLog'] = why.getAllContexts().map(function (context) {
                    return context.getExecutionSummary()
                });
            }
        }

        return ret;
    }

}


},{"whys":52}],22:[function(require,module,exports){
(function (__dirname){
if(typeof $$ === 'undefined' || $$ === null){
    //if running from a PrivateSky environment callflow module and other deps are already loaded
	require("../../../engine/core").enableTesting();
}

const fs = require("fs");
const path = require("path");
const forker = require('child_process');

var globToRegExp =  require("./utils/glob-to-regexp");

var defaultConfig = {
    confFileName: "double-check.json",      // name of the conf file
    fileExt: ".js",                         // test file supported by extension
    matchDirs: ['test', 'tests'],           // dirs names for tests - case insensitive (used in discovery process)
    testsDir: process.cwd(),                // path to the root tests location
    reports: {
        basePath: process.cwd(),            // path where the reports will be saved
        prefix: "Report-",                  // prefix for report files, filename pattern: [prefix]-{timestamp}{ext}
        ext: ".txt"                         // report file extension
    }
}

const TAG = "[TEST_RUNNER]";
const MAX_WORKERS = process.env['DOUBLE_CHECK_POOL_SIZE'] || 10;
const DEBUG = typeof v8debug === 'object';

const TEST_STATES = {
    READY: 'ready',
    RUNNING: 'running',
    FINISHED: 'finished',
    TIMEOUT: 'timeout'
}

// Session object
var defaultSession = {
    testCount: 0,
    currentTestIndex: 0,
    debugPort: process.debugPort,   // current process debug port. The child process will be increased from this port
    workers: {
        running: 0,
        terminated: 0
    }
}

// Template structure for test reports.
var reportFileStructure = {
    count: 0,
    suites: {
        count: 0,
        items: []
    },
    passed: {
        count: 0,
        items: []
    },
    failed: {
        count: 0,
        items: []
    },
}

exports.init = function(sf){
    sf.testRunner = $$.flow.create("testRunner", {
        /**
         * Initialization of the test runner.
         * @param config {Object} - settings object that will be merged with the default one
         * @private
         */
        __init: function(config) {
            this.config = this.__extend(defaultConfig, config);
            this.testTree = {};
            this.testList = [];

            this.session = defaultSession;

            // create reports directory if not exist
            if (!fs.existsSync(this.config.reports.basePath)){
                fs.mkdirSync(this.config.reports.basePath);
            }
        },
        /**
         * Main entry point. It will start the flow runner flow.
         * @param config {Object} - object containing settings such as conf file name, test dir.
         * @param callback {Function} - handler(error, result) invoked when an error occurred or the runner has completed all jobs.
         */
        start: function(config, callback) {

            // wrapper for provided callback, if any
            this.callback = function(err, result) {
                if(err) {
                    this.__debugInfo(err.message || err);
                }

                if(callback) {
                    callback(err, result);
                }
            };

            this.__init(config);

            this.__consoleLog("Discovering tests ...");
            this.testTree = this.__discoverTestFiles(this.config.testsDir, config);
            this.testList = this.__toTestTreeToList(this.testTree);
console.log(this.testTree);
            this.__launchTests();
        },
        /**
         * Reads configuration settings from a json file.
         * @param confPath {String} - absolute path to the configuration file.
         * @returns {Object} - configuration object {{}}
         * @private
         */
        __readConf: function(confPath) {
            var config = {};
            try{
                config = require(confPath);
            } catch(error) {
                console.error(error);
            }

            return config;
        },
        /**
         * Discovers test files recursively starting from a path. The dir is the root of the test files. It can contains
         * test files and test sub directories. It will create a tree structure with the test files discovered.
         * Notes: Only the config.matchDirs will be taken into consideration. Also, based on the conf (double-check.json)
         * it will include the test files or not.
         * @param dir {String} - path where the discovery process starts
         * @param parentConf {String} - configuration object (double-check.json) from the parent directory
         * @returns The root node object of the file structure tree. E.g. {*|{__meta, data, result, items}}
         * @private
         */
        __discoverTestFiles: function(dir, parentConf) {
            let stat = fs.statSync(dir);
            if(!stat.isDirectory()){
                throw new Error(dir + " is not a directory!")
            }

            var currentConf = parentConf;

            var currentNode = this.__getDefaultNodeStructure();
            currentNode.__meta.parent = path.dirname(dir);
            currentNode.__meta.isDirectory = true;

            var files = fs.readdirSync(dir);
            // first look for conf file
            if(files.indexOf(this.config.confFileName) !== -1) {
                let fd = path.join(dir, this.config.confFileName);
                let conf = this.__readConf(fd);
                if(conf) {
                    currentNode.__meta.conf = conf;
                    currentConf = conf;
                }
            }

            currentNode.data.name = path.basename(dir);
            currentNode.data.path = dir;
            currentNode.items = [];

            for(let i = 0, len = files.length; i < len; i++) {
                let item = files[i];

                let fd = path.join(dir, item);
                let stat = fs.statSync(fd);
                let isDir = stat.isDirectory();
                let isTestDir = this.__isTestDir(fd);

                if(isDir && !isTestDir) continue; // ignore dirs that does not follow the naming rule for test dirs

                if(!isDir && item.match(this.config.confFileName)){
                    continue; // already processed
                }

                // exclude files based on glob patterns
                if(currentConf) {
                    // currentConf['ignore'] - array of regExp
                    if(currentConf['ignore']) {
                        let isMatch = this.__isAnyMatch(currentConf['ignore'], item);
                        if(isMatch) continue;
                    }
                }

                let childNode = this.__getDefaultNodeStructure();
                childNode.__meta.conf = {};
                childNode.__meta.isDirectory = isDir;
                childNode.__meta.parent = path.dirname(fd);

                if (isDir) {
                    let tempChildNode = this.__discoverTestFiles(fd, currentConf);
                    childNode = Object.assign(childNode, tempChildNode);
                    currentNode.items.push(childNode);
                }
                else if(path.extname(fd) ===  this.config.fileExt){
                    childNode.__meta.conf.runs = currentConf['runs'] || 1;
                    childNode.__meta.conf.silent = currentConf['silent'];
                    childNode.__meta.conf.timeout = currentConf['timeout'];

                    childNode.data.name = item;
                    childNode.data.path = fd;

                    currentNode.items.push(childNode);
                }
            }

            return currentNode;
        },
        /**
         * Launch collected tests. Initialises session variables, that are specific for the current launch.
         * @private
         */
        __launchTests: function() {
            this.__consoleLog("Launching tests ...");
            this.session.testCount = this.testList.length;
            this.session.processedTestCount = 0;
            this.session.workers.running = 0;
            this.session.workers.terminated = 0;

            if(this.session.testCount > 0) {
                this.__scheduleWork();
            } else {
                this.__doTestReports();
            }
        },
        /**
         * Schedules work based on the MAX available workers, and based on the number of runs of a test.
         * If a test has multiple runs as a option, it will be started in multiple workers. Once all runs are completed,
         * the test is considered as processed.
         * @private
         */
        __scheduleWork: function() {
            while(this.session.workers.running < MAX_WORKERS && this.session.currentTestIndex < this.session.testCount){
                let test = this.testList[this.session.currentTestIndex];
                if(test.result.runs < test.__meta.conf.runs) {
                    test.result.runs++;
                    this.__launchTest(test);
                } else {
                    this.session.currentTestIndex++;
                }
            }
        },
        /**
         * Launch a test into a separate worker (child process).
         * Each worker has handlers for message, exit and error events. Once the exit or error event is invoked,
         * new work is scheduled and session object is updated.
         * Notes: On debug mode, the workers will receive a debug port, that is increased incrementally.
         * @param test {Object} - test object
         * @private
         */
        __launchTest: function(test) {
            this.session.workers.running++;

            test.result.state = TEST_STATES.RUNNING;
            test.result.pass = test.result.pass || true;
            test.result.asserts[test.result.runs] = [];
            test.result.messages[test.result.runs] = [];

            var env = process.env;

            let execArgv = [];
            if(DEBUG) {
                let debugPort = ++defaultSession.debugPort;
                let debugFlag = '--debug=' + debugPort;
                execArgv.push(debugFlag);
            }

            let cwd = test.__meta.parent;

            var worker = forker.fork(test.data.path, [], {'cwd': cwd, 'env': env, 'execArgv': execArgv, stdio: ['inherit', "pipe", 'inherit', 'ipc'] });

            this.__debugInfo(`Launching test ${test.data.name}, run[${test.result.runs}], on worker pid[${worker.pid}]`);

            worker.on("message", onMessageEventHandlerWrapper(test));
            worker.on("exit", onExitEventHandlerWrapper(test));
            worker.on("error", onErrorEventHandlerWrapper(test));
            worker.terminated = false;

            worker.stdout.on('data', function (chunk) {
                let content = new Buffer(chunk).toString('utf8');
                if(test.__meta.conf.silent) {
                    this.__consoleLog(content);
                }
            }.bind(this));

            var self = this;
            function onMessageEventHandlerWrapper(test) {
                let currentRun = test.result.runs;
                return function(log) {
                    if(log.type === 'assert'){
                        if(log.message.includes("[Fail")) {
                            test.result.pass = false;
                        }
                        test.result.asserts[currentRun].push(log);
                    } else {
                        test.result.messages[currentRun].push(log);
                    }
                }
            }

            function onExitEventHandlerWrapper(test) {
                return function(code, signal) {
                    self.__debugInfo(`Worker ${worker.pid} - exit event. Code ${code}, signal ${signal}`);

                    worker.terminated = true;

                    test.result.state = TEST_STATES.FINISHED;

                    self.session.workers.running--;
                    self.session.workers.terminated++;

                    self.__scheduleWork();
                    self.__checkWorkersStatus();
                }
            }

            // this handler can be triggered when:
            // 1. The process could not be spawned, or
            // 2. The process could not be killed, or
            // 3. Sending a message to the child process failed.
            // IMPORTANT: The 'exit' event may or may not fire after an error has occurred!
            function onErrorEventHandlerWrapper(test) {
                return function(error) {
                    self.__debugInfo(`Worker ${worker.pid} - error event.`);
                    self.__debugError(error);

                    self.session.workers.running--;
                    self.session.workers.terminated++;
                }
            }

            // Note: on debug, the timeout is reached before exit event is called
            // when kill is called, the exit event is raised
            setTimeout(function(){
                if(!worker.terminated){
                    self.__debugInfo(`worker pid [${worker.pid}] - timeout event`);

                    worker.kill();
                    test.result.state = TEST_STATES.TIMEOUT;
                }
            }, test.__meta.conf.timeout);
        },
        /**
         * Checks if all workers completed their job (finished or have been terminated).
         * If true, then the reporting steps can be started.
         * @private
         */
        __checkWorkersStatus: function() {
            if(this.session.workers.running == 0) {
                this.__doTestReports();
            }
        },
        /**
         * Creates test reports object (JSON) that will be saved in the test report.
         * Filename of the report is using the following pattern: {prefix}-{timestamp}{ext}
         * The file will be saved in config.reports.basePath.
         * @private
         */
        __doTestReports: function() {
            this.__consoleLog("Doing reports ...");
            reportFileStructure.count = this.testList.length;

            // pass/failed tests
            for(let i = 0, len = this.testList.length; i < len; i++) {
                let test = this.testList[i];

                let testPath = this.__toRelativePath(test.data.path);
                let item = {path: testPath};
                if(test.result.pass) {
                    reportFileStructure.passed.items.push(item);
                } else {
                    item.reason = this.__getFirstFailReasonPerRun(test);
                    reportFileStructure.failed.items.push(item)
                }
            }
            reportFileStructure.passed.count = reportFileStructure.passed.items.length;
            reportFileStructure.failed.count = reportFileStructure.failed.items.length;

            // suites (first level of directories)
            for(let i = 0, len = this.testTree.items.length; i < len; i++) {
                let item = this.testTree.items[i];
                if(item.__meta.isDirectory) {
                    let suitePath = this.__toRelativePath(item.data.path);
                    reportFileStructure.suites.items.push(suitePath)
                }
            }
            reportFileStructure.suites.count = reportFileStructure.suites.items.length;

            const writeReports = this.parallel(function (err, res) {
                this.callback(err, "Done");
            });


            this.__consoleLog(this.config.reports.prefix);
            let fileName = `${this.config.reports.prefix}latest${this.config.reports.ext}`;
            let filePath = path.join(this.config.reports.basePath, fileName);
            writeReports.__saveReportToFile(reportFileStructure, filePath);

            let timestamp = new Date().getTime().toString();
            const htmlFileName = `${this.config.reports.prefix}latest.html`;
            const htmlFilePath = path.join(this.config.reports.basePath, htmlFileName);
            writeReports.__saveHtmlReportToFile(reportFileStructure, htmlFilePath, timestamp);
        },
        /**
         * Saves test reports object (JSON) in the specified path.
         * @param reportFileStructure {Object} - test reports object (JSON)
         * @param destination {String} - path of the file report (the base path MUST exist)
         * @private
         */
        __saveReportToFile: function(reportFileStructure, destination) {

            var content = JSON.stringify(reportFileStructure, null, 4);
            fs.writeFile(destination, content, 'utf8', function (err) {
                if (err) {
                    let message = "An error occurred while writing the report file, with the following error: " + JSON.stringify(err);
                    this.__debugInfo(message);
                    throw err;
                } else{
                    let message = `Finished writing report to ${destination}`;
                    this.__consoleLog(message);
                }
            }.bind(this));
        },
        /**
         * Saves test reports as HTML in the specified path.
         * @param reportFileStructure {Object} - test reports object (JSON)
         * @param destination {String} - path of the file report (the base path MUST exist)
         * @param timestamp {String} - timestamp to be injected in html template
         * @private
         */
        __saveHtmlReportToFile: function (reportFileStructure, destination, timestamp) {
            fs.readFile(__dirname+'/utils/reportTemplate.html', 'utf8', (err, res) => {
                if (err) {
                    let message = 'An error occurred while reading the html report template file, with the following error: ' + JSON.stringify(err);
                    this.__debugInfo(message);
                    throw err;
                }

                fs.writeFile(destination, res + `<script>init(${JSON.stringify(reportFileStructure)}, ${timestamp});</script>`, 'utf8', (err) => {
                    if (err) {
                        let message = 'An error occurred while writing the html report file, with the following error: ' + JSON.stringify(err);
                        this.__debugInfo(message);
                        throw err;
                    }

                    let message = `Finished writing report to ${destination}`;
                    this.__consoleLog(message);
                });
            });
        },
        /**
         * Converts absolute file path to relative path.
         * @param absolutePath {String} - absolute path
         * @returns {string | void | *} - relative path
         * @private
         */
        __toRelativePath: function(absolutePath) {
            let basePath = path.join(this.config.testsDir, "/");
            let relativePath = absolutePath.replace(basePath, "");
            return relativePath;
        },
        /**
         * Checks if a directory is a test dir, by matching its name against config.matchDirs array.
         * @param dir {String} - directory name
         * @returns {boolean} - returns true if there is a match and false otherwise.
         * @private
         */
        __isTestDir: function(dir) {
            if(!this.config || !this.config.matchDirs ) {
                throw `matchDirs is not defined on config ${JSON.stringify(this.config)} does not exist!`;
            }

            var isTestDir = this.config.matchDirs.some(function(item) {
                return dir.toLowerCase().includes(item.toLowerCase());
            });

            return isTestDir;
        },
        /**
         * For a failed test, it returns only the first fail reason per each run.
         * @param test {Object} - test object
         * @returns {Array} - an array of reasons per each test run.
         * @private
         */
        __getFirstFailReasonPerRun: function(test) {
            let reason = [];
            for(let i = 1; i <= test.result.runs; i++) {
                if(test.result.asserts[i] && test.result.asserts[i].length > 0) {
                    addReason(i, test.result.asserts[i][0]);
                }

                if(test.result.messages[i] && test.result.messages[i].length > 0) {
                    addReason(i, test.result.messages[i][0])
                }

                function addReason(run, log) {
                    let message = {
                        run: run,
                        log: log
                    };

                    reason.push(message);
                }
            }

            return reason;
        },
        /**
         * Described default tree node structure.
         * @returns {{__meta: {conf: null, parent: null, isDirectory: boolean}, data: {name: null, path: null}, result: {state: string, pass: null, executionTime: number, runs: number, asserts: {}, messages: {}}, items: null}}
         * @private
         */
        __getDefaultNodeStructure: function() {
            return  {
                __meta: {
                    conf: null,
                    parent: null,
                    isDirectory: false
                },
                data: {
                    name: null,
                    path: null,
                },
                result: {
                    state: TEST_STATES.READY, // ready | running | terminated | timeout
                    pass: null,
                    executionTime: 0,
                    runs: 0,
                    asserts: {},
                    messages: {}
                },
                items: null
            };
        },
        /**
         * Match a test file path to a UNIX glob expression array. If its any match returns true, otherwise returns false.
         * @param globExpArray {Array} - an array with glob expression (UNIX style)
         * @param str {String} - the string to be matched
         * @returns {boolean} - returns true if there is any match and false otherwise.
         * @private
         */
        __isAnyMatch: function(globExpArray, str) {
            let hasMatch = function(globExp) {
                let regex = globToRegExp(globExp);
                return regex.test(str);
            }

            return globExpArray.some(hasMatch)
        },
        /**
         * Converts a tree structure into an array list of test nodes. The tree traversal is DFS (Deep-First-Search).
         * @param rootNode {Object} - root node of the test tree.
         * @returns {Array} - List of test nodes.
         * @private
         */
        __toTestTreeToList: function(rootNode) {
            var testList = [];

            traverse(rootNode);

            function traverse(node) {
                if(!node.__meta.isDirectory || !node.items) return;

                for(let i = 0, len = node.items.length; i < len; i++) {
                    let item = node.items[i];
                    if(item.__meta.isDirectory) {
                        traverse(item);
                    } else {
                        testList.push(item);
                    }
                }
            }

            return testList;
        },
        /**
         * Logging to console wrapper.
         * @param log {String|Object|Number} - log message
         * @private
         */
        __consoleLog: function(log) {
            console.log(TAG, log);
        },
        /**
         * Logging debugging info messages wrapper.
         * Logger: console.info
         * @param log {String|Object|Number} - log message
         * @private
         */
        __debugInfo: function(log) {
            this.__debug(console.info, log);
        },
        /**
         * Logging debugging error messages wrapper.
         * Logger: console.error
         * @param log {String|Object|Number} - log message
         * @private
         */
        __debugError: function(log) {
            this.__debug(console.error, log);
        },
        /**
         *  Logging debugging messages wrapper. One debug mode, the logging is silent.
         * @param logger {Function} - handler for logging
         * @param log {String|Object|Number} - log message
         * @private
         */
        __debug: function(logger, log) {
            if(!DEBUG) return;

            let prettyLog = JSON.stringify(log, null, 2);
            logger("DEBUG", log);
        },
        /**
         * Deep extend one object with properties of another object.
         * If the property exists in both objects the property from the first object is overridden.
         * @param first {Object} - the first object
         * @param second {Object} - the second object
         * @returns {Object} - an object with both properties from the first and second object.
         * @private
         */
        __extend: function (first, second) {
            for (let key in second) {
                if (!first.hasOwnProperty(key)) {
                    first[key] = second[key];
                } else {
                    let val = second[key];
                    if(typeof first[key] === 'object') {
                        val = this.__extend(first[key], second[key])
                    }

                    first[key] = val;
                }
            }

            return first;
        }
    });
};

}).call(this,require("path").join(__dirname,"..","modules","double-check","lib"))

},{"../../../engine/core":3,"./utils/glob-to-regexp":23,"child_process":undefined,"fs":undefined,"path":undefined}],23:[function(require,module,exports){

// globToRegExp turns a UNIX glob expression into a RegEx expression.
//  Supports all simple glob patterns. Examples: *.ext, /foo/*, ../../path, ^foo.*
// - single character matching, matching ranges of characters etc. group matching are no supported
// - flags are not supported
var globToRegExp = function (globExp) {
    if (typeof globExp !== 'string') {
        throw new TypeError('Glob Expression must be a string!');
    }

    var regExp = "";

    for (let i = 0, len = globExp.length; i < len; i++) {
        let c = globExp[i];

        switch (c) {
            case "/":
            case "$":
            case "^":
            case "+":
            case ".":
            case "(":
            case ")":
            case "=":
            case "!":
            case "|":
                regExp += "\\" + c;
                break;

            case "*":
                // treat any number of "*" as one
                while(globExp[i + 1] === "*") {
                    i++;
                }
                regExp += ".*";
                break;

            default:
                regExp += c;
        }
    }

    // set the regular expression with ^ & $
    regExp = "^" + regExp + "$";

    return new RegExp(regExp);
};

module.exports = globToRegExp
},{}],24:[function(require,module,exports){
const PskCrypto = require("./lib/PskCrypto");

const ssutil = require("./signsensusDS/ssutil")

module.exports = PskCrypto;

module.exports.hashValues = ssutil.hashValues;


},{"./lib/PskCrypto":26,"./signsensusDS/ssutil":46}],25:[function(require,module,exports){
const crypto = require('crypto');
const KeyEncoder = require('./keyEncoder');

function ECDSA(curveName){
    this.curve = curveName || 'secp256k1';
    var self = this;

    this.generateKeyPair = function() {
        var result     = {};
        var ec         = crypto.createECDH(self.curve);
        result.public  = ec.generateKeys('hex');
        result.private = ec.getPrivateKey('hex');
        return keysToPEM(result);
    };

    function keysToPEM(keys){
        var result                  = {};
        var ECPrivateKeyASN         = KeyEncoder.ECPrivateKeyASN;
        var SubjectPublicKeyInfoASN = KeyEncoder.SubjectPublicKeyInfoASN;
        var keyEncoder              = new KeyEncoder(self.curve);

        var privateKeyObject        = keyEncoder.privateKeyObject(keys.private,keys.public);
        var publicKeyObject         = keyEncoder.publicKeyObject(keys.public);

        result.private              = ECPrivateKeyASN.encode(privateKeyObject, 'pem', privateKeyObject.pemOptions);
        result.public               = SubjectPublicKeyInfoASN.encode(publicKeyObject, 'pem', publicKeyObject.pemOptions);

        return result;

    }

    this.sign = function (privateKey,digest) {
        var sign = crypto.createSign("sha256");
        sign.update(digest);

        return sign.sign(privateKey,'hex');
    };

    this.verify = function (publicKey,signature,digest) {
        var verify = crypto.createVerify('sha256');
        verify.update(digest);

        return verify.verify(publicKey,signature,'hex');
    }
}

exports.createECDSA = function (curve){
    return new ECDSA(curve);
};
},{"./keyEncoder":42,"crypto":undefined}],26:[function(require,module,exports){

const crypto = require('crypto');
const fs = require('fs');
const path = require("path");
const Duplex = require('stream').Duplex;
const os = require('os');

function PskCrypto() {
	/*--------------------------------------------- ECDSA functions ------------------------------------------*/
	const ecdsa = require("./ECDSA").createECDSA();
	this.generateECDSAKeyPair = function () {
		return ecdsa.generateKeyPair();
	};

	this.sign = function (privateKey, digest) {
		return ecdsa.sign(privateKey, digest);
	};

	this.verify = function (publicKey, signature, digest) {
		return ecdsa.verify(publicKey, signature, digest);
	};

	/*---------------------------------------------Encryption functions -------------------------------------*/
	const utils = require("./utils/cryptoUtils");
	const archiver = require("./psk-archiver");
	var tempFolder = os.tmpdir();

	this.encryptStream = function (inputPath, destinationPath, password) {
		utils.encryptFile(inputPath, destinationPath, password);
	};

	this.decryptStream = function (encryptedInputPath, outputFolder, password) {
		utils.decryptFile(encryptedInputPath, tempFolder, password, function (err, tempArchivePath) {
			archiver.unzip(tempArchivePath, outputFolder, function () {
				console.log("Decryption is completed.");
				fs.unlinkSync(tempArchivePath);
			});
		})
	};


	this.pskHash = function (data) {
		if (utils.isJson(data)) {
			return utils.createPskHash(JSON.stringify(data));
		} else {
			return utils.createPskHash(data);
		}
	};


	this.saveDSeed = function (dseed, pin, dseedPath) {
		var encryptionKey   = utils.deriveKey(pin, null, null);
		var iv              = crypto.randomBytes(16);
		var cipher          = crypto.createCipheriv('aes-256-cfb', encryptionKey, iv);
		var encryptedDSeed  = cipher.update(dseed, 'binary');
		var final           = Buffer.from(cipher.final('binary'), 'binary');
		encryptedDSeed      = Buffer.concat([iv, encryptedDSeed, final]);
		fs.writeFileSync(dseedPath, encryptedDSeed);
	};

	this.loadDseed = function (pin, dseedPath) {
		var encryptedData  = fs.readFileSync(dseedPath);
		var iv             = encryptedData.slice(0, 16);
		var encryptedDseed = encryptedData.slice(16);
		var encryptionKey  = utils.deriveKey(pin, null, null);
		var decipher       = crypto.createDecipheriv('aes-256-cfb', encryptionKey, iv);
		var dseed          = Buffer.from(decipher.update(encryptedDseed, 'binary'), 'binary');
		var final          = Buffer.from(decipher.final('binary'), 'binary');
		dseed              = Buffer.concat([dseed, final]);

		return dseed;

	};


	this.deriveSeed = function (seed, dseedLen) {
		return utils.deriveKey(seed, null, dseedLen);

	};

	this.encryptJson = function (data, dseed) {
		var cipherText = utils.encrypt(JSON.stringify(data), dseed);

		return cipherText;
	};

	this.decryptJson = function (encryptedData, dseed) {
		var plaintext = utils.decrypt(encryptedData, dseed);

		return JSON.parse(plaintext);
	};

	this.encryptBlob = function (data, dseed) {
		var ciphertext = utils.encrypt(data, dseed);

		return ciphertext;
	};

	this.decryptBlob = function (encryptedData, dseed) {
		var plaintext = utils.decrypt(encryptedData, dseed);

		return plaintext;
	};


	this.generateSeed = function (backupUrl) {
		var seed = {
			"backup": backupUrl,
			"rand"	: crypto.randomBytes(32).toString("hex")
		};
		return Buffer.from(JSON.stringify(seed));
	};
	this.generateSafeUid = function (dseed, path) {
		path = path || process.cwd();
		return utils.encode(this.pskHash(Buffer.concat([Buffer.from(path), dseed])));
	};
}

// var pcrypto = new PskCrypto();
// pcrypto.encryptStream("C:\\Users\\Acer\\WebstormProjects\\privatesky\\tests\\psk-unit-testing\\zip\\output","output/myfile", "123");
// pcrypto.decryptStream("output\\myfile", "output", "123");
module.exports = new PskCrypto();
},{"./ECDSA":25,"./psk-archiver":43,"./utils/cryptoUtils":44,"crypto":undefined,"fs":undefined,"os":undefined,"path":undefined,"stream":undefined}],27:[function(require,module,exports){
var asn1 = require('./asn1');
var inherits = require('util').inherits;

var api = exports;

api.define = function define(name, body) {
  return new Entity(name, body);
};

function Entity(name, body) {
  this.name = name;
  this.body = body;

  this.decoders = {};
  this.encoders = {};
};

Entity.prototype._createNamed = function createNamed(base) {
  var named;
  try {
    named = require('vm').runInThisContext(
      '(function ' + this.name + '(entity) {\n' +
      '  this._initNamed(entity);\n' +
      '})'
    );
  } catch (e) {
    named = function (entity) {
      this._initNamed(entity);
    };
  }
  inherits(named, base);
  named.prototype._initNamed = function initnamed(entity) {
    base.call(this, entity);
  };

  return new named(this);
};

Entity.prototype._getDecoder = function _getDecoder(enc) {
  // Lazily create decoder
  if (!this.decoders.hasOwnProperty(enc))
    this.decoders[enc] = this._createNamed(asn1.decoders[enc]);
  return this.decoders[enc];
};

Entity.prototype.decode = function decode(data, enc, options) {
  return this._getDecoder(enc).decode(data, options);
};

Entity.prototype._getEncoder = function _getEncoder(enc) {
  // Lazily create encoder
  if (!this.encoders.hasOwnProperty(enc))
    this.encoders[enc] = this._createNamed(asn1.encoders[enc]);
  return this.encoders[enc];
};

Entity.prototype.encode = function encode(data, enc, /* internal */ reporter) {
  return this._getEncoder(enc).encode(data, reporter);
};

},{"./asn1":28,"util":undefined,"vm":undefined}],28:[function(require,module,exports){
var asn1 = exports;

asn1.bignum = require('./bignum/bn');

asn1.define = require('./api').define;
asn1.base = require('./base/index');
asn1.constants = require('./constants/index');
asn1.decoders = require('./decoders/index');
asn1.encoders = require('./encoders/index');

},{"./api":27,"./base/index":30,"./bignum/bn":33,"./constants/index":35,"./decoders/index":37,"./encoders/index":40}],29:[function(require,module,exports){
var inherits = require('util').inherits;
var Reporter = require('../base').Reporter;
var Buffer = require('buffer').Buffer;

function DecoderBuffer(base, options) {
  Reporter.call(this, options);
  if (!Buffer.isBuffer(base)) {
    this.error('Input not Buffer');
    return;
  }

  this.base = base;
  this.offset = 0;
  this.length = base.length;
}
inherits(DecoderBuffer, Reporter);
exports.DecoderBuffer = DecoderBuffer;

DecoderBuffer.prototype.save = function save() {
  return { offset: this.offset, reporter: Reporter.prototype.save.call(this) };
};

DecoderBuffer.prototype.restore = function restore(save) {
  // Return skipped data
  var res = new DecoderBuffer(this.base);
  res.offset = save.offset;
  res.length = this.offset;

  this.offset = save.offset;
  Reporter.prototype.restore.call(this, save.reporter);

  return res;
};

DecoderBuffer.prototype.isEmpty = function isEmpty() {
  return this.offset === this.length;
};

DecoderBuffer.prototype.readUInt8 = function readUInt8(fail) {
  if (this.offset + 1 <= this.length)
    return this.base.readUInt8(this.offset++, true);
  else
    return this.error(fail || 'DecoderBuffer overrun');
}

DecoderBuffer.prototype.skip = function skip(bytes, fail) {
  if (!(this.offset + bytes <= this.length))
    return this.error(fail || 'DecoderBuffer overrun');

  var res = new DecoderBuffer(this.base);

  // Share reporter state
  res._reporterState = this._reporterState;

  res.offset = this.offset;
  res.length = this.offset + bytes;
  this.offset += bytes;
  return res;
}

DecoderBuffer.prototype.raw = function raw(save) {
  return this.base.slice(save ? save.offset : this.offset, this.length);
}

function EncoderBuffer(value, reporter) {
  if (Array.isArray(value)) {
    this.length = 0;
    this.value = value.map(function(item) {
      if (!(item instanceof EncoderBuffer))
        item = new EncoderBuffer(item, reporter);
      this.length += item.length;
      return item;
    }, this);
  } else if (typeof value === 'number') {
    if (!(0 <= value && value <= 0xff))
      return reporter.error('non-byte EncoderBuffer value');
    this.value = value;
    this.length = 1;
  } else if (typeof value === 'string') {
    this.value = value;
    this.length = Buffer.byteLength(value);
  } else if (Buffer.isBuffer(value)) {
    this.value = value;
    this.length = value.length;
  } else {
    return reporter.error('Unsupported type: ' + typeof value);
  }
}
exports.EncoderBuffer = EncoderBuffer;

EncoderBuffer.prototype.join = function join(out, offset) {
  if (!out)
    out = new Buffer(this.length);
  if (!offset)
    offset = 0;

  if (this.length === 0)
    return out;

  if (Array.isArray(this.value)) {
    this.value.forEach(function(item) {
      item.join(out, offset);
      offset += item.length;
    });
  } else {
    if (typeof this.value === 'number')
      out[offset] = this.value;
    else if (typeof this.value === 'string')
      out.write(this.value, offset);
    else if (Buffer.isBuffer(this.value))
      this.value.copy(out, offset);
    offset += this.length;
  }

  return out;
};

},{"../base":30,"buffer":undefined,"util":undefined}],30:[function(require,module,exports){
var base = exports;

base.Reporter = require('./reporter').Reporter;
base.DecoderBuffer = require('./buffer').DecoderBuffer;
base.EncoderBuffer = require('./buffer').EncoderBuffer;
base.Node = require('./node');

},{"./buffer":29,"./node":31,"./reporter":32}],31:[function(require,module,exports){
var Reporter = require('../base').Reporter;
var EncoderBuffer = require('../base').EncoderBuffer;
//var assert = require('double-check').assert;

// Supported tags
var tags = [
  'seq', 'seqof', 'set', 'setof', 'octstr', 'bitstr', 'objid', 'bool',
  'gentime', 'utctime', 'null_', 'enum', 'int', 'ia5str', 'utf8str'
];

// Public methods list
var methods = [
  'key', 'obj', 'use', 'optional', 'explicit', 'implicit', 'def', 'choice',
  'any'
].concat(tags);

// Overrided methods list
var overrided = [
  '_peekTag', '_decodeTag', '_use',
  '_decodeStr', '_decodeObjid', '_decodeTime',
  '_decodeNull', '_decodeInt', '_decodeBool', '_decodeList',

  '_encodeComposite', '_encodeStr', '_encodeObjid', '_encodeTime',
  '_encodeNull', '_encodeInt', '_encodeBool'
];

function Node(enc, parent) {
  var state = {};
  this._baseState = state;

  state.enc = enc;

  state.parent = parent || null;
  state.children = null;

  // State
  state.tag = null;
  state.args = null;
  state.reverseArgs = null;
  state.choice = null;
  state.optional = false;
  state.any = false;
  state.obj = false;
  state.use = null;
  state.useDecoder = null;
  state.key = null;
  state['default'] = null;
  state.explicit = null;
  state.implicit = null;

  // Should create new instance on each method
  if (!state.parent) {
    state.children = [];
    this._wrap();
  }
}
module.exports = Node;

var stateProps = [
  'enc', 'parent', 'children', 'tag', 'args', 'reverseArgs', 'choice',
  'optional', 'any', 'obj', 'use', 'alteredUse', 'key', 'default', 'explicit',
  'implicit'
];

Node.prototype.clone = function clone() {
  var state = this._baseState;
  var cstate = {};
  stateProps.forEach(function(prop) {
    cstate[prop] = state[prop];
  });
  var res = new this.constructor(cstate.parent);
  res._baseState = cstate;
  return res;
};

Node.prototype._wrap = function wrap() {
  var state = this._baseState;
  methods.forEach(function(method) {
    this[method] = function _wrappedMethod() {
      var clone = new this.constructor(this);
      state.children.push(clone);
      return clone[method].apply(clone, arguments);
    };
  }, this);
};

Node.prototype._init = function init(body) {
  var state = this._baseState;

  //assert.equal(state.parent,null,'state.parent should be null');
  body.call(this);

  // Filter children
  state.children = state.children.filter(function(child) {
    return child._baseState.parent === this;
  }, this);
  // assert.equal(state.children.length, 1, 'Root node can have only one child');
};

Node.prototype._useArgs = function useArgs(args) {
  var state = this._baseState;

  // Filter children and args
  var children = args.filter(function(arg) {
    return arg instanceof this.constructor;
  }, this);
  args = args.filter(function(arg) {
    return !(arg instanceof this.constructor);
  }, this);

  if (children.length !== 0) {
    // assert.equal(state.children, null, 'state.children should be null');
    state.children = children;

    // Replace parent to maintain backward link
    children.forEach(function(child) {
      child._baseState.parent = this;
    }, this);
  }
  if (args.length !== 0) {
    // assert.equal(state.args, null, 'state.args should be null');
    state.args = args;
    state.reverseArgs = args.map(function(arg) {
      if (typeof arg !== 'object' || arg.constructor !== Object)
        return arg;

      var res = {};
      Object.keys(arg).forEach(function(key) {
        if (key == (key | 0))
          key |= 0;
        var value = arg[key];
        res[value] = key;
      });
      return res;
    });
  }
};

//
// Overrided methods
//

overrided.forEach(function(method) {
  Node.prototype[method] = function _overrided() {
    var state = this._baseState;
    throw new Error(method + ' not implemented for encoding: ' + state.enc);
  };
});

//
// Public methods
//

tags.forEach(function(tag) {
  Node.prototype[tag] = function _tagMethod() {
    var state = this._baseState;
    var args = Array.prototype.slice.call(arguments);

    // assert.equal(state.tag, null, 'state.tag should be null');
    state.tag = tag;

    this._useArgs(args);

    return this;
  };
});

Node.prototype.use = function use(item) {
  var state = this._baseState;

  // assert.equal(state.use, null, 'state.use should be null');
  state.use = item;

  return this;
};

Node.prototype.optional = function optional() {
  var state = this._baseState;

  state.optional = true;

  return this;
};

Node.prototype.def = function def(val) {
  var state = this._baseState;

  // assert.equal(state['default'], null, "state['default'] should be null");
  state['default'] = val;
  state.optional = true;

  return this;
};

Node.prototype.explicit = function explicit(num) {
  var state = this._baseState;

  // assert.equal(state.explicit,null, 'state.explicit should be null');
  // assert.equal(state.implicit,null, 'state.implicit should be null');

  state.explicit = num;

  return this;
};

Node.prototype.implicit = function implicit(num) {
  var state = this._baseState;

    // assert.equal(state.explicit,null, 'state.explicit should be null');
    // assert.equal(state.implicit,null, 'state.implicit should be null');

    state.implicit = num;

  return this;
};

Node.prototype.obj = function obj() {
  var state = this._baseState;
  var args = Array.prototype.slice.call(arguments);

  state.obj = true;

  if (args.length !== 0)
    this._useArgs(args);

  return this;
};

Node.prototype.key = function key(newKey) {
  var state = this._baseState;

  // assert.equal(state.key, null, 'state.key should be null');
  state.key = newKey;

  return this;
};

Node.prototype.any = function any() {
  var state = this._baseState;

  state.any = true;

  return this;
};

Node.prototype.choice = function choice(obj) {
  var state = this._baseState;

  // assert.equal(state.choice, null,'state.choice should be null');
  state.choice = obj;
  this._useArgs(Object.keys(obj).map(function(key) {
    return obj[key];
  }));

  return this;
};

//
// Decoding
//

Node.prototype._decode = function decode(input) {
  var state = this._baseState;

  // Decode root node
  if (state.parent === null)
    return input.wrapResult(state.children[0]._decode(input));

  var result = state['default'];
  var present = true;

  var prevKey;
  if (state.key !== null)
    prevKey = input.enterKey(state.key);

  // Check if tag is there
  if (state.optional) {
    var tag = null;
    if (state.explicit !== null)
      tag = state.explicit;
    else if (state.implicit !== null)
      tag = state.implicit;
    else if (state.tag !== null)
      tag = state.tag;

    if (tag === null && !state.any) {
      // Trial and Error
      var save = input.save();
      try {
        if (state.choice === null)
          this._decodeGeneric(state.tag, input);
        else
          this._decodeChoice(input);
        present = true;
      } catch (e) {
        present = false;
      }
      input.restore(save);
    } else {
      present = this._peekTag(input, tag, state.any);

      if (input.isError(present))
        return present;
    }
  }

  // Push object on stack
  var prevObj;
  if (state.obj && present)
    prevObj = input.enterObject();

  if (present) {
    // Unwrap explicit values
    if (state.explicit !== null) {
      var explicit = this._decodeTag(input, state.explicit);
      if (input.isError(explicit))
        return explicit;
      input = explicit;
    }

    // Unwrap implicit and normal values
    if (state.use === null && state.choice === null) {
      if (state.any)
        var save = input.save();
      var body = this._decodeTag(
        input,
        state.implicit !== null ? state.implicit : state.tag,
        state.any
      );
      if (input.isError(body))
        return body;

      if (state.any)
        result = input.raw(save);
      else
        input = body;
    }

    // Select proper method for tag
    if (state.any)
      result = result;
    else if (state.choice === null)
      result = this._decodeGeneric(state.tag, input);
    else
      result = this._decodeChoice(input);

    if (input.isError(result))
      return result;

    // Decode children
    if (!state.any && state.choice === null && state.children !== null) {
      var fail = state.children.some(function decodeChildren(child) {
        // NOTE: We are ignoring errors here, to let parser continue with other
        // parts of encoded data
        child._decode(input);
      });
      if (fail)
        return err;
    }
  }

  // Pop object
  if (state.obj && present)
    result = input.leaveObject(prevObj);

  // Set key
  if (state.key !== null && (result !== null || present === true))
    input.leaveKey(prevKey, state.key, result);

  return result;
};

Node.prototype._decodeGeneric = function decodeGeneric(tag, input) {
  var state = this._baseState;

  if (tag === 'seq' || tag === 'set')
    return null;
  if (tag === 'seqof' || tag === 'setof')
    return this._decodeList(input, tag, state.args[0]);
  else if (tag === 'octstr' || tag === 'bitstr')
    return this._decodeStr(input, tag);
  else if (tag === 'ia5str' || tag === 'utf8str')
    return this._decodeStr(input, tag);
  else if (tag === 'objid' && state.args)
    return this._decodeObjid(input, state.args[0], state.args[1]);
  else if (tag === 'objid')
    return this._decodeObjid(input, null, null);
  else if (tag === 'gentime' || tag === 'utctime')
    return this._decodeTime(input, tag);
  else if (tag === 'null_')
    return this._decodeNull(input);
  else if (tag === 'bool')
    return this._decodeBool(input);
  else if (tag === 'int' || tag === 'enum')
    return this._decodeInt(input, state.args && state.args[0]);
  else if (state.use !== null)
    return this._getUse(state.use, input._reporterState.obj)._decode(input);
  else
    return input.error('unknown tag: ' + tag);

  return null;
};

Node.prototype._getUse = function _getUse(entity, obj) {

  var state = this._baseState;
  // Create altered use decoder if implicit is set
  state.useDecoder = this._use(entity, obj);
  // assert.equal(state.useDecoder._baseState.parent, null, 'state.useDecoder._baseState.parent should be null');
  state.useDecoder = state.useDecoder._baseState.children[0];
  if (state.implicit !== state.useDecoder._baseState.implicit) {
    state.useDecoder = state.useDecoder.clone();
    state.useDecoder._baseState.implicit = state.implicit;
  }
  return state.useDecoder;
};

Node.prototype._decodeChoice = function decodeChoice(input) {
  var state = this._baseState;
  var result = null;
  var match = false;

  Object.keys(state.choice).some(function(key) {
    var save = input.save();
    var node = state.choice[key];
    try {
      var value = node._decode(input);
      if (input.isError(value))
        return false;

      result = { type: key, value: value };
      match = true;
    } catch (e) {
      input.restore(save);
      return false;
    }
    return true;
  }, this);

  if (!match)
    return input.error('Choice not matched');

  return result;
};

//
// Encoding
//

Node.prototype._createEncoderBuffer = function createEncoderBuffer(data) {
  return new EncoderBuffer(data, this.reporter);
};

Node.prototype._encode = function encode(data, reporter, parent) {
  var state = this._baseState;
  if (state['default'] !== null && state['default'] === data)
    return;

  var result = this._encodeValue(data, reporter, parent);
  if (result === undefined)
    return;

  if (this._skipDefault(result, reporter, parent))
    return;

  return result;
};

Node.prototype._encodeValue = function encode(data, reporter, parent) {
  var state = this._baseState;

  // Decode root node
  if (state.parent === null)
    return state.children[0]._encode(data, reporter || new Reporter());

  var result = null;
  var present = true;

  // Set reporter to share it with a child class
  this.reporter = reporter;

  // Check if data is there
  if (state.optional && data === undefined) {
    if (state['default'] !== null)
      data = state['default']
    else
      return;
  }

  // For error reporting
  var prevKey;

  // Encode children first
  var content = null;
  var primitive = false;
  if (state.any) {
    // Anything that was given is translated to buffer
    result = this._createEncoderBuffer(data);
  } else if (state.choice) {
    result = this._encodeChoice(data, reporter);
  } else if (state.children) {
    content = state.children.map(function(child) {
      if (child._baseState.tag === 'null_')
        return child._encode(null, reporter, data);

      if (child._baseState.key === null)
        return reporter.error('Child should have a key');
      var prevKey = reporter.enterKey(child._baseState.key);

      if (typeof data !== 'object')
        return reporter.error('Child expected, but input is not object');

      var res = child._encode(data[child._baseState.key], reporter, data);
      reporter.leaveKey(prevKey);

      return res;
    }, this).filter(function(child) {
      return child;
    });

    content = this._createEncoderBuffer(content);
  } else {
    if (state.tag === 'seqof' || state.tag === 'setof') {
      // TODO(indutny): this should be thrown on DSL level
      if (!(state.args && state.args.length === 1))
        return reporter.error('Too many args for : ' + state.tag);

      if (!Array.isArray(data))
        return reporter.error('seqof/setof, but data is not Array');

      var child = this.clone();
      child._baseState.implicit = null;
      content = this._createEncoderBuffer(data.map(function(item) {
        var state = this._baseState;

        return this._getUse(state.args[0], data)._encode(item, reporter);
      }, child));
    } else if (state.use !== null) {
      result = this._getUse(state.use, parent)._encode(data, reporter);
    } else {
      content = this._encodePrimitive(state.tag, data);
      primitive = true;
    }
  }

  // Encode data itself
  var result;
  if (!state.any && state.choice === null) {
    var tag = state.implicit !== null ? state.implicit : state.tag;
    var cls = state.implicit === null ? 'universal' : 'context';

    if (tag === null) {
      if (state.use === null)
        reporter.error('Tag could be ommited only for .use()');
    } else {
      if (state.use === null)
        result = this._encodeComposite(tag, primitive, cls, content);
    }
  }

  // Wrap in explicit
  if (state.explicit !== null)
    result = this._encodeComposite(state.explicit, false, 'context', result);

  return result;
};

Node.prototype._encodeChoice = function encodeChoice(data, reporter) {
  var state = this._baseState;

  var node = state.choice[data.type];
  // if (!node) {
  //   assert(
  //       false,
  //       data.type + ' not found in ' +
  //           JSON.stringify(Object.keys(state.choice)));
  // }
  return node._encode(data.value, reporter);
};

Node.prototype._encodePrimitive = function encodePrimitive(tag, data) {
  var state = this._baseState;

  if (tag === 'octstr' || tag === 'bitstr' || tag === 'ia5str')
    return this._encodeStr(data, tag);
  else if (tag === 'utf8str')
    return this._encodeStr(data, tag);
  else if (tag === 'objid' && state.args)
    return this._encodeObjid(data, state.reverseArgs[0], state.args[1]);
  else if (tag === 'objid')
    return this._encodeObjid(data, null, null);
  else if (tag === 'gentime' || tag === 'utctime')
    return this._encodeTime(data, tag);
  else if (tag === 'null_')
    return this._encodeNull();
  else if (tag === 'int' || tag === 'enum')
    return this._encodeInt(data, state.args && state.reverseArgs[0]);
  else if (tag === 'bool')
    return this._encodeBool(data);
  else
    throw new Error('Unsupported tag: ' + tag);
};

},{"../base":30}],32:[function(require,module,exports){
var inherits = require('util').inherits;

function Reporter(options) {
  this._reporterState = {
    obj: null,
    path: [],
    options: options || {},
    errors: []
  };
}
exports.Reporter = Reporter;

Reporter.prototype.isError = function isError(obj) {
  return obj instanceof ReporterError;
};

Reporter.prototype.save = function save() {
  var state = this._reporterState;

  return { obj: state.obj, pathLen: state.path.length };
};

Reporter.prototype.restore = function restore(data) {
  var state = this._reporterState;

  state.obj = data.obj;
  state.path = state.path.slice(0, data.pathLen);
};

Reporter.prototype.enterKey = function enterKey(key) {
  return this._reporterState.path.push(key);
};

Reporter.prototype.leaveKey = function leaveKey(index, key, value) {
  var state = this._reporterState;

  state.path = state.path.slice(0, index - 1);
  if (state.obj !== null)
    state.obj[key] = value;
};

Reporter.prototype.enterObject = function enterObject() {
  var state = this._reporterState;

  var prev = state.obj;
  state.obj = {};
  return prev;
};

Reporter.prototype.leaveObject = function leaveObject(prev) {
  var state = this._reporterState;

  var now = state.obj;
  state.obj = prev;
  return now;
};

Reporter.prototype.error = function error(msg) {
  var err;
  var state = this._reporterState;

  var inherited = msg instanceof ReporterError;
  if (inherited) {
    err = msg;
  } else {
    err = new ReporterError(state.path.map(function(elem) {
      return '[' + JSON.stringify(elem) + ']';
    }).join(''), msg.message || msg, msg.stack);
  }

  if (!state.options.partial)
    throw err;

  if (!inherited)
    state.errors.push(err);

  return err;
};

Reporter.prototype.wrapResult = function wrapResult(result) {
  var state = this._reporterState;
  if (!state.options.partial)
    return result;

  return {
    result: this.isError(result) ? null : result,
    errors: state.errors
  };
};

function ReporterError(path, msg) {
  this.path = path;
  this.rethrow(msg);
};
inherits(ReporterError, Error);

ReporterError.prototype.rethrow = function rethrow(msg) {
  this.message = msg + ' at: ' + (this.path || '(shallow)');
  Error.captureStackTrace(this, ReporterError);

  return this;
};

},{"util":undefined}],33:[function(require,module,exports){
(function (module, exports) {

'use strict';

// Utils

function assert(val, msg) {
  if (!val)
    throw new Error(msg || 'Assertion failed');
}

// Could use `inherits` module, but don't want to move from single file
// architecture yet.
function inherits(ctor, superCtor) {
  ctor.super_ = superCtor;
  var TempCtor = function () {};
  TempCtor.prototype = superCtor.prototype;
  ctor.prototype = new TempCtor();
  ctor.prototype.constructor = ctor;
}

// BN

function BN(number, base, endian) {
  // May be `new BN(bn)` ?
  if (number !== null &&
      typeof number === 'object' &&
      Array.isArray(number.words)) {
    return number;
  }

  this.sign = false;
  this.words = null;
  this.length = 0;

  // Reduction context
  this.red = null;

  if (base === 'le' || base === 'be') {
    endian = base;
    base = 10;
  }

  if (number !== null)
    this._init(number || 0, base || 10, endian || 'be');
}
if (typeof module === 'object')
  module.exports = BN;
else
  exports.BN = BN;

BN.BN = BN;
BN.wordSize = 26;

BN.prototype._init = function init(number, base, endian) {
  if (typeof number === 'number') {
    return this._initNumber(number, base, endian);
  } else if (typeof number === 'object') {
    return this._initArray(number, base, endian);
  }
  if (base === 'hex')
    base = 16;
  assert(base === (base | 0) && base >= 2 && base <= 36);

  number = number.toString().replace(/\s+/g, '');
  var start = 0;
  if (number[0] === '-')
    start++;

  if (base === 16)
    this._parseHex(number, start);
  else
    this._parseBase(number, base, start);

  if (number[0] === '-')
    this.sign = true;

  this.strip();

  if (endian !== 'le')
    return;

  this._initArray(this.toArray(), base, endian);
};

BN.prototype._initNumber = function _initNumber(number, base, endian) {
  if (number < 0) {
    this.sign = true;
    number = -number;
  }
  if (number < 0x4000000) {
    this.words = [ number & 0x3ffffff ];
    this.length = 1;
  } else if (number < 0x10000000000000) {
    this.words = [
      number & 0x3ffffff,
      (number / 0x4000000) & 0x3ffffff
    ];
    this.length = 2;
  } else {
    assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
    this.words = [
      number & 0x3ffffff,
      (number / 0x4000000) & 0x3ffffff,
      1
    ];
    this.length = 3;
  }

  if (endian !== 'le')
    return;

  // Reverse the bytes
  this._initArray(this.toArray(), base, endian);
};

BN.prototype._initArray = function _initArray(number, base, endian) {
  // Perhaps a Uint8Array
  assert(typeof number.length === 'number');
  if (number.length <= 0) {
    this.words = [ 0 ];
    this.length = 1;
    return this;
  }

  this.length = Math.ceil(number.length / 3);
  this.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    this.words[i] = 0;

  var off = 0;
  if (endian === 'be') {
    for (var i = number.length - 1, j = 0; i >= 0; i -= 3) {
      var w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
      this.words[j] |= (w << off) & 0x3ffffff;
      this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
      off += 24;
      if (off >= 26) {
        off -= 26;
        j++;
      }
    }
  } else if (endian === 'le') {
    for (var i = 0, j = 0; i < number.length; i += 3) {
      var w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
      this.words[j] |= (w << off) & 0x3ffffff;
      this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
      off += 24;
      if (off >= 26) {
        off -= 26;
        j++;
      }
    }
  }
  return this.strip();
};

function parseHex(str, start, end) {
  var r = 0;
  var len = Math.min(str.length, end);
  for (var i = start; i < len; i++) {
    var c = str.charCodeAt(i) - 48;

    r <<= 4;

    // 'a' - 'f'
    if (c >= 49 && c <= 54)
      r |= c - 49 + 0xa;

    // 'A' - 'F'
    else if (c >= 17 && c <= 22)
      r |= c - 17 + 0xa;

    // '0' - '9'
    else
      r |= c & 0xf;
  }
  return r;
}

BN.prototype._parseHex = function _parseHex(number, start) {
  // Create possibly bigger array to ensure that it fits the number
  this.length = Math.ceil((number.length - start) / 6);
  this.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    this.words[i] = 0;

  // Scan 24-bit chunks and add them to the number
  var off = 0;
  for (var i = number.length - 6, j = 0; i >= start; i -= 6) {
    var w = parseHex(number, i, i + 6);
    this.words[j] |= (w << off) & 0x3ffffff;
    this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
    off += 24;
    if (off >= 26) {
      off -= 26;
      j++;
    }
  }
  if (i + 6 !== start) {
    var w = parseHex(number, start, i + 6);
    this.words[j] |= (w << off) & 0x3ffffff;
    this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
  }
  this.strip();
};

function parseBase(str, start, end, mul) {
  var r = 0;
  var len = Math.min(str.length, end);
  for (var i = start; i < len; i++) {
    var c = str.charCodeAt(i) - 48;

    r *= mul;

    // 'a'
    if (c >= 49)
      r += c - 49 + 0xa;

    // 'A'
    else if (c >= 17)
      r += c - 17 + 0xa;

    // '0' - '9'
    else
      r += c;
  }
  return r;
}

BN.prototype._parseBase = function _parseBase(number, base, start) {
  // Initialize as zero
  this.words = [ 0 ];
  this.length = 1;

  // Find length of limb in base
  for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base)
    limbLen++;
  limbLen--;
  limbPow = (limbPow / base) | 0;

  var total = number.length - start;
  var mod = total % limbLen;
  var end = Math.min(total, total - mod) + start;

  var word = 0;
  for (var i = start; i < end; i += limbLen) {
    word = parseBase(number, i, i + limbLen, base);

    this.imuln(limbPow);
    if (this.words[0] + word < 0x4000000)
      this.words[0] += word;
    else
      this._iaddn(word);
  }

  if (mod !== 0) {
    var pow = 1;
    var word = parseBase(number, i, number.length, base);

    for (var i = 0; i < mod; i++)
      pow *= base;
    this.imuln(pow);
    if (this.words[0] + word < 0x4000000)
      this.words[0] += word;
    else
      this._iaddn(word);
  }
};

BN.prototype.copy = function copy(dest) {
  dest.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    dest.words[i] = this.words[i];
  dest.length = this.length;
  dest.sign = this.sign;
  dest.red = this.red;
};

BN.prototype.clone = function clone() {
  var r = new BN(null);
  this.copy(r);
  return r;
};

// Remove leading `0` from `this`
BN.prototype.strip = function strip() {
  while (this.length > 1 && this.words[this.length - 1] === 0)
    this.length--;
  return this._normSign();
};

BN.prototype._normSign = function _normSign() {
  // -0 = 0
  if (this.length === 1 && this.words[0] === 0)
    this.sign = false;
  return this;
};

BN.prototype.inspect = function inspect() {
  return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
};

/*

var zeros = [];
var groupSizes = [];
var groupBases = [];

var s = '';
var i = -1;
while (++i < BN.wordSize) {
  zeros[i] = s;
  s += '0';
}
groupSizes[0] = 0;
groupSizes[1] = 0;
groupBases[0] = 0;
groupBases[1] = 0;
var base = 2 - 1;
while (++base < 36 + 1) {
  var groupSize = 0;
  var groupBase = 1;
  while (groupBase < (1 << BN.wordSize) / base) {
    groupBase *= base;
    groupSize += 1;
  }
  groupSizes[base] = groupSize;
  groupBases[base] = groupBase;
}

*/

var zeros = [
  '',
  '0',
  '00',
  '000',
  '0000',
  '00000',
  '000000',
  '0000000',
  '00000000',
  '000000000',
  '0000000000',
  '00000000000',
  '000000000000',
  '0000000000000',
  '00000000000000',
  '000000000000000',
  '0000000000000000',
  '00000000000000000',
  '000000000000000000',
  '0000000000000000000',
  '00000000000000000000',
  '000000000000000000000',
  '0000000000000000000000',
  '00000000000000000000000',
  '000000000000000000000000',
  '0000000000000000000000000'
];

var groupSizes = [
  0, 0,
  25, 16, 12, 11, 10, 9, 8,
  8, 7, 7, 7, 7, 6, 6,
  6, 6, 6, 6, 6, 5, 5,
  5, 5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5, 5
];

var groupBases = [
  0, 0,
  33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
  43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
  16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
  6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
  24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
];

BN.prototype.toString = function toString(base, padding) {
  base = base || 10;
  if (base === 16 || base === 'hex') {
    var out = '';
    var off = 0;
    var padding = padding | 0 || 1;
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var w = this.words[i];
      var word = (((w << off) | carry) & 0xffffff).toString(16);
      carry = (w >>> (24 - off)) & 0xffffff;
      if (carry !== 0 || i !== this.length - 1)
        out = zeros[6 - word.length] + word + out;
      else
        out = word + out;
      off += 2;
      if (off >= 26) {
        off -= 26;
        i--;
      }
    }
    if (carry !== 0)
      out = carry.toString(16) + out;
    while (out.length % padding !== 0)
      out = '0' + out;
    if (this.sign)
      out = '-' + out;
    return out;
  } else if (base === (base | 0) && base >= 2 && base <= 36) {
    // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
    var groupSize = groupSizes[base];
    // var groupBase = Math.pow(base, groupSize);
    var groupBase = groupBases[base];
    var out = '';
    var c = this.clone();
    c.sign = false;
    while (c.cmpn(0) !== 0) {
      var r = c.modn(groupBase).toString(base);
      c = c.idivn(groupBase);

      if (c.cmpn(0) !== 0)
        out = zeros[groupSize - r.length] + r + out;
      else
        out = r + out;
    }
    if (this.cmpn(0) === 0)
      out = '0' + out;
    if (this.sign)
      out = '-' + out;
    return out;
  } else {
    assert(false, 'Base should be between 2 and 36');
  }
};

BN.prototype.toJSON = function toJSON() {
  return this.toString(16);
};

BN.prototype.toArray = function toArray(endian) {
  this.strip();
  var res = new Array(this.byteLength());
  res[0] = 0;

  var q = this.clone();
  if (endian !== 'le') {
    // Assume big-endian
    for (var i = 0; q.cmpn(0) !== 0; i++) {
      var b = q.andln(0xff);
      q.ishrn(8);

      res[res.length - i - 1] = b;
    }
  } else {
    // Assume little-endian
    for (var i = 0; q.cmpn(0) !== 0; i++) {
      var b = q.andln(0xff);
      q.ishrn(8);

      res[i] = b;
    }
  }

  return res;
};

if (Math.clz32) {
  BN.prototype._countBits = function _countBits(w) {
    return 32 - Math.clz32(w);
  };
} else {
  BN.prototype._countBits = function _countBits(w) {
    var t = w;
    var r = 0;
    if (t >= 0x1000) {
      r += 13;
      t >>>= 13;
    }
    if (t >= 0x40) {
      r += 7;
      t >>>= 7;
    }
    if (t >= 0x8) {
      r += 4;
      t >>>= 4;
    }
    if (t >= 0x02) {
      r += 2;
      t >>>= 2;
    }
    return r + t;
  };
}

BN.prototype._zeroBits = function _zeroBits(w) {
  // Short-cut
  if (w === 0)
    return 26;

  var t = w;
  var r = 0;
  if ((t & 0x1fff) === 0) {
    r += 13;
    t >>>= 13;
  }
  if ((t & 0x7f) === 0) {
    r += 7;
    t >>>= 7;
  }
  if ((t & 0xf) === 0) {
    r += 4;
    t >>>= 4;
  }
  if ((t & 0x3) === 0) {
    r += 2;
    t >>>= 2;
  }
  if ((t & 0x1) === 0)
    r++;
  return r;
};

// Return number of used bits in a BN
BN.prototype.bitLength = function bitLength() {
  var hi = 0;
  var w = this.words[this.length - 1];
  var hi = this._countBits(w);
  return (this.length - 1) * 26 + hi;
};

// Number of trailing zero bits
BN.prototype.zeroBits = function zeroBits() {
  if (this.cmpn(0) === 0)
    return 0;

  var r = 0;
  for (var i = 0; i < this.length; i++) {
    var b = this._zeroBits(this.words[i]);
    r += b;
    if (b !== 26)
      break;
  }
  return r;
};

BN.prototype.byteLength = function byteLength() {
  return Math.ceil(this.bitLength() / 8);
};

// Return negative clone of `this`
BN.prototype.neg = function neg() {
  if (this.cmpn(0) === 0)
    return this.clone();

  var r = this.clone();
  r.sign = !this.sign;
  return r;
};


// Or `num` with `this` in-place
BN.prototype.ior = function ior(num) {
  this.sign = this.sign || num.sign;

  while (this.length < num.length)
    this.words[this.length++] = 0;

  for (var i = 0; i < num.length; i++)
    this.words[i] = this.words[i] | num.words[i];

  return this.strip();
};


// Or `num` with `this`
BN.prototype.or = function or(num) {
  if (this.length > num.length)
    return this.clone().ior(num);
  else
    return num.clone().ior(this);
};


// And `num` with `this` in-place
BN.prototype.iand = function iand(num) {
  this.sign = this.sign && num.sign;

  // b = min-length(num, this)
  var b;
  if (this.length > num.length)
    b = num;
  else
    b = this;

  for (var i = 0; i < b.length; i++)
    this.words[i] = this.words[i] & num.words[i];

  this.length = b.length;

  return this.strip();
};


// And `num` with `this`
BN.prototype.and = function and(num) {
  if (this.length > num.length)
    return this.clone().iand(num);
  else
    return num.clone().iand(this);
};


// Xor `num` with `this` in-place
BN.prototype.ixor = function ixor(num) {
  this.sign = this.sign || num.sign;

  // a.length > b.length
  var a;
  var b;
  if (this.length > num.length) {
    a = this;
    b = num;
  } else {
    a = num;
    b = this;
  }

  for (var i = 0; i < b.length; i++)
    this.words[i] = a.words[i] ^ b.words[i];

  if (this !== a)
    for (; i < a.length; i++)
      this.words[i] = a.words[i];

  this.length = a.length;

  return this.strip();
};


// Xor `num` with `this`
BN.prototype.xor = function xor(num) {
  if (this.length > num.length)
    return this.clone().ixor(num);
  else
    return num.clone().ixor(this);
};


// Set `bit` of `this`
BN.prototype.setn = function setn(bit, val) {
  assert(typeof bit === 'number' && bit >= 0);

  var off = (bit / 26) | 0;
  var wbit = bit % 26;

  while (this.length <= off)
    this.words[this.length++] = 0;

  if (val)
    this.words[off] = this.words[off] | (1 << wbit);
  else
    this.words[off] = this.words[off] & ~(1 << wbit);

  return this.strip();
};


// Add `num` to `this` in-place
BN.prototype.iadd = function iadd(num) {
  // negative + positive
  if (this.sign && !num.sign) {
    this.sign = false;
    var r = this.isub(num);
    this.sign = !this.sign;
    return this._normSign();

  // positive + negative
  } else if (!this.sign && num.sign) {
    num.sign = false;
    var r = this.isub(num);
    num.sign = true;
    return r._normSign();
  }

  // a.length > b.length
  var a;
  var b;
  if (this.length > num.length) {
    a = this;
    b = num;
  } else {
    a = num;
    b = this;
  }

  var carry = 0;
  for (var i = 0; i < b.length; i++) {
    var r = a.words[i] + b.words[i] + carry;
    this.words[i] = r & 0x3ffffff;
    carry = r >>> 26;
  }
  for (; carry !== 0 && i < a.length; i++) {
    var r = a.words[i] + carry;
    this.words[i] = r & 0x3ffffff;
    carry = r >>> 26;
  }

  this.length = a.length;
  if (carry !== 0) {
    this.words[this.length] = carry;
    this.length++;
  // Copy the rest of the words
  } else if (a !== this) {
    for (; i < a.length; i++)
      this.words[i] = a.words[i];
  }

  return this;
};

// Add `num` to `this`
BN.prototype.add = function add(num) {
  if (num.sign && !this.sign) {
    num.sign = false;
    var res = this.sub(num);
    num.sign = true;
    return res;
  } else if (!num.sign && this.sign) {
    this.sign = false;
    var res = num.sub(this);
    this.sign = true;
    return res;
  }

  if (this.length > num.length)
    return this.clone().iadd(num);
  else
    return num.clone().iadd(this);
};

// Subtract `num` from `this` in-place
BN.prototype.isub = function isub(num) {
  // this - (-num) = this + num
  if (num.sign) {
    num.sign = false;
    var r = this.iadd(num);
    num.sign = true;
    return r._normSign();

  // -this - num = -(this + num)
  } else if (this.sign) {
    this.sign = false;
    this.iadd(num);
    this.sign = true;
    return this._normSign();
  }

  // At this point both numbers are positive
  var cmp = this.cmp(num);

  // Optimization - zeroify
  if (cmp === 0) {
    this.sign = false;
    this.length = 1;
    this.words[0] = 0;
    return this;
  }

  // a > b
  var a;
  var b;
  if (cmp > 0) {
    a = this;
    b = num;
  } else {
    a = num;
    b = this;
  }

  var carry = 0;
  for (var i = 0; i < b.length; i++) {
    var r = a.words[i] - b.words[i] + carry;
    carry = r >> 26;
    this.words[i] = r & 0x3ffffff;
  }
  for (; carry !== 0 && i < a.length; i++) {
    var r = a.words[i] + carry;
    carry = r >> 26;
    this.words[i] = r & 0x3ffffff;
  }

  // Copy rest of the words
  if (carry === 0 && i < a.length && a !== this)
    for (; i < a.length; i++)
      this.words[i] = a.words[i];
  this.length = Math.max(this.length, i);

  if (a !== this)
    this.sign = true;

  return this.strip();
};

// Subtract `num` from `this`
BN.prototype.sub = function sub(num) {
  return this.clone().isub(num);
};

/*
// NOTE: This could be potentionally used to generate loop-less multiplications
function _genCombMulTo(alen, blen) {
  var len = alen + blen - 1;
  var src = [
    'var a = this.words, b = num.words, o = out.words, c = 0, w, ' +
        'mask = 0x3ffffff, shift = 0x4000000;',
    'out.length = ' + len + ';'
  ];
  for (var k = 0; k < len; k++) {
    var minJ = Math.max(0, k - alen + 1);
    var maxJ = Math.min(k, blen - 1);

    for (var j = minJ; j <= maxJ; j++) {
      var i = k - j;
      var mul = 'a[' + i + '] * b[' + j + ']';

      if (j === minJ) {
        src.push('w = ' + mul + ' + c;');
        src.push('c = (w / shift) | 0;');
      } else {
        src.push('w += ' + mul + ';');
        src.push('c += (w / shift) | 0;');
      }
      src.push('w &= mask;');
    }
    src.push('o[' + k + '] = w;');
  }
  src.push('if (c !== 0) {',
           '  o[' + k + '] = c;',
           '  out.length++;',
           '}',
           'return out;');

  return src.join('\n');
}
*/

BN.prototype._smallMulTo = function _smallMulTo(num, out) {
  out.sign = num.sign !== this.sign;
  out.length = this.length + num.length;

  var carry = 0;
  for (var k = 0; k < out.length - 1; k++) {
    // Sum all words with the same `i + j = k` and accumulate `ncarry`,
    // note that ncarry could be >= 0x3ffffff
    var ncarry = carry >>> 26;
    var rword = carry & 0x3ffffff;
    var maxJ = Math.min(k, num.length - 1);
    for (var j = Math.max(0, k - this.length + 1); j <= maxJ; j++) {
      var i = k - j;
      var a = this.words[i] | 0;
      var b = num.words[j] | 0;
      var r = a * b;

      var lo = r & 0x3ffffff;
      ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
      lo = (lo + rword) | 0;
      rword = lo & 0x3ffffff;
      ncarry = (ncarry + (lo >>> 26)) | 0;
    }
    out.words[k] = rword;
    carry = ncarry;
  }
  if (carry !== 0) {
    out.words[k] = carry;
  } else {
    out.length--;
  }

  return out.strip();
};

BN.prototype._bigMulTo = function _bigMulTo(num, out) {
  out.sign = num.sign !== this.sign;
  out.length = this.length + num.length;

  var carry = 0;
  var hncarry = 0;
  for (var k = 0; k < out.length - 1; k++) {
    // Sum all words with the same `i + j = k` and accumulate `ncarry`,
    // note that ncarry could be >= 0x3ffffff
    var ncarry = hncarry;
    hncarry = 0;
    var rword = carry & 0x3ffffff;
    var maxJ = Math.min(k, num.length - 1);
    for (var j = Math.max(0, k - this.length + 1); j <= maxJ; j++) {
      var i = k - j;
      var a = this.words[i] | 0;
      var b = num.words[j] | 0;
      var r = a * b;

      var lo = r & 0x3ffffff;
      ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
      lo = (lo + rword) | 0;
      rword = lo & 0x3ffffff;
      ncarry = (ncarry + (lo >>> 26)) | 0;

      hncarry += ncarry >>> 26;
      ncarry &= 0x3ffffff;
    }
    out.words[k] = rword;
    carry = ncarry;
    ncarry = hncarry;
  }
  if (carry !== 0) {
    out.words[k] = carry;
  } else {
    out.length--;
  }

  return out.strip();
};

BN.prototype.mulTo = function mulTo(num, out) {
  var res;
  if (this.length + num.length < 63)
    res = this._smallMulTo(num, out);
  else
    res = this._bigMulTo(num, out);
  return res;
};

// Multiply `this` by `num`
BN.prototype.mul = function mul(num) {
  var out = new BN(null);
  out.words = new Array(this.length + num.length);
  return this.mulTo(num, out);
};

// In-place Multiplication
BN.prototype.imul = function imul(num) {
  if (this.cmpn(0) === 0 || num.cmpn(0) === 0) {
    this.words[0] = 0;
    this.length = 1;
    return this;
  }

  var tlen = this.length;
  var nlen = num.length;

  this.sign = num.sign !== this.sign;
  this.length = this.length + num.length;
  this.words[this.length - 1] = 0;

  for (var k = this.length - 2; k >= 0; k--) {
    // Sum all words with the same `i + j = k` and accumulate `carry`,
    // note that carry could be >= 0x3ffffff
    var carry = 0;
    var rword = 0;
    var maxJ = Math.min(k, nlen - 1);
    for (var j = Math.max(0, k - tlen + 1); j <= maxJ; j++) {
      var i = k - j;
      var a = this.words[i];
      var b = num.words[j];
      var r = a * b;

      var lo = r & 0x3ffffff;
      carry += (r / 0x4000000) | 0;
      lo += rword;
      rword = lo & 0x3ffffff;
      carry += lo >>> 26;
    }
    this.words[k] = rword;
    this.words[k + 1] += carry;
    carry = 0;
  }

  // Propagate overflows
  var carry = 0;
  for (var i = 1; i < this.length; i++) {
    var w = this.words[i] + carry;
    this.words[i] = w & 0x3ffffff;
    carry = w >>> 26;
  }

  return this.strip();
};

BN.prototype.imuln = function imuln(num) {
  assert(typeof num === 'number');

  // Carry
  var carry = 0;
  for (var i = 0; i < this.length; i++) {
    var w = this.words[i] * num;
    var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
    carry >>= 26;
    carry += (w / 0x4000000) | 0;
    // NOTE: lo is 27bit maximum
    carry += lo >>> 26;
    this.words[i] = lo & 0x3ffffff;
  }

  if (carry !== 0) {
    this.words[i] = carry;
    this.length++;
  }

  return this;
};

BN.prototype.muln = function muln(num) {
  return this.clone().imuln(num);
};

// `this` * `this`
BN.prototype.sqr = function sqr() {
  return this.mul(this);
};

// `this` * `this` in-place
BN.prototype.isqr = function isqr() {
  return this.mul(this);
};

// Shift-left in-place
BN.prototype.ishln = function ishln(bits) {
  assert(typeof bits === 'number' && bits >= 0);
  var r = bits % 26;
  var s = (bits - r) / 26;
  var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);

  if (r !== 0) {
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var newCarry = this.words[i] & carryMask;
      var c = (this.words[i] - newCarry) << r;
      this.words[i] = c | carry;
      carry = newCarry >>> (26 - r);
    }
    if (carry) {
      this.words[i] = carry;
      this.length++;
    }
  }

  if (s !== 0) {
    for (var i = this.length - 1; i >= 0; i--)
      this.words[i + s] = this.words[i];
    for (var i = 0; i < s; i++)
      this.words[i] = 0;
    this.length += s;
  }

  return this.strip();
};

// Shift-right in-place
// NOTE: `hint` is a lowest bit before trailing zeroes
// NOTE: if `extended` is present - it will be filled with destroyed bits
BN.prototype.ishrn = function ishrn(bits, hint, extended) {
  assert(typeof bits === 'number' && bits >= 0);
  var h;
  if (hint)
    h = (hint - (hint % 26)) / 26;
  else
    h = 0;

  var r = bits % 26;
  var s = Math.min((bits - r) / 26, this.length);
  var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
  var maskedWords = extended;

  h -= s;
  h = Math.max(0, h);

  // Extended mode, copy masked part
  if (maskedWords) {
    for (var i = 0; i < s; i++)
      maskedWords.words[i] = this.words[i];
    maskedWords.length = s;
  }

  if (s === 0) {
    // No-op, we should not move anything at all
  } else if (this.length > s) {
    this.length -= s;
    for (var i = 0; i < this.length; i++)
      this.words[i] = this.words[i + s];
  } else {
    this.words[0] = 0;
    this.length = 1;
  }

  var carry = 0;
  for (var i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
    var word = this.words[i];
    this.words[i] = (carry << (26 - r)) | (word >>> r);
    carry = word & mask;
  }

  // Push carried bits as a mask
  if (maskedWords && carry !== 0)
    maskedWords.words[maskedWords.length++] = carry;

  if (this.length === 0) {
    this.words[0] = 0;
    this.length = 1;
  }

  this.strip();

  return this;
};

// Shift-left
BN.prototype.shln = function shln(bits) {
  return this.clone().ishln(bits);
};

// Shift-right
BN.prototype.shrn = function shrn(bits) {
  return this.clone().ishrn(bits);
};

// Test if n bit is set
BN.prototype.testn = function testn(bit) {
  assert(typeof bit === 'number' && bit >= 0);
  var r = bit % 26;
  var s = (bit - r) / 26;
  var q = 1 << r;

  // Fast case: bit is much higher than all existing words
  if (this.length <= s) {
    return false;
  }

  // Check bit and return
  var w = this.words[s];

  return !!(w & q);
};

// Return only lowers bits of number (in-place)
BN.prototype.imaskn = function imaskn(bits) {
  assert(typeof bits === 'number' && bits >= 0);
  var r = bits % 26;
  var s = (bits - r) / 26;

  assert(!this.sign, 'imaskn works only with positive numbers');

  if (r !== 0)
    s++;
  this.length = Math.min(s, this.length);

  if (r !== 0) {
    var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
    this.words[this.length - 1] &= mask;
  }

  return this.strip();
};

// Return only lowers bits of number
BN.prototype.maskn = function maskn(bits) {
  return this.clone().imaskn(bits);
};

// Add plain number `num` to `this`
BN.prototype.iaddn = function iaddn(num) {
  assert(typeof num === 'number');
  if (num < 0)
    return this.isubn(-num);

  // Possible sign change
  if (this.sign) {
    if (this.length === 1 && this.words[0] < num) {
      this.words[0] = num - this.words[0];
      this.sign = false;
      return this;
    }

    this.sign = false;
    this.isubn(num);
    this.sign = true;
    return this;
  }

  // Add without checks
  return this._iaddn(num);
};

BN.prototype._iaddn = function _iaddn(num) {
  this.words[0] += num;

  // Carry
  for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
    this.words[i] -= 0x4000000;
    if (i === this.length - 1)
      this.words[i + 1] = 1;
    else
      this.words[i + 1]++;
  }
  this.length = Math.max(this.length, i + 1);

  return this;
};

// Subtract plain number `num` from `this`
BN.prototype.isubn = function isubn(num) {
  assert(typeof num === 'number');
  if (num < 0)
    return this.iaddn(-num);

  if (this.sign) {
    this.sign = false;
    this.iaddn(num);
    this.sign = true;
    return this;
  }

  this.words[0] -= num;

  // Carry
  for (var i = 0; i < this.length && this.words[i] < 0; i++) {
    this.words[i] += 0x4000000;
    this.words[i + 1] -= 1;
  }

  return this.strip();
};

BN.prototype.addn = function addn(num) {
  return this.clone().iaddn(num);
};

BN.prototype.subn = function subn(num) {
  return this.clone().isubn(num);
};

BN.prototype.iabs = function iabs() {
  this.sign = false;

  return this;
};

BN.prototype.abs = function abs() {
  return this.clone().iabs();
};

BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
  // Bigger storage is needed
  var len = num.length + shift;
  var i;
  if (this.words.length < len) {
    var t = new Array(len);
    for (var i = 0; i < this.length; i++)
      t[i] = this.words[i];
    this.words = t;
  } else {
    i = this.length;
  }

  // Zeroify rest
  this.length = Math.max(this.length, len);
  for (; i < this.length; i++)
    this.words[i] = 0;

  var carry = 0;
  for (var i = 0; i < num.length; i++) {
    var w = this.words[i + shift] + carry;
    var right = num.words[i] * mul;
    w -= right & 0x3ffffff;
    carry = (w >> 26) - ((right / 0x4000000) | 0);
    this.words[i + shift] = w & 0x3ffffff;
  }
  for (; i < this.length - shift; i++) {
    var w = this.words[i + shift] + carry;
    carry = w >> 26;
    this.words[i + shift] = w & 0x3ffffff;
  }

  if (carry === 0)
    return this.strip();

  // Subtraction overflow
  assert(carry === -1);
  carry = 0;
  for (var i = 0; i < this.length; i++) {
    var w = -this.words[i] + carry;
    carry = w >> 26;
    this.words[i] = w & 0x3ffffff;
  }
  this.sign = true;

  return this.strip();
};

BN.prototype._wordDiv = function _wordDiv(num, mode) {
  var shift = this.length - num.length;

  var a = this.clone();
  var b = num;

  // Normalize
  var bhi = b.words[b.length - 1];
  var bhiBits = this._countBits(bhi);
  shift = 26 - bhiBits;
  if (shift !== 0) {
    b = b.shln(shift);
    a.ishln(shift);
    bhi = b.words[b.length - 1];
  }

  // Initialize quotient
  var m = a.length - b.length;
  var q;

  if (mode !== 'mod') {
    q = new BN(null);
    q.length = m + 1;
    q.words = new Array(q.length);
    for (var i = 0; i < q.length; i++)
      q.words[i] = 0;
  }

  var diff = a.clone()._ishlnsubmul(b, 1, m);
  if (!diff.sign) {
    a = diff;
    if (q)
      q.words[m] = 1;
  }

  for (var j = m - 1; j >= 0; j--) {
    var qj = a.words[b.length + j] * 0x4000000 + a.words[b.length + j - 1];

    // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
    // (0x7ffffff)
    qj = Math.min((qj / bhi) | 0, 0x3ffffff);

    a._ishlnsubmul(b, qj, j);
    while (a.sign) {
      qj--;
      a.sign = false;
      a._ishlnsubmul(b, 1, j);
      if (a.cmpn(0) !== 0)
        a.sign = !a.sign;
    }
    if (q)
      q.words[j] = qj;
  }
  if (q)
    q.strip();
  a.strip();

  // Denormalize
  if (mode !== 'div' && shift !== 0)
    a.ishrn(shift);
  return { div: q ? q : null, mod: a };
};

BN.prototype.divmod = function divmod(num, mode) {
  assert(num.cmpn(0) !== 0);

  if (this.sign && !num.sign) {
    var res = this.neg().divmod(num, mode);
    var div;
    var mod;
    if (mode !== 'mod')
      div = res.div.neg();
    if (mode !== 'div')
      mod = res.mod.cmpn(0) === 0 ? res.mod : num.sub(res.mod);
    return {
      div: div,
      mod: mod
    };
  } else if (!this.sign && num.sign) {
    var res = this.divmod(num.neg(), mode);
    var div;
    if (mode !== 'mod')
      div = res.div.neg();
    return { div: div, mod: res.mod };
  } else if (this.sign && num.sign) {
    return this.neg().divmod(num.neg(), mode);
  }

  // Both numbers are positive at this point

  // Strip both numbers to approximate shift value
  if (num.length > this.length || this.cmp(num) < 0)
    return { div: new BN(0), mod: this };

  // Very short reduction
  if (num.length === 1) {
    if (mode === 'div')
      return { div: this.divn(num.words[0]), mod: null };
    else if (mode === 'mod')
      return { div: null, mod: new BN(this.modn(num.words[0])) };
    return {
      div: this.divn(num.words[0]),
      mod: new BN(this.modn(num.words[0]))
    };
  }

  return this._wordDiv(num, mode);
};

// Find `this` / `num`
BN.prototype.div = function div(num) {
  return this.divmod(num, 'div').div;
};

// Find `this` % `num`
BN.prototype.mod = function mod(num) {
  return this.divmod(num, 'mod').mod;
};

// Find Round(`this` / `num`)
BN.prototype.divRound = function divRound(num) {
  var dm = this.divmod(num);

  // Fast case - exact division
  if (dm.mod.cmpn(0) === 0)
    return dm.div;

  var mod = dm.div.sign ? dm.mod.isub(num) : dm.mod;

  var half = num.shrn(1);
  var r2 = num.andln(1);
  var cmp = mod.cmp(half);

  // Round down
  if (cmp < 0 || r2 === 1 && cmp === 0)
    return dm.div;

  // Round up
  return dm.div.sign ? dm.div.isubn(1) : dm.div.iaddn(1);
};

BN.prototype.modn = function modn(num) {
  assert(num <= 0x3ffffff);
  var p = (1 << 26) % num;

  var acc = 0;
  for (var i = this.length - 1; i >= 0; i--)
    acc = (p * acc + this.words[i]) % num;

  return acc;
};

// In-place division by number
BN.prototype.idivn = function idivn(num) {
  assert(num <= 0x3ffffff);

  var carry = 0;
  for (var i = this.length - 1; i >= 0; i--) {
    var w = this.words[i] + carry * 0x4000000;
    this.words[i] = (w / num) | 0;
    carry = w % num;
  }

  return this.strip();
};

BN.prototype.divn = function divn(num) {
  return this.clone().idivn(num);
};

BN.prototype.egcd = function egcd(p) {
  assert(!p.sign);
  assert(p.cmpn(0) !== 0);

  var x = this;
  var y = p.clone();

  if (x.sign)
    x = x.mod(p);
  else
    x = x.clone();

  // A * x + B * y = x
  var A = new BN(1);
  var B = new BN(0);

  // C * x + D * y = y
  var C = new BN(0);
  var D = new BN(1);

  var g = 0;

  while (x.isEven() && y.isEven()) {
    x.ishrn(1);
    y.ishrn(1);
    ++g;
  }

  var yp = y.clone();
  var xp = x.clone();

  while (x.cmpn(0) !== 0) {
    while (x.isEven()) {
      x.ishrn(1);
      if (A.isEven() && B.isEven()) {
        A.ishrn(1);
        B.ishrn(1);
      } else {
        A.iadd(yp).ishrn(1);
        B.isub(xp).ishrn(1);
      }
    }

    while (y.isEven()) {
      y.ishrn(1);
      if (C.isEven() && D.isEven()) {
        C.ishrn(1);
        D.ishrn(1);
      } else {
        C.iadd(yp).ishrn(1);
        D.isub(xp).ishrn(1);
      }
    }

    if (x.cmp(y) >= 0) {
      x.isub(y);
      A.isub(C);
      B.isub(D);
    } else {
      y.isub(x);
      C.isub(A);
      D.isub(B);
    }
  }

  return {
    a: C,
    b: D,
    gcd: y.ishln(g)
  };
};

// This is reduced incarnation of the binary EEA
// above, designated to invert members of the
// _prime_ fields F(p) at a maximal speed
BN.prototype._invmp = function _invmp(p) {
  assert(!p.sign);
  assert(p.cmpn(0) !== 0);

  var a = this;
  var b = p.clone();

  if (a.sign)
    a = a.mod(p);
  else
    a = a.clone();

  var x1 = new BN(1);
  var x2 = new BN(0);

  var delta = b.clone();

  while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
    while (a.isEven()) {
      a.ishrn(1);
      if (x1.isEven())
        x1.ishrn(1);
      else
        x1.iadd(delta).ishrn(1);
    }
    while (b.isEven()) {
      b.ishrn(1);
      if (x2.isEven())
        x2.ishrn(1);
      else
        x2.iadd(delta).ishrn(1);
    }
    if (a.cmp(b) >= 0) {
      a.isub(b);
      x1.isub(x2);
    } else {
      b.isub(a);
      x2.isub(x1);
    }
  }
  if (a.cmpn(1) === 0)
    return x1;
  else
    return x2;
};

BN.prototype.gcd = function gcd(num) {
  if (this.cmpn(0) === 0)
    return num.clone();
  if (num.cmpn(0) === 0)
    return this.clone();

  var a = this.clone();
  var b = num.clone();
  a.sign = false;
  b.sign = false;

  // Remove common factor of two
  for (var shift = 0; a.isEven() && b.isEven(); shift++) {
    a.ishrn(1);
    b.ishrn(1);
  }

  do {
    while (a.isEven())
      a.ishrn(1);
    while (b.isEven())
      b.ishrn(1);

    var r = a.cmp(b);
    if (r < 0) {
      // Swap `a` and `b` to make `a` always bigger than `b`
      var t = a;
      a = b;
      b = t;
    } else if (r === 0 || b.cmpn(1) === 0) {
      break;
    }

    a.isub(b);
  } while (true);

  return b.ishln(shift);
};

// Invert number in the field F(num)
BN.prototype.invm = function invm(num) {
  return this.egcd(num).a.mod(num);
};

BN.prototype.isEven = function isEven() {
  return (this.words[0] & 1) === 0;
};

BN.prototype.isOdd = function isOdd() {
  return (this.words[0] & 1) === 1;
};

// And first word and num
BN.prototype.andln = function andln(num) {
  return this.words[0] & num;
};

// Increment at the bit position in-line
BN.prototype.bincn = function bincn(bit) {
  assert(typeof bit === 'number');
  var r = bit % 26;
  var s = (bit - r) / 26;
  var q = 1 << r;

  // Fast case: bit is much higher than all existing words
  if (this.length <= s) {
    for (var i = this.length; i < s + 1; i++)
      this.words[i] = 0;
    this.words[s] |= q;
    this.length = s + 1;
    return this;
  }

  // Add bit and propagate, if needed
  var carry = q;
  for (var i = s; carry !== 0 && i < this.length; i++) {
    var w = this.words[i];
    w += carry;
    carry = w >>> 26;
    w &= 0x3ffffff;
    this.words[i] = w;
  }
  if (carry !== 0) {
    this.words[i] = carry;
    this.length++;
  }
  return this;
};

BN.prototype.cmpn = function cmpn(num) {
  var sign = num < 0;
  if (sign)
    num = -num;

  if (this.sign && !sign)
    return -1;
  else if (!this.sign && sign)
    return 1;

  num &= 0x3ffffff;
  this.strip();

  var res;
  if (this.length > 1) {
    res = 1;
  } else {
    var w = this.words[0];
    res = w === num ? 0 : w < num ? -1 : 1;
  }
  if (this.sign)
    res = -res;
  return res;
};

// Compare two numbers and return:
// 1 - if `this` > `num`
// 0 - if `this` == `num`
// -1 - if `this` < `num`
BN.prototype.cmp = function cmp(num) {
  if (this.sign && !num.sign)
    return -1;
  else if (!this.sign && num.sign)
    return 1;

  var res = this.ucmp(num);
  if (this.sign)
    return -res;
  else
    return res;
};

// Unsigned comparison
BN.prototype.ucmp = function ucmp(num) {
  // At this point both numbers have the same sign
  if (this.length > num.length)
    return 1;
  else if (this.length < num.length)
    return -1;

  var res = 0;
  for (var i = this.length - 1; i >= 0; i--) {
    var a = this.words[i];
    var b = num.words[i];

    if (a === b)
      continue;
    if (a < b)
      res = -1;
    else if (a > b)
      res = 1;
    break;
  }
  return res;
};

//
// A reduce context, could be using montgomery or something better, depending
// on the `m` itself.
//
BN.red = function red(num) {
  return new Red(num);
};

BN.prototype.toRed = function toRed(ctx) {
  assert(!this.red, 'Already a number in reduction context');
  assert(!this.sign, 'red works only with positives');
  return ctx.convertTo(this)._forceRed(ctx);
};

BN.prototype.fromRed = function fromRed() {
  assert(this.red, 'fromRed works only with numbers in reduction context');
  return this.red.convertFrom(this);
};

BN.prototype._forceRed = function _forceRed(ctx) {
  this.red = ctx;
  return this;
};

BN.prototype.forceRed = function forceRed(ctx) {
  assert(!this.red, 'Already a number in reduction context');
  return this._forceRed(ctx);
};

BN.prototype.redAdd = function redAdd(num) {
  assert(this.red, 'redAdd works only with red numbers');
  return this.red.add(this, num);
};

BN.prototype.redIAdd = function redIAdd(num) {
  assert(this.red, 'redIAdd works only with red numbers');
  return this.red.iadd(this, num);
};

BN.prototype.redSub = function redSub(num) {
  assert(this.red, 'redSub works only with red numbers');
  return this.red.sub(this, num);
};

BN.prototype.redISub = function redISub(num) {
  assert(this.red, 'redISub works only with red numbers');
  return this.red.isub(this, num);
};

BN.prototype.redShl = function redShl(num) {
  assert(this.red, 'redShl works only with red numbers');
  return this.red.shl(this, num);
};

BN.prototype.redMul = function redMul(num) {
  assert(this.red, 'redMul works only with red numbers');
  this.red._verify2(this, num);
  return this.red.mul(this, num);
};

BN.prototype.redIMul = function redIMul(num) {
  assert(this.red, 'redMul works only with red numbers');
  this.red._verify2(this, num);
  return this.red.imul(this, num);
};

BN.prototype.redSqr = function redSqr() {
  assert(this.red, 'redSqr works only with red numbers');
  this.red._verify1(this);
  return this.red.sqr(this);
};

BN.prototype.redISqr = function redISqr() {
  assert(this.red, 'redISqr works only with red numbers');
  this.red._verify1(this);
  return this.red.isqr(this);
};

// Square root over p
BN.prototype.redSqrt = function redSqrt() {
  assert(this.red, 'redSqrt works only with red numbers');
  this.red._verify1(this);
  return this.red.sqrt(this);
};

BN.prototype.redInvm = function redInvm() {
  assert(this.red, 'redInvm works only with red numbers');
  this.red._verify1(this);
  return this.red.invm(this);
};

// Return negative clone of `this` % `red modulo`
BN.prototype.redNeg = function redNeg() {
  assert(this.red, 'redNeg works only with red numbers');
  this.red._verify1(this);
  return this.red.neg(this);
};

BN.prototype.redPow = function redPow(num) {
  assert(this.red && !num.red, 'redPow(normalNum)');
  this.red._verify1(this);
  return this.red.pow(this, num);
};

// Prime numbers with efficient reduction
var primes = {
  k256: null,
  p224: null,
  p192: null,
  p25519: null
};

// Pseudo-Mersenne prime
function MPrime(name, p) {
  // P = 2 ^ N - K
  this.name = name;
  this.p = new BN(p, 16);
  this.n = this.p.bitLength();
  this.k = new BN(1).ishln(this.n).isub(this.p);

  this.tmp = this._tmp();
}

MPrime.prototype._tmp = function _tmp() {
  var tmp = new BN(null);
  tmp.words = new Array(Math.ceil(this.n / 13));
  return tmp;
};

MPrime.prototype.ireduce = function ireduce(num) {
  // Assumes that `num` is less than `P^2`
  // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
  var r = num;
  var rlen;

  do {
    this.split(r, this.tmp);
    r = this.imulK(r);
    r = r.iadd(this.tmp);
    rlen = r.bitLength();
  } while (rlen > this.n);

  var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
  if (cmp === 0) {
    r.words[0] = 0;
    r.length = 1;
  } else if (cmp > 0) {
    r.isub(this.p);
  } else {
    r.strip();
  }

  return r;
};

MPrime.prototype.split = function split(input, out) {
  input.ishrn(this.n, 0, out);
};

MPrime.prototype.imulK = function imulK(num) {
  return num.imul(this.k);
};

function K256() {
  MPrime.call(
    this,
    'k256',
    'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
}
inherits(K256, MPrime);

K256.prototype.split = function split(input, output) {
  // 256 = 9 * 26 + 22
  var mask = 0x3fffff;

  var outLen = Math.min(input.length, 9);
  for (var i = 0; i < outLen; i++)
    output.words[i] = input.words[i];
  output.length = outLen;

  if (input.length <= 9) {
    input.words[0] = 0;
    input.length = 1;
    return;
  }

  // Shift by 9 limbs
  var prev = input.words[9];
  output.words[output.length++] = prev & mask;

  for (var i = 10; i < input.length; i++) {
    var next = input.words[i];
    input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22);
    prev = next;
  }
  input.words[i - 10] = prev >>> 22;
  input.length -= 9;
};

K256.prototype.imulK = function imulK(num) {
  // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
  num.words[num.length] = 0;
  num.words[num.length + 1] = 0;
  num.length += 2;

  // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
  var hi;
  var lo = 0;
  for (var i = 0; i < num.length; i++) {
    var w = num.words[i];
    hi = w * 0x40;
    lo += w * 0x3d1;
    hi += (lo / 0x4000000) | 0;
    lo &= 0x3ffffff;

    num.words[i] = lo;

    lo = hi;
  }

  // Fast length reduction
  if (num.words[num.length - 1] === 0) {
    num.length--;
    if (num.words[num.length - 1] === 0)
      num.length--;
  }
  return num;
};

function P224() {
  MPrime.call(
    this,
    'p224',
    'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
}
inherits(P224, MPrime);

function P192() {
  MPrime.call(
    this,
    'p192',
    'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
}
inherits(P192, MPrime);

function P25519() {
  // 2 ^ 255 - 19
  MPrime.call(
    this,
    '25519',
    '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
}
inherits(P25519, MPrime);

P25519.prototype.imulK = function imulK(num) {
  // K = 0x13
  var carry = 0;
  for (var i = 0; i < num.length; i++) {
    var hi = num.words[i] * 0x13 + carry;
    var lo = hi & 0x3ffffff;
    hi >>>= 26;

    num.words[i] = lo;
    carry = hi;
  }
  if (carry !== 0)
    num.words[num.length++] = carry;
  return num;
};

// Exported mostly for testing purposes, use plain name instead
BN._prime = function prime(name) {
  // Cached version of prime
  if (primes[name])
    return primes[name];

  var prime;
  if (name === 'k256')
    prime = new K256();
  else if (name === 'p224')
    prime = new P224();
  else if (name === 'p192')
    prime = new P192();
  else if (name === 'p25519')
    prime = new P25519();
  else
    throw new Error('Unknown prime ' + name);
  primes[name] = prime;

  return prime;
};

//
// Base reduction engine
//
function Red(m) {
  if (typeof m === 'string') {
    var prime = BN._prime(m);
    this.m = prime.p;
    this.prime = prime;
  } else {
    this.m = m;
    this.prime = null;
  }
}

Red.prototype._verify1 = function _verify1(a) {
  assert(!a.sign, 'red works only with positives');
  assert(a.red, 'red works only with red numbers');
};

Red.prototype._verify2 = function _verify2(a, b) {
  assert(!a.sign && !b.sign, 'red works only with positives');
  assert(a.red && a.red === b.red,
         'red works only with red numbers');
};

Red.prototype.imod = function imod(a) {
  if (this.prime)
    return this.prime.ireduce(a)._forceRed(this);
  return a.mod(this.m)._forceRed(this);
};

Red.prototype.neg = function neg(a) {
  var r = a.clone();
  r.sign = !r.sign;
  return r.iadd(this.m)._forceRed(this);
};

Red.prototype.add = function add(a, b) {
  this._verify2(a, b);

  var res = a.add(b);
  if (res.cmp(this.m) >= 0)
    res.isub(this.m);
  return res._forceRed(this);
};

Red.prototype.iadd = function iadd(a, b) {
  this._verify2(a, b);

  var res = a.iadd(b);
  if (res.cmp(this.m) >= 0)
    res.isub(this.m);
  return res;
};

Red.prototype.sub = function sub(a, b) {
  this._verify2(a, b);

  var res = a.sub(b);
  if (res.cmpn(0) < 0)
    res.iadd(this.m);
  return res._forceRed(this);
};

Red.prototype.isub = function isub(a, b) {
  this._verify2(a, b);

  var res = a.isub(b);
  if (res.cmpn(0) < 0)
    res.iadd(this.m);
  return res;
};

Red.prototype.shl = function shl(a, num) {
  this._verify1(a);
  return this.imod(a.shln(num));
};

Red.prototype.imul = function imul(a, b) {
  this._verify2(a, b);
  return this.imod(a.imul(b));
};

Red.prototype.mul = function mul(a, b) {
  this._verify2(a, b);
  return this.imod(a.mul(b));
};

Red.prototype.isqr = function isqr(a) {
  return this.imul(a, a);
};

Red.prototype.sqr = function sqr(a) {
  return this.mul(a, a);
};

Red.prototype.sqrt = function sqrt(a) {
  if (a.cmpn(0) === 0)
    return a.clone();

  var mod3 = this.m.andln(3);
  assert(mod3 % 2 === 1);

  // Fast case
  if (mod3 === 3) {
    var pow = this.m.add(new BN(1)).ishrn(2);
    var r = this.pow(a, pow);
    return r;
  }

  // Tonelli-Shanks algorithm (Totally unoptimized and slow)
  //
  // Find Q and S, that Q * 2 ^ S = (P - 1)
  var q = this.m.subn(1);
  var s = 0;
  while (q.cmpn(0) !== 0 && q.andln(1) === 0) {
    s++;
    q.ishrn(1);
  }
  assert(q.cmpn(0) !== 0);

  var one = new BN(1).toRed(this);
  var nOne = one.redNeg();

  // Find quadratic non-residue
  // NOTE: Max is such because of generalized Riemann hypothesis.
  var lpow = this.m.subn(1).ishrn(1);
  var z = this.m.bitLength();
  z = new BN(2 * z * z).toRed(this);
  while (this.pow(z, lpow).cmp(nOne) !== 0)
    z.redIAdd(nOne);

  var c = this.pow(z, q);
  var r = this.pow(a, q.addn(1).ishrn(1));
  var t = this.pow(a, q);
  var m = s;
  while (t.cmp(one) !== 0) {
    var tmp = t;
    for (var i = 0; tmp.cmp(one) !== 0; i++)
      tmp = tmp.redSqr();
    assert(i < m);
    var b = this.pow(c, new BN(1).ishln(m - i - 1));

    r = r.redMul(b);
    c = b.redSqr();
    t = t.redMul(c);
    m = i;
  }

  return r;
};

Red.prototype.invm = function invm(a) {
  var inv = a._invmp(this.m);
  if (inv.sign) {
    inv.sign = false;
    return this.imod(inv).redNeg();
  } else {
    return this.imod(inv);
  }
};

Red.prototype.pow = function pow(a, num) {
  var w = [];

  if (num.cmpn(0) === 0)
    return new BN(1);

  var q = num.clone();

  while (q.cmpn(0) !== 0) {
    w.push(q.andln(1));
    q.ishrn(1);
  }

  // Skip leading zeroes
  var res = a;
  for (var i = 0; i < w.length; i++, res = this.sqr(res))
    if (w[i] !== 0)
      break;

  if (++i < w.length) {
    for (var q = this.sqr(res); i < w.length; i++, q = this.sqr(q)) {
      if (w[i] === 0)
        continue;
      res = this.mul(res, q);
    }
  }

  return res;
};

Red.prototype.convertTo = function convertTo(num) {
  var r = num.mod(this.m);
  if (r === num)
    return r.clone();
  else
    return r;
};

Red.prototype.convertFrom = function convertFrom(num) {
  var res = num.clone();
  res.red = null;
  return res;
};

//
// Montgomery method engine
//

BN.mont = function mont(num) {
  return new Mont(num);
};

function Mont(m) {
  Red.call(this, m);

  this.shift = this.m.bitLength();
  if (this.shift % 26 !== 0)
    this.shift += 26 - (this.shift % 26);
  this.r = new BN(1).ishln(this.shift);
  this.r2 = this.imod(this.r.sqr());
  this.rinv = this.r._invmp(this.m);

  this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
  this.minv.sign = true;
  this.minv = this.minv.mod(this.r);
}
inherits(Mont, Red);

Mont.prototype.convertTo = function convertTo(num) {
  return this.imod(num.shln(this.shift));
};

Mont.prototype.convertFrom = function convertFrom(num) {
  var r = this.imod(num.mul(this.rinv));
  r.red = null;
  return r;
};

Mont.prototype.imul = function imul(a, b) {
  if (a.cmpn(0) === 0 || b.cmpn(0) === 0) {
    a.words[0] = 0;
    a.length = 1;
    return a;
  }

  var t = a.imul(b);
  var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
  var u = t.isub(c).ishrn(this.shift);
  var res = u;
  if (u.cmp(this.m) >= 0)
    res = u.isub(this.m);
  else if (u.cmpn(0) < 0)
    res = u.iadd(this.m);

  return res._forceRed(this);
};

Mont.prototype.mul = function mul(a, b) {
  if (a.cmpn(0) === 0 || b.cmpn(0) === 0)
    return new BN(0)._forceRed(this);

  var t = a.mul(b);
  var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
  var u = t.isub(c).ishrn(this.shift);
  var res = u;
  if (u.cmp(this.m) >= 0)
    res = u.isub(this.m);
  else if (u.cmpn(0) < 0)
    res = u.iadd(this.m);

  return res._forceRed(this);
};

Mont.prototype.invm = function invm(a) {
  // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
  var res = this.imod(a._invmp(this.m).mul(this.r2));
  return res._forceRed(this);
};

})(typeof module === 'undefined' || module, this);

},{}],34:[function(require,module,exports){
var constants = require('../constants');

exports.tagClass = {
  0: 'universal',
  1: 'application',
  2: 'context',
  3: 'private'
};
exports.tagClassByName = constants._reverse(exports.tagClass);

exports.tag = {
  0x00: 'end',
  0x01: 'bool',
  0x02: 'int',
  0x03: 'bitstr',
  0x04: 'octstr',
  0x05: 'null_',
  0x06: 'objid',
  0x07: 'objDesc',
  0x08: 'external',
  0x09: 'real',
  0x0a: 'enum',
  0x0b: 'embed',
  0x0c: 'utf8str',
  0x0d: 'relativeOid',
  0x10: 'seq',
  0x11: 'set',
  0x12: 'numstr',
  0x13: 'printstr',
  0x14: 't61str',
  0x15: 'videostr',
  0x16: 'ia5str',
  0x17: 'utctime',
  0x18: 'gentime',
  0x19: 'graphstr',
  0x1a: 'iso646str',
  0x1b: 'genstr',
  0x1c: 'unistr',
  0x1d: 'charstr',
  0x1e: 'bmpstr'
};
exports.tagByName = constants._reverse(exports.tag);

},{"../constants":35}],35:[function(require,module,exports){
var constants = exports;

// Helper
constants._reverse = function reverse(map) {
  var res = {};

  Object.keys(map).forEach(function(key) {
    // Convert key to integer if it is stringified
    if ((key | 0) == key)
      key = key | 0;

    var value = map[key];
    res[value] = key;
  });

  return res;
};

constants.der = require('./der');

},{"./der":34}],36:[function(require,module,exports){
var inherits = require('util').inherits;

var asn1 = require('../asn1');
var base = asn1.base;
var bignum = asn1.bignum;

// Import DER constants
var der = asn1.constants.der;

function DERDecoder(entity) {
  this.enc = 'der';
  this.name = entity.name;
  this.entity = entity;

  // Construct base tree
  this.tree = new DERNode();
  this.tree._init(entity.body);
};
module.exports = DERDecoder;

DERDecoder.prototype.decode = function decode(data, options) {
  if (!(data instanceof base.DecoderBuffer))
    data = new base.DecoderBuffer(data, options);

  return this.tree._decode(data, options);
};

// Tree methods

function DERNode(parent) {
  base.Node.call(this, 'der', parent);
}
inherits(DERNode, base.Node);

DERNode.prototype._peekTag = function peekTag(buffer, tag, any) {
  if (buffer.isEmpty())
    return false;

  var state = buffer.save();
  var decodedTag = derDecodeTag(buffer, 'Failed to peek tag: "' + tag + '"');
  if (buffer.isError(decodedTag))
    return decodedTag;

  buffer.restore(state);

  return decodedTag.tag === tag || decodedTag.tagStr === tag || any;
};

DERNode.prototype._decodeTag = function decodeTag(buffer, tag, any) {
  var decodedTag = derDecodeTag(buffer,
                                'Failed to decode tag of "' + tag + '"');
  if (buffer.isError(decodedTag))
    return decodedTag;

  var len = derDecodeLen(buffer,
                         decodedTag.primitive,
                         'Failed to get length of "' + tag + '"');

  // Failure
  if (buffer.isError(len))
    return len;

  if (!any &&
      decodedTag.tag !== tag &&
      decodedTag.tagStr !== tag &&
      decodedTag.tagStr + 'of' !== tag) {
    return buffer.error('Failed to match tag: "' + tag + '"');
  }

  if (decodedTag.primitive || len !== null)
    return buffer.skip(len, 'Failed to match body of: "' + tag + '"');

  // Indefinite length... find END tag
  var state = buffer.save();
  var res = this._skipUntilEnd(
      buffer,
      'Failed to skip indefinite length body: "' + this.tag + '"');
  if (buffer.isError(res))
    return res;

  len = buffer.offset - state.offset;
  buffer.restore(state);
  return buffer.skip(len, 'Failed to match body of: "' + tag + '"');
};

DERNode.prototype._skipUntilEnd = function skipUntilEnd(buffer, fail) {
  while (true) {
    var tag = derDecodeTag(buffer, fail);
    if (buffer.isError(tag))
      return tag;
    var len = derDecodeLen(buffer, tag.primitive, fail);
    if (buffer.isError(len))
      return len;

    var res;
    if (tag.primitive || len !== null)
      res = buffer.skip(len)
    else
      res = this._skipUntilEnd(buffer, fail);

    // Failure
    if (buffer.isError(res))
      return res;

    if (tag.tagStr === 'end')
      break;
  }
};

DERNode.prototype._decodeList = function decodeList(buffer, tag, decoder) {
  var result = [];
  while (!buffer.isEmpty()) {
    var possibleEnd = this._peekTag(buffer, 'end');
    if (buffer.isError(possibleEnd))
      return possibleEnd;

    var res = decoder.decode(buffer, 'der');
    if (buffer.isError(res) && possibleEnd)
      break;
    result.push(res);
  }
  return result;
};

DERNode.prototype._decodeStr = function decodeStr(buffer, tag) {
  if (tag === 'octstr') {
    return buffer.raw();
  } else if (tag === 'bitstr') {
    var unused = buffer.readUInt8();
    if (buffer.isError(unused))
      return unused;

    return { unused: unused, data: buffer.raw() };
  } else if (tag === 'ia5str' || tag === 'utf8str') {
    return buffer.raw().toString();
  } else {
    return this.error('Decoding of string type: ' + tag + ' unsupported');
  }
};

DERNode.prototype._decodeObjid = function decodeObjid(buffer, values, relative) {
  var identifiers = [];
  var ident = 0;
  while (!buffer.isEmpty()) {
    var subident = buffer.readUInt8();
    ident <<= 7;
    ident |= subident & 0x7f;
    if ((subident & 0x80) === 0) {
      identifiers.push(ident);
      ident = 0;
    }
  }
  if (subident & 0x80)
    identifiers.push(ident);

  var first = (identifiers[0] / 40) | 0;
  var second = identifiers[0] % 40;

  if (relative)
    result = identifiers;
  else
    result = [first, second].concat(identifiers.slice(1));

  if (values)
    result = values[result.join(' ')];

  return result;
};

DERNode.prototype._decodeTime = function decodeTime(buffer, tag) {
  var str = buffer.raw().toString();
  if (tag === 'gentime') {
    var year = str.slice(0, 4) | 0;
    var mon = str.slice(4, 6) | 0;
    var day = str.slice(6, 8) | 0;
    var hour = str.slice(8, 10) | 0;
    var min = str.slice(10, 12) | 0;
    var sec = str.slice(12, 14) | 0;
  } else if (tag === 'utctime') {
    var year = str.slice(0, 2) | 0;
    var mon = str.slice(2, 4) | 0;
    var day = str.slice(4, 6) | 0;
    var hour = str.slice(6, 8) | 0;
    var min = str.slice(8, 10) | 0;
    var sec = str.slice(10, 12) | 0;
    if (year < 70)
      year = 2000 + year;
    else
      year = 1900 + year;
  } else {
    return this.error('Decoding ' + tag + ' time is not supported yet');
  }

  return Date.UTC(year, mon - 1, day, hour, min, sec, 0);
};

DERNode.prototype._decodeNull = function decodeNull(buffer) {
  return null;
};

DERNode.prototype._decodeBool = function decodeBool(buffer) {
  var res = buffer.readUInt8();
  if (buffer.isError(res))
    return res;
  else
    return res !== 0;
};

DERNode.prototype._decodeInt = function decodeInt(buffer, values) {
  // Bigint, return as it is (assume big endian)
  var raw = buffer.raw();
  var res = new bignum(raw);

  if (values)
    res = values[res.toString(10)] || res;

  return res;
};

DERNode.prototype._use = function use(entity, obj) {
  if (typeof entity === 'function')
    entity = entity(obj);
  return entity._getDecoder('der').tree;
};

// Utility methods

function derDecodeTag(buf, fail) {
  var tag = buf.readUInt8(fail);
  if (buf.isError(tag))
    return tag;

  var cls = der.tagClass[tag >> 6];
  var primitive = (tag & 0x20) === 0;

  // Multi-octet tag - load
  if ((tag & 0x1f) === 0x1f) {
    var oct = tag;
    tag = 0;
    while ((oct & 0x80) === 0x80) {
      oct = buf.readUInt8(fail);
      if (buf.isError(oct))
        return oct;

      tag <<= 7;
      tag |= oct & 0x7f;
    }
  } else {
    tag &= 0x1f;
  }
  var tagStr = der.tag[tag];

  return {
    cls: cls,
    primitive: primitive,
    tag: tag,
    tagStr: tagStr
  };
}

function derDecodeLen(buf, primitive, fail) {
  var len = buf.readUInt8(fail);
  if (buf.isError(len))
    return len;

  // Indefinite form
  if (!primitive && len === 0x80)
    return null;

  // Definite form
  if ((len & 0x80) === 0) {
    // Short form
    return len;
  }

  // Long form
  var num = len & 0x7f;
  if (num >= 4)
    return buf.error('length octect is too long');

  len = 0;
  for (var i = 0; i < num; i++) {
    len <<= 8;
    var j = buf.readUInt8(fail);
    if (buf.isError(j))
      return j;
    len |= j;
  }

  return len;
}

},{"../asn1":28,"util":undefined}],37:[function(require,module,exports){
var decoders = exports;

decoders.der = require('./der');
decoders.pem = require('./pem');

},{"./der":36,"./pem":38}],38:[function(require,module,exports){
var inherits = require('util').inherits;
var Buffer = require('buffer').Buffer;

var asn1 = require('../asn1');
var DERDecoder = require('./der');

function PEMDecoder(entity) {
  DERDecoder.call(this, entity);
  this.enc = 'pem';
};
inherits(PEMDecoder, DERDecoder);
module.exports = PEMDecoder;

PEMDecoder.prototype.decode = function decode(data, options) {
  var lines = data.toString().split(/[\r\n]+/g);

  var label = options.label.toUpperCase();

  var re = /^-----(BEGIN|END) ([^-]+)-----$/;
  var start = -1;
  var end = -1;
  for (var i = 0; i < lines.length; i++) {
    var match = lines[i].match(re);
    if (match === null)
      continue;

    if (match[2] !== label)
      continue;

    if (start === -1) {
      if (match[1] !== 'BEGIN')
        break;
      start = i;
    } else {
      if (match[1] !== 'END')
        break;
      end = i;
      break;
    }
  }
  if (start === -1 || end === -1)
    throw new Error('PEM section not found for: ' + label);

  var base64 = lines.slice(start + 1, end).join('');
  // Remove excessive symbols
  base64.replace(/[^a-z0-9\+\/=]+/gi, '');

  var input = new Buffer(base64, 'base64');
  return DERDecoder.prototype.decode.call(this, input, options);
};

},{"../asn1":28,"./der":36,"buffer":undefined,"util":undefined}],39:[function(require,module,exports){
var inherits = require('util').inherits;
var Buffer = require('buffer').Buffer;

var asn1 = require('../asn1');
var base = asn1.base;
var bignum = asn1.bignum;

// Import DER constants
var der = asn1.constants.der;

function DEREncoder(entity) {
  this.enc = 'der';
  this.name = entity.name;
  this.entity = entity;

  // Construct base tree
  this.tree = new DERNode();
  this.tree._init(entity.body);
};
module.exports = DEREncoder;

DEREncoder.prototype.encode = function encode(data, reporter) {
  return this.tree._encode(data, reporter).join();
};

// Tree methods

function DERNode(parent) {
  base.Node.call(this, 'der', parent);
}
inherits(DERNode, base.Node);

DERNode.prototype._encodeComposite = function encodeComposite(tag,
                                                              primitive,
                                                              cls,
                                                              content) {
  var encodedTag = encodeTag(tag, primitive, cls, this.reporter);

  // Short form
  if (content.length < 0x80) {
    var header = new Buffer(2);
    header[0] = encodedTag;
    header[1] = content.length;
    return this._createEncoderBuffer([ header, content ]);
  }

  // Long form
  // Count octets required to store length
  var lenOctets = 1;
  for (var i = content.length; i >= 0x100; i >>= 8)
    lenOctets++;

  var header = new Buffer(1 + 1 + lenOctets);
  header[0] = encodedTag;
  header[1] = 0x80 | lenOctets;

  for (var i = 1 + lenOctets, j = content.length; j > 0; i--, j >>= 8)
    header[i] = j & 0xff;

  return this._createEncoderBuffer([ header, content ]);
};

DERNode.prototype._encodeStr = function encodeStr(str, tag) {
  if (tag === 'octstr')
    return this._createEncoderBuffer(str);
  else if (tag === 'bitstr')
    return this._createEncoderBuffer([ str.unused | 0, str.data ]);
  else if (tag === 'ia5str' || tag === 'utf8str')
    return this._createEncoderBuffer(str);
  return this.reporter.error('Encoding of string type: ' + tag +
                             ' unsupported');
};

DERNode.prototype._encodeObjid = function encodeObjid(id, values, relative) {
  if (typeof id === 'string') {
    if (!values)
      return this.reporter.error('string objid given, but no values map found');
    if (!values.hasOwnProperty(id))
      return this.reporter.error('objid not found in values map');
    id = values[id].split(/[\s\.]+/g);
    for (var i = 0; i < id.length; i++)
      id[i] |= 0;
  } else if (Array.isArray(id)) {
    id = id.slice();
    for (var i = 0; i < id.length; i++)
      id[i] |= 0;
  }

  if (!Array.isArray(id)) {
    return this.reporter.error('objid() should be either array or string, ' +
                               'got: ' + JSON.stringify(id));
  }

  if (!relative) {
    if (id[1] >= 40)
      return this.reporter.error('Second objid identifier OOB');
    id.splice(0, 2, id[0] * 40 + id[1]);
  }

  // Count number of octets
  var size = 0;
  for (var i = 0; i < id.length; i++) {
    var ident = id[i];
    for (size++; ident >= 0x80; ident >>= 7)
      size++;
  }

  var objid = new Buffer(size);
  var offset = objid.length - 1;
  for (var i = id.length - 1; i >= 0; i--) {
    var ident = id[i];
    objid[offset--] = ident & 0x7f;
    while ((ident >>= 7) > 0)
      objid[offset--] = 0x80 | (ident & 0x7f);
  }

  return this._createEncoderBuffer(objid);
};

function two(num) {
  if (num < 10)
    return '0' + num;
  else
    return num;
}

DERNode.prototype._encodeTime = function encodeTime(time, tag) {
  var str;
  var date = new Date(time);

  if (tag === 'gentime') {
    str = [
      two(date.getFullYear()),
      two(date.getUTCMonth() + 1),
      two(date.getUTCDate()),
      two(date.getUTCHours()),
      two(date.getUTCMinutes()),
      two(date.getUTCSeconds()),
      'Z'
    ].join('');
  } else if (tag === 'utctime') {
    str = [
      two(date.getFullYear() % 100),
      two(date.getUTCMonth() + 1),
      two(date.getUTCDate()),
      two(date.getUTCHours()),
      two(date.getUTCMinutes()),
      two(date.getUTCSeconds()),
      'Z'
    ].join('');
  } else {
    this.reporter.error('Encoding ' + tag + ' time is not supported yet');
  }

  return this._encodeStr(str, 'octstr');
};

DERNode.prototype._encodeNull = function encodeNull() {
  return this._createEncoderBuffer('');
};

DERNode.prototype._encodeInt = function encodeInt(num, values) {
  if (typeof num === 'string') {
    if (!values)
      return this.reporter.error('String int or enum given, but no values map');
    if (!values.hasOwnProperty(num)) {
      return this.reporter.error('Values map doesn\'t contain: ' +
                                 JSON.stringify(num));
    }
    num = values[num];
  }

  // Bignum, assume big endian
  if (typeof num !== 'number' && !Buffer.isBuffer(num)) {
    var numArray = num.toArray();
    if (num.sign === false && numArray[0] & 0x80) {
      numArray.unshift(0);
    }
    num = new Buffer(numArray);
  }

  if (Buffer.isBuffer(num)) {
    var size = num.length;
    if (num.length === 0)
      size++;

    var out = new Buffer(size);
    num.copy(out);
    if (num.length === 0)
      out[0] = 0
    return this._createEncoderBuffer(out);
  }

  if (num < 0x80)
    return this._createEncoderBuffer(num);

  if (num < 0x100)
    return this._createEncoderBuffer([0, num]);

  var size = 1;
  for (var i = num; i >= 0x100; i >>= 8)
    size++;

  var out = new Array(size);
  for (var i = out.length - 1; i >= 0; i--) {
    out[i] = num & 0xff;
    num >>= 8;
  }
  if(out[0] & 0x80) {
    out.unshift(0);
  }

  return this._createEncoderBuffer(new Buffer(out));
};

DERNode.prototype._encodeBool = function encodeBool(value) {
  return this._createEncoderBuffer(value ? 0xff : 0);
};

DERNode.prototype._use = function use(entity, obj) {
  if (typeof entity === 'function')
    entity = entity(obj);
  return entity._getEncoder('der').tree;
};

DERNode.prototype._skipDefault = function skipDefault(dataBuffer, reporter, parent) {
  var state = this._baseState;
  var i;
  if (state['default'] === null)
    return false;

  var data = dataBuffer.join();
  if (state.defaultBuffer === undefined)
    state.defaultBuffer = this._encodeValue(state['default'], reporter, parent).join();

  if (data.length !== state.defaultBuffer.length)
    return false;

  for (i=0; i < data.length; i++)
    if (data[i] !== state.defaultBuffer[i])
      return false;

  return true;
};

// Utility methods

function encodeTag(tag, primitive, cls, reporter) {
  var res;

  if (tag === 'seqof')
    tag = 'seq';
  else if (tag === 'setof')
    tag = 'set';

  if (der.tagByName.hasOwnProperty(tag))
    res = der.tagByName[tag];
  else if (typeof tag === 'number' && (tag | 0) === tag)
    res = tag;
  else
    return reporter.error('Unknown tag: ' + tag);

  if (res >= 0x1f)
    return reporter.error('Multi-octet tag encoding unsupported');

  if (!primitive)
    res |= 0x20;

  res |= (der.tagClassByName[cls || 'universal'] << 6);

  return res;
}

},{"../asn1":28,"buffer":undefined,"util":undefined}],40:[function(require,module,exports){
var encoders = exports;

encoders.der = require('./der');
encoders.pem = require('./pem');

},{"./der":39,"./pem":41}],41:[function(require,module,exports){
var inherits = require('util').inherits;
var Buffer = require('buffer').Buffer;

var asn1 = require('../asn1');
var DEREncoder = require('./der');

function PEMEncoder(entity) {
  DEREncoder.call(this, entity);
  this.enc = 'pem';
};
inherits(PEMEncoder, DEREncoder);
module.exports = PEMEncoder;

PEMEncoder.prototype.encode = function encode(data, options) {
  var buf = DEREncoder.prototype.encode.call(this, data);

  var p = buf.toString('base64');
  var out = [ '-----BEGIN ' + options.label + '-----' ];
  for (var i = 0; i < p.length; i += 64)
    out.push(p.slice(i, i + 64));
  out.push('-----END ' + options.label + '-----');
  return out.join('\n');
};

},{"../asn1":28,"./der":39,"buffer":undefined,"util":undefined}],42:[function(require,module,exports){
'use strict'

var asn1 = require('./asn1/asn1');
var BN = require('./asn1/bignum/bn');

var ECPrivateKeyASN = asn1.define('ECPrivateKey', function() {
    this.seq().obj(
        this.key('version').int(),
        this.key('privateKey').octstr(),
        this.key('parameters').explicit(0).objid().optional(),
        this.key('publicKey').explicit(1).bitstr().optional()
    )
})

var SubjectPublicKeyInfoASN = asn1.define('SubjectPublicKeyInfo', function() {
    this.seq().obj(
        this.key('algorithm').seq().obj(
            this.key("id").objid(),
            this.key("curve").objid()
        ),
        this.key('pub').bitstr()
    )
})

var curves = {
    secp256k1: {
        curveParameters: [1, 3, 132, 0, 10],
        privatePEMOptions: {label: 'EC PRIVATE KEY'},
        publicPEMOptions: {label: 'PUBLIC KEY'}
    }
}

function assert(val, msg) {
    if (!val) {
        throw new Error(msg || 'Assertion failed')
    }
}

function KeyEncoder(options) {
    if (typeof options === 'string') {
        assert(curves.hasOwnProperty(options), 'Unknown curve ' + options);
        options = curves[options]
    }
    this.options = options;
    this.algorithmID = [1, 2, 840, 10045, 2, 1]
}

KeyEncoder.ECPrivateKeyASN = ECPrivateKeyASN;
KeyEncoder.SubjectPublicKeyInfoASN = SubjectPublicKeyInfoASN;

KeyEncoder.prototype.privateKeyObject = function(rawPrivateKey, rawPublicKey) {
    var privateKeyObject = {
        version: new BN(1),
        privateKey: new Buffer(rawPrivateKey, 'hex'),
        parameters: this.options.curveParameters,
        pemOptions: {label:"EC PRIVATE KEY"}
    };

    if (rawPublicKey) {
        privateKeyObject.publicKey = {
            unused: 0,
            data: new Buffer(rawPublicKey, 'hex')
        }
    }

    return privateKeyObject
};

KeyEncoder.prototype.publicKeyObject = function(rawPublicKey) {
    return {
        algorithm: {
            id: this.algorithmID,
            curve: this.options.curveParameters
        },
        pub: {
            unused: 0,
            data: new Buffer(rawPublicKey, 'hex')
        },
        pemOptions: { label :"PUBLIC KEY"}
    }
}

KeyEncoder.prototype.encodePrivate = function(privateKey, originalFormat, destinationFormat) {
    var privateKeyObject

    /* Parse the incoming private key and convert it to a private key object */
    if (originalFormat === 'raw') {
        if (!typeof privateKey === 'string') {
            throw 'private key must be a string'
        }
        var privateKeyObject = this.options.curve.keyFromPrivate(privateKey, 'hex'),
            rawPublicKey = privateKeyObject.getPublic('hex')
        privateKeyObject = this.privateKeyObject(privateKey, rawPublicKey)
    } else if (originalFormat === 'der') {
        if (typeof privateKey === 'buffer') {
            // do nothing
        } else if (typeof privateKey === 'string') {
            privateKey = new Buffer(privateKey, 'hex')
        } else {
            throw 'private key must be a buffer or a string'
        }
        privateKeyObject = ECPrivateKeyASN.decode(privateKey, 'der')
    } else if (originalFormat === 'pem') {
        if (!typeof privateKey === 'string') {
            throw 'private key must be a string'
        }
        privateKeyObject = ECPrivateKeyASN.decode(privateKey, 'pem', this.options.privatePEMOptions)
    } else {
        throw 'invalid private key format'
    }

    /* Export the private key object to the desired format */
    if (destinationFormat === 'raw') {
        return privateKeyObject.privateKey.toString('hex')
    } else if (destinationFormat === 'der') {
        return ECPrivateKeyASN.encode(privateKeyObject, 'der').toString('hex')
    } else if (destinationFormat === 'pem') {
        return ECPrivateKeyASN.encode(privateKeyObject, 'pem', this.options.privatePEMOptions)
    } else {
        throw 'invalid destination format for private key'
    }
}

KeyEncoder.prototype.encodePublic = function(publicKey, originalFormat, destinationFormat) {
    var publicKeyObject

    /* Parse the incoming public key and convert it to a public key object */
    if (originalFormat === 'raw') {
        if (!typeof publicKey === 'string') {
            throw 'public key must be a string'
        }
        publicKeyObject = this.publicKeyObject(publicKey)
    } else if (originalFormat === 'der') {
        if (typeof publicKey === 'buffer') {
            // do nothing
        } else if (typeof publicKey === 'string') {
            publicKey = new Buffer(publicKey, 'hex')
        } else {
            throw 'public key must be a buffer or a string'
        }
        publicKeyObject = SubjectPublicKeyInfoASN.decode(publicKey, 'der')
    } else if (originalFormat === 'pem') {
        if (!typeof publicKey === 'string') {
            throw 'public key must be a string'
        }
        publicKeyObject = SubjectPublicKeyInfoASN.decode(publicKey, 'pem', this.options.publicPEMOptions)
    } else {
        throw 'invalid public key format'
    }

    /* Export the private key object to the desired format */
    if (destinationFormat === 'raw') {
        return publicKeyObject.pub.data.toString('hex')
    } else if (destinationFormat === 'der') {
        return SubjectPublicKeyInfoASN.encode(publicKeyObject, 'der').toString('hex')
    } else if (destinationFormat === 'pem') {
        return SubjectPublicKeyInfoASN.encode(publicKeyObject, 'pem', this.options.publicPEMOptions)
    } else {
        throw 'invalid destination format for public key'
    }
}

module.exports = KeyEncoder;
},{"./asn1/asn1":28,"./asn1/bignum/bn":33}],43:[function(require,module,exports){
require("../../../engine/core");
const path = require("path");
const yazl = $$.require("yazl");
const yauzl = $$.require("yauzl");
const fs = require("fs");
const isStream = require("./utils/isStream");

function PskArchiver() {
	let zipfile = new yazl.ZipFile();
	function zipFolderRecursively(inputPath, root = '') {
		const files = fs.readdirSync(inputPath);
		files.forEach(function (file) {
			const tempPath = path.join(inputPath, file);
			if (!fs.lstatSync(tempPath).isDirectory()) {
				zipfile.addFile(tempPath, path.join(root, file));
			} else {
				zipFolderRecursively(tempPath, path.join(root, file));
			}
		});
	}

	this.zip = function (inputPath, output, callback) {
		var ext = "";
		if(fs.lstatSync(inputPath).isDirectory()) {
			zipFolderRecursively(inputPath);
		}else{
			var filename = path.basename(inputPath);
			zipfile.addFile(inputPath, filename);
			var splitFilename = filename.split(".");
			if(splitFilename.length >= 2 ){
				ext = "." + splitFilename[splitFilename.length - 1];
			}
		}
		zipfile.end();
		if(isStream.isWritable(output)){
			callback(null, zipfile.outputStream.pipe(output));
		}else if(typeof output === "string") {
			$$.ensureFolderExists(output, () => {
				var destinationPath = path.join(output, path.basename(inputPath, ext) + ".zip");
				zipfile.outputStream.pipe(fs.createWriteStream(destinationPath)).on("close", function () {
					callback();
				});
			});
		}
	};

	this.unzip = function (input, outputPath, callback) {
		yauzl.open(input, {lazyEntries: true}, function (err, zipfile) {
			if (err) throw err;
			zipfile.readEntry();
			zipfile.once("end", function () {
				callback();
			});
			zipfile.on("entry", function (entry) {
				if (entry.fileName.endsWith(path.sep)) {
					zipfile.readEntry();
				} else {
					let folder = path.dirname(entry.fileName);
					$$.ensureFolderExists(path.join(outputPath, folder), () => {
						zipfile.openReadStream(entry, function (err, readStream) {
							if (err) throw err;

							readStream.on("end", function () {
								zipfile.readEntry();
							});
							let fileName = path.join(outputPath, entry.fileName);
							let folder = path.dirname(fileName);
							$$.ensureFolderExists(folder, () => {
								let output = fs.createWriteStream(fileName);
								readStream.pipe(output);

							});
						});
					});
				}
			});
		});
	}
}

// new PskArchiver().zip("C:\\Users\\Acer\\WebstormProjects\\privatesky\\tests\\psk-unit-testing\\zip\\input\\test", "C:\\Users\\Acer\\WebstormProjects\\privatesky\\tests\\psk-unit-testing\\zip\\input\\test\\output");
module.exports = new PskArchiver();
},{"../../../engine/core":3,"./utils/isStream":45,"fs":undefined,"path":undefined}],44:[function(require,module,exports){

const crypto = require('crypto');
const fs = require('fs');
const path = require("path");
const isStream = require("./isStream");
const archiver = require("../psk-archiver");
const algorithm = 'aes-256-gcm';
function encode(buffer) {
	return buffer.toString('base64')
		.replace(/\+/g, '')
		.replace(/\//g, '')
		.replace(/=+$/, '');
}
function deleteFolder(folderPath) {
	var files = fs.readdirSync(folderPath);
	files.forEach((file) => {
		var tempPath = path.join(folderPath, file);
		if(fs.statSync(tempPath).isDirectory()){
			deleteFolder(tempPath);
		}else{
			fs.unlinkSync(tempPath);
		}
	});
	fs.rmdirSync(folderPath);
}
function encryptFile(inputPath, destinationPath, password){
	if(!fs.existsSync(path.dirname(destinationPath))){
		fs.mkdirSync(path.dirname(destinationPath));
	}
	if(!fs.existsSync(destinationPath)){
		fs.writeFileSync(destinationPath,"");
	}
	var ws = fs.createWriteStream(destinationPath, {autoClose: false});
	var keySalt       = crypto.randomBytes(32);
	var key           = crypto.pbkdf2Sync(password, keySalt, 10000, 32, 'sha512');

	var aadSalt       = crypto.randomBytes(32);
	var aad           = crypto.pbkdf2Sync(password, aadSalt, 10000, 32, 'sha512');

	var salt          = Buffer.concat([keySalt, aadSalt]);
	var iv            = crypto.pbkdf2Sync(password, salt, 10000, 12, 'sha512');

	var cipher        = crypto.createCipheriv(algorithm, key, iv);
	cipher.setAAD(aad);

	archiver.zip(inputPath, cipher, function (err, cipherStream) {
		cipherStream.on("data", function (chunk) {
			ws.write(chunk)
		});
		cipherStream.on('end', function () {
			var tag = cipher.getAuthTag();
			var dataToAppend = Buffer.concat([salt, tag]);
			ws.write(dataToAppend, function (err) {
				if(err) {
					throw err;
				}
				ws.close();
				fs.lstat(inputPath, function (err, stats) {
					if(err){
						throw err;
					}
					if(stats.isDirectory()){
						console.log("delete folder");
						deleteFolder(inputPath);
					}else{
						console.log("unlink");
						fs.unlinkSync(inputPath);
					}
					console.log("End")
				})
			})
		});
	});
}

function decryptFile(encryptedInputPath, tempFolder, password, callback) {
	const stats           = fs.statSync(encryptedInputPath);
	const fileSizeInBytes = stats.size;
	const fd              = fs.openSync(encryptedInputPath, "r");
	var encryptedAuthData = Buffer.alloc(80);

	fs.readSync(fd, encryptedAuthData, 0, 80, fileSizeInBytes - 80);
	var salt       = encryptedAuthData.slice(0, 64);
	var keySalt    = salt.slice(0, 32);
	var aadSalt    = salt.slice(-32);

	var iv         = crypto.pbkdf2Sync(password, salt, 10000, 12, 'sha512');
	var key        = crypto.pbkdf2Sync(password, keySalt, 10000, 32, 'sha512');
	var aad        = crypto.pbkdf2Sync(password, aadSalt, 10000, 32, 'sha512');
	var tag        = encryptedAuthData.slice(-16);

	var decipher   = crypto.createDecipheriv(algorithm, key, iv);

	decipher.setAAD(aad);
	decipher.setAuthTag(tag);
	var rs = fs.createReadStream(encryptedInputPath, {start: 0, end: fileSizeInBytes - 81});
	if(!fs.existsSync(tempFolder)){
		fs.mkdirSync(tempFolder);
	}
	var tempArchivePath = path.join(tempFolder, path.basename(encryptedInputPath)+".zip");
	if(!fs.existsSync(tempArchivePath)){
		fs.writeFileSync(tempArchivePath);
	}
	var ws = fs.createWriteStream(tempArchivePath, {autoClose: false});
	ws.on("finish", function (err) {
		if(err){
			throw err;
		}else{
			ws.close();
			// deleteFolder(tempFolder);
			var newPath = path.join(path.normalize(encryptedInputPath+"/.."), encode(crypto.randomBytes(32)));
			fs.renameSync(encryptedInputPath, newPath);
			fs.unlinkSync(newPath);
			// fs.unlinkSync(tempArchivePath);
			callback(null, tempArchivePath);

		}
	});
	rs.pipe(decipher).pipe(ws);

}

function createPskHash(data){
	var hash512 = crypto.createHash('sha512');
	var hash256 = crypto.createHash('sha256');
	hash512.update(data);
	hash256.update(hash512.digest());
	return hash256.digest();
}

function isJson(data){
	try{
		JSON.parse(data);
	}catch(e){
		return false;
	}
	return true;
}

function generateSalt(inputData, saltLen){
	var hash   = crypto.createHash('sha512');
	hash.update(inputData);
	var digest = Buffer.from(hash.digest('hex'), 'binary');

	return digest.slice(0, saltLen);
}

function encrypt(data, password){
	var keySalt       = crypto.randomBytes(32);
	var key           = crypto.pbkdf2Sync(password, keySalt, 10000, 32, 'sha512');

	var aadSalt       = crypto.randomBytes(32);
	var aad           = crypto.pbkdf2Sync(password, aadSalt, 10000, 32, 'sha512');

	var salt          = Buffer.concat([keySalt, aadSalt]);
	var iv            = crypto.pbkdf2Sync(password, salt, 10000, 12, 'sha512');

	var cipher        = crypto.createCipheriv(algorithm, key, iv);
	cipher.setAAD(aad);
	var encryptedText = cipher.update(data,'binary');
	var final = Buffer.from(cipher.final('binary'),'binary');
	var tag = cipher.getAuthTag();

	encryptedText = Buffer.concat([encryptedText, final]);

	return Buffer.concat([salt, encryptedText, tag]);
}

function decrypt(encryptedData, password){
	var salt       = encryptedData.slice(0, 64);
	var keySalt    = salt.slice(0, 32);
	var aadSalt    = salt.slice(-32);

	var iv         = crypto.pbkdf2Sync(password, salt, 10000, 12, 'sha512');
	var key        = crypto.pbkdf2Sync(password, keySalt, 10000, 32, 'sha512');
	var aad        = crypto.pbkdf2Sync(password, aadSalt, 10000, 32, 'sha512');

	var ciphertext = encryptedData.slice(64, encryptedData.length - 16);
	var tag        = encryptedData.slice(-16);

	var decipher   = crypto.createDecipheriv(algorithm, key, iv);
	decipher.setAuthTag(tag);
	decipher.setAAD(aad);

	var plaintext  = Buffer.from(decipher.update(ciphertext, 'binary'), 'binary');
	var final      = Buffer.from(decipher.final('binary'), 'binary');
	plaintext      = Buffer.concat([plaintext, final]);

	return plaintext;
}


function deriveKey(password, iterations, dkLen) {
	iterations = iterations || 10000;
	dkLen      = dkLen || 32;
	var salt   = generateSalt(password, 32);
	var dk     = crypto.pbkdf2Sync(password, salt, iterations, dkLen, 'sha512');
	return Buffer.from(dk);
}

module.exports = {
	createPskHash,
	encrypt,
	encryptFile,
	decrypt,
	decryptFile,
	deleteFolder,
	deriveKey,
	encode,
	isJson,
};



},{"../psk-archiver":43,"./isStream":45,"crypto":undefined,"fs":undefined,"path":undefined}],45:[function(require,module,exports){
var stream = require('stream')


function isStream (obj) {
	return obj instanceof stream.Stream
}


function isReadable (obj) {
	return isStream(obj) && typeof obj._read == 'function' && typeof obj._readableState == 'object'
}


function isWritable (obj) {
	return isStream(obj) && typeof obj._write == 'function' && typeof obj._writableState == 'object'
}


function isDuplex (obj) {
	return isReadable(obj) && isWritable(obj)
}


module.exports            = isStream;
module.exports.isReadable = isReadable;
module.exports.isWritable = isWritable;
module.exports.isDuplex   = isDuplex;
},{"stream":undefined}],46:[function(require,module,exports){
/*
 SignSens helper functions
 */
const crypto = require('crypto');

exports.wipeOutsidePayload = function wipeOutsidePayload(hashStringHexa, pos, size){
    var result;
    var sz = hashStringHexa.length;

    var end = (pos + size) % sz;

    if(pos < end){
        result = '0'.repeat(pos) +  hashStringHexa.substring(pos, end) + '0'.repeat(sz - end);
    }
    else {
        result = hashStringHexa.substring(0, end) + '0'.repeat(pos - end) + hashStringHexa.substring(pos, sz);
    }
    return result;
}



exports.extractPayload = function extractPayload(hashStringHexa, pos, size){
    var result;

    var sz = hashStringHexa.length;
    var end = (pos + size) % sz;

    if( pos < end){
        result = hashStringHexa.substring(pos, pos + size);
    } else{

        if(0 != end){
            result = hashStringHexa.substring(0, end)
        }  else {
            result = "";
        }
        result += hashStringHexa.substring(pos, sz);
    }
    return result;
}



exports.fillPayload = function fillPayload(payload, pos, size){
    var sz = 64;
    var result = "";

    var end = (pos + size) % sz;

    if( pos < end){
        result = '0'.repeat(pos) + payload + '0'.repeat(sz - end);
    } else{
        result = payload.substring(0,end);
        result += '0'.repeat(pos - end);
        result += payload.substring(end);
    }
    return result;
}



exports.generatePosHashXTimes = function generatePosHashXTimes(buffer, pos, size, count){ //generate positional hash
    var result  = buffer.toString("hex");

    /*if(pos != -1 )
        result[pos] = 0; */

    for(var i = 0; i < count; i++){
        var hash = crypto.createHash('sha256');
        result = exports.wipeOutsidePayload(result, pos, size);
        hash.update(result);
        result = hash.digest('hex');
    }
    return exports.wipeOutsidePayload(result, pos, size);
}

exports.hashStringArray = function (counter, arr, payloadSize){

    const hash = crypto.createHash('sha256');
    var result = counter.toString(16);

    for(var i = 0 ; i < 64; i++){
        result += exports.extractPayload(arr[i],i, payloadSize);
    }

    hash.update(result);
    var result = hash.digest('hex');
    return result;
}






function dumpMember(obj){
    var type = Array.isArray(obj) ? "array" : typeof obj;
    if(obj === null){
        return "null";
    }
    if(obj === undefined){
        return "undefined";
    }

    switch(type){
        case "number":
        case "string":return obj.toString(); break;
        case "object": return exports.dumpObjectForHashing(obj); break;
        case "boolean": return  obj? "true": "false"; break;
        case "array":
            var result = "";
            for(var i=0; i < obj.length; i++){
                result += exports.dumpObjectForHashing(obj[i]);
            }
            return result;
            break;
        default:
            throw new Error("Type " +  type + " cannot be cryptographically digested");
    }

}


exports.dumpObjectForHashing = function(obj){
    var result = "";

    if(obj === null){
        return "null";
    }
    if(obj === undefined){
        return "undefined";
    }

    var basicTypes = {
        "array"     : true,
        "number"    : true,
        "boolean"   : true,
        "string"    : true,
        "object"    : false
    }

    var type = Array.isArray(obj) ? "array" : typeof obj;
    if( basicTypes[type]){
        return dumpMember(obj);
    }

    var keys = Object.keys(obj);
    keys.sort();


    for(var i=0; i < keys.length; i++){
        result += dumpMember(keys[i]);
        result += dumpMember(obj[keys[i]]);
    }

    return result;
}


exports.hashValues  = function (values){
    const hash = crypto.createHash('sha256');
    var result = exports.dumpObjectForHashing(values);
    hash.update(result);
    return hash.digest('hex');
};

exports.getJSONFromSignature = function getJSONFromSignature(signature, size){
    var result = {
        proof:[]
    };
    var a = signature.split(":");
    result.agent        = a[0];
    result.counter      =  parseInt(a[1], "hex");
    result.nextPublic   =  a[2];

    var proof = a[3]


    if(proof.length/size != 64) {
        throw new Error("Invalid signature " + proof);
    }

    for(var i = 0; i < 64; i++){
        result.proof.push(exports.fillPayload(proof.substring(i * size,(i+1) * size ), i, size))
    }

    return result;
}

exports.createSignature = function (agent,counter, nextPublic, arr, size){
    var result = "";

    for(var i = 0; i < arr.length; i++){
        result += exports.extractPayload(arr[i], i , size);
    }

    return agent + ":" + counter + ":" + nextPublic + ":" + result;
}
},{"crypto":undefined}],47:[function(require,module,exports){
module.exports = {
					beesHealer: require("./lib/beesHealer"),
					soundPubSub: require("./lib/soundPubSub").soundPubSub,
					folderMQ: require("./lib/folderMQ")
};
},{"./lib/beesHealer":49,"./lib/folderMQ":50,"./lib/soundPubSub":51}],48:[function(require,module,exports){
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
},{}],49:[function(require,module,exports){

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
},{}],50:[function(require,module,exports){

var fs = require("fs");
var path = require("path");
var beesHealer = require("./beesHealer");

//TODO: prevent a class of race condition type of errors by signaling with files metadata to the watcher when it is safe to consume

function FolderMQ(folder, callback = () => {}){

	if(typeof callback !== "function"){
		throw new Error("Second parameter should be a callback function");
	}

	folder = path.normalize(folder);

	fs.mkdir(folder, function(err, res){
		fs.exists(folder, function(exists) {
			if (exists) {
				callback(null, folder)
			} else {
				callback(err);
			}
		});
	});

	function mkFileName(swarmRaw){
		return path.normalize(folder + "/" + swarmRaw.meta.swarmId + "."+swarmRaw.meta.swarmTypeName);
	}

	this.getHandler = function(){
		if(producer){
			throw new Error("Only one consumer is allowed!");
		}
		producer = true;
		return {
			addStream : function(stream, callback){
				if(typeof callback !== "function"){
					throw new Error("Second parameter should be a callback function");
				}

				if(!stream || !stream.pipe || typeof stream.pipe !== "function"){
					callback(new Error("Something wrong happened"));
				}

				let swarm = "";
				stream.on('data', (chunk) =>{
					swarm += chunk;
				});

				stream.on("end", () => {
					writeFile(mkFileName(JSON.parse(swarm)), swarm, callback);
				});

				stream.on("error", (err) =>{
					callback(err);
				});
			},
			addSwarm : function(swarm, callback){
				if(!callback){
					callback = $$.defaultErrorHandlingImplementation;
				}else if(typeof callback !== "function"){
					throw new Error("Second parameter should be a callback function");
				}

				beesHealer.asJSON(swarm,null, null, function(err, res){
					writeFile(mkFileName(res), J(res), callback);
				});
			},
			sendSwarmForExecution: function(swarm, callback){
				if(!callback){
					callback = $$.defaultErrorHandlingImplementation;
				}else if(typeof callback !== "function"){
					throw new Error("Second parameter should be a callback function");
				}

				beesHealer.asJSON(swarm, swarm.meta.phaseName, swarm.meta.args, function(err, res){
					writeFile(mkFileName(res), J(res), callback);
				});
			}
		}
	};

	this.registerConsumer = function (callback, shouldDeleteAfterRead = true, shouldWaitForMore = () => true) {
		if(typeof callback !== "function"){
			throw new Error("First parameter should be a callback function");
		}
		if (consumer) {
			throw new Error("Only one consumer is allowed! " + folder);
		}

		consumer = callback;
		fs.mkdir(folder, function (err, res) {
			consumeAllExisting(shouldDeleteAfterRead, shouldWaitForMore);
		});
	};

	this.writeMessage = writeFile;

	this.unlinkContent = function (messageId, callback) {
		const messagePath = path.join(folder, messageId);

		fs.unlink(messagePath, (err) => {
			callback(err);
	});
	};


	/* ---------------- protected  functions */
	var consumer = null;
	var producer = null;


	function consumeMessage(filename, shouldDeleteAfterRead, callback) {
		var fullPath = path.normalize(folder + "/" + filename);
		fs.readFile(fullPath, "utf8", function (err, data) {
			if (!err) {
				if (data !== "") {
					try {
						var message = JSON.parse(data);
					} catch (error) {
						err = error;
					}

					callback(err, message);
					if (shouldDeleteAfterRead) {

						fs.unlink(fullPath, function (err, res) {
							if (err) throw err
						});
					}
				}
			} else {
				callback(err);
			}
		});
	}

	function consumeAllExisting(shouldDeleteAfterRead, shouldWaitForMore) {

		let currentFiles = [];

		fs.readdir(folder, 'utf8', function (err, files) {
			if (err) {
				$$.errorHandler.error(err);
				return;
			}
			currentFiles = files;
			iterateAndConsume(files);

		});

		function startWatching(){
			if (shouldWaitForMore()) {
				watchFolder(shouldDeleteAfterRead, shouldWaitForMore);
			}
		}

		function iterateAndConsume(files, currentIndex = 0) {
			if (currentIndex === files.length) {
				console.log("start watching");
				startWatching();
				return;
			}

			if (path.extname(files[currentIndex]) !== in_progress) {
				consumeMessage(files[currentIndex], shouldDeleteAfterRead, (err, data) => {
					if (err) {
						iterateAndConsume(files, ++currentIndex);
						return;
					}
					consumer(null, data, path.basename(files[currentIndex]));
					if (shouldWaitForMore()) {
						iterateAndConsume(files, ++currentIndex);
					}
				})
			} else {
				iterateAndConsume(files, ++currentIndex);
			}
		}

	}



	const in_progress = ".in_progress";
	function writeFile(filename, content, callback){
		var tmpFilename = filename+in_progress;
		fs.writeFile(tmpFilename, content, function(error, res){
			if(!error){
				fs.rename(tmpFilename, filename, callback);
			}else{
				callback(error);
			}
		});
	}

	var alreadyKnownChanges = {};

	function alreadyFiredChanges(filename, change){
		var res = false;
		if(alreadyKnownChanges[filename]){
			res = true;
		}else{
			alreadyKnownChanges[filename] = change;
		}

		return res;
	}

	function watchFolder(shouldDeleteAfterRead, shouldWaitForMore){
		const watcher = fs.watch(folder, function(eventType, filename){
			 //console.log("Watching:", eventType, filename);

			if (filename && (eventType === "change" || eventType === "rename")) {

				if(path.extname(filename) !== in_progress && !alreadyFiredChanges(filename, eventType)){
					consumeMessage(filename, shouldDeleteAfterRead, (err, data) => {
						if(err) {
							// ??
							return;
						}
						consumer(null, data, filename);
						if(!shouldWaitForMore()) {
							watcher.close();
						}
					});
				}
			}
		});
	}
}

exports.getFolderQueue = function(folder, callback){
	return new FolderMQ(folder, callback);
};
},{"./beesHealer":49,"fs":undefined,"path":undefined}],51:[function(require,module,exports){
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
},{"./Queue":48}],52:[function(require,module,exports){
/* why Function prototype implementation*/


var logger = require('double-check').logger;

logger.addCase("dumpWhys", function(){
    return exports.getAllContexts();
    
});

function newTrackingItem(motivation,caller){
    return {
        step:motivation,
        parent:caller,
        children:[],
        id:caller.context.getNewId(),
        context:caller.context,
        indexInParentChildren:caller.hasOwnProperty('children')?caller.children.length:0
    };
}

var contexts = [];

var globalCurrentContext = null;

exports.getGlobalCurrentContext = function(){
    if(process.env['RUN_WITH_WHYS']) {
        return globalCurrentContext;
    }
    else{
        throw new Error('Why is not activated\nYou must set env variable RUN_WITH_WHYS to true to be able to use whys')
    }
}

exports.getAllContexts = function(){
    return contexts;
}


function onTermination(){
    if(process.env['RUN_WITH_WHYS']) {
        var process_summary = exports.getAllContexts().map(function(context) {return context.getExecutionSummary()})

        if(process.send){
            linkWithParentProcess();
        }else{
            logger.dumpWhys();
        }
    }
    function linkWithParentProcess(){
        process.send({"whyLogs":process_summary})
    }
}

process.on('exit', onTermination);


function TrackingContext(){
    var self = this;
    var lastId = 0;
    this.getExecutionSummary = function(){
        var summary = {}
        self.startingPoint.children.forEach(function(child){
            summary[child.step] = getNodeSummary(child);
        })

        function getNodeSummary(node){
            if(node['summary']){
                //this node is already a summarized ( it was executed in another process)
                return node['summary'];
            }
            var summary = {};
            summary.args = node.args;
            summary.stack = node.stack;
            if(node.exception){
                summary.exception = node.exception;
            }else{
                if(node.children.length>0){
                    summary.calls = {};
                    node.children.forEach(function(child){
                        summary.calls[child.step] = getNodeSummary(child);
                    })
                }
            }
            return summary;
        }
        return summary;
    }
    this.getNewId = function(){return lastId++}
    this.currentRunningItem = newTrackingItem("Context starter",{context:self});
    this.startingPoint = this.currentRunningItem;
    contexts.push(this);
}

var globalWhyStackLevel = 0;

Function.prototype.why = function(motivation, caller,otherContextInfo, externalBinder){
    if(!process.env["RUN_WITH_WHYS"]){
        return this;
    }
    var self = this;
    var newContext = false;
    var thisItem;
    linkToContext();


    var whyFunc = function(){
        updateContext(thisItem);
        addArgs(arguments,thisItem);
        attatchStackInfoToItemWHY(thisItem,newContext,globalWhyStackLevel);
        resolveEmbeddingLevel(thisItem);
        var result = executeWHYFunction(self,thisItem,arguments);
        //maybeLog(globalCurrentContext);
        returnFromCall(thisItem);
        return result
    }

    return whyFunc;

    function linkToContext(){
        if(!caller){
            if (globalWhyStackLevel === 0) {
                globalCurrentContext = new TrackingContext();
                newContext = true;
            }
            thisItem = newTrackingItem(motivation, globalCurrentContext.currentRunningItem);
            globalCurrentContext.currentRunningItem.children.push(thisItem);
        }
        else{
            thisItem = newTrackingItem(motivation,caller);
            caller.children.push(thisItem);
        }
    }

    function attatchStackInfoToItemWHY(item,newContext,globalWhtStackLevel) {
        var stack = new Error().stack.split("\n");

        stack.shift();

        stack = dropLinesMatching(stack, ["WHY"]);

        item.whyEmbeddingLevel = getWhyEmbeddingLevel(stack);
        item.stack = getRelevantStack(item, stack);
        item.isCallback = (globalWhyStackLevel === item.whyEmbeddingLevel - 1) && (!newContext);


        function getWhyEmbeddingLevel(stack) {
            var whyEmbeddingLevel = 0;
            stack.some(function (stackLine) {
                if (stackLine.match("whyFunc") !== null || stackLine.match("at whyFunc") !== null) {
                    whyEmbeddingLevel++;
                    return false;
                }
                return true;
            })
            return whyEmbeddingLevel;
        }

        function getRelevantStack(trackingItem, stack) {
            if (trackingItem.isCallback) {
                stack = [];
                stack.push(trackingItem.parent.stack[0]);
                stack.push("       After callback");
                return stack;
            }
            else {
                if (!trackingItem.parent.hasOwnProperty("stack")) {
                    return dropWhysFromStack(stack);
                }
                var keep = true;
                var firstRedundantStackLine = trackingItem.parent.stack[0];

                return dropWhysFromStack(stack.filter(function (stackLine) {
                    if (stackLine === firstRedundantStackLine) {
                        keep = false;
                    }
                    return keep;
                }))
            }
            function dropWhysFromStack(stack) {
                var whyMatches = ["whyFunc"];
                return dropLinesMatching(stack, whyMatches);
            }
        }

        function dropLinesMatching(stack, lineMatches) {
            return stack.filter(function (stackLine) {
                var ret = true;
                lineMatches.forEach(function (lineMatch) {
                    if (stackLine.match(lineMatch) !== null) {
                        ret = false;
                        return true;
                    }
                    return false;
                })
                return ret;
            })
        }
    }

    function resolveEmbeddingLevel(item){
        if(item.whyEmbeddingLevel>1) {
            item.step += " AND " + item.parent.children.splice(item.indexInParentChildren +1, 1)[0].step;
            item.parent.children.forEach(function(children){
                if(children.indexInParentChildren>item.indexInParentChildren){
                    children.indexInParentChildren--;
                }
            })
        }
    }

    function addArgs(args,item){
        var a = [];
        for(var i = 0; i < args.length; i++){
            if(typeof args[i] === "function"){
                a.push("function");
                continue;
            }

            try{
                a.push(JSON.stringify(args[i]));
            } catch(err){
                a.push("Unserializable argument of type "+typeof args[i]);
            }
        }
        item.args = a;
    }

    function updateContext(item){
        globalCurrentContext = item.context;
        globalCurrentContext.currentRunningItem = item;
    }

    function executeWHYFunction(func,item,args) {
        var previousGlobalWhyStackLevel = globalWhyStackLevel;
        try {
            globalWhyStackLevel++;
            item.result = func.apply(func, args);
            item.done = true;
            globalWhyStackLevel--;
            return item.result;
        }
        catch (exception) {
            globalWhyStackLevel = previousGlobalWhyStackLevel;
            if(exception.logged!==true){
                var error = {
                    'exception':exception,
                    'logged':true
                }
                item['exception'] = error;
                item.done = true;
                globalCurrentContext.currentRunningItem = item.parent;
            }
            throw error;
        }
        return item.result;
    }

    function returnFromCall(item){
        globalCurrentContext.currentRunningItem = item.parent;
    }

    function maybeLog(context){
        if(globalWhyStackLevel === 0){
            logger.logWhy(context.getExecutionSummary());
        }
    }
};


/*
    When launching child processes that run with WHYS you might want to get those logs and integrate in
    the context of the parent process
 */
exports.linkWhyContext = function(childProcess,stepName){
    var onMessage = undefined;
    if(!childProcess._events['message']){
        console.log("Callbacks for 'message' event must be registered before linking with the why context!")
    }else{
        onMessage = childProcess.events['message']
    }

    
    var callingPoint = exports.getGlobalCurrentContext().currentRunningItem;
    childProcess.on('message',function(message){
        if(onMessage) {
            onMessage(message);
        }
        
        if(message['whyLogs']){
            message['whyLogs'].forEach(function(contextSummay) {
                callingPoint.children.push({"step":stepName,'summary':contextSummay})
            })
        }
    })
}

},{"double-check":17}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJydW50aW1lcy9zcmMvbm9kZU1vZHVsZXMuanMiLCJydW50aW1lcy9zcmMvcHNrcnVudGltZS5qcyIsIi4uL2VuZ2luZS9jb3JlLmpzIiwiLi4vZW5naW5lL2Zha2VzL2R1bW15Vk0uanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2luZGV4LmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvU3dhcm1EZWJ1Zy5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL2Nob3Jlb2dyYXBoaWVzL3N3YXJtSW5zdGFuY2VzTWFuYWdlci5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvYmFzZS5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvY2FsbGZsb3cuanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9jaG9yZW9ncmFwaGllcy91dGlsaXR5RnVuY3Rpb25zL3N3YXJtLmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvbG9hZExpYnJhcnkuanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9wYXJhbGxlbEpvaW5Qb2ludC5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL3NhZmUtdXVpZC5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL3NlcmlhbEpvaW5Qb2ludC5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL3N3YXJtRGVzY3JpcHRpb24uanMiLCIuLi9tb2R1bGVzL2RpY29udGFpbmVyL2xpYi9jb250YWluZXIuanMiLCIuLi9tb2R1bGVzL2RvdWJsZS1jaGVjay9saWIvY2hlY2tzQ29yZS5qcyIsIi4uL21vZHVsZXMvZG91YmxlLWNoZWNrL2xpYi9zdGFuZGFyZEFzc2VydHMuanMiLCIuLi9tb2R1bGVzL2RvdWJsZS1jaGVjay9saWIvc3RhbmRhcmRDaGVja3MuanMiLCIuLi9tb2R1bGVzL2RvdWJsZS1jaGVjay9saWIvc3RhbmRhcmRFeGNlcHRpb25zLmpzIiwiLi4vbW9kdWxlcy9kb3VibGUtY2hlY2svbGliL3N0YW5kYXJkTG9ncy5qcyIsIi4uL21vZHVsZXMvZG91YmxlLWNoZWNrL2xpYi90ZXN0UnVubmVyLmpzIiwiLi4vbW9kdWxlcy9kb3VibGUtY2hlY2svbGliL3V0aWxzL2dsb2ItdG8tcmVnZXhwLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vaW5kZXguanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvRUNEU0EuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvUHNrQ3J5cHRvLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvYXBpLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvYXNuMS5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2Jhc2UvYnVmZmVyLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvYmFzZS9pbmRleC5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2Jhc2Uvbm9kZS5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2Jhc2UvcmVwb3J0ZXIuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9iaWdudW0vYm4uanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9jb25zdGFudHMvZGVyLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvY29uc3RhbnRzL2luZGV4LmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvZGVjb2RlcnMvZGVyLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvZGVjb2RlcnMvaW5kZXguanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9kZWNvZGVycy9wZW0uanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9lbmNvZGVycy9kZXIuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9lbmNvZGVycy9pbmRleC5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2VuY29kZXJzL3BlbS5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9rZXlFbmNvZGVyLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL3Bzay1hcmNoaXZlci5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi91dGlscy9jcnlwdG9VdGlscy5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi91dGlscy9pc1N0cmVhbS5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL3NpZ25zZW5zdXNEUy9zc3V0aWwuanMiLCIuLi9tb2R1bGVzL3NvdW5kcHVic3ViL2luZGV4LmpzIiwiLi4vbW9kdWxlcy9zb3VuZHB1YnN1Yi9saWIvUXVldWUuanMiLCIuLi9tb2R1bGVzL3NvdW5kcHVic3ViL2xpYi9iZWVzSGVhbGVyLmpzIiwiLi4vbW9kdWxlcy9zb3VuZHB1YnN1Yi9saWIvZm9sZGVyTVEuanMiLCIuLi9tb2R1bGVzL3NvdW5kcHVic3ViL2xpYi9zb3VuZFB1YlN1Yi5qcyIsIi4uL21vZHVsZXMvd2h5cy9saWIvd2h5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDN09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzluQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOXdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXG4kJC5fX3J1bnRpbWVNb2R1bGVzW1wiYXNzZXJ0XCJdID0gcmVxdWlyZShcImFzc2VydFwiKTtcbiQkLl9fcnVudGltZU1vZHVsZXNbXCJjcnlwdG9cIl0gPSByZXF1aXJlKFwiY3J5cHRvXCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcInpsaWJcIl0gPSByZXF1aXJlKFwiemxpYlwiKTtcblxuXG4vKlxuYXNzZXJ0XG5idWZmZXJcbmNvbnNvbGVcbmNvbnN0YW50c1xuY3J5cHRvXG5kb21haW5cbmV2ZW50c1xuaHR0cFxuaHR0cHNcbm9zXG5wYXRoXG5wdW55Y29kZVxucXVlcnlzdHJpbmdcbnN0cmVhbVxuc3RyaW5nX2RlY29kZXJcbnRpbWVyc1xudHR5XG51cmxcbnV0aWxcbnZtXG56bGliXG5yZXF1aXJlKClcbiovIiwiaWYodHlwZW9mKGdsb2JhbCkgPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgaWYodHlwZW9mKHdpbmRvdykgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgZ2xvYmFsID0gd2luZG93O1xuICAgIH1cbn1cblxuaWYodHlwZW9mKGdsb2JhbC4kJCkgPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgZ2xvYmFsLiQkID0ge307XG5cbiAgICBpZih0eXBlb2Yod2luZG93KSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHdpbmRvdyA9IGdsb2JhbDtcbiAgICB9XG4gICAgd2luZG93LiQkID0gZ2xvYmFsLiQkO1xufVxuXG5pZih0eXBlb2YoJCRbXCJfX3J1bnRpbWVNb2R1bGVzXCJdKSA9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAkJC5fX3J1bnRpbWVNb2R1bGVzID0ge307XG4gICAgY29uc29sZS5sb2coXCJEZWZpbmluZyAkJC5fX3J1bnRpbWVNb2R1bGVzXCIsICQkLl9fcnVudGltZU1vZHVsZXMpXG59XG5cbmlmKHR5cGVvZigkJFtcImJyb3dzZXJSdW50aW1lXCJdKSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmVxdWlyZShcIi4vbm9kZU1vZHVsZXNcIilcbn1cblxuJCQuX19ydW50aW1lTW9kdWxlc1tcInNvdW5kcHVic3ViXCJdID0gcmVxdWlyZShcInNvdW5kcHVic3ViXCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcImNhbGxmbG93XCJdID0gcmVxdWlyZShcImNhbGxmbG93XCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcImRpY29udGFpbmVyXCJdID0gcmVxdWlyZShcImRpY29udGFpbmVyXCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcImRvdWJsZS1jaGVja1wiXSA9IHJlcXVpcmUoXCJkb3VibGUtY2hlY2tcIik7XG4kJC5fX3J1bnRpbWVNb2R1bGVzW1wicHNrY3J5cHRvXCJdID0gcmVxdWlyZShcInBza2NyeXB0b1wiKTtcblxuXG5cblxuIiwiLypcbiBJbml0aWFsIExpY2Vuc2U6IChjKSBBeGlvbG9naWMgUmVzZWFyY2ggJiBBbGJvYWllIFPDrm5pY8SDLlxuIENvbnRyaWJ1dG9yczogQXhpb2xvZ2ljIFJlc2VhcmNoICwgUHJpdmF0ZVNreSBwcm9qZWN0XG4gQ29kZSBMaWNlbnNlOiBMR1BMIG9yIE1JVC5cbiAqL1xuXG5cbnZhciBjYWxsZmxvd01vZHVsZSA9IHJlcXVpcmUoXCIuLy4uL21vZHVsZXMvY2FsbGZsb3dcIik7XG5cblxuXG5leHBvcnRzLmVuYWJsZVRlc3RpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXF1aXJlKFwiLi9mYWtlcy9kdW1teVZNXCIpO1xufVxuXG52YXIgY29yZSA9ICQkLnJlcXVpcmVMaWJyYXJ5KFwiY29yZVwiKTtcblxuXG4vL1RPRE86IFNIT1VMRCBiZSBtb3ZlZCBpbiAkJC5fX2dsb2JhbHNcbiQkLmVuc3VyZUZvbGRlckV4aXN0cyA9IGZ1bmN0aW9uKGZvbGRlciwgY2FsbGJhY2spe1xuXG4gICAgdmFyIGZsb3cgPSAkJC5mbG93LnN0YXJ0KGNvcmUubWtEaXJSZWMpO1xuICAgIGZsb3cubWFrZShmb2xkZXIsIGNhbGxiYWNrKTtcbn07XG5cbiQkLmVuc3VyZUxpbmtFeGlzdHMgPSBmdW5jdGlvbihleGlzdGluZ1BhdGgsIG5ld1BhdGgsIGNhbGxiYWNrKXtcblxuICAgIHZhciBmbG93ID0gJCQuZmxvdy5zdGFydChjb3JlLm1rRGlyUmVjKTtcbiAgICBmbG93Lm1ha2VMaW5rKGV4aXN0aW5nUGF0aCwgbmV3UGF0aCwgY2FsbGJhY2spO1xufTsiLCJmdW5jdGlvbiBkdW1teVZNKG5hbWUpe1xuXHRmdW5jdGlvbiBzb2x2ZVN3YXJtKHN3YXJtKXtcblx0XHQkJC5zd2FybXNJbnN0YW5jZXNNYW5hZ2VyLnJldml2ZV9zd2FybShzd2FybSk7XG5cdH1cblxuXHQkJC5QU0tfUHViU3ViLnN1YnNjcmliZShuYW1lLCBzb2x2ZVN3YXJtKTtcblx0Y29uc29sZS5sb2coXCJDcmVhdGluZyBhIGZha2UgZXhlY3V0aW9uIGNvbnRleHQuLi5cIik7XG59XG5cbmdsb2JhbC52bSA9IGR1bW15Vk0oJCQuQ09OU1RBTlRTLlNXQVJNX0ZPUl9FWEVDVVRJT04pOyIsIlxudmFyIHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcblxuZnVuY3Rpb24gZGVmYXVsdEVycm9ySGFuZGxpbmdJbXBsZW1lbnRhdGlvbihlcnIsIHJlcyl7XG5cdC8vY29uc29sZS5sb2coZXJyLnN0YWNrKTtcblx0aWYoZXJyKSB0aHJvdyBlcnI7XG5cdHJldHVybiByZXM7XG59XG5cblxuaWYodHlwZW9mKGdsb2JhbC4kJCkgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGdsb2JhbC4kJCA9IHt9O1xufVxuXG4kJC5lcnJvckhhbmRsZXIgPSB7XG4gICAgICAgIGVycm9yOmZ1bmN0aW9uKGVyciwgYXJncywgbXNnKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVyciwgXCJVbmtub3duIGVycm9yIGZyb20gZnVuY3Rpb24gY2FsbCB3aXRoIGFyZ3VtZW50czpcIiwgYXJncywgXCJNZXNzYWdlOlwiLCBtc2cpO1xuICAgICAgICB9LFxuICAgICAgICB0aHJvd0Vycm9yOmZ1bmN0aW9uKGVyciwgYXJncywgbXNnKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVyciwgXCJVbmtub3duIGVycm9yIGZyb20gZnVuY3Rpb24gY2FsbCB3aXRoIGFyZ3VtZW50czpcIiwgYXJncywgXCJNZXNzYWdlOlwiLCBtc2cpO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9LFxuICAgICAgICBpZ25vcmVQb3NzaWJsZUVycm9yOiBmdW5jdGlvbihuYW1lKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG5hbWUpO1xuICAgICAgICB9LFxuICAgICAgICBzeW50YXhFcnJvcjpmdW5jdGlvbihwcm9wZXJ0eSwgc3dhcm0sIHRleHQpe1xuICAgICAgICAgICAgLy90aHJvdyBuZXcgRXJyb3IoXCJNaXNzcGVsbGVkIG1lbWJlciBuYW1lIG9yIG90aGVyIGludGVybmFsIGVycm9yIVwiKTtcbiAgICAgICAgICAgIHZhciBzd2FybU5hbWU7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIHN3YXJtID09IFwic3RyaW5nXCIpe1xuICAgICAgICAgICAgICAgICAgICBzd2FybU5hbWUgPSBzd2FybTtcbiAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICBpZihzd2FybSAmJiBzd2FybS5tZXRhKXtcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1OYW1lICA9IHN3YXJtLm1ldGEuc3dhcm1UeXBlTmFtZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzd2FybU5hbWUgPSBzd2FybS5nZXRJbm5lclZhbHVlKCkubWV0YS5zd2FybVR5cGVOYW1lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICBzd2FybU5hbWUgPSBlcnIudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHByb3BlcnR5KXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIldyb25nIG1lbWJlciBuYW1lIFwiLCBwcm9wZXJ0eSwgIFwiIGluIHN3YXJtIFwiLCBzd2FybU5hbWUpO1xuICAgICAgICAgICAgICAgIGlmKHRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVua25vd24gc3dhcm1cIiwgc3dhcm1OYW1lKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuICAgICAgICB3YXJuaW5nOmZ1bmN0aW9uKG1zZyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgICAgICB9XG4gICAgfTtcblxuJCQudWlkR2VuZXJhdG9yID0gcmVxdWlyZShcIi4vbGliL3NhZmUtdXVpZFwiKTtcblxuJCQuc2FmZUVycm9ySGFuZGxpbmcgPSBmdW5jdGlvbihjYWxsYmFjayl7XG4gICAgICAgIGlmKGNhbGxiYWNrKXtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaztcbiAgICAgICAgfSBlbHNle1xuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRFcnJvckhhbmRsaW5nSW1wbGVtZW50YXRpb247XG4gICAgICAgIH1cbiAgICB9O1xuXG4kJC5fX2ludGVybiA9IHtcbiAgICAgICAgbWtBcmdzOmZ1bmN0aW9uKGFyZ3MscG9zKXtcbiAgICAgICAgICAgIHZhciBhcmdzQXJyYXkgPSBbXTtcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IHBvczsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIGFyZ3NBcnJheS5wdXNoKGFyZ3NbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFyZ3NBcnJheTtcbiAgICAgICAgfVxuICAgIH07XG5cbiQkLl9fZ2xvYmFsID0ge1xuXG4gICAgfTtcblxuXG4vKlxuIHJlcXVpcmUgYW5kIHJlcXVpcmVMaWJyYXJ5IGFyZSBvdmVyd3JpdGluZyB0aGUgbm9kZS5qcyBkZWZhdWx0cyBpbiBsb2FkaW5nIG1vZHVsZXMgZm9yIGluY3JlYXNpbmcgc2VjdXJpdHkgYW5kIHNwZWVkLlxuIFdlIGd1YXJhbnRlZSB0aGF0IGVhY2ggbW9kdWxlIG9yIGxpYnJhcnkgaXMgbG9hZGVkIG9ubHkgb25jZSBhbmQgb25seSBmcm9tIGEgc2luZ2xlIGZvbGRlci4uLiBVc2UgdGhlIHN0YW5kYXJkIHJlcXVpcmUgaWYgeW91IG5lZWQgc29tZXRoaW5nIGVsc2UhXG5cbiBCeSBkZWZhdWx0IHdlIGV4cGVjdCB0byBydW4gZnJvbSBhIHByaXZhdGVza3kgVk0gZW5naW5lICggYSBwcml2YXRlc2t5IG5vZGUpIGFuZCB0aGVyZWZvcmUgdGhlIGNhbGxmbG93IHN0YXlzIGluIHRoZSBtb2R1bGVzIGZvbGRlciB0aGVyZS5cbiBBbnkgbmV3IHVzZSBvZiBjYWxsZmxvdyAoYW5kIHJlcXVpcmUgb3IgcmVxdWlyZUxpYnJhcnkpIGNvdWxkIHJlcXVpcmUgY2hhbmdlcyB0byAkJC5fX2dsb2JhbC5fX2xvYWRMaWJyYXlSb290IGFuZCAkJC5fX2dsb2JhbC5fX2xvYWRNb2R1bGVzUm9vdFxuICovXG4kJC5fX2dsb2JhbC5fX2xvYWRMaWJyYXJ5Um9vdCAgICA9IF9fZGlybmFtZSArIFwiLy4uLy4uL2xpYnJhcmllcy9cIjtcbiQkLl9fZ2xvYmFsLl9fbG9hZE1vZHVsZXNSb290ICAgPSBfX2Rpcm5hbWUgKyBcIi8uLi8uLi9tb2R1bGVzL1wiO1xudmFyIGxvYWRlZE1vZHVsZXMgPSB7fTtcbiQkLnJlcXVpcmUgPSBmdW5jdGlvbihuYW1lKXtcblx0dmFyIGV4aXN0aW5nTW9kdWxlID0gbG9hZGVkTW9kdWxlc1tuYW1lXTtcblxuXHRpZighZXhpc3RpbmdNb2R1bGUpe1xuICAgICAgICBleGlzdGluZ01vZHVsZSA9ICQkLl9fcnVudGltZU1vZHVsZXNbbmFtZV07XG4gICAgICAgIGlmKCFleGlzdGluZ01vZHVsZSl7XG4gICAgICAgICAgICB2YXIgYWJzb2x1dGVQYXRoID0gcGF0aC5yZXNvbHZlKCAkJC5fX2dsb2JhbC5fX2xvYWRNb2R1bGVzUm9vdCArIG5hbWUpO1xuICAgICAgICAgICAgZXhpc3RpbmdNb2R1bGUgPSByZXF1aXJlKGFic29sdXRlUGF0aCk7XG4gICAgICAgICAgICBsb2FkZWRNb2R1bGVzW25hbWVdID0gZXhpc3RpbmdNb2R1bGU7XG4gICAgICAgIH1cblx0fVxuXHRyZXR1cm4gZXhpc3RpbmdNb2R1bGU7XG59O1xuXG52YXIgc3dhcm1VdGlscyA9IHJlcXVpcmUoXCIuL2xpYi9jaG9yZW9ncmFwaGllcy91dGlsaXR5RnVuY3Rpb25zL3N3YXJtXCIpO1xuXG4kJC5kZWZhdWx0RXJyb3JIYW5kbGluZ0ltcGxlbWVudGF0aW9uID0gZGVmYXVsdEVycm9ySGFuZGxpbmdJbXBsZW1lbnRhdGlvbjtcblxudmFyIGNhbGxmbG93TW9kdWxlID0gcmVxdWlyZShcIi4vbGliL3N3YXJtRGVzY3JpcHRpb25cIik7XG4kJC5jYWxsZmxvd3MgICAgICAgID0gY2FsbGZsb3dNb2R1bGUuY3JlYXRlU3dhcm1FbmdpbmUoXCJjYWxsZmxvd1wiKTtcbiQkLmNhbGxmbG93ICAgICAgICAgPSAkJC5jYWxsZmxvd3M7XG4kJC5mbG93ICAgICAgICAgICAgID0gJCQuY2FsbGZsb3dzO1xuJCQuZmxvd3MgICAgICAgICAgICA9ICQkLmNhbGxmbG93cztcblxuJCQuc3dhcm1zICAgICAgICAgICA9IGNhbGxmbG93TW9kdWxlLmNyZWF0ZVN3YXJtRW5naW5lKFwic3dhcm1cIiwgc3dhcm1VdGlscyk7XG4kJC5zd2FybSAgICAgICAgICAgID0gJCQuc3dhcm1zO1xuJCQuY29udHJhY3RzICAgICAgICA9IGNhbGxmbG93TW9kdWxlLmNyZWF0ZVN3YXJtRW5naW5lKFwiY29udHJhY3RcIiwgc3dhcm1VdGlscyk7XG4kJC5jb250cmFjdCAgICAgICAgID0gJCQuY29udHJhY3RzO1xuXG5cblxuXG5cblxuJCQuUFNLX1B1YlN1YiA9ICQkLnJlcXVpcmUoXCJzb3VuZHB1YnN1YlwiKS5zb3VuZFB1YlN1YjtcblxuJCQuc2VjdXJpdHlDb250ZXh0ID0gXCJzeXN0ZW1cIjtcbiQkLmxpYnJhcnlQcmVmaXggPSBcImdsb2JhbFwiO1xuJCQubGlicmFyaWVzID0ge1xuICAgIGdsb2JhbDp7XG5cbiAgICB9XG59O1xuXG5cblxuJCQubG9hZExpYnJhcnkgPSByZXF1aXJlKFwiLi9saWIvbG9hZExpYnJhcnlcIikubG9hZExpYnJhcnk7XG5cbiQkLnJlcXVpcmVMaWJyYXJ5ID0gZnVuY3Rpb24obmFtZSl7XG4gICAgdmFyIGFic29sdXRlUGF0aCA9IHBhdGgucmVzb2x2ZSggICQkLl9fZ2xvYmFsLl9fbG9hZExpYnJhcnlSb290ICsgbmFtZSk7XG4gICAgcmV0dXJuICQkLmxvYWRMaWJyYXJ5KG5hbWUsYWJzb2x1dGVQYXRoKTtcbn07XG5cbiQkLnJlZ2lzdGVyU3dhcm1EZXNjcmlwdGlvbiA9ICBmdW5jdGlvbihsaWJyYXJ5TmFtZSxzaG9ydE5hbWUsIGRlc2NyaXB0aW9uKXtcbiAgICBpZighJCQubGlicmFyaWVzW2xpYnJhcnlOYW1lXSl7XG4gICAgICAgICQkLmxpYnJhcmllc1tsaWJyYXJ5TmFtZV0gPSB7fTtcbiAgICB9XG4gICAgJCQubGlicmFyaWVzW2xpYnJhcnlOYW1lXVtzaG9ydE5hbWVdID0gZGVzY3JpcHRpb247XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFx0XHRcdFx0Y3JlYXRlU3dhcm1FbmdpbmU6IHJlcXVpcmUoXCIuL2xpYi9zd2FybURlc2NyaXB0aW9uXCIpLmNyZWF0ZVN3YXJtRW5naW5lLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVKb2luUG9pbnQ6IHJlcXVpcmUoXCIuL2xpYi9wYXJhbGxlbEpvaW5Qb2ludFwiKS5jcmVhdGVKb2luUG9pbnQsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZVNlcmlhbEpvaW5Qb2ludDogcmVxdWlyZShcIi4vbGliL3NlcmlhbEpvaW5Qb2ludFwiKS5jcmVhdGVTZXJpYWxKb2luUG9pbnQsXG5cdFx0XHRcdFx0XCJzYWZlLXV1aWRcIjogcmVxdWlyZShcIi4vbGliL3NhZmUtdXVpZFwiKSxcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1JbnN0YW5jZU1hbmFnZXI6IHJlcXVpcmUoXCIuL2xpYi9jaG9yZW9ncmFwaGllcy9zd2FybUluc3RhbmNlc01hbmFnZXJcIilcblx0XHRcdFx0fTsiLCIvKlxuSW5pdGlhbCBMaWNlbnNlOiAoYykgQXhpb2xvZ2ljIFJlc2VhcmNoICYgQWxib2FpZSBTw65uaWPEgy5cbkNvbnRyaWJ1dG9yczogQXhpb2xvZ2ljIFJlc2VhcmNoICwgUHJpdmF0ZVNreSBwcm9qZWN0XG5Db2RlIExpY2Vuc2U6IExHUEwgb3IgTUlULlxuKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcbnZhciBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcbmdsb2JhbC5jcHJpbnQgPSBjb25zb2xlLmxvZztcbmdsb2JhbC53cHJpbnQgPSBjb25zb2xlLndhcm47XG5nbG9iYWwuZHByaW50ID0gY29uc29sZS5kZWJ1Zztcbmdsb2JhbC5lcHJpbnQgPSBjb25zb2xlLmVycm9yO1xuXG5cbi8qKlxuICogU2hvcnRjdXQgdG8gSlNPTi5zdHJpbmdpZnlcbiAqIEBwYXJhbSBvYmpcbiAqL1xuZ2xvYmFsLkogPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iaik7XG59XG5cblxuLyoqXG4gKiBQcmludCBzd2FybSBjb250ZXh0cyAoTWVzc2FnZXMpIGFuZCBlYXNpZXIgdG8gcmVhZCBjb21wYXJlZCB3aXRoIEpcbiAqIEBwYXJhbSBvYmpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0cy5jbGVhbkR1bXAgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIG8gPSBvYmoudmFsdWVPZigpO1xuICAgIHZhciBtZXRhID0ge1xuICAgICAgICBzd2FybVR5cGVOYW1lOm8ubWV0YS5zd2FybVR5cGVOYW1lXG4gICAgfTtcbiAgICByZXR1cm4gXCJcXHQgc3dhcm1JZDogXCIgKyBvLm1ldGEuc3dhcm1JZCArIFwie1xcblxcdFxcdG1ldGE6IFwiICAgICsgSihtZXRhKSArXG4gICAgICAgIFwiXFxuXFx0XFx0cHVibGljOiBcIiAgICAgICAgKyBKKG8ucHVibGljVmFycykgK1xuICAgICAgICBcIlxcblxcdFxcdHByb3RlY3RlZDogXCIgICAgICsgSihvLnByb3RlY3RlZFZhcnMpICtcbiAgICAgICAgXCJcXG5cXHRcXHRwcml2YXRlOiBcIiAgICAgICArIEooby5wcml2YXRlVmFycykgKyBcIlxcblxcdH1cXG5cIjtcbn1cblxuLy9NID0gZXhwb3J0cy5jbGVhbkR1bXA7XG4vKipcbiAqIEV4cGVyaW1lbnRhbCBmdW5jdGlvbnNcbiAqL1xuXG5cbi8qXG5cbmxvZ2dlciAgICAgID0gbW9uaXRvci5sb2dnZXI7XG5hc3NlcnQgICAgICA9IG1vbml0b3IuYXNzZXJ0O1xudGhyb3dpbmcgICAgPSBtb25pdG9yLmV4Y2VwdGlvbnM7XG5cblxudmFyIHRlbXBvcmFyeUxvZ0J1ZmZlciA9IFtdO1xuXG52YXIgY3VycmVudFN3YXJtQ29tSW1wbCA9IG51bGw7XG5cbmxvZ2dlci5yZWNvcmQgPSBmdW5jdGlvbihyZWNvcmQpe1xuICAgIGlmKGN1cnJlbnRTd2FybUNvbUltcGw9PT1udWxsKXtcbiAgICAgICAgdGVtcG9yYXJ5TG9nQnVmZmVyLnB1c2gocmVjb3JkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW50U3dhcm1Db21JbXBsLnJlY29yZExvZyhyZWNvcmQpO1xuICAgIH1cbn1cblxudmFyIGNvbnRhaW5lciA9IHJlcXVpcmUoXCJkaWNvbnRhaW5lclwiKS5jb250YWluZXI7XG5cbmNvbnRhaW5lci5zZXJ2aWNlKFwic3dhcm1Mb2dnaW5nTW9uaXRvclwiLCBbXCJzd2FybWluZ0lzV29ya2luZ1wiLCBcInN3YXJtQ29tSW1wbFwiXSwgZnVuY3Rpb24ob3V0T2ZTZXJ2aWNlLHN3YXJtaW5nLCBzd2FybUNvbUltcGwpe1xuXG4gICAgaWYob3V0T2ZTZXJ2aWNlKXtcbiAgICAgICAgaWYoIXRlbXBvcmFyeUxvZ0J1ZmZlcil7XG4gICAgICAgICAgICB0ZW1wb3JhcnlMb2dCdWZmZXIgPSBbXTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0bXAgPSB0ZW1wb3JhcnlMb2dCdWZmZXI7XG4gICAgICAgIHRlbXBvcmFyeUxvZ0J1ZmZlciA9IFtdO1xuICAgICAgICBjdXJyZW50U3dhcm1Db21JbXBsID0gc3dhcm1Db21JbXBsO1xuICAgICAgICBsb2dnZXIucmVjb3JkID0gZnVuY3Rpb24ocmVjb3JkKXtcbiAgICAgICAgICAgIGN1cnJlbnRTd2FybUNvbUltcGwucmVjb3JkTG9nKHJlY29yZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0bXAuZm9yRWFjaChmdW5jdGlvbihyZWNvcmQpe1xuICAgICAgICAgICAgbG9nZ2VyLnJlY29yZChyZWNvcmQpO1xuICAgICAgICB9KTtcbiAgICB9XG59KVxuXG4qL1xuZ2xvYmFsLnVuY2F1Z2h0RXhjZXB0aW9uU3RyaW5nID0gXCJcIjtcbmdsb2JhbC51bmNhdWdodEV4Y2VwdGlvbkV4aXN0cyA9IGZhbHNlO1xuaWYodHlwZW9mIGdsb2JhbC5nbG9iYWxWZXJib3NpdHkgPT0gJ3VuZGVmaW5lZCcpe1xuICAgIGdsb2JhbC5nbG9iYWxWZXJib3NpdHkgPSBmYWxzZTtcbn1cblxudmFyIERFQlVHX1NUQVJUX1RJTUUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuZnVuY3Rpb24gZ2V0RGVidWdEZWx0YSgpe1xuICAgIHZhciBjdXJyZW50VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHJldHVybiBjdXJyZW50VGltZSAtIERFQlVHX1NUQVJUX1RJTUU7XG59XG5cbi8qKlxuICogRGVidWcgZnVuY3Rpb25zLCBpbmZsdWVuY2VkIGJ5IGdsb2JhbFZlcmJvc2l0eSBnbG9iYWwgdmFyaWFibGVcbiAqIEBwYXJhbSB0eHRcbiAqL1xuZHByaW50ID0gZnVuY3Rpb24gKHR4dCkge1xuICAgIGlmIChnbG9iYWxWZXJib3NpdHkgPT0gdHJ1ZSkge1xuICAgICAgICBpZiAodGhpc0FkYXB0ZXIuaW5pdGlsaXNlZCApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiREVCVUc6IFtcIiArIHRoaXNBZGFwdGVyLm5vZGVOYW1lICsgXCJdKFwiICsgZ2V0RGVidWdEZWx0YSgpKyBcIik6XCIrdHh0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiREVCVUc6IChcIiArIGdldERlYnVnRGVsdGEoKSsgXCIpOlwiK3R4dCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHOiBcIiArIHR4dCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogb2Jzb2xldGUhP1xuICogQHBhcmFtIHR4dFxuICovXG5nbG9iYWwuYXByaW50ID0gZnVuY3Rpb24gKHR4dCkge1xuICAgIGNvbnNvbGUubG9nKFwiREVCVUc6IFtcIiArIHRoaXNBZGFwdGVyLm5vZGVOYW1lICsgXCJdOiBcIiArIHR4dCk7XG59XG5cblxuXG4vKipcbiAqIFV0aWxpdHkgZnVuY3Rpb24gdXN1YWxseSB1c2VkIGluIHRlc3RzLCBleGl0IGN1cnJlbnQgcHJvY2VzcyBhZnRlciBhIHdoaWxlXG4gKiBAcGFyYW0gbXNnXG4gKiBAcGFyYW0gdGltZW91dFxuICovXG5nbG9iYWwuZGVsYXlFeGl0ID0gZnVuY3Rpb24gKG1zZywgcmV0Q29kZSx0aW1lb3V0KSB7XG4gICAgaWYocmV0Q29kZSA9PSB1bmRlZmluZWQpe1xuICAgICAgICByZXRDb2RlID0gRXhpdENvZGVzLlVua25vd25FcnJvcjtcbiAgICB9XG5cbiAgICBpZih0aW1lb3V0ID09IHVuZGVmaW5lZCl7XG4gICAgICAgIHRpbWVvdXQgPSAxMDA7XG4gICAgfVxuXG4gICAgaWYobXNnID09IHVuZGVmaW5lZCl7XG4gICAgICAgIG1zZyA9IFwiRGVsYXlpbmcgZXhpdCB3aXRoIFwiKyB0aW1lb3V0ICsgXCJtc1wiO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHByb2Nlc3MuZXhpdChyZXRDb2RlKTtcbiAgICB9LCB0aW1lb3V0KTtcbn1cblxuXG5mdW5jdGlvbiBsb2NhbExvZyAobG9nVHlwZSwgbWVzc2FnZSwgZXJyKSB7XG4gICAgdmFyIHRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgIHZhciBub3cgPSB0aW1lLmdldERhdGUoKSArIFwiLVwiICsgKHRpbWUuZ2V0TW9udGgoKSArIDEpICsgXCIsXCIgKyB0aW1lLmdldEhvdXJzKCkgKyBcIjpcIiArIHRpbWUuZ2V0TWludXRlcygpO1xuICAgIHZhciBtc2c7XG5cbiAgICBtc2cgPSAnWycgKyBub3cgKyAnXVsnICsgdGhpc0FkYXB0ZXIubm9kZU5hbWUgKyAnXSAnICsgbWVzc2FnZTtcblxuICAgIGlmIChlcnIgIT0gbnVsbCAmJiBlcnIgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG1zZyArPSAnXFxuICAgICBFcnI6ICcgKyBlcnIudG9TdHJpbmcoKTtcbiAgICAgICAgaWYgKGVyci5zdGFjayAmJiBlcnIuc3RhY2sgIT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgbXNnICs9ICdcXG4gICAgIFN0YWNrOiAnICsgZXJyLnN0YWNrICsgJ1xcbic7XG4gICAgfVxuXG4gICAgY3ByaW50KG1zZyk7XG4gICAgaWYodGhpc0FkYXB0ZXIuaW5pdGlsaXNlZCl7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKGdldFN3YXJtRmlsZVBhdGgodGhpc0FkYXB0ZXIuY29uZmlnLmxvZ3NQYXRoICsgXCIvXCIgKyBsb2dUeXBlKSwgbXNnKTtcbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJGYWlsaW5nIHRvIHdyaXRlIGxvZ3MgaW4gXCIsIHRoaXNBZGFwdGVyLmNvbmZpZy5sb2dzUGF0aCApO1xuICAgICAgICB9XG5cbiAgICB9XG59XG5cblxuZ2xvYmFsLnByaW50ZiA9IGZ1bmN0aW9uICguLi5wYXJhbXMpIHtcbiAgICB2YXIgYXJncyA9IFtdOyAvLyBlbXB0eSBhcnJheVxuICAgIC8vIGNvcHkgYWxsIG90aGVyIGFyZ3VtZW50cyB3ZSB3YW50IHRvIFwicGFzcyB0aHJvdWdoXCJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcmdzLnB1c2gocGFyYW1zW2ldKTtcbiAgICB9XG4gICAgdmFyIG91dCA9IHV0aWwuZm9ybWF0LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIGNvbnNvbGUubG9nKG91dCk7XG59XG5cbmdsb2JhbC5zcHJpbnRmID0gZnVuY3Rpb24gKC4uLnBhcmFtcykge1xuICAgIHZhciBhcmdzID0gW107IC8vIGVtcHR5IGFycmF5XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJncy5wdXNoKHBhcmFtc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiB1dGlsLmZvcm1hdC5hcHBseSh0aGlzLCBhcmdzKTtcbn1cblxuIiwiXG5cbmZ1bmN0aW9uIFN3YXJtc0luc3RhbmNlc01hbmFnZXIoKXtcbiAgICB2YXIgc3dhcm1BbGl2ZUluc3RhbmNlcyA9IHtcblxuICAgIH1cblxuICAgIHRoaXMud2FpdEZvclN3YXJtID0gZnVuY3Rpb24oY2FsbGJhY2ssIHN3YXJtLCBrZWVwQWxpdmVDaGVjayl7XG5cbiAgICAgICAgZnVuY3Rpb24gZG9Mb2dpYygpe1xuICAgICAgICAgICAgdmFyIHN3YXJtSWQgPSBzd2FybS5nZXRJbm5lclZhbHVlKCkubWV0YS5zd2FybUlkO1xuICAgICAgICAgICAgdmFyIHdhdGNoZXIgPSBzd2FybUFsaXZlSW5zdGFuY2VzW3N3YXJtSWRdO1xuICAgICAgICAgICAgaWYoIXdhdGNoZXIpe1xuICAgICAgICAgICAgICAgIHdhdGNoZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIHN3YXJtOnN3YXJtLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazpjYWxsYmFjayxcbiAgICAgICAgICAgICAgICAgICAga2VlcEFsaXZlQ2hlY2s6a2VlcEFsaXZlQ2hlY2tcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3dhcm1BbGl2ZUluc3RhbmNlc1tzd2FybUlkXSA9IHdhdGNoZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBmaWx0ZXIoKXtcbiAgICAgICAgICAgIHJldHVybiBzd2FybS5nZXRJbm5lclZhbHVlKCkubWV0YS5zd2FybUlkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8kJC51aWRHZW5lcmF0b3Iud2FpdF9mb3JfY29uZGl0aW9uKGNvbmRpdGlvbixkb0xvZ2ljKTtcbiAgICAgICAgc3dhcm0ub2JzZXJ2ZShkb0xvZ2ljLCBudWxsLCBmaWx0ZXIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsZWFuU3dhcm1XYWl0ZXIoc3dhcm1TZXJpYWxpc2F0aW9uKXsgLy8gVE9ETzogYWRkIGJldHRlciBtZWNoYW5pc21zIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXG4gICAgICAgIHZhciBzd2FybUlkID0gc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuc3dhcm1JZDtcbiAgICAgICAgdmFyIHdhdGNoZXIgPSBzd2FybUFsaXZlSW5zdGFuY2VzW3N3YXJtSWRdO1xuXG4gICAgICAgIGlmKCF3YXRjaGVyKXtcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci53YXJuaW5nKFwiSW52YWxpZCBzd2FybSByZWNlaXZlZDogXCIgKyBzd2FybUlkKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhcmdzID0gc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuYXJncztcbiAgICAgICAgYXJncy5wdXNoKHN3YXJtU2VyaWFsaXNhdGlvbik7XG5cbiAgICAgICAgd2F0Y2hlci5jYWxsYmFjay5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgaWYoIXdhdGNoZXIua2VlcEFsaXZlQ2hlY2soKSl7XG4gICAgICAgICAgICBkZWxldGUgc3dhcm1BbGl2ZUluc3RhbmNlc1tzd2FybUlkXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucmV2aXZlX3N3YXJtID0gZnVuY3Rpb24oc3dhcm1TZXJpYWxpc2F0aW9uKXtcblxuXG4gICAgICAgIHZhciBzd2FybUlkICAgICA9IHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLnN3YXJtSWQ7XG4gICAgICAgIHZhciBzd2FybVR5cGUgICA9IHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLnN3YXJtVHlwZU5hbWU7XG4gICAgICAgIHZhciBpbnN0YW5jZSAgICA9IHN3YXJtQWxpdmVJbnN0YW5jZXNbc3dhcm1JZF07XG5cbiAgICAgICAgdmFyIHN3YXJtO1xuXG4gICAgICAgIGlmKGluc3RhbmNlKXtcbiAgICAgICAgICAgIHN3YXJtID0gaW5zdGFuY2Uuc3dhcm07XG5cbiAgICAgICAgfSAgIGVsc2Uge1xuICAgICAgICAgICAgc3dhcm0gPSAkJC5zd2FybS5jcmVhdGUoc3dhcm1UeXBlLCB1bmRlZmluZWQsIHN3YXJtU2VyaWFsaXNhdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZihzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5jb21tYW5kID09IFwiYXN5bmNSZXR1cm5cIil7XG4gICAgICAgICAgICBjbGVhblN3YXJtV2FpdGVyKHN3YXJtU2VyaWFsaXNhdGlvbik7XG4gICAgICAgIH0gZWxzZSAgICAgaWYoc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuY29tbWFuZCA9PSBcImV4ZWN1dGVTd2FybVBoYXNlXCIpe1xuICAgICAgICAgICAgc3dhcm0ucnVuUGhhc2Uoc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEucGhhc2VOYW1lLCBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5hcmdzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5rbm93biBjb21tYW5kXCIsc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuY29tbWFuZCwgXCJpbiBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5jb21tYW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN3YXJtO1xuICAgIH1cbn1cblxuXG4kJC5zd2FybXNJbnN0YW5jZXNNYW5hZ2VyID0gbmV3IFN3YXJtc0luc3RhbmNlc01hbmFnZXIoKTtcblxuXG4iLCJ2YXIgYmVlc0hlYWxlciA9ICQkLnJlcXVpcmUoXCJzb3VuZHB1YnN1YlwiKS5iZWVzSGVhbGVyO1xudmFyIHN3YXJtRGVidWcgPSByZXF1aXJlKFwiLi4vU3dhcm1EZWJ1Z1wiKTtcblxuZXhwb3J0cy5jcmVhdGVGb3JPYmplY3QgPSBmdW5jdGlvbih2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCl7XG5cdHZhciByZXQgPSB7fTtcblxuXHRmdW5jdGlvbiBmaWx0ZXJGb3JTZXJpYWxpc2FibGUgKHZhbHVlT2JqZWN0KXtcblx0XHRyZXR1cm4gdmFsdWVPYmplY3QubWV0YS5zd2FybUlkO1xuXHR9XG5cblx0dmFyIHN3YXJtRnVuY3Rpb24gPSBmdW5jdGlvbihjb250ZXh0LCBwaGFzZU5hbWUpe1xuXHRcdHZhciBhcmdzID1bXTtcblx0XHRmb3IodmFyIGkgPSAyOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKXtcblx0XHRcdGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuXHRcdH1cblxuXHRcdC8vbWFrZSB0aGUgZXhlY3V0aW9uIGF0IGxldmVsIDAgIChhZnRlciBhbGwgcGVuZGluZyBldmVudHMpIGFuZCB3YWl0IHRvIGhhdmUgYSBzd2FybUlkXG5cdFx0cmV0Lm9ic2VydmUoZnVuY3Rpb24oKXtcblx0XHRcdGJlZXNIZWFsZXIuYXNKU09OKHZhbHVlT2JqZWN0LCBwaGFzZU5hbWUsIGFyZ3MsIGZ1bmN0aW9uKGVycixqc01zZyl7XG5cdFx0XHRcdGpzTXNnLm1ldGEudGFyZ2V0ID0gY29udGV4dDtcblx0XHRcdFx0JCQuUFNLX1B1YlN1Yi5wdWJsaXNoKCQkLkNPTlNUQU5UUy5TV0FSTV9GT1JfRVhFQ1VUSU9OLCBqc01zZyk7XG5cdFx0XHR9KTtcblx0XHR9LG51bGwsZmlsdGVyRm9yU2VyaWFsaXNhYmxlKTtcblxuXHRcdHJldC5ub3RpZnkoKTtcblxuXG5cdFx0cmV0dXJuIHRoaXNPYmplY3Q7XG5cdH07XG5cblx0dmFyIGFzeW5jUmV0dXJuID0gZnVuY3Rpb24oZXJyLCByZXN1bHQpe1xuXHRcdHZhciBjb250ZXh0ID0gdmFsdWVPYmplY3QucHJvdGVjdGVkVmFycy5jb250ZXh0O1xuXG5cdFx0aWYoIWNvbnRleHQgJiYgdmFsdWVPYmplY3QubWV0YS53YWl0U3RhY2spe1xuXHRcdFx0Y29udGV4dCA9IHZhbHVlT2JqZWN0Lm1ldGEud2FpdFN0YWNrLnBvcCgpO1xuXHRcdFx0dmFsdWVPYmplY3QucHJvdGVjdGVkVmFycy5jb250ZXh0ID0gY29udGV4dDtcblx0XHR9XG5cblx0XHRiZWVzSGVhbGVyLmFzSlNPTih2YWx1ZU9iamVjdCwgXCJfX3JldHVybl9fXCIsIFtlcnIsIHJlc3VsdF0sIGZ1bmN0aW9uKGVycixqc01zZyl7XG5cdFx0XHRqc01zZy5tZXRhLmNvbW1hbmQgPSBcImFzeW5jUmV0dXJuXCI7XG5cdFx0XHRpZighY29udGV4dCl7XG5cdFx0XHRcdGNvbnRleHQgPSB2YWx1ZU9iamVjdC5tZXRhLmhvbWVTZWN1cml0eUNvbnRleHQ7Ly9UT0RPOiBDSEVDSyBUSElTXG5cblx0XHRcdH1cblx0XHRcdGpzTXNnLm1ldGEudGFyZ2V0ID0gY29udGV4dDtcblxuXHRcdFx0aWYoIWNvbnRleHQpe1xuXHRcdFx0XHQkJC5lcnJvckhhbmRsZXIuZXJyb3IobmV3IEVycm9yKFwiQXN5bmNocm9ub3VzIHJldHVybiBpbnNpZGUgb2YgYSBzd2FybSB0aGF0IGRvZXMgbm90IHdhaXQgZm9yIHJlc3VsdHNcIikpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JCQuUFNLX1B1YlN1Yi5wdWJsaXNoKCQkLkNPTlNUQU5UUy5TV0FSTV9GT1JfRVhFQ1VUSU9OLCBqc01zZyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG5cblx0ZnVuY3Rpb24gaG9tZShlcnIsIHJlc3VsdCl7XG5cdFx0YmVlc0hlYWxlci5hc0pTT04odmFsdWVPYmplY3QsIFwiaG9tZVwiLCBbZXJyLCByZXN1bHRdLCBmdW5jdGlvbihlcnIsanNNc2cpe1xuXHRcdFx0dmFyIGNvbnRleHQgPSB2YWx1ZU9iamVjdC5tZXRhLmhvbWVDb250ZXh0O1xuXHRcdFx0anNNc2cubWV0YS50YXJnZXQgPSBjb250ZXh0O1xuXHRcdFx0JCQuUFNLX1B1YlN1Yi5wdWJsaXNoKCQkLkNPTlNUQU5UUy5TV0FSTV9GT1JfRVhFQ1VUSU9OLCBqc01zZyk7XG5cdFx0fSk7XG5cdH1cblxuXG5cblx0ZnVuY3Rpb24gd2FpdFJlc3VsdHMoY2FsbGJhY2ssIGtlZXBBbGl2ZUNoZWNrLCBzd2FybSl7XG5cdFx0aWYoIXN3YXJtKXtcblx0XHRcdHN3YXJtID0gdGhpcztcblx0XHR9XG5cdFx0aWYoIWtlZXBBbGl2ZUNoZWNrKXtcblx0XHRcdGtlZXBBbGl2ZUNoZWNrID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR2YXIgaW5uZXIgPSBzd2FybS5nZXRJbm5lclZhbHVlKCk7XG5cdFx0aWYoIWlubmVyLm1ldGEud2FpdFN0YWNrKXtcblx0XHRcdGlubmVyLm1ldGEud2FpdFN0YWNrID0gW107XG5cdFx0XHRpbm5lci5tZXRhLndhaXRTdGFjay5wdXNoKCQkLnNlY3VyaXR5Q29udGV4dClcblx0XHR9XG5cdFx0JCQuc3dhcm1zSW5zdGFuY2VzTWFuYWdlci53YWl0Rm9yU3dhcm0oY2FsbGJhY2ssIHN3YXJtLCBrZWVwQWxpdmVDaGVjayk7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIGdldElubmVyVmFsdWUoKXtcblx0XHRyZXR1cm4gdmFsdWVPYmplY3Q7XG5cdH1cblxuXHRmdW5jdGlvbiBydW5QaGFzZShmdW5jdE5hbWUsIGFyZ3Mpe1xuXHRcdHZhciBmdW5jID0gdmFsdWVPYmplY3QubXlGdW5jdGlvbnNbZnVuY3ROYW1lXTtcblx0XHRpZihmdW5jKXtcblx0XHRcdGZ1bmMuYXBwbHkodGhpc09iamVjdCwgYXJncyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihmdW5jdE5hbWUsIHZhbHVlT2JqZWN0LCBcIkZ1bmN0aW9uIFwiICsgZnVuY3ROYW1lICsgXCIgZG9lcyBub3QgZXhpc3QhXCIpO1xuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gdXBkYXRlKHNlcmlhbGlzYXRpb24pe1xuXHRcdGJlZXNIZWFsZXIuanNvblRvTmF0aXZlKHNlcmlhbGlzYXRpb24sdmFsdWVPYmplY3QpO1xuXHR9XG5cblxuXHRmdW5jdGlvbiB2YWx1ZU9mKCl7XG5cdFx0dmFyIHJldCA9IHt9O1xuXHRcdHJldC5tZXRhICAgICAgICAgICAgICAgID0gdmFsdWVPYmplY3QubWV0YTtcblx0XHRyZXQucHVibGljVmFycyAgICAgICAgICA9IHZhbHVlT2JqZWN0LnB1YmxpY1ZhcnM7XG5cdFx0cmV0LnByaXZhdGVWYXJzICAgICAgICAgPSB2YWx1ZU9iamVjdC5wcml2YXRlVmFycztcblx0XHRyZXQucHJvdGVjdGVkVmFycyAgICAgICA9IHZhbHVlT2JqZWN0LnByb3RlY3RlZFZhcnM7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGZ1bmN0aW9uIHRvU3RyaW5nICgpe1xuXHRcdHJldHVybiBzd2FybURlYnVnLmNsZWFuRHVtcCh0aGlzT2JqZWN0LnZhbHVlT2YoKSk7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIGNyZWF0ZVBhcmFsbGVsKGNhbGxiYWNrKXtcblx0XHRyZXR1cm4gcmVxdWlyZShcIi4uLy4uL3BhcmFsbGVsSm9pblBvaW50XCIpLmNyZWF0ZUpvaW5Qb2ludCh0aGlzT2JqZWN0LCBjYWxsYmFjaywgJCQuX19pbnRlcm4ubWtBcmdzKGFyZ3VtZW50cywxKSk7XG5cdH1cblxuXHRmdW5jdGlvbiBjcmVhdGVTZXJpYWwoY2FsbGJhY2spe1xuXHRcdHJldHVybiByZXF1aXJlKFwiLi4vLi4vc2VyaWFsSm9pblBvaW50XCIpLmNyZWF0ZVNlcmlhbEpvaW5Qb2ludCh0aGlzT2JqZWN0LCBjYWxsYmFjaywgJCQuX19pbnRlcm4ubWtBcmdzKGFyZ3VtZW50cywxKSk7XG5cdH1cblxuXHRmdW5jdGlvbiBpbnNwZWN0KCl7XG5cdFx0cmV0dXJuIHN3YXJtRGVidWcuY2xlYW5EdW1wKHRoaXNPYmplY3QudmFsdWVPZigpKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNvbnN0cnVjdG9yKCl7XG5cdFx0cmV0dXJuIFN3YXJtRGVzY3JpcHRpb247XG5cdH1cblxuXHRmdW5jdGlvbiBlbnN1cmVMb2NhbElkKCl7XG5cdFx0aWYoIXZhbHVlT2JqZWN0LmxvY2FsSWQpe1xuXHRcdFx0dmFsdWVPYmplY3QubG9jYWxJZCA9IHZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1UeXBlTmFtZSArIFwiLVwiICsgbG9jYWxJZDtcblx0XHRcdGxvY2FsSWQrKztcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBvYnNlcnZlKGNhbGxiYWNrLCB3YWl0Rm9yTW9yZSwgZmlsdGVyKXtcblx0XHRpZighd2FpdEZvck1vcmUpe1xuXHRcdFx0d2FpdEZvck1vcmUgPSBmdW5jdGlvbiAoKXtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGVuc3VyZUxvY2FsSWQoKTtcblxuXHRcdCQkLlBTS19QdWJTdWIuc3Vic2NyaWJlKHZhbHVlT2JqZWN0LmxvY2FsSWQsIGNhbGxiYWNrLCB3YWl0Rm9yTW9yZSwgZmlsdGVyKTtcblx0fVxuXG5cdGZ1bmN0aW9uIHRvSlNPTihwcm9wKXtcblx0XHQvL3ByZXZlbnRpbmcgbWF4IGNhbGwgc3RhY2sgc2l6ZSBleGNlZWRpbmcgb24gcHJveHkgYXV0byByZWZlcmVuY2luZ1xuXHRcdC8vcmVwbGFjZSB7fSBhcyByZXN1bHQgb2YgSlNPTihQcm94eSkgd2l0aCB0aGUgc3RyaW5nIFtPYmplY3QgcHJvdGVjdGVkIG9iamVjdF1cblx0XHRyZXR1cm4gXCJbT2JqZWN0IHByb3RlY3RlZCBvYmplY3RdXCI7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRKU09OYXN5bmMoY2FsbGJhY2spe1xuXHRcdC8vbWFrZSB0aGUgZXhlY3V0aW9uIGF0IGxldmVsIDAgIChhZnRlciBhbGwgcGVuZGluZyBldmVudHMpIGFuZCB3YWl0IHRvIGhhdmUgYSBzd2FybUlkXG5cdFx0cmV0Lm9ic2VydmUoZnVuY3Rpb24oKXtcblx0XHRcdGJlZXNIZWFsZXIuYXNKU09OKHZhbHVlT2JqZWN0LCBudWxsLCBudWxsLGNhbGxiYWNrKTtcblx0XHR9LG51bGwsZmlsdGVyRm9yU2VyaWFsaXNhYmxlKTtcblx0XHRyZXQubm90aWZ5KCk7XG5cdH1cblxuXHRmdW5jdGlvbiBub3RpZnkoZXZlbnQpe1xuXHRcdGlmKCFldmVudCl7XG5cdFx0XHRldmVudCA9IHZhbHVlT2JqZWN0O1xuXHRcdH1cblx0XHRlbnN1cmVMb2NhbElkKCk7XG5cdFx0JCQuUFNLX1B1YlN1Yi5wdWJsaXNoKHZhbHVlT2JqZWN0LmxvY2FsSWQsIGV2ZW50KTtcblx0fVxuXG5cdHJldC5zd2FybSAgICAgICAgICAgPSBzd2FybUZ1bmN0aW9uO1xuXHRyZXQubm90aWZ5ICAgICAgICAgID0gbm90aWZ5O1xuXHRyZXQuZ2V0SlNPTmFzeW5jICAgID0gZ2V0SlNPTmFzeW5jO1xuXHRyZXQudG9KU09OICAgICAgICAgID0gdG9KU09OO1xuXHRyZXQub2JzZXJ2ZSAgICAgICAgID0gb2JzZXJ2ZTtcblx0cmV0Lmluc3BlY3QgICAgICAgICA9IGluc3BlY3Q7XG5cdHJldC5qb2luICAgICAgICAgICAgPSBjcmVhdGVQYXJhbGxlbDtcblx0cmV0LnBhcmFsbGVsICAgICAgICA9IGNyZWF0ZVBhcmFsbGVsO1xuXHRyZXQuc2VyaWFsICAgICAgICAgID0gY3JlYXRlU2VyaWFsO1xuXHRyZXQudmFsdWVPZiAgICAgICAgID0gdmFsdWVPZjtcblx0cmV0LnVwZGF0ZSAgICAgICAgICA9IHVwZGF0ZTtcblx0cmV0LnJ1blBoYXNlICAgICAgICA9IHJ1blBoYXNlO1xuXHRyZXQub25SZXR1cm4gICAgICAgID0gd2FpdFJlc3VsdHM7XG5cdHJldC5vblJlc3VsdCAgICAgICAgPSB3YWl0UmVzdWx0cztcblx0cmV0LmFzeW5jUmV0dXJuICAgICA9IGFzeW5jUmV0dXJuO1xuXHRyZXQucmV0dXJuICAgICAgICAgID0gYXN5bmNSZXR1cm47XG5cdHJldC5nZXRJbm5lclZhbHVlICAgPSBnZXRJbm5lclZhbHVlO1xuXHRyZXQuaG9tZSAgICAgICAgICAgID0gaG9tZTtcblx0cmV0LnRvU3RyaW5nICAgICAgICA9IHRvU3RyaW5nO1xuXHRyZXQuY29uc3RydWN0b3IgICAgID0gY29uc3RydWN0b3I7XG5cblx0cmV0dXJuIHJldDtcblxufTsiLCJleHBvcnRzLmNyZWF0ZUZvck9iamVjdCA9IGZ1bmN0aW9uKHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0LCBsb2NhbElkKXtcblx0dmFyIHJldCA9IHJlcXVpcmUoXCIuL2Jhc2VcIikuY3JlYXRlRm9yT2JqZWN0KHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0LCBsb2NhbElkKTtcblxuXHRyZXQuc3dhcm0gICAgICAgICAgID0gbnVsbDtcblx0cmV0Lm9uUmV0dXJuICAgICAgICA9IG51bGw7XG5cdHJldC5vblJlc3VsdCAgICAgICAgPSBudWxsO1xuXHRyZXQuYXN5bmNSZXR1cm4gICAgID0gbnVsbDtcblx0cmV0LnJldHVybiAgICAgICAgICA9IG51bGw7XG5cdHJldC5ob21lICAgICAgICAgICAgPSBudWxsO1xuXG5cdHJldHVybiByZXQ7XG59OyIsImV4cG9ydHMuY3JlYXRlRm9yT2JqZWN0ID0gZnVuY3Rpb24odmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpe1xuXHRyZXR1cm4gcmVxdWlyZShcIi4vYmFzZVwiKS5jcmVhdGVGb3JPYmplY3QodmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpO1xufTsiLCIvKlxuSW5pdGlhbCBMaWNlbnNlOiAoYykgQXhpb2xvZ2ljIFJlc2VhcmNoICYgQWxib2FpZSBTw65uaWPEgy5cbkNvbnRyaWJ1dG9yczogQXhpb2xvZ2ljIFJlc2VhcmNoICwgUHJpdmF0ZVNreSBwcm9qZWN0XG5Db2RlIExpY2Vuc2U6IExHUEwgb3IgTUlULlxuKi9cblxudmFyIGZzID0gcmVxdWlyZShcImZzXCIpO1xudmFyIHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcblxuZnVuY3Rpb24gd3JhcENhbGwob3JpZ2luYWwsIHByZWZpeE5hbWUpe1xuICAgIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcInByZWZpeE5hbWVcIiwgcHJlZml4TmFtZSlcbiAgICAgICAgdmFyIHByZXZpb3VzUHJlZml4ID0gJCQubGlicmFyeVByZWZpeDtcbiAgICAgICAgJCQubGlicmFyeVByZWZpeCA9IHByZWZpeE5hbWU7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIHZhciByZXQgPSBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICQkLmxpYnJhcnlQcmVmaXggPSBwcmV2aW91c1ByZWZpeCA7XG4gICAgICAgIH1jYXRjaChlcnIpe1xuICAgICAgICAgICAgJCQubGlicmFyeVByZWZpeCA9IHByZXZpb3VzUHJlZml4IDtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gU3dhcm1MaWJyYXJ5KHByZWZpeE5hbWUsIGZvbGRlcil7XG4gICAgJCQubGlicmFyaWVzW3ByZWZpeE5hbWVdID0gdGhpczsgLy8gc28gb3RoZXIgY2FsbHMgZm9yIGxvYWRMaWJyYXJ5IHdpbGwgcmV0dXJuIGluc2lkZSBvZiB0aGUgZmlsZXNcbiAgICB2YXIgcHJlZml4ZWRSZXF1aXJlID0gd3JhcENhbGwoZnVuY3Rpb24ocGF0aCl7XG4gICAgICAgIHJldHVybiByZXF1aXJlKHBhdGgpO1xuICAgIH0sIHByZWZpeE5hbWUpO1xuXG4gICAgZnVuY3Rpb24gaW5jbHVkZUFsbEluUm9vdChmb2xkZXIsIHByZWZpeE5hbWUpIHtcbiAgICAgICAgLy92YXIgc3RhdCA9IGZzLnN0YXRTeW5jKHBhdGgpOyAvL1RPRE8gLS0gY2hlY2sgYWdhaW5zIGZvbGRlcnMgd2l0aCBleHRlbnNpb24gLmpzXG4gICAgICAgIHZhciBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGZvbGRlcik7XG4gICAgICAgIGZpbGVzLmZvckVhY2goZnVuY3Rpb24oZmlsZU5hbWUpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIkxvYWRpbmcgXCIsIGZpbGVOYW1lKTtcbiAgICAgICAgICAgIHZhciBleHQgPSBmaWxlTmFtZS5zdWJzdHIoZmlsZU5hbWUubGFzdEluZGV4T2YoJy4nKSArIDEpO1xuICAgICAgICAgICAgaWYoZXh0LnRvTG93ZXJDYXNlKCkgPT0gXCJqc1wiKXtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZnVsbFBhdGggPSBwYXRoLnJlc29sdmUoZm9sZGVyICsgXCIvXCIgKyBmaWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHByZWZpeGVkUmVxdWlyZShmdWxsUGF0aCk7XG4gICAgICAgICAgICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiB3cmFwU3dhcm1SZWxhdGVkRnVuY3Rpb25zKHNwYWNlLCBwcmVmaXhOYW1lKXtcbiAgICAgICAgdmFyIHJldCA9IHt9O1xuICAgICAgICB2YXIgbmFtZXMgPSBbXCJjcmVhdGVcIiwgXCJkZXNjcmliZVwiLCBcInN0YXJ0XCIsIFwicmVzdGFydFwiXTtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaTxuYW1lcy5sZW5ndGg7IGkrKyApe1xuICAgICAgICAgICAgcmV0W25hbWVzW2ldXSA9IHdyYXBDYWxsKHNwYWNlW25hbWVzW2ldXSwgcHJlZml4TmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICB0aGlzLmNhbGxmbG93cyAgICAgICAgPSB0aGlzLmNhbGxmbG93ICAgPSB3cmFwU3dhcm1SZWxhdGVkRnVuY3Rpb25zKCQkLmNhbGxmbG93cywgcHJlZml4TmFtZSk7XG4gICAgdGhpcy5zd2FybXMgICAgICAgICAgID0gdGhpcy5zd2FybSAgICAgID0gd3JhcFN3YXJtUmVsYXRlZEZ1bmN0aW9ucygkJC5zd2FybXMsIHByZWZpeE5hbWUpO1xuICAgIHRoaXMuY29udHJhY3RzICAgICAgICA9IHRoaXMuY29udHJhY3QgICA9IHdyYXBTd2FybVJlbGF0ZWRGdW5jdGlvbnMoJCQuY29udHJhY3RzLCBwcmVmaXhOYW1lKTtcbiAgICBpbmNsdWRlQWxsSW5Sb290KGZvbGRlciwgcHJlZml4TmFtZSk7XG59XG5cbmV4cG9ydHMubG9hZExpYnJhcnkgPSBmdW5jdGlvbihwcmVmaXhOYW1lLCBmb2xkZXIpe1xuICAgIHZhciBleGlzdGluZyA9ICQkLmxpYnJhcmllc1twcmVmaXhOYW1lXTtcbiAgICBpZihleGlzdGluZyApe1xuICAgICAgICBpZihmb2xkZXIpIHtcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci53YXJuaW5nKFwiUmV1c2luZyBhbHJlYWR5IGxvYWRlZCBsaWJyYXJ5IFwiICsgcHJlZml4TmFtZSArIFwiY291bGQgYmUgYW4gZXJyb3IhXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBleGlzdGluZztcbiAgICB9XG4gICAgdmFyIGFic29sdXRlUGF0aCA9IHBhdGgucmVzb2x2ZShmb2xkZXIpO1xuICAgIHJldHVybiBuZXcgU3dhcm1MaWJyYXJ5KHByZWZpeE5hbWUsIGFic29sdXRlUGF0aCk7XG59IiwiXG52YXIgam9pbkNvdW50ZXIgPSAwO1xuXG5mdW5jdGlvbiBQYXJhbGxlbEpvaW5Qb2ludChzd2FybSwgY2FsbGJhY2ssIGFyZ3Mpe1xuICAgIGpvaW5Db3VudGVyKys7XG4gICAgdmFyIGNoYW5uZWxJZCA9IFwiUGFyYWxsZWxKb2luUG9pbnRcIiArIGpvaW5Db3VudGVyO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgY291bnRlciA9IDA7XG4gICAgdmFyIHN0b3BPdGhlckV4ZWN1dGlvbiAgICAgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIGV4ZWN1dGlvblN0ZXAoc3RlcEZ1bmMsIGxvY2FsQXJncywgc3RvcCl7XG5cbiAgICAgICAgdGhpcy5kb0V4ZWN1dGUgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYoc3RvcE90aGVyRXhlY3V0aW9uKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgc3RlcEZ1bmMuYXBwbHkoc3dhcm0sIGxvY2FsQXJncyk7XG4gICAgICAgICAgICAgICAgaWYoc3RvcCl7XG4gICAgICAgICAgICAgICAgICAgIHN0b3BPdGhlckV4ZWN1dGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vZXZlcnl0aW5nIGlzIGZpbmVcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICBhcmdzLnVuc2hpZnQoZXJyKTtcbiAgICAgICAgICAgICAgICBzZW5kRm9yU291bmRFeGVjdXRpb24oY2FsbGJhY2ssIGFyZ3MsIHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy9zdG9wIGl0LCBkbyBub3QgY2FsbCBhZ2FpbiBhbnl0aGluZ1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IoXCJpbnZhbGlkIGpvaW5cIixzd2FybSwgXCJpbnZhbGlkIGZ1bmN0aW9uIGF0IGpvaW4gaW4gc3dhcm1cIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkJC5QU0tfUHViU3ViLnN1YnNjcmliZShjaGFubmVsSWQsZnVuY3Rpb24oZm9yRXhlY3V0aW9uKXtcbiAgICAgICAgaWYoc3RvcE90aGVyRXhlY3V0aW9uKXtcbiAgICAgICAgICAgIHJldHVybiA7XG4gICAgICAgIH1cblxuICAgICAgICB0cnl7XG4gICAgICAgICAgICBpZihmb3JFeGVjdXRpb24uZG9FeGVjdXRlKCkpe1xuICAgICAgICAgICAgICAgIGRlY0NvdW50ZXIoKTtcbiAgICAgICAgICAgIH0gLy8gaGFkIGFuIGVycm9yLi4uXG4gICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIC8vJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKFwiX19pbnRlcm5hbF9fXCIsc3dhcm0sIFwiZXhjZXB0aW9uIGluIHRoZSBleGVjdXRpb24gb2YgdGhlIGpvaW4gZnVuY3Rpb24gb2YgYSBwYXJhbGxlbCB0YXNrXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBpbmNDb3VudGVyKCl7XG4gICAgICAgIGlmKHRlc3RJZlVuZGVySW5zcGVjdGlvbigpKXtcbiAgICAgICAgICAgIC8vcHJldmVudGluZyBpbnNwZWN0b3IgZnJvbSBpbmNyZWFzaW5nIGNvdW50ZXIgd2hlbiByZWFkaW5nIHRoZSB2YWx1ZXMgZm9yIGRlYnVnIHJlYXNvblxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcInByZXZlbnRpbmcgaW5zcGVjdGlvblwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb3VudGVyKys7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGVzdElmVW5kZXJJbnNwZWN0aW9uKCl7XG4gICAgICAgIHZhciByZXMgPSBmYWxzZTtcbiAgICAgICAgdmFyIGNvbnN0QXJndiA9IHByb2Nlc3MuZXhlY0FyZ3Yuam9pbigpO1xuICAgICAgICBpZihjb25zdEFyZ3YuaW5kZXhPZihcImluc3BlY3RcIikhPT0tMSB8fCBjb25zdEFyZ3YuaW5kZXhPZihcImRlYnVnXCIpIT09LTEpe1xuICAgICAgICAgICAgLy9vbmx5IHdoZW4gcnVubmluZyBpbiBkZWJ1Z1xuICAgICAgICAgICAgdmFyIGNhbGxzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrO1xuICAgICAgICAgICAgaWYoY2FsbHN0YWNrLmluZGV4T2YoXCJEZWJ1Z0NvbW1hbmRQcm9jZXNzb3JcIikhPT0tMSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJEZWJ1Z0NvbW1hbmRQcm9jZXNzb3IgZGV0ZWN0ZWQhXCIpO1xuICAgICAgICAgICAgICAgIHJlcyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZW5kRm9yU291bmRFeGVjdXRpb24oZnVuY3QsIGFyZ3MsIHN0b3Ape1xuICAgICAgICB2YXIgb2JqID0gbmV3IGV4ZWN1dGlvblN0ZXAoZnVuY3QsIGFyZ3MsIHN0b3ApO1xuICAgICAgICAkJC5QU0tfUHViU3ViLnB1Ymxpc2goY2hhbm5lbElkLCBvYmopOyAvLyBmb3JjZSBleGVjdXRpb24gdG8gYmUgXCJzb3VuZFwiXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVjQ291bnRlcigpe1xuICAgICAgICBjb3VudGVyLS07XG4gICAgICAgIGlmKGNvdW50ZXIgPT0gMCkge1xuICAgICAgICAgICAgYXJncy51bnNoaWZ0KG51bGwpO1xuICAgICAgICAgICAgc2VuZEZvclNvdW5kRXhlY3V0aW9uKGNhbGxiYWNrLCBhcmdzLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaW5uZXIgPSBzd2FybS5nZXRJbm5lclZhbHVlKCk7XG5cbiAgICBmdW5jdGlvbiBkZWZhdWx0UHJvZ3Jlc3NSZXBvcnQoZXJyLCByZXMpe1xuICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGV4dDpcIlBhcmFsbGVsIGV4ZWN1dGlvbiBwcm9ncmVzcyBldmVudFwiLFxuICAgICAgICAgICAgc3dhcm06c3dhcm0sXG4gICAgICAgICAgICBhcmdzOmFyZ3MsXG4gICAgICAgICAgICBjdXJyZW50UmVzdWx0OnJlc1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1rRnVuY3Rpb24obmFtZSl7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKXtcbiAgICAgICAgICAgIHZhciBmID0gZGVmYXVsdFByb2dyZXNzUmVwb3J0O1xuICAgICAgICAgICAgaWYobmFtZSAhPSBcInByb2dyZXNzXCIpe1xuICAgICAgICAgICAgICAgIGYgPSBpbm5lci5teUZ1bmN0aW9uc1tuYW1lXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcmdzID0gJCQuX19pbnRlcm4ubWtBcmdzKGFyZ3MsIDApO1xuICAgICAgICAgICAgc2VuZEZvclNvdW5kRXhlY3V0aW9uKGYsIGFyZ3MsIGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybiBfX3Byb3h5T2JqZWN0O1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICB0aGlzLmdldCA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpe1xuICAgICAgICBpZihpbm5lci5teUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wKSB8fCBwcm9wID09IFwicHJvZ3Jlc3NcIil7XG4gICAgICAgICAgICBpbmNDb3VudGVyKCk7XG4gICAgICAgICAgICByZXR1cm4gbWtGdW5jdGlvbihwcm9wKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3dhcm1bcHJvcF07XG4gICAgfTtcblxuICAgIHZhciBfX3Byb3h5T2JqZWN0O1xuXG4gICAgdGhpcy5fX3NldFByb3h5T2JqZWN0ID0gZnVuY3Rpb24ocCl7XG4gICAgICAgIF9fcHJveHlPYmplY3QgPSBwO1xuICAgIH1cbn1cblxuZXhwb3J0cy5jcmVhdGVKb2luUG9pbnQgPSBmdW5jdGlvbihzd2FybSwgY2FsbGJhY2ssIGFyZ3Mpe1xuICAgIHZhciBqcCA9IG5ldyBQYXJhbGxlbEpvaW5Qb2ludChzd2FybSwgY2FsbGJhY2ssIGFyZ3MpO1xuICAgIHZhciBpbm5lciA9IHN3YXJtLmdldElubmVyVmFsdWUoKTtcbiAgICB2YXIgcCA9IG5ldyBQcm94eShpbm5lciwganApO1xuICAgIGpwLl9fc2V0UHJveHlPYmplY3QocCk7XG4gICAgcmV0dXJuIHA7XG59OyIsIlxuZnVuY3Rpb24gZW5jb2RlKGJ1ZmZlcikge1xuICAgIHJldHVybiBidWZmZXIudG9TdHJpbmcoJ2Jhc2U2NCcpXG4gICAgICAgIC5yZXBsYWNlKC9cXCsvZywgJycpXG4gICAgICAgIC5yZXBsYWNlKC9cXC8vZywgJycpXG4gICAgICAgIC5yZXBsYWNlKC89KyQvLCAnJyk7XG59O1xuXG5mdW5jdGlvbiBzdGFtcFdpdGhUaW1lKGJ1Ziwgc2FsdCwgbXNhbHQpe1xuICAgIGlmKCFzYWx0KXtcbiAgICAgICAgc2FsdCA9IDE7XG4gICAgfVxuICAgIGlmKCFtc2FsdCl7XG4gICAgICAgIG1zYWx0ID0gMTtcbiAgICB9XG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZTtcbiAgICB2YXIgY3QgPSBNYXRoLmZsb29yKGRhdGUuZ2V0VGltZSgpIC8gc2FsdCk7XG4gICAgdmFyIGNvdW50ZXIgPSAwO1xuICAgIHdoaWxlKGN0ID4gMCApe1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiQ291bnRlclwiLCBjb3VudGVyLCBjdCk7XG4gICAgICAgIGJ1Zltjb3VudGVyKm1zYWx0XSA9IE1hdGguZmxvb3IoY3QgJSAyNTYpO1xuICAgICAgICBjdCA9IE1hdGguZmxvb3IoY3QgLyAyNTYpO1xuICAgICAgICBjb3VudGVyKys7XG4gICAgfVxufVxuXG4vKlxuICAgIFRoZSB1aWQgY29udGFpbnMgYXJvdW5kIDI1NiBiaXRzIG9mIHJhbmRvbW5lc3MgYW5kIGFyZSB1bmlxdWUgYXQgdGhlIGxldmVsIG9mIHNlY29uZHMuIFRoaXMgVVVJRCBzaG91bGQgYnkgY3J5cHRvZ3JhcGhpY2FsbHkgc2FmZSAoY2FuIG5vdCBiZSBndWVzc2VkKVxuXG4gICAgV2UgZ2VuZXJhdGUgYSBzYWZlIFVJRCB0aGF0IGlzIGd1YXJhbnRlZWQgdW5pcXVlIChieSB1c2FnZSBvZiBhIFBSTkcgdG8gZ2VuZWF0ZSAyNTYgYml0cykgYW5kIHRpbWUgc3RhbXBpbmcgd2l0aCB0aGUgbnVtYmVyIG9mIHNlY29uZHMgYXQgdGhlIG1vbWVudCB3aGVuIGlzIGdlbmVyYXRlZFxuICAgIFRoaXMgbWV0aG9kIHNob3VsZCBiZSBzYWZlIHRvIHVzZSBhdCB0aGUgbGV2ZWwgb2YgdmVyeSBsYXJnZSBkaXN0cmlidXRlZCBzeXN0ZW1zLlxuICAgIFRoZSBVVUlEIGlzIHN0YW1wZWQgd2l0aCB0aW1lIChzZWNvbmRzKTogZG9lcyBpdCBvcGVuIGEgd2F5IHRvIGd1ZXNzIHRoZSBVVUlEPyBJdCBkZXBlbmRzIGhvdyBzYWZlIGlzIFwiY3J5cHRvXCIgUFJORywgYnV0IGl0IHNob3VsZCBiZSBubyBwcm9ibGVtLi4uXG5cbiAqL1xuXG5leHBvcnRzLnNhZmVfdXVpZCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgcmVxdWlyZSgnY3J5cHRvJykucmFuZG9tQnl0ZXMoMzYsIGZ1bmN0aW9uIChlcnIsIGJ1Zikge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN0YW1wV2l0aFRpbWUoYnVmLCAxMDAwLCAzKTtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgZW5jb2RlKGJ1ZikpO1xuICAgIH0pO1xufVxuXG5cbi8qXG4gICAgVHJ5IHRvIGdlbmVyYXRlIGEgc21hbGwgVUlEIHRoYXQgaXMgdW5pcXVlIGFnYWluc3QgY2hhbmNlIGluIHRoZSBzYW1lIG1pbGxpc2Vjb25kIHNlY29uZCBhbmQgaW4gYSBzcGVjaWZpYyBjb250ZXh0IChlZyBpbiB0aGUgc2FtZSBjaG9yZW9ncmFwaHkgZXhlY3V0aW9uKVxuICAgIFRoZSBpZCBjb250YWlucyBhcm91bmQgNio4ID0gNDggIGJpdHMgb2YgcmFuZG9tbmVzcyBhbmQgYXJlIHVuaXF1ZSBhdCB0aGUgbGV2ZWwgb2YgbWlsbGlzZWNvbmRzXG4gICAgVGhpcyBtZXRob2QgaXMgc2FmZSBvbiBhIHNpbmdsZSBjb21wdXRlciBidXQgc2hvdWxkIGJlIHVzZWQgd2l0aCBjYXJlIG90aGVyd2lzZVxuICAgIFRoaXMgVVVJRCBpcyBub3QgY3J5cHRvZ3JhcGhpY2FsbHkgc2FmZSAoY2FuIGJlIGd1ZXNzZWQpXG4gKi9cbmV4cG9ydHMuc2hvcnRfdXVpZCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgcmVxdWlyZSgnY3J5cHRvJykucmFuZG9tQnl0ZXMoMTIsIGZ1bmN0aW9uIChlcnIsIGJ1Zikge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN0YW1wV2l0aFRpbWUoYnVmLDEsMik7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIGVuY29kZShidWYpKTtcbiAgICB9KTtcbn0iLCJcbnZhciBqb2luQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIFNlcmlhbEpvaW5Qb2ludChzd2FybSwgY2FsbGJhY2ssIGFyZ3Mpe1xuXG4gICAgam9pbkNvdW50ZXIrKztcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgY2hhbm5lbElkID0gXCJTZXJpYWxKb2luUG9pbnRcIiArIGpvaW5Db3VudGVyO1xuXG4gICAgaWYodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IoXCJ1bmtub3duXCIsIHN3YXJtLCBcImludmFsaWQgZnVuY3Rpb24gZ2l2ZW4gdG8gc2VyaWFsIGluIHN3YXJtXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xuXG5cbiAgICBmdW5jdGlvbiBkZWZhdWx0UHJvZ3Jlc3NSZXBvcnQoZXJyLCByZXMpe1xuICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuXG4gICAgdmFyIGZ1bmN0aW9uQ291bnRlciAgICAgPSAwO1xuICAgIHZhciBleGVjdXRpb25Db3VudGVyICAgID0gMDtcblxuICAgIHZhciBwbGFubmVkRXhlY3V0aW9ucyAgID0gW107XG4gICAgdmFyIHBsYW5uZWRBcmd1bWVudHMgICAgPSB7fTtcblxuICAgIGZ1bmN0aW9uIG1rRnVuY3Rpb24obmFtZSwgcG9zKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkNyZWF0aW5nIGZ1bmN0aW9uIFwiLCBuYW1lLCBwb3MpO1xuICAgICAgICBwbGFubmVkQXJndW1lbnRzW3Bvc10gPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgZnVuY3Rpb24gdHJpZ2dldE5leHRTdGVwKCl7XG4gICAgICAgICAgICBpZihwbGFubmVkRXhlY3V0aW9ucy5sZW5ndGggPT0gZXhlY3V0aW9uQ291bnRlciB8fCBwbGFubmVkQXJndW1lbnRzW2V4ZWN1dGlvbkNvdW50ZXJdICkgIHtcbiAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLnB1Ymxpc2goY2hhbm5lbElkLCBzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmID0gZnVuY3Rpb24gKC4uLmFyZ3Mpe1xuICAgICAgICAgICAgaWYoZXhlY3V0aW9uQ291bnRlciAhPSBwb3MpIHtcbiAgICAgICAgICAgICAgICBwbGFubmVkQXJndW1lbnRzW3Bvc10gPSBhcmdzO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJEZWxheWluZyBmdW5jdGlvbjpcIiwgZXhlY3V0aW9uQ291bnRlciwgcG9zLCBwbGFubmVkQXJndW1lbnRzLCBhcmd1bWVudHMsIGZ1bmN0aW9uQ291bnRlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9fcHJveHk7XG4gICAgICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICAgICAgaWYocGxhbm5lZEFyZ3VtZW50c1twb3NdKXtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIkV4ZWN1dGluZyAgZnVuY3Rpb246XCIsIGV4ZWN1dGlvbkNvdW50ZXIsIHBvcywgcGxhbm5lZEFyZ3VtZW50cywgYXJndW1lbnRzLCBmdW5jdGlvbkNvdW50ZXIpO1xuXHRcdFx0XHRcdGFyZ3MgPSBwbGFubmVkQXJndW1lbnRzW3Bvc107XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGxhbm5lZEFyZ3VtZW50c1twb3NdID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgdHJpZ2dldE5leHRTdGVwKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfX3Byb3h5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGYgPSBkZWZhdWx0UHJvZ3Jlc3NSZXBvcnQ7XG4gICAgICAgICAgICBpZihuYW1lICE9IFwicHJvZ3Jlc3NcIil7XG4gICAgICAgICAgICAgICAgZiA9IGlubmVyLm15RnVuY3Rpb25zW25hbWVdO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBmLmFwcGx5KHNlbGYsYXJncyk7XG4gICAgICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MudW5zaGlmdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShzd2FybSxhcmdzKTsgLy9lcnJvclxuICAgICAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLnVuc3Vic2NyaWJlKGNoYW5uZWxJZCxydW5OZXh0RnVuY3Rpb24pO1xuICAgICAgICAgICAgICAgIHJldHVybjsgLy90ZXJtaW5hdGUgZXhlY3V0aW9uIHdpdGggYW4gZXJyb3IuLi4hXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBleGVjdXRpb25Db3VudGVyKys7XG5cbiAgICAgICAgICAgIHRyaWdnZXROZXh0U3RlcCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gX19wcm94eTtcbiAgICAgICAgfTtcblxuICAgICAgICBwbGFubmVkRXhlY3V0aW9ucy5wdXNoKGYpO1xuICAgICAgICBmdW5jdGlvbkNvdW50ZXIrKztcbiAgICAgICAgcmV0dXJuIGY7XG4gICAgfVxuXG4gICAgIHZhciBmaW5pc2hlZCA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gcnVuTmV4dEZ1bmN0aW9uKCl7XG4gICAgICAgIGlmKGV4ZWN1dGlvbkNvdW50ZXIgPT0gcGxhbm5lZEV4ZWN1dGlvbnMubGVuZ3RoICl7XG4gICAgICAgICAgICBpZighZmluaXNoZWQpe1xuICAgICAgICAgICAgICAgIGFyZ3MudW5zaGlmdChudWxsKTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShzd2FybSxhcmdzKTtcbiAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgJCQuUFNLX1B1YlN1Yi51bnN1YnNjcmliZShjaGFubmVsSWQscnVuTmV4dEZ1bmN0aW9uKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzZXJpYWwgY29uc3RydWN0IGlzIHVzaW5nIGZ1bmN0aW9ucyB0aGF0IGFyZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMuLi5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwbGFubmVkRXhlY3V0aW9uc1tleGVjdXRpb25Db3VudGVyXSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgJCQuUFNLX1B1YlN1Yi5zdWJzY3JpYmUoY2hhbm5lbElkLHJ1bk5leHRGdW5jdGlvbik7IC8vIGZvcmNlIGl0IHRvIGJlIFwic291bmRcIlxuXG5cbiAgICB0aGlzLmdldCA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpe1xuICAgICAgICBpZihwcm9wID09IFwicHJvZ3Jlc3NcIiB8fCBpbm5lci5teUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wKSl7XG4gICAgICAgICAgICByZXR1cm4gbWtGdW5jdGlvbihwcm9wLCBmdW5jdGlvbkNvdW50ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzd2FybVtwcm9wXTtcbiAgICB9XG5cbiAgICB2YXIgX19wcm94eTtcbiAgICB0aGlzLnNldFByb3h5T2JqZWN0ID0gZnVuY3Rpb24ocCl7XG4gICAgICAgIF9fcHJveHkgPSBwO1xuICAgIH1cbn1cblxuZXhwb3J0cy5jcmVhdGVTZXJpYWxKb2luUG9pbnQgPSBmdW5jdGlvbihzd2FybSwgY2FsbGJhY2ssIGFyZ3Mpe1xuICAgIHZhciBqcCA9IG5ldyBTZXJpYWxKb2luUG9pbnQoc3dhcm0sIGNhbGxiYWNrLCBhcmdzKTtcbiAgICB2YXIgaW5uZXIgPSBzd2FybS5nZXRJbm5lclZhbHVlKCk7XG4gICAgdmFyIHAgPSBuZXcgUHJveHkoaW5uZXIsIGpwKTtcbiAgICBqcC5zZXRQcm94eU9iamVjdChwKTtcbiAgICByZXR1cm4gcDtcbn0iLCJmdW5jdGlvbiBTd2FybVNwYWNlKHN3YXJtVHlwZSwgdXRpbHMpIHtcblxuICAgIHZhciBiZWVzSGVhbGVyID0gJCQucmVxdWlyZShcInNvdW5kcHVic3ViXCIpLmJlZXNIZWFsZXI7XG5cbiAgICBmdW5jdGlvbiBnZXRGdWxsTmFtZShzaG9ydE5hbWUpe1xuICAgICAgICB2YXIgZnVsbE5hbWU7XG4gICAgICAgIGlmKHNob3J0TmFtZSAmJiBzaG9ydE5hbWUuaW5jbHVkZXMoXCIuXCIpKSB7XG4gICAgICAgICAgICBmdWxsTmFtZSA9IHNob3J0TmFtZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZ1bGxOYW1lID0gJCQubGlicmFyeVByZWZpeCArIFwiLlwiICsgc2hvcnROYW1lOyAvL1RPRE86IGNoZWNrIG1vcmUgYWJvdXQgLiAhP1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdWxsTmFtZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBWYXJEZXNjcmlwdGlvbihkZXNjKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGluaXQ6ZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3RvcmU6ZnVuY3Rpb24oanNvblN0cmluZyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoanNvblN0cmluZyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdG9Kc29uU3RyaW5nOmZ1bmN0aW9uKHgpe1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIFN3YXJtRGVzY3JpcHRpb24oc3dhcm1UeXBlTmFtZSwgZGVzY3JpcHRpb24pe1xuXG4gICAgICAgIHN3YXJtVHlwZU5hbWUgPSBnZXRGdWxsTmFtZShzd2FybVR5cGVOYW1lKTtcblxuICAgICAgICB2YXIgbG9jYWxJZCA9IDA7ICAvLyB1bmlxdWUgZm9yIGVhY2ggc3dhcm1cblxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVWYXJzKGRlc2NyKXtcbiAgICAgICAgICAgIHZhciBtZW1iZXJzID0ge307XG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gZGVzY3Ipe1xuICAgICAgICAgICAgICAgIG1lbWJlcnNbdl0gPSBuZXcgVmFyRGVzY3JpcHRpb24oZGVzY3Jbdl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1lbWJlcnM7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVNZW1iZXJzKGRlc2NyKXtcbiAgICAgICAgICAgIHZhciBtZW1iZXJzID0ge307XG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gZGVzY3JpcHRpb24pe1xuXG4gICAgICAgICAgICAgICAgaWYodiAhPSBcInB1YmxpY1wiICYmIHYgIT0gXCJwcml2YXRlXCIpe1xuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzW3ZdID0gZGVzY3JpcHRpb25bdl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1lbWJlcnM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcHVibGljVmFycyA9IGNyZWF0ZVZhcnMoZGVzY3JpcHRpb24ucHVibGljKTtcbiAgICAgICAgdmFyIHByaXZhdGVWYXJzID0gY3JlYXRlVmFycyhkZXNjcmlwdGlvbi5wcml2YXRlKTtcbiAgICAgICAgdmFyIG15RnVuY3Rpb25zID0gY3JlYXRlTWVtYmVycyhkZXNjcmlwdGlvbik7XG5cbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlUGhhc2UodGhpc0luc3RhbmNlLCBmdW5jKXtcbiAgICAgICAgICAgIHZhciBwaGFzZSA9IGZ1bmN0aW9uKC4uLmFyZ3Mpe1xuICAgICAgICAgICAgICAgIHZhciByZXQ7XG4gICAgICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLmJsb2NrQ2FsbEJhY2tzKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldCA9IGZ1bmMuYXBwbHkodGhpc0luc3RhbmNlLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgJCQuUFNLX1B1YlN1Yi5yZWxlYXNlQ2FsbEJhY2tzKCk7XG4gICAgICAgICAgICAgICAgfWNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIucmVsZWFzZUNhbGxCYWNrcygpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2R5bmFtaWMgbmFtZWQgZnVuYyBpbiBvcmRlciB0byBpbXByb3ZlIGNhbGxzdGFja1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHBoYXNlLCBcIm5hbWVcIiwge2dldDogZnVuY3Rpb24oKXtyZXR1cm4gc3dhcm1UeXBlTmFtZStcIi5cIitmdW5jLm5hbWV9fSk7XG4gICAgICAgICAgICByZXR1cm4gcGhhc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluaXRpYWxpc2UgPSBmdW5jdGlvbihzZXJpYWxpc2VkVmFsdWVzKXtcblxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBwdWJsaWNWYXJzOntcblxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcHJpdmF0ZVZhcnM6e1xuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwcm90ZWN0ZWRWYXJzOntcblxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbXlGdW5jdGlvbnM6e1xuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB1dGlsaXR5RnVuY3Rpb25zOntcblxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbWV0YTp7XG4gICAgICAgICAgICAgICAgICAgIHN3YXJtVHlwZU5hbWU6c3dhcm1UeXBlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1EZXNjcmlwdGlvbjpkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cblxuICAgICAgICAgICAgZm9yKHZhciB2IGluIHB1YmxpY1ZhcnMpe1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdWJsaWNWYXJzW3ZdID0gcHVibGljVmFyc1t2XS5pbml0KCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gcHJpdmF0ZVZhcnMpe1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wcml2YXRlVmFyc1t2XSA9IHByaXZhdGVWYXJzW3ZdLmluaXQoKTtcbiAgICAgICAgICAgIH07XG5cblxuICAgICAgICAgICAgaWYoc2VyaWFsaXNlZFZhbHVlcyl7XG4gICAgICAgICAgICAgICAgYmVlc0hlYWxlci5qc29uVG9OYXRpdmUoc2VyaWFsaXNlZFZhbHVlcywgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pbml0aWFsaXNlRnVuY3Rpb25zID0gZnVuY3Rpb24odmFsdWVPYmplY3QsIHRoaXNPYmplY3Qpe1xuXG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gbXlGdW5jdGlvbnMpe1xuICAgICAgICAgICAgICAgIHZhbHVlT2JqZWN0Lm15RnVuY3Rpb25zW3ZdID0gY3JlYXRlUGhhc2UodGhpc09iamVjdCwgbXlGdW5jdGlvbnNbdl0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbG9jYWxJZCsrO1xuICAgICAgICAgICAgdmFsdWVPYmplY3QudXRpbGl0eUZ1bmN0aW9ucyA9IHV0aWxzLmNyZWF0ZUZvck9iamVjdCh2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpe1xuXG5cbiAgICAgICAgICAgIGlmKHB1YmxpY1ZhcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQucHVibGljVmFyc1twcm9wZXJ0eV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHByaXZhdGVWYXJzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnByaXZhdGVWYXJzW3Byb3BlcnR5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGFyZ2V0LnV0aWxpdHlGdW5jdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxuICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC51dGlsaXR5RnVuY3Rpb25zW3Byb3BlcnR5XTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICBpZihteUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5teUZ1bmN0aW9uc1twcm9wZXJ0eV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRhcmdldC5wcm90ZWN0ZWRWYXJzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnByb3RlY3RlZFZhcnNbcHJvcGVydHldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0eXBlb2YgcHJvcGVydHkgIT0gXCJzeW1ib2xcIikge1xuICAgICAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihwcm9wZXJ0eSwgdGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldCA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcil7XG5cbiAgICAgICAgICAgIGlmKHRhcmdldC51dGlsaXR5RnVuY3Rpb25zLmhhc093blByb3BlcnR5KHByb3BlcnR5KSB8fCB0YXJnZXQubXlGdW5jdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XG4gICAgICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKHByb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUcnlpbmcgdG8gb3ZlcndyaXRlIGltbXV0YWJsZSBtZW1iZXJcIiArIHByb3BlcnR5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYocHJpdmF0ZVZhcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRhcmdldC5wcml2YXRlVmFyc1twcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgaWYocHVibGljVmFycy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnB1YmxpY1ZhcnNbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldC5wcm90ZWN0ZWRWYXJzW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFwcGx5ID0gZnVuY3Rpb24odGFyZ2V0LCB0aGlzQXJnLCBhcmd1bWVudHNMaXN0KXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUHJveHkgYXBwbHlcIik7XG4gICAgICAgICAgICAvL3ZhciBmdW5jID0gdGFyZ2V0W11cbiAgICAgICAgICAgIC8vc3dhcm1HbG9iYWxzLmV4ZWN1dGlvblByb3ZpZGVyLmV4ZWN1dGUobnVsbCwgdGhpc0FyZywgZnVuYywgYXJndW1lbnRzTGlzdClcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmlzRXh0ZW5zaWJsZSA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaGFzID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgICAgICBpZih0YXJnZXQucHVibGljVmFyc1twcm9wXSB8fCB0YXJnZXQucHJvdGVjdGVkVmFyc1twcm9wXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub3duS2V5cyA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3Qub3duS2V5cyh0YXJnZXQucHVibGljVmFycyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNlcmlhbGlzZWRWYWx1ZXMpe1xuICAgICAgICAgICAgdmFyIHZhbHVlT2JqZWN0ID0gc2VsZi5pbml0aWFsaXNlKHNlcmlhbGlzZWRWYWx1ZXMpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBQcm94eSh2YWx1ZU9iamVjdCxzZWxmKTtcbiAgICAgICAgICAgIHNlbGYuaW5pdGlhbGlzZUZ1bmN0aW9ucyh2YWx1ZU9iamVjdCxyZXN1bHQpO1xuICAgICAgICAgICAgaWYoIXNlcmlhbGlzZWRWYWx1ZXMpe1xuICAgICAgICAgICAgICAgICQkLnVpZEdlbmVyYXRvci5zYWZlX3V1aWQoZnVuY3Rpb24gKGVyciwgcmVzdWx0KXtcbiAgICAgICAgICAgICAgICAgICAgaWYoIXZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1JZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZU9iamVjdC5tZXRhLnN3YXJtSWQgPSByZXN1bHQ7ICAvL2RvIG5vdCBvdmVyd3JpdGUhISFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZU9iamVjdC51dGlsaXR5RnVuY3Rpb25zLm5vdGlmeSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBkZXNjcmlwdGlvbnMgPSB7fTtcblxuICAgIHRoaXMuZGVzY3JpYmUgPSBmdW5jdGlvbiBkZXNjcmliZVN3YXJtKHN3YXJtVHlwZU5hbWUsIGRlc2NyaXB0aW9uKXtcbiAgICAgICAgc3dhcm1UeXBlTmFtZSA9IGdldEZ1bGxOYW1lKHN3YXJtVHlwZU5hbWUpO1xuXG4gICAgICAgIHZhciBwb2ludFBvcyA9IHN3YXJtVHlwZU5hbWUubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgICAgdmFyIHNob3J0TmFtZSA9IHN3YXJtVHlwZU5hbWUuc3Vic3RyKCBwb2ludFBvcysgMSk7XG4gICAgICAgIHZhciBsaWJyYXJ5TmFtZSA9IHN3YXJtVHlwZU5hbWUuc3Vic3RyKDAsIHBvaW50UG9zKTtcbiAgICAgICAgaWYoIWxpYnJhcnlOYW1lKXtcbiAgICAgICAgICAgIGxpYnJhcnlOYW1lID0gXCJnbG9iYWxcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkZXNjcmlwdGlvbiA9IG5ldyBTd2FybURlc2NyaXB0aW9uKHN3YXJtVHlwZU5hbWUsIGRlc2NyaXB0aW9uKTtcbiAgICAgICAgaWYoZGVzY3JpcHRpb25zW3N3YXJtVHlwZU5hbWVdICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIud2FybmluZyhcIkR1cGxpY2F0ZSBzd2FybSBkZXNjcmlwdGlvbiBcIisgc3dhcm1UeXBlTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBkZXNjcmlwdGlvbnNbc3dhcm1UeXBlTmFtZV0gPSBkZXNjcmlwdGlvbjtcblxuICAgICAgICBpZigkJC5yZWdpc3RlclN3YXJtRGVzY3JpcHRpb24pe1xuXHRcdFx0JCQucmVnaXN0ZXJTd2FybURlc2NyaXB0aW9uKGxpYnJhcnlOYW1lLCBzaG9ydE5hbWUsIHN3YXJtVHlwZU5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXNjcmlwdGlvbjtcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZVN3YXJtKHN3YXJtVHlwZU5hbWUsIGRlc2NyaXB0aW9uLCBpbml0aWFsVmFsdWVzKXtcbiAgICAgICAgc3dhcm1UeXBlTmFtZSA9IGdldEZ1bGxOYW1lKHN3YXJtVHlwZU5hbWUpO1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICBpZih1bmRlZmluZWQgPT0gZGVzY3JpcHRpb24pe1xuICAgICAgICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnNbc3dhcm1UeXBlTmFtZV0oaW5pdGlhbFZhbHVlcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRlc2NyaWJlKHN3YXJtVHlwZU5hbWUsIGRlc2NyaXB0aW9uKShpbml0aWFsVmFsdWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDcmVhdGVTd2FybSBlcnJvclwiLCBlcnIpO1xuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLmVycm9yKGVyciwgYXJndW1lbnRzLCBcIldyb25nIG5hbWUgb3IgZGVzY3JpcHRpb25zXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yZXN0YXJ0ID0gZnVuY3Rpb24oc3dhcm1UeXBlTmFtZSwgaW5pdGlhbFZhbHVlcyl7XG4gICAgICAgIHN3YXJtVHlwZU5hbWUgPSBnZXRGdWxsTmFtZShzd2FybVR5cGVOYW1lKTtcbiAgICAgICAgdmFyIGRlc2MgPSBkZXNjcmlwdGlvbnNbc3dhcm1UeXBlTmFtZV07XG5cbiAgICAgICAgaWYoZGVzYyl7XG4gICAgICAgICAgICByZXR1cm4gZGVzYyhpbml0aWFsVmFsdWVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihzd2FybVR5cGVOYW1lLGluaXRpYWxWYWx1ZXMsXG4gICAgICAgICAgICAgICAgXCJGYWlsZWQgdG8gcmVzdGFydCBhIHN3YXJtIHdpdGggdHlwZSBcIiArIHN3YXJtVHlwZU5hbWUgKyBcIlxcbiBNYXliZSBkaWZmcmVudCBzd2FybSBzcGFjZSAodXNlZCBmbG93IGluc3RlYWQgb2Ygc3dhcm0hPylcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oc3dhcm1UeXBlTmFtZSwgLi4ucGFyYW1zKXtcbiAgICAgICAgc3dhcm1UeXBlTmFtZSA9IGdldEZ1bGxOYW1lKHN3YXJtVHlwZU5hbWUpO1xuICAgICAgICB2YXIgZGVzYyA9IGRlc2NyaXB0aW9uc1tzd2FybVR5cGVOYW1lXTtcbiAgICAgICAgaWYoIWRlc2Mpe1xuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKG51bGwsIHN3YXJtVHlwZU5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlcyA9IGRlc2MoKTtcblxuICAgICAgICBpZihwYXJhbXMubGVuZ3RoID4gMSl7XG4gICAgICAgICAgICB2YXIgYXJncyA9W107XG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwO2kgPCBwYXJhbXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIGFyZ3MucHVzaChwYXJhbXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzLnN3YXJtLmFwcGx5KHJlcywgYXJncyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbn1cblxuZXhwb3J0cy5jcmVhdGVTd2FybUVuZ2luZSA9IGZ1bmN0aW9uKHN3YXJtVHlwZSwgdXRpbHMpe1xuICAgIGlmKHR5cGVvZiB1dGlscyA9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgdXRpbHMgPSByZXF1aXJlKFwiLi9jaG9yZW9ncmFwaGllcy91dGlsaXR5RnVuY3Rpb25zL2NhbGxmbG93XCIpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN3YXJtU3BhY2Uoc3dhcm1UeXBlLCB1dGlscyk7XG59OyIsImlmKHR5cGVvZiBzaW5nbGV0b25fY29udGFpbmVyX21vZHVsZV93b3JrYXJvdW5kX2Zvcl93aXJlZF9ub2RlX2pzX2NhY2hpbmcgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzaW5nbGV0b25fY29udGFpbmVyX21vZHVsZV93b3JrYXJvdW5kX2Zvcl93aXJlZF9ub2RlX2pzX2NhY2hpbmcgICA9IG1vZHVsZTtcbn0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzaW5nbGV0b25fY29udGFpbmVyX21vZHVsZV93b3JrYXJvdW5kX2Zvcl93aXJlZF9ub2RlX2pzX2NhY2hpbmcgLmV4cG9ydHM7XG4gICAgcmV0dXJuIG1vZHVsZTtcbn1cblxuLyoqXG4gKiBDcmVhdGVkIGJ5IHNhbGJvYWllIG9uIDQvMjcvMTUuXG4gKi9cbmZ1bmN0aW9uIENvbnRhaW5lcihlcnJvckhhbmRsZXIpe1xuICAgIHZhciB0aGluZ3MgPSB7fTsgICAgICAgIC8vdGhlIGFjdHVhbCB2YWx1ZXMgZm9yIG91ciBzZXJ2aWNlcywgdGhpbmdzXG4gICAgdmFyIGltbWVkaWF0ZSA9IHt9OyAgICAgLy9ob3cgZGVwZW5kZW5jaWVzIHdlcmUgZGVjbGFyZWRcbiAgICB2YXIgY2FsbGJhY2tzID0ge307ICAgICAvL2NhbGxiYWNrIHRoYXQgc2hvdWxkIGJlIGNhbGxlZCBmb3IgZWFjaCBkZXBlbmRlbmN5IGRlY2xhcmF0aW9uXG4gICAgdmFyIGRlcHNDb3VudGVyID0ge307ICAgLy9jb3VudCBkZXBlbmRlbmNpZXNcbiAgICB2YXIgcmV2ZXJzZWRUcmVlID0ge307ICAvL3JldmVyc2VkIGRlcGVuZGVuY2llcywgb3Bwb3NpdGUgb2YgaW1tZWRpYXRlIG9iamVjdFxuXG4gICAgIHRoaXMuZHVtcCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICBjb25zb2xlLmxvZyhcIkNvbmF0aW5lciBkdW1wXFxuIFRoaW5nczpcIiwgdGhpbmdzLCBcIlxcbkRlcHMgY291bnRlcjogXCIsIGRlcHNDb3VudGVyLCBcIlxcblN0cmlnaHQ6XCIsIGltbWVkaWF0ZSwgXCJcXG5SZXZlcnNlZDpcIiwgcmV2ZXJzZWRUcmVlKTtcbiAgICAgfVxuXG4gICAgZnVuY3Rpb24gaW5jQ291bnRlcihuYW1lKXtcbiAgICAgICAgaWYoIWRlcHNDb3VudGVyW25hbWVdKXtcbiAgICAgICAgICAgIGRlcHNDb3VudGVyW25hbWVdID0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlcHNDb3VudGVyW25hbWVdKys7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnNlcnREZXBlbmRlbmN5aW5SVChub2RlTmFtZSwgZGVwZW5kZW5jaWVzKXtcbiAgICAgICAgZGVwZW5kZW5jaWVzLmZvckVhY2goZnVuY3Rpb24oaXRlbU5hbWUpe1xuICAgICAgICAgICAgdmFyIGwgPSByZXZlcnNlZFRyZWVbaXRlbU5hbWVdO1xuICAgICAgICAgICAgaWYoIWwpe1xuICAgICAgICAgICAgICAgIGwgPSByZXZlcnNlZFRyZWVbaXRlbU5hbWVdID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsW25vZGVOYW1lXSA9IG5vZGVOYW1lO1xuICAgICAgICB9KVxuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gZGlzY292ZXJVcE5vZGVzKG5vZGVOYW1lKXtcbiAgICAgICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgICAgIGZ1bmN0aW9uIERGUyhubil7XG4gICAgICAgICAgICB2YXIgbCA9IHJldmVyc2VkVHJlZVtubl07XG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gbCl7XG4gICAgICAgICAgICAgICAgaWYoIXJlc1tpXSl7XG4gICAgICAgICAgICAgICAgICAgIHJlc1tpXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIERGUyhpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBERlMobm9kZU5hbWUpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMocmVzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNldENvdW50ZXIobmFtZSl7XG4gICAgICAgIHZhciBkZXBlbmRlbmN5QXJyYXkgPSBpbW1lZGlhdGVbbmFtZV07XG4gICAgICAgIHZhciBjb3VudGVyID0gMDtcbiAgICAgICAgaWYoZGVwZW5kZW5jeUFycmF5KXtcbiAgICAgICAgICAgIGRlcGVuZGVuY3lBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGRlcCl7XG4gICAgICAgICAgICAgICAgaWYodGhpbmdzW2RlcF0gPT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgIGluY0NvdW50ZXIobmFtZSlcbiAgICAgICAgICAgICAgICAgICAgY291bnRlcisrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgZGVwc0NvdW50ZXJbbmFtZV0gPSBjb3VudGVyO1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiQ291bnRlciBmb3IgXCIsIG5hbWUsICcgaXMgJywgY291bnRlcik7XG4gICAgICAgIHJldHVybiBjb3VudGVyO1xuICAgIH1cblxuICAgIC8qIHJldHVybnMgdGhvc2UgdGhhdCBhcmUgcmVhZHkgdG8gYmUgcmVzb2x2ZWQqL1xuICAgIGZ1bmN0aW9uIHJlc2V0VXBDb3VudGVycyhuYW1lKXtcbiAgICAgICAgdmFyIHJldCA9IFtdO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdSZXNldGluZyB1cCBjb3VudGVycyBmb3IgJywgbmFtZSwgXCJSZXZlcnNlOlwiLCByZXZlcnNlZFRyZWVbbmFtZV0pO1xuICAgICAgICB2YXIgdXBzID0gcmV2ZXJzZWRUcmVlW25hbWVdO1xuICAgICAgICBmb3IodmFyIHYgaW4gdXBzKXtcbiAgICAgICAgICAgIGlmKHJlc2V0Q291bnRlcih2KSA9PSAwKXtcbiAgICAgICAgICAgICAgICByZXQucHVzaCh2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIC8qXG4gICAgICAgICBUaGUgZmlyc3QgYXJndW1lbnQgaXMgYSBuYW1lIGZvciBhIHNlcnZpY2UsIHZhcmlhYmxlLGEgIHRoaW5nIHRoYXQgc2hvdWxkIGJlIGluaXRpYWxpc2VkLCByZWNyZWF0ZWQsIGV0Y1xuICAgICAgICAgVGhlIHNlY29uZCBhcmd1bWVudCBpcyBhbiBhcnJheSB3aXRoIGRlcGVuZGVuY2llc1xuICAgICAgICAgdGhlIGxhc3QgYXJndW1lbnQgaXMgYSBmdW5jdGlvbihlcnIsLi4uKSB0aGF0IGlzIGNhbGxlZCB3aGVuIGRlcGVuZGVuY2llcyBhcmUgcmVhZHkgb3IgcmVjYWxsZWQgd2hlbiBhcmUgbm90IHJlYWR5IChzdG9wIHdhcyBjYWxsZWQpXG4gICAgICAgICBJZiBlcnIgaXMgbm90IHVuZGVmaW5lZCBpdCBtZWFucyB0aGF0IG9uZSBvciBhbnkgdW5kZWZpbmVkIHZhcmlhYmxlcyBhcmUgbm90IHJlYWR5IGFuZCB0aGUgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgYWdhaW4gbGF0ZXJcbiAgICAgICAgIEFsbCB0aGUgb3RoZXIgYXJndW1lbnRzIGFyZSB0aGUgY29ycmVzcG9uZGluZyBhcmd1bWVudHMgb2YgdGhlIGNhbGxiYWNrIHdpbGwgYmUgdGhlIGFjdHVhbCB2YWx1ZXMgb2YgdGhlIGNvcnJlc3BvbmRpbmcgZGVwZW5kZW5jeVxuICAgICAgICAgVGhlIGNhbGxiYWNrIGZ1bmN0aW9ucyBzaG91bGQgcmV0dXJuIHRoZSBjdXJyZW50IHZhbHVlIChvciBudWxsKVxuICAgICAqL1xuICAgIHRoaXMuZGVjbGFyZURlcGVuZGVuY3kgPSBmdW5jdGlvbihuYW1lLCBkZXBlbmRlbmN5QXJyYXksIGNhbGxiYWNrKXtcbiAgICAgICAgaWYoY2FsbGJhY2tzW25hbWVdKXtcbiAgICAgICAgICAgIGVycm9ySGFuZGxlci5pZ25vcmVQb3NzaWJsZUVycm9yKFwiRHVwbGljYXRlIGRlcGVuZGVuY3k6XCIgKyBuYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrc1tuYW1lXSA9IGNhbGxiYWNrO1xuICAgICAgICAgICAgaW1tZWRpYXRlW25hbWVdICAgPSBkZXBlbmRlbmN5QXJyYXk7XG4gICAgICAgICAgICBpbnNlcnREZXBlbmRlbmN5aW5SVChuYW1lLCBkZXBlbmRlbmN5QXJyYXkpO1xuICAgICAgICAgICAgdGhpbmdzW25hbWVdID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB1bnNhdGlzZmllZENvdW50ZXIgPSByZXNldENvdW50ZXIobmFtZSk7XG4gICAgICAgIGlmKHVuc2F0aXNmaWVkQ291bnRlciA9PSAwICl7XG4gICAgICAgICAgICBjYWxsRm9yVGhpbmcobmFtZSwgZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbEZvclRoaW5nKG5hbWUsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKlxuICAgICAgICBjcmVhdGUgYSBzZXJ2aWNlXG4gICAgICovXG4gICAgdGhpcy5zZXJ2aWNlID0gZnVuY3Rpb24obmFtZSwgZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcil7XG4gICAgICAgIHRoaXMuZGVjbGFyZURlcGVuZGVuY3kobmFtZSwgZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcik7XG4gICAgfVxuXG5cbiAgICB2YXIgc3Vic3lzdGVtQ291bnRlciA9IDA7XG4gICAgLypcbiAgICAgY3JlYXRlIGEgYW5vbnltb3VzIHN1YnN5c3RlbVxuICAgICAqL1xuICAgIHRoaXMuc3Vic3lzdGVtID0gZnVuY3Rpb24oZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcil7XG4gICAgICAgIHN1YnN5c3RlbUNvdW50ZXIrKztcbiAgICAgICAgdGhpcy5kZWNsYXJlRGVwZW5kZW5jeShcImRpY29udGFpbmVyX3N1YnN5c3RlbV9wbGFjZWhvbGRlclwiICsgc3Vic3lzdGVtQ291bnRlciwgZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcik7XG4gICAgfVxuXG4gICAgLyogbm90IGRvY3VtZW50ZWQuLiBsaW1ibyBzdGF0ZSovXG4gICAgdGhpcy5mYWN0b3J5ID0gZnVuY3Rpb24obmFtZSwgZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcil7XG4gICAgICAgIHRoaXMuZGVjbGFyZURlcGVuZGVuY3kobmFtZSwgZGVwZW5kZW5jeUFycmF5LCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb25zdHJ1Y3RvcigpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGxGb3JUaGluZyhuYW1lLCBvdXRPZlNlcnZpY2Upe1xuICAgICAgICB2YXIgYXJncyA9IGltbWVkaWF0ZVtuYW1lXS5tYXAoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICByZXR1cm4gdGhpbmdzW2l0ZW1dO1xuICAgICAgICB9KTtcbiAgICAgICAgYXJncy51bnNoaWZ0KG91dE9mU2VydmljZSk7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGNhbGxiYWNrc1tuYW1lXS5hcHBseSh7fSxhcmdzKTtcbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgZXJyb3JIYW5kbGVyLnRocm93RXJyb3IoZXJyKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYob3V0T2ZTZXJ2aWNlIHx8IHZhbHVlPT09bnVsbCl7ICAgLy9lbmFibGUgcmV0dXJuaW5nIGEgdGVtcG9yYXJ5IGRlcGVuZGVuY3kgcmVzb2x1dGlvbiFcbiAgICAgICAgICAgIGlmKHRoaW5nc1tuYW1lXSl7XG4gICAgICAgICAgICAgICAgdGhpbmdzW25hbWVdID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZXNldFVwQ291bnRlcnMobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiU3VjY2VzcyByZXNvbHZpbmcgXCIsIG5hbWUsIFwiOlwiLCB2YWx1ZSwgXCJPdGhlciByZWFkeTpcIiwgb3RoZXJSZWFkeSk7XG4gICAgICAgICAgICBpZighdmFsdWUpe1xuICAgICAgICAgICAgICAgIHZhbHVlID0gIHtcInBsYWNlaG9sZGVyXCI6IG5hbWV9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpbmdzW25hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICB2YXIgb3RoZXJSZWFkeSA9IHJlc2V0VXBDb3VudGVycyhuYW1lKTtcbiAgICAgICAgICAgIG90aGVyUmVhZHkuZm9yRWFjaChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICAgICAgICBjYWxsRm9yVGhpbmcoaXRlbSwgZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgICAgICBEZWNsYXJlIHRoYXQgYSBuYW1lIGlzIHJlYWR5LCByZXNvbHZlZCBhbmQgc2hvdWxkIHRyeSB0byByZXNvbHZlIGFsbCBvdGhlciB3YWl0aW5nIGZvciBpdFxuICAgICAqL1xuICAgIHRoaXMucmVzb2x2ZSAgICA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKXtcbiAgICAgICAgdGhpbmdzW25hbWVdID0gdmFsdWU7XG4gICAgICAgIHZhciBvdGhlclJlYWR5ID0gcmVzZXRVcENvdW50ZXJzKG5hbWUpO1xuXG4gICAgICAgIG90aGVyUmVhZHkuZm9yRWFjaChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICAgIGNhbGxGb3JUaGluZyhpdGVtLCBmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cblxuXG4gICAgdGhpcy5pbnN0YW5jZUZhY3RvcnkgPSBmdW5jdGlvbihuYW1lLCBkZXBlbmRlbmN5QXJyYXksIGNvbnN0cnVjdG9yKXtcbiAgICAgICAgZXJyb3JIYW5kbGVyLm5vdEltcGxlbWVudGVkKFwiaW5zdGFuY2VGYWN0b3J5IGlzIHBsYW5uZWQgYnV0IG5vdCBpbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAgICBEZWNsYXJlIHRoYXQgYSBzZXJ2aWNlIG9yIGZlYXR1cmUgaXMgbm90IHdvcmtpbmcgcHJvcGVybHkuIEFsbCBzZXJ2aWNlcyBkZXBlbmRpbmcgb24gdGhpcyB3aWxsIGdldCBub3RpZmllZFxuICAgICAqL1xuICAgIHRoaXMub3V0T2ZTZXJ2aWNlICAgID0gZnVuY3Rpb24obmFtZSl7XG4gICAgICAgIHRoaW5nc1tuYW1lXSA9IG51bGw7XG4gICAgICAgIHZhciB1cE5vZGVzID0gZGlzY292ZXJVcE5vZGVzKG5hbWUpO1xuICAgICAgICB1cE5vZGVzLmZvckVhY2goZnVuY3Rpb24obm9kZSl7XG4gICAgICAgICAgICB0aGluZ3NbbmFtZV0gPSBudWxsO1xuICAgICAgICAgICAgY2FsbEZvclRoaW5nKG5vZGUsIHRydWUpO1xuICAgICAgICB9KVxuICAgIH1cbn1cblxuXG5leHBvcnRzLm5ld0NvbnRhaW5lciAgICA9IGZ1bmN0aW9uKGNoZWNrc0xpYnJhcnkpe1xuICAgIHJldHVybiBuZXcgQ29udGFpbmVyKGNoZWNrc0xpYnJhcnkpO1xufVxuXG4vL2V4cG9ydHMuY29udGFpbmVyID0gbmV3IENvbnRhaW5lcigkJC5lcnJvckhhbmRsZXIpO1xuIiwiXG4vKipcbiAqIEdlbmVyaWMgZnVuY3Rpb24gdXNlZCB0byByZWdpc3RlcnMgbWV0aG9kcyBzdWNoIGFzIGFzc2VydHMsIGxvZ2dpbmcsIGV0Yy4gb24gdGhlIGN1cnJlbnQgY29udGV4dC5cbiAqIEBwYXJhbSBuYW1lIHtTdHJpbmcpfSAtIG5hbWUgb2YgdGhlIG1ldGhvZCAodXNlIGNhc2UpIHRvIGJlIHJlZ2lzdGVyZWQuXG4gKiBAcGFyYW0gZnVuYyB7RnVuY3Rpb259IC0gaGFuZGxlciB0byBiZSBpbnZva2VkLlxuICogQHBhcmFtIHBhcmFtc0Rlc2NyaXB0aW9uIHtPYmplY3R9IC0gcGFyYW1ldGVycyBkZXNjcmlwdGlvbnNcbiAqIEBwYXJhbSBhZnRlciB7RnVuY3Rpb259IC0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGFmdGVyIHRoZSBmdW5jdGlvbiBoYXMgYmVlbiBleGVjdXRlZC5cbiAqL1xuZnVuY3Rpb24gYWRkVXNlQ2FzZShuYW1lLCBmdW5jLCBwYXJhbXNEZXNjcmlwdGlvbiwgYWZ0ZXIpe1xuICAgIHZhciBuZXdGdW5jID0gZnVuYztcbiAgICBpZih0eXBlb2YgYWZ0ZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBuZXdGdW5jID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGxldCBhcmdzID0gQXJyYXkuZnJvbShhcmd1bWVudHMpO1xuICAgICAgICAgICAgZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIGFmdGVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBzb21lIHByb3BlcnRpZXMgc2hvdWxkIG5vdCBiZSBvdmVycmlkZGVuXG4gICAgY29uc3QgcHJvdGVjdGVkUHJvcGVydGllcyA9IFsnYWRkQ2hlY2snLCAnYWRkQ2FzZScsICdyZWdpc3RlciddO1xuICAgIGlmKHByb3RlY3RlZFByb3BlcnRpZXMuaW5kZXhPZihuYW1lKSA9PT0gLTEpe1xuICAgICAgICB0aGlzW25hbWVdID0gbmV3RnVuYztcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbnQgb3ZlcndyaXRlICcgKyBuYW1lKTtcbiAgICB9XG5cbiAgICBpZihwYXJhbXNEZXNjcmlwdGlvbil7XG4gICAgICAgIHRoaXMucGFyYW1zW25hbWVdID0gcGFyYW1zRGVzY3JpcHRpb247XG4gICAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gYWxpYXMgdG8gYW4gZXhpc3RpbmcgZnVuY3Rpb24uXG4gKiBAcGFyYW0gbmFtZTEge1N0cmluZ30gLSBOZXcgZnVuY3Rpb24gbmFtZS5cbiAqIEBwYXJhbSBuYW1lMiB7U3RyaW5nfSAtIEV4aXN0aW5nIGZ1bmN0aW9uIG5hbWUuXG4gKi9cbmZ1bmN0aW9uIGFsaWFzKG5hbWUxLCBuYW1lMil7XG4gICAgdGhpc1tuYW1lMV0gPSB0aGlzW25hbWUyXTtcbn1cblxuLyoqXG4gKiBTaW5nbGV0b24gZm9yIGFkZGluZyB2YXJpb3VzIGZ1bmN0aW9ucyBmb3IgdXNlIGNhc2VzIHJlZ2FyZGluZyBsb2dnaW5nLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIExvZ3NDb3JlKCl7XG4gICAgdGhpcy5wYXJhbXMgPSB7fTtcbn1cblxuLyoqXG4gKiBTaW5nbGV0b24gZm9yIGFkZGluZyB5b3VyIHZhcmlvdXMgZnVuY3Rpb25zIGZvciBhc3NlcnRzLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEFzc2VydENvcmUoKXtcbiAgICB0aGlzLnBhcmFtcyA9IHt9O1xufVxuXG4vKipcbiAqIFNpbmdsZXRvbiBmb3IgYWRkaW5nIHlvdXIgdmFyaW91cyBmdW5jdGlvbnMgZm9yIGNoZWNrcy5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBDaGVja0NvcmUoKXtcbiAgICB0aGlzLnBhcmFtcyA9IHt9O1xufVxuXG4vKipcbiAqIFNpbmdsZXRvbiBmb3IgYWRkaW5nIHlvdXIgdmFyaW91cyBmdW5jdGlvbnMgZm9yIGdlbmVyYXRpbmcgZXhjZXB0aW9ucy5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBFeGNlcHRpb25zQ29yZSgpe1xuICAgIHRoaXMucGFyYW1zID0ge307XG59XG5cbi8qKlxuICogU2luZ2xldG9uIGZvciBhZGRpbmcgeW91ciB2YXJpb3VzIGZ1bmN0aW9ucyBmb3IgcnVubmluZyB0ZXN0cy5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBUZXN0UnVubmVyQ29yZSgpe1xufVxuXG5Mb2dzQ29yZS5wcm90b3R5cGUuYWRkQ2FzZSAgICAgICAgICAgPSBhZGRVc2VDYXNlO1xuQXNzZXJ0Q29yZS5wcm90b3R5cGUuYWRkQ2hlY2sgICAgICAgID0gYWRkVXNlQ2FzZTtcbkNoZWNrQ29yZS5wcm90b3R5cGUuYWRkQ2hlY2sgICAgICAgICA9IGFkZFVzZUNhc2U7XG5FeGNlcHRpb25zQ29yZS5wcm90b3R5cGUucmVnaXN0ZXIgICAgPSBhZGRVc2VDYXNlO1xuXG5Mb2dzQ29yZS5wcm90b3R5cGUuYWxpYXMgICAgICAgICAgICAgPSBhbGlhcztcbkFzc2VydENvcmUucHJvdG90eXBlLmFsaWFzICAgICAgICAgICA9IGFsaWFzO1xuQ2hlY2tDb3JlLnByb3RvdHlwZS5hbGlhcyAgICAgICAgICAgID0gYWxpYXM7XG5FeGNlcHRpb25zQ29yZS5wcm90b3R5cGUuYWxpYXMgICAgICAgPSBhbGlhcztcblxuLy8gQ3JlYXRlIG1vZHVsZXNcbnZhciBhc3NlcnRPYmogICAgICAgPSBuZXcgQXNzZXJ0Q29yZSgpO1xudmFyIGNoZWNrT2JqICAgICAgICA9IG5ldyBDaGVja0NvcmUoKTtcbnZhciBleGNlcHRpb25zT2JqICAgPSBuZXcgRXhjZXB0aW9uc0NvcmUoKTtcbnZhciBsb2dnZXJPYmogICAgICAgPSBuZXcgTG9nc0NvcmUoKTtcbnZhciB0ZXN0UnVubmVyT2JqICAgPSBuZXcgVGVzdFJ1bm5lckNvcmUoKTtcblxuLy8gRXhwb3J0IG1vZHVsZXNcbmV4cG9ydHMuYXNzZXJ0ICAgICAgPSBhc3NlcnRPYmo7XG5leHBvcnRzLmNoZWNrICAgICAgID0gY2hlY2tPYmo7XG5leHBvcnRzLmV4Y2VwdGlvbnMgID0gY2hlY2tPYmo7XG5leHBvcnRzLmV4Y2VwdGlvbnMgID0gZXhjZXB0aW9uc09iajtcbmV4cG9ydHMubG9nZ2VyICAgICAgPSBsb2dnZXJPYmo7XG5leHBvcnRzLnRlc3RSdW5uZXIgID0gdGVzdFJ1bm5lck9iajtcblxuLy8gSW5pdGlhbGlzZSBtb2R1bGVzXG5yZXF1aXJlKFwiLi9zdGFuZGFyZEFzc2VydHMuanNcIikuaW5pdChleHBvcnRzKTtcbnJlcXVpcmUoXCIuL3N0YW5kYXJkTG9ncy5qc1wiKS5pbml0KGV4cG9ydHMpO1xucmVxdWlyZShcIi4vc3RhbmRhcmRFeGNlcHRpb25zLmpzXCIpLmluaXQoZXhwb3J0cyk7XG5yZXF1aXJlKFwiLi9zdGFuZGFyZENoZWNrcy5qc1wiKS5pbml0KGV4cG9ydHMpO1xucmVxdWlyZShcIi4vdGVzdFJ1bm5lci5qc1wiKS5pbml0KGV4cG9ydHMpO1xuXG4vLyBHbG9iYWwgVW5jYXVnaHQgRXhjZXB0aW9uIGhhbmRsZXIuXG5pZihwcm9jZXNzLm9uKVxue1xuICAgIHByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgZnVuY3Rpb24gKGVycikge1xuXHRcdGxldCB0YWcgPSBcInVuY2F1Z2h0RXhjZXB0aW9uXCI7XG5cdFx0Y29uc29sZS5sb2codGFnLCBlcnIpO1xuXHRcdGNvbnNvbGUubG9nKHRhZywgZXJyLnN0YWNrKTtcblx0fSk7XG59IiwidmFyIGxvZ2dlciA9IHJlcXVpcmUoXCIuL2NoZWNrc0NvcmUuanNcIikubG9nZ2VyO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihzZil7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBoYW5kbGVyIGZvciBmYWlsZWQgYXNzZXJ0cy4gVGhlIGhhbmRsZXIgaXMgZG9pbmcgbG9nZ2luZyBhbmQgaXMgdGhyb3dpbmcgYW4gZXJyb3IuXG4gICAgICogQHBhcmFtIGV4cGxhbmF0aW9uIHtTdHJpbmd9IC0gZmFpbGluZyByZWFzb24gbWVzc2FnZS5cbiAgICAgKi9cbiAgICBzZi5leGNlcHRpb25zLnJlZ2lzdGVyKCdhc3NlcnRGYWlsJywgZnVuY3Rpb24oZXhwbGFuYXRpb24pe1xuICAgICAgICBsZXQgbWVzc2FnZSA9IFwiQXNzZXJ0IG9yIGludmFyaWFudCBoYXMgZmFpbGVkIFwiICsgKGV4cGxhbmF0aW9uID8gZXhwbGFuYXRpb24gOiBcIlwiKTtcbiAgICAgICAgbGV0IGVyciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgbG9nZ2VyLnJlY29yZEFzc2VydCgnW0ZhaWxdICcgKyBtZXNzYWdlLCBlcnIsIHRydWUpO1xuICAgICAgICB0aHJvdyBlcnJcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGFzc2VydCBmb3IgZXF1YWxpdHkuIElmIGNoZWNrIGZhaWxzLCB0aGUgYXNzZXJ0RmFpbCBpcyBpbnZva2VkLlxuICAgICAqIEBwYXJhbSB2MSB7U3RyaW5nfE51bWJlcnxPYmplY3R9IC0gZmlyc3QgdmFsdWVcbiAgICAgKiBAcGFyYW0gdjEge1N0cmluZ3xOdW1iZXJ8T2JqZWN0fSAtIHNlY29uZCB2YWx1ZVxuICAgICAqIEBwYXJhbSBleHBsYW5hdGlvbiB7U3RyaW5nfSAtIGZhaWxpbmcgcmVhc29uIG1lc3NhZ2UgaW4gY2FzZSB0aGUgYXNzZXJ0IGZhaWxzLlxuICAgICAqL1xuICAgIHNmLmFzc2VydC5hZGRDaGVjaygnZXF1YWwnLCBmdW5jdGlvbih2MSAsIHYyLCBleHBsYW5hdGlvbil7XG4gICAgICAgIGlmKHYxICE9PSB2Mil7XG4gICAgICAgICAgICBpZighZXhwbGFuYXRpb24pe1xuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uID0gIFwiQXNzZXJ0aW9uIGZhaWxlZDogW1wiICsgdjEgKyBcIiAhPT0gXCIgKyB2MiArIFwiXVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2YuZXhjZXB0aW9ucy5hc3NlcnRGYWlsKGV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgYXNzZXJ0IGZvciBpbmVxdWFsaXR5LiBJZiBjaGVjayBmYWlscywgdGhlIGFzc2VydEZhaWwgaXMgaW52b2tlZC5cbiAgICAgKiBAcGFyYW0gdjEge1N0cmluZ3xOdW1iZXJ8T2JqZWN0fSAtIGZpcnN0IHZhbHVlXG4gICAgICogQHBhcmFtIHYxIHtTdHJpbmd8TnVtYmVyfE9iamVjdH0gLSBzZWNvbmQgdmFsdWVcbiAgICAgKiBAcGFyYW0gZXhwbGFuYXRpb24ge1N0cmluZ30gLSBmYWlsaW5nIHJlYXNvbiBtZXNzYWdlIGluIGNhc2UgdGhlIGFzc2VydCBmYWlsc1xuICAgICAqL1xuICAgIHNmLmFzc2VydC5hZGRDaGVjaygnbm90RXF1YWwnLCBmdW5jdGlvbih2MSwgdjIsIGV4cGxhbmF0aW9uKXtcbiAgICAgICAgaWYodjEgPT09IHYyKXtcbiAgICAgICAgICAgIGlmKCFleHBsYW5hdGlvbil7XG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb24gPSAgXCIgW1wiKyB2MSArIFwiID09IFwiICsgdjIgKyBcIl1cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNmLmV4Y2VwdGlvbnMuYXNzZXJ0RmFpbChleHBsYW5hdGlvbik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGFzc2VydCBmb3IgZXZhbHVhdGluZyBhbiBleHByZXNzaW9uIHRvIHRydWUuIElmIGNoZWNrIGZhaWxzLCB0aGUgYXNzZXJ0RmFpbCBpcyBpbnZva2VkLlxuICAgICAqIEBwYXJhbSBiIHtCb29sZWFufSAtIHJlc3VsdCBvZiBhbiBleHByZXNzaW9uXG4gICAgICogQHBhcmFtIGV4cGxhbmF0aW9uIHtTdHJpbmd9IC0gZmFpbGluZyByZWFzb24gbWVzc2FnZSBpbiBjYXNlIHRoZSBhc3NlcnQgZmFpbHNcbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWRkQ2hlY2soJ3RydWUnLCBmdW5jdGlvbihiLCBleHBsYW5hdGlvbil7XG4gICAgICAgIGlmKCFiKXtcbiAgICAgICAgICAgIGlmKCFleHBsYW5hdGlvbil7XG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb24gPSAgXCIgZXhwcmVzc2lvbiBpcyBmYWxzZSBidXQgaXMgZXhwZWN0ZWQgdG8gYmUgdHJ1ZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2YuZXhjZXB0aW9ucy5hc3NlcnRGYWlsKGV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgYXNzZXJ0IGZvciBldmFsdWF0aW5nIGFuIGV4cHJlc3Npb24gdG8gZmFsc2UuIElmIGNoZWNrIGZhaWxzLCB0aGUgYXNzZXJ0RmFpbCBpcyBpbnZva2VkLlxuICAgICAqIEBwYXJhbSBiIHtCb29sZWFufSAtIHJlc3VsdCBvZiBhbiBleHByZXNzaW9uXG4gICAgICogQHBhcmFtIGV4cGxhbmF0aW9uIHtTdHJpbmd9IC0gZmFpbGluZyByZWFzb24gbWVzc2FnZSBpbiBjYXNlIHRoZSBhc3NlcnQgZmFpbHNcbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWRkQ2hlY2soJ2ZhbHNlJywgZnVuY3Rpb24oYiwgZXhwbGFuYXRpb24pe1xuICAgICAgICBpZihiKXtcbiAgICAgICAgICAgIGlmKCFleHBsYW5hdGlvbil7XG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb24gPSAgXCIgZXhwcmVzc2lvbiBpcyB0cnVlIGJ1dCBpcyBleHBlY3RlZCB0byBiZSBmYWxzZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2YuZXhjZXB0aW9ucy5hc3NlcnRGYWlsKGV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgYXNzZXJ0IGZvciBldmFsdWF0aW5nIGEgdmFsdWUgdG8gbnVsbC4gSWYgY2hlY2sgZmFpbHMsIHRoZSBhc3NlcnRGYWlsIGlzIGludm9rZWQuXG4gICAgICogQHBhcmFtIGIge0Jvb2xlYW59IC0gcmVzdWx0IG9mIGFuIGV4cHJlc3Npb25cbiAgICAgKiBAcGFyYW0gZXhwbGFuYXRpb24ge1N0cmluZ30gLSBmYWlsaW5nIHJlYXNvbiBtZXNzYWdlIGluIGNhc2UgdGhlIGFzc2VydCBmYWlsc1xuICAgICAqL1xuICAgIHNmLmFzc2VydC5hZGRDaGVjaygnaXNOdWxsJywgZnVuY3Rpb24odjEsIGV4cGxhbmF0aW9uKXtcbiAgICAgICAgaWYodjEgIT09IG51bGwpe1xuICAgICAgICAgICAgc2YuZXhjZXB0aW9ucy5hc3NlcnRGYWlsKGV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgYXNzZXJ0IGZvciBldmFsdWF0aW5nIGEgdmFsdWUgdG8gYmUgbm90IG51bGwuIElmIGNoZWNrIGZhaWxzLCB0aGUgYXNzZXJ0RmFpbCBpcyBpbnZva2VkLlxuICAgICAqIEBwYXJhbSBiIHtCb29sZWFufSAtIHJlc3VsdCBvZiBhbiBleHByZXNzaW9uXG4gICAgICogQHBhcmFtIGV4cGxhbmF0aW9uIHtTdHJpbmd9IC0gZmFpbGluZyByZWFzb24gbWVzc2FnZSBpbiBjYXNlIHRoZSBhc3NlcnQgZmFpbHNcbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWRkQ2hlY2soJ25vdE51bGwnLCBmdW5jdGlvbih2MSAsIGV4cGxhbmF0aW9uKXtcbiAgICAgICAgaWYodjEgPT09IG51bGwgJiYgdHlwZW9mIHYxID09PSBcIm9iamVjdFwiKXtcbiAgICAgICAgICAgIHNmLmV4Y2VwdGlvbnMuYXNzZXJ0RmFpbChleHBsYW5hdGlvbik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhbGwgcHJvcGVydGllcyBvZiB0aGUgc2Vjb25kIG9iamVjdCBhcmUgb3duIHByb3BlcnRpZXMgb2YgdGhlIGZpcnN0IG9iamVjdC5cbiAgICAgKiBAcGFyYW0gZmlyc3RPYmoge09iamVjdH0gLSBmaXJzdCBvYmplY3RcbiAgICAgKiBAcGFyYW0gc2Vjb25kT2Jqe09iamVjdH0gLSBzZWNvbmQgb2JqZWN0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gcmV0dXJucyB0cnVlLCBpZiB0aGUgY2hlY2sgaGFzIHBhc3NlZCBvciBmYWxzZSBvdGhlcndpc2UuXG4gICAgICovXG4gICAgZnVuY3Rpb24gb2JqZWN0SGFzRmllbGRzKGZpcnN0T2JqLCBzZWNvbmRPYmope1xuICAgICAgICBmb3IobGV0IGZpZWxkIGluIHNlY29uZE9iaikge1xuICAgICAgICAgICAgaWYgKGZpcnN0T2JqLmhhc093blByb3BlcnR5KGZpZWxkKSkge1xuICAgICAgICAgICAgICAgIGlmIChmaXJzdE9ialtmaWVsZF0gIT09IHNlY29uZE9ialtmaWVsZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9iamVjdHNBcmVFcXVhbChmaXJzdE9iaiwgc2Vjb25kT2JqKSB7XG4gICAgICAgIGxldCBhcmVFcXVhbCA9IHRydWU7XG4gICAgICAgIGlmKGZpcnN0T2JqICE9PSBzZWNvbmRPYmopIHtcbiAgICAgICAgICAgIGlmKHR5cGVvZiBmaXJzdE9iaiAhPT0gdHlwZW9mIHNlY29uZE9iaikge1xuICAgICAgICAgICAgICAgIGFyZUVxdWFsID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZmlyc3RPYmopICYmIEFycmF5LmlzQXJyYXkoc2Vjb25kT2JqKSkge1xuXHQgICAgICAgICAgICBmaXJzdE9iai5zb3J0KCk7XG5cdCAgICAgICAgICAgIHNlY29uZE9iai5zb3J0KCk7XG5cdFx0ICAgICAgICBpZiAoZmlyc3RPYmoubGVuZ3RoICE9PSBzZWNvbmRPYmoubGVuZ3RoKSB7XG5cdFx0XHQgICAgICAgIGFyZUVxdWFsID0gZmFsc2U7XG5cdFx0ICAgICAgICB9IGVsc2Uge1xuXHRcdFx0ICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpcnN0T2JqLmxlbmd0aDsgKytpKSB7XG5cdFx0XHRcdCAgICAgICAgaWYgKCFvYmplY3RzQXJlRXF1YWwoZmlyc3RPYmpbaV0sIHNlY29uZE9ialtpXSkpIHtcblx0XHRcdFx0XHQgICAgICAgIGFyZUVxdWFsID0gZmFsc2U7XG5cdFx0XHRcdFx0ICAgICAgICBicmVhaztcblx0XHRcdFx0ICAgICAgICB9XG5cdFx0XHQgICAgICAgIH1cblx0XHQgICAgICAgIH1cblx0ICAgICAgICB9IGVsc2UgaWYoKHR5cGVvZiBmaXJzdE9iaiA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygc2Vjb25kT2JqID09PSAnZnVuY3Rpb24nKSB8fFxuXHRcdCAgICAgICAgKGZpcnN0T2JqIGluc3RhbmNlb2YgRGF0ZSAmJiBzZWNvbmRPYmogaW5zdGFuY2VvZiBEYXRlKSB8fFxuXHRcdCAgICAgICAgKGZpcnN0T2JqIGluc3RhbmNlb2YgUmVnRXhwICYmIHNlY29uZE9iaiBpbnN0YW5jZW9mIFJlZ0V4cCkgfHxcblx0XHQgICAgICAgIChmaXJzdE9iaiBpbnN0YW5jZW9mIFN0cmluZyAmJiBzZWNvbmRPYmogaW5zdGFuY2VvZiBTdHJpbmcpIHx8XG5cdFx0ICAgICAgICAoZmlyc3RPYmogaW5zdGFuY2VvZiBOdW1iZXIgJiYgc2Vjb25kT2JqIGluc3RhbmNlb2YgTnVtYmVyKSkge1xuICAgICAgICAgICAgICAgICAgICBhcmVFcXVhbCA9IGZpcnN0T2JqLnRvU3RyaW5nKCkgPT09IHNlY29uZE9iai50b1N0cmluZygpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiBmaXJzdE9iaiA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHNlY29uZE9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBhcmVFcXVhbCA9IG9iamVjdEhhc0ZpZWxkcyhmaXJzdE9iaiwgc2Vjb25kT2JqKTtcbiAgICAgICAgICAgIC8vIGlzTmFOKHVuZGVmaW5lZCkgcmV0dXJucyB0cnVlXG4gICAgICAgICAgICB9IGVsc2UgaWYoaXNOYU4oZmlyc3RPYmopICYmIGlzTmFOKHNlY29uZE9iaikgJiYgdHlwZW9mIGZpcnN0T2JqID09PSAnbnVtYmVyJyAmJiB0eXBlb2Ygc2Vjb25kT2JqID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIGFyZUVxdWFsID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJlRXF1YWwgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcmVFcXVhbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBhc3NlcnQgZm9yIGV2YWx1YXRpbmcgaWYgYWxsIHByb3BlcnRpZXMgb2YgdGhlIHNlY29uZCBvYmplY3QgYXJlIG93biBwcm9wZXJ0aWVzIG9mIHRoZSBmaXJzdCBvYmplY3QuXG4gICAgICogSWYgY2hlY2sgZmFpbHMsIHRoZSBhc3NlcnRGYWlsIGlzIGludm9rZWQuXG4gICAgICogQHBhcmFtIGZpcnN0T2JqIHtPYmplY3R9IC0gZmlyc3Qgb2JqZWN0XG4gICAgICogQHBhcmFtIHNlY29uZE9iantPYmplY3R9IC0gc2Vjb25kIG9iamVjdFxuICAgICAqIEBwYXJhbSBleHBsYW5hdGlvbiB7U3RyaW5nfSAtIGZhaWxpbmcgcmVhc29uIG1lc3NhZ2UgaW4gY2FzZSB0aGUgYXNzZXJ0IGZhaWxzXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFkZENoZWNrKFwib2JqZWN0SGFzRmllbGRzXCIsIGZ1bmN0aW9uKGZpcnN0T2JqLCBzZWNvbmRPYmosIGV4cGxhbmF0aW9uKXtcbiAgICAgICAgaWYoIW9iamVjdEhhc0ZpZWxkcyhmaXJzdE9iaiwgc2Vjb25kT2JqKSkge1xuICAgICAgICAgICAgc2YuZXhjZXB0aW9ucy5hc3NlcnRGYWlsKGV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgYXNzZXJ0IGZvciBldmFsdWF0aW5nIGlmIGFsbCBlbGVtZW50IGZyb20gdGhlIHNlY29uZCBhcnJheSBhcmUgcHJlc2VudCBpbiB0aGUgZmlyc3QgYXJyYXkuXG4gICAgICogRGVlcCBjb21wYXJpc29uIGJldHdlZW4gdGhlIGVsZW1lbnRzIG9mIHRoZSBhcnJheSBpcyB1c2VkLlxuICAgICAqIElmIGNoZWNrIGZhaWxzLCB0aGUgYXNzZXJ0RmFpbCBpcyBpbnZva2VkLlxuICAgICAqIEBwYXJhbSBmaXJzdEFycmF5IHtBcnJheX0tIGZpcnN0IGFycmF5XG4gICAgICogQHBhcmFtIHNlY29uZEFycmF5IHtBcnJheX0gLSBzZWNvbmQgYXJyYXlcbiAgICAgKiBAcGFyYW0gZXhwbGFuYXRpb24ge1N0cmluZ30gLSBmYWlsaW5nIHJlYXNvbiBtZXNzYWdlIGluIGNhc2UgdGhlIGFzc2VydCBmYWlsc1xuICAgICAqL1xuICAgIHNmLmFzc2VydC5hZGRDaGVjayhcImFycmF5c01hdGNoXCIsIGZ1bmN0aW9uKGZpcnN0QXJyYXksIHNlY29uZEFycmF5LCBleHBsYW5hdGlvbil7XG4gICAgICAgIGlmKGZpcnN0QXJyYXkubGVuZ3RoICE9PSBzZWNvbmRBcnJheS5sZW5ndGgpe1xuICAgICAgICAgICAgc2YuZXhjZXB0aW9ucy5hc3NlcnRGYWlsKGV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBvYmplY3RzQXJlRXF1YWwoZmlyc3RBcnJheSwgc2Vjb25kQXJyYXkpO1xuICAgICAgICAgICAgLy8gY29uc3QgYXJyYXlzRG9udE1hdGNoID0gc2Vjb25kQXJyYXkuZXZlcnkoZWxlbWVudCA9PiBmaXJzdEFycmF5LmluZGV4T2YoZWxlbWVudCkgIT09IC0xKTtcbiAgICAgICAgICAgIC8vIGxldCBhcnJheXNEb250TWF0Y2ggPSBzZWNvbmRBcnJheS5zb21lKGZ1bmN0aW9uIChleHBlY3RlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgIC8vICAgICBsZXQgZm91bmQgPSBmaXJzdEFycmF5LnNvbWUoZnVuY3Rpb24ocmVzdWx0RWxlbWVudCl7XG4gICAgICAgICAgICAvLyAgICAgICAgIHJldHVybiBvYmplY3RIYXNGaWVsZHMocmVzdWx0RWxlbWVudCxleHBlY3RlZEVsZW1lbnQpO1xuICAgICAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAgICAgLy8gICAgIHJldHVybiBmb3VuZCA9PT0gZmFsc2U7XG4gICAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgICAgaWYoIXJlc3VsdCl7XG4gICAgICAgICAgICAgICAgc2YuZXhjZXB0aW9ucy5hc3NlcnRGYWlsKGV4cGxhbmF0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gYWRkZWQgbWFpbmx5IGZvciB0ZXN0IHB1cnBvc2VzLCBiZXR0ZXIgdGVzdCBmcmFtZXdvcmtzIGxpa2UgbW9jaGEgY291bGQgYmUgbXVjaCBiZXR0ZXJcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGFzc2VydCBmb3IgY2hlY2tpbmcgaWYgYSBmdW5jdGlvbiBpcyBmYWlsaW5nLlxuICAgICAqIElmIHRoZSBmdW5jdGlvbiBpcyB0aHJvd2luZyBhbiBleGNlcHRpb24sIHRoZSB0ZXN0IGlzIHBhc3NlZCBvciBmYWlsZWQgb3RoZXJ3aXNlLlxuICAgICAqIEBwYXJhbSB0ZXN0TmFtZSB7U3RyaW5nfSAtIHRlc3QgbmFtZSBvciBkZXNjcmlwdGlvblxuICAgICAqIEBwYXJhbSBmdW5jIHtGdW5jdGlvbn0gLSBmdW5jdGlvbiB0byBiZSBpbnZva2VkXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFkZENoZWNrKCdmYWlsJywgZnVuY3Rpb24odGVzdE5hbWUsIGZ1bmMpe1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICBmdW5jKCk7XG4gICAgICAgICAgICBsb2dnZXIucmVjb3JkQXNzZXJ0KFwiW0ZhaWxdIFwiICsgdGVzdE5hbWUpO1xuICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICBsb2dnZXIucmVjb3JkQXNzZXJ0KFwiW1Bhc3NdIFwiICsgdGVzdE5hbWUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBhc3NlcnQgZm9yIGNoZWNraW5nIGlmIGEgZnVuY3Rpb24gaXMgZXhlY3V0ZWQgd2l0aCBubyBleGNlcHRpb25zLlxuICAgICAqIElmIHRoZSBmdW5jdGlvbiBpcyBub3QgdGhyb3dpbmcgYW55IGV4Y2VwdGlvbiwgdGhlIHRlc3QgaXMgcGFzc2VkIG9yIGZhaWxlZCBvdGhlcndpc2UuXG4gICAgICogQHBhcmFtIHRlc3ROYW1lIHtTdHJpbmd9IC0gdGVzdCBuYW1lIG9yIGRlc2NyaXB0aW9uXG4gICAgICogQHBhcmFtIGZ1bmMge0Z1bmN0aW9ufSAtIGZ1bmN0aW9uIHRvIGJlIGludm9rZWRcbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWRkQ2hlY2soJ3Bhc3MnLCBmdW5jdGlvbih0ZXN0TmFtZSwgZnVuYyl7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGZ1bmMoKTtcbiAgICAgICAgICAgIGxvZ2dlci5yZWNvcmRBc3NlcnQoXCJbUGFzc10gXCIgKyB0ZXN0TmFtZSk7XG4gICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgIGxvZ2dlci5yZWNvcmRBc3NlcnQoXCJbRmFpbF0gXCIgKyB0ZXN0TmFtZSwgZXJyLnN0YWNrKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQWxpYXMgZm9yIHRoZSBwYXNzIGFzc2VydC5cbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWxpYXMoJ3Rlc3QnLCAncGFzcycpO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgYXNzZXJ0IGZvciBjaGVja2luZyBpZiBhIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIGV4ZWN1dGVkIGJlZm9yZSB0aW1lb3V0IGlzIHJlYWNoZWQgd2l0aG91dCBhbnkgZXhjZXB0aW9ucy5cbiAgICAgKiBJZiB0aGUgZnVuY3Rpb24gaXMgdGhyb3dpbmcgYW55IGV4Y2VwdGlvbiBvciB0aGUgdGltZW91dCBpcyByZWFjaGVkLCB0aGUgdGVzdCBpcyBmYWlsZWQgb3IgcGFzc2VkIG90aGVyd2lzZS5cbiAgICAgKiBAcGFyYW0gdGVzdE5hbWUge1N0cmluZ30gLSB0ZXN0IG5hbWUgb3IgZGVzY3JpcHRpb25cbiAgICAgKiBAcGFyYW0gZnVuYyB7RnVuY3Rpb259IC0gZnVuY3Rpb24gdG8gYmUgaW52b2tlZFxuICAgICAqIEBwYXJhbSB0aW1lb3V0IHtOdW1iZXJ9IC0gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmb3IgdGhlIHRpbWVvdXQgY2hlY2suIERlZmF1bHQgdG8gNTAwbXMuXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFkZENoZWNrKCdjYWxsYmFjaycsIGZ1bmN0aW9uKHRlc3ROYW1lLCBmdW5jLCB0aW1lb3V0KXtcblxuICAgICAgICBpZighZnVuYyB8fCB0eXBlb2YgZnVuYyAhPSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV3JvbmcgdXNhZ2Ugb2YgYXNzZXJ0LmNhbGxiYWNrIVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCF0aW1lb3V0KXtcbiAgICAgICAgICAgIHRpbWVvdXQgPSA1MDA7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcGFzc2VkID0gZmFsc2U7XG4gICAgICAgIGZ1bmN0aW9uIGNhbGxiYWNrKCl7XG4gICAgICAgICAgICBpZighcGFzc2VkKXtcbiAgICAgICAgICAgICAgICBwYXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGxvZ2dlci5yZWNvcmRBc3NlcnQoXCJbUGFzc10gXCIgKyB0ZXN0TmFtZSk7XG4gICAgICAgICAgICAgICAgc3VjY2Vzc1Rlc3QoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLnJlY29yZEFzc2VydChcIltGYWlsIChtdWx0aXBsZSBjYWxscyldIFwiICsgdGVzdE5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0cnl7XG4gICAgICAgICAgICBmdW5jKGNhbGxiYWNrKTtcbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgbG9nZ2VyLnJlY29yZEFzc2VydChcIltGYWlsXSBcIiArIHRlc3ROYW1lLCAgZXJyLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3NUZXN0KGZvcmNlKXtcbiAgICAgICAgICAgIGlmKCFwYXNzZWQpe1xuICAgICAgICAgICAgICAgIGxvZ2dlci5yZWNvcmRBc3NlcnQoXCJbRmFpbCBUaW1lb3V0XSBcIiArIHRlc3ROYW1lICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZXRUaW1lb3V0KHN1Y2Nlc3NUZXN0LCB0aW1lb3V0KVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgYXNzZXJ0IGZvciBjaGVja2luZyBpZiBhbiBhcnJheSBvZiBjYWxsYmFjayBmdW5jdGlvbnMgYXJlIGV4ZWN1dGVkIGluIGEgd2F0ZXJmYWxsIG1hbm5lcixcbiAgICAgKiBiZWZvcmUgdGltZW91dCBpcyByZWFjaGVkIHdpdGhvdXQgYW55IGV4Y2VwdGlvbnMuXG4gICAgICogSWYgYW55IG9mIHRoZSBmdW5jdGlvbnMgaXMgdGhyb3dpbmcgYW55IGV4Y2VwdGlvbiBvciB0aGUgdGltZW91dCBpcyByZWFjaGVkLCB0aGUgdGVzdCBpcyBmYWlsZWQgb3IgcGFzc2VkIG90aGVyd2lzZS5cbiAgICAgKiBAcGFyYW0gdGVzdE5hbWUge1N0cmluZ30gLSB0ZXN0IG5hbWUgb3IgZGVzY3JpcHRpb25cbiAgICAgKiBAcGFyYW0gZnVuYyB7RnVuY3Rpb259IC0gZnVuY3Rpb24gdG8gYmUgaW52b2tlZFxuICAgICAqIEBwYXJhbSB0aW1lb3V0IHtOdW1iZXJ9IC0gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmb3IgdGhlIHRpbWVvdXQgY2hlY2suIERlZmF1bHQgdG8gNTAwbXMuXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFkZENoZWNrKCdzdGVwcycsIGZ1bmN0aW9uKHRlc3ROYW1lLCBhcnIsIHRpbWVvdXQpe1xuICAgICAgICBpZighdGltZW91dCl7XG4gICAgICAgICAgICB0aW1lb3V0ID0gNTAwO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGN1cnJlbnRTdGVwID0gMDtcbiAgICAgICAgdmFyIHBhc3NlZCA9IGZhbHNlO1xuXG4gICAgICAgIGZ1bmN0aW9uIG5leHQoKXtcbiAgICAgICAgICAgIGlmKGN1cnJlbnRTdGVwID09IGFyci5sZW5ndGgpe1xuICAgICAgICAgICAgICAgIHBhc3NlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLnJlY29yZEFzc2VydChcIltQYXNzXSBcIiArIHRlc3ROYW1lICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZnVuYyA9IGFycltjdXJyZW50U3RlcF07XG4gICAgICAgICAgICBjdXJyZW50U3RlcCsrO1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIGZ1bmMobmV4dCk7XG4gICAgICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLnJlY29yZEFzc2VydChcIltGYWlsXSBcIiArIHRlc3ROYW1lICArIFwiIFthdCBzdGVwIFwiICsgY3VycmVudFN0ZXAgKyBcIl1cIiwgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3NUZXN0KGZvcmNlKXtcbiAgICAgICAgICAgIGlmKCFwYXNzZWQpe1xuICAgICAgICAgICAgICAgIGxvZ2dlci5yZWNvcmRBc3NlcnQoXCJbRmFpbCBUaW1lb3V0XSBcIiArIHRlc3ROYW1lICArIFwiIFthdCBzdGVwIFwiICsgY3VycmVudFN0ZXAgKyBcIl1cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZXRUaW1lb3V0KHN1Y2Nlc3NUZXN0LCB0aW1lb3V0KTtcbiAgICAgICAgbmV4dCgpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQWxpYXMgZm9yIHRoZSBzdGVwcyBhc3NlcnQuXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFsaWFzKCd3YXRlcmZhbGwnLCAnc3RlcHMnKTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGFzc2VydCBmb3IgYXN5bmNocm9ub3VzbHkgcHJpbnRpbmcgYWxsIGV4ZWN1dGlvbiBzdW1tYXJ5IGZyb20gbG9nZ2VyLmR1bXBXaHlzLlxuICAgICAqIEBwYXJhbSBtZXNzYWdlIHtTdHJpbmd9IC0gbWVzc2FnZSB0byBiZSByZWNvcmRlZFxuICAgICAqIEBwYXJhbSB0aW1lb3V0IHtOdW1iZXJ9IC0gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmb3IgdGhlIHRpbWVvdXQgY2hlY2suIERlZmF1bHQgdG8gNTAwbXMuXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFkZENoZWNrKCdlbmQnLCBmdW5jdGlvbih0aW1lb3V0LCBzaWxlbmNlKXtcbiAgICAgICAgaWYoIXRpbWVvdXQpe1xuICAgICAgICAgICAgdGltZW91dCA9IDEwMDA7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVyKCkge1xuICAgICAgICAgICAgbG9nZ2VyLmR1bXBXaHlzKCkuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgICAgICBsZXQgZXhlY3V0aW9uU3VtbWFyeSA9IGMuZ2V0RXhlY3V0aW9uU3VtbWFyeSgpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGV4ZWN1dGlvblN1bW1hcnksIG51bGwsIDQpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZighc2lsZW5jZSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJGb3JjaW5nIGV4aXQgYWZ0ZXJcIiwgdGltZW91dCwgXCJtc1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldFRpbWVvdXQoaGFuZGxlciwgdGltZW91dCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBhc3NlcnQgZm9yIHByaW50aW5nIGEgbWVzc2FnZSBhbmQgYXN5bmNocm9ub3VzbHkgcHJpbnRpbmcgYWxsIGxvZ3MgZnJvbSBsb2dnZXIuZHVtcFdoeXMuXG4gICAgICogQHBhcmFtIG1lc3NhZ2Uge1N0cmluZ30gLSBtZXNzYWdlIHRvIGJlIHJlY29yZGVkXG4gICAgICogQHBhcmFtIHRpbWVvdXQge051bWJlcn0gLSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZvciB0aGUgdGltZW91dCBjaGVjay4gRGVmYXVsdCB0byA1MDBtcy5cbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWRkQ2hlY2soJ2JlZ2luJywgZnVuY3Rpb24obWVzc2FnZSwgdGltZW91dCl7XG4gICAgICAgIGxvZ2dlci5yZWNvcmRBc3NlcnQobWVzc2FnZSk7XG4gICAgICAgIHNmLmFzc2VydC5lbmQodGltZW91dCwgdHJ1ZSk7XG4gICAgfSk7XG59IiwiLypcbiAgICBjaGVja3MgYXJlIGxpa2UgYXNzZXJ0cyBidXQgYXJlIGludGVuZGVkIHRvIGJlIHVzZWQgaW4gcHJvZHVjdGlvbiBjb2RlIHRvIGhlbHAgZGVidWdnaW5nIGFuZCBzaWduYWxpbmcgd3JvbmcgYmVoYXZpb3Vyc1xuXG4gKi9cblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oc2Ype1xuICAgIHNmLmV4Y2VwdGlvbnMucmVnaXN0ZXIoJ2NoZWNrRmFpbCcsIGZ1bmN0aW9uKGV4cGxhbmF0aW9uLCBlcnIpe1xuICAgICAgICB2YXIgc3RhY2s7XG4gICAgICAgIGlmKGVycil7XG4gICAgICAgICAgICBzdGFjayA9IGVyci5zdGFjaztcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhcIkNoZWNrIGZhaWxlZCBcIiwgZXhwbGFuYXRpb24sIGVyci5zdGFjaylcbiAgICB9KTtcblxuICAgIHNmLmNoZWNrLmFkZENoZWNrKCdlcXVhbCcsIGZ1bmN0aW9uKHYxICwgdjIsIGV4cGxhbmF0aW9uKXtcblxuICAgICAgICBpZih2MSAhPSB2Mil7XG4gICAgICAgICAgICBpZighZXhwbGFuYXRpb24pe1xuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uID0gIFwiIFtcIisgdjEgKyBcIiAhPSBcIiArIHYyICsgXCJdXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNmLmV4Y2VwdGlvbnMuY2hlY2tGYWlsKGV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICBzZi5jaGVjay5hZGRDaGVjaygndHJ1ZScsIGZ1bmN0aW9uKGIsIGV4cGxhbmF0aW9uKXtcbiAgICAgICAgaWYoIWIpe1xuICAgICAgICAgICAgaWYoIWV4cGxhbmF0aW9uKXtcbiAgICAgICAgICAgICAgICBleHBsYW5hdGlvbiA9ICBcIiBleHByZXNzaW9uIGlzIGZhbHNlIGJ1dCBpcyBleHBlY3RlZCB0byBiZSB0cnVlXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNmLmV4Y2VwdGlvbnMuY2hlY2tGYWlsKGV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICBzZi5jaGVjay5hZGRDaGVjaygnZmFsc2UnLCBmdW5jdGlvbihiLCBleHBsYW5hdGlvbil7XG4gICAgICAgIGlmKGIpe1xuICAgICAgICAgICAgaWYoIWV4cGxhbmF0aW9uKXtcbiAgICAgICAgICAgICAgICBleHBsYW5hdGlvbiA9ICBcIiBleHByZXNzaW9uIGlzIHRydWUgYnV0IGlzIGV4cGVjdGVkIHRvIGJlIGZhbHNlXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNmLmV4Y2VwdGlvbnMuY2hlY2tGYWlsKGV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2YuY2hlY2suYWRkQ2hlY2soJ25vdGVxdWFsJywgZnVuY3Rpb24odjEgLCB2MiwgZXhwbGFuYXRpb24pe1xuICAgICAgICBpZih2MSA9PSB2Mil7XG4gICAgICAgICAgICBpZighZXhwbGFuYXRpb24pe1xuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uID0gIFwiIFtcIisgdjEgKyBcIiA9PSBcIiArIHYyICsgXCJdXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZi5leGNlcHRpb25zLmNoZWNrRmFpbChleHBsYW5hdGlvbik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgLypcbiAgICAgICAgYWRkZWQgbWFpbmx5IGZvciB0ZXN0IHB1cnBvc2VzLCBiZXR0ZXIgdGVzdCBmcmFtZXdvcmtzIGxpa2UgbW9jaGEgY291bGQgYmUgbXVjaCBiZXR0ZXIgOilcbiAgICAqL1xuICAgIHNmLmNoZWNrLmFkZENoZWNrKCdmYWlsJywgZnVuY3Rpb24odGVzdE5hbWUgLGZ1bmMpe1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICBmdW5jKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltGYWlsXSBcIiArIHRlc3ROYW1lICk7XG4gICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW1Bhc3NdIFwiICsgdGVzdE5hbWUgKTtcbiAgICAgICAgfVxuICAgIH0pXG5cblxuICAgIHNmLmNoZWNrLmFkZENoZWNrKCdwYXNzJywgZnVuY3Rpb24odGVzdE5hbWUgLGZ1bmMpe1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICBmdW5jKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltQYXNzXSBcIiArIHRlc3ROYW1lICk7XG4gICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW0ZhaWxdIFwiICsgdGVzdE5hbWUgICwgIGVyci5zdGFjayk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgc2YuY2hlY2suYWxpYXMoJ3Rlc3QnLCdwYXNzJyk7XG5cblxuICAgIHNmLmNoZWNrLmFkZENoZWNrKCdjYWxsYmFjaycsIGZ1bmN0aW9uKHRlc3ROYW1lICxmdW5jLCB0aW1lb3V0KXtcbiAgICAgICAgaWYoIXRpbWVvdXQpe1xuICAgICAgICAgICAgdGltZW91dCA9IDUwMDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGFzc2VkID0gZmFsc2U7XG4gICAgICAgIGZ1bmN0aW9uIGNhbGxiYWNrKCl7XG4gICAgICAgICAgICBpZighcGFzc2VkKXtcbiAgICAgICAgICAgICAgICBwYXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW1Bhc3NdIFwiICsgdGVzdE5hbWUgKTtcbiAgICAgICAgICAgICAgICBTdWNjZXNzVGVzdCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIltGYWlsIChtdWx0aXBsZSBjYWxscyldIFwiICsgdGVzdE5hbWUgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0cnl7XG4gICAgICAgICAgICBmdW5jKGNhbGxiYWNrKTtcbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJbRmFpbF0gXCIgKyB0ZXN0TmFtZSAgLCAgZXJyLnN0YWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIFN1Y2Nlc3NUZXN0KGZvcmNlKXtcbiAgICAgICAgICAgIGlmKCFwYXNzZWQpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW0ZhaWwgVGltZW91dF0gXCIgKyB0ZXN0TmFtZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2V0VGltZW91dChTdWNjZXNzVGVzdCwgdGltZW91dClcbiAgICB9KTtcblxuXG4gICAgc2YuY2hlY2suYWRkQ2hlY2soJ3N0ZXBzJywgZnVuY3Rpb24odGVzdE5hbWUgLCBhcnIsIHRpbWVvdXQpe1xuICAgICAgICB2YXIgIGN1cnJlbnRTdGVwID0gMDtcbiAgICAgICAgdmFyIHBhc3NlZCA9IGZhbHNlO1xuICAgICAgICBpZighdGltZW91dCl7XG4gICAgICAgICAgICB0aW1lb3V0ID0gNTAwO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gbmV4dCgpe1xuICAgICAgICAgICAgaWYoY3VycmVudFN0ZXAgPT0gYXJyLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgcGFzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIltQYXNzXSBcIiArIHRlc3ROYW1lICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBmdW5jID0gYXJyW2N1cnJlbnRTdGVwXTtcbiAgICAgICAgICAgIGN1cnJlbnRTdGVwKys7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgZnVuYyhuZXh0KTtcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIltGYWlsXSBcIiArIHRlc3ROYW1lICAsXCJcXG5cXHRcIiAsIGVyci5zdGFjayArIFwiXFxuXFx0XCIgLCBcIiBbYXQgc3RlcCBcIiwgY3VycmVudFN0ZXAgKyBcIl1cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBTdWNjZXNzVGVzdChmb3JjZSl7XG4gICAgICAgICAgICBpZighcGFzc2VkKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIltGYWlsIFRpbWVvdXRdIFwiICsgdGVzdE5hbWUgKyBcIlxcblxcdFwiICwgXCIgW2F0IHN0ZXAgXCIsIGN1cnJlbnRTdGVwKyBcIl1cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZXRUaW1lb3V0KFN1Y2Nlc3NUZXN0LCB0aW1lb3V0KTtcbiAgICAgICAgbmV4dCgpO1xuICAgIH0pO1xuXG4gICAgc2YuY2hlY2suYWxpYXMoJ3dhdGVyZmFsbCcsJ3N0ZXBzJyk7XG4gICAgc2YuY2hlY2suYWxpYXMoJ25vdEVxdWFsJywnbm90ZXF1YWwnKTtcblxuICAgIHNmLmNoZWNrLmFkZENoZWNrKCdlbmQnLCBmdW5jdGlvbih0aW1lT3V0LCBzaWxlbmNlKXtcbiAgICAgICAgaWYoIXRpbWVPdXQpe1xuICAgICAgICAgICAgdGltZU91dCA9IDEwMDA7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZighc2lsZW5jZSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJGb3JjaW5nIGV4aXQgYWZ0ZXJcIiwgdGltZU91dCwgXCJtc1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICAgICAgfSwgdGltZU91dClcbiAgICB9KTtcblxuXG4gICAgc2YuY2hlY2suYWRkQ2hlY2soJ2JlZ2luJywgZnVuY3Rpb24obWVzc2FnZSwgdGltZU91dCl7XG4gICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICBzZi5jaGVjay5lbmQodGltZU91dCwgdHJ1ZSk7XG4gICAgfSk7XG5cblxufSIsImV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNmKXtcbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyB1bmtub3duIGV4Y2VwdGlvbiBoYW5kbGVyLlxuICAgICAqL1xuICAgIHNmLmV4Y2VwdGlvbnMucmVnaXN0ZXIoJ3Vua25vd24nLCBmdW5jdGlvbihleHBsYW5hdGlvbil7XG4gICAgICAgIGV4cGxhbmF0aW9uID0gZXhwbGFuYXRpb24gfHwgXCJcIjtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBcIlVua25vd24gZXhjZXB0aW9uXCIgKyBleHBsYW5hdGlvbjtcbiAgICAgICAgdGhyb3cobWVzc2FnZSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyByZXNlbmQgZXhjZXB0aW9uIGhhbmRsZXIuXG4gICAgICovXG4gICAgc2YuZXhjZXB0aW9ucy5yZWdpc3RlcigncmVzZW5kJywgZnVuY3Rpb24oZXhjZXB0aW9ucyl7XG4gICAgICAgIHRocm93KGV4Y2VwdGlvbnMpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgbm90SW1wbGVtZW50ZWQgZXhjZXB0aW9uIGhhbmRsZXIuXG4gICAgICovXG4gICAgc2YuZXhjZXB0aW9ucy5yZWdpc3Rlcignbm90SW1wbGVtZW50ZWQnLCBmdW5jdGlvbihleHBsYW5hdGlvbil7XG4gICAgICAgIGV4cGxhbmF0aW9uID0gZXhwbGFuYXRpb24gfHwgXCJcIjtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBcIm5vdEltcGxlbWVudGVkIGV4Y2VwdGlvblwiICsgZXhwbGFuYXRpb247XG4gICAgICAgIHRocm93KG1lc3NhZ2UpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgc2VjdXJpdHkgZXhjZXB0aW9uIGhhbmRsZXIuXG4gICAgICovXG4gICAgc2YuZXhjZXB0aW9ucy5yZWdpc3Rlcignc2VjdXJpdHknLCBmdW5jdGlvbihleHBsYW5hdGlvbil7XG4gICAgICAgIGV4cGxhbmF0aW9uID0gZXhwbGFuYXRpb24gfHwgXCJcIjtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBcInNlY3VyaXR5IGV4Y2VwdGlvblwiICsgZXhwbGFuYXRpb247XG4gICAgICAgIHRocm93KG1lc3NhZ2UpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgZHVwbGljYXRlRGVwZW5kZW5jeSBleGNlcHRpb24gaGFuZGxlci5cbiAgICAgKi9cbiAgICBzZi5leGNlcHRpb25zLnJlZ2lzdGVyKCdkdXBsaWNhdGVEZXBlbmRlbmN5JywgZnVuY3Rpb24odmFyaWFibGUpe1xuICAgICAgICB2YXJpYWJsZSA9IHZhcmlhYmxlIHx8IFwiXCI7XG4gICAgICAgIGxldCBtZXNzYWdlID0gXCJkdXBsaWNhdGVEZXBlbmRlbmN5IGV4Y2VwdGlvblwiICsgdmFyaWFibGU7XG4gICAgICAgIHRocm93KG1lc3NhZ2UpO1xuICAgIH0pO1xufSIsImNvbnN0IExPR19MRVZFTFMgPSB7XG4gICAgSEFSRF9FUlJPUjogICAgIDAsICAvLyBzeXN0ZW0gbGV2ZWwgY3JpdGljYWwgZXJyb3I6IGhhcmRFcnJvclxuICAgIEVSUk9SOiAgICAgICAgICAxLCAgLy8gcG90ZW50aWFsbHkgY2F1c2luZyB1c2VyJ3MgZGF0YSBsb29zaW5nIGVycm9yOiBlcnJvclxuICAgIExPR19FUlJPUjogICAgICAyLCAgLy8gbWlub3IgYW5ub3lhbmNlLCByZWNvdmVyYWJsZSBlcnJvcjogICBsb2dFcnJvclxuICAgIFVYX0VSUk9SOiAgICAgICAzLCAgLy8gdXNlciBleHBlcmllbmNlIGNhdXNpbmcgaXNzdWVzIGVycm9yOiAgdXhFcnJvclxuICAgIFdBUk46ICAgICAgICAgICA0LCAgLy8gd2FybmluZyxwb3NzaWJsZSBpc3VlcyBidXQgc29tZWhvdyB1bmNsZWFyIGJlaGF2aW91cjogd2FyblxuICAgIElORk86ICAgICAgICAgICA1LCAgLy8gc3RvcmUgZ2VuZXJhbCBpbmZvIGFib3V0IHRoZSBzeXN0ZW0gd29ya2luZzogaW5mb1xuICAgIERFQlVHOiAgICAgICAgICA2LCAgLy8gc3lzdGVtIGxldmVsIGRlYnVnOiBkZWJ1Z1xuICAgIExPQ0FMX0RFQlVHOiAgICA3LCAgLy8gbG9jYWwgbm9kZS9zZXJ2aWNlIGRlYnVnOiBsZGVidWdcbiAgICBVU0VSX0RFQlVHOiAgICAgOCwgIC8vIHVzZXIgbGV2ZWwgZGVidWc7IHVkZWJ1Z1xuICAgIERFVl9ERUJVRzogICAgICA5LCAgLy8gZGV2ZWxvcG1lbnQgdGltZSBkZWJ1ZzogZGRlYnVnXG4gICAgV0hZUzogICAgICAgICAgICAxMCwgLy8gd2h5TG9nIGZvciBjb2RlIHJlYXNvbmluZ1xuICAgIFRFU1RfUkVTVUxUOiAgICAxMSwgLy8gdGVzdFJlc3VsdCB0byBsb2cgcnVubmluZyB0ZXN0c1xufVxuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihzZil7XG5cbiAgICAvKipcbiAgICAgKiBSZWNvcmRzIGxvZyBtZXNzYWdlcyBmcm9tIHZhcmlvdXMgdXNlIGNhc2VzLlxuICAgICAqIEBwYXJhbSByZWNvcmQge1N0cmluZ30gLSBsb2cgbWVzc2FnZS5cbiAgICAgKi9cbiAgICBzZi5sb2dnZXIucmVjb3JkID0gZnVuY3Rpb24ocmVjb3JkKXtcbiAgICAgICAgdmFyIGRpc3BsYXlPbkNvbnNvbGUgPSB0cnVlO1xuICAgICAgICBpZihwcm9jZXNzLnNlbmQpIHtcbiAgICAgICAgICAgIHByb2Nlc3Muc2VuZChyZWNvcmQpO1xuICAgICAgICAgICAgZGlzcGxheU9uQ29uc29sZSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZGlzcGxheU9uQ29uc29sZSkge1xuICAgICAgICAgICAgbGV0IHByZXR0eUxvZyA9IEpTT04uc3RyaW5naWZ5KHJlY29yZCwgbnVsbCwgMik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwcmV0dHlMb2cpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkaW5nIGNhc2UgZm9yIGxvZ2dpbmcgc3lzdGVtIGxldmVsIGNyaXRpY2FsIGVycm9ycy5cbiAgICAgKi9cbiAgICBzZi5sb2dnZXIuYWRkQ2FzZSgnaGFyZEVycm9yJywgZnVuY3Rpb24obWVzc2FnZSwgZXhjZXB0aW9uLCBhcmdzLCBwb3MsIGRhdGEpe1xuICAgICAgICBzZi5sb2dnZXIucmVjb3JkKGNyZWF0ZURlYnVnUmVjb3JkKExPR19MRVZFTFMuSEFSRF9FUlJPUiwgJ3N5c3RlbUVycm9yJywgbWVzc2FnZSwgZXhjZXB0aW9uLCB0cnVlLCBhcmdzLCBwb3MsIGRhdGEpKTtcbiAgICB9LCBbXG4gICAgICAgIHtcbiAgICAgICAgICAgICdtZXNzYWdlJzonZXhwbGFuYXRpb24nXG4gICAgICAgIH1cbiAgICBdKTtcblxuICAgIC8qKlxuICAgICAqIEFkZGluZyBjYXNlIGZvciBsb2dnaW5nIHBvdGVudGlhbGx5IGNhdXNpbmcgdXNlcidzIGRhdGEgbG9vc2luZyBlcnJvcnMuXG4gICAgICovXG4gICAgc2YubG9nZ2VyLmFkZENhc2UoJ2Vycm9yJywgZnVuY3Rpb24obWVzc2FnZSwgZXhjZXB0aW9uLCBhcmdzLCBwb3MsIGRhdGEpe1xuICAgICAgICBzZi5sb2dnZXIucmVjb3JkKGNyZWF0ZURlYnVnUmVjb3JkKExPR19MRVZFTFMuRVJST1IsICdlcnJvcicsIG1lc3NhZ2UsIGV4Y2VwdGlvbiwgdHJ1ZSwgYXJncywgcG9zLCBkYXRhKSk7XG4gICAgfSwgW1xuICAgICAgICB7XG4gICAgICAgICAgICAnbWVzc2FnZSc6J2V4cGxhbmF0aW9uJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICAnZXhjZXB0aW9uJzonZXhjZXB0aW9uJ1xuICAgICAgICB9XG4gICAgXSk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRpbmcgY2FzZSBmb3IgbG9nZ2luZyBtaW5vciBhbm5veWFuY2UsIHJlY292ZXJhYmxlIGVycm9ycy5cbiAgICAgKi9cbiAgICBzZi5sb2dnZXIuYWRkQ2FzZSgnbG9nRXJyb3InLCBmdW5jdGlvbihtZXNzYWdlLCBleGNlcHRpb24sIGFyZ3MsIHBvcywgZGF0YSl7XG4gICAgICAgIHNmLmxvZ2dlci5yZWNvcmQoY3JlYXRlRGVidWdSZWNvcmQoTE9HX0xFVkVMUy5MT0dfRVJST1IsICdsb2dFcnJvcicsIG1lc3NhZ2UsIGV4Y2VwdGlvbiwgdHJ1ZSwgYXJncywgcG9zLCBkYXRhKSk7XG4gICAgfSwgW1xuICAgICAgICB7XG4gICAgICAgICAgICAnbWVzc2FnZSc6J2V4cGxhbmF0aW9uJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICAnZXhjZXB0aW9uJzonZXhjZXB0aW9uJ1xuICAgICAgICB9XG4gICAgXSk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRpbmcgY2FzZSBmb3IgbG9nZ2luZyB1c2VyIGV4cGVyaWVuY2UgY2F1c2luZyBpc3N1ZXMgZXJyb3JzLlxuICAgICAqL1xuICAgIHNmLmxvZ2dlci5hZGRDYXNlKCd1eEVycm9yJywgZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgIHNmLmxvZ2dlci5yZWNvcmQoY3JlYXRlRGVidWdSZWNvcmQoTE9HX0xFVkVMUy5VWF9FUlJPUiwgJ3V4RXJyb3InLCBtZXNzYWdlLCBudWxsLCBmYWxzZSkpO1xuICAgIH0sIFtcbiAgICAgICAge1xuICAgICAgICAgICAgJ21lc3NhZ2UnOidleHBsYW5hdGlvbidcbiAgICAgICAgfVxuICAgIF0pO1xuXG4gICAgLyoqXG4gICAgICogQWRkaW5nIGNhc2UgZm9yIGxvZ2dpbmcgdGhyb3R0bGluZyBtZXNzYWdlcy5cbiAgICAgKi9cbiAgICBzZi5sb2dnZXIuYWRkQ2FzZSgndGhyb3R0bGluZycsIGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICBzZi5sb2dnZXIucmVjb3JkKGNyZWF0ZURlYnVnUmVjb3JkKExPR19MRVZFTFMuV0FSTiwgJ3Rocm90dGxpbmcnLCBtZXNzYWdlLCBudWxsLCBmYWxzZSkpO1xuICAgIH0sIFtcbiAgICAgICAge1xuICAgICAgICAgICAgJ21lc3NhZ2UnOidleHBsYW5hdGlvbidcbiAgICAgICAgfVxuICAgIF0pO1xuXG4gICAgLyoqXG4gICAgICogQWRkaW5nIGNhc2UgZm9yIGxvZ2dpbmcgd2FybmluZywgcG9zc2libGUgaXNzdWVzLCBidXQgc29tZWhvdyB1bmNsZWFyIGJlaGF2aW91cnMuXG4gICAgICovXG4gICAgc2YubG9nZ2VyLmFkZENhc2UoJ3dhcm5pbmcnLCBmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgc2YubG9nZ2VyLnJlY29yZChjcmVhdGVEZWJ1Z1JlY29yZChMT0dfTEVWRUxTLldBUk4sICd3YXJuaW5nJywgbWVzc2FnZSxudWxsLCBmYWxzZSwgYXJndW1lbnRzLCAwKSk7XG4gICAgfSwgW1xuICAgICAgICB7XG4gICAgICAgICAgICAnbWVzc2FnZSc6J2V4cGxhbmF0aW9uJ1xuICAgICAgICB9XG4gICAgXSk7XG4gICAgXG4gICAgc2YubG9nZ2VyLmFsaWFzKCd3YXJuJywgJ3dhcm5pbmcnKTtcblxuICAgIC8qKlxuICAgICAqIEFkZGluZyBjYXNlIGZvciBsb2dnaW5nIGdlbmVyYWwgaW5mbyBhYm91dCB0aGUgc3lzdGVtIHdvcmtpbmcuXG4gICAgICovXG4gICAgc2YubG9nZ2VyLmFkZENhc2UoJ2luZm8nLCBmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgc2YubG9nZ2VyLnJlY29yZChjcmVhdGVEZWJ1Z1JlY29yZChMT0dfTEVWRUxTLklORk8sICdpbmZvJywgbWVzc2FnZSxudWxsLCBmYWxzZSwgYXJndW1lbnRzLCAwKSk7XG4gICAgfSwgW1xuICAgICAgICB7XG4gICAgICAgICAgICAnbWVzc2FnZSc6J2V4cGxhbmF0aW9uJ1xuICAgICAgICB9XG4gICAgXSk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRpbmcgY2FzZSBmb3IgbG9nZ2luZyBzeXN0ZW0gbGV2ZWwgZGVidWcgbWVzc2FnZXMuXG4gICAgICovXG4gICAgc2YubG9nZ2VyLmFkZENhc2UoJ2RlYnVnJywgZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgIHNmLmxvZ2dlci5yZWNvcmQoY3JlYXRlRGVidWdSZWNvcmQoTE9HX0xFVkVMUy5ERUJVRywgJ2RlYnVnJywgbWVzc2FnZSxudWxsLCBmYWxzZSwgYXJndW1lbnRzLCAwKSk7XG4gICAgfSwgW1xuICAgICAgICB7XG4gICAgICAgICAgICAnbWVzc2FnZSc6J2V4cGxhbmF0aW9uJ1xuICAgICAgICB9XG4gICAgXSk7XG5cblxuICAgIC8qKlxuICAgICAqIEFkZGluZyBjYXNlIGZvciBsb2dnaW5nIGxvY2FsIG5vZGUvc2VydmljZSBkZWJ1ZyBtZXNzYWdlcy5cbiAgICAgKi9cbiAgICBzZi5sb2dnZXIuYWRkQ2FzZSgnbGRlYnVnJywgZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgIHNmLmxvZ2dlci5yZWNvcmQoY3JlYXRlRGVidWdSZWNvcmQoTE9HX0xFVkVMUy5MT0NBTF9ERUJVRywgJ2xkZWJ1ZycsIG1lc3NhZ2UsIG51bGwsIGZhbHNlLCBhcmd1bWVudHMsIDApKTtcbiAgICB9LCBbXG4gICAgICAgIHtcbiAgICAgICAgICAgICdtZXNzYWdlJzonZXhwbGFuYXRpb24nXG4gICAgICAgIH1cbiAgICBdKTtcblxuICAgIC8qKlxuICAgICAqIEFkZGluZyBjYXNlIGZvciBsb2dnaW5nIHVzZXIgbGV2ZWwgZGVidWcgbWVzc2FnZXMuXG4gICAgICovXG4gICAgc2YubG9nZ2VyLmFkZENhc2UoJ3VkZWJ1ZycsIGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICBzZi5sb2dnZXIucmVjb3JkKGNyZWF0ZURlYnVnUmVjb3JkKExPR19MRVZFTFMuVVNFUl9ERUJVRywgJ3VkZWJ1ZycsIG1lc3NhZ2UgLG51bGwsIGZhbHNlLCBhcmd1bWVudHMsIDApKTtcbiAgICB9LCBbXG4gICAgICAgIHtcbiAgICAgICAgICAgICdtZXNzYWdlJzonZXhwbGFuYXRpb24nXG4gICAgICAgIH1cbiAgICBdKTtcblxuICAgIC8qKlxuICAgICAqIEFkZGluZyBjYXNlIGZvciBsb2dnaW5nIGRldmVsb3BtZW50IGRlYnVnIG1lc3NhZ2VzLlxuICAgICAqL1xuICAgIHNmLmxvZ2dlci5hZGRDYXNlKCdkZXZlbCcsIGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICBzZi5sb2dnZXIucmVjb3JkKGNyZWF0ZURlYnVnUmVjb3JkKExPR19MRVZFTFMuREVWX0RFQlVHLCAnZGV2ZWwnLCBtZXNzYWdlLCBudWxsLCBmYWxzZSwgYXJndW1lbnRzLCAwKSk7XG4gICAgfSwgW1xuICAgICAgICB7XG4gICAgICAgICAgICAnbWVzc2FnZSc6J2V4cGxhbmF0aW9uJ1xuICAgICAgICB9XG4gICAgXSk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRpbmcgY2FzZSBmb3IgbG9nZ2luZyBcIndoeXNcIiByZWFzb25pbmcgbWVzc2FnZXMuXG4gICAgICovXG4gICAgc2YubG9nZ2VyLmFkZENhc2UoXCJsb2dXaHlcIiwgZnVuY3Rpb24obG9nT25seUN1cnJlbnRXaHlDb250ZXh0KXtcbiAgICAgICAgc2YubG9nZ2VyLnJlY29yZChjcmVhdGVEZWJ1Z1JlY29yZChMT0dfTEVWRUxTLldIWVMsICdsb2d3aHknLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBsb2dPbmx5Q3VycmVudFdoeUNvbnRleHQpKVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQWRkaW5nIGNhc2UgZm9yIGxvZ2dpbmcgYXNzZXJ0cyBtZXNzYWdlcyB0byBydW5uaW5nIHRlc3RzLlxuICAgICAqL1xuICAgIHNmLmxvZ2dlci5hZGRDYXNlKFwicmVjb3JkQXNzZXJ0XCIsIGZ1bmN0aW9uIChtZXNzYWdlLCBlcnJvcixzaG93U3RhY2spe1xuICAgICAgICBzZi5sb2dnZXIucmVjb3JkKGNyZWF0ZURlYnVnUmVjb3JkKExPR19MRVZFTFMuVEVTVF9SRVNVTFQsICdhc3NlcnQnLCBtZXNzYWdlLCBlcnJvciwgc2hvd1N0YWNrKSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmljIG1ldGhvZCB0byBjcmVhdGUgc3RydWN0dXJlZCBkZWJ1ZyByZWNvcmRzIGJhc2VkIG9uIHRoZSBsb2cgbGV2ZWwuXG4gICAgICogQHBhcmFtIGxldmVsIHtOdW1iZXJ9IC0gbnVtYmVyIGZyb20gMS0xMSwgdXNlZCB0byBpZGVudGlmeSB0aGUgbGV2ZWwgb2YgYXR0ZW50aW9uIHRoYXQgYSBsb2cgZW50cnkgc2hvdWxkIGdldCBmcm9tIG9wZXJhdGlvbnMgcG9pbnQgb2Ygdmlld1xuICAgICAqIEBwYXJhbSB0eXBlIHtTdHJpbmd9IC0gaWRlbnRpZmllciBuYW1lIGZvciBsb2cgdHlwZVxuICAgICAqIEBwYXJhbSBtZXNzYWdlIHtTdHJpbmd9IC0gZGVzY3JpcHRpb24gb2YgdGhlIGRlYnVnIHJlY29yZFxuICAgICAqIEBwYXJhbSBleGNlcHRpb24ge1N0cmluZ30gLSBleGNlcHRpb24gZGV0YWlscyBpZiBhbnlcbiAgICAgKiBAcGFyYW0gc2F2ZVN0YWNrIHtCb29sZWFufSAtIGlmIHNldCB0byB0cnVlLCB0aGUgZXhjZXB0aW9uIGNhbGwgc3RhY2sgd2lsbCBiZSBhZGRlZCB0byB0aGUgZGVidWcgcmVjb3JkXG4gICAgICogQHBhcmFtIGFyZ3Mge0FycmF5fSAtIGFyZ3VtZW50cyBvZiB0aGUgY2FsbGVyIGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHBvcyB7TnVtYmVyfSAtIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIGRhdGEge1N0cmluZ3xOdW1iZXJ8QXJyYXl8T2JqZWN0fSAtIHBheWxvYWQgaW5mb3JtYXRpb25cbiAgICAgKiBAcGFyYW0gbG9nT25seUN1cnJlbnRXaHlDb250ZXh0IC0gaWYgd2h5cyBpcyBlbmFibGVkLCBvbmx5IHRoZSBjdXJyZW50IGNvbnRleHQgd2lsbCBiZSBsb2dnZWRcbiAgICAgKiBAcmV0dXJucyBEZWJ1ZyByZWNvcmQgbW9kZWwge09iamVjdH0gd2l0aCB0aGUgZm9sbG93aW5nIGZpZWxkczpcbiAgICAgKiBbcmVxdWlyZWRdOiBsZXZlbDogKiwgdHlwZTogKiwgdGltZXN0YW1wOiBudW1iZXIsIG1lc3NhZ2U6ICosIGRhdGE6ICogYW5kXG4gICAgICogW29wdGlvbmFsXTogc3RhY2s6ICosIGV4Y2VwdGlvbjogKiwgYXJnczogKiwgd2h5TG9nOiAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlRGVidWdSZWNvcmQobGV2ZWwsIHR5cGUsIG1lc3NhZ2UsIGV4Y2VwdGlvbiwgc2F2ZVN0YWNrLCBhcmdzLCBwb3MsIGRhdGEsIGxvZ09ubHlDdXJyZW50V2h5Q29udGV4dCl7XG5cbiAgICAgICAgdmFyIHJldCA9IHtcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbCxcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCksXG4gICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmKHNhdmVTdGFjayl7XG4gICAgICAgICAgICB2YXIgc3RhY2sgPSAnJztcbiAgICAgICAgICAgIGlmKGV4Y2VwdGlvbil7XG4gICAgICAgICAgICAgICAgc3RhY2sgPSBleGNlcHRpb24uc3RhY2s7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0YWNrICA9IChuZXcgRXJyb3IoKSkuc3RhY2s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXQuc3RhY2sgPSBzdGFjaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGV4Y2VwdGlvbil7XG4gICAgICAgICAgICByZXQuZXhjZXB0aW9uID0gZXhjZXB0aW9uLm1lc3NhZ2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZihhcmdzKXtcbiAgICAgICAgICAgIHJldC5hcmdzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShhcmdzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZihwcm9jZXNzLmVudi5SVU5fV0lUSF9XSFlTKXtcbiAgICAgICAgICAgIHZhciB3aHkgPSByZXF1aXJlKCd3aHlzJyk7XG4gICAgICAgICAgICBpZihsb2dPbmx5Q3VycmVudFdoeUNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICByZXRbJ3doeUxvZyddID0gd2h5LmdldEdsb2JhbEN1cnJlbnRDb250ZXh0KCkuZ2V0RXhlY3V0aW9uU3VtbWFyeSgpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgcmV0Wyd3aHlMb2cnXSA9IHdoeS5nZXRBbGxDb250ZXh0cygpLm1hcChmdW5jdGlvbiAoY29udGV4dCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udGV4dC5nZXRFeGVjdXRpb25TdW1tYXJ5KClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG59XG5cbiIsImlmKHR5cGVvZiAkJCA9PT0gJ3VuZGVmaW5lZCcgfHwgJCQgPT09IG51bGwpe1xuICAgIC8vaWYgcnVubmluZyBmcm9tIGEgUHJpdmF0ZVNreSBlbnZpcm9ubWVudCBjYWxsZmxvdyBtb2R1bGUgYW5kIG90aGVyIGRlcHMgYXJlIGFscmVhZHkgbG9hZGVkXG5cdHJlcXVpcmUoXCIuLi8uLi8uLi9lbmdpbmUvY29yZVwiKS5lbmFibGVUZXN0aW5nKCk7XG59XG5cbmNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuY29uc3QgZm9ya2VyID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuXG52YXIgZ2xvYlRvUmVnRXhwID0gIHJlcXVpcmUoXCIuL3V0aWxzL2dsb2ItdG8tcmVnZXhwXCIpO1xuXG52YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgICBjb25mRmlsZU5hbWU6IFwiZG91YmxlLWNoZWNrLmpzb25cIiwgICAgICAvLyBuYW1lIG9mIHRoZSBjb25mIGZpbGVcbiAgICBmaWxlRXh0OiBcIi5qc1wiLCAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0ZXN0IGZpbGUgc3VwcG9ydGVkIGJ5IGV4dGVuc2lvblxuICAgIG1hdGNoRGlyczogWyd0ZXN0JywgJ3Rlc3RzJ10sICAgICAgICAgICAvLyBkaXJzIG5hbWVzIGZvciB0ZXN0cyAtIGNhc2UgaW5zZW5zaXRpdmUgKHVzZWQgaW4gZGlzY292ZXJ5IHByb2Nlc3MpXG4gICAgdGVzdHNEaXI6IHByb2Nlc3MuY3dkKCksICAgICAgICAgICAgICAgIC8vIHBhdGggdG8gdGhlIHJvb3QgdGVzdHMgbG9jYXRpb25cbiAgICByZXBvcnRzOiB7XG4gICAgICAgIGJhc2VQYXRoOiBwcm9jZXNzLmN3ZCgpLCAgICAgICAgICAgIC8vIHBhdGggd2hlcmUgdGhlIHJlcG9ydHMgd2lsbCBiZSBzYXZlZFxuICAgICAgICBwcmVmaXg6IFwiUmVwb3J0LVwiLCAgICAgICAgICAgICAgICAgIC8vIHByZWZpeCBmb3IgcmVwb3J0IGZpbGVzLCBmaWxlbmFtZSBwYXR0ZXJuOiBbcHJlZml4XS17dGltZXN0YW1wfXtleHR9XG4gICAgICAgIGV4dDogXCIudHh0XCIgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVwb3J0IGZpbGUgZXh0ZW5zaW9uXG4gICAgfVxufVxuXG5jb25zdCBUQUcgPSBcIltURVNUX1JVTk5FUl1cIjtcbmNvbnN0IE1BWF9XT1JLRVJTID0gcHJvY2Vzcy5lbnZbJ0RPVUJMRV9DSEVDS19QT09MX1NJWkUnXSB8fCAxMDtcbmNvbnN0IERFQlVHID0gdHlwZW9mIHY4ZGVidWcgPT09ICdvYmplY3QnO1xuXG5jb25zdCBURVNUX1NUQVRFUyA9IHtcbiAgICBSRUFEWTogJ3JlYWR5JyxcbiAgICBSVU5OSU5HOiAncnVubmluZycsXG4gICAgRklOSVNIRUQ6ICdmaW5pc2hlZCcsXG4gICAgVElNRU9VVDogJ3RpbWVvdXQnXG59XG5cbi8vIFNlc3Npb24gb2JqZWN0XG52YXIgZGVmYXVsdFNlc3Npb24gPSB7XG4gICAgdGVzdENvdW50OiAwLFxuICAgIGN1cnJlbnRUZXN0SW5kZXg6IDAsXG4gICAgZGVidWdQb3J0OiBwcm9jZXNzLmRlYnVnUG9ydCwgICAvLyBjdXJyZW50IHByb2Nlc3MgZGVidWcgcG9ydC4gVGhlIGNoaWxkIHByb2Nlc3Mgd2lsbCBiZSBpbmNyZWFzZWQgZnJvbSB0aGlzIHBvcnRcbiAgICB3b3JrZXJzOiB7XG4gICAgICAgIHJ1bm5pbmc6IDAsXG4gICAgICAgIHRlcm1pbmF0ZWQ6IDBcbiAgICB9XG59XG5cbi8vIFRlbXBsYXRlIHN0cnVjdHVyZSBmb3IgdGVzdCByZXBvcnRzLlxudmFyIHJlcG9ydEZpbGVTdHJ1Y3R1cmUgPSB7XG4gICAgY291bnQ6IDAsXG4gICAgc3VpdGVzOiB7XG4gICAgICAgIGNvdW50OiAwLFxuICAgICAgICBpdGVtczogW11cbiAgICB9LFxuICAgIHBhc3NlZDoge1xuICAgICAgICBjb3VudDogMCxcbiAgICAgICAgaXRlbXM6IFtdXG4gICAgfSxcbiAgICBmYWlsZWQ6IHtcbiAgICAgICAgY291bnQ6IDAsXG4gICAgICAgIGl0ZW1zOiBbXVxuICAgIH0sXG59XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNmKXtcbiAgICBzZi50ZXN0UnVubmVyID0gJCQuZmxvdy5jcmVhdGUoXCJ0ZXN0UnVubmVyXCIsIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEluaXRpYWxpemF0aW9uIG9mIHRoZSB0ZXN0IHJ1bm5lci5cbiAgICAgICAgICogQHBhcmFtIGNvbmZpZyB7T2JqZWN0fSAtIHNldHRpbmdzIG9iamVjdCB0aGF0IHdpbGwgYmUgbWVyZ2VkIHdpdGggdGhlIGRlZmF1bHQgb25lXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX2luaXQ6IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLl9fZXh0ZW5kKGRlZmF1bHRDb25maWcsIGNvbmZpZyk7XG4gICAgICAgICAgICB0aGlzLnRlc3RUcmVlID0ge307XG4gICAgICAgICAgICB0aGlzLnRlc3RMaXN0ID0gW107XG5cbiAgICAgICAgICAgIHRoaXMuc2Vzc2lvbiA9IGRlZmF1bHRTZXNzaW9uO1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgcmVwb3J0cyBkaXJlY3RvcnkgaWYgbm90IGV4aXN0XG4gICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmModGhpcy5jb25maWcucmVwb3J0cy5iYXNlUGF0aCkpe1xuICAgICAgICAgICAgICAgIGZzLm1rZGlyU3luYyh0aGlzLmNvbmZpZy5yZXBvcnRzLmJhc2VQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1haW4gZW50cnkgcG9pbnQuIEl0IHdpbGwgc3RhcnQgdGhlIGZsb3cgcnVubmVyIGZsb3cuXG4gICAgICAgICAqIEBwYXJhbSBjb25maWcge09iamVjdH0gLSBvYmplY3QgY29udGFpbmluZyBzZXR0aW5ncyBzdWNoIGFzIGNvbmYgZmlsZSBuYW1lLCB0ZXN0IGRpci5cbiAgICAgICAgICogQHBhcmFtIGNhbGxiYWNrIHtGdW5jdGlvbn0gLSBoYW5kbGVyKGVycm9yLCByZXN1bHQpIGludm9rZWQgd2hlbiBhbiBlcnJvciBvY2N1cnJlZCBvciB0aGUgcnVubmVyIGhhcyBjb21wbGV0ZWQgYWxsIGpvYnMuXG4gICAgICAgICAqL1xuICAgICAgICBzdGFydDogZnVuY3Rpb24oY29uZmlnLCBjYWxsYmFjaykge1xuXG4gICAgICAgICAgICAvLyB3cmFwcGVyIGZvciBwcm92aWRlZCBjYWxsYmFjaywgaWYgYW55XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrID0gZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2RlYnVnSW5mbyhlcnIubWVzc2FnZSB8fCBlcnIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLl9faW5pdChjb25maWcpO1xuXG4gICAgICAgICAgICB0aGlzLl9fY29uc29sZUxvZyhcIkRpc2NvdmVyaW5nIHRlc3RzIC4uLlwiKTtcbiAgICAgICAgICAgIHRoaXMudGVzdFRyZWUgPSB0aGlzLl9fZGlzY292ZXJUZXN0RmlsZXModGhpcy5jb25maWcudGVzdHNEaXIsIGNvbmZpZyk7XG4gICAgICAgICAgICB0aGlzLnRlc3RMaXN0ID0gdGhpcy5fX3RvVGVzdFRyZWVUb0xpc3QodGhpcy50ZXN0VHJlZSk7XG5jb25zb2xlLmxvZyh0aGlzLnRlc3RUcmVlKTtcbiAgICAgICAgICAgIHRoaXMuX19sYXVuY2hUZXN0cygpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVhZHMgY29uZmlndXJhdGlvbiBzZXR0aW5ncyBmcm9tIGEganNvbiBmaWxlLlxuICAgICAgICAgKiBAcGFyYW0gY29uZlBhdGgge1N0cmluZ30gLSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuXG4gICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IC0gY29uZmlndXJhdGlvbiBvYmplY3Qge3t9fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19yZWFkQ29uZjogZnVuY3Rpb24oY29uZlBhdGgpIHtcbiAgICAgICAgICAgIHZhciBjb25maWcgPSB7fTtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBjb25maWcgPSByZXF1aXJlKGNvbmZQYXRoKTtcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc2NvdmVycyB0ZXN0IGZpbGVzIHJlY3Vyc2l2ZWx5IHN0YXJ0aW5nIGZyb20gYSBwYXRoLiBUaGUgZGlyIGlzIHRoZSByb290IG9mIHRoZSB0ZXN0IGZpbGVzLiBJdCBjYW4gY29udGFpbnNcbiAgICAgICAgICogdGVzdCBmaWxlcyBhbmQgdGVzdCBzdWIgZGlyZWN0b3JpZXMuIEl0IHdpbGwgY3JlYXRlIGEgdHJlZSBzdHJ1Y3R1cmUgd2l0aCB0aGUgdGVzdCBmaWxlcyBkaXNjb3ZlcmVkLlxuICAgICAgICAgKiBOb3RlczogT25seSB0aGUgY29uZmlnLm1hdGNoRGlycyB3aWxsIGJlIHRha2VuIGludG8gY29uc2lkZXJhdGlvbi4gQWxzbywgYmFzZWQgb24gdGhlIGNvbmYgKGRvdWJsZS1jaGVjay5qc29uKVxuICAgICAgICAgKiBpdCB3aWxsIGluY2x1ZGUgdGhlIHRlc3QgZmlsZXMgb3Igbm90LlxuICAgICAgICAgKiBAcGFyYW0gZGlyIHtTdHJpbmd9IC0gcGF0aCB3aGVyZSB0aGUgZGlzY292ZXJ5IHByb2Nlc3Mgc3RhcnRzXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb25mIHtTdHJpbmd9IC0gY29uZmlndXJhdGlvbiBvYmplY3QgKGRvdWJsZS1jaGVjay5qc29uKSBmcm9tIHRoZSBwYXJlbnQgZGlyZWN0b3J5XG4gICAgICAgICAqIEByZXR1cm5zIFRoZSByb290IG5vZGUgb2JqZWN0IG9mIHRoZSBmaWxlIHN0cnVjdHVyZSB0cmVlLiBFLmcuIHsqfHtfX21ldGEsIGRhdGEsIHJlc3VsdCwgaXRlbXN9fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19kaXNjb3ZlclRlc3RGaWxlczogZnVuY3Rpb24oZGlyLCBwYXJlbnRDb25mKSB7XG4gICAgICAgICAgICBsZXQgc3RhdCA9IGZzLnN0YXRTeW5jKGRpcik7XG4gICAgICAgICAgICBpZighc3RhdC5pc0RpcmVjdG9yeSgpKXtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGlyICsgXCIgaXMgbm90IGEgZGlyZWN0b3J5IVwiKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY3VycmVudENvbmYgPSBwYXJlbnRDb25mO1xuXG4gICAgICAgICAgICB2YXIgY3VycmVudE5vZGUgPSB0aGlzLl9fZ2V0RGVmYXVsdE5vZGVTdHJ1Y3R1cmUoKTtcbiAgICAgICAgICAgIGN1cnJlbnROb2RlLl9fbWV0YS5wYXJlbnQgPSBwYXRoLmRpcm5hbWUoZGlyKTtcbiAgICAgICAgICAgIGN1cnJlbnROb2RlLl9fbWV0YS5pc0RpcmVjdG9yeSA9IHRydWU7XG5cbiAgICAgICAgICAgIHZhciBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGRpcik7XG4gICAgICAgICAgICAvLyBmaXJzdCBsb29rIGZvciBjb25mIGZpbGVcbiAgICAgICAgICAgIGlmKGZpbGVzLmluZGV4T2YodGhpcy5jb25maWcuY29uZkZpbGVOYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBsZXQgZmQgPSBwYXRoLmpvaW4oZGlyLCB0aGlzLmNvbmZpZy5jb25mRmlsZU5hbWUpO1xuICAgICAgICAgICAgICAgIGxldCBjb25mID0gdGhpcy5fX3JlYWRDb25mKGZkKTtcbiAgICAgICAgICAgICAgICBpZihjb25mKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlLl9fbWV0YS5jb25mID0gY29uZjtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudENvbmYgPSBjb25mO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VycmVudE5vZGUuZGF0YS5uYW1lID0gcGF0aC5iYXNlbmFtZShkaXIpO1xuICAgICAgICAgICAgY3VycmVudE5vZGUuZGF0YS5wYXRoID0gZGlyO1xuICAgICAgICAgICAgY3VycmVudE5vZGUuaXRlbXMgPSBbXTtcblxuICAgICAgICAgICAgZm9yKGxldCBpID0gMCwgbGVuID0gZmlsZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IGZpbGVzW2ldO1xuXG4gICAgICAgICAgICAgICAgbGV0IGZkID0gcGF0aC5qb2luKGRpciwgaXRlbSk7XG4gICAgICAgICAgICAgICAgbGV0IHN0YXQgPSBmcy5zdGF0U3luYyhmZCk7XG4gICAgICAgICAgICAgICAgbGV0IGlzRGlyID0gc3RhdC5pc0RpcmVjdG9yeSgpO1xuICAgICAgICAgICAgICAgIGxldCBpc1Rlc3REaXIgPSB0aGlzLl9faXNUZXN0RGlyKGZkKTtcblxuICAgICAgICAgICAgICAgIGlmKGlzRGlyICYmICFpc1Rlc3REaXIpIGNvbnRpbnVlOyAvLyBpZ25vcmUgZGlycyB0aGF0IGRvZXMgbm90IGZvbGxvdyB0aGUgbmFtaW5nIHJ1bGUgZm9yIHRlc3QgZGlyc1xuXG4gICAgICAgICAgICAgICAgaWYoIWlzRGlyICYmIGl0ZW0ubWF0Y2godGhpcy5jb25maWcuY29uZkZpbGVOYW1lKSl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOyAvLyBhbHJlYWR5IHByb2Nlc3NlZFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGV4Y2x1ZGUgZmlsZXMgYmFzZWQgb24gZ2xvYiBwYXR0ZXJuc1xuICAgICAgICAgICAgICAgIGlmKGN1cnJlbnRDb25mKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGN1cnJlbnRDb25mWydpZ25vcmUnXSAtIGFycmF5IG9mIHJlZ0V4cFxuICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50Q29uZlsnaWdub3JlJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpc01hdGNoID0gdGhpcy5fX2lzQW55TWF0Y2goY3VycmVudENvbmZbJ2lnbm9yZSddLCBpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGlzTWF0Y2gpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkTm9kZSA9IHRoaXMuX19nZXREZWZhdWx0Tm9kZVN0cnVjdHVyZSgpO1xuICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5fX21ldGEuY29uZiA9IHt9O1xuICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5fX21ldGEuaXNEaXJlY3RvcnkgPSBpc0RpcjtcbiAgICAgICAgICAgICAgICBjaGlsZE5vZGUuX19tZXRhLnBhcmVudCA9IHBhdGguZGlybmFtZShmZCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNEaXIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXBDaGlsZE5vZGUgPSB0aGlzLl9fZGlzY292ZXJUZXN0RmlsZXMoZmQsIGN1cnJlbnRDb25mKTtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gT2JqZWN0LmFzc2lnbihjaGlsZE5vZGUsIHRlbXBDaGlsZE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZS5pdGVtcy5wdXNoKGNoaWxkTm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYocGF0aC5leHRuYW1lKGZkKSA9PT0gIHRoaXMuY29uZmlnLmZpbGVFeHQpe1xuICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUuX19tZXRhLmNvbmYucnVucyA9IGN1cnJlbnRDb25mWydydW5zJ10gfHwgMTtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLl9fbWV0YS5jb25mLnNpbGVudCA9IGN1cnJlbnRDb25mWydzaWxlbnQnXTtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLl9fbWV0YS5jb25mLnRpbWVvdXQgPSBjdXJyZW50Q29uZlsndGltZW91dCddO1xuXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5kYXRhLm5hbWUgPSBpdGVtO1xuICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUuZGF0YS5wYXRoID0gZmQ7XG5cbiAgICAgICAgICAgICAgICAgICAgY3VycmVudE5vZGUuaXRlbXMucHVzaChjaGlsZE5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnROb2RlO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogTGF1bmNoIGNvbGxlY3RlZCB0ZXN0cy4gSW5pdGlhbGlzZXMgc2Vzc2lvbiB2YXJpYWJsZXMsIHRoYXQgYXJlIHNwZWNpZmljIGZvciB0aGUgY3VycmVudCBsYXVuY2guXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX2xhdW5jaFRlc3RzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX19jb25zb2xlTG9nKFwiTGF1bmNoaW5nIHRlc3RzIC4uLlwiKTtcbiAgICAgICAgICAgIHRoaXMuc2Vzc2lvbi50ZXN0Q291bnQgPSB0aGlzLnRlc3RMaXN0Lmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMuc2Vzc2lvbi5wcm9jZXNzZWRUZXN0Q291bnQgPSAwO1xuICAgICAgICAgICAgdGhpcy5zZXNzaW9uLndvcmtlcnMucnVubmluZyA9IDA7XG4gICAgICAgICAgICB0aGlzLnNlc3Npb24ud29ya2Vycy50ZXJtaW5hdGVkID0gMDtcblxuICAgICAgICAgICAgaWYodGhpcy5zZXNzaW9uLnRlc3RDb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fc2NoZWR1bGVXb3JrKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX19kb1Rlc3RSZXBvcnRzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTY2hlZHVsZXMgd29yayBiYXNlZCBvbiB0aGUgTUFYIGF2YWlsYWJsZSB3b3JrZXJzLCBhbmQgYmFzZWQgb24gdGhlIG51bWJlciBvZiBydW5zIG9mIGEgdGVzdC5cbiAgICAgICAgICogSWYgYSB0ZXN0IGhhcyBtdWx0aXBsZSBydW5zIGFzIGEgb3B0aW9uLCBpdCB3aWxsIGJlIHN0YXJ0ZWQgaW4gbXVsdGlwbGUgd29ya2Vycy4gT25jZSBhbGwgcnVucyBhcmUgY29tcGxldGVkLFxuICAgICAgICAgKiB0aGUgdGVzdCBpcyBjb25zaWRlcmVkIGFzIHByb2Nlc3NlZC5cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fc2NoZWR1bGVXb3JrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHdoaWxlKHRoaXMuc2Vzc2lvbi53b3JrZXJzLnJ1bm5pbmcgPCBNQVhfV09SS0VSUyAmJiB0aGlzLnNlc3Npb24uY3VycmVudFRlc3RJbmRleCA8IHRoaXMuc2Vzc2lvbi50ZXN0Q291bnQpe1xuICAgICAgICAgICAgICAgIGxldCB0ZXN0ID0gdGhpcy50ZXN0TGlzdFt0aGlzLnNlc3Npb24uY3VycmVudFRlc3RJbmRleF07XG4gICAgICAgICAgICAgICAgaWYodGVzdC5yZXN1bHQucnVucyA8IHRlc3QuX19tZXRhLmNvbmYucnVucykge1xuICAgICAgICAgICAgICAgICAgICB0ZXN0LnJlc3VsdC5ydW5zKys7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX19sYXVuY2hUZXN0KHRlc3QpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2Vzc2lvbi5jdXJyZW50VGVzdEluZGV4Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogTGF1bmNoIGEgdGVzdCBpbnRvIGEgc2VwYXJhdGUgd29ya2VyIChjaGlsZCBwcm9jZXNzKS5cbiAgICAgICAgICogRWFjaCB3b3JrZXIgaGFzIGhhbmRsZXJzIGZvciBtZXNzYWdlLCBleGl0IGFuZCBlcnJvciBldmVudHMuIE9uY2UgdGhlIGV4aXQgb3IgZXJyb3IgZXZlbnQgaXMgaW52b2tlZCxcbiAgICAgICAgICogbmV3IHdvcmsgaXMgc2NoZWR1bGVkIGFuZCBzZXNzaW9uIG9iamVjdCBpcyB1cGRhdGVkLlxuICAgICAgICAgKiBOb3RlczogT24gZGVidWcgbW9kZSwgdGhlIHdvcmtlcnMgd2lsbCByZWNlaXZlIGEgZGVidWcgcG9ydCwgdGhhdCBpcyBpbmNyZWFzZWQgaW5jcmVtZW50YWxseS5cbiAgICAgICAgICogQHBhcmFtIHRlc3Qge09iamVjdH0gLSB0ZXN0IG9iamVjdFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19sYXVuY2hUZXN0OiBmdW5jdGlvbih0ZXN0KSB7XG4gICAgICAgICAgICB0aGlzLnNlc3Npb24ud29ya2Vycy5ydW5uaW5nKys7XG5cbiAgICAgICAgICAgIHRlc3QucmVzdWx0LnN0YXRlID0gVEVTVF9TVEFURVMuUlVOTklORztcbiAgICAgICAgICAgIHRlc3QucmVzdWx0LnBhc3MgPSB0ZXN0LnJlc3VsdC5wYXNzIHx8IHRydWU7XG4gICAgICAgICAgICB0ZXN0LnJlc3VsdC5hc3NlcnRzW3Rlc3QucmVzdWx0LnJ1bnNdID0gW107XG4gICAgICAgICAgICB0ZXN0LnJlc3VsdC5tZXNzYWdlc1t0ZXN0LnJlc3VsdC5ydW5zXSA9IFtdO1xuXG4gICAgICAgICAgICB2YXIgZW52ID0gcHJvY2Vzcy5lbnY7XG5cbiAgICAgICAgICAgIGxldCBleGVjQXJndiA9IFtdO1xuICAgICAgICAgICAgaWYoREVCVUcpIHtcbiAgICAgICAgICAgICAgICBsZXQgZGVidWdQb3J0ID0gKytkZWZhdWx0U2Vzc2lvbi5kZWJ1Z1BvcnQ7XG4gICAgICAgICAgICAgICAgbGV0IGRlYnVnRmxhZyA9ICctLWRlYnVnPScgKyBkZWJ1Z1BvcnQ7XG4gICAgICAgICAgICAgICAgZXhlY0FyZ3YucHVzaChkZWJ1Z0ZsYWcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgY3dkID0gdGVzdC5fX21ldGEucGFyZW50O1xuXG4gICAgICAgICAgICB2YXIgd29ya2VyID0gZm9ya2VyLmZvcmsodGVzdC5kYXRhLnBhdGgsIFtdLCB7J2N3ZCc6IGN3ZCwgJ2Vudic6IGVudiwgJ2V4ZWNBcmd2JzogZXhlY0FyZ3YsIHN0ZGlvOiBbJ2luaGVyaXQnLCBcInBpcGVcIiwgJ2luaGVyaXQnLCAnaXBjJ10gfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX19kZWJ1Z0luZm8oYExhdW5jaGluZyB0ZXN0ICR7dGVzdC5kYXRhLm5hbWV9LCBydW5bJHt0ZXN0LnJlc3VsdC5ydW5zfV0sIG9uIHdvcmtlciBwaWRbJHt3b3JrZXIucGlkfV1gKTtcblxuICAgICAgICAgICAgd29ya2VyLm9uKFwibWVzc2FnZVwiLCBvbk1lc3NhZ2VFdmVudEhhbmRsZXJXcmFwcGVyKHRlc3QpKTtcbiAgICAgICAgICAgIHdvcmtlci5vbihcImV4aXRcIiwgb25FeGl0RXZlbnRIYW5kbGVyV3JhcHBlcih0ZXN0KSk7XG4gICAgICAgICAgICB3b3JrZXIub24oXCJlcnJvclwiLCBvbkVycm9yRXZlbnRIYW5kbGVyV3JhcHBlcih0ZXN0KSk7XG4gICAgICAgICAgICB3b3JrZXIudGVybWluYXRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICB3b3JrZXIuc3Rkb3V0Lm9uKCdkYXRhJywgZnVuY3Rpb24gKGNodW5rKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBuZXcgQnVmZmVyKGNodW5rKS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICAgICAgICAgIGlmKHRlc3QuX19tZXRhLmNvbmYuc2lsZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX19jb25zb2xlTG9nKGNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uTWVzc2FnZUV2ZW50SGFuZGxlcldyYXBwZXIodGVzdCkge1xuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50UnVuID0gdGVzdC5yZXN1bHQucnVucztcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24obG9nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGxvZy50eXBlID09PSAnYXNzZXJ0Jyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihsb2cubWVzc2FnZS5pbmNsdWRlcyhcIltGYWlsXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdC5yZXN1bHQucGFzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGVzdC5yZXN1bHQuYXNzZXJ0c1tjdXJyZW50UnVuXS5wdXNoKGxvZyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXN0LnJlc3VsdC5tZXNzYWdlc1tjdXJyZW50UnVuXS5wdXNoKGxvZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uRXhpdEV2ZW50SGFuZGxlcldyYXBwZXIodGVzdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihjb2RlLCBzaWduYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fX2RlYnVnSW5mbyhgV29ya2VyICR7d29ya2VyLnBpZH0gLSBleGl0IGV2ZW50LiBDb2RlICR7Y29kZX0sIHNpZ25hbCAke3NpZ25hbH1gKTtcblxuICAgICAgICAgICAgICAgICAgICB3b3JrZXIudGVybWluYXRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgdGVzdC5yZXN1bHQuc3RhdGUgPSBURVNUX1NUQVRFUy5GSU5JU0hFRDtcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNlc3Npb24ud29ya2Vycy5ydW5uaW5nLS07XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2Vzc2lvbi53b3JrZXJzLnRlcm1pbmF0ZWQrKztcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9fc2NoZWR1bGVXb3JrKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX19jaGVja1dvcmtlcnNTdGF0dXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHRoaXMgaGFuZGxlciBjYW4gYmUgdHJpZ2dlcmVkIHdoZW46XG4gICAgICAgICAgICAvLyAxLiBUaGUgcHJvY2VzcyBjb3VsZCBub3QgYmUgc3Bhd25lZCwgb3JcbiAgICAgICAgICAgIC8vIDIuIFRoZSBwcm9jZXNzIGNvdWxkIG5vdCBiZSBraWxsZWQsIG9yXG4gICAgICAgICAgICAvLyAzLiBTZW5kaW5nIGEgbWVzc2FnZSB0byB0aGUgY2hpbGQgcHJvY2VzcyBmYWlsZWQuXG4gICAgICAgICAgICAvLyBJTVBPUlRBTlQ6IFRoZSAnZXhpdCcgZXZlbnQgbWF5IG9yIG1heSBub3QgZmlyZSBhZnRlciBhbiBlcnJvciBoYXMgb2NjdXJyZWQhXG4gICAgICAgICAgICBmdW5jdGlvbiBvbkVycm9yRXZlbnRIYW5kbGVyV3JhcHBlcih0ZXN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX19kZWJ1Z0luZm8oYFdvcmtlciAke3dvcmtlci5waWR9IC0gZXJyb3IgZXZlbnQuYCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX19kZWJ1Z0Vycm9yKGVycm9yKTtcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNlc3Npb24ud29ya2Vycy5ydW5uaW5nLS07XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2Vzc2lvbi53b3JrZXJzLnRlcm1pbmF0ZWQrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE5vdGU6IG9uIGRlYnVnLCB0aGUgdGltZW91dCBpcyByZWFjaGVkIGJlZm9yZSBleGl0IGV2ZW50IGlzIGNhbGxlZFxuICAgICAgICAgICAgLy8gd2hlbiBraWxsIGlzIGNhbGxlZCwgdGhlIGV4aXQgZXZlbnQgaXMgcmFpc2VkXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgaWYoIXdvcmtlci50ZXJtaW5hdGVkKXtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fX2RlYnVnSW5mbyhgd29ya2VyIHBpZCBbJHt3b3JrZXIucGlkfV0gLSB0aW1lb3V0IGV2ZW50YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgd29ya2VyLmtpbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgdGVzdC5yZXN1bHQuc3RhdGUgPSBURVNUX1NUQVRFUy5USU1FT1VUO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRlc3QuX19tZXRhLmNvbmYudGltZW91dCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGVja3MgaWYgYWxsIHdvcmtlcnMgY29tcGxldGVkIHRoZWlyIGpvYiAoZmluaXNoZWQgb3IgaGF2ZSBiZWVuIHRlcm1pbmF0ZWQpLlxuICAgICAgICAgKiBJZiB0cnVlLCB0aGVuIHRoZSByZXBvcnRpbmcgc3RlcHMgY2FuIGJlIHN0YXJ0ZWQuXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX2NoZWNrV29ya2Vyc1N0YXR1czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZih0aGlzLnNlc3Npb24ud29ya2Vycy5ydW5uaW5nID09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fZG9UZXN0UmVwb3J0cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlcyB0ZXN0IHJlcG9ydHMgb2JqZWN0IChKU09OKSB0aGF0IHdpbGwgYmUgc2F2ZWQgaW4gdGhlIHRlc3QgcmVwb3J0LlxuICAgICAgICAgKiBGaWxlbmFtZSBvZiB0aGUgcmVwb3J0IGlzIHVzaW5nIHRoZSBmb2xsb3dpbmcgcGF0dGVybjoge3ByZWZpeH0te3RpbWVzdGFtcH17ZXh0fVxuICAgICAgICAgKiBUaGUgZmlsZSB3aWxsIGJlIHNhdmVkIGluIGNvbmZpZy5yZXBvcnRzLmJhc2VQYXRoLlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19kb1Rlc3RSZXBvcnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX19jb25zb2xlTG9nKFwiRG9pbmcgcmVwb3J0cyAuLi5cIik7XG4gICAgICAgICAgICByZXBvcnRGaWxlU3RydWN0dXJlLmNvdW50ID0gdGhpcy50ZXN0TGlzdC5sZW5ndGg7XG5cbiAgICAgICAgICAgIC8vIHBhc3MvZmFpbGVkIHRlc3RzXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwLCBsZW4gPSB0aGlzLnRlc3RMaXN0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHRlc3QgPSB0aGlzLnRlc3RMaXN0W2ldO1xuXG4gICAgICAgICAgICAgICAgbGV0IHRlc3RQYXRoID0gdGhpcy5fX3RvUmVsYXRpdmVQYXRoKHRlc3QuZGF0YS5wYXRoKTtcbiAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IHtwYXRoOiB0ZXN0UGF0aH07XG4gICAgICAgICAgICAgICAgaWYodGVzdC5yZXN1bHQucGFzcykge1xuICAgICAgICAgICAgICAgICAgICByZXBvcnRGaWxlU3RydWN0dXJlLnBhc3NlZC5pdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ucmVhc29uID0gdGhpcy5fX2dldEZpcnN0RmFpbFJlYXNvblBlclJ1bih0ZXN0KTtcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0RmlsZVN0cnVjdHVyZS5mYWlsZWQuaXRlbXMucHVzaChpdGVtKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcG9ydEZpbGVTdHJ1Y3R1cmUucGFzc2VkLmNvdW50ID0gcmVwb3J0RmlsZVN0cnVjdHVyZS5wYXNzZWQuaXRlbXMubGVuZ3RoO1xuICAgICAgICAgICAgcmVwb3J0RmlsZVN0cnVjdHVyZS5mYWlsZWQuY291bnQgPSByZXBvcnRGaWxlU3RydWN0dXJlLmZhaWxlZC5pdGVtcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIC8vIHN1aXRlcyAoZmlyc3QgbGV2ZWwgb2YgZGlyZWN0b3JpZXMpXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwLCBsZW4gPSB0aGlzLnRlc3RUcmVlLml0ZW1zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLnRlc3RUcmVlLml0ZW1zW2ldO1xuICAgICAgICAgICAgICAgIGlmKGl0ZW0uX19tZXRhLmlzRGlyZWN0b3J5KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWl0ZVBhdGggPSB0aGlzLl9fdG9SZWxhdGl2ZVBhdGgoaXRlbS5kYXRhLnBhdGgpO1xuICAgICAgICAgICAgICAgICAgICByZXBvcnRGaWxlU3RydWN0dXJlLnN1aXRlcy5pdGVtcy5wdXNoKHN1aXRlUGF0aClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXBvcnRGaWxlU3RydWN0dXJlLnN1aXRlcy5jb3VudCA9IHJlcG9ydEZpbGVTdHJ1Y3R1cmUuc3VpdGVzLml0ZW1zLmxlbmd0aDtcblxuICAgICAgICAgICAgY29uc3Qgd3JpdGVSZXBvcnRzID0gdGhpcy5wYXJhbGxlbChmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrKGVyciwgXCJEb25lXCIpO1xuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgdGhpcy5fX2NvbnNvbGVMb2codGhpcy5jb25maWcucmVwb3J0cy5wcmVmaXgpO1xuICAgICAgICAgICAgbGV0IGZpbGVOYW1lID0gYCR7dGhpcy5jb25maWcucmVwb3J0cy5wcmVmaXh9bGF0ZXN0JHt0aGlzLmNvbmZpZy5yZXBvcnRzLmV4dH1gO1xuICAgICAgICAgICAgbGV0IGZpbGVQYXRoID0gcGF0aC5qb2luKHRoaXMuY29uZmlnLnJlcG9ydHMuYmFzZVBhdGgsIGZpbGVOYW1lKTtcbiAgICAgICAgICAgIHdyaXRlUmVwb3J0cy5fX3NhdmVSZXBvcnRUb0ZpbGUocmVwb3J0RmlsZVN0cnVjdHVyZSwgZmlsZVBhdGgpO1xuXG4gICAgICAgICAgICBsZXQgdGltZXN0YW1wID0gbmV3IERhdGUoKS5nZXRUaW1lKCkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGNvbnN0IGh0bWxGaWxlTmFtZSA9IGAke3RoaXMuY29uZmlnLnJlcG9ydHMucHJlZml4fWxhdGVzdC5odG1sYDtcbiAgICAgICAgICAgIGNvbnN0IGh0bWxGaWxlUGF0aCA9IHBhdGguam9pbih0aGlzLmNvbmZpZy5yZXBvcnRzLmJhc2VQYXRoLCBodG1sRmlsZU5hbWUpO1xuICAgICAgICAgICAgd3JpdGVSZXBvcnRzLl9fc2F2ZUh0bWxSZXBvcnRUb0ZpbGUocmVwb3J0RmlsZVN0cnVjdHVyZSwgaHRtbEZpbGVQYXRoLCB0aW1lc3RhbXApO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogU2F2ZXMgdGVzdCByZXBvcnRzIG9iamVjdCAoSlNPTikgaW4gdGhlIHNwZWNpZmllZCBwYXRoLlxuICAgICAgICAgKiBAcGFyYW0gcmVwb3J0RmlsZVN0cnVjdHVyZSB7T2JqZWN0fSAtIHRlc3QgcmVwb3J0cyBvYmplY3QgKEpTT04pXG4gICAgICAgICAqIEBwYXJhbSBkZXN0aW5hdGlvbiB7U3RyaW5nfSAtIHBhdGggb2YgdGhlIGZpbGUgcmVwb3J0ICh0aGUgYmFzZSBwYXRoIE1VU1QgZXhpc3QpXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX3NhdmVSZXBvcnRUb0ZpbGU6IGZ1bmN0aW9uKHJlcG9ydEZpbGVTdHJ1Y3R1cmUsIGRlc3RpbmF0aW9uKSB7XG5cbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gSlNPTi5zdHJpbmdpZnkocmVwb3J0RmlsZVN0cnVjdHVyZSwgbnVsbCwgNCk7XG4gICAgICAgICAgICBmcy53cml0ZUZpbGUoZGVzdGluYXRpb24sIGNvbnRlbnQsICd1dGY4JywgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBcIkFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHdyaXRpbmcgdGhlIHJlcG9ydCBmaWxlLCB3aXRoIHRoZSBmb2xsb3dpbmcgZXJyb3I6IFwiICsgSlNPTi5zdHJpbmdpZnkoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2RlYnVnSW5mbyhtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgIH0gZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBgRmluaXNoZWQgd3JpdGluZyByZXBvcnQgdG8gJHtkZXN0aW5hdGlvbn1gO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9fY29uc29sZUxvZyhtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogU2F2ZXMgdGVzdCByZXBvcnRzIGFzIEhUTUwgaW4gdGhlIHNwZWNpZmllZCBwYXRoLlxuICAgICAgICAgKiBAcGFyYW0gcmVwb3J0RmlsZVN0cnVjdHVyZSB7T2JqZWN0fSAtIHRlc3QgcmVwb3J0cyBvYmplY3QgKEpTT04pXG4gICAgICAgICAqIEBwYXJhbSBkZXN0aW5hdGlvbiB7U3RyaW5nfSAtIHBhdGggb2YgdGhlIGZpbGUgcmVwb3J0ICh0aGUgYmFzZSBwYXRoIE1VU1QgZXhpc3QpXG4gICAgICAgICAqIEBwYXJhbSB0aW1lc3RhbXAge1N0cmluZ30gLSB0aW1lc3RhbXAgdG8gYmUgaW5qZWN0ZWQgaW4gaHRtbCB0ZW1wbGF0ZVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19zYXZlSHRtbFJlcG9ydFRvRmlsZTogZnVuY3Rpb24gKHJlcG9ydEZpbGVTdHJ1Y3R1cmUsIGRlc3RpbmF0aW9uLCB0aW1lc3RhbXApIHtcbiAgICAgICAgICAgIGZzLnJlYWRGaWxlKF9fZGlybmFtZSsnL3V0aWxzL3JlcG9ydFRlbXBsYXRlLmh0bWwnLCAndXRmOCcsIChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSAnQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgcmVhZGluZyB0aGUgaHRtbCByZXBvcnQgdGVtcGxhdGUgZmlsZSwgd2l0aCB0aGUgZm9sbG93aW5nIGVycm9yOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2RlYnVnSW5mbyhtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZShkZXN0aW5hdGlvbiwgcmVzICsgYDxzY3JpcHQ+aW5pdCgke0pTT04uc3RyaW5naWZ5KHJlcG9ydEZpbGVTdHJ1Y3R1cmUpfSwgJHt0aW1lc3RhbXB9KTs8L3NjcmlwdD5gLCAndXRmOCcsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSAnQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgd3JpdGluZyB0aGUgaHRtbCByZXBvcnQgZmlsZSwgd2l0aCB0aGUgZm9sbG93aW5nIGVycm9yOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX19kZWJ1Z0luZm8obWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IGBGaW5pc2hlZCB3cml0aW5nIHJlcG9ydCB0byAke2Rlc3RpbmF0aW9ufWA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX19jb25zb2xlTG9nKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb252ZXJ0cyBhYnNvbHV0ZSBmaWxlIHBhdGggdG8gcmVsYXRpdmUgcGF0aC5cbiAgICAgICAgICogQHBhcmFtIGFic29sdXRlUGF0aCB7U3RyaW5nfSAtIGFic29sdXRlIHBhdGhcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZyB8IHZvaWQgfCAqfSAtIHJlbGF0aXZlIHBhdGhcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fdG9SZWxhdGl2ZVBhdGg6IGZ1bmN0aW9uKGFic29sdXRlUGF0aCkge1xuICAgICAgICAgICAgbGV0IGJhc2VQYXRoID0gcGF0aC5qb2luKHRoaXMuY29uZmlnLnRlc3RzRGlyLCBcIi9cIik7XG4gICAgICAgICAgICBsZXQgcmVsYXRpdmVQYXRoID0gYWJzb2x1dGVQYXRoLnJlcGxhY2UoYmFzZVBhdGgsIFwiXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHJlbGF0aXZlUGF0aDtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrcyBpZiBhIGRpcmVjdG9yeSBpcyBhIHRlc3QgZGlyLCBieSBtYXRjaGluZyBpdHMgbmFtZSBhZ2FpbnN0IGNvbmZpZy5tYXRjaERpcnMgYXJyYXkuXG4gICAgICAgICAqIEBwYXJhbSBkaXIge1N0cmluZ30gLSBkaXJlY3RvcnkgbmFtZVxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSByZXR1cm5zIHRydWUgaWYgdGhlcmUgaXMgYSBtYXRjaCBhbmQgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19pc1Rlc3REaXI6IGZ1bmN0aW9uKGRpcikge1xuICAgICAgICAgICAgaWYoIXRoaXMuY29uZmlnIHx8ICF0aGlzLmNvbmZpZy5tYXRjaERpcnMgKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgYG1hdGNoRGlycyBpcyBub3QgZGVmaW5lZCBvbiBjb25maWcgJHtKU09OLnN0cmluZ2lmeSh0aGlzLmNvbmZpZyl9IGRvZXMgbm90IGV4aXN0IWA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBpc1Rlc3REaXIgPSB0aGlzLmNvbmZpZy5tYXRjaERpcnMuc29tZShmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpci50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGl0ZW0udG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGlzVGVzdERpcjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZvciBhIGZhaWxlZCB0ZXN0LCBpdCByZXR1cm5zIG9ubHkgdGhlIGZpcnN0IGZhaWwgcmVhc29uIHBlciBlYWNoIHJ1bi5cbiAgICAgICAgICogQHBhcmFtIHRlc3Qge09iamVjdH0gLSB0ZXN0IG9iamVjdFxuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9IC0gYW4gYXJyYXkgb2YgcmVhc29ucyBwZXIgZWFjaCB0ZXN0IHJ1bi5cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fZ2V0Rmlyc3RGYWlsUmVhc29uUGVyUnVuOiBmdW5jdGlvbih0ZXN0KSB7XG4gICAgICAgICAgICBsZXQgcmVhc29uID0gW107XG4gICAgICAgICAgICBmb3IobGV0IGkgPSAxOyBpIDw9IHRlc3QucmVzdWx0LnJ1bnM7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmKHRlc3QucmVzdWx0LmFzc2VydHNbaV0gJiYgdGVzdC5yZXN1bHQuYXNzZXJ0c1tpXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZFJlYXNvbihpLCB0ZXN0LnJlc3VsdC5hc3NlcnRzW2ldWzBdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZih0ZXN0LnJlc3VsdC5tZXNzYWdlc1tpXSAmJiB0ZXN0LnJlc3VsdC5tZXNzYWdlc1tpXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZFJlYXNvbihpLCB0ZXN0LnJlc3VsdC5tZXNzYWdlc1tpXVswXSlcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBhZGRSZWFzb24ocnVuLCBsb2cpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW46IHJ1bixcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZzogbG9nXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmVhc29uLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVhc29uO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogRGVzY3JpYmVkIGRlZmF1bHQgdHJlZSBub2RlIHN0cnVjdHVyZS5cbiAgICAgICAgICogQHJldHVybnMge3tfX21ldGE6IHtjb25mOiBudWxsLCBwYXJlbnQ6IG51bGwsIGlzRGlyZWN0b3J5OiBib29sZWFufSwgZGF0YToge25hbWU6IG51bGwsIHBhdGg6IG51bGx9LCByZXN1bHQ6IHtzdGF0ZTogc3RyaW5nLCBwYXNzOiBudWxsLCBleGVjdXRpb25UaW1lOiBudW1iZXIsIHJ1bnM6IG51bWJlciwgYXNzZXJ0czoge30sIG1lc3NhZ2VzOiB7fX0sIGl0ZW1zOiBudWxsfX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fZ2V0RGVmYXVsdE5vZGVTdHJ1Y3R1cmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICB7XG4gICAgICAgICAgICAgICAgX19tZXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmY6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgaXNEaXJlY3Rvcnk6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IG51bGwsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZXN1bHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IFRFU1RfU1RBVEVTLlJFQURZLCAvLyByZWFkeSB8IHJ1bm5pbmcgfCB0ZXJtaW5hdGVkIHwgdGltZW91dFxuICAgICAgICAgICAgICAgICAgICBwYXNzOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBleGVjdXRpb25UaW1lOiAwLFxuICAgICAgICAgICAgICAgICAgICBydW5zOiAwLFxuICAgICAgICAgICAgICAgICAgICBhc3NlcnRzOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXM6IHt9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpdGVtczogbnVsbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1hdGNoIGEgdGVzdCBmaWxlIHBhdGggdG8gYSBVTklYIGdsb2IgZXhwcmVzc2lvbiBhcnJheS4gSWYgaXRzIGFueSBtYXRjaCByZXR1cm5zIHRydWUsIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxuICAgICAgICAgKiBAcGFyYW0gZ2xvYkV4cEFycmF5IHtBcnJheX0gLSBhbiBhcnJheSB3aXRoIGdsb2IgZXhwcmVzc2lvbiAoVU5JWCBzdHlsZSlcbiAgICAgICAgICogQHBhcmFtIHN0ciB7U3RyaW5nfSAtIHRoZSBzdHJpbmcgdG8gYmUgbWF0Y2hlZFxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSByZXR1cm5zIHRydWUgaWYgdGhlcmUgaXMgYW55IG1hdGNoIGFuZCBmYWxzZSBvdGhlcndpc2UuXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX2lzQW55TWF0Y2g6IGZ1bmN0aW9uKGdsb2JFeHBBcnJheSwgc3RyKSB7XG4gICAgICAgICAgICBsZXQgaGFzTWF0Y2ggPSBmdW5jdGlvbihnbG9iRXhwKSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlZ2V4ID0gZ2xvYlRvUmVnRXhwKGdsb2JFeHApO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWdleC50ZXN0KHN0cik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBnbG9iRXhwQXJyYXkuc29tZShoYXNNYXRjaClcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbnZlcnRzIGEgdHJlZSBzdHJ1Y3R1cmUgaW50byBhbiBhcnJheSBsaXN0IG9mIHRlc3Qgbm9kZXMuIFRoZSB0cmVlIHRyYXZlcnNhbCBpcyBERlMgKERlZXAtRmlyc3QtU2VhcmNoKS5cbiAgICAgICAgICogQHBhcmFtIHJvb3ROb2RlIHtPYmplY3R9IC0gcm9vdCBub2RlIG9mIHRoZSB0ZXN0IHRyZWUuXG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX0gLSBMaXN0IG9mIHRlc3Qgbm9kZXMuXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX3RvVGVzdFRyZWVUb0xpc3Q6IGZ1bmN0aW9uKHJvb3ROb2RlKSB7XG4gICAgICAgICAgICB2YXIgdGVzdExpc3QgPSBbXTtcblxuICAgICAgICAgICAgdHJhdmVyc2Uocm9vdE5vZGUpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiB0cmF2ZXJzZShub2RlKSB7XG4gICAgICAgICAgICAgICAgaWYoIW5vZGUuX19tZXRhLmlzRGlyZWN0b3J5IHx8ICFub2RlLml0ZW1zKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBmb3IobGV0IGkgPSAwLCBsZW4gPSBub2RlLml0ZW1zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gbm9kZS5pdGVtc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYoaXRlbS5fX21ldGEuaXNEaXJlY3RvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYXZlcnNlKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVzdExpc3QucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRlc3RMaXN0O1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogTG9nZ2luZyB0byBjb25zb2xlIHdyYXBwZXIuXG4gICAgICAgICAqIEBwYXJhbSBsb2cge1N0cmluZ3xPYmplY3R8TnVtYmVyfSAtIGxvZyBtZXNzYWdlXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX2NvbnNvbGVMb2c6IGZ1bmN0aW9uKGxvZykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coVEFHLCBsb2cpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogTG9nZ2luZyBkZWJ1Z2dpbmcgaW5mbyBtZXNzYWdlcyB3cmFwcGVyLlxuICAgICAgICAgKiBMb2dnZXI6IGNvbnNvbGUuaW5mb1xuICAgICAgICAgKiBAcGFyYW0gbG9nIHtTdHJpbmd8T2JqZWN0fE51bWJlcn0gLSBsb2cgbWVzc2FnZVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19kZWJ1Z0luZm86IGZ1bmN0aW9uKGxvZykge1xuICAgICAgICAgICAgdGhpcy5fX2RlYnVnKGNvbnNvbGUuaW5mbywgbG9nKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIExvZ2dpbmcgZGVidWdnaW5nIGVycm9yIG1lc3NhZ2VzIHdyYXBwZXIuXG4gICAgICAgICAqIExvZ2dlcjogY29uc29sZS5lcnJvclxuICAgICAgICAgKiBAcGFyYW0gbG9nIHtTdHJpbmd8T2JqZWN0fE51bWJlcn0gLSBsb2cgbWVzc2FnZVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19kZWJ1Z0Vycm9yOiBmdW5jdGlvbihsb2cpIHtcbiAgICAgICAgICAgIHRoaXMuX19kZWJ1Zyhjb25zb2xlLmVycm9yLCBsb2cpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogIExvZ2dpbmcgZGVidWdnaW5nIG1lc3NhZ2VzIHdyYXBwZXIuIE9uZSBkZWJ1ZyBtb2RlLCB0aGUgbG9nZ2luZyBpcyBzaWxlbnQuXG4gICAgICAgICAqIEBwYXJhbSBsb2dnZXIge0Z1bmN0aW9ufSAtIGhhbmRsZXIgZm9yIGxvZ2dpbmdcbiAgICAgICAgICogQHBhcmFtIGxvZyB7U3RyaW5nfE9iamVjdHxOdW1iZXJ9IC0gbG9nIG1lc3NhZ2VcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fZGVidWc6IGZ1bmN0aW9uKGxvZ2dlciwgbG9nKSB7XG4gICAgICAgICAgICBpZighREVCVUcpIHJldHVybjtcblxuICAgICAgICAgICAgbGV0IHByZXR0eUxvZyA9IEpTT04uc3RyaW5naWZ5KGxvZywgbnVsbCwgMik7XG4gICAgICAgICAgICBsb2dnZXIoXCJERUJVR1wiLCBsb2cpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogRGVlcCBleHRlbmQgb25lIG9iamVjdCB3aXRoIHByb3BlcnRpZXMgb2YgYW5vdGhlciBvYmplY3QuXG4gICAgICAgICAqIElmIHRoZSBwcm9wZXJ0eSBleGlzdHMgaW4gYm90aCBvYmplY3RzIHRoZSBwcm9wZXJ0eSBmcm9tIHRoZSBmaXJzdCBvYmplY3QgaXMgb3ZlcnJpZGRlbi5cbiAgICAgICAgICogQHBhcmFtIGZpcnN0IHtPYmplY3R9IC0gdGhlIGZpcnN0IG9iamVjdFxuICAgICAgICAgKiBAcGFyYW0gc2Vjb25kIHtPYmplY3R9IC0gdGhlIHNlY29uZCBvYmplY3RcbiAgICAgICAgICogQHJldHVybnMge09iamVjdH0gLSBhbiBvYmplY3Qgd2l0aCBib3RoIHByb3BlcnRpZXMgZnJvbSB0aGUgZmlyc3QgYW5kIHNlY29uZCBvYmplY3QuXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX2V4dGVuZDogZnVuY3Rpb24gKGZpcnN0LCBzZWNvbmQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBzZWNvbmQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWZpcnN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlyc3Rba2V5XSA9IHNlY29uZFtrZXldO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2YWwgPSBzZWNvbmRba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mIGZpcnN0W2tleV0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLl9fZXh0ZW5kKGZpcnN0W2tleV0sIHNlY29uZFtrZXldKVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZmlyc3Rba2V5XSA9IHZhbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmaXJzdDtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbiIsIlxuLy8gZ2xvYlRvUmVnRXhwIHR1cm5zIGEgVU5JWCBnbG9iIGV4cHJlc3Npb24gaW50byBhIFJlZ0V4IGV4cHJlc3Npb24uXG4vLyAgU3VwcG9ydHMgYWxsIHNpbXBsZSBnbG9iIHBhdHRlcm5zLiBFeGFtcGxlczogKi5leHQsIC9mb28vKiwgLi4vLi4vcGF0aCwgXmZvby4qXG4vLyAtIHNpbmdsZSBjaGFyYWN0ZXIgbWF0Y2hpbmcsIG1hdGNoaW5nIHJhbmdlcyBvZiBjaGFyYWN0ZXJzIGV0Yy4gZ3JvdXAgbWF0Y2hpbmcgYXJlIG5vIHN1cHBvcnRlZFxuLy8gLSBmbGFncyBhcmUgbm90IHN1cHBvcnRlZFxudmFyIGdsb2JUb1JlZ0V4cCA9IGZ1bmN0aW9uIChnbG9iRXhwKSB7XG4gICAgaWYgKHR5cGVvZiBnbG9iRXhwICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHbG9iIEV4cHJlc3Npb24gbXVzdCBiZSBhIHN0cmluZyEnKTtcbiAgICB9XG5cbiAgICB2YXIgcmVnRXhwID0gXCJcIjtcblxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBnbG9iRXhwLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGxldCBjID0gZ2xvYkV4cFtpXTtcblxuICAgICAgICBzd2l0Y2ggKGMpIHtcbiAgICAgICAgICAgIGNhc2UgXCIvXCI6XG4gICAgICAgICAgICBjYXNlIFwiJFwiOlxuICAgICAgICAgICAgY2FzZSBcIl5cIjpcbiAgICAgICAgICAgIGNhc2UgXCIrXCI6XG4gICAgICAgICAgICBjYXNlIFwiLlwiOlxuICAgICAgICAgICAgY2FzZSBcIihcIjpcbiAgICAgICAgICAgIGNhc2UgXCIpXCI6XG4gICAgICAgICAgICBjYXNlIFwiPVwiOlxuICAgICAgICAgICAgY2FzZSBcIiFcIjpcbiAgICAgICAgICAgIGNhc2UgXCJ8XCI6XG4gICAgICAgICAgICAgICAgcmVnRXhwICs9IFwiXFxcXFwiICsgYztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBcIipcIjpcbiAgICAgICAgICAgICAgICAvLyB0cmVhdCBhbnkgbnVtYmVyIG9mIFwiKlwiIGFzIG9uZVxuICAgICAgICAgICAgICAgIHdoaWxlKGdsb2JFeHBbaSArIDFdID09PSBcIipcIikge1xuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlZ0V4cCArPSBcIi4qXCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmVnRXhwICs9IGM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBzZXQgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiB3aXRoIF4gJiAkXG4gICAgcmVnRXhwID0gXCJeXCIgKyByZWdFeHAgKyBcIiRcIjtcblxuICAgIHJldHVybiBuZXcgUmVnRXhwKHJlZ0V4cCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdsb2JUb1JlZ0V4cCIsImNvbnN0IFBza0NyeXB0byA9IHJlcXVpcmUoXCIuL2xpYi9Qc2tDcnlwdG9cIik7XG5cbmNvbnN0IHNzdXRpbCA9IHJlcXVpcmUoXCIuL3NpZ25zZW5zdXNEUy9zc3V0aWxcIilcblxubW9kdWxlLmV4cG9ydHMgPSBQc2tDcnlwdG87XG5cbm1vZHVsZS5leHBvcnRzLmhhc2hWYWx1ZXMgPSBzc3V0aWwuaGFzaFZhbHVlcztcblxuIiwiY29uc3QgY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG5jb25zdCBLZXlFbmNvZGVyID0gcmVxdWlyZSgnLi9rZXlFbmNvZGVyJyk7XG5cbmZ1bmN0aW9uIEVDRFNBKGN1cnZlTmFtZSl7XG4gICAgdGhpcy5jdXJ2ZSA9IGN1cnZlTmFtZSB8fCAnc2VjcDI1NmsxJztcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLmdlbmVyYXRlS2V5UGFpciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdWx0ICAgICA9IHt9O1xuICAgICAgICB2YXIgZWMgICAgICAgICA9IGNyeXB0by5jcmVhdGVFQ0RIKHNlbGYuY3VydmUpO1xuICAgICAgICByZXN1bHQucHVibGljICA9IGVjLmdlbmVyYXRlS2V5cygnaGV4Jyk7XG4gICAgICAgIHJlc3VsdC5wcml2YXRlID0gZWMuZ2V0UHJpdmF0ZUtleSgnaGV4Jyk7XG4gICAgICAgIHJldHVybiBrZXlzVG9QRU0ocmVzdWx0KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24ga2V5c1RvUEVNKGtleXMpe1xuICAgICAgICB2YXIgcmVzdWx0ICAgICAgICAgICAgICAgICAgPSB7fTtcbiAgICAgICAgdmFyIEVDUHJpdmF0ZUtleUFTTiAgICAgICAgID0gS2V5RW5jb2Rlci5FQ1ByaXZhdGVLZXlBU047XG4gICAgICAgIHZhciBTdWJqZWN0UHVibGljS2V5SW5mb0FTTiA9IEtleUVuY29kZXIuU3ViamVjdFB1YmxpY0tleUluZm9BU047XG4gICAgICAgIHZhciBrZXlFbmNvZGVyICAgICAgICAgICAgICA9IG5ldyBLZXlFbmNvZGVyKHNlbGYuY3VydmUpO1xuXG4gICAgICAgIHZhciBwcml2YXRlS2V5T2JqZWN0ICAgICAgICA9IGtleUVuY29kZXIucHJpdmF0ZUtleU9iamVjdChrZXlzLnByaXZhdGUsa2V5cy5wdWJsaWMpO1xuICAgICAgICB2YXIgcHVibGljS2V5T2JqZWN0ICAgICAgICAgPSBrZXlFbmNvZGVyLnB1YmxpY0tleU9iamVjdChrZXlzLnB1YmxpYyk7XG5cbiAgICAgICAgcmVzdWx0LnByaXZhdGUgICAgICAgICAgICAgID0gRUNQcml2YXRlS2V5QVNOLmVuY29kZShwcml2YXRlS2V5T2JqZWN0LCAncGVtJywgcHJpdmF0ZUtleU9iamVjdC5wZW1PcHRpb25zKTtcbiAgICAgICAgcmVzdWx0LnB1YmxpYyAgICAgICAgICAgICAgID0gU3ViamVjdFB1YmxpY0tleUluZm9BU04uZW5jb2RlKHB1YmxpY0tleU9iamVjdCwgJ3BlbScsIHB1YmxpY0tleU9iamVjdC5wZW1PcHRpb25zKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgfVxuXG4gICAgdGhpcy5zaWduID0gZnVuY3Rpb24gKHByaXZhdGVLZXksZGlnZXN0KSB7XG4gICAgICAgIHZhciBzaWduID0gY3J5cHRvLmNyZWF0ZVNpZ24oXCJzaGEyNTZcIik7XG4gICAgICAgIHNpZ24udXBkYXRlKGRpZ2VzdCk7XG5cbiAgICAgICAgcmV0dXJuIHNpZ24uc2lnbihwcml2YXRlS2V5LCdoZXgnKTtcbiAgICB9O1xuXG4gICAgdGhpcy52ZXJpZnkgPSBmdW5jdGlvbiAocHVibGljS2V5LHNpZ25hdHVyZSxkaWdlc3QpIHtcbiAgICAgICAgdmFyIHZlcmlmeSA9IGNyeXB0by5jcmVhdGVWZXJpZnkoJ3NoYTI1NicpO1xuICAgICAgICB2ZXJpZnkudXBkYXRlKGRpZ2VzdCk7XG5cbiAgICAgICAgcmV0dXJuIHZlcmlmeS52ZXJpZnkocHVibGljS2V5LHNpZ25hdHVyZSwnaGV4Jyk7XG4gICAgfVxufVxuXG5leHBvcnRzLmNyZWF0ZUVDRFNBID0gZnVuY3Rpb24gKGN1cnZlKXtcbiAgICByZXR1cm4gbmV3IEVDRFNBKGN1cnZlKTtcbn07IiwiXG5jb25zdCBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcbmNvbnN0IER1cGxleCA9IHJlcXVpcmUoJ3N0cmVhbScpLkR1cGxleDtcbmNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcblxuZnVuY3Rpb24gUHNrQ3J5cHRvKCkge1xuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFQ0RTQSBmdW5jdGlvbnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblx0Y29uc3QgZWNkc2EgPSByZXF1aXJlKFwiLi9FQ0RTQVwiKS5jcmVhdGVFQ0RTQSgpO1xuXHR0aGlzLmdlbmVyYXRlRUNEU0FLZXlQYWlyID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBlY2RzYS5nZW5lcmF0ZUtleVBhaXIoKTtcblx0fTtcblxuXHR0aGlzLnNpZ24gPSBmdW5jdGlvbiAocHJpdmF0ZUtleSwgZGlnZXN0KSB7XG5cdFx0cmV0dXJuIGVjZHNhLnNpZ24ocHJpdmF0ZUtleSwgZGlnZXN0KTtcblx0fTtcblxuXHR0aGlzLnZlcmlmeSA9IGZ1bmN0aW9uIChwdWJsaWNLZXksIHNpZ25hdHVyZSwgZGlnZXN0KSB7XG5cdFx0cmV0dXJuIGVjZHNhLnZlcmlmeShwdWJsaWNLZXksIHNpZ25hdHVyZSwgZGlnZXN0KTtcblx0fTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUVuY3J5cHRpb24gZnVuY3Rpb25zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXHRjb25zdCB1dGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzL2NyeXB0b1V0aWxzXCIpO1xuXHRjb25zdCBhcmNoaXZlciA9IHJlcXVpcmUoXCIuL3Bzay1hcmNoaXZlclwiKTtcblx0dmFyIHRlbXBGb2xkZXIgPSBvcy50bXBkaXIoKTtcblxuXHR0aGlzLmVuY3J5cHRTdHJlYW0gPSBmdW5jdGlvbiAoaW5wdXRQYXRoLCBkZXN0aW5hdGlvblBhdGgsIHBhc3N3b3JkKSB7XG5cdFx0dXRpbHMuZW5jcnlwdEZpbGUoaW5wdXRQYXRoLCBkZXN0aW5hdGlvblBhdGgsIHBhc3N3b3JkKTtcblx0fTtcblxuXHR0aGlzLmRlY3J5cHRTdHJlYW0gPSBmdW5jdGlvbiAoZW5jcnlwdGVkSW5wdXRQYXRoLCBvdXRwdXRGb2xkZXIsIHBhc3N3b3JkKSB7XG5cdFx0dXRpbHMuZGVjcnlwdEZpbGUoZW5jcnlwdGVkSW5wdXRQYXRoLCB0ZW1wRm9sZGVyLCBwYXNzd29yZCwgZnVuY3Rpb24gKGVyciwgdGVtcEFyY2hpdmVQYXRoKSB7XG5cdFx0XHRhcmNoaXZlci51bnppcCh0ZW1wQXJjaGl2ZVBhdGgsIG91dHB1dEZvbGRlciwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIkRlY3J5cHRpb24gaXMgY29tcGxldGVkLlwiKTtcblx0XHRcdFx0ZnMudW5saW5rU3luYyh0ZW1wQXJjaGl2ZVBhdGgpO1xuXHRcdFx0fSk7XG5cdFx0fSlcblx0fTtcblxuXG5cdHRoaXMucHNrSGFzaCA9IGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0aWYgKHV0aWxzLmlzSnNvbihkYXRhKSkge1xuXHRcdFx0cmV0dXJuIHV0aWxzLmNyZWF0ZVBza0hhc2goSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdXRpbHMuY3JlYXRlUHNrSGFzaChkYXRhKTtcblx0XHR9XG5cdH07XG5cblxuXHR0aGlzLnNhdmVEU2VlZCA9IGZ1bmN0aW9uIChkc2VlZCwgcGluLCBkc2VlZFBhdGgpIHtcblx0XHR2YXIgZW5jcnlwdGlvbktleSAgID0gdXRpbHMuZGVyaXZlS2V5KHBpbiwgbnVsbCwgbnVsbCk7XG5cdFx0dmFyIGl2ICAgICAgICAgICAgICA9IGNyeXB0by5yYW5kb21CeXRlcygxNik7XG5cdFx0dmFyIGNpcGhlciAgICAgICAgICA9IGNyeXB0by5jcmVhdGVDaXBoZXJpdignYWVzLTI1Ni1jZmInLCBlbmNyeXB0aW9uS2V5LCBpdik7XG5cdFx0dmFyIGVuY3J5cHRlZERTZWVkICA9IGNpcGhlci51cGRhdGUoZHNlZWQsICdiaW5hcnknKTtcblx0XHR2YXIgZmluYWwgICAgICAgICAgID0gQnVmZmVyLmZyb20oY2lwaGVyLmZpbmFsKCdiaW5hcnknKSwgJ2JpbmFyeScpO1xuXHRcdGVuY3J5cHRlZERTZWVkICAgICAgPSBCdWZmZXIuY29uY2F0KFtpdiwgZW5jcnlwdGVkRFNlZWQsIGZpbmFsXSk7XG5cdFx0ZnMud3JpdGVGaWxlU3luYyhkc2VlZFBhdGgsIGVuY3J5cHRlZERTZWVkKTtcblx0fTtcblxuXHR0aGlzLmxvYWREc2VlZCA9IGZ1bmN0aW9uIChwaW4sIGRzZWVkUGF0aCkge1xuXHRcdHZhciBlbmNyeXB0ZWREYXRhICA9IGZzLnJlYWRGaWxlU3luYyhkc2VlZFBhdGgpO1xuXHRcdHZhciBpdiAgICAgICAgICAgICA9IGVuY3J5cHRlZERhdGEuc2xpY2UoMCwgMTYpO1xuXHRcdHZhciBlbmNyeXB0ZWREc2VlZCA9IGVuY3J5cHRlZERhdGEuc2xpY2UoMTYpO1xuXHRcdHZhciBlbmNyeXB0aW9uS2V5ICA9IHV0aWxzLmRlcml2ZUtleShwaW4sIG51bGwsIG51bGwpO1xuXHRcdHZhciBkZWNpcGhlciAgICAgICA9IGNyeXB0by5jcmVhdGVEZWNpcGhlcml2KCdhZXMtMjU2LWNmYicsIGVuY3J5cHRpb25LZXksIGl2KTtcblx0XHR2YXIgZHNlZWQgICAgICAgICAgPSBCdWZmZXIuZnJvbShkZWNpcGhlci51cGRhdGUoZW5jcnlwdGVkRHNlZWQsICdiaW5hcnknKSwgJ2JpbmFyeScpO1xuXHRcdHZhciBmaW5hbCAgICAgICAgICA9IEJ1ZmZlci5mcm9tKGRlY2lwaGVyLmZpbmFsKCdiaW5hcnknKSwgJ2JpbmFyeScpO1xuXHRcdGRzZWVkICAgICAgICAgICAgICA9IEJ1ZmZlci5jb25jYXQoW2RzZWVkLCBmaW5hbF0pO1xuXG5cdFx0cmV0dXJuIGRzZWVkO1xuXG5cdH07XG5cblxuXHR0aGlzLmRlcml2ZVNlZWQgPSBmdW5jdGlvbiAoc2VlZCwgZHNlZWRMZW4pIHtcblx0XHRyZXR1cm4gdXRpbHMuZGVyaXZlS2V5KHNlZWQsIG51bGwsIGRzZWVkTGVuKTtcblxuXHR9O1xuXG5cdHRoaXMuZW5jcnlwdEpzb24gPSBmdW5jdGlvbiAoZGF0YSwgZHNlZWQpIHtcblx0XHR2YXIgY2lwaGVyVGV4dCA9IHV0aWxzLmVuY3J5cHQoSlNPTi5zdHJpbmdpZnkoZGF0YSksIGRzZWVkKTtcblxuXHRcdHJldHVybiBjaXBoZXJUZXh0O1xuXHR9O1xuXG5cdHRoaXMuZGVjcnlwdEpzb24gPSBmdW5jdGlvbiAoZW5jcnlwdGVkRGF0YSwgZHNlZWQpIHtcblx0XHR2YXIgcGxhaW50ZXh0ID0gdXRpbHMuZGVjcnlwdChlbmNyeXB0ZWREYXRhLCBkc2VlZCk7XG5cblx0XHRyZXR1cm4gSlNPTi5wYXJzZShwbGFpbnRleHQpO1xuXHR9O1xuXG5cdHRoaXMuZW5jcnlwdEJsb2IgPSBmdW5jdGlvbiAoZGF0YSwgZHNlZWQpIHtcblx0XHR2YXIgY2lwaGVydGV4dCA9IHV0aWxzLmVuY3J5cHQoZGF0YSwgZHNlZWQpO1xuXG5cdFx0cmV0dXJuIGNpcGhlcnRleHQ7XG5cdH07XG5cblx0dGhpcy5kZWNyeXB0QmxvYiA9IGZ1bmN0aW9uIChlbmNyeXB0ZWREYXRhLCBkc2VlZCkge1xuXHRcdHZhciBwbGFpbnRleHQgPSB1dGlscy5kZWNyeXB0KGVuY3J5cHRlZERhdGEsIGRzZWVkKTtcblxuXHRcdHJldHVybiBwbGFpbnRleHQ7XG5cdH07XG5cblxuXHR0aGlzLmdlbmVyYXRlU2VlZCA9IGZ1bmN0aW9uIChiYWNrdXBVcmwpIHtcblx0XHR2YXIgc2VlZCA9IHtcblx0XHRcdFwiYmFja3VwXCI6IGJhY2t1cFVybCxcblx0XHRcdFwicmFuZFwiXHQ6IGNyeXB0by5yYW5kb21CeXRlcygzMikudG9TdHJpbmcoXCJoZXhcIilcblx0XHR9O1xuXHRcdHJldHVybiBCdWZmZXIuZnJvbShKU09OLnN0cmluZ2lmeShzZWVkKSk7XG5cdH07XG5cdHRoaXMuZ2VuZXJhdGVTYWZlVWlkID0gZnVuY3Rpb24gKGRzZWVkLCBwYXRoKSB7XG5cdFx0cGF0aCA9IHBhdGggfHwgcHJvY2Vzcy5jd2QoKTtcblx0XHRyZXR1cm4gdXRpbHMuZW5jb2RlKHRoaXMucHNrSGFzaChCdWZmZXIuY29uY2F0KFtCdWZmZXIuZnJvbShwYXRoKSwgZHNlZWRdKSkpO1xuXHR9O1xufVxuXG4vLyB2YXIgcGNyeXB0byA9IG5ldyBQc2tDcnlwdG8oKTtcbi8vIHBjcnlwdG8uZW5jcnlwdFN0cmVhbShcIkM6XFxcXFVzZXJzXFxcXEFjZXJcXFxcV2Vic3Rvcm1Qcm9qZWN0c1xcXFxwcml2YXRlc2t5XFxcXHRlc3RzXFxcXHBzay11bml0LXRlc3RpbmdcXFxcemlwXFxcXG91dHB1dFwiLFwib3V0cHV0L215ZmlsZVwiLCBcIjEyM1wiKTtcbi8vIHBjcnlwdG8uZGVjcnlwdFN0cmVhbShcIm91dHB1dFxcXFxteWZpbGVcIiwgXCJvdXRwdXRcIiwgXCIxMjNcIik7XG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBQc2tDcnlwdG8oKTsiLCJ2YXIgYXNuMSA9IHJlcXVpcmUoJy4vYXNuMScpO1xudmFyIGluaGVyaXRzID0gcmVxdWlyZSgndXRpbCcpLmluaGVyaXRzO1xuXG52YXIgYXBpID0gZXhwb3J0cztcblxuYXBpLmRlZmluZSA9IGZ1bmN0aW9uIGRlZmluZShuYW1lLCBib2R5KSB7XG4gIHJldHVybiBuZXcgRW50aXR5KG5hbWUsIGJvZHkpO1xufTtcblxuZnVuY3Rpb24gRW50aXR5KG5hbWUsIGJvZHkpIHtcbiAgdGhpcy5uYW1lID0gbmFtZTtcbiAgdGhpcy5ib2R5ID0gYm9keTtcblxuICB0aGlzLmRlY29kZXJzID0ge307XG4gIHRoaXMuZW5jb2RlcnMgPSB7fTtcbn07XG5cbkVudGl0eS5wcm90b3R5cGUuX2NyZWF0ZU5hbWVkID0gZnVuY3Rpb24gY3JlYXRlTmFtZWQoYmFzZSkge1xuICB2YXIgbmFtZWQ7XG4gIHRyeSB7XG4gICAgbmFtZWQgPSByZXF1aXJlKCd2bScpLnJ1bkluVGhpc0NvbnRleHQoXG4gICAgICAnKGZ1bmN0aW9uICcgKyB0aGlzLm5hbWUgKyAnKGVudGl0eSkge1xcbicgK1xuICAgICAgJyAgdGhpcy5faW5pdE5hbWVkKGVudGl0eSk7XFxuJyArXG4gICAgICAnfSknXG4gICAgKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIG5hbWVkID0gZnVuY3Rpb24gKGVudGl0eSkge1xuICAgICAgdGhpcy5faW5pdE5hbWVkKGVudGl0eSk7XG4gICAgfTtcbiAgfVxuICBpbmhlcml0cyhuYW1lZCwgYmFzZSk7XG4gIG5hbWVkLnByb3RvdHlwZS5faW5pdE5hbWVkID0gZnVuY3Rpb24gaW5pdG5hbWVkKGVudGl0eSkge1xuICAgIGJhc2UuY2FsbCh0aGlzLCBlbnRpdHkpO1xuICB9O1xuXG4gIHJldHVybiBuZXcgbmFtZWQodGhpcyk7XG59O1xuXG5FbnRpdHkucHJvdG90eXBlLl9nZXREZWNvZGVyID0gZnVuY3Rpb24gX2dldERlY29kZXIoZW5jKSB7XG4gIC8vIExhemlseSBjcmVhdGUgZGVjb2RlclxuICBpZiAoIXRoaXMuZGVjb2RlcnMuaGFzT3duUHJvcGVydHkoZW5jKSlcbiAgICB0aGlzLmRlY29kZXJzW2VuY10gPSB0aGlzLl9jcmVhdGVOYW1lZChhc24xLmRlY29kZXJzW2VuY10pO1xuICByZXR1cm4gdGhpcy5kZWNvZGVyc1tlbmNdO1xufTtcblxuRW50aXR5LnByb3RvdHlwZS5kZWNvZGUgPSBmdW5jdGlvbiBkZWNvZGUoZGF0YSwgZW5jLCBvcHRpb25zKSB7XG4gIHJldHVybiB0aGlzLl9nZXREZWNvZGVyKGVuYykuZGVjb2RlKGRhdGEsIG9wdGlvbnMpO1xufTtcblxuRW50aXR5LnByb3RvdHlwZS5fZ2V0RW5jb2RlciA9IGZ1bmN0aW9uIF9nZXRFbmNvZGVyKGVuYykge1xuICAvLyBMYXppbHkgY3JlYXRlIGVuY29kZXJcbiAgaWYgKCF0aGlzLmVuY29kZXJzLmhhc093blByb3BlcnR5KGVuYykpXG4gICAgdGhpcy5lbmNvZGVyc1tlbmNdID0gdGhpcy5fY3JlYXRlTmFtZWQoYXNuMS5lbmNvZGVyc1tlbmNdKTtcbiAgcmV0dXJuIHRoaXMuZW5jb2RlcnNbZW5jXTtcbn07XG5cbkVudGl0eS5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24gZW5jb2RlKGRhdGEsIGVuYywgLyogaW50ZXJuYWwgKi8gcmVwb3J0ZXIpIHtcbiAgcmV0dXJuIHRoaXMuX2dldEVuY29kZXIoZW5jKS5lbmNvZGUoZGF0YSwgcmVwb3J0ZXIpO1xufTtcbiIsInZhciBhc24xID0gZXhwb3J0cztcblxuYXNuMS5iaWdudW0gPSByZXF1aXJlKCcuL2JpZ251bS9ibicpO1xuXG5hc24xLmRlZmluZSA9IHJlcXVpcmUoJy4vYXBpJykuZGVmaW5lO1xuYXNuMS5iYXNlID0gcmVxdWlyZSgnLi9iYXNlL2luZGV4Jyk7XG5hc24xLmNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzL2luZGV4Jyk7XG5hc24xLmRlY29kZXJzID0gcmVxdWlyZSgnLi9kZWNvZGVycy9pbmRleCcpO1xuYXNuMS5lbmNvZGVycyA9IHJlcXVpcmUoJy4vZW5jb2RlcnMvaW5kZXgnKTtcbiIsInZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ3V0aWwnKS5pbmhlcml0cztcbnZhciBSZXBvcnRlciA9IHJlcXVpcmUoJy4uL2Jhc2UnKS5SZXBvcnRlcjtcbnZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7XG5cbmZ1bmN0aW9uIERlY29kZXJCdWZmZXIoYmFzZSwgb3B0aW9ucykge1xuICBSZXBvcnRlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiYXNlKSkge1xuICAgIHRoaXMuZXJyb3IoJ0lucHV0IG5vdCBCdWZmZXInKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmJhc2UgPSBiYXNlO1xuICB0aGlzLm9mZnNldCA9IDA7XG4gIHRoaXMubGVuZ3RoID0gYmFzZS5sZW5ndGg7XG59XG5pbmhlcml0cyhEZWNvZGVyQnVmZmVyLCBSZXBvcnRlcik7XG5leHBvcnRzLkRlY29kZXJCdWZmZXIgPSBEZWNvZGVyQnVmZmVyO1xuXG5EZWNvZGVyQnVmZmVyLnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24gc2F2ZSgpIHtcbiAgcmV0dXJuIHsgb2Zmc2V0OiB0aGlzLm9mZnNldCwgcmVwb3J0ZXI6IFJlcG9ydGVyLnByb3RvdHlwZS5zYXZlLmNhbGwodGhpcykgfTtcbn07XG5cbkRlY29kZXJCdWZmZXIucHJvdG90eXBlLnJlc3RvcmUgPSBmdW5jdGlvbiByZXN0b3JlKHNhdmUpIHtcbiAgLy8gUmV0dXJuIHNraXBwZWQgZGF0YVxuICB2YXIgcmVzID0gbmV3IERlY29kZXJCdWZmZXIodGhpcy5iYXNlKTtcbiAgcmVzLm9mZnNldCA9IHNhdmUub2Zmc2V0O1xuICByZXMubGVuZ3RoID0gdGhpcy5vZmZzZXQ7XG5cbiAgdGhpcy5vZmZzZXQgPSBzYXZlLm9mZnNldDtcbiAgUmVwb3J0ZXIucHJvdG90eXBlLnJlc3RvcmUuY2FsbCh0aGlzLCBzYXZlLnJlcG9ydGVyKTtcblxuICByZXR1cm4gcmVzO1xufTtcblxuRGVjb2RlckJ1ZmZlci5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uIGlzRW1wdHkoKSB7XG4gIHJldHVybiB0aGlzLm9mZnNldCA9PT0gdGhpcy5sZW5ndGg7XG59O1xuXG5EZWNvZGVyQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiByZWFkVUludDgoZmFpbCkge1xuICBpZiAodGhpcy5vZmZzZXQgKyAxIDw9IHRoaXMubGVuZ3RoKVxuICAgIHJldHVybiB0aGlzLmJhc2UucmVhZFVJbnQ4KHRoaXMub2Zmc2V0KyssIHRydWUpO1xuICBlbHNlXG4gICAgcmV0dXJuIHRoaXMuZXJyb3IoZmFpbCB8fCAnRGVjb2RlckJ1ZmZlciBvdmVycnVuJyk7XG59XG5cbkRlY29kZXJCdWZmZXIucHJvdG90eXBlLnNraXAgPSBmdW5jdGlvbiBza2lwKGJ5dGVzLCBmYWlsKSB7XG4gIGlmICghKHRoaXMub2Zmc2V0ICsgYnl0ZXMgPD0gdGhpcy5sZW5ndGgpKVxuICAgIHJldHVybiB0aGlzLmVycm9yKGZhaWwgfHwgJ0RlY29kZXJCdWZmZXIgb3ZlcnJ1bicpO1xuXG4gIHZhciByZXMgPSBuZXcgRGVjb2RlckJ1ZmZlcih0aGlzLmJhc2UpO1xuXG4gIC8vIFNoYXJlIHJlcG9ydGVyIHN0YXRlXG4gIHJlcy5fcmVwb3J0ZXJTdGF0ZSA9IHRoaXMuX3JlcG9ydGVyU3RhdGU7XG5cbiAgcmVzLm9mZnNldCA9IHRoaXMub2Zmc2V0O1xuICByZXMubGVuZ3RoID0gdGhpcy5vZmZzZXQgKyBieXRlcztcbiAgdGhpcy5vZmZzZXQgKz0gYnl0ZXM7XG4gIHJldHVybiByZXM7XG59XG5cbkRlY29kZXJCdWZmZXIucHJvdG90eXBlLnJhdyA9IGZ1bmN0aW9uIHJhdyhzYXZlKSB7XG4gIHJldHVybiB0aGlzLmJhc2Uuc2xpY2Uoc2F2ZSA/IHNhdmUub2Zmc2V0IDogdGhpcy5vZmZzZXQsIHRoaXMubGVuZ3RoKTtcbn1cblxuZnVuY3Rpb24gRW5jb2RlckJ1ZmZlcih2YWx1ZSwgcmVwb3J0ZXIpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgdGhpcy5sZW5ndGggPSAwO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgaWYgKCEoaXRlbSBpbnN0YW5jZW9mIEVuY29kZXJCdWZmZXIpKVxuICAgICAgICBpdGVtID0gbmV3IEVuY29kZXJCdWZmZXIoaXRlbSwgcmVwb3J0ZXIpO1xuICAgICAgdGhpcy5sZW5ndGggKz0gaXRlbS5sZW5ndGg7XG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9LCB0aGlzKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgaWYgKCEoMCA8PSB2YWx1ZSAmJiB2YWx1ZSA8PSAweGZmKSlcbiAgICAgIHJldHVybiByZXBvcnRlci5lcnJvcignbm9uLWJ5dGUgRW5jb2RlckJ1ZmZlciB2YWx1ZScpO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmxlbmd0aCA9IDE7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHZhbHVlKTtcbiAgfSBlbHNlIGlmIChCdWZmZXIuaXNCdWZmZXIodmFsdWUpKSB7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMubGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiByZXBvcnRlci5lcnJvcignVW5zdXBwb3J0ZWQgdHlwZTogJyArIHR5cGVvZiB2YWx1ZSk7XG4gIH1cbn1cbmV4cG9ydHMuRW5jb2RlckJ1ZmZlciA9IEVuY29kZXJCdWZmZXI7XG5cbkVuY29kZXJCdWZmZXIucHJvdG90eXBlLmpvaW4gPSBmdW5jdGlvbiBqb2luKG91dCwgb2Zmc2V0KSB7XG4gIGlmICghb3V0KVxuICAgIG91dCA9IG5ldyBCdWZmZXIodGhpcy5sZW5ndGgpO1xuICBpZiAoIW9mZnNldClcbiAgICBvZmZzZXQgPSAwO1xuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMClcbiAgICByZXR1cm4gb3V0O1xuXG4gIGlmIChBcnJheS5pc0FycmF5KHRoaXMudmFsdWUpKSB7XG4gICAgdGhpcy52YWx1ZS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIGl0ZW0uam9pbihvdXQsIG9mZnNldCk7XG4gICAgICBvZmZzZXQgKz0gaXRlbS5sZW5ndGg7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnZhbHVlID09PSAnbnVtYmVyJylcbiAgICAgIG91dFtvZmZzZXRdID0gdGhpcy52YWx1ZTtcbiAgICBlbHNlIGlmICh0eXBlb2YgdGhpcy52YWx1ZSA9PT0gJ3N0cmluZycpXG4gICAgICBvdXQud3JpdGUodGhpcy52YWx1ZSwgb2Zmc2V0KTtcbiAgICBlbHNlIGlmIChCdWZmZXIuaXNCdWZmZXIodGhpcy52YWx1ZSkpXG4gICAgICB0aGlzLnZhbHVlLmNvcHkob3V0LCBvZmZzZXQpO1xuICAgIG9mZnNldCArPSB0aGlzLmxlbmd0aDtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuIiwidmFyIGJhc2UgPSBleHBvcnRzO1xuXG5iYXNlLlJlcG9ydGVyID0gcmVxdWlyZSgnLi9yZXBvcnRlcicpLlJlcG9ydGVyO1xuYmFzZS5EZWNvZGVyQnVmZmVyID0gcmVxdWlyZSgnLi9idWZmZXInKS5EZWNvZGVyQnVmZmVyO1xuYmFzZS5FbmNvZGVyQnVmZmVyID0gcmVxdWlyZSgnLi9idWZmZXInKS5FbmNvZGVyQnVmZmVyO1xuYmFzZS5Ob2RlID0gcmVxdWlyZSgnLi9ub2RlJyk7XG4iLCJ2YXIgUmVwb3J0ZXIgPSByZXF1aXJlKCcuLi9iYXNlJykuUmVwb3J0ZXI7XG52YXIgRW5jb2RlckJ1ZmZlciA9IHJlcXVpcmUoJy4uL2Jhc2UnKS5FbmNvZGVyQnVmZmVyO1xuLy92YXIgYXNzZXJ0ID0gcmVxdWlyZSgnZG91YmxlLWNoZWNrJykuYXNzZXJ0O1xuXG4vLyBTdXBwb3J0ZWQgdGFnc1xudmFyIHRhZ3MgPSBbXG4gICdzZXEnLCAnc2Vxb2YnLCAnc2V0JywgJ3NldG9mJywgJ29jdHN0cicsICdiaXRzdHInLCAnb2JqaWQnLCAnYm9vbCcsXG4gICdnZW50aW1lJywgJ3V0Y3RpbWUnLCAnbnVsbF8nLCAnZW51bScsICdpbnQnLCAnaWE1c3RyJywgJ3V0ZjhzdHInXG5dO1xuXG4vLyBQdWJsaWMgbWV0aG9kcyBsaXN0XG52YXIgbWV0aG9kcyA9IFtcbiAgJ2tleScsICdvYmonLCAndXNlJywgJ29wdGlvbmFsJywgJ2V4cGxpY2l0JywgJ2ltcGxpY2l0JywgJ2RlZicsICdjaG9pY2UnLFxuICAnYW55J1xuXS5jb25jYXQodGFncyk7XG5cbi8vIE92ZXJyaWRlZCBtZXRob2RzIGxpc3RcbnZhciBvdmVycmlkZWQgPSBbXG4gICdfcGVla1RhZycsICdfZGVjb2RlVGFnJywgJ191c2UnLFxuICAnX2RlY29kZVN0cicsICdfZGVjb2RlT2JqaWQnLCAnX2RlY29kZVRpbWUnLFxuICAnX2RlY29kZU51bGwnLCAnX2RlY29kZUludCcsICdfZGVjb2RlQm9vbCcsICdfZGVjb2RlTGlzdCcsXG5cbiAgJ19lbmNvZGVDb21wb3NpdGUnLCAnX2VuY29kZVN0cicsICdfZW5jb2RlT2JqaWQnLCAnX2VuY29kZVRpbWUnLFxuICAnX2VuY29kZU51bGwnLCAnX2VuY29kZUludCcsICdfZW5jb2RlQm9vbCdcbl07XG5cbmZ1bmN0aW9uIE5vZGUoZW5jLCBwYXJlbnQpIHtcbiAgdmFyIHN0YXRlID0ge307XG4gIHRoaXMuX2Jhc2VTdGF0ZSA9IHN0YXRlO1xuXG4gIHN0YXRlLmVuYyA9IGVuYztcblxuICBzdGF0ZS5wYXJlbnQgPSBwYXJlbnQgfHwgbnVsbDtcbiAgc3RhdGUuY2hpbGRyZW4gPSBudWxsO1xuXG4gIC8vIFN0YXRlXG4gIHN0YXRlLnRhZyA9IG51bGw7XG4gIHN0YXRlLmFyZ3MgPSBudWxsO1xuICBzdGF0ZS5yZXZlcnNlQXJncyA9IG51bGw7XG4gIHN0YXRlLmNob2ljZSA9IG51bGw7XG4gIHN0YXRlLm9wdGlvbmFsID0gZmFsc2U7XG4gIHN0YXRlLmFueSA9IGZhbHNlO1xuICBzdGF0ZS5vYmogPSBmYWxzZTtcbiAgc3RhdGUudXNlID0gbnVsbDtcbiAgc3RhdGUudXNlRGVjb2RlciA9IG51bGw7XG4gIHN0YXRlLmtleSA9IG51bGw7XG4gIHN0YXRlWydkZWZhdWx0J10gPSBudWxsO1xuICBzdGF0ZS5leHBsaWNpdCA9IG51bGw7XG4gIHN0YXRlLmltcGxpY2l0ID0gbnVsbDtcblxuICAvLyBTaG91bGQgY3JlYXRlIG5ldyBpbnN0YW5jZSBvbiBlYWNoIG1ldGhvZFxuICBpZiAoIXN0YXRlLnBhcmVudCkge1xuICAgIHN0YXRlLmNoaWxkcmVuID0gW107XG4gICAgdGhpcy5fd3JhcCgpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IE5vZGU7XG5cbnZhciBzdGF0ZVByb3BzID0gW1xuICAnZW5jJywgJ3BhcmVudCcsICdjaGlsZHJlbicsICd0YWcnLCAnYXJncycsICdyZXZlcnNlQXJncycsICdjaG9pY2UnLFxuICAnb3B0aW9uYWwnLCAnYW55JywgJ29iaicsICd1c2UnLCAnYWx0ZXJlZFVzZScsICdrZXknLCAnZGVmYXVsdCcsICdleHBsaWNpdCcsXG4gICdpbXBsaWNpdCdcbl07XG5cbk5vZGUucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gY2xvbmUoKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcbiAgdmFyIGNzdGF0ZSA9IHt9O1xuICBzdGF0ZVByb3BzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgIGNzdGF0ZVtwcm9wXSA9IHN0YXRlW3Byb3BdO1xuICB9KTtcbiAgdmFyIHJlcyA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKGNzdGF0ZS5wYXJlbnQpO1xuICByZXMuX2Jhc2VTdGF0ZSA9IGNzdGF0ZTtcbiAgcmV0dXJuIHJlcztcbn07XG5cbk5vZGUucHJvdG90eXBlLl93cmFwID0gZnVuY3Rpb24gd3JhcCgpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuICBtZXRob2RzLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgdGhpc1ttZXRob2RdID0gZnVuY3Rpb24gX3dyYXBwZWRNZXRob2QoKSB7XG4gICAgICB2YXIgY2xvbmUgPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKTtcbiAgICAgIHN0YXRlLmNoaWxkcmVuLnB1c2goY2xvbmUpO1xuICAgICAgcmV0dXJuIGNsb25lW21ldGhvZF0uYXBwbHkoY2xvbmUsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfSwgdGhpcyk7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uIGluaXQoYm9keSkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgLy9hc3NlcnQuZXF1YWwoc3RhdGUucGFyZW50LG51bGwsJ3N0YXRlLnBhcmVudCBzaG91bGQgYmUgbnVsbCcpO1xuICBib2R5LmNhbGwodGhpcyk7XG5cbiAgLy8gRmlsdGVyIGNoaWxkcmVuXG4gIHN0YXRlLmNoaWxkcmVuID0gc3RhdGUuY2hpbGRyZW4uZmlsdGVyKGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgcmV0dXJuIGNoaWxkLl9iYXNlU3RhdGUucGFyZW50ID09PSB0aGlzO1xuICB9LCB0aGlzKTtcbiAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlLmNoaWxkcmVuLmxlbmd0aCwgMSwgJ1Jvb3Qgbm9kZSBjYW4gaGF2ZSBvbmx5IG9uZSBjaGlsZCcpO1xufTtcblxuTm9kZS5wcm90b3R5cGUuX3VzZUFyZ3MgPSBmdW5jdGlvbiB1c2VBcmdzKGFyZ3MpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gIC8vIEZpbHRlciBjaGlsZHJlbiBhbmQgYXJnc1xuICB2YXIgY2hpbGRyZW4gPSBhcmdzLmZpbHRlcihmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gYXJnIGluc3RhbmNlb2YgdGhpcy5jb25zdHJ1Y3RvcjtcbiAgfSwgdGhpcyk7XG4gIGFyZ3MgPSBhcmdzLmZpbHRlcihmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gIShhcmcgaW5zdGFuY2VvZiB0aGlzLmNvbnN0cnVjdG9yKTtcbiAgfSwgdGhpcyk7XG5cbiAgaWYgKGNoaWxkcmVuLmxlbmd0aCAhPT0gMCkge1xuICAgIC8vIGFzc2VydC5lcXVhbChzdGF0ZS5jaGlsZHJlbiwgbnVsbCwgJ3N0YXRlLmNoaWxkcmVuIHNob3VsZCBiZSBudWxsJyk7XG4gICAgc3RhdGUuY2hpbGRyZW4gPSBjaGlsZHJlbjtcblxuICAgIC8vIFJlcGxhY2UgcGFyZW50IHRvIG1haW50YWluIGJhY2t3YXJkIGxpbmtcbiAgICBjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICBjaGlsZC5fYmFzZVN0YXRlLnBhcmVudCA9IHRoaXM7XG4gICAgfSwgdGhpcyk7XG4gIH1cbiAgaWYgKGFyZ3MubGVuZ3RoICE9PSAwKSB7XG4gICAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlLmFyZ3MsIG51bGwsICdzdGF0ZS5hcmdzIHNob3VsZCBiZSBudWxsJyk7XG4gICAgc3RhdGUuYXJncyA9IGFyZ3M7XG4gICAgc3RhdGUucmV2ZXJzZUFyZ3MgPSBhcmdzLm1hcChmdW5jdGlvbihhcmcpIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnICE9PSAnb2JqZWN0JyB8fCBhcmcuY29uc3RydWN0b3IgIT09IE9iamVjdClcbiAgICAgICAgcmV0dXJuIGFyZztcblxuICAgICAgdmFyIHJlcyA9IHt9O1xuICAgICAgT2JqZWN0LmtleXMoYXJnKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICBpZiAoa2V5ID09IChrZXkgfCAwKSlcbiAgICAgICAgICBrZXkgfD0gMDtcbiAgICAgICAgdmFyIHZhbHVlID0gYXJnW2tleV07XG4gICAgICAgIHJlc1t2YWx1ZV0gPSBrZXk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vXG4vLyBPdmVycmlkZWQgbWV0aG9kc1xuLy9cblxub3ZlcnJpZGVkLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gIE5vZGUucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbiBfb3ZlcnJpZGVkKCkge1xuICAgIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcbiAgICB0aHJvdyBuZXcgRXJyb3IobWV0aG9kICsgJyBub3QgaW1wbGVtZW50ZWQgZm9yIGVuY29kaW5nOiAnICsgc3RhdGUuZW5jKTtcbiAgfTtcbn0pO1xuXG4vL1xuLy8gUHVibGljIG1ldGhvZHNcbi8vXG5cbnRhZ3MuZm9yRWFjaChmdW5jdGlvbih0YWcpIHtcbiAgTm9kZS5wcm90b3R5cGVbdGFnXSA9IGZ1bmN0aW9uIF90YWdNZXRob2QoKSB7XG4gICAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblxuICAgIC8vIGFzc2VydC5lcXVhbChzdGF0ZS50YWcsIG51bGwsICdzdGF0ZS50YWcgc2hvdWxkIGJlIG51bGwnKTtcbiAgICBzdGF0ZS50YWcgPSB0YWc7XG5cbiAgICB0aGlzLl91c2VBcmdzKGFyZ3MpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG59KTtcblxuTm9kZS5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGl0ZW0pIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gIC8vIGFzc2VydC5lcXVhbChzdGF0ZS51c2UsIG51bGwsICdzdGF0ZS51c2Ugc2hvdWxkIGJlIG51bGwnKTtcbiAgc3RhdGUudXNlID0gaXRlbTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbk5vZGUucHJvdG90eXBlLm9wdGlvbmFsID0gZnVuY3Rpb24gb3B0aW9uYWwoKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICBzdGF0ZS5vcHRpb25hbCA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5kZWYgPSBmdW5jdGlvbiBkZWYodmFsKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICAvLyBhc3NlcnQuZXF1YWwoc3RhdGVbJ2RlZmF1bHQnXSwgbnVsbCwgXCJzdGF0ZVsnZGVmYXVsdCddIHNob3VsZCBiZSBudWxsXCIpO1xuICBzdGF0ZVsnZGVmYXVsdCddID0gdmFsO1xuICBzdGF0ZS5vcHRpb25hbCA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5leHBsaWNpdCA9IGZ1bmN0aW9uIGV4cGxpY2l0KG51bSkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlLmV4cGxpY2l0LG51bGwsICdzdGF0ZS5leHBsaWNpdCBzaG91bGQgYmUgbnVsbCcpO1xuICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUuaW1wbGljaXQsbnVsbCwgJ3N0YXRlLmltcGxpY2l0IHNob3VsZCBiZSBudWxsJyk7XG5cbiAgc3RhdGUuZXhwbGljaXQgPSBudW07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5pbXBsaWNpdCA9IGZ1bmN0aW9uIGltcGxpY2l0KG51bSkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUuZXhwbGljaXQsbnVsbCwgJ3N0YXRlLmV4cGxpY2l0IHNob3VsZCBiZSBudWxsJyk7XG4gICAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlLmltcGxpY2l0LG51bGwsICdzdGF0ZS5pbXBsaWNpdCBzaG91bGQgYmUgbnVsbCcpO1xuXG4gICAgc3RhdGUuaW1wbGljaXQgPSBudW07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5vYmogPSBmdW5jdGlvbiBvYmooKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXG4gIHN0YXRlLm9iaiA9IHRydWU7XG5cbiAgaWYgKGFyZ3MubGVuZ3RoICE9PSAwKVxuICAgIHRoaXMuX3VzZUFyZ3MoYXJncyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5rZXkgPSBmdW5jdGlvbiBrZXkobmV3S2V5KSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUua2V5LCBudWxsLCAnc3RhdGUua2V5IHNob3VsZCBiZSBudWxsJyk7XG4gIHN0YXRlLmtleSA9IG5ld0tleTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbk5vZGUucHJvdG90eXBlLmFueSA9IGZ1bmN0aW9uIGFueSgpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gIHN0YXRlLmFueSA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5jaG9pY2UgPSBmdW5jdGlvbiBjaG9pY2Uob2JqKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUuY2hvaWNlLCBudWxsLCdzdGF0ZS5jaG9pY2Ugc2hvdWxkIGJlIG51bGwnKTtcbiAgc3RhdGUuY2hvaWNlID0gb2JqO1xuICB0aGlzLl91c2VBcmdzKE9iamVjdC5rZXlzKG9iaikubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBvYmpba2V5XTtcbiAgfSkpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIERlY29kaW5nXG4vL1xuXG5Ob2RlLnByb3RvdHlwZS5fZGVjb2RlID0gZnVuY3Rpb24gZGVjb2RlKGlucHV0KSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICAvLyBEZWNvZGUgcm9vdCBub2RlXG4gIGlmIChzdGF0ZS5wYXJlbnQgPT09IG51bGwpXG4gICAgcmV0dXJuIGlucHV0LndyYXBSZXN1bHQoc3RhdGUuY2hpbGRyZW5bMF0uX2RlY29kZShpbnB1dCkpO1xuXG4gIHZhciByZXN1bHQgPSBzdGF0ZVsnZGVmYXVsdCddO1xuICB2YXIgcHJlc2VudCA9IHRydWU7XG5cbiAgdmFyIHByZXZLZXk7XG4gIGlmIChzdGF0ZS5rZXkgIT09IG51bGwpXG4gICAgcHJldktleSA9IGlucHV0LmVudGVyS2V5KHN0YXRlLmtleSk7XG5cbiAgLy8gQ2hlY2sgaWYgdGFnIGlzIHRoZXJlXG4gIGlmIChzdGF0ZS5vcHRpb25hbCkge1xuICAgIHZhciB0YWcgPSBudWxsO1xuICAgIGlmIChzdGF0ZS5leHBsaWNpdCAhPT0gbnVsbClcbiAgICAgIHRhZyA9IHN0YXRlLmV4cGxpY2l0O1xuICAgIGVsc2UgaWYgKHN0YXRlLmltcGxpY2l0ICE9PSBudWxsKVxuICAgICAgdGFnID0gc3RhdGUuaW1wbGljaXQ7XG4gICAgZWxzZSBpZiAoc3RhdGUudGFnICE9PSBudWxsKVxuICAgICAgdGFnID0gc3RhdGUudGFnO1xuXG4gICAgaWYgKHRhZyA9PT0gbnVsbCAmJiAhc3RhdGUuYW55KSB7XG4gICAgICAvLyBUcmlhbCBhbmQgRXJyb3JcbiAgICAgIHZhciBzYXZlID0gaW5wdXQuc2F2ZSgpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHN0YXRlLmNob2ljZSA9PT0gbnVsbClcbiAgICAgICAgICB0aGlzLl9kZWNvZGVHZW5lcmljKHN0YXRlLnRhZywgaW5wdXQpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhpcy5fZGVjb2RlQ2hvaWNlKGlucHV0KTtcbiAgICAgICAgcHJlc2VudCA9IHRydWU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHByZXNlbnQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlucHV0LnJlc3RvcmUoc2F2ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXNlbnQgPSB0aGlzLl9wZWVrVGFnKGlucHV0LCB0YWcsIHN0YXRlLmFueSk7XG5cbiAgICAgIGlmIChpbnB1dC5pc0Vycm9yKHByZXNlbnQpKVxuICAgICAgICByZXR1cm4gcHJlc2VudDtcbiAgICB9XG4gIH1cblxuICAvLyBQdXNoIG9iamVjdCBvbiBzdGFja1xuICB2YXIgcHJldk9iajtcbiAgaWYgKHN0YXRlLm9iaiAmJiBwcmVzZW50KVxuICAgIHByZXZPYmogPSBpbnB1dC5lbnRlck9iamVjdCgpO1xuXG4gIGlmIChwcmVzZW50KSB7XG4gICAgLy8gVW53cmFwIGV4cGxpY2l0IHZhbHVlc1xuICAgIGlmIChzdGF0ZS5leHBsaWNpdCAhPT0gbnVsbCkge1xuICAgICAgdmFyIGV4cGxpY2l0ID0gdGhpcy5fZGVjb2RlVGFnKGlucHV0LCBzdGF0ZS5leHBsaWNpdCk7XG4gICAgICBpZiAoaW5wdXQuaXNFcnJvcihleHBsaWNpdCkpXG4gICAgICAgIHJldHVybiBleHBsaWNpdDtcbiAgICAgIGlucHV0ID0gZXhwbGljaXQ7XG4gICAgfVxuXG4gICAgLy8gVW53cmFwIGltcGxpY2l0IGFuZCBub3JtYWwgdmFsdWVzXG4gICAgaWYgKHN0YXRlLnVzZSA9PT0gbnVsbCAmJiBzdGF0ZS5jaG9pY2UgPT09IG51bGwpIHtcbiAgICAgIGlmIChzdGF0ZS5hbnkpXG4gICAgICAgIHZhciBzYXZlID0gaW5wdXQuc2F2ZSgpO1xuICAgICAgdmFyIGJvZHkgPSB0aGlzLl9kZWNvZGVUYWcoXG4gICAgICAgIGlucHV0LFxuICAgICAgICBzdGF0ZS5pbXBsaWNpdCAhPT0gbnVsbCA/IHN0YXRlLmltcGxpY2l0IDogc3RhdGUudGFnLFxuICAgICAgICBzdGF0ZS5hbnlcbiAgICAgICk7XG4gICAgICBpZiAoaW5wdXQuaXNFcnJvcihib2R5KSlcbiAgICAgICAgcmV0dXJuIGJvZHk7XG5cbiAgICAgIGlmIChzdGF0ZS5hbnkpXG4gICAgICAgIHJlc3VsdCA9IGlucHV0LnJhdyhzYXZlKTtcbiAgICAgIGVsc2VcbiAgICAgICAgaW5wdXQgPSBib2R5O1xuICAgIH1cblxuICAgIC8vIFNlbGVjdCBwcm9wZXIgbWV0aG9kIGZvciB0YWdcbiAgICBpZiAoc3RhdGUuYW55KVxuICAgICAgcmVzdWx0ID0gcmVzdWx0O1xuICAgIGVsc2UgaWYgKHN0YXRlLmNob2ljZSA9PT0gbnVsbClcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2RlY29kZUdlbmVyaWMoc3RhdGUudGFnLCBpbnB1dCk7XG4gICAgZWxzZVxuICAgICAgcmVzdWx0ID0gdGhpcy5fZGVjb2RlQ2hvaWNlKGlucHV0KTtcblxuICAgIGlmIChpbnB1dC5pc0Vycm9yKHJlc3VsdCkpXG4gICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgLy8gRGVjb2RlIGNoaWxkcmVuXG4gICAgaWYgKCFzdGF0ZS5hbnkgJiYgc3RhdGUuY2hvaWNlID09PSBudWxsICYmIHN0YXRlLmNoaWxkcmVuICE9PSBudWxsKSB7XG4gICAgICB2YXIgZmFpbCA9IHN0YXRlLmNoaWxkcmVuLnNvbWUoZnVuY3Rpb24gZGVjb2RlQ2hpbGRyZW4oY2hpbGQpIHtcbiAgICAgICAgLy8gTk9URTogV2UgYXJlIGlnbm9yaW5nIGVycm9ycyBoZXJlLCB0byBsZXQgcGFyc2VyIGNvbnRpbnVlIHdpdGggb3RoZXJcbiAgICAgICAgLy8gcGFydHMgb2YgZW5jb2RlZCBkYXRhXG4gICAgICAgIGNoaWxkLl9kZWNvZGUoaW5wdXQpO1xuICAgICAgfSk7XG4gICAgICBpZiAoZmFpbClcbiAgICAgICAgcmV0dXJuIGVycjtcbiAgICB9XG4gIH1cblxuICAvLyBQb3Agb2JqZWN0XG4gIGlmIChzdGF0ZS5vYmogJiYgcHJlc2VudClcbiAgICByZXN1bHQgPSBpbnB1dC5sZWF2ZU9iamVjdChwcmV2T2JqKTtcblxuICAvLyBTZXQga2V5XG4gIGlmIChzdGF0ZS5rZXkgIT09IG51bGwgJiYgKHJlc3VsdCAhPT0gbnVsbCB8fCBwcmVzZW50ID09PSB0cnVlKSlcbiAgICBpbnB1dC5sZWF2ZUtleShwcmV2S2V5LCBzdGF0ZS5rZXksIHJlc3VsdCk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbk5vZGUucHJvdG90eXBlLl9kZWNvZGVHZW5lcmljID0gZnVuY3Rpb24gZGVjb2RlR2VuZXJpYyh0YWcsIGlucHV0KSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICBpZiAodGFnID09PSAnc2VxJyB8fCB0YWcgPT09ICdzZXQnKVxuICAgIHJldHVybiBudWxsO1xuICBpZiAodGFnID09PSAnc2Vxb2YnIHx8IHRhZyA9PT0gJ3NldG9mJylcbiAgICByZXR1cm4gdGhpcy5fZGVjb2RlTGlzdChpbnB1dCwgdGFnLCBzdGF0ZS5hcmdzWzBdKTtcbiAgZWxzZSBpZiAodGFnID09PSAnb2N0c3RyJyB8fCB0YWcgPT09ICdiaXRzdHInKVxuICAgIHJldHVybiB0aGlzLl9kZWNvZGVTdHIoaW5wdXQsIHRhZyk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ2lhNXN0cicgfHwgdGFnID09PSAndXRmOHN0cicpXG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZVN0cihpbnB1dCwgdGFnKTtcbiAgZWxzZSBpZiAodGFnID09PSAnb2JqaWQnICYmIHN0YXRlLmFyZ3MpXG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZU9iamlkKGlucHV0LCBzdGF0ZS5hcmdzWzBdLCBzdGF0ZS5hcmdzWzFdKTtcbiAgZWxzZSBpZiAodGFnID09PSAnb2JqaWQnKVxuICAgIHJldHVybiB0aGlzLl9kZWNvZGVPYmppZChpbnB1dCwgbnVsbCwgbnVsbCk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ2dlbnRpbWUnIHx8IHRhZyA9PT0gJ3V0Y3RpbWUnKVxuICAgIHJldHVybiB0aGlzLl9kZWNvZGVUaW1lKGlucHV0LCB0YWcpO1xuICBlbHNlIGlmICh0YWcgPT09ICdudWxsXycpXG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZU51bGwoaW5wdXQpO1xuICBlbHNlIGlmICh0YWcgPT09ICdib29sJylcbiAgICByZXR1cm4gdGhpcy5fZGVjb2RlQm9vbChpbnB1dCk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ2ludCcgfHwgdGFnID09PSAnZW51bScpXG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZUludChpbnB1dCwgc3RhdGUuYXJncyAmJiBzdGF0ZS5hcmdzWzBdKTtcbiAgZWxzZSBpZiAoc3RhdGUudXNlICE9PSBudWxsKVxuICAgIHJldHVybiB0aGlzLl9nZXRVc2Uoc3RhdGUudXNlLCBpbnB1dC5fcmVwb3J0ZXJTdGF0ZS5vYmopLl9kZWNvZGUoaW5wdXQpO1xuICBlbHNlXG4gICAgcmV0dXJuIGlucHV0LmVycm9yKCd1bmtub3duIHRhZzogJyArIHRhZyk7XG5cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5fZ2V0VXNlID0gZnVuY3Rpb24gX2dldFVzZShlbnRpdHksIG9iaikge1xuXG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcbiAgLy8gQ3JlYXRlIGFsdGVyZWQgdXNlIGRlY29kZXIgaWYgaW1wbGljaXQgaXMgc2V0XG4gIHN0YXRlLnVzZURlY29kZXIgPSB0aGlzLl91c2UoZW50aXR5LCBvYmopO1xuICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUudXNlRGVjb2Rlci5fYmFzZVN0YXRlLnBhcmVudCwgbnVsbCwgJ3N0YXRlLnVzZURlY29kZXIuX2Jhc2VTdGF0ZS5wYXJlbnQgc2hvdWxkIGJlIG51bGwnKTtcbiAgc3RhdGUudXNlRGVjb2RlciA9IHN0YXRlLnVzZURlY29kZXIuX2Jhc2VTdGF0ZS5jaGlsZHJlblswXTtcbiAgaWYgKHN0YXRlLmltcGxpY2l0ICE9PSBzdGF0ZS51c2VEZWNvZGVyLl9iYXNlU3RhdGUuaW1wbGljaXQpIHtcbiAgICBzdGF0ZS51c2VEZWNvZGVyID0gc3RhdGUudXNlRGVjb2Rlci5jbG9uZSgpO1xuICAgIHN0YXRlLnVzZURlY29kZXIuX2Jhc2VTdGF0ZS5pbXBsaWNpdCA9IHN0YXRlLmltcGxpY2l0O1xuICB9XG4gIHJldHVybiBzdGF0ZS51c2VEZWNvZGVyO1xufTtcblxuTm9kZS5wcm90b3R5cGUuX2RlY29kZUNob2ljZSA9IGZ1bmN0aW9uIGRlY29kZUNob2ljZShpbnB1dCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG4gIHZhciByZXN1bHQgPSBudWxsO1xuICB2YXIgbWF0Y2ggPSBmYWxzZTtcblxuICBPYmplY3Qua2V5cyhzdGF0ZS5jaG9pY2UpLnNvbWUoZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIHNhdmUgPSBpbnB1dC5zYXZlKCk7XG4gICAgdmFyIG5vZGUgPSBzdGF0ZS5jaG9pY2Vba2V5XTtcbiAgICB0cnkge1xuICAgICAgdmFyIHZhbHVlID0gbm9kZS5fZGVjb2RlKGlucHV0KTtcbiAgICAgIGlmIChpbnB1dC5pc0Vycm9yKHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICByZXN1bHQgPSB7IHR5cGU6IGtleSwgdmFsdWU6IHZhbHVlIH07XG4gICAgICBtYXRjaCA9IHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaW5wdXQucmVzdG9yZShzYXZlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sIHRoaXMpO1xuXG4gIGlmICghbWF0Y2gpXG4gICAgcmV0dXJuIGlucHV0LmVycm9yKCdDaG9pY2Ugbm90IG1hdGNoZWQnKTtcblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLy9cbi8vIEVuY29kaW5nXG4vL1xuXG5Ob2RlLnByb3RvdHlwZS5fY3JlYXRlRW5jb2RlckJ1ZmZlciA9IGZ1bmN0aW9uIGNyZWF0ZUVuY29kZXJCdWZmZXIoZGF0YSkge1xuICByZXR1cm4gbmV3IEVuY29kZXJCdWZmZXIoZGF0YSwgdGhpcy5yZXBvcnRlcik7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5fZW5jb2RlID0gZnVuY3Rpb24gZW5jb2RlKGRhdGEsIHJlcG9ydGVyLCBwYXJlbnQpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuICBpZiAoc3RhdGVbJ2RlZmF1bHQnXSAhPT0gbnVsbCAmJiBzdGF0ZVsnZGVmYXVsdCddID09PSBkYXRhKVxuICAgIHJldHVybjtcblxuICB2YXIgcmVzdWx0ID0gdGhpcy5fZW5jb2RlVmFsdWUoZGF0YSwgcmVwb3J0ZXIsIHBhcmVudCk7XG4gIGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm47XG5cbiAgaWYgKHRoaXMuX3NraXBEZWZhdWx0KHJlc3VsdCwgcmVwb3J0ZXIsIHBhcmVudCkpXG4gICAgcmV0dXJuO1xuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5fZW5jb2RlVmFsdWUgPSBmdW5jdGlvbiBlbmNvZGUoZGF0YSwgcmVwb3J0ZXIsIHBhcmVudCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgLy8gRGVjb2RlIHJvb3Qgbm9kZVxuICBpZiAoc3RhdGUucGFyZW50ID09PSBudWxsKVxuICAgIHJldHVybiBzdGF0ZS5jaGlsZHJlblswXS5fZW5jb2RlKGRhdGEsIHJlcG9ydGVyIHx8IG5ldyBSZXBvcnRlcigpKTtcblxuICB2YXIgcmVzdWx0ID0gbnVsbDtcbiAgdmFyIHByZXNlbnQgPSB0cnVlO1xuXG4gIC8vIFNldCByZXBvcnRlciB0byBzaGFyZSBpdCB3aXRoIGEgY2hpbGQgY2xhc3NcbiAgdGhpcy5yZXBvcnRlciA9IHJlcG9ydGVyO1xuXG4gIC8vIENoZWNrIGlmIGRhdGEgaXMgdGhlcmVcbiAgaWYgKHN0YXRlLm9wdGlvbmFsICYmIGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgIGlmIChzdGF0ZVsnZGVmYXVsdCddICE9PSBudWxsKVxuICAgICAgZGF0YSA9IHN0YXRlWydkZWZhdWx0J11cbiAgICBlbHNlXG4gICAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3IgZXJyb3IgcmVwb3J0aW5nXG4gIHZhciBwcmV2S2V5O1xuXG4gIC8vIEVuY29kZSBjaGlsZHJlbiBmaXJzdFxuICB2YXIgY29udGVudCA9IG51bGw7XG4gIHZhciBwcmltaXRpdmUgPSBmYWxzZTtcbiAgaWYgKHN0YXRlLmFueSkge1xuICAgIC8vIEFueXRoaW5nIHRoYXQgd2FzIGdpdmVuIGlzIHRyYW5zbGF0ZWQgdG8gYnVmZmVyXG4gICAgcmVzdWx0ID0gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihkYXRhKTtcbiAgfSBlbHNlIGlmIChzdGF0ZS5jaG9pY2UpIHtcbiAgICByZXN1bHQgPSB0aGlzLl9lbmNvZGVDaG9pY2UoZGF0YSwgcmVwb3J0ZXIpO1xuICB9IGVsc2UgaWYgKHN0YXRlLmNoaWxkcmVuKSB7XG4gICAgY29udGVudCA9IHN0YXRlLmNoaWxkcmVuLm1hcChmdW5jdGlvbihjaGlsZCkge1xuICAgICAgaWYgKGNoaWxkLl9iYXNlU3RhdGUudGFnID09PSAnbnVsbF8nKVxuICAgICAgICByZXR1cm4gY2hpbGQuX2VuY29kZShudWxsLCByZXBvcnRlciwgZGF0YSk7XG5cbiAgICAgIGlmIChjaGlsZC5fYmFzZVN0YXRlLmtleSA9PT0gbnVsbClcbiAgICAgICAgcmV0dXJuIHJlcG9ydGVyLmVycm9yKCdDaGlsZCBzaG91bGQgaGF2ZSBhIGtleScpO1xuICAgICAgdmFyIHByZXZLZXkgPSByZXBvcnRlci5lbnRlcktleShjaGlsZC5fYmFzZVN0YXRlLmtleSk7XG5cbiAgICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gJ29iamVjdCcpXG4gICAgICAgIHJldHVybiByZXBvcnRlci5lcnJvcignQ2hpbGQgZXhwZWN0ZWQsIGJ1dCBpbnB1dCBpcyBub3Qgb2JqZWN0Jyk7XG5cbiAgICAgIHZhciByZXMgPSBjaGlsZC5fZW5jb2RlKGRhdGFbY2hpbGQuX2Jhc2VTdGF0ZS5rZXldLCByZXBvcnRlciwgZGF0YSk7XG4gICAgICByZXBvcnRlci5sZWF2ZUtleShwcmV2S2V5KTtcblxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9LCB0aGlzKS5maWx0ZXIoZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgIHJldHVybiBjaGlsZDtcbiAgICB9KTtcblxuICAgIGNvbnRlbnQgPSB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKGNvbnRlbnQpO1xuICB9IGVsc2Uge1xuICAgIGlmIChzdGF0ZS50YWcgPT09ICdzZXFvZicgfHwgc3RhdGUudGFnID09PSAnc2V0b2YnKSB7XG4gICAgICAvLyBUT0RPKGluZHV0bnkpOiB0aGlzIHNob3VsZCBiZSB0aHJvd24gb24gRFNMIGxldmVsXG4gICAgICBpZiAoIShzdGF0ZS5hcmdzICYmIHN0YXRlLmFyZ3MubGVuZ3RoID09PSAxKSlcbiAgICAgICAgcmV0dXJuIHJlcG9ydGVyLmVycm9yKCdUb28gbWFueSBhcmdzIGZvciA6ICcgKyBzdGF0ZS50YWcpO1xuXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkpXG4gICAgICAgIHJldHVybiByZXBvcnRlci5lcnJvcignc2Vxb2Yvc2V0b2YsIGJ1dCBkYXRhIGlzIG5vdCBBcnJheScpO1xuXG4gICAgICB2YXIgY2hpbGQgPSB0aGlzLmNsb25lKCk7XG4gICAgICBjaGlsZC5fYmFzZVN0YXRlLmltcGxpY2l0ID0gbnVsbDtcbiAgICAgIGNvbnRlbnQgPSB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKGRhdGEubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRVc2Uoc3RhdGUuYXJnc1swXSwgZGF0YSkuX2VuY29kZShpdGVtLCByZXBvcnRlcik7XG4gICAgICB9LCBjaGlsZCkpO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUudXNlICE9PSBudWxsKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl9nZXRVc2Uoc3RhdGUudXNlLCBwYXJlbnQpLl9lbmNvZGUoZGF0YSwgcmVwb3J0ZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZW50ID0gdGhpcy5fZW5jb2RlUHJpbWl0aXZlKHN0YXRlLnRhZywgZGF0YSk7XG4gICAgICBwcmltaXRpdmUgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIEVuY29kZSBkYXRhIGl0c2VsZlxuICB2YXIgcmVzdWx0O1xuICBpZiAoIXN0YXRlLmFueSAmJiBzdGF0ZS5jaG9pY2UgPT09IG51bGwpIHtcbiAgICB2YXIgdGFnID0gc3RhdGUuaW1wbGljaXQgIT09IG51bGwgPyBzdGF0ZS5pbXBsaWNpdCA6IHN0YXRlLnRhZztcbiAgICB2YXIgY2xzID0gc3RhdGUuaW1wbGljaXQgPT09IG51bGwgPyAndW5pdmVyc2FsJyA6ICdjb250ZXh0JztcblxuICAgIGlmICh0YWcgPT09IG51bGwpIHtcbiAgICAgIGlmIChzdGF0ZS51c2UgPT09IG51bGwpXG4gICAgICAgIHJlcG9ydGVyLmVycm9yKCdUYWcgY291bGQgYmUgb21taXRlZCBvbmx5IGZvciAudXNlKCknKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHN0YXRlLnVzZSA9PT0gbnVsbClcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5fZW5jb2RlQ29tcG9zaXRlKHRhZywgcHJpbWl0aXZlLCBjbHMsIGNvbnRlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFdyYXAgaW4gZXhwbGljaXRcbiAgaWYgKHN0YXRlLmV4cGxpY2l0ICE9PSBudWxsKVxuICAgIHJlc3VsdCA9IHRoaXMuX2VuY29kZUNvbXBvc2l0ZShzdGF0ZS5leHBsaWNpdCwgZmFsc2UsICdjb250ZXh0JywgcmVzdWx0KTtcblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuTm9kZS5wcm90b3R5cGUuX2VuY29kZUNob2ljZSA9IGZ1bmN0aW9uIGVuY29kZUNob2ljZShkYXRhLCByZXBvcnRlcikge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgdmFyIG5vZGUgPSBzdGF0ZS5jaG9pY2VbZGF0YS50eXBlXTtcbiAgLy8gaWYgKCFub2RlKSB7XG4gIC8vICAgYXNzZXJ0KFxuICAvLyAgICAgICBmYWxzZSxcbiAgLy8gICAgICAgZGF0YS50eXBlICsgJyBub3QgZm91bmQgaW4gJyArXG4gIC8vICAgICAgICAgICBKU09OLnN0cmluZ2lmeShPYmplY3Qua2V5cyhzdGF0ZS5jaG9pY2UpKSk7XG4gIC8vIH1cbiAgcmV0dXJuIG5vZGUuX2VuY29kZShkYXRhLnZhbHVlLCByZXBvcnRlcik7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5fZW5jb2RlUHJpbWl0aXZlID0gZnVuY3Rpb24gZW5jb2RlUHJpbWl0aXZlKHRhZywgZGF0YSkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgaWYgKHRhZyA9PT0gJ29jdHN0cicgfHwgdGFnID09PSAnYml0c3RyJyB8fCB0YWcgPT09ICdpYTVzdHInKVxuICAgIHJldHVybiB0aGlzLl9lbmNvZGVTdHIoZGF0YSwgdGFnKTtcbiAgZWxzZSBpZiAodGFnID09PSAndXRmOHN0cicpXG4gICAgcmV0dXJuIHRoaXMuX2VuY29kZVN0cihkYXRhLCB0YWcpO1xuICBlbHNlIGlmICh0YWcgPT09ICdvYmppZCcgJiYgc3RhdGUuYXJncylcbiAgICByZXR1cm4gdGhpcy5fZW5jb2RlT2JqaWQoZGF0YSwgc3RhdGUucmV2ZXJzZUFyZ3NbMF0sIHN0YXRlLmFyZ3NbMV0pO1xuICBlbHNlIGlmICh0YWcgPT09ICdvYmppZCcpXG4gICAgcmV0dXJuIHRoaXMuX2VuY29kZU9iamlkKGRhdGEsIG51bGwsIG51bGwpO1xuICBlbHNlIGlmICh0YWcgPT09ICdnZW50aW1lJyB8fCB0YWcgPT09ICd1dGN0aW1lJylcbiAgICByZXR1cm4gdGhpcy5fZW5jb2RlVGltZShkYXRhLCB0YWcpO1xuICBlbHNlIGlmICh0YWcgPT09ICdudWxsXycpXG4gICAgcmV0dXJuIHRoaXMuX2VuY29kZU51bGwoKTtcbiAgZWxzZSBpZiAodGFnID09PSAnaW50JyB8fCB0YWcgPT09ICdlbnVtJylcbiAgICByZXR1cm4gdGhpcy5fZW5jb2RlSW50KGRhdGEsIHN0YXRlLmFyZ3MgJiYgc3RhdGUucmV2ZXJzZUFyZ3NbMF0pO1xuICBlbHNlIGlmICh0YWcgPT09ICdib29sJylcbiAgICByZXR1cm4gdGhpcy5fZW5jb2RlQm9vbChkYXRhKTtcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgdGFnOiAnICsgdGFnKTtcbn07XG4iLCJ2YXIgaW5oZXJpdHMgPSByZXF1aXJlKCd1dGlsJykuaW5oZXJpdHM7XG5cbmZ1bmN0aW9uIFJlcG9ydGVyKG9wdGlvbnMpIHtcbiAgdGhpcy5fcmVwb3J0ZXJTdGF0ZSA9IHtcbiAgICBvYmo6IG51bGwsXG4gICAgcGF0aDogW10sXG4gICAgb3B0aW9uczogb3B0aW9ucyB8fCB7fSxcbiAgICBlcnJvcnM6IFtdXG4gIH07XG59XG5leHBvcnRzLlJlcG9ydGVyID0gUmVwb3J0ZXI7XG5cblJlcG9ydGVyLnByb3RvdHlwZS5pc0Vycm9yID0gZnVuY3Rpb24gaXNFcnJvcihvYmopIHtcbiAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIFJlcG9ydGVyRXJyb3I7XG59O1xuXG5SZXBvcnRlci5wcm90b3R5cGUuc2F2ZSA9IGZ1bmN0aW9uIHNhdmUoKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlcG9ydGVyU3RhdGU7XG5cbiAgcmV0dXJuIHsgb2JqOiBzdGF0ZS5vYmosIHBhdGhMZW46IHN0YXRlLnBhdGgubGVuZ3RoIH07XG59O1xuXG5SZXBvcnRlci5wcm90b3R5cGUucmVzdG9yZSA9IGZ1bmN0aW9uIHJlc3RvcmUoZGF0YSkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZXBvcnRlclN0YXRlO1xuXG4gIHN0YXRlLm9iaiA9IGRhdGEub2JqO1xuICBzdGF0ZS5wYXRoID0gc3RhdGUucGF0aC5zbGljZSgwLCBkYXRhLnBhdGhMZW4pO1xufTtcblxuUmVwb3J0ZXIucHJvdG90eXBlLmVudGVyS2V5ID0gZnVuY3Rpb24gZW50ZXJLZXkoa2V5KSB7XG4gIHJldHVybiB0aGlzLl9yZXBvcnRlclN0YXRlLnBhdGgucHVzaChrZXkpO1xufTtcblxuUmVwb3J0ZXIucHJvdG90eXBlLmxlYXZlS2V5ID0gZnVuY3Rpb24gbGVhdmVLZXkoaW5kZXgsIGtleSwgdmFsdWUpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVwb3J0ZXJTdGF0ZTtcblxuICBzdGF0ZS5wYXRoID0gc3RhdGUucGF0aC5zbGljZSgwLCBpbmRleCAtIDEpO1xuICBpZiAoc3RhdGUub2JqICE9PSBudWxsKVxuICAgIHN0YXRlLm9ialtrZXldID0gdmFsdWU7XG59O1xuXG5SZXBvcnRlci5wcm90b3R5cGUuZW50ZXJPYmplY3QgPSBmdW5jdGlvbiBlbnRlck9iamVjdCgpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVwb3J0ZXJTdGF0ZTtcblxuICB2YXIgcHJldiA9IHN0YXRlLm9iajtcbiAgc3RhdGUub2JqID0ge307XG4gIHJldHVybiBwcmV2O1xufTtcblxuUmVwb3J0ZXIucHJvdG90eXBlLmxlYXZlT2JqZWN0ID0gZnVuY3Rpb24gbGVhdmVPYmplY3QocHJldikge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZXBvcnRlclN0YXRlO1xuXG4gIHZhciBub3cgPSBzdGF0ZS5vYmo7XG4gIHN0YXRlLm9iaiA9IHByZXY7XG4gIHJldHVybiBub3c7XG59O1xuXG5SZXBvcnRlci5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbiBlcnJvcihtc2cpIHtcbiAgdmFyIGVycjtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVwb3J0ZXJTdGF0ZTtcblxuICB2YXIgaW5oZXJpdGVkID0gbXNnIGluc3RhbmNlb2YgUmVwb3J0ZXJFcnJvcjtcbiAgaWYgKGluaGVyaXRlZCkge1xuICAgIGVyciA9IG1zZztcbiAgfSBlbHNlIHtcbiAgICBlcnIgPSBuZXcgUmVwb3J0ZXJFcnJvcihzdGF0ZS5wYXRoLm1hcChmdW5jdGlvbihlbGVtKSB7XG4gICAgICByZXR1cm4gJ1snICsgSlNPTi5zdHJpbmdpZnkoZWxlbSkgKyAnXSc7XG4gICAgfSkuam9pbignJyksIG1zZy5tZXNzYWdlIHx8IG1zZywgbXNnLnN0YWNrKTtcbiAgfVxuXG4gIGlmICghc3RhdGUub3B0aW9ucy5wYXJ0aWFsKVxuICAgIHRocm93IGVycjtcblxuICBpZiAoIWluaGVyaXRlZClcbiAgICBzdGF0ZS5lcnJvcnMucHVzaChlcnIpO1xuXG4gIHJldHVybiBlcnI7XG59O1xuXG5SZXBvcnRlci5wcm90b3R5cGUud3JhcFJlc3VsdCA9IGZ1bmN0aW9uIHdyYXBSZXN1bHQocmVzdWx0KSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlcG9ydGVyU3RhdGU7XG4gIGlmICghc3RhdGUub3B0aW9ucy5wYXJ0aWFsKVxuICAgIHJldHVybiByZXN1bHQ7XG5cbiAgcmV0dXJuIHtcbiAgICByZXN1bHQ6IHRoaXMuaXNFcnJvcihyZXN1bHQpID8gbnVsbCA6IHJlc3VsdCxcbiAgICBlcnJvcnM6IHN0YXRlLmVycm9yc1xuICB9O1xufTtcblxuZnVuY3Rpb24gUmVwb3J0ZXJFcnJvcihwYXRoLCBtc2cpIHtcbiAgdGhpcy5wYXRoID0gcGF0aDtcbiAgdGhpcy5yZXRocm93KG1zZyk7XG59O1xuaW5oZXJpdHMoUmVwb3J0ZXJFcnJvciwgRXJyb3IpO1xuXG5SZXBvcnRlckVycm9yLnByb3RvdHlwZS5yZXRocm93ID0gZnVuY3Rpb24gcmV0aHJvdyhtc2cpIHtcbiAgdGhpcy5tZXNzYWdlID0gbXNnICsgJyBhdDogJyArICh0aGlzLnBhdGggfHwgJyhzaGFsbG93KScpO1xuICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBSZXBvcnRlckVycm9yKTtcblxuICByZXR1cm4gdGhpcztcbn07XG4iLCIoZnVuY3Rpb24gKG1vZHVsZSwgZXhwb3J0cykge1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIFV0aWxzXG5cbmZ1bmN0aW9uIGFzc2VydCh2YWwsIG1zZykge1xuICBpZiAoIXZhbClcbiAgICB0aHJvdyBuZXcgRXJyb3IobXNnIHx8ICdBc3NlcnRpb24gZmFpbGVkJyk7XG59XG5cbi8vIENvdWxkIHVzZSBgaW5oZXJpdHNgIG1vZHVsZSwgYnV0IGRvbid0IHdhbnQgdG8gbW92ZSBmcm9tIHNpbmdsZSBmaWxlXG4vLyBhcmNoaXRlY3R1cmUgeWV0LlxuZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yO1xuICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fTtcbiAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZTtcbiAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKTtcbiAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yO1xufVxuXG4vLyBCTlxuXG5mdW5jdGlvbiBCTihudW1iZXIsIGJhc2UsIGVuZGlhbikge1xuICAvLyBNYXkgYmUgYG5ldyBCTihibilgID9cbiAgaWYgKG51bWJlciAhPT0gbnVsbCAmJlxuICAgICAgdHlwZW9mIG51bWJlciA9PT0gJ29iamVjdCcgJiZcbiAgICAgIEFycmF5LmlzQXJyYXkobnVtYmVyLndvcmRzKSkge1xuICAgIHJldHVybiBudW1iZXI7XG4gIH1cblxuICB0aGlzLnNpZ24gPSBmYWxzZTtcbiAgdGhpcy53b3JkcyA9IG51bGw7XG4gIHRoaXMubGVuZ3RoID0gMDtcblxuICAvLyBSZWR1Y3Rpb24gY29udGV4dFxuICB0aGlzLnJlZCA9IG51bGw7XG5cbiAgaWYgKGJhc2UgPT09ICdsZScgfHwgYmFzZSA9PT0gJ2JlJykge1xuICAgIGVuZGlhbiA9IGJhc2U7XG4gICAgYmFzZSA9IDEwO1xuICB9XG5cbiAgaWYgKG51bWJlciAhPT0gbnVsbClcbiAgICB0aGlzLl9pbml0KG51bWJlciB8fCAwLCBiYXNlIHx8IDEwLCBlbmRpYW4gfHwgJ2JlJyk7XG59XG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG4gIG1vZHVsZS5leHBvcnRzID0gQk47XG5lbHNlXG4gIGV4cG9ydHMuQk4gPSBCTjtcblxuQk4uQk4gPSBCTjtcbkJOLndvcmRTaXplID0gMjY7XG5cbkJOLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uIGluaXQobnVtYmVyLCBiYXNlLCBlbmRpYW4pIHtcbiAgaWYgKHR5cGVvZiBudW1iZXIgPT09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHRoaXMuX2luaXROdW1iZXIobnVtYmVyLCBiYXNlLCBlbmRpYW4pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBudW1iZXIgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHRoaXMuX2luaXRBcnJheShudW1iZXIsIGJhc2UsIGVuZGlhbik7XG4gIH1cbiAgaWYgKGJhc2UgPT09ICdoZXgnKVxuICAgIGJhc2UgPSAxNjtcbiAgYXNzZXJ0KGJhc2UgPT09IChiYXNlIHwgMCkgJiYgYmFzZSA+PSAyICYmIGJhc2UgPD0gMzYpO1xuXG4gIG51bWJlciA9IG51bWJlci50b1N0cmluZygpLnJlcGxhY2UoL1xccysvZywgJycpO1xuICB2YXIgc3RhcnQgPSAwO1xuICBpZiAobnVtYmVyWzBdID09PSAnLScpXG4gICAgc3RhcnQrKztcblxuICBpZiAoYmFzZSA9PT0gMTYpXG4gICAgdGhpcy5fcGFyc2VIZXgobnVtYmVyLCBzdGFydCk7XG4gIGVsc2VcbiAgICB0aGlzLl9wYXJzZUJhc2UobnVtYmVyLCBiYXNlLCBzdGFydCk7XG5cbiAgaWYgKG51bWJlclswXSA9PT0gJy0nKVxuICAgIHRoaXMuc2lnbiA9IHRydWU7XG5cbiAgdGhpcy5zdHJpcCgpO1xuXG4gIGlmIChlbmRpYW4gIT09ICdsZScpXG4gICAgcmV0dXJuO1xuXG4gIHRoaXMuX2luaXRBcnJheSh0aGlzLnRvQXJyYXkoKSwgYmFzZSwgZW5kaWFuKTtcbn07XG5cbkJOLnByb3RvdHlwZS5faW5pdE51bWJlciA9IGZ1bmN0aW9uIF9pbml0TnVtYmVyKG51bWJlciwgYmFzZSwgZW5kaWFuKSB7XG4gIGlmIChudW1iZXIgPCAwKSB7XG4gICAgdGhpcy5zaWduID0gdHJ1ZTtcbiAgICBudW1iZXIgPSAtbnVtYmVyO1xuICB9XG4gIGlmIChudW1iZXIgPCAweDQwMDAwMDApIHtcbiAgICB0aGlzLndvcmRzID0gWyBudW1iZXIgJiAweDNmZmZmZmYgXTtcbiAgICB0aGlzLmxlbmd0aCA9IDE7XG4gIH0gZWxzZSBpZiAobnVtYmVyIDwgMHgxMDAwMDAwMDAwMDAwMCkge1xuICAgIHRoaXMud29yZHMgPSBbXG4gICAgICBudW1iZXIgJiAweDNmZmZmZmYsXG4gICAgICAobnVtYmVyIC8gMHg0MDAwMDAwKSAmIDB4M2ZmZmZmZlxuICAgIF07XG4gICAgdGhpcy5sZW5ndGggPSAyO1xuICB9IGVsc2Uge1xuICAgIGFzc2VydChudW1iZXIgPCAweDIwMDAwMDAwMDAwMDAwKTsgLy8gMiBeIDUzICh1bnNhZmUpXG4gICAgdGhpcy53b3JkcyA9IFtcbiAgICAgIG51bWJlciAmIDB4M2ZmZmZmZixcbiAgICAgIChudW1iZXIgLyAweDQwMDAwMDApICYgMHgzZmZmZmZmLFxuICAgICAgMVxuICAgIF07XG4gICAgdGhpcy5sZW5ndGggPSAzO1xuICB9XG5cbiAgaWYgKGVuZGlhbiAhPT0gJ2xlJylcbiAgICByZXR1cm47XG5cbiAgLy8gUmV2ZXJzZSB0aGUgYnl0ZXNcbiAgdGhpcy5faW5pdEFycmF5KHRoaXMudG9BcnJheSgpLCBiYXNlLCBlbmRpYW4pO1xufTtcblxuQk4ucHJvdG90eXBlLl9pbml0QXJyYXkgPSBmdW5jdGlvbiBfaW5pdEFycmF5KG51bWJlciwgYmFzZSwgZW5kaWFuKSB7XG4gIC8vIFBlcmhhcHMgYSBVaW50OEFycmF5XG4gIGFzc2VydCh0eXBlb2YgbnVtYmVyLmxlbmd0aCA9PT0gJ251bWJlcicpO1xuICBpZiAobnVtYmVyLmxlbmd0aCA8PSAwKSB7XG4gICAgdGhpcy53b3JkcyA9IFsgMCBdO1xuICAgIHRoaXMubGVuZ3RoID0gMTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRoaXMubGVuZ3RoID0gTWF0aC5jZWlsKG51bWJlci5sZW5ndGggLyAzKTtcbiAgdGhpcy53b3JkcyA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKylcbiAgICB0aGlzLndvcmRzW2ldID0gMDtcblxuICB2YXIgb2ZmID0gMDtcbiAgaWYgKGVuZGlhbiA9PT0gJ2JlJykge1xuICAgIGZvciAodmFyIGkgPSBudW1iZXIubGVuZ3RoIC0gMSwgaiA9IDA7IGkgPj0gMDsgaSAtPSAzKSB7XG4gICAgICB2YXIgdyA9IG51bWJlcltpXSB8IChudW1iZXJbaSAtIDFdIDw8IDgpIHwgKG51bWJlcltpIC0gMl0gPDwgMTYpO1xuICAgICAgdGhpcy53b3Jkc1tqXSB8PSAodyA8PCBvZmYpICYgMHgzZmZmZmZmO1xuICAgICAgdGhpcy53b3Jkc1tqICsgMV0gPSAodyA+Pj4gKDI2IC0gb2ZmKSkgJiAweDNmZmZmZmY7XG4gICAgICBvZmYgKz0gMjQ7XG4gICAgICBpZiAob2ZmID49IDI2KSB7XG4gICAgICAgIG9mZiAtPSAyNjtcbiAgICAgICAgaisrO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChlbmRpYW4gPT09ICdsZScpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IDA7IGkgPCBudW1iZXIubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgIHZhciB3ID0gbnVtYmVyW2ldIHwgKG51bWJlcltpICsgMV0gPDwgOCkgfCAobnVtYmVyW2kgKyAyXSA8PCAxNik7XG4gICAgICB0aGlzLndvcmRzW2pdIHw9ICh3IDw8IG9mZikgJiAweDNmZmZmZmY7XG4gICAgICB0aGlzLndvcmRzW2ogKyAxXSA9ICh3ID4+PiAoMjYgLSBvZmYpKSAmIDB4M2ZmZmZmZjtcbiAgICAgIG9mZiArPSAyNDtcbiAgICAgIGlmIChvZmYgPj0gMjYpIHtcbiAgICAgICAgb2ZmIC09IDI2O1xuICAgICAgICBqKys7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XG59O1xuXG5mdW5jdGlvbiBwYXJzZUhleChzdHIsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHIgPSAwO1xuICB2YXIgbGVuID0gTWF0aC5taW4oc3RyLmxlbmd0aCwgZW5kKTtcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgbGVuOyBpKyspIHtcbiAgICB2YXIgYyA9IHN0ci5jaGFyQ29kZUF0KGkpIC0gNDg7XG5cbiAgICByIDw8PSA0O1xuXG4gICAgLy8gJ2EnIC0gJ2YnXG4gICAgaWYgKGMgPj0gNDkgJiYgYyA8PSA1NClcbiAgICAgIHIgfD0gYyAtIDQ5ICsgMHhhO1xuXG4gICAgLy8gJ0EnIC0gJ0YnXG4gICAgZWxzZSBpZiAoYyA+PSAxNyAmJiBjIDw9IDIyKVxuICAgICAgciB8PSBjIC0gMTcgKyAweGE7XG5cbiAgICAvLyAnMCcgLSAnOSdcbiAgICBlbHNlXG4gICAgICByIHw9IGMgJiAweGY7XG4gIH1cbiAgcmV0dXJuIHI7XG59XG5cbkJOLnByb3RvdHlwZS5fcGFyc2VIZXggPSBmdW5jdGlvbiBfcGFyc2VIZXgobnVtYmVyLCBzdGFydCkge1xuICAvLyBDcmVhdGUgcG9zc2libHkgYmlnZ2VyIGFycmF5IHRvIGVuc3VyZSB0aGF0IGl0IGZpdHMgdGhlIG51bWJlclxuICB0aGlzLmxlbmd0aCA9IE1hdGguY2VpbCgobnVtYmVyLmxlbmd0aCAtIHN0YXJ0KSAvIDYpO1xuICB0aGlzLndvcmRzID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKVxuICAgIHRoaXMud29yZHNbaV0gPSAwO1xuXG4gIC8vIFNjYW4gMjQtYml0IGNodW5rcyBhbmQgYWRkIHRoZW0gdG8gdGhlIG51bWJlclxuICB2YXIgb2ZmID0gMDtcbiAgZm9yICh2YXIgaSA9IG51bWJlci5sZW5ndGggLSA2LCBqID0gMDsgaSA+PSBzdGFydDsgaSAtPSA2KSB7XG4gICAgdmFyIHcgPSBwYXJzZUhleChudW1iZXIsIGksIGkgKyA2KTtcbiAgICB0aGlzLndvcmRzW2pdIHw9ICh3IDw8IG9mZikgJiAweDNmZmZmZmY7XG4gICAgdGhpcy53b3Jkc1tqICsgMV0gfD0gdyA+Pj4gKDI2IC0gb2ZmKSAmIDB4M2ZmZmZmO1xuICAgIG9mZiArPSAyNDtcbiAgICBpZiAob2ZmID49IDI2KSB7XG4gICAgICBvZmYgLT0gMjY7XG4gICAgICBqKys7XG4gICAgfVxuICB9XG4gIGlmIChpICsgNiAhPT0gc3RhcnQpIHtcbiAgICB2YXIgdyA9IHBhcnNlSGV4KG51bWJlciwgc3RhcnQsIGkgKyA2KTtcbiAgICB0aGlzLndvcmRzW2pdIHw9ICh3IDw8IG9mZikgJiAweDNmZmZmZmY7XG4gICAgdGhpcy53b3Jkc1tqICsgMV0gfD0gdyA+Pj4gKDI2IC0gb2ZmKSAmIDB4M2ZmZmZmO1xuICB9XG4gIHRoaXMuc3RyaXAoKTtcbn07XG5cbmZ1bmN0aW9uIHBhcnNlQmFzZShzdHIsIHN0YXJ0LCBlbmQsIG11bCkge1xuICB2YXIgciA9IDA7XG4gIHZhciBsZW4gPSBNYXRoLm1pbihzdHIubGVuZ3RoLCBlbmQpO1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBsZW47IGkrKykge1xuICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSkgLSA0ODtcblxuICAgIHIgKj0gbXVsO1xuXG4gICAgLy8gJ2EnXG4gICAgaWYgKGMgPj0gNDkpXG4gICAgICByICs9IGMgLSA0OSArIDB4YTtcblxuICAgIC8vICdBJ1xuICAgIGVsc2UgaWYgKGMgPj0gMTcpXG4gICAgICByICs9IGMgLSAxNyArIDB4YTtcblxuICAgIC8vICcwJyAtICc5J1xuICAgIGVsc2VcbiAgICAgIHIgKz0gYztcbiAgfVxuICByZXR1cm4gcjtcbn1cblxuQk4ucHJvdG90eXBlLl9wYXJzZUJhc2UgPSBmdW5jdGlvbiBfcGFyc2VCYXNlKG51bWJlciwgYmFzZSwgc3RhcnQpIHtcbiAgLy8gSW5pdGlhbGl6ZSBhcyB6ZXJvXG4gIHRoaXMud29yZHMgPSBbIDAgXTtcbiAgdGhpcy5sZW5ndGggPSAxO1xuXG4gIC8vIEZpbmQgbGVuZ3RoIG9mIGxpbWIgaW4gYmFzZVxuICBmb3IgKHZhciBsaW1iTGVuID0gMCwgbGltYlBvdyA9IDE7IGxpbWJQb3cgPD0gMHgzZmZmZmZmOyBsaW1iUG93ICo9IGJhc2UpXG4gICAgbGltYkxlbisrO1xuICBsaW1iTGVuLS07XG4gIGxpbWJQb3cgPSAobGltYlBvdyAvIGJhc2UpIHwgMDtcblxuICB2YXIgdG90YWwgPSBudW1iZXIubGVuZ3RoIC0gc3RhcnQ7XG4gIHZhciBtb2QgPSB0b3RhbCAlIGxpbWJMZW47XG4gIHZhciBlbmQgPSBNYXRoLm1pbih0b3RhbCwgdG90YWwgLSBtb2QpICsgc3RhcnQ7XG5cbiAgdmFyIHdvcmQgPSAwO1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkgKz0gbGltYkxlbikge1xuICAgIHdvcmQgPSBwYXJzZUJhc2UobnVtYmVyLCBpLCBpICsgbGltYkxlbiwgYmFzZSk7XG5cbiAgICB0aGlzLmltdWxuKGxpbWJQb3cpO1xuICAgIGlmICh0aGlzLndvcmRzWzBdICsgd29yZCA8IDB4NDAwMDAwMClcbiAgICAgIHRoaXMud29yZHNbMF0gKz0gd29yZDtcbiAgICBlbHNlXG4gICAgICB0aGlzLl9pYWRkbih3b3JkKTtcbiAgfVxuXG4gIGlmIChtb2QgIT09IDApIHtcbiAgICB2YXIgcG93ID0gMTtcbiAgICB2YXIgd29yZCA9IHBhcnNlQmFzZShudW1iZXIsIGksIG51bWJlci5sZW5ndGgsIGJhc2UpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb2Q7IGkrKylcbiAgICAgIHBvdyAqPSBiYXNlO1xuICAgIHRoaXMuaW11bG4ocG93KTtcbiAgICBpZiAodGhpcy53b3Jkc1swXSArIHdvcmQgPCAweDQwMDAwMDApXG4gICAgICB0aGlzLndvcmRzWzBdICs9IHdvcmQ7XG4gICAgZWxzZVxuICAgICAgdGhpcy5faWFkZG4od29yZCk7XG4gIH1cbn07XG5cbkJOLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gY29weShkZXN0KSB7XG4gIGRlc3Qud29yZHMgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspXG4gICAgZGVzdC53b3Jkc1tpXSA9IHRoaXMud29yZHNbaV07XG4gIGRlc3QubGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gIGRlc3Quc2lnbiA9IHRoaXMuc2lnbjtcbiAgZGVzdC5yZWQgPSB0aGlzLnJlZDtcbn07XG5cbkJOLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uIGNsb25lKCkge1xuICB2YXIgciA9IG5ldyBCTihudWxsKTtcbiAgdGhpcy5jb3B5KHIpO1xuICByZXR1cm4gcjtcbn07XG5cbi8vIFJlbW92ZSBsZWFkaW5nIGAwYCBmcm9tIGB0aGlzYFxuQk4ucHJvdG90eXBlLnN0cmlwID0gZnVuY3Rpb24gc3RyaXAoKSB7XG4gIHdoaWxlICh0aGlzLmxlbmd0aCA+IDEgJiYgdGhpcy53b3Jkc1t0aGlzLmxlbmd0aCAtIDFdID09PSAwKVxuICAgIHRoaXMubGVuZ3RoLS07XG4gIHJldHVybiB0aGlzLl9ub3JtU2lnbigpO1xufTtcblxuQk4ucHJvdG90eXBlLl9ub3JtU2lnbiA9IGZ1bmN0aW9uIF9ub3JtU2lnbigpIHtcbiAgLy8gLTAgPSAwXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMSAmJiB0aGlzLndvcmRzWzBdID09PSAwKVxuICAgIHRoaXMuc2lnbiA9IGZhbHNlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkJOLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgcmV0dXJuICh0aGlzLnJlZCA/ICc8Qk4tUjogJyA6ICc8Qk46ICcpICsgdGhpcy50b1N0cmluZygxNikgKyAnPic7XG59O1xuXG4vKlxuXG52YXIgemVyb3MgPSBbXTtcbnZhciBncm91cFNpemVzID0gW107XG52YXIgZ3JvdXBCYXNlcyA9IFtdO1xuXG52YXIgcyA9ICcnO1xudmFyIGkgPSAtMTtcbndoaWxlICgrK2kgPCBCTi53b3JkU2l6ZSkge1xuICB6ZXJvc1tpXSA9IHM7XG4gIHMgKz0gJzAnO1xufVxuZ3JvdXBTaXplc1swXSA9IDA7XG5ncm91cFNpemVzWzFdID0gMDtcbmdyb3VwQmFzZXNbMF0gPSAwO1xuZ3JvdXBCYXNlc1sxXSA9IDA7XG52YXIgYmFzZSA9IDIgLSAxO1xud2hpbGUgKCsrYmFzZSA8IDM2ICsgMSkge1xuICB2YXIgZ3JvdXBTaXplID0gMDtcbiAgdmFyIGdyb3VwQmFzZSA9IDE7XG4gIHdoaWxlIChncm91cEJhc2UgPCAoMSA8PCBCTi53b3JkU2l6ZSkgLyBiYXNlKSB7XG4gICAgZ3JvdXBCYXNlICo9IGJhc2U7XG4gICAgZ3JvdXBTaXplICs9IDE7XG4gIH1cbiAgZ3JvdXBTaXplc1tiYXNlXSA9IGdyb3VwU2l6ZTtcbiAgZ3JvdXBCYXNlc1tiYXNlXSA9IGdyb3VwQmFzZTtcbn1cblxuKi9cblxudmFyIHplcm9zID0gW1xuICAnJyxcbiAgJzAnLFxuICAnMDAnLFxuICAnMDAwJyxcbiAgJzAwMDAnLFxuICAnMDAwMDAnLFxuICAnMDAwMDAwJyxcbiAgJzAwMDAwMDAnLFxuICAnMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMDAwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMDAwMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAwMDAwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAnXG5dO1xuXG52YXIgZ3JvdXBTaXplcyA9IFtcbiAgMCwgMCxcbiAgMjUsIDE2LCAxMiwgMTEsIDEwLCA5LCA4LFxuICA4LCA3LCA3LCA3LCA3LCA2LCA2LFxuICA2LCA2LCA2LCA2LCA2LCA1LCA1LFxuICA1LCA1LCA1LCA1LCA1LCA1LCA1LFxuICA1LCA1LCA1LCA1LCA1LCA1LCA1XG5dO1xuXG52YXIgZ3JvdXBCYXNlcyA9IFtcbiAgMCwgMCxcbiAgMzM1NTQ0MzIsIDQzMDQ2NzIxLCAxNjc3NzIxNiwgNDg4MjgxMjUsIDYwNDY2MTc2LCA0MDM1MzYwNywgMTY3NzcyMTYsXG4gIDQzMDQ2NzIxLCAxMDAwMDAwMCwgMTk0ODcxNzEsIDM1ODMxODA4LCA2Mjc0ODUxNywgNzUyOTUzNiwgMTEzOTA2MjUsXG4gIDE2Nzc3MjE2LCAyNDEzNzU2OSwgMzQwMTIyMjQsIDQ3MDQ1ODgxLCA2NDAwMDAwMCwgNDA4NDEwMSwgNTE1MzYzMixcbiAgNjQzNjM0MywgNzk2MjYyNCwgOTc2NTYyNSwgMTE4ODEzNzYsIDE0MzQ4OTA3LCAxNzIxMDM2OCwgMjA1MTExNDksXG4gIDI0MzAwMDAwLCAyODYyOTE1MSwgMzM1NTQ0MzIsIDM5MTM1MzkzLCA0NTQzNTQyNCwgNTI1MjE4NzUsIDYwNDY2MTc2XG5dO1xuXG5CTi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyhiYXNlLCBwYWRkaW5nKSB7XG4gIGJhc2UgPSBiYXNlIHx8IDEwO1xuICBpZiAoYmFzZSA9PT0gMTYgfHwgYmFzZSA9PT0gJ2hleCcpIHtcbiAgICB2YXIgb3V0ID0gJyc7XG4gICAgdmFyIG9mZiA9IDA7XG4gICAgdmFyIHBhZGRpbmcgPSBwYWRkaW5nIHwgMCB8fCAxO1xuICAgIHZhciBjYXJyeSA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdyA9IHRoaXMud29yZHNbaV07XG4gICAgICB2YXIgd29yZCA9ICgoKHcgPDwgb2ZmKSB8IGNhcnJ5KSAmIDB4ZmZmZmZmKS50b1N0cmluZygxNik7XG4gICAgICBjYXJyeSA9ICh3ID4+PiAoMjQgLSBvZmYpKSAmIDB4ZmZmZmZmO1xuICAgICAgaWYgKGNhcnJ5ICE9PSAwIHx8IGkgIT09IHRoaXMubGVuZ3RoIC0gMSlcbiAgICAgICAgb3V0ID0gemVyb3NbNiAtIHdvcmQubGVuZ3RoXSArIHdvcmQgKyBvdXQ7XG4gICAgICBlbHNlXG4gICAgICAgIG91dCA9IHdvcmQgKyBvdXQ7XG4gICAgICBvZmYgKz0gMjtcbiAgICAgIGlmIChvZmYgPj0gMjYpIHtcbiAgICAgICAgb2ZmIC09IDI2O1xuICAgICAgICBpLS07XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChjYXJyeSAhPT0gMClcbiAgICAgIG91dCA9IGNhcnJ5LnRvU3RyaW5nKDE2KSArIG91dDtcbiAgICB3aGlsZSAob3V0Lmxlbmd0aCAlIHBhZGRpbmcgIT09IDApXG4gICAgICBvdXQgPSAnMCcgKyBvdXQ7XG4gICAgaWYgKHRoaXMuc2lnbilcbiAgICAgIG91dCA9ICctJyArIG91dDtcbiAgICByZXR1cm4gb3V0O1xuICB9IGVsc2UgaWYgKGJhc2UgPT09IChiYXNlIHwgMCkgJiYgYmFzZSA+PSAyICYmIGJhc2UgPD0gMzYpIHtcbiAgICAvLyB2YXIgZ3JvdXBTaXplID0gTWF0aC5mbG9vcihCTi53b3JkU2l6ZSAqIE1hdGguTE4yIC8gTWF0aC5sb2coYmFzZSkpO1xuICAgIHZhciBncm91cFNpemUgPSBncm91cFNpemVzW2Jhc2VdO1xuICAgIC8vIHZhciBncm91cEJhc2UgPSBNYXRoLnBvdyhiYXNlLCBncm91cFNpemUpO1xuICAgIHZhciBncm91cEJhc2UgPSBncm91cEJhc2VzW2Jhc2VdO1xuICAgIHZhciBvdXQgPSAnJztcbiAgICB2YXIgYyA9IHRoaXMuY2xvbmUoKTtcbiAgICBjLnNpZ24gPSBmYWxzZTtcbiAgICB3aGlsZSAoYy5jbXBuKDApICE9PSAwKSB7XG4gICAgICB2YXIgciA9IGMubW9kbihncm91cEJhc2UpLnRvU3RyaW5nKGJhc2UpO1xuICAgICAgYyA9IGMuaWRpdm4oZ3JvdXBCYXNlKTtcblxuICAgICAgaWYgKGMuY21wbigwKSAhPT0gMClcbiAgICAgICAgb3V0ID0gemVyb3NbZ3JvdXBTaXplIC0gci5sZW5ndGhdICsgciArIG91dDtcbiAgICAgIGVsc2VcbiAgICAgICAgb3V0ID0gciArIG91dDtcbiAgICB9XG4gICAgaWYgKHRoaXMuY21wbigwKSA9PT0gMClcbiAgICAgIG91dCA9ICcwJyArIG91dDtcbiAgICBpZiAodGhpcy5zaWduKVxuICAgICAgb3V0ID0gJy0nICsgb3V0O1xuICAgIHJldHVybiBvdXQ7XG4gIH0gZWxzZSB7XG4gICAgYXNzZXJ0KGZhbHNlLCAnQmFzZSBzaG91bGQgYmUgYmV0d2VlbiAyIGFuZCAzNicpO1xuICB9XG59O1xuXG5CTi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICByZXR1cm4gdGhpcy50b1N0cmluZygxNik7XG59O1xuXG5CTi5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uIHRvQXJyYXkoZW5kaWFuKSB7XG4gIHRoaXMuc3RyaXAoKTtcbiAgdmFyIHJlcyA9IG5ldyBBcnJheSh0aGlzLmJ5dGVMZW5ndGgoKSk7XG4gIHJlc1swXSA9IDA7XG5cbiAgdmFyIHEgPSB0aGlzLmNsb25lKCk7XG4gIGlmIChlbmRpYW4gIT09ICdsZScpIHtcbiAgICAvLyBBc3N1bWUgYmlnLWVuZGlhblxuICAgIGZvciAodmFyIGkgPSAwOyBxLmNtcG4oMCkgIT09IDA7IGkrKykge1xuICAgICAgdmFyIGIgPSBxLmFuZGxuKDB4ZmYpO1xuICAgICAgcS5pc2hybig4KTtcblxuICAgICAgcmVzW3Jlcy5sZW5ndGggLSBpIC0gMV0gPSBiO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBBc3N1bWUgbGl0dGxlLWVuZGlhblxuICAgIGZvciAodmFyIGkgPSAwOyBxLmNtcG4oMCkgIT09IDA7IGkrKykge1xuICAgICAgdmFyIGIgPSBxLmFuZGxuKDB4ZmYpO1xuICAgICAgcS5pc2hybig4KTtcblxuICAgICAgcmVzW2ldID0gYjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzO1xufTtcblxuaWYgKE1hdGguY2x6MzIpIHtcbiAgQk4ucHJvdG90eXBlLl9jb3VudEJpdHMgPSBmdW5jdGlvbiBfY291bnRCaXRzKHcpIHtcbiAgICByZXR1cm4gMzIgLSBNYXRoLmNsejMyKHcpO1xuICB9O1xufSBlbHNlIHtcbiAgQk4ucHJvdG90eXBlLl9jb3VudEJpdHMgPSBmdW5jdGlvbiBfY291bnRCaXRzKHcpIHtcbiAgICB2YXIgdCA9IHc7XG4gICAgdmFyIHIgPSAwO1xuICAgIGlmICh0ID49IDB4MTAwMCkge1xuICAgICAgciArPSAxMztcbiAgICAgIHQgPj4+PSAxMztcbiAgICB9XG4gICAgaWYgKHQgPj0gMHg0MCkge1xuICAgICAgciArPSA3O1xuICAgICAgdCA+Pj49IDc7XG4gICAgfVxuICAgIGlmICh0ID49IDB4OCkge1xuICAgICAgciArPSA0O1xuICAgICAgdCA+Pj49IDQ7XG4gICAgfVxuICAgIGlmICh0ID49IDB4MDIpIHtcbiAgICAgIHIgKz0gMjtcbiAgICAgIHQgPj4+PSAyO1xuICAgIH1cbiAgICByZXR1cm4gciArIHQ7XG4gIH07XG59XG5cbkJOLnByb3RvdHlwZS5femVyb0JpdHMgPSBmdW5jdGlvbiBfemVyb0JpdHModykge1xuICAvLyBTaG9ydC1jdXRcbiAgaWYgKHcgPT09IDApXG4gICAgcmV0dXJuIDI2O1xuXG4gIHZhciB0ID0gdztcbiAgdmFyIHIgPSAwO1xuICBpZiAoKHQgJiAweDFmZmYpID09PSAwKSB7XG4gICAgciArPSAxMztcbiAgICB0ID4+Pj0gMTM7XG4gIH1cbiAgaWYgKCh0ICYgMHg3ZikgPT09IDApIHtcbiAgICByICs9IDc7XG4gICAgdCA+Pj49IDc7XG4gIH1cbiAgaWYgKCh0ICYgMHhmKSA9PT0gMCkge1xuICAgIHIgKz0gNDtcbiAgICB0ID4+Pj0gNDtcbiAgfVxuICBpZiAoKHQgJiAweDMpID09PSAwKSB7XG4gICAgciArPSAyO1xuICAgIHQgPj4+PSAyO1xuICB9XG4gIGlmICgodCAmIDB4MSkgPT09IDApXG4gICAgcisrO1xuICByZXR1cm4gcjtcbn07XG5cbi8vIFJldHVybiBudW1iZXIgb2YgdXNlZCBiaXRzIGluIGEgQk5cbkJOLnByb3RvdHlwZS5iaXRMZW5ndGggPSBmdW5jdGlvbiBiaXRMZW5ndGgoKSB7XG4gIHZhciBoaSA9IDA7XG4gIHZhciB3ID0gdGhpcy53b3Jkc1t0aGlzLmxlbmd0aCAtIDFdO1xuICB2YXIgaGkgPSB0aGlzLl9jb3VudEJpdHModyk7XG4gIHJldHVybiAodGhpcy5sZW5ndGggLSAxKSAqIDI2ICsgaGk7XG59O1xuXG4vLyBOdW1iZXIgb2YgdHJhaWxpbmcgemVybyBiaXRzXG5CTi5wcm90b3R5cGUuemVyb0JpdHMgPSBmdW5jdGlvbiB6ZXJvQml0cygpIHtcbiAgaWYgKHRoaXMuY21wbigwKSA9PT0gMClcbiAgICByZXR1cm4gMDtcblxuICB2YXIgciA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gdGhpcy5femVyb0JpdHModGhpcy53b3Jkc1tpXSk7XG4gICAgciArPSBiO1xuICAgIGlmIChiICE9PSAyNilcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiByO1xufTtcblxuQk4ucHJvdG90eXBlLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiBieXRlTGVuZ3RoKCkge1xuICByZXR1cm4gTWF0aC5jZWlsKHRoaXMuYml0TGVuZ3RoKCkgLyA4KTtcbn07XG5cbi8vIFJldHVybiBuZWdhdGl2ZSBjbG9uZSBvZiBgdGhpc2BcbkJOLnByb3RvdHlwZS5uZWcgPSBmdW5jdGlvbiBuZWcoKSB7XG4gIGlmICh0aGlzLmNtcG4oMCkgPT09IDApXG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcblxuICB2YXIgciA9IHRoaXMuY2xvbmUoKTtcbiAgci5zaWduID0gIXRoaXMuc2lnbjtcbiAgcmV0dXJuIHI7XG59O1xuXG5cbi8vIE9yIGBudW1gIHdpdGggYHRoaXNgIGluLXBsYWNlXG5CTi5wcm90b3R5cGUuaW9yID0gZnVuY3Rpb24gaW9yKG51bSkge1xuICB0aGlzLnNpZ24gPSB0aGlzLnNpZ24gfHwgbnVtLnNpZ247XG5cbiAgd2hpbGUgKHRoaXMubGVuZ3RoIDwgbnVtLmxlbmd0aClcbiAgICB0aGlzLndvcmRzW3RoaXMubGVuZ3RoKytdID0gMDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bS5sZW5ndGg7IGkrKylcbiAgICB0aGlzLndvcmRzW2ldID0gdGhpcy53b3Jkc1tpXSB8IG51bS53b3Jkc1tpXTtcblxuICByZXR1cm4gdGhpcy5zdHJpcCgpO1xufTtcblxuXG4vLyBPciBgbnVtYCB3aXRoIGB0aGlzYFxuQk4ucHJvdG90eXBlLm9yID0gZnVuY3Rpb24gb3IobnVtKSB7XG4gIGlmICh0aGlzLmxlbmd0aCA+IG51bS5sZW5ndGgpXG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pb3IobnVtKTtcbiAgZWxzZVxuICAgIHJldHVybiBudW0uY2xvbmUoKS5pb3IodGhpcyk7XG59O1xuXG5cbi8vIEFuZCBgbnVtYCB3aXRoIGB0aGlzYCBpbi1wbGFjZVxuQk4ucHJvdG90eXBlLmlhbmQgPSBmdW5jdGlvbiBpYW5kKG51bSkge1xuICB0aGlzLnNpZ24gPSB0aGlzLnNpZ24gJiYgbnVtLnNpZ247XG5cbiAgLy8gYiA9IG1pbi1sZW5ndGgobnVtLCB0aGlzKVxuICB2YXIgYjtcbiAgaWYgKHRoaXMubGVuZ3RoID4gbnVtLmxlbmd0aClcbiAgICBiID0gbnVtO1xuICBlbHNlXG4gICAgYiA9IHRoaXM7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBiLmxlbmd0aDsgaSsrKVxuICAgIHRoaXMud29yZHNbaV0gPSB0aGlzLndvcmRzW2ldICYgbnVtLndvcmRzW2ldO1xuXG4gIHRoaXMubGVuZ3RoID0gYi5sZW5ndGg7XG5cbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcbn07XG5cblxuLy8gQW5kIGBudW1gIHdpdGggYHRoaXNgXG5CTi5wcm90b3R5cGUuYW5kID0gZnVuY3Rpb24gYW5kKG51bSkge1xuICBpZiAodGhpcy5sZW5ndGggPiBudW0ubGVuZ3RoKVxuICAgIHJldHVybiB0aGlzLmNsb25lKCkuaWFuZChudW0pO1xuICBlbHNlXG4gICAgcmV0dXJuIG51bS5jbG9uZSgpLmlhbmQodGhpcyk7XG59O1xuXG5cbi8vIFhvciBgbnVtYCB3aXRoIGB0aGlzYCBpbi1wbGFjZVxuQk4ucHJvdG90eXBlLml4b3IgPSBmdW5jdGlvbiBpeG9yKG51bSkge1xuICB0aGlzLnNpZ24gPSB0aGlzLnNpZ24gfHwgbnVtLnNpZ247XG5cbiAgLy8gYS5sZW5ndGggPiBiLmxlbmd0aFxuICB2YXIgYTtcbiAgdmFyIGI7XG4gIGlmICh0aGlzLmxlbmd0aCA+IG51bS5sZW5ndGgpIHtcbiAgICBhID0gdGhpcztcbiAgICBiID0gbnVtO1xuICB9IGVsc2Uge1xuICAgIGEgPSBudW07XG4gICAgYiA9IHRoaXM7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspXG4gICAgdGhpcy53b3Jkc1tpXSA9IGEud29yZHNbaV0gXiBiLndvcmRzW2ldO1xuXG4gIGlmICh0aGlzICE9PSBhKVxuICAgIGZvciAoOyBpIDwgYS5sZW5ndGg7IGkrKylcbiAgICAgIHRoaXMud29yZHNbaV0gPSBhLndvcmRzW2ldO1xuXG4gIHRoaXMubGVuZ3RoID0gYS5sZW5ndGg7XG5cbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcbn07XG5cblxuLy8gWG9yIGBudW1gIHdpdGggYHRoaXNgXG5CTi5wcm90b3R5cGUueG9yID0gZnVuY3Rpb24geG9yKG51bSkge1xuICBpZiAodGhpcy5sZW5ndGggPiBudW0ubGVuZ3RoKVxuICAgIHJldHVybiB0aGlzLmNsb25lKCkuaXhvcihudW0pO1xuICBlbHNlXG4gICAgcmV0dXJuIG51bS5jbG9uZSgpLml4b3IodGhpcyk7XG59O1xuXG5cbi8vIFNldCBgYml0YCBvZiBgdGhpc2BcbkJOLnByb3RvdHlwZS5zZXRuID0gZnVuY3Rpb24gc2V0bihiaXQsIHZhbCkge1xuICBhc3NlcnQodHlwZW9mIGJpdCA9PT0gJ251bWJlcicgJiYgYml0ID49IDApO1xuXG4gIHZhciBvZmYgPSAoYml0IC8gMjYpIHwgMDtcbiAgdmFyIHdiaXQgPSBiaXQgJSAyNjtcblxuICB3aGlsZSAodGhpcy5sZW5ndGggPD0gb2ZmKVxuICAgIHRoaXMud29yZHNbdGhpcy5sZW5ndGgrK10gPSAwO1xuXG4gIGlmICh2YWwpXG4gICAgdGhpcy53b3Jkc1tvZmZdID0gdGhpcy53b3Jkc1tvZmZdIHwgKDEgPDwgd2JpdCk7XG4gIGVsc2VcbiAgICB0aGlzLndvcmRzW29mZl0gPSB0aGlzLndvcmRzW29mZl0gJiB+KDEgPDwgd2JpdCk7XG5cbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcbn07XG5cblxuLy8gQWRkIGBudW1gIHRvIGB0aGlzYCBpbi1wbGFjZVxuQk4ucHJvdG90eXBlLmlhZGQgPSBmdW5jdGlvbiBpYWRkKG51bSkge1xuICAvLyBuZWdhdGl2ZSArIHBvc2l0aXZlXG4gIGlmICh0aGlzLnNpZ24gJiYgIW51bS5zaWduKSB7XG4gICAgdGhpcy5zaWduID0gZmFsc2U7XG4gICAgdmFyIHIgPSB0aGlzLmlzdWIobnVtKTtcbiAgICB0aGlzLnNpZ24gPSAhdGhpcy5zaWduO1xuICAgIHJldHVybiB0aGlzLl9ub3JtU2lnbigpO1xuXG4gIC8vIHBvc2l0aXZlICsgbmVnYXRpdmVcbiAgfSBlbHNlIGlmICghdGhpcy5zaWduICYmIG51bS5zaWduKSB7XG4gICAgbnVtLnNpZ24gPSBmYWxzZTtcbiAgICB2YXIgciA9IHRoaXMuaXN1YihudW0pO1xuICAgIG51bS5zaWduID0gdHJ1ZTtcbiAgICByZXR1cm4gci5fbm9ybVNpZ24oKTtcbiAgfVxuXG4gIC8vIGEubGVuZ3RoID4gYi5sZW5ndGhcbiAgdmFyIGE7XG4gIHZhciBiO1xuICBpZiAodGhpcy5sZW5ndGggPiBudW0ubGVuZ3RoKSB7XG4gICAgYSA9IHRoaXM7XG4gICAgYiA9IG51bTtcbiAgfSBlbHNlIHtcbiAgICBhID0gbnVtO1xuICAgIGIgPSB0aGlzO1xuICB9XG5cbiAgdmFyIGNhcnJ5ID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBiLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHIgPSBhLndvcmRzW2ldICsgYi53b3Jkc1tpXSArIGNhcnJ5O1xuICAgIHRoaXMud29yZHNbaV0gPSByICYgMHgzZmZmZmZmO1xuICAgIGNhcnJ5ID0gciA+Pj4gMjY7XG4gIH1cbiAgZm9yICg7IGNhcnJ5ICE9PSAwICYmIGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHIgPSBhLndvcmRzW2ldICsgY2Fycnk7XG4gICAgdGhpcy53b3Jkc1tpXSA9IHIgJiAweDNmZmZmZmY7XG4gICAgY2FycnkgPSByID4+PiAyNjtcbiAgfVxuXG4gIHRoaXMubGVuZ3RoID0gYS5sZW5ndGg7XG4gIGlmIChjYXJyeSAhPT0gMCkge1xuICAgIHRoaXMud29yZHNbdGhpcy5sZW5ndGhdID0gY2Fycnk7XG4gICAgdGhpcy5sZW5ndGgrKztcbiAgLy8gQ29weSB0aGUgcmVzdCBvZiB0aGUgd29yZHNcbiAgfSBlbHNlIGlmIChhICE9PSB0aGlzKSB7XG4gICAgZm9yICg7IGkgPCBhLmxlbmd0aDsgaSsrKVxuICAgICAgdGhpcy53b3Jkc1tpXSA9IGEud29yZHNbaV07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIEFkZCBgbnVtYCB0byBgdGhpc2BcbkJOLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBhZGQobnVtKSB7XG4gIGlmIChudW0uc2lnbiAmJiAhdGhpcy5zaWduKSB7XG4gICAgbnVtLnNpZ24gPSBmYWxzZTtcbiAgICB2YXIgcmVzID0gdGhpcy5zdWIobnVtKTtcbiAgICBudW0uc2lnbiA9IHRydWU7XG4gICAgcmV0dXJuIHJlcztcbiAgfSBlbHNlIGlmICghbnVtLnNpZ24gJiYgdGhpcy5zaWduKSB7XG4gICAgdGhpcy5zaWduID0gZmFsc2U7XG4gICAgdmFyIHJlcyA9IG51bS5zdWIodGhpcyk7XG4gICAgdGhpcy5zaWduID0gdHJ1ZTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgaWYgKHRoaXMubGVuZ3RoID4gbnVtLmxlbmd0aClcbiAgICByZXR1cm4gdGhpcy5jbG9uZSgpLmlhZGQobnVtKTtcbiAgZWxzZVxuICAgIHJldHVybiBudW0uY2xvbmUoKS5pYWRkKHRoaXMpO1xufTtcblxuLy8gU3VidHJhY3QgYG51bWAgZnJvbSBgdGhpc2AgaW4tcGxhY2VcbkJOLnByb3RvdHlwZS5pc3ViID0gZnVuY3Rpb24gaXN1YihudW0pIHtcbiAgLy8gdGhpcyAtICgtbnVtKSA9IHRoaXMgKyBudW1cbiAgaWYgKG51bS5zaWduKSB7XG4gICAgbnVtLnNpZ24gPSBmYWxzZTtcbiAgICB2YXIgciA9IHRoaXMuaWFkZChudW0pO1xuICAgIG51bS5zaWduID0gdHJ1ZTtcbiAgICByZXR1cm4gci5fbm9ybVNpZ24oKTtcblxuICAvLyAtdGhpcyAtIG51bSA9IC0odGhpcyArIG51bSlcbiAgfSBlbHNlIGlmICh0aGlzLnNpZ24pIHtcbiAgICB0aGlzLnNpZ24gPSBmYWxzZTtcbiAgICB0aGlzLmlhZGQobnVtKTtcbiAgICB0aGlzLnNpZ24gPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLl9ub3JtU2lnbigpO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCBib3RoIG51bWJlcnMgYXJlIHBvc2l0aXZlXG4gIHZhciBjbXAgPSB0aGlzLmNtcChudW0pO1xuXG4gIC8vIE9wdGltaXphdGlvbiAtIHplcm9pZnlcbiAgaWYgKGNtcCA9PT0gMCkge1xuICAgIHRoaXMuc2lnbiA9IGZhbHNlO1xuICAgIHRoaXMubGVuZ3RoID0gMTtcbiAgICB0aGlzLndvcmRzWzBdID0gMDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGEgPiBiXG4gIHZhciBhO1xuICB2YXIgYjtcbiAgaWYgKGNtcCA+IDApIHtcbiAgICBhID0gdGhpcztcbiAgICBiID0gbnVtO1xuICB9IGVsc2Uge1xuICAgIGEgPSBudW07XG4gICAgYiA9IHRoaXM7XG4gIH1cblxuICB2YXIgY2FycnkgPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgciA9IGEud29yZHNbaV0gLSBiLndvcmRzW2ldICsgY2Fycnk7XG4gICAgY2FycnkgPSByID4+IDI2O1xuICAgIHRoaXMud29yZHNbaV0gPSByICYgMHgzZmZmZmZmO1xuICB9XG4gIGZvciAoOyBjYXJyeSAhPT0gMCAmJiBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgIHZhciByID0gYS53b3Jkc1tpXSArIGNhcnJ5O1xuICAgIGNhcnJ5ID0gciA+PiAyNjtcbiAgICB0aGlzLndvcmRzW2ldID0gciAmIDB4M2ZmZmZmZjtcbiAgfVxuXG4gIC8vIENvcHkgcmVzdCBvZiB0aGUgd29yZHNcbiAgaWYgKGNhcnJ5ID09PSAwICYmIGkgPCBhLmxlbmd0aCAmJiBhICE9PSB0aGlzKVxuICAgIGZvciAoOyBpIDwgYS5sZW5ndGg7IGkrKylcbiAgICAgIHRoaXMud29yZHNbaV0gPSBhLndvcmRzW2ldO1xuICB0aGlzLmxlbmd0aCA9IE1hdGgubWF4KHRoaXMubGVuZ3RoLCBpKTtcblxuICBpZiAoYSAhPT0gdGhpcylcbiAgICB0aGlzLnNpZ24gPSB0cnVlO1xuXG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XG59O1xuXG4vLyBTdWJ0cmFjdCBgbnVtYCBmcm9tIGB0aGlzYFxuQk4ucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uIHN1YihudW0pIHtcbiAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pc3ViKG51bSk7XG59O1xuXG4vKlxuLy8gTk9URTogVGhpcyBjb3VsZCBiZSBwb3RlbnRpb25hbGx5IHVzZWQgdG8gZ2VuZXJhdGUgbG9vcC1sZXNzIG11bHRpcGxpY2F0aW9uc1xuZnVuY3Rpb24gX2dlbkNvbWJNdWxUbyhhbGVuLCBibGVuKSB7XG4gIHZhciBsZW4gPSBhbGVuICsgYmxlbiAtIDE7XG4gIHZhciBzcmMgPSBbXG4gICAgJ3ZhciBhID0gdGhpcy53b3JkcywgYiA9IG51bS53b3JkcywgbyA9IG91dC53b3JkcywgYyA9IDAsIHcsICcgK1xuICAgICAgICAnbWFzayA9IDB4M2ZmZmZmZiwgc2hpZnQgPSAweDQwMDAwMDA7JyxcbiAgICAnb3V0Lmxlbmd0aCA9ICcgKyBsZW4gKyAnOydcbiAgXTtcbiAgZm9yICh2YXIgayA9IDA7IGsgPCBsZW47IGsrKykge1xuICAgIHZhciBtaW5KID0gTWF0aC5tYXgoMCwgayAtIGFsZW4gKyAxKTtcbiAgICB2YXIgbWF4SiA9IE1hdGgubWluKGssIGJsZW4gLSAxKTtcblxuICAgIGZvciAodmFyIGogPSBtaW5KOyBqIDw9IG1heEo7IGorKykge1xuICAgICAgdmFyIGkgPSBrIC0gajtcbiAgICAgIHZhciBtdWwgPSAnYVsnICsgaSArICddICogYlsnICsgaiArICddJztcblxuICAgICAgaWYgKGogPT09IG1pbkopIHtcbiAgICAgICAgc3JjLnB1c2goJ3cgPSAnICsgbXVsICsgJyArIGM7Jyk7XG4gICAgICAgIHNyYy5wdXNoKCdjID0gKHcgLyBzaGlmdCkgfCAwOycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3JjLnB1c2goJ3cgKz0gJyArIG11bCArICc7Jyk7XG4gICAgICAgIHNyYy5wdXNoKCdjICs9ICh3IC8gc2hpZnQpIHwgMDsnKTtcbiAgICAgIH1cbiAgICAgIHNyYy5wdXNoKCd3ICY9IG1hc2s7Jyk7XG4gICAgfVxuICAgIHNyYy5wdXNoKCdvWycgKyBrICsgJ10gPSB3OycpO1xuICB9XG4gIHNyYy5wdXNoKCdpZiAoYyAhPT0gMCkgeycsXG4gICAgICAgICAgICcgIG9bJyArIGsgKyAnXSA9IGM7JyxcbiAgICAgICAgICAgJyAgb3V0Lmxlbmd0aCsrOycsXG4gICAgICAgICAgICd9JyxcbiAgICAgICAgICAgJ3JldHVybiBvdXQ7Jyk7XG5cbiAgcmV0dXJuIHNyYy5qb2luKCdcXG4nKTtcbn1cbiovXG5cbkJOLnByb3RvdHlwZS5fc21hbGxNdWxUbyA9IGZ1bmN0aW9uIF9zbWFsbE11bFRvKG51bSwgb3V0KSB7XG4gIG91dC5zaWduID0gbnVtLnNpZ24gIT09IHRoaXMuc2lnbjtcbiAgb3V0Lmxlbmd0aCA9IHRoaXMubGVuZ3RoICsgbnVtLmxlbmd0aDtcblxuICB2YXIgY2FycnkgPSAwO1xuICBmb3IgKHZhciBrID0gMDsgayA8IG91dC5sZW5ndGggLSAxOyBrKyspIHtcbiAgICAvLyBTdW0gYWxsIHdvcmRzIHdpdGggdGhlIHNhbWUgYGkgKyBqID0ga2AgYW5kIGFjY3VtdWxhdGUgYG5jYXJyeWAsXG4gICAgLy8gbm90ZSB0aGF0IG5jYXJyeSBjb3VsZCBiZSA+PSAweDNmZmZmZmZcbiAgICB2YXIgbmNhcnJ5ID0gY2FycnkgPj4+IDI2O1xuICAgIHZhciByd29yZCA9IGNhcnJ5ICYgMHgzZmZmZmZmO1xuICAgIHZhciBtYXhKID0gTWF0aC5taW4oaywgbnVtLmxlbmd0aCAtIDEpO1xuICAgIGZvciAodmFyIGogPSBNYXRoLm1heCgwLCBrIC0gdGhpcy5sZW5ndGggKyAxKTsgaiA8PSBtYXhKOyBqKyspIHtcbiAgICAgIHZhciBpID0gayAtIGo7XG4gICAgICB2YXIgYSA9IHRoaXMud29yZHNbaV0gfCAwO1xuICAgICAgdmFyIGIgPSBudW0ud29yZHNbal0gfCAwO1xuICAgICAgdmFyIHIgPSBhICogYjtcblxuICAgICAgdmFyIGxvID0gciAmIDB4M2ZmZmZmZjtcbiAgICAgIG5jYXJyeSA9IChuY2FycnkgKyAoKHIgLyAweDQwMDAwMDApIHwgMCkpIHwgMDtcbiAgICAgIGxvID0gKGxvICsgcndvcmQpIHwgMDtcbiAgICAgIHJ3b3JkID0gbG8gJiAweDNmZmZmZmY7XG4gICAgICBuY2FycnkgPSAobmNhcnJ5ICsgKGxvID4+PiAyNikpIHwgMDtcbiAgICB9XG4gICAgb3V0LndvcmRzW2tdID0gcndvcmQ7XG4gICAgY2FycnkgPSBuY2Fycnk7XG4gIH1cbiAgaWYgKGNhcnJ5ICE9PSAwKSB7XG4gICAgb3V0LndvcmRzW2tdID0gY2Fycnk7XG4gIH0gZWxzZSB7XG4gICAgb3V0Lmxlbmd0aC0tO1xuICB9XG5cbiAgcmV0dXJuIG91dC5zdHJpcCgpO1xufTtcblxuQk4ucHJvdG90eXBlLl9iaWdNdWxUbyA9IGZ1bmN0aW9uIF9iaWdNdWxUbyhudW0sIG91dCkge1xuICBvdXQuc2lnbiA9IG51bS5zaWduICE9PSB0aGlzLnNpZ247XG4gIG91dC5sZW5ndGggPSB0aGlzLmxlbmd0aCArIG51bS5sZW5ndGg7XG5cbiAgdmFyIGNhcnJ5ID0gMDtcbiAgdmFyIGhuY2FycnkgPSAwO1xuICBmb3IgKHZhciBrID0gMDsgayA8IG91dC5sZW5ndGggLSAxOyBrKyspIHtcbiAgICAvLyBTdW0gYWxsIHdvcmRzIHdpdGggdGhlIHNhbWUgYGkgKyBqID0ga2AgYW5kIGFjY3VtdWxhdGUgYG5jYXJyeWAsXG4gICAgLy8gbm90ZSB0aGF0IG5jYXJyeSBjb3VsZCBiZSA+PSAweDNmZmZmZmZcbiAgICB2YXIgbmNhcnJ5ID0gaG5jYXJyeTtcbiAgICBobmNhcnJ5ID0gMDtcbiAgICB2YXIgcndvcmQgPSBjYXJyeSAmIDB4M2ZmZmZmZjtcbiAgICB2YXIgbWF4SiA9IE1hdGgubWluKGssIG51bS5sZW5ndGggLSAxKTtcbiAgICBmb3IgKHZhciBqID0gTWF0aC5tYXgoMCwgayAtIHRoaXMubGVuZ3RoICsgMSk7IGogPD0gbWF4SjsgaisrKSB7XG4gICAgICB2YXIgaSA9IGsgLSBqO1xuICAgICAgdmFyIGEgPSB0aGlzLndvcmRzW2ldIHwgMDtcbiAgICAgIHZhciBiID0gbnVtLndvcmRzW2pdIHwgMDtcbiAgICAgIHZhciByID0gYSAqIGI7XG5cbiAgICAgIHZhciBsbyA9IHIgJiAweDNmZmZmZmY7XG4gICAgICBuY2FycnkgPSAobmNhcnJ5ICsgKChyIC8gMHg0MDAwMDAwKSB8IDApKSB8IDA7XG4gICAgICBsbyA9IChsbyArIHJ3b3JkKSB8IDA7XG4gICAgICByd29yZCA9IGxvICYgMHgzZmZmZmZmO1xuICAgICAgbmNhcnJ5ID0gKG5jYXJyeSArIChsbyA+Pj4gMjYpKSB8IDA7XG5cbiAgICAgIGhuY2FycnkgKz0gbmNhcnJ5ID4+PiAyNjtcbiAgICAgIG5jYXJyeSAmPSAweDNmZmZmZmY7XG4gICAgfVxuICAgIG91dC53b3Jkc1trXSA9IHJ3b3JkO1xuICAgIGNhcnJ5ID0gbmNhcnJ5O1xuICAgIG5jYXJyeSA9IGhuY2Fycnk7XG4gIH1cbiAgaWYgKGNhcnJ5ICE9PSAwKSB7XG4gICAgb3V0LndvcmRzW2tdID0gY2Fycnk7XG4gIH0gZWxzZSB7XG4gICAgb3V0Lmxlbmd0aC0tO1xuICB9XG5cbiAgcmV0dXJuIG91dC5zdHJpcCgpO1xufTtcblxuQk4ucHJvdG90eXBlLm11bFRvID0gZnVuY3Rpb24gbXVsVG8obnVtLCBvdXQpIHtcbiAgdmFyIHJlcztcbiAgaWYgKHRoaXMubGVuZ3RoICsgbnVtLmxlbmd0aCA8IDYzKVxuICAgIHJlcyA9IHRoaXMuX3NtYWxsTXVsVG8obnVtLCBvdXQpO1xuICBlbHNlXG4gICAgcmVzID0gdGhpcy5fYmlnTXVsVG8obnVtLCBvdXQpO1xuICByZXR1cm4gcmVzO1xufTtcblxuLy8gTXVsdGlwbHkgYHRoaXNgIGJ5IGBudW1gXG5CTi5wcm90b3R5cGUubXVsID0gZnVuY3Rpb24gbXVsKG51bSkge1xuICB2YXIgb3V0ID0gbmV3IEJOKG51bGwpO1xuICBvdXQud29yZHMgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGggKyBudW0ubGVuZ3RoKTtcbiAgcmV0dXJuIHRoaXMubXVsVG8obnVtLCBvdXQpO1xufTtcblxuLy8gSW4tcGxhY2UgTXVsdGlwbGljYXRpb25cbkJOLnByb3RvdHlwZS5pbXVsID0gZnVuY3Rpb24gaW11bChudW0pIHtcbiAgaWYgKHRoaXMuY21wbigwKSA9PT0gMCB8fCBudW0uY21wbigwKSA9PT0gMCkge1xuICAgIHRoaXMud29yZHNbMF0gPSAwO1xuICAgIHRoaXMubGVuZ3RoID0gMTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHZhciB0bGVuID0gdGhpcy5sZW5ndGg7XG4gIHZhciBubGVuID0gbnVtLmxlbmd0aDtcblxuICB0aGlzLnNpZ24gPSBudW0uc2lnbiAhPT0gdGhpcy5zaWduO1xuICB0aGlzLmxlbmd0aCA9IHRoaXMubGVuZ3RoICsgbnVtLmxlbmd0aDtcbiAgdGhpcy53b3Jkc1t0aGlzLmxlbmd0aCAtIDFdID0gMDtcblxuICBmb3IgKHZhciBrID0gdGhpcy5sZW5ndGggLSAyOyBrID49IDA7IGstLSkge1xuICAgIC8vIFN1bSBhbGwgd29yZHMgd2l0aCB0aGUgc2FtZSBgaSArIGogPSBrYCBhbmQgYWNjdW11bGF0ZSBgY2FycnlgLFxuICAgIC8vIG5vdGUgdGhhdCBjYXJyeSBjb3VsZCBiZSA+PSAweDNmZmZmZmZcbiAgICB2YXIgY2FycnkgPSAwO1xuICAgIHZhciByd29yZCA9IDA7XG4gICAgdmFyIG1heEogPSBNYXRoLm1pbihrLCBubGVuIC0gMSk7XG4gICAgZm9yICh2YXIgaiA9IE1hdGgubWF4KDAsIGsgLSB0bGVuICsgMSk7IGogPD0gbWF4SjsgaisrKSB7XG4gICAgICB2YXIgaSA9IGsgLSBqO1xuICAgICAgdmFyIGEgPSB0aGlzLndvcmRzW2ldO1xuICAgICAgdmFyIGIgPSBudW0ud29yZHNbal07XG4gICAgICB2YXIgciA9IGEgKiBiO1xuXG4gICAgICB2YXIgbG8gPSByICYgMHgzZmZmZmZmO1xuICAgICAgY2FycnkgKz0gKHIgLyAweDQwMDAwMDApIHwgMDtcbiAgICAgIGxvICs9IHJ3b3JkO1xuICAgICAgcndvcmQgPSBsbyAmIDB4M2ZmZmZmZjtcbiAgICAgIGNhcnJ5ICs9IGxvID4+PiAyNjtcbiAgICB9XG4gICAgdGhpcy53b3Jkc1trXSA9IHJ3b3JkO1xuICAgIHRoaXMud29yZHNbayArIDFdICs9IGNhcnJ5O1xuICAgIGNhcnJ5ID0gMDtcbiAgfVxuXG4gIC8vIFByb3BhZ2F0ZSBvdmVyZmxvd3NcbiAgdmFyIGNhcnJ5ID0gMDtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHcgPSB0aGlzLndvcmRzW2ldICsgY2Fycnk7XG4gICAgdGhpcy53b3Jkc1tpXSA9IHcgJiAweDNmZmZmZmY7XG4gICAgY2FycnkgPSB3ID4+PiAyNjtcbiAgfVxuXG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XG59O1xuXG5CTi5wcm90b3R5cGUuaW11bG4gPSBmdW5jdGlvbiBpbXVsbihudW0pIHtcbiAgYXNzZXJ0KHR5cGVvZiBudW0gPT09ICdudW1iZXInKTtcblxuICAvLyBDYXJyeVxuICB2YXIgY2FycnkgPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdyA9IHRoaXMud29yZHNbaV0gKiBudW07XG4gICAgdmFyIGxvID0gKHcgJiAweDNmZmZmZmYpICsgKGNhcnJ5ICYgMHgzZmZmZmZmKTtcbiAgICBjYXJyeSA+Pj0gMjY7XG4gICAgY2FycnkgKz0gKHcgLyAweDQwMDAwMDApIHwgMDtcbiAgICAvLyBOT1RFOiBsbyBpcyAyN2JpdCBtYXhpbXVtXG4gICAgY2FycnkgKz0gbG8gPj4+IDI2O1xuICAgIHRoaXMud29yZHNbaV0gPSBsbyAmIDB4M2ZmZmZmZjtcbiAgfVxuXG4gIGlmIChjYXJyeSAhPT0gMCkge1xuICAgIHRoaXMud29yZHNbaV0gPSBjYXJyeTtcbiAgICB0aGlzLmxlbmd0aCsrO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5CTi5wcm90b3R5cGUubXVsbiA9IGZ1bmN0aW9uIG11bG4obnVtKSB7XG4gIHJldHVybiB0aGlzLmNsb25lKCkuaW11bG4obnVtKTtcbn07XG5cbi8vIGB0aGlzYCAqIGB0aGlzYFxuQk4ucHJvdG90eXBlLnNxciA9IGZ1bmN0aW9uIHNxcigpIHtcbiAgcmV0dXJuIHRoaXMubXVsKHRoaXMpO1xufTtcblxuLy8gYHRoaXNgICogYHRoaXNgIGluLXBsYWNlXG5CTi5wcm90b3R5cGUuaXNxciA9IGZ1bmN0aW9uIGlzcXIoKSB7XG4gIHJldHVybiB0aGlzLm11bCh0aGlzKTtcbn07XG5cbi8vIFNoaWZ0LWxlZnQgaW4tcGxhY2VcbkJOLnByb3RvdHlwZS5pc2hsbiA9IGZ1bmN0aW9uIGlzaGxuKGJpdHMpIHtcbiAgYXNzZXJ0KHR5cGVvZiBiaXRzID09PSAnbnVtYmVyJyAmJiBiaXRzID49IDApO1xuICB2YXIgciA9IGJpdHMgJSAyNjtcbiAgdmFyIHMgPSAoYml0cyAtIHIpIC8gMjY7XG4gIHZhciBjYXJyeU1hc2sgPSAoMHgzZmZmZmZmID4+PiAoMjYgLSByKSkgPDwgKDI2IC0gcik7XG5cbiAgaWYgKHIgIT09IDApIHtcbiAgICB2YXIgY2FycnkgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIG5ld0NhcnJ5ID0gdGhpcy53b3Jkc1tpXSAmIGNhcnJ5TWFzaztcbiAgICAgIHZhciBjID0gKHRoaXMud29yZHNbaV0gLSBuZXdDYXJyeSkgPDwgcjtcbiAgICAgIHRoaXMud29yZHNbaV0gPSBjIHwgY2Fycnk7XG4gICAgICBjYXJyeSA9IG5ld0NhcnJ5ID4+PiAoMjYgLSByKTtcbiAgICB9XG4gICAgaWYgKGNhcnJ5KSB7XG4gICAgICB0aGlzLndvcmRzW2ldID0gY2Fycnk7XG4gICAgICB0aGlzLmxlbmd0aCsrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzICE9PSAwKSB7XG4gICAgZm9yICh2YXIgaSA9IHRoaXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXG4gICAgICB0aGlzLndvcmRzW2kgKyBzXSA9IHRoaXMud29yZHNbaV07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzOyBpKyspXG4gICAgICB0aGlzLndvcmRzW2ldID0gMDtcbiAgICB0aGlzLmxlbmd0aCArPSBzO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcbn07XG5cbi8vIFNoaWZ0LXJpZ2h0IGluLXBsYWNlXG4vLyBOT1RFOiBgaGludGAgaXMgYSBsb3dlc3QgYml0IGJlZm9yZSB0cmFpbGluZyB6ZXJvZXNcbi8vIE5PVEU6IGlmIGBleHRlbmRlZGAgaXMgcHJlc2VudCAtIGl0IHdpbGwgYmUgZmlsbGVkIHdpdGggZGVzdHJveWVkIGJpdHNcbkJOLnByb3RvdHlwZS5pc2hybiA9IGZ1bmN0aW9uIGlzaHJuKGJpdHMsIGhpbnQsIGV4dGVuZGVkKSB7XG4gIGFzc2VydCh0eXBlb2YgYml0cyA9PT0gJ251bWJlcicgJiYgYml0cyA+PSAwKTtcbiAgdmFyIGg7XG4gIGlmIChoaW50KVxuICAgIGggPSAoaGludCAtIChoaW50ICUgMjYpKSAvIDI2O1xuICBlbHNlXG4gICAgaCA9IDA7XG5cbiAgdmFyIHIgPSBiaXRzICUgMjY7XG4gIHZhciBzID0gTWF0aC5taW4oKGJpdHMgLSByKSAvIDI2LCB0aGlzLmxlbmd0aCk7XG4gIHZhciBtYXNrID0gMHgzZmZmZmZmIF4gKCgweDNmZmZmZmYgPj4+IHIpIDw8IHIpO1xuICB2YXIgbWFza2VkV29yZHMgPSBleHRlbmRlZDtcblxuICBoIC09IHM7XG4gIGggPSBNYXRoLm1heCgwLCBoKTtcblxuICAvLyBFeHRlbmRlZCBtb2RlLCBjb3B5IG1hc2tlZCBwYXJ0XG4gIGlmIChtYXNrZWRXb3Jkcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgczsgaSsrKVxuICAgICAgbWFza2VkV29yZHMud29yZHNbaV0gPSB0aGlzLndvcmRzW2ldO1xuICAgIG1hc2tlZFdvcmRzLmxlbmd0aCA9IHM7XG4gIH1cblxuICBpZiAocyA9PT0gMCkge1xuICAgIC8vIE5vLW9wLCB3ZSBzaG91bGQgbm90IG1vdmUgYW55dGhpbmcgYXQgYWxsXG4gIH0gZWxzZSBpZiAodGhpcy5sZW5ndGggPiBzKSB7XG4gICAgdGhpcy5sZW5ndGggLT0gcztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspXG4gICAgICB0aGlzLndvcmRzW2ldID0gdGhpcy53b3Jkc1tpICsgc107XG4gIH0gZWxzZSB7XG4gICAgdGhpcy53b3Jkc1swXSA9IDA7XG4gICAgdGhpcy5sZW5ndGggPSAxO1xuICB9XG5cbiAgdmFyIGNhcnJ5ID0gMDtcbiAgZm9yICh2YXIgaSA9IHRoaXMubGVuZ3RoIC0gMTsgaSA+PSAwICYmIChjYXJyeSAhPT0gMCB8fCBpID49IGgpOyBpLS0pIHtcbiAgICB2YXIgd29yZCA9IHRoaXMud29yZHNbaV07XG4gICAgdGhpcy53b3Jkc1tpXSA9IChjYXJyeSA8PCAoMjYgLSByKSkgfCAod29yZCA+Pj4gcik7XG4gICAgY2FycnkgPSB3b3JkICYgbWFzaztcbiAgfVxuXG4gIC8vIFB1c2ggY2FycmllZCBiaXRzIGFzIGEgbWFza1xuICBpZiAobWFza2VkV29yZHMgJiYgY2FycnkgIT09IDApXG4gICAgbWFza2VkV29yZHMud29yZHNbbWFza2VkV29yZHMubGVuZ3RoKytdID0gY2Fycnk7XG5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhpcy53b3Jkc1swXSA9IDA7XG4gICAgdGhpcy5sZW5ndGggPSAxO1xuICB9XG5cbiAgdGhpcy5zdHJpcCgpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gU2hpZnQtbGVmdFxuQk4ucHJvdG90eXBlLnNobG4gPSBmdW5jdGlvbiBzaGxuKGJpdHMpIHtcbiAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pc2hsbihiaXRzKTtcbn07XG5cbi8vIFNoaWZ0LXJpZ2h0XG5CTi5wcm90b3R5cGUuc2hybiA9IGZ1bmN0aW9uIHNocm4oYml0cykge1xuICByZXR1cm4gdGhpcy5jbG9uZSgpLmlzaHJuKGJpdHMpO1xufTtcblxuLy8gVGVzdCBpZiBuIGJpdCBpcyBzZXRcbkJOLnByb3RvdHlwZS50ZXN0biA9IGZ1bmN0aW9uIHRlc3RuKGJpdCkge1xuICBhc3NlcnQodHlwZW9mIGJpdCA9PT0gJ251bWJlcicgJiYgYml0ID49IDApO1xuICB2YXIgciA9IGJpdCAlIDI2O1xuICB2YXIgcyA9IChiaXQgLSByKSAvIDI2O1xuICB2YXIgcSA9IDEgPDwgcjtcblxuICAvLyBGYXN0IGNhc2U6IGJpdCBpcyBtdWNoIGhpZ2hlciB0aGFuIGFsbCBleGlzdGluZyB3b3Jkc1xuICBpZiAodGhpcy5sZW5ndGggPD0gcykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIGJpdCBhbmQgcmV0dXJuXG4gIHZhciB3ID0gdGhpcy53b3Jkc1tzXTtcblxuICByZXR1cm4gISEodyAmIHEpO1xufTtcblxuLy8gUmV0dXJuIG9ubHkgbG93ZXJzIGJpdHMgb2YgbnVtYmVyIChpbi1wbGFjZSlcbkJOLnByb3RvdHlwZS5pbWFza24gPSBmdW5jdGlvbiBpbWFza24oYml0cykge1xuICBhc3NlcnQodHlwZW9mIGJpdHMgPT09ICdudW1iZXInICYmIGJpdHMgPj0gMCk7XG4gIHZhciByID0gYml0cyAlIDI2O1xuICB2YXIgcyA9IChiaXRzIC0gcikgLyAyNjtcblxuICBhc3NlcnQoIXRoaXMuc2lnbiwgJ2ltYXNrbiB3b3JrcyBvbmx5IHdpdGggcG9zaXRpdmUgbnVtYmVycycpO1xuXG4gIGlmIChyICE9PSAwKVxuICAgIHMrKztcbiAgdGhpcy5sZW5ndGggPSBNYXRoLm1pbihzLCB0aGlzLmxlbmd0aCk7XG5cbiAgaWYgKHIgIT09IDApIHtcbiAgICB2YXIgbWFzayA9IDB4M2ZmZmZmZiBeICgoMHgzZmZmZmZmID4+PiByKSA8PCByKTtcbiAgICB0aGlzLndvcmRzW3RoaXMubGVuZ3RoIC0gMV0gJj0gbWFzaztcbiAgfVxuXG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XG59O1xuXG4vLyBSZXR1cm4gb25seSBsb3dlcnMgYml0cyBvZiBudW1iZXJcbkJOLnByb3RvdHlwZS5tYXNrbiA9IGZ1bmN0aW9uIG1hc2tuKGJpdHMpIHtcbiAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pbWFza24oYml0cyk7XG59O1xuXG4vLyBBZGQgcGxhaW4gbnVtYmVyIGBudW1gIHRvIGB0aGlzYFxuQk4ucHJvdG90eXBlLmlhZGRuID0gZnVuY3Rpb24gaWFkZG4obnVtKSB7XG4gIGFzc2VydCh0eXBlb2YgbnVtID09PSAnbnVtYmVyJyk7XG4gIGlmIChudW0gPCAwKVxuICAgIHJldHVybiB0aGlzLmlzdWJuKC1udW0pO1xuXG4gIC8vIFBvc3NpYmxlIHNpZ24gY2hhbmdlXG4gIGlmICh0aGlzLnNpZ24pIHtcbiAgICBpZiAodGhpcy5sZW5ndGggPT09IDEgJiYgdGhpcy53b3Jkc1swXSA8IG51bSkge1xuICAgICAgdGhpcy53b3Jkc1swXSA9IG51bSAtIHRoaXMud29yZHNbMF07XG4gICAgICB0aGlzLnNpZ24gPSBmYWxzZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuc2lnbiA9IGZhbHNlO1xuICAgIHRoaXMuaXN1Ym4obnVtKTtcbiAgICB0aGlzLnNpZ24gPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gQWRkIHdpdGhvdXQgY2hlY2tzXG4gIHJldHVybiB0aGlzLl9pYWRkbihudW0pO1xufTtcblxuQk4ucHJvdG90eXBlLl9pYWRkbiA9IGZ1bmN0aW9uIF9pYWRkbihudW0pIHtcbiAgdGhpcy53b3Jkc1swXSArPSBudW07XG5cbiAgLy8gQ2FycnlcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aCAmJiB0aGlzLndvcmRzW2ldID49IDB4NDAwMDAwMDsgaSsrKSB7XG4gICAgdGhpcy53b3Jkc1tpXSAtPSAweDQwMDAwMDA7XG4gICAgaWYgKGkgPT09IHRoaXMubGVuZ3RoIC0gMSlcbiAgICAgIHRoaXMud29yZHNbaSArIDFdID0gMTtcbiAgICBlbHNlXG4gICAgICB0aGlzLndvcmRzW2kgKyAxXSsrO1xuICB9XG4gIHRoaXMubGVuZ3RoID0gTWF0aC5tYXgodGhpcy5sZW5ndGgsIGkgKyAxKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIFN1YnRyYWN0IHBsYWluIG51bWJlciBgbnVtYCBmcm9tIGB0aGlzYFxuQk4ucHJvdG90eXBlLmlzdWJuID0gZnVuY3Rpb24gaXN1Ym4obnVtKSB7XG4gIGFzc2VydCh0eXBlb2YgbnVtID09PSAnbnVtYmVyJyk7XG4gIGlmIChudW0gPCAwKVxuICAgIHJldHVybiB0aGlzLmlhZGRuKC1udW0pO1xuXG4gIGlmICh0aGlzLnNpZ24pIHtcbiAgICB0aGlzLnNpZ24gPSBmYWxzZTtcbiAgICB0aGlzLmlhZGRuKG51bSk7XG4gICAgdGhpcy5zaWduID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRoaXMud29yZHNbMF0gLT0gbnVtO1xuXG4gIC8vIENhcnJ5XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGggJiYgdGhpcy53b3Jkc1tpXSA8IDA7IGkrKykge1xuICAgIHRoaXMud29yZHNbaV0gKz0gMHg0MDAwMDAwO1xuICAgIHRoaXMud29yZHNbaSArIDFdIC09IDE7XG4gIH1cblxuICByZXR1cm4gdGhpcy5zdHJpcCgpO1xufTtcblxuQk4ucHJvdG90eXBlLmFkZG4gPSBmdW5jdGlvbiBhZGRuKG51bSkge1xuICByZXR1cm4gdGhpcy5jbG9uZSgpLmlhZGRuKG51bSk7XG59O1xuXG5CTi5wcm90b3R5cGUuc3VibiA9IGZ1bmN0aW9uIHN1Ym4obnVtKSB7XG4gIHJldHVybiB0aGlzLmNsb25lKCkuaXN1Ym4obnVtKTtcbn07XG5cbkJOLnByb3RvdHlwZS5pYWJzID0gZnVuY3Rpb24gaWFicygpIHtcbiAgdGhpcy5zaWduID0gZmFsc2U7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5CTi5wcm90b3R5cGUuYWJzID0gZnVuY3Rpb24gYWJzKCkge1xuICByZXR1cm4gdGhpcy5jbG9uZSgpLmlhYnMoKTtcbn07XG5cbkJOLnByb3RvdHlwZS5faXNobG5zdWJtdWwgPSBmdW5jdGlvbiBfaXNobG5zdWJtdWwobnVtLCBtdWwsIHNoaWZ0KSB7XG4gIC8vIEJpZ2dlciBzdG9yYWdlIGlzIG5lZWRlZFxuICB2YXIgbGVuID0gbnVtLmxlbmd0aCArIHNoaWZ0O1xuICB2YXIgaTtcbiAgaWYgKHRoaXMud29yZHMubGVuZ3RoIDwgbGVuKSB7XG4gICAgdmFyIHQgPSBuZXcgQXJyYXkobGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspXG4gICAgICB0W2ldID0gdGhpcy53b3Jkc1tpXTtcbiAgICB0aGlzLndvcmRzID0gdDtcbiAgfSBlbHNlIHtcbiAgICBpID0gdGhpcy5sZW5ndGg7XG4gIH1cblxuICAvLyBaZXJvaWZ5IHJlc3RcbiAgdGhpcy5sZW5ndGggPSBNYXRoLm1heCh0aGlzLmxlbmd0aCwgbGVuKTtcbiAgZm9yICg7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKVxuICAgIHRoaXMud29yZHNbaV0gPSAwO1xuXG4gIHZhciBjYXJyeSA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHcgPSB0aGlzLndvcmRzW2kgKyBzaGlmdF0gKyBjYXJyeTtcbiAgICB2YXIgcmlnaHQgPSBudW0ud29yZHNbaV0gKiBtdWw7XG4gICAgdyAtPSByaWdodCAmIDB4M2ZmZmZmZjtcbiAgICBjYXJyeSA9ICh3ID4+IDI2KSAtICgocmlnaHQgLyAweDQwMDAwMDApIHwgMCk7XG4gICAgdGhpcy53b3Jkc1tpICsgc2hpZnRdID0gdyAmIDB4M2ZmZmZmZjtcbiAgfVxuICBmb3IgKDsgaSA8IHRoaXMubGVuZ3RoIC0gc2hpZnQ7IGkrKykge1xuICAgIHZhciB3ID0gdGhpcy53b3Jkc1tpICsgc2hpZnRdICsgY2Fycnk7XG4gICAgY2FycnkgPSB3ID4+IDI2O1xuICAgIHRoaXMud29yZHNbaSArIHNoaWZ0XSA9IHcgJiAweDNmZmZmZmY7XG4gIH1cblxuICBpZiAoY2FycnkgPT09IDApXG4gICAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcblxuICAvLyBTdWJ0cmFjdGlvbiBvdmVyZmxvd1xuICBhc3NlcnQoY2FycnkgPT09IC0xKTtcbiAgY2FycnkgPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdyA9IC10aGlzLndvcmRzW2ldICsgY2Fycnk7XG4gICAgY2FycnkgPSB3ID4+IDI2O1xuICAgIHRoaXMud29yZHNbaV0gPSB3ICYgMHgzZmZmZmZmO1xuICB9XG4gIHRoaXMuc2lnbiA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcbn07XG5cbkJOLnByb3RvdHlwZS5fd29yZERpdiA9IGZ1bmN0aW9uIF93b3JkRGl2KG51bSwgbW9kZSkge1xuICB2YXIgc2hpZnQgPSB0aGlzLmxlbmd0aCAtIG51bS5sZW5ndGg7XG5cbiAgdmFyIGEgPSB0aGlzLmNsb25lKCk7XG4gIHZhciBiID0gbnVtO1xuXG4gIC8vIE5vcm1hbGl6ZVxuICB2YXIgYmhpID0gYi53b3Jkc1tiLmxlbmd0aCAtIDFdO1xuICB2YXIgYmhpQml0cyA9IHRoaXMuX2NvdW50Qml0cyhiaGkpO1xuICBzaGlmdCA9IDI2IC0gYmhpQml0cztcbiAgaWYgKHNoaWZ0ICE9PSAwKSB7XG4gICAgYiA9IGIuc2hsbihzaGlmdCk7XG4gICAgYS5pc2hsbihzaGlmdCk7XG4gICAgYmhpID0gYi53b3Jkc1tiLmxlbmd0aCAtIDFdO1xuICB9XG5cbiAgLy8gSW5pdGlhbGl6ZSBxdW90aWVudFxuICB2YXIgbSA9IGEubGVuZ3RoIC0gYi5sZW5ndGg7XG4gIHZhciBxO1xuXG4gIGlmIChtb2RlICE9PSAnbW9kJykge1xuICAgIHEgPSBuZXcgQk4obnVsbCk7XG4gICAgcS5sZW5ndGggPSBtICsgMTtcbiAgICBxLndvcmRzID0gbmV3IEFycmF5KHEubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHEubGVuZ3RoOyBpKyspXG4gICAgICBxLndvcmRzW2ldID0gMDtcbiAgfVxuXG4gIHZhciBkaWZmID0gYS5jbG9uZSgpLl9pc2hsbnN1Ym11bChiLCAxLCBtKTtcbiAgaWYgKCFkaWZmLnNpZ24pIHtcbiAgICBhID0gZGlmZjtcbiAgICBpZiAocSlcbiAgICAgIHEud29yZHNbbV0gPSAxO1xuICB9XG5cbiAgZm9yICh2YXIgaiA9IG0gLSAxOyBqID49IDA7IGotLSkge1xuICAgIHZhciBxaiA9IGEud29yZHNbYi5sZW5ndGggKyBqXSAqIDB4NDAwMDAwMCArIGEud29yZHNbYi5sZW5ndGggKyBqIC0gMV07XG5cbiAgICAvLyBOT1RFOiAocWogLyBiaGkpIGlzICgweDNmZmZmZmYgKiAweDQwMDAwMDAgKyAweDNmZmZmZmYpIC8gMHgyMDAwMDAwIG1heFxuICAgIC8vICgweDdmZmZmZmYpXG4gICAgcWogPSBNYXRoLm1pbigocWogLyBiaGkpIHwgMCwgMHgzZmZmZmZmKTtcblxuICAgIGEuX2lzaGxuc3VibXVsKGIsIHFqLCBqKTtcbiAgICB3aGlsZSAoYS5zaWduKSB7XG4gICAgICBxai0tO1xuICAgICAgYS5zaWduID0gZmFsc2U7XG4gICAgICBhLl9pc2hsbnN1Ym11bChiLCAxLCBqKTtcbiAgICAgIGlmIChhLmNtcG4oMCkgIT09IDApXG4gICAgICAgIGEuc2lnbiA9ICFhLnNpZ247XG4gICAgfVxuICAgIGlmIChxKVxuICAgICAgcS53b3Jkc1tqXSA9IHFqO1xuICB9XG4gIGlmIChxKVxuICAgIHEuc3RyaXAoKTtcbiAgYS5zdHJpcCgpO1xuXG4gIC8vIERlbm9ybWFsaXplXG4gIGlmIChtb2RlICE9PSAnZGl2JyAmJiBzaGlmdCAhPT0gMClcbiAgICBhLmlzaHJuKHNoaWZ0KTtcbiAgcmV0dXJuIHsgZGl2OiBxID8gcSA6IG51bGwsIG1vZDogYSB9O1xufTtcblxuQk4ucHJvdG90eXBlLmRpdm1vZCA9IGZ1bmN0aW9uIGRpdm1vZChudW0sIG1vZGUpIHtcbiAgYXNzZXJ0KG51bS5jbXBuKDApICE9PSAwKTtcblxuICBpZiAodGhpcy5zaWduICYmICFudW0uc2lnbikge1xuICAgIHZhciByZXMgPSB0aGlzLm5lZygpLmRpdm1vZChudW0sIG1vZGUpO1xuICAgIHZhciBkaXY7XG4gICAgdmFyIG1vZDtcbiAgICBpZiAobW9kZSAhPT0gJ21vZCcpXG4gICAgICBkaXYgPSByZXMuZGl2Lm5lZygpO1xuICAgIGlmIChtb2RlICE9PSAnZGl2JylcbiAgICAgIG1vZCA9IHJlcy5tb2QuY21wbigwKSA9PT0gMCA/IHJlcy5tb2QgOiBudW0uc3ViKHJlcy5tb2QpO1xuICAgIHJldHVybiB7XG4gICAgICBkaXY6IGRpdixcbiAgICAgIG1vZDogbW9kXG4gICAgfTtcbiAgfSBlbHNlIGlmICghdGhpcy5zaWduICYmIG51bS5zaWduKSB7XG4gICAgdmFyIHJlcyA9IHRoaXMuZGl2bW9kKG51bS5uZWcoKSwgbW9kZSk7XG4gICAgdmFyIGRpdjtcbiAgICBpZiAobW9kZSAhPT0gJ21vZCcpXG4gICAgICBkaXYgPSByZXMuZGl2Lm5lZygpO1xuICAgIHJldHVybiB7IGRpdjogZGl2LCBtb2Q6IHJlcy5tb2QgfTtcbiAgfSBlbHNlIGlmICh0aGlzLnNpZ24gJiYgbnVtLnNpZ24pIHtcbiAgICByZXR1cm4gdGhpcy5uZWcoKS5kaXZtb2QobnVtLm5lZygpLCBtb2RlKTtcbiAgfVxuXG4gIC8vIEJvdGggbnVtYmVycyBhcmUgcG9zaXRpdmUgYXQgdGhpcyBwb2ludFxuXG4gIC8vIFN0cmlwIGJvdGggbnVtYmVycyB0byBhcHByb3hpbWF0ZSBzaGlmdCB2YWx1ZVxuICBpZiAobnVtLmxlbmd0aCA+IHRoaXMubGVuZ3RoIHx8IHRoaXMuY21wKG51bSkgPCAwKVxuICAgIHJldHVybiB7IGRpdjogbmV3IEJOKDApLCBtb2Q6IHRoaXMgfTtcblxuICAvLyBWZXJ5IHNob3J0IHJlZHVjdGlvblxuICBpZiAobnVtLmxlbmd0aCA9PT0gMSkge1xuICAgIGlmIChtb2RlID09PSAnZGl2JylcbiAgICAgIHJldHVybiB7IGRpdjogdGhpcy5kaXZuKG51bS53b3Jkc1swXSksIG1vZDogbnVsbCB9O1xuICAgIGVsc2UgaWYgKG1vZGUgPT09ICdtb2QnKVxuICAgICAgcmV0dXJuIHsgZGl2OiBudWxsLCBtb2Q6IG5ldyBCTih0aGlzLm1vZG4obnVtLndvcmRzWzBdKSkgfTtcbiAgICByZXR1cm4ge1xuICAgICAgZGl2OiB0aGlzLmRpdm4obnVtLndvcmRzWzBdKSxcbiAgICAgIG1vZDogbmV3IEJOKHRoaXMubW9kbihudW0ud29yZHNbMF0pKVxuICAgIH07XG4gIH1cblxuICByZXR1cm4gdGhpcy5fd29yZERpdihudW0sIG1vZGUpO1xufTtcblxuLy8gRmluZCBgdGhpc2AgLyBgbnVtYFxuQk4ucHJvdG90eXBlLmRpdiA9IGZ1bmN0aW9uIGRpdihudW0pIHtcbiAgcmV0dXJuIHRoaXMuZGl2bW9kKG51bSwgJ2RpdicpLmRpdjtcbn07XG5cbi8vIEZpbmQgYHRoaXNgICUgYG51bWBcbkJOLnByb3RvdHlwZS5tb2QgPSBmdW5jdGlvbiBtb2QobnVtKSB7XG4gIHJldHVybiB0aGlzLmRpdm1vZChudW0sICdtb2QnKS5tb2Q7XG59O1xuXG4vLyBGaW5kIFJvdW5kKGB0aGlzYCAvIGBudW1gKVxuQk4ucHJvdG90eXBlLmRpdlJvdW5kID0gZnVuY3Rpb24gZGl2Um91bmQobnVtKSB7XG4gIHZhciBkbSA9IHRoaXMuZGl2bW9kKG51bSk7XG5cbiAgLy8gRmFzdCBjYXNlIC0gZXhhY3QgZGl2aXNpb25cbiAgaWYgKGRtLm1vZC5jbXBuKDApID09PSAwKVxuICAgIHJldHVybiBkbS5kaXY7XG5cbiAgdmFyIG1vZCA9IGRtLmRpdi5zaWduID8gZG0ubW9kLmlzdWIobnVtKSA6IGRtLm1vZDtcblxuICB2YXIgaGFsZiA9IG51bS5zaHJuKDEpO1xuICB2YXIgcjIgPSBudW0uYW5kbG4oMSk7XG4gIHZhciBjbXAgPSBtb2QuY21wKGhhbGYpO1xuXG4gIC8vIFJvdW5kIGRvd25cbiAgaWYgKGNtcCA8IDAgfHwgcjIgPT09IDEgJiYgY21wID09PSAwKVxuICAgIHJldHVybiBkbS5kaXY7XG5cbiAgLy8gUm91bmQgdXBcbiAgcmV0dXJuIGRtLmRpdi5zaWduID8gZG0uZGl2LmlzdWJuKDEpIDogZG0uZGl2LmlhZGRuKDEpO1xufTtcblxuQk4ucHJvdG90eXBlLm1vZG4gPSBmdW5jdGlvbiBtb2RuKG51bSkge1xuICBhc3NlcnQobnVtIDw9IDB4M2ZmZmZmZik7XG4gIHZhciBwID0gKDEgPDwgMjYpICUgbnVtO1xuXG4gIHZhciBhY2MgPSAwO1xuICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcbiAgICBhY2MgPSAocCAqIGFjYyArIHRoaXMud29yZHNbaV0pICUgbnVtO1xuXG4gIHJldHVybiBhY2M7XG59O1xuXG4vLyBJbi1wbGFjZSBkaXZpc2lvbiBieSBudW1iZXJcbkJOLnByb3RvdHlwZS5pZGl2biA9IGZ1bmN0aW9uIGlkaXZuKG51bSkge1xuICBhc3NlcnQobnVtIDw9IDB4M2ZmZmZmZik7XG5cbiAgdmFyIGNhcnJ5ID0gMDtcbiAgZm9yICh2YXIgaSA9IHRoaXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgdyA9IHRoaXMud29yZHNbaV0gKyBjYXJyeSAqIDB4NDAwMDAwMDtcbiAgICB0aGlzLndvcmRzW2ldID0gKHcgLyBudW0pIHwgMDtcbiAgICBjYXJyeSA9IHcgJSBudW07XG4gIH1cblxuICByZXR1cm4gdGhpcy5zdHJpcCgpO1xufTtcblxuQk4ucHJvdG90eXBlLmRpdm4gPSBmdW5jdGlvbiBkaXZuKG51bSkge1xuICByZXR1cm4gdGhpcy5jbG9uZSgpLmlkaXZuKG51bSk7XG59O1xuXG5CTi5wcm90b3R5cGUuZWdjZCA9IGZ1bmN0aW9uIGVnY2QocCkge1xuICBhc3NlcnQoIXAuc2lnbik7XG4gIGFzc2VydChwLmNtcG4oMCkgIT09IDApO1xuXG4gIHZhciB4ID0gdGhpcztcbiAgdmFyIHkgPSBwLmNsb25lKCk7XG5cbiAgaWYgKHguc2lnbilcbiAgICB4ID0geC5tb2QocCk7XG4gIGVsc2VcbiAgICB4ID0geC5jbG9uZSgpO1xuXG4gIC8vIEEgKiB4ICsgQiAqIHkgPSB4XG4gIHZhciBBID0gbmV3IEJOKDEpO1xuICB2YXIgQiA9IG5ldyBCTigwKTtcblxuICAvLyBDICogeCArIEQgKiB5ID0geVxuICB2YXIgQyA9IG5ldyBCTigwKTtcbiAgdmFyIEQgPSBuZXcgQk4oMSk7XG5cbiAgdmFyIGcgPSAwO1xuXG4gIHdoaWxlICh4LmlzRXZlbigpICYmIHkuaXNFdmVuKCkpIHtcbiAgICB4LmlzaHJuKDEpO1xuICAgIHkuaXNocm4oMSk7XG4gICAgKytnO1xuICB9XG5cbiAgdmFyIHlwID0geS5jbG9uZSgpO1xuICB2YXIgeHAgPSB4LmNsb25lKCk7XG5cbiAgd2hpbGUgKHguY21wbigwKSAhPT0gMCkge1xuICAgIHdoaWxlICh4LmlzRXZlbigpKSB7XG4gICAgICB4LmlzaHJuKDEpO1xuICAgICAgaWYgKEEuaXNFdmVuKCkgJiYgQi5pc0V2ZW4oKSkge1xuICAgICAgICBBLmlzaHJuKDEpO1xuICAgICAgICBCLmlzaHJuKDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgQS5pYWRkKHlwKS5pc2hybigxKTtcbiAgICAgICAgQi5pc3ViKHhwKS5pc2hybigxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB3aGlsZSAoeS5pc0V2ZW4oKSkge1xuICAgICAgeS5pc2hybigxKTtcbiAgICAgIGlmIChDLmlzRXZlbigpICYmIEQuaXNFdmVuKCkpIHtcbiAgICAgICAgQy5pc2hybigxKTtcbiAgICAgICAgRC5pc2hybigxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIEMuaWFkZCh5cCkuaXNocm4oMSk7XG4gICAgICAgIEQuaXN1Yih4cCkuaXNocm4oMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHguY21wKHkpID49IDApIHtcbiAgICAgIHguaXN1Yih5KTtcbiAgICAgIEEuaXN1YihDKTtcbiAgICAgIEIuaXN1YihEKTtcbiAgICB9IGVsc2Uge1xuICAgICAgeS5pc3ViKHgpO1xuICAgICAgQy5pc3ViKEEpO1xuICAgICAgRC5pc3ViKEIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYTogQyxcbiAgICBiOiBELFxuICAgIGdjZDogeS5pc2hsbihnKVxuICB9O1xufTtcblxuLy8gVGhpcyBpcyByZWR1Y2VkIGluY2FybmF0aW9uIG9mIHRoZSBiaW5hcnkgRUVBXG4vLyBhYm92ZSwgZGVzaWduYXRlZCB0byBpbnZlcnQgbWVtYmVycyBvZiB0aGVcbi8vIF9wcmltZV8gZmllbGRzIEYocCkgYXQgYSBtYXhpbWFsIHNwZWVkXG5CTi5wcm90b3R5cGUuX2ludm1wID0gZnVuY3Rpb24gX2ludm1wKHApIHtcbiAgYXNzZXJ0KCFwLnNpZ24pO1xuICBhc3NlcnQocC5jbXBuKDApICE9PSAwKTtcblxuICB2YXIgYSA9IHRoaXM7XG4gIHZhciBiID0gcC5jbG9uZSgpO1xuXG4gIGlmIChhLnNpZ24pXG4gICAgYSA9IGEubW9kKHApO1xuICBlbHNlXG4gICAgYSA9IGEuY2xvbmUoKTtcblxuICB2YXIgeDEgPSBuZXcgQk4oMSk7XG4gIHZhciB4MiA9IG5ldyBCTigwKTtcblxuICB2YXIgZGVsdGEgPSBiLmNsb25lKCk7XG5cbiAgd2hpbGUgKGEuY21wbigxKSA+IDAgJiYgYi5jbXBuKDEpID4gMCkge1xuICAgIHdoaWxlIChhLmlzRXZlbigpKSB7XG4gICAgICBhLmlzaHJuKDEpO1xuICAgICAgaWYgKHgxLmlzRXZlbigpKVxuICAgICAgICB4MS5pc2hybigxKTtcbiAgICAgIGVsc2VcbiAgICAgICAgeDEuaWFkZChkZWx0YSkuaXNocm4oMSk7XG4gICAgfVxuICAgIHdoaWxlIChiLmlzRXZlbigpKSB7XG4gICAgICBiLmlzaHJuKDEpO1xuICAgICAgaWYgKHgyLmlzRXZlbigpKVxuICAgICAgICB4Mi5pc2hybigxKTtcbiAgICAgIGVsc2VcbiAgICAgICAgeDIuaWFkZChkZWx0YSkuaXNocm4oMSk7XG4gICAgfVxuICAgIGlmIChhLmNtcChiKSA+PSAwKSB7XG4gICAgICBhLmlzdWIoYik7XG4gICAgICB4MS5pc3ViKHgyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYi5pc3ViKGEpO1xuICAgICAgeDIuaXN1Yih4MSk7XG4gICAgfVxuICB9XG4gIGlmIChhLmNtcG4oMSkgPT09IDApXG4gICAgcmV0dXJuIHgxO1xuICBlbHNlXG4gICAgcmV0dXJuIHgyO1xufTtcblxuQk4ucHJvdG90eXBlLmdjZCA9IGZ1bmN0aW9uIGdjZChudW0pIHtcbiAgaWYgKHRoaXMuY21wbigwKSA9PT0gMClcbiAgICByZXR1cm4gbnVtLmNsb25lKCk7XG4gIGlmIChudW0uY21wbigwKSA9PT0gMClcbiAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xuXG4gIHZhciBhID0gdGhpcy5jbG9uZSgpO1xuICB2YXIgYiA9IG51bS5jbG9uZSgpO1xuICBhLnNpZ24gPSBmYWxzZTtcbiAgYi5zaWduID0gZmFsc2U7XG5cbiAgLy8gUmVtb3ZlIGNvbW1vbiBmYWN0b3Igb2YgdHdvXG4gIGZvciAodmFyIHNoaWZ0ID0gMDsgYS5pc0V2ZW4oKSAmJiBiLmlzRXZlbigpOyBzaGlmdCsrKSB7XG4gICAgYS5pc2hybigxKTtcbiAgICBiLmlzaHJuKDEpO1xuICB9XG5cbiAgZG8ge1xuICAgIHdoaWxlIChhLmlzRXZlbigpKVxuICAgICAgYS5pc2hybigxKTtcbiAgICB3aGlsZSAoYi5pc0V2ZW4oKSlcbiAgICAgIGIuaXNocm4oMSk7XG5cbiAgICB2YXIgciA9IGEuY21wKGIpO1xuICAgIGlmIChyIDwgMCkge1xuICAgICAgLy8gU3dhcCBgYWAgYW5kIGBiYCB0byBtYWtlIGBhYCBhbHdheXMgYmlnZ2VyIHRoYW4gYGJgXG4gICAgICB2YXIgdCA9IGE7XG4gICAgICBhID0gYjtcbiAgICAgIGIgPSB0O1xuICAgIH0gZWxzZSBpZiAociA9PT0gMCB8fCBiLmNtcG4oMSkgPT09IDApIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGEuaXN1YihiKTtcbiAgfSB3aGlsZSAodHJ1ZSk7XG5cbiAgcmV0dXJuIGIuaXNobG4oc2hpZnQpO1xufTtcblxuLy8gSW52ZXJ0IG51bWJlciBpbiB0aGUgZmllbGQgRihudW0pXG5CTi5wcm90b3R5cGUuaW52bSA9IGZ1bmN0aW9uIGludm0obnVtKSB7XG4gIHJldHVybiB0aGlzLmVnY2QobnVtKS5hLm1vZChudW0pO1xufTtcblxuQk4ucHJvdG90eXBlLmlzRXZlbiA9IGZ1bmN0aW9uIGlzRXZlbigpIHtcbiAgcmV0dXJuICh0aGlzLndvcmRzWzBdICYgMSkgPT09IDA7XG59O1xuXG5CTi5wcm90b3R5cGUuaXNPZGQgPSBmdW5jdGlvbiBpc09kZCgpIHtcbiAgcmV0dXJuICh0aGlzLndvcmRzWzBdICYgMSkgPT09IDE7XG59O1xuXG4vLyBBbmQgZmlyc3Qgd29yZCBhbmQgbnVtXG5CTi5wcm90b3R5cGUuYW5kbG4gPSBmdW5jdGlvbiBhbmRsbihudW0pIHtcbiAgcmV0dXJuIHRoaXMud29yZHNbMF0gJiBudW07XG59O1xuXG4vLyBJbmNyZW1lbnQgYXQgdGhlIGJpdCBwb3NpdGlvbiBpbi1saW5lXG5CTi5wcm90b3R5cGUuYmluY24gPSBmdW5jdGlvbiBiaW5jbihiaXQpIHtcbiAgYXNzZXJ0KHR5cGVvZiBiaXQgPT09ICdudW1iZXInKTtcbiAgdmFyIHIgPSBiaXQgJSAyNjtcbiAgdmFyIHMgPSAoYml0IC0gcikgLyAyNjtcbiAgdmFyIHEgPSAxIDw8IHI7XG5cbiAgLy8gRmFzdCBjYXNlOiBiaXQgaXMgbXVjaCBoaWdoZXIgdGhhbiBhbGwgZXhpc3Rpbmcgd29yZHNcbiAgaWYgKHRoaXMubGVuZ3RoIDw9IHMpIHtcbiAgICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGg7IGkgPCBzICsgMTsgaSsrKVxuICAgICAgdGhpcy53b3Jkc1tpXSA9IDA7XG4gICAgdGhpcy53b3Jkc1tzXSB8PSBxO1xuICAgIHRoaXMubGVuZ3RoID0gcyArIDE7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBBZGQgYml0IGFuZCBwcm9wYWdhdGUsIGlmIG5lZWRlZFxuICB2YXIgY2FycnkgPSBxO1xuICBmb3IgKHZhciBpID0gczsgY2FycnkgIT09IDAgJiYgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdyA9IHRoaXMud29yZHNbaV07XG4gICAgdyArPSBjYXJyeTtcbiAgICBjYXJyeSA9IHcgPj4+IDI2O1xuICAgIHcgJj0gMHgzZmZmZmZmO1xuICAgIHRoaXMud29yZHNbaV0gPSB3O1xuICB9XG4gIGlmIChjYXJyeSAhPT0gMCkge1xuICAgIHRoaXMud29yZHNbaV0gPSBjYXJyeTtcbiAgICB0aGlzLmxlbmd0aCsrO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuQk4ucHJvdG90eXBlLmNtcG4gPSBmdW5jdGlvbiBjbXBuKG51bSkge1xuICB2YXIgc2lnbiA9IG51bSA8IDA7XG4gIGlmIChzaWduKVxuICAgIG51bSA9IC1udW07XG5cbiAgaWYgKHRoaXMuc2lnbiAmJiAhc2lnbilcbiAgICByZXR1cm4gLTE7XG4gIGVsc2UgaWYgKCF0aGlzLnNpZ24gJiYgc2lnbilcbiAgICByZXR1cm4gMTtcblxuICBudW0gJj0gMHgzZmZmZmZmO1xuICB0aGlzLnN0cmlwKCk7XG5cbiAgdmFyIHJlcztcbiAgaWYgKHRoaXMubGVuZ3RoID4gMSkge1xuICAgIHJlcyA9IDE7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHcgPSB0aGlzLndvcmRzWzBdO1xuICAgIHJlcyA9IHcgPT09IG51bSA/IDAgOiB3IDwgbnVtID8gLTEgOiAxO1xuICB9XG4gIGlmICh0aGlzLnNpZ24pXG4gICAgcmVzID0gLXJlcztcbiAgcmV0dXJuIHJlcztcbn07XG5cbi8vIENvbXBhcmUgdHdvIG51bWJlcnMgYW5kIHJldHVybjpcbi8vIDEgLSBpZiBgdGhpc2AgPiBgbnVtYFxuLy8gMCAtIGlmIGB0aGlzYCA9PSBgbnVtYFxuLy8gLTEgLSBpZiBgdGhpc2AgPCBgbnVtYFxuQk4ucHJvdG90eXBlLmNtcCA9IGZ1bmN0aW9uIGNtcChudW0pIHtcbiAgaWYgKHRoaXMuc2lnbiAmJiAhbnVtLnNpZ24pXG4gICAgcmV0dXJuIC0xO1xuICBlbHNlIGlmICghdGhpcy5zaWduICYmIG51bS5zaWduKVxuICAgIHJldHVybiAxO1xuXG4gIHZhciByZXMgPSB0aGlzLnVjbXAobnVtKTtcbiAgaWYgKHRoaXMuc2lnbilcbiAgICByZXR1cm4gLXJlcztcbiAgZWxzZVxuICAgIHJldHVybiByZXM7XG59O1xuXG4vLyBVbnNpZ25lZCBjb21wYXJpc29uXG5CTi5wcm90b3R5cGUudWNtcCA9IGZ1bmN0aW9uIHVjbXAobnVtKSB7XG4gIC8vIEF0IHRoaXMgcG9pbnQgYm90aCBudW1iZXJzIGhhdmUgdGhlIHNhbWUgc2lnblxuICBpZiAodGhpcy5sZW5ndGggPiBudW0ubGVuZ3RoKVxuICAgIHJldHVybiAxO1xuICBlbHNlIGlmICh0aGlzLmxlbmd0aCA8IG51bS5sZW5ndGgpXG4gICAgcmV0dXJuIC0xO1xuXG4gIHZhciByZXMgPSAwO1xuICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBhID0gdGhpcy53b3Jkc1tpXTtcbiAgICB2YXIgYiA9IG51bS53b3Jkc1tpXTtcblxuICAgIGlmIChhID09PSBiKVxuICAgICAgY29udGludWU7XG4gICAgaWYgKGEgPCBiKVxuICAgICAgcmVzID0gLTE7XG4gICAgZWxzZSBpZiAoYSA+IGIpXG4gICAgICByZXMgPSAxO1xuICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuXG4vL1xuLy8gQSByZWR1Y2UgY29udGV4dCwgY291bGQgYmUgdXNpbmcgbW9udGdvbWVyeSBvciBzb21ldGhpbmcgYmV0dGVyLCBkZXBlbmRpbmdcbi8vIG9uIHRoZSBgbWAgaXRzZWxmLlxuLy9cbkJOLnJlZCA9IGZ1bmN0aW9uIHJlZChudW0pIHtcbiAgcmV0dXJuIG5ldyBSZWQobnVtKTtcbn07XG5cbkJOLnByb3RvdHlwZS50b1JlZCA9IGZ1bmN0aW9uIHRvUmVkKGN0eCkge1xuICBhc3NlcnQoIXRoaXMucmVkLCAnQWxyZWFkeSBhIG51bWJlciBpbiByZWR1Y3Rpb24gY29udGV4dCcpO1xuICBhc3NlcnQoIXRoaXMuc2lnbiwgJ3JlZCB3b3JrcyBvbmx5IHdpdGggcG9zaXRpdmVzJyk7XG4gIHJldHVybiBjdHguY29udmVydFRvKHRoaXMpLl9mb3JjZVJlZChjdHgpO1xufTtcblxuQk4ucHJvdG90eXBlLmZyb21SZWQgPSBmdW5jdGlvbiBmcm9tUmVkKCkge1xuICBhc3NlcnQodGhpcy5yZWQsICdmcm9tUmVkIHdvcmtzIG9ubHkgd2l0aCBudW1iZXJzIGluIHJlZHVjdGlvbiBjb250ZXh0Jyk7XG4gIHJldHVybiB0aGlzLnJlZC5jb252ZXJ0RnJvbSh0aGlzKTtcbn07XG5cbkJOLnByb3RvdHlwZS5fZm9yY2VSZWQgPSBmdW5jdGlvbiBfZm9yY2VSZWQoY3R4KSB7XG4gIHRoaXMucmVkID0gY3R4O1xuICByZXR1cm4gdGhpcztcbn07XG5cbkJOLnByb3RvdHlwZS5mb3JjZVJlZCA9IGZ1bmN0aW9uIGZvcmNlUmVkKGN0eCkge1xuICBhc3NlcnQoIXRoaXMucmVkLCAnQWxyZWFkeSBhIG51bWJlciBpbiByZWR1Y3Rpb24gY29udGV4dCcpO1xuICByZXR1cm4gdGhpcy5fZm9yY2VSZWQoY3R4KTtcbn07XG5cbkJOLnByb3RvdHlwZS5yZWRBZGQgPSBmdW5jdGlvbiByZWRBZGQobnVtKSB7XG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZEFkZCB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcbiAgcmV0dXJuIHRoaXMucmVkLmFkZCh0aGlzLCBudW0pO1xufTtcblxuQk4ucHJvdG90eXBlLnJlZElBZGQgPSBmdW5jdGlvbiByZWRJQWRkKG51bSkge1xuICBhc3NlcnQodGhpcy5yZWQsICdyZWRJQWRkIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xuICByZXR1cm4gdGhpcy5yZWQuaWFkZCh0aGlzLCBudW0pO1xufTtcblxuQk4ucHJvdG90eXBlLnJlZFN1YiA9IGZ1bmN0aW9uIHJlZFN1YihudW0pIHtcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkU3ViIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xuICByZXR1cm4gdGhpcy5yZWQuc3ViKHRoaXMsIG51bSk7XG59O1xuXG5CTi5wcm90b3R5cGUucmVkSVN1YiA9IGZ1bmN0aW9uIHJlZElTdWIobnVtKSB7XG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZElTdWIgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XG4gIHJldHVybiB0aGlzLnJlZC5pc3ViKHRoaXMsIG51bSk7XG59O1xuXG5CTi5wcm90b3R5cGUucmVkU2hsID0gZnVuY3Rpb24gcmVkU2hsKG51bSkge1xuICBhc3NlcnQodGhpcy5yZWQsICdyZWRTaGwgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XG4gIHJldHVybiB0aGlzLnJlZC5zaGwodGhpcywgbnVtKTtcbn07XG5cbkJOLnByb3RvdHlwZS5yZWRNdWwgPSBmdW5jdGlvbiByZWRNdWwobnVtKSB7XG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZE11bCB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcbiAgdGhpcy5yZWQuX3ZlcmlmeTIodGhpcywgbnVtKTtcbiAgcmV0dXJuIHRoaXMucmVkLm11bCh0aGlzLCBudW0pO1xufTtcblxuQk4ucHJvdG90eXBlLnJlZElNdWwgPSBmdW5jdGlvbiByZWRJTXVsKG51bSkge1xuICBhc3NlcnQodGhpcy5yZWQsICdyZWRNdWwgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XG4gIHRoaXMucmVkLl92ZXJpZnkyKHRoaXMsIG51bSk7XG4gIHJldHVybiB0aGlzLnJlZC5pbXVsKHRoaXMsIG51bSk7XG59O1xuXG5CTi5wcm90b3R5cGUucmVkU3FyID0gZnVuY3Rpb24gcmVkU3FyKCkge1xuICBhc3NlcnQodGhpcy5yZWQsICdyZWRTcXIgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XG4gIHRoaXMucmVkLl92ZXJpZnkxKHRoaXMpO1xuICByZXR1cm4gdGhpcy5yZWQuc3FyKHRoaXMpO1xufTtcblxuQk4ucHJvdG90eXBlLnJlZElTcXIgPSBmdW5jdGlvbiByZWRJU3FyKCkge1xuICBhc3NlcnQodGhpcy5yZWQsICdyZWRJU3FyIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xuICB0aGlzLnJlZC5fdmVyaWZ5MSh0aGlzKTtcbiAgcmV0dXJuIHRoaXMucmVkLmlzcXIodGhpcyk7XG59O1xuXG4vLyBTcXVhcmUgcm9vdCBvdmVyIHBcbkJOLnByb3RvdHlwZS5yZWRTcXJ0ID0gZnVuY3Rpb24gcmVkU3FydCgpIHtcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkU3FydCB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcbiAgdGhpcy5yZWQuX3ZlcmlmeTEodGhpcyk7XG4gIHJldHVybiB0aGlzLnJlZC5zcXJ0KHRoaXMpO1xufTtcblxuQk4ucHJvdG90eXBlLnJlZEludm0gPSBmdW5jdGlvbiByZWRJbnZtKCkge1xuICBhc3NlcnQodGhpcy5yZWQsICdyZWRJbnZtIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xuICB0aGlzLnJlZC5fdmVyaWZ5MSh0aGlzKTtcbiAgcmV0dXJuIHRoaXMucmVkLmludm0odGhpcyk7XG59O1xuXG4vLyBSZXR1cm4gbmVnYXRpdmUgY2xvbmUgb2YgYHRoaXNgICUgYHJlZCBtb2R1bG9gXG5CTi5wcm90b3R5cGUucmVkTmVnID0gZnVuY3Rpb24gcmVkTmVnKCkge1xuICBhc3NlcnQodGhpcy5yZWQsICdyZWROZWcgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XG4gIHRoaXMucmVkLl92ZXJpZnkxKHRoaXMpO1xuICByZXR1cm4gdGhpcy5yZWQubmVnKHRoaXMpO1xufTtcblxuQk4ucHJvdG90eXBlLnJlZFBvdyA9IGZ1bmN0aW9uIHJlZFBvdyhudW0pIHtcbiAgYXNzZXJ0KHRoaXMucmVkICYmICFudW0ucmVkLCAncmVkUG93KG5vcm1hbE51bSknKTtcbiAgdGhpcy5yZWQuX3ZlcmlmeTEodGhpcyk7XG4gIHJldHVybiB0aGlzLnJlZC5wb3codGhpcywgbnVtKTtcbn07XG5cbi8vIFByaW1lIG51bWJlcnMgd2l0aCBlZmZpY2llbnQgcmVkdWN0aW9uXG52YXIgcHJpbWVzID0ge1xuICBrMjU2OiBudWxsLFxuICBwMjI0OiBudWxsLFxuICBwMTkyOiBudWxsLFxuICBwMjU1MTk6IG51bGxcbn07XG5cbi8vIFBzZXVkby1NZXJzZW5uZSBwcmltZVxuZnVuY3Rpb24gTVByaW1lKG5hbWUsIHApIHtcbiAgLy8gUCA9IDIgXiBOIC0gS1xuICB0aGlzLm5hbWUgPSBuYW1lO1xuICB0aGlzLnAgPSBuZXcgQk4ocCwgMTYpO1xuICB0aGlzLm4gPSB0aGlzLnAuYml0TGVuZ3RoKCk7XG4gIHRoaXMuayA9IG5ldyBCTigxKS5pc2hsbih0aGlzLm4pLmlzdWIodGhpcy5wKTtcblxuICB0aGlzLnRtcCA9IHRoaXMuX3RtcCgpO1xufVxuXG5NUHJpbWUucHJvdG90eXBlLl90bXAgPSBmdW5jdGlvbiBfdG1wKCkge1xuICB2YXIgdG1wID0gbmV3IEJOKG51bGwpO1xuICB0bXAud29yZHMgPSBuZXcgQXJyYXkoTWF0aC5jZWlsKHRoaXMubiAvIDEzKSk7XG4gIHJldHVybiB0bXA7XG59O1xuXG5NUHJpbWUucHJvdG90eXBlLmlyZWR1Y2UgPSBmdW5jdGlvbiBpcmVkdWNlKG51bSkge1xuICAvLyBBc3N1bWVzIHRoYXQgYG51bWAgaXMgbGVzcyB0aGFuIGBQXjJgXG4gIC8vIG51bSA9IEhJICogKDIgXiBOIC0gSykgKyBISSAqIEsgKyBMTyA9IEhJICogSyArIExPIChtb2QgUClcbiAgdmFyIHIgPSBudW07XG4gIHZhciBybGVuO1xuXG4gIGRvIHtcbiAgICB0aGlzLnNwbGl0KHIsIHRoaXMudG1wKTtcbiAgICByID0gdGhpcy5pbXVsSyhyKTtcbiAgICByID0gci5pYWRkKHRoaXMudG1wKTtcbiAgICBybGVuID0gci5iaXRMZW5ndGgoKTtcbiAgfSB3aGlsZSAocmxlbiA+IHRoaXMubik7XG5cbiAgdmFyIGNtcCA9IHJsZW4gPCB0aGlzLm4gPyAtMSA6IHIudWNtcCh0aGlzLnApO1xuICBpZiAoY21wID09PSAwKSB7XG4gICAgci53b3Jkc1swXSA9IDA7XG4gICAgci5sZW5ndGggPSAxO1xuICB9IGVsc2UgaWYgKGNtcCA+IDApIHtcbiAgICByLmlzdWIodGhpcy5wKTtcbiAgfSBlbHNlIHtcbiAgICByLnN0cmlwKCk7XG4gIH1cblxuICByZXR1cm4gcjtcbn07XG5cbk1QcmltZS5wcm90b3R5cGUuc3BsaXQgPSBmdW5jdGlvbiBzcGxpdChpbnB1dCwgb3V0KSB7XG4gIGlucHV0LmlzaHJuKHRoaXMubiwgMCwgb3V0KTtcbn07XG5cbk1QcmltZS5wcm90b3R5cGUuaW11bEsgPSBmdW5jdGlvbiBpbXVsSyhudW0pIHtcbiAgcmV0dXJuIG51bS5pbXVsKHRoaXMuayk7XG59O1xuXG5mdW5jdGlvbiBLMjU2KCkge1xuICBNUHJpbWUuY2FsbChcbiAgICB0aGlzLFxuICAgICdrMjU2JyxcbiAgICAnZmZmZmZmZmYgZmZmZmZmZmYgZmZmZmZmZmYgZmZmZmZmZmYgZmZmZmZmZmYgZmZmZmZmZmYgZmZmZmZmZmUgZmZmZmZjMmYnKTtcbn1cbmluaGVyaXRzKEsyNTYsIE1QcmltZSk7XG5cbksyNTYucHJvdG90eXBlLnNwbGl0ID0gZnVuY3Rpb24gc3BsaXQoaW5wdXQsIG91dHB1dCkge1xuICAvLyAyNTYgPSA5ICogMjYgKyAyMlxuICB2YXIgbWFzayA9IDB4M2ZmZmZmO1xuXG4gIHZhciBvdXRMZW4gPSBNYXRoLm1pbihpbnB1dC5sZW5ndGgsIDkpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG91dExlbjsgaSsrKVxuICAgIG91dHB1dC53b3Jkc1tpXSA9IGlucHV0LndvcmRzW2ldO1xuICBvdXRwdXQubGVuZ3RoID0gb3V0TGVuO1xuXG4gIGlmIChpbnB1dC5sZW5ndGggPD0gOSkge1xuICAgIGlucHV0LndvcmRzWzBdID0gMDtcbiAgICBpbnB1dC5sZW5ndGggPSAxO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFNoaWZ0IGJ5IDkgbGltYnNcbiAgdmFyIHByZXYgPSBpbnB1dC53b3Jkc1s5XTtcbiAgb3V0cHV0LndvcmRzW291dHB1dC5sZW5ndGgrK10gPSBwcmV2ICYgbWFzaztcblxuICBmb3IgKHZhciBpID0gMTA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBuZXh0ID0gaW5wdXQud29yZHNbaV07XG4gICAgaW5wdXQud29yZHNbaSAtIDEwXSA9ICgobmV4dCAmIG1hc2spIDw8IDQpIHwgKHByZXYgPj4+IDIyKTtcbiAgICBwcmV2ID0gbmV4dDtcbiAgfVxuICBpbnB1dC53b3Jkc1tpIC0gMTBdID0gcHJldiA+Pj4gMjI7XG4gIGlucHV0Lmxlbmd0aCAtPSA5O1xufTtcblxuSzI1Ni5wcm90b3R5cGUuaW11bEsgPSBmdW5jdGlvbiBpbXVsSyhudW0pIHtcbiAgLy8gSyA9IDB4MTAwMDAwM2QxID0gWyAweDQwLCAweDNkMSBdXG4gIG51bS53b3Jkc1tudW0ubGVuZ3RoXSA9IDA7XG4gIG51bS53b3Jkc1tudW0ubGVuZ3RoICsgMV0gPSAwO1xuICBudW0ubGVuZ3RoICs9IDI7XG5cbiAgLy8gYm91bmRlZCBhdDogMHg0MCAqIDB4M2ZmZmZmZiArIDB4M2QwID0gMHgxMDAwMDAzOTBcbiAgdmFyIGhpO1xuICB2YXIgbG8gPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bS5sZW5ndGg7IGkrKykge1xuICAgIHZhciB3ID0gbnVtLndvcmRzW2ldO1xuICAgIGhpID0gdyAqIDB4NDA7XG4gICAgbG8gKz0gdyAqIDB4M2QxO1xuICAgIGhpICs9IChsbyAvIDB4NDAwMDAwMCkgfCAwO1xuICAgIGxvICY9IDB4M2ZmZmZmZjtcblxuICAgIG51bS53b3Jkc1tpXSA9IGxvO1xuXG4gICAgbG8gPSBoaTtcbiAgfVxuXG4gIC8vIEZhc3QgbGVuZ3RoIHJlZHVjdGlvblxuICBpZiAobnVtLndvcmRzW251bS5sZW5ndGggLSAxXSA9PT0gMCkge1xuICAgIG51bS5sZW5ndGgtLTtcbiAgICBpZiAobnVtLndvcmRzW251bS5sZW5ndGggLSAxXSA9PT0gMClcbiAgICAgIG51bS5sZW5ndGgtLTtcbiAgfVxuICByZXR1cm4gbnVtO1xufTtcblxuZnVuY3Rpb24gUDIyNCgpIHtcbiAgTVByaW1lLmNhbGwoXG4gICAgdGhpcyxcbiAgICAncDIyNCcsXG4gICAgJ2ZmZmZmZmZmIGZmZmZmZmZmIGZmZmZmZmZmIGZmZmZmZmZmIDAwMDAwMDAwIDAwMDAwMDAwIDAwMDAwMDAxJyk7XG59XG5pbmhlcml0cyhQMjI0LCBNUHJpbWUpO1xuXG5mdW5jdGlvbiBQMTkyKCkge1xuICBNUHJpbWUuY2FsbChcbiAgICB0aGlzLFxuICAgICdwMTkyJyxcbiAgICAnZmZmZmZmZmYgZmZmZmZmZmYgZmZmZmZmZmYgZmZmZmZmZmUgZmZmZmZmZmYgZmZmZmZmZmYnKTtcbn1cbmluaGVyaXRzKFAxOTIsIE1QcmltZSk7XG5cbmZ1bmN0aW9uIFAyNTUxOSgpIHtcbiAgLy8gMiBeIDI1NSAtIDE5XG4gIE1QcmltZS5jYWxsKFxuICAgIHRoaXMsXG4gICAgJzI1NTE5JyxcbiAgICAnN2ZmZmZmZmZmZmZmZmZmZiBmZmZmZmZmZmZmZmZmZmZmIGZmZmZmZmZmZmZmZmZmZmYgZmZmZmZmZmZmZmZmZmZlZCcpO1xufVxuaW5oZXJpdHMoUDI1NTE5LCBNUHJpbWUpO1xuXG5QMjU1MTkucHJvdG90eXBlLmltdWxLID0gZnVuY3Rpb24gaW11bEsobnVtKSB7XG4gIC8vIEsgPSAweDEzXG4gIHZhciBjYXJyeSA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGhpID0gbnVtLndvcmRzW2ldICogMHgxMyArIGNhcnJ5O1xuICAgIHZhciBsbyA9IGhpICYgMHgzZmZmZmZmO1xuICAgIGhpID4+Pj0gMjY7XG5cbiAgICBudW0ud29yZHNbaV0gPSBsbztcbiAgICBjYXJyeSA9IGhpO1xuICB9XG4gIGlmIChjYXJyeSAhPT0gMClcbiAgICBudW0ud29yZHNbbnVtLmxlbmd0aCsrXSA9IGNhcnJ5O1xuICByZXR1cm4gbnVtO1xufTtcblxuLy8gRXhwb3J0ZWQgbW9zdGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzLCB1c2UgcGxhaW4gbmFtZSBpbnN0ZWFkXG5CTi5fcHJpbWUgPSBmdW5jdGlvbiBwcmltZShuYW1lKSB7XG4gIC8vIENhY2hlZCB2ZXJzaW9uIG9mIHByaW1lXG4gIGlmIChwcmltZXNbbmFtZV0pXG4gICAgcmV0dXJuIHByaW1lc1tuYW1lXTtcblxuICB2YXIgcHJpbWU7XG4gIGlmIChuYW1lID09PSAnazI1NicpXG4gICAgcHJpbWUgPSBuZXcgSzI1NigpO1xuICBlbHNlIGlmIChuYW1lID09PSAncDIyNCcpXG4gICAgcHJpbWUgPSBuZXcgUDIyNCgpO1xuICBlbHNlIGlmIChuYW1lID09PSAncDE5MicpXG4gICAgcHJpbWUgPSBuZXcgUDE5MigpO1xuICBlbHNlIGlmIChuYW1lID09PSAncDI1NTE5JylcbiAgICBwcmltZSA9IG5ldyBQMjU1MTkoKTtcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBwcmltZSAnICsgbmFtZSk7XG4gIHByaW1lc1tuYW1lXSA9IHByaW1lO1xuXG4gIHJldHVybiBwcmltZTtcbn07XG5cbi8vXG4vLyBCYXNlIHJlZHVjdGlvbiBlbmdpbmVcbi8vXG5mdW5jdGlvbiBSZWQobSkge1xuICBpZiAodHlwZW9mIG0gPT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIHByaW1lID0gQk4uX3ByaW1lKG0pO1xuICAgIHRoaXMubSA9IHByaW1lLnA7XG4gICAgdGhpcy5wcmltZSA9IHByaW1lO1xuICB9IGVsc2Uge1xuICAgIHRoaXMubSA9IG07XG4gICAgdGhpcy5wcmltZSA9IG51bGw7XG4gIH1cbn1cblxuUmVkLnByb3RvdHlwZS5fdmVyaWZ5MSA9IGZ1bmN0aW9uIF92ZXJpZnkxKGEpIHtcbiAgYXNzZXJ0KCFhLnNpZ24sICdyZWQgd29ya3Mgb25seSB3aXRoIHBvc2l0aXZlcycpO1xuICBhc3NlcnQoYS5yZWQsICdyZWQgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XG59O1xuXG5SZWQucHJvdG90eXBlLl92ZXJpZnkyID0gZnVuY3Rpb24gX3ZlcmlmeTIoYSwgYikge1xuICBhc3NlcnQoIWEuc2lnbiAmJiAhYi5zaWduLCAncmVkIHdvcmtzIG9ubHkgd2l0aCBwb3NpdGl2ZXMnKTtcbiAgYXNzZXJ0KGEucmVkICYmIGEucmVkID09PSBiLnJlZCxcbiAgICAgICAgICdyZWQgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XG59O1xuXG5SZWQucHJvdG90eXBlLmltb2QgPSBmdW5jdGlvbiBpbW9kKGEpIHtcbiAgaWYgKHRoaXMucHJpbWUpXG4gICAgcmV0dXJuIHRoaXMucHJpbWUuaXJlZHVjZShhKS5fZm9yY2VSZWQodGhpcyk7XG4gIHJldHVybiBhLm1vZCh0aGlzLm0pLl9mb3JjZVJlZCh0aGlzKTtcbn07XG5cblJlZC5wcm90b3R5cGUubmVnID0gZnVuY3Rpb24gbmVnKGEpIHtcbiAgdmFyIHIgPSBhLmNsb25lKCk7XG4gIHIuc2lnbiA9ICFyLnNpZ247XG4gIHJldHVybiByLmlhZGQodGhpcy5tKS5fZm9yY2VSZWQodGhpcyk7XG59O1xuXG5SZWQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZChhLCBiKSB7XG4gIHRoaXMuX3ZlcmlmeTIoYSwgYik7XG5cbiAgdmFyIHJlcyA9IGEuYWRkKGIpO1xuICBpZiAocmVzLmNtcCh0aGlzLm0pID49IDApXG4gICAgcmVzLmlzdWIodGhpcy5tKTtcbiAgcmV0dXJuIHJlcy5fZm9yY2VSZWQodGhpcyk7XG59O1xuXG5SZWQucHJvdG90eXBlLmlhZGQgPSBmdW5jdGlvbiBpYWRkKGEsIGIpIHtcbiAgdGhpcy5fdmVyaWZ5MihhLCBiKTtcblxuICB2YXIgcmVzID0gYS5pYWRkKGIpO1xuICBpZiAocmVzLmNtcCh0aGlzLm0pID49IDApXG4gICAgcmVzLmlzdWIodGhpcy5tKTtcbiAgcmV0dXJuIHJlcztcbn07XG5cblJlZC5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24gc3ViKGEsIGIpIHtcbiAgdGhpcy5fdmVyaWZ5MihhLCBiKTtcblxuICB2YXIgcmVzID0gYS5zdWIoYik7XG4gIGlmIChyZXMuY21wbigwKSA8IDApXG4gICAgcmVzLmlhZGQodGhpcy5tKTtcbiAgcmV0dXJuIHJlcy5fZm9yY2VSZWQodGhpcyk7XG59O1xuXG5SZWQucHJvdG90eXBlLmlzdWIgPSBmdW5jdGlvbiBpc3ViKGEsIGIpIHtcbiAgdGhpcy5fdmVyaWZ5MihhLCBiKTtcblxuICB2YXIgcmVzID0gYS5pc3ViKGIpO1xuICBpZiAocmVzLmNtcG4oMCkgPCAwKVxuICAgIHJlcy5pYWRkKHRoaXMubSk7XG4gIHJldHVybiByZXM7XG59O1xuXG5SZWQucHJvdG90eXBlLnNobCA9IGZ1bmN0aW9uIHNobChhLCBudW0pIHtcbiAgdGhpcy5fdmVyaWZ5MShhKTtcbiAgcmV0dXJuIHRoaXMuaW1vZChhLnNobG4obnVtKSk7XG59O1xuXG5SZWQucHJvdG90eXBlLmltdWwgPSBmdW5jdGlvbiBpbXVsKGEsIGIpIHtcbiAgdGhpcy5fdmVyaWZ5MihhLCBiKTtcbiAgcmV0dXJuIHRoaXMuaW1vZChhLmltdWwoYikpO1xufTtcblxuUmVkLnByb3RvdHlwZS5tdWwgPSBmdW5jdGlvbiBtdWwoYSwgYikge1xuICB0aGlzLl92ZXJpZnkyKGEsIGIpO1xuICByZXR1cm4gdGhpcy5pbW9kKGEubXVsKGIpKTtcbn07XG5cblJlZC5wcm90b3R5cGUuaXNxciA9IGZ1bmN0aW9uIGlzcXIoYSkge1xuICByZXR1cm4gdGhpcy5pbXVsKGEsIGEpO1xufTtcblxuUmVkLnByb3RvdHlwZS5zcXIgPSBmdW5jdGlvbiBzcXIoYSkge1xuICByZXR1cm4gdGhpcy5tdWwoYSwgYSk7XG59O1xuXG5SZWQucHJvdG90eXBlLnNxcnQgPSBmdW5jdGlvbiBzcXJ0KGEpIHtcbiAgaWYgKGEuY21wbigwKSA9PT0gMClcbiAgICByZXR1cm4gYS5jbG9uZSgpO1xuXG4gIHZhciBtb2QzID0gdGhpcy5tLmFuZGxuKDMpO1xuICBhc3NlcnQobW9kMyAlIDIgPT09IDEpO1xuXG4gIC8vIEZhc3QgY2FzZVxuICBpZiAobW9kMyA9PT0gMykge1xuICAgIHZhciBwb3cgPSB0aGlzLm0uYWRkKG5ldyBCTigxKSkuaXNocm4oMik7XG4gICAgdmFyIHIgPSB0aGlzLnBvdyhhLCBwb3cpO1xuICAgIHJldHVybiByO1xuICB9XG5cbiAgLy8gVG9uZWxsaS1TaGFua3MgYWxnb3JpdGhtIChUb3RhbGx5IHVub3B0aW1pemVkIGFuZCBzbG93KVxuICAvL1xuICAvLyBGaW5kIFEgYW5kIFMsIHRoYXQgUSAqIDIgXiBTID0gKFAgLSAxKVxuICB2YXIgcSA9IHRoaXMubS5zdWJuKDEpO1xuICB2YXIgcyA9IDA7XG4gIHdoaWxlIChxLmNtcG4oMCkgIT09IDAgJiYgcS5hbmRsbigxKSA9PT0gMCkge1xuICAgIHMrKztcbiAgICBxLmlzaHJuKDEpO1xuICB9XG4gIGFzc2VydChxLmNtcG4oMCkgIT09IDApO1xuXG4gIHZhciBvbmUgPSBuZXcgQk4oMSkudG9SZWQodGhpcyk7XG4gIHZhciBuT25lID0gb25lLnJlZE5lZygpO1xuXG4gIC8vIEZpbmQgcXVhZHJhdGljIG5vbi1yZXNpZHVlXG4gIC8vIE5PVEU6IE1heCBpcyBzdWNoIGJlY2F1c2Ugb2YgZ2VuZXJhbGl6ZWQgUmllbWFubiBoeXBvdGhlc2lzLlxuICB2YXIgbHBvdyA9IHRoaXMubS5zdWJuKDEpLmlzaHJuKDEpO1xuICB2YXIgeiA9IHRoaXMubS5iaXRMZW5ndGgoKTtcbiAgeiA9IG5ldyBCTigyICogeiAqIHopLnRvUmVkKHRoaXMpO1xuICB3aGlsZSAodGhpcy5wb3coeiwgbHBvdykuY21wKG5PbmUpICE9PSAwKVxuICAgIHoucmVkSUFkZChuT25lKTtcblxuICB2YXIgYyA9IHRoaXMucG93KHosIHEpO1xuICB2YXIgciA9IHRoaXMucG93KGEsIHEuYWRkbigxKS5pc2hybigxKSk7XG4gIHZhciB0ID0gdGhpcy5wb3coYSwgcSk7XG4gIHZhciBtID0gcztcbiAgd2hpbGUgKHQuY21wKG9uZSkgIT09IDApIHtcbiAgICB2YXIgdG1wID0gdDtcbiAgICBmb3IgKHZhciBpID0gMDsgdG1wLmNtcChvbmUpICE9PSAwOyBpKyspXG4gICAgICB0bXAgPSB0bXAucmVkU3FyKCk7XG4gICAgYXNzZXJ0KGkgPCBtKTtcbiAgICB2YXIgYiA9IHRoaXMucG93KGMsIG5ldyBCTigxKS5pc2hsbihtIC0gaSAtIDEpKTtcblxuICAgIHIgPSByLnJlZE11bChiKTtcbiAgICBjID0gYi5yZWRTcXIoKTtcbiAgICB0ID0gdC5yZWRNdWwoYyk7XG4gICAgbSA9IGk7XG4gIH1cblxuICByZXR1cm4gcjtcbn07XG5cblJlZC5wcm90b3R5cGUuaW52bSA9IGZ1bmN0aW9uIGludm0oYSkge1xuICB2YXIgaW52ID0gYS5faW52bXAodGhpcy5tKTtcbiAgaWYgKGludi5zaWduKSB7XG4gICAgaW52LnNpZ24gPSBmYWxzZTtcbiAgICByZXR1cm4gdGhpcy5pbW9kKGludikucmVkTmVnKCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMuaW1vZChpbnYpO1xuICB9XG59O1xuXG5SZWQucHJvdG90eXBlLnBvdyA9IGZ1bmN0aW9uIHBvdyhhLCBudW0pIHtcbiAgdmFyIHcgPSBbXTtcblxuICBpZiAobnVtLmNtcG4oMCkgPT09IDApXG4gICAgcmV0dXJuIG5ldyBCTigxKTtcblxuICB2YXIgcSA9IG51bS5jbG9uZSgpO1xuXG4gIHdoaWxlIChxLmNtcG4oMCkgIT09IDApIHtcbiAgICB3LnB1c2gocS5hbmRsbigxKSk7XG4gICAgcS5pc2hybigxKTtcbiAgfVxuXG4gIC8vIFNraXAgbGVhZGluZyB6ZXJvZXNcbiAgdmFyIHJlcyA9IGE7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdy5sZW5ndGg7IGkrKywgcmVzID0gdGhpcy5zcXIocmVzKSlcbiAgICBpZiAod1tpXSAhPT0gMClcbiAgICAgIGJyZWFrO1xuXG4gIGlmICgrK2kgPCB3Lmxlbmd0aCkge1xuICAgIGZvciAodmFyIHEgPSB0aGlzLnNxcihyZXMpOyBpIDwgdy5sZW5ndGg7IGkrKywgcSA9IHRoaXMuc3FyKHEpKSB7XG4gICAgICBpZiAod1tpXSA9PT0gMClcbiAgICAgICAgY29udGludWU7XG4gICAgICByZXMgPSB0aGlzLm11bChyZXMsIHEpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXM7XG59O1xuXG5SZWQucHJvdG90eXBlLmNvbnZlcnRUbyA9IGZ1bmN0aW9uIGNvbnZlcnRUbyhudW0pIHtcbiAgdmFyIHIgPSBudW0ubW9kKHRoaXMubSk7XG4gIGlmIChyID09PSBudW0pXG4gICAgcmV0dXJuIHIuY2xvbmUoKTtcbiAgZWxzZVxuICAgIHJldHVybiByO1xufTtcblxuUmVkLnByb3RvdHlwZS5jb252ZXJ0RnJvbSA9IGZ1bmN0aW9uIGNvbnZlcnRGcm9tKG51bSkge1xuICB2YXIgcmVzID0gbnVtLmNsb25lKCk7XG4gIHJlcy5yZWQgPSBudWxsO1xuICByZXR1cm4gcmVzO1xufTtcblxuLy9cbi8vIE1vbnRnb21lcnkgbWV0aG9kIGVuZ2luZVxuLy9cblxuQk4ubW9udCA9IGZ1bmN0aW9uIG1vbnQobnVtKSB7XG4gIHJldHVybiBuZXcgTW9udChudW0pO1xufTtcblxuZnVuY3Rpb24gTW9udChtKSB7XG4gIFJlZC5jYWxsKHRoaXMsIG0pO1xuXG4gIHRoaXMuc2hpZnQgPSB0aGlzLm0uYml0TGVuZ3RoKCk7XG4gIGlmICh0aGlzLnNoaWZ0ICUgMjYgIT09IDApXG4gICAgdGhpcy5zaGlmdCArPSAyNiAtICh0aGlzLnNoaWZ0ICUgMjYpO1xuICB0aGlzLnIgPSBuZXcgQk4oMSkuaXNobG4odGhpcy5zaGlmdCk7XG4gIHRoaXMucjIgPSB0aGlzLmltb2QodGhpcy5yLnNxcigpKTtcbiAgdGhpcy5yaW52ID0gdGhpcy5yLl9pbnZtcCh0aGlzLm0pO1xuXG4gIHRoaXMubWludiA9IHRoaXMucmludi5tdWwodGhpcy5yKS5pc3VibigxKS5kaXYodGhpcy5tKTtcbiAgdGhpcy5taW52LnNpZ24gPSB0cnVlO1xuICB0aGlzLm1pbnYgPSB0aGlzLm1pbnYubW9kKHRoaXMucik7XG59XG5pbmhlcml0cyhNb250LCBSZWQpO1xuXG5Nb250LnByb3RvdHlwZS5jb252ZXJ0VG8gPSBmdW5jdGlvbiBjb252ZXJ0VG8obnVtKSB7XG4gIHJldHVybiB0aGlzLmltb2QobnVtLnNobG4odGhpcy5zaGlmdCkpO1xufTtcblxuTW9udC5wcm90b3R5cGUuY29udmVydEZyb20gPSBmdW5jdGlvbiBjb252ZXJ0RnJvbShudW0pIHtcbiAgdmFyIHIgPSB0aGlzLmltb2QobnVtLm11bCh0aGlzLnJpbnYpKTtcbiAgci5yZWQgPSBudWxsO1xuICByZXR1cm4gcjtcbn07XG5cbk1vbnQucHJvdG90eXBlLmltdWwgPSBmdW5jdGlvbiBpbXVsKGEsIGIpIHtcbiAgaWYgKGEuY21wbigwKSA9PT0gMCB8fCBiLmNtcG4oMCkgPT09IDApIHtcbiAgICBhLndvcmRzWzBdID0gMDtcbiAgICBhLmxlbmd0aCA9IDE7XG4gICAgcmV0dXJuIGE7XG4gIH1cblxuICB2YXIgdCA9IGEuaW11bChiKTtcbiAgdmFyIGMgPSB0Lm1hc2tuKHRoaXMuc2hpZnQpLm11bCh0aGlzLm1pbnYpLmltYXNrbih0aGlzLnNoaWZ0KS5tdWwodGhpcy5tKTtcbiAgdmFyIHUgPSB0LmlzdWIoYykuaXNocm4odGhpcy5zaGlmdCk7XG4gIHZhciByZXMgPSB1O1xuICBpZiAodS5jbXAodGhpcy5tKSA+PSAwKVxuICAgIHJlcyA9IHUuaXN1Yih0aGlzLm0pO1xuICBlbHNlIGlmICh1LmNtcG4oMCkgPCAwKVxuICAgIHJlcyA9IHUuaWFkZCh0aGlzLm0pO1xuXG4gIHJldHVybiByZXMuX2ZvcmNlUmVkKHRoaXMpO1xufTtcblxuTW9udC5wcm90b3R5cGUubXVsID0gZnVuY3Rpb24gbXVsKGEsIGIpIHtcbiAgaWYgKGEuY21wbigwKSA9PT0gMCB8fCBiLmNtcG4oMCkgPT09IDApXG4gICAgcmV0dXJuIG5ldyBCTigwKS5fZm9yY2VSZWQodGhpcyk7XG5cbiAgdmFyIHQgPSBhLm11bChiKTtcbiAgdmFyIGMgPSB0Lm1hc2tuKHRoaXMuc2hpZnQpLm11bCh0aGlzLm1pbnYpLmltYXNrbih0aGlzLnNoaWZ0KS5tdWwodGhpcy5tKTtcbiAgdmFyIHUgPSB0LmlzdWIoYykuaXNocm4odGhpcy5zaGlmdCk7XG4gIHZhciByZXMgPSB1O1xuICBpZiAodS5jbXAodGhpcy5tKSA+PSAwKVxuICAgIHJlcyA9IHUuaXN1Yih0aGlzLm0pO1xuICBlbHNlIGlmICh1LmNtcG4oMCkgPCAwKVxuICAgIHJlcyA9IHUuaWFkZCh0aGlzLm0pO1xuXG4gIHJldHVybiByZXMuX2ZvcmNlUmVkKHRoaXMpO1xufTtcblxuTW9udC5wcm90b3R5cGUuaW52bSA9IGZ1bmN0aW9uIGludm0oYSkge1xuICAvLyAoQVIpXi0xICogUl4yID0gKEFeLTEgKiBSXi0xKSAqIFJeMiA9IEFeLTEgKiBSXG4gIHZhciByZXMgPSB0aGlzLmltb2QoYS5faW52bXAodGhpcy5tKS5tdWwodGhpcy5yMikpO1xuICByZXR1cm4gcmVzLl9mb3JjZVJlZCh0aGlzKTtcbn07XG5cbn0pKHR5cGVvZiBtb2R1bGUgPT09ICd1bmRlZmluZWQnIHx8IG1vZHVsZSwgdGhpcyk7XG4iLCJ2YXIgY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG5cbmV4cG9ydHMudGFnQ2xhc3MgPSB7XG4gIDA6ICd1bml2ZXJzYWwnLFxuICAxOiAnYXBwbGljYXRpb24nLFxuICAyOiAnY29udGV4dCcsXG4gIDM6ICdwcml2YXRlJ1xufTtcbmV4cG9ydHMudGFnQ2xhc3NCeU5hbWUgPSBjb25zdGFudHMuX3JldmVyc2UoZXhwb3J0cy50YWdDbGFzcyk7XG5cbmV4cG9ydHMudGFnID0ge1xuICAweDAwOiAnZW5kJyxcbiAgMHgwMTogJ2Jvb2wnLFxuICAweDAyOiAnaW50JyxcbiAgMHgwMzogJ2JpdHN0cicsXG4gIDB4MDQ6ICdvY3RzdHInLFxuICAweDA1OiAnbnVsbF8nLFxuICAweDA2OiAnb2JqaWQnLFxuICAweDA3OiAnb2JqRGVzYycsXG4gIDB4MDg6ICdleHRlcm5hbCcsXG4gIDB4MDk6ICdyZWFsJyxcbiAgMHgwYTogJ2VudW0nLFxuICAweDBiOiAnZW1iZWQnLFxuICAweDBjOiAndXRmOHN0cicsXG4gIDB4MGQ6ICdyZWxhdGl2ZU9pZCcsXG4gIDB4MTA6ICdzZXEnLFxuICAweDExOiAnc2V0JyxcbiAgMHgxMjogJ251bXN0cicsXG4gIDB4MTM6ICdwcmludHN0cicsXG4gIDB4MTQ6ICd0NjFzdHInLFxuICAweDE1OiAndmlkZW9zdHInLFxuICAweDE2OiAnaWE1c3RyJyxcbiAgMHgxNzogJ3V0Y3RpbWUnLFxuICAweDE4OiAnZ2VudGltZScsXG4gIDB4MTk6ICdncmFwaHN0cicsXG4gIDB4MWE6ICdpc282NDZzdHInLFxuICAweDFiOiAnZ2Vuc3RyJyxcbiAgMHgxYzogJ3VuaXN0cicsXG4gIDB4MWQ6ICdjaGFyc3RyJyxcbiAgMHgxZTogJ2JtcHN0cidcbn07XG5leHBvcnRzLnRhZ0J5TmFtZSA9IGNvbnN0YW50cy5fcmV2ZXJzZShleHBvcnRzLnRhZyk7XG4iLCJ2YXIgY29uc3RhbnRzID0gZXhwb3J0cztcblxuLy8gSGVscGVyXG5jb25zdGFudHMuX3JldmVyc2UgPSBmdW5jdGlvbiByZXZlcnNlKG1hcCkge1xuICB2YXIgcmVzID0ge307XG5cbiAgT2JqZWN0LmtleXMobWFwKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIC8vIENvbnZlcnQga2V5IHRvIGludGVnZXIgaWYgaXQgaXMgc3RyaW5naWZpZWRcbiAgICBpZiAoKGtleSB8IDApID09IGtleSlcbiAgICAgIGtleSA9IGtleSB8IDA7XG5cbiAgICB2YXIgdmFsdWUgPSBtYXBba2V5XTtcbiAgICByZXNbdmFsdWVdID0ga2V5O1xuICB9KTtcblxuICByZXR1cm4gcmVzO1xufTtcblxuY29uc3RhbnRzLmRlciA9IHJlcXVpcmUoJy4vZGVyJyk7XG4iLCJ2YXIgaW5oZXJpdHMgPSByZXF1aXJlKCd1dGlsJykuaW5oZXJpdHM7XG5cbnZhciBhc24xID0gcmVxdWlyZSgnLi4vYXNuMScpO1xudmFyIGJhc2UgPSBhc24xLmJhc2U7XG52YXIgYmlnbnVtID0gYXNuMS5iaWdudW07XG5cbi8vIEltcG9ydCBERVIgY29uc3RhbnRzXG52YXIgZGVyID0gYXNuMS5jb25zdGFudHMuZGVyO1xuXG5mdW5jdGlvbiBERVJEZWNvZGVyKGVudGl0eSkge1xuICB0aGlzLmVuYyA9ICdkZXInO1xuICB0aGlzLm5hbWUgPSBlbnRpdHkubmFtZTtcbiAgdGhpcy5lbnRpdHkgPSBlbnRpdHk7XG5cbiAgLy8gQ29uc3RydWN0IGJhc2UgdHJlZVxuICB0aGlzLnRyZWUgPSBuZXcgREVSTm9kZSgpO1xuICB0aGlzLnRyZWUuX2luaXQoZW50aXR5LmJvZHkpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gREVSRGVjb2RlcjtcblxuREVSRGVjb2Rlci5wcm90b3R5cGUuZGVjb2RlID0gZnVuY3Rpb24gZGVjb2RlKGRhdGEsIG9wdGlvbnMpIHtcbiAgaWYgKCEoZGF0YSBpbnN0YW5jZW9mIGJhc2UuRGVjb2RlckJ1ZmZlcikpXG4gICAgZGF0YSA9IG5ldyBiYXNlLkRlY29kZXJCdWZmZXIoZGF0YSwgb3B0aW9ucyk7XG5cbiAgcmV0dXJuIHRoaXMudHJlZS5fZGVjb2RlKGRhdGEsIG9wdGlvbnMpO1xufTtcblxuLy8gVHJlZSBtZXRob2RzXG5cbmZ1bmN0aW9uIERFUk5vZGUocGFyZW50KSB7XG4gIGJhc2UuTm9kZS5jYWxsKHRoaXMsICdkZXInLCBwYXJlbnQpO1xufVxuaW5oZXJpdHMoREVSTm9kZSwgYmFzZS5Ob2RlKTtcblxuREVSTm9kZS5wcm90b3R5cGUuX3BlZWtUYWcgPSBmdW5jdGlvbiBwZWVrVGFnKGJ1ZmZlciwgdGFnLCBhbnkpIHtcbiAgaWYgKGJ1ZmZlci5pc0VtcHR5KCkpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBzdGF0ZSA9IGJ1ZmZlci5zYXZlKCk7XG4gIHZhciBkZWNvZGVkVGFnID0gZGVyRGVjb2RlVGFnKGJ1ZmZlciwgJ0ZhaWxlZCB0byBwZWVrIHRhZzogXCInICsgdGFnICsgJ1wiJyk7XG4gIGlmIChidWZmZXIuaXNFcnJvcihkZWNvZGVkVGFnKSlcbiAgICByZXR1cm4gZGVjb2RlZFRhZztcblxuICBidWZmZXIucmVzdG9yZShzdGF0ZSk7XG5cbiAgcmV0dXJuIGRlY29kZWRUYWcudGFnID09PSB0YWcgfHwgZGVjb2RlZFRhZy50YWdTdHIgPT09IHRhZyB8fCBhbnk7XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fZGVjb2RlVGFnID0gZnVuY3Rpb24gZGVjb2RlVGFnKGJ1ZmZlciwgdGFnLCBhbnkpIHtcbiAgdmFyIGRlY29kZWRUYWcgPSBkZXJEZWNvZGVUYWcoYnVmZmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRmFpbGVkIHRvIGRlY29kZSB0YWcgb2YgXCInICsgdGFnICsgJ1wiJyk7XG4gIGlmIChidWZmZXIuaXNFcnJvcihkZWNvZGVkVGFnKSlcbiAgICByZXR1cm4gZGVjb2RlZFRhZztcblxuICB2YXIgbGVuID0gZGVyRGVjb2RlTGVuKGJ1ZmZlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICBkZWNvZGVkVGFnLnByaW1pdGl2ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnRmFpbGVkIHRvIGdldCBsZW5ndGggb2YgXCInICsgdGFnICsgJ1wiJyk7XG5cbiAgLy8gRmFpbHVyZVxuICBpZiAoYnVmZmVyLmlzRXJyb3IobGVuKSlcbiAgICByZXR1cm4gbGVuO1xuXG4gIGlmICghYW55ICYmXG4gICAgICBkZWNvZGVkVGFnLnRhZyAhPT0gdGFnICYmXG4gICAgICBkZWNvZGVkVGFnLnRhZ1N0ciAhPT0gdGFnICYmXG4gICAgICBkZWNvZGVkVGFnLnRhZ1N0ciArICdvZicgIT09IHRhZykge1xuICAgIHJldHVybiBidWZmZXIuZXJyb3IoJ0ZhaWxlZCB0byBtYXRjaCB0YWc6IFwiJyArIHRhZyArICdcIicpO1xuICB9XG5cbiAgaWYgKGRlY29kZWRUYWcucHJpbWl0aXZlIHx8IGxlbiAhPT0gbnVsbClcbiAgICByZXR1cm4gYnVmZmVyLnNraXAobGVuLCAnRmFpbGVkIHRvIG1hdGNoIGJvZHkgb2Y6IFwiJyArIHRhZyArICdcIicpO1xuXG4gIC8vIEluZGVmaW5pdGUgbGVuZ3RoLi4uIGZpbmQgRU5EIHRhZ1xuICB2YXIgc3RhdGUgPSBidWZmZXIuc2F2ZSgpO1xuICB2YXIgcmVzID0gdGhpcy5fc2tpcFVudGlsRW5kKFxuICAgICAgYnVmZmVyLFxuICAgICAgJ0ZhaWxlZCB0byBza2lwIGluZGVmaW5pdGUgbGVuZ3RoIGJvZHk6IFwiJyArIHRoaXMudGFnICsgJ1wiJyk7XG4gIGlmIChidWZmZXIuaXNFcnJvcihyZXMpKVxuICAgIHJldHVybiByZXM7XG5cbiAgbGVuID0gYnVmZmVyLm9mZnNldCAtIHN0YXRlLm9mZnNldDtcbiAgYnVmZmVyLnJlc3RvcmUoc3RhdGUpO1xuICByZXR1cm4gYnVmZmVyLnNraXAobGVuLCAnRmFpbGVkIHRvIG1hdGNoIGJvZHkgb2Y6IFwiJyArIHRhZyArICdcIicpO1xufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX3NraXBVbnRpbEVuZCA9IGZ1bmN0aW9uIHNraXBVbnRpbEVuZChidWZmZXIsIGZhaWwpIHtcbiAgd2hpbGUgKHRydWUpIHtcbiAgICB2YXIgdGFnID0gZGVyRGVjb2RlVGFnKGJ1ZmZlciwgZmFpbCk7XG4gICAgaWYgKGJ1ZmZlci5pc0Vycm9yKHRhZykpXG4gICAgICByZXR1cm4gdGFnO1xuICAgIHZhciBsZW4gPSBkZXJEZWNvZGVMZW4oYnVmZmVyLCB0YWcucHJpbWl0aXZlLCBmYWlsKTtcbiAgICBpZiAoYnVmZmVyLmlzRXJyb3IobGVuKSlcbiAgICAgIHJldHVybiBsZW47XG5cbiAgICB2YXIgcmVzO1xuICAgIGlmICh0YWcucHJpbWl0aXZlIHx8IGxlbiAhPT0gbnVsbClcbiAgICAgIHJlcyA9IGJ1ZmZlci5za2lwKGxlbilcbiAgICBlbHNlXG4gICAgICByZXMgPSB0aGlzLl9za2lwVW50aWxFbmQoYnVmZmVyLCBmYWlsKTtcblxuICAgIC8vIEZhaWx1cmVcbiAgICBpZiAoYnVmZmVyLmlzRXJyb3IocmVzKSlcbiAgICAgIHJldHVybiByZXM7XG5cbiAgICBpZiAodGFnLnRhZ1N0ciA9PT0gJ2VuZCcpXG4gICAgICBicmVhaztcbiAgfVxufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX2RlY29kZUxpc3QgPSBmdW5jdGlvbiBkZWNvZGVMaXN0KGJ1ZmZlciwgdGFnLCBkZWNvZGVyKSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgd2hpbGUgKCFidWZmZXIuaXNFbXB0eSgpKSB7XG4gICAgdmFyIHBvc3NpYmxlRW5kID0gdGhpcy5fcGVla1RhZyhidWZmZXIsICdlbmQnKTtcbiAgICBpZiAoYnVmZmVyLmlzRXJyb3IocG9zc2libGVFbmQpKVxuICAgICAgcmV0dXJuIHBvc3NpYmxlRW5kO1xuXG4gICAgdmFyIHJlcyA9IGRlY29kZXIuZGVjb2RlKGJ1ZmZlciwgJ2RlcicpO1xuICAgIGlmIChidWZmZXIuaXNFcnJvcihyZXMpICYmIHBvc3NpYmxlRW5kKVxuICAgICAgYnJlYWs7XG4gICAgcmVzdWx0LnB1c2gocmVzKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX2RlY29kZVN0ciA9IGZ1bmN0aW9uIGRlY29kZVN0cihidWZmZXIsIHRhZykge1xuICBpZiAodGFnID09PSAnb2N0c3RyJykge1xuICAgIHJldHVybiBidWZmZXIucmF3KCk7XG4gIH0gZWxzZSBpZiAodGFnID09PSAnYml0c3RyJykge1xuICAgIHZhciB1bnVzZWQgPSBidWZmZXIucmVhZFVJbnQ4KCk7XG4gICAgaWYgKGJ1ZmZlci5pc0Vycm9yKHVudXNlZCkpXG4gICAgICByZXR1cm4gdW51c2VkO1xuXG4gICAgcmV0dXJuIHsgdW51c2VkOiB1bnVzZWQsIGRhdGE6IGJ1ZmZlci5yYXcoKSB9O1xuICB9IGVsc2UgaWYgKHRhZyA9PT0gJ2lhNXN0cicgfHwgdGFnID09PSAndXRmOHN0cicpIHtcbiAgICByZXR1cm4gYnVmZmVyLnJhdygpLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMuZXJyb3IoJ0RlY29kaW5nIG9mIHN0cmluZyB0eXBlOiAnICsgdGFnICsgJyB1bnN1cHBvcnRlZCcpO1xuICB9XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fZGVjb2RlT2JqaWQgPSBmdW5jdGlvbiBkZWNvZGVPYmppZChidWZmZXIsIHZhbHVlcywgcmVsYXRpdmUpIHtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG4gIHZhciBpZGVudCA9IDA7XG4gIHdoaWxlICghYnVmZmVyLmlzRW1wdHkoKSkge1xuICAgIHZhciBzdWJpZGVudCA9IGJ1ZmZlci5yZWFkVUludDgoKTtcbiAgICBpZGVudCA8PD0gNztcbiAgICBpZGVudCB8PSBzdWJpZGVudCAmIDB4N2Y7XG4gICAgaWYgKChzdWJpZGVudCAmIDB4ODApID09PSAwKSB7XG4gICAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50KTtcbiAgICAgIGlkZW50ID0gMDtcbiAgICB9XG4gIH1cbiAgaWYgKHN1YmlkZW50ICYgMHg4MClcbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50KTtcblxuICB2YXIgZmlyc3QgPSAoaWRlbnRpZmllcnNbMF0gLyA0MCkgfCAwO1xuICB2YXIgc2Vjb25kID0gaWRlbnRpZmllcnNbMF0gJSA0MDtcblxuICBpZiAocmVsYXRpdmUpXG4gICAgcmVzdWx0ID0gaWRlbnRpZmllcnM7XG4gIGVsc2VcbiAgICByZXN1bHQgPSBbZmlyc3QsIHNlY29uZF0uY29uY2F0KGlkZW50aWZpZXJzLnNsaWNlKDEpKTtcblxuICBpZiAodmFsdWVzKVxuICAgIHJlc3VsdCA9IHZhbHVlc1tyZXN1bHQuam9pbignICcpXTtcblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX2RlY29kZVRpbWUgPSBmdW5jdGlvbiBkZWNvZGVUaW1lKGJ1ZmZlciwgdGFnKSB7XG4gIHZhciBzdHIgPSBidWZmZXIucmF3KCkudG9TdHJpbmcoKTtcbiAgaWYgKHRhZyA9PT0gJ2dlbnRpbWUnKSB7XG4gICAgdmFyIHllYXIgPSBzdHIuc2xpY2UoMCwgNCkgfCAwO1xuICAgIHZhciBtb24gPSBzdHIuc2xpY2UoNCwgNikgfCAwO1xuICAgIHZhciBkYXkgPSBzdHIuc2xpY2UoNiwgOCkgfCAwO1xuICAgIHZhciBob3VyID0gc3RyLnNsaWNlKDgsIDEwKSB8IDA7XG4gICAgdmFyIG1pbiA9IHN0ci5zbGljZSgxMCwgMTIpIHwgMDtcbiAgICB2YXIgc2VjID0gc3RyLnNsaWNlKDEyLCAxNCkgfCAwO1xuICB9IGVsc2UgaWYgKHRhZyA9PT0gJ3V0Y3RpbWUnKSB7XG4gICAgdmFyIHllYXIgPSBzdHIuc2xpY2UoMCwgMikgfCAwO1xuICAgIHZhciBtb24gPSBzdHIuc2xpY2UoMiwgNCkgfCAwO1xuICAgIHZhciBkYXkgPSBzdHIuc2xpY2UoNCwgNikgfCAwO1xuICAgIHZhciBob3VyID0gc3RyLnNsaWNlKDYsIDgpIHwgMDtcbiAgICB2YXIgbWluID0gc3RyLnNsaWNlKDgsIDEwKSB8IDA7XG4gICAgdmFyIHNlYyA9IHN0ci5zbGljZSgxMCwgMTIpIHwgMDtcbiAgICBpZiAoeWVhciA8IDcwKVxuICAgICAgeWVhciA9IDIwMDAgKyB5ZWFyO1xuICAgIGVsc2VcbiAgICAgIHllYXIgPSAxOTAwICsgeWVhcjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdGhpcy5lcnJvcignRGVjb2RpbmcgJyArIHRhZyArICcgdGltZSBpcyBub3Qgc3VwcG9ydGVkIHlldCcpO1xuICB9XG5cbiAgcmV0dXJuIERhdGUuVVRDKHllYXIsIG1vbiAtIDEsIGRheSwgaG91ciwgbWluLCBzZWMsIDApO1xufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX2RlY29kZU51bGwgPSBmdW5jdGlvbiBkZWNvZGVOdWxsKGJ1ZmZlcikge1xuICByZXR1cm4gbnVsbDtcbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl9kZWNvZGVCb29sID0gZnVuY3Rpb24gZGVjb2RlQm9vbChidWZmZXIpIHtcbiAgdmFyIHJlcyA9IGJ1ZmZlci5yZWFkVUludDgoKTtcbiAgaWYgKGJ1ZmZlci5pc0Vycm9yKHJlcykpXG4gICAgcmV0dXJuIHJlcztcbiAgZWxzZVxuICAgIHJldHVybiByZXMgIT09IDA7XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fZGVjb2RlSW50ID0gZnVuY3Rpb24gZGVjb2RlSW50KGJ1ZmZlciwgdmFsdWVzKSB7XG4gIC8vIEJpZ2ludCwgcmV0dXJuIGFzIGl0IGlzIChhc3N1bWUgYmlnIGVuZGlhbilcbiAgdmFyIHJhdyA9IGJ1ZmZlci5yYXcoKTtcbiAgdmFyIHJlcyA9IG5ldyBiaWdudW0ocmF3KTtcblxuICBpZiAodmFsdWVzKVxuICAgIHJlcyA9IHZhbHVlc1tyZXMudG9TdHJpbmcoMTApXSB8fCByZXM7XG5cbiAgcmV0dXJuIHJlcztcbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl91c2UgPSBmdW5jdGlvbiB1c2UoZW50aXR5LCBvYmopIHtcbiAgaWYgKHR5cGVvZiBlbnRpdHkgPT09ICdmdW5jdGlvbicpXG4gICAgZW50aXR5ID0gZW50aXR5KG9iaik7XG4gIHJldHVybiBlbnRpdHkuX2dldERlY29kZXIoJ2RlcicpLnRyZWU7XG59O1xuXG4vLyBVdGlsaXR5IG1ldGhvZHNcblxuZnVuY3Rpb24gZGVyRGVjb2RlVGFnKGJ1ZiwgZmFpbCkge1xuICB2YXIgdGFnID0gYnVmLnJlYWRVSW50OChmYWlsKTtcbiAgaWYgKGJ1Zi5pc0Vycm9yKHRhZykpXG4gICAgcmV0dXJuIHRhZztcblxuICB2YXIgY2xzID0gZGVyLnRhZ0NsYXNzW3RhZyA+PiA2XTtcbiAgdmFyIHByaW1pdGl2ZSA9ICh0YWcgJiAweDIwKSA9PT0gMDtcblxuICAvLyBNdWx0aS1vY3RldCB0YWcgLSBsb2FkXG4gIGlmICgodGFnICYgMHgxZikgPT09IDB4MWYpIHtcbiAgICB2YXIgb2N0ID0gdGFnO1xuICAgIHRhZyA9IDA7XG4gICAgd2hpbGUgKChvY3QgJiAweDgwKSA9PT0gMHg4MCkge1xuICAgICAgb2N0ID0gYnVmLnJlYWRVSW50OChmYWlsKTtcbiAgICAgIGlmIChidWYuaXNFcnJvcihvY3QpKVxuICAgICAgICByZXR1cm4gb2N0O1xuXG4gICAgICB0YWcgPDw9IDc7XG4gICAgICB0YWcgfD0gb2N0ICYgMHg3ZjtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGFnICY9IDB4MWY7XG4gIH1cbiAgdmFyIHRhZ1N0ciA9IGRlci50YWdbdGFnXTtcblxuICByZXR1cm4ge1xuICAgIGNsczogY2xzLFxuICAgIHByaW1pdGl2ZTogcHJpbWl0aXZlLFxuICAgIHRhZzogdGFnLFxuICAgIHRhZ1N0cjogdGFnU3RyXG4gIH07XG59XG5cbmZ1bmN0aW9uIGRlckRlY29kZUxlbihidWYsIHByaW1pdGl2ZSwgZmFpbCkge1xuICB2YXIgbGVuID0gYnVmLnJlYWRVSW50OChmYWlsKTtcbiAgaWYgKGJ1Zi5pc0Vycm9yKGxlbikpXG4gICAgcmV0dXJuIGxlbjtcblxuICAvLyBJbmRlZmluaXRlIGZvcm1cbiAgaWYgKCFwcmltaXRpdmUgJiYgbGVuID09PSAweDgwKVxuICAgIHJldHVybiBudWxsO1xuXG4gIC8vIERlZmluaXRlIGZvcm1cbiAgaWYgKChsZW4gJiAweDgwKSA9PT0gMCkge1xuICAgIC8vIFNob3J0IGZvcm1cbiAgICByZXR1cm4gbGVuO1xuICB9XG5cbiAgLy8gTG9uZyBmb3JtXG4gIHZhciBudW0gPSBsZW4gJiAweDdmO1xuICBpZiAobnVtID49IDQpXG4gICAgcmV0dXJuIGJ1Zi5lcnJvcignbGVuZ3RoIG9jdGVjdCBpcyB0b28gbG9uZycpO1xuXG4gIGxlbiA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICBsZW4gPDw9IDg7XG4gICAgdmFyIGogPSBidWYucmVhZFVJbnQ4KGZhaWwpO1xuICAgIGlmIChidWYuaXNFcnJvcihqKSlcbiAgICAgIHJldHVybiBqO1xuICAgIGxlbiB8PSBqO1xuICB9XG5cbiAgcmV0dXJuIGxlbjtcbn1cbiIsInZhciBkZWNvZGVycyA9IGV4cG9ydHM7XG5cbmRlY29kZXJzLmRlciA9IHJlcXVpcmUoJy4vZGVyJyk7XG5kZWNvZGVycy5wZW0gPSByZXF1aXJlKCcuL3BlbScpO1xuIiwidmFyIGluaGVyaXRzID0gcmVxdWlyZSgndXRpbCcpLmluaGVyaXRzO1xudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcblxudmFyIGFzbjEgPSByZXF1aXJlKCcuLi9hc24xJyk7XG52YXIgREVSRGVjb2RlciA9IHJlcXVpcmUoJy4vZGVyJyk7XG5cbmZ1bmN0aW9uIFBFTURlY29kZXIoZW50aXR5KSB7XG4gIERFUkRlY29kZXIuY2FsbCh0aGlzLCBlbnRpdHkpO1xuICB0aGlzLmVuYyA9ICdwZW0nO1xufTtcbmluaGVyaXRzKFBFTURlY29kZXIsIERFUkRlY29kZXIpO1xubW9kdWxlLmV4cG9ydHMgPSBQRU1EZWNvZGVyO1xuXG5QRU1EZWNvZGVyLnByb3RvdHlwZS5kZWNvZGUgPSBmdW5jdGlvbiBkZWNvZGUoZGF0YSwgb3B0aW9ucykge1xuICB2YXIgbGluZXMgPSBkYXRhLnRvU3RyaW5nKCkuc3BsaXQoL1tcXHJcXG5dKy9nKTtcblxuICB2YXIgbGFiZWwgPSBvcHRpb25zLmxhYmVsLnRvVXBwZXJDYXNlKCk7XG5cbiAgdmFyIHJlID0gL14tLS0tLShCRUdJTnxFTkQpIChbXi1dKyktLS0tLSQvO1xuICB2YXIgc3RhcnQgPSAtMTtcbiAgdmFyIGVuZCA9IC0xO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIG1hdGNoID0gbGluZXNbaV0ubWF0Y2gocmUpO1xuICAgIGlmIChtYXRjaCA9PT0gbnVsbClcbiAgICAgIGNvbnRpbnVlO1xuXG4gICAgaWYgKG1hdGNoWzJdICE9PSBsYWJlbClcbiAgICAgIGNvbnRpbnVlO1xuXG4gICAgaWYgKHN0YXJ0ID09PSAtMSkge1xuICAgICAgaWYgKG1hdGNoWzFdICE9PSAnQkVHSU4nKVxuICAgICAgICBicmVhaztcbiAgICAgIHN0YXJ0ID0gaTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1hdGNoWzFdICE9PSAnRU5EJylcbiAgICAgICAgYnJlYWs7XG4gICAgICBlbmQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmIChzdGFydCA9PT0gLTEgfHwgZW5kID09PSAtMSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BFTSBzZWN0aW9uIG5vdCBmb3VuZCBmb3I6ICcgKyBsYWJlbCk7XG5cbiAgdmFyIGJhc2U2NCA9IGxpbmVzLnNsaWNlKHN0YXJ0ICsgMSwgZW5kKS5qb2luKCcnKTtcbiAgLy8gUmVtb3ZlIGV4Y2Vzc2l2ZSBzeW1ib2xzXG4gIGJhc2U2NC5yZXBsYWNlKC9bXmEtejAtOVxcK1xcLz1dKy9naSwgJycpO1xuXG4gIHZhciBpbnB1dCA9IG5ldyBCdWZmZXIoYmFzZTY0LCAnYmFzZTY0Jyk7XG4gIHJldHVybiBERVJEZWNvZGVyLnByb3RvdHlwZS5kZWNvZGUuY2FsbCh0aGlzLCBpbnB1dCwgb3B0aW9ucyk7XG59O1xuIiwidmFyIGluaGVyaXRzID0gcmVxdWlyZSgndXRpbCcpLmluaGVyaXRzO1xudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcblxudmFyIGFzbjEgPSByZXF1aXJlKCcuLi9hc24xJyk7XG52YXIgYmFzZSA9IGFzbjEuYmFzZTtcbnZhciBiaWdudW0gPSBhc24xLmJpZ251bTtcblxuLy8gSW1wb3J0IERFUiBjb25zdGFudHNcbnZhciBkZXIgPSBhc24xLmNvbnN0YW50cy5kZXI7XG5cbmZ1bmN0aW9uIERFUkVuY29kZXIoZW50aXR5KSB7XG4gIHRoaXMuZW5jID0gJ2Rlcic7XG4gIHRoaXMubmFtZSA9IGVudGl0eS5uYW1lO1xuICB0aGlzLmVudGl0eSA9IGVudGl0eTtcblxuICAvLyBDb25zdHJ1Y3QgYmFzZSB0cmVlXG4gIHRoaXMudHJlZSA9IG5ldyBERVJOb2RlKCk7XG4gIHRoaXMudHJlZS5faW5pdChlbnRpdHkuYm9keSk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBERVJFbmNvZGVyO1xuXG5ERVJFbmNvZGVyLnByb3RvdHlwZS5lbmNvZGUgPSBmdW5jdGlvbiBlbmNvZGUoZGF0YSwgcmVwb3J0ZXIpIHtcbiAgcmV0dXJuIHRoaXMudHJlZS5fZW5jb2RlKGRhdGEsIHJlcG9ydGVyKS5qb2luKCk7XG59O1xuXG4vLyBUcmVlIG1ldGhvZHNcblxuZnVuY3Rpb24gREVSTm9kZShwYXJlbnQpIHtcbiAgYmFzZS5Ob2RlLmNhbGwodGhpcywgJ2RlcicsIHBhcmVudCk7XG59XG5pbmhlcml0cyhERVJOb2RlLCBiYXNlLk5vZGUpO1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fZW5jb2RlQ29tcG9zaXRlID0gZnVuY3Rpb24gZW5jb2RlQ29tcG9zaXRlKHRhZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWl0aXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQpIHtcbiAgdmFyIGVuY29kZWRUYWcgPSBlbmNvZGVUYWcodGFnLCBwcmltaXRpdmUsIGNscywgdGhpcy5yZXBvcnRlcik7XG5cbiAgLy8gU2hvcnQgZm9ybVxuICBpZiAoY29udGVudC5sZW5ndGggPCAweDgwKSB7XG4gICAgdmFyIGhlYWRlciA9IG5ldyBCdWZmZXIoMik7XG4gICAgaGVhZGVyWzBdID0gZW5jb2RlZFRhZztcbiAgICBoZWFkZXJbMV0gPSBjb250ZW50Lmxlbmd0aDtcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihbIGhlYWRlciwgY29udGVudCBdKTtcbiAgfVxuXG4gIC8vIExvbmcgZm9ybVxuICAvLyBDb3VudCBvY3RldHMgcmVxdWlyZWQgdG8gc3RvcmUgbGVuZ3RoXG4gIHZhciBsZW5PY3RldHMgPSAxO1xuICBmb3IgKHZhciBpID0gY29udGVudC5sZW5ndGg7IGkgPj0gMHgxMDA7IGkgPj49IDgpXG4gICAgbGVuT2N0ZXRzKys7XG5cbiAgdmFyIGhlYWRlciA9IG5ldyBCdWZmZXIoMSArIDEgKyBsZW5PY3RldHMpO1xuICBoZWFkZXJbMF0gPSBlbmNvZGVkVGFnO1xuICBoZWFkZXJbMV0gPSAweDgwIHwgbGVuT2N0ZXRzO1xuXG4gIGZvciAodmFyIGkgPSAxICsgbGVuT2N0ZXRzLCBqID0gY29udGVudC5sZW5ndGg7IGogPiAwOyBpLS0sIGogPj49IDgpXG4gICAgaGVhZGVyW2ldID0gaiAmIDB4ZmY7XG5cbiAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIoWyBoZWFkZXIsIGNvbnRlbnQgXSk7XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fZW5jb2RlU3RyID0gZnVuY3Rpb24gZW5jb2RlU3RyKHN0ciwgdGFnKSB7XG4gIGlmICh0YWcgPT09ICdvY3RzdHInKVxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKHN0cik7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ2JpdHN0cicpXG4gICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIoWyBzdHIudW51c2VkIHwgMCwgc3RyLmRhdGEgXSk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ2lhNXN0cicgfHwgdGFnID09PSAndXRmOHN0cicpXG4gICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIoc3RyKTtcbiAgcmV0dXJuIHRoaXMucmVwb3J0ZXIuZXJyb3IoJ0VuY29kaW5nIG9mIHN0cmluZyB0eXBlOiAnICsgdGFnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyB1bnN1cHBvcnRlZCcpO1xufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX2VuY29kZU9iamlkID0gZnVuY3Rpb24gZW5jb2RlT2JqaWQoaWQsIHZhbHVlcywgcmVsYXRpdmUpIHtcbiAgaWYgKHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoIXZhbHVlcylcbiAgICAgIHJldHVybiB0aGlzLnJlcG9ydGVyLmVycm9yKCdzdHJpbmcgb2JqaWQgZ2l2ZW4sIGJ1dCBubyB2YWx1ZXMgbWFwIGZvdW5kJyk7XG4gICAgaWYgKCF2YWx1ZXMuaGFzT3duUHJvcGVydHkoaWQpKVxuICAgICAgcmV0dXJuIHRoaXMucmVwb3J0ZXIuZXJyb3IoJ29iamlkIG5vdCBmb3VuZCBpbiB2YWx1ZXMgbWFwJyk7XG4gICAgaWQgPSB2YWx1ZXNbaWRdLnNwbGl0KC9bXFxzXFwuXSsvZyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpZC5sZW5ndGg7IGkrKylcbiAgICAgIGlkW2ldIHw9IDA7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShpZCkpIHtcbiAgICBpZCA9IGlkLnNsaWNlKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpZC5sZW5ndGg7IGkrKylcbiAgICAgIGlkW2ldIHw9IDA7XG4gIH1cblxuICBpZiAoIUFycmF5LmlzQXJyYXkoaWQpKSB7XG4gICAgcmV0dXJuIHRoaXMucmVwb3J0ZXIuZXJyb3IoJ29iamlkKCkgc2hvdWxkIGJlIGVpdGhlciBhcnJheSBvciBzdHJpbmcsICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdnb3Q6ICcgKyBKU09OLnN0cmluZ2lmeShpZCkpO1xuICB9XG5cbiAgaWYgKCFyZWxhdGl2ZSkge1xuICAgIGlmIChpZFsxXSA+PSA0MClcbiAgICAgIHJldHVybiB0aGlzLnJlcG9ydGVyLmVycm9yKCdTZWNvbmQgb2JqaWQgaWRlbnRpZmllciBPT0InKTtcbiAgICBpZC5zcGxpY2UoMCwgMiwgaWRbMF0gKiA0MCArIGlkWzFdKTtcbiAgfVxuXG4gIC8vIENvdW50IG51bWJlciBvZiBvY3RldHNcbiAgdmFyIHNpemUgPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGlkLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGlkZW50ID0gaWRbaV07XG4gICAgZm9yIChzaXplKys7IGlkZW50ID49IDB4ODA7IGlkZW50ID4+PSA3KVxuICAgICAgc2l6ZSsrO1xuICB9XG5cbiAgdmFyIG9iamlkID0gbmV3IEJ1ZmZlcihzaXplKTtcbiAgdmFyIG9mZnNldCA9IG9iamlkLmxlbmd0aCAtIDE7XG4gIGZvciAodmFyIGkgPSBpZC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBpZGVudCA9IGlkW2ldO1xuICAgIG9iamlkW29mZnNldC0tXSA9IGlkZW50ICYgMHg3ZjtcbiAgICB3aGlsZSAoKGlkZW50ID4+PSA3KSA+IDApXG4gICAgICBvYmppZFtvZmZzZXQtLV0gPSAweDgwIHwgKGlkZW50ICYgMHg3Zik7XG4gIH1cblxuICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihvYmppZCk7XG59O1xuXG5mdW5jdGlvbiB0d28obnVtKSB7XG4gIGlmIChudW0gPCAxMClcbiAgICByZXR1cm4gJzAnICsgbnVtO1xuICBlbHNlXG4gICAgcmV0dXJuIG51bTtcbn1cblxuREVSTm9kZS5wcm90b3R5cGUuX2VuY29kZVRpbWUgPSBmdW5jdGlvbiBlbmNvZGVUaW1lKHRpbWUsIHRhZykge1xuICB2YXIgc3RyO1xuICB2YXIgZGF0ZSA9IG5ldyBEYXRlKHRpbWUpO1xuXG4gIGlmICh0YWcgPT09ICdnZW50aW1lJykge1xuICAgIHN0ciA9IFtcbiAgICAgIHR3byhkYXRlLmdldEZ1bGxZZWFyKCkpLFxuICAgICAgdHdvKGRhdGUuZ2V0VVRDTW9udGgoKSArIDEpLFxuICAgICAgdHdvKGRhdGUuZ2V0VVRDRGF0ZSgpKSxcbiAgICAgIHR3byhkYXRlLmdldFVUQ0hvdXJzKCkpLFxuICAgICAgdHdvKGRhdGUuZ2V0VVRDTWludXRlcygpKSxcbiAgICAgIHR3byhkYXRlLmdldFVUQ1NlY29uZHMoKSksXG4gICAgICAnWidcbiAgICBdLmpvaW4oJycpO1xuICB9IGVsc2UgaWYgKHRhZyA9PT0gJ3V0Y3RpbWUnKSB7XG4gICAgc3RyID0gW1xuICAgICAgdHdvKGRhdGUuZ2V0RnVsbFllYXIoKSAlIDEwMCksXG4gICAgICB0d28oZGF0ZS5nZXRVVENNb250aCgpICsgMSksXG4gICAgICB0d28oZGF0ZS5nZXRVVENEYXRlKCkpLFxuICAgICAgdHdvKGRhdGUuZ2V0VVRDSG91cnMoKSksXG4gICAgICB0d28oZGF0ZS5nZXRVVENNaW51dGVzKCkpLFxuICAgICAgdHdvKGRhdGUuZ2V0VVRDU2Vjb25kcygpKSxcbiAgICAgICdaJ1xuICAgIF0uam9pbignJyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5yZXBvcnRlci5lcnJvcignRW5jb2RpbmcgJyArIHRhZyArICcgdGltZSBpcyBub3Qgc3VwcG9ydGVkIHlldCcpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuX2VuY29kZVN0cihzdHIsICdvY3RzdHInKTtcbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl9lbmNvZGVOdWxsID0gZnVuY3Rpb24gZW5jb2RlTnVsbCgpIHtcbiAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIoJycpO1xufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX2VuY29kZUludCA9IGZ1bmN0aW9uIGVuY29kZUludChudW0sIHZhbHVlcykge1xuICBpZiAodHlwZW9mIG51bSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoIXZhbHVlcylcbiAgICAgIHJldHVybiB0aGlzLnJlcG9ydGVyLmVycm9yKCdTdHJpbmcgaW50IG9yIGVudW0gZ2l2ZW4sIGJ1dCBubyB2YWx1ZXMgbWFwJyk7XG4gICAgaWYgKCF2YWx1ZXMuaGFzT3duUHJvcGVydHkobnVtKSkge1xuICAgICAgcmV0dXJuIHRoaXMucmVwb3J0ZXIuZXJyb3IoJ1ZhbHVlcyBtYXAgZG9lc25cXCd0IGNvbnRhaW46ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkobnVtKSk7XG4gICAgfVxuICAgIG51bSA9IHZhbHVlc1tudW1dO1xuICB9XG5cbiAgLy8gQmlnbnVtLCBhc3N1bWUgYmlnIGVuZGlhblxuICBpZiAodHlwZW9mIG51bSAhPT0gJ251bWJlcicgJiYgIUJ1ZmZlci5pc0J1ZmZlcihudW0pKSB7XG4gICAgdmFyIG51bUFycmF5ID0gbnVtLnRvQXJyYXkoKTtcbiAgICBpZiAobnVtLnNpZ24gPT09IGZhbHNlICYmIG51bUFycmF5WzBdICYgMHg4MCkge1xuICAgICAgbnVtQXJyYXkudW5zaGlmdCgwKTtcbiAgICB9XG4gICAgbnVtID0gbmV3IEJ1ZmZlcihudW1BcnJheSk7XG4gIH1cblxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKG51bSkpIHtcbiAgICB2YXIgc2l6ZSA9IG51bS5sZW5ndGg7XG4gICAgaWYgKG51bS5sZW5ndGggPT09IDApXG4gICAgICBzaXplKys7XG5cbiAgICB2YXIgb3V0ID0gbmV3IEJ1ZmZlcihzaXplKTtcbiAgICBudW0uY29weShvdXQpO1xuICAgIGlmIChudW0ubGVuZ3RoID09PSAwKVxuICAgICAgb3V0WzBdID0gMFxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKG91dCk7XG4gIH1cblxuICBpZiAobnVtIDwgMHg4MClcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihudW0pO1xuXG4gIGlmIChudW0gPCAweDEwMClcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihbMCwgbnVtXSk7XG5cbiAgdmFyIHNpemUgPSAxO1xuICBmb3IgKHZhciBpID0gbnVtOyBpID49IDB4MTAwOyBpID4+PSA4KVxuICAgIHNpemUrKztcblxuICB2YXIgb3V0ID0gbmV3IEFycmF5KHNpemUpO1xuICBmb3IgKHZhciBpID0gb3V0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgb3V0W2ldID0gbnVtICYgMHhmZjtcbiAgICBudW0gPj49IDg7XG4gIH1cbiAgaWYob3V0WzBdICYgMHg4MCkge1xuICAgIG91dC51bnNoaWZ0KDApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIobmV3IEJ1ZmZlcihvdXQpKTtcbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl9lbmNvZGVCb29sID0gZnVuY3Rpb24gZW5jb2RlQm9vbCh2YWx1ZSkge1xuICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcih2YWx1ZSA/IDB4ZmYgOiAwKTtcbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl91c2UgPSBmdW5jdGlvbiB1c2UoZW50aXR5LCBvYmopIHtcbiAgaWYgKHR5cGVvZiBlbnRpdHkgPT09ICdmdW5jdGlvbicpXG4gICAgZW50aXR5ID0gZW50aXR5KG9iaik7XG4gIHJldHVybiBlbnRpdHkuX2dldEVuY29kZXIoJ2RlcicpLnRyZWU7XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fc2tpcERlZmF1bHQgPSBmdW5jdGlvbiBza2lwRGVmYXVsdChkYXRhQnVmZmVyLCByZXBvcnRlciwgcGFyZW50KSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcbiAgdmFyIGk7XG4gIGlmIChzdGF0ZVsnZGVmYXVsdCddID09PSBudWxsKVxuICAgIHJldHVybiBmYWxzZTtcblxuICB2YXIgZGF0YSA9IGRhdGFCdWZmZXIuam9pbigpO1xuICBpZiAoc3RhdGUuZGVmYXVsdEJ1ZmZlciA9PT0gdW5kZWZpbmVkKVxuICAgIHN0YXRlLmRlZmF1bHRCdWZmZXIgPSB0aGlzLl9lbmNvZGVWYWx1ZShzdGF0ZVsnZGVmYXVsdCddLCByZXBvcnRlciwgcGFyZW50KS5qb2luKCk7XG5cbiAgaWYgKGRhdGEubGVuZ3RoICE9PSBzdGF0ZS5kZWZhdWx0QnVmZmVyLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgZm9yIChpPTA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKVxuICAgIGlmIChkYXRhW2ldICE9PSBzdGF0ZS5kZWZhdWx0QnVmZmVyW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLy8gVXRpbGl0eSBtZXRob2RzXG5cbmZ1bmN0aW9uIGVuY29kZVRhZyh0YWcsIHByaW1pdGl2ZSwgY2xzLCByZXBvcnRlcikge1xuICB2YXIgcmVzO1xuXG4gIGlmICh0YWcgPT09ICdzZXFvZicpXG4gICAgdGFnID0gJ3NlcSc7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ3NldG9mJylcbiAgICB0YWcgPSAnc2V0JztcblxuICBpZiAoZGVyLnRhZ0J5TmFtZS5oYXNPd25Qcm9wZXJ0eSh0YWcpKVxuICAgIHJlcyA9IGRlci50YWdCeU5hbWVbdGFnXTtcbiAgZWxzZSBpZiAodHlwZW9mIHRhZyA9PT0gJ251bWJlcicgJiYgKHRhZyB8IDApID09PSB0YWcpXG4gICAgcmVzID0gdGFnO1xuICBlbHNlXG4gICAgcmV0dXJuIHJlcG9ydGVyLmVycm9yKCdVbmtub3duIHRhZzogJyArIHRhZyk7XG5cbiAgaWYgKHJlcyA+PSAweDFmKVxuICAgIHJldHVybiByZXBvcnRlci5lcnJvcignTXVsdGktb2N0ZXQgdGFnIGVuY29kaW5nIHVuc3VwcG9ydGVkJyk7XG5cbiAgaWYgKCFwcmltaXRpdmUpXG4gICAgcmVzIHw9IDB4MjA7XG5cbiAgcmVzIHw9IChkZXIudGFnQ2xhc3NCeU5hbWVbY2xzIHx8ICd1bml2ZXJzYWwnXSA8PCA2KTtcblxuICByZXR1cm4gcmVzO1xufVxuIiwidmFyIGVuY29kZXJzID0gZXhwb3J0cztcblxuZW5jb2RlcnMuZGVyID0gcmVxdWlyZSgnLi9kZXInKTtcbmVuY29kZXJzLnBlbSA9IHJlcXVpcmUoJy4vcGVtJyk7XG4iLCJ2YXIgaW5oZXJpdHMgPSByZXF1aXJlKCd1dGlsJykuaW5oZXJpdHM7XG52YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xuXG52YXIgYXNuMSA9IHJlcXVpcmUoJy4uL2FzbjEnKTtcbnZhciBERVJFbmNvZGVyID0gcmVxdWlyZSgnLi9kZXInKTtcblxuZnVuY3Rpb24gUEVNRW5jb2RlcihlbnRpdHkpIHtcbiAgREVSRW5jb2Rlci5jYWxsKHRoaXMsIGVudGl0eSk7XG4gIHRoaXMuZW5jID0gJ3BlbSc7XG59O1xuaW5oZXJpdHMoUEVNRW5jb2RlciwgREVSRW5jb2Rlcik7XG5tb2R1bGUuZXhwb3J0cyA9IFBFTUVuY29kZXI7XG5cblBFTUVuY29kZXIucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uIGVuY29kZShkYXRhLCBvcHRpb25zKSB7XG4gIHZhciBidWYgPSBERVJFbmNvZGVyLnByb3RvdHlwZS5lbmNvZGUuY2FsbCh0aGlzLCBkYXRhKTtcblxuICB2YXIgcCA9IGJ1Zi50b1N0cmluZygnYmFzZTY0Jyk7XG4gIHZhciBvdXQgPSBbICctLS0tLUJFR0lOICcgKyBvcHRpb25zLmxhYmVsICsgJy0tLS0tJyBdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHAubGVuZ3RoOyBpICs9IDY0KVxuICAgIG91dC5wdXNoKHAuc2xpY2UoaSwgaSArIDY0KSk7XG4gIG91dC5wdXNoKCctLS0tLUVORCAnICsgb3B0aW9ucy5sYWJlbCArICctLS0tLScpO1xuICByZXR1cm4gb3V0LmpvaW4oJ1xcbicpO1xufTtcbiIsIid1c2Ugc3RyaWN0J1xuXG52YXIgYXNuMSA9IHJlcXVpcmUoJy4vYXNuMS9hc24xJyk7XG52YXIgQk4gPSByZXF1aXJlKCcuL2FzbjEvYmlnbnVtL2JuJyk7XG5cbnZhciBFQ1ByaXZhdGVLZXlBU04gPSBhc24xLmRlZmluZSgnRUNQcml2YXRlS2V5JywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXEoKS5vYmooXG4gICAgICAgIHRoaXMua2V5KCd2ZXJzaW9uJykuaW50KCksXG4gICAgICAgIHRoaXMua2V5KCdwcml2YXRlS2V5Jykub2N0c3RyKCksXG4gICAgICAgIHRoaXMua2V5KCdwYXJhbWV0ZXJzJykuZXhwbGljaXQoMCkub2JqaWQoKS5vcHRpb25hbCgpLFxuICAgICAgICB0aGlzLmtleSgncHVibGljS2V5JykuZXhwbGljaXQoMSkuYml0c3RyKCkub3B0aW9uYWwoKVxuICAgIClcbn0pXG5cbnZhciBTdWJqZWN0UHVibGljS2V5SW5mb0FTTiA9IGFzbjEuZGVmaW5lKCdTdWJqZWN0UHVibGljS2V5SW5mbycsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2VxKCkub2JqKFxuICAgICAgICB0aGlzLmtleSgnYWxnb3JpdGhtJykuc2VxKCkub2JqKFxuICAgICAgICAgICAgdGhpcy5rZXkoXCJpZFwiKS5vYmppZCgpLFxuICAgICAgICAgICAgdGhpcy5rZXkoXCJjdXJ2ZVwiKS5vYmppZCgpXG4gICAgICAgICksXG4gICAgICAgIHRoaXMua2V5KCdwdWInKS5iaXRzdHIoKVxuICAgIClcbn0pXG5cbnZhciBjdXJ2ZXMgPSB7XG4gICAgc2VjcDI1NmsxOiB7XG4gICAgICAgIGN1cnZlUGFyYW1ldGVyczogWzEsIDMsIDEzMiwgMCwgMTBdLFxuICAgICAgICBwcml2YXRlUEVNT3B0aW9uczoge2xhYmVsOiAnRUMgUFJJVkFURSBLRVknfSxcbiAgICAgICAgcHVibGljUEVNT3B0aW9uczoge2xhYmVsOiAnUFVCTElDIEtFWSd9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnQodmFsLCBtc2cpIHtcbiAgICBpZiAoIXZhbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnIHx8ICdBc3NlcnRpb24gZmFpbGVkJylcbiAgICB9XG59XG5cbmZ1bmN0aW9uIEtleUVuY29kZXIob3B0aW9ucykge1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgYXNzZXJ0KGN1cnZlcy5oYXNPd25Qcm9wZXJ0eShvcHRpb25zKSwgJ1Vua25vd24gY3VydmUgJyArIG9wdGlvbnMpO1xuICAgICAgICBvcHRpb25zID0gY3VydmVzW29wdGlvbnNdXG4gICAgfVxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5hbGdvcml0aG1JRCA9IFsxLCAyLCA4NDAsIDEwMDQ1LCAyLCAxXVxufVxuXG5LZXlFbmNvZGVyLkVDUHJpdmF0ZUtleUFTTiA9IEVDUHJpdmF0ZUtleUFTTjtcbktleUVuY29kZXIuU3ViamVjdFB1YmxpY0tleUluZm9BU04gPSBTdWJqZWN0UHVibGljS2V5SW5mb0FTTjtcblxuS2V5RW5jb2Rlci5wcm90b3R5cGUucHJpdmF0ZUtleU9iamVjdCA9IGZ1bmN0aW9uKHJhd1ByaXZhdGVLZXksIHJhd1B1YmxpY0tleSkge1xuICAgIHZhciBwcml2YXRlS2V5T2JqZWN0ID0ge1xuICAgICAgICB2ZXJzaW9uOiBuZXcgQk4oMSksXG4gICAgICAgIHByaXZhdGVLZXk6IG5ldyBCdWZmZXIocmF3UHJpdmF0ZUtleSwgJ2hleCcpLFxuICAgICAgICBwYXJhbWV0ZXJzOiB0aGlzLm9wdGlvbnMuY3VydmVQYXJhbWV0ZXJzLFxuICAgICAgICBwZW1PcHRpb25zOiB7bGFiZWw6XCJFQyBQUklWQVRFIEtFWVwifVxuICAgIH07XG5cbiAgICBpZiAocmF3UHVibGljS2V5KSB7XG4gICAgICAgIHByaXZhdGVLZXlPYmplY3QucHVibGljS2V5ID0ge1xuICAgICAgICAgICAgdW51c2VkOiAwLFxuICAgICAgICAgICAgZGF0YTogbmV3IEJ1ZmZlcihyYXdQdWJsaWNLZXksICdoZXgnKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHByaXZhdGVLZXlPYmplY3Rcbn07XG5cbktleUVuY29kZXIucHJvdG90eXBlLnB1YmxpY0tleU9iamVjdCA9IGZ1bmN0aW9uKHJhd1B1YmxpY0tleSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGFsZ29yaXRobToge1xuICAgICAgICAgICAgaWQ6IHRoaXMuYWxnb3JpdGhtSUQsXG4gICAgICAgICAgICBjdXJ2ZTogdGhpcy5vcHRpb25zLmN1cnZlUGFyYW1ldGVyc1xuICAgICAgICB9LFxuICAgICAgICBwdWI6IHtcbiAgICAgICAgICAgIHVudXNlZDogMCxcbiAgICAgICAgICAgIGRhdGE6IG5ldyBCdWZmZXIocmF3UHVibGljS2V5LCAnaGV4JylcbiAgICAgICAgfSxcbiAgICAgICAgcGVtT3B0aW9uczogeyBsYWJlbCA6XCJQVUJMSUMgS0VZXCJ9XG4gICAgfVxufVxuXG5LZXlFbmNvZGVyLnByb3RvdHlwZS5lbmNvZGVQcml2YXRlID0gZnVuY3Rpb24ocHJpdmF0ZUtleSwgb3JpZ2luYWxGb3JtYXQsIGRlc3RpbmF0aW9uRm9ybWF0KSB7XG4gICAgdmFyIHByaXZhdGVLZXlPYmplY3RcblxuICAgIC8qIFBhcnNlIHRoZSBpbmNvbWluZyBwcml2YXRlIGtleSBhbmQgY29udmVydCBpdCB0byBhIHByaXZhdGUga2V5IG9iamVjdCAqL1xuICAgIGlmIChvcmlnaW5hbEZvcm1hdCA9PT0gJ3JhdycpIHtcbiAgICAgICAgaWYgKCF0eXBlb2YgcHJpdmF0ZUtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93ICdwcml2YXRlIGtleSBtdXN0IGJlIGEgc3RyaW5nJ1xuICAgICAgICB9XG4gICAgICAgIHZhciBwcml2YXRlS2V5T2JqZWN0ID0gdGhpcy5vcHRpb25zLmN1cnZlLmtleUZyb21Qcml2YXRlKHByaXZhdGVLZXksICdoZXgnKSxcbiAgICAgICAgICAgIHJhd1B1YmxpY0tleSA9IHByaXZhdGVLZXlPYmplY3QuZ2V0UHVibGljKCdoZXgnKVxuICAgICAgICBwcml2YXRlS2V5T2JqZWN0ID0gdGhpcy5wcml2YXRlS2V5T2JqZWN0KHByaXZhdGVLZXksIHJhd1B1YmxpY0tleSlcbiAgICB9IGVsc2UgaWYgKG9yaWdpbmFsRm9ybWF0ID09PSAnZGVyJykge1xuICAgICAgICBpZiAodHlwZW9mIHByaXZhdGVLZXkgPT09ICdidWZmZXInKSB7XG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHByaXZhdGVLZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBwcml2YXRlS2V5ID0gbmV3IEJ1ZmZlcihwcml2YXRlS2V5LCAnaGV4JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93ICdwcml2YXRlIGtleSBtdXN0IGJlIGEgYnVmZmVyIG9yIGEgc3RyaW5nJ1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGVLZXlPYmplY3QgPSBFQ1ByaXZhdGVLZXlBU04uZGVjb2RlKHByaXZhdGVLZXksICdkZXInKVxuICAgIH0gZWxzZSBpZiAob3JpZ2luYWxGb3JtYXQgPT09ICdwZW0nKSB7XG4gICAgICAgIGlmICghdHlwZW9mIHByaXZhdGVLZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyAncHJpdmF0ZSBrZXkgbXVzdCBiZSBhIHN0cmluZydcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlS2V5T2JqZWN0ID0gRUNQcml2YXRlS2V5QVNOLmRlY29kZShwcml2YXRlS2V5LCAncGVtJywgdGhpcy5vcHRpb25zLnByaXZhdGVQRU1PcHRpb25zKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93ICdpbnZhbGlkIHByaXZhdGUga2V5IGZvcm1hdCdcbiAgICB9XG5cbiAgICAvKiBFeHBvcnQgdGhlIHByaXZhdGUga2V5IG9iamVjdCB0byB0aGUgZGVzaXJlZCBmb3JtYXQgKi9cbiAgICBpZiAoZGVzdGluYXRpb25Gb3JtYXQgPT09ICdyYXcnKSB7XG4gICAgICAgIHJldHVybiBwcml2YXRlS2V5T2JqZWN0LnByaXZhdGVLZXkudG9TdHJpbmcoJ2hleCcpXG4gICAgfSBlbHNlIGlmIChkZXN0aW5hdGlvbkZvcm1hdCA9PT0gJ2RlcicpIHtcbiAgICAgICAgcmV0dXJuIEVDUHJpdmF0ZUtleUFTTi5lbmNvZGUocHJpdmF0ZUtleU9iamVjdCwgJ2RlcicpLnRvU3RyaW5nKCdoZXgnKVxuICAgIH0gZWxzZSBpZiAoZGVzdGluYXRpb25Gb3JtYXQgPT09ICdwZW0nKSB7XG4gICAgICAgIHJldHVybiBFQ1ByaXZhdGVLZXlBU04uZW5jb2RlKHByaXZhdGVLZXlPYmplY3QsICdwZW0nLCB0aGlzLm9wdGlvbnMucHJpdmF0ZVBFTU9wdGlvbnMpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgJ2ludmFsaWQgZGVzdGluYXRpb24gZm9ybWF0IGZvciBwcml2YXRlIGtleSdcbiAgICB9XG59XG5cbktleUVuY29kZXIucHJvdG90eXBlLmVuY29kZVB1YmxpYyA9IGZ1bmN0aW9uKHB1YmxpY0tleSwgb3JpZ2luYWxGb3JtYXQsIGRlc3RpbmF0aW9uRm9ybWF0KSB7XG4gICAgdmFyIHB1YmxpY0tleU9iamVjdFxuXG4gICAgLyogUGFyc2UgdGhlIGluY29taW5nIHB1YmxpYyBrZXkgYW5kIGNvbnZlcnQgaXQgdG8gYSBwdWJsaWMga2V5IG9iamVjdCAqL1xuICAgIGlmIChvcmlnaW5hbEZvcm1hdCA9PT0gJ3JhdycpIHtcbiAgICAgICAgaWYgKCF0eXBlb2YgcHVibGljS2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgJ3B1YmxpYyBrZXkgbXVzdCBiZSBhIHN0cmluZydcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWNLZXlPYmplY3QgPSB0aGlzLnB1YmxpY0tleU9iamVjdChwdWJsaWNLZXkpXG4gICAgfSBlbHNlIGlmIChvcmlnaW5hbEZvcm1hdCA9PT0gJ2RlcicpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwdWJsaWNLZXkgPT09ICdidWZmZXInKSB7XG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHB1YmxpY0tleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHB1YmxpY0tleSA9IG5ldyBCdWZmZXIocHVibGljS2V5LCAnaGV4JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93ICdwdWJsaWMga2V5IG11c3QgYmUgYSBidWZmZXIgb3IgYSBzdHJpbmcnXG4gICAgICAgIH1cbiAgICAgICAgcHVibGljS2V5T2JqZWN0ID0gU3ViamVjdFB1YmxpY0tleUluZm9BU04uZGVjb2RlKHB1YmxpY0tleSwgJ2RlcicpXG4gICAgfSBlbHNlIGlmIChvcmlnaW5hbEZvcm1hdCA9PT0gJ3BlbScpIHtcbiAgICAgICAgaWYgKCF0eXBlb2YgcHVibGljS2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgJ3B1YmxpYyBrZXkgbXVzdCBiZSBhIHN0cmluZydcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWNLZXlPYmplY3QgPSBTdWJqZWN0UHVibGljS2V5SW5mb0FTTi5kZWNvZGUocHVibGljS2V5LCAncGVtJywgdGhpcy5vcHRpb25zLnB1YmxpY1BFTU9wdGlvbnMpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgJ2ludmFsaWQgcHVibGljIGtleSBmb3JtYXQnXG4gICAgfVxuXG4gICAgLyogRXhwb3J0IHRoZSBwcml2YXRlIGtleSBvYmplY3QgdG8gdGhlIGRlc2lyZWQgZm9ybWF0ICovXG4gICAgaWYgKGRlc3RpbmF0aW9uRm9ybWF0ID09PSAncmF3Jykge1xuICAgICAgICByZXR1cm4gcHVibGljS2V5T2JqZWN0LnB1Yi5kYXRhLnRvU3RyaW5nKCdoZXgnKVxuICAgIH0gZWxzZSBpZiAoZGVzdGluYXRpb25Gb3JtYXQgPT09ICdkZXInKSB7XG4gICAgICAgIHJldHVybiBTdWJqZWN0UHVibGljS2V5SW5mb0FTTi5lbmNvZGUocHVibGljS2V5T2JqZWN0LCAnZGVyJykudG9TdHJpbmcoJ2hleCcpXG4gICAgfSBlbHNlIGlmIChkZXN0aW5hdGlvbkZvcm1hdCA9PT0gJ3BlbScpIHtcbiAgICAgICAgcmV0dXJuIFN1YmplY3RQdWJsaWNLZXlJbmZvQVNOLmVuY29kZShwdWJsaWNLZXlPYmplY3QsICdwZW0nLCB0aGlzLm9wdGlvbnMucHVibGljUEVNT3B0aW9ucylcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyAnaW52YWxpZCBkZXN0aW5hdGlvbiBmb3JtYXQgZm9yIHB1YmxpYyBrZXknXG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEtleUVuY29kZXI7IiwicmVxdWlyZShcIi4uLy4uLy4uL2VuZ2luZS9jb3JlXCIpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuY29uc3QgeWF6bCA9ICQkLnJlcXVpcmUoXCJ5YXpsXCIpO1xuY29uc3QgeWF1emwgPSAkJC5yZXF1aXJlKFwieWF1emxcIik7XG5jb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcbmNvbnN0IGlzU3RyZWFtID0gcmVxdWlyZShcIi4vdXRpbHMvaXNTdHJlYW1cIik7XG5cbmZ1bmN0aW9uIFBza0FyY2hpdmVyKCkge1xuXHRsZXQgemlwZmlsZSA9IG5ldyB5YXpsLlppcEZpbGUoKTtcblx0ZnVuY3Rpb24gemlwRm9sZGVyUmVjdXJzaXZlbHkoaW5wdXRQYXRoLCByb290ID0gJycpIHtcblx0XHRjb25zdCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGlucHV0UGF0aCk7XG5cdFx0ZmlsZXMuZm9yRWFjaChmdW5jdGlvbiAoZmlsZSkge1xuXHRcdFx0Y29uc3QgdGVtcFBhdGggPSBwYXRoLmpvaW4oaW5wdXRQYXRoLCBmaWxlKTtcblx0XHRcdGlmICghZnMubHN0YXRTeW5jKHRlbXBQYXRoKS5pc0RpcmVjdG9yeSgpKSB7XG5cdFx0XHRcdHppcGZpbGUuYWRkRmlsZSh0ZW1wUGF0aCwgcGF0aC5qb2luKHJvb3QsIGZpbGUpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHppcEZvbGRlclJlY3Vyc2l2ZWx5KHRlbXBQYXRoLCBwYXRoLmpvaW4ocm9vdCwgZmlsZSkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0dGhpcy56aXAgPSBmdW5jdGlvbiAoaW5wdXRQYXRoLCBvdXRwdXQsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIGV4dCA9IFwiXCI7XG5cdFx0aWYoZnMubHN0YXRTeW5jKGlucHV0UGF0aCkuaXNEaXJlY3RvcnkoKSkge1xuXHRcdFx0emlwRm9sZGVyUmVjdXJzaXZlbHkoaW5wdXRQYXRoKTtcblx0XHR9ZWxzZXtcblx0XHRcdHZhciBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoaW5wdXRQYXRoKTtcblx0XHRcdHppcGZpbGUuYWRkRmlsZShpbnB1dFBhdGgsIGZpbGVuYW1lKTtcblx0XHRcdHZhciBzcGxpdEZpbGVuYW1lID0gZmlsZW5hbWUuc3BsaXQoXCIuXCIpO1xuXHRcdFx0aWYoc3BsaXRGaWxlbmFtZS5sZW5ndGggPj0gMiApe1xuXHRcdFx0XHRleHQgPSBcIi5cIiArIHNwbGl0RmlsZW5hbWVbc3BsaXRGaWxlbmFtZS5sZW5ndGggLSAxXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0emlwZmlsZS5lbmQoKTtcblx0XHRpZihpc1N0cmVhbS5pc1dyaXRhYmxlKG91dHB1dCkpe1xuXHRcdFx0Y2FsbGJhY2sobnVsbCwgemlwZmlsZS5vdXRwdXRTdHJlYW0ucGlwZShvdXRwdXQpKTtcblx0XHR9ZWxzZSBpZih0eXBlb2Ygb3V0cHV0ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHQkJC5lbnN1cmVGb2xkZXJFeGlzdHMob3V0cHV0LCAoKSA9PiB7XG5cdFx0XHRcdHZhciBkZXN0aW5hdGlvblBhdGggPSBwYXRoLmpvaW4ob3V0cHV0LCBwYXRoLmJhc2VuYW1lKGlucHV0UGF0aCwgZXh0KSArIFwiLnppcFwiKTtcblx0XHRcdFx0emlwZmlsZS5vdXRwdXRTdHJlYW0ucGlwZShmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0aW5hdGlvblBhdGgpKS5vbihcImNsb3NlXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcblxuXHR0aGlzLnVuemlwID0gZnVuY3Rpb24gKGlucHV0LCBvdXRwdXRQYXRoLCBjYWxsYmFjaykge1xuXHRcdHlhdXpsLm9wZW4oaW5wdXQsIHtsYXp5RW50cmllczogdHJ1ZX0sIGZ1bmN0aW9uIChlcnIsIHppcGZpbGUpIHtcblx0XHRcdGlmIChlcnIpIHRocm93IGVycjtcblx0XHRcdHppcGZpbGUucmVhZEVudHJ5KCk7XG5cdFx0XHR6aXBmaWxlLm9uY2UoXCJlbmRcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0fSk7XG5cdFx0XHR6aXBmaWxlLm9uKFwiZW50cnlcIiwgZnVuY3Rpb24gKGVudHJ5KSB7XG5cdFx0XHRcdGlmIChlbnRyeS5maWxlTmFtZS5lbmRzV2l0aChwYXRoLnNlcCkpIHtcblx0XHRcdFx0XHR6aXBmaWxlLnJlYWRFbnRyeSgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGxldCBmb2xkZXIgPSBwYXRoLmRpcm5hbWUoZW50cnkuZmlsZU5hbWUpO1xuXHRcdFx0XHRcdCQkLmVuc3VyZUZvbGRlckV4aXN0cyhwYXRoLmpvaW4ob3V0cHV0UGF0aCwgZm9sZGVyKSwgKCkgPT4ge1xuXHRcdFx0XHRcdFx0emlwZmlsZS5vcGVuUmVhZFN0cmVhbShlbnRyeSwgZnVuY3Rpb24gKGVyciwgcmVhZFN0cmVhbSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoZXJyKSB0aHJvdyBlcnI7XG5cblx0XHRcdFx0XHRcdFx0cmVhZFN0cmVhbS5vbihcImVuZFwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0emlwZmlsZS5yZWFkRW50cnkoKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdGxldCBmaWxlTmFtZSA9IHBhdGguam9pbihvdXRwdXRQYXRoLCBlbnRyeS5maWxlTmFtZSk7XG5cdFx0XHRcdFx0XHRcdGxldCBmb2xkZXIgPSBwYXRoLmRpcm5hbWUoZmlsZU5hbWUpO1xuXHRcdFx0XHRcdFx0XHQkJC5lbnN1cmVGb2xkZXJFeGlzdHMoZm9sZGVyLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IG91dHB1dCA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGZpbGVOYW1lKTtcblx0XHRcdFx0XHRcdFx0XHRyZWFkU3RyZWFtLnBpcGUob3V0cHV0KTtcblxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxufVxuXG4vLyBuZXcgUHNrQXJjaGl2ZXIoKS56aXAoXCJDOlxcXFxVc2Vyc1xcXFxBY2VyXFxcXFdlYnN0b3JtUHJvamVjdHNcXFxccHJpdmF0ZXNreVxcXFx0ZXN0c1xcXFxwc2stdW5pdC10ZXN0aW5nXFxcXHppcFxcXFxpbnB1dFxcXFx0ZXN0XCIsIFwiQzpcXFxcVXNlcnNcXFxcQWNlclxcXFxXZWJzdG9ybVByb2plY3RzXFxcXHByaXZhdGVza3lcXFxcdGVzdHNcXFxccHNrLXVuaXQtdGVzdGluZ1xcXFx6aXBcXFxcaW5wdXRcXFxcdGVzdFxcXFxvdXRwdXRcIik7XG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBQc2tBcmNoaXZlcigpOyIsIlxuY29uc3QgY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5jb25zdCBpc1N0cmVhbSA9IHJlcXVpcmUoXCIuL2lzU3RyZWFtXCIpO1xuY29uc3QgYXJjaGl2ZXIgPSByZXF1aXJlKFwiLi4vcHNrLWFyY2hpdmVyXCIpO1xuY29uc3QgYWxnb3JpdGhtID0gJ2Flcy0yNTYtZ2NtJztcbmZ1bmN0aW9uIGVuY29kZShidWZmZXIpIHtcblx0cmV0dXJuIGJ1ZmZlci50b1N0cmluZygnYmFzZTY0Jylcblx0XHQucmVwbGFjZSgvXFwrL2csICcnKVxuXHRcdC5yZXBsYWNlKC9cXC8vZywgJycpXG5cdFx0LnJlcGxhY2UoLz0rJC8sICcnKTtcbn1cbmZ1bmN0aW9uIGRlbGV0ZUZvbGRlcihmb2xkZXJQYXRoKSB7XG5cdHZhciBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGZvbGRlclBhdGgpO1xuXHRmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG5cdFx0dmFyIHRlbXBQYXRoID0gcGF0aC5qb2luKGZvbGRlclBhdGgsIGZpbGUpO1xuXHRcdGlmKGZzLnN0YXRTeW5jKHRlbXBQYXRoKS5pc0RpcmVjdG9yeSgpKXtcblx0XHRcdGRlbGV0ZUZvbGRlcih0ZW1wUGF0aCk7XG5cdFx0fWVsc2V7XG5cdFx0XHRmcy51bmxpbmtTeW5jKHRlbXBQYXRoKTtcblx0XHR9XG5cdH0pO1xuXHRmcy5ybWRpclN5bmMoZm9sZGVyUGF0aCk7XG59XG5mdW5jdGlvbiBlbmNyeXB0RmlsZShpbnB1dFBhdGgsIGRlc3RpbmF0aW9uUGF0aCwgcGFzc3dvcmQpe1xuXHRpZighZnMuZXhpc3RzU3luYyhwYXRoLmRpcm5hbWUoZGVzdGluYXRpb25QYXRoKSkpe1xuXHRcdGZzLm1rZGlyU3luYyhwYXRoLmRpcm5hbWUoZGVzdGluYXRpb25QYXRoKSk7XG5cdH1cblx0aWYoIWZzLmV4aXN0c1N5bmMoZGVzdGluYXRpb25QYXRoKSl7XG5cdFx0ZnMud3JpdGVGaWxlU3luYyhkZXN0aW5hdGlvblBhdGgsXCJcIik7XG5cdH1cblx0dmFyIHdzID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdGluYXRpb25QYXRoLCB7YXV0b0Nsb3NlOiBmYWxzZX0pO1xuXHR2YXIga2V5U2FsdCAgICAgICA9IGNyeXB0by5yYW5kb21CeXRlcygzMik7XG5cdHZhciBrZXkgICAgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIGtleVNhbHQsIDEwMDAwLCAzMiwgJ3NoYTUxMicpO1xuXG5cdHZhciBhYWRTYWx0ICAgICAgID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDMyKTtcblx0dmFyIGFhZCAgICAgICAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwgYWFkU2FsdCwgMTAwMDAsIDMyLCAnc2hhNTEyJyk7XG5cblx0dmFyIHNhbHQgICAgICAgICAgPSBCdWZmZXIuY29uY2F0KFtrZXlTYWx0LCBhYWRTYWx0XSk7XG5cdHZhciBpdiAgICAgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIHNhbHQsIDEwMDAwLCAxMiwgJ3NoYTUxMicpO1xuXG5cdHZhciBjaXBoZXIgICAgICAgID0gY3J5cHRvLmNyZWF0ZUNpcGhlcml2KGFsZ29yaXRobSwga2V5LCBpdik7XG5cdGNpcGhlci5zZXRBQUQoYWFkKTtcblxuXHRhcmNoaXZlci56aXAoaW5wdXRQYXRoLCBjaXBoZXIsIGZ1bmN0aW9uIChlcnIsIGNpcGhlclN0cmVhbSkge1xuXHRcdGNpcGhlclN0cmVhbS5vbihcImRhdGFcIiwgZnVuY3Rpb24gKGNodW5rKSB7XG5cdFx0XHR3cy53cml0ZShjaHVuaylcblx0XHR9KTtcblx0XHRjaXBoZXJTdHJlYW0ub24oJ2VuZCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciB0YWcgPSBjaXBoZXIuZ2V0QXV0aFRhZygpO1xuXHRcdFx0dmFyIGRhdGFUb0FwcGVuZCA9IEJ1ZmZlci5jb25jYXQoW3NhbHQsIHRhZ10pO1xuXHRcdFx0d3Mud3JpdGUoZGF0YVRvQXBwZW5kLCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0XHRcdGlmKGVycikge1xuXHRcdFx0XHRcdHRocm93IGVycjtcblx0XHRcdFx0fVxuXHRcdFx0XHR3cy5jbG9zZSgpO1xuXHRcdFx0XHRmcy5sc3RhdChpbnB1dFBhdGgsIGZ1bmN0aW9uIChlcnIsIHN0YXRzKSB7XG5cdFx0XHRcdFx0aWYoZXJyKXtcblx0XHRcdFx0XHRcdHRocm93IGVycjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYoc3RhdHMuaXNEaXJlY3RvcnkoKSl7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhcImRlbGV0ZSBmb2xkZXJcIik7XG5cdFx0XHRcdFx0XHRkZWxldGVGb2xkZXIoaW5wdXRQYXRoKTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKFwidW5saW5rXCIpO1xuXHRcdFx0XHRcdFx0ZnMudW5saW5rU3luYyhpbnB1dFBhdGgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIkVuZFwiKVxuXHRcdFx0XHR9KVxuXHRcdFx0fSlcblx0XHR9KTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGRlY3J5cHRGaWxlKGVuY3J5cHRlZElucHV0UGF0aCwgdGVtcEZvbGRlciwgcGFzc3dvcmQsIGNhbGxiYWNrKSB7XG5cdGNvbnN0IHN0YXRzICAgICAgICAgICA9IGZzLnN0YXRTeW5jKGVuY3J5cHRlZElucHV0UGF0aCk7XG5cdGNvbnN0IGZpbGVTaXplSW5CeXRlcyA9IHN0YXRzLnNpemU7XG5cdGNvbnN0IGZkICAgICAgICAgICAgICA9IGZzLm9wZW5TeW5jKGVuY3J5cHRlZElucHV0UGF0aCwgXCJyXCIpO1xuXHR2YXIgZW5jcnlwdGVkQXV0aERhdGEgPSBCdWZmZXIuYWxsb2MoODApO1xuXG5cdGZzLnJlYWRTeW5jKGZkLCBlbmNyeXB0ZWRBdXRoRGF0YSwgMCwgODAsIGZpbGVTaXplSW5CeXRlcyAtIDgwKTtcblx0dmFyIHNhbHQgICAgICAgPSBlbmNyeXB0ZWRBdXRoRGF0YS5zbGljZSgwLCA2NCk7XG5cdHZhciBrZXlTYWx0ICAgID0gc2FsdC5zbGljZSgwLCAzMik7XG5cdHZhciBhYWRTYWx0ICAgID0gc2FsdC5zbGljZSgtMzIpO1xuXG5cdHZhciBpdiAgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIHNhbHQsIDEwMDAwLCAxMiwgJ3NoYTUxMicpO1xuXHR2YXIga2V5ICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBrZXlTYWx0LCAxMDAwMCwgMzIsICdzaGE1MTInKTtcblx0dmFyIGFhZCAgICAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwgYWFkU2FsdCwgMTAwMDAsIDMyLCAnc2hhNTEyJyk7XG5cdHZhciB0YWcgICAgICAgID0gZW5jcnlwdGVkQXV0aERhdGEuc2xpY2UoLTE2KTtcblxuXHR2YXIgZGVjaXBoZXIgICA9IGNyeXB0by5jcmVhdGVEZWNpcGhlcml2KGFsZ29yaXRobSwga2V5LCBpdik7XG5cblx0ZGVjaXBoZXIuc2V0QUFEKGFhZCk7XG5cdGRlY2lwaGVyLnNldEF1dGhUYWcodGFnKTtcblx0dmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbShlbmNyeXB0ZWRJbnB1dFBhdGgsIHtzdGFydDogMCwgZW5kOiBmaWxlU2l6ZUluQnl0ZXMgLSA4MX0pO1xuXHRpZighZnMuZXhpc3RzU3luYyh0ZW1wRm9sZGVyKSl7XG5cdFx0ZnMubWtkaXJTeW5jKHRlbXBGb2xkZXIpO1xuXHR9XG5cdHZhciB0ZW1wQXJjaGl2ZVBhdGggPSBwYXRoLmpvaW4odGVtcEZvbGRlciwgcGF0aC5iYXNlbmFtZShlbmNyeXB0ZWRJbnB1dFBhdGgpK1wiLnppcFwiKTtcblx0aWYoIWZzLmV4aXN0c1N5bmModGVtcEFyY2hpdmVQYXRoKSl7XG5cdFx0ZnMud3JpdGVGaWxlU3luYyh0ZW1wQXJjaGl2ZVBhdGgpO1xuXHR9XG5cdHZhciB3cyA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHRlbXBBcmNoaXZlUGF0aCwge2F1dG9DbG9zZTogZmFsc2V9KTtcblx0d3Mub24oXCJmaW5pc2hcIiwgZnVuY3Rpb24gKGVycikge1xuXHRcdGlmKGVycil7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fWVsc2V7XG5cdFx0XHR3cy5jbG9zZSgpO1xuXHRcdFx0Ly8gZGVsZXRlRm9sZGVyKHRlbXBGb2xkZXIpO1xuXHRcdFx0dmFyIG5ld1BhdGggPSBwYXRoLmpvaW4ocGF0aC5ub3JtYWxpemUoZW5jcnlwdGVkSW5wdXRQYXRoK1wiLy4uXCIpLCBlbmNvZGUoY3J5cHRvLnJhbmRvbUJ5dGVzKDMyKSkpO1xuXHRcdFx0ZnMucmVuYW1lU3luYyhlbmNyeXB0ZWRJbnB1dFBhdGgsIG5ld1BhdGgpO1xuXHRcdFx0ZnMudW5saW5rU3luYyhuZXdQYXRoKTtcblx0XHRcdC8vIGZzLnVubGlua1N5bmModGVtcEFyY2hpdmVQYXRoKTtcblx0XHRcdGNhbGxiYWNrKG51bGwsIHRlbXBBcmNoaXZlUGF0aCk7XG5cblx0XHR9XG5cdH0pO1xuXHRycy5waXBlKGRlY2lwaGVyKS5waXBlKHdzKTtcblxufVxuXG5mdW5jdGlvbiBjcmVhdGVQc2tIYXNoKGRhdGEpe1xuXHR2YXIgaGFzaDUxMiA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGE1MTInKTtcblx0dmFyIGhhc2gyNTYgPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMjU2Jyk7XG5cdGhhc2g1MTIudXBkYXRlKGRhdGEpO1xuXHRoYXNoMjU2LnVwZGF0ZShoYXNoNTEyLmRpZ2VzdCgpKTtcblx0cmV0dXJuIGhhc2gyNTYuZGlnZXN0KCk7XG59XG5cbmZ1bmN0aW9uIGlzSnNvbihkYXRhKXtcblx0dHJ5e1xuXHRcdEpTT04ucGFyc2UoZGF0YSk7XG5cdH1jYXRjaChlKXtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0cmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlU2FsdChpbnB1dERhdGEsIHNhbHRMZW4pe1xuXHR2YXIgaGFzaCAgID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTUxMicpO1xuXHRoYXNoLnVwZGF0ZShpbnB1dERhdGEpO1xuXHR2YXIgZGlnZXN0ID0gQnVmZmVyLmZyb20oaGFzaC5kaWdlc3QoJ2hleCcpLCAnYmluYXJ5Jyk7XG5cblx0cmV0dXJuIGRpZ2VzdC5zbGljZSgwLCBzYWx0TGVuKTtcbn1cblxuZnVuY3Rpb24gZW5jcnlwdChkYXRhLCBwYXNzd29yZCl7XG5cdHZhciBrZXlTYWx0ICAgICAgID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDMyKTtcblx0dmFyIGtleSAgICAgICAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwga2V5U2FsdCwgMTAwMDAsIDMyLCAnc2hhNTEyJyk7XG5cblx0dmFyIGFhZFNhbHQgICAgICAgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoMzIpO1xuXHR2YXIgYWFkICAgICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBhYWRTYWx0LCAxMDAwMCwgMzIsICdzaGE1MTInKTtcblxuXHR2YXIgc2FsdCAgICAgICAgICA9IEJ1ZmZlci5jb25jYXQoW2tleVNhbHQsIGFhZFNhbHRdKTtcblx0dmFyIGl2ICAgICAgICAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwgc2FsdCwgMTAwMDAsIDEyLCAnc2hhNTEyJyk7XG5cblx0dmFyIGNpcGhlciAgICAgICAgPSBjcnlwdG8uY3JlYXRlQ2lwaGVyaXYoYWxnb3JpdGhtLCBrZXksIGl2KTtcblx0Y2lwaGVyLnNldEFBRChhYWQpO1xuXHR2YXIgZW5jcnlwdGVkVGV4dCA9IGNpcGhlci51cGRhdGUoZGF0YSwnYmluYXJ5Jyk7XG5cdHZhciBmaW5hbCA9IEJ1ZmZlci5mcm9tKGNpcGhlci5maW5hbCgnYmluYXJ5JyksJ2JpbmFyeScpO1xuXHR2YXIgdGFnID0gY2lwaGVyLmdldEF1dGhUYWcoKTtcblxuXHRlbmNyeXB0ZWRUZXh0ID0gQnVmZmVyLmNvbmNhdChbZW5jcnlwdGVkVGV4dCwgZmluYWxdKTtcblxuXHRyZXR1cm4gQnVmZmVyLmNvbmNhdChbc2FsdCwgZW5jcnlwdGVkVGV4dCwgdGFnXSk7XG59XG5cbmZ1bmN0aW9uIGRlY3J5cHQoZW5jcnlwdGVkRGF0YSwgcGFzc3dvcmQpe1xuXHR2YXIgc2FsdCAgICAgICA9IGVuY3J5cHRlZERhdGEuc2xpY2UoMCwgNjQpO1xuXHR2YXIga2V5U2FsdCAgICA9IHNhbHQuc2xpY2UoMCwgMzIpO1xuXHR2YXIgYWFkU2FsdCAgICA9IHNhbHQuc2xpY2UoLTMyKTtcblxuXHR2YXIgaXYgICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBzYWx0LCAxMDAwMCwgMTIsICdzaGE1MTInKTtcblx0dmFyIGtleSAgICAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwga2V5U2FsdCwgMTAwMDAsIDMyLCAnc2hhNTEyJyk7XG5cdHZhciBhYWQgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIGFhZFNhbHQsIDEwMDAwLCAzMiwgJ3NoYTUxMicpO1xuXG5cdHZhciBjaXBoZXJ0ZXh0ID0gZW5jcnlwdGVkRGF0YS5zbGljZSg2NCwgZW5jcnlwdGVkRGF0YS5sZW5ndGggLSAxNik7XG5cdHZhciB0YWcgICAgICAgID0gZW5jcnlwdGVkRGF0YS5zbGljZSgtMTYpO1xuXG5cdHZhciBkZWNpcGhlciAgID0gY3J5cHRvLmNyZWF0ZURlY2lwaGVyaXYoYWxnb3JpdGhtLCBrZXksIGl2KTtcblx0ZGVjaXBoZXIuc2V0QXV0aFRhZyh0YWcpO1xuXHRkZWNpcGhlci5zZXRBQUQoYWFkKTtcblxuXHR2YXIgcGxhaW50ZXh0ICA9IEJ1ZmZlci5mcm9tKGRlY2lwaGVyLnVwZGF0ZShjaXBoZXJ0ZXh0LCAnYmluYXJ5JyksICdiaW5hcnknKTtcblx0dmFyIGZpbmFsICAgICAgPSBCdWZmZXIuZnJvbShkZWNpcGhlci5maW5hbCgnYmluYXJ5JyksICdiaW5hcnknKTtcblx0cGxhaW50ZXh0ICAgICAgPSBCdWZmZXIuY29uY2F0KFtwbGFpbnRleHQsIGZpbmFsXSk7XG5cblx0cmV0dXJuIHBsYWludGV4dDtcbn1cblxuXG5mdW5jdGlvbiBkZXJpdmVLZXkocGFzc3dvcmQsIGl0ZXJhdGlvbnMsIGRrTGVuKSB7XG5cdGl0ZXJhdGlvbnMgPSBpdGVyYXRpb25zIHx8IDEwMDAwO1xuXHRka0xlbiAgICAgID0gZGtMZW4gfHwgMzI7XG5cdHZhciBzYWx0ICAgPSBnZW5lcmF0ZVNhbHQocGFzc3dvcmQsIDMyKTtcblx0dmFyIGRrICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBzYWx0LCBpdGVyYXRpb25zLCBka0xlbiwgJ3NoYTUxMicpO1xuXHRyZXR1cm4gQnVmZmVyLmZyb20oZGspO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0Y3JlYXRlUHNrSGFzaCxcblx0ZW5jcnlwdCxcblx0ZW5jcnlwdEZpbGUsXG5cdGRlY3J5cHQsXG5cdGRlY3J5cHRGaWxlLFxuXHRkZWxldGVGb2xkZXIsXG5cdGRlcml2ZUtleSxcblx0ZW5jb2RlLFxuXHRpc0pzb24sXG59O1xuXG5cbiIsInZhciBzdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKVxuXG5cbmZ1bmN0aW9uIGlzU3RyZWFtIChvYmopIHtcblx0cmV0dXJuIG9iaiBpbnN0YW5jZW9mIHN0cmVhbS5TdHJlYW1cbn1cblxuXG5mdW5jdGlvbiBpc1JlYWRhYmxlIChvYmopIHtcblx0cmV0dXJuIGlzU3RyZWFtKG9iaikgJiYgdHlwZW9mIG9iai5fcmVhZCA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBvYmouX3JlYWRhYmxlU3RhdGUgPT0gJ29iamVjdCdcbn1cblxuXG5mdW5jdGlvbiBpc1dyaXRhYmxlIChvYmopIHtcblx0cmV0dXJuIGlzU3RyZWFtKG9iaikgJiYgdHlwZW9mIG9iai5fd3JpdGUgPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb2JqLl93cml0YWJsZVN0YXRlID09ICdvYmplY3QnXG59XG5cblxuZnVuY3Rpb24gaXNEdXBsZXggKG9iaikge1xuXHRyZXR1cm4gaXNSZWFkYWJsZShvYmopICYmIGlzV3JpdGFibGUob2JqKVxufVxuXG5cbm1vZHVsZS5leHBvcnRzICAgICAgICAgICAgPSBpc1N0cmVhbTtcbm1vZHVsZS5leHBvcnRzLmlzUmVhZGFibGUgPSBpc1JlYWRhYmxlO1xubW9kdWxlLmV4cG9ydHMuaXNXcml0YWJsZSA9IGlzV3JpdGFibGU7XG5tb2R1bGUuZXhwb3J0cy5pc0R1cGxleCAgID0gaXNEdXBsZXg7IiwiLypcbiBTaWduU2VucyBoZWxwZXIgZnVuY3Rpb25zXG4gKi9cbmNvbnN0IGNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xuXG5leHBvcnRzLndpcGVPdXRzaWRlUGF5bG9hZCA9IGZ1bmN0aW9uIHdpcGVPdXRzaWRlUGF5bG9hZChoYXNoU3RyaW5nSGV4YSwgcG9zLCBzaXplKXtcbiAgICB2YXIgcmVzdWx0O1xuICAgIHZhciBzeiA9IGhhc2hTdHJpbmdIZXhhLmxlbmd0aDtcblxuICAgIHZhciBlbmQgPSAocG9zICsgc2l6ZSkgJSBzejtcblxuICAgIGlmKHBvcyA8IGVuZCl7XG4gICAgICAgIHJlc3VsdCA9ICcwJy5yZXBlYXQocG9zKSArICBoYXNoU3RyaW5nSGV4YS5zdWJzdHJpbmcocG9zLCBlbmQpICsgJzAnLnJlcGVhdChzeiAtIGVuZCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXN1bHQgPSBoYXNoU3RyaW5nSGV4YS5zdWJzdHJpbmcoMCwgZW5kKSArICcwJy5yZXBlYXQocG9zIC0gZW5kKSArIGhhc2hTdHJpbmdIZXhhLnN1YnN0cmluZyhwb3MsIHN6KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuXG5cbmV4cG9ydHMuZXh0cmFjdFBheWxvYWQgPSBmdW5jdGlvbiBleHRyYWN0UGF5bG9hZChoYXNoU3RyaW5nSGV4YSwgcG9zLCBzaXplKXtcbiAgICB2YXIgcmVzdWx0O1xuXG4gICAgdmFyIHN6ID0gaGFzaFN0cmluZ0hleGEubGVuZ3RoO1xuICAgIHZhciBlbmQgPSAocG9zICsgc2l6ZSkgJSBzejtcblxuICAgIGlmKCBwb3MgPCBlbmQpe1xuICAgICAgICByZXN1bHQgPSBoYXNoU3RyaW5nSGV4YS5zdWJzdHJpbmcocG9zLCBwb3MgKyBzaXplKTtcbiAgICB9IGVsc2V7XG5cbiAgICAgICAgaWYoMCAhPSBlbmQpe1xuICAgICAgICAgICAgcmVzdWx0ID0gaGFzaFN0cmluZ0hleGEuc3Vic3RyaW5nKDAsIGVuZClcbiAgICAgICAgfSAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSBoYXNoU3RyaW5nSGV4YS5zdWJzdHJpbmcocG9zLCBzeik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cblxuXG5leHBvcnRzLmZpbGxQYXlsb2FkID0gZnVuY3Rpb24gZmlsbFBheWxvYWQocGF5bG9hZCwgcG9zLCBzaXplKXtcbiAgICB2YXIgc3ogPSA2NDtcbiAgICB2YXIgcmVzdWx0ID0gXCJcIjtcblxuICAgIHZhciBlbmQgPSAocG9zICsgc2l6ZSkgJSBzejtcblxuICAgIGlmKCBwb3MgPCBlbmQpe1xuICAgICAgICByZXN1bHQgPSAnMCcucmVwZWF0KHBvcykgKyBwYXlsb2FkICsgJzAnLnJlcGVhdChzeiAtIGVuZCk7XG4gICAgfSBlbHNle1xuICAgICAgICByZXN1bHQgPSBwYXlsb2FkLnN1YnN0cmluZygwLGVuZCk7XG4gICAgICAgIHJlc3VsdCArPSAnMCcucmVwZWF0KHBvcyAtIGVuZCk7XG4gICAgICAgIHJlc3VsdCArPSBwYXlsb2FkLnN1YnN0cmluZyhlbmQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5cblxuZXhwb3J0cy5nZW5lcmF0ZVBvc0hhc2hYVGltZXMgPSBmdW5jdGlvbiBnZW5lcmF0ZVBvc0hhc2hYVGltZXMoYnVmZmVyLCBwb3MsIHNpemUsIGNvdW50KXsgLy9nZW5lcmF0ZSBwb3NpdGlvbmFsIGhhc2hcbiAgICB2YXIgcmVzdWx0ICA9IGJ1ZmZlci50b1N0cmluZyhcImhleFwiKTtcblxuICAgIC8qaWYocG9zICE9IC0xIClcbiAgICAgICAgcmVzdWx0W3Bvc10gPSAwOyAqL1xuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspe1xuICAgICAgICB2YXIgaGFzaCA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGEyNTYnKTtcbiAgICAgICAgcmVzdWx0ID0gZXhwb3J0cy53aXBlT3V0c2lkZVBheWxvYWQocmVzdWx0LCBwb3MsIHNpemUpO1xuICAgICAgICBoYXNoLnVwZGF0ZShyZXN1bHQpO1xuICAgICAgICByZXN1bHQgPSBoYXNoLmRpZ2VzdCgnaGV4Jyk7XG4gICAgfVxuICAgIHJldHVybiBleHBvcnRzLndpcGVPdXRzaWRlUGF5bG9hZChyZXN1bHQsIHBvcywgc2l6ZSk7XG59XG5cbmV4cG9ydHMuaGFzaFN0cmluZ0FycmF5ID0gZnVuY3Rpb24gKGNvdW50ZXIsIGFyciwgcGF5bG9hZFNpemUpe1xuXG4gICAgY29uc3QgaGFzaCA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGEyNTYnKTtcbiAgICB2YXIgcmVzdWx0ID0gY291bnRlci50b1N0cmluZygxNik7XG5cbiAgICBmb3IodmFyIGkgPSAwIDsgaSA8IDY0OyBpKyspe1xuICAgICAgICByZXN1bHQgKz0gZXhwb3J0cy5leHRyYWN0UGF5bG9hZChhcnJbaV0saSwgcGF5bG9hZFNpemUpO1xuICAgIH1cblxuICAgIGhhc2gudXBkYXRlKHJlc3VsdCk7XG4gICAgdmFyIHJlc3VsdCA9IGhhc2guZGlnZXN0KCdoZXgnKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5cblxuXG5cblxuZnVuY3Rpb24gZHVtcE1lbWJlcihvYmope1xuICAgIHZhciB0eXBlID0gQXJyYXkuaXNBcnJheShvYmopID8gXCJhcnJheVwiIDogdHlwZW9mIG9iajtcbiAgICBpZihvYmogPT09IG51bGwpe1xuICAgICAgICByZXR1cm4gXCJudWxsXCI7XG4gICAgfVxuICAgIGlmKG9iaiA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgcmV0dXJuIFwidW5kZWZpbmVkXCI7XG4gICAgfVxuXG4gICAgc3dpdGNoKHR5cGUpe1xuICAgICAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpyZXR1cm4gb2JqLnRvU3RyaW5nKCk7IGJyZWFrO1xuICAgICAgICBjYXNlIFwib2JqZWN0XCI6IHJldHVybiBleHBvcnRzLmR1bXBPYmplY3RGb3JIYXNoaW5nKG9iaik7IGJyZWFrO1xuICAgICAgICBjYXNlIFwiYm9vbGVhblwiOiByZXR1cm4gIG9iaj8gXCJ0cnVlXCI6IFwiZmFsc2VcIjsgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJhcnJheVwiOlxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFwiXCI7XG4gICAgICAgICAgICBmb3IodmFyIGk9MDsgaSA8IG9iai5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IGV4cG9ydHMuZHVtcE9iamVjdEZvckhhc2hpbmcob2JqW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlR5cGUgXCIgKyAgdHlwZSArIFwiIGNhbm5vdCBiZSBjcnlwdG9ncmFwaGljYWxseSBkaWdlc3RlZFwiKTtcbiAgICB9XG5cbn1cblxuXG5leHBvcnRzLmR1bXBPYmplY3RGb3JIYXNoaW5nID0gZnVuY3Rpb24ob2JqKXtcbiAgICB2YXIgcmVzdWx0ID0gXCJcIjtcblxuICAgIGlmKG9iaiA9PT0gbnVsbCl7XG4gICAgICAgIHJldHVybiBcIm51bGxcIjtcbiAgICB9XG4gICAgaWYob2JqID09PSB1bmRlZmluZWQpe1xuICAgICAgICByZXR1cm4gXCJ1bmRlZmluZWRcIjtcbiAgICB9XG5cbiAgICB2YXIgYmFzaWNUeXBlcyA9IHtcbiAgICAgICAgXCJhcnJheVwiICAgICA6IHRydWUsXG4gICAgICAgIFwibnVtYmVyXCIgICAgOiB0cnVlLFxuICAgICAgICBcImJvb2xlYW5cIiAgIDogdHJ1ZSxcbiAgICAgICAgXCJzdHJpbmdcIiAgICA6IHRydWUsXG4gICAgICAgIFwib2JqZWN0XCIgICAgOiBmYWxzZVxuICAgIH1cblxuICAgIHZhciB0eXBlID0gQXJyYXkuaXNBcnJheShvYmopID8gXCJhcnJheVwiIDogdHlwZW9mIG9iajtcbiAgICBpZiggYmFzaWNUeXBlc1t0eXBlXSl7XG4gICAgICAgIHJldHVybiBkdW1wTWVtYmVyKG9iaik7XG4gICAgfVxuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuICAgIGtleXMuc29ydCgpO1xuXG5cbiAgICBmb3IodmFyIGk9MDsgaSA8IGtleXMubGVuZ3RoOyBpKyspe1xuICAgICAgICByZXN1bHQgKz0gZHVtcE1lbWJlcihrZXlzW2ldKTtcbiAgICAgICAgcmVzdWx0ICs9IGR1bXBNZW1iZXIob2JqW2tleXNbaV1dKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5cbmV4cG9ydHMuaGFzaFZhbHVlcyAgPSBmdW5jdGlvbiAodmFsdWVzKXtcbiAgICBjb25zdCBoYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTI1NicpO1xuICAgIHZhciByZXN1bHQgPSBleHBvcnRzLmR1bXBPYmplY3RGb3JIYXNoaW5nKHZhbHVlcyk7XG4gICAgaGFzaC51cGRhdGUocmVzdWx0KTtcbiAgICByZXR1cm4gaGFzaC5kaWdlc3QoJ2hleCcpO1xufTtcblxuZXhwb3J0cy5nZXRKU09ORnJvbVNpZ25hdHVyZSA9IGZ1bmN0aW9uIGdldEpTT05Gcm9tU2lnbmF0dXJlKHNpZ25hdHVyZSwgc2l6ZSl7XG4gICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgcHJvb2Y6W11cbiAgICB9O1xuICAgIHZhciBhID0gc2lnbmF0dXJlLnNwbGl0KFwiOlwiKTtcbiAgICByZXN1bHQuYWdlbnQgICAgICAgID0gYVswXTtcbiAgICByZXN1bHQuY291bnRlciAgICAgID0gIHBhcnNlSW50KGFbMV0sIFwiaGV4XCIpO1xuICAgIHJlc3VsdC5uZXh0UHVibGljICAgPSAgYVsyXTtcblxuICAgIHZhciBwcm9vZiA9IGFbM11cblxuXG4gICAgaWYocHJvb2YubGVuZ3RoL3NpemUgIT0gNjQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBzaWduYXR1cmUgXCIgKyBwcm9vZik7XG4gICAgfVxuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IDY0OyBpKyspe1xuICAgICAgICByZXN1bHQucHJvb2YucHVzaChleHBvcnRzLmZpbGxQYXlsb2FkKHByb29mLnN1YnN0cmluZyhpICogc2l6ZSwoaSsxKSAqIHNpemUgKSwgaSwgc2l6ZSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0cy5jcmVhdGVTaWduYXR1cmUgPSBmdW5jdGlvbiAoYWdlbnQsY291bnRlciwgbmV4dFB1YmxpYywgYXJyLCBzaXplKXtcbiAgICB2YXIgcmVzdWx0ID0gXCJcIjtcblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspe1xuICAgICAgICByZXN1bHQgKz0gZXhwb3J0cy5leHRyYWN0UGF5bG9hZChhcnJbaV0sIGkgLCBzaXplKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWdlbnQgKyBcIjpcIiArIGNvdW50ZXIgKyBcIjpcIiArIG5leHRQdWJsaWMgKyBcIjpcIiArIHJlc3VsdDtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0XHRcdFx0XHRiZWVzSGVhbGVyOiByZXF1aXJlKFwiLi9saWIvYmVlc0hlYWxlclwiKSxcblx0XHRcdFx0XHRzb3VuZFB1YlN1YjogcmVxdWlyZShcIi4vbGliL3NvdW5kUHViU3ViXCIpLnNvdW5kUHViU3ViLFxuXHRcdFx0XHRcdGZvbGRlck1ROiByZXF1aXJlKFwiLi9saWIvZm9sZGVyTVFcIilcbn07IiwiZnVuY3Rpb24gUXVldWVFbGVtZW50KGNvbnRlbnQpIHtcblx0dGhpcy5jb250ZW50ID0gY29udGVudDtcblx0dGhpcy5uZXh0ID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gUXVldWUoKSB7XG5cdHRoaXMuaGVhZCA9IG51bGw7XG5cdHRoaXMudGFpbCA9IG51bGw7XG5cblx0dGhpcy5wdXNoID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0bGV0IG5ld0VsZW1lbnQgPSBuZXcgUXVldWVFbGVtZW50KHZhbHVlKTtcblx0XHRpZiAoIXRoaXMuaGVhZCkge1xuXHRcdFx0dGhpcy5oZWFkID0gbmV3RWxlbWVudDtcblx0XHRcdHRoaXMudGFpbCA9IG5ld0VsZW1lbnQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudGFpbC5uZXh0ID0gbmV3RWxlbWVudDtcblx0XHRcdHRoaXMudGFpbCA9IG5ld0VsZW1lbnRcblx0XHR9XG5cdH07XG5cblx0dGhpcy5wb3AgPSBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKCF0aGlzLmhlYWQpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0XHRjb25zdCBoZWFkQ29weSA9IHRoaXMuaGVhZDtcblx0XHR0aGlzLmhlYWQgPSB0aGlzLmhlYWQubmV4dDtcblx0XHRyZXR1cm4gaGVhZENvcHkuY29udGVudDtcblx0fTtcblxuXHR0aGlzLmZyb250ID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLmhlYWQgPyB0aGlzLmhlYWQuY29udGVudCA6IHVuZGVmaW5lZDtcblx0fTtcblxuXHR0aGlzLmlzRW1wdHkgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuaGVhZCA9PSBudWxsO1xuXHR9O1xuXG5cdHRoaXNbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKiAoKSB7XG5cdFx0bGV0IGhlYWQgPSB0aGlzLmhlYWQ7XG5cdFx0d2hpbGUoaGVhZCAhPT0gbnVsbCkge1xuXHRcdFx0eWllbGQgaGVhZC5jb250ZW50O1xuXHRcdFx0aGVhZCA9IGhlYWQubmV4dDtcblx0XHR9XG5cdH0uYmluZCh0aGlzKTtcbn1cblxuUXVldWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuXHRsZXQgc3RyaW5naWZpZWRRdWV1ZSA9ICcnO1xuXHRsZXQgaXRlcmF0b3IgPSB0aGlzLmhlYWQ7XG5cdHdoaWxlIChpdGVyYXRvcikge1xuXHRcdHN0cmluZ2lmaWVkUXVldWUgKz0gYCR7SlNPTi5zdHJpbmdpZnkoaXRlcmF0b3IuY29udGVudCl9IGA7XG5cdFx0aXRlcmF0b3IgPSBpdGVyYXRvci5uZXh0O1xuXHR9XG5cdHJldHVybiBzdHJpbmdpZmllZFF1ZXVlXG59O1xuXG5RdWV1ZS5wcm90b3R5cGUuaW5zcGVjdCA9IFF1ZXVlLnByb3RvdHlwZS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBRdWV1ZTsiLCJcbi8qXG4gICAgUHJlcGFyZSB0aGUgc3RhdGUgb2YgYSBzd2FybSB0byBiZSBzZXJpYWxpc2VkXG4qL1xuXG5leHBvcnRzLmFzSlNPTiA9IGZ1bmN0aW9uKHZhbHVlT2JqZWN0LCBwaGFzZU5hbWUsIGFyZ3MsIGNhbGxiYWNrKXtcblxuICAgICAgICB2YXIgdmFsdWVPYmplY3QgPSB2YWx1ZU9iamVjdC52YWx1ZU9mKCk7XG4gICAgICAgIHZhciByZXMgPSB7fTtcbiAgICAgICAgcmVzLnB1YmxpY1ZhcnMgICAgICAgICAgPSB2YWx1ZU9iamVjdC5wdWJsaWNWYXJzO1xuICAgICAgICByZXMucHJpdmF0ZVZhcnMgICAgICAgICA9IHZhbHVlT2JqZWN0LnByaXZhdGVWYXJzO1xuICAgICAgICByZXMubWV0YSAgICAgICAgICAgICAgICA9IHt9O1xuXG4gICAgICAgIHJlcy5tZXRhLnN3YXJtVHlwZU5hbWUgID0gdmFsdWVPYmplY3QubWV0YS5zd2FybVR5cGVOYW1lO1xuICAgICAgICByZXMubWV0YS5zd2FybUlkICAgICAgICA9IHZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1JZDtcbiAgICAgICAgcmVzLm1ldGEudGFyZ2V0ICAgICAgICAgPSB2YWx1ZU9iamVjdC5tZXRhLnRhcmdldDtcblxuICAgICAgICBpZighcGhhc2VOYW1lKXtcbiAgICAgICAgICAgIHJlcy5tZXRhLmNvbW1hbmQgICAgPSBcInN0b3JlZFwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzLm1ldGEucGhhc2VOYW1lICA9IHBoYXNlTmFtZTtcbiAgICAgICAgICAgIHJlcy5tZXRhLmFyZ3MgICAgICAgPSBhcmdzO1xuICAgICAgICAgICAgcmVzLm1ldGEuY29tbWFuZCAgICA9IHZhbHVlT2JqZWN0Lm1ldGEuY29tbWFuZCB8fCBcImV4ZWN1dGVTd2FybVBoYXNlXCI7XG4gICAgICAgIH1cblxuICAgICAgICByZXMubWV0YS53YWl0U3RhY2sgID0gdmFsdWVPYmplY3QubWV0YS53YWl0U3RhY2s7IC8vVE9ETzogdGhpbmsgaWYgaXMgbm90IGJldHRlciB0byBiZSBkZWVwIGNsb25lZCBhbmQgbm90IHJlZmVyZW5jZWQhISFcblxuICAgICAgICBpZihjYWxsYmFjayl7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJhc0pTT046XCIsIHJlcywgdmFsdWVPYmplY3QpO1xuICAgICAgICByZXR1cm4gcmVzO1xufVxuXG5leHBvcnRzLmpzb25Ub05hdGl2ZSA9IGZ1bmN0aW9uKHNlcmlhbGlzZWRWYWx1ZXMsIHJlc3VsdCl7XG5cbiAgICBmb3IodmFyIHYgaW4gc2VyaWFsaXNlZFZhbHVlcy5wdWJsaWNWYXJzKXtcbiAgICAgICAgcmVzdWx0LnB1YmxpY1ZhcnNbdl0gPSBzZXJpYWxpc2VkVmFsdWVzLnB1YmxpY1ZhcnNbdl07XG5cbiAgICB9O1xuICAgIGZvcih2YXIgdiBpbiBzZXJpYWxpc2VkVmFsdWVzLnByaXZhdGVWYXJzKXtcbiAgICAgICAgcmVzdWx0LnByaXZhdGVWYXJzW3ZdID0gc2VyaWFsaXNlZFZhbHVlcy5wcml2YXRlVmFyc1t2XTtcbiAgICB9O1xuXG4gICAgZm9yKHZhciB2IGluIHNlcmlhbGlzZWRWYWx1ZXMubWV0YSl7XG4gICAgICAgIHJlc3VsdC5tZXRhW3ZdID0gc2VyaWFsaXNlZFZhbHVlcy5tZXRhW3ZdO1xuICAgIH07XG5cbn0iLCJcbnZhciBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcbnZhciBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG52YXIgYmVlc0hlYWxlciA9IHJlcXVpcmUoXCIuL2JlZXNIZWFsZXJcIik7XG5cbi8vVE9ETzogcHJldmVudCBhIGNsYXNzIG9mIHJhY2UgY29uZGl0aW9uIHR5cGUgb2YgZXJyb3JzIGJ5IHNpZ25hbGluZyB3aXRoIGZpbGVzIG1ldGFkYXRhIHRvIHRoZSB3YXRjaGVyIHdoZW4gaXQgaXMgc2FmZSB0byBjb25zdW1lXG5cbmZ1bmN0aW9uIEZvbGRlck1RKGZvbGRlciwgY2FsbGJhY2sgPSAoKSA9PiB7fSl7XG5cblx0aWYodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpe1xuXHRcdHRocm93IG5ldyBFcnJvcihcIlNlY29uZCBwYXJhbWV0ZXIgc2hvdWxkIGJlIGEgY2FsbGJhY2sgZnVuY3Rpb25cIik7XG5cdH1cblxuXHRmb2xkZXIgPSBwYXRoLm5vcm1hbGl6ZShmb2xkZXIpO1xuXG5cdGZzLm1rZGlyKGZvbGRlciwgZnVuY3Rpb24oZXJyLCByZXMpe1xuXHRcdGZzLmV4aXN0cyhmb2xkZXIsIGZ1bmN0aW9uKGV4aXN0cykge1xuXHRcdFx0aWYgKGV4aXN0cykge1xuXHRcdFx0XHRjYWxsYmFjayhudWxsLCBmb2xkZXIpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjYWxsYmFjayhlcnIpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcblxuXHRmdW5jdGlvbiBta0ZpbGVOYW1lKHN3YXJtUmF3KXtcblx0XHRyZXR1cm4gcGF0aC5ub3JtYWxpemUoZm9sZGVyICsgXCIvXCIgKyBzd2FybVJhdy5tZXRhLnN3YXJtSWQgKyBcIi5cIitzd2FybVJhdy5tZXRhLnN3YXJtVHlwZU5hbWUpO1xuXHR9XG5cblx0dGhpcy5nZXRIYW5kbGVyID0gZnVuY3Rpb24oKXtcblx0XHRpZihwcm9kdWNlcil7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJPbmx5IG9uZSBjb25zdW1lciBpcyBhbGxvd2VkIVwiKTtcblx0XHR9XG5cdFx0cHJvZHVjZXIgPSB0cnVlO1xuXHRcdHJldHVybiB7XG5cdFx0XHRhZGRTdHJlYW0gOiBmdW5jdGlvbihzdHJlYW0sIGNhbGxiYWNrKXtcblx0XHRcdFx0aWYodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpe1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlNlY29uZCBwYXJhbWV0ZXIgc2hvdWxkIGJlIGEgY2FsbGJhY2sgZnVuY3Rpb25cIik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZighc3RyZWFtIHx8ICFzdHJlYW0ucGlwZSB8fCB0eXBlb2Ygc3RyZWFtLnBpcGUgIT09IFwiZnVuY3Rpb25cIil7XG5cdFx0XHRcdFx0Y2FsbGJhY2sobmV3IEVycm9yKFwiU29tZXRoaW5nIHdyb25nIGhhcHBlbmVkXCIpKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBzd2FybSA9IFwiXCI7XG5cdFx0XHRcdHN0cmVhbS5vbignZGF0YScsIChjaHVuaykgPT57XG5cdFx0XHRcdFx0c3dhcm0gKz0gY2h1bms7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHN0cmVhbS5vbihcImVuZFwiLCAoKSA9PiB7XG5cdFx0XHRcdFx0d3JpdGVGaWxlKG1rRmlsZU5hbWUoSlNPTi5wYXJzZShzd2FybSkpLCBzd2FybSwgY2FsbGJhY2spO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRzdHJlYW0ub24oXCJlcnJvclwiLCAoZXJyKSA9Pntcblx0XHRcdFx0XHRjYWxsYmFjayhlcnIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0sXG5cdFx0XHRhZGRTd2FybSA6IGZ1bmN0aW9uKHN3YXJtLCBjYWxsYmFjayl7XG5cdFx0XHRcdGlmKCFjYWxsYmFjayl7XG5cdFx0XHRcdFx0Y2FsbGJhY2sgPSAkJC5kZWZhdWx0RXJyb3JIYW5kbGluZ0ltcGxlbWVudGF0aW9uO1xuXHRcdFx0XHR9ZWxzZSBpZih0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIil7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiU2Vjb25kIHBhcmFtZXRlciBzaG91bGQgYmUgYSBjYWxsYmFjayBmdW5jdGlvblwiKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJlZXNIZWFsZXIuYXNKU09OKHN3YXJtLG51bGwsIG51bGwsIGZ1bmN0aW9uKGVyciwgcmVzKXtcblx0XHRcdFx0XHR3cml0ZUZpbGUobWtGaWxlTmFtZShyZXMpLCBKKHJlcyksIGNhbGxiYWNrKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9LFxuXHRcdFx0c2VuZFN3YXJtRm9yRXhlY3V0aW9uOiBmdW5jdGlvbihzd2FybSwgY2FsbGJhY2spe1xuXHRcdFx0XHRpZighY2FsbGJhY2spe1xuXHRcdFx0XHRcdGNhbGxiYWNrID0gJCQuZGVmYXVsdEVycm9ySGFuZGxpbmdJbXBsZW1lbnRhdGlvbjtcblx0XHRcdFx0fWVsc2UgaWYodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpe1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlNlY29uZCBwYXJhbWV0ZXIgc2hvdWxkIGJlIGEgY2FsbGJhY2sgZnVuY3Rpb25cIik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRiZWVzSGVhbGVyLmFzSlNPTihzd2FybSwgc3dhcm0ubWV0YS5waGFzZU5hbWUsIHN3YXJtLm1ldGEuYXJncywgZnVuY3Rpb24oZXJyLCByZXMpe1xuXHRcdFx0XHRcdHdyaXRlRmlsZShta0ZpbGVOYW1lKHJlcyksIEoocmVzKSwgY2FsbGJhY2spO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0dGhpcy5yZWdpc3RlckNvbnN1bWVyID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBzaG91bGREZWxldGVBZnRlclJlYWQgPSB0cnVlLCBzaG91bGRXYWl0Rm9yTW9yZSA9ICgpID0+IHRydWUpIHtcblx0XHRpZih0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIil7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJGaXJzdCBwYXJhbWV0ZXIgc2hvdWxkIGJlIGEgY2FsbGJhY2sgZnVuY3Rpb25cIik7XG5cdFx0fVxuXHRcdGlmIChjb25zdW1lcikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiT25seSBvbmUgY29uc3VtZXIgaXMgYWxsb3dlZCEgXCIgKyBmb2xkZXIpO1xuXHRcdH1cblxuXHRcdGNvbnN1bWVyID0gY2FsbGJhY2s7XG5cdFx0ZnMubWtkaXIoZm9sZGVyLCBmdW5jdGlvbiAoZXJyLCByZXMpIHtcblx0XHRcdGNvbnN1bWVBbGxFeGlzdGluZyhzaG91bGREZWxldGVBZnRlclJlYWQsIHNob3VsZFdhaXRGb3JNb3JlKTtcblx0XHR9KTtcblx0fTtcblxuXHR0aGlzLndyaXRlTWVzc2FnZSA9IHdyaXRlRmlsZTtcblxuXHR0aGlzLnVubGlua0NvbnRlbnQgPSBmdW5jdGlvbiAobWVzc2FnZUlkLCBjYWxsYmFjaykge1xuXHRcdGNvbnN0IG1lc3NhZ2VQYXRoID0gcGF0aC5qb2luKGZvbGRlciwgbWVzc2FnZUlkKTtcblxuXHRcdGZzLnVubGluayhtZXNzYWdlUGF0aCwgKGVycikgPT4ge1xuXHRcdFx0Y2FsbGJhY2soZXJyKTtcblx0fSk7XG5cdH07XG5cblxuXHQvKiAtLS0tLS0tLS0tLS0tLS0tIHByb3RlY3RlZCAgZnVuY3Rpb25zICovXG5cdHZhciBjb25zdW1lciA9IG51bGw7XG5cdHZhciBwcm9kdWNlciA9IG51bGw7XG5cblxuXHRmdW5jdGlvbiBjb25zdW1lTWVzc2FnZShmaWxlbmFtZSwgc2hvdWxkRGVsZXRlQWZ0ZXJSZWFkLCBjYWxsYmFjaykge1xuXHRcdHZhciBmdWxsUGF0aCA9IHBhdGgubm9ybWFsaXplKGZvbGRlciArIFwiL1wiICsgZmlsZW5hbWUpO1xuXHRcdGZzLnJlYWRGaWxlKGZ1bGxQYXRoLCBcInV0ZjhcIiwgZnVuY3Rpb24gKGVyciwgZGF0YSkge1xuXHRcdFx0aWYgKCFlcnIpIHtcblx0XHRcdFx0aWYgKGRhdGEgIT09IFwiXCIpIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0dmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGRhdGEpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRlcnIgPSBlcnJvcjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjYWxsYmFjayhlcnIsIG1lc3NhZ2UpO1xuXHRcdFx0XHRcdGlmIChzaG91bGREZWxldGVBZnRlclJlYWQpIHtcblxuXHRcdFx0XHRcdFx0ZnMudW5saW5rKGZ1bGxQYXRoLCBmdW5jdGlvbiAoZXJyLCByZXMpIHtcblx0XHRcdFx0XHRcdFx0aWYgKGVycikgdGhyb3cgZXJyXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNhbGxiYWNrKGVycik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBjb25zdW1lQWxsRXhpc3Rpbmcoc2hvdWxkRGVsZXRlQWZ0ZXJSZWFkLCBzaG91bGRXYWl0Rm9yTW9yZSkge1xuXG5cdFx0bGV0IGN1cnJlbnRGaWxlcyA9IFtdO1xuXG5cdFx0ZnMucmVhZGRpcihmb2xkZXIsICd1dGY4JywgZnVuY3Rpb24gKGVyciwgZmlsZXMpIHtcblx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0JCQuZXJyb3JIYW5kbGVyLmVycm9yKGVycik7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGN1cnJlbnRGaWxlcyA9IGZpbGVzO1xuXHRcdFx0aXRlcmF0ZUFuZENvbnN1bWUoZmlsZXMpO1xuXG5cdFx0fSk7XG5cblx0XHRmdW5jdGlvbiBzdGFydFdhdGNoaW5nKCl7XG5cdFx0XHRpZiAoc2hvdWxkV2FpdEZvck1vcmUoKSkge1xuXHRcdFx0XHR3YXRjaEZvbGRlcihzaG91bGREZWxldGVBZnRlclJlYWQsIHNob3VsZFdhaXRGb3JNb3JlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBpdGVyYXRlQW5kQ29uc3VtZShmaWxlcywgY3VycmVudEluZGV4ID0gMCkge1xuXHRcdFx0aWYgKGN1cnJlbnRJbmRleCA9PT0gZmlsZXMubGVuZ3RoKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwic3RhcnQgd2F0Y2hpbmdcIik7XG5cdFx0XHRcdHN0YXJ0V2F0Y2hpbmcoKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAocGF0aC5leHRuYW1lKGZpbGVzW2N1cnJlbnRJbmRleF0pICE9PSBpbl9wcm9ncmVzcykge1xuXHRcdFx0XHRjb25zdW1lTWVzc2FnZShmaWxlc1tjdXJyZW50SW5kZXhdLCBzaG91bGREZWxldGVBZnRlclJlYWQsIChlcnIsIGRhdGEpID0+IHtcblx0XHRcdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdFx0XHRpdGVyYXRlQW5kQ29uc3VtZShmaWxlcywgKytjdXJyZW50SW5kZXgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdW1lcihudWxsLCBkYXRhLCBwYXRoLmJhc2VuYW1lKGZpbGVzW2N1cnJlbnRJbmRleF0pKTtcblx0XHRcdFx0XHRpZiAoc2hvdWxkV2FpdEZvck1vcmUoKSkge1xuXHRcdFx0XHRcdFx0aXRlcmF0ZUFuZENvbnN1bWUoZmlsZXMsICsrY3VycmVudEluZGV4KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpdGVyYXRlQW5kQ29uc3VtZShmaWxlcywgKytjdXJyZW50SW5kZXgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cblxuXG5cdGNvbnN0IGluX3Byb2dyZXNzID0gXCIuaW5fcHJvZ3Jlc3NcIjtcblx0ZnVuY3Rpb24gd3JpdGVGaWxlKGZpbGVuYW1lLCBjb250ZW50LCBjYWxsYmFjayl7XG5cdFx0dmFyIHRtcEZpbGVuYW1lID0gZmlsZW5hbWUraW5fcHJvZ3Jlc3M7XG5cdFx0ZnMud3JpdGVGaWxlKHRtcEZpbGVuYW1lLCBjb250ZW50LCBmdW5jdGlvbihlcnJvciwgcmVzKXtcblx0XHRcdGlmKCFlcnJvcil7XG5cdFx0XHRcdGZzLnJlbmFtZSh0bXBGaWxlbmFtZSwgZmlsZW5hbWUsIGNhbGxiYWNrKTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRjYWxsYmFjayhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHR2YXIgYWxyZWFkeUtub3duQ2hhbmdlcyA9IHt9O1xuXG5cdGZ1bmN0aW9uIGFscmVhZHlGaXJlZENoYW5nZXMoZmlsZW5hbWUsIGNoYW5nZSl7XG5cdFx0dmFyIHJlcyA9IGZhbHNlO1xuXHRcdGlmKGFscmVhZHlLbm93bkNoYW5nZXNbZmlsZW5hbWVdKXtcblx0XHRcdHJlcyA9IHRydWU7XG5cdFx0fWVsc2V7XG5cdFx0XHRhbHJlYWR5S25vd25DaGFuZ2VzW2ZpbGVuYW1lXSA9IGNoYW5nZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzO1xuXHR9XG5cblx0ZnVuY3Rpb24gd2F0Y2hGb2xkZXIoc2hvdWxkRGVsZXRlQWZ0ZXJSZWFkLCBzaG91bGRXYWl0Rm9yTW9yZSl7XG5cdFx0Y29uc3Qgd2F0Y2hlciA9IGZzLndhdGNoKGZvbGRlciwgZnVuY3Rpb24oZXZlbnRUeXBlLCBmaWxlbmFtZSl7XG5cdFx0XHQgLy9jb25zb2xlLmxvZyhcIldhdGNoaW5nOlwiLCBldmVudFR5cGUsIGZpbGVuYW1lKTtcblxuXHRcdFx0aWYgKGZpbGVuYW1lICYmIChldmVudFR5cGUgPT09IFwiY2hhbmdlXCIgfHwgZXZlbnRUeXBlID09PSBcInJlbmFtZVwiKSkge1xuXG5cdFx0XHRcdGlmKHBhdGguZXh0bmFtZShmaWxlbmFtZSkgIT09IGluX3Byb2dyZXNzICYmICFhbHJlYWR5RmlyZWRDaGFuZ2VzKGZpbGVuYW1lLCBldmVudFR5cGUpKXtcblx0XHRcdFx0XHRjb25zdW1lTWVzc2FnZShmaWxlbmFtZSwgc2hvdWxkRGVsZXRlQWZ0ZXJSZWFkLCAoZXJyLCBkYXRhKSA9PiB7XG5cdFx0XHRcdFx0XHRpZihlcnIpIHtcblx0XHRcdFx0XHRcdFx0Ly8gPz9cblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29uc3VtZXIobnVsbCwgZGF0YSwgZmlsZW5hbWUpO1xuXHRcdFx0XHRcdFx0aWYoIXNob3VsZFdhaXRGb3JNb3JlKCkpIHtcblx0XHRcdFx0XHRcdFx0d2F0Y2hlci5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuZXhwb3J0cy5nZXRGb2xkZXJRdWV1ZSA9IGZ1bmN0aW9uKGZvbGRlciwgY2FsbGJhY2spe1xuXHRyZXR1cm4gbmV3IEZvbGRlck1RKGZvbGRlciwgY2FsbGJhY2spO1xufTsiLCIvKlxuSW5pdGlhbCBMaWNlbnNlOiAoYykgQXhpb2xvZ2ljIFJlc2VhcmNoICYgQWxib2FpZSBTw65uaWPEgy5cbkNvbnRyaWJ1dG9yczogQXhpb2xvZ2ljIFJlc2VhcmNoICwgUHJpdmF0ZVNreSBwcm9qZWN0XG5Db2RlIExpY2Vuc2U6IExHUEwgb3IgTUlULlxuKi9cblxuXG4vKipcbiAqICAgVXN1YWxseSBhbiBldmVudCBjb3VsZCBjYXVzZSBleGVjdXRpb24gb2Ygb3RoZXIgY2FsbGJhY2sgZXZlbnRzIC4gV2Ugc2F5IHRoYXQgaXMgYSBsZXZlbCAxIGV2ZW50IGlmIGlzIGNhdXNlZWQgYnkgYSBsZXZlbCAwIGV2ZW50IGFuZCBzbyBvblxuICpcbiAqICAgICAgU291bmRQdWJTdWIgcHJvdmlkZXMgaW50dWl0aXZlIHJlc3VsdHMgcmVnYXJkaW5nIHRvIGFzeW5jaHJvbm91cyBjYWxscyBvZiBjYWxsYmFja3MgYW5kIGNvbXB1dGVkIHZhbHVlcy9leHByZXNzaW9uczpcbiAqICAgd2UgcHJldmVudCBpbW1lZGlhdGUgZXhlY3V0aW9uIG9mIGV2ZW50IGNhbGxiYWNrcyB0byBlbnN1cmUgdGhlIGludHVpdGl2ZSBmaW5hbCByZXN1bHQgaXMgZ3VhcmFudGVlZCBhcyBsZXZlbCAwIGV4ZWN1dGlvblxuICogICB3ZSBndWFyYW50ZWUgdGhhdCBhbnkgY2FsbGJhY2sgZnVuY3Rpb24gaXMgXCJyZS1lbnRyYW50XCJcbiAqICAgd2UgYXJlIGFsc28gdHJ5aW5nIHRvIHJlZHVjZSB0aGUgbnVtYmVyIG9mIGNhbGxiYWNrIGV4ZWN1dGlvbiBieSBsb29raW5nIGluIHF1ZXVlcyBhdCBuZXcgbWVzc2FnZXMgcHVibGlzaGVkIGJ5XG4gKiAgIHRyeWluZyB0byBjb21wYWN0IHRob3NlIG1lc3NhZ2VzIChyZW1vdmluZyBkdXBsaWNhdGUgbWVzc2FnZXMsIG1vZGlmeWluZyBtZXNzYWdlcywgb3IgYWRkaW5nIGluIHRoZSBoaXN0b3J5IG9mIGFub3RoZXIgZXZlbnQgLGV0YylcbiAqXG4gKiAgICAgIEV4YW1wbGUgb2Ygd2hhdCBjYW4gYmUgd3Jvbmcgd2l0aG91dCBub24tc291bmQgYXN5bmNocm9ub3VzIGNhbGxzOlxuXG4gKiAgU3RlcCAwOiBJbml0aWFsIHN0YXRlOlxuICogICBhID0gMDtcbiAqICAgYiA9IDA7XG4gKlxuICogIFN0ZXAgMTogSW5pdGlhbCBvcGVyYXRpb25zOlxuICogICBhID0gMTtcbiAqICAgYiA9IC0xO1xuICpcbiAqICAvLyBhbiBvYnNlcnZlciByZWFjdHMgdG8gY2hhbmdlcyBpbiBhIGFuZCBiIGFuZCBjb21wdXRlIENPUlJFQ1QgbGlrZSB0aGlzOlxuICogICBpZiggYSArIGIgPT0gMCkge1xuICogICAgICAgQ09SUkVDVCA9IGZhbHNlO1xuICogICAgICAgbm90aWZ5KC4uLik7IC8vIGFjdCBvciBzZW5kIGEgbm90aWZpY2F0aW9uIHNvbWV3aGVyZS4uXG4gKiAgIH0gZWxzZSB7XG4gKiAgICAgIENPUlJFQ1QgPSBmYWxzZTtcbiAqICAgfVxuICpcbiAqICAgIE5vdGljZSB0aGF0OiBDT1JSRUNUIHdpbGwgYmUgdHJ1ZSBpbiB0aGUgZW5kICwgYnV0IG1lYW50aW1lLCBhZnRlciBhIG5vdGlmaWNhdGlvbiB3YXMgc2VudCBhbmQgQ09SUkVDVCB3YXMgd3JvbmdseSwgdGVtcG9yYXJpbHkgZmFsc2UhXG4gKiAgICBzb3VuZFB1YlN1YiBndWFyYW50ZWUgdGhhdCB0aGlzIGRvZXMgbm90IGhhcHBlbiBiZWNhdXNlIHRoZSBzeW5jcm9ub3VzIGNhbGwgd2lsbCBiZWZvcmUgYW55IG9ic2VydmVyIChib3QgYXNpZ25hdGlvbiBvbiBhIGFuZCBiKVxuICpcbiAqICAgTW9yZTpcbiAqICAgeW91IGNhbiB1c2UgYmxvY2tDYWxsQmFja3MgYW5kIHJlbGVhc2VDYWxsQmFja3MgaW4gYSBmdW5jdGlvbiB0aGF0IGNoYW5nZSBhIGxvdCBhIGNvbGxlY3Rpb24gb3IgYmluZGFibGUgb2JqZWN0cyBhbmQgYWxsXG4gKiAgIHRoZSBub3RpZmljYXRpb25zIHdpbGwgYmUgc2VudCBjb21wYWN0ZWQgYW5kIHByb3Blcmx5XG4gKi9cblxuLy8gVE9ETzogb3B0aW1pc2F0aW9uIT8gdXNlIGEgbW9yZSBlZmZpY2llbnQgcXVldWUgaW5zdGVhZCBvZiBhcnJheXMgd2l0aCBwdXNoIGFuZCBzaGlmdCE/XG4vLyBUT0RPOiBzZWUgaG93IGJpZyB0aG9zZSBxdWV1ZXMgY2FuIGJlIGluIHJlYWwgYXBwbGljYXRpb25zXG4vLyBmb3IgYSBmZXcgaHVuZHJlZHMgaXRlbXMsIHF1ZXVlcyBtYWRlIGZyb20gYXJyYXkgc2hvdWxkIGJlIGVub3VnaFxuLy8qICAgUG90ZW50aWFsIFRPRE9zOlxuLy8gICAgKiAgICAgcHJldmVudCBhbnkgZm9ybSBvZiBwcm9ibGVtIGJ5IGNhbGxpbmcgY2FsbGJhY2tzIGluIHRoZSBleHBlY3RlZCBvcmRlciAhP1xuLy8qICAgICBwcmV2ZW50aW5nIGluZmluaXRlIGxvb3BzIGV4ZWN1dGlvbiBjYXVzZSBieSBldmVudHMhP1xuLy8qXG4vLypcbi8vIFRPRE86IGRldGVjdCBpbmZpbml0ZSBsb29wcyAob3IgdmVyeSBkZWVwIHByb3BhZ2F0aW9uKSBJdCBpcyBwb3NzaWJsZSE/XG5cbmNvbnN0IFF1ZXVlID0gcmVxdWlyZSgnLi9RdWV1ZScpO1xuXG5mdW5jdGlvbiBTb3VuZFB1YlN1Yigpe1xuXG5cdC8qKlxuXHQgKiBwdWJsaXNoXG5cdCAqICAgICAgUHVibGlzaCBhIG1lc3NhZ2Uge09iamVjdH0gdG8gYSBsaXN0IG9mIHN1YnNjcmliZXJzIG9uIGEgc3BlY2lmaWMgdG9waWNcblx0ICpcblx0ICogQHBhcmFtcyB7U3RyaW5nfE51bWJlcn0gdGFyZ2V0LCAge09iamVjdH0gbWVzc2FnZVxuXHQgKiBAcmV0dXJuIG51bWJlciBvZiBjaGFubmVsIHN1YnNjcmliZXJzIHRoYXQgd2lsbCBiZSBub3RpZmllZFxuXHQgKi9cblx0dGhpcy5wdWJsaXNoID0gZnVuY3Rpb24odGFyZ2V0LCBtZXNzYWdlKXtcblx0XHRpZighaW52YWxpZENoYW5uZWxOYW1lKHRhcmdldCkgJiYgIWludmFsaWRNZXNzYWdlVHlwZShtZXNzYWdlKSAmJiBjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XSAhPSB1bmRlZmluZWQpe1xuXHRcdFx0Y29tcGFjdEFuZFN0b3JlKHRhcmdldCwgbWVzc2FnZSk7XG5cdFx0XHRkaXNwYXRjaE5leHQoKTtcblx0XHRcdHJldHVybiBjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XS5sZW5ndGg7XG5cdFx0fSBlbHNle1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBzdWJzY3JpYmVcblx0ICogICAgICBTdWJzY3JpYmUgLyBhZGQgYSB7RnVuY3Rpb259IGNhbGxCYWNrIG9uIGEge1N0cmluZ3xOdW1iZXJ9dGFyZ2V0IGNoYW5uZWwgc3Vic2NyaWJlcnMgbGlzdCBpbiBvcmRlciB0byByZWNlaXZlXG5cdCAqICAgICAgbWVzc2FnZXMgcHVibGlzaGVkIGlmIHRoZSBjb25kaXRpb25zIGRlZmluZWQgYnkge0Z1bmN0aW9ufXdhaXRGb3JNb3JlIGFuZCB7RnVuY3Rpb259ZmlsdGVyIGFyZSBwYXNzZWQuXG5cdCAqXG5cdCAqIEBwYXJhbXMge1N0cmluZ3xOdW1iZXJ9dGFyZ2V0LCB7RnVuY3Rpb259Y2FsbEJhY2ssIHtGdW5jdGlvbn13YWl0Rm9yTW9yZSwge0Z1bmN0aW9ufWZpbHRlclxuXHQgKlxuXHQgKiAgICAgICAgICB0YXJnZXQgICAgICAtIGNoYW5uZWwgbmFtZSB0byBzdWJzY3JpYmVcblx0ICogICAgICAgICAgY2FsbGJhY2sgICAgLSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiBhIG1lc3NhZ2Ugd2FzIHB1Ymxpc2hlZCBvbiB0aGUgY2hhbm5lbFxuXHQgKiAgICAgICAgICB3YWl0Rm9yTW9yZSAtIGEgaW50ZXJtZWRpYXJ5IGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgYSBzdWNjZXNzZnVseSBtZXNzYWdlIGRlbGl2ZXJ5IGluIG9yZGVyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgICAgICB0byBkZWNpZGUgaWYgYSBuZXcgbWVzc2FnZXMgaXMgZXhwZWN0ZWQuLi5cblx0ICogICAgICAgICAgZmlsdGVyICAgICAgLSBhIGZ1bmN0aW9uIHRoYXQgcmVjZWl2ZXMgdGhlIG1lc3NhZ2UgYmVmb3JlIGludm9jYXRpb24gb2YgY2FsbGJhY2sgZnVuY3Rpb24gaW4gb3JkZXIgdG8gYWxsb3dcblx0ICogICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGV2YW50IG1lc3NhZ2UgYmVmb3JlIGVudGVyaW5nIGluIG5vcm1hbCBjYWxsYmFjayBmbG93XG5cdCAqIEByZXR1cm5cblx0ICovXG5cdHRoaXMuc3Vic2NyaWJlID0gZnVuY3Rpb24odGFyZ2V0LCBjYWxsQmFjaywgd2FpdEZvck1vcmUsIGZpbHRlcil7XG5cdFx0aWYoIWludmFsaWRDaGFubmVsTmFtZSh0YXJnZXQpICYmICFpbnZhbGlkRnVuY3Rpb24oY2FsbEJhY2spKXtcblxuXHRcdFx0dmFyIHN1YnNjcmliZXIgPSB7XCJjYWxsQmFja1wiOmNhbGxCYWNrLCBcIndhaXRGb3JNb3JlXCI6d2FpdEZvck1vcmUsIFwiZmlsdGVyXCI6ZmlsdGVyfTtcblx0XHRcdHZhciBhcnIgPSBjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XTtcblx0XHRcdGlmKGFyciA9PSB1bmRlZmluZWQpe1xuXHRcdFx0XHRhcnIgPSBbXTtcblx0XHRcdFx0Y2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF0gPSBhcnI7XG5cdFx0XHR9XG5cdFx0XHRhcnIucHVzaChzdWJzY3JpYmVyKTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIHVuc3Vic2NyaWJlXG5cdCAqICAgICAgVW5zdWJzY3JpYmUvcmVtb3ZlIHtGdW5jdGlvbn0gY2FsbEJhY2sgZnJvbSB0aGUgbGlzdCBvZiBzdWJzY3JpYmVycyBvZiB0aGUge1N0cmluZ3xOdW1iZXJ9IHRhcmdldCBjaGFubmVsXG5cdCAqXG5cdCAqIEBwYXJhbXMge1N0cmluZ3xOdW1iZXJ9IHRhcmdldCwge0Z1bmN0aW9ufSBjYWxsQmFjaywge0Z1bmN0aW9ufSBmaWx0ZXJcblx0ICpcblx0ICogICAgICAgICAgdGFyZ2V0ICAgICAgLSBjaGFubmVsIG5hbWUgdG8gdW5zdWJzY3JpYmVcblx0ICogICAgICAgICAgY2FsbGJhY2sgICAgLSByZWZlcmVuY2Ugb2YgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHRoYXQgd2FzIHVzZWQgYXMgc3Vic2NyaWJlXG5cdCAqICAgICAgICAgIGZpbHRlciAgICAgIC0gcmVmZXJlbmNlIG9mIHRoZSBvcmlnaW5hbCBmaWx0ZXIgZnVuY3Rpb25cblx0ICogQHJldHVyblxuXHQgKi9cblx0dGhpcy51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKHRhcmdldCwgY2FsbEJhY2ssIGZpbHRlcil7XG5cdFx0aWYoIWludmFsaWRGdW5jdGlvbihjYWxsQmFjaykpe1xuXHRcdFx0dmFyIGdvdGl0ID0gZmFsc2U7XG5cdFx0XHRpZihjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XSl7XG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XS5sZW5ndGg7aSsrKXtcblx0XHRcdFx0XHR2YXIgc3Vic2NyaWJlciA9ICBjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XVtpXTtcblx0XHRcdFx0XHRpZihzdWJzY3JpYmVyLmNhbGxCYWNrID09PSBjYWxsQmFjayAmJiAoZmlsdGVyID09IHVuZGVmaW5lZCB8fCBzdWJzY3JpYmVyLmZpbHRlciA9PT0gZmlsdGVyICkpe1xuXHRcdFx0XHRcdFx0Z290aXQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0c3Vic2NyaWJlci5mb3JEZWxldGUgPSB0cnVlO1xuXHRcdFx0XHRcdFx0c3Vic2NyaWJlci5jYWxsQmFjayA9IG51bGw7XG5cdFx0XHRcdFx0XHRzdWJzY3JpYmVyLmZpbHRlciA9IG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZighZ290aXQpe1xuXHRcdFx0XHR3cHJpbnQoXCJVbmFibGUgdG8gdW5zdWJzY3JpYmUgYSBjYWxsYmFjayB0aGF0IHdhcyBub3Qgc3Vic2NyaWJlZCFcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBibG9ja0NhbGxCYWNrc1xuXHQgKlxuXHQgKiBAcGFyYW1zXG5cdCAqIEByZXR1cm5cblx0ICovXG5cdHRoaXMuYmxvY2tDYWxsQmFja3MgPSBmdW5jdGlvbigpe1xuXHRcdGxldmVsKys7XG5cdH07XG5cblx0LyoqXG5cdCAqIHJlbGVhc2VDYWxsQmFja3Ncblx0ICpcblx0ICogQHBhcmFtc1xuXHQgKiBAcmV0dXJuXG5cdCAqL1xuXHR0aGlzLnJlbGVhc2VDYWxsQmFja3MgPSBmdW5jdGlvbigpe1xuXHRcdGxldmVsLS07XG5cdFx0Ly9oYWNrL29wdGltaXNhdGlvbiB0byBub3QgZmlsbCB0aGUgc3RhY2sgaW4gZXh0cmVtZSBjYXNlcyAobWFueSBldmVudHMgY2F1c2VkIGJ5IGxvb3BzIGluIGNvbGxlY3Rpb25zLGV0Yylcblx0XHR3aGlsZShsZXZlbCA9PSAwICYmIGRpc3BhdGNoTmV4dCh0cnVlKSl7XG5cdFx0XHQvL25vdGhpbmdcblx0XHR9XG5cblx0XHR3aGlsZShsZXZlbCA9PSAwICYmIGNhbGxBZnRlckFsbEV2ZW50cygpKXtcblxuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogYWZ0ZXJBbGxFdmVudHNcblx0ICpcblx0ICogQHBhcmFtcyB7RnVuY3Rpb259IGNhbGxiYWNrXG5cdCAqXG5cdCAqICAgICAgICAgIGNhbGxiYWNrIC0gZnVuY3Rpb24gdGhhdCBuZWVkcyB0byBiZSBpbnZva2VkIG9uY2UgYWxsIGV2ZW50cyBhcmUgZGVsaXZlcmVkXG5cdCAqIEByZXR1cm5cblx0ICovXG5cdHRoaXMuYWZ0ZXJBbGxFdmVudHMgPSBmdW5jdGlvbihjYWxsQmFjayl7XG5cdFx0aWYoIWludmFsaWRGdW5jdGlvbihjYWxsQmFjaykpe1xuXHRcdFx0YWZ0ZXJFdmVudHNDYWxscy5wdXNoKGNhbGxCYWNrKTtcblx0XHR9XG5cdFx0dGhpcy5ibG9ja0NhbGxCYWNrcygpO1xuXHRcdHRoaXMucmVsZWFzZUNhbGxCYWNrcygpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBoYXNDaGFubmVsXG5cdCAqXG5cdCAqIEBwYXJhbXMge1N0cmluZ3xOdW1iZXJ9IGNoYW5uZWxcblx0ICpcblx0ICogICAgICAgICAgY2hhbm5lbCAtIG5hbWUgb2YgdGhlIGNoYW5uZWwgdGhhdCBuZWVkIHRvIGJlIHRlc3RlZCBpZiBwcmVzZW50XG5cdCAqIEByZXR1cm5cblx0ICovXG5cdHRoaXMuaGFzQ2hhbm5lbCA9IGZ1bmN0aW9uKGNoYW5uZWwpe1xuXHRcdHJldHVybiAhaW52YWxpZENoYW5uZWxOYW1lKGNoYW5uZWwpICYmIGNoYW5uZWxTdWJzY3JpYmVyc1tjaGFubmVsXSAhPSB1bmRlZmluZWQgPyB0cnVlIDogZmFsc2U7XG5cdH07XG5cblx0LyoqXG5cdCAqIGFkZENoYW5uZWxcblx0ICpcblx0ICogQHBhcmFtcyB7U3RyaW5nfSBjaGFubmVsXG5cdCAqXG5cdCAqICAgICAgICAgIGNoYW5uZWwgLSBuYW1lIG9mIGEgY2hhbm5lbCB0aGF0IG5lZWRzIHRvIGJlIGNyZWF0ZWQgYW5kIGFkZGVkIHRvIHNvdW5kcHVic3ViIHJlcG9zaXRvcnlcblx0ICogQHJldHVyblxuXHQgKi9cblx0dGhpcy5hZGRDaGFubmVsID0gZnVuY3Rpb24oY2hhbm5lbCl7XG5cdFx0aWYoIWludmFsaWRDaGFubmVsTmFtZShjaGFubmVsKSAmJiAhdGhpcy5oYXNDaGFubmVsKGNoYW5uZWwpKXtcblx0XHRcdGNoYW5uZWxTdWJzY3JpYmVyc1tjaGFubmVsXSA9IFtdO1xuXHRcdH1cblx0fTtcblxuXHQvKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHByb3RlY3RlZCBzdHVmZiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cdHZhciBzZWxmID0gdGhpcztcblx0Ly8gbWFwIGNoYW5uZWxOYW1lIChvYmplY3QgbG9jYWwgaWQpIC0+IGFycmF5IHdpdGggc3Vic2NyaWJlcnNcblx0dmFyIGNoYW5uZWxTdWJzY3JpYmVycyA9IHt9O1xuXG5cdC8vIG1hcCBjaGFubmVsTmFtZSAob2JqZWN0IGxvY2FsIGlkKSAtPiBxdWV1ZSB3aXRoIHdhaXRpbmcgbWVzc2FnZXNcblx0dmFyIGNoYW5uZWxzU3RvcmFnZSA9IHt9O1xuXG5cdC8vIG9iamVjdFxuXHR2YXIgdHlwZUNvbXBhY3RvciA9IHt9O1xuXG5cdC8vIGNoYW5uZWwgbmFtZXNcblx0dmFyIGV4ZWN1dGlvblF1ZXVlID0gbmV3IFF1ZXVlKCk7XG5cdHZhciBsZXZlbCA9IDA7XG5cblxuXG5cdC8qKlxuXHQgKiByZWdpc3RlckNvbXBhY3RvclxuXHQgKlxuXHQgKiAgICAgICBBbiBjb21wYWN0b3IgdGFrZXMgYSBuZXdFdmVudCBhbmQgYW5kIG9sZEV2ZW50IGFuZCByZXR1cm4gdGhlIG9uZSB0aGF0IHN1cnZpdmVzIChvbGRFdmVudCBpZlxuXHQgKiAgaXQgY2FuIGNvbXBhY3QgdGhlIG5ldyBvbmUgb3IgdGhlIG5ld0V2ZW50IGlmIGNhbid0IGJlIGNvbXBhY3RlZClcblx0ICpcblx0ICogQHBhcmFtcyB7U3RyaW5nfSB0eXBlLCB7RnVuY3Rpb259IGNhbGxCYWNrXG5cdCAqXG5cdCAqICAgICAgICAgIHR5cGUgICAgICAgIC0gY2hhbm5lbCBuYW1lIHRvIHVuc3Vic2NyaWJlXG5cdCAqICAgICAgICAgIGNhbGxCYWNrICAgIC0gaGFuZGxlciBmdW5jdGlvbiBmb3IgdGhhdCBzcGVjaWZpYyBldmVudCB0eXBlXG5cdCAqIEByZXR1cm5cblx0ICovXG5cdHRoaXMucmVnaXN0ZXJDb21wYWN0b3IgPSBmdW5jdGlvbih0eXBlLCBjYWxsQmFjaykge1xuXHRcdGlmKCFpbnZhbGlkRnVuY3Rpb24oY2FsbEJhY2spKXtcblx0XHRcdHR5cGVDb21wYWN0b3JbdHlwZV0gPSBjYWxsQmFjaztcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIGRpc3BhdGNoTmV4dFxuXHQgKlxuXHQgKiBAcGFyYW0gZnJvbVJlbGVhc2VDYWxsQmFja3M6IGhhY2sgdG8gcHJldmVudCB0b28gbWFueSByZWN1cnNpdmUgY2FsbHMgb24gcmVsZWFzZUNhbGxCYWNrc1xuXHQgKiBAcmV0dXJuIHtCb29sZWFufVxuXHQgKi9cblx0ZnVuY3Rpb24gZGlzcGF0Y2hOZXh0KGZyb21SZWxlYXNlQ2FsbEJhY2tzKXtcblx0XHRpZihsZXZlbCA+IDApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0bGV0IGNoYW5uZWxOYW1lID0gZXhlY3V0aW9uUXVldWUuZnJvbnQoKTtcblx0XHRpZihjaGFubmVsTmFtZSAhPSB1bmRlZmluZWQpe1xuXHRcdFx0c2VsZi5ibG9ja0NhbGxCYWNrcygpO1xuXHRcdFx0dHJ5e1xuXHRcdFx0XHRsZXQgbWVzc2FnZTtcblx0XHRcdFx0aWYoIWNoYW5uZWxzU3RvcmFnZVtjaGFubmVsTmFtZV0uaXNFbXB0eSgpKSB7XG5cdFx0XHRcdFx0bWVzc2FnZSA9IGNoYW5uZWxzU3RvcmFnZVtjaGFubmVsTmFtZV0uZnJvbnQoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZihtZXNzYWdlID09IHVuZGVmaW5lZCl7XG5cdFx0XHRcdFx0aWYoIWNoYW5uZWxzU3RvcmFnZVtjaGFubmVsTmFtZV0uaXNFbXB0eSgpKXtcblx0XHRcdFx0XHRcdHdwcmludChcIkNhbid0IHVzZSBhcyBtZXNzYWdlIGluIGEgcHViL3N1YiBjaGFubmVsIHRoaXMgb2JqZWN0OiBcIiArIG1lc3NhZ2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRleGVjdXRpb25RdWV1ZS5wb3AoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZihtZXNzYWdlLl9fdHJhbnNtaXNpb25JbmRleCA9PSB1bmRlZmluZWQpe1xuXHRcdFx0XHRcdFx0bWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXggPSAwO1xuXHRcdFx0XHRcdFx0Zm9yKHZhciBpID0gY2hhbm5lbFN1YnNjcmliZXJzW2NoYW5uZWxOYW1lXS5sZW5ndGgtMTsgaSA+PSAwIDsgaS0tKXtcblx0XHRcdFx0XHRcdFx0dmFyIHN1YnNjcmliZXIgPSAgY2hhbm5lbFN1YnNjcmliZXJzW2NoYW5uZWxOYW1lXVtpXTtcblx0XHRcdFx0XHRcdFx0aWYoc3Vic2NyaWJlci5mb3JEZWxldGUgPT0gdHJ1ZSl7XG5cdFx0XHRcdFx0XHRcdFx0Y2hhbm5lbFN1YnNjcmliZXJzW2NoYW5uZWxOYW1lXS5zcGxpY2UoaSwxKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZXtcblx0XHRcdFx0XHRcdG1lc3NhZ2UuX190cmFuc21pc2lvbkluZGV4Kys7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vVE9ETzogZm9yIGltbXV0YWJsZSBvYmplY3RzIGl0IHdpbGwgbm90IHdvcmsgYWxzbywgZml4IGZvciBzaGFwZSBtb2RlbHNcblx0XHRcdFx0XHRpZihtZXNzYWdlLl9fdHJhbnNtaXNpb25JbmRleCA9PSB1bmRlZmluZWQpe1xuXHRcdFx0XHRcdFx0d3ByaW50KFwiQ2FuJ3QgdXNlIGFzIG1lc3NhZ2UgaW4gYSBwdWIvc3ViIGNoYW5uZWwgdGhpcyBvYmplY3Q6IFwiICsgbWVzc2FnZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHZhciBzdWJzY3JpYmVyID0gY2hhbm5lbFN1YnNjcmliZXJzW2NoYW5uZWxOYW1lXVttZXNzYWdlLl9fdHJhbnNtaXNpb25JbmRleF07XG5cdFx0XHRcdFx0aWYoc3Vic2NyaWJlciA9PSB1bmRlZmluZWQpe1xuXHRcdFx0XHRcdFx0ZGVsZXRlIG1lc3NhZ2UuX190cmFuc21pc2lvbkluZGV4O1xuXHRcdFx0XHRcdFx0Y2hhbm5lbHNTdG9yYWdlW2NoYW5uZWxOYW1lXS5wb3AoKTtcblx0XHRcdFx0XHR9IGVsc2V7XG5cdFx0XHRcdFx0XHRpZihzdWJzY3JpYmVyLmZpbHRlciA9PSB1bmRlZmluZWQgfHwgKCFpbnZhbGlkRnVuY3Rpb24oc3Vic2NyaWJlci5maWx0ZXIpICYmIHN1YnNjcmliZXIuZmlsdGVyKG1lc3NhZ2UpKSl7XG5cdFx0XHRcdFx0XHRcdGlmKCFzdWJzY3JpYmVyLmZvckRlbGV0ZSl7XG5cdFx0XHRcdFx0XHRcdFx0c3Vic2NyaWJlci5jYWxsQmFjayhtZXNzYWdlKTtcblx0XHRcdFx0XHRcdFx0XHRpZihzdWJzY3JpYmVyLndhaXRGb3JNb3JlICYmICFpbnZhbGlkRnVuY3Rpb24oc3Vic2NyaWJlci53YWl0Rm9yTW9yZSkgJiZcblx0XHRcdFx0XHRcdFx0XHRcdCFzdWJzY3JpYmVyLndhaXRGb3JNb3JlKG1lc3NhZ2UpKXtcblxuXHRcdFx0XHRcdFx0XHRcdFx0c3Vic2NyaWJlci5mb3JEZWxldGUgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaChlcnIpe1xuXHRcdFx0XHR3cHJpbnQoXCJFdmVudCBjYWxsYmFjayBmYWlsZWQ6IFwiKyBzdWJzY3JpYmVyLmNhbGxCYWNrICtcImVycm9yOiBcIiArIGVyci5zdGFjayk7XG5cdFx0XHR9XG5cdFx0XHQvL1xuXHRcdFx0aWYoZnJvbVJlbGVhc2VDYWxsQmFja3Mpe1xuXHRcdFx0XHRsZXZlbC0tO1xuXHRcdFx0fSBlbHNle1xuXHRcdFx0XHRzZWxmLnJlbGVhc2VDYWxsQmFja3MoKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0gZWxzZXtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBjb21wYWN0QW5kU3RvcmUodGFyZ2V0LCBtZXNzYWdlKXtcblx0XHR2YXIgZ290Q29tcGFjdGVkID0gZmFsc2U7XG5cdFx0dmFyIGFyciA9IGNoYW5uZWxzU3RvcmFnZVt0YXJnZXRdO1xuXHRcdGlmKGFyciA9PSB1bmRlZmluZWQpe1xuXHRcdFx0YXJyID0gbmV3IFF1ZXVlKCk7XG5cdFx0XHRjaGFubmVsc1N0b3JhZ2VbdGFyZ2V0XSA9IGFycjtcblx0XHR9XG5cblx0XHRpZihtZXNzYWdlICYmIG1lc3NhZ2UudHlwZSAhPSB1bmRlZmluZWQpe1xuXHRcdFx0dmFyIHR5cGVDb21wYWN0b3JDYWxsQmFjayA9IHR5cGVDb21wYWN0b3JbbWVzc2FnZS50eXBlXTtcblxuXHRcdFx0aWYodHlwZUNvbXBhY3RvckNhbGxCYWNrICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRcdGZvcihsZXQgY2hhbm5lbCBvZiBhcnIpIHtcblx0XHRcdFx0XHRpZih0eXBlQ29tcGFjdG9yQ2FsbEJhY2sobWVzc2FnZSwgY2hhbm5lbCkgPT09IGNoYW5uZWwpIHtcblx0XHRcdFx0XHRcdGlmKGNoYW5uZWwuX190cmFuc21pc2lvbkluZGV4ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0Z290Q29tcGFjdGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYoIWdvdENvbXBhY3RlZCAmJiBtZXNzYWdlKXtcblx0XHRcdGFyci5wdXNoKG1lc3NhZ2UpO1xuXHRcdFx0ZXhlY3V0aW9uUXVldWUucHVzaCh0YXJnZXQpO1xuXHRcdH1cblx0fVxuXG5cdHZhciBhZnRlckV2ZW50c0NhbGxzID0gbmV3IFF1ZXVlKCk7XG5cdGZ1bmN0aW9uIGNhbGxBZnRlckFsbEV2ZW50cyAoKXtcblx0XHRpZighYWZ0ZXJFdmVudHNDYWxscy5pc0VtcHR5KCkpe1xuXHRcdFx0dmFyIGNhbGxCYWNrID0gYWZ0ZXJFdmVudHNDYWxscy5wb3AoKTtcblx0XHRcdC8vZG8gbm90IGNhdGNoIGV4Y2VwdGlvbnMgaGVyZS4uXG5cdFx0XHRjYWxsQmFjaygpO1xuXHRcdH1cblx0XHRyZXR1cm4gIWFmdGVyRXZlbnRzQ2FsbHMuaXNFbXB0eSgpO1xuXHR9XG5cblx0ZnVuY3Rpb24gaW52YWxpZENoYW5uZWxOYW1lKG5hbWUpe1xuXHRcdHZhciByZXN1bHQgPSBmYWxzZTtcblx0XHRpZighbmFtZSB8fCAodHlwZW9mIG5hbWUgIT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgbmFtZSAhPSBcIm51bWJlclwiKSl7XG5cdFx0XHRyZXN1bHQgPSB0cnVlO1xuXHRcdFx0d3ByaW50KFwiSW52YWxpZCBjaGFubmVsIG5hbWU6IFwiICsgbmFtZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdGZ1bmN0aW9uIGludmFsaWRNZXNzYWdlVHlwZShtZXNzYWdlKXtcblx0XHR2YXIgcmVzdWx0ID0gZmFsc2U7XG5cdFx0aWYoIW1lc3NhZ2UgfHwgdHlwZW9mIG1lc3NhZ2UgIT0gXCJvYmplY3RcIil7XG5cdFx0XHRyZXN1bHQgPSB0cnVlO1xuXHRcdFx0d3ByaW50KFwiSW52YWxpZCBtZXNzYWdlcyB0eXBlczogXCIgKyBtZXNzYWdlKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdGZ1bmN0aW9uIGludmFsaWRGdW5jdGlvbihjYWxsYmFjayl7XG5cdFx0dmFyIHJlc3VsdCA9IGZhbHNlO1xuXHRcdGlmKCFjYWxsYmFjayB8fCB0eXBlb2YgY2FsbGJhY2sgIT0gXCJmdW5jdGlvblwiKXtcblx0XHRcdHJlc3VsdCA9IHRydWU7XG5cdFx0XHR3cHJpbnQoXCJFeHBlY3RlZCB0byBiZSBmdW5jdGlvbiBidXQgaXM6IFwiICsgY2FsbGJhY2spO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG59XG5cbmV4cG9ydHMuc291bmRQdWJTdWIgPSBuZXcgU291bmRQdWJTdWIoKTsiLCIvKiB3aHkgRnVuY3Rpb24gcHJvdG90eXBlIGltcGxlbWVudGF0aW9uKi9cblxuXG52YXIgbG9nZ2VyID0gcmVxdWlyZSgnZG91YmxlLWNoZWNrJykubG9nZ2VyO1xuXG5sb2dnZXIuYWRkQ2FzZShcImR1bXBXaHlzXCIsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGV4cG9ydHMuZ2V0QWxsQ29udGV4dHMoKTtcbiAgICBcbn0pO1xuXG5mdW5jdGlvbiBuZXdUcmFja2luZ0l0ZW0obW90aXZhdGlvbixjYWxsZXIpe1xuICAgIHJldHVybiB7XG4gICAgICAgIHN0ZXA6bW90aXZhdGlvbixcbiAgICAgICAgcGFyZW50OmNhbGxlcixcbiAgICAgICAgY2hpbGRyZW46W10sXG4gICAgICAgIGlkOmNhbGxlci5jb250ZXh0LmdldE5ld0lkKCksXG4gICAgICAgIGNvbnRleHQ6Y2FsbGVyLmNvbnRleHQsXG4gICAgICAgIGluZGV4SW5QYXJlbnRDaGlsZHJlbjpjYWxsZXIuaGFzT3duUHJvcGVydHkoJ2NoaWxkcmVuJyk/Y2FsbGVyLmNoaWxkcmVuLmxlbmd0aDowXG4gICAgfTtcbn1cblxudmFyIGNvbnRleHRzID0gW107XG5cbnZhciBnbG9iYWxDdXJyZW50Q29udGV4dCA9IG51bGw7XG5cbmV4cG9ydHMuZ2V0R2xvYmFsQ3VycmVudENvbnRleHQgPSBmdW5jdGlvbigpe1xuICAgIGlmKHByb2Nlc3MuZW52WydSVU5fV0lUSF9XSFlTJ10pIHtcbiAgICAgICAgcmV0dXJuIGdsb2JhbEN1cnJlbnRDb250ZXh0O1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1doeSBpcyBub3QgYWN0aXZhdGVkXFxuWW91IG11c3Qgc2V0IGVudiB2YXJpYWJsZSBSVU5fV0lUSF9XSFlTIHRvIHRydWUgdG8gYmUgYWJsZSB0byB1c2Ugd2h5cycpXG4gICAgfVxufVxuXG5leHBvcnRzLmdldEFsbENvbnRleHRzID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gY29udGV4dHM7XG59XG5cblxuZnVuY3Rpb24gb25UZXJtaW5hdGlvbigpe1xuICAgIGlmKHByb2Nlc3MuZW52WydSVU5fV0lUSF9XSFlTJ10pIHtcbiAgICAgICAgdmFyIHByb2Nlc3Nfc3VtbWFyeSA9IGV4cG9ydHMuZ2V0QWxsQ29udGV4dHMoKS5tYXAoZnVuY3Rpb24oY29udGV4dCkge3JldHVybiBjb250ZXh0LmdldEV4ZWN1dGlvblN1bW1hcnkoKX0pXG5cbiAgICAgICAgaWYocHJvY2Vzcy5zZW5kKXtcbiAgICAgICAgICAgIGxpbmtXaXRoUGFyZW50UHJvY2VzcygpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGxvZ2dlci5kdW1wV2h5cygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGxpbmtXaXRoUGFyZW50UHJvY2Vzcygpe1xuICAgICAgICBwcm9jZXNzLnNlbmQoe1wid2h5TG9nc1wiOnByb2Nlc3Nfc3VtbWFyeX0pXG4gICAgfVxufVxuXG5wcm9jZXNzLm9uKCdleGl0Jywgb25UZXJtaW5hdGlvbik7XG5cblxuZnVuY3Rpb24gVHJhY2tpbmdDb250ZXh0KCl7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBsYXN0SWQgPSAwO1xuICAgIHRoaXMuZ2V0RXhlY3V0aW9uU3VtbWFyeSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBzdW1tYXJ5ID0ge31cbiAgICAgICAgc2VsZi5zdGFydGluZ1BvaW50LmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpe1xuICAgICAgICAgICAgc3VtbWFyeVtjaGlsZC5zdGVwXSA9IGdldE5vZGVTdW1tYXJ5KGNoaWxkKTtcbiAgICAgICAgfSlcblxuICAgICAgICBmdW5jdGlvbiBnZXROb2RlU3VtbWFyeShub2RlKXtcbiAgICAgICAgICAgIGlmKG5vZGVbJ3N1bW1hcnknXSl7XG4gICAgICAgICAgICAgICAgLy90aGlzIG5vZGUgaXMgYWxyZWFkeSBhIHN1bW1hcml6ZWQgKCBpdCB3YXMgZXhlY3V0ZWQgaW4gYW5vdGhlciBwcm9jZXNzKVxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlWydzdW1tYXJ5J107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc3VtbWFyeSA9IHt9O1xuICAgICAgICAgICAgc3VtbWFyeS5hcmdzID0gbm9kZS5hcmdzO1xuICAgICAgICAgICAgc3VtbWFyeS5zdGFjayA9IG5vZGUuc3RhY2s7XG4gICAgICAgICAgICBpZihub2RlLmV4Y2VwdGlvbil7XG4gICAgICAgICAgICAgICAgc3VtbWFyeS5leGNlcHRpb24gPSBub2RlLmV4Y2VwdGlvbjtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGlmKG5vZGUuY2hpbGRyZW4ubGVuZ3RoPjApe1xuICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5LmNhbGxzID0ge307XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5LmNhbGxzW2NoaWxkLnN0ZXBdID0gZ2V0Tm9kZVN1bW1hcnkoY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdW1tYXJ5O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdW1tYXJ5O1xuICAgIH1cbiAgICB0aGlzLmdldE5ld0lkID0gZnVuY3Rpb24oKXtyZXR1cm4gbGFzdElkKyt9XG4gICAgdGhpcy5jdXJyZW50UnVubmluZ0l0ZW0gPSBuZXdUcmFja2luZ0l0ZW0oXCJDb250ZXh0IHN0YXJ0ZXJcIix7Y29udGV4dDpzZWxmfSk7XG4gICAgdGhpcy5zdGFydGluZ1BvaW50ID0gdGhpcy5jdXJyZW50UnVubmluZ0l0ZW07XG4gICAgY29udGV4dHMucHVzaCh0aGlzKTtcbn1cblxudmFyIGdsb2JhbFdoeVN0YWNrTGV2ZWwgPSAwO1xuXG5GdW5jdGlvbi5wcm90b3R5cGUud2h5ID0gZnVuY3Rpb24obW90aXZhdGlvbiwgY2FsbGVyLG90aGVyQ29udGV4dEluZm8sIGV4dGVybmFsQmluZGVyKXtcbiAgICBpZighcHJvY2Vzcy5lbnZbXCJSVU5fV0lUSF9XSFlTXCJdKXtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgbmV3Q29udGV4dCA9IGZhbHNlO1xuICAgIHZhciB0aGlzSXRlbTtcbiAgICBsaW5rVG9Db250ZXh0KCk7XG5cblxuICAgIHZhciB3aHlGdW5jID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdXBkYXRlQ29udGV4dCh0aGlzSXRlbSk7XG4gICAgICAgIGFkZEFyZ3MoYXJndW1lbnRzLHRoaXNJdGVtKTtcbiAgICAgICAgYXR0YXRjaFN0YWNrSW5mb1RvSXRlbVdIWSh0aGlzSXRlbSxuZXdDb250ZXh0LGdsb2JhbFdoeVN0YWNrTGV2ZWwpO1xuICAgICAgICByZXNvbHZlRW1iZWRkaW5nTGV2ZWwodGhpc0l0ZW0pO1xuICAgICAgICB2YXIgcmVzdWx0ID0gZXhlY3V0ZVdIWUZ1bmN0aW9uKHNlbGYsdGhpc0l0ZW0sYXJndW1lbnRzKTtcbiAgICAgICAgLy9tYXliZUxvZyhnbG9iYWxDdXJyZW50Q29udGV4dCk7XG4gICAgICAgIHJldHVybkZyb21DYWxsKHRoaXNJdGVtKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cblxuICAgIHJldHVybiB3aHlGdW5jO1xuXG4gICAgZnVuY3Rpb24gbGlua1RvQ29udGV4dCgpe1xuICAgICAgICBpZighY2FsbGVyKXtcbiAgICAgICAgICAgIGlmIChnbG9iYWxXaHlTdGFja0xldmVsID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZ2xvYmFsQ3VycmVudENvbnRleHQgPSBuZXcgVHJhY2tpbmdDb250ZXh0KCk7XG4gICAgICAgICAgICAgICAgbmV3Q29udGV4dCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzSXRlbSA9IG5ld1RyYWNraW5nSXRlbShtb3RpdmF0aW9uLCBnbG9iYWxDdXJyZW50Q29udGV4dC5jdXJyZW50UnVubmluZ0l0ZW0pO1xuICAgICAgICAgICAgZ2xvYmFsQ3VycmVudENvbnRleHQuY3VycmVudFJ1bm5pbmdJdGVtLmNoaWxkcmVuLnB1c2godGhpc0l0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICB0aGlzSXRlbSA9IG5ld1RyYWNraW5nSXRlbShtb3RpdmF0aW9uLGNhbGxlcik7XG4gICAgICAgICAgICBjYWxsZXIuY2hpbGRyZW4ucHVzaCh0aGlzSXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhdHRhdGNoU3RhY2tJbmZvVG9JdGVtV0hZKGl0ZW0sbmV3Q29udGV4dCxnbG9iYWxXaHRTdGFja0xldmVsKSB7XG4gICAgICAgIHZhciBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrLnNwbGl0KFwiXFxuXCIpO1xuXG4gICAgICAgIHN0YWNrLnNoaWZ0KCk7XG5cbiAgICAgICAgc3RhY2sgPSBkcm9wTGluZXNNYXRjaGluZyhzdGFjaywgW1wiV0hZXCJdKTtcblxuICAgICAgICBpdGVtLndoeUVtYmVkZGluZ0xldmVsID0gZ2V0V2h5RW1iZWRkaW5nTGV2ZWwoc3RhY2spO1xuICAgICAgICBpdGVtLnN0YWNrID0gZ2V0UmVsZXZhbnRTdGFjayhpdGVtLCBzdGFjayk7XG4gICAgICAgIGl0ZW0uaXNDYWxsYmFjayA9IChnbG9iYWxXaHlTdGFja0xldmVsID09PSBpdGVtLndoeUVtYmVkZGluZ0xldmVsIC0gMSkgJiYgKCFuZXdDb250ZXh0KTtcblxuXG4gICAgICAgIGZ1bmN0aW9uIGdldFdoeUVtYmVkZGluZ0xldmVsKHN0YWNrKSB7XG4gICAgICAgICAgICB2YXIgd2h5RW1iZWRkaW5nTGV2ZWwgPSAwO1xuICAgICAgICAgICAgc3RhY2suc29tZShmdW5jdGlvbiAoc3RhY2tMaW5lKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YWNrTGluZS5tYXRjaChcIndoeUZ1bmNcIikgIT09IG51bGwgfHwgc3RhY2tMaW5lLm1hdGNoKFwiYXQgd2h5RnVuY1wiKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB3aHlFbWJlZGRpbmdMZXZlbCsrO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJldHVybiB3aHlFbWJlZGRpbmdMZXZlbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldFJlbGV2YW50U3RhY2sodHJhY2tpbmdJdGVtLCBzdGFjaykge1xuICAgICAgICAgICAgaWYgKHRyYWNraW5nSXRlbS5pc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc3RhY2sgPSBbXTtcbiAgICAgICAgICAgICAgICBzdGFjay5wdXNoKHRyYWNraW5nSXRlbS5wYXJlbnQuc3RhY2tbMF0pO1xuICAgICAgICAgICAgICAgIHN0YWNrLnB1c2goXCIgICAgICAgQWZ0ZXIgY2FsbGJhY2tcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YWNrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0cmFja2luZ0l0ZW0ucGFyZW50Lmhhc093blByb3BlcnR5KFwic3RhY2tcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRyb3BXaHlzRnJvbVN0YWNrKHN0YWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGtlZXAgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZhciBmaXJzdFJlZHVuZGFudFN0YWNrTGluZSA9IHRyYWNraW5nSXRlbS5wYXJlbnQuc3RhY2tbMF07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZHJvcFdoeXNGcm9tU3RhY2soc3RhY2suZmlsdGVyKGZ1bmN0aW9uIChzdGFja0xpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YWNrTGluZSA9PT0gZmlyc3RSZWR1bmRhbnRTdGFja0xpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtlZXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2VlcDtcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGRyb3BXaHlzRnJvbVN0YWNrKHN0YWNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHdoeU1hdGNoZXMgPSBbXCJ3aHlGdW5jXCJdO1xuICAgICAgICAgICAgICAgIHJldHVybiBkcm9wTGluZXNNYXRjaGluZyhzdGFjaywgd2h5TWF0Y2hlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBkcm9wTGluZXNNYXRjaGluZyhzdGFjaywgbGluZU1hdGNoZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGFjay5maWx0ZXIoZnVuY3Rpb24gKHN0YWNrTGluZSkge1xuICAgICAgICAgICAgICAgIHZhciByZXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGxpbmVNYXRjaGVzLmZvckVhY2goZnVuY3Rpb24gKGxpbmVNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhY2tMaW5lLm1hdGNoKGxpbmVNYXRjaCkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNvbHZlRW1iZWRkaW5nTGV2ZWwoaXRlbSl7XG4gICAgICAgIGlmKGl0ZW0ud2h5RW1iZWRkaW5nTGV2ZWw+MSkge1xuICAgICAgICAgICAgaXRlbS5zdGVwICs9IFwiIEFORCBcIiArIGl0ZW0ucGFyZW50LmNoaWxkcmVuLnNwbGljZShpdGVtLmluZGV4SW5QYXJlbnRDaGlsZHJlbiArMSwgMSlbMF0uc3RlcDtcbiAgICAgICAgICAgIGl0ZW0ucGFyZW50LmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGRyZW4pe1xuICAgICAgICAgICAgICAgIGlmKGNoaWxkcmVuLmluZGV4SW5QYXJlbnRDaGlsZHJlbj5pdGVtLmluZGV4SW5QYXJlbnRDaGlsZHJlbil7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLmluZGV4SW5QYXJlbnRDaGlsZHJlbi0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRBcmdzKGFyZ3MsaXRlbSl7XG4gICAgICAgIHZhciBhID0gW107XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGlmKHR5cGVvZiBhcmdzW2ldID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAgICAgICAgIGEucHVzaChcImZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgYS5wdXNoKEpTT04uc3RyaW5naWZ5KGFyZ3NbaV0pKTtcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICBhLnB1c2goXCJVbnNlcmlhbGl6YWJsZSBhcmd1bWVudCBvZiB0eXBlIFwiK3R5cGVvZiBhcmdzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpdGVtLmFyZ3MgPSBhO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUNvbnRleHQoaXRlbSl7XG4gICAgICAgIGdsb2JhbEN1cnJlbnRDb250ZXh0ID0gaXRlbS5jb250ZXh0O1xuICAgICAgICBnbG9iYWxDdXJyZW50Q29udGV4dC5jdXJyZW50UnVubmluZ0l0ZW0gPSBpdGVtO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4ZWN1dGVXSFlGdW5jdGlvbihmdW5jLGl0ZW0sYXJncykge1xuICAgICAgICB2YXIgcHJldmlvdXNHbG9iYWxXaHlTdGFja0xldmVsID0gZ2xvYmFsV2h5U3RhY2tMZXZlbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGdsb2JhbFdoeVN0YWNrTGV2ZWwrKztcbiAgICAgICAgICAgIGl0ZW0ucmVzdWx0ID0gZnVuYy5hcHBseShmdW5jLCBhcmdzKTtcbiAgICAgICAgICAgIGl0ZW0uZG9uZSA9IHRydWU7XG4gICAgICAgICAgICBnbG9iYWxXaHlTdGFja0xldmVsLS07XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5yZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgZ2xvYmFsV2h5U3RhY2tMZXZlbCA9IHByZXZpb3VzR2xvYmFsV2h5U3RhY2tMZXZlbDtcbiAgICAgICAgICAgIGlmKGV4Y2VwdGlvbi5sb2dnZWQhPT10cnVlKXtcbiAgICAgICAgICAgICAgICB2YXIgZXJyb3IgPSB7XG4gICAgICAgICAgICAgICAgICAgICdleGNlcHRpb24nOmV4Y2VwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgJ2xvZ2dlZCc6dHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpdGVtWydleGNlcHRpb24nXSA9IGVycm9yO1xuICAgICAgICAgICAgICAgIGl0ZW0uZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgZ2xvYmFsQ3VycmVudENvbnRleHQuY3VycmVudFJ1bm5pbmdJdGVtID0gaXRlbS5wYXJlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXRlbS5yZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmV0dXJuRnJvbUNhbGwoaXRlbSl7XG4gICAgICAgIGdsb2JhbEN1cnJlbnRDb250ZXh0LmN1cnJlbnRSdW5uaW5nSXRlbSA9IGl0ZW0ucGFyZW50O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1heWJlTG9nKGNvbnRleHQpe1xuICAgICAgICBpZihnbG9iYWxXaHlTdGFja0xldmVsID09PSAwKXtcbiAgICAgICAgICAgIGxvZ2dlci5sb2dXaHkoY29udGV4dC5nZXRFeGVjdXRpb25TdW1tYXJ5KCkpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuXG4vKlxuICAgIFdoZW4gbGF1bmNoaW5nIGNoaWxkIHByb2Nlc3NlcyB0aGF0IHJ1biB3aXRoIFdIWVMgeW91IG1pZ2h0IHdhbnQgdG8gZ2V0IHRob3NlIGxvZ3MgYW5kIGludGVncmF0ZSBpblxuICAgIHRoZSBjb250ZXh0IG9mIHRoZSBwYXJlbnQgcHJvY2Vzc1xuICovXG5leHBvcnRzLmxpbmtXaHlDb250ZXh0ID0gZnVuY3Rpb24oY2hpbGRQcm9jZXNzLHN0ZXBOYW1lKXtcbiAgICB2YXIgb25NZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgIGlmKCFjaGlsZFByb2Nlc3MuX2V2ZW50c1snbWVzc2FnZSddKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJDYWxsYmFja3MgZm9yICdtZXNzYWdlJyBldmVudCBtdXN0IGJlIHJlZ2lzdGVyZWQgYmVmb3JlIGxpbmtpbmcgd2l0aCB0aGUgd2h5IGNvbnRleHQhXCIpXG4gICAgfWVsc2V7XG4gICAgICAgIG9uTWVzc2FnZSA9IGNoaWxkUHJvY2Vzcy5ldmVudHNbJ21lc3NhZ2UnXVxuICAgIH1cblxuICAgIFxuICAgIHZhciBjYWxsaW5nUG9pbnQgPSBleHBvcnRzLmdldEdsb2JhbEN1cnJlbnRDb250ZXh0KCkuY3VycmVudFJ1bm5pbmdJdGVtO1xuICAgIGNoaWxkUHJvY2Vzcy5vbignbWVzc2FnZScsZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgIGlmKG9uTWVzc2FnZSkge1xuICAgICAgICAgICAgb25NZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZihtZXNzYWdlWyd3aHlMb2dzJ10pe1xuICAgICAgICAgICAgbWVzc2FnZVsnd2h5TG9ncyddLmZvckVhY2goZnVuY3Rpb24oY29udGV4dFN1bW1heSkge1xuICAgICAgICAgICAgICAgIGNhbGxpbmdQb2ludC5jaGlsZHJlbi5wdXNoKHtcInN0ZXBcIjpzdGVwTmFtZSwnc3VtbWFyeSc6Y29udGV4dFN1bW1heX0pXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfSlcbn1cbiJdfQ==
