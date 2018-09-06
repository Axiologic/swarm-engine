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
;$$.__runtimeModules["assert"] = require("assert");
$$.__runtimeModules["crypto"] = require("crypto");
$$.__runtimeModules["zlib"] = require("zlib");

},{"assert":undefined,"crypto":undefined,"zlib":undefined}],4:[function(require,module,exports){
;$$.__runtimeModules["soundpubsub"] = require("soundpubsub");
$$.__runtimeModules["callflow"] = require("callflow");
$$.__runtimeModules["dicontainer"] = require("dicontainer");
$$.__runtimeModules["double-check"] = require("double-check");
$$.__runtimeModules["pskcrypto"] = require("pskcrypto");
$$.__runtimeModules["signsensus"] = require("signsensus");

},{"callflow":6,"dicontainer":17,"double-check":18,"pskcrypto":25,"signsensus":48,"soundpubsub":49}],5:[function(require,module,exports){
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
}

console.log("WTF!!!");
require("./pskModules");



},{"./nodeShims":3,"./pskModules":4}],6:[function(require,module,exports){

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
},{"./lib/choreographies/swarmInstancesManager":8,"./lib/choreographies/utilityFunctions/swarm":11,"./lib/loadLibrary":12,"./lib/parallelJoinPoint":13,"./lib/safe-uuid":14,"./lib/serialJoinPoint":15,"./lib/swarmDescription":16}],7:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){

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


},{"whys":54}],23:[function(require,module,exports){
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

},{}],49:[function(require,module,exports){
module.exports = {
					beesHealer: require("./lib/beesHealer"),
					soundPubSub: require("./lib/soundPubSub").soundPubSub,
					folderMQ: require("./lib/folderMQ")
};
},{"./lib/beesHealer":51,"./lib/folderMQ":52,"./lib/soundPubSub":53}],50:[function(require,module,exports){
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
},{}],51:[function(require,module,exports){

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
},{}],52:[function(require,module,exports){

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
},{"./beesHealer":51,"fs":undefined,"path":undefined}],53:[function(require,module,exports){
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
},{"./Queue":50}],54:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9lbmdpbmUvY29yZS5qcyIsIi4uL2VuZ2luZS9mYWtlcy9kdW1teVZNLmpzIiwiLi4vZW5naW5lL3Bza2J1aWxkdGVtcC9ub2RlU2hpbXMuanMiLCIuLi9lbmdpbmUvcHNrYnVpbGR0ZW1wL3Bza01vZHVsZXMuanMiLCIuLi9lbmdpbmUvcHNrYnVpbGR0ZW1wL3Bza3J1bnRpbWUuanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2luZGV4LmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvU3dhcm1EZWJ1Zy5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL2Nob3Jlb2dyYXBoaWVzL3N3YXJtSW5zdGFuY2VzTWFuYWdlci5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvYmFzZS5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvY2FsbGZsb3cuanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9jaG9yZW9ncmFwaGllcy91dGlsaXR5RnVuY3Rpb25zL3N3YXJtLmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvbG9hZExpYnJhcnkuanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9wYXJhbGxlbEpvaW5Qb2ludC5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL3NhZmUtdXVpZC5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL3NlcmlhbEpvaW5Qb2ludC5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL3N3YXJtRGVzY3JpcHRpb24uanMiLCIuLi9tb2R1bGVzL2RpY29udGFpbmVyL2xpYi9jb250YWluZXIuanMiLCIuLi9tb2R1bGVzL2RvdWJsZS1jaGVjay9saWIvY2hlY2tzQ29yZS5qcyIsIi4uL21vZHVsZXMvZG91YmxlLWNoZWNrL2xpYi9zdGFuZGFyZEFzc2VydHMuanMiLCIuLi9tb2R1bGVzL2RvdWJsZS1jaGVjay9saWIvc3RhbmRhcmRDaGVja3MuanMiLCIuLi9tb2R1bGVzL2RvdWJsZS1jaGVjay9saWIvc3RhbmRhcmRFeGNlcHRpb25zLmpzIiwiLi4vbW9kdWxlcy9kb3VibGUtY2hlY2svbGliL3N0YW5kYXJkTG9ncy5qcyIsIi4uL21vZHVsZXMvZG91YmxlLWNoZWNrL2xpYi90ZXN0UnVubmVyLmpzIiwiLi4vbW9kdWxlcy9kb3VibGUtY2hlY2svbGliL3V0aWxzL2dsb2ItdG8tcmVnZXhwLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vaW5kZXguanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvRUNEU0EuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvUHNrQ3J5cHRvLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvYXBpLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvYXNuMS5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2Jhc2UvYnVmZmVyLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvYmFzZS9pbmRleC5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2Jhc2Uvbm9kZS5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2Jhc2UvcmVwb3J0ZXIuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9iaWdudW0vYm4uanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9jb25zdGFudHMvZGVyLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvY29uc3RhbnRzL2luZGV4LmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvZGVjb2RlcnMvZGVyLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvZGVjb2RlcnMvaW5kZXguanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9kZWNvZGVycy9wZW0uanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9lbmNvZGVycy9kZXIuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9lbmNvZGVycy9pbmRleC5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2VuY29kZXJzL3BlbS5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9rZXlFbmNvZGVyLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL3Bzay1hcmNoaXZlci5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi91dGlscy9jcnlwdG9VdGlscy5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi91dGlscy9pc1N0cmVhbS5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL3NpZ25zZW5zdXNEUy9zc3V0aWwuanMiLCIuLi9tb2R1bGVzL3NpZ25zZW5zdXMvbGliL2luZGV4LmpzIiwiLi4vbW9kdWxlcy9zb3VuZHB1YnN1Yi9pbmRleC5qcyIsIi4uL21vZHVsZXMvc291bmRwdWJzdWIvbGliL1F1ZXVlLmpzIiwiLi4vbW9kdWxlcy9zb3VuZHB1YnN1Yi9saWIvYmVlc0hlYWxlci5qcyIsIi4uL21vZHVsZXMvc291bmRwdWJzdWIvbGliL2ZvbGRlck1RLmpzIiwiLi4vbW9kdWxlcy9zb3VuZHB1YnN1Yi9saWIvc291bmRQdWJTdWIuanMiLCIuLi9tb2R1bGVzL3doeXMvbGliL3doeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5d0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE1BOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKlxuIEluaXRpYWwgTGljZW5zZTogKGMpIEF4aW9sb2dpYyBSZXNlYXJjaCAmIEFsYm9haWUgU8OubmljxIMuXG4gQ29udHJpYnV0b3JzOiBBeGlvbG9naWMgUmVzZWFyY2ggLCBQcml2YXRlU2t5IHByb2plY3RcbiBDb2RlIExpY2Vuc2U6IExHUEwgb3IgTUlULlxuICovXG5cblxudmFyIGNhbGxmbG93TW9kdWxlID0gcmVxdWlyZShcIi4vLi4vbW9kdWxlcy9jYWxsZmxvd1wiKTtcblxuXG5cbmV4cG9ydHMuZW5hYmxlVGVzdGluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJlcXVpcmUoXCIuL2Zha2VzL2R1bW15Vk1cIik7XG59XG5cbnZhciBjb3JlID0gJCQucmVxdWlyZUxpYnJhcnkoXCJjb3JlXCIpO1xuXG5cbi8vVE9ETzogU0hPVUxEIGJlIG1vdmVkIGluICQkLl9fZ2xvYmFsc1xuJCQuZW5zdXJlRm9sZGVyRXhpc3RzID0gZnVuY3Rpb24oZm9sZGVyLCBjYWxsYmFjayl7XG5cbiAgICB2YXIgZmxvdyA9ICQkLmZsb3cuc3RhcnQoY29yZS5ta0RpclJlYyk7XG4gICAgZmxvdy5tYWtlKGZvbGRlciwgY2FsbGJhY2spO1xufTtcblxuJCQuZW5zdXJlTGlua0V4aXN0cyA9IGZ1bmN0aW9uKGV4aXN0aW5nUGF0aCwgbmV3UGF0aCwgY2FsbGJhY2spe1xuXG4gICAgdmFyIGZsb3cgPSAkJC5mbG93LnN0YXJ0KGNvcmUubWtEaXJSZWMpO1xuICAgIGZsb3cubWFrZUxpbmsoZXhpc3RpbmdQYXRoLCBuZXdQYXRoLCBjYWxsYmFjayk7XG59OyIsImZ1bmN0aW9uIGR1bW15Vk0obmFtZSl7XG5cdGZ1bmN0aW9uIHNvbHZlU3dhcm0oc3dhcm0pe1xuXHRcdCQkLnN3YXJtc0luc3RhbmNlc01hbmFnZXIucmV2aXZlX3N3YXJtKHN3YXJtKTtcblx0fVxuXG5cdCQkLlBTS19QdWJTdWIuc3Vic2NyaWJlKG5hbWUsIHNvbHZlU3dhcm0pO1xuXHRjb25zb2xlLmxvZyhcIkNyZWF0aW5nIGEgZmFrZSBleGVjdXRpb24gY29udGV4dC4uLlwiKTtcbn1cblxuZ2xvYmFsLnZtID0gZHVtbXlWTSgkJC5DT05TVEFOVFMuU1dBUk1fRk9SX0VYRUNVVElPTik7IiwiOyQkLl9fcnVudGltZU1vZHVsZXNbXCJhc3NlcnRcIl0gPSByZXF1aXJlKFwiYXNzZXJ0XCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcImNyeXB0b1wiXSA9IHJlcXVpcmUoXCJjcnlwdG9cIik7XG4kJC5fX3J1bnRpbWVNb2R1bGVzW1wiemxpYlwiXSA9IHJlcXVpcmUoXCJ6bGliXCIpO1xuIiwiOyQkLl9fcnVudGltZU1vZHVsZXNbXCJzb3VuZHB1YnN1YlwiXSA9IHJlcXVpcmUoXCJzb3VuZHB1YnN1YlwiKTtcbiQkLl9fcnVudGltZU1vZHVsZXNbXCJjYWxsZmxvd1wiXSA9IHJlcXVpcmUoXCJjYWxsZmxvd1wiKTtcbiQkLl9fcnVudGltZU1vZHVsZXNbXCJkaWNvbnRhaW5lclwiXSA9IHJlcXVpcmUoXCJkaWNvbnRhaW5lclwiKTtcbiQkLl9fcnVudGltZU1vZHVsZXNbXCJkb3VibGUtY2hlY2tcIl0gPSByZXF1aXJlKFwiZG91YmxlLWNoZWNrXCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcInBza2NyeXB0b1wiXSA9IHJlcXVpcmUoXCJwc2tjcnlwdG9cIik7XG4kJC5fX3J1bnRpbWVNb2R1bGVzW1wic2lnbnNlbnN1c1wiXSA9IHJlcXVpcmUoXCJzaWduc2Vuc3VzXCIpO1xuIiwiaWYodHlwZW9mKGdsb2JhbCkgPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgaWYodHlwZW9mKHdpbmRvdykgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgZ2xvYmFsID0gd2luZG93O1xuICAgIH1cbn1cblxuaWYodHlwZW9mKGdsb2JhbC4kJCkgPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgZ2xvYmFsLiQkID0ge307XG5cbiAgICBpZih0eXBlb2Yod2luZG93KSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHdpbmRvdyA9IGdsb2JhbDtcbiAgICB9XG4gICAgd2luZG93LiQkID0gZ2xvYmFsLiQkO1xufVxuXG5pZih0eXBlb2YoJCRbXCJfX3J1bnRpbWVNb2R1bGVzXCJdKSA9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAkJC5fX3J1bnRpbWVNb2R1bGVzID0ge307XG4gICAgY29uc29sZS5sb2coXCJEZWZpbmluZyAkJC5fX3J1bnRpbWVNb2R1bGVzXCIsICQkLl9fcnVudGltZU1vZHVsZXMpXG59XG5cbmlmKHR5cGVvZigkJFtcImJyb3dzZXJSdW50aW1lXCJdKSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmVxdWlyZShcIi4vbm9kZVNoaW1zXCIpXG59XG5cbmNvbnNvbGUubG9nKFwiV1RGISEhXCIpO1xucmVxdWlyZShcIi4vcHNrTW9kdWxlc1wiKTtcblxuXG4iLCJcbi8vdmFyIHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcblxuZnVuY3Rpb24gZGVmYXVsdEVycm9ySGFuZGxpbmdJbXBsZW1lbnRhdGlvbihlcnIsIHJlcyl7XG5cdC8vY29uc29sZS5sb2coZXJyLnN0YWNrKTtcblx0aWYoZXJyKSB0aHJvdyBlcnI7XG5cdHJldHVybiByZXM7XG59XG5cblxuaWYodHlwZW9mKGdsb2JhbC4kJCkgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGdsb2JhbC4kJCA9IHt9O1xufVxuXG4kJC5lcnJvckhhbmRsZXIgPSB7XG4gICAgICAgIGVycm9yOmZ1bmN0aW9uKGVyciwgYXJncywgbXNnKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVyciwgXCJVbmtub3duIGVycm9yIGZyb20gZnVuY3Rpb24gY2FsbCB3aXRoIGFyZ3VtZW50czpcIiwgYXJncywgXCJNZXNzYWdlOlwiLCBtc2cpO1xuICAgICAgICB9LFxuICAgICAgICB0aHJvd0Vycm9yOmZ1bmN0aW9uKGVyciwgYXJncywgbXNnKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVyciwgXCJVbmtub3duIGVycm9yIGZyb20gZnVuY3Rpb24gY2FsbCB3aXRoIGFyZ3VtZW50czpcIiwgYXJncywgXCJNZXNzYWdlOlwiLCBtc2cpO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9LFxuICAgICAgICBpZ25vcmVQb3NzaWJsZUVycm9yOiBmdW5jdGlvbihuYW1lKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG5hbWUpO1xuICAgICAgICB9LFxuICAgICAgICBzeW50YXhFcnJvcjpmdW5jdGlvbihwcm9wZXJ0eSwgc3dhcm0sIHRleHQpe1xuICAgICAgICAgICAgLy90aHJvdyBuZXcgRXJyb3IoXCJNaXNzcGVsbGVkIG1lbWJlciBuYW1lIG9yIG90aGVyIGludGVybmFsIGVycm9yIVwiKTtcbiAgICAgICAgICAgIHZhciBzd2FybU5hbWU7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIHN3YXJtID09IFwic3RyaW5nXCIpe1xuICAgICAgICAgICAgICAgICAgICBzd2FybU5hbWUgPSBzd2FybTtcbiAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICBpZihzd2FybSAmJiBzd2FybS5tZXRhKXtcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1OYW1lICA9IHN3YXJtLm1ldGEuc3dhcm1UeXBlTmFtZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzd2FybU5hbWUgPSBzd2FybS5nZXRJbm5lclZhbHVlKCkubWV0YS5zd2FybVR5cGVOYW1lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICBzd2FybU5hbWUgPSBlcnIudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHByb3BlcnR5KXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIldyb25nIG1lbWJlciBuYW1lIFwiLCBwcm9wZXJ0eSwgIFwiIGluIHN3YXJtIFwiLCBzd2FybU5hbWUpO1xuICAgICAgICAgICAgICAgIGlmKHRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVua25vd24gc3dhcm1cIiwgc3dhcm1OYW1lKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuICAgICAgICB3YXJuaW5nOmZ1bmN0aW9uKG1zZyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgICAgICB9XG4gICAgfTtcblxuJCQudWlkR2VuZXJhdG9yID0gcmVxdWlyZShcIi4vbGliL3NhZmUtdXVpZFwiKTtcblxuJCQuc2FmZUVycm9ySGFuZGxpbmcgPSBmdW5jdGlvbihjYWxsYmFjayl7XG4gICAgICAgIGlmKGNhbGxiYWNrKXtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaztcbiAgICAgICAgfSBlbHNle1xuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRFcnJvckhhbmRsaW5nSW1wbGVtZW50YXRpb247XG4gICAgICAgIH1cbiAgICB9O1xuXG4kJC5fX2ludGVybiA9IHtcbiAgICAgICAgbWtBcmdzOmZ1bmN0aW9uKGFyZ3MscG9zKXtcbiAgICAgICAgICAgIHZhciBhcmdzQXJyYXkgPSBbXTtcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IHBvczsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIGFyZ3NBcnJheS5wdXNoKGFyZ3NbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFyZ3NBcnJheTtcbiAgICAgICAgfVxuICAgIH07XG5cbiQkLl9fZ2xvYmFsID0ge1xuXG4gICAgfTtcblxuXG4kJC5fX2dsb2JhbC5vcmlnaW5hbFJlcXVpcmUgPSByZXF1aXJlO1xuXG5pZih0eXBlb2YoJCQuX19ydW50aW1lTW9kdWxlcykgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICQkLl9fcnVudGltZU1vZHVsZXMgPSB7fTtcbn1cblxuXG4vKlxuIHJlcXVpcmUgYW5kIHJlcXVpcmVMaWJyYXJ5IGFyZSBvdmVyd3JpdGluZyB0aGUgbm9kZS5qcyBkZWZhdWx0cyBpbiBsb2FkaW5nIG1vZHVsZXMgZm9yIGluY3JlYXNpbmcgc2VjdXJpdHkgYW5kIHNwZWVkLlxuIFdlIGd1YXJhbnRlZSB0aGF0IGVhY2ggbW9kdWxlIG9yIGxpYnJhcnkgaXMgbG9hZGVkIG9ubHkgb25jZSBhbmQgb25seSBmcm9tIGEgc2luZ2xlIGZvbGRlci4uLiBVc2UgdGhlIHN0YW5kYXJkIHJlcXVpcmUgaWYgeW91IG5lZWQgc29tZXRoaW5nIGVsc2UhXG5cbiBCeSBkZWZhdWx0IHdlIGV4cGVjdCB0byBydW4gZnJvbSBhIHByaXZhdGVza3kgVk0gZW5naW5lICggYSBwcml2YXRlc2t5IG5vZGUpIGFuZCB0aGVyZWZvcmUgdGhlIGNhbGxmbG93IHN0YXlzIGluIHRoZSBtb2R1bGVzIGZvbGRlciB0aGVyZS5cbiBBbnkgbmV3IHVzZSBvZiBjYWxsZmxvdyAoYW5kIHJlcXVpcmUgb3IgcmVxdWlyZUxpYnJhcnkpIGNvdWxkIHJlcXVpcmUgY2hhbmdlcyB0byAkJC5fX2dsb2JhbC5fX2xvYWRMaWJyYXlSb290IGFuZCAkJC5fX2dsb2JhbC5fX2xvYWRNb2R1bGVzUm9vdFxuICovXG4vLyQkLl9fZ2xvYmFsLl9fbG9hZExpYnJhcnlSb290ICAgID0gX19kaXJuYW1lICsgXCIvLi4vLi4vbGlicmFyaWVzL1wiO1xuLy8kJC5fX2dsb2JhbC5fX2xvYWRNb2R1bGVzUm9vdCAgID0gX19kaXJuYW1lICsgXCIvLi4vLi4vbW9kdWxlcy9cIjtcblxudmFyIGxvYWRlZE1vZHVsZXMgPSB7fTtcbiQkLnJlcXVpcmUgPSBmdW5jdGlvbihuYW1lKXtcblx0dmFyIGV4aXN0aW5nTW9kdWxlID0gbG9hZGVkTW9kdWxlc1tuYW1lXTtcblxuXHRpZighZXhpc3RpbmdNb2R1bGUpe1xuICAgICAgICBleGlzdGluZ01vZHVsZSA9ICQkLl9fcnVudGltZU1vZHVsZXNbbmFtZV07XG4gICAgICAgIGlmKCFleGlzdGluZ01vZHVsZSl7XG4gICAgICAgICAgICAvL3ZhciBhYnNvbHV0ZVBhdGggPSBwYXRoLnJlc29sdmUoICQkLl9fZ2xvYmFsLl9fbG9hZE1vZHVsZXNSb290ICsgbmFtZSk7XG4gICAgICAgICAgICBleGlzdGluZ01vZHVsZSA9ICQkLl9fZ2xvYmFsLm9yaWdpbmFsUmVxdWlyZShuYW1lKTtcbiAgICAgICAgICAgIGxvYWRlZE1vZHVsZXNbbmFtZV0gPSBleGlzdGluZ01vZHVsZTtcbiAgICAgICAgfVxuXHR9XG5cdHJldHVybiBleGlzdGluZ01vZHVsZTtcbn07XG5cbnZhciBzd2FybVV0aWxzID0gcmVxdWlyZShcIi4vbGliL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvc3dhcm1cIik7XG5cbiQkLmRlZmF1bHRFcnJvckhhbmRsaW5nSW1wbGVtZW50YXRpb24gPSBkZWZhdWx0RXJyb3JIYW5kbGluZ0ltcGxlbWVudGF0aW9uO1xuXG52YXIgY2FsbGZsb3dNb2R1bGUgPSByZXF1aXJlKFwiLi9saWIvc3dhcm1EZXNjcmlwdGlvblwiKTtcbiQkLmNhbGxmbG93cyAgICAgICAgPSBjYWxsZmxvd01vZHVsZS5jcmVhdGVTd2FybUVuZ2luZShcImNhbGxmbG93XCIpO1xuJCQuY2FsbGZsb3cgICAgICAgICA9ICQkLmNhbGxmbG93cztcbiQkLmZsb3cgICAgICAgICAgICAgPSAkJC5jYWxsZmxvd3M7XG4kJC5mbG93cyAgICAgICAgICAgID0gJCQuY2FsbGZsb3dzO1xuXG4kJC5zd2FybXMgICAgICAgICAgID0gY2FsbGZsb3dNb2R1bGUuY3JlYXRlU3dhcm1FbmdpbmUoXCJzd2FybVwiLCBzd2FybVV0aWxzKTtcbiQkLnN3YXJtICAgICAgICAgICAgPSAkJC5zd2FybXM7XG4kJC5jb250cmFjdHMgICAgICAgID0gY2FsbGZsb3dNb2R1bGUuY3JlYXRlU3dhcm1FbmdpbmUoXCJjb250cmFjdFwiLCBzd2FybVV0aWxzKTtcbiQkLmNvbnRyYWN0ICAgICAgICAgPSAkJC5jb250cmFjdHM7XG5cblxuJCQuUFNLX1B1YlN1YiA9ICQkLnJlcXVpcmUoXCJzb3VuZHB1YnN1YlwiKS5zb3VuZFB1YlN1YjtcblxuJCQuc2VjdXJpdHlDb250ZXh0ID0gXCJzeXN0ZW1cIjtcbiQkLmxpYnJhcnlQcmVmaXggPSBcImdsb2JhbFwiO1xuJCQubGlicmFyaWVzID0ge1xuICAgIGdsb2JhbDp7XG5cbiAgICB9XG59O1xuXG5cblxuJCQubG9hZExpYnJhcnkgPSByZXF1aXJlKFwiLi9saWIvbG9hZExpYnJhcnlcIikubG9hZExpYnJhcnk7XG5cbiQkLnJlcXVpcmVMaWJyYXJ5ID0gZnVuY3Rpb24obmFtZSl7XG4gICAgLy92YXIgYWJzb2x1dGVQYXRoID0gcGF0aC5yZXNvbHZlKCAgJCQuX19nbG9iYWwuX19sb2FkTGlicmFyeVJvb3QgKyBuYW1lKTtcbiAgICByZXR1cm4gJCQubG9hZExpYnJhcnkobmFtZSxuYW1lKTtcbn07XG5cbiQkLnJlZ2lzdGVyU3dhcm1EZXNjcmlwdGlvbiA9ICBmdW5jdGlvbihsaWJyYXJ5TmFtZSxzaG9ydE5hbWUsIGRlc2NyaXB0aW9uKXtcbiAgICBpZighJCQubGlicmFyaWVzW2xpYnJhcnlOYW1lXSl7XG4gICAgICAgICQkLmxpYnJhcmllc1tsaWJyYXJ5TmFtZV0gPSB7fTtcbiAgICB9XG4gICAgJCQubGlicmFyaWVzW2xpYnJhcnlOYW1lXVtzaG9ydE5hbWVdID0gZGVzY3JpcHRpb247XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFx0XHRcdFx0Y3JlYXRlU3dhcm1FbmdpbmU6IHJlcXVpcmUoXCIuL2xpYi9zd2FybURlc2NyaXB0aW9uXCIpLmNyZWF0ZVN3YXJtRW5naW5lLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVKb2luUG9pbnQ6IHJlcXVpcmUoXCIuL2xpYi9wYXJhbGxlbEpvaW5Qb2ludFwiKS5jcmVhdGVKb2luUG9pbnQsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZVNlcmlhbEpvaW5Qb2ludDogcmVxdWlyZShcIi4vbGliL3NlcmlhbEpvaW5Qb2ludFwiKS5jcmVhdGVTZXJpYWxKb2luUG9pbnQsXG5cdFx0XHRcdFx0XCJzYWZlLXV1aWRcIjogcmVxdWlyZShcIi4vbGliL3NhZmUtdXVpZFwiKSxcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1JbnN0YW5jZU1hbmFnZXI6IHJlcXVpcmUoXCIuL2xpYi9jaG9yZW9ncmFwaGllcy9zd2FybUluc3RhbmNlc01hbmFnZXJcIilcblx0XHRcdFx0fTsiLCIvKlxuSW5pdGlhbCBMaWNlbnNlOiAoYykgQXhpb2xvZ2ljIFJlc2VhcmNoICYgQWxib2FpZSBTw65uaWPEgy5cbkNvbnRyaWJ1dG9yczogQXhpb2xvZ2ljIFJlc2VhcmNoICwgUHJpdmF0ZVNreSBwcm9qZWN0XG5Db2RlIExpY2Vuc2U6IExHUEwgb3IgTUlULlxuKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcbnZhciBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcbmdsb2JhbC5jcHJpbnQgPSBjb25zb2xlLmxvZztcbmdsb2JhbC53cHJpbnQgPSBjb25zb2xlLndhcm47XG5nbG9iYWwuZHByaW50ID0gY29uc29sZS5kZWJ1Zztcbmdsb2JhbC5lcHJpbnQgPSBjb25zb2xlLmVycm9yO1xuXG5cbi8qKlxuICogU2hvcnRjdXQgdG8gSlNPTi5zdHJpbmdpZnlcbiAqIEBwYXJhbSBvYmpcbiAqL1xuZ2xvYmFsLkogPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iaik7XG59XG5cblxuLyoqXG4gKiBQcmludCBzd2FybSBjb250ZXh0cyAoTWVzc2FnZXMpIGFuZCBlYXNpZXIgdG8gcmVhZCBjb21wYXJlZCB3aXRoIEpcbiAqIEBwYXJhbSBvYmpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0cy5jbGVhbkR1bXAgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIG8gPSBvYmoudmFsdWVPZigpO1xuICAgIHZhciBtZXRhID0ge1xuICAgICAgICBzd2FybVR5cGVOYW1lOm8ubWV0YS5zd2FybVR5cGVOYW1lXG4gICAgfTtcbiAgICByZXR1cm4gXCJcXHQgc3dhcm1JZDogXCIgKyBvLm1ldGEuc3dhcm1JZCArIFwie1xcblxcdFxcdG1ldGE6IFwiICAgICsgSihtZXRhKSArXG4gICAgICAgIFwiXFxuXFx0XFx0cHVibGljOiBcIiAgICAgICAgKyBKKG8ucHVibGljVmFycykgK1xuICAgICAgICBcIlxcblxcdFxcdHByb3RlY3RlZDogXCIgICAgICsgSihvLnByb3RlY3RlZFZhcnMpICtcbiAgICAgICAgXCJcXG5cXHRcXHRwcml2YXRlOiBcIiAgICAgICArIEooby5wcml2YXRlVmFycykgKyBcIlxcblxcdH1cXG5cIjtcbn1cblxuLy9NID0gZXhwb3J0cy5jbGVhbkR1bXA7XG4vKipcbiAqIEV4cGVyaW1lbnRhbCBmdW5jdGlvbnNcbiAqL1xuXG5cbi8qXG5cbmxvZ2dlciAgICAgID0gbW9uaXRvci5sb2dnZXI7XG5hc3NlcnQgICAgICA9IG1vbml0b3IuYXNzZXJ0O1xudGhyb3dpbmcgICAgPSBtb25pdG9yLmV4Y2VwdGlvbnM7XG5cblxudmFyIHRlbXBvcmFyeUxvZ0J1ZmZlciA9IFtdO1xuXG52YXIgY3VycmVudFN3YXJtQ29tSW1wbCA9IG51bGw7XG5cbmxvZ2dlci5yZWNvcmQgPSBmdW5jdGlvbihyZWNvcmQpe1xuICAgIGlmKGN1cnJlbnRTd2FybUNvbUltcGw9PT1udWxsKXtcbiAgICAgICAgdGVtcG9yYXJ5TG9nQnVmZmVyLnB1c2gocmVjb3JkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW50U3dhcm1Db21JbXBsLnJlY29yZExvZyhyZWNvcmQpO1xuICAgIH1cbn1cblxudmFyIGNvbnRhaW5lciA9IHJlcXVpcmUoXCJkaWNvbnRhaW5lclwiKS5jb250YWluZXI7XG5cbmNvbnRhaW5lci5zZXJ2aWNlKFwic3dhcm1Mb2dnaW5nTW9uaXRvclwiLCBbXCJzd2FybWluZ0lzV29ya2luZ1wiLCBcInN3YXJtQ29tSW1wbFwiXSwgZnVuY3Rpb24ob3V0T2ZTZXJ2aWNlLHN3YXJtaW5nLCBzd2FybUNvbUltcGwpe1xuXG4gICAgaWYob3V0T2ZTZXJ2aWNlKXtcbiAgICAgICAgaWYoIXRlbXBvcmFyeUxvZ0J1ZmZlcil7XG4gICAgICAgICAgICB0ZW1wb3JhcnlMb2dCdWZmZXIgPSBbXTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0bXAgPSB0ZW1wb3JhcnlMb2dCdWZmZXI7XG4gICAgICAgIHRlbXBvcmFyeUxvZ0J1ZmZlciA9IFtdO1xuICAgICAgICBjdXJyZW50U3dhcm1Db21JbXBsID0gc3dhcm1Db21JbXBsO1xuICAgICAgICBsb2dnZXIucmVjb3JkID0gZnVuY3Rpb24ocmVjb3JkKXtcbiAgICAgICAgICAgIGN1cnJlbnRTd2FybUNvbUltcGwucmVjb3JkTG9nKHJlY29yZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0bXAuZm9yRWFjaChmdW5jdGlvbihyZWNvcmQpe1xuICAgICAgICAgICAgbG9nZ2VyLnJlY29yZChyZWNvcmQpO1xuICAgICAgICB9KTtcbiAgICB9XG59KVxuXG4qL1xuZ2xvYmFsLnVuY2F1Z2h0RXhjZXB0aW9uU3RyaW5nID0gXCJcIjtcbmdsb2JhbC51bmNhdWdodEV4Y2VwdGlvbkV4aXN0cyA9IGZhbHNlO1xuaWYodHlwZW9mIGdsb2JhbC5nbG9iYWxWZXJib3NpdHkgPT0gJ3VuZGVmaW5lZCcpe1xuICAgIGdsb2JhbC5nbG9iYWxWZXJib3NpdHkgPSBmYWxzZTtcbn1cblxudmFyIERFQlVHX1NUQVJUX1RJTUUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuZnVuY3Rpb24gZ2V0RGVidWdEZWx0YSgpe1xuICAgIHZhciBjdXJyZW50VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHJldHVybiBjdXJyZW50VGltZSAtIERFQlVHX1NUQVJUX1RJTUU7XG59XG5cbi8qKlxuICogRGVidWcgZnVuY3Rpb25zLCBpbmZsdWVuY2VkIGJ5IGdsb2JhbFZlcmJvc2l0eSBnbG9iYWwgdmFyaWFibGVcbiAqIEBwYXJhbSB0eHRcbiAqL1xuZHByaW50ID0gZnVuY3Rpb24gKHR4dCkge1xuICAgIGlmIChnbG9iYWxWZXJib3NpdHkgPT0gdHJ1ZSkge1xuICAgICAgICBpZiAodGhpc0FkYXB0ZXIuaW5pdGlsaXNlZCApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiREVCVUc6IFtcIiArIHRoaXNBZGFwdGVyLm5vZGVOYW1lICsgXCJdKFwiICsgZ2V0RGVidWdEZWx0YSgpKyBcIik6XCIrdHh0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiREVCVUc6IChcIiArIGdldERlYnVnRGVsdGEoKSsgXCIpOlwiK3R4dCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHOiBcIiArIHR4dCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogb2Jzb2xldGUhP1xuICogQHBhcmFtIHR4dFxuICovXG5nbG9iYWwuYXByaW50ID0gZnVuY3Rpb24gKHR4dCkge1xuICAgIGNvbnNvbGUubG9nKFwiREVCVUc6IFtcIiArIHRoaXNBZGFwdGVyLm5vZGVOYW1lICsgXCJdOiBcIiArIHR4dCk7XG59XG5cblxuXG4vKipcbiAqIFV0aWxpdHkgZnVuY3Rpb24gdXN1YWxseSB1c2VkIGluIHRlc3RzLCBleGl0IGN1cnJlbnQgcHJvY2VzcyBhZnRlciBhIHdoaWxlXG4gKiBAcGFyYW0gbXNnXG4gKiBAcGFyYW0gdGltZW91dFxuICovXG5nbG9iYWwuZGVsYXlFeGl0ID0gZnVuY3Rpb24gKG1zZywgcmV0Q29kZSx0aW1lb3V0KSB7XG4gICAgaWYocmV0Q29kZSA9PSB1bmRlZmluZWQpe1xuICAgICAgICByZXRDb2RlID0gRXhpdENvZGVzLlVua25vd25FcnJvcjtcbiAgICB9XG5cbiAgICBpZih0aW1lb3V0ID09IHVuZGVmaW5lZCl7XG4gICAgICAgIHRpbWVvdXQgPSAxMDA7XG4gICAgfVxuXG4gICAgaWYobXNnID09IHVuZGVmaW5lZCl7XG4gICAgICAgIG1zZyA9IFwiRGVsYXlpbmcgZXhpdCB3aXRoIFwiKyB0aW1lb3V0ICsgXCJtc1wiO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHByb2Nlc3MuZXhpdChyZXRDb2RlKTtcbiAgICB9LCB0aW1lb3V0KTtcbn1cblxuXG5mdW5jdGlvbiBsb2NhbExvZyAobG9nVHlwZSwgbWVzc2FnZSwgZXJyKSB7XG4gICAgdmFyIHRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgIHZhciBub3cgPSB0aW1lLmdldERhdGUoKSArIFwiLVwiICsgKHRpbWUuZ2V0TW9udGgoKSArIDEpICsgXCIsXCIgKyB0aW1lLmdldEhvdXJzKCkgKyBcIjpcIiArIHRpbWUuZ2V0TWludXRlcygpO1xuICAgIHZhciBtc2c7XG5cbiAgICBtc2cgPSAnWycgKyBub3cgKyAnXVsnICsgdGhpc0FkYXB0ZXIubm9kZU5hbWUgKyAnXSAnICsgbWVzc2FnZTtcblxuICAgIGlmIChlcnIgIT0gbnVsbCAmJiBlcnIgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG1zZyArPSAnXFxuICAgICBFcnI6ICcgKyBlcnIudG9TdHJpbmcoKTtcbiAgICAgICAgaWYgKGVyci5zdGFjayAmJiBlcnIuc3RhY2sgIT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgbXNnICs9ICdcXG4gICAgIFN0YWNrOiAnICsgZXJyLnN0YWNrICsgJ1xcbic7XG4gICAgfVxuXG4gICAgY3ByaW50KG1zZyk7XG4gICAgaWYodGhpc0FkYXB0ZXIuaW5pdGlsaXNlZCl7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKGdldFN3YXJtRmlsZVBhdGgodGhpc0FkYXB0ZXIuY29uZmlnLmxvZ3NQYXRoICsgXCIvXCIgKyBsb2dUeXBlKSwgbXNnKTtcbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJGYWlsaW5nIHRvIHdyaXRlIGxvZ3MgaW4gXCIsIHRoaXNBZGFwdGVyLmNvbmZpZy5sb2dzUGF0aCApO1xuICAgICAgICB9XG5cbiAgICB9XG59XG5cblxuZ2xvYmFsLnByaW50ZiA9IGZ1bmN0aW9uICguLi5wYXJhbXMpIHtcbiAgICB2YXIgYXJncyA9IFtdOyAvLyBlbXB0eSBhcnJheVxuICAgIC8vIGNvcHkgYWxsIG90aGVyIGFyZ3VtZW50cyB3ZSB3YW50IHRvIFwicGFzcyB0aHJvdWdoXCJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcmdzLnB1c2gocGFyYW1zW2ldKTtcbiAgICB9XG4gICAgdmFyIG91dCA9IHV0aWwuZm9ybWF0LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIGNvbnNvbGUubG9nKG91dCk7XG59XG5cbmdsb2JhbC5zcHJpbnRmID0gZnVuY3Rpb24gKC4uLnBhcmFtcykge1xuICAgIHZhciBhcmdzID0gW107IC8vIGVtcHR5IGFycmF5XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJncy5wdXNoKHBhcmFtc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiB1dGlsLmZvcm1hdC5hcHBseSh0aGlzLCBhcmdzKTtcbn1cblxuIiwiXG5cbmZ1bmN0aW9uIFN3YXJtc0luc3RhbmNlc01hbmFnZXIoKXtcbiAgICB2YXIgc3dhcm1BbGl2ZUluc3RhbmNlcyA9IHtcblxuICAgIH1cblxuICAgIHRoaXMud2FpdEZvclN3YXJtID0gZnVuY3Rpb24oY2FsbGJhY2ssIHN3YXJtLCBrZWVwQWxpdmVDaGVjayl7XG5cbiAgICAgICAgZnVuY3Rpb24gZG9Mb2dpYygpe1xuICAgICAgICAgICAgdmFyIHN3YXJtSWQgPSBzd2FybS5nZXRJbm5lclZhbHVlKCkubWV0YS5zd2FybUlkO1xuICAgICAgICAgICAgdmFyIHdhdGNoZXIgPSBzd2FybUFsaXZlSW5zdGFuY2VzW3N3YXJtSWRdO1xuICAgICAgICAgICAgaWYoIXdhdGNoZXIpe1xuICAgICAgICAgICAgICAgIHdhdGNoZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIHN3YXJtOnN3YXJtLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazpjYWxsYmFjayxcbiAgICAgICAgICAgICAgICAgICAga2VlcEFsaXZlQ2hlY2s6a2VlcEFsaXZlQ2hlY2tcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3dhcm1BbGl2ZUluc3RhbmNlc1tzd2FybUlkXSA9IHdhdGNoZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBmaWx0ZXIoKXtcbiAgICAgICAgICAgIHJldHVybiBzd2FybS5nZXRJbm5lclZhbHVlKCkubWV0YS5zd2FybUlkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8kJC51aWRHZW5lcmF0b3Iud2FpdF9mb3JfY29uZGl0aW9uKGNvbmRpdGlvbixkb0xvZ2ljKTtcbiAgICAgICAgc3dhcm0ub2JzZXJ2ZShkb0xvZ2ljLCBudWxsLCBmaWx0ZXIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsZWFuU3dhcm1XYWl0ZXIoc3dhcm1TZXJpYWxpc2F0aW9uKXsgLy8gVE9ETzogYWRkIGJldHRlciBtZWNoYW5pc21zIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXG4gICAgICAgIHZhciBzd2FybUlkID0gc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuc3dhcm1JZDtcbiAgICAgICAgdmFyIHdhdGNoZXIgPSBzd2FybUFsaXZlSW5zdGFuY2VzW3N3YXJtSWRdO1xuXG4gICAgICAgIGlmKCF3YXRjaGVyKXtcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci53YXJuaW5nKFwiSW52YWxpZCBzd2FybSByZWNlaXZlZDogXCIgKyBzd2FybUlkKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhcmdzID0gc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuYXJncztcbiAgICAgICAgYXJncy5wdXNoKHN3YXJtU2VyaWFsaXNhdGlvbik7XG5cbiAgICAgICAgd2F0Y2hlci5jYWxsYmFjay5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgaWYoIXdhdGNoZXIua2VlcEFsaXZlQ2hlY2soKSl7XG4gICAgICAgICAgICBkZWxldGUgc3dhcm1BbGl2ZUluc3RhbmNlc1tzd2FybUlkXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucmV2aXZlX3N3YXJtID0gZnVuY3Rpb24oc3dhcm1TZXJpYWxpc2F0aW9uKXtcblxuXG4gICAgICAgIHZhciBzd2FybUlkICAgICA9IHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLnN3YXJtSWQ7XG4gICAgICAgIHZhciBzd2FybVR5cGUgICA9IHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLnN3YXJtVHlwZU5hbWU7XG4gICAgICAgIHZhciBpbnN0YW5jZSAgICA9IHN3YXJtQWxpdmVJbnN0YW5jZXNbc3dhcm1JZF07XG5cbiAgICAgICAgdmFyIHN3YXJtO1xuXG4gICAgICAgIGlmKGluc3RhbmNlKXtcbiAgICAgICAgICAgIHN3YXJtID0gaW5zdGFuY2Uuc3dhcm07XG5cbiAgICAgICAgfSAgIGVsc2Uge1xuICAgICAgICAgICAgc3dhcm0gPSAkJC5zd2FybS5jcmVhdGUoc3dhcm1UeXBlLCB1bmRlZmluZWQsIHN3YXJtU2VyaWFsaXNhdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZihzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5jb21tYW5kID09IFwiYXN5bmNSZXR1cm5cIil7XG4gICAgICAgICAgICBjbGVhblN3YXJtV2FpdGVyKHN3YXJtU2VyaWFsaXNhdGlvbik7XG4gICAgICAgIH0gZWxzZSAgICAgaWYoc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuY29tbWFuZCA9PSBcImV4ZWN1dGVTd2FybVBoYXNlXCIpe1xuICAgICAgICAgICAgc3dhcm0ucnVuUGhhc2Uoc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEucGhhc2VOYW1lLCBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5hcmdzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5rbm93biBjb21tYW5kXCIsc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuY29tbWFuZCwgXCJpbiBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5jb21tYW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN3YXJtO1xuICAgIH1cbn1cblxuXG4kJC5zd2FybXNJbnN0YW5jZXNNYW5hZ2VyID0gbmV3IFN3YXJtc0luc3RhbmNlc01hbmFnZXIoKTtcblxuXG4iLCJ2YXIgYmVlc0hlYWxlciA9ICQkLnJlcXVpcmUoXCJzb3VuZHB1YnN1YlwiKS5iZWVzSGVhbGVyO1xudmFyIHN3YXJtRGVidWcgPSByZXF1aXJlKFwiLi4vU3dhcm1EZWJ1Z1wiKTtcblxuZXhwb3J0cy5jcmVhdGVGb3JPYmplY3QgPSBmdW5jdGlvbih2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCl7XG5cdHZhciByZXQgPSB7fTtcblxuXHRmdW5jdGlvbiBmaWx0ZXJGb3JTZXJpYWxpc2FibGUgKHZhbHVlT2JqZWN0KXtcblx0XHRyZXR1cm4gdmFsdWVPYmplY3QubWV0YS5zd2FybUlkO1xuXHR9XG5cblx0dmFyIHN3YXJtRnVuY3Rpb24gPSBmdW5jdGlvbihjb250ZXh0LCBwaGFzZU5hbWUpe1xuXHRcdHZhciBhcmdzID1bXTtcblx0XHRmb3IodmFyIGkgPSAyOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKXtcblx0XHRcdGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuXHRcdH1cblxuXHRcdC8vbWFrZSB0aGUgZXhlY3V0aW9uIGF0IGxldmVsIDAgIChhZnRlciBhbGwgcGVuZGluZyBldmVudHMpIGFuZCB3YWl0IHRvIGhhdmUgYSBzd2FybUlkXG5cdFx0cmV0Lm9ic2VydmUoZnVuY3Rpb24oKXtcblx0XHRcdGJlZXNIZWFsZXIuYXNKU09OKHZhbHVlT2JqZWN0LCBwaGFzZU5hbWUsIGFyZ3MsIGZ1bmN0aW9uKGVycixqc01zZyl7XG5cdFx0XHRcdGpzTXNnLm1ldGEudGFyZ2V0ID0gY29udGV4dDtcblx0XHRcdFx0JCQuUFNLX1B1YlN1Yi5wdWJsaXNoKCQkLkNPTlNUQU5UUy5TV0FSTV9GT1JfRVhFQ1VUSU9OLCBqc01zZyk7XG5cdFx0XHR9KTtcblx0XHR9LG51bGwsZmlsdGVyRm9yU2VyaWFsaXNhYmxlKTtcblxuXHRcdHJldC5ub3RpZnkoKTtcblxuXG5cdFx0cmV0dXJuIHRoaXNPYmplY3Q7XG5cdH07XG5cblx0dmFyIGFzeW5jUmV0dXJuID0gZnVuY3Rpb24oZXJyLCByZXN1bHQpe1xuXHRcdHZhciBjb250ZXh0ID0gdmFsdWVPYmplY3QucHJvdGVjdGVkVmFycy5jb250ZXh0O1xuXG5cdFx0aWYoIWNvbnRleHQgJiYgdmFsdWVPYmplY3QubWV0YS53YWl0U3RhY2spe1xuXHRcdFx0Y29udGV4dCA9IHZhbHVlT2JqZWN0Lm1ldGEud2FpdFN0YWNrLnBvcCgpO1xuXHRcdFx0dmFsdWVPYmplY3QucHJvdGVjdGVkVmFycy5jb250ZXh0ID0gY29udGV4dDtcblx0XHR9XG5cblx0XHRiZWVzSGVhbGVyLmFzSlNPTih2YWx1ZU9iamVjdCwgXCJfX3JldHVybl9fXCIsIFtlcnIsIHJlc3VsdF0sIGZ1bmN0aW9uKGVycixqc01zZyl7XG5cdFx0XHRqc01zZy5tZXRhLmNvbW1hbmQgPSBcImFzeW5jUmV0dXJuXCI7XG5cdFx0XHRpZighY29udGV4dCl7XG5cdFx0XHRcdGNvbnRleHQgPSB2YWx1ZU9iamVjdC5tZXRhLmhvbWVTZWN1cml0eUNvbnRleHQ7Ly9UT0RPOiBDSEVDSyBUSElTXG5cblx0XHRcdH1cblx0XHRcdGpzTXNnLm1ldGEudGFyZ2V0ID0gY29udGV4dDtcblxuXHRcdFx0aWYoIWNvbnRleHQpe1xuXHRcdFx0XHQkJC5lcnJvckhhbmRsZXIuZXJyb3IobmV3IEVycm9yKFwiQXN5bmNocm9ub3VzIHJldHVybiBpbnNpZGUgb2YgYSBzd2FybSB0aGF0IGRvZXMgbm90IHdhaXQgZm9yIHJlc3VsdHNcIikpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JCQuUFNLX1B1YlN1Yi5wdWJsaXNoKCQkLkNPTlNUQU5UUy5TV0FSTV9GT1JfRVhFQ1VUSU9OLCBqc01zZyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG5cblx0ZnVuY3Rpb24gaG9tZShlcnIsIHJlc3VsdCl7XG5cdFx0YmVlc0hlYWxlci5hc0pTT04odmFsdWVPYmplY3QsIFwiaG9tZVwiLCBbZXJyLCByZXN1bHRdLCBmdW5jdGlvbihlcnIsanNNc2cpe1xuXHRcdFx0dmFyIGNvbnRleHQgPSB2YWx1ZU9iamVjdC5tZXRhLmhvbWVDb250ZXh0O1xuXHRcdFx0anNNc2cubWV0YS50YXJnZXQgPSBjb250ZXh0O1xuXHRcdFx0JCQuUFNLX1B1YlN1Yi5wdWJsaXNoKCQkLkNPTlNUQU5UUy5TV0FSTV9GT1JfRVhFQ1VUSU9OLCBqc01zZyk7XG5cdFx0fSk7XG5cdH1cblxuXG5cblx0ZnVuY3Rpb24gd2FpdFJlc3VsdHMoY2FsbGJhY2ssIGtlZXBBbGl2ZUNoZWNrLCBzd2FybSl7XG5cdFx0aWYoIXN3YXJtKXtcblx0XHRcdHN3YXJtID0gdGhpcztcblx0XHR9XG5cdFx0aWYoIWtlZXBBbGl2ZUNoZWNrKXtcblx0XHRcdGtlZXBBbGl2ZUNoZWNrID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR2YXIgaW5uZXIgPSBzd2FybS5nZXRJbm5lclZhbHVlKCk7XG5cdFx0aWYoIWlubmVyLm1ldGEud2FpdFN0YWNrKXtcblx0XHRcdGlubmVyLm1ldGEud2FpdFN0YWNrID0gW107XG5cdFx0XHRpbm5lci5tZXRhLndhaXRTdGFjay5wdXNoKCQkLnNlY3VyaXR5Q29udGV4dClcblx0XHR9XG5cdFx0JCQuc3dhcm1zSW5zdGFuY2VzTWFuYWdlci53YWl0Rm9yU3dhcm0oY2FsbGJhY2ssIHN3YXJtLCBrZWVwQWxpdmVDaGVjayk7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIGdldElubmVyVmFsdWUoKXtcblx0XHRyZXR1cm4gdmFsdWVPYmplY3Q7XG5cdH1cblxuXHRmdW5jdGlvbiBydW5QaGFzZShmdW5jdE5hbWUsIGFyZ3Mpe1xuXHRcdHZhciBmdW5jID0gdmFsdWVPYmplY3QubXlGdW5jdGlvbnNbZnVuY3ROYW1lXTtcblx0XHRpZihmdW5jKXtcblx0XHRcdGZ1bmMuYXBwbHkodGhpc09iamVjdCwgYXJncyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihmdW5jdE5hbWUsIHZhbHVlT2JqZWN0LCBcIkZ1bmN0aW9uIFwiICsgZnVuY3ROYW1lICsgXCIgZG9lcyBub3QgZXhpc3QhXCIpO1xuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gdXBkYXRlKHNlcmlhbGlzYXRpb24pe1xuXHRcdGJlZXNIZWFsZXIuanNvblRvTmF0aXZlKHNlcmlhbGlzYXRpb24sdmFsdWVPYmplY3QpO1xuXHR9XG5cblxuXHRmdW5jdGlvbiB2YWx1ZU9mKCl7XG5cdFx0dmFyIHJldCA9IHt9O1xuXHRcdHJldC5tZXRhICAgICAgICAgICAgICAgID0gdmFsdWVPYmplY3QubWV0YTtcblx0XHRyZXQucHVibGljVmFycyAgICAgICAgICA9IHZhbHVlT2JqZWN0LnB1YmxpY1ZhcnM7XG5cdFx0cmV0LnByaXZhdGVWYXJzICAgICAgICAgPSB2YWx1ZU9iamVjdC5wcml2YXRlVmFycztcblx0XHRyZXQucHJvdGVjdGVkVmFycyAgICAgICA9IHZhbHVlT2JqZWN0LnByb3RlY3RlZFZhcnM7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGZ1bmN0aW9uIHRvU3RyaW5nICgpe1xuXHRcdHJldHVybiBzd2FybURlYnVnLmNsZWFuRHVtcCh0aGlzT2JqZWN0LnZhbHVlT2YoKSk7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIGNyZWF0ZVBhcmFsbGVsKGNhbGxiYWNrKXtcblx0XHRyZXR1cm4gcmVxdWlyZShcIi4uLy4uL3BhcmFsbGVsSm9pblBvaW50XCIpLmNyZWF0ZUpvaW5Qb2ludCh0aGlzT2JqZWN0LCBjYWxsYmFjaywgJCQuX19pbnRlcm4ubWtBcmdzKGFyZ3VtZW50cywxKSk7XG5cdH1cblxuXHRmdW5jdGlvbiBjcmVhdGVTZXJpYWwoY2FsbGJhY2spe1xuXHRcdHJldHVybiByZXF1aXJlKFwiLi4vLi4vc2VyaWFsSm9pblBvaW50XCIpLmNyZWF0ZVNlcmlhbEpvaW5Qb2ludCh0aGlzT2JqZWN0LCBjYWxsYmFjaywgJCQuX19pbnRlcm4ubWtBcmdzKGFyZ3VtZW50cywxKSk7XG5cdH1cblxuXHRmdW5jdGlvbiBpbnNwZWN0KCl7XG5cdFx0cmV0dXJuIHN3YXJtRGVidWcuY2xlYW5EdW1wKHRoaXNPYmplY3QudmFsdWVPZigpKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNvbnN0cnVjdG9yKCl7XG5cdFx0cmV0dXJuIFN3YXJtRGVzY3JpcHRpb247XG5cdH1cblxuXHRmdW5jdGlvbiBlbnN1cmVMb2NhbElkKCl7XG5cdFx0aWYoIXZhbHVlT2JqZWN0LmxvY2FsSWQpe1xuXHRcdFx0dmFsdWVPYmplY3QubG9jYWxJZCA9IHZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1UeXBlTmFtZSArIFwiLVwiICsgbG9jYWxJZDtcblx0XHRcdGxvY2FsSWQrKztcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBvYnNlcnZlKGNhbGxiYWNrLCB3YWl0Rm9yTW9yZSwgZmlsdGVyKXtcblx0XHRpZighd2FpdEZvck1vcmUpe1xuXHRcdFx0d2FpdEZvck1vcmUgPSBmdW5jdGlvbiAoKXtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGVuc3VyZUxvY2FsSWQoKTtcblxuXHRcdCQkLlBTS19QdWJTdWIuc3Vic2NyaWJlKHZhbHVlT2JqZWN0LmxvY2FsSWQsIGNhbGxiYWNrLCB3YWl0Rm9yTW9yZSwgZmlsdGVyKTtcblx0fVxuXG5cdGZ1bmN0aW9uIHRvSlNPTihwcm9wKXtcblx0XHQvL3ByZXZlbnRpbmcgbWF4IGNhbGwgc3RhY2sgc2l6ZSBleGNlZWRpbmcgb24gcHJveHkgYXV0byByZWZlcmVuY2luZ1xuXHRcdC8vcmVwbGFjZSB7fSBhcyByZXN1bHQgb2YgSlNPTihQcm94eSkgd2l0aCB0aGUgc3RyaW5nIFtPYmplY3QgcHJvdGVjdGVkIG9iamVjdF1cblx0XHRyZXR1cm4gXCJbT2JqZWN0IHByb3RlY3RlZCBvYmplY3RdXCI7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRKU09OYXN5bmMoY2FsbGJhY2spe1xuXHRcdC8vbWFrZSB0aGUgZXhlY3V0aW9uIGF0IGxldmVsIDAgIChhZnRlciBhbGwgcGVuZGluZyBldmVudHMpIGFuZCB3YWl0IHRvIGhhdmUgYSBzd2FybUlkXG5cdFx0cmV0Lm9ic2VydmUoZnVuY3Rpb24oKXtcblx0XHRcdGJlZXNIZWFsZXIuYXNKU09OKHZhbHVlT2JqZWN0LCBudWxsLCBudWxsLGNhbGxiYWNrKTtcblx0XHR9LG51bGwsZmlsdGVyRm9yU2VyaWFsaXNhYmxlKTtcblx0XHRyZXQubm90aWZ5KCk7XG5cdH1cblxuXHRmdW5jdGlvbiBub3RpZnkoZXZlbnQpe1xuXHRcdGlmKCFldmVudCl7XG5cdFx0XHRldmVudCA9IHZhbHVlT2JqZWN0O1xuXHRcdH1cblx0XHRlbnN1cmVMb2NhbElkKCk7XG5cdFx0JCQuUFNLX1B1YlN1Yi5wdWJsaXNoKHZhbHVlT2JqZWN0LmxvY2FsSWQsIGV2ZW50KTtcblx0fVxuXG5cdHJldC5zd2FybSAgICAgICAgICAgPSBzd2FybUZ1bmN0aW9uO1xuXHRyZXQubm90aWZ5ICAgICAgICAgID0gbm90aWZ5O1xuXHRyZXQuZ2V0SlNPTmFzeW5jICAgID0gZ2V0SlNPTmFzeW5jO1xuXHRyZXQudG9KU09OICAgICAgICAgID0gdG9KU09OO1xuXHRyZXQub2JzZXJ2ZSAgICAgICAgID0gb2JzZXJ2ZTtcblx0cmV0Lmluc3BlY3QgICAgICAgICA9IGluc3BlY3Q7XG5cdHJldC5qb2luICAgICAgICAgICAgPSBjcmVhdGVQYXJhbGxlbDtcblx0cmV0LnBhcmFsbGVsICAgICAgICA9IGNyZWF0ZVBhcmFsbGVsO1xuXHRyZXQuc2VyaWFsICAgICAgICAgID0gY3JlYXRlU2VyaWFsO1xuXHRyZXQudmFsdWVPZiAgICAgICAgID0gdmFsdWVPZjtcblx0cmV0LnVwZGF0ZSAgICAgICAgICA9IHVwZGF0ZTtcblx0cmV0LnJ1blBoYXNlICAgICAgICA9IHJ1blBoYXNlO1xuXHRyZXQub25SZXR1cm4gICAgICAgID0gd2FpdFJlc3VsdHM7XG5cdHJldC5vblJlc3VsdCAgICAgICAgPSB3YWl0UmVzdWx0cztcblx0cmV0LmFzeW5jUmV0dXJuICAgICA9IGFzeW5jUmV0dXJuO1xuXHRyZXQucmV0dXJuICAgICAgICAgID0gYXN5bmNSZXR1cm47XG5cdHJldC5nZXRJbm5lclZhbHVlICAgPSBnZXRJbm5lclZhbHVlO1xuXHRyZXQuaG9tZSAgICAgICAgICAgID0gaG9tZTtcblx0cmV0LnRvU3RyaW5nICAgICAgICA9IHRvU3RyaW5nO1xuXHRyZXQuY29uc3RydWN0b3IgICAgID0gY29uc3RydWN0b3I7XG5cblx0cmV0dXJuIHJldDtcblxufTsiLCJleHBvcnRzLmNyZWF0ZUZvck9iamVjdCA9IGZ1bmN0aW9uKHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0LCBsb2NhbElkKXtcblx0dmFyIHJldCA9IHJlcXVpcmUoXCIuL2Jhc2VcIikuY3JlYXRlRm9yT2JqZWN0KHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0LCBsb2NhbElkKTtcblxuXHRyZXQuc3dhcm0gICAgICAgICAgID0gbnVsbDtcblx0cmV0Lm9uUmV0dXJuICAgICAgICA9IG51bGw7XG5cdHJldC5vblJlc3VsdCAgICAgICAgPSBudWxsO1xuXHRyZXQuYXN5bmNSZXR1cm4gICAgID0gbnVsbDtcblx0cmV0LnJldHVybiAgICAgICAgICA9IG51bGw7XG5cdHJldC5ob21lICAgICAgICAgICAgPSBudWxsO1xuXG5cdHJldHVybiByZXQ7XG59OyIsImV4cG9ydHMuY3JlYXRlRm9yT2JqZWN0ID0gZnVuY3Rpb24odmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpe1xuXHRyZXR1cm4gcmVxdWlyZShcIi4vYmFzZVwiKS5jcmVhdGVGb3JPYmplY3QodmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpO1xufTsiLCIvKlxuSW5pdGlhbCBMaWNlbnNlOiAoYykgQXhpb2xvZ2ljIFJlc2VhcmNoICYgQWxib2FpZSBTw65uaWPEgy5cbkNvbnRyaWJ1dG9yczogQXhpb2xvZ2ljIFJlc2VhcmNoICwgUHJpdmF0ZVNreSBwcm9qZWN0XG5Db2RlIExpY2Vuc2U6IExHUEwgb3IgTUlULlxuKi9cblxuLy92YXIgZnMgPSByZXF1aXJlKFwiZnNcIik7XG4vL3ZhciBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5cbmZ1bmN0aW9uIHdyYXBDYWxsKG9yaWdpbmFsLCBwcmVmaXhOYW1lKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncyl7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJwcmVmaXhOYW1lXCIsIHByZWZpeE5hbWUpXG4gICAgICAgIHZhciBwcmV2aW91c1ByZWZpeCA9ICQkLmxpYnJhcnlQcmVmaXg7XG4gICAgICAgICQkLmxpYnJhcnlQcmVmaXggPSBwcmVmaXhOYW1lO1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICB2YXIgcmV0ID0gb3JpZ2luYWwuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICAkJC5saWJyYXJ5UHJlZml4ID0gcHJldmlvdXNQcmVmaXggO1xuICAgICAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgICAgICQkLmxpYnJhcnlQcmVmaXggPSBwcmV2aW91c1ByZWZpeCA7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIFN3YXJtTGlicmFyeShwcmVmaXhOYW1lLCBmb2xkZXIpe1xuICAgICQkLmxpYnJhcmllc1twcmVmaXhOYW1lXSA9IHRoaXM7XG4gICAgdmFyIHByZWZpeGVkUmVxdWlyZSA9IHdyYXBDYWxsKGZ1bmN0aW9uKHBhdGgpe1xuICAgICAgICByZXR1cm4gcmVxdWlyZShwYXRoKTtcbiAgICB9LCBwcmVmaXhOYW1lKTtcblxuICAgIGZ1bmN0aW9uIGluY2x1ZGVBbGxJblJvb3QoZm9sZGVyKSB7XG4gICAgICAgIHJldHVybiAkJC5yZXF1aXJlKGZvbGRlcik7IC8vIGEgbGlicmFyeSBpcyBqdXN0IGEgbW9kdWxlXG4gICAgICAgIC8vdmFyIHN0YXQgPSBmcy5zdGF0U3luYyhwYXRoKTtcbiAgICAgICAgLyp2YXIgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhmb2xkZXIpO1xuICAgICAgICBmaWxlcy5mb3JFYWNoKGZ1bmN0aW9uKGZpbGVOYW1lKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJMb2FkaW5nIFwiLCBmaWxlTmFtZSk7XG4gICAgICAgICAgICB2YXIgZXh0ID0gZmlsZU5hbWUuc3Vic3RyKGZpbGVOYW1lLmxhc3RJbmRleE9mKCcuJykgKyAxKTtcbiAgICAgICAgICAgIGlmKGV4dC50b0xvd2VyQ2FzZSgpID09IFwianNcIil7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZ1bGxQYXRoID0gcGF0aC5yZXNvbHZlKGZvbGRlciArIFwiL1wiICsgZmlsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBwcmVmaXhlZFJlcXVpcmUoZnVsbFBhdGgpO1xuICAgICAgICAgICAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKi9cbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiB3cmFwU3dhcm1SZWxhdGVkRnVuY3Rpb25zKHNwYWNlLCBwcmVmaXhOYW1lKXtcbiAgICAgICAgdmFyIHJldCA9IHt9O1xuICAgICAgICB2YXIgbmFtZXMgPSBbXCJjcmVhdGVcIiwgXCJkZXNjcmliZVwiLCBcInN0YXJ0XCIsIFwicmVzdGFydFwiXTtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaTxuYW1lcy5sZW5ndGg7IGkrKyApe1xuICAgICAgICAgICAgcmV0W25hbWVzW2ldXSA9IHdyYXBDYWxsKHNwYWNlW25hbWVzW2ldXSwgcHJlZml4TmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICB0aGlzLmNhbGxmbG93cyAgICAgICAgPSB0aGlzLmNhbGxmbG93ICAgPSB3cmFwU3dhcm1SZWxhdGVkRnVuY3Rpb25zKCQkLmNhbGxmbG93cywgcHJlZml4TmFtZSk7XG4gICAgdGhpcy5zd2FybXMgICAgICAgICAgID0gdGhpcy5zd2FybSAgICAgID0gd3JhcFN3YXJtUmVsYXRlZEZ1bmN0aW9ucygkJC5zd2FybXMsIHByZWZpeE5hbWUpO1xuICAgIHRoaXMuY29udHJhY3RzICAgICAgICA9IHRoaXMuY29udHJhY3QgICA9IHdyYXBTd2FybVJlbGF0ZWRGdW5jdGlvbnMoJCQuY29udHJhY3RzLCBwcmVmaXhOYW1lKTtcbiAgICBpbmNsdWRlQWxsSW5Sb290KGZvbGRlciwgcHJlZml4TmFtZSk7XG59XG5cbmV4cG9ydHMubG9hZExpYnJhcnkgPSBmdW5jdGlvbihwcmVmaXhOYW1lLCBmb2xkZXIpe1xuICAgIHZhciBleGlzdGluZyA9ICQkLmxpYnJhcmllc1twcmVmaXhOYW1lXTtcbiAgICBpZihleGlzdGluZyApe1xuICAgICAgICBpZihmb2xkZXIpIHtcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci53YXJuaW5nKFwiUmV1c2luZyBhbHJlYWR5IGxvYWRlZCBsaWJyYXJ5IFwiICsgcHJlZml4TmFtZSArIFwiY291bGQgYmUgYW4gZXJyb3IhXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBleGlzdGluZztcbiAgICB9XG4gICAgLy92YXIgYWJzb2x1dGVQYXRoID0gcGF0aC5yZXNvbHZlKGZvbGRlcik7XG4gICAgcmV0dXJuIG5ldyBTd2FybUxpYnJhcnkocHJlZml4TmFtZSwgZm9sZGVyKTtcbn0iLCJcbnZhciBqb2luQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIFBhcmFsbGVsSm9pblBvaW50KHN3YXJtLCBjYWxsYmFjaywgYXJncyl7XG4gICAgam9pbkNvdW50ZXIrKztcbiAgICB2YXIgY2hhbm5lbElkID0gXCJQYXJhbGxlbEpvaW5Qb2ludFwiICsgam9pbkNvdW50ZXI7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBjb3VudGVyID0gMDtcbiAgICB2YXIgc3RvcE90aGVyRXhlY3V0aW9uICAgICA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gZXhlY3V0aW9uU3RlcChzdGVwRnVuYywgbG9jYWxBcmdzLCBzdG9wKXtcblxuICAgICAgICB0aGlzLmRvRXhlY3V0ZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZihzdG9wT3RoZXJFeGVjdXRpb24pe1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBzdGVwRnVuYy5hcHBseShzd2FybSwgbG9jYWxBcmdzKTtcbiAgICAgICAgICAgICAgICBpZihzdG9wKXtcbiAgICAgICAgICAgICAgICAgICAgc3RvcE90aGVyRXhlY3V0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy9ldmVyeXRpbmcgaXMgZmluZVxuICAgICAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgICAgIGFyZ3MudW5zaGlmdChlcnIpO1xuICAgICAgICAgICAgICAgIHNlbmRGb3JTb3VuZEV4ZWN1dGlvbihjYWxsYmFjaywgYXJncywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvL3N0b3AgaXQsIGRvIG5vdCBjYWxsIGFnYWluIGFueXRoaW5nXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZih0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgICQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihcImludmFsaWQgam9pblwiLHN3YXJtLCBcImludmFsaWQgZnVuY3Rpb24gYXQgam9pbiBpbiBzd2FybVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICQkLlBTS19QdWJTdWIuc3Vic2NyaWJlKGNoYW5uZWxJZCxmdW5jdGlvbihmb3JFeGVjdXRpb24pe1xuICAgICAgICBpZihzdG9wT3RoZXJFeGVjdXRpb24pe1xuICAgICAgICAgICAgcmV0dXJuIDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGlmKGZvckV4ZWN1dGlvbi5kb0V4ZWN1dGUoKSl7XG4gICAgICAgICAgICAgICAgZGVjQ291bnRlcigpO1xuICAgICAgICAgICAgfSAvLyBoYWQgYW4gZXJyb3IuLi5cbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgLy8kJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IoXCJfX2ludGVybmFsX19cIixzd2FybSwgXCJleGNlcHRpb24gaW4gdGhlIGV4ZWN1dGlvbiBvZiB0aGUgam9pbiBmdW5jdGlvbiBvZiBhIHBhcmFsbGVsIHRhc2tcIik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGluY0NvdW50ZXIoKXtcbiAgICAgICAgaWYodGVzdElmVW5kZXJJbnNwZWN0aW9uKCkpe1xuICAgICAgICAgICAgLy9wcmV2ZW50aW5nIGluc3BlY3RvciBmcm9tIGluY3JlYXNpbmcgY291bnRlciB3aGVuIHJlYWRpbmcgdGhlIHZhbHVlcyBmb3IgZGVidWcgcmVhc29uXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwicHJldmVudGluZyBpbnNwZWN0aW9uXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvdW50ZXIrKztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0ZXN0SWZVbmRlckluc3BlY3Rpb24oKXtcbiAgICAgICAgdmFyIHJlcyA9IGZhbHNlO1xuICAgICAgICB2YXIgY29uc3RBcmd2ID0gcHJvY2Vzcy5leGVjQXJndi5qb2luKCk7XG4gICAgICAgIGlmKGNvbnN0QXJndi5pbmRleE9mKFwiaW5zcGVjdFwiKSE9PS0xIHx8IGNvbnN0QXJndi5pbmRleE9mKFwiZGVidWdcIikhPT0tMSl7XG4gICAgICAgICAgICAvL29ubHkgd2hlbiBydW5uaW5nIGluIGRlYnVnXG4gICAgICAgICAgICB2YXIgY2FsbHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gICAgICAgICAgICBpZihjYWxsc3RhY2suaW5kZXhPZihcIkRlYnVnQ29tbWFuZFByb2Nlc3NvclwiKSE9PS0xKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRlYnVnQ29tbWFuZFByb2Nlc3NvciBkZXRlY3RlZCFcIik7XG4gICAgICAgICAgICAgICAgcmVzID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlbmRGb3JTb3VuZEV4ZWN1dGlvbihmdW5jdCwgYXJncywgc3RvcCl7XG4gICAgICAgIHZhciBvYmogPSBuZXcgZXhlY3V0aW9uU3RlcChmdW5jdCwgYXJncywgc3RvcCk7XG4gICAgICAgICQkLlBTS19QdWJTdWIucHVibGlzaChjaGFubmVsSWQsIG9iaik7IC8vIGZvcmNlIGV4ZWN1dGlvbiB0byBiZSBcInNvdW5kXCJcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWNDb3VudGVyKCl7XG4gICAgICAgIGNvdW50ZXItLTtcbiAgICAgICAgaWYoY291bnRlciA9PSAwKSB7XG4gICAgICAgICAgICBhcmdzLnVuc2hpZnQobnVsbCk7XG4gICAgICAgICAgICBzZW5kRm9yU291bmRFeGVjdXRpb24oY2FsbGJhY2ssIGFyZ3MsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBpbm5lciA9IHN3YXJtLmdldElubmVyVmFsdWUoKTtcblxuICAgIGZ1bmN0aW9uIGRlZmF1bHRQcm9ncmVzc1JlcG9ydChlcnIsIHJlcyl7XG4gICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0ZXh0OlwiUGFyYWxsZWwgZXhlY3V0aW9uIHByb2dyZXNzIGV2ZW50XCIsXG4gICAgICAgICAgICBzd2FybTpzd2FybSxcbiAgICAgICAgICAgIGFyZ3M6YXJncyxcbiAgICAgICAgICAgIGN1cnJlbnRSZXN1bHQ6cmVzXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWtGdW5jdGlvbihuYW1lKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3Mpe1xuICAgICAgICAgICAgdmFyIGYgPSBkZWZhdWx0UHJvZ3Jlc3NSZXBvcnQ7XG4gICAgICAgICAgICBpZihuYW1lICE9IFwicHJvZ3Jlc3NcIil7XG4gICAgICAgICAgICAgICAgZiA9IGlubmVyLm15RnVuY3Rpb25zW25hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFyZ3MgPSAkJC5fX2ludGVybi5ta0FyZ3MoYXJncywgMCk7XG4gICAgICAgICAgICBzZW5kRm9yU291bmRFeGVjdXRpb24oZiwgYXJncywgZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuIF9fcHJveHlPYmplY3Q7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wLCByZWNlaXZlcil7XG4gICAgICAgIGlmKGlubmVyLm15RnVuY3Rpb25zLmhhc093blByb3BlcnR5KHByb3ApIHx8IHByb3AgPT0gXCJwcm9ncmVzc1wiKXtcbiAgICAgICAgICAgIGluY0NvdW50ZXIoKTtcbiAgICAgICAgICAgIHJldHVybiBta0Z1bmN0aW9uKHByb3ApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzd2FybVtwcm9wXTtcbiAgICB9O1xuXG4gICAgdmFyIF9fcHJveHlPYmplY3Q7XG5cbiAgICB0aGlzLl9fc2V0UHJveHlPYmplY3QgPSBmdW5jdGlvbihwKXtcbiAgICAgICAgX19wcm94eU9iamVjdCA9IHA7XG4gICAgfVxufVxuXG5leHBvcnRzLmNyZWF0ZUpvaW5Qb2ludCA9IGZ1bmN0aW9uKHN3YXJtLCBjYWxsYmFjaywgYXJncyl7XG4gICAgdmFyIGpwID0gbmV3IFBhcmFsbGVsSm9pblBvaW50KHN3YXJtLCBjYWxsYmFjaywgYXJncyk7XG4gICAgdmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xuICAgIHZhciBwID0gbmV3IFByb3h5KGlubmVyLCBqcCk7XG4gICAganAuX19zZXRQcm94eU9iamVjdChwKTtcbiAgICByZXR1cm4gcDtcbn07IiwiXG5mdW5jdGlvbiBlbmNvZGUoYnVmZmVyKSB7XG4gICAgcmV0dXJuIGJ1ZmZlci50b1N0cmluZygnYmFzZTY0JylcbiAgICAgICAgLnJlcGxhY2UoL1xcKy9nLCAnJylcbiAgICAgICAgLnJlcGxhY2UoL1xcLy9nLCAnJylcbiAgICAgICAgLnJlcGxhY2UoLz0rJC8sICcnKTtcbn07XG5cbmZ1bmN0aW9uIHN0YW1wV2l0aFRpbWUoYnVmLCBzYWx0LCBtc2FsdCl7XG4gICAgaWYoIXNhbHQpe1xuICAgICAgICBzYWx0ID0gMTtcbiAgICB9XG4gICAgaWYoIW1zYWx0KXtcbiAgICAgICAgbXNhbHQgPSAxO1xuICAgIH1cbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlO1xuICAgIHZhciBjdCA9IE1hdGguZmxvb3IoZGF0ZS5nZXRUaW1lKCkgLyBzYWx0KTtcbiAgICB2YXIgY291bnRlciA9IDA7XG4gICAgd2hpbGUoY3QgPiAwICl7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJDb3VudGVyXCIsIGNvdW50ZXIsIGN0KTtcbiAgICAgICAgYnVmW2NvdW50ZXIqbXNhbHRdID0gTWF0aC5mbG9vcihjdCAlIDI1Nik7XG4gICAgICAgIGN0ID0gTWF0aC5mbG9vcihjdCAvIDI1Nik7XG4gICAgICAgIGNvdW50ZXIrKztcbiAgICB9XG59XG5cbi8qXG4gICAgVGhlIHVpZCBjb250YWlucyBhcm91bmQgMjU2IGJpdHMgb2YgcmFuZG9tbmVzcyBhbmQgYXJlIHVuaXF1ZSBhdCB0aGUgbGV2ZWwgb2Ygc2Vjb25kcy4gVGhpcyBVVUlEIHNob3VsZCBieSBjcnlwdG9ncmFwaGljYWxseSBzYWZlIChjYW4gbm90IGJlIGd1ZXNzZWQpXG5cbiAgICBXZSBnZW5lcmF0ZSBhIHNhZmUgVUlEIHRoYXQgaXMgZ3VhcmFudGVlZCB1bmlxdWUgKGJ5IHVzYWdlIG9mIGEgUFJORyB0byBnZW5lYXRlIDI1NiBiaXRzKSBhbmQgdGltZSBzdGFtcGluZyB3aXRoIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyBhdCB0aGUgbW9tZW50IHdoZW4gaXMgZ2VuZXJhdGVkXG4gICAgVGhpcyBtZXRob2Qgc2hvdWxkIGJlIHNhZmUgdG8gdXNlIGF0IHRoZSBsZXZlbCBvZiB2ZXJ5IGxhcmdlIGRpc3RyaWJ1dGVkIHN5c3RlbXMuXG4gICAgVGhlIFVVSUQgaXMgc3RhbXBlZCB3aXRoIHRpbWUgKHNlY29uZHMpOiBkb2VzIGl0IG9wZW4gYSB3YXkgdG8gZ3Vlc3MgdGhlIFVVSUQ/IEl0IGRlcGVuZHMgaG93IHNhZmUgaXMgXCJjcnlwdG9cIiBQUk5HLCBidXQgaXQgc2hvdWxkIGJlIG5vIHByb2JsZW0uLi5cblxuICovXG5cbmV4cG9ydHMuc2FmZV91dWlkID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICByZXF1aXJlKCdjcnlwdG8nKS5yYW5kb21CeXRlcygzNiwgZnVuY3Rpb24gKGVyciwgYnVmKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc3RhbXBXaXRoVGltZShidWYsIDEwMDAsIDMpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCBlbmNvZGUoYnVmKSk7XG4gICAgfSk7XG59XG5cblxuLypcbiAgICBUcnkgdG8gZ2VuZXJhdGUgYSBzbWFsbCBVSUQgdGhhdCBpcyB1bmlxdWUgYWdhaW5zdCBjaGFuY2UgaW4gdGhlIHNhbWUgbWlsbGlzZWNvbmQgc2Vjb25kIGFuZCBpbiBhIHNwZWNpZmljIGNvbnRleHQgKGVnIGluIHRoZSBzYW1lIGNob3Jlb2dyYXBoeSBleGVjdXRpb24pXG4gICAgVGhlIGlkIGNvbnRhaW5zIGFyb3VuZCA2KjggPSA0OCAgYml0cyBvZiByYW5kb21uZXNzIGFuZCBhcmUgdW5pcXVlIGF0IHRoZSBsZXZlbCBvZiBtaWxsaXNlY29uZHNcbiAgICBUaGlzIG1ldGhvZCBpcyBzYWZlIG9uIGEgc2luZ2xlIGNvbXB1dGVyIGJ1dCBzaG91bGQgYmUgdXNlZCB3aXRoIGNhcmUgb3RoZXJ3aXNlXG4gICAgVGhpcyBVVUlEIGlzIG5vdCBjcnlwdG9ncmFwaGljYWxseSBzYWZlIChjYW4gYmUgZ3Vlc3NlZClcbiAqL1xuZXhwb3J0cy5zaG9ydF91dWlkID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICByZXF1aXJlKCdjcnlwdG8nKS5yYW5kb21CeXRlcygxMiwgZnVuY3Rpb24gKGVyciwgYnVmKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc3RhbXBXaXRoVGltZShidWYsMSwyKTtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgZW5jb2RlKGJ1ZikpO1xuICAgIH0pO1xufSIsIlxudmFyIGpvaW5Db3VudGVyID0gMDtcblxuZnVuY3Rpb24gU2VyaWFsSm9pblBvaW50KHN3YXJtLCBjYWxsYmFjaywgYXJncyl7XG5cbiAgICBqb2luQ291bnRlcisrO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBjaGFubmVsSWQgPSBcIlNlcmlhbEpvaW5Qb2ludFwiICsgam9pbkNvdW50ZXI7XG5cbiAgICBpZih0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgICQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihcInVua25vd25cIiwgc3dhcm0sIFwiaW52YWxpZCBmdW5jdGlvbiBnaXZlbiB0byBzZXJpYWwgaW4gc3dhcm1cIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgaW5uZXIgPSBzd2FybS5nZXRJbm5lclZhbHVlKCk7XG5cblxuICAgIGZ1bmN0aW9uIGRlZmF1bHRQcm9ncmVzc1JlcG9ydChlcnIsIHJlcyl7XG4gICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG5cbiAgICB2YXIgZnVuY3Rpb25Db3VudGVyICAgICA9IDA7XG4gICAgdmFyIGV4ZWN1dGlvbkNvdW50ZXIgICAgPSAwO1xuXG4gICAgdmFyIHBsYW5uZWRFeGVjdXRpb25zICAgPSBbXTtcbiAgICB2YXIgcGxhbm5lZEFyZ3VtZW50cyAgICA9IHt9O1xuXG4gICAgZnVuY3Rpb24gbWtGdW5jdGlvbihuYW1lLCBwb3Mpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiQ3JlYXRpbmcgZnVuY3Rpb24gXCIsIG5hbWUsIHBvcyk7XG4gICAgICAgIHBsYW5uZWRBcmd1bWVudHNbcG9zXSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBmdW5jdGlvbiB0cmlnZ2V0TmV4dFN0ZXAoKXtcbiAgICAgICAgICAgIGlmKHBsYW5uZWRFeGVjdXRpb25zLmxlbmd0aCA9PSBleGVjdXRpb25Db3VudGVyIHx8IHBsYW5uZWRBcmd1bWVudHNbZXhlY3V0aW9uQ291bnRlcl0gKSAge1xuICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIucHVibGlzaChjaGFubmVsSWQsIHNlbGYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGYgPSBmdW5jdGlvbiAoLi4uYXJncyl7XG4gICAgICAgICAgICBpZihleGVjdXRpb25Db3VudGVyICE9IHBvcykge1xuICAgICAgICAgICAgICAgIHBsYW5uZWRBcmd1bWVudHNbcG9zXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIkRlbGF5aW5nIGZ1bmN0aW9uOlwiLCBleGVjdXRpb25Db3VudGVyLCBwb3MsIHBsYW5uZWRBcmd1bWVudHMsIGFyZ3VtZW50cywgZnVuY3Rpb25Db3VudGVyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX19wcm94eTtcbiAgICAgICAgICAgIH0gZWxzZXtcbiAgICAgICAgICAgICAgICBpZihwbGFubmVkQXJndW1lbnRzW3Bvc10pe1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiRXhlY3V0aW5nICBmdW5jdGlvbjpcIiwgZXhlY3V0aW9uQ291bnRlciwgcG9zLCBwbGFubmVkQXJndW1lbnRzLCBhcmd1bWVudHMsIGZ1bmN0aW9uQ291bnRlcik7XG5cdFx0XHRcdFx0YXJncyA9IHBsYW5uZWRBcmd1bWVudHNbcG9zXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwbGFubmVkQXJndW1lbnRzW3Bvc10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2V0TmV4dFN0ZXAoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9fcHJveHk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZiA9IGRlZmF1bHRQcm9ncmVzc1JlcG9ydDtcbiAgICAgICAgICAgIGlmKG5hbWUgIT0gXCJwcm9ncmVzc1wiKXtcbiAgICAgICAgICAgICAgICBmID0gaW5uZXIubXlGdW5jdGlvbnNbbmFtZV07XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIGYuYXBwbHkoc2VsZixhcmdzKTtcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgYXJncy51bnNoaWZ0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHN3YXJtLGFyZ3MpOyAvL2Vycm9yXG4gICAgICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIudW5zdWJzY3JpYmUoY2hhbm5lbElkLHJ1bk5leHRGdW5jdGlvbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvL3Rlcm1pbmF0ZSBleGVjdXRpb24gd2l0aCBhbiBlcnJvci4uLiFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4ZWN1dGlvbkNvdW50ZXIrKztcblxuICAgICAgICAgICAgdHJpZ2dldE5leHRTdGVwKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBfX3Byb3h5O1xuICAgICAgICB9O1xuXG4gICAgICAgIHBsYW5uZWRFeGVjdXRpb25zLnB1c2goZik7XG4gICAgICAgIGZ1bmN0aW9uQ291bnRlcisrO1xuICAgICAgICByZXR1cm4gZjtcbiAgICB9XG5cbiAgICAgdmFyIGZpbmlzaGVkID0gZmFsc2U7XG5cbiAgICBmdW5jdGlvbiBydW5OZXh0RnVuY3Rpb24oKXtcbiAgICAgICAgaWYoZXhlY3V0aW9uQ291bnRlciA9PSBwbGFubmVkRXhlY3V0aW9ucy5sZW5ndGggKXtcbiAgICAgICAgICAgIGlmKCFmaW5pc2hlZCl7XG4gICAgICAgICAgICAgICAgYXJncy51bnNoaWZ0KG51bGwpO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHN3YXJtLGFyZ3MpO1xuICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLnVuc3Vic2NyaWJlKGNoYW5uZWxJZCxydW5OZXh0RnVuY3Rpb24pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNlcmlhbCBjb25zdHJ1Y3QgaXMgdXNpbmcgZnVuY3Rpb25zIHRoYXQgYXJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcy4uLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBsYW5uZWRFeGVjdXRpb25zW2V4ZWN1dGlvbkNvdW50ZXJdKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAkJC5QU0tfUHViU3ViLnN1YnNjcmliZShjaGFubmVsSWQscnVuTmV4dEZ1bmN0aW9uKTsgLy8gZm9yY2UgaXQgdG8gYmUgXCJzb3VuZFwiXG5cblxuICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wLCByZWNlaXZlcil7XG4gICAgICAgIGlmKHByb3AgPT0gXCJwcm9ncmVzc1wiIHx8IGlubmVyLm15RnVuY3Rpb25zLmhhc093blByb3BlcnR5KHByb3ApKXtcbiAgICAgICAgICAgIHJldHVybiBta0Z1bmN0aW9uKHByb3AsIGZ1bmN0aW9uQ291bnRlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN3YXJtW3Byb3BdO1xuICAgIH1cblxuICAgIHZhciBfX3Byb3h5O1xuICAgIHRoaXMuc2V0UHJveHlPYmplY3QgPSBmdW5jdGlvbihwKXtcbiAgICAgICAgX19wcm94eSA9IHA7XG4gICAgfVxufVxuXG5leHBvcnRzLmNyZWF0ZVNlcmlhbEpvaW5Qb2ludCA9IGZ1bmN0aW9uKHN3YXJtLCBjYWxsYmFjaywgYXJncyl7XG4gICAgdmFyIGpwID0gbmV3IFNlcmlhbEpvaW5Qb2ludChzd2FybSwgY2FsbGJhY2ssIGFyZ3MpO1xuICAgIHZhciBpbm5lciA9IHN3YXJtLmdldElubmVyVmFsdWUoKTtcbiAgICB2YXIgcCA9IG5ldyBQcm94eShpbm5lciwganApO1xuICAgIGpwLnNldFByb3h5T2JqZWN0KHApO1xuICAgIHJldHVybiBwO1xufSIsImZ1bmN0aW9uIFN3YXJtU3BhY2Uoc3dhcm1UeXBlLCB1dGlscykge1xuXG4gICAgdmFyIGJlZXNIZWFsZXIgPSAkJC5yZXF1aXJlKFwic291bmRwdWJzdWJcIikuYmVlc0hlYWxlcjtcblxuICAgIGZ1bmN0aW9uIGdldEZ1bGxOYW1lKHNob3J0TmFtZSl7XG4gICAgICAgIHZhciBmdWxsTmFtZTtcbiAgICAgICAgaWYoc2hvcnROYW1lICYmIHNob3J0TmFtZS5pbmNsdWRlcyhcIi5cIikpIHtcbiAgICAgICAgICAgIGZ1bGxOYW1lID0gc2hvcnROYW1lO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnVsbE5hbWUgPSAkJC5saWJyYXJ5UHJlZml4ICsgXCIuXCIgKyBzaG9ydE5hbWU7IC8vVE9ETzogY2hlY2sgbW9yZSBhYm91dCAuICE/XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZ1bGxOYW1lO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIFZhckRlc2NyaXB0aW9uKGRlc2Mpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5pdDpmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdG9yZTpmdW5jdGlvbihqc29uU3RyaW5nKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShqc29uU3RyaW5nKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0b0pzb25TdHJpbmc6ZnVuY3Rpb24oeCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gU3dhcm1EZXNjcmlwdGlvbihzd2FybVR5cGVOYW1lLCBkZXNjcmlwdGlvbil7XG5cbiAgICAgICAgc3dhcm1UeXBlTmFtZSA9IGdldEZ1bGxOYW1lKHN3YXJtVHlwZU5hbWUpO1xuXG4gICAgICAgIHZhciBsb2NhbElkID0gMDsgIC8vIHVuaXF1ZSBmb3IgZWFjaCBzd2FybVxuXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZVZhcnMoZGVzY3Ipe1xuICAgICAgICAgICAgdmFyIG1lbWJlcnMgPSB7fTtcbiAgICAgICAgICAgIGZvcih2YXIgdiBpbiBkZXNjcil7XG4gICAgICAgICAgICAgICAgbWVtYmVyc1t2XSA9IG5ldyBWYXJEZXNjcmlwdGlvbihkZXNjclt2XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWVtYmVycztcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZU1lbWJlcnMoZGVzY3Ipe1xuICAgICAgICAgICAgdmFyIG1lbWJlcnMgPSB7fTtcbiAgICAgICAgICAgIGZvcih2YXIgdiBpbiBkZXNjcmlwdGlvbil7XG5cbiAgICAgICAgICAgICAgICBpZih2ICE9IFwicHVibGljXCIgJiYgdiAhPSBcInByaXZhdGVcIil7XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcnNbdl0gPSBkZXNjcmlwdGlvblt2XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWVtYmVycztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwdWJsaWNWYXJzID0gY3JlYXRlVmFycyhkZXNjcmlwdGlvbi5wdWJsaWMpO1xuICAgICAgICB2YXIgcHJpdmF0ZVZhcnMgPSBjcmVhdGVWYXJzKGRlc2NyaXB0aW9uLnByaXZhdGUpO1xuICAgICAgICB2YXIgbXlGdW5jdGlvbnMgPSBjcmVhdGVNZW1iZXJzKGRlc2NyaXB0aW9uKTtcblxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVQaGFzZSh0aGlzSW5zdGFuY2UsIGZ1bmMpe1xuICAgICAgICAgICAgdmFyIHBoYXNlID0gZnVuY3Rpb24oLi4uYXJncyl7XG4gICAgICAgICAgICAgICAgdmFyIHJldDtcbiAgICAgICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIuYmxvY2tDYWxsQmFja3MoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0ID0gZnVuYy5hcHBseSh0aGlzSW5zdGFuY2UsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLnJlbGVhc2VDYWxsQmFja3MoKTtcbiAgICAgICAgICAgICAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgJCQuUFNLX1B1YlN1Yi5yZWxlYXNlQ2FsbEJhY2tzKCk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vZHluYW1pYyBuYW1lZCBmdW5jIGluIG9yZGVyIHRvIGltcHJvdmUgY2FsbHN0YWNrXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocGhhc2UsIFwibmFtZVwiLCB7Z2V0OiBmdW5jdGlvbigpe3JldHVybiBzd2FybVR5cGVOYW1lK1wiLlwiK2Z1bmMubmFtZX19KTtcbiAgICAgICAgICAgIHJldHVybiBwaGFzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5pdGlhbGlzZSA9IGZ1bmN0aW9uKHNlcmlhbGlzZWRWYWx1ZXMpe1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIHB1YmxpY1ZhcnM6e1xuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwcml2YXRlVmFyczp7XG5cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHByb3RlY3RlZFZhcnM6e1xuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBteUZ1bmN0aW9uczp7XG5cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHV0aWxpdHlGdW5jdGlvbnM6e1xuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtZXRhOntcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1UeXBlTmFtZTpzd2FybVR5cGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICBzd2FybURlc2NyaXB0aW9uOmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuXG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gcHVibGljVmFycyl7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1YmxpY1ZhcnNbdl0gPSBwdWJsaWNWYXJzW3ZdLmluaXQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZvcih2YXIgdiBpbiBwcml2YXRlVmFycyl7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnByaXZhdGVWYXJzW3ZdID0gcHJpdmF0ZVZhcnNbdl0uaW5pdCgpO1xuICAgICAgICAgICAgfTtcblxuXG4gICAgICAgICAgICBpZihzZXJpYWxpc2VkVmFsdWVzKXtcbiAgICAgICAgICAgICAgICBiZWVzSGVhbGVyLmpzb25Ub05hdGl2ZShzZXJpYWxpc2VkVmFsdWVzLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmluaXRpYWxpc2VGdW5jdGlvbnMgPSBmdW5jdGlvbih2YWx1ZU9iamVjdCwgdGhpc09iamVjdCl7XG5cbiAgICAgICAgICAgIGZvcih2YXIgdiBpbiBteUZ1bmN0aW9ucyl7XG4gICAgICAgICAgICAgICAgdmFsdWVPYmplY3QubXlGdW5jdGlvbnNbdl0gPSBjcmVhdGVQaGFzZSh0aGlzT2JqZWN0LCBteUZ1bmN0aW9uc1t2XSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsb2NhbElkKys7XG4gICAgICAgICAgICB2YWx1ZU9iamVjdC51dGlsaXR5RnVuY3Rpb25zID0gdXRpbHMuY3JlYXRlRm9yT2JqZWN0KHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0LCBsb2NhbElkKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbih0YXJnZXQsIHByb3BlcnR5LCByZWNlaXZlcil7XG5cblxuICAgICAgICAgICAgaWYocHVibGljVmFycy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5wdWJsaWNWYXJzW3Byb3BlcnR5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYocHJpdmF0ZVZhcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQucHJpdmF0ZVZhcnNbcHJvcGVydHldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0YXJnZXQudXRpbGl0eUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXG4gICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnV0aWxpdHlGdW5jdGlvbnNbcHJvcGVydHldO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGlmKG15RnVuY3Rpb25zLmhhc093blByb3BlcnR5KHByb3BlcnR5KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0Lm15RnVuY3Rpb25zW3Byb3BlcnR5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGFyZ2V0LnByb3RlY3RlZFZhcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQucHJvdGVjdGVkVmFyc1twcm9wZXJ0eV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHR5cGVvZiBwcm9wZXJ0eSAhPSBcInN5bWJvbFwiKSB7XG4gICAgICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKHByb3BlcnR5LCB0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0ID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUsIHJlY2VpdmVyKXtcblxuICAgICAgICAgICAgaWYodGFyZ2V0LnV0aWxpdHlGdW5jdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpIHx8IHRhcmdldC5teUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IocHJvcGVydHkpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRyeWluZyB0byBvdmVyd3JpdGUgaW1tdXRhYmxlIG1lbWJlclwiICsgcHJvcGVydHkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihwcml2YXRlVmFycy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnByaXZhdGVWYXJzW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICBpZihwdWJsaWNWYXJzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQucHVibGljVmFyc1twcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnByb3RlY3RlZFZhcnNbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYXBwbHkgPSBmdW5jdGlvbih0YXJnZXQsIHRoaXNBcmcsIGFyZ3VtZW50c0xpc3Qpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJQcm94eSBhcHBseVwiKTtcbiAgICAgICAgICAgIC8vdmFyIGZ1bmMgPSB0YXJnZXRbXVxuICAgICAgICAgICAgLy9zd2FybUdsb2JhbHMuZXhlY3V0aW9uUHJvdmlkZXIuZXhlY3V0ZShudWxsLCB0aGlzQXJnLCBmdW5jLCBhcmd1bWVudHNMaXN0KVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuaXNFeHRlbnNpYmxlID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5oYXMgPSBmdW5jdGlvbih0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgICAgIGlmKHRhcmdldC5wdWJsaWNWYXJzW3Byb3BdIHx8IHRhcmdldC5wcm90ZWN0ZWRWYXJzW3Byb3BdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vd25LZXlzID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5vd25LZXlzKHRhcmdldC5wdWJsaWNWYXJzKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2VyaWFsaXNlZFZhbHVlcyl7XG4gICAgICAgICAgICB2YXIgdmFsdWVPYmplY3QgPSBzZWxmLmluaXRpYWxpc2Uoc2VyaWFsaXNlZFZhbHVlcyk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IFByb3h5KHZhbHVlT2JqZWN0LHNlbGYpO1xuICAgICAgICAgICAgc2VsZi5pbml0aWFsaXNlRnVuY3Rpb25zKHZhbHVlT2JqZWN0LHJlc3VsdCk7XG4gICAgICAgICAgICBpZighc2VyaWFsaXNlZFZhbHVlcyl7XG4gICAgICAgICAgICAgICAgJCQudWlkR2VuZXJhdG9yLnNhZmVfdXVpZChmdW5jdGlvbiAoZXJyLCByZXN1bHQpe1xuICAgICAgICAgICAgICAgICAgICBpZighdmFsdWVPYmplY3QubWV0YS5zd2FybUlkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1JZCA9IHJlc3VsdDsgIC8vZG8gbm90IG92ZXJ3cml0ZSEhIVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlT2JqZWN0LnV0aWxpdHlGdW5jdGlvbnMubm90aWZ5KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGRlc2NyaXB0aW9ucyA9IHt9O1xuXG4gICAgdGhpcy5kZXNjcmliZSA9IGZ1bmN0aW9uIGRlc2NyaWJlU3dhcm0oc3dhcm1UeXBlTmFtZSwgZGVzY3JpcHRpb24pe1xuICAgICAgICBzd2FybVR5cGVOYW1lID0gZ2V0RnVsbE5hbWUoc3dhcm1UeXBlTmFtZSk7XG5cbiAgICAgICAgdmFyIHBvaW50UG9zID0gc3dhcm1UeXBlTmFtZS5sYXN0SW5kZXhPZignLicpO1xuICAgICAgICB2YXIgc2hvcnROYW1lID0gc3dhcm1UeXBlTmFtZS5zdWJzdHIoIHBvaW50UG9zKyAxKTtcbiAgICAgICAgdmFyIGxpYnJhcnlOYW1lID0gc3dhcm1UeXBlTmFtZS5zdWJzdHIoMCwgcG9pbnRQb3MpO1xuICAgICAgICBpZighbGlicmFyeU5hbWUpe1xuICAgICAgICAgICAgbGlicmFyeU5hbWUgPSBcImdsb2JhbFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRlc2NyaXB0aW9uID0gbmV3IFN3YXJtRGVzY3JpcHRpb24oc3dhcm1UeXBlTmFtZSwgZGVzY3JpcHRpb24pO1xuICAgICAgICBpZihkZXNjcmlwdGlvbnNbc3dhcm1UeXBlTmFtZV0gIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci53YXJuaW5nKFwiRHVwbGljYXRlIHN3YXJtIGRlc2NyaXB0aW9uIFwiKyBzd2FybVR5cGVOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlc2NyaXB0aW9uc1tzd2FybVR5cGVOYW1lXSA9IGRlc2NyaXB0aW9uO1xuXG4gICAgICAgIGlmKCQkLnJlZ2lzdGVyU3dhcm1EZXNjcmlwdGlvbil7XG5cdFx0XHQkJC5yZWdpc3RlclN3YXJtRGVzY3JpcHRpb24obGlicmFyeU5hbWUsIHNob3J0TmFtZSwgc3dhcm1UeXBlTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlc2NyaXB0aW9uO1xuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlU3dhcm0oc3dhcm1UeXBlTmFtZSwgZGVzY3JpcHRpb24sIGluaXRpYWxWYWx1ZXMpe1xuICAgICAgICBzd2FybVR5cGVOYW1lID0gZ2V0RnVsbE5hbWUoc3dhcm1UeXBlTmFtZSk7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGlmKHVuZGVmaW5lZCA9PSBkZXNjcmlwdGlvbil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0aW9uc1tzd2FybVR5cGVOYW1lXShpbml0aWFsVmFsdWVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVzY3JpYmUoc3dhcm1UeXBlTmFtZSwgZGVzY3JpcHRpb24pKGluaXRpYWxWYWx1ZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNyZWF0ZVN3YXJtIGVycm9yXCIsIGVycik7XG4gICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIuZXJyb3IoZXJyLCBhcmd1bWVudHMsIFwiV3JvbmcgbmFtZSBvciBkZXNjcmlwdGlvbnNcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJlc3RhcnQgPSBmdW5jdGlvbihzd2FybVR5cGVOYW1lLCBpbml0aWFsVmFsdWVzKXtcbiAgICAgICAgc3dhcm1UeXBlTmFtZSA9IGdldEZ1bGxOYW1lKHN3YXJtVHlwZU5hbWUpO1xuICAgICAgICB2YXIgZGVzYyA9IGRlc2NyaXB0aW9uc1tzd2FybVR5cGVOYW1lXTtcblxuICAgICAgICBpZihkZXNjKXtcbiAgICAgICAgICAgIHJldHVybiBkZXNjKGluaXRpYWxWYWx1ZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKHN3YXJtVHlwZU5hbWUsaW5pdGlhbFZhbHVlcyxcbiAgICAgICAgICAgICAgICBcIkZhaWxlZCB0byByZXN0YXJ0IGEgc3dhcm0gd2l0aCB0eXBlIFwiICsgc3dhcm1UeXBlTmFtZSArIFwiXFxuIE1heWJlIGRpZmZyZW50IHN3YXJtIHNwYWNlICh1c2VkIGZsb3cgaW5zdGVhZCBvZiBzd2FybSE/KVwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc3RhcnQgPSBmdW5jdGlvbihzd2FybVR5cGVOYW1lLCAuLi5wYXJhbXMpe1xuICAgICAgICBzd2FybVR5cGVOYW1lID0gZ2V0RnVsbE5hbWUoc3dhcm1UeXBlTmFtZSk7XG4gICAgICAgIHZhciBkZXNjID0gZGVzY3JpcHRpb25zW3N3YXJtVHlwZU5hbWVdO1xuICAgICAgICBpZighZGVzYyl7XG4gICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IobnVsbCwgc3dhcm1UeXBlTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzID0gZGVzYygpO1xuXG4gICAgICAgIGlmKHBhcmFtcy5sZW5ndGggPiAxKXtcbiAgICAgICAgICAgIHZhciBhcmdzID1bXTtcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7aSA8IHBhcmFtcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKHBhcmFtc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXMuc3dhcm0uYXBwbHkocmVzLCBhcmdzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxufVxuXG5leHBvcnRzLmNyZWF0ZVN3YXJtRW5naW5lID0gZnVuY3Rpb24oc3dhcm1UeXBlLCB1dGlscyl7XG4gICAgaWYodHlwZW9mIHV0aWxzID09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICB1dGlscyA9IHJlcXVpcmUoXCIuL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvY2FsbGZsb3dcIik7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3dhcm1TcGFjZShzd2FybVR5cGUsIHV0aWxzKTtcbn07IiwiaWYodHlwZW9mIHNpbmdsZXRvbl9jb250YWluZXJfbW9kdWxlX3dvcmthcm91bmRfZm9yX3dpcmVkX25vZGVfanNfY2FjaGluZyA9PSAndW5kZWZpbmVkJykge1xuICAgIHNpbmdsZXRvbl9jb250YWluZXJfbW9kdWxlX3dvcmthcm91bmRfZm9yX3dpcmVkX25vZGVfanNfY2FjaGluZyAgID0gbW9kdWxlO1xufSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHNpbmdsZXRvbl9jb250YWluZXJfbW9kdWxlX3dvcmthcm91bmRfZm9yX3dpcmVkX25vZGVfanNfY2FjaGluZyAuZXhwb3J0cztcbiAgICByZXR1cm4gbW9kdWxlO1xufVxuXG4vKipcbiAqIENyZWF0ZWQgYnkgc2FsYm9haWUgb24gNC8yNy8xNS5cbiAqL1xuZnVuY3Rpb24gQ29udGFpbmVyKGVycm9ySGFuZGxlcil7XG4gICAgdmFyIHRoaW5ncyA9IHt9OyAgICAgICAgLy90aGUgYWN0dWFsIHZhbHVlcyBmb3Igb3VyIHNlcnZpY2VzLCB0aGluZ3NcbiAgICB2YXIgaW1tZWRpYXRlID0ge307ICAgICAvL2hvdyBkZXBlbmRlbmNpZXMgd2VyZSBkZWNsYXJlZFxuICAgIHZhciBjYWxsYmFja3MgPSB7fTsgICAgIC8vY2FsbGJhY2sgdGhhdCBzaG91bGQgYmUgY2FsbGVkIGZvciBlYWNoIGRlcGVuZGVuY3kgZGVjbGFyYXRpb25cbiAgICB2YXIgZGVwc0NvdW50ZXIgPSB7fTsgICAvL2NvdW50IGRlcGVuZGVuY2llc1xuICAgIHZhciByZXZlcnNlZFRyZWUgPSB7fTsgIC8vcmV2ZXJzZWQgZGVwZW5kZW5jaWVzLCBvcHBvc2l0ZSBvZiBpbW1lZGlhdGUgb2JqZWN0XG5cbiAgICAgdGhpcy5kdW1wID0gZnVuY3Rpb24oKXtcbiAgICAgICAgIGNvbnNvbGUubG9nKFwiQ29uYXRpbmVyIGR1bXBcXG4gVGhpbmdzOlwiLCB0aGluZ3MsIFwiXFxuRGVwcyBjb3VudGVyOiBcIiwgZGVwc0NvdW50ZXIsIFwiXFxuU3RyaWdodDpcIiwgaW1tZWRpYXRlLCBcIlxcblJldmVyc2VkOlwiLCByZXZlcnNlZFRyZWUpO1xuICAgICB9XG5cbiAgICBmdW5jdGlvbiBpbmNDb3VudGVyKG5hbWUpe1xuICAgICAgICBpZighZGVwc0NvdW50ZXJbbmFtZV0pe1xuICAgICAgICAgICAgZGVwc0NvdW50ZXJbbmFtZV0gPSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVwc0NvdW50ZXJbbmFtZV0rKztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc2VydERlcGVuZGVuY3lpblJUKG5vZGVOYW1lLCBkZXBlbmRlbmNpZXMpe1xuICAgICAgICBkZXBlbmRlbmNpZXMuZm9yRWFjaChmdW5jdGlvbihpdGVtTmFtZSl7XG4gICAgICAgICAgICB2YXIgbCA9IHJldmVyc2VkVHJlZVtpdGVtTmFtZV07XG4gICAgICAgICAgICBpZighbCl7XG4gICAgICAgICAgICAgICAgbCA9IHJldmVyc2VkVHJlZVtpdGVtTmFtZV0gPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxbbm9kZU5hbWVdID0gbm9kZU5hbWU7XG4gICAgICAgIH0pXG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBkaXNjb3ZlclVwTm9kZXMobm9kZU5hbWUpe1xuICAgICAgICB2YXIgcmVzID0ge307XG5cbiAgICAgICAgZnVuY3Rpb24gREZTKG5uKXtcbiAgICAgICAgICAgIHZhciBsID0gcmV2ZXJzZWRUcmVlW25uXTtcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiBsKXtcbiAgICAgICAgICAgICAgICBpZighcmVzW2ldKXtcbiAgICAgICAgICAgICAgICAgICAgcmVzW2ldID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgREZTKGkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIERGUyhub2RlTmFtZSk7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhyZXMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0Q291bnRlcihuYW1lKXtcbiAgICAgICAgdmFyIGRlcGVuZGVuY3lBcnJheSA9IGltbWVkaWF0ZVtuYW1lXTtcbiAgICAgICAgdmFyIGNvdW50ZXIgPSAwO1xuICAgICAgICBpZihkZXBlbmRlbmN5QXJyYXkpe1xuICAgICAgICAgICAgZGVwZW5kZW5jeUFycmF5LmZvckVhY2goZnVuY3Rpb24oZGVwKXtcbiAgICAgICAgICAgICAgICBpZih0aGluZ3NbZGVwXSA9PSBudWxsKXtcbiAgICAgICAgICAgICAgICAgICAgaW5jQ291bnRlcihuYW1lKVxuICAgICAgICAgICAgICAgICAgICBjb3VudGVyKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBkZXBzQ291bnRlcltuYW1lXSA9IGNvdW50ZXI7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJDb3VudGVyIGZvciBcIiwgbmFtZSwgJyBpcyAnLCBjb3VudGVyKTtcbiAgICAgICAgcmV0dXJuIGNvdW50ZXI7XG4gICAgfVxuXG4gICAgLyogcmV0dXJucyB0aG9zZSB0aGF0IGFyZSByZWFkeSB0byBiZSByZXNvbHZlZCovXG4gICAgZnVuY3Rpb24gcmVzZXRVcENvdW50ZXJzKG5hbWUpe1xuICAgICAgICB2YXIgcmV0ID0gW107XG4gICAgICAgIC8vY29uc29sZS5sb2coJ1Jlc2V0aW5nIHVwIGNvdW50ZXJzIGZvciAnLCBuYW1lLCBcIlJldmVyc2U6XCIsIHJldmVyc2VkVHJlZVtuYW1lXSk7XG4gICAgICAgIHZhciB1cHMgPSByZXZlcnNlZFRyZWVbbmFtZV07XG4gICAgICAgIGZvcih2YXIgdiBpbiB1cHMpe1xuICAgICAgICAgICAgaWYocmVzZXRDb3VudGVyKHYpID09IDApe1xuICAgICAgICAgICAgICAgIHJldC5wdXNoKHYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgLypcbiAgICAgICAgIFRoZSBmaXJzdCBhcmd1bWVudCBpcyBhIG5hbWUgZm9yIGEgc2VydmljZSwgdmFyaWFibGUsYSAgdGhpbmcgdGhhdCBzaG91bGQgYmUgaW5pdGlhbGlzZWQsIHJlY3JlYXRlZCwgZXRjXG4gICAgICAgICBUaGUgc2Vjb25kIGFyZ3VtZW50IGlzIGFuIGFycmF5IHdpdGggZGVwZW5kZW5jaWVzXG4gICAgICAgICB0aGUgbGFzdCBhcmd1bWVudCBpcyBhIGZ1bmN0aW9uKGVyciwuLi4pIHRoYXQgaXMgY2FsbGVkIHdoZW4gZGVwZW5kZW5jaWVzIGFyZSByZWFkeSBvciByZWNhbGxlZCB3aGVuIGFyZSBub3QgcmVhZHkgKHN0b3Agd2FzIGNhbGxlZClcbiAgICAgICAgIElmIGVyciBpcyBub3QgdW5kZWZpbmVkIGl0IG1lYW5zIHRoYXQgb25lIG9yIGFueSB1bmRlZmluZWQgdmFyaWFibGVzIGFyZSBub3QgcmVhZHkgYW5kIHRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBhZ2FpbiBsYXRlclxuICAgICAgICAgQWxsIHRoZSBvdGhlciBhcmd1bWVudHMgYXJlIHRoZSBjb3JyZXNwb25kaW5nIGFyZ3VtZW50cyBvZiB0aGUgY2FsbGJhY2sgd2lsbCBiZSB0aGUgYWN0dWFsIHZhbHVlcyBvZiB0aGUgY29ycmVzcG9uZGluZyBkZXBlbmRlbmN5XG4gICAgICAgICBUaGUgY2FsbGJhY2sgZnVuY3Rpb25zIHNob3VsZCByZXR1cm4gdGhlIGN1cnJlbnQgdmFsdWUgKG9yIG51bGwpXG4gICAgICovXG4gICAgdGhpcy5kZWNsYXJlRGVwZW5kZW5jeSA9IGZ1bmN0aW9uKG5hbWUsIGRlcGVuZGVuY3lBcnJheSwgY2FsbGJhY2spe1xuICAgICAgICBpZihjYWxsYmFja3NbbmFtZV0pe1xuICAgICAgICAgICAgZXJyb3JIYW5kbGVyLmlnbm9yZVBvc3NpYmxlRXJyb3IoXCJEdXBsaWNhdGUgZGVwZW5kZW5jeTpcIiArIG5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2tzW25hbWVdID0gY2FsbGJhY2s7XG4gICAgICAgICAgICBpbW1lZGlhdGVbbmFtZV0gICA9IGRlcGVuZGVuY3lBcnJheTtcbiAgICAgICAgICAgIGluc2VydERlcGVuZGVuY3lpblJUKG5hbWUsIGRlcGVuZGVuY3lBcnJheSk7XG4gICAgICAgICAgICB0aGluZ3NbbmFtZV0gPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHVuc2F0aXNmaWVkQ291bnRlciA9IHJlc2V0Q291bnRlcihuYW1lKTtcbiAgICAgICAgaWYodW5zYXRpc2ZpZWRDb3VudGVyID09IDAgKXtcbiAgICAgICAgICAgIGNhbGxGb3JUaGluZyhuYW1lLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsRm9yVGhpbmcobmFtZSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qXG4gICAgICAgIGNyZWF0ZSBhIHNlcnZpY2VcbiAgICAgKi9cbiAgICB0aGlzLnNlcnZpY2UgPSBmdW5jdGlvbihuYW1lLCBkZXBlbmRlbmN5QXJyYXksIGNvbnN0cnVjdG9yKXtcbiAgICAgICAgdGhpcy5kZWNsYXJlRGVwZW5kZW5jeShuYW1lLCBkZXBlbmRlbmN5QXJyYXksIGNvbnN0cnVjdG9yKTtcbiAgICB9XG5cblxuICAgIHZhciBzdWJzeXN0ZW1Db3VudGVyID0gMDtcbiAgICAvKlxuICAgICBjcmVhdGUgYSBhbm9ueW1vdXMgc3Vic3lzdGVtXG4gICAgICovXG4gICAgdGhpcy5zdWJzeXN0ZW0gPSBmdW5jdGlvbihkZXBlbmRlbmN5QXJyYXksIGNvbnN0cnVjdG9yKXtcbiAgICAgICAgc3Vic3lzdGVtQ291bnRlcisrO1xuICAgICAgICB0aGlzLmRlY2xhcmVEZXBlbmRlbmN5KFwiZGljb250YWluZXJfc3Vic3lzdGVtX3BsYWNlaG9sZGVyXCIgKyBzdWJzeXN0ZW1Db3VudGVyLCBkZXBlbmRlbmN5QXJyYXksIGNvbnN0cnVjdG9yKTtcbiAgICB9XG5cbiAgICAvKiBub3QgZG9jdW1lbnRlZC4uIGxpbWJvIHN0YXRlKi9cbiAgICB0aGlzLmZhY3RvcnkgPSBmdW5jdGlvbihuYW1lLCBkZXBlbmRlbmN5QXJyYXksIGNvbnN0cnVjdG9yKXtcbiAgICAgICAgdGhpcy5kZWNsYXJlRGVwZW5kZW5jeShuYW1lLCBkZXBlbmRlbmN5QXJyYXksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGNvbnN0cnVjdG9yKClcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FsbEZvclRoaW5nKG5hbWUsIG91dE9mU2VydmljZSl7XG4gICAgICAgIHZhciBhcmdzID0gaW1tZWRpYXRlW25hbWVdLm1hcChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICAgIHJldHVybiB0aGluZ3NbaXRlbV07XG4gICAgICAgIH0pO1xuICAgICAgICBhcmdzLnVuc2hpZnQob3V0T2ZTZXJ2aWNlKTtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gY2FsbGJhY2tzW25hbWVdLmFwcGx5KHt9LGFyZ3MpO1xuICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICBlcnJvckhhbmRsZXIudGhyb3dFcnJvcihlcnIpO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZihvdXRPZlNlcnZpY2UgfHwgdmFsdWU9PT1udWxsKXsgICAvL2VuYWJsZSByZXR1cm5pbmcgYSB0ZW1wb3JhcnkgZGVwZW5kZW5jeSByZXNvbHV0aW9uIVxuICAgICAgICAgICAgaWYodGhpbmdzW25hbWVdKXtcbiAgICAgICAgICAgICAgICB0aGluZ3NbbmFtZV0gPSBudWxsO1xuICAgICAgICAgICAgICAgIHJlc2V0VXBDb3VudGVycyhuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJTdWNjZXNzIHJlc29sdmluZyBcIiwgbmFtZSwgXCI6XCIsIHZhbHVlLCBcIk90aGVyIHJlYWR5OlwiLCBvdGhlclJlYWR5KTtcbiAgICAgICAgICAgIGlmKCF2YWx1ZSl7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSAge1wicGxhY2Vob2xkZXJcIjogbmFtZX07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGluZ3NbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIHZhciBvdGhlclJlYWR5ID0gcmVzZXRVcENvdW50ZXJzKG5hbWUpO1xuICAgICAgICAgICAgb3RoZXJSZWFkeS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgICAgICAgIGNhbGxGb3JUaGluZyhpdGVtLCBmYWxzZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgICAgIERlY2xhcmUgdGhhdCBhIG5hbWUgaXMgcmVhZHksIHJlc29sdmVkIGFuZCBzaG91bGQgdHJ5IHRvIHJlc29sdmUgYWxsIG90aGVyIHdhaXRpbmcgZm9yIGl0XG4gICAgICovXG4gICAgdGhpcy5yZXNvbHZlICAgID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpe1xuICAgICAgICB0aGluZ3NbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgdmFyIG90aGVyUmVhZHkgPSByZXNldFVwQ291bnRlcnMobmFtZSk7XG5cbiAgICAgICAgb3RoZXJSZWFkeS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgICAgY2FsbEZvclRoaW5nKGl0ZW0sIGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuXG5cbiAgICB0aGlzLmluc3RhbmNlRmFjdG9yeSA9IGZ1bmN0aW9uKG5hbWUsIGRlcGVuZGVuY3lBcnJheSwgY29uc3RydWN0b3Ipe1xuICAgICAgICBlcnJvckhhbmRsZXIubm90SW1wbGVtZW50ZWQoXCJpbnN0YW5jZUZhY3RvcnkgaXMgcGxhbm5lZCBidXQgbm90IGltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIC8qXG4gICAgICAgIERlY2xhcmUgdGhhdCBhIHNlcnZpY2Ugb3IgZmVhdHVyZSBpcyBub3Qgd29ya2luZyBwcm9wZXJseS4gQWxsIHNlcnZpY2VzIGRlcGVuZGluZyBvbiB0aGlzIHdpbGwgZ2V0IG5vdGlmaWVkXG4gICAgICovXG4gICAgdGhpcy5vdXRPZlNlcnZpY2UgICAgPSBmdW5jdGlvbihuYW1lKXtcbiAgICAgICAgdGhpbmdzW25hbWVdID0gbnVsbDtcbiAgICAgICAgdmFyIHVwTm9kZXMgPSBkaXNjb3ZlclVwTm9kZXMobmFtZSk7XG4gICAgICAgIHVwTm9kZXMuZm9yRWFjaChmdW5jdGlvbihub2RlKXtcbiAgICAgICAgICAgIHRoaW5nc1tuYW1lXSA9IG51bGw7XG4gICAgICAgICAgICBjYWxsRm9yVGhpbmcobm9kZSwgdHJ1ZSk7XG4gICAgICAgIH0pXG4gICAgfVxufVxuXG5cbmV4cG9ydHMubmV3Q29udGFpbmVyICAgID0gZnVuY3Rpb24oY2hlY2tzTGlicmFyeSl7XG4gICAgcmV0dXJuIG5ldyBDb250YWluZXIoY2hlY2tzTGlicmFyeSk7XG59XG5cbi8vZXhwb3J0cy5jb250YWluZXIgPSBuZXcgQ29udGFpbmVyKCQkLmVycm9ySGFuZGxlcik7XG4iLCJcbi8qKlxuICogR2VuZXJpYyBmdW5jdGlvbiB1c2VkIHRvIHJlZ2lzdGVycyBtZXRob2RzIHN1Y2ggYXMgYXNzZXJ0cywgbG9nZ2luZywgZXRjLiBvbiB0aGUgY3VycmVudCBjb250ZXh0LlxuICogQHBhcmFtIG5hbWUge1N0cmluZyl9IC0gbmFtZSBvZiB0aGUgbWV0aG9kICh1c2UgY2FzZSkgdG8gYmUgcmVnaXN0ZXJlZC5cbiAqIEBwYXJhbSBmdW5jIHtGdW5jdGlvbn0gLSBoYW5kbGVyIHRvIGJlIGludm9rZWQuXG4gKiBAcGFyYW0gcGFyYW1zRGVzY3JpcHRpb24ge09iamVjdH0gLSBwYXJhbWV0ZXJzIGRlc2NyaXB0aW9uc1xuICogQHBhcmFtIGFmdGVyIHtGdW5jdGlvbn0gLSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgYWZ0ZXIgdGhlIGZ1bmN0aW9uIGhhcyBiZWVuIGV4ZWN1dGVkLlxuICovXG5mdW5jdGlvbiBhZGRVc2VDYXNlKG5hbWUsIGZ1bmMsIHBhcmFtc0Rlc2NyaXB0aW9uLCBhZnRlcil7XG4gICAgdmFyIG5ld0Z1bmMgPSBmdW5jO1xuICAgIGlmKHR5cGVvZiBhZnRlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIG5ld0Z1bmMgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGV0IGFyZ3MgPSBBcnJheS5mcm9tKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgYWZ0ZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNvbWUgcHJvcGVydGllcyBzaG91bGQgbm90IGJlIG92ZXJyaWRkZW5cbiAgICBjb25zdCBwcm90ZWN0ZWRQcm9wZXJ0aWVzID0gWydhZGRDaGVjaycsICdhZGRDYXNlJywgJ3JlZ2lzdGVyJ107XG4gICAgaWYocHJvdGVjdGVkUHJvcGVydGllcy5pbmRleE9mKG5hbWUpID09PSAtMSl7XG4gICAgICAgIHRoaXNbbmFtZV0gPSBuZXdGdW5jO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FudCBvdmVyd3JpdGUgJyArIG5hbWUpO1xuICAgIH1cblxuICAgIGlmKHBhcmFtc0Rlc2NyaXB0aW9uKXtcbiAgICAgICAgdGhpcy5wYXJhbXNbbmFtZV0gPSBwYXJhbXNEZXNjcmlwdGlvbjtcbiAgICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhbGlhcyB0byBhbiBleGlzdGluZyBmdW5jdGlvbi5cbiAqIEBwYXJhbSBuYW1lMSB7U3RyaW5nfSAtIE5ldyBmdW5jdGlvbiBuYW1lLlxuICogQHBhcmFtIG5hbWUyIHtTdHJpbmd9IC0gRXhpc3RpbmcgZnVuY3Rpb24gbmFtZS5cbiAqL1xuZnVuY3Rpb24gYWxpYXMobmFtZTEsIG5hbWUyKXtcbiAgICB0aGlzW25hbWUxXSA9IHRoaXNbbmFtZTJdO1xufVxuXG4vKipcbiAqIFNpbmdsZXRvbiBmb3IgYWRkaW5nIHZhcmlvdXMgZnVuY3Rpb25zIGZvciB1c2UgY2FzZXMgcmVnYXJkaW5nIGxvZ2dpbmcuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gTG9nc0NvcmUoKXtcbiAgICB0aGlzLnBhcmFtcyA9IHt9O1xufVxuXG4vKipcbiAqIFNpbmdsZXRvbiBmb3IgYWRkaW5nIHlvdXIgdmFyaW91cyBmdW5jdGlvbnMgZm9yIGFzc2VydHMuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gQXNzZXJ0Q29yZSgpe1xuICAgIHRoaXMucGFyYW1zID0ge307XG59XG5cbi8qKlxuICogU2luZ2xldG9uIGZvciBhZGRpbmcgeW91ciB2YXJpb3VzIGZ1bmN0aW9ucyBmb3IgY2hlY2tzLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIENoZWNrQ29yZSgpe1xuICAgIHRoaXMucGFyYW1zID0ge307XG59XG5cbi8qKlxuICogU2luZ2xldG9uIGZvciBhZGRpbmcgeW91ciB2YXJpb3VzIGZ1bmN0aW9ucyBmb3IgZ2VuZXJhdGluZyBleGNlcHRpb25zLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEV4Y2VwdGlvbnNDb3JlKCl7XG4gICAgdGhpcy5wYXJhbXMgPSB7fTtcbn1cblxuLyoqXG4gKiBTaW5nbGV0b24gZm9yIGFkZGluZyB5b3VyIHZhcmlvdXMgZnVuY3Rpb25zIGZvciBydW5uaW5nIHRlc3RzLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFRlc3RSdW5uZXJDb3JlKCl7XG59XG5cbkxvZ3NDb3JlLnByb3RvdHlwZS5hZGRDYXNlICAgICAgICAgICA9IGFkZFVzZUNhc2U7XG5Bc3NlcnRDb3JlLnByb3RvdHlwZS5hZGRDaGVjayAgICAgICAgPSBhZGRVc2VDYXNlO1xuQ2hlY2tDb3JlLnByb3RvdHlwZS5hZGRDaGVjayAgICAgICAgID0gYWRkVXNlQ2FzZTtcbkV4Y2VwdGlvbnNDb3JlLnByb3RvdHlwZS5yZWdpc3RlciAgICA9IGFkZFVzZUNhc2U7XG5cbkxvZ3NDb3JlLnByb3RvdHlwZS5hbGlhcyAgICAgICAgICAgICA9IGFsaWFzO1xuQXNzZXJ0Q29yZS5wcm90b3R5cGUuYWxpYXMgICAgICAgICAgID0gYWxpYXM7XG5DaGVja0NvcmUucHJvdG90eXBlLmFsaWFzICAgICAgICAgICAgPSBhbGlhcztcbkV4Y2VwdGlvbnNDb3JlLnByb3RvdHlwZS5hbGlhcyAgICAgICA9IGFsaWFzO1xuXG4vLyBDcmVhdGUgbW9kdWxlc1xudmFyIGFzc2VydE9iaiAgICAgICA9IG5ldyBBc3NlcnRDb3JlKCk7XG52YXIgY2hlY2tPYmogICAgICAgID0gbmV3IENoZWNrQ29yZSgpO1xudmFyIGV4Y2VwdGlvbnNPYmogICA9IG5ldyBFeGNlcHRpb25zQ29yZSgpO1xudmFyIGxvZ2dlck9iaiAgICAgICA9IG5ldyBMb2dzQ29yZSgpO1xudmFyIHRlc3RSdW5uZXJPYmogICA9IG5ldyBUZXN0UnVubmVyQ29yZSgpO1xuXG4vLyBFeHBvcnQgbW9kdWxlc1xuZXhwb3J0cy5hc3NlcnQgICAgICA9IGFzc2VydE9iajtcbmV4cG9ydHMuY2hlY2sgICAgICAgPSBjaGVja09iajtcbmV4cG9ydHMuZXhjZXB0aW9ucyAgPSBjaGVja09iajtcbmV4cG9ydHMuZXhjZXB0aW9ucyAgPSBleGNlcHRpb25zT2JqO1xuZXhwb3J0cy5sb2dnZXIgICAgICA9IGxvZ2dlck9iajtcbmV4cG9ydHMudGVzdFJ1bm5lciAgPSB0ZXN0UnVubmVyT2JqO1xuXG4vLyBJbml0aWFsaXNlIG1vZHVsZXNcbnJlcXVpcmUoXCIuL3N0YW5kYXJkQXNzZXJ0cy5qc1wiKS5pbml0KGV4cG9ydHMpO1xucmVxdWlyZShcIi4vc3RhbmRhcmRMb2dzLmpzXCIpLmluaXQoZXhwb3J0cyk7XG5yZXF1aXJlKFwiLi9zdGFuZGFyZEV4Y2VwdGlvbnMuanNcIikuaW5pdChleHBvcnRzKTtcbnJlcXVpcmUoXCIuL3N0YW5kYXJkQ2hlY2tzLmpzXCIpLmluaXQoZXhwb3J0cyk7XG5yZXF1aXJlKFwiLi90ZXN0UnVubmVyLmpzXCIpLmluaXQoZXhwb3J0cyk7XG5cbi8vIEdsb2JhbCBVbmNhdWdodCBFeGNlcHRpb24gaGFuZGxlci5cbmlmKHByb2Nlc3Mub24pXG57XG4gICAgcHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0bGV0IHRhZyA9IFwidW5jYXVnaHRFeGNlcHRpb25cIjtcblx0XHRjb25zb2xlLmxvZyh0YWcsIGVycik7XG5cdFx0Y29uc29sZS5sb2codGFnLCBlcnIuc3RhY2spO1xuXHR9KTtcbn0iLCJ2YXIgbG9nZ2VyID0gcmVxdWlyZShcIi4vY2hlY2tzQ29yZS5qc1wiKS5sb2dnZXI7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNmKXtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGhhbmRsZXIgZm9yIGZhaWxlZCBhc3NlcnRzLiBUaGUgaGFuZGxlciBpcyBkb2luZyBsb2dnaW5nIGFuZCBpcyB0aHJvd2luZyBhbiBlcnJvci5cbiAgICAgKiBAcGFyYW0gZXhwbGFuYXRpb24ge1N0cmluZ30gLSBmYWlsaW5nIHJlYXNvbiBtZXNzYWdlLlxuICAgICAqL1xuICAgIHNmLmV4Y2VwdGlvbnMucmVnaXN0ZXIoJ2Fzc2VydEZhaWwnLCBmdW5jdGlvbihleHBsYW5hdGlvbil7XG4gICAgICAgIGxldCBtZXNzYWdlID0gXCJBc3NlcnQgb3IgaW52YXJpYW50IGhhcyBmYWlsZWQgXCIgKyAoZXhwbGFuYXRpb24gPyBleHBsYW5hdGlvbiA6IFwiXCIpO1xuICAgICAgICBsZXQgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgICAgICBsb2dnZXIucmVjb3JkQXNzZXJ0KCdbRmFpbF0gJyArIG1lc3NhZ2UsIGVyciwgdHJ1ZSk7XG4gICAgICAgIHRocm93IGVyclxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgYXNzZXJ0IGZvciBlcXVhbGl0eS4gSWYgY2hlY2sgZmFpbHMsIHRoZSBhc3NlcnRGYWlsIGlzIGludm9rZWQuXG4gICAgICogQHBhcmFtIHYxIHtTdHJpbmd8TnVtYmVyfE9iamVjdH0gLSBmaXJzdCB2YWx1ZVxuICAgICAqIEBwYXJhbSB2MSB7U3RyaW5nfE51bWJlcnxPYmplY3R9IC0gc2Vjb25kIHZhbHVlXG4gICAgICogQHBhcmFtIGV4cGxhbmF0aW9uIHtTdHJpbmd9IC0gZmFpbGluZyByZWFzb24gbWVzc2FnZSBpbiBjYXNlIHRoZSBhc3NlcnQgZmFpbHMuXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFkZENoZWNrKCdlcXVhbCcsIGZ1bmN0aW9uKHYxICwgdjIsIGV4cGxhbmF0aW9uKXtcbiAgICAgICAgaWYodjEgIT09IHYyKXtcbiAgICAgICAgICAgIGlmKCFleHBsYW5hdGlvbil7XG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb24gPSAgXCJBc3NlcnRpb24gZmFpbGVkOiBbXCIgKyB2MSArIFwiICE9PSBcIiArIHYyICsgXCJdXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZi5leGNlcHRpb25zLmFzc2VydEZhaWwoZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBhc3NlcnQgZm9yIGluZXF1YWxpdHkuIElmIGNoZWNrIGZhaWxzLCB0aGUgYXNzZXJ0RmFpbCBpcyBpbnZva2VkLlxuICAgICAqIEBwYXJhbSB2MSB7U3RyaW5nfE51bWJlcnxPYmplY3R9IC0gZmlyc3QgdmFsdWVcbiAgICAgKiBAcGFyYW0gdjEge1N0cmluZ3xOdW1iZXJ8T2JqZWN0fSAtIHNlY29uZCB2YWx1ZVxuICAgICAqIEBwYXJhbSBleHBsYW5hdGlvbiB7U3RyaW5nfSAtIGZhaWxpbmcgcmVhc29uIG1lc3NhZ2UgaW4gY2FzZSB0aGUgYXNzZXJ0IGZhaWxzXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFkZENoZWNrKCdub3RFcXVhbCcsIGZ1bmN0aW9uKHYxLCB2MiwgZXhwbGFuYXRpb24pe1xuICAgICAgICBpZih2MSA9PT0gdjIpe1xuICAgICAgICAgICAgaWYoIWV4cGxhbmF0aW9uKXtcbiAgICAgICAgICAgICAgICBleHBsYW5hdGlvbiA9ICBcIiBbXCIrIHYxICsgXCIgPT0gXCIgKyB2MiArIFwiXVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2YuZXhjZXB0aW9ucy5hc3NlcnRGYWlsKGV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgYXNzZXJ0IGZvciBldmFsdWF0aW5nIGFuIGV4cHJlc3Npb24gdG8gdHJ1ZS4gSWYgY2hlY2sgZmFpbHMsIHRoZSBhc3NlcnRGYWlsIGlzIGludm9rZWQuXG4gICAgICogQHBhcmFtIGIge0Jvb2xlYW59IC0gcmVzdWx0IG9mIGFuIGV4cHJlc3Npb25cbiAgICAgKiBAcGFyYW0gZXhwbGFuYXRpb24ge1N0cmluZ30gLSBmYWlsaW5nIHJlYXNvbiBtZXNzYWdlIGluIGNhc2UgdGhlIGFzc2VydCBmYWlsc1xuICAgICAqL1xuICAgIHNmLmFzc2VydC5hZGRDaGVjaygndHJ1ZScsIGZ1bmN0aW9uKGIsIGV4cGxhbmF0aW9uKXtcbiAgICAgICAgaWYoIWIpe1xuICAgICAgICAgICAgaWYoIWV4cGxhbmF0aW9uKXtcbiAgICAgICAgICAgICAgICBleHBsYW5hdGlvbiA9ICBcIiBleHByZXNzaW9uIGlzIGZhbHNlIGJ1dCBpcyBleHBlY3RlZCB0byBiZSB0cnVlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZi5leGNlcHRpb25zLmFzc2VydEZhaWwoZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBhc3NlcnQgZm9yIGV2YWx1YXRpbmcgYW4gZXhwcmVzc2lvbiB0byBmYWxzZS4gSWYgY2hlY2sgZmFpbHMsIHRoZSBhc3NlcnRGYWlsIGlzIGludm9rZWQuXG4gICAgICogQHBhcmFtIGIge0Jvb2xlYW59IC0gcmVzdWx0IG9mIGFuIGV4cHJlc3Npb25cbiAgICAgKiBAcGFyYW0gZXhwbGFuYXRpb24ge1N0cmluZ30gLSBmYWlsaW5nIHJlYXNvbiBtZXNzYWdlIGluIGNhc2UgdGhlIGFzc2VydCBmYWlsc1xuICAgICAqL1xuICAgIHNmLmFzc2VydC5hZGRDaGVjaygnZmFsc2UnLCBmdW5jdGlvbihiLCBleHBsYW5hdGlvbil7XG4gICAgICAgIGlmKGIpe1xuICAgICAgICAgICAgaWYoIWV4cGxhbmF0aW9uKXtcbiAgICAgICAgICAgICAgICBleHBsYW5hdGlvbiA9ICBcIiBleHByZXNzaW9uIGlzIHRydWUgYnV0IGlzIGV4cGVjdGVkIHRvIGJlIGZhbHNlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZi5leGNlcHRpb25zLmFzc2VydEZhaWwoZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBhc3NlcnQgZm9yIGV2YWx1YXRpbmcgYSB2YWx1ZSB0byBudWxsLiBJZiBjaGVjayBmYWlscywgdGhlIGFzc2VydEZhaWwgaXMgaW52b2tlZC5cbiAgICAgKiBAcGFyYW0gYiB7Qm9vbGVhbn0gLSByZXN1bHQgb2YgYW4gZXhwcmVzc2lvblxuICAgICAqIEBwYXJhbSBleHBsYW5hdGlvbiB7U3RyaW5nfSAtIGZhaWxpbmcgcmVhc29uIG1lc3NhZ2UgaW4gY2FzZSB0aGUgYXNzZXJ0IGZhaWxzXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFkZENoZWNrKCdpc051bGwnLCBmdW5jdGlvbih2MSwgZXhwbGFuYXRpb24pe1xuICAgICAgICBpZih2MSAhPT0gbnVsbCl7XG4gICAgICAgICAgICBzZi5leGNlcHRpb25zLmFzc2VydEZhaWwoZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBhc3NlcnQgZm9yIGV2YWx1YXRpbmcgYSB2YWx1ZSB0byBiZSBub3QgbnVsbC4gSWYgY2hlY2sgZmFpbHMsIHRoZSBhc3NlcnRGYWlsIGlzIGludm9rZWQuXG4gICAgICogQHBhcmFtIGIge0Jvb2xlYW59IC0gcmVzdWx0IG9mIGFuIGV4cHJlc3Npb25cbiAgICAgKiBAcGFyYW0gZXhwbGFuYXRpb24ge1N0cmluZ30gLSBmYWlsaW5nIHJlYXNvbiBtZXNzYWdlIGluIGNhc2UgdGhlIGFzc2VydCBmYWlsc1xuICAgICAqL1xuICAgIHNmLmFzc2VydC5hZGRDaGVjaygnbm90TnVsbCcsIGZ1bmN0aW9uKHYxICwgZXhwbGFuYXRpb24pe1xuICAgICAgICBpZih2MSA9PT0gbnVsbCAmJiB0eXBlb2YgdjEgPT09IFwib2JqZWN0XCIpe1xuICAgICAgICAgICAgc2YuZXhjZXB0aW9ucy5hc3NlcnRGYWlsKGV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGFsbCBwcm9wZXJ0aWVzIG9mIHRoZSBzZWNvbmQgb2JqZWN0IGFyZSBvd24gcHJvcGVydGllcyBvZiB0aGUgZmlyc3Qgb2JqZWN0LlxuICAgICAqIEBwYXJhbSBmaXJzdE9iaiB7T2JqZWN0fSAtIGZpcnN0IG9iamVjdFxuICAgICAqIEBwYXJhbSBzZWNvbmRPYmp7T2JqZWN0fSAtIHNlY29uZCBvYmplY3RcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSByZXR1cm5zIHRydWUsIGlmIHRoZSBjaGVjayBoYXMgcGFzc2VkIG9yIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBvYmplY3RIYXNGaWVsZHMoZmlyc3RPYmosIHNlY29uZE9iail7XG4gICAgICAgIGZvcihsZXQgZmllbGQgaW4gc2Vjb25kT2JqKSB7XG4gICAgICAgICAgICBpZiAoZmlyc3RPYmouaGFzT3duUHJvcGVydHkoZmllbGQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0T2JqW2ZpZWxkXSAhPT0gc2Vjb25kT2JqW2ZpZWxkXSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb2JqZWN0c0FyZUVxdWFsKGZpcnN0T2JqLCBzZWNvbmRPYmopIHtcbiAgICAgICAgbGV0IGFyZUVxdWFsID0gdHJ1ZTtcbiAgICAgICAgaWYoZmlyc3RPYmogIT09IHNlY29uZE9iaikge1xuICAgICAgICAgICAgaWYodHlwZW9mIGZpcnN0T2JqICE9PSB0eXBlb2Ygc2Vjb25kT2JqKSB7XG4gICAgICAgICAgICAgICAgYXJlRXF1YWwgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShmaXJzdE9iaikgJiYgQXJyYXkuaXNBcnJheShzZWNvbmRPYmopKSB7XG5cdCAgICAgICAgICAgIGZpcnN0T2JqLnNvcnQoKTtcblx0ICAgICAgICAgICAgc2Vjb25kT2JqLnNvcnQoKTtcblx0XHQgICAgICAgIGlmIChmaXJzdE9iai5sZW5ndGggIT09IHNlY29uZE9iai5sZW5ndGgpIHtcblx0XHRcdCAgICAgICAgYXJlRXF1YWwgPSBmYWxzZTtcblx0XHQgICAgICAgIH0gZWxzZSB7XG5cdFx0XHQgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlyc3RPYmoubGVuZ3RoOyArK2kpIHtcblx0XHRcdFx0ICAgICAgICBpZiAoIW9iamVjdHNBcmVFcXVhbChmaXJzdE9ialtpXSwgc2Vjb25kT2JqW2ldKSkge1xuXHRcdFx0XHRcdCAgICAgICAgYXJlRXF1YWwgPSBmYWxzZTtcblx0XHRcdFx0XHQgICAgICAgIGJyZWFrO1xuXHRcdFx0XHQgICAgICAgIH1cblx0XHRcdCAgICAgICAgfVxuXHRcdCAgICAgICAgfVxuXHQgICAgICAgIH0gZWxzZSBpZigodHlwZW9mIGZpcnN0T2JqID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBzZWNvbmRPYmogPT09ICdmdW5jdGlvbicpIHx8XG5cdFx0ICAgICAgICAoZmlyc3RPYmogaW5zdGFuY2VvZiBEYXRlICYmIHNlY29uZE9iaiBpbnN0YW5jZW9mIERhdGUpIHx8XG5cdFx0ICAgICAgICAoZmlyc3RPYmogaW5zdGFuY2VvZiBSZWdFeHAgJiYgc2Vjb25kT2JqIGluc3RhbmNlb2YgUmVnRXhwKSB8fFxuXHRcdCAgICAgICAgKGZpcnN0T2JqIGluc3RhbmNlb2YgU3RyaW5nICYmIHNlY29uZE9iaiBpbnN0YW5jZW9mIFN0cmluZykgfHxcblx0XHQgICAgICAgIChmaXJzdE9iaiBpbnN0YW5jZW9mIE51bWJlciAmJiBzZWNvbmRPYmogaW5zdGFuY2VvZiBOdW1iZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZUVxdWFsID0gZmlyc3RPYmoudG9TdHJpbmcoKSA9PT0gc2Vjb25kT2JqLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYodHlwZW9mIGZpcnN0T2JqID09PSAnb2JqZWN0JyAmJiB0eXBlb2Ygc2Vjb25kT2JqID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIGFyZUVxdWFsID0gb2JqZWN0SGFzRmllbGRzKGZpcnN0T2JqLCBzZWNvbmRPYmopO1xuICAgICAgICAgICAgLy8gaXNOYU4odW5kZWZpbmVkKSByZXR1cm5zIHRydWVcbiAgICAgICAgICAgIH0gZWxzZSBpZihpc05hTihmaXJzdE9iaikgJiYgaXNOYU4oc2Vjb25kT2JqKSAmJiB0eXBlb2YgZmlyc3RPYmogPT09ICdudW1iZXInICYmIHR5cGVvZiBzZWNvbmRPYmogPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgYXJlRXF1YWwgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcmVFcXVhbCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFyZUVxdWFsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGFzc2VydCBmb3IgZXZhbHVhdGluZyBpZiBhbGwgcHJvcGVydGllcyBvZiB0aGUgc2Vjb25kIG9iamVjdCBhcmUgb3duIHByb3BlcnRpZXMgb2YgdGhlIGZpcnN0IG9iamVjdC5cbiAgICAgKiBJZiBjaGVjayBmYWlscywgdGhlIGFzc2VydEZhaWwgaXMgaW52b2tlZC5cbiAgICAgKiBAcGFyYW0gZmlyc3RPYmoge09iamVjdH0gLSBmaXJzdCBvYmplY3RcbiAgICAgKiBAcGFyYW0gc2Vjb25kT2Jqe09iamVjdH0gLSBzZWNvbmQgb2JqZWN0XG4gICAgICogQHBhcmFtIGV4cGxhbmF0aW9uIHtTdHJpbmd9IC0gZmFpbGluZyByZWFzb24gbWVzc2FnZSBpbiBjYXNlIHRoZSBhc3NlcnQgZmFpbHNcbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWRkQ2hlY2soXCJvYmplY3RIYXNGaWVsZHNcIiwgZnVuY3Rpb24oZmlyc3RPYmosIHNlY29uZE9iaiwgZXhwbGFuYXRpb24pe1xuICAgICAgICBpZighb2JqZWN0SGFzRmllbGRzKGZpcnN0T2JqLCBzZWNvbmRPYmopKSB7XG4gICAgICAgICAgICBzZi5leGNlcHRpb25zLmFzc2VydEZhaWwoZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBhc3NlcnQgZm9yIGV2YWx1YXRpbmcgaWYgYWxsIGVsZW1lbnQgZnJvbSB0aGUgc2Vjb25kIGFycmF5IGFyZSBwcmVzZW50IGluIHRoZSBmaXJzdCBhcnJheS5cbiAgICAgKiBEZWVwIGNvbXBhcmlzb24gYmV0d2VlbiB0aGUgZWxlbWVudHMgb2YgdGhlIGFycmF5IGlzIHVzZWQuXG4gICAgICogSWYgY2hlY2sgZmFpbHMsIHRoZSBhc3NlcnRGYWlsIGlzIGludm9rZWQuXG4gICAgICogQHBhcmFtIGZpcnN0QXJyYXkge0FycmF5fS0gZmlyc3QgYXJyYXlcbiAgICAgKiBAcGFyYW0gc2Vjb25kQXJyYXkge0FycmF5fSAtIHNlY29uZCBhcnJheVxuICAgICAqIEBwYXJhbSBleHBsYW5hdGlvbiB7U3RyaW5nfSAtIGZhaWxpbmcgcmVhc29uIG1lc3NhZ2UgaW4gY2FzZSB0aGUgYXNzZXJ0IGZhaWxzXG4gICAgICovXG4gICAgc2YuYXNzZXJ0LmFkZENoZWNrKFwiYXJyYXlzTWF0Y2hcIiwgZnVuY3Rpb24oZmlyc3RBcnJheSwgc2Vjb25kQXJyYXksIGV4cGxhbmF0aW9uKXtcbiAgICAgICAgaWYoZmlyc3RBcnJheS5sZW5ndGggIT09IHNlY29uZEFycmF5Lmxlbmd0aCl7XG4gICAgICAgICAgICBzZi5leGNlcHRpb25zLmFzc2VydEZhaWwoZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IG9iamVjdHNBcmVFcXVhbChmaXJzdEFycmF5LCBzZWNvbmRBcnJheSk7XG4gICAgICAgICAgICAvLyBjb25zdCBhcnJheXNEb250TWF0Y2ggPSBzZWNvbmRBcnJheS5ldmVyeShlbGVtZW50ID0+IGZpcnN0QXJyYXkuaW5kZXhPZihlbGVtZW50KSAhPT0gLTEpO1xuICAgICAgICAgICAgLy8gbGV0IGFycmF5c0RvbnRNYXRjaCA9IHNlY29uZEFycmF5LnNvbWUoZnVuY3Rpb24gKGV4cGVjdGVkRWxlbWVudCkge1xuICAgICAgICAgICAgLy8gICAgIGxldCBmb3VuZCA9IGZpcnN0QXJyYXkuc29tZShmdW5jdGlvbihyZXN1bHRFbGVtZW50KXtcbiAgICAgICAgICAgIC8vICAgICAgICAgcmV0dXJuIG9iamVjdEhhc0ZpZWxkcyhyZXN1bHRFbGVtZW50LGV4cGVjdGVkRWxlbWVudCk7XG4gICAgICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIGZvdW5kID09PSBmYWxzZTtcbiAgICAgICAgICAgIC8vIH0pO1xuXG4gICAgICAgICAgICBpZighcmVzdWx0KXtcbiAgICAgICAgICAgICAgICBzZi5leGNlcHRpb25zLmFzc2VydEZhaWwoZXhwbGFuYXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBhZGRlZCBtYWlubHkgZm9yIHRlc3QgcHVycG9zZXMsIGJldHRlciB0ZXN0IGZyYW1ld29ya3MgbGlrZSBtb2NoYSBjb3VsZCBiZSBtdWNoIGJldHRlclxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgYXNzZXJ0IGZvciBjaGVja2luZyBpZiBhIGZ1bmN0aW9uIGlzIGZhaWxpbmcuXG4gICAgICogSWYgdGhlIGZ1bmN0aW9uIGlzIHRocm93aW5nIGFuIGV4Y2VwdGlvbiwgdGhlIHRlc3QgaXMgcGFzc2VkIG9yIGZhaWxlZCBvdGhlcndpc2UuXG4gICAgICogQHBhcmFtIHRlc3ROYW1lIHtTdHJpbmd9IC0gdGVzdCBuYW1lIG9yIGRlc2NyaXB0aW9uXG4gICAgICogQHBhcmFtIGZ1bmMge0Z1bmN0aW9ufSAtIGZ1bmN0aW9uIHRvIGJlIGludm9rZWRcbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWRkQ2hlY2soJ2ZhaWwnLCBmdW5jdGlvbih0ZXN0TmFtZSwgZnVuYyl7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGZ1bmMoKTtcbiAgICAgICAgICAgIGxvZ2dlci5yZWNvcmRBc3NlcnQoXCJbRmFpbF0gXCIgKyB0ZXN0TmFtZSk7XG4gICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgIGxvZ2dlci5yZWNvcmRBc3NlcnQoXCJbUGFzc10gXCIgKyB0ZXN0TmFtZSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGFzc2VydCBmb3IgY2hlY2tpbmcgaWYgYSBmdW5jdGlvbiBpcyBleGVjdXRlZCB3aXRoIG5vIGV4Y2VwdGlvbnMuXG4gICAgICogSWYgdGhlIGZ1bmN0aW9uIGlzIG5vdCB0aHJvd2luZyBhbnkgZXhjZXB0aW9uLCB0aGUgdGVzdCBpcyBwYXNzZWQgb3IgZmFpbGVkIG90aGVyd2lzZS5cbiAgICAgKiBAcGFyYW0gdGVzdE5hbWUge1N0cmluZ30gLSB0ZXN0IG5hbWUgb3IgZGVzY3JpcHRpb25cbiAgICAgKiBAcGFyYW0gZnVuYyB7RnVuY3Rpb259IC0gZnVuY3Rpb24gdG8gYmUgaW52b2tlZFxuICAgICAqL1xuICAgIHNmLmFzc2VydC5hZGRDaGVjaygncGFzcycsIGZ1bmN0aW9uKHRlc3ROYW1lLCBmdW5jKXtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgZnVuYygpO1xuICAgICAgICAgICAgbG9nZ2VyLnJlY29yZEFzc2VydChcIltQYXNzXSBcIiArIHRlc3ROYW1lKTtcbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgbG9nZ2VyLnJlY29yZEFzc2VydChcIltGYWlsXSBcIiArIHRlc3ROYW1lLCBlcnIuc3RhY2spO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBBbGlhcyBmb3IgdGhlIHBhc3MgYXNzZXJ0LlxuICAgICAqL1xuICAgIHNmLmFzc2VydC5hbGlhcygndGVzdCcsICdwYXNzJyk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBhc3NlcnQgZm9yIGNoZWNraW5nIGlmIGEgY2FsbGJhY2sgZnVuY3Rpb24gaXMgZXhlY3V0ZWQgYmVmb3JlIHRpbWVvdXQgaXMgcmVhY2hlZCB3aXRob3V0IGFueSBleGNlcHRpb25zLlxuICAgICAqIElmIHRoZSBmdW5jdGlvbiBpcyB0aHJvd2luZyBhbnkgZXhjZXB0aW9uIG9yIHRoZSB0aW1lb3V0IGlzIHJlYWNoZWQsIHRoZSB0ZXN0IGlzIGZhaWxlZCBvciBwYXNzZWQgb3RoZXJ3aXNlLlxuICAgICAqIEBwYXJhbSB0ZXN0TmFtZSB7U3RyaW5nfSAtIHRlc3QgbmFtZSBvciBkZXNjcmlwdGlvblxuICAgICAqIEBwYXJhbSBmdW5jIHtGdW5jdGlvbn0gLSBmdW5jdGlvbiB0byBiZSBpbnZva2VkXG4gICAgICogQHBhcmFtIHRpbWVvdXQge051bWJlcn0gLSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZvciB0aGUgdGltZW91dCBjaGVjay4gRGVmYXVsdCB0byA1MDBtcy5cbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWRkQ2hlY2soJ2NhbGxiYWNrJywgZnVuY3Rpb24odGVzdE5hbWUsIGZ1bmMsIHRpbWVvdXQpe1xuXG4gICAgICAgIGlmKCFmdW5jIHx8IHR5cGVvZiBmdW5jICE9IFwiZnVuY3Rpb25cIil7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXcm9uZyB1c2FnZSBvZiBhc3NlcnQuY2FsbGJhY2shXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIXRpbWVvdXQpe1xuICAgICAgICAgICAgdGltZW91dCA9IDUwMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwYXNzZWQgPSBmYWxzZTtcbiAgICAgICAgZnVuY3Rpb24gY2FsbGJhY2soKXtcbiAgICAgICAgICAgIGlmKCFwYXNzZWQpe1xuICAgICAgICAgICAgICAgIHBhc3NlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLnJlY29yZEFzc2VydChcIltQYXNzXSBcIiArIHRlc3ROYW1lKTtcbiAgICAgICAgICAgICAgICBzdWNjZXNzVGVzdCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIucmVjb3JkQXNzZXJ0KFwiW0ZhaWwgKG11bHRpcGxlIGNhbGxzKV0gXCIgKyB0ZXN0TmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGZ1bmMoY2FsbGJhY2spO1xuICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICBsb2dnZXIucmVjb3JkQXNzZXJ0KFwiW0ZhaWxdIFwiICsgdGVzdE5hbWUsICBlcnIsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc3VjY2Vzc1Rlc3QoZm9yY2Upe1xuICAgICAgICAgICAgaWYoIXBhc3NlZCl7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLnJlY29yZEFzc2VydChcIltGYWlsIFRpbWVvdXRdIFwiICsgdGVzdE5hbWUgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNldFRpbWVvdXQoc3VjY2Vzc1Rlc3QsIHRpbWVvdXQpXG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBhc3NlcnQgZm9yIGNoZWNraW5nIGlmIGFuIGFycmF5IG9mIGNhbGxiYWNrIGZ1bmN0aW9ucyBhcmUgZXhlY3V0ZWQgaW4gYSB3YXRlcmZhbGwgbWFubmVyLFxuICAgICAqIGJlZm9yZSB0aW1lb3V0IGlzIHJlYWNoZWQgd2l0aG91dCBhbnkgZXhjZXB0aW9ucy5cbiAgICAgKiBJZiBhbnkgb2YgdGhlIGZ1bmN0aW9ucyBpcyB0aHJvd2luZyBhbnkgZXhjZXB0aW9uIG9yIHRoZSB0aW1lb3V0IGlzIHJlYWNoZWQsIHRoZSB0ZXN0IGlzIGZhaWxlZCBvciBwYXNzZWQgb3RoZXJ3aXNlLlxuICAgICAqIEBwYXJhbSB0ZXN0TmFtZSB7U3RyaW5nfSAtIHRlc3QgbmFtZSBvciBkZXNjcmlwdGlvblxuICAgICAqIEBwYXJhbSBmdW5jIHtGdW5jdGlvbn0gLSBmdW5jdGlvbiB0byBiZSBpbnZva2VkXG4gICAgICogQHBhcmFtIHRpbWVvdXQge051bWJlcn0gLSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZvciB0aGUgdGltZW91dCBjaGVjay4gRGVmYXVsdCB0byA1MDBtcy5cbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWRkQ2hlY2soJ3N0ZXBzJywgZnVuY3Rpb24odGVzdE5hbWUsIGFyciwgdGltZW91dCl7XG4gICAgICAgIGlmKCF0aW1lb3V0KXtcbiAgICAgICAgICAgIHRpbWVvdXQgPSA1MDA7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY3VycmVudFN0ZXAgPSAwO1xuICAgICAgICB2YXIgcGFzc2VkID0gZmFsc2U7XG5cbiAgICAgICAgZnVuY3Rpb24gbmV4dCgpe1xuICAgICAgICAgICAgaWYoY3VycmVudFN0ZXAgPT0gYXJyLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgcGFzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBsb2dnZXIucmVjb3JkQXNzZXJ0KFwiW1Bhc3NdIFwiICsgdGVzdE5hbWUgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBmdW5jID0gYXJyW2N1cnJlbnRTdGVwXTtcbiAgICAgICAgICAgIGN1cnJlbnRTdGVwKys7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgZnVuYyhuZXh0KTtcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICBsb2dnZXIucmVjb3JkQXNzZXJ0KFwiW0ZhaWxdIFwiICsgdGVzdE5hbWUgICsgXCIgW2F0IHN0ZXAgXCIgKyBjdXJyZW50U3RlcCArIFwiXVwiLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc3VjY2Vzc1Rlc3QoZm9yY2Upe1xuICAgICAgICAgICAgaWYoIXBhc3NlZCl7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLnJlY29yZEFzc2VydChcIltGYWlsIFRpbWVvdXRdIFwiICsgdGVzdE5hbWUgICsgXCIgW2F0IHN0ZXAgXCIgKyBjdXJyZW50U3RlcCArIFwiXVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNldFRpbWVvdXQoc3VjY2Vzc1Rlc3QsIHRpbWVvdXQpO1xuICAgICAgICBuZXh0KCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBBbGlhcyBmb3IgdGhlIHN0ZXBzIGFzc2VydC5cbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWxpYXMoJ3dhdGVyZmFsbCcsICdzdGVwcycpO1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJpbmcgYXNzZXJ0IGZvciBhc3luY2hyb25vdXNseSBwcmludGluZyBhbGwgZXhlY3V0aW9uIHN1bW1hcnkgZnJvbSBsb2dnZXIuZHVtcFdoeXMuXG4gICAgICogQHBhcmFtIG1lc3NhZ2Uge1N0cmluZ30gLSBtZXNzYWdlIHRvIGJlIHJlY29yZGVkXG4gICAgICogQHBhcmFtIHRpbWVvdXQge051bWJlcn0gLSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZvciB0aGUgdGltZW91dCBjaGVjay4gRGVmYXVsdCB0byA1MDBtcy5cbiAgICAgKi9cbiAgICBzZi5hc3NlcnQuYWRkQ2hlY2soJ2VuZCcsIGZ1bmN0aW9uKHRpbWVvdXQsIHNpbGVuY2Upe1xuICAgICAgICBpZighdGltZW91dCl7XG4gICAgICAgICAgICB0aW1lb3V0ID0gMTAwMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gICAgICAgICAgICBsb2dnZXIuZHVtcFdoeXMoKS5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgICAgIGxldCBleGVjdXRpb25TdW1tYXJ5ID0gYy5nZXRFeGVjdXRpb25TdW1tYXJ5KCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZXhlY3V0aW9uU3VtbWFyeSwgbnVsbCwgNCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmKCFzaWxlbmNlKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZvcmNpbmcgZXhpdCBhZnRlclwiLCB0aW1lb3V0LCBcIm1zXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0VGltZW91dChoYW5kbGVyLCB0aW1lb3V0KTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIGFzc2VydCBmb3IgcHJpbnRpbmcgYSBtZXNzYWdlIGFuZCBhc3luY2hyb25vdXNseSBwcmludGluZyBhbGwgbG9ncyBmcm9tIGxvZ2dlci5kdW1wV2h5cy5cbiAgICAgKiBAcGFyYW0gbWVzc2FnZSB7U3RyaW5nfSAtIG1lc3NhZ2UgdG8gYmUgcmVjb3JkZWRcbiAgICAgKiBAcGFyYW0gdGltZW91dCB7TnVtYmVyfSAtIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZm9yIHRoZSB0aW1lb3V0IGNoZWNrLiBEZWZhdWx0IHRvIDUwMG1zLlxuICAgICAqL1xuICAgIHNmLmFzc2VydC5hZGRDaGVjaygnYmVnaW4nLCBmdW5jdGlvbihtZXNzYWdlLCB0aW1lb3V0KXtcbiAgICAgICAgbG9nZ2VyLnJlY29yZEFzc2VydChtZXNzYWdlKTtcbiAgICAgICAgc2YuYXNzZXJ0LmVuZCh0aW1lb3V0LCB0cnVlKTtcbiAgICB9KTtcbn0iLCIvKlxuICAgIGNoZWNrcyBhcmUgbGlrZSBhc3NlcnRzIGJ1dCBhcmUgaW50ZW5kZWQgdG8gYmUgdXNlZCBpbiBwcm9kdWN0aW9uIGNvZGUgdG8gaGVscCBkZWJ1Z2dpbmcgYW5kIHNpZ25hbGluZyB3cm9uZyBiZWhhdmlvdXJzXG5cbiAqL1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbihzZil7XG4gICAgc2YuZXhjZXB0aW9ucy5yZWdpc3RlcignY2hlY2tGYWlsJywgZnVuY3Rpb24oZXhwbGFuYXRpb24sIGVycil7XG4gICAgICAgIHZhciBzdGFjaztcbiAgICAgICAgaWYoZXJyKXtcbiAgICAgICAgICAgIHN0YWNrID0gZXJyLnN0YWNrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ2hlY2sgZmFpbGVkIFwiLCBleHBsYW5hdGlvbiwgZXJyLnN0YWNrKVxuICAgIH0pO1xuXG4gICAgc2YuY2hlY2suYWRkQ2hlY2soJ2VxdWFsJywgZnVuY3Rpb24odjEgLCB2MiwgZXhwbGFuYXRpb24pe1xuXG4gICAgICAgIGlmKHYxICE9IHYyKXtcbiAgICAgICAgICAgIGlmKCFleHBsYW5hdGlvbil7XG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb24gPSAgXCIgW1wiKyB2MSArIFwiICE9IFwiICsgdjIgKyBcIl1cIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2YuZXhjZXB0aW9ucy5jaGVja0ZhaWwoZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG5cblxuICAgIHNmLmNoZWNrLmFkZENoZWNrKCd0cnVlJywgZnVuY3Rpb24oYiwgZXhwbGFuYXRpb24pe1xuICAgICAgICBpZighYil7XG4gICAgICAgICAgICBpZighZXhwbGFuYXRpb24pe1xuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uID0gIFwiIGV4cHJlc3Npb24gaXMgZmFsc2UgYnV0IGlzIGV4cGVjdGVkIHRvIGJlIHRydWVcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2YuZXhjZXB0aW9ucy5jaGVja0ZhaWwoZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG5cblxuICAgIHNmLmNoZWNrLmFkZENoZWNrKCdmYWxzZScsIGZ1bmN0aW9uKGIsIGV4cGxhbmF0aW9uKXtcbiAgICAgICAgaWYoYil7XG4gICAgICAgICAgICBpZighZXhwbGFuYXRpb24pe1xuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uID0gIFwiIGV4cHJlc3Npb24gaXMgdHJ1ZSBidXQgaXMgZXhwZWN0ZWQgdG8gYmUgZmFsc2VcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2YuZXhjZXB0aW9ucy5jaGVja0ZhaWwoZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBzZi5jaGVjay5hZGRDaGVjaygnbm90ZXF1YWwnLCBmdW5jdGlvbih2MSAsIHYyLCBleHBsYW5hdGlvbil7XG4gICAgICAgIGlmKHYxID09IHYyKXtcbiAgICAgICAgICAgIGlmKCFleHBsYW5hdGlvbil7XG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb24gPSAgXCIgW1wiKyB2MSArIFwiID09IFwiICsgdjIgKyBcIl1cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNmLmV4Y2VwdGlvbnMuY2hlY2tGYWlsKGV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICAvKlxuICAgICAgICBhZGRlZCBtYWlubHkgZm9yIHRlc3QgcHVycG9zZXMsIGJldHRlciB0ZXN0IGZyYW1ld29ya3MgbGlrZSBtb2NoYSBjb3VsZCBiZSBtdWNoIGJldHRlciA6KVxuICAgICovXG4gICAgc2YuY2hlY2suYWRkQ2hlY2soJ2ZhaWwnLCBmdW5jdGlvbih0ZXN0TmFtZSAsZnVuYyl7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGZ1bmMoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW0ZhaWxdIFwiICsgdGVzdE5hbWUgKTtcbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJbUGFzc10gXCIgKyB0ZXN0TmFtZSApO1xuICAgICAgICB9XG4gICAgfSlcblxuXG4gICAgc2YuY2hlY2suYWRkQ2hlY2soJ3Bhc3MnLCBmdW5jdGlvbih0ZXN0TmFtZSAsZnVuYyl7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGZ1bmMoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW1Bhc3NdIFwiICsgdGVzdE5hbWUgKTtcbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJbRmFpbF0gXCIgKyB0ZXN0TmFtZSAgLCAgZXJyLnN0YWNrKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICBzZi5jaGVjay5hbGlhcygndGVzdCcsJ3Bhc3MnKTtcblxuXG4gICAgc2YuY2hlY2suYWRkQ2hlY2soJ2NhbGxiYWNrJywgZnVuY3Rpb24odGVzdE5hbWUgLGZ1bmMsIHRpbWVvdXQpe1xuICAgICAgICBpZighdGltZW91dCl7XG4gICAgICAgICAgICB0aW1lb3V0ID0gNTAwO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYXNzZWQgPSBmYWxzZTtcbiAgICAgICAgZnVuY3Rpb24gY2FsbGJhY2soKXtcbiAgICAgICAgICAgIGlmKCFwYXNzZWQpe1xuICAgICAgICAgICAgICAgIHBhc3NlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJbUGFzc10gXCIgKyB0ZXN0TmFtZSApO1xuICAgICAgICAgICAgICAgIFN1Y2Nlc3NUZXN0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW0ZhaWwgKG11bHRpcGxlIGNhbGxzKV0gXCIgKyB0ZXN0TmFtZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGZ1bmMoY2FsbGJhY2spO1xuICAgICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltGYWlsXSBcIiArIHRlc3ROYW1lICAsICBlcnIuc3RhY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gU3VjY2Vzc1Rlc3QoZm9yY2Upe1xuICAgICAgICAgICAgaWYoIXBhc3NlZCl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJbRmFpbCBUaW1lb3V0XSBcIiArIHRlc3ROYW1lICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZXRUaW1lb3V0KFN1Y2Nlc3NUZXN0LCB0aW1lb3V0KVxuICAgIH0pO1xuXG5cbiAgICBzZi5jaGVjay5hZGRDaGVjaygnc3RlcHMnLCBmdW5jdGlvbih0ZXN0TmFtZSAsIGFyciwgdGltZW91dCl7XG4gICAgICAgIHZhciAgY3VycmVudFN0ZXAgPSAwO1xuICAgICAgICB2YXIgcGFzc2VkID0gZmFsc2U7XG4gICAgICAgIGlmKCF0aW1lb3V0KXtcbiAgICAgICAgICAgIHRpbWVvdXQgPSA1MDA7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBuZXh0KCl7XG4gICAgICAgICAgICBpZihjdXJyZW50U3RlcCA9PSBhcnIubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICBwYXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW1Bhc3NdIFwiICsgdGVzdE5hbWUgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGZ1bmMgPSBhcnJbY3VycmVudFN0ZXBdO1xuICAgICAgICAgICAgY3VycmVudFN0ZXArKztcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBmdW5jKG5leHQpO1xuICAgICAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW0ZhaWxdIFwiICsgdGVzdE5hbWUgICxcIlxcblxcdFwiICwgZXJyLnN0YWNrICsgXCJcXG5cXHRcIiAsIFwiIFthdCBzdGVwIFwiLCBjdXJyZW50U3RlcCArIFwiXVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIFN1Y2Nlc3NUZXN0KGZvcmNlKXtcbiAgICAgICAgICAgIGlmKCFwYXNzZWQpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW0ZhaWwgVGltZW91dF0gXCIgKyB0ZXN0TmFtZSArIFwiXFxuXFx0XCIgLCBcIiBbYXQgc3RlcCBcIiwgY3VycmVudFN0ZXArIFwiXVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNldFRpbWVvdXQoU3VjY2Vzc1Rlc3QsIHRpbWVvdXQpO1xuICAgICAgICBuZXh0KCk7XG4gICAgfSk7XG5cbiAgICBzZi5jaGVjay5hbGlhcygnd2F0ZXJmYWxsJywnc3RlcHMnKTtcbiAgICBzZi5jaGVjay5hbGlhcygnbm90RXF1YWwnLCdub3RlcXVhbCcpO1xuXG4gICAgc2YuY2hlY2suYWRkQ2hlY2soJ2VuZCcsIGZ1bmN0aW9uKHRpbWVPdXQsIHNpbGVuY2Upe1xuICAgICAgICBpZighdGltZU91dCl7XG4gICAgICAgICAgICB0aW1lT3V0ID0gMTAwMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmKCFzaWxlbmNlKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZvcmNpbmcgZXhpdCBhZnRlclwiLCB0aW1lT3V0LCBcIm1zXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgICAgICB9LCB0aW1lT3V0KVxuICAgIH0pO1xuXG5cbiAgICBzZi5jaGVjay5hZGRDaGVjaygnYmVnaW4nLCBmdW5jdGlvbihtZXNzYWdlLCB0aW1lT3V0KXtcbiAgICAgICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgICAgIHNmLmNoZWNrLmVuZCh0aW1lT3V0LCB0cnVlKTtcbiAgICB9KTtcblxuXG59IiwiZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oc2Ype1xuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIHVua25vd24gZXhjZXB0aW9uIGhhbmRsZXIuXG4gICAgICovXG4gICAgc2YuZXhjZXB0aW9ucy5yZWdpc3RlcigndW5rbm93bicsIGZ1bmN0aW9uKGV4cGxhbmF0aW9uKXtcbiAgICAgICAgZXhwbGFuYXRpb24gPSBleHBsYW5hdGlvbiB8fCBcIlwiO1xuICAgICAgICBsZXQgbWVzc2FnZSA9IFwiVW5rbm93biBleGNlcHRpb25cIiArIGV4cGxhbmF0aW9uO1xuICAgICAgICB0aHJvdyhtZXNzYWdlKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyaW5nIHJlc2VuZCBleGNlcHRpb24gaGFuZGxlci5cbiAgICAgKi9cbiAgICBzZi5leGNlcHRpb25zLnJlZ2lzdGVyKCdyZXNlbmQnLCBmdW5jdGlvbihleGNlcHRpb25zKXtcbiAgICAgICAgdGhyb3coZXhjZXB0aW9ucyk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBub3RJbXBsZW1lbnRlZCBleGNlcHRpb24gaGFuZGxlci5cbiAgICAgKi9cbiAgICBzZi5leGNlcHRpb25zLnJlZ2lzdGVyKCdub3RJbXBsZW1lbnRlZCcsIGZ1bmN0aW9uKGV4cGxhbmF0aW9uKXtcbiAgICAgICAgZXhwbGFuYXRpb24gPSBleHBsYW5hdGlvbiB8fCBcIlwiO1xuICAgICAgICBsZXQgbWVzc2FnZSA9IFwibm90SW1wbGVtZW50ZWQgZXhjZXB0aW9uXCIgKyBleHBsYW5hdGlvbjtcbiAgICAgICAgdGhyb3cobWVzc2FnZSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBzZWN1cml0eSBleGNlcHRpb24gaGFuZGxlci5cbiAgICAgKi9cbiAgICBzZi5leGNlcHRpb25zLnJlZ2lzdGVyKCdzZWN1cml0eScsIGZ1bmN0aW9uKGV4cGxhbmF0aW9uKXtcbiAgICAgICAgZXhwbGFuYXRpb24gPSBleHBsYW5hdGlvbiB8fCBcIlwiO1xuICAgICAgICBsZXQgbWVzc2FnZSA9IFwic2VjdXJpdHkgZXhjZXB0aW9uXCIgKyBleHBsYW5hdGlvbjtcbiAgICAgICAgdGhyb3cobWVzc2FnZSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcmluZyBkdXBsaWNhdGVEZXBlbmRlbmN5IGV4Y2VwdGlvbiBoYW5kbGVyLlxuICAgICAqL1xuICAgIHNmLmV4Y2VwdGlvbnMucmVnaXN0ZXIoJ2R1cGxpY2F0ZURlcGVuZGVuY3knLCBmdW5jdGlvbih2YXJpYWJsZSl7XG4gICAgICAgIHZhcmlhYmxlID0gdmFyaWFibGUgfHwgXCJcIjtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBcImR1cGxpY2F0ZURlcGVuZGVuY3kgZXhjZXB0aW9uXCIgKyB2YXJpYWJsZTtcbiAgICAgICAgdGhyb3cobWVzc2FnZSk7XG4gICAgfSk7XG59IiwiY29uc3QgTE9HX0xFVkVMUyA9IHtcbiAgICBIQVJEX0VSUk9SOiAgICAgMCwgIC8vIHN5c3RlbSBsZXZlbCBjcml0aWNhbCBlcnJvcjogaGFyZEVycm9yXG4gICAgRVJST1I6ICAgICAgICAgIDEsICAvLyBwb3RlbnRpYWxseSBjYXVzaW5nIHVzZXIncyBkYXRhIGxvb3NpbmcgZXJyb3I6IGVycm9yXG4gICAgTE9HX0VSUk9SOiAgICAgIDIsICAvLyBtaW5vciBhbm5veWFuY2UsIHJlY292ZXJhYmxlIGVycm9yOiAgIGxvZ0Vycm9yXG4gICAgVVhfRVJST1I6ICAgICAgIDMsICAvLyB1c2VyIGV4cGVyaWVuY2UgY2F1c2luZyBpc3N1ZXMgZXJyb3I6ICB1eEVycm9yXG4gICAgV0FSTjogICAgICAgICAgIDQsICAvLyB3YXJuaW5nLHBvc3NpYmxlIGlzdWVzIGJ1dCBzb21laG93IHVuY2xlYXIgYmVoYXZpb3VyOiB3YXJuXG4gICAgSU5GTzogICAgICAgICAgIDUsICAvLyBzdG9yZSBnZW5lcmFsIGluZm8gYWJvdXQgdGhlIHN5c3RlbSB3b3JraW5nOiBpbmZvXG4gICAgREVCVUc6ICAgICAgICAgIDYsICAvLyBzeXN0ZW0gbGV2ZWwgZGVidWc6IGRlYnVnXG4gICAgTE9DQUxfREVCVUc6ICAgIDcsICAvLyBsb2NhbCBub2RlL3NlcnZpY2UgZGVidWc6IGxkZWJ1Z1xuICAgIFVTRVJfREVCVUc6ICAgICA4LCAgLy8gdXNlciBsZXZlbCBkZWJ1ZzsgdWRlYnVnXG4gICAgREVWX0RFQlVHOiAgICAgIDksICAvLyBkZXZlbG9wbWVudCB0aW1lIGRlYnVnOiBkZGVidWdcbiAgICBXSFlTOiAgICAgICAgICAgIDEwLCAvLyB3aHlMb2cgZm9yIGNvZGUgcmVhc29uaW5nXG4gICAgVEVTVF9SRVNVTFQ6ICAgIDExLCAvLyB0ZXN0UmVzdWx0IHRvIGxvZyBydW5uaW5nIHRlc3RzXG59XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKHNmKXtcblxuICAgIC8qKlxuICAgICAqIFJlY29yZHMgbG9nIG1lc3NhZ2VzIGZyb20gdmFyaW91cyB1c2UgY2FzZXMuXG4gICAgICogQHBhcmFtIHJlY29yZCB7U3RyaW5nfSAtIGxvZyBtZXNzYWdlLlxuICAgICAqL1xuICAgIHNmLmxvZ2dlci5yZWNvcmQgPSBmdW5jdGlvbihyZWNvcmQpe1xuICAgICAgICB2YXIgZGlzcGxheU9uQ29uc29sZSA9IHRydWU7XG4gICAgICAgIGlmKHByb2Nlc3Muc2VuZCkge1xuICAgICAgICAgICAgcHJvY2Vzcy5zZW5kKHJlY29yZCk7XG4gICAgICAgICAgICBkaXNwbGF5T25Db25zb2xlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZihkaXNwbGF5T25Db25zb2xlKSB7XG4gICAgICAgICAgICBsZXQgcHJldHR5TG9nID0gSlNPTi5zdHJpbmdpZnkocmVjb3JkLCBudWxsLCAyKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHByZXR0eUxvZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRpbmcgY2FzZSBmb3IgbG9nZ2luZyBzeXN0ZW0gbGV2ZWwgY3JpdGljYWwgZXJyb3JzLlxuICAgICAqL1xuICAgIHNmLmxvZ2dlci5hZGRDYXNlKCdoYXJkRXJyb3InLCBmdW5jdGlvbihtZXNzYWdlLCBleGNlcHRpb24sIGFyZ3MsIHBvcywgZGF0YSl7XG4gICAgICAgIHNmLmxvZ2dlci5yZWNvcmQoY3JlYXRlRGVidWdSZWNvcmQoTE9HX0xFVkVMUy5IQVJEX0VSUk9SLCAnc3lzdGVtRXJyb3InLCBtZXNzYWdlLCBleGNlcHRpb24sIHRydWUsIGFyZ3MsIHBvcywgZGF0YSkpO1xuICAgIH0sIFtcbiAgICAgICAge1xuICAgICAgICAgICAgJ21lc3NhZ2UnOidleHBsYW5hdGlvbidcbiAgICAgICAgfVxuICAgIF0pO1xuXG4gICAgLyoqXG4gICAgICogQWRkaW5nIGNhc2UgZm9yIGxvZ2dpbmcgcG90ZW50aWFsbHkgY2F1c2luZyB1c2VyJ3MgZGF0YSBsb29zaW5nIGVycm9ycy5cbiAgICAgKi9cbiAgICBzZi5sb2dnZXIuYWRkQ2FzZSgnZXJyb3InLCBmdW5jdGlvbihtZXNzYWdlLCBleGNlcHRpb24sIGFyZ3MsIHBvcywgZGF0YSl7XG4gICAgICAgIHNmLmxvZ2dlci5yZWNvcmQoY3JlYXRlRGVidWdSZWNvcmQoTE9HX0xFVkVMUy5FUlJPUiwgJ2Vycm9yJywgbWVzc2FnZSwgZXhjZXB0aW9uLCB0cnVlLCBhcmdzLCBwb3MsIGRhdGEpKTtcbiAgICB9LCBbXG4gICAgICAgIHtcbiAgICAgICAgICAgICdtZXNzYWdlJzonZXhwbGFuYXRpb24nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgICdleGNlcHRpb24nOidleGNlcHRpb24nXG4gICAgICAgIH1cbiAgICBdKTtcblxuICAgIC8qKlxuICAgICAqIEFkZGluZyBjYXNlIGZvciBsb2dnaW5nIG1pbm9yIGFubm95YW5jZSwgcmVjb3ZlcmFibGUgZXJyb3JzLlxuICAgICAqL1xuICAgIHNmLmxvZ2dlci5hZGRDYXNlKCdsb2dFcnJvcicsIGZ1bmN0aW9uKG1lc3NhZ2UsIGV4Y2VwdGlvbiwgYXJncywgcG9zLCBkYXRhKXtcbiAgICAgICAgc2YubG9nZ2VyLnJlY29yZChjcmVhdGVEZWJ1Z1JlY29yZChMT0dfTEVWRUxTLkxPR19FUlJPUiwgJ2xvZ0Vycm9yJywgbWVzc2FnZSwgZXhjZXB0aW9uLCB0cnVlLCBhcmdzLCBwb3MsIGRhdGEpKTtcbiAgICB9LCBbXG4gICAgICAgIHtcbiAgICAgICAgICAgICdtZXNzYWdlJzonZXhwbGFuYXRpb24nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgICdleGNlcHRpb24nOidleGNlcHRpb24nXG4gICAgICAgIH1cbiAgICBdKTtcblxuICAgIC8qKlxuICAgICAqIEFkZGluZyBjYXNlIGZvciBsb2dnaW5nIHVzZXIgZXhwZXJpZW5jZSBjYXVzaW5nIGlzc3VlcyBlcnJvcnMuXG4gICAgICovXG4gICAgc2YubG9nZ2VyLmFkZENhc2UoJ3V4RXJyb3InLCBmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgc2YubG9nZ2VyLnJlY29yZChjcmVhdGVEZWJ1Z1JlY29yZChMT0dfTEVWRUxTLlVYX0VSUk9SLCAndXhFcnJvcicsIG1lc3NhZ2UsIG51bGwsIGZhbHNlKSk7XG4gICAgfSwgW1xuICAgICAgICB7XG4gICAgICAgICAgICAnbWVzc2FnZSc6J2V4cGxhbmF0aW9uJ1xuICAgICAgICB9XG4gICAgXSk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRpbmcgY2FzZSBmb3IgbG9nZ2luZyB0aHJvdHRsaW5nIG1lc3NhZ2VzLlxuICAgICAqL1xuICAgIHNmLmxvZ2dlci5hZGRDYXNlKCd0aHJvdHRsaW5nJywgZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgIHNmLmxvZ2dlci5yZWNvcmQoY3JlYXRlRGVidWdSZWNvcmQoTE9HX0xFVkVMUy5XQVJOLCAndGhyb3R0bGluZycsIG1lc3NhZ2UsIG51bGwsIGZhbHNlKSk7XG4gICAgfSwgW1xuICAgICAgICB7XG4gICAgICAgICAgICAnbWVzc2FnZSc6J2V4cGxhbmF0aW9uJ1xuICAgICAgICB9XG4gICAgXSk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRpbmcgY2FzZSBmb3IgbG9nZ2luZyB3YXJuaW5nLCBwb3NzaWJsZSBpc3N1ZXMsIGJ1dCBzb21laG93IHVuY2xlYXIgYmVoYXZpb3Vycy5cbiAgICAgKi9cbiAgICBzZi5sb2dnZXIuYWRkQ2FzZSgnd2FybmluZycsIGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICBzZi5sb2dnZXIucmVjb3JkKGNyZWF0ZURlYnVnUmVjb3JkKExPR19MRVZFTFMuV0FSTiwgJ3dhcm5pbmcnLCBtZXNzYWdlLG51bGwsIGZhbHNlLCBhcmd1bWVudHMsIDApKTtcbiAgICB9LCBbXG4gICAgICAgIHtcbiAgICAgICAgICAgICdtZXNzYWdlJzonZXhwbGFuYXRpb24nXG4gICAgICAgIH1cbiAgICBdKTtcbiAgICBcbiAgICBzZi5sb2dnZXIuYWxpYXMoJ3dhcm4nLCAnd2FybmluZycpO1xuXG4gICAgLyoqXG4gICAgICogQWRkaW5nIGNhc2UgZm9yIGxvZ2dpbmcgZ2VuZXJhbCBpbmZvIGFib3V0IHRoZSBzeXN0ZW0gd29ya2luZy5cbiAgICAgKi9cbiAgICBzZi5sb2dnZXIuYWRkQ2FzZSgnaW5mbycsIGZ1bmN0aW9uKG1lc3NhZ2Upe1xuICAgICAgICBzZi5sb2dnZXIucmVjb3JkKGNyZWF0ZURlYnVnUmVjb3JkKExPR19MRVZFTFMuSU5GTywgJ2luZm8nLCBtZXNzYWdlLG51bGwsIGZhbHNlLCBhcmd1bWVudHMsIDApKTtcbiAgICB9LCBbXG4gICAgICAgIHtcbiAgICAgICAgICAgICdtZXNzYWdlJzonZXhwbGFuYXRpb24nXG4gICAgICAgIH1cbiAgICBdKTtcblxuICAgIC8qKlxuICAgICAqIEFkZGluZyBjYXNlIGZvciBsb2dnaW5nIHN5c3RlbSBsZXZlbCBkZWJ1ZyBtZXNzYWdlcy5cbiAgICAgKi9cbiAgICBzZi5sb2dnZXIuYWRkQ2FzZSgnZGVidWcnLCBmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgc2YubG9nZ2VyLnJlY29yZChjcmVhdGVEZWJ1Z1JlY29yZChMT0dfTEVWRUxTLkRFQlVHLCAnZGVidWcnLCBtZXNzYWdlLG51bGwsIGZhbHNlLCBhcmd1bWVudHMsIDApKTtcbiAgICB9LCBbXG4gICAgICAgIHtcbiAgICAgICAgICAgICdtZXNzYWdlJzonZXhwbGFuYXRpb24nXG4gICAgICAgIH1cbiAgICBdKTtcblxuXG4gICAgLyoqXG4gICAgICogQWRkaW5nIGNhc2UgZm9yIGxvZ2dpbmcgbG9jYWwgbm9kZS9zZXJ2aWNlIGRlYnVnIG1lc3NhZ2VzLlxuICAgICAqL1xuICAgIHNmLmxvZ2dlci5hZGRDYXNlKCdsZGVidWcnLCBmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgc2YubG9nZ2VyLnJlY29yZChjcmVhdGVEZWJ1Z1JlY29yZChMT0dfTEVWRUxTLkxPQ0FMX0RFQlVHLCAnbGRlYnVnJywgbWVzc2FnZSwgbnVsbCwgZmFsc2UsIGFyZ3VtZW50cywgMCkpO1xuICAgIH0sIFtcbiAgICAgICAge1xuICAgICAgICAgICAgJ21lc3NhZ2UnOidleHBsYW5hdGlvbidcbiAgICAgICAgfVxuICAgIF0pO1xuXG4gICAgLyoqXG4gICAgICogQWRkaW5nIGNhc2UgZm9yIGxvZ2dpbmcgdXNlciBsZXZlbCBkZWJ1ZyBtZXNzYWdlcy5cbiAgICAgKi9cbiAgICBzZi5sb2dnZXIuYWRkQ2FzZSgndWRlYnVnJywgZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgIHNmLmxvZ2dlci5yZWNvcmQoY3JlYXRlRGVidWdSZWNvcmQoTE9HX0xFVkVMUy5VU0VSX0RFQlVHLCAndWRlYnVnJywgbWVzc2FnZSAsbnVsbCwgZmFsc2UsIGFyZ3VtZW50cywgMCkpO1xuICAgIH0sIFtcbiAgICAgICAge1xuICAgICAgICAgICAgJ21lc3NhZ2UnOidleHBsYW5hdGlvbidcbiAgICAgICAgfVxuICAgIF0pO1xuXG4gICAgLyoqXG4gICAgICogQWRkaW5nIGNhc2UgZm9yIGxvZ2dpbmcgZGV2ZWxvcG1lbnQgZGVidWcgbWVzc2FnZXMuXG4gICAgICovXG4gICAgc2YubG9nZ2VyLmFkZENhc2UoJ2RldmVsJywgZnVuY3Rpb24obWVzc2FnZSl7XG4gICAgICAgIHNmLmxvZ2dlci5yZWNvcmQoY3JlYXRlRGVidWdSZWNvcmQoTE9HX0xFVkVMUy5ERVZfREVCVUcsICdkZXZlbCcsIG1lc3NhZ2UsIG51bGwsIGZhbHNlLCBhcmd1bWVudHMsIDApKTtcbiAgICB9LCBbXG4gICAgICAgIHtcbiAgICAgICAgICAgICdtZXNzYWdlJzonZXhwbGFuYXRpb24nXG4gICAgICAgIH1cbiAgICBdKTtcblxuICAgIC8qKlxuICAgICAqIEFkZGluZyBjYXNlIGZvciBsb2dnaW5nIFwid2h5c1wiIHJlYXNvbmluZyBtZXNzYWdlcy5cbiAgICAgKi9cbiAgICBzZi5sb2dnZXIuYWRkQ2FzZShcImxvZ1doeVwiLCBmdW5jdGlvbihsb2dPbmx5Q3VycmVudFdoeUNvbnRleHQpe1xuICAgICAgICBzZi5sb2dnZXIucmVjb3JkKGNyZWF0ZURlYnVnUmVjb3JkKExPR19MRVZFTFMuV0hZUywgJ2xvZ3doeScsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGxvZ09ubHlDdXJyZW50V2h5Q29udGV4dCkpXG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRpbmcgY2FzZSBmb3IgbG9nZ2luZyBhc3NlcnRzIG1lc3NhZ2VzIHRvIHJ1bm5pbmcgdGVzdHMuXG4gICAgICovXG4gICAgc2YubG9nZ2VyLmFkZENhc2UoXCJyZWNvcmRBc3NlcnRcIiwgZnVuY3Rpb24gKG1lc3NhZ2UsIGVycm9yLHNob3dTdGFjayl7XG4gICAgICAgIHNmLmxvZ2dlci5yZWNvcmQoY3JlYXRlRGVidWdSZWNvcmQoTE9HX0xFVkVMUy5URVNUX1JFU1VMVCwgJ2Fzc2VydCcsIG1lc3NhZ2UsIGVycm9yLCBzaG93U3RhY2spKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyaWMgbWV0aG9kIHRvIGNyZWF0ZSBzdHJ1Y3R1cmVkIGRlYnVnIHJlY29yZHMgYmFzZWQgb24gdGhlIGxvZyBsZXZlbC5cbiAgICAgKiBAcGFyYW0gbGV2ZWwge051bWJlcn0gLSBudW1iZXIgZnJvbSAxLTExLCB1c2VkIHRvIGlkZW50aWZ5IHRoZSBsZXZlbCBvZiBhdHRlbnRpb24gdGhhdCBhIGxvZyBlbnRyeSBzaG91bGQgZ2V0IGZyb20gb3BlcmF0aW9ucyBwb2ludCBvZiB2aWV3XG4gICAgICogQHBhcmFtIHR5cGUge1N0cmluZ30gLSBpZGVudGlmaWVyIG5hbWUgZm9yIGxvZyB0eXBlXG4gICAgICogQHBhcmFtIG1lc3NhZ2Uge1N0cmluZ30gLSBkZXNjcmlwdGlvbiBvZiB0aGUgZGVidWcgcmVjb3JkXG4gICAgICogQHBhcmFtIGV4Y2VwdGlvbiB7U3RyaW5nfSAtIGV4Y2VwdGlvbiBkZXRhaWxzIGlmIGFueVxuICAgICAqIEBwYXJhbSBzYXZlU3RhY2sge0Jvb2xlYW59IC0gaWYgc2V0IHRvIHRydWUsIHRoZSBleGNlcHRpb24gY2FsbCBzdGFjayB3aWxsIGJlIGFkZGVkIHRvIHRoZSBkZWJ1ZyByZWNvcmRcbiAgICAgKiBAcGFyYW0gYXJncyB7QXJyYXl9IC0gYXJndW1lbnRzIG9mIHRoZSBjYWxsZXIgZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0gcG9zIHtOdW1iZXJ9IC0gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0gZGF0YSB7U3RyaW5nfE51bWJlcnxBcnJheXxPYmplY3R9IC0gcGF5bG9hZCBpbmZvcm1hdGlvblxuICAgICAqIEBwYXJhbSBsb2dPbmx5Q3VycmVudFdoeUNvbnRleHQgLSBpZiB3aHlzIGlzIGVuYWJsZWQsIG9ubHkgdGhlIGN1cnJlbnQgY29udGV4dCB3aWxsIGJlIGxvZ2dlZFxuICAgICAqIEByZXR1cm5zIERlYnVnIHJlY29yZCBtb2RlbCB7T2JqZWN0fSB3aXRoIHRoZSBmb2xsb3dpbmcgZmllbGRzOlxuICAgICAqIFtyZXF1aXJlZF06IGxldmVsOiAqLCB0eXBlOiAqLCB0aW1lc3RhbXA6IG51bWJlciwgbWVzc2FnZTogKiwgZGF0YTogKiBhbmRcbiAgICAgKiBbb3B0aW9uYWxdOiBzdGFjazogKiwgZXhjZXB0aW9uOiAqLCBhcmdzOiAqLCB3aHlMb2c6ICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjcmVhdGVEZWJ1Z1JlY29yZChsZXZlbCwgdHlwZSwgbWVzc2FnZSwgZXhjZXB0aW9uLCBzYXZlU3RhY2ssIGFyZ3MsIHBvcywgZGF0YSwgbG9nT25seUN1cnJlbnRXaHlDb250ZXh0KXtcblxuICAgICAgICB2YXIgcmV0ID0ge1xuICAgICAgICAgICAgbGV2ZWw6IGxldmVsLFxuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogKG5ldyBEYXRlKCkpLmdldFRpbWUoKSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYoc2F2ZVN0YWNrKXtcbiAgICAgICAgICAgIHZhciBzdGFjayA9ICcnO1xuICAgICAgICAgICAgaWYoZXhjZXB0aW9uKXtcbiAgICAgICAgICAgICAgICBzdGFjayA9IGV4Y2VwdGlvbi5zdGFjaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RhY2sgID0gKG5ldyBFcnJvcigpKS5zdGFjaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldC5zdGFjayA9IHN0YWNrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZXhjZXB0aW9uKXtcbiAgICAgICAgICAgIHJldC5leGNlcHRpb24gPSBleGNlcHRpb24ubWVzc2FnZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGFyZ3Mpe1xuICAgICAgICAgICAgcmV0LmFyZ3MgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHByb2Nlc3MuZW52LlJVTl9XSVRIX1dIWVMpe1xuICAgICAgICAgICAgdmFyIHdoeSA9IHJlcXVpcmUoJ3doeXMnKTtcbiAgICAgICAgICAgIGlmKGxvZ09ubHlDdXJyZW50V2h5Q29udGV4dCkge1xuICAgICAgICAgICAgICAgIHJldFsnd2h5TG9nJ10gPSB3aHkuZ2V0R2xvYmFsQ3VycmVudENvbnRleHQoKS5nZXRFeGVjdXRpb25TdW1tYXJ5KCk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICByZXRbJ3doeUxvZyddID0gd2h5LmdldEFsbENvbnRleHRzKCkubWFwKGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb250ZXh0LmdldEV4ZWN1dGlvblN1bW1hcnkoKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbn1cblxuIiwiaWYodHlwZW9mICQkID09PSAndW5kZWZpbmVkJyB8fCAkJCA9PT0gbnVsbCl7XG4gICAgLy9pZiBydW5uaW5nIGZyb20gYSBQcml2YXRlU2t5IGVudmlyb25tZW50IGNhbGxmbG93IG1vZHVsZSBhbmQgb3RoZXIgZGVwcyBhcmUgYWxyZWFkeSBsb2FkZWRcblx0cmVxdWlyZShcIi4uLy4uLy4uL2VuZ2luZS9jb3JlXCIpLmVuYWJsZVRlc3RpbmcoKTtcbn1cblxuY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5jb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5jb25zdCBmb3JrZXIgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJyk7XG5cbnZhciBnbG9iVG9SZWdFeHAgPSAgcmVxdWlyZShcIi4vdXRpbHMvZ2xvYi10by1yZWdleHBcIik7XG5cbnZhciBkZWZhdWx0Q29uZmlnID0ge1xuICAgIGNvbmZGaWxlTmFtZTogXCJkb3VibGUtY2hlY2suanNvblwiLCAgICAgIC8vIG5hbWUgb2YgdGhlIGNvbmYgZmlsZVxuICAgIGZpbGVFeHQ6IFwiLmpzXCIsICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRlc3QgZmlsZSBzdXBwb3J0ZWQgYnkgZXh0ZW5zaW9uXG4gICAgbWF0Y2hEaXJzOiBbJ3Rlc3QnLCAndGVzdHMnXSwgICAgICAgICAgIC8vIGRpcnMgbmFtZXMgZm9yIHRlc3RzIC0gY2FzZSBpbnNlbnNpdGl2ZSAodXNlZCBpbiBkaXNjb3ZlcnkgcHJvY2VzcylcbiAgICB0ZXN0c0RpcjogcHJvY2Vzcy5jd2QoKSwgICAgICAgICAgICAgICAgLy8gcGF0aCB0byB0aGUgcm9vdCB0ZXN0cyBsb2NhdGlvblxuICAgIHJlcG9ydHM6IHtcbiAgICAgICAgYmFzZVBhdGg6IHByb2Nlc3MuY3dkKCksICAgICAgICAgICAgLy8gcGF0aCB3aGVyZSB0aGUgcmVwb3J0cyB3aWxsIGJlIHNhdmVkXG4gICAgICAgIHByZWZpeDogXCJSZXBvcnQtXCIsICAgICAgICAgICAgICAgICAgLy8gcHJlZml4IGZvciByZXBvcnQgZmlsZXMsIGZpbGVuYW1lIHBhdHRlcm46IFtwcmVmaXhdLXt0aW1lc3RhbXB9e2V4dH1cbiAgICAgICAgZXh0OiBcIi50eHRcIiAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXBvcnQgZmlsZSBleHRlbnNpb25cbiAgICB9XG59XG5cbmNvbnN0IFRBRyA9IFwiW1RFU1RfUlVOTkVSXVwiO1xuY29uc3QgTUFYX1dPUktFUlMgPSBwcm9jZXNzLmVudlsnRE9VQkxFX0NIRUNLX1BPT0xfU0laRSddIHx8IDEwO1xuY29uc3QgREVCVUcgPSB0eXBlb2YgdjhkZWJ1ZyA9PT0gJ29iamVjdCc7XG5cbmNvbnN0IFRFU1RfU1RBVEVTID0ge1xuICAgIFJFQURZOiAncmVhZHknLFxuICAgIFJVTk5JTkc6ICdydW5uaW5nJyxcbiAgICBGSU5JU0hFRDogJ2ZpbmlzaGVkJyxcbiAgICBUSU1FT1VUOiAndGltZW91dCdcbn1cblxuLy8gU2Vzc2lvbiBvYmplY3RcbnZhciBkZWZhdWx0U2Vzc2lvbiA9IHtcbiAgICB0ZXN0Q291bnQ6IDAsXG4gICAgY3VycmVudFRlc3RJbmRleDogMCxcbiAgICBkZWJ1Z1BvcnQ6IHByb2Nlc3MuZGVidWdQb3J0LCAgIC8vIGN1cnJlbnQgcHJvY2VzcyBkZWJ1ZyBwb3J0LiBUaGUgY2hpbGQgcHJvY2VzcyB3aWxsIGJlIGluY3JlYXNlZCBmcm9tIHRoaXMgcG9ydFxuICAgIHdvcmtlcnM6IHtcbiAgICAgICAgcnVubmluZzogMCxcbiAgICAgICAgdGVybWluYXRlZDogMFxuICAgIH1cbn1cblxuLy8gVGVtcGxhdGUgc3RydWN0dXJlIGZvciB0ZXN0IHJlcG9ydHMuXG52YXIgcmVwb3J0RmlsZVN0cnVjdHVyZSA9IHtcbiAgICBjb3VudDogMCxcbiAgICBzdWl0ZXM6IHtcbiAgICAgICAgY291bnQ6IDAsXG4gICAgICAgIGl0ZW1zOiBbXVxuICAgIH0sXG4gICAgcGFzc2VkOiB7XG4gICAgICAgIGNvdW50OiAwLFxuICAgICAgICBpdGVtczogW11cbiAgICB9LFxuICAgIGZhaWxlZDoge1xuICAgICAgICBjb3VudDogMCxcbiAgICAgICAgaXRlbXM6IFtdXG4gICAgfSxcbn1cblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oc2Ype1xuICAgIHNmLnRlc3RSdW5uZXIgPSAkJC5mbG93LmNyZWF0ZShcInRlc3RSdW5uZXJcIiwge1xuICAgICAgICAvKipcbiAgICAgICAgICogSW5pdGlhbGl6YXRpb24gb2YgdGhlIHRlc3QgcnVubmVyLlxuICAgICAgICAgKiBAcGFyYW0gY29uZmlnIHtPYmplY3R9IC0gc2V0dGluZ3Mgb2JqZWN0IHRoYXQgd2lsbCBiZSBtZXJnZWQgd2l0aCB0aGUgZGVmYXVsdCBvbmVcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9faW5pdDogZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMuX19leHRlbmQoZGVmYXVsdENvbmZpZywgY29uZmlnKTtcbiAgICAgICAgICAgIHRoaXMudGVzdFRyZWUgPSB7fTtcbiAgICAgICAgICAgIHRoaXMudGVzdExpc3QgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy5zZXNzaW9uID0gZGVmYXVsdFNlc3Npb247XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSByZXBvcnRzIGRpcmVjdG9yeSBpZiBub3QgZXhpc3RcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLmNvbmZpZy5yZXBvcnRzLmJhc2VQYXRoKSl7XG4gICAgICAgICAgICAgICAgZnMubWtkaXJTeW5jKHRoaXMuY29uZmlnLnJlcG9ydHMuYmFzZVBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogTWFpbiBlbnRyeSBwb2ludC4gSXQgd2lsbCBzdGFydCB0aGUgZmxvdyBydW5uZXIgZmxvdy5cbiAgICAgICAgICogQHBhcmFtIGNvbmZpZyB7T2JqZWN0fSAtIG9iamVjdCBjb250YWluaW5nIHNldHRpbmdzIHN1Y2ggYXMgY29uZiBmaWxlIG5hbWUsIHRlc3QgZGlyLlxuICAgICAgICAgKiBAcGFyYW0gY2FsbGJhY2sge0Z1bmN0aW9ufSAtIGhhbmRsZXIoZXJyb3IsIHJlc3VsdCkgaW52b2tlZCB3aGVuIGFuIGVycm9yIG9jY3VycmVkIG9yIHRoZSBydW5uZXIgaGFzIGNvbXBsZXRlZCBhbGwgam9icy5cbiAgICAgICAgICovXG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbihjb25maWcsIGNhbGxiYWNrKSB7XG5cbiAgICAgICAgICAgIC8vIHdyYXBwZXIgZm9yIHByb3ZpZGVkIGNhbGxiYWNrLCBpZiBhbnlcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9fZGVidWdJbmZvKGVyci5tZXNzYWdlIHx8IGVycik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuX19pbml0KGNvbmZpZyk7XG5cbiAgICAgICAgICAgIHRoaXMuX19jb25zb2xlTG9nKFwiRGlzY292ZXJpbmcgdGVzdHMgLi4uXCIpO1xuICAgICAgICAgICAgdGhpcy50ZXN0VHJlZSA9IHRoaXMuX19kaXNjb3ZlclRlc3RGaWxlcyh0aGlzLmNvbmZpZy50ZXN0c0RpciwgY29uZmlnKTtcbiAgICAgICAgICAgIHRoaXMudGVzdExpc3QgPSB0aGlzLl9fdG9UZXN0VHJlZVRvTGlzdCh0aGlzLnRlc3RUcmVlKTtcbmNvbnNvbGUubG9nKHRoaXMudGVzdFRyZWUpO1xuICAgICAgICAgICAgdGhpcy5fX2xhdW5jaFRlc3RzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWFkcyBjb25maWd1cmF0aW9uIHNldHRpbmdzIGZyb20gYSBqc29uIGZpbGUuXG4gICAgICAgICAqIEBwYXJhbSBjb25mUGF0aCB7U3RyaW5nfSAtIGFic29sdXRlIHBhdGggdG8gdGhlIGNvbmZpZ3VyYXRpb24gZmlsZS5cbiAgICAgICAgICogQHJldHVybnMge09iamVjdH0gLSBjb25maWd1cmF0aW9uIG9iamVjdCB7e319XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX3JlYWRDb25mOiBmdW5jdGlvbihjb25mUGF0aCkge1xuICAgICAgICAgICAgdmFyIGNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHJlcXVpcmUoY29uZlBhdGgpO1xuICAgICAgICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogRGlzY292ZXJzIHRlc3QgZmlsZXMgcmVjdXJzaXZlbHkgc3RhcnRpbmcgZnJvbSBhIHBhdGguIFRoZSBkaXIgaXMgdGhlIHJvb3Qgb2YgdGhlIHRlc3QgZmlsZXMuIEl0IGNhbiBjb250YWluc1xuICAgICAgICAgKiB0ZXN0IGZpbGVzIGFuZCB0ZXN0IHN1YiBkaXJlY3Rvcmllcy4gSXQgd2lsbCBjcmVhdGUgYSB0cmVlIHN0cnVjdHVyZSB3aXRoIHRoZSB0ZXN0IGZpbGVzIGRpc2NvdmVyZWQuXG4gICAgICAgICAqIE5vdGVzOiBPbmx5IHRoZSBjb25maWcubWF0Y2hEaXJzIHdpbGwgYmUgdGFrZW4gaW50byBjb25zaWRlcmF0aW9uLiBBbHNvLCBiYXNlZCBvbiB0aGUgY29uZiAoZG91YmxlLWNoZWNrLmpzb24pXG4gICAgICAgICAqIGl0IHdpbGwgaW5jbHVkZSB0aGUgdGVzdCBmaWxlcyBvciBub3QuXG4gICAgICAgICAqIEBwYXJhbSBkaXIge1N0cmluZ30gLSBwYXRoIHdoZXJlIHRoZSBkaXNjb3ZlcnkgcHJvY2VzcyBzdGFydHNcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbmYge1N0cmluZ30gLSBjb25maWd1cmF0aW9uIG9iamVjdCAoZG91YmxlLWNoZWNrLmpzb24pIGZyb20gdGhlIHBhcmVudCBkaXJlY3RvcnlcbiAgICAgICAgICogQHJldHVybnMgVGhlIHJvb3Qgbm9kZSBvYmplY3Qgb2YgdGhlIGZpbGUgc3RydWN0dXJlIHRyZWUuIEUuZy4geyp8e19fbWV0YSwgZGF0YSwgcmVzdWx0LCBpdGVtc319XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX2Rpc2NvdmVyVGVzdEZpbGVzOiBmdW5jdGlvbihkaXIsIHBhcmVudENvbmYpIHtcbiAgICAgICAgICAgIGxldCBzdGF0ID0gZnMuc3RhdFN5bmMoZGlyKTtcbiAgICAgICAgICAgIGlmKCFzdGF0LmlzRGlyZWN0b3J5KCkpe1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihkaXIgKyBcIiBpcyBub3QgYSBkaXJlY3RvcnkhXCIpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjdXJyZW50Q29uZiA9IHBhcmVudENvbmY7XG5cbiAgICAgICAgICAgIHZhciBjdXJyZW50Tm9kZSA9IHRoaXMuX19nZXREZWZhdWx0Tm9kZVN0cnVjdHVyZSgpO1xuICAgICAgICAgICAgY3VycmVudE5vZGUuX19tZXRhLnBhcmVudCA9IHBhdGguZGlybmFtZShkaXIpO1xuICAgICAgICAgICAgY3VycmVudE5vZGUuX19tZXRhLmlzRGlyZWN0b3J5ID0gdHJ1ZTtcblxuICAgICAgICAgICAgdmFyIGZpbGVzID0gZnMucmVhZGRpclN5bmMoZGlyKTtcbiAgICAgICAgICAgIC8vIGZpcnN0IGxvb2sgZm9yIGNvbmYgZmlsZVxuICAgICAgICAgICAgaWYoZmlsZXMuaW5kZXhPZih0aGlzLmNvbmZpZy5jb25mRmlsZU5hbWUpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGxldCBmZCA9IHBhdGguam9pbihkaXIsIHRoaXMuY29uZmlnLmNvbmZGaWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgbGV0IGNvbmYgPSB0aGlzLl9fcmVhZENvbmYoZmQpO1xuICAgICAgICAgICAgICAgIGlmKGNvbmYpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudE5vZGUuX19tZXRhLmNvbmYgPSBjb25mO1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29uZiA9IGNvbmY7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdXJyZW50Tm9kZS5kYXRhLm5hbWUgPSBwYXRoLmJhc2VuYW1lKGRpcik7XG4gICAgICAgICAgICBjdXJyZW50Tm9kZS5kYXRhLnBhdGggPSBkaXI7XG4gICAgICAgICAgICBjdXJyZW50Tm9kZS5pdGVtcyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwLCBsZW4gPSBmaWxlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBpdGVtID0gZmlsZXNbaV07XG5cbiAgICAgICAgICAgICAgICBsZXQgZmQgPSBwYXRoLmpvaW4oZGlyLCBpdGVtKTtcbiAgICAgICAgICAgICAgICBsZXQgc3RhdCA9IGZzLnN0YXRTeW5jKGZkKTtcbiAgICAgICAgICAgICAgICBsZXQgaXNEaXIgPSBzdGF0LmlzRGlyZWN0b3J5KCk7XG4gICAgICAgICAgICAgICAgbGV0IGlzVGVzdERpciA9IHRoaXMuX19pc1Rlc3REaXIoZmQpO1xuXG4gICAgICAgICAgICAgICAgaWYoaXNEaXIgJiYgIWlzVGVzdERpcikgY29udGludWU7IC8vIGlnbm9yZSBkaXJzIHRoYXQgZG9lcyBub3QgZm9sbG93IHRoZSBuYW1pbmcgcnVsZSBmb3IgdGVzdCBkaXJzXG5cbiAgICAgICAgICAgICAgICBpZighaXNEaXIgJiYgaXRlbS5tYXRjaCh0aGlzLmNvbmZpZy5jb25mRmlsZU5hbWUpKXtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7IC8vIGFscmVhZHkgcHJvY2Vzc2VkXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gZXhjbHVkZSBmaWxlcyBiYXNlZCBvbiBnbG9iIHBhdHRlcm5zXG4gICAgICAgICAgICAgICAgaWYoY3VycmVudENvbmYpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY3VycmVudENvbmZbJ2lnbm9yZSddIC0gYXJyYXkgb2YgcmVnRXhwXG4gICAgICAgICAgICAgICAgICAgIGlmKGN1cnJlbnRDb25mWydpZ25vcmUnXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlzTWF0Y2ggPSB0aGlzLl9faXNBbnlNYXRjaChjdXJyZW50Q29uZlsnaWdub3JlJ10sIGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXNNYXRjaCkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgY2hpbGROb2RlID0gdGhpcy5fX2dldERlZmF1bHROb2RlU3RydWN0dXJlKCk7XG4gICAgICAgICAgICAgICAgY2hpbGROb2RlLl9fbWV0YS5jb25mID0ge307XG4gICAgICAgICAgICAgICAgY2hpbGROb2RlLl9fbWV0YS5pc0RpcmVjdG9yeSA9IGlzRGlyO1xuICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5fX21ldGEucGFyZW50ID0gcGF0aC5kaXJuYW1lKGZkKTtcblxuICAgICAgICAgICAgICAgIGlmIChpc0Rpcikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcENoaWxkTm9kZSA9IHRoaXMuX19kaXNjb3ZlclRlc3RGaWxlcyhmZCwgY3VycmVudENvbmYpO1xuICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBPYmplY3QuYXNzaWduKGNoaWxkTm9kZSwgdGVtcENoaWxkTm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlLml0ZW1zLnB1c2goY2hpbGROb2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZihwYXRoLmV4dG5hbWUoZmQpID09PSAgdGhpcy5jb25maWcuZmlsZUV4dCl7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5fX21ldGEuY29uZi5ydW5zID0gY3VycmVudENvbmZbJ3J1bnMnXSB8fCAxO1xuICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUuX19tZXRhLmNvbmYuc2lsZW50ID0gY3VycmVudENvbmZbJ3NpbGVudCddO1xuICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUuX19tZXRhLmNvbmYudGltZW91dCA9IGN1cnJlbnRDb25mWyd0aW1lb3V0J107XG5cbiAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLmRhdGEubmFtZSA9IGl0ZW07XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5kYXRhLnBhdGggPSBmZDtcblxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZS5pdGVtcy5wdXNoKGNoaWxkTm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudE5vZGU7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMYXVuY2ggY29sbGVjdGVkIHRlc3RzLiBJbml0aWFsaXNlcyBzZXNzaW9uIHZhcmlhYmxlcywgdGhhdCBhcmUgc3BlY2lmaWMgZm9yIHRoZSBjdXJyZW50IGxhdW5jaC5cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fbGF1bmNoVGVzdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fX2NvbnNvbGVMb2coXCJMYXVuY2hpbmcgdGVzdHMgLi4uXCIpO1xuICAgICAgICAgICAgdGhpcy5zZXNzaW9uLnRlc3RDb3VudCA9IHRoaXMudGVzdExpc3QubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5zZXNzaW9uLnByb2Nlc3NlZFRlc3RDb3VudCA9IDA7XG4gICAgICAgICAgICB0aGlzLnNlc3Npb24ud29ya2Vycy5ydW5uaW5nID0gMDtcbiAgICAgICAgICAgIHRoaXMuc2Vzc2lvbi53b3JrZXJzLnRlcm1pbmF0ZWQgPSAwO1xuXG4gICAgICAgICAgICBpZih0aGlzLnNlc3Npb24udGVzdENvdW50ID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX19zY2hlZHVsZVdvcmsoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX2RvVGVzdFJlcG9ydHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNjaGVkdWxlcyB3b3JrIGJhc2VkIG9uIHRoZSBNQVggYXZhaWxhYmxlIHdvcmtlcnMsIGFuZCBiYXNlZCBvbiB0aGUgbnVtYmVyIG9mIHJ1bnMgb2YgYSB0ZXN0LlxuICAgICAgICAgKiBJZiBhIHRlc3QgaGFzIG11bHRpcGxlIHJ1bnMgYXMgYSBvcHRpb24sIGl0IHdpbGwgYmUgc3RhcnRlZCBpbiBtdWx0aXBsZSB3b3JrZXJzLiBPbmNlIGFsbCBydW5zIGFyZSBjb21wbGV0ZWQsXG4gICAgICAgICAqIHRoZSB0ZXN0IGlzIGNvbnNpZGVyZWQgYXMgcHJvY2Vzc2VkLlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19zY2hlZHVsZVdvcms6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgd2hpbGUodGhpcy5zZXNzaW9uLndvcmtlcnMucnVubmluZyA8IE1BWF9XT1JLRVJTICYmIHRoaXMuc2Vzc2lvbi5jdXJyZW50VGVzdEluZGV4IDwgdGhpcy5zZXNzaW9uLnRlc3RDb3VudCl7XG4gICAgICAgICAgICAgICAgbGV0IHRlc3QgPSB0aGlzLnRlc3RMaXN0W3RoaXMuc2Vzc2lvbi5jdXJyZW50VGVzdEluZGV4XTtcbiAgICAgICAgICAgICAgICBpZih0ZXN0LnJlc3VsdC5ydW5zIDwgdGVzdC5fX21ldGEuY29uZi5ydW5zKSB7XG4gICAgICAgICAgICAgICAgICAgIHRlc3QucmVzdWx0LnJ1bnMrKztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2xhdW5jaFRlc3QodGVzdCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXNzaW9uLmN1cnJlbnRUZXN0SW5kZXgrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMYXVuY2ggYSB0ZXN0IGludG8gYSBzZXBhcmF0ZSB3b3JrZXIgKGNoaWxkIHByb2Nlc3MpLlxuICAgICAgICAgKiBFYWNoIHdvcmtlciBoYXMgaGFuZGxlcnMgZm9yIG1lc3NhZ2UsIGV4aXQgYW5kIGVycm9yIGV2ZW50cy4gT25jZSB0aGUgZXhpdCBvciBlcnJvciBldmVudCBpcyBpbnZva2VkLFxuICAgICAgICAgKiBuZXcgd29yayBpcyBzY2hlZHVsZWQgYW5kIHNlc3Npb24gb2JqZWN0IGlzIHVwZGF0ZWQuXG4gICAgICAgICAqIE5vdGVzOiBPbiBkZWJ1ZyBtb2RlLCB0aGUgd29ya2VycyB3aWxsIHJlY2VpdmUgYSBkZWJ1ZyBwb3J0LCB0aGF0IGlzIGluY3JlYXNlZCBpbmNyZW1lbnRhbGx5LlxuICAgICAgICAgKiBAcGFyYW0gdGVzdCB7T2JqZWN0fSAtIHRlc3Qgb2JqZWN0XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX2xhdW5jaFRlc3Q6IGZ1bmN0aW9uKHRlc3QpIHtcbiAgICAgICAgICAgIHRoaXMuc2Vzc2lvbi53b3JrZXJzLnJ1bm5pbmcrKztcblxuICAgICAgICAgICAgdGVzdC5yZXN1bHQuc3RhdGUgPSBURVNUX1NUQVRFUy5SVU5OSU5HO1xuICAgICAgICAgICAgdGVzdC5yZXN1bHQucGFzcyA9IHRlc3QucmVzdWx0LnBhc3MgfHwgdHJ1ZTtcbiAgICAgICAgICAgIHRlc3QucmVzdWx0LmFzc2VydHNbdGVzdC5yZXN1bHQucnVuc10gPSBbXTtcbiAgICAgICAgICAgIHRlc3QucmVzdWx0Lm1lc3NhZ2VzW3Rlc3QucmVzdWx0LnJ1bnNdID0gW107XG5cbiAgICAgICAgICAgIHZhciBlbnYgPSBwcm9jZXNzLmVudjtcblxuICAgICAgICAgICAgbGV0IGV4ZWNBcmd2ID0gW107XG4gICAgICAgICAgICBpZihERUJVRykge1xuICAgICAgICAgICAgICAgIGxldCBkZWJ1Z1BvcnQgPSArK2RlZmF1bHRTZXNzaW9uLmRlYnVnUG9ydDtcbiAgICAgICAgICAgICAgICBsZXQgZGVidWdGbGFnID0gJy0tZGVidWc9JyArIGRlYnVnUG9ydDtcbiAgICAgICAgICAgICAgICBleGVjQXJndi5wdXNoKGRlYnVnRmxhZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBjd2QgPSB0ZXN0Ll9fbWV0YS5wYXJlbnQ7XG5cbiAgICAgICAgICAgIHZhciB3b3JrZXIgPSBmb3JrZXIuZm9yayh0ZXN0LmRhdGEucGF0aCwgW10sIHsnY3dkJzogY3dkLCAnZW52JzogZW52LCAnZXhlY0FyZ3YnOiBleGVjQXJndiwgc3RkaW86IFsnaW5oZXJpdCcsIFwicGlwZVwiLCAnaW5oZXJpdCcsICdpcGMnXSB9KTtcblxuICAgICAgICAgICAgdGhpcy5fX2RlYnVnSW5mbyhgTGF1bmNoaW5nIHRlc3QgJHt0ZXN0LmRhdGEubmFtZX0sIHJ1blske3Rlc3QucmVzdWx0LnJ1bnN9XSwgb24gd29ya2VyIHBpZFske3dvcmtlci5waWR9XWApO1xuXG4gICAgICAgICAgICB3b3JrZXIub24oXCJtZXNzYWdlXCIsIG9uTWVzc2FnZUV2ZW50SGFuZGxlcldyYXBwZXIodGVzdCkpO1xuICAgICAgICAgICAgd29ya2VyLm9uKFwiZXhpdFwiLCBvbkV4aXRFdmVudEhhbmRsZXJXcmFwcGVyKHRlc3QpKTtcbiAgICAgICAgICAgIHdvcmtlci5vbihcImVycm9yXCIsIG9uRXJyb3JFdmVudEhhbmRsZXJXcmFwcGVyKHRlc3QpKTtcbiAgICAgICAgICAgIHdvcmtlci50ZXJtaW5hdGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHdvcmtlci5zdGRvdXQub24oJ2RhdGEnLCBmdW5jdGlvbiAoY2h1bmspIHtcbiAgICAgICAgICAgICAgICBsZXQgY29udGVudCA9IG5ldyBCdWZmZXIoY2h1bmspLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgICAgICAgICAgaWYodGVzdC5fX21ldGEuY29uZi5zaWxlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2NvbnNvbGVMb2coY29udGVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgZnVuY3Rpb24gb25NZXNzYWdlRXZlbnRIYW5kbGVyV3JhcHBlcih0ZXN0KSB7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRSdW4gPSB0ZXN0LnJlc3VsdC5ydW5zO1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihsb2cpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYobG9nLnR5cGUgPT09ICdhc3NlcnQnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGxvZy5tZXNzYWdlLmluY2x1ZGVzKFwiW0ZhaWxcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0LnJlc3VsdC5wYXNzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXN0LnJlc3VsdC5hc3NlcnRzW2N1cnJlbnRSdW5dLnB1c2gobG9nKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlc3QucmVzdWx0Lm1lc3NhZ2VzW2N1cnJlbnRSdW5dLnB1c2gobG9nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gb25FeGl0RXZlbnRIYW5kbGVyV3JhcHBlcih0ZXN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGNvZGUsIHNpZ25hbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9fZGVidWdJbmZvKGBXb3JrZXIgJHt3b3JrZXIucGlkfSAtIGV4aXQgZXZlbnQuIENvZGUgJHtjb2RlfSwgc2lnbmFsICR7c2lnbmFsfWApO1xuXG4gICAgICAgICAgICAgICAgICAgIHdvcmtlci50ZXJtaW5hdGVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICB0ZXN0LnJlc3VsdC5zdGF0ZSA9IFRFU1RfU1RBVEVTLkZJTklTSEVEO1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2Vzc2lvbi53b3JrZXJzLnJ1bm5pbmctLTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXNzaW9uLndvcmtlcnMudGVybWluYXRlZCsrO1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX19zY2hlZHVsZVdvcmsoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fX2NoZWNrV29ya2Vyc1N0YXR1cygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdGhpcyBoYW5kbGVyIGNhbiBiZSB0cmlnZ2VyZWQgd2hlbjpcbiAgICAgICAgICAgIC8vIDEuIFRoZSBwcm9jZXNzIGNvdWxkIG5vdCBiZSBzcGF3bmVkLCBvclxuICAgICAgICAgICAgLy8gMi4gVGhlIHByb2Nlc3MgY291bGQgbm90IGJlIGtpbGxlZCwgb3JcbiAgICAgICAgICAgIC8vIDMuIFNlbmRpbmcgYSBtZXNzYWdlIHRvIHRoZSBjaGlsZCBwcm9jZXNzIGZhaWxlZC5cbiAgICAgICAgICAgIC8vIElNUE9SVEFOVDogVGhlICdleGl0JyBldmVudCBtYXkgb3IgbWF5IG5vdCBmaXJlIGFmdGVyIGFuIGVycm9yIGhhcyBvY2N1cnJlZCFcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uRXJyb3JFdmVudEhhbmRsZXJXcmFwcGVyKHRlc3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fX2RlYnVnSW5mbyhgV29ya2VyICR7d29ya2VyLnBpZH0gLSBlcnJvciBldmVudC5gKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fX2RlYnVnRXJyb3IoZXJyb3IpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2Vzc2lvbi53b3JrZXJzLnJ1bm5pbmctLTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXNzaW9uLndvcmtlcnMudGVybWluYXRlZCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTm90ZTogb24gZGVidWcsIHRoZSB0aW1lb3V0IGlzIHJlYWNoZWQgYmVmb3JlIGV4aXQgZXZlbnQgaXMgY2FsbGVkXG4gICAgICAgICAgICAvLyB3aGVuIGtpbGwgaXMgY2FsbGVkLCB0aGUgZXhpdCBldmVudCBpcyByYWlzZWRcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBpZighd29ya2VyLnRlcm1pbmF0ZWQpe1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9fZGVidWdJbmZvKGB3b3JrZXIgcGlkIFske3dvcmtlci5waWR9XSAtIHRpbWVvdXQgZXZlbnRgKTtcblxuICAgICAgICAgICAgICAgICAgICB3b3JrZXIua2lsbCgpO1xuICAgICAgICAgICAgICAgICAgICB0ZXN0LnJlc3VsdC5zdGF0ZSA9IFRFU1RfU1RBVEVTLlRJTUVPVVQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGVzdC5fX21ldGEuY29uZi50aW1lb3V0KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrcyBpZiBhbGwgd29ya2VycyBjb21wbGV0ZWQgdGhlaXIgam9iIChmaW5pc2hlZCBvciBoYXZlIGJlZW4gdGVybWluYXRlZCkuXG4gICAgICAgICAqIElmIHRydWUsIHRoZW4gdGhlIHJlcG9ydGluZyBzdGVwcyBjYW4gYmUgc3RhcnRlZC5cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fY2hlY2tXb3JrZXJzU3RhdHVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuc2Vzc2lvbi53b3JrZXJzLnJ1bm5pbmcgPT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX19kb1Rlc3RSZXBvcnRzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGVzIHRlc3QgcmVwb3J0cyBvYmplY3QgKEpTT04pIHRoYXQgd2lsbCBiZSBzYXZlZCBpbiB0aGUgdGVzdCByZXBvcnQuXG4gICAgICAgICAqIEZpbGVuYW1lIG9mIHRoZSByZXBvcnQgaXMgdXNpbmcgdGhlIGZvbGxvd2luZyBwYXR0ZXJuOiB7cHJlZml4fS17dGltZXN0YW1wfXtleHR9XG4gICAgICAgICAqIFRoZSBmaWxlIHdpbGwgYmUgc2F2ZWQgaW4gY29uZmlnLnJlcG9ydHMuYmFzZVBhdGguXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX2RvVGVzdFJlcG9ydHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fX2NvbnNvbGVMb2coXCJEb2luZyByZXBvcnRzIC4uLlwiKTtcbiAgICAgICAgICAgIHJlcG9ydEZpbGVTdHJ1Y3R1cmUuY291bnQgPSB0aGlzLnRlc3RMaXN0Lmxlbmd0aDtcblxuICAgICAgICAgICAgLy8gcGFzcy9mYWlsZWQgdGVzdHNcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDAsIGxlbiA9IHRoaXMudGVzdExpc3QubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgdGVzdCA9IHRoaXMudGVzdExpc3RbaV07XG5cbiAgICAgICAgICAgICAgICBsZXQgdGVzdFBhdGggPSB0aGlzLl9fdG9SZWxhdGl2ZVBhdGgodGVzdC5kYXRhLnBhdGgpO1xuICAgICAgICAgICAgICAgIGxldCBpdGVtID0ge3BhdGg6IHRlc3RQYXRofTtcbiAgICAgICAgICAgICAgICBpZih0ZXN0LnJlc3VsdC5wYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcG9ydEZpbGVTdHJ1Y3R1cmUucGFzc2VkLml0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5yZWFzb24gPSB0aGlzLl9fZ2V0Rmlyc3RGYWlsUmVhc29uUGVyUnVuKHRlc3QpO1xuICAgICAgICAgICAgICAgICAgICByZXBvcnRGaWxlU3RydWN0dXJlLmZhaWxlZC5pdGVtcy5wdXNoKGl0ZW0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVwb3J0RmlsZVN0cnVjdHVyZS5wYXNzZWQuY291bnQgPSByZXBvcnRGaWxlU3RydWN0dXJlLnBhc3NlZC5pdGVtcy5sZW5ndGg7XG4gICAgICAgICAgICByZXBvcnRGaWxlU3RydWN0dXJlLmZhaWxlZC5jb3VudCA9IHJlcG9ydEZpbGVTdHJ1Y3R1cmUuZmFpbGVkLml0ZW1zLmxlbmd0aDtcblxuICAgICAgICAgICAgLy8gc3VpdGVzIChmaXJzdCBsZXZlbCBvZiBkaXJlY3RvcmllcylcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDAsIGxlbiA9IHRoaXMudGVzdFRyZWUuaXRlbXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IHRoaXMudGVzdFRyZWUuaXRlbXNbaV07XG4gICAgICAgICAgICAgICAgaWYoaXRlbS5fX21ldGEuaXNEaXJlY3RvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1aXRlUGF0aCA9IHRoaXMuX190b1JlbGF0aXZlUGF0aChpdGVtLmRhdGEucGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIHJlcG9ydEZpbGVTdHJ1Y3R1cmUuc3VpdGVzLml0ZW1zLnB1c2goc3VpdGVQYXRoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcG9ydEZpbGVTdHJ1Y3R1cmUuc3VpdGVzLmNvdW50ID0gcmVwb3J0RmlsZVN0cnVjdHVyZS5zdWl0ZXMuaXRlbXMubGVuZ3RoO1xuXG4gICAgICAgICAgICBjb25zdCB3cml0ZVJlcG9ydHMgPSB0aGlzLnBhcmFsbGVsKGZ1bmN0aW9uIChlcnIsIHJlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2soZXJyLCBcIkRvbmVcIik7XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICB0aGlzLl9fY29uc29sZUxvZyh0aGlzLmNvbmZpZy5yZXBvcnRzLnByZWZpeCk7XG4gICAgICAgICAgICBsZXQgZmlsZU5hbWUgPSBgJHt0aGlzLmNvbmZpZy5yZXBvcnRzLnByZWZpeH1sYXRlc3Qke3RoaXMuY29uZmlnLnJlcG9ydHMuZXh0fWA7XG4gICAgICAgICAgICBsZXQgZmlsZVBhdGggPSBwYXRoLmpvaW4odGhpcy5jb25maWcucmVwb3J0cy5iYXNlUGF0aCwgZmlsZU5hbWUpO1xuICAgICAgICAgICAgd3JpdGVSZXBvcnRzLl9fc2F2ZVJlcG9ydFRvRmlsZShyZXBvcnRGaWxlU3RydWN0dXJlLCBmaWxlUGF0aCk7XG5cbiAgICAgICAgICAgIGxldCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKS50b1N0cmluZygpO1xuICAgICAgICAgICAgY29uc3QgaHRtbEZpbGVOYW1lID0gYCR7dGhpcy5jb25maWcucmVwb3J0cy5wcmVmaXh9bGF0ZXN0Lmh0bWxgO1xuICAgICAgICAgICAgY29uc3QgaHRtbEZpbGVQYXRoID0gcGF0aC5qb2luKHRoaXMuY29uZmlnLnJlcG9ydHMuYmFzZVBhdGgsIGh0bWxGaWxlTmFtZSk7XG4gICAgICAgICAgICB3cml0ZVJlcG9ydHMuX19zYXZlSHRtbFJlcG9ydFRvRmlsZShyZXBvcnRGaWxlU3RydWN0dXJlLCBodG1sRmlsZVBhdGgsIHRpbWVzdGFtcCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTYXZlcyB0ZXN0IHJlcG9ydHMgb2JqZWN0IChKU09OKSBpbiB0aGUgc3BlY2lmaWVkIHBhdGguXG4gICAgICAgICAqIEBwYXJhbSByZXBvcnRGaWxlU3RydWN0dXJlIHtPYmplY3R9IC0gdGVzdCByZXBvcnRzIG9iamVjdCAoSlNPTilcbiAgICAgICAgICogQHBhcmFtIGRlc3RpbmF0aW9uIHtTdHJpbmd9IC0gcGF0aCBvZiB0aGUgZmlsZSByZXBvcnQgKHRoZSBiYXNlIHBhdGggTVVTVCBleGlzdClcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fc2F2ZVJlcG9ydFRvRmlsZTogZnVuY3Rpb24ocmVwb3J0RmlsZVN0cnVjdHVyZSwgZGVzdGluYXRpb24pIHtcblxuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSBKU09OLnN0cmluZ2lmeShyZXBvcnRGaWxlU3RydWN0dXJlLCBudWxsLCA0KTtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZShkZXN0aW5hdGlvbiwgY29udGVudCwgJ3V0ZjgnLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IFwiQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgd3JpdGluZyB0aGUgcmVwb3J0IGZpbGUsIHdpdGggdGhlIGZvbGxvd2luZyBlcnJvcjogXCIgKyBKU09OLnN0cmluZ2lmeShlcnIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9fZGVidWdJbmZvKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfSBlbHNle1xuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IGBGaW5pc2hlZCB3cml0aW5nIHJlcG9ydCB0byAke2Rlc3RpbmF0aW9ufWA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX19jb25zb2xlTG9nKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTYXZlcyB0ZXN0IHJlcG9ydHMgYXMgSFRNTCBpbiB0aGUgc3BlY2lmaWVkIHBhdGguXG4gICAgICAgICAqIEBwYXJhbSByZXBvcnRGaWxlU3RydWN0dXJlIHtPYmplY3R9IC0gdGVzdCByZXBvcnRzIG9iamVjdCAoSlNPTilcbiAgICAgICAgICogQHBhcmFtIGRlc3RpbmF0aW9uIHtTdHJpbmd9IC0gcGF0aCBvZiB0aGUgZmlsZSByZXBvcnQgKHRoZSBiYXNlIHBhdGggTVVTVCBleGlzdClcbiAgICAgICAgICogQHBhcmFtIHRpbWVzdGFtcCB7U3RyaW5nfSAtIHRpbWVzdGFtcCB0byBiZSBpbmplY3RlZCBpbiBodG1sIHRlbXBsYXRlXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX3NhdmVIdG1sUmVwb3J0VG9GaWxlOiBmdW5jdGlvbiAocmVwb3J0RmlsZVN0cnVjdHVyZSwgZGVzdGluYXRpb24sIHRpbWVzdGFtcCkge1xuICAgICAgICAgICAgZnMucmVhZEZpbGUoX19kaXJuYW1lKycvdXRpbHMvcmVwb3J0VGVtcGxhdGUuaHRtbCcsICd1dGY4JywgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9ICdBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSByZWFkaW5nIHRoZSBodG1sIHJlcG9ydCB0ZW1wbGF0ZSBmaWxlLCB3aXRoIHRoZSBmb2xsb3dpbmcgZXJyb3I6ICcgKyBKU09OLnN0cmluZ2lmeShlcnIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9fZGVidWdJbmZvKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlKGRlc3RpbmF0aW9uLCByZXMgKyBgPHNjcmlwdD5pbml0KCR7SlNPTi5zdHJpbmdpZnkocmVwb3J0RmlsZVN0cnVjdHVyZSl9LCAke3RpbWVzdGFtcH0pOzwvc2NyaXB0PmAsICd1dGY4JywgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9ICdBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSB3cml0aW5nIHRoZSBodG1sIHJlcG9ydCBmaWxlLCB3aXRoIHRoZSBmb2xsb3dpbmcgZXJyb3I6ICcgKyBKU09OLnN0cmluZ2lmeShlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2RlYnVnSW5mbyhtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gYEZpbmlzaGVkIHdyaXRpbmcgcmVwb3J0IHRvICR7ZGVzdGluYXRpb259YDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2NvbnNvbGVMb2cobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbnZlcnRzIGFic29sdXRlIGZpbGUgcGF0aCB0byByZWxhdGl2ZSBwYXRoLlxuICAgICAgICAgKiBAcGFyYW0gYWJzb2x1dGVQYXRoIHtTdHJpbmd9IC0gYWJzb2x1dGUgcGF0aFxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgdm9pZCB8ICp9IC0gcmVsYXRpdmUgcGF0aFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX190b1JlbGF0aXZlUGF0aDogZnVuY3Rpb24oYWJzb2x1dGVQYXRoKSB7XG4gICAgICAgICAgICBsZXQgYmFzZVBhdGggPSBwYXRoLmpvaW4odGhpcy5jb25maWcudGVzdHNEaXIsIFwiL1wiKTtcbiAgICAgICAgICAgIGxldCByZWxhdGl2ZVBhdGggPSBhYnNvbHV0ZVBhdGgucmVwbGFjZShiYXNlUGF0aCwgXCJcIik7XG4gICAgICAgICAgICByZXR1cm4gcmVsYXRpdmVQYXRoO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2tzIGlmIGEgZGlyZWN0b3J5IGlzIGEgdGVzdCBkaXIsIGJ5IG1hdGNoaW5nIGl0cyBuYW1lIGFnYWluc3QgY29uZmlnLm1hdGNoRGlycyBhcnJheS5cbiAgICAgICAgICogQHBhcmFtIGRpciB7U3RyaW5nfSAtIGRpcmVjdG9yeSBuYW1lXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIHJldHVybnMgdHJ1ZSBpZiB0aGVyZSBpcyBhIG1hdGNoIGFuZCBmYWxzZSBvdGhlcndpc2UuXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX2lzVGVzdERpcjogZnVuY3Rpb24oZGlyKSB7XG4gICAgICAgICAgICBpZighdGhpcy5jb25maWcgfHwgIXRoaXMuY29uZmlnLm1hdGNoRGlycyApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBgbWF0Y2hEaXJzIGlzIG5vdCBkZWZpbmVkIG9uIGNvbmZpZyAke0pTT04uc3RyaW5naWZ5KHRoaXMuY29uZmlnKX0gZG9lcyBub3QgZXhpc3QhYDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGlzVGVzdERpciA9IHRoaXMuY29uZmlnLm1hdGNoRGlycy5zb21lKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoaXRlbS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gaXNUZXN0RGlyO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogRm9yIGEgZmFpbGVkIHRlc3QsIGl0IHJldHVybnMgb25seSB0aGUgZmlyc3QgZmFpbCByZWFzb24gcGVyIGVhY2ggcnVuLlxuICAgICAgICAgKiBAcGFyYW0gdGVzdCB7T2JqZWN0fSAtIHRlc3Qgb2JqZWN0XG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX0gLSBhbiBhcnJheSBvZiByZWFzb25zIHBlciBlYWNoIHRlc3QgcnVuLlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19nZXRGaXJzdEZhaWxSZWFzb25QZXJSdW46IGZ1bmN0aW9uKHRlc3QpIHtcbiAgICAgICAgICAgIGxldCByZWFzb24gPSBbXTtcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDE7IGkgPD0gdGVzdC5yZXN1bHQucnVuczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYodGVzdC5yZXN1bHQuYXNzZXJ0c1tpXSAmJiB0ZXN0LnJlc3VsdC5hc3NlcnRzW2ldLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkUmVhc29uKGksIHRlc3QucmVzdWx0LmFzc2VydHNbaV1bMF0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKHRlc3QucmVzdWx0Lm1lc3NhZ2VzW2ldICYmIHRlc3QucmVzdWx0Lm1lc3NhZ2VzW2ldLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkUmVhc29uKGksIHRlc3QucmVzdWx0Lm1lc3NhZ2VzW2ldWzBdKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGFkZFJlYXNvbihydW4sIGxvZykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bjogcnVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nOiBsb2dcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZWFzb24ucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZWFzb247XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZXNjcmliZWQgZGVmYXVsdCB0cmVlIG5vZGUgc3RydWN0dXJlLlxuICAgICAgICAgKiBAcmV0dXJucyB7e19fbWV0YToge2NvbmY6IG51bGwsIHBhcmVudDogbnVsbCwgaXNEaXJlY3Rvcnk6IGJvb2xlYW59LCBkYXRhOiB7bmFtZTogbnVsbCwgcGF0aDogbnVsbH0sIHJlc3VsdDoge3N0YXRlOiBzdHJpbmcsIHBhc3M6IG51bGwsIGV4ZWN1dGlvblRpbWU6IG51bWJlciwgcnVuczogbnVtYmVyLCBhc3NlcnRzOiB7fSwgbWVzc2FnZXM6IHt9fSwgaXRlbXM6IG51bGx9fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19nZXREZWZhdWx0Tm9kZVN0cnVjdHVyZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gIHtcbiAgICAgICAgICAgICAgICBfX21ldGE6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uZjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBpc0RpcmVjdG9yeTogZmFsc2VcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogbnVsbCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlc3VsdDoge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogVEVTVF9TVEFURVMuUkVBRFksIC8vIHJlYWR5IHwgcnVubmluZyB8IHRlcm1pbmF0ZWQgfCB0aW1lb3V0XG4gICAgICAgICAgICAgICAgICAgIHBhc3M6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGV4ZWN1dGlvblRpbWU6IDAsXG4gICAgICAgICAgICAgICAgICAgIHJ1bnM6IDAsXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydHM6IHt9LFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlczoge31cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBudWxsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogTWF0Y2ggYSB0ZXN0IGZpbGUgcGF0aCB0byBhIFVOSVggZ2xvYiBleHByZXNzaW9uIGFycmF5LiBJZiBpdHMgYW55IG1hdGNoIHJldHVybnMgdHJ1ZSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXG4gICAgICAgICAqIEBwYXJhbSBnbG9iRXhwQXJyYXkge0FycmF5fSAtIGFuIGFycmF5IHdpdGggZ2xvYiBleHByZXNzaW9uIChVTklYIHN0eWxlKVxuICAgICAgICAgKiBAcGFyYW0gc3RyIHtTdHJpbmd9IC0gdGhlIHN0cmluZyB0byBiZSBtYXRjaGVkXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIHJldHVybnMgdHJ1ZSBpZiB0aGVyZSBpcyBhbnkgbWF0Y2ggYW5kIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9faXNBbnlNYXRjaDogZnVuY3Rpb24oZ2xvYkV4cEFycmF5LCBzdHIpIHtcbiAgICAgICAgICAgIGxldCBoYXNNYXRjaCA9IGZ1bmN0aW9uKGdsb2JFeHApIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVnZXggPSBnbG9iVG9SZWdFeHAoZ2xvYkV4cCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlZ2V4LnRlc3Qoc3RyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGdsb2JFeHBBcnJheS5zb21lKGhhc01hdGNoKVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQ29udmVydHMgYSB0cmVlIHN0cnVjdHVyZSBpbnRvIGFuIGFycmF5IGxpc3Qgb2YgdGVzdCBub2Rlcy4gVGhlIHRyZWUgdHJhdmVyc2FsIGlzIERGUyAoRGVlcC1GaXJzdC1TZWFyY2gpLlxuICAgICAgICAgKiBAcGFyYW0gcm9vdE5vZGUge09iamVjdH0gLSByb290IG5vZGUgb2YgdGhlIHRlc3QgdHJlZS5cbiAgICAgICAgICogQHJldHVybnMge0FycmF5fSAtIExpc3Qgb2YgdGVzdCBub2Rlcy5cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fdG9UZXN0VHJlZVRvTGlzdDogZnVuY3Rpb24ocm9vdE5vZGUpIHtcbiAgICAgICAgICAgIHZhciB0ZXN0TGlzdCA9IFtdO1xuXG4gICAgICAgICAgICB0cmF2ZXJzZShyb290Tm9kZSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHRyYXZlcnNlKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZighbm9kZS5fX21ldGEuaXNEaXJlY3RvcnkgfHwgIW5vZGUuaXRlbXMpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGZvcihsZXQgaSA9IDAsIGxlbiA9IG5vZGUuaXRlbXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBub2RlLml0ZW1zW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZihpdGVtLl9fbWV0YS5pc0RpcmVjdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhdmVyc2UoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXN0TGlzdC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGVzdExpc3Q7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMb2dnaW5nIHRvIGNvbnNvbGUgd3JhcHBlci5cbiAgICAgICAgICogQHBhcmFtIGxvZyB7U3RyaW5nfE9iamVjdHxOdW1iZXJ9IC0gbG9nIG1lc3NhZ2VcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fY29uc29sZUxvZzogZnVuY3Rpb24obG9nKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhUQUcsIGxvZyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMb2dnaW5nIGRlYnVnZ2luZyBpbmZvIG1lc3NhZ2VzIHdyYXBwZXIuXG4gICAgICAgICAqIExvZ2dlcjogY29uc29sZS5pbmZvXG4gICAgICAgICAqIEBwYXJhbSBsb2cge1N0cmluZ3xPYmplY3R8TnVtYmVyfSAtIGxvZyBtZXNzYWdlXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX2RlYnVnSW5mbzogZnVuY3Rpb24obG9nKSB7XG4gICAgICAgICAgICB0aGlzLl9fZGVidWcoY29uc29sZS5pbmZvLCBsb2cpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogTG9nZ2luZyBkZWJ1Z2dpbmcgZXJyb3IgbWVzc2FnZXMgd3JhcHBlci5cbiAgICAgICAgICogTG9nZ2VyOiBjb25zb2xlLmVycm9yXG4gICAgICAgICAqIEBwYXJhbSBsb2cge1N0cmluZ3xPYmplY3R8TnVtYmVyfSAtIGxvZyBtZXNzYWdlXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfX2RlYnVnRXJyb3I6IGZ1bmN0aW9uKGxvZykge1xuICAgICAgICAgICAgdGhpcy5fX2RlYnVnKGNvbnNvbGUuZXJyb3IsIGxvZyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgTG9nZ2luZyBkZWJ1Z2dpbmcgbWVzc2FnZXMgd3JhcHBlci4gT25lIGRlYnVnIG1vZGUsIHRoZSBsb2dnaW5nIGlzIHNpbGVudC5cbiAgICAgICAgICogQHBhcmFtIGxvZ2dlciB7RnVuY3Rpb259IC0gaGFuZGxlciBmb3IgbG9nZ2luZ1xuICAgICAgICAgKiBAcGFyYW0gbG9nIHtTdHJpbmd8T2JqZWN0fE51bWJlcn0gLSBsb2cgbWVzc2FnZVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX19kZWJ1ZzogZnVuY3Rpb24obG9nZ2VyLCBsb2cpIHtcbiAgICAgICAgICAgIGlmKCFERUJVRykgcmV0dXJuO1xuXG4gICAgICAgICAgICBsZXQgcHJldHR5TG9nID0gSlNPTi5zdHJpbmdpZnkobG9nLCBudWxsLCAyKTtcbiAgICAgICAgICAgIGxvZ2dlcihcIkRFQlVHXCIsIGxvZyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWVwIGV4dGVuZCBvbmUgb2JqZWN0IHdpdGggcHJvcGVydGllcyBvZiBhbm90aGVyIG9iamVjdC5cbiAgICAgICAgICogSWYgdGhlIHByb3BlcnR5IGV4aXN0cyBpbiBib3RoIG9iamVjdHMgdGhlIHByb3BlcnR5IGZyb20gdGhlIGZpcnN0IG9iamVjdCBpcyBvdmVycmlkZGVuLlxuICAgICAgICAgKiBAcGFyYW0gZmlyc3Qge09iamVjdH0gLSB0aGUgZmlyc3Qgb2JqZWN0XG4gICAgICAgICAqIEBwYXJhbSBzZWNvbmQge09iamVjdH0gLSB0aGUgc2Vjb25kIG9iamVjdFxuICAgICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIGFuIG9iamVjdCB3aXRoIGJvdGggcHJvcGVydGllcyBmcm9tIHRoZSBmaXJzdCBhbmQgc2Vjb25kIG9iamVjdC5cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9fZXh0ZW5kOiBmdW5jdGlvbiAoZmlyc3QsIHNlY29uZCkge1xuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHNlY29uZCkge1xuICAgICAgICAgICAgICAgIGlmICghZmlyc3QuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBmaXJzdFtrZXldID0gc2Vjb25kW2tleV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZhbCA9IHNlY29uZFtrZXldO1xuICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2YgZmlyc3Rba2V5XSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IHRoaXMuX19leHRlbmQoZmlyc3Rba2V5XSwgc2Vjb25kW2tleV0pXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBmaXJzdFtrZXldID0gdmFsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZpcnN0O1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuIiwiXG4vLyBnbG9iVG9SZWdFeHAgdHVybnMgYSBVTklYIGdsb2IgZXhwcmVzc2lvbiBpbnRvIGEgUmVnRXggZXhwcmVzc2lvbi5cbi8vICBTdXBwb3J0cyBhbGwgc2ltcGxlIGdsb2IgcGF0dGVybnMuIEV4YW1wbGVzOiAqLmV4dCwgL2Zvby8qLCAuLi8uLi9wYXRoLCBeZm9vLipcbi8vIC0gc2luZ2xlIGNoYXJhY3RlciBtYXRjaGluZywgbWF0Y2hpbmcgcmFuZ2VzIG9mIGNoYXJhY3RlcnMgZXRjLiBncm91cCBtYXRjaGluZyBhcmUgbm8gc3VwcG9ydGVkXG4vLyAtIGZsYWdzIGFyZSBub3Qgc3VwcG9ydGVkXG52YXIgZ2xvYlRvUmVnRXhwID0gZnVuY3Rpb24gKGdsb2JFeHApIHtcbiAgICBpZiAodHlwZW9mIGdsb2JFeHAgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dsb2IgRXhwcmVzc2lvbiBtdXN0IGJlIGEgc3RyaW5nIScpO1xuICAgIH1cblxuICAgIHZhciByZWdFeHAgPSBcIlwiO1xuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGdsb2JFeHAubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgbGV0IGMgPSBnbG9iRXhwW2ldO1xuXG4gICAgICAgIHN3aXRjaCAoYykge1xuICAgICAgICAgICAgY2FzZSBcIi9cIjpcbiAgICAgICAgICAgIGNhc2UgXCIkXCI6XG4gICAgICAgICAgICBjYXNlIFwiXlwiOlxuICAgICAgICAgICAgY2FzZSBcIitcIjpcbiAgICAgICAgICAgIGNhc2UgXCIuXCI6XG4gICAgICAgICAgICBjYXNlIFwiKFwiOlxuICAgICAgICAgICAgY2FzZSBcIilcIjpcbiAgICAgICAgICAgIGNhc2UgXCI9XCI6XG4gICAgICAgICAgICBjYXNlIFwiIVwiOlxuICAgICAgICAgICAgY2FzZSBcInxcIjpcbiAgICAgICAgICAgICAgICByZWdFeHAgKz0gXCJcXFxcXCIgKyBjO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFwiKlwiOlxuICAgICAgICAgICAgICAgIC8vIHRyZWF0IGFueSBudW1iZXIgb2YgXCIqXCIgYXMgb25lXG4gICAgICAgICAgICAgICAgd2hpbGUoZ2xvYkV4cFtpICsgMV0gPT09IFwiKlwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVnRXhwICs9IFwiLipcIjtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZWdFeHAgKz0gYztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNldCB0aGUgcmVndWxhciBleHByZXNzaW9uIHdpdGggXiAmICRcbiAgICByZWdFeHAgPSBcIl5cIiArIHJlZ0V4cCArIFwiJFwiO1xuXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAocmVnRXhwKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2xvYlRvUmVnRXhwIiwiY29uc3QgUHNrQ3J5cHRvID0gcmVxdWlyZShcIi4vbGliL1Bza0NyeXB0b1wiKTtcblxuY29uc3Qgc3N1dGlsID0gcmVxdWlyZShcIi4vc2lnbnNlbnN1c0RTL3NzdXRpbFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBza0NyeXB0bztcblxubW9kdWxlLmV4cG9ydHMuaGFzaFZhbHVlcyA9IHNzdXRpbC5oYXNoVmFsdWVzO1xuXG4iLCJjb25zdCBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTtcbmNvbnN0IEtleUVuY29kZXIgPSByZXF1aXJlKCcuL2tleUVuY29kZXInKTtcblxuZnVuY3Rpb24gRUNEU0EoY3VydmVOYW1lKXtcbiAgICB0aGlzLmN1cnZlID0gY3VydmVOYW1lIHx8ICdzZWNwMjU2azEnO1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuZ2VuZXJhdGVLZXlQYWlyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXN1bHQgICAgID0ge307XG4gICAgICAgIHZhciBlYyAgICAgICAgID0gY3J5cHRvLmNyZWF0ZUVDREgoc2VsZi5jdXJ2ZSk7XG4gICAgICAgIHJlc3VsdC5wdWJsaWMgID0gZWMuZ2VuZXJhdGVLZXlzKCdoZXgnKTtcbiAgICAgICAgcmVzdWx0LnByaXZhdGUgPSBlYy5nZXRQcml2YXRlS2V5KCdoZXgnKTtcbiAgICAgICAgcmV0dXJuIGtleXNUb1BFTShyZXN1bHQpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBrZXlzVG9QRU0oa2V5cyl7XG4gICAgICAgIHZhciByZXN1bHQgICAgICAgICAgICAgICAgICA9IHt9O1xuICAgICAgICB2YXIgRUNQcml2YXRlS2V5QVNOICAgICAgICAgPSBLZXlFbmNvZGVyLkVDUHJpdmF0ZUtleUFTTjtcbiAgICAgICAgdmFyIFN1YmplY3RQdWJsaWNLZXlJbmZvQVNOID0gS2V5RW5jb2Rlci5TdWJqZWN0UHVibGljS2V5SW5mb0FTTjtcbiAgICAgICAgdmFyIGtleUVuY29kZXIgICAgICAgICAgICAgID0gbmV3IEtleUVuY29kZXIoc2VsZi5jdXJ2ZSk7XG5cbiAgICAgICAgdmFyIHByaXZhdGVLZXlPYmplY3QgICAgICAgID0ga2V5RW5jb2Rlci5wcml2YXRlS2V5T2JqZWN0KGtleXMucHJpdmF0ZSxrZXlzLnB1YmxpYyk7XG4gICAgICAgIHZhciBwdWJsaWNLZXlPYmplY3QgICAgICAgICA9IGtleUVuY29kZXIucHVibGljS2V5T2JqZWN0KGtleXMucHVibGljKTtcblxuICAgICAgICByZXN1bHQucHJpdmF0ZSAgICAgICAgICAgICAgPSBFQ1ByaXZhdGVLZXlBU04uZW5jb2RlKHByaXZhdGVLZXlPYmplY3QsICdwZW0nLCBwcml2YXRlS2V5T2JqZWN0LnBlbU9wdGlvbnMpO1xuICAgICAgICByZXN1bHQucHVibGljICAgICAgICAgICAgICAgPSBTdWJqZWN0UHVibGljS2V5SW5mb0FTTi5lbmNvZGUocHVibGljS2V5T2JqZWN0LCAncGVtJywgcHVibGljS2V5T2JqZWN0LnBlbU9wdGlvbnMpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICB9XG5cbiAgICB0aGlzLnNpZ24gPSBmdW5jdGlvbiAocHJpdmF0ZUtleSxkaWdlc3QpIHtcbiAgICAgICAgdmFyIHNpZ24gPSBjcnlwdG8uY3JlYXRlU2lnbihcInNoYTI1NlwiKTtcbiAgICAgICAgc2lnbi51cGRhdGUoZGlnZXN0KTtcblxuICAgICAgICByZXR1cm4gc2lnbi5zaWduKHByaXZhdGVLZXksJ2hleCcpO1xuICAgIH07XG5cbiAgICB0aGlzLnZlcmlmeSA9IGZ1bmN0aW9uIChwdWJsaWNLZXksc2lnbmF0dXJlLGRpZ2VzdCkge1xuICAgICAgICB2YXIgdmVyaWZ5ID0gY3J5cHRvLmNyZWF0ZVZlcmlmeSgnc2hhMjU2Jyk7XG4gICAgICAgIHZlcmlmeS51cGRhdGUoZGlnZXN0KTtcblxuICAgICAgICByZXR1cm4gdmVyaWZ5LnZlcmlmeShwdWJsaWNLZXksc2lnbmF0dXJlLCdoZXgnKTtcbiAgICB9XG59XG5cbmV4cG9ydHMuY3JlYXRlRUNEU0EgPSBmdW5jdGlvbiAoY3VydmUpe1xuICAgIHJldHVybiBuZXcgRUNEU0EoY3VydmUpO1xufTsiLCJcbmNvbnN0IGNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuY29uc3QgRHVwbGV4ID0gcmVxdWlyZSgnc3RyZWFtJykuRHVwbGV4O1xuY29uc3Qgb3MgPSByZXF1aXJlKCdvcycpO1xuXG5mdW5jdGlvbiBQc2tDcnlwdG8oKSB7XG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEVDRFNBIGZ1bmN0aW9ucyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXHRjb25zdCBlY2RzYSA9IHJlcXVpcmUoXCIuL0VDRFNBXCIpLmNyZWF0ZUVDRFNBKCk7XG5cdHRoaXMuZ2VuZXJhdGVFQ0RTQUtleVBhaXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIGVjZHNhLmdlbmVyYXRlS2V5UGFpcigpO1xuXHR9O1xuXG5cdHRoaXMuc2lnbiA9IGZ1bmN0aW9uIChwcml2YXRlS2V5LCBkaWdlc3QpIHtcblx0XHRyZXR1cm4gZWNkc2Euc2lnbihwcml2YXRlS2V5LCBkaWdlc3QpO1xuXHR9O1xuXG5cdHRoaXMudmVyaWZ5ID0gZnVuY3Rpb24gKHB1YmxpY0tleSwgc2lnbmF0dXJlLCBkaWdlc3QpIHtcblx0XHRyZXR1cm4gZWNkc2EudmVyaWZ5KHB1YmxpY0tleSwgc2lnbmF0dXJlLCBkaWdlc3QpO1xuXHR9O1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRW5jcnlwdGlvbiBmdW5jdGlvbnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cdGNvbnN0IHV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHMvY3J5cHRvVXRpbHNcIik7XG5cdGNvbnN0IGFyY2hpdmVyID0gcmVxdWlyZShcIi4vcHNrLWFyY2hpdmVyXCIpO1xuXHR2YXIgdGVtcEZvbGRlciA9IG9zLnRtcGRpcigpO1xuXG5cdHRoaXMuZW5jcnlwdFN0cmVhbSA9IGZ1bmN0aW9uIChpbnB1dFBhdGgsIGRlc3RpbmF0aW9uUGF0aCwgcGFzc3dvcmQpIHtcblx0XHR1dGlscy5lbmNyeXB0RmlsZShpbnB1dFBhdGgsIGRlc3RpbmF0aW9uUGF0aCwgcGFzc3dvcmQpO1xuXHR9O1xuXG5cdHRoaXMuZGVjcnlwdFN0cmVhbSA9IGZ1bmN0aW9uIChlbmNyeXB0ZWRJbnB1dFBhdGgsIG91dHB1dEZvbGRlciwgcGFzc3dvcmQpIHtcblx0XHR1dGlscy5kZWNyeXB0RmlsZShlbmNyeXB0ZWRJbnB1dFBhdGgsIHRlbXBGb2xkZXIsIHBhc3N3b3JkLCBmdW5jdGlvbiAoZXJyLCB0ZW1wQXJjaGl2ZVBhdGgpIHtcblx0XHRcdGFyY2hpdmVyLnVuemlwKHRlbXBBcmNoaXZlUGF0aCwgb3V0cHV0Rm9sZGVyLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiRGVjcnlwdGlvbiBpcyBjb21wbGV0ZWQuXCIpO1xuXHRcdFx0XHRmcy51bmxpbmtTeW5jKHRlbXBBcmNoaXZlUGF0aCk7XG5cdFx0XHR9KTtcblx0XHR9KVxuXHR9O1xuXG5cblx0dGhpcy5wc2tIYXNoID0gZnVuY3Rpb24gKGRhdGEpIHtcblx0XHRpZiAodXRpbHMuaXNKc29uKGRhdGEpKSB7XG5cdFx0XHRyZXR1cm4gdXRpbHMuY3JlYXRlUHNrSGFzaChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB1dGlscy5jcmVhdGVQc2tIYXNoKGRhdGEpO1xuXHRcdH1cblx0fTtcblxuXG5cdHRoaXMuc2F2ZURTZWVkID0gZnVuY3Rpb24gKGRzZWVkLCBwaW4sIGRzZWVkUGF0aCkge1xuXHRcdHZhciBlbmNyeXB0aW9uS2V5ICAgPSB1dGlscy5kZXJpdmVLZXkocGluLCBudWxsLCBudWxsKTtcblx0XHR2YXIgaXYgICAgICAgICAgICAgID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDE2KTtcblx0XHR2YXIgY2lwaGVyICAgICAgICAgID0gY3J5cHRvLmNyZWF0ZUNpcGhlcml2KCdhZXMtMjU2LWNmYicsIGVuY3J5cHRpb25LZXksIGl2KTtcblx0XHR2YXIgZW5jcnlwdGVkRFNlZWQgID0gY2lwaGVyLnVwZGF0ZShkc2VlZCwgJ2JpbmFyeScpO1xuXHRcdHZhciBmaW5hbCAgICAgICAgICAgPSBCdWZmZXIuZnJvbShjaXBoZXIuZmluYWwoJ2JpbmFyeScpLCAnYmluYXJ5Jyk7XG5cdFx0ZW5jcnlwdGVkRFNlZWQgICAgICA9IEJ1ZmZlci5jb25jYXQoW2l2LCBlbmNyeXB0ZWREU2VlZCwgZmluYWxdKTtcblx0XHRmcy53cml0ZUZpbGVTeW5jKGRzZWVkUGF0aCwgZW5jcnlwdGVkRFNlZWQpO1xuXHR9O1xuXG5cdHRoaXMubG9hZERzZWVkID0gZnVuY3Rpb24gKHBpbiwgZHNlZWRQYXRoKSB7XG5cdFx0dmFyIGVuY3J5cHRlZERhdGEgID0gZnMucmVhZEZpbGVTeW5jKGRzZWVkUGF0aCk7XG5cdFx0dmFyIGl2ICAgICAgICAgICAgID0gZW5jcnlwdGVkRGF0YS5zbGljZSgwLCAxNik7XG5cdFx0dmFyIGVuY3J5cHRlZERzZWVkID0gZW5jcnlwdGVkRGF0YS5zbGljZSgxNik7XG5cdFx0dmFyIGVuY3J5cHRpb25LZXkgID0gdXRpbHMuZGVyaXZlS2V5KHBpbiwgbnVsbCwgbnVsbCk7XG5cdFx0dmFyIGRlY2lwaGVyICAgICAgID0gY3J5cHRvLmNyZWF0ZURlY2lwaGVyaXYoJ2Flcy0yNTYtY2ZiJywgZW5jcnlwdGlvbktleSwgaXYpO1xuXHRcdHZhciBkc2VlZCAgICAgICAgICA9IEJ1ZmZlci5mcm9tKGRlY2lwaGVyLnVwZGF0ZShlbmNyeXB0ZWREc2VlZCwgJ2JpbmFyeScpLCAnYmluYXJ5Jyk7XG5cdFx0dmFyIGZpbmFsICAgICAgICAgID0gQnVmZmVyLmZyb20oZGVjaXBoZXIuZmluYWwoJ2JpbmFyeScpLCAnYmluYXJ5Jyk7XG5cdFx0ZHNlZWQgICAgICAgICAgICAgID0gQnVmZmVyLmNvbmNhdChbZHNlZWQsIGZpbmFsXSk7XG5cblx0XHRyZXR1cm4gZHNlZWQ7XG5cblx0fTtcblxuXG5cdHRoaXMuZGVyaXZlU2VlZCA9IGZ1bmN0aW9uIChzZWVkLCBkc2VlZExlbikge1xuXHRcdHJldHVybiB1dGlscy5kZXJpdmVLZXkoc2VlZCwgbnVsbCwgZHNlZWRMZW4pO1xuXG5cdH07XG5cblx0dGhpcy5lbmNyeXB0SnNvbiA9IGZ1bmN0aW9uIChkYXRhLCBkc2VlZCkge1xuXHRcdHZhciBjaXBoZXJUZXh0ID0gdXRpbHMuZW5jcnlwdChKU09OLnN0cmluZ2lmeShkYXRhKSwgZHNlZWQpO1xuXG5cdFx0cmV0dXJuIGNpcGhlclRleHQ7XG5cdH07XG5cblx0dGhpcy5kZWNyeXB0SnNvbiA9IGZ1bmN0aW9uIChlbmNyeXB0ZWREYXRhLCBkc2VlZCkge1xuXHRcdHZhciBwbGFpbnRleHQgPSB1dGlscy5kZWNyeXB0KGVuY3J5cHRlZERhdGEsIGRzZWVkKTtcblxuXHRcdHJldHVybiBKU09OLnBhcnNlKHBsYWludGV4dCk7XG5cdH07XG5cblx0dGhpcy5lbmNyeXB0QmxvYiA9IGZ1bmN0aW9uIChkYXRhLCBkc2VlZCkge1xuXHRcdHZhciBjaXBoZXJ0ZXh0ID0gdXRpbHMuZW5jcnlwdChkYXRhLCBkc2VlZCk7XG5cblx0XHRyZXR1cm4gY2lwaGVydGV4dDtcblx0fTtcblxuXHR0aGlzLmRlY3J5cHRCbG9iID0gZnVuY3Rpb24gKGVuY3J5cHRlZERhdGEsIGRzZWVkKSB7XG5cdFx0dmFyIHBsYWludGV4dCA9IHV0aWxzLmRlY3J5cHQoZW5jcnlwdGVkRGF0YSwgZHNlZWQpO1xuXG5cdFx0cmV0dXJuIHBsYWludGV4dDtcblx0fTtcblxuXG5cdHRoaXMuZ2VuZXJhdGVTZWVkID0gZnVuY3Rpb24gKGJhY2t1cFVybCkge1xuXHRcdHZhciBzZWVkID0ge1xuXHRcdFx0XCJiYWNrdXBcIjogYmFja3VwVXJsLFxuXHRcdFx0XCJyYW5kXCJcdDogY3J5cHRvLnJhbmRvbUJ5dGVzKDMyKS50b1N0cmluZyhcImhleFwiKVxuXHRcdH07XG5cdFx0cmV0dXJuIEJ1ZmZlci5mcm9tKEpTT04uc3RyaW5naWZ5KHNlZWQpKTtcblx0fTtcblx0dGhpcy5nZW5lcmF0ZVNhZmVVaWQgPSBmdW5jdGlvbiAoZHNlZWQsIHBhdGgpIHtcblx0XHRwYXRoID0gcGF0aCB8fCBwcm9jZXNzLmN3ZCgpO1xuXHRcdHJldHVybiB1dGlscy5lbmNvZGUodGhpcy5wc2tIYXNoKEJ1ZmZlci5jb25jYXQoW0J1ZmZlci5mcm9tKHBhdGgpLCBkc2VlZF0pKSk7XG5cdH07XG59XG5cbi8vIHZhciBwY3J5cHRvID0gbmV3IFBza0NyeXB0bygpO1xuLy8gcGNyeXB0by5lbmNyeXB0U3RyZWFtKFwiQzpcXFxcVXNlcnNcXFxcQWNlclxcXFxXZWJzdG9ybVByb2plY3RzXFxcXHByaXZhdGVza3lcXFxcdGVzdHNcXFxccHNrLXVuaXQtdGVzdGluZ1xcXFx6aXBcXFxcb3V0cHV0XCIsXCJvdXRwdXQvbXlmaWxlXCIsIFwiMTIzXCIpO1xuLy8gcGNyeXB0by5kZWNyeXB0U3RyZWFtKFwib3V0cHV0XFxcXG15ZmlsZVwiLCBcIm91dHB1dFwiLCBcIjEyM1wiKTtcbm1vZHVsZS5leHBvcnRzID0gbmV3IFBza0NyeXB0bygpOyIsInZhciBhc24xID0gcmVxdWlyZSgnLi9hc24xJyk7XG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCd1dGlsJykuaW5oZXJpdHM7XG5cbnZhciBhcGkgPSBleHBvcnRzO1xuXG5hcGkuZGVmaW5lID0gZnVuY3Rpb24gZGVmaW5lKG5hbWUsIGJvZHkpIHtcbiAgcmV0dXJuIG5ldyBFbnRpdHkobmFtZSwgYm9keSk7XG59O1xuXG5mdW5jdGlvbiBFbnRpdHkobmFtZSwgYm9keSkge1xuICB0aGlzLm5hbWUgPSBuYW1lO1xuICB0aGlzLmJvZHkgPSBib2R5O1xuXG4gIHRoaXMuZGVjb2RlcnMgPSB7fTtcbiAgdGhpcy5lbmNvZGVycyA9IHt9O1xufTtcblxuRW50aXR5LnByb3RvdHlwZS5fY3JlYXRlTmFtZWQgPSBmdW5jdGlvbiBjcmVhdGVOYW1lZChiYXNlKSB7XG4gIHZhciBuYW1lZDtcbiAgdHJ5IHtcbiAgICBuYW1lZCA9IHJlcXVpcmUoJ3ZtJykucnVuSW5UaGlzQ29udGV4dChcbiAgICAgICcoZnVuY3Rpb24gJyArIHRoaXMubmFtZSArICcoZW50aXR5KSB7XFxuJyArXG4gICAgICAnICB0aGlzLl9pbml0TmFtZWQoZW50aXR5KTtcXG4nICtcbiAgICAgICd9KSdcbiAgICApO1xuICB9IGNhdGNoIChlKSB7XG4gICAgbmFtZWQgPSBmdW5jdGlvbiAoZW50aXR5KSB7XG4gICAgICB0aGlzLl9pbml0TmFtZWQoZW50aXR5KTtcbiAgICB9O1xuICB9XG4gIGluaGVyaXRzKG5hbWVkLCBiYXNlKTtcbiAgbmFtZWQucHJvdG90eXBlLl9pbml0TmFtZWQgPSBmdW5jdGlvbiBpbml0bmFtZWQoZW50aXR5KSB7XG4gICAgYmFzZS5jYWxsKHRoaXMsIGVudGl0eSk7XG4gIH07XG5cbiAgcmV0dXJuIG5ldyBuYW1lZCh0aGlzKTtcbn07XG5cbkVudGl0eS5wcm90b3R5cGUuX2dldERlY29kZXIgPSBmdW5jdGlvbiBfZ2V0RGVjb2RlcihlbmMpIHtcbiAgLy8gTGF6aWx5IGNyZWF0ZSBkZWNvZGVyXG4gIGlmICghdGhpcy5kZWNvZGVycy5oYXNPd25Qcm9wZXJ0eShlbmMpKVxuICAgIHRoaXMuZGVjb2RlcnNbZW5jXSA9IHRoaXMuX2NyZWF0ZU5hbWVkKGFzbjEuZGVjb2RlcnNbZW5jXSk7XG4gIHJldHVybiB0aGlzLmRlY29kZXJzW2VuY107XG59O1xuXG5FbnRpdHkucHJvdG90eXBlLmRlY29kZSA9IGZ1bmN0aW9uIGRlY29kZShkYXRhLCBlbmMsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHRoaXMuX2dldERlY29kZXIoZW5jKS5kZWNvZGUoZGF0YSwgb3B0aW9ucyk7XG59O1xuXG5FbnRpdHkucHJvdG90eXBlLl9nZXRFbmNvZGVyID0gZnVuY3Rpb24gX2dldEVuY29kZXIoZW5jKSB7XG4gIC8vIExhemlseSBjcmVhdGUgZW5jb2RlclxuICBpZiAoIXRoaXMuZW5jb2RlcnMuaGFzT3duUHJvcGVydHkoZW5jKSlcbiAgICB0aGlzLmVuY29kZXJzW2VuY10gPSB0aGlzLl9jcmVhdGVOYW1lZChhc24xLmVuY29kZXJzW2VuY10pO1xuICByZXR1cm4gdGhpcy5lbmNvZGVyc1tlbmNdO1xufTtcblxuRW50aXR5LnByb3RvdHlwZS5lbmNvZGUgPSBmdW5jdGlvbiBlbmNvZGUoZGF0YSwgZW5jLCAvKiBpbnRlcm5hbCAqLyByZXBvcnRlcikge1xuICByZXR1cm4gdGhpcy5fZ2V0RW5jb2RlcihlbmMpLmVuY29kZShkYXRhLCByZXBvcnRlcik7XG59O1xuIiwidmFyIGFzbjEgPSBleHBvcnRzO1xuXG5hc24xLmJpZ251bSA9IHJlcXVpcmUoJy4vYmlnbnVtL2JuJyk7XG5cbmFzbjEuZGVmaW5lID0gcmVxdWlyZSgnLi9hcGknKS5kZWZpbmU7XG5hc24xLmJhc2UgPSByZXF1aXJlKCcuL2Jhc2UvaW5kZXgnKTtcbmFzbjEuY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMvaW5kZXgnKTtcbmFzbjEuZGVjb2RlcnMgPSByZXF1aXJlKCcuL2RlY29kZXJzL2luZGV4Jyk7XG5hc24xLmVuY29kZXJzID0gcmVxdWlyZSgnLi9lbmNvZGVycy9pbmRleCcpO1xuIiwidmFyIGluaGVyaXRzID0gcmVxdWlyZSgndXRpbCcpLmluaGVyaXRzO1xudmFyIFJlcG9ydGVyID0gcmVxdWlyZSgnLi4vYmFzZScpLlJlcG9ydGVyO1xudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcblxuZnVuY3Rpb24gRGVjb2RlckJ1ZmZlcihiYXNlLCBvcHRpb25zKSB7XG4gIFJlcG9ydGVyLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJhc2UpKSB7XG4gICAgdGhpcy5lcnJvcignSW5wdXQgbm90IEJ1ZmZlcicpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuYmFzZSA9IGJhc2U7XG4gIHRoaXMub2Zmc2V0ID0gMDtcbiAgdGhpcy5sZW5ndGggPSBiYXNlLmxlbmd0aDtcbn1cbmluaGVyaXRzKERlY29kZXJCdWZmZXIsIFJlcG9ydGVyKTtcbmV4cG9ydHMuRGVjb2RlckJ1ZmZlciA9IERlY29kZXJCdWZmZXI7XG5cbkRlY29kZXJCdWZmZXIucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbiBzYXZlKCkge1xuICByZXR1cm4geyBvZmZzZXQ6IHRoaXMub2Zmc2V0LCByZXBvcnRlcjogUmVwb3J0ZXIucHJvdG90eXBlLnNhdmUuY2FsbCh0aGlzKSB9O1xufTtcblxuRGVjb2RlckJ1ZmZlci5wcm90b3R5cGUucmVzdG9yZSA9IGZ1bmN0aW9uIHJlc3RvcmUoc2F2ZSkge1xuICAvLyBSZXR1cm4gc2tpcHBlZCBkYXRhXG4gIHZhciByZXMgPSBuZXcgRGVjb2RlckJ1ZmZlcih0aGlzLmJhc2UpO1xuICByZXMub2Zmc2V0ID0gc2F2ZS5vZmZzZXQ7XG4gIHJlcy5sZW5ndGggPSB0aGlzLm9mZnNldDtcblxuICB0aGlzLm9mZnNldCA9IHNhdmUub2Zmc2V0O1xuICBSZXBvcnRlci5wcm90b3R5cGUucmVzdG9yZS5jYWxsKHRoaXMsIHNhdmUucmVwb3J0ZXIpO1xuXG4gIHJldHVybiByZXM7XG59O1xuXG5EZWNvZGVyQnVmZmVyLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gaXNFbXB0eSgpIHtcbiAgcmV0dXJuIHRoaXMub2Zmc2V0ID09PSB0aGlzLmxlbmd0aDtcbn07XG5cbkRlY29kZXJCdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIHJlYWRVSW50OChmYWlsKSB7XG4gIGlmICh0aGlzLm9mZnNldCArIDEgPD0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuIHRoaXMuYmFzZS5yZWFkVUludDgodGhpcy5vZmZzZXQrKywgdHJ1ZSk7XG4gIGVsc2VcbiAgICByZXR1cm4gdGhpcy5lcnJvcihmYWlsIHx8ICdEZWNvZGVyQnVmZmVyIG92ZXJydW4nKTtcbn1cblxuRGVjb2RlckJ1ZmZlci5wcm90b3R5cGUuc2tpcCA9IGZ1bmN0aW9uIHNraXAoYnl0ZXMsIGZhaWwpIHtcbiAgaWYgKCEodGhpcy5vZmZzZXQgKyBieXRlcyA8PSB0aGlzLmxlbmd0aCkpXG4gICAgcmV0dXJuIHRoaXMuZXJyb3IoZmFpbCB8fCAnRGVjb2RlckJ1ZmZlciBvdmVycnVuJyk7XG5cbiAgdmFyIHJlcyA9IG5ldyBEZWNvZGVyQnVmZmVyKHRoaXMuYmFzZSk7XG5cbiAgLy8gU2hhcmUgcmVwb3J0ZXIgc3RhdGVcbiAgcmVzLl9yZXBvcnRlclN0YXRlID0gdGhpcy5fcmVwb3J0ZXJTdGF0ZTtcblxuICByZXMub2Zmc2V0ID0gdGhpcy5vZmZzZXQ7XG4gIHJlcy5sZW5ndGggPSB0aGlzLm9mZnNldCArIGJ5dGVzO1xuICB0aGlzLm9mZnNldCArPSBieXRlcztcbiAgcmV0dXJuIHJlcztcbn1cblxuRGVjb2RlckJ1ZmZlci5wcm90b3R5cGUucmF3ID0gZnVuY3Rpb24gcmF3KHNhdmUpIHtcbiAgcmV0dXJuIHRoaXMuYmFzZS5zbGljZShzYXZlID8gc2F2ZS5vZmZzZXQgOiB0aGlzLm9mZnNldCwgdGhpcy5sZW5ndGgpO1xufVxuXG5mdW5jdGlvbiBFbmNvZGVyQnVmZmVyKHZhbHVlLCByZXBvcnRlcikge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICBpZiAoIShpdGVtIGluc3RhbmNlb2YgRW5jb2RlckJ1ZmZlcikpXG4gICAgICAgIGl0ZW0gPSBuZXcgRW5jb2RlckJ1ZmZlcihpdGVtLCByZXBvcnRlcik7XG4gICAgICB0aGlzLmxlbmd0aCArPSBpdGVtLmxlbmd0aDtcbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH0sIHRoaXMpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAoISgwIDw9IHZhbHVlICYmIHZhbHVlIDw9IDB4ZmYpKVxuICAgICAgcmV0dXJuIHJlcG9ydGVyLmVycm9yKCdub24tYnl0ZSBFbmNvZGVyQnVmZmVyIHZhbHVlJyk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMubGVuZ3RoID0gMTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMubGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgodmFsdWUpO1xuICB9IGVsc2UgaWYgKEJ1ZmZlci5pc0J1ZmZlcih2YWx1ZSkpIHtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5sZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHJlcG9ydGVyLmVycm9yKCdVbnN1cHBvcnRlZCB0eXBlOiAnICsgdHlwZW9mIHZhbHVlKTtcbiAgfVxufVxuZXhwb3J0cy5FbmNvZGVyQnVmZmVyID0gRW5jb2RlckJ1ZmZlcjtcblxuRW5jb2RlckJ1ZmZlci5wcm90b3R5cGUuam9pbiA9IGZ1bmN0aW9uIGpvaW4ob3V0LCBvZmZzZXQpIHtcbiAgaWYgKCFvdXQpXG4gICAgb3V0ID0gbmV3IEJ1ZmZlcih0aGlzLmxlbmd0aCk7XG4gIGlmICghb2Zmc2V0KVxuICAgIG9mZnNldCA9IDA7XG5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKVxuICAgIHJldHVybiBvdXQ7XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy52YWx1ZSkpIHtcbiAgICB0aGlzLnZhbHVlLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgaXRlbS5qb2luKG91dCwgb2Zmc2V0KTtcbiAgICAgIG9mZnNldCArPSBpdGVtLmxlbmd0aDtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudmFsdWUgPT09ICdudW1iZXInKVxuICAgICAgb3V0W29mZnNldF0gPSB0aGlzLnZhbHVlO1xuICAgIGVsc2UgaWYgKHR5cGVvZiB0aGlzLnZhbHVlID09PSAnc3RyaW5nJylcbiAgICAgIG91dC53cml0ZSh0aGlzLnZhbHVlLCBvZmZzZXQpO1xuICAgIGVsc2UgaWYgKEJ1ZmZlci5pc0J1ZmZlcih0aGlzLnZhbHVlKSlcbiAgICAgIHRoaXMudmFsdWUuY29weShvdXQsIG9mZnNldCk7XG4gICAgb2Zmc2V0ICs9IHRoaXMubGVuZ3RoO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG4iLCJ2YXIgYmFzZSA9IGV4cG9ydHM7XG5cbmJhc2UuUmVwb3J0ZXIgPSByZXF1aXJlKCcuL3JlcG9ydGVyJykuUmVwb3J0ZXI7XG5iYXNlLkRlY29kZXJCdWZmZXIgPSByZXF1aXJlKCcuL2J1ZmZlcicpLkRlY29kZXJCdWZmZXI7XG5iYXNlLkVuY29kZXJCdWZmZXIgPSByZXF1aXJlKCcuL2J1ZmZlcicpLkVuY29kZXJCdWZmZXI7XG5iYXNlLk5vZGUgPSByZXF1aXJlKCcuL25vZGUnKTtcbiIsInZhciBSZXBvcnRlciA9IHJlcXVpcmUoJy4uL2Jhc2UnKS5SZXBvcnRlcjtcbnZhciBFbmNvZGVyQnVmZmVyID0gcmVxdWlyZSgnLi4vYmFzZScpLkVuY29kZXJCdWZmZXI7XG4vL3ZhciBhc3NlcnQgPSByZXF1aXJlKCdkb3VibGUtY2hlY2snKS5hc3NlcnQ7XG5cbi8vIFN1cHBvcnRlZCB0YWdzXG52YXIgdGFncyA9IFtcbiAgJ3NlcScsICdzZXFvZicsICdzZXQnLCAnc2V0b2YnLCAnb2N0c3RyJywgJ2JpdHN0cicsICdvYmppZCcsICdib29sJyxcbiAgJ2dlbnRpbWUnLCAndXRjdGltZScsICdudWxsXycsICdlbnVtJywgJ2ludCcsICdpYTVzdHInLCAndXRmOHN0cidcbl07XG5cbi8vIFB1YmxpYyBtZXRob2RzIGxpc3RcbnZhciBtZXRob2RzID0gW1xuICAna2V5JywgJ29iaicsICd1c2UnLCAnb3B0aW9uYWwnLCAnZXhwbGljaXQnLCAnaW1wbGljaXQnLCAnZGVmJywgJ2Nob2ljZScsXG4gICdhbnknXG5dLmNvbmNhdCh0YWdzKTtcblxuLy8gT3ZlcnJpZGVkIG1ldGhvZHMgbGlzdFxudmFyIG92ZXJyaWRlZCA9IFtcbiAgJ19wZWVrVGFnJywgJ19kZWNvZGVUYWcnLCAnX3VzZScsXG4gICdfZGVjb2RlU3RyJywgJ19kZWNvZGVPYmppZCcsICdfZGVjb2RlVGltZScsXG4gICdfZGVjb2RlTnVsbCcsICdfZGVjb2RlSW50JywgJ19kZWNvZGVCb29sJywgJ19kZWNvZGVMaXN0JyxcblxuICAnX2VuY29kZUNvbXBvc2l0ZScsICdfZW5jb2RlU3RyJywgJ19lbmNvZGVPYmppZCcsICdfZW5jb2RlVGltZScsXG4gICdfZW5jb2RlTnVsbCcsICdfZW5jb2RlSW50JywgJ19lbmNvZGVCb29sJ1xuXTtcblxuZnVuY3Rpb24gTm9kZShlbmMsIHBhcmVudCkge1xuICB2YXIgc3RhdGUgPSB7fTtcbiAgdGhpcy5fYmFzZVN0YXRlID0gc3RhdGU7XG5cbiAgc3RhdGUuZW5jID0gZW5jO1xuXG4gIHN0YXRlLnBhcmVudCA9IHBhcmVudCB8fCBudWxsO1xuICBzdGF0ZS5jaGlsZHJlbiA9IG51bGw7XG5cbiAgLy8gU3RhdGVcbiAgc3RhdGUudGFnID0gbnVsbDtcbiAgc3RhdGUuYXJncyA9IG51bGw7XG4gIHN0YXRlLnJldmVyc2VBcmdzID0gbnVsbDtcbiAgc3RhdGUuY2hvaWNlID0gbnVsbDtcbiAgc3RhdGUub3B0aW9uYWwgPSBmYWxzZTtcbiAgc3RhdGUuYW55ID0gZmFsc2U7XG4gIHN0YXRlLm9iaiA9IGZhbHNlO1xuICBzdGF0ZS51c2UgPSBudWxsO1xuICBzdGF0ZS51c2VEZWNvZGVyID0gbnVsbDtcbiAgc3RhdGUua2V5ID0gbnVsbDtcbiAgc3RhdGVbJ2RlZmF1bHQnXSA9IG51bGw7XG4gIHN0YXRlLmV4cGxpY2l0ID0gbnVsbDtcbiAgc3RhdGUuaW1wbGljaXQgPSBudWxsO1xuXG4gIC8vIFNob3VsZCBjcmVhdGUgbmV3IGluc3RhbmNlIG9uIGVhY2ggbWV0aG9kXG4gIGlmICghc3RhdGUucGFyZW50KSB7XG4gICAgc3RhdGUuY2hpbGRyZW4gPSBbXTtcbiAgICB0aGlzLl93cmFwKCk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gTm9kZTtcblxudmFyIHN0YXRlUHJvcHMgPSBbXG4gICdlbmMnLCAncGFyZW50JywgJ2NoaWxkcmVuJywgJ3RhZycsICdhcmdzJywgJ3JldmVyc2VBcmdzJywgJ2Nob2ljZScsXG4gICdvcHRpb25hbCcsICdhbnknLCAnb2JqJywgJ3VzZScsICdhbHRlcmVkVXNlJywgJ2tleScsICdkZWZhdWx0JywgJ2V4cGxpY2l0JyxcbiAgJ2ltcGxpY2l0J1xuXTtcblxuTm9kZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiBjbG9uZSgpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuICB2YXIgY3N0YXRlID0ge307XG4gIHN0YXRlUHJvcHMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgY3N0YXRlW3Byb3BdID0gc3RhdGVbcHJvcF07XG4gIH0pO1xuICB2YXIgcmVzID0gbmV3IHRoaXMuY29uc3RydWN0b3IoY3N0YXRlLnBhcmVudCk7XG4gIHJlcy5fYmFzZVN0YXRlID0gY3N0YXRlO1xuICByZXR1cm4gcmVzO1xufTtcblxuTm9kZS5wcm90b3R5cGUuX3dyYXAgPSBmdW5jdGlvbiB3cmFwKCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG4gIG1ldGhvZHMuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICB0aGlzW21ldGhvZF0gPSBmdW5jdGlvbiBfd3JhcHBlZE1ldGhvZCgpIHtcbiAgICAgIHZhciBjbG9uZSA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMpO1xuICAgICAgc3RhdGUuY2hpbGRyZW4ucHVzaChjbG9uZSk7XG4gICAgICByZXR1cm4gY2xvbmVbbWV0aG9kXS5hcHBseShjbG9uZSwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9LCB0aGlzKTtcbn07XG5cbk5vZGUucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gaW5pdChib2R5KSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICAvL2Fzc2VydC5lcXVhbChzdGF0ZS5wYXJlbnQsbnVsbCwnc3RhdGUucGFyZW50IHNob3VsZCBiZSBudWxsJyk7XG4gIGJvZHkuY2FsbCh0aGlzKTtcblxuICAvLyBGaWx0ZXIgY2hpbGRyZW5cbiAgc3RhdGUuY2hpbGRyZW4gPSBzdGF0ZS5jaGlsZHJlbi5maWx0ZXIoZnVuY3Rpb24oY2hpbGQpIHtcbiAgICByZXR1cm4gY2hpbGQuX2Jhc2VTdGF0ZS5wYXJlbnQgPT09IHRoaXM7XG4gIH0sIHRoaXMpO1xuICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUuY2hpbGRyZW4ubGVuZ3RoLCAxLCAnUm9vdCBub2RlIGNhbiBoYXZlIG9ubHkgb25lIGNoaWxkJyk7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5fdXNlQXJncyA9IGZ1bmN0aW9uIHVzZUFyZ3MoYXJncykge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgLy8gRmlsdGVyIGNoaWxkcmVuIGFuZCBhcmdzXG4gIHZhciBjaGlsZHJlbiA9IGFyZ3MuZmlsdGVyKGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBhcmcgaW5zdGFuY2VvZiB0aGlzLmNvbnN0cnVjdG9yO1xuICB9LCB0aGlzKTtcbiAgYXJncyA9IGFyZ3MuZmlsdGVyKGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiAhKGFyZyBpbnN0YW5jZW9mIHRoaXMuY29uc3RydWN0b3IpO1xuICB9LCB0aGlzKTtcblxuICBpZiAoY2hpbGRyZW4ubGVuZ3RoICE9PSAwKSB7XG4gICAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlLmNoaWxkcmVuLCBudWxsLCAnc3RhdGUuY2hpbGRyZW4gc2hvdWxkIGJlIG51bGwnKTtcbiAgICBzdGF0ZS5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuXG4gICAgLy8gUmVwbGFjZSBwYXJlbnQgdG8gbWFpbnRhaW4gYmFja3dhcmQgbGlua1xuICAgIGNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgIGNoaWxkLl9iYXNlU3RhdGUucGFyZW50ID0gdGhpcztcbiAgICB9LCB0aGlzKTtcbiAgfVxuICBpZiAoYXJncy5sZW5ndGggIT09IDApIHtcbiAgICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUuYXJncywgbnVsbCwgJ3N0YXRlLmFyZ3Mgc2hvdWxkIGJlIG51bGwnKTtcbiAgICBzdGF0ZS5hcmdzID0gYXJncztcbiAgICBzdGF0ZS5yZXZlcnNlQXJncyA9IGFyZ3MubWFwKGZ1bmN0aW9uKGFyZykge1xuICAgICAgaWYgKHR5cGVvZiBhcmcgIT09ICdvYmplY3QnIHx8IGFyZy5jb25zdHJ1Y3RvciAhPT0gT2JqZWN0KVxuICAgICAgICByZXR1cm4gYXJnO1xuXG4gICAgICB2YXIgcmVzID0ge307XG4gICAgICBPYmplY3Qua2V5cyhhcmcpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGlmIChrZXkgPT0gKGtleSB8IDApKVxuICAgICAgICAgIGtleSB8PSAwO1xuICAgICAgICB2YXIgdmFsdWUgPSBhcmdba2V5XTtcbiAgICAgICAgcmVzW3ZhbHVlXSA9IGtleTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcbiAgfVxufTtcblxuLy9cbi8vIE92ZXJyaWRlZCBtZXRob2RzXG4vL1xuXG5vdmVycmlkZWQuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgTm9kZS5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uIF9vdmVycmlkZWQoKSB7XG4gICAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuICAgIHRocm93IG5ldyBFcnJvcihtZXRob2QgKyAnIG5vdCBpbXBsZW1lbnRlZCBmb3IgZW5jb2Rpbmc6ICcgKyBzdGF0ZS5lbmMpO1xuICB9O1xufSk7XG5cbi8vXG4vLyBQdWJsaWMgbWV0aG9kc1xuLy9cblxudGFncy5mb3JFYWNoKGZ1bmN0aW9uKHRhZykge1xuICBOb2RlLnByb3RvdHlwZVt0YWddID0gZnVuY3Rpb24gX3RhZ01ldGhvZCgpIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXG4gICAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlLnRhZywgbnVsbCwgJ3N0YXRlLnRhZyBzaG91bGQgYmUgbnVsbCcpO1xuICAgIHN0YXRlLnRhZyA9IHRhZztcblxuICAgIHRoaXMuX3VzZUFyZ3MoYXJncyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbn0pO1xuXG5Ob2RlLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoaXRlbSkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlLnVzZSwgbnVsbCwgJ3N0YXRlLnVzZSBzaG91bGQgYmUgbnVsbCcpO1xuICBzdGF0ZS51c2UgPSBpdGVtO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuTm9kZS5wcm90b3R5cGUub3B0aW9uYWwgPSBmdW5jdGlvbiBvcHRpb25hbCgpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gIHN0YXRlLm9wdGlvbmFsID0gdHJ1ZTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbk5vZGUucHJvdG90eXBlLmRlZiA9IGZ1bmN0aW9uIGRlZih2YWwpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gIC8vIGFzc2VydC5lcXVhbChzdGF0ZVsnZGVmYXVsdCddLCBudWxsLCBcInN0YXRlWydkZWZhdWx0J10gc2hvdWxkIGJlIG51bGxcIik7XG4gIHN0YXRlWydkZWZhdWx0J10gPSB2YWw7XG4gIHN0YXRlLm9wdGlvbmFsID0gdHJ1ZTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbk5vZGUucHJvdG90eXBlLmV4cGxpY2l0ID0gZnVuY3Rpb24gZXhwbGljaXQobnVtKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUuZXhwbGljaXQsbnVsbCwgJ3N0YXRlLmV4cGxpY2l0IHNob3VsZCBiZSBudWxsJyk7XG4gIC8vIGFzc2VydC5lcXVhbChzdGF0ZS5pbXBsaWNpdCxudWxsLCAnc3RhdGUuaW1wbGljaXQgc2hvdWxkIGJlIG51bGwnKTtcblxuICBzdGF0ZS5leHBsaWNpdCA9IG51bTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbk5vZGUucHJvdG90eXBlLmltcGxpY2l0ID0gZnVuY3Rpb24gaW1wbGljaXQobnVtKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICAgIC8vIGFzc2VydC5lcXVhbChzdGF0ZS5leHBsaWNpdCxudWxsLCAnc3RhdGUuZXhwbGljaXQgc2hvdWxkIGJlIG51bGwnKTtcbiAgICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUuaW1wbGljaXQsbnVsbCwgJ3N0YXRlLmltcGxpY2l0IHNob3VsZCBiZSBudWxsJyk7XG5cbiAgICBzdGF0ZS5pbXBsaWNpdCA9IG51bTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbk5vZGUucHJvdG90eXBlLm9iaiA9IGZ1bmN0aW9uIG9iaigpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cbiAgc3RhdGUub2JqID0gdHJ1ZTtcblxuICBpZiAoYXJncy5sZW5ndGggIT09IDApXG4gICAgdGhpcy5fdXNlQXJncyhhcmdzKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbk5vZGUucHJvdG90eXBlLmtleSA9IGZ1bmN0aW9uIGtleShuZXdLZXkpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gIC8vIGFzc2VydC5lcXVhbChzdGF0ZS5rZXksIG51bGwsICdzdGF0ZS5rZXkgc2hvdWxkIGJlIG51bGwnKTtcbiAgc3RhdGUua2V5ID0gbmV3S2V5O1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuTm9kZS5wcm90b3R5cGUuYW55ID0gZnVuY3Rpb24gYW55KCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgc3RhdGUuYW55ID0gdHJ1ZTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbk5vZGUucHJvdG90eXBlLmNob2ljZSA9IGZ1bmN0aW9uIGNob2ljZShvYmopIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gIC8vIGFzc2VydC5lcXVhbChzdGF0ZS5jaG9pY2UsIG51bGwsJ3N0YXRlLmNob2ljZSBzaG91bGQgYmUgbnVsbCcpO1xuICBzdGF0ZS5jaG9pY2UgPSBvYmo7XG4gIHRoaXMuX3VzZUFyZ3MoT2JqZWN0LmtleXMob2JqKS5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIG9ialtrZXldO1xuICB9KSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gRGVjb2Rpbmdcbi8vXG5cbk5vZGUucHJvdG90eXBlLl9kZWNvZGUgPSBmdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gIC8vIERlY29kZSByb290IG5vZGVcbiAgaWYgKHN0YXRlLnBhcmVudCA9PT0gbnVsbClcbiAgICByZXR1cm4gaW5wdXQud3JhcFJlc3VsdChzdGF0ZS5jaGlsZHJlblswXS5fZGVjb2RlKGlucHV0KSk7XG5cbiAgdmFyIHJlc3VsdCA9IHN0YXRlWydkZWZhdWx0J107XG4gIHZhciBwcmVzZW50ID0gdHJ1ZTtcblxuICB2YXIgcHJldktleTtcbiAgaWYgKHN0YXRlLmtleSAhPT0gbnVsbClcbiAgICBwcmV2S2V5ID0gaW5wdXQuZW50ZXJLZXkoc3RhdGUua2V5KTtcblxuICAvLyBDaGVjayBpZiB0YWcgaXMgdGhlcmVcbiAgaWYgKHN0YXRlLm9wdGlvbmFsKSB7XG4gICAgdmFyIHRhZyA9IG51bGw7XG4gICAgaWYgKHN0YXRlLmV4cGxpY2l0ICE9PSBudWxsKVxuICAgICAgdGFnID0gc3RhdGUuZXhwbGljaXQ7XG4gICAgZWxzZSBpZiAoc3RhdGUuaW1wbGljaXQgIT09IG51bGwpXG4gICAgICB0YWcgPSBzdGF0ZS5pbXBsaWNpdDtcbiAgICBlbHNlIGlmIChzdGF0ZS50YWcgIT09IG51bGwpXG4gICAgICB0YWcgPSBzdGF0ZS50YWc7XG5cbiAgICBpZiAodGFnID09PSBudWxsICYmICFzdGF0ZS5hbnkpIHtcbiAgICAgIC8vIFRyaWFsIGFuZCBFcnJvclxuICAgICAgdmFyIHNhdmUgPSBpbnB1dC5zYXZlKCk7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoc3RhdGUuY2hvaWNlID09PSBudWxsKVxuICAgICAgICAgIHRoaXMuX2RlY29kZUdlbmVyaWMoc3RhdGUudGFnLCBpbnB1dCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0aGlzLl9kZWNvZGVDaG9pY2UoaW5wdXQpO1xuICAgICAgICBwcmVzZW50ID0gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcHJlc2VudCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaW5wdXQucmVzdG9yZShzYXZlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJlc2VudCA9IHRoaXMuX3BlZWtUYWcoaW5wdXQsIHRhZywgc3RhdGUuYW55KTtcblxuICAgICAgaWYgKGlucHV0LmlzRXJyb3IocHJlc2VudCkpXG4gICAgICAgIHJldHVybiBwcmVzZW50O1xuICAgIH1cbiAgfVxuXG4gIC8vIFB1c2ggb2JqZWN0IG9uIHN0YWNrXG4gIHZhciBwcmV2T2JqO1xuICBpZiAoc3RhdGUub2JqICYmIHByZXNlbnQpXG4gICAgcHJldk9iaiA9IGlucHV0LmVudGVyT2JqZWN0KCk7XG5cbiAgaWYgKHByZXNlbnQpIHtcbiAgICAvLyBVbndyYXAgZXhwbGljaXQgdmFsdWVzXG4gICAgaWYgKHN0YXRlLmV4cGxpY2l0ICE9PSBudWxsKSB7XG4gICAgICB2YXIgZXhwbGljaXQgPSB0aGlzLl9kZWNvZGVUYWcoaW5wdXQsIHN0YXRlLmV4cGxpY2l0KTtcbiAgICAgIGlmIChpbnB1dC5pc0Vycm9yKGV4cGxpY2l0KSlcbiAgICAgICAgcmV0dXJuIGV4cGxpY2l0O1xuICAgICAgaW5wdXQgPSBleHBsaWNpdDtcbiAgICB9XG5cbiAgICAvLyBVbndyYXAgaW1wbGljaXQgYW5kIG5vcm1hbCB2YWx1ZXNcbiAgICBpZiAoc3RhdGUudXNlID09PSBudWxsICYmIHN0YXRlLmNob2ljZSA9PT0gbnVsbCkge1xuICAgICAgaWYgKHN0YXRlLmFueSlcbiAgICAgICAgdmFyIHNhdmUgPSBpbnB1dC5zYXZlKCk7XG4gICAgICB2YXIgYm9keSA9IHRoaXMuX2RlY29kZVRhZyhcbiAgICAgICAgaW5wdXQsXG4gICAgICAgIHN0YXRlLmltcGxpY2l0ICE9PSBudWxsID8gc3RhdGUuaW1wbGljaXQgOiBzdGF0ZS50YWcsXG4gICAgICAgIHN0YXRlLmFueVxuICAgICAgKTtcbiAgICAgIGlmIChpbnB1dC5pc0Vycm9yKGJvZHkpKVxuICAgICAgICByZXR1cm4gYm9keTtcblxuICAgICAgaWYgKHN0YXRlLmFueSlcbiAgICAgICAgcmVzdWx0ID0gaW5wdXQucmF3KHNhdmUpO1xuICAgICAgZWxzZVxuICAgICAgICBpbnB1dCA9IGJvZHk7XG4gICAgfVxuXG4gICAgLy8gU2VsZWN0IHByb3BlciBtZXRob2QgZm9yIHRhZ1xuICAgIGlmIChzdGF0ZS5hbnkpXG4gICAgICByZXN1bHQgPSByZXN1bHQ7XG4gICAgZWxzZSBpZiAoc3RhdGUuY2hvaWNlID09PSBudWxsKVxuICAgICAgcmVzdWx0ID0gdGhpcy5fZGVjb2RlR2VuZXJpYyhzdGF0ZS50YWcsIGlucHV0KTtcbiAgICBlbHNlXG4gICAgICByZXN1bHQgPSB0aGlzLl9kZWNvZGVDaG9pY2UoaW5wdXQpO1xuXG4gICAgaWYgKGlucHV0LmlzRXJyb3IocmVzdWx0KSlcbiAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICAvLyBEZWNvZGUgY2hpbGRyZW5cbiAgICBpZiAoIXN0YXRlLmFueSAmJiBzdGF0ZS5jaG9pY2UgPT09IG51bGwgJiYgc3RhdGUuY2hpbGRyZW4gIT09IG51bGwpIHtcbiAgICAgIHZhciBmYWlsID0gc3RhdGUuY2hpbGRyZW4uc29tZShmdW5jdGlvbiBkZWNvZGVDaGlsZHJlbihjaGlsZCkge1xuICAgICAgICAvLyBOT1RFOiBXZSBhcmUgaWdub3JpbmcgZXJyb3JzIGhlcmUsIHRvIGxldCBwYXJzZXIgY29udGludWUgd2l0aCBvdGhlclxuICAgICAgICAvLyBwYXJ0cyBvZiBlbmNvZGVkIGRhdGFcbiAgICAgICAgY2hpbGQuX2RlY29kZShpbnB1dCk7XG4gICAgICB9KTtcbiAgICAgIGlmIChmYWlsKVxuICAgICAgICByZXR1cm4gZXJyO1xuICAgIH1cbiAgfVxuXG4gIC8vIFBvcCBvYmplY3RcbiAgaWYgKHN0YXRlLm9iaiAmJiBwcmVzZW50KVxuICAgIHJlc3VsdCA9IGlucHV0LmxlYXZlT2JqZWN0KHByZXZPYmopO1xuXG4gIC8vIFNldCBrZXlcbiAgaWYgKHN0YXRlLmtleSAhPT0gbnVsbCAmJiAocmVzdWx0ICE9PSBudWxsIHx8IHByZXNlbnQgPT09IHRydWUpKVxuICAgIGlucHV0LmxlYXZlS2V5KHByZXZLZXksIHN0YXRlLmtleSwgcmVzdWx0KTtcblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuTm9kZS5wcm90b3R5cGUuX2RlY29kZUdlbmVyaWMgPSBmdW5jdGlvbiBkZWNvZGVHZW5lcmljKHRhZywgaW5wdXQpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuXG4gIGlmICh0YWcgPT09ICdzZXEnIHx8IHRhZyA9PT0gJ3NldCcpXG4gICAgcmV0dXJuIG51bGw7XG4gIGlmICh0YWcgPT09ICdzZXFvZicgfHwgdGFnID09PSAnc2V0b2YnKVxuICAgIHJldHVybiB0aGlzLl9kZWNvZGVMaXN0KGlucHV0LCB0YWcsIHN0YXRlLmFyZ3NbMF0pO1xuICBlbHNlIGlmICh0YWcgPT09ICdvY3RzdHInIHx8IHRhZyA9PT0gJ2JpdHN0cicpXG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZVN0cihpbnB1dCwgdGFnKTtcbiAgZWxzZSBpZiAodGFnID09PSAnaWE1c3RyJyB8fCB0YWcgPT09ICd1dGY4c3RyJylcbiAgICByZXR1cm4gdGhpcy5fZGVjb2RlU3RyKGlucHV0LCB0YWcpO1xuICBlbHNlIGlmICh0YWcgPT09ICdvYmppZCcgJiYgc3RhdGUuYXJncylcbiAgICByZXR1cm4gdGhpcy5fZGVjb2RlT2JqaWQoaW5wdXQsIHN0YXRlLmFyZ3NbMF0sIHN0YXRlLmFyZ3NbMV0pO1xuICBlbHNlIGlmICh0YWcgPT09ICdvYmppZCcpXG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZU9iamlkKGlucHV0LCBudWxsLCBudWxsKTtcbiAgZWxzZSBpZiAodGFnID09PSAnZ2VudGltZScgfHwgdGFnID09PSAndXRjdGltZScpXG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZVRpbWUoaW5wdXQsIHRhZyk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ251bGxfJylcbiAgICByZXR1cm4gdGhpcy5fZGVjb2RlTnVsbChpbnB1dCk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ2Jvb2wnKVxuICAgIHJldHVybiB0aGlzLl9kZWNvZGVCb29sKGlucHV0KTtcbiAgZWxzZSBpZiAodGFnID09PSAnaW50JyB8fCB0YWcgPT09ICdlbnVtJylcbiAgICByZXR1cm4gdGhpcy5fZGVjb2RlSW50KGlucHV0LCBzdGF0ZS5hcmdzICYmIHN0YXRlLmFyZ3NbMF0pO1xuICBlbHNlIGlmIChzdGF0ZS51c2UgIT09IG51bGwpXG4gICAgcmV0dXJuIHRoaXMuX2dldFVzZShzdGF0ZS51c2UsIGlucHV0Ll9yZXBvcnRlclN0YXRlLm9iaikuX2RlY29kZShpbnB1dCk7XG4gIGVsc2VcbiAgICByZXR1cm4gaW5wdXQuZXJyb3IoJ3Vua25vd24gdGFnOiAnICsgdGFnKTtcblxuICByZXR1cm4gbnVsbDtcbn07XG5cbk5vZGUucHJvdG90eXBlLl9nZXRVc2UgPSBmdW5jdGlvbiBfZ2V0VXNlKGVudGl0eSwgb2JqKSB7XG5cbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuICAvLyBDcmVhdGUgYWx0ZXJlZCB1c2UgZGVjb2RlciBpZiBpbXBsaWNpdCBpcyBzZXRcbiAgc3RhdGUudXNlRGVjb2RlciA9IHRoaXMuX3VzZShlbnRpdHksIG9iaik7XG4gIC8vIGFzc2VydC5lcXVhbChzdGF0ZS51c2VEZWNvZGVyLl9iYXNlU3RhdGUucGFyZW50LCBudWxsLCAnc3RhdGUudXNlRGVjb2Rlci5fYmFzZVN0YXRlLnBhcmVudCBzaG91bGQgYmUgbnVsbCcpO1xuICBzdGF0ZS51c2VEZWNvZGVyID0gc3RhdGUudXNlRGVjb2Rlci5fYmFzZVN0YXRlLmNoaWxkcmVuWzBdO1xuICBpZiAoc3RhdGUuaW1wbGljaXQgIT09IHN0YXRlLnVzZURlY29kZXIuX2Jhc2VTdGF0ZS5pbXBsaWNpdCkge1xuICAgIHN0YXRlLnVzZURlY29kZXIgPSBzdGF0ZS51c2VEZWNvZGVyLmNsb25lKCk7XG4gICAgc3RhdGUudXNlRGVjb2Rlci5fYmFzZVN0YXRlLmltcGxpY2l0ID0gc3RhdGUuaW1wbGljaXQ7XG4gIH1cbiAgcmV0dXJuIHN0YXRlLnVzZURlY29kZXI7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5fZGVjb2RlQ2hvaWNlID0gZnVuY3Rpb24gZGVjb2RlQ2hvaWNlKGlucHV0KSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcbiAgdmFyIHJlc3VsdCA9IG51bGw7XG4gIHZhciBtYXRjaCA9IGZhbHNlO1xuXG4gIE9iamVjdC5rZXlzKHN0YXRlLmNob2ljZSkuc29tZShmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgc2F2ZSA9IGlucHV0LnNhdmUoKTtcbiAgICB2YXIgbm9kZSA9IHN0YXRlLmNob2ljZVtrZXldO1xuICAgIHRyeSB7XG4gICAgICB2YXIgdmFsdWUgPSBub2RlLl9kZWNvZGUoaW5wdXQpO1xuICAgICAgaWYgKGlucHV0LmlzRXJyb3IodmFsdWUpKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHJlc3VsdCA9IHsgdHlwZToga2V5LCB2YWx1ZTogdmFsdWUgfTtcbiAgICAgIG1hdGNoID0gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpbnB1dC5yZXN0b3JlKHNhdmUpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSwgdGhpcyk7XG5cbiAgaWYgKCFtYXRjaClcbiAgICByZXR1cm4gaW5wdXQuZXJyb3IoJ0Nob2ljZSBub3QgbWF0Y2hlZCcpO1xuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vL1xuLy8gRW5jb2Rpbmdcbi8vXG5cbk5vZGUucHJvdG90eXBlLl9jcmVhdGVFbmNvZGVyQnVmZmVyID0gZnVuY3Rpb24gY3JlYXRlRW5jb2RlckJ1ZmZlcihkYXRhKSB7XG4gIHJldHVybiBuZXcgRW5jb2RlckJ1ZmZlcihkYXRhLCB0aGlzLnJlcG9ydGVyKTtcbn07XG5cbk5vZGUucHJvdG90eXBlLl9lbmNvZGUgPSBmdW5jdGlvbiBlbmNvZGUoZGF0YSwgcmVwb3J0ZXIsIHBhcmVudCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG4gIGlmIChzdGF0ZVsnZGVmYXVsdCddICE9PSBudWxsICYmIHN0YXRlWydkZWZhdWx0J10gPT09IGRhdGEpXG4gICAgcmV0dXJuO1xuXG4gIHZhciByZXN1bHQgPSB0aGlzLl9lbmNvZGVWYWx1ZShkYXRhLCByZXBvcnRlciwgcGFyZW50KTtcbiAgaWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybjtcblxuICBpZiAodGhpcy5fc2tpcERlZmF1bHQocmVzdWx0LCByZXBvcnRlciwgcGFyZW50KSlcbiAgICByZXR1cm47XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbk5vZGUucHJvdG90eXBlLl9lbmNvZGVWYWx1ZSA9IGZ1bmN0aW9uIGVuY29kZShkYXRhLCByZXBvcnRlciwgcGFyZW50KSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICAvLyBEZWNvZGUgcm9vdCBub2RlXG4gIGlmIChzdGF0ZS5wYXJlbnQgPT09IG51bGwpXG4gICAgcmV0dXJuIHN0YXRlLmNoaWxkcmVuWzBdLl9lbmNvZGUoZGF0YSwgcmVwb3J0ZXIgfHwgbmV3IFJlcG9ydGVyKCkpO1xuXG4gIHZhciByZXN1bHQgPSBudWxsO1xuICB2YXIgcHJlc2VudCA9IHRydWU7XG5cbiAgLy8gU2V0IHJlcG9ydGVyIHRvIHNoYXJlIGl0IHdpdGggYSBjaGlsZCBjbGFzc1xuICB0aGlzLnJlcG9ydGVyID0gcmVwb3J0ZXI7XG5cbiAgLy8gQ2hlY2sgaWYgZGF0YSBpcyB0aGVyZVxuICBpZiAoc3RhdGUub3B0aW9uYWwgJiYgZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHN0YXRlWydkZWZhdWx0J10gIT09IG51bGwpXG4gICAgICBkYXRhID0gc3RhdGVbJ2RlZmF1bHQnXVxuICAgIGVsc2VcbiAgICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvciBlcnJvciByZXBvcnRpbmdcbiAgdmFyIHByZXZLZXk7XG5cbiAgLy8gRW5jb2RlIGNoaWxkcmVuIGZpcnN0XG4gIHZhciBjb250ZW50ID0gbnVsbDtcbiAgdmFyIHByaW1pdGl2ZSA9IGZhbHNlO1xuICBpZiAoc3RhdGUuYW55KSB7XG4gICAgLy8gQW55dGhpbmcgdGhhdCB3YXMgZ2l2ZW4gaXMgdHJhbnNsYXRlZCB0byBidWZmZXJcbiAgICByZXN1bHQgPSB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKGRhdGEpO1xuICB9IGVsc2UgaWYgKHN0YXRlLmNob2ljZSkge1xuICAgIHJlc3VsdCA9IHRoaXMuX2VuY29kZUNob2ljZShkYXRhLCByZXBvcnRlcik7XG4gIH0gZWxzZSBpZiAoc3RhdGUuY2hpbGRyZW4pIHtcbiAgICBjb250ZW50ID0gc3RhdGUuY2hpbGRyZW4ubWFwKGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICBpZiAoY2hpbGQuX2Jhc2VTdGF0ZS50YWcgPT09ICdudWxsXycpXG4gICAgICAgIHJldHVybiBjaGlsZC5fZW5jb2RlKG51bGwsIHJlcG9ydGVyLCBkYXRhKTtcblxuICAgICAgaWYgKGNoaWxkLl9iYXNlU3RhdGUua2V5ID09PSBudWxsKVxuICAgICAgICByZXR1cm4gcmVwb3J0ZXIuZXJyb3IoJ0NoaWxkIHNob3VsZCBoYXZlIGEga2V5Jyk7XG4gICAgICB2YXIgcHJldktleSA9IHJlcG9ydGVyLmVudGVyS2V5KGNoaWxkLl9iYXNlU3RhdGUua2V5KTtcblxuICAgICAgaWYgKHR5cGVvZiBkYXRhICE9PSAnb2JqZWN0JylcbiAgICAgICAgcmV0dXJuIHJlcG9ydGVyLmVycm9yKCdDaGlsZCBleHBlY3RlZCwgYnV0IGlucHV0IGlzIG5vdCBvYmplY3QnKTtcblxuICAgICAgdmFyIHJlcyA9IGNoaWxkLl9lbmNvZGUoZGF0YVtjaGlsZC5fYmFzZVN0YXRlLmtleV0sIHJlcG9ydGVyLCBkYXRhKTtcbiAgICAgIHJlcG9ydGVyLmxlYXZlS2V5KHByZXZLZXkpO1xuXG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0sIHRoaXMpLmZpbHRlcihmdW5jdGlvbihjaGlsZCkge1xuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH0pO1xuXG4gICAgY29udGVudCA9IHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIoY29udGVudCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHN0YXRlLnRhZyA9PT0gJ3NlcW9mJyB8fCBzdGF0ZS50YWcgPT09ICdzZXRvZicpIHtcbiAgICAgIC8vIFRPRE8oaW5kdXRueSk6IHRoaXMgc2hvdWxkIGJlIHRocm93biBvbiBEU0wgbGV2ZWxcbiAgICAgIGlmICghKHN0YXRlLmFyZ3MgJiYgc3RhdGUuYXJncy5sZW5ndGggPT09IDEpKVxuICAgICAgICByZXR1cm4gcmVwb3J0ZXIuZXJyb3IoJ1RvbyBtYW55IGFyZ3MgZm9yIDogJyArIHN0YXRlLnRhZyk7XG5cbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShkYXRhKSlcbiAgICAgICAgcmV0dXJuIHJlcG9ydGVyLmVycm9yKCdzZXFvZi9zZXRvZiwgYnV0IGRhdGEgaXMgbm90IEFycmF5Jyk7XG5cbiAgICAgIHZhciBjaGlsZCA9IHRoaXMuY2xvbmUoKTtcbiAgICAgIGNoaWxkLl9iYXNlU3RhdGUuaW1wbGljaXQgPSBudWxsO1xuICAgICAgY29udGVudCA9IHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIoZGF0YS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldFVzZShzdGF0ZS5hcmdzWzBdLCBkYXRhKS5fZW5jb2RlKGl0ZW0sIHJlcG9ydGVyKTtcbiAgICAgIH0sIGNoaWxkKSk7XG4gICAgfSBlbHNlIGlmIChzdGF0ZS51c2UgIT09IG51bGwpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2dldFVzZShzdGF0ZS51c2UsIHBhcmVudCkuX2VuY29kZShkYXRhLCByZXBvcnRlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRlbnQgPSB0aGlzLl9lbmNvZGVQcmltaXRpdmUoc3RhdGUudGFnLCBkYXRhKTtcbiAgICAgIHByaW1pdGl2ZSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gRW5jb2RlIGRhdGEgaXRzZWxmXG4gIHZhciByZXN1bHQ7XG4gIGlmICghc3RhdGUuYW55ICYmIHN0YXRlLmNob2ljZSA9PT0gbnVsbCkge1xuICAgIHZhciB0YWcgPSBzdGF0ZS5pbXBsaWNpdCAhPT0gbnVsbCA/IHN0YXRlLmltcGxpY2l0IDogc3RhdGUudGFnO1xuICAgIHZhciBjbHMgPSBzdGF0ZS5pbXBsaWNpdCA9PT0gbnVsbCA/ICd1bml2ZXJzYWwnIDogJ2NvbnRleHQnO1xuXG4gICAgaWYgKHRhZyA9PT0gbnVsbCkge1xuICAgICAgaWYgKHN0YXRlLnVzZSA9PT0gbnVsbClcbiAgICAgICAgcmVwb3J0ZXIuZXJyb3IoJ1RhZyBjb3VsZCBiZSBvbW1pdGVkIG9ubHkgZm9yIC51c2UoKScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc3RhdGUudXNlID09PSBudWxsKVxuICAgICAgICByZXN1bHQgPSB0aGlzLl9lbmNvZGVDb21wb3NpdGUodGFnLCBwcmltaXRpdmUsIGNscywgY29udGVudCk7XG4gICAgfVxuICB9XG5cbiAgLy8gV3JhcCBpbiBleHBsaWNpdFxuICBpZiAoc3RhdGUuZXhwbGljaXQgIT09IG51bGwpXG4gICAgcmVzdWx0ID0gdGhpcy5fZW5jb2RlQ29tcG9zaXRlKHN0YXRlLmV4cGxpY2l0LCBmYWxzZSwgJ2NvbnRleHQnLCByZXN1bHQpO1xuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5fZW5jb2RlQ2hvaWNlID0gZnVuY3Rpb24gZW5jb2RlQ2hvaWNlKGRhdGEsIHJlcG9ydGVyKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICB2YXIgbm9kZSA9IHN0YXRlLmNob2ljZVtkYXRhLnR5cGVdO1xuICAvLyBpZiAoIW5vZGUpIHtcbiAgLy8gICBhc3NlcnQoXG4gIC8vICAgICAgIGZhbHNlLFxuICAvLyAgICAgICBkYXRhLnR5cGUgKyAnIG5vdCBmb3VuZCBpbiAnICtcbiAgLy8gICAgICAgICAgIEpTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKHN0YXRlLmNob2ljZSkpKTtcbiAgLy8gfVxuICByZXR1cm4gbm9kZS5fZW5jb2RlKGRhdGEudmFsdWUsIHJlcG9ydGVyKTtcbn07XG5cbk5vZGUucHJvdG90eXBlLl9lbmNvZGVQcmltaXRpdmUgPSBmdW5jdGlvbiBlbmNvZGVQcmltaXRpdmUodGFnLCBkYXRhKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcblxuICBpZiAodGFnID09PSAnb2N0c3RyJyB8fCB0YWcgPT09ICdiaXRzdHInIHx8IHRhZyA9PT0gJ2lhNXN0cicpXG4gICAgcmV0dXJuIHRoaXMuX2VuY29kZVN0cihkYXRhLCB0YWcpO1xuICBlbHNlIGlmICh0YWcgPT09ICd1dGY4c3RyJylcbiAgICByZXR1cm4gdGhpcy5fZW5jb2RlU3RyKGRhdGEsIHRhZyk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ29iamlkJyAmJiBzdGF0ZS5hcmdzKVxuICAgIHJldHVybiB0aGlzLl9lbmNvZGVPYmppZChkYXRhLCBzdGF0ZS5yZXZlcnNlQXJnc1swXSwgc3RhdGUuYXJnc1sxXSk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ29iamlkJylcbiAgICByZXR1cm4gdGhpcy5fZW5jb2RlT2JqaWQoZGF0YSwgbnVsbCwgbnVsbCk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ2dlbnRpbWUnIHx8IHRhZyA9PT0gJ3V0Y3RpbWUnKVxuICAgIHJldHVybiB0aGlzLl9lbmNvZGVUaW1lKGRhdGEsIHRhZyk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ251bGxfJylcbiAgICByZXR1cm4gdGhpcy5fZW5jb2RlTnVsbCgpO1xuICBlbHNlIGlmICh0YWcgPT09ICdpbnQnIHx8IHRhZyA9PT0gJ2VudW0nKVxuICAgIHJldHVybiB0aGlzLl9lbmNvZGVJbnQoZGF0YSwgc3RhdGUuYXJncyAmJiBzdGF0ZS5yZXZlcnNlQXJnc1swXSk7XG4gIGVsc2UgaWYgKHRhZyA9PT0gJ2Jvb2wnKVxuICAgIHJldHVybiB0aGlzLl9lbmNvZGVCb29sKGRhdGEpO1xuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCB0YWc6ICcgKyB0YWcpO1xufTtcbiIsInZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ3V0aWwnKS5pbmhlcml0cztcblxuZnVuY3Rpb24gUmVwb3J0ZXIob3B0aW9ucykge1xuICB0aGlzLl9yZXBvcnRlclN0YXRlID0ge1xuICAgIG9iajogbnVsbCxcbiAgICBwYXRoOiBbXSxcbiAgICBvcHRpb25zOiBvcHRpb25zIHx8IHt9LFxuICAgIGVycm9yczogW11cbiAgfTtcbn1cbmV4cG9ydHMuUmVwb3J0ZXIgPSBSZXBvcnRlcjtcblxuUmVwb3J0ZXIucHJvdG90eXBlLmlzRXJyb3IgPSBmdW5jdGlvbiBpc0Vycm9yKG9iaikge1xuICByZXR1cm4gb2JqIGluc3RhbmNlb2YgUmVwb3J0ZXJFcnJvcjtcbn07XG5cblJlcG9ydGVyLnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24gc2F2ZSgpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVwb3J0ZXJTdGF0ZTtcblxuICByZXR1cm4geyBvYmo6IHN0YXRlLm9iaiwgcGF0aExlbjogc3RhdGUucGF0aC5sZW5ndGggfTtcbn07XG5cblJlcG9ydGVyLnByb3RvdHlwZS5yZXN0b3JlID0gZnVuY3Rpb24gcmVzdG9yZShkYXRhKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlcG9ydGVyU3RhdGU7XG5cbiAgc3RhdGUub2JqID0gZGF0YS5vYmo7XG4gIHN0YXRlLnBhdGggPSBzdGF0ZS5wYXRoLnNsaWNlKDAsIGRhdGEucGF0aExlbik7XG59O1xuXG5SZXBvcnRlci5wcm90b3R5cGUuZW50ZXJLZXkgPSBmdW5jdGlvbiBlbnRlcktleShrZXkpIHtcbiAgcmV0dXJuIHRoaXMuX3JlcG9ydGVyU3RhdGUucGF0aC5wdXNoKGtleSk7XG59O1xuXG5SZXBvcnRlci5wcm90b3R5cGUubGVhdmVLZXkgPSBmdW5jdGlvbiBsZWF2ZUtleShpbmRleCwga2V5LCB2YWx1ZSkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZXBvcnRlclN0YXRlO1xuXG4gIHN0YXRlLnBhdGggPSBzdGF0ZS5wYXRoLnNsaWNlKDAsIGluZGV4IC0gMSk7XG4gIGlmIChzdGF0ZS5vYmogIT09IG51bGwpXG4gICAgc3RhdGUub2JqW2tleV0gPSB2YWx1ZTtcbn07XG5cblJlcG9ydGVyLnByb3RvdHlwZS5lbnRlck9iamVjdCA9IGZ1bmN0aW9uIGVudGVyT2JqZWN0KCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZXBvcnRlclN0YXRlO1xuXG4gIHZhciBwcmV2ID0gc3RhdGUub2JqO1xuICBzdGF0ZS5vYmogPSB7fTtcbiAgcmV0dXJuIHByZXY7XG59O1xuXG5SZXBvcnRlci5wcm90b3R5cGUubGVhdmVPYmplY3QgPSBmdW5jdGlvbiBsZWF2ZU9iamVjdChwcmV2KSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlcG9ydGVyU3RhdGU7XG5cbiAgdmFyIG5vdyA9IHN0YXRlLm9iajtcbiAgc3RhdGUub2JqID0gcHJldjtcbiAgcmV0dXJuIG5vdztcbn07XG5cblJlcG9ydGVyLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uIGVycm9yKG1zZykge1xuICB2YXIgZXJyO1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZXBvcnRlclN0YXRlO1xuXG4gIHZhciBpbmhlcml0ZWQgPSBtc2cgaW5zdGFuY2VvZiBSZXBvcnRlckVycm9yO1xuICBpZiAoaW5oZXJpdGVkKSB7XG4gICAgZXJyID0gbXNnO1xuICB9IGVsc2Uge1xuICAgIGVyciA9IG5ldyBSZXBvcnRlckVycm9yKHN0YXRlLnBhdGgubWFwKGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgIHJldHVybiAnWycgKyBKU09OLnN0cmluZ2lmeShlbGVtKSArICddJztcbiAgICB9KS5qb2luKCcnKSwgbXNnLm1lc3NhZ2UgfHwgbXNnLCBtc2cuc3RhY2spO1xuICB9XG5cbiAgaWYgKCFzdGF0ZS5vcHRpb25zLnBhcnRpYWwpXG4gICAgdGhyb3cgZXJyO1xuXG4gIGlmICghaW5oZXJpdGVkKVxuICAgIHN0YXRlLmVycm9ycy5wdXNoKGVycik7XG5cbiAgcmV0dXJuIGVycjtcbn07XG5cblJlcG9ydGVyLnByb3RvdHlwZS53cmFwUmVzdWx0ID0gZnVuY3Rpb24gd3JhcFJlc3VsdChyZXN1bHQpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVwb3J0ZXJTdGF0ZTtcbiAgaWYgKCFzdGF0ZS5vcHRpb25zLnBhcnRpYWwpXG4gICAgcmV0dXJuIHJlc3VsdDtcblxuICByZXR1cm4ge1xuICAgIHJlc3VsdDogdGhpcy5pc0Vycm9yKHJlc3VsdCkgPyBudWxsIDogcmVzdWx0LFxuICAgIGVycm9yczogc3RhdGUuZXJyb3JzXG4gIH07XG59O1xuXG5mdW5jdGlvbiBSZXBvcnRlckVycm9yKHBhdGgsIG1zZykge1xuICB0aGlzLnBhdGggPSBwYXRoO1xuICB0aGlzLnJldGhyb3cobXNnKTtcbn07XG5pbmhlcml0cyhSZXBvcnRlckVycm9yLCBFcnJvcik7XG5cblJlcG9ydGVyRXJyb3IucHJvdG90eXBlLnJldGhyb3cgPSBmdW5jdGlvbiByZXRocm93KG1zZykge1xuICB0aGlzLm1lc3NhZ2UgPSBtc2cgKyAnIGF0OiAnICsgKHRoaXMucGF0aCB8fCAnKHNoYWxsb3cpJyk7XG4gIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIFJlcG9ydGVyRXJyb3IpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcbiIsIihmdW5jdGlvbiAobW9kdWxlLCBleHBvcnRzKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuLy8gVXRpbHNcblxuZnVuY3Rpb24gYXNzZXJ0KHZhbCwgbXNnKSB7XG4gIGlmICghdmFsKVxuICAgIHRocm93IG5ldyBFcnJvcihtc2cgfHwgJ0Fzc2VydGlvbiBmYWlsZWQnKTtcbn1cblxuLy8gQ291bGQgdXNlIGBpbmhlcml0c2AgbW9kdWxlLCBidXQgZG9uJ3Qgd2FudCB0byBtb3ZlIGZyb20gc2luZ2xlIGZpbGVcbi8vIGFyY2hpdGVjdHVyZSB5ZXQuXG5mdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3I7XG4gIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9O1xuICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlO1xuICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpO1xuICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3I7XG59XG5cbi8vIEJOXG5cbmZ1bmN0aW9uIEJOKG51bWJlciwgYmFzZSwgZW5kaWFuKSB7XG4gIC8vIE1heSBiZSBgbmV3IEJOKGJuKWAgP1xuICBpZiAobnVtYmVyICE9PSBudWxsICYmXG4gICAgICB0eXBlb2YgbnVtYmVyID09PSAnb2JqZWN0JyAmJlxuICAgICAgQXJyYXkuaXNBcnJheShudW1iZXIud29yZHMpKSB7XG4gICAgcmV0dXJuIG51bWJlcjtcbiAgfVxuXG4gIHRoaXMuc2lnbiA9IGZhbHNlO1xuICB0aGlzLndvcmRzID0gbnVsbDtcbiAgdGhpcy5sZW5ndGggPSAwO1xuXG4gIC8vIFJlZHVjdGlvbiBjb250ZXh0XG4gIHRoaXMucmVkID0gbnVsbDtcblxuICBpZiAoYmFzZSA9PT0gJ2xlJyB8fCBiYXNlID09PSAnYmUnKSB7XG4gICAgZW5kaWFuID0gYmFzZTtcbiAgICBiYXNlID0gMTA7XG4gIH1cblxuICBpZiAobnVtYmVyICE9PSBudWxsKVxuICAgIHRoaXMuX2luaXQobnVtYmVyIHx8IDAsIGJhc2UgfHwgMTAsIGVuZGlhbiB8fCAnYmUnKTtcbn1cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JylcbiAgbW9kdWxlLmV4cG9ydHMgPSBCTjtcbmVsc2VcbiAgZXhwb3J0cy5CTiA9IEJOO1xuXG5CTi5CTiA9IEJOO1xuQk4ud29yZFNpemUgPSAyNjtcblxuQk4ucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gaW5pdChudW1iZXIsIGJhc2UsIGVuZGlhbikge1xuICBpZiAodHlwZW9mIG51bWJlciA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gdGhpcy5faW5pdE51bWJlcihudW1iZXIsIGJhc2UsIGVuZGlhbik7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG51bWJlciA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gdGhpcy5faW5pdEFycmF5KG51bWJlciwgYmFzZSwgZW5kaWFuKTtcbiAgfVxuICBpZiAoYmFzZSA9PT0gJ2hleCcpXG4gICAgYmFzZSA9IDE2O1xuICBhc3NlcnQoYmFzZSA9PT0gKGJhc2UgfCAwKSAmJiBiYXNlID49IDIgJiYgYmFzZSA8PSAzNik7XG5cbiAgbnVtYmVyID0gbnVtYmVyLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxzKy9nLCAnJyk7XG4gIHZhciBzdGFydCA9IDA7XG4gIGlmIChudW1iZXJbMF0gPT09ICctJylcbiAgICBzdGFydCsrO1xuXG4gIGlmIChiYXNlID09PSAxNilcbiAgICB0aGlzLl9wYXJzZUhleChudW1iZXIsIHN0YXJ0KTtcbiAgZWxzZVxuICAgIHRoaXMuX3BhcnNlQmFzZShudW1iZXIsIGJhc2UsIHN0YXJ0KTtcblxuICBpZiAobnVtYmVyWzBdID09PSAnLScpXG4gICAgdGhpcy5zaWduID0gdHJ1ZTtcblxuICB0aGlzLnN0cmlwKCk7XG5cbiAgaWYgKGVuZGlhbiAhPT0gJ2xlJylcbiAgICByZXR1cm47XG5cbiAgdGhpcy5faW5pdEFycmF5KHRoaXMudG9BcnJheSgpLCBiYXNlLCBlbmRpYW4pO1xufTtcblxuQk4ucHJvdG90eXBlLl9pbml0TnVtYmVyID0gZnVuY3Rpb24gX2luaXROdW1iZXIobnVtYmVyLCBiYXNlLCBlbmRpYW4pIHtcbiAgaWYgKG51bWJlciA8IDApIHtcbiAgICB0aGlzLnNpZ24gPSB0cnVlO1xuICAgIG51bWJlciA9IC1udW1iZXI7XG4gIH1cbiAgaWYgKG51bWJlciA8IDB4NDAwMDAwMCkge1xuICAgIHRoaXMud29yZHMgPSBbIG51bWJlciAmIDB4M2ZmZmZmZiBdO1xuICAgIHRoaXMubGVuZ3RoID0gMTtcbiAgfSBlbHNlIGlmIChudW1iZXIgPCAweDEwMDAwMDAwMDAwMDAwKSB7XG4gICAgdGhpcy53b3JkcyA9IFtcbiAgICAgIG51bWJlciAmIDB4M2ZmZmZmZixcbiAgICAgIChudW1iZXIgLyAweDQwMDAwMDApICYgMHgzZmZmZmZmXG4gICAgXTtcbiAgICB0aGlzLmxlbmd0aCA9IDI7XG4gIH0gZWxzZSB7XG4gICAgYXNzZXJ0KG51bWJlciA8IDB4MjAwMDAwMDAwMDAwMDApOyAvLyAyIF4gNTMgKHVuc2FmZSlcbiAgICB0aGlzLndvcmRzID0gW1xuICAgICAgbnVtYmVyICYgMHgzZmZmZmZmLFxuICAgICAgKG51bWJlciAvIDB4NDAwMDAwMCkgJiAweDNmZmZmZmYsXG4gICAgICAxXG4gICAgXTtcbiAgICB0aGlzLmxlbmd0aCA9IDM7XG4gIH1cblxuICBpZiAoZW5kaWFuICE9PSAnbGUnKVxuICAgIHJldHVybjtcblxuICAvLyBSZXZlcnNlIHRoZSBieXRlc1xuICB0aGlzLl9pbml0QXJyYXkodGhpcy50b0FycmF5KCksIGJhc2UsIGVuZGlhbik7XG59O1xuXG5CTi5wcm90b3R5cGUuX2luaXRBcnJheSA9IGZ1bmN0aW9uIF9pbml0QXJyYXkobnVtYmVyLCBiYXNlLCBlbmRpYW4pIHtcbiAgLy8gUGVyaGFwcyBhIFVpbnQ4QXJyYXlcbiAgYXNzZXJ0KHR5cGVvZiBudW1iZXIubGVuZ3RoID09PSAnbnVtYmVyJyk7XG4gIGlmIChudW1iZXIubGVuZ3RoIDw9IDApIHtcbiAgICB0aGlzLndvcmRzID0gWyAwIF07XG4gICAgdGhpcy5sZW5ndGggPSAxO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGhpcy5sZW5ndGggPSBNYXRoLmNlaWwobnVtYmVyLmxlbmd0aCAvIDMpO1xuICB0aGlzLndvcmRzID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKVxuICAgIHRoaXMud29yZHNbaV0gPSAwO1xuXG4gIHZhciBvZmYgPSAwO1xuICBpZiAoZW5kaWFuID09PSAnYmUnKSB7XG4gICAgZm9yICh2YXIgaSA9IG51bWJlci5sZW5ndGggLSAxLCBqID0gMDsgaSA+PSAwOyBpIC09IDMpIHtcbiAgICAgIHZhciB3ID0gbnVtYmVyW2ldIHwgKG51bWJlcltpIC0gMV0gPDwgOCkgfCAobnVtYmVyW2kgLSAyXSA8PCAxNik7XG4gICAgICB0aGlzLndvcmRzW2pdIHw9ICh3IDw8IG9mZikgJiAweDNmZmZmZmY7XG4gICAgICB0aGlzLndvcmRzW2ogKyAxXSA9ICh3ID4+PiAoMjYgLSBvZmYpKSAmIDB4M2ZmZmZmZjtcbiAgICAgIG9mZiArPSAyNDtcbiAgICAgIGlmIChvZmYgPj0gMjYpIHtcbiAgICAgICAgb2ZmIC09IDI2O1xuICAgICAgICBqKys7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKGVuZGlhbiA9PT0gJ2xlJykge1xuICAgIGZvciAodmFyIGkgPSAwLCBqID0gMDsgaSA8IG51bWJlci5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgdmFyIHcgPSBudW1iZXJbaV0gfCAobnVtYmVyW2kgKyAxXSA8PCA4KSB8IChudW1iZXJbaSArIDJdIDw8IDE2KTtcbiAgICAgIHRoaXMud29yZHNbal0gfD0gKHcgPDwgb2ZmKSAmIDB4M2ZmZmZmZjtcbiAgICAgIHRoaXMud29yZHNbaiArIDFdID0gKHcgPj4+ICgyNiAtIG9mZikpICYgMHgzZmZmZmZmO1xuICAgICAgb2ZmICs9IDI0O1xuICAgICAgaWYgKG9mZiA+PSAyNikge1xuICAgICAgICBvZmYgLT0gMjY7XG4gICAgICAgIGorKztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcbn07XG5cbmZ1bmN0aW9uIHBhcnNlSGV4KHN0ciwgc3RhcnQsIGVuZCkge1xuICB2YXIgciA9IDA7XG4gIHZhciBsZW4gPSBNYXRoLm1pbihzdHIubGVuZ3RoLCBlbmQpO1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBsZW47IGkrKykge1xuICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSkgLSA0ODtcblxuICAgIHIgPDw9IDQ7XG5cbiAgICAvLyAnYScgLSAnZidcbiAgICBpZiAoYyA+PSA0OSAmJiBjIDw9IDU0KVxuICAgICAgciB8PSBjIC0gNDkgKyAweGE7XG5cbiAgICAvLyAnQScgLSAnRidcbiAgICBlbHNlIGlmIChjID49IDE3ICYmIGMgPD0gMjIpXG4gICAgICByIHw9IGMgLSAxNyArIDB4YTtcblxuICAgIC8vICcwJyAtICc5J1xuICAgIGVsc2VcbiAgICAgIHIgfD0gYyAmIDB4ZjtcbiAgfVxuICByZXR1cm4gcjtcbn1cblxuQk4ucHJvdG90eXBlLl9wYXJzZUhleCA9IGZ1bmN0aW9uIF9wYXJzZUhleChudW1iZXIsIHN0YXJ0KSB7XG4gIC8vIENyZWF0ZSBwb3NzaWJseSBiaWdnZXIgYXJyYXkgdG8gZW5zdXJlIHRoYXQgaXQgZml0cyB0aGUgbnVtYmVyXG4gIHRoaXMubGVuZ3RoID0gTWF0aC5jZWlsKChudW1iZXIubGVuZ3RoIC0gc3RhcnQpIC8gNik7XG4gIHRoaXMud29yZHMgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspXG4gICAgdGhpcy53b3Jkc1tpXSA9IDA7XG5cbiAgLy8gU2NhbiAyNC1iaXQgY2h1bmtzIGFuZCBhZGQgdGhlbSB0byB0aGUgbnVtYmVyXG4gIHZhciBvZmYgPSAwO1xuICBmb3IgKHZhciBpID0gbnVtYmVyLmxlbmd0aCAtIDYsIGogPSAwOyBpID49IHN0YXJ0OyBpIC09IDYpIHtcbiAgICB2YXIgdyA9IHBhcnNlSGV4KG51bWJlciwgaSwgaSArIDYpO1xuICAgIHRoaXMud29yZHNbal0gfD0gKHcgPDwgb2ZmKSAmIDB4M2ZmZmZmZjtcbiAgICB0aGlzLndvcmRzW2ogKyAxXSB8PSB3ID4+PiAoMjYgLSBvZmYpICYgMHgzZmZmZmY7XG4gICAgb2ZmICs9IDI0O1xuICAgIGlmIChvZmYgPj0gMjYpIHtcbiAgICAgIG9mZiAtPSAyNjtcbiAgICAgIGorKztcbiAgICB9XG4gIH1cbiAgaWYgKGkgKyA2ICE9PSBzdGFydCkge1xuICAgIHZhciB3ID0gcGFyc2VIZXgobnVtYmVyLCBzdGFydCwgaSArIDYpO1xuICAgIHRoaXMud29yZHNbal0gfD0gKHcgPDwgb2ZmKSAmIDB4M2ZmZmZmZjtcbiAgICB0aGlzLndvcmRzW2ogKyAxXSB8PSB3ID4+PiAoMjYgLSBvZmYpICYgMHgzZmZmZmY7XG4gIH1cbiAgdGhpcy5zdHJpcCgpO1xufTtcblxuZnVuY3Rpb24gcGFyc2VCYXNlKHN0ciwgc3RhcnQsIGVuZCwgbXVsKSB7XG4gIHZhciByID0gMDtcbiAgdmFyIGxlbiA9IE1hdGgubWluKHN0ci5sZW5ndGgsIGVuZCk7XG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyIGMgPSBzdHIuY2hhckNvZGVBdChpKSAtIDQ4O1xuXG4gICAgciAqPSBtdWw7XG5cbiAgICAvLyAnYSdcbiAgICBpZiAoYyA+PSA0OSlcbiAgICAgIHIgKz0gYyAtIDQ5ICsgMHhhO1xuXG4gICAgLy8gJ0EnXG4gICAgZWxzZSBpZiAoYyA+PSAxNylcbiAgICAgIHIgKz0gYyAtIDE3ICsgMHhhO1xuXG4gICAgLy8gJzAnIC0gJzknXG4gICAgZWxzZVxuICAgICAgciArPSBjO1xuICB9XG4gIHJldHVybiByO1xufVxuXG5CTi5wcm90b3R5cGUuX3BhcnNlQmFzZSA9IGZ1bmN0aW9uIF9wYXJzZUJhc2UobnVtYmVyLCBiYXNlLCBzdGFydCkge1xuICAvLyBJbml0aWFsaXplIGFzIHplcm9cbiAgdGhpcy53b3JkcyA9IFsgMCBdO1xuICB0aGlzLmxlbmd0aCA9IDE7XG5cbiAgLy8gRmluZCBsZW5ndGggb2YgbGltYiBpbiBiYXNlXG4gIGZvciAodmFyIGxpbWJMZW4gPSAwLCBsaW1iUG93ID0gMTsgbGltYlBvdyA8PSAweDNmZmZmZmY7IGxpbWJQb3cgKj0gYmFzZSlcbiAgICBsaW1iTGVuKys7XG4gIGxpbWJMZW4tLTtcbiAgbGltYlBvdyA9IChsaW1iUG93IC8gYmFzZSkgfCAwO1xuXG4gIHZhciB0b3RhbCA9IG51bWJlci5sZW5ndGggLSBzdGFydDtcbiAgdmFyIG1vZCA9IHRvdGFsICUgbGltYkxlbjtcbiAgdmFyIGVuZCA9IE1hdGgubWluKHRvdGFsLCB0b3RhbCAtIG1vZCkgKyBzdGFydDtcblxuICB2YXIgd29yZCA9IDA7XG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSBsaW1iTGVuKSB7XG4gICAgd29yZCA9IHBhcnNlQmFzZShudW1iZXIsIGksIGkgKyBsaW1iTGVuLCBiYXNlKTtcblxuICAgIHRoaXMuaW11bG4obGltYlBvdyk7XG4gICAgaWYgKHRoaXMud29yZHNbMF0gKyB3b3JkIDwgMHg0MDAwMDAwKVxuICAgICAgdGhpcy53b3Jkc1swXSArPSB3b3JkO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuX2lhZGRuKHdvcmQpO1xuICB9XG5cbiAgaWYgKG1vZCAhPT0gMCkge1xuICAgIHZhciBwb3cgPSAxO1xuICAgIHZhciB3b3JkID0gcGFyc2VCYXNlKG51bWJlciwgaSwgbnVtYmVyLmxlbmd0aCwgYmFzZSk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vZDsgaSsrKVxuICAgICAgcG93ICo9IGJhc2U7XG4gICAgdGhpcy5pbXVsbihwb3cpO1xuICAgIGlmICh0aGlzLndvcmRzWzBdICsgd29yZCA8IDB4NDAwMDAwMClcbiAgICAgIHRoaXMud29yZHNbMF0gKz0gd29yZDtcbiAgICBlbHNlXG4gICAgICB0aGlzLl9pYWRkbih3b3JkKTtcbiAgfVxufTtcblxuQk4ucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5KGRlc3QpIHtcbiAgZGVzdC53b3JkcyA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKylcbiAgICBkZXN0LndvcmRzW2ldID0gdGhpcy53b3Jkc1tpXTtcbiAgZGVzdC5sZW5ndGggPSB0aGlzLmxlbmd0aDtcbiAgZGVzdC5zaWduID0gdGhpcy5zaWduO1xuICBkZXN0LnJlZCA9IHRoaXMucmVkO1xufTtcblxuQk4ucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gY2xvbmUoKSB7XG4gIHZhciByID0gbmV3IEJOKG51bGwpO1xuICB0aGlzLmNvcHkocik7XG4gIHJldHVybiByO1xufTtcblxuLy8gUmVtb3ZlIGxlYWRpbmcgYDBgIGZyb20gYHRoaXNgXG5CTi5wcm90b3R5cGUuc3RyaXAgPSBmdW5jdGlvbiBzdHJpcCgpIHtcbiAgd2hpbGUgKHRoaXMubGVuZ3RoID4gMSAmJiB0aGlzLndvcmRzW3RoaXMubGVuZ3RoIC0gMV0gPT09IDApXG4gICAgdGhpcy5sZW5ndGgtLTtcbiAgcmV0dXJuIHRoaXMuX25vcm1TaWduKCk7XG59O1xuXG5CTi5wcm90b3R5cGUuX25vcm1TaWduID0gZnVuY3Rpb24gX25vcm1TaWduKCkge1xuICAvLyAtMCA9IDBcbiAgaWYgKHRoaXMubGVuZ3RoID09PSAxICYmIHRoaXMud29yZHNbMF0gPT09IDApXG4gICAgdGhpcy5zaWduID0gZmFsc2U7XG4gIHJldHVybiB0aGlzO1xufTtcblxuQk4ucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0KCkge1xuICByZXR1cm4gKHRoaXMucmVkID8gJzxCTi1SOiAnIDogJzxCTjogJykgKyB0aGlzLnRvU3RyaW5nKDE2KSArICc+Jztcbn07XG5cbi8qXG5cbnZhciB6ZXJvcyA9IFtdO1xudmFyIGdyb3VwU2l6ZXMgPSBbXTtcbnZhciBncm91cEJhc2VzID0gW107XG5cbnZhciBzID0gJyc7XG52YXIgaSA9IC0xO1xud2hpbGUgKCsraSA8IEJOLndvcmRTaXplKSB7XG4gIHplcm9zW2ldID0gcztcbiAgcyArPSAnMCc7XG59XG5ncm91cFNpemVzWzBdID0gMDtcbmdyb3VwU2l6ZXNbMV0gPSAwO1xuZ3JvdXBCYXNlc1swXSA9IDA7XG5ncm91cEJhc2VzWzFdID0gMDtcbnZhciBiYXNlID0gMiAtIDE7XG53aGlsZSAoKytiYXNlIDwgMzYgKyAxKSB7XG4gIHZhciBncm91cFNpemUgPSAwO1xuICB2YXIgZ3JvdXBCYXNlID0gMTtcbiAgd2hpbGUgKGdyb3VwQmFzZSA8ICgxIDw8IEJOLndvcmRTaXplKSAvIGJhc2UpIHtcbiAgICBncm91cEJhc2UgKj0gYmFzZTtcbiAgICBncm91cFNpemUgKz0gMTtcbiAgfVxuICBncm91cFNpemVzW2Jhc2VdID0gZ3JvdXBTaXplO1xuICBncm91cEJhc2VzW2Jhc2VdID0gZ3JvdXBCYXNlO1xufVxuXG4qL1xuXG52YXIgemVyb3MgPSBbXG4gICcnLFxuICAnMCcsXG4gICcwMCcsXG4gICcwMDAnLFxuICAnMDAwMCcsXG4gICcwMDAwMCcsXG4gICcwMDAwMDAnLFxuICAnMDAwMDAwMCcsXG4gICcwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMDAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwMDAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwMDAwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCcsXG4gICcwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAnLFxuICAnMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCdcbl07XG5cbnZhciBncm91cFNpemVzID0gW1xuICAwLCAwLFxuICAyNSwgMTYsIDEyLCAxMSwgMTAsIDksIDgsXG4gIDgsIDcsIDcsIDcsIDcsIDYsIDYsXG4gIDYsIDYsIDYsIDYsIDYsIDUsIDUsXG4gIDUsIDUsIDUsIDUsIDUsIDUsIDUsXG4gIDUsIDUsIDUsIDUsIDUsIDUsIDVcbl07XG5cbnZhciBncm91cEJhc2VzID0gW1xuICAwLCAwLFxuICAzMzU1NDQzMiwgNDMwNDY3MjEsIDE2Nzc3MjE2LCA0ODgyODEyNSwgNjA0NjYxNzYsIDQwMzUzNjA3LCAxNjc3NzIxNixcbiAgNDMwNDY3MjEsIDEwMDAwMDAwLCAxOTQ4NzE3MSwgMzU4MzE4MDgsIDYyNzQ4NTE3LCA3NTI5NTM2LCAxMTM5MDYyNSxcbiAgMTY3NzcyMTYsIDI0MTM3NTY5LCAzNDAxMjIyNCwgNDcwNDU4ODEsIDY0MDAwMDAwLCA0MDg0MTAxLCA1MTUzNjMyLFxuICA2NDM2MzQzLCA3OTYyNjI0LCA5NzY1NjI1LCAxMTg4MTM3NiwgMTQzNDg5MDcsIDE3MjEwMzY4LCAyMDUxMTE0OSxcbiAgMjQzMDAwMDAsIDI4NjI5MTUxLCAzMzU1NDQzMiwgMzkxMzUzOTMsIDQ1NDM1NDI0LCA1MjUyMTg3NSwgNjA0NjYxNzZcbl07XG5cbkJOLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKGJhc2UsIHBhZGRpbmcpIHtcbiAgYmFzZSA9IGJhc2UgfHwgMTA7XG4gIGlmIChiYXNlID09PSAxNiB8fCBiYXNlID09PSAnaGV4Jykge1xuICAgIHZhciBvdXQgPSAnJztcbiAgICB2YXIgb2ZmID0gMDtcbiAgICB2YXIgcGFkZGluZyA9IHBhZGRpbmcgfCAwIHx8IDE7XG4gICAgdmFyIGNhcnJ5ID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB3ID0gdGhpcy53b3Jkc1tpXTtcbiAgICAgIHZhciB3b3JkID0gKCgodyA8PCBvZmYpIHwgY2FycnkpICYgMHhmZmZmZmYpLnRvU3RyaW5nKDE2KTtcbiAgICAgIGNhcnJ5ID0gKHcgPj4+ICgyNCAtIG9mZikpICYgMHhmZmZmZmY7XG4gICAgICBpZiAoY2FycnkgIT09IDAgfHwgaSAhPT0gdGhpcy5sZW5ndGggLSAxKVxuICAgICAgICBvdXQgPSB6ZXJvc1s2IC0gd29yZC5sZW5ndGhdICsgd29yZCArIG91dDtcbiAgICAgIGVsc2VcbiAgICAgICAgb3V0ID0gd29yZCArIG91dDtcbiAgICAgIG9mZiArPSAyO1xuICAgICAgaWYgKG9mZiA+PSAyNikge1xuICAgICAgICBvZmYgLT0gMjY7XG4gICAgICAgIGktLTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNhcnJ5ICE9PSAwKVxuICAgICAgb3V0ID0gY2FycnkudG9TdHJpbmcoMTYpICsgb3V0O1xuICAgIHdoaWxlIChvdXQubGVuZ3RoICUgcGFkZGluZyAhPT0gMClcbiAgICAgIG91dCA9ICcwJyArIG91dDtcbiAgICBpZiAodGhpcy5zaWduKVxuICAgICAgb3V0ID0gJy0nICsgb3V0O1xuICAgIHJldHVybiBvdXQ7XG4gIH0gZWxzZSBpZiAoYmFzZSA9PT0gKGJhc2UgfCAwKSAmJiBiYXNlID49IDIgJiYgYmFzZSA8PSAzNikge1xuICAgIC8vIHZhciBncm91cFNpemUgPSBNYXRoLmZsb29yKEJOLndvcmRTaXplICogTWF0aC5MTjIgLyBNYXRoLmxvZyhiYXNlKSk7XG4gICAgdmFyIGdyb3VwU2l6ZSA9IGdyb3VwU2l6ZXNbYmFzZV07XG4gICAgLy8gdmFyIGdyb3VwQmFzZSA9IE1hdGgucG93KGJhc2UsIGdyb3VwU2l6ZSk7XG4gICAgdmFyIGdyb3VwQmFzZSA9IGdyb3VwQmFzZXNbYmFzZV07XG4gICAgdmFyIG91dCA9ICcnO1xuICAgIHZhciBjID0gdGhpcy5jbG9uZSgpO1xuICAgIGMuc2lnbiA9IGZhbHNlO1xuICAgIHdoaWxlIChjLmNtcG4oMCkgIT09IDApIHtcbiAgICAgIHZhciByID0gYy5tb2RuKGdyb3VwQmFzZSkudG9TdHJpbmcoYmFzZSk7XG4gICAgICBjID0gYy5pZGl2bihncm91cEJhc2UpO1xuXG4gICAgICBpZiAoYy5jbXBuKDApICE9PSAwKVxuICAgICAgICBvdXQgPSB6ZXJvc1tncm91cFNpemUgLSByLmxlbmd0aF0gKyByICsgb3V0O1xuICAgICAgZWxzZVxuICAgICAgICBvdXQgPSByICsgb3V0O1xuICAgIH1cbiAgICBpZiAodGhpcy5jbXBuKDApID09PSAwKVxuICAgICAgb3V0ID0gJzAnICsgb3V0O1xuICAgIGlmICh0aGlzLnNpZ24pXG4gICAgICBvdXQgPSAnLScgKyBvdXQ7XG4gICAgcmV0dXJuIG91dDtcbiAgfSBlbHNlIHtcbiAgICBhc3NlcnQoZmFsc2UsICdCYXNlIHNob3VsZCBiZSBiZXR3ZWVuIDIgYW5kIDM2Jyk7XG4gIH1cbn07XG5cbkJOLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04oKSB7XG4gIHJldHVybiB0aGlzLnRvU3RyaW5nKDE2KTtcbn07XG5cbkJOLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24gdG9BcnJheShlbmRpYW4pIHtcbiAgdGhpcy5zdHJpcCgpO1xuICB2YXIgcmVzID0gbmV3IEFycmF5KHRoaXMuYnl0ZUxlbmd0aCgpKTtcbiAgcmVzWzBdID0gMDtcblxuICB2YXIgcSA9IHRoaXMuY2xvbmUoKTtcbiAgaWYgKGVuZGlhbiAhPT0gJ2xlJykge1xuICAgIC8vIEFzc3VtZSBiaWctZW5kaWFuXG4gICAgZm9yICh2YXIgaSA9IDA7IHEuY21wbigwKSAhPT0gMDsgaSsrKSB7XG4gICAgICB2YXIgYiA9IHEuYW5kbG4oMHhmZik7XG4gICAgICBxLmlzaHJuKDgpO1xuXG4gICAgICByZXNbcmVzLmxlbmd0aCAtIGkgLSAxXSA9IGI7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEFzc3VtZSBsaXR0bGUtZW5kaWFuXG4gICAgZm9yICh2YXIgaSA9IDA7IHEuY21wbigwKSAhPT0gMDsgaSsrKSB7XG4gICAgICB2YXIgYiA9IHEuYW5kbG4oMHhmZik7XG4gICAgICBxLmlzaHJuKDgpO1xuXG4gICAgICByZXNbaV0gPSBiO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXM7XG59O1xuXG5pZiAoTWF0aC5jbHozMikge1xuICBCTi5wcm90b3R5cGUuX2NvdW50Qml0cyA9IGZ1bmN0aW9uIF9jb3VudEJpdHModykge1xuICAgIHJldHVybiAzMiAtIE1hdGguY2x6MzIodyk7XG4gIH07XG59IGVsc2Uge1xuICBCTi5wcm90b3R5cGUuX2NvdW50Qml0cyA9IGZ1bmN0aW9uIF9jb3VudEJpdHModykge1xuICAgIHZhciB0ID0gdztcbiAgICB2YXIgciA9IDA7XG4gICAgaWYgKHQgPj0gMHgxMDAwKSB7XG4gICAgICByICs9IDEzO1xuICAgICAgdCA+Pj49IDEzO1xuICAgIH1cbiAgICBpZiAodCA+PSAweDQwKSB7XG4gICAgICByICs9IDc7XG4gICAgICB0ID4+Pj0gNztcbiAgICB9XG4gICAgaWYgKHQgPj0gMHg4KSB7XG4gICAgICByICs9IDQ7XG4gICAgICB0ID4+Pj0gNDtcbiAgICB9XG4gICAgaWYgKHQgPj0gMHgwMikge1xuICAgICAgciArPSAyO1xuICAgICAgdCA+Pj49IDI7XG4gICAgfVxuICAgIHJldHVybiByICsgdDtcbiAgfTtcbn1cblxuQk4ucHJvdG90eXBlLl96ZXJvQml0cyA9IGZ1bmN0aW9uIF96ZXJvQml0cyh3KSB7XG4gIC8vIFNob3J0LWN1dFxuICBpZiAodyA9PT0gMClcbiAgICByZXR1cm4gMjY7XG5cbiAgdmFyIHQgPSB3O1xuICB2YXIgciA9IDA7XG4gIGlmICgodCAmIDB4MWZmZikgPT09IDApIHtcbiAgICByICs9IDEzO1xuICAgIHQgPj4+PSAxMztcbiAgfVxuICBpZiAoKHQgJiAweDdmKSA9PT0gMCkge1xuICAgIHIgKz0gNztcbiAgICB0ID4+Pj0gNztcbiAgfVxuICBpZiAoKHQgJiAweGYpID09PSAwKSB7XG4gICAgciArPSA0O1xuICAgIHQgPj4+PSA0O1xuICB9XG4gIGlmICgodCAmIDB4MykgPT09IDApIHtcbiAgICByICs9IDI7XG4gICAgdCA+Pj49IDI7XG4gIH1cbiAgaWYgKCh0ICYgMHgxKSA9PT0gMClcbiAgICByKys7XG4gIHJldHVybiByO1xufTtcblxuLy8gUmV0dXJuIG51bWJlciBvZiB1c2VkIGJpdHMgaW4gYSBCTlxuQk4ucHJvdG90eXBlLmJpdExlbmd0aCA9IGZ1bmN0aW9uIGJpdExlbmd0aCgpIHtcbiAgdmFyIGhpID0gMDtcbiAgdmFyIHcgPSB0aGlzLndvcmRzW3RoaXMubGVuZ3RoIC0gMV07XG4gIHZhciBoaSA9IHRoaXMuX2NvdW50Qml0cyh3KTtcbiAgcmV0dXJuICh0aGlzLmxlbmd0aCAtIDEpICogMjYgKyBoaTtcbn07XG5cbi8vIE51bWJlciBvZiB0cmFpbGluZyB6ZXJvIGJpdHNcbkJOLnByb3RvdHlwZS56ZXJvQml0cyA9IGZ1bmN0aW9uIHplcm9CaXRzKCkge1xuICBpZiAodGhpcy5jbXBuKDApID09PSAwKVxuICAgIHJldHVybiAwO1xuXG4gIHZhciByID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGIgPSB0aGlzLl96ZXJvQml0cyh0aGlzLndvcmRzW2ldKTtcbiAgICByICs9IGI7XG4gICAgaWYgKGIgIT09IDI2KVxuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIHI7XG59O1xuXG5CTi5wcm90b3R5cGUuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIGJ5dGVMZW5ndGgoKSB7XG4gIHJldHVybiBNYXRoLmNlaWwodGhpcy5iaXRMZW5ndGgoKSAvIDgpO1xufTtcblxuLy8gUmV0dXJuIG5lZ2F0aXZlIGNsb25lIG9mIGB0aGlzYFxuQk4ucHJvdG90eXBlLm5lZyA9IGZ1bmN0aW9uIG5lZygpIHtcbiAgaWYgKHRoaXMuY21wbigwKSA9PT0gMClcbiAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xuXG4gIHZhciByID0gdGhpcy5jbG9uZSgpO1xuICByLnNpZ24gPSAhdGhpcy5zaWduO1xuICByZXR1cm4gcjtcbn07XG5cblxuLy8gT3IgYG51bWAgd2l0aCBgdGhpc2AgaW4tcGxhY2VcbkJOLnByb3RvdHlwZS5pb3IgPSBmdW5jdGlvbiBpb3IobnVtKSB7XG4gIHRoaXMuc2lnbiA9IHRoaXMuc2lnbiB8fCBudW0uc2lnbjtcblxuICB3aGlsZSAodGhpcy5sZW5ndGggPCBudW0ubGVuZ3RoKVxuICAgIHRoaXMud29yZHNbdGhpcy5sZW5ndGgrK10gPSAwO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtLmxlbmd0aDsgaSsrKVxuICAgIHRoaXMud29yZHNbaV0gPSB0aGlzLndvcmRzW2ldIHwgbnVtLndvcmRzW2ldO1xuXG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XG59O1xuXG5cbi8vIE9yIGBudW1gIHdpdGggYHRoaXNgXG5CTi5wcm90b3R5cGUub3IgPSBmdW5jdGlvbiBvcihudW0pIHtcbiAgaWYgKHRoaXMubGVuZ3RoID4gbnVtLmxlbmd0aClcbiAgICByZXR1cm4gdGhpcy5jbG9uZSgpLmlvcihudW0pO1xuICBlbHNlXG4gICAgcmV0dXJuIG51bS5jbG9uZSgpLmlvcih0aGlzKTtcbn07XG5cblxuLy8gQW5kIGBudW1gIHdpdGggYHRoaXNgIGluLXBsYWNlXG5CTi5wcm90b3R5cGUuaWFuZCA9IGZ1bmN0aW9uIGlhbmQobnVtKSB7XG4gIHRoaXMuc2lnbiA9IHRoaXMuc2lnbiAmJiBudW0uc2lnbjtcblxuICAvLyBiID0gbWluLWxlbmd0aChudW0sIHRoaXMpXG4gIHZhciBiO1xuICBpZiAodGhpcy5sZW5ndGggPiBudW0ubGVuZ3RoKVxuICAgIGIgPSBudW07XG4gIGVsc2VcbiAgICBiID0gdGhpcztcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspXG4gICAgdGhpcy53b3Jkc1tpXSA9IHRoaXMud29yZHNbaV0gJiBudW0ud29yZHNbaV07XG5cbiAgdGhpcy5sZW5ndGggPSBiLmxlbmd0aDtcblxuICByZXR1cm4gdGhpcy5zdHJpcCgpO1xufTtcblxuXG4vLyBBbmQgYG51bWAgd2l0aCBgdGhpc2BcbkJOLnByb3RvdHlwZS5hbmQgPSBmdW5jdGlvbiBhbmQobnVtKSB7XG4gIGlmICh0aGlzLmxlbmd0aCA+IG51bS5sZW5ndGgpXG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pYW5kKG51bSk7XG4gIGVsc2VcbiAgICByZXR1cm4gbnVtLmNsb25lKCkuaWFuZCh0aGlzKTtcbn07XG5cblxuLy8gWG9yIGBudW1gIHdpdGggYHRoaXNgIGluLXBsYWNlXG5CTi5wcm90b3R5cGUuaXhvciA9IGZ1bmN0aW9uIGl4b3IobnVtKSB7XG4gIHRoaXMuc2lnbiA9IHRoaXMuc2lnbiB8fCBudW0uc2lnbjtcblxuICAvLyBhLmxlbmd0aCA+IGIubGVuZ3RoXG4gIHZhciBhO1xuICB2YXIgYjtcbiAgaWYgKHRoaXMubGVuZ3RoID4gbnVtLmxlbmd0aCkge1xuICAgIGEgPSB0aGlzO1xuICAgIGIgPSBudW07XG4gIH0gZWxzZSB7XG4gICAgYSA9IG51bTtcbiAgICBiID0gdGhpcztcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYi5sZW5ndGg7IGkrKylcbiAgICB0aGlzLndvcmRzW2ldID0gYS53b3Jkc1tpXSBeIGIud29yZHNbaV07XG5cbiAgaWYgKHRoaXMgIT09IGEpXG4gICAgZm9yICg7IGkgPCBhLmxlbmd0aDsgaSsrKVxuICAgICAgdGhpcy53b3Jkc1tpXSA9IGEud29yZHNbaV07XG5cbiAgdGhpcy5sZW5ndGggPSBhLmxlbmd0aDtcblxuICByZXR1cm4gdGhpcy5zdHJpcCgpO1xufTtcblxuXG4vLyBYb3IgYG51bWAgd2l0aCBgdGhpc2BcbkJOLnByb3RvdHlwZS54b3IgPSBmdW5jdGlvbiB4b3IobnVtKSB7XG4gIGlmICh0aGlzLmxlbmd0aCA+IG51bS5sZW5ndGgpXG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoKS5peG9yKG51bSk7XG4gIGVsc2VcbiAgICByZXR1cm4gbnVtLmNsb25lKCkuaXhvcih0aGlzKTtcbn07XG5cblxuLy8gU2V0IGBiaXRgIG9mIGB0aGlzYFxuQk4ucHJvdG90eXBlLnNldG4gPSBmdW5jdGlvbiBzZXRuKGJpdCwgdmFsKSB7XG4gIGFzc2VydCh0eXBlb2YgYml0ID09PSAnbnVtYmVyJyAmJiBiaXQgPj0gMCk7XG5cbiAgdmFyIG9mZiA9IChiaXQgLyAyNikgfCAwO1xuICB2YXIgd2JpdCA9IGJpdCAlIDI2O1xuXG4gIHdoaWxlICh0aGlzLmxlbmd0aCA8PSBvZmYpXG4gICAgdGhpcy53b3Jkc1t0aGlzLmxlbmd0aCsrXSA9IDA7XG5cbiAgaWYgKHZhbClcbiAgICB0aGlzLndvcmRzW29mZl0gPSB0aGlzLndvcmRzW29mZl0gfCAoMSA8PCB3Yml0KTtcbiAgZWxzZVxuICAgIHRoaXMud29yZHNbb2ZmXSA9IHRoaXMud29yZHNbb2ZmXSAmIH4oMSA8PCB3Yml0KTtcblxuICByZXR1cm4gdGhpcy5zdHJpcCgpO1xufTtcblxuXG4vLyBBZGQgYG51bWAgdG8gYHRoaXNgIGluLXBsYWNlXG5CTi5wcm90b3R5cGUuaWFkZCA9IGZ1bmN0aW9uIGlhZGQobnVtKSB7XG4gIC8vIG5lZ2F0aXZlICsgcG9zaXRpdmVcbiAgaWYgKHRoaXMuc2lnbiAmJiAhbnVtLnNpZ24pIHtcbiAgICB0aGlzLnNpZ24gPSBmYWxzZTtcbiAgICB2YXIgciA9IHRoaXMuaXN1YihudW0pO1xuICAgIHRoaXMuc2lnbiA9ICF0aGlzLnNpZ247XG4gICAgcmV0dXJuIHRoaXMuX25vcm1TaWduKCk7XG5cbiAgLy8gcG9zaXRpdmUgKyBuZWdhdGl2ZVxuICB9IGVsc2UgaWYgKCF0aGlzLnNpZ24gJiYgbnVtLnNpZ24pIHtcbiAgICBudW0uc2lnbiA9IGZhbHNlO1xuICAgIHZhciByID0gdGhpcy5pc3ViKG51bSk7XG4gICAgbnVtLnNpZ24gPSB0cnVlO1xuICAgIHJldHVybiByLl9ub3JtU2lnbigpO1xuICB9XG5cbiAgLy8gYS5sZW5ndGggPiBiLmxlbmd0aFxuICB2YXIgYTtcbiAgdmFyIGI7XG4gIGlmICh0aGlzLmxlbmd0aCA+IG51bS5sZW5ndGgpIHtcbiAgICBhID0gdGhpcztcbiAgICBiID0gbnVtO1xuICB9IGVsc2Uge1xuICAgIGEgPSBudW07XG4gICAgYiA9IHRoaXM7XG4gIH1cblxuICB2YXIgY2FycnkgPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgciA9IGEud29yZHNbaV0gKyBiLndvcmRzW2ldICsgY2Fycnk7XG4gICAgdGhpcy53b3Jkc1tpXSA9IHIgJiAweDNmZmZmZmY7XG4gICAgY2FycnkgPSByID4+PiAyNjtcbiAgfVxuICBmb3IgKDsgY2FycnkgIT09IDAgJiYgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgciA9IGEud29yZHNbaV0gKyBjYXJyeTtcbiAgICB0aGlzLndvcmRzW2ldID0gciAmIDB4M2ZmZmZmZjtcbiAgICBjYXJyeSA9IHIgPj4+IDI2O1xuICB9XG5cbiAgdGhpcy5sZW5ndGggPSBhLmxlbmd0aDtcbiAgaWYgKGNhcnJ5ICE9PSAwKSB7XG4gICAgdGhpcy53b3Jkc1t0aGlzLmxlbmd0aF0gPSBjYXJyeTtcbiAgICB0aGlzLmxlbmd0aCsrO1xuICAvLyBDb3B5IHRoZSByZXN0IG9mIHRoZSB3b3Jkc1xuICB9IGVsc2UgaWYgKGEgIT09IHRoaXMpIHtcbiAgICBmb3IgKDsgaSA8IGEubGVuZ3RoOyBpKyspXG4gICAgICB0aGlzLndvcmRzW2ldID0gYS53b3Jkc1tpXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gQWRkIGBudW1gIHRvIGB0aGlzYFxuQk4ucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZChudW0pIHtcbiAgaWYgKG51bS5zaWduICYmICF0aGlzLnNpZ24pIHtcbiAgICBudW0uc2lnbiA9IGZhbHNlO1xuICAgIHZhciByZXMgPSB0aGlzLnN1YihudW0pO1xuICAgIG51bS5zaWduID0gdHJ1ZTtcbiAgICByZXR1cm4gcmVzO1xuICB9IGVsc2UgaWYgKCFudW0uc2lnbiAmJiB0aGlzLnNpZ24pIHtcbiAgICB0aGlzLnNpZ24gPSBmYWxzZTtcbiAgICB2YXIgcmVzID0gbnVtLnN1Yih0aGlzKTtcbiAgICB0aGlzLnNpZ24gPSB0cnVlO1xuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBpZiAodGhpcy5sZW5ndGggPiBudW0ubGVuZ3RoKVxuICAgIHJldHVybiB0aGlzLmNsb25lKCkuaWFkZChudW0pO1xuICBlbHNlXG4gICAgcmV0dXJuIG51bS5jbG9uZSgpLmlhZGQodGhpcyk7XG59O1xuXG4vLyBTdWJ0cmFjdCBgbnVtYCBmcm9tIGB0aGlzYCBpbi1wbGFjZVxuQk4ucHJvdG90eXBlLmlzdWIgPSBmdW5jdGlvbiBpc3ViKG51bSkge1xuICAvLyB0aGlzIC0gKC1udW0pID0gdGhpcyArIG51bVxuICBpZiAobnVtLnNpZ24pIHtcbiAgICBudW0uc2lnbiA9IGZhbHNlO1xuICAgIHZhciByID0gdGhpcy5pYWRkKG51bSk7XG4gICAgbnVtLnNpZ24gPSB0cnVlO1xuICAgIHJldHVybiByLl9ub3JtU2lnbigpO1xuXG4gIC8vIC10aGlzIC0gbnVtID0gLSh0aGlzICsgbnVtKVxuICB9IGVsc2UgaWYgKHRoaXMuc2lnbikge1xuICAgIHRoaXMuc2lnbiA9IGZhbHNlO1xuICAgIHRoaXMuaWFkZChudW0pO1xuICAgIHRoaXMuc2lnbiA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuX25vcm1TaWduKCk7XG4gIH1cblxuICAvLyBBdCB0aGlzIHBvaW50IGJvdGggbnVtYmVycyBhcmUgcG9zaXRpdmVcbiAgdmFyIGNtcCA9IHRoaXMuY21wKG51bSk7XG5cbiAgLy8gT3B0aW1pemF0aW9uIC0gemVyb2lmeVxuICBpZiAoY21wID09PSAwKSB7XG4gICAgdGhpcy5zaWduID0gZmFsc2U7XG4gICAgdGhpcy5sZW5ndGggPSAxO1xuICAgIHRoaXMud29yZHNbMF0gPSAwO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gYSA+IGJcbiAgdmFyIGE7XG4gIHZhciBiO1xuICBpZiAoY21wID4gMCkge1xuICAgIGEgPSB0aGlzO1xuICAgIGIgPSBudW07XG4gIH0gZWxzZSB7XG4gICAgYSA9IG51bTtcbiAgICBiID0gdGhpcztcbiAgfVxuXG4gIHZhciBjYXJyeSA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYi5sZW5ndGg7IGkrKykge1xuICAgIHZhciByID0gYS53b3Jkc1tpXSAtIGIud29yZHNbaV0gKyBjYXJyeTtcbiAgICBjYXJyeSA9IHIgPj4gMjY7XG4gICAgdGhpcy53b3Jkc1tpXSA9IHIgJiAweDNmZmZmZmY7XG4gIH1cbiAgZm9yICg7IGNhcnJ5ICE9PSAwICYmIGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHIgPSBhLndvcmRzW2ldICsgY2Fycnk7XG4gICAgY2FycnkgPSByID4+IDI2O1xuICAgIHRoaXMud29yZHNbaV0gPSByICYgMHgzZmZmZmZmO1xuICB9XG5cbiAgLy8gQ29weSByZXN0IG9mIHRoZSB3b3Jkc1xuICBpZiAoY2FycnkgPT09IDAgJiYgaSA8IGEubGVuZ3RoICYmIGEgIT09IHRoaXMpXG4gICAgZm9yICg7IGkgPCBhLmxlbmd0aDsgaSsrKVxuICAgICAgdGhpcy53b3Jkc1tpXSA9IGEud29yZHNbaV07XG4gIHRoaXMubGVuZ3RoID0gTWF0aC5tYXgodGhpcy5sZW5ndGgsIGkpO1xuXG4gIGlmIChhICE9PSB0aGlzKVxuICAgIHRoaXMuc2lnbiA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcbn07XG5cbi8vIFN1YnRyYWN0IGBudW1gIGZyb20gYHRoaXNgXG5CTi5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24gc3ViKG51bSkge1xuICByZXR1cm4gdGhpcy5jbG9uZSgpLmlzdWIobnVtKTtcbn07XG5cbi8qXG4vLyBOT1RFOiBUaGlzIGNvdWxkIGJlIHBvdGVudGlvbmFsbHkgdXNlZCB0byBnZW5lcmF0ZSBsb29wLWxlc3MgbXVsdGlwbGljYXRpb25zXG5mdW5jdGlvbiBfZ2VuQ29tYk11bFRvKGFsZW4sIGJsZW4pIHtcbiAgdmFyIGxlbiA9IGFsZW4gKyBibGVuIC0gMTtcbiAgdmFyIHNyYyA9IFtcbiAgICAndmFyIGEgPSB0aGlzLndvcmRzLCBiID0gbnVtLndvcmRzLCBvID0gb3V0LndvcmRzLCBjID0gMCwgdywgJyArXG4gICAgICAgICdtYXNrID0gMHgzZmZmZmZmLCBzaGlmdCA9IDB4NDAwMDAwMDsnLFxuICAgICdvdXQubGVuZ3RoID0gJyArIGxlbiArICc7J1xuICBdO1xuICBmb3IgKHZhciBrID0gMDsgayA8IGxlbjsgaysrKSB7XG4gICAgdmFyIG1pbkogPSBNYXRoLm1heCgwLCBrIC0gYWxlbiArIDEpO1xuICAgIHZhciBtYXhKID0gTWF0aC5taW4oaywgYmxlbiAtIDEpO1xuXG4gICAgZm9yICh2YXIgaiA9IG1pbko7IGogPD0gbWF4SjsgaisrKSB7XG4gICAgICB2YXIgaSA9IGsgLSBqO1xuICAgICAgdmFyIG11bCA9ICdhWycgKyBpICsgJ10gKiBiWycgKyBqICsgJ10nO1xuXG4gICAgICBpZiAoaiA9PT0gbWluSikge1xuICAgICAgICBzcmMucHVzaCgndyA9ICcgKyBtdWwgKyAnICsgYzsnKTtcbiAgICAgICAgc3JjLnB1c2goJ2MgPSAodyAvIHNoaWZ0KSB8IDA7Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzcmMucHVzaCgndyArPSAnICsgbXVsICsgJzsnKTtcbiAgICAgICAgc3JjLnB1c2goJ2MgKz0gKHcgLyBzaGlmdCkgfCAwOycpO1xuICAgICAgfVxuICAgICAgc3JjLnB1c2goJ3cgJj0gbWFzazsnKTtcbiAgICB9XG4gICAgc3JjLnB1c2goJ29bJyArIGsgKyAnXSA9IHc7Jyk7XG4gIH1cbiAgc3JjLnB1c2goJ2lmIChjICE9PSAwKSB7JyxcbiAgICAgICAgICAgJyAgb1snICsgayArICddID0gYzsnLFxuICAgICAgICAgICAnICBvdXQubGVuZ3RoKys7JyxcbiAgICAgICAgICAgJ30nLFxuICAgICAgICAgICAncmV0dXJuIG91dDsnKTtcblxuICByZXR1cm4gc3JjLmpvaW4oJ1xcbicpO1xufVxuKi9cblxuQk4ucHJvdG90eXBlLl9zbWFsbE11bFRvID0gZnVuY3Rpb24gX3NtYWxsTXVsVG8obnVtLCBvdXQpIHtcbiAgb3V0LnNpZ24gPSBudW0uc2lnbiAhPT0gdGhpcy5zaWduO1xuICBvdXQubGVuZ3RoID0gdGhpcy5sZW5ndGggKyBudW0ubGVuZ3RoO1xuXG4gIHZhciBjYXJyeSA9IDA7XG4gIGZvciAodmFyIGsgPSAwOyBrIDwgb3V0Lmxlbmd0aCAtIDE7IGsrKykge1xuICAgIC8vIFN1bSBhbGwgd29yZHMgd2l0aCB0aGUgc2FtZSBgaSArIGogPSBrYCBhbmQgYWNjdW11bGF0ZSBgbmNhcnJ5YCxcbiAgICAvLyBub3RlIHRoYXQgbmNhcnJ5IGNvdWxkIGJlID49IDB4M2ZmZmZmZlxuICAgIHZhciBuY2FycnkgPSBjYXJyeSA+Pj4gMjY7XG4gICAgdmFyIHJ3b3JkID0gY2FycnkgJiAweDNmZmZmZmY7XG4gICAgdmFyIG1heEogPSBNYXRoLm1pbihrLCBudW0ubGVuZ3RoIC0gMSk7XG4gICAgZm9yICh2YXIgaiA9IE1hdGgubWF4KDAsIGsgLSB0aGlzLmxlbmd0aCArIDEpOyBqIDw9IG1heEo7IGorKykge1xuICAgICAgdmFyIGkgPSBrIC0gajtcbiAgICAgIHZhciBhID0gdGhpcy53b3Jkc1tpXSB8IDA7XG4gICAgICB2YXIgYiA9IG51bS53b3Jkc1tqXSB8IDA7XG4gICAgICB2YXIgciA9IGEgKiBiO1xuXG4gICAgICB2YXIgbG8gPSByICYgMHgzZmZmZmZmO1xuICAgICAgbmNhcnJ5ID0gKG5jYXJyeSArICgociAvIDB4NDAwMDAwMCkgfCAwKSkgfCAwO1xuICAgICAgbG8gPSAobG8gKyByd29yZCkgfCAwO1xuICAgICAgcndvcmQgPSBsbyAmIDB4M2ZmZmZmZjtcbiAgICAgIG5jYXJyeSA9IChuY2FycnkgKyAobG8gPj4+IDI2KSkgfCAwO1xuICAgIH1cbiAgICBvdXQud29yZHNba10gPSByd29yZDtcbiAgICBjYXJyeSA9IG5jYXJyeTtcbiAgfVxuICBpZiAoY2FycnkgIT09IDApIHtcbiAgICBvdXQud29yZHNba10gPSBjYXJyeTtcbiAgfSBlbHNlIHtcbiAgICBvdXQubGVuZ3RoLS07XG4gIH1cblxuICByZXR1cm4gb3V0LnN0cmlwKCk7XG59O1xuXG5CTi5wcm90b3R5cGUuX2JpZ011bFRvID0gZnVuY3Rpb24gX2JpZ011bFRvKG51bSwgb3V0KSB7XG4gIG91dC5zaWduID0gbnVtLnNpZ24gIT09IHRoaXMuc2lnbjtcbiAgb3V0Lmxlbmd0aCA9IHRoaXMubGVuZ3RoICsgbnVtLmxlbmd0aDtcblxuICB2YXIgY2FycnkgPSAwO1xuICB2YXIgaG5jYXJyeSA9IDA7XG4gIGZvciAodmFyIGsgPSAwOyBrIDwgb3V0Lmxlbmd0aCAtIDE7IGsrKykge1xuICAgIC8vIFN1bSBhbGwgd29yZHMgd2l0aCB0aGUgc2FtZSBgaSArIGogPSBrYCBhbmQgYWNjdW11bGF0ZSBgbmNhcnJ5YCxcbiAgICAvLyBub3RlIHRoYXQgbmNhcnJ5IGNvdWxkIGJlID49IDB4M2ZmZmZmZlxuICAgIHZhciBuY2FycnkgPSBobmNhcnJ5O1xuICAgIGhuY2FycnkgPSAwO1xuICAgIHZhciByd29yZCA9IGNhcnJ5ICYgMHgzZmZmZmZmO1xuICAgIHZhciBtYXhKID0gTWF0aC5taW4oaywgbnVtLmxlbmd0aCAtIDEpO1xuICAgIGZvciAodmFyIGogPSBNYXRoLm1heCgwLCBrIC0gdGhpcy5sZW5ndGggKyAxKTsgaiA8PSBtYXhKOyBqKyspIHtcbiAgICAgIHZhciBpID0gayAtIGo7XG4gICAgICB2YXIgYSA9IHRoaXMud29yZHNbaV0gfCAwO1xuICAgICAgdmFyIGIgPSBudW0ud29yZHNbal0gfCAwO1xuICAgICAgdmFyIHIgPSBhICogYjtcblxuICAgICAgdmFyIGxvID0gciAmIDB4M2ZmZmZmZjtcbiAgICAgIG5jYXJyeSA9IChuY2FycnkgKyAoKHIgLyAweDQwMDAwMDApIHwgMCkpIHwgMDtcbiAgICAgIGxvID0gKGxvICsgcndvcmQpIHwgMDtcbiAgICAgIHJ3b3JkID0gbG8gJiAweDNmZmZmZmY7XG4gICAgICBuY2FycnkgPSAobmNhcnJ5ICsgKGxvID4+PiAyNikpIHwgMDtcblxuICAgICAgaG5jYXJyeSArPSBuY2FycnkgPj4+IDI2O1xuICAgICAgbmNhcnJ5ICY9IDB4M2ZmZmZmZjtcbiAgICB9XG4gICAgb3V0LndvcmRzW2tdID0gcndvcmQ7XG4gICAgY2FycnkgPSBuY2Fycnk7XG4gICAgbmNhcnJ5ID0gaG5jYXJyeTtcbiAgfVxuICBpZiAoY2FycnkgIT09IDApIHtcbiAgICBvdXQud29yZHNba10gPSBjYXJyeTtcbiAgfSBlbHNlIHtcbiAgICBvdXQubGVuZ3RoLS07XG4gIH1cblxuICByZXR1cm4gb3V0LnN0cmlwKCk7XG59O1xuXG5CTi5wcm90b3R5cGUubXVsVG8gPSBmdW5jdGlvbiBtdWxUbyhudW0sIG91dCkge1xuICB2YXIgcmVzO1xuICBpZiAodGhpcy5sZW5ndGggKyBudW0ubGVuZ3RoIDwgNjMpXG4gICAgcmVzID0gdGhpcy5fc21hbGxNdWxUbyhudW0sIG91dCk7XG4gIGVsc2VcbiAgICByZXMgPSB0aGlzLl9iaWdNdWxUbyhudW0sIG91dCk7XG4gIHJldHVybiByZXM7XG59O1xuXG4vLyBNdWx0aXBseSBgdGhpc2AgYnkgYG51bWBcbkJOLnByb3RvdHlwZS5tdWwgPSBmdW5jdGlvbiBtdWwobnVtKSB7XG4gIHZhciBvdXQgPSBuZXcgQk4obnVsbCk7XG4gIG91dC53b3JkcyA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCArIG51bS5sZW5ndGgpO1xuICByZXR1cm4gdGhpcy5tdWxUbyhudW0sIG91dCk7XG59O1xuXG4vLyBJbi1wbGFjZSBNdWx0aXBsaWNhdGlvblxuQk4ucHJvdG90eXBlLmltdWwgPSBmdW5jdGlvbiBpbXVsKG51bSkge1xuICBpZiAodGhpcy5jbXBuKDApID09PSAwIHx8IG51bS5jbXBuKDApID09PSAwKSB7XG4gICAgdGhpcy53b3Jkc1swXSA9IDA7XG4gICAgdGhpcy5sZW5ndGggPSAxO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdmFyIHRsZW4gPSB0aGlzLmxlbmd0aDtcbiAgdmFyIG5sZW4gPSBudW0ubGVuZ3RoO1xuXG4gIHRoaXMuc2lnbiA9IG51bS5zaWduICE9PSB0aGlzLnNpZ247XG4gIHRoaXMubGVuZ3RoID0gdGhpcy5sZW5ndGggKyBudW0ubGVuZ3RoO1xuICB0aGlzLndvcmRzW3RoaXMubGVuZ3RoIC0gMV0gPSAwO1xuXG4gIGZvciAodmFyIGsgPSB0aGlzLmxlbmd0aCAtIDI7IGsgPj0gMDsgay0tKSB7XG4gICAgLy8gU3VtIGFsbCB3b3JkcyB3aXRoIHRoZSBzYW1lIGBpICsgaiA9IGtgIGFuZCBhY2N1bXVsYXRlIGBjYXJyeWAsXG4gICAgLy8gbm90ZSB0aGF0IGNhcnJ5IGNvdWxkIGJlID49IDB4M2ZmZmZmZlxuICAgIHZhciBjYXJyeSA9IDA7XG4gICAgdmFyIHJ3b3JkID0gMDtcbiAgICB2YXIgbWF4SiA9IE1hdGgubWluKGssIG5sZW4gLSAxKTtcbiAgICBmb3IgKHZhciBqID0gTWF0aC5tYXgoMCwgayAtIHRsZW4gKyAxKTsgaiA8PSBtYXhKOyBqKyspIHtcbiAgICAgIHZhciBpID0gayAtIGo7XG4gICAgICB2YXIgYSA9IHRoaXMud29yZHNbaV07XG4gICAgICB2YXIgYiA9IG51bS53b3Jkc1tqXTtcbiAgICAgIHZhciByID0gYSAqIGI7XG5cbiAgICAgIHZhciBsbyA9IHIgJiAweDNmZmZmZmY7XG4gICAgICBjYXJyeSArPSAociAvIDB4NDAwMDAwMCkgfCAwO1xuICAgICAgbG8gKz0gcndvcmQ7XG4gICAgICByd29yZCA9IGxvICYgMHgzZmZmZmZmO1xuICAgICAgY2FycnkgKz0gbG8gPj4+IDI2O1xuICAgIH1cbiAgICB0aGlzLndvcmRzW2tdID0gcndvcmQ7XG4gICAgdGhpcy53b3Jkc1trICsgMV0gKz0gY2Fycnk7XG4gICAgY2FycnkgPSAwO1xuICB9XG5cbiAgLy8gUHJvcGFnYXRlIG92ZXJmbG93c1xuICB2YXIgY2FycnkgPSAwO1xuICBmb3IgKHZhciBpID0gMTsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdyA9IHRoaXMud29yZHNbaV0gKyBjYXJyeTtcbiAgICB0aGlzLndvcmRzW2ldID0gdyAmIDB4M2ZmZmZmZjtcbiAgICBjYXJyeSA9IHcgPj4+IDI2O1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcbn07XG5cbkJOLnByb3RvdHlwZS5pbXVsbiA9IGZ1bmN0aW9uIGltdWxuKG51bSkge1xuICBhc3NlcnQodHlwZW9mIG51bSA9PT0gJ251bWJlcicpO1xuXG4gIC8vIENhcnJ5XG4gIHZhciBjYXJyeSA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB3ID0gdGhpcy53b3Jkc1tpXSAqIG51bTtcbiAgICB2YXIgbG8gPSAodyAmIDB4M2ZmZmZmZikgKyAoY2FycnkgJiAweDNmZmZmZmYpO1xuICAgIGNhcnJ5ID4+PSAyNjtcbiAgICBjYXJyeSArPSAodyAvIDB4NDAwMDAwMCkgfCAwO1xuICAgIC8vIE5PVEU6IGxvIGlzIDI3Yml0IG1heGltdW1cbiAgICBjYXJyeSArPSBsbyA+Pj4gMjY7XG4gICAgdGhpcy53b3Jkc1tpXSA9IGxvICYgMHgzZmZmZmZmO1xuICB9XG5cbiAgaWYgKGNhcnJ5ICE9PSAwKSB7XG4gICAgdGhpcy53b3Jkc1tpXSA9IGNhcnJ5O1xuICAgIHRoaXMubGVuZ3RoKys7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkJOLnByb3RvdHlwZS5tdWxuID0gZnVuY3Rpb24gbXVsbihudW0pIHtcbiAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pbXVsbihudW0pO1xufTtcblxuLy8gYHRoaXNgICogYHRoaXNgXG5CTi5wcm90b3R5cGUuc3FyID0gZnVuY3Rpb24gc3FyKCkge1xuICByZXR1cm4gdGhpcy5tdWwodGhpcyk7XG59O1xuXG4vLyBgdGhpc2AgKiBgdGhpc2AgaW4tcGxhY2VcbkJOLnByb3RvdHlwZS5pc3FyID0gZnVuY3Rpb24gaXNxcigpIHtcbiAgcmV0dXJuIHRoaXMubXVsKHRoaXMpO1xufTtcblxuLy8gU2hpZnQtbGVmdCBpbi1wbGFjZVxuQk4ucHJvdG90eXBlLmlzaGxuID0gZnVuY3Rpb24gaXNobG4oYml0cykge1xuICBhc3NlcnQodHlwZW9mIGJpdHMgPT09ICdudW1iZXInICYmIGJpdHMgPj0gMCk7XG4gIHZhciByID0gYml0cyAlIDI2O1xuICB2YXIgcyA9IChiaXRzIC0gcikgLyAyNjtcbiAgdmFyIGNhcnJ5TWFzayA9ICgweDNmZmZmZmYgPj4+ICgyNiAtIHIpKSA8PCAoMjYgLSByKTtcblxuICBpZiAociAhPT0gMCkge1xuICAgIHZhciBjYXJyeSA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbmV3Q2FycnkgPSB0aGlzLndvcmRzW2ldICYgY2FycnlNYXNrO1xuICAgICAgdmFyIGMgPSAodGhpcy53b3Jkc1tpXSAtIG5ld0NhcnJ5KSA8PCByO1xuICAgICAgdGhpcy53b3Jkc1tpXSA9IGMgfCBjYXJyeTtcbiAgICAgIGNhcnJ5ID0gbmV3Q2FycnkgPj4+ICgyNiAtIHIpO1xuICAgIH1cbiAgICBpZiAoY2FycnkpIHtcbiAgICAgIHRoaXMud29yZHNbaV0gPSBjYXJyeTtcbiAgICAgIHRoaXMubGVuZ3RoKys7XG4gICAgfVxuICB9XG5cbiAgaWYgKHMgIT09IDApIHtcbiAgICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcbiAgICAgIHRoaXMud29yZHNbaSArIHNdID0gdGhpcy53b3Jkc1tpXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHM7IGkrKylcbiAgICAgIHRoaXMud29yZHNbaV0gPSAwO1xuICAgIHRoaXMubGVuZ3RoICs9IHM7XG4gIH1cblxuICByZXR1cm4gdGhpcy5zdHJpcCgpO1xufTtcblxuLy8gU2hpZnQtcmlnaHQgaW4tcGxhY2Vcbi8vIE5PVEU6IGBoaW50YCBpcyBhIGxvd2VzdCBiaXQgYmVmb3JlIHRyYWlsaW5nIHplcm9lc1xuLy8gTk9URTogaWYgYGV4dGVuZGVkYCBpcyBwcmVzZW50IC0gaXQgd2lsbCBiZSBmaWxsZWQgd2l0aCBkZXN0cm95ZWQgYml0c1xuQk4ucHJvdG90eXBlLmlzaHJuID0gZnVuY3Rpb24gaXNocm4oYml0cywgaGludCwgZXh0ZW5kZWQpIHtcbiAgYXNzZXJ0KHR5cGVvZiBiaXRzID09PSAnbnVtYmVyJyAmJiBiaXRzID49IDApO1xuICB2YXIgaDtcbiAgaWYgKGhpbnQpXG4gICAgaCA9IChoaW50IC0gKGhpbnQgJSAyNikpIC8gMjY7XG4gIGVsc2VcbiAgICBoID0gMDtcblxuICB2YXIgciA9IGJpdHMgJSAyNjtcbiAgdmFyIHMgPSBNYXRoLm1pbigoYml0cyAtIHIpIC8gMjYsIHRoaXMubGVuZ3RoKTtcbiAgdmFyIG1hc2sgPSAweDNmZmZmZmYgXiAoKDB4M2ZmZmZmZiA+Pj4gcikgPDwgcik7XG4gIHZhciBtYXNrZWRXb3JkcyA9IGV4dGVuZGVkO1xuXG4gIGggLT0gcztcbiAgaCA9IE1hdGgubWF4KDAsIGgpO1xuXG4gIC8vIEV4dGVuZGVkIG1vZGUsIGNvcHkgbWFza2VkIHBhcnRcbiAgaWYgKG1hc2tlZFdvcmRzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzOyBpKyspXG4gICAgICBtYXNrZWRXb3Jkcy53b3Jkc1tpXSA9IHRoaXMud29yZHNbaV07XG4gICAgbWFza2VkV29yZHMubGVuZ3RoID0gcztcbiAgfVxuXG4gIGlmIChzID09PSAwKSB7XG4gICAgLy8gTm8tb3AsIHdlIHNob3VsZCBub3QgbW92ZSBhbnl0aGluZyBhdCBhbGxcbiAgfSBlbHNlIGlmICh0aGlzLmxlbmd0aCA+IHMpIHtcbiAgICB0aGlzLmxlbmd0aCAtPSBzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKylcbiAgICAgIHRoaXMud29yZHNbaV0gPSB0aGlzLndvcmRzW2kgKyBzXTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLndvcmRzWzBdID0gMDtcbiAgICB0aGlzLmxlbmd0aCA9IDE7XG4gIH1cblxuICB2YXIgY2FycnkgPSAwO1xuICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDAgJiYgKGNhcnJ5ICE9PSAwIHx8IGkgPj0gaCk7IGktLSkge1xuICAgIHZhciB3b3JkID0gdGhpcy53b3Jkc1tpXTtcbiAgICB0aGlzLndvcmRzW2ldID0gKGNhcnJ5IDw8ICgyNiAtIHIpKSB8ICh3b3JkID4+PiByKTtcbiAgICBjYXJyeSA9IHdvcmQgJiBtYXNrO1xuICB9XG5cbiAgLy8gUHVzaCBjYXJyaWVkIGJpdHMgYXMgYSBtYXNrXG4gIGlmIChtYXNrZWRXb3JkcyAmJiBjYXJyeSAhPT0gMClcbiAgICBtYXNrZWRXb3Jkcy53b3Jkc1ttYXNrZWRXb3Jkcy5sZW5ndGgrK10gPSBjYXJyeTtcblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHtcbiAgICB0aGlzLndvcmRzWzBdID0gMDtcbiAgICB0aGlzLmxlbmd0aCA9IDE7XG4gIH1cblxuICB0aGlzLnN0cmlwKCk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBTaGlmdC1sZWZ0XG5CTi5wcm90b3R5cGUuc2hsbiA9IGZ1bmN0aW9uIHNobG4oYml0cykge1xuICByZXR1cm4gdGhpcy5jbG9uZSgpLmlzaGxuKGJpdHMpO1xufTtcblxuLy8gU2hpZnQtcmlnaHRcbkJOLnByb3RvdHlwZS5zaHJuID0gZnVuY3Rpb24gc2hybihiaXRzKSB7XG4gIHJldHVybiB0aGlzLmNsb25lKCkuaXNocm4oYml0cyk7XG59O1xuXG4vLyBUZXN0IGlmIG4gYml0IGlzIHNldFxuQk4ucHJvdG90eXBlLnRlc3RuID0gZnVuY3Rpb24gdGVzdG4oYml0KSB7XG4gIGFzc2VydCh0eXBlb2YgYml0ID09PSAnbnVtYmVyJyAmJiBiaXQgPj0gMCk7XG4gIHZhciByID0gYml0ICUgMjY7XG4gIHZhciBzID0gKGJpdCAtIHIpIC8gMjY7XG4gIHZhciBxID0gMSA8PCByO1xuXG4gIC8vIEZhc3QgY2FzZTogYml0IGlzIG11Y2ggaGlnaGVyIHRoYW4gYWxsIGV4aXN0aW5nIHdvcmRzXG4gIGlmICh0aGlzLmxlbmd0aCA8PSBzKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgYml0IGFuZCByZXR1cm5cbiAgdmFyIHcgPSB0aGlzLndvcmRzW3NdO1xuXG4gIHJldHVybiAhISh3ICYgcSk7XG59O1xuXG4vLyBSZXR1cm4gb25seSBsb3dlcnMgYml0cyBvZiBudW1iZXIgKGluLXBsYWNlKVxuQk4ucHJvdG90eXBlLmltYXNrbiA9IGZ1bmN0aW9uIGltYXNrbihiaXRzKSB7XG4gIGFzc2VydCh0eXBlb2YgYml0cyA9PT0gJ251bWJlcicgJiYgYml0cyA+PSAwKTtcbiAgdmFyIHIgPSBiaXRzICUgMjY7XG4gIHZhciBzID0gKGJpdHMgLSByKSAvIDI2O1xuXG4gIGFzc2VydCghdGhpcy5zaWduLCAnaW1hc2tuIHdvcmtzIG9ubHkgd2l0aCBwb3NpdGl2ZSBudW1iZXJzJyk7XG5cbiAgaWYgKHIgIT09IDApXG4gICAgcysrO1xuICB0aGlzLmxlbmd0aCA9IE1hdGgubWluKHMsIHRoaXMubGVuZ3RoKTtcblxuICBpZiAociAhPT0gMCkge1xuICAgIHZhciBtYXNrID0gMHgzZmZmZmZmIF4gKCgweDNmZmZmZmYgPj4+IHIpIDw8IHIpO1xuICAgIHRoaXMud29yZHNbdGhpcy5sZW5ndGggLSAxXSAmPSBtYXNrO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcbn07XG5cbi8vIFJldHVybiBvbmx5IGxvd2VycyBiaXRzIG9mIG51bWJlclxuQk4ucHJvdG90eXBlLm1hc2tuID0gZnVuY3Rpb24gbWFza24oYml0cykge1xuICByZXR1cm4gdGhpcy5jbG9uZSgpLmltYXNrbihiaXRzKTtcbn07XG5cbi8vIEFkZCBwbGFpbiBudW1iZXIgYG51bWAgdG8gYHRoaXNgXG5CTi5wcm90b3R5cGUuaWFkZG4gPSBmdW5jdGlvbiBpYWRkbihudW0pIHtcbiAgYXNzZXJ0KHR5cGVvZiBudW0gPT09ICdudW1iZXInKTtcbiAgaWYgKG51bSA8IDApXG4gICAgcmV0dXJuIHRoaXMuaXN1Ym4oLW51bSk7XG5cbiAgLy8gUG9zc2libGUgc2lnbiBjaGFuZ2VcbiAgaWYgKHRoaXMuc2lnbikge1xuICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMSAmJiB0aGlzLndvcmRzWzBdIDwgbnVtKSB7XG4gICAgICB0aGlzLndvcmRzWzBdID0gbnVtIC0gdGhpcy53b3Jkc1swXTtcbiAgICAgIHRoaXMuc2lnbiA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5zaWduID0gZmFsc2U7XG4gICAgdGhpcy5pc3VibihudW0pO1xuICAgIHRoaXMuc2lnbiA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBBZGQgd2l0aG91dCBjaGVja3NcbiAgcmV0dXJuIHRoaXMuX2lhZGRuKG51bSk7XG59O1xuXG5CTi5wcm90b3R5cGUuX2lhZGRuID0gZnVuY3Rpb24gX2lhZGRuKG51bSkge1xuICB0aGlzLndvcmRzWzBdICs9IG51bTtcblxuICAvLyBDYXJyeVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoICYmIHRoaXMud29yZHNbaV0gPj0gMHg0MDAwMDAwOyBpKyspIHtcbiAgICB0aGlzLndvcmRzW2ldIC09IDB4NDAwMDAwMDtcbiAgICBpZiAoaSA9PT0gdGhpcy5sZW5ndGggLSAxKVxuICAgICAgdGhpcy53b3Jkc1tpICsgMV0gPSAxO1xuICAgIGVsc2VcbiAgICAgIHRoaXMud29yZHNbaSArIDFdKys7XG4gIH1cbiAgdGhpcy5sZW5ndGggPSBNYXRoLm1heCh0aGlzLmxlbmd0aCwgaSArIDEpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gU3VidHJhY3QgcGxhaW4gbnVtYmVyIGBudW1gIGZyb20gYHRoaXNgXG5CTi5wcm90b3R5cGUuaXN1Ym4gPSBmdW5jdGlvbiBpc3VibihudW0pIHtcbiAgYXNzZXJ0KHR5cGVvZiBudW0gPT09ICdudW1iZXInKTtcbiAgaWYgKG51bSA8IDApXG4gICAgcmV0dXJuIHRoaXMuaWFkZG4oLW51bSk7XG5cbiAgaWYgKHRoaXMuc2lnbikge1xuICAgIHRoaXMuc2lnbiA9IGZhbHNlO1xuICAgIHRoaXMuaWFkZG4obnVtKTtcbiAgICB0aGlzLnNpZ24gPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGhpcy53b3Jkc1swXSAtPSBudW07XG5cbiAgLy8gQ2FycnlcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aCAmJiB0aGlzLndvcmRzW2ldIDwgMDsgaSsrKSB7XG4gICAgdGhpcy53b3Jkc1tpXSArPSAweDQwMDAwMDA7XG4gICAgdGhpcy53b3Jkc1tpICsgMV0gLT0gMTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XG59O1xuXG5CTi5wcm90b3R5cGUuYWRkbiA9IGZ1bmN0aW9uIGFkZG4obnVtKSB7XG4gIHJldHVybiB0aGlzLmNsb25lKCkuaWFkZG4obnVtKTtcbn07XG5cbkJOLnByb3RvdHlwZS5zdWJuID0gZnVuY3Rpb24gc3VibihudW0pIHtcbiAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pc3VibihudW0pO1xufTtcblxuQk4ucHJvdG90eXBlLmlhYnMgPSBmdW5jdGlvbiBpYWJzKCkge1xuICB0aGlzLnNpZ24gPSBmYWxzZTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkJOLnByb3RvdHlwZS5hYnMgPSBmdW5jdGlvbiBhYnMoKSB7XG4gIHJldHVybiB0aGlzLmNsb25lKCkuaWFicygpO1xufTtcblxuQk4ucHJvdG90eXBlLl9pc2hsbnN1Ym11bCA9IGZ1bmN0aW9uIF9pc2hsbnN1Ym11bChudW0sIG11bCwgc2hpZnQpIHtcbiAgLy8gQmlnZ2VyIHN0b3JhZ2UgaXMgbmVlZGVkXG4gIHZhciBsZW4gPSBudW0ubGVuZ3RoICsgc2hpZnQ7XG4gIHZhciBpO1xuICBpZiAodGhpcy53b3Jkcy5sZW5ndGggPCBsZW4pIHtcbiAgICB2YXIgdCA9IG5ldyBBcnJheShsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKylcbiAgICAgIHRbaV0gPSB0aGlzLndvcmRzW2ldO1xuICAgIHRoaXMud29yZHMgPSB0O1xuICB9IGVsc2Uge1xuICAgIGkgPSB0aGlzLmxlbmd0aDtcbiAgfVxuXG4gIC8vIFplcm9pZnkgcmVzdFxuICB0aGlzLmxlbmd0aCA9IE1hdGgubWF4KHRoaXMubGVuZ3RoLCBsZW4pO1xuICBmb3IgKDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspXG4gICAgdGhpcy53b3Jkc1tpXSA9IDA7XG5cbiAgdmFyIGNhcnJ5ID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0ubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdyA9IHRoaXMud29yZHNbaSArIHNoaWZ0XSArIGNhcnJ5O1xuICAgIHZhciByaWdodCA9IG51bS53b3Jkc1tpXSAqIG11bDtcbiAgICB3IC09IHJpZ2h0ICYgMHgzZmZmZmZmO1xuICAgIGNhcnJ5ID0gKHcgPj4gMjYpIC0gKChyaWdodCAvIDB4NDAwMDAwMCkgfCAwKTtcbiAgICB0aGlzLndvcmRzW2kgKyBzaGlmdF0gPSB3ICYgMHgzZmZmZmZmO1xuICB9XG4gIGZvciAoOyBpIDwgdGhpcy5sZW5ndGggLSBzaGlmdDsgaSsrKSB7XG4gICAgdmFyIHcgPSB0aGlzLndvcmRzW2kgKyBzaGlmdF0gKyBjYXJyeTtcbiAgICBjYXJyeSA9IHcgPj4gMjY7XG4gICAgdGhpcy53b3Jkc1tpICsgc2hpZnRdID0gdyAmIDB4M2ZmZmZmZjtcbiAgfVxuXG4gIGlmIChjYXJyeSA9PT0gMClcbiAgICByZXR1cm4gdGhpcy5zdHJpcCgpO1xuXG4gIC8vIFN1YnRyYWN0aW9uIG92ZXJmbG93XG4gIGFzc2VydChjYXJyeSA9PT0gLTEpO1xuICBjYXJyeSA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB3ID0gLXRoaXMud29yZHNbaV0gKyBjYXJyeTtcbiAgICBjYXJyeSA9IHcgPj4gMjY7XG4gICAgdGhpcy53b3Jkc1tpXSA9IHcgJiAweDNmZmZmZmY7XG4gIH1cbiAgdGhpcy5zaWduID0gdHJ1ZTtcblxuICByZXR1cm4gdGhpcy5zdHJpcCgpO1xufTtcblxuQk4ucHJvdG90eXBlLl93b3JkRGl2ID0gZnVuY3Rpb24gX3dvcmREaXYobnVtLCBtb2RlKSB7XG4gIHZhciBzaGlmdCA9IHRoaXMubGVuZ3RoIC0gbnVtLmxlbmd0aDtcblxuICB2YXIgYSA9IHRoaXMuY2xvbmUoKTtcbiAgdmFyIGIgPSBudW07XG5cbiAgLy8gTm9ybWFsaXplXG4gIHZhciBiaGkgPSBiLndvcmRzW2IubGVuZ3RoIC0gMV07XG4gIHZhciBiaGlCaXRzID0gdGhpcy5fY291bnRCaXRzKGJoaSk7XG4gIHNoaWZ0ID0gMjYgLSBiaGlCaXRzO1xuICBpZiAoc2hpZnQgIT09IDApIHtcbiAgICBiID0gYi5zaGxuKHNoaWZ0KTtcbiAgICBhLmlzaGxuKHNoaWZ0KTtcbiAgICBiaGkgPSBiLndvcmRzW2IubGVuZ3RoIC0gMV07XG4gIH1cblxuICAvLyBJbml0aWFsaXplIHF1b3RpZW50XG4gIHZhciBtID0gYS5sZW5ndGggLSBiLmxlbmd0aDtcbiAgdmFyIHE7XG5cbiAgaWYgKG1vZGUgIT09ICdtb2QnKSB7XG4gICAgcSA9IG5ldyBCTihudWxsKTtcbiAgICBxLmxlbmd0aCA9IG0gKyAxO1xuICAgIHEud29yZHMgPSBuZXcgQXJyYXkocS5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcS5sZW5ndGg7IGkrKylcbiAgICAgIHEud29yZHNbaV0gPSAwO1xuICB9XG5cbiAgdmFyIGRpZmYgPSBhLmNsb25lKCkuX2lzaGxuc3VibXVsKGIsIDEsIG0pO1xuICBpZiAoIWRpZmYuc2lnbikge1xuICAgIGEgPSBkaWZmO1xuICAgIGlmIChxKVxuICAgICAgcS53b3Jkc1ttXSA9IDE7XG4gIH1cblxuICBmb3IgKHZhciBqID0gbSAtIDE7IGogPj0gMDsgai0tKSB7XG4gICAgdmFyIHFqID0gYS53b3Jkc1tiLmxlbmd0aCArIGpdICogMHg0MDAwMDAwICsgYS53b3Jkc1tiLmxlbmd0aCArIGogLSAxXTtcblxuICAgIC8vIE5PVEU6IChxaiAvIGJoaSkgaXMgKDB4M2ZmZmZmZiAqIDB4NDAwMDAwMCArIDB4M2ZmZmZmZikgLyAweDIwMDAwMDAgbWF4XG4gICAgLy8gKDB4N2ZmZmZmZilcbiAgICBxaiA9IE1hdGgubWluKChxaiAvIGJoaSkgfCAwLCAweDNmZmZmZmYpO1xuXG4gICAgYS5faXNobG5zdWJtdWwoYiwgcWosIGopO1xuICAgIHdoaWxlIChhLnNpZ24pIHtcbiAgICAgIHFqLS07XG4gICAgICBhLnNpZ24gPSBmYWxzZTtcbiAgICAgIGEuX2lzaGxuc3VibXVsKGIsIDEsIGopO1xuICAgICAgaWYgKGEuY21wbigwKSAhPT0gMClcbiAgICAgICAgYS5zaWduID0gIWEuc2lnbjtcbiAgICB9XG4gICAgaWYgKHEpXG4gICAgICBxLndvcmRzW2pdID0gcWo7XG4gIH1cbiAgaWYgKHEpXG4gICAgcS5zdHJpcCgpO1xuICBhLnN0cmlwKCk7XG5cbiAgLy8gRGVub3JtYWxpemVcbiAgaWYgKG1vZGUgIT09ICdkaXYnICYmIHNoaWZ0ICE9PSAwKVxuICAgIGEuaXNocm4oc2hpZnQpO1xuICByZXR1cm4geyBkaXY6IHEgPyBxIDogbnVsbCwgbW9kOiBhIH07XG59O1xuXG5CTi5wcm90b3R5cGUuZGl2bW9kID0gZnVuY3Rpb24gZGl2bW9kKG51bSwgbW9kZSkge1xuICBhc3NlcnQobnVtLmNtcG4oMCkgIT09IDApO1xuXG4gIGlmICh0aGlzLnNpZ24gJiYgIW51bS5zaWduKSB7XG4gICAgdmFyIHJlcyA9IHRoaXMubmVnKCkuZGl2bW9kKG51bSwgbW9kZSk7XG4gICAgdmFyIGRpdjtcbiAgICB2YXIgbW9kO1xuICAgIGlmIChtb2RlICE9PSAnbW9kJylcbiAgICAgIGRpdiA9IHJlcy5kaXYubmVnKCk7XG4gICAgaWYgKG1vZGUgIT09ICdkaXYnKVxuICAgICAgbW9kID0gcmVzLm1vZC5jbXBuKDApID09PSAwID8gcmVzLm1vZCA6IG51bS5zdWIocmVzLm1vZCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRpdjogZGl2LFxuICAgICAgbW9kOiBtb2RcbiAgICB9O1xuICB9IGVsc2UgaWYgKCF0aGlzLnNpZ24gJiYgbnVtLnNpZ24pIHtcbiAgICB2YXIgcmVzID0gdGhpcy5kaXZtb2QobnVtLm5lZygpLCBtb2RlKTtcbiAgICB2YXIgZGl2O1xuICAgIGlmIChtb2RlICE9PSAnbW9kJylcbiAgICAgIGRpdiA9IHJlcy5kaXYubmVnKCk7XG4gICAgcmV0dXJuIHsgZGl2OiBkaXYsIG1vZDogcmVzLm1vZCB9O1xuICB9IGVsc2UgaWYgKHRoaXMuc2lnbiAmJiBudW0uc2lnbikge1xuICAgIHJldHVybiB0aGlzLm5lZygpLmRpdm1vZChudW0ubmVnKCksIG1vZGUpO1xuICB9XG5cbiAgLy8gQm90aCBudW1iZXJzIGFyZSBwb3NpdGl2ZSBhdCB0aGlzIHBvaW50XG5cbiAgLy8gU3RyaXAgYm90aCBudW1iZXJzIHRvIGFwcHJveGltYXRlIHNoaWZ0IHZhbHVlXG4gIGlmIChudW0ubGVuZ3RoID4gdGhpcy5sZW5ndGggfHwgdGhpcy5jbXAobnVtKSA8IDApXG4gICAgcmV0dXJuIHsgZGl2OiBuZXcgQk4oMCksIG1vZDogdGhpcyB9O1xuXG4gIC8vIFZlcnkgc2hvcnQgcmVkdWN0aW9uXG4gIGlmIChudW0ubGVuZ3RoID09PSAxKSB7XG4gICAgaWYgKG1vZGUgPT09ICdkaXYnKVxuICAgICAgcmV0dXJuIHsgZGl2OiB0aGlzLmRpdm4obnVtLndvcmRzWzBdKSwgbW9kOiBudWxsIH07XG4gICAgZWxzZSBpZiAobW9kZSA9PT0gJ21vZCcpXG4gICAgICByZXR1cm4geyBkaXY6IG51bGwsIG1vZDogbmV3IEJOKHRoaXMubW9kbihudW0ud29yZHNbMF0pKSB9O1xuICAgIHJldHVybiB7XG4gICAgICBkaXY6IHRoaXMuZGl2bihudW0ud29yZHNbMF0pLFxuICAgICAgbW9kOiBuZXcgQk4odGhpcy5tb2RuKG51bS53b3Jkc1swXSkpXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLl93b3JkRGl2KG51bSwgbW9kZSk7XG59O1xuXG4vLyBGaW5kIGB0aGlzYCAvIGBudW1gXG5CTi5wcm90b3R5cGUuZGl2ID0gZnVuY3Rpb24gZGl2KG51bSkge1xuICByZXR1cm4gdGhpcy5kaXZtb2QobnVtLCAnZGl2JykuZGl2O1xufTtcblxuLy8gRmluZCBgdGhpc2AgJSBgbnVtYFxuQk4ucHJvdG90eXBlLm1vZCA9IGZ1bmN0aW9uIG1vZChudW0pIHtcbiAgcmV0dXJuIHRoaXMuZGl2bW9kKG51bSwgJ21vZCcpLm1vZDtcbn07XG5cbi8vIEZpbmQgUm91bmQoYHRoaXNgIC8gYG51bWApXG5CTi5wcm90b3R5cGUuZGl2Um91bmQgPSBmdW5jdGlvbiBkaXZSb3VuZChudW0pIHtcbiAgdmFyIGRtID0gdGhpcy5kaXZtb2QobnVtKTtcblxuICAvLyBGYXN0IGNhc2UgLSBleGFjdCBkaXZpc2lvblxuICBpZiAoZG0ubW9kLmNtcG4oMCkgPT09IDApXG4gICAgcmV0dXJuIGRtLmRpdjtcblxuICB2YXIgbW9kID0gZG0uZGl2LnNpZ24gPyBkbS5tb2QuaXN1YihudW0pIDogZG0ubW9kO1xuXG4gIHZhciBoYWxmID0gbnVtLnNocm4oMSk7XG4gIHZhciByMiA9IG51bS5hbmRsbigxKTtcbiAgdmFyIGNtcCA9IG1vZC5jbXAoaGFsZik7XG5cbiAgLy8gUm91bmQgZG93blxuICBpZiAoY21wIDwgMCB8fCByMiA9PT0gMSAmJiBjbXAgPT09IDApXG4gICAgcmV0dXJuIGRtLmRpdjtcblxuICAvLyBSb3VuZCB1cFxuICByZXR1cm4gZG0uZGl2LnNpZ24gPyBkbS5kaXYuaXN1Ym4oMSkgOiBkbS5kaXYuaWFkZG4oMSk7XG59O1xuXG5CTi5wcm90b3R5cGUubW9kbiA9IGZ1bmN0aW9uIG1vZG4obnVtKSB7XG4gIGFzc2VydChudW0gPD0gMHgzZmZmZmZmKTtcbiAgdmFyIHAgPSAoMSA8PCAyNikgJSBudW07XG5cbiAgdmFyIGFjYyA9IDA7XG4gIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxuICAgIGFjYyA9IChwICogYWNjICsgdGhpcy53b3Jkc1tpXSkgJSBudW07XG5cbiAgcmV0dXJuIGFjYztcbn07XG5cbi8vIEluLXBsYWNlIGRpdmlzaW9uIGJ5IG51bWJlclxuQk4ucHJvdG90eXBlLmlkaXZuID0gZnVuY3Rpb24gaWRpdm4obnVtKSB7XG4gIGFzc2VydChudW0gPD0gMHgzZmZmZmZmKTtcblxuICB2YXIgY2FycnkgPSAwO1xuICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciB3ID0gdGhpcy53b3Jkc1tpXSArIGNhcnJ5ICogMHg0MDAwMDAwO1xuICAgIHRoaXMud29yZHNbaV0gPSAodyAvIG51bSkgfCAwO1xuICAgIGNhcnJ5ID0gdyAlIG51bTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XG59O1xuXG5CTi5wcm90b3R5cGUuZGl2biA9IGZ1bmN0aW9uIGRpdm4obnVtKSB7XG4gIHJldHVybiB0aGlzLmNsb25lKCkuaWRpdm4obnVtKTtcbn07XG5cbkJOLnByb3RvdHlwZS5lZ2NkID0gZnVuY3Rpb24gZWdjZChwKSB7XG4gIGFzc2VydCghcC5zaWduKTtcbiAgYXNzZXJ0KHAuY21wbigwKSAhPT0gMCk7XG5cbiAgdmFyIHggPSB0aGlzO1xuICB2YXIgeSA9IHAuY2xvbmUoKTtcblxuICBpZiAoeC5zaWduKVxuICAgIHggPSB4Lm1vZChwKTtcbiAgZWxzZVxuICAgIHggPSB4LmNsb25lKCk7XG5cbiAgLy8gQSAqIHggKyBCICogeSA9IHhcbiAgdmFyIEEgPSBuZXcgQk4oMSk7XG4gIHZhciBCID0gbmV3IEJOKDApO1xuXG4gIC8vIEMgKiB4ICsgRCAqIHkgPSB5XG4gIHZhciBDID0gbmV3IEJOKDApO1xuICB2YXIgRCA9IG5ldyBCTigxKTtcblxuICB2YXIgZyA9IDA7XG5cbiAgd2hpbGUgKHguaXNFdmVuKCkgJiYgeS5pc0V2ZW4oKSkge1xuICAgIHguaXNocm4oMSk7XG4gICAgeS5pc2hybigxKTtcbiAgICArK2c7XG4gIH1cblxuICB2YXIgeXAgPSB5LmNsb25lKCk7XG4gIHZhciB4cCA9IHguY2xvbmUoKTtcblxuICB3aGlsZSAoeC5jbXBuKDApICE9PSAwKSB7XG4gICAgd2hpbGUgKHguaXNFdmVuKCkpIHtcbiAgICAgIHguaXNocm4oMSk7XG4gICAgICBpZiAoQS5pc0V2ZW4oKSAmJiBCLmlzRXZlbigpKSB7XG4gICAgICAgIEEuaXNocm4oMSk7XG4gICAgICAgIEIuaXNocm4oMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBBLmlhZGQoeXApLmlzaHJuKDEpO1xuICAgICAgICBCLmlzdWIoeHApLmlzaHJuKDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHdoaWxlICh5LmlzRXZlbigpKSB7XG4gICAgICB5LmlzaHJuKDEpO1xuICAgICAgaWYgKEMuaXNFdmVuKCkgJiYgRC5pc0V2ZW4oKSkge1xuICAgICAgICBDLmlzaHJuKDEpO1xuICAgICAgICBELmlzaHJuKDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgQy5pYWRkKHlwKS5pc2hybigxKTtcbiAgICAgICAgRC5pc3ViKHhwKS5pc2hybigxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoeC5jbXAoeSkgPj0gMCkge1xuICAgICAgeC5pc3ViKHkpO1xuICAgICAgQS5pc3ViKEMpO1xuICAgICAgQi5pc3ViKEQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB5LmlzdWIoeCk7XG4gICAgICBDLmlzdWIoQSk7XG4gICAgICBELmlzdWIoQik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBhOiBDLFxuICAgIGI6IEQsXG4gICAgZ2NkOiB5LmlzaGxuKGcpXG4gIH07XG59O1xuXG4vLyBUaGlzIGlzIHJlZHVjZWQgaW5jYXJuYXRpb24gb2YgdGhlIGJpbmFyeSBFRUFcbi8vIGFib3ZlLCBkZXNpZ25hdGVkIHRvIGludmVydCBtZW1iZXJzIG9mIHRoZVxuLy8gX3ByaW1lXyBmaWVsZHMgRihwKSBhdCBhIG1heGltYWwgc3BlZWRcbkJOLnByb3RvdHlwZS5faW52bXAgPSBmdW5jdGlvbiBfaW52bXAocCkge1xuICBhc3NlcnQoIXAuc2lnbik7XG4gIGFzc2VydChwLmNtcG4oMCkgIT09IDApO1xuXG4gIHZhciBhID0gdGhpcztcbiAgdmFyIGIgPSBwLmNsb25lKCk7XG5cbiAgaWYgKGEuc2lnbilcbiAgICBhID0gYS5tb2QocCk7XG4gIGVsc2VcbiAgICBhID0gYS5jbG9uZSgpO1xuXG4gIHZhciB4MSA9IG5ldyBCTigxKTtcbiAgdmFyIHgyID0gbmV3IEJOKDApO1xuXG4gIHZhciBkZWx0YSA9IGIuY2xvbmUoKTtcblxuICB3aGlsZSAoYS5jbXBuKDEpID4gMCAmJiBiLmNtcG4oMSkgPiAwKSB7XG4gICAgd2hpbGUgKGEuaXNFdmVuKCkpIHtcbiAgICAgIGEuaXNocm4oMSk7XG4gICAgICBpZiAoeDEuaXNFdmVuKCkpXG4gICAgICAgIHgxLmlzaHJuKDEpO1xuICAgICAgZWxzZVxuICAgICAgICB4MS5pYWRkKGRlbHRhKS5pc2hybigxKTtcbiAgICB9XG4gICAgd2hpbGUgKGIuaXNFdmVuKCkpIHtcbiAgICAgIGIuaXNocm4oMSk7XG4gICAgICBpZiAoeDIuaXNFdmVuKCkpXG4gICAgICAgIHgyLmlzaHJuKDEpO1xuICAgICAgZWxzZVxuICAgICAgICB4Mi5pYWRkKGRlbHRhKS5pc2hybigxKTtcbiAgICB9XG4gICAgaWYgKGEuY21wKGIpID49IDApIHtcbiAgICAgIGEuaXN1YihiKTtcbiAgICAgIHgxLmlzdWIoeDIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBiLmlzdWIoYSk7XG4gICAgICB4Mi5pc3ViKHgxKTtcbiAgICB9XG4gIH1cbiAgaWYgKGEuY21wbigxKSA9PT0gMClcbiAgICByZXR1cm4geDE7XG4gIGVsc2VcbiAgICByZXR1cm4geDI7XG59O1xuXG5CTi5wcm90b3R5cGUuZ2NkID0gZnVuY3Rpb24gZ2NkKG51bSkge1xuICBpZiAodGhpcy5jbXBuKDApID09PSAwKVxuICAgIHJldHVybiBudW0uY2xvbmUoKTtcbiAgaWYgKG51bS5jbXBuKDApID09PSAwKVxuICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG5cbiAgdmFyIGEgPSB0aGlzLmNsb25lKCk7XG4gIHZhciBiID0gbnVtLmNsb25lKCk7XG4gIGEuc2lnbiA9IGZhbHNlO1xuICBiLnNpZ24gPSBmYWxzZTtcblxuICAvLyBSZW1vdmUgY29tbW9uIGZhY3RvciBvZiB0d29cbiAgZm9yICh2YXIgc2hpZnQgPSAwOyBhLmlzRXZlbigpICYmIGIuaXNFdmVuKCk7IHNoaWZ0KyspIHtcbiAgICBhLmlzaHJuKDEpO1xuICAgIGIuaXNocm4oMSk7XG4gIH1cblxuICBkbyB7XG4gICAgd2hpbGUgKGEuaXNFdmVuKCkpXG4gICAgICBhLmlzaHJuKDEpO1xuICAgIHdoaWxlIChiLmlzRXZlbigpKVxuICAgICAgYi5pc2hybigxKTtcblxuICAgIHZhciByID0gYS5jbXAoYik7XG4gICAgaWYgKHIgPCAwKSB7XG4gICAgICAvLyBTd2FwIGBhYCBhbmQgYGJgIHRvIG1ha2UgYGFgIGFsd2F5cyBiaWdnZXIgdGhhbiBgYmBcbiAgICAgIHZhciB0ID0gYTtcbiAgICAgIGEgPSBiO1xuICAgICAgYiA9IHQ7XG4gICAgfSBlbHNlIGlmIChyID09PSAwIHx8IGIuY21wbigxKSA9PT0gMCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgYS5pc3ViKGIpO1xuICB9IHdoaWxlICh0cnVlKTtcblxuICByZXR1cm4gYi5pc2hsbihzaGlmdCk7XG59O1xuXG4vLyBJbnZlcnQgbnVtYmVyIGluIHRoZSBmaWVsZCBGKG51bSlcbkJOLnByb3RvdHlwZS5pbnZtID0gZnVuY3Rpb24gaW52bShudW0pIHtcbiAgcmV0dXJuIHRoaXMuZWdjZChudW0pLmEubW9kKG51bSk7XG59O1xuXG5CTi5wcm90b3R5cGUuaXNFdmVuID0gZnVuY3Rpb24gaXNFdmVuKCkge1xuICByZXR1cm4gKHRoaXMud29yZHNbMF0gJiAxKSA9PT0gMDtcbn07XG5cbkJOLnByb3RvdHlwZS5pc09kZCA9IGZ1bmN0aW9uIGlzT2RkKCkge1xuICByZXR1cm4gKHRoaXMud29yZHNbMF0gJiAxKSA9PT0gMTtcbn07XG5cbi8vIEFuZCBmaXJzdCB3b3JkIGFuZCBudW1cbkJOLnByb3RvdHlwZS5hbmRsbiA9IGZ1bmN0aW9uIGFuZGxuKG51bSkge1xuICByZXR1cm4gdGhpcy53b3Jkc1swXSAmIG51bTtcbn07XG5cbi8vIEluY3JlbWVudCBhdCB0aGUgYml0IHBvc2l0aW9uIGluLWxpbmVcbkJOLnByb3RvdHlwZS5iaW5jbiA9IGZ1bmN0aW9uIGJpbmNuKGJpdCkge1xuICBhc3NlcnQodHlwZW9mIGJpdCA9PT0gJ251bWJlcicpO1xuICB2YXIgciA9IGJpdCAlIDI2O1xuICB2YXIgcyA9IChiaXQgLSByKSAvIDI2O1xuICB2YXIgcSA9IDEgPDwgcjtcblxuICAvLyBGYXN0IGNhc2U6IGJpdCBpcyBtdWNoIGhpZ2hlciB0aGFuIGFsbCBleGlzdGluZyB3b3Jkc1xuICBpZiAodGhpcy5sZW5ndGggPD0gcykge1xuICAgIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aDsgaSA8IHMgKyAxOyBpKyspXG4gICAgICB0aGlzLndvcmRzW2ldID0gMDtcbiAgICB0aGlzLndvcmRzW3NdIHw9IHE7XG4gICAgdGhpcy5sZW5ndGggPSBzICsgMTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIEFkZCBiaXQgYW5kIHByb3BhZ2F0ZSwgaWYgbmVlZGVkXG4gIHZhciBjYXJyeSA9IHE7XG4gIGZvciAodmFyIGkgPSBzOyBjYXJyeSAhPT0gMCAmJiBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB3ID0gdGhpcy53b3Jkc1tpXTtcbiAgICB3ICs9IGNhcnJ5O1xuICAgIGNhcnJ5ID0gdyA+Pj4gMjY7XG4gICAgdyAmPSAweDNmZmZmZmY7XG4gICAgdGhpcy53b3Jkc1tpXSA9IHc7XG4gIH1cbiAgaWYgKGNhcnJ5ICE9PSAwKSB7XG4gICAgdGhpcy53b3Jkc1tpXSA9IGNhcnJ5O1xuICAgIHRoaXMubGVuZ3RoKys7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5CTi5wcm90b3R5cGUuY21wbiA9IGZ1bmN0aW9uIGNtcG4obnVtKSB7XG4gIHZhciBzaWduID0gbnVtIDwgMDtcbiAgaWYgKHNpZ24pXG4gICAgbnVtID0gLW51bTtcblxuICBpZiAodGhpcy5zaWduICYmICFzaWduKVxuICAgIHJldHVybiAtMTtcbiAgZWxzZSBpZiAoIXRoaXMuc2lnbiAmJiBzaWduKVxuICAgIHJldHVybiAxO1xuXG4gIG51bSAmPSAweDNmZmZmZmY7XG4gIHRoaXMuc3RyaXAoKTtcblxuICB2YXIgcmVzO1xuICBpZiAodGhpcy5sZW5ndGggPiAxKSB7XG4gICAgcmVzID0gMTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgdyA9IHRoaXMud29yZHNbMF07XG4gICAgcmVzID0gdyA9PT0gbnVtID8gMCA6IHcgPCBudW0gPyAtMSA6IDE7XG4gIH1cbiAgaWYgKHRoaXMuc2lnbilcbiAgICByZXMgPSAtcmVzO1xuICByZXR1cm4gcmVzO1xufTtcblxuLy8gQ29tcGFyZSB0d28gbnVtYmVycyBhbmQgcmV0dXJuOlxuLy8gMSAtIGlmIGB0aGlzYCA+IGBudW1gXG4vLyAwIC0gaWYgYHRoaXNgID09IGBudW1gXG4vLyAtMSAtIGlmIGB0aGlzYCA8IGBudW1gXG5CTi5wcm90b3R5cGUuY21wID0gZnVuY3Rpb24gY21wKG51bSkge1xuICBpZiAodGhpcy5zaWduICYmICFudW0uc2lnbilcbiAgICByZXR1cm4gLTE7XG4gIGVsc2UgaWYgKCF0aGlzLnNpZ24gJiYgbnVtLnNpZ24pXG4gICAgcmV0dXJuIDE7XG5cbiAgdmFyIHJlcyA9IHRoaXMudWNtcChudW0pO1xuICBpZiAodGhpcy5zaWduKVxuICAgIHJldHVybiAtcmVzO1xuICBlbHNlXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbi8vIFVuc2lnbmVkIGNvbXBhcmlzb25cbkJOLnByb3RvdHlwZS51Y21wID0gZnVuY3Rpb24gdWNtcChudW0pIHtcbiAgLy8gQXQgdGhpcyBwb2ludCBib3RoIG51bWJlcnMgaGF2ZSB0aGUgc2FtZSBzaWduXG4gIGlmICh0aGlzLmxlbmd0aCA+IG51bS5sZW5ndGgpXG4gICAgcmV0dXJuIDE7XG4gIGVsc2UgaWYgKHRoaXMubGVuZ3RoIDwgbnVtLmxlbmd0aClcbiAgICByZXR1cm4gLTE7XG5cbiAgdmFyIHJlcyA9IDA7XG4gIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGEgPSB0aGlzLndvcmRzW2ldO1xuICAgIHZhciBiID0gbnVtLndvcmRzW2ldO1xuXG4gICAgaWYgKGEgPT09IGIpXG4gICAgICBjb250aW51ZTtcbiAgICBpZiAoYSA8IGIpXG4gICAgICByZXMgPSAtMTtcbiAgICBlbHNlIGlmIChhID4gYilcbiAgICAgIHJlcyA9IDE7XG4gICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn07XG5cbi8vXG4vLyBBIHJlZHVjZSBjb250ZXh0LCBjb3VsZCBiZSB1c2luZyBtb250Z29tZXJ5IG9yIHNvbWV0aGluZyBiZXR0ZXIsIGRlcGVuZGluZ1xuLy8gb24gdGhlIGBtYCBpdHNlbGYuXG4vL1xuQk4ucmVkID0gZnVuY3Rpb24gcmVkKG51bSkge1xuICByZXR1cm4gbmV3IFJlZChudW0pO1xufTtcblxuQk4ucHJvdG90eXBlLnRvUmVkID0gZnVuY3Rpb24gdG9SZWQoY3R4KSB7XG4gIGFzc2VydCghdGhpcy5yZWQsICdBbHJlYWR5IGEgbnVtYmVyIGluIHJlZHVjdGlvbiBjb250ZXh0Jyk7XG4gIGFzc2VydCghdGhpcy5zaWduLCAncmVkIHdvcmtzIG9ubHkgd2l0aCBwb3NpdGl2ZXMnKTtcbiAgcmV0dXJuIGN0eC5jb252ZXJ0VG8odGhpcykuX2ZvcmNlUmVkKGN0eCk7XG59O1xuXG5CTi5wcm90b3R5cGUuZnJvbVJlZCA9IGZ1bmN0aW9uIGZyb21SZWQoKSB7XG4gIGFzc2VydCh0aGlzLnJlZCwgJ2Zyb21SZWQgd29ya3Mgb25seSB3aXRoIG51bWJlcnMgaW4gcmVkdWN0aW9uIGNvbnRleHQnKTtcbiAgcmV0dXJuIHRoaXMucmVkLmNvbnZlcnRGcm9tKHRoaXMpO1xufTtcblxuQk4ucHJvdG90eXBlLl9mb3JjZVJlZCA9IGZ1bmN0aW9uIF9mb3JjZVJlZChjdHgpIHtcbiAgdGhpcy5yZWQgPSBjdHg7XG4gIHJldHVybiB0aGlzO1xufTtcblxuQk4ucHJvdG90eXBlLmZvcmNlUmVkID0gZnVuY3Rpb24gZm9yY2VSZWQoY3R4KSB7XG4gIGFzc2VydCghdGhpcy5yZWQsICdBbHJlYWR5IGEgbnVtYmVyIGluIHJlZHVjdGlvbiBjb250ZXh0Jyk7XG4gIHJldHVybiB0aGlzLl9mb3JjZVJlZChjdHgpO1xufTtcblxuQk4ucHJvdG90eXBlLnJlZEFkZCA9IGZ1bmN0aW9uIHJlZEFkZChudW0pIHtcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkQWRkIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xuICByZXR1cm4gdGhpcy5yZWQuYWRkKHRoaXMsIG51bSk7XG59O1xuXG5CTi5wcm90b3R5cGUucmVkSUFkZCA9IGZ1bmN0aW9uIHJlZElBZGQobnVtKSB7XG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZElBZGQgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XG4gIHJldHVybiB0aGlzLnJlZC5pYWRkKHRoaXMsIG51bSk7XG59O1xuXG5CTi5wcm90b3R5cGUucmVkU3ViID0gZnVuY3Rpb24gcmVkU3ViKG51bSkge1xuICBhc3NlcnQodGhpcy5yZWQsICdyZWRTdWIgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XG4gIHJldHVybiB0aGlzLnJlZC5zdWIodGhpcywgbnVtKTtcbn07XG5cbkJOLnByb3RvdHlwZS5yZWRJU3ViID0gZnVuY3Rpb24gcmVkSVN1YihudW0pIHtcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkSVN1YiB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcbiAgcmV0dXJuIHRoaXMucmVkLmlzdWIodGhpcywgbnVtKTtcbn07XG5cbkJOLnByb3RvdHlwZS5yZWRTaGwgPSBmdW5jdGlvbiByZWRTaGwobnVtKSB7XG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZFNobCB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcbiAgcmV0dXJuIHRoaXMucmVkLnNobCh0aGlzLCBudW0pO1xufTtcblxuQk4ucHJvdG90eXBlLnJlZE11bCA9IGZ1bmN0aW9uIHJlZE11bChudW0pIHtcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkTXVsIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xuICB0aGlzLnJlZC5fdmVyaWZ5Mih0aGlzLCBudW0pO1xuICByZXR1cm4gdGhpcy5yZWQubXVsKHRoaXMsIG51bSk7XG59O1xuXG5CTi5wcm90b3R5cGUucmVkSU11bCA9IGZ1bmN0aW9uIHJlZElNdWwobnVtKSB7XG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZE11bCB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcbiAgdGhpcy5yZWQuX3ZlcmlmeTIodGhpcywgbnVtKTtcbiAgcmV0dXJuIHRoaXMucmVkLmltdWwodGhpcywgbnVtKTtcbn07XG5cbkJOLnByb3RvdHlwZS5yZWRTcXIgPSBmdW5jdGlvbiByZWRTcXIoKSB7XG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZFNxciB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcbiAgdGhpcy5yZWQuX3ZlcmlmeTEodGhpcyk7XG4gIHJldHVybiB0aGlzLnJlZC5zcXIodGhpcyk7XG59O1xuXG5CTi5wcm90b3R5cGUucmVkSVNxciA9IGZ1bmN0aW9uIHJlZElTcXIoKSB7XG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZElTcXIgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XG4gIHRoaXMucmVkLl92ZXJpZnkxKHRoaXMpO1xuICByZXR1cm4gdGhpcy5yZWQuaXNxcih0aGlzKTtcbn07XG5cbi8vIFNxdWFyZSByb290IG92ZXIgcFxuQk4ucHJvdG90eXBlLnJlZFNxcnQgPSBmdW5jdGlvbiByZWRTcXJ0KCkge1xuICBhc3NlcnQodGhpcy5yZWQsICdyZWRTcXJ0IHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xuICB0aGlzLnJlZC5fdmVyaWZ5MSh0aGlzKTtcbiAgcmV0dXJuIHRoaXMucmVkLnNxcnQodGhpcyk7XG59O1xuXG5CTi5wcm90b3R5cGUucmVkSW52bSA9IGZ1bmN0aW9uIHJlZEludm0oKSB7XG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZEludm0gd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XG4gIHRoaXMucmVkLl92ZXJpZnkxKHRoaXMpO1xuICByZXR1cm4gdGhpcy5yZWQuaW52bSh0aGlzKTtcbn07XG5cbi8vIFJldHVybiBuZWdhdGl2ZSBjbG9uZSBvZiBgdGhpc2AgJSBgcmVkIG1vZHVsb2BcbkJOLnByb3RvdHlwZS5yZWROZWcgPSBmdW5jdGlvbiByZWROZWcoKSB7XG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZE5lZyB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcbiAgdGhpcy5yZWQuX3ZlcmlmeTEodGhpcyk7XG4gIHJldHVybiB0aGlzLnJlZC5uZWcodGhpcyk7XG59O1xuXG5CTi5wcm90b3R5cGUucmVkUG93ID0gZnVuY3Rpb24gcmVkUG93KG51bSkge1xuICBhc3NlcnQodGhpcy5yZWQgJiYgIW51bS5yZWQsICdyZWRQb3cobm9ybWFsTnVtKScpO1xuICB0aGlzLnJlZC5fdmVyaWZ5MSh0aGlzKTtcbiAgcmV0dXJuIHRoaXMucmVkLnBvdyh0aGlzLCBudW0pO1xufTtcblxuLy8gUHJpbWUgbnVtYmVycyB3aXRoIGVmZmljaWVudCByZWR1Y3Rpb25cbnZhciBwcmltZXMgPSB7XG4gIGsyNTY6IG51bGwsXG4gIHAyMjQ6IG51bGwsXG4gIHAxOTI6IG51bGwsXG4gIHAyNTUxOTogbnVsbFxufTtcblxuLy8gUHNldWRvLU1lcnNlbm5lIHByaW1lXG5mdW5jdGlvbiBNUHJpbWUobmFtZSwgcCkge1xuICAvLyBQID0gMiBeIE4gLSBLXG4gIHRoaXMubmFtZSA9IG5hbWU7XG4gIHRoaXMucCA9IG5ldyBCTihwLCAxNik7XG4gIHRoaXMubiA9IHRoaXMucC5iaXRMZW5ndGgoKTtcbiAgdGhpcy5rID0gbmV3IEJOKDEpLmlzaGxuKHRoaXMubikuaXN1Yih0aGlzLnApO1xuXG4gIHRoaXMudG1wID0gdGhpcy5fdG1wKCk7XG59XG5cbk1QcmltZS5wcm90b3R5cGUuX3RtcCA9IGZ1bmN0aW9uIF90bXAoKSB7XG4gIHZhciB0bXAgPSBuZXcgQk4obnVsbCk7XG4gIHRtcC53b3JkcyA9IG5ldyBBcnJheShNYXRoLmNlaWwodGhpcy5uIC8gMTMpKTtcbiAgcmV0dXJuIHRtcDtcbn07XG5cbk1QcmltZS5wcm90b3R5cGUuaXJlZHVjZSA9IGZ1bmN0aW9uIGlyZWR1Y2UobnVtKSB7XG4gIC8vIEFzc3VtZXMgdGhhdCBgbnVtYCBpcyBsZXNzIHRoYW4gYFBeMmBcbiAgLy8gbnVtID0gSEkgKiAoMiBeIE4gLSBLKSArIEhJICogSyArIExPID0gSEkgKiBLICsgTE8gKG1vZCBQKVxuICB2YXIgciA9IG51bTtcbiAgdmFyIHJsZW47XG5cbiAgZG8ge1xuICAgIHRoaXMuc3BsaXQociwgdGhpcy50bXApO1xuICAgIHIgPSB0aGlzLmltdWxLKHIpO1xuICAgIHIgPSByLmlhZGQodGhpcy50bXApO1xuICAgIHJsZW4gPSByLmJpdExlbmd0aCgpO1xuICB9IHdoaWxlIChybGVuID4gdGhpcy5uKTtcblxuICB2YXIgY21wID0gcmxlbiA8IHRoaXMubiA/IC0xIDogci51Y21wKHRoaXMucCk7XG4gIGlmIChjbXAgPT09IDApIHtcbiAgICByLndvcmRzWzBdID0gMDtcbiAgICByLmxlbmd0aCA9IDE7XG4gIH0gZWxzZSBpZiAoY21wID4gMCkge1xuICAgIHIuaXN1Yih0aGlzLnApO1xuICB9IGVsc2Uge1xuICAgIHIuc3RyaXAoKTtcbiAgfVxuXG4gIHJldHVybiByO1xufTtcblxuTVByaW1lLnByb3RvdHlwZS5zcGxpdCA9IGZ1bmN0aW9uIHNwbGl0KGlucHV0LCBvdXQpIHtcbiAgaW5wdXQuaXNocm4odGhpcy5uLCAwLCBvdXQpO1xufTtcblxuTVByaW1lLnByb3RvdHlwZS5pbXVsSyA9IGZ1bmN0aW9uIGltdWxLKG51bSkge1xuICByZXR1cm4gbnVtLmltdWwodGhpcy5rKTtcbn07XG5cbmZ1bmN0aW9uIEsyNTYoKSB7XG4gIE1QcmltZS5jYWxsKFxuICAgIHRoaXMsXG4gICAgJ2syNTYnLFxuICAgICdmZmZmZmZmZiBmZmZmZmZmZiBmZmZmZmZmZiBmZmZmZmZmZiBmZmZmZmZmZiBmZmZmZmZmZiBmZmZmZmZmZSBmZmZmZmMyZicpO1xufVxuaW5oZXJpdHMoSzI1NiwgTVByaW1lKTtcblxuSzI1Ni5wcm90b3R5cGUuc3BsaXQgPSBmdW5jdGlvbiBzcGxpdChpbnB1dCwgb3V0cHV0KSB7XG4gIC8vIDI1NiA9IDkgKiAyNiArIDIyXG4gIHZhciBtYXNrID0gMHgzZmZmZmY7XG5cbiAgdmFyIG91dExlbiA9IE1hdGgubWluKGlucHV0Lmxlbmd0aCwgOSk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb3V0TGVuOyBpKyspXG4gICAgb3V0cHV0LndvcmRzW2ldID0gaW5wdXQud29yZHNbaV07XG4gIG91dHB1dC5sZW5ndGggPSBvdXRMZW47XG5cbiAgaWYgKGlucHV0Lmxlbmd0aCA8PSA5KSB7XG4gICAgaW5wdXQud29yZHNbMF0gPSAwO1xuICAgIGlucHV0Lmxlbmd0aCA9IDE7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gU2hpZnQgYnkgOSBsaW1ic1xuICB2YXIgcHJldiA9IGlucHV0LndvcmRzWzldO1xuICBvdXRwdXQud29yZHNbb3V0cHV0Lmxlbmd0aCsrXSA9IHByZXYgJiBtYXNrO1xuXG4gIGZvciAodmFyIGkgPSAxMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIG5leHQgPSBpbnB1dC53b3Jkc1tpXTtcbiAgICBpbnB1dC53b3Jkc1tpIC0gMTBdID0gKChuZXh0ICYgbWFzaykgPDwgNCkgfCAocHJldiA+Pj4gMjIpO1xuICAgIHByZXYgPSBuZXh0O1xuICB9XG4gIGlucHV0LndvcmRzW2kgLSAxMF0gPSBwcmV2ID4+PiAyMjtcbiAgaW5wdXQubGVuZ3RoIC09IDk7XG59O1xuXG5LMjU2LnByb3RvdHlwZS5pbXVsSyA9IGZ1bmN0aW9uIGltdWxLKG51bSkge1xuICAvLyBLID0gMHgxMDAwMDAzZDEgPSBbIDB4NDAsIDB4M2QxIF1cbiAgbnVtLndvcmRzW251bS5sZW5ndGhdID0gMDtcbiAgbnVtLndvcmRzW251bS5sZW5ndGggKyAxXSA9IDA7XG4gIG51bS5sZW5ndGggKz0gMjtcblxuICAvLyBib3VuZGVkIGF0OiAweDQwICogMHgzZmZmZmZmICsgMHgzZDAgPSAweDEwMDAwMDM5MFxuICB2YXIgaGk7XG4gIHZhciBsbyA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHcgPSBudW0ud29yZHNbaV07XG4gICAgaGkgPSB3ICogMHg0MDtcbiAgICBsbyArPSB3ICogMHgzZDE7XG4gICAgaGkgKz0gKGxvIC8gMHg0MDAwMDAwKSB8IDA7XG4gICAgbG8gJj0gMHgzZmZmZmZmO1xuXG4gICAgbnVtLndvcmRzW2ldID0gbG87XG5cbiAgICBsbyA9IGhpO1xuICB9XG5cbiAgLy8gRmFzdCBsZW5ndGggcmVkdWN0aW9uXG4gIGlmIChudW0ud29yZHNbbnVtLmxlbmd0aCAtIDFdID09PSAwKSB7XG4gICAgbnVtLmxlbmd0aC0tO1xuICAgIGlmIChudW0ud29yZHNbbnVtLmxlbmd0aCAtIDFdID09PSAwKVxuICAgICAgbnVtLmxlbmd0aC0tO1xuICB9XG4gIHJldHVybiBudW07XG59O1xuXG5mdW5jdGlvbiBQMjI0KCkge1xuICBNUHJpbWUuY2FsbChcbiAgICB0aGlzLFxuICAgICdwMjI0JyxcbiAgICAnZmZmZmZmZmYgZmZmZmZmZmYgZmZmZmZmZmYgZmZmZmZmZmYgMDAwMDAwMDAgMDAwMDAwMDAgMDAwMDAwMDEnKTtcbn1cbmluaGVyaXRzKFAyMjQsIE1QcmltZSk7XG5cbmZ1bmN0aW9uIFAxOTIoKSB7XG4gIE1QcmltZS5jYWxsKFxuICAgIHRoaXMsXG4gICAgJ3AxOTInLFxuICAgICdmZmZmZmZmZiBmZmZmZmZmZiBmZmZmZmZmZiBmZmZmZmZmZSBmZmZmZmZmZiBmZmZmZmZmZicpO1xufVxuaW5oZXJpdHMoUDE5MiwgTVByaW1lKTtcblxuZnVuY3Rpb24gUDI1NTE5KCkge1xuICAvLyAyIF4gMjU1IC0gMTlcbiAgTVByaW1lLmNhbGwoXG4gICAgdGhpcyxcbiAgICAnMjU1MTknLFxuICAgICc3ZmZmZmZmZmZmZmZmZmZmIGZmZmZmZmZmZmZmZmZmZmYgZmZmZmZmZmZmZmZmZmZmZiBmZmZmZmZmZmZmZmZmZmVkJyk7XG59XG5pbmhlcml0cyhQMjU1MTksIE1QcmltZSk7XG5cblAyNTUxOS5wcm90b3R5cGUuaW11bEsgPSBmdW5jdGlvbiBpbXVsSyhudW0pIHtcbiAgLy8gSyA9IDB4MTNcbiAgdmFyIGNhcnJ5ID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0ubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaGkgPSBudW0ud29yZHNbaV0gKiAweDEzICsgY2Fycnk7XG4gICAgdmFyIGxvID0gaGkgJiAweDNmZmZmZmY7XG4gICAgaGkgPj4+PSAyNjtcblxuICAgIG51bS53b3Jkc1tpXSA9IGxvO1xuICAgIGNhcnJ5ID0gaGk7XG4gIH1cbiAgaWYgKGNhcnJ5ICE9PSAwKVxuICAgIG51bS53b3Jkc1tudW0ubGVuZ3RoKytdID0gY2Fycnk7XG4gIHJldHVybiBudW07XG59O1xuXG4vLyBFeHBvcnRlZCBtb3N0bHkgZm9yIHRlc3RpbmcgcHVycG9zZXMsIHVzZSBwbGFpbiBuYW1lIGluc3RlYWRcbkJOLl9wcmltZSA9IGZ1bmN0aW9uIHByaW1lKG5hbWUpIHtcbiAgLy8gQ2FjaGVkIHZlcnNpb24gb2YgcHJpbWVcbiAgaWYgKHByaW1lc1tuYW1lXSlcbiAgICByZXR1cm4gcHJpbWVzW25hbWVdO1xuXG4gIHZhciBwcmltZTtcbiAgaWYgKG5hbWUgPT09ICdrMjU2JylcbiAgICBwcmltZSA9IG5ldyBLMjU2KCk7XG4gIGVsc2UgaWYgKG5hbWUgPT09ICdwMjI0JylcbiAgICBwcmltZSA9IG5ldyBQMjI0KCk7XG4gIGVsc2UgaWYgKG5hbWUgPT09ICdwMTkyJylcbiAgICBwcmltZSA9IG5ldyBQMTkyKCk7XG4gIGVsc2UgaWYgKG5hbWUgPT09ICdwMjU1MTknKVxuICAgIHByaW1lID0gbmV3IFAyNTUxOSgpO1xuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHByaW1lICcgKyBuYW1lKTtcbiAgcHJpbWVzW25hbWVdID0gcHJpbWU7XG5cbiAgcmV0dXJuIHByaW1lO1xufTtcblxuLy9cbi8vIEJhc2UgcmVkdWN0aW9uIGVuZ2luZVxuLy9cbmZ1bmN0aW9uIFJlZChtKSB7XG4gIGlmICh0eXBlb2YgbSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIgcHJpbWUgPSBCTi5fcHJpbWUobSk7XG4gICAgdGhpcy5tID0gcHJpbWUucDtcbiAgICB0aGlzLnByaW1lID0gcHJpbWU7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5tID0gbTtcbiAgICB0aGlzLnByaW1lID0gbnVsbDtcbiAgfVxufVxuXG5SZWQucHJvdG90eXBlLl92ZXJpZnkxID0gZnVuY3Rpb24gX3ZlcmlmeTEoYSkge1xuICBhc3NlcnQoIWEuc2lnbiwgJ3JlZCB3b3JrcyBvbmx5IHdpdGggcG9zaXRpdmVzJyk7XG4gIGFzc2VydChhLnJlZCwgJ3JlZCB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcbn07XG5cblJlZC5wcm90b3R5cGUuX3ZlcmlmeTIgPSBmdW5jdGlvbiBfdmVyaWZ5MihhLCBiKSB7XG4gIGFzc2VydCghYS5zaWduICYmICFiLnNpZ24sICdyZWQgd29ya3Mgb25seSB3aXRoIHBvc2l0aXZlcycpO1xuICBhc3NlcnQoYS5yZWQgJiYgYS5yZWQgPT09IGIucmVkLFxuICAgICAgICAgJ3JlZCB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcbn07XG5cblJlZC5wcm90b3R5cGUuaW1vZCA9IGZ1bmN0aW9uIGltb2QoYSkge1xuICBpZiAodGhpcy5wcmltZSlcbiAgICByZXR1cm4gdGhpcy5wcmltZS5pcmVkdWNlKGEpLl9mb3JjZVJlZCh0aGlzKTtcbiAgcmV0dXJuIGEubW9kKHRoaXMubSkuX2ZvcmNlUmVkKHRoaXMpO1xufTtcblxuUmVkLnByb3RvdHlwZS5uZWcgPSBmdW5jdGlvbiBuZWcoYSkge1xuICB2YXIgciA9IGEuY2xvbmUoKTtcbiAgci5zaWduID0gIXIuc2lnbjtcbiAgcmV0dXJuIHIuaWFkZCh0aGlzLm0pLl9mb3JjZVJlZCh0aGlzKTtcbn07XG5cblJlZC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkKGEsIGIpIHtcbiAgdGhpcy5fdmVyaWZ5MihhLCBiKTtcblxuICB2YXIgcmVzID0gYS5hZGQoYik7XG4gIGlmIChyZXMuY21wKHRoaXMubSkgPj0gMClcbiAgICByZXMuaXN1Yih0aGlzLm0pO1xuICByZXR1cm4gcmVzLl9mb3JjZVJlZCh0aGlzKTtcbn07XG5cblJlZC5wcm90b3R5cGUuaWFkZCA9IGZ1bmN0aW9uIGlhZGQoYSwgYikge1xuICB0aGlzLl92ZXJpZnkyKGEsIGIpO1xuXG4gIHZhciByZXMgPSBhLmlhZGQoYik7XG4gIGlmIChyZXMuY21wKHRoaXMubSkgPj0gMClcbiAgICByZXMuaXN1Yih0aGlzLm0pO1xuICByZXR1cm4gcmVzO1xufTtcblxuUmVkLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiBzdWIoYSwgYikge1xuICB0aGlzLl92ZXJpZnkyKGEsIGIpO1xuXG4gIHZhciByZXMgPSBhLnN1YihiKTtcbiAgaWYgKHJlcy5jbXBuKDApIDwgMClcbiAgICByZXMuaWFkZCh0aGlzLm0pO1xuICByZXR1cm4gcmVzLl9mb3JjZVJlZCh0aGlzKTtcbn07XG5cblJlZC5wcm90b3R5cGUuaXN1YiA9IGZ1bmN0aW9uIGlzdWIoYSwgYikge1xuICB0aGlzLl92ZXJpZnkyKGEsIGIpO1xuXG4gIHZhciByZXMgPSBhLmlzdWIoYik7XG4gIGlmIChyZXMuY21wbigwKSA8IDApXG4gICAgcmVzLmlhZGQodGhpcy5tKTtcbiAgcmV0dXJuIHJlcztcbn07XG5cblJlZC5wcm90b3R5cGUuc2hsID0gZnVuY3Rpb24gc2hsKGEsIG51bSkge1xuICB0aGlzLl92ZXJpZnkxKGEpO1xuICByZXR1cm4gdGhpcy5pbW9kKGEuc2hsbihudW0pKTtcbn07XG5cblJlZC5wcm90b3R5cGUuaW11bCA9IGZ1bmN0aW9uIGltdWwoYSwgYikge1xuICB0aGlzLl92ZXJpZnkyKGEsIGIpO1xuICByZXR1cm4gdGhpcy5pbW9kKGEuaW11bChiKSk7XG59O1xuXG5SZWQucHJvdG90eXBlLm11bCA9IGZ1bmN0aW9uIG11bChhLCBiKSB7XG4gIHRoaXMuX3ZlcmlmeTIoYSwgYik7XG4gIHJldHVybiB0aGlzLmltb2QoYS5tdWwoYikpO1xufTtcblxuUmVkLnByb3RvdHlwZS5pc3FyID0gZnVuY3Rpb24gaXNxcihhKSB7XG4gIHJldHVybiB0aGlzLmltdWwoYSwgYSk7XG59O1xuXG5SZWQucHJvdG90eXBlLnNxciA9IGZ1bmN0aW9uIHNxcihhKSB7XG4gIHJldHVybiB0aGlzLm11bChhLCBhKTtcbn07XG5cblJlZC5wcm90b3R5cGUuc3FydCA9IGZ1bmN0aW9uIHNxcnQoYSkge1xuICBpZiAoYS5jbXBuKDApID09PSAwKVxuICAgIHJldHVybiBhLmNsb25lKCk7XG5cbiAgdmFyIG1vZDMgPSB0aGlzLm0uYW5kbG4oMyk7XG4gIGFzc2VydChtb2QzICUgMiA9PT0gMSk7XG5cbiAgLy8gRmFzdCBjYXNlXG4gIGlmIChtb2QzID09PSAzKSB7XG4gICAgdmFyIHBvdyA9IHRoaXMubS5hZGQobmV3IEJOKDEpKS5pc2hybigyKTtcbiAgICB2YXIgciA9IHRoaXMucG93KGEsIHBvdyk7XG4gICAgcmV0dXJuIHI7XG4gIH1cblxuICAvLyBUb25lbGxpLVNoYW5rcyBhbGdvcml0aG0gKFRvdGFsbHkgdW5vcHRpbWl6ZWQgYW5kIHNsb3cpXG4gIC8vXG4gIC8vIEZpbmQgUSBhbmQgUywgdGhhdCBRICogMiBeIFMgPSAoUCAtIDEpXG4gIHZhciBxID0gdGhpcy5tLnN1Ym4oMSk7XG4gIHZhciBzID0gMDtcbiAgd2hpbGUgKHEuY21wbigwKSAhPT0gMCAmJiBxLmFuZGxuKDEpID09PSAwKSB7XG4gICAgcysrO1xuICAgIHEuaXNocm4oMSk7XG4gIH1cbiAgYXNzZXJ0KHEuY21wbigwKSAhPT0gMCk7XG5cbiAgdmFyIG9uZSA9IG5ldyBCTigxKS50b1JlZCh0aGlzKTtcbiAgdmFyIG5PbmUgPSBvbmUucmVkTmVnKCk7XG5cbiAgLy8gRmluZCBxdWFkcmF0aWMgbm9uLXJlc2lkdWVcbiAgLy8gTk9URTogTWF4IGlzIHN1Y2ggYmVjYXVzZSBvZiBnZW5lcmFsaXplZCBSaWVtYW5uIGh5cG90aGVzaXMuXG4gIHZhciBscG93ID0gdGhpcy5tLnN1Ym4oMSkuaXNocm4oMSk7XG4gIHZhciB6ID0gdGhpcy5tLmJpdExlbmd0aCgpO1xuICB6ID0gbmV3IEJOKDIgKiB6ICogeikudG9SZWQodGhpcyk7XG4gIHdoaWxlICh0aGlzLnBvdyh6LCBscG93KS5jbXAobk9uZSkgIT09IDApXG4gICAgei5yZWRJQWRkKG5PbmUpO1xuXG4gIHZhciBjID0gdGhpcy5wb3coeiwgcSk7XG4gIHZhciByID0gdGhpcy5wb3coYSwgcS5hZGRuKDEpLmlzaHJuKDEpKTtcbiAgdmFyIHQgPSB0aGlzLnBvdyhhLCBxKTtcbiAgdmFyIG0gPSBzO1xuICB3aGlsZSAodC5jbXAob25lKSAhPT0gMCkge1xuICAgIHZhciB0bXAgPSB0O1xuICAgIGZvciAodmFyIGkgPSAwOyB0bXAuY21wKG9uZSkgIT09IDA7IGkrKylcbiAgICAgIHRtcCA9IHRtcC5yZWRTcXIoKTtcbiAgICBhc3NlcnQoaSA8IG0pO1xuICAgIHZhciBiID0gdGhpcy5wb3coYywgbmV3IEJOKDEpLmlzaGxuKG0gLSBpIC0gMSkpO1xuXG4gICAgciA9IHIucmVkTXVsKGIpO1xuICAgIGMgPSBiLnJlZFNxcigpO1xuICAgIHQgPSB0LnJlZE11bChjKTtcbiAgICBtID0gaTtcbiAgfVxuXG4gIHJldHVybiByO1xufTtcblxuUmVkLnByb3RvdHlwZS5pbnZtID0gZnVuY3Rpb24gaW52bShhKSB7XG4gIHZhciBpbnYgPSBhLl9pbnZtcCh0aGlzLm0pO1xuICBpZiAoaW52LnNpZ24pIHtcbiAgICBpbnYuc2lnbiA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzLmltb2QoaW52KS5yZWROZWcoKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdGhpcy5pbW9kKGludik7XG4gIH1cbn07XG5cblJlZC5wcm90b3R5cGUucG93ID0gZnVuY3Rpb24gcG93KGEsIG51bSkge1xuICB2YXIgdyA9IFtdO1xuXG4gIGlmIChudW0uY21wbigwKSA9PT0gMClcbiAgICByZXR1cm4gbmV3IEJOKDEpO1xuXG4gIHZhciBxID0gbnVtLmNsb25lKCk7XG5cbiAgd2hpbGUgKHEuY21wbigwKSAhPT0gMCkge1xuICAgIHcucHVzaChxLmFuZGxuKDEpKTtcbiAgICBxLmlzaHJuKDEpO1xuICB9XG5cbiAgLy8gU2tpcCBsZWFkaW5nIHplcm9lc1xuICB2YXIgcmVzID0gYTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB3Lmxlbmd0aDsgaSsrLCByZXMgPSB0aGlzLnNxcihyZXMpKVxuICAgIGlmICh3W2ldICE9PSAwKVxuICAgICAgYnJlYWs7XG5cbiAgaWYgKCsraSA8IHcubGVuZ3RoKSB7XG4gICAgZm9yICh2YXIgcSA9IHRoaXMuc3FyKHJlcyk7IGkgPCB3Lmxlbmd0aDsgaSsrLCBxID0gdGhpcy5zcXIocSkpIHtcbiAgICAgIGlmICh3W2ldID09PSAwKVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIHJlcyA9IHRoaXMubXVsKHJlcywgcSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcztcbn07XG5cblJlZC5wcm90b3R5cGUuY29udmVydFRvID0gZnVuY3Rpb24gY29udmVydFRvKG51bSkge1xuICB2YXIgciA9IG51bS5tb2QodGhpcy5tKTtcbiAgaWYgKHIgPT09IG51bSlcbiAgICByZXR1cm4gci5jbG9uZSgpO1xuICBlbHNlXG4gICAgcmV0dXJuIHI7XG59O1xuXG5SZWQucHJvdG90eXBlLmNvbnZlcnRGcm9tID0gZnVuY3Rpb24gY29udmVydEZyb20obnVtKSB7XG4gIHZhciByZXMgPSBudW0uY2xvbmUoKTtcbiAgcmVzLnJlZCA9IG51bGw7XG4gIHJldHVybiByZXM7XG59O1xuXG4vL1xuLy8gTW9udGdvbWVyeSBtZXRob2QgZW5naW5lXG4vL1xuXG5CTi5tb250ID0gZnVuY3Rpb24gbW9udChudW0pIHtcbiAgcmV0dXJuIG5ldyBNb250KG51bSk7XG59O1xuXG5mdW5jdGlvbiBNb250KG0pIHtcbiAgUmVkLmNhbGwodGhpcywgbSk7XG5cbiAgdGhpcy5zaGlmdCA9IHRoaXMubS5iaXRMZW5ndGgoKTtcbiAgaWYgKHRoaXMuc2hpZnQgJSAyNiAhPT0gMClcbiAgICB0aGlzLnNoaWZ0ICs9IDI2IC0gKHRoaXMuc2hpZnQgJSAyNik7XG4gIHRoaXMuciA9IG5ldyBCTigxKS5pc2hsbih0aGlzLnNoaWZ0KTtcbiAgdGhpcy5yMiA9IHRoaXMuaW1vZCh0aGlzLnIuc3FyKCkpO1xuICB0aGlzLnJpbnYgPSB0aGlzLnIuX2ludm1wKHRoaXMubSk7XG5cbiAgdGhpcy5taW52ID0gdGhpcy5yaW52Lm11bCh0aGlzLnIpLmlzdWJuKDEpLmRpdih0aGlzLm0pO1xuICB0aGlzLm1pbnYuc2lnbiA9IHRydWU7XG4gIHRoaXMubWludiA9IHRoaXMubWludi5tb2QodGhpcy5yKTtcbn1cbmluaGVyaXRzKE1vbnQsIFJlZCk7XG5cbk1vbnQucHJvdG90eXBlLmNvbnZlcnRUbyA9IGZ1bmN0aW9uIGNvbnZlcnRUbyhudW0pIHtcbiAgcmV0dXJuIHRoaXMuaW1vZChudW0uc2hsbih0aGlzLnNoaWZ0KSk7XG59O1xuXG5Nb250LnByb3RvdHlwZS5jb252ZXJ0RnJvbSA9IGZ1bmN0aW9uIGNvbnZlcnRGcm9tKG51bSkge1xuICB2YXIgciA9IHRoaXMuaW1vZChudW0ubXVsKHRoaXMucmludikpO1xuICByLnJlZCA9IG51bGw7XG4gIHJldHVybiByO1xufTtcblxuTW9udC5wcm90b3R5cGUuaW11bCA9IGZ1bmN0aW9uIGltdWwoYSwgYikge1xuICBpZiAoYS5jbXBuKDApID09PSAwIHx8IGIuY21wbigwKSA9PT0gMCkge1xuICAgIGEud29yZHNbMF0gPSAwO1xuICAgIGEubGVuZ3RoID0gMTtcbiAgICByZXR1cm4gYTtcbiAgfVxuXG4gIHZhciB0ID0gYS5pbXVsKGIpO1xuICB2YXIgYyA9IHQubWFza24odGhpcy5zaGlmdCkubXVsKHRoaXMubWludikuaW1hc2tuKHRoaXMuc2hpZnQpLm11bCh0aGlzLm0pO1xuICB2YXIgdSA9IHQuaXN1YihjKS5pc2hybih0aGlzLnNoaWZ0KTtcbiAgdmFyIHJlcyA9IHU7XG4gIGlmICh1LmNtcCh0aGlzLm0pID49IDApXG4gICAgcmVzID0gdS5pc3ViKHRoaXMubSk7XG4gIGVsc2UgaWYgKHUuY21wbigwKSA8IDApXG4gICAgcmVzID0gdS5pYWRkKHRoaXMubSk7XG5cbiAgcmV0dXJuIHJlcy5fZm9yY2VSZWQodGhpcyk7XG59O1xuXG5Nb250LnByb3RvdHlwZS5tdWwgPSBmdW5jdGlvbiBtdWwoYSwgYikge1xuICBpZiAoYS5jbXBuKDApID09PSAwIHx8IGIuY21wbigwKSA9PT0gMClcbiAgICByZXR1cm4gbmV3IEJOKDApLl9mb3JjZVJlZCh0aGlzKTtcblxuICB2YXIgdCA9IGEubXVsKGIpO1xuICB2YXIgYyA9IHQubWFza24odGhpcy5zaGlmdCkubXVsKHRoaXMubWludikuaW1hc2tuKHRoaXMuc2hpZnQpLm11bCh0aGlzLm0pO1xuICB2YXIgdSA9IHQuaXN1YihjKS5pc2hybih0aGlzLnNoaWZ0KTtcbiAgdmFyIHJlcyA9IHU7XG4gIGlmICh1LmNtcCh0aGlzLm0pID49IDApXG4gICAgcmVzID0gdS5pc3ViKHRoaXMubSk7XG4gIGVsc2UgaWYgKHUuY21wbigwKSA8IDApXG4gICAgcmVzID0gdS5pYWRkKHRoaXMubSk7XG5cbiAgcmV0dXJuIHJlcy5fZm9yY2VSZWQodGhpcyk7XG59O1xuXG5Nb250LnByb3RvdHlwZS5pbnZtID0gZnVuY3Rpb24gaW52bShhKSB7XG4gIC8vIChBUileLTEgKiBSXjIgPSAoQV4tMSAqIFJeLTEpICogUl4yID0gQV4tMSAqIFJcbiAgdmFyIHJlcyA9IHRoaXMuaW1vZChhLl9pbnZtcCh0aGlzLm0pLm11bCh0aGlzLnIyKSk7XG4gIHJldHVybiByZXMuX2ZvcmNlUmVkKHRoaXMpO1xufTtcblxufSkodHlwZW9mIG1vZHVsZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbW9kdWxlLCB0aGlzKTtcbiIsInZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcblxuZXhwb3J0cy50YWdDbGFzcyA9IHtcbiAgMDogJ3VuaXZlcnNhbCcsXG4gIDE6ICdhcHBsaWNhdGlvbicsXG4gIDI6ICdjb250ZXh0JyxcbiAgMzogJ3ByaXZhdGUnXG59O1xuZXhwb3J0cy50YWdDbGFzc0J5TmFtZSA9IGNvbnN0YW50cy5fcmV2ZXJzZShleHBvcnRzLnRhZ0NsYXNzKTtcblxuZXhwb3J0cy50YWcgPSB7XG4gIDB4MDA6ICdlbmQnLFxuICAweDAxOiAnYm9vbCcsXG4gIDB4MDI6ICdpbnQnLFxuICAweDAzOiAnYml0c3RyJyxcbiAgMHgwNDogJ29jdHN0cicsXG4gIDB4MDU6ICdudWxsXycsXG4gIDB4MDY6ICdvYmppZCcsXG4gIDB4MDc6ICdvYmpEZXNjJyxcbiAgMHgwODogJ2V4dGVybmFsJyxcbiAgMHgwOTogJ3JlYWwnLFxuICAweDBhOiAnZW51bScsXG4gIDB4MGI6ICdlbWJlZCcsXG4gIDB4MGM6ICd1dGY4c3RyJyxcbiAgMHgwZDogJ3JlbGF0aXZlT2lkJyxcbiAgMHgxMDogJ3NlcScsXG4gIDB4MTE6ICdzZXQnLFxuICAweDEyOiAnbnVtc3RyJyxcbiAgMHgxMzogJ3ByaW50c3RyJyxcbiAgMHgxNDogJ3Q2MXN0cicsXG4gIDB4MTU6ICd2aWRlb3N0cicsXG4gIDB4MTY6ICdpYTVzdHInLFxuICAweDE3OiAndXRjdGltZScsXG4gIDB4MTg6ICdnZW50aW1lJyxcbiAgMHgxOTogJ2dyYXBoc3RyJyxcbiAgMHgxYTogJ2lzbzY0NnN0cicsXG4gIDB4MWI6ICdnZW5zdHInLFxuICAweDFjOiAndW5pc3RyJyxcbiAgMHgxZDogJ2NoYXJzdHInLFxuICAweDFlOiAnYm1wc3RyJ1xufTtcbmV4cG9ydHMudGFnQnlOYW1lID0gY29uc3RhbnRzLl9yZXZlcnNlKGV4cG9ydHMudGFnKTtcbiIsInZhciBjb25zdGFudHMgPSBleHBvcnRzO1xuXG4vLyBIZWxwZXJcbmNvbnN0YW50cy5fcmV2ZXJzZSA9IGZ1bmN0aW9uIHJldmVyc2UobWFwKSB7XG4gIHZhciByZXMgPSB7fTtcblxuICBPYmplY3Qua2V5cyhtYXApLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgLy8gQ29udmVydCBrZXkgdG8gaW50ZWdlciBpZiBpdCBpcyBzdHJpbmdpZmllZFxuICAgIGlmICgoa2V5IHwgMCkgPT0ga2V5KVxuICAgICAga2V5ID0ga2V5IHwgMDtcblxuICAgIHZhciB2YWx1ZSA9IG1hcFtrZXldO1xuICAgIHJlc1t2YWx1ZV0gPSBrZXk7XG4gIH0pO1xuXG4gIHJldHVybiByZXM7XG59O1xuXG5jb25zdGFudHMuZGVyID0gcmVxdWlyZSgnLi9kZXInKTtcbiIsInZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ3V0aWwnKS5pbmhlcml0cztcblxudmFyIGFzbjEgPSByZXF1aXJlKCcuLi9hc24xJyk7XG52YXIgYmFzZSA9IGFzbjEuYmFzZTtcbnZhciBiaWdudW0gPSBhc24xLmJpZ251bTtcblxuLy8gSW1wb3J0IERFUiBjb25zdGFudHNcbnZhciBkZXIgPSBhc24xLmNvbnN0YW50cy5kZXI7XG5cbmZ1bmN0aW9uIERFUkRlY29kZXIoZW50aXR5KSB7XG4gIHRoaXMuZW5jID0gJ2Rlcic7XG4gIHRoaXMubmFtZSA9IGVudGl0eS5uYW1lO1xuICB0aGlzLmVudGl0eSA9IGVudGl0eTtcblxuICAvLyBDb25zdHJ1Y3QgYmFzZSB0cmVlXG4gIHRoaXMudHJlZSA9IG5ldyBERVJOb2RlKCk7XG4gIHRoaXMudHJlZS5faW5pdChlbnRpdHkuYm9keSk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBERVJEZWNvZGVyO1xuXG5ERVJEZWNvZGVyLnByb3RvdHlwZS5kZWNvZGUgPSBmdW5jdGlvbiBkZWNvZGUoZGF0YSwgb3B0aW9ucykge1xuICBpZiAoIShkYXRhIGluc3RhbmNlb2YgYmFzZS5EZWNvZGVyQnVmZmVyKSlcbiAgICBkYXRhID0gbmV3IGJhc2UuRGVjb2RlckJ1ZmZlcihkYXRhLCBvcHRpb25zKTtcblxuICByZXR1cm4gdGhpcy50cmVlLl9kZWNvZGUoZGF0YSwgb3B0aW9ucyk7XG59O1xuXG4vLyBUcmVlIG1ldGhvZHNcblxuZnVuY3Rpb24gREVSTm9kZShwYXJlbnQpIHtcbiAgYmFzZS5Ob2RlLmNhbGwodGhpcywgJ2RlcicsIHBhcmVudCk7XG59XG5pbmhlcml0cyhERVJOb2RlLCBiYXNlLk5vZGUpO1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fcGVla1RhZyA9IGZ1bmN0aW9uIHBlZWtUYWcoYnVmZmVyLCB0YWcsIGFueSkge1xuICBpZiAoYnVmZmVyLmlzRW1wdHkoKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIHN0YXRlID0gYnVmZmVyLnNhdmUoKTtcbiAgdmFyIGRlY29kZWRUYWcgPSBkZXJEZWNvZGVUYWcoYnVmZmVyLCAnRmFpbGVkIHRvIHBlZWsgdGFnOiBcIicgKyB0YWcgKyAnXCInKTtcbiAgaWYgKGJ1ZmZlci5pc0Vycm9yKGRlY29kZWRUYWcpKVxuICAgIHJldHVybiBkZWNvZGVkVGFnO1xuXG4gIGJ1ZmZlci5yZXN0b3JlKHN0YXRlKTtcblxuICByZXR1cm4gZGVjb2RlZFRhZy50YWcgPT09IHRhZyB8fCBkZWNvZGVkVGFnLnRhZ1N0ciA9PT0gdGFnIHx8IGFueTtcbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl9kZWNvZGVUYWcgPSBmdW5jdGlvbiBkZWNvZGVUYWcoYnVmZmVyLCB0YWcsIGFueSkge1xuICB2YXIgZGVjb2RlZFRhZyA9IGRlckRlY29kZVRhZyhidWZmZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gZGVjb2RlIHRhZyBvZiBcIicgKyB0YWcgKyAnXCInKTtcbiAgaWYgKGJ1ZmZlci5pc0Vycm9yKGRlY29kZWRUYWcpKVxuICAgIHJldHVybiBkZWNvZGVkVGFnO1xuXG4gIHZhciBsZW4gPSBkZXJEZWNvZGVMZW4oYnVmZmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgIGRlY29kZWRUYWcucHJpbWl0aXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gZ2V0IGxlbmd0aCBvZiBcIicgKyB0YWcgKyAnXCInKTtcblxuICAvLyBGYWlsdXJlXG4gIGlmIChidWZmZXIuaXNFcnJvcihsZW4pKVxuICAgIHJldHVybiBsZW47XG5cbiAgaWYgKCFhbnkgJiZcbiAgICAgIGRlY29kZWRUYWcudGFnICE9PSB0YWcgJiZcbiAgICAgIGRlY29kZWRUYWcudGFnU3RyICE9PSB0YWcgJiZcbiAgICAgIGRlY29kZWRUYWcudGFnU3RyICsgJ29mJyAhPT0gdGFnKSB7XG4gICAgcmV0dXJuIGJ1ZmZlci5lcnJvcignRmFpbGVkIHRvIG1hdGNoIHRhZzogXCInICsgdGFnICsgJ1wiJyk7XG4gIH1cblxuICBpZiAoZGVjb2RlZFRhZy5wcmltaXRpdmUgfHwgbGVuICE9PSBudWxsKVxuICAgIHJldHVybiBidWZmZXIuc2tpcChsZW4sICdGYWlsZWQgdG8gbWF0Y2ggYm9keSBvZjogXCInICsgdGFnICsgJ1wiJyk7XG5cbiAgLy8gSW5kZWZpbml0ZSBsZW5ndGguLi4gZmluZCBFTkQgdGFnXG4gIHZhciBzdGF0ZSA9IGJ1ZmZlci5zYXZlKCk7XG4gIHZhciByZXMgPSB0aGlzLl9za2lwVW50aWxFbmQoXG4gICAgICBidWZmZXIsXG4gICAgICAnRmFpbGVkIHRvIHNraXAgaW5kZWZpbml0ZSBsZW5ndGggYm9keTogXCInICsgdGhpcy50YWcgKyAnXCInKTtcbiAgaWYgKGJ1ZmZlci5pc0Vycm9yKHJlcykpXG4gICAgcmV0dXJuIHJlcztcblxuICBsZW4gPSBidWZmZXIub2Zmc2V0IC0gc3RhdGUub2Zmc2V0O1xuICBidWZmZXIucmVzdG9yZShzdGF0ZSk7XG4gIHJldHVybiBidWZmZXIuc2tpcChsZW4sICdGYWlsZWQgdG8gbWF0Y2ggYm9keSBvZjogXCInICsgdGFnICsgJ1wiJyk7XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fc2tpcFVudGlsRW5kID0gZnVuY3Rpb24gc2tpcFVudGlsRW5kKGJ1ZmZlciwgZmFpbCkge1xuICB3aGlsZSAodHJ1ZSkge1xuICAgIHZhciB0YWcgPSBkZXJEZWNvZGVUYWcoYnVmZmVyLCBmYWlsKTtcbiAgICBpZiAoYnVmZmVyLmlzRXJyb3IodGFnKSlcbiAgICAgIHJldHVybiB0YWc7XG4gICAgdmFyIGxlbiA9IGRlckRlY29kZUxlbihidWZmZXIsIHRhZy5wcmltaXRpdmUsIGZhaWwpO1xuICAgIGlmIChidWZmZXIuaXNFcnJvcihsZW4pKVxuICAgICAgcmV0dXJuIGxlbjtcblxuICAgIHZhciByZXM7XG4gICAgaWYgKHRhZy5wcmltaXRpdmUgfHwgbGVuICE9PSBudWxsKVxuICAgICAgcmVzID0gYnVmZmVyLnNraXAobGVuKVxuICAgIGVsc2VcbiAgICAgIHJlcyA9IHRoaXMuX3NraXBVbnRpbEVuZChidWZmZXIsIGZhaWwpO1xuXG4gICAgLy8gRmFpbHVyZVxuICAgIGlmIChidWZmZXIuaXNFcnJvcihyZXMpKVxuICAgICAgcmV0dXJuIHJlcztcblxuICAgIGlmICh0YWcudGFnU3RyID09PSAnZW5kJylcbiAgICAgIGJyZWFrO1xuICB9XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fZGVjb2RlTGlzdCA9IGZ1bmN0aW9uIGRlY29kZUxpc3QoYnVmZmVyLCB0YWcsIGRlY29kZXIpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB3aGlsZSAoIWJ1ZmZlci5pc0VtcHR5KCkpIHtcbiAgICB2YXIgcG9zc2libGVFbmQgPSB0aGlzLl9wZWVrVGFnKGJ1ZmZlciwgJ2VuZCcpO1xuICAgIGlmIChidWZmZXIuaXNFcnJvcihwb3NzaWJsZUVuZCkpXG4gICAgICByZXR1cm4gcG9zc2libGVFbmQ7XG5cbiAgICB2YXIgcmVzID0gZGVjb2Rlci5kZWNvZGUoYnVmZmVyLCAnZGVyJyk7XG4gICAgaWYgKGJ1ZmZlci5pc0Vycm9yKHJlcykgJiYgcG9zc2libGVFbmQpXG4gICAgICBicmVhaztcbiAgICByZXN1bHQucHVzaChyZXMpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fZGVjb2RlU3RyID0gZnVuY3Rpb24gZGVjb2RlU3RyKGJ1ZmZlciwgdGFnKSB7XG4gIGlmICh0YWcgPT09ICdvY3RzdHInKSB7XG4gICAgcmV0dXJuIGJ1ZmZlci5yYXcoKTtcbiAgfSBlbHNlIGlmICh0YWcgPT09ICdiaXRzdHInKSB7XG4gICAgdmFyIHVudXNlZCA9IGJ1ZmZlci5yZWFkVUludDgoKTtcbiAgICBpZiAoYnVmZmVyLmlzRXJyb3IodW51c2VkKSlcbiAgICAgIHJldHVybiB1bnVzZWQ7XG5cbiAgICByZXR1cm4geyB1bnVzZWQ6IHVudXNlZCwgZGF0YTogYnVmZmVyLnJhdygpIH07XG4gIH0gZWxzZSBpZiAodGFnID09PSAnaWE1c3RyJyB8fCB0YWcgPT09ICd1dGY4c3RyJykge1xuICAgIHJldHVybiBidWZmZXIucmF3KCkudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdGhpcy5lcnJvcignRGVjb2Rpbmcgb2Ygc3RyaW5nIHR5cGU6ICcgKyB0YWcgKyAnIHVuc3VwcG9ydGVkJyk7XG4gIH1cbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl9kZWNvZGVPYmppZCA9IGZ1bmN0aW9uIGRlY29kZU9iamlkKGJ1ZmZlciwgdmFsdWVzLCByZWxhdGl2ZSkge1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcbiAgdmFyIGlkZW50ID0gMDtcbiAgd2hpbGUgKCFidWZmZXIuaXNFbXB0eSgpKSB7XG4gICAgdmFyIHN1YmlkZW50ID0gYnVmZmVyLnJlYWRVSW50OCgpO1xuICAgIGlkZW50IDw8PSA3O1xuICAgIGlkZW50IHw9IHN1YmlkZW50ICYgMHg3ZjtcbiAgICBpZiAoKHN1YmlkZW50ICYgMHg4MCkgPT09IDApIHtcbiAgICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnQpO1xuICAgICAgaWRlbnQgPSAwO1xuICAgIH1cbiAgfVxuICBpZiAoc3ViaWRlbnQgJiAweDgwKVxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnQpO1xuXG4gIHZhciBmaXJzdCA9IChpZGVudGlmaWVyc1swXSAvIDQwKSB8IDA7XG4gIHZhciBzZWNvbmQgPSBpZGVudGlmaWVyc1swXSAlIDQwO1xuXG4gIGlmIChyZWxhdGl2ZSlcbiAgICByZXN1bHQgPSBpZGVudGlmaWVycztcbiAgZWxzZVxuICAgIHJlc3VsdCA9IFtmaXJzdCwgc2Vjb25kXS5jb25jYXQoaWRlbnRpZmllcnMuc2xpY2UoMSkpO1xuXG4gIGlmICh2YWx1ZXMpXG4gICAgcmVzdWx0ID0gdmFsdWVzW3Jlc3VsdC5qb2luKCcgJyldO1xuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fZGVjb2RlVGltZSA9IGZ1bmN0aW9uIGRlY29kZVRpbWUoYnVmZmVyLCB0YWcpIHtcbiAgdmFyIHN0ciA9IGJ1ZmZlci5yYXcoKS50b1N0cmluZygpO1xuICBpZiAodGFnID09PSAnZ2VudGltZScpIHtcbiAgICB2YXIgeWVhciA9IHN0ci5zbGljZSgwLCA0KSB8IDA7XG4gICAgdmFyIG1vbiA9IHN0ci5zbGljZSg0LCA2KSB8IDA7XG4gICAgdmFyIGRheSA9IHN0ci5zbGljZSg2LCA4KSB8IDA7XG4gICAgdmFyIGhvdXIgPSBzdHIuc2xpY2UoOCwgMTApIHwgMDtcbiAgICB2YXIgbWluID0gc3RyLnNsaWNlKDEwLCAxMikgfCAwO1xuICAgIHZhciBzZWMgPSBzdHIuc2xpY2UoMTIsIDE0KSB8IDA7XG4gIH0gZWxzZSBpZiAodGFnID09PSAndXRjdGltZScpIHtcbiAgICB2YXIgeWVhciA9IHN0ci5zbGljZSgwLCAyKSB8IDA7XG4gICAgdmFyIG1vbiA9IHN0ci5zbGljZSgyLCA0KSB8IDA7XG4gICAgdmFyIGRheSA9IHN0ci5zbGljZSg0LCA2KSB8IDA7XG4gICAgdmFyIGhvdXIgPSBzdHIuc2xpY2UoNiwgOCkgfCAwO1xuICAgIHZhciBtaW4gPSBzdHIuc2xpY2UoOCwgMTApIHwgMDtcbiAgICB2YXIgc2VjID0gc3RyLnNsaWNlKDEwLCAxMikgfCAwO1xuICAgIGlmICh5ZWFyIDwgNzApXG4gICAgICB5ZWFyID0gMjAwMCArIHllYXI7XG4gICAgZWxzZVxuICAgICAgeWVhciA9IDE5MDAgKyB5ZWFyO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0aGlzLmVycm9yKCdEZWNvZGluZyAnICsgdGFnICsgJyB0aW1lIGlzIG5vdCBzdXBwb3J0ZWQgeWV0Jyk7XG4gIH1cblxuICByZXR1cm4gRGF0ZS5VVEMoeWVhciwgbW9uIC0gMSwgZGF5LCBob3VyLCBtaW4sIHNlYywgMCk7XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fZGVjb2RlTnVsbCA9IGZ1bmN0aW9uIGRlY29kZU51bGwoYnVmZmVyKSB7XG4gIHJldHVybiBudWxsO1xufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX2RlY29kZUJvb2wgPSBmdW5jdGlvbiBkZWNvZGVCb29sKGJ1ZmZlcikge1xuICB2YXIgcmVzID0gYnVmZmVyLnJlYWRVSW50OCgpO1xuICBpZiAoYnVmZmVyLmlzRXJyb3IocmVzKSlcbiAgICByZXR1cm4gcmVzO1xuICBlbHNlXG4gICAgcmV0dXJuIHJlcyAhPT0gMDtcbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl9kZWNvZGVJbnQgPSBmdW5jdGlvbiBkZWNvZGVJbnQoYnVmZmVyLCB2YWx1ZXMpIHtcbiAgLy8gQmlnaW50LCByZXR1cm4gYXMgaXQgaXMgKGFzc3VtZSBiaWcgZW5kaWFuKVxuICB2YXIgcmF3ID0gYnVmZmVyLnJhdygpO1xuICB2YXIgcmVzID0gbmV3IGJpZ251bShyYXcpO1xuXG4gIGlmICh2YWx1ZXMpXG4gICAgcmVzID0gdmFsdWVzW3Jlcy50b1N0cmluZygxMCldIHx8IHJlcztcblxuICByZXR1cm4gcmVzO1xufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX3VzZSA9IGZ1bmN0aW9uIHVzZShlbnRpdHksIG9iaikge1xuICBpZiAodHlwZW9mIGVudGl0eSA9PT0gJ2Z1bmN0aW9uJylcbiAgICBlbnRpdHkgPSBlbnRpdHkob2JqKTtcbiAgcmV0dXJuIGVudGl0eS5fZ2V0RGVjb2RlcignZGVyJykudHJlZTtcbn07XG5cbi8vIFV0aWxpdHkgbWV0aG9kc1xuXG5mdW5jdGlvbiBkZXJEZWNvZGVUYWcoYnVmLCBmYWlsKSB7XG4gIHZhciB0YWcgPSBidWYucmVhZFVJbnQ4KGZhaWwpO1xuICBpZiAoYnVmLmlzRXJyb3IodGFnKSlcbiAgICByZXR1cm4gdGFnO1xuXG4gIHZhciBjbHMgPSBkZXIudGFnQ2xhc3NbdGFnID4+IDZdO1xuICB2YXIgcHJpbWl0aXZlID0gKHRhZyAmIDB4MjApID09PSAwO1xuXG4gIC8vIE11bHRpLW9jdGV0IHRhZyAtIGxvYWRcbiAgaWYgKCh0YWcgJiAweDFmKSA9PT0gMHgxZikge1xuICAgIHZhciBvY3QgPSB0YWc7XG4gICAgdGFnID0gMDtcbiAgICB3aGlsZSAoKG9jdCAmIDB4ODApID09PSAweDgwKSB7XG4gICAgICBvY3QgPSBidWYucmVhZFVJbnQ4KGZhaWwpO1xuICAgICAgaWYgKGJ1Zi5pc0Vycm9yKG9jdCkpXG4gICAgICAgIHJldHVybiBvY3Q7XG5cbiAgICAgIHRhZyA8PD0gNztcbiAgICAgIHRhZyB8PSBvY3QgJiAweDdmO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0YWcgJj0gMHgxZjtcbiAgfVxuICB2YXIgdGFnU3RyID0gZGVyLnRhZ1t0YWddO1xuXG4gIHJldHVybiB7XG4gICAgY2xzOiBjbHMsXG4gICAgcHJpbWl0aXZlOiBwcmltaXRpdmUsXG4gICAgdGFnOiB0YWcsXG4gICAgdGFnU3RyOiB0YWdTdHJcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGVyRGVjb2RlTGVuKGJ1ZiwgcHJpbWl0aXZlLCBmYWlsKSB7XG4gIHZhciBsZW4gPSBidWYucmVhZFVJbnQ4KGZhaWwpO1xuICBpZiAoYnVmLmlzRXJyb3IobGVuKSlcbiAgICByZXR1cm4gbGVuO1xuXG4gIC8vIEluZGVmaW5pdGUgZm9ybVxuICBpZiAoIXByaW1pdGl2ZSAmJiBsZW4gPT09IDB4ODApXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgLy8gRGVmaW5pdGUgZm9ybVxuICBpZiAoKGxlbiAmIDB4ODApID09PSAwKSB7XG4gICAgLy8gU2hvcnQgZm9ybVxuICAgIHJldHVybiBsZW47XG4gIH1cblxuICAvLyBMb25nIGZvcm1cbiAgdmFyIG51bSA9IGxlbiAmIDB4N2Y7XG4gIGlmIChudW0gPj0gNClcbiAgICByZXR1cm4gYnVmLmVycm9yKCdsZW5ndGggb2N0ZWN0IGlzIHRvbyBsb25nJyk7XG5cbiAgbGVuID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgIGxlbiA8PD0gODtcbiAgICB2YXIgaiA9IGJ1Zi5yZWFkVUludDgoZmFpbCk7XG4gICAgaWYgKGJ1Zi5pc0Vycm9yKGopKVxuICAgICAgcmV0dXJuIGo7XG4gICAgbGVuIHw9IGo7XG4gIH1cblxuICByZXR1cm4gbGVuO1xufVxuIiwidmFyIGRlY29kZXJzID0gZXhwb3J0cztcblxuZGVjb2RlcnMuZGVyID0gcmVxdWlyZSgnLi9kZXInKTtcbmRlY29kZXJzLnBlbSA9IHJlcXVpcmUoJy4vcGVtJyk7XG4iLCJ2YXIgaW5oZXJpdHMgPSByZXF1aXJlKCd1dGlsJykuaW5oZXJpdHM7XG52YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xuXG52YXIgYXNuMSA9IHJlcXVpcmUoJy4uL2FzbjEnKTtcbnZhciBERVJEZWNvZGVyID0gcmVxdWlyZSgnLi9kZXInKTtcblxuZnVuY3Rpb24gUEVNRGVjb2RlcihlbnRpdHkpIHtcbiAgREVSRGVjb2Rlci5jYWxsKHRoaXMsIGVudGl0eSk7XG4gIHRoaXMuZW5jID0gJ3BlbSc7XG59O1xuaW5oZXJpdHMoUEVNRGVjb2RlciwgREVSRGVjb2Rlcik7XG5tb2R1bGUuZXhwb3J0cyA9IFBFTURlY29kZXI7XG5cblBFTURlY29kZXIucHJvdG90eXBlLmRlY29kZSA9IGZ1bmN0aW9uIGRlY29kZShkYXRhLCBvcHRpb25zKSB7XG4gIHZhciBsaW5lcyA9IGRhdGEudG9TdHJpbmcoKS5zcGxpdCgvW1xcclxcbl0rL2cpO1xuXG4gIHZhciBsYWJlbCA9IG9wdGlvbnMubGFiZWwudG9VcHBlckNhc2UoKTtcblxuICB2YXIgcmUgPSAvXi0tLS0tKEJFR0lOfEVORCkgKFteLV0rKS0tLS0tJC87XG4gIHZhciBzdGFydCA9IC0xO1xuICB2YXIgZW5kID0gLTE7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbWF0Y2ggPSBsaW5lc1tpXS5tYXRjaChyZSk7XG4gICAgaWYgKG1hdGNoID09PSBudWxsKVxuICAgICAgY29udGludWU7XG5cbiAgICBpZiAobWF0Y2hbMl0gIT09IGxhYmVsKVxuICAgICAgY29udGludWU7XG5cbiAgICBpZiAoc3RhcnQgPT09IC0xKSB7XG4gICAgICBpZiAobWF0Y2hbMV0gIT09ICdCRUdJTicpXG4gICAgICAgIGJyZWFrO1xuICAgICAgc3RhcnQgPSBpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWF0Y2hbMV0gIT09ICdFTkQnKVxuICAgICAgICBicmVhaztcbiAgICAgIGVuZCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKHN0YXJ0ID09PSAtMSB8fCBlbmQgPT09IC0xKVxuICAgIHRocm93IG5ldyBFcnJvcignUEVNIHNlY3Rpb24gbm90IGZvdW5kIGZvcjogJyArIGxhYmVsKTtcblxuICB2YXIgYmFzZTY0ID0gbGluZXMuc2xpY2Uoc3RhcnQgKyAxLCBlbmQpLmpvaW4oJycpO1xuICAvLyBSZW1vdmUgZXhjZXNzaXZlIHN5bWJvbHNcbiAgYmFzZTY0LnJlcGxhY2UoL1teYS16MC05XFwrXFwvPV0rL2dpLCAnJyk7XG5cbiAgdmFyIGlucHV0ID0gbmV3IEJ1ZmZlcihiYXNlNjQsICdiYXNlNjQnKTtcbiAgcmV0dXJuIERFUkRlY29kZXIucHJvdG90eXBlLmRlY29kZS5jYWxsKHRoaXMsIGlucHV0LCBvcHRpb25zKTtcbn07XG4iLCJ2YXIgaW5oZXJpdHMgPSByZXF1aXJlKCd1dGlsJykuaW5oZXJpdHM7XG52YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xuXG52YXIgYXNuMSA9IHJlcXVpcmUoJy4uL2FzbjEnKTtcbnZhciBiYXNlID0gYXNuMS5iYXNlO1xudmFyIGJpZ251bSA9IGFzbjEuYmlnbnVtO1xuXG4vLyBJbXBvcnQgREVSIGNvbnN0YW50c1xudmFyIGRlciA9IGFzbjEuY29uc3RhbnRzLmRlcjtcblxuZnVuY3Rpb24gREVSRW5jb2RlcihlbnRpdHkpIHtcbiAgdGhpcy5lbmMgPSAnZGVyJztcbiAgdGhpcy5uYW1lID0gZW50aXR5Lm5hbWU7XG4gIHRoaXMuZW50aXR5ID0gZW50aXR5O1xuXG4gIC8vIENvbnN0cnVjdCBiYXNlIHRyZWVcbiAgdGhpcy50cmVlID0gbmV3IERFUk5vZGUoKTtcbiAgdGhpcy50cmVlLl9pbml0KGVudGl0eS5ib2R5KTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IERFUkVuY29kZXI7XG5cbkRFUkVuY29kZXIucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uIGVuY29kZShkYXRhLCByZXBvcnRlcikge1xuICByZXR1cm4gdGhpcy50cmVlLl9lbmNvZGUoZGF0YSwgcmVwb3J0ZXIpLmpvaW4oKTtcbn07XG5cbi8vIFRyZWUgbWV0aG9kc1xuXG5mdW5jdGlvbiBERVJOb2RlKHBhcmVudCkge1xuICBiYXNlLk5vZGUuY2FsbCh0aGlzLCAnZGVyJywgcGFyZW50KTtcbn1cbmluaGVyaXRzKERFUk5vZGUsIGJhc2UuTm9kZSk7XG5cbkRFUk5vZGUucHJvdG90eXBlLl9lbmNvZGVDb21wb3NpdGUgPSBmdW5jdGlvbiBlbmNvZGVDb21wb3NpdGUodGFnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmltaXRpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudCkge1xuICB2YXIgZW5jb2RlZFRhZyA9IGVuY29kZVRhZyh0YWcsIHByaW1pdGl2ZSwgY2xzLCB0aGlzLnJlcG9ydGVyKTtcblxuICAvLyBTaG9ydCBmb3JtXG4gIGlmIChjb250ZW50Lmxlbmd0aCA8IDB4ODApIHtcbiAgICB2YXIgaGVhZGVyID0gbmV3IEJ1ZmZlcigyKTtcbiAgICBoZWFkZXJbMF0gPSBlbmNvZGVkVGFnO1xuICAgIGhlYWRlclsxXSA9IGNvbnRlbnQubGVuZ3RoO1xuICAgIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKFsgaGVhZGVyLCBjb250ZW50IF0pO1xuICB9XG5cbiAgLy8gTG9uZyBmb3JtXG4gIC8vIENvdW50IG9jdGV0cyByZXF1aXJlZCB0byBzdG9yZSBsZW5ndGhcbiAgdmFyIGxlbk9jdGV0cyA9IDE7XG4gIGZvciAodmFyIGkgPSBjb250ZW50Lmxlbmd0aDsgaSA+PSAweDEwMDsgaSA+Pj0gOClcbiAgICBsZW5PY3RldHMrKztcblxuICB2YXIgaGVhZGVyID0gbmV3IEJ1ZmZlcigxICsgMSArIGxlbk9jdGV0cyk7XG4gIGhlYWRlclswXSA9IGVuY29kZWRUYWc7XG4gIGhlYWRlclsxXSA9IDB4ODAgfCBsZW5PY3RldHM7XG5cbiAgZm9yICh2YXIgaSA9IDEgKyBsZW5PY3RldHMsIGogPSBjb250ZW50Lmxlbmd0aDsgaiA+IDA7IGktLSwgaiA+Pj0gOClcbiAgICBoZWFkZXJbaV0gPSBqICYgMHhmZjtcblxuICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihbIGhlYWRlciwgY29udGVudCBdKTtcbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl9lbmNvZGVTdHIgPSBmdW5jdGlvbiBlbmNvZGVTdHIoc3RyLCB0YWcpIHtcbiAgaWYgKHRhZyA9PT0gJ29jdHN0cicpXG4gICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIoc3RyKTtcbiAgZWxzZSBpZiAodGFnID09PSAnYml0c3RyJylcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihbIHN0ci51bnVzZWQgfCAwLCBzdHIuZGF0YSBdKTtcbiAgZWxzZSBpZiAodGFnID09PSAnaWE1c3RyJyB8fCB0YWcgPT09ICd1dGY4c3RyJylcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihzdHIpO1xuICByZXR1cm4gdGhpcy5yZXBvcnRlci5lcnJvcignRW5jb2Rpbmcgb2Ygc3RyaW5nIHR5cGU6ICcgKyB0YWcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIHVuc3VwcG9ydGVkJyk7XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fZW5jb2RlT2JqaWQgPSBmdW5jdGlvbiBlbmNvZGVPYmppZChpZCwgdmFsdWVzLCByZWxhdGl2ZSkge1xuICBpZiAodHlwZW9mIGlkID09PSAnc3RyaW5nJykge1xuICAgIGlmICghdmFsdWVzKVxuICAgICAgcmV0dXJuIHRoaXMucmVwb3J0ZXIuZXJyb3IoJ3N0cmluZyBvYmppZCBnaXZlbiwgYnV0IG5vIHZhbHVlcyBtYXAgZm91bmQnKTtcbiAgICBpZiAoIXZhbHVlcy5oYXNPd25Qcm9wZXJ0eShpZCkpXG4gICAgICByZXR1cm4gdGhpcy5yZXBvcnRlci5lcnJvcignb2JqaWQgbm90IGZvdW5kIGluIHZhbHVlcyBtYXAnKTtcbiAgICBpZCA9IHZhbHVlc1tpZF0uc3BsaXQoL1tcXHNcXC5dKy9nKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlkLmxlbmd0aDsgaSsrKVxuICAgICAgaWRbaV0gfD0gMDtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGlkKSkge1xuICAgIGlkID0gaWQuc2xpY2UoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlkLmxlbmd0aDsgaSsrKVxuICAgICAgaWRbaV0gfD0gMDtcbiAgfVxuXG4gIGlmICghQXJyYXkuaXNBcnJheShpZCkpIHtcbiAgICByZXR1cm4gdGhpcy5yZXBvcnRlci5lcnJvcignb2JqaWQoKSBzaG91bGQgYmUgZWl0aGVyIGFycmF5IG9yIHN0cmluZywgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2dvdDogJyArIEpTT04uc3RyaW5naWZ5KGlkKSk7XG4gIH1cblxuICBpZiAoIXJlbGF0aXZlKSB7XG4gICAgaWYgKGlkWzFdID49IDQwKVxuICAgICAgcmV0dXJuIHRoaXMucmVwb3J0ZXIuZXJyb3IoJ1NlY29uZCBvYmppZCBpZGVudGlmaWVyIE9PQicpO1xuICAgIGlkLnNwbGljZSgwLCAyLCBpZFswXSAqIDQwICsgaWRbMV0pO1xuICB9XG5cbiAgLy8gQ291bnQgbnVtYmVyIG9mIG9jdGV0c1xuICB2YXIgc2l6ZSA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaWQubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaWRlbnQgPSBpZFtpXTtcbiAgICBmb3IgKHNpemUrKzsgaWRlbnQgPj0gMHg4MDsgaWRlbnQgPj49IDcpXG4gICAgICBzaXplKys7XG4gIH1cblxuICB2YXIgb2JqaWQgPSBuZXcgQnVmZmVyKHNpemUpO1xuICB2YXIgb2Zmc2V0ID0gb2JqaWQubGVuZ3RoIC0gMTtcbiAgZm9yICh2YXIgaSA9IGlkLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGlkZW50ID0gaWRbaV07XG4gICAgb2JqaWRbb2Zmc2V0LS1dID0gaWRlbnQgJiAweDdmO1xuICAgIHdoaWxlICgoaWRlbnQgPj49IDcpID4gMClcbiAgICAgIG9iamlkW29mZnNldC0tXSA9IDB4ODAgfCAoaWRlbnQgJiAweDdmKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKG9iamlkKTtcbn07XG5cbmZ1bmN0aW9uIHR3byhudW0pIHtcbiAgaWYgKG51bSA8IDEwKVxuICAgIHJldHVybiAnMCcgKyBudW07XG4gIGVsc2VcbiAgICByZXR1cm4gbnVtO1xufVxuXG5ERVJOb2RlLnByb3RvdHlwZS5fZW5jb2RlVGltZSA9IGZ1bmN0aW9uIGVuY29kZVRpbWUodGltZSwgdGFnKSB7XG4gIHZhciBzdHI7XG4gIHZhciBkYXRlID0gbmV3IERhdGUodGltZSk7XG5cbiAgaWYgKHRhZyA9PT0gJ2dlbnRpbWUnKSB7XG4gICAgc3RyID0gW1xuICAgICAgdHdvKGRhdGUuZ2V0RnVsbFllYXIoKSksXG4gICAgICB0d28oZGF0ZS5nZXRVVENNb250aCgpICsgMSksXG4gICAgICB0d28oZGF0ZS5nZXRVVENEYXRlKCkpLFxuICAgICAgdHdvKGRhdGUuZ2V0VVRDSG91cnMoKSksXG4gICAgICB0d28oZGF0ZS5nZXRVVENNaW51dGVzKCkpLFxuICAgICAgdHdvKGRhdGUuZ2V0VVRDU2Vjb25kcygpKSxcbiAgICAgICdaJ1xuICAgIF0uam9pbignJyk7XG4gIH0gZWxzZSBpZiAodGFnID09PSAndXRjdGltZScpIHtcbiAgICBzdHIgPSBbXG4gICAgICB0d28oZGF0ZS5nZXRGdWxsWWVhcigpICUgMTAwKSxcbiAgICAgIHR3byhkYXRlLmdldFVUQ01vbnRoKCkgKyAxKSxcbiAgICAgIHR3byhkYXRlLmdldFVUQ0RhdGUoKSksXG4gICAgICB0d28oZGF0ZS5nZXRVVENIb3VycygpKSxcbiAgICAgIHR3byhkYXRlLmdldFVUQ01pbnV0ZXMoKSksXG4gICAgICB0d28oZGF0ZS5nZXRVVENTZWNvbmRzKCkpLFxuICAgICAgJ1onXG4gICAgXS5qb2luKCcnKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnJlcG9ydGVyLmVycm9yKCdFbmNvZGluZyAnICsgdGFnICsgJyB0aW1lIGlzIG5vdCBzdXBwb3J0ZWQgeWV0Jyk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5fZW5jb2RlU3RyKHN0ciwgJ29jdHN0cicpO1xufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX2VuY29kZU51bGwgPSBmdW5jdGlvbiBlbmNvZGVOdWxsKCkge1xuICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcignJyk7XG59O1xuXG5ERVJOb2RlLnByb3RvdHlwZS5fZW5jb2RlSW50ID0gZnVuY3Rpb24gZW5jb2RlSW50KG51bSwgdmFsdWVzKSB7XG4gIGlmICh0eXBlb2YgbnVtID09PSAnc3RyaW5nJykge1xuICAgIGlmICghdmFsdWVzKVxuICAgICAgcmV0dXJuIHRoaXMucmVwb3J0ZXIuZXJyb3IoJ1N0cmluZyBpbnQgb3IgZW51bSBnaXZlbiwgYnV0IG5vIHZhbHVlcyBtYXAnKTtcbiAgICBpZiAoIXZhbHVlcy5oYXNPd25Qcm9wZXJ0eShudW0pKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZXBvcnRlci5lcnJvcignVmFsdWVzIG1hcCBkb2VzblxcJ3QgY29udGFpbjogJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShudW0pKTtcbiAgICB9XG4gICAgbnVtID0gdmFsdWVzW251bV07XG4gIH1cblxuICAvLyBCaWdudW0sIGFzc3VtZSBiaWcgZW5kaWFuXG4gIGlmICh0eXBlb2YgbnVtICE9PSAnbnVtYmVyJyAmJiAhQnVmZmVyLmlzQnVmZmVyKG51bSkpIHtcbiAgICB2YXIgbnVtQXJyYXkgPSBudW0udG9BcnJheSgpO1xuICAgIGlmIChudW0uc2lnbiA9PT0gZmFsc2UgJiYgbnVtQXJyYXlbMF0gJiAweDgwKSB7XG4gICAgICBudW1BcnJheS51bnNoaWZ0KDApO1xuICAgIH1cbiAgICBudW0gPSBuZXcgQnVmZmVyKG51bUFycmF5KTtcbiAgfVxuXG4gIGlmIChCdWZmZXIuaXNCdWZmZXIobnVtKSkge1xuICAgIHZhciBzaXplID0gbnVtLmxlbmd0aDtcbiAgICBpZiAobnVtLmxlbmd0aCA9PT0gMClcbiAgICAgIHNpemUrKztcblxuICAgIHZhciBvdXQgPSBuZXcgQnVmZmVyKHNpemUpO1xuICAgIG51bS5jb3B5KG91dCk7XG4gICAgaWYgKG51bS5sZW5ndGggPT09IDApXG4gICAgICBvdXRbMF0gPSAwXG4gICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIob3V0KTtcbiAgfVxuXG4gIGlmIChudW0gPCAweDgwKVxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKG51bSk7XG5cbiAgaWYgKG51bSA8IDB4MTAwKVxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKFswLCBudW1dKTtcblxuICB2YXIgc2l6ZSA9IDE7XG4gIGZvciAodmFyIGkgPSBudW07IGkgPj0gMHgxMDA7IGkgPj49IDgpXG4gICAgc2l6ZSsrO1xuXG4gIHZhciBvdXQgPSBuZXcgQXJyYXkoc2l6ZSk7XG4gIGZvciAodmFyIGkgPSBvdXQubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBvdXRbaV0gPSBudW0gJiAweGZmO1xuICAgIG51bSA+Pj0gODtcbiAgfVxuICBpZihvdXRbMF0gJiAweDgwKSB7XG4gICAgb3V0LnVuc2hpZnQoMCk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihuZXcgQnVmZmVyKG91dCkpO1xufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX2VuY29kZUJvb2wgPSBmdW5jdGlvbiBlbmNvZGVCb29sKHZhbHVlKSB7XG4gIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKHZhbHVlID8gMHhmZiA6IDApO1xufTtcblxuREVSTm9kZS5wcm90b3R5cGUuX3VzZSA9IGZ1bmN0aW9uIHVzZShlbnRpdHksIG9iaikge1xuICBpZiAodHlwZW9mIGVudGl0eSA9PT0gJ2Z1bmN0aW9uJylcbiAgICBlbnRpdHkgPSBlbnRpdHkob2JqKTtcbiAgcmV0dXJuIGVudGl0eS5fZ2V0RW5jb2RlcignZGVyJykudHJlZTtcbn07XG5cbkRFUk5vZGUucHJvdG90eXBlLl9za2lwRGVmYXVsdCA9IGZ1bmN0aW9uIHNraXBEZWZhdWx0KGRhdGFCdWZmZXIsIHJlcG9ydGVyLCBwYXJlbnQpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xuICB2YXIgaTtcbiAgaWYgKHN0YXRlWydkZWZhdWx0J10gPT09IG51bGwpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBkYXRhID0gZGF0YUJ1ZmZlci5qb2luKCk7XG4gIGlmIChzdGF0ZS5kZWZhdWx0QnVmZmVyID09PSB1bmRlZmluZWQpXG4gICAgc3RhdGUuZGVmYXVsdEJ1ZmZlciA9IHRoaXMuX2VuY29kZVZhbHVlKHN0YXRlWydkZWZhdWx0J10sIHJlcG9ydGVyLCBwYXJlbnQpLmpvaW4oKTtcblxuICBpZiAoZGF0YS5sZW5ndGggIT09IHN0YXRlLmRlZmF1bHRCdWZmZXIubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBmb3IgKGk9MDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspXG4gICAgaWYgKGRhdGFbaV0gIT09IHN0YXRlLmRlZmF1bHRCdWZmZXJbaV0pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vLyBVdGlsaXR5IG1ldGhvZHNcblxuZnVuY3Rpb24gZW5jb2RlVGFnKHRhZywgcHJpbWl0aXZlLCBjbHMsIHJlcG9ydGVyKSB7XG4gIHZhciByZXM7XG5cbiAgaWYgKHRhZyA9PT0gJ3NlcW9mJylcbiAgICB0YWcgPSAnc2VxJztcbiAgZWxzZSBpZiAodGFnID09PSAnc2V0b2YnKVxuICAgIHRhZyA9ICdzZXQnO1xuXG4gIGlmIChkZXIudGFnQnlOYW1lLmhhc093blByb3BlcnR5KHRhZykpXG4gICAgcmVzID0gZGVyLnRhZ0J5TmFtZVt0YWddO1xuICBlbHNlIGlmICh0eXBlb2YgdGFnID09PSAnbnVtYmVyJyAmJiAodGFnIHwgMCkgPT09IHRhZylcbiAgICByZXMgPSB0YWc7XG4gIGVsc2VcbiAgICByZXR1cm4gcmVwb3J0ZXIuZXJyb3IoJ1Vua25vd24gdGFnOiAnICsgdGFnKTtcblxuICBpZiAocmVzID49IDB4MWYpXG4gICAgcmV0dXJuIHJlcG9ydGVyLmVycm9yKCdNdWx0aS1vY3RldCB0YWcgZW5jb2RpbmcgdW5zdXBwb3J0ZWQnKTtcblxuICBpZiAoIXByaW1pdGl2ZSlcbiAgICByZXMgfD0gMHgyMDtcblxuICByZXMgfD0gKGRlci50YWdDbGFzc0J5TmFtZVtjbHMgfHwgJ3VuaXZlcnNhbCddIDw8IDYpO1xuXG4gIHJldHVybiByZXM7XG59XG4iLCJ2YXIgZW5jb2RlcnMgPSBleHBvcnRzO1xuXG5lbmNvZGVycy5kZXIgPSByZXF1aXJlKCcuL2RlcicpO1xuZW5jb2RlcnMucGVtID0gcmVxdWlyZSgnLi9wZW0nKTtcbiIsInZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ3V0aWwnKS5pbmhlcml0cztcbnZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7XG5cbnZhciBhc24xID0gcmVxdWlyZSgnLi4vYXNuMScpO1xudmFyIERFUkVuY29kZXIgPSByZXF1aXJlKCcuL2RlcicpO1xuXG5mdW5jdGlvbiBQRU1FbmNvZGVyKGVudGl0eSkge1xuICBERVJFbmNvZGVyLmNhbGwodGhpcywgZW50aXR5KTtcbiAgdGhpcy5lbmMgPSAncGVtJztcbn07XG5pbmhlcml0cyhQRU1FbmNvZGVyLCBERVJFbmNvZGVyKTtcbm1vZHVsZS5leHBvcnRzID0gUEVNRW5jb2RlcjtcblxuUEVNRW5jb2Rlci5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24gZW5jb2RlKGRhdGEsIG9wdGlvbnMpIHtcbiAgdmFyIGJ1ZiA9IERFUkVuY29kZXIucHJvdG90eXBlLmVuY29kZS5jYWxsKHRoaXMsIGRhdGEpO1xuXG4gIHZhciBwID0gYnVmLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgdmFyIG91dCA9IFsgJy0tLS0tQkVHSU4gJyArIG9wdGlvbnMubGFiZWwgKyAnLS0tLS0nIF07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcC5sZW5ndGg7IGkgKz0gNjQpXG4gICAgb3V0LnB1c2gocC5zbGljZShpLCBpICsgNjQpKTtcbiAgb3V0LnB1c2goJy0tLS0tRU5EICcgKyBvcHRpb25zLmxhYmVsICsgJy0tLS0tJyk7XG4gIHJldHVybiBvdXQuam9pbignXFxuJyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBhc24xID0gcmVxdWlyZSgnLi9hc24xL2FzbjEnKTtcbnZhciBCTiA9IHJlcXVpcmUoJy4vYXNuMS9iaWdudW0vYm4nKTtcblxudmFyIEVDUHJpdmF0ZUtleUFTTiA9IGFzbjEuZGVmaW5lKCdFQ1ByaXZhdGVLZXknLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNlcSgpLm9iaihcbiAgICAgICAgdGhpcy5rZXkoJ3ZlcnNpb24nKS5pbnQoKSxcbiAgICAgICAgdGhpcy5rZXkoJ3ByaXZhdGVLZXknKS5vY3RzdHIoKSxcbiAgICAgICAgdGhpcy5rZXkoJ3BhcmFtZXRlcnMnKS5leHBsaWNpdCgwKS5vYmppZCgpLm9wdGlvbmFsKCksXG4gICAgICAgIHRoaXMua2V5KCdwdWJsaWNLZXknKS5leHBsaWNpdCgxKS5iaXRzdHIoKS5vcHRpb25hbCgpXG4gICAgKVxufSlcblxudmFyIFN1YmplY3RQdWJsaWNLZXlJbmZvQVNOID0gYXNuMS5kZWZpbmUoJ1N1YmplY3RQdWJsaWNLZXlJbmZvJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXEoKS5vYmooXG4gICAgICAgIHRoaXMua2V5KCdhbGdvcml0aG0nKS5zZXEoKS5vYmooXG4gICAgICAgICAgICB0aGlzLmtleShcImlkXCIpLm9iamlkKCksXG4gICAgICAgICAgICB0aGlzLmtleShcImN1cnZlXCIpLm9iamlkKClcbiAgICAgICAgKSxcbiAgICAgICAgdGhpcy5rZXkoJ3B1YicpLmJpdHN0cigpXG4gICAgKVxufSlcblxudmFyIGN1cnZlcyA9IHtcbiAgICBzZWNwMjU2azE6IHtcbiAgICAgICAgY3VydmVQYXJhbWV0ZXJzOiBbMSwgMywgMTMyLCAwLCAxMF0sXG4gICAgICAgIHByaXZhdGVQRU1PcHRpb25zOiB7bGFiZWw6ICdFQyBQUklWQVRFIEtFWSd9LFxuICAgICAgICBwdWJsaWNQRU1PcHRpb25zOiB7bGFiZWw6ICdQVUJMSUMgS0VZJ31cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydCh2YWwsIG1zZykge1xuICAgIGlmICghdmFsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cgfHwgJ0Fzc2VydGlvbiBmYWlsZWQnKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gS2V5RW5jb2RlcihvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgICBhc3NlcnQoY3VydmVzLmhhc093blByb3BlcnR5KG9wdGlvbnMpLCAnVW5rbm93biBjdXJ2ZSAnICsgb3B0aW9ucyk7XG4gICAgICAgIG9wdGlvbnMgPSBjdXJ2ZXNbb3B0aW9uc11cbiAgICB9XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmFsZ29yaXRobUlEID0gWzEsIDIsIDg0MCwgMTAwNDUsIDIsIDFdXG59XG5cbktleUVuY29kZXIuRUNQcml2YXRlS2V5QVNOID0gRUNQcml2YXRlS2V5QVNOO1xuS2V5RW5jb2Rlci5TdWJqZWN0UHVibGljS2V5SW5mb0FTTiA9IFN1YmplY3RQdWJsaWNLZXlJbmZvQVNOO1xuXG5LZXlFbmNvZGVyLnByb3RvdHlwZS5wcml2YXRlS2V5T2JqZWN0ID0gZnVuY3Rpb24ocmF3UHJpdmF0ZUtleSwgcmF3UHVibGljS2V5KSB7XG4gICAgdmFyIHByaXZhdGVLZXlPYmplY3QgPSB7XG4gICAgICAgIHZlcnNpb246IG5ldyBCTigxKSxcbiAgICAgICAgcHJpdmF0ZUtleTogbmV3IEJ1ZmZlcihyYXdQcml2YXRlS2V5LCAnaGV4JyksXG4gICAgICAgIHBhcmFtZXRlcnM6IHRoaXMub3B0aW9ucy5jdXJ2ZVBhcmFtZXRlcnMsXG4gICAgICAgIHBlbU9wdGlvbnM6IHtsYWJlbDpcIkVDIFBSSVZBVEUgS0VZXCJ9XG4gICAgfTtcblxuICAgIGlmIChyYXdQdWJsaWNLZXkpIHtcbiAgICAgICAgcHJpdmF0ZUtleU9iamVjdC5wdWJsaWNLZXkgPSB7XG4gICAgICAgICAgICB1bnVzZWQ6IDAsXG4gICAgICAgICAgICBkYXRhOiBuZXcgQnVmZmVyKHJhd1B1YmxpY0tleSwgJ2hleCcpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcHJpdmF0ZUtleU9iamVjdFxufTtcblxuS2V5RW5jb2Rlci5wcm90b3R5cGUucHVibGljS2V5T2JqZWN0ID0gZnVuY3Rpb24ocmF3UHVibGljS2V5KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYWxnb3JpdGhtOiB7XG4gICAgICAgICAgICBpZDogdGhpcy5hbGdvcml0aG1JRCxcbiAgICAgICAgICAgIGN1cnZlOiB0aGlzLm9wdGlvbnMuY3VydmVQYXJhbWV0ZXJzXG4gICAgICAgIH0sXG4gICAgICAgIHB1Yjoge1xuICAgICAgICAgICAgdW51c2VkOiAwLFxuICAgICAgICAgICAgZGF0YTogbmV3IEJ1ZmZlcihyYXdQdWJsaWNLZXksICdoZXgnKVxuICAgICAgICB9LFxuICAgICAgICBwZW1PcHRpb25zOiB7IGxhYmVsIDpcIlBVQkxJQyBLRVlcIn1cbiAgICB9XG59XG5cbktleUVuY29kZXIucHJvdG90eXBlLmVuY29kZVByaXZhdGUgPSBmdW5jdGlvbihwcml2YXRlS2V5LCBvcmlnaW5hbEZvcm1hdCwgZGVzdGluYXRpb25Gb3JtYXQpIHtcbiAgICB2YXIgcHJpdmF0ZUtleU9iamVjdFxuXG4gICAgLyogUGFyc2UgdGhlIGluY29taW5nIHByaXZhdGUga2V5IGFuZCBjb252ZXJ0IGl0IHRvIGEgcHJpdmF0ZSBrZXkgb2JqZWN0ICovXG4gICAgaWYgKG9yaWdpbmFsRm9ybWF0ID09PSAncmF3Jykge1xuICAgICAgICBpZiAoIXR5cGVvZiBwcml2YXRlS2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgJ3ByaXZhdGUga2V5IG11c3QgYmUgYSBzdHJpbmcnXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHByaXZhdGVLZXlPYmplY3QgPSB0aGlzLm9wdGlvbnMuY3VydmUua2V5RnJvbVByaXZhdGUocHJpdmF0ZUtleSwgJ2hleCcpLFxuICAgICAgICAgICAgcmF3UHVibGljS2V5ID0gcHJpdmF0ZUtleU9iamVjdC5nZXRQdWJsaWMoJ2hleCcpXG4gICAgICAgIHByaXZhdGVLZXlPYmplY3QgPSB0aGlzLnByaXZhdGVLZXlPYmplY3QocHJpdmF0ZUtleSwgcmF3UHVibGljS2V5KVxuICAgIH0gZWxzZSBpZiAob3JpZ2luYWxGb3JtYXQgPT09ICdkZXInKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHJpdmF0ZUtleSA9PT0gJ2J1ZmZlcicpIHtcbiAgICAgICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcHJpdmF0ZUtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHByaXZhdGVLZXkgPSBuZXcgQnVmZmVyKHByaXZhdGVLZXksICdoZXgnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgJ3ByaXZhdGUga2V5IG11c3QgYmUgYSBidWZmZXIgb3IgYSBzdHJpbmcnXG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZUtleU9iamVjdCA9IEVDUHJpdmF0ZUtleUFTTi5kZWNvZGUocHJpdmF0ZUtleSwgJ2RlcicpXG4gICAgfSBlbHNlIGlmIChvcmlnaW5hbEZvcm1hdCA9PT0gJ3BlbScpIHtcbiAgICAgICAgaWYgKCF0eXBlb2YgcHJpdmF0ZUtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93ICdwcml2YXRlIGtleSBtdXN0IGJlIGEgc3RyaW5nJ1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGVLZXlPYmplY3QgPSBFQ1ByaXZhdGVLZXlBU04uZGVjb2RlKHByaXZhdGVLZXksICdwZW0nLCB0aGlzLm9wdGlvbnMucHJpdmF0ZVBFTU9wdGlvbnMpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgJ2ludmFsaWQgcHJpdmF0ZSBrZXkgZm9ybWF0J1xuICAgIH1cblxuICAgIC8qIEV4cG9ydCB0aGUgcHJpdmF0ZSBrZXkgb2JqZWN0IHRvIHRoZSBkZXNpcmVkIGZvcm1hdCAqL1xuICAgIGlmIChkZXN0aW5hdGlvbkZvcm1hdCA9PT0gJ3JhdycpIHtcbiAgICAgICAgcmV0dXJuIHByaXZhdGVLZXlPYmplY3QucHJpdmF0ZUtleS50b1N0cmluZygnaGV4JylcbiAgICB9IGVsc2UgaWYgKGRlc3RpbmF0aW9uRm9ybWF0ID09PSAnZGVyJykge1xuICAgICAgICByZXR1cm4gRUNQcml2YXRlS2V5QVNOLmVuY29kZShwcml2YXRlS2V5T2JqZWN0LCAnZGVyJykudG9TdHJpbmcoJ2hleCcpXG4gICAgfSBlbHNlIGlmIChkZXN0aW5hdGlvbkZvcm1hdCA9PT0gJ3BlbScpIHtcbiAgICAgICAgcmV0dXJuIEVDUHJpdmF0ZUtleUFTTi5lbmNvZGUocHJpdmF0ZUtleU9iamVjdCwgJ3BlbScsIHRoaXMub3B0aW9ucy5wcml2YXRlUEVNT3B0aW9ucylcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyAnaW52YWxpZCBkZXN0aW5hdGlvbiBmb3JtYXQgZm9yIHByaXZhdGUga2V5J1xuICAgIH1cbn1cblxuS2V5RW5jb2Rlci5wcm90b3R5cGUuZW5jb2RlUHVibGljID0gZnVuY3Rpb24ocHVibGljS2V5LCBvcmlnaW5hbEZvcm1hdCwgZGVzdGluYXRpb25Gb3JtYXQpIHtcbiAgICB2YXIgcHVibGljS2V5T2JqZWN0XG5cbiAgICAvKiBQYXJzZSB0aGUgaW5jb21pbmcgcHVibGljIGtleSBhbmQgY29udmVydCBpdCB0byBhIHB1YmxpYyBrZXkgb2JqZWN0ICovXG4gICAgaWYgKG9yaWdpbmFsRm9ybWF0ID09PSAncmF3Jykge1xuICAgICAgICBpZiAoIXR5cGVvZiBwdWJsaWNLZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyAncHVibGljIGtleSBtdXN0IGJlIGEgc3RyaW5nJ1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpY0tleU9iamVjdCA9IHRoaXMucHVibGljS2V5T2JqZWN0KHB1YmxpY0tleSlcbiAgICB9IGVsc2UgaWYgKG9yaWdpbmFsRm9ybWF0ID09PSAnZGVyJykge1xuICAgICAgICBpZiAodHlwZW9mIHB1YmxpY0tleSA9PT0gJ2J1ZmZlcicpIHtcbiAgICAgICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcHVibGljS2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcHVibGljS2V5ID0gbmV3IEJ1ZmZlcihwdWJsaWNLZXksICdoZXgnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgJ3B1YmxpYyBrZXkgbXVzdCBiZSBhIGJ1ZmZlciBvciBhIHN0cmluZydcbiAgICAgICAgfVxuICAgICAgICBwdWJsaWNLZXlPYmplY3QgPSBTdWJqZWN0UHVibGljS2V5SW5mb0FTTi5kZWNvZGUocHVibGljS2V5LCAnZGVyJylcbiAgICB9IGVsc2UgaWYgKG9yaWdpbmFsRm9ybWF0ID09PSAncGVtJykge1xuICAgICAgICBpZiAoIXR5cGVvZiBwdWJsaWNLZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyAncHVibGljIGtleSBtdXN0IGJlIGEgc3RyaW5nJ1xuICAgICAgICB9XG4gICAgICAgIHB1YmxpY0tleU9iamVjdCA9IFN1YmplY3RQdWJsaWNLZXlJbmZvQVNOLmRlY29kZShwdWJsaWNLZXksICdwZW0nLCB0aGlzLm9wdGlvbnMucHVibGljUEVNT3B0aW9ucylcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyAnaW52YWxpZCBwdWJsaWMga2V5IGZvcm1hdCdcbiAgICB9XG5cbiAgICAvKiBFeHBvcnQgdGhlIHByaXZhdGUga2V5IG9iamVjdCB0byB0aGUgZGVzaXJlZCBmb3JtYXQgKi9cbiAgICBpZiAoZGVzdGluYXRpb25Gb3JtYXQgPT09ICdyYXcnKSB7XG4gICAgICAgIHJldHVybiBwdWJsaWNLZXlPYmplY3QucHViLmRhdGEudG9TdHJpbmcoJ2hleCcpXG4gICAgfSBlbHNlIGlmIChkZXN0aW5hdGlvbkZvcm1hdCA9PT0gJ2RlcicpIHtcbiAgICAgICAgcmV0dXJuIFN1YmplY3RQdWJsaWNLZXlJbmZvQVNOLmVuY29kZShwdWJsaWNLZXlPYmplY3QsICdkZXInKS50b1N0cmluZygnaGV4JylcbiAgICB9IGVsc2UgaWYgKGRlc3RpbmF0aW9uRm9ybWF0ID09PSAncGVtJykge1xuICAgICAgICByZXR1cm4gU3ViamVjdFB1YmxpY0tleUluZm9BU04uZW5jb2RlKHB1YmxpY0tleU9iamVjdCwgJ3BlbScsIHRoaXMub3B0aW9ucy5wdWJsaWNQRU1PcHRpb25zKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93ICdpbnZhbGlkIGRlc3RpbmF0aW9uIGZvcm1hdCBmb3IgcHVibGljIGtleSdcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gS2V5RW5jb2RlcjsiLCJyZXF1aXJlKFwiLi4vLi4vLi4vZW5naW5lL2NvcmVcIik7XG5jb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5jb25zdCB5YXpsID0gJCQucmVxdWlyZU1vZHVsZShcInlhemxcIik7XG5jb25zdCB5YXV6bCA9ICQkLnJlcXVpcmVNb2R1bGUoXCJ5YXV6bFwiKTtcbmNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpO1xuY29uc3QgaXNTdHJlYW0gPSByZXF1aXJlKFwiLi91dGlscy9pc1N0cmVhbVwiKTtcblxuZnVuY3Rpb24gUHNrQXJjaGl2ZXIoKSB7XG5cdGxldCB6aXBmaWxlID0gbmV3IHlhemwuWmlwRmlsZSgpO1xuXHRmdW5jdGlvbiB6aXBGb2xkZXJSZWN1cnNpdmVseShpbnB1dFBhdGgsIHJvb3QgPSAnJykge1xuXHRcdGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoaW5wdXRQYXRoKTtcblx0XHRmaWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlKSB7XG5cdFx0XHRjb25zdCB0ZW1wUGF0aCA9IHBhdGguam9pbihpbnB1dFBhdGgsIGZpbGUpO1xuXHRcdFx0aWYgKCFmcy5sc3RhdFN5bmModGVtcFBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcblx0XHRcdFx0emlwZmlsZS5hZGRGaWxlKHRlbXBQYXRoLCBwYXRoLmpvaW4ocm9vdCwgZmlsZSkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0emlwRm9sZGVyUmVjdXJzaXZlbHkodGVtcFBhdGgsIHBhdGguam9pbihyb290LCBmaWxlKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHR0aGlzLnppcCA9IGZ1bmN0aW9uIChpbnB1dFBhdGgsIG91dHB1dCwgY2FsbGJhY2spIHtcblx0XHR2YXIgZXh0ID0gXCJcIjtcblx0XHRpZihmcy5sc3RhdFN5bmMoaW5wdXRQYXRoKS5pc0RpcmVjdG9yeSgpKSB7XG5cdFx0XHR6aXBGb2xkZXJSZWN1cnNpdmVseShpbnB1dFBhdGgpO1xuXHRcdH1lbHNle1xuXHRcdFx0dmFyIGZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZShpbnB1dFBhdGgpO1xuXHRcdFx0emlwZmlsZS5hZGRGaWxlKGlucHV0UGF0aCwgZmlsZW5hbWUpO1xuXHRcdFx0dmFyIHNwbGl0RmlsZW5hbWUgPSBmaWxlbmFtZS5zcGxpdChcIi5cIik7XG5cdFx0XHRpZihzcGxpdEZpbGVuYW1lLmxlbmd0aCA+PSAyICl7XG5cdFx0XHRcdGV4dCA9IFwiLlwiICsgc3BsaXRGaWxlbmFtZVtzcGxpdEZpbGVuYW1lLmxlbmd0aCAtIDFdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR6aXBmaWxlLmVuZCgpO1xuXHRcdGlmKGlzU3RyZWFtLmlzV3JpdGFibGUob3V0cHV0KSl7XG5cdFx0XHRjYWxsYmFjayhudWxsLCB6aXBmaWxlLm91dHB1dFN0cmVhbS5waXBlKG91dHB1dCkpO1xuXHRcdH1lbHNlIGlmKHR5cGVvZiBvdXRwdXQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdCQkLmVuc3VyZUZvbGRlckV4aXN0cyhvdXRwdXQsICgpID0+IHtcblx0XHRcdFx0dmFyIGRlc3RpbmF0aW9uUGF0aCA9IHBhdGguam9pbihvdXRwdXQsIHBhdGguYmFzZW5hbWUoaW5wdXRQYXRoLCBleHQpICsgXCIuemlwXCIpO1xuXHRcdFx0XHR6aXBmaWxlLm91dHB1dFN0cmVhbS5waXBlKGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3RpbmF0aW9uUGF0aCkpLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMudW56aXAgPSBmdW5jdGlvbiAoaW5wdXQsIG91dHB1dFBhdGgsIGNhbGxiYWNrKSB7XG5cdFx0eWF1emwub3BlbihpbnB1dCwge2xhenlFbnRyaWVzOiB0cnVlfSwgZnVuY3Rpb24gKGVyciwgemlwZmlsZSkge1xuXHRcdFx0aWYgKGVycikgdGhyb3cgZXJyO1xuXHRcdFx0emlwZmlsZS5yZWFkRW50cnkoKTtcblx0XHRcdHppcGZpbGUub25jZShcImVuZFwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHR9KTtcblx0XHRcdHppcGZpbGUub24oXCJlbnRyeVwiLCBmdW5jdGlvbiAoZW50cnkpIHtcblx0XHRcdFx0aWYgKGVudHJ5LmZpbGVOYW1lLmVuZHNXaXRoKHBhdGguc2VwKSkge1xuXHRcdFx0XHRcdHppcGZpbGUucmVhZEVudHJ5KCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bGV0IGZvbGRlciA9IHBhdGguZGlybmFtZShlbnRyeS5maWxlTmFtZSk7XG5cdFx0XHRcdFx0JCQuZW5zdXJlRm9sZGVyRXhpc3RzKHBhdGguam9pbihvdXRwdXRQYXRoLCBmb2xkZXIpLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHR6aXBmaWxlLm9wZW5SZWFkU3RyZWFtKGVudHJ5LCBmdW5jdGlvbiAoZXJyLCByZWFkU3RyZWFtKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChlcnIpIHRocm93IGVycjtcblxuXHRcdFx0XHRcdFx0XHRyZWFkU3RyZWFtLm9uKFwiZW5kXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHR6aXBmaWxlLnJlYWRFbnRyeSgpO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0bGV0IGZpbGVOYW1lID0gcGF0aC5qb2luKG91dHB1dFBhdGgsIGVudHJ5LmZpbGVOYW1lKTtcblx0XHRcdFx0XHRcdFx0bGV0IGZvbGRlciA9IHBhdGguZGlybmFtZShmaWxlTmFtZSk7XG5cdFx0XHRcdFx0XHRcdCQkLmVuc3VyZUZvbGRlckV4aXN0cyhmb2xkZXIsICgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgb3V0cHV0ID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0oZmlsZU5hbWUpO1xuXHRcdFx0XHRcdFx0XHRcdHJlYWRTdHJlYW0ucGlwZShvdXRwdXQpO1xuXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG59XG5cbi8vIG5ldyBQc2tBcmNoaXZlcigpLnppcChcIkM6XFxcXFVzZXJzXFxcXEFjZXJcXFxcV2Vic3Rvcm1Qcm9qZWN0c1xcXFxwcml2YXRlc2t5XFxcXHRlc3RzXFxcXHBzay11bml0LXRlc3RpbmdcXFxcemlwXFxcXGlucHV0XFxcXHRlc3RcIiwgXCJDOlxcXFxVc2Vyc1xcXFxBY2VyXFxcXFdlYnN0b3JtUHJvamVjdHNcXFxccHJpdmF0ZXNreVxcXFx0ZXN0c1xcXFxwc2stdW5pdC10ZXN0aW5nXFxcXHppcFxcXFxpbnB1dFxcXFx0ZXN0XFxcXG91dHB1dFwiKTtcbm1vZHVsZS5leHBvcnRzID0gbmV3IFBza0FyY2hpdmVyKCk7IiwiXG5jb25zdCBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcbmNvbnN0IGlzU3RyZWFtID0gcmVxdWlyZShcIi4vaXNTdHJlYW1cIik7XG5jb25zdCBhcmNoaXZlciA9IHJlcXVpcmUoXCIuLi9wc2stYXJjaGl2ZXJcIik7XG5jb25zdCBhbGdvcml0aG0gPSAnYWVzLTI1Ni1nY20nO1xuZnVuY3Rpb24gZW5jb2RlKGJ1ZmZlcikge1xuXHRyZXR1cm4gYnVmZmVyLnRvU3RyaW5nKCdiYXNlNjQnKVxuXHRcdC5yZXBsYWNlKC9cXCsvZywgJycpXG5cdFx0LnJlcGxhY2UoL1xcLy9nLCAnJylcblx0XHQucmVwbGFjZSgvPSskLywgJycpO1xufVxuZnVuY3Rpb24gZGVsZXRlRm9sZGVyKGZvbGRlclBhdGgpIHtcblx0dmFyIGZpbGVzID0gZnMucmVhZGRpclN5bmMoZm9sZGVyUGF0aCk7XG5cdGZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcblx0XHR2YXIgdGVtcFBhdGggPSBwYXRoLmpvaW4oZm9sZGVyUGF0aCwgZmlsZSk7XG5cdFx0aWYoZnMuc3RhdFN5bmModGVtcFBhdGgpLmlzRGlyZWN0b3J5KCkpe1xuXHRcdFx0ZGVsZXRlRm9sZGVyKHRlbXBQYXRoKTtcblx0XHR9ZWxzZXtcblx0XHRcdGZzLnVubGlua1N5bmModGVtcFBhdGgpO1xuXHRcdH1cblx0fSk7XG5cdGZzLnJtZGlyU3luYyhmb2xkZXJQYXRoKTtcbn1cbmZ1bmN0aW9uIGVuY3J5cHRGaWxlKGlucHV0UGF0aCwgZGVzdGluYXRpb25QYXRoLCBwYXNzd29yZCl7XG5cdGlmKCFmcy5leGlzdHNTeW5jKHBhdGguZGlybmFtZShkZXN0aW5hdGlvblBhdGgpKSl7XG5cdFx0ZnMubWtkaXJTeW5jKHBhdGguZGlybmFtZShkZXN0aW5hdGlvblBhdGgpKTtcblx0fVxuXHRpZighZnMuZXhpc3RzU3luYyhkZXN0aW5hdGlvblBhdGgpKXtcblx0XHRmcy53cml0ZUZpbGVTeW5jKGRlc3RpbmF0aW9uUGF0aCxcIlwiKTtcblx0fVxuXHR2YXIgd3MgPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0aW5hdGlvblBhdGgsIHthdXRvQ2xvc2U6IGZhbHNlfSk7XG5cdHZhciBrZXlTYWx0ICAgICAgID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDMyKTtcblx0dmFyIGtleSAgICAgICAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwga2V5U2FsdCwgMTAwMDAsIDMyLCAnc2hhNTEyJyk7XG5cblx0dmFyIGFhZFNhbHQgICAgICAgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoMzIpO1xuXHR2YXIgYWFkICAgICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBhYWRTYWx0LCAxMDAwMCwgMzIsICdzaGE1MTInKTtcblxuXHR2YXIgc2FsdCAgICAgICAgICA9IEJ1ZmZlci5jb25jYXQoW2tleVNhbHQsIGFhZFNhbHRdKTtcblx0dmFyIGl2ICAgICAgICAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwgc2FsdCwgMTAwMDAsIDEyLCAnc2hhNTEyJyk7XG5cblx0dmFyIGNpcGhlciAgICAgICAgPSBjcnlwdG8uY3JlYXRlQ2lwaGVyaXYoYWxnb3JpdGhtLCBrZXksIGl2KTtcblx0Y2lwaGVyLnNldEFBRChhYWQpO1xuXG5cdGFyY2hpdmVyLnppcChpbnB1dFBhdGgsIGNpcGhlciwgZnVuY3Rpb24gKGVyciwgY2lwaGVyU3RyZWFtKSB7XG5cdFx0Y2lwaGVyU3RyZWFtLm9uKFwiZGF0YVwiLCBmdW5jdGlvbiAoY2h1bmspIHtcblx0XHRcdHdzLndyaXRlKGNodW5rKVxuXHRcdH0pO1xuXHRcdGNpcGhlclN0cmVhbS5vbignZW5kJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0dmFyIHRhZyA9IGNpcGhlci5nZXRBdXRoVGFnKCk7XG5cdFx0XHR2YXIgZGF0YVRvQXBwZW5kID0gQnVmZmVyLmNvbmNhdChbc2FsdCwgdGFnXSk7XG5cdFx0XHR3cy53cml0ZShkYXRhVG9BcHBlbmQsIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0aWYoZXJyKSB7XG5cdFx0XHRcdFx0dGhyb3cgZXJyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHdzLmNsb3NlKCk7XG5cdFx0XHRcdGZzLmxzdGF0KGlucHV0UGF0aCwgZnVuY3Rpb24gKGVyciwgc3RhdHMpIHtcblx0XHRcdFx0XHRpZihlcnIpe1xuXHRcdFx0XHRcdFx0dGhyb3cgZXJyO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZihzdGF0cy5pc0RpcmVjdG9yeSgpKXtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiZGVsZXRlIGZvbGRlclwiKTtcblx0XHRcdFx0XHRcdGRlbGV0ZUZvbGRlcihpbnB1dFBhdGgpO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coXCJ1bmxpbmtcIik7XG5cdFx0XHRcdFx0XHRmcy51bmxpbmtTeW5jKGlucHV0UGF0aCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiRW5kXCIpXG5cdFx0XHRcdH0pXG5cdFx0XHR9KVxuXHRcdH0pO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gZGVjcnlwdEZpbGUoZW5jcnlwdGVkSW5wdXRQYXRoLCB0ZW1wRm9sZGVyLCBwYXNzd29yZCwgY2FsbGJhY2spIHtcblx0Y29uc3Qgc3RhdHMgICAgICAgICAgID0gZnMuc3RhdFN5bmMoZW5jcnlwdGVkSW5wdXRQYXRoKTtcblx0Y29uc3QgZmlsZVNpemVJbkJ5dGVzID0gc3RhdHMuc2l6ZTtcblx0Y29uc3QgZmQgICAgICAgICAgICAgID0gZnMub3BlblN5bmMoZW5jcnlwdGVkSW5wdXRQYXRoLCBcInJcIik7XG5cdHZhciBlbmNyeXB0ZWRBdXRoRGF0YSA9IEJ1ZmZlci5hbGxvYyg4MCk7XG5cblx0ZnMucmVhZFN5bmMoZmQsIGVuY3J5cHRlZEF1dGhEYXRhLCAwLCA4MCwgZmlsZVNpemVJbkJ5dGVzIC0gODApO1xuXHR2YXIgc2FsdCAgICAgICA9IGVuY3J5cHRlZEF1dGhEYXRhLnNsaWNlKDAsIDY0KTtcblx0dmFyIGtleVNhbHQgICAgPSBzYWx0LnNsaWNlKDAsIDMyKTtcblx0dmFyIGFhZFNhbHQgICAgPSBzYWx0LnNsaWNlKC0zMik7XG5cblx0dmFyIGl2ICAgICAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwgc2FsdCwgMTAwMDAsIDEyLCAnc2hhNTEyJyk7XG5cdHZhciBrZXkgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIGtleVNhbHQsIDEwMDAwLCAzMiwgJ3NoYTUxMicpO1xuXHR2YXIgYWFkICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBhYWRTYWx0LCAxMDAwMCwgMzIsICdzaGE1MTInKTtcblx0dmFyIHRhZyAgICAgICAgPSBlbmNyeXB0ZWRBdXRoRGF0YS5zbGljZSgtMTYpO1xuXG5cdHZhciBkZWNpcGhlciAgID0gY3J5cHRvLmNyZWF0ZURlY2lwaGVyaXYoYWxnb3JpdGhtLCBrZXksIGl2KTtcblxuXHRkZWNpcGhlci5zZXRBQUQoYWFkKTtcblx0ZGVjaXBoZXIuc2V0QXV0aFRhZyh0YWcpO1xuXHR2YXIgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGVuY3J5cHRlZElucHV0UGF0aCwge3N0YXJ0OiAwLCBlbmQ6IGZpbGVTaXplSW5CeXRlcyAtIDgxfSk7XG5cdGlmKCFmcy5leGlzdHNTeW5jKHRlbXBGb2xkZXIpKXtcblx0XHRmcy5ta2RpclN5bmModGVtcEZvbGRlcik7XG5cdH1cblx0dmFyIHRlbXBBcmNoaXZlUGF0aCA9IHBhdGguam9pbih0ZW1wRm9sZGVyLCBwYXRoLmJhc2VuYW1lKGVuY3J5cHRlZElucHV0UGF0aCkrXCIuemlwXCIpO1xuXHRpZighZnMuZXhpc3RzU3luYyh0ZW1wQXJjaGl2ZVBhdGgpKXtcblx0XHRmcy53cml0ZUZpbGVTeW5jKHRlbXBBcmNoaXZlUGF0aCk7XG5cdH1cblx0dmFyIHdzID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0odGVtcEFyY2hpdmVQYXRoLCB7YXV0b0Nsb3NlOiBmYWxzZX0pO1xuXHR3cy5vbihcImZpbmlzaFwiLCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0aWYoZXJyKXtcblx0XHRcdHRocm93IGVycjtcblx0XHR9ZWxzZXtcblx0XHRcdHdzLmNsb3NlKCk7XG5cdFx0XHQvLyBkZWxldGVGb2xkZXIodGVtcEZvbGRlcik7XG5cdFx0XHR2YXIgbmV3UGF0aCA9IHBhdGguam9pbihwYXRoLm5vcm1hbGl6ZShlbmNyeXB0ZWRJbnB1dFBhdGgrXCIvLi5cIiksIGVuY29kZShjcnlwdG8ucmFuZG9tQnl0ZXMoMzIpKSk7XG5cdFx0XHRmcy5yZW5hbWVTeW5jKGVuY3J5cHRlZElucHV0UGF0aCwgbmV3UGF0aCk7XG5cdFx0XHRmcy51bmxpbmtTeW5jKG5ld1BhdGgpO1xuXHRcdFx0Ly8gZnMudW5saW5rU3luYyh0ZW1wQXJjaGl2ZVBhdGgpO1xuXHRcdFx0Y2FsbGJhY2sobnVsbCwgdGVtcEFyY2hpdmVQYXRoKTtcblxuXHRcdH1cblx0fSk7XG5cdHJzLnBpcGUoZGVjaXBoZXIpLnBpcGUod3MpO1xuXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVBza0hhc2goZGF0YSl7XG5cdHZhciBoYXNoNTEyID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTUxMicpO1xuXHR2YXIgaGFzaDI1NiA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGEyNTYnKTtcblx0aGFzaDUxMi51cGRhdGUoZGF0YSk7XG5cdGhhc2gyNTYudXBkYXRlKGhhc2g1MTIuZGlnZXN0KCkpO1xuXHRyZXR1cm4gaGFzaDI1Ni5kaWdlc3QoKTtcbn1cblxuZnVuY3Rpb24gaXNKc29uKGRhdGEpe1xuXHR0cnl7XG5cdFx0SlNPTi5wYXJzZShkYXRhKTtcblx0fWNhdGNoKGUpe1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVTYWx0KGlucHV0RGF0YSwgc2FsdExlbil7XG5cdHZhciBoYXNoICAgPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhNTEyJyk7XG5cdGhhc2gudXBkYXRlKGlucHV0RGF0YSk7XG5cdHZhciBkaWdlc3QgPSBCdWZmZXIuZnJvbShoYXNoLmRpZ2VzdCgnaGV4JyksICdiaW5hcnknKTtcblxuXHRyZXR1cm4gZGlnZXN0LnNsaWNlKDAsIHNhbHRMZW4pO1xufVxuXG5mdW5jdGlvbiBlbmNyeXB0KGRhdGEsIHBhc3N3b3JkKXtcblx0dmFyIGtleVNhbHQgICAgICAgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoMzIpO1xuXHR2YXIga2V5ICAgICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBrZXlTYWx0LCAxMDAwMCwgMzIsICdzaGE1MTInKTtcblxuXHR2YXIgYWFkU2FsdCAgICAgICA9IGNyeXB0by5yYW5kb21CeXRlcygzMik7XG5cdHZhciBhYWQgICAgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIGFhZFNhbHQsIDEwMDAwLCAzMiwgJ3NoYTUxMicpO1xuXG5cdHZhciBzYWx0ICAgICAgICAgID0gQnVmZmVyLmNvbmNhdChba2V5U2FsdCwgYWFkU2FsdF0pO1xuXHR2YXIgaXYgICAgICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBzYWx0LCAxMDAwMCwgMTIsICdzaGE1MTInKTtcblxuXHR2YXIgY2lwaGVyICAgICAgICA9IGNyeXB0by5jcmVhdGVDaXBoZXJpdihhbGdvcml0aG0sIGtleSwgaXYpO1xuXHRjaXBoZXIuc2V0QUFEKGFhZCk7XG5cdHZhciBlbmNyeXB0ZWRUZXh0ID0gY2lwaGVyLnVwZGF0ZShkYXRhLCdiaW5hcnknKTtcblx0dmFyIGZpbmFsID0gQnVmZmVyLmZyb20oY2lwaGVyLmZpbmFsKCdiaW5hcnknKSwnYmluYXJ5Jyk7XG5cdHZhciB0YWcgPSBjaXBoZXIuZ2V0QXV0aFRhZygpO1xuXG5cdGVuY3J5cHRlZFRleHQgPSBCdWZmZXIuY29uY2F0KFtlbmNyeXB0ZWRUZXh0LCBmaW5hbF0pO1xuXG5cdHJldHVybiBCdWZmZXIuY29uY2F0KFtzYWx0LCBlbmNyeXB0ZWRUZXh0LCB0YWddKTtcbn1cblxuZnVuY3Rpb24gZGVjcnlwdChlbmNyeXB0ZWREYXRhLCBwYXNzd29yZCl7XG5cdHZhciBzYWx0ICAgICAgID0gZW5jcnlwdGVkRGF0YS5zbGljZSgwLCA2NCk7XG5cdHZhciBrZXlTYWx0ICAgID0gc2FsdC5zbGljZSgwLCAzMik7XG5cdHZhciBhYWRTYWx0ICAgID0gc2FsdC5zbGljZSgtMzIpO1xuXG5cdHZhciBpdiAgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIHNhbHQsIDEwMDAwLCAxMiwgJ3NoYTUxMicpO1xuXHR2YXIga2V5ICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBrZXlTYWx0LCAxMDAwMCwgMzIsICdzaGE1MTInKTtcblx0dmFyIGFhZCAgICAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwgYWFkU2FsdCwgMTAwMDAsIDMyLCAnc2hhNTEyJyk7XG5cblx0dmFyIGNpcGhlcnRleHQgPSBlbmNyeXB0ZWREYXRhLnNsaWNlKDY0LCBlbmNyeXB0ZWREYXRhLmxlbmd0aCAtIDE2KTtcblx0dmFyIHRhZyAgICAgICAgPSBlbmNyeXB0ZWREYXRhLnNsaWNlKC0xNik7XG5cblx0dmFyIGRlY2lwaGVyICAgPSBjcnlwdG8uY3JlYXRlRGVjaXBoZXJpdihhbGdvcml0aG0sIGtleSwgaXYpO1xuXHRkZWNpcGhlci5zZXRBdXRoVGFnKHRhZyk7XG5cdGRlY2lwaGVyLnNldEFBRChhYWQpO1xuXG5cdHZhciBwbGFpbnRleHQgID0gQnVmZmVyLmZyb20oZGVjaXBoZXIudXBkYXRlKGNpcGhlcnRleHQsICdiaW5hcnknKSwgJ2JpbmFyeScpO1xuXHR2YXIgZmluYWwgICAgICA9IEJ1ZmZlci5mcm9tKGRlY2lwaGVyLmZpbmFsKCdiaW5hcnknKSwgJ2JpbmFyeScpO1xuXHRwbGFpbnRleHQgICAgICA9IEJ1ZmZlci5jb25jYXQoW3BsYWludGV4dCwgZmluYWxdKTtcblxuXHRyZXR1cm4gcGxhaW50ZXh0O1xufVxuXG5cbmZ1bmN0aW9uIGRlcml2ZUtleShwYXNzd29yZCwgaXRlcmF0aW9ucywgZGtMZW4pIHtcblx0aXRlcmF0aW9ucyA9IGl0ZXJhdGlvbnMgfHwgMTAwMDA7XG5cdGRrTGVuICAgICAgPSBka0xlbiB8fCAzMjtcblx0dmFyIHNhbHQgICA9IGdlbmVyYXRlU2FsdChwYXNzd29yZCwgMzIpO1xuXHR2YXIgZGsgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIHNhbHQsIGl0ZXJhdGlvbnMsIGRrTGVuLCAnc2hhNTEyJyk7XG5cdHJldHVybiBCdWZmZXIuZnJvbShkayk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRjcmVhdGVQc2tIYXNoLFxuXHRlbmNyeXB0LFxuXHRlbmNyeXB0RmlsZSxcblx0ZGVjcnlwdCxcblx0ZGVjcnlwdEZpbGUsXG5cdGRlbGV0ZUZvbGRlcixcblx0ZGVyaXZlS2V5LFxuXHRlbmNvZGUsXG5cdGlzSnNvbixcbn07XG5cblxuIiwidmFyIHN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpXG5cblxuZnVuY3Rpb24gaXNTdHJlYW0gKG9iaikge1xuXHRyZXR1cm4gb2JqIGluc3RhbmNlb2Ygc3RyZWFtLlN0cmVhbVxufVxuXG5cbmZ1bmN0aW9uIGlzUmVhZGFibGUgKG9iaikge1xuXHRyZXR1cm4gaXNTdHJlYW0ob2JqKSAmJiB0eXBlb2Ygb2JqLl9yZWFkID09ICdmdW5jdGlvbicgJiYgdHlwZW9mIG9iai5fcmVhZGFibGVTdGF0ZSA9PSAnb2JqZWN0J1xufVxuXG5cbmZ1bmN0aW9uIGlzV3JpdGFibGUgKG9iaikge1xuXHRyZXR1cm4gaXNTdHJlYW0ob2JqKSAmJiB0eXBlb2Ygb2JqLl93cml0ZSA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBvYmouX3dyaXRhYmxlU3RhdGUgPT0gJ29iamVjdCdcbn1cblxuXG5mdW5jdGlvbiBpc0R1cGxleCAob2JqKSB7XG5cdHJldHVybiBpc1JlYWRhYmxlKG9iaikgJiYgaXNXcml0YWJsZShvYmopXG59XG5cblxubW9kdWxlLmV4cG9ydHMgICAgICAgICAgICA9IGlzU3RyZWFtO1xubW9kdWxlLmV4cG9ydHMuaXNSZWFkYWJsZSA9IGlzUmVhZGFibGU7XG5tb2R1bGUuZXhwb3J0cy5pc1dyaXRhYmxlID0gaXNXcml0YWJsZTtcbm1vZHVsZS5leHBvcnRzLmlzRHVwbGV4ICAgPSBpc0R1cGxleDsiLCIvKlxuIFNpZ25TZW5zIGhlbHBlciBmdW5jdGlvbnNcbiAqL1xuY29uc3QgY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG5cbmV4cG9ydHMud2lwZU91dHNpZGVQYXlsb2FkID0gZnVuY3Rpb24gd2lwZU91dHNpZGVQYXlsb2FkKGhhc2hTdHJpbmdIZXhhLCBwb3MsIHNpemUpe1xuICAgIHZhciByZXN1bHQ7XG4gICAgdmFyIHN6ID0gaGFzaFN0cmluZ0hleGEubGVuZ3RoO1xuXG4gICAgdmFyIGVuZCA9IChwb3MgKyBzaXplKSAlIHN6O1xuXG4gICAgaWYocG9zIDwgZW5kKXtcbiAgICAgICAgcmVzdWx0ID0gJzAnLnJlcGVhdChwb3MpICsgIGhhc2hTdHJpbmdIZXhhLnN1YnN0cmluZyhwb3MsIGVuZCkgKyAnMCcucmVwZWF0KHN6IC0gZW5kKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IGhhc2hTdHJpbmdIZXhhLnN1YnN0cmluZygwLCBlbmQpICsgJzAnLnJlcGVhdChwb3MgLSBlbmQpICsgaGFzaFN0cmluZ0hleGEuc3Vic3RyaW5nKHBvcywgc3opO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5cblxuZXhwb3J0cy5leHRyYWN0UGF5bG9hZCA9IGZ1bmN0aW9uIGV4dHJhY3RQYXlsb2FkKGhhc2hTdHJpbmdIZXhhLCBwb3MsIHNpemUpe1xuICAgIHZhciByZXN1bHQ7XG5cbiAgICB2YXIgc3ogPSBoYXNoU3RyaW5nSGV4YS5sZW5ndGg7XG4gICAgdmFyIGVuZCA9IChwb3MgKyBzaXplKSAlIHN6O1xuXG4gICAgaWYoIHBvcyA8IGVuZCl7XG4gICAgICAgIHJlc3VsdCA9IGhhc2hTdHJpbmdIZXhhLnN1YnN0cmluZyhwb3MsIHBvcyArIHNpemUpO1xuICAgIH0gZWxzZXtcblxuICAgICAgICBpZigwICE9IGVuZCl7XG4gICAgICAgICAgICByZXN1bHQgPSBoYXNoU3RyaW5nSGV4YS5zdWJzdHJpbmcoMCwgZW5kKVxuICAgICAgICB9ICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ICs9IGhhc2hTdHJpbmdIZXhhLnN1YnN0cmluZyhwb3MsIHN6KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuXG5cbmV4cG9ydHMuZmlsbFBheWxvYWQgPSBmdW5jdGlvbiBmaWxsUGF5bG9hZChwYXlsb2FkLCBwb3MsIHNpemUpe1xuICAgIHZhciBzeiA9IDY0O1xuICAgIHZhciByZXN1bHQgPSBcIlwiO1xuXG4gICAgdmFyIGVuZCA9IChwb3MgKyBzaXplKSAlIHN6O1xuXG4gICAgaWYoIHBvcyA8IGVuZCl7XG4gICAgICAgIHJlc3VsdCA9ICcwJy5yZXBlYXQocG9zKSArIHBheWxvYWQgKyAnMCcucmVwZWF0KHN6IC0gZW5kKTtcbiAgICB9IGVsc2V7XG4gICAgICAgIHJlc3VsdCA9IHBheWxvYWQuc3Vic3RyaW5nKDAsZW5kKTtcbiAgICAgICAgcmVzdWx0ICs9ICcwJy5yZXBlYXQocG9zIC0gZW5kKTtcbiAgICAgICAgcmVzdWx0ICs9IHBheWxvYWQuc3Vic3RyaW5nKGVuZCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cblxuXG5leHBvcnRzLmdlbmVyYXRlUG9zSGFzaFhUaW1lcyA9IGZ1bmN0aW9uIGdlbmVyYXRlUG9zSGFzaFhUaW1lcyhidWZmZXIsIHBvcywgc2l6ZSwgY291bnQpeyAvL2dlbmVyYXRlIHBvc2l0aW9uYWwgaGFzaFxuICAgIHZhciByZXN1bHQgID0gYnVmZmVyLnRvU3RyaW5nKFwiaGV4XCIpO1xuXG4gICAgLyppZihwb3MgIT0gLTEgKVxuICAgICAgICByZXN1bHRbcG9zXSA9IDA7ICovXG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKyl7XG4gICAgICAgIHZhciBoYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTI1NicpO1xuICAgICAgICByZXN1bHQgPSBleHBvcnRzLndpcGVPdXRzaWRlUGF5bG9hZChyZXN1bHQsIHBvcywgc2l6ZSk7XG4gICAgICAgIGhhc2gudXBkYXRlKHJlc3VsdCk7XG4gICAgICAgIHJlc3VsdCA9IGhhc2guZGlnZXN0KCdoZXgnKTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cG9ydHMud2lwZU91dHNpZGVQYXlsb2FkKHJlc3VsdCwgcG9zLCBzaXplKTtcbn1cblxuZXhwb3J0cy5oYXNoU3RyaW5nQXJyYXkgPSBmdW5jdGlvbiAoY291bnRlciwgYXJyLCBwYXlsb2FkU2l6ZSl7XG5cbiAgICBjb25zdCBoYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTI1NicpO1xuICAgIHZhciByZXN1bHQgPSBjb3VudGVyLnRvU3RyaW5nKDE2KTtcblxuICAgIGZvcih2YXIgaSA9IDAgOyBpIDwgNjQ7IGkrKyl7XG4gICAgICAgIHJlc3VsdCArPSBleHBvcnRzLmV4dHJhY3RQYXlsb2FkKGFycltpXSxpLCBwYXlsb2FkU2l6ZSk7XG4gICAgfVxuXG4gICAgaGFzaC51cGRhdGUocmVzdWx0KTtcbiAgICB2YXIgcmVzdWx0ID0gaGFzaC5kaWdlc3QoJ2hleCcpO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cblxuXG5cblxuXG5mdW5jdGlvbiBkdW1wTWVtYmVyKG9iail7XG4gICAgdmFyIHR5cGUgPSBBcnJheS5pc0FycmF5KG9iaikgPyBcImFycmF5XCIgOiB0eXBlb2Ygb2JqO1xuICAgIGlmKG9iaiA9PT0gbnVsbCl7XG4gICAgICAgIHJldHVybiBcIm51bGxcIjtcbiAgICB9XG4gICAgaWYob2JqID09PSB1bmRlZmluZWQpe1xuICAgICAgICByZXR1cm4gXCJ1bmRlZmluZWRcIjtcbiAgICB9XG5cbiAgICBzd2l0Y2godHlwZSl7XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOnJldHVybiBvYmoudG9TdHJpbmcoKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJvYmplY3RcIjogcmV0dXJuIGV4cG9ydHMuZHVtcE9iamVjdEZvckhhc2hpbmcob2JqKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJib29sZWFuXCI6IHJldHVybiAgb2JqPyBcInRydWVcIjogXCJmYWxzZVwiOyBicmVhaztcbiAgICAgICAgY2FzZSBcImFycmF5XCI6XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gXCJcIjtcbiAgICAgICAgICAgIGZvcih2YXIgaT0wOyBpIDwgb2JqLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gZXhwb3J0cy5kdW1wT2JqZWN0Rm9ySGFzaGluZyhvYmpbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVHlwZSBcIiArICB0eXBlICsgXCIgY2Fubm90IGJlIGNyeXB0b2dyYXBoaWNhbGx5IGRpZ2VzdGVkXCIpO1xuICAgIH1cblxufVxuXG5cbmV4cG9ydHMuZHVtcE9iamVjdEZvckhhc2hpbmcgPSBmdW5jdGlvbihvYmope1xuICAgIHZhciByZXN1bHQgPSBcIlwiO1xuXG4gICAgaWYob2JqID09PSBudWxsKXtcbiAgICAgICAgcmV0dXJuIFwibnVsbFwiO1xuICAgIH1cbiAgICBpZihvYmogPT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHJldHVybiBcInVuZGVmaW5lZFwiO1xuICAgIH1cblxuICAgIHZhciBiYXNpY1R5cGVzID0ge1xuICAgICAgICBcImFycmF5XCIgICAgIDogdHJ1ZSxcbiAgICAgICAgXCJudW1iZXJcIiAgICA6IHRydWUsXG4gICAgICAgIFwiYm9vbGVhblwiICAgOiB0cnVlLFxuICAgICAgICBcInN0cmluZ1wiICAgIDogdHJ1ZSxcbiAgICAgICAgXCJvYmplY3RcIiAgICA6IGZhbHNlXG4gICAgfVxuXG4gICAgdmFyIHR5cGUgPSBBcnJheS5pc0FycmF5KG9iaikgPyBcImFycmF5XCIgOiB0eXBlb2Ygb2JqO1xuICAgIGlmKCBiYXNpY1R5cGVzW3R5cGVdKXtcbiAgICAgICAgcmV0dXJuIGR1bXBNZW1iZXIob2JqKTtcbiAgICB9XG5cbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG4gICAga2V5cy5zb3J0KCk7XG5cblxuICAgIGZvcih2YXIgaT0wOyBpIDwga2V5cy5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHJlc3VsdCArPSBkdW1wTWVtYmVyKGtleXNbaV0pO1xuICAgICAgICByZXN1bHQgKz0gZHVtcE1lbWJlcihvYmpba2V5c1tpXV0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cblxuZXhwb3J0cy5oYXNoVmFsdWVzICA9IGZ1bmN0aW9uICh2YWx1ZXMpe1xuICAgIGNvbnN0IGhhc2ggPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMjU2Jyk7XG4gICAgdmFyIHJlc3VsdCA9IGV4cG9ydHMuZHVtcE9iamVjdEZvckhhc2hpbmcodmFsdWVzKTtcbiAgICBoYXNoLnVwZGF0ZShyZXN1bHQpO1xuICAgIHJldHVybiBoYXNoLmRpZ2VzdCgnaGV4Jyk7XG59O1xuXG5leHBvcnRzLmdldEpTT05Gcm9tU2lnbmF0dXJlID0gZnVuY3Rpb24gZ2V0SlNPTkZyb21TaWduYXR1cmUoc2lnbmF0dXJlLCBzaXplKXtcbiAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICBwcm9vZjpbXVxuICAgIH07XG4gICAgdmFyIGEgPSBzaWduYXR1cmUuc3BsaXQoXCI6XCIpO1xuICAgIHJlc3VsdC5hZ2VudCAgICAgICAgPSBhWzBdO1xuICAgIHJlc3VsdC5jb3VudGVyICAgICAgPSAgcGFyc2VJbnQoYVsxXSwgXCJoZXhcIik7XG4gICAgcmVzdWx0Lm5leHRQdWJsaWMgICA9ICBhWzJdO1xuXG4gICAgdmFyIHByb29mID0gYVszXVxuXG5cbiAgICBpZihwcm9vZi5sZW5ndGgvc2l6ZSAhPSA2NCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHNpZ25hdHVyZSBcIiArIHByb29mKTtcbiAgICB9XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKyl7XG4gICAgICAgIHJlc3VsdC5wcm9vZi5wdXNoKGV4cG9ydHMuZmlsbFBheWxvYWQocHJvb2Yuc3Vic3RyaW5nKGkgKiBzaXplLChpKzEpICogc2l6ZSApLCBpLCBzaXplKSlcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnRzLmNyZWF0ZVNpZ25hdHVyZSA9IGZ1bmN0aW9uIChhZ2VudCxjb3VudGVyLCBuZXh0UHVibGljLCBhcnIsIHNpemUpe1xuICAgIHZhciByZXN1bHQgPSBcIlwiO1xuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHJlc3VsdCArPSBleHBvcnRzLmV4dHJhY3RQYXlsb2FkKGFycltpXSwgaSAsIHNpemUpO1xuICAgIH1cblxuICAgIHJldHVybiBhZ2VudCArIFwiOlwiICsgY291bnRlciArIFwiOlwiICsgbmV4dFB1YmxpYyArIFwiOlwiICsgcmVzdWx0O1xufSIsIiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRcdFx0XHRcdGJlZXNIZWFsZXI6IHJlcXVpcmUoXCIuL2xpYi9iZWVzSGVhbGVyXCIpLFxuXHRcdFx0XHRcdHNvdW5kUHViU3ViOiByZXF1aXJlKFwiLi9saWIvc291bmRQdWJTdWJcIikuc291bmRQdWJTdWIsXG5cdFx0XHRcdFx0Zm9sZGVyTVE6IHJlcXVpcmUoXCIuL2xpYi9mb2xkZXJNUVwiKVxufTsiLCJmdW5jdGlvbiBRdWV1ZUVsZW1lbnQoY29udGVudCkge1xuXHR0aGlzLmNvbnRlbnQgPSBjb250ZW50O1xuXHR0aGlzLm5leHQgPSBudWxsO1xufVxuXG5mdW5jdGlvbiBRdWV1ZSgpIHtcblx0dGhpcy5oZWFkID0gbnVsbDtcblx0dGhpcy50YWlsID0gbnVsbDtcblxuXHR0aGlzLnB1c2ggPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRsZXQgbmV3RWxlbWVudCA9IG5ldyBRdWV1ZUVsZW1lbnQodmFsdWUpO1xuXHRcdGlmICghdGhpcy5oZWFkKSB7XG5cdFx0XHR0aGlzLmhlYWQgPSBuZXdFbGVtZW50O1xuXHRcdFx0dGhpcy50YWlsID0gbmV3RWxlbWVudDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy50YWlsLm5leHQgPSBuZXdFbGVtZW50O1xuXHRcdFx0dGhpcy50YWlsID0gbmV3RWxlbWVudFxuXHRcdH1cblx0fTtcblxuXHR0aGlzLnBvcCA9IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAoIXRoaXMuaGVhZCkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdGNvbnN0IGhlYWRDb3B5ID0gdGhpcy5oZWFkO1xuXHRcdHRoaXMuaGVhZCA9IHRoaXMuaGVhZC5uZXh0O1xuXHRcdHJldHVybiBoZWFkQ29weS5jb250ZW50O1xuXHR9O1xuXG5cdHRoaXMuZnJvbnQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuaGVhZCA/IHRoaXMuaGVhZC5jb250ZW50IDogdW5kZWZpbmVkO1xuXHR9O1xuXG5cdHRoaXMuaXNFbXB0eSA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5oZWFkID09IG51bGw7XG5cdH07XG5cblx0dGhpc1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qICgpIHtcblx0XHRsZXQgaGVhZCA9IHRoaXMuaGVhZDtcblx0XHR3aGlsZShoZWFkICE9PSBudWxsKSB7XG5cdFx0XHR5aWVsZCBoZWFkLmNvbnRlbnQ7XG5cdFx0XHRoZWFkID0gaGVhZC5uZXh0O1xuXHRcdH1cblx0fS5iaW5kKHRoaXMpO1xufVxuXG5RdWV1ZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG5cdGxldCBzdHJpbmdpZmllZFF1ZXVlID0gJyc7XG5cdGxldCBpdGVyYXRvciA9IHRoaXMuaGVhZDtcblx0d2hpbGUgKGl0ZXJhdG9yKSB7XG5cdFx0c3RyaW5naWZpZWRRdWV1ZSArPSBgJHtKU09OLnN0cmluZ2lmeShpdGVyYXRvci5jb250ZW50KX0gYDtcblx0XHRpdGVyYXRvciA9IGl0ZXJhdG9yLm5leHQ7XG5cdH1cblx0cmV0dXJuIHN0cmluZ2lmaWVkUXVldWVcbn07XG5cblF1ZXVlLnByb3RvdHlwZS5pbnNwZWN0ID0gUXVldWUucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXVlOyIsIlxuLypcbiAgICBQcmVwYXJlIHRoZSBzdGF0ZSBvZiBhIHN3YXJtIHRvIGJlIHNlcmlhbGlzZWRcbiovXG5cbmV4cG9ydHMuYXNKU09OID0gZnVuY3Rpb24odmFsdWVPYmplY3QsIHBoYXNlTmFtZSwgYXJncywgY2FsbGJhY2spe1xuXG4gICAgICAgIHZhciB2YWx1ZU9iamVjdCA9IHZhbHVlT2JqZWN0LnZhbHVlT2YoKTtcbiAgICAgICAgdmFyIHJlcyA9IHt9O1xuICAgICAgICByZXMucHVibGljVmFycyAgICAgICAgICA9IHZhbHVlT2JqZWN0LnB1YmxpY1ZhcnM7XG4gICAgICAgIHJlcy5wcml2YXRlVmFycyAgICAgICAgID0gdmFsdWVPYmplY3QucHJpdmF0ZVZhcnM7XG4gICAgICAgIHJlcy5tZXRhICAgICAgICAgICAgICAgID0ge307XG5cbiAgICAgICAgcmVzLm1ldGEuc3dhcm1UeXBlTmFtZSAgPSB2YWx1ZU9iamVjdC5tZXRhLnN3YXJtVHlwZU5hbWU7XG4gICAgICAgIHJlcy5tZXRhLnN3YXJtSWQgICAgICAgID0gdmFsdWVPYmplY3QubWV0YS5zd2FybUlkO1xuICAgICAgICByZXMubWV0YS50YXJnZXQgICAgICAgICA9IHZhbHVlT2JqZWN0Lm1ldGEudGFyZ2V0O1xuXG4gICAgICAgIGlmKCFwaGFzZU5hbWUpe1xuICAgICAgICAgICAgcmVzLm1ldGEuY29tbWFuZCAgICA9IFwic3RvcmVkXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXMubWV0YS5waGFzZU5hbWUgID0gcGhhc2VOYW1lO1xuICAgICAgICAgICAgcmVzLm1ldGEuYXJncyAgICAgICA9IGFyZ3M7XG4gICAgICAgICAgICByZXMubWV0YS5jb21tYW5kICAgID0gdmFsdWVPYmplY3QubWV0YS5jb21tYW5kIHx8IFwiZXhlY3V0ZVN3YXJtUGhhc2VcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcy5tZXRhLndhaXRTdGFjayAgPSB2YWx1ZU9iamVjdC5tZXRhLndhaXRTdGFjazsgLy9UT0RPOiB0aGluayBpZiBpcyBub3QgYmV0dGVyIHRvIGJlIGRlZXAgY2xvbmVkIGFuZCBub3QgcmVmZXJlbmNlZCEhIVxuXG4gICAgICAgIGlmKGNhbGxiYWNrKXtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcImFzSlNPTjpcIiwgcmVzLCB2YWx1ZU9iamVjdCk7XG4gICAgICAgIHJldHVybiByZXM7XG59XG5cbmV4cG9ydHMuanNvblRvTmF0aXZlID0gZnVuY3Rpb24oc2VyaWFsaXNlZFZhbHVlcywgcmVzdWx0KXtcblxuICAgIGZvcih2YXIgdiBpbiBzZXJpYWxpc2VkVmFsdWVzLnB1YmxpY1ZhcnMpe1xuICAgICAgICByZXN1bHQucHVibGljVmFyc1t2XSA9IHNlcmlhbGlzZWRWYWx1ZXMucHVibGljVmFyc1t2XTtcblxuICAgIH07XG4gICAgZm9yKHZhciB2IGluIHNlcmlhbGlzZWRWYWx1ZXMucHJpdmF0ZVZhcnMpe1xuICAgICAgICByZXN1bHQucHJpdmF0ZVZhcnNbdl0gPSBzZXJpYWxpc2VkVmFsdWVzLnByaXZhdGVWYXJzW3ZdO1xuICAgIH07XG5cbiAgICBmb3IodmFyIHYgaW4gc2VyaWFsaXNlZFZhbHVlcy5tZXRhKXtcbiAgICAgICAgcmVzdWx0Lm1ldGFbdl0gPSBzZXJpYWxpc2VkVmFsdWVzLm1ldGFbdl07XG4gICAgfTtcblxufSIsIlxudmFyIGZzID0gcmVxdWlyZShcImZzXCIpO1xudmFyIHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcbnZhciBiZWVzSGVhbGVyID0gcmVxdWlyZShcIi4vYmVlc0hlYWxlclwiKTtcblxuLy9UT0RPOiBwcmV2ZW50IGEgY2xhc3Mgb2YgcmFjZSBjb25kaXRpb24gdHlwZSBvZiBlcnJvcnMgYnkgc2lnbmFsaW5nIHdpdGggZmlsZXMgbWV0YWRhdGEgdG8gdGhlIHdhdGNoZXIgd2hlbiBpdCBpcyBzYWZlIHRvIGNvbnN1bWVcblxuZnVuY3Rpb24gRm9sZGVyTVEoZm9sZGVyLCBjYWxsYmFjayA9ICgpID0+IHt9KXtcblxuXHRpZih0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIil7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiU2Vjb25kIHBhcmFtZXRlciBzaG91bGQgYmUgYSBjYWxsYmFjayBmdW5jdGlvblwiKTtcblx0fVxuXG5cdGZvbGRlciA9IHBhdGgubm9ybWFsaXplKGZvbGRlcik7XG5cblx0ZnMubWtkaXIoZm9sZGVyLCBmdW5jdGlvbihlcnIsIHJlcyl7XG5cdFx0ZnMuZXhpc3RzKGZvbGRlciwgZnVuY3Rpb24oZXhpc3RzKSB7XG5cdFx0XHRpZiAoZXhpc3RzKSB7XG5cdFx0XHRcdGNhbGxiYWNrKG51bGwsIGZvbGRlcilcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNhbGxiYWNrKGVycik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xuXG5cdGZ1bmN0aW9uIG1rRmlsZU5hbWUoc3dhcm1SYXcpe1xuXHRcdHJldHVybiBwYXRoLm5vcm1hbGl6ZShmb2xkZXIgKyBcIi9cIiArIHN3YXJtUmF3Lm1ldGEuc3dhcm1JZCArIFwiLlwiK3N3YXJtUmF3Lm1ldGEuc3dhcm1UeXBlTmFtZSk7XG5cdH1cblxuXHR0aGlzLmdldEhhbmRsZXIgPSBmdW5jdGlvbigpe1xuXHRcdGlmKHByb2R1Y2VyKXtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk9ubHkgb25lIGNvbnN1bWVyIGlzIGFsbG93ZWQhXCIpO1xuXHRcdH1cblx0XHRwcm9kdWNlciA9IHRydWU7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGFkZFN0cmVhbSA6IGZ1bmN0aW9uKHN0cmVhbSwgY2FsbGJhY2spe1xuXHRcdFx0XHRpZih0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIil7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiU2Vjb25kIHBhcmFtZXRlciBzaG91bGQgYmUgYSBjYWxsYmFjayBmdW5jdGlvblwiKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKCFzdHJlYW0gfHwgIXN0cmVhbS5waXBlIHx8IHR5cGVvZiBzdHJlYW0ucGlwZSAhPT0gXCJmdW5jdGlvblwiKXtcblx0XHRcdFx0XHRjYWxsYmFjayhuZXcgRXJyb3IoXCJTb21ldGhpbmcgd3JvbmcgaGFwcGVuZWRcIikpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IHN3YXJtID0gXCJcIjtcblx0XHRcdFx0c3RyZWFtLm9uKCdkYXRhJywgKGNodW5rKSA9Pntcblx0XHRcdFx0XHRzd2FybSArPSBjaHVuaztcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0c3RyZWFtLm9uKFwiZW5kXCIsICgpID0+IHtcblx0XHRcdFx0XHR3cml0ZUZpbGUobWtGaWxlTmFtZShKU09OLnBhcnNlKHN3YXJtKSksIHN3YXJtLCBjYWxsYmFjayk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHN0cmVhbS5vbihcImVycm9yXCIsIChlcnIpID0+e1xuXHRcdFx0XHRcdGNhbGxiYWNrKGVycik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSxcblx0XHRcdGFkZFN3YXJtIDogZnVuY3Rpb24oc3dhcm0sIGNhbGxiYWNrKXtcblx0XHRcdFx0aWYoIWNhbGxiYWNrKXtcblx0XHRcdFx0XHRjYWxsYmFjayA9ICQkLmRlZmF1bHRFcnJvckhhbmRsaW5nSW1wbGVtZW50YXRpb247XG5cdFx0XHRcdH1lbHNlIGlmKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKXtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTZWNvbmQgcGFyYW1ldGVyIHNob3VsZCBiZSBhIGNhbGxiYWNrIGZ1bmN0aW9uXCIpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YmVlc0hlYWxlci5hc0pTT04oc3dhcm0sbnVsbCwgbnVsbCwgZnVuY3Rpb24oZXJyLCByZXMpe1xuXHRcdFx0XHRcdHdyaXRlRmlsZShta0ZpbGVOYW1lKHJlcyksIEoocmVzKSwgY2FsbGJhY2spO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0sXG5cdFx0XHRzZW5kU3dhcm1Gb3JFeGVjdXRpb246IGZ1bmN0aW9uKHN3YXJtLCBjYWxsYmFjayl7XG5cdFx0XHRcdGlmKCFjYWxsYmFjayl7XG5cdFx0XHRcdFx0Y2FsbGJhY2sgPSAkJC5kZWZhdWx0RXJyb3JIYW5kbGluZ0ltcGxlbWVudGF0aW9uO1xuXHRcdFx0XHR9ZWxzZSBpZih0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIil7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiU2Vjb25kIHBhcmFtZXRlciBzaG91bGQgYmUgYSBjYWxsYmFjayBmdW5jdGlvblwiKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJlZXNIZWFsZXIuYXNKU09OKHN3YXJtLCBzd2FybS5tZXRhLnBoYXNlTmFtZSwgc3dhcm0ubWV0YS5hcmdzLCBmdW5jdGlvbihlcnIsIHJlcyl7XG5cdFx0XHRcdFx0d3JpdGVGaWxlKG1rRmlsZU5hbWUocmVzKSwgSihyZXMpLCBjYWxsYmFjayk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHR0aGlzLnJlZ2lzdGVyQ29uc3VtZXIgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIHNob3VsZERlbGV0ZUFmdGVyUmVhZCA9IHRydWUsIHNob3VsZFdhaXRGb3JNb3JlID0gKCkgPT4gdHJ1ZSkge1xuXHRcdGlmKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKXtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkZpcnN0IHBhcmFtZXRlciBzaG91bGQgYmUgYSBjYWxsYmFjayBmdW5jdGlvblwiKTtcblx0XHR9XG5cdFx0aWYgKGNvbnN1bWVyKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJPbmx5IG9uZSBjb25zdW1lciBpcyBhbGxvd2VkISBcIiArIGZvbGRlcik7XG5cdFx0fVxuXG5cdFx0Y29uc3VtZXIgPSBjYWxsYmFjaztcblx0XHRmcy5ta2Rpcihmb2xkZXIsIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuXHRcdFx0Y29uc3VtZUFsbEV4aXN0aW5nKHNob3VsZERlbGV0ZUFmdGVyUmVhZCwgc2hvdWxkV2FpdEZvck1vcmUpO1xuXHRcdH0pO1xuXHR9O1xuXG5cdHRoaXMud3JpdGVNZXNzYWdlID0gd3JpdGVGaWxlO1xuXG5cdHRoaXMudW5saW5rQ29udGVudCA9IGZ1bmN0aW9uIChtZXNzYWdlSWQsIGNhbGxiYWNrKSB7XG5cdFx0Y29uc3QgbWVzc2FnZVBhdGggPSBwYXRoLmpvaW4oZm9sZGVyLCBtZXNzYWdlSWQpO1xuXG5cdFx0ZnMudW5saW5rKG1lc3NhZ2VQYXRoLCAoZXJyKSA9PiB7XG5cdFx0XHRjYWxsYmFjayhlcnIpO1xuXHR9KTtcblx0fTtcblxuXG5cdC8qIC0tLS0tLS0tLS0tLS0tLS0gcHJvdGVjdGVkICBmdW5jdGlvbnMgKi9cblx0dmFyIGNvbnN1bWVyID0gbnVsbDtcblx0dmFyIHByb2R1Y2VyID0gbnVsbDtcblxuXG5cdGZ1bmN0aW9uIGNvbnN1bWVNZXNzYWdlKGZpbGVuYW1lLCBzaG91bGREZWxldGVBZnRlclJlYWQsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIGZ1bGxQYXRoID0gcGF0aC5ub3JtYWxpemUoZm9sZGVyICsgXCIvXCIgKyBmaWxlbmFtZSk7XG5cdFx0ZnMucmVhZEZpbGUoZnVsbFBhdGgsIFwidXRmOFwiLCBmdW5jdGlvbiAoZXJyLCBkYXRhKSB7XG5cdFx0XHRpZiAoIWVycikge1xuXHRcdFx0XHRpZiAoZGF0YSAhPT0gXCJcIikge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHR2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZGF0YSk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRcdGVyciA9IGVycm9yO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNhbGxiYWNrKGVyciwgbWVzc2FnZSk7XG5cdFx0XHRcdFx0aWYgKHNob3VsZERlbGV0ZUFmdGVyUmVhZCkge1xuXG5cdFx0XHRcdFx0XHRmcy51bmxpbmsoZnVsbFBhdGgsIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuXHRcdFx0XHRcdFx0XHRpZiAoZXJyKSB0aHJvdyBlcnJcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y2FsbGJhY2soZXJyKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNvbnN1bWVBbGxFeGlzdGluZyhzaG91bGREZWxldGVBZnRlclJlYWQsIHNob3VsZFdhaXRGb3JNb3JlKSB7XG5cblx0XHRsZXQgY3VycmVudEZpbGVzID0gW107XG5cblx0XHRmcy5yZWFkZGlyKGZvbGRlciwgJ3V0ZjgnLCBmdW5jdGlvbiAoZXJyLCBmaWxlcykge1xuXHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHQkJC5lcnJvckhhbmRsZXIuZXJyb3IoZXJyKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0Y3VycmVudEZpbGVzID0gZmlsZXM7XG5cdFx0XHRpdGVyYXRlQW5kQ29uc3VtZShmaWxlcyk7XG5cblx0XHR9KTtcblxuXHRcdGZ1bmN0aW9uIHN0YXJ0V2F0Y2hpbmcoKXtcblx0XHRcdGlmIChzaG91bGRXYWl0Rm9yTW9yZSgpKSB7XG5cdFx0XHRcdHdhdGNoRm9sZGVyKHNob3VsZERlbGV0ZUFmdGVyUmVhZCwgc2hvdWxkV2FpdEZvck1vcmUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGl0ZXJhdGVBbmRDb25zdW1lKGZpbGVzLCBjdXJyZW50SW5kZXggPSAwKSB7XG5cdFx0XHRpZiAoY3VycmVudEluZGV4ID09PSBmaWxlcy5sZW5ndGgpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJzdGFydCB3YXRjaGluZ1wiKTtcblx0XHRcdFx0c3RhcnRXYXRjaGluZygpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmIChwYXRoLmV4dG5hbWUoZmlsZXNbY3VycmVudEluZGV4XSkgIT09IGluX3Byb2dyZXNzKSB7XG5cdFx0XHRcdGNvbnN1bWVNZXNzYWdlKGZpbGVzW2N1cnJlbnRJbmRleF0sIHNob3VsZERlbGV0ZUFmdGVyUmVhZCwgKGVyciwgZGF0YSkgPT4ge1xuXHRcdFx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0XHRcdGl0ZXJhdGVBbmRDb25zdW1lKGZpbGVzLCArK2N1cnJlbnRJbmRleCk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN1bWVyKG51bGwsIGRhdGEsIHBhdGguYmFzZW5hbWUoZmlsZXNbY3VycmVudEluZGV4XSkpO1xuXHRcdFx0XHRcdGlmIChzaG91bGRXYWl0Rm9yTW9yZSgpKSB7XG5cdFx0XHRcdFx0XHRpdGVyYXRlQW5kQ29uc3VtZShmaWxlcywgKytjdXJyZW50SW5kZXgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGl0ZXJhdGVBbmRDb25zdW1lKGZpbGVzLCArK2N1cnJlbnRJbmRleCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXG5cblx0Y29uc3QgaW5fcHJvZ3Jlc3MgPSBcIi5pbl9wcm9ncmVzc1wiO1xuXHRmdW5jdGlvbiB3cml0ZUZpbGUoZmlsZW5hbWUsIGNvbnRlbnQsIGNhbGxiYWNrKXtcblx0XHR2YXIgdG1wRmlsZW5hbWUgPSBmaWxlbmFtZStpbl9wcm9ncmVzcztcblx0XHRmcy53cml0ZUZpbGUodG1wRmlsZW5hbWUsIGNvbnRlbnQsIGZ1bmN0aW9uKGVycm9yLCByZXMpe1xuXHRcdFx0aWYoIWVycm9yKXtcblx0XHRcdFx0ZnMucmVuYW1lKHRtcEZpbGVuYW1lLCBmaWxlbmFtZSwgY2FsbGJhY2spO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdGNhbGxiYWNrKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHZhciBhbHJlYWR5S25vd25DaGFuZ2VzID0ge307XG5cblx0ZnVuY3Rpb24gYWxyZWFkeUZpcmVkQ2hhbmdlcyhmaWxlbmFtZSwgY2hhbmdlKXtcblx0XHR2YXIgcmVzID0gZmFsc2U7XG5cdFx0aWYoYWxyZWFkeUtub3duQ2hhbmdlc1tmaWxlbmFtZV0pe1xuXHRcdFx0cmVzID0gdHJ1ZTtcblx0XHR9ZWxzZXtcblx0XHRcdGFscmVhZHlLbm93bkNoYW5nZXNbZmlsZW5hbWVdID0gY2hhbmdlO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXM7XG5cdH1cblxuXHRmdW5jdGlvbiB3YXRjaEZvbGRlcihzaG91bGREZWxldGVBZnRlclJlYWQsIHNob3VsZFdhaXRGb3JNb3JlKXtcblx0XHRjb25zdCB3YXRjaGVyID0gZnMud2F0Y2goZm9sZGVyLCBmdW5jdGlvbihldmVudFR5cGUsIGZpbGVuYW1lKXtcblx0XHRcdCAvL2NvbnNvbGUubG9nKFwiV2F0Y2hpbmc6XCIsIGV2ZW50VHlwZSwgZmlsZW5hbWUpO1xuXG5cdFx0XHRpZiAoZmlsZW5hbWUgJiYgKGV2ZW50VHlwZSA9PT0gXCJjaGFuZ2VcIiB8fCBldmVudFR5cGUgPT09IFwicmVuYW1lXCIpKSB7XG5cblx0XHRcdFx0aWYocGF0aC5leHRuYW1lKGZpbGVuYW1lKSAhPT0gaW5fcHJvZ3Jlc3MgJiYgIWFscmVhZHlGaXJlZENoYW5nZXMoZmlsZW5hbWUsIGV2ZW50VHlwZSkpe1xuXHRcdFx0XHRcdGNvbnN1bWVNZXNzYWdlKGZpbGVuYW1lLCBzaG91bGREZWxldGVBZnRlclJlYWQsIChlcnIsIGRhdGEpID0+IHtcblx0XHRcdFx0XHRcdGlmKGVycikge1xuXHRcdFx0XHRcdFx0XHQvLyA/P1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjb25zdW1lcihudWxsLCBkYXRhLCBmaWxlbmFtZSk7XG5cdFx0XHRcdFx0XHRpZighc2hvdWxkV2FpdEZvck1vcmUoKSkge1xuXHRcdFx0XHRcdFx0XHR3YXRjaGVyLmNsb3NlKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG5leHBvcnRzLmdldEZvbGRlclF1ZXVlID0gZnVuY3Rpb24oZm9sZGVyLCBjYWxsYmFjayl7XG5cdHJldHVybiBuZXcgRm9sZGVyTVEoZm9sZGVyLCBjYWxsYmFjayk7XG59OyIsIi8qXG5Jbml0aWFsIExpY2Vuc2U6IChjKSBBeGlvbG9naWMgUmVzZWFyY2ggJiBBbGJvYWllIFPDrm5pY8SDLlxuQ29udHJpYnV0b3JzOiBBeGlvbG9naWMgUmVzZWFyY2ggLCBQcml2YXRlU2t5IHByb2plY3RcbkNvZGUgTGljZW5zZTogTEdQTCBvciBNSVQuXG4qL1xuXG5cbi8qKlxuICogICBVc3VhbGx5IGFuIGV2ZW50IGNvdWxkIGNhdXNlIGV4ZWN1dGlvbiBvZiBvdGhlciBjYWxsYmFjayBldmVudHMgLiBXZSBzYXkgdGhhdCBpcyBhIGxldmVsIDEgZXZlbnQgaWYgaXMgY2F1c2VlZCBieSBhIGxldmVsIDAgZXZlbnQgYW5kIHNvIG9uXG4gKlxuICogICAgICBTb3VuZFB1YlN1YiBwcm92aWRlcyBpbnR1aXRpdmUgcmVzdWx0cyByZWdhcmRpbmcgdG8gYXN5bmNocm9ub3VzIGNhbGxzIG9mIGNhbGxiYWNrcyBhbmQgY29tcHV0ZWQgdmFsdWVzL2V4cHJlc3Npb25zOlxuICogICB3ZSBwcmV2ZW50IGltbWVkaWF0ZSBleGVjdXRpb24gb2YgZXZlbnQgY2FsbGJhY2tzIHRvIGVuc3VyZSB0aGUgaW50dWl0aXZlIGZpbmFsIHJlc3VsdCBpcyBndWFyYW50ZWVkIGFzIGxldmVsIDAgZXhlY3V0aW9uXG4gKiAgIHdlIGd1YXJhbnRlZSB0aGF0IGFueSBjYWxsYmFjayBmdW5jdGlvbiBpcyBcInJlLWVudHJhbnRcIlxuICogICB3ZSBhcmUgYWxzbyB0cnlpbmcgdG8gcmVkdWNlIHRoZSBudW1iZXIgb2YgY2FsbGJhY2sgZXhlY3V0aW9uIGJ5IGxvb2tpbmcgaW4gcXVldWVzIGF0IG5ldyBtZXNzYWdlcyBwdWJsaXNoZWQgYnlcbiAqICAgdHJ5aW5nIHRvIGNvbXBhY3QgdGhvc2UgbWVzc2FnZXMgKHJlbW92aW5nIGR1cGxpY2F0ZSBtZXNzYWdlcywgbW9kaWZ5aW5nIG1lc3NhZ2VzLCBvciBhZGRpbmcgaW4gdGhlIGhpc3Rvcnkgb2YgYW5vdGhlciBldmVudCAsZXRjKVxuICpcbiAqICAgICAgRXhhbXBsZSBvZiB3aGF0IGNhbiBiZSB3cm9uZyB3aXRob3V0IG5vbi1zb3VuZCBhc3luY2hyb25vdXMgY2FsbHM6XG5cbiAqICBTdGVwIDA6IEluaXRpYWwgc3RhdGU6XG4gKiAgIGEgPSAwO1xuICogICBiID0gMDtcbiAqXG4gKiAgU3RlcCAxOiBJbml0aWFsIG9wZXJhdGlvbnM6XG4gKiAgIGEgPSAxO1xuICogICBiID0gLTE7XG4gKlxuICogIC8vIGFuIG9ic2VydmVyIHJlYWN0cyB0byBjaGFuZ2VzIGluIGEgYW5kIGIgYW5kIGNvbXB1dGUgQ09SUkVDVCBsaWtlIHRoaXM6XG4gKiAgIGlmKCBhICsgYiA9PSAwKSB7XG4gKiAgICAgICBDT1JSRUNUID0gZmFsc2U7XG4gKiAgICAgICBub3RpZnkoLi4uKTsgLy8gYWN0IG9yIHNlbmQgYSBub3RpZmljYXRpb24gc29tZXdoZXJlLi5cbiAqICAgfSBlbHNlIHtcbiAqICAgICAgQ09SUkVDVCA9IGZhbHNlO1xuICogICB9XG4gKlxuICogICAgTm90aWNlIHRoYXQ6IENPUlJFQ1Qgd2lsbCBiZSB0cnVlIGluIHRoZSBlbmQgLCBidXQgbWVhbnRpbWUsIGFmdGVyIGEgbm90aWZpY2F0aW9uIHdhcyBzZW50IGFuZCBDT1JSRUNUIHdhcyB3cm9uZ2x5LCB0ZW1wb3JhcmlseSBmYWxzZSFcbiAqICAgIHNvdW5kUHViU3ViIGd1YXJhbnRlZSB0aGF0IHRoaXMgZG9lcyBub3QgaGFwcGVuIGJlY2F1c2UgdGhlIHN5bmNyb25vdXMgY2FsbCB3aWxsIGJlZm9yZSBhbnkgb2JzZXJ2ZXIgKGJvdCBhc2lnbmF0aW9uIG9uIGEgYW5kIGIpXG4gKlxuICogICBNb3JlOlxuICogICB5b3UgY2FuIHVzZSBibG9ja0NhbGxCYWNrcyBhbmQgcmVsZWFzZUNhbGxCYWNrcyBpbiBhIGZ1bmN0aW9uIHRoYXQgY2hhbmdlIGEgbG90IGEgY29sbGVjdGlvbiBvciBiaW5kYWJsZSBvYmplY3RzIGFuZCBhbGxcbiAqICAgdGhlIG5vdGlmaWNhdGlvbnMgd2lsbCBiZSBzZW50IGNvbXBhY3RlZCBhbmQgcHJvcGVybHlcbiAqL1xuXG4vLyBUT0RPOiBvcHRpbWlzYXRpb24hPyB1c2UgYSBtb3JlIGVmZmljaWVudCBxdWV1ZSBpbnN0ZWFkIG9mIGFycmF5cyB3aXRoIHB1c2ggYW5kIHNoaWZ0IT9cbi8vIFRPRE86IHNlZSBob3cgYmlnIHRob3NlIHF1ZXVlcyBjYW4gYmUgaW4gcmVhbCBhcHBsaWNhdGlvbnNcbi8vIGZvciBhIGZldyBodW5kcmVkcyBpdGVtcywgcXVldWVzIG1hZGUgZnJvbSBhcnJheSBzaG91bGQgYmUgZW5vdWdoXG4vLyogICBQb3RlbnRpYWwgVE9ET3M6XG4vLyAgICAqICAgICBwcmV2ZW50IGFueSBmb3JtIG9mIHByb2JsZW0gYnkgY2FsbGluZyBjYWxsYmFja3MgaW4gdGhlIGV4cGVjdGVkIG9yZGVyICE/XG4vLyogICAgIHByZXZlbnRpbmcgaW5maW5pdGUgbG9vcHMgZXhlY3V0aW9uIGNhdXNlIGJ5IGV2ZW50cyE/XG4vLypcbi8vKlxuLy8gVE9ETzogZGV0ZWN0IGluZmluaXRlIGxvb3BzIChvciB2ZXJ5IGRlZXAgcHJvcGFnYXRpb24pIEl0IGlzIHBvc3NpYmxlIT9cblxuY29uc3QgUXVldWUgPSByZXF1aXJlKCcuL1F1ZXVlJyk7XG5cbmZ1bmN0aW9uIFNvdW5kUHViU3ViKCl7XG5cblx0LyoqXG5cdCAqIHB1Ymxpc2hcblx0ICogICAgICBQdWJsaXNoIGEgbWVzc2FnZSB7T2JqZWN0fSB0byBhIGxpc3Qgb2Ygc3Vic2NyaWJlcnMgb24gYSBzcGVjaWZpYyB0b3BpY1xuXHQgKlxuXHQgKiBAcGFyYW1zIHtTdHJpbmd8TnVtYmVyfSB0YXJnZXQsICB7T2JqZWN0fSBtZXNzYWdlXG5cdCAqIEByZXR1cm4gbnVtYmVyIG9mIGNoYW5uZWwgc3Vic2NyaWJlcnMgdGhhdCB3aWxsIGJlIG5vdGlmaWVkXG5cdCAqL1xuXHR0aGlzLnB1Ymxpc2ggPSBmdW5jdGlvbih0YXJnZXQsIG1lc3NhZ2Upe1xuXHRcdGlmKCFpbnZhbGlkQ2hhbm5lbE5hbWUodGFyZ2V0KSAmJiAhaW52YWxpZE1lc3NhZ2VUeXBlKG1lc3NhZ2UpICYmIGNoYW5uZWxTdWJzY3JpYmVyc1t0YXJnZXRdICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRjb21wYWN0QW5kU3RvcmUodGFyZ2V0LCBtZXNzYWdlKTtcblx0XHRcdGRpc3BhdGNoTmV4dCgpO1xuXHRcdFx0cmV0dXJuIGNoYW5uZWxTdWJzY3JpYmVyc1t0YXJnZXRdLmxlbmd0aDtcblx0XHR9IGVsc2V7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIHN1YnNjcmliZVxuXHQgKiAgICAgIFN1YnNjcmliZSAvIGFkZCBhIHtGdW5jdGlvbn0gY2FsbEJhY2sgb24gYSB7U3RyaW5nfE51bWJlcn10YXJnZXQgY2hhbm5lbCBzdWJzY3JpYmVycyBsaXN0IGluIG9yZGVyIHRvIHJlY2VpdmVcblx0ICogICAgICBtZXNzYWdlcyBwdWJsaXNoZWQgaWYgdGhlIGNvbmRpdGlvbnMgZGVmaW5lZCBieSB7RnVuY3Rpb259d2FpdEZvck1vcmUgYW5kIHtGdW5jdGlvbn1maWx0ZXIgYXJlIHBhc3NlZC5cblx0ICpcblx0ICogQHBhcmFtcyB7U3RyaW5nfE51bWJlcn10YXJnZXQsIHtGdW5jdGlvbn1jYWxsQmFjaywge0Z1bmN0aW9ufXdhaXRGb3JNb3JlLCB7RnVuY3Rpb259ZmlsdGVyXG5cdCAqXG5cdCAqICAgICAgICAgIHRhcmdldCAgICAgIC0gY2hhbm5lbCBuYW1lIHRvIHN1YnNjcmliZVxuXHQgKiAgICAgICAgICBjYWxsYmFjayAgICAtIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIGEgbWVzc2FnZSB3YXMgcHVibGlzaGVkIG9uIHRoZSBjaGFubmVsXG5cdCAqICAgICAgICAgIHdhaXRGb3JNb3JlIC0gYSBpbnRlcm1lZGlhcnkgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGNhbGxlZCBhZnRlciBhIHN1Y2Nlc3NmdWx5IG1lc3NhZ2UgZGVsaXZlcnkgaW4gb3JkZXJcblx0ICogICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGRlY2lkZSBpZiBhIG5ldyBtZXNzYWdlcyBpcyBleHBlY3RlZC4uLlxuXHQgKiAgICAgICAgICBmaWx0ZXIgICAgICAtIGEgZnVuY3Rpb24gdGhhdCByZWNlaXZlcyB0aGUgbWVzc2FnZSBiZWZvcmUgaW52b2NhdGlvbiBvZiBjYWxsYmFjayBmdW5jdGlvbiBpbiBvcmRlciB0byBhbGxvd1xuXHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsZXZhbnQgbWVzc2FnZSBiZWZvcmUgZW50ZXJpbmcgaW4gbm9ybWFsIGNhbGxiYWNrIGZsb3dcblx0ICogQHJldHVyblxuXHQgKi9cblx0dGhpcy5zdWJzY3JpYmUgPSBmdW5jdGlvbih0YXJnZXQsIGNhbGxCYWNrLCB3YWl0Rm9yTW9yZSwgZmlsdGVyKXtcblx0XHRpZighaW52YWxpZENoYW5uZWxOYW1lKHRhcmdldCkgJiYgIWludmFsaWRGdW5jdGlvbihjYWxsQmFjaykpe1xuXG5cdFx0XHR2YXIgc3Vic2NyaWJlciA9IHtcImNhbGxCYWNrXCI6Y2FsbEJhY2ssIFwid2FpdEZvck1vcmVcIjp3YWl0Rm9yTW9yZSwgXCJmaWx0ZXJcIjpmaWx0ZXJ9O1xuXHRcdFx0dmFyIGFyciA9IGNoYW5uZWxTdWJzY3JpYmVyc1t0YXJnZXRdO1xuXHRcdFx0aWYoYXJyID09IHVuZGVmaW5lZCl7XG5cdFx0XHRcdGFyciA9IFtdO1xuXHRcdFx0XHRjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XSA9IGFycjtcblx0XHRcdH1cblx0XHRcdGFyci5wdXNoKHN1YnNjcmliZXIpO1xuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogdW5zdWJzY3JpYmVcblx0ICogICAgICBVbnN1YnNjcmliZS9yZW1vdmUge0Z1bmN0aW9ufSBjYWxsQmFjayBmcm9tIHRoZSBsaXN0IG9mIHN1YnNjcmliZXJzIG9mIHRoZSB7U3RyaW5nfE51bWJlcn0gdGFyZ2V0IGNoYW5uZWxcblx0ICpcblx0ICogQHBhcmFtcyB7U3RyaW5nfE51bWJlcn0gdGFyZ2V0LCB7RnVuY3Rpb259IGNhbGxCYWNrLCB7RnVuY3Rpb259IGZpbHRlclxuXHQgKlxuXHQgKiAgICAgICAgICB0YXJnZXQgICAgICAtIGNoYW5uZWwgbmFtZSB0byB1bnN1YnNjcmliZVxuXHQgKiAgICAgICAgICBjYWxsYmFjayAgICAtIHJlZmVyZW5jZSBvZiB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gdGhhdCB3YXMgdXNlZCBhcyBzdWJzY3JpYmVcblx0ICogICAgICAgICAgZmlsdGVyICAgICAgLSByZWZlcmVuY2Ugb2YgdGhlIG9yaWdpbmFsIGZpbHRlciBmdW5jdGlvblxuXHQgKiBAcmV0dXJuXG5cdCAqL1xuXHR0aGlzLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24odGFyZ2V0LCBjYWxsQmFjaywgZmlsdGVyKXtcblx0XHRpZighaW52YWxpZEZ1bmN0aW9uKGNhbGxCYWNrKSl7XG5cdFx0XHR2YXIgZ290aXQgPSBmYWxzZTtcblx0XHRcdGlmKGNoYW5uZWxTdWJzY3JpYmVyc1t0YXJnZXRdKXtcblx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGNoYW5uZWxTdWJzY3JpYmVyc1t0YXJnZXRdLmxlbmd0aDtpKyspe1xuXHRcdFx0XHRcdHZhciBzdWJzY3JpYmVyID0gIGNoYW5uZWxTdWJzY3JpYmVyc1t0YXJnZXRdW2ldO1xuXHRcdFx0XHRcdGlmKHN1YnNjcmliZXIuY2FsbEJhY2sgPT09IGNhbGxCYWNrICYmIChmaWx0ZXIgPT0gdW5kZWZpbmVkIHx8IHN1YnNjcmliZXIuZmlsdGVyID09PSBmaWx0ZXIgKSl7XG5cdFx0XHRcdFx0XHRnb3RpdCA9IHRydWU7XG5cdFx0XHRcdFx0XHRzdWJzY3JpYmVyLmZvckRlbGV0ZSA9IHRydWU7XG5cdFx0XHRcdFx0XHRzdWJzY3JpYmVyLmNhbGxCYWNrID0gbnVsbDtcblx0XHRcdFx0XHRcdHN1YnNjcmliZXIuZmlsdGVyID0gbnVsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmKCFnb3RpdCl7XG5cdFx0XHRcdHdwcmludChcIlVuYWJsZSB0byB1bnN1YnNjcmliZSBhIGNhbGxiYWNrIHRoYXQgd2FzIG5vdCBzdWJzY3JpYmVkIVwiKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIGJsb2NrQ2FsbEJhY2tzXG5cdCAqXG5cdCAqIEBwYXJhbXNcblx0ICogQHJldHVyblxuXHQgKi9cblx0dGhpcy5ibG9ja0NhbGxCYWNrcyA9IGZ1bmN0aW9uKCl7XG5cdFx0bGV2ZWwrKztcblx0fTtcblxuXHQvKipcblx0ICogcmVsZWFzZUNhbGxCYWNrc1xuXHQgKlxuXHQgKiBAcGFyYW1zXG5cdCAqIEByZXR1cm5cblx0ICovXG5cdHRoaXMucmVsZWFzZUNhbGxCYWNrcyA9IGZ1bmN0aW9uKCl7XG5cdFx0bGV2ZWwtLTtcblx0XHQvL2hhY2svb3B0aW1pc2F0aW9uIHRvIG5vdCBmaWxsIHRoZSBzdGFjayBpbiBleHRyZW1lIGNhc2VzIChtYW55IGV2ZW50cyBjYXVzZWQgYnkgbG9vcHMgaW4gY29sbGVjdGlvbnMsZXRjKVxuXHRcdHdoaWxlKGxldmVsID09IDAgJiYgZGlzcGF0Y2hOZXh0KHRydWUpKXtcblx0XHRcdC8vbm90aGluZ1xuXHRcdH1cblxuXHRcdHdoaWxlKGxldmVsID09IDAgJiYgY2FsbEFmdGVyQWxsRXZlbnRzKCkpe1xuXG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBhZnRlckFsbEV2ZW50c1xuXHQgKlxuXHQgKiBAcGFyYW1zIHtGdW5jdGlvbn0gY2FsbGJhY2tcblx0ICpcblx0ICogICAgICAgICAgY2FsbGJhY2sgLSBmdW5jdGlvbiB0aGF0IG5lZWRzIHRvIGJlIGludm9rZWQgb25jZSBhbGwgZXZlbnRzIGFyZSBkZWxpdmVyZWRcblx0ICogQHJldHVyblxuXHQgKi9cblx0dGhpcy5hZnRlckFsbEV2ZW50cyA9IGZ1bmN0aW9uKGNhbGxCYWNrKXtcblx0XHRpZighaW52YWxpZEZ1bmN0aW9uKGNhbGxCYWNrKSl7XG5cdFx0XHRhZnRlckV2ZW50c0NhbGxzLnB1c2goY2FsbEJhY2spO1xuXHRcdH1cblx0XHR0aGlzLmJsb2NrQ2FsbEJhY2tzKCk7XG5cdFx0dGhpcy5yZWxlYXNlQ2FsbEJhY2tzKCk7XG5cdH07XG5cblx0LyoqXG5cdCAqIGhhc0NoYW5uZWxcblx0ICpcblx0ICogQHBhcmFtcyB7U3RyaW5nfE51bWJlcn0gY2hhbm5lbFxuXHQgKlxuXHQgKiAgICAgICAgICBjaGFubmVsIC0gbmFtZSBvZiB0aGUgY2hhbm5lbCB0aGF0IG5lZWQgdG8gYmUgdGVzdGVkIGlmIHByZXNlbnRcblx0ICogQHJldHVyblxuXHQgKi9cblx0dGhpcy5oYXNDaGFubmVsID0gZnVuY3Rpb24oY2hhbm5lbCl7XG5cdFx0cmV0dXJuICFpbnZhbGlkQ2hhbm5lbE5hbWUoY2hhbm5lbCkgJiYgY2hhbm5lbFN1YnNjcmliZXJzW2NoYW5uZWxdICE9IHVuZGVmaW5lZCA/IHRydWUgOiBmYWxzZTtcblx0fTtcblxuXHQvKipcblx0ICogYWRkQ2hhbm5lbFxuXHQgKlxuXHQgKiBAcGFyYW1zIHtTdHJpbmd9IGNoYW5uZWxcblx0ICpcblx0ICogICAgICAgICAgY2hhbm5lbCAtIG5hbWUgb2YgYSBjaGFubmVsIHRoYXQgbmVlZHMgdG8gYmUgY3JlYXRlZCBhbmQgYWRkZWQgdG8gc291bmRwdWJzdWIgcmVwb3NpdG9yeVxuXHQgKiBAcmV0dXJuXG5cdCAqL1xuXHR0aGlzLmFkZENoYW5uZWwgPSBmdW5jdGlvbihjaGFubmVsKXtcblx0XHRpZighaW52YWxpZENoYW5uZWxOYW1lKGNoYW5uZWwpICYmICF0aGlzLmhhc0NoYW5uZWwoY2hhbm5lbCkpe1xuXHRcdFx0Y2hhbm5lbFN1YnNjcmliZXJzW2NoYW5uZWxdID0gW107XG5cdFx0fVxuXHR9O1xuXG5cdC8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gcHJvdGVjdGVkIHN0dWZmIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblx0dmFyIHNlbGYgPSB0aGlzO1xuXHQvLyBtYXAgY2hhbm5lbE5hbWUgKG9iamVjdCBsb2NhbCBpZCkgLT4gYXJyYXkgd2l0aCBzdWJzY3JpYmVyc1xuXHR2YXIgY2hhbm5lbFN1YnNjcmliZXJzID0ge307XG5cblx0Ly8gbWFwIGNoYW5uZWxOYW1lIChvYmplY3QgbG9jYWwgaWQpIC0+IHF1ZXVlIHdpdGggd2FpdGluZyBtZXNzYWdlc1xuXHR2YXIgY2hhbm5lbHNTdG9yYWdlID0ge307XG5cblx0Ly8gb2JqZWN0XG5cdHZhciB0eXBlQ29tcGFjdG9yID0ge307XG5cblx0Ly8gY2hhbm5lbCBuYW1lc1xuXHR2YXIgZXhlY3V0aW9uUXVldWUgPSBuZXcgUXVldWUoKTtcblx0dmFyIGxldmVsID0gMDtcblxuXG5cblx0LyoqXG5cdCAqIHJlZ2lzdGVyQ29tcGFjdG9yXG5cdCAqXG5cdCAqICAgICAgIEFuIGNvbXBhY3RvciB0YWtlcyBhIG5ld0V2ZW50IGFuZCBhbmQgb2xkRXZlbnQgYW5kIHJldHVybiB0aGUgb25lIHRoYXQgc3Vydml2ZXMgKG9sZEV2ZW50IGlmXG5cdCAqICBpdCBjYW4gY29tcGFjdCB0aGUgbmV3IG9uZSBvciB0aGUgbmV3RXZlbnQgaWYgY2FuJ3QgYmUgY29tcGFjdGVkKVxuXHQgKlxuXHQgKiBAcGFyYW1zIHtTdHJpbmd9IHR5cGUsIHtGdW5jdGlvbn0gY2FsbEJhY2tcblx0ICpcblx0ICogICAgICAgICAgdHlwZSAgICAgICAgLSBjaGFubmVsIG5hbWUgdG8gdW5zdWJzY3JpYmVcblx0ICogICAgICAgICAgY2FsbEJhY2sgICAgLSBoYW5kbGVyIGZ1bmN0aW9uIGZvciB0aGF0IHNwZWNpZmljIGV2ZW50IHR5cGVcblx0ICogQHJldHVyblxuXHQgKi9cblx0dGhpcy5yZWdpc3RlckNvbXBhY3RvciA9IGZ1bmN0aW9uKHR5cGUsIGNhbGxCYWNrKSB7XG5cdFx0aWYoIWludmFsaWRGdW5jdGlvbihjYWxsQmFjaykpe1xuXHRcdFx0dHlwZUNvbXBhY3Rvclt0eXBlXSA9IGNhbGxCYWNrO1xuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogZGlzcGF0Y2hOZXh0XG5cdCAqXG5cdCAqIEBwYXJhbSBmcm9tUmVsZWFzZUNhbGxCYWNrczogaGFjayB0byBwcmV2ZW50IHRvbyBtYW55IHJlY3Vyc2l2ZSBjYWxscyBvbiByZWxlYXNlQ2FsbEJhY2tzXG5cdCAqIEByZXR1cm4ge0Jvb2xlYW59XG5cdCAqL1xuXHRmdW5jdGlvbiBkaXNwYXRjaE5leHQoZnJvbVJlbGVhc2VDYWxsQmFja3Mpe1xuXHRcdGlmKGxldmVsID4gMCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRsZXQgY2hhbm5lbE5hbWUgPSBleGVjdXRpb25RdWV1ZS5mcm9udCgpO1xuXHRcdGlmKGNoYW5uZWxOYW1lICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRzZWxmLmJsb2NrQ2FsbEJhY2tzKCk7XG5cdFx0XHR0cnl7XG5cdFx0XHRcdGxldCBtZXNzYWdlO1xuXHRcdFx0XHRpZighY2hhbm5lbHNTdG9yYWdlW2NoYW5uZWxOYW1lXS5pc0VtcHR5KCkpIHtcblx0XHRcdFx0XHRtZXNzYWdlID0gY2hhbm5lbHNTdG9yYWdlW2NoYW5uZWxOYW1lXS5mcm9udCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKG1lc3NhZ2UgPT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0XHRpZighY2hhbm5lbHNTdG9yYWdlW2NoYW5uZWxOYW1lXS5pc0VtcHR5KCkpe1xuXHRcdFx0XHRcdFx0d3ByaW50KFwiQ2FuJ3QgdXNlIGFzIG1lc3NhZ2UgaW4gYSBwdWIvc3ViIGNoYW5uZWwgdGhpcyBvYmplY3Q6IFwiICsgbWVzc2FnZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGV4ZWN1dGlvblF1ZXVlLnBvcCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmKG1lc3NhZ2UuX190cmFuc21pc2lvbkluZGV4ID09IHVuZGVmaW5lZCl7XG5cdFx0XHRcdFx0XHRtZXNzYWdlLl9fdHJhbnNtaXNpb25JbmRleCA9IDA7XG5cdFx0XHRcdFx0XHRmb3IodmFyIGkgPSBjaGFubmVsU3Vic2NyaWJlcnNbY2hhbm5lbE5hbWVdLmxlbmd0aC0xOyBpID49IDAgOyBpLS0pe1xuXHRcdFx0XHRcdFx0XHR2YXIgc3Vic2NyaWJlciA9ICBjaGFubmVsU3Vic2NyaWJlcnNbY2hhbm5lbE5hbWVdW2ldO1xuXHRcdFx0XHRcdFx0XHRpZihzdWJzY3JpYmVyLmZvckRlbGV0ZSA9PSB0cnVlKXtcblx0XHRcdFx0XHRcdFx0XHRjaGFubmVsU3Vic2NyaWJlcnNbY2hhbm5lbE5hbWVdLnNwbGljZShpLDEpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNle1xuXHRcdFx0XHRcdFx0bWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXgrKztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly9UT0RPOiBmb3IgaW1tdXRhYmxlIG9iamVjdHMgaXQgd2lsbCBub3Qgd29yayBhbHNvLCBmaXggZm9yIHNoYXBlIG1vZGVsc1xuXHRcdFx0XHRcdGlmKG1lc3NhZ2UuX190cmFuc21pc2lvbkluZGV4ID09IHVuZGVmaW5lZCl7XG5cdFx0XHRcdFx0XHR3cHJpbnQoXCJDYW4ndCB1c2UgYXMgbWVzc2FnZSBpbiBhIHB1Yi9zdWIgY2hhbm5lbCB0aGlzIG9iamVjdDogXCIgKyBtZXNzYWdlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dmFyIHN1YnNjcmliZXIgPSBjaGFubmVsU3Vic2NyaWJlcnNbY2hhbm5lbE5hbWVdW21lc3NhZ2UuX190cmFuc21pc2lvbkluZGV4XTtcblx0XHRcdFx0XHRpZihzdWJzY3JpYmVyID09IHVuZGVmaW5lZCl7XG5cdFx0XHRcdFx0XHRkZWxldGUgbWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXg7XG5cdFx0XHRcdFx0XHRjaGFubmVsc1N0b3JhZ2VbY2hhbm5lbE5hbWVdLnBvcCgpO1xuXHRcdFx0XHRcdH0gZWxzZXtcblx0XHRcdFx0XHRcdGlmKHN1YnNjcmliZXIuZmlsdGVyID09IHVuZGVmaW5lZCB8fCAoIWludmFsaWRGdW5jdGlvbihzdWJzY3JpYmVyLmZpbHRlcikgJiYgc3Vic2NyaWJlci5maWx0ZXIobWVzc2FnZSkpKXtcblx0XHRcdFx0XHRcdFx0aWYoIXN1YnNjcmliZXIuZm9yRGVsZXRlKXtcblx0XHRcdFx0XHRcdFx0XHRzdWJzY3JpYmVyLmNhbGxCYWNrKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdFx0XHRcdGlmKHN1YnNjcmliZXIud2FpdEZvck1vcmUgJiYgIWludmFsaWRGdW5jdGlvbihzdWJzY3JpYmVyLndhaXRGb3JNb3JlKSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0IXN1YnNjcmliZXIud2FpdEZvck1vcmUobWVzc2FnZSkpe1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRzdWJzY3JpYmVyLmZvckRlbGV0ZSA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoKGVycil7XG5cdFx0XHRcdHdwcmludChcIkV2ZW50IGNhbGxiYWNrIGZhaWxlZDogXCIrIHN1YnNjcmliZXIuY2FsbEJhY2sgK1wiZXJyb3I6IFwiICsgZXJyLnN0YWNrKTtcblx0XHRcdH1cblx0XHRcdC8vXG5cdFx0XHRpZihmcm9tUmVsZWFzZUNhbGxCYWNrcyl7XG5cdFx0XHRcdGxldmVsLS07XG5cdFx0XHR9IGVsc2V7XG5cdFx0XHRcdHNlbGYucmVsZWFzZUNhbGxCYWNrcygpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNle1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGNvbXBhY3RBbmRTdG9yZSh0YXJnZXQsIG1lc3NhZ2Upe1xuXHRcdHZhciBnb3RDb21wYWN0ZWQgPSBmYWxzZTtcblx0XHR2YXIgYXJyID0gY2hhbm5lbHNTdG9yYWdlW3RhcmdldF07XG5cdFx0aWYoYXJyID09IHVuZGVmaW5lZCl7XG5cdFx0XHRhcnIgPSBuZXcgUXVldWUoKTtcblx0XHRcdGNoYW5uZWxzU3RvcmFnZVt0YXJnZXRdID0gYXJyO1xuXHRcdH1cblxuXHRcdGlmKG1lc3NhZ2UgJiYgbWVzc2FnZS50eXBlICE9IHVuZGVmaW5lZCl7XG5cdFx0XHR2YXIgdHlwZUNvbXBhY3RvckNhbGxCYWNrID0gdHlwZUNvbXBhY3RvclttZXNzYWdlLnR5cGVdO1xuXG5cdFx0XHRpZih0eXBlQ29tcGFjdG9yQ2FsbEJhY2sgIT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0Zm9yKGxldCBjaGFubmVsIG9mIGFycikge1xuXHRcdFx0XHRcdGlmKHR5cGVDb21wYWN0b3JDYWxsQmFjayhtZXNzYWdlLCBjaGFubmVsKSA9PT0gY2hhbm5lbCkge1xuXHRcdFx0XHRcdFx0aWYoY2hhbm5lbC5fX3RyYW5zbWlzaW9uSW5kZXggPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRnb3RDb21wYWN0ZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZighZ290Q29tcGFjdGVkICYmIG1lc3NhZ2Upe1xuXHRcdFx0YXJyLnB1c2gobWVzc2FnZSk7XG5cdFx0XHRleGVjdXRpb25RdWV1ZS5wdXNoKHRhcmdldCk7XG5cdFx0fVxuXHR9XG5cblx0dmFyIGFmdGVyRXZlbnRzQ2FsbHMgPSBuZXcgUXVldWUoKTtcblx0ZnVuY3Rpb24gY2FsbEFmdGVyQWxsRXZlbnRzICgpe1xuXHRcdGlmKCFhZnRlckV2ZW50c0NhbGxzLmlzRW1wdHkoKSl7XG5cdFx0XHR2YXIgY2FsbEJhY2sgPSBhZnRlckV2ZW50c0NhbGxzLnBvcCgpO1xuXHRcdFx0Ly9kbyBub3QgY2F0Y2ggZXhjZXB0aW9ucyBoZXJlLi5cblx0XHRcdGNhbGxCYWNrKCk7XG5cdFx0fVxuXHRcdHJldHVybiAhYWZ0ZXJFdmVudHNDYWxscy5pc0VtcHR5KCk7XG5cdH1cblxuXHRmdW5jdGlvbiBpbnZhbGlkQ2hhbm5lbE5hbWUobmFtZSl7XG5cdFx0dmFyIHJlc3VsdCA9IGZhbHNlO1xuXHRcdGlmKCFuYW1lIHx8ICh0eXBlb2YgbmFtZSAhPSBcInN0cmluZ1wiICYmIHR5cGVvZiBuYW1lICE9IFwibnVtYmVyXCIpKXtcblx0XHRcdHJlc3VsdCA9IHRydWU7XG5cdFx0XHR3cHJpbnQoXCJJbnZhbGlkIGNoYW5uZWwgbmFtZTogXCIgKyBuYW1lKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0ZnVuY3Rpb24gaW52YWxpZE1lc3NhZ2VUeXBlKG1lc3NhZ2Upe1xuXHRcdHZhciByZXN1bHQgPSBmYWxzZTtcblx0XHRpZighbWVzc2FnZSB8fCB0eXBlb2YgbWVzc2FnZSAhPSBcIm9iamVjdFwiKXtcblx0XHRcdHJlc3VsdCA9IHRydWU7XG5cdFx0XHR3cHJpbnQoXCJJbnZhbGlkIG1lc3NhZ2VzIHR5cGVzOiBcIiArIG1lc3NhZ2UpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0ZnVuY3Rpb24gaW52YWxpZEZ1bmN0aW9uKGNhbGxiYWNrKXtcblx0XHR2YXIgcmVzdWx0ID0gZmFsc2U7XG5cdFx0aWYoIWNhbGxiYWNrIHx8IHR5cGVvZiBjYWxsYmFjayAhPSBcImZ1bmN0aW9uXCIpe1xuXHRcdFx0cmVzdWx0ID0gdHJ1ZTtcblx0XHRcdHdwcmludChcIkV4cGVjdGVkIHRvIGJlIGZ1bmN0aW9uIGJ1dCBpczogXCIgKyBjYWxsYmFjayk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cbn1cblxuZXhwb3J0cy5zb3VuZFB1YlN1YiA9IG5ldyBTb3VuZFB1YlN1YigpOyIsIi8qIHdoeSBGdW5jdGlvbiBwcm90b3R5cGUgaW1wbGVtZW50YXRpb24qL1xuXG5cbnZhciBsb2dnZXIgPSByZXF1aXJlKCdkb3VibGUtY2hlY2snKS5sb2dnZXI7XG5cbmxvZ2dlci5hZGRDYXNlKFwiZHVtcFdoeXNcIiwgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZXhwb3J0cy5nZXRBbGxDb250ZXh0cygpO1xuICAgIFxufSk7XG5cbmZ1bmN0aW9uIG5ld1RyYWNraW5nSXRlbShtb3RpdmF0aW9uLGNhbGxlcil7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RlcDptb3RpdmF0aW9uLFxuICAgICAgICBwYXJlbnQ6Y2FsbGVyLFxuICAgICAgICBjaGlsZHJlbjpbXSxcbiAgICAgICAgaWQ6Y2FsbGVyLmNvbnRleHQuZ2V0TmV3SWQoKSxcbiAgICAgICAgY29udGV4dDpjYWxsZXIuY29udGV4dCxcbiAgICAgICAgaW5kZXhJblBhcmVudENoaWxkcmVuOmNhbGxlci5oYXNPd25Qcm9wZXJ0eSgnY2hpbGRyZW4nKT9jYWxsZXIuY2hpbGRyZW4ubGVuZ3RoOjBcbiAgICB9O1xufVxuXG52YXIgY29udGV4dHMgPSBbXTtcblxudmFyIGdsb2JhbEN1cnJlbnRDb250ZXh0ID0gbnVsbDtcblxuZXhwb3J0cy5nZXRHbG9iYWxDdXJyZW50Q29udGV4dCA9IGZ1bmN0aW9uKCl7XG4gICAgaWYocHJvY2Vzcy5lbnZbJ1JVTl9XSVRIX1dIWVMnXSkge1xuICAgICAgICByZXR1cm4gZ2xvYmFsQ3VycmVudENvbnRleHQ7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignV2h5IGlzIG5vdCBhY3RpdmF0ZWRcXG5Zb3UgbXVzdCBzZXQgZW52IHZhcmlhYmxlIFJVTl9XSVRIX1dIWVMgdG8gdHJ1ZSB0byBiZSBhYmxlIHRvIHVzZSB3aHlzJylcbiAgICB9XG59XG5cbmV4cG9ydHMuZ2V0QWxsQ29udGV4dHMgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBjb250ZXh0cztcbn1cblxuXG5mdW5jdGlvbiBvblRlcm1pbmF0aW9uKCl7XG4gICAgaWYocHJvY2Vzcy5lbnZbJ1JVTl9XSVRIX1dIWVMnXSkge1xuICAgICAgICB2YXIgcHJvY2Vzc19zdW1tYXJ5ID0gZXhwb3J0cy5nZXRBbGxDb250ZXh0cygpLm1hcChmdW5jdGlvbihjb250ZXh0KSB7cmV0dXJuIGNvbnRleHQuZ2V0RXhlY3V0aW9uU3VtbWFyeSgpfSlcblxuICAgICAgICBpZihwcm9jZXNzLnNlbmQpe1xuICAgICAgICAgICAgbGlua1dpdGhQYXJlbnRQcm9jZXNzKCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgbG9nZ2VyLmR1bXBXaHlzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gbGlua1dpdGhQYXJlbnRQcm9jZXNzKCl7XG4gICAgICAgIHByb2Nlc3Muc2VuZCh7XCJ3aHlMb2dzXCI6cHJvY2Vzc19zdW1tYXJ5fSlcbiAgICB9XG59XG5cbnByb2Nlc3Mub24oJ2V4aXQnLCBvblRlcm1pbmF0aW9uKTtcblxuXG5mdW5jdGlvbiBUcmFja2luZ0NvbnRleHQoKXtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGxhc3RJZCA9IDA7XG4gICAgdGhpcy5nZXRFeGVjdXRpb25TdW1tYXJ5ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHN1bW1hcnkgPSB7fVxuICAgICAgICBzZWxmLnN0YXJ0aW5nUG9pbnQuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZCl7XG4gICAgICAgICAgICBzdW1tYXJ5W2NoaWxkLnN0ZXBdID0gZ2V0Tm9kZVN1bW1hcnkoY2hpbGQpO1xuICAgICAgICB9KVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldE5vZGVTdW1tYXJ5KG5vZGUpe1xuICAgICAgICAgICAgaWYobm9kZVsnc3VtbWFyeSddKXtcbiAgICAgICAgICAgICAgICAvL3RoaXMgbm9kZSBpcyBhbHJlYWR5IGEgc3VtbWFyaXplZCAoIGl0IHdhcyBleGVjdXRlZCBpbiBhbm90aGVyIHByb2Nlc3MpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVbJ3N1bW1hcnknXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzdW1tYXJ5ID0ge307XG4gICAgICAgICAgICBzdW1tYXJ5LmFyZ3MgPSBub2RlLmFyZ3M7XG4gICAgICAgICAgICBzdW1tYXJ5LnN0YWNrID0gbm9kZS5zdGFjaztcbiAgICAgICAgICAgIGlmKG5vZGUuZXhjZXB0aW9uKXtcbiAgICAgICAgICAgICAgICBzdW1tYXJ5LmV4Y2VwdGlvbiA9IG5vZGUuZXhjZXB0aW9uO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgaWYobm9kZS5jaGlsZHJlbi5sZW5ndGg+MCl7XG4gICAgICAgICAgICAgICAgICAgIHN1bW1hcnkuY2FsbHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1bW1hcnkuY2FsbHNbY2hpbGQuc3RlcF0gPSBnZXROb2RlU3VtbWFyeShjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN1bW1hcnk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1bW1hcnk7XG4gICAgfVxuICAgIHRoaXMuZ2V0TmV3SWQgPSBmdW5jdGlvbigpe3JldHVybiBsYXN0SWQrK31cbiAgICB0aGlzLmN1cnJlbnRSdW5uaW5nSXRlbSA9IG5ld1RyYWNraW5nSXRlbShcIkNvbnRleHQgc3RhcnRlclwiLHtjb250ZXh0OnNlbGZ9KTtcbiAgICB0aGlzLnN0YXJ0aW5nUG9pbnQgPSB0aGlzLmN1cnJlbnRSdW5uaW5nSXRlbTtcbiAgICBjb250ZXh0cy5wdXNoKHRoaXMpO1xufVxuXG52YXIgZ2xvYmFsV2h5U3RhY2tMZXZlbCA9IDA7XG5cbkZ1bmN0aW9uLnByb3RvdHlwZS53aHkgPSBmdW5jdGlvbihtb3RpdmF0aW9uLCBjYWxsZXIsb3RoZXJDb250ZXh0SW5mbywgZXh0ZXJuYWxCaW5kZXIpe1xuICAgIGlmKCFwcm9jZXNzLmVudltcIlJVTl9XSVRIX1dIWVNcIl0pe1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBuZXdDb250ZXh0ID0gZmFsc2U7XG4gICAgdmFyIHRoaXNJdGVtO1xuICAgIGxpbmtUb0NvbnRleHQoKTtcblxuXG4gICAgdmFyIHdoeUZ1bmMgPSBmdW5jdGlvbigpe1xuICAgICAgICB1cGRhdGVDb250ZXh0KHRoaXNJdGVtKTtcbiAgICAgICAgYWRkQXJncyhhcmd1bWVudHMsdGhpc0l0ZW0pO1xuICAgICAgICBhdHRhdGNoU3RhY2tJbmZvVG9JdGVtV0hZKHRoaXNJdGVtLG5ld0NvbnRleHQsZ2xvYmFsV2h5U3RhY2tMZXZlbCk7XG4gICAgICAgIHJlc29sdmVFbWJlZGRpbmdMZXZlbCh0aGlzSXRlbSk7XG4gICAgICAgIHZhciByZXN1bHQgPSBleGVjdXRlV0hZRnVuY3Rpb24oc2VsZix0aGlzSXRlbSxhcmd1bWVudHMpO1xuICAgICAgICAvL21heWJlTG9nKGdsb2JhbEN1cnJlbnRDb250ZXh0KTtcbiAgICAgICAgcmV0dXJuRnJvbUNhbGwodGhpc0l0ZW0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgfVxuXG4gICAgcmV0dXJuIHdoeUZ1bmM7XG5cbiAgICBmdW5jdGlvbiBsaW5rVG9Db250ZXh0KCl7XG4gICAgICAgIGlmKCFjYWxsZXIpe1xuICAgICAgICAgICAgaWYgKGdsb2JhbFdoeVN0YWNrTGV2ZWwgPT09IDApIHtcbiAgICAgICAgICAgICAgICBnbG9iYWxDdXJyZW50Q29udGV4dCA9IG5ldyBUcmFja2luZ0NvbnRleHQoKTtcbiAgICAgICAgICAgICAgICBuZXdDb250ZXh0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXNJdGVtID0gbmV3VHJhY2tpbmdJdGVtKG1vdGl2YXRpb24sIGdsb2JhbEN1cnJlbnRDb250ZXh0LmN1cnJlbnRSdW5uaW5nSXRlbSk7XG4gICAgICAgICAgICBnbG9iYWxDdXJyZW50Q29udGV4dC5jdXJyZW50UnVubmluZ0l0ZW0uY2hpbGRyZW4ucHVzaCh0aGlzSXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIHRoaXNJdGVtID0gbmV3VHJhY2tpbmdJdGVtKG1vdGl2YXRpb24sY2FsbGVyKTtcbiAgICAgICAgICAgIGNhbGxlci5jaGlsZHJlbi5wdXNoKHRoaXNJdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGF0dGF0Y2hTdGFja0luZm9Ub0l0ZW1XSFkoaXRlbSxuZXdDb250ZXh0LGdsb2JhbFdodFN0YWNrTGV2ZWwpIHtcbiAgICAgICAgdmFyIHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2suc3BsaXQoXCJcXG5cIik7XG5cbiAgICAgICAgc3RhY2suc2hpZnQoKTtcblxuICAgICAgICBzdGFjayA9IGRyb3BMaW5lc01hdGNoaW5nKHN0YWNrLCBbXCJXSFlcIl0pO1xuXG4gICAgICAgIGl0ZW0ud2h5RW1iZWRkaW5nTGV2ZWwgPSBnZXRXaHlFbWJlZGRpbmdMZXZlbChzdGFjayk7XG4gICAgICAgIGl0ZW0uc3RhY2sgPSBnZXRSZWxldmFudFN0YWNrKGl0ZW0sIHN0YWNrKTtcbiAgICAgICAgaXRlbS5pc0NhbGxiYWNrID0gKGdsb2JhbFdoeVN0YWNrTGV2ZWwgPT09IGl0ZW0ud2h5RW1iZWRkaW5nTGV2ZWwgLSAxKSAmJiAoIW5ld0NvbnRleHQpO1xuXG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0V2h5RW1iZWRkaW5nTGV2ZWwoc3RhY2spIHtcbiAgICAgICAgICAgIHZhciB3aHlFbWJlZGRpbmdMZXZlbCA9IDA7XG4gICAgICAgICAgICBzdGFjay5zb21lKGZ1bmN0aW9uIChzdGFja0xpbmUpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhY2tMaW5lLm1hdGNoKFwid2h5RnVuY1wiKSAhPT0gbnVsbCB8fCBzdGFja0xpbmUubWF0Y2goXCJhdCB3aHlGdW5jXCIpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHdoeUVtYmVkZGluZ0xldmVsKys7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmV0dXJuIHdoeUVtYmVkZGluZ0xldmVsO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0UmVsZXZhbnRTdGFjayh0cmFja2luZ0l0ZW0sIHN0YWNrKSB7XG4gICAgICAgICAgICBpZiAodHJhY2tpbmdJdGVtLmlzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzdGFjayA9IFtdO1xuICAgICAgICAgICAgICAgIHN0YWNrLnB1c2godHJhY2tpbmdJdGVtLnBhcmVudC5zdGFja1swXSk7XG4gICAgICAgICAgICAgICAgc3RhY2sucHVzaChcIiAgICAgICBBZnRlciBjYWxsYmFja1wiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRyYWNraW5nSXRlbS5wYXJlbnQuaGFzT3duUHJvcGVydHkoXCJzdGFja1wiKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZHJvcFdoeXNGcm9tU3RhY2soc3RhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIga2VlcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdmFyIGZpcnN0UmVkdW5kYW50U3RhY2tMaW5lID0gdHJhY2tpbmdJdGVtLnBhcmVudC5zdGFja1swXTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBkcm9wV2h5c0Zyb21TdGFjayhzdGFjay5maWx0ZXIoZnVuY3Rpb24gKHN0YWNrTGluZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhY2tMaW5lID09PSBmaXJzdFJlZHVuZGFudFN0YWNrTGluZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAga2VlcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBrZWVwO1xuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gZHJvcFdoeXNGcm9tU3RhY2soc3RhY2spIHtcbiAgICAgICAgICAgICAgICB2YXIgd2h5TWF0Y2hlcyA9IFtcIndoeUZ1bmNcIl07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRyb3BMaW5lc01hdGNoaW5nKHN0YWNrLCB3aHlNYXRjaGVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGRyb3BMaW5lc01hdGNoaW5nKHN0YWNrLCBsaW5lTWF0Y2hlcykge1xuICAgICAgICAgICAgcmV0dXJuIHN0YWNrLmZpbHRlcihmdW5jdGlvbiAoc3RhY2tMaW5lKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJldCA9IHRydWU7XG4gICAgICAgICAgICAgICAgbGluZU1hdGNoZXMuZm9yRWFjaChmdW5jdGlvbiAobGluZU1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGFja0xpbmUubWF0Y2gobGluZU1hdGNoKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc29sdmVFbWJlZGRpbmdMZXZlbChpdGVtKXtcbiAgICAgICAgaWYoaXRlbS53aHlFbWJlZGRpbmdMZXZlbD4xKSB7XG4gICAgICAgICAgICBpdGVtLnN0ZXAgKz0gXCIgQU5EIFwiICsgaXRlbS5wYXJlbnQuY2hpbGRyZW4uc3BsaWNlKGl0ZW0uaW5kZXhJblBhcmVudENoaWxkcmVuICsxLCAxKVswXS5zdGVwO1xuICAgICAgICAgICAgaXRlbS5wYXJlbnQuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZHJlbil7XG4gICAgICAgICAgICAgICAgaWYoY2hpbGRyZW4uaW5kZXhJblBhcmVudENoaWxkcmVuPml0ZW0uaW5kZXhJblBhcmVudENoaWxkcmVuKXtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4uaW5kZXhJblBhcmVudENoaWxkcmVuLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZEFyZ3MoYXJncyxpdGVtKXtcbiAgICAgICAgdmFyIGEgPSBbXTtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgaWYodHlwZW9mIGFyZ3NbaV0gPT09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgICAgICAgICAgYS5wdXNoKFwiZnVuY3Rpb25cIik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBhLnB1c2goSlNPTi5zdHJpbmdpZnkoYXJnc1tpXSkpO1xuICAgICAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgICAgIGEucHVzaChcIlVuc2VyaWFsaXphYmxlIGFyZ3VtZW50IG9mIHR5cGUgXCIrdHlwZW9mIGFyZ3NbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGl0ZW0uYXJncyA9IGE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlQ29udGV4dChpdGVtKXtcbiAgICAgICAgZ2xvYmFsQ3VycmVudENvbnRleHQgPSBpdGVtLmNvbnRleHQ7XG4gICAgICAgIGdsb2JhbEN1cnJlbnRDb250ZXh0LmN1cnJlbnRSdW5uaW5nSXRlbSA9IGl0ZW07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXhlY3V0ZVdIWUZ1bmN0aW9uKGZ1bmMsaXRlbSxhcmdzKSB7XG4gICAgICAgIHZhciBwcmV2aW91c0dsb2JhbFdoeVN0YWNrTGV2ZWwgPSBnbG9iYWxXaHlTdGFja0xldmVsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZ2xvYmFsV2h5U3RhY2tMZXZlbCsrO1xuICAgICAgICAgICAgaXRlbS5yZXN1bHQgPSBmdW5jLmFwcGx5KGZ1bmMsIGFyZ3MpO1xuICAgICAgICAgICAgaXRlbS5kb25lID0gdHJ1ZTtcbiAgICAgICAgICAgIGdsb2JhbFdoeVN0YWNrTGV2ZWwtLTtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICBnbG9iYWxXaHlTdGFja0xldmVsID0gcHJldmlvdXNHbG9iYWxXaHlTdGFja0xldmVsO1xuICAgICAgICAgICAgaWYoZXhjZXB0aW9uLmxvZ2dlZCE9PXRydWUpe1xuICAgICAgICAgICAgICAgIHZhciBlcnJvciA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ2V4Y2VwdGlvbic6ZXhjZXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAnbG9nZ2VkJzp0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGl0ZW1bJ2V4Y2VwdGlvbiddID0gZXJyb3I7XG4gICAgICAgICAgICAgICAgaXRlbS5kb25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBnbG9iYWxDdXJyZW50Q29udGV4dC5jdXJyZW50UnVubmluZ0l0ZW0gPSBpdGVtLnBhcmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtLnJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXR1cm5Gcm9tQ2FsbChpdGVtKXtcbiAgICAgICAgZ2xvYmFsQ3VycmVudENvbnRleHQuY3VycmVudFJ1bm5pbmdJdGVtID0gaXRlbS5wYXJlbnQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWF5YmVMb2coY29udGV4dCl7XG4gICAgICAgIGlmKGdsb2JhbFdoeVN0YWNrTGV2ZWwgPT09IDApe1xuICAgICAgICAgICAgbG9nZ2VyLmxvZ1doeShjb250ZXh0LmdldEV4ZWN1dGlvblN1bW1hcnkoKSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5cbi8qXG4gICAgV2hlbiBsYXVuY2hpbmcgY2hpbGQgcHJvY2Vzc2VzIHRoYXQgcnVuIHdpdGggV0hZUyB5b3UgbWlnaHQgd2FudCB0byBnZXQgdGhvc2UgbG9ncyBhbmQgaW50ZWdyYXRlIGluXG4gICAgdGhlIGNvbnRleHQgb2YgdGhlIHBhcmVudCBwcm9jZXNzXG4gKi9cbmV4cG9ydHMubGlua1doeUNvbnRleHQgPSBmdW5jdGlvbihjaGlsZFByb2Nlc3Msc3RlcE5hbWUpe1xuICAgIHZhciBvbk1lc3NhZ2UgPSB1bmRlZmluZWQ7XG4gICAgaWYoIWNoaWxkUHJvY2Vzcy5fZXZlbnRzWydtZXNzYWdlJ10pe1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNhbGxiYWNrcyBmb3IgJ21lc3NhZ2UnIGV2ZW50IG11c3QgYmUgcmVnaXN0ZXJlZCBiZWZvcmUgbGlua2luZyB3aXRoIHRoZSB3aHkgY29udGV4dCFcIilcbiAgICB9ZWxzZXtcbiAgICAgICAgb25NZXNzYWdlID0gY2hpbGRQcm9jZXNzLmV2ZW50c1snbWVzc2FnZSddXG4gICAgfVxuXG4gICAgXG4gICAgdmFyIGNhbGxpbmdQb2ludCA9IGV4cG9ydHMuZ2V0R2xvYmFsQ3VycmVudENvbnRleHQoKS5jdXJyZW50UnVubmluZ0l0ZW07XG4gICAgY2hpbGRQcm9jZXNzLm9uKCdtZXNzYWdlJyxmdW5jdGlvbihtZXNzYWdlKXtcbiAgICAgICAgaWYob25NZXNzYWdlKSB7XG4gICAgICAgICAgICBvbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKG1lc3NhZ2VbJ3doeUxvZ3MnXSl7XG4gICAgICAgICAgICBtZXNzYWdlWyd3aHlMb2dzJ10uZm9yRWFjaChmdW5jdGlvbihjb250ZXh0U3VtbWF5KSB7XG4gICAgICAgICAgICAgICAgY2FsbGluZ1BvaW50LmNoaWxkcmVuLnB1c2goe1wic3RlcFwiOnN0ZXBOYW1lLCdzdW1tYXJ5Jzpjb250ZXh0U3VtbWF5fSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9KVxufVxuIl19
