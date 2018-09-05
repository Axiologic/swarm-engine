(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{"./../modules/callflow":6,"./fakes/dummyVM":2}],2:[function(require,module,exports){
function dummyVM(name){
	function solveSwarm(swarm){
		$$.swarmsInstancesManager.revive_swarm(swarm);
	}

	$$.PSK_PubSub.subscribe(name, solveSwarm);
	console.log("Creating a fake execution context...");
}

global.vm = dummyVM($$.CONSTANTS.SWARM_FOR_EXECUTION);
},{}],3:[function(require,module,exports){

$$.__runtimeModules["assert"] = require("assert");
$$.__runtimeModules["crypto"] = require("crypto");
//$$.__runtimeModules["zlib"] = require("zlib");



},{"assert":undefined,"crypto":undefined}],4:[function(require,module,exports){

$$.__runtimeModules["soundpubsub"] = require("soundpubsub");
$$.__runtimeModules["callflow"] = require("callflow");
$$.__runtimeModules["dicontainer"] = require("dicontainer");
$$.__runtimeModules["double-check"] = require("double-check");
$$.__runtimeModules["pskcrypto"] = require("pskcrypto");


},{"callflow":6,"dicontainer":17,"double-check":18,"pskcrypto":25,"soundpubsub":48}],5:[function(require,module,exports){
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

require("./pskModules");



},{"./nodeModules":3,"./pskModules":4}],6:[function(require,module,exports){
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

},{"./lib/choreographies/swarmInstancesManager":8,"./lib/choreographies/utilityFunctions/swarm":11,"./lib/loadLibrary":12,"./lib/parallelJoinPoint":13,"./lib/safe-uuid":14,"./lib/serialJoinPoint":15,"./lib/swarmDescription":16,"path":undefined}],7:[function(require,module,exports){
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


},{"fs":undefined,"util":undefined}],8:[function(require,module,exports){


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



},{}],9:[function(require,module,exports){
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
},{"../../parallelJoinPoint":13,"../../serialJoinPoint":15,"../SwarmDebug":7}],10:[function(require,module,exports){
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
},{"./base":9}],11:[function(require,module,exports){
exports.createForObject = function(valueObject, thisObject, localId){
	return require("./base").createForObject(valueObject, thisObject, localId);
};
},{"./base":9}],12:[function(require,module,exports){
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
},{"fs":undefined,"path":undefined}],13:[function(require,module,exports){

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
},{}],14:[function(require,module,exports){

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
},{"crypto":undefined}],15:[function(require,module,exports){

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
},{}],16:[function(require,module,exports){
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
},{"./choreographies/utilityFunctions/callflow":10}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){

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
},{"./standardAsserts.js":19,"./standardChecks.js":20,"./standardExceptions.js":21,"./standardLogs.js":22,"./testRunner.js":23}],19:[function(require,module,exports){
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
},{"./checksCore.js":18}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
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


},{"whys":53}],23:[function(require,module,exports){
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

},{"../../../engine/core":1,"./utils/glob-to-regexp":24,"child_process":undefined,"fs":undefined,"path":undefined}],24:[function(require,module,exports){

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
},{}],25:[function(require,module,exports){
const PskCrypto = require("./lib/PskCrypto");

const ssutil = require("./signsensusDS/ssutil")

module.exports = PskCrypto;

module.exports.hashValues = ssutil.hashValues;


},{"./lib/PskCrypto":27,"./signsensusDS/ssutil":47}],26:[function(require,module,exports){
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
},{"./keyEncoder":43,"crypto":undefined}],27:[function(require,module,exports){

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
},{"./ECDSA":26,"./psk-archiver":44,"./utils/cryptoUtils":45,"crypto":undefined,"fs":undefined,"os":undefined,"path":undefined,"stream":undefined}],28:[function(require,module,exports){
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

},{"./asn1":29,"util":undefined,"vm":undefined}],29:[function(require,module,exports){
var asn1 = exports;

asn1.bignum = require('./bignum/bn');

asn1.define = require('./api').define;
asn1.base = require('./base/index');
asn1.constants = require('./constants/index');
asn1.decoders = require('./decoders/index');
asn1.encoders = require('./encoders/index');

},{"./api":28,"./base/index":31,"./bignum/bn":34,"./constants/index":36,"./decoders/index":38,"./encoders/index":41}],30:[function(require,module,exports){
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

},{"../base":31,"buffer":undefined,"util":undefined}],31:[function(require,module,exports){
var base = exports;

base.Reporter = require('./reporter').Reporter;
base.DecoderBuffer = require('./buffer').DecoderBuffer;
base.EncoderBuffer = require('./buffer').EncoderBuffer;
base.Node = require('./node');

},{"./buffer":30,"./node":32,"./reporter":33}],32:[function(require,module,exports){
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

},{"../base":31}],33:[function(require,module,exports){
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

},{"util":undefined}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
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

},{"../constants":36}],36:[function(require,module,exports){
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

},{"./der":35}],37:[function(require,module,exports){
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

},{"../asn1":29,"util":undefined}],38:[function(require,module,exports){
var decoders = exports;

decoders.der = require('./der');
decoders.pem = require('./pem');

},{"./der":37,"./pem":39}],39:[function(require,module,exports){
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

},{"../asn1":29,"./der":37,"buffer":undefined,"util":undefined}],40:[function(require,module,exports){
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

},{"../asn1":29,"buffer":undefined,"util":undefined}],41:[function(require,module,exports){
var encoders = exports;

encoders.der = require('./der');
encoders.pem = require('./pem');

},{"./der":40,"./pem":42}],42:[function(require,module,exports){
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

},{"../asn1":29,"./der":40,"buffer":undefined,"util":undefined}],43:[function(require,module,exports){
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
},{"./asn1/asn1":29,"./asn1/bignum/bn":34}],44:[function(require,module,exports){
require("../../../engine/core");
const path = require("path");
const yazl = $$.requireModule("yazl");
const yauzl = $$.requireModule("yauzl");
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
},{"../../../engine/core":1,"./utils/isStream":46,"fs":undefined,"path":undefined}],45:[function(require,module,exports){

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



},{"../psk-archiver":44,"./isStream":46,"crypto":undefined,"fs":undefined,"path":undefined}],46:[function(require,module,exports){
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
},{"stream":undefined}],47:[function(require,module,exports){
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
},{"crypto":undefined}],48:[function(require,module,exports){
module.exports = {
					beesHealer: require("./lib/beesHealer"),
					soundPubSub: require("./lib/soundPubSub").soundPubSub,
					folderMQ: require("./lib/folderMQ")
};
},{"./lib/beesHealer":50,"./lib/folderMQ":51,"./lib/soundPubSub":52}],49:[function(require,module,exports){
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
},{}],50:[function(require,module,exports){

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
},{}],51:[function(require,module,exports){

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
},{"./beesHealer":50,"fs":undefined,"path":undefined}],52:[function(require,module,exports){
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
},{"./Queue":49}],53:[function(require,module,exports){
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

},{"double-check":18}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9lbmdpbmUvY29yZS5qcyIsIi4uL2VuZ2luZS9mYWtlcy9kdW1teVZNLmpzIiwiLi4vZW5naW5lL3Bza2J1aWxkdGVtcC9ub2RlTW9kdWxlcy5qcyIsIi4uL2VuZ2luZS9wc2tidWlsZHRlbXAvcHNrTW9kdWxlcy5qcyIsIi4uL2VuZ2luZS9wc2tidWlsZHRlbXAvcHNrcnVudGltZS5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvaW5kZXguanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9jaG9yZW9ncmFwaGllcy9Td2FybURlYnVnLmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvc3dhcm1JbnN0YW5jZXNNYW5hZ2VyLmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvdXRpbGl0eUZ1bmN0aW9ucy9iYXNlLmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvdXRpbGl0eUZ1bmN0aW9ucy9jYWxsZmxvdy5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvc3dhcm0uanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9sb2FkTGlicmFyeS5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL3BhcmFsbGVsSm9pblBvaW50LmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvc2FmZS11dWlkLmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvc2VyaWFsSm9pblBvaW50LmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvc3dhcm1EZXNjcmlwdGlvbi5qcyIsIi4uL21vZHVsZXMvZGljb250YWluZXIvbGliL2NvbnRhaW5lci5qcyIsIi4uL21vZHVsZXMvZG91YmxlLWNoZWNrL2xpYi9jaGVja3NDb3JlLmpzIiwiLi4vbW9kdWxlcy9kb3VibGUtY2hlY2svbGliL3N0YW5kYXJkQXNzZXJ0cy5qcyIsIi4uL21vZHVsZXMvZG91YmxlLWNoZWNrL2xpYi9zdGFuZGFyZENoZWNrcy5qcyIsIi4uL21vZHVsZXMvZG91YmxlLWNoZWNrL2xpYi9zdGFuZGFyZEV4Y2VwdGlvbnMuanMiLCIuLi9tb2R1bGVzL2RvdWJsZS1jaGVjay9saWIvc3RhbmRhcmRMb2dzLmpzIiwiLi4vbW9kdWxlcy9kb3VibGUtY2hlY2svbGliL3Rlc3RSdW5uZXIuanMiLCIuLi9tb2R1bGVzL2RvdWJsZS1jaGVjay9saWIvdXRpbHMvZ2xvYi10by1yZWdleHAuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9pbmRleC5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9FQ0RTQS5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9Qc2tDcnlwdG8uanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9hcGkuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9hc24xLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvYmFzZS9idWZmZXIuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9iYXNlL2luZGV4LmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvYmFzZS9ub2RlLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvYmFzZS9yZXBvcnRlci5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2JpZ251bS9ibi5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2NvbnN0YW50cy9kZXIuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9jb25zdGFudHMvaW5kZXguanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9kZWNvZGVycy9kZXIuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9kZWNvZGVycy9pbmRleC5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2RlY29kZXJzL3BlbS5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2VuY29kZXJzL2Rlci5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2VuY29kZXJzL2luZGV4LmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvZW5jb2RlcnMvcGVtLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2tleUVuY29kZXIuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvcHNrLWFyY2hpdmVyLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL3V0aWxzL2NyeXB0b1V0aWxzLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL3V0aWxzL2lzU3RyZWFtLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vc2lnbnNlbnN1c0RTL3NzdXRpbC5qcyIsIi4uL21vZHVsZXMvc291bmRwdWJzdWIvaW5kZXguanMiLCIuLi9tb2R1bGVzL3NvdW5kcHVic3ViL2xpYi9RdWV1ZS5qcyIsIi4uL21vZHVsZXMvc291bmRwdWJzdWIvbGliL2JlZXNIZWFsZXIuanMiLCIuLi9tb2R1bGVzL3NvdW5kcHVic3ViL2xpYi9mb2xkZXJNUS5qcyIsIi4uL21vZHVsZXMvc291bmRwdWJzdWIvbGliL3NvdW5kUHViU3ViLmpzIiwiLi4vbW9kdWxlcy93aHlzL2xpYi93aHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5d0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKlxuIEluaXRpYWwgTGljZW5zZTogKGMpIEF4aW9sb2dpYyBSZXNlYXJjaCAmIEFsYm9haWUgU8OubmljxIMuXG4gQ29udHJpYnV0b3JzOiBBeGlvbG9naWMgUmVzZWFyY2ggLCBQcml2YXRlU2t5IHByb2plY3RcbiBDb2RlIExpY2Vuc2U6IExHUEwgb3IgTUlULlxuICovXG5cblxudmFyIGNhbGxmbG93TW9kdWxlID0gcmVxdWlyZShcIi4vLi4vbW9kdWxlcy9jYWxsZmxvd1wiKTtcblxuXG5cbmV4cG9ydHMuZW5hYmxlVGVzdGluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJlcXVpcmUoXCIuL2Zha2VzL2R1bW15Vk1cIik7XG59XG5cbnZhciBjb3JlID0gJCQucmVxdWlyZUxpYnJhcnkoXCJjb3JlXCIpO1xuXG5cbi8vVE9ETzogU0hPVUxEIGJlIG1vdmVkIGluICQkLl9fZ2xvYmFsc1xuJCQuZW5zdXJlRm9sZGVyRXhpc3RzID0gZnVuY3Rpb24oZm9sZGVyLCBjYWxsYmFjayl7XG5cbiAgICB2YXIgZmxvdyA9ICQkLmZsb3cuc3RhcnQoY29yZS5ta0RpclJlYyk7XG4gICAgZmxvdy5tYWtlKGZvbGRlciwgY2FsbGJhY2spO1xufTtcblxuJCQuZW5zdXJlTGlua0V4aXN0cyA9IGZ1bmN0aW9uKGV4aXN0aW5nUGF0aCwgbmV3UGF0aCwgY2FsbGJhY2spe1xuXG4gICAgdmFyIGZsb3cgPSAkJC5mbG93LnN0YXJ0KGNvcmUubWtEaXJSZWMpO1xuICAgIGZsb3cubWFrZUxpbmsoZXhpc3RpbmdQYXRoLCBuZXdQYXRoLCBjYWxsYmFjayk7XG59OyIsImZ1bmN0aW9uIGR1bW15Vk0obmFtZSl7XG5cdGZ1bmN0aW9uIHNvbHZlU3dhcm0oc3dhcm0pe1xuXHRcdCQkLnN3YXJtc0luc3RhbmNlc01hbmFnZXIucmV2aXZlX3N3YXJtKHN3YXJtKTtcblx0fVxuXG5cdCQkLlBTS19QdWJTdWIuc3Vic2NyaWJlKG5hbWUsIHNvbHZlU3dhcm0pO1xuXHRjb25zb2xlLmxvZyhcIkNyZWF0aW5nIGEgZmFrZSBleGVjdXRpb24gY29udGV4dC4uLlwiKTtcbn1cblxuZ2xvYmFsLnZtID0gZHVtbXlWTSgkJC5DT05TVEFOVFMuU1dBUk1fRk9SX0VYRUNVVElPTik7IiwiXG4kJC5fX3J1bnRpbWVNb2R1bGVzW1wiYXNzZXJ0XCJdID0gcmVxdWlyZShcImFzc2VydFwiKTtcbiQkLl9fcnVudGltZU1vZHVsZXNbXCJjcnlwdG9cIl0gPSByZXF1aXJlKFwiY3J5cHRvXCIpO1xuLy8kJC5fX3J1bnRpbWVNb2R1bGVzW1wiemxpYlwiXSA9IHJlcXVpcmUoXCJ6bGliXCIpO1xuXG5cbiIsIlxuJCQuX19ydW50aW1lTW9kdWxlc1tcInNvdW5kcHVic3ViXCJdID0gcmVxdWlyZShcInNvdW5kcHVic3ViXCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcImNhbGxmbG93XCJdID0gcmVxdWlyZShcImNhbGxmbG93XCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcImRpY29udGFpbmVyXCJdID0gcmVxdWlyZShcImRpY29udGFpbmVyXCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcImRvdWJsZS1jaGVja1wiXSA9IHJlcXVpcmUoXCJkb3VibGUtY2hlY2tcIik7XG4kJC5fX3J1bnRpbWVNb2R1bGVzW1wicHNrY3J5cHRvXCJdID0gcmVxdWlyZShcInBza2NyeXB0b1wiKTtcblxuIiwiaWYodHlwZW9mKGdsb2JhbCkgPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgaWYodHlwZW9mKHdpbmRvdykgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgZ2xvYmFsID0gd2luZG93O1xuICAgIH1cbn1cblxuaWYodHlwZW9mKGdsb2JhbC4kJCkgPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgZ2xvYmFsLiQkID0ge307XG5cbiAgICBpZih0eXBlb2Yod2luZG93KSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHdpbmRvdyA9IGdsb2JhbDtcbiAgICB9XG4gICAgd2luZG93LiQkID0gZ2xvYmFsLiQkO1xufVxuXG5pZih0eXBlb2YoJCRbXCJfX3J1bnRpbWVNb2R1bGVzXCJdKSA9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAkJC5fX3J1bnRpbWVNb2R1bGVzID0ge307XG4gICAgY29uc29sZS5sb2coXCJEZWZpbmluZyAkJC5fX3J1bnRpbWVNb2R1bGVzXCIsICQkLl9fcnVudGltZU1vZHVsZXMpXG59XG5cbmlmKHR5cGVvZigkJFtcImJyb3dzZXJSdW50aW1lXCJdKSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmVxdWlyZShcIi4vbm9kZU1vZHVsZXNcIilcbn1cblxucmVxdWlyZShcIi4vcHNrTW9kdWxlc1wiKTtcblxuXG4iLCJcbnZhciBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5cbmZ1bmN0aW9uIGRlZmF1bHRFcnJvckhhbmRsaW5nSW1wbGVtZW50YXRpb24oZXJyLCByZXMpe1xuXHQvL2NvbnNvbGUubG9nKGVyci5zdGFjayk7XG5cdGlmKGVycikgdGhyb3cgZXJyO1xuXHRyZXR1cm4gcmVzO1xufVxuXG5cbmlmKHR5cGVvZihnbG9iYWwuJCQpID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBnbG9iYWwuJCQgPSB7fTtcbn1cblxuJCQuZXJyb3JIYW5kbGVyID0ge1xuICAgICAgICBlcnJvcjpmdW5jdGlvbihlcnIsIGFyZ3MsIG1zZyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIsIFwiVW5rbm93biBlcnJvciBmcm9tIGZ1bmN0aW9uIGNhbGwgd2l0aCBhcmd1bWVudHM6XCIsIGFyZ3MsIFwiTWVzc2FnZTpcIiwgbXNnKTtcbiAgICAgICAgfSxcbiAgICAgICAgdGhyb3dFcnJvcjpmdW5jdGlvbihlcnIsIGFyZ3MsIG1zZyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIsIFwiVW5rbm93biBlcnJvciBmcm9tIGZ1bmN0aW9uIGNhbGwgd2l0aCBhcmd1bWVudHM6XCIsIGFyZ3MsIFwiTWVzc2FnZTpcIiwgbXNnKTtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSxcbiAgICAgICAgaWdub3JlUG9zc2libGVFcnJvcjogZnVuY3Rpb24obmFtZSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhuYW1lKTtcbiAgICAgICAgfSxcbiAgICAgICAgc3ludGF4RXJyb3I6ZnVuY3Rpb24ocHJvcGVydHksIHN3YXJtLCB0ZXh0KXtcbiAgICAgICAgICAgIC8vdGhyb3cgbmV3IEVycm9yKFwiTWlzc3BlbGxlZCBtZW1iZXIgbmFtZSBvciBvdGhlciBpbnRlcm5hbCBlcnJvciFcIik7XG4gICAgICAgICAgICB2YXIgc3dhcm1OYW1lO1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBzd2FybSA9PSBcInN0cmluZ1wiKXtcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1OYW1lID0gc3dhcm07XG4gICAgICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgaWYoc3dhcm0gJiYgc3dhcm0ubWV0YSl7XG4gICAgICAgICAgICAgICAgICAgIHN3YXJtTmFtZSAgPSBzd2FybS5tZXRhLnN3YXJtVHlwZU5hbWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1OYW1lID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpLm1ldGEuc3dhcm1UeXBlTmFtZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgc3dhcm1OYW1lID0gZXJyLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihwcm9wZXJ0eSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJXcm9uZyBtZW1iZXIgbmFtZSBcIiwgcHJvcGVydHksICBcIiBpbiBzd2FybSBcIiwgc3dhcm1OYW1lKTtcbiAgICAgICAgICAgICAgICBpZih0ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRleHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbmtub3duIHN3YXJtXCIsIHN3YXJtTmFtZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcbiAgICAgICAgd2FybmluZzpmdW5jdGlvbihtc2cpe1xuICAgICAgICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiQkLnVpZEdlbmVyYXRvciA9IHJlcXVpcmUoXCIuL2xpYi9zYWZlLXV1aWRcIik7XG5cbiQkLnNhZmVFcnJvckhhbmRsaW5nID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuICAgICAgICBpZihjYWxsYmFjayl7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2s7XG4gICAgICAgIH0gZWxzZXtcbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0RXJyb3JIYW5kbGluZ0ltcGxlbWVudGF0aW9uO1xuICAgICAgICB9XG4gICAgfTtcblxuJCQuX19pbnRlcm4gPSB7XG4gICAgICAgIG1rQXJnczpmdW5jdGlvbihhcmdzLHBvcyl7XG4gICAgICAgICAgICB2YXIgYXJnc0FycmF5ID0gW107XG4gICAgICAgICAgICBmb3IodmFyIGkgPSBwb3M7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICBhcmdzQXJyYXkucHVzaChhcmdzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhcmdzQXJyYXk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4kJC5fX2dsb2JhbCA9IHtcblxuICAgIH07XG5cblxuLypcbiByZXF1aXJlIGFuZCByZXF1aXJlTGlicmFyeSBhcmUgb3ZlcndyaXRpbmcgdGhlIG5vZGUuanMgZGVmYXVsdHMgaW4gbG9hZGluZyBtb2R1bGVzIGZvciBpbmNyZWFzaW5nIHNlY3VyaXR5IGFuZCBzcGVlZC5cbiBXZSBndWFyYW50ZWUgdGhhdCBlYWNoIG1vZHVsZSBvciBsaWJyYXJ5IGlzIGxvYWRlZCBvbmx5IG9uY2UgYW5kIG9ubHkgZnJvbSBhIHNpbmdsZSBmb2xkZXIuLi4gVXNlIHRoZSBzdGFuZGFyZCByZXF1aXJlIGlmIHlvdSBuZWVkIHNvbWV0aGluZyBlbHNlIVxuXG4gQnkgZGVmYXVsdCB3ZSBleHBlY3QgdG8gcnVuIGZyb20gYSBwcml2YXRlc2t5IFZNIGVuZ2luZSAoIGEgcHJpdmF0ZXNreSBub2RlKSBhbmQgdGhlcmVmb3JlIHRoZSBjYWxsZmxvdyBzdGF5cyBpbiB0aGUgbW9kdWxlcyBmb2xkZXIgdGhlcmUuXG4gQW55IG5ldyB1c2Ugb2YgY2FsbGZsb3cgKGFuZCByZXF1aXJlIG9yIHJlcXVpcmVMaWJyYXJ5KSBjb3VsZCByZXF1aXJlIGNoYW5nZXMgdG8gJCQuX19nbG9iYWwuX19sb2FkTGlicmF5Um9vdCBhbmQgJCQuX19nbG9iYWwuX19sb2FkTW9kdWxlc1Jvb3RcbiAqL1xuJCQuX19nbG9iYWwuX19sb2FkTGlicmFyeVJvb3QgICAgPSBfX2Rpcm5hbWUgKyBcIi8uLi8uLi9saWJyYXJpZXMvXCI7XG4kJC5fX2dsb2JhbC5fX2xvYWRNb2R1bGVzUm9vdCAgID0gX19kaXJuYW1lICsgXCIvLi4vLi4vbW9kdWxlcy9cIjtcbnZhciBsb2FkZWRNb2R1bGVzID0ge307XG4kJC5yZXF1aXJlID0gZnVuY3Rpb24obmFtZSl7XG5cdHZhciBleGlzdGluZ01vZHVsZSA9IGxvYWRlZE1vZHVsZXNbbmFtZV07XG5cblx0aWYoIWV4aXN0aW5nTW9kdWxlKXtcbiAgICAgICAgZXhpc3RpbmdNb2R1bGUgPSAkJC5fX3J1bnRpbWVNb2R1bGVzW25hbWVdO1xuICAgICAgICBpZighZXhpc3RpbmdNb2R1bGUpe1xuICAgICAgICAgICAgdmFyIGFic29sdXRlUGF0aCA9IHBhdGgucmVzb2x2ZSggJCQuX19nbG9iYWwuX19sb2FkTW9kdWxlc1Jvb3QgKyBuYW1lKTtcbiAgICAgICAgICAgIGV4aXN0aW5nTW9kdWxlID0gcmVxdWlyZShhYnNvbHV0ZVBhdGgpO1xuICAgICAgICAgICAgbG9hZGVkTW9kdWxlc1tuYW1lXSA9IGV4aXN0aW5nTW9kdWxlO1xuICAgICAgICB9XG5cdH1cblx0cmV0dXJuIGV4aXN0aW5nTW9kdWxlO1xufTtcblxudmFyIHN3YXJtVXRpbHMgPSByZXF1aXJlKFwiLi9saWIvY2hvcmVvZ3JhcGhpZXMvdXRpbGl0eUZ1bmN0aW9ucy9zd2FybVwiKTtcblxuJCQuZGVmYXVsdEVycm9ySGFuZGxpbmdJbXBsZW1lbnRhdGlvbiA9IGRlZmF1bHRFcnJvckhhbmRsaW5nSW1wbGVtZW50YXRpb247XG5cbnZhciBjYWxsZmxvd01vZHVsZSA9IHJlcXVpcmUoXCIuL2xpYi9zd2FybURlc2NyaXB0aW9uXCIpO1xuJCQuY2FsbGZsb3dzICAgICAgICA9IGNhbGxmbG93TW9kdWxlLmNyZWF0ZVN3YXJtRW5naW5lKFwiY2FsbGZsb3dcIik7XG4kJC5jYWxsZmxvdyAgICAgICAgID0gJCQuY2FsbGZsb3dzO1xuJCQuZmxvdyAgICAgICAgICAgICA9ICQkLmNhbGxmbG93cztcbiQkLmZsb3dzICAgICAgICAgICAgPSAkJC5jYWxsZmxvd3M7XG5cbiQkLnN3YXJtcyAgICAgICAgICAgPSBjYWxsZmxvd01vZHVsZS5jcmVhdGVTd2FybUVuZ2luZShcInN3YXJtXCIsIHN3YXJtVXRpbHMpO1xuJCQuc3dhcm0gICAgICAgICAgICA9ICQkLnN3YXJtcztcbiQkLmNvbnRyYWN0cyAgICAgICAgPSBjYWxsZmxvd01vZHVsZS5jcmVhdGVTd2FybUVuZ2luZShcImNvbnRyYWN0XCIsIHN3YXJtVXRpbHMpO1xuJCQuY29udHJhY3QgICAgICAgICA9ICQkLmNvbnRyYWN0cztcblxuXG5cblxuXG5cbiQkLlBTS19QdWJTdWIgPSAkJC5yZXF1aXJlKFwic291bmRwdWJzdWJcIikuc291bmRQdWJTdWI7XG5cbiQkLnNlY3VyaXR5Q29udGV4dCA9IFwic3lzdGVtXCI7XG4kJC5saWJyYXJ5UHJlZml4ID0gXCJnbG9iYWxcIjtcbiQkLmxpYnJhcmllcyA9IHtcbiAgICBnbG9iYWw6e1xuXG4gICAgfVxufTtcblxuXG5cbiQkLmxvYWRMaWJyYXJ5ID0gcmVxdWlyZShcIi4vbGliL2xvYWRMaWJyYXJ5XCIpLmxvYWRMaWJyYXJ5O1xuXG4kJC5yZXF1aXJlTGlicmFyeSA9IGZ1bmN0aW9uKG5hbWUpe1xuICAgIHZhciBhYnNvbHV0ZVBhdGggPSBwYXRoLnJlc29sdmUoICAkJC5fX2dsb2JhbC5fX2xvYWRMaWJyYXJ5Um9vdCArIG5hbWUpO1xuICAgIHJldHVybiAkJC5sb2FkTGlicmFyeShuYW1lLGFic29sdXRlUGF0aCk7XG59O1xuXG4kJC5yZWdpc3RlclN3YXJtRGVzY3JpcHRpb24gPSAgZnVuY3Rpb24obGlicmFyeU5hbWUsc2hvcnROYW1lLCBkZXNjcmlwdGlvbil7XG4gICAgaWYoISQkLmxpYnJhcmllc1tsaWJyYXJ5TmFtZV0pe1xuICAgICAgICAkJC5saWJyYXJpZXNbbGlicmFyeU5hbWVdID0ge307XG4gICAgfVxuICAgICQkLmxpYnJhcmllc1tsaWJyYXJ5TmFtZV1bc2hvcnROYW1lXSA9IGRlc2NyaXB0aW9uO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBcdFx0XHRcdGNyZWF0ZVN3YXJtRW5naW5lOiByZXF1aXJlKFwiLi9saWIvc3dhcm1EZXNjcmlwdGlvblwiKS5jcmVhdGVTd2FybUVuZ2luZSxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlSm9pblBvaW50OiByZXF1aXJlKFwiLi9saWIvcGFyYWxsZWxKb2luUG9pbnRcIikuY3JlYXRlSm9pblBvaW50LFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVTZXJpYWxKb2luUG9pbnQ6IHJlcXVpcmUoXCIuL2xpYi9zZXJpYWxKb2luUG9pbnRcIikuY3JlYXRlU2VyaWFsSm9pblBvaW50LFxuXHRcdFx0XHRcdFwic2FmZS11dWlkXCI6IHJlcXVpcmUoXCIuL2xpYi9zYWZlLXV1aWRcIiksXG4gICAgICAgICAgICAgICAgICAgIHN3YXJtSW5zdGFuY2VNYW5hZ2VyOiByZXF1aXJlKFwiLi9saWIvY2hvcmVvZ3JhcGhpZXMvc3dhcm1JbnN0YW5jZXNNYW5hZ2VyXCIpXG5cdFx0XHRcdH07IiwiLypcbkluaXRpYWwgTGljZW5zZTogKGMpIEF4aW9sb2dpYyBSZXNlYXJjaCAmIEFsYm9haWUgU8OubmljxIMuXG5Db250cmlidXRvcnM6IEF4aW9sb2dpYyBSZXNlYXJjaCAsIFByaXZhdGVTa3kgcHJvamVjdFxuQ29kZSBMaWNlbnNlOiBMR1BMIG9yIE1JVC5cbiovXG5cbnZhciB1dGlsID0gcmVxdWlyZShcInV0aWxcIik7XG52YXIgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5nbG9iYWwuY3ByaW50ID0gY29uc29sZS5sb2c7XG5nbG9iYWwud3ByaW50ID0gY29uc29sZS53YXJuO1xuZ2xvYmFsLmRwcmludCA9IGNvbnNvbGUuZGVidWc7XG5nbG9iYWwuZXByaW50ID0gY29uc29sZS5lcnJvcjtcblxuXG4vKipcbiAqIFNob3J0Y3V0IHRvIEpTT04uc3RyaW5naWZ5XG4gKiBAcGFyYW0gb2JqXG4gKi9cbmdsb2JhbC5KID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmopO1xufVxuXG5cbi8qKlxuICogUHJpbnQgc3dhcm0gY29udGV4dHMgKE1lc3NhZ2VzKSBhbmQgZWFzaWVyIHRvIHJlYWQgY29tcGFyZWQgd2l0aCBKXG4gKiBAcGFyYW0gb2JqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydHMuY2xlYW5EdW1wID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciBvID0gb2JqLnZhbHVlT2YoKTtcbiAgICB2YXIgbWV0YSA9IHtcbiAgICAgICAgc3dhcm1UeXBlTmFtZTpvLm1ldGEuc3dhcm1UeXBlTmFtZVxuICAgIH07XG4gICAgcmV0dXJuIFwiXFx0IHN3YXJtSWQ6IFwiICsgby5tZXRhLnN3YXJtSWQgKyBcIntcXG5cXHRcXHRtZXRhOiBcIiAgICArIEoobWV0YSkgK1xuICAgICAgICBcIlxcblxcdFxcdHB1YmxpYzogXCIgICAgICAgICsgSihvLnB1YmxpY1ZhcnMpICtcbiAgICAgICAgXCJcXG5cXHRcXHRwcm90ZWN0ZWQ6IFwiICAgICArIEooby5wcm90ZWN0ZWRWYXJzKSArXG4gICAgICAgIFwiXFxuXFx0XFx0cHJpdmF0ZTogXCIgICAgICAgKyBKKG8ucHJpdmF0ZVZhcnMpICsgXCJcXG5cXHR9XFxuXCI7XG59XG5cbi8vTSA9IGV4cG9ydHMuY2xlYW5EdW1wO1xuLyoqXG4gKiBFeHBlcmltZW50YWwgZnVuY3Rpb25zXG4gKi9cblxuXG4vKlxuXG5sb2dnZXIgICAgICA9IG1vbml0b3IubG9nZ2VyO1xuYXNzZXJ0ICAgICAgPSBtb25pdG9yLmFzc2VydDtcbnRocm93aW5nICAgID0gbW9uaXRvci5leGNlcHRpb25zO1xuXG5cbnZhciB0ZW1wb3JhcnlMb2dCdWZmZXIgPSBbXTtcblxudmFyIGN1cnJlbnRTd2FybUNvbUltcGwgPSBudWxsO1xuXG5sb2dnZXIucmVjb3JkID0gZnVuY3Rpb24ocmVjb3JkKXtcbiAgICBpZihjdXJyZW50U3dhcm1Db21JbXBsPT09bnVsbCl7XG4gICAgICAgIHRlbXBvcmFyeUxvZ0J1ZmZlci5wdXNoKHJlY29yZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudFN3YXJtQ29tSW1wbC5yZWNvcmRMb2cocmVjb3JkKTtcbiAgICB9XG59XG5cbnZhciBjb250YWluZXIgPSByZXF1aXJlKFwiZGljb250YWluZXJcIikuY29udGFpbmVyO1xuXG5jb250YWluZXIuc2VydmljZShcInN3YXJtTG9nZ2luZ01vbml0b3JcIiwgW1wic3dhcm1pbmdJc1dvcmtpbmdcIiwgXCJzd2FybUNvbUltcGxcIl0sIGZ1bmN0aW9uKG91dE9mU2VydmljZSxzd2FybWluZywgc3dhcm1Db21JbXBsKXtcblxuICAgIGlmKG91dE9mU2VydmljZSl7XG4gICAgICAgIGlmKCF0ZW1wb3JhcnlMb2dCdWZmZXIpe1xuICAgICAgICAgICAgdGVtcG9yYXJ5TG9nQnVmZmVyID0gW107XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdG1wID0gdGVtcG9yYXJ5TG9nQnVmZmVyO1xuICAgICAgICB0ZW1wb3JhcnlMb2dCdWZmZXIgPSBbXTtcbiAgICAgICAgY3VycmVudFN3YXJtQ29tSW1wbCA9IHN3YXJtQ29tSW1wbDtcbiAgICAgICAgbG9nZ2VyLnJlY29yZCA9IGZ1bmN0aW9uKHJlY29yZCl7XG4gICAgICAgICAgICBjdXJyZW50U3dhcm1Db21JbXBsLnJlY29yZExvZyhyZWNvcmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdG1wLmZvckVhY2goZnVuY3Rpb24ocmVjb3JkKXtcbiAgICAgICAgICAgIGxvZ2dlci5yZWNvcmQocmVjb3JkKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSlcblxuKi9cbmdsb2JhbC51bmNhdWdodEV4Y2VwdGlvblN0cmluZyA9IFwiXCI7XG5nbG9iYWwudW5jYXVnaHRFeGNlcHRpb25FeGlzdHMgPSBmYWxzZTtcbmlmKHR5cGVvZiBnbG9iYWwuZ2xvYmFsVmVyYm9zaXR5ID09ICd1bmRlZmluZWQnKXtcbiAgICBnbG9iYWwuZ2xvYmFsVmVyYm9zaXR5ID0gZmFsc2U7XG59XG5cbnZhciBERUJVR19TVEFSVF9USU1FID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbmZ1bmN0aW9uIGdldERlYnVnRGVsdGEoKXtcbiAgICB2YXIgY3VycmVudFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICByZXR1cm4gY3VycmVudFRpbWUgLSBERUJVR19TVEFSVF9USU1FO1xufVxuXG4vKipcbiAqIERlYnVnIGZ1bmN0aW9ucywgaW5mbHVlbmNlZCBieSBnbG9iYWxWZXJib3NpdHkgZ2xvYmFsIHZhcmlhYmxlXG4gKiBAcGFyYW0gdHh0XG4gKi9cbmRwcmludCA9IGZ1bmN0aW9uICh0eHQpIHtcbiAgICBpZiAoZ2xvYmFsVmVyYm9zaXR5ID09IHRydWUpIHtcbiAgICAgICAgaWYgKHRoaXNBZGFwdGVyLmluaXRpbGlzZWQgKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHOiBbXCIgKyB0aGlzQWRhcHRlci5ub2RlTmFtZSArIFwiXShcIiArIGdldERlYnVnRGVsdGEoKSsgXCIpOlwiK3R4dCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHOiAoXCIgKyBnZXREZWJ1Z0RlbHRhKCkrIFwiKTpcIit0eHQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJERUJVRzogXCIgKyB0eHQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIG9ic29sZXRlIT9cbiAqIEBwYXJhbSB0eHRcbiAqL1xuZ2xvYmFsLmFwcmludCA9IGZ1bmN0aW9uICh0eHQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkRFQlVHOiBbXCIgKyB0aGlzQWRhcHRlci5ub2RlTmFtZSArIFwiXTogXCIgKyB0eHQpO1xufVxuXG5cblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9uIHVzdWFsbHkgdXNlZCBpbiB0ZXN0cywgZXhpdCBjdXJyZW50IHByb2Nlc3MgYWZ0ZXIgYSB3aGlsZVxuICogQHBhcmFtIG1zZ1xuICogQHBhcmFtIHRpbWVvdXRcbiAqL1xuZ2xvYmFsLmRlbGF5RXhpdCA9IGZ1bmN0aW9uIChtc2csIHJldENvZGUsdGltZW91dCkge1xuICAgIGlmKHJldENvZGUgPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgcmV0Q29kZSA9IEV4aXRDb2Rlcy5Vbmtub3duRXJyb3I7XG4gICAgfVxuXG4gICAgaWYodGltZW91dCA9PSB1bmRlZmluZWQpe1xuICAgICAgICB0aW1lb3V0ID0gMTAwO1xuICAgIH1cblxuICAgIGlmKG1zZyA9PSB1bmRlZmluZWQpe1xuICAgICAgICBtc2cgPSBcIkRlbGF5aW5nIGV4aXQgd2l0aCBcIisgdGltZW91dCArIFwibXNcIjtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBwcm9jZXNzLmV4aXQocmV0Q29kZSk7XG4gICAgfSwgdGltZW91dCk7XG59XG5cblxuZnVuY3Rpb24gbG9jYWxMb2cgKGxvZ1R5cGUsIG1lc3NhZ2UsIGVycikge1xuICAgIHZhciB0aW1lID0gbmV3IERhdGUoKTtcbiAgICB2YXIgbm93ID0gdGltZS5nZXREYXRlKCkgKyBcIi1cIiArICh0aW1lLmdldE1vbnRoKCkgKyAxKSArIFwiLFwiICsgdGltZS5nZXRIb3VycygpICsgXCI6XCIgKyB0aW1lLmdldE1pbnV0ZXMoKTtcbiAgICB2YXIgbXNnO1xuXG4gICAgbXNnID0gJ1snICsgbm93ICsgJ11bJyArIHRoaXNBZGFwdGVyLm5vZGVOYW1lICsgJ10gJyArIG1lc3NhZ2U7XG5cbiAgICBpZiAoZXJyICE9IG51bGwgJiYgZXJyICE9IHVuZGVmaW5lZCkge1xuICAgICAgICBtc2cgKz0gJ1xcbiAgICAgRXJyOiAnICsgZXJyLnRvU3RyaW5nKCk7XG4gICAgICAgIGlmIChlcnIuc3RhY2sgJiYgZXJyLnN0YWNrICE9IHVuZGVmaW5lZClcbiAgICAgICAgICAgIG1zZyArPSAnXFxuICAgICBTdGFjazogJyArIGVyci5zdGFjayArICdcXG4nO1xuICAgIH1cblxuICAgIGNwcmludChtc2cpO1xuICAgIGlmKHRoaXNBZGFwdGVyLmluaXRpbGlzZWQpe1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICBmcy5hcHBlbmRGaWxlU3luYyhnZXRTd2FybUZpbGVQYXRoKHRoaXNBZGFwdGVyLmNvbmZpZy5sb2dzUGF0aCArIFwiL1wiICsgbG9nVHlwZSksIG1zZyk7XG4gICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGluZyB0byB3cml0ZSBsb2dzIGluIFwiLCB0aGlzQWRhcHRlci5jb25maWcubG9nc1BhdGggKTtcbiAgICAgICAgfVxuXG4gICAgfVxufVxuXG5cbmdsb2JhbC5wcmludGYgPSBmdW5jdGlvbiAoLi4ucGFyYW1zKSB7XG4gICAgdmFyIGFyZ3MgPSBbXTsgLy8gZW1wdHkgYXJyYXlcbiAgICAvLyBjb3B5IGFsbCBvdGhlciBhcmd1bWVudHMgd2Ugd2FudCB0byBcInBhc3MgdGhyb3VnaFwiXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJncy5wdXNoKHBhcmFtc1tpXSk7XG4gICAgfVxuICAgIHZhciBvdXQgPSB1dGlsLmZvcm1hdC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICBjb25zb2xlLmxvZyhvdXQpO1xufVxuXG5nbG9iYWwuc3ByaW50ZiA9IGZ1bmN0aW9uICguLi5wYXJhbXMpIHtcbiAgICB2YXIgYXJncyA9IFtdOyAvLyBlbXB0eSBhcnJheVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFyZ3MucHVzaChwYXJhbXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gdXRpbC5mb3JtYXQuYXBwbHkodGhpcywgYXJncyk7XG59XG5cbiIsIlxuXG5mdW5jdGlvbiBTd2FybXNJbnN0YW5jZXNNYW5hZ2VyKCl7XG4gICAgdmFyIHN3YXJtQWxpdmVJbnN0YW5jZXMgPSB7XG5cbiAgICB9XG5cbiAgICB0aGlzLndhaXRGb3JTd2FybSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBzd2FybSwga2VlcEFsaXZlQ2hlY2spe1xuXG4gICAgICAgIGZ1bmN0aW9uIGRvTG9naWMoKXtcbiAgICAgICAgICAgIHZhciBzd2FybUlkID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpLm1ldGEuc3dhcm1JZDtcbiAgICAgICAgICAgIHZhciB3YXRjaGVyID0gc3dhcm1BbGl2ZUluc3RhbmNlc1tzd2FybUlkXTtcbiAgICAgICAgICAgIGlmKCF3YXRjaGVyKXtcbiAgICAgICAgICAgICAgICB3YXRjaGVyID0ge1xuICAgICAgICAgICAgICAgICAgICBzd2FybTpzd2FybSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6Y2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgICAgIGtlZXBBbGl2ZUNoZWNrOmtlZXBBbGl2ZUNoZWNrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN3YXJtQWxpdmVJbnN0YW5jZXNbc3dhcm1JZF0gPSB3YXRjaGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZmlsdGVyKCl7XG4gICAgICAgICAgICByZXR1cm4gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpLm1ldGEuc3dhcm1JZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vJCQudWlkR2VuZXJhdG9yLndhaXRfZm9yX2NvbmRpdGlvbihjb25kaXRpb24sZG9Mb2dpYyk7XG4gICAgICAgIHN3YXJtLm9ic2VydmUoZG9Mb2dpYywgbnVsbCwgZmlsdGVyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGVhblN3YXJtV2FpdGVyKHN3YXJtU2VyaWFsaXNhdGlvbil7IC8vIFRPRE86IGFkZCBiZXR0ZXIgbWVjaGFuaXNtcyB0byBwcmV2ZW50IG1lbW9yeSBsZWFrc1xuICAgICAgICB2YXIgc3dhcm1JZCA9IHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLnN3YXJtSWQ7XG4gICAgICAgIHZhciB3YXRjaGVyID0gc3dhcm1BbGl2ZUluc3RhbmNlc1tzd2FybUlkXTtcblxuICAgICAgICBpZighd2F0Y2hlcil7XG4gICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIud2FybmluZyhcIkludmFsaWQgc3dhcm0gcmVjZWl2ZWQ6IFwiICsgc3dhcm1JZCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYXJncyA9IHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmFyZ3M7XG4gICAgICAgIGFyZ3MucHVzaChzd2FybVNlcmlhbGlzYXRpb24pO1xuXG4gICAgICAgIHdhdGNoZXIuY2FsbGJhY2suYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgIGlmKCF3YXRjaGVyLmtlZXBBbGl2ZUNoZWNrKCkpe1xuICAgICAgICAgICAgZGVsZXRlIHN3YXJtQWxpdmVJbnN0YW5jZXNbc3dhcm1JZF07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJldml2ZV9zd2FybSA9IGZ1bmN0aW9uKHN3YXJtU2VyaWFsaXNhdGlvbil7XG5cblxuICAgICAgICB2YXIgc3dhcm1JZCAgICAgPSBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5zd2FybUlkO1xuICAgICAgICB2YXIgc3dhcm1UeXBlICAgPSBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5zd2FybVR5cGVOYW1lO1xuICAgICAgICB2YXIgaW5zdGFuY2UgICAgPSBzd2FybUFsaXZlSW5zdGFuY2VzW3N3YXJtSWRdO1xuXG4gICAgICAgIHZhciBzd2FybTtcblxuICAgICAgICBpZihpbnN0YW5jZSl7XG4gICAgICAgICAgICBzd2FybSA9IGluc3RhbmNlLnN3YXJtO1xuXG4gICAgICAgIH0gICBlbHNlIHtcbiAgICAgICAgICAgIHN3YXJtID0gJCQuc3dhcm0uY3JlYXRlKHN3YXJtVHlwZSwgdW5kZWZpbmVkLCBzd2FybVNlcmlhbGlzYXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuY29tbWFuZCA9PSBcImFzeW5jUmV0dXJuXCIpe1xuICAgICAgICAgICAgY2xlYW5Td2FybVdhaXRlcihzd2FybVNlcmlhbGlzYXRpb24pO1xuICAgICAgICB9IGVsc2UgICAgIGlmKHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmNvbW1hbmQgPT0gXCJleGVjdXRlU3dhcm1QaGFzZVwiKXtcbiAgICAgICAgICAgIHN3YXJtLnJ1blBoYXNlKHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLnBoYXNlTmFtZSwgc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuYXJncyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVua25vd24gY29tbWFuZFwiLHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmNvbW1hbmQsIFwiaW4gc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuY29tbWFuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzd2FybTtcbiAgICB9XG59XG5cblxuJCQuc3dhcm1zSW5zdGFuY2VzTWFuYWdlciA9IG5ldyBTd2FybXNJbnN0YW5jZXNNYW5hZ2VyKCk7XG5cblxuIiwidmFyIGJlZXNIZWFsZXIgPSAkJC5yZXF1aXJlKFwic291bmRwdWJzdWJcIikuYmVlc0hlYWxlcjtcbnZhciBzd2FybURlYnVnID0gcmVxdWlyZShcIi4uL1N3YXJtRGVidWdcIik7XG5cbmV4cG9ydHMuY3JlYXRlRm9yT2JqZWN0ID0gZnVuY3Rpb24odmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpe1xuXHR2YXIgcmV0ID0ge307XG5cblx0ZnVuY3Rpb24gZmlsdGVyRm9yU2VyaWFsaXNhYmxlICh2YWx1ZU9iamVjdCl7XG5cdFx0cmV0dXJuIHZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1JZDtcblx0fVxuXG5cdHZhciBzd2FybUZ1bmN0aW9uID0gZnVuY3Rpb24oY29udGV4dCwgcGhhc2VOYW1lKXtcblx0XHR2YXIgYXJncyA9W107XG5cdFx0Zm9yKHZhciBpID0gMjsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKyl7XG5cdFx0XHRhcmdzLnB1c2goYXJndW1lbnRzW2ldKTtcblx0XHR9XG5cblx0XHQvL21ha2UgdGhlIGV4ZWN1dGlvbiBhdCBsZXZlbCAwICAoYWZ0ZXIgYWxsIHBlbmRpbmcgZXZlbnRzKSBhbmQgd2FpdCB0byBoYXZlIGEgc3dhcm1JZFxuXHRcdHJldC5vYnNlcnZlKGZ1bmN0aW9uKCl7XG5cdFx0XHRiZWVzSGVhbGVyLmFzSlNPTih2YWx1ZU9iamVjdCwgcGhhc2VOYW1lLCBhcmdzLCBmdW5jdGlvbihlcnIsanNNc2cpe1xuXHRcdFx0XHRqc01zZy5tZXRhLnRhcmdldCA9IGNvbnRleHQ7XG5cdFx0XHRcdCQkLlBTS19QdWJTdWIucHVibGlzaCgkJC5DT05TVEFOVFMuU1dBUk1fRk9SX0VYRUNVVElPTiwganNNc2cpO1xuXHRcdFx0fSk7XG5cdFx0fSxudWxsLGZpbHRlckZvclNlcmlhbGlzYWJsZSk7XG5cblx0XHRyZXQubm90aWZ5KCk7XG5cblxuXHRcdHJldHVybiB0aGlzT2JqZWN0O1xuXHR9O1xuXG5cdHZhciBhc3luY1JldHVybiA9IGZ1bmN0aW9uKGVyciwgcmVzdWx0KXtcblx0XHR2YXIgY29udGV4dCA9IHZhbHVlT2JqZWN0LnByb3RlY3RlZFZhcnMuY29udGV4dDtcblxuXHRcdGlmKCFjb250ZXh0ICYmIHZhbHVlT2JqZWN0Lm1ldGEud2FpdFN0YWNrKXtcblx0XHRcdGNvbnRleHQgPSB2YWx1ZU9iamVjdC5tZXRhLndhaXRTdGFjay5wb3AoKTtcblx0XHRcdHZhbHVlT2JqZWN0LnByb3RlY3RlZFZhcnMuY29udGV4dCA9IGNvbnRleHQ7XG5cdFx0fVxuXG5cdFx0YmVlc0hlYWxlci5hc0pTT04odmFsdWVPYmplY3QsIFwiX19yZXR1cm5fX1wiLCBbZXJyLCByZXN1bHRdLCBmdW5jdGlvbihlcnIsanNNc2cpe1xuXHRcdFx0anNNc2cubWV0YS5jb21tYW5kID0gXCJhc3luY1JldHVyblwiO1xuXHRcdFx0aWYoIWNvbnRleHQpe1xuXHRcdFx0XHRjb250ZXh0ID0gdmFsdWVPYmplY3QubWV0YS5ob21lU2VjdXJpdHlDb250ZXh0Oy8vVE9ETzogQ0hFQ0sgVEhJU1xuXG5cdFx0XHR9XG5cdFx0XHRqc01zZy5tZXRhLnRhcmdldCA9IGNvbnRleHQ7XG5cblx0XHRcdGlmKCFjb250ZXh0KXtcblx0XHRcdFx0JCQuZXJyb3JIYW5kbGVyLmVycm9yKG5ldyBFcnJvcihcIkFzeW5jaHJvbm91cyByZXR1cm4gaW5zaWRlIG9mIGEgc3dhcm0gdGhhdCBkb2VzIG5vdCB3YWl0IGZvciByZXN1bHRzXCIpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQkLlBTS19QdWJTdWIucHVibGlzaCgkJC5DT05TVEFOVFMuU1dBUk1fRk9SX0VYRUNVVElPTiwganNNc2cpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9O1xuXG5cdGZ1bmN0aW9uIGhvbWUoZXJyLCByZXN1bHQpe1xuXHRcdGJlZXNIZWFsZXIuYXNKU09OKHZhbHVlT2JqZWN0LCBcImhvbWVcIiwgW2VyciwgcmVzdWx0XSwgZnVuY3Rpb24oZXJyLGpzTXNnKXtcblx0XHRcdHZhciBjb250ZXh0ID0gdmFsdWVPYmplY3QubWV0YS5ob21lQ29udGV4dDtcblx0XHRcdGpzTXNnLm1ldGEudGFyZ2V0ID0gY29udGV4dDtcblx0XHRcdCQkLlBTS19QdWJTdWIucHVibGlzaCgkJC5DT05TVEFOVFMuU1dBUk1fRk9SX0VYRUNVVElPTiwganNNc2cpO1xuXHRcdH0pO1xuXHR9XG5cblxuXG5cdGZ1bmN0aW9uIHdhaXRSZXN1bHRzKGNhbGxiYWNrLCBrZWVwQWxpdmVDaGVjaywgc3dhcm0pe1xuXHRcdGlmKCFzd2FybSl7XG5cdFx0XHRzd2FybSA9IHRoaXM7XG5cdFx0fVxuXHRcdGlmKCFrZWVwQWxpdmVDaGVjayl7XG5cdFx0XHRrZWVwQWxpdmVDaGVjayA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xuXHRcdGlmKCFpbm5lci5tZXRhLndhaXRTdGFjayl7XG5cdFx0XHRpbm5lci5tZXRhLndhaXRTdGFjayA9IFtdO1xuXHRcdFx0aW5uZXIubWV0YS53YWl0U3RhY2sucHVzaCgkJC5zZWN1cml0eUNvbnRleHQpXG5cdFx0fVxuXHRcdCQkLnN3YXJtc0luc3RhbmNlc01hbmFnZXIud2FpdEZvclN3YXJtKGNhbGxiYWNrLCBzd2FybSwga2VlcEFsaXZlQ2hlY2spO1xuXHR9XG5cblxuXHRmdW5jdGlvbiBnZXRJbm5lclZhbHVlKCl7XG5cdFx0cmV0dXJuIHZhbHVlT2JqZWN0O1xuXHR9XG5cblx0ZnVuY3Rpb24gcnVuUGhhc2UoZnVuY3ROYW1lLCBhcmdzKXtcblx0XHR2YXIgZnVuYyA9IHZhbHVlT2JqZWN0Lm15RnVuY3Rpb25zW2Z1bmN0TmFtZV07XG5cdFx0aWYoZnVuYyl7XG5cdFx0XHRmdW5jLmFwcGx5KHRoaXNPYmplY3QsIGFyZ3MpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IoZnVuY3ROYW1lLCB2YWx1ZU9iamVjdCwgXCJGdW5jdGlvbiBcIiArIGZ1bmN0TmFtZSArIFwiIGRvZXMgbm90IGV4aXN0IVwiKTtcblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIHVwZGF0ZShzZXJpYWxpc2F0aW9uKXtcblx0XHRiZWVzSGVhbGVyLmpzb25Ub05hdGl2ZShzZXJpYWxpc2F0aW9uLHZhbHVlT2JqZWN0KTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gdmFsdWVPZigpe1xuXHRcdHZhciByZXQgPSB7fTtcblx0XHRyZXQubWV0YSAgICAgICAgICAgICAgICA9IHZhbHVlT2JqZWN0Lm1ldGE7XG5cdFx0cmV0LnB1YmxpY1ZhcnMgICAgICAgICAgPSB2YWx1ZU9iamVjdC5wdWJsaWNWYXJzO1xuXHRcdHJldC5wcml2YXRlVmFycyAgICAgICAgID0gdmFsdWVPYmplY3QucHJpdmF0ZVZhcnM7XG5cdFx0cmV0LnByb3RlY3RlZFZhcnMgICAgICAgPSB2YWx1ZU9iamVjdC5wcm90ZWN0ZWRWYXJzO1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRmdW5jdGlvbiB0b1N0cmluZyAoKXtcblx0XHRyZXR1cm4gc3dhcm1EZWJ1Zy5jbGVhbkR1bXAodGhpc09iamVjdC52YWx1ZU9mKCkpO1xuXHR9XG5cblxuXHRmdW5jdGlvbiBjcmVhdGVQYXJhbGxlbChjYWxsYmFjayl7XG5cdFx0cmV0dXJuIHJlcXVpcmUoXCIuLi8uLi9wYXJhbGxlbEpvaW5Qb2ludFwiKS5jcmVhdGVKb2luUG9pbnQodGhpc09iamVjdCwgY2FsbGJhY2ssICQkLl9faW50ZXJuLm1rQXJncyhhcmd1bWVudHMsMSkpO1xuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlU2VyaWFsKGNhbGxiYWNrKXtcblx0XHRyZXR1cm4gcmVxdWlyZShcIi4uLy4uL3NlcmlhbEpvaW5Qb2ludFwiKS5jcmVhdGVTZXJpYWxKb2luUG9pbnQodGhpc09iamVjdCwgY2FsbGJhY2ssICQkLl9faW50ZXJuLm1rQXJncyhhcmd1bWVudHMsMSkpO1xuXHR9XG5cblx0ZnVuY3Rpb24gaW5zcGVjdCgpe1xuXHRcdHJldHVybiBzd2FybURlYnVnLmNsZWFuRHVtcCh0aGlzT2JqZWN0LnZhbHVlT2YoKSk7XG5cdH1cblxuXHRmdW5jdGlvbiBjb25zdHJ1Y3Rvcigpe1xuXHRcdHJldHVybiBTd2FybURlc2NyaXB0aW9uO1xuXHR9XG5cblx0ZnVuY3Rpb24gZW5zdXJlTG9jYWxJZCgpe1xuXHRcdGlmKCF2YWx1ZU9iamVjdC5sb2NhbElkKXtcblx0XHRcdHZhbHVlT2JqZWN0LmxvY2FsSWQgPSB2YWx1ZU9iamVjdC5tZXRhLnN3YXJtVHlwZU5hbWUgKyBcIi1cIiArIGxvY2FsSWQ7XG5cdFx0XHRsb2NhbElkKys7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gb2JzZXJ2ZShjYWxsYmFjaywgd2FpdEZvck1vcmUsIGZpbHRlcil7XG5cdFx0aWYoIXdhaXRGb3JNb3JlKXtcblx0XHRcdHdhaXRGb3JNb3JlID0gZnVuY3Rpb24gKCl7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRlbnN1cmVMb2NhbElkKCk7XG5cblx0XHQkJC5QU0tfUHViU3ViLnN1YnNjcmliZSh2YWx1ZU9iamVjdC5sb2NhbElkLCBjYWxsYmFjaywgd2FpdEZvck1vcmUsIGZpbHRlcik7XG5cdH1cblxuXHRmdW5jdGlvbiB0b0pTT04ocHJvcCl7XG5cdFx0Ly9wcmV2ZW50aW5nIG1heCBjYWxsIHN0YWNrIHNpemUgZXhjZWVkaW5nIG9uIHByb3h5IGF1dG8gcmVmZXJlbmNpbmdcblx0XHQvL3JlcGxhY2Uge30gYXMgcmVzdWx0IG9mIEpTT04oUHJveHkpIHdpdGggdGhlIHN0cmluZyBbT2JqZWN0IHByb3RlY3RlZCBvYmplY3RdXG5cdFx0cmV0dXJuIFwiW09iamVjdCBwcm90ZWN0ZWQgb2JqZWN0XVwiO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0SlNPTmFzeW5jKGNhbGxiYWNrKXtcblx0XHQvL21ha2UgdGhlIGV4ZWN1dGlvbiBhdCBsZXZlbCAwICAoYWZ0ZXIgYWxsIHBlbmRpbmcgZXZlbnRzKSBhbmQgd2FpdCB0byBoYXZlIGEgc3dhcm1JZFxuXHRcdHJldC5vYnNlcnZlKGZ1bmN0aW9uKCl7XG5cdFx0XHRiZWVzSGVhbGVyLmFzSlNPTih2YWx1ZU9iamVjdCwgbnVsbCwgbnVsbCxjYWxsYmFjayk7XG5cdFx0fSxudWxsLGZpbHRlckZvclNlcmlhbGlzYWJsZSk7XG5cdFx0cmV0Lm5vdGlmeSgpO1xuXHR9XG5cblx0ZnVuY3Rpb24gbm90aWZ5KGV2ZW50KXtcblx0XHRpZighZXZlbnQpe1xuXHRcdFx0ZXZlbnQgPSB2YWx1ZU9iamVjdDtcblx0XHR9XG5cdFx0ZW5zdXJlTG9jYWxJZCgpO1xuXHRcdCQkLlBTS19QdWJTdWIucHVibGlzaCh2YWx1ZU9iamVjdC5sb2NhbElkLCBldmVudCk7XG5cdH1cblxuXHRyZXQuc3dhcm0gICAgICAgICAgID0gc3dhcm1GdW5jdGlvbjtcblx0cmV0Lm5vdGlmeSAgICAgICAgICA9IG5vdGlmeTtcblx0cmV0LmdldEpTT05hc3luYyAgICA9IGdldEpTT05hc3luYztcblx0cmV0LnRvSlNPTiAgICAgICAgICA9IHRvSlNPTjtcblx0cmV0Lm9ic2VydmUgICAgICAgICA9IG9ic2VydmU7XG5cdHJldC5pbnNwZWN0ICAgICAgICAgPSBpbnNwZWN0O1xuXHRyZXQuam9pbiAgICAgICAgICAgID0gY3JlYXRlUGFyYWxsZWw7XG5cdHJldC5wYXJhbGxlbCAgICAgICAgPSBjcmVhdGVQYXJhbGxlbDtcblx0cmV0LnNlcmlhbCAgICAgICAgICA9IGNyZWF0ZVNlcmlhbDtcblx0cmV0LnZhbHVlT2YgICAgICAgICA9IHZhbHVlT2Y7XG5cdHJldC51cGRhdGUgICAgICAgICAgPSB1cGRhdGU7XG5cdHJldC5ydW5QaGFzZSAgICAgICAgPSBydW5QaGFzZTtcblx0cmV0Lm9uUmV0dXJuICAgICAgICA9IHdhaXRSZXN1bHRzO1xuXHRyZXQub25SZXN1bHQgICAgICAgID0gd2FpdFJlc3VsdHM7XG5cdHJldC5hc3luY1JldHVybiAgICAgPSBhc3luY1JldHVybjtcblx0cmV0LnJldHVybiAgICAgICAgICA9IGFzeW5jUmV0dXJuO1xuXHRyZXQuZ2V0SW5uZXJWYWx1ZSAgID0gZ2V0SW5uZXJWYWx1ZTtcblx0cmV0LmhvbWUgICAgICAgICAgICA9IGhvbWU7XG5cdHJldC50b1N0cmluZyAgICAgICAgPSB0b1N0cmluZztcblx0cmV0LmNvbnN0cnVjdG9yICAgICA9IGNvbnN0cnVjdG9yO1xuXG5cdHJldHVybiByZXQ7XG5cbn07IiwiZXhwb3J0cy5jcmVhdGVGb3JPYmplY3QgPSBmdW5jdGlvbih2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCl7XG5cdHZhciByZXQgPSByZXF1aXJlKFwiLi9iYXNlXCIpLmNyZWF0ZUZvck9iamVjdCh2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCk7XG5cblx0cmV0LnN3YXJtICAgICAgICAgICA9IG51bGw7XG5cdHJldC5vblJldHVybiAgICAgICAgPSBudWxsO1xuXHRyZXQub25SZXN1bHQgICAgICAgID0gbnVsbDtcblx0cmV0LmFzeW5jUmV0dXJuICAgICA9IG51bGw7XG5cdHJldC5yZXR1cm4gICAgICAgICAgPSBudWxsO1xuXHRyZXQuaG9tZSAgICAgICAgICAgID0gbnVsbDtcblxuXHRyZXR1cm4gcmV0O1xufTsiLCJleHBvcnRzLmNyZWF0ZUZvck9iamVjdCA9IGZ1bmN0aW9uKHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0LCBsb2NhbElkKXtcblx0cmV0dXJuIHJlcXVpcmUoXCIuL2Jhc2VcIikuY3JlYXRlRm9yT2JqZWN0KHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0LCBsb2NhbElkKTtcbn07IiwiLypcbkluaXRpYWwgTGljZW5zZTogKGMpIEF4aW9sb2dpYyBSZXNlYXJjaCAmIEFsYm9haWUgU8OubmljxIMuXG5Db250cmlidXRvcnM6IEF4aW9sb2dpYyBSZXNlYXJjaCAsIFByaXZhdGVTa3kgcHJvamVjdFxuQ29kZSBMaWNlbnNlOiBMR1BMIG9yIE1JVC5cbiovXG5cbnZhciBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcbnZhciBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5cbmZ1bmN0aW9uIHdyYXBDYWxsKG9yaWdpbmFsLCBwcmVmaXhOYW1lKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncyl7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJwcmVmaXhOYW1lXCIsIHByZWZpeE5hbWUpXG4gICAgICAgIHZhciBwcmV2aW91c1ByZWZpeCA9ICQkLmxpYnJhcnlQcmVmaXg7XG4gICAgICAgICQkLmxpYnJhcnlQcmVmaXggPSBwcmVmaXhOYW1lO1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICB2YXIgcmV0ID0gb3JpZ2luYWwuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICAkJC5saWJyYXJ5UHJlZml4ID0gcHJldmlvdXNQcmVmaXggO1xuICAgICAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgICAgICQkLmxpYnJhcnlQcmVmaXggPSBwcmV2aW91c1ByZWZpeCA7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIFN3YXJtTGlicmFyeShwcmVmaXhOYW1lLCBmb2xkZXIpe1xuICAgICQkLmxpYnJhcmllc1twcmVmaXhOYW1lXSA9IHRoaXM7IC8vIHNvIG90aGVyIGNhbGxzIGZvciBsb2FkTGlicmFyeSB3aWxsIHJldHVybiBpbnNpZGUgb2YgdGhlIGZpbGVzXG4gICAgdmFyIHByZWZpeGVkUmVxdWlyZSA9IHdyYXBDYWxsKGZ1bmN0aW9uKHBhdGgpe1xuICAgICAgICByZXR1cm4gcmVxdWlyZShwYXRoKTtcbiAgICB9LCBwcmVmaXhOYW1lKTtcblxuICAgIGZ1bmN0aW9uIGluY2x1ZGVBbGxJblJvb3QoZm9sZGVyLCBwcmVmaXhOYW1lKSB7XG4gICAgICAgIC8vdmFyIHN0YXQgPSBmcy5zdGF0U3luYyhwYXRoKTsgLy9UT0RPIC0tIGNoZWNrIGFnYWlucyBmb2xkZXJzIHdpdGggZXh0ZW5zaW9uIC5qc1xuICAgICAgICB2YXIgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhmb2xkZXIpO1xuICAgICAgICBmaWxlcy5mb3JFYWNoKGZ1bmN0aW9uKGZpbGVOYW1lKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJMb2FkaW5nIFwiLCBmaWxlTmFtZSk7XG4gICAgICAgICAgICB2YXIgZXh0ID0gZmlsZU5hbWUuc3Vic3RyKGZpbGVOYW1lLmxhc3RJbmRleE9mKCcuJykgKyAxKTtcbiAgICAgICAgICAgIGlmKGV4dC50b0xvd2VyQ2FzZSgpID09IFwianNcIil7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZ1bGxQYXRoID0gcGF0aC5yZXNvbHZlKGZvbGRlciArIFwiL1wiICsgZmlsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBwcmVmaXhlZFJlcXVpcmUoZnVsbFBhdGgpO1xuICAgICAgICAgICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gd3JhcFN3YXJtUmVsYXRlZEZ1bmN0aW9ucyhzcGFjZSwgcHJlZml4TmFtZSl7XG4gICAgICAgIHZhciByZXQgPSB7fTtcbiAgICAgICAgdmFyIG5hbWVzID0gW1wiY3JlYXRlXCIsIFwiZGVzY3JpYmVcIiwgXCJzdGFydFwiLCBcInJlc3RhcnRcIl07XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGk8bmFtZXMubGVuZ3RoOyBpKysgKXtcbiAgICAgICAgICAgIHJldFtuYW1lc1tpXV0gPSB3cmFwQ2FsbChzcGFjZVtuYW1lc1tpXV0sIHByZWZpeE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgdGhpcy5jYWxsZmxvd3MgICAgICAgID0gdGhpcy5jYWxsZmxvdyAgID0gd3JhcFN3YXJtUmVsYXRlZEZ1bmN0aW9ucygkJC5jYWxsZmxvd3MsIHByZWZpeE5hbWUpO1xuICAgIHRoaXMuc3dhcm1zICAgICAgICAgICA9IHRoaXMuc3dhcm0gICAgICA9IHdyYXBTd2FybVJlbGF0ZWRGdW5jdGlvbnMoJCQuc3dhcm1zLCBwcmVmaXhOYW1lKTtcbiAgICB0aGlzLmNvbnRyYWN0cyAgICAgICAgPSB0aGlzLmNvbnRyYWN0ICAgPSB3cmFwU3dhcm1SZWxhdGVkRnVuY3Rpb25zKCQkLmNvbnRyYWN0cywgcHJlZml4TmFtZSk7XG4gICAgaW5jbHVkZUFsbEluUm9vdChmb2xkZXIsIHByZWZpeE5hbWUpO1xufVxuXG5leHBvcnRzLmxvYWRMaWJyYXJ5ID0gZnVuY3Rpb24ocHJlZml4TmFtZSwgZm9sZGVyKXtcbiAgICB2YXIgZXhpc3RpbmcgPSAkJC5saWJyYXJpZXNbcHJlZml4TmFtZV07XG4gICAgaWYoZXhpc3RpbmcgKXtcbiAgICAgICAgaWYoZm9sZGVyKSB7XG4gICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIud2FybmluZyhcIlJldXNpbmcgYWxyZWFkeSBsb2FkZWQgbGlicmFyeSBcIiArIHByZWZpeE5hbWUgKyBcImNvdWxkIGJlIGFuIGVycm9yIVwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXhpc3Rpbmc7XG4gICAgfVxuICAgIHZhciBhYnNvbHV0ZVBhdGggPSBwYXRoLnJlc29sdmUoZm9sZGVyKTtcbiAgICByZXR1cm4gbmV3IFN3YXJtTGlicmFyeShwcmVmaXhOYW1lLCBhYnNvbHV0ZVBhdGgpO1xufSIsIlxudmFyIGpvaW5Db3VudGVyID0gMDtcblxuZnVuY3Rpb24gUGFyYWxsZWxKb2luUG9pbnQoc3dhcm0sIGNhbGxiYWNrLCBhcmdzKXtcbiAgICBqb2luQ291bnRlcisrO1xuICAgIHZhciBjaGFubmVsSWQgPSBcIlBhcmFsbGVsSm9pblBvaW50XCIgKyBqb2luQ291bnRlcjtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGNvdW50ZXIgPSAwO1xuICAgIHZhciBzdG9wT3RoZXJFeGVjdXRpb24gICAgID0gZmFsc2U7XG5cbiAgICBmdW5jdGlvbiBleGVjdXRpb25TdGVwKHN0ZXBGdW5jLCBsb2NhbEFyZ3MsIHN0b3Ape1xuXG4gICAgICAgIHRoaXMuZG9FeGVjdXRlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmKHN0b3BPdGhlckV4ZWN1dGlvbil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHN0ZXBGdW5jLmFwcGx5KHN3YXJtLCBsb2NhbEFyZ3MpO1xuICAgICAgICAgICAgICAgIGlmKHN0b3Ape1xuICAgICAgICAgICAgICAgICAgICBzdG9wT3RoZXJFeGVjdXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOyAvL2V2ZXJ5dGluZyBpcyBmaW5lXG4gICAgICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgYXJncy51bnNoaWZ0KGVycik7XG4gICAgICAgICAgICAgICAgc2VuZEZvclNvdW5kRXhlY3V0aW9uKGNhbGxiYWNrLCBhcmdzLCB0cnVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vc3RvcCBpdCwgZG8gbm90IGNhbGwgYWdhaW4gYW55dGhpbmdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKFwiaW52YWxpZCBqb2luXCIsc3dhcm0sIFwiaW52YWxpZCBmdW5jdGlvbiBhdCBqb2luIGluIHN3YXJtXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJCQuUFNLX1B1YlN1Yi5zdWJzY3JpYmUoY2hhbm5lbElkLGZ1bmN0aW9uKGZvckV4ZWN1dGlvbil7XG4gICAgICAgIGlmKHN0b3BPdGhlckV4ZWN1dGlvbil7XG4gICAgICAgICAgICByZXR1cm4gO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgaWYoZm9yRXhlY3V0aW9uLmRvRXhlY3V0ZSgpKXtcbiAgICAgICAgICAgICAgICBkZWNDb3VudGVyKCk7XG4gICAgICAgICAgICB9IC8vIGhhZCBhbiBlcnJvci4uLlxuICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAvLyQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihcIl9faW50ZXJuYWxfX1wiLHN3YXJtLCBcImV4Y2VwdGlvbiBpbiB0aGUgZXhlY3V0aW9uIG9mIHRoZSBqb2luIGZ1bmN0aW9uIG9mIGEgcGFyYWxsZWwgdGFza1wiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gaW5jQ291bnRlcigpe1xuICAgICAgICBpZih0ZXN0SWZVbmRlckluc3BlY3Rpb24oKSl7XG4gICAgICAgICAgICAvL3ByZXZlbnRpbmcgaW5zcGVjdG9yIGZyb20gaW5jcmVhc2luZyBjb3VudGVyIHdoZW4gcmVhZGluZyB0aGUgdmFsdWVzIGZvciBkZWJ1ZyByZWFzb25cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJwcmV2ZW50aW5nIGluc3BlY3Rpb25cIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY291bnRlcisrO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRlc3RJZlVuZGVySW5zcGVjdGlvbigpe1xuICAgICAgICB2YXIgcmVzID0gZmFsc2U7XG4gICAgICAgIHZhciBjb25zdEFyZ3YgPSBwcm9jZXNzLmV4ZWNBcmd2LmpvaW4oKTtcbiAgICAgICAgaWYoY29uc3RBcmd2LmluZGV4T2YoXCJpbnNwZWN0XCIpIT09LTEgfHwgY29uc3RBcmd2LmluZGV4T2YoXCJkZWJ1Z1wiKSE9PS0xKXtcbiAgICAgICAgICAgIC8vb25seSB3aGVuIHJ1bm5pbmcgaW4gZGVidWdcbiAgICAgICAgICAgIHZhciBjYWxsc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICAgICAgICAgIGlmKGNhbGxzdGFjay5pbmRleE9mKFwiRGVidWdDb21tYW5kUHJvY2Vzc29yXCIpIT09LTEpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRGVidWdDb21tYW5kUHJvY2Vzc29yIGRldGVjdGVkIVwiKTtcbiAgICAgICAgICAgICAgICByZXMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2VuZEZvclNvdW5kRXhlY3V0aW9uKGZ1bmN0LCBhcmdzLCBzdG9wKXtcbiAgICAgICAgdmFyIG9iaiA9IG5ldyBleGVjdXRpb25TdGVwKGZ1bmN0LCBhcmdzLCBzdG9wKTtcbiAgICAgICAgJCQuUFNLX1B1YlN1Yi5wdWJsaXNoKGNoYW5uZWxJZCwgb2JqKTsgLy8gZm9yY2UgZXhlY3V0aW9uIHRvIGJlIFwic291bmRcIlxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlY0NvdW50ZXIoKXtcbiAgICAgICAgY291bnRlci0tO1xuICAgICAgICBpZihjb3VudGVyID09IDApIHtcbiAgICAgICAgICAgIGFyZ3MudW5zaGlmdChudWxsKTtcbiAgICAgICAgICAgIHNlbmRGb3JTb3VuZEV4ZWN1dGlvbihjYWxsYmFjaywgYXJncywgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xuXG4gICAgZnVuY3Rpb24gZGVmYXVsdFByb2dyZXNzUmVwb3J0KGVyciwgcmVzKXtcbiAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRleHQ6XCJQYXJhbGxlbCBleGVjdXRpb24gcHJvZ3Jlc3MgZXZlbnRcIixcbiAgICAgICAgICAgIHN3YXJtOnN3YXJtLFxuICAgICAgICAgICAgYXJnczphcmdzLFxuICAgICAgICAgICAgY3VycmVudFJlc3VsdDpyZXNcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBta0Z1bmN0aW9uKG5hbWUpe1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncyl7XG4gICAgICAgICAgICB2YXIgZiA9IGRlZmF1bHRQcm9ncmVzc1JlcG9ydDtcbiAgICAgICAgICAgIGlmKG5hbWUgIT0gXCJwcm9ncmVzc1wiKXtcbiAgICAgICAgICAgICAgICBmID0gaW5uZXIubXlGdW5jdGlvbnNbbmFtZV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXJncyA9ICQkLl9faW50ZXJuLm1rQXJncyhhcmdzLCAwKTtcbiAgICAgICAgICAgIHNlbmRGb3JTb3VuZEV4ZWN1dGlvbihmLCBhcmdzLCBmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm4gX19wcm94eU9iamVjdDtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgdGhpcy5nZXQgPSBmdW5jdGlvbih0YXJnZXQsIHByb3AsIHJlY2VpdmVyKXtcbiAgICAgICAgaWYoaW5uZXIubXlGdW5jdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcCkgfHwgcHJvcCA9PSBcInByb2dyZXNzXCIpe1xuICAgICAgICAgICAgaW5jQ291bnRlcigpO1xuICAgICAgICAgICAgcmV0dXJuIG1rRnVuY3Rpb24ocHJvcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN3YXJtW3Byb3BdO1xuICAgIH07XG5cbiAgICB2YXIgX19wcm94eU9iamVjdDtcblxuICAgIHRoaXMuX19zZXRQcm94eU9iamVjdCA9IGZ1bmN0aW9uKHApe1xuICAgICAgICBfX3Byb3h5T2JqZWN0ID0gcDtcbiAgICB9XG59XG5cbmV4cG9ydHMuY3JlYXRlSm9pblBvaW50ID0gZnVuY3Rpb24oc3dhcm0sIGNhbGxiYWNrLCBhcmdzKXtcbiAgICB2YXIganAgPSBuZXcgUGFyYWxsZWxKb2luUG9pbnQoc3dhcm0sIGNhbGxiYWNrLCBhcmdzKTtcbiAgICB2YXIgaW5uZXIgPSBzd2FybS5nZXRJbm5lclZhbHVlKCk7XG4gICAgdmFyIHAgPSBuZXcgUHJveHkoaW5uZXIsIGpwKTtcbiAgICBqcC5fX3NldFByb3h5T2JqZWN0KHApO1xuICAgIHJldHVybiBwO1xufTsiLCJcbmZ1bmN0aW9uIGVuY29kZShidWZmZXIpIHtcbiAgICByZXR1cm4gYnVmZmVyLnRvU3RyaW5nKCdiYXNlNjQnKVxuICAgICAgICAucmVwbGFjZSgvXFwrL2csICcnKVxuICAgICAgICAucmVwbGFjZSgvXFwvL2csICcnKVxuICAgICAgICAucmVwbGFjZSgvPSskLywgJycpO1xufTtcblxuZnVuY3Rpb24gc3RhbXBXaXRoVGltZShidWYsIHNhbHQsIG1zYWx0KXtcbiAgICBpZighc2FsdCl7XG4gICAgICAgIHNhbHQgPSAxO1xuICAgIH1cbiAgICBpZighbXNhbHQpe1xuICAgICAgICBtc2FsdCA9IDE7XG4gICAgfVxuICAgIHZhciBkYXRlID0gbmV3IERhdGU7XG4gICAgdmFyIGN0ID0gTWF0aC5mbG9vcihkYXRlLmdldFRpbWUoKSAvIHNhbHQpO1xuICAgIHZhciBjb3VudGVyID0gMDtcbiAgICB3aGlsZShjdCA+IDAgKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkNvdW50ZXJcIiwgY291bnRlciwgY3QpO1xuICAgICAgICBidWZbY291bnRlciptc2FsdF0gPSBNYXRoLmZsb29yKGN0ICUgMjU2KTtcbiAgICAgICAgY3QgPSBNYXRoLmZsb29yKGN0IC8gMjU2KTtcbiAgICAgICAgY291bnRlcisrO1xuICAgIH1cbn1cblxuLypcbiAgICBUaGUgdWlkIGNvbnRhaW5zIGFyb3VuZCAyNTYgYml0cyBvZiByYW5kb21uZXNzIGFuZCBhcmUgdW5pcXVlIGF0IHRoZSBsZXZlbCBvZiBzZWNvbmRzLiBUaGlzIFVVSUQgc2hvdWxkIGJ5IGNyeXB0b2dyYXBoaWNhbGx5IHNhZmUgKGNhbiBub3QgYmUgZ3Vlc3NlZClcblxuICAgIFdlIGdlbmVyYXRlIGEgc2FmZSBVSUQgdGhhdCBpcyBndWFyYW50ZWVkIHVuaXF1ZSAoYnkgdXNhZ2Ugb2YgYSBQUk5HIHRvIGdlbmVhdGUgMjU2IGJpdHMpIGFuZCB0aW1lIHN0YW1waW5nIHdpdGggdGhlIG51bWJlciBvZiBzZWNvbmRzIGF0IHRoZSBtb21lbnQgd2hlbiBpcyBnZW5lcmF0ZWRcbiAgICBUaGlzIG1ldGhvZCBzaG91bGQgYmUgc2FmZSB0byB1c2UgYXQgdGhlIGxldmVsIG9mIHZlcnkgbGFyZ2UgZGlzdHJpYnV0ZWQgc3lzdGVtcy5cbiAgICBUaGUgVVVJRCBpcyBzdGFtcGVkIHdpdGggdGltZSAoc2Vjb25kcyk6IGRvZXMgaXQgb3BlbiBhIHdheSB0byBndWVzcyB0aGUgVVVJRD8gSXQgZGVwZW5kcyBob3cgc2FmZSBpcyBcImNyeXB0b1wiIFBSTkcsIGJ1dCBpdCBzaG91bGQgYmUgbm8gcHJvYmxlbS4uLlxuXG4gKi9cblxuZXhwb3J0cy5zYWZlX3V1aWQgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHJlcXVpcmUoJ2NyeXB0bycpLnJhbmRvbUJ5dGVzKDM2LCBmdW5jdGlvbiAoZXJyLCBidWYpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzdGFtcFdpdGhUaW1lKGJ1ZiwgMTAwMCwgMyk7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIGVuY29kZShidWYpKTtcbiAgICB9KTtcbn1cblxuXG4vKlxuICAgIFRyeSB0byBnZW5lcmF0ZSBhIHNtYWxsIFVJRCB0aGF0IGlzIHVuaXF1ZSBhZ2FpbnN0IGNoYW5jZSBpbiB0aGUgc2FtZSBtaWxsaXNlY29uZCBzZWNvbmQgYW5kIGluIGEgc3BlY2lmaWMgY29udGV4dCAoZWcgaW4gdGhlIHNhbWUgY2hvcmVvZ3JhcGh5IGV4ZWN1dGlvbilcbiAgICBUaGUgaWQgY29udGFpbnMgYXJvdW5kIDYqOCA9IDQ4ICBiaXRzIG9mIHJhbmRvbW5lc3MgYW5kIGFyZSB1bmlxdWUgYXQgdGhlIGxldmVsIG9mIG1pbGxpc2Vjb25kc1xuICAgIFRoaXMgbWV0aG9kIGlzIHNhZmUgb24gYSBzaW5nbGUgY29tcHV0ZXIgYnV0IHNob3VsZCBiZSB1c2VkIHdpdGggY2FyZSBvdGhlcndpc2VcbiAgICBUaGlzIFVVSUQgaXMgbm90IGNyeXB0b2dyYXBoaWNhbGx5IHNhZmUgKGNhbiBiZSBndWVzc2VkKVxuICovXG5leHBvcnRzLnNob3J0X3V1aWQgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHJlcXVpcmUoJ2NyeXB0bycpLnJhbmRvbUJ5dGVzKDEyLCBmdW5jdGlvbiAoZXJyLCBidWYpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzdGFtcFdpdGhUaW1lKGJ1ZiwxLDIpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCBlbmNvZGUoYnVmKSk7XG4gICAgfSk7XG59IiwiXG52YXIgam9pbkNvdW50ZXIgPSAwO1xuXG5mdW5jdGlvbiBTZXJpYWxKb2luUG9pbnQoc3dhcm0sIGNhbGxiYWNrLCBhcmdzKXtcblxuICAgIGpvaW5Db3VudGVyKys7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGNoYW5uZWxJZCA9IFwiU2VyaWFsSm9pblBvaW50XCIgKyBqb2luQ291bnRlcjtcblxuICAgIGlmKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKFwidW5rbm93blwiLCBzd2FybSwgXCJpbnZhbGlkIGZ1bmN0aW9uIGdpdmVuIHRvIHNlcmlhbCBpbiBzd2FybVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBpbm5lciA9IHN3YXJtLmdldElubmVyVmFsdWUoKTtcblxuXG4gICAgZnVuY3Rpb24gZGVmYXVsdFByb2dyZXNzUmVwb3J0KGVyciwgcmVzKXtcbiAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cblxuICAgIHZhciBmdW5jdGlvbkNvdW50ZXIgICAgID0gMDtcbiAgICB2YXIgZXhlY3V0aW9uQ291bnRlciAgICA9IDA7XG5cbiAgICB2YXIgcGxhbm5lZEV4ZWN1dGlvbnMgICA9IFtdO1xuICAgIHZhciBwbGFubmVkQXJndW1lbnRzICAgID0ge307XG5cbiAgICBmdW5jdGlvbiBta0Z1bmN0aW9uKG5hbWUsIHBvcyl7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJDcmVhdGluZyBmdW5jdGlvbiBcIiwgbmFtZSwgcG9zKTtcbiAgICAgICAgcGxhbm5lZEFyZ3VtZW50c1twb3NdID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGZ1bmN0aW9uIHRyaWdnZXROZXh0U3RlcCgpe1xuICAgICAgICAgICAgaWYocGxhbm5lZEV4ZWN1dGlvbnMubGVuZ3RoID09IGV4ZWN1dGlvbkNvdW50ZXIgfHwgcGxhbm5lZEFyZ3VtZW50c1tleGVjdXRpb25Db3VudGVyXSApICB7XG4gICAgICAgICAgICAgICAgJCQuUFNLX1B1YlN1Yi5wdWJsaXNoKGNoYW5uZWxJZCwgc2VsZik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZiA9IGZ1bmN0aW9uICguLi5hcmdzKXtcbiAgICAgICAgICAgIGlmKGV4ZWN1dGlvbkNvdW50ZXIgIT0gcG9zKSB7XG4gICAgICAgICAgICAgICAgcGxhbm5lZEFyZ3VtZW50c1twb3NdID0gYXJncztcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiRGVsYXlpbmcgZnVuY3Rpb246XCIsIGV4ZWN1dGlvbkNvdW50ZXIsIHBvcywgcGxhbm5lZEFyZ3VtZW50cywgYXJndW1lbnRzLCBmdW5jdGlvbkNvdW50ZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBfX3Byb3h5O1xuICAgICAgICAgICAgfSBlbHNle1xuICAgICAgICAgICAgICAgIGlmKHBsYW5uZWRBcmd1bWVudHNbcG9zXSl7XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJFeGVjdXRpbmcgIGZ1bmN0aW9uOlwiLCBleGVjdXRpb25Db3VudGVyLCBwb3MsIHBsYW5uZWRBcmd1bWVudHMsIGFyZ3VtZW50cywgZnVuY3Rpb25Db3VudGVyKTtcblx0XHRcdFx0XHRhcmdzID0gcGxhbm5lZEFyZ3VtZW50c1twb3NdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYW5uZWRBcmd1bWVudHNbcG9zXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXROZXh0U3RlcCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX19wcm94eTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBmID0gZGVmYXVsdFByb2dyZXNzUmVwb3J0O1xuICAgICAgICAgICAgaWYobmFtZSAhPSBcInByb2dyZXNzXCIpe1xuICAgICAgICAgICAgICAgIGYgPSBpbm5lci5teUZ1bmN0aW9uc1tuYW1lXTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgZi5hcHBseShzZWxmLGFyZ3MpO1xuICAgICAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgICAgICAgICBhcmdzLnVuc2hpZnQoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoc3dhcm0sYXJncyk7IC8vZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgJCQuUFNLX1B1YlN1Yi51bnN1YnNjcmliZShjaGFubmVsSWQscnVuTmV4dEZ1bmN0aW9uKTtcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vdGVybWluYXRlIGV4ZWN1dGlvbiB3aXRoIGFuIGVycm9yLi4uIVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXhlY3V0aW9uQ291bnRlcisrO1xuXG4gICAgICAgICAgICB0cmlnZ2V0TmV4dFN0ZXAoKTtcblxuICAgICAgICAgICAgcmV0dXJuIF9fcHJveHk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcGxhbm5lZEV4ZWN1dGlvbnMucHVzaChmKTtcbiAgICAgICAgZnVuY3Rpb25Db3VudGVyKys7XG4gICAgICAgIHJldHVybiBmO1xuICAgIH1cblxuICAgICB2YXIgZmluaXNoZWQgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIHJ1bk5leHRGdW5jdGlvbigpe1xuICAgICAgICBpZihleGVjdXRpb25Db3VudGVyID09IHBsYW5uZWRFeGVjdXRpb25zLmxlbmd0aCApe1xuICAgICAgICAgICAgaWYoIWZpbmlzaGVkKXtcbiAgICAgICAgICAgICAgICBhcmdzLnVuc2hpZnQobnVsbCk7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoc3dhcm0sYXJncyk7XG4gICAgICAgICAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIudW5zdWJzY3JpYmUoY2hhbm5lbElkLHJ1bk5leHRGdW5jdGlvbik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic2VyaWFsIGNvbnN0cnVjdCBpcyB1c2luZyBmdW5jdGlvbnMgdGhhdCBhcmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzLi4uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGxhbm5lZEV4ZWN1dGlvbnNbZXhlY3V0aW9uQ291bnRlcl0oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICQkLlBTS19QdWJTdWIuc3Vic2NyaWJlKGNoYW5uZWxJZCxydW5OZXh0RnVuY3Rpb24pOyAvLyBmb3JjZSBpdCB0byBiZSBcInNvdW5kXCJcblxuXG4gICAgdGhpcy5nZXQgPSBmdW5jdGlvbih0YXJnZXQsIHByb3AsIHJlY2VpdmVyKXtcbiAgICAgICAgaWYocHJvcCA9PSBcInByb2dyZXNzXCIgfHwgaW5uZXIubXlGdW5jdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcCkpe1xuICAgICAgICAgICAgcmV0dXJuIG1rRnVuY3Rpb24ocHJvcCwgZnVuY3Rpb25Db3VudGVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3dhcm1bcHJvcF07XG4gICAgfVxuXG4gICAgdmFyIF9fcHJveHk7XG4gICAgdGhpcy5zZXRQcm94eU9iamVjdCA9IGZ1bmN0aW9uKHApe1xuICAgICAgICBfX3Byb3h5ID0gcDtcbiAgICB9XG59XG5cbmV4cG9ydHMuY3JlYXRlU2VyaWFsSm9pblBvaW50ID0gZnVuY3Rpb24oc3dhcm0sIGNhbGxiYWNrLCBhcmdzKXtcbiAgICB2YXIganAgPSBuZXcgU2VyaWFsSm9pblBvaW50KHN3YXJtLCBjYWxsYmFjaywgYXJncyk7XG4gICAgdmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xuICAgIHZhciBwID0gbmV3IFByb3h5KGlubmVyLCBqcCk7XG4gICAganAuc2V0UHJveHlPYmplY3QocCk7XG4gICAgcmV0dXJuIHA7XG59IiwiZnVuY3Rpb24gU3dhcm1TcGFjZShzd2FybVR5cGUsIHV0aWxzKSB7XG5cbiAgICB2YXIgYmVlc0hlYWxlciA9ICQkLnJlcXVpcmUoXCJzb3VuZHB1YnN1YlwiKS5iZWVzSGVhbGVyO1xuXG4gICAgZnVuY3Rpb24gZ2V0RnVsbE5hbWUoc2hvcnROYW1lKXtcbiAgICAgICAgdmFyIGZ1bGxOYW1lO1xuICAgICAgICBpZihzaG9ydE5hbWUgJiYgc2hvcnROYW1lLmluY2x1ZGVzKFwiLlwiKSkge1xuICAgICAgICAgICAgZnVsbE5hbWUgPSBzaG9ydE5hbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmdWxsTmFtZSA9ICQkLmxpYnJhcnlQcmVmaXggKyBcIi5cIiArIHNob3J0TmFtZTsgLy9UT0RPOiBjaGVjayBtb3JlIGFib3V0IC4gIT9cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnVsbE5hbWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gVmFyRGVzY3JpcHRpb24oZGVzYyl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbml0OmZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXN0b3JlOmZ1bmN0aW9uKGpzb25TdHJpbmcpe1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGpzb25TdHJpbmcpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRvSnNvblN0cmluZzpmdW5jdGlvbih4KXtcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBTd2FybURlc2NyaXB0aW9uKHN3YXJtVHlwZU5hbWUsIGRlc2NyaXB0aW9uKXtcblxuICAgICAgICBzd2FybVR5cGVOYW1lID0gZ2V0RnVsbE5hbWUoc3dhcm1UeXBlTmFtZSk7XG5cbiAgICAgICAgdmFyIGxvY2FsSWQgPSAwOyAgLy8gdW5pcXVlIGZvciBlYWNoIHN3YXJtXG5cbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlVmFycyhkZXNjcil7XG4gICAgICAgICAgICB2YXIgbWVtYmVycyA9IHt9O1xuICAgICAgICAgICAgZm9yKHZhciB2IGluIGRlc2NyKXtcbiAgICAgICAgICAgICAgICBtZW1iZXJzW3ZdID0gbmV3IFZhckRlc2NyaXB0aW9uKGRlc2NyW3ZdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtZW1iZXJzO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlTWVtYmVycyhkZXNjcil7XG4gICAgICAgICAgICB2YXIgbWVtYmVycyA9IHt9O1xuICAgICAgICAgICAgZm9yKHZhciB2IGluIGRlc2NyaXB0aW9uKXtcblxuICAgICAgICAgICAgICAgIGlmKHYgIT0gXCJwdWJsaWNcIiAmJiB2ICE9IFwicHJpdmF0ZVwiKXtcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1t2XSA9IGRlc2NyaXB0aW9uW3ZdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtZW1iZXJzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHB1YmxpY1ZhcnMgPSBjcmVhdGVWYXJzKGRlc2NyaXB0aW9uLnB1YmxpYyk7XG4gICAgICAgIHZhciBwcml2YXRlVmFycyA9IGNyZWF0ZVZhcnMoZGVzY3JpcHRpb24ucHJpdmF0ZSk7XG4gICAgICAgIHZhciBteUZ1bmN0aW9ucyA9IGNyZWF0ZU1lbWJlcnMoZGVzY3JpcHRpb24pO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZVBoYXNlKHRoaXNJbnN0YW5jZSwgZnVuYyl7XG4gICAgICAgICAgICB2YXIgcGhhc2UgPSBmdW5jdGlvbiguLi5hcmdzKXtcbiAgICAgICAgICAgICAgICB2YXIgcmV0O1xuICAgICAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICAgICAgJCQuUFNLX1B1YlN1Yi5ibG9ja0NhbGxCYWNrcygpO1xuICAgICAgICAgICAgICAgICAgICByZXQgPSBmdW5jLmFwcGx5KHRoaXNJbnN0YW5jZSwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIucmVsZWFzZUNhbGxCYWNrcygpO1xuICAgICAgICAgICAgICAgIH1jYXRjaChlcnIpe1xuICAgICAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLnJlbGVhc2VDYWxsQmFja3MoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9keW5hbWljIG5hbWVkIGZ1bmMgaW4gb3JkZXIgdG8gaW1wcm92ZSBjYWxsc3RhY2tcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwaGFzZSwgXCJuYW1lXCIsIHtnZXQ6IGZ1bmN0aW9uKCl7cmV0dXJuIHN3YXJtVHlwZU5hbWUrXCIuXCIrZnVuYy5uYW1lfX0pO1xuICAgICAgICAgICAgcmV0dXJuIHBoYXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbml0aWFsaXNlID0gZnVuY3Rpb24oc2VyaWFsaXNlZFZhbHVlcyl7XG5cbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgcHVibGljVmFyczp7XG5cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHByaXZhdGVWYXJzOntcblxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcHJvdGVjdGVkVmFyczp7XG5cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG15RnVuY3Rpb25zOntcblxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdXRpbGl0eUZ1bmN0aW9uczp7XG5cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1ldGE6e1xuICAgICAgICAgICAgICAgICAgICBzd2FybVR5cGVOYW1lOnN3YXJtVHlwZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHN3YXJtRGVzY3JpcHRpb246ZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG5cbiAgICAgICAgICAgIGZvcih2YXIgdiBpbiBwdWJsaWNWYXJzKXtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVibGljVmFyc1t2XSA9IHB1YmxpY1ZhcnNbdl0uaW5pdCgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZm9yKHZhciB2IGluIHByaXZhdGVWYXJzKXtcbiAgICAgICAgICAgICAgICByZXN1bHQucHJpdmF0ZVZhcnNbdl0gPSBwcml2YXRlVmFyc1t2XS5pbml0KCk7XG4gICAgICAgICAgICB9O1xuXG5cbiAgICAgICAgICAgIGlmKHNlcmlhbGlzZWRWYWx1ZXMpe1xuICAgICAgICAgICAgICAgIGJlZXNIZWFsZXIuanNvblRvTmF0aXZlKHNlcmlhbGlzZWRWYWx1ZXMsIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbGlzZUZ1bmN0aW9ucyA9IGZ1bmN0aW9uKHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0KXtcblxuICAgICAgICAgICAgZm9yKHZhciB2IGluIG15RnVuY3Rpb25zKXtcbiAgICAgICAgICAgICAgICB2YWx1ZU9iamVjdC5teUZ1bmN0aW9uc1t2XSA9IGNyZWF0ZVBoYXNlKHRoaXNPYmplY3QsIG15RnVuY3Rpb25zW3ZdKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxvY2FsSWQrKztcbiAgICAgICAgICAgIHZhbHVlT2JqZWN0LnV0aWxpdHlGdW5jdGlvbnMgPSB1dGlscy5jcmVhdGVGb3JPYmplY3QodmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdldCA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcGVydHksIHJlY2VpdmVyKXtcblxuXG4gICAgICAgICAgICBpZihwdWJsaWNWYXJzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnB1YmxpY1ZhcnNbcHJvcGVydHldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihwcml2YXRlVmFycy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5wcml2YXRlVmFyc1twcm9wZXJ0eV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRhcmdldC51dGlsaXR5RnVuY3Rpb25zLmhhc093blByb3BlcnR5KHByb3BlcnR5KSlcbiAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQudXRpbGl0eUZ1bmN0aW9uc1twcm9wZXJ0eV07XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgaWYobXlGdW5jdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQubXlGdW5jdGlvbnNbcHJvcGVydHldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0YXJnZXQucHJvdGVjdGVkVmFycy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5wcm90ZWN0ZWRWYXJzW3Byb3BlcnR5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodHlwZW9mIHByb3BlcnR5ICE9IFwic3ltYm9sXCIpIHtcbiAgICAgICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IocHJvcGVydHksIHRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXQgPSBmdW5jdGlvbih0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIpe1xuXG4gICAgICAgICAgICBpZih0YXJnZXQudXRpbGl0eUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkgfHwgdGFyZ2V0Lm15RnVuY3Rpb25zLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xuICAgICAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihwcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVHJ5aW5nIHRvIG92ZXJ3cml0ZSBpbW11dGFibGUgbWVtYmVyXCIgKyBwcm9wZXJ0eSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHByaXZhdGVWYXJzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQucHJpdmF0ZVZhcnNbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgIGlmKHB1YmxpY1ZhcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRhcmdldC5wdWJsaWNWYXJzW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQucHJvdGVjdGVkVmFyc1twcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hcHBseSA9IGZ1bmN0aW9uKHRhcmdldCwgdGhpc0FyZywgYXJndW1lbnRzTGlzdCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlByb3h5IGFwcGx5XCIpO1xuICAgICAgICAgICAgLy92YXIgZnVuYyA9IHRhcmdldFtdXG4gICAgICAgICAgICAvL3N3YXJtR2xvYmFscy5leGVjdXRpb25Qcm92aWRlci5leGVjdXRlKG51bGwsIHRoaXNBcmcsIGZ1bmMsIGFyZ3VtZW50c0xpc3QpXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5pc0V4dGVuc2libGUgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmhhcyA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCkge1xuICAgICAgICAgICAgaWYodGFyZ2V0LnB1YmxpY1ZhcnNbcHJvcF0gfHwgdGFyZ2V0LnByb3RlY3RlZFZhcnNbcHJvcF0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm93bktleXMgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0Lm93bktleXModGFyZ2V0LnB1YmxpY1ZhcnMpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihzZXJpYWxpc2VkVmFsdWVzKXtcbiAgICAgICAgICAgIHZhciB2YWx1ZU9iamVjdCA9IHNlbGYuaW5pdGlhbGlzZShzZXJpYWxpc2VkVmFsdWVzKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBuZXcgUHJveHkodmFsdWVPYmplY3Qsc2VsZik7XG4gICAgICAgICAgICBzZWxmLmluaXRpYWxpc2VGdW5jdGlvbnModmFsdWVPYmplY3QscmVzdWx0KTtcbiAgICAgICAgICAgIGlmKCFzZXJpYWxpc2VkVmFsdWVzKXtcbiAgICAgICAgICAgICAgICAkJC51aWRHZW5lcmF0b3Iuc2FmZV91dWlkKGZ1bmN0aW9uIChlcnIsIHJlc3VsdCl7XG4gICAgICAgICAgICAgICAgICAgIGlmKCF2YWx1ZU9iamVjdC5tZXRhLnN3YXJtSWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVPYmplY3QubWV0YS5zd2FybUlkID0gcmVzdWx0OyAgLy9kbyBub3Qgb3ZlcndyaXRlISEhXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWVPYmplY3QudXRpbGl0eUZ1bmN0aW9ucy5ub3RpZnkoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZGVzY3JpcHRpb25zID0ge307XG5cbiAgICB0aGlzLmRlc2NyaWJlID0gZnVuY3Rpb24gZGVzY3JpYmVTd2FybShzd2FybVR5cGVOYW1lLCBkZXNjcmlwdGlvbil7XG4gICAgICAgIHN3YXJtVHlwZU5hbWUgPSBnZXRGdWxsTmFtZShzd2FybVR5cGVOYW1lKTtcblxuICAgICAgICB2YXIgcG9pbnRQb3MgPSBzd2FybVR5cGVOYW1lLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgICAgIHZhciBzaG9ydE5hbWUgPSBzd2FybVR5cGVOYW1lLnN1YnN0ciggcG9pbnRQb3MrIDEpO1xuICAgICAgICB2YXIgbGlicmFyeU5hbWUgPSBzd2FybVR5cGVOYW1lLnN1YnN0cigwLCBwb2ludFBvcyk7XG4gICAgICAgIGlmKCFsaWJyYXJ5TmFtZSl7XG4gICAgICAgICAgICBsaWJyYXJ5TmFtZSA9IFwiZ2xvYmFsXCI7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGVzY3JpcHRpb24gPSBuZXcgU3dhcm1EZXNjcmlwdGlvbihzd2FybVR5cGVOYW1lLCBkZXNjcmlwdGlvbik7XG4gICAgICAgIGlmKGRlc2NyaXB0aW9uc1tzd2FybVR5cGVOYW1lXSAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLndhcm5pbmcoXCJEdXBsaWNhdGUgc3dhcm0gZGVzY3JpcHRpb24gXCIrIHN3YXJtVHlwZU5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVzY3JpcHRpb25zW3N3YXJtVHlwZU5hbWVdID0gZGVzY3JpcHRpb247XG5cbiAgICAgICAgaWYoJCQucmVnaXN0ZXJTd2FybURlc2NyaXB0aW9uKXtcblx0XHRcdCQkLnJlZ2lzdGVyU3dhcm1EZXNjcmlwdGlvbihsaWJyYXJ5TmFtZSwgc2hvcnROYW1lLCBzd2FybVR5cGVOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzY3JpcHRpb247XG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGVTd2FybShzd2FybVR5cGVOYW1lLCBkZXNjcmlwdGlvbiwgaW5pdGlhbFZhbHVlcyl7XG4gICAgICAgIHN3YXJtVHlwZU5hbWUgPSBnZXRGdWxsTmFtZShzd2FybVR5cGVOYW1lKTtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgaWYodW5kZWZpbmVkID09IGRlc2NyaXB0aW9uKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zW3N3YXJtVHlwZU5hbWVdKGluaXRpYWxWYWx1ZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZXNjcmliZShzd2FybVR5cGVOYW1lLCBkZXNjcmlwdGlvbikoaW5pdGlhbFZhbHVlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ3JlYXRlU3dhcm0gZXJyb3JcIiwgZXJyKTtcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci5lcnJvcihlcnIsIGFyZ3VtZW50cywgXCJXcm9uZyBuYW1lIG9yIGRlc2NyaXB0aW9uc1wiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucmVzdGFydCA9IGZ1bmN0aW9uKHN3YXJtVHlwZU5hbWUsIGluaXRpYWxWYWx1ZXMpe1xuICAgICAgICBzd2FybVR5cGVOYW1lID0gZ2V0RnVsbE5hbWUoc3dhcm1UeXBlTmFtZSk7XG4gICAgICAgIHZhciBkZXNjID0gZGVzY3JpcHRpb25zW3N3YXJtVHlwZU5hbWVdO1xuXG4gICAgICAgIGlmKGRlc2Mpe1xuICAgICAgICAgICAgcmV0dXJuIGRlc2MoaW5pdGlhbFZhbHVlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3Ioc3dhcm1UeXBlTmFtZSxpbml0aWFsVmFsdWVzLFxuICAgICAgICAgICAgICAgIFwiRmFpbGVkIHRvIHJlc3RhcnQgYSBzd2FybSB3aXRoIHR5cGUgXCIgKyBzd2FybVR5cGVOYW1lICsgXCJcXG4gTWF5YmUgZGlmZnJlbnQgc3dhcm0gc3BhY2UgKHVzZWQgZmxvdyBpbnN0ZWFkIG9mIHN3YXJtIT8pXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKHN3YXJtVHlwZU5hbWUsIC4uLnBhcmFtcyl7XG4gICAgICAgIHN3YXJtVHlwZU5hbWUgPSBnZXRGdWxsTmFtZShzd2FybVR5cGVOYW1lKTtcbiAgICAgICAgdmFyIGRlc2MgPSBkZXNjcmlwdGlvbnNbc3dhcm1UeXBlTmFtZV07XG4gICAgICAgIGlmKCFkZXNjKXtcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihudWxsLCBzd2FybVR5cGVOYW1lKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXMgPSBkZXNjKCk7XG5cbiAgICAgICAgaWYocGFyYW1zLmxlbmd0aCA+IDEpe1xuICAgICAgICAgICAgdmFyIGFyZ3MgPVtdO1xuICAgICAgICAgICAgZm9yKHZhciBpID0gMDtpIDwgcGFyYW1zLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2gocGFyYW1zW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcy5zd2FybS5hcHBseShyZXMsIGFyZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG59XG5cbmV4cG9ydHMuY3JlYXRlU3dhcm1FbmdpbmUgPSBmdW5jdGlvbihzd2FybVR5cGUsIHV0aWxzKXtcbiAgICBpZih0eXBlb2YgdXRpbHMgPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgIHV0aWxzID0gcmVxdWlyZShcIi4vY2hvcmVvZ3JhcGhpZXMvdXRpbGl0eUZ1bmN0aW9ucy9jYWxsZmxvd1wiKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTd2FybVNwYWNlKHN3YXJtVHlwZSwgdXRpbHMpO1xufTsiLCJpZih0eXBlb2Ygc2luZ2xldG9uX2NvbnRhaW5lcl9tb2R1bGVfd29ya2Fyb3VuZF9mb3Jfd2lyZWRfbm9kZV9qc19jYWNoaW5nID09ICd1bmRlZmluZWQnKSB7XG4gICAgc2luZ2xldG9uX2NvbnRhaW5lcl9tb2R1bGVfd29ya2Fyb3VuZF9mb3Jfd2lyZWRfbm9kZV9qc19jYWNoaW5nICAgPSBtb2R1bGU7XG59IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gc2luZ2xldG9uX2NvbnRhaW5lcl9tb2R1bGVfd29ya2Fyb3VuZF9mb3Jfd2lyZWRfbm9kZV9qc19jYWNoaW5nIC5leHBvcnRzO1xuICAgIHJldHVybiBtb2R1bGU7XG59XG5cbi8qKlxuICogQ3JlYXRlZCBieSBzYWxib2FpZSBvbiA0LzI3LzE1LlxuICovXG5mdW5jdGlvbiBDb250YWluZXIoZXJyb3JIYW5kbGVyKXtcbiAgICB2YXIgdGhpbmdzID0ge307ICAgICAgICAvL3RoZSBhY3R1YWwgdmFsdWVzIGZvciBvdXIgc2VydmljZXMsIHRoaW5nc1xuICAgIHZhciBpbW1lZGlhdGUgPSB7fTsgICAgIC8vaG93IGRlcGVuZGVuY2llcyB3ZXJlIGRlY2xhcmVkXG4gICAgdmFyIGNhbGxiYWNrcyA9IHt9OyAgICAgLy9jYWxsYmFjayB0aGF0IHNob3VsZCBiZSBjYWxsZWQgZm9yIGVhY2ggZGVwZW5kZW5jeSBkZWNsYXJhdGlvblxuICAgIHZhciBkZXBzQ291bnRlciA9IHt9OyAgIC8vY291bnQgZGVwZW5kZW5jaWVzXG4gICAgdmFyIHJldmVyc2VkVHJlZSA9IHt9OyAgLy9yZXZlcnNlZCBkZXBlbmRlbmNpZXMsIG9wcG9zaXRlIG9mIGltbWVkaWF0ZSBvYmplY3RcblxuICAgICB0aGlzLmR1bXAgPSBmdW5jdGlvbigpe1xuICAgICAgICAgY29uc29sZS5sb2coXCJDb25hdGluZXIgZHVtcFxcbiBUaGluZ3M6XCIsIHRoaW5ncywgXCJcXG5EZXBzIGNvdW50ZXI6IFwiLCBkZXBzQ291bnRlciwgXCJcXG5TdHJpZ2h0OlwiLCBpbW1lZGlhdGUsIFwiXFxuUmV2ZXJzZWQ6XCIsIHJldmVyc2VkVHJlZSk7XG4gICAgIH1cblxuICAgIGZ1bmN0aW9uIGluY0NvdW50ZXIobmFtZSl7XG4gICAgICAgIGlmKCFkZXBzQ291bnRlcltuYW1lXSl7XG4gICAgICAgICAgICBkZXBzQ291bnRlcltuYW1lXSA9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZXBzQ291bnRlcltuYW1lXSsrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zZXJ0RGVwZW5kZW5jeWluUlQobm9kZU5hbWUsIGRlcGVuZGVuY2llcyl7XG4gICAgICAgIGRlcGVuZGVuY2llcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW1OYW1lKXtcbiAgICAgICAgICAgIHZhciBsID0gcmV2ZXJzZWRUcmVlW2l0ZW1OYW1lXTtcbiAgICAgICAgICAgIGlmKCFsKXtcbiAgICAgICAgICAgICAgICBsID0gcmV2ZXJzZWRUcmVlW2l0ZW1OYW1lXSA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbFtub2RlTmFtZV0gPSBub2RlTmFtZTtcbiAgICAgICAgfSlcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIGRpc2NvdmVyVXBOb2Rlcyhub2RlTmFtZSl7XG4gICAgICAgIHZhciByZXMgPSB7fTtcblxuICAgICAgICBmdW5jdGlvbiBERlMobm4pe1xuICAgICAgICAgICAgdmFyIGwgPSByZXZlcnNlZFRyZWVbbm5dO1xuICAgICAgICAgICAgZm9yKHZhciBpIGluIGwpe1xuICAgICAgICAgICAgICAgIGlmKCFyZXNbaV0pe1xuICAgICAgICAgICAgICAgICAgICByZXNbaV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBERlMoaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgREZTKG5vZGVOYW1lKTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHJlcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXRDb3VudGVyKG5hbWUpe1xuICAgICAgICB2YXIgZGVwZW5kZW5jeUFycmF5ID0gaW1tZWRpYXRlW25hbWVdO1xuICAgICAgICB2YXIgY291bnRlciA9IDA7XG4gICAgICAgIGlmKGRlcGVuZGVuY3lBcnJheSl7XG4gICAgICAgICAgICBkZXBlbmRlbmN5QXJyYXkuZm9yRWFjaChmdW5jdGlvbihkZXApe1xuICAgICAgICAgICAgICAgIGlmKHRoaW5nc1tkZXBdID09IG51bGwpe1xuICAgICAgICAgICAgICAgICAgICBpbmNDb3VudGVyKG5hbWUpXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXIrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIGRlcHNDb3VudGVyW25hbWVdID0gY291bnRlcjtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkNvdW50ZXIgZm9yIFwiLCBuYW1lLCAnIGlzICcsIGNvdW50ZXIpO1xuICAgICAgICByZXR1cm4gY291bnRlcjtcbiAgICB9XG5cbiAgICAvKiByZXR1cm5zIHRob3NlIHRoYXQgYXJlIHJlYWR5IHRvIGJlIHJlc29sdmVkKi9cbiAgICBmdW5jdGlvbiByZXNldFVwQ291bnRlcnMobmFtZSl7XG4gICAgICAgIHZhciByZXQgPSBbXTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnUmVzZXRpbmcgdXAgY291bnRlcnMgZm9yICcsIG5hbWUsIFwiUmV2ZXJzZTpcIiwgcmV2ZXJzZWRUcmVlW25hbWVdKTtcbiAgICAgICAgdmFyIHVwcyA9IHJldmVyc2VkVHJlZVtuYW1lXTtcbiAgICAgICAgZm9yKHZhciB2IGluIHVwcyl7XG4gICAgICAgICAgICBpZihyZXNldENvdW50ZXIodikgPT0gMCl7XG4gICAgICAgICAgICAgICAgcmV0LnB1c2godik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICAvKlxuICAgICAgICAgVGhlIGZpcnN0IGFyZ3VtZW50IGlzIGEgbmFtZSBmb3IgYSBzZXJ2aWNlLCB2YXJpYWJsZSxhICB0aGluZyB0aGF0IHNob3VsZCBiZSBpbml0aWFsaXNlZCwgcmVjcmVhdGVkLCBldGNcbiAgICAgICAgIFRoZSBzZWNvbmQgYXJndW1lbnQgaXMgYW4gYXJyYXkgd2l0aCBkZXBlbmRlbmNpZXNcbiAgICAgICAgIHRoZSBsYXN0IGFyZ3VtZW50IGlzIGEgZnVuY3Rpb24oZXJyLC4uLikgdGhhdCBpcyBjYWxsZWQgd2hlbiBkZXBlbmRlbmNpZXMgYXJlIHJlYWR5IG9yIHJlY2FsbGVkIHdoZW4gYXJlIG5vdCByZWFkeSAoc3RvcCB3YXMgY2FsbGVkKVxuICAgICAgICAgSWYgZXJyIGlzIG5vdCB1bmRlZmluZWQgaXQgbWVhbnMgdGhhdCBvbmUgb3IgYW55IHVuZGVmaW5lZCB2YXJpYWJsZXMgYXJlIG5vdCByZWFkeSBhbmQgdGhlIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIGFnYWluIGxhdGVyXG4gICAgICAgICBBbGwgdGhlIG90aGVyIGFyZ3VtZW50cyBhcmUgdGhlIGNvcnJlc3BvbmRpbmcgYXJndW1lbnRzIG9mIHRoZSBjYWxsYmFjayB3aWxsIGJlIHRoZSBhY3R1YWwgdmFsdWVzIG9mIHRoZSBjb3JyZXNwb25kaW5nIGRlcGVuZGVuY3lcbiAgICAgICAgIFRoZSBjYWxsYmFjayBmdW5jdGlvbnMgc2hvdWxkIHJldHVybiB0aGUgY3VycmVudCB2YWx1ZSAob3IgbnVsbClcbiAgICAgKi9cbiAgICB0aGlzLmRlY2xhcmVEZXBlbmRlbmN5ID0gZnVuY3Rpb24obmFtZSwgZGVwZW5kZW5jeUFycmF5LCBjYWxsYmFjayl7XG4gICAgICAgIGlmKGNhbGxiYWNrc1tuYW1lXSl7XG4gICAgICAgICAgICBlcnJvckhhbmRsZXIuaWdub3JlUG9zc2libGVFcnJvcihcIkR1cGxpY2F0ZSBkZXBlbmRlbmN5OlwiICsgbmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFja3NbbmFtZV0gPSBjYWxsYmFjaztcbiAgICAgICAgICAgIGltbWVkaWF0ZVtuYW1lXSAgID0gZGVwZW5kZW5jeUFycmF5O1xuICAgICAgICAgICAgaW5zZXJ0RGVwZW5kZW5jeWluUlQobmFtZSwgZGVwZW5kZW5jeUFycmF5KTtcbiAgICAgICAgICAgIHRoaW5nc1tuYW1lXSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdW5zYXRpc2ZpZWRDb3VudGVyID0gcmVzZXRDb3VudGVyKG5hbWUpO1xuICAgICAgICBpZih1bnNhdGlzZmllZENvdW50ZXIgPT0gMCApe1xuICAgICAgICAgICAgY2FsbEZvclRoaW5nKG5hbWUsIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxGb3JUaGluZyhuYW1lLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLypcbiAgICAgICAgY3JlYXRlIGEgc2VydmljZVxuICAgICAqL1xuICAgIHRoaXMuc2VydmljZSA9IGZ1bmN0aW9uKG5hbWUsIGRlcGVuZGVuY3lBcnJheSwgY29uc3RydWN0b3Ipe1xuICAgICAgICB0aGlzLmRlY2xhcmVEZXBlbmRlbmN5KG5hbWUsIGRlcGVuZGVuY3lBcnJheSwgY29uc3RydWN0b3IpO1xuICAgIH1cblxuXG4gICAgdmFyIHN1YnN5c3RlbUNvdW50ZXIgPSAwO1xuICAgIC8qXG4gICAgIGNyZWF0ZSBhIGFub255bW91cyBzdWJzeXN0ZW1cbiAgICAgKi9cbiAgICB0aGlzLnN1YnN5c3RlbSA9IGZ1bmN0aW9uKGRlcGVuZGVuY3lBcnJheSwgY29uc3RydWN0b3Ipe1xuICAgICAgICBzdWJzeXN0ZW1Db3VudGVyKys7XG4gICAgICAgIHRoaXMuZGVjbGFyZURlcGVuZGVuY3koXCJkaWNvbnRhaW5lcl9zdWJzeXN0ZW1fcGxhY2Vob2xkZXJcIiArIHN1YnN5c3RlbUNvdW50ZXIsIGRlcGVuZGVuY3lBcnJheSwgY29uc3RydWN0b3IpO1xuICAgIH1cblxuICAgIC8qIG5vdCBkb2N1bWVudGVkLi4gbGltYm8gc3RhdGUqL1xuICAgIHRoaXMuZmFjdG9yeSA9IGZ1bmN0aW9uKG5hbWUsIGRlcGVuZGVuY3lBcnJheSwgY29uc3RydWN0b3Ipe1xuICAgICAgICB0aGlzLmRlY2xhcmVEZXBlbmRlbmN5KG5hbWUsIGRlcGVuZGVuY3lBcnJheSwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiBuZXcgY29uc3RydWN0b3IoKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxsRm9yVGhpbmcobmFtZSwgb3V0T2ZTZXJ2aWNlKXtcbiAgICAgICAgdmFyIGFyZ3MgPSBpbW1lZGlhdGVbbmFtZV0ubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgICAgcmV0dXJuIHRoaW5nc1tpdGVtXTtcbiAgICAgICAgfSk7XG4gICAgICAgIGFyZ3MudW5zaGlmdChvdXRPZlNlcnZpY2UpO1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBjYWxsYmFja3NbbmFtZV0uYXBwbHkoe30sYXJncyk7XG4gICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgIGVycm9ySGFuZGxlci50aHJvd0Vycm9yKGVycik7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmKG91dE9mU2VydmljZSB8fCB2YWx1ZT09PW51bGwpeyAgIC8vZW5hYmxlIHJldHVybmluZyBhIHRlbXBvcmFyeSBkZXBlbmRlbmN5IHJlc29sdXRpb24hXG4gICAgICAgICAgICBpZih0aGluZ3NbbmFtZV0pe1xuICAgICAgICAgICAgICAgIHRoaW5nc1tuYW1lXSA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmVzZXRVcENvdW50ZXJzKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIlN1Y2Nlc3MgcmVzb2x2aW5nIFwiLCBuYW1lLCBcIjpcIiwgdmFsdWUsIFwiT3RoZXIgcmVhZHk6XCIsIG90aGVyUmVhZHkpO1xuICAgICAgICAgICAgaWYoIXZhbHVlKXtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9ICB7XCJwbGFjZWhvbGRlclwiOiBuYW1lfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaW5nc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgdmFyIG90aGVyUmVhZHkgPSByZXNldFVwQ291bnRlcnMobmFtZSk7XG4gICAgICAgICAgICBvdGhlclJlYWR5LmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICAgICAgY2FsbEZvclRoaW5nKGl0ZW0sIGZhbHNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICAgICAgRGVjbGFyZSB0aGF0IGEgbmFtZSBpcyByZWFkeSwgcmVzb2x2ZWQgYW5kIHNob3VsZCB0cnkgdG8gcmVzb2x2ZSBhbGwgb3RoZXIgd2FpdGluZyBmb3IgaXRcbiAgICAgKi9cbiAgICB0aGlzLnJlc29sdmUgICAgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSl7XG4gICAgICAgIHRoaW5nc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICB2YXIgb3RoZXJSZWFkeSA9IHJlc2V0VXBDb3VudGVycyhuYW1lKTtcblxuICAgICAgICBvdGhlclJlYWR5LmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICBjYWxsRm9yVGhpbmcoaXRlbSwgZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG5cblxuICAgIHRoaXMuaW5zdGFuY2VGYWN0b3J5ID0gZnVuY3Rpb24obmFtZSwgZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcil7XG4gICAgICAgIGVycm9ySGFuZGxlci5ub3RJbXBsZW1lbnRlZChcImluc3RhbmNlRmFjdG9yeSBpcyBwbGFubmVkIGJ1dCBub3QgaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgLypcbiAgICAgICAgRGVjbGFyZSB0aGF0IGEgc2VydmljZSBvciBmZWF0dXJlIGlzIG5vdCB3b3JraW5nIHByb3Blcmx5LiBBbGwgc2VydmljZXMgZGVwZW5kaW5nIG9uIHRoaXMgd2lsbCBnZXQgbm90aWZpZWRcbiAgICAgKi9cbiAgICB0aGlzLm91dE9mU2VydmljZSAgICA9IGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgICB0aGluZ3NbbmFtZV0gPSBudWxsO1xuICAgICAgICB2YXIgdXBOb2RlcyA9IGRpc2NvdmVyVXBOb2RlcyhuYW1lKTtcbiAgICAgICAgdXBOb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5vZGUpe1xuICAgICAgICAgICAgdGhpbmdzW25hbWVdID0gbnVsbDtcbiAgICAgICAgICAgIGNhbGxGb3JUaGluZyhub2RlLCB0cnVlKTtcbiAgICAgICAgfSlcbiAgICB9XG59XG5cblxuZXhwb3J0cy5uZXdDb250YWluZXIgICAgPSBmdW5jdGlvbihjaGVja3NMaWJyYXJ5KXtcbiAgICByZXR1cm4gbmV3IENvbnRhaW5lcihjaGVja3NMaWJyYXJ5KTtcbn1cblxuLy9leHBvcnRzLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoJCQuZXJyb3JIYW5kbGVyKTtcbiIsIlxuLyoqXG4gKiBHZW5lcmljIGZ1bmN0aW9uIHVzZWQgdG8gcmVnaXN0ZXJzIG1ldGhvZHMgc3VjaCBhcyBhc3NlcnRzLCBsb2dnaW5nLCBldGMuIG9uIHRoZSBjdXJyZW50IGNvbnRleHQuXG4gKiBAcGFyYW0gbmFtZSB7U3RyaW5nKX0gLSBuYW1lIG9mIHRoZSBtZXRob2QgKHVzZSBjYXNlKSB0byBiZSByZWdpc3RlcmVkLlxuICogQHBhcmFtIGZ1bmMge0Z1bmN0aW9ufSAtIGhhbmRsZXIgdG8gYmUgaW52b2tlZC5cbiAqIEBwYXJhbSBwYXJhbXNEZXNjcmlwdGlvbiB7T2JqZWN0fSAtIHBhcmFtZXRlcnMgZGVzY3JpcHRpb25zXG4gKiBAcGFyYW0gYWZ0ZXIge0Z1bmN0aW9ufSAtIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhZnRlciB0aGUgZnVuY3Rpb24gaGFzIGJlZW4gZXhlY3V0ZWQuXG4gKi9cbmZ1bmN0aW9uIGFkZFVzZUNhc2UobmFtZSwgZnVuYywgcGFyYW1zRGVzY3JpcHRpb24sIGFmdGVyKXtcbiAgICB2YXIgbmV3RnVuYyA9IGZ1bmM7XG4gICAgaWYodHlwZW9mIGFmdGVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgbmV3RnVuYyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsZXQgYXJncyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICBhZnRlcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gc29tZSBwcm9wZXJ0aWVzIHNob3VsZCBub3QgYmUgb3ZlcnJpZGRlblxuICAgIGNvbnN0IHByb3RlY3RlZFByb3BlcnRpZXMgPSBbJ2FkZENoZWNrJywgJ2FkZENhc2UnLCAncmVnaXN0ZXInXTtcbiAgICBpZihwcm90ZWN0ZWRQcm9wZXJ0aWVzLmluZGV4T2YobmFtZSkgPT09IC0xKXtcbiAgICAgICAgdGhpc1tuYW1lXSA9IG5ld0Z1bmM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW50IG92ZXJ3cml0ZSAnICsgbmFtZSk7XG4gICAgfVxuXG4gICAgaWYocGFyYW1zRGVzY3JpcHRpb24pe1xuICAgICAgICB0aGlzLnBhcmFtc1tuYW1lXSA9IHBhcmFtc0Rlc2NyaXB0aW9uO1xuICAgIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFsaWFzIHRvIGFuIGV4aXN0aW5nIGZ1bmN0aW9uLlxuICogQHBhcmFtIG5hbWUxIHtTdHJpbmd9IC0gTmV3IGZ1bmN0aW9uIG5hbWUuXG4gKiBAcGFyYW0gbmFtZTIge1N0cmluZ30gLSBFeGlzdGluZyBmdW5jdGlvbiBuYW1lLlxuICovXG5mdW5jdGlvbiBhbGlhcyhuYW1lMSwgbmFtZTIpe1xuICAgIHRoaXNbbmFtZTFdID0gdGhpc1tuYW1lMl07XG59XG5cbi8qKlxuICogU2luZ2xldG9uIGZvciBhZGRpbmcgdmFyaW91cyBmdW5jdGlvbnMgZm9yIHVzZSBjYXNlcyByZWdhcmRpbmcgbG9nZ2luZy5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBMb2dzQ29yZSgpe1xuICAgIHRoaXMucGFyYW1zID0ge307XG59XG5cbi8qKlxuICogU2luZ2xldG9uIGZvciBhZGRpbmcgeW91ciB2YXJpb3VzIGZ1bmN0aW9ucyBmb3IgYXNzZXJ0cy5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBBc3NlcnRDb3JlKCl7XG4gICAgdGhpcy5wYXJhbXMgPSB7fTtcbn1cblxuLyoqXG4gKiBTaW5nbGV0b24gZm9yIGFkZGluZyB5b3VyIHZhcmlvdXMgZnVuY3Rpb25zIGZvciBjaGVja3MuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gQ2hlY2tDb3JlKCl7XG4gICAgdGhpcy5wYXJhbXMgPSB7fTtcbn1cblxuLyoqXG4gKiBTaW5nbGV0b24gZm9yIGFkZGluZyB5b3VyIHZhcmlvdXMgZnVuY3Rpb25zIGZvciBnZW5lcmF0aW5nIGV4Y2VwdGlvbnMuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRXhjZXB0aW9uc0NvcmUoKXtcbiAgICB0aGlzLnBhcmFtcyA9IHt9O1xufVxuXG4vKipcbiAqIFNpbmdsZXRvbiBmb3IgYWRkaW5nIHlvdXIgdmFyaW91cyBmdW5jdGlvbnMgZm9yIHJ1bm5pbmcgdGVzdHMuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gVGVzdFJ1bm5lckNvcmUoKXtcbn1cblxuTG9nc0NvcmUucHJvdG90eXBlLmFkZENhc2UgICAgICAgICAgID0gYWRkVXNlQ2FzZTtcbkFzc2VydENvcmUucHJvdG90eXBlLmFkZENoZWNrICAgICAgICA9IGFkZFVzZUNhc2U7XG5DaGVja0NvcmUucHJvdG90eXBlLmFkZENoZWNrICAgICAgICAgPSBhZGRVc2VDYXNlO1xuRXhjZXB0aW9uc0NvcmUucHJvdG90eXBlLnJlZ2lzdGVyICAgID0gYWRkVXNlQ2FzZTtcblxuTG9nc0NvcmUucHJvdG90eXBlLmFsaWFzICAgICAgICAgICAgID0gYWxpYXM7XG5Bc3NlcnRDb3JlLnByb3RvdHlwZS5hbGlhcyAgICAgICAgICAgPSBhbGlhcztcbkNoZWNrQ29yZS5wcm90b3R5cGUuYWxpYXMgICAgICAgICAgICA9IGFsaWFzO1xuRXhjZXB0aW9uc0NvcmUucHJvdG90eXBlLmFsaWFzICAgICAgID0gYWxpYXM7XG5cbi8vIENyZWF0ZSBtb2R1bGVzXG52YXIgYXNzZXJ0T2JqICAgICAgID0gbmV3IEFzc2VydENvcmUoKTtcbnZhciBjaGVja09iaiAgICAgICAgPSBuZXcgQ2hlY2tDb3JlKCk7XG52YXIgZXhjZXB0aW9uc09iaiAgID0gbmV3IEV4Y2VwdGlvbnNDb3JlKCk7XG52YXIgbG9nZ2VyT2JqICAgICAgID0gbmV3IExvZ3NDb3JlKCk7XG52YXIgdGVzdFJ1bm5lck9iaiAgID0gbmV3IFRlc3RSdW5uZXJDb3JlKCk7XG5cbi8vIEV4cG9ydCBtb2R1bGVzXG5leHBvcnRzLmFzc2VydCAgICAgID0gYXNzZXJ0T2JqO1xuZXhwb3J0cy5jaGVjayAgICAgICA9IGNoZWNrT2JqO1xuZXhwb3J0cy5leGNlcHRpb25zICA9IGNoZWNrT2JqO1xuZXhwb3J0cy5leGNlcHRpb25zICA9IGV4Y2VwdGlvbnNPYmo7XG5leHBvcnRzLmxvZ2dlciAgICAgID0gbG9nZ2VyT2JqO1xuZXhwb3J0cy50ZXN0UnVubmVyICA9IHRlc3RSdW5uZXJPYmo7XG5cbi8vIEluaXRpYWxpc2UgbW9kdWxlc1xucmVxdWlyZShcIi4vc3RhbmRhcmRBc3NlcnRzLmpzXCIpLmluaXQoZXhwb3J0cyk7XG5yZXF1aXJlKFwiLi9zdGFuZGFyZExvZ3MuanNcIikuaW5pdChleHBvcnRzKTtcbnJlcXVpcmUoXCIuL3N0YW5kYXJkRXhjZXB0aW9ucy5qc1wiKS5pbml0KGV4cG9ydHMpO1xucmVxdWlyZShcIi4vc3RhbmRhcmRDaGVja3MuanNcIikuaW5pdChleHBvcnRzKTtcbnJlcXVpcmUoXCIuL3Rlc3RSdW5uZXIuanNcIikuaW5pdChleHBvcnRzKTtcblxuLy8gR2xvYmFsIFVuY2F1Z2h0IEV4Y2VwdGlvbiBoYW5kbGVyLlxuaWYocHJvY2Vzcy5vbilcbntcbiAgICBwcm9jZXNzLm9uKCd1bmNhdWdodEV4Y2VwdGlvbicsIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRsZXQgdGFnID0gXCJ1bmNhdWdodEV4Y2VwdGlvblwiO1xuXHRcdGNvbnNvbGUubG9nKHRhZywgZXJyKTtcblx0XHRjb25zb2xlLmxvZyh0YWcsIGVyci5zdGFjayk7XG5cdH0pO1xufSIsInZhciBsb2dnZXIgPSByZXF1aXJlKFwiLi9jaGVja3NDb3JlLmpzXCIpLmxvZ2dlcjtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oc2Ype1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgaGFuZGxlciBmb3IgZmFpbGVkIGFzc2VydHMuIFRoZSBoYW5kbGVyIGlzIGRvaW5nIGxvZ2dpbmcgYW5kIGlzIHRocm93aW5nIGFuIGVycm9yLlxuICAgICAqIEBwYXJhbSBleHBsYW5hdGlvbiB7U3RyaW5nfSAtIGZhaWxpbmcgcmVhc29uIG1lc3NhZ2UuXG4gICAgICovXG4gICAgc2YuZXhjZXB0aW9ucy5yZWdpc3RlcignYXNzZXJ0RmFpbCcsIGZ1bmN0aW9uKGV4cGxhbmF0aW9uKXtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBcIkFzc2VydCBvciBpbnZhcmlhbnQgaGFzIGZhaWxlZCBcIiArIChleHBsYW5hdGlvbiA/IGV4cGxhbmF0aW9uIDogXCJcIik7XG4gICAgICAgIGxldCBlcnIgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgICAgIGxvZ2dlci5yZWNvcmRBc3NlcnQoJ1tGYWlsXSAnICsgbWVzc2FnZSwgZXJyLCB0cnVlKTtcbiAgICAgICAgdGhyb3cgZXJyXG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBhc3NlcnQgZm9yIGVxdWFsaXR5LiBJZiBjaGVjayBmYWlscywgdGhlIGFzc2VydEZhaWwgaXMgaW52b2tlZC5cbiAgICAgKiBAcGFyYW0gdjEge1N0cmluZ3xOdW1iZXJ8T2JqZWN0fSAtIGZpcnN0IHZhbHVlXG4gICAgICogQHBhcmFtIHYxIHtTdHJpbmd8TnVtYmVyfE9iamVjdH0gLSBzZWNvbmQgdmFsdWVcbiAgICAgKiBAcGFyYW0gZXhwbGFuYXRpb24ge1N0cmluZ30gLSBmYWlsaW5nIHJlYXNvbiBtZXNzYWdlIGluIGNhc2UgdGhlIGFzc2VydCBmYWlscy5cbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWRkQ2hlY2soJ2VxdWFsJywgZnVuY3Rpb24odjEgLCB2MiwgZXhwbGFuYXRpb24pe1xuICAgICAgICBpZih2MSAhPT0gdjIpe1xuICAgICAgICAgICAgaWYoIWV4cGxhbmF0aW9uKXtcbiAgICAgICAgICAgICAgICBleHBsYW5hdGlvbiA9ICBcIkFzc2VydGlvbiBmYWlsZWQ6IFtcIiArIHYxICsgXCIgIT09IFwiICsgdjIgKyBcIl1cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNmLmV4Y2VwdGlvbnMuYXNzZXJ0RmFpbChleHBsYW5hdGlvbik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGFzc2VydCBmb3IgaW5lcXVhbGl0eS4gSWYgY2hlY2sgZmFpbHMsIHRoZSBhc3NlcnRGYWlsIGlzIGludm9rZWQuXG4gICAgICogQHBhcmFtIHYxIHtTdHJpbmd8TnVtYmVyfE9iamVjdH0gLSBmaXJzdCB2YWx1ZVxuICAgICAqIEBwYXJhbSB2MSB7U3RyaW5nfE51bWJlcnxPYmplY3R9IC0gc2Vjb25kIHZhbHVlXG4gICAgICogQHBhcmFtIGV4cGxhbmF0aW9uIHtTdHJpbmd9IC0gZmFpbGluZyByZWFzb24gbWVzc2FnZSBpbiBjYXNlIHRoZSBhc3NlcnQgZmFpbHNcbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWRkQ2hlY2soJ25vdEVxdWFsJywgZnVuY3Rpb24odjEsIHYyLCBleHBsYW5hdGlvbil7XG4gICAgICAgIGlmKHYxID09PSB2Mil7XG4gICAgICAgICAgICBpZighZXhwbGFuYXRpb24pe1xuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uID0gIFwiIFtcIisgdjEgKyBcIiA9PSBcIiArIHYyICsgXCJdXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZi5leGNlcHRpb25zLmFzc2VydEZhaWwoZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBhc3NlcnQgZm9yIGV2YWx1YXRpbmcgYW4gZXhwcmVzc2lvbiB0byB0cnVlLiBJZiBjaGVjayBmYWlscywgdGhlIGFzc2VydEZhaWwgaXMgaW52b2tlZC5cbiAgICAgKiBAcGFyYW0gYiB7Qm9vbGVhbn0gLSByZXN1bHQgb2YgYW4gZXhwcmVzc2lvblxuICAgICAqIEBwYXJhbSBleHBsYW5hdGlvbiB7U3RyaW5nfSAtIGZhaWxpbmcgcmVhc29uIG1lc3NhZ2UgaW4gY2FzZSB0aGUgYXNzZXJ0IGZhaWxzXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFkZENoZWNrKCd0cnVlJywgZnVuY3Rpb24oYiwgZXhwbGFuYXRpb24pe1xuICAgICAgICBpZighYil7XG4gICAgICAgICAgICBpZighZXhwbGFuYXRpb24pe1xuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uID0gIFwiIGV4cHJlc3Npb24gaXMgZmFsc2UgYnV0IGlzIGV4cGVjdGVkIHRvIGJlIHRydWVcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNmLmV4Y2VwdGlvbnMuYXNzZXJ0RmFpbChleHBsYW5hdGlvbik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGFzc2VydCBmb3IgZXZhbHVhdGluZyBhbiBleHByZXNzaW9uIHRvIGZhbHNlLiBJZiBjaGVjayBmYWlscywgdGhlIGFzc2VydEZhaWwgaXMgaW52b2tlZC5cbiAgICAgKiBAcGFyYW0gYiB7Qm9vbGVhbn0gLSByZXN1bHQgb2YgYW4gZXhwcmVzc2lvblxuICAgICAqIEBwYXJhbSBleHBsYW5hdGlvbiB7U3RyaW5nfSAtIGZhaWxpbmcgcmVhc29uIG1lc3NhZ2UgaW4gY2FzZSB0aGUgYXNzZXJ0IGZhaWxzXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFkZENoZWNrKCdmYWxzZScsIGZ1bmN0aW9uKGIsIGV4cGxhbmF0aW9uKXtcbiAgICAgICAgaWYoYil7XG4gICAgICAgICAgICBpZighZXhwbGFuYXRpb24pe1xuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uID0gIFwiIGV4cHJlc3Npb24gaXMgdHJ1ZSBidXQgaXMgZXhwZWN0ZWQgdG8gYmUgZmFsc2VcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNmLmV4Y2VwdGlvbnMuYXNzZXJ0RmFpbChleHBsYW5hdGlvbik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGFzc2VydCBmb3IgZXZhbHVhdGluZyBhIHZhbHVlIHRvIG51bGwuIElmIGNoZWNrIGZhaWxzLCB0aGUgYXNzZXJ0RmFpbCBpcyBpbnZva2VkLlxuICAgICAqIEBwYXJhbSBiIHtCb29sZWFufSAtIHJlc3VsdCBvZiBhbiBleHByZXNzaW9uXG4gICAgICogQHBhcmFtIGV4cGxhbmF0aW9uIHtTdHJpbmd9IC0gZmFpbGluZyByZWFzb24gbWVzc2FnZSBpbiBjYXNlIHRoZSBhc3NlcnQgZmFpbHNcbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWRkQ2hlY2soJ2lzTnVsbCcsIGZ1bmN0aW9uKHYxLCBleHBsYW5hdGlvbil7XG4gICAgICAgIGlmKHYxICE9PSBudWxsKXtcbiAgICAgICAgICAgIHNmLmV4Y2VwdGlvbnMuYXNzZXJ0RmFpbChleHBsYW5hdGlvbik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGFzc2VydCBmb3IgZXZhbHVhdGluZyBhIHZhbHVlIHRvIGJlIG5vdCBudWxsLiBJZiBjaGVjayBmYWlscywgdGhlIGFzc2VydEZhaWwgaXMgaW52b2tlZC5cbiAgICAgKiBAcGFyYW0gYiB7Qm9vbGVhbn0gLSByZXN1bHQgb2YgYW4gZXhwcmVzc2lvblxuICAgICAqIEBwYXJhbSBleHBsYW5hdGlvbiB7U3RyaW5nfSAtIGZhaWxpbmcgcmVhc29uIG1lc3NhZ2UgaW4gY2FzZSB0aGUgYXNzZXJ0IGZhaWxzXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFkZENoZWNrKCdub3ROdWxsJywgZnVuY3Rpb24odjEgLCBleHBsYW5hdGlvbil7XG4gICAgICAgIGlmKHYxID09PSBudWxsICYmIHR5cGVvZiB2MSA9PT0gXCJvYmplY3RcIil7XG4gICAgICAgICAgICBzZi5leGNlcHRpb25zLmFzc2VydEZhaWwoZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYWxsIHByb3BlcnRpZXMgb2YgdGhlIHNlY29uZCBvYmplY3QgYXJlIG93biBwcm9wZXJ0aWVzIG9mIHRoZSBmaXJzdCBvYmplY3QuXG4gICAgICogQHBhcmFtIGZpcnN0T2JqIHtPYmplY3R9IC0gZmlyc3Qgb2JqZWN0XG4gICAgICogQHBhcmFtIHNlY29uZE9iantPYmplY3R9IC0gc2Vjb25kIG9iamVjdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIHJldHVybnMgdHJ1ZSwgaWYgdGhlIGNoZWNrIGhhcyBwYXNzZWQgb3IgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG9iamVjdEhhc0ZpZWxkcyhmaXJzdE9iaiwgc2Vjb25kT2JqKXtcbiAgICAgICAgZm9yKGxldCBmaWVsZCBpbiBzZWNvbmRPYmopIHtcbiAgICAgICAgICAgIGlmIChmaXJzdE9iai5oYXNPd25Qcm9wZXJ0eShmaWVsZCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3RPYmpbZmllbGRdICE9PSBzZWNvbmRPYmpbZmllbGRdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvYmplY3RzQXJlRXF1YWwoZmlyc3RPYmosIHNlY29uZE9iaikge1xuICAgICAgICBsZXQgYXJlRXF1YWwgPSB0cnVlO1xuICAgICAgICBpZihmaXJzdE9iaiAhPT0gc2Vjb25kT2JqKSB7XG4gICAgICAgICAgICBpZih0eXBlb2YgZmlyc3RPYmogIT09IHR5cGVvZiBzZWNvbmRPYmopIHtcbiAgICAgICAgICAgICAgICBhcmVFcXVhbCA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGZpcnN0T2JqKSAmJiBBcnJheS5pc0FycmF5KHNlY29uZE9iaikpIHtcblx0ICAgICAgICAgICAgZmlyc3RPYmouc29ydCgpO1xuXHQgICAgICAgICAgICBzZWNvbmRPYmouc29ydCgpO1xuXHRcdCAgICAgICAgaWYgKGZpcnN0T2JqLmxlbmd0aCAhPT0gc2Vjb25kT2JqLmxlbmd0aCkge1xuXHRcdFx0ICAgICAgICBhcmVFcXVhbCA9IGZhbHNlO1xuXHRcdCAgICAgICAgfSBlbHNlIHtcblx0XHRcdCAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaXJzdE9iai5sZW5ndGg7ICsraSkge1xuXHRcdFx0XHQgICAgICAgIGlmICghb2JqZWN0c0FyZUVxdWFsKGZpcnN0T2JqW2ldLCBzZWNvbmRPYmpbaV0pKSB7XG5cdFx0XHRcdFx0ICAgICAgICBhcmVFcXVhbCA9IGZhbHNlO1xuXHRcdFx0XHRcdCAgICAgICAgYnJlYWs7XG5cdFx0XHRcdCAgICAgICAgfVxuXHRcdFx0ICAgICAgICB9XG5cdFx0ICAgICAgICB9XG5cdCAgICAgICAgfSBlbHNlIGlmKCh0eXBlb2YgZmlyc3RPYmogPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHNlY29uZE9iaiA9PT0gJ2Z1bmN0aW9uJykgfHxcblx0XHQgICAgICAgIChmaXJzdE9iaiBpbnN0YW5jZW9mIERhdGUgJiYgc2Vjb25kT2JqIGluc3RhbmNlb2YgRGF0ZSkgfHxcblx0XHQgICAgICAgIChmaXJzdE9iaiBpbnN0YW5jZW9mIFJlZ0V4cCAmJiBzZWNvbmRPYmogaW5zdGFuY2VvZiBSZWdFeHApIHx8XG5cdFx0ICAgICAgICAoZmlyc3RPYmogaW5zdGFuY2VvZiBTdHJpbmcgJiYgc2Vjb25kT2JqIGluc3RhbmNlb2YgU3RyaW5nKSB8fFxuXHRcdCAgICAgICAgKGZpcnN0T2JqIGluc3RhbmNlb2YgTnVtYmVyICYmIHNlY29uZE9iaiBpbnN0YW5jZW9mIE51bWJlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJlRXF1YWwgPSBmaXJzdE9iai50b1N0cmluZygpID09PSBzZWNvbmRPYmoudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZih0eXBlb2YgZmlyc3RPYmogPT09ICdvYmplY3QnICYmIHR5cGVvZiBzZWNvbmRPYmogPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgYXJlRXF1YWwgPSBvYmplY3RIYXNGaWVsZHMoZmlyc3RPYmosIHNlY29uZE9iaik7XG4gICAgICAgICAgICAvLyBpc05hTih1bmRlZmluZWQpIHJldHVybnMgdHJ1ZVxuICAgICAgICAgICAgfSBlbHNlIGlmKGlzTmFOKGZpcnN0T2JqKSAmJiBpc05hTihzZWNvbmRPYmopICYmIHR5cGVvZiBmaXJzdE9iaiA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHNlY29uZE9iaiA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBhcmVFcXVhbCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFyZUVxdWFsID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXJlRXF1YWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgYXNzZXJ0IGZvciBldmFsdWF0aW5nIGlmIGFsbCBwcm9wZXJ0aWVzIG9mIHRoZSBzZWNvbmQgb2JqZWN0IGFyZSBvd24gcHJvcGVydGllcyBvZiB0aGUgZmlyc3Qgb2JqZWN0LlxuICAgICAqIElmIGNoZWNrIGZhaWxzLCB0aGUgYXNzZXJ0RmFpbCBpcyBpbnZva2VkLlxuICAgICAqIEBwYXJhbSBmaXJzdE9iaiB7T2JqZWN0fSAtIGZpcnN0IG9iamVjdFxuICAgICAqIEBwYXJhbSBzZWNvbmRPYmp7T2JqZWN0fSAtIHNlY29uZCBvYmplY3RcbiAgICAgKiBAcGFyYW0gZXhwbGFuYXRpb24ge1N0cmluZ30gLSBmYWlsaW5nIHJlYXNvbiBtZXNzYWdlIGluIGNhc2UgdGhlIGFzc2VydCBmYWlsc1xuICAgICAqL1xuICAgIHNmLmFzc2VydC5hZGRDaGVjayhcIm9iamVjdEhhc0ZpZWxkc1wiLCBmdW5jdGlvbihmaXJzdE9iaiwgc2Vjb25kT2JqLCBleHBsYW5hdGlvbil7XG4gICAgICAgIGlmKCFvYmplY3RIYXNGaWVsZHMoZmlyc3RPYmosIHNlY29uZE9iaikpIHtcbiAgICAgICAgICAgIHNmLmV4Y2VwdGlvbnMuYXNzZXJ0RmFpbChleHBsYW5hdGlvbik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGFzc2VydCBmb3IgZXZhbHVhdGluZyBpZiBhbGwgZWxlbWVudCBmcm9tIHRoZSBzZWNvbmQgYXJyYXkgYXJlIHByZXNlbnQgaW4gdGhlIGZpcnN0IGFycmF5LlxuICAgICAqIERlZXAgY29tcGFyaXNvbiBiZXR3ZWVuIHRoZSBlbGVtZW50cyBvZiB0aGUgYXJyYXkgaXMgdXNlZC5cbiAgICAgKiBJZiBjaGVjayBmYWlscywgdGhlIGFzc2VydEZhaWwgaXMgaW52b2tlZC5cbiAgICAgKiBAcGFyYW0gZmlyc3RBcnJheSB7QXJyYXl9LSBmaXJzdCBhcnJheVxuICAgICAqIEBwYXJhbSBzZWNvbmRBcnJheSB7QXJyYXl9IC0gc2Vjb25kIGFycmF5XG4gICAgICogQHBhcmFtIGV4cGxhbmF0aW9uIHtTdHJpbmd9IC0gZmFpbGluZyByZWFzb24gbWVzc2FnZSBpbiBjYXNlIHRoZSBhc3NlcnQgZmFpbHNcbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWRkQ2hlY2soXCJhcnJheXNNYXRjaFwiLCBmdW5jdGlvbihmaXJzdEFycmF5LCBzZWNvbmRBcnJheSwgZXhwbGFuYXRpb24pe1xuICAgICAgICBpZihmaXJzdEFycmF5Lmxlbmd0aCAhPT0gc2Vjb25kQXJyYXkubGVuZ3RoKXtcbiAgICAgICAgICAgIHNmLmV4Y2VwdGlvbnMuYXNzZXJ0RmFpbChleHBsYW5hdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gb2JqZWN0c0FyZUVxdWFsKGZpcnN0QXJyYXksIHNlY29uZEFycmF5KTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGFycmF5c0RvbnRNYXRjaCA9IHNlY29uZEFycmF5LmV2ZXJ5KGVsZW1lbnQgPT4gZmlyc3RBcnJheS5pbmRleE9mKGVsZW1lbnQpICE9PSAtMSk7XG4gICAgICAgICAgICAvLyBsZXQgYXJyYXlzRG9udE1hdGNoID0gc2Vjb25kQXJyYXkuc29tZShmdW5jdGlvbiAoZXhwZWN0ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICAvLyAgICAgbGV0IGZvdW5kID0gZmlyc3RBcnJheS5zb21lKGZ1bmN0aW9uKHJlc3VsdEVsZW1lbnQpe1xuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gb2JqZWN0SGFzRmllbGRzKHJlc3VsdEVsZW1lbnQsZXhwZWN0ZWRFbGVtZW50KTtcbiAgICAgICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gZm91bmQgPT09IGZhbHNlO1xuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICAgIGlmKCFyZXN1bHQpe1xuICAgICAgICAgICAgICAgIHNmLmV4Y2VwdGlvbnMuYXNzZXJ0RmFpbChleHBsYW5hdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGFkZGVkIG1haW5seSBmb3IgdGVzdCBwdXJwb3NlcywgYmV0dGVyIHRlc3QgZnJhbWV3b3JrcyBsaWtlIG1vY2hhIGNvdWxkIGJlIG11Y2ggYmV0dGVyXG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBhc3NlcnQgZm9yIGNoZWNraW5nIGlmIGEgZnVuY3Rpb24gaXMgZmFpbGluZy5cbiAgICAgKiBJZiB0aGUgZnVuY3Rpb24gaXMgdGhyb3dpbmcgYW4gZXhjZXB0aW9uLCB0aGUgdGVzdCBpcyBwYXNzZWQgb3IgZmFpbGVkIG90aGVyd2lzZS5cbiAgICAgKiBAcGFyYW0gdGVzdE5hbWUge1N0cmluZ30gLSB0ZXN0IG5hbWUgb3IgZGVzY3JpcHRpb25cbiAgICAgKiBAcGFyYW0gZnVuYyB7RnVuY3Rpb259IC0gZnVuY3Rpb24gdG8gYmUgaW52b2tlZFxuICAgICAqL1xuICAgIHNmLmFzc2VydC5hZGRDaGVjaygnZmFpbCcsIGZ1bmN0aW9uKHRlc3ROYW1lLCBmdW5jKXtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgZnVuYygpO1xuICAgICAgICAgICAgbG9nZ2VyLnJlY29yZEFzc2VydChcIltGYWlsXSBcIiArIHRlc3ROYW1lKTtcbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgbG9nZ2VyLnJlY29yZEFzc2VydChcIltQYXNzXSBcIiArIHRlc3ROYW1lKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgYXNzZXJ0IGZvciBjaGVja2luZyBpZiBhIGZ1bmN0aW9uIGlzIGV4ZWN1dGVkIHdpdGggbm8gZXhjZXB0aW9ucy5cbiAgICAgKiBJZiB0aGUgZnVuY3Rpb24gaXMgbm90IHRocm93aW5nIGFueSBleGNlcHRpb24sIHRoZSB0ZXN0IGlzIHBhc3NlZCBvciBmYWlsZWQgb3RoZXJ3aXNlLlxuICAgICAqIEBwYXJhbSB0ZXN0TmFtZSB7U3RyaW5nfSAtIHRlc3QgbmFtZSBvciBkZXNjcmlwdGlvblxuICAgICAqIEBwYXJhbSBmdW5jIHtGdW5jdGlvbn0gLSBmdW5jdGlvbiB0byBiZSBpbnZva2VkXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFkZENoZWNrKCdwYXNzJywgZnVuY3Rpb24odGVzdE5hbWUsIGZ1bmMpe1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICBmdW5jKCk7XG4gICAgICAgICAgICBsb2dnZXIucmVjb3JkQXNzZXJ0KFwiW1Bhc3NdIFwiICsgdGVzdE5hbWUpO1xuICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICBsb2dnZXIucmVjb3JkQXNzZXJ0KFwiW0ZhaWxdIFwiICsgdGVzdE5hbWUsIGVyci5zdGFjayk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEFsaWFzIGZvciB0aGUgcGFzcyBhc3NlcnQuXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFsaWFzKCd0ZXN0JywgJ3Bhc3MnKTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGFzc2VydCBmb3IgY2hlY2tpbmcgaWYgYSBjYWxsYmFjayBmdW5jdGlvbiBpcyBleGVjdXRlZCBiZWZvcmUgdGltZW91dCBpcyByZWFjaGVkIHdpdGhvdXQgYW55IGV4Y2VwdGlvbnMuXG4gICAgICogSWYgdGhlIGZ1bmN0aW9uIGlzIHRocm93aW5nIGFueSBleGNlcHRpb24gb3IgdGhlIHRpbWVvdXQgaXMgcmVhY2hlZCwgdGhlIHRlc3QgaXMgZmFpbGVkIG9yIHBhc3NlZCBvdGhlcndpc2UuXG4gICAgICogQHBhcmFtIHRlc3ROYW1lIHtTdHJpbmd9IC0gdGVzdCBuYW1lIG9yIGRlc2NyaXB0aW9uXG4gICAgICogQHBhcmFtIGZ1bmMge0Z1bmN0aW9ufSAtIGZ1bmN0aW9uIHRvIGJlIGludm9rZWRcbiAgICAgKiBAcGFyYW0gdGltZW91dCB7TnVtYmVyfSAtIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZm9yIHRoZSB0aW1lb3V0IGNoZWNrLiBEZWZhdWx0IHRvIDUwMG1zLlxuICAgICAqL1xuICAgIHNmLmFzc2VydC5hZGRDaGVjaygnY2FsbGJhY2snLCBmdW5jdGlvbih0ZXN0TmFtZSwgZnVuYywgdGltZW91dCl7XG5cbiAgICAgICAgaWYoIWZ1bmMgfHwgdHlwZW9mIGZ1bmMgIT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIldyb25nIHVzYWdlIG9mIGFzc2VydC5jYWxsYmFjayFcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZighdGltZW91dCl7XG4gICAgICAgICAgICB0aW1lb3V0ID0gNTAwO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHBhc3NlZCA9IGZhbHNlO1xuICAgICAgICBmdW5jdGlvbiBjYWxsYmFjaygpe1xuICAgICAgICAgICAgaWYoIXBhc3NlZCl7XG4gICAgICAgICAgICAgICAgcGFzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBsb2dnZXIucmVjb3JkQXNzZXJ0KFwiW1Bhc3NdIFwiICsgdGVzdE5hbWUpO1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3NUZXN0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5yZWNvcmRBc3NlcnQoXCJbRmFpbCAobXVsdGlwbGUgY2FsbHMpXSBcIiArIHRlc3ROYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgZnVuYyhjYWxsYmFjayk7XG4gICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgIGxvZ2dlci5yZWNvcmRBc3NlcnQoXCJbRmFpbF0gXCIgKyB0ZXN0TmFtZSwgIGVyciwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzdWNjZXNzVGVzdChmb3JjZSl7XG4gICAgICAgICAgICBpZighcGFzc2VkKXtcbiAgICAgICAgICAgICAgICBsb2dnZXIucmVjb3JkQXNzZXJ0KFwiW0ZhaWwgVGltZW91dF0gXCIgKyB0ZXN0TmFtZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2V0VGltZW91dChzdWNjZXNzVGVzdCwgdGltZW91dClcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGFzc2VydCBmb3IgY2hlY2tpbmcgaWYgYW4gYXJyYXkgb2YgY2FsbGJhY2sgZnVuY3Rpb25zIGFyZSBleGVjdXRlZCBpbiBhIHdhdGVyZmFsbCBtYW5uZXIsXG4gICAgICogYmVmb3JlIHRpbWVvdXQgaXMgcmVhY2hlZCB3aXRob3V0IGFueSBleGNlcHRpb25zLlxuICAgICAqIElmIGFueSBvZiB0aGUgZnVuY3Rpb25zIGlzIHRocm93aW5nIGFueSBleGNlcHRpb24gb3IgdGhlIHRpbWVvdXQgaXMgcmVhY2hlZCwgdGhlIHRlc3QgaXMgZmFpbGVkIG9yIHBhc3NlZCBvdGhlcndpc2UuXG4gICAgICogQHBhcmFtIHRlc3ROYW1lIHtTdHJpbmd9IC0gdGVzdCBuYW1lIG9yIGRlc2NyaXB0aW9uXG4gICAgICogQHBhcmFtIGZ1bmMge0Z1bmN0aW9ufSAtIGZ1bmN0aW9uIHRvIGJlIGludm9rZWRcbiAgICAgKiBAcGFyYW0gdGltZW91dCB7TnVtYmVyfSAtIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZm9yIHRoZSB0aW1lb3V0IGNoZWNrLiBEZWZhdWx0IHRvIDUwMG1zLlxuICAgICAqL1xuICAgIHNmLmFzc2VydC5hZGRDaGVjaygnc3RlcHMnLCBmdW5jdGlvbih0ZXN0TmFtZSwgYXJyLCB0aW1lb3V0KXtcbiAgICAgICAgaWYoIXRpbWVvdXQpe1xuICAgICAgICAgICAgdGltZW91dCA9IDUwMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjdXJyZW50U3RlcCA9IDA7XG4gICAgICAgIHZhciBwYXNzZWQgPSBmYWxzZTtcblxuICAgICAgICBmdW5jdGlvbiBuZXh0KCl7XG4gICAgICAgICAgICBpZihjdXJyZW50U3RlcCA9PSBhcnIubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICBwYXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGxvZ2dlci5yZWNvcmRBc3NlcnQoXCJbUGFzc10gXCIgKyB0ZXN0TmFtZSApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGZ1bmMgPSBhcnJbY3VycmVudFN0ZXBdO1xuICAgICAgICAgICAgY3VycmVudFN0ZXArKztcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBmdW5jKG5leHQpO1xuICAgICAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgICAgIGxvZ2dlci5yZWNvcmRBc3NlcnQoXCJbRmFpbF0gXCIgKyB0ZXN0TmFtZSAgKyBcIiBbYXQgc3RlcCBcIiArIGN1cnJlbnRTdGVwICsgXCJdXCIsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzdWNjZXNzVGVzdChmb3JjZSl7XG4gICAgICAgICAgICBpZighcGFzc2VkKXtcbiAgICAgICAgICAgICAgICBsb2dnZXIucmVjb3JkQXNzZXJ0KFwiW0ZhaWwgVGltZW91dF0gXCIgKyB0ZXN0TmFtZSAgKyBcIiBbYXQgc3RlcCBcIiArIGN1cnJlbnRTdGVwICsgXCJdXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2V0VGltZW91dChzdWNjZXNzVGVzdCwgdGltZW91dCk7XG4gICAgICAgIG5leHQoKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEFsaWFzIGZvciB0aGUgc3RlcHMgYXNzZXJ0LlxuICAgICAqL1xuICAgIHNmLmFzc2VydC5hbGlhcygnd2F0ZXJmYWxsJywgJ3N0ZXBzJyk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBhc3NlcnQgZm9yIGFzeW5jaHJvbm91c2x5IHByaW50aW5nIGFsbCBleGVjdXRpb24gc3VtbWFyeSBmcm9tIGxvZ2dlci5kdW1wV2h5cy5cbiAgICAgKiBAcGFyYW0gbWVzc2FnZSB7U3RyaW5nfSAtIG1lc3NhZ2UgdG8gYmUgcmVjb3JkZWRcbiAgICAgKiBAcGFyYW0gdGltZW91dCB7TnVtYmVyfSAtIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZm9yIHRoZSB0aW1lb3V0IGNoZWNrLiBEZWZhdWx0IHRvIDUwMG1zLlxuICAgICAqL1xuICAgIHNmLmFzc2VydC5hZGRDaGVjaygnZW5kJywgZnVuY3Rpb24odGltZW91dCwgc2lsZW5jZSl7XG4gICAgICAgIGlmKCF0aW1lb3V0KXtcbiAgICAgICAgICAgIHRpbWVvdXQgPSAxMDAwO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlcigpIHtcbiAgICAgICAgICAgIGxvZ2dlci5kdW1wV2h5cygpLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICAgICAgbGV0IGV4ZWN1dGlvblN1bW1hcnkgPSBjLmdldEV4ZWN1dGlvblN1bW1hcnkoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShleGVjdXRpb25TdW1tYXJ5LCBudWxsLCA0KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYoIXNpbGVuY2Upe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRm9yY2luZyBleGl0IGFmdGVyXCIsIHRpbWVvdXQsIFwibXNcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRUaW1lb3V0KGhhbmRsZXIsIHRpbWVvdXQpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgYXNzZXJ0IGZvciBwcmludGluZyBhIG1lc3NhZ2UgYW5kIGFzeW5jaHJvbm91c2x5IHByaW50aW5nIGFsbCBsb2dzIGZyb20gbG9nZ2VyLmR1bXBXaHlzLlxuICAgICAqIEBwYXJhbSBtZXNzYWdlIHtTdHJpbmd9IC0gbWVzc2FnZSB0byBiZSByZWNvcmRlZFxuICAgICAqIEBwYXJhbSB0aW1lb3V0IHtOdW1iZXJ9IC0gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmb3IgdGhlIHRpbWVvdXQgY2hlY2suIERlZmF1bHQgdG8gNTAwbXMuXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFkZENoZWNrKCdiZWdpbicsIGZ1bmN0aW9uKG1lc3NhZ2UsIHRpbWVvdXQpe1xuICAgICAgICBsb2dnZXIucmVjb3JkQXNzZXJ0KG1lc3NhZ2UpO1xuICAgICAgICBzZi5hc3NlcnQuZW5kKHRpbWVvdXQsIHRydWUpO1xuICAgIH0pO1xufSIsIi8qXG4gICAgY2hlY2tzIGFyZSBsaWtlIGFzc2VydHMgYnV0IGFyZSBpbnRlbmRlZCB0byBiZSB1c2VkIGluIHByb2R1Y3Rpb24gY29kZSB0byBoZWxwIGRlYnVnZ2luZyBhbmQgc2lnbmFsaW5nIHdyb25nIGJlaGF2aW91cnNcblxuICovXG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNmKXtcbiAgICBzZi5leGNlcHRpb25zLnJlZ2lzdGVyKCdjaGVja0ZhaWwnLCBmdW5jdGlvbihleHBsYW5hdGlvbiwgZXJyKXtcbiAgICAgICAgdmFyIHN0YWNrO1xuICAgICAgICBpZihlcnIpe1xuICAgICAgICAgICAgc3RhY2sgPSBlcnIuc3RhY2s7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coXCJDaGVjayBmYWlsZWQgXCIsIGV4cGxhbmF0aW9uLCBlcnIuc3RhY2spXG4gICAgfSk7XG5cbiAgICBzZi5jaGVjay5hZGRDaGVjaygnZXF1YWwnLCBmdW5jdGlvbih2MSAsIHYyLCBleHBsYW5hdGlvbil7XG5cbiAgICAgICAgaWYodjEgIT0gdjIpe1xuICAgICAgICAgICAgaWYoIWV4cGxhbmF0aW9uKXtcbiAgICAgICAgICAgICAgICBleHBsYW5hdGlvbiA9ICBcIiBbXCIrIHYxICsgXCIgIT0gXCIgKyB2MiArIFwiXVwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZi5leGNlcHRpb25zLmNoZWNrRmFpbChleHBsYW5hdGlvbik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgc2YuY2hlY2suYWRkQ2hlY2soJ3RydWUnLCBmdW5jdGlvbihiLCBleHBsYW5hdGlvbil7XG4gICAgICAgIGlmKCFiKXtcbiAgICAgICAgICAgIGlmKCFleHBsYW5hdGlvbil7XG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb24gPSAgXCIgZXhwcmVzc2lvbiBpcyBmYWxzZSBidXQgaXMgZXhwZWN0ZWQgdG8gYmUgdHJ1ZVwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZi5leGNlcHRpb25zLmNoZWNrRmFpbChleHBsYW5hdGlvbik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgc2YuY2hlY2suYWRkQ2hlY2soJ2ZhbHNlJywgZnVuY3Rpb24oYiwgZXhwbGFuYXRpb24pe1xuICAgICAgICBpZihiKXtcbiAgICAgICAgICAgIGlmKCFleHBsYW5hdGlvbil7XG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb24gPSAgXCIgZXhwcmVzc2lvbiBpcyB0cnVlIGJ1dCBpcyBleHBlY3RlZCB0byBiZSBmYWxzZVwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZi5leGNlcHRpb25zLmNoZWNrRmFpbChleHBsYW5hdGlvbik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHNmLmNoZWNrLmFkZENoZWNrKCdub3RlcXVhbCcsIGZ1bmN0aW9uKHYxICwgdjIsIGV4cGxhbmF0aW9uKXtcbiAgICAgICAgaWYodjEgPT0gdjIpe1xuICAgICAgICAgICAgaWYoIWV4cGxhbmF0aW9uKXtcbiAgICAgICAgICAgICAgICBleHBsYW5hdGlvbiA9ICBcIiBbXCIrIHYxICsgXCIgPT0gXCIgKyB2MiArIFwiXVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2YuZXhjZXB0aW9ucy5jaGVja0ZhaWwoZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG5cblxuICAgIC8qXG4gICAgICAgIGFkZGVkIG1haW5seSBmb3IgdGVzdCBwdXJwb3NlcywgYmV0dGVyIHRlc3QgZnJhbWV3b3JrcyBsaWtlIG1vY2hhIGNvdWxkIGJlIG11Y2ggYmV0dGVyIDopXG4gICAgKi9cbiAgICBzZi5jaGVjay5hZGRDaGVjaygnZmFpbCcsIGZ1bmN0aW9uKHRlc3ROYW1lICxmdW5jKXtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgZnVuYygpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJbRmFpbF0gXCIgKyB0ZXN0TmFtZSApO1xuICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltQYXNzXSBcIiArIHRlc3ROYW1lICk7XG4gICAgICAgIH1cbiAgICB9KVxuXG5cbiAgICBzZi5jaGVjay5hZGRDaGVjaygncGFzcycsIGZ1bmN0aW9uKHRlc3ROYW1lICxmdW5jKXtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgZnVuYygpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJbUGFzc10gXCIgKyB0ZXN0TmFtZSApO1xuICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltGYWlsXSBcIiArIHRlc3ROYW1lICAsICBlcnIuc3RhY2spO1xuICAgICAgICB9XG4gICAgfSk7XG5cblxuICAgIHNmLmNoZWNrLmFsaWFzKCd0ZXN0JywncGFzcycpO1xuXG5cbiAgICBzZi5jaGVjay5hZGRDaGVjaygnY2FsbGJhY2snLCBmdW5jdGlvbih0ZXN0TmFtZSAsZnVuYywgdGltZW91dCl7XG4gICAgICAgIGlmKCF0aW1lb3V0KXtcbiAgICAgICAgICAgIHRpbWVvdXQgPSA1MDA7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhc3NlZCA9IGZhbHNlO1xuICAgICAgICBmdW5jdGlvbiBjYWxsYmFjaygpe1xuICAgICAgICAgICAgaWYoIXBhc3NlZCl7XG4gICAgICAgICAgICAgICAgcGFzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIltQYXNzXSBcIiArIHRlc3ROYW1lICk7XG4gICAgICAgICAgICAgICAgU3VjY2Vzc1Rlc3QoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJbRmFpbCAobXVsdGlwbGUgY2FsbHMpXSBcIiArIHRlc3ROYW1lICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgZnVuYyhjYWxsYmFjayk7XG4gICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW0ZhaWxdIFwiICsgdGVzdE5hbWUgICwgIGVyci5zdGFjayk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBTdWNjZXNzVGVzdChmb3JjZSl7XG4gICAgICAgICAgICBpZighcGFzc2VkKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIltGYWlsIFRpbWVvdXRdIFwiICsgdGVzdE5hbWUgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNldFRpbWVvdXQoU3VjY2Vzc1Rlc3QsIHRpbWVvdXQpXG4gICAgfSk7XG5cblxuICAgIHNmLmNoZWNrLmFkZENoZWNrKCdzdGVwcycsIGZ1bmN0aW9uKHRlc3ROYW1lICwgYXJyLCB0aW1lb3V0KXtcbiAgICAgICAgdmFyICBjdXJyZW50U3RlcCA9IDA7XG4gICAgICAgIHZhciBwYXNzZWQgPSBmYWxzZTtcbiAgICAgICAgaWYoIXRpbWVvdXQpe1xuICAgICAgICAgICAgdGltZW91dCA9IDUwMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG5leHQoKXtcbiAgICAgICAgICAgIGlmKGN1cnJlbnRTdGVwID09IGFyci5sZW5ndGgpe1xuICAgICAgICAgICAgICAgIHBhc3NlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJbUGFzc10gXCIgKyB0ZXN0TmFtZSApO1xuICAgICAgICAgICAgICAgIHJldHVybiA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZnVuYyA9IGFycltjdXJyZW50U3RlcF07XG4gICAgICAgICAgICBjdXJyZW50U3RlcCsrO1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIGZ1bmMobmV4dCk7XG4gICAgICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJbRmFpbF0gXCIgKyB0ZXN0TmFtZSAgLFwiXFxuXFx0XCIgLCBlcnIuc3RhY2sgKyBcIlxcblxcdFwiICwgXCIgW2F0IHN0ZXAgXCIsIGN1cnJlbnRTdGVwICsgXCJdXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gU3VjY2Vzc1Rlc3QoZm9yY2Upe1xuICAgICAgICAgICAgaWYoIXBhc3NlZCl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJbRmFpbCBUaW1lb3V0XSBcIiArIHRlc3ROYW1lICsgXCJcXG5cXHRcIiAsIFwiIFthdCBzdGVwIFwiLCBjdXJyZW50U3RlcCsgXCJdXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2V0VGltZW91dChTdWNjZXNzVGVzdCwgdGltZW91dCk7XG4gICAgICAgIG5leHQoKTtcbiAgICB9KTtcblxuICAgIHNmLmNoZWNrLmFsaWFzKCd3YXRlcmZhbGwnLCdzdGVwcycpO1xuICAgIHNmLmNoZWNrLmFsaWFzKCdub3RFcXVhbCcsJ25vdGVxdWFsJyk7XG5cbiAgICBzZi5jaGVjay5hZGRDaGVjaygnZW5kJywgZnVuY3Rpb24odGltZU91dCwgc2lsZW5jZSl7XG4gICAgICAgIGlmKCF0aW1lT3V0KXtcbiAgICAgICAgICAgIHRpbWVPdXQgPSAxMDAwO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYoIXNpbGVuY2Upe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRm9yY2luZyBleGl0IGFmdGVyXCIsIHRpbWVPdXQsIFwibXNcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgICAgIH0sIHRpbWVPdXQpXG4gICAgfSk7XG5cblxuICAgIHNmLmNoZWNrLmFkZENoZWNrKCdiZWdpbicsIGZ1bmN0aW9uKG1lc3NhZ2UsIHRpbWVPdXQpe1xuICAgICAgICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgICAgICAgc2YuY2hlY2suZW5kKHRpbWVPdXQsIHRydWUpO1xuICAgIH0pO1xuXG5cbn0iLCJleHBvcnRzLmluaXQgPSBmdW5jdGlvbihzZil7XG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgdW5rbm93biBleGNlcHRpb24gaGFuZGxlci5cbiAgICAgKi9cbiAgICBzZi5leGNlcHRpb25zLnJlZ2lzdGVyKCd1bmtub3duJywgZnVuY3Rpb24oZXhwbGFuYXRpb24pe1xuICAgICAgICBleHBsYW5hdGlvbiA9IGV4cGxhbmF0aW9uIHx8IFwiXCI7XG4gICAgICAgIGxldCBtZXNzYWdlID0gXCJVbmtub3duIGV4Y2VwdGlvblwiICsgZXhwbGFuYXRpb247XG4gICAgICAgIHRocm93KG1lc3NhZ2UpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgcmVzZW5kIGV4Y2VwdGlvbiBoYW5kbGVyLlxuICAgICAqL1xuICAgIHNmLmV4Y2VwdGlvbnMucmVnaXN0ZXIoJ3Jlc2VuZCcsIGZ1bmN0aW9uKGV4Y2VwdGlvbnMpe1xuICAgICAgICB0aHJvdyhleGNlcHRpb25zKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIG5vdEltcGxlbWVudGVkIGV4Y2VwdGlvbiBoYW5kbGVyLlxuICAgICAqL1xuICAgIHNmLmV4Y2VwdGlvbnMucmVnaXN0ZXIoJ25vdEltcGxlbWVudGVkJywgZnVuY3Rpb24oZXhwbGFuYXRpb24pe1xuICAgICAgICBleHBsYW5hdGlvbiA9IGV4cGxhbmF0aW9uIHx8IFwiXCI7XG4gICAgICAgIGxldCBtZXNzYWdlID0gXCJub3RJbXBsZW1lbnRlZCBleGNlcHRpb25cIiArIGV4cGxhbmF0aW9uO1xuICAgICAgICB0aHJvdyhtZXNzYWdlKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIHNlY3VyaXR5IGV4Y2VwdGlvbiBoYW5kbGVyLlxuICAgICAqL1xuICAgIHNmLmV4Y2VwdGlvbnMucmVnaXN0ZXIoJ3NlY3VyaXR5JywgZnVuY3Rpb24oZXhwbGFuYXRpb24pe1xuICAgICAgICBleHBsYW5hdGlvbiA9IGV4cGxhbmF0aW9uIHx8IFwiXCI7XG4gICAgICAgIGxldCBtZXNzYWdlID0gXCJzZWN1cml0eSBleGNlcHRpb25cIiArIGV4cGxhbmF0aW9uO1xuICAgICAgICB0aHJvdyhtZXNzYWdlKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGR1cGxpY2F0ZURlcGVuZGVuY3kgZXhjZXB0aW9uIGhhbmRsZXIuXG4gICAgICovXG4gICAgc2YuZXhjZXB0aW9ucy5yZWdpc3RlcignZHVwbGljYXRlRGVwZW5kZW5jeScsIGZ1bmN0aW9uKHZhcmlhYmxlKXtcbiAgICAgICAgdmFyaWFibGUgPSB2YXJpYWJsZSB8fCBcIlwiO1xuICAgICAgICBsZXQgbWVzc2FnZSA9IFwiZHVwbGljYXRlRGVwZW5kZW5jeSBleGNlcHRpb25cIiArIHZhcmlhYmxlO1xuICAgICAgICB0aHJvdyhtZXNzYWdlKTtcbiAgICB9KTtcbn0iLCJjb25zdCBMT0dfTEVWRUxTID0ge1xuICAgIEhBUkRfRVJST1I6ICAgICAwLCAgLy8gc3lzdGVtIGxldmVsIGNyaXRpY2FsIGVycm9yOiBoYXJkRXJyb3JcbiAgICBFUlJPUjogICAgICAgICAgMSwgIC8vIHBvdGVudGlhbGx5IGNhdXNpbmcgdXNlcidzIGRhdGEgbG9vc2luZyBlcnJvcjogZXJyb3JcbiAgICBMT0dfRVJST1I6ICAgICAgMiwgIC8vIG1pbm9yIGFubm95YW5jZSwgcmVjb3ZlcmFibGUgZXJyb3I6ICAgbG9nRXJyb3JcbiAgICBVWF9FUlJPUjogICAgICAgMywgIC8vIHVzZXIgZXhwZXJpZW5jZSBjYXVzaW5nIGlzc3VlcyBlcnJvcjogIHV4RXJyb3JcbiAgICBXQVJOOiAgICAgICAgICAgNCwgIC8vIHdhcm5pbmcscG9zc2libGUgaXN1ZXMgYnV0IHNvbWVob3cgdW5jbGVhciBiZWhhdmlvdXI6IHdhcm5cbiAgICBJTkZPOiAgICAgICAgICAgNSwgIC8vIHN0b3JlIGdlbmVyYWwgaW5mbyBhYm91dCB0aGUgc3lzdGVtIHdvcmtpbmc6IGluZm9cbiAgICBERUJVRzogICAgICAgICAgNiwgIC8vIHN5c3RlbSBsZXZlbCBkZWJ1ZzogZGVidWdcbiAgICBMT0NBTF9ERUJVRzogICAgNywgIC8vIGxvY2FsIG5vZGUvc2VydmljZSBkZWJ1ZzogbGRlYnVnXG4gICAgVVNFUl9ERUJVRzogICAgIDgsICAvLyB1c2VyIGxldmVsIGRlYnVnOyB1ZGVidWdcbiAgICBERVZfREVCVUc6ICAgICAgOSwgIC8vIGRldmVsb3BtZW50IHRpbWUgZGVidWc6IGRkZWJ1Z1xuICAgIFdIWVM6ICAgICAgICAgICAgMTAsIC8vIHdoeUxvZyBmb3IgY29kZSByZWFzb25pbmdcbiAgICBURVNUX1JFU1VMVDogICAgMTEsIC8vIHRlc3RSZXN1bHQgdG8gbG9nIHJ1bm5pbmcgdGVzdHNcbn1cblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oc2Ype1xuXG4gICAgLyoqXG4gICAgICogUmVjb3JkcyBsb2cgbWVzc2FnZXMgZnJvbSB2YXJpb3VzIHVzZSBjYXNlcy5cbiAgICAgKiBAcGFyYW0gcmVjb3JkIHtTdHJpbmd9IC0gbG9nIG1lc3NhZ2UuXG4gICAgICovXG4gICAgc2YubG9nZ2VyLnJlY29yZCA9IGZ1bmN0aW9uKHJlY29yZCl7XG4gICAgICAgIHZhciBkaXNwbGF5T25Db25zb2xlID0gdHJ1ZTtcbiAgICAgICAgaWYocHJvY2Vzcy5zZW5kKSB7XG4gICAgICAgICAgICBwcm9jZXNzLnNlbmQocmVjb3JkKTtcbiAgICAgICAgICAgIGRpc3BsYXlPbkNvbnNvbGUgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRpc3BsYXlPbkNvbnNvbGUpIHtcbiAgICAgICAgICAgIGxldCBwcmV0dHlMb2cgPSBKU09OLnN0cmluZ2lmeShyZWNvcmQsIG51bGwsIDIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocHJldHR5TG9nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZGluZyBjYXNlIGZvciBsb2dnaW5nIHN5c3RlbSBsZXZlbCBjcml0aWNhbCBlcnJvcnMuXG4gICAgICovXG4gICAgc2YubG9nZ2VyLmFkZENhc2UoJ2hhcmRFcnJvcicsIGZ1bmN0aW9uKG1lc3NhZ2UsIGV4Y2VwdGlvbiwgYXJncywgcG9zLCBkYXRhKXtcbiAgICAgICAgc2YubG9nZ2VyLnJlY29yZChjcmVhdGVEZWJ1Z1JlY29yZChMT0dfTEVWRUxTLkhBUkRfRVJST1IsICdzeXN0ZW1FcnJvcicsIG1lc3NhZ2UsIGV4Y2VwdGlvbiwgdHJ1ZSwgYXJncywgcG9zLCBkYXRhKSk7XG4gICAgfSwgW1xuICAgICAgICB7XG4gICAgICAgICAgICAnbWVzc2FnZSc6J2V4cGxhbmF0aW9uJ1xuICAgICAgICB9XG4gICAgXSk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRpbmcgY2FzZSBmb3IgbG9nZ2luZyBwb3RlbnRpYWxseSBjYXVzaW5nIHVzZXIncyBkYXRhIGxvb3NpbmcgZXJyb3JzLlxuICAgICAqL1xuICAgIHNmLmxvZ2dlci5hZGRDYXNlKCdlcnJvcicsIGZ1bmN0aW9uKG1lc3NhZ2UsIGV4Y2VwdGlvbiwgYXJncywgcG9zLCBkYXRhKXtcbiAgICAgICAgc2YubG9nZ2VyLnJlY29yZChjcmVhdGVEZWJ1Z1JlY29yZChMT0dfTEVWRUxTLkVSUk9SLCAnZXJyb3InLCBtZXNzYWdlLCBleGNlcHRpb24sIHRydWUsIGFyZ3MsIHBvcywgZGF0YSkpO1xuICAgIH0sIFtcbiAgICAgICAge1xuICAgICAgICAgICAgJ21lc3NhZ2UnOidleHBsYW5hdGlvbidcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgJ2V4Y2VwdGlvbic6J2V4Y2VwdGlvbidcbiAgICAgICAgfVxuICAgIF0pO1xuXG4gICAgLyoqXG4gICAgICogQWRkaW5nIGNhc2UgZm9yIGxvZ2dpbmcgbWlub3IgYW5ub3lhbmNlLCByZWNvdmVyYWJsZSBlcnJvcnMuXG4gICAgICovXG4gICAgc2YubG9nZ2VyLmFkZENhc2UoJ2xvZ0Vycm9yJywgZnVuY3Rpb24obWVzc2FnZSwgZXhjZXB0aW9uLCBhcmdzLCBwb3MsIGRhdGEpe1xuICAgICAgICBzZi5sb2dnZXIucmVjb3JkKGNyZWF0ZURlYnVnUmVjb3JkKExPR19MRVZFTFMuTE9HX0VSUk9SLCAnbG9nRXJyb3InLCBtZXNzYWdlLCBleGNlcHRpb24sIHRydWUsIGFyZ3MsIHBvcywgZGF0YSkpO1xuICAgIH0sIFtcbiAgICAgICAge1xuICAgICAgICAgICAgJ21lc3NhZ2UnOidleHBsYW5hdGlvbidcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgJ2V4Y2VwdGlvbic6J2V4Y2VwdGlvbidcbiAgICAgICAgfVxuICAgIF0pO1xuXG4gICAgLyoqXG4gICAgICogQWRkaW5nIGNhc2UgZm9yIGxvZ2dpbmcgdXNlciBleHBlcmllbmNlIGNhdXNpbmcgaXNzdWVzIGVycm9ycy5cbiAgICAgKi9cbiAgICBzZi5sb2dnZXIuYWRkQ2FzZSgndXhFcnJvcicsIGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICBzZi5sb2dnZXIucmVjb3JkKGNyZWF0ZURlYnVnUmVjb3JkKExPR19MRVZFTFMuVVhfRVJST1IsICd1eEVycm9yJywgbWVzc2FnZSwgbnVsbCwgZmFsc2UpKTtcbiAgICB9LCBbXG4gICAgICAgIHtcbiAgICAgICAgICAgICdtZXNzYWdlJzonZXhwbGFuYXRpb24nXG4gICAgICAgIH1cbiAgICBdKTtcblxuICAgIC8qKlxuICAgICAqIEFkZGluZyBjYXNlIGZvciBsb2dnaW5nIHRocm90dGxpbmcgbWVzc2FnZXMuXG4gICAgICovXG4gICAgc2YubG9nZ2VyLmFkZENhc2UoJ3Rocm90dGxpbmcnLCBmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgc2YubG9nZ2VyLnJlY29yZChjcmVhdGVEZWJ1Z1JlY29yZChMT0dfTEVWRUxTLldBUk4sICd0aHJvdHRsaW5nJywgbWVzc2FnZSwgbnVsbCwgZmFsc2UpKTtcbiAgICB9LCBbXG4gICAgICAgIHtcbiAgICAgICAgICAgICdtZXNzYWdlJzonZXhwbGFuYXRpb24nXG4gICAgICAgIH1cbiAgICBdKTtcblxuICAgIC8qKlxuICAgICAqIEFkZGluZyBjYXNlIGZvciBsb2dnaW5nIHdhcm5pbmcsIHBvc3NpYmxlIGlzc3VlcywgYnV0IHNvbWVob3cgdW5jbGVhciBiZWhhdmlvdXJzLlxuICAgICAqL1xuICAgIHNmLmxvZ2dlci5hZGRDYXNlKCd3YXJuaW5nJywgZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgIHNmLmxvZ2dlci5yZWNvcmQoY3JlYXRlRGVidWdSZWNvcmQoTE9HX0xFVkVMUy5XQVJOLCAnd2FybmluZycsIG1lc3NhZ2UsbnVsbCwgZmFsc2UsIGFyZ3VtZW50cywgMCkpO1xuICAgIH0sIFtcbiAgICAgICAge1xuICAgICAgICAgICAgJ21lc3NhZ2UnOidleHBsYW5hdGlvbidcbiAgICAgICAgfVxuICAgIF0pO1xuICAgIFxuICAgIHNmLmxvZ2dlci5hbGlhcygnd2FybicsICd3YXJuaW5nJyk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRpbmcgY2FzZSBmb3IgbG9nZ2luZyBnZW5lcmFsIGluZm8gYWJvdXQgdGhlIHN5c3RlbSB3b3JraW5nLlxuICAgICAqL1xuICAgIHNmLmxvZ2dlci5hZGRDYXNlKCdpbmZvJywgZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgIHNmLmxvZ2dlci5yZWNvcmQoY3JlYXRlRGVidWdSZWNvcmQoTE9HX0xFVkVMUy5JTkZPLCAnaW5mbycsIG1lc3NhZ2UsbnVsbCwgZmFsc2UsIGFyZ3VtZW50cywgMCkpO1xuICAgIH0sIFtcbiAgICAgICAge1xuICAgICAgICAgICAgJ21lc3NhZ2UnOidleHBsYW5hdGlvbidcbiAgICAgICAgfVxuICAgIF0pO1xuXG4gICAgLyoqXG4gICAgICogQWRkaW5nIGNhc2UgZm9yIGxvZ2dpbmcgc3lzdGVtIGxldmVsIGRlYnVnIG1lc3NhZ2VzLlxuICAgICAqL1xuICAgIHNmLmxvZ2dlci5hZGRDYXNlKCdkZWJ1ZycsIGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICBzZi5sb2dnZXIucmVjb3JkKGNyZWF0ZURlYnVnUmVjb3JkKExPR19MRVZFTFMuREVCVUcsICdkZWJ1ZycsIG1lc3NhZ2UsbnVsbCwgZmFsc2UsIGFyZ3VtZW50cywgMCkpO1xuICAgIH0sIFtcbiAgICAgICAge1xuICAgICAgICAgICAgJ21lc3NhZ2UnOidleHBsYW5hdGlvbidcbiAgICAgICAgfVxuICAgIF0pO1xuXG5cbiAgICAvKipcbiAgICAgKiBBZGRpbmcgY2FzZSBmb3IgbG9nZ2luZyBsb2NhbCBub2RlL3NlcnZpY2UgZGVidWcgbWVzc2FnZXMuXG4gICAgICovXG4gICAgc2YubG9nZ2VyLmFkZENhc2UoJ2xkZWJ1ZycsIGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICBzZi5sb2dnZXIucmVjb3JkKGNyZWF0ZURlYnVnUmVjb3JkKExPR19MRVZFTFMuTE9DQUxfREVCVUcsICdsZGVidWcnLCBtZXNzYWdlLCBudWxsLCBmYWxzZSwgYXJndW1lbnRzLCAwKSk7XG4gICAgfSwgW1xuICAgICAgICB7XG4gICAgICAgICAgICAnbWVzc2FnZSc6J2V4cGxhbmF0aW9uJ1xuICAgICAgICB9XG4gICAgXSk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRpbmcgY2FzZSBmb3IgbG9nZ2luZyB1c2VyIGxldmVsIGRlYnVnIG1lc3NhZ2VzLlxuICAgICAqL1xuICAgIHNmLmxvZ2dlci5hZGRDYXNlKCd1ZGVidWcnLCBmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgc2YubG9nZ2VyLnJlY29yZChjcmVhdGVEZWJ1Z1JlY29yZChMT0dfTEVWRUxTLlVTRVJfREVCVUcsICd1ZGVidWcnLCBtZXNzYWdlICxudWxsLCBmYWxzZSwgYXJndW1lbnRzLCAwKSk7XG4gICAgfSwgW1xuICAgICAgICB7XG4gICAgICAgICAgICAnbWVzc2FnZSc6J2V4cGxhbmF0aW9uJ1xuICAgICAgICB9XG4gICAgXSk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRpbmcgY2FzZSBmb3IgbG9nZ2luZyBkZXZlbG9wbWVudCBkZWJ1ZyBtZXNzYWdlcy5cbiAgICAgKi9cbiAgICBzZi5sb2dnZXIuYWRkQ2FzZSgnZGV2ZWwnLCBmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgc2YubG9nZ2VyLnJlY29yZChjcmVhdGVEZWJ1Z1JlY29yZChMT0dfTEVWRUxTLkRFVl9ERUJVRywgJ2RldmVsJywgbWVzc2FnZSwgbnVsbCwgZmFsc2UsIGFyZ3VtZW50cywgMCkpO1xuICAgIH0sIFtcbiAgICAgICAge1xuICAgICAgICAgICAgJ21lc3NhZ2UnOidleHBsYW5hdGlvbidcbiAgICAgICAgfVxuICAgIF0pO1xuXG4gICAgLyoqXG4gICAgICogQWRkaW5nIGNhc2UgZm9yIGxvZ2dpbmcgXCJ3aHlzXCIgcmVhc29uaW5nIG1lc3NhZ2VzLlxuICAgICAqL1xuICAgIHNmLmxvZ2dlci5hZGRDYXNlKFwibG9nV2h5XCIsIGZ1bmN0aW9uKGxvZ09ubHlDdXJyZW50V2h5Q29udGV4dCl7XG4gICAgICAgIHNmLmxvZ2dlci5yZWNvcmQoY3JlYXRlRGVidWdSZWNvcmQoTE9HX0xFVkVMUy5XSFlTLCAnbG9nd2h5JywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgbG9nT25seUN1cnJlbnRXaHlDb250ZXh0KSlcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEFkZGluZyBjYXNlIGZvciBsb2dnaW5nIGFzc2VydHMgbWVzc2FnZXMgdG8gcnVubmluZyB0ZXN0cy5cbiAgICAgKi9cbiAgICBzZi5sb2dnZXIuYWRkQ2FzZShcInJlY29yZEFzc2VydFwiLCBmdW5jdGlvbiAobWVzc2FnZSwgZXJyb3Isc2hvd1N0YWNrKXtcbiAgICAgICAgc2YubG9nZ2VyLnJlY29yZChjcmVhdGVEZWJ1Z1JlY29yZChMT0dfTEVWRUxTLlRFU1RfUkVTVUxULCAnYXNzZXJ0JywgbWVzc2FnZSwgZXJyb3IsIHNob3dTdGFjaykpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2VuZXJpYyBtZXRob2QgdG8gY3JlYXRlIHN0cnVjdHVyZWQgZGVidWcgcmVjb3JkcyBiYXNlZCBvbiB0aGUgbG9nIGxldmVsLlxuICAgICAqIEBwYXJhbSBsZXZlbCB7TnVtYmVyfSAtIG51bWJlciBmcm9tIDEtMTEsIHVzZWQgdG8gaWRlbnRpZnkgdGhlIGxldmVsIG9mIGF0dGVudGlvbiB0aGF0IGEgbG9nIGVudHJ5IHNob3VsZCBnZXQgZnJvbSBvcGVyYXRpb25zIHBvaW50IG9mIHZpZXdcbiAgICAgKiBAcGFyYW0gdHlwZSB7U3RyaW5nfSAtIGlkZW50aWZpZXIgbmFtZSBmb3IgbG9nIHR5cGVcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSB7U3RyaW5nfSAtIGRlc2NyaXB0aW9uIG9mIHRoZSBkZWJ1ZyByZWNvcmRcbiAgICAgKiBAcGFyYW0gZXhjZXB0aW9uIHtTdHJpbmd9IC0gZXhjZXB0aW9uIGRldGFpbHMgaWYgYW55XG4gICAgICogQHBhcmFtIHNhdmVTdGFjayB7Qm9vbGVhbn0gLSBpZiBzZXQgdG8gdHJ1ZSwgdGhlIGV4Y2VwdGlvbiBjYWxsIHN0YWNrIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGRlYnVnIHJlY29yZFxuICAgICAqIEBwYXJhbSBhcmdzIHtBcnJheX0gLSBhcmd1bWVudHMgb2YgdGhlIGNhbGxlciBmdW5jdGlvblxuICAgICAqIEBwYXJhbSBwb3Mge051bWJlcn0gLSBwb3NpdGlvblxuICAgICAqIEBwYXJhbSBkYXRhIHtTdHJpbmd8TnVtYmVyfEFycmF5fE9iamVjdH0gLSBwYXlsb2FkIGluZm9ybWF0aW9uXG4gICAgICogQHBhcmFtIGxvZ09ubHlDdXJyZW50V2h5Q29udGV4dCAtIGlmIHdoeXMgaXMgZW5hYmxlZCwgb25seSB0aGUgY3VycmVudCBjb250ZXh0IHdpbGwgYmUgbG9nZ2VkXG4gICAgICogQHJldHVybnMgRGVidWcgcmVjb3JkIG1vZGVsIHtPYmplY3R9IHdpdGggdGhlIGZvbGxvd2luZyBmaWVsZHM6XG4gICAgICogW3JlcXVpcmVkXTogbGV2ZWw6ICosIHR5cGU6ICosIHRpbWVzdGFtcDogbnVtYmVyLCBtZXNzYWdlOiAqLCBkYXRhOiAqIGFuZFxuICAgICAqIFtvcHRpb25hbF06IHN0YWNrOiAqLCBleGNlcHRpb246ICosIGFyZ3M6ICosIHdoeUxvZzogKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNyZWF0ZURlYnVnUmVjb3JkKGxldmVsLCB0eXBlLCBtZXNzYWdlLCBleGNlcHRpb24sIHNhdmVTdGFjaywgYXJncywgcG9zLCBkYXRhLCBsb2dPbmx5Q3VycmVudFdoeUNvbnRleHQpe1xuXG4gICAgICAgIHZhciByZXQgPSB7XG4gICAgICAgICAgICBsZXZlbDogbGV2ZWwsXG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgdGltZXN0YW1wOiAobmV3IERhdGUoKSkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgfTtcblxuICAgICAgICBpZihzYXZlU3RhY2spe1xuICAgICAgICAgICAgdmFyIHN0YWNrID0gJyc7XG4gICAgICAgICAgICBpZihleGNlcHRpb24pe1xuICAgICAgICAgICAgICAgIHN0YWNrID0gZXhjZXB0aW9uLnN0YWNrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdGFjayAgPSAobmV3IEVycm9yKCkpLnN0YWNrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0LnN0YWNrID0gc3RhY2s7XG4gICAgICAgIH1cblxuICAgICAgICBpZihleGNlcHRpb24pe1xuICAgICAgICAgICAgcmV0LmV4Y2VwdGlvbiA9IGV4Y2VwdGlvbi5tZXNzYWdlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoYXJncyl7XG4gICAgICAgICAgICByZXQuYXJncyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYXJncykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYocHJvY2Vzcy5lbnYuUlVOX1dJVEhfV0hZUyl7XG4gICAgICAgICAgICB2YXIgd2h5ID0gcmVxdWlyZSgnd2h5cycpO1xuICAgICAgICAgICAgaWYobG9nT25seUN1cnJlbnRXaHlDb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgcmV0Wyd3aHlMb2cnXSA9IHdoeS5nZXRHbG9iYWxDdXJyZW50Q29udGV4dCgpLmdldEV4ZWN1dGlvblN1bW1hcnkoKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHJldFsnd2h5TG9nJ10gPSB3aHkuZ2V0QWxsQ29udGV4dHMoKS5tYXAoZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQuZ2V0RXhlY3V0aW9uU3VtbWFyeSgpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxufVxuXG4iLCJpZih0eXBlb2YgJCQgPT09ICd1bmRlZmluZWQnIHx8ICQkID09PSBudWxsKXtcbiAgICAvL2lmIHJ1bm5pbmcgZnJvbSBhIFByaXZhdGVTa3kgZW52aXJvbm1lbnQgY2FsbGZsb3cgbW9kdWxlIGFuZCBvdGhlciBkZXBzIGFyZSBhbHJlYWR5IGxvYWRlZFxuXHRyZXF1aXJlKFwiLi4vLi4vLi4vZW5naW5lL2NvcmVcIikuZW5hYmxlVGVzdGluZygpO1xufVxuXG5jb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcbmNvbnN0IGZvcmtlciA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcblxudmFyIGdsb2JUb1JlZ0V4cCA9ICByZXF1aXJlKFwiLi91dGlscy9nbG9iLXRvLXJlZ2V4cFwiKTtcblxudmFyIGRlZmF1bHRDb25maWcgPSB7XG4gICAgY29uZkZpbGVOYW1lOiBcImRvdWJsZS1jaGVjay5qc29uXCIsICAgICAgLy8gbmFtZSBvZiB0aGUgY29uZiBmaWxlXG4gICAgZmlsZUV4dDogXCIuanNcIiwgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGVzdCBmaWxlIHN1cHBvcnRlZCBieSBleHRlbnNpb25cbiAgICBtYXRjaERpcnM6IFsndGVzdCcsICd0ZXN0cyddLCAgICAgICAgICAgLy8gZGlycyBuYW1lcyBmb3IgdGVzdHMgLSBjYXNlIGluc2Vuc2l0aXZlICh1c2VkIGluIGRpc2NvdmVyeSBwcm9jZXNzKVxuICAgIHRlc3RzRGlyOiBwcm9jZXNzLmN3ZCgpLCAgICAgICAgICAgICAgICAvLyBwYXRoIHRvIHRoZSByb290IHRlc3RzIGxvY2F0aW9uXG4gICAgcmVwb3J0czoge1xuICAgICAgICBiYXNlUGF0aDogcHJvY2Vzcy5jd2QoKSwgICAgICAgICAgICAvLyBwYXRoIHdoZXJlIHRoZSByZXBvcnRzIHdpbGwgYmUgc2F2ZWRcbiAgICAgICAgcHJlZml4OiBcIlJlcG9ydC1cIiwgICAgICAgICAgICAgICAgICAvLyBwcmVmaXggZm9yIHJlcG9ydCBmaWxlcywgZmlsZW5hbWUgcGF0dGVybjogW3ByZWZpeF0te3RpbWVzdGFtcH17ZXh0fVxuICAgICAgICBleHQ6IFwiLnR4dFwiICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlcG9ydCBmaWxlIGV4dGVuc2lvblxuICAgIH1cbn1cblxuY29uc3QgVEFHID0gXCJbVEVTVF9SVU5ORVJdXCI7XG5jb25zdCBNQVhfV09SS0VSUyA9IHByb2Nlc3MuZW52WydET1VCTEVfQ0hFQ0tfUE9PTF9TSVpFJ10gfHwgMTA7XG5jb25zdCBERUJVRyA9IHR5cGVvZiB2OGRlYnVnID09PSAnb2JqZWN0JztcblxuY29uc3QgVEVTVF9TVEFURVMgPSB7XG4gICAgUkVBRFk6ICdyZWFkeScsXG4gICAgUlVOTklORzogJ3J1bm5pbmcnLFxuICAgIEZJTklTSEVEOiAnZmluaXNoZWQnLFxuICAgIFRJTUVPVVQ6ICd0aW1lb3V0J1xufVxuXG4vLyBTZXNzaW9uIG9iamVjdFxudmFyIGRlZmF1bHRTZXNzaW9uID0ge1xuICAgIHRlc3RDb3VudDogMCxcbiAgICBjdXJyZW50VGVzdEluZGV4OiAwLFxuICAgIGRlYnVnUG9ydDogcHJvY2Vzcy5kZWJ1Z1BvcnQsICAgLy8gY3VycmVudCBwcm9jZXNzIGRlYnVnIHBvcnQuIFRoZSBjaGlsZCBwcm9jZXNzIHdpbGwgYmUgaW5jcmVhc2VkIGZyb20gdGhpcyBwb3J0XG4gICAgd29ya2Vyczoge1xuICAgICAgICBydW5uaW5nOiAwLFxuICAgICAgICB0ZXJtaW5hdGVkOiAwXG4gICAgfVxufVxuXG4vLyBUZW1wbGF0ZSBzdHJ1Y3R1cmUgZm9yIHRlc3QgcmVwb3J0cy5cbnZhciByZXBvcnRGaWxlU3RydWN0dXJlID0ge1xuICAgIGNvdW50OiAwLFxuICAgIHN1aXRlczoge1xuICAgICAgICBjb3VudDogMCxcbiAgICAgICAgaXRlbXM6IFtdXG4gICAgfSxcbiAgICBwYXNzZWQ6IHtcbiAgICAgICAgY291bnQ6IDAsXG4gICAgICAgIGl0ZW1zOiBbXVxuICAgIH0sXG4gICAgZmFpbGVkOiB7XG4gICAgICAgIGNvdW50OiAwLFxuICAgICAgICBpdGVtczogW11cbiAgICB9LFxufVxuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihzZil7XG4gICAgc2YudGVzdFJ1bm5lciA9ICQkLmZsb3cuY3JlYXRlKFwidGVzdFJ1bm5lclwiLCB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbml0aWFsaXphdGlvbiBvZiB0aGUgdGVzdCBydW5uZXIuXG4gICAgICAgICAqIEBwYXJhbSBjb25maWcge09iamVjdH0gLSBzZXR0aW5ncyBvYmplY3QgdGhhdCB3aWxsIGJlIG1lcmdlZCB3aXRoIHRoZSBkZWZhdWx0IG9uZVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19pbml0OiBmdW5jdGlvbihjb25maWcpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5fX2V4dGVuZChkZWZhdWx0Q29uZmlnLCBjb25maWcpO1xuICAgICAgICAgICAgdGhpcy50ZXN0VHJlZSA9IHt9O1xuICAgICAgICAgICAgdGhpcy50ZXN0TGlzdCA9IFtdO1xuXG4gICAgICAgICAgICB0aGlzLnNlc3Npb24gPSBkZWZhdWx0U2Vzc2lvbjtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIHJlcG9ydHMgZGlyZWN0b3J5IGlmIG5vdCBleGlzdFxuICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRoaXMuY29uZmlnLnJlcG9ydHMuYmFzZVBhdGgpKXtcbiAgICAgICAgICAgICAgICBmcy5ta2RpclN5bmModGhpcy5jb25maWcucmVwb3J0cy5iYXNlUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYWluIGVudHJ5IHBvaW50LiBJdCB3aWxsIHN0YXJ0IHRoZSBmbG93IHJ1bm5lciBmbG93LlxuICAgICAgICAgKiBAcGFyYW0gY29uZmlnIHtPYmplY3R9IC0gb2JqZWN0IGNvbnRhaW5pbmcgc2V0dGluZ3Mgc3VjaCBhcyBjb25mIGZpbGUgbmFtZSwgdGVzdCBkaXIuXG4gICAgICAgICAqIEBwYXJhbSBjYWxsYmFjayB7RnVuY3Rpb259IC0gaGFuZGxlcihlcnJvciwgcmVzdWx0KSBpbnZva2VkIHdoZW4gYW4gZXJyb3Igb2NjdXJyZWQgb3IgdGhlIHJ1bm5lciBoYXMgY29tcGxldGVkIGFsbCBqb2JzLlxuICAgICAgICAgKi9cbiAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uKGNvbmZpZywgY2FsbGJhY2spIHtcblxuICAgICAgICAgICAgLy8gd3JhcHBlciBmb3IgcHJvdmlkZWQgY2FsbGJhY2ssIGlmIGFueVxuICAgICAgICAgICAgdGhpcy5jYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX19kZWJ1Z0luZm8oZXJyLm1lc3NhZ2UgfHwgZXJyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZihjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5fX2luaXQoY29uZmlnKTtcblxuICAgICAgICAgICAgdGhpcy5fX2NvbnNvbGVMb2coXCJEaXNjb3ZlcmluZyB0ZXN0cyAuLi5cIik7XG4gICAgICAgICAgICB0aGlzLnRlc3RUcmVlID0gdGhpcy5fX2Rpc2NvdmVyVGVzdEZpbGVzKHRoaXMuY29uZmlnLnRlc3RzRGlyLCBjb25maWcpO1xuICAgICAgICAgICAgdGhpcy50ZXN0TGlzdCA9IHRoaXMuX190b1Rlc3RUcmVlVG9MaXN0KHRoaXMudGVzdFRyZWUpO1xuY29uc29sZS5sb2codGhpcy50ZXN0VHJlZSk7XG4gICAgICAgICAgICB0aGlzLl9fbGF1bmNoVGVzdHMoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlYWRzIGNvbmZpZ3VyYXRpb24gc2V0dGluZ3MgZnJvbSBhIGpzb24gZmlsZS5cbiAgICAgICAgICogQHBhcmFtIGNvbmZQYXRoIHtTdHJpbmd9IC0gYWJzb2x1dGUgcGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLlxuICAgICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHt7fX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fcmVhZENvbmY6IGZ1bmN0aW9uKGNvbmZQYXRoKSB7XG4gICAgICAgICAgICB2YXIgY29uZmlnID0ge307XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgY29uZmlnID0gcmVxdWlyZShjb25mUGF0aCk7XG4gICAgICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjb25maWc7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNjb3ZlcnMgdGVzdCBmaWxlcyByZWN1cnNpdmVseSBzdGFydGluZyBmcm9tIGEgcGF0aC4gVGhlIGRpciBpcyB0aGUgcm9vdCBvZiB0aGUgdGVzdCBmaWxlcy4gSXQgY2FuIGNvbnRhaW5zXG4gICAgICAgICAqIHRlc3QgZmlsZXMgYW5kIHRlc3Qgc3ViIGRpcmVjdG9yaWVzLiBJdCB3aWxsIGNyZWF0ZSBhIHRyZWUgc3RydWN0dXJlIHdpdGggdGhlIHRlc3QgZmlsZXMgZGlzY292ZXJlZC5cbiAgICAgICAgICogTm90ZXM6IE9ubHkgdGhlIGNvbmZpZy5tYXRjaERpcnMgd2lsbCBiZSB0YWtlbiBpbnRvIGNvbnNpZGVyYXRpb24uIEFsc28sIGJhc2VkIG9uIHRoZSBjb25mIChkb3VibGUtY2hlY2suanNvbilcbiAgICAgICAgICogaXQgd2lsbCBpbmNsdWRlIHRoZSB0ZXN0IGZpbGVzIG9yIG5vdC5cbiAgICAgICAgICogQHBhcmFtIGRpciB7U3RyaW5nfSAtIHBhdGggd2hlcmUgdGhlIGRpc2NvdmVyeSBwcm9jZXNzIHN0YXJ0c1xuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29uZiB7U3RyaW5nfSAtIGNvbmZpZ3VyYXRpb24gb2JqZWN0IChkb3VibGUtY2hlY2suanNvbikgZnJvbSB0aGUgcGFyZW50IGRpcmVjdG9yeVxuICAgICAgICAgKiBAcmV0dXJucyBUaGUgcm9vdCBub2RlIG9iamVjdCBvZiB0aGUgZmlsZSBzdHJ1Y3R1cmUgdHJlZS4gRS5nLiB7Knx7X19tZXRhLCBkYXRhLCByZXN1bHQsIGl0ZW1zfX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fZGlzY292ZXJUZXN0RmlsZXM6IGZ1bmN0aW9uKGRpciwgcGFyZW50Q29uZikge1xuICAgICAgICAgICAgbGV0IHN0YXQgPSBmcy5zdGF0U3luYyhkaXIpO1xuICAgICAgICAgICAgaWYoIXN0YXQuaXNEaXJlY3RvcnkoKSl7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRpciArIFwiIGlzIG5vdCBhIGRpcmVjdG9yeSFcIilcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGN1cnJlbnRDb25mID0gcGFyZW50Q29uZjtcblxuICAgICAgICAgICAgdmFyIGN1cnJlbnROb2RlID0gdGhpcy5fX2dldERlZmF1bHROb2RlU3RydWN0dXJlKCk7XG4gICAgICAgICAgICBjdXJyZW50Tm9kZS5fX21ldGEucGFyZW50ID0gcGF0aC5kaXJuYW1lKGRpcik7XG4gICAgICAgICAgICBjdXJyZW50Tm9kZS5fX21ldGEuaXNEaXJlY3RvcnkgPSB0cnVlO1xuXG4gICAgICAgICAgICB2YXIgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIpO1xuICAgICAgICAgICAgLy8gZmlyc3QgbG9vayBmb3IgY29uZiBmaWxlXG4gICAgICAgICAgICBpZihmaWxlcy5pbmRleE9mKHRoaXMuY29uZmlnLmNvbmZGaWxlTmFtZSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZkID0gcGF0aC5qb2luKGRpciwgdGhpcy5jb25maWcuY29uZkZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICBsZXQgY29uZiA9IHRoaXMuX19yZWFkQ29uZihmZCk7XG4gICAgICAgICAgICAgICAgaWYoY29uZikge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZS5fX21ldGEuY29uZiA9IGNvbmY7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb25mID0gY29uZjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN1cnJlbnROb2RlLmRhdGEubmFtZSA9IHBhdGguYmFzZW5hbWUoZGlyKTtcbiAgICAgICAgICAgIGN1cnJlbnROb2RlLmRhdGEucGF0aCA9IGRpcjtcbiAgICAgICAgICAgIGN1cnJlbnROb2RlLml0ZW1zID0gW107XG5cbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDAsIGxlbiA9IGZpbGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBmaWxlc1tpXTtcblxuICAgICAgICAgICAgICAgIGxldCBmZCA9IHBhdGguam9pbihkaXIsIGl0ZW0pO1xuICAgICAgICAgICAgICAgIGxldCBzdGF0ID0gZnMuc3RhdFN5bmMoZmQpO1xuICAgICAgICAgICAgICAgIGxldCBpc0RpciA9IHN0YXQuaXNEaXJlY3RvcnkoKTtcbiAgICAgICAgICAgICAgICBsZXQgaXNUZXN0RGlyID0gdGhpcy5fX2lzVGVzdERpcihmZCk7XG5cbiAgICAgICAgICAgICAgICBpZihpc0RpciAmJiAhaXNUZXN0RGlyKSBjb250aW51ZTsgLy8gaWdub3JlIGRpcnMgdGhhdCBkb2VzIG5vdCBmb2xsb3cgdGhlIG5hbWluZyBydWxlIGZvciB0ZXN0IGRpcnNcblxuICAgICAgICAgICAgICAgIGlmKCFpc0RpciAmJiBpdGVtLm1hdGNoKHRoaXMuY29uZmlnLmNvbmZGaWxlTmFtZSkpe1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTsgLy8gYWxyZWFkeSBwcm9jZXNzZWRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBleGNsdWRlIGZpbGVzIGJhc2VkIG9uIGdsb2IgcGF0dGVybnNcbiAgICAgICAgICAgICAgICBpZihjdXJyZW50Q29uZikge1xuICAgICAgICAgICAgICAgICAgICAvLyBjdXJyZW50Q29uZlsnaWdub3JlJ10gLSBhcnJheSBvZiByZWdFeHBcbiAgICAgICAgICAgICAgICAgICAgaWYoY3VycmVudENvbmZbJ2lnbm9yZSddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXNNYXRjaCA9IHRoaXMuX19pc0FueU1hdGNoKGN1cnJlbnRDb25mWydpZ25vcmUnXSwgaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpc01hdGNoKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBjaGlsZE5vZGUgPSB0aGlzLl9fZ2V0RGVmYXVsdE5vZGVTdHJ1Y3R1cmUoKTtcbiAgICAgICAgICAgICAgICBjaGlsZE5vZGUuX19tZXRhLmNvbmYgPSB7fTtcbiAgICAgICAgICAgICAgICBjaGlsZE5vZGUuX19tZXRhLmlzRGlyZWN0b3J5ID0gaXNEaXI7XG4gICAgICAgICAgICAgICAgY2hpbGROb2RlLl9fbWV0YS5wYXJlbnQgPSBwYXRoLmRpcm5hbWUoZmQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzRGlyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wQ2hpbGROb2RlID0gdGhpcy5fX2Rpc2NvdmVyVGVzdEZpbGVzKGZkLCBjdXJyZW50Q29uZik7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IE9iamVjdC5hc3NpZ24oY2hpbGROb2RlLCB0ZW1wQ2hpbGROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudE5vZGUuaXRlbXMucHVzaChjaGlsZE5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKHBhdGguZXh0bmFtZShmZCkgPT09ICB0aGlzLmNvbmZpZy5maWxlRXh0KXtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLl9fbWV0YS5jb25mLnJ1bnMgPSBjdXJyZW50Q29uZlsncnVucyddIHx8IDE7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5fX21ldGEuY29uZi5zaWxlbnQgPSBjdXJyZW50Q29uZlsnc2lsZW50J107XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5fX21ldGEuY29uZi50aW1lb3V0ID0gY3VycmVudENvbmZbJ3RpbWVvdXQnXTtcblxuICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUuZGF0YS5uYW1lID0gaXRlbTtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLmRhdGEucGF0aCA9IGZkO1xuXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlLml0ZW1zLnB1c2goY2hpbGROb2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50Tm9kZTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIExhdW5jaCBjb2xsZWN0ZWQgdGVzdHMuIEluaXRpYWxpc2VzIHNlc3Npb24gdmFyaWFibGVzLCB0aGF0IGFyZSBzcGVjaWZpYyBmb3IgdGhlIGN1cnJlbnQgbGF1bmNoLlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19sYXVuY2hUZXN0czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl9fY29uc29sZUxvZyhcIkxhdW5jaGluZyB0ZXN0cyAuLi5cIik7XG4gICAgICAgICAgICB0aGlzLnNlc3Npb24udGVzdENvdW50ID0gdGhpcy50ZXN0TGlzdC5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLnNlc3Npb24ucHJvY2Vzc2VkVGVzdENvdW50ID0gMDtcbiAgICAgICAgICAgIHRoaXMuc2Vzc2lvbi53b3JrZXJzLnJ1bm5pbmcgPSAwO1xuICAgICAgICAgICAgdGhpcy5zZXNzaW9uLndvcmtlcnMudGVybWluYXRlZCA9IDA7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuc2Vzc2lvbi50ZXN0Q291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX3NjaGVkdWxlV29yaygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fZG9UZXN0UmVwb3J0cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogU2NoZWR1bGVzIHdvcmsgYmFzZWQgb24gdGhlIE1BWCBhdmFpbGFibGUgd29ya2VycywgYW5kIGJhc2VkIG9uIHRoZSBudW1iZXIgb2YgcnVucyBvZiBhIHRlc3QuXG4gICAgICAgICAqIElmIGEgdGVzdCBoYXMgbXVsdGlwbGUgcnVucyBhcyBhIG9wdGlvbiwgaXQgd2lsbCBiZSBzdGFydGVkIGluIG11bHRpcGxlIHdvcmtlcnMuIE9uY2UgYWxsIHJ1bnMgYXJlIGNvbXBsZXRlZCxcbiAgICAgICAgICogdGhlIHRlc3QgaXMgY29uc2lkZXJlZCBhcyBwcm9jZXNzZWQuXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX3NjaGVkdWxlV29yazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB3aGlsZSh0aGlzLnNlc3Npb24ud29ya2Vycy5ydW5uaW5nIDwgTUFYX1dPUktFUlMgJiYgdGhpcy5zZXNzaW9uLmN1cnJlbnRUZXN0SW5kZXggPCB0aGlzLnNlc3Npb24udGVzdENvdW50KXtcbiAgICAgICAgICAgICAgICBsZXQgdGVzdCA9IHRoaXMudGVzdExpc3RbdGhpcy5zZXNzaW9uLmN1cnJlbnRUZXN0SW5kZXhdO1xuICAgICAgICAgICAgICAgIGlmKHRlc3QucmVzdWx0LnJ1bnMgPCB0ZXN0Ll9fbWV0YS5jb25mLnJ1bnMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGVzdC5yZXN1bHQucnVucysrO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9fbGF1bmNoVGVzdCh0ZXN0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlc3Npb24uY3VycmVudFRlc3RJbmRleCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIExhdW5jaCBhIHRlc3QgaW50byBhIHNlcGFyYXRlIHdvcmtlciAoY2hpbGQgcHJvY2VzcykuXG4gICAgICAgICAqIEVhY2ggd29ya2VyIGhhcyBoYW5kbGVycyBmb3IgbWVzc2FnZSwgZXhpdCBhbmQgZXJyb3IgZXZlbnRzLiBPbmNlIHRoZSBleGl0IG9yIGVycm9yIGV2ZW50IGlzIGludm9rZWQsXG4gICAgICAgICAqIG5ldyB3b3JrIGlzIHNjaGVkdWxlZCBhbmQgc2Vzc2lvbiBvYmplY3QgaXMgdXBkYXRlZC5cbiAgICAgICAgICogTm90ZXM6IE9uIGRlYnVnIG1vZGUsIHRoZSB3b3JrZXJzIHdpbGwgcmVjZWl2ZSBhIGRlYnVnIHBvcnQsIHRoYXQgaXMgaW5jcmVhc2VkIGluY3JlbWVudGFsbHkuXG4gICAgICAgICAqIEBwYXJhbSB0ZXN0IHtPYmplY3R9IC0gdGVzdCBvYmplY3RcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fbGF1bmNoVGVzdDogZnVuY3Rpb24odGVzdCkge1xuICAgICAgICAgICAgdGhpcy5zZXNzaW9uLndvcmtlcnMucnVubmluZysrO1xuXG4gICAgICAgICAgICB0ZXN0LnJlc3VsdC5zdGF0ZSA9IFRFU1RfU1RBVEVTLlJVTk5JTkc7XG4gICAgICAgICAgICB0ZXN0LnJlc3VsdC5wYXNzID0gdGVzdC5yZXN1bHQucGFzcyB8fCB0cnVlO1xuICAgICAgICAgICAgdGVzdC5yZXN1bHQuYXNzZXJ0c1t0ZXN0LnJlc3VsdC5ydW5zXSA9IFtdO1xuICAgICAgICAgICAgdGVzdC5yZXN1bHQubWVzc2FnZXNbdGVzdC5yZXN1bHQucnVuc10gPSBbXTtcblxuICAgICAgICAgICAgdmFyIGVudiA9IHByb2Nlc3MuZW52O1xuXG4gICAgICAgICAgICBsZXQgZXhlY0FyZ3YgPSBbXTtcbiAgICAgICAgICAgIGlmKERFQlVHKSB7XG4gICAgICAgICAgICAgICAgbGV0IGRlYnVnUG9ydCA9ICsrZGVmYXVsdFNlc3Npb24uZGVidWdQb3J0O1xuICAgICAgICAgICAgICAgIGxldCBkZWJ1Z0ZsYWcgPSAnLS1kZWJ1Zz0nICsgZGVidWdQb3J0O1xuICAgICAgICAgICAgICAgIGV4ZWNBcmd2LnB1c2goZGVidWdGbGFnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGN3ZCA9IHRlc3QuX19tZXRhLnBhcmVudDtcblxuICAgICAgICAgICAgdmFyIHdvcmtlciA9IGZvcmtlci5mb3JrKHRlc3QuZGF0YS5wYXRoLCBbXSwgeydjd2QnOiBjd2QsICdlbnYnOiBlbnYsICdleGVjQXJndic6IGV4ZWNBcmd2LCBzdGRpbzogWydpbmhlcml0JywgXCJwaXBlXCIsICdpbmhlcml0JywgJ2lwYyddIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9fZGVidWdJbmZvKGBMYXVuY2hpbmcgdGVzdCAke3Rlc3QuZGF0YS5uYW1lfSwgcnVuWyR7dGVzdC5yZXN1bHQucnVuc31dLCBvbiB3b3JrZXIgcGlkWyR7d29ya2VyLnBpZH1dYCk7XG5cbiAgICAgICAgICAgIHdvcmtlci5vbihcIm1lc3NhZ2VcIiwgb25NZXNzYWdlRXZlbnRIYW5kbGVyV3JhcHBlcih0ZXN0KSk7XG4gICAgICAgICAgICB3b3JrZXIub24oXCJleGl0XCIsIG9uRXhpdEV2ZW50SGFuZGxlcldyYXBwZXIodGVzdCkpO1xuICAgICAgICAgICAgd29ya2VyLm9uKFwiZXJyb3JcIiwgb25FcnJvckV2ZW50SGFuZGxlcldyYXBwZXIodGVzdCkpO1xuICAgICAgICAgICAgd29ya2VyLnRlcm1pbmF0ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgd29ya2VyLnN0ZG91dC5vbignZGF0YScsIGZ1bmN0aW9uIChjaHVuaykge1xuICAgICAgICAgICAgICAgIGxldCBjb250ZW50ID0gbmV3IEJ1ZmZlcihjaHVuaykudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgICAgICAgICBpZih0ZXN0Ll9fbWV0YS5jb25mLnNpbGVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9fY29uc29sZUxvZyhjb250ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBmdW5jdGlvbiBvbk1lc3NhZ2VFdmVudEhhbmRsZXJXcmFwcGVyKHRlc3QpIHtcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudFJ1biA9IHRlc3QucmVzdWx0LnJ1bnM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGxvZykge1xuICAgICAgICAgICAgICAgICAgICBpZihsb2cudHlwZSA9PT0gJ2Fzc2VydCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYobG9nLm1lc3NhZ2UuaW5jbHVkZXMoXCJbRmFpbFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3QucmVzdWx0LnBhc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRlc3QucmVzdWx0LmFzc2VydHNbY3VycmVudFJ1bl0ucHVzaChsb2cpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVzdC5yZXN1bHQubWVzc2FnZXNbY3VycmVudFJ1bl0ucHVzaChsb2cpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBvbkV4aXRFdmVudEhhbmRsZXJXcmFwcGVyKHRlc3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oY29kZSwgc2lnbmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX19kZWJ1Z0luZm8oYFdvcmtlciAke3dvcmtlci5waWR9IC0gZXhpdCBldmVudC4gQ29kZSAke2NvZGV9LCBzaWduYWwgJHtzaWduYWx9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgd29ya2VyLnRlcm1pbmF0ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIHRlc3QucmVzdWx0LnN0YXRlID0gVEVTVF9TVEFURVMuRklOSVNIRUQ7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXNzaW9uLndvcmtlcnMucnVubmluZy0tO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnNlc3Npb24ud29ya2Vycy50ZXJtaW5hdGVkKys7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fX3NjaGVkdWxlV29yaygpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9fY2hlY2tXb3JrZXJzU3RhdHVzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB0aGlzIGhhbmRsZXIgY2FuIGJlIHRyaWdnZXJlZCB3aGVuOlxuICAgICAgICAgICAgLy8gMS4gVGhlIHByb2Nlc3MgY291bGQgbm90IGJlIHNwYXduZWQsIG9yXG4gICAgICAgICAgICAvLyAyLiBUaGUgcHJvY2VzcyBjb3VsZCBub3QgYmUga2lsbGVkLCBvclxuICAgICAgICAgICAgLy8gMy4gU2VuZGluZyBhIG1lc3NhZ2UgdG8gdGhlIGNoaWxkIHByb2Nlc3MgZmFpbGVkLlxuICAgICAgICAgICAgLy8gSU1QT1JUQU5UOiBUaGUgJ2V4aXQnIGV2ZW50IG1heSBvciBtYXkgbm90IGZpcmUgYWZ0ZXIgYW4gZXJyb3IgaGFzIG9jY3VycmVkIVxuICAgICAgICAgICAgZnVuY3Rpb24gb25FcnJvckV2ZW50SGFuZGxlcldyYXBwZXIodGVzdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9fZGVidWdJbmZvKGBXb3JrZXIgJHt3b3JrZXIucGlkfSAtIGVycm9yIGV2ZW50LmApO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9fZGVidWdFcnJvcihlcnJvcik7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXNzaW9uLndvcmtlcnMucnVubmluZy0tO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnNlc3Npb24ud29ya2Vycy50ZXJtaW5hdGVkKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBOb3RlOiBvbiBkZWJ1ZywgdGhlIHRpbWVvdXQgaXMgcmVhY2hlZCBiZWZvcmUgZXhpdCBldmVudCBpcyBjYWxsZWRcbiAgICAgICAgICAgIC8vIHdoZW4ga2lsbCBpcyBjYWxsZWQsIHRoZSBleGl0IGV2ZW50IGlzIHJhaXNlZFxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGlmKCF3b3JrZXIudGVybWluYXRlZCl7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX19kZWJ1Z0luZm8oYHdvcmtlciBwaWQgWyR7d29ya2VyLnBpZH1dIC0gdGltZW91dCBldmVudGApO1xuXG4gICAgICAgICAgICAgICAgICAgIHdvcmtlci5raWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIHRlc3QucmVzdWx0LnN0YXRlID0gVEVTVF9TVEFURVMuVElNRU9VVDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0ZXN0Ll9fbWV0YS5jb25mLnRpbWVvdXQpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2tzIGlmIGFsbCB3b3JrZXJzIGNvbXBsZXRlZCB0aGVpciBqb2IgKGZpbmlzaGVkIG9yIGhhdmUgYmVlbiB0ZXJtaW5hdGVkKS5cbiAgICAgICAgICogSWYgdHJ1ZSwgdGhlbiB0aGUgcmVwb3J0aW5nIHN0ZXBzIGNhbiBiZSBzdGFydGVkLlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19jaGVja1dvcmtlcnNTdGF0dXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5zZXNzaW9uLndvcmtlcnMucnVubmluZyA9PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX2RvVGVzdFJlcG9ydHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZXMgdGVzdCByZXBvcnRzIG9iamVjdCAoSlNPTikgdGhhdCB3aWxsIGJlIHNhdmVkIGluIHRoZSB0ZXN0IHJlcG9ydC5cbiAgICAgICAgICogRmlsZW5hbWUgb2YgdGhlIHJlcG9ydCBpcyB1c2luZyB0aGUgZm9sbG93aW5nIHBhdHRlcm46IHtwcmVmaXh9LXt0aW1lc3RhbXB9e2V4dH1cbiAgICAgICAgICogVGhlIGZpbGUgd2lsbCBiZSBzYXZlZCBpbiBjb25maWcucmVwb3J0cy5iYXNlUGF0aC5cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fZG9UZXN0UmVwb3J0czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl9fY29uc29sZUxvZyhcIkRvaW5nIHJlcG9ydHMgLi4uXCIpO1xuICAgICAgICAgICAgcmVwb3J0RmlsZVN0cnVjdHVyZS5jb3VudCA9IHRoaXMudGVzdExpc3QubGVuZ3RoO1xuXG4gICAgICAgICAgICAvLyBwYXNzL2ZhaWxlZCB0ZXN0c1xuICAgICAgICAgICAgZm9yKGxldCBpID0gMCwgbGVuID0gdGhpcy50ZXN0TGlzdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCB0ZXN0ID0gdGhpcy50ZXN0TGlzdFtpXTtcblxuICAgICAgICAgICAgICAgIGxldCB0ZXN0UGF0aCA9IHRoaXMuX190b1JlbGF0aXZlUGF0aCh0ZXN0LmRhdGEucGF0aCk7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSB7cGF0aDogdGVzdFBhdGh9O1xuICAgICAgICAgICAgICAgIGlmKHRlc3QucmVzdWx0LnBhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0RmlsZVN0cnVjdHVyZS5wYXNzZWQuaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnJlYXNvbiA9IHRoaXMuX19nZXRGaXJzdEZhaWxSZWFzb25QZXJSdW4odGVzdCk7XG4gICAgICAgICAgICAgICAgICAgIHJlcG9ydEZpbGVTdHJ1Y3R1cmUuZmFpbGVkLml0ZW1zLnB1c2goaXRlbSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXBvcnRGaWxlU3RydWN0dXJlLnBhc3NlZC5jb3VudCA9IHJlcG9ydEZpbGVTdHJ1Y3R1cmUucGFzc2VkLml0ZW1zLmxlbmd0aDtcbiAgICAgICAgICAgIHJlcG9ydEZpbGVTdHJ1Y3R1cmUuZmFpbGVkLmNvdW50ID0gcmVwb3J0RmlsZVN0cnVjdHVyZS5mYWlsZWQuaXRlbXMubGVuZ3RoO1xuXG4gICAgICAgICAgICAvLyBzdWl0ZXMgKGZpcnN0IGxldmVsIG9mIGRpcmVjdG9yaWVzKVxuICAgICAgICAgICAgZm9yKGxldCBpID0gMCwgbGVuID0gdGhpcy50ZXN0VHJlZS5pdGVtcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBpdGVtID0gdGhpcy50ZXN0VHJlZS5pdGVtc1tpXTtcbiAgICAgICAgICAgICAgICBpZihpdGVtLl9fbWV0YS5pc0RpcmVjdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3VpdGVQYXRoID0gdGhpcy5fX3RvUmVsYXRpdmVQYXRoKGl0ZW0uZGF0YS5wYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0RmlsZVN0cnVjdHVyZS5zdWl0ZXMuaXRlbXMucHVzaChzdWl0ZVBhdGgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVwb3J0RmlsZVN0cnVjdHVyZS5zdWl0ZXMuY291bnQgPSByZXBvcnRGaWxlU3RydWN0dXJlLnN1aXRlcy5pdGVtcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIGNvbnN0IHdyaXRlUmVwb3J0cyA9IHRoaXMucGFyYWxsZWwoZnVuY3Rpb24gKGVyciwgcmVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFjayhlcnIsIFwiRG9uZVwiKTtcbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgIHRoaXMuX19jb25zb2xlTG9nKHRoaXMuY29uZmlnLnJlcG9ydHMucHJlZml4KTtcbiAgICAgICAgICAgIGxldCBmaWxlTmFtZSA9IGAke3RoaXMuY29uZmlnLnJlcG9ydHMucHJlZml4fWxhdGVzdCR7dGhpcy5jb25maWcucmVwb3J0cy5leHR9YDtcbiAgICAgICAgICAgIGxldCBmaWxlUGF0aCA9IHBhdGguam9pbih0aGlzLmNvbmZpZy5yZXBvcnRzLmJhc2VQYXRoLCBmaWxlTmFtZSk7XG4gICAgICAgICAgICB3cml0ZVJlcG9ydHMuX19zYXZlUmVwb3J0VG9GaWxlKHJlcG9ydEZpbGVTdHJ1Y3R1cmUsIGZpbGVQYXRoKTtcblxuICAgICAgICAgICAgbGV0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBjb25zdCBodG1sRmlsZU5hbWUgPSBgJHt0aGlzLmNvbmZpZy5yZXBvcnRzLnByZWZpeH1sYXRlc3QuaHRtbGA7XG4gICAgICAgICAgICBjb25zdCBodG1sRmlsZVBhdGggPSBwYXRoLmpvaW4odGhpcy5jb25maWcucmVwb3J0cy5iYXNlUGF0aCwgaHRtbEZpbGVOYW1lKTtcbiAgICAgICAgICAgIHdyaXRlUmVwb3J0cy5fX3NhdmVIdG1sUmVwb3J0VG9GaWxlKHJlcG9ydEZpbGVTdHJ1Y3R1cmUsIGh0bWxGaWxlUGF0aCwgdGltZXN0YW1wKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNhdmVzIHRlc3QgcmVwb3J0cyBvYmplY3QgKEpTT04pIGluIHRoZSBzcGVjaWZpZWQgcGF0aC5cbiAgICAgICAgICogQHBhcmFtIHJlcG9ydEZpbGVTdHJ1Y3R1cmUge09iamVjdH0gLSB0ZXN0IHJlcG9ydHMgb2JqZWN0IChKU09OKVxuICAgICAgICAgKiBAcGFyYW0gZGVzdGluYXRpb24ge1N0cmluZ30gLSBwYXRoIG9mIHRoZSBmaWxlIHJlcG9ydCAodGhlIGJhc2UgcGF0aCBNVVNUIGV4aXN0KVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19zYXZlUmVwb3J0VG9GaWxlOiBmdW5jdGlvbihyZXBvcnRGaWxlU3RydWN0dXJlLCBkZXN0aW5hdGlvbikge1xuXG4gICAgICAgICAgICB2YXIgY29udGVudCA9IEpTT04uc3RyaW5naWZ5KHJlcG9ydEZpbGVTdHJ1Y3R1cmUsIG51bGwsIDQpO1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlKGRlc3RpbmF0aW9uLCBjb250ZW50LCAndXRmOCcsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gXCJBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSB3cml0aW5nIHRoZSByZXBvcnQgZmlsZSwgd2l0aCB0aGUgZm9sbG93aW5nIGVycm9yOiBcIiArIEpTT04uc3RyaW5naWZ5KGVycik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX19kZWJ1Z0luZm8obWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gYEZpbmlzaGVkIHdyaXRpbmcgcmVwb3J0IHRvICR7ZGVzdGluYXRpb259YDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2NvbnNvbGVMb2cobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNhdmVzIHRlc3QgcmVwb3J0cyBhcyBIVE1MIGluIHRoZSBzcGVjaWZpZWQgcGF0aC5cbiAgICAgICAgICogQHBhcmFtIHJlcG9ydEZpbGVTdHJ1Y3R1cmUge09iamVjdH0gLSB0ZXN0IHJlcG9ydHMgb2JqZWN0IChKU09OKVxuICAgICAgICAgKiBAcGFyYW0gZGVzdGluYXRpb24ge1N0cmluZ30gLSBwYXRoIG9mIHRoZSBmaWxlIHJlcG9ydCAodGhlIGJhc2UgcGF0aCBNVVNUIGV4aXN0KVxuICAgICAgICAgKiBAcGFyYW0gdGltZXN0YW1wIHtTdHJpbmd9IC0gdGltZXN0YW1wIHRvIGJlIGluamVjdGVkIGluIGh0bWwgdGVtcGxhdGVcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fc2F2ZUh0bWxSZXBvcnRUb0ZpbGU6IGZ1bmN0aW9uIChyZXBvcnRGaWxlU3RydWN0dXJlLCBkZXN0aW5hdGlvbiwgdGltZXN0YW1wKSB7XG4gICAgICAgICAgICBmcy5yZWFkRmlsZShfX2Rpcm5hbWUrJy91dGlscy9yZXBvcnRUZW1wbGF0ZS5odG1sJywgJ3V0ZjgnLCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gJ0FuIGVycm9yIG9jY3VycmVkIHdoaWxlIHJlYWRpbmcgdGhlIGh0bWwgcmVwb3J0IHRlbXBsYXRlIGZpbGUsIHdpdGggdGhlIGZvbGxvd2luZyBlcnJvcjogJyArIEpTT04uc3RyaW5naWZ5KGVycik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX19kZWJ1Z0luZm8obWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGUoZGVzdGluYXRpb24sIHJlcyArIGA8c2NyaXB0PmluaXQoJHtKU09OLnN0cmluZ2lmeShyZXBvcnRGaWxlU3RydWN0dXJlKX0sICR7dGltZXN0YW1wfSk7PC9zY3JpcHQ+YCwgJ3V0ZjgnLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gJ0FuIGVycm9yIG9jY3VycmVkIHdoaWxlIHdyaXRpbmcgdGhlIGh0bWwgcmVwb3J0IGZpbGUsIHdpdGggdGhlIGZvbGxvd2luZyBlcnJvcjogJyArIEpTT04uc3RyaW5naWZ5KGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9fZGVidWdJbmZvKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBgRmluaXNoZWQgd3JpdGluZyByZXBvcnQgdG8gJHtkZXN0aW5hdGlvbn1gO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9fY29uc29sZUxvZyhtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQ29udmVydHMgYWJzb2x1dGUgZmlsZSBwYXRoIHRvIHJlbGF0aXZlIHBhdGguXG4gICAgICAgICAqIEBwYXJhbSBhYnNvbHV0ZVBhdGgge1N0cmluZ30gLSBhYnNvbHV0ZSBwYXRoXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmcgfCB2b2lkIHwgKn0gLSByZWxhdGl2ZSBwYXRoXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX3RvUmVsYXRpdmVQYXRoOiBmdW5jdGlvbihhYnNvbHV0ZVBhdGgpIHtcbiAgICAgICAgICAgIGxldCBiYXNlUGF0aCA9IHBhdGguam9pbih0aGlzLmNvbmZpZy50ZXN0c0RpciwgXCIvXCIpO1xuICAgICAgICAgICAgbGV0IHJlbGF0aXZlUGF0aCA9IGFic29sdXRlUGF0aC5yZXBsYWNlKGJhc2VQYXRoLCBcIlwiKTtcbiAgICAgICAgICAgIHJldHVybiByZWxhdGl2ZVBhdGg7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGVja3MgaWYgYSBkaXJlY3RvcnkgaXMgYSB0ZXN0IGRpciwgYnkgbWF0Y2hpbmcgaXRzIG5hbWUgYWdhaW5zdCBjb25maWcubWF0Y2hEaXJzIGFycmF5LlxuICAgICAgICAgKiBAcGFyYW0gZGlyIHtTdHJpbmd9IC0gZGlyZWN0b3J5IG5hbWVcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gcmV0dXJucyB0cnVlIGlmIHRoZXJlIGlzIGEgbWF0Y2ggYW5kIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9faXNUZXN0RGlyOiBmdW5jdGlvbihkaXIpIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLmNvbmZpZyB8fCAhdGhpcy5jb25maWcubWF0Y2hEaXJzICkge1xuICAgICAgICAgICAgICAgIHRocm93IGBtYXRjaERpcnMgaXMgbm90IGRlZmluZWQgb24gY29uZmlnICR7SlNPTi5zdHJpbmdpZnkodGhpcy5jb25maWcpfSBkb2VzIG5vdCBleGlzdCFgO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaXNUZXN0RGlyID0gdGhpcy5jb25maWcubWF0Y2hEaXJzLnNvbWUoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXIudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhpdGVtLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBpc1Rlc3REaXI7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGb3IgYSBmYWlsZWQgdGVzdCwgaXQgcmV0dXJucyBvbmx5IHRoZSBmaXJzdCBmYWlsIHJlYXNvbiBwZXIgZWFjaCBydW4uXG4gICAgICAgICAqIEBwYXJhbSB0ZXN0IHtPYmplY3R9IC0gdGVzdCBvYmplY3RcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fSAtIGFuIGFycmF5IG9mIHJlYXNvbnMgcGVyIGVhY2ggdGVzdCBydW4uXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX2dldEZpcnN0RmFpbFJlYXNvblBlclJ1bjogZnVuY3Rpb24odGVzdCkge1xuICAgICAgICAgICAgbGV0IHJlYXNvbiA9IFtdO1xuICAgICAgICAgICAgZm9yKGxldCBpID0gMTsgaSA8PSB0ZXN0LnJlc3VsdC5ydW5zOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZih0ZXN0LnJlc3VsdC5hc3NlcnRzW2ldICYmIHRlc3QucmVzdWx0LmFzc2VydHNbaV0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBhZGRSZWFzb24oaSwgdGVzdC5yZXN1bHQuYXNzZXJ0c1tpXVswXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYodGVzdC5yZXN1bHQubWVzc2FnZXNbaV0gJiYgdGVzdC5yZXN1bHQubWVzc2FnZXNbaV0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBhZGRSZWFzb24oaSwgdGVzdC5yZXN1bHQubWVzc2FnZXNbaV1bMF0pXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYWRkUmVhc29uKHJ1biwgbG9nKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVuOiBydW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2c6IGxvZ1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJlYXNvbi5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlYXNvbjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlc2NyaWJlZCBkZWZhdWx0IHRyZWUgbm9kZSBzdHJ1Y3R1cmUuXG4gICAgICAgICAqIEByZXR1cm5zIHt7X19tZXRhOiB7Y29uZjogbnVsbCwgcGFyZW50OiBudWxsLCBpc0RpcmVjdG9yeTogYm9vbGVhbn0sIGRhdGE6IHtuYW1lOiBudWxsLCBwYXRoOiBudWxsfSwgcmVzdWx0OiB7c3RhdGU6IHN0cmluZywgcGFzczogbnVsbCwgZXhlY3V0aW9uVGltZTogbnVtYmVyLCBydW5zOiBudW1iZXIsIGFzc2VydHM6IHt9LCBtZXNzYWdlczoge319LCBpdGVtczogbnVsbH19XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX2dldERlZmF1bHROb2RlU3RydWN0dXJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAge1xuICAgICAgICAgICAgICAgIF9fbWV0YToge1xuICAgICAgICAgICAgICAgICAgICBjb25mOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGlzRGlyZWN0b3J5OiBmYWxzZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBudWxsLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVzdWx0OiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBURVNUX1NUQVRFUy5SRUFEWSwgLy8gcmVhZHkgfCBydW5uaW5nIHwgdGVybWluYXRlZCB8IHRpbWVvdXRcbiAgICAgICAgICAgICAgICAgICAgcGFzczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZXhlY3V0aW9uVGltZTogMCxcbiAgICAgICAgICAgICAgICAgICAgcnVuczogMCxcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0czoge30sXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiB7fVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaXRlbXM6IG51bGxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYXRjaCBhIHRlc3QgZmlsZSBwYXRoIHRvIGEgVU5JWCBnbG9iIGV4cHJlc3Npb24gYXJyYXkuIElmIGl0cyBhbnkgbWF0Y2ggcmV0dXJucyB0cnVlLCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cbiAgICAgICAgICogQHBhcmFtIGdsb2JFeHBBcnJheSB7QXJyYXl9IC0gYW4gYXJyYXkgd2l0aCBnbG9iIGV4cHJlc3Npb24gKFVOSVggc3R5bGUpXG4gICAgICAgICAqIEBwYXJhbSBzdHIge1N0cmluZ30gLSB0aGUgc3RyaW5nIHRvIGJlIG1hdGNoZWRcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gcmV0dXJucyB0cnVlIGlmIHRoZXJlIGlzIGFueSBtYXRjaCBhbmQgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19pc0FueU1hdGNoOiBmdW5jdGlvbihnbG9iRXhwQXJyYXksIHN0cikge1xuICAgICAgICAgICAgbGV0IGhhc01hdGNoID0gZnVuY3Rpb24oZ2xvYkV4cCkge1xuICAgICAgICAgICAgICAgIGxldCByZWdleCA9IGdsb2JUb1JlZ0V4cChnbG9iRXhwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVnZXgudGVzdChzdHIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZ2xvYkV4cEFycmF5LnNvbWUoaGFzTWF0Y2gpXG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb252ZXJ0cyBhIHRyZWUgc3RydWN0dXJlIGludG8gYW4gYXJyYXkgbGlzdCBvZiB0ZXN0IG5vZGVzLiBUaGUgdHJlZSB0cmF2ZXJzYWwgaXMgREZTIChEZWVwLUZpcnN0LVNlYXJjaCkuXG4gICAgICAgICAqIEBwYXJhbSByb290Tm9kZSB7T2JqZWN0fSAtIHJvb3Qgbm9kZSBvZiB0aGUgdGVzdCB0cmVlLlxuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9IC0gTGlzdCBvZiB0ZXN0IG5vZGVzLlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX190b1Rlc3RUcmVlVG9MaXN0OiBmdW5jdGlvbihyb290Tm9kZSkge1xuICAgICAgICAgICAgdmFyIHRlc3RMaXN0ID0gW107XG5cbiAgICAgICAgICAgIHRyYXZlcnNlKHJvb3ROb2RlKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gdHJhdmVyc2Uobm9kZSkge1xuICAgICAgICAgICAgICAgIGlmKCFub2RlLl9fbWV0YS5pc0RpcmVjdG9yeSB8fCAhbm9kZS5pdGVtcykgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgZm9yKGxldCBpID0gMCwgbGVuID0gbm9kZS5pdGVtcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IG5vZGUuaXRlbXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmKGl0ZW0uX19tZXRhLmlzRGlyZWN0b3J5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmF2ZXJzZShpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RMaXN0LnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0ZXN0TGlzdDtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIExvZ2dpbmcgdG8gY29uc29sZSB3cmFwcGVyLlxuICAgICAgICAgKiBAcGFyYW0gbG9nIHtTdHJpbmd8T2JqZWN0fE51bWJlcn0gLSBsb2cgbWVzc2FnZVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19jb25zb2xlTG9nOiBmdW5jdGlvbihsb2cpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFRBRywgbG9nKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIExvZ2dpbmcgZGVidWdnaW5nIGluZm8gbWVzc2FnZXMgd3JhcHBlci5cbiAgICAgICAgICogTG9nZ2VyOiBjb25zb2xlLmluZm9cbiAgICAgICAgICogQHBhcmFtIGxvZyB7U3RyaW5nfE9iamVjdHxOdW1iZXJ9IC0gbG9nIG1lc3NhZ2VcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fZGVidWdJbmZvOiBmdW5jdGlvbihsb2cpIHtcbiAgICAgICAgICAgIHRoaXMuX19kZWJ1Zyhjb25zb2xlLmluZm8sIGxvZyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMb2dnaW5nIGRlYnVnZ2luZyBlcnJvciBtZXNzYWdlcyB3cmFwcGVyLlxuICAgICAgICAgKiBMb2dnZXI6IGNvbnNvbGUuZXJyb3JcbiAgICAgICAgICogQHBhcmFtIGxvZyB7U3RyaW5nfE9iamVjdHxOdW1iZXJ9IC0gbG9nIG1lc3NhZ2VcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fZGVidWdFcnJvcjogZnVuY3Rpb24obG9nKSB7XG4gICAgICAgICAgICB0aGlzLl9fZGVidWcoY29uc29sZS5lcnJvciwgbG9nKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqICBMb2dnaW5nIGRlYnVnZ2luZyBtZXNzYWdlcyB3cmFwcGVyLiBPbmUgZGVidWcgbW9kZSwgdGhlIGxvZ2dpbmcgaXMgc2lsZW50LlxuICAgICAgICAgKiBAcGFyYW0gbG9nZ2VyIHtGdW5jdGlvbn0gLSBoYW5kbGVyIGZvciBsb2dnaW5nXG4gICAgICAgICAqIEBwYXJhbSBsb2cge1N0cmluZ3xPYmplY3R8TnVtYmVyfSAtIGxvZyBtZXNzYWdlXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX2RlYnVnOiBmdW5jdGlvbihsb2dnZXIsIGxvZykge1xuICAgICAgICAgICAgaWYoIURFQlVHKSByZXR1cm47XG5cbiAgICAgICAgICAgIGxldCBwcmV0dHlMb2cgPSBKU09OLnN0cmluZ2lmeShsb2csIG51bGwsIDIpO1xuICAgICAgICAgICAgbG9nZ2VyKFwiREVCVUdcIiwgbG9nKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlZXAgZXh0ZW5kIG9uZSBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIG9mIGFub3RoZXIgb2JqZWN0LlxuICAgICAgICAgKiBJZiB0aGUgcHJvcGVydHkgZXhpc3RzIGluIGJvdGggb2JqZWN0cyB0aGUgcHJvcGVydHkgZnJvbSB0aGUgZmlyc3Qgb2JqZWN0IGlzIG92ZXJyaWRkZW4uXG4gICAgICAgICAqIEBwYXJhbSBmaXJzdCB7T2JqZWN0fSAtIHRoZSBmaXJzdCBvYmplY3RcbiAgICAgICAgICogQHBhcmFtIHNlY29uZCB7T2JqZWN0fSAtIHRoZSBzZWNvbmQgb2JqZWN0XG4gICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IC0gYW4gb2JqZWN0IHdpdGggYm90aCBwcm9wZXJ0aWVzIGZyb20gdGhlIGZpcnN0IGFuZCBzZWNvbmQgb2JqZWN0LlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19leHRlbmQ6IGZ1bmN0aW9uIChmaXJzdCwgc2Vjb25kKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gc2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFmaXJzdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0W2tleV0gPSBzZWNvbmRba2V5XTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmFsID0gc2Vjb25kW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBmaXJzdFtrZXldID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gdGhpcy5fX2V4dGVuZChmaXJzdFtrZXldLCBzZWNvbmRba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0W2tleV0gPSB2YWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmlyc3Q7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG4iLCJcbi8vIGdsb2JUb1JlZ0V4cCB0dXJucyBhIFVOSVggZ2xvYiBleHByZXNzaW9uIGludG8gYSBSZWdFeCBleHByZXNzaW9uLlxuLy8gIFN1cHBvcnRzIGFsbCBzaW1wbGUgZ2xvYiBwYXR0ZXJucy4gRXhhbXBsZXM6ICouZXh0LCAvZm9vLyosIC4uLy4uL3BhdGgsIF5mb28uKlxuLy8gLSBzaW5nbGUgY2hhcmFjdGVyIG1hdGNoaW5nLCBtYXRjaGluZyByYW5nZXMgb2YgY2hhcmFjdGVycyBldGMuIGdyb3VwIG1hdGNoaW5nIGFyZSBubyBzdXBwb3J0ZWRcbi8vIC0gZmxhZ3MgYXJlIG5vdCBzdXBwb3J0ZWRcbnZhciBnbG9iVG9SZWdFeHAgPSBmdW5jdGlvbiAoZ2xvYkV4cCkge1xuICAgIGlmICh0eXBlb2YgZ2xvYkV4cCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR2xvYiBFeHByZXNzaW9uIG11c3QgYmUgYSBzdHJpbmchJyk7XG4gICAgfVxuXG4gICAgdmFyIHJlZ0V4cCA9IFwiXCI7XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gZ2xvYkV4cC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBsZXQgYyA9IGdsb2JFeHBbaV07XG5cbiAgICAgICAgc3dpdGNoIChjKSB7XG4gICAgICAgICAgICBjYXNlIFwiL1wiOlxuICAgICAgICAgICAgY2FzZSBcIiRcIjpcbiAgICAgICAgICAgIGNhc2UgXCJeXCI6XG4gICAgICAgICAgICBjYXNlIFwiK1wiOlxuICAgICAgICAgICAgY2FzZSBcIi5cIjpcbiAgICAgICAgICAgIGNhc2UgXCIoXCI6XG4gICAgICAgICAgICBjYXNlIFwiKVwiOlxuICAgICAgICAgICAgY2FzZSBcIj1cIjpcbiAgICAgICAgICAgIGNhc2UgXCIhXCI6XG4gICAgICAgICAgICBjYXNlIFwifFwiOlxuICAgICAgICAgICAgICAgIHJlZ0V4cCArPSBcIlxcXFxcIiArIGM7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgXCIqXCI6XG4gICAgICAgICAgICAgICAgLy8gdHJlYXQgYW55IG51bWJlciBvZiBcIipcIiBhcyBvbmVcbiAgICAgICAgICAgICAgICB3aGlsZShnbG9iRXhwW2kgKyAxXSA9PT0gXCIqXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWdFeHAgKz0gXCIuKlwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJlZ0V4cCArPSBjO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gc2V0IHRoZSByZWd1bGFyIGV4cHJlc3Npb24gd2l0aCBeICYgJFxuICAgIHJlZ0V4cCA9IFwiXlwiICsgcmVnRXhwICsgXCIkXCI7XG5cbiAgICByZXR1cm4gbmV3IFJlZ0V4cChyZWdFeHApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnbG9iVG9SZWdFeHAiLCJjb25zdCBQc2tDcnlwdG8gPSByZXF1aXJlKFwiLi9saWIvUHNrQ3J5cHRvXCIpO1xuXG5jb25zdCBzc3V0aWwgPSByZXF1aXJlKFwiLi9zaWduc2Vuc3VzRFMvc3N1dGlsXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gUHNrQ3J5cHRvO1xuXG5tb2R1bGUuZXhwb3J0cy5oYXNoVmFsdWVzID0gc3N1dGlsLmhhc2hWYWx1ZXM7XG5cbiIsImNvbnN0IGNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xuY29uc3QgS2V5RW5jb2RlciA9IHJlcXVpcmUoJy4va2V5RW5jb2RlcicpO1xuXG5mdW5jdGlvbiBFQ0RTQShjdXJ2ZU5hbWUpe1xuICAgIHRoaXMuY3VydmUgPSBjdXJ2ZU5hbWUgfHwgJ3NlY3AyNTZrMSc7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5nZW5lcmF0ZUtleVBhaXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlc3VsdCAgICAgPSB7fTtcbiAgICAgICAgdmFyIGVjICAgICAgICAgPSBjcnlwdG8uY3JlYXRlRUNESChzZWxmLmN1cnZlKTtcbiAgICAgICAgcmVzdWx0LnB1YmxpYyAgPSBlYy5nZW5lcmF0ZUtleXMoJ2hleCcpO1xuICAgICAgICByZXN1bHQucHJpdmF0ZSA9IGVjLmdldFByaXZhdGVLZXkoJ2hleCcpO1xuICAgICAgICByZXR1cm4ga2V5c1RvUEVNKHJlc3VsdCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGtleXNUb1BFTShrZXlzKXtcbiAgICAgICAgdmFyIHJlc3VsdCAgICAgICAgICAgICAgICAgID0ge307XG4gICAgICAgIHZhciBFQ1ByaXZhdGVLZXlBU04gICAgICAgICA9IEtleUVuY29kZXIuRUNQcml2YXRlS2V5QVNOO1xuICAgICAgICB2YXIgU3ViamVjdFB1YmxpY0tleUluZm9BU04gPSBLZXlFbmNvZGVyLlN1YmplY3RQdWJsaWNLZXlJbmZvQVNOO1xuICAgICAgICB2YXIga2V5RW5jb2RlciAgICAgICAgICAgICAgPSBuZXcgS2V5RW5jb2RlcihzZWxmLmN1cnZlKTtcblxuICAgICAgICB2YXIgcHJpdmF0ZUtleU9iamVjdCAgICAgICAgPSBrZXlFbmNvZGVyLnByaXZhdGVLZXlPYmplY3Qoa2V5cy5wcml2YXRlLGtleXMucHVibGljKTtcbiAgICAgICAgdmFyIHB1YmxpY0tleU9iamVjdCAgICAgICAgID0ga2V5RW5jb2Rlci5wdWJsaWNLZXlPYmplY3Qoa2V5cy5wdWJsaWMpO1xuXG4gICAgICAgIHJlc3VsdC5wcml2YXRlICAgICAgICAgICAgICA9IEVDUHJpdmF0ZUtleUFTTi5lbmNvZGUocHJpdmF0ZUtleU9iamVjdCwgJ3BlbScsIHByaXZhdGVLZXlPYmplY3QucGVtT3B0aW9ucyk7XG4gICAgICAgIHJlc3VsdC5wdWJsaWMgICAgICAgICAgICAgICA9IFN1YmplY3RQdWJsaWNLZXlJbmZvQVNOLmVuY29kZShwdWJsaWNLZXlPYmplY3QsICdwZW0nLCBwdWJsaWNLZXlPYmplY3QucGVtT3B0aW9ucyk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgIH1cblxuICAgIHRoaXMuc2lnbiA9IGZ1bmN0aW9uIChwcml2YXRlS2V5LGRpZ2VzdCkge1xuICAgICAgICB2YXIgc2lnbiA9IGNyeXB0by5jcmVhdGVTaWduKFwic2hhMjU2XCIpO1xuICAgICAgICBzaWduLnVwZGF0ZShkaWdlc3QpO1xuXG4gICAgICAgIHJldHVybiBzaWduLnNpZ24ocHJpdmF0ZUtleSwnaGV4Jyk7XG4gICAgfTtcblxuICAgIHRoaXMudmVyaWZ5ID0gZnVuY3Rpb24gKHB1YmxpY0tleSxzaWduYXR1cmUsZGlnZXN0KSB7XG4gICAgICAgIHZhciB2ZXJpZnkgPSBjcnlwdG8uY3JlYXRlVmVyaWZ5KCdzaGEyNTYnKTtcbiAgICAgICAgdmVyaWZ5LnVwZGF0ZShkaWdlc3QpO1xuXG4gICAgICAgIHJldHVybiB2ZXJpZnkudmVyaWZ5KHB1YmxpY0tleSxzaWduYXR1cmUsJ2hleCcpO1xuICAgIH1cbn1cblxuZXhwb3J0cy5jcmVhdGVFQ0RTQSA9IGZ1bmN0aW9uIChjdXJ2ZSl7XG4gICAgcmV0dXJuIG5ldyBFQ0RTQShjdXJ2ZSk7XG59OyIsIlxuY29uc3QgY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5jb25zdCBEdXBsZXggPSByZXF1aXJlKCdzdHJlYW0nKS5EdXBsZXg7XG5jb25zdCBvcyA9IHJlcXVpcmUoJ29zJyk7XG5cbmZ1bmN0aW9uIFBza0NyeXB0bygpIHtcblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRUNEU0EgZnVuY3Rpb25zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cdGNvbnN0IGVjZHNhID0gcmVxdWlyZShcIi4vRUNEU0FcIikuY3JlYXRlRUNEU0EoKTtcblx0dGhpcy5nZW5lcmF0ZUVDRFNBS2V5UGFpciA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gZWNkc2EuZ2VuZXJhdGVLZXlQYWlyKCk7XG5cdH07XG5cblx0dGhpcy5zaWduID0gZnVuY3Rpb24gKHByaXZhdGVLZXksIGRpZ2VzdCkge1xuXHRcdHJldHVybiBlY2RzYS5zaWduKHByaXZhdGVLZXksIGRpZ2VzdCk7XG5cdH07XG5cblx0dGhpcy52ZXJpZnkgPSBmdW5jdGlvbiAocHVibGljS2V5LCBzaWduYXR1cmUsIGRpZ2VzdCkge1xuXHRcdHJldHVybiBlY2RzYS52ZXJpZnkocHVibGljS2V5LCBzaWduYXR1cmUsIGRpZ2VzdCk7XG5cdH07XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FbmNyeXB0aW9uIGZ1bmN0aW9ucyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblx0Y29uc3QgdXRpbHMgPSByZXF1aXJlKFwiLi91dGlscy9jcnlwdG9VdGlsc1wiKTtcblx0Y29uc3QgYXJjaGl2ZXIgPSByZXF1aXJlKFwiLi9wc2stYXJjaGl2ZXJcIik7XG5cdHZhciB0ZW1wRm9sZGVyID0gb3MudG1wZGlyKCk7XG5cblx0dGhpcy5lbmNyeXB0U3RyZWFtID0gZnVuY3Rpb24gKGlucHV0UGF0aCwgZGVzdGluYXRpb25QYXRoLCBwYXNzd29yZCkge1xuXHRcdHV0aWxzLmVuY3J5cHRGaWxlKGlucHV0UGF0aCwgZGVzdGluYXRpb25QYXRoLCBwYXNzd29yZCk7XG5cdH07XG5cblx0dGhpcy5kZWNyeXB0U3RyZWFtID0gZnVuY3Rpb24gKGVuY3J5cHRlZElucHV0UGF0aCwgb3V0cHV0Rm9sZGVyLCBwYXNzd29yZCkge1xuXHRcdHV0aWxzLmRlY3J5cHRGaWxlKGVuY3J5cHRlZElucHV0UGF0aCwgdGVtcEZvbGRlciwgcGFzc3dvcmQsIGZ1bmN0aW9uIChlcnIsIHRlbXBBcmNoaXZlUGF0aCkge1xuXHRcdFx0YXJjaGl2ZXIudW56aXAodGVtcEFyY2hpdmVQYXRoLCBvdXRwdXRGb2xkZXIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJEZWNyeXB0aW9uIGlzIGNvbXBsZXRlZC5cIik7XG5cdFx0XHRcdGZzLnVubGlua1N5bmModGVtcEFyY2hpdmVQYXRoKTtcblx0XHRcdH0pO1xuXHRcdH0pXG5cdH07XG5cblxuXHR0aGlzLnBza0hhc2ggPSBmdW5jdGlvbiAoZGF0YSkge1xuXHRcdGlmICh1dGlscy5pc0pzb24oZGF0YSkpIHtcblx0XHRcdHJldHVybiB1dGlscy5jcmVhdGVQc2tIYXNoKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHV0aWxzLmNyZWF0ZVBza0hhc2goZGF0YSk7XG5cdFx0fVxuXHR9O1xuXG5cblx0dGhpcy5zYXZlRFNlZWQgPSBmdW5jdGlvbiAoZHNlZWQsIHBpbiwgZHNlZWRQYXRoKSB7XG5cdFx0dmFyIGVuY3J5cHRpb25LZXkgICA9IHV0aWxzLmRlcml2ZUtleShwaW4sIG51bGwsIG51bGwpO1xuXHRcdHZhciBpdiAgICAgICAgICAgICAgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoMTYpO1xuXHRcdHZhciBjaXBoZXIgICAgICAgICAgPSBjcnlwdG8uY3JlYXRlQ2lwaGVyaXYoJ2Flcy0yNTYtY2ZiJywgZW5jcnlwdGlvbktleSwgaXYpO1xuXHRcdHZhciBlbmNyeXB0ZWREU2VlZCAgPSBjaXBoZXIudXBkYXRlKGRzZWVkLCAnYmluYXJ5Jyk7XG5cdFx0dmFyIGZpbmFsICAgICAgICAgICA9IEJ1ZmZlci5mcm9tKGNpcGhlci5maW5hbCgnYmluYXJ5JyksICdiaW5hcnknKTtcblx0XHRlbmNyeXB0ZWREU2VlZCAgICAgID0gQnVmZmVyLmNvbmNhdChbaXYsIGVuY3J5cHRlZERTZWVkLCBmaW5hbF0pO1xuXHRcdGZzLndyaXRlRmlsZVN5bmMoZHNlZWRQYXRoLCBlbmNyeXB0ZWREU2VlZCk7XG5cdH07XG5cblx0dGhpcy5sb2FkRHNlZWQgPSBmdW5jdGlvbiAocGluLCBkc2VlZFBhdGgpIHtcblx0XHR2YXIgZW5jcnlwdGVkRGF0YSAgPSBmcy5yZWFkRmlsZVN5bmMoZHNlZWRQYXRoKTtcblx0XHR2YXIgaXYgICAgICAgICAgICAgPSBlbmNyeXB0ZWREYXRhLnNsaWNlKDAsIDE2KTtcblx0XHR2YXIgZW5jcnlwdGVkRHNlZWQgPSBlbmNyeXB0ZWREYXRhLnNsaWNlKDE2KTtcblx0XHR2YXIgZW5jcnlwdGlvbktleSAgPSB1dGlscy5kZXJpdmVLZXkocGluLCBudWxsLCBudWxsKTtcblx0XHR2YXIgZGVjaXBoZXIgICAgICAgPSBjcnlwdG8uY3JlYXRlRGVjaXBoZXJpdignYWVzLTI1Ni1jZmInLCBlbmNyeXB0aW9uS2V5LCBpdik7XG5cdFx0dmFyIGRzZWVkICAgICAgICAgID0gQnVmZmVyLmZyb20oZGVjaXBoZXIudXBkYXRlKGVuY3J5cHRlZERzZWVkLCAnYmluYXJ5JyksICdiaW5hcnknKTtcblx0XHR2YXIgZmluYWwgICAgICAgICAgPSBCdWZmZXIuZnJvbShkZWNpcGhlci5maW5hbCgnYmluYXJ5JyksICdiaW5hcnknKTtcblx0XHRkc2VlZCAgICAgICAgICAgICAgPSBCdWZmZXIuY29uY2F0KFtkc2VlZCwgZmluYWxdKTtcblxuXHRcdHJldHVybiBkc2VlZDtcblxuXHR9O1xuXG5cblx0dGhpcy5kZXJpdmVTZWVkID0gZnVuY3Rpb24gKHNlZWQsIGRzZWVkTGVuKSB7XG5cdFx0cmV0dXJuIHV0aWxzLmRlcml2ZUtleShzZWVkLCBudWxsLCBkc2VlZExlbik7XG5cblx0fTtcblxuXHR0aGlzLmVuY3J5cHRKc29uID0gZnVuY3Rpb24gKGRhdGEsIGRzZWVkKSB7XG5cdFx0dmFyIGNpcGhlclRleHQgPSB1dGlscy5lbmNyeXB0KEpTT04uc3RyaW5naWZ5KGRhdGEpLCBkc2VlZCk7XG5cblx0XHRyZXR1cm4gY2lwaGVyVGV4dDtcblx0fTtcblxuXHR0aGlzLmRlY3J5cHRKc29uID0gZnVuY3Rpb24gKGVuY3J5cHRlZERhdGEsIGRzZWVkKSB7XG5cdFx0dmFyIHBsYWludGV4dCA9IHV0aWxzLmRlY3J5cHQoZW5jcnlwdGVkRGF0YSwgZHNlZWQpO1xuXG5cdFx0cmV0dXJuIEpTT04ucGFyc2UocGxhaW50ZXh0KTtcblx0fTtcblxuXHR0aGlzLmVuY3J5cHRCbG9iID0gZnVuY3Rpb24gKGRhdGEsIGRzZWVkKSB7XG5cdFx0dmFyIGNpcGhlcnRleHQgPSB1dGlscy5lbmNyeXB0KGRhdGEsIGRzZWVkKTtcblxuXHRcdHJldHVybiBjaXBoZXJ0ZXh0O1xuXHR9O1xuXG5cdHRoaXMuZGVjcnlwdEJsb2IgPSBmdW5jdGlvbiAoZW5jcnlwdGVkRGF0YSwgZHNlZWQpIHtcblx0XHR2YXIgcGxhaW50ZXh0ID0gdXRpbHMuZGVjcnlwdChlbmNyeXB0ZWREYXRhLCBkc2VlZCk7XG5cblx0XHRyZXR1cm4gcGxhaW50ZXh0O1xuXHR9O1xuXG5cblx0dGhpcy5nZW5lcmF0ZVNlZWQgPSBmdW5jdGlvbiAoYmFja3VwVXJsKSB7XG5cdFx0dmFyIHNlZWQgPSB7XG5cdFx0XHRcImJhY2t1cFwiOiBiYWNrdXBVcmwsXG5cdFx0XHRcInJhbmRcIlx0OiBjcnlwdG8ucmFuZG9tQnl0ZXMoMzIpLnRvU3RyaW5nKFwiaGV4XCIpXG5cdFx0fTtcblx0XHRyZXR1cm4gQnVmZmVyLmZyb20oSlNPTi5zdHJpbmdpZnkoc2VlZCkpO1xuXHR9O1xuXHR0aGlzLmdlbmVyYXRlU2FmZVVpZCA9IGZ1bmN0aW9uIChkc2VlZCwgcGF0aCkge1xuXHRcdHBhdGggPSBwYXRoIHx8IHByb2Nlc3MuY3dkKCk7XG5cdFx0cmV0dXJuIHV0aWxzLmVuY29kZSh0aGlzLnBza0hhc2goQnVmZmVyLmNvbmNhdChbQnVmZmVyLmZyb20ocGF0aCksIGRzZWVkXSkpKTtcblx0fTtcbn1cblxuLy8gdmFyIHBjcnlwdG8gPSBuZXcgUHNrQ3J5cHRvKCk7XG4vLyBwY3J5cHRvLmVuY3J5cHRTdHJlYW0oXCJDOlxcXFxVc2Vyc1xcXFxBY2VyXFxcXFdlYnN0b3JtUHJvamVjdHNcXFxccHJpdmF0ZXNreVxcXFx0ZXN0c1xcXFxwc2stdW5pdC10ZXN0aW5nXFxcXHppcFxcXFxvdXRwdXRcIixcIm91dHB1dC9teWZpbGVcIiwgXCIxMjNcIik7XG4vLyBwY3J5cHRvLmRlY3J5cHRTdHJlYW0oXCJvdXRwdXRcXFxcbXlmaWxlXCIsIFwib3V0cHV0XCIsIFwiMTIzXCIpO1xubW9kdWxlLmV4cG9ydHMgPSBuZXcgUHNrQ3J5cHRvKCk7IiwidmFyIGFzbjEgPSByZXF1aXJlKCcuL2FzbjEnKTtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ3V0aWwnKS5pbmhlcml0cztcblxudmFyIGFwaSA9IGV4cG9ydHM7XG5cbmFwaS5kZWZpbmUgPSBmdW5jdGlvbiBkZWZpbmUobmFtZSwgYm9keSkge1xuICByZXR1cm4gbmV3IEVudGl0eShuYW1lLCBib2R5KTtcbn07XG5cbmZ1bmN0aW9uIEVudGl0eShuYW1lLCBib2R5KSB7XG4gIHRoaXMubmFtZSA9IG5hbWU7XG4gIHRoaXMuYm9keSA9IGJvZHk7XG5cbiAgdGhpcy5kZWNvZGVycyA9IHt9O1xuICB0aGlzLmVuY29kZXJzID0ge307XG59O1xuXG5FbnRpdHkucHJvdG90eXBlLl9jcmVhdGVOYW1lZCA9IGZ1bmN0aW9uIGNyZWF0ZU5hbWVkKGJhc2UpIHtcbiAgdmFyIG5hbWVkO1xuICB0cnkge1xuICAgIG5hbWVkID0gcmVxdWlyZSgndm0nKS5ydW5JblRoaXNDb250ZXh0KFxuICAgICAgJyhmdW5jdGlvbiAnICsgdGhpcy5uYW1lICsgJyhlbnRpdHkpIHtcXG4nICtcbiAgICAgICcgIHRoaXMuX2luaXROYW1lZChlbnRpdHkpO1xcbicgK1xuICAgICAgJ30pJ1xuICAgICk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBuYW1lZCA9IGZ1bmN0aW9uIChlbnRpdHkpIHtcbiAgICAgIHRoaXMuX2luaXROYW1lZChlbnRpdHkpO1xuICAgIH07XG4gIH1cbiAgaW5oZXJpdHMobmFtZWQsIGJhc2UpO1xuICBuYW1lZC5wcm90b3R5cGUuX2luaXROYW1lZCA9IGZ1bmN0aW9uIGluaXRuYW1lZChlbnRpdHkpIHtcbiAgICBiYXNlLmNhbGwodGhpcywgZW50aXR5KTtcbiAgfTtcblxuICByZXR1cm4gbmV3IG5hbWVkKHRoaXMpO1xufTtcblxuRW50aXR5LnByb3RvdHlwZS5fZ2V0RGVjb2RlciA9IGZ1bmN0aW9uIF9nZXREZWNvZGVyKGVuYykge1xuICAvLyBMYXppbHkgY3JlYXRlIGRlY29kZXJcbiAgaWYgKCF0aGlzLmRlY29kZXJzLmhhc093blByb3BlcnR5KGVuYykpXG4gICAgdGhpcy5kZWNvZGVyc1tlbmNdID0gdGhpcy5fY3JlYXRlTmFtZWQoYXNuMS5kZWNvZGVyc1tlbmNdKTtcbiAgcmV0dXJuIHRoaXMuZGVjb2RlcnNbZW5jXTtcbn07XG5cbkVudGl0eS5wcm90b3R5cGUuZGVjb2RlID0gZnVuY3Rpb24gZGVjb2RlKGRhdGEsIGVuYywgb3B0aW9ucykge1xuICByZXR1cm4gdGhpcy5fZ2V0RGVjb2RlcihlbmMpLmRlY29kZShkYXRhLCBvcHRpb25zKTtcbn07XG5cbkVudGl0eS5wcm90b3R5cGUuX2dldEVuY29kZXIgPSBmdW5jdGlvbiBfZ2V0RW5jb2RlcihlbmMpIHtcbiAgLy8gTGF6aWx5IGNyZWF0ZSBlbmNvZGVyXG4gIGlmICghdGhpcy5lbmNvZGVycy5oYXNPd25Qcm9wZXJ0eShlbmMpKVxuICAgIHRoaXMuZW5jb2RlcnNbZW5jXSA9IHRoaXMuX2NyZWF0ZU5hbWVkKGFzbjEuZW5jb2RlcnNbZW5jXSk7XG4gIHJldHVybiB0aGlzLmVuY29kZXJzW2VuY107XG59O1xuXG5FbnRpdHkucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uIGVuY29kZShkYXRhLCBlbmMsIC8qIGludGVybmFsICovIHJlcG9ydGVyKSB7XG4gIHJldHVybiB0aGlzLl9nZXRFbmNvZGVyKGVuYykuZW5jb2RlKGRhdGEsIHJlcG9ydGVyKTtcbn07XG4iLCJ2YXIgYXNuMSA9IGV4cG9ydHM7XG5cbmFzbjEuYmlnbnVtID0gcmVxdWlyZSgnLi9iaWdudW0vYm4nKTtcblxuYXNuMS5kZWZpbmUgPSByZXF1aXJlKCcuL2FwaScpLmRlZmluZTtcbmFzbjEuYmFzZSA9IHJlcXVpcmUoJy4vYmFzZS9pbmRleCcpO1xuYXNuMS5jb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cy9pbmRleCcpO1xuYXNuMS5kZWNvZGVycyA9IHJlcXVpcmUoJy4vZGVjb2RlcnMvaW5kZXgnKTtcbmFzbjEuZW5jb2RlcnMgPSByZXF1aXJlKCcuL2VuY29kZXJzL2luZGV4Jyk7XG4iLCJ2YXIgaW5oZXJpdHMgPSByZXF1aXJlKCd1dGlsJykuaW5oZXJpdHM7XG52YXIgUmVwb3J0ZXIgPSByZXF1aXJlKCcuLi9iYXNlJykuUmVwb3J0ZXI7XG52YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xuXG5mdW5jdGlvbiBEZWNvZGVyQnVmZmVyKGJhc2UsIG9wdGlvbnMpIHtcbiAgUmVwb3J0ZXIuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYmFzZSkpIHtcbiAgICB0aGlzLmVycm9yKCdJbnB1dCBub3QgQnVmZmVyJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5iYXNlID0gYmFzZTtcbiAgdGhpcy5vZmZzZXQgPSAwO1xuICB0aGlzLmxlbmd0aCA9IGJhc2UubGVuZ3RoO1xufVxuaW5oZXJpdHMoRGVjb2RlckJ1ZmZlciwgUmVwb3J0ZXIpO1xuZXhwb3J0cy5EZWNvZGVyQnVmZmVyID0gRGVjb2RlckJ1ZmZlcjtcblxuRGVjb2RlckJ1ZmZlci5wcm90b3R5cGUuc2F2ZSA9IGZ1bmN0aW9uIHNhdmUoKSB7XG4gIHJldHVybiB7IG9mZnNldDogdGhpcy5vZmZzZXQsIHJlcG9ydGVyOiBSZXBvcnRlci5wcm90b3R5cGUuc2F2ZS5jYWxsKHRoaXMpIH07XG59O1xuXG5EZWNvZGVyQnVmZmVyLnByb3RvdHlwZS5yZXN0b3JlID0gZnVuY3Rpb24gcmVzdG9yZShzYXZlKSB7XG4gIC8vIFJldHVybiBza2lwcGVkIGRhdGFcbiAgdmFyIHJlcyA9IG5ldyBEZWNvZGVyQnVmZmVyKHRoaXMuYmFzZSk7XG4gIHJlcy5vZmZzZXQgPSBzYXZlLm9mZnNldDtcbiAgcmVzLmxlbmd0aCA9IHRoaXMub2Zmc2V0O1xuXG4gIHRoaXMub2Zmc2V0ID0gc2F2ZS5vZmZzZXQ7XG4gIFJlcG9ydGVyLnByb3RvdHlwZS5yZXN0b3JlLmNhbGwodGhpcywgc2F2ZS5yZXBvcnRlcik7XG5cbiAgcmV0dXJuIHJlcztcbn07XG5cbkRlY29kZXJCdWZmZXIucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbiBpc0VtcHR5KCkge1xuICByZXR1cm4gdGhpcy5vZmZzZXQgPT09IHRoaXMubGVuZ3RoO1xufTtcblxuRGVjb2RlckJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gcmVhZFVJbnQ4KGZhaWwpIHtcbiAgaWYgKHRoaXMub2Zmc2V0ICsgMSA8PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm4gdGhpcy5iYXNlLnJlYWRVSW50OCh0aGlzLm9mZnNldCsrLCB0cnVlKTtcbiAgZWxzZVxuICAgIHJldHVybiB0aGlzLmVycm9yKGZhaWwgfHwgJ0RlY29kZXJCdWZmZXIgb3ZlcnJ1bicpO1xufVxuXG5EZWNvZGVyQnVmZmVyLnByb3RvdHlwZS5za2lwID0gZnVuY3Rpb24gc2tpcChieXRlcywgZmFpbCkge1xuICBpZiAoISh0aGlzLm9mZnNldCArIGJ5dGVzIDw9IHRoaXMubGVuZ3RoKSlcbiAgICByZXR1cm4gdGhpcy5lcnJvcihmYWlsIHx8ICdEZWNvZGVyQnVmZmVyIG92ZXJydW4nKTtcblxuICB2YXIgcmVzID0gbmV3IERlY29kZXJCdWZmZXIodGhpcy5iYXNlKTtcblxuICAvLyBTaGFyZSByZXBvcnRlciBzdGF0ZVxuICByZXMuX3JlcG9ydGVyU3RhdGUgPSB0aGlzLl9yZXBvcnRlclN0YXRlO1xuXG4gIHJlcy5vZmZzZXQgPSB0aGlzLm9mZnNldDtcbiAgcmVzLmxlbmd0aCA9IHRoaXMub2Zmc2V0ICsgYnl0ZXM7XG4gIHRoaXMub2Zmc2V0ICs9IGJ5dGVzO1xuICByZXR1cm4gcmVzO1xufVxuXG5EZWNvZGVyQnVmZmVyLnByb3RvdHlwZS5yYXcgPSBmdW5jdGlvbiByYXcoc2F2ZSkge1xuICByZXR1cm4gdGhpcy5iYXNlLnNsaWNlKHNhdmUgPyBzYXZlLm9mZnNldCA6IHRoaXMub2Zmc2V0LCB0aGlzLmxlbmd0aCk7XG59XG5cbmZ1bmN0aW9uIEVuY29kZXJCdWZmZXIodmFsdWUsIHJlcG9ydGVyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIHRoaXMubGVuZ3RoID0gMDtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWUubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIGlmICghKGl0ZW0gaW5zdGFuY2VvZiBFbmNvZGVyQnVmZmVyKSlcbiAgICAgICAgaXRlbSA9IG5ldyBFbmNvZGVyQnVmZmVyKGl0ZW0sIHJlcG9ydGVyKTtcbiAgICAgIHRoaXMubGVuZ3RoICs9IGl0ZW0ubGVuZ3RoO1xuICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfSwgdGhpcyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIGlmICghKDAgPD0gdmFsdWUgJiYgdmFsdWUgPD0gMHhmZikpXG4gICAgICByZXR1cm4gcmVwb3J0ZXIuZXJyb3IoJ25vbi1ieXRlIEVuY29kZXJCdWZmZXIgdmFsdWUnKTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5sZW5ndGggPSAxO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5sZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aCh2YWx1ZSk7XG4gIH0gZWxzZSBpZiAoQnVmZmVyLmlzQnVmZmVyKHZhbHVlKSkge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcmVwb3J0ZXIuZXJyb3IoJ1Vuc3VwcG9ydGVkIHR5cGU6ICcgKyB0eXBlb2YgdmFsdWUpO1xuICB9XG59XG5leHBvcnRzLkVuY29kZXJCdWZmZXIgPSBFbmNvZGVyQnVmZmVyO1xuXG5FbmNvZGVyQnVmZmVyLnByb3RvdHlwZS5qb2luID0gZnVuY3Rpb24gam9pbihvdXQsIG9mZnNldCkge1xuICBpZiAoIW91dClcbiAgICBvdXQgPSBuZXcgQnVmZmVyKHRoaXMubGVuZ3RoKTtcbiAgaWYgKCFvZmZzZXQpXG4gICAgb2Zmc2V0ID0gMDtcblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApXG4gICAgcmV0dXJuIG91dDtcblxuICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLnZhbHVlKSkge1xuICAgIHRoaXMudmFsdWUuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICBpdGVtLmpvaW4ob3V0LCBvZmZzZXQpO1xuICAgICAgb2Zmc2V0ICs9IGl0ZW0ubGVuZ3RoO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgdGhpcy52YWx1ZSA9PT0gJ251bWJlcicpXG4gICAgICBvdXRbb2Zmc2V0XSA9IHRoaXMudmFsdWU7XG4gICAgZWxzZSBpZiAodHlwZW9mIHRoaXMudmFsdWUgPT09ICdzdHJpbmcnKVxuICAgICAgb3V0LndyaXRlKHRoaXMudmFsdWUsIG9mZnNldCk7XG4gICAgZWxzZSBpZiAoQnVmZmVyLmlzQnVmZmVyKHRoaXMudmFsdWUpKVxuICAgICAgdGhpcy52YWx1ZS5jb3B5KG91dCwgb2Zmc2V0KTtcbiAgICBvZmZzZXQgKz0gdGhpcy5sZW5ndGg7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcbiIsInZhciBiYXNlID0gZXhwb3J0cztcblxuYmFzZS5SZXBvcnRlciA9IHJlcXVpcmUoJy4vcmVwb3J0ZXInKS5SZXBvcnRlcjtcbmJhc2UuRGVjb2RlckJ1ZmZlciA9IHJlcXVpcmUoJy4vYnVmZmVyJykuRGVjb2RlckJ1ZmZlcjtcbmJhc2UuRW5jb2RlckJ1ZmZlciA9IHJlcXVpcmUoJy4vYnVmZmVyJykuRW5jb2RlckJ1ZmZlcjtcbmJhc2UuTm9kZSA9IHJlcXVpcmUoJy4vbm9kZScpO1xuIiwidmFyIFJlcG9ydGVyID0gcmVxdWlyZSgnLi4vYmFzZScpLlJlcG9ydGVyO1xudmFyIEVuY29kZXJCdWZmZXIgPSByZXF1aXJlKCcuLi9iYXNlJykuRW5jb2RlckJ1ZmZlcjtcbi8vdmFyIGFzc2VydCA9IHJlcXVpcmUoJ2RvdWJsZS1jaGVjaycpLmFzc2VydDtcblxuLy8gU3VwcG9ydGVkIHRhZ3NcbnZhciB0YWdzID0gW1xuICAnc2VxJywgJ3NlcW9mJywgJ3NldCcsICdzZXRvZicsICdvY3RzdHInLCAnYml0c3RyJywgJ29iamlkJywgJ2Jvb2wnLFxuICAnZ2VudGltZScsICd1dGN0aW1lJywgJ251bGxfJywgJ2VudW0nLCAnaW50JywgJ2lhNXN0cicsICd1dGY4c3RyJ1xuXTtcblxuLy8gUHVibGljIG1ldGhvZHMgbGlzdFxudmFyIG1ldGhvZHMgPSBbXG4gICdrZXknLCAnb2JqJywgJ3VzZScsICdvcHRpb25hbCcsICdleHBsaWNpdCcsICdpbXBsaWNpdCcsICdkZWYnLCAnY2hvaWNlJyxcbiAgJ2FueSdcbl0uY29uY2F0KHRhZ3MpO1xuXG4vLyBPdmVycmlkZWQgbWV0aG9kcyBsaXN0XG52YXIgb3ZlcnJpZGVkID0gW1xuICAnX3BlZWtUYWcnLCAnX2RlY29kZVRhZycsICdfdXNlJyxcbiAgJ19kZWNvZGVTdHInLCAnX2RlY29kZU9iamlkJywgJ19kZWNvZGVUaW1lJyxcbiAgJ19kZWNvZGVOdWxsJywgJ19kZWNvZGVJbnQnLCAnX2RlY29kZUJvb2wnLCAnX2RlY29kZUxpc3QnLFxuXG4gICdfZW5jb2RlQ29tcG9zaXRlJywgJ19lbmNvZGVTdHInLCAnX2VuY29kZU9iamlkJywgJ19lbmNvZGVUaW1lJyxcbiAgJ19lbmNvZGVOdWxsJywgJ19lbmNvZGVJbnQnLCAnX2VuY29kZUJvb2wnXG5dO1xuXG5mdW5jdGlvbiBOb2RlKGVuYywgcGFyZW50KSB7XG4gIHZhciBzdGF0ZSA9IHt9O1xuICB0aGlzLl9iYXNlU3RhdGUgPSBzdGF0ZTtcblxuICBzdGF0ZS5lbmMgPSBlbmM7XG5cbiAgc3RhdGUucGFyZW50ID0gcGFyZW50IHx8IG51bGw7XG4gIHN0YXRlLmNoaWxkcmVuID0gbnVsbDtcblxuICAvLyBTdGF0ZVxuICBzdGF0ZS50YWcgPSBudWxsO1xuICBzdGF0ZS5hcmdzID0gbnVsbDtcbiAgc3RhdGUucmV2ZXJzZUFyZ3MgPSBudWxsO1xuICBzdGF0ZS5jaG9pY2UgPSBudWxsO1xuICBzdGF0ZS5vcHRpb25hbCA9IGZhbHNlO1xuICBzdGF0ZS5hbnkgPSBmYWxzZTtcbiAgc3RhdGUub2JqID0gZmFsc2U7XG4gIHN0YXRlLnVzZSA9IG51bGw7XG4gIHN0YXRlLnVzZURlY29kZXIgPSBudWxsO1xuICBzdGF0ZS5rZXkgPSBudWxsO1xuICBzdGF0ZVsnZGVmYXVsdCddID0gbnVsbDtcbiAgc3RhdGUuZXhwbGljaXQgPSBudWxsO1xuICBzdGF0ZS5pbXBsaWNpdCA9IG51bGw7XG5cbiAgLy8gU2hvdWxkIGNyZWF0ZSBuZXcgaW5zdGFuY2Ugb24gZWFjaCBtZXRob2RcbiAgaWYgKCFzdGF0ZS5wYXJlbnQpIHtcbiAgICBzdGF0ZS5jaGlsZHJlbiA9IFtdO1xuICAgIHRoaXMuX3dyYXAoKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBOb2RlO1xuXG52YXIgc3RhdGVQcm9wcyA9IFtcbiAgJ2VuYycsICdwYXJlbnQnLCAnY2hpbGRyZW4nLCAndGFnJywgJ2FyZ3MnLCAncmV2ZXJzZUFyZ3MnLCAnY2hvaWNlJyxcbiAgJ29wdGlvbmFsJywgJ2FueScsICdvYmonLCAndXNlJywgJ2FsdGVyZWRVc2UnLCAna2V5JywgJ2RlZmF1bHQnLCAnZXhwbGljaXQnLFxuICAnaW1wbGljaXQnXG5dO1xuXG5Ob2RlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uIGNsb25lKCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG4gIHZhciBjc3RhdGUgPSB7fTtcbiAgc3RhdGVQcm9wcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHtcbiAgICBjc3RhdGVbcHJvcF0gPSBzdGF0ZVtwcm9wXTtcbiAgfSk7XG4gIHZhciByZXMgPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvcihjc3RhdGUucGFyZW50KTtcbiAgcmVzLl9iYXNlU3RhdGUgPSBjc3RhdGU7XG4gIHJldHVybiByZXM7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5fd3JhcCA9IGZ1bmN0aW9uIHdyYXAoKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcbiAgbWV0aG9kcy5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIHRoaXNbbWV0aG9kXSA9IGZ1bmN0aW9uIF93cmFwcGVkTWV0aG9kKCkge1xuICAgICAgdmFyIGNsb25lID0gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcyk7XG4gICAgICBzdGF0ZS5jaGlsZHJlbi5wdXNoKGNsb25lKTtcbiAgICAgIHJldHVybiBjbG9uZVttZXRob2RdLmFwcGx5KGNsb25lLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH0sIHRoaXMpO1xufTtcblxuTm9kZS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbiBpbml0KGJvZHkpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gIC8vYXNzZXJ0LmVxdWFsKHN0YXRlLnBhcmVudCxudWxsLCdzdGF0ZS5wYXJlbnQgc2hvdWxkIGJlIG51bGwnKTtcbiAgYm9keS5jYWxsKHRoaXMpO1xuXG4gIC8vIEZpbHRlciBjaGlsZHJlblxuICBzdGF0ZS5jaGlsZHJlbiA9IHN0YXRlLmNoaWxkcmVuLmZpbHRlcihmdW5jdGlvbihjaGlsZCkge1xuICAgIHJldHVybiBjaGlsZC5fYmFzZVN0YXRlLnBhcmVudCA9PT0gdGhpcztcbiAgfSwgdGhpcyk7XG4gIC8vIGFzc2VydC5lcXVhbChzdGF0ZS5jaGlsZHJlbi5sZW5ndGgsIDEsICdSb290IG5vZGUgY2FuIGhhdmUgb25seSBvbmUgY2hpbGQnKTtcbn07XG5cbk5vZGUucHJvdG90eXBlLl91c2VBcmdzID0gZnVuY3Rpb24gdXNlQXJncyhhcmdzKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICAvLyBGaWx0ZXIgY2hpbGRyZW4gYW5kIGFyZ3NcbiAgdmFyIGNoaWxkcmVuID0gYXJncy5maWx0ZXIoZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGFyZyBpbnN0YW5jZW9mIHRoaXMuY29uc3RydWN0b3I7XG4gIH0sIHRoaXMpO1xuICBhcmdzID0gYXJncy5maWx0ZXIoZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuICEoYXJnIGluc3RhbmNlb2YgdGhpcy5jb25zdHJ1Y3Rvcik7XG4gIH0sIHRoaXMpO1xuXG4gIGlmIChjaGlsZHJlbi5sZW5ndGggIT09IDApIHtcbiAgICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUuY2hpbGRyZW4sIG51bGwsICdzdGF0ZS5jaGlsZHJlbiBzaG91bGQgYmUgbnVsbCcpO1xuICAgIHN0YXRlLmNoaWxkcmVuID0gY2hpbGRyZW47XG5cbiAgICAvLyBSZXBsYWNlIHBhcmVudCB0byBtYWludGFpbiBiYWNrd2FyZCBsaW5rXG4gICAgY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuICAgICAgY2hpbGQuX2Jhc2VTdGF0ZS5wYXJlbnQgPSB0aGlzO1xuICAgIH0sIHRoaXMpO1xuICB9XG4gIGlmIChhcmdzLmxlbmd0aCAhPT0gMCkge1xuICAgIC8vIGFzc2VydC5lcXVhbChzdGF0ZS5hcmdzLCBudWxsLCAnc3RhdGUuYXJncyBzaG91bGQgYmUgbnVsbCcpO1xuICAgIHN0YXRlLmFyZ3MgPSBhcmdzO1xuICAgIHN0YXRlLnJldmVyc2VBcmdzID0gYXJncy5tYXAoZnVuY3Rpb24oYXJnKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ29iamVjdCcgfHwgYXJnLmNvbnN0cnVjdG9yICE9PSBPYmplY3QpXG4gICAgICAgIHJldHVybiBhcmc7XG5cbiAgICAgIHZhciByZXMgPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKGFyZykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgaWYgKGtleSA9PSAoa2V5IHwgMCkpXG4gICAgICAgICAga2V5IHw9IDA7XG4gICAgICAgIHZhciB2YWx1ZSA9IGFyZ1trZXldO1xuICAgICAgICByZXNbdmFsdWVdID0ga2V5O1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xuICB9XG59O1xuXG4vL1xuLy8gT3ZlcnJpZGVkIG1ldGhvZHNcbi8vXG5cbm92ZXJyaWRlZC5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICBOb2RlLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24gX292ZXJyaWRlZCgpIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1ldGhvZCArICcgbm90IGltcGxlbWVudGVkIGZvciBlbmNvZGluZzogJyArIHN0YXRlLmVuYyk7XG4gIH07XG59KTtcblxuLy9cbi8vIFB1YmxpYyBtZXRob2RzXG4vL1xuXG50YWdzLmZvckVhY2goZnVuY3Rpb24odGFnKSB7XG4gIE5vZGUucHJvdG90eXBlW3RhZ10gPSBmdW5jdGlvbiBfdGFnTWV0aG9kKCkge1xuICAgIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cbiAgICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUudGFnLCBudWxsLCAnc3RhdGUudGFnIHNob3VsZCBiZSBudWxsJyk7XG4gICAgc3RhdGUudGFnID0gdGFnO1xuXG4gICAgdGhpcy5fdXNlQXJncyhhcmdzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xufSk7XG5cbk5vZGUucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShpdGVtKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUudXNlLCBudWxsLCAnc3RhdGUudXNlIHNob3VsZCBiZSBudWxsJyk7XG4gIHN0YXRlLnVzZSA9IGl0ZW07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5vcHRpb25hbCA9IGZ1bmN0aW9uIG9wdGlvbmFsKCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgc3RhdGUub3B0aW9uYWwgPSB0cnVlO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuTm9kZS5wcm90b3R5cGUuZGVmID0gZnVuY3Rpb24gZGVmKHZhbCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlWydkZWZhdWx0J10sIG51bGwsIFwic3RhdGVbJ2RlZmF1bHQnXSBzaG91bGQgYmUgbnVsbFwiKTtcbiAgc3RhdGVbJ2RlZmF1bHQnXSA9IHZhbDtcbiAgc3RhdGUub3B0aW9uYWwgPSB0cnVlO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuTm9kZS5wcm90b3R5cGUuZXhwbGljaXQgPSBmdW5jdGlvbiBleHBsaWNpdChudW0pIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gIC8vIGFzc2VydC5lcXVhbChzdGF0ZS5leHBsaWNpdCxudWxsLCAnc3RhdGUuZXhwbGljaXQgc2hvdWxkIGJlIG51bGwnKTtcbiAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlLmltcGxpY2l0LG51bGwsICdzdGF0ZS5pbXBsaWNpdCBzaG91bGQgYmUgbnVsbCcpO1xuXG4gIHN0YXRlLmV4cGxpY2l0ID0gbnVtO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuTm9kZS5wcm90b3R5cGUuaW1wbGljaXQgPSBmdW5jdGlvbiBpbXBsaWNpdChudW0pIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gICAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlLmV4cGxpY2l0LG51bGwsICdzdGF0ZS5leHBsaWNpdCBzaG91bGQgYmUgbnVsbCcpO1xuICAgIC8vIGFzc2VydC5lcXVhbChzdGF0ZS5pbXBsaWNpdCxudWxsLCAnc3RhdGUuaW1wbGljaXQgc2hvdWxkIGJlIG51bGwnKTtcblxuICAgIHN0YXRlLmltcGxpY2l0ID0gbnVtO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuTm9kZS5wcm90b3R5cGUub2JqID0gZnVuY3Rpb24gb2JqKCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblxuICBzdGF0ZS5vYmogPSB0cnVlO1xuXG4gIGlmIChhcmdzLmxlbmd0aCAhPT0gMClcbiAgICB0aGlzLl91c2VBcmdzKGFyZ3MpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuTm9kZS5wcm90b3R5cGUua2V5ID0gZnVuY3Rpb24ga2V5KG5ld0tleSkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlLmtleSwgbnVsbCwgJ3N0YXRlLmtleSBzaG91bGQgYmUgbnVsbCcpO1xuICBzdGF0ZS5rZXkgPSBuZXdLZXk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5hbnkgPSBmdW5jdGlvbiBhbnkoKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICBzdGF0ZS5hbnkgPSB0cnVlO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuTm9kZS5wcm90b3R5cGUuY2hvaWNlID0gZnVuY3Rpb24gY2hvaWNlKG9iaikge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlLmNob2ljZSwgbnVsbCwnc3RhdGUuY2hvaWNlIHNob3VsZCBiZSBudWxsJyk7XG4gIHN0YXRlLmNob2ljZSA9IG9iajtcbiAgdGhpcy5fdXNlQXJncyhPYmplY3Qua2V5cyhvYmopLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gb2JqW2tleV07XG4gIH0pKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBEZWNvZGluZ1xuLy9cblxuTm9kZS5wcm90b3R5cGUuX2RlY29kZSA9IGZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgLy8gRGVjb2RlIHJvb3Qgbm9kZVxuICBpZiAoc3RhdGUucGFyZW50ID09PSBudWxsKVxuICAgIHJldHVybiBpbnB1dC53cmFwUmVzdWx0KHN0YXRlLmNoaWxkcmVuWzBdLl9kZWNvZGUoaW5wdXQpKTtcblxuICB2YXIgcmVzdWx0ID0gc3RhdGVbJ2RlZmF1bHQnXTtcbiAgdmFyIHByZXNlbnQgPSB0cnVlO1xuXG4gIHZhciBwcmV2S2V5O1xuICBpZiAoc3RhdGUua2V5ICE9PSBudWxsKVxuICAgIHByZXZLZXkgPSBpbnB1dC5lbnRlcktleShzdGF0ZS5rZXkpO1xuXG4gIC8vIENoZWNrIGlmIHRhZyBpcyB0aGVyZVxuICBpZiAoc3RhdGUub3B0aW9uYWwpIHtcbiAgICB2YXIgdGFnID0gbnVsbDtcbiAgICBpZiAoc3RhdGUuZXhwbGljaXQgIT09IG51bGwpXG4gICAgICB0YWcgPSBzdGF0ZS5leHBsaWNpdDtcbiAgICBlbHNlIGlmIChzdGF0ZS5pbXBsaWNpdCAhPT0gbnVsbClcbiAgICAgIHRhZyA9IHN0YXRlLmltcGxpY2l0O1xuICAgIGVsc2UgaWYgKHN0YXRlLnRhZyAhPT0gbnVsbClcbiAgICAgIHRhZyA9IHN0YXRlLnRhZztcblxuICAgIGlmICh0YWcgPT09IG51bGwgJiYgIXN0YXRlLmFueSkge1xuICAgICAgLy8gVHJpYWwgYW5kIEVycm9yXG4gICAgICB2YXIgc2F2ZSA9IGlucHV0LnNhdmUoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChzdGF0ZS5jaG9pY2UgPT09IG51bGwpXG4gICAgICAgICAgdGhpcy5fZGVjb2RlR2VuZXJpYyhzdGF0ZS50YWcsIGlucHV0KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRoaXMuX2RlY29kZUNob2ljZShpbnB1dCk7XG4gICAgICAgIHByZXNlbnQgPSB0cnVlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBwcmVzZW50ID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpbnB1dC5yZXN0b3JlKHNhdmUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmVzZW50ID0gdGhpcy5fcGVla1RhZyhpbnB1dCwgdGFnLCBzdGF0ZS5hbnkpO1xuXG4gICAgICBpZiAoaW5wdXQuaXNFcnJvcihwcmVzZW50KSlcbiAgICAgICAgcmV0dXJuIHByZXNlbnQ7XG4gICAgfVxuICB9XG5cbiAgLy8gUHVzaCBvYmplY3Qgb24gc3RhY2tcbiAgdmFyIHByZXZPYmo7XG4gIGlmIChzdGF0ZS5vYmogJiYgcHJlc2VudClcbiAgICBwcmV2T2JqID0gaW5wdXQuZW50ZXJPYmplY3QoKTtcblxuICBpZiAocHJlc2VudCkge1xuICAgIC8vIFVud3JhcCBleHBsaWNpdCB2YWx1ZXNcbiAgICBpZiAoc3RhdGUuZXhwbGljaXQgIT09IG51bGwpIHtcbiAgICAgIHZhciBleHBsaWNpdCA9IHRoaXMuX2RlY29kZVRhZyhpbnB1dCwgc3RhdGUuZXhwbGljaXQpO1xuICAgICAgaWYgKGlucHV0LmlzRXJyb3IoZXhwbGljaXQpKVxuICAgICAgICByZXR1cm4gZXhwbGljaXQ7XG4gICAgICBpbnB1dCA9IGV4cGxpY2l0O1xuICAgIH1cblxuICAgIC8vIFVud3JhcCBpbXBsaWNpdCBhbmQgbm9ybWFsIHZhbHVlc1xuICAgIGlmIChzdGF0ZS51c2UgPT09IG51bGwgJiYgc3RhdGUuY2hvaWNlID09PSBudWxsKSB7XG4gICAgICBpZiAoc3RhdGUuYW55KVxuICAgICAgICB2YXIgc2F2ZSA9IGlucHV0LnNhdmUoKTtcbiAgICAgIHZhciBib2R5ID0gdGhpcy5fZGVjb2RlVGFnKFxuICAgICAgICBpbnB1dCxcbiAgICAgICAgc3RhdGUuaW1wbGljaXQgIT09IG51bGwgPyBzdGF0ZS5pbXBsaWNpdCA6IHN0YXRlLnRhZyxcbiAgICAgICAgc3RhdGUuYW55XG4gICAgICApO1xuICAgICAgaWYgKGlucHV0LmlzRXJyb3IoYm9keSkpXG4gICAgICAgIHJldHVybiBib2R5O1xuXG4gICAgICBpZiAoc3RhdGUuYW55KVxuICAgICAgICByZXN1bHQgPSBpbnB1dC5yYXcoc2F2ZSk7XG4gICAgICBlbHNlXG4gICAgICAgIGlucHV0ID0gYm9keTtcbiAgICB9XG5cbiAgICAvLyBTZWxlY3QgcHJvcGVyIG1ldGhvZCBmb3IgdGFnXG4gICAgaWYgKHN0YXRlLmFueSlcbiAgICAgIHJlc3VsdCA9IHJlc3VsdDtcbiAgICBlbHNlIGlmIChzdGF0ZS5jaG9pY2UgPT09IG51bGwpXG4gICAgICByZXN1bHQgPSB0aGlzLl9kZWNvZGVHZW5lcmljKHN0YXRlLnRhZywgaW5wdXQpO1xuICAgIGVsc2VcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2RlY29kZUNob2ljZShpbnB1dCk7XG5cbiAgICBpZiAoaW5wdXQuaXNFcnJvcihyZXN1bHQpKVxuICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgIC8vIERlY29kZSBjaGlsZHJlblxuICAgIGlmICghc3RhdGUuYW55ICYmIHN0YXRlLmNob2ljZSA9PT0gbnVsbCAmJiBzdGF0ZS5jaGlsZHJlbiAhPT0gbnVsbCkge1xuICAgICAgdmFyIGZhaWwgPSBzdGF0ZS5jaGlsZHJlbi5zb21lKGZ1bmN0aW9uIGRlY29kZUNoaWxkcmVuKGNoaWxkKSB7XG4gICAgICAgIC8vIE5PVEU6IFdlIGFyZSBpZ25vcmluZyBlcnJvcnMgaGVyZSwgdG8gbGV0IHBhcnNlciBjb250aW51ZSB3aXRoIG90aGVyXG4gICAgICAgIC8vIHBhcnRzIG9mIGVuY29kZWQgZGF0YVxuICAgICAgICBjaGlsZC5fZGVjb2RlKGlucHV0KTtcbiAgICAgIH0pO1xuICAgICAgaWYgKGZhaWwpXG4gICAgICAgIHJldHVybiBlcnI7XG4gICAgfVxuICB9XG5cbiAgLy8gUG9wIG9iamVjdFxuICBpZiAoc3RhdGUub2JqICYmIHByZXNlbnQpXG4gICAgcmVzdWx0ID0gaW5wdXQubGVhdmVPYmplY3QocHJldk9iaik7XG5cbiAgLy8gU2V0IGtleVxuICBpZiAoc3RhdGUua2V5ICE9PSBudWxsICYmIChyZXN1bHQgIT09IG51bGwgfHwgcHJlc2VudCA9PT0gdHJ1ZSkpXG4gICAgaW5wdXQubGVhdmVLZXkocHJldktleSwgc3RhdGUua2V5LCByZXN1bHQpO1xuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5fZGVjb2RlR2VuZXJpYyA9IGZ1bmN0aW9uIGRlY29kZUdlbmVyaWModGFnLCBpbnB1dCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgaWYgKHRhZyA9PT0gJ3NlcScgfHwgdGFnID09PSAnc2V0JylcbiAgICByZXR1cm4gbnVsbDtcbiAgaWYgKHRhZyA9PT0gJ3NlcW9mJyB8fCB0YWcgPT09ICdzZXRvZicpXG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZUxpc3QoaW5wdXQsIHRhZywgc3RhdGUuYXJnc1swXSk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ29jdHN0cicgfHwgdGFnID09PSAnYml0c3RyJylcbiAgICByZXR1cm4gdGhpcy5fZGVjb2RlU3RyKGlucHV0LCB0YWcpO1xuICBlbHNlIGlmICh0YWcgPT09ICdpYTVzdHInIHx8IHRhZyA9PT0gJ3V0ZjhzdHInKVxuICAgIHJldHVybiB0aGlzLl9kZWNvZGVTdHIoaW5wdXQsIHRhZyk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ29iamlkJyAmJiBzdGF0ZS5hcmdzKVxuICAgIHJldHVybiB0aGlzLl9kZWNvZGVPYmppZChpbnB1dCwgc3RhdGUuYXJnc1swXSwgc3RhdGUuYXJnc1sxXSk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ29iamlkJylcbiAgICByZXR1cm4gdGhpcy5fZGVjb2RlT2JqaWQoaW5wdXQsIG51bGwsIG51bGwpO1xuICBlbHNlIGlmICh0YWcgPT09ICdnZW50aW1lJyB8fCB0YWcgPT09ICd1dGN0aW1lJylcbiAgICByZXR1cm4gdGhpcy5fZGVjb2RlVGltZShpbnB1dCwgdGFnKTtcbiAgZWxzZSBpZiAodGFnID09PSAnbnVsbF8nKVxuICAgIHJldHVybiB0aGlzLl9kZWNvZGVOdWxsKGlucHV0KTtcbiAgZWxzZSBpZiAodGFnID09PSAnYm9vbCcpXG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZUJvb2woaW5wdXQpO1xuICBlbHNlIGlmICh0YWcgPT09ICdpbnQnIHx8IHRhZyA9PT0gJ2VudW0nKVxuICAgIHJldHVybiB0aGlzLl9kZWNvZGVJbnQoaW5wdXQsIHN0YXRlLmFyZ3MgJiYgc3RhdGUuYXJnc1swXSk7XG4gIGVsc2UgaWYgKHN0YXRlLnVzZSAhPT0gbnVsbClcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXNlKHN0YXRlLnVzZSwgaW5wdXQuX3JlcG9ydGVyU3RhdGUub2JqKS5fZGVjb2RlKGlucHV0KTtcbiAgZWxzZVxuICAgIHJldHVybiBpbnB1dC5lcnJvcigndW5rbm93biB0YWc6ICcgKyB0YWcpO1xuXG4gIHJldHVybiBudWxsO1xufTtcblxuTm9kZS5wcm90b3R5cGUuX2dldFVzZSA9IGZ1bmN0aW9uIF9nZXRVc2UoZW50aXR5LCBvYmopIHtcblxuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG4gIC8vIENyZWF0ZSBhbHRlcmVkIHVzZSBkZWNvZGVyIGlmIGltcGxpY2l0IGlzIHNldFxuICBzdGF0ZS51c2VEZWNvZGVyID0gdGhpcy5fdXNlKGVudGl0eSwgb2JqKTtcbiAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlLnVzZURlY29kZXIuX2Jhc2VTdGF0ZS5wYXJlbnQsIG51bGwsICdzdGF0ZS51c2VEZWNvZGVyLl9iYXNlU3RhdGUucGFyZW50IHNob3VsZCBiZSBudWxsJyk7XG4gIHN0YXRlLnVzZURlY29kZXIgPSBzdGF0ZS51c2VEZWNvZGVyLl9iYXNlU3RhdGUuY2hpbGRyZW5bMF07XG4gIGlmIChzdGF0ZS5pbXBsaWNpdCAhPT0gc3RhdGUudXNlRGVjb2Rlci5fYmFzZVN0YXRlLmltcGxpY2l0KSB7XG4gICAgc3RhdGUudXNlRGVjb2RlciA9IHN0YXRlLnVzZURlY29kZXIuY2xvbmUoKTtcbiAgICBzdGF0ZS51c2VEZWNvZGVyLl9iYXNlU3RhdGUuaW1wbGljaXQgPSBzdGF0ZS5pbXBsaWNpdDtcbiAgfVxuICByZXR1cm4gc3RhdGUudXNlRGVjb2Rlcjtcbn07XG5cbk5vZGUucHJvdG90eXBlLl9kZWNvZGVDaG9pY2UgPSBmdW5jdGlvbiBkZWNvZGVDaG9pY2UoaW5wdXQpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuICB2YXIgcmVzdWx0ID0gbnVsbDtcbiAgdmFyIG1hdGNoID0gZmFsc2U7XG5cbiAgT2JqZWN0LmtleXMoc3RhdGUuY2hvaWNlKS5zb21lKGZ1bmN0aW9uKGtleSkge1xuICAgIHZhciBzYXZlID0gaW5wdXQuc2F2ZSgpO1xuICAgIHZhciBub2RlID0gc3RhdGUuY2hvaWNlW2tleV07XG4gICAgdHJ5IHtcbiAgICAgIHZhciB2YWx1ZSA9IG5vZGUuX2RlY29kZShpbnB1dCk7XG4gICAgICBpZiAoaW5wdXQuaXNFcnJvcih2YWx1ZSkpXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgcmVzdWx0ID0geyB0eXBlOiBrZXksIHZhbHVlOiB2YWx1ZSB9O1xuICAgICAgbWF0Y2ggPSB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlucHV0LnJlc3RvcmUoc2F2ZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LCB0aGlzKTtcblxuICBpZiAoIW1hdGNoKVxuICAgIHJldHVybiBpbnB1dC5lcnJvcignQ2hvaWNlIG5vdCBtYXRjaGVkJyk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8vXG4vLyBFbmNvZGluZ1xuLy9cblxuTm9kZS5wcm90b3R5cGUuX2NyZWF0ZUVuY29kZXJCdWZmZXIgPSBmdW5jdGlvbiBjcmVhdGVFbmNvZGVyQnVmZmVyKGRhdGEpIHtcbiAgcmV0dXJuIG5ldyBFbmNvZGVyQnVmZmVyKGRhdGEsIHRoaXMucmVwb3J0ZXIpO1xufTtcblxuTm9kZS5wcm90b3R5cGUuX2VuY29kZSA9IGZ1bmN0aW9uIGVuY29kZShkYXRhLCByZXBvcnRlciwgcGFyZW50KSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcbiAgaWYgKHN0YXRlWydkZWZhdWx0J10gIT09IG51bGwgJiYgc3RhdGVbJ2RlZmF1bHQnXSA9PT0gZGF0YSlcbiAgICByZXR1cm47XG5cbiAgdmFyIHJlc3VsdCA9IHRoaXMuX2VuY29kZVZhbHVlKGRhdGEsIHJlcG9ydGVyLCBwYXJlbnQpO1xuICBpZiAocmVzdWx0ID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuO1xuXG4gIGlmICh0aGlzLl9za2lwRGVmYXVsdChyZXN1bHQsIHJlcG9ydGVyLCBwYXJlbnQpKVxuICAgIHJldHVybjtcblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuTm9kZS5wcm90b3R5cGUuX2VuY29kZVZhbHVlID0gZnVuY3Rpb24gZW5jb2RlKGRhdGEsIHJlcG9ydGVyLCBwYXJlbnQpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gIC8vIERlY29kZSByb290IG5vZGVcbiAgaWYgKHN0YXRlLnBhcmVudCA9PT0gbnVsbClcbiAgICByZXR1cm4gc3RhdGUuY2hpbGRyZW5bMF0uX2VuY29kZShkYXRhLCByZXBvcnRlciB8fCBuZXcgUmVwb3J0ZXIoKSk7XG5cbiAgdmFyIHJlc3VsdCA9IG51bGw7XG4gIHZhciBwcmVzZW50ID0gdHJ1ZTtcblxuICAvLyBTZXQgcmVwb3J0ZXIgdG8gc2hhcmUgaXQgd2l0aCBhIGNoaWxkIGNsYXNzXG4gIHRoaXMucmVwb3J0ZXIgPSByZXBvcnRlcjtcblxuICAvLyBDaGVjayBpZiBkYXRhIGlzIHRoZXJlXG4gIGlmIChzdGF0ZS5vcHRpb25hbCAmJiBkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoc3RhdGVbJ2RlZmF1bHQnXSAhPT0gbnVsbClcbiAgICAgIGRhdGEgPSBzdGF0ZVsnZGVmYXVsdCddXG4gICAgZWxzZVxuICAgICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yIGVycm9yIHJlcG9ydGluZ1xuICB2YXIgcHJldktleTtcblxuICAvLyBFbmNvZGUgY2hpbGRyZW4gZmlyc3RcbiAgdmFyIGNvbnRlbnQgPSBudWxsO1xuICB2YXIgcHJpbWl0aXZlID0gZmFsc2U7XG4gIGlmIChzdGF0ZS5hbnkpIHtcbiAgICAvLyBBbnl0aGluZyB0aGF0IHdhcyBnaXZlbiBpcyB0cmFuc2xhdGVkIHRvIGJ1ZmZlclxuICAgIHJlc3VsdCA9IHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIoZGF0YSk7XG4gIH0gZWxzZSBpZiAoc3RhdGUuY2hvaWNlKSB7XG4gICAgcmVzdWx0ID0gdGhpcy5fZW5jb2RlQ2hvaWNlKGRhdGEsIHJlcG9ydGVyKTtcbiAgfSBlbHNlIGlmIChzdGF0ZS5jaGlsZHJlbikge1xuICAgIGNvbnRlbnQgPSBzdGF0ZS5jaGlsZHJlbi5tYXAoZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgIGlmIChjaGlsZC5fYmFzZVN0YXRlLnRhZyA9PT0gJ251bGxfJylcbiAgICAgICAgcmV0dXJuIGNoaWxkLl9lbmNvZGUobnVsbCwgcmVwb3J0ZXIsIGRhdGEpO1xuXG4gICAgICBpZiAoY2hpbGQuX2Jhc2VTdGF0ZS5rZXkgPT09IG51bGwpXG4gICAgICAgIHJldHVybiByZXBvcnRlci5lcnJvcignQ2hpbGQgc2hvdWxkIGhhdmUgYSBrZXknKTtcbiAgICAgIHZhciBwcmV2S2V5ID0gcmVwb3J0ZXIuZW50ZXJLZXkoY2hpbGQuX2Jhc2VTdGF0ZS5rZXkpO1xuXG4gICAgICBpZiAodHlwZW9mIGRhdGEgIT09ICdvYmplY3QnKVxuICAgICAgICByZXR1cm4gcmVwb3J0ZXIuZXJyb3IoJ0NoaWxkIGV4cGVjdGVkLCBidXQgaW5wdXQgaXMgbm90IG9iamVjdCcpO1xuXG4gICAgICB2YXIgcmVzID0gY2hpbGQuX2VuY29kZShkYXRhW2NoaWxkLl9iYXNlU3RhdGUua2V5XSwgcmVwb3J0ZXIsIGRhdGEpO1xuICAgICAgcmVwb3J0ZXIubGVhdmVLZXkocHJldktleSk7XG5cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSwgdGhpcykuZmlsdGVyKGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICByZXR1cm4gY2hpbGQ7XG4gICAgfSk7XG5cbiAgICBjb250ZW50ID0gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihjb250ZW50KTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoc3RhdGUudGFnID09PSAnc2Vxb2YnIHx8IHN0YXRlLnRhZyA9PT0gJ3NldG9mJykge1xuICAgICAgLy8gVE9ETyhpbmR1dG55KTogdGhpcyBzaG91bGQgYmUgdGhyb3duIG9uIERTTCBsZXZlbFxuICAgICAgaWYgKCEoc3RhdGUuYXJncyAmJiBzdGF0ZS5hcmdzLmxlbmd0aCA9PT0gMSkpXG4gICAgICAgIHJldHVybiByZXBvcnRlci5lcnJvcignVG9vIG1hbnkgYXJncyBmb3IgOiAnICsgc3RhdGUudGFnKTtcblxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGRhdGEpKVxuICAgICAgICByZXR1cm4gcmVwb3J0ZXIuZXJyb3IoJ3NlcW9mL3NldG9mLCBidXQgZGF0YSBpcyBub3QgQXJyYXknKTtcblxuICAgICAgdmFyIGNoaWxkID0gdGhpcy5jbG9uZSgpO1xuICAgICAgY2hpbGQuX2Jhc2VTdGF0ZS5pbXBsaWNpdCA9IG51bGw7XG4gICAgICBjb250ZW50ID0gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihkYXRhLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0VXNlKHN0YXRlLmFyZ3NbMF0sIGRhdGEpLl9lbmNvZGUoaXRlbSwgcmVwb3J0ZXIpO1xuICAgICAgfSwgY2hpbGQpKTtcbiAgICB9IGVsc2UgaWYgKHN0YXRlLnVzZSAhPT0gbnVsbCkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5fZ2V0VXNlKHN0YXRlLnVzZSwgcGFyZW50KS5fZW5jb2RlKGRhdGEsIHJlcG9ydGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGVudCA9IHRoaXMuX2VuY29kZVByaW1pdGl2ZShzdGF0ZS50YWcsIGRhdGEpO1xuICAgICAgcHJpbWl0aXZlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvLyBFbmNvZGUgZGF0YSBpdHNlbGZcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKCFzdGF0ZS5hbnkgJiYgc3RhdGUuY2hvaWNlID09PSBudWxsKSB7XG4gICAgdmFyIHRhZyA9IHN0YXRlLmltcGxpY2l0ICE9PSBudWxsID8gc3RhdGUuaW1wbGljaXQgOiBzdGF0ZS50YWc7XG4gICAgdmFyIGNscyA9IHN0YXRlLmltcGxpY2l0ID09PSBudWxsID8gJ3VuaXZlcnNhbCcgOiAnY29udGV4dCc7XG5cbiAgICBpZiAodGFnID09PSBudWxsKSB7XG4gICAgICBpZiAoc3RhdGUudXNlID09PSBudWxsKVxuICAgICAgICByZXBvcnRlci5lcnJvcignVGFnIGNvdWxkIGJlIG9tbWl0ZWQgb25seSBmb3IgLnVzZSgpJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzdGF0ZS51c2UgPT09IG51bGwpXG4gICAgICAgIHJlc3VsdCA9IHRoaXMuX2VuY29kZUNvbXBvc2l0ZSh0YWcsIHByaW1pdGl2ZSwgY2xzLCBjb250ZW50KTtcbiAgICB9XG4gIH1cblxuICAvLyBXcmFwIGluIGV4cGxpY2l0XG4gIGlmIChzdGF0ZS5leHBsaWNpdCAhPT0gbnVsbClcbiAgICByZXN1bHQgPSB0aGlzLl9lbmNvZGVDb21wb3NpdGUoc3RhdGUuZXhwbGljaXQsIGZhbHNlLCAnY29udGV4dCcsIHJlc3VsdCk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbk5vZGUucHJvdG90eXBlLl9lbmNvZGVDaG9pY2UgPSBmdW5jdGlvbiBlbmNvZGVDaG9pY2UoZGF0YSwgcmVwb3J0ZXIpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gIHZhciBub2RlID0gc3RhdGUuY2hvaWNlW2RhdGEudHlwZV07XG4gIC8vIGlmICghbm9kZSkge1xuICAvLyAgIGFzc2VydChcbiAgLy8gICAgICAgZmFsc2UsXG4gIC8vICAgICAgIGRhdGEudHlwZSArICcgbm90IGZvdW5kIGluICcgK1xuICAvLyAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmtleXMoc3RhdGUuY2hvaWNlKSkpO1xuICAvLyB9XG4gIHJldHVybiBub2RlLl9lbmNvZGUoZGF0YS52YWx1ZSwgcmVwb3J0ZXIpO1xufTtcblxuTm9kZS5wcm90b3R5cGUuX2VuY29kZVByaW1pdGl2ZSA9IGZ1bmN0aW9uIGVuY29kZVByaW1pdGl2ZSh0YWcsIGRhdGEpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gIGlmICh0YWcgPT09ICdvY3RzdHInIHx8IHRhZyA9PT0gJ2JpdHN0cicgfHwgdGFnID09PSAnaWE1c3RyJylcbiAgICByZXR1cm4gdGhpcy5fZW5jb2RlU3RyKGRhdGEsIHRhZyk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ3V0ZjhzdHInKVxuICAgIHJldHVybiB0aGlzLl9lbmNvZGVTdHIoZGF0YSwgdGFnKTtcbiAgZWxzZSBpZiAodGFnID09PSAnb2JqaWQnICYmIHN0YXRlLmFyZ3MpXG4gICAgcmV0dXJuIHRoaXMuX2VuY29kZU9iamlkKGRhdGEsIHN0YXRlLnJldmVyc2VBcmdzWzBdLCBzdGF0ZS5hcmdzWzFdKTtcbiAgZWxzZSBpZiAodGFnID09PSAnb2JqaWQnKVxuICAgIHJldHVybiB0aGlzLl9lbmNvZGVPYmppZChkYXRhLCBudWxsLCBudWxsKTtcbiAgZWxzZSBpZiAodGFnID09PSAnZ2VudGltZScgfHwgdGFnID09PSAndXRjdGltZScpXG4gICAgcmV0dXJuIHRoaXMuX2VuY29kZVRpbWUoZGF0YSwgdGFnKTtcbiAgZWxzZSBpZiAodGFnID09PSAnbnVsbF8nKVxuICAgIHJldHVybiB0aGlzLl9lbmNvZGVOdWxsKCk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ2ludCcgfHwgdGFnID09PSAnZW51bScpXG4gICAgcmV0dXJuIHRoaXMuX2VuY29kZUludChkYXRhLCBzdGF0ZS5hcmdzICYmIHN0YXRlLnJldmVyc2VBcmdzWzBdKTtcbiAgZWxzZSBpZiAodGFnID09PSAnYm9vbCcpXG4gICAgcmV0dXJuIHRoaXMuX2VuY29kZUJvb2woZGF0YSk7XG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIHRhZzogJyArIHRhZyk7XG59O1xuIiwidmFyIGluaGVyaXRzID0gcmVxdWlyZSgndXRpbCcpLmluaGVyaXRzO1xuXG5mdW5jdGlvbiBSZXBvcnRlcihvcHRpb25zKSB7XG4gIHRoaXMuX3JlcG9ydGVyU3RhdGUgPSB7XG4gICAgb2JqOiBudWxsLFxuICAgIHBhdGg6IFtdLFxuICAgIG9wdGlvbnM6IG9wdGlvbnMgfHwge30sXG4gICAgZXJyb3JzOiBbXVxuICB9O1xufVxuZXhwb3J0cy5SZXBvcnRlciA9IFJlcG9ydGVyO1xuXG5SZXBvcnRlci5wcm90b3R5cGUuaXNFcnJvciA9IGZ1bmN0aW9uIGlzRXJyb3Iob2JqKSB7XG4gIHJldHVybiBvYmogaW5zdGFuY2VvZiBSZXBvcnRlckVycm9yO1xufTtcblxuUmVwb3J0ZXIucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbiBzYXZlKCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZXBvcnRlclN0YXRlO1xuXG4gIHJldHVybiB7IG9iajogc3RhdGUub2JqLCBwYXRoTGVuOiBzdGF0ZS5wYXRoLmxlbmd0aCB9O1xufTtcblxuUmVwb3J0ZXIucHJvdG90eXBlLnJlc3RvcmUgPSBmdW5jdGlvbiByZXN0b3JlKGRhdGEpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVwb3J0ZXJTdGF0ZTtcblxuICBzdGF0ZS5vYmogPSBkYXRhLm9iajtcbiAgc3RhdGUucGF0aCA9IHN0YXRlLnBhdGguc2xpY2UoMCwgZGF0YS5wYXRoTGVuKTtcbn07XG5cblJlcG9ydGVyLnByb3RvdHlwZS5lbnRlcktleSA9IGZ1bmN0aW9uIGVudGVyS2V5KGtleSkge1xuICByZXR1cm4gdGhpcy5fcmVwb3J0ZXJTdGF0ZS5wYXRoLnB1c2goa2V5KTtcbn07XG5cblJlcG9ydGVyLnByb3RvdHlwZS5sZWF2ZUtleSA9IGZ1bmN0aW9uIGxlYXZlS2V5KGluZGV4LCBrZXksIHZhbHVlKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlcG9ydGVyU3RhdGU7XG5cbiAgc3RhdGUucGF0aCA9IHN0YXRlLnBhdGguc2xpY2UoMCwgaW5kZXggLSAxKTtcbiAgaWYgKHN0YXRlLm9iaiAhPT0gbnVsbClcbiAgICBzdGF0ZS5vYmpba2V5XSA9IHZhbHVlO1xufTtcblxuUmVwb3J0ZXIucHJvdG90eXBlLmVudGVyT2JqZWN0ID0gZnVuY3Rpb24gZW50ZXJPYmplY3QoKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlcG9ydGVyU3RhdGU7XG5cbiAgdmFyIHByZXYgPSBzdGF0ZS5vYmo7XG4gIHN0YXRlLm9iaiA9IHt9O1xuICByZXR1cm4gcHJldjtcbn07XG5cblJlcG9ydGVyLnByb3RvdHlwZS5sZWF2ZU9iamVjdCA9IGZ1bmN0aW9uIGxlYXZlT2JqZWN0KHByZXYpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVwb3J0ZXJTdGF0ZTtcblxuICB2YXIgbm93ID0gc3RhdGUub2JqO1xuICBzdGF0ZS5vYmogPSBwcmV2O1xuICByZXR1cm4gbm93O1xufTtcblxuUmVwb3J0ZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24gZXJyb3IobXNnKSB7XG4gIHZhciBlcnI7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlcG9ydGVyU3RhdGU7XG5cbiAgdmFyIGluaGVyaXRlZCA9IG1zZyBpbnN0YW5jZW9mIFJlcG9ydGVyRXJyb3I7XG4gIGlmIChpbmhlcml0ZWQpIHtcbiAgICBlcnIgPSBtc2c7XG4gIH0gZWxzZSB7XG4gICAgZXJyID0gbmV3IFJlcG9ydGVyRXJyb3Ioc3RhdGUucGF0aC5tYXAoZnVuY3Rpb24oZWxlbSkge1xuICAgICAgcmV0dXJuICdbJyArIEpTT04uc3RyaW5naWZ5KGVsZW0pICsgJ10nO1xuICAgIH0pLmpvaW4oJycpLCBtc2cubWVzc2FnZSB8fCBtc2csIG1zZy5zdGFjayk7XG4gIH1cblxuICBpZiAoIXN0YXRlLm9wdGlvbnMucGFydGlhbClcbiAgICB0aHJvdyBlcnI7XG5cbiAgaWYgKCFpbmhlcml0ZWQpXG4gICAgc3RhdGUuZXJyb3JzLnB1c2goZXJyKTtcblxuICByZXR1cm4gZXJyO1xufTtcblxuUmVwb3J0ZXIucHJvdG90eXBlLndyYXBSZXN1bHQgPSBmdW5jdGlvbiB3cmFwUmVzdWx0KHJlc3VsdCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZXBvcnRlclN0YXRlO1xuICBpZiAoIXN0YXRlLm9wdGlvbnMucGFydGlhbClcbiAgICByZXR1cm4gcmVzdWx0O1xuXG4gIHJldHVybiB7XG4gICAgcmVzdWx0OiB0aGlzLmlzRXJyb3IocmVzdWx0KSA/IG51bGwgOiByZXN1bHQsXG4gICAgZXJyb3JzOiBzdGF0ZS5lcnJvcnNcbiAgfTtcbn07XG5cbmZ1bmN0aW9uIFJlcG9ydGVyRXJyb3IocGF0aCwgbXNnKSB7XG4gIHRoaXMucGF0aCA9IHBhdGg7XG4gIHRoaXMucmV0aHJvdyhtc2cpO1xufTtcbmluaGVyaXRzKFJlcG9ydGVyRXJyb3IsIEVycm9yKTtcblxuUmVwb3J0ZXJFcnJvci5wcm90b3R5cGUucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3cobXNnKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1zZyArICcgYXQ6ICcgKyAodGhpcy5wYXRoIHx8ICcoc2hhbGxvdyknKTtcbiAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgUmVwb3J0ZXJFcnJvcik7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwiKGZ1bmN0aW9uIChtb2R1bGUsIGV4cG9ydHMpIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBVdGlsc1xuXG5mdW5jdGlvbiBhc3NlcnQodmFsLCBtc2cpIHtcbiAgaWYgKCF2YWwpXG4gICAgdGhyb3cgbmV3IEVycm9yKG1zZyB8fCAnQXNzZXJ0aW9uIGZhaWxlZCcpO1xufVxuXG4vLyBDb3VsZCB1c2UgYGluaGVyaXRzYCBtb2R1bGUsIGJ1dCBkb24ndCB3YW50IHRvIG1vdmUgZnJvbSBzaW5nbGUgZmlsZVxuLy8gYXJjaGl0ZWN0dXJlIHlldC5cbmZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvcjtcbiAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge307XG4gIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGU7XG4gIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKCk7XG4gIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3Rvcjtcbn1cblxuLy8gQk5cblxuZnVuY3Rpb24gQk4obnVtYmVyLCBiYXNlLCBlbmRpYW4pIHtcbiAgLy8gTWF5IGJlIGBuZXcgQk4oYm4pYCA/XG4gIGlmIChudW1iZXIgIT09IG51bGwgJiZcbiAgICAgIHR5cGVvZiBudW1iZXIgPT09ICdvYmplY3QnICYmXG4gICAgICBBcnJheS5pc0FycmF5KG51bWJlci53b3JkcykpIHtcbiAgICByZXR1cm4gbnVtYmVyO1xuICB9XG5cbiAgdGhpcy5zaWduID0gZmFsc2U7XG4gIHRoaXMud29yZHMgPSBudWxsO1xuICB0aGlzLmxlbmd0aCA9IDA7XG5cbiAgLy8gUmVkdWN0aW9uIGNvbnRleHRcbiAgdGhpcy5yZWQgPSBudWxsO1xuXG4gIGlmIChiYXNlID09PSAnbGUnIHx8IGJhc2UgPT09ICdiZScpIHtcbiAgICBlbmRpYW4gPSBiYXNlO1xuICAgIGJhc2UgPSAxMDtcbiAgfVxuXG4gIGlmIChudW1iZXIgIT09IG51bGwpXG4gICAgdGhpcy5faW5pdChudW1iZXIgfHwgMCwgYmFzZSB8fCAxMCwgZW5kaWFuIHx8ICdiZScpO1xufVxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuICBtb2R1bGUuZXhwb3J0cyA9IEJOO1xuZWxzZVxuICBleHBvcnRzLkJOID0gQk47XG5cbkJOLkJOID0gQk47XG5CTi53b3JkU2l6ZSA9IDI2O1xuXG5CTi5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbiBpbml0KG51bWJlciwgYmFzZSwgZW5kaWFuKSB7XG4gIGlmICh0eXBlb2YgbnVtYmVyID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB0aGlzLl9pbml0TnVtYmVyKG51bWJlciwgYmFzZSwgZW5kaWFuKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgbnVtYmVyID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiB0aGlzLl9pbml0QXJyYXkobnVtYmVyLCBiYXNlLCBlbmRpYW4pO1xuICB9XG4gIGlmIChiYXNlID09PSAnaGV4JylcbiAgICBiYXNlID0gMTY7XG4gIGFzc2VydChiYXNlID09PSAoYmFzZSB8IDApICYmIGJhc2UgPj0gMiAmJiBiYXNlIDw9IDM2KTtcblxuICBudW1iZXIgPSBudW1iZXIudG9TdHJpbmcoKS5yZXBsYWNlKC9cXHMrL2csICcnKTtcbiAgdmFyIHN0YXJ0ID0gMDtcbiAgaWYgKG51bWJlclswXSA9PT0gJy0nKVxuICAgIHN0YXJ0Kys7XG5cbiAgaWYgKGJhc2UgPT09IDE2KVxuICAgIHRoaXMuX3BhcnNlSGV4KG51bWJlciwgc3RhcnQpO1xuICBlbHNlXG4gICAgdGhpcy5fcGFyc2VCYXNlKG51bWJlciwgYmFzZSwgc3RhcnQpO1xuXG4gIGlmIChudW1iZXJbMF0gPT09ICctJylcbiAgICB0aGlzLnNpZ24gPSB0cnVlO1xuXG4gIHRoaXMuc3RyaXAoKTtcblxuICBpZiAoZW5kaWFuICE9PSAnbGUnKVxuICAgIHJldHVybjtcblxuICB0aGlzLl9pbml0QXJyYXkodGhpcy50b0FycmF5KCksIGJhc2UsIGVuZGlhbik7XG59O1xuXG5CTi5wcm90b3R5cGUuX2luaXROdW1iZXIgPSBmdW5jdGlvbiBfaW5pdE51bWJlcihudW1iZXIsIGJhc2UsIGVuZGlhbikge1xuICBpZiAobnVtYmVyIDwgMCkge1xuICAgIHRoaXMuc2lnbiA9IHRydWU7XG4gICAgbnVtYmVyID0gLW51bWJlcjtcbiAgfVxuICBpZiAobnVtYmVyIDwgMHg0MDAwMDAwKSB7XG4gICAgdGhpcy53b3JkcyA9IFsgbnVtYmVyICYgMHgzZmZmZmZmIF07XG4gICAgdGhpcy5sZW5ndGggPSAxO1xuICB9IGVsc2UgaWYgKG51bWJlciA8IDB4MTAwMDAwMDAwMDAwMDApIHtcbiAgICB0aGlzLndvcmRzID0gW1xuICAgICAgbnVtYmVyICYgMHgzZmZmZmZmLFxuICAgICAgKG51bWJlciAvIDB4NDAwMDAwMCkgJiAweDNmZmZmZmZcbiAgICBdO1xuICAgIHRoaXMubGVuZ3RoID0gMjtcbiAgfSBlbHNlIHtcbiAgICBhc3NlcnQobnVtYmVyIDwgMHgyMDAwMDAwMDAwMDAwMCk7IC8vIDIgXiA1MyAodW5zYWZlKVxuICAgIHRoaXMud29yZHMgPSBbXG4gICAgICBudW1iZXIgJiAweDNmZmZmZmYsXG4gICAgICAobnVtYmVyIC8gMHg0MDAwMDAwKSAmIDB4M2ZmZmZmZixcbiAgICAgIDFcbiAgICBdO1xuICAgIHRoaXMubGVuZ3RoID0gMztcbiAgfVxuXG4gIGlmIChlbmRpYW4gIT09ICdsZScpXG4gICAgcmV0dXJuO1xuXG4gIC8vIFJldmVyc2UgdGhlIGJ5dGVzXG4gIHRoaXMuX2luaXRBcnJheSh0aGlzLnRvQXJyYXkoKSwgYmFzZSwgZW5kaWFuKTtcbn07XG5cbkJOLnByb3RvdHlwZS5faW5pdEFycmF5ID0gZnVuY3Rpb24gX2luaXRBcnJheShudW1iZXIsIGJhc2UsIGVuZGlhbikge1xuICAvLyBQZXJoYXBzIGEgVWludDhBcnJheVxuICBhc3NlcnQodHlwZW9mIG51bWJlci5sZW5ndGggPT09ICdudW1iZXInKTtcbiAgaWYgKG51bWJlci5sZW5ndGggPD0gMCkge1xuICAgIHRoaXMud29yZHMgPSBbIDAgXTtcbiAgICB0aGlzLmxlbmd0aCA9IDE7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0aGlzLmxlbmd0aCA9IE1hdGguY2VpbChudW1iZXIubGVuZ3RoIC8gMyk7XG4gIHRoaXMud29yZHMgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspXG4gICAgdGhpcy53b3Jkc1tpXSA9IDA7XG5cbiAgdmFyIG9mZiA9IDA7XG4gIGlmIChlbmRpYW4gPT09ICdiZScpIHtcbiAgICBmb3IgKHZhciBpID0gbnVtYmVyLmxlbmd0aCAtIDEsIGogPSAwOyBpID49IDA7IGkgLT0gMykge1xuICAgICAgdmFyIHcgPSBudW1iZXJbaV0gfCAobnVtYmVyW2kgLSAxXSA8PCA4KSB8IChudW1iZXJbaSAtIDJdIDw8IDE2KTtcbiAgICAgIHRoaXMud29yZHNbal0gfD0gKHcgPDwgb2ZmKSAmIDB4M2ZmZmZmZjtcbiAgICAgIHRoaXMud29yZHNbaiArIDFdID0gKHcgPj4+ICgyNiAtIG9mZikpICYgMHgzZmZmZmZmO1xuICAgICAgb2ZmICs9IDI0O1xuICAgICAgaWYgKG9mZiA+PSAyNikge1xuICAgICAgICBvZmYgLT0gMjY7XG4gICAgICAgIGorKztcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoZW5kaWFuID09PSAnbGUnKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGogPSAwOyBpIDwgbnVtYmVyLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICB2YXIgdyA9IG51bWJlcltpXSB8IChudW1iZXJbaSArIDFdIDw8IDgpIHwgKG51bWJlcltpICsgMl0gPDwgMTYpO1xuICAgICAgdGhpcy53b3Jkc1tqXSB8PSAodyA8PCBvZmYpICYgMHgzZmZmZmZmO1xuICAgICAgdGhpcy53b3Jkc1tqICsgMV0gPSAodyA+Pj4gKDI2IC0gb2ZmKSkgJiAweDNmZmZmZmY7XG4gICAgICBvZmYgKz0gMjQ7XG4gICAgICBpZiAob2ZmID49IDI2KSB7XG4gICAgICAgIG9mZiAtPSAyNjtcbiAgICAgICAgaisrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcy5zdHJpcCgpO1xufTtcblxuZnVuY3Rpb24gcGFyc2VIZXgoc3RyLCBzdGFydCwgZW5kKSB7XG4gIHZhciByID0gMDtcbiAgdmFyIGxlbiA9IE1hdGgubWluKHN0ci5sZW5ndGgsIGVuZCk7XG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyIGMgPSBzdHIuY2hhckNvZGVBdChpKSAtIDQ4O1xuXG4gICAgciA8PD0gNDtcblxuICAgIC8vICdhJyAtICdmJ1xuICAgIGlmIChjID49IDQ5ICYmIGMgPD0gNTQpXG4gICAgICByIHw9IGMgLSA0OSArIDB4YTtcblxuICAgIC8vICdBJyAtICdGJ1xuICAgIGVsc2UgaWYgKGMgPj0gMTcgJiYgYyA8PSAyMilcbiAgICAgIHIgfD0gYyAtIDE3ICsgMHhhO1xuXG4gICAgLy8gJzAnIC0gJzknXG4gICAgZWxzZVxuICAgICAgciB8PSBjICYgMHhmO1xuICB9XG4gIHJldHVybiByO1xufVxuXG5CTi5wcm90b3R5cGUuX3BhcnNlSGV4ID0gZnVuY3Rpb24gX3BhcnNlSGV4KG51bWJlciwgc3RhcnQpIHtcbiAgLy8gQ3JlYXRlIHBvc3NpYmx5IGJpZ2dlciBhcnJheSB0byBlbnN1cmUgdGhhdCBpdCBmaXRzIHRoZSBudW1iZXJcbiAgdGhpcy5sZW5ndGggPSBNYXRoLmNlaWwoKG51bWJlci5sZW5ndGggLSBzdGFydCkgLyA2KTtcbiAgdGhpcy53b3JkcyA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKylcbiAgICB0aGlzLndvcmRzW2ldID0gMDtcblxuICAvLyBTY2FuIDI0LWJpdCBjaHVua3MgYW5kIGFkZCB0aGVtIHRvIHRoZSBudW1iZXJcbiAgdmFyIG9mZiA9IDA7XG4gIGZvciAodmFyIGkgPSBudW1iZXIubGVuZ3RoIC0gNiwgaiA9IDA7IGkgPj0gc3RhcnQ7IGkgLT0gNikge1xuICAgIHZhciB3ID0gcGFyc2VIZXgobnVtYmVyLCBpLCBpICsgNik7XG4gICAgdGhpcy53b3Jkc1tqXSB8PSAodyA8PCBvZmYpICYgMHgzZmZmZmZmO1xuICAgIHRoaXMud29yZHNbaiArIDFdIHw9IHcgPj4+ICgyNiAtIG9mZikgJiAweDNmZmZmZjtcbiAgICBvZmYgKz0gMjQ7XG4gICAgaWYgKG9mZiA+PSAyNikge1xuICAgICAgb2ZmIC09IDI2O1xuICAgICAgaisrO1xuICAgIH1cbiAgfVxuICBpZiAoaSArIDYgIT09IHN0YXJ0KSB7XG4gICAgdmFyIHcgPSBwYXJzZUhleChudW1iZXIsIHN0YXJ0LCBpICsgNik7XG4gICAgdGhpcy53b3Jkc1tqXSB8PSAodyA8PCBvZmYpICYgMHgzZmZmZmZmO1xuICAgIHRoaXMud29yZHNbaiArIDFdIHw9IHcgPj4+ICgyNiAtIG9mZikgJiAweDNmZmZmZjtcbiAgfVxuICB0aGlzLnN0cmlwKCk7XG59O1xuXG5mdW5jdGlvbiBwYXJzZUJhc2Uoc3RyLCBzdGFydCwgZW5kLCBtdWwpIHtcbiAgdmFyIHIgPSAwO1xuICB2YXIgbGVuID0gTWF0aC5taW4oc3RyLmxlbmd0aCwgZW5kKTtcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgbGVuOyBpKyspIHtcbiAgICB2YXIgYyA9IHN0ci5jaGFyQ29kZUF0KGkpIC0gNDg7XG5cbiAgICByICo9IG11bDtcblxuICAgIC8vICdhJ1xuICAgIGlmIChjID49IDQ5KVxuICAgICAgciArPSBjIC0gNDkgKyAweGE7XG5cbiAgICAvLyAnQSdcbiAgICBlbHNlIGlmIChjID49IDE3KVxuICAgICAgciArPSBjIC0gMTcgKyAweGE7XG5cbiAgICAvLyAnMCcgLSAnOSdcbiAgICBlbHNlXG4gICAgICByICs9IGM7XG4gIH1cbiAgcmV0dXJuIHI7XG59XG5cbkJOLnByb3RvdHlwZS5fcGFyc2VCYXNlID0gZnVuY3Rpb24gX3BhcnNlQmFzZShudW1iZXIsIGJhc2UsIHN0YXJ0KSB7XG4gIC8vIEluaXRpYWxpemUgYXMgemVyb1xuICB0aGlzLndvcmRzID0gWyAwIF07XG4gIHRoaXMubGVuZ3RoID0gMTtcblxuICAvLyBGaW5kIGxlbmd0aCBvZiBsaW1iIGluIGJhc2VcbiAgZm9yICh2YXIgbGltYkxlbiA9IDAsIGxpbWJQb3cgPSAxOyBsaW1iUG93IDw9IDB4M2ZmZmZmZjsgbGltYlBvdyAqPSBiYXNlKVxuICAgIGxpbWJMZW4rKztcbiAgbGltYkxlbi0tO1xuICBsaW1iUG93ID0gKGxpbWJQb3cgLyBiYXNlKSB8IDA7XG5cbiAgdmFyIHRvdGFsID0gbnVtYmVyLmxlbmd0aCAtIHN0YXJ0O1xuICB2YXIgbW9kID0gdG90YWwgJSBsaW1iTGVuO1xuICB2YXIgZW5kID0gTWF0aC5taW4odG90YWwsIHRvdGFsIC0gbW9kKSArIHN0YXJ0O1xuXG4gIHZhciB3b3JkID0gMDtcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IGxpbWJMZW4pIHtcbiAgICB3b3JkID0gcGFyc2VCYXNlKG51bWJlciwgaSwgaSArIGxpbWJMZW4sIGJhc2UpO1xuXG4gICAgdGhpcy5pbXVsbihsaW1iUG93KTtcbiAgICBpZiAodGhpcy53b3Jkc1swXSArIHdvcmQgPCAweDQwMDAwMDApXG4gICAgICB0aGlzLndvcmRzWzBdICs9IHdvcmQ7XG4gICAgZWxzZVxuICAgICAgdGhpcy5faWFkZG4od29yZCk7XG4gIH1cblxuICBpZiAobW9kICE9PSAwKSB7XG4gICAgdmFyIHBvdyA9IDE7XG4gICAgdmFyIHdvcmQgPSBwYXJzZUJhc2UobnVtYmVyLCBpLCBudW1iZXIubGVuZ3RoLCBiYXNlKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kOyBpKyspXG4gICAgICBwb3cgKj0gYmFzZTtcbiAgICB0aGlzLmltdWxuKHBvdyk7XG4gICAgaWYgKHRoaXMud29yZHNbMF0gKyB3b3JkIDwgMHg0MDAwMDAwKVxuICAgICAgdGhpcy53b3Jkc1swXSArPSB3b3JkO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuX2lhZGRuKHdvcmQpO1xuICB9XG59O1xuXG5CTi5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uIGNvcHkoZGVzdCkge1xuICBkZXN0LndvcmRzID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKVxuICAgIGRlc3Qud29yZHNbaV0gPSB0aGlzLndvcmRzW2ldO1xuICBkZXN0Lmxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICBkZXN0LnNpZ24gPSB0aGlzLnNpZ247XG4gIGRlc3QucmVkID0gdGhpcy5yZWQ7XG59O1xuXG5CTi5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiBjbG9uZSgpIHtcbiAgdmFyIHIgPSBuZXcgQk4obnVsbCk7XG4gIHRoaXMuY29weShyKTtcbiAgcmV0dXJuIHI7XG59O1xuXG4vLyBSZW1vdmUgbGVhZGluZyBgMGAgZnJvbSBgdGhpc2BcbkJOLnByb3RvdHlwZS5zdHJpcCA9IGZ1bmN0aW9uIHN0cmlwKCkge1xuICB3aGlsZSAodGhpcy5sZW5ndGggPiAxICYmIHRoaXMud29yZHNbdGhpcy5sZW5ndGggLSAxXSA9PT0gMClcbiAgICB0aGlzLmxlbmd0aC0tO1xuICByZXR1cm4gdGhpcy5fbm9ybVNpZ24oKTtcbn07XG5cbkJOLnByb3RvdHlwZS5fbm9ybVNpZ24gPSBmdW5jdGlvbiBfbm9ybVNpZ24oKSB7XG4gIC8vIC0wID0gMFxuICBpZiAodGhpcy5sZW5ndGggPT09IDEgJiYgdGhpcy53b3Jkc1swXSA9PT0gMClcbiAgICB0aGlzLnNpZ24gPSBmYWxzZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5CTi5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uIGluc3BlY3QoKSB7XG4gIHJldHVybiAodGhpcy5yZWQgPyAnPEJOLVI6ICcgOiAnPEJOOiAnKSArIHRoaXMudG9TdHJpbmcoMTYpICsgJz4nO1xufTtcblxuLypcblxudmFyIHplcm9zID0gW107XG52YXIgZ3JvdXBTaXplcyA9IFtdO1xudmFyIGdyb3VwQmFzZXMgPSBbXTtcblxudmFyIHMgPSAnJztcbnZhciBpID0gLTE7XG53aGlsZSAoKytpIDwgQk4ud29yZFNpemUpIHtcbiAgemVyb3NbaV0gPSBzO1xuICBzICs9ICcwJztcbn1cbmdyb3VwU2l6ZXNbMF0gPSAwO1xuZ3JvdXBTaXplc1sxXSA9IDA7XG5ncm91cEJhc2VzWzBdID0gMDtcbmdyb3VwQmFzZXNbMV0gPSAwO1xudmFyIGJhc2UgPSAyIC0gMTtcbndoaWxlICgrK2Jhc2UgPCAzNiArIDEpIHtcbiAgdmFyIGdyb3VwU2l6ZSA9IDA7XG4gIHZhciBncm91cEJhc2UgPSAxO1xuICB3aGlsZSAoZ3JvdXBCYXNlIDwgKDEgPDwgQk4ud29yZFNpemUpIC8gYmFzZSkge1xuICAgIGdyb3VwQmFzZSAqPSBiYXNlO1xuICAgIGdyb3VwU2l6ZSArPSAxO1xuICB9XG4gIGdyb3VwU2l6ZXNbYmFzZV0gPSBncm91cFNpemU7XG4gIGdyb3VwQmFzZXNbYmFzZV0gPSBncm91cEJhc2U7XG59XG5cbiovXG5cbnZhciB6ZXJvcyA9IFtcbiAgJycsXG4gICcwJyxcbiAgJzAwJyxcbiAgJzAwMCcsXG4gICcwMDAwJyxcbiAgJzAwMDAwJyxcbiAgJzAwMDAwMCcsXG4gICcwMDAwMDAwJyxcbiAgJzAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAwMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAwMDAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwMDAwMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwJyxcbiAgJzAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwJ1xuXTtcblxudmFyIGdyb3VwU2l6ZXMgPSBbXG4gIDAsIDAsXG4gIDI1LCAxNiwgMTIsIDExLCAxMCwgOSwgOCxcbiAgOCwgNywgNywgNywgNywgNiwgNixcbiAgNiwgNiwgNiwgNiwgNiwgNSwgNSxcbiAgNSwgNSwgNSwgNSwgNSwgNSwgNSxcbiAgNSwgNSwgNSwgNSwgNSwgNSwgNVxuXTtcblxudmFyIGdyb3VwQmFzZXMgPSBbXG4gIDAsIDAsXG4gIDMzNTU0NDMyLCA0MzA0NjcyMSwgMTY3NzcyMTYsIDQ4ODI4MTI1LCA2MDQ2NjE3NiwgNDAzNTM2MDcsIDE2Nzc3MjE2LFxuICA0MzA0NjcyMSwgMTAwMDAwMDAsIDE5NDg3MTcxLCAzNTgzMTgwOCwgNjI3NDg1MTcsIDc1Mjk1MzYsIDExMzkwNjI1LFxuICAxNjc3NzIxNiwgMjQxMzc1NjksIDM0MDEyMjI0LCA0NzA0NTg4MSwgNjQwMDAwMDAsIDQwODQxMDEsIDUxNTM2MzIsXG4gIDY0MzYzNDMsIDc5NjI2MjQsIDk3NjU2MjUsIDExODgxMzc2LCAxNDM0ODkwNywgMTcyMTAzNjgsIDIwNTExMTQ5LFxuICAyNDMwMDAwMCwgMjg2MjkxNTEsIDMzNTU0NDMyLCAzOTEzNTM5MywgNDU0MzU0MjQsIDUyNTIxODc1LCA2MDQ2NjE3NlxuXTtcblxuQk4ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoYmFzZSwgcGFkZGluZykge1xuICBiYXNlID0gYmFzZSB8fCAxMDtcbiAgaWYgKGJhc2UgPT09IDE2IHx8IGJhc2UgPT09ICdoZXgnKSB7XG4gICAgdmFyIG91dCA9ICcnO1xuICAgIHZhciBvZmYgPSAwO1xuICAgIHZhciBwYWRkaW5nID0gcGFkZGluZyB8IDAgfHwgMTtcbiAgICB2YXIgY2FycnkgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHcgPSB0aGlzLndvcmRzW2ldO1xuICAgICAgdmFyIHdvcmQgPSAoKCh3IDw8IG9mZikgfCBjYXJyeSkgJiAweGZmZmZmZikudG9TdHJpbmcoMTYpO1xuICAgICAgY2FycnkgPSAodyA+Pj4gKDI0IC0gb2ZmKSkgJiAweGZmZmZmZjtcbiAgICAgIGlmIChjYXJyeSAhPT0gMCB8fCBpICE9PSB0aGlzLmxlbmd0aCAtIDEpXG4gICAgICAgIG91dCA9IHplcm9zWzYgLSB3b3JkLmxlbmd0aF0gKyB3b3JkICsgb3V0O1xuICAgICAgZWxzZVxuICAgICAgICBvdXQgPSB3b3JkICsgb3V0O1xuICAgICAgb2ZmICs9IDI7XG4gICAgICBpZiAob2ZmID49IDI2KSB7XG4gICAgICAgIG9mZiAtPSAyNjtcbiAgICAgICAgaS0tO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY2FycnkgIT09IDApXG4gICAgICBvdXQgPSBjYXJyeS50b1N0cmluZygxNikgKyBvdXQ7XG4gICAgd2hpbGUgKG91dC5sZW5ndGggJSBwYWRkaW5nICE9PSAwKVxuICAgICAgb3V0ID0gJzAnICsgb3V0O1xuICAgIGlmICh0aGlzLnNpZ24pXG4gICAgICBvdXQgPSAnLScgKyBvdXQ7XG4gICAgcmV0dXJuIG91dDtcbiAgfSBlbHNlIGlmIChiYXNlID09PSAoYmFzZSB8IDApICYmIGJhc2UgPj0gMiAmJiBiYXNlIDw9IDM2KSB7XG4gICAgLy8gdmFyIGdyb3VwU2l6ZSA9IE1hdGguZmxvb3IoQk4ud29yZFNpemUgKiBNYXRoLkxOMiAvIE1hdGgubG9nKGJhc2UpKTtcbiAgICB2YXIgZ3JvdXBTaXplID0gZ3JvdXBTaXplc1tiYXNlXTtcbiAgICAvLyB2YXIgZ3JvdXBCYXNlID0gTWF0aC5wb3coYmFzZSwgZ3JvdXBTaXplKTtcbiAgICB2YXIgZ3JvdXBCYXNlID0gZ3JvdXBCYXNlc1tiYXNlXTtcbiAgICB2YXIgb3V0ID0gJyc7XG4gICAgdmFyIGMgPSB0aGlzLmNsb25lKCk7XG4gICAgYy5zaWduID0gZmFsc2U7XG4gICAgd2hpbGUgKGMuY21wbigwKSAhPT0gMCkge1xuICAgICAgdmFyIHIgPSBjLm1vZG4oZ3JvdXBCYXNlKS50b1N0cmluZyhiYXNlKTtcbiAgICAgIGMgPSBjLmlkaXZuKGdyb3VwQmFzZSk7XG5cbiAgICAgIGlmIChjLmNtcG4oMCkgIT09IDApXG4gICAgICAgIG91dCA9IHplcm9zW2dyb3VwU2l6ZSAtIHIubGVuZ3RoXSArIHIgKyBvdXQ7XG4gICAgICBlbHNlXG4gICAgICAgIG91dCA9IHIgKyBvdXQ7XG4gICAgfVxuICAgIGlmICh0aGlzLmNtcG4oMCkgPT09IDApXG4gICAgICBvdXQgPSAnMCcgKyBvdXQ7XG4gICAgaWYgKHRoaXMuc2lnbilcbiAgICAgIG91dCA9ICctJyArIG91dDtcbiAgICByZXR1cm4gb3V0O1xuICB9IGVsc2Uge1xuICAgIGFzc2VydChmYWxzZSwgJ0Jhc2Ugc2hvdWxkIGJlIGJldHdlZW4gMiBhbmQgMzYnKTtcbiAgfVxufTtcblxuQk4ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgcmV0dXJuIHRoaXMudG9TdHJpbmcoMTYpO1xufTtcblxuQk4ucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbiB0b0FycmF5KGVuZGlhbikge1xuICB0aGlzLnN0cmlwKCk7XG4gIHZhciByZXMgPSBuZXcgQXJyYXkodGhpcy5ieXRlTGVuZ3RoKCkpO1xuICByZXNbMF0gPSAwO1xuXG4gIHZhciBxID0gdGhpcy5jbG9uZSgpO1xuICBpZiAoZW5kaWFuICE9PSAnbGUnKSB7XG4gICAgLy8gQXNzdW1lIGJpZy1lbmRpYW5cbiAgICBmb3IgKHZhciBpID0gMDsgcS5jbXBuKDApICE9PSAwOyBpKyspIHtcbiAgICAgIHZhciBiID0gcS5hbmRsbigweGZmKTtcbiAgICAgIHEuaXNocm4oOCk7XG5cbiAgICAgIHJlc1tyZXMubGVuZ3RoIC0gaSAtIDFdID0gYjtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gQXNzdW1lIGxpdHRsZS1lbmRpYW5cbiAgICBmb3IgKHZhciBpID0gMDsgcS5jbXBuKDApICE9PSAwOyBpKyspIHtcbiAgICAgIHZhciBiID0gcS5hbmRsbigweGZmKTtcbiAgICAgIHEuaXNocm4oOCk7XG5cbiAgICAgIHJlc1tpXSA9IGI7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcztcbn07XG5cbmlmIChNYXRoLmNsejMyKSB7XG4gIEJOLnByb3RvdHlwZS5fY291bnRCaXRzID0gZnVuY3Rpb24gX2NvdW50Qml0cyh3KSB7XG4gICAgcmV0dXJuIDMyIC0gTWF0aC5jbHozMih3KTtcbiAgfTtcbn0gZWxzZSB7XG4gIEJOLnByb3RvdHlwZS5fY291bnRCaXRzID0gZnVuY3Rpb24gX2NvdW50Qml0cyh3KSB7XG4gICAgdmFyIHQgPSB3O1xuICAgIHZhciByID0gMDtcbiAgICBpZiAodCA+PSAweDEwMDApIHtcbiAgICAgIHIgKz0gMTM7XG4gICAgICB0ID4+Pj0gMTM7XG4gICAgfVxuICAgIGlmICh0ID49IDB4NDApIHtcbiAgICAgIHIgKz0gNztcbiAgICAgIHQgPj4+PSA3O1xuICAgIH1cbiAgICBpZiAodCA+PSAweDgpIHtcbiAgICAgIHIgKz0gNDtcbiAgICAgIHQgPj4+PSA0O1xuICAgIH1cbiAgICBpZiAodCA+PSAweDAyKSB7XG4gICAgICByICs9IDI7XG4gICAgICB0ID4+Pj0gMjtcbiAgICB9XG4gICAgcmV0dXJuIHIgKyB0O1xuICB9O1xufVxuXG5CTi5wcm90b3R5cGUuX3plcm9CaXRzID0gZnVuY3Rpb24gX3plcm9CaXRzKHcpIHtcbiAgLy8gU2hvcnQtY3V0XG4gIGlmICh3ID09PSAwKVxuICAgIHJldHVybiAyNjtcblxuICB2YXIgdCA9IHc7XG4gIHZhciByID0gMDtcbiAgaWYgKCh0ICYgMHgxZmZmKSA9PT0gMCkge1xuICAgIHIgKz0gMTM7XG4gICAgdCA+Pj49IDEzO1xuICB9XG4gIGlmICgodCAmIDB4N2YpID09PSAwKSB7XG4gICAgciArPSA3O1xuICAgIHQgPj4+PSA3O1xuICB9XG4gIGlmICgodCAmIDB4ZikgPT09IDApIHtcbiAgICByICs9IDQ7XG4gICAgdCA+Pj49IDQ7XG4gIH1cbiAgaWYgKCh0ICYgMHgzKSA9PT0gMCkge1xuICAgIHIgKz0gMjtcbiAgICB0ID4+Pj0gMjtcbiAgfVxuICBpZiAoKHQgJiAweDEpID09PSAwKVxuICAgIHIrKztcbiAgcmV0dXJuIHI7XG59O1xuXG4vLyBSZXR1cm4gbnVtYmVyIG9mIHVzZWQgYml0cyBpbiBhIEJOXG5CTi5wcm90b3R5cGUuYml0TGVuZ3RoID0gZnVuY3Rpb24gYml0TGVuZ3RoKCkge1xuICB2YXIgaGkgPSAwO1xuICB2YXIgdyA9IHRoaXMud29yZHNbdGhpcy5sZW5ndGggLSAxXTtcbiAgdmFyIGhpID0gdGhpcy5fY291bnRCaXRzKHcpO1xuICByZXR1cm4gKHRoaXMubGVuZ3RoIC0gMSkgKiAyNiArIGhpO1xufTtcblxuLy8gTnVtYmVyIG9mIHRyYWlsaW5nIHplcm8gYml0c1xuQk4ucHJvdG90eXBlLnplcm9CaXRzID0gZnVuY3Rpb24gemVyb0JpdHMoKSB7XG4gIGlmICh0aGlzLmNtcG4oMCkgPT09IDApXG4gICAgcmV0dXJuIDA7XG5cbiAgdmFyIHIgPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYiA9IHRoaXMuX3plcm9CaXRzKHRoaXMud29yZHNbaV0pO1xuICAgIHIgKz0gYjtcbiAgICBpZiAoYiAhPT0gMjYpXG4gICAgICBicmVhaztcbiAgfVxuICByZXR1cm4gcjtcbn07XG5cbkJOLnByb3RvdHlwZS5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gYnl0ZUxlbmd0aCgpIHtcbiAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLmJpdExlbmd0aCgpIC8gOCk7XG59O1xuXG4vLyBSZXR1cm4gbmVnYXRpdmUgY2xvbmUgb2YgYHRoaXNgXG5CTi5wcm90b3R5cGUubmVnID0gZnVuY3Rpb24gbmVnKCkge1xuICBpZiAodGhpcy5jbXBuKDApID09PSAwKVxuICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG5cbiAgdmFyIHIgPSB0aGlzLmNsb25lKCk7XG4gIHIuc2lnbiA9ICF0aGlzLnNpZ247XG4gIHJldHVybiByO1xufTtcblxuXG4vLyBPciBgbnVtYCB3aXRoIGB0aGlzYCBpbi1wbGFjZVxuQk4ucHJvdG90eXBlLmlvciA9IGZ1bmN0aW9uIGlvcihudW0pIHtcbiAgdGhpcy5zaWduID0gdGhpcy5zaWduIHx8IG51bS5zaWduO1xuXG4gIHdoaWxlICh0aGlzLmxlbmd0aCA8IG51bS5sZW5ndGgpXG4gICAgdGhpcy53b3Jkc1t0aGlzLmxlbmd0aCsrXSA9IDA7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0ubGVuZ3RoOyBpKyspXG4gICAgdGhpcy53b3Jkc1tpXSA9IHRoaXMud29yZHNbaV0gfCBudW0ud29yZHNbaV07XG5cbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcbn07XG5cblxuLy8gT3IgYG51bWAgd2l0aCBgdGhpc2BcbkJOLnByb3RvdHlwZS5vciA9IGZ1bmN0aW9uIG9yKG51bSkge1xuICBpZiAodGhpcy5sZW5ndGggPiBudW0ubGVuZ3RoKVxuICAgIHJldHVybiB0aGlzLmNsb25lKCkuaW9yKG51bSk7XG4gIGVsc2VcbiAgICByZXR1cm4gbnVtLmNsb25lKCkuaW9yKHRoaXMpO1xufTtcblxuXG4vLyBBbmQgYG51bWAgd2l0aCBgdGhpc2AgaW4tcGxhY2VcbkJOLnByb3RvdHlwZS5pYW5kID0gZnVuY3Rpb24gaWFuZChudW0pIHtcbiAgdGhpcy5zaWduID0gdGhpcy5zaWduICYmIG51bS5zaWduO1xuXG4gIC8vIGIgPSBtaW4tbGVuZ3RoKG51bSwgdGhpcylcbiAgdmFyIGI7XG4gIGlmICh0aGlzLmxlbmd0aCA+IG51bS5sZW5ndGgpXG4gICAgYiA9IG51bTtcbiAgZWxzZVxuICAgIGIgPSB0aGlzO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYi5sZW5ndGg7IGkrKylcbiAgICB0aGlzLndvcmRzW2ldID0gdGhpcy53b3Jkc1tpXSAmIG51bS53b3Jkc1tpXTtcblxuICB0aGlzLmxlbmd0aCA9IGIubGVuZ3RoO1xuXG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XG59O1xuXG5cbi8vIEFuZCBgbnVtYCB3aXRoIGB0aGlzYFxuQk4ucHJvdG90eXBlLmFuZCA9IGZ1bmN0aW9uIGFuZChudW0pIHtcbiAgaWYgKHRoaXMubGVuZ3RoID4gbnVtLmxlbmd0aClcbiAgICByZXR1cm4gdGhpcy5jbG9uZSgpLmlhbmQobnVtKTtcbiAgZWxzZVxuICAgIHJldHVybiBudW0uY2xvbmUoKS5pYW5kKHRoaXMpO1xufTtcblxuXG4vLyBYb3IgYG51bWAgd2l0aCBgdGhpc2AgaW4tcGxhY2VcbkJOLnByb3RvdHlwZS5peG9yID0gZnVuY3Rpb24gaXhvcihudW0pIHtcbiAgdGhpcy5zaWduID0gdGhpcy5zaWduIHx8IG51bS5zaWduO1xuXG4gIC8vIGEubGVuZ3RoID4gYi5sZW5ndGhcbiAgdmFyIGE7XG4gIHZhciBiO1xuICBpZiAodGhpcy5sZW5ndGggPiBudW0ubGVuZ3RoKSB7XG4gICAgYSA9IHRoaXM7XG4gICAgYiA9IG51bTtcbiAgfSBlbHNlIHtcbiAgICBhID0gbnVtO1xuICAgIGIgPSB0aGlzO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBiLmxlbmd0aDsgaSsrKVxuICAgIHRoaXMud29yZHNbaV0gPSBhLndvcmRzW2ldIF4gYi53b3Jkc1tpXTtcblxuICBpZiAodGhpcyAhPT0gYSlcbiAgICBmb3IgKDsgaSA8IGEubGVuZ3RoOyBpKyspXG4gICAgICB0aGlzLndvcmRzW2ldID0gYS53b3Jkc1tpXTtcblxuICB0aGlzLmxlbmd0aCA9IGEubGVuZ3RoO1xuXG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XG59O1xuXG5cbi8vIFhvciBgbnVtYCB3aXRoIGB0aGlzYFxuQk4ucHJvdG90eXBlLnhvciA9IGZ1bmN0aW9uIHhvcihudW0pIHtcbiAgaWYgKHRoaXMubGVuZ3RoID4gbnVtLmxlbmd0aClcbiAgICByZXR1cm4gdGhpcy5jbG9uZSgpLml4b3IobnVtKTtcbiAgZWxzZVxuICAgIHJldHVybiBudW0uY2xvbmUoKS5peG9yKHRoaXMpO1xufTtcblxuXG4vLyBTZXQgYGJpdGAgb2YgYHRoaXNgXG5CTi5wcm90b3R5cGUuc2V0biA9IGZ1bmN0aW9uIHNldG4oYml0LCB2YWwpIHtcbiAgYXNzZXJ0KHR5cGVvZiBiaXQgPT09ICdudW1iZXInICYmIGJpdCA+PSAwKTtcblxuICB2YXIgb2ZmID0gKGJpdCAvIDI2KSB8IDA7XG4gIHZhciB3Yml0ID0gYml0ICUgMjY7XG5cbiAgd2hpbGUgKHRoaXMubGVuZ3RoIDw9IG9mZilcbiAgICB0aGlzLndvcmRzW3RoaXMubGVuZ3RoKytdID0gMDtcblxuICBpZiAodmFsKVxuICAgIHRoaXMud29yZHNbb2ZmXSA9IHRoaXMud29yZHNbb2ZmXSB8ICgxIDw8IHdiaXQpO1xuICBlbHNlXG4gICAgdGhpcy53b3Jkc1tvZmZdID0gdGhpcy53b3Jkc1tvZmZdICYgfigxIDw8IHdiaXQpO1xuXG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XG59O1xuXG5cbi8vIEFkZCBgbnVtYCB0byBgdGhpc2AgaW4tcGxhY2VcbkJOLnByb3RvdHlwZS5pYWRkID0gZnVuY3Rpb24gaWFkZChudW0pIHtcbiAgLy8gbmVnYXRpdmUgKyBwb3NpdGl2ZVxuICBpZiAodGhpcy5zaWduICYmICFudW0uc2lnbikge1xuICAgIHRoaXMuc2lnbiA9IGZhbHNlO1xuICAgIHZhciByID0gdGhpcy5pc3ViKG51bSk7XG4gICAgdGhpcy5zaWduID0gIXRoaXMuc2lnbjtcbiAgICByZXR1cm4gdGhpcy5fbm9ybVNpZ24oKTtcblxuICAvLyBwb3NpdGl2ZSArIG5lZ2F0aXZlXG4gIH0gZWxzZSBpZiAoIXRoaXMuc2lnbiAmJiBudW0uc2lnbikge1xuICAgIG51bS5zaWduID0gZmFsc2U7XG4gICAgdmFyIHIgPSB0aGlzLmlzdWIobnVtKTtcbiAgICBudW0uc2lnbiA9IHRydWU7XG4gICAgcmV0dXJuIHIuX25vcm1TaWduKCk7XG4gIH1cblxuICAvLyBhLmxlbmd0aCA+IGIubGVuZ3RoXG4gIHZhciBhO1xuICB2YXIgYjtcbiAgaWYgKHRoaXMubGVuZ3RoID4gbnVtLmxlbmd0aCkge1xuICAgIGEgPSB0aGlzO1xuICAgIGIgPSBudW07XG4gIH0gZWxzZSB7XG4gICAgYSA9IG51bTtcbiAgICBiID0gdGhpcztcbiAgfVxuXG4gIHZhciBjYXJyeSA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYi5sZW5ndGg7IGkrKykge1xuICAgIHZhciByID0gYS53b3Jkc1tpXSArIGIud29yZHNbaV0gKyBjYXJyeTtcbiAgICB0aGlzLndvcmRzW2ldID0gciAmIDB4M2ZmZmZmZjtcbiAgICBjYXJyeSA9IHIgPj4+IDI2O1xuICB9XG4gIGZvciAoOyBjYXJyeSAhPT0gMCAmJiBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgIHZhciByID0gYS53b3Jkc1tpXSArIGNhcnJ5O1xuICAgIHRoaXMud29yZHNbaV0gPSByICYgMHgzZmZmZmZmO1xuICAgIGNhcnJ5ID0gciA+Pj4gMjY7XG4gIH1cblxuICB0aGlzLmxlbmd0aCA9IGEubGVuZ3RoO1xuICBpZiAoY2FycnkgIT09IDApIHtcbiAgICB0aGlzLndvcmRzW3RoaXMubGVuZ3RoXSA9IGNhcnJ5O1xuICAgIHRoaXMubGVuZ3RoKys7XG4gIC8vIENvcHkgdGhlIHJlc3Qgb2YgdGhlIHdvcmRzXG4gIH0gZWxzZSBpZiAoYSAhPT0gdGhpcykge1xuICAgIGZvciAoOyBpIDwgYS5sZW5ndGg7IGkrKylcbiAgICAgIHRoaXMud29yZHNbaV0gPSBhLndvcmRzW2ldO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBBZGQgYG51bWAgdG8gYHRoaXNgXG5CTi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkKG51bSkge1xuICBpZiAobnVtLnNpZ24gJiYgIXRoaXMuc2lnbikge1xuICAgIG51bS5zaWduID0gZmFsc2U7XG4gICAgdmFyIHJlcyA9IHRoaXMuc3ViKG51bSk7XG4gICAgbnVtLnNpZ24gPSB0cnVlO1xuICAgIHJldHVybiByZXM7XG4gIH0gZWxzZSBpZiAoIW51bS5zaWduICYmIHRoaXMuc2lnbikge1xuICAgIHRoaXMuc2lnbiA9IGZhbHNlO1xuICAgIHZhciByZXMgPSBudW0uc3ViKHRoaXMpO1xuICAgIHRoaXMuc2lnbiA9IHRydWU7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIGlmICh0aGlzLmxlbmd0aCA+IG51bS5sZW5ndGgpXG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pYWRkKG51bSk7XG4gIGVsc2VcbiAgICByZXR1cm4gbnVtLmNsb25lKCkuaWFkZCh0aGlzKTtcbn07XG5cbi8vIFN1YnRyYWN0IGBudW1gIGZyb20gYHRoaXNgIGluLXBsYWNlXG5CTi5wcm90b3R5cGUuaXN1YiA9IGZ1bmN0aW9uIGlzdWIobnVtKSB7XG4gIC8vIHRoaXMgLSAoLW51bSkgPSB0aGlzICsgbnVtXG4gIGlmIChudW0uc2lnbikge1xuICAgIG51bS5zaWduID0gZmFsc2U7XG4gICAgdmFyIHIgPSB0aGlzLmlhZGQobnVtKTtcbiAgICBudW0uc2lnbiA9IHRydWU7XG4gICAgcmV0dXJuIHIuX25vcm1TaWduKCk7XG5cbiAgLy8gLXRoaXMgLSBudW0gPSAtKHRoaXMgKyBudW0pXG4gIH0gZWxzZSBpZiAodGhpcy5zaWduKSB7XG4gICAgdGhpcy5zaWduID0gZmFsc2U7XG4gICAgdGhpcy5pYWRkKG51bSk7XG4gICAgdGhpcy5zaWduID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5fbm9ybVNpZ24oKTtcbiAgfVxuXG4gIC8vIEF0IHRoaXMgcG9pbnQgYm90aCBudW1iZXJzIGFyZSBwb3NpdGl2ZVxuICB2YXIgY21wID0gdGhpcy5jbXAobnVtKTtcblxuICAvLyBPcHRpbWl6YXRpb24gLSB6ZXJvaWZ5XG4gIGlmIChjbXAgPT09IDApIHtcbiAgICB0aGlzLnNpZ24gPSBmYWxzZTtcbiAgICB0aGlzLmxlbmd0aCA9IDE7XG4gICAgdGhpcy53b3Jkc1swXSA9IDA7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBhID4gYlxuICB2YXIgYTtcbiAgdmFyIGI7XG4gIGlmIChjbXAgPiAwKSB7XG4gICAgYSA9IHRoaXM7XG4gICAgYiA9IG51bTtcbiAgfSBlbHNlIHtcbiAgICBhID0gbnVtO1xuICAgIGIgPSB0aGlzO1xuICB9XG5cbiAgdmFyIGNhcnJ5ID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBiLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHIgPSBhLndvcmRzW2ldIC0gYi53b3Jkc1tpXSArIGNhcnJ5O1xuICAgIGNhcnJ5ID0gciA+PiAyNjtcbiAgICB0aGlzLndvcmRzW2ldID0gciAmIDB4M2ZmZmZmZjtcbiAgfVxuICBmb3IgKDsgY2FycnkgIT09IDAgJiYgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgciA9IGEud29yZHNbaV0gKyBjYXJyeTtcbiAgICBjYXJyeSA9IHIgPj4gMjY7XG4gICAgdGhpcy53b3Jkc1tpXSA9IHIgJiAweDNmZmZmZmY7XG4gIH1cblxuICAvLyBDb3B5IHJlc3Qgb2YgdGhlIHdvcmRzXG4gIGlmIChjYXJyeSA9PT0gMCAmJiBpIDwgYS5sZW5ndGggJiYgYSAhPT0gdGhpcylcbiAgICBmb3IgKDsgaSA8IGEubGVuZ3RoOyBpKyspXG4gICAgICB0aGlzLndvcmRzW2ldID0gYS53b3Jkc1tpXTtcbiAgdGhpcy5sZW5ndGggPSBNYXRoLm1heCh0aGlzLmxlbmd0aCwgaSk7XG5cbiAgaWYgKGEgIT09IHRoaXMpXG4gICAgdGhpcy5zaWduID0gdHJ1ZTtcblxuICByZXR1cm4gdGhpcy5zdHJpcCgpO1xufTtcblxuLy8gU3VidHJhY3QgYG51bWAgZnJvbSBgdGhpc2BcbkJOLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiBzdWIobnVtKSB7XG4gIHJldHVybiB0aGlzLmNsb25lKCkuaXN1YihudW0pO1xufTtcblxuLypcbi8vIE5PVEU6IFRoaXMgY291bGQgYmUgcG90ZW50aW9uYWxseSB1c2VkIHRvIGdlbmVyYXRlIGxvb3AtbGVzcyBtdWx0aXBsaWNhdGlvbnNcbmZ1bmN0aW9uIF9nZW5Db21iTXVsVG8oYWxlbiwgYmxlbikge1xuICB2YXIgbGVuID0gYWxlbiArIGJsZW4gLSAxO1xuICB2YXIgc3JjID0gW1xuICAgICd2YXIgYSA9IHRoaXMud29yZHMsIGIgPSBudW0ud29yZHMsIG8gPSBvdXQud29yZHMsIGMgPSAwLCB3LCAnICtcbiAgICAgICAgJ21hc2sgPSAweDNmZmZmZmYsIHNoaWZ0ID0gMHg0MDAwMDAwOycsXG4gICAgJ291dC5sZW5ndGggPSAnICsgbGVuICsgJzsnXG4gIF07XG4gIGZvciAodmFyIGsgPSAwOyBrIDwgbGVuOyBrKyspIHtcbiAgICB2YXIgbWluSiA9IE1hdGgubWF4KDAsIGsgLSBhbGVuICsgMSk7XG4gICAgdmFyIG1heEogPSBNYXRoLm1pbihrLCBibGVuIC0gMSk7XG5cbiAgICBmb3IgKHZhciBqID0gbWluSjsgaiA8PSBtYXhKOyBqKyspIHtcbiAgICAgIHZhciBpID0gayAtIGo7XG4gICAgICB2YXIgbXVsID0gJ2FbJyArIGkgKyAnXSAqIGJbJyArIGogKyAnXSc7XG5cbiAgICAgIGlmIChqID09PSBtaW5KKSB7XG4gICAgICAgIHNyYy5wdXNoKCd3ID0gJyArIG11bCArICcgKyBjOycpO1xuICAgICAgICBzcmMucHVzaCgnYyA9ICh3IC8gc2hpZnQpIHwgMDsnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNyYy5wdXNoKCd3ICs9ICcgKyBtdWwgKyAnOycpO1xuICAgICAgICBzcmMucHVzaCgnYyArPSAodyAvIHNoaWZ0KSB8IDA7Jyk7XG4gICAgICB9XG4gICAgICBzcmMucHVzaCgndyAmPSBtYXNrOycpO1xuICAgIH1cbiAgICBzcmMucHVzaCgnb1snICsgayArICddID0gdzsnKTtcbiAgfVxuICBzcmMucHVzaCgnaWYgKGMgIT09IDApIHsnLFxuICAgICAgICAgICAnICBvWycgKyBrICsgJ10gPSBjOycsXG4gICAgICAgICAgICcgIG91dC5sZW5ndGgrKzsnLFxuICAgICAgICAgICAnfScsXG4gICAgICAgICAgICdyZXR1cm4gb3V0OycpO1xuXG4gIHJldHVybiBzcmMuam9pbignXFxuJyk7XG59XG4qL1xuXG5CTi5wcm90b3R5cGUuX3NtYWxsTXVsVG8gPSBmdW5jdGlvbiBfc21hbGxNdWxUbyhudW0sIG91dCkge1xuICBvdXQuc2lnbiA9IG51bS5zaWduICE9PSB0aGlzLnNpZ247XG4gIG91dC5sZW5ndGggPSB0aGlzLmxlbmd0aCArIG51bS5sZW5ndGg7XG5cbiAgdmFyIGNhcnJ5ID0gMDtcbiAgZm9yICh2YXIgayA9IDA7IGsgPCBvdXQubGVuZ3RoIC0gMTsgaysrKSB7XG4gICAgLy8gU3VtIGFsbCB3b3JkcyB3aXRoIHRoZSBzYW1lIGBpICsgaiA9IGtgIGFuZCBhY2N1bXVsYXRlIGBuY2FycnlgLFxuICAgIC8vIG5vdGUgdGhhdCBuY2FycnkgY291bGQgYmUgPj0gMHgzZmZmZmZmXG4gICAgdmFyIG5jYXJyeSA9IGNhcnJ5ID4+PiAyNjtcbiAgICB2YXIgcndvcmQgPSBjYXJyeSAmIDB4M2ZmZmZmZjtcbiAgICB2YXIgbWF4SiA9IE1hdGgubWluKGssIG51bS5sZW5ndGggLSAxKTtcbiAgICBmb3IgKHZhciBqID0gTWF0aC5tYXgoMCwgayAtIHRoaXMubGVuZ3RoICsgMSk7IGogPD0gbWF4SjsgaisrKSB7XG4gICAgICB2YXIgaSA9IGsgLSBqO1xuICAgICAgdmFyIGEgPSB0aGlzLndvcmRzW2ldIHwgMDtcbiAgICAgIHZhciBiID0gbnVtLndvcmRzW2pdIHwgMDtcbiAgICAgIHZhciByID0gYSAqIGI7XG5cbiAgICAgIHZhciBsbyA9IHIgJiAweDNmZmZmZmY7XG4gICAgICBuY2FycnkgPSAobmNhcnJ5ICsgKChyIC8gMHg0MDAwMDAwKSB8IDApKSB8IDA7XG4gICAgICBsbyA9IChsbyArIHJ3b3JkKSB8IDA7XG4gICAgICByd29yZCA9IGxvICYgMHgzZmZmZmZmO1xuICAgICAgbmNhcnJ5ID0gKG5jYXJyeSArIChsbyA+Pj4gMjYpKSB8IDA7XG4gICAgfVxuICAgIG91dC53b3Jkc1trXSA9IHJ3b3JkO1xuICAgIGNhcnJ5ID0gbmNhcnJ5O1xuICB9XG4gIGlmIChjYXJyeSAhPT0gMCkge1xuICAgIG91dC53b3Jkc1trXSA9IGNhcnJ5O1xuICB9IGVsc2Uge1xuICAgIG91dC5sZW5ndGgtLTtcbiAgfVxuXG4gIHJldHVybiBvdXQuc3RyaXAoKTtcbn07XG5cbkJOLnByb3RvdHlwZS5fYmlnTXVsVG8gPSBmdW5jdGlvbiBfYmlnTXVsVG8obnVtLCBvdXQpIHtcbiAgb3V0LnNpZ24gPSBudW0uc2lnbiAhPT0gdGhpcy5zaWduO1xuICBvdXQubGVuZ3RoID0gdGhpcy5sZW5ndGggKyBudW0ubGVuZ3RoO1xuXG4gIHZhciBjYXJyeSA9IDA7XG4gIHZhciBobmNhcnJ5ID0gMDtcbiAgZm9yICh2YXIgayA9IDA7IGsgPCBvdXQubGVuZ3RoIC0gMTsgaysrKSB7XG4gICAgLy8gU3VtIGFsbCB3b3JkcyB3aXRoIHRoZSBzYW1lIGBpICsgaiA9IGtgIGFuZCBhY2N1bXVsYXRlIGBuY2FycnlgLFxuICAgIC8vIG5vdGUgdGhhdCBuY2FycnkgY291bGQgYmUgPj0gMHgzZmZmZmZmXG4gICAgdmFyIG5jYXJyeSA9IGhuY2Fycnk7XG4gICAgaG5jYXJyeSA9IDA7XG4gICAgdmFyIHJ3b3JkID0gY2FycnkgJiAweDNmZmZmZmY7XG4gICAgdmFyIG1heEogPSBNYXRoLm1pbihrLCBudW0ubGVuZ3RoIC0gMSk7XG4gICAgZm9yICh2YXIgaiA9IE1hdGgubWF4KDAsIGsgLSB0aGlzLmxlbmd0aCArIDEpOyBqIDw9IG1heEo7IGorKykge1xuICAgICAgdmFyIGkgPSBrIC0gajtcbiAgICAgIHZhciBhID0gdGhpcy53b3Jkc1tpXSB8IDA7XG4gICAgICB2YXIgYiA9IG51bS53b3Jkc1tqXSB8IDA7XG4gICAgICB2YXIgciA9IGEgKiBiO1xuXG4gICAgICB2YXIgbG8gPSByICYgMHgzZmZmZmZmO1xuICAgICAgbmNhcnJ5ID0gKG5jYXJyeSArICgociAvIDB4NDAwMDAwMCkgfCAwKSkgfCAwO1xuICAgICAgbG8gPSAobG8gKyByd29yZCkgfCAwO1xuICAgICAgcndvcmQgPSBsbyAmIDB4M2ZmZmZmZjtcbiAgICAgIG5jYXJyeSA9IChuY2FycnkgKyAobG8gPj4+IDI2KSkgfCAwO1xuXG4gICAgICBobmNhcnJ5ICs9IG5jYXJyeSA+Pj4gMjY7XG4gICAgICBuY2FycnkgJj0gMHgzZmZmZmZmO1xuICAgIH1cbiAgICBvdXQud29yZHNba10gPSByd29yZDtcbiAgICBjYXJyeSA9IG5jYXJyeTtcbiAgICBuY2FycnkgPSBobmNhcnJ5O1xuICB9XG4gIGlmIChjYXJyeSAhPT0gMCkge1xuICAgIG91dC53b3Jkc1trXSA9IGNhcnJ5O1xuICB9IGVsc2Uge1xuICAgIG91dC5sZW5ndGgtLTtcbiAgfVxuXG4gIHJldHVybiBvdXQuc3RyaXAoKTtcbn07XG5cbkJOLnByb3RvdHlwZS5tdWxUbyA9IGZ1bmN0aW9uIG11bFRvKG51bSwgb3V0KSB7XG4gIHZhciByZXM7XG4gIGlmICh0aGlzLmxlbmd0aCArIG51bS5sZW5ndGggPCA2MylcbiAgICByZXMgPSB0aGlzLl9zbWFsbE11bFRvKG51bSwgb3V0KTtcbiAgZWxzZVxuICAgIHJlcyA9IHRoaXMuX2JpZ011bFRvKG51bSwgb3V0KTtcbiAgcmV0dXJuIHJlcztcbn07XG5cbi8vIE11bHRpcGx5IGB0aGlzYCBieSBgbnVtYFxuQk4ucHJvdG90eXBlLm11bCA9IGZ1bmN0aW9uIG11bChudW0pIHtcbiAgdmFyIG91dCA9IG5ldyBCTihudWxsKTtcbiAgb3V0LndvcmRzID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoICsgbnVtLmxlbmd0aCk7XG4gIHJldHVybiB0aGlzLm11bFRvKG51bSwgb3V0KTtcbn07XG5cbi8vIEluLXBsYWNlIE11bHRpcGxpY2F0aW9uXG5CTi5wcm90b3R5cGUuaW11bCA9IGZ1bmN0aW9uIGltdWwobnVtKSB7XG4gIGlmICh0aGlzLmNtcG4oMCkgPT09IDAgfHwgbnVtLmNtcG4oMCkgPT09IDApIHtcbiAgICB0aGlzLndvcmRzWzBdID0gMDtcbiAgICB0aGlzLmxlbmd0aCA9IDE7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB2YXIgdGxlbiA9IHRoaXMubGVuZ3RoO1xuICB2YXIgbmxlbiA9IG51bS5sZW5ndGg7XG5cbiAgdGhpcy5zaWduID0gbnVtLnNpZ24gIT09IHRoaXMuc2lnbjtcbiAgdGhpcy5sZW5ndGggPSB0aGlzLmxlbmd0aCArIG51bS5sZW5ndGg7XG4gIHRoaXMud29yZHNbdGhpcy5sZW5ndGggLSAxXSA9IDA7XG5cbiAgZm9yICh2YXIgayA9IHRoaXMubGVuZ3RoIC0gMjsgayA+PSAwOyBrLS0pIHtcbiAgICAvLyBTdW0gYWxsIHdvcmRzIHdpdGggdGhlIHNhbWUgYGkgKyBqID0ga2AgYW5kIGFjY3VtdWxhdGUgYGNhcnJ5YCxcbiAgICAvLyBub3RlIHRoYXQgY2FycnkgY291bGQgYmUgPj0gMHgzZmZmZmZmXG4gICAgdmFyIGNhcnJ5ID0gMDtcbiAgICB2YXIgcndvcmQgPSAwO1xuICAgIHZhciBtYXhKID0gTWF0aC5taW4oaywgbmxlbiAtIDEpO1xuICAgIGZvciAodmFyIGogPSBNYXRoLm1heCgwLCBrIC0gdGxlbiArIDEpOyBqIDw9IG1heEo7IGorKykge1xuICAgICAgdmFyIGkgPSBrIC0gajtcbiAgICAgIHZhciBhID0gdGhpcy53b3Jkc1tpXTtcbiAgICAgIHZhciBiID0gbnVtLndvcmRzW2pdO1xuICAgICAgdmFyIHIgPSBhICogYjtcblxuICAgICAgdmFyIGxvID0gciAmIDB4M2ZmZmZmZjtcbiAgICAgIGNhcnJ5ICs9IChyIC8gMHg0MDAwMDAwKSB8IDA7XG4gICAgICBsbyArPSByd29yZDtcbiAgICAgIHJ3b3JkID0gbG8gJiAweDNmZmZmZmY7XG4gICAgICBjYXJyeSArPSBsbyA+Pj4gMjY7XG4gICAgfVxuICAgIHRoaXMud29yZHNba10gPSByd29yZDtcbiAgICB0aGlzLndvcmRzW2sgKyAxXSArPSBjYXJyeTtcbiAgICBjYXJyeSA9IDA7XG4gIH1cblxuICAvLyBQcm9wYWdhdGUgb3ZlcmZsb3dzXG4gIHZhciBjYXJyeSA9IDA7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB3ID0gdGhpcy53b3Jkc1tpXSArIGNhcnJ5O1xuICAgIHRoaXMud29yZHNbaV0gPSB3ICYgMHgzZmZmZmZmO1xuICAgIGNhcnJ5ID0gdyA+Pj4gMjY7XG4gIH1cblxuICByZXR1cm4gdGhpcy5zdHJpcCgpO1xufTtcblxuQk4ucHJvdG90eXBlLmltdWxuID0gZnVuY3Rpb24gaW11bG4obnVtKSB7XG4gIGFzc2VydCh0eXBlb2YgbnVtID09PSAnbnVtYmVyJyk7XG5cbiAgLy8gQ2FycnlcbiAgdmFyIGNhcnJ5ID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHcgPSB0aGlzLndvcmRzW2ldICogbnVtO1xuICAgIHZhciBsbyA9ICh3ICYgMHgzZmZmZmZmKSArIChjYXJyeSAmIDB4M2ZmZmZmZik7XG4gICAgY2FycnkgPj49IDI2O1xuICAgIGNhcnJ5ICs9ICh3IC8gMHg0MDAwMDAwKSB8IDA7XG4gICAgLy8gTk9URTogbG8gaXMgMjdiaXQgbWF4aW11bVxuICAgIGNhcnJ5ICs9IGxvID4+PiAyNjtcbiAgICB0aGlzLndvcmRzW2ldID0gbG8gJiAweDNmZmZmZmY7XG4gIH1cblxuICBpZiAoY2FycnkgIT09IDApIHtcbiAgICB0aGlzLndvcmRzW2ldID0gY2Fycnk7XG4gICAgdGhpcy5sZW5ndGgrKztcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuQk4ucHJvdG90eXBlLm11bG4gPSBmdW5jdGlvbiBtdWxuKG51bSkge1xuICByZXR1cm4gdGhpcy5jbG9uZSgpLmltdWxuKG51bSk7XG59O1xuXG4vLyBgdGhpc2AgKiBgdGhpc2BcbkJOLnByb3RvdHlwZS5zcXIgPSBmdW5jdGlvbiBzcXIoKSB7XG4gIHJldHVybiB0aGlzLm11bCh0aGlzKTtcbn07XG5cbi8vIGB0aGlzYCAqIGB0aGlzYCBpbi1wbGFjZVxuQk4ucHJvdG90eXBlLmlzcXIgPSBmdW5jdGlvbiBpc3FyKCkge1xuICByZXR1cm4gdGhpcy5tdWwodGhpcyk7XG59O1xuXG4vLyBTaGlmdC1sZWZ0IGluLXBsYWNlXG5CTi5wcm90b3R5cGUuaXNobG4gPSBmdW5jdGlvbiBpc2hsbihiaXRzKSB7XG4gIGFzc2VydCh0eXBlb2YgYml0cyA9PT0gJ251bWJlcicgJiYgYml0cyA+PSAwKTtcbiAgdmFyIHIgPSBiaXRzICUgMjY7XG4gIHZhciBzID0gKGJpdHMgLSByKSAvIDI2O1xuICB2YXIgY2FycnlNYXNrID0gKDB4M2ZmZmZmZiA+Pj4gKDI2IC0gcikpIDw8ICgyNiAtIHIpO1xuXG4gIGlmIChyICE9PSAwKSB7XG4gICAgdmFyIGNhcnJ5ID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBuZXdDYXJyeSA9IHRoaXMud29yZHNbaV0gJiBjYXJyeU1hc2s7XG4gICAgICB2YXIgYyA9ICh0aGlzLndvcmRzW2ldIC0gbmV3Q2FycnkpIDw8IHI7XG4gICAgICB0aGlzLndvcmRzW2ldID0gYyB8IGNhcnJ5O1xuICAgICAgY2FycnkgPSBuZXdDYXJyeSA+Pj4gKDI2IC0gcik7XG4gICAgfVxuICAgIGlmIChjYXJyeSkge1xuICAgICAgdGhpcy53b3Jkc1tpXSA9IGNhcnJ5O1xuICAgICAgdGhpcy5sZW5ndGgrKztcbiAgICB9XG4gIH1cblxuICBpZiAocyAhPT0gMCkge1xuICAgIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxuICAgICAgdGhpcy53b3Jkc1tpICsgc10gPSB0aGlzLndvcmRzW2ldO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgczsgaSsrKVxuICAgICAgdGhpcy53b3Jkc1tpXSA9IDA7XG4gICAgdGhpcy5sZW5ndGggKz0gcztcbiAgfVxuXG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XG59O1xuXG4vLyBTaGlmdC1yaWdodCBpbi1wbGFjZVxuLy8gTk9URTogYGhpbnRgIGlzIGEgbG93ZXN0IGJpdCBiZWZvcmUgdHJhaWxpbmcgemVyb2VzXG4vLyBOT1RFOiBpZiBgZXh0ZW5kZWRgIGlzIHByZXNlbnQgLSBpdCB3aWxsIGJlIGZpbGxlZCB3aXRoIGRlc3Ryb3llZCBiaXRzXG5CTi5wcm90b3R5cGUuaXNocm4gPSBmdW5jdGlvbiBpc2hybihiaXRzLCBoaW50LCBleHRlbmRlZCkge1xuICBhc3NlcnQodHlwZW9mIGJpdHMgPT09ICdudW1iZXInICYmIGJpdHMgPj0gMCk7XG4gIHZhciBoO1xuICBpZiAoaGludClcbiAgICBoID0gKGhpbnQgLSAoaGludCAlIDI2KSkgLyAyNjtcbiAgZWxzZVxuICAgIGggPSAwO1xuXG4gIHZhciByID0gYml0cyAlIDI2O1xuICB2YXIgcyA9IE1hdGgubWluKChiaXRzIC0gcikgLyAyNiwgdGhpcy5sZW5ndGgpO1xuICB2YXIgbWFzayA9IDB4M2ZmZmZmZiBeICgoMHgzZmZmZmZmID4+PiByKSA8PCByKTtcbiAgdmFyIG1hc2tlZFdvcmRzID0gZXh0ZW5kZWQ7XG5cbiAgaCAtPSBzO1xuICBoID0gTWF0aC5tYXgoMCwgaCk7XG5cbiAgLy8gRXh0ZW5kZWQgbW9kZSwgY29weSBtYXNrZWQgcGFydFxuICBpZiAobWFza2VkV29yZHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHM7IGkrKylcbiAgICAgIG1hc2tlZFdvcmRzLndvcmRzW2ldID0gdGhpcy53b3Jkc1tpXTtcbiAgICBtYXNrZWRXb3Jkcy5sZW5ndGggPSBzO1xuICB9XG5cbiAgaWYgKHMgPT09IDApIHtcbiAgICAvLyBOby1vcCwgd2Ugc2hvdWxkIG5vdCBtb3ZlIGFueXRoaW5nIGF0IGFsbFxuICB9IGVsc2UgaWYgKHRoaXMubGVuZ3RoID4gcykge1xuICAgIHRoaXMubGVuZ3RoIC09IHM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKVxuICAgICAgdGhpcy53b3Jkc1tpXSA9IHRoaXMud29yZHNbaSArIHNdO1xuICB9IGVsc2Uge1xuICAgIHRoaXMud29yZHNbMF0gPSAwO1xuICAgIHRoaXMubGVuZ3RoID0gMTtcbiAgfVxuXG4gIHZhciBjYXJyeSA9IDA7XG4gIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0gMCAmJiAoY2FycnkgIT09IDAgfHwgaSA+PSBoKTsgaS0tKSB7XG4gICAgdmFyIHdvcmQgPSB0aGlzLndvcmRzW2ldO1xuICAgIHRoaXMud29yZHNbaV0gPSAoY2FycnkgPDwgKDI2IC0gcikpIHwgKHdvcmQgPj4+IHIpO1xuICAgIGNhcnJ5ID0gd29yZCAmIG1hc2s7XG4gIH1cblxuICAvLyBQdXNoIGNhcnJpZWQgYml0cyBhcyBhIG1hc2tcbiAgaWYgKG1hc2tlZFdvcmRzICYmIGNhcnJ5ICE9PSAwKVxuICAgIG1hc2tlZFdvcmRzLndvcmRzW21hc2tlZFdvcmRzLmxlbmd0aCsrXSA9IGNhcnJ5O1xuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRoaXMud29yZHNbMF0gPSAwO1xuICAgIHRoaXMubGVuZ3RoID0gMTtcbiAgfVxuXG4gIHRoaXMuc3RyaXAoKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIFNoaWZ0LWxlZnRcbkJOLnByb3RvdHlwZS5zaGxuID0gZnVuY3Rpb24gc2hsbihiaXRzKSB7XG4gIHJldHVybiB0aGlzLmNsb25lKCkuaXNobG4oYml0cyk7XG59O1xuXG4vLyBTaGlmdC1yaWdodFxuQk4ucHJvdG90eXBlLnNocm4gPSBmdW5jdGlvbiBzaHJuKGJpdHMpIHtcbiAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pc2hybihiaXRzKTtcbn07XG5cbi8vIFRlc3QgaWYgbiBiaXQgaXMgc2V0XG5CTi5wcm90b3R5cGUudGVzdG4gPSBmdW5jdGlvbiB0ZXN0bihiaXQpIHtcbiAgYXNzZXJ0KHR5cGVvZiBiaXQgPT09ICdudW1iZXInICYmIGJpdCA+PSAwKTtcbiAgdmFyIHIgPSBiaXQgJSAyNjtcbiAgdmFyIHMgPSAoYml0IC0gcikgLyAyNjtcbiAgdmFyIHEgPSAxIDw8IHI7XG5cbiAgLy8gRmFzdCBjYXNlOiBiaXQgaXMgbXVjaCBoaWdoZXIgdGhhbiBhbGwgZXhpc3Rpbmcgd29yZHNcbiAgaWYgKHRoaXMubGVuZ3RoIDw9IHMpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDaGVjayBiaXQgYW5kIHJldHVyblxuICB2YXIgdyA9IHRoaXMud29yZHNbc107XG5cbiAgcmV0dXJuICEhKHcgJiBxKTtcbn07XG5cbi8vIFJldHVybiBvbmx5IGxvd2VycyBiaXRzIG9mIG51bWJlciAoaW4tcGxhY2UpXG5CTi5wcm90b3R5cGUuaW1hc2tuID0gZnVuY3Rpb24gaW1hc2tuKGJpdHMpIHtcbiAgYXNzZXJ0KHR5cGVvZiBiaXRzID09PSAnbnVtYmVyJyAmJiBiaXRzID49IDApO1xuICB2YXIgciA9IGJpdHMgJSAyNjtcbiAgdmFyIHMgPSAoYml0cyAtIHIpIC8gMjY7XG5cbiAgYXNzZXJ0KCF0aGlzLnNpZ24sICdpbWFza24gd29ya3Mgb25seSB3aXRoIHBvc2l0aXZlIG51bWJlcnMnKTtcblxuICBpZiAociAhPT0gMClcbiAgICBzKys7XG4gIHRoaXMubGVuZ3RoID0gTWF0aC5taW4ocywgdGhpcy5sZW5ndGgpO1xuXG4gIGlmIChyICE9PSAwKSB7XG4gICAgdmFyIG1hc2sgPSAweDNmZmZmZmYgXiAoKDB4M2ZmZmZmZiA+Pj4gcikgPDwgcik7XG4gICAgdGhpcy53b3Jkc1t0aGlzLmxlbmd0aCAtIDFdICY9IG1hc2s7XG4gIH1cblxuICByZXR1cm4gdGhpcy5zdHJpcCgpO1xufTtcblxuLy8gUmV0dXJuIG9ubHkgbG93ZXJzIGJpdHMgb2YgbnVtYmVyXG5CTi5wcm90b3R5cGUubWFza24gPSBmdW5jdGlvbiBtYXNrbihiaXRzKSB7XG4gIHJldHVybiB0aGlzLmNsb25lKCkuaW1hc2tuKGJpdHMpO1xufTtcblxuLy8gQWRkIHBsYWluIG51bWJlciBgbnVtYCB0byBgdGhpc2BcbkJOLnByb3RvdHlwZS5pYWRkbiA9IGZ1bmN0aW9uIGlhZGRuKG51bSkge1xuICBhc3NlcnQodHlwZW9mIG51bSA9PT0gJ251bWJlcicpO1xuICBpZiAobnVtIDwgMClcbiAgICByZXR1cm4gdGhpcy5pc3VibigtbnVtKTtcblxuICAvLyBQb3NzaWJsZSBzaWduIGNoYW5nZVxuICBpZiAodGhpcy5zaWduKSB7XG4gICAgaWYgKHRoaXMubGVuZ3RoID09PSAxICYmIHRoaXMud29yZHNbMF0gPCBudW0pIHtcbiAgICAgIHRoaXMud29yZHNbMF0gPSBudW0gLSB0aGlzLndvcmRzWzBdO1xuICAgICAgdGhpcy5zaWduID0gZmFsc2U7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLnNpZ24gPSBmYWxzZTtcbiAgICB0aGlzLmlzdWJuKG51bSk7XG4gICAgdGhpcy5zaWduID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIEFkZCB3aXRob3V0IGNoZWNrc1xuICByZXR1cm4gdGhpcy5faWFkZG4obnVtKTtcbn07XG5cbkJOLnByb3RvdHlwZS5faWFkZG4gPSBmdW5jdGlvbiBfaWFkZG4obnVtKSB7XG4gIHRoaXMud29yZHNbMF0gKz0gbnVtO1xuXG4gIC8vIENhcnJ5XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGggJiYgdGhpcy53b3Jkc1tpXSA+PSAweDQwMDAwMDA7IGkrKykge1xuICAgIHRoaXMud29yZHNbaV0gLT0gMHg0MDAwMDAwO1xuICAgIGlmIChpID09PSB0aGlzLmxlbmd0aCAtIDEpXG4gICAgICB0aGlzLndvcmRzW2kgKyAxXSA9IDE7XG4gICAgZWxzZVxuICAgICAgdGhpcy53b3Jkc1tpICsgMV0rKztcbiAgfVxuICB0aGlzLmxlbmd0aCA9IE1hdGgubWF4KHRoaXMubGVuZ3RoLCBpICsgMSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBTdWJ0cmFjdCBwbGFpbiBudW1iZXIgYG51bWAgZnJvbSBgdGhpc2BcbkJOLnByb3RvdHlwZS5pc3VibiA9IGZ1bmN0aW9uIGlzdWJuKG51bSkge1xuICBhc3NlcnQodHlwZW9mIG51bSA9PT0gJ251bWJlcicpO1xuICBpZiAobnVtIDwgMClcbiAgICByZXR1cm4gdGhpcy5pYWRkbigtbnVtKTtcblxuICBpZiAodGhpcy5zaWduKSB7XG4gICAgdGhpcy5zaWduID0gZmFsc2U7XG4gICAgdGhpcy5pYWRkbihudW0pO1xuICAgIHRoaXMuc2lnbiA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0aGlzLndvcmRzWzBdIC09IG51bTtcblxuICAvLyBDYXJyeVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoICYmIHRoaXMud29yZHNbaV0gPCAwOyBpKyspIHtcbiAgICB0aGlzLndvcmRzW2ldICs9IDB4NDAwMDAwMDtcbiAgICB0aGlzLndvcmRzW2kgKyAxXSAtPSAxO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcbn07XG5cbkJOLnByb3RvdHlwZS5hZGRuID0gZnVuY3Rpb24gYWRkbihudW0pIHtcbiAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pYWRkbihudW0pO1xufTtcblxuQk4ucHJvdG90eXBlLnN1Ym4gPSBmdW5jdGlvbiBzdWJuKG51bSkge1xuICByZXR1cm4gdGhpcy5jbG9uZSgpLmlzdWJuKG51bSk7XG59O1xuXG5CTi5wcm90b3R5cGUuaWFicyA9IGZ1bmN0aW9uIGlhYnMoKSB7XG4gIHRoaXMuc2lnbiA9IGZhbHNlO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuQk4ucHJvdG90eXBlLmFicyA9IGZ1bmN0aW9uIGFicygpIHtcbiAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pYWJzKCk7XG59O1xuXG5CTi5wcm90b3R5cGUuX2lzaGxuc3VibXVsID0gZnVuY3Rpb24gX2lzaGxuc3VibXVsKG51bSwgbXVsLCBzaGlmdCkge1xuICAvLyBCaWdnZXIgc3RvcmFnZSBpcyBuZWVkZWRcbiAgdmFyIGxlbiA9IG51bS5sZW5ndGggKyBzaGlmdDtcbiAgdmFyIGk7XG4gIGlmICh0aGlzLndvcmRzLmxlbmd0aCA8IGxlbikge1xuICAgIHZhciB0ID0gbmV3IEFycmF5KGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKVxuICAgICAgdFtpXSA9IHRoaXMud29yZHNbaV07XG4gICAgdGhpcy53b3JkcyA9IHQ7XG4gIH0gZWxzZSB7XG4gICAgaSA9IHRoaXMubGVuZ3RoO1xuICB9XG5cbiAgLy8gWmVyb2lmeSByZXN0XG4gIHRoaXMubGVuZ3RoID0gTWF0aC5tYXgodGhpcy5sZW5ndGgsIGxlbik7XG4gIGZvciAoOyBpIDwgdGhpcy5sZW5ndGg7IGkrKylcbiAgICB0aGlzLndvcmRzW2ldID0gMDtcblxuICB2YXIgY2FycnkgPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bS5sZW5ndGg7IGkrKykge1xuICAgIHZhciB3ID0gdGhpcy53b3Jkc1tpICsgc2hpZnRdICsgY2Fycnk7XG4gICAgdmFyIHJpZ2h0ID0gbnVtLndvcmRzW2ldICogbXVsO1xuICAgIHcgLT0gcmlnaHQgJiAweDNmZmZmZmY7XG4gICAgY2FycnkgPSAodyA+PiAyNikgLSAoKHJpZ2h0IC8gMHg0MDAwMDAwKSB8IDApO1xuICAgIHRoaXMud29yZHNbaSArIHNoaWZ0XSA9IHcgJiAweDNmZmZmZmY7XG4gIH1cbiAgZm9yICg7IGkgPCB0aGlzLmxlbmd0aCAtIHNoaWZ0OyBpKyspIHtcbiAgICB2YXIgdyA9IHRoaXMud29yZHNbaSArIHNoaWZ0XSArIGNhcnJ5O1xuICAgIGNhcnJ5ID0gdyA+PiAyNjtcbiAgICB0aGlzLndvcmRzW2kgKyBzaGlmdF0gPSB3ICYgMHgzZmZmZmZmO1xuICB9XG5cbiAgaWYgKGNhcnJ5ID09PSAwKVxuICAgIHJldHVybiB0aGlzLnN0cmlwKCk7XG5cbiAgLy8gU3VidHJhY3Rpb24gb3ZlcmZsb3dcbiAgYXNzZXJ0KGNhcnJ5ID09PSAtMSk7XG4gIGNhcnJ5ID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHcgPSAtdGhpcy53b3Jkc1tpXSArIGNhcnJ5O1xuICAgIGNhcnJ5ID0gdyA+PiAyNjtcbiAgICB0aGlzLndvcmRzW2ldID0gdyAmIDB4M2ZmZmZmZjtcbiAgfVxuICB0aGlzLnNpZ24gPSB0cnVlO1xuXG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XG59O1xuXG5CTi5wcm90b3R5cGUuX3dvcmREaXYgPSBmdW5jdGlvbiBfd29yZERpdihudW0sIG1vZGUpIHtcbiAgdmFyIHNoaWZ0ID0gdGhpcy5sZW5ndGggLSBudW0ubGVuZ3RoO1xuXG4gIHZhciBhID0gdGhpcy5jbG9uZSgpO1xuICB2YXIgYiA9IG51bTtcblxuICAvLyBOb3JtYWxpemVcbiAgdmFyIGJoaSA9IGIud29yZHNbYi5sZW5ndGggLSAxXTtcbiAgdmFyIGJoaUJpdHMgPSB0aGlzLl9jb3VudEJpdHMoYmhpKTtcbiAgc2hpZnQgPSAyNiAtIGJoaUJpdHM7XG4gIGlmIChzaGlmdCAhPT0gMCkge1xuICAgIGIgPSBiLnNobG4oc2hpZnQpO1xuICAgIGEuaXNobG4oc2hpZnQpO1xuICAgIGJoaSA9IGIud29yZHNbYi5sZW5ndGggLSAxXTtcbiAgfVxuXG4gIC8vIEluaXRpYWxpemUgcXVvdGllbnRcbiAgdmFyIG0gPSBhLmxlbmd0aCAtIGIubGVuZ3RoO1xuICB2YXIgcTtcblxuICBpZiAobW9kZSAhPT0gJ21vZCcpIHtcbiAgICBxID0gbmV3IEJOKG51bGwpO1xuICAgIHEubGVuZ3RoID0gbSArIDE7XG4gICAgcS53b3JkcyA9IG5ldyBBcnJheShxLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBxLmxlbmd0aDsgaSsrKVxuICAgICAgcS53b3Jkc1tpXSA9IDA7XG4gIH1cblxuICB2YXIgZGlmZiA9IGEuY2xvbmUoKS5faXNobG5zdWJtdWwoYiwgMSwgbSk7XG4gIGlmICghZGlmZi5zaWduKSB7XG4gICAgYSA9IGRpZmY7XG4gICAgaWYgKHEpXG4gICAgICBxLndvcmRzW21dID0gMTtcbiAgfVxuXG4gIGZvciAodmFyIGogPSBtIC0gMTsgaiA+PSAwOyBqLS0pIHtcbiAgICB2YXIgcWogPSBhLndvcmRzW2IubGVuZ3RoICsgal0gKiAweDQwMDAwMDAgKyBhLndvcmRzW2IubGVuZ3RoICsgaiAtIDFdO1xuXG4gICAgLy8gTk9URTogKHFqIC8gYmhpKSBpcyAoMHgzZmZmZmZmICogMHg0MDAwMDAwICsgMHgzZmZmZmZmKSAvIDB4MjAwMDAwMCBtYXhcbiAgICAvLyAoMHg3ZmZmZmZmKVxuICAgIHFqID0gTWF0aC5taW4oKHFqIC8gYmhpKSB8IDAsIDB4M2ZmZmZmZik7XG5cbiAgICBhLl9pc2hsbnN1Ym11bChiLCBxaiwgaik7XG4gICAgd2hpbGUgKGEuc2lnbikge1xuICAgICAgcWotLTtcbiAgICAgIGEuc2lnbiA9IGZhbHNlO1xuICAgICAgYS5faXNobG5zdWJtdWwoYiwgMSwgaik7XG4gICAgICBpZiAoYS5jbXBuKDApICE9PSAwKVxuICAgICAgICBhLnNpZ24gPSAhYS5zaWduO1xuICAgIH1cbiAgICBpZiAocSlcbiAgICAgIHEud29yZHNbal0gPSBxajtcbiAgfVxuICBpZiAocSlcbiAgICBxLnN0cmlwKCk7XG4gIGEuc3RyaXAoKTtcblxuICAvLyBEZW5vcm1hbGl6ZVxuICBpZiAobW9kZSAhPT0gJ2RpdicgJiYgc2hpZnQgIT09IDApXG4gICAgYS5pc2hybihzaGlmdCk7XG4gIHJldHVybiB7IGRpdjogcSA/IHEgOiBudWxsLCBtb2Q6IGEgfTtcbn07XG5cbkJOLnByb3RvdHlwZS5kaXZtb2QgPSBmdW5jdGlvbiBkaXZtb2QobnVtLCBtb2RlKSB7XG4gIGFzc2VydChudW0uY21wbigwKSAhPT0gMCk7XG5cbiAgaWYgKHRoaXMuc2lnbiAmJiAhbnVtLnNpZ24pIHtcbiAgICB2YXIgcmVzID0gdGhpcy5uZWcoKS5kaXZtb2QobnVtLCBtb2RlKTtcbiAgICB2YXIgZGl2O1xuICAgIHZhciBtb2Q7XG4gICAgaWYgKG1vZGUgIT09ICdtb2QnKVxuICAgICAgZGl2ID0gcmVzLmRpdi5uZWcoKTtcbiAgICBpZiAobW9kZSAhPT0gJ2RpdicpXG4gICAgICBtb2QgPSByZXMubW9kLmNtcG4oMCkgPT09IDAgPyByZXMubW9kIDogbnVtLnN1YihyZXMubW9kKTtcbiAgICByZXR1cm4ge1xuICAgICAgZGl2OiBkaXYsXG4gICAgICBtb2Q6IG1vZFxuICAgIH07XG4gIH0gZWxzZSBpZiAoIXRoaXMuc2lnbiAmJiBudW0uc2lnbikge1xuICAgIHZhciByZXMgPSB0aGlzLmRpdm1vZChudW0ubmVnKCksIG1vZGUpO1xuICAgIHZhciBkaXY7XG4gICAgaWYgKG1vZGUgIT09ICdtb2QnKVxuICAgICAgZGl2ID0gcmVzLmRpdi5uZWcoKTtcbiAgICByZXR1cm4geyBkaXY6IGRpdiwgbW9kOiByZXMubW9kIH07XG4gIH0gZWxzZSBpZiAodGhpcy5zaWduICYmIG51bS5zaWduKSB7XG4gICAgcmV0dXJuIHRoaXMubmVnKCkuZGl2bW9kKG51bS5uZWcoKSwgbW9kZSk7XG4gIH1cblxuICAvLyBCb3RoIG51bWJlcnMgYXJlIHBvc2l0aXZlIGF0IHRoaXMgcG9pbnRcblxuICAvLyBTdHJpcCBib3RoIG51bWJlcnMgdG8gYXBwcm94aW1hdGUgc2hpZnQgdmFsdWVcbiAgaWYgKG51bS5sZW5ndGggPiB0aGlzLmxlbmd0aCB8fCB0aGlzLmNtcChudW0pIDwgMClcbiAgICByZXR1cm4geyBkaXY6IG5ldyBCTigwKSwgbW9kOiB0aGlzIH07XG5cbiAgLy8gVmVyeSBzaG9ydCByZWR1Y3Rpb25cbiAgaWYgKG51bS5sZW5ndGggPT09IDEpIHtcbiAgICBpZiAobW9kZSA9PT0gJ2RpdicpXG4gICAgICByZXR1cm4geyBkaXY6IHRoaXMuZGl2bihudW0ud29yZHNbMF0pLCBtb2Q6IG51bGwgfTtcbiAgICBlbHNlIGlmIChtb2RlID09PSAnbW9kJylcbiAgICAgIHJldHVybiB7IGRpdjogbnVsbCwgbW9kOiBuZXcgQk4odGhpcy5tb2RuKG51bS53b3Jkc1swXSkpIH07XG4gICAgcmV0dXJuIHtcbiAgICAgIGRpdjogdGhpcy5kaXZuKG51bS53b3Jkc1swXSksXG4gICAgICBtb2Q6IG5ldyBCTih0aGlzLm1vZG4obnVtLndvcmRzWzBdKSlcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuX3dvcmREaXYobnVtLCBtb2RlKTtcbn07XG5cbi8vIEZpbmQgYHRoaXNgIC8gYG51bWBcbkJOLnByb3RvdHlwZS5kaXYgPSBmdW5jdGlvbiBkaXYobnVtKSB7XG4gIHJldHVybiB0aGlzLmRpdm1vZChudW0sICdkaXYnKS5kaXY7XG59O1xuXG4vLyBGaW5kIGB0aGlzYCAlIGBudW1gXG5CTi5wcm90b3R5cGUubW9kID0gZnVuY3Rpb24gbW9kKG51bSkge1xuICByZXR1cm4gdGhpcy5kaXZtb2QobnVtLCAnbW9kJykubW9kO1xufTtcblxuLy8gRmluZCBSb3VuZChgdGhpc2AgLyBgbnVtYClcbkJOLnByb3RvdHlwZS5kaXZSb3VuZCA9IGZ1bmN0aW9uIGRpdlJvdW5kKG51bSkge1xuICB2YXIgZG0gPSB0aGlzLmRpdm1vZChudW0pO1xuXG4gIC8vIEZhc3QgY2FzZSAtIGV4YWN0IGRpdmlzaW9uXG4gIGlmIChkbS5tb2QuY21wbigwKSA9PT0gMClcbiAgICByZXR1cm4gZG0uZGl2O1xuXG4gIHZhciBtb2QgPSBkbS5kaXYuc2lnbiA/IGRtLm1vZC5pc3ViKG51bSkgOiBkbS5tb2Q7XG5cbiAgdmFyIGhhbGYgPSBudW0uc2hybigxKTtcbiAgdmFyIHIyID0gbnVtLmFuZGxuKDEpO1xuICB2YXIgY21wID0gbW9kLmNtcChoYWxmKTtcblxuICAvLyBSb3VuZCBkb3duXG4gIGlmIChjbXAgPCAwIHx8IHIyID09PSAxICYmIGNtcCA9PT0gMClcbiAgICByZXR1cm4gZG0uZGl2O1xuXG4gIC8vIFJvdW5kIHVwXG4gIHJldHVybiBkbS5kaXYuc2lnbiA/IGRtLmRpdi5pc3VibigxKSA6IGRtLmRpdi5pYWRkbigxKTtcbn07XG5cbkJOLnByb3RvdHlwZS5tb2RuID0gZnVuY3Rpb24gbW9kbihudW0pIHtcbiAgYXNzZXJ0KG51bSA8PSAweDNmZmZmZmYpO1xuICB2YXIgcCA9ICgxIDw8IDI2KSAlIG51bTtcblxuICB2YXIgYWNjID0gMDtcbiAgZm9yICh2YXIgaSA9IHRoaXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXG4gICAgYWNjID0gKHAgKiBhY2MgKyB0aGlzLndvcmRzW2ldKSAlIG51bTtcblxuICByZXR1cm4gYWNjO1xufTtcblxuLy8gSW4tcGxhY2UgZGl2aXNpb24gYnkgbnVtYmVyXG5CTi5wcm90b3R5cGUuaWRpdm4gPSBmdW5jdGlvbiBpZGl2bihudW0pIHtcbiAgYXNzZXJ0KG51bSA8PSAweDNmZmZmZmYpO1xuXG4gIHZhciBjYXJyeSA9IDA7XG4gIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIHcgPSB0aGlzLndvcmRzW2ldICsgY2FycnkgKiAweDQwMDAwMDA7XG4gICAgdGhpcy53b3Jkc1tpXSA9ICh3IC8gbnVtKSB8IDA7XG4gICAgY2FycnkgPSB3ICUgbnVtO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcbn07XG5cbkJOLnByb3RvdHlwZS5kaXZuID0gZnVuY3Rpb24gZGl2bihudW0pIHtcbiAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pZGl2bihudW0pO1xufTtcblxuQk4ucHJvdG90eXBlLmVnY2QgPSBmdW5jdGlvbiBlZ2NkKHApIHtcbiAgYXNzZXJ0KCFwLnNpZ24pO1xuICBhc3NlcnQocC5jbXBuKDApICE9PSAwKTtcblxuICB2YXIgeCA9IHRoaXM7XG4gIHZhciB5ID0gcC5jbG9uZSgpO1xuXG4gIGlmICh4LnNpZ24pXG4gICAgeCA9IHgubW9kKHApO1xuICBlbHNlXG4gICAgeCA9IHguY2xvbmUoKTtcblxuICAvLyBBICogeCArIEIgKiB5ID0geFxuICB2YXIgQSA9IG5ldyBCTigxKTtcbiAgdmFyIEIgPSBuZXcgQk4oMCk7XG5cbiAgLy8gQyAqIHggKyBEICogeSA9IHlcbiAgdmFyIEMgPSBuZXcgQk4oMCk7XG4gIHZhciBEID0gbmV3IEJOKDEpO1xuXG4gIHZhciBnID0gMDtcblxuICB3aGlsZSAoeC5pc0V2ZW4oKSAmJiB5LmlzRXZlbigpKSB7XG4gICAgeC5pc2hybigxKTtcbiAgICB5LmlzaHJuKDEpO1xuICAgICsrZztcbiAgfVxuXG4gIHZhciB5cCA9IHkuY2xvbmUoKTtcbiAgdmFyIHhwID0geC5jbG9uZSgpO1xuXG4gIHdoaWxlICh4LmNtcG4oMCkgIT09IDApIHtcbiAgICB3aGlsZSAoeC5pc0V2ZW4oKSkge1xuICAgICAgeC5pc2hybigxKTtcbiAgICAgIGlmIChBLmlzRXZlbigpICYmIEIuaXNFdmVuKCkpIHtcbiAgICAgICAgQS5pc2hybigxKTtcbiAgICAgICAgQi5pc2hybigxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIEEuaWFkZCh5cCkuaXNocm4oMSk7XG4gICAgICAgIEIuaXN1Yih4cCkuaXNocm4oMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgd2hpbGUgKHkuaXNFdmVuKCkpIHtcbiAgICAgIHkuaXNocm4oMSk7XG4gICAgICBpZiAoQy5pc0V2ZW4oKSAmJiBELmlzRXZlbigpKSB7XG4gICAgICAgIEMuaXNocm4oMSk7XG4gICAgICAgIEQuaXNocm4oMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBDLmlhZGQoeXApLmlzaHJuKDEpO1xuICAgICAgICBELmlzdWIoeHApLmlzaHJuKDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh4LmNtcCh5KSA+PSAwKSB7XG4gICAgICB4LmlzdWIoeSk7XG4gICAgICBBLmlzdWIoQyk7XG4gICAgICBCLmlzdWIoRCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHkuaXN1Yih4KTtcbiAgICAgIEMuaXN1YihBKTtcbiAgICAgIEQuaXN1YihCKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGE6IEMsXG4gICAgYjogRCxcbiAgICBnY2Q6IHkuaXNobG4oZylcbiAgfTtcbn07XG5cbi8vIFRoaXMgaXMgcmVkdWNlZCBpbmNhcm5hdGlvbiBvZiB0aGUgYmluYXJ5IEVFQVxuLy8gYWJvdmUsIGRlc2lnbmF0ZWQgdG8gaW52ZXJ0IG1lbWJlcnMgb2YgdGhlXG4vLyBfcHJpbWVfIGZpZWxkcyBGKHApIGF0IGEgbWF4aW1hbCBzcGVlZFxuQk4ucHJvdG90eXBlLl9pbnZtcCA9IGZ1bmN0aW9uIF9pbnZtcChwKSB7XG4gIGFzc2VydCghcC5zaWduKTtcbiAgYXNzZXJ0KHAuY21wbigwKSAhPT0gMCk7XG5cbiAgdmFyIGEgPSB0aGlzO1xuICB2YXIgYiA9IHAuY2xvbmUoKTtcblxuICBpZiAoYS5zaWduKVxuICAgIGEgPSBhLm1vZChwKTtcbiAgZWxzZVxuICAgIGEgPSBhLmNsb25lKCk7XG5cbiAgdmFyIHgxID0gbmV3IEJOKDEpO1xuICB2YXIgeDIgPSBuZXcgQk4oMCk7XG5cbiAgdmFyIGRlbHRhID0gYi5jbG9uZSgpO1xuXG4gIHdoaWxlIChhLmNtcG4oMSkgPiAwICYmIGIuY21wbigxKSA+IDApIHtcbiAgICB3aGlsZSAoYS5pc0V2ZW4oKSkge1xuICAgICAgYS5pc2hybigxKTtcbiAgICAgIGlmICh4MS5pc0V2ZW4oKSlcbiAgICAgICAgeDEuaXNocm4oMSk7XG4gICAgICBlbHNlXG4gICAgICAgIHgxLmlhZGQoZGVsdGEpLmlzaHJuKDEpO1xuICAgIH1cbiAgICB3aGlsZSAoYi5pc0V2ZW4oKSkge1xuICAgICAgYi5pc2hybigxKTtcbiAgICAgIGlmICh4Mi5pc0V2ZW4oKSlcbiAgICAgICAgeDIuaXNocm4oMSk7XG4gICAgICBlbHNlXG4gICAgICAgIHgyLmlhZGQoZGVsdGEpLmlzaHJuKDEpO1xuICAgIH1cbiAgICBpZiAoYS5jbXAoYikgPj0gMCkge1xuICAgICAgYS5pc3ViKGIpO1xuICAgICAgeDEuaXN1Yih4Mik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGIuaXN1YihhKTtcbiAgICAgIHgyLmlzdWIoeDEpO1xuICAgIH1cbiAgfVxuICBpZiAoYS5jbXBuKDEpID09PSAwKVxuICAgIHJldHVybiB4MTtcbiAgZWxzZVxuICAgIHJldHVybiB4Mjtcbn07XG5cbkJOLnByb3RvdHlwZS5nY2QgPSBmdW5jdGlvbiBnY2QobnVtKSB7XG4gIGlmICh0aGlzLmNtcG4oMCkgPT09IDApXG4gICAgcmV0dXJuIG51bS5jbG9uZSgpO1xuICBpZiAobnVtLmNtcG4oMCkgPT09IDApXG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcblxuICB2YXIgYSA9IHRoaXMuY2xvbmUoKTtcbiAgdmFyIGIgPSBudW0uY2xvbmUoKTtcbiAgYS5zaWduID0gZmFsc2U7XG4gIGIuc2lnbiA9IGZhbHNlO1xuXG4gIC8vIFJlbW92ZSBjb21tb24gZmFjdG9yIG9mIHR3b1xuICBmb3IgKHZhciBzaGlmdCA9IDA7IGEuaXNFdmVuKCkgJiYgYi5pc0V2ZW4oKTsgc2hpZnQrKykge1xuICAgIGEuaXNocm4oMSk7XG4gICAgYi5pc2hybigxKTtcbiAgfVxuXG4gIGRvIHtcbiAgICB3aGlsZSAoYS5pc0V2ZW4oKSlcbiAgICAgIGEuaXNocm4oMSk7XG4gICAgd2hpbGUgKGIuaXNFdmVuKCkpXG4gICAgICBiLmlzaHJuKDEpO1xuXG4gICAgdmFyIHIgPSBhLmNtcChiKTtcbiAgICBpZiAociA8IDApIHtcbiAgICAgIC8vIFN3YXAgYGFgIGFuZCBgYmAgdG8gbWFrZSBgYWAgYWx3YXlzIGJpZ2dlciB0aGFuIGBiYFxuICAgICAgdmFyIHQgPSBhO1xuICAgICAgYSA9IGI7XG4gICAgICBiID0gdDtcbiAgICB9IGVsc2UgaWYgKHIgPT09IDAgfHwgYi5jbXBuKDEpID09PSAwKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBhLmlzdWIoYik7XG4gIH0gd2hpbGUgKHRydWUpO1xuXG4gIHJldHVybiBiLmlzaGxuKHNoaWZ0KTtcbn07XG5cbi8vIEludmVydCBudW1iZXIgaW4gdGhlIGZpZWxkIEYobnVtKVxuQk4ucHJvdG90eXBlLmludm0gPSBmdW5jdGlvbiBpbnZtKG51bSkge1xuICByZXR1cm4gdGhpcy5lZ2NkKG51bSkuYS5tb2QobnVtKTtcbn07XG5cbkJOLnByb3RvdHlwZS5pc0V2ZW4gPSBmdW5jdGlvbiBpc0V2ZW4oKSB7XG4gIHJldHVybiAodGhpcy53b3Jkc1swXSAmIDEpID09PSAwO1xufTtcblxuQk4ucHJvdG90eXBlLmlzT2RkID0gZnVuY3Rpb24gaXNPZGQoKSB7XG4gIHJldHVybiAodGhpcy53b3Jkc1swXSAmIDEpID09PSAxO1xufTtcblxuLy8gQW5kIGZpcnN0IHdvcmQgYW5kIG51bVxuQk4ucHJvdG90eXBlLmFuZGxuID0gZnVuY3Rpb24gYW5kbG4obnVtKSB7XG4gIHJldHVybiB0aGlzLndvcmRzWzBdICYgbnVtO1xufTtcblxuLy8gSW5jcmVtZW50IGF0IHRoZSBiaXQgcG9zaXRpb24gaW4tbGluZVxuQk4ucHJvdG90eXBlLmJpbmNuID0gZnVuY3Rpb24gYmluY24oYml0KSB7XG4gIGFzc2VydCh0eXBlb2YgYml0ID09PSAnbnVtYmVyJyk7XG4gIHZhciByID0gYml0ICUgMjY7XG4gIHZhciBzID0gKGJpdCAtIHIpIC8gMjY7XG4gIHZhciBxID0gMSA8PCByO1xuXG4gIC8vIEZhc3QgY2FzZTogYml0IGlzIG11Y2ggaGlnaGVyIHRoYW4gYWxsIGV4aXN0aW5nIHdvcmRzXG4gIGlmICh0aGlzLmxlbmd0aCA8PSBzKSB7XG4gICAgZm9yICh2YXIgaSA9IHRoaXMubGVuZ3RoOyBpIDwgcyArIDE7IGkrKylcbiAgICAgIHRoaXMud29yZHNbaV0gPSAwO1xuICAgIHRoaXMud29yZHNbc10gfD0gcTtcbiAgICB0aGlzLmxlbmd0aCA9IHMgKyAxO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gQWRkIGJpdCBhbmQgcHJvcGFnYXRlLCBpZiBuZWVkZWRcbiAgdmFyIGNhcnJ5ID0gcTtcbiAgZm9yICh2YXIgaSA9IHM7IGNhcnJ5ICE9PSAwICYmIGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHcgPSB0aGlzLndvcmRzW2ldO1xuICAgIHcgKz0gY2Fycnk7XG4gICAgY2FycnkgPSB3ID4+PiAyNjtcbiAgICB3ICY9IDB4M2ZmZmZmZjtcbiAgICB0aGlzLndvcmRzW2ldID0gdztcbiAgfVxuICBpZiAoY2FycnkgIT09IDApIHtcbiAgICB0aGlzLndvcmRzW2ldID0gY2Fycnk7XG4gICAgdGhpcy5sZW5ndGgrKztcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbkJOLnByb3RvdHlwZS5jbXBuID0gZnVuY3Rpb24gY21wbihudW0pIHtcbiAgdmFyIHNpZ24gPSBudW0gPCAwO1xuICBpZiAoc2lnbilcbiAgICBudW0gPSAtbnVtO1xuXG4gIGlmICh0aGlzLnNpZ24gJiYgIXNpZ24pXG4gICAgcmV0dXJuIC0xO1xuICBlbHNlIGlmICghdGhpcy5zaWduICYmIHNpZ24pXG4gICAgcmV0dXJuIDE7XG5cbiAgbnVtICY9IDB4M2ZmZmZmZjtcbiAgdGhpcy5zdHJpcCgpO1xuXG4gIHZhciByZXM7XG4gIGlmICh0aGlzLmxlbmd0aCA+IDEpIHtcbiAgICByZXMgPSAxO1xuICB9IGVsc2Uge1xuICAgIHZhciB3ID0gdGhpcy53b3Jkc1swXTtcbiAgICByZXMgPSB3ID09PSBudW0gPyAwIDogdyA8IG51bSA/IC0xIDogMTtcbiAgfVxuICBpZiAodGhpcy5zaWduKVxuICAgIHJlcyA9IC1yZXM7XG4gIHJldHVybiByZXM7XG59O1xuXG4vLyBDb21wYXJlIHR3byBudW1iZXJzIGFuZCByZXR1cm46XG4vLyAxIC0gaWYgYHRoaXNgID4gYG51bWBcbi8vIDAgLSBpZiBgdGhpc2AgPT0gYG51bWBcbi8vIC0xIC0gaWYgYHRoaXNgIDwgYG51bWBcbkJOLnByb3RvdHlwZS5jbXAgPSBmdW5jdGlvbiBjbXAobnVtKSB7XG4gIGlmICh0aGlzLnNpZ24gJiYgIW51bS5zaWduKVxuICAgIHJldHVybiAtMTtcbiAgZWxzZSBpZiAoIXRoaXMuc2lnbiAmJiBudW0uc2lnbilcbiAgICByZXR1cm4gMTtcblxuICB2YXIgcmVzID0gdGhpcy51Y21wKG51bSk7XG4gIGlmICh0aGlzLnNpZ24pXG4gICAgcmV0dXJuIC1yZXM7XG4gIGVsc2VcbiAgICByZXR1cm4gcmVzO1xufTtcblxuLy8gVW5zaWduZWQgY29tcGFyaXNvblxuQk4ucHJvdG90eXBlLnVjbXAgPSBmdW5jdGlvbiB1Y21wKG51bSkge1xuICAvLyBBdCB0aGlzIHBvaW50IGJvdGggbnVtYmVycyBoYXZlIHRoZSBzYW1lIHNpZ25cbiAgaWYgKHRoaXMubGVuZ3RoID4gbnVtLmxlbmd0aClcbiAgICByZXR1cm4gMTtcbiAgZWxzZSBpZiAodGhpcy5sZW5ndGggPCBudW0ubGVuZ3RoKVxuICAgIHJldHVybiAtMTtcblxuICB2YXIgcmVzID0gMDtcbiAgZm9yICh2YXIgaSA9IHRoaXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgYSA9IHRoaXMud29yZHNbaV07XG4gICAgdmFyIGIgPSBudW0ud29yZHNbaV07XG5cbiAgICBpZiAoYSA9PT0gYilcbiAgICAgIGNvbnRpbnVlO1xuICAgIGlmIChhIDwgYilcbiAgICAgIHJlcyA9IC0xO1xuICAgIGVsc2UgaWYgKGEgPiBiKVxuICAgICAgcmVzID0gMTtcbiAgICBicmVhaztcbiAgfVxuICByZXR1cm4gcmVzO1xufTtcblxuLy9cbi8vIEEgcmVkdWNlIGNvbnRleHQsIGNvdWxkIGJlIHVzaW5nIG1vbnRnb21lcnkgb3Igc29tZXRoaW5nIGJldHRlciwgZGVwZW5kaW5nXG4vLyBvbiB0aGUgYG1gIGl0c2VsZi5cbi8vXG5CTi5yZWQgPSBmdW5jdGlvbiByZWQobnVtKSB7XG4gIHJldHVybiBuZXcgUmVkKG51bSk7XG59O1xuXG5CTi5wcm90b3R5cGUudG9SZWQgPSBmdW5jdGlvbiB0b1JlZChjdHgpIHtcbiAgYXNzZXJ0KCF0aGlzLnJlZCwgJ0FscmVhZHkgYSBudW1iZXIgaW4gcmVkdWN0aW9uIGNvbnRleHQnKTtcbiAgYXNzZXJ0KCF0aGlzLnNpZ24sICdyZWQgd29ya3Mgb25seSB3aXRoIHBvc2l0aXZlcycpO1xuICByZXR1cm4gY3R4LmNvbnZlcnRUbyh0aGlzKS5fZm9yY2VSZWQoY3R4KTtcbn07XG5cbkJOLnByb3RvdHlwZS5mcm9tUmVkID0gZnVuY3Rpb24gZnJvbVJlZCgpIHtcbiAgYXNzZXJ0KHRoaXMucmVkLCAnZnJvbVJlZCB3b3JrcyBvbmx5IHdpdGggbnVtYmVycyBpbiByZWR1Y3Rpb24gY29udGV4dCcpO1xuICByZXR1cm4gdGhpcy5yZWQuY29udmVydEZyb20odGhpcyk7XG59O1xuXG5CTi5wcm90b3R5cGUuX2ZvcmNlUmVkID0gZnVuY3Rpb24gX2ZvcmNlUmVkKGN0eCkge1xuICB0aGlzLnJlZCA9IGN0eDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5CTi5wcm90b3R5cGUuZm9yY2VSZWQgPSBmdW5jdGlvbiBmb3JjZVJlZChjdHgpIHtcbiAgYXNzZXJ0KCF0aGlzLnJlZCwgJ0FscmVhZHkgYSBudW1iZXIgaW4gcmVkdWN0aW9uIGNvbnRleHQnKTtcbiAgcmV0dXJuIHRoaXMuX2ZvcmNlUmVkKGN0eCk7XG59O1xuXG5CTi5wcm90b3R5cGUucmVkQWRkID0gZnVuY3Rpb24gcmVkQWRkKG51bSkge1xuICBhc3NlcnQodGhpcy5yZWQsICdyZWRBZGQgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XG4gIHJldHVybiB0aGlzLnJlZC5hZGQodGhpcywgbnVtKTtcbn07XG5cbkJOLnByb3RvdHlwZS5yZWRJQWRkID0gZnVuY3Rpb24gcmVkSUFkZChudW0pIHtcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkSUFkZCB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcbiAgcmV0dXJuIHRoaXMucmVkLmlhZGQodGhpcywgbnVtKTtcbn07XG5cbkJOLnByb3RvdHlwZS5yZWRTdWIgPSBmdW5jdGlvbiByZWRTdWIobnVtKSB7XG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZFN1YiB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcbiAgcmV0dXJuIHRoaXMucmVkLnN1Yih0aGlzLCBudW0pO1xufTtcblxuQk4ucHJvdG90eXBlLnJlZElTdWIgPSBmdW5jdGlvbiByZWRJU3ViKG51bSkge1xuICBhc3NlcnQodGhpcy5yZWQsICdyZWRJU3ViIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xuICByZXR1cm4gdGhpcy5yZWQuaXN1Yih0aGlzLCBudW0pO1xufTtcblxuQk4ucHJvdG90eXBlLnJlZFNobCA9IGZ1bmN0aW9uIHJlZFNobChudW0pIHtcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkU2hsIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xuICByZXR1cm4gdGhpcy5yZWQuc2hsKHRoaXMsIG51bSk7XG59O1xuXG5CTi5wcm90b3R5cGUucmVkTXVsID0gZnVuY3Rpb24gcmVkTXVsKG51bSkge1xuICBhc3NlcnQodGhpcy5yZWQsICdyZWRNdWwgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XG4gIHRoaXMucmVkLl92ZXJpZnkyKHRoaXMsIG51bSk7XG4gIHJldHVybiB0aGlzLnJlZC5tdWwodGhpcywgbnVtKTtcbn07XG5cbkJOLnByb3RvdHlwZS5yZWRJTXVsID0gZnVuY3Rpb24gcmVkSU11bChudW0pIHtcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkTXVsIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xuICB0aGlzLnJlZC5fdmVyaWZ5Mih0aGlzLCBudW0pO1xuICByZXR1cm4gdGhpcy5yZWQuaW11bCh0aGlzLCBudW0pO1xufTtcblxuQk4ucHJvdG90eXBlLnJlZFNxciA9IGZ1bmN0aW9uIHJlZFNxcigpIHtcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkU3FyIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xuICB0aGlzLnJlZC5fdmVyaWZ5MSh0aGlzKTtcbiAgcmV0dXJuIHRoaXMucmVkLnNxcih0aGlzKTtcbn07XG5cbkJOLnByb3RvdHlwZS5yZWRJU3FyID0gZnVuY3Rpb24gcmVkSVNxcigpIHtcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkSVNxciB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcbiAgdGhpcy5yZWQuX3ZlcmlmeTEodGhpcyk7XG4gIHJldHVybiB0aGlzLnJlZC5pc3FyKHRoaXMpO1xufTtcblxuLy8gU3F1YXJlIHJvb3Qgb3ZlciBwXG5CTi5wcm90b3R5cGUucmVkU3FydCA9IGZ1bmN0aW9uIHJlZFNxcnQoKSB7XG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZFNxcnQgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XG4gIHRoaXMucmVkLl92ZXJpZnkxKHRoaXMpO1xuICByZXR1cm4gdGhpcy5yZWQuc3FydCh0aGlzKTtcbn07XG5cbkJOLnByb3RvdHlwZS5yZWRJbnZtID0gZnVuY3Rpb24gcmVkSW52bSgpIHtcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkSW52bSB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcbiAgdGhpcy5yZWQuX3ZlcmlmeTEodGhpcyk7XG4gIHJldHVybiB0aGlzLnJlZC5pbnZtKHRoaXMpO1xufTtcblxuLy8gUmV0dXJuIG5lZ2F0aXZlIGNsb25lIG9mIGB0aGlzYCAlIGByZWQgbW9kdWxvYFxuQk4ucHJvdG90eXBlLnJlZE5lZyA9IGZ1bmN0aW9uIHJlZE5lZygpIHtcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkTmVnIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xuICB0aGlzLnJlZC5fdmVyaWZ5MSh0aGlzKTtcbiAgcmV0dXJuIHRoaXMucmVkLm5lZyh0aGlzKTtcbn07XG5cbkJOLnByb3RvdHlwZS5yZWRQb3cgPSBmdW5jdGlvbiByZWRQb3cobnVtKSB7XG4gIGFzc2VydCh0aGlzLnJlZCAmJiAhbnVtLnJlZCwgJ3JlZFBvdyhub3JtYWxOdW0pJyk7XG4gIHRoaXMucmVkLl92ZXJpZnkxKHRoaXMpO1xuICByZXR1cm4gdGhpcy5yZWQucG93KHRoaXMsIG51bSk7XG59O1xuXG4vLyBQcmltZSBudW1iZXJzIHdpdGggZWZmaWNpZW50IHJlZHVjdGlvblxudmFyIHByaW1lcyA9IHtcbiAgazI1NjogbnVsbCxcbiAgcDIyNDogbnVsbCxcbiAgcDE5MjogbnVsbCxcbiAgcDI1NTE5OiBudWxsXG59O1xuXG4vLyBQc2V1ZG8tTWVyc2VubmUgcHJpbWVcbmZ1bmN0aW9uIE1QcmltZShuYW1lLCBwKSB7XG4gIC8vIFAgPSAyIF4gTiAtIEtcbiAgdGhpcy5uYW1lID0gbmFtZTtcbiAgdGhpcy5wID0gbmV3IEJOKHAsIDE2KTtcbiAgdGhpcy5uID0gdGhpcy5wLmJpdExlbmd0aCgpO1xuICB0aGlzLmsgPSBuZXcgQk4oMSkuaXNobG4odGhpcy5uKS5pc3ViKHRoaXMucCk7XG5cbiAgdGhpcy50bXAgPSB0aGlzLl90bXAoKTtcbn1cblxuTVByaW1lLnByb3RvdHlwZS5fdG1wID0gZnVuY3Rpb24gX3RtcCgpIHtcbiAgdmFyIHRtcCA9IG5ldyBCTihudWxsKTtcbiAgdG1wLndvcmRzID0gbmV3IEFycmF5KE1hdGguY2VpbCh0aGlzLm4gLyAxMykpO1xuICByZXR1cm4gdG1wO1xufTtcblxuTVByaW1lLnByb3RvdHlwZS5pcmVkdWNlID0gZnVuY3Rpb24gaXJlZHVjZShudW0pIHtcbiAgLy8gQXNzdW1lcyB0aGF0IGBudW1gIGlzIGxlc3MgdGhhbiBgUF4yYFxuICAvLyBudW0gPSBISSAqICgyIF4gTiAtIEspICsgSEkgKiBLICsgTE8gPSBISSAqIEsgKyBMTyAobW9kIFApXG4gIHZhciByID0gbnVtO1xuICB2YXIgcmxlbjtcblxuICBkbyB7XG4gICAgdGhpcy5zcGxpdChyLCB0aGlzLnRtcCk7XG4gICAgciA9IHRoaXMuaW11bEsocik7XG4gICAgciA9IHIuaWFkZCh0aGlzLnRtcCk7XG4gICAgcmxlbiA9IHIuYml0TGVuZ3RoKCk7XG4gIH0gd2hpbGUgKHJsZW4gPiB0aGlzLm4pO1xuXG4gIHZhciBjbXAgPSBybGVuIDwgdGhpcy5uID8gLTEgOiByLnVjbXAodGhpcy5wKTtcbiAgaWYgKGNtcCA9PT0gMCkge1xuICAgIHIud29yZHNbMF0gPSAwO1xuICAgIHIubGVuZ3RoID0gMTtcbiAgfSBlbHNlIGlmIChjbXAgPiAwKSB7XG4gICAgci5pc3ViKHRoaXMucCk7XG4gIH0gZWxzZSB7XG4gICAgci5zdHJpcCgpO1xuICB9XG5cbiAgcmV0dXJuIHI7XG59O1xuXG5NUHJpbWUucHJvdG90eXBlLnNwbGl0ID0gZnVuY3Rpb24gc3BsaXQoaW5wdXQsIG91dCkge1xuICBpbnB1dC5pc2hybih0aGlzLm4sIDAsIG91dCk7XG59O1xuXG5NUHJpbWUucHJvdG90eXBlLmltdWxLID0gZnVuY3Rpb24gaW11bEsobnVtKSB7XG4gIHJldHVybiBudW0uaW11bCh0aGlzLmspO1xufTtcblxuZnVuY3Rpb24gSzI1NigpIHtcbiAgTVByaW1lLmNhbGwoXG4gICAgdGhpcyxcbiAgICAnazI1NicsXG4gICAgJ2ZmZmZmZmZmIGZmZmZmZmZmIGZmZmZmZmZmIGZmZmZmZmZmIGZmZmZmZmZmIGZmZmZmZmZmIGZmZmZmZmZlIGZmZmZmYzJmJyk7XG59XG5pbmhlcml0cyhLMjU2LCBNUHJpbWUpO1xuXG5LMjU2LnByb3RvdHlwZS5zcGxpdCA9IGZ1bmN0aW9uIHNwbGl0KGlucHV0LCBvdXRwdXQpIHtcbiAgLy8gMjU2ID0gOSAqIDI2ICsgMjJcbiAgdmFyIG1hc2sgPSAweDNmZmZmZjtcblxuICB2YXIgb3V0TGVuID0gTWF0aC5taW4oaW5wdXQubGVuZ3RoLCA5KTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBvdXRMZW47IGkrKylcbiAgICBvdXRwdXQud29yZHNbaV0gPSBpbnB1dC53b3Jkc1tpXTtcbiAgb3V0cHV0Lmxlbmd0aCA9IG91dExlbjtcblxuICBpZiAoaW5wdXQubGVuZ3RoIDw9IDkpIHtcbiAgICBpbnB1dC53b3Jkc1swXSA9IDA7XG4gICAgaW5wdXQubGVuZ3RoID0gMTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBTaGlmdCBieSA5IGxpbWJzXG4gIHZhciBwcmV2ID0gaW5wdXQud29yZHNbOV07XG4gIG91dHB1dC53b3Jkc1tvdXRwdXQubGVuZ3RoKytdID0gcHJldiAmIG1hc2s7XG5cbiAgZm9yICh2YXIgaSA9IDEwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbmV4dCA9IGlucHV0LndvcmRzW2ldO1xuICAgIGlucHV0LndvcmRzW2kgLSAxMF0gPSAoKG5leHQgJiBtYXNrKSA8PCA0KSB8IChwcmV2ID4+PiAyMik7XG4gICAgcHJldiA9IG5leHQ7XG4gIH1cbiAgaW5wdXQud29yZHNbaSAtIDEwXSA9IHByZXYgPj4+IDIyO1xuICBpbnB1dC5sZW5ndGggLT0gOTtcbn07XG5cbksyNTYucHJvdG90eXBlLmltdWxLID0gZnVuY3Rpb24gaW11bEsobnVtKSB7XG4gIC8vIEsgPSAweDEwMDAwMDNkMSA9IFsgMHg0MCwgMHgzZDEgXVxuICBudW0ud29yZHNbbnVtLmxlbmd0aF0gPSAwO1xuICBudW0ud29yZHNbbnVtLmxlbmd0aCArIDFdID0gMDtcbiAgbnVtLmxlbmd0aCArPSAyO1xuXG4gIC8vIGJvdW5kZWQgYXQ6IDB4NDAgKiAweDNmZmZmZmYgKyAweDNkMCA9IDB4MTAwMDAwMzkwXG4gIHZhciBoaTtcbiAgdmFyIGxvID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0ubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdyA9IG51bS53b3Jkc1tpXTtcbiAgICBoaSA9IHcgKiAweDQwO1xuICAgIGxvICs9IHcgKiAweDNkMTtcbiAgICBoaSArPSAobG8gLyAweDQwMDAwMDApIHwgMDtcbiAgICBsbyAmPSAweDNmZmZmZmY7XG5cbiAgICBudW0ud29yZHNbaV0gPSBsbztcblxuICAgIGxvID0gaGk7XG4gIH1cblxuICAvLyBGYXN0IGxlbmd0aCByZWR1Y3Rpb25cbiAgaWYgKG51bS53b3Jkc1tudW0ubGVuZ3RoIC0gMV0gPT09IDApIHtcbiAgICBudW0ubGVuZ3RoLS07XG4gICAgaWYgKG51bS53b3Jkc1tudW0ubGVuZ3RoIC0gMV0gPT09IDApXG4gICAgICBudW0ubGVuZ3RoLS07XG4gIH1cbiAgcmV0dXJuIG51bTtcbn07XG5cbmZ1bmN0aW9uIFAyMjQoKSB7XG4gIE1QcmltZS5jYWxsKFxuICAgIHRoaXMsXG4gICAgJ3AyMjQnLFxuICAgICdmZmZmZmZmZiBmZmZmZmZmZiBmZmZmZmZmZiBmZmZmZmZmZiAwMDAwMDAwMCAwMDAwMDAwMCAwMDAwMDAwMScpO1xufVxuaW5oZXJpdHMoUDIyNCwgTVByaW1lKTtcblxuZnVuY3Rpb24gUDE5MigpIHtcbiAgTVByaW1lLmNhbGwoXG4gICAgdGhpcyxcbiAgICAncDE5MicsXG4gICAgJ2ZmZmZmZmZmIGZmZmZmZmZmIGZmZmZmZmZmIGZmZmZmZmZlIGZmZmZmZmZmIGZmZmZmZmZmJyk7XG59XG5pbmhlcml0cyhQMTkyLCBNUHJpbWUpO1xuXG5mdW5jdGlvbiBQMjU1MTkoKSB7XG4gIC8vIDIgXiAyNTUgLSAxOVxuICBNUHJpbWUuY2FsbChcbiAgICB0aGlzLFxuICAgICcyNTUxOScsXG4gICAgJzdmZmZmZmZmZmZmZmZmZmYgZmZmZmZmZmZmZmZmZmZmZiBmZmZmZmZmZmZmZmZmZmZmIGZmZmZmZmZmZmZmZmZmZWQnKTtcbn1cbmluaGVyaXRzKFAyNTUxOSwgTVByaW1lKTtcblxuUDI1NTE5LnByb3RvdHlwZS5pbXVsSyA9IGZ1bmN0aW9uIGltdWxLKG51bSkge1xuICAvLyBLID0gMHgxM1xuICB2YXIgY2FycnkgPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBoaSA9IG51bS53b3Jkc1tpXSAqIDB4MTMgKyBjYXJyeTtcbiAgICB2YXIgbG8gPSBoaSAmIDB4M2ZmZmZmZjtcbiAgICBoaSA+Pj49IDI2O1xuXG4gICAgbnVtLndvcmRzW2ldID0gbG87XG4gICAgY2FycnkgPSBoaTtcbiAgfVxuICBpZiAoY2FycnkgIT09IDApXG4gICAgbnVtLndvcmRzW251bS5sZW5ndGgrK10gPSBjYXJyeTtcbiAgcmV0dXJuIG51bTtcbn07XG5cbi8vIEV4cG9ydGVkIG1vc3RseSBmb3IgdGVzdGluZyBwdXJwb3NlcywgdXNlIHBsYWluIG5hbWUgaW5zdGVhZFxuQk4uX3ByaW1lID0gZnVuY3Rpb24gcHJpbWUobmFtZSkge1xuICAvLyBDYWNoZWQgdmVyc2lvbiBvZiBwcmltZVxuICBpZiAocHJpbWVzW25hbWVdKVxuICAgIHJldHVybiBwcmltZXNbbmFtZV07XG5cbiAgdmFyIHByaW1lO1xuICBpZiAobmFtZSA9PT0gJ2syNTYnKVxuICAgIHByaW1lID0gbmV3IEsyNTYoKTtcbiAgZWxzZSBpZiAobmFtZSA9PT0gJ3AyMjQnKVxuICAgIHByaW1lID0gbmV3IFAyMjQoKTtcbiAgZWxzZSBpZiAobmFtZSA9PT0gJ3AxOTInKVxuICAgIHByaW1lID0gbmV3IFAxOTIoKTtcbiAgZWxzZSBpZiAobmFtZSA9PT0gJ3AyNTUxOScpXG4gICAgcHJpbWUgPSBuZXcgUDI1NTE5KCk7XG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcHJpbWUgJyArIG5hbWUpO1xuICBwcmltZXNbbmFtZV0gPSBwcmltZTtcblxuICByZXR1cm4gcHJpbWU7XG59O1xuXG4vL1xuLy8gQmFzZSByZWR1Y3Rpb24gZW5naW5lXG4vL1xuZnVuY3Rpb24gUmVkKG0pIHtcbiAgaWYgKHR5cGVvZiBtID09PSAnc3RyaW5nJykge1xuICAgIHZhciBwcmltZSA9IEJOLl9wcmltZShtKTtcbiAgICB0aGlzLm0gPSBwcmltZS5wO1xuICAgIHRoaXMucHJpbWUgPSBwcmltZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm0gPSBtO1xuICAgIHRoaXMucHJpbWUgPSBudWxsO1xuICB9XG59XG5cblJlZC5wcm90b3R5cGUuX3ZlcmlmeTEgPSBmdW5jdGlvbiBfdmVyaWZ5MShhKSB7XG4gIGFzc2VydCghYS5zaWduLCAncmVkIHdvcmtzIG9ubHkgd2l0aCBwb3NpdGl2ZXMnKTtcbiAgYXNzZXJ0KGEucmVkLCAncmVkIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xufTtcblxuUmVkLnByb3RvdHlwZS5fdmVyaWZ5MiA9IGZ1bmN0aW9uIF92ZXJpZnkyKGEsIGIpIHtcbiAgYXNzZXJ0KCFhLnNpZ24gJiYgIWIuc2lnbiwgJ3JlZCB3b3JrcyBvbmx5IHdpdGggcG9zaXRpdmVzJyk7XG4gIGFzc2VydChhLnJlZCAmJiBhLnJlZCA9PT0gYi5yZWQsXG4gICAgICAgICAncmVkIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xufTtcblxuUmVkLnByb3RvdHlwZS5pbW9kID0gZnVuY3Rpb24gaW1vZChhKSB7XG4gIGlmICh0aGlzLnByaW1lKVxuICAgIHJldHVybiB0aGlzLnByaW1lLmlyZWR1Y2UoYSkuX2ZvcmNlUmVkKHRoaXMpO1xuICByZXR1cm4gYS5tb2QodGhpcy5tKS5fZm9yY2VSZWQodGhpcyk7XG59O1xuXG5SZWQucHJvdG90eXBlLm5lZyA9IGZ1bmN0aW9uIG5lZyhhKSB7XG4gIHZhciByID0gYS5jbG9uZSgpO1xuICByLnNpZ24gPSAhci5zaWduO1xuICByZXR1cm4gci5pYWRkKHRoaXMubSkuX2ZvcmNlUmVkKHRoaXMpO1xufTtcblxuUmVkLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBhZGQoYSwgYikge1xuICB0aGlzLl92ZXJpZnkyKGEsIGIpO1xuXG4gIHZhciByZXMgPSBhLmFkZChiKTtcbiAgaWYgKHJlcy5jbXAodGhpcy5tKSA+PSAwKVxuICAgIHJlcy5pc3ViKHRoaXMubSk7XG4gIHJldHVybiByZXMuX2ZvcmNlUmVkKHRoaXMpO1xufTtcblxuUmVkLnByb3RvdHlwZS5pYWRkID0gZnVuY3Rpb24gaWFkZChhLCBiKSB7XG4gIHRoaXMuX3ZlcmlmeTIoYSwgYik7XG5cbiAgdmFyIHJlcyA9IGEuaWFkZChiKTtcbiAgaWYgKHJlcy5jbXAodGhpcy5tKSA+PSAwKVxuICAgIHJlcy5pc3ViKHRoaXMubSk7XG4gIHJldHVybiByZXM7XG59O1xuXG5SZWQucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uIHN1YihhLCBiKSB7XG4gIHRoaXMuX3ZlcmlmeTIoYSwgYik7XG5cbiAgdmFyIHJlcyA9IGEuc3ViKGIpO1xuICBpZiAocmVzLmNtcG4oMCkgPCAwKVxuICAgIHJlcy5pYWRkKHRoaXMubSk7XG4gIHJldHVybiByZXMuX2ZvcmNlUmVkKHRoaXMpO1xufTtcblxuUmVkLnByb3RvdHlwZS5pc3ViID0gZnVuY3Rpb24gaXN1YihhLCBiKSB7XG4gIHRoaXMuX3ZlcmlmeTIoYSwgYik7XG5cbiAgdmFyIHJlcyA9IGEuaXN1YihiKTtcbiAgaWYgKHJlcy5jbXBuKDApIDwgMClcbiAgICByZXMuaWFkZCh0aGlzLm0pO1xuICByZXR1cm4gcmVzO1xufTtcblxuUmVkLnByb3RvdHlwZS5zaGwgPSBmdW5jdGlvbiBzaGwoYSwgbnVtKSB7XG4gIHRoaXMuX3ZlcmlmeTEoYSk7XG4gIHJldHVybiB0aGlzLmltb2QoYS5zaGxuKG51bSkpO1xufTtcblxuUmVkLnByb3RvdHlwZS5pbXVsID0gZnVuY3Rpb24gaW11bChhLCBiKSB7XG4gIHRoaXMuX3ZlcmlmeTIoYSwgYik7XG4gIHJldHVybiB0aGlzLmltb2QoYS5pbXVsKGIpKTtcbn07XG5cblJlZC5wcm90b3R5cGUubXVsID0gZnVuY3Rpb24gbXVsKGEsIGIpIHtcbiAgdGhpcy5fdmVyaWZ5MihhLCBiKTtcbiAgcmV0dXJuIHRoaXMuaW1vZChhLm11bChiKSk7XG59O1xuXG5SZWQucHJvdG90eXBlLmlzcXIgPSBmdW5jdGlvbiBpc3FyKGEpIHtcbiAgcmV0dXJuIHRoaXMuaW11bChhLCBhKTtcbn07XG5cblJlZC5wcm90b3R5cGUuc3FyID0gZnVuY3Rpb24gc3FyKGEpIHtcbiAgcmV0dXJuIHRoaXMubXVsKGEsIGEpO1xufTtcblxuUmVkLnByb3RvdHlwZS5zcXJ0ID0gZnVuY3Rpb24gc3FydChhKSB7XG4gIGlmIChhLmNtcG4oMCkgPT09IDApXG4gICAgcmV0dXJuIGEuY2xvbmUoKTtcblxuICB2YXIgbW9kMyA9IHRoaXMubS5hbmRsbigzKTtcbiAgYXNzZXJ0KG1vZDMgJSAyID09PSAxKTtcblxuICAvLyBGYXN0IGNhc2VcbiAgaWYgKG1vZDMgPT09IDMpIHtcbiAgICB2YXIgcG93ID0gdGhpcy5tLmFkZChuZXcgQk4oMSkpLmlzaHJuKDIpO1xuICAgIHZhciByID0gdGhpcy5wb3coYSwgcG93KTtcbiAgICByZXR1cm4gcjtcbiAgfVxuXG4gIC8vIFRvbmVsbGktU2hhbmtzIGFsZ29yaXRobSAoVG90YWxseSB1bm9wdGltaXplZCBhbmQgc2xvdylcbiAgLy9cbiAgLy8gRmluZCBRIGFuZCBTLCB0aGF0IFEgKiAyIF4gUyA9IChQIC0gMSlcbiAgdmFyIHEgPSB0aGlzLm0uc3VibigxKTtcbiAgdmFyIHMgPSAwO1xuICB3aGlsZSAocS5jbXBuKDApICE9PSAwICYmIHEuYW5kbG4oMSkgPT09IDApIHtcbiAgICBzKys7XG4gICAgcS5pc2hybigxKTtcbiAgfVxuICBhc3NlcnQocS5jbXBuKDApICE9PSAwKTtcblxuICB2YXIgb25lID0gbmV3IEJOKDEpLnRvUmVkKHRoaXMpO1xuICB2YXIgbk9uZSA9IG9uZS5yZWROZWcoKTtcblxuICAvLyBGaW5kIHF1YWRyYXRpYyBub24tcmVzaWR1ZVxuICAvLyBOT1RFOiBNYXggaXMgc3VjaCBiZWNhdXNlIG9mIGdlbmVyYWxpemVkIFJpZW1hbm4gaHlwb3RoZXNpcy5cbiAgdmFyIGxwb3cgPSB0aGlzLm0uc3VibigxKS5pc2hybigxKTtcbiAgdmFyIHogPSB0aGlzLm0uYml0TGVuZ3RoKCk7XG4gIHogPSBuZXcgQk4oMiAqIHogKiB6KS50b1JlZCh0aGlzKTtcbiAgd2hpbGUgKHRoaXMucG93KHosIGxwb3cpLmNtcChuT25lKSAhPT0gMClcbiAgICB6LnJlZElBZGQobk9uZSk7XG5cbiAgdmFyIGMgPSB0aGlzLnBvdyh6LCBxKTtcbiAgdmFyIHIgPSB0aGlzLnBvdyhhLCBxLmFkZG4oMSkuaXNocm4oMSkpO1xuICB2YXIgdCA9IHRoaXMucG93KGEsIHEpO1xuICB2YXIgbSA9IHM7XG4gIHdoaWxlICh0LmNtcChvbmUpICE9PSAwKSB7XG4gICAgdmFyIHRtcCA9IHQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IHRtcC5jbXAob25lKSAhPT0gMDsgaSsrKVxuICAgICAgdG1wID0gdG1wLnJlZFNxcigpO1xuICAgIGFzc2VydChpIDwgbSk7XG4gICAgdmFyIGIgPSB0aGlzLnBvdyhjLCBuZXcgQk4oMSkuaXNobG4obSAtIGkgLSAxKSk7XG5cbiAgICByID0gci5yZWRNdWwoYik7XG4gICAgYyA9IGIucmVkU3FyKCk7XG4gICAgdCA9IHQucmVkTXVsKGMpO1xuICAgIG0gPSBpO1xuICB9XG5cbiAgcmV0dXJuIHI7XG59O1xuXG5SZWQucHJvdG90eXBlLmludm0gPSBmdW5jdGlvbiBpbnZtKGEpIHtcbiAgdmFyIGludiA9IGEuX2ludm1wKHRoaXMubSk7XG4gIGlmIChpbnYuc2lnbikge1xuICAgIGludi5zaWduID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXMuaW1vZChpbnYpLnJlZE5lZygpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0aGlzLmltb2QoaW52KTtcbiAgfVxufTtcblxuUmVkLnByb3RvdHlwZS5wb3cgPSBmdW5jdGlvbiBwb3coYSwgbnVtKSB7XG4gIHZhciB3ID0gW107XG5cbiAgaWYgKG51bS5jbXBuKDApID09PSAwKVxuICAgIHJldHVybiBuZXcgQk4oMSk7XG5cbiAgdmFyIHEgPSBudW0uY2xvbmUoKTtcblxuICB3aGlsZSAocS5jbXBuKDApICE9PSAwKSB7XG4gICAgdy5wdXNoKHEuYW5kbG4oMSkpO1xuICAgIHEuaXNocm4oMSk7XG4gIH1cblxuICAvLyBTa2lwIGxlYWRpbmcgemVyb2VzXG4gIHZhciByZXMgPSBhO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHcubGVuZ3RoOyBpKyssIHJlcyA9IHRoaXMuc3FyKHJlcykpXG4gICAgaWYgKHdbaV0gIT09IDApXG4gICAgICBicmVhaztcblxuICBpZiAoKytpIDwgdy5sZW5ndGgpIHtcbiAgICBmb3IgKHZhciBxID0gdGhpcy5zcXIocmVzKTsgaSA8IHcubGVuZ3RoOyBpKyssIHEgPSB0aGlzLnNxcihxKSkge1xuICAgICAgaWYgKHdbaV0gPT09IDApXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgcmVzID0gdGhpcy5tdWwocmVzLCBxKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzO1xufTtcblxuUmVkLnByb3RvdHlwZS5jb252ZXJ0VG8gPSBmdW5jdGlvbiBjb252ZXJ0VG8obnVtKSB7XG4gIHZhciByID0gbnVtLm1vZCh0aGlzLm0pO1xuICBpZiAociA9PT0gbnVtKVxuICAgIHJldHVybiByLmNsb25lKCk7XG4gIGVsc2VcbiAgICByZXR1cm4gcjtcbn07XG5cblJlZC5wcm90b3R5cGUuY29udmVydEZyb20gPSBmdW5jdGlvbiBjb252ZXJ0RnJvbShudW0pIHtcbiAgdmFyIHJlcyA9IG51bS5jbG9uZSgpO1xuICByZXMucmVkID0gbnVsbDtcbiAgcmV0dXJuIHJlcztcbn07XG5cbi8vXG4vLyBNb250Z29tZXJ5IG1ldGhvZCBlbmdpbmVcbi8vXG5cbkJOLm1vbnQgPSBmdW5jdGlvbiBtb250KG51bSkge1xuICByZXR1cm4gbmV3IE1vbnQobnVtKTtcbn07XG5cbmZ1bmN0aW9uIE1vbnQobSkge1xuICBSZWQuY2FsbCh0aGlzLCBtKTtcblxuICB0aGlzLnNoaWZ0ID0gdGhpcy5tLmJpdExlbmd0aCgpO1xuICBpZiAodGhpcy5zaGlmdCAlIDI2ICE9PSAwKVxuICAgIHRoaXMuc2hpZnQgKz0gMjYgLSAodGhpcy5zaGlmdCAlIDI2KTtcbiAgdGhpcy5yID0gbmV3IEJOKDEpLmlzaGxuKHRoaXMuc2hpZnQpO1xuICB0aGlzLnIyID0gdGhpcy5pbW9kKHRoaXMuci5zcXIoKSk7XG4gIHRoaXMucmludiA9IHRoaXMuci5faW52bXAodGhpcy5tKTtcblxuICB0aGlzLm1pbnYgPSB0aGlzLnJpbnYubXVsKHRoaXMucikuaXN1Ym4oMSkuZGl2KHRoaXMubSk7XG4gIHRoaXMubWludi5zaWduID0gdHJ1ZTtcbiAgdGhpcy5taW52ID0gdGhpcy5taW52Lm1vZCh0aGlzLnIpO1xufVxuaW5oZXJpdHMoTW9udCwgUmVkKTtcblxuTW9udC5wcm90b3R5cGUuY29udmVydFRvID0gZnVuY3Rpb24gY29udmVydFRvKG51bSkge1xuICByZXR1cm4gdGhpcy5pbW9kKG51bS5zaGxuKHRoaXMuc2hpZnQpKTtcbn07XG5cbk1vbnQucHJvdG90eXBlLmNvbnZlcnRGcm9tID0gZnVuY3Rpb24gY29udmVydEZyb20obnVtKSB7XG4gIHZhciByID0gdGhpcy5pbW9kKG51bS5tdWwodGhpcy5yaW52KSk7XG4gIHIucmVkID0gbnVsbDtcbiAgcmV0dXJuIHI7XG59O1xuXG5Nb250LnByb3RvdHlwZS5pbXVsID0gZnVuY3Rpb24gaW11bChhLCBiKSB7XG4gIGlmIChhLmNtcG4oMCkgPT09IDAgfHwgYi5jbXBuKDApID09PSAwKSB7XG4gICAgYS53b3Jkc1swXSA9IDA7XG4gICAgYS5sZW5ndGggPSAxO1xuICAgIHJldHVybiBhO1xuICB9XG5cbiAgdmFyIHQgPSBhLmltdWwoYik7XG4gIHZhciBjID0gdC5tYXNrbih0aGlzLnNoaWZ0KS5tdWwodGhpcy5taW52KS5pbWFza24odGhpcy5zaGlmdCkubXVsKHRoaXMubSk7XG4gIHZhciB1ID0gdC5pc3ViKGMpLmlzaHJuKHRoaXMuc2hpZnQpO1xuICB2YXIgcmVzID0gdTtcbiAgaWYgKHUuY21wKHRoaXMubSkgPj0gMClcbiAgICByZXMgPSB1LmlzdWIodGhpcy5tKTtcbiAgZWxzZSBpZiAodS5jbXBuKDApIDwgMClcbiAgICByZXMgPSB1LmlhZGQodGhpcy5tKTtcblxuICByZXR1cm4gcmVzLl9mb3JjZVJlZCh0aGlzKTtcbn07XG5cbk1vbnQucHJvdG90eXBlLm11bCA9IGZ1bmN0aW9uIG11bChhLCBiKSB7XG4gIGlmIChhLmNtcG4oMCkgPT09IDAgfHwgYi5jbXBuKDApID09PSAwKVxuICAgIHJldHVybiBuZXcgQk4oMCkuX2ZvcmNlUmVkKHRoaXMpO1xuXG4gIHZhciB0ID0gYS5tdWwoYik7XG4gIHZhciBjID0gdC5tYXNrbih0aGlzLnNoaWZ0KS5tdWwodGhpcy5taW52KS5pbWFza24odGhpcy5zaGlmdCkubXVsKHRoaXMubSk7XG4gIHZhciB1ID0gdC5pc3ViKGMpLmlzaHJuKHRoaXMuc2hpZnQpO1xuICB2YXIgcmVzID0gdTtcbiAgaWYgKHUuY21wKHRoaXMubSkgPj0gMClcbiAgICByZXMgPSB1LmlzdWIodGhpcy5tKTtcbiAgZWxzZSBpZiAodS5jbXBuKDApIDwgMClcbiAgICByZXMgPSB1LmlhZGQodGhpcy5tKTtcblxuICByZXR1cm4gcmVzLl9mb3JjZVJlZCh0aGlzKTtcbn07XG5cbk1vbnQucHJvdG90eXBlLmludm0gPSBmdW5jdGlvbiBpbnZtKGEpIHtcbiAgLy8gKEFSKV4tMSAqIFJeMiA9IChBXi0xICogUl4tMSkgKiBSXjIgPSBBXi0xICogUlxuICB2YXIgcmVzID0gdGhpcy5pbW9kKGEuX2ludm1wKHRoaXMubSkubXVsKHRoaXMucjIpKTtcbiAgcmV0dXJuIHJlcy5fZm9yY2VSZWQodGhpcyk7XG59O1xuXG59KSh0eXBlb2YgbW9kdWxlID09PSAndW5kZWZpbmVkJyB8fCBtb2R1bGUsIHRoaXMpO1xuIiwidmFyIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xuXG5leHBvcnRzLnRhZ0NsYXNzID0ge1xuICAwOiAndW5pdmVyc2FsJyxcbiAgMTogJ2FwcGxpY2F0aW9uJyxcbiAgMjogJ2NvbnRleHQnLFxuICAzOiAncHJpdmF0ZSdcbn07XG5leHBvcnRzLnRhZ0NsYXNzQnlOYW1lID0gY29uc3RhbnRzLl9yZXZlcnNlKGV4cG9ydHMudGFnQ2xhc3MpO1xuXG5leHBvcnRzLnRhZyA9IHtcbiAgMHgwMDogJ2VuZCcsXG4gIDB4MDE6ICdib29sJyxcbiAgMHgwMjogJ2ludCcsXG4gIDB4MDM6ICdiaXRzdHInLFxuICAweDA0OiAnb2N0c3RyJyxcbiAgMHgwNTogJ251bGxfJyxcbiAgMHgwNjogJ29iamlkJyxcbiAgMHgwNzogJ29iakRlc2MnLFxuICAweDA4OiAnZXh0ZXJuYWwnLFxuICAweDA5OiAncmVhbCcsXG4gIDB4MGE6ICdlbnVtJyxcbiAgMHgwYjogJ2VtYmVkJyxcbiAgMHgwYzogJ3V0ZjhzdHInLFxuICAweDBkOiAncmVsYXRpdmVPaWQnLFxuICAweDEwOiAnc2VxJyxcbiAgMHgxMTogJ3NldCcsXG4gIDB4MTI6ICdudW1zdHInLFxuICAweDEzOiAncHJpbnRzdHInLFxuICAweDE0OiAndDYxc3RyJyxcbiAgMHgxNTogJ3ZpZGVvc3RyJyxcbiAgMHgxNjogJ2lhNXN0cicsXG4gIDB4MTc6ICd1dGN0aW1lJyxcbiAgMHgxODogJ2dlbnRpbWUnLFxuICAweDE5OiAnZ3JhcGhzdHInLFxuICAweDFhOiAnaXNvNjQ2c3RyJyxcbiAgMHgxYjogJ2dlbnN0cicsXG4gIDB4MWM6ICd1bmlzdHInLFxuICAweDFkOiAnY2hhcnN0cicsXG4gIDB4MWU6ICdibXBzdHInXG59O1xuZXhwb3J0cy50YWdCeU5hbWUgPSBjb25zdGFudHMuX3JldmVyc2UoZXhwb3J0cy50YWcpO1xuIiwidmFyIGNvbnN0YW50cyA9IGV4cG9ydHM7XG5cbi8vIEhlbHBlclxuY29uc3RhbnRzLl9yZXZlcnNlID0gZnVuY3Rpb24gcmV2ZXJzZShtYXApIHtcbiAgdmFyIHJlcyA9IHt9O1xuXG4gIE9iamVjdC5rZXlzKG1hcCkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAvLyBDb252ZXJ0IGtleSB0byBpbnRlZ2VyIGlmIGl0IGlzIHN0cmluZ2lmaWVkXG4gICAgaWYgKChrZXkgfCAwKSA9PSBrZXkpXG4gICAgICBrZXkgPSBrZXkgfCAwO1xuXG4gICAgdmFyIHZhbHVlID0gbWFwW2tleV07XG4gICAgcmVzW3ZhbHVlXSA9IGtleTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJlcztcbn07XG5cbmNvbnN0YW50cy5kZXIgPSByZXF1aXJlKCcuL2RlcicpO1xuIiwidmFyIGluaGVyaXRzID0gcmVxdWlyZSgndXRpbCcpLmluaGVyaXRzO1xuXG52YXIgYXNuMSA9IHJlcXVpcmUoJy4uL2FzbjEnKTtcbnZhciBiYXNlID0gYXNuMS5iYXNlO1xudmFyIGJpZ251bSA9IGFzbjEuYmlnbnVtO1xuXG4vLyBJbXBvcnQgREVSIGNvbnN0YW50c1xudmFyIGRlciA9IGFzbjEuY29uc3RhbnRzLmRlcjtcblxuZnVuY3Rpb24gREVSRGVjb2RlcihlbnRpdHkpIHtcbiAgdGhpcy5lbmMgPSAnZGVyJztcbiAgdGhpcy5uYW1lID0gZW50aXR5Lm5hbWU7XG4gIHRoaXMuZW50aXR5ID0gZW50aXR5O1xuXG4gIC8vIENvbnN0cnVjdCBiYXNlIHRyZWVcbiAgdGhpcy50cmVlID0gbmV3IERFUk5vZGUoKTtcbiAgdGhpcy50cmVlLl9pbml0KGVudGl0eS5ib2R5KTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IERFUkRlY29kZXI7XG5cbkRFUkRlY29kZXIucHJvdG90eXBlLmRlY29kZSA9IGZ1bmN0aW9uIGRlY29kZShkYXRhLCBvcHRpb25zKSB7XG4gIGlmICghKGRhdGEgaW5zdGFuY2VvZiBiYXNlLkRlY29kZXJCdWZmZXIpKVxuICAgIGRhdGEgPSBuZXcgYmFzZS5EZWNvZGVyQnVmZmVyKGRhdGEsIG9wdGlvbnMpO1xuXG4gIHJldHVybiB0aGlzLnRyZWUuX2RlY29kZShkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8vIFRyZWUgbWV0aG9kc1xuXG5mdW5jdGlvbiBERVJOb2RlKHBhcmVudCkge1xuICBiYXNlLk5vZGUuY2FsbCh0aGlzLCAnZGVyJywgcGFyZW50KTtcbn1cbmluaGVyaXRzKERFUk5vZGUsIGJhc2UuTm9kZSk7XG5cbkRFUk5vZGUucHJvdG90eXBlLl9wZWVrVGFnID0gZnVuY3Rpb24gcGVla1RhZyhidWZmZXIsIHRhZywgYW55KSB7XG4gIGlmIChidWZmZXIuaXNFbXB0eSgpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICB2YXIgc3RhdGUgPSBidWZmZXIuc2F2ZSgpO1xuICB2YXIgZGVjb2RlZFRhZyA9IGRlckRlY29kZVRhZyhidWZmZXIsICdGYWlsZWQgdG8gcGVlayB0YWc6IFwiJyArIHRhZyArICdcIicpO1xuICBpZiAoYnVmZmVyLmlzRXJyb3IoZGVjb2RlZFRhZykpXG4gICAgcmV0dXJuIGRlY29kZWRUYWc7XG5cbiAgYnVmZmVyLnJlc3RvcmUoc3RhdGUpO1xuXG4gIHJldHVybiBkZWNvZGVkVGFnLnRhZyA9PT0gdGFnIHx8IGRlY29kZWRUYWcudGFnU3RyID09PSB0YWcgfHwgYW55O1xufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX2RlY29kZVRhZyA9IGZ1bmN0aW9uIGRlY29kZVRhZyhidWZmZXIsIHRhZywgYW55KSB7XG4gIHZhciBkZWNvZGVkVGFnID0gZGVyRGVjb2RlVGFnKGJ1ZmZlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhaWxlZCB0byBkZWNvZGUgdGFnIG9mIFwiJyArIHRhZyArICdcIicpO1xuICBpZiAoYnVmZmVyLmlzRXJyb3IoZGVjb2RlZFRhZykpXG4gICAgcmV0dXJuIGRlY29kZWRUYWc7XG5cbiAgdmFyIGxlbiA9IGRlckRlY29kZUxlbihidWZmZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgZGVjb2RlZFRhZy5wcmltaXRpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhaWxlZCB0byBnZXQgbGVuZ3RoIG9mIFwiJyArIHRhZyArICdcIicpO1xuXG4gIC8vIEZhaWx1cmVcbiAgaWYgKGJ1ZmZlci5pc0Vycm9yKGxlbikpXG4gICAgcmV0dXJuIGxlbjtcblxuICBpZiAoIWFueSAmJlxuICAgICAgZGVjb2RlZFRhZy50YWcgIT09IHRhZyAmJlxuICAgICAgZGVjb2RlZFRhZy50YWdTdHIgIT09IHRhZyAmJlxuICAgICAgZGVjb2RlZFRhZy50YWdTdHIgKyAnb2YnICE9PSB0YWcpIHtcbiAgICByZXR1cm4gYnVmZmVyLmVycm9yKCdGYWlsZWQgdG8gbWF0Y2ggdGFnOiBcIicgKyB0YWcgKyAnXCInKTtcbiAgfVxuXG4gIGlmIChkZWNvZGVkVGFnLnByaW1pdGl2ZSB8fCBsZW4gIT09IG51bGwpXG4gICAgcmV0dXJuIGJ1ZmZlci5za2lwKGxlbiwgJ0ZhaWxlZCB0byBtYXRjaCBib2R5IG9mOiBcIicgKyB0YWcgKyAnXCInKTtcblxuICAvLyBJbmRlZmluaXRlIGxlbmd0aC4uLiBmaW5kIEVORCB0YWdcbiAgdmFyIHN0YXRlID0gYnVmZmVyLnNhdmUoKTtcbiAgdmFyIHJlcyA9IHRoaXMuX3NraXBVbnRpbEVuZChcbiAgICAgIGJ1ZmZlcixcbiAgICAgICdGYWlsZWQgdG8gc2tpcCBpbmRlZmluaXRlIGxlbmd0aCBib2R5OiBcIicgKyB0aGlzLnRhZyArICdcIicpO1xuICBpZiAoYnVmZmVyLmlzRXJyb3IocmVzKSlcbiAgICByZXR1cm4gcmVzO1xuXG4gIGxlbiA9IGJ1ZmZlci5vZmZzZXQgLSBzdGF0ZS5vZmZzZXQ7XG4gIGJ1ZmZlci5yZXN0b3JlKHN0YXRlKTtcbiAgcmV0dXJuIGJ1ZmZlci5za2lwKGxlbiwgJ0ZhaWxlZCB0byBtYXRjaCBib2R5IG9mOiBcIicgKyB0YWcgKyAnXCInKTtcbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl9za2lwVW50aWxFbmQgPSBmdW5jdGlvbiBza2lwVW50aWxFbmQoYnVmZmVyLCBmYWlsKSB7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgdmFyIHRhZyA9IGRlckRlY29kZVRhZyhidWZmZXIsIGZhaWwpO1xuICAgIGlmIChidWZmZXIuaXNFcnJvcih0YWcpKVxuICAgICAgcmV0dXJuIHRhZztcbiAgICB2YXIgbGVuID0gZGVyRGVjb2RlTGVuKGJ1ZmZlciwgdGFnLnByaW1pdGl2ZSwgZmFpbCk7XG4gICAgaWYgKGJ1ZmZlci5pc0Vycm9yKGxlbikpXG4gICAgICByZXR1cm4gbGVuO1xuXG4gICAgdmFyIHJlcztcbiAgICBpZiAodGFnLnByaW1pdGl2ZSB8fCBsZW4gIT09IG51bGwpXG4gICAgICByZXMgPSBidWZmZXIuc2tpcChsZW4pXG4gICAgZWxzZVxuICAgICAgcmVzID0gdGhpcy5fc2tpcFVudGlsRW5kKGJ1ZmZlciwgZmFpbCk7XG5cbiAgICAvLyBGYWlsdXJlXG4gICAgaWYgKGJ1ZmZlci5pc0Vycm9yKHJlcykpXG4gICAgICByZXR1cm4gcmVzO1xuXG4gICAgaWYgKHRhZy50YWdTdHIgPT09ICdlbmQnKVxuICAgICAgYnJlYWs7XG4gIH1cbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl9kZWNvZGVMaXN0ID0gZnVuY3Rpb24gZGVjb2RlTGlzdChidWZmZXIsIHRhZywgZGVjb2Rlcikge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHdoaWxlICghYnVmZmVyLmlzRW1wdHkoKSkge1xuICAgIHZhciBwb3NzaWJsZUVuZCA9IHRoaXMuX3BlZWtUYWcoYnVmZmVyLCAnZW5kJyk7XG4gICAgaWYgKGJ1ZmZlci5pc0Vycm9yKHBvc3NpYmxlRW5kKSlcbiAgICAgIHJldHVybiBwb3NzaWJsZUVuZDtcblxuICAgIHZhciByZXMgPSBkZWNvZGVyLmRlY29kZShidWZmZXIsICdkZXInKTtcbiAgICBpZiAoYnVmZmVyLmlzRXJyb3IocmVzKSAmJiBwb3NzaWJsZUVuZClcbiAgICAgIGJyZWFrO1xuICAgIHJlc3VsdC5wdXNoKHJlcyk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl9kZWNvZGVTdHIgPSBmdW5jdGlvbiBkZWNvZGVTdHIoYnVmZmVyLCB0YWcpIHtcbiAgaWYgKHRhZyA9PT0gJ29jdHN0cicpIHtcbiAgICByZXR1cm4gYnVmZmVyLnJhdygpO1xuICB9IGVsc2UgaWYgKHRhZyA9PT0gJ2JpdHN0cicpIHtcbiAgICB2YXIgdW51c2VkID0gYnVmZmVyLnJlYWRVSW50OCgpO1xuICAgIGlmIChidWZmZXIuaXNFcnJvcih1bnVzZWQpKVxuICAgICAgcmV0dXJuIHVudXNlZDtcblxuICAgIHJldHVybiB7IHVudXNlZDogdW51c2VkLCBkYXRhOiBidWZmZXIucmF3KCkgfTtcbiAgfSBlbHNlIGlmICh0YWcgPT09ICdpYTVzdHInIHx8IHRhZyA9PT0gJ3V0ZjhzdHInKSB7XG4gICAgcmV0dXJuIGJ1ZmZlci5yYXcoKS50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0aGlzLmVycm9yKCdEZWNvZGluZyBvZiBzdHJpbmcgdHlwZTogJyArIHRhZyArICcgdW5zdXBwb3J0ZWQnKTtcbiAgfVxufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX2RlY29kZU9iamlkID0gZnVuY3Rpb24gZGVjb2RlT2JqaWQoYnVmZmVyLCB2YWx1ZXMsIHJlbGF0aXZlKSB7XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuICB2YXIgaWRlbnQgPSAwO1xuICB3aGlsZSAoIWJ1ZmZlci5pc0VtcHR5KCkpIHtcbiAgICB2YXIgc3ViaWRlbnQgPSBidWZmZXIucmVhZFVJbnQ4KCk7XG4gICAgaWRlbnQgPDw9IDc7XG4gICAgaWRlbnQgfD0gc3ViaWRlbnQgJiAweDdmO1xuICAgIGlmICgoc3ViaWRlbnQgJiAweDgwKSA9PT0gMCkge1xuICAgICAgaWRlbnRpZmllcnMucHVzaChpZGVudCk7XG4gICAgICBpZGVudCA9IDA7XG4gICAgfVxuICB9XG4gIGlmIChzdWJpZGVudCAmIDB4ODApXG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudCk7XG5cbiAgdmFyIGZpcnN0ID0gKGlkZW50aWZpZXJzWzBdIC8gNDApIHwgMDtcbiAgdmFyIHNlY29uZCA9IGlkZW50aWZpZXJzWzBdICUgNDA7XG5cbiAgaWYgKHJlbGF0aXZlKVxuICAgIHJlc3VsdCA9IGlkZW50aWZpZXJzO1xuICBlbHNlXG4gICAgcmVzdWx0ID0gW2ZpcnN0LCBzZWNvbmRdLmNvbmNhdChpZGVudGlmaWVycy5zbGljZSgxKSk7XG5cbiAgaWYgKHZhbHVlcylcbiAgICByZXN1bHQgPSB2YWx1ZXNbcmVzdWx0LmpvaW4oJyAnKV07XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl9kZWNvZGVUaW1lID0gZnVuY3Rpb24gZGVjb2RlVGltZShidWZmZXIsIHRhZykge1xuICB2YXIgc3RyID0gYnVmZmVyLnJhdygpLnRvU3RyaW5nKCk7XG4gIGlmICh0YWcgPT09ICdnZW50aW1lJykge1xuICAgIHZhciB5ZWFyID0gc3RyLnNsaWNlKDAsIDQpIHwgMDtcbiAgICB2YXIgbW9uID0gc3RyLnNsaWNlKDQsIDYpIHwgMDtcbiAgICB2YXIgZGF5ID0gc3RyLnNsaWNlKDYsIDgpIHwgMDtcbiAgICB2YXIgaG91ciA9IHN0ci5zbGljZSg4LCAxMCkgfCAwO1xuICAgIHZhciBtaW4gPSBzdHIuc2xpY2UoMTAsIDEyKSB8IDA7XG4gICAgdmFyIHNlYyA9IHN0ci5zbGljZSgxMiwgMTQpIHwgMDtcbiAgfSBlbHNlIGlmICh0YWcgPT09ICd1dGN0aW1lJykge1xuICAgIHZhciB5ZWFyID0gc3RyLnNsaWNlKDAsIDIpIHwgMDtcbiAgICB2YXIgbW9uID0gc3RyLnNsaWNlKDIsIDQpIHwgMDtcbiAgICB2YXIgZGF5ID0gc3RyLnNsaWNlKDQsIDYpIHwgMDtcbiAgICB2YXIgaG91ciA9IHN0ci5zbGljZSg2LCA4KSB8IDA7XG4gICAgdmFyIG1pbiA9IHN0ci5zbGljZSg4LCAxMCkgfCAwO1xuICAgIHZhciBzZWMgPSBzdHIuc2xpY2UoMTAsIDEyKSB8IDA7XG4gICAgaWYgKHllYXIgPCA3MClcbiAgICAgIHllYXIgPSAyMDAwICsgeWVhcjtcbiAgICBlbHNlXG4gICAgICB5ZWFyID0gMTkwMCArIHllYXI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMuZXJyb3IoJ0RlY29kaW5nICcgKyB0YWcgKyAnIHRpbWUgaXMgbm90IHN1cHBvcnRlZCB5ZXQnKTtcbiAgfVxuXG4gIHJldHVybiBEYXRlLlVUQyh5ZWFyLCBtb24gLSAxLCBkYXksIGhvdXIsIG1pbiwgc2VjLCAwKTtcbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl9kZWNvZGVOdWxsID0gZnVuY3Rpb24gZGVjb2RlTnVsbChidWZmZXIpIHtcbiAgcmV0dXJuIG51bGw7XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fZGVjb2RlQm9vbCA9IGZ1bmN0aW9uIGRlY29kZUJvb2woYnVmZmVyKSB7XG4gIHZhciByZXMgPSBidWZmZXIucmVhZFVJbnQ4KCk7XG4gIGlmIChidWZmZXIuaXNFcnJvcihyZXMpKVxuICAgIHJldHVybiByZXM7XG4gIGVsc2VcbiAgICByZXR1cm4gcmVzICE9PSAwO1xufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX2RlY29kZUludCA9IGZ1bmN0aW9uIGRlY29kZUludChidWZmZXIsIHZhbHVlcykge1xuICAvLyBCaWdpbnQsIHJldHVybiBhcyBpdCBpcyAoYXNzdW1lIGJpZyBlbmRpYW4pXG4gIHZhciByYXcgPSBidWZmZXIucmF3KCk7XG4gIHZhciByZXMgPSBuZXcgYmlnbnVtKHJhdyk7XG5cbiAgaWYgKHZhbHVlcylcbiAgICByZXMgPSB2YWx1ZXNbcmVzLnRvU3RyaW5nKDEwKV0gfHwgcmVzO1xuXG4gIHJldHVybiByZXM7XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fdXNlID0gZnVuY3Rpb24gdXNlKGVudGl0eSwgb2JqKSB7XG4gIGlmICh0eXBlb2YgZW50aXR5ID09PSAnZnVuY3Rpb24nKVxuICAgIGVudGl0eSA9IGVudGl0eShvYmopO1xuICByZXR1cm4gZW50aXR5Ll9nZXREZWNvZGVyKCdkZXInKS50cmVlO1xufTtcblxuLy8gVXRpbGl0eSBtZXRob2RzXG5cbmZ1bmN0aW9uIGRlckRlY29kZVRhZyhidWYsIGZhaWwpIHtcbiAgdmFyIHRhZyA9IGJ1Zi5yZWFkVUludDgoZmFpbCk7XG4gIGlmIChidWYuaXNFcnJvcih0YWcpKVxuICAgIHJldHVybiB0YWc7XG5cbiAgdmFyIGNscyA9IGRlci50YWdDbGFzc1t0YWcgPj4gNl07XG4gIHZhciBwcmltaXRpdmUgPSAodGFnICYgMHgyMCkgPT09IDA7XG5cbiAgLy8gTXVsdGktb2N0ZXQgdGFnIC0gbG9hZFxuICBpZiAoKHRhZyAmIDB4MWYpID09PSAweDFmKSB7XG4gICAgdmFyIG9jdCA9IHRhZztcbiAgICB0YWcgPSAwO1xuICAgIHdoaWxlICgob2N0ICYgMHg4MCkgPT09IDB4ODApIHtcbiAgICAgIG9jdCA9IGJ1Zi5yZWFkVUludDgoZmFpbCk7XG4gICAgICBpZiAoYnVmLmlzRXJyb3Iob2N0KSlcbiAgICAgICAgcmV0dXJuIG9jdDtcblxuICAgICAgdGFnIDw8PSA3O1xuICAgICAgdGFnIHw9IG9jdCAmIDB4N2Y7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRhZyAmPSAweDFmO1xuICB9XG4gIHZhciB0YWdTdHIgPSBkZXIudGFnW3RhZ107XG5cbiAgcmV0dXJuIHtcbiAgICBjbHM6IGNscyxcbiAgICBwcmltaXRpdmU6IHByaW1pdGl2ZSxcbiAgICB0YWc6IHRhZyxcbiAgICB0YWdTdHI6IHRhZ1N0clxuICB9O1xufVxuXG5mdW5jdGlvbiBkZXJEZWNvZGVMZW4oYnVmLCBwcmltaXRpdmUsIGZhaWwpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5yZWFkVUludDgoZmFpbCk7XG4gIGlmIChidWYuaXNFcnJvcihsZW4pKVxuICAgIHJldHVybiBsZW47XG5cbiAgLy8gSW5kZWZpbml0ZSBmb3JtXG4gIGlmICghcHJpbWl0aXZlICYmIGxlbiA9PT0gMHg4MClcbiAgICByZXR1cm4gbnVsbDtcblxuICAvLyBEZWZpbml0ZSBmb3JtXG4gIGlmICgobGVuICYgMHg4MCkgPT09IDApIHtcbiAgICAvLyBTaG9ydCBmb3JtXG4gICAgcmV0dXJuIGxlbjtcbiAgfVxuXG4gIC8vIExvbmcgZm9ybVxuICB2YXIgbnVtID0gbGVuICYgMHg3ZjtcbiAgaWYgKG51bSA+PSA0KVxuICAgIHJldHVybiBidWYuZXJyb3IoJ2xlbmd0aCBvY3RlY3QgaXMgdG9vIGxvbmcnKTtcblxuICBsZW4gPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgbGVuIDw8PSA4O1xuICAgIHZhciBqID0gYnVmLnJlYWRVSW50OChmYWlsKTtcbiAgICBpZiAoYnVmLmlzRXJyb3IoaikpXG4gICAgICByZXR1cm4gajtcbiAgICBsZW4gfD0gajtcbiAgfVxuXG4gIHJldHVybiBsZW47XG59XG4iLCJ2YXIgZGVjb2RlcnMgPSBleHBvcnRzO1xuXG5kZWNvZGVycy5kZXIgPSByZXF1aXJlKCcuL2RlcicpO1xuZGVjb2RlcnMucGVtID0gcmVxdWlyZSgnLi9wZW0nKTtcbiIsInZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ3V0aWwnKS5pbmhlcml0cztcbnZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7XG5cbnZhciBhc24xID0gcmVxdWlyZSgnLi4vYXNuMScpO1xudmFyIERFUkRlY29kZXIgPSByZXF1aXJlKCcuL2RlcicpO1xuXG5mdW5jdGlvbiBQRU1EZWNvZGVyKGVudGl0eSkge1xuICBERVJEZWNvZGVyLmNhbGwodGhpcywgZW50aXR5KTtcbiAgdGhpcy5lbmMgPSAncGVtJztcbn07XG5pbmhlcml0cyhQRU1EZWNvZGVyLCBERVJEZWNvZGVyKTtcbm1vZHVsZS5leHBvcnRzID0gUEVNRGVjb2RlcjtcblxuUEVNRGVjb2Rlci5wcm90b3R5cGUuZGVjb2RlID0gZnVuY3Rpb24gZGVjb2RlKGRhdGEsIG9wdGlvbnMpIHtcbiAgdmFyIGxpbmVzID0gZGF0YS50b1N0cmluZygpLnNwbGl0KC9bXFxyXFxuXSsvZyk7XG5cbiAgdmFyIGxhYmVsID0gb3B0aW9ucy5sYWJlbC50b1VwcGVyQ2FzZSgpO1xuXG4gIHZhciByZSA9IC9eLS0tLS0oQkVHSU58RU5EKSAoW14tXSspLS0tLS0kLztcbiAgdmFyIHN0YXJ0ID0gLTE7XG4gIHZhciBlbmQgPSAtMTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBtYXRjaCA9IGxpbmVzW2ldLm1hdGNoKHJlKTtcbiAgICBpZiAobWF0Y2ggPT09IG51bGwpXG4gICAgICBjb250aW51ZTtcblxuICAgIGlmIChtYXRjaFsyXSAhPT0gbGFiZWwpXG4gICAgICBjb250aW51ZTtcblxuICAgIGlmIChzdGFydCA9PT0gLTEpIHtcbiAgICAgIGlmIChtYXRjaFsxXSAhPT0gJ0JFR0lOJylcbiAgICAgICAgYnJlYWs7XG4gICAgICBzdGFydCA9IGk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChtYXRjaFsxXSAhPT0gJ0VORCcpXG4gICAgICAgIGJyZWFrO1xuICAgICAgZW5kID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoc3RhcnQgPT09IC0xIHx8IGVuZCA9PT0gLTEpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdQRU0gc2VjdGlvbiBub3QgZm91bmQgZm9yOiAnICsgbGFiZWwpO1xuXG4gIHZhciBiYXNlNjQgPSBsaW5lcy5zbGljZShzdGFydCArIDEsIGVuZCkuam9pbignJyk7XG4gIC8vIFJlbW92ZSBleGNlc3NpdmUgc3ltYm9sc1xuICBiYXNlNjQucmVwbGFjZSgvW15hLXowLTlcXCtcXC89XSsvZ2ksICcnKTtcblxuICB2YXIgaW5wdXQgPSBuZXcgQnVmZmVyKGJhc2U2NCwgJ2Jhc2U2NCcpO1xuICByZXR1cm4gREVSRGVjb2Rlci5wcm90b3R5cGUuZGVjb2RlLmNhbGwodGhpcywgaW5wdXQsIG9wdGlvbnMpO1xufTtcbiIsInZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ3V0aWwnKS5pbmhlcml0cztcbnZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7XG5cbnZhciBhc24xID0gcmVxdWlyZSgnLi4vYXNuMScpO1xudmFyIGJhc2UgPSBhc24xLmJhc2U7XG52YXIgYmlnbnVtID0gYXNuMS5iaWdudW07XG5cbi8vIEltcG9ydCBERVIgY29uc3RhbnRzXG52YXIgZGVyID0gYXNuMS5jb25zdGFudHMuZGVyO1xuXG5mdW5jdGlvbiBERVJFbmNvZGVyKGVudGl0eSkge1xuICB0aGlzLmVuYyA9ICdkZXInO1xuICB0aGlzLm5hbWUgPSBlbnRpdHkubmFtZTtcbiAgdGhpcy5lbnRpdHkgPSBlbnRpdHk7XG5cbiAgLy8gQ29uc3RydWN0IGJhc2UgdHJlZVxuICB0aGlzLnRyZWUgPSBuZXcgREVSTm9kZSgpO1xuICB0aGlzLnRyZWUuX2luaXQoZW50aXR5LmJvZHkpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gREVSRW5jb2RlcjtcblxuREVSRW5jb2Rlci5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24gZW5jb2RlKGRhdGEsIHJlcG9ydGVyKSB7XG4gIHJldHVybiB0aGlzLnRyZWUuX2VuY29kZShkYXRhLCByZXBvcnRlcikuam9pbigpO1xufTtcblxuLy8gVHJlZSBtZXRob2RzXG5cbmZ1bmN0aW9uIERFUk5vZGUocGFyZW50KSB7XG4gIGJhc2UuTm9kZS5jYWxsKHRoaXMsICdkZXInLCBwYXJlbnQpO1xufVxuaW5oZXJpdHMoREVSTm9kZSwgYmFzZS5Ob2RlKTtcblxuREVSTm9kZS5wcm90b3R5cGUuX2VuY29kZUNvbXBvc2l0ZSA9IGZ1bmN0aW9uIGVuY29kZUNvbXBvc2l0ZSh0YWcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW1pdGl2ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50KSB7XG4gIHZhciBlbmNvZGVkVGFnID0gZW5jb2RlVGFnKHRhZywgcHJpbWl0aXZlLCBjbHMsIHRoaXMucmVwb3J0ZXIpO1xuXG4gIC8vIFNob3J0IGZvcm1cbiAgaWYgKGNvbnRlbnQubGVuZ3RoIDwgMHg4MCkge1xuICAgIHZhciBoZWFkZXIgPSBuZXcgQnVmZmVyKDIpO1xuICAgIGhlYWRlclswXSA9IGVuY29kZWRUYWc7XG4gICAgaGVhZGVyWzFdID0gY29udGVudC5sZW5ndGg7XG4gICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIoWyBoZWFkZXIsIGNvbnRlbnQgXSk7XG4gIH1cblxuICAvLyBMb25nIGZvcm1cbiAgLy8gQ291bnQgb2N0ZXRzIHJlcXVpcmVkIHRvIHN0b3JlIGxlbmd0aFxuICB2YXIgbGVuT2N0ZXRzID0gMTtcbiAgZm9yICh2YXIgaSA9IGNvbnRlbnQubGVuZ3RoOyBpID49IDB4MTAwOyBpID4+PSA4KVxuICAgIGxlbk9jdGV0cysrO1xuXG4gIHZhciBoZWFkZXIgPSBuZXcgQnVmZmVyKDEgKyAxICsgbGVuT2N0ZXRzKTtcbiAgaGVhZGVyWzBdID0gZW5jb2RlZFRhZztcbiAgaGVhZGVyWzFdID0gMHg4MCB8IGxlbk9jdGV0cztcblxuICBmb3IgKHZhciBpID0gMSArIGxlbk9jdGV0cywgaiA9IGNvbnRlbnQubGVuZ3RoOyBqID4gMDsgaS0tLCBqID4+PSA4KVxuICAgIGhlYWRlcltpXSA9IGogJiAweGZmO1xuXG4gIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKFsgaGVhZGVyLCBjb250ZW50IF0pO1xufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX2VuY29kZVN0ciA9IGZ1bmN0aW9uIGVuY29kZVN0cihzdHIsIHRhZykge1xuICBpZiAodGFnID09PSAnb2N0c3RyJylcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihzdHIpO1xuICBlbHNlIGlmICh0YWcgPT09ICdiaXRzdHInKVxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKFsgc3RyLnVudXNlZCB8IDAsIHN0ci5kYXRhIF0pO1xuICBlbHNlIGlmICh0YWcgPT09ICdpYTVzdHInIHx8IHRhZyA9PT0gJ3V0ZjhzdHInKVxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKHN0cik7XG4gIHJldHVybiB0aGlzLnJlcG9ydGVyLmVycm9yKCdFbmNvZGluZyBvZiBzdHJpbmcgdHlwZTogJyArIHRhZyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgdW5zdXBwb3J0ZWQnKTtcbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl9lbmNvZGVPYmppZCA9IGZ1bmN0aW9uIGVuY29kZU9iamlkKGlkLCB2YWx1ZXMsIHJlbGF0aXZlKSB7XG4gIGlmICh0eXBlb2YgaWQgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKCF2YWx1ZXMpXG4gICAgICByZXR1cm4gdGhpcy5yZXBvcnRlci5lcnJvcignc3RyaW5nIG9iamlkIGdpdmVuLCBidXQgbm8gdmFsdWVzIG1hcCBmb3VuZCcpO1xuICAgIGlmICghdmFsdWVzLmhhc093blByb3BlcnR5KGlkKSlcbiAgICAgIHJldHVybiB0aGlzLnJlcG9ydGVyLmVycm9yKCdvYmppZCBub3QgZm91bmQgaW4gdmFsdWVzIG1hcCcpO1xuICAgIGlkID0gdmFsdWVzW2lkXS5zcGxpdCgvW1xcc1xcLl0rL2cpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaWQubGVuZ3RoOyBpKyspXG4gICAgICBpZFtpXSB8PSAwO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoaWQpKSB7XG4gICAgaWQgPSBpZC5zbGljZSgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaWQubGVuZ3RoOyBpKyspXG4gICAgICBpZFtpXSB8PSAwO1xuICB9XG5cbiAgaWYgKCFBcnJheS5pc0FycmF5KGlkKSkge1xuICAgIHJldHVybiB0aGlzLnJlcG9ydGVyLmVycm9yKCdvYmppZCgpIHNob3VsZCBiZSBlaXRoZXIgYXJyYXkgb3Igc3RyaW5nLCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZ290OiAnICsgSlNPTi5zdHJpbmdpZnkoaWQpKTtcbiAgfVxuXG4gIGlmICghcmVsYXRpdmUpIHtcbiAgICBpZiAoaWRbMV0gPj0gNDApXG4gICAgICByZXR1cm4gdGhpcy5yZXBvcnRlci5lcnJvcignU2Vjb25kIG9iamlkIGlkZW50aWZpZXIgT09CJyk7XG4gICAgaWQuc3BsaWNlKDAsIDIsIGlkWzBdICogNDAgKyBpZFsxXSk7XG4gIH1cblxuICAvLyBDb3VudCBudW1iZXIgb2Ygb2N0ZXRzXG4gIHZhciBzaXplID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpZC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpZGVudCA9IGlkW2ldO1xuICAgIGZvciAoc2l6ZSsrOyBpZGVudCA+PSAweDgwOyBpZGVudCA+Pj0gNylcbiAgICAgIHNpemUrKztcbiAgfVxuXG4gIHZhciBvYmppZCA9IG5ldyBCdWZmZXIoc2l6ZSk7XG4gIHZhciBvZmZzZXQgPSBvYmppZC5sZW5ndGggLSAxO1xuICBmb3IgKHZhciBpID0gaWQubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgaWRlbnQgPSBpZFtpXTtcbiAgICBvYmppZFtvZmZzZXQtLV0gPSBpZGVudCAmIDB4N2Y7XG4gICAgd2hpbGUgKChpZGVudCA+Pj0gNykgPiAwKVxuICAgICAgb2JqaWRbb2Zmc2V0LS1dID0gMHg4MCB8IChpZGVudCAmIDB4N2YpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIob2JqaWQpO1xufTtcblxuZnVuY3Rpb24gdHdvKG51bSkge1xuICBpZiAobnVtIDwgMTApXG4gICAgcmV0dXJuICcwJyArIG51bTtcbiAgZWxzZVxuICAgIHJldHVybiBudW07XG59XG5cbkRFUk5vZGUucHJvdG90eXBlLl9lbmNvZGVUaW1lID0gZnVuY3Rpb24gZW5jb2RlVGltZSh0aW1lLCB0YWcpIHtcbiAgdmFyIHN0cjtcbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZSh0aW1lKTtcblxuICBpZiAodGFnID09PSAnZ2VudGltZScpIHtcbiAgICBzdHIgPSBbXG4gICAgICB0d28oZGF0ZS5nZXRGdWxsWWVhcigpKSxcbiAgICAgIHR3byhkYXRlLmdldFVUQ01vbnRoKCkgKyAxKSxcbiAgICAgIHR3byhkYXRlLmdldFVUQ0RhdGUoKSksXG4gICAgICB0d28oZGF0ZS5nZXRVVENIb3VycygpKSxcbiAgICAgIHR3byhkYXRlLmdldFVUQ01pbnV0ZXMoKSksXG4gICAgICB0d28oZGF0ZS5nZXRVVENTZWNvbmRzKCkpLFxuICAgICAgJ1onXG4gICAgXS5qb2luKCcnKTtcbiAgfSBlbHNlIGlmICh0YWcgPT09ICd1dGN0aW1lJykge1xuICAgIHN0ciA9IFtcbiAgICAgIHR3byhkYXRlLmdldEZ1bGxZZWFyKCkgJSAxMDApLFxuICAgICAgdHdvKGRhdGUuZ2V0VVRDTW9udGgoKSArIDEpLFxuICAgICAgdHdvKGRhdGUuZ2V0VVRDRGF0ZSgpKSxcbiAgICAgIHR3byhkYXRlLmdldFVUQ0hvdXJzKCkpLFxuICAgICAgdHdvKGRhdGUuZ2V0VVRDTWludXRlcygpKSxcbiAgICAgIHR3byhkYXRlLmdldFVUQ1NlY29uZHMoKSksXG4gICAgICAnWidcbiAgICBdLmpvaW4oJycpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMucmVwb3J0ZXIuZXJyb3IoJ0VuY29kaW5nICcgKyB0YWcgKyAnIHRpbWUgaXMgbm90IHN1cHBvcnRlZCB5ZXQnKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLl9lbmNvZGVTdHIoc3RyLCAnb2N0c3RyJyk7XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fZW5jb2RlTnVsbCA9IGZ1bmN0aW9uIGVuY29kZU51bGwoKSB7XG4gIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKCcnKTtcbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl9lbmNvZGVJbnQgPSBmdW5jdGlvbiBlbmNvZGVJbnQobnVtLCB2YWx1ZXMpIHtcbiAgaWYgKHR5cGVvZiBudW0gPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKCF2YWx1ZXMpXG4gICAgICByZXR1cm4gdGhpcy5yZXBvcnRlci5lcnJvcignU3RyaW5nIGludCBvciBlbnVtIGdpdmVuLCBidXQgbm8gdmFsdWVzIG1hcCcpO1xuICAgIGlmICghdmFsdWVzLmhhc093blByb3BlcnR5KG51bSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlcG9ydGVyLmVycm9yKCdWYWx1ZXMgbWFwIGRvZXNuXFwndCBjb250YWluOiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KG51bSkpO1xuICAgIH1cbiAgICBudW0gPSB2YWx1ZXNbbnVtXTtcbiAgfVxuXG4gIC8vIEJpZ251bSwgYXNzdW1lIGJpZyBlbmRpYW5cbiAgaWYgKHR5cGVvZiBudW0gIT09ICdudW1iZXInICYmICFCdWZmZXIuaXNCdWZmZXIobnVtKSkge1xuICAgIHZhciBudW1BcnJheSA9IG51bS50b0FycmF5KCk7XG4gICAgaWYgKG51bS5zaWduID09PSBmYWxzZSAmJiBudW1BcnJheVswXSAmIDB4ODApIHtcbiAgICAgIG51bUFycmF5LnVuc2hpZnQoMCk7XG4gICAgfVxuICAgIG51bSA9IG5ldyBCdWZmZXIobnVtQXJyYXkpO1xuICB9XG5cbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihudW0pKSB7XG4gICAgdmFyIHNpemUgPSBudW0ubGVuZ3RoO1xuICAgIGlmIChudW0ubGVuZ3RoID09PSAwKVxuICAgICAgc2l6ZSsrO1xuXG4gICAgdmFyIG91dCA9IG5ldyBCdWZmZXIoc2l6ZSk7XG4gICAgbnVtLmNvcHkob3V0KTtcbiAgICBpZiAobnVtLmxlbmd0aCA9PT0gMClcbiAgICAgIG91dFswXSA9IDBcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihvdXQpO1xuICB9XG5cbiAgaWYgKG51bSA8IDB4ODApXG4gICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIobnVtKTtcblxuICBpZiAobnVtIDwgMHgxMDApXG4gICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIoWzAsIG51bV0pO1xuXG4gIHZhciBzaXplID0gMTtcbiAgZm9yICh2YXIgaSA9IG51bTsgaSA+PSAweDEwMDsgaSA+Pj0gOClcbiAgICBzaXplKys7XG5cbiAgdmFyIG91dCA9IG5ldyBBcnJheShzaXplKTtcbiAgZm9yICh2YXIgaSA9IG91dC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIG91dFtpXSA9IG51bSAmIDB4ZmY7XG4gICAgbnVtID4+PSA4O1xuICB9XG4gIGlmKG91dFswXSAmIDB4ODApIHtcbiAgICBvdXQudW5zaGlmdCgwKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKG5ldyBCdWZmZXIob3V0KSk7XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fZW5jb2RlQm9vbCA9IGZ1bmN0aW9uIGVuY29kZUJvb2wodmFsdWUpIHtcbiAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIodmFsdWUgPyAweGZmIDogMCk7XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fdXNlID0gZnVuY3Rpb24gdXNlKGVudGl0eSwgb2JqKSB7XG4gIGlmICh0eXBlb2YgZW50aXR5ID09PSAnZnVuY3Rpb24nKVxuICAgIGVudGl0eSA9IGVudGl0eShvYmopO1xuICByZXR1cm4gZW50aXR5Ll9nZXRFbmNvZGVyKCdkZXInKS50cmVlO1xufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX3NraXBEZWZhdWx0ID0gZnVuY3Rpb24gc2tpcERlZmF1bHQoZGF0YUJ1ZmZlciwgcmVwb3J0ZXIsIHBhcmVudCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG4gIHZhciBpO1xuICBpZiAoc3RhdGVbJ2RlZmF1bHQnXSA9PT0gbnVsbClcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGRhdGEgPSBkYXRhQnVmZmVyLmpvaW4oKTtcbiAgaWYgKHN0YXRlLmRlZmF1bHRCdWZmZXIgPT09IHVuZGVmaW5lZClcbiAgICBzdGF0ZS5kZWZhdWx0QnVmZmVyID0gdGhpcy5fZW5jb2RlVmFsdWUoc3RhdGVbJ2RlZmF1bHQnXSwgcmVwb3J0ZXIsIHBhcmVudCkuam9pbigpO1xuXG4gIGlmIChkYXRhLmxlbmd0aCAhPT0gc3RhdGUuZGVmYXVsdEJ1ZmZlci5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGZvciAoaT0wOyBpIDwgZGF0YS5sZW5ndGg7IGkrKylcbiAgICBpZiAoZGF0YVtpXSAhPT0gc3RhdGUuZGVmYXVsdEJ1ZmZlcltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8vIFV0aWxpdHkgbWV0aG9kc1xuXG5mdW5jdGlvbiBlbmNvZGVUYWcodGFnLCBwcmltaXRpdmUsIGNscywgcmVwb3J0ZXIpIHtcbiAgdmFyIHJlcztcblxuICBpZiAodGFnID09PSAnc2Vxb2YnKVxuICAgIHRhZyA9ICdzZXEnO1xuICBlbHNlIGlmICh0YWcgPT09ICdzZXRvZicpXG4gICAgdGFnID0gJ3NldCc7XG5cbiAgaWYgKGRlci50YWdCeU5hbWUuaGFzT3duUHJvcGVydHkodGFnKSlcbiAgICByZXMgPSBkZXIudGFnQnlOYW1lW3RhZ107XG4gIGVsc2UgaWYgKHR5cGVvZiB0YWcgPT09ICdudW1iZXInICYmICh0YWcgfCAwKSA9PT0gdGFnKVxuICAgIHJlcyA9IHRhZztcbiAgZWxzZVxuICAgIHJldHVybiByZXBvcnRlci5lcnJvcignVW5rbm93biB0YWc6ICcgKyB0YWcpO1xuXG4gIGlmIChyZXMgPj0gMHgxZilcbiAgICByZXR1cm4gcmVwb3J0ZXIuZXJyb3IoJ011bHRpLW9jdGV0IHRhZyBlbmNvZGluZyB1bnN1cHBvcnRlZCcpO1xuXG4gIGlmICghcHJpbWl0aXZlKVxuICAgIHJlcyB8PSAweDIwO1xuXG4gIHJlcyB8PSAoZGVyLnRhZ0NsYXNzQnlOYW1lW2NscyB8fCAndW5pdmVyc2FsJ10gPDwgNik7XG5cbiAgcmV0dXJuIHJlcztcbn1cbiIsInZhciBlbmNvZGVycyA9IGV4cG9ydHM7XG5cbmVuY29kZXJzLmRlciA9IHJlcXVpcmUoJy4vZGVyJyk7XG5lbmNvZGVycy5wZW0gPSByZXF1aXJlKCcuL3BlbScpO1xuIiwidmFyIGluaGVyaXRzID0gcmVxdWlyZSgndXRpbCcpLmluaGVyaXRzO1xudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcblxudmFyIGFzbjEgPSByZXF1aXJlKCcuLi9hc24xJyk7XG52YXIgREVSRW5jb2RlciA9IHJlcXVpcmUoJy4vZGVyJyk7XG5cbmZ1bmN0aW9uIFBFTUVuY29kZXIoZW50aXR5KSB7XG4gIERFUkVuY29kZXIuY2FsbCh0aGlzLCBlbnRpdHkpO1xuICB0aGlzLmVuYyA9ICdwZW0nO1xufTtcbmluaGVyaXRzKFBFTUVuY29kZXIsIERFUkVuY29kZXIpO1xubW9kdWxlLmV4cG9ydHMgPSBQRU1FbmNvZGVyO1xuXG5QRU1FbmNvZGVyLnByb3RvdHlwZS5lbmNvZGUgPSBmdW5jdGlvbiBlbmNvZGUoZGF0YSwgb3B0aW9ucykge1xuICB2YXIgYnVmID0gREVSRW5jb2Rlci5wcm90b3R5cGUuZW5jb2RlLmNhbGwodGhpcywgZGF0YSk7XG5cbiAgdmFyIHAgPSBidWYudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICB2YXIgb3V0ID0gWyAnLS0tLS1CRUdJTiAnICsgb3B0aW9ucy5sYWJlbCArICctLS0tLScgXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLmxlbmd0aDsgaSArPSA2NClcbiAgICBvdXQucHVzaChwLnNsaWNlKGksIGkgKyA2NCkpO1xuICBvdXQucHVzaCgnLS0tLS1FTkQgJyArIG9wdGlvbnMubGFiZWwgKyAnLS0tLS0nKTtcbiAgcmV0dXJuIG91dC5qb2luKCdcXG4nKTtcbn07XG4iLCIndXNlIHN0cmljdCdcblxudmFyIGFzbjEgPSByZXF1aXJlKCcuL2FzbjEvYXNuMScpO1xudmFyIEJOID0gcmVxdWlyZSgnLi9hc24xL2JpZ251bS9ibicpO1xuXG52YXIgRUNQcml2YXRlS2V5QVNOID0gYXNuMS5kZWZpbmUoJ0VDUHJpdmF0ZUtleScsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2VxKCkub2JqKFxuICAgICAgICB0aGlzLmtleSgndmVyc2lvbicpLmludCgpLFxuICAgICAgICB0aGlzLmtleSgncHJpdmF0ZUtleScpLm9jdHN0cigpLFxuICAgICAgICB0aGlzLmtleSgncGFyYW1ldGVycycpLmV4cGxpY2l0KDApLm9iamlkKCkub3B0aW9uYWwoKSxcbiAgICAgICAgdGhpcy5rZXkoJ3B1YmxpY0tleScpLmV4cGxpY2l0KDEpLmJpdHN0cigpLm9wdGlvbmFsKClcbiAgICApXG59KVxuXG52YXIgU3ViamVjdFB1YmxpY0tleUluZm9BU04gPSBhc24xLmRlZmluZSgnU3ViamVjdFB1YmxpY0tleUluZm8nLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNlcSgpLm9iaihcbiAgICAgICAgdGhpcy5rZXkoJ2FsZ29yaXRobScpLnNlcSgpLm9iaihcbiAgICAgICAgICAgIHRoaXMua2V5KFwiaWRcIikub2JqaWQoKSxcbiAgICAgICAgICAgIHRoaXMua2V5KFwiY3VydmVcIikub2JqaWQoKVxuICAgICAgICApLFxuICAgICAgICB0aGlzLmtleSgncHViJykuYml0c3RyKClcbiAgICApXG59KVxuXG52YXIgY3VydmVzID0ge1xuICAgIHNlY3AyNTZrMToge1xuICAgICAgICBjdXJ2ZVBhcmFtZXRlcnM6IFsxLCAzLCAxMzIsIDAsIDEwXSxcbiAgICAgICAgcHJpdmF0ZVBFTU9wdGlvbnM6IHtsYWJlbDogJ0VDIFBSSVZBVEUgS0VZJ30sXG4gICAgICAgIHB1YmxpY1BFTU9wdGlvbnM6IHtsYWJlbDogJ1BVQkxJQyBLRVknfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0KHZhbCwgbXNnKSB7XG4gICAgaWYgKCF2YWwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyB8fCAnQXNzZXJ0aW9uIGZhaWxlZCcpXG4gICAgfVxufVxuXG5mdW5jdGlvbiBLZXlFbmNvZGVyKG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGFzc2VydChjdXJ2ZXMuaGFzT3duUHJvcGVydHkob3B0aW9ucyksICdVbmtub3duIGN1cnZlICcgKyBvcHRpb25zKTtcbiAgICAgICAgb3B0aW9ucyA9IGN1cnZlc1tvcHRpb25zXVxuICAgIH1cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuYWxnb3JpdGhtSUQgPSBbMSwgMiwgODQwLCAxMDA0NSwgMiwgMV1cbn1cblxuS2V5RW5jb2Rlci5FQ1ByaXZhdGVLZXlBU04gPSBFQ1ByaXZhdGVLZXlBU047XG5LZXlFbmNvZGVyLlN1YmplY3RQdWJsaWNLZXlJbmZvQVNOID0gU3ViamVjdFB1YmxpY0tleUluZm9BU047XG5cbktleUVuY29kZXIucHJvdG90eXBlLnByaXZhdGVLZXlPYmplY3QgPSBmdW5jdGlvbihyYXdQcml2YXRlS2V5LCByYXdQdWJsaWNLZXkpIHtcbiAgICB2YXIgcHJpdmF0ZUtleU9iamVjdCA9IHtcbiAgICAgICAgdmVyc2lvbjogbmV3IEJOKDEpLFxuICAgICAgICBwcml2YXRlS2V5OiBuZXcgQnVmZmVyKHJhd1ByaXZhdGVLZXksICdoZXgnKSxcbiAgICAgICAgcGFyYW1ldGVyczogdGhpcy5vcHRpb25zLmN1cnZlUGFyYW1ldGVycyxcbiAgICAgICAgcGVtT3B0aW9uczoge2xhYmVsOlwiRUMgUFJJVkFURSBLRVlcIn1cbiAgICB9O1xuXG4gICAgaWYgKHJhd1B1YmxpY0tleSkge1xuICAgICAgICBwcml2YXRlS2V5T2JqZWN0LnB1YmxpY0tleSA9IHtcbiAgICAgICAgICAgIHVudXNlZDogMCxcbiAgICAgICAgICAgIGRhdGE6IG5ldyBCdWZmZXIocmF3UHVibGljS2V5LCAnaGV4JylcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBwcml2YXRlS2V5T2JqZWN0XG59O1xuXG5LZXlFbmNvZGVyLnByb3RvdHlwZS5wdWJsaWNLZXlPYmplY3QgPSBmdW5jdGlvbihyYXdQdWJsaWNLZXkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBhbGdvcml0aG06IHtcbiAgICAgICAgICAgIGlkOiB0aGlzLmFsZ29yaXRobUlELFxuICAgICAgICAgICAgY3VydmU6IHRoaXMub3B0aW9ucy5jdXJ2ZVBhcmFtZXRlcnNcbiAgICAgICAgfSxcbiAgICAgICAgcHViOiB7XG4gICAgICAgICAgICB1bnVzZWQ6IDAsXG4gICAgICAgICAgICBkYXRhOiBuZXcgQnVmZmVyKHJhd1B1YmxpY0tleSwgJ2hleCcpXG4gICAgICAgIH0sXG4gICAgICAgIHBlbU9wdGlvbnM6IHsgbGFiZWwgOlwiUFVCTElDIEtFWVwifVxuICAgIH1cbn1cblxuS2V5RW5jb2Rlci5wcm90b3R5cGUuZW5jb2RlUHJpdmF0ZSA9IGZ1bmN0aW9uKHByaXZhdGVLZXksIG9yaWdpbmFsRm9ybWF0LCBkZXN0aW5hdGlvbkZvcm1hdCkge1xuICAgIHZhciBwcml2YXRlS2V5T2JqZWN0XG5cbiAgICAvKiBQYXJzZSB0aGUgaW5jb21pbmcgcHJpdmF0ZSBrZXkgYW5kIGNvbnZlcnQgaXQgdG8gYSBwcml2YXRlIGtleSBvYmplY3QgKi9cbiAgICBpZiAob3JpZ2luYWxGb3JtYXQgPT09ICdyYXcnKSB7XG4gICAgICAgIGlmICghdHlwZW9mIHByaXZhdGVLZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyAncHJpdmF0ZSBrZXkgbXVzdCBiZSBhIHN0cmluZydcbiAgICAgICAgfVxuICAgICAgICB2YXIgcHJpdmF0ZUtleU9iamVjdCA9IHRoaXMub3B0aW9ucy5jdXJ2ZS5rZXlGcm9tUHJpdmF0ZShwcml2YXRlS2V5LCAnaGV4JyksXG4gICAgICAgICAgICByYXdQdWJsaWNLZXkgPSBwcml2YXRlS2V5T2JqZWN0LmdldFB1YmxpYygnaGV4JylcbiAgICAgICAgcHJpdmF0ZUtleU9iamVjdCA9IHRoaXMucHJpdmF0ZUtleU9iamVjdChwcml2YXRlS2V5LCByYXdQdWJsaWNLZXkpXG4gICAgfSBlbHNlIGlmIChvcmlnaW5hbEZvcm1hdCA9PT0gJ2RlcicpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwcml2YXRlS2V5ID09PSAnYnVmZmVyJykge1xuICAgICAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwcml2YXRlS2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcHJpdmF0ZUtleSA9IG5ldyBCdWZmZXIocHJpdmF0ZUtleSwgJ2hleCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyAncHJpdmF0ZSBrZXkgbXVzdCBiZSBhIGJ1ZmZlciBvciBhIHN0cmluZydcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlS2V5T2JqZWN0ID0gRUNQcml2YXRlS2V5QVNOLmRlY29kZShwcml2YXRlS2V5LCAnZGVyJylcbiAgICB9IGVsc2UgaWYgKG9yaWdpbmFsRm9ybWF0ID09PSAncGVtJykge1xuICAgICAgICBpZiAoIXR5cGVvZiBwcml2YXRlS2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgJ3ByaXZhdGUga2V5IG11c3QgYmUgYSBzdHJpbmcnXG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZUtleU9iamVjdCA9IEVDUHJpdmF0ZUtleUFTTi5kZWNvZGUocHJpdmF0ZUtleSwgJ3BlbScsIHRoaXMub3B0aW9ucy5wcml2YXRlUEVNT3B0aW9ucylcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyAnaW52YWxpZCBwcml2YXRlIGtleSBmb3JtYXQnXG4gICAgfVxuXG4gICAgLyogRXhwb3J0IHRoZSBwcml2YXRlIGtleSBvYmplY3QgdG8gdGhlIGRlc2lyZWQgZm9ybWF0ICovXG4gICAgaWYgKGRlc3RpbmF0aW9uRm9ybWF0ID09PSAncmF3Jykge1xuICAgICAgICByZXR1cm4gcHJpdmF0ZUtleU9iamVjdC5wcml2YXRlS2V5LnRvU3RyaW5nKCdoZXgnKVxuICAgIH0gZWxzZSBpZiAoZGVzdGluYXRpb25Gb3JtYXQgPT09ICdkZXInKSB7XG4gICAgICAgIHJldHVybiBFQ1ByaXZhdGVLZXlBU04uZW5jb2RlKHByaXZhdGVLZXlPYmplY3QsICdkZXInKS50b1N0cmluZygnaGV4JylcbiAgICB9IGVsc2UgaWYgKGRlc3RpbmF0aW9uRm9ybWF0ID09PSAncGVtJykge1xuICAgICAgICByZXR1cm4gRUNQcml2YXRlS2V5QVNOLmVuY29kZShwcml2YXRlS2V5T2JqZWN0LCAncGVtJywgdGhpcy5vcHRpb25zLnByaXZhdGVQRU1PcHRpb25zKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93ICdpbnZhbGlkIGRlc3RpbmF0aW9uIGZvcm1hdCBmb3IgcHJpdmF0ZSBrZXknXG4gICAgfVxufVxuXG5LZXlFbmNvZGVyLnByb3RvdHlwZS5lbmNvZGVQdWJsaWMgPSBmdW5jdGlvbihwdWJsaWNLZXksIG9yaWdpbmFsRm9ybWF0LCBkZXN0aW5hdGlvbkZvcm1hdCkge1xuICAgIHZhciBwdWJsaWNLZXlPYmplY3RcblxuICAgIC8qIFBhcnNlIHRoZSBpbmNvbWluZyBwdWJsaWMga2V5IGFuZCBjb252ZXJ0IGl0IHRvIGEgcHVibGljIGtleSBvYmplY3QgKi9cbiAgICBpZiAob3JpZ2luYWxGb3JtYXQgPT09ICdyYXcnKSB7XG4gICAgICAgIGlmICghdHlwZW9mIHB1YmxpY0tleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93ICdwdWJsaWMga2V5IG11c3QgYmUgYSBzdHJpbmcnXG4gICAgICAgIH1cbiAgICAgICAgcHVibGljS2V5T2JqZWN0ID0gdGhpcy5wdWJsaWNLZXlPYmplY3QocHVibGljS2V5KVxuICAgIH0gZWxzZSBpZiAob3JpZ2luYWxGb3JtYXQgPT09ICdkZXInKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHVibGljS2V5ID09PSAnYnVmZmVyJykge1xuICAgICAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwdWJsaWNLZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBwdWJsaWNLZXkgPSBuZXcgQnVmZmVyKHB1YmxpY0tleSwgJ2hleCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyAncHVibGljIGtleSBtdXN0IGJlIGEgYnVmZmVyIG9yIGEgc3RyaW5nJ1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpY0tleU9iamVjdCA9IFN1YmplY3RQdWJsaWNLZXlJbmZvQVNOLmRlY29kZShwdWJsaWNLZXksICdkZXInKVxuICAgIH0gZWxzZSBpZiAob3JpZ2luYWxGb3JtYXQgPT09ICdwZW0nKSB7XG4gICAgICAgIGlmICghdHlwZW9mIHB1YmxpY0tleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93ICdwdWJsaWMga2V5IG11c3QgYmUgYSBzdHJpbmcnXG4gICAgICAgIH1cbiAgICAgICAgcHVibGljS2V5T2JqZWN0ID0gU3ViamVjdFB1YmxpY0tleUluZm9BU04uZGVjb2RlKHB1YmxpY0tleSwgJ3BlbScsIHRoaXMub3B0aW9ucy5wdWJsaWNQRU1PcHRpb25zKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93ICdpbnZhbGlkIHB1YmxpYyBrZXkgZm9ybWF0J1xuICAgIH1cblxuICAgIC8qIEV4cG9ydCB0aGUgcHJpdmF0ZSBrZXkgb2JqZWN0IHRvIHRoZSBkZXNpcmVkIGZvcm1hdCAqL1xuICAgIGlmIChkZXN0aW5hdGlvbkZvcm1hdCA9PT0gJ3JhdycpIHtcbiAgICAgICAgcmV0dXJuIHB1YmxpY0tleU9iamVjdC5wdWIuZGF0YS50b1N0cmluZygnaGV4JylcbiAgICB9IGVsc2UgaWYgKGRlc3RpbmF0aW9uRm9ybWF0ID09PSAnZGVyJykge1xuICAgICAgICByZXR1cm4gU3ViamVjdFB1YmxpY0tleUluZm9BU04uZW5jb2RlKHB1YmxpY0tleU9iamVjdCwgJ2RlcicpLnRvU3RyaW5nKCdoZXgnKVxuICAgIH0gZWxzZSBpZiAoZGVzdGluYXRpb25Gb3JtYXQgPT09ICdwZW0nKSB7XG4gICAgICAgIHJldHVybiBTdWJqZWN0UHVibGljS2V5SW5mb0FTTi5lbmNvZGUocHVibGljS2V5T2JqZWN0LCAncGVtJywgdGhpcy5vcHRpb25zLnB1YmxpY1BFTU9wdGlvbnMpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgJ2ludmFsaWQgZGVzdGluYXRpb24gZm9ybWF0IGZvciBwdWJsaWMga2V5J1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBLZXlFbmNvZGVyOyIsInJlcXVpcmUoXCIuLi8uLi8uLi9lbmdpbmUvY29yZVwiKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcbmNvbnN0IHlhemwgPSAkJC5yZXF1aXJlTW9kdWxlKFwieWF6bFwiKTtcbmNvbnN0IHlhdXpsID0gJCQucmVxdWlyZU1vZHVsZShcInlhdXpsXCIpO1xuY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5jb25zdCBpc1N0cmVhbSA9IHJlcXVpcmUoXCIuL3V0aWxzL2lzU3RyZWFtXCIpO1xuXG5mdW5jdGlvbiBQc2tBcmNoaXZlcigpIHtcblx0bGV0IHppcGZpbGUgPSBuZXcgeWF6bC5aaXBGaWxlKCk7XG5cdGZ1bmN0aW9uIHppcEZvbGRlclJlY3Vyc2l2ZWx5KGlucHV0UGF0aCwgcm9vdCA9ICcnKSB7XG5cdFx0Y29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhpbnB1dFBhdGgpO1xuXHRcdGZpbGVzLmZvckVhY2goZnVuY3Rpb24gKGZpbGUpIHtcblx0XHRcdGNvbnN0IHRlbXBQYXRoID0gcGF0aC5qb2luKGlucHV0UGF0aCwgZmlsZSk7XG5cdFx0XHRpZiAoIWZzLmxzdGF0U3luYyh0ZW1wUGF0aCkuaXNEaXJlY3RvcnkoKSkge1xuXHRcdFx0XHR6aXBmaWxlLmFkZEZpbGUodGVtcFBhdGgsIHBhdGguam9pbihyb290LCBmaWxlKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR6aXBGb2xkZXJSZWN1cnNpdmVseSh0ZW1wUGF0aCwgcGF0aC5qb2luKHJvb3QsIGZpbGUpKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHRoaXMuemlwID0gZnVuY3Rpb24gKGlucHV0UGF0aCwgb3V0cHV0LCBjYWxsYmFjaykge1xuXHRcdHZhciBleHQgPSBcIlwiO1xuXHRcdGlmKGZzLmxzdGF0U3luYyhpbnB1dFBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcblx0XHRcdHppcEZvbGRlclJlY3Vyc2l2ZWx5KGlucHV0UGF0aCk7XG5cdFx0fWVsc2V7XG5cdFx0XHR2YXIgZmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGlucHV0UGF0aCk7XG5cdFx0XHR6aXBmaWxlLmFkZEZpbGUoaW5wdXRQYXRoLCBmaWxlbmFtZSk7XG5cdFx0XHR2YXIgc3BsaXRGaWxlbmFtZSA9IGZpbGVuYW1lLnNwbGl0KFwiLlwiKTtcblx0XHRcdGlmKHNwbGl0RmlsZW5hbWUubGVuZ3RoID49IDIgKXtcblx0XHRcdFx0ZXh0ID0gXCIuXCIgKyBzcGxpdEZpbGVuYW1lW3NwbGl0RmlsZW5hbWUubGVuZ3RoIC0gMV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHppcGZpbGUuZW5kKCk7XG5cdFx0aWYoaXNTdHJlYW0uaXNXcml0YWJsZShvdXRwdXQpKXtcblx0XHRcdGNhbGxiYWNrKG51bGwsIHppcGZpbGUub3V0cHV0U3RyZWFtLnBpcGUob3V0cHV0KSk7XG5cdFx0fWVsc2UgaWYodHlwZW9mIG91dHB1dCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0JCQuZW5zdXJlRm9sZGVyRXhpc3RzKG91dHB1dCwgKCkgPT4ge1xuXHRcdFx0XHR2YXIgZGVzdGluYXRpb25QYXRoID0gcGF0aC5qb2luKG91dHB1dCwgcGF0aC5iYXNlbmFtZShpbnB1dFBhdGgsIGV4dCkgKyBcIi56aXBcIik7XG5cdFx0XHRcdHppcGZpbGUub3V0cHV0U3RyZWFtLnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdGluYXRpb25QYXRoKSkub24oXCJjbG9zZVwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG5cblx0dGhpcy51bnppcCA9IGZ1bmN0aW9uIChpbnB1dCwgb3V0cHV0UGF0aCwgY2FsbGJhY2spIHtcblx0XHR5YXV6bC5vcGVuKGlucHV0LCB7bGF6eUVudHJpZXM6IHRydWV9LCBmdW5jdGlvbiAoZXJyLCB6aXBmaWxlKSB7XG5cdFx0XHRpZiAoZXJyKSB0aHJvdyBlcnI7XG5cdFx0XHR6aXBmaWxlLnJlYWRFbnRyeSgpO1xuXHRcdFx0emlwZmlsZS5vbmNlKFwiZW5kXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdH0pO1xuXHRcdFx0emlwZmlsZS5vbihcImVudHJ5XCIsIGZ1bmN0aW9uIChlbnRyeSkge1xuXHRcdFx0XHRpZiAoZW50cnkuZmlsZU5hbWUuZW5kc1dpdGgocGF0aC5zZXApKSB7XG5cdFx0XHRcdFx0emlwZmlsZS5yZWFkRW50cnkoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRsZXQgZm9sZGVyID0gcGF0aC5kaXJuYW1lKGVudHJ5LmZpbGVOYW1lKTtcblx0XHRcdFx0XHQkJC5lbnN1cmVGb2xkZXJFeGlzdHMocGF0aC5qb2luKG91dHB1dFBhdGgsIGZvbGRlciksICgpID0+IHtcblx0XHRcdFx0XHRcdHppcGZpbGUub3BlblJlYWRTdHJlYW0oZW50cnksIGZ1bmN0aW9uIChlcnIsIHJlYWRTdHJlYW0pIHtcblx0XHRcdFx0XHRcdFx0aWYgKGVycikgdGhyb3cgZXJyO1xuXG5cdFx0XHRcdFx0XHRcdHJlYWRTdHJlYW0ub24oXCJlbmRcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdHppcGZpbGUucmVhZEVudHJ5KCk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRsZXQgZmlsZU5hbWUgPSBwYXRoLmpvaW4ob3V0cHV0UGF0aCwgZW50cnkuZmlsZU5hbWUpO1xuXHRcdFx0XHRcdFx0XHRsZXQgZm9sZGVyID0gcGF0aC5kaXJuYW1lKGZpbGVOYW1lKTtcblx0XHRcdFx0XHRcdFx0JCQuZW5zdXJlRm9sZGVyRXhpc3RzKGZvbGRlciwgKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGxldCBvdXRwdXQgPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShmaWxlTmFtZSk7XG5cdFx0XHRcdFx0XHRcdFx0cmVhZFN0cmVhbS5waXBlKG91dHB1dCk7XG5cblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cbn1cblxuLy8gbmV3IFBza0FyY2hpdmVyKCkuemlwKFwiQzpcXFxcVXNlcnNcXFxcQWNlclxcXFxXZWJzdG9ybVByb2plY3RzXFxcXHByaXZhdGVza3lcXFxcdGVzdHNcXFxccHNrLXVuaXQtdGVzdGluZ1xcXFx6aXBcXFxcaW5wdXRcXFxcdGVzdFwiLCBcIkM6XFxcXFVzZXJzXFxcXEFjZXJcXFxcV2Vic3Rvcm1Qcm9qZWN0c1xcXFxwcml2YXRlc2t5XFxcXHRlc3RzXFxcXHBzay11bml0LXRlc3RpbmdcXFxcemlwXFxcXGlucHV0XFxcXHRlc3RcXFxcb3V0cHV0XCIpO1xubW9kdWxlLmV4cG9ydHMgPSBuZXcgUHNrQXJjaGl2ZXIoKTsiLCJcbmNvbnN0IGNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuY29uc3QgaXNTdHJlYW0gPSByZXF1aXJlKFwiLi9pc1N0cmVhbVwiKTtcbmNvbnN0IGFyY2hpdmVyID0gcmVxdWlyZShcIi4uL3Bzay1hcmNoaXZlclwiKTtcbmNvbnN0IGFsZ29yaXRobSA9ICdhZXMtMjU2LWdjbSc7XG5mdW5jdGlvbiBlbmNvZGUoYnVmZmVyKSB7XG5cdHJldHVybiBidWZmZXIudG9TdHJpbmcoJ2Jhc2U2NCcpXG5cdFx0LnJlcGxhY2UoL1xcKy9nLCAnJylcblx0XHQucmVwbGFjZSgvXFwvL2csICcnKVxuXHRcdC5yZXBsYWNlKC89KyQvLCAnJyk7XG59XG5mdW5jdGlvbiBkZWxldGVGb2xkZXIoZm9sZGVyUGF0aCkge1xuXHR2YXIgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhmb2xkZXJQYXRoKTtcblx0ZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuXHRcdHZhciB0ZW1wUGF0aCA9IHBhdGguam9pbihmb2xkZXJQYXRoLCBmaWxlKTtcblx0XHRpZihmcy5zdGF0U3luYyh0ZW1wUGF0aCkuaXNEaXJlY3RvcnkoKSl7XG5cdFx0XHRkZWxldGVGb2xkZXIodGVtcFBhdGgpO1xuXHRcdH1lbHNle1xuXHRcdFx0ZnMudW5saW5rU3luYyh0ZW1wUGF0aCk7XG5cdFx0fVxuXHR9KTtcblx0ZnMucm1kaXJTeW5jKGZvbGRlclBhdGgpO1xufVxuZnVuY3Rpb24gZW5jcnlwdEZpbGUoaW5wdXRQYXRoLCBkZXN0aW5hdGlvblBhdGgsIHBhc3N3b3JkKXtcblx0aWYoIWZzLmV4aXN0c1N5bmMocGF0aC5kaXJuYW1lKGRlc3RpbmF0aW9uUGF0aCkpKXtcblx0XHRmcy5ta2RpclN5bmMocGF0aC5kaXJuYW1lKGRlc3RpbmF0aW9uUGF0aCkpO1xuXHR9XG5cdGlmKCFmcy5leGlzdHNTeW5jKGRlc3RpbmF0aW9uUGF0aCkpe1xuXHRcdGZzLndyaXRlRmlsZVN5bmMoZGVzdGluYXRpb25QYXRoLFwiXCIpO1xuXHR9XG5cdHZhciB3cyA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3RpbmF0aW9uUGF0aCwge2F1dG9DbG9zZTogZmFsc2V9KTtcblx0dmFyIGtleVNhbHQgICAgICAgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoMzIpO1xuXHR2YXIga2V5ICAgICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBrZXlTYWx0LCAxMDAwMCwgMzIsICdzaGE1MTInKTtcblxuXHR2YXIgYWFkU2FsdCAgICAgICA9IGNyeXB0by5yYW5kb21CeXRlcygzMik7XG5cdHZhciBhYWQgICAgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIGFhZFNhbHQsIDEwMDAwLCAzMiwgJ3NoYTUxMicpO1xuXG5cdHZhciBzYWx0ICAgICAgICAgID0gQnVmZmVyLmNvbmNhdChba2V5U2FsdCwgYWFkU2FsdF0pO1xuXHR2YXIgaXYgICAgICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBzYWx0LCAxMDAwMCwgMTIsICdzaGE1MTInKTtcblxuXHR2YXIgY2lwaGVyICAgICAgICA9IGNyeXB0by5jcmVhdGVDaXBoZXJpdihhbGdvcml0aG0sIGtleSwgaXYpO1xuXHRjaXBoZXIuc2V0QUFEKGFhZCk7XG5cblx0YXJjaGl2ZXIuemlwKGlucHV0UGF0aCwgY2lwaGVyLCBmdW5jdGlvbiAoZXJyLCBjaXBoZXJTdHJlYW0pIHtcblx0XHRjaXBoZXJTdHJlYW0ub24oXCJkYXRhXCIsIGZ1bmN0aW9uIChjaHVuaykge1xuXHRcdFx0d3Mud3JpdGUoY2h1bmspXG5cdFx0fSk7XG5cdFx0Y2lwaGVyU3RyZWFtLm9uKCdlbmQnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgdGFnID0gY2lwaGVyLmdldEF1dGhUYWcoKTtcblx0XHRcdHZhciBkYXRhVG9BcHBlbmQgPSBCdWZmZXIuY29uY2F0KFtzYWx0LCB0YWddKTtcblx0XHRcdHdzLndyaXRlKGRhdGFUb0FwcGVuZCwgZnVuY3Rpb24gKGVycikge1xuXHRcdFx0XHRpZihlcnIpIHtcblx0XHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHRcdH1cblx0XHRcdFx0d3MuY2xvc2UoKTtcblx0XHRcdFx0ZnMubHN0YXQoaW5wdXRQYXRoLCBmdW5jdGlvbiAoZXJyLCBzdGF0cykge1xuXHRcdFx0XHRcdGlmKGVycil7XG5cdFx0XHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKHN0YXRzLmlzRGlyZWN0b3J5KCkpe1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coXCJkZWxldGUgZm9sZGVyXCIpO1xuXHRcdFx0XHRcdFx0ZGVsZXRlRm9sZGVyKGlucHV0UGF0aCk7XG5cdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhcInVubGlua1wiKTtcblx0XHRcdFx0XHRcdGZzLnVubGlua1N5bmMoaW5wdXRQYXRoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJFbmRcIilcblx0XHRcdFx0fSlcblx0XHRcdH0pXG5cdFx0fSk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBkZWNyeXB0RmlsZShlbmNyeXB0ZWRJbnB1dFBhdGgsIHRlbXBGb2xkZXIsIHBhc3N3b3JkLCBjYWxsYmFjaykge1xuXHRjb25zdCBzdGF0cyAgICAgICAgICAgPSBmcy5zdGF0U3luYyhlbmNyeXB0ZWRJbnB1dFBhdGgpO1xuXHRjb25zdCBmaWxlU2l6ZUluQnl0ZXMgPSBzdGF0cy5zaXplO1xuXHRjb25zdCBmZCAgICAgICAgICAgICAgPSBmcy5vcGVuU3luYyhlbmNyeXB0ZWRJbnB1dFBhdGgsIFwiclwiKTtcblx0dmFyIGVuY3J5cHRlZEF1dGhEYXRhID0gQnVmZmVyLmFsbG9jKDgwKTtcblxuXHRmcy5yZWFkU3luYyhmZCwgZW5jcnlwdGVkQXV0aERhdGEsIDAsIDgwLCBmaWxlU2l6ZUluQnl0ZXMgLSA4MCk7XG5cdHZhciBzYWx0ICAgICAgID0gZW5jcnlwdGVkQXV0aERhdGEuc2xpY2UoMCwgNjQpO1xuXHR2YXIga2V5U2FsdCAgICA9IHNhbHQuc2xpY2UoMCwgMzIpO1xuXHR2YXIgYWFkU2FsdCAgICA9IHNhbHQuc2xpY2UoLTMyKTtcblxuXHR2YXIgaXYgICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBzYWx0LCAxMDAwMCwgMTIsICdzaGE1MTInKTtcblx0dmFyIGtleSAgICAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwga2V5U2FsdCwgMTAwMDAsIDMyLCAnc2hhNTEyJyk7XG5cdHZhciBhYWQgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIGFhZFNhbHQsIDEwMDAwLCAzMiwgJ3NoYTUxMicpO1xuXHR2YXIgdGFnICAgICAgICA9IGVuY3J5cHRlZEF1dGhEYXRhLnNsaWNlKC0xNik7XG5cblx0dmFyIGRlY2lwaGVyICAgPSBjcnlwdG8uY3JlYXRlRGVjaXBoZXJpdihhbGdvcml0aG0sIGtleSwgaXYpO1xuXG5cdGRlY2lwaGVyLnNldEFBRChhYWQpO1xuXHRkZWNpcGhlci5zZXRBdXRoVGFnKHRhZyk7XG5cdHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oZW5jcnlwdGVkSW5wdXRQYXRoLCB7c3RhcnQ6IDAsIGVuZDogZmlsZVNpemVJbkJ5dGVzIC0gODF9KTtcblx0aWYoIWZzLmV4aXN0c1N5bmModGVtcEZvbGRlcikpe1xuXHRcdGZzLm1rZGlyU3luYyh0ZW1wRm9sZGVyKTtcblx0fVxuXHR2YXIgdGVtcEFyY2hpdmVQYXRoID0gcGF0aC5qb2luKHRlbXBGb2xkZXIsIHBhdGguYmFzZW5hbWUoZW5jcnlwdGVkSW5wdXRQYXRoKStcIi56aXBcIik7XG5cdGlmKCFmcy5leGlzdHNTeW5jKHRlbXBBcmNoaXZlUGF0aCkpe1xuXHRcdGZzLndyaXRlRmlsZVN5bmModGVtcEFyY2hpdmVQYXRoKTtcblx0fVxuXHR2YXIgd3MgPSBmcy5jcmVhdGVXcml0ZVN0cmVhbSh0ZW1wQXJjaGl2ZVBhdGgsIHthdXRvQ2xvc2U6IGZhbHNlfSk7XG5cdHdzLm9uKFwiZmluaXNoXCIsIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRpZihlcnIpe1xuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH1lbHNle1xuXHRcdFx0d3MuY2xvc2UoKTtcblx0XHRcdC8vIGRlbGV0ZUZvbGRlcih0ZW1wRm9sZGVyKTtcblx0XHRcdHZhciBuZXdQYXRoID0gcGF0aC5qb2luKHBhdGgubm9ybWFsaXplKGVuY3J5cHRlZElucHV0UGF0aCtcIi8uLlwiKSwgZW5jb2RlKGNyeXB0by5yYW5kb21CeXRlcygzMikpKTtcblx0XHRcdGZzLnJlbmFtZVN5bmMoZW5jcnlwdGVkSW5wdXRQYXRoLCBuZXdQYXRoKTtcblx0XHRcdGZzLnVubGlua1N5bmMobmV3UGF0aCk7XG5cdFx0XHQvLyBmcy51bmxpbmtTeW5jKHRlbXBBcmNoaXZlUGF0aCk7XG5cdFx0XHRjYWxsYmFjayhudWxsLCB0ZW1wQXJjaGl2ZVBhdGgpO1xuXG5cdFx0fVxuXHR9KTtcblx0cnMucGlwZShkZWNpcGhlcikucGlwZSh3cyk7XG5cbn1cblxuZnVuY3Rpb24gY3JlYXRlUHNrSGFzaChkYXRhKXtcblx0dmFyIGhhc2g1MTIgPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhNTEyJyk7XG5cdHZhciBoYXNoMjU2ID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTI1NicpO1xuXHRoYXNoNTEyLnVwZGF0ZShkYXRhKTtcblx0aGFzaDI1Ni51cGRhdGUoaGFzaDUxMi5kaWdlc3QoKSk7XG5cdHJldHVybiBoYXNoMjU2LmRpZ2VzdCgpO1xufVxuXG5mdW5jdGlvbiBpc0pzb24oZGF0YSl7XG5cdHRyeXtcblx0XHRKU09OLnBhcnNlKGRhdGEpO1xuXHR9Y2F0Y2goZSl7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZVNhbHQoaW5wdXREYXRhLCBzYWx0TGVuKXtcblx0dmFyIGhhc2ggICA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGE1MTInKTtcblx0aGFzaC51cGRhdGUoaW5wdXREYXRhKTtcblx0dmFyIGRpZ2VzdCA9IEJ1ZmZlci5mcm9tKGhhc2guZGlnZXN0KCdoZXgnKSwgJ2JpbmFyeScpO1xuXG5cdHJldHVybiBkaWdlc3Quc2xpY2UoMCwgc2FsdExlbik7XG59XG5cbmZ1bmN0aW9uIGVuY3J5cHQoZGF0YSwgcGFzc3dvcmQpe1xuXHR2YXIga2V5U2FsdCAgICAgICA9IGNyeXB0by5yYW5kb21CeXRlcygzMik7XG5cdHZhciBrZXkgICAgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIGtleVNhbHQsIDEwMDAwLCAzMiwgJ3NoYTUxMicpO1xuXG5cdHZhciBhYWRTYWx0ICAgICAgID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDMyKTtcblx0dmFyIGFhZCAgICAgICAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwgYWFkU2FsdCwgMTAwMDAsIDMyLCAnc2hhNTEyJyk7XG5cblx0dmFyIHNhbHQgICAgICAgICAgPSBCdWZmZXIuY29uY2F0KFtrZXlTYWx0LCBhYWRTYWx0XSk7XG5cdHZhciBpdiAgICAgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIHNhbHQsIDEwMDAwLCAxMiwgJ3NoYTUxMicpO1xuXG5cdHZhciBjaXBoZXIgICAgICAgID0gY3J5cHRvLmNyZWF0ZUNpcGhlcml2KGFsZ29yaXRobSwga2V5LCBpdik7XG5cdGNpcGhlci5zZXRBQUQoYWFkKTtcblx0dmFyIGVuY3J5cHRlZFRleHQgPSBjaXBoZXIudXBkYXRlKGRhdGEsJ2JpbmFyeScpO1xuXHR2YXIgZmluYWwgPSBCdWZmZXIuZnJvbShjaXBoZXIuZmluYWwoJ2JpbmFyeScpLCdiaW5hcnknKTtcblx0dmFyIHRhZyA9IGNpcGhlci5nZXRBdXRoVGFnKCk7XG5cblx0ZW5jcnlwdGVkVGV4dCA9IEJ1ZmZlci5jb25jYXQoW2VuY3J5cHRlZFRleHQsIGZpbmFsXSk7XG5cblx0cmV0dXJuIEJ1ZmZlci5jb25jYXQoW3NhbHQsIGVuY3J5cHRlZFRleHQsIHRhZ10pO1xufVxuXG5mdW5jdGlvbiBkZWNyeXB0KGVuY3J5cHRlZERhdGEsIHBhc3N3b3JkKXtcblx0dmFyIHNhbHQgICAgICAgPSBlbmNyeXB0ZWREYXRhLnNsaWNlKDAsIDY0KTtcblx0dmFyIGtleVNhbHQgICAgPSBzYWx0LnNsaWNlKDAsIDMyKTtcblx0dmFyIGFhZFNhbHQgICAgPSBzYWx0LnNsaWNlKC0zMik7XG5cblx0dmFyIGl2ICAgICAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwgc2FsdCwgMTAwMDAsIDEyLCAnc2hhNTEyJyk7XG5cdHZhciBrZXkgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIGtleVNhbHQsIDEwMDAwLCAzMiwgJ3NoYTUxMicpO1xuXHR2YXIgYWFkICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBhYWRTYWx0LCAxMDAwMCwgMzIsICdzaGE1MTInKTtcblxuXHR2YXIgY2lwaGVydGV4dCA9IGVuY3J5cHRlZERhdGEuc2xpY2UoNjQsIGVuY3J5cHRlZERhdGEubGVuZ3RoIC0gMTYpO1xuXHR2YXIgdGFnICAgICAgICA9IGVuY3J5cHRlZERhdGEuc2xpY2UoLTE2KTtcblxuXHR2YXIgZGVjaXBoZXIgICA9IGNyeXB0by5jcmVhdGVEZWNpcGhlcml2KGFsZ29yaXRobSwga2V5LCBpdik7XG5cdGRlY2lwaGVyLnNldEF1dGhUYWcodGFnKTtcblx0ZGVjaXBoZXIuc2V0QUFEKGFhZCk7XG5cblx0dmFyIHBsYWludGV4dCAgPSBCdWZmZXIuZnJvbShkZWNpcGhlci51cGRhdGUoY2lwaGVydGV4dCwgJ2JpbmFyeScpLCAnYmluYXJ5Jyk7XG5cdHZhciBmaW5hbCAgICAgID0gQnVmZmVyLmZyb20oZGVjaXBoZXIuZmluYWwoJ2JpbmFyeScpLCAnYmluYXJ5Jyk7XG5cdHBsYWludGV4dCAgICAgID0gQnVmZmVyLmNvbmNhdChbcGxhaW50ZXh0LCBmaW5hbF0pO1xuXG5cdHJldHVybiBwbGFpbnRleHQ7XG59XG5cblxuZnVuY3Rpb24gZGVyaXZlS2V5KHBhc3N3b3JkLCBpdGVyYXRpb25zLCBka0xlbikge1xuXHRpdGVyYXRpb25zID0gaXRlcmF0aW9ucyB8fCAxMDAwMDtcblx0ZGtMZW4gICAgICA9IGRrTGVuIHx8IDMyO1xuXHR2YXIgc2FsdCAgID0gZ2VuZXJhdGVTYWx0KHBhc3N3b3JkLCAzMik7XG5cdHZhciBkayAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwgc2FsdCwgaXRlcmF0aW9ucywgZGtMZW4sICdzaGE1MTInKTtcblx0cmV0dXJuIEJ1ZmZlci5mcm9tKGRrKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNyZWF0ZVBza0hhc2gsXG5cdGVuY3J5cHQsXG5cdGVuY3J5cHRGaWxlLFxuXHRkZWNyeXB0LFxuXHRkZWNyeXB0RmlsZSxcblx0ZGVsZXRlRm9sZGVyLFxuXHRkZXJpdmVLZXksXG5cdGVuY29kZSxcblx0aXNKc29uLFxufTtcblxuXG4iLCJ2YXIgc3RyZWFtID0gcmVxdWlyZSgnc3RyZWFtJylcblxuXG5mdW5jdGlvbiBpc1N0cmVhbSAob2JqKSB7XG5cdHJldHVybiBvYmogaW5zdGFuY2VvZiBzdHJlYW0uU3RyZWFtXG59XG5cblxuZnVuY3Rpb24gaXNSZWFkYWJsZSAob2JqKSB7XG5cdHJldHVybiBpc1N0cmVhbShvYmopICYmIHR5cGVvZiBvYmouX3JlYWQgPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb2JqLl9yZWFkYWJsZVN0YXRlID09ICdvYmplY3QnXG59XG5cblxuZnVuY3Rpb24gaXNXcml0YWJsZSAob2JqKSB7XG5cdHJldHVybiBpc1N0cmVhbShvYmopICYmIHR5cGVvZiBvYmouX3dyaXRlID09ICdmdW5jdGlvbicgJiYgdHlwZW9mIG9iai5fd3JpdGFibGVTdGF0ZSA9PSAnb2JqZWN0J1xufVxuXG5cbmZ1bmN0aW9uIGlzRHVwbGV4IChvYmopIHtcblx0cmV0dXJuIGlzUmVhZGFibGUob2JqKSAmJiBpc1dyaXRhYmxlKG9iailcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyAgICAgICAgICAgID0gaXNTdHJlYW07XG5tb2R1bGUuZXhwb3J0cy5pc1JlYWRhYmxlID0gaXNSZWFkYWJsZTtcbm1vZHVsZS5leHBvcnRzLmlzV3JpdGFibGUgPSBpc1dyaXRhYmxlO1xubW9kdWxlLmV4cG9ydHMuaXNEdXBsZXggICA9IGlzRHVwbGV4OyIsIi8qXG4gU2lnblNlbnMgaGVscGVyIGZ1bmN0aW9uc1xuICovXG5jb25zdCBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTtcblxuZXhwb3J0cy53aXBlT3V0c2lkZVBheWxvYWQgPSBmdW5jdGlvbiB3aXBlT3V0c2lkZVBheWxvYWQoaGFzaFN0cmluZ0hleGEsIHBvcywgc2l6ZSl7XG4gICAgdmFyIHJlc3VsdDtcbiAgICB2YXIgc3ogPSBoYXNoU3RyaW5nSGV4YS5sZW5ndGg7XG5cbiAgICB2YXIgZW5kID0gKHBvcyArIHNpemUpICUgc3o7XG5cbiAgICBpZihwb3MgPCBlbmQpe1xuICAgICAgICByZXN1bHQgPSAnMCcucmVwZWF0KHBvcykgKyAgaGFzaFN0cmluZ0hleGEuc3Vic3RyaW5nKHBvcywgZW5kKSArICcwJy5yZXBlYXQoc3ogLSBlbmQpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gaGFzaFN0cmluZ0hleGEuc3Vic3RyaW5nKDAsIGVuZCkgKyAnMCcucmVwZWF0KHBvcyAtIGVuZCkgKyBoYXNoU3RyaW5nSGV4YS5zdWJzdHJpbmcocG9zLCBzeik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cblxuXG5leHBvcnRzLmV4dHJhY3RQYXlsb2FkID0gZnVuY3Rpb24gZXh0cmFjdFBheWxvYWQoaGFzaFN0cmluZ0hleGEsIHBvcywgc2l6ZSl7XG4gICAgdmFyIHJlc3VsdDtcblxuICAgIHZhciBzeiA9IGhhc2hTdHJpbmdIZXhhLmxlbmd0aDtcbiAgICB2YXIgZW5kID0gKHBvcyArIHNpemUpICUgc3o7XG5cbiAgICBpZiggcG9zIDwgZW5kKXtcbiAgICAgICAgcmVzdWx0ID0gaGFzaFN0cmluZ0hleGEuc3Vic3RyaW5nKHBvcywgcG9zICsgc2l6ZSk7XG4gICAgfSBlbHNle1xuXG4gICAgICAgIGlmKDAgIT0gZW5kKXtcbiAgICAgICAgICAgIHJlc3VsdCA9IGhhc2hTdHJpbmdIZXhhLnN1YnN0cmluZygwLCBlbmQpXG4gICAgICAgIH0gIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gaGFzaFN0cmluZ0hleGEuc3Vic3RyaW5nKHBvcywgc3opO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5cblxuZXhwb3J0cy5maWxsUGF5bG9hZCA9IGZ1bmN0aW9uIGZpbGxQYXlsb2FkKHBheWxvYWQsIHBvcywgc2l6ZSl7XG4gICAgdmFyIHN6ID0gNjQ7XG4gICAgdmFyIHJlc3VsdCA9IFwiXCI7XG5cbiAgICB2YXIgZW5kID0gKHBvcyArIHNpemUpICUgc3o7XG5cbiAgICBpZiggcG9zIDwgZW5kKXtcbiAgICAgICAgcmVzdWx0ID0gJzAnLnJlcGVhdChwb3MpICsgcGF5bG9hZCArICcwJy5yZXBlYXQoc3ogLSBlbmQpO1xuICAgIH0gZWxzZXtcbiAgICAgICAgcmVzdWx0ID0gcGF5bG9hZC5zdWJzdHJpbmcoMCxlbmQpO1xuICAgICAgICByZXN1bHQgKz0gJzAnLnJlcGVhdChwb3MgLSBlbmQpO1xuICAgICAgICByZXN1bHQgKz0gcGF5bG9hZC5zdWJzdHJpbmcoZW5kKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuXG5cbmV4cG9ydHMuZ2VuZXJhdGVQb3NIYXNoWFRpbWVzID0gZnVuY3Rpb24gZ2VuZXJhdGVQb3NIYXNoWFRpbWVzKGJ1ZmZlciwgcG9zLCBzaXplLCBjb3VudCl7IC8vZ2VuZXJhdGUgcG9zaXRpb25hbCBoYXNoXG4gICAgdmFyIHJlc3VsdCAgPSBidWZmZXIudG9TdHJpbmcoXCJoZXhcIik7XG5cbiAgICAvKmlmKHBvcyAhPSAtMSApXG4gICAgICAgIHJlc3VsdFtwb3NdID0gMDsgKi9cblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKXtcbiAgICAgICAgdmFyIGhhc2ggPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMjU2Jyk7XG4gICAgICAgIHJlc3VsdCA9IGV4cG9ydHMud2lwZU91dHNpZGVQYXlsb2FkKHJlc3VsdCwgcG9zLCBzaXplKTtcbiAgICAgICAgaGFzaC51cGRhdGUocmVzdWx0KTtcbiAgICAgICAgcmVzdWx0ID0gaGFzaC5kaWdlc3QoJ2hleCcpO1xuICAgIH1cbiAgICByZXR1cm4gZXhwb3J0cy53aXBlT3V0c2lkZVBheWxvYWQocmVzdWx0LCBwb3MsIHNpemUpO1xufVxuXG5leHBvcnRzLmhhc2hTdHJpbmdBcnJheSA9IGZ1bmN0aW9uIChjb3VudGVyLCBhcnIsIHBheWxvYWRTaXplKXtcblxuICAgIGNvbnN0IGhhc2ggPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMjU2Jyk7XG4gICAgdmFyIHJlc3VsdCA9IGNvdW50ZXIudG9TdHJpbmcoMTYpO1xuXG4gICAgZm9yKHZhciBpID0gMCA7IGkgPCA2NDsgaSsrKXtcbiAgICAgICAgcmVzdWx0ICs9IGV4cG9ydHMuZXh0cmFjdFBheWxvYWQoYXJyW2ldLGksIHBheWxvYWRTaXplKTtcbiAgICB9XG5cbiAgICBoYXNoLnVwZGF0ZShyZXN1bHQpO1xuICAgIHZhciByZXN1bHQgPSBoYXNoLmRpZ2VzdCgnaGV4Jyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuXG5cblxuXG5cbmZ1bmN0aW9uIGR1bXBNZW1iZXIob2JqKXtcbiAgICB2YXIgdHlwZSA9IEFycmF5LmlzQXJyYXkob2JqKSA/IFwiYXJyYXlcIiA6IHR5cGVvZiBvYmo7XG4gICAgaWYob2JqID09PSBudWxsKXtcbiAgICAgICAgcmV0dXJuIFwibnVsbFwiO1xuICAgIH1cbiAgICBpZihvYmogPT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHJldHVybiBcInVuZGVmaW5lZFwiO1xuICAgIH1cblxuICAgIHN3aXRjaCh0eXBlKXtcbiAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICBjYXNlIFwic3RyaW5nXCI6cmV0dXJuIG9iai50b1N0cmluZygpOyBicmVhaztcbiAgICAgICAgY2FzZSBcIm9iamVjdFwiOiByZXR1cm4gZXhwb3J0cy5kdW1wT2JqZWN0Rm9ySGFzaGluZyhvYmopOyBicmVhaztcbiAgICAgICAgY2FzZSBcImJvb2xlYW5cIjogcmV0dXJuICBvYmo/IFwidHJ1ZVwiOiBcImZhbHNlXCI7IGJyZWFrO1xuICAgICAgICBjYXNlIFwiYXJyYXlcIjpcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBcIlwiO1xuICAgICAgICAgICAgZm9yKHZhciBpPTA7IGkgPCBvYmoubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBleHBvcnRzLmR1bXBPYmplY3RGb3JIYXNoaW5nKG9ialtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUeXBlIFwiICsgIHR5cGUgKyBcIiBjYW5ub3QgYmUgY3J5cHRvZ3JhcGhpY2FsbHkgZGlnZXN0ZWRcIik7XG4gICAgfVxuXG59XG5cblxuZXhwb3J0cy5kdW1wT2JqZWN0Rm9ySGFzaGluZyA9IGZ1bmN0aW9uKG9iail7XG4gICAgdmFyIHJlc3VsdCA9IFwiXCI7XG5cbiAgICBpZihvYmogPT09IG51bGwpe1xuICAgICAgICByZXR1cm4gXCJudWxsXCI7XG4gICAgfVxuICAgIGlmKG9iaiA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgcmV0dXJuIFwidW5kZWZpbmVkXCI7XG4gICAgfVxuXG4gICAgdmFyIGJhc2ljVHlwZXMgPSB7XG4gICAgICAgIFwiYXJyYXlcIiAgICAgOiB0cnVlLFxuICAgICAgICBcIm51bWJlclwiICAgIDogdHJ1ZSxcbiAgICAgICAgXCJib29sZWFuXCIgICA6IHRydWUsXG4gICAgICAgIFwic3RyaW5nXCIgICAgOiB0cnVlLFxuICAgICAgICBcIm9iamVjdFwiICAgIDogZmFsc2VcbiAgICB9XG5cbiAgICB2YXIgdHlwZSA9IEFycmF5LmlzQXJyYXkob2JqKSA/IFwiYXJyYXlcIiA6IHR5cGVvZiBvYmo7XG4gICAgaWYoIGJhc2ljVHlwZXNbdHlwZV0pe1xuICAgICAgICByZXR1cm4gZHVtcE1lbWJlcihvYmopO1xuICAgIH1cblxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcbiAgICBrZXlzLnNvcnQoKTtcblxuXG4gICAgZm9yKHZhciBpPTA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgcmVzdWx0ICs9IGR1bXBNZW1iZXIoa2V5c1tpXSk7XG4gICAgICAgIHJlc3VsdCArPSBkdW1wTWVtYmVyKG9ialtrZXlzW2ldXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuXG5leHBvcnRzLmhhc2hWYWx1ZXMgID0gZnVuY3Rpb24gKHZhbHVlcyl7XG4gICAgY29uc3QgaGFzaCA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGEyNTYnKTtcbiAgICB2YXIgcmVzdWx0ID0gZXhwb3J0cy5kdW1wT2JqZWN0Rm9ySGFzaGluZyh2YWx1ZXMpO1xuICAgIGhhc2gudXBkYXRlKHJlc3VsdCk7XG4gICAgcmV0dXJuIGhhc2guZGlnZXN0KCdoZXgnKTtcbn07XG5cbmV4cG9ydHMuZ2V0SlNPTkZyb21TaWduYXR1cmUgPSBmdW5jdGlvbiBnZXRKU09ORnJvbVNpZ25hdHVyZShzaWduYXR1cmUsIHNpemUpe1xuICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgIHByb29mOltdXG4gICAgfTtcbiAgICB2YXIgYSA9IHNpZ25hdHVyZS5zcGxpdChcIjpcIik7XG4gICAgcmVzdWx0LmFnZW50ICAgICAgICA9IGFbMF07XG4gICAgcmVzdWx0LmNvdW50ZXIgICAgICA9ICBwYXJzZUludChhWzFdLCBcImhleFwiKTtcbiAgICByZXN1bHQubmV4dFB1YmxpYyAgID0gIGFbMl07XG5cbiAgICB2YXIgcHJvb2YgPSBhWzNdXG5cblxuICAgIGlmKHByb29mLmxlbmd0aC9zaXplICE9IDY0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc2lnbmF0dXJlIFwiICsgcHJvb2YpO1xuICAgIH1cblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKXtcbiAgICAgICAgcmVzdWx0LnByb29mLnB1c2goZXhwb3J0cy5maWxsUGF5bG9hZChwcm9vZi5zdWJzdHJpbmcoaSAqIHNpemUsKGkrMSkgKiBzaXplICksIGksIHNpemUpKVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydHMuY3JlYXRlU2lnbmF0dXJlID0gZnVuY3Rpb24gKGFnZW50LGNvdW50ZXIsIG5leHRQdWJsaWMsIGFyciwgc2l6ZSl7XG4gICAgdmFyIHJlc3VsdCA9IFwiXCI7XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgcmVzdWx0ICs9IGV4cG9ydHMuZXh0cmFjdFBheWxvYWQoYXJyW2ldLCBpICwgc2l6ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFnZW50ICsgXCI6XCIgKyBjb3VudGVyICsgXCI6XCIgKyBuZXh0UHVibGljICsgXCI6XCIgKyByZXN1bHQ7XG59IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdFx0XHRcdFx0YmVlc0hlYWxlcjogcmVxdWlyZShcIi4vbGliL2JlZXNIZWFsZXJcIiksXG5cdFx0XHRcdFx0c291bmRQdWJTdWI6IHJlcXVpcmUoXCIuL2xpYi9zb3VuZFB1YlN1YlwiKS5zb3VuZFB1YlN1Yixcblx0XHRcdFx0XHRmb2xkZXJNUTogcmVxdWlyZShcIi4vbGliL2ZvbGRlck1RXCIpXG59OyIsImZ1bmN0aW9uIFF1ZXVlRWxlbWVudChjb250ZW50KSB7XG5cdHRoaXMuY29udGVudCA9IGNvbnRlbnQ7XG5cdHRoaXMubmV4dCA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIFF1ZXVlKCkge1xuXHR0aGlzLmhlYWQgPSBudWxsO1xuXHR0aGlzLnRhaWwgPSBudWxsO1xuXG5cdHRoaXMucHVzaCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdGxldCBuZXdFbGVtZW50ID0gbmV3IFF1ZXVlRWxlbWVudCh2YWx1ZSk7XG5cdFx0aWYgKCF0aGlzLmhlYWQpIHtcblx0XHRcdHRoaXMuaGVhZCA9IG5ld0VsZW1lbnQ7XG5cdFx0XHR0aGlzLnRhaWwgPSBuZXdFbGVtZW50O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnRhaWwubmV4dCA9IG5ld0VsZW1lbnQ7XG5cdFx0XHR0aGlzLnRhaWwgPSBuZXdFbGVtZW50XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMucG9wID0gZnVuY3Rpb24gKCkge1xuXHRcdGlmICghdGhpcy5oZWFkKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdFx0Y29uc3QgaGVhZENvcHkgPSB0aGlzLmhlYWQ7XG5cdFx0dGhpcy5oZWFkID0gdGhpcy5oZWFkLm5leHQ7XG5cdFx0cmV0dXJuIGhlYWRDb3B5LmNvbnRlbnQ7XG5cdH07XG5cblx0dGhpcy5mcm9udCA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5oZWFkID8gdGhpcy5oZWFkLmNvbnRlbnQgOiB1bmRlZmluZWQ7XG5cdH07XG5cblx0dGhpcy5pc0VtcHR5ID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLmhlYWQgPT0gbnVsbDtcblx0fTtcblxuXHR0aGlzW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiogKCkge1xuXHRcdGxldCBoZWFkID0gdGhpcy5oZWFkO1xuXHRcdHdoaWxlKGhlYWQgIT09IG51bGwpIHtcblx0XHRcdHlpZWxkIGhlYWQuY29udGVudDtcblx0XHRcdGhlYWQgPSBoZWFkLm5leHQ7XG5cdFx0fVxuXHR9LmJpbmQodGhpcyk7XG59XG5cblF1ZXVlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcblx0bGV0IHN0cmluZ2lmaWVkUXVldWUgPSAnJztcblx0bGV0IGl0ZXJhdG9yID0gdGhpcy5oZWFkO1xuXHR3aGlsZSAoaXRlcmF0b3IpIHtcblx0XHRzdHJpbmdpZmllZFF1ZXVlICs9IGAke0pTT04uc3RyaW5naWZ5KGl0ZXJhdG9yLmNvbnRlbnQpfSBgO1xuXHRcdGl0ZXJhdG9yID0gaXRlcmF0b3IubmV4dDtcblx0fVxuXHRyZXR1cm4gc3RyaW5naWZpZWRRdWV1ZVxufTtcblxuUXVldWUucHJvdG90eXBlLmluc3BlY3QgPSBRdWV1ZS5wcm90b3R5cGUudG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gUXVldWU7IiwiXG4vKlxuICAgIFByZXBhcmUgdGhlIHN0YXRlIG9mIGEgc3dhcm0gdG8gYmUgc2VyaWFsaXNlZFxuKi9cblxuZXhwb3J0cy5hc0pTT04gPSBmdW5jdGlvbih2YWx1ZU9iamVjdCwgcGhhc2VOYW1lLCBhcmdzLCBjYWxsYmFjayl7XG5cbiAgICAgICAgdmFyIHZhbHVlT2JqZWN0ID0gdmFsdWVPYmplY3QudmFsdWVPZigpO1xuICAgICAgICB2YXIgcmVzID0ge307XG4gICAgICAgIHJlcy5wdWJsaWNWYXJzICAgICAgICAgID0gdmFsdWVPYmplY3QucHVibGljVmFycztcbiAgICAgICAgcmVzLnByaXZhdGVWYXJzICAgICAgICAgPSB2YWx1ZU9iamVjdC5wcml2YXRlVmFycztcbiAgICAgICAgcmVzLm1ldGEgICAgICAgICAgICAgICAgPSB7fTtcblxuICAgICAgICByZXMubWV0YS5zd2FybVR5cGVOYW1lICA9IHZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1UeXBlTmFtZTtcbiAgICAgICAgcmVzLm1ldGEuc3dhcm1JZCAgICAgICAgPSB2YWx1ZU9iamVjdC5tZXRhLnN3YXJtSWQ7XG4gICAgICAgIHJlcy5tZXRhLnRhcmdldCAgICAgICAgID0gdmFsdWVPYmplY3QubWV0YS50YXJnZXQ7XG5cbiAgICAgICAgaWYoIXBoYXNlTmFtZSl7XG4gICAgICAgICAgICByZXMubWV0YS5jb21tYW5kICAgID0gXCJzdG9yZWRcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcy5tZXRhLnBoYXNlTmFtZSAgPSBwaGFzZU5hbWU7XG4gICAgICAgICAgICByZXMubWV0YS5hcmdzICAgICAgID0gYXJncztcbiAgICAgICAgICAgIHJlcy5tZXRhLmNvbW1hbmQgICAgPSB2YWx1ZU9iamVjdC5tZXRhLmNvbW1hbmQgfHwgXCJleGVjdXRlU3dhcm1QaGFzZVwiO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzLm1ldGEud2FpdFN0YWNrICA9IHZhbHVlT2JqZWN0Lm1ldGEud2FpdFN0YWNrOyAvL1RPRE86IHRoaW5rIGlmIGlzIG5vdCBiZXR0ZXIgdG8gYmUgZGVlcCBjbG9uZWQgYW5kIG5vdCByZWZlcmVuY2VkISEhXG5cbiAgICAgICAgaWYoY2FsbGJhY2spe1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzKTtcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKFwiYXNKU09OOlwiLCByZXMsIHZhbHVlT2JqZWN0KTtcbiAgICAgICAgcmV0dXJuIHJlcztcbn1cblxuZXhwb3J0cy5qc29uVG9OYXRpdmUgPSBmdW5jdGlvbihzZXJpYWxpc2VkVmFsdWVzLCByZXN1bHQpe1xuXG4gICAgZm9yKHZhciB2IGluIHNlcmlhbGlzZWRWYWx1ZXMucHVibGljVmFycyl7XG4gICAgICAgIHJlc3VsdC5wdWJsaWNWYXJzW3ZdID0gc2VyaWFsaXNlZFZhbHVlcy5wdWJsaWNWYXJzW3ZdO1xuXG4gICAgfTtcbiAgICBmb3IodmFyIHYgaW4gc2VyaWFsaXNlZFZhbHVlcy5wcml2YXRlVmFycyl7XG4gICAgICAgIHJlc3VsdC5wcml2YXRlVmFyc1t2XSA9IHNlcmlhbGlzZWRWYWx1ZXMucHJpdmF0ZVZhcnNbdl07XG4gICAgfTtcblxuICAgIGZvcih2YXIgdiBpbiBzZXJpYWxpc2VkVmFsdWVzLm1ldGEpe1xuICAgICAgICByZXN1bHQubWV0YVt2XSA9IHNlcmlhbGlzZWRWYWx1ZXMubWV0YVt2XTtcbiAgICB9O1xuXG59IiwiXG52YXIgZnMgPSByZXF1aXJlKFwiZnNcIik7XG52YXIgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xudmFyIGJlZXNIZWFsZXIgPSByZXF1aXJlKFwiLi9iZWVzSGVhbGVyXCIpO1xuXG4vL1RPRE86IHByZXZlbnQgYSBjbGFzcyBvZiByYWNlIGNvbmRpdGlvbiB0eXBlIG9mIGVycm9ycyBieSBzaWduYWxpbmcgd2l0aCBmaWxlcyBtZXRhZGF0YSB0byB0aGUgd2F0Y2hlciB3aGVuIGl0IGlzIHNhZmUgdG8gY29uc3VtZVxuXG5mdW5jdGlvbiBGb2xkZXJNUShmb2xkZXIsIGNhbGxiYWNrID0gKCkgPT4ge30pe1xuXG5cdGlmKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKXtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTZWNvbmQgcGFyYW1ldGVyIHNob3VsZCBiZSBhIGNhbGxiYWNrIGZ1bmN0aW9uXCIpO1xuXHR9XG5cblx0Zm9sZGVyID0gcGF0aC5ub3JtYWxpemUoZm9sZGVyKTtcblxuXHRmcy5ta2Rpcihmb2xkZXIsIGZ1bmN0aW9uKGVyciwgcmVzKXtcblx0XHRmcy5leGlzdHMoZm9sZGVyLCBmdW5jdGlvbihleGlzdHMpIHtcblx0XHRcdGlmIChleGlzdHMpIHtcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgZm9sZGVyKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y2FsbGJhY2soZXJyKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG5cblx0ZnVuY3Rpb24gbWtGaWxlTmFtZShzd2FybVJhdyl7XG5cdFx0cmV0dXJuIHBhdGgubm9ybWFsaXplKGZvbGRlciArIFwiL1wiICsgc3dhcm1SYXcubWV0YS5zd2FybUlkICsgXCIuXCIrc3dhcm1SYXcubWV0YS5zd2FybVR5cGVOYW1lKTtcblx0fVxuXG5cdHRoaXMuZ2V0SGFuZGxlciA9IGZ1bmN0aW9uKCl7XG5cdFx0aWYocHJvZHVjZXIpe1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiT25seSBvbmUgY29uc3VtZXIgaXMgYWxsb3dlZCFcIik7XG5cdFx0fVxuXHRcdHByb2R1Y2VyID0gdHJ1ZTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0YWRkU3RyZWFtIDogZnVuY3Rpb24oc3RyZWFtLCBjYWxsYmFjayl7XG5cdFx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKXtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTZWNvbmQgcGFyYW1ldGVyIHNob3VsZCBiZSBhIGNhbGxiYWNrIGZ1bmN0aW9uXCIpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoIXN0cmVhbSB8fCAhc3RyZWFtLnBpcGUgfHwgdHlwZW9mIHN0cmVhbS5waXBlICE9PSBcImZ1bmN0aW9uXCIpe1xuXHRcdFx0XHRcdGNhbGxiYWNrKG5ldyBFcnJvcihcIlNvbWV0aGluZyB3cm9uZyBoYXBwZW5lZFwiKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgc3dhcm0gPSBcIlwiO1xuXHRcdFx0XHRzdHJlYW0ub24oJ2RhdGEnLCAoY2h1bmspID0+e1xuXHRcdFx0XHRcdHN3YXJtICs9IGNodW5rO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRzdHJlYW0ub24oXCJlbmRcIiwgKCkgPT4ge1xuXHRcdFx0XHRcdHdyaXRlRmlsZShta0ZpbGVOYW1lKEpTT04ucGFyc2Uoc3dhcm0pKSwgc3dhcm0sIGNhbGxiYWNrKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0c3RyZWFtLm9uKFwiZXJyb3JcIiwgKGVycikgPT57XG5cdFx0XHRcdFx0Y2FsbGJhY2soZXJyKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9LFxuXHRcdFx0YWRkU3dhcm0gOiBmdW5jdGlvbihzd2FybSwgY2FsbGJhY2spe1xuXHRcdFx0XHRpZighY2FsbGJhY2spe1xuXHRcdFx0XHRcdGNhbGxiYWNrID0gJCQuZGVmYXVsdEVycm9ySGFuZGxpbmdJbXBsZW1lbnRhdGlvbjtcblx0XHRcdFx0fWVsc2UgaWYodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpe1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlNlY29uZCBwYXJhbWV0ZXIgc2hvdWxkIGJlIGEgY2FsbGJhY2sgZnVuY3Rpb25cIik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRiZWVzSGVhbGVyLmFzSlNPTihzd2FybSxudWxsLCBudWxsLCBmdW5jdGlvbihlcnIsIHJlcyl7XG5cdFx0XHRcdFx0d3JpdGVGaWxlKG1rRmlsZU5hbWUocmVzKSwgSihyZXMpLCBjYWxsYmFjayk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSxcblx0XHRcdHNlbmRTd2FybUZvckV4ZWN1dGlvbjogZnVuY3Rpb24oc3dhcm0sIGNhbGxiYWNrKXtcblx0XHRcdFx0aWYoIWNhbGxiYWNrKXtcblx0XHRcdFx0XHRjYWxsYmFjayA9ICQkLmRlZmF1bHRFcnJvckhhbmRsaW5nSW1wbGVtZW50YXRpb247XG5cdFx0XHRcdH1lbHNlIGlmKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKXtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTZWNvbmQgcGFyYW1ldGVyIHNob3VsZCBiZSBhIGNhbGxiYWNrIGZ1bmN0aW9uXCIpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YmVlc0hlYWxlci5hc0pTT04oc3dhcm0sIHN3YXJtLm1ldGEucGhhc2VOYW1lLCBzd2FybS5tZXRhLmFyZ3MsIGZ1bmN0aW9uKGVyciwgcmVzKXtcblx0XHRcdFx0XHR3cml0ZUZpbGUobWtGaWxlTmFtZShyZXMpLCBKKHJlcyksIGNhbGxiYWNrKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMucmVnaXN0ZXJDb25zdW1lciA9IGZ1bmN0aW9uIChjYWxsYmFjaywgc2hvdWxkRGVsZXRlQWZ0ZXJSZWFkID0gdHJ1ZSwgc2hvdWxkV2FpdEZvck1vcmUgPSAoKSA9PiB0cnVlKSB7XG5cdFx0aWYodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpe1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRmlyc3QgcGFyYW1ldGVyIHNob3VsZCBiZSBhIGNhbGxiYWNrIGZ1bmN0aW9uXCIpO1xuXHRcdH1cblx0XHRpZiAoY29uc3VtZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk9ubHkgb25lIGNvbnN1bWVyIGlzIGFsbG93ZWQhIFwiICsgZm9sZGVyKTtcblx0XHR9XG5cblx0XHRjb25zdW1lciA9IGNhbGxiYWNrO1xuXHRcdGZzLm1rZGlyKGZvbGRlciwgZnVuY3Rpb24gKGVyciwgcmVzKSB7XG5cdFx0XHRjb25zdW1lQWxsRXhpc3Rpbmcoc2hvdWxkRGVsZXRlQWZ0ZXJSZWFkLCBzaG91bGRXYWl0Rm9yTW9yZSk7XG5cdFx0fSk7XG5cdH07XG5cblx0dGhpcy53cml0ZU1lc3NhZ2UgPSB3cml0ZUZpbGU7XG5cblx0dGhpcy51bmxpbmtDb250ZW50ID0gZnVuY3Rpb24gKG1lc3NhZ2VJZCwgY2FsbGJhY2spIHtcblx0XHRjb25zdCBtZXNzYWdlUGF0aCA9IHBhdGguam9pbihmb2xkZXIsIG1lc3NhZ2VJZCk7XG5cblx0XHRmcy51bmxpbmsobWVzc2FnZVBhdGgsIChlcnIpID0+IHtcblx0XHRcdGNhbGxiYWNrKGVycik7XG5cdH0pO1xuXHR9O1xuXG5cblx0LyogLS0tLS0tLS0tLS0tLS0tLSBwcm90ZWN0ZWQgIGZ1bmN0aW9ucyAqL1xuXHR2YXIgY29uc3VtZXIgPSBudWxsO1xuXHR2YXIgcHJvZHVjZXIgPSBudWxsO1xuXG5cblx0ZnVuY3Rpb24gY29uc3VtZU1lc3NhZ2UoZmlsZW5hbWUsIHNob3VsZERlbGV0ZUFmdGVyUmVhZCwgY2FsbGJhY2spIHtcblx0XHR2YXIgZnVsbFBhdGggPSBwYXRoLm5vcm1hbGl6ZShmb2xkZXIgKyBcIi9cIiArIGZpbGVuYW1lKTtcblx0XHRmcy5yZWFkRmlsZShmdWxsUGF0aCwgXCJ1dGY4XCIsIGZ1bmN0aW9uIChlcnIsIGRhdGEpIHtcblx0XHRcdGlmICghZXJyKSB7XG5cdFx0XHRcdGlmIChkYXRhICE9PSBcIlwiKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShkYXRhKTtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdFx0ZXJyID0gZXJyb3I7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y2FsbGJhY2soZXJyLCBtZXNzYWdlKTtcblx0XHRcdFx0XHRpZiAoc2hvdWxkRGVsZXRlQWZ0ZXJSZWFkKSB7XG5cblx0XHRcdFx0XHRcdGZzLnVubGluayhmdWxsUGF0aCwgZnVuY3Rpb24gKGVyciwgcmVzKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChlcnIpIHRocm93IGVyclxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjYWxsYmFjayhlcnIpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gY29uc3VtZUFsbEV4aXN0aW5nKHNob3VsZERlbGV0ZUFmdGVyUmVhZCwgc2hvdWxkV2FpdEZvck1vcmUpIHtcblxuXHRcdGxldCBjdXJyZW50RmlsZXMgPSBbXTtcblxuXHRcdGZzLnJlYWRkaXIoZm9sZGVyLCAndXRmOCcsIGZ1bmN0aW9uIChlcnIsIGZpbGVzKSB7XG5cdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdCQkLmVycm9ySGFuZGxlci5lcnJvcihlcnIpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRjdXJyZW50RmlsZXMgPSBmaWxlcztcblx0XHRcdGl0ZXJhdGVBbmRDb25zdW1lKGZpbGVzKTtcblxuXHRcdH0pO1xuXG5cdFx0ZnVuY3Rpb24gc3RhcnRXYXRjaGluZygpe1xuXHRcdFx0aWYgKHNob3VsZFdhaXRGb3JNb3JlKCkpIHtcblx0XHRcdFx0d2F0Y2hGb2xkZXIoc2hvdWxkRGVsZXRlQWZ0ZXJSZWFkLCBzaG91bGRXYWl0Rm9yTW9yZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gaXRlcmF0ZUFuZENvbnN1bWUoZmlsZXMsIGN1cnJlbnRJbmRleCA9IDApIHtcblx0XHRcdGlmIChjdXJyZW50SW5kZXggPT09IGZpbGVzLmxlbmd0aCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcInN0YXJ0IHdhdGNoaW5nXCIpO1xuXHRcdFx0XHRzdGFydFdhdGNoaW5nKCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHBhdGguZXh0bmFtZShmaWxlc1tjdXJyZW50SW5kZXhdKSAhPT0gaW5fcHJvZ3Jlc3MpIHtcblx0XHRcdFx0Y29uc3VtZU1lc3NhZ2UoZmlsZXNbY3VycmVudEluZGV4XSwgc2hvdWxkRGVsZXRlQWZ0ZXJSZWFkLCAoZXJyLCBkYXRhKSA9PiB7XG5cdFx0XHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRcdFx0aXRlcmF0ZUFuZENvbnN1bWUoZmlsZXMsICsrY3VycmVudEluZGV4KTtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3VtZXIobnVsbCwgZGF0YSwgcGF0aC5iYXNlbmFtZShmaWxlc1tjdXJyZW50SW5kZXhdKSk7XG5cdFx0XHRcdFx0aWYgKHNob3VsZFdhaXRGb3JNb3JlKCkpIHtcblx0XHRcdFx0XHRcdGl0ZXJhdGVBbmRDb25zdW1lKGZpbGVzLCArK2N1cnJlbnRJbmRleCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aXRlcmF0ZUFuZENvbnN1bWUoZmlsZXMsICsrY3VycmVudEluZGV4KTtcblx0XHRcdH1cblx0XHR9XG5cblx0fVxuXG5cblxuXHRjb25zdCBpbl9wcm9ncmVzcyA9IFwiLmluX3Byb2dyZXNzXCI7XG5cdGZ1bmN0aW9uIHdyaXRlRmlsZShmaWxlbmFtZSwgY29udGVudCwgY2FsbGJhY2spe1xuXHRcdHZhciB0bXBGaWxlbmFtZSA9IGZpbGVuYW1lK2luX3Byb2dyZXNzO1xuXHRcdGZzLndyaXRlRmlsZSh0bXBGaWxlbmFtZSwgY29udGVudCwgZnVuY3Rpb24oZXJyb3IsIHJlcyl7XG5cdFx0XHRpZighZXJyb3Ipe1xuXHRcdFx0XHRmcy5yZW5hbWUodG1wRmlsZW5hbWUsIGZpbGVuYW1lLCBjYWxsYmFjayk7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0Y2FsbGJhY2soZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0dmFyIGFscmVhZHlLbm93bkNoYW5nZXMgPSB7fTtcblxuXHRmdW5jdGlvbiBhbHJlYWR5RmlyZWRDaGFuZ2VzKGZpbGVuYW1lLCBjaGFuZ2Upe1xuXHRcdHZhciByZXMgPSBmYWxzZTtcblx0XHRpZihhbHJlYWR5S25vd25DaGFuZ2VzW2ZpbGVuYW1lXSl7XG5cdFx0XHRyZXMgPSB0cnVlO1xuXHRcdH1lbHNle1xuXHRcdFx0YWxyZWFkeUtub3duQ2hhbmdlc1tmaWxlbmFtZV0gPSBjaGFuZ2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlcztcblx0fVxuXG5cdGZ1bmN0aW9uIHdhdGNoRm9sZGVyKHNob3VsZERlbGV0ZUFmdGVyUmVhZCwgc2hvdWxkV2FpdEZvck1vcmUpe1xuXHRcdGNvbnN0IHdhdGNoZXIgPSBmcy53YXRjaChmb2xkZXIsIGZ1bmN0aW9uKGV2ZW50VHlwZSwgZmlsZW5hbWUpe1xuXHRcdFx0IC8vY29uc29sZS5sb2coXCJXYXRjaGluZzpcIiwgZXZlbnRUeXBlLCBmaWxlbmFtZSk7XG5cblx0XHRcdGlmIChmaWxlbmFtZSAmJiAoZXZlbnRUeXBlID09PSBcImNoYW5nZVwiIHx8IGV2ZW50VHlwZSA9PT0gXCJyZW5hbWVcIikpIHtcblxuXHRcdFx0XHRpZihwYXRoLmV4dG5hbWUoZmlsZW5hbWUpICE9PSBpbl9wcm9ncmVzcyAmJiAhYWxyZWFkeUZpcmVkQ2hhbmdlcyhmaWxlbmFtZSwgZXZlbnRUeXBlKSl7XG5cdFx0XHRcdFx0Y29uc3VtZU1lc3NhZ2UoZmlsZW5hbWUsIHNob3VsZERlbGV0ZUFmdGVyUmVhZCwgKGVyciwgZGF0YSkgPT4ge1xuXHRcdFx0XHRcdFx0aWYoZXJyKSB7XG5cdFx0XHRcdFx0XHRcdC8vID8/XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNvbnN1bWVyKG51bGwsIGRhdGEsIGZpbGVuYW1lKTtcblx0XHRcdFx0XHRcdGlmKCFzaG91bGRXYWl0Rm9yTW9yZSgpKSB7XG5cdFx0XHRcdFx0XHRcdHdhdGNoZXIuY2xvc2UoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydHMuZ2V0Rm9sZGVyUXVldWUgPSBmdW5jdGlvbihmb2xkZXIsIGNhbGxiYWNrKXtcblx0cmV0dXJuIG5ldyBGb2xkZXJNUShmb2xkZXIsIGNhbGxiYWNrKTtcbn07IiwiLypcbkluaXRpYWwgTGljZW5zZTogKGMpIEF4aW9sb2dpYyBSZXNlYXJjaCAmIEFsYm9haWUgU8OubmljxIMuXG5Db250cmlidXRvcnM6IEF4aW9sb2dpYyBSZXNlYXJjaCAsIFByaXZhdGVTa3kgcHJvamVjdFxuQ29kZSBMaWNlbnNlOiBMR1BMIG9yIE1JVC5cbiovXG5cblxuLyoqXG4gKiAgIFVzdWFsbHkgYW4gZXZlbnQgY291bGQgY2F1c2UgZXhlY3V0aW9uIG9mIG90aGVyIGNhbGxiYWNrIGV2ZW50cyAuIFdlIHNheSB0aGF0IGlzIGEgbGV2ZWwgMSBldmVudCBpZiBpcyBjYXVzZWVkIGJ5IGEgbGV2ZWwgMCBldmVudCBhbmQgc28gb25cbiAqXG4gKiAgICAgIFNvdW5kUHViU3ViIHByb3ZpZGVzIGludHVpdGl2ZSByZXN1bHRzIHJlZ2FyZGluZyB0byBhc3luY2hyb25vdXMgY2FsbHMgb2YgY2FsbGJhY2tzIGFuZCBjb21wdXRlZCB2YWx1ZXMvZXhwcmVzc2lvbnM6XG4gKiAgIHdlIHByZXZlbnQgaW1tZWRpYXRlIGV4ZWN1dGlvbiBvZiBldmVudCBjYWxsYmFja3MgdG8gZW5zdXJlIHRoZSBpbnR1aXRpdmUgZmluYWwgcmVzdWx0IGlzIGd1YXJhbnRlZWQgYXMgbGV2ZWwgMCBleGVjdXRpb25cbiAqICAgd2UgZ3VhcmFudGVlIHRoYXQgYW55IGNhbGxiYWNrIGZ1bmN0aW9uIGlzIFwicmUtZW50cmFudFwiXG4gKiAgIHdlIGFyZSBhbHNvIHRyeWluZyB0byByZWR1Y2UgdGhlIG51bWJlciBvZiBjYWxsYmFjayBleGVjdXRpb24gYnkgbG9va2luZyBpbiBxdWV1ZXMgYXQgbmV3IG1lc3NhZ2VzIHB1Ymxpc2hlZCBieVxuICogICB0cnlpbmcgdG8gY29tcGFjdCB0aG9zZSBtZXNzYWdlcyAocmVtb3ZpbmcgZHVwbGljYXRlIG1lc3NhZ2VzLCBtb2RpZnlpbmcgbWVzc2FnZXMsIG9yIGFkZGluZyBpbiB0aGUgaGlzdG9yeSBvZiBhbm90aGVyIGV2ZW50ICxldGMpXG4gKlxuICogICAgICBFeGFtcGxlIG9mIHdoYXQgY2FuIGJlIHdyb25nIHdpdGhvdXQgbm9uLXNvdW5kIGFzeW5jaHJvbm91cyBjYWxsczpcblxuICogIFN0ZXAgMDogSW5pdGlhbCBzdGF0ZTpcbiAqICAgYSA9IDA7XG4gKiAgIGIgPSAwO1xuICpcbiAqICBTdGVwIDE6IEluaXRpYWwgb3BlcmF0aW9uczpcbiAqICAgYSA9IDE7XG4gKiAgIGIgPSAtMTtcbiAqXG4gKiAgLy8gYW4gb2JzZXJ2ZXIgcmVhY3RzIHRvIGNoYW5nZXMgaW4gYSBhbmQgYiBhbmQgY29tcHV0ZSBDT1JSRUNUIGxpa2UgdGhpczpcbiAqICAgaWYoIGEgKyBiID09IDApIHtcbiAqICAgICAgIENPUlJFQ1QgPSBmYWxzZTtcbiAqICAgICAgIG5vdGlmeSguLi4pOyAvLyBhY3Qgb3Igc2VuZCBhIG5vdGlmaWNhdGlvbiBzb21ld2hlcmUuLlxuICogICB9IGVsc2Uge1xuICogICAgICBDT1JSRUNUID0gZmFsc2U7XG4gKiAgIH1cbiAqXG4gKiAgICBOb3RpY2UgdGhhdDogQ09SUkVDVCB3aWxsIGJlIHRydWUgaW4gdGhlIGVuZCAsIGJ1dCBtZWFudGltZSwgYWZ0ZXIgYSBub3RpZmljYXRpb24gd2FzIHNlbnQgYW5kIENPUlJFQ1Qgd2FzIHdyb25nbHksIHRlbXBvcmFyaWx5IGZhbHNlIVxuICogICAgc291bmRQdWJTdWIgZ3VhcmFudGVlIHRoYXQgdGhpcyBkb2VzIG5vdCBoYXBwZW4gYmVjYXVzZSB0aGUgc3luY3Jvbm91cyBjYWxsIHdpbGwgYmVmb3JlIGFueSBvYnNlcnZlciAoYm90IGFzaWduYXRpb24gb24gYSBhbmQgYilcbiAqXG4gKiAgIE1vcmU6XG4gKiAgIHlvdSBjYW4gdXNlIGJsb2NrQ2FsbEJhY2tzIGFuZCByZWxlYXNlQ2FsbEJhY2tzIGluIGEgZnVuY3Rpb24gdGhhdCBjaGFuZ2UgYSBsb3QgYSBjb2xsZWN0aW9uIG9yIGJpbmRhYmxlIG9iamVjdHMgYW5kIGFsbFxuICogICB0aGUgbm90aWZpY2F0aW9ucyB3aWxsIGJlIHNlbnQgY29tcGFjdGVkIGFuZCBwcm9wZXJseVxuICovXG5cbi8vIFRPRE86IG9wdGltaXNhdGlvbiE/IHVzZSBhIG1vcmUgZWZmaWNpZW50IHF1ZXVlIGluc3RlYWQgb2YgYXJyYXlzIHdpdGggcHVzaCBhbmQgc2hpZnQhP1xuLy8gVE9ETzogc2VlIGhvdyBiaWcgdGhvc2UgcXVldWVzIGNhbiBiZSBpbiByZWFsIGFwcGxpY2F0aW9uc1xuLy8gZm9yIGEgZmV3IGh1bmRyZWRzIGl0ZW1zLCBxdWV1ZXMgbWFkZSBmcm9tIGFycmF5IHNob3VsZCBiZSBlbm91Z2hcbi8vKiAgIFBvdGVudGlhbCBUT0RPczpcbi8vICAgICogICAgIHByZXZlbnQgYW55IGZvcm0gb2YgcHJvYmxlbSBieSBjYWxsaW5nIGNhbGxiYWNrcyBpbiB0aGUgZXhwZWN0ZWQgb3JkZXIgIT9cbi8vKiAgICAgcHJldmVudGluZyBpbmZpbml0ZSBsb29wcyBleGVjdXRpb24gY2F1c2UgYnkgZXZlbnRzIT9cbi8vKlxuLy8qXG4vLyBUT0RPOiBkZXRlY3QgaW5maW5pdGUgbG9vcHMgKG9yIHZlcnkgZGVlcCBwcm9wYWdhdGlvbikgSXQgaXMgcG9zc2libGUhP1xuXG5jb25zdCBRdWV1ZSA9IHJlcXVpcmUoJy4vUXVldWUnKTtcblxuZnVuY3Rpb24gU291bmRQdWJTdWIoKXtcblxuXHQvKipcblx0ICogcHVibGlzaFxuXHQgKiAgICAgIFB1Ymxpc2ggYSBtZXNzYWdlIHtPYmplY3R9IHRvIGEgbGlzdCBvZiBzdWJzY3JpYmVycyBvbiBhIHNwZWNpZmljIHRvcGljXG5cdCAqXG5cdCAqIEBwYXJhbXMge1N0cmluZ3xOdW1iZXJ9IHRhcmdldCwgIHtPYmplY3R9IG1lc3NhZ2Vcblx0ICogQHJldHVybiBudW1iZXIgb2YgY2hhbm5lbCBzdWJzY3JpYmVycyB0aGF0IHdpbGwgYmUgbm90aWZpZWRcblx0ICovXG5cdHRoaXMucHVibGlzaCA9IGZ1bmN0aW9uKHRhcmdldCwgbWVzc2FnZSl7XG5cdFx0aWYoIWludmFsaWRDaGFubmVsTmFtZSh0YXJnZXQpICYmICFpbnZhbGlkTWVzc2FnZVR5cGUobWVzc2FnZSkgJiYgY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF0gIT0gdW5kZWZpbmVkKXtcblx0XHRcdGNvbXBhY3RBbmRTdG9yZSh0YXJnZXQsIG1lc3NhZ2UpO1xuXHRcdFx0ZGlzcGF0Y2hOZXh0KCk7XG5cdFx0XHRyZXR1cm4gY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF0ubGVuZ3RoO1xuXHRcdH0gZWxzZXtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogc3Vic2NyaWJlXG5cdCAqICAgICAgU3Vic2NyaWJlIC8gYWRkIGEge0Z1bmN0aW9ufSBjYWxsQmFjayBvbiBhIHtTdHJpbmd8TnVtYmVyfXRhcmdldCBjaGFubmVsIHN1YnNjcmliZXJzIGxpc3QgaW4gb3JkZXIgdG8gcmVjZWl2ZVxuXHQgKiAgICAgIG1lc3NhZ2VzIHB1Ymxpc2hlZCBpZiB0aGUgY29uZGl0aW9ucyBkZWZpbmVkIGJ5IHtGdW5jdGlvbn13YWl0Rm9yTW9yZSBhbmQge0Z1bmN0aW9ufWZpbHRlciBhcmUgcGFzc2VkLlxuXHQgKlxuXHQgKiBAcGFyYW1zIHtTdHJpbmd8TnVtYmVyfXRhcmdldCwge0Z1bmN0aW9ufWNhbGxCYWNrLCB7RnVuY3Rpb259d2FpdEZvck1vcmUsIHtGdW5jdGlvbn1maWx0ZXJcblx0ICpcblx0ICogICAgICAgICAgdGFyZ2V0ICAgICAgLSBjaGFubmVsIG5hbWUgdG8gc3Vic2NyaWJlXG5cdCAqICAgICAgICAgIGNhbGxiYWNrICAgIC0gZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gYSBtZXNzYWdlIHdhcyBwdWJsaXNoZWQgb24gdGhlIGNoYW5uZWxcblx0ICogICAgICAgICAgd2FpdEZvck1vcmUgLSBhIGludGVybWVkaWFyeSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgY2FsbGVkIGFmdGVyIGEgc3VjY2Vzc2Z1bHkgbWVzc2FnZSBkZWxpdmVyeSBpbiBvcmRlclxuXHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gZGVjaWRlIGlmIGEgbmV3IG1lc3NhZ2VzIGlzIGV4cGVjdGVkLi4uXG5cdCAqICAgICAgICAgIGZpbHRlciAgICAgIC0gYSBmdW5jdGlvbiB0aGF0IHJlY2VpdmVzIHRoZSBtZXNzYWdlIGJlZm9yZSBpbnZvY2F0aW9uIG9mIGNhbGxiYWNrIGZ1bmN0aW9uIGluIG9yZGVyIHRvIGFsbG93XG5cdCAqICAgICAgICAgICAgICAgICAgICAgICAgICByZWxldmFudCBtZXNzYWdlIGJlZm9yZSBlbnRlcmluZyBpbiBub3JtYWwgY2FsbGJhY2sgZmxvd1xuXHQgKiBAcmV0dXJuXG5cdCAqL1xuXHR0aGlzLnN1YnNjcmliZSA9IGZ1bmN0aW9uKHRhcmdldCwgY2FsbEJhY2ssIHdhaXRGb3JNb3JlLCBmaWx0ZXIpe1xuXHRcdGlmKCFpbnZhbGlkQ2hhbm5lbE5hbWUodGFyZ2V0KSAmJiAhaW52YWxpZEZ1bmN0aW9uKGNhbGxCYWNrKSl7XG5cblx0XHRcdHZhciBzdWJzY3JpYmVyID0ge1wiY2FsbEJhY2tcIjpjYWxsQmFjaywgXCJ3YWl0Rm9yTW9yZVwiOndhaXRGb3JNb3JlLCBcImZpbHRlclwiOmZpbHRlcn07XG5cdFx0XHR2YXIgYXJyID0gY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF07XG5cdFx0XHRpZihhcnIgPT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0YXJyID0gW107XG5cdFx0XHRcdGNoYW5uZWxTdWJzY3JpYmVyc1t0YXJnZXRdID0gYXJyO1xuXHRcdFx0fVxuXHRcdFx0YXJyLnB1c2goc3Vic2NyaWJlcik7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiB1bnN1YnNjcmliZVxuXHQgKiAgICAgIFVuc3Vic2NyaWJlL3JlbW92ZSB7RnVuY3Rpb259IGNhbGxCYWNrIGZyb20gdGhlIGxpc3Qgb2Ygc3Vic2NyaWJlcnMgb2YgdGhlIHtTdHJpbmd8TnVtYmVyfSB0YXJnZXQgY2hhbm5lbFxuXHQgKlxuXHQgKiBAcGFyYW1zIHtTdHJpbmd8TnVtYmVyfSB0YXJnZXQsIHtGdW5jdGlvbn0gY2FsbEJhY2ssIHtGdW5jdGlvbn0gZmlsdGVyXG5cdCAqXG5cdCAqICAgICAgICAgIHRhcmdldCAgICAgIC0gY2hhbm5lbCBuYW1lIHRvIHVuc3Vic2NyaWJlXG5cdCAqICAgICAgICAgIGNhbGxiYWNrICAgIC0gcmVmZXJlbmNlIG9mIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB0aGF0IHdhcyB1c2VkIGFzIHN1YnNjcmliZVxuXHQgKiAgICAgICAgICBmaWx0ZXIgICAgICAtIHJlZmVyZW5jZSBvZiB0aGUgb3JpZ2luYWwgZmlsdGVyIGZ1bmN0aW9uXG5cdCAqIEByZXR1cm5cblx0ICovXG5cdHRoaXMudW5zdWJzY3JpYmUgPSBmdW5jdGlvbih0YXJnZXQsIGNhbGxCYWNrLCBmaWx0ZXIpe1xuXHRcdGlmKCFpbnZhbGlkRnVuY3Rpb24oY2FsbEJhY2spKXtcblx0XHRcdHZhciBnb3RpdCA9IGZhbHNlO1xuXHRcdFx0aWYoY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF0pe1xuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF0ubGVuZ3RoO2krKyl7XG5cdFx0XHRcdFx0dmFyIHN1YnNjcmliZXIgPSAgY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF1baV07XG5cdFx0XHRcdFx0aWYoc3Vic2NyaWJlci5jYWxsQmFjayA9PT0gY2FsbEJhY2sgJiYgKGZpbHRlciA9PSB1bmRlZmluZWQgfHwgc3Vic2NyaWJlci5maWx0ZXIgPT09IGZpbHRlciApKXtcblx0XHRcdFx0XHRcdGdvdGl0ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdHN1YnNjcmliZXIuZm9yRGVsZXRlID0gdHJ1ZTtcblx0XHRcdFx0XHRcdHN1YnNjcmliZXIuY2FsbEJhY2sgPSBudWxsO1xuXHRcdFx0XHRcdFx0c3Vic2NyaWJlci5maWx0ZXIgPSBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYoIWdvdGl0KXtcblx0XHRcdFx0d3ByaW50KFwiVW5hYmxlIHRvIHVuc3Vic2NyaWJlIGEgY2FsbGJhY2sgdGhhdCB3YXMgbm90IHN1YnNjcmliZWQhXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogYmxvY2tDYWxsQmFja3Ncblx0ICpcblx0ICogQHBhcmFtc1xuXHQgKiBAcmV0dXJuXG5cdCAqL1xuXHR0aGlzLmJsb2NrQ2FsbEJhY2tzID0gZnVuY3Rpb24oKXtcblx0XHRsZXZlbCsrO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiByZWxlYXNlQ2FsbEJhY2tzXG5cdCAqXG5cdCAqIEBwYXJhbXNcblx0ICogQHJldHVyblxuXHQgKi9cblx0dGhpcy5yZWxlYXNlQ2FsbEJhY2tzID0gZnVuY3Rpb24oKXtcblx0XHRsZXZlbC0tO1xuXHRcdC8vaGFjay9vcHRpbWlzYXRpb24gdG8gbm90IGZpbGwgdGhlIHN0YWNrIGluIGV4dHJlbWUgY2FzZXMgKG1hbnkgZXZlbnRzIGNhdXNlZCBieSBsb29wcyBpbiBjb2xsZWN0aW9ucyxldGMpXG5cdFx0d2hpbGUobGV2ZWwgPT0gMCAmJiBkaXNwYXRjaE5leHQodHJ1ZSkpe1xuXHRcdFx0Ly9ub3RoaW5nXG5cdFx0fVxuXG5cdFx0d2hpbGUobGV2ZWwgPT0gMCAmJiBjYWxsQWZ0ZXJBbGxFdmVudHMoKSl7XG5cblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIGFmdGVyQWxsRXZlbnRzXG5cdCAqXG5cdCAqIEBwYXJhbXMge0Z1bmN0aW9ufSBjYWxsYmFja1xuXHQgKlxuXHQgKiAgICAgICAgICBjYWxsYmFjayAtIGZ1bmN0aW9uIHRoYXQgbmVlZHMgdG8gYmUgaW52b2tlZCBvbmNlIGFsbCBldmVudHMgYXJlIGRlbGl2ZXJlZFxuXHQgKiBAcmV0dXJuXG5cdCAqL1xuXHR0aGlzLmFmdGVyQWxsRXZlbnRzID0gZnVuY3Rpb24oY2FsbEJhY2spe1xuXHRcdGlmKCFpbnZhbGlkRnVuY3Rpb24oY2FsbEJhY2spKXtcblx0XHRcdGFmdGVyRXZlbnRzQ2FsbHMucHVzaChjYWxsQmFjayk7XG5cdFx0fVxuXHRcdHRoaXMuYmxvY2tDYWxsQmFja3MoKTtcblx0XHR0aGlzLnJlbGVhc2VDYWxsQmFja3MoKTtcblx0fTtcblxuXHQvKipcblx0ICogaGFzQ2hhbm5lbFxuXHQgKlxuXHQgKiBAcGFyYW1zIHtTdHJpbmd8TnVtYmVyfSBjaGFubmVsXG5cdCAqXG5cdCAqICAgICAgICAgIGNoYW5uZWwgLSBuYW1lIG9mIHRoZSBjaGFubmVsIHRoYXQgbmVlZCB0byBiZSB0ZXN0ZWQgaWYgcHJlc2VudFxuXHQgKiBAcmV0dXJuXG5cdCAqL1xuXHR0aGlzLmhhc0NoYW5uZWwgPSBmdW5jdGlvbihjaGFubmVsKXtcblx0XHRyZXR1cm4gIWludmFsaWRDaGFubmVsTmFtZShjaGFubmVsKSAmJiBjaGFubmVsU3Vic2NyaWJlcnNbY2hhbm5lbF0gIT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGZhbHNlO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBhZGRDaGFubmVsXG5cdCAqXG5cdCAqIEBwYXJhbXMge1N0cmluZ30gY2hhbm5lbFxuXHQgKlxuXHQgKiAgICAgICAgICBjaGFubmVsIC0gbmFtZSBvZiBhIGNoYW5uZWwgdGhhdCBuZWVkcyB0byBiZSBjcmVhdGVkIGFuZCBhZGRlZCB0byBzb3VuZHB1YnN1YiByZXBvc2l0b3J5XG5cdCAqIEByZXR1cm5cblx0ICovXG5cdHRoaXMuYWRkQ2hhbm5lbCA9IGZ1bmN0aW9uKGNoYW5uZWwpe1xuXHRcdGlmKCFpbnZhbGlkQ2hhbm5lbE5hbWUoY2hhbm5lbCkgJiYgIXRoaXMuaGFzQ2hhbm5lbChjaGFubmVsKSl7XG5cdFx0XHRjaGFubmVsU3Vic2NyaWJlcnNbY2hhbm5lbF0gPSBbXTtcblx0XHR9XG5cdH07XG5cblx0LyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBwcm90ZWN0ZWQgc3R1ZmYgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdC8vIG1hcCBjaGFubmVsTmFtZSAob2JqZWN0IGxvY2FsIGlkKSAtPiBhcnJheSB3aXRoIHN1YnNjcmliZXJzXG5cdHZhciBjaGFubmVsU3Vic2NyaWJlcnMgPSB7fTtcblxuXHQvLyBtYXAgY2hhbm5lbE5hbWUgKG9iamVjdCBsb2NhbCBpZCkgLT4gcXVldWUgd2l0aCB3YWl0aW5nIG1lc3NhZ2VzXG5cdHZhciBjaGFubmVsc1N0b3JhZ2UgPSB7fTtcblxuXHQvLyBvYmplY3Rcblx0dmFyIHR5cGVDb21wYWN0b3IgPSB7fTtcblxuXHQvLyBjaGFubmVsIG5hbWVzXG5cdHZhciBleGVjdXRpb25RdWV1ZSA9IG5ldyBRdWV1ZSgpO1xuXHR2YXIgbGV2ZWwgPSAwO1xuXG5cblxuXHQvKipcblx0ICogcmVnaXN0ZXJDb21wYWN0b3Jcblx0ICpcblx0ICogICAgICAgQW4gY29tcGFjdG9yIHRha2VzIGEgbmV3RXZlbnQgYW5kIGFuZCBvbGRFdmVudCBhbmQgcmV0dXJuIHRoZSBvbmUgdGhhdCBzdXJ2aXZlcyAob2xkRXZlbnQgaWZcblx0ICogIGl0IGNhbiBjb21wYWN0IHRoZSBuZXcgb25lIG9yIHRoZSBuZXdFdmVudCBpZiBjYW4ndCBiZSBjb21wYWN0ZWQpXG5cdCAqXG5cdCAqIEBwYXJhbXMge1N0cmluZ30gdHlwZSwge0Z1bmN0aW9ufSBjYWxsQmFja1xuXHQgKlxuXHQgKiAgICAgICAgICB0eXBlICAgICAgICAtIGNoYW5uZWwgbmFtZSB0byB1bnN1YnNjcmliZVxuXHQgKiAgICAgICAgICBjYWxsQmFjayAgICAtIGhhbmRsZXIgZnVuY3Rpb24gZm9yIHRoYXQgc3BlY2lmaWMgZXZlbnQgdHlwZVxuXHQgKiBAcmV0dXJuXG5cdCAqL1xuXHR0aGlzLnJlZ2lzdGVyQ29tcGFjdG9yID0gZnVuY3Rpb24odHlwZSwgY2FsbEJhY2spIHtcblx0XHRpZighaW52YWxpZEZ1bmN0aW9uKGNhbGxCYWNrKSl7XG5cdFx0XHR0eXBlQ29tcGFjdG9yW3R5cGVdID0gY2FsbEJhY2s7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBkaXNwYXRjaE5leHRcblx0ICpcblx0ICogQHBhcmFtIGZyb21SZWxlYXNlQ2FsbEJhY2tzOiBoYWNrIHRvIHByZXZlbnQgdG9vIG1hbnkgcmVjdXJzaXZlIGNhbGxzIG9uIHJlbGVhc2VDYWxsQmFja3Ncblx0ICogQHJldHVybiB7Qm9vbGVhbn1cblx0ICovXG5cdGZ1bmN0aW9uIGRpc3BhdGNoTmV4dChmcm9tUmVsZWFzZUNhbGxCYWNrcyl7XG5cdFx0aWYobGV2ZWwgPiAwKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGxldCBjaGFubmVsTmFtZSA9IGV4ZWN1dGlvblF1ZXVlLmZyb250KCk7XG5cdFx0aWYoY2hhbm5lbE5hbWUgIT0gdW5kZWZpbmVkKXtcblx0XHRcdHNlbGYuYmxvY2tDYWxsQmFja3MoKTtcblx0XHRcdHRyeXtcblx0XHRcdFx0bGV0IG1lc3NhZ2U7XG5cdFx0XHRcdGlmKCFjaGFubmVsc1N0b3JhZ2VbY2hhbm5lbE5hbWVdLmlzRW1wdHkoKSkge1xuXHRcdFx0XHRcdG1lc3NhZ2UgPSBjaGFubmVsc1N0b3JhZ2VbY2hhbm5lbE5hbWVdLmZyb250KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYobWVzc2FnZSA9PSB1bmRlZmluZWQpe1xuXHRcdFx0XHRcdGlmKCFjaGFubmVsc1N0b3JhZ2VbY2hhbm5lbE5hbWVdLmlzRW1wdHkoKSl7XG5cdFx0XHRcdFx0XHR3cHJpbnQoXCJDYW4ndCB1c2UgYXMgbWVzc2FnZSBpbiBhIHB1Yi9zdWIgY2hhbm5lbCB0aGlzIG9iamVjdDogXCIgKyBtZXNzYWdlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZXhlY3V0aW9uUXVldWUucG9wKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYobWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXggPT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0XHRcdG1lc3NhZ2UuX190cmFuc21pc2lvbkluZGV4ID0gMDtcblx0XHRcdFx0XHRcdGZvcih2YXIgaSA9IGNoYW5uZWxTdWJzY3JpYmVyc1tjaGFubmVsTmFtZV0ubGVuZ3RoLTE7IGkgPj0gMCA7IGktLSl7XG5cdFx0XHRcdFx0XHRcdHZhciBzdWJzY3JpYmVyID0gIGNoYW5uZWxTdWJzY3JpYmVyc1tjaGFubmVsTmFtZV1baV07XG5cdFx0XHRcdFx0XHRcdGlmKHN1YnNjcmliZXIuZm9yRGVsZXRlID09IHRydWUpe1xuXHRcdFx0XHRcdFx0XHRcdGNoYW5uZWxTdWJzY3JpYmVyc1tjaGFubmVsTmFtZV0uc3BsaWNlKGksMSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2V7XG5cdFx0XHRcdFx0XHRtZXNzYWdlLl9fdHJhbnNtaXNpb25JbmRleCsrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvL1RPRE86IGZvciBpbW11dGFibGUgb2JqZWN0cyBpdCB3aWxsIG5vdCB3b3JrIGFsc28sIGZpeCBmb3Igc2hhcGUgbW9kZWxzXG5cdFx0XHRcdFx0aWYobWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXggPT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0XHRcdHdwcmludChcIkNhbid0IHVzZSBhcyBtZXNzYWdlIGluIGEgcHViL3N1YiBjaGFubmVsIHRoaXMgb2JqZWN0OiBcIiArIG1lc3NhZ2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR2YXIgc3Vic2NyaWJlciA9IGNoYW5uZWxTdWJzY3JpYmVyc1tjaGFubmVsTmFtZV1bbWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXhdO1xuXHRcdFx0XHRcdGlmKHN1YnNjcmliZXIgPT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0XHRcdGRlbGV0ZSBtZXNzYWdlLl9fdHJhbnNtaXNpb25JbmRleDtcblx0XHRcdFx0XHRcdGNoYW5uZWxzU3RvcmFnZVtjaGFubmVsTmFtZV0ucG9wKCk7XG5cdFx0XHRcdFx0fSBlbHNle1xuXHRcdFx0XHRcdFx0aWYoc3Vic2NyaWJlci5maWx0ZXIgPT0gdW5kZWZpbmVkIHx8ICghaW52YWxpZEZ1bmN0aW9uKHN1YnNjcmliZXIuZmlsdGVyKSAmJiBzdWJzY3JpYmVyLmZpbHRlcihtZXNzYWdlKSkpe1xuXHRcdFx0XHRcdFx0XHRpZighc3Vic2NyaWJlci5mb3JEZWxldGUpe1xuXHRcdFx0XHRcdFx0XHRcdHN1YnNjcmliZXIuY2FsbEJhY2sobWVzc2FnZSk7XG5cdFx0XHRcdFx0XHRcdFx0aWYoc3Vic2NyaWJlci53YWl0Rm9yTW9yZSAmJiAhaW52YWxpZEZ1bmN0aW9uKHN1YnNjcmliZXIud2FpdEZvck1vcmUpICYmXG5cdFx0XHRcdFx0XHRcdFx0XHQhc3Vic2NyaWJlci53YWl0Rm9yTW9yZShtZXNzYWdlKSl7XG5cblx0XHRcdFx0XHRcdFx0XHRcdHN1YnNjcmliZXIuZm9yRGVsZXRlID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2goZXJyKXtcblx0XHRcdFx0d3ByaW50KFwiRXZlbnQgY2FsbGJhY2sgZmFpbGVkOiBcIisgc3Vic2NyaWJlci5jYWxsQmFjayArXCJlcnJvcjogXCIgKyBlcnIuc3RhY2spO1xuXHRcdFx0fVxuXHRcdFx0Ly9cblx0XHRcdGlmKGZyb21SZWxlYXNlQ2FsbEJhY2tzKXtcblx0XHRcdFx0bGV2ZWwtLTtcblx0XHRcdH0gZWxzZXtcblx0XHRcdFx0c2VsZi5yZWxlYXNlQ2FsbEJhY2tzKCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2V7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gY29tcGFjdEFuZFN0b3JlKHRhcmdldCwgbWVzc2FnZSl7XG5cdFx0dmFyIGdvdENvbXBhY3RlZCA9IGZhbHNlO1xuXHRcdHZhciBhcnIgPSBjaGFubmVsc1N0b3JhZ2VbdGFyZ2V0XTtcblx0XHRpZihhcnIgPT0gdW5kZWZpbmVkKXtcblx0XHRcdGFyciA9IG5ldyBRdWV1ZSgpO1xuXHRcdFx0Y2hhbm5lbHNTdG9yYWdlW3RhcmdldF0gPSBhcnI7XG5cdFx0fVxuXG5cdFx0aWYobWVzc2FnZSAmJiBtZXNzYWdlLnR5cGUgIT0gdW5kZWZpbmVkKXtcblx0XHRcdHZhciB0eXBlQ29tcGFjdG9yQ2FsbEJhY2sgPSB0eXBlQ29tcGFjdG9yW21lc3NhZ2UudHlwZV07XG5cblx0XHRcdGlmKHR5cGVDb21wYWN0b3JDYWxsQmFjayAhPSB1bmRlZmluZWQpe1xuXHRcdFx0XHRmb3IobGV0IGNoYW5uZWwgb2YgYXJyKSB7XG5cdFx0XHRcdFx0aWYodHlwZUNvbXBhY3RvckNhbGxCYWNrKG1lc3NhZ2UsIGNoYW5uZWwpID09PSBjaGFubmVsKSB7XG5cdFx0XHRcdFx0XHRpZihjaGFubmVsLl9fdHJhbnNtaXNpb25JbmRleCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdGdvdENvbXBhY3RlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKCFnb3RDb21wYWN0ZWQgJiYgbWVzc2FnZSl7XG5cdFx0XHRhcnIucHVzaChtZXNzYWdlKTtcblx0XHRcdGV4ZWN1dGlvblF1ZXVlLnB1c2godGFyZ2V0KTtcblx0XHR9XG5cdH1cblxuXHR2YXIgYWZ0ZXJFdmVudHNDYWxscyA9IG5ldyBRdWV1ZSgpO1xuXHRmdW5jdGlvbiBjYWxsQWZ0ZXJBbGxFdmVudHMgKCl7XG5cdFx0aWYoIWFmdGVyRXZlbnRzQ2FsbHMuaXNFbXB0eSgpKXtcblx0XHRcdHZhciBjYWxsQmFjayA9IGFmdGVyRXZlbnRzQ2FsbHMucG9wKCk7XG5cdFx0XHQvL2RvIG5vdCBjYXRjaCBleGNlcHRpb25zIGhlcmUuLlxuXHRcdFx0Y2FsbEJhY2soKTtcblx0XHR9XG5cdFx0cmV0dXJuICFhZnRlckV2ZW50c0NhbGxzLmlzRW1wdHkoKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGludmFsaWRDaGFubmVsTmFtZShuYW1lKXtcblx0XHR2YXIgcmVzdWx0ID0gZmFsc2U7XG5cdFx0aWYoIW5hbWUgfHwgKHR5cGVvZiBuYW1lICE9IFwic3RyaW5nXCIgJiYgdHlwZW9mIG5hbWUgIT0gXCJudW1iZXJcIikpe1xuXHRcdFx0cmVzdWx0ID0gdHJ1ZTtcblx0XHRcdHdwcmludChcIkludmFsaWQgY2hhbm5lbCBuYW1lOiBcIiArIG5hbWUpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRmdW5jdGlvbiBpbnZhbGlkTWVzc2FnZVR5cGUobWVzc2FnZSl7XG5cdFx0dmFyIHJlc3VsdCA9IGZhbHNlO1xuXHRcdGlmKCFtZXNzYWdlIHx8IHR5cGVvZiBtZXNzYWdlICE9IFwib2JqZWN0XCIpe1xuXHRcdFx0cmVzdWx0ID0gdHJ1ZTtcblx0XHRcdHdwcmludChcIkludmFsaWQgbWVzc2FnZXMgdHlwZXM6IFwiICsgbWVzc2FnZSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRmdW5jdGlvbiBpbnZhbGlkRnVuY3Rpb24oY2FsbGJhY2spe1xuXHRcdHZhciByZXN1bHQgPSBmYWxzZTtcblx0XHRpZighY2FsbGJhY2sgfHwgdHlwZW9mIGNhbGxiYWNrICE9IFwiZnVuY3Rpb25cIil7XG5cdFx0XHRyZXN1bHQgPSB0cnVlO1xuXHRcdFx0d3ByaW50KFwiRXhwZWN0ZWQgdG8gYmUgZnVuY3Rpb24gYnV0IGlzOiBcIiArIGNhbGxiYWNrKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxufVxuXG5leHBvcnRzLnNvdW5kUHViU3ViID0gbmV3IFNvdW5kUHViU3ViKCk7IiwiLyogd2h5IEZ1bmN0aW9uIHByb3RvdHlwZSBpbXBsZW1lbnRhdGlvbiovXG5cblxudmFyIGxvZ2dlciA9IHJlcXVpcmUoJ2RvdWJsZS1jaGVjaycpLmxvZ2dlcjtcblxubG9nZ2VyLmFkZENhc2UoXCJkdW1wV2h5c1wiLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiBleHBvcnRzLmdldEFsbENvbnRleHRzKCk7XG4gICAgXG59KTtcblxuZnVuY3Rpb24gbmV3VHJhY2tpbmdJdGVtKG1vdGl2YXRpb24sY2FsbGVyKXtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdGVwOm1vdGl2YXRpb24sXG4gICAgICAgIHBhcmVudDpjYWxsZXIsXG4gICAgICAgIGNoaWxkcmVuOltdLFxuICAgICAgICBpZDpjYWxsZXIuY29udGV4dC5nZXROZXdJZCgpLFxuICAgICAgICBjb250ZXh0OmNhbGxlci5jb250ZXh0LFxuICAgICAgICBpbmRleEluUGFyZW50Q2hpbGRyZW46Y2FsbGVyLmhhc093blByb3BlcnR5KCdjaGlsZHJlbicpP2NhbGxlci5jaGlsZHJlbi5sZW5ndGg6MFxuICAgIH07XG59XG5cbnZhciBjb250ZXh0cyA9IFtdO1xuXG52YXIgZ2xvYmFsQ3VycmVudENvbnRleHQgPSBudWxsO1xuXG5leHBvcnRzLmdldEdsb2JhbEN1cnJlbnRDb250ZXh0ID0gZnVuY3Rpb24oKXtcbiAgICBpZihwcm9jZXNzLmVudlsnUlVOX1dJVEhfV0hZUyddKSB7XG4gICAgICAgIHJldHVybiBnbG9iYWxDdXJyZW50Q29udGV4dDtcbiAgICB9XG4gICAgZWxzZXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXaHkgaXMgbm90IGFjdGl2YXRlZFxcbllvdSBtdXN0IHNldCBlbnYgdmFyaWFibGUgUlVOX1dJVEhfV0hZUyB0byB0cnVlIHRvIGJlIGFibGUgdG8gdXNlIHdoeXMnKVxuICAgIH1cbn1cblxuZXhwb3J0cy5nZXRBbGxDb250ZXh0cyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGNvbnRleHRzO1xufVxuXG5cbmZ1bmN0aW9uIG9uVGVybWluYXRpb24oKXtcbiAgICBpZihwcm9jZXNzLmVudlsnUlVOX1dJVEhfV0hZUyddKSB7XG4gICAgICAgIHZhciBwcm9jZXNzX3N1bW1hcnkgPSBleHBvcnRzLmdldEFsbENvbnRleHRzKCkubWFwKGZ1bmN0aW9uKGNvbnRleHQpIHtyZXR1cm4gY29udGV4dC5nZXRFeGVjdXRpb25TdW1tYXJ5KCl9KVxuXG4gICAgICAgIGlmKHByb2Nlc3Muc2VuZCl7XG4gICAgICAgICAgICBsaW5rV2l0aFBhcmVudFByb2Nlc3MoKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBsb2dnZXIuZHVtcFdoeXMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBsaW5rV2l0aFBhcmVudFByb2Nlc3MoKXtcbiAgICAgICAgcHJvY2Vzcy5zZW5kKHtcIndoeUxvZ3NcIjpwcm9jZXNzX3N1bW1hcnl9KVxuICAgIH1cbn1cblxucHJvY2Vzcy5vbignZXhpdCcsIG9uVGVybWluYXRpb24pO1xuXG5cbmZ1bmN0aW9uIFRyYWNraW5nQ29udGV4dCgpe1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgbGFzdElkID0gMDtcbiAgICB0aGlzLmdldEV4ZWN1dGlvblN1bW1hcnkgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgc3VtbWFyeSA9IHt9XG4gICAgICAgIHNlbGYuc3RhcnRpbmdQb2ludC5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKXtcbiAgICAgICAgICAgIHN1bW1hcnlbY2hpbGQuc3RlcF0gPSBnZXROb2RlU3VtbWFyeShjaGlsZCk7XG4gICAgICAgIH0pXG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0Tm9kZVN1bW1hcnkobm9kZSl7XG4gICAgICAgICAgICBpZihub2RlWydzdW1tYXJ5J10pe1xuICAgICAgICAgICAgICAgIC8vdGhpcyBub2RlIGlzIGFscmVhZHkgYSBzdW1tYXJpemVkICggaXQgd2FzIGV4ZWN1dGVkIGluIGFub3RoZXIgcHJvY2VzcylcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVsnc3VtbWFyeSddO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHN1bW1hcnkgPSB7fTtcbiAgICAgICAgICAgIHN1bW1hcnkuYXJncyA9IG5vZGUuYXJncztcbiAgICAgICAgICAgIHN1bW1hcnkuc3RhY2sgPSBub2RlLnN0YWNrO1xuICAgICAgICAgICAgaWYobm9kZS5leGNlcHRpb24pe1xuICAgICAgICAgICAgICAgIHN1bW1hcnkuZXhjZXB0aW9uID0gbm9kZS5leGNlcHRpb247XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBpZihub2RlLmNoaWxkcmVuLmxlbmd0aD4wKXtcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyeS5jYWxscyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VtbWFyeS5jYWxsc1tjaGlsZC5zdGVwXSA9IGdldE5vZGVTdW1tYXJ5KGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3VtbWFyeTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VtbWFyeTtcbiAgICB9XG4gICAgdGhpcy5nZXROZXdJZCA9IGZ1bmN0aW9uKCl7cmV0dXJuIGxhc3RJZCsrfVxuICAgIHRoaXMuY3VycmVudFJ1bm5pbmdJdGVtID0gbmV3VHJhY2tpbmdJdGVtKFwiQ29udGV4dCBzdGFydGVyXCIse2NvbnRleHQ6c2VsZn0pO1xuICAgIHRoaXMuc3RhcnRpbmdQb2ludCA9IHRoaXMuY3VycmVudFJ1bm5pbmdJdGVtO1xuICAgIGNvbnRleHRzLnB1c2godGhpcyk7XG59XG5cbnZhciBnbG9iYWxXaHlTdGFja0xldmVsID0gMDtcblxuRnVuY3Rpb24ucHJvdG90eXBlLndoeSA9IGZ1bmN0aW9uKG1vdGl2YXRpb24sIGNhbGxlcixvdGhlckNvbnRleHRJbmZvLCBleHRlcm5hbEJpbmRlcil7XG4gICAgaWYoIXByb2Nlc3MuZW52W1wiUlVOX1dJVEhfV0hZU1wiXSl7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIG5ld0NvbnRleHQgPSBmYWxzZTtcbiAgICB2YXIgdGhpc0l0ZW07XG4gICAgbGlua1RvQ29udGV4dCgpO1xuXG5cbiAgICB2YXIgd2h5RnVuYyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHVwZGF0ZUNvbnRleHQodGhpc0l0ZW0pO1xuICAgICAgICBhZGRBcmdzKGFyZ3VtZW50cyx0aGlzSXRlbSk7XG4gICAgICAgIGF0dGF0Y2hTdGFja0luZm9Ub0l0ZW1XSFkodGhpc0l0ZW0sbmV3Q29udGV4dCxnbG9iYWxXaHlTdGFja0xldmVsKTtcbiAgICAgICAgcmVzb2x2ZUVtYmVkZGluZ0xldmVsKHRoaXNJdGVtKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGV4ZWN1dGVXSFlGdW5jdGlvbihzZWxmLHRoaXNJdGVtLGFyZ3VtZW50cyk7XG4gICAgICAgIC8vbWF5YmVMb2coZ2xvYmFsQ3VycmVudENvbnRleHQpO1xuICAgICAgICByZXR1cm5Gcm9tQ2FsbCh0aGlzSXRlbSk7XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG5cbiAgICByZXR1cm4gd2h5RnVuYztcblxuICAgIGZ1bmN0aW9uIGxpbmtUb0NvbnRleHQoKXtcbiAgICAgICAgaWYoIWNhbGxlcil7XG4gICAgICAgICAgICBpZiAoZ2xvYmFsV2h5U3RhY2tMZXZlbCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGdsb2JhbEN1cnJlbnRDb250ZXh0ID0gbmV3IFRyYWNraW5nQ29udGV4dCgpO1xuICAgICAgICAgICAgICAgIG5ld0NvbnRleHQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpc0l0ZW0gPSBuZXdUcmFja2luZ0l0ZW0obW90aXZhdGlvbiwgZ2xvYmFsQ3VycmVudENvbnRleHQuY3VycmVudFJ1bm5pbmdJdGVtKTtcbiAgICAgICAgICAgIGdsb2JhbEN1cnJlbnRDb250ZXh0LmN1cnJlbnRSdW5uaW5nSXRlbS5jaGlsZHJlbi5wdXNoKHRoaXNJdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgdGhpc0l0ZW0gPSBuZXdUcmFja2luZ0l0ZW0obW90aXZhdGlvbixjYWxsZXIpO1xuICAgICAgICAgICAgY2FsbGVyLmNoaWxkcmVuLnB1c2godGhpc0l0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXR0YXRjaFN0YWNrSW5mb1RvSXRlbVdIWShpdGVtLG5ld0NvbnRleHQsZ2xvYmFsV2h0U3RhY2tMZXZlbCkge1xuICAgICAgICB2YXIgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjay5zcGxpdChcIlxcblwiKTtcblxuICAgICAgICBzdGFjay5zaGlmdCgpO1xuXG4gICAgICAgIHN0YWNrID0gZHJvcExpbmVzTWF0Y2hpbmcoc3RhY2ssIFtcIldIWVwiXSk7XG5cbiAgICAgICAgaXRlbS53aHlFbWJlZGRpbmdMZXZlbCA9IGdldFdoeUVtYmVkZGluZ0xldmVsKHN0YWNrKTtcbiAgICAgICAgaXRlbS5zdGFjayA9IGdldFJlbGV2YW50U3RhY2soaXRlbSwgc3RhY2spO1xuICAgICAgICBpdGVtLmlzQ2FsbGJhY2sgPSAoZ2xvYmFsV2h5U3RhY2tMZXZlbCA9PT0gaXRlbS53aHlFbWJlZGRpbmdMZXZlbCAtIDEpICYmICghbmV3Q29udGV4dCk7XG5cblxuICAgICAgICBmdW5jdGlvbiBnZXRXaHlFbWJlZGRpbmdMZXZlbChzdGFjaykge1xuICAgICAgICAgICAgdmFyIHdoeUVtYmVkZGluZ0xldmVsID0gMDtcbiAgICAgICAgICAgIHN0YWNrLnNvbWUoZnVuY3Rpb24gKHN0YWNrTGluZSkge1xuICAgICAgICAgICAgICAgIGlmIChzdGFja0xpbmUubWF0Y2goXCJ3aHlGdW5jXCIpICE9PSBudWxsIHx8IHN0YWNrTGluZS5tYXRjaChcImF0IHdoeUZ1bmNcIikgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgd2h5RW1iZWRkaW5nTGV2ZWwrKztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByZXR1cm4gd2h5RW1iZWRkaW5nTGV2ZWw7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRSZWxldmFudFN0YWNrKHRyYWNraW5nSXRlbSwgc3RhY2spIHtcbiAgICAgICAgICAgIGlmICh0cmFja2luZ0l0ZW0uaXNDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHN0YWNrID0gW107XG4gICAgICAgICAgICAgICAgc3RhY2sucHVzaCh0cmFja2luZ0l0ZW0ucGFyZW50LnN0YWNrWzBdKTtcbiAgICAgICAgICAgICAgICBzdGFjay5wdXNoKFwiICAgICAgIEFmdGVyIGNhbGxiYWNrXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGFjaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghdHJhY2tpbmdJdGVtLnBhcmVudC5oYXNPd25Qcm9wZXJ0eShcInN0YWNrXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkcm9wV2h5c0Zyb21TdGFjayhzdGFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBrZWVwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB2YXIgZmlyc3RSZWR1bmRhbnRTdGFja0xpbmUgPSB0cmFja2luZ0l0ZW0ucGFyZW50LnN0YWNrWzBdO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRyb3BXaHlzRnJvbVN0YWNrKHN0YWNrLmZpbHRlcihmdW5jdGlvbiAoc3RhY2tMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGFja0xpbmUgPT09IGZpcnN0UmVkdW5kYW50U3RhY2tMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZWVwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtlZXA7XG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBkcm9wV2h5c0Zyb21TdGFjayhzdGFjaykge1xuICAgICAgICAgICAgICAgIHZhciB3aHlNYXRjaGVzID0gW1wid2h5RnVuY1wiXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZHJvcExpbmVzTWF0Y2hpbmcoc3RhY2ssIHdoeU1hdGNoZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZHJvcExpbmVzTWF0Y2hpbmcoc3RhY2ssIGxpbmVNYXRjaGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RhY2suZmlsdGVyKGZ1bmN0aW9uIChzdGFja0xpbmUpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmV0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBsaW5lTWF0Y2hlcy5mb3JFYWNoKGZ1bmN0aW9uIChsaW5lTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YWNrTGluZS5tYXRjaChsaW5lTWF0Y2gpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZUVtYmVkZGluZ0xldmVsKGl0ZW0pe1xuICAgICAgICBpZihpdGVtLndoeUVtYmVkZGluZ0xldmVsPjEpIHtcbiAgICAgICAgICAgIGl0ZW0uc3RlcCArPSBcIiBBTkQgXCIgKyBpdGVtLnBhcmVudC5jaGlsZHJlbi5zcGxpY2UoaXRlbS5pbmRleEluUGFyZW50Q2hpbGRyZW4gKzEsIDEpWzBdLnN0ZXA7XG4gICAgICAgICAgICBpdGVtLnBhcmVudC5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkcmVuKXtcbiAgICAgICAgICAgICAgICBpZihjaGlsZHJlbi5pbmRleEluUGFyZW50Q2hpbGRyZW4+aXRlbS5pbmRleEluUGFyZW50Q2hpbGRyZW4pe1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5pbmRleEluUGFyZW50Q2hpbGRyZW4tLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkQXJncyhhcmdzLGl0ZW0pe1xuICAgICAgICB2YXIgYSA9IFtdO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBpZih0eXBlb2YgYXJnc1tpXSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgICAgICAgICBhLnB1c2goXCJmdW5jdGlvblwiKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIGEucHVzaChKU09OLnN0cmluZ2lmeShhcmdzW2ldKSk7XG4gICAgICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgYS5wdXNoKFwiVW5zZXJpYWxpemFibGUgYXJndW1lbnQgb2YgdHlwZSBcIit0eXBlb2YgYXJnc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaXRlbS5hcmdzID0gYTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVDb250ZXh0KGl0ZW0pe1xuICAgICAgICBnbG9iYWxDdXJyZW50Q29udGV4dCA9IGl0ZW0uY29udGV4dDtcbiAgICAgICAgZ2xvYmFsQ3VycmVudENvbnRleHQuY3VycmVudFJ1bm5pbmdJdGVtID0gaXRlbTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleGVjdXRlV0hZRnVuY3Rpb24oZnVuYyxpdGVtLGFyZ3MpIHtcbiAgICAgICAgdmFyIHByZXZpb3VzR2xvYmFsV2h5U3RhY2tMZXZlbCA9IGdsb2JhbFdoeVN0YWNrTGV2ZWw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBnbG9iYWxXaHlTdGFja0xldmVsKys7XG4gICAgICAgICAgICBpdGVtLnJlc3VsdCA9IGZ1bmMuYXBwbHkoZnVuYywgYXJncyk7XG4gICAgICAgICAgICBpdGVtLmRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgZ2xvYmFsV2h5U3RhY2tMZXZlbC0tO1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0ucmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgIGdsb2JhbFdoeVN0YWNrTGV2ZWwgPSBwcmV2aW91c0dsb2JhbFdoeVN0YWNrTGV2ZWw7XG4gICAgICAgICAgICBpZihleGNlcHRpb24ubG9nZ2VkIT09dHJ1ZSl7XG4gICAgICAgICAgICAgICAgdmFyIGVycm9yID0ge1xuICAgICAgICAgICAgICAgICAgICAnZXhjZXB0aW9uJzpleGNlcHRpb24sXG4gICAgICAgICAgICAgICAgICAgICdsb2dnZWQnOnRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaXRlbVsnZXhjZXB0aW9uJ10gPSBlcnJvcjtcbiAgICAgICAgICAgICAgICBpdGVtLmRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGdsb2JhbEN1cnJlbnRDb250ZXh0LmN1cnJlbnRSdW5uaW5nSXRlbSA9IGl0ZW0ucGFyZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW0ucmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJldHVybkZyb21DYWxsKGl0ZW0pe1xuICAgICAgICBnbG9iYWxDdXJyZW50Q29udGV4dC5jdXJyZW50UnVubmluZ0l0ZW0gPSBpdGVtLnBhcmVudDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXliZUxvZyhjb250ZXh0KXtcbiAgICAgICAgaWYoZ2xvYmFsV2h5U3RhY2tMZXZlbCA9PT0gMCl7XG4gICAgICAgICAgICBsb2dnZXIubG9nV2h5KGNvbnRleHQuZ2V0RXhlY3V0aW9uU3VtbWFyeSgpKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblxuLypcbiAgICBXaGVuIGxhdW5jaGluZyBjaGlsZCBwcm9jZXNzZXMgdGhhdCBydW4gd2l0aCBXSFlTIHlvdSBtaWdodCB3YW50IHRvIGdldCB0aG9zZSBsb2dzIGFuZCBpbnRlZ3JhdGUgaW5cbiAgICB0aGUgY29udGV4dCBvZiB0aGUgcGFyZW50IHByb2Nlc3NcbiAqL1xuZXhwb3J0cy5saW5rV2h5Q29udGV4dCA9IGZ1bmN0aW9uKGNoaWxkUHJvY2VzcyxzdGVwTmFtZSl7XG4gICAgdmFyIG9uTWVzc2FnZSA9IHVuZGVmaW5lZDtcbiAgICBpZighY2hpbGRQcm9jZXNzLl9ldmVudHNbJ21lc3NhZ2UnXSl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ2FsbGJhY2tzIGZvciAnbWVzc2FnZScgZXZlbnQgbXVzdCBiZSByZWdpc3RlcmVkIGJlZm9yZSBsaW5raW5nIHdpdGggdGhlIHdoeSBjb250ZXh0IVwiKVxuICAgIH1lbHNle1xuICAgICAgICBvbk1lc3NhZ2UgPSBjaGlsZFByb2Nlc3MuZXZlbnRzWydtZXNzYWdlJ11cbiAgICB9XG5cbiAgICBcbiAgICB2YXIgY2FsbGluZ1BvaW50ID0gZXhwb3J0cy5nZXRHbG9iYWxDdXJyZW50Q29udGV4dCgpLmN1cnJlbnRSdW5uaW5nSXRlbTtcbiAgICBjaGlsZFByb2Nlc3Mub24oJ21lc3NhZ2UnLGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICBpZihvbk1lc3NhZ2UpIHtcbiAgICAgICAgICAgIG9uTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYobWVzc2FnZVsnd2h5TG9ncyddKXtcbiAgICAgICAgICAgIG1lc3NhZ2VbJ3doeUxvZ3MnXS5mb3JFYWNoKGZ1bmN0aW9uKGNvbnRleHRTdW1tYXkpIHtcbiAgICAgICAgICAgICAgICBjYWxsaW5nUG9pbnQuY2hpbGRyZW4ucHVzaCh7XCJzdGVwXCI6c3RlcE5hbWUsJ3N1bW1hcnknOmNvbnRleHRTdW1tYXl9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0pXG59XG4iXX0=
