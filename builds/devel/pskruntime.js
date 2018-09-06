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

var core = $$.requireLibrary("launcher");


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
$$.__runtimeModules["util"] = require("util");
$$.__runtimeModules["path"] = require("path");

},{"assert":undefined,"crypto":undefined,"path":undefined,"util":undefined,"zlib":undefined}],4:[function(require,module,exports){
;$$.__runtimeModules["soundpubsub"] = require("soundpubsub");
$$.__runtimeModules["callflow"] = require("callflow");
$$.__runtimeModules["dicontainer"] = require("dicontainer");
$$.__runtimeModules["pskcrypto"] = require("pskcrypto");
$$.__runtimeModules["signsensus"] = require("signsensus");

},{"callflow":6,"dicontainer":17,"pskcrypto":18,"signsensus":41,"soundpubsub":42}],5:[function(require,module,exports){
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
setTimeout(function(){
    require("./pskModules");
},5000);







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
const PskCrypto = require("./lib/PskCrypto");

const ssutil = require("./signsensusDS/ssutil")

module.exports = PskCrypto;

module.exports.hashValues = ssutil.hashValues;


},{"./lib/PskCrypto":20,"./signsensusDS/ssutil":40}],19:[function(require,module,exports){
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
},{"./keyEncoder":36,"crypto":undefined}],20:[function(require,module,exports){

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
},{"./ECDSA":19,"./psk-archiver":37,"./utils/cryptoUtils":38,"crypto":undefined,"fs":undefined,"os":undefined,"path":undefined,"stream":undefined}],21:[function(require,module,exports){
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

},{"./asn1":22,"util":undefined,"vm":undefined}],22:[function(require,module,exports){
var asn1 = exports;

asn1.bignum = require('./bignum/bn');

asn1.define = require('./api').define;
asn1.base = require('./base/index');
asn1.constants = require('./constants/index');
asn1.decoders = require('./decoders/index');
asn1.encoders = require('./encoders/index');

},{"./api":21,"./base/index":24,"./bignum/bn":27,"./constants/index":29,"./decoders/index":31,"./encoders/index":34}],23:[function(require,module,exports){
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

},{"../base":24,"buffer":undefined,"util":undefined}],24:[function(require,module,exports){
var base = exports;

base.Reporter = require('./reporter').Reporter;
base.DecoderBuffer = require('./buffer').DecoderBuffer;
base.EncoderBuffer = require('./buffer').EncoderBuffer;
base.Node = require('./node');

},{"./buffer":23,"./node":25,"./reporter":26}],25:[function(require,module,exports){
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

},{"../base":24}],26:[function(require,module,exports){
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

},{"util":undefined}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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

},{"../constants":29}],29:[function(require,module,exports){
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

},{"./der":28}],30:[function(require,module,exports){
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

},{"../asn1":22,"util":undefined}],31:[function(require,module,exports){
var decoders = exports;

decoders.der = require('./der');
decoders.pem = require('./pem');

},{"./der":30,"./pem":32}],32:[function(require,module,exports){
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

},{"../asn1":22,"./der":30,"buffer":undefined,"util":undefined}],33:[function(require,module,exports){
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

},{"../asn1":22,"buffer":undefined,"util":undefined}],34:[function(require,module,exports){
var encoders = exports;

encoders.der = require('./der');
encoders.pem = require('./pem');

},{"./der":33,"./pem":35}],35:[function(require,module,exports){
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

},{"../asn1":22,"./der":33,"buffer":undefined,"util":undefined}],36:[function(require,module,exports){
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
},{"./asn1/asn1":22,"./asn1/bignum/bn":27}],37:[function(require,module,exports){
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
},{"../../../engine/core":1,"./utils/isStream":39,"fs":undefined,"path":undefined}],38:[function(require,module,exports){

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



},{"../psk-archiver":37,"./isStream":39,"crypto":undefined,"fs":undefined,"path":undefined}],39:[function(require,module,exports){
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
},{"stream":undefined}],40:[function(require,module,exports){
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
},{"crypto":undefined}],41:[function(require,module,exports){

},{}],42:[function(require,module,exports){
module.exports = {
					beesHealer: require("./lib/beesHealer"),
					soundPubSub: require("./lib/soundPubSub").soundPubSub
					//folderMQ: require("./lib/folderMQ")
};
},{"./lib/beesHealer":44,"./lib/soundPubSub":45}],43:[function(require,module,exports){
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
},{}],44:[function(require,module,exports){

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
},{}],45:[function(require,module,exports){
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
},{"./Queue":43}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9lbmdpbmUvY29yZS5qcyIsIi4uL2VuZ2luZS9mYWtlcy9kdW1teVZNLmpzIiwiLi4vZW5naW5lL3Bza2J1aWxkdGVtcC9ub2RlU2hpbXMuanMiLCIuLi9lbmdpbmUvcHNrYnVpbGR0ZW1wL3Bza01vZHVsZXMuanMiLCIuLi9lbmdpbmUvcHNrYnVpbGR0ZW1wL3Bza3J1bnRpbWUuanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2luZGV4LmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvY2hvcmVvZ3JhcGhpZXMvU3dhcm1EZWJ1Zy5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL2Nob3Jlb2dyYXBoaWVzL3N3YXJtSW5zdGFuY2VzTWFuYWdlci5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvYmFzZS5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvY2FsbGZsb3cuanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9jaG9yZW9ncmFwaGllcy91dGlsaXR5RnVuY3Rpb25zL3N3YXJtLmpzIiwiLi4vbW9kdWxlcy9jYWxsZmxvdy9saWIvbG9hZExpYnJhcnkuanMiLCIuLi9tb2R1bGVzL2NhbGxmbG93L2xpYi9wYXJhbGxlbEpvaW5Qb2ludC5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL3NhZmUtdXVpZC5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL3NlcmlhbEpvaW5Qb2ludC5qcyIsIi4uL21vZHVsZXMvY2FsbGZsb3cvbGliL3N3YXJtRGVzY3JpcHRpb24uanMiLCIuLi9tb2R1bGVzL2RpY29udGFpbmVyL2xpYi9jb250YWluZXIuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9pbmRleC5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9FQ0RTQS5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9Qc2tDcnlwdG8uanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9hcGkuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9hc24xLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvYmFzZS9idWZmZXIuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9iYXNlL2luZGV4LmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvYmFzZS9ub2RlLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvYmFzZS9yZXBvcnRlci5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2JpZ251bS9ibi5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2NvbnN0YW50cy9kZXIuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9jb25zdGFudHMvaW5kZXguanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9kZWNvZGVycy9kZXIuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvYXNuMS9kZWNvZGVycy9pbmRleC5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2RlY29kZXJzL3BlbS5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2VuY29kZXJzL2Rlci5qcyIsIi4uL21vZHVsZXMvcHNrY3J5cHRvL2xpYi9hc24xL2VuY29kZXJzL2luZGV4LmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2FzbjEvZW5jb2RlcnMvcGVtLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL2tleUVuY29kZXIuanMiLCIuLi9tb2R1bGVzL3Bza2NyeXB0by9saWIvcHNrLWFyY2hpdmVyLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL3V0aWxzL2NyeXB0b1V0aWxzLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vbGliL3V0aWxzL2lzU3RyZWFtLmpzIiwiLi4vbW9kdWxlcy9wc2tjcnlwdG8vc2lnbnNlbnN1c0RTL3NzdXRpbC5qcyIsIi4uL21vZHVsZXMvc2lnbnNlbnN1cy9saWIvaW5kZXguanMiLCIuLi9tb2R1bGVzL3NvdW5kcHVic3ViL2luZGV4LmpzIiwiLi4vbW9kdWxlcy9zb3VuZHB1YnN1Yi9saWIvUXVldWUuanMiLCIuLi9tb2R1bGVzL3NvdW5kcHVic3ViL2xpYi9iZWVzSGVhbGVyLmpzIiwiLi4vbW9kdWxlcy9zb3VuZHB1YnN1Yi9saWIvc291bmRQdWJTdWIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMWxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzl3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qXHJcbiBJbml0aWFsIExpY2Vuc2U6IChjKSBBeGlvbG9naWMgUmVzZWFyY2ggJiBBbGJvYWllIFPDrm5pY8SDLlxyXG4gQ29udHJpYnV0b3JzOiBBeGlvbG9naWMgUmVzZWFyY2ggLCBQcml2YXRlU2t5IHByb2plY3RcclxuIENvZGUgTGljZW5zZTogTEdQTCBvciBNSVQuXHJcbiAqL1xyXG5cclxuXHJcbnZhciBjYWxsZmxvd01vZHVsZSA9IHJlcXVpcmUoXCIuLy4uL21vZHVsZXMvY2FsbGZsb3dcIik7XHJcblxyXG5cclxuXHJcbmV4cG9ydHMuZW5hYmxlVGVzdGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmVxdWlyZShcIi4vZmFrZXMvZHVtbXlWTVwiKTtcclxufVxyXG5cclxudmFyIGNvcmUgPSAkJC5yZXF1aXJlTGlicmFyeShcImxhdW5jaGVyXCIpO1xyXG5cclxuXHJcbi8vVE9ETzogU0hPVUxEIGJlIG1vdmVkIGluICQkLl9fZ2xvYmFsc1xyXG4kJC5lbnN1cmVGb2xkZXJFeGlzdHMgPSBmdW5jdGlvbihmb2xkZXIsIGNhbGxiYWNrKXtcclxuXHJcbiAgICB2YXIgZmxvdyA9ICQkLmZsb3cuc3RhcnQoY29yZS5ta0RpclJlYyk7XHJcbiAgICBmbG93Lm1ha2UoZm9sZGVyLCBjYWxsYmFjayk7XHJcbn07XHJcblxyXG4kJC5lbnN1cmVMaW5rRXhpc3RzID0gZnVuY3Rpb24oZXhpc3RpbmdQYXRoLCBuZXdQYXRoLCBjYWxsYmFjayl7XHJcblxyXG4gICAgdmFyIGZsb3cgPSAkJC5mbG93LnN0YXJ0KGNvcmUubWtEaXJSZWMpO1xyXG4gICAgZmxvdy5tYWtlTGluayhleGlzdGluZ1BhdGgsIG5ld1BhdGgsIGNhbGxiYWNrKTtcclxufTsiLCJmdW5jdGlvbiBkdW1teVZNKG5hbWUpe1xyXG5cdGZ1bmN0aW9uIHNvbHZlU3dhcm0oc3dhcm0pe1xyXG5cdFx0JCQuc3dhcm1zSW5zdGFuY2VzTWFuYWdlci5yZXZpdmVfc3dhcm0oc3dhcm0pO1xyXG5cdH1cclxuXHJcblx0JCQuUFNLX1B1YlN1Yi5zdWJzY3JpYmUobmFtZSwgc29sdmVTd2FybSk7XHJcblx0Y29uc29sZS5sb2coXCJDcmVhdGluZyBhIGZha2UgZXhlY3V0aW9uIGNvbnRleHQuLi5cIik7XHJcbn1cclxuXHJcbmdsb2JhbC52bSA9IGR1bW15Vk0oJCQuQ09OU1RBTlRTLlNXQVJNX0ZPUl9FWEVDVVRJT04pOyIsIjskJC5fX3J1bnRpbWVNb2R1bGVzW1wiYXNzZXJ0XCJdID0gcmVxdWlyZShcImFzc2VydFwiKTtcbiQkLl9fcnVudGltZU1vZHVsZXNbXCJjcnlwdG9cIl0gPSByZXF1aXJlKFwiY3J5cHRvXCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcInpsaWJcIl0gPSByZXF1aXJlKFwiemxpYlwiKTtcbiQkLl9fcnVudGltZU1vZHVsZXNbXCJ1dGlsXCJdID0gcmVxdWlyZShcInV0aWxcIik7XG4kJC5fX3J1bnRpbWVNb2R1bGVzW1wicGF0aFwiXSA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuIiwiOyQkLl9fcnVudGltZU1vZHVsZXNbXCJzb3VuZHB1YnN1YlwiXSA9IHJlcXVpcmUoXCJzb3VuZHB1YnN1YlwiKTtcbiQkLl9fcnVudGltZU1vZHVsZXNbXCJjYWxsZmxvd1wiXSA9IHJlcXVpcmUoXCJjYWxsZmxvd1wiKTtcbiQkLl9fcnVudGltZU1vZHVsZXNbXCJkaWNvbnRhaW5lclwiXSA9IHJlcXVpcmUoXCJkaWNvbnRhaW5lclwiKTtcbiQkLl9fcnVudGltZU1vZHVsZXNbXCJwc2tjcnlwdG9cIl0gPSByZXF1aXJlKFwicHNrY3J5cHRvXCIpO1xuJCQuX19ydW50aW1lTW9kdWxlc1tcInNpZ25zZW5zdXNcIl0gPSByZXF1aXJlKFwic2lnbnNlbnN1c1wiKTtcbiIsImlmKHR5cGVvZihnbG9iYWwpID09IFwidW5kZWZpbmVkXCIpe1xyXG4gICAgaWYodHlwZW9mKHdpbmRvdykgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICBnbG9iYWwgPSB3aW5kb3c7XHJcbiAgICB9XHJcbn1cclxuXHJcbmlmKHR5cGVvZihnbG9iYWwuJCQpID09IFwidW5kZWZpbmVkXCIpe1xyXG4gICAgZ2xvYmFsLiQkID0ge307XHJcblxyXG4gICAgaWYodHlwZW9mKHdpbmRvdykgPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHdpbmRvdyA9IGdsb2JhbDtcclxuICAgIH1cclxuICAgIHdpbmRvdy4kJCA9IGdsb2JhbC4kJDtcclxufVxyXG5cclxuaWYodHlwZW9mKCQkW1wiX19ydW50aW1lTW9kdWxlc1wiXSkgPT0gXCJ1bmRlZmluZWRcIil7XHJcbiAgICAkJC5fX3J1bnRpbWVNb2R1bGVzID0ge307XHJcbiAgICBjb25zb2xlLmxvZyhcIkRlZmluaW5nICQkLl9fcnVudGltZU1vZHVsZXNcIiwgJCQuX19ydW50aW1lTW9kdWxlcylcclxufVxyXG5cclxuaWYodHlwZW9mKCQkW1wiYnJvd3NlclJ1bnRpbWVcIl0pID09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgIHJlcXVpcmUoXCIuL25vZGVTaGltc1wiKVxyXG59IGVsc2Uge1xyXG4gICAgY29uc29sZS5sb2coXCJEZWZpbmluZyBmcy4uLlwiKTtcclxuICAgICQkLl9fcnVudGltZU1vZHVsZXNbXCJmc1wiXSA9IHtcclxuXHJcbiAgICB9O1xyXG59XHJcbmdsb2JhbC5yZXF1aXJlID0gJCQucmVxdWlyZTtcclxuc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgcmVxdWlyZShcIi4vcHNrTW9kdWxlc1wiKTtcclxufSw1MDAwKTtcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuIiwiXHJcbi8vdmFyIHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRFcnJvckhhbmRsaW5nSW1wbGVtZW50YXRpb24oZXJyLCByZXMpe1xyXG5cdC8vY29uc29sZS5sb2coZXJyLnN0YWNrKTtcclxuXHRpZihlcnIpIHRocm93IGVycjtcclxuXHRyZXR1cm4gcmVzO1xyXG59XHJcblxyXG5cclxuaWYodHlwZW9mKGdsb2JhbC4kJCkgPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgZ2xvYmFsLiQkID0ge307XHJcbn1cclxuXHJcbiQkLmVycm9ySGFuZGxlciA9IHtcclxuICAgICAgICBlcnJvcjpmdW5jdGlvbihlcnIsIGFyZ3MsIG1zZyl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVyciwgXCJVbmtub3duIGVycm9yIGZyb20gZnVuY3Rpb24gY2FsbCB3aXRoIGFyZ3VtZW50czpcIiwgYXJncywgXCJNZXNzYWdlOlwiLCBtc2cpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGhyb3dFcnJvcjpmdW5jdGlvbihlcnIsIGFyZ3MsIG1zZyl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVyciwgXCJVbmtub3duIGVycm9yIGZyb20gZnVuY3Rpb24gY2FsbCB3aXRoIGFyZ3VtZW50czpcIiwgYXJncywgXCJNZXNzYWdlOlwiLCBtc2cpO1xyXG4gICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpZ25vcmVQb3NzaWJsZUVycm9yOiBmdW5jdGlvbihuYW1lKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobmFtZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzeW50YXhFcnJvcjpmdW5jdGlvbihwcm9wZXJ0eSwgc3dhcm0sIHRleHQpe1xyXG4gICAgICAgICAgICAvL3Rocm93IG5ldyBFcnJvcihcIk1pc3NwZWxsZWQgbWVtYmVyIG5hbWUgb3Igb3RoZXIgaW50ZXJuYWwgZXJyb3IhXCIpO1xyXG4gICAgICAgICAgICB2YXIgc3dhcm1OYW1lO1xyXG4gICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgICAgICBpZih0eXBlb2Ygc3dhcm0gPT0gXCJzdHJpbmdcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1OYW1lID0gc3dhcm07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2VcclxuICAgICAgICAgICAgICAgIGlmKHN3YXJtICYmIHN3YXJtLm1ldGEpe1xyXG4gICAgICAgICAgICAgICAgICAgIHN3YXJtTmFtZSAgPSBzd2FybS5tZXRhLnN3YXJtVHlwZU5hbWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3YXJtTmFtZSA9IHN3YXJtLmdldElubmVyVmFsdWUoKS5tZXRhLnN3YXJtVHlwZU5hbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICAgICAgICAgIHN3YXJtTmFtZSA9IGVyci50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHByb3BlcnR5KXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiV3JvbmcgbWVtYmVyIG5hbWUgXCIsIHByb3BlcnR5LCAgXCIgaW4gc3dhcm0gXCIsIHN3YXJtTmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZih0ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVua25vd24gc3dhcm1cIiwgc3dhcm1OYW1lKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9LFxyXG4gICAgICAgIHdhcm5pbmc6ZnVuY3Rpb24obXNnKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobXNnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuJCQudWlkR2VuZXJhdG9yID0gcmVxdWlyZShcIi4vbGliL3NhZmUtdXVpZFwiKTtcclxuXHJcbiQkLnNhZmVFcnJvckhhbmRsaW5nID0gZnVuY3Rpb24oY2FsbGJhY2spe1xyXG4gICAgICAgIGlmKGNhbGxiYWNrKXtcclxuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrO1xyXG4gICAgICAgIH0gZWxzZXtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRFcnJvckhhbmRsaW5nSW1wbGVtZW50YXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiQkLl9faW50ZXJuID0ge1xyXG4gICAgICAgIG1rQXJnczpmdW5jdGlvbihhcmdzLHBvcyl7XHJcbiAgICAgICAgICAgIHZhciBhcmdzQXJyYXkgPSBbXTtcclxuICAgICAgICAgICAgZm9yKHZhciBpID0gcG9zOyBpIDwgYXJncy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICBhcmdzQXJyYXkucHVzaChhcmdzW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYXJnc0FycmF5O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4kJC5fX2dsb2JhbCA9IHtcclxuXHJcbiAgICB9O1xyXG5cclxuXHJcbiQkLl9fZ2xvYmFsLm9yaWdpbmFsUmVxdWlyZSA9IHJlcXVpcmU7XHJcblxyXG5pZih0eXBlb2YoJCQuX19ydW50aW1lTW9kdWxlcykgPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgJCQuX19ydW50aW1lTW9kdWxlcyA9IHt9O1xyXG59XHJcblxyXG5cclxuLypcclxuIHJlcXVpcmUgYW5kIHJlcXVpcmVMaWJyYXJ5IGFyZSBvdmVyd3JpdGluZyB0aGUgbm9kZS5qcyBkZWZhdWx0cyBpbiBsb2FkaW5nIG1vZHVsZXMgZm9yIGluY3JlYXNpbmcgc2VjdXJpdHkgYW5kIHNwZWVkLlxyXG4gV2UgZ3VhcmFudGVlIHRoYXQgZWFjaCBtb2R1bGUgb3IgbGlicmFyeSBpcyBsb2FkZWQgb25seSBvbmNlIGFuZCBvbmx5IGZyb20gYSBzaW5nbGUgZm9sZGVyLi4uIFVzZSB0aGUgc3RhbmRhcmQgcmVxdWlyZSBpZiB5b3UgbmVlZCBzb21ldGhpbmcgZWxzZSFcclxuXHJcbiBCeSBkZWZhdWx0IHdlIGV4cGVjdCB0byBydW4gZnJvbSBhIHByaXZhdGVza3kgVk0gZW5naW5lICggYSBwcml2YXRlc2t5IG5vZGUpIGFuZCB0aGVyZWZvcmUgdGhlIGNhbGxmbG93IHN0YXlzIGluIHRoZSBtb2R1bGVzIGZvbGRlciB0aGVyZS5cclxuIEFueSBuZXcgdXNlIG9mIGNhbGxmbG93IChhbmQgcmVxdWlyZSBvciByZXF1aXJlTGlicmFyeSkgY291bGQgcmVxdWlyZSBjaGFuZ2VzIHRvICQkLl9fZ2xvYmFsLl9fbG9hZExpYnJheVJvb3QgYW5kICQkLl9fZ2xvYmFsLl9fbG9hZE1vZHVsZXNSb290XHJcbiAqL1xyXG4vLyQkLl9fZ2xvYmFsLl9fbG9hZExpYnJhcnlSb290ICAgID0gX19kaXJuYW1lICsgXCIvLi4vLi4vbGlicmFyaWVzL1wiO1xyXG4vLyQkLl9fZ2xvYmFsLl9fbG9hZE1vZHVsZXNSb290ICAgPSBfX2Rpcm5hbWUgKyBcIi8uLi8uLi9tb2R1bGVzL1wiO1xyXG5cclxudmFyIGxvYWRlZE1vZHVsZXMgPSB7fTtcclxuJCQucmVxdWlyZSA9IGZ1bmN0aW9uKG5hbWUpe1xyXG5cdHZhciBleGlzdGluZ01vZHVsZSA9IGxvYWRlZE1vZHVsZXNbbmFtZV07XHJcblxyXG5cdGlmKCFleGlzdGluZ01vZHVsZSl7XHJcbiAgICAgICAgZXhpc3RpbmdNb2R1bGUgPSAkJC5fX3J1bnRpbWVNb2R1bGVzW25hbWVdO1xyXG4gICAgICAgIGlmKCFleGlzdGluZ01vZHVsZSl7XHJcbiAgICAgICAgICAgIC8vdmFyIGFic29sdXRlUGF0aCA9IHBhdGgucmVzb2x2ZSggJCQuX19nbG9iYWwuX19sb2FkTW9kdWxlc1Jvb3QgKyBuYW1lKTtcclxuICAgICAgICAgICAgZXhpc3RpbmdNb2R1bGUgPSAkJC5fX2dsb2JhbC5vcmlnaW5hbFJlcXVpcmUobmFtZSk7XHJcbiAgICAgICAgICAgIGxvYWRlZE1vZHVsZXNbbmFtZV0gPSBleGlzdGluZ01vZHVsZTtcclxuICAgICAgICB9XHJcblx0fVxyXG5cdHJldHVybiBleGlzdGluZ01vZHVsZTtcclxufTtcclxuXHJcbnZhciBzd2FybVV0aWxzID0gcmVxdWlyZShcIi4vbGliL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvc3dhcm1cIik7XHJcblxyXG4kJC5kZWZhdWx0RXJyb3JIYW5kbGluZ0ltcGxlbWVudGF0aW9uID0gZGVmYXVsdEVycm9ySGFuZGxpbmdJbXBsZW1lbnRhdGlvbjtcclxuXHJcbnZhciBjYWxsZmxvd01vZHVsZSA9IHJlcXVpcmUoXCIuL2xpYi9zd2FybURlc2NyaXB0aW9uXCIpO1xyXG4kJC5jYWxsZmxvd3MgICAgICAgID0gY2FsbGZsb3dNb2R1bGUuY3JlYXRlU3dhcm1FbmdpbmUoXCJjYWxsZmxvd1wiKTtcclxuJCQuY2FsbGZsb3cgICAgICAgICA9ICQkLmNhbGxmbG93cztcclxuJCQuZmxvdyAgICAgICAgICAgICA9ICQkLmNhbGxmbG93cztcclxuJCQuZmxvd3MgICAgICAgICAgICA9ICQkLmNhbGxmbG93cztcclxuXHJcbiQkLnN3YXJtcyAgICAgICAgICAgPSBjYWxsZmxvd01vZHVsZS5jcmVhdGVTd2FybUVuZ2luZShcInN3YXJtXCIsIHN3YXJtVXRpbHMpO1xyXG4kJC5zd2FybSAgICAgICAgICAgID0gJCQuc3dhcm1zO1xyXG4kJC5jb250cmFjdHMgICAgICAgID0gY2FsbGZsb3dNb2R1bGUuY3JlYXRlU3dhcm1FbmdpbmUoXCJjb250cmFjdFwiLCBzd2FybVV0aWxzKTtcclxuJCQuY29udHJhY3QgICAgICAgICA9ICQkLmNvbnRyYWN0cztcclxuXHJcblxyXG4kJC5QU0tfUHViU3ViID0gJCQucmVxdWlyZShcInNvdW5kcHVic3ViXCIpLnNvdW5kUHViU3ViO1xyXG5cclxuJCQuc2VjdXJpdHlDb250ZXh0ID0gXCJzeXN0ZW1cIjtcclxuJCQubGlicmFyeVByZWZpeCA9IFwiZ2xvYmFsXCI7XHJcbiQkLmxpYnJhcmllcyA9IHtcclxuICAgIGdsb2JhbDp7XHJcblxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcblxyXG4kJC5sb2FkTGlicmFyeSA9IHJlcXVpcmUoXCIuL2xpYi9sb2FkTGlicmFyeVwiKS5sb2FkTGlicmFyeTtcclxuXHJcbiQkLnJlcXVpcmVMaWJyYXJ5ID0gZnVuY3Rpb24obmFtZSl7XHJcbiAgICAvL3ZhciBhYnNvbHV0ZVBhdGggPSBwYXRoLnJlc29sdmUoICAkJC5fX2dsb2JhbC5fX2xvYWRMaWJyYXJ5Um9vdCArIG5hbWUpO1xyXG4gICAgcmV0dXJuICQkLmxvYWRMaWJyYXJ5KG5hbWUsbmFtZSk7XHJcbn07XHJcblxyXG4kJC5yZWdpc3RlclN3YXJtRGVzY3JpcHRpb24gPSAgZnVuY3Rpb24obGlicmFyeU5hbWUsc2hvcnROYW1lLCBkZXNjcmlwdGlvbil7XHJcbiAgICBpZighJCQubGlicmFyaWVzW2xpYnJhcnlOYW1lXSl7XHJcbiAgICAgICAgJCQubGlicmFyaWVzW2xpYnJhcnlOYW1lXSA9IHt9O1xyXG4gICAgfVxyXG4gICAgJCQubGlicmFyaWVzW2xpYnJhcnlOYW1lXVtzaG9ydE5hbWVdID0gZGVzY3JpcHRpb247XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgXHRcdFx0XHRjcmVhdGVTd2FybUVuZ2luZTogcmVxdWlyZShcIi4vbGliL3N3YXJtRGVzY3JpcHRpb25cIikuY3JlYXRlU3dhcm1FbmdpbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlSm9pblBvaW50OiByZXF1aXJlKFwiLi9saWIvcGFyYWxsZWxKb2luUG9pbnRcIikuY3JlYXRlSm9pblBvaW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZVNlcmlhbEpvaW5Qb2ludDogcmVxdWlyZShcIi4vbGliL3NlcmlhbEpvaW5Qb2ludFwiKS5jcmVhdGVTZXJpYWxKb2luUG9pbnQsXHJcblx0XHRcdFx0XHRcInNhZmUtdXVpZFwiOiByZXF1aXJlKFwiLi9saWIvc2FmZS11dWlkXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgIHN3YXJtSW5zdGFuY2VNYW5hZ2VyOiByZXF1aXJlKFwiLi9saWIvY2hvcmVvZ3JhcGhpZXMvc3dhcm1JbnN0YW5jZXNNYW5hZ2VyXCIpXHJcblx0XHRcdFx0fTsiLCIvKlxyXG5Jbml0aWFsIExpY2Vuc2U6IChjKSBBeGlvbG9naWMgUmVzZWFyY2ggJiBBbGJvYWllIFPDrm5pY8SDLlxyXG5Db250cmlidXRvcnM6IEF4aW9sb2dpYyBSZXNlYXJjaCAsIFByaXZhdGVTa3kgcHJvamVjdFxyXG5Db2RlIExpY2Vuc2U6IExHUEwgb3IgTUlULlxyXG4qL1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcclxudmFyIGZzID0gcmVxdWlyZShcImZzXCIpO1xyXG5nbG9iYWwuY3ByaW50ID0gY29uc29sZS5sb2c7XHJcbmdsb2JhbC53cHJpbnQgPSBjb25zb2xlLndhcm47XHJcbmdsb2JhbC5kcHJpbnQgPSBjb25zb2xlLmRlYnVnO1xyXG5nbG9iYWwuZXByaW50ID0gY29uc29sZS5lcnJvcjtcclxuXHJcblxyXG4vKipcclxuICogU2hvcnRjdXQgdG8gSlNPTi5zdHJpbmdpZnlcclxuICogQHBhcmFtIG9ialxyXG4gKi9cclxuZ2xvYmFsLkogPSBmdW5jdGlvbiAob2JqKSB7XHJcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqKTtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBQcmludCBzd2FybSBjb250ZXh0cyAoTWVzc2FnZXMpIGFuZCBlYXNpZXIgdG8gcmVhZCBjb21wYXJlZCB3aXRoIEpcclxuICogQHBhcmFtIG9ialxyXG4gKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAqL1xyXG5leHBvcnRzLmNsZWFuRHVtcCA9IGZ1bmN0aW9uIChvYmopIHtcclxuICAgIHZhciBvID0gb2JqLnZhbHVlT2YoKTtcclxuICAgIHZhciBtZXRhID0ge1xyXG4gICAgICAgIHN3YXJtVHlwZU5hbWU6by5tZXRhLnN3YXJtVHlwZU5hbWVcclxuICAgIH07XHJcbiAgICByZXR1cm4gXCJcXHQgc3dhcm1JZDogXCIgKyBvLm1ldGEuc3dhcm1JZCArIFwie1xcblxcdFxcdG1ldGE6IFwiICAgICsgSihtZXRhKSArXHJcbiAgICAgICAgXCJcXG5cXHRcXHRwdWJsaWM6IFwiICAgICAgICArIEooby5wdWJsaWNWYXJzKSArXHJcbiAgICAgICAgXCJcXG5cXHRcXHRwcm90ZWN0ZWQ6IFwiICAgICArIEooby5wcm90ZWN0ZWRWYXJzKSArXHJcbiAgICAgICAgXCJcXG5cXHRcXHRwcml2YXRlOiBcIiAgICAgICArIEooby5wcml2YXRlVmFycykgKyBcIlxcblxcdH1cXG5cIjtcclxufVxyXG5cclxuLy9NID0gZXhwb3J0cy5jbGVhbkR1bXA7XHJcbi8qKlxyXG4gKiBFeHBlcmltZW50YWwgZnVuY3Rpb25zXHJcbiAqL1xyXG5cclxuXHJcbi8qXHJcblxyXG5sb2dnZXIgICAgICA9IG1vbml0b3IubG9nZ2VyO1xyXG5hc3NlcnQgICAgICA9IG1vbml0b3IuYXNzZXJ0O1xyXG50aHJvd2luZyAgICA9IG1vbml0b3IuZXhjZXB0aW9ucztcclxuXHJcblxyXG52YXIgdGVtcG9yYXJ5TG9nQnVmZmVyID0gW107XHJcblxyXG52YXIgY3VycmVudFN3YXJtQ29tSW1wbCA9IG51bGw7XHJcblxyXG5sb2dnZXIucmVjb3JkID0gZnVuY3Rpb24ocmVjb3JkKXtcclxuICAgIGlmKGN1cnJlbnRTd2FybUNvbUltcGw9PT1udWxsKXtcclxuICAgICAgICB0ZW1wb3JhcnlMb2dCdWZmZXIucHVzaChyZWNvcmQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjdXJyZW50U3dhcm1Db21JbXBsLnJlY29yZExvZyhyZWNvcmQpO1xyXG4gICAgfVxyXG59XHJcblxyXG52YXIgY29udGFpbmVyID0gcmVxdWlyZShcImRpY29udGFpbmVyXCIpLmNvbnRhaW5lcjtcclxuXHJcbmNvbnRhaW5lci5zZXJ2aWNlKFwic3dhcm1Mb2dnaW5nTW9uaXRvclwiLCBbXCJzd2FybWluZ0lzV29ya2luZ1wiLCBcInN3YXJtQ29tSW1wbFwiXSwgZnVuY3Rpb24ob3V0T2ZTZXJ2aWNlLHN3YXJtaW5nLCBzd2FybUNvbUltcGwpe1xyXG5cclxuICAgIGlmKG91dE9mU2VydmljZSl7XHJcbiAgICAgICAgaWYoIXRlbXBvcmFyeUxvZ0J1ZmZlcil7XHJcbiAgICAgICAgICAgIHRlbXBvcmFyeUxvZ0J1ZmZlciA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIHRtcCA9IHRlbXBvcmFyeUxvZ0J1ZmZlcjtcclxuICAgICAgICB0ZW1wb3JhcnlMb2dCdWZmZXIgPSBbXTtcclxuICAgICAgICBjdXJyZW50U3dhcm1Db21JbXBsID0gc3dhcm1Db21JbXBsO1xyXG4gICAgICAgIGxvZ2dlci5yZWNvcmQgPSBmdW5jdGlvbihyZWNvcmQpe1xyXG4gICAgICAgICAgICBjdXJyZW50U3dhcm1Db21JbXBsLnJlY29yZExvZyhyZWNvcmQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdG1wLmZvckVhY2goZnVuY3Rpb24ocmVjb3JkKXtcclxuICAgICAgICAgICAgbG9nZ2VyLnJlY29yZChyZWNvcmQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KVxyXG5cclxuKi9cclxuZ2xvYmFsLnVuY2F1Z2h0RXhjZXB0aW9uU3RyaW5nID0gXCJcIjtcclxuZ2xvYmFsLnVuY2F1Z2h0RXhjZXB0aW9uRXhpc3RzID0gZmFsc2U7XHJcbmlmKHR5cGVvZiBnbG9iYWwuZ2xvYmFsVmVyYm9zaXR5ID09ICd1bmRlZmluZWQnKXtcclxuICAgIGdsb2JhbC5nbG9iYWxWZXJib3NpdHkgPSBmYWxzZTtcclxufVxyXG5cclxudmFyIERFQlVHX1NUQVJUX1RJTUUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHJcbmZ1bmN0aW9uIGdldERlYnVnRGVsdGEoKXtcclxuICAgIHZhciBjdXJyZW50VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgcmV0dXJuIGN1cnJlbnRUaW1lIC0gREVCVUdfU1RBUlRfVElNRTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlYnVnIGZ1bmN0aW9ucywgaW5mbHVlbmNlZCBieSBnbG9iYWxWZXJib3NpdHkgZ2xvYmFsIHZhcmlhYmxlXHJcbiAqIEBwYXJhbSB0eHRcclxuICovXHJcbmRwcmludCA9IGZ1bmN0aW9uICh0eHQpIHtcclxuICAgIGlmIChnbG9iYWxWZXJib3NpdHkgPT0gdHJ1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzQWRhcHRlci5pbml0aWxpc2VkICkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHOiBbXCIgKyB0aGlzQWRhcHRlci5ub2RlTmFtZSArIFwiXShcIiArIGdldERlYnVnRGVsdGEoKSsgXCIpOlwiK3R4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHOiAoXCIgKyBnZXREZWJ1Z0RlbHRhKCkrIFwiKTpcIit0eHQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRFQlVHOiBcIiArIHR4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogb2Jzb2xldGUhP1xyXG4gKiBAcGFyYW0gdHh0XHJcbiAqL1xyXG5nbG9iYWwuYXByaW50ID0gZnVuY3Rpb24gKHR4dCkge1xyXG4gICAgY29uc29sZS5sb2coXCJERUJVRzogW1wiICsgdGhpc0FkYXB0ZXIubm9kZU5hbWUgKyBcIl06IFwiICsgdHh0KTtcclxufVxyXG5cclxuXHJcblxyXG4vKipcclxuICogVXRpbGl0eSBmdW5jdGlvbiB1c3VhbGx5IHVzZWQgaW4gdGVzdHMsIGV4aXQgY3VycmVudCBwcm9jZXNzIGFmdGVyIGEgd2hpbGVcclxuICogQHBhcmFtIG1zZ1xyXG4gKiBAcGFyYW0gdGltZW91dFxyXG4gKi9cclxuZ2xvYmFsLmRlbGF5RXhpdCA9IGZ1bmN0aW9uIChtc2csIHJldENvZGUsdGltZW91dCkge1xyXG4gICAgaWYocmV0Q29kZSA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgIHJldENvZGUgPSBFeGl0Q29kZXMuVW5rbm93bkVycm9yO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKHRpbWVvdXQgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICB0aW1lb3V0ID0gMTAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKG1zZyA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgIG1zZyA9IFwiRGVsYXlpbmcgZXhpdCB3aXRoIFwiKyB0aW1lb3V0ICsgXCJtc1wiO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKG1zZyk7XHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBwcm9jZXNzLmV4aXQocmV0Q29kZSk7XHJcbiAgICB9LCB0aW1lb3V0KTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGxvY2FsTG9nIChsb2dUeXBlLCBtZXNzYWdlLCBlcnIpIHtcclxuICAgIHZhciB0aW1lID0gbmV3IERhdGUoKTtcclxuICAgIHZhciBub3cgPSB0aW1lLmdldERhdGUoKSArIFwiLVwiICsgKHRpbWUuZ2V0TW9udGgoKSArIDEpICsgXCIsXCIgKyB0aW1lLmdldEhvdXJzKCkgKyBcIjpcIiArIHRpbWUuZ2V0TWludXRlcygpO1xyXG4gICAgdmFyIG1zZztcclxuXHJcbiAgICBtc2cgPSAnWycgKyBub3cgKyAnXVsnICsgdGhpc0FkYXB0ZXIubm9kZU5hbWUgKyAnXSAnICsgbWVzc2FnZTtcclxuXHJcbiAgICBpZiAoZXJyICE9IG51bGwgJiYgZXJyICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIG1zZyArPSAnXFxuICAgICBFcnI6ICcgKyBlcnIudG9TdHJpbmcoKTtcclxuICAgICAgICBpZiAoZXJyLnN0YWNrICYmIGVyci5zdGFjayAhPSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIG1zZyArPSAnXFxuICAgICBTdGFjazogJyArIGVyci5zdGFjayArICdcXG4nO1xyXG4gICAgfVxyXG5cclxuICAgIGNwcmludChtc2cpO1xyXG4gICAgaWYodGhpc0FkYXB0ZXIuaW5pdGlsaXNlZCl7XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICBmcy5hcHBlbmRGaWxlU3luYyhnZXRTd2FybUZpbGVQYXRoKHRoaXNBZGFwdGVyLmNvbmZpZy5sb2dzUGF0aCArIFwiL1wiICsgbG9nVHlwZSksIG1zZyk7XHJcbiAgICAgICAgfSBjYXRjaChlcnIpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZhaWxpbmcgdG8gd3JpdGUgbG9ncyBpbiBcIiwgdGhpc0FkYXB0ZXIuY29uZmlnLmxvZ3NQYXRoICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufVxyXG5cclxuXHJcbmdsb2JhbC5wcmludGYgPSBmdW5jdGlvbiAoLi4ucGFyYW1zKSB7XHJcbiAgICB2YXIgYXJncyA9IFtdOyAvLyBlbXB0eSBhcnJheVxyXG4gICAgLy8gY29weSBhbGwgb3RoZXIgYXJndW1lbnRzIHdlIHdhbnQgdG8gXCJwYXNzIHRocm91Z2hcIlxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhcmdzLnB1c2gocGFyYW1zW2ldKTtcclxuICAgIH1cclxuICAgIHZhciBvdXQgPSB1dGlsLmZvcm1hdC5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgIGNvbnNvbGUubG9nKG91dCk7XHJcbn1cclxuXHJcbmdsb2JhbC5zcHJpbnRmID0gZnVuY3Rpb24gKC4uLnBhcmFtcykge1xyXG4gICAgdmFyIGFyZ3MgPSBbXTsgLy8gZW1wdHkgYXJyYXlcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgYXJncy5wdXNoKHBhcmFtc1tpXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdXRpbC5mb3JtYXQuYXBwbHkodGhpcywgYXJncyk7XHJcbn1cclxuXHJcbiIsIlxyXG5cclxuZnVuY3Rpb24gU3dhcm1zSW5zdGFuY2VzTWFuYWdlcigpe1xyXG4gICAgdmFyIHN3YXJtQWxpdmVJbnN0YW5jZXMgPSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMud2FpdEZvclN3YXJtID0gZnVuY3Rpb24oY2FsbGJhY2ssIHN3YXJtLCBrZWVwQWxpdmVDaGVjayl7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRvTG9naWMoKXtcclxuICAgICAgICAgICAgdmFyIHN3YXJtSWQgPSBzd2FybS5nZXRJbm5lclZhbHVlKCkubWV0YS5zd2FybUlkO1xyXG4gICAgICAgICAgICB2YXIgd2F0Y2hlciA9IHN3YXJtQWxpdmVJbnN0YW5jZXNbc3dhcm1JZF07XHJcbiAgICAgICAgICAgIGlmKCF3YXRjaGVyKXtcclxuICAgICAgICAgICAgICAgIHdhdGNoZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dhcm06c3dhcm0sXHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6Y2FsbGJhY2ssXHJcbiAgICAgICAgICAgICAgICAgICAga2VlcEFsaXZlQ2hlY2s6a2VlcEFsaXZlQ2hlY2tcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN3YXJtQWxpdmVJbnN0YW5jZXNbc3dhcm1JZF0gPSB3YXRjaGVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBmaWx0ZXIoKXtcclxuICAgICAgICAgICAgcmV0dXJuIHN3YXJtLmdldElubmVyVmFsdWUoKS5tZXRhLnN3YXJtSWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyQkLnVpZEdlbmVyYXRvci53YWl0X2Zvcl9jb25kaXRpb24oY29uZGl0aW9uLGRvTG9naWMpO1xyXG4gICAgICAgIHN3YXJtLm9ic2VydmUoZG9Mb2dpYywgbnVsbCwgZmlsdGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjbGVhblN3YXJtV2FpdGVyKHN3YXJtU2VyaWFsaXNhdGlvbil7IC8vIFRPRE86IGFkZCBiZXR0ZXIgbWVjaGFuaXNtcyB0byBwcmV2ZW50IG1lbW9yeSBsZWFrc1xyXG4gICAgICAgIHZhciBzd2FybUlkID0gc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuc3dhcm1JZDtcclxuICAgICAgICB2YXIgd2F0Y2hlciA9IHN3YXJtQWxpdmVJbnN0YW5jZXNbc3dhcm1JZF07XHJcblxyXG4gICAgICAgIGlmKCF3YXRjaGVyKXtcclxuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLndhcm5pbmcoXCJJbnZhbGlkIHN3YXJtIHJlY2VpdmVkOiBcIiArIHN3YXJtSWQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgYXJncyA9IHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmFyZ3M7XHJcbiAgICAgICAgYXJncy5wdXNoKHN3YXJtU2VyaWFsaXNhdGlvbik7XHJcblxyXG4gICAgICAgIHdhdGNoZXIuY2FsbGJhY2suYXBwbHkobnVsbCwgYXJncyk7XHJcbiAgICAgICAgaWYoIXdhdGNoZXIua2VlcEFsaXZlQ2hlY2soKSl7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBzd2FybUFsaXZlSW5zdGFuY2VzW3N3YXJtSWRdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJldml2ZV9zd2FybSA9IGZ1bmN0aW9uKHN3YXJtU2VyaWFsaXNhdGlvbil7XHJcblxyXG5cclxuICAgICAgICB2YXIgc3dhcm1JZCAgICAgPSBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5zd2FybUlkO1xyXG4gICAgICAgIHZhciBzd2FybVR5cGUgICA9IHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLnN3YXJtVHlwZU5hbWU7XHJcbiAgICAgICAgdmFyIGluc3RhbmNlICAgID0gc3dhcm1BbGl2ZUluc3RhbmNlc1tzd2FybUlkXTtcclxuXHJcbiAgICAgICAgdmFyIHN3YXJtO1xyXG5cclxuICAgICAgICBpZihpbnN0YW5jZSl7XHJcbiAgICAgICAgICAgIHN3YXJtID0gaW5zdGFuY2Uuc3dhcm07XHJcblxyXG4gICAgICAgIH0gICBlbHNlIHtcclxuICAgICAgICAgICAgc3dhcm0gPSAkJC5zd2FybS5jcmVhdGUoc3dhcm1UeXBlLCB1bmRlZmluZWQsIHN3YXJtU2VyaWFsaXNhdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5jb21tYW5kID09IFwiYXN5bmNSZXR1cm5cIil7XHJcbiAgICAgICAgICAgIGNsZWFuU3dhcm1XYWl0ZXIoc3dhcm1TZXJpYWxpc2F0aW9uKTtcclxuICAgICAgICB9IGVsc2UgICAgIGlmKHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmNvbW1hbmQgPT0gXCJleGVjdXRlU3dhcm1QaGFzZVwiKXtcclxuICAgICAgICAgICAgc3dhcm0ucnVuUGhhc2Uoc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEucGhhc2VOYW1lLCBzd2FybVNlcmlhbGlzYXRpb24ubWV0YS5hcmdzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVua25vd24gY29tbWFuZFwiLHN3YXJtU2VyaWFsaXNhdGlvbi5tZXRhLmNvbW1hbmQsIFwiaW4gc3dhcm1TZXJpYWxpc2F0aW9uLm1ldGEuY29tbWFuZFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzd2FybTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbiQkLnN3YXJtc0luc3RhbmNlc01hbmFnZXIgPSBuZXcgU3dhcm1zSW5zdGFuY2VzTWFuYWdlcigpO1xyXG5cclxuXHJcbiIsInZhciBiZWVzSGVhbGVyID0gJCQucmVxdWlyZShcInNvdW5kcHVic3ViXCIpLmJlZXNIZWFsZXI7XHJcbnZhciBzd2FybURlYnVnID0gcmVxdWlyZShcIi4uL1N3YXJtRGVidWdcIik7XHJcblxyXG5leHBvcnRzLmNyZWF0ZUZvck9iamVjdCA9IGZ1bmN0aW9uKHZhbHVlT2JqZWN0LCB0aGlzT2JqZWN0LCBsb2NhbElkKXtcclxuXHR2YXIgcmV0ID0ge307XHJcblxyXG5cdGZ1bmN0aW9uIGZpbHRlckZvclNlcmlhbGlzYWJsZSAodmFsdWVPYmplY3Qpe1xyXG5cdFx0cmV0dXJuIHZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1JZDtcclxuXHR9XHJcblxyXG5cdHZhciBzd2FybUZ1bmN0aW9uID0gZnVuY3Rpb24oY29udGV4dCwgcGhhc2VOYW1lKXtcclxuXHRcdHZhciBhcmdzID1bXTtcclxuXHRcdGZvcih2YXIgaSA9IDI7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspe1xyXG5cdFx0XHRhcmdzLnB1c2goYXJndW1lbnRzW2ldKTtcclxuXHRcdH1cclxuXHJcblx0XHQvL21ha2UgdGhlIGV4ZWN1dGlvbiBhdCBsZXZlbCAwICAoYWZ0ZXIgYWxsIHBlbmRpbmcgZXZlbnRzKSBhbmQgd2FpdCB0byBoYXZlIGEgc3dhcm1JZFxyXG5cdFx0cmV0Lm9ic2VydmUoZnVuY3Rpb24oKXtcclxuXHRcdFx0YmVlc0hlYWxlci5hc0pTT04odmFsdWVPYmplY3QsIHBoYXNlTmFtZSwgYXJncywgZnVuY3Rpb24oZXJyLGpzTXNnKXtcclxuXHRcdFx0XHRqc01zZy5tZXRhLnRhcmdldCA9IGNvbnRleHQ7XHJcblx0XHRcdFx0JCQuUFNLX1B1YlN1Yi5wdWJsaXNoKCQkLkNPTlNUQU5UUy5TV0FSTV9GT1JfRVhFQ1VUSU9OLCBqc01zZyk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSxudWxsLGZpbHRlckZvclNlcmlhbGlzYWJsZSk7XHJcblxyXG5cdFx0cmV0Lm5vdGlmeSgpO1xyXG5cclxuXHJcblx0XHRyZXR1cm4gdGhpc09iamVjdDtcclxuXHR9O1xyXG5cclxuXHR2YXIgYXN5bmNSZXR1cm4gPSBmdW5jdGlvbihlcnIsIHJlc3VsdCl7XHJcblx0XHR2YXIgY29udGV4dCA9IHZhbHVlT2JqZWN0LnByb3RlY3RlZFZhcnMuY29udGV4dDtcclxuXHJcblx0XHRpZighY29udGV4dCAmJiB2YWx1ZU9iamVjdC5tZXRhLndhaXRTdGFjayl7XHJcblx0XHRcdGNvbnRleHQgPSB2YWx1ZU9iamVjdC5tZXRhLndhaXRTdGFjay5wb3AoKTtcclxuXHRcdFx0dmFsdWVPYmplY3QucHJvdGVjdGVkVmFycy5jb250ZXh0ID0gY29udGV4dDtcclxuXHRcdH1cclxuXHJcblx0XHRiZWVzSGVhbGVyLmFzSlNPTih2YWx1ZU9iamVjdCwgXCJfX3JldHVybl9fXCIsIFtlcnIsIHJlc3VsdF0sIGZ1bmN0aW9uKGVycixqc01zZyl7XHJcblx0XHRcdGpzTXNnLm1ldGEuY29tbWFuZCA9IFwiYXN5bmNSZXR1cm5cIjtcclxuXHRcdFx0aWYoIWNvbnRleHQpe1xyXG5cdFx0XHRcdGNvbnRleHQgPSB2YWx1ZU9iamVjdC5tZXRhLmhvbWVTZWN1cml0eUNvbnRleHQ7Ly9UT0RPOiBDSEVDSyBUSElTXHJcblxyXG5cdFx0XHR9XHJcblx0XHRcdGpzTXNnLm1ldGEudGFyZ2V0ID0gY29udGV4dDtcclxuXHJcblx0XHRcdGlmKCFjb250ZXh0KXtcclxuXHRcdFx0XHQkJC5lcnJvckhhbmRsZXIuZXJyb3IobmV3IEVycm9yKFwiQXN5bmNocm9ub3VzIHJldHVybiBpbnNpZGUgb2YgYSBzd2FybSB0aGF0IGRvZXMgbm90IHdhaXQgZm9yIHJlc3VsdHNcIikpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQkLlBTS19QdWJTdWIucHVibGlzaCgkJC5DT05TVEFOVFMuU1dBUk1fRk9SX0VYRUNVVElPTiwganNNc2cpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9O1xyXG5cclxuXHRmdW5jdGlvbiBob21lKGVyciwgcmVzdWx0KXtcclxuXHRcdGJlZXNIZWFsZXIuYXNKU09OKHZhbHVlT2JqZWN0LCBcImhvbWVcIiwgW2VyciwgcmVzdWx0XSwgZnVuY3Rpb24oZXJyLGpzTXNnKXtcclxuXHRcdFx0dmFyIGNvbnRleHQgPSB2YWx1ZU9iamVjdC5tZXRhLmhvbWVDb250ZXh0O1xyXG5cdFx0XHRqc01zZy5tZXRhLnRhcmdldCA9IGNvbnRleHQ7XHJcblx0XHRcdCQkLlBTS19QdWJTdWIucHVibGlzaCgkJC5DT05TVEFOVFMuU1dBUk1fRk9SX0VYRUNVVElPTiwganNNc2cpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHJcblxyXG5cdGZ1bmN0aW9uIHdhaXRSZXN1bHRzKGNhbGxiYWNrLCBrZWVwQWxpdmVDaGVjaywgc3dhcm0pe1xyXG5cdFx0aWYoIXN3YXJtKXtcclxuXHRcdFx0c3dhcm0gPSB0aGlzO1xyXG5cdFx0fVxyXG5cdFx0aWYoIWtlZXBBbGl2ZUNoZWNrKXtcclxuXHRcdFx0a2VlcEFsaXZlQ2hlY2sgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xyXG5cdFx0aWYoIWlubmVyLm1ldGEud2FpdFN0YWNrKXtcclxuXHRcdFx0aW5uZXIubWV0YS53YWl0U3RhY2sgPSBbXTtcclxuXHRcdFx0aW5uZXIubWV0YS53YWl0U3RhY2sucHVzaCgkJC5zZWN1cml0eUNvbnRleHQpXHJcblx0XHR9XHJcblx0XHQkJC5zd2FybXNJbnN0YW5jZXNNYW5hZ2VyLndhaXRGb3JTd2FybShjYWxsYmFjaywgc3dhcm0sIGtlZXBBbGl2ZUNoZWNrKTtcclxuXHR9XHJcblxyXG5cclxuXHRmdW5jdGlvbiBnZXRJbm5lclZhbHVlKCl7XHJcblx0XHRyZXR1cm4gdmFsdWVPYmplY3Q7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBydW5QaGFzZShmdW5jdE5hbWUsIGFyZ3Mpe1xyXG5cdFx0dmFyIGZ1bmMgPSB2YWx1ZU9iamVjdC5teUZ1bmN0aW9uc1tmdW5jdE5hbWVdO1xyXG5cdFx0aWYoZnVuYyl7XHJcblx0XHRcdGZ1bmMuYXBwbHkodGhpc09iamVjdCwgYXJncyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IoZnVuY3ROYW1lLCB2YWx1ZU9iamVjdCwgXCJGdW5jdGlvbiBcIiArIGZ1bmN0TmFtZSArIFwiIGRvZXMgbm90IGV4aXN0IVwiKTtcclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB1cGRhdGUoc2VyaWFsaXNhdGlvbil7XHJcblx0XHRiZWVzSGVhbGVyLmpzb25Ub05hdGl2ZShzZXJpYWxpc2F0aW9uLHZhbHVlT2JqZWN0KTtcclxuXHR9XHJcblxyXG5cclxuXHRmdW5jdGlvbiB2YWx1ZU9mKCl7XHJcblx0XHR2YXIgcmV0ID0ge307XHJcblx0XHRyZXQubWV0YSAgICAgICAgICAgICAgICA9IHZhbHVlT2JqZWN0Lm1ldGE7XHJcblx0XHRyZXQucHVibGljVmFycyAgICAgICAgICA9IHZhbHVlT2JqZWN0LnB1YmxpY1ZhcnM7XHJcblx0XHRyZXQucHJpdmF0ZVZhcnMgICAgICAgICA9IHZhbHVlT2JqZWN0LnByaXZhdGVWYXJzO1xyXG5cdFx0cmV0LnByb3RlY3RlZFZhcnMgICAgICAgPSB2YWx1ZU9iamVjdC5wcm90ZWN0ZWRWYXJzO1xyXG5cdFx0cmV0dXJuIHJldDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRvU3RyaW5nICgpe1xyXG5cdFx0cmV0dXJuIHN3YXJtRGVidWcuY2xlYW5EdW1wKHRoaXNPYmplY3QudmFsdWVPZigpKTtcclxuXHR9XHJcblxyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGVQYXJhbGxlbChjYWxsYmFjayl7XHJcblx0XHRyZXR1cm4gcmVxdWlyZShcIi4uLy4uL3BhcmFsbGVsSm9pblBvaW50XCIpLmNyZWF0ZUpvaW5Qb2ludCh0aGlzT2JqZWN0LCBjYWxsYmFjaywgJCQuX19pbnRlcm4ubWtBcmdzKGFyZ3VtZW50cywxKSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGVTZXJpYWwoY2FsbGJhY2spe1xyXG5cdFx0cmV0dXJuIHJlcXVpcmUoXCIuLi8uLi9zZXJpYWxKb2luUG9pbnRcIikuY3JlYXRlU2VyaWFsSm9pblBvaW50KHRoaXNPYmplY3QsIGNhbGxiYWNrLCAkJC5fX2ludGVybi5ta0FyZ3MoYXJndW1lbnRzLDEpKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGluc3BlY3QoKXtcclxuXHRcdHJldHVybiBzd2FybURlYnVnLmNsZWFuRHVtcCh0aGlzT2JqZWN0LnZhbHVlT2YoKSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0cmV0dXJuIFN3YXJtRGVzY3JpcHRpb247XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBlbnN1cmVMb2NhbElkKCl7XHJcblx0XHRpZighdmFsdWVPYmplY3QubG9jYWxJZCl7XHJcblx0XHRcdHZhbHVlT2JqZWN0LmxvY2FsSWQgPSB2YWx1ZU9iamVjdC5tZXRhLnN3YXJtVHlwZU5hbWUgKyBcIi1cIiArIGxvY2FsSWQ7XHJcblx0XHRcdGxvY2FsSWQrKztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG9ic2VydmUoY2FsbGJhY2ssIHdhaXRGb3JNb3JlLCBmaWx0ZXIpe1xyXG5cdFx0aWYoIXdhaXRGb3JNb3JlKXtcclxuXHRcdFx0d2FpdEZvck1vcmUgPSBmdW5jdGlvbiAoKXtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRlbnN1cmVMb2NhbElkKCk7XHJcblxyXG5cdFx0JCQuUFNLX1B1YlN1Yi5zdWJzY3JpYmUodmFsdWVPYmplY3QubG9jYWxJZCwgY2FsbGJhY2ssIHdhaXRGb3JNb3JlLCBmaWx0ZXIpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdG9KU09OKHByb3Ape1xyXG5cdFx0Ly9wcmV2ZW50aW5nIG1heCBjYWxsIHN0YWNrIHNpemUgZXhjZWVkaW5nIG9uIHByb3h5IGF1dG8gcmVmZXJlbmNpbmdcclxuXHRcdC8vcmVwbGFjZSB7fSBhcyByZXN1bHQgb2YgSlNPTihQcm94eSkgd2l0aCB0aGUgc3RyaW5nIFtPYmplY3QgcHJvdGVjdGVkIG9iamVjdF1cclxuXHRcdHJldHVybiBcIltPYmplY3QgcHJvdGVjdGVkIG9iamVjdF1cIjtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldEpTT05hc3luYyhjYWxsYmFjayl7XHJcblx0XHQvL21ha2UgdGhlIGV4ZWN1dGlvbiBhdCBsZXZlbCAwICAoYWZ0ZXIgYWxsIHBlbmRpbmcgZXZlbnRzKSBhbmQgd2FpdCB0byBoYXZlIGEgc3dhcm1JZFxyXG5cdFx0cmV0Lm9ic2VydmUoZnVuY3Rpb24oKXtcclxuXHRcdFx0YmVlc0hlYWxlci5hc0pTT04odmFsdWVPYmplY3QsIG51bGwsIG51bGwsY2FsbGJhY2spO1xyXG5cdFx0fSxudWxsLGZpbHRlckZvclNlcmlhbGlzYWJsZSk7XHJcblx0XHRyZXQubm90aWZ5KCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBub3RpZnkoZXZlbnQpe1xyXG5cdFx0aWYoIWV2ZW50KXtcclxuXHRcdFx0ZXZlbnQgPSB2YWx1ZU9iamVjdDtcclxuXHRcdH1cclxuXHRcdGVuc3VyZUxvY2FsSWQoKTtcclxuXHRcdCQkLlBTS19QdWJTdWIucHVibGlzaCh2YWx1ZU9iamVjdC5sb2NhbElkLCBldmVudCk7XHJcblx0fVxyXG5cclxuXHRyZXQuc3dhcm0gICAgICAgICAgID0gc3dhcm1GdW5jdGlvbjtcclxuXHRyZXQubm90aWZ5ICAgICAgICAgID0gbm90aWZ5O1xyXG5cdHJldC5nZXRKU09OYXN5bmMgICAgPSBnZXRKU09OYXN5bmM7XHJcblx0cmV0LnRvSlNPTiAgICAgICAgICA9IHRvSlNPTjtcclxuXHRyZXQub2JzZXJ2ZSAgICAgICAgID0gb2JzZXJ2ZTtcclxuXHRyZXQuaW5zcGVjdCAgICAgICAgID0gaW5zcGVjdDtcclxuXHRyZXQuam9pbiAgICAgICAgICAgID0gY3JlYXRlUGFyYWxsZWw7XHJcblx0cmV0LnBhcmFsbGVsICAgICAgICA9IGNyZWF0ZVBhcmFsbGVsO1xyXG5cdHJldC5zZXJpYWwgICAgICAgICAgPSBjcmVhdGVTZXJpYWw7XHJcblx0cmV0LnZhbHVlT2YgICAgICAgICA9IHZhbHVlT2Y7XHJcblx0cmV0LnVwZGF0ZSAgICAgICAgICA9IHVwZGF0ZTtcclxuXHRyZXQucnVuUGhhc2UgICAgICAgID0gcnVuUGhhc2U7XHJcblx0cmV0Lm9uUmV0dXJuICAgICAgICA9IHdhaXRSZXN1bHRzO1xyXG5cdHJldC5vblJlc3VsdCAgICAgICAgPSB3YWl0UmVzdWx0cztcclxuXHRyZXQuYXN5bmNSZXR1cm4gICAgID0gYXN5bmNSZXR1cm47XHJcblx0cmV0LnJldHVybiAgICAgICAgICA9IGFzeW5jUmV0dXJuO1xyXG5cdHJldC5nZXRJbm5lclZhbHVlICAgPSBnZXRJbm5lclZhbHVlO1xyXG5cdHJldC5ob21lICAgICAgICAgICAgPSBob21lO1xyXG5cdHJldC50b1N0cmluZyAgICAgICAgPSB0b1N0cmluZztcclxuXHRyZXQuY29uc3RydWN0b3IgICAgID0gY29uc3RydWN0b3I7XHJcblxyXG5cdHJldHVybiByZXQ7XHJcblxyXG59OyIsImV4cG9ydHMuY3JlYXRlRm9yT2JqZWN0ID0gZnVuY3Rpb24odmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpe1xyXG5cdHZhciByZXQgPSByZXF1aXJlKFwiLi9iYXNlXCIpLmNyZWF0ZUZvck9iamVjdCh2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCk7XHJcblxyXG5cdHJldC5zd2FybSAgICAgICAgICAgPSBudWxsO1xyXG5cdHJldC5vblJldHVybiAgICAgICAgPSBudWxsO1xyXG5cdHJldC5vblJlc3VsdCAgICAgICAgPSBudWxsO1xyXG5cdHJldC5hc3luY1JldHVybiAgICAgPSBudWxsO1xyXG5cdHJldC5yZXR1cm4gICAgICAgICAgPSBudWxsO1xyXG5cdHJldC5ob21lICAgICAgICAgICAgPSBudWxsO1xyXG5cclxuXHRyZXR1cm4gcmV0O1xyXG59OyIsImV4cG9ydHMuY3JlYXRlRm9yT2JqZWN0ID0gZnVuY3Rpb24odmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpe1xyXG5cdHJldHVybiByZXF1aXJlKFwiLi9iYXNlXCIpLmNyZWF0ZUZvck9iamVjdCh2YWx1ZU9iamVjdCwgdGhpc09iamVjdCwgbG9jYWxJZCk7XHJcbn07IiwiLypcclxuSW5pdGlhbCBMaWNlbnNlOiAoYykgQXhpb2xvZ2ljIFJlc2VhcmNoICYgQWxib2FpZSBTw65uaWPEgy5cclxuQ29udHJpYnV0b3JzOiBBeGlvbG9naWMgUmVzZWFyY2ggLCBQcml2YXRlU2t5IHByb2plY3RcclxuQ29kZSBMaWNlbnNlOiBMR1BMIG9yIE1JVC5cclxuKi9cclxuXHJcbi8vdmFyIGZzID0gcmVxdWlyZShcImZzXCIpO1xyXG4vL3ZhciBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XHJcblxyXG5mdW5jdGlvbiB3cmFwQ2FsbChvcmlnaW5hbCwgcHJlZml4TmFtZSl7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncyl7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcInByZWZpeE5hbWVcIiwgcHJlZml4TmFtZSlcclxuICAgICAgICB2YXIgcHJldmlvdXNQcmVmaXggPSAkJC5saWJyYXJ5UHJlZml4O1xyXG4gICAgICAgICQkLmxpYnJhcnlQcmVmaXggPSBwcmVmaXhOYW1lO1xyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgdmFyIHJldCA9IG9yaWdpbmFsLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgICAgICAgICAkJC5saWJyYXJ5UHJlZml4ID0gcHJldmlvdXNQcmVmaXggO1xyXG4gICAgICAgIH1jYXRjaChlcnIpe1xyXG4gICAgICAgICAgICAkJC5saWJyYXJ5UHJlZml4ID0gcHJldmlvdXNQcmVmaXggO1xyXG4gICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFN3YXJtTGlicmFyeShwcmVmaXhOYW1lLCBmb2xkZXIpe1xyXG4gICAgJCQubGlicmFyaWVzW3ByZWZpeE5hbWVdID0gdGhpcztcclxuICAgIHZhciBwcmVmaXhlZFJlcXVpcmUgPSB3cmFwQ2FsbChmdW5jdGlvbihwYXRoKXtcclxuICAgICAgICByZXR1cm4gcmVxdWlyZShwYXRoKTtcclxuICAgIH0sIHByZWZpeE5hbWUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluY2x1ZGVBbGxJblJvb3QoZm9sZGVyKSB7XHJcbiAgICAgICAgcmV0dXJuICQkLnJlcXVpcmUoZm9sZGVyKTsgLy8gYSBsaWJyYXJ5IGlzIGp1c3QgYSBtb2R1bGVcclxuICAgICAgICAvL3ZhciBzdGF0ID0gZnMuc3RhdFN5bmMocGF0aCk7XHJcbiAgICAgICAgLyp2YXIgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhmb2xkZXIpO1xyXG4gICAgICAgIGZpbGVzLmZvckVhY2goZnVuY3Rpb24oZmlsZU5hbWUpe1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiTG9hZGluZyBcIiwgZmlsZU5hbWUpO1xyXG4gICAgICAgICAgICB2YXIgZXh0ID0gZmlsZU5hbWUuc3Vic3RyKGZpbGVOYW1lLmxhc3RJbmRleE9mKCcuJykgKyAxKTtcclxuICAgICAgICAgICAgaWYoZXh0LnRvTG93ZXJDYXNlKCkgPT0gXCJqc1wiKXtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZ1bGxQYXRoID0gcGF0aC5yZXNvbHZlKGZvbGRlciArIFwiL1wiICsgZmlsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWZpeGVkUmVxdWlyZShmdWxsUGF0aCk7XHJcbiAgICAgICAgICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pKi9cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgZnVuY3Rpb24gd3JhcFN3YXJtUmVsYXRlZEZ1bmN0aW9ucyhzcGFjZSwgcHJlZml4TmFtZSl7XHJcbiAgICAgICAgdmFyIHJldCA9IHt9O1xyXG4gICAgICAgIHZhciBuYW1lcyA9IFtcImNyZWF0ZVwiLCBcImRlc2NyaWJlXCIsIFwic3RhcnRcIiwgXCJyZXN0YXJ0XCJdO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGk8bmFtZXMubGVuZ3RoOyBpKysgKXtcclxuICAgICAgICAgICAgcmV0W25hbWVzW2ldXSA9IHdyYXBDYWxsKHNwYWNlW25hbWVzW2ldXSwgcHJlZml4TmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jYWxsZmxvd3MgICAgICAgID0gdGhpcy5jYWxsZmxvdyAgID0gd3JhcFN3YXJtUmVsYXRlZEZ1bmN0aW9ucygkJC5jYWxsZmxvd3MsIHByZWZpeE5hbWUpO1xyXG4gICAgdGhpcy5zd2FybXMgICAgICAgICAgID0gdGhpcy5zd2FybSAgICAgID0gd3JhcFN3YXJtUmVsYXRlZEZ1bmN0aW9ucygkJC5zd2FybXMsIHByZWZpeE5hbWUpO1xyXG4gICAgdGhpcy5jb250cmFjdHMgICAgICAgID0gdGhpcy5jb250cmFjdCAgID0gd3JhcFN3YXJtUmVsYXRlZEZ1bmN0aW9ucygkJC5jb250cmFjdHMsIHByZWZpeE5hbWUpO1xyXG4gICAgaW5jbHVkZUFsbEluUm9vdChmb2xkZXIsIHByZWZpeE5hbWUpO1xyXG59XHJcblxyXG5leHBvcnRzLmxvYWRMaWJyYXJ5ID0gZnVuY3Rpb24ocHJlZml4TmFtZSwgZm9sZGVyKXtcclxuICAgIHZhciBleGlzdGluZyA9ICQkLmxpYnJhcmllc1twcmVmaXhOYW1lXTtcclxuICAgIGlmKGV4aXN0aW5nICl7XHJcbiAgICAgICAgaWYoZm9sZGVyKSB7XHJcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci53YXJuaW5nKFwiUmV1c2luZyBhbHJlYWR5IGxvYWRlZCBsaWJyYXJ5IFwiICsgcHJlZml4TmFtZSArIFwiY291bGQgYmUgYW4gZXJyb3IhXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXhpc3Rpbmc7XHJcbiAgICB9XHJcbiAgICAvL3ZhciBhYnNvbHV0ZVBhdGggPSBwYXRoLnJlc29sdmUoZm9sZGVyKTtcclxuICAgIHJldHVybiBuZXcgU3dhcm1MaWJyYXJ5KHByZWZpeE5hbWUsIGZvbGRlcik7XHJcbn0iLCJcclxudmFyIGpvaW5Db3VudGVyID0gMDtcclxuXHJcbmZ1bmN0aW9uIFBhcmFsbGVsSm9pblBvaW50KHN3YXJtLCBjYWxsYmFjaywgYXJncyl7XHJcbiAgICBqb2luQ291bnRlcisrO1xyXG4gICAgdmFyIGNoYW5uZWxJZCA9IFwiUGFyYWxsZWxKb2luUG9pbnRcIiArIGpvaW5Db3VudGVyO1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgdmFyIGNvdW50ZXIgPSAwO1xyXG4gICAgdmFyIHN0b3BPdGhlckV4ZWN1dGlvbiAgICAgPSBmYWxzZTtcclxuXHJcbiAgICBmdW5jdGlvbiBleGVjdXRpb25TdGVwKHN0ZXBGdW5jLCBsb2NhbEFyZ3MsIHN0b3Ape1xyXG5cclxuICAgICAgICB0aGlzLmRvRXhlY3V0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmKHN0b3BPdGhlckV4ZWN1dGlvbil7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAgICAgc3RlcEZ1bmMuYXBwbHkoc3dhcm0sIGxvY2FsQXJncyk7XHJcbiAgICAgICAgICAgICAgICBpZihzdG9wKXtcclxuICAgICAgICAgICAgICAgICAgICBzdG9wT3RoZXJFeGVjdXRpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOyAvL2V2ZXJ5dGluZyBpcyBmaW5lXHJcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICAgICAgICAgIGFyZ3MudW5zaGlmdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgc2VuZEZvclNvdW5kRXhlY3V0aW9uKGNhbGxiYWNrLCBhcmdzLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy9zdG9wIGl0LCBkbyBub3QgY2FsbCBhZ2FpbiBhbnl0aGluZ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKXtcclxuICAgICAgICAkJC5lcnJvckhhbmRsZXIuc3ludGF4RXJyb3IoXCJpbnZhbGlkIGpvaW5cIixzd2FybSwgXCJpbnZhbGlkIGZ1bmN0aW9uIGF0IGpvaW4gaW4gc3dhcm1cIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgICQkLlBTS19QdWJTdWIuc3Vic2NyaWJlKGNoYW5uZWxJZCxmdW5jdGlvbihmb3JFeGVjdXRpb24pe1xyXG4gICAgICAgIGlmKHN0b3BPdGhlckV4ZWN1dGlvbil7XHJcbiAgICAgICAgICAgIHJldHVybiA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGlmKGZvckV4ZWN1dGlvbi5kb0V4ZWN1dGUoKSl7XHJcbiAgICAgICAgICAgICAgICBkZWNDb3VudGVyKCk7XHJcbiAgICAgICAgICAgIH0gLy8gaGFkIGFuIGVycm9yLi4uXHJcbiAgICAgICAgfSBjYXRjaChlcnIpe1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgIC8vJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKFwiX19pbnRlcm5hbF9fXCIsc3dhcm0sIFwiZXhjZXB0aW9uIGluIHRoZSBleGVjdXRpb24gb2YgdGhlIGpvaW4gZnVuY3Rpb24gb2YgYSBwYXJhbGxlbCB0YXNrXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluY0NvdW50ZXIoKXtcclxuICAgICAgICBpZih0ZXN0SWZVbmRlckluc3BlY3Rpb24oKSl7XHJcbiAgICAgICAgICAgIC8vcHJldmVudGluZyBpbnNwZWN0b3IgZnJvbSBpbmNyZWFzaW5nIGNvdW50ZXIgd2hlbiByZWFkaW5nIHRoZSB2YWx1ZXMgZm9yIGRlYnVnIHJlYXNvblxyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwicHJldmVudGluZyBpbnNwZWN0aW9uXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvdW50ZXIrKztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0ZXN0SWZVbmRlckluc3BlY3Rpb24oKXtcclxuICAgICAgICB2YXIgcmVzID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGNvbnN0QXJndiA9IHByb2Nlc3MuZXhlY0FyZ3Yuam9pbigpO1xyXG4gICAgICAgIGlmKGNvbnN0QXJndi5pbmRleE9mKFwiaW5zcGVjdFwiKSE9PS0xIHx8IGNvbnN0QXJndi5pbmRleE9mKFwiZGVidWdcIikhPT0tMSl7XHJcbiAgICAgICAgICAgIC8vb25seSB3aGVuIHJ1bm5pbmcgaW4gZGVidWdcclxuICAgICAgICAgICAgdmFyIGNhbGxzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrO1xyXG4gICAgICAgICAgICBpZihjYWxsc3RhY2suaW5kZXhPZihcIkRlYnVnQ29tbWFuZFByb2Nlc3NvclwiKSE9PS0xKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRGVidWdDb21tYW5kUHJvY2Vzc29yIGRldGVjdGVkIVwiKTtcclxuICAgICAgICAgICAgICAgIHJlcyA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZW5kRm9yU291bmRFeGVjdXRpb24oZnVuY3QsIGFyZ3MsIHN0b3Ape1xyXG4gICAgICAgIHZhciBvYmogPSBuZXcgZXhlY3V0aW9uU3RlcChmdW5jdCwgYXJncywgc3RvcCk7XHJcbiAgICAgICAgJCQuUFNLX1B1YlN1Yi5wdWJsaXNoKGNoYW5uZWxJZCwgb2JqKTsgLy8gZm9yY2UgZXhlY3V0aW9uIHRvIGJlIFwic291bmRcIlxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlY0NvdW50ZXIoKXtcclxuICAgICAgICBjb3VudGVyLS07XHJcbiAgICAgICAgaWYoY291bnRlciA9PSAwKSB7XHJcbiAgICAgICAgICAgIGFyZ3MudW5zaGlmdChudWxsKTtcclxuICAgICAgICAgICAgc2VuZEZvclNvdW5kRXhlY3V0aW9uKGNhbGxiYWNrLCBhcmdzLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBpbm5lciA9IHN3YXJtLmdldElubmVyVmFsdWUoKTtcclxuXHJcbiAgICBmdW5jdGlvbiBkZWZhdWx0UHJvZ3Jlc3NSZXBvcnQoZXJyLCByZXMpe1xyXG4gICAgICAgIGlmKGVycikge1xyXG4gICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHRleHQ6XCJQYXJhbGxlbCBleGVjdXRpb24gcHJvZ3Jlc3MgZXZlbnRcIixcclxuICAgICAgICAgICAgc3dhcm06c3dhcm0sXHJcbiAgICAgICAgICAgIGFyZ3M6YXJncyxcclxuICAgICAgICAgICAgY3VycmVudFJlc3VsdDpyZXNcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1rRnVuY3Rpb24obmFtZSl7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3Mpe1xyXG4gICAgICAgICAgICB2YXIgZiA9IGRlZmF1bHRQcm9ncmVzc1JlcG9ydDtcclxuICAgICAgICAgICAgaWYobmFtZSAhPSBcInByb2dyZXNzXCIpe1xyXG4gICAgICAgICAgICAgICAgZiA9IGlubmVyLm15RnVuY3Rpb25zW25hbWVdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBhcmdzID0gJCQuX19pbnRlcm4ubWtBcmdzKGFyZ3MsIDApO1xyXG4gICAgICAgICAgICBzZW5kRm9yU291bmRFeGVjdXRpb24oZiwgYXJncywgZmFsc2UpO1xyXG4gICAgICAgICAgICByZXR1cm4gX19wcm94eU9iamVjdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wLCByZWNlaXZlcil7XHJcbiAgICAgICAgaWYoaW5uZXIubXlGdW5jdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcCkgfHwgcHJvcCA9PSBcInByb2dyZXNzXCIpe1xyXG4gICAgICAgICAgICBpbmNDb3VudGVyKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBta0Z1bmN0aW9uKHByb3ApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3dhcm1bcHJvcF07XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBfX3Byb3h5T2JqZWN0O1xyXG5cclxuICAgIHRoaXMuX19zZXRQcm94eU9iamVjdCA9IGZ1bmN0aW9uKHApe1xyXG4gICAgICAgIF9fcHJveHlPYmplY3QgPSBwO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnRzLmNyZWF0ZUpvaW5Qb2ludCA9IGZ1bmN0aW9uKHN3YXJtLCBjYWxsYmFjaywgYXJncyl7XHJcbiAgICB2YXIganAgPSBuZXcgUGFyYWxsZWxKb2luUG9pbnQoc3dhcm0sIGNhbGxiYWNrLCBhcmdzKTtcclxuICAgIHZhciBpbm5lciA9IHN3YXJtLmdldElubmVyVmFsdWUoKTtcclxuICAgIHZhciBwID0gbmV3IFByb3h5KGlubmVyLCBqcCk7XHJcbiAgICBqcC5fX3NldFByb3h5T2JqZWN0KHApO1xyXG4gICAgcmV0dXJuIHA7XHJcbn07IiwiXHJcbmZ1bmN0aW9uIGVuY29kZShidWZmZXIpIHtcclxuICAgIHJldHVybiBidWZmZXIudG9TdHJpbmcoJ2Jhc2U2NCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcKy9nLCAnJylcclxuICAgICAgICAucmVwbGFjZSgvXFwvL2csICcnKVxyXG4gICAgICAgIC5yZXBsYWNlKC89KyQvLCAnJyk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBzdGFtcFdpdGhUaW1lKGJ1Ziwgc2FsdCwgbXNhbHQpe1xyXG4gICAgaWYoIXNhbHQpe1xyXG4gICAgICAgIHNhbHQgPSAxO1xyXG4gICAgfVxyXG4gICAgaWYoIW1zYWx0KXtcclxuICAgICAgICBtc2FsdCA9IDE7XHJcbiAgICB9XHJcbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlO1xyXG4gICAgdmFyIGN0ID0gTWF0aC5mbG9vcihkYXRlLmdldFRpbWUoKSAvIHNhbHQpO1xyXG4gICAgdmFyIGNvdW50ZXIgPSAwO1xyXG4gICAgd2hpbGUoY3QgPiAwICl7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkNvdW50ZXJcIiwgY291bnRlciwgY3QpO1xyXG4gICAgICAgIGJ1Zltjb3VudGVyKm1zYWx0XSA9IE1hdGguZmxvb3IoY3QgJSAyNTYpO1xyXG4gICAgICAgIGN0ID0gTWF0aC5mbG9vcihjdCAvIDI1Nik7XHJcbiAgICAgICAgY291bnRlcisrO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKlxyXG4gICAgVGhlIHVpZCBjb250YWlucyBhcm91bmQgMjU2IGJpdHMgb2YgcmFuZG9tbmVzcyBhbmQgYXJlIHVuaXF1ZSBhdCB0aGUgbGV2ZWwgb2Ygc2Vjb25kcy4gVGhpcyBVVUlEIHNob3VsZCBieSBjcnlwdG9ncmFwaGljYWxseSBzYWZlIChjYW4gbm90IGJlIGd1ZXNzZWQpXHJcblxyXG4gICAgV2UgZ2VuZXJhdGUgYSBzYWZlIFVJRCB0aGF0IGlzIGd1YXJhbnRlZWQgdW5pcXVlIChieSB1c2FnZSBvZiBhIFBSTkcgdG8gZ2VuZWF0ZSAyNTYgYml0cykgYW5kIHRpbWUgc3RhbXBpbmcgd2l0aCB0aGUgbnVtYmVyIG9mIHNlY29uZHMgYXQgdGhlIG1vbWVudCB3aGVuIGlzIGdlbmVyYXRlZFxyXG4gICAgVGhpcyBtZXRob2Qgc2hvdWxkIGJlIHNhZmUgdG8gdXNlIGF0IHRoZSBsZXZlbCBvZiB2ZXJ5IGxhcmdlIGRpc3RyaWJ1dGVkIHN5c3RlbXMuXHJcbiAgICBUaGUgVVVJRCBpcyBzdGFtcGVkIHdpdGggdGltZSAoc2Vjb25kcyk6IGRvZXMgaXQgb3BlbiBhIHdheSB0byBndWVzcyB0aGUgVVVJRD8gSXQgZGVwZW5kcyBob3cgc2FmZSBpcyBcImNyeXB0b1wiIFBSTkcsIGJ1dCBpdCBzaG91bGQgYmUgbm8gcHJvYmxlbS4uLlxyXG5cclxuICovXHJcblxyXG5leHBvcnRzLnNhZmVfdXVpZCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICByZXF1aXJlKCdjcnlwdG8nKS5yYW5kb21CeXRlcygzNiwgZnVuY3Rpb24gKGVyciwgYnVmKSB7XHJcbiAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YW1wV2l0aFRpbWUoYnVmLCAxMDAwLCAzKTtcclxuICAgICAgICBjYWxsYmFjayhudWxsLCBlbmNvZGUoYnVmKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuXHJcbi8qXHJcbiAgICBUcnkgdG8gZ2VuZXJhdGUgYSBzbWFsbCBVSUQgdGhhdCBpcyB1bmlxdWUgYWdhaW5zdCBjaGFuY2UgaW4gdGhlIHNhbWUgbWlsbGlzZWNvbmQgc2Vjb25kIGFuZCBpbiBhIHNwZWNpZmljIGNvbnRleHQgKGVnIGluIHRoZSBzYW1lIGNob3Jlb2dyYXBoeSBleGVjdXRpb24pXHJcbiAgICBUaGUgaWQgY29udGFpbnMgYXJvdW5kIDYqOCA9IDQ4ICBiaXRzIG9mIHJhbmRvbW5lc3MgYW5kIGFyZSB1bmlxdWUgYXQgdGhlIGxldmVsIG9mIG1pbGxpc2Vjb25kc1xyXG4gICAgVGhpcyBtZXRob2QgaXMgc2FmZSBvbiBhIHNpbmdsZSBjb21wdXRlciBidXQgc2hvdWxkIGJlIHVzZWQgd2l0aCBjYXJlIG90aGVyd2lzZVxyXG4gICAgVGhpcyBVVUlEIGlzIG5vdCBjcnlwdG9ncmFwaGljYWxseSBzYWZlIChjYW4gYmUgZ3Vlc3NlZClcclxuICovXHJcbmV4cG9ydHMuc2hvcnRfdXVpZCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICByZXF1aXJlKCdjcnlwdG8nKS5yYW5kb21CeXRlcygxMiwgZnVuY3Rpb24gKGVyciwgYnVmKSB7XHJcbiAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YW1wV2l0aFRpbWUoYnVmLDEsMik7XHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgZW5jb2RlKGJ1ZikpO1xyXG4gICAgfSk7XHJcbn0iLCJcclxudmFyIGpvaW5Db3VudGVyID0gMDtcclxuXHJcbmZ1bmN0aW9uIFNlcmlhbEpvaW5Qb2ludChzd2FybSwgY2FsbGJhY2ssIGFyZ3Mpe1xyXG5cclxuICAgIGpvaW5Db3VudGVyKys7XHJcblxyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgdmFyIGNoYW5uZWxJZCA9IFwiU2VyaWFsSm9pblBvaW50XCIgKyBqb2luQ291bnRlcjtcclxuXHJcbiAgICBpZih0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIil7XHJcbiAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKFwidW5rbm93blwiLCBzd2FybSwgXCJpbnZhbGlkIGZ1bmN0aW9uIGdpdmVuIHRvIHNlcmlhbCBpbiBzd2FybVwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBkZWZhdWx0UHJvZ3Jlc3NSZXBvcnQoZXJyLCByZXMpe1xyXG4gICAgICAgIGlmKGVycikge1xyXG4gICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHZhciBmdW5jdGlvbkNvdW50ZXIgICAgID0gMDtcclxuICAgIHZhciBleGVjdXRpb25Db3VudGVyICAgID0gMDtcclxuXHJcbiAgICB2YXIgcGxhbm5lZEV4ZWN1dGlvbnMgICA9IFtdO1xyXG4gICAgdmFyIHBsYW5uZWRBcmd1bWVudHMgICAgPSB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBta0Z1bmN0aW9uKG5hbWUsIHBvcyl7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkNyZWF0aW5nIGZ1bmN0aW9uIFwiLCBuYW1lLCBwb3MpO1xyXG4gICAgICAgIHBsYW5uZWRBcmd1bWVudHNbcG9zXSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdHJpZ2dldE5leHRTdGVwKCl7XHJcbiAgICAgICAgICAgIGlmKHBsYW5uZWRFeGVjdXRpb25zLmxlbmd0aCA9PSBleGVjdXRpb25Db3VudGVyIHx8IHBsYW5uZWRBcmd1bWVudHNbZXhlY3V0aW9uQ291bnRlcl0gKSAge1xyXG4gICAgICAgICAgICAgICAgJCQuUFNLX1B1YlN1Yi5wdWJsaXNoKGNoYW5uZWxJZCwgc2VsZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBmID0gZnVuY3Rpb24gKC4uLmFyZ3Mpe1xyXG4gICAgICAgICAgICBpZihleGVjdXRpb25Db3VudGVyICE9IHBvcykge1xyXG4gICAgICAgICAgICAgICAgcGxhbm5lZEFyZ3VtZW50c1twb3NdID0gYXJncztcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJEZWxheWluZyBmdW5jdGlvbjpcIiwgZXhlY3V0aW9uQ291bnRlciwgcG9zLCBwbGFubmVkQXJndW1lbnRzLCBhcmd1bWVudHMsIGZ1bmN0aW9uQ291bnRlcik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gX19wcm94eTtcclxuICAgICAgICAgICAgfSBlbHNle1xyXG4gICAgICAgICAgICAgICAgaWYocGxhbm5lZEFyZ3VtZW50c1twb3NdKXtcclxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiRXhlY3V0aW5nICBmdW5jdGlvbjpcIiwgZXhlY3V0aW9uQ291bnRlciwgcG9zLCBwbGFubmVkQXJndW1lbnRzLCBhcmd1bWVudHMsIGZ1bmN0aW9uQ291bnRlcik7XHJcblx0XHRcdFx0XHRhcmdzID0gcGxhbm5lZEFyZ3VtZW50c1twb3NdO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGFubmVkQXJndW1lbnRzW3Bvc10gPSBhcmdzO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXROZXh0U3RlcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfX3Byb3h5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgZiA9IGRlZmF1bHRQcm9ncmVzc1JlcG9ydDtcclxuICAgICAgICAgICAgaWYobmFtZSAhPSBcInByb2dyZXNzXCIpe1xyXG4gICAgICAgICAgICAgICAgZiA9IGlubmVyLm15RnVuY3Rpb25zW25hbWVdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAgICAgZi5hcHBseShzZWxmLGFyZ3MpO1xyXG4gICAgICAgICAgICB9IGNhdGNoKGVycil7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJncy51bnNoaWZ0KGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoc3dhcm0sYXJncyk7IC8vZXJyb3JcclxuICAgICAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLnVuc3Vic2NyaWJlKGNoYW5uZWxJZCxydW5OZXh0RnVuY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvL3Rlcm1pbmF0ZSBleGVjdXRpb24gd2l0aCBhbiBlcnJvci4uLiFcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBleGVjdXRpb25Db3VudGVyKys7XHJcblxyXG4gICAgICAgICAgICB0cmlnZ2V0TmV4dFN0ZXAoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBfX3Byb3h5O1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYW5uZWRFeGVjdXRpb25zLnB1c2goZik7XHJcbiAgICAgICAgZnVuY3Rpb25Db3VudGVyKys7XHJcbiAgICAgICAgcmV0dXJuIGY7XHJcbiAgICB9XHJcblxyXG4gICAgIHZhciBmaW5pc2hlZCA9IGZhbHNlO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJ1bk5leHRGdW5jdGlvbigpe1xyXG4gICAgICAgIGlmKGV4ZWN1dGlvbkNvdW50ZXIgPT0gcGxhbm5lZEV4ZWN1dGlvbnMubGVuZ3RoICl7XHJcbiAgICAgICAgICAgIGlmKCFmaW5pc2hlZCl7XHJcbiAgICAgICAgICAgICAgICBhcmdzLnVuc2hpZnQobnVsbCk7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShzd2FybSxhcmdzKTtcclxuICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIudW5zdWJzY3JpYmUoY2hhbm5lbElkLHJ1bk5leHRGdW5jdGlvbik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNlcmlhbCBjb25zdHJ1Y3QgaXMgdXNpbmcgZnVuY3Rpb25zIHRoYXQgYXJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcy4uLlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBsYW5uZWRFeGVjdXRpb25zW2V4ZWN1dGlvbkNvdW50ZXJdKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICQkLlBTS19QdWJTdWIuc3Vic2NyaWJlKGNoYW5uZWxJZCxydW5OZXh0RnVuY3Rpb24pOyAvLyBmb3JjZSBpdCB0byBiZSBcInNvdW5kXCJcclxuXHJcblxyXG4gICAgdGhpcy5nZXQgPSBmdW5jdGlvbih0YXJnZXQsIHByb3AsIHJlY2VpdmVyKXtcclxuICAgICAgICBpZihwcm9wID09IFwicHJvZ3Jlc3NcIiB8fCBpbm5lci5teUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wKSl7XHJcbiAgICAgICAgICAgIHJldHVybiBta0Z1bmN0aW9uKHByb3AsIGZ1bmN0aW9uQ291bnRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzd2FybVtwcm9wXTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgX19wcm94eTtcclxuICAgIHRoaXMuc2V0UHJveHlPYmplY3QgPSBmdW5jdGlvbihwKXtcclxuICAgICAgICBfX3Byb3h5ID0gcDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0cy5jcmVhdGVTZXJpYWxKb2luUG9pbnQgPSBmdW5jdGlvbihzd2FybSwgY2FsbGJhY2ssIGFyZ3Mpe1xyXG4gICAgdmFyIGpwID0gbmV3IFNlcmlhbEpvaW5Qb2ludChzd2FybSwgY2FsbGJhY2ssIGFyZ3MpO1xyXG4gICAgdmFyIGlubmVyID0gc3dhcm0uZ2V0SW5uZXJWYWx1ZSgpO1xyXG4gICAgdmFyIHAgPSBuZXcgUHJveHkoaW5uZXIsIGpwKTtcclxuICAgIGpwLnNldFByb3h5T2JqZWN0KHApO1xyXG4gICAgcmV0dXJuIHA7XHJcbn0iLCJmdW5jdGlvbiBTd2FybVNwYWNlKHN3YXJtVHlwZSwgdXRpbHMpIHtcclxuXHJcbiAgICB2YXIgYmVlc0hlYWxlciA9ICQkLnJlcXVpcmUoXCJzb3VuZHB1YnN1YlwiKS5iZWVzSGVhbGVyO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldEZ1bGxOYW1lKHNob3J0TmFtZSl7XHJcbiAgICAgICAgdmFyIGZ1bGxOYW1lO1xyXG4gICAgICAgIGlmKHNob3J0TmFtZSAmJiBzaG9ydE5hbWUuaW5jbHVkZXMoXCIuXCIpKSB7XHJcbiAgICAgICAgICAgIGZ1bGxOYW1lID0gc2hvcnROYW1lO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZ1bGxOYW1lID0gJCQubGlicmFyeVByZWZpeCArIFwiLlwiICsgc2hvcnROYW1lOyAvL1RPRE86IGNoZWNrIG1vcmUgYWJvdXQgLiAhP1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZnVsbE5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gVmFyRGVzY3JpcHRpb24oZGVzYyl7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaW5pdDpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVzdG9yZTpmdW5jdGlvbihqc29uU3RyaW5nKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGpzb25TdHJpbmcpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0b0pzb25TdHJpbmc6ZnVuY3Rpb24oeCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gU3dhcm1EZXNjcmlwdGlvbihzd2FybVR5cGVOYW1lLCBkZXNjcmlwdGlvbil7XHJcblxyXG4gICAgICAgIHN3YXJtVHlwZU5hbWUgPSBnZXRGdWxsTmFtZShzd2FybVR5cGVOYW1lKTtcclxuXHJcbiAgICAgICAgdmFyIGxvY2FsSWQgPSAwOyAgLy8gdW5pcXVlIGZvciBlYWNoIHN3YXJtXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZVZhcnMoZGVzY3Ipe1xyXG4gICAgICAgICAgICB2YXIgbWVtYmVycyA9IHt9O1xyXG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gZGVzY3Ipe1xyXG4gICAgICAgICAgICAgICAgbWVtYmVyc1t2XSA9IG5ldyBWYXJEZXNjcmlwdGlvbihkZXNjclt2XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG1lbWJlcnM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVNZW1iZXJzKGRlc2NyKXtcclxuICAgICAgICAgICAgdmFyIG1lbWJlcnMgPSB7fTtcclxuICAgICAgICAgICAgZm9yKHZhciB2IGluIGRlc2NyaXB0aW9uKXtcclxuXHJcbiAgICAgICAgICAgICAgICBpZih2ICE9IFwicHVibGljXCIgJiYgdiAhPSBcInByaXZhdGVcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1t2XSA9IGRlc2NyaXB0aW9uW3ZdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBtZW1iZXJzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHB1YmxpY1ZhcnMgPSBjcmVhdGVWYXJzKGRlc2NyaXB0aW9uLnB1YmxpYyk7XHJcbiAgICAgICAgdmFyIHByaXZhdGVWYXJzID0gY3JlYXRlVmFycyhkZXNjcmlwdGlvbi5wcml2YXRlKTtcclxuICAgICAgICB2YXIgbXlGdW5jdGlvbnMgPSBjcmVhdGVNZW1iZXJzKGRlc2NyaXB0aW9uKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlUGhhc2UodGhpc0luc3RhbmNlLCBmdW5jKXtcclxuICAgICAgICAgICAgdmFyIHBoYXNlID0gZnVuY3Rpb24oLi4uYXJncyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmV0O1xyXG4gICAgICAgICAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAgICAgICAgICQkLlBTS19QdWJTdWIuYmxvY2tDYWxsQmFja3MoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXQgPSBmdW5jLmFwcGx5KHRoaXNJbnN0YW5jZSwgYXJncyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCQuUFNLX1B1YlN1Yi5yZWxlYXNlQ2FsbEJhY2tzKCk7XHJcbiAgICAgICAgICAgICAgICB9Y2F0Y2goZXJyKXtcclxuICAgICAgICAgICAgICAgICAgICAkJC5QU0tfUHViU3ViLnJlbGVhc2VDYWxsQmFja3MoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vZHluYW1pYyBuYW1lZCBmdW5jIGluIG9yZGVyIHRvIGltcHJvdmUgY2FsbHN0YWNrXHJcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwaGFzZSwgXCJuYW1lXCIsIHtnZXQ6IGZ1bmN0aW9uKCl7cmV0dXJuIHN3YXJtVHlwZU5hbWUrXCIuXCIrZnVuYy5uYW1lfX0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcGhhc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpc2UgPSBmdW5jdGlvbihzZXJpYWxpc2VkVmFsdWVzKXtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgICAgICAgICBwdWJsaWNWYXJzOntcclxuXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcHJpdmF0ZVZhcnM6e1xyXG5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwcm90ZWN0ZWRWYXJzOntcclxuXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbXlGdW5jdGlvbnM6e1xyXG5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB1dGlsaXR5RnVuY3Rpb25zOntcclxuXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbWV0YTp7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dhcm1UeXBlTmFtZTpzd2FybVR5cGVOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHN3YXJtRGVzY3JpcHRpb246ZGVzY3JpcHRpb25cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gcHVibGljVmFycyl7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVibGljVmFyc1t2XSA9IHB1YmxpY1ZhcnNbdl0uaW5pdCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZm9yKHZhciB2IGluIHByaXZhdGVWYXJzKXtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wcml2YXRlVmFyc1t2XSA9IHByaXZhdGVWYXJzW3ZdLmluaXQoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgICAgICBpZihzZXJpYWxpc2VkVmFsdWVzKXtcclxuICAgICAgICAgICAgICAgIGJlZXNIZWFsZXIuanNvblRvTmF0aXZlKHNlcmlhbGlzZWRWYWx1ZXMsIHJlc3VsdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpc2VGdW5jdGlvbnMgPSBmdW5jdGlvbih2YWx1ZU9iamVjdCwgdGhpc09iamVjdCl7XHJcblxyXG4gICAgICAgICAgICBmb3IodmFyIHYgaW4gbXlGdW5jdGlvbnMpe1xyXG4gICAgICAgICAgICAgICAgdmFsdWVPYmplY3QubXlGdW5jdGlvbnNbdl0gPSBjcmVhdGVQaGFzZSh0aGlzT2JqZWN0LCBteUZ1bmN0aW9uc1t2XSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBsb2NhbElkKys7XHJcbiAgICAgICAgICAgIHZhbHVlT2JqZWN0LnV0aWxpdHlGdW5jdGlvbnMgPSB1dGlscy5jcmVhdGVGb3JPYmplY3QodmFsdWVPYmplY3QsIHRoaXNPYmplY3QsIGxvY2FsSWQpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpe1xyXG5cclxuXHJcbiAgICAgICAgICAgIGlmKHB1YmxpY1ZhcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnB1YmxpY1ZhcnNbcHJvcGVydHldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZihwcml2YXRlVmFycy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQucHJpdmF0ZVZhcnNbcHJvcGVydHldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZih0YXJnZXQudXRpbGl0eUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXHJcbiAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnV0aWxpdHlGdW5jdGlvbnNbcHJvcGVydHldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYobXlGdW5jdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0Lm15RnVuY3Rpb25zW3Byb3BlcnR5XTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0LnByb3RlY3RlZFZhcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnByb3RlY3RlZFZhcnNbcHJvcGVydHldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZih0eXBlb2YgcHJvcGVydHkgIT0gXCJzeW1ib2xcIikge1xyXG4gICAgICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKHByb3BlcnR5LCB0YXJnZXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNldCA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcil7XHJcblxyXG4gICAgICAgICAgICBpZih0YXJnZXQudXRpbGl0eUZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkgfHwgdGFyZ2V0Lm15RnVuY3Rpb25zLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xyXG4gICAgICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKHByb3BlcnR5KTtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRyeWluZyB0byBvdmVyd3JpdGUgaW1tdXRhYmxlIG1lbWJlclwiICsgcHJvcGVydHkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZihwcml2YXRlVmFycy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5wcml2YXRlVmFyc1twcm9wZXJ0eV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICAgIGlmKHB1YmxpY1ZhcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQucHVibGljVmFyc1twcm9wZXJ0eV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5wcm90ZWN0ZWRWYXJzW3Byb3BlcnR5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5hcHBseSA9IGZ1bmN0aW9uKHRhcmdldCwgdGhpc0FyZywgYXJndW1lbnRzTGlzdCl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUHJveHkgYXBwbHlcIik7XHJcbiAgICAgICAgICAgIC8vdmFyIGZ1bmMgPSB0YXJnZXRbXVxyXG4gICAgICAgICAgICAvL3N3YXJtR2xvYmFscy5leGVjdXRpb25Qcm92aWRlci5leGVjdXRlKG51bGwsIHRoaXNBcmcsIGZ1bmMsIGFyZ3VtZW50c0xpc3QpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHRoaXMuaXNFeHRlbnNpYmxlID0gZnVuY3Rpb24odGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmhhcyA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCkge1xyXG4gICAgICAgICAgICBpZih0YXJnZXQucHVibGljVmFyc1twcm9wXSB8fCB0YXJnZXQucHJvdGVjdGVkVmFyc1twcm9wXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMub3duS2V5cyA9IGZ1bmN0aW9uKHRhcmdldCkge1xyXG4gICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5vd25LZXlzKHRhcmdldC5wdWJsaWNWYXJzKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2VyaWFsaXNlZFZhbHVlcyl7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZU9iamVjdCA9IHNlbGYuaW5pdGlhbGlzZShzZXJpYWxpc2VkVmFsdWVzKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBQcm94eSh2YWx1ZU9iamVjdCxzZWxmKTtcclxuICAgICAgICAgICAgc2VsZi5pbml0aWFsaXNlRnVuY3Rpb25zKHZhbHVlT2JqZWN0LHJlc3VsdCk7XHJcbiAgICAgICAgICAgIGlmKCFzZXJpYWxpc2VkVmFsdWVzKXtcclxuICAgICAgICAgICAgICAgICQkLnVpZEdlbmVyYXRvci5zYWZlX3V1aWQoZnVuY3Rpb24gKGVyciwgcmVzdWx0KXtcclxuICAgICAgICAgICAgICAgICAgICBpZighdmFsdWVPYmplY3QubWV0YS5zd2FybUlkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVPYmplY3QubWV0YS5zd2FybUlkID0gcmVzdWx0OyAgLy9kbyBub3Qgb3ZlcndyaXRlISEhXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlT2JqZWN0LnV0aWxpdHlGdW5jdGlvbnMubm90aWZ5KCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgZGVzY3JpcHRpb25zID0ge307XHJcblxyXG4gICAgdGhpcy5kZXNjcmliZSA9IGZ1bmN0aW9uIGRlc2NyaWJlU3dhcm0oc3dhcm1UeXBlTmFtZSwgZGVzY3JpcHRpb24pe1xyXG4gICAgICAgIHN3YXJtVHlwZU5hbWUgPSBnZXRGdWxsTmFtZShzd2FybVR5cGVOYW1lKTtcclxuXHJcbiAgICAgICAgdmFyIHBvaW50UG9zID0gc3dhcm1UeXBlTmFtZS5sYXN0SW5kZXhPZignLicpO1xyXG4gICAgICAgIHZhciBzaG9ydE5hbWUgPSBzd2FybVR5cGVOYW1lLnN1YnN0ciggcG9pbnRQb3MrIDEpO1xyXG4gICAgICAgIHZhciBsaWJyYXJ5TmFtZSA9IHN3YXJtVHlwZU5hbWUuc3Vic3RyKDAsIHBvaW50UG9zKTtcclxuICAgICAgICBpZighbGlicmFyeU5hbWUpe1xyXG4gICAgICAgICAgICBsaWJyYXJ5TmFtZSA9IFwiZ2xvYmFsXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZGVzY3JpcHRpb24gPSBuZXcgU3dhcm1EZXNjcmlwdGlvbihzd2FybVR5cGVOYW1lLCBkZXNjcmlwdGlvbik7XHJcbiAgICAgICAgaWYoZGVzY3JpcHRpb25zW3N3YXJtVHlwZU5hbWVdICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci53YXJuaW5nKFwiRHVwbGljYXRlIHN3YXJtIGRlc2NyaXB0aW9uIFwiKyBzd2FybVR5cGVOYW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRlc2NyaXB0aW9uc1tzd2FybVR5cGVOYW1lXSA9IGRlc2NyaXB0aW9uO1xyXG5cclxuICAgICAgICBpZigkJC5yZWdpc3RlclN3YXJtRGVzY3JpcHRpb24pe1xyXG5cdFx0XHQkJC5yZWdpc3RlclN3YXJtRGVzY3JpcHRpb24obGlicmFyeU5hbWUsIHNob3J0TmFtZSwgc3dhcm1UeXBlTmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZXNjcmlwdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZVN3YXJtKHN3YXJtVHlwZU5hbWUsIGRlc2NyaXB0aW9uLCBpbml0aWFsVmFsdWVzKXtcclxuICAgICAgICBzd2FybVR5cGVOYW1lID0gZ2V0RnVsbE5hbWUoc3dhcm1UeXBlTmFtZSk7XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICBpZih1bmRlZmluZWQgPT0gZGVzY3JpcHRpb24pe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0aW9uc1tzd2FybVR5cGVOYW1lXShpbml0aWFsVmFsdWVzKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRlc2NyaWJlKHN3YXJtVHlwZU5hbWUsIGRlc2NyaXB0aW9uKShpbml0aWFsVmFsdWVzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDcmVhdGVTd2FybSBlcnJvclwiLCBlcnIpO1xyXG4gICAgICAgICAgICAkJC5lcnJvckhhbmRsZXIuZXJyb3IoZXJyLCBhcmd1bWVudHMsIFwiV3JvbmcgbmFtZSBvciBkZXNjcmlwdGlvbnNcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVzdGFydCA9IGZ1bmN0aW9uKHN3YXJtVHlwZU5hbWUsIGluaXRpYWxWYWx1ZXMpe1xyXG4gICAgICAgIHN3YXJtVHlwZU5hbWUgPSBnZXRGdWxsTmFtZShzd2FybVR5cGVOYW1lKTtcclxuICAgICAgICB2YXIgZGVzYyA9IGRlc2NyaXB0aW9uc1tzd2FybVR5cGVOYW1lXTtcclxuXHJcbiAgICAgICAgaWYoZGVzYyl7XHJcbiAgICAgICAgICAgIHJldHVybiBkZXNjKGluaXRpYWxWYWx1ZXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQkLmVycm9ySGFuZGxlci5zeW50YXhFcnJvcihzd2FybVR5cGVOYW1lLGluaXRpYWxWYWx1ZXMsXHJcbiAgICAgICAgICAgICAgICBcIkZhaWxlZCB0byByZXN0YXJ0IGEgc3dhcm0gd2l0aCB0eXBlIFwiICsgc3dhcm1UeXBlTmFtZSArIFwiXFxuIE1heWJlIGRpZmZyZW50IHN3YXJtIHNwYWNlICh1c2VkIGZsb3cgaW5zdGVhZCBvZiBzd2FybSE/KVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKHN3YXJtVHlwZU5hbWUsIC4uLnBhcmFtcyl7XHJcbiAgICAgICAgc3dhcm1UeXBlTmFtZSA9IGdldEZ1bGxOYW1lKHN3YXJtVHlwZU5hbWUpO1xyXG4gICAgICAgIHZhciBkZXNjID0gZGVzY3JpcHRpb25zW3N3YXJtVHlwZU5hbWVdO1xyXG4gICAgICAgIGlmKCFkZXNjKXtcclxuICAgICAgICAgICAgJCQuZXJyb3JIYW5kbGVyLnN5bnRheEVycm9yKG51bGwsIHN3YXJtVHlwZU5hbWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHJlcyA9IGRlc2MoKTtcclxuXHJcbiAgICAgICAgaWYocGFyYW1zLmxlbmd0aCA+IDEpe1xyXG4gICAgICAgICAgICB2YXIgYXJncyA9W107XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7aSA8IHBhcmFtcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2gocGFyYW1zW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXMuc3dhcm0uYXBwbHkocmVzLCBhcmdzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydHMuY3JlYXRlU3dhcm1FbmdpbmUgPSBmdW5jdGlvbihzd2FybVR5cGUsIHV0aWxzKXtcclxuICAgIGlmKHR5cGVvZiB1dGlscyA9PSBcInVuZGVmaW5lZFwiKXtcclxuICAgICAgICB1dGlscyA9IHJlcXVpcmUoXCIuL2Nob3Jlb2dyYXBoaWVzL3V0aWxpdHlGdW5jdGlvbnMvY2FsbGZsb3dcIik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IFN3YXJtU3BhY2Uoc3dhcm1UeXBlLCB1dGlscyk7XHJcbn07IiwiaWYodHlwZW9mIHNpbmdsZXRvbl9jb250YWluZXJfbW9kdWxlX3dvcmthcm91bmRfZm9yX3dpcmVkX25vZGVfanNfY2FjaGluZyA9PSAndW5kZWZpbmVkJykge1xyXG4gICAgc2luZ2xldG9uX2NvbnRhaW5lcl9tb2R1bGVfd29ya2Fyb3VuZF9mb3Jfd2lyZWRfbm9kZV9qc19jYWNoaW5nICAgPSBtb2R1bGU7XHJcbn0gZWxzZSB7XHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHNpbmdsZXRvbl9jb250YWluZXJfbW9kdWxlX3dvcmthcm91bmRfZm9yX3dpcmVkX25vZGVfanNfY2FjaGluZyAuZXhwb3J0cztcclxuICAgIHJldHVybiBtb2R1bGU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHNhbGJvYWllIG9uIDQvMjcvMTUuXHJcbiAqL1xyXG5mdW5jdGlvbiBDb250YWluZXIoZXJyb3JIYW5kbGVyKXtcclxuICAgIHZhciB0aGluZ3MgPSB7fTsgICAgICAgIC8vdGhlIGFjdHVhbCB2YWx1ZXMgZm9yIG91ciBzZXJ2aWNlcywgdGhpbmdzXHJcbiAgICB2YXIgaW1tZWRpYXRlID0ge307ICAgICAvL2hvdyBkZXBlbmRlbmNpZXMgd2VyZSBkZWNsYXJlZFxyXG4gICAgdmFyIGNhbGxiYWNrcyA9IHt9OyAgICAgLy9jYWxsYmFjayB0aGF0IHNob3VsZCBiZSBjYWxsZWQgZm9yIGVhY2ggZGVwZW5kZW5jeSBkZWNsYXJhdGlvblxyXG4gICAgdmFyIGRlcHNDb3VudGVyID0ge307ICAgLy9jb3VudCBkZXBlbmRlbmNpZXNcclxuICAgIHZhciByZXZlcnNlZFRyZWUgPSB7fTsgIC8vcmV2ZXJzZWQgZGVwZW5kZW5jaWVzLCBvcHBvc2l0ZSBvZiBpbW1lZGlhdGUgb2JqZWN0XHJcblxyXG4gICAgIHRoaXMuZHVtcCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgIGNvbnNvbGUubG9nKFwiQ29uYXRpbmVyIGR1bXBcXG4gVGhpbmdzOlwiLCB0aGluZ3MsIFwiXFxuRGVwcyBjb3VudGVyOiBcIiwgZGVwc0NvdW50ZXIsIFwiXFxuU3RyaWdodDpcIiwgaW1tZWRpYXRlLCBcIlxcblJldmVyc2VkOlwiLCByZXZlcnNlZFRyZWUpO1xyXG4gICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbmNDb3VudGVyKG5hbWUpe1xyXG4gICAgICAgIGlmKCFkZXBzQ291bnRlcltuYW1lXSl7XHJcbiAgICAgICAgICAgIGRlcHNDb3VudGVyW25hbWVdID0gMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkZXBzQ291bnRlcltuYW1lXSsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbnNlcnREZXBlbmRlbmN5aW5SVChub2RlTmFtZSwgZGVwZW5kZW5jaWVzKXtcclxuICAgICAgICBkZXBlbmRlbmNpZXMuZm9yRWFjaChmdW5jdGlvbihpdGVtTmFtZSl7XHJcbiAgICAgICAgICAgIHZhciBsID0gcmV2ZXJzZWRUcmVlW2l0ZW1OYW1lXTtcclxuICAgICAgICAgICAgaWYoIWwpe1xyXG4gICAgICAgICAgICAgICAgbCA9IHJldmVyc2VkVHJlZVtpdGVtTmFtZV0gPSB7fTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsW25vZGVOYW1lXSA9IG5vZGVOYW1lO1xyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGRpc2NvdmVyVXBOb2Rlcyhub2RlTmFtZSl7XHJcbiAgICAgICAgdmFyIHJlcyA9IHt9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBERlMobm4pe1xyXG4gICAgICAgICAgICB2YXIgbCA9IHJldmVyc2VkVHJlZVtubl07XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiBsKXtcclxuICAgICAgICAgICAgICAgIGlmKCFyZXNbaV0pe1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc1tpXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgREZTKGkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBERlMobm9kZU5hbWUpO1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhyZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlc2V0Q291bnRlcihuYW1lKXtcclxuICAgICAgICB2YXIgZGVwZW5kZW5jeUFycmF5ID0gaW1tZWRpYXRlW25hbWVdO1xyXG4gICAgICAgIHZhciBjb3VudGVyID0gMDtcclxuICAgICAgICBpZihkZXBlbmRlbmN5QXJyYXkpe1xyXG4gICAgICAgICAgICBkZXBlbmRlbmN5QXJyYXkuZm9yRWFjaChmdW5jdGlvbihkZXApe1xyXG4gICAgICAgICAgICAgICAgaWYodGhpbmdzW2RlcF0gPT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5jQ291bnRlcihuYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXIrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVwc0NvdW50ZXJbbmFtZV0gPSBjb3VudGVyO1xyXG4gICAgICAgIC8vY29uc29sZS5sb2coXCJDb3VudGVyIGZvciBcIiwgbmFtZSwgJyBpcyAnLCBjb3VudGVyKTtcclxuICAgICAgICByZXR1cm4gY291bnRlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKiByZXR1cm5zIHRob3NlIHRoYXQgYXJlIHJlYWR5IHRvIGJlIHJlc29sdmVkKi9cclxuICAgIGZ1bmN0aW9uIHJlc2V0VXBDb3VudGVycyhuYW1lKXtcclxuICAgICAgICB2YXIgcmV0ID0gW107XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZygnUmVzZXRpbmcgdXAgY291bnRlcnMgZm9yICcsIG5hbWUsIFwiUmV2ZXJzZTpcIiwgcmV2ZXJzZWRUcmVlW25hbWVdKTtcclxuICAgICAgICB2YXIgdXBzID0gcmV2ZXJzZWRUcmVlW25hbWVdO1xyXG4gICAgICAgIGZvcih2YXIgdiBpbiB1cHMpe1xyXG4gICAgICAgICAgICBpZihyZXNldENvdW50ZXIodikgPT0gMCl7XHJcbiAgICAgICAgICAgICAgICByZXQucHVzaCh2KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgICAgIFRoZSBmaXJzdCBhcmd1bWVudCBpcyBhIG5hbWUgZm9yIGEgc2VydmljZSwgdmFyaWFibGUsYSAgdGhpbmcgdGhhdCBzaG91bGQgYmUgaW5pdGlhbGlzZWQsIHJlY3JlYXRlZCwgZXRjXHJcbiAgICAgICAgIFRoZSBzZWNvbmQgYXJndW1lbnQgaXMgYW4gYXJyYXkgd2l0aCBkZXBlbmRlbmNpZXNcclxuICAgICAgICAgdGhlIGxhc3QgYXJndW1lbnQgaXMgYSBmdW5jdGlvbihlcnIsLi4uKSB0aGF0IGlzIGNhbGxlZCB3aGVuIGRlcGVuZGVuY2llcyBhcmUgcmVhZHkgb3IgcmVjYWxsZWQgd2hlbiBhcmUgbm90IHJlYWR5IChzdG9wIHdhcyBjYWxsZWQpXHJcbiAgICAgICAgIElmIGVyciBpcyBub3QgdW5kZWZpbmVkIGl0IG1lYW5zIHRoYXQgb25lIG9yIGFueSB1bmRlZmluZWQgdmFyaWFibGVzIGFyZSBub3QgcmVhZHkgYW5kIHRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBhZ2FpbiBsYXRlclxyXG4gICAgICAgICBBbGwgdGhlIG90aGVyIGFyZ3VtZW50cyBhcmUgdGhlIGNvcnJlc3BvbmRpbmcgYXJndW1lbnRzIG9mIHRoZSBjYWxsYmFjayB3aWxsIGJlIHRoZSBhY3R1YWwgdmFsdWVzIG9mIHRoZSBjb3JyZXNwb25kaW5nIGRlcGVuZGVuY3lcclxuICAgICAgICAgVGhlIGNhbGxiYWNrIGZ1bmN0aW9ucyBzaG91bGQgcmV0dXJuIHRoZSBjdXJyZW50IHZhbHVlIChvciBudWxsKVxyXG4gICAgICovXHJcbiAgICB0aGlzLmRlY2xhcmVEZXBlbmRlbmN5ID0gZnVuY3Rpb24obmFtZSwgZGVwZW5kZW5jeUFycmF5LCBjYWxsYmFjayl7XHJcbiAgICAgICAgaWYoY2FsbGJhY2tzW25hbWVdKXtcclxuICAgICAgICAgICAgZXJyb3JIYW5kbGVyLmlnbm9yZVBvc3NpYmxlRXJyb3IoXCJEdXBsaWNhdGUgZGVwZW5kZW5jeTpcIiArIG5hbWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrc1tuYW1lXSA9IGNhbGxiYWNrO1xyXG4gICAgICAgICAgICBpbW1lZGlhdGVbbmFtZV0gICA9IGRlcGVuZGVuY3lBcnJheTtcclxuICAgICAgICAgICAgaW5zZXJ0RGVwZW5kZW5jeWluUlQobmFtZSwgZGVwZW5kZW5jeUFycmF5KTtcclxuICAgICAgICAgICAgdGhpbmdzW25hbWVdID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB1bnNhdGlzZmllZENvdW50ZXIgPSByZXNldENvdW50ZXIobmFtZSk7XHJcbiAgICAgICAgaWYodW5zYXRpc2ZpZWRDb3VudGVyID09IDAgKXtcclxuICAgICAgICAgICAgY2FsbEZvclRoaW5nKG5hbWUsIGZhbHNlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjYWxsRm9yVGhpbmcobmFtZSwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICAgIGNyZWF0ZSBhIHNlcnZpY2VcclxuICAgICAqL1xyXG4gICAgdGhpcy5zZXJ2aWNlID0gZnVuY3Rpb24obmFtZSwgZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcil7XHJcbiAgICAgICAgdGhpcy5kZWNsYXJlRGVwZW5kZW5jeShuYW1lLCBkZXBlbmRlbmN5QXJyYXksIGNvbnN0cnVjdG9yKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgdmFyIHN1YnN5c3RlbUNvdW50ZXIgPSAwO1xyXG4gICAgLypcclxuICAgICBjcmVhdGUgYSBhbm9ueW1vdXMgc3Vic3lzdGVtXHJcbiAgICAgKi9cclxuICAgIHRoaXMuc3Vic3lzdGVtID0gZnVuY3Rpb24oZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcil7XHJcbiAgICAgICAgc3Vic3lzdGVtQ291bnRlcisrO1xyXG4gICAgICAgIHRoaXMuZGVjbGFyZURlcGVuZGVuY3koXCJkaWNvbnRhaW5lcl9zdWJzeXN0ZW1fcGxhY2Vob2xkZXJcIiArIHN1YnN5c3RlbUNvdW50ZXIsIGRlcGVuZGVuY3lBcnJheSwgY29uc3RydWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qIG5vdCBkb2N1bWVudGVkLi4gbGltYm8gc3RhdGUqL1xyXG4gICAgdGhpcy5mYWN0b3J5ID0gZnVuY3Rpb24obmFtZSwgZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcil7XHJcbiAgICAgICAgdGhpcy5kZWNsYXJlRGVwZW5kZW5jeShuYW1lLCBkZXBlbmRlbmN5QXJyYXksIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgY29uc3RydWN0b3IoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNhbGxGb3JUaGluZyhuYW1lLCBvdXRPZlNlcnZpY2Upe1xyXG4gICAgICAgIHZhciBhcmdzID0gaW1tZWRpYXRlW25hbWVdLm1hcChmdW5jdGlvbihpdGVtKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaW5nc1tpdGVtXTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBhcmdzLnVuc2hpZnQob3V0T2ZTZXJ2aWNlKTtcclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGNhbGxiYWNrc1tuYW1lXS5hcHBseSh7fSxhcmdzKTtcclxuICAgICAgICB9IGNhdGNoKGVycil7XHJcbiAgICAgICAgICAgIGVycm9ySGFuZGxlci50aHJvd0Vycm9yKGVycik7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgaWYob3V0T2ZTZXJ2aWNlIHx8IHZhbHVlPT09bnVsbCl7ICAgLy9lbmFibGUgcmV0dXJuaW5nIGEgdGVtcG9yYXJ5IGRlcGVuZGVuY3kgcmVzb2x1dGlvbiFcclxuICAgICAgICAgICAgaWYodGhpbmdzW25hbWVdKXtcclxuICAgICAgICAgICAgICAgIHRoaW5nc1tuYW1lXSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICByZXNldFVwQ291bnRlcnMobmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiU3VjY2VzcyByZXNvbHZpbmcgXCIsIG5hbWUsIFwiOlwiLCB2YWx1ZSwgXCJPdGhlciByZWFkeTpcIiwgb3RoZXJSZWFkeSk7XHJcbiAgICAgICAgICAgIGlmKCF2YWx1ZSl7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9ICB7XCJwbGFjZWhvbGRlclwiOiBuYW1lfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGluZ3NbbmFtZV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgdmFyIG90aGVyUmVhZHkgPSByZXNldFVwQ291bnRlcnMobmFtZSk7XHJcbiAgICAgICAgICAgIG90aGVyUmVhZHkuZm9yRWFjaChmdW5jdGlvbihpdGVtKXtcclxuICAgICAgICAgICAgICAgIGNhbGxGb3JUaGluZyhpdGVtLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICAgIERlY2xhcmUgdGhhdCBhIG5hbWUgaXMgcmVhZHksIHJlc29sdmVkIGFuZCBzaG91bGQgdHJ5IHRvIHJlc29sdmUgYWxsIG90aGVyIHdhaXRpbmcgZm9yIGl0XHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVzb2x2ZSAgICA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKXtcclxuICAgICAgICB0aGluZ3NbbmFtZV0gPSB2YWx1ZTtcclxuICAgICAgICB2YXIgb3RoZXJSZWFkeSA9IHJlc2V0VXBDb3VudGVycyhuYW1lKTtcclxuXHJcbiAgICAgICAgb3RoZXJSZWFkeS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xyXG4gICAgICAgICAgICBjYWxsRm9yVGhpbmcoaXRlbSwgZmFsc2UpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcblxyXG5cclxuICAgIHRoaXMuaW5zdGFuY2VGYWN0b3J5ID0gZnVuY3Rpb24obmFtZSwgZGVwZW5kZW5jeUFycmF5LCBjb25zdHJ1Y3Rvcil7XHJcbiAgICAgICAgZXJyb3JIYW5kbGVyLm5vdEltcGxlbWVudGVkKFwiaW5zdGFuY2VGYWN0b3J5IGlzIHBsYW5uZWQgYnV0IG5vdCBpbXBsZW1lbnRlZFwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICAgIERlY2xhcmUgdGhhdCBhIHNlcnZpY2Ugb3IgZmVhdHVyZSBpcyBub3Qgd29ya2luZyBwcm9wZXJseS4gQWxsIHNlcnZpY2VzIGRlcGVuZGluZyBvbiB0aGlzIHdpbGwgZ2V0IG5vdGlmaWVkXHJcbiAgICAgKi9cclxuICAgIHRoaXMub3V0T2ZTZXJ2aWNlICAgID0gZnVuY3Rpb24obmFtZSl7XHJcbiAgICAgICAgdGhpbmdzW25hbWVdID0gbnVsbDtcclxuICAgICAgICB2YXIgdXBOb2RlcyA9IGRpc2NvdmVyVXBOb2RlcyhuYW1lKTtcclxuICAgICAgICB1cE5vZGVzLmZvckVhY2goZnVuY3Rpb24obm9kZSl7XHJcbiAgICAgICAgICAgIHRoaW5nc1tuYW1lXSA9IG51bGw7XHJcbiAgICAgICAgICAgIGNhbGxGb3JUaGluZyhub2RlLCB0cnVlKTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0cy5uZXdDb250YWluZXIgICAgPSBmdW5jdGlvbihjaGVja3NMaWJyYXJ5KXtcclxuICAgIHJldHVybiBuZXcgQ29udGFpbmVyKGNoZWNrc0xpYnJhcnkpO1xyXG59XHJcblxyXG4vL2V4cG9ydHMuY29udGFpbmVyID0gbmV3IENvbnRhaW5lcigkJC5lcnJvckhhbmRsZXIpO1xyXG4iLCJjb25zdCBQc2tDcnlwdG8gPSByZXF1aXJlKFwiLi9saWIvUHNrQ3J5cHRvXCIpO1xyXG5cclxuY29uc3Qgc3N1dGlsID0gcmVxdWlyZShcIi4vc2lnbnNlbnN1c0RTL3NzdXRpbFwiKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQc2tDcnlwdG87XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5oYXNoVmFsdWVzID0gc3N1dGlsLmhhc2hWYWx1ZXM7XHJcblxyXG4iLCJjb25zdCBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTtcclxuY29uc3QgS2V5RW5jb2RlciA9IHJlcXVpcmUoJy4va2V5RW5jb2RlcicpO1xyXG5cclxuZnVuY3Rpb24gRUNEU0EoY3VydmVOYW1lKXtcclxuICAgIHRoaXMuY3VydmUgPSBjdXJ2ZU5hbWUgfHwgJ3NlY3AyNTZrMSc7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgdGhpcy5nZW5lcmF0ZUtleVBhaXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ICAgICA9IHt9O1xyXG4gICAgICAgIHZhciBlYyAgICAgICAgID0gY3J5cHRvLmNyZWF0ZUVDREgoc2VsZi5jdXJ2ZSk7XHJcbiAgICAgICAgcmVzdWx0LnB1YmxpYyAgPSBlYy5nZW5lcmF0ZUtleXMoJ2hleCcpO1xyXG4gICAgICAgIHJlc3VsdC5wcml2YXRlID0gZWMuZ2V0UHJpdmF0ZUtleSgnaGV4Jyk7XHJcbiAgICAgICAgcmV0dXJuIGtleXNUb1BFTShyZXN1bHQpO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBrZXlzVG9QRU0oa2V5cyl7XHJcbiAgICAgICAgdmFyIHJlc3VsdCAgICAgICAgICAgICAgICAgID0ge307XHJcbiAgICAgICAgdmFyIEVDUHJpdmF0ZUtleUFTTiAgICAgICAgID0gS2V5RW5jb2Rlci5FQ1ByaXZhdGVLZXlBU047XHJcbiAgICAgICAgdmFyIFN1YmplY3RQdWJsaWNLZXlJbmZvQVNOID0gS2V5RW5jb2Rlci5TdWJqZWN0UHVibGljS2V5SW5mb0FTTjtcclxuICAgICAgICB2YXIga2V5RW5jb2RlciAgICAgICAgICAgICAgPSBuZXcgS2V5RW5jb2RlcihzZWxmLmN1cnZlKTtcclxuXHJcbiAgICAgICAgdmFyIHByaXZhdGVLZXlPYmplY3QgICAgICAgID0ga2V5RW5jb2Rlci5wcml2YXRlS2V5T2JqZWN0KGtleXMucHJpdmF0ZSxrZXlzLnB1YmxpYyk7XHJcbiAgICAgICAgdmFyIHB1YmxpY0tleU9iamVjdCAgICAgICAgID0ga2V5RW5jb2Rlci5wdWJsaWNLZXlPYmplY3Qoa2V5cy5wdWJsaWMpO1xyXG5cclxuICAgICAgICByZXN1bHQucHJpdmF0ZSAgICAgICAgICAgICAgPSBFQ1ByaXZhdGVLZXlBU04uZW5jb2RlKHByaXZhdGVLZXlPYmplY3QsICdwZW0nLCBwcml2YXRlS2V5T2JqZWN0LnBlbU9wdGlvbnMpO1xyXG4gICAgICAgIHJlc3VsdC5wdWJsaWMgICAgICAgICAgICAgICA9IFN1YmplY3RQdWJsaWNLZXlJbmZvQVNOLmVuY29kZShwdWJsaWNLZXlPYmplY3QsICdwZW0nLCBwdWJsaWNLZXlPYmplY3QucGVtT3B0aW9ucyk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2lnbiA9IGZ1bmN0aW9uIChwcml2YXRlS2V5LGRpZ2VzdCkge1xyXG4gICAgICAgIHZhciBzaWduID0gY3J5cHRvLmNyZWF0ZVNpZ24oXCJzaGEyNTZcIik7XHJcbiAgICAgICAgc2lnbi51cGRhdGUoZGlnZXN0KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNpZ24uc2lnbihwcml2YXRlS2V5LCdoZXgnKTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy52ZXJpZnkgPSBmdW5jdGlvbiAocHVibGljS2V5LHNpZ25hdHVyZSxkaWdlc3QpIHtcclxuICAgICAgICB2YXIgdmVyaWZ5ID0gY3J5cHRvLmNyZWF0ZVZlcmlmeSgnc2hhMjU2Jyk7XHJcbiAgICAgICAgdmVyaWZ5LnVwZGF0ZShkaWdlc3QpO1xyXG5cclxuICAgICAgICByZXR1cm4gdmVyaWZ5LnZlcmlmeShwdWJsaWNLZXksc2lnbmF0dXJlLCdoZXgnKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0cy5jcmVhdGVFQ0RTQSA9IGZ1bmN0aW9uIChjdXJ2ZSl7XHJcbiAgICByZXR1cm4gbmV3IEVDRFNBKGN1cnZlKTtcclxufTsiLCJcclxuY29uc3QgY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XHJcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcclxuY29uc3QgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xyXG5jb25zdCBEdXBsZXggPSByZXF1aXJlKCdzdHJlYW0nKS5EdXBsZXg7XHJcbmNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcclxuXHJcbmZ1bmN0aW9uIFBza0NyeXB0bygpIHtcclxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFQ0RTQSBmdW5jdGlvbnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHRjb25zdCBlY2RzYSA9IHJlcXVpcmUoXCIuL0VDRFNBXCIpLmNyZWF0ZUVDRFNBKCk7XHJcblx0dGhpcy5nZW5lcmF0ZUVDRFNBS2V5UGFpciA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiBlY2RzYS5nZW5lcmF0ZUtleVBhaXIoKTtcclxuXHR9O1xyXG5cclxuXHR0aGlzLnNpZ24gPSBmdW5jdGlvbiAocHJpdmF0ZUtleSwgZGlnZXN0KSB7XHJcblx0XHRyZXR1cm4gZWNkc2Euc2lnbihwcml2YXRlS2V5LCBkaWdlc3QpO1xyXG5cdH07XHJcblxyXG5cdHRoaXMudmVyaWZ5ID0gZnVuY3Rpb24gKHB1YmxpY0tleSwgc2lnbmF0dXJlLCBkaWdlc3QpIHtcclxuXHRcdHJldHVybiBlY2RzYS52ZXJpZnkocHVibGljS2V5LCBzaWduYXR1cmUsIGRpZ2VzdCk7XHJcblx0fTtcclxuXHJcblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FbmNyeXB0aW9uIGZ1bmN0aW9ucyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHRjb25zdCB1dGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzL2NyeXB0b1V0aWxzXCIpO1xyXG5cdGNvbnN0IGFyY2hpdmVyID0gcmVxdWlyZShcIi4vcHNrLWFyY2hpdmVyXCIpO1xyXG5cdHZhciB0ZW1wRm9sZGVyID0gb3MudG1wZGlyKCk7XHJcblxyXG5cdHRoaXMuZW5jcnlwdFN0cmVhbSA9IGZ1bmN0aW9uIChpbnB1dFBhdGgsIGRlc3RpbmF0aW9uUGF0aCwgcGFzc3dvcmQpIHtcclxuXHRcdHV0aWxzLmVuY3J5cHRGaWxlKGlucHV0UGF0aCwgZGVzdGluYXRpb25QYXRoLCBwYXNzd29yZCk7XHJcblx0fTtcclxuXHJcblx0dGhpcy5kZWNyeXB0U3RyZWFtID0gZnVuY3Rpb24gKGVuY3J5cHRlZElucHV0UGF0aCwgb3V0cHV0Rm9sZGVyLCBwYXNzd29yZCkge1xyXG5cdFx0dXRpbHMuZGVjcnlwdEZpbGUoZW5jcnlwdGVkSW5wdXRQYXRoLCB0ZW1wRm9sZGVyLCBwYXNzd29yZCwgZnVuY3Rpb24gKGVyciwgdGVtcEFyY2hpdmVQYXRoKSB7XHJcblx0XHRcdGFyY2hpdmVyLnVuemlwKHRlbXBBcmNoaXZlUGF0aCwgb3V0cHV0Rm9sZGVyLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coXCJEZWNyeXB0aW9uIGlzIGNvbXBsZXRlZC5cIik7XHJcblx0XHRcdFx0ZnMudW5saW5rU3luYyh0ZW1wQXJjaGl2ZVBhdGgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pXHJcblx0fTtcclxuXHJcblxyXG5cdHRoaXMucHNrSGFzaCA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcblx0XHRpZiAodXRpbHMuaXNKc29uKGRhdGEpKSB7XHJcblx0XHRcdHJldHVybiB1dGlscy5jcmVhdGVQc2tIYXNoKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB1dGlscy5jcmVhdGVQc2tIYXNoKGRhdGEpO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cclxuXHR0aGlzLnNhdmVEU2VlZCA9IGZ1bmN0aW9uIChkc2VlZCwgcGluLCBkc2VlZFBhdGgpIHtcclxuXHRcdHZhciBlbmNyeXB0aW9uS2V5ICAgPSB1dGlscy5kZXJpdmVLZXkocGluLCBudWxsLCBudWxsKTtcclxuXHRcdHZhciBpdiAgICAgICAgICAgICAgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoMTYpO1xyXG5cdFx0dmFyIGNpcGhlciAgICAgICAgICA9IGNyeXB0by5jcmVhdGVDaXBoZXJpdignYWVzLTI1Ni1jZmInLCBlbmNyeXB0aW9uS2V5LCBpdik7XHJcblx0XHR2YXIgZW5jcnlwdGVkRFNlZWQgID0gY2lwaGVyLnVwZGF0ZShkc2VlZCwgJ2JpbmFyeScpO1xyXG5cdFx0dmFyIGZpbmFsICAgICAgICAgICA9IEJ1ZmZlci5mcm9tKGNpcGhlci5maW5hbCgnYmluYXJ5JyksICdiaW5hcnknKTtcclxuXHRcdGVuY3J5cHRlZERTZWVkICAgICAgPSBCdWZmZXIuY29uY2F0KFtpdiwgZW5jcnlwdGVkRFNlZWQsIGZpbmFsXSk7XHJcblx0XHRmcy53cml0ZUZpbGVTeW5jKGRzZWVkUGF0aCwgZW5jcnlwdGVkRFNlZWQpO1xyXG5cdH07XHJcblxyXG5cdHRoaXMubG9hZERzZWVkID0gZnVuY3Rpb24gKHBpbiwgZHNlZWRQYXRoKSB7XHJcblx0XHR2YXIgZW5jcnlwdGVkRGF0YSAgPSBmcy5yZWFkRmlsZVN5bmMoZHNlZWRQYXRoKTtcclxuXHRcdHZhciBpdiAgICAgICAgICAgICA9IGVuY3J5cHRlZERhdGEuc2xpY2UoMCwgMTYpO1xyXG5cdFx0dmFyIGVuY3J5cHRlZERzZWVkID0gZW5jcnlwdGVkRGF0YS5zbGljZSgxNik7XHJcblx0XHR2YXIgZW5jcnlwdGlvbktleSAgPSB1dGlscy5kZXJpdmVLZXkocGluLCBudWxsLCBudWxsKTtcclxuXHRcdHZhciBkZWNpcGhlciAgICAgICA9IGNyeXB0by5jcmVhdGVEZWNpcGhlcml2KCdhZXMtMjU2LWNmYicsIGVuY3J5cHRpb25LZXksIGl2KTtcclxuXHRcdHZhciBkc2VlZCAgICAgICAgICA9IEJ1ZmZlci5mcm9tKGRlY2lwaGVyLnVwZGF0ZShlbmNyeXB0ZWREc2VlZCwgJ2JpbmFyeScpLCAnYmluYXJ5Jyk7XHJcblx0XHR2YXIgZmluYWwgICAgICAgICAgPSBCdWZmZXIuZnJvbShkZWNpcGhlci5maW5hbCgnYmluYXJ5JyksICdiaW5hcnknKTtcclxuXHRcdGRzZWVkICAgICAgICAgICAgICA9IEJ1ZmZlci5jb25jYXQoW2RzZWVkLCBmaW5hbF0pO1xyXG5cclxuXHRcdHJldHVybiBkc2VlZDtcclxuXHJcblx0fTtcclxuXHJcblxyXG5cdHRoaXMuZGVyaXZlU2VlZCA9IGZ1bmN0aW9uIChzZWVkLCBkc2VlZExlbikge1xyXG5cdFx0cmV0dXJuIHV0aWxzLmRlcml2ZUtleShzZWVkLCBudWxsLCBkc2VlZExlbik7XHJcblxyXG5cdH07XHJcblxyXG5cdHRoaXMuZW5jcnlwdEpzb24gPSBmdW5jdGlvbiAoZGF0YSwgZHNlZWQpIHtcclxuXHRcdHZhciBjaXBoZXJUZXh0ID0gdXRpbHMuZW5jcnlwdChKU09OLnN0cmluZ2lmeShkYXRhKSwgZHNlZWQpO1xyXG5cclxuXHRcdHJldHVybiBjaXBoZXJUZXh0O1xyXG5cdH07XHJcblxyXG5cdHRoaXMuZGVjcnlwdEpzb24gPSBmdW5jdGlvbiAoZW5jcnlwdGVkRGF0YSwgZHNlZWQpIHtcclxuXHRcdHZhciBwbGFpbnRleHQgPSB1dGlscy5kZWNyeXB0KGVuY3J5cHRlZERhdGEsIGRzZWVkKTtcclxuXHJcblx0XHRyZXR1cm4gSlNPTi5wYXJzZShwbGFpbnRleHQpO1xyXG5cdH07XHJcblxyXG5cdHRoaXMuZW5jcnlwdEJsb2IgPSBmdW5jdGlvbiAoZGF0YSwgZHNlZWQpIHtcclxuXHRcdHZhciBjaXBoZXJ0ZXh0ID0gdXRpbHMuZW5jcnlwdChkYXRhLCBkc2VlZCk7XHJcblxyXG5cdFx0cmV0dXJuIGNpcGhlcnRleHQ7XHJcblx0fTtcclxuXHJcblx0dGhpcy5kZWNyeXB0QmxvYiA9IGZ1bmN0aW9uIChlbmNyeXB0ZWREYXRhLCBkc2VlZCkge1xyXG5cdFx0dmFyIHBsYWludGV4dCA9IHV0aWxzLmRlY3J5cHQoZW5jcnlwdGVkRGF0YSwgZHNlZWQpO1xyXG5cclxuXHRcdHJldHVybiBwbGFpbnRleHQ7XHJcblx0fTtcclxuXHJcblxyXG5cdHRoaXMuZ2VuZXJhdGVTZWVkID0gZnVuY3Rpb24gKGJhY2t1cFVybCkge1xyXG5cdFx0dmFyIHNlZWQgPSB7XHJcblx0XHRcdFwiYmFja3VwXCI6IGJhY2t1cFVybCxcclxuXHRcdFx0XCJyYW5kXCJcdDogY3J5cHRvLnJhbmRvbUJ5dGVzKDMyKS50b1N0cmluZyhcImhleFwiKVxyXG5cdFx0fTtcclxuXHRcdHJldHVybiBCdWZmZXIuZnJvbShKU09OLnN0cmluZ2lmeShzZWVkKSk7XHJcblx0fTtcclxuXHR0aGlzLmdlbmVyYXRlU2FmZVVpZCA9IGZ1bmN0aW9uIChkc2VlZCwgcGF0aCkge1xyXG5cdFx0cGF0aCA9IHBhdGggfHwgcHJvY2Vzcy5jd2QoKTtcclxuXHRcdHJldHVybiB1dGlscy5lbmNvZGUodGhpcy5wc2tIYXNoKEJ1ZmZlci5jb25jYXQoW0J1ZmZlci5mcm9tKHBhdGgpLCBkc2VlZF0pKSk7XHJcblx0fTtcclxufVxyXG5cclxuLy8gdmFyIHBjcnlwdG8gPSBuZXcgUHNrQ3J5cHRvKCk7XHJcbi8vIHBjcnlwdG8uZW5jcnlwdFN0cmVhbShcIkM6XFxcXFVzZXJzXFxcXEFjZXJcXFxcV2Vic3Rvcm1Qcm9qZWN0c1xcXFxwcml2YXRlc2t5XFxcXHRlc3RzXFxcXHBzay11bml0LXRlc3RpbmdcXFxcemlwXFxcXG91dHB1dFwiLFwib3V0cHV0L215ZmlsZVwiLCBcIjEyM1wiKTtcclxuLy8gcGNyeXB0by5kZWNyeXB0U3RyZWFtKFwib3V0cHV0XFxcXG15ZmlsZVwiLCBcIm91dHB1dFwiLCBcIjEyM1wiKTtcclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgUHNrQ3J5cHRvKCk7IiwidmFyIGFzbjEgPSByZXF1aXJlKCcuL2FzbjEnKTtcclxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgndXRpbCcpLmluaGVyaXRzO1xyXG5cclxudmFyIGFwaSA9IGV4cG9ydHM7XHJcblxyXG5hcGkuZGVmaW5lID0gZnVuY3Rpb24gZGVmaW5lKG5hbWUsIGJvZHkpIHtcclxuICByZXR1cm4gbmV3IEVudGl0eShuYW1lLCBib2R5KTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIEVudGl0eShuYW1lLCBib2R5KSB7XHJcbiAgdGhpcy5uYW1lID0gbmFtZTtcclxuICB0aGlzLmJvZHkgPSBib2R5O1xyXG5cclxuICB0aGlzLmRlY29kZXJzID0ge307XHJcbiAgdGhpcy5lbmNvZGVycyA9IHt9O1xyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5fY3JlYXRlTmFtZWQgPSBmdW5jdGlvbiBjcmVhdGVOYW1lZChiYXNlKSB7XHJcbiAgdmFyIG5hbWVkO1xyXG4gIHRyeSB7XHJcbiAgICBuYW1lZCA9IHJlcXVpcmUoJ3ZtJykucnVuSW5UaGlzQ29udGV4dChcclxuICAgICAgJyhmdW5jdGlvbiAnICsgdGhpcy5uYW1lICsgJyhlbnRpdHkpIHtcXG4nICtcclxuICAgICAgJyAgdGhpcy5faW5pdE5hbWVkKGVudGl0eSk7XFxuJyArXHJcbiAgICAgICd9KSdcclxuICAgICk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgbmFtZWQgPSBmdW5jdGlvbiAoZW50aXR5KSB7XHJcbiAgICAgIHRoaXMuX2luaXROYW1lZChlbnRpdHkpO1xyXG4gICAgfTtcclxuICB9XHJcbiAgaW5oZXJpdHMobmFtZWQsIGJhc2UpO1xyXG4gIG5hbWVkLnByb3RvdHlwZS5faW5pdE5hbWVkID0gZnVuY3Rpb24gaW5pdG5hbWVkKGVudGl0eSkge1xyXG4gICAgYmFzZS5jYWxsKHRoaXMsIGVudGl0eSk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIG5ldyBuYW1lZCh0aGlzKTtcclxufTtcclxuXHJcbkVudGl0eS5wcm90b3R5cGUuX2dldERlY29kZXIgPSBmdW5jdGlvbiBfZ2V0RGVjb2RlcihlbmMpIHtcclxuICAvLyBMYXppbHkgY3JlYXRlIGRlY29kZXJcclxuICBpZiAoIXRoaXMuZGVjb2RlcnMuaGFzT3duUHJvcGVydHkoZW5jKSlcclxuICAgIHRoaXMuZGVjb2RlcnNbZW5jXSA9IHRoaXMuX2NyZWF0ZU5hbWVkKGFzbjEuZGVjb2RlcnNbZW5jXSk7XHJcbiAgcmV0dXJuIHRoaXMuZGVjb2RlcnNbZW5jXTtcclxufTtcclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZGVjb2RlID0gZnVuY3Rpb24gZGVjb2RlKGRhdGEsIGVuYywgb3B0aW9ucykge1xyXG4gIHJldHVybiB0aGlzLl9nZXREZWNvZGVyKGVuYykuZGVjb2RlKGRhdGEsIG9wdGlvbnMpO1xyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5fZ2V0RW5jb2RlciA9IGZ1bmN0aW9uIF9nZXRFbmNvZGVyKGVuYykge1xyXG4gIC8vIExhemlseSBjcmVhdGUgZW5jb2RlclxyXG4gIGlmICghdGhpcy5lbmNvZGVycy5oYXNPd25Qcm9wZXJ0eShlbmMpKVxyXG4gICAgdGhpcy5lbmNvZGVyc1tlbmNdID0gdGhpcy5fY3JlYXRlTmFtZWQoYXNuMS5lbmNvZGVyc1tlbmNdKTtcclxuICByZXR1cm4gdGhpcy5lbmNvZGVyc1tlbmNdO1xyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5lbmNvZGUgPSBmdW5jdGlvbiBlbmNvZGUoZGF0YSwgZW5jLCAvKiBpbnRlcm5hbCAqLyByZXBvcnRlcikge1xyXG4gIHJldHVybiB0aGlzLl9nZXRFbmNvZGVyKGVuYykuZW5jb2RlKGRhdGEsIHJlcG9ydGVyKTtcclxufTtcclxuIiwidmFyIGFzbjEgPSBleHBvcnRzO1xyXG5cclxuYXNuMS5iaWdudW0gPSByZXF1aXJlKCcuL2JpZ251bS9ibicpO1xyXG5cclxuYXNuMS5kZWZpbmUgPSByZXF1aXJlKCcuL2FwaScpLmRlZmluZTtcclxuYXNuMS5iYXNlID0gcmVxdWlyZSgnLi9iYXNlL2luZGV4Jyk7XHJcbmFzbjEuY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMvaW5kZXgnKTtcclxuYXNuMS5kZWNvZGVycyA9IHJlcXVpcmUoJy4vZGVjb2RlcnMvaW5kZXgnKTtcclxuYXNuMS5lbmNvZGVycyA9IHJlcXVpcmUoJy4vZW5jb2RlcnMvaW5kZXgnKTtcclxuIiwidmFyIGluaGVyaXRzID0gcmVxdWlyZSgndXRpbCcpLmluaGVyaXRzO1xyXG52YXIgUmVwb3J0ZXIgPSByZXF1aXJlKCcuLi9iYXNlJykuUmVwb3J0ZXI7XHJcbnZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7XHJcblxyXG5mdW5jdGlvbiBEZWNvZGVyQnVmZmVyKGJhc2UsIG9wdGlvbnMpIHtcclxuICBSZXBvcnRlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xyXG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJhc2UpKSB7XHJcbiAgICB0aGlzLmVycm9yKCdJbnB1dCBub3QgQnVmZmVyJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0aGlzLmJhc2UgPSBiYXNlO1xyXG4gIHRoaXMub2Zmc2V0ID0gMDtcclxuICB0aGlzLmxlbmd0aCA9IGJhc2UubGVuZ3RoO1xyXG59XHJcbmluaGVyaXRzKERlY29kZXJCdWZmZXIsIFJlcG9ydGVyKTtcclxuZXhwb3J0cy5EZWNvZGVyQnVmZmVyID0gRGVjb2RlckJ1ZmZlcjtcclxuXHJcbkRlY29kZXJCdWZmZXIucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbiBzYXZlKCkge1xyXG4gIHJldHVybiB7IG9mZnNldDogdGhpcy5vZmZzZXQsIHJlcG9ydGVyOiBSZXBvcnRlci5wcm90b3R5cGUuc2F2ZS5jYWxsKHRoaXMpIH07XHJcbn07XHJcblxyXG5EZWNvZGVyQnVmZmVyLnByb3RvdHlwZS5yZXN0b3JlID0gZnVuY3Rpb24gcmVzdG9yZShzYXZlKSB7XHJcbiAgLy8gUmV0dXJuIHNraXBwZWQgZGF0YVxyXG4gIHZhciByZXMgPSBuZXcgRGVjb2RlckJ1ZmZlcih0aGlzLmJhc2UpO1xyXG4gIHJlcy5vZmZzZXQgPSBzYXZlLm9mZnNldDtcclxuICByZXMubGVuZ3RoID0gdGhpcy5vZmZzZXQ7XHJcblxyXG4gIHRoaXMub2Zmc2V0ID0gc2F2ZS5vZmZzZXQ7XHJcbiAgUmVwb3J0ZXIucHJvdG90eXBlLnJlc3RvcmUuY2FsbCh0aGlzLCBzYXZlLnJlcG9ydGVyKTtcclxuXHJcbiAgcmV0dXJuIHJlcztcclxufTtcclxuXHJcbkRlY29kZXJCdWZmZXIucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbiBpc0VtcHR5KCkge1xyXG4gIHJldHVybiB0aGlzLm9mZnNldCA9PT0gdGhpcy5sZW5ndGg7XHJcbn07XHJcblxyXG5EZWNvZGVyQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiByZWFkVUludDgoZmFpbCkge1xyXG4gIGlmICh0aGlzLm9mZnNldCArIDEgPD0gdGhpcy5sZW5ndGgpXHJcbiAgICByZXR1cm4gdGhpcy5iYXNlLnJlYWRVSW50OCh0aGlzLm9mZnNldCsrLCB0cnVlKTtcclxuICBlbHNlXHJcbiAgICByZXR1cm4gdGhpcy5lcnJvcihmYWlsIHx8ICdEZWNvZGVyQnVmZmVyIG92ZXJydW4nKTtcclxufVxyXG5cclxuRGVjb2RlckJ1ZmZlci5wcm90b3R5cGUuc2tpcCA9IGZ1bmN0aW9uIHNraXAoYnl0ZXMsIGZhaWwpIHtcclxuICBpZiAoISh0aGlzLm9mZnNldCArIGJ5dGVzIDw9IHRoaXMubGVuZ3RoKSlcclxuICAgIHJldHVybiB0aGlzLmVycm9yKGZhaWwgfHwgJ0RlY29kZXJCdWZmZXIgb3ZlcnJ1bicpO1xyXG5cclxuICB2YXIgcmVzID0gbmV3IERlY29kZXJCdWZmZXIodGhpcy5iYXNlKTtcclxuXHJcbiAgLy8gU2hhcmUgcmVwb3J0ZXIgc3RhdGVcclxuICByZXMuX3JlcG9ydGVyU3RhdGUgPSB0aGlzLl9yZXBvcnRlclN0YXRlO1xyXG5cclxuICByZXMub2Zmc2V0ID0gdGhpcy5vZmZzZXQ7XHJcbiAgcmVzLmxlbmd0aCA9IHRoaXMub2Zmc2V0ICsgYnl0ZXM7XHJcbiAgdGhpcy5vZmZzZXQgKz0gYnl0ZXM7XHJcbiAgcmV0dXJuIHJlcztcclxufVxyXG5cclxuRGVjb2RlckJ1ZmZlci5wcm90b3R5cGUucmF3ID0gZnVuY3Rpb24gcmF3KHNhdmUpIHtcclxuICByZXR1cm4gdGhpcy5iYXNlLnNsaWNlKHNhdmUgPyBzYXZlLm9mZnNldCA6IHRoaXMub2Zmc2V0LCB0aGlzLmxlbmd0aCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEVuY29kZXJCdWZmZXIodmFsdWUsIHJlcG9ydGVyKSB7XHJcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XHJcbiAgICB0aGlzLmxlbmd0aCA9IDA7XHJcbiAgICB0aGlzLnZhbHVlID0gdmFsdWUubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgaWYgKCEoaXRlbSBpbnN0YW5jZW9mIEVuY29kZXJCdWZmZXIpKVxyXG4gICAgICAgIGl0ZW0gPSBuZXcgRW5jb2RlckJ1ZmZlcihpdGVtLCByZXBvcnRlcik7XHJcbiAgICAgIHRoaXMubGVuZ3RoICs9IGl0ZW0ubGVuZ3RoO1xyXG4gICAgICByZXR1cm4gaXRlbTtcclxuICAgIH0sIHRoaXMpO1xyXG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xyXG4gICAgaWYgKCEoMCA8PSB2YWx1ZSAmJiB2YWx1ZSA8PSAweGZmKSlcclxuICAgICAgcmV0dXJuIHJlcG9ydGVyLmVycm9yKCdub24tYnl0ZSBFbmNvZGVyQnVmZmVyIHZhbHVlJyk7XHJcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XHJcbiAgICB0aGlzLmxlbmd0aCA9IDE7XHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XHJcbiAgICB0aGlzLmxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHZhbHVlKTtcclxuICB9IGVsc2UgaWYgKEJ1ZmZlci5pc0J1ZmZlcih2YWx1ZSkpIHtcclxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuICAgIHRoaXMubGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gcmVwb3J0ZXIuZXJyb3IoJ1Vuc3VwcG9ydGVkIHR5cGU6ICcgKyB0eXBlb2YgdmFsdWUpO1xyXG4gIH1cclxufVxyXG5leHBvcnRzLkVuY29kZXJCdWZmZXIgPSBFbmNvZGVyQnVmZmVyO1xyXG5cclxuRW5jb2RlckJ1ZmZlci5wcm90b3R5cGUuam9pbiA9IGZ1bmN0aW9uIGpvaW4ob3V0LCBvZmZzZXQpIHtcclxuICBpZiAoIW91dClcclxuICAgIG91dCA9IG5ldyBCdWZmZXIodGhpcy5sZW5ndGgpO1xyXG4gIGlmICghb2Zmc2V0KVxyXG4gICAgb2Zmc2V0ID0gMDtcclxuXHJcbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKVxyXG4gICAgcmV0dXJuIG91dDtcclxuXHJcbiAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy52YWx1ZSkpIHtcclxuICAgIHRoaXMudmFsdWUuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgIGl0ZW0uam9pbihvdXQsIG9mZnNldCk7XHJcbiAgICAgIG9mZnNldCArPSBpdGVtLmxlbmd0aDtcclxuICAgIH0pO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBpZiAodHlwZW9mIHRoaXMudmFsdWUgPT09ICdudW1iZXInKVxyXG4gICAgICBvdXRbb2Zmc2V0XSA9IHRoaXMudmFsdWU7XHJcbiAgICBlbHNlIGlmICh0eXBlb2YgdGhpcy52YWx1ZSA9PT0gJ3N0cmluZycpXHJcbiAgICAgIG91dC53cml0ZSh0aGlzLnZhbHVlLCBvZmZzZXQpO1xyXG4gICAgZWxzZSBpZiAoQnVmZmVyLmlzQnVmZmVyKHRoaXMudmFsdWUpKVxyXG4gICAgICB0aGlzLnZhbHVlLmNvcHkob3V0LCBvZmZzZXQpO1xyXG4gICAgb2Zmc2V0ICs9IHRoaXMubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG91dDtcclxufTtcclxuIiwidmFyIGJhc2UgPSBleHBvcnRzO1xyXG5cclxuYmFzZS5SZXBvcnRlciA9IHJlcXVpcmUoJy4vcmVwb3J0ZXInKS5SZXBvcnRlcjtcclxuYmFzZS5EZWNvZGVyQnVmZmVyID0gcmVxdWlyZSgnLi9idWZmZXInKS5EZWNvZGVyQnVmZmVyO1xyXG5iYXNlLkVuY29kZXJCdWZmZXIgPSByZXF1aXJlKCcuL2J1ZmZlcicpLkVuY29kZXJCdWZmZXI7XHJcbmJhc2UuTm9kZSA9IHJlcXVpcmUoJy4vbm9kZScpO1xyXG4iLCJ2YXIgUmVwb3J0ZXIgPSByZXF1aXJlKCcuLi9iYXNlJykuUmVwb3J0ZXI7XHJcbnZhciBFbmNvZGVyQnVmZmVyID0gcmVxdWlyZSgnLi4vYmFzZScpLkVuY29kZXJCdWZmZXI7XHJcbi8vdmFyIGFzc2VydCA9IHJlcXVpcmUoJ2RvdWJsZS1jaGVjaycpLmFzc2VydDtcclxuXHJcbi8vIFN1cHBvcnRlZCB0YWdzXHJcbnZhciB0YWdzID0gW1xyXG4gICdzZXEnLCAnc2Vxb2YnLCAnc2V0JywgJ3NldG9mJywgJ29jdHN0cicsICdiaXRzdHInLCAnb2JqaWQnLCAnYm9vbCcsXHJcbiAgJ2dlbnRpbWUnLCAndXRjdGltZScsICdudWxsXycsICdlbnVtJywgJ2ludCcsICdpYTVzdHInLCAndXRmOHN0cidcclxuXTtcclxuXHJcbi8vIFB1YmxpYyBtZXRob2RzIGxpc3RcclxudmFyIG1ldGhvZHMgPSBbXHJcbiAgJ2tleScsICdvYmonLCAndXNlJywgJ29wdGlvbmFsJywgJ2V4cGxpY2l0JywgJ2ltcGxpY2l0JywgJ2RlZicsICdjaG9pY2UnLFxyXG4gICdhbnknXHJcbl0uY29uY2F0KHRhZ3MpO1xyXG5cclxuLy8gT3ZlcnJpZGVkIG1ldGhvZHMgbGlzdFxyXG52YXIgb3ZlcnJpZGVkID0gW1xyXG4gICdfcGVla1RhZycsICdfZGVjb2RlVGFnJywgJ191c2UnLFxyXG4gICdfZGVjb2RlU3RyJywgJ19kZWNvZGVPYmppZCcsICdfZGVjb2RlVGltZScsXHJcbiAgJ19kZWNvZGVOdWxsJywgJ19kZWNvZGVJbnQnLCAnX2RlY29kZUJvb2wnLCAnX2RlY29kZUxpc3QnLFxyXG5cclxuICAnX2VuY29kZUNvbXBvc2l0ZScsICdfZW5jb2RlU3RyJywgJ19lbmNvZGVPYmppZCcsICdfZW5jb2RlVGltZScsXHJcbiAgJ19lbmNvZGVOdWxsJywgJ19lbmNvZGVJbnQnLCAnX2VuY29kZUJvb2wnXHJcbl07XHJcblxyXG5mdW5jdGlvbiBOb2RlKGVuYywgcGFyZW50KSB7XHJcbiAgdmFyIHN0YXRlID0ge307XHJcbiAgdGhpcy5fYmFzZVN0YXRlID0gc3RhdGU7XHJcblxyXG4gIHN0YXRlLmVuYyA9IGVuYztcclxuXHJcbiAgc3RhdGUucGFyZW50ID0gcGFyZW50IHx8IG51bGw7XHJcbiAgc3RhdGUuY2hpbGRyZW4gPSBudWxsO1xyXG5cclxuICAvLyBTdGF0ZVxyXG4gIHN0YXRlLnRhZyA9IG51bGw7XHJcbiAgc3RhdGUuYXJncyA9IG51bGw7XHJcbiAgc3RhdGUucmV2ZXJzZUFyZ3MgPSBudWxsO1xyXG4gIHN0YXRlLmNob2ljZSA9IG51bGw7XHJcbiAgc3RhdGUub3B0aW9uYWwgPSBmYWxzZTtcclxuICBzdGF0ZS5hbnkgPSBmYWxzZTtcclxuICBzdGF0ZS5vYmogPSBmYWxzZTtcclxuICBzdGF0ZS51c2UgPSBudWxsO1xyXG4gIHN0YXRlLnVzZURlY29kZXIgPSBudWxsO1xyXG4gIHN0YXRlLmtleSA9IG51bGw7XHJcbiAgc3RhdGVbJ2RlZmF1bHQnXSA9IG51bGw7XHJcbiAgc3RhdGUuZXhwbGljaXQgPSBudWxsO1xyXG4gIHN0YXRlLmltcGxpY2l0ID0gbnVsbDtcclxuXHJcbiAgLy8gU2hvdWxkIGNyZWF0ZSBuZXcgaW5zdGFuY2Ugb24gZWFjaCBtZXRob2RcclxuICBpZiAoIXN0YXRlLnBhcmVudCkge1xyXG4gICAgc3RhdGUuY2hpbGRyZW4gPSBbXTtcclxuICAgIHRoaXMuX3dyYXAoKTtcclxuICB9XHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBOb2RlO1xyXG5cclxudmFyIHN0YXRlUHJvcHMgPSBbXHJcbiAgJ2VuYycsICdwYXJlbnQnLCAnY2hpbGRyZW4nLCAndGFnJywgJ2FyZ3MnLCAncmV2ZXJzZUFyZ3MnLCAnY2hvaWNlJyxcclxuICAnb3B0aW9uYWwnLCAnYW55JywgJ29iaicsICd1c2UnLCAnYWx0ZXJlZFVzZScsICdrZXknLCAnZGVmYXVsdCcsICdleHBsaWNpdCcsXHJcbiAgJ2ltcGxpY2l0J1xyXG5dO1xyXG5cclxuTm9kZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiBjbG9uZSgpIHtcclxuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XHJcbiAgdmFyIGNzdGF0ZSA9IHt9O1xyXG4gIHN0YXRlUHJvcHMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XHJcbiAgICBjc3RhdGVbcHJvcF0gPSBzdGF0ZVtwcm9wXTtcclxuICB9KTtcclxuICB2YXIgcmVzID0gbmV3IHRoaXMuY29uc3RydWN0b3IoY3N0YXRlLnBhcmVudCk7XHJcbiAgcmVzLl9iYXNlU3RhdGUgPSBjc3RhdGU7XHJcbiAgcmV0dXJuIHJlcztcclxufTtcclxuXHJcbk5vZGUucHJvdG90eXBlLl93cmFwID0gZnVuY3Rpb24gd3JhcCgpIHtcclxuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XHJcbiAgbWV0aG9kcy5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xyXG4gICAgdGhpc1ttZXRob2RdID0gZnVuY3Rpb24gX3dyYXBwZWRNZXRob2QoKSB7XHJcbiAgICAgIHZhciBjbG9uZSA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMpO1xyXG4gICAgICBzdGF0ZS5jaGlsZHJlbi5wdXNoKGNsb25lKTtcclxuICAgICAgcmV0dXJuIGNsb25lW21ldGhvZF0uYXBwbHkoY2xvbmUsIGFyZ3VtZW50cyk7XHJcbiAgICB9O1xyXG4gIH0sIHRoaXMpO1xyXG59O1xyXG5cclxuTm9kZS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbiBpbml0KGJvZHkpIHtcclxuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XHJcblxyXG4gIC8vYXNzZXJ0LmVxdWFsKHN0YXRlLnBhcmVudCxudWxsLCdzdGF0ZS5wYXJlbnQgc2hvdWxkIGJlIG51bGwnKTtcclxuICBib2R5LmNhbGwodGhpcyk7XHJcblxyXG4gIC8vIEZpbHRlciBjaGlsZHJlblxyXG4gIHN0YXRlLmNoaWxkcmVuID0gc3RhdGUuY2hpbGRyZW4uZmlsdGVyKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICByZXR1cm4gY2hpbGQuX2Jhc2VTdGF0ZS5wYXJlbnQgPT09IHRoaXM7XHJcbiAgfSwgdGhpcyk7XHJcbiAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlLmNoaWxkcmVuLmxlbmd0aCwgMSwgJ1Jvb3Qgbm9kZSBjYW4gaGF2ZSBvbmx5IG9uZSBjaGlsZCcpO1xyXG59O1xyXG5cclxuTm9kZS5wcm90b3R5cGUuX3VzZUFyZ3MgPSBmdW5jdGlvbiB1c2VBcmdzKGFyZ3MpIHtcclxuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XHJcblxyXG4gIC8vIEZpbHRlciBjaGlsZHJlbiBhbmQgYXJnc1xyXG4gIHZhciBjaGlsZHJlbiA9IGFyZ3MuZmlsdGVyKGZ1bmN0aW9uKGFyZykge1xyXG4gICAgcmV0dXJuIGFyZyBpbnN0YW5jZW9mIHRoaXMuY29uc3RydWN0b3I7XHJcbiAgfSwgdGhpcyk7XHJcbiAgYXJncyA9IGFyZ3MuZmlsdGVyKGZ1bmN0aW9uKGFyZykge1xyXG4gICAgcmV0dXJuICEoYXJnIGluc3RhbmNlb2YgdGhpcy5jb25zdHJ1Y3Rvcik7XHJcbiAgfSwgdGhpcyk7XHJcblxyXG4gIGlmIChjaGlsZHJlbi5sZW5ndGggIT09IDApIHtcclxuICAgIC8vIGFzc2VydC5lcXVhbChzdGF0ZS5jaGlsZHJlbiwgbnVsbCwgJ3N0YXRlLmNoaWxkcmVuIHNob3VsZCBiZSBudWxsJyk7XHJcbiAgICBzdGF0ZS5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG5cclxuICAgIC8vIFJlcGxhY2UgcGFyZW50IHRvIG1haW50YWluIGJhY2t3YXJkIGxpbmtcclxuICAgIGNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgY2hpbGQuX2Jhc2VTdGF0ZS5wYXJlbnQgPSB0aGlzO1xyXG4gICAgfSwgdGhpcyk7XHJcbiAgfVxyXG4gIGlmIChhcmdzLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlLmFyZ3MsIG51bGwsICdzdGF0ZS5hcmdzIHNob3VsZCBiZSBudWxsJyk7XHJcbiAgICBzdGF0ZS5hcmdzID0gYXJncztcclxuICAgIHN0YXRlLnJldmVyc2VBcmdzID0gYXJncy5tYXAoZnVuY3Rpb24oYXJnKSB7XHJcbiAgICAgIGlmICh0eXBlb2YgYXJnICE9PSAnb2JqZWN0JyB8fCBhcmcuY29uc3RydWN0b3IgIT09IE9iamVjdClcclxuICAgICAgICByZXR1cm4gYXJnO1xyXG5cclxuICAgICAgdmFyIHJlcyA9IHt9O1xyXG4gICAgICBPYmplY3Qua2V5cyhhcmcpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgaWYgKGtleSA9PSAoa2V5IHwgMCkpXHJcbiAgICAgICAgICBrZXkgfD0gMDtcclxuICAgICAgICB2YXIgdmFsdWUgPSBhcmdba2V5XTtcclxuICAgICAgICByZXNbdmFsdWVdID0ga2V5O1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIHJlcztcclxuICAgIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbi8vXHJcbi8vIE92ZXJyaWRlZCBtZXRob2RzXHJcbi8vXHJcblxyXG5vdmVycmlkZWQuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcclxuICBOb2RlLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24gX292ZXJyaWRlZCgpIHtcclxuICAgIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcclxuICAgIHRocm93IG5ldyBFcnJvcihtZXRob2QgKyAnIG5vdCBpbXBsZW1lbnRlZCBmb3IgZW5jb2Rpbmc6ICcgKyBzdGF0ZS5lbmMpO1xyXG4gIH07XHJcbn0pO1xyXG5cclxuLy9cclxuLy8gUHVibGljIG1ldGhvZHNcclxuLy9cclxuXHJcbnRhZ3MuZm9yRWFjaChmdW5jdGlvbih0YWcpIHtcclxuICBOb2RlLnByb3RvdHlwZVt0YWddID0gZnVuY3Rpb24gX3RhZ01ldGhvZCgpIHtcclxuICAgIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcclxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuXHJcbiAgICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUudGFnLCBudWxsLCAnc3RhdGUudGFnIHNob3VsZCBiZSBudWxsJyk7XHJcbiAgICBzdGF0ZS50YWcgPSB0YWc7XHJcblxyXG4gICAgdGhpcy5fdXNlQXJncyhhcmdzKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG59KTtcclxuXHJcbk5vZGUucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShpdGVtKSB7XHJcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xyXG5cclxuICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUudXNlLCBudWxsLCAnc3RhdGUudXNlIHNob3VsZCBiZSBudWxsJyk7XHJcbiAgc3RhdGUudXNlID0gaXRlbTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5Ob2RlLnByb3RvdHlwZS5vcHRpb25hbCA9IGZ1bmN0aW9uIG9wdGlvbmFsKCkge1xyXG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcclxuXHJcbiAgc3RhdGUub3B0aW9uYWwgPSB0cnVlO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbk5vZGUucHJvdG90eXBlLmRlZiA9IGZ1bmN0aW9uIGRlZih2YWwpIHtcclxuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XHJcblxyXG4gIC8vIGFzc2VydC5lcXVhbChzdGF0ZVsnZGVmYXVsdCddLCBudWxsLCBcInN0YXRlWydkZWZhdWx0J10gc2hvdWxkIGJlIG51bGxcIik7XHJcbiAgc3RhdGVbJ2RlZmF1bHQnXSA9IHZhbDtcclxuICBzdGF0ZS5vcHRpb25hbCA9IHRydWU7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuTm9kZS5wcm90b3R5cGUuZXhwbGljaXQgPSBmdW5jdGlvbiBleHBsaWNpdChudW0pIHtcclxuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XHJcblxyXG4gIC8vIGFzc2VydC5lcXVhbChzdGF0ZS5leHBsaWNpdCxudWxsLCAnc3RhdGUuZXhwbGljaXQgc2hvdWxkIGJlIG51bGwnKTtcclxuICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUuaW1wbGljaXQsbnVsbCwgJ3N0YXRlLmltcGxpY2l0IHNob3VsZCBiZSBudWxsJyk7XHJcblxyXG4gIHN0YXRlLmV4cGxpY2l0ID0gbnVtO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbk5vZGUucHJvdG90eXBlLmltcGxpY2l0ID0gZnVuY3Rpb24gaW1wbGljaXQobnVtKSB7XHJcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xyXG5cclxuICAgIC8vIGFzc2VydC5lcXVhbChzdGF0ZS5leHBsaWNpdCxudWxsLCAnc3RhdGUuZXhwbGljaXQgc2hvdWxkIGJlIG51bGwnKTtcclxuICAgIC8vIGFzc2VydC5lcXVhbChzdGF0ZS5pbXBsaWNpdCxudWxsLCAnc3RhdGUuaW1wbGljaXQgc2hvdWxkIGJlIG51bGwnKTtcclxuXHJcbiAgICBzdGF0ZS5pbXBsaWNpdCA9IG51bTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5Ob2RlLnByb3RvdHlwZS5vYmogPSBmdW5jdGlvbiBvYmooKSB7XHJcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xyXG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuXHJcbiAgc3RhdGUub2JqID0gdHJ1ZTtcclxuXHJcbiAgaWYgKGFyZ3MubGVuZ3RoICE9PSAwKVxyXG4gICAgdGhpcy5fdXNlQXJncyhhcmdzKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5Ob2RlLnByb3RvdHlwZS5rZXkgPSBmdW5jdGlvbiBrZXkobmV3S2V5KSB7XHJcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xyXG5cclxuICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUua2V5LCBudWxsLCAnc3RhdGUua2V5IHNob3VsZCBiZSBudWxsJyk7XHJcbiAgc3RhdGUua2V5ID0gbmV3S2V5O1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbk5vZGUucHJvdG90eXBlLmFueSA9IGZ1bmN0aW9uIGFueSgpIHtcclxuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XHJcblxyXG4gIHN0YXRlLmFueSA9IHRydWU7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuTm9kZS5wcm90b3R5cGUuY2hvaWNlID0gZnVuY3Rpb24gY2hvaWNlKG9iaikge1xyXG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcclxuXHJcbiAgLy8gYXNzZXJ0LmVxdWFsKHN0YXRlLmNob2ljZSwgbnVsbCwnc3RhdGUuY2hvaWNlIHNob3VsZCBiZSBudWxsJyk7XHJcbiAgc3RhdGUuY2hvaWNlID0gb2JqO1xyXG4gIHRoaXMuX3VzZUFyZ3MoT2JqZWN0LmtleXMob2JqKS5tYXAoZnVuY3Rpb24oa2V5KSB7XHJcbiAgICByZXR1cm4gb2JqW2tleV07XHJcbiAgfSkpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8vXHJcbi8vIERlY29kaW5nXHJcbi8vXHJcblxyXG5Ob2RlLnByb3RvdHlwZS5fZGVjb2RlID0gZnVuY3Rpb24gZGVjb2RlKGlucHV0KSB7XHJcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xyXG5cclxuICAvLyBEZWNvZGUgcm9vdCBub2RlXHJcbiAgaWYgKHN0YXRlLnBhcmVudCA9PT0gbnVsbClcclxuICAgIHJldHVybiBpbnB1dC53cmFwUmVzdWx0KHN0YXRlLmNoaWxkcmVuWzBdLl9kZWNvZGUoaW5wdXQpKTtcclxuXHJcbiAgdmFyIHJlc3VsdCA9IHN0YXRlWydkZWZhdWx0J107XHJcbiAgdmFyIHByZXNlbnQgPSB0cnVlO1xyXG5cclxuICB2YXIgcHJldktleTtcclxuICBpZiAoc3RhdGUua2V5ICE9PSBudWxsKVxyXG4gICAgcHJldktleSA9IGlucHV0LmVudGVyS2V5KHN0YXRlLmtleSk7XHJcblxyXG4gIC8vIENoZWNrIGlmIHRhZyBpcyB0aGVyZVxyXG4gIGlmIChzdGF0ZS5vcHRpb25hbCkge1xyXG4gICAgdmFyIHRhZyA9IG51bGw7XHJcbiAgICBpZiAoc3RhdGUuZXhwbGljaXQgIT09IG51bGwpXHJcbiAgICAgIHRhZyA9IHN0YXRlLmV4cGxpY2l0O1xyXG4gICAgZWxzZSBpZiAoc3RhdGUuaW1wbGljaXQgIT09IG51bGwpXHJcbiAgICAgIHRhZyA9IHN0YXRlLmltcGxpY2l0O1xyXG4gICAgZWxzZSBpZiAoc3RhdGUudGFnICE9PSBudWxsKVxyXG4gICAgICB0YWcgPSBzdGF0ZS50YWc7XHJcblxyXG4gICAgaWYgKHRhZyA9PT0gbnVsbCAmJiAhc3RhdGUuYW55KSB7XHJcbiAgICAgIC8vIFRyaWFsIGFuZCBFcnJvclxyXG4gICAgICB2YXIgc2F2ZSA9IGlucHV0LnNhdmUoKTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoc3RhdGUuY2hvaWNlID09PSBudWxsKVxyXG4gICAgICAgICAgdGhpcy5fZGVjb2RlR2VuZXJpYyhzdGF0ZS50YWcsIGlucHV0KTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICB0aGlzLl9kZWNvZGVDaG9pY2UoaW5wdXQpO1xyXG4gICAgICAgIHByZXNlbnQgPSB0cnVlO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgcHJlc2VudCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGlucHV0LnJlc3RvcmUoc2F2ZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwcmVzZW50ID0gdGhpcy5fcGVla1RhZyhpbnB1dCwgdGFnLCBzdGF0ZS5hbnkpO1xyXG5cclxuICAgICAgaWYgKGlucHV0LmlzRXJyb3IocHJlc2VudCkpXHJcbiAgICAgICAgcmV0dXJuIHByZXNlbnQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBQdXNoIG9iamVjdCBvbiBzdGFja1xyXG4gIHZhciBwcmV2T2JqO1xyXG4gIGlmIChzdGF0ZS5vYmogJiYgcHJlc2VudClcclxuICAgIHByZXZPYmogPSBpbnB1dC5lbnRlck9iamVjdCgpO1xyXG5cclxuICBpZiAocHJlc2VudCkge1xyXG4gICAgLy8gVW53cmFwIGV4cGxpY2l0IHZhbHVlc1xyXG4gICAgaWYgKHN0YXRlLmV4cGxpY2l0ICE9PSBudWxsKSB7XHJcbiAgICAgIHZhciBleHBsaWNpdCA9IHRoaXMuX2RlY29kZVRhZyhpbnB1dCwgc3RhdGUuZXhwbGljaXQpO1xyXG4gICAgICBpZiAoaW5wdXQuaXNFcnJvcihleHBsaWNpdCkpXHJcbiAgICAgICAgcmV0dXJuIGV4cGxpY2l0O1xyXG4gICAgICBpbnB1dCA9IGV4cGxpY2l0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVud3JhcCBpbXBsaWNpdCBhbmQgbm9ybWFsIHZhbHVlc1xyXG4gICAgaWYgKHN0YXRlLnVzZSA9PT0gbnVsbCAmJiBzdGF0ZS5jaG9pY2UgPT09IG51bGwpIHtcclxuICAgICAgaWYgKHN0YXRlLmFueSlcclxuICAgICAgICB2YXIgc2F2ZSA9IGlucHV0LnNhdmUoKTtcclxuICAgICAgdmFyIGJvZHkgPSB0aGlzLl9kZWNvZGVUYWcoXHJcbiAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgc3RhdGUuaW1wbGljaXQgIT09IG51bGwgPyBzdGF0ZS5pbXBsaWNpdCA6IHN0YXRlLnRhZyxcclxuICAgICAgICBzdGF0ZS5hbnlcclxuICAgICAgKTtcclxuICAgICAgaWYgKGlucHV0LmlzRXJyb3IoYm9keSkpXHJcbiAgICAgICAgcmV0dXJuIGJvZHk7XHJcblxyXG4gICAgICBpZiAoc3RhdGUuYW55KVxyXG4gICAgICAgIHJlc3VsdCA9IGlucHV0LnJhdyhzYXZlKTtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGlucHV0ID0gYm9keTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTZWxlY3QgcHJvcGVyIG1ldGhvZCBmb3IgdGFnXHJcbiAgICBpZiAoc3RhdGUuYW55KVxyXG4gICAgICByZXN1bHQgPSByZXN1bHQ7XHJcbiAgICBlbHNlIGlmIChzdGF0ZS5jaG9pY2UgPT09IG51bGwpXHJcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2RlY29kZUdlbmVyaWMoc3RhdGUudGFnLCBpbnB1dCk7XHJcbiAgICBlbHNlXHJcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2RlY29kZUNob2ljZShpbnB1dCk7XHJcblxyXG4gICAgaWYgKGlucHV0LmlzRXJyb3IocmVzdWx0KSlcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICAvLyBEZWNvZGUgY2hpbGRyZW5cclxuICAgIGlmICghc3RhdGUuYW55ICYmIHN0YXRlLmNob2ljZSA9PT0gbnVsbCAmJiBzdGF0ZS5jaGlsZHJlbiAhPT0gbnVsbCkge1xyXG4gICAgICB2YXIgZmFpbCA9IHN0YXRlLmNoaWxkcmVuLnNvbWUoZnVuY3Rpb24gZGVjb2RlQ2hpbGRyZW4oY2hpbGQpIHtcclxuICAgICAgICAvLyBOT1RFOiBXZSBhcmUgaWdub3JpbmcgZXJyb3JzIGhlcmUsIHRvIGxldCBwYXJzZXIgY29udGludWUgd2l0aCBvdGhlclxyXG4gICAgICAgIC8vIHBhcnRzIG9mIGVuY29kZWQgZGF0YVxyXG4gICAgICAgIGNoaWxkLl9kZWNvZGUoaW5wdXQpO1xyXG4gICAgICB9KTtcclxuICAgICAgaWYgKGZhaWwpXHJcbiAgICAgICAgcmV0dXJuIGVycjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFBvcCBvYmplY3RcclxuICBpZiAoc3RhdGUub2JqICYmIHByZXNlbnQpXHJcbiAgICByZXN1bHQgPSBpbnB1dC5sZWF2ZU9iamVjdChwcmV2T2JqKTtcclxuXHJcbiAgLy8gU2V0IGtleVxyXG4gIGlmIChzdGF0ZS5rZXkgIT09IG51bGwgJiYgKHJlc3VsdCAhPT0gbnVsbCB8fCBwcmVzZW50ID09PSB0cnVlKSlcclxuICAgIGlucHV0LmxlYXZlS2V5KHByZXZLZXksIHN0YXRlLmtleSwgcmVzdWx0KTtcclxuXHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbk5vZGUucHJvdG90eXBlLl9kZWNvZGVHZW5lcmljID0gZnVuY3Rpb24gZGVjb2RlR2VuZXJpYyh0YWcsIGlucHV0KSB7XHJcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xyXG5cclxuICBpZiAodGFnID09PSAnc2VxJyB8fCB0YWcgPT09ICdzZXQnKVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgaWYgKHRhZyA9PT0gJ3NlcW9mJyB8fCB0YWcgPT09ICdzZXRvZicpXHJcbiAgICByZXR1cm4gdGhpcy5fZGVjb2RlTGlzdChpbnB1dCwgdGFnLCBzdGF0ZS5hcmdzWzBdKTtcclxuICBlbHNlIGlmICh0YWcgPT09ICdvY3RzdHInIHx8IHRhZyA9PT0gJ2JpdHN0cicpXHJcbiAgICByZXR1cm4gdGhpcy5fZGVjb2RlU3RyKGlucHV0LCB0YWcpO1xyXG4gIGVsc2UgaWYgKHRhZyA9PT0gJ2lhNXN0cicgfHwgdGFnID09PSAndXRmOHN0cicpXHJcbiAgICByZXR1cm4gdGhpcy5fZGVjb2RlU3RyKGlucHV0LCB0YWcpO1xyXG4gIGVsc2UgaWYgKHRhZyA9PT0gJ29iamlkJyAmJiBzdGF0ZS5hcmdzKVxyXG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZU9iamlkKGlucHV0LCBzdGF0ZS5hcmdzWzBdLCBzdGF0ZS5hcmdzWzFdKTtcclxuICBlbHNlIGlmICh0YWcgPT09ICdvYmppZCcpXHJcbiAgICByZXR1cm4gdGhpcy5fZGVjb2RlT2JqaWQoaW5wdXQsIG51bGwsIG51bGwpO1xyXG4gIGVsc2UgaWYgKHRhZyA9PT0gJ2dlbnRpbWUnIHx8IHRhZyA9PT0gJ3V0Y3RpbWUnKVxyXG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZVRpbWUoaW5wdXQsIHRhZyk7XHJcbiAgZWxzZSBpZiAodGFnID09PSAnbnVsbF8nKVxyXG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZU51bGwoaW5wdXQpO1xyXG4gIGVsc2UgaWYgKHRhZyA9PT0gJ2Jvb2wnKVxyXG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZUJvb2woaW5wdXQpO1xyXG4gIGVsc2UgaWYgKHRhZyA9PT0gJ2ludCcgfHwgdGFnID09PSAnZW51bScpXHJcbiAgICByZXR1cm4gdGhpcy5fZGVjb2RlSW50KGlucHV0LCBzdGF0ZS5hcmdzICYmIHN0YXRlLmFyZ3NbMF0pO1xyXG4gIGVsc2UgaWYgKHN0YXRlLnVzZSAhPT0gbnVsbClcclxuICAgIHJldHVybiB0aGlzLl9nZXRVc2Uoc3RhdGUudXNlLCBpbnB1dC5fcmVwb3J0ZXJTdGF0ZS5vYmopLl9kZWNvZGUoaW5wdXQpO1xyXG4gIGVsc2VcclxuICAgIHJldHVybiBpbnB1dC5lcnJvcigndW5rbm93biB0YWc6ICcgKyB0YWcpO1xyXG5cclxuICByZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbk5vZGUucHJvdG90eXBlLl9nZXRVc2UgPSBmdW5jdGlvbiBfZ2V0VXNlKGVudGl0eSwgb2JqKSB7XHJcblxyXG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcclxuICAvLyBDcmVhdGUgYWx0ZXJlZCB1c2UgZGVjb2RlciBpZiBpbXBsaWNpdCBpcyBzZXRcclxuICBzdGF0ZS51c2VEZWNvZGVyID0gdGhpcy5fdXNlKGVudGl0eSwgb2JqKTtcclxuICAvLyBhc3NlcnQuZXF1YWwoc3RhdGUudXNlRGVjb2Rlci5fYmFzZVN0YXRlLnBhcmVudCwgbnVsbCwgJ3N0YXRlLnVzZURlY29kZXIuX2Jhc2VTdGF0ZS5wYXJlbnQgc2hvdWxkIGJlIG51bGwnKTtcclxuICBzdGF0ZS51c2VEZWNvZGVyID0gc3RhdGUudXNlRGVjb2Rlci5fYmFzZVN0YXRlLmNoaWxkcmVuWzBdO1xyXG4gIGlmIChzdGF0ZS5pbXBsaWNpdCAhPT0gc3RhdGUudXNlRGVjb2Rlci5fYmFzZVN0YXRlLmltcGxpY2l0KSB7XHJcbiAgICBzdGF0ZS51c2VEZWNvZGVyID0gc3RhdGUudXNlRGVjb2Rlci5jbG9uZSgpO1xyXG4gICAgc3RhdGUudXNlRGVjb2Rlci5fYmFzZVN0YXRlLmltcGxpY2l0ID0gc3RhdGUuaW1wbGljaXQ7XHJcbiAgfVxyXG4gIHJldHVybiBzdGF0ZS51c2VEZWNvZGVyO1xyXG59O1xyXG5cclxuTm9kZS5wcm90b3R5cGUuX2RlY29kZUNob2ljZSA9IGZ1bmN0aW9uIGRlY29kZUNob2ljZShpbnB1dCkge1xyXG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcclxuICB2YXIgcmVzdWx0ID0gbnVsbDtcclxuICB2YXIgbWF0Y2ggPSBmYWxzZTtcclxuXHJcbiAgT2JqZWN0LmtleXMoc3RhdGUuY2hvaWNlKS5zb21lKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgdmFyIHNhdmUgPSBpbnB1dC5zYXZlKCk7XHJcbiAgICB2YXIgbm9kZSA9IHN0YXRlLmNob2ljZVtrZXldO1xyXG4gICAgdHJ5IHtcclxuICAgICAgdmFyIHZhbHVlID0gbm9kZS5fZGVjb2RlKGlucHV0KTtcclxuICAgICAgaWYgKGlucHV0LmlzRXJyb3IodmFsdWUpKVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgIHJlc3VsdCA9IHsgdHlwZToga2V5LCB2YWx1ZTogdmFsdWUgfTtcclxuICAgICAgbWF0Y2ggPSB0cnVlO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBpbnB1dC5yZXN0b3JlKHNhdmUpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9LCB0aGlzKTtcclxuXHJcbiAgaWYgKCFtYXRjaClcclxuICAgIHJldHVybiBpbnB1dC5lcnJvcignQ2hvaWNlIG5vdCBtYXRjaGVkJyk7XHJcblxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG4vL1xyXG4vLyBFbmNvZGluZ1xyXG4vL1xyXG5cclxuTm9kZS5wcm90b3R5cGUuX2NyZWF0ZUVuY29kZXJCdWZmZXIgPSBmdW5jdGlvbiBjcmVhdGVFbmNvZGVyQnVmZmVyKGRhdGEpIHtcclxuICByZXR1cm4gbmV3IEVuY29kZXJCdWZmZXIoZGF0YSwgdGhpcy5yZXBvcnRlcik7XHJcbn07XHJcblxyXG5Ob2RlLnByb3RvdHlwZS5fZW5jb2RlID0gZnVuY3Rpb24gZW5jb2RlKGRhdGEsIHJlcG9ydGVyLCBwYXJlbnQpIHtcclxuICB2YXIgc3RhdGUgPSB0aGlzLl9iYXNlU3RhdGU7XHJcbiAgaWYgKHN0YXRlWydkZWZhdWx0J10gIT09IG51bGwgJiYgc3RhdGVbJ2RlZmF1bHQnXSA9PT0gZGF0YSlcclxuICAgIHJldHVybjtcclxuXHJcbiAgdmFyIHJlc3VsdCA9IHRoaXMuX2VuY29kZVZhbHVlKGRhdGEsIHJlcG9ydGVyLCBwYXJlbnQpO1xyXG4gIGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZClcclxuICAgIHJldHVybjtcclxuXHJcbiAgaWYgKHRoaXMuX3NraXBEZWZhdWx0KHJlc3VsdCwgcmVwb3J0ZXIsIHBhcmVudCkpXHJcbiAgICByZXR1cm47XHJcblxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5Ob2RlLnByb3RvdHlwZS5fZW5jb2RlVmFsdWUgPSBmdW5jdGlvbiBlbmNvZGUoZGF0YSwgcmVwb3J0ZXIsIHBhcmVudCkge1xyXG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcclxuXHJcbiAgLy8gRGVjb2RlIHJvb3Qgbm9kZVxyXG4gIGlmIChzdGF0ZS5wYXJlbnQgPT09IG51bGwpXHJcbiAgICByZXR1cm4gc3RhdGUuY2hpbGRyZW5bMF0uX2VuY29kZShkYXRhLCByZXBvcnRlciB8fCBuZXcgUmVwb3J0ZXIoKSk7XHJcblxyXG4gIHZhciByZXN1bHQgPSBudWxsO1xyXG4gIHZhciBwcmVzZW50ID0gdHJ1ZTtcclxuXHJcbiAgLy8gU2V0IHJlcG9ydGVyIHRvIHNoYXJlIGl0IHdpdGggYSBjaGlsZCBjbGFzc1xyXG4gIHRoaXMucmVwb3J0ZXIgPSByZXBvcnRlcjtcclxuXHJcbiAgLy8gQ2hlY2sgaWYgZGF0YSBpcyB0aGVyZVxyXG4gIGlmIChzdGF0ZS5vcHRpb25hbCAmJiBkYXRhID09PSB1bmRlZmluZWQpIHtcclxuICAgIGlmIChzdGF0ZVsnZGVmYXVsdCddICE9PSBudWxsKVxyXG4gICAgICBkYXRhID0gc3RhdGVbJ2RlZmF1bHQnXVxyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBGb3IgZXJyb3IgcmVwb3J0aW5nXHJcbiAgdmFyIHByZXZLZXk7XHJcblxyXG4gIC8vIEVuY29kZSBjaGlsZHJlbiBmaXJzdFxyXG4gIHZhciBjb250ZW50ID0gbnVsbDtcclxuICB2YXIgcHJpbWl0aXZlID0gZmFsc2U7XHJcbiAgaWYgKHN0YXRlLmFueSkge1xyXG4gICAgLy8gQW55dGhpbmcgdGhhdCB3YXMgZ2l2ZW4gaXMgdHJhbnNsYXRlZCB0byBidWZmZXJcclxuICAgIHJlc3VsdCA9IHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIoZGF0YSk7XHJcbiAgfSBlbHNlIGlmIChzdGF0ZS5jaG9pY2UpIHtcclxuICAgIHJlc3VsdCA9IHRoaXMuX2VuY29kZUNob2ljZShkYXRhLCByZXBvcnRlcik7XHJcbiAgfSBlbHNlIGlmIChzdGF0ZS5jaGlsZHJlbikge1xyXG4gICAgY29udGVudCA9IHN0YXRlLmNoaWxkcmVuLm1hcChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICBpZiAoY2hpbGQuX2Jhc2VTdGF0ZS50YWcgPT09ICdudWxsXycpXHJcbiAgICAgICAgcmV0dXJuIGNoaWxkLl9lbmNvZGUobnVsbCwgcmVwb3J0ZXIsIGRhdGEpO1xyXG5cclxuICAgICAgaWYgKGNoaWxkLl9iYXNlU3RhdGUua2V5ID09PSBudWxsKVxyXG4gICAgICAgIHJldHVybiByZXBvcnRlci5lcnJvcignQ2hpbGQgc2hvdWxkIGhhdmUgYSBrZXknKTtcclxuICAgICAgdmFyIHByZXZLZXkgPSByZXBvcnRlci5lbnRlcktleShjaGlsZC5fYmFzZVN0YXRlLmtleSk7XHJcblxyXG4gICAgICBpZiAodHlwZW9mIGRhdGEgIT09ICdvYmplY3QnKVxyXG4gICAgICAgIHJldHVybiByZXBvcnRlci5lcnJvcignQ2hpbGQgZXhwZWN0ZWQsIGJ1dCBpbnB1dCBpcyBub3Qgb2JqZWN0Jyk7XHJcblxyXG4gICAgICB2YXIgcmVzID0gY2hpbGQuX2VuY29kZShkYXRhW2NoaWxkLl9iYXNlU3RhdGUua2V5XSwgcmVwb3J0ZXIsIGRhdGEpO1xyXG4gICAgICByZXBvcnRlci5sZWF2ZUtleShwcmV2S2V5KTtcclxuXHJcbiAgICAgIHJldHVybiByZXM7XHJcbiAgICB9LCB0aGlzKS5maWx0ZXIoZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgcmV0dXJuIGNoaWxkO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29udGVudCA9IHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIoY29udGVudCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGlmIChzdGF0ZS50YWcgPT09ICdzZXFvZicgfHwgc3RhdGUudGFnID09PSAnc2V0b2YnKSB7XHJcbiAgICAgIC8vIFRPRE8oaW5kdXRueSk6IHRoaXMgc2hvdWxkIGJlIHRocm93biBvbiBEU0wgbGV2ZWxcclxuICAgICAgaWYgKCEoc3RhdGUuYXJncyAmJiBzdGF0ZS5hcmdzLmxlbmd0aCA9PT0gMSkpXHJcbiAgICAgICAgcmV0dXJuIHJlcG9ydGVyLmVycm9yKCdUb28gbWFueSBhcmdzIGZvciA6ICcgKyBzdGF0ZS50YWcpO1xyXG5cclxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGRhdGEpKVxyXG4gICAgICAgIHJldHVybiByZXBvcnRlci5lcnJvcignc2Vxb2Yvc2V0b2YsIGJ1dCBkYXRhIGlzIG5vdCBBcnJheScpO1xyXG5cclxuICAgICAgdmFyIGNoaWxkID0gdGhpcy5jbG9uZSgpO1xyXG4gICAgICBjaGlsZC5fYmFzZVN0YXRlLmltcGxpY2l0ID0gbnVsbDtcclxuICAgICAgY29udGVudCA9IHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIoZGF0YS5tYXAoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldFVzZShzdGF0ZS5hcmdzWzBdLCBkYXRhKS5fZW5jb2RlKGl0ZW0sIHJlcG9ydGVyKTtcclxuICAgICAgfSwgY2hpbGQpKTtcclxuICAgIH0gZWxzZSBpZiAoc3RhdGUudXNlICE9PSBudWxsKSB7XHJcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2dldFVzZShzdGF0ZS51c2UsIHBhcmVudCkuX2VuY29kZShkYXRhLCByZXBvcnRlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb250ZW50ID0gdGhpcy5fZW5jb2RlUHJpbWl0aXZlKHN0YXRlLnRhZywgZGF0YSk7XHJcbiAgICAgIHByaW1pdGl2ZSA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBFbmNvZGUgZGF0YSBpdHNlbGZcclxuICB2YXIgcmVzdWx0O1xyXG4gIGlmICghc3RhdGUuYW55ICYmIHN0YXRlLmNob2ljZSA9PT0gbnVsbCkge1xyXG4gICAgdmFyIHRhZyA9IHN0YXRlLmltcGxpY2l0ICE9PSBudWxsID8gc3RhdGUuaW1wbGljaXQgOiBzdGF0ZS50YWc7XHJcbiAgICB2YXIgY2xzID0gc3RhdGUuaW1wbGljaXQgPT09IG51bGwgPyAndW5pdmVyc2FsJyA6ICdjb250ZXh0JztcclxuXHJcbiAgICBpZiAodGFnID09PSBudWxsKSB7XHJcbiAgICAgIGlmIChzdGF0ZS51c2UgPT09IG51bGwpXHJcbiAgICAgICAgcmVwb3J0ZXIuZXJyb3IoJ1RhZyBjb3VsZCBiZSBvbW1pdGVkIG9ubHkgZm9yIC51c2UoKScpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHN0YXRlLnVzZSA9PT0gbnVsbClcclxuICAgICAgICByZXN1bHQgPSB0aGlzLl9lbmNvZGVDb21wb3NpdGUodGFnLCBwcmltaXRpdmUsIGNscywgY29udGVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBXcmFwIGluIGV4cGxpY2l0XHJcbiAgaWYgKHN0YXRlLmV4cGxpY2l0ICE9PSBudWxsKVxyXG4gICAgcmVzdWx0ID0gdGhpcy5fZW5jb2RlQ29tcG9zaXRlKHN0YXRlLmV4cGxpY2l0LCBmYWxzZSwgJ2NvbnRleHQnLCByZXN1bHQpO1xyXG5cclxuICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuTm9kZS5wcm90b3R5cGUuX2VuY29kZUNob2ljZSA9IGZ1bmN0aW9uIGVuY29kZUNob2ljZShkYXRhLCByZXBvcnRlcikge1xyXG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcclxuXHJcbiAgdmFyIG5vZGUgPSBzdGF0ZS5jaG9pY2VbZGF0YS50eXBlXTtcclxuICAvLyBpZiAoIW5vZGUpIHtcclxuICAvLyAgIGFzc2VydChcclxuICAvLyAgICAgICBmYWxzZSxcclxuICAvLyAgICAgICBkYXRhLnR5cGUgKyAnIG5vdCBmb3VuZCBpbiAnICtcclxuICAvLyAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmtleXMoc3RhdGUuY2hvaWNlKSkpO1xyXG4gIC8vIH1cclxuICByZXR1cm4gbm9kZS5fZW5jb2RlKGRhdGEudmFsdWUsIHJlcG9ydGVyKTtcclxufTtcclxuXHJcbk5vZGUucHJvdG90eXBlLl9lbmNvZGVQcmltaXRpdmUgPSBmdW5jdGlvbiBlbmNvZGVQcmltaXRpdmUodGFnLCBkYXRhKSB7XHJcbiAgdmFyIHN0YXRlID0gdGhpcy5fYmFzZVN0YXRlO1xyXG5cclxuICBpZiAodGFnID09PSAnb2N0c3RyJyB8fCB0YWcgPT09ICdiaXRzdHInIHx8IHRhZyA9PT0gJ2lhNXN0cicpXHJcbiAgICByZXR1cm4gdGhpcy5fZW5jb2RlU3RyKGRhdGEsIHRhZyk7XHJcbiAgZWxzZSBpZiAodGFnID09PSAndXRmOHN0cicpXHJcbiAgICByZXR1cm4gdGhpcy5fZW5jb2RlU3RyKGRhdGEsIHRhZyk7XHJcbiAgZWxzZSBpZiAodGFnID09PSAnb2JqaWQnICYmIHN0YXRlLmFyZ3MpXHJcbiAgICByZXR1cm4gdGhpcy5fZW5jb2RlT2JqaWQoZGF0YSwgc3RhdGUucmV2ZXJzZUFyZ3NbMF0sIHN0YXRlLmFyZ3NbMV0pO1xyXG4gIGVsc2UgaWYgKHRhZyA9PT0gJ29iamlkJylcclxuICAgIHJldHVybiB0aGlzLl9lbmNvZGVPYmppZChkYXRhLCBudWxsLCBudWxsKTtcclxuICBlbHNlIGlmICh0YWcgPT09ICdnZW50aW1lJyB8fCB0YWcgPT09ICd1dGN0aW1lJylcclxuICAgIHJldHVybiB0aGlzLl9lbmNvZGVUaW1lKGRhdGEsIHRhZyk7XHJcbiAgZWxzZSBpZiAodGFnID09PSAnbnVsbF8nKVxyXG4gICAgcmV0dXJuIHRoaXMuX2VuY29kZU51bGwoKTtcclxuICBlbHNlIGlmICh0YWcgPT09ICdpbnQnIHx8IHRhZyA9PT0gJ2VudW0nKVxyXG4gICAgcmV0dXJuIHRoaXMuX2VuY29kZUludChkYXRhLCBzdGF0ZS5hcmdzICYmIHN0YXRlLnJldmVyc2VBcmdzWzBdKTtcclxuICBlbHNlIGlmICh0YWcgPT09ICdib29sJylcclxuICAgIHJldHVybiB0aGlzLl9lbmNvZGVCb29sKGRhdGEpO1xyXG4gIGVsc2VcclxuICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgdGFnOiAnICsgdGFnKTtcclxufTtcclxuIiwidmFyIGluaGVyaXRzID0gcmVxdWlyZSgndXRpbCcpLmluaGVyaXRzO1xyXG5cclxuZnVuY3Rpb24gUmVwb3J0ZXIob3B0aW9ucykge1xyXG4gIHRoaXMuX3JlcG9ydGVyU3RhdGUgPSB7XHJcbiAgICBvYmo6IG51bGwsXHJcbiAgICBwYXRoOiBbXSxcclxuICAgIG9wdGlvbnM6IG9wdGlvbnMgfHwge30sXHJcbiAgICBlcnJvcnM6IFtdXHJcbiAgfTtcclxufVxyXG5leHBvcnRzLlJlcG9ydGVyID0gUmVwb3J0ZXI7XHJcblxyXG5SZXBvcnRlci5wcm90b3R5cGUuaXNFcnJvciA9IGZ1bmN0aW9uIGlzRXJyb3Iob2JqKSB7XHJcbiAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIFJlcG9ydGVyRXJyb3I7XHJcbn07XHJcblxyXG5SZXBvcnRlci5wcm90b3R5cGUuc2F2ZSA9IGZ1bmN0aW9uIHNhdmUoKSB7XHJcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVwb3J0ZXJTdGF0ZTtcclxuXHJcbiAgcmV0dXJuIHsgb2JqOiBzdGF0ZS5vYmosIHBhdGhMZW46IHN0YXRlLnBhdGgubGVuZ3RoIH07XHJcbn07XHJcblxyXG5SZXBvcnRlci5wcm90b3R5cGUucmVzdG9yZSA9IGZ1bmN0aW9uIHJlc3RvcmUoZGF0YSkge1xyXG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlcG9ydGVyU3RhdGU7XHJcblxyXG4gIHN0YXRlLm9iaiA9IGRhdGEub2JqO1xyXG4gIHN0YXRlLnBhdGggPSBzdGF0ZS5wYXRoLnNsaWNlKDAsIGRhdGEucGF0aExlbik7XHJcbn07XHJcblxyXG5SZXBvcnRlci5wcm90b3R5cGUuZW50ZXJLZXkgPSBmdW5jdGlvbiBlbnRlcktleShrZXkpIHtcclxuICByZXR1cm4gdGhpcy5fcmVwb3J0ZXJTdGF0ZS5wYXRoLnB1c2goa2V5KTtcclxufTtcclxuXHJcblJlcG9ydGVyLnByb3RvdHlwZS5sZWF2ZUtleSA9IGZ1bmN0aW9uIGxlYXZlS2V5KGluZGV4LCBrZXksIHZhbHVlKSB7XHJcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVwb3J0ZXJTdGF0ZTtcclxuXHJcbiAgc3RhdGUucGF0aCA9IHN0YXRlLnBhdGguc2xpY2UoMCwgaW5kZXggLSAxKTtcclxuICBpZiAoc3RhdGUub2JqICE9PSBudWxsKVxyXG4gICAgc3RhdGUub2JqW2tleV0gPSB2YWx1ZTtcclxufTtcclxuXHJcblJlcG9ydGVyLnByb3RvdHlwZS5lbnRlck9iamVjdCA9IGZ1bmN0aW9uIGVudGVyT2JqZWN0KCkge1xyXG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlcG9ydGVyU3RhdGU7XHJcblxyXG4gIHZhciBwcmV2ID0gc3RhdGUub2JqO1xyXG4gIHN0YXRlLm9iaiA9IHt9O1xyXG4gIHJldHVybiBwcmV2O1xyXG59O1xyXG5cclxuUmVwb3J0ZXIucHJvdG90eXBlLmxlYXZlT2JqZWN0ID0gZnVuY3Rpb24gbGVhdmVPYmplY3QocHJldikge1xyXG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlcG9ydGVyU3RhdGU7XHJcblxyXG4gIHZhciBub3cgPSBzdGF0ZS5vYmo7XHJcbiAgc3RhdGUub2JqID0gcHJldjtcclxuICByZXR1cm4gbm93O1xyXG59O1xyXG5cclxuUmVwb3J0ZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24gZXJyb3IobXNnKSB7XHJcbiAgdmFyIGVycjtcclxuICB2YXIgc3RhdGUgPSB0aGlzLl9yZXBvcnRlclN0YXRlO1xyXG5cclxuICB2YXIgaW5oZXJpdGVkID0gbXNnIGluc3RhbmNlb2YgUmVwb3J0ZXJFcnJvcjtcclxuICBpZiAoaW5oZXJpdGVkKSB7XHJcbiAgICBlcnIgPSBtc2c7XHJcbiAgfSBlbHNlIHtcclxuICAgIGVyciA9IG5ldyBSZXBvcnRlckVycm9yKHN0YXRlLnBhdGgubWFwKGZ1bmN0aW9uKGVsZW0pIHtcclxuICAgICAgcmV0dXJuICdbJyArIEpTT04uc3RyaW5naWZ5KGVsZW0pICsgJ10nO1xyXG4gICAgfSkuam9pbignJyksIG1zZy5tZXNzYWdlIHx8IG1zZywgbXNnLnN0YWNrKTtcclxuICB9XHJcblxyXG4gIGlmICghc3RhdGUub3B0aW9ucy5wYXJ0aWFsKVxyXG4gICAgdGhyb3cgZXJyO1xyXG5cclxuICBpZiAoIWluaGVyaXRlZClcclxuICAgIHN0YXRlLmVycm9ycy5wdXNoKGVycik7XHJcblxyXG4gIHJldHVybiBlcnI7XHJcbn07XHJcblxyXG5SZXBvcnRlci5wcm90b3R5cGUud3JhcFJlc3VsdCA9IGZ1bmN0aW9uIHdyYXBSZXN1bHQocmVzdWx0KSB7XHJcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVwb3J0ZXJTdGF0ZTtcclxuICBpZiAoIXN0YXRlLm9wdGlvbnMucGFydGlhbClcclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICByZXN1bHQ6IHRoaXMuaXNFcnJvcihyZXN1bHQpID8gbnVsbCA6IHJlc3VsdCxcclxuICAgIGVycm9yczogc3RhdGUuZXJyb3JzXHJcbiAgfTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIFJlcG9ydGVyRXJyb3IocGF0aCwgbXNnKSB7XHJcbiAgdGhpcy5wYXRoID0gcGF0aDtcclxuICB0aGlzLnJldGhyb3cobXNnKTtcclxufTtcclxuaW5oZXJpdHMoUmVwb3J0ZXJFcnJvciwgRXJyb3IpO1xyXG5cclxuUmVwb3J0ZXJFcnJvci5wcm90b3R5cGUucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3cobXNnKSB7XHJcbiAgdGhpcy5tZXNzYWdlID0gbXNnICsgJyBhdDogJyArICh0aGlzLnBhdGggfHwgJyhzaGFsbG93KScpO1xyXG4gIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIFJlcG9ydGVyRXJyb3IpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuIiwiKGZ1bmN0aW9uIChtb2R1bGUsIGV4cG9ydHMpIHtcclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbi8vIFV0aWxzXHJcblxyXG5mdW5jdGlvbiBhc3NlcnQodmFsLCBtc2cpIHtcclxuICBpZiAoIXZhbClcclxuICAgIHRocm93IG5ldyBFcnJvcihtc2cgfHwgJ0Fzc2VydGlvbiBmYWlsZWQnKTtcclxufVxyXG5cclxuLy8gQ291bGQgdXNlIGBpbmhlcml0c2AgbW9kdWxlLCBidXQgZG9uJ3Qgd2FudCB0byBtb3ZlIGZyb20gc2luZ2xlIGZpbGVcclxuLy8gYXJjaGl0ZWN0dXJlIHlldC5cclxuZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XHJcbiAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3I7XHJcbiAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge307XHJcbiAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZTtcclxuICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpO1xyXG4gIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvcjtcclxufVxyXG5cclxuLy8gQk5cclxuXHJcbmZ1bmN0aW9uIEJOKG51bWJlciwgYmFzZSwgZW5kaWFuKSB7XHJcbiAgLy8gTWF5IGJlIGBuZXcgQk4oYm4pYCA/XHJcbiAgaWYgKG51bWJlciAhPT0gbnVsbCAmJlxyXG4gICAgICB0eXBlb2YgbnVtYmVyID09PSAnb2JqZWN0JyAmJlxyXG4gICAgICBBcnJheS5pc0FycmF5KG51bWJlci53b3JkcykpIHtcclxuICAgIHJldHVybiBudW1iZXI7XHJcbiAgfVxyXG5cclxuICB0aGlzLnNpZ24gPSBmYWxzZTtcclxuICB0aGlzLndvcmRzID0gbnVsbDtcclxuICB0aGlzLmxlbmd0aCA9IDA7XHJcblxyXG4gIC8vIFJlZHVjdGlvbiBjb250ZXh0XHJcbiAgdGhpcy5yZWQgPSBudWxsO1xyXG5cclxuICBpZiAoYmFzZSA9PT0gJ2xlJyB8fCBiYXNlID09PSAnYmUnKSB7XHJcbiAgICBlbmRpYW4gPSBiYXNlO1xyXG4gICAgYmFzZSA9IDEwO1xyXG4gIH1cclxuXHJcbiAgaWYgKG51bWJlciAhPT0gbnVsbClcclxuICAgIHRoaXMuX2luaXQobnVtYmVyIHx8IDAsIGJhc2UgfHwgMTAsIGVuZGlhbiB8fCAnYmUnKTtcclxufVxyXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBCTjtcclxuZWxzZVxyXG4gIGV4cG9ydHMuQk4gPSBCTjtcclxuXHJcbkJOLkJOID0gQk47XHJcbkJOLndvcmRTaXplID0gMjY7XHJcblxyXG5CTi5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbiBpbml0KG51bWJlciwgYmFzZSwgZW5kaWFuKSB7XHJcbiAgaWYgKHR5cGVvZiBudW1iZXIgPT09ICdudW1iZXInKSB7XHJcbiAgICByZXR1cm4gdGhpcy5faW5pdE51bWJlcihudW1iZXIsIGJhc2UsIGVuZGlhbik7XHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgbnVtYmVyID09PSAnb2JqZWN0Jykge1xyXG4gICAgcmV0dXJuIHRoaXMuX2luaXRBcnJheShudW1iZXIsIGJhc2UsIGVuZGlhbik7XHJcbiAgfVxyXG4gIGlmIChiYXNlID09PSAnaGV4JylcclxuICAgIGJhc2UgPSAxNjtcclxuICBhc3NlcnQoYmFzZSA9PT0gKGJhc2UgfCAwKSAmJiBiYXNlID49IDIgJiYgYmFzZSA8PSAzNik7XHJcblxyXG4gIG51bWJlciA9IG51bWJlci50b1N0cmluZygpLnJlcGxhY2UoL1xccysvZywgJycpO1xyXG4gIHZhciBzdGFydCA9IDA7XHJcbiAgaWYgKG51bWJlclswXSA9PT0gJy0nKVxyXG4gICAgc3RhcnQrKztcclxuXHJcbiAgaWYgKGJhc2UgPT09IDE2KVxyXG4gICAgdGhpcy5fcGFyc2VIZXgobnVtYmVyLCBzdGFydCk7XHJcbiAgZWxzZVxyXG4gICAgdGhpcy5fcGFyc2VCYXNlKG51bWJlciwgYmFzZSwgc3RhcnQpO1xyXG5cclxuICBpZiAobnVtYmVyWzBdID09PSAnLScpXHJcbiAgICB0aGlzLnNpZ24gPSB0cnVlO1xyXG5cclxuICB0aGlzLnN0cmlwKCk7XHJcblxyXG4gIGlmIChlbmRpYW4gIT09ICdsZScpXHJcbiAgICByZXR1cm47XHJcblxyXG4gIHRoaXMuX2luaXRBcnJheSh0aGlzLnRvQXJyYXkoKSwgYmFzZSwgZW5kaWFuKTtcclxufTtcclxuXHJcbkJOLnByb3RvdHlwZS5faW5pdE51bWJlciA9IGZ1bmN0aW9uIF9pbml0TnVtYmVyKG51bWJlciwgYmFzZSwgZW5kaWFuKSB7XHJcbiAgaWYgKG51bWJlciA8IDApIHtcclxuICAgIHRoaXMuc2lnbiA9IHRydWU7XHJcbiAgICBudW1iZXIgPSAtbnVtYmVyO1xyXG4gIH1cclxuICBpZiAobnVtYmVyIDwgMHg0MDAwMDAwKSB7XHJcbiAgICB0aGlzLndvcmRzID0gWyBudW1iZXIgJiAweDNmZmZmZmYgXTtcclxuICAgIHRoaXMubGVuZ3RoID0gMTtcclxuICB9IGVsc2UgaWYgKG51bWJlciA8IDB4MTAwMDAwMDAwMDAwMDApIHtcclxuICAgIHRoaXMud29yZHMgPSBbXHJcbiAgICAgIG51bWJlciAmIDB4M2ZmZmZmZixcclxuICAgICAgKG51bWJlciAvIDB4NDAwMDAwMCkgJiAweDNmZmZmZmZcclxuICAgIF07XHJcbiAgICB0aGlzLmxlbmd0aCA9IDI7XHJcbiAgfSBlbHNlIHtcclxuICAgIGFzc2VydChudW1iZXIgPCAweDIwMDAwMDAwMDAwMDAwKTsgLy8gMiBeIDUzICh1bnNhZmUpXHJcbiAgICB0aGlzLndvcmRzID0gW1xyXG4gICAgICBudW1iZXIgJiAweDNmZmZmZmYsXHJcbiAgICAgIChudW1iZXIgLyAweDQwMDAwMDApICYgMHgzZmZmZmZmLFxyXG4gICAgICAxXHJcbiAgICBdO1xyXG4gICAgdGhpcy5sZW5ndGggPSAzO1xyXG4gIH1cclxuXHJcbiAgaWYgKGVuZGlhbiAhPT0gJ2xlJylcclxuICAgIHJldHVybjtcclxuXHJcbiAgLy8gUmV2ZXJzZSB0aGUgYnl0ZXNcclxuICB0aGlzLl9pbml0QXJyYXkodGhpcy50b0FycmF5KCksIGJhc2UsIGVuZGlhbik7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUuX2luaXRBcnJheSA9IGZ1bmN0aW9uIF9pbml0QXJyYXkobnVtYmVyLCBiYXNlLCBlbmRpYW4pIHtcclxuICAvLyBQZXJoYXBzIGEgVWludDhBcnJheVxyXG4gIGFzc2VydCh0eXBlb2YgbnVtYmVyLmxlbmd0aCA9PT0gJ251bWJlcicpO1xyXG4gIGlmIChudW1iZXIubGVuZ3RoIDw9IDApIHtcclxuICAgIHRoaXMud29yZHMgPSBbIDAgXTtcclxuICAgIHRoaXMubGVuZ3RoID0gMTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5sZW5ndGggPSBNYXRoLmNlaWwobnVtYmVyLmxlbmd0aCAvIDMpO1xyXG4gIHRoaXMud29yZHMgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKylcclxuICAgIHRoaXMud29yZHNbaV0gPSAwO1xyXG5cclxuICB2YXIgb2ZmID0gMDtcclxuICBpZiAoZW5kaWFuID09PSAnYmUnKSB7XHJcbiAgICBmb3IgKHZhciBpID0gbnVtYmVyLmxlbmd0aCAtIDEsIGogPSAwOyBpID49IDA7IGkgLT0gMykge1xyXG4gICAgICB2YXIgdyA9IG51bWJlcltpXSB8IChudW1iZXJbaSAtIDFdIDw8IDgpIHwgKG51bWJlcltpIC0gMl0gPDwgMTYpO1xyXG4gICAgICB0aGlzLndvcmRzW2pdIHw9ICh3IDw8IG9mZikgJiAweDNmZmZmZmY7XHJcbiAgICAgIHRoaXMud29yZHNbaiArIDFdID0gKHcgPj4+ICgyNiAtIG9mZikpICYgMHgzZmZmZmZmO1xyXG4gICAgICBvZmYgKz0gMjQ7XHJcbiAgICAgIGlmIChvZmYgPj0gMjYpIHtcclxuICAgICAgICBvZmYgLT0gMjY7XHJcbiAgICAgICAgaisrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmIChlbmRpYW4gPT09ICdsZScpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gMDsgaSA8IG51bWJlci5sZW5ndGg7IGkgKz0gMykge1xyXG4gICAgICB2YXIgdyA9IG51bWJlcltpXSB8IChudW1iZXJbaSArIDFdIDw8IDgpIHwgKG51bWJlcltpICsgMl0gPDwgMTYpO1xyXG4gICAgICB0aGlzLndvcmRzW2pdIHw9ICh3IDw8IG9mZikgJiAweDNmZmZmZmY7XHJcbiAgICAgIHRoaXMud29yZHNbaiArIDFdID0gKHcgPj4+ICgyNiAtIG9mZikpICYgMHgzZmZmZmZmO1xyXG4gICAgICBvZmYgKz0gMjQ7XHJcbiAgICAgIGlmIChvZmYgPj0gMjYpIHtcclxuICAgICAgICBvZmYgLT0gMjY7XHJcbiAgICAgICAgaisrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBwYXJzZUhleChzdHIsIHN0YXJ0LCBlbmQpIHtcclxuICB2YXIgciA9IDA7XHJcbiAgdmFyIGxlbiA9IE1hdGgubWluKHN0ci5sZW5ndGgsIGVuZCk7XHJcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgbGVuOyBpKyspIHtcclxuICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSkgLSA0ODtcclxuXHJcbiAgICByIDw8PSA0O1xyXG5cclxuICAgIC8vICdhJyAtICdmJ1xyXG4gICAgaWYgKGMgPj0gNDkgJiYgYyA8PSA1NClcclxuICAgICAgciB8PSBjIC0gNDkgKyAweGE7XHJcblxyXG4gICAgLy8gJ0EnIC0gJ0YnXHJcbiAgICBlbHNlIGlmIChjID49IDE3ICYmIGMgPD0gMjIpXHJcbiAgICAgIHIgfD0gYyAtIDE3ICsgMHhhO1xyXG5cclxuICAgIC8vICcwJyAtICc5J1xyXG4gICAgZWxzZVxyXG4gICAgICByIHw9IGMgJiAweGY7XHJcbiAgfVxyXG4gIHJldHVybiByO1xyXG59XHJcblxyXG5CTi5wcm90b3R5cGUuX3BhcnNlSGV4ID0gZnVuY3Rpb24gX3BhcnNlSGV4KG51bWJlciwgc3RhcnQpIHtcclxuICAvLyBDcmVhdGUgcG9zc2libHkgYmlnZ2VyIGFycmF5IHRvIGVuc3VyZSB0aGF0IGl0IGZpdHMgdGhlIG51bWJlclxyXG4gIHRoaXMubGVuZ3RoID0gTWF0aC5jZWlsKChudW1iZXIubGVuZ3RoIC0gc3RhcnQpIC8gNik7XHJcbiAgdGhpcy53b3JkcyA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKVxyXG4gICAgdGhpcy53b3Jkc1tpXSA9IDA7XHJcblxyXG4gIC8vIFNjYW4gMjQtYml0IGNodW5rcyBhbmQgYWRkIHRoZW0gdG8gdGhlIG51bWJlclxyXG4gIHZhciBvZmYgPSAwO1xyXG4gIGZvciAodmFyIGkgPSBudW1iZXIubGVuZ3RoIC0gNiwgaiA9IDA7IGkgPj0gc3RhcnQ7IGkgLT0gNikge1xyXG4gICAgdmFyIHcgPSBwYXJzZUhleChudW1iZXIsIGksIGkgKyA2KTtcclxuICAgIHRoaXMud29yZHNbal0gfD0gKHcgPDwgb2ZmKSAmIDB4M2ZmZmZmZjtcclxuICAgIHRoaXMud29yZHNbaiArIDFdIHw9IHcgPj4+ICgyNiAtIG9mZikgJiAweDNmZmZmZjtcclxuICAgIG9mZiArPSAyNDtcclxuICAgIGlmIChvZmYgPj0gMjYpIHtcclxuICAgICAgb2ZmIC09IDI2O1xyXG4gICAgICBqKys7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmIChpICsgNiAhPT0gc3RhcnQpIHtcclxuICAgIHZhciB3ID0gcGFyc2VIZXgobnVtYmVyLCBzdGFydCwgaSArIDYpO1xyXG4gICAgdGhpcy53b3Jkc1tqXSB8PSAodyA8PCBvZmYpICYgMHgzZmZmZmZmO1xyXG4gICAgdGhpcy53b3Jkc1tqICsgMV0gfD0gdyA+Pj4gKDI2IC0gb2ZmKSAmIDB4M2ZmZmZmO1xyXG4gIH1cclxuICB0aGlzLnN0cmlwKCk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBwYXJzZUJhc2Uoc3RyLCBzdGFydCwgZW5kLCBtdWwpIHtcclxuICB2YXIgciA9IDA7XHJcbiAgdmFyIGxlbiA9IE1hdGgubWluKHN0ci5sZW5ndGgsIGVuZCk7XHJcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgbGVuOyBpKyspIHtcclxuICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSkgLSA0ODtcclxuXHJcbiAgICByICo9IG11bDtcclxuXHJcbiAgICAvLyAnYSdcclxuICAgIGlmIChjID49IDQ5KVxyXG4gICAgICByICs9IGMgLSA0OSArIDB4YTtcclxuXHJcbiAgICAvLyAnQSdcclxuICAgIGVsc2UgaWYgKGMgPj0gMTcpXHJcbiAgICAgIHIgKz0gYyAtIDE3ICsgMHhhO1xyXG5cclxuICAgIC8vICcwJyAtICc5J1xyXG4gICAgZWxzZVxyXG4gICAgICByICs9IGM7XHJcbiAgfVxyXG4gIHJldHVybiByO1xyXG59XHJcblxyXG5CTi5wcm90b3R5cGUuX3BhcnNlQmFzZSA9IGZ1bmN0aW9uIF9wYXJzZUJhc2UobnVtYmVyLCBiYXNlLCBzdGFydCkge1xyXG4gIC8vIEluaXRpYWxpemUgYXMgemVyb1xyXG4gIHRoaXMud29yZHMgPSBbIDAgXTtcclxuICB0aGlzLmxlbmd0aCA9IDE7XHJcblxyXG4gIC8vIEZpbmQgbGVuZ3RoIG9mIGxpbWIgaW4gYmFzZVxyXG4gIGZvciAodmFyIGxpbWJMZW4gPSAwLCBsaW1iUG93ID0gMTsgbGltYlBvdyA8PSAweDNmZmZmZmY7IGxpbWJQb3cgKj0gYmFzZSlcclxuICAgIGxpbWJMZW4rKztcclxuICBsaW1iTGVuLS07XHJcbiAgbGltYlBvdyA9IChsaW1iUG93IC8gYmFzZSkgfCAwO1xyXG5cclxuICB2YXIgdG90YWwgPSBudW1iZXIubGVuZ3RoIC0gc3RhcnQ7XHJcbiAgdmFyIG1vZCA9IHRvdGFsICUgbGltYkxlbjtcclxuICB2YXIgZW5kID0gTWF0aC5taW4odG90YWwsIHRvdGFsIC0gbW9kKSArIHN0YXJ0O1xyXG5cclxuICB2YXIgd29yZCA9IDA7XHJcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IGxpbWJMZW4pIHtcclxuICAgIHdvcmQgPSBwYXJzZUJhc2UobnVtYmVyLCBpLCBpICsgbGltYkxlbiwgYmFzZSk7XHJcblxyXG4gICAgdGhpcy5pbXVsbihsaW1iUG93KTtcclxuICAgIGlmICh0aGlzLndvcmRzWzBdICsgd29yZCA8IDB4NDAwMDAwMClcclxuICAgICAgdGhpcy53b3Jkc1swXSArPSB3b3JkO1xyXG4gICAgZWxzZVxyXG4gICAgICB0aGlzLl9pYWRkbih3b3JkKTtcclxuICB9XHJcblxyXG4gIGlmIChtb2QgIT09IDApIHtcclxuICAgIHZhciBwb3cgPSAxO1xyXG4gICAgdmFyIHdvcmQgPSBwYXJzZUJhc2UobnVtYmVyLCBpLCBudW1iZXIubGVuZ3RoLCBiYXNlKTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vZDsgaSsrKVxyXG4gICAgICBwb3cgKj0gYmFzZTtcclxuICAgIHRoaXMuaW11bG4ocG93KTtcclxuICAgIGlmICh0aGlzLndvcmRzWzBdICsgd29yZCA8IDB4NDAwMDAwMClcclxuICAgICAgdGhpcy53b3Jkc1swXSArPSB3b3JkO1xyXG4gICAgZWxzZVxyXG4gICAgICB0aGlzLl9pYWRkbih3b3JkKTtcclxuICB9XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uIGNvcHkoZGVzdCkge1xyXG4gIGRlc3Qud29yZHMgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKylcclxuICAgIGRlc3Qud29yZHNbaV0gPSB0aGlzLndvcmRzW2ldO1xyXG4gIGRlc3QubGVuZ3RoID0gdGhpcy5sZW5ndGg7XHJcbiAgZGVzdC5zaWduID0gdGhpcy5zaWduO1xyXG4gIGRlc3QucmVkID0gdGhpcy5yZWQ7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiBjbG9uZSgpIHtcclxuICB2YXIgciA9IG5ldyBCTihudWxsKTtcclxuICB0aGlzLmNvcHkocik7XHJcbiAgcmV0dXJuIHI7XHJcbn07XHJcblxyXG4vLyBSZW1vdmUgbGVhZGluZyBgMGAgZnJvbSBgdGhpc2BcclxuQk4ucHJvdG90eXBlLnN0cmlwID0gZnVuY3Rpb24gc3RyaXAoKSB7XHJcbiAgd2hpbGUgKHRoaXMubGVuZ3RoID4gMSAmJiB0aGlzLndvcmRzW3RoaXMubGVuZ3RoIC0gMV0gPT09IDApXHJcbiAgICB0aGlzLmxlbmd0aC0tO1xyXG4gIHJldHVybiB0aGlzLl9ub3JtU2lnbigpO1xyXG59O1xyXG5cclxuQk4ucHJvdG90eXBlLl9ub3JtU2lnbiA9IGZ1bmN0aW9uIF9ub3JtU2lnbigpIHtcclxuICAvLyAtMCA9IDBcclxuICBpZiAodGhpcy5sZW5ndGggPT09IDEgJiYgdGhpcy53b3Jkc1swXSA9PT0gMClcclxuICAgIHRoaXMuc2lnbiA9IGZhbHNlO1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuQk4ucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0KCkge1xyXG4gIHJldHVybiAodGhpcy5yZWQgPyAnPEJOLVI6ICcgOiAnPEJOOiAnKSArIHRoaXMudG9TdHJpbmcoMTYpICsgJz4nO1xyXG59O1xyXG5cclxuLypcclxuXHJcbnZhciB6ZXJvcyA9IFtdO1xyXG52YXIgZ3JvdXBTaXplcyA9IFtdO1xyXG52YXIgZ3JvdXBCYXNlcyA9IFtdO1xyXG5cclxudmFyIHMgPSAnJztcclxudmFyIGkgPSAtMTtcclxud2hpbGUgKCsraSA8IEJOLndvcmRTaXplKSB7XHJcbiAgemVyb3NbaV0gPSBzO1xyXG4gIHMgKz0gJzAnO1xyXG59XHJcbmdyb3VwU2l6ZXNbMF0gPSAwO1xyXG5ncm91cFNpemVzWzFdID0gMDtcclxuZ3JvdXBCYXNlc1swXSA9IDA7XHJcbmdyb3VwQmFzZXNbMV0gPSAwO1xyXG52YXIgYmFzZSA9IDIgLSAxO1xyXG53aGlsZSAoKytiYXNlIDwgMzYgKyAxKSB7XHJcbiAgdmFyIGdyb3VwU2l6ZSA9IDA7XHJcbiAgdmFyIGdyb3VwQmFzZSA9IDE7XHJcbiAgd2hpbGUgKGdyb3VwQmFzZSA8ICgxIDw8IEJOLndvcmRTaXplKSAvIGJhc2UpIHtcclxuICAgIGdyb3VwQmFzZSAqPSBiYXNlO1xyXG4gICAgZ3JvdXBTaXplICs9IDE7XHJcbiAgfVxyXG4gIGdyb3VwU2l6ZXNbYmFzZV0gPSBncm91cFNpemU7XHJcbiAgZ3JvdXBCYXNlc1tiYXNlXSA9IGdyb3VwQmFzZTtcclxufVxyXG5cclxuKi9cclxuXHJcbnZhciB6ZXJvcyA9IFtcclxuICAnJyxcclxuICAnMCcsXHJcbiAgJzAwJyxcclxuICAnMDAwJyxcclxuICAnMDAwMCcsXHJcbiAgJzAwMDAwJyxcclxuICAnMDAwMDAwJyxcclxuICAnMDAwMDAwMCcsXHJcbiAgJzAwMDAwMDAwJyxcclxuICAnMDAwMDAwMDAwJyxcclxuICAnMDAwMDAwMDAwMCcsXHJcbiAgJzAwMDAwMDAwMDAwJyxcclxuICAnMDAwMDAwMDAwMDAwJyxcclxuICAnMDAwMDAwMDAwMDAwMCcsXHJcbiAgJzAwMDAwMDAwMDAwMDAwJyxcclxuICAnMDAwMDAwMDAwMDAwMDAwJyxcclxuICAnMDAwMDAwMDAwMDAwMDAwMCcsXHJcbiAgJzAwMDAwMDAwMDAwMDAwMDAwJyxcclxuICAnMDAwMDAwMDAwMDAwMDAwMDAwJyxcclxuICAnMDAwMDAwMDAwMDAwMDAwMDAwMCcsXHJcbiAgJzAwMDAwMDAwMDAwMDAwMDAwMDAwJyxcclxuICAnMDAwMDAwMDAwMDAwMDAwMDAwMDAwJyxcclxuICAnMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCcsXHJcbiAgJzAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwJyxcclxuICAnMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwJyxcclxuICAnMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCdcclxuXTtcclxuXHJcbnZhciBncm91cFNpemVzID0gW1xyXG4gIDAsIDAsXHJcbiAgMjUsIDE2LCAxMiwgMTEsIDEwLCA5LCA4LFxyXG4gIDgsIDcsIDcsIDcsIDcsIDYsIDYsXHJcbiAgNiwgNiwgNiwgNiwgNiwgNSwgNSxcclxuICA1LCA1LCA1LCA1LCA1LCA1LCA1LFxyXG4gIDUsIDUsIDUsIDUsIDUsIDUsIDVcclxuXTtcclxuXHJcbnZhciBncm91cEJhc2VzID0gW1xyXG4gIDAsIDAsXHJcbiAgMzM1NTQ0MzIsIDQzMDQ2NzIxLCAxNjc3NzIxNiwgNDg4MjgxMjUsIDYwNDY2MTc2LCA0MDM1MzYwNywgMTY3NzcyMTYsXHJcbiAgNDMwNDY3MjEsIDEwMDAwMDAwLCAxOTQ4NzE3MSwgMzU4MzE4MDgsIDYyNzQ4NTE3LCA3NTI5NTM2LCAxMTM5MDYyNSxcclxuICAxNjc3NzIxNiwgMjQxMzc1NjksIDM0MDEyMjI0LCA0NzA0NTg4MSwgNjQwMDAwMDAsIDQwODQxMDEsIDUxNTM2MzIsXHJcbiAgNjQzNjM0MywgNzk2MjYyNCwgOTc2NTYyNSwgMTE4ODEzNzYsIDE0MzQ4OTA3LCAxNzIxMDM2OCwgMjA1MTExNDksXHJcbiAgMjQzMDAwMDAsIDI4NjI5MTUxLCAzMzU1NDQzMiwgMzkxMzUzOTMsIDQ1NDM1NDI0LCA1MjUyMTg3NSwgNjA0NjYxNzZcclxuXTtcclxuXHJcbkJOLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKGJhc2UsIHBhZGRpbmcpIHtcclxuICBiYXNlID0gYmFzZSB8fCAxMDtcclxuICBpZiAoYmFzZSA9PT0gMTYgfHwgYmFzZSA9PT0gJ2hleCcpIHtcclxuICAgIHZhciBvdXQgPSAnJztcclxuICAgIHZhciBvZmYgPSAwO1xyXG4gICAgdmFyIHBhZGRpbmcgPSBwYWRkaW5nIHwgMCB8fCAxO1xyXG4gICAgdmFyIGNhcnJ5ID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgdyA9IHRoaXMud29yZHNbaV07XHJcbiAgICAgIHZhciB3b3JkID0gKCgodyA8PCBvZmYpIHwgY2FycnkpICYgMHhmZmZmZmYpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgY2FycnkgPSAodyA+Pj4gKDI0IC0gb2ZmKSkgJiAweGZmZmZmZjtcclxuICAgICAgaWYgKGNhcnJ5ICE9PSAwIHx8IGkgIT09IHRoaXMubGVuZ3RoIC0gMSlcclxuICAgICAgICBvdXQgPSB6ZXJvc1s2IC0gd29yZC5sZW5ndGhdICsgd29yZCArIG91dDtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG91dCA9IHdvcmQgKyBvdXQ7XHJcbiAgICAgIG9mZiArPSAyO1xyXG4gICAgICBpZiAob2ZmID49IDI2KSB7XHJcbiAgICAgICAgb2ZmIC09IDI2O1xyXG4gICAgICAgIGktLTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKGNhcnJ5ICE9PSAwKVxyXG4gICAgICBvdXQgPSBjYXJyeS50b1N0cmluZygxNikgKyBvdXQ7XHJcbiAgICB3aGlsZSAob3V0Lmxlbmd0aCAlIHBhZGRpbmcgIT09IDApXHJcbiAgICAgIG91dCA9ICcwJyArIG91dDtcclxuICAgIGlmICh0aGlzLnNpZ24pXHJcbiAgICAgIG91dCA9ICctJyArIG91dDtcclxuICAgIHJldHVybiBvdXQ7XHJcbiAgfSBlbHNlIGlmIChiYXNlID09PSAoYmFzZSB8IDApICYmIGJhc2UgPj0gMiAmJiBiYXNlIDw9IDM2KSB7XHJcbiAgICAvLyB2YXIgZ3JvdXBTaXplID0gTWF0aC5mbG9vcihCTi53b3JkU2l6ZSAqIE1hdGguTE4yIC8gTWF0aC5sb2coYmFzZSkpO1xyXG4gICAgdmFyIGdyb3VwU2l6ZSA9IGdyb3VwU2l6ZXNbYmFzZV07XHJcbiAgICAvLyB2YXIgZ3JvdXBCYXNlID0gTWF0aC5wb3coYmFzZSwgZ3JvdXBTaXplKTtcclxuICAgIHZhciBncm91cEJhc2UgPSBncm91cEJhc2VzW2Jhc2VdO1xyXG4gICAgdmFyIG91dCA9ICcnO1xyXG4gICAgdmFyIGMgPSB0aGlzLmNsb25lKCk7XHJcbiAgICBjLnNpZ24gPSBmYWxzZTtcclxuICAgIHdoaWxlIChjLmNtcG4oMCkgIT09IDApIHtcclxuICAgICAgdmFyIHIgPSBjLm1vZG4oZ3JvdXBCYXNlKS50b1N0cmluZyhiYXNlKTtcclxuICAgICAgYyA9IGMuaWRpdm4oZ3JvdXBCYXNlKTtcclxuXHJcbiAgICAgIGlmIChjLmNtcG4oMCkgIT09IDApXHJcbiAgICAgICAgb3V0ID0gemVyb3NbZ3JvdXBTaXplIC0gci5sZW5ndGhdICsgciArIG91dDtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG91dCA9IHIgKyBvdXQ7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5jbXBuKDApID09PSAwKVxyXG4gICAgICBvdXQgPSAnMCcgKyBvdXQ7XHJcbiAgICBpZiAodGhpcy5zaWduKVxyXG4gICAgICBvdXQgPSAnLScgKyBvdXQ7XHJcbiAgICByZXR1cm4gb3V0O1xyXG4gIH0gZWxzZSB7XHJcbiAgICBhc3NlcnQoZmFsc2UsICdCYXNlIHNob3VsZCBiZSBiZXR3ZWVuIDIgYW5kIDM2Jyk7XHJcbiAgfVxyXG59O1xyXG5cclxuQk4ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcclxuICByZXR1cm4gdGhpcy50b1N0cmluZygxNik7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uIHRvQXJyYXkoZW5kaWFuKSB7XHJcbiAgdGhpcy5zdHJpcCgpO1xyXG4gIHZhciByZXMgPSBuZXcgQXJyYXkodGhpcy5ieXRlTGVuZ3RoKCkpO1xyXG4gIHJlc1swXSA9IDA7XHJcblxyXG4gIHZhciBxID0gdGhpcy5jbG9uZSgpO1xyXG4gIGlmIChlbmRpYW4gIT09ICdsZScpIHtcclxuICAgIC8vIEFzc3VtZSBiaWctZW5kaWFuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgcS5jbXBuKDApICE9PSAwOyBpKyspIHtcclxuICAgICAgdmFyIGIgPSBxLmFuZGxuKDB4ZmYpO1xyXG4gICAgICBxLmlzaHJuKDgpO1xyXG5cclxuICAgICAgcmVzW3Jlcy5sZW5ndGggLSBpIC0gMV0gPSBiO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBBc3N1bWUgbGl0dGxlLWVuZGlhblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IHEuY21wbigwKSAhPT0gMDsgaSsrKSB7XHJcbiAgICAgIHZhciBiID0gcS5hbmRsbigweGZmKTtcclxuICAgICAgcS5pc2hybig4KTtcclxuXHJcbiAgICAgIHJlc1tpXSA9IGI7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmVzO1xyXG59O1xyXG5cclxuaWYgKE1hdGguY2x6MzIpIHtcclxuICBCTi5wcm90b3R5cGUuX2NvdW50Qml0cyA9IGZ1bmN0aW9uIF9jb3VudEJpdHModykge1xyXG4gICAgcmV0dXJuIDMyIC0gTWF0aC5jbHozMih3KTtcclxuICB9O1xyXG59IGVsc2Uge1xyXG4gIEJOLnByb3RvdHlwZS5fY291bnRCaXRzID0gZnVuY3Rpb24gX2NvdW50Qml0cyh3KSB7XHJcbiAgICB2YXIgdCA9IHc7XHJcbiAgICB2YXIgciA9IDA7XHJcbiAgICBpZiAodCA+PSAweDEwMDApIHtcclxuICAgICAgciArPSAxMztcclxuICAgICAgdCA+Pj49IDEzO1xyXG4gICAgfVxyXG4gICAgaWYgKHQgPj0gMHg0MCkge1xyXG4gICAgICByICs9IDc7XHJcbiAgICAgIHQgPj4+PSA3O1xyXG4gICAgfVxyXG4gICAgaWYgKHQgPj0gMHg4KSB7XHJcbiAgICAgIHIgKz0gNDtcclxuICAgICAgdCA+Pj49IDQ7XHJcbiAgICB9XHJcbiAgICBpZiAodCA+PSAweDAyKSB7XHJcbiAgICAgIHIgKz0gMjtcclxuICAgICAgdCA+Pj49IDI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gciArIHQ7XHJcbiAgfTtcclxufVxyXG5cclxuQk4ucHJvdG90eXBlLl96ZXJvQml0cyA9IGZ1bmN0aW9uIF96ZXJvQml0cyh3KSB7XHJcbiAgLy8gU2hvcnQtY3V0XHJcbiAgaWYgKHcgPT09IDApXHJcbiAgICByZXR1cm4gMjY7XHJcblxyXG4gIHZhciB0ID0gdztcclxuICB2YXIgciA9IDA7XHJcbiAgaWYgKCh0ICYgMHgxZmZmKSA9PT0gMCkge1xyXG4gICAgciArPSAxMztcclxuICAgIHQgPj4+PSAxMztcclxuICB9XHJcbiAgaWYgKCh0ICYgMHg3ZikgPT09IDApIHtcclxuICAgIHIgKz0gNztcclxuICAgIHQgPj4+PSA3O1xyXG4gIH1cclxuICBpZiAoKHQgJiAweGYpID09PSAwKSB7XHJcbiAgICByICs9IDQ7XHJcbiAgICB0ID4+Pj0gNDtcclxuICB9XHJcbiAgaWYgKCh0ICYgMHgzKSA9PT0gMCkge1xyXG4gICAgciArPSAyO1xyXG4gICAgdCA+Pj49IDI7XHJcbiAgfVxyXG4gIGlmICgodCAmIDB4MSkgPT09IDApXHJcbiAgICByKys7XHJcbiAgcmV0dXJuIHI7XHJcbn07XHJcblxyXG4vLyBSZXR1cm4gbnVtYmVyIG9mIHVzZWQgYml0cyBpbiBhIEJOXHJcbkJOLnByb3RvdHlwZS5iaXRMZW5ndGggPSBmdW5jdGlvbiBiaXRMZW5ndGgoKSB7XHJcbiAgdmFyIGhpID0gMDtcclxuICB2YXIgdyA9IHRoaXMud29yZHNbdGhpcy5sZW5ndGggLSAxXTtcclxuICB2YXIgaGkgPSB0aGlzLl9jb3VudEJpdHModyk7XHJcbiAgcmV0dXJuICh0aGlzLmxlbmd0aCAtIDEpICogMjYgKyBoaTtcclxufTtcclxuXHJcbi8vIE51bWJlciBvZiB0cmFpbGluZyB6ZXJvIGJpdHNcclxuQk4ucHJvdG90eXBlLnplcm9CaXRzID0gZnVuY3Rpb24gemVyb0JpdHMoKSB7XHJcbiAgaWYgKHRoaXMuY21wbigwKSA9PT0gMClcclxuICAgIHJldHVybiAwO1xyXG5cclxuICB2YXIgciA9IDA7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgYiA9IHRoaXMuX3plcm9CaXRzKHRoaXMud29yZHNbaV0pO1xyXG4gICAgciArPSBiO1xyXG4gICAgaWYgKGIgIT09IDI2KVxyXG4gICAgICBicmVhaztcclxuICB9XHJcbiAgcmV0dXJuIHI7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIGJ5dGVMZW5ndGgoKSB7XHJcbiAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLmJpdExlbmd0aCgpIC8gOCk7XHJcbn07XHJcblxyXG4vLyBSZXR1cm4gbmVnYXRpdmUgY2xvbmUgb2YgYHRoaXNgXHJcbkJOLnByb3RvdHlwZS5uZWcgPSBmdW5jdGlvbiBuZWcoKSB7XHJcbiAgaWYgKHRoaXMuY21wbigwKSA9PT0gMClcclxuICAgIHJldHVybiB0aGlzLmNsb25lKCk7XHJcblxyXG4gIHZhciByID0gdGhpcy5jbG9uZSgpO1xyXG4gIHIuc2lnbiA9ICF0aGlzLnNpZ247XHJcbiAgcmV0dXJuIHI7XHJcbn07XHJcblxyXG5cclxuLy8gT3IgYG51bWAgd2l0aCBgdGhpc2AgaW4tcGxhY2VcclxuQk4ucHJvdG90eXBlLmlvciA9IGZ1bmN0aW9uIGlvcihudW0pIHtcclxuICB0aGlzLnNpZ24gPSB0aGlzLnNpZ24gfHwgbnVtLnNpZ247XHJcblxyXG4gIHdoaWxlICh0aGlzLmxlbmd0aCA8IG51bS5sZW5ndGgpXHJcbiAgICB0aGlzLndvcmRzW3RoaXMubGVuZ3RoKytdID0gMDtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0ubGVuZ3RoOyBpKyspXHJcbiAgICB0aGlzLndvcmRzW2ldID0gdGhpcy53b3Jkc1tpXSB8IG51bS53b3Jkc1tpXTtcclxuXHJcbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcclxufTtcclxuXHJcblxyXG4vLyBPciBgbnVtYCB3aXRoIGB0aGlzYFxyXG5CTi5wcm90b3R5cGUub3IgPSBmdW5jdGlvbiBvcihudW0pIHtcclxuICBpZiAodGhpcy5sZW5ndGggPiBudW0ubGVuZ3RoKVxyXG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pb3IobnVtKTtcclxuICBlbHNlXHJcbiAgICByZXR1cm4gbnVtLmNsb25lKCkuaW9yKHRoaXMpO1xyXG59O1xyXG5cclxuXHJcbi8vIEFuZCBgbnVtYCB3aXRoIGB0aGlzYCBpbi1wbGFjZVxyXG5CTi5wcm90b3R5cGUuaWFuZCA9IGZ1bmN0aW9uIGlhbmQobnVtKSB7XHJcbiAgdGhpcy5zaWduID0gdGhpcy5zaWduICYmIG51bS5zaWduO1xyXG5cclxuICAvLyBiID0gbWluLWxlbmd0aChudW0sIHRoaXMpXHJcbiAgdmFyIGI7XHJcbiAgaWYgKHRoaXMubGVuZ3RoID4gbnVtLmxlbmd0aClcclxuICAgIGIgPSBudW07XHJcbiAgZWxzZVxyXG4gICAgYiA9IHRoaXM7XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYi5sZW5ndGg7IGkrKylcclxuICAgIHRoaXMud29yZHNbaV0gPSB0aGlzLndvcmRzW2ldICYgbnVtLndvcmRzW2ldO1xyXG5cclxuICB0aGlzLmxlbmd0aCA9IGIubGVuZ3RoO1xyXG5cclxuICByZXR1cm4gdGhpcy5zdHJpcCgpO1xyXG59O1xyXG5cclxuXHJcbi8vIEFuZCBgbnVtYCB3aXRoIGB0aGlzYFxyXG5CTi5wcm90b3R5cGUuYW5kID0gZnVuY3Rpb24gYW5kKG51bSkge1xyXG4gIGlmICh0aGlzLmxlbmd0aCA+IG51bS5sZW5ndGgpXHJcbiAgICByZXR1cm4gdGhpcy5jbG9uZSgpLmlhbmQobnVtKTtcclxuICBlbHNlXHJcbiAgICByZXR1cm4gbnVtLmNsb25lKCkuaWFuZCh0aGlzKTtcclxufTtcclxuXHJcblxyXG4vLyBYb3IgYG51bWAgd2l0aCBgdGhpc2AgaW4tcGxhY2VcclxuQk4ucHJvdG90eXBlLml4b3IgPSBmdW5jdGlvbiBpeG9yKG51bSkge1xyXG4gIHRoaXMuc2lnbiA9IHRoaXMuc2lnbiB8fCBudW0uc2lnbjtcclxuXHJcbiAgLy8gYS5sZW5ndGggPiBiLmxlbmd0aFxyXG4gIHZhciBhO1xyXG4gIHZhciBiO1xyXG4gIGlmICh0aGlzLmxlbmd0aCA+IG51bS5sZW5ndGgpIHtcclxuICAgIGEgPSB0aGlzO1xyXG4gICAgYiA9IG51bTtcclxuICB9IGVsc2Uge1xyXG4gICAgYSA9IG51bTtcclxuICAgIGIgPSB0aGlzO1xyXG4gIH1cclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBiLmxlbmd0aDsgaSsrKVxyXG4gICAgdGhpcy53b3Jkc1tpXSA9IGEud29yZHNbaV0gXiBiLndvcmRzW2ldO1xyXG5cclxuICBpZiAodGhpcyAhPT0gYSlcclxuICAgIGZvciAoOyBpIDwgYS5sZW5ndGg7IGkrKylcclxuICAgICAgdGhpcy53b3Jkc1tpXSA9IGEud29yZHNbaV07XHJcblxyXG4gIHRoaXMubGVuZ3RoID0gYS5sZW5ndGg7XHJcblxyXG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XHJcbn07XHJcblxyXG5cclxuLy8gWG9yIGBudW1gIHdpdGggYHRoaXNgXHJcbkJOLnByb3RvdHlwZS54b3IgPSBmdW5jdGlvbiB4b3IobnVtKSB7XHJcbiAgaWYgKHRoaXMubGVuZ3RoID4gbnVtLmxlbmd0aClcclxuICAgIHJldHVybiB0aGlzLmNsb25lKCkuaXhvcihudW0pO1xyXG4gIGVsc2VcclxuICAgIHJldHVybiBudW0uY2xvbmUoKS5peG9yKHRoaXMpO1xyXG59O1xyXG5cclxuXHJcbi8vIFNldCBgYml0YCBvZiBgdGhpc2BcclxuQk4ucHJvdG90eXBlLnNldG4gPSBmdW5jdGlvbiBzZXRuKGJpdCwgdmFsKSB7XHJcbiAgYXNzZXJ0KHR5cGVvZiBiaXQgPT09ICdudW1iZXInICYmIGJpdCA+PSAwKTtcclxuXHJcbiAgdmFyIG9mZiA9IChiaXQgLyAyNikgfCAwO1xyXG4gIHZhciB3Yml0ID0gYml0ICUgMjY7XHJcblxyXG4gIHdoaWxlICh0aGlzLmxlbmd0aCA8PSBvZmYpXHJcbiAgICB0aGlzLndvcmRzW3RoaXMubGVuZ3RoKytdID0gMDtcclxuXHJcbiAgaWYgKHZhbClcclxuICAgIHRoaXMud29yZHNbb2ZmXSA9IHRoaXMud29yZHNbb2ZmXSB8ICgxIDw8IHdiaXQpO1xyXG4gIGVsc2VcclxuICAgIHRoaXMud29yZHNbb2ZmXSA9IHRoaXMud29yZHNbb2ZmXSAmIH4oMSA8PCB3Yml0KTtcclxuXHJcbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcclxufTtcclxuXHJcblxyXG4vLyBBZGQgYG51bWAgdG8gYHRoaXNgIGluLXBsYWNlXHJcbkJOLnByb3RvdHlwZS5pYWRkID0gZnVuY3Rpb24gaWFkZChudW0pIHtcclxuICAvLyBuZWdhdGl2ZSArIHBvc2l0aXZlXHJcbiAgaWYgKHRoaXMuc2lnbiAmJiAhbnVtLnNpZ24pIHtcclxuICAgIHRoaXMuc2lnbiA9IGZhbHNlO1xyXG4gICAgdmFyIHIgPSB0aGlzLmlzdWIobnVtKTtcclxuICAgIHRoaXMuc2lnbiA9ICF0aGlzLnNpZ247XHJcbiAgICByZXR1cm4gdGhpcy5fbm9ybVNpZ24oKTtcclxuXHJcbiAgLy8gcG9zaXRpdmUgKyBuZWdhdGl2ZVxyXG4gIH0gZWxzZSBpZiAoIXRoaXMuc2lnbiAmJiBudW0uc2lnbikge1xyXG4gICAgbnVtLnNpZ24gPSBmYWxzZTtcclxuICAgIHZhciByID0gdGhpcy5pc3ViKG51bSk7XHJcbiAgICBudW0uc2lnbiA9IHRydWU7XHJcbiAgICByZXR1cm4gci5fbm9ybVNpZ24oKTtcclxuICB9XHJcblxyXG4gIC8vIGEubGVuZ3RoID4gYi5sZW5ndGhcclxuICB2YXIgYTtcclxuICB2YXIgYjtcclxuICBpZiAodGhpcy5sZW5ndGggPiBudW0ubGVuZ3RoKSB7XHJcbiAgICBhID0gdGhpcztcclxuICAgIGIgPSBudW07XHJcbiAgfSBlbHNlIHtcclxuICAgIGEgPSBudW07XHJcbiAgICBiID0gdGhpcztcclxuICB9XHJcblxyXG4gIHZhciBjYXJyeSA9IDA7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBiLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgciA9IGEud29yZHNbaV0gKyBiLndvcmRzW2ldICsgY2Fycnk7XHJcbiAgICB0aGlzLndvcmRzW2ldID0gciAmIDB4M2ZmZmZmZjtcclxuICAgIGNhcnJ5ID0gciA+Pj4gMjY7XHJcbiAgfVxyXG4gIGZvciAoOyBjYXJyeSAhPT0gMCAmJiBpIDwgYS5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIHIgPSBhLndvcmRzW2ldICsgY2Fycnk7XHJcbiAgICB0aGlzLndvcmRzW2ldID0gciAmIDB4M2ZmZmZmZjtcclxuICAgIGNhcnJ5ID0gciA+Pj4gMjY7XHJcbiAgfVxyXG5cclxuICB0aGlzLmxlbmd0aCA9IGEubGVuZ3RoO1xyXG4gIGlmIChjYXJyeSAhPT0gMCkge1xyXG4gICAgdGhpcy53b3Jkc1t0aGlzLmxlbmd0aF0gPSBjYXJyeTtcclxuICAgIHRoaXMubGVuZ3RoKys7XHJcbiAgLy8gQ29weSB0aGUgcmVzdCBvZiB0aGUgd29yZHNcclxuICB9IGVsc2UgaWYgKGEgIT09IHRoaXMpIHtcclxuICAgIGZvciAoOyBpIDwgYS5sZW5ndGg7IGkrKylcclxuICAgICAgdGhpcy53b3Jkc1tpXSA9IGEud29yZHNbaV07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8vIEFkZCBgbnVtYCB0byBgdGhpc2BcclxuQk4ucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZChudW0pIHtcclxuICBpZiAobnVtLnNpZ24gJiYgIXRoaXMuc2lnbikge1xyXG4gICAgbnVtLnNpZ24gPSBmYWxzZTtcclxuICAgIHZhciByZXMgPSB0aGlzLnN1YihudW0pO1xyXG4gICAgbnVtLnNpZ24gPSB0cnVlO1xyXG4gICAgcmV0dXJuIHJlcztcclxuICB9IGVsc2UgaWYgKCFudW0uc2lnbiAmJiB0aGlzLnNpZ24pIHtcclxuICAgIHRoaXMuc2lnbiA9IGZhbHNlO1xyXG4gICAgdmFyIHJlcyA9IG51bS5zdWIodGhpcyk7XHJcbiAgICB0aGlzLnNpZ24gPSB0cnVlO1xyXG4gICAgcmV0dXJuIHJlcztcclxuICB9XHJcblxyXG4gIGlmICh0aGlzLmxlbmd0aCA+IG51bS5sZW5ndGgpXHJcbiAgICByZXR1cm4gdGhpcy5jbG9uZSgpLmlhZGQobnVtKTtcclxuICBlbHNlXHJcbiAgICByZXR1cm4gbnVtLmNsb25lKCkuaWFkZCh0aGlzKTtcclxufTtcclxuXHJcbi8vIFN1YnRyYWN0IGBudW1gIGZyb20gYHRoaXNgIGluLXBsYWNlXHJcbkJOLnByb3RvdHlwZS5pc3ViID0gZnVuY3Rpb24gaXN1YihudW0pIHtcclxuICAvLyB0aGlzIC0gKC1udW0pID0gdGhpcyArIG51bVxyXG4gIGlmIChudW0uc2lnbikge1xyXG4gICAgbnVtLnNpZ24gPSBmYWxzZTtcclxuICAgIHZhciByID0gdGhpcy5pYWRkKG51bSk7XHJcbiAgICBudW0uc2lnbiA9IHRydWU7XHJcbiAgICByZXR1cm4gci5fbm9ybVNpZ24oKTtcclxuXHJcbiAgLy8gLXRoaXMgLSBudW0gPSAtKHRoaXMgKyBudW0pXHJcbiAgfSBlbHNlIGlmICh0aGlzLnNpZ24pIHtcclxuICAgIHRoaXMuc2lnbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5pYWRkKG51bSk7XHJcbiAgICB0aGlzLnNpZ24gPSB0cnVlO1xyXG4gICAgcmV0dXJuIHRoaXMuX25vcm1TaWduKCk7XHJcbiAgfVxyXG5cclxuICAvLyBBdCB0aGlzIHBvaW50IGJvdGggbnVtYmVycyBhcmUgcG9zaXRpdmVcclxuICB2YXIgY21wID0gdGhpcy5jbXAobnVtKTtcclxuXHJcbiAgLy8gT3B0aW1pemF0aW9uIC0gemVyb2lmeVxyXG4gIGlmIChjbXAgPT09IDApIHtcclxuICAgIHRoaXMuc2lnbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5sZW5ndGggPSAxO1xyXG4gICAgdGhpcy53b3Jkc1swXSA9IDA7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8vIGEgPiBiXHJcbiAgdmFyIGE7XHJcbiAgdmFyIGI7XHJcbiAgaWYgKGNtcCA+IDApIHtcclxuICAgIGEgPSB0aGlzO1xyXG4gICAgYiA9IG51bTtcclxuICB9IGVsc2Uge1xyXG4gICAgYSA9IG51bTtcclxuICAgIGIgPSB0aGlzO1xyXG4gIH1cclxuXHJcbiAgdmFyIGNhcnJ5ID0gMDtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciByID0gYS53b3Jkc1tpXSAtIGIud29yZHNbaV0gKyBjYXJyeTtcclxuICAgIGNhcnJ5ID0gciA+PiAyNjtcclxuICAgIHRoaXMud29yZHNbaV0gPSByICYgMHgzZmZmZmZmO1xyXG4gIH1cclxuICBmb3IgKDsgY2FycnkgIT09IDAgJiYgaSA8IGEubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciByID0gYS53b3Jkc1tpXSArIGNhcnJ5O1xyXG4gICAgY2FycnkgPSByID4+IDI2O1xyXG4gICAgdGhpcy53b3Jkc1tpXSA9IHIgJiAweDNmZmZmZmY7XHJcbiAgfVxyXG5cclxuICAvLyBDb3B5IHJlc3Qgb2YgdGhlIHdvcmRzXHJcbiAgaWYgKGNhcnJ5ID09PSAwICYmIGkgPCBhLmxlbmd0aCAmJiBhICE9PSB0aGlzKVxyXG4gICAgZm9yICg7IGkgPCBhLmxlbmd0aDsgaSsrKVxyXG4gICAgICB0aGlzLndvcmRzW2ldID0gYS53b3Jkc1tpXTtcclxuICB0aGlzLmxlbmd0aCA9IE1hdGgubWF4KHRoaXMubGVuZ3RoLCBpKTtcclxuXHJcbiAgaWYgKGEgIT09IHRoaXMpXHJcbiAgICB0aGlzLnNpZ24gPSB0cnVlO1xyXG5cclxuICByZXR1cm4gdGhpcy5zdHJpcCgpO1xyXG59O1xyXG5cclxuLy8gU3VidHJhY3QgYG51bWAgZnJvbSBgdGhpc2BcclxuQk4ucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uIHN1YihudW0pIHtcclxuICByZXR1cm4gdGhpcy5jbG9uZSgpLmlzdWIobnVtKTtcclxufTtcclxuXHJcbi8qXHJcbi8vIE5PVEU6IFRoaXMgY291bGQgYmUgcG90ZW50aW9uYWxseSB1c2VkIHRvIGdlbmVyYXRlIGxvb3AtbGVzcyBtdWx0aXBsaWNhdGlvbnNcclxuZnVuY3Rpb24gX2dlbkNvbWJNdWxUbyhhbGVuLCBibGVuKSB7XHJcbiAgdmFyIGxlbiA9IGFsZW4gKyBibGVuIC0gMTtcclxuICB2YXIgc3JjID0gW1xyXG4gICAgJ3ZhciBhID0gdGhpcy53b3JkcywgYiA9IG51bS53b3JkcywgbyA9IG91dC53b3JkcywgYyA9IDAsIHcsICcgK1xyXG4gICAgICAgICdtYXNrID0gMHgzZmZmZmZmLCBzaGlmdCA9IDB4NDAwMDAwMDsnLFxyXG4gICAgJ291dC5sZW5ndGggPSAnICsgbGVuICsgJzsnXHJcbiAgXTtcclxuICBmb3IgKHZhciBrID0gMDsgayA8IGxlbjsgaysrKSB7XHJcbiAgICB2YXIgbWluSiA9IE1hdGgubWF4KDAsIGsgLSBhbGVuICsgMSk7XHJcbiAgICB2YXIgbWF4SiA9IE1hdGgubWluKGssIGJsZW4gLSAxKTtcclxuXHJcbiAgICBmb3IgKHZhciBqID0gbWluSjsgaiA8PSBtYXhKOyBqKyspIHtcclxuICAgICAgdmFyIGkgPSBrIC0gajtcclxuICAgICAgdmFyIG11bCA9ICdhWycgKyBpICsgJ10gKiBiWycgKyBqICsgJ10nO1xyXG5cclxuICAgICAgaWYgKGogPT09IG1pbkopIHtcclxuICAgICAgICBzcmMucHVzaCgndyA9ICcgKyBtdWwgKyAnICsgYzsnKTtcclxuICAgICAgICBzcmMucHVzaCgnYyA9ICh3IC8gc2hpZnQpIHwgMDsnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzcmMucHVzaCgndyArPSAnICsgbXVsICsgJzsnKTtcclxuICAgICAgICBzcmMucHVzaCgnYyArPSAodyAvIHNoaWZ0KSB8IDA7Jyk7XHJcbiAgICAgIH1cclxuICAgICAgc3JjLnB1c2goJ3cgJj0gbWFzazsnKTtcclxuICAgIH1cclxuICAgIHNyYy5wdXNoKCdvWycgKyBrICsgJ10gPSB3OycpO1xyXG4gIH1cclxuICBzcmMucHVzaCgnaWYgKGMgIT09IDApIHsnLFxyXG4gICAgICAgICAgICcgIG9bJyArIGsgKyAnXSA9IGM7JyxcclxuICAgICAgICAgICAnICBvdXQubGVuZ3RoKys7JyxcclxuICAgICAgICAgICAnfScsXHJcbiAgICAgICAgICAgJ3JldHVybiBvdXQ7Jyk7XHJcblxyXG4gIHJldHVybiBzcmMuam9pbignXFxuJyk7XHJcbn1cclxuKi9cclxuXHJcbkJOLnByb3RvdHlwZS5fc21hbGxNdWxUbyA9IGZ1bmN0aW9uIF9zbWFsbE11bFRvKG51bSwgb3V0KSB7XHJcbiAgb3V0LnNpZ24gPSBudW0uc2lnbiAhPT0gdGhpcy5zaWduO1xyXG4gIG91dC5sZW5ndGggPSB0aGlzLmxlbmd0aCArIG51bS5sZW5ndGg7XHJcblxyXG4gIHZhciBjYXJyeSA9IDA7XHJcbiAgZm9yICh2YXIgayA9IDA7IGsgPCBvdXQubGVuZ3RoIC0gMTsgaysrKSB7XHJcbiAgICAvLyBTdW0gYWxsIHdvcmRzIHdpdGggdGhlIHNhbWUgYGkgKyBqID0ga2AgYW5kIGFjY3VtdWxhdGUgYG5jYXJyeWAsXHJcbiAgICAvLyBub3RlIHRoYXQgbmNhcnJ5IGNvdWxkIGJlID49IDB4M2ZmZmZmZlxyXG4gICAgdmFyIG5jYXJyeSA9IGNhcnJ5ID4+PiAyNjtcclxuICAgIHZhciByd29yZCA9IGNhcnJ5ICYgMHgzZmZmZmZmO1xyXG4gICAgdmFyIG1heEogPSBNYXRoLm1pbihrLCBudW0ubGVuZ3RoIC0gMSk7XHJcbiAgICBmb3IgKHZhciBqID0gTWF0aC5tYXgoMCwgayAtIHRoaXMubGVuZ3RoICsgMSk7IGogPD0gbWF4SjsgaisrKSB7XHJcbiAgICAgIHZhciBpID0gayAtIGo7XHJcbiAgICAgIHZhciBhID0gdGhpcy53b3Jkc1tpXSB8IDA7XHJcbiAgICAgIHZhciBiID0gbnVtLndvcmRzW2pdIHwgMDtcclxuICAgICAgdmFyIHIgPSBhICogYjtcclxuXHJcbiAgICAgIHZhciBsbyA9IHIgJiAweDNmZmZmZmY7XHJcbiAgICAgIG5jYXJyeSA9IChuY2FycnkgKyAoKHIgLyAweDQwMDAwMDApIHwgMCkpIHwgMDtcclxuICAgICAgbG8gPSAobG8gKyByd29yZCkgfCAwO1xyXG4gICAgICByd29yZCA9IGxvICYgMHgzZmZmZmZmO1xyXG4gICAgICBuY2FycnkgPSAobmNhcnJ5ICsgKGxvID4+PiAyNikpIHwgMDtcclxuICAgIH1cclxuICAgIG91dC53b3Jkc1trXSA9IHJ3b3JkO1xyXG4gICAgY2FycnkgPSBuY2Fycnk7XHJcbiAgfVxyXG4gIGlmIChjYXJyeSAhPT0gMCkge1xyXG4gICAgb3V0LndvcmRzW2tdID0gY2Fycnk7XHJcbiAgfSBlbHNlIHtcclxuICAgIG91dC5sZW5ndGgtLTtcclxuICB9XHJcblxyXG4gIHJldHVybiBvdXQuc3RyaXAoKTtcclxufTtcclxuXHJcbkJOLnByb3RvdHlwZS5fYmlnTXVsVG8gPSBmdW5jdGlvbiBfYmlnTXVsVG8obnVtLCBvdXQpIHtcclxuICBvdXQuc2lnbiA9IG51bS5zaWduICE9PSB0aGlzLnNpZ247XHJcbiAgb3V0Lmxlbmd0aCA9IHRoaXMubGVuZ3RoICsgbnVtLmxlbmd0aDtcclxuXHJcbiAgdmFyIGNhcnJ5ID0gMDtcclxuICB2YXIgaG5jYXJyeSA9IDA7XHJcbiAgZm9yICh2YXIgayA9IDA7IGsgPCBvdXQubGVuZ3RoIC0gMTsgaysrKSB7XHJcbiAgICAvLyBTdW0gYWxsIHdvcmRzIHdpdGggdGhlIHNhbWUgYGkgKyBqID0ga2AgYW5kIGFjY3VtdWxhdGUgYG5jYXJyeWAsXHJcbiAgICAvLyBub3RlIHRoYXQgbmNhcnJ5IGNvdWxkIGJlID49IDB4M2ZmZmZmZlxyXG4gICAgdmFyIG5jYXJyeSA9IGhuY2Fycnk7XHJcbiAgICBobmNhcnJ5ID0gMDtcclxuICAgIHZhciByd29yZCA9IGNhcnJ5ICYgMHgzZmZmZmZmO1xyXG4gICAgdmFyIG1heEogPSBNYXRoLm1pbihrLCBudW0ubGVuZ3RoIC0gMSk7XHJcbiAgICBmb3IgKHZhciBqID0gTWF0aC5tYXgoMCwgayAtIHRoaXMubGVuZ3RoICsgMSk7IGogPD0gbWF4SjsgaisrKSB7XHJcbiAgICAgIHZhciBpID0gayAtIGo7XHJcbiAgICAgIHZhciBhID0gdGhpcy53b3Jkc1tpXSB8IDA7XHJcbiAgICAgIHZhciBiID0gbnVtLndvcmRzW2pdIHwgMDtcclxuICAgICAgdmFyIHIgPSBhICogYjtcclxuXHJcbiAgICAgIHZhciBsbyA9IHIgJiAweDNmZmZmZmY7XHJcbiAgICAgIG5jYXJyeSA9IChuY2FycnkgKyAoKHIgLyAweDQwMDAwMDApIHwgMCkpIHwgMDtcclxuICAgICAgbG8gPSAobG8gKyByd29yZCkgfCAwO1xyXG4gICAgICByd29yZCA9IGxvICYgMHgzZmZmZmZmO1xyXG4gICAgICBuY2FycnkgPSAobmNhcnJ5ICsgKGxvID4+PiAyNikpIHwgMDtcclxuXHJcbiAgICAgIGhuY2FycnkgKz0gbmNhcnJ5ID4+PiAyNjtcclxuICAgICAgbmNhcnJ5ICY9IDB4M2ZmZmZmZjtcclxuICAgIH1cclxuICAgIG91dC53b3Jkc1trXSA9IHJ3b3JkO1xyXG4gICAgY2FycnkgPSBuY2Fycnk7XHJcbiAgICBuY2FycnkgPSBobmNhcnJ5O1xyXG4gIH1cclxuICBpZiAoY2FycnkgIT09IDApIHtcclxuICAgIG91dC53b3Jkc1trXSA9IGNhcnJ5O1xyXG4gIH0gZWxzZSB7XHJcbiAgICBvdXQubGVuZ3RoLS07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gb3V0LnN0cmlwKCk7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUubXVsVG8gPSBmdW5jdGlvbiBtdWxUbyhudW0sIG91dCkge1xyXG4gIHZhciByZXM7XHJcbiAgaWYgKHRoaXMubGVuZ3RoICsgbnVtLmxlbmd0aCA8IDYzKVxyXG4gICAgcmVzID0gdGhpcy5fc21hbGxNdWxUbyhudW0sIG91dCk7XHJcbiAgZWxzZVxyXG4gICAgcmVzID0gdGhpcy5fYmlnTXVsVG8obnVtLCBvdXQpO1xyXG4gIHJldHVybiByZXM7XHJcbn07XHJcblxyXG4vLyBNdWx0aXBseSBgdGhpc2AgYnkgYG51bWBcclxuQk4ucHJvdG90eXBlLm11bCA9IGZ1bmN0aW9uIG11bChudW0pIHtcclxuICB2YXIgb3V0ID0gbmV3IEJOKG51bGwpO1xyXG4gIG91dC53b3JkcyA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCArIG51bS5sZW5ndGgpO1xyXG4gIHJldHVybiB0aGlzLm11bFRvKG51bSwgb3V0KTtcclxufTtcclxuXHJcbi8vIEluLXBsYWNlIE11bHRpcGxpY2F0aW9uXHJcbkJOLnByb3RvdHlwZS5pbXVsID0gZnVuY3Rpb24gaW11bChudW0pIHtcclxuICBpZiAodGhpcy5jbXBuKDApID09PSAwIHx8IG51bS5jbXBuKDApID09PSAwKSB7XHJcbiAgICB0aGlzLndvcmRzWzBdID0gMDtcclxuICAgIHRoaXMubGVuZ3RoID0gMTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgdmFyIHRsZW4gPSB0aGlzLmxlbmd0aDtcclxuICB2YXIgbmxlbiA9IG51bS5sZW5ndGg7XHJcblxyXG4gIHRoaXMuc2lnbiA9IG51bS5zaWduICE9PSB0aGlzLnNpZ247XHJcbiAgdGhpcy5sZW5ndGggPSB0aGlzLmxlbmd0aCArIG51bS5sZW5ndGg7XHJcbiAgdGhpcy53b3Jkc1t0aGlzLmxlbmd0aCAtIDFdID0gMDtcclxuXHJcbiAgZm9yICh2YXIgayA9IHRoaXMubGVuZ3RoIC0gMjsgayA+PSAwOyBrLS0pIHtcclxuICAgIC8vIFN1bSBhbGwgd29yZHMgd2l0aCB0aGUgc2FtZSBgaSArIGogPSBrYCBhbmQgYWNjdW11bGF0ZSBgY2FycnlgLFxyXG4gICAgLy8gbm90ZSB0aGF0IGNhcnJ5IGNvdWxkIGJlID49IDB4M2ZmZmZmZlxyXG4gICAgdmFyIGNhcnJ5ID0gMDtcclxuICAgIHZhciByd29yZCA9IDA7XHJcbiAgICB2YXIgbWF4SiA9IE1hdGgubWluKGssIG5sZW4gLSAxKTtcclxuICAgIGZvciAodmFyIGogPSBNYXRoLm1heCgwLCBrIC0gdGxlbiArIDEpOyBqIDw9IG1heEo7IGorKykge1xyXG4gICAgICB2YXIgaSA9IGsgLSBqO1xyXG4gICAgICB2YXIgYSA9IHRoaXMud29yZHNbaV07XHJcbiAgICAgIHZhciBiID0gbnVtLndvcmRzW2pdO1xyXG4gICAgICB2YXIgciA9IGEgKiBiO1xyXG5cclxuICAgICAgdmFyIGxvID0gciAmIDB4M2ZmZmZmZjtcclxuICAgICAgY2FycnkgKz0gKHIgLyAweDQwMDAwMDApIHwgMDtcclxuICAgICAgbG8gKz0gcndvcmQ7XHJcbiAgICAgIHJ3b3JkID0gbG8gJiAweDNmZmZmZmY7XHJcbiAgICAgIGNhcnJ5ICs9IGxvID4+PiAyNjtcclxuICAgIH1cclxuICAgIHRoaXMud29yZHNba10gPSByd29yZDtcclxuICAgIHRoaXMud29yZHNbayArIDFdICs9IGNhcnJ5O1xyXG4gICAgY2FycnkgPSAwO1xyXG4gIH1cclxuXHJcbiAgLy8gUHJvcGFnYXRlIG92ZXJmbG93c1xyXG4gIHZhciBjYXJyeSA9IDA7XHJcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgdyA9IHRoaXMud29yZHNbaV0gKyBjYXJyeTtcclxuICAgIHRoaXMud29yZHNbaV0gPSB3ICYgMHgzZmZmZmZmO1xyXG4gICAgY2FycnkgPSB3ID4+PiAyNjtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUuaW11bG4gPSBmdW5jdGlvbiBpbXVsbihudW0pIHtcclxuICBhc3NlcnQodHlwZW9mIG51bSA9PT0gJ251bWJlcicpO1xyXG5cclxuICAvLyBDYXJyeVxyXG4gIHZhciBjYXJyeSA9IDA7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgdyA9IHRoaXMud29yZHNbaV0gKiBudW07XHJcbiAgICB2YXIgbG8gPSAodyAmIDB4M2ZmZmZmZikgKyAoY2FycnkgJiAweDNmZmZmZmYpO1xyXG4gICAgY2FycnkgPj49IDI2O1xyXG4gICAgY2FycnkgKz0gKHcgLyAweDQwMDAwMDApIHwgMDtcclxuICAgIC8vIE5PVEU6IGxvIGlzIDI3Yml0IG1heGltdW1cclxuICAgIGNhcnJ5ICs9IGxvID4+PiAyNjtcclxuICAgIHRoaXMud29yZHNbaV0gPSBsbyAmIDB4M2ZmZmZmZjtcclxuICB9XHJcblxyXG4gIGlmIChjYXJyeSAhPT0gMCkge1xyXG4gICAgdGhpcy53b3Jkc1tpXSA9IGNhcnJ5O1xyXG4gICAgdGhpcy5sZW5ndGgrKztcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuQk4ucHJvdG90eXBlLm11bG4gPSBmdW5jdGlvbiBtdWxuKG51bSkge1xyXG4gIHJldHVybiB0aGlzLmNsb25lKCkuaW11bG4obnVtKTtcclxufTtcclxuXHJcbi8vIGB0aGlzYCAqIGB0aGlzYFxyXG5CTi5wcm90b3R5cGUuc3FyID0gZnVuY3Rpb24gc3FyKCkge1xyXG4gIHJldHVybiB0aGlzLm11bCh0aGlzKTtcclxufTtcclxuXHJcbi8vIGB0aGlzYCAqIGB0aGlzYCBpbi1wbGFjZVxyXG5CTi5wcm90b3R5cGUuaXNxciA9IGZ1bmN0aW9uIGlzcXIoKSB7XHJcbiAgcmV0dXJuIHRoaXMubXVsKHRoaXMpO1xyXG59O1xyXG5cclxuLy8gU2hpZnQtbGVmdCBpbi1wbGFjZVxyXG5CTi5wcm90b3R5cGUuaXNobG4gPSBmdW5jdGlvbiBpc2hsbihiaXRzKSB7XHJcbiAgYXNzZXJ0KHR5cGVvZiBiaXRzID09PSAnbnVtYmVyJyAmJiBiaXRzID49IDApO1xyXG4gIHZhciByID0gYml0cyAlIDI2O1xyXG4gIHZhciBzID0gKGJpdHMgLSByKSAvIDI2O1xyXG4gIHZhciBjYXJyeU1hc2sgPSAoMHgzZmZmZmZmID4+PiAoMjYgLSByKSkgPDwgKDI2IC0gcik7XHJcblxyXG4gIGlmIChyICE9PSAwKSB7XHJcbiAgICB2YXIgY2FycnkgPSAwO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBuZXdDYXJyeSA9IHRoaXMud29yZHNbaV0gJiBjYXJyeU1hc2s7XHJcbiAgICAgIHZhciBjID0gKHRoaXMud29yZHNbaV0gLSBuZXdDYXJyeSkgPDwgcjtcclxuICAgICAgdGhpcy53b3Jkc1tpXSA9IGMgfCBjYXJyeTtcclxuICAgICAgY2FycnkgPSBuZXdDYXJyeSA+Pj4gKDI2IC0gcik7XHJcbiAgICB9XHJcbiAgICBpZiAoY2FycnkpIHtcclxuICAgICAgdGhpcy53b3Jkc1tpXSA9IGNhcnJ5O1xyXG4gICAgICB0aGlzLmxlbmd0aCsrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKHMgIT09IDApIHtcclxuICAgIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICB0aGlzLndvcmRzW2kgKyBzXSA9IHRoaXMud29yZHNbaV07XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHM7IGkrKylcclxuICAgICAgdGhpcy53b3Jkc1tpXSA9IDA7XHJcbiAgICB0aGlzLmxlbmd0aCArPSBzO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcclxufTtcclxuXHJcbi8vIFNoaWZ0LXJpZ2h0IGluLXBsYWNlXHJcbi8vIE5PVEU6IGBoaW50YCBpcyBhIGxvd2VzdCBiaXQgYmVmb3JlIHRyYWlsaW5nIHplcm9lc1xyXG4vLyBOT1RFOiBpZiBgZXh0ZW5kZWRgIGlzIHByZXNlbnQgLSBpdCB3aWxsIGJlIGZpbGxlZCB3aXRoIGRlc3Ryb3llZCBiaXRzXHJcbkJOLnByb3RvdHlwZS5pc2hybiA9IGZ1bmN0aW9uIGlzaHJuKGJpdHMsIGhpbnQsIGV4dGVuZGVkKSB7XHJcbiAgYXNzZXJ0KHR5cGVvZiBiaXRzID09PSAnbnVtYmVyJyAmJiBiaXRzID49IDApO1xyXG4gIHZhciBoO1xyXG4gIGlmIChoaW50KVxyXG4gICAgaCA9IChoaW50IC0gKGhpbnQgJSAyNikpIC8gMjY7XHJcbiAgZWxzZVxyXG4gICAgaCA9IDA7XHJcblxyXG4gIHZhciByID0gYml0cyAlIDI2O1xyXG4gIHZhciBzID0gTWF0aC5taW4oKGJpdHMgLSByKSAvIDI2LCB0aGlzLmxlbmd0aCk7XHJcbiAgdmFyIG1hc2sgPSAweDNmZmZmZmYgXiAoKDB4M2ZmZmZmZiA+Pj4gcikgPDwgcik7XHJcbiAgdmFyIG1hc2tlZFdvcmRzID0gZXh0ZW5kZWQ7XHJcblxyXG4gIGggLT0gcztcclxuICBoID0gTWF0aC5tYXgoMCwgaCk7XHJcblxyXG4gIC8vIEV4dGVuZGVkIG1vZGUsIGNvcHkgbWFza2VkIHBhcnRcclxuICBpZiAobWFza2VkV29yZHMpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgczsgaSsrKVxyXG4gICAgICBtYXNrZWRXb3Jkcy53b3Jkc1tpXSA9IHRoaXMud29yZHNbaV07XHJcbiAgICBtYXNrZWRXb3Jkcy5sZW5ndGggPSBzO1xyXG4gIH1cclxuXHJcbiAgaWYgKHMgPT09IDApIHtcclxuICAgIC8vIE5vLW9wLCB3ZSBzaG91bGQgbm90IG1vdmUgYW55dGhpbmcgYXQgYWxsXHJcbiAgfSBlbHNlIGlmICh0aGlzLmxlbmd0aCA+IHMpIHtcclxuICAgIHRoaXMubGVuZ3RoIC09IHM7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspXHJcbiAgICAgIHRoaXMud29yZHNbaV0gPSB0aGlzLndvcmRzW2kgKyBzXTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy53b3Jkc1swXSA9IDA7XHJcbiAgICB0aGlzLmxlbmd0aCA9IDE7XHJcbiAgfVxyXG5cclxuICB2YXIgY2FycnkgPSAwO1xyXG4gIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0gMCAmJiAoY2FycnkgIT09IDAgfHwgaSA+PSBoKTsgaS0tKSB7XHJcbiAgICB2YXIgd29yZCA9IHRoaXMud29yZHNbaV07XHJcbiAgICB0aGlzLndvcmRzW2ldID0gKGNhcnJ5IDw8ICgyNiAtIHIpKSB8ICh3b3JkID4+PiByKTtcclxuICAgIGNhcnJ5ID0gd29yZCAmIG1hc2s7XHJcbiAgfVxyXG5cclxuICAvLyBQdXNoIGNhcnJpZWQgYml0cyBhcyBhIG1hc2tcclxuICBpZiAobWFza2VkV29yZHMgJiYgY2FycnkgIT09IDApXHJcbiAgICBtYXNrZWRXb3Jkcy53b3Jkc1ttYXNrZWRXb3Jkcy5sZW5ndGgrK10gPSBjYXJyeTtcclxuXHJcbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICB0aGlzLndvcmRzWzBdID0gMDtcclxuICAgIHRoaXMubGVuZ3RoID0gMTtcclxuICB9XHJcblxyXG4gIHRoaXMuc3RyaXAoKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vLyBTaGlmdC1sZWZ0XHJcbkJOLnByb3RvdHlwZS5zaGxuID0gZnVuY3Rpb24gc2hsbihiaXRzKSB7XHJcbiAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pc2hsbihiaXRzKTtcclxufTtcclxuXHJcbi8vIFNoaWZ0LXJpZ2h0XHJcbkJOLnByb3RvdHlwZS5zaHJuID0gZnVuY3Rpb24gc2hybihiaXRzKSB7XHJcbiAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pc2hybihiaXRzKTtcclxufTtcclxuXHJcbi8vIFRlc3QgaWYgbiBiaXQgaXMgc2V0XHJcbkJOLnByb3RvdHlwZS50ZXN0biA9IGZ1bmN0aW9uIHRlc3RuKGJpdCkge1xyXG4gIGFzc2VydCh0eXBlb2YgYml0ID09PSAnbnVtYmVyJyAmJiBiaXQgPj0gMCk7XHJcbiAgdmFyIHIgPSBiaXQgJSAyNjtcclxuICB2YXIgcyA9IChiaXQgLSByKSAvIDI2O1xyXG4gIHZhciBxID0gMSA8PCByO1xyXG5cclxuICAvLyBGYXN0IGNhc2U6IGJpdCBpcyBtdWNoIGhpZ2hlciB0aGFuIGFsbCBleGlzdGluZyB3b3Jkc1xyXG4gIGlmICh0aGlzLmxlbmd0aCA8PSBzKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBiaXQgYW5kIHJldHVyblxyXG4gIHZhciB3ID0gdGhpcy53b3Jkc1tzXTtcclxuXHJcbiAgcmV0dXJuICEhKHcgJiBxKTtcclxufTtcclxuXHJcbi8vIFJldHVybiBvbmx5IGxvd2VycyBiaXRzIG9mIG51bWJlciAoaW4tcGxhY2UpXHJcbkJOLnByb3RvdHlwZS5pbWFza24gPSBmdW5jdGlvbiBpbWFza24oYml0cykge1xyXG4gIGFzc2VydCh0eXBlb2YgYml0cyA9PT0gJ251bWJlcicgJiYgYml0cyA+PSAwKTtcclxuICB2YXIgciA9IGJpdHMgJSAyNjtcclxuICB2YXIgcyA9IChiaXRzIC0gcikgLyAyNjtcclxuXHJcbiAgYXNzZXJ0KCF0aGlzLnNpZ24sICdpbWFza24gd29ya3Mgb25seSB3aXRoIHBvc2l0aXZlIG51bWJlcnMnKTtcclxuXHJcbiAgaWYgKHIgIT09IDApXHJcbiAgICBzKys7XHJcbiAgdGhpcy5sZW5ndGggPSBNYXRoLm1pbihzLCB0aGlzLmxlbmd0aCk7XHJcblxyXG4gIGlmIChyICE9PSAwKSB7XHJcbiAgICB2YXIgbWFzayA9IDB4M2ZmZmZmZiBeICgoMHgzZmZmZmZmID4+PiByKSA8PCByKTtcclxuICAgIHRoaXMud29yZHNbdGhpcy5sZW5ndGggLSAxXSAmPSBtYXNrO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcclxufTtcclxuXHJcbi8vIFJldHVybiBvbmx5IGxvd2VycyBiaXRzIG9mIG51bWJlclxyXG5CTi5wcm90b3R5cGUubWFza24gPSBmdW5jdGlvbiBtYXNrbihiaXRzKSB7XHJcbiAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pbWFza24oYml0cyk7XHJcbn07XHJcblxyXG4vLyBBZGQgcGxhaW4gbnVtYmVyIGBudW1gIHRvIGB0aGlzYFxyXG5CTi5wcm90b3R5cGUuaWFkZG4gPSBmdW5jdGlvbiBpYWRkbihudW0pIHtcclxuICBhc3NlcnQodHlwZW9mIG51bSA9PT0gJ251bWJlcicpO1xyXG4gIGlmIChudW0gPCAwKVxyXG4gICAgcmV0dXJuIHRoaXMuaXN1Ym4oLW51bSk7XHJcblxyXG4gIC8vIFBvc3NpYmxlIHNpZ24gY2hhbmdlXHJcbiAgaWYgKHRoaXMuc2lnbikge1xyXG4gICAgaWYgKHRoaXMubGVuZ3RoID09PSAxICYmIHRoaXMud29yZHNbMF0gPCBudW0pIHtcclxuICAgICAgdGhpcy53b3Jkc1swXSA9IG51bSAtIHRoaXMud29yZHNbMF07XHJcbiAgICAgIHRoaXMuc2lnbiA9IGZhbHNlO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNpZ24gPSBmYWxzZTtcclxuICAgIHRoaXMuaXN1Ym4obnVtKTtcclxuICAgIHRoaXMuc2lnbiA9IHRydWU7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8vIEFkZCB3aXRob3V0IGNoZWNrc1xyXG4gIHJldHVybiB0aGlzLl9pYWRkbihudW0pO1xyXG59O1xyXG5cclxuQk4ucHJvdG90eXBlLl9pYWRkbiA9IGZ1bmN0aW9uIF9pYWRkbihudW0pIHtcclxuICB0aGlzLndvcmRzWzBdICs9IG51bTtcclxuXHJcbiAgLy8gQ2FycnlcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoICYmIHRoaXMud29yZHNbaV0gPj0gMHg0MDAwMDAwOyBpKyspIHtcclxuICAgIHRoaXMud29yZHNbaV0gLT0gMHg0MDAwMDAwO1xyXG4gICAgaWYgKGkgPT09IHRoaXMubGVuZ3RoIC0gMSlcclxuICAgICAgdGhpcy53b3Jkc1tpICsgMV0gPSAxO1xyXG4gICAgZWxzZVxyXG4gICAgICB0aGlzLndvcmRzW2kgKyAxXSsrO1xyXG4gIH1cclxuICB0aGlzLmxlbmd0aCA9IE1hdGgubWF4KHRoaXMubGVuZ3RoLCBpICsgMSk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy8gU3VidHJhY3QgcGxhaW4gbnVtYmVyIGBudW1gIGZyb20gYHRoaXNgXHJcbkJOLnByb3RvdHlwZS5pc3VibiA9IGZ1bmN0aW9uIGlzdWJuKG51bSkge1xyXG4gIGFzc2VydCh0eXBlb2YgbnVtID09PSAnbnVtYmVyJyk7XHJcbiAgaWYgKG51bSA8IDApXHJcbiAgICByZXR1cm4gdGhpcy5pYWRkbigtbnVtKTtcclxuXHJcbiAgaWYgKHRoaXMuc2lnbikge1xyXG4gICAgdGhpcy5zaWduID0gZmFsc2U7XHJcbiAgICB0aGlzLmlhZGRuKG51bSk7XHJcbiAgICB0aGlzLnNpZ24gPSB0cnVlO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICB0aGlzLndvcmRzWzBdIC09IG51bTtcclxuXHJcbiAgLy8gQ2FycnlcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoICYmIHRoaXMud29yZHNbaV0gPCAwOyBpKyspIHtcclxuICAgIHRoaXMud29yZHNbaV0gKz0gMHg0MDAwMDAwO1xyXG4gICAgdGhpcy53b3Jkc1tpICsgMV0gLT0gMTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzLnN0cmlwKCk7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUuYWRkbiA9IGZ1bmN0aW9uIGFkZG4obnVtKSB7XHJcbiAgcmV0dXJuIHRoaXMuY2xvbmUoKS5pYWRkbihudW0pO1xyXG59O1xyXG5cclxuQk4ucHJvdG90eXBlLnN1Ym4gPSBmdW5jdGlvbiBzdWJuKG51bSkge1xyXG4gIHJldHVybiB0aGlzLmNsb25lKCkuaXN1Ym4obnVtKTtcclxufTtcclxuXHJcbkJOLnByb3RvdHlwZS5pYWJzID0gZnVuY3Rpb24gaWFicygpIHtcclxuICB0aGlzLnNpZ24gPSBmYWxzZTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUuYWJzID0gZnVuY3Rpb24gYWJzKCkge1xyXG4gIHJldHVybiB0aGlzLmNsb25lKCkuaWFicygpO1xyXG59O1xyXG5cclxuQk4ucHJvdG90eXBlLl9pc2hsbnN1Ym11bCA9IGZ1bmN0aW9uIF9pc2hsbnN1Ym11bChudW0sIG11bCwgc2hpZnQpIHtcclxuICAvLyBCaWdnZXIgc3RvcmFnZSBpcyBuZWVkZWRcclxuICB2YXIgbGVuID0gbnVtLmxlbmd0aCArIHNoaWZ0O1xyXG4gIHZhciBpO1xyXG4gIGlmICh0aGlzLndvcmRzLmxlbmd0aCA8IGxlbikge1xyXG4gICAgdmFyIHQgPSBuZXcgQXJyYXkobGVuKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKylcclxuICAgICAgdFtpXSA9IHRoaXMud29yZHNbaV07XHJcbiAgICB0aGlzLndvcmRzID0gdDtcclxuICB9IGVsc2Uge1xyXG4gICAgaSA9IHRoaXMubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLy8gWmVyb2lmeSByZXN0XHJcbiAgdGhpcy5sZW5ndGggPSBNYXRoLm1heCh0aGlzLmxlbmd0aCwgbGVuKTtcclxuICBmb3IgKDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspXHJcbiAgICB0aGlzLndvcmRzW2ldID0gMDtcclxuXHJcbiAgdmFyIGNhcnJ5ID0gMDtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bS5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIHcgPSB0aGlzLndvcmRzW2kgKyBzaGlmdF0gKyBjYXJyeTtcclxuICAgIHZhciByaWdodCA9IG51bS53b3Jkc1tpXSAqIG11bDtcclxuICAgIHcgLT0gcmlnaHQgJiAweDNmZmZmZmY7XHJcbiAgICBjYXJyeSA9ICh3ID4+IDI2KSAtICgocmlnaHQgLyAweDQwMDAwMDApIHwgMCk7XHJcbiAgICB0aGlzLndvcmRzW2kgKyBzaGlmdF0gPSB3ICYgMHgzZmZmZmZmO1xyXG4gIH1cclxuICBmb3IgKDsgaSA8IHRoaXMubGVuZ3RoIC0gc2hpZnQ7IGkrKykge1xyXG4gICAgdmFyIHcgPSB0aGlzLndvcmRzW2kgKyBzaGlmdF0gKyBjYXJyeTtcclxuICAgIGNhcnJ5ID0gdyA+PiAyNjtcclxuICAgIHRoaXMud29yZHNbaSArIHNoaWZ0XSA9IHcgJiAweDNmZmZmZmY7XHJcbiAgfVxyXG5cclxuICBpZiAoY2FycnkgPT09IDApXHJcbiAgICByZXR1cm4gdGhpcy5zdHJpcCgpO1xyXG5cclxuICAvLyBTdWJ0cmFjdGlvbiBvdmVyZmxvd1xyXG4gIGFzc2VydChjYXJyeSA9PT0gLTEpO1xyXG4gIGNhcnJ5ID0gMDtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciB3ID0gLXRoaXMud29yZHNbaV0gKyBjYXJyeTtcclxuICAgIGNhcnJ5ID0gdyA+PiAyNjtcclxuICAgIHRoaXMud29yZHNbaV0gPSB3ICYgMHgzZmZmZmZmO1xyXG4gIH1cclxuICB0aGlzLnNpZ24gPSB0cnVlO1xyXG5cclxuICByZXR1cm4gdGhpcy5zdHJpcCgpO1xyXG59O1xyXG5cclxuQk4ucHJvdG90eXBlLl93b3JkRGl2ID0gZnVuY3Rpb24gX3dvcmREaXYobnVtLCBtb2RlKSB7XHJcbiAgdmFyIHNoaWZ0ID0gdGhpcy5sZW5ndGggLSBudW0ubGVuZ3RoO1xyXG5cclxuICB2YXIgYSA9IHRoaXMuY2xvbmUoKTtcclxuICB2YXIgYiA9IG51bTtcclxuXHJcbiAgLy8gTm9ybWFsaXplXHJcbiAgdmFyIGJoaSA9IGIud29yZHNbYi5sZW5ndGggLSAxXTtcclxuICB2YXIgYmhpQml0cyA9IHRoaXMuX2NvdW50Qml0cyhiaGkpO1xyXG4gIHNoaWZ0ID0gMjYgLSBiaGlCaXRzO1xyXG4gIGlmIChzaGlmdCAhPT0gMCkge1xyXG4gICAgYiA9IGIuc2hsbihzaGlmdCk7XHJcbiAgICBhLmlzaGxuKHNoaWZ0KTtcclxuICAgIGJoaSA9IGIud29yZHNbYi5sZW5ndGggLSAxXTtcclxuICB9XHJcblxyXG4gIC8vIEluaXRpYWxpemUgcXVvdGllbnRcclxuICB2YXIgbSA9IGEubGVuZ3RoIC0gYi5sZW5ndGg7XHJcbiAgdmFyIHE7XHJcblxyXG4gIGlmIChtb2RlICE9PSAnbW9kJykge1xyXG4gICAgcSA9IG5ldyBCTihudWxsKTtcclxuICAgIHEubGVuZ3RoID0gbSArIDE7XHJcbiAgICBxLndvcmRzID0gbmV3IEFycmF5KHEubGVuZ3RoKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcS5sZW5ndGg7IGkrKylcclxuICAgICAgcS53b3Jkc1tpXSA9IDA7XHJcbiAgfVxyXG5cclxuICB2YXIgZGlmZiA9IGEuY2xvbmUoKS5faXNobG5zdWJtdWwoYiwgMSwgbSk7XHJcbiAgaWYgKCFkaWZmLnNpZ24pIHtcclxuICAgIGEgPSBkaWZmO1xyXG4gICAgaWYgKHEpXHJcbiAgICAgIHEud29yZHNbbV0gPSAxO1xyXG4gIH1cclxuXHJcbiAgZm9yICh2YXIgaiA9IG0gLSAxOyBqID49IDA7IGotLSkge1xyXG4gICAgdmFyIHFqID0gYS53b3Jkc1tiLmxlbmd0aCArIGpdICogMHg0MDAwMDAwICsgYS53b3Jkc1tiLmxlbmd0aCArIGogLSAxXTtcclxuXHJcbiAgICAvLyBOT1RFOiAocWogLyBiaGkpIGlzICgweDNmZmZmZmYgKiAweDQwMDAwMDAgKyAweDNmZmZmZmYpIC8gMHgyMDAwMDAwIG1heFxyXG4gICAgLy8gKDB4N2ZmZmZmZilcclxuICAgIHFqID0gTWF0aC5taW4oKHFqIC8gYmhpKSB8IDAsIDB4M2ZmZmZmZik7XHJcblxyXG4gICAgYS5faXNobG5zdWJtdWwoYiwgcWosIGopO1xyXG4gICAgd2hpbGUgKGEuc2lnbikge1xyXG4gICAgICBxai0tO1xyXG4gICAgICBhLnNpZ24gPSBmYWxzZTtcclxuICAgICAgYS5faXNobG5zdWJtdWwoYiwgMSwgaik7XHJcbiAgICAgIGlmIChhLmNtcG4oMCkgIT09IDApXHJcbiAgICAgICAgYS5zaWduID0gIWEuc2lnbjtcclxuICAgIH1cclxuICAgIGlmIChxKVxyXG4gICAgICBxLndvcmRzW2pdID0gcWo7XHJcbiAgfVxyXG4gIGlmIChxKVxyXG4gICAgcS5zdHJpcCgpO1xyXG4gIGEuc3RyaXAoKTtcclxuXHJcbiAgLy8gRGVub3JtYWxpemVcclxuICBpZiAobW9kZSAhPT0gJ2RpdicgJiYgc2hpZnQgIT09IDApXHJcbiAgICBhLmlzaHJuKHNoaWZ0KTtcclxuICByZXR1cm4geyBkaXY6IHEgPyBxIDogbnVsbCwgbW9kOiBhIH07XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUuZGl2bW9kID0gZnVuY3Rpb24gZGl2bW9kKG51bSwgbW9kZSkge1xyXG4gIGFzc2VydChudW0uY21wbigwKSAhPT0gMCk7XHJcblxyXG4gIGlmICh0aGlzLnNpZ24gJiYgIW51bS5zaWduKSB7XHJcbiAgICB2YXIgcmVzID0gdGhpcy5uZWcoKS5kaXZtb2QobnVtLCBtb2RlKTtcclxuICAgIHZhciBkaXY7XHJcbiAgICB2YXIgbW9kO1xyXG4gICAgaWYgKG1vZGUgIT09ICdtb2QnKVxyXG4gICAgICBkaXYgPSByZXMuZGl2Lm5lZygpO1xyXG4gICAgaWYgKG1vZGUgIT09ICdkaXYnKVxyXG4gICAgICBtb2QgPSByZXMubW9kLmNtcG4oMCkgPT09IDAgPyByZXMubW9kIDogbnVtLnN1YihyZXMubW9kKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGRpdjogZGl2LFxyXG4gICAgICBtb2Q6IG1vZFxyXG4gICAgfTtcclxuICB9IGVsc2UgaWYgKCF0aGlzLnNpZ24gJiYgbnVtLnNpZ24pIHtcclxuICAgIHZhciByZXMgPSB0aGlzLmRpdm1vZChudW0ubmVnKCksIG1vZGUpO1xyXG4gICAgdmFyIGRpdjtcclxuICAgIGlmIChtb2RlICE9PSAnbW9kJylcclxuICAgICAgZGl2ID0gcmVzLmRpdi5uZWcoKTtcclxuICAgIHJldHVybiB7IGRpdjogZGl2LCBtb2Q6IHJlcy5tb2QgfTtcclxuICB9IGVsc2UgaWYgKHRoaXMuc2lnbiAmJiBudW0uc2lnbikge1xyXG4gICAgcmV0dXJuIHRoaXMubmVnKCkuZGl2bW9kKG51bS5uZWcoKSwgbW9kZSk7XHJcbiAgfVxyXG5cclxuICAvLyBCb3RoIG51bWJlcnMgYXJlIHBvc2l0aXZlIGF0IHRoaXMgcG9pbnRcclxuXHJcbiAgLy8gU3RyaXAgYm90aCBudW1iZXJzIHRvIGFwcHJveGltYXRlIHNoaWZ0IHZhbHVlXHJcbiAgaWYgKG51bS5sZW5ndGggPiB0aGlzLmxlbmd0aCB8fCB0aGlzLmNtcChudW0pIDwgMClcclxuICAgIHJldHVybiB7IGRpdjogbmV3IEJOKDApLCBtb2Q6IHRoaXMgfTtcclxuXHJcbiAgLy8gVmVyeSBzaG9ydCByZWR1Y3Rpb25cclxuICBpZiAobnVtLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgaWYgKG1vZGUgPT09ICdkaXYnKVxyXG4gICAgICByZXR1cm4geyBkaXY6IHRoaXMuZGl2bihudW0ud29yZHNbMF0pLCBtb2Q6IG51bGwgfTtcclxuICAgIGVsc2UgaWYgKG1vZGUgPT09ICdtb2QnKVxyXG4gICAgICByZXR1cm4geyBkaXY6IG51bGwsIG1vZDogbmV3IEJOKHRoaXMubW9kbihudW0ud29yZHNbMF0pKSB9O1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZGl2OiB0aGlzLmRpdm4obnVtLndvcmRzWzBdKSxcclxuICAgICAgbW9kOiBuZXcgQk4odGhpcy5tb2RuKG51bS53b3Jkc1swXSkpXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXMuX3dvcmREaXYobnVtLCBtb2RlKTtcclxufTtcclxuXHJcbi8vIEZpbmQgYHRoaXNgIC8gYG51bWBcclxuQk4ucHJvdG90eXBlLmRpdiA9IGZ1bmN0aW9uIGRpdihudW0pIHtcclxuICByZXR1cm4gdGhpcy5kaXZtb2QobnVtLCAnZGl2JykuZGl2O1xyXG59O1xyXG5cclxuLy8gRmluZCBgdGhpc2AgJSBgbnVtYFxyXG5CTi5wcm90b3R5cGUubW9kID0gZnVuY3Rpb24gbW9kKG51bSkge1xyXG4gIHJldHVybiB0aGlzLmRpdm1vZChudW0sICdtb2QnKS5tb2Q7XHJcbn07XHJcblxyXG4vLyBGaW5kIFJvdW5kKGB0aGlzYCAvIGBudW1gKVxyXG5CTi5wcm90b3R5cGUuZGl2Um91bmQgPSBmdW5jdGlvbiBkaXZSb3VuZChudW0pIHtcclxuICB2YXIgZG0gPSB0aGlzLmRpdm1vZChudW0pO1xyXG5cclxuICAvLyBGYXN0IGNhc2UgLSBleGFjdCBkaXZpc2lvblxyXG4gIGlmIChkbS5tb2QuY21wbigwKSA9PT0gMClcclxuICAgIHJldHVybiBkbS5kaXY7XHJcblxyXG4gIHZhciBtb2QgPSBkbS5kaXYuc2lnbiA/IGRtLm1vZC5pc3ViKG51bSkgOiBkbS5tb2Q7XHJcblxyXG4gIHZhciBoYWxmID0gbnVtLnNocm4oMSk7XHJcbiAgdmFyIHIyID0gbnVtLmFuZGxuKDEpO1xyXG4gIHZhciBjbXAgPSBtb2QuY21wKGhhbGYpO1xyXG5cclxuICAvLyBSb3VuZCBkb3duXHJcbiAgaWYgKGNtcCA8IDAgfHwgcjIgPT09IDEgJiYgY21wID09PSAwKVxyXG4gICAgcmV0dXJuIGRtLmRpdjtcclxuXHJcbiAgLy8gUm91bmQgdXBcclxuICByZXR1cm4gZG0uZGl2LnNpZ24gPyBkbS5kaXYuaXN1Ym4oMSkgOiBkbS5kaXYuaWFkZG4oMSk7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUubW9kbiA9IGZ1bmN0aW9uIG1vZG4obnVtKSB7XHJcbiAgYXNzZXJ0KG51bSA8PSAweDNmZmZmZmYpO1xyXG4gIHZhciBwID0gKDEgPDwgMjYpICUgbnVtO1xyXG5cclxuICB2YXIgYWNjID0gMDtcclxuICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgIGFjYyA9IChwICogYWNjICsgdGhpcy53b3Jkc1tpXSkgJSBudW07XHJcblxyXG4gIHJldHVybiBhY2M7XHJcbn07XHJcblxyXG4vLyBJbi1wbGFjZSBkaXZpc2lvbiBieSBudW1iZXJcclxuQk4ucHJvdG90eXBlLmlkaXZuID0gZnVuY3Rpb24gaWRpdm4obnVtKSB7XHJcbiAgYXNzZXJ0KG51bSA8PSAweDNmZmZmZmYpO1xyXG5cclxuICB2YXIgY2FycnkgPSAwO1xyXG4gIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICB2YXIgdyA9IHRoaXMud29yZHNbaV0gKyBjYXJyeSAqIDB4NDAwMDAwMDtcclxuICAgIHRoaXMud29yZHNbaV0gPSAodyAvIG51bSkgfCAwO1xyXG4gICAgY2FycnkgPSB3ICUgbnVtO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXMuc3RyaXAoKTtcclxufTtcclxuXHJcbkJOLnByb3RvdHlwZS5kaXZuID0gZnVuY3Rpb24gZGl2bihudW0pIHtcclxuICByZXR1cm4gdGhpcy5jbG9uZSgpLmlkaXZuKG51bSk7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUuZWdjZCA9IGZ1bmN0aW9uIGVnY2QocCkge1xyXG4gIGFzc2VydCghcC5zaWduKTtcclxuICBhc3NlcnQocC5jbXBuKDApICE9PSAwKTtcclxuXHJcbiAgdmFyIHggPSB0aGlzO1xyXG4gIHZhciB5ID0gcC5jbG9uZSgpO1xyXG5cclxuICBpZiAoeC5zaWduKVxyXG4gICAgeCA9IHgubW9kKHApO1xyXG4gIGVsc2VcclxuICAgIHggPSB4LmNsb25lKCk7XHJcblxyXG4gIC8vIEEgKiB4ICsgQiAqIHkgPSB4XHJcbiAgdmFyIEEgPSBuZXcgQk4oMSk7XHJcbiAgdmFyIEIgPSBuZXcgQk4oMCk7XHJcblxyXG4gIC8vIEMgKiB4ICsgRCAqIHkgPSB5XHJcbiAgdmFyIEMgPSBuZXcgQk4oMCk7XHJcbiAgdmFyIEQgPSBuZXcgQk4oMSk7XHJcblxyXG4gIHZhciBnID0gMDtcclxuXHJcbiAgd2hpbGUgKHguaXNFdmVuKCkgJiYgeS5pc0V2ZW4oKSkge1xyXG4gICAgeC5pc2hybigxKTtcclxuICAgIHkuaXNocm4oMSk7XHJcbiAgICArK2c7XHJcbiAgfVxyXG5cclxuICB2YXIgeXAgPSB5LmNsb25lKCk7XHJcbiAgdmFyIHhwID0geC5jbG9uZSgpO1xyXG5cclxuICB3aGlsZSAoeC5jbXBuKDApICE9PSAwKSB7XHJcbiAgICB3aGlsZSAoeC5pc0V2ZW4oKSkge1xyXG4gICAgICB4LmlzaHJuKDEpO1xyXG4gICAgICBpZiAoQS5pc0V2ZW4oKSAmJiBCLmlzRXZlbigpKSB7XHJcbiAgICAgICAgQS5pc2hybigxKTtcclxuICAgICAgICBCLmlzaHJuKDEpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIEEuaWFkZCh5cCkuaXNocm4oMSk7XHJcbiAgICAgICAgQi5pc3ViKHhwKS5pc2hybigxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdoaWxlICh5LmlzRXZlbigpKSB7XHJcbiAgICAgIHkuaXNocm4oMSk7XHJcbiAgICAgIGlmIChDLmlzRXZlbigpICYmIEQuaXNFdmVuKCkpIHtcclxuICAgICAgICBDLmlzaHJuKDEpO1xyXG4gICAgICAgIEQuaXNocm4oMSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgQy5pYWRkKHlwKS5pc2hybigxKTtcclxuICAgICAgICBELmlzdWIoeHApLmlzaHJuKDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHguY21wKHkpID49IDApIHtcclxuICAgICAgeC5pc3ViKHkpO1xyXG4gICAgICBBLmlzdWIoQyk7XHJcbiAgICAgIEIuaXN1YihEKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHkuaXN1Yih4KTtcclxuICAgICAgQy5pc3ViKEEpO1xyXG4gICAgICBELmlzdWIoQik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgYTogQyxcclxuICAgIGI6IEQsXHJcbiAgICBnY2Q6IHkuaXNobG4oZylcclxuICB9O1xyXG59O1xyXG5cclxuLy8gVGhpcyBpcyByZWR1Y2VkIGluY2FybmF0aW9uIG9mIHRoZSBiaW5hcnkgRUVBXHJcbi8vIGFib3ZlLCBkZXNpZ25hdGVkIHRvIGludmVydCBtZW1iZXJzIG9mIHRoZVxyXG4vLyBfcHJpbWVfIGZpZWxkcyBGKHApIGF0IGEgbWF4aW1hbCBzcGVlZFxyXG5CTi5wcm90b3R5cGUuX2ludm1wID0gZnVuY3Rpb24gX2ludm1wKHApIHtcclxuICBhc3NlcnQoIXAuc2lnbik7XHJcbiAgYXNzZXJ0KHAuY21wbigwKSAhPT0gMCk7XHJcblxyXG4gIHZhciBhID0gdGhpcztcclxuICB2YXIgYiA9IHAuY2xvbmUoKTtcclxuXHJcbiAgaWYgKGEuc2lnbilcclxuICAgIGEgPSBhLm1vZChwKTtcclxuICBlbHNlXHJcbiAgICBhID0gYS5jbG9uZSgpO1xyXG5cclxuICB2YXIgeDEgPSBuZXcgQk4oMSk7XHJcbiAgdmFyIHgyID0gbmV3IEJOKDApO1xyXG5cclxuICB2YXIgZGVsdGEgPSBiLmNsb25lKCk7XHJcblxyXG4gIHdoaWxlIChhLmNtcG4oMSkgPiAwICYmIGIuY21wbigxKSA+IDApIHtcclxuICAgIHdoaWxlIChhLmlzRXZlbigpKSB7XHJcbiAgICAgIGEuaXNocm4oMSk7XHJcbiAgICAgIGlmICh4MS5pc0V2ZW4oKSlcclxuICAgICAgICB4MS5pc2hybigxKTtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHgxLmlhZGQoZGVsdGEpLmlzaHJuKDEpO1xyXG4gICAgfVxyXG4gICAgd2hpbGUgKGIuaXNFdmVuKCkpIHtcclxuICAgICAgYi5pc2hybigxKTtcclxuICAgICAgaWYgKHgyLmlzRXZlbigpKVxyXG4gICAgICAgIHgyLmlzaHJuKDEpO1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgeDIuaWFkZChkZWx0YSkuaXNocm4oMSk7XHJcbiAgICB9XHJcbiAgICBpZiAoYS5jbXAoYikgPj0gMCkge1xyXG4gICAgICBhLmlzdWIoYik7XHJcbiAgICAgIHgxLmlzdWIoeDIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYi5pc3ViKGEpO1xyXG4gICAgICB4Mi5pc3ViKHgxKTtcclxuICAgIH1cclxuICB9XHJcbiAgaWYgKGEuY21wbigxKSA9PT0gMClcclxuICAgIHJldHVybiB4MTtcclxuICBlbHNlXHJcbiAgICByZXR1cm4geDI7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUuZ2NkID0gZnVuY3Rpb24gZ2NkKG51bSkge1xyXG4gIGlmICh0aGlzLmNtcG4oMCkgPT09IDApXHJcbiAgICByZXR1cm4gbnVtLmNsb25lKCk7XHJcbiAgaWYgKG51bS5jbXBuKDApID09PSAwKVxyXG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuXHJcbiAgdmFyIGEgPSB0aGlzLmNsb25lKCk7XHJcbiAgdmFyIGIgPSBudW0uY2xvbmUoKTtcclxuICBhLnNpZ24gPSBmYWxzZTtcclxuICBiLnNpZ24gPSBmYWxzZTtcclxuXHJcbiAgLy8gUmVtb3ZlIGNvbW1vbiBmYWN0b3Igb2YgdHdvXHJcbiAgZm9yICh2YXIgc2hpZnQgPSAwOyBhLmlzRXZlbigpICYmIGIuaXNFdmVuKCk7IHNoaWZ0KyspIHtcclxuICAgIGEuaXNocm4oMSk7XHJcbiAgICBiLmlzaHJuKDEpO1xyXG4gIH1cclxuXHJcbiAgZG8ge1xyXG4gICAgd2hpbGUgKGEuaXNFdmVuKCkpXHJcbiAgICAgIGEuaXNocm4oMSk7XHJcbiAgICB3aGlsZSAoYi5pc0V2ZW4oKSlcclxuICAgICAgYi5pc2hybigxKTtcclxuXHJcbiAgICB2YXIgciA9IGEuY21wKGIpO1xyXG4gICAgaWYgKHIgPCAwKSB7XHJcbiAgICAgIC8vIFN3YXAgYGFgIGFuZCBgYmAgdG8gbWFrZSBgYWAgYWx3YXlzIGJpZ2dlciB0aGFuIGBiYFxyXG4gICAgICB2YXIgdCA9IGE7XHJcbiAgICAgIGEgPSBiO1xyXG4gICAgICBiID0gdDtcclxuICAgIH0gZWxzZSBpZiAociA9PT0gMCB8fCBiLmNtcG4oMSkgPT09IDApIHtcclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgYS5pc3ViKGIpO1xyXG4gIH0gd2hpbGUgKHRydWUpO1xyXG5cclxuICByZXR1cm4gYi5pc2hsbihzaGlmdCk7XHJcbn07XHJcblxyXG4vLyBJbnZlcnQgbnVtYmVyIGluIHRoZSBmaWVsZCBGKG51bSlcclxuQk4ucHJvdG90eXBlLmludm0gPSBmdW5jdGlvbiBpbnZtKG51bSkge1xyXG4gIHJldHVybiB0aGlzLmVnY2QobnVtKS5hLm1vZChudW0pO1xyXG59O1xyXG5cclxuQk4ucHJvdG90eXBlLmlzRXZlbiA9IGZ1bmN0aW9uIGlzRXZlbigpIHtcclxuICByZXR1cm4gKHRoaXMud29yZHNbMF0gJiAxKSA9PT0gMDtcclxufTtcclxuXHJcbkJOLnByb3RvdHlwZS5pc09kZCA9IGZ1bmN0aW9uIGlzT2RkKCkge1xyXG4gIHJldHVybiAodGhpcy53b3Jkc1swXSAmIDEpID09PSAxO1xyXG59O1xyXG5cclxuLy8gQW5kIGZpcnN0IHdvcmQgYW5kIG51bVxyXG5CTi5wcm90b3R5cGUuYW5kbG4gPSBmdW5jdGlvbiBhbmRsbihudW0pIHtcclxuICByZXR1cm4gdGhpcy53b3Jkc1swXSAmIG51bTtcclxufTtcclxuXHJcbi8vIEluY3JlbWVudCBhdCB0aGUgYml0IHBvc2l0aW9uIGluLWxpbmVcclxuQk4ucHJvdG90eXBlLmJpbmNuID0gZnVuY3Rpb24gYmluY24oYml0KSB7XHJcbiAgYXNzZXJ0KHR5cGVvZiBiaXQgPT09ICdudW1iZXInKTtcclxuICB2YXIgciA9IGJpdCAlIDI2O1xyXG4gIHZhciBzID0gKGJpdCAtIHIpIC8gMjY7XHJcbiAgdmFyIHEgPSAxIDw8IHI7XHJcblxyXG4gIC8vIEZhc3QgY2FzZTogYml0IGlzIG11Y2ggaGlnaGVyIHRoYW4gYWxsIGV4aXN0aW5nIHdvcmRzXHJcbiAgaWYgKHRoaXMubGVuZ3RoIDw9IHMpIHtcclxuICAgIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aDsgaSA8IHMgKyAxOyBpKyspXHJcbiAgICAgIHRoaXMud29yZHNbaV0gPSAwO1xyXG4gICAgdGhpcy53b3Jkc1tzXSB8PSBxO1xyXG4gICAgdGhpcy5sZW5ndGggPSBzICsgMTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLy8gQWRkIGJpdCBhbmQgcHJvcGFnYXRlLCBpZiBuZWVkZWRcclxuICB2YXIgY2FycnkgPSBxO1xyXG4gIGZvciAodmFyIGkgPSBzOyBjYXJyeSAhPT0gMCAmJiBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIHcgPSB0aGlzLndvcmRzW2ldO1xyXG4gICAgdyArPSBjYXJyeTtcclxuICAgIGNhcnJ5ID0gdyA+Pj4gMjY7XHJcbiAgICB3ICY9IDB4M2ZmZmZmZjtcclxuICAgIHRoaXMud29yZHNbaV0gPSB3O1xyXG4gIH1cclxuICBpZiAoY2FycnkgIT09IDApIHtcclxuICAgIHRoaXMud29yZHNbaV0gPSBjYXJyeTtcclxuICAgIHRoaXMubGVuZ3RoKys7XHJcbiAgfVxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuQk4ucHJvdG90eXBlLmNtcG4gPSBmdW5jdGlvbiBjbXBuKG51bSkge1xyXG4gIHZhciBzaWduID0gbnVtIDwgMDtcclxuICBpZiAoc2lnbilcclxuICAgIG51bSA9IC1udW07XHJcblxyXG4gIGlmICh0aGlzLnNpZ24gJiYgIXNpZ24pXHJcbiAgICByZXR1cm4gLTE7XHJcbiAgZWxzZSBpZiAoIXRoaXMuc2lnbiAmJiBzaWduKVxyXG4gICAgcmV0dXJuIDE7XHJcblxyXG4gIG51bSAmPSAweDNmZmZmZmY7XHJcbiAgdGhpcy5zdHJpcCgpO1xyXG5cclxuICB2YXIgcmVzO1xyXG4gIGlmICh0aGlzLmxlbmd0aCA+IDEpIHtcclxuICAgIHJlcyA9IDE7XHJcbiAgfSBlbHNlIHtcclxuICAgIHZhciB3ID0gdGhpcy53b3Jkc1swXTtcclxuICAgIHJlcyA9IHcgPT09IG51bSA/IDAgOiB3IDwgbnVtID8gLTEgOiAxO1xyXG4gIH1cclxuICBpZiAodGhpcy5zaWduKVxyXG4gICAgcmVzID0gLXJlcztcclxuICByZXR1cm4gcmVzO1xyXG59O1xyXG5cclxuLy8gQ29tcGFyZSB0d28gbnVtYmVycyBhbmQgcmV0dXJuOlxyXG4vLyAxIC0gaWYgYHRoaXNgID4gYG51bWBcclxuLy8gMCAtIGlmIGB0aGlzYCA9PSBgbnVtYFxyXG4vLyAtMSAtIGlmIGB0aGlzYCA8IGBudW1gXHJcbkJOLnByb3RvdHlwZS5jbXAgPSBmdW5jdGlvbiBjbXAobnVtKSB7XHJcbiAgaWYgKHRoaXMuc2lnbiAmJiAhbnVtLnNpZ24pXHJcbiAgICByZXR1cm4gLTE7XHJcbiAgZWxzZSBpZiAoIXRoaXMuc2lnbiAmJiBudW0uc2lnbilcclxuICAgIHJldHVybiAxO1xyXG5cclxuICB2YXIgcmVzID0gdGhpcy51Y21wKG51bSk7XHJcbiAgaWYgKHRoaXMuc2lnbilcclxuICAgIHJldHVybiAtcmVzO1xyXG4gIGVsc2VcclxuICAgIHJldHVybiByZXM7XHJcbn07XHJcblxyXG4vLyBVbnNpZ25lZCBjb21wYXJpc29uXHJcbkJOLnByb3RvdHlwZS51Y21wID0gZnVuY3Rpb24gdWNtcChudW0pIHtcclxuICAvLyBBdCB0aGlzIHBvaW50IGJvdGggbnVtYmVycyBoYXZlIHRoZSBzYW1lIHNpZ25cclxuICBpZiAodGhpcy5sZW5ndGggPiBudW0ubGVuZ3RoKVxyXG4gICAgcmV0dXJuIDE7XHJcbiAgZWxzZSBpZiAodGhpcy5sZW5ndGggPCBudW0ubGVuZ3RoKVxyXG4gICAgcmV0dXJuIC0xO1xyXG5cclxuICB2YXIgcmVzID0gMDtcclxuICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgdmFyIGEgPSB0aGlzLndvcmRzW2ldO1xyXG4gICAgdmFyIGIgPSBudW0ud29yZHNbaV07XHJcblxyXG4gICAgaWYgKGEgPT09IGIpXHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgaWYgKGEgPCBiKVxyXG4gICAgICByZXMgPSAtMTtcclxuICAgIGVsc2UgaWYgKGEgPiBiKVxyXG4gICAgICByZXMgPSAxO1xyXG4gICAgYnJlYWs7XHJcbiAgfVxyXG4gIHJldHVybiByZXM7XHJcbn07XHJcblxyXG4vL1xyXG4vLyBBIHJlZHVjZSBjb250ZXh0LCBjb3VsZCBiZSB1c2luZyBtb250Z29tZXJ5IG9yIHNvbWV0aGluZyBiZXR0ZXIsIGRlcGVuZGluZ1xyXG4vLyBvbiB0aGUgYG1gIGl0c2VsZi5cclxuLy9cclxuQk4ucmVkID0gZnVuY3Rpb24gcmVkKG51bSkge1xyXG4gIHJldHVybiBuZXcgUmVkKG51bSk7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUudG9SZWQgPSBmdW5jdGlvbiB0b1JlZChjdHgpIHtcclxuICBhc3NlcnQoIXRoaXMucmVkLCAnQWxyZWFkeSBhIG51bWJlciBpbiByZWR1Y3Rpb24gY29udGV4dCcpO1xyXG4gIGFzc2VydCghdGhpcy5zaWduLCAncmVkIHdvcmtzIG9ubHkgd2l0aCBwb3NpdGl2ZXMnKTtcclxuICByZXR1cm4gY3R4LmNvbnZlcnRUbyh0aGlzKS5fZm9yY2VSZWQoY3R4KTtcclxufTtcclxuXHJcbkJOLnByb3RvdHlwZS5mcm9tUmVkID0gZnVuY3Rpb24gZnJvbVJlZCgpIHtcclxuICBhc3NlcnQodGhpcy5yZWQsICdmcm9tUmVkIHdvcmtzIG9ubHkgd2l0aCBudW1iZXJzIGluIHJlZHVjdGlvbiBjb250ZXh0Jyk7XHJcbiAgcmV0dXJuIHRoaXMucmVkLmNvbnZlcnRGcm9tKHRoaXMpO1xyXG59O1xyXG5cclxuQk4ucHJvdG90eXBlLl9mb3JjZVJlZCA9IGZ1bmN0aW9uIF9mb3JjZVJlZChjdHgpIHtcclxuICB0aGlzLnJlZCA9IGN0eDtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbkJOLnByb3RvdHlwZS5mb3JjZVJlZCA9IGZ1bmN0aW9uIGZvcmNlUmVkKGN0eCkge1xyXG4gIGFzc2VydCghdGhpcy5yZWQsICdBbHJlYWR5IGEgbnVtYmVyIGluIHJlZHVjdGlvbiBjb250ZXh0Jyk7XHJcbiAgcmV0dXJuIHRoaXMuX2ZvcmNlUmVkKGN0eCk7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUucmVkQWRkID0gZnVuY3Rpb24gcmVkQWRkKG51bSkge1xyXG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZEFkZCB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcclxuICByZXR1cm4gdGhpcy5yZWQuYWRkKHRoaXMsIG51bSk7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUucmVkSUFkZCA9IGZ1bmN0aW9uIHJlZElBZGQobnVtKSB7XHJcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkSUFkZCB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcclxuICByZXR1cm4gdGhpcy5yZWQuaWFkZCh0aGlzLCBudW0pO1xyXG59O1xyXG5cclxuQk4ucHJvdG90eXBlLnJlZFN1YiA9IGZ1bmN0aW9uIHJlZFN1YihudW0pIHtcclxuICBhc3NlcnQodGhpcy5yZWQsICdyZWRTdWIgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XHJcbiAgcmV0dXJuIHRoaXMucmVkLnN1Yih0aGlzLCBudW0pO1xyXG59O1xyXG5cclxuQk4ucHJvdG90eXBlLnJlZElTdWIgPSBmdW5jdGlvbiByZWRJU3ViKG51bSkge1xyXG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZElTdWIgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XHJcbiAgcmV0dXJuIHRoaXMucmVkLmlzdWIodGhpcywgbnVtKTtcclxufTtcclxuXHJcbkJOLnByb3RvdHlwZS5yZWRTaGwgPSBmdW5jdGlvbiByZWRTaGwobnVtKSB7XHJcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkU2hsIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xyXG4gIHJldHVybiB0aGlzLnJlZC5zaGwodGhpcywgbnVtKTtcclxufTtcclxuXHJcbkJOLnByb3RvdHlwZS5yZWRNdWwgPSBmdW5jdGlvbiByZWRNdWwobnVtKSB7XHJcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkTXVsIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xyXG4gIHRoaXMucmVkLl92ZXJpZnkyKHRoaXMsIG51bSk7XHJcbiAgcmV0dXJuIHRoaXMucmVkLm11bCh0aGlzLCBudW0pO1xyXG59O1xyXG5cclxuQk4ucHJvdG90eXBlLnJlZElNdWwgPSBmdW5jdGlvbiByZWRJTXVsKG51bSkge1xyXG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZE11bCB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcclxuICB0aGlzLnJlZC5fdmVyaWZ5Mih0aGlzLCBudW0pO1xyXG4gIHJldHVybiB0aGlzLnJlZC5pbXVsKHRoaXMsIG51bSk7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUucmVkU3FyID0gZnVuY3Rpb24gcmVkU3FyKCkge1xyXG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZFNxciB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcclxuICB0aGlzLnJlZC5fdmVyaWZ5MSh0aGlzKTtcclxuICByZXR1cm4gdGhpcy5yZWQuc3FyKHRoaXMpO1xyXG59O1xyXG5cclxuQk4ucHJvdG90eXBlLnJlZElTcXIgPSBmdW5jdGlvbiByZWRJU3FyKCkge1xyXG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZElTcXIgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XHJcbiAgdGhpcy5yZWQuX3ZlcmlmeTEodGhpcyk7XHJcbiAgcmV0dXJuIHRoaXMucmVkLmlzcXIodGhpcyk7XHJcbn07XHJcblxyXG4vLyBTcXVhcmUgcm9vdCBvdmVyIHBcclxuQk4ucHJvdG90eXBlLnJlZFNxcnQgPSBmdW5jdGlvbiByZWRTcXJ0KCkge1xyXG4gIGFzc2VydCh0aGlzLnJlZCwgJ3JlZFNxcnQgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XHJcbiAgdGhpcy5yZWQuX3ZlcmlmeTEodGhpcyk7XHJcbiAgcmV0dXJuIHRoaXMucmVkLnNxcnQodGhpcyk7XHJcbn07XHJcblxyXG5CTi5wcm90b3R5cGUucmVkSW52bSA9IGZ1bmN0aW9uIHJlZEludm0oKSB7XHJcbiAgYXNzZXJ0KHRoaXMucmVkLCAncmVkSW52bSB3b3JrcyBvbmx5IHdpdGggcmVkIG51bWJlcnMnKTtcclxuICB0aGlzLnJlZC5fdmVyaWZ5MSh0aGlzKTtcclxuICByZXR1cm4gdGhpcy5yZWQuaW52bSh0aGlzKTtcclxufTtcclxuXHJcbi8vIFJldHVybiBuZWdhdGl2ZSBjbG9uZSBvZiBgdGhpc2AgJSBgcmVkIG1vZHVsb2BcclxuQk4ucHJvdG90eXBlLnJlZE5lZyA9IGZ1bmN0aW9uIHJlZE5lZygpIHtcclxuICBhc3NlcnQodGhpcy5yZWQsICdyZWROZWcgd29ya3Mgb25seSB3aXRoIHJlZCBudW1iZXJzJyk7XHJcbiAgdGhpcy5yZWQuX3ZlcmlmeTEodGhpcyk7XHJcbiAgcmV0dXJuIHRoaXMucmVkLm5lZyh0aGlzKTtcclxufTtcclxuXHJcbkJOLnByb3RvdHlwZS5yZWRQb3cgPSBmdW5jdGlvbiByZWRQb3cobnVtKSB7XHJcbiAgYXNzZXJ0KHRoaXMucmVkICYmICFudW0ucmVkLCAncmVkUG93KG5vcm1hbE51bSknKTtcclxuICB0aGlzLnJlZC5fdmVyaWZ5MSh0aGlzKTtcclxuICByZXR1cm4gdGhpcy5yZWQucG93KHRoaXMsIG51bSk7XHJcbn07XHJcblxyXG4vLyBQcmltZSBudW1iZXJzIHdpdGggZWZmaWNpZW50IHJlZHVjdGlvblxyXG52YXIgcHJpbWVzID0ge1xyXG4gIGsyNTY6IG51bGwsXHJcbiAgcDIyNDogbnVsbCxcclxuICBwMTkyOiBudWxsLFxyXG4gIHAyNTUxOTogbnVsbFxyXG59O1xyXG5cclxuLy8gUHNldWRvLU1lcnNlbm5lIHByaW1lXHJcbmZ1bmN0aW9uIE1QcmltZShuYW1lLCBwKSB7XHJcbiAgLy8gUCA9IDIgXiBOIC0gS1xyXG4gIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgdGhpcy5wID0gbmV3IEJOKHAsIDE2KTtcclxuICB0aGlzLm4gPSB0aGlzLnAuYml0TGVuZ3RoKCk7XHJcbiAgdGhpcy5rID0gbmV3IEJOKDEpLmlzaGxuKHRoaXMubikuaXN1Yih0aGlzLnApO1xyXG5cclxuICB0aGlzLnRtcCA9IHRoaXMuX3RtcCgpO1xyXG59XHJcblxyXG5NUHJpbWUucHJvdG90eXBlLl90bXAgPSBmdW5jdGlvbiBfdG1wKCkge1xyXG4gIHZhciB0bXAgPSBuZXcgQk4obnVsbCk7XHJcbiAgdG1wLndvcmRzID0gbmV3IEFycmF5KE1hdGguY2VpbCh0aGlzLm4gLyAxMykpO1xyXG4gIHJldHVybiB0bXA7XHJcbn07XHJcblxyXG5NUHJpbWUucHJvdG90eXBlLmlyZWR1Y2UgPSBmdW5jdGlvbiBpcmVkdWNlKG51bSkge1xyXG4gIC8vIEFzc3VtZXMgdGhhdCBgbnVtYCBpcyBsZXNzIHRoYW4gYFBeMmBcclxuICAvLyBudW0gPSBISSAqICgyIF4gTiAtIEspICsgSEkgKiBLICsgTE8gPSBISSAqIEsgKyBMTyAobW9kIFApXHJcbiAgdmFyIHIgPSBudW07XHJcbiAgdmFyIHJsZW47XHJcblxyXG4gIGRvIHtcclxuICAgIHRoaXMuc3BsaXQociwgdGhpcy50bXApO1xyXG4gICAgciA9IHRoaXMuaW11bEsocik7XHJcbiAgICByID0gci5pYWRkKHRoaXMudG1wKTtcclxuICAgIHJsZW4gPSByLmJpdExlbmd0aCgpO1xyXG4gIH0gd2hpbGUgKHJsZW4gPiB0aGlzLm4pO1xyXG5cclxuICB2YXIgY21wID0gcmxlbiA8IHRoaXMubiA/IC0xIDogci51Y21wKHRoaXMucCk7XHJcbiAgaWYgKGNtcCA9PT0gMCkge1xyXG4gICAgci53b3Jkc1swXSA9IDA7XHJcbiAgICByLmxlbmd0aCA9IDE7XHJcbiAgfSBlbHNlIGlmIChjbXAgPiAwKSB7XHJcbiAgICByLmlzdWIodGhpcy5wKTtcclxuICB9IGVsc2Uge1xyXG4gICAgci5zdHJpcCgpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHI7XHJcbn07XHJcblxyXG5NUHJpbWUucHJvdG90eXBlLnNwbGl0ID0gZnVuY3Rpb24gc3BsaXQoaW5wdXQsIG91dCkge1xyXG4gIGlucHV0LmlzaHJuKHRoaXMubiwgMCwgb3V0KTtcclxufTtcclxuXHJcbk1QcmltZS5wcm90b3R5cGUuaW11bEsgPSBmdW5jdGlvbiBpbXVsSyhudW0pIHtcclxuICByZXR1cm4gbnVtLmltdWwodGhpcy5rKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIEsyNTYoKSB7XHJcbiAgTVByaW1lLmNhbGwoXHJcbiAgICB0aGlzLFxyXG4gICAgJ2syNTYnLFxyXG4gICAgJ2ZmZmZmZmZmIGZmZmZmZmZmIGZmZmZmZmZmIGZmZmZmZmZmIGZmZmZmZmZmIGZmZmZmZmZmIGZmZmZmZmZlIGZmZmZmYzJmJyk7XHJcbn1cclxuaW5oZXJpdHMoSzI1NiwgTVByaW1lKTtcclxuXHJcbksyNTYucHJvdG90eXBlLnNwbGl0ID0gZnVuY3Rpb24gc3BsaXQoaW5wdXQsIG91dHB1dCkge1xyXG4gIC8vIDI1NiA9IDkgKiAyNiArIDIyXHJcbiAgdmFyIG1hc2sgPSAweDNmZmZmZjtcclxuXHJcbiAgdmFyIG91dExlbiA9IE1hdGgubWluKGlucHV0Lmxlbmd0aCwgOSk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBvdXRMZW47IGkrKylcclxuICAgIG91dHB1dC53b3Jkc1tpXSA9IGlucHV0LndvcmRzW2ldO1xyXG4gIG91dHB1dC5sZW5ndGggPSBvdXRMZW47XHJcblxyXG4gIGlmIChpbnB1dC5sZW5ndGggPD0gOSkge1xyXG4gICAgaW5wdXQud29yZHNbMF0gPSAwO1xyXG4gICAgaW5wdXQubGVuZ3RoID0gMTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIFNoaWZ0IGJ5IDkgbGltYnNcclxuICB2YXIgcHJldiA9IGlucHV0LndvcmRzWzldO1xyXG4gIG91dHB1dC53b3Jkc1tvdXRwdXQubGVuZ3RoKytdID0gcHJldiAmIG1hc2s7XHJcblxyXG4gIGZvciAodmFyIGkgPSAxMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgbmV4dCA9IGlucHV0LndvcmRzW2ldO1xyXG4gICAgaW5wdXQud29yZHNbaSAtIDEwXSA9ICgobmV4dCAmIG1hc2spIDw8IDQpIHwgKHByZXYgPj4+IDIyKTtcclxuICAgIHByZXYgPSBuZXh0O1xyXG4gIH1cclxuICBpbnB1dC53b3Jkc1tpIC0gMTBdID0gcHJldiA+Pj4gMjI7XHJcbiAgaW5wdXQubGVuZ3RoIC09IDk7XHJcbn07XHJcblxyXG5LMjU2LnByb3RvdHlwZS5pbXVsSyA9IGZ1bmN0aW9uIGltdWxLKG51bSkge1xyXG4gIC8vIEsgPSAweDEwMDAwMDNkMSA9IFsgMHg0MCwgMHgzZDEgXVxyXG4gIG51bS53b3Jkc1tudW0ubGVuZ3RoXSA9IDA7XHJcbiAgbnVtLndvcmRzW251bS5sZW5ndGggKyAxXSA9IDA7XHJcbiAgbnVtLmxlbmd0aCArPSAyO1xyXG5cclxuICAvLyBib3VuZGVkIGF0OiAweDQwICogMHgzZmZmZmZmICsgMHgzZDAgPSAweDEwMDAwMDM5MFxyXG4gIHZhciBoaTtcclxuICB2YXIgbG8gPSAwO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgdyA9IG51bS53b3Jkc1tpXTtcclxuICAgIGhpID0gdyAqIDB4NDA7XHJcbiAgICBsbyArPSB3ICogMHgzZDE7XHJcbiAgICBoaSArPSAobG8gLyAweDQwMDAwMDApIHwgMDtcclxuICAgIGxvICY9IDB4M2ZmZmZmZjtcclxuXHJcbiAgICBudW0ud29yZHNbaV0gPSBsbztcclxuXHJcbiAgICBsbyA9IGhpO1xyXG4gIH1cclxuXHJcbiAgLy8gRmFzdCBsZW5ndGggcmVkdWN0aW9uXHJcbiAgaWYgKG51bS53b3Jkc1tudW0ubGVuZ3RoIC0gMV0gPT09IDApIHtcclxuICAgIG51bS5sZW5ndGgtLTtcclxuICAgIGlmIChudW0ud29yZHNbbnVtLmxlbmd0aCAtIDFdID09PSAwKVxyXG4gICAgICBudW0ubGVuZ3RoLS07XHJcbiAgfVxyXG4gIHJldHVybiBudW07XHJcbn07XHJcblxyXG5mdW5jdGlvbiBQMjI0KCkge1xyXG4gIE1QcmltZS5jYWxsKFxyXG4gICAgdGhpcyxcclxuICAgICdwMjI0JyxcclxuICAgICdmZmZmZmZmZiBmZmZmZmZmZiBmZmZmZmZmZiBmZmZmZmZmZiAwMDAwMDAwMCAwMDAwMDAwMCAwMDAwMDAwMScpO1xyXG59XHJcbmluaGVyaXRzKFAyMjQsIE1QcmltZSk7XHJcblxyXG5mdW5jdGlvbiBQMTkyKCkge1xyXG4gIE1QcmltZS5jYWxsKFxyXG4gICAgdGhpcyxcclxuICAgICdwMTkyJyxcclxuICAgICdmZmZmZmZmZiBmZmZmZmZmZiBmZmZmZmZmZiBmZmZmZmZmZSBmZmZmZmZmZiBmZmZmZmZmZicpO1xyXG59XHJcbmluaGVyaXRzKFAxOTIsIE1QcmltZSk7XHJcblxyXG5mdW5jdGlvbiBQMjU1MTkoKSB7XHJcbiAgLy8gMiBeIDI1NSAtIDE5XHJcbiAgTVByaW1lLmNhbGwoXHJcbiAgICB0aGlzLFxyXG4gICAgJzI1NTE5JyxcclxuICAgICc3ZmZmZmZmZmZmZmZmZmZmIGZmZmZmZmZmZmZmZmZmZmYgZmZmZmZmZmZmZmZmZmZmZiBmZmZmZmZmZmZmZmZmZmVkJyk7XHJcbn1cclxuaW5oZXJpdHMoUDI1NTE5LCBNUHJpbWUpO1xyXG5cclxuUDI1NTE5LnByb3RvdHlwZS5pbXVsSyA9IGZ1bmN0aW9uIGltdWxLKG51bSkge1xyXG4gIC8vIEsgPSAweDEzXHJcbiAgdmFyIGNhcnJ5ID0gMDtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bS5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGhpID0gbnVtLndvcmRzW2ldICogMHgxMyArIGNhcnJ5O1xyXG4gICAgdmFyIGxvID0gaGkgJiAweDNmZmZmZmY7XHJcbiAgICBoaSA+Pj49IDI2O1xyXG5cclxuICAgIG51bS53b3Jkc1tpXSA9IGxvO1xyXG4gICAgY2FycnkgPSBoaTtcclxuICB9XHJcbiAgaWYgKGNhcnJ5ICE9PSAwKVxyXG4gICAgbnVtLndvcmRzW251bS5sZW5ndGgrK10gPSBjYXJyeTtcclxuICByZXR1cm4gbnVtO1xyXG59O1xyXG5cclxuLy8gRXhwb3J0ZWQgbW9zdGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzLCB1c2UgcGxhaW4gbmFtZSBpbnN0ZWFkXHJcbkJOLl9wcmltZSA9IGZ1bmN0aW9uIHByaW1lKG5hbWUpIHtcclxuICAvLyBDYWNoZWQgdmVyc2lvbiBvZiBwcmltZVxyXG4gIGlmIChwcmltZXNbbmFtZV0pXHJcbiAgICByZXR1cm4gcHJpbWVzW25hbWVdO1xyXG5cclxuICB2YXIgcHJpbWU7XHJcbiAgaWYgKG5hbWUgPT09ICdrMjU2JylcclxuICAgIHByaW1lID0gbmV3IEsyNTYoKTtcclxuICBlbHNlIGlmIChuYW1lID09PSAncDIyNCcpXHJcbiAgICBwcmltZSA9IG5ldyBQMjI0KCk7XHJcbiAgZWxzZSBpZiAobmFtZSA9PT0gJ3AxOTInKVxyXG4gICAgcHJpbWUgPSBuZXcgUDE5MigpO1xyXG4gIGVsc2UgaWYgKG5hbWUgPT09ICdwMjU1MTknKVxyXG4gICAgcHJpbWUgPSBuZXcgUDI1NTE5KCk7XHJcbiAgZWxzZVxyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHByaW1lICcgKyBuYW1lKTtcclxuICBwcmltZXNbbmFtZV0gPSBwcmltZTtcclxuXHJcbiAgcmV0dXJuIHByaW1lO1xyXG59O1xyXG5cclxuLy9cclxuLy8gQmFzZSByZWR1Y3Rpb24gZW5naW5lXHJcbi8vXHJcbmZ1bmN0aW9uIFJlZChtKSB7XHJcbiAgaWYgKHR5cGVvZiBtID09PSAnc3RyaW5nJykge1xyXG4gICAgdmFyIHByaW1lID0gQk4uX3ByaW1lKG0pO1xyXG4gICAgdGhpcy5tID0gcHJpbWUucDtcclxuICAgIHRoaXMucHJpbWUgPSBwcmltZTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5tID0gbTtcclxuICAgIHRoaXMucHJpbWUgPSBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuUmVkLnByb3RvdHlwZS5fdmVyaWZ5MSA9IGZ1bmN0aW9uIF92ZXJpZnkxKGEpIHtcclxuICBhc3NlcnQoIWEuc2lnbiwgJ3JlZCB3b3JrcyBvbmx5IHdpdGggcG9zaXRpdmVzJyk7XHJcbiAgYXNzZXJ0KGEucmVkLCAncmVkIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xyXG59O1xyXG5cclxuUmVkLnByb3RvdHlwZS5fdmVyaWZ5MiA9IGZ1bmN0aW9uIF92ZXJpZnkyKGEsIGIpIHtcclxuICBhc3NlcnQoIWEuc2lnbiAmJiAhYi5zaWduLCAncmVkIHdvcmtzIG9ubHkgd2l0aCBwb3NpdGl2ZXMnKTtcclxuICBhc3NlcnQoYS5yZWQgJiYgYS5yZWQgPT09IGIucmVkLFxyXG4gICAgICAgICAncmVkIHdvcmtzIG9ubHkgd2l0aCByZWQgbnVtYmVycycpO1xyXG59O1xyXG5cclxuUmVkLnByb3RvdHlwZS5pbW9kID0gZnVuY3Rpb24gaW1vZChhKSB7XHJcbiAgaWYgKHRoaXMucHJpbWUpXHJcbiAgICByZXR1cm4gdGhpcy5wcmltZS5pcmVkdWNlKGEpLl9mb3JjZVJlZCh0aGlzKTtcclxuICByZXR1cm4gYS5tb2QodGhpcy5tKS5fZm9yY2VSZWQodGhpcyk7XHJcbn07XHJcblxyXG5SZWQucHJvdG90eXBlLm5lZyA9IGZ1bmN0aW9uIG5lZyhhKSB7XHJcbiAgdmFyIHIgPSBhLmNsb25lKCk7XHJcbiAgci5zaWduID0gIXIuc2lnbjtcclxuICByZXR1cm4gci5pYWRkKHRoaXMubSkuX2ZvcmNlUmVkKHRoaXMpO1xyXG59O1xyXG5cclxuUmVkLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBhZGQoYSwgYikge1xyXG4gIHRoaXMuX3ZlcmlmeTIoYSwgYik7XHJcblxyXG4gIHZhciByZXMgPSBhLmFkZChiKTtcclxuICBpZiAocmVzLmNtcCh0aGlzLm0pID49IDApXHJcbiAgICByZXMuaXN1Yih0aGlzLm0pO1xyXG4gIHJldHVybiByZXMuX2ZvcmNlUmVkKHRoaXMpO1xyXG59O1xyXG5cclxuUmVkLnByb3RvdHlwZS5pYWRkID0gZnVuY3Rpb24gaWFkZChhLCBiKSB7XHJcbiAgdGhpcy5fdmVyaWZ5MihhLCBiKTtcclxuXHJcbiAgdmFyIHJlcyA9IGEuaWFkZChiKTtcclxuICBpZiAocmVzLmNtcCh0aGlzLm0pID49IDApXHJcbiAgICByZXMuaXN1Yih0aGlzLm0pO1xyXG4gIHJldHVybiByZXM7XHJcbn07XHJcblxyXG5SZWQucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uIHN1YihhLCBiKSB7XHJcbiAgdGhpcy5fdmVyaWZ5MihhLCBiKTtcclxuXHJcbiAgdmFyIHJlcyA9IGEuc3ViKGIpO1xyXG4gIGlmIChyZXMuY21wbigwKSA8IDApXHJcbiAgICByZXMuaWFkZCh0aGlzLm0pO1xyXG4gIHJldHVybiByZXMuX2ZvcmNlUmVkKHRoaXMpO1xyXG59O1xyXG5cclxuUmVkLnByb3RvdHlwZS5pc3ViID0gZnVuY3Rpb24gaXN1YihhLCBiKSB7XHJcbiAgdGhpcy5fdmVyaWZ5MihhLCBiKTtcclxuXHJcbiAgdmFyIHJlcyA9IGEuaXN1YihiKTtcclxuICBpZiAocmVzLmNtcG4oMCkgPCAwKVxyXG4gICAgcmVzLmlhZGQodGhpcy5tKTtcclxuICByZXR1cm4gcmVzO1xyXG59O1xyXG5cclxuUmVkLnByb3RvdHlwZS5zaGwgPSBmdW5jdGlvbiBzaGwoYSwgbnVtKSB7XHJcbiAgdGhpcy5fdmVyaWZ5MShhKTtcclxuICByZXR1cm4gdGhpcy5pbW9kKGEuc2hsbihudW0pKTtcclxufTtcclxuXHJcblJlZC5wcm90b3R5cGUuaW11bCA9IGZ1bmN0aW9uIGltdWwoYSwgYikge1xyXG4gIHRoaXMuX3ZlcmlmeTIoYSwgYik7XHJcbiAgcmV0dXJuIHRoaXMuaW1vZChhLmltdWwoYikpO1xyXG59O1xyXG5cclxuUmVkLnByb3RvdHlwZS5tdWwgPSBmdW5jdGlvbiBtdWwoYSwgYikge1xyXG4gIHRoaXMuX3ZlcmlmeTIoYSwgYik7XHJcbiAgcmV0dXJuIHRoaXMuaW1vZChhLm11bChiKSk7XHJcbn07XHJcblxyXG5SZWQucHJvdG90eXBlLmlzcXIgPSBmdW5jdGlvbiBpc3FyKGEpIHtcclxuICByZXR1cm4gdGhpcy5pbXVsKGEsIGEpO1xyXG59O1xyXG5cclxuUmVkLnByb3RvdHlwZS5zcXIgPSBmdW5jdGlvbiBzcXIoYSkge1xyXG4gIHJldHVybiB0aGlzLm11bChhLCBhKTtcclxufTtcclxuXHJcblJlZC5wcm90b3R5cGUuc3FydCA9IGZ1bmN0aW9uIHNxcnQoYSkge1xyXG4gIGlmIChhLmNtcG4oMCkgPT09IDApXHJcbiAgICByZXR1cm4gYS5jbG9uZSgpO1xyXG5cclxuICB2YXIgbW9kMyA9IHRoaXMubS5hbmRsbigzKTtcclxuICBhc3NlcnQobW9kMyAlIDIgPT09IDEpO1xyXG5cclxuICAvLyBGYXN0IGNhc2VcclxuICBpZiAobW9kMyA9PT0gMykge1xyXG4gICAgdmFyIHBvdyA9IHRoaXMubS5hZGQobmV3IEJOKDEpKS5pc2hybigyKTtcclxuICAgIHZhciByID0gdGhpcy5wb3coYSwgcG93KTtcclxuICAgIHJldHVybiByO1xyXG4gIH1cclxuXHJcbiAgLy8gVG9uZWxsaS1TaGFua3MgYWxnb3JpdGhtIChUb3RhbGx5IHVub3B0aW1pemVkIGFuZCBzbG93KVxyXG4gIC8vXHJcbiAgLy8gRmluZCBRIGFuZCBTLCB0aGF0IFEgKiAyIF4gUyA9IChQIC0gMSlcclxuICB2YXIgcSA9IHRoaXMubS5zdWJuKDEpO1xyXG4gIHZhciBzID0gMDtcclxuICB3aGlsZSAocS5jbXBuKDApICE9PSAwICYmIHEuYW5kbG4oMSkgPT09IDApIHtcclxuICAgIHMrKztcclxuICAgIHEuaXNocm4oMSk7XHJcbiAgfVxyXG4gIGFzc2VydChxLmNtcG4oMCkgIT09IDApO1xyXG5cclxuICB2YXIgb25lID0gbmV3IEJOKDEpLnRvUmVkKHRoaXMpO1xyXG4gIHZhciBuT25lID0gb25lLnJlZE5lZygpO1xyXG5cclxuICAvLyBGaW5kIHF1YWRyYXRpYyBub24tcmVzaWR1ZVxyXG4gIC8vIE5PVEU6IE1heCBpcyBzdWNoIGJlY2F1c2Ugb2YgZ2VuZXJhbGl6ZWQgUmllbWFubiBoeXBvdGhlc2lzLlxyXG4gIHZhciBscG93ID0gdGhpcy5tLnN1Ym4oMSkuaXNocm4oMSk7XHJcbiAgdmFyIHogPSB0aGlzLm0uYml0TGVuZ3RoKCk7XHJcbiAgeiA9IG5ldyBCTigyICogeiAqIHopLnRvUmVkKHRoaXMpO1xyXG4gIHdoaWxlICh0aGlzLnBvdyh6LCBscG93KS5jbXAobk9uZSkgIT09IDApXHJcbiAgICB6LnJlZElBZGQobk9uZSk7XHJcblxyXG4gIHZhciBjID0gdGhpcy5wb3coeiwgcSk7XHJcbiAgdmFyIHIgPSB0aGlzLnBvdyhhLCBxLmFkZG4oMSkuaXNocm4oMSkpO1xyXG4gIHZhciB0ID0gdGhpcy5wb3coYSwgcSk7XHJcbiAgdmFyIG0gPSBzO1xyXG4gIHdoaWxlICh0LmNtcChvbmUpICE9PSAwKSB7XHJcbiAgICB2YXIgdG1wID0gdDtcclxuICAgIGZvciAodmFyIGkgPSAwOyB0bXAuY21wKG9uZSkgIT09IDA7IGkrKylcclxuICAgICAgdG1wID0gdG1wLnJlZFNxcigpO1xyXG4gICAgYXNzZXJ0KGkgPCBtKTtcclxuICAgIHZhciBiID0gdGhpcy5wb3coYywgbmV3IEJOKDEpLmlzaGxuKG0gLSBpIC0gMSkpO1xyXG5cclxuICAgIHIgPSByLnJlZE11bChiKTtcclxuICAgIGMgPSBiLnJlZFNxcigpO1xyXG4gICAgdCA9IHQucmVkTXVsKGMpO1xyXG4gICAgbSA9IGk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcjtcclxufTtcclxuXHJcblJlZC5wcm90b3R5cGUuaW52bSA9IGZ1bmN0aW9uIGludm0oYSkge1xyXG4gIHZhciBpbnYgPSBhLl9pbnZtcCh0aGlzLm0pO1xyXG4gIGlmIChpbnYuc2lnbikge1xyXG4gICAgaW52LnNpZ24gPSBmYWxzZTtcclxuICAgIHJldHVybiB0aGlzLmltb2QoaW52KS5yZWROZWcoKTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIHRoaXMuaW1vZChpbnYpO1xyXG4gIH1cclxufTtcclxuXHJcblJlZC5wcm90b3R5cGUucG93ID0gZnVuY3Rpb24gcG93KGEsIG51bSkge1xyXG4gIHZhciB3ID0gW107XHJcblxyXG4gIGlmIChudW0uY21wbigwKSA9PT0gMClcclxuICAgIHJldHVybiBuZXcgQk4oMSk7XHJcblxyXG4gIHZhciBxID0gbnVtLmNsb25lKCk7XHJcblxyXG4gIHdoaWxlIChxLmNtcG4oMCkgIT09IDApIHtcclxuICAgIHcucHVzaChxLmFuZGxuKDEpKTtcclxuICAgIHEuaXNocm4oMSk7XHJcbiAgfVxyXG5cclxuICAvLyBTa2lwIGxlYWRpbmcgemVyb2VzXHJcbiAgdmFyIHJlcyA9IGE7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB3Lmxlbmd0aDsgaSsrLCByZXMgPSB0aGlzLnNxcihyZXMpKVxyXG4gICAgaWYgKHdbaV0gIT09IDApXHJcbiAgICAgIGJyZWFrO1xyXG5cclxuICBpZiAoKytpIDwgdy5sZW5ndGgpIHtcclxuICAgIGZvciAodmFyIHEgPSB0aGlzLnNxcihyZXMpOyBpIDwgdy5sZW5ndGg7IGkrKywgcSA9IHRoaXMuc3FyKHEpKSB7XHJcbiAgICAgIGlmICh3W2ldID09PSAwKVxyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICByZXMgPSB0aGlzLm11bChyZXMsIHEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlcztcclxufTtcclxuXHJcblJlZC5wcm90b3R5cGUuY29udmVydFRvID0gZnVuY3Rpb24gY29udmVydFRvKG51bSkge1xyXG4gIHZhciByID0gbnVtLm1vZCh0aGlzLm0pO1xyXG4gIGlmIChyID09PSBudW0pXHJcbiAgICByZXR1cm4gci5jbG9uZSgpO1xyXG4gIGVsc2VcclxuICAgIHJldHVybiByO1xyXG59O1xyXG5cclxuUmVkLnByb3RvdHlwZS5jb252ZXJ0RnJvbSA9IGZ1bmN0aW9uIGNvbnZlcnRGcm9tKG51bSkge1xyXG4gIHZhciByZXMgPSBudW0uY2xvbmUoKTtcclxuICByZXMucmVkID0gbnVsbDtcclxuICByZXR1cm4gcmVzO1xyXG59O1xyXG5cclxuLy9cclxuLy8gTW9udGdvbWVyeSBtZXRob2QgZW5naW5lXHJcbi8vXHJcblxyXG5CTi5tb250ID0gZnVuY3Rpb24gbW9udChudW0pIHtcclxuICByZXR1cm4gbmV3IE1vbnQobnVtKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIE1vbnQobSkge1xyXG4gIFJlZC5jYWxsKHRoaXMsIG0pO1xyXG5cclxuICB0aGlzLnNoaWZ0ID0gdGhpcy5tLmJpdExlbmd0aCgpO1xyXG4gIGlmICh0aGlzLnNoaWZ0ICUgMjYgIT09IDApXHJcbiAgICB0aGlzLnNoaWZ0ICs9IDI2IC0gKHRoaXMuc2hpZnQgJSAyNik7XHJcbiAgdGhpcy5yID0gbmV3IEJOKDEpLmlzaGxuKHRoaXMuc2hpZnQpO1xyXG4gIHRoaXMucjIgPSB0aGlzLmltb2QodGhpcy5yLnNxcigpKTtcclxuICB0aGlzLnJpbnYgPSB0aGlzLnIuX2ludm1wKHRoaXMubSk7XHJcblxyXG4gIHRoaXMubWludiA9IHRoaXMucmludi5tdWwodGhpcy5yKS5pc3VibigxKS5kaXYodGhpcy5tKTtcclxuICB0aGlzLm1pbnYuc2lnbiA9IHRydWU7XHJcbiAgdGhpcy5taW52ID0gdGhpcy5taW52Lm1vZCh0aGlzLnIpO1xyXG59XHJcbmluaGVyaXRzKE1vbnQsIFJlZCk7XHJcblxyXG5Nb250LnByb3RvdHlwZS5jb252ZXJ0VG8gPSBmdW5jdGlvbiBjb252ZXJ0VG8obnVtKSB7XHJcbiAgcmV0dXJuIHRoaXMuaW1vZChudW0uc2hsbih0aGlzLnNoaWZ0KSk7XHJcbn07XHJcblxyXG5Nb250LnByb3RvdHlwZS5jb252ZXJ0RnJvbSA9IGZ1bmN0aW9uIGNvbnZlcnRGcm9tKG51bSkge1xyXG4gIHZhciByID0gdGhpcy5pbW9kKG51bS5tdWwodGhpcy5yaW52KSk7XHJcbiAgci5yZWQgPSBudWxsO1xyXG4gIHJldHVybiByO1xyXG59O1xyXG5cclxuTW9udC5wcm90b3R5cGUuaW11bCA9IGZ1bmN0aW9uIGltdWwoYSwgYikge1xyXG4gIGlmIChhLmNtcG4oMCkgPT09IDAgfHwgYi5jbXBuKDApID09PSAwKSB7XHJcbiAgICBhLndvcmRzWzBdID0gMDtcclxuICAgIGEubGVuZ3RoID0gMTtcclxuICAgIHJldHVybiBhO1xyXG4gIH1cclxuXHJcbiAgdmFyIHQgPSBhLmltdWwoYik7XHJcbiAgdmFyIGMgPSB0Lm1hc2tuKHRoaXMuc2hpZnQpLm11bCh0aGlzLm1pbnYpLmltYXNrbih0aGlzLnNoaWZ0KS5tdWwodGhpcy5tKTtcclxuICB2YXIgdSA9IHQuaXN1YihjKS5pc2hybih0aGlzLnNoaWZ0KTtcclxuICB2YXIgcmVzID0gdTtcclxuICBpZiAodS5jbXAodGhpcy5tKSA+PSAwKVxyXG4gICAgcmVzID0gdS5pc3ViKHRoaXMubSk7XHJcbiAgZWxzZSBpZiAodS5jbXBuKDApIDwgMClcclxuICAgIHJlcyA9IHUuaWFkZCh0aGlzLm0pO1xyXG5cclxuICByZXR1cm4gcmVzLl9mb3JjZVJlZCh0aGlzKTtcclxufTtcclxuXHJcbk1vbnQucHJvdG90eXBlLm11bCA9IGZ1bmN0aW9uIG11bChhLCBiKSB7XHJcbiAgaWYgKGEuY21wbigwKSA9PT0gMCB8fCBiLmNtcG4oMCkgPT09IDApXHJcbiAgICByZXR1cm4gbmV3IEJOKDApLl9mb3JjZVJlZCh0aGlzKTtcclxuXHJcbiAgdmFyIHQgPSBhLm11bChiKTtcclxuICB2YXIgYyA9IHQubWFza24odGhpcy5zaGlmdCkubXVsKHRoaXMubWludikuaW1hc2tuKHRoaXMuc2hpZnQpLm11bCh0aGlzLm0pO1xyXG4gIHZhciB1ID0gdC5pc3ViKGMpLmlzaHJuKHRoaXMuc2hpZnQpO1xyXG4gIHZhciByZXMgPSB1O1xyXG4gIGlmICh1LmNtcCh0aGlzLm0pID49IDApXHJcbiAgICByZXMgPSB1LmlzdWIodGhpcy5tKTtcclxuICBlbHNlIGlmICh1LmNtcG4oMCkgPCAwKVxyXG4gICAgcmVzID0gdS5pYWRkKHRoaXMubSk7XHJcblxyXG4gIHJldHVybiByZXMuX2ZvcmNlUmVkKHRoaXMpO1xyXG59O1xyXG5cclxuTW9udC5wcm90b3R5cGUuaW52bSA9IGZ1bmN0aW9uIGludm0oYSkge1xyXG4gIC8vIChBUileLTEgKiBSXjIgPSAoQV4tMSAqIFJeLTEpICogUl4yID0gQV4tMSAqIFJcclxuICB2YXIgcmVzID0gdGhpcy5pbW9kKGEuX2ludm1wKHRoaXMubSkubXVsKHRoaXMucjIpKTtcclxuICByZXR1cm4gcmVzLl9mb3JjZVJlZCh0aGlzKTtcclxufTtcclxuXHJcbn0pKHR5cGVvZiBtb2R1bGUgPT09ICd1bmRlZmluZWQnIHx8IG1vZHVsZSwgdGhpcyk7XHJcbiIsInZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcclxuXHJcbmV4cG9ydHMudGFnQ2xhc3MgPSB7XHJcbiAgMDogJ3VuaXZlcnNhbCcsXHJcbiAgMTogJ2FwcGxpY2F0aW9uJyxcclxuICAyOiAnY29udGV4dCcsXHJcbiAgMzogJ3ByaXZhdGUnXHJcbn07XHJcbmV4cG9ydHMudGFnQ2xhc3NCeU5hbWUgPSBjb25zdGFudHMuX3JldmVyc2UoZXhwb3J0cy50YWdDbGFzcyk7XHJcblxyXG5leHBvcnRzLnRhZyA9IHtcclxuICAweDAwOiAnZW5kJyxcclxuICAweDAxOiAnYm9vbCcsXHJcbiAgMHgwMjogJ2ludCcsXHJcbiAgMHgwMzogJ2JpdHN0cicsXHJcbiAgMHgwNDogJ29jdHN0cicsXHJcbiAgMHgwNTogJ251bGxfJyxcclxuICAweDA2OiAnb2JqaWQnLFxyXG4gIDB4MDc6ICdvYmpEZXNjJyxcclxuICAweDA4OiAnZXh0ZXJuYWwnLFxyXG4gIDB4MDk6ICdyZWFsJyxcclxuICAweDBhOiAnZW51bScsXHJcbiAgMHgwYjogJ2VtYmVkJyxcclxuICAweDBjOiAndXRmOHN0cicsXHJcbiAgMHgwZDogJ3JlbGF0aXZlT2lkJyxcclxuICAweDEwOiAnc2VxJyxcclxuICAweDExOiAnc2V0JyxcclxuICAweDEyOiAnbnVtc3RyJyxcclxuICAweDEzOiAncHJpbnRzdHInLFxyXG4gIDB4MTQ6ICd0NjFzdHInLFxyXG4gIDB4MTU6ICd2aWRlb3N0cicsXHJcbiAgMHgxNjogJ2lhNXN0cicsXHJcbiAgMHgxNzogJ3V0Y3RpbWUnLFxyXG4gIDB4MTg6ICdnZW50aW1lJyxcclxuICAweDE5OiAnZ3JhcGhzdHInLFxyXG4gIDB4MWE6ICdpc282NDZzdHInLFxyXG4gIDB4MWI6ICdnZW5zdHInLFxyXG4gIDB4MWM6ICd1bmlzdHInLFxyXG4gIDB4MWQ6ICdjaGFyc3RyJyxcclxuICAweDFlOiAnYm1wc3RyJ1xyXG59O1xyXG5leHBvcnRzLnRhZ0J5TmFtZSA9IGNvbnN0YW50cy5fcmV2ZXJzZShleHBvcnRzLnRhZyk7XHJcbiIsInZhciBjb25zdGFudHMgPSBleHBvcnRzO1xyXG5cclxuLy8gSGVscGVyXHJcbmNvbnN0YW50cy5fcmV2ZXJzZSA9IGZ1bmN0aW9uIHJldmVyc2UobWFwKSB7XHJcbiAgdmFyIHJlcyA9IHt9O1xyXG5cclxuICBPYmplY3Qua2V5cyhtYXApLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAvLyBDb252ZXJ0IGtleSB0byBpbnRlZ2VyIGlmIGl0IGlzIHN0cmluZ2lmaWVkXHJcbiAgICBpZiAoKGtleSB8IDApID09IGtleSlcclxuICAgICAga2V5ID0ga2V5IHwgMDtcclxuXHJcbiAgICB2YXIgdmFsdWUgPSBtYXBba2V5XTtcclxuICAgIHJlc1t2YWx1ZV0gPSBrZXk7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiByZXM7XHJcbn07XHJcblxyXG5jb25zdGFudHMuZGVyID0gcmVxdWlyZSgnLi9kZXInKTtcclxuIiwidmFyIGluaGVyaXRzID0gcmVxdWlyZSgndXRpbCcpLmluaGVyaXRzO1xyXG5cclxudmFyIGFzbjEgPSByZXF1aXJlKCcuLi9hc24xJyk7XHJcbnZhciBiYXNlID0gYXNuMS5iYXNlO1xyXG52YXIgYmlnbnVtID0gYXNuMS5iaWdudW07XHJcblxyXG4vLyBJbXBvcnQgREVSIGNvbnN0YW50c1xyXG52YXIgZGVyID0gYXNuMS5jb25zdGFudHMuZGVyO1xyXG5cclxuZnVuY3Rpb24gREVSRGVjb2RlcihlbnRpdHkpIHtcclxuICB0aGlzLmVuYyA9ICdkZXInO1xyXG4gIHRoaXMubmFtZSA9IGVudGl0eS5uYW1lO1xyXG4gIHRoaXMuZW50aXR5ID0gZW50aXR5O1xyXG5cclxuICAvLyBDb25zdHJ1Y3QgYmFzZSB0cmVlXHJcbiAgdGhpcy50cmVlID0gbmV3IERFUk5vZGUoKTtcclxuICB0aGlzLnRyZWUuX2luaXQoZW50aXR5LmJvZHkpO1xyXG59O1xyXG5tb2R1bGUuZXhwb3J0cyA9IERFUkRlY29kZXI7XHJcblxyXG5ERVJEZWNvZGVyLnByb3RvdHlwZS5kZWNvZGUgPSBmdW5jdGlvbiBkZWNvZGUoZGF0YSwgb3B0aW9ucykge1xyXG4gIGlmICghKGRhdGEgaW5zdGFuY2VvZiBiYXNlLkRlY29kZXJCdWZmZXIpKVxyXG4gICAgZGF0YSA9IG5ldyBiYXNlLkRlY29kZXJCdWZmZXIoZGF0YSwgb3B0aW9ucyk7XHJcblxyXG4gIHJldHVybiB0aGlzLnRyZWUuX2RlY29kZShkYXRhLCBvcHRpb25zKTtcclxufTtcclxuXHJcbi8vIFRyZWUgbWV0aG9kc1xyXG5cclxuZnVuY3Rpb24gREVSTm9kZShwYXJlbnQpIHtcclxuICBiYXNlLk5vZGUuY2FsbCh0aGlzLCAnZGVyJywgcGFyZW50KTtcclxufVxyXG5pbmhlcml0cyhERVJOb2RlLCBiYXNlLk5vZGUpO1xyXG5cclxuREVSTm9kZS5wcm90b3R5cGUuX3BlZWtUYWcgPSBmdW5jdGlvbiBwZWVrVGFnKGJ1ZmZlciwgdGFnLCBhbnkpIHtcclxuICBpZiAoYnVmZmVyLmlzRW1wdHkoKSlcclxuICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgdmFyIHN0YXRlID0gYnVmZmVyLnNhdmUoKTtcclxuICB2YXIgZGVjb2RlZFRhZyA9IGRlckRlY29kZVRhZyhidWZmZXIsICdGYWlsZWQgdG8gcGVlayB0YWc6IFwiJyArIHRhZyArICdcIicpO1xyXG4gIGlmIChidWZmZXIuaXNFcnJvcihkZWNvZGVkVGFnKSlcclxuICAgIHJldHVybiBkZWNvZGVkVGFnO1xyXG5cclxuICBidWZmZXIucmVzdG9yZShzdGF0ZSk7XHJcblxyXG4gIHJldHVybiBkZWNvZGVkVGFnLnRhZyA9PT0gdGFnIHx8IGRlY29kZWRUYWcudGFnU3RyID09PSB0YWcgfHwgYW55O1xyXG59O1xyXG5cclxuREVSTm9kZS5wcm90b3R5cGUuX2RlY29kZVRhZyA9IGZ1bmN0aW9uIGRlY29kZVRhZyhidWZmZXIsIHRhZywgYW55KSB7XHJcbiAgdmFyIGRlY29kZWRUYWcgPSBkZXJEZWNvZGVUYWcoYnVmZmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gZGVjb2RlIHRhZyBvZiBcIicgKyB0YWcgKyAnXCInKTtcclxuICBpZiAoYnVmZmVyLmlzRXJyb3IoZGVjb2RlZFRhZykpXHJcbiAgICByZXR1cm4gZGVjb2RlZFRhZztcclxuXHJcbiAgdmFyIGxlbiA9IGRlckRlY29kZUxlbihidWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBkZWNvZGVkVGFnLnByaW1pdGl2ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gZ2V0IGxlbmd0aCBvZiBcIicgKyB0YWcgKyAnXCInKTtcclxuXHJcbiAgLy8gRmFpbHVyZVxyXG4gIGlmIChidWZmZXIuaXNFcnJvcihsZW4pKVxyXG4gICAgcmV0dXJuIGxlbjtcclxuXHJcbiAgaWYgKCFhbnkgJiZcclxuICAgICAgZGVjb2RlZFRhZy50YWcgIT09IHRhZyAmJlxyXG4gICAgICBkZWNvZGVkVGFnLnRhZ1N0ciAhPT0gdGFnICYmXHJcbiAgICAgIGRlY29kZWRUYWcudGFnU3RyICsgJ29mJyAhPT0gdGFnKSB7XHJcbiAgICByZXR1cm4gYnVmZmVyLmVycm9yKCdGYWlsZWQgdG8gbWF0Y2ggdGFnOiBcIicgKyB0YWcgKyAnXCInKTtcclxuICB9XHJcblxyXG4gIGlmIChkZWNvZGVkVGFnLnByaW1pdGl2ZSB8fCBsZW4gIT09IG51bGwpXHJcbiAgICByZXR1cm4gYnVmZmVyLnNraXAobGVuLCAnRmFpbGVkIHRvIG1hdGNoIGJvZHkgb2Y6IFwiJyArIHRhZyArICdcIicpO1xyXG5cclxuICAvLyBJbmRlZmluaXRlIGxlbmd0aC4uLiBmaW5kIEVORCB0YWdcclxuICB2YXIgc3RhdGUgPSBidWZmZXIuc2F2ZSgpO1xyXG4gIHZhciByZXMgPSB0aGlzLl9za2lwVW50aWxFbmQoXHJcbiAgICAgIGJ1ZmZlcixcclxuICAgICAgJ0ZhaWxlZCB0byBza2lwIGluZGVmaW5pdGUgbGVuZ3RoIGJvZHk6IFwiJyArIHRoaXMudGFnICsgJ1wiJyk7XHJcbiAgaWYgKGJ1ZmZlci5pc0Vycm9yKHJlcykpXHJcbiAgICByZXR1cm4gcmVzO1xyXG5cclxuICBsZW4gPSBidWZmZXIub2Zmc2V0IC0gc3RhdGUub2Zmc2V0O1xyXG4gIGJ1ZmZlci5yZXN0b3JlKHN0YXRlKTtcclxuICByZXR1cm4gYnVmZmVyLnNraXAobGVuLCAnRmFpbGVkIHRvIG1hdGNoIGJvZHkgb2Y6IFwiJyArIHRhZyArICdcIicpO1xyXG59O1xyXG5cclxuREVSTm9kZS5wcm90b3R5cGUuX3NraXBVbnRpbEVuZCA9IGZ1bmN0aW9uIHNraXBVbnRpbEVuZChidWZmZXIsIGZhaWwpIHtcclxuICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgdmFyIHRhZyA9IGRlckRlY29kZVRhZyhidWZmZXIsIGZhaWwpO1xyXG4gICAgaWYgKGJ1ZmZlci5pc0Vycm9yKHRhZykpXHJcbiAgICAgIHJldHVybiB0YWc7XHJcbiAgICB2YXIgbGVuID0gZGVyRGVjb2RlTGVuKGJ1ZmZlciwgdGFnLnByaW1pdGl2ZSwgZmFpbCk7XHJcbiAgICBpZiAoYnVmZmVyLmlzRXJyb3IobGVuKSlcclxuICAgICAgcmV0dXJuIGxlbjtcclxuXHJcbiAgICB2YXIgcmVzO1xyXG4gICAgaWYgKHRhZy5wcmltaXRpdmUgfHwgbGVuICE9PSBudWxsKVxyXG4gICAgICByZXMgPSBidWZmZXIuc2tpcChsZW4pXHJcbiAgICBlbHNlXHJcbiAgICAgIHJlcyA9IHRoaXMuX3NraXBVbnRpbEVuZChidWZmZXIsIGZhaWwpO1xyXG5cclxuICAgIC8vIEZhaWx1cmVcclxuICAgIGlmIChidWZmZXIuaXNFcnJvcihyZXMpKVxyXG4gICAgICByZXR1cm4gcmVzO1xyXG5cclxuICAgIGlmICh0YWcudGFnU3RyID09PSAnZW5kJylcclxuICAgICAgYnJlYWs7XHJcbiAgfVxyXG59O1xyXG5cclxuREVSTm9kZS5wcm90b3R5cGUuX2RlY29kZUxpc3QgPSBmdW5jdGlvbiBkZWNvZGVMaXN0KGJ1ZmZlciwgdGFnLCBkZWNvZGVyKSB7XHJcbiAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gIHdoaWxlICghYnVmZmVyLmlzRW1wdHkoKSkge1xyXG4gICAgdmFyIHBvc3NpYmxlRW5kID0gdGhpcy5fcGVla1RhZyhidWZmZXIsICdlbmQnKTtcclxuICAgIGlmIChidWZmZXIuaXNFcnJvcihwb3NzaWJsZUVuZCkpXHJcbiAgICAgIHJldHVybiBwb3NzaWJsZUVuZDtcclxuXHJcbiAgICB2YXIgcmVzID0gZGVjb2Rlci5kZWNvZGUoYnVmZmVyLCAnZGVyJyk7XHJcbiAgICBpZiAoYnVmZmVyLmlzRXJyb3IocmVzKSAmJiBwb3NzaWJsZUVuZClcclxuICAgICAgYnJlYWs7XHJcbiAgICByZXN1bHQucHVzaChyZXMpO1xyXG4gIH1cclxuICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuREVSTm9kZS5wcm90b3R5cGUuX2RlY29kZVN0ciA9IGZ1bmN0aW9uIGRlY29kZVN0cihidWZmZXIsIHRhZykge1xyXG4gIGlmICh0YWcgPT09ICdvY3RzdHInKSB7XHJcbiAgICByZXR1cm4gYnVmZmVyLnJhdygpO1xyXG4gIH0gZWxzZSBpZiAodGFnID09PSAnYml0c3RyJykge1xyXG4gICAgdmFyIHVudXNlZCA9IGJ1ZmZlci5yZWFkVUludDgoKTtcclxuICAgIGlmIChidWZmZXIuaXNFcnJvcih1bnVzZWQpKVxyXG4gICAgICByZXR1cm4gdW51c2VkO1xyXG5cclxuICAgIHJldHVybiB7IHVudXNlZDogdW51c2VkLCBkYXRhOiBidWZmZXIucmF3KCkgfTtcclxuICB9IGVsc2UgaWYgKHRhZyA9PT0gJ2lhNXN0cicgfHwgdGFnID09PSAndXRmOHN0cicpIHtcclxuICAgIHJldHVybiBidWZmZXIucmF3KCkudG9TdHJpbmcoKTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIHRoaXMuZXJyb3IoJ0RlY29kaW5nIG9mIHN0cmluZyB0eXBlOiAnICsgdGFnICsgJyB1bnN1cHBvcnRlZCcpO1xyXG4gIH1cclxufTtcclxuXHJcbkRFUk5vZGUucHJvdG90eXBlLl9kZWNvZGVPYmppZCA9IGZ1bmN0aW9uIGRlY29kZU9iamlkKGJ1ZmZlciwgdmFsdWVzLCByZWxhdGl2ZSkge1xyXG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xyXG4gIHZhciBpZGVudCA9IDA7XHJcbiAgd2hpbGUgKCFidWZmZXIuaXNFbXB0eSgpKSB7XHJcbiAgICB2YXIgc3ViaWRlbnQgPSBidWZmZXIucmVhZFVJbnQ4KCk7XHJcbiAgICBpZGVudCA8PD0gNztcclxuICAgIGlkZW50IHw9IHN1YmlkZW50ICYgMHg3ZjtcclxuICAgIGlmICgoc3ViaWRlbnQgJiAweDgwKSA9PT0gMCkge1xyXG4gICAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50KTtcclxuICAgICAgaWRlbnQgPSAwO1xyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoc3ViaWRlbnQgJiAweDgwKVxyXG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudCk7XHJcblxyXG4gIHZhciBmaXJzdCA9IChpZGVudGlmaWVyc1swXSAvIDQwKSB8IDA7XHJcbiAgdmFyIHNlY29uZCA9IGlkZW50aWZpZXJzWzBdICUgNDA7XHJcblxyXG4gIGlmIChyZWxhdGl2ZSlcclxuICAgIHJlc3VsdCA9IGlkZW50aWZpZXJzO1xyXG4gIGVsc2VcclxuICAgIHJlc3VsdCA9IFtmaXJzdCwgc2Vjb25kXS5jb25jYXQoaWRlbnRpZmllcnMuc2xpY2UoMSkpO1xyXG5cclxuICBpZiAodmFsdWVzKVxyXG4gICAgcmVzdWx0ID0gdmFsdWVzW3Jlc3VsdC5qb2luKCcgJyldO1xyXG5cclxuICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuREVSTm9kZS5wcm90b3R5cGUuX2RlY29kZVRpbWUgPSBmdW5jdGlvbiBkZWNvZGVUaW1lKGJ1ZmZlciwgdGFnKSB7XHJcbiAgdmFyIHN0ciA9IGJ1ZmZlci5yYXcoKS50b1N0cmluZygpO1xyXG4gIGlmICh0YWcgPT09ICdnZW50aW1lJykge1xyXG4gICAgdmFyIHllYXIgPSBzdHIuc2xpY2UoMCwgNCkgfCAwO1xyXG4gICAgdmFyIG1vbiA9IHN0ci5zbGljZSg0LCA2KSB8IDA7XHJcbiAgICB2YXIgZGF5ID0gc3RyLnNsaWNlKDYsIDgpIHwgMDtcclxuICAgIHZhciBob3VyID0gc3RyLnNsaWNlKDgsIDEwKSB8IDA7XHJcbiAgICB2YXIgbWluID0gc3RyLnNsaWNlKDEwLCAxMikgfCAwO1xyXG4gICAgdmFyIHNlYyA9IHN0ci5zbGljZSgxMiwgMTQpIHwgMDtcclxuICB9IGVsc2UgaWYgKHRhZyA9PT0gJ3V0Y3RpbWUnKSB7XHJcbiAgICB2YXIgeWVhciA9IHN0ci5zbGljZSgwLCAyKSB8IDA7XHJcbiAgICB2YXIgbW9uID0gc3RyLnNsaWNlKDIsIDQpIHwgMDtcclxuICAgIHZhciBkYXkgPSBzdHIuc2xpY2UoNCwgNikgfCAwO1xyXG4gICAgdmFyIGhvdXIgPSBzdHIuc2xpY2UoNiwgOCkgfCAwO1xyXG4gICAgdmFyIG1pbiA9IHN0ci5zbGljZSg4LCAxMCkgfCAwO1xyXG4gICAgdmFyIHNlYyA9IHN0ci5zbGljZSgxMCwgMTIpIHwgMDtcclxuICAgIGlmICh5ZWFyIDwgNzApXHJcbiAgICAgIHllYXIgPSAyMDAwICsgeWVhcjtcclxuICAgIGVsc2VcclxuICAgICAgeWVhciA9IDE5MDAgKyB5ZWFyO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gdGhpcy5lcnJvcignRGVjb2RpbmcgJyArIHRhZyArICcgdGltZSBpcyBub3Qgc3VwcG9ydGVkIHlldCcpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIERhdGUuVVRDKHllYXIsIG1vbiAtIDEsIGRheSwgaG91ciwgbWluLCBzZWMsIDApO1xyXG59O1xyXG5cclxuREVSTm9kZS5wcm90b3R5cGUuX2RlY29kZU51bGwgPSBmdW5jdGlvbiBkZWNvZGVOdWxsKGJ1ZmZlcikge1xyXG4gIHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuREVSTm9kZS5wcm90b3R5cGUuX2RlY29kZUJvb2wgPSBmdW5jdGlvbiBkZWNvZGVCb29sKGJ1ZmZlcikge1xyXG4gIHZhciByZXMgPSBidWZmZXIucmVhZFVJbnQ4KCk7XHJcbiAgaWYgKGJ1ZmZlci5pc0Vycm9yKHJlcykpXHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIGVsc2VcclxuICAgIHJldHVybiByZXMgIT09IDA7XHJcbn07XHJcblxyXG5ERVJOb2RlLnByb3RvdHlwZS5fZGVjb2RlSW50ID0gZnVuY3Rpb24gZGVjb2RlSW50KGJ1ZmZlciwgdmFsdWVzKSB7XHJcbiAgLy8gQmlnaW50LCByZXR1cm4gYXMgaXQgaXMgKGFzc3VtZSBiaWcgZW5kaWFuKVxyXG4gIHZhciByYXcgPSBidWZmZXIucmF3KCk7XHJcbiAgdmFyIHJlcyA9IG5ldyBiaWdudW0ocmF3KTtcclxuXHJcbiAgaWYgKHZhbHVlcylcclxuICAgIHJlcyA9IHZhbHVlc1tyZXMudG9TdHJpbmcoMTApXSB8fCByZXM7XHJcblxyXG4gIHJldHVybiByZXM7XHJcbn07XHJcblxyXG5ERVJOb2RlLnByb3RvdHlwZS5fdXNlID0gZnVuY3Rpb24gdXNlKGVudGl0eSwgb2JqKSB7XHJcbiAgaWYgKHR5cGVvZiBlbnRpdHkgPT09ICdmdW5jdGlvbicpXHJcbiAgICBlbnRpdHkgPSBlbnRpdHkob2JqKTtcclxuICByZXR1cm4gZW50aXR5Ll9nZXREZWNvZGVyKCdkZXInKS50cmVlO1xyXG59O1xyXG5cclxuLy8gVXRpbGl0eSBtZXRob2RzXHJcblxyXG5mdW5jdGlvbiBkZXJEZWNvZGVUYWcoYnVmLCBmYWlsKSB7XHJcbiAgdmFyIHRhZyA9IGJ1Zi5yZWFkVUludDgoZmFpbCk7XHJcbiAgaWYgKGJ1Zi5pc0Vycm9yKHRhZykpXHJcbiAgICByZXR1cm4gdGFnO1xyXG5cclxuICB2YXIgY2xzID0gZGVyLnRhZ0NsYXNzW3RhZyA+PiA2XTtcclxuICB2YXIgcHJpbWl0aXZlID0gKHRhZyAmIDB4MjApID09PSAwO1xyXG5cclxuICAvLyBNdWx0aS1vY3RldCB0YWcgLSBsb2FkXHJcbiAgaWYgKCh0YWcgJiAweDFmKSA9PT0gMHgxZikge1xyXG4gICAgdmFyIG9jdCA9IHRhZztcclxuICAgIHRhZyA9IDA7XHJcbiAgICB3aGlsZSAoKG9jdCAmIDB4ODApID09PSAweDgwKSB7XHJcbiAgICAgIG9jdCA9IGJ1Zi5yZWFkVUludDgoZmFpbCk7XHJcbiAgICAgIGlmIChidWYuaXNFcnJvcihvY3QpKVxyXG4gICAgICAgIHJldHVybiBvY3Q7XHJcblxyXG4gICAgICB0YWcgPDw9IDc7XHJcbiAgICAgIHRhZyB8PSBvY3QgJiAweDdmO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICB0YWcgJj0gMHgxZjtcclxuICB9XHJcbiAgdmFyIHRhZ1N0ciA9IGRlci50YWdbdGFnXTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGNsczogY2xzLFxyXG4gICAgcHJpbWl0aXZlOiBwcmltaXRpdmUsXHJcbiAgICB0YWc6IHRhZyxcclxuICAgIHRhZ1N0cjogdGFnU3RyXHJcbiAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGVyRGVjb2RlTGVuKGJ1ZiwgcHJpbWl0aXZlLCBmYWlsKSB7XHJcbiAgdmFyIGxlbiA9IGJ1Zi5yZWFkVUludDgoZmFpbCk7XHJcbiAgaWYgKGJ1Zi5pc0Vycm9yKGxlbikpXHJcbiAgICByZXR1cm4gbGVuO1xyXG5cclxuICAvLyBJbmRlZmluaXRlIGZvcm1cclxuICBpZiAoIXByaW1pdGl2ZSAmJiBsZW4gPT09IDB4ODApXHJcbiAgICByZXR1cm4gbnVsbDtcclxuXHJcbiAgLy8gRGVmaW5pdGUgZm9ybVxyXG4gIGlmICgobGVuICYgMHg4MCkgPT09IDApIHtcclxuICAgIC8vIFNob3J0IGZvcm1cclxuICAgIHJldHVybiBsZW47XHJcbiAgfVxyXG5cclxuICAvLyBMb25nIGZvcm1cclxuICB2YXIgbnVtID0gbGVuICYgMHg3ZjtcclxuICBpZiAobnVtID49IDQpXHJcbiAgICByZXR1cm4gYnVmLmVycm9yKCdsZW5ndGggb2N0ZWN0IGlzIHRvbyBsb25nJyk7XHJcblxyXG4gIGxlbiA9IDA7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW07IGkrKykge1xyXG4gICAgbGVuIDw8PSA4O1xyXG4gICAgdmFyIGogPSBidWYucmVhZFVJbnQ4KGZhaWwpO1xyXG4gICAgaWYgKGJ1Zi5pc0Vycm9yKGopKVxyXG4gICAgICByZXR1cm4gajtcclxuICAgIGxlbiB8PSBqO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGxlbjtcclxufVxyXG4iLCJ2YXIgZGVjb2RlcnMgPSBleHBvcnRzO1xyXG5cclxuZGVjb2RlcnMuZGVyID0gcmVxdWlyZSgnLi9kZXInKTtcclxuZGVjb2RlcnMucGVtID0gcmVxdWlyZSgnLi9wZW0nKTtcclxuIiwidmFyIGluaGVyaXRzID0gcmVxdWlyZSgndXRpbCcpLmluaGVyaXRzO1xyXG52YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xyXG5cclxudmFyIGFzbjEgPSByZXF1aXJlKCcuLi9hc24xJyk7XHJcbnZhciBERVJEZWNvZGVyID0gcmVxdWlyZSgnLi9kZXInKTtcclxuXHJcbmZ1bmN0aW9uIFBFTURlY29kZXIoZW50aXR5KSB7XHJcbiAgREVSRGVjb2Rlci5jYWxsKHRoaXMsIGVudGl0eSk7XHJcbiAgdGhpcy5lbmMgPSAncGVtJztcclxufTtcclxuaW5oZXJpdHMoUEVNRGVjb2RlciwgREVSRGVjb2Rlcik7XHJcbm1vZHVsZS5leHBvcnRzID0gUEVNRGVjb2RlcjtcclxuXHJcblBFTURlY29kZXIucHJvdG90eXBlLmRlY29kZSA9IGZ1bmN0aW9uIGRlY29kZShkYXRhLCBvcHRpb25zKSB7XHJcbiAgdmFyIGxpbmVzID0gZGF0YS50b1N0cmluZygpLnNwbGl0KC9bXFxyXFxuXSsvZyk7XHJcblxyXG4gIHZhciBsYWJlbCA9IG9wdGlvbnMubGFiZWwudG9VcHBlckNhc2UoKTtcclxuXHJcbiAgdmFyIHJlID0gL14tLS0tLShCRUdJTnxFTkQpIChbXi1dKyktLS0tLSQvO1xyXG4gIHZhciBzdGFydCA9IC0xO1xyXG4gIHZhciBlbmQgPSAtMTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgbWF0Y2ggPSBsaW5lc1tpXS5tYXRjaChyZSk7XHJcbiAgICBpZiAobWF0Y2ggPT09IG51bGwpXHJcbiAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgIGlmIChtYXRjaFsyXSAhPT0gbGFiZWwpXHJcbiAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgIGlmIChzdGFydCA9PT0gLTEpIHtcclxuICAgICAgaWYgKG1hdGNoWzFdICE9PSAnQkVHSU4nKVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBzdGFydCA9IGk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAobWF0Y2hbMV0gIT09ICdFTkQnKVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBlbmQgPSBpO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgaWYgKHN0YXJ0ID09PSAtMSB8fCBlbmQgPT09IC0xKVxyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdQRU0gc2VjdGlvbiBub3QgZm91bmQgZm9yOiAnICsgbGFiZWwpO1xyXG5cclxuICB2YXIgYmFzZTY0ID0gbGluZXMuc2xpY2Uoc3RhcnQgKyAxLCBlbmQpLmpvaW4oJycpO1xyXG4gIC8vIFJlbW92ZSBleGNlc3NpdmUgc3ltYm9sc1xyXG4gIGJhc2U2NC5yZXBsYWNlKC9bXmEtejAtOVxcK1xcLz1dKy9naSwgJycpO1xyXG5cclxuICB2YXIgaW5wdXQgPSBuZXcgQnVmZmVyKGJhc2U2NCwgJ2Jhc2U2NCcpO1xyXG4gIHJldHVybiBERVJEZWNvZGVyLnByb3RvdHlwZS5kZWNvZGUuY2FsbCh0aGlzLCBpbnB1dCwgb3B0aW9ucyk7XHJcbn07XHJcbiIsInZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ3V0aWwnKS5pbmhlcml0cztcclxudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcclxuXHJcbnZhciBhc24xID0gcmVxdWlyZSgnLi4vYXNuMScpO1xyXG52YXIgYmFzZSA9IGFzbjEuYmFzZTtcclxudmFyIGJpZ251bSA9IGFzbjEuYmlnbnVtO1xyXG5cclxuLy8gSW1wb3J0IERFUiBjb25zdGFudHNcclxudmFyIGRlciA9IGFzbjEuY29uc3RhbnRzLmRlcjtcclxuXHJcbmZ1bmN0aW9uIERFUkVuY29kZXIoZW50aXR5KSB7XHJcbiAgdGhpcy5lbmMgPSAnZGVyJztcclxuICB0aGlzLm5hbWUgPSBlbnRpdHkubmFtZTtcclxuICB0aGlzLmVudGl0eSA9IGVudGl0eTtcclxuXHJcbiAgLy8gQ29uc3RydWN0IGJhc2UgdHJlZVxyXG4gIHRoaXMudHJlZSA9IG5ldyBERVJOb2RlKCk7XHJcbiAgdGhpcy50cmVlLl9pbml0KGVudGl0eS5ib2R5KTtcclxufTtcclxubW9kdWxlLmV4cG9ydHMgPSBERVJFbmNvZGVyO1xyXG5cclxuREVSRW5jb2Rlci5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24gZW5jb2RlKGRhdGEsIHJlcG9ydGVyKSB7XHJcbiAgcmV0dXJuIHRoaXMudHJlZS5fZW5jb2RlKGRhdGEsIHJlcG9ydGVyKS5qb2luKCk7XHJcbn07XHJcblxyXG4vLyBUcmVlIG1ldGhvZHNcclxuXHJcbmZ1bmN0aW9uIERFUk5vZGUocGFyZW50KSB7XHJcbiAgYmFzZS5Ob2RlLmNhbGwodGhpcywgJ2RlcicsIHBhcmVudCk7XHJcbn1cclxuaW5oZXJpdHMoREVSTm9kZSwgYmFzZS5Ob2RlKTtcclxuXHJcbkRFUk5vZGUucHJvdG90eXBlLl9lbmNvZGVDb21wb3NpdGUgPSBmdW5jdGlvbiBlbmNvZGVDb21wb3NpdGUodGFnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW1pdGl2ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudCkge1xyXG4gIHZhciBlbmNvZGVkVGFnID0gZW5jb2RlVGFnKHRhZywgcHJpbWl0aXZlLCBjbHMsIHRoaXMucmVwb3J0ZXIpO1xyXG5cclxuICAvLyBTaG9ydCBmb3JtXHJcbiAgaWYgKGNvbnRlbnQubGVuZ3RoIDwgMHg4MCkge1xyXG4gICAgdmFyIGhlYWRlciA9IG5ldyBCdWZmZXIoMik7XHJcbiAgICBoZWFkZXJbMF0gPSBlbmNvZGVkVGFnO1xyXG4gICAgaGVhZGVyWzFdID0gY29udGVudC5sZW5ndGg7XHJcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihbIGhlYWRlciwgY29udGVudCBdKTtcclxuICB9XHJcblxyXG4gIC8vIExvbmcgZm9ybVxyXG4gIC8vIENvdW50IG9jdGV0cyByZXF1aXJlZCB0byBzdG9yZSBsZW5ndGhcclxuICB2YXIgbGVuT2N0ZXRzID0gMTtcclxuICBmb3IgKHZhciBpID0gY29udGVudC5sZW5ndGg7IGkgPj0gMHgxMDA7IGkgPj49IDgpXHJcbiAgICBsZW5PY3RldHMrKztcclxuXHJcbiAgdmFyIGhlYWRlciA9IG5ldyBCdWZmZXIoMSArIDEgKyBsZW5PY3RldHMpO1xyXG4gIGhlYWRlclswXSA9IGVuY29kZWRUYWc7XHJcbiAgaGVhZGVyWzFdID0gMHg4MCB8IGxlbk9jdGV0cztcclxuXHJcbiAgZm9yICh2YXIgaSA9IDEgKyBsZW5PY3RldHMsIGogPSBjb250ZW50Lmxlbmd0aDsgaiA+IDA7IGktLSwgaiA+Pj0gOClcclxuICAgIGhlYWRlcltpXSA9IGogJiAweGZmO1xyXG5cclxuICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihbIGhlYWRlciwgY29udGVudCBdKTtcclxufTtcclxuXHJcbkRFUk5vZGUucHJvdG90eXBlLl9lbmNvZGVTdHIgPSBmdW5jdGlvbiBlbmNvZGVTdHIoc3RyLCB0YWcpIHtcclxuICBpZiAodGFnID09PSAnb2N0c3RyJylcclxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKHN0cik7XHJcbiAgZWxzZSBpZiAodGFnID09PSAnYml0c3RyJylcclxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKFsgc3RyLnVudXNlZCB8IDAsIHN0ci5kYXRhIF0pO1xyXG4gIGVsc2UgaWYgKHRhZyA9PT0gJ2lhNXN0cicgfHwgdGFnID09PSAndXRmOHN0cicpXHJcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihzdHIpO1xyXG4gIHJldHVybiB0aGlzLnJlcG9ydGVyLmVycm9yKCdFbmNvZGluZyBvZiBzdHJpbmcgdHlwZTogJyArIHRhZyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyB1bnN1cHBvcnRlZCcpO1xyXG59O1xyXG5cclxuREVSTm9kZS5wcm90b3R5cGUuX2VuY29kZU9iamlkID0gZnVuY3Rpb24gZW5jb2RlT2JqaWQoaWQsIHZhbHVlcywgcmVsYXRpdmUpIHtcclxuICBpZiAodHlwZW9mIGlkID09PSAnc3RyaW5nJykge1xyXG4gICAgaWYgKCF2YWx1ZXMpXHJcbiAgICAgIHJldHVybiB0aGlzLnJlcG9ydGVyLmVycm9yKCdzdHJpbmcgb2JqaWQgZ2l2ZW4sIGJ1dCBubyB2YWx1ZXMgbWFwIGZvdW5kJyk7XHJcbiAgICBpZiAoIXZhbHVlcy5oYXNPd25Qcm9wZXJ0eShpZCkpXHJcbiAgICAgIHJldHVybiB0aGlzLnJlcG9ydGVyLmVycm9yKCdvYmppZCBub3QgZm91bmQgaW4gdmFsdWVzIG1hcCcpO1xyXG4gICAgaWQgPSB2YWx1ZXNbaWRdLnNwbGl0KC9bXFxzXFwuXSsvZyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlkLmxlbmd0aDsgaSsrKVxyXG4gICAgICBpZFtpXSB8PSAwO1xyXG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShpZCkpIHtcclxuICAgIGlkID0gaWQuc2xpY2UoKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaWQubGVuZ3RoOyBpKyspXHJcbiAgICAgIGlkW2ldIHw9IDA7XHJcbiAgfVxyXG5cclxuICBpZiAoIUFycmF5LmlzQXJyYXkoaWQpKSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZXBvcnRlci5lcnJvcignb2JqaWQoKSBzaG91bGQgYmUgZWl0aGVyIGFycmF5IG9yIHN0cmluZywgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZ290OiAnICsgSlNPTi5zdHJpbmdpZnkoaWQpKTtcclxuICB9XHJcblxyXG4gIGlmICghcmVsYXRpdmUpIHtcclxuICAgIGlmIChpZFsxXSA+PSA0MClcclxuICAgICAgcmV0dXJuIHRoaXMucmVwb3J0ZXIuZXJyb3IoJ1NlY29uZCBvYmppZCBpZGVudGlmaWVyIE9PQicpO1xyXG4gICAgaWQuc3BsaWNlKDAsIDIsIGlkWzBdICogNDAgKyBpZFsxXSk7XHJcbiAgfVxyXG5cclxuICAvLyBDb3VudCBudW1iZXIgb2Ygb2N0ZXRzXHJcbiAgdmFyIHNpemUgPSAwO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaWQubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBpZGVudCA9IGlkW2ldO1xyXG4gICAgZm9yIChzaXplKys7IGlkZW50ID49IDB4ODA7IGlkZW50ID4+PSA3KVxyXG4gICAgICBzaXplKys7XHJcbiAgfVxyXG5cclxuICB2YXIgb2JqaWQgPSBuZXcgQnVmZmVyKHNpemUpO1xyXG4gIHZhciBvZmZzZXQgPSBvYmppZC5sZW5ndGggLSAxO1xyXG4gIGZvciAodmFyIGkgPSBpZC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgdmFyIGlkZW50ID0gaWRbaV07XHJcbiAgICBvYmppZFtvZmZzZXQtLV0gPSBpZGVudCAmIDB4N2Y7XHJcbiAgICB3aGlsZSAoKGlkZW50ID4+PSA3KSA+IDApXHJcbiAgICAgIG9iamlkW29mZnNldC0tXSA9IDB4ODAgfCAoaWRlbnQgJiAweDdmKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKG9iamlkKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIHR3byhudW0pIHtcclxuICBpZiAobnVtIDwgMTApXHJcbiAgICByZXR1cm4gJzAnICsgbnVtO1xyXG4gIGVsc2VcclxuICAgIHJldHVybiBudW07XHJcbn1cclxuXHJcbkRFUk5vZGUucHJvdG90eXBlLl9lbmNvZGVUaW1lID0gZnVuY3Rpb24gZW5jb2RlVGltZSh0aW1lLCB0YWcpIHtcclxuICB2YXIgc3RyO1xyXG4gIHZhciBkYXRlID0gbmV3IERhdGUodGltZSk7XHJcblxyXG4gIGlmICh0YWcgPT09ICdnZW50aW1lJykge1xyXG4gICAgc3RyID0gW1xyXG4gICAgICB0d28oZGF0ZS5nZXRGdWxsWWVhcigpKSxcclxuICAgICAgdHdvKGRhdGUuZ2V0VVRDTW9udGgoKSArIDEpLFxyXG4gICAgICB0d28oZGF0ZS5nZXRVVENEYXRlKCkpLFxyXG4gICAgICB0d28oZGF0ZS5nZXRVVENIb3VycygpKSxcclxuICAgICAgdHdvKGRhdGUuZ2V0VVRDTWludXRlcygpKSxcclxuICAgICAgdHdvKGRhdGUuZ2V0VVRDU2Vjb25kcygpKSxcclxuICAgICAgJ1onXHJcbiAgICBdLmpvaW4oJycpO1xyXG4gIH0gZWxzZSBpZiAodGFnID09PSAndXRjdGltZScpIHtcclxuICAgIHN0ciA9IFtcclxuICAgICAgdHdvKGRhdGUuZ2V0RnVsbFllYXIoKSAlIDEwMCksXHJcbiAgICAgIHR3byhkYXRlLmdldFVUQ01vbnRoKCkgKyAxKSxcclxuICAgICAgdHdvKGRhdGUuZ2V0VVRDRGF0ZSgpKSxcclxuICAgICAgdHdvKGRhdGUuZ2V0VVRDSG91cnMoKSksXHJcbiAgICAgIHR3byhkYXRlLmdldFVUQ01pbnV0ZXMoKSksXHJcbiAgICAgIHR3byhkYXRlLmdldFVUQ1NlY29uZHMoKSksXHJcbiAgICAgICdaJ1xyXG4gICAgXS5qb2luKCcnKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5yZXBvcnRlci5lcnJvcignRW5jb2RpbmcgJyArIHRhZyArICcgdGltZSBpcyBub3Qgc3VwcG9ydGVkIHlldCcpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXMuX2VuY29kZVN0cihzdHIsICdvY3RzdHInKTtcclxufTtcclxuXHJcbkRFUk5vZGUucHJvdG90eXBlLl9lbmNvZGVOdWxsID0gZnVuY3Rpb24gZW5jb2RlTnVsbCgpIHtcclxuICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcignJyk7XHJcbn07XHJcblxyXG5ERVJOb2RlLnByb3RvdHlwZS5fZW5jb2RlSW50ID0gZnVuY3Rpb24gZW5jb2RlSW50KG51bSwgdmFsdWVzKSB7XHJcbiAgaWYgKHR5cGVvZiBudW0gPT09ICdzdHJpbmcnKSB7XHJcbiAgICBpZiAoIXZhbHVlcylcclxuICAgICAgcmV0dXJuIHRoaXMucmVwb3J0ZXIuZXJyb3IoJ1N0cmluZyBpbnQgb3IgZW51bSBnaXZlbiwgYnV0IG5vIHZhbHVlcyBtYXAnKTtcclxuICAgIGlmICghdmFsdWVzLmhhc093blByb3BlcnR5KG51bSkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMucmVwb3J0ZXIuZXJyb3IoJ1ZhbHVlcyBtYXAgZG9lc25cXCd0IGNvbnRhaW46ICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShudW0pKTtcclxuICAgIH1cclxuICAgIG51bSA9IHZhbHVlc1tudW1dO1xyXG4gIH1cclxuXHJcbiAgLy8gQmlnbnVtLCBhc3N1bWUgYmlnIGVuZGlhblxyXG4gIGlmICh0eXBlb2YgbnVtICE9PSAnbnVtYmVyJyAmJiAhQnVmZmVyLmlzQnVmZmVyKG51bSkpIHtcclxuICAgIHZhciBudW1BcnJheSA9IG51bS50b0FycmF5KCk7XHJcbiAgICBpZiAobnVtLnNpZ24gPT09IGZhbHNlICYmIG51bUFycmF5WzBdICYgMHg4MCkge1xyXG4gICAgICBudW1BcnJheS51bnNoaWZ0KDApO1xyXG4gICAgfVxyXG4gICAgbnVtID0gbmV3IEJ1ZmZlcihudW1BcnJheSk7XHJcbiAgfVxyXG5cclxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKG51bSkpIHtcclxuICAgIHZhciBzaXplID0gbnVtLmxlbmd0aDtcclxuICAgIGlmIChudW0ubGVuZ3RoID09PSAwKVxyXG4gICAgICBzaXplKys7XHJcblxyXG4gICAgdmFyIG91dCA9IG5ldyBCdWZmZXIoc2l6ZSk7XHJcbiAgICBudW0uY29weShvdXQpO1xyXG4gICAgaWYgKG51bS5sZW5ndGggPT09IDApXHJcbiAgICAgIG91dFswXSA9IDBcclxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKG91dCk7XHJcbiAgfVxyXG5cclxuICBpZiAobnVtIDwgMHg4MClcclxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKG51bSk7XHJcblxyXG4gIGlmIChudW0gPCAweDEwMClcclxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVFbmNvZGVyQnVmZmVyKFswLCBudW1dKTtcclxuXHJcbiAgdmFyIHNpemUgPSAxO1xyXG4gIGZvciAodmFyIGkgPSBudW07IGkgPj0gMHgxMDA7IGkgPj49IDgpXHJcbiAgICBzaXplKys7XHJcblxyXG4gIHZhciBvdXQgPSBuZXcgQXJyYXkoc2l6ZSk7XHJcbiAgZm9yICh2YXIgaSA9IG91dC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgb3V0W2ldID0gbnVtICYgMHhmZjtcclxuICAgIG51bSA+Pj0gODtcclxuICB9XHJcbiAgaWYob3V0WzBdICYgMHg4MCkge1xyXG4gICAgb3V0LnVuc2hpZnQoMCk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcy5fY3JlYXRlRW5jb2RlckJ1ZmZlcihuZXcgQnVmZmVyKG91dCkpO1xyXG59O1xyXG5cclxuREVSTm9kZS5wcm90b3R5cGUuX2VuY29kZUJvb2wgPSBmdW5jdGlvbiBlbmNvZGVCb29sKHZhbHVlKSB7XHJcbiAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVuY29kZXJCdWZmZXIodmFsdWUgPyAweGZmIDogMCk7XHJcbn07XHJcblxyXG5ERVJOb2RlLnByb3RvdHlwZS5fdXNlID0gZnVuY3Rpb24gdXNlKGVudGl0eSwgb2JqKSB7XHJcbiAgaWYgKHR5cGVvZiBlbnRpdHkgPT09ICdmdW5jdGlvbicpXHJcbiAgICBlbnRpdHkgPSBlbnRpdHkob2JqKTtcclxuICByZXR1cm4gZW50aXR5Ll9nZXRFbmNvZGVyKCdkZXInKS50cmVlO1xyXG59O1xyXG5cclxuREVSTm9kZS5wcm90b3R5cGUuX3NraXBEZWZhdWx0ID0gZnVuY3Rpb24gc2tpcERlZmF1bHQoZGF0YUJ1ZmZlciwgcmVwb3J0ZXIsIHBhcmVudCkge1xyXG4gIHZhciBzdGF0ZSA9IHRoaXMuX2Jhc2VTdGF0ZTtcclxuICB2YXIgaTtcclxuICBpZiAoc3RhdGVbJ2RlZmF1bHQnXSA9PT0gbnVsbClcclxuICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgdmFyIGRhdGEgPSBkYXRhQnVmZmVyLmpvaW4oKTtcclxuICBpZiAoc3RhdGUuZGVmYXVsdEJ1ZmZlciA9PT0gdW5kZWZpbmVkKVxyXG4gICAgc3RhdGUuZGVmYXVsdEJ1ZmZlciA9IHRoaXMuX2VuY29kZVZhbHVlKHN0YXRlWydkZWZhdWx0J10sIHJlcG9ydGVyLCBwYXJlbnQpLmpvaW4oKTtcclxuXHJcbiAgaWYgKGRhdGEubGVuZ3RoICE9PSBzdGF0ZS5kZWZhdWx0QnVmZmVyLmxlbmd0aClcclxuICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgZm9yIChpPTA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKVxyXG4gICAgaWYgKGRhdGFbaV0gIT09IHN0YXRlLmRlZmF1bHRCdWZmZXJbaV0pXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgcmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vLyBVdGlsaXR5IG1ldGhvZHNcclxuXHJcbmZ1bmN0aW9uIGVuY29kZVRhZyh0YWcsIHByaW1pdGl2ZSwgY2xzLCByZXBvcnRlcikge1xyXG4gIHZhciByZXM7XHJcblxyXG4gIGlmICh0YWcgPT09ICdzZXFvZicpXHJcbiAgICB0YWcgPSAnc2VxJztcclxuICBlbHNlIGlmICh0YWcgPT09ICdzZXRvZicpXHJcbiAgICB0YWcgPSAnc2V0JztcclxuXHJcbiAgaWYgKGRlci50YWdCeU5hbWUuaGFzT3duUHJvcGVydHkodGFnKSlcclxuICAgIHJlcyA9IGRlci50YWdCeU5hbWVbdGFnXTtcclxuICBlbHNlIGlmICh0eXBlb2YgdGFnID09PSAnbnVtYmVyJyAmJiAodGFnIHwgMCkgPT09IHRhZylcclxuICAgIHJlcyA9IHRhZztcclxuICBlbHNlXHJcbiAgICByZXR1cm4gcmVwb3J0ZXIuZXJyb3IoJ1Vua25vd24gdGFnOiAnICsgdGFnKTtcclxuXHJcbiAgaWYgKHJlcyA+PSAweDFmKVxyXG4gICAgcmV0dXJuIHJlcG9ydGVyLmVycm9yKCdNdWx0aS1vY3RldCB0YWcgZW5jb2RpbmcgdW5zdXBwb3J0ZWQnKTtcclxuXHJcbiAgaWYgKCFwcmltaXRpdmUpXHJcbiAgICByZXMgfD0gMHgyMDtcclxuXHJcbiAgcmVzIHw9IChkZXIudGFnQ2xhc3NCeU5hbWVbY2xzIHx8ICd1bml2ZXJzYWwnXSA8PCA2KTtcclxuXHJcbiAgcmV0dXJuIHJlcztcclxufVxyXG4iLCJ2YXIgZW5jb2RlcnMgPSBleHBvcnRzO1xyXG5cclxuZW5jb2RlcnMuZGVyID0gcmVxdWlyZSgnLi9kZXInKTtcclxuZW5jb2RlcnMucGVtID0gcmVxdWlyZSgnLi9wZW0nKTtcclxuIiwidmFyIGluaGVyaXRzID0gcmVxdWlyZSgndXRpbCcpLmluaGVyaXRzO1xyXG52YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xyXG5cclxudmFyIGFzbjEgPSByZXF1aXJlKCcuLi9hc24xJyk7XHJcbnZhciBERVJFbmNvZGVyID0gcmVxdWlyZSgnLi9kZXInKTtcclxuXHJcbmZ1bmN0aW9uIFBFTUVuY29kZXIoZW50aXR5KSB7XHJcbiAgREVSRW5jb2Rlci5jYWxsKHRoaXMsIGVudGl0eSk7XHJcbiAgdGhpcy5lbmMgPSAncGVtJztcclxufTtcclxuaW5oZXJpdHMoUEVNRW5jb2RlciwgREVSRW5jb2Rlcik7XHJcbm1vZHVsZS5leHBvcnRzID0gUEVNRW5jb2RlcjtcclxuXHJcblBFTUVuY29kZXIucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uIGVuY29kZShkYXRhLCBvcHRpb25zKSB7XHJcbiAgdmFyIGJ1ZiA9IERFUkVuY29kZXIucHJvdG90eXBlLmVuY29kZS5jYWxsKHRoaXMsIGRhdGEpO1xyXG5cclxuICB2YXIgcCA9IGJ1Zi50b1N0cmluZygnYmFzZTY0Jyk7XHJcbiAgdmFyIG91dCA9IFsgJy0tLS0tQkVHSU4gJyArIG9wdGlvbnMubGFiZWwgKyAnLS0tLS0nIF07XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLmxlbmd0aDsgaSArPSA2NClcclxuICAgIG91dC5wdXNoKHAuc2xpY2UoaSwgaSArIDY0KSk7XHJcbiAgb3V0LnB1c2goJy0tLS0tRU5EICcgKyBvcHRpb25zLmxhYmVsICsgJy0tLS0tJyk7XHJcbiAgcmV0dXJuIG91dC5qb2luKCdcXG4nKTtcclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnXHJcblxyXG52YXIgYXNuMSA9IHJlcXVpcmUoJy4vYXNuMS9hc24xJyk7XHJcbnZhciBCTiA9IHJlcXVpcmUoJy4vYXNuMS9iaWdudW0vYm4nKTtcclxuXHJcbnZhciBFQ1ByaXZhdGVLZXlBU04gPSBhc24xLmRlZmluZSgnRUNQcml2YXRlS2V5JywgZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNlcSgpLm9iaihcclxuICAgICAgICB0aGlzLmtleSgndmVyc2lvbicpLmludCgpLFxyXG4gICAgICAgIHRoaXMua2V5KCdwcml2YXRlS2V5Jykub2N0c3RyKCksXHJcbiAgICAgICAgdGhpcy5rZXkoJ3BhcmFtZXRlcnMnKS5leHBsaWNpdCgwKS5vYmppZCgpLm9wdGlvbmFsKCksXHJcbiAgICAgICAgdGhpcy5rZXkoJ3B1YmxpY0tleScpLmV4cGxpY2l0KDEpLmJpdHN0cigpLm9wdGlvbmFsKClcclxuICAgIClcclxufSlcclxuXHJcbnZhciBTdWJqZWN0UHVibGljS2V5SW5mb0FTTiA9IGFzbjEuZGVmaW5lKCdTdWJqZWN0UHVibGljS2V5SW5mbycsIGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zZXEoKS5vYmooXHJcbiAgICAgICAgdGhpcy5rZXkoJ2FsZ29yaXRobScpLnNlcSgpLm9iaihcclxuICAgICAgICAgICAgdGhpcy5rZXkoXCJpZFwiKS5vYmppZCgpLFxyXG4gICAgICAgICAgICB0aGlzLmtleShcImN1cnZlXCIpLm9iamlkKClcclxuICAgICAgICApLFxyXG4gICAgICAgIHRoaXMua2V5KCdwdWInKS5iaXRzdHIoKVxyXG4gICAgKVxyXG59KVxyXG5cclxudmFyIGN1cnZlcyA9IHtcclxuICAgIHNlY3AyNTZrMToge1xyXG4gICAgICAgIGN1cnZlUGFyYW1ldGVyczogWzEsIDMsIDEzMiwgMCwgMTBdLFxyXG4gICAgICAgIHByaXZhdGVQRU1PcHRpb25zOiB7bGFiZWw6ICdFQyBQUklWQVRFIEtFWSd9LFxyXG4gICAgICAgIHB1YmxpY1BFTU9wdGlvbnM6IHtsYWJlbDogJ1BVQkxJQyBLRVknfVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhc3NlcnQodmFsLCBtc2cpIHtcclxuICAgIGlmICghdmFsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyB8fCAnQXNzZXJ0aW9uIGZhaWxlZCcpXHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEtleUVuY29kZXIob3B0aW9ucykge1xyXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIGFzc2VydChjdXJ2ZXMuaGFzT3duUHJvcGVydHkob3B0aW9ucyksICdVbmtub3duIGN1cnZlICcgKyBvcHRpb25zKTtcclxuICAgICAgICBvcHRpb25zID0gY3VydmVzW29wdGlvbnNdXHJcbiAgICB9XHJcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgdGhpcy5hbGdvcml0aG1JRCA9IFsxLCAyLCA4NDAsIDEwMDQ1LCAyLCAxXVxyXG59XHJcblxyXG5LZXlFbmNvZGVyLkVDUHJpdmF0ZUtleUFTTiA9IEVDUHJpdmF0ZUtleUFTTjtcclxuS2V5RW5jb2Rlci5TdWJqZWN0UHVibGljS2V5SW5mb0FTTiA9IFN1YmplY3RQdWJsaWNLZXlJbmZvQVNOO1xyXG5cclxuS2V5RW5jb2Rlci5wcm90b3R5cGUucHJpdmF0ZUtleU9iamVjdCA9IGZ1bmN0aW9uKHJhd1ByaXZhdGVLZXksIHJhd1B1YmxpY0tleSkge1xyXG4gICAgdmFyIHByaXZhdGVLZXlPYmplY3QgPSB7XHJcbiAgICAgICAgdmVyc2lvbjogbmV3IEJOKDEpLFxyXG4gICAgICAgIHByaXZhdGVLZXk6IG5ldyBCdWZmZXIocmF3UHJpdmF0ZUtleSwgJ2hleCcpLFxyXG4gICAgICAgIHBhcmFtZXRlcnM6IHRoaXMub3B0aW9ucy5jdXJ2ZVBhcmFtZXRlcnMsXHJcbiAgICAgICAgcGVtT3B0aW9uczoge2xhYmVsOlwiRUMgUFJJVkFURSBLRVlcIn1cclxuICAgIH07XHJcblxyXG4gICAgaWYgKHJhd1B1YmxpY0tleSkge1xyXG4gICAgICAgIHByaXZhdGVLZXlPYmplY3QucHVibGljS2V5ID0ge1xyXG4gICAgICAgICAgICB1bnVzZWQ6IDAsXHJcbiAgICAgICAgICAgIGRhdGE6IG5ldyBCdWZmZXIocmF3UHVibGljS2V5LCAnaGV4JylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHByaXZhdGVLZXlPYmplY3RcclxufTtcclxuXHJcbktleUVuY29kZXIucHJvdG90eXBlLnB1YmxpY0tleU9iamVjdCA9IGZ1bmN0aW9uKHJhd1B1YmxpY0tleSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBhbGdvcml0aG06IHtcclxuICAgICAgICAgICAgaWQ6IHRoaXMuYWxnb3JpdGhtSUQsXHJcbiAgICAgICAgICAgIGN1cnZlOiB0aGlzLm9wdGlvbnMuY3VydmVQYXJhbWV0ZXJzXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwdWI6IHtcclxuICAgICAgICAgICAgdW51c2VkOiAwLFxyXG4gICAgICAgICAgICBkYXRhOiBuZXcgQnVmZmVyKHJhd1B1YmxpY0tleSwgJ2hleCcpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwZW1PcHRpb25zOiB7IGxhYmVsIDpcIlBVQkxJQyBLRVlcIn1cclxuICAgIH1cclxufVxyXG5cclxuS2V5RW5jb2Rlci5wcm90b3R5cGUuZW5jb2RlUHJpdmF0ZSA9IGZ1bmN0aW9uKHByaXZhdGVLZXksIG9yaWdpbmFsRm9ybWF0LCBkZXN0aW5hdGlvbkZvcm1hdCkge1xyXG4gICAgdmFyIHByaXZhdGVLZXlPYmplY3RcclxuXHJcbiAgICAvKiBQYXJzZSB0aGUgaW5jb21pbmcgcHJpdmF0ZSBrZXkgYW5kIGNvbnZlcnQgaXQgdG8gYSBwcml2YXRlIGtleSBvYmplY3QgKi9cclxuICAgIGlmIChvcmlnaW5hbEZvcm1hdCA9PT0gJ3JhdycpIHtcclxuICAgICAgICBpZiAoIXR5cGVvZiBwcml2YXRlS2V5ID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aHJvdyAncHJpdmF0ZSBrZXkgbXVzdCBiZSBhIHN0cmluZydcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHByaXZhdGVLZXlPYmplY3QgPSB0aGlzLm9wdGlvbnMuY3VydmUua2V5RnJvbVByaXZhdGUocHJpdmF0ZUtleSwgJ2hleCcpLFxyXG4gICAgICAgICAgICByYXdQdWJsaWNLZXkgPSBwcml2YXRlS2V5T2JqZWN0LmdldFB1YmxpYygnaGV4JylcclxuICAgICAgICBwcml2YXRlS2V5T2JqZWN0ID0gdGhpcy5wcml2YXRlS2V5T2JqZWN0KHByaXZhdGVLZXksIHJhd1B1YmxpY0tleSlcclxuICAgIH0gZWxzZSBpZiAob3JpZ2luYWxGb3JtYXQgPT09ICdkZXInKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwcml2YXRlS2V5ID09PSAnYnVmZmVyJykge1xyXG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcHJpdmF0ZUtleSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgcHJpdmF0ZUtleSA9IG5ldyBCdWZmZXIocHJpdmF0ZUtleSwgJ2hleCcpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgJ3ByaXZhdGUga2V5IG11c3QgYmUgYSBidWZmZXIgb3IgYSBzdHJpbmcnXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByaXZhdGVLZXlPYmplY3QgPSBFQ1ByaXZhdGVLZXlBU04uZGVjb2RlKHByaXZhdGVLZXksICdkZXInKVxyXG4gICAgfSBlbHNlIGlmIChvcmlnaW5hbEZvcm1hdCA9PT0gJ3BlbScpIHtcclxuICAgICAgICBpZiAoIXR5cGVvZiBwcml2YXRlS2V5ID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aHJvdyAncHJpdmF0ZSBrZXkgbXVzdCBiZSBhIHN0cmluZydcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJpdmF0ZUtleU9iamVjdCA9IEVDUHJpdmF0ZUtleUFTTi5kZWNvZGUocHJpdmF0ZUtleSwgJ3BlbScsIHRoaXMub3B0aW9ucy5wcml2YXRlUEVNT3B0aW9ucylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgJ2ludmFsaWQgcHJpdmF0ZSBrZXkgZm9ybWF0J1xyXG4gICAgfVxyXG5cclxuICAgIC8qIEV4cG9ydCB0aGUgcHJpdmF0ZSBrZXkgb2JqZWN0IHRvIHRoZSBkZXNpcmVkIGZvcm1hdCAqL1xyXG4gICAgaWYgKGRlc3RpbmF0aW9uRm9ybWF0ID09PSAncmF3Jykge1xyXG4gICAgICAgIHJldHVybiBwcml2YXRlS2V5T2JqZWN0LnByaXZhdGVLZXkudG9TdHJpbmcoJ2hleCcpXHJcbiAgICB9IGVsc2UgaWYgKGRlc3RpbmF0aW9uRm9ybWF0ID09PSAnZGVyJykge1xyXG4gICAgICAgIHJldHVybiBFQ1ByaXZhdGVLZXlBU04uZW5jb2RlKHByaXZhdGVLZXlPYmplY3QsICdkZXInKS50b1N0cmluZygnaGV4JylcclxuICAgIH0gZWxzZSBpZiAoZGVzdGluYXRpb25Gb3JtYXQgPT09ICdwZW0nKSB7XHJcbiAgICAgICAgcmV0dXJuIEVDUHJpdmF0ZUtleUFTTi5lbmNvZGUocHJpdmF0ZUtleU9iamVjdCwgJ3BlbScsIHRoaXMub3B0aW9ucy5wcml2YXRlUEVNT3B0aW9ucylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgJ2ludmFsaWQgZGVzdGluYXRpb24gZm9ybWF0IGZvciBwcml2YXRlIGtleSdcclxuICAgIH1cclxufVxyXG5cclxuS2V5RW5jb2Rlci5wcm90b3R5cGUuZW5jb2RlUHVibGljID0gZnVuY3Rpb24ocHVibGljS2V5LCBvcmlnaW5hbEZvcm1hdCwgZGVzdGluYXRpb25Gb3JtYXQpIHtcclxuICAgIHZhciBwdWJsaWNLZXlPYmplY3RcclxuXHJcbiAgICAvKiBQYXJzZSB0aGUgaW5jb21pbmcgcHVibGljIGtleSBhbmQgY29udmVydCBpdCB0byBhIHB1YmxpYyBrZXkgb2JqZWN0ICovXHJcbiAgICBpZiAob3JpZ2luYWxGb3JtYXQgPT09ICdyYXcnKSB7XHJcbiAgICAgICAgaWYgKCF0eXBlb2YgcHVibGljS2V5ID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aHJvdyAncHVibGljIGtleSBtdXN0IGJlIGEgc3RyaW5nJ1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWNLZXlPYmplY3QgPSB0aGlzLnB1YmxpY0tleU9iamVjdChwdWJsaWNLZXkpXHJcbiAgICB9IGVsc2UgaWYgKG9yaWdpbmFsRm9ybWF0ID09PSAnZGVyJykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgcHVibGljS2V5ID09PSAnYnVmZmVyJykge1xyXG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcHVibGljS2V5ID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBwdWJsaWNLZXkgPSBuZXcgQnVmZmVyKHB1YmxpY0tleSwgJ2hleCcpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgJ3B1YmxpYyBrZXkgbXVzdCBiZSBhIGJ1ZmZlciBvciBhIHN0cmluZydcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljS2V5T2JqZWN0ID0gU3ViamVjdFB1YmxpY0tleUluZm9BU04uZGVjb2RlKHB1YmxpY0tleSwgJ2RlcicpXHJcbiAgICB9IGVsc2UgaWYgKG9yaWdpbmFsRm9ybWF0ID09PSAncGVtJykge1xyXG4gICAgICAgIGlmICghdHlwZW9mIHB1YmxpY0tleSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGhyb3cgJ3B1YmxpYyBrZXkgbXVzdCBiZSBhIHN0cmluZydcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljS2V5T2JqZWN0ID0gU3ViamVjdFB1YmxpY0tleUluZm9BU04uZGVjb2RlKHB1YmxpY0tleSwgJ3BlbScsIHRoaXMub3B0aW9ucy5wdWJsaWNQRU1PcHRpb25zKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aHJvdyAnaW52YWxpZCBwdWJsaWMga2V5IGZvcm1hdCdcclxuICAgIH1cclxuXHJcbiAgICAvKiBFeHBvcnQgdGhlIHByaXZhdGUga2V5IG9iamVjdCB0byB0aGUgZGVzaXJlZCBmb3JtYXQgKi9cclxuICAgIGlmIChkZXN0aW5hdGlvbkZvcm1hdCA9PT0gJ3JhdycpIHtcclxuICAgICAgICByZXR1cm4gcHVibGljS2V5T2JqZWN0LnB1Yi5kYXRhLnRvU3RyaW5nKCdoZXgnKVxyXG4gICAgfSBlbHNlIGlmIChkZXN0aW5hdGlvbkZvcm1hdCA9PT0gJ2RlcicpIHtcclxuICAgICAgICByZXR1cm4gU3ViamVjdFB1YmxpY0tleUluZm9BU04uZW5jb2RlKHB1YmxpY0tleU9iamVjdCwgJ2RlcicpLnRvU3RyaW5nKCdoZXgnKVxyXG4gICAgfSBlbHNlIGlmIChkZXN0aW5hdGlvbkZvcm1hdCA9PT0gJ3BlbScpIHtcclxuICAgICAgICByZXR1cm4gU3ViamVjdFB1YmxpY0tleUluZm9BU04uZW5jb2RlKHB1YmxpY0tleU9iamVjdCwgJ3BlbScsIHRoaXMub3B0aW9ucy5wdWJsaWNQRU1PcHRpb25zKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aHJvdyAnaW52YWxpZCBkZXN0aW5hdGlvbiBmb3JtYXQgZm9yIHB1YmxpYyBrZXknXHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gS2V5RW5jb2RlcjsiLCJyZXF1aXJlKFwiLi4vLi4vLi4vZW5naW5lL2NvcmVcIik7XHJcbmNvbnN0IHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcclxuY29uc3QgeWF6bCA9ICQkLnJlcXVpcmVNb2R1bGUoXCJ5YXpsXCIpO1xyXG5jb25zdCB5YXV6bCA9ICQkLnJlcXVpcmVNb2R1bGUoXCJ5YXV6bFwiKTtcclxuY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIik7XHJcbmNvbnN0IGlzU3RyZWFtID0gcmVxdWlyZShcIi4vdXRpbHMvaXNTdHJlYW1cIik7XHJcblxyXG5mdW5jdGlvbiBQc2tBcmNoaXZlcigpIHtcclxuXHRsZXQgemlwZmlsZSA9IG5ldyB5YXpsLlppcEZpbGUoKTtcclxuXHRmdW5jdGlvbiB6aXBGb2xkZXJSZWN1cnNpdmVseShpbnB1dFBhdGgsIHJvb3QgPSAnJykge1xyXG5cdFx0Y29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhpbnB1dFBhdGgpO1xyXG5cdFx0ZmlsZXMuZm9yRWFjaChmdW5jdGlvbiAoZmlsZSkge1xyXG5cdFx0XHRjb25zdCB0ZW1wUGF0aCA9IHBhdGguam9pbihpbnB1dFBhdGgsIGZpbGUpO1xyXG5cdFx0XHRpZiAoIWZzLmxzdGF0U3luYyh0ZW1wUGF0aCkuaXNEaXJlY3RvcnkoKSkge1xyXG5cdFx0XHRcdHppcGZpbGUuYWRkRmlsZSh0ZW1wUGF0aCwgcGF0aC5qb2luKHJvb3QsIGZpbGUpKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR6aXBGb2xkZXJSZWN1cnNpdmVseSh0ZW1wUGF0aCwgcGF0aC5qb2luKHJvb3QsIGZpbGUpKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHR0aGlzLnppcCA9IGZ1bmN0aW9uIChpbnB1dFBhdGgsIG91dHB1dCwgY2FsbGJhY2spIHtcclxuXHRcdHZhciBleHQgPSBcIlwiO1xyXG5cdFx0aWYoZnMubHN0YXRTeW5jKGlucHV0UGF0aCkuaXNEaXJlY3RvcnkoKSkge1xyXG5cdFx0XHR6aXBGb2xkZXJSZWN1cnNpdmVseShpbnB1dFBhdGgpO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHZhciBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoaW5wdXRQYXRoKTtcclxuXHRcdFx0emlwZmlsZS5hZGRGaWxlKGlucHV0UGF0aCwgZmlsZW5hbWUpO1xyXG5cdFx0XHR2YXIgc3BsaXRGaWxlbmFtZSA9IGZpbGVuYW1lLnNwbGl0KFwiLlwiKTtcclxuXHRcdFx0aWYoc3BsaXRGaWxlbmFtZS5sZW5ndGggPj0gMiApe1xyXG5cdFx0XHRcdGV4dCA9IFwiLlwiICsgc3BsaXRGaWxlbmFtZVtzcGxpdEZpbGVuYW1lLmxlbmd0aCAtIDFdO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR6aXBmaWxlLmVuZCgpO1xyXG5cdFx0aWYoaXNTdHJlYW0uaXNXcml0YWJsZShvdXRwdXQpKXtcclxuXHRcdFx0Y2FsbGJhY2sobnVsbCwgemlwZmlsZS5vdXRwdXRTdHJlYW0ucGlwZShvdXRwdXQpKTtcclxuXHRcdH1lbHNlIGlmKHR5cGVvZiBvdXRwdXQgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0JCQuZW5zdXJlRm9sZGVyRXhpc3RzKG91dHB1dCwgKCkgPT4ge1xyXG5cdFx0XHRcdHZhciBkZXN0aW5hdGlvblBhdGggPSBwYXRoLmpvaW4ob3V0cHV0LCBwYXRoLmJhc2VuYW1lKGlucHV0UGF0aCwgZXh0KSArIFwiLnppcFwiKTtcclxuXHRcdFx0XHR6aXBmaWxlLm91dHB1dFN0cmVhbS5waXBlKGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3RpbmF0aW9uUGF0aCkpLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0Y2FsbGJhY2soKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0dGhpcy51bnppcCA9IGZ1bmN0aW9uIChpbnB1dCwgb3V0cHV0UGF0aCwgY2FsbGJhY2spIHtcclxuXHRcdHlhdXpsLm9wZW4oaW5wdXQsIHtsYXp5RW50cmllczogdHJ1ZX0sIGZ1bmN0aW9uIChlcnIsIHppcGZpbGUpIHtcclxuXHRcdFx0aWYgKGVycikgdGhyb3cgZXJyO1xyXG5cdFx0XHR6aXBmaWxlLnJlYWRFbnRyeSgpO1xyXG5cdFx0XHR6aXBmaWxlLm9uY2UoXCJlbmRcIiwgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGNhbGxiYWNrKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHR6aXBmaWxlLm9uKFwiZW50cnlcIiwgZnVuY3Rpb24gKGVudHJ5KSB7XHJcblx0XHRcdFx0aWYgKGVudHJ5LmZpbGVOYW1lLmVuZHNXaXRoKHBhdGguc2VwKSkge1xyXG5cdFx0XHRcdFx0emlwZmlsZS5yZWFkRW50cnkoKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0bGV0IGZvbGRlciA9IHBhdGguZGlybmFtZShlbnRyeS5maWxlTmFtZSk7XHJcblx0XHRcdFx0XHQkJC5lbnN1cmVGb2xkZXJFeGlzdHMocGF0aC5qb2luKG91dHB1dFBhdGgsIGZvbGRlciksICgpID0+IHtcclxuXHRcdFx0XHRcdFx0emlwZmlsZS5vcGVuUmVhZFN0cmVhbShlbnRyeSwgZnVuY3Rpb24gKGVyciwgcmVhZFN0cmVhbSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChlcnIpIHRocm93IGVycjtcclxuXHJcblx0XHRcdFx0XHRcdFx0cmVhZFN0cmVhbS5vbihcImVuZFwiLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdFx0XHR6aXBmaWxlLnJlYWRFbnRyeSgpO1xyXG5cdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdGxldCBmaWxlTmFtZSA9IHBhdGguam9pbihvdXRwdXRQYXRoLCBlbnRyeS5maWxlTmFtZSk7XHJcblx0XHRcdFx0XHRcdFx0bGV0IGZvbGRlciA9IHBhdGguZGlybmFtZShmaWxlTmFtZSk7XHJcblx0XHRcdFx0XHRcdFx0JCQuZW5zdXJlRm9sZGVyRXhpc3RzKGZvbGRlciwgKCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdFx0bGV0IG91dHB1dCA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGZpbGVOYW1lKTtcclxuXHRcdFx0XHRcdFx0XHRcdHJlYWRTdHJlYW0ucGlwZShvdXRwdXQpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcblxyXG4vLyBuZXcgUHNrQXJjaGl2ZXIoKS56aXAoXCJDOlxcXFxVc2Vyc1xcXFxBY2VyXFxcXFdlYnN0b3JtUHJvamVjdHNcXFxccHJpdmF0ZXNreVxcXFx0ZXN0c1xcXFxwc2stdW5pdC10ZXN0aW5nXFxcXHppcFxcXFxpbnB1dFxcXFx0ZXN0XCIsIFwiQzpcXFxcVXNlcnNcXFxcQWNlclxcXFxXZWJzdG9ybVByb2plY3RzXFxcXHByaXZhdGVza3lcXFxcdGVzdHNcXFxccHNrLXVuaXQtdGVzdGluZ1xcXFx6aXBcXFxcaW5wdXRcXFxcdGVzdFxcXFxvdXRwdXRcIik7XHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IFBza0FyY2hpdmVyKCk7IiwiXHJcbmNvbnN0IGNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xyXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XHJcbmNvbnN0IHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcclxuY29uc3QgaXNTdHJlYW0gPSByZXF1aXJlKFwiLi9pc1N0cmVhbVwiKTtcclxuY29uc3QgYXJjaGl2ZXIgPSByZXF1aXJlKFwiLi4vcHNrLWFyY2hpdmVyXCIpO1xyXG5jb25zdCBhbGdvcml0aG0gPSAnYWVzLTI1Ni1nY20nO1xyXG5mdW5jdGlvbiBlbmNvZGUoYnVmZmVyKSB7XHJcblx0cmV0dXJuIGJ1ZmZlci50b1N0cmluZygnYmFzZTY0JylcclxuXHRcdC5yZXBsYWNlKC9cXCsvZywgJycpXHJcblx0XHQucmVwbGFjZSgvXFwvL2csICcnKVxyXG5cdFx0LnJlcGxhY2UoLz0rJC8sICcnKTtcclxufVxyXG5mdW5jdGlvbiBkZWxldGVGb2xkZXIoZm9sZGVyUGF0aCkge1xyXG5cdHZhciBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGZvbGRlclBhdGgpO1xyXG5cdGZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcclxuXHRcdHZhciB0ZW1wUGF0aCA9IHBhdGguam9pbihmb2xkZXJQYXRoLCBmaWxlKTtcclxuXHRcdGlmKGZzLnN0YXRTeW5jKHRlbXBQYXRoKS5pc0RpcmVjdG9yeSgpKXtcclxuXHRcdFx0ZGVsZXRlRm9sZGVyKHRlbXBQYXRoKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRmcy51bmxpbmtTeW5jKHRlbXBQYXRoKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRmcy5ybWRpclN5bmMoZm9sZGVyUGF0aCk7XHJcbn1cclxuZnVuY3Rpb24gZW5jcnlwdEZpbGUoaW5wdXRQYXRoLCBkZXN0aW5hdGlvblBhdGgsIHBhc3N3b3JkKXtcclxuXHRpZighZnMuZXhpc3RzU3luYyhwYXRoLmRpcm5hbWUoZGVzdGluYXRpb25QYXRoKSkpe1xyXG5cdFx0ZnMubWtkaXJTeW5jKHBhdGguZGlybmFtZShkZXN0aW5hdGlvblBhdGgpKTtcclxuXHR9XHJcblx0aWYoIWZzLmV4aXN0c1N5bmMoZGVzdGluYXRpb25QYXRoKSl7XHJcblx0XHRmcy53cml0ZUZpbGVTeW5jKGRlc3RpbmF0aW9uUGF0aCxcIlwiKTtcclxuXHR9XHJcblx0dmFyIHdzID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdGluYXRpb25QYXRoLCB7YXV0b0Nsb3NlOiBmYWxzZX0pO1xyXG5cdHZhciBrZXlTYWx0ICAgICAgID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDMyKTtcclxuXHR2YXIga2V5ICAgICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBrZXlTYWx0LCAxMDAwMCwgMzIsICdzaGE1MTInKTtcclxuXHJcblx0dmFyIGFhZFNhbHQgICAgICAgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoMzIpO1xyXG5cdHZhciBhYWQgICAgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIGFhZFNhbHQsIDEwMDAwLCAzMiwgJ3NoYTUxMicpO1xyXG5cclxuXHR2YXIgc2FsdCAgICAgICAgICA9IEJ1ZmZlci5jb25jYXQoW2tleVNhbHQsIGFhZFNhbHRdKTtcclxuXHR2YXIgaXYgICAgICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBzYWx0LCAxMDAwMCwgMTIsICdzaGE1MTInKTtcclxuXHJcblx0dmFyIGNpcGhlciAgICAgICAgPSBjcnlwdG8uY3JlYXRlQ2lwaGVyaXYoYWxnb3JpdGhtLCBrZXksIGl2KTtcclxuXHRjaXBoZXIuc2V0QUFEKGFhZCk7XHJcblxyXG5cdGFyY2hpdmVyLnppcChpbnB1dFBhdGgsIGNpcGhlciwgZnVuY3Rpb24gKGVyciwgY2lwaGVyU3RyZWFtKSB7XHJcblx0XHRjaXBoZXJTdHJlYW0ub24oXCJkYXRhXCIsIGZ1bmN0aW9uIChjaHVuaykge1xyXG5cdFx0XHR3cy53cml0ZShjaHVuaylcclxuXHRcdH0pO1xyXG5cdFx0Y2lwaGVyU3RyZWFtLm9uKCdlbmQnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHZhciB0YWcgPSBjaXBoZXIuZ2V0QXV0aFRhZygpO1xyXG5cdFx0XHR2YXIgZGF0YVRvQXBwZW5kID0gQnVmZmVyLmNvbmNhdChbc2FsdCwgdGFnXSk7XHJcblx0XHRcdHdzLndyaXRlKGRhdGFUb0FwcGVuZCwgZnVuY3Rpb24gKGVycikge1xyXG5cdFx0XHRcdGlmKGVycikge1xyXG5cdFx0XHRcdFx0dGhyb3cgZXJyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR3cy5jbG9zZSgpO1xyXG5cdFx0XHRcdGZzLmxzdGF0KGlucHV0UGF0aCwgZnVuY3Rpb24gKGVyciwgc3RhdHMpIHtcclxuXHRcdFx0XHRcdGlmKGVycil7XHJcblx0XHRcdFx0XHRcdHRocm93IGVycjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKHN0YXRzLmlzRGlyZWN0b3J5KCkpe1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhcImRlbGV0ZSBmb2xkZXJcIik7XHJcblx0XHRcdFx0XHRcdGRlbGV0ZUZvbGRlcihpbnB1dFBhdGgpO1xyXG5cdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKFwidW5saW5rXCIpO1xyXG5cdFx0XHRcdFx0XHRmcy51bmxpbmtTeW5jKGlucHV0UGF0aCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIkVuZFwiKVxyXG5cdFx0XHRcdH0pXHJcblx0XHRcdH0pXHJcblx0XHR9KTtcclxuXHR9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGVjcnlwdEZpbGUoZW5jcnlwdGVkSW5wdXRQYXRoLCB0ZW1wRm9sZGVyLCBwYXNzd29yZCwgY2FsbGJhY2spIHtcclxuXHRjb25zdCBzdGF0cyAgICAgICAgICAgPSBmcy5zdGF0U3luYyhlbmNyeXB0ZWRJbnB1dFBhdGgpO1xyXG5cdGNvbnN0IGZpbGVTaXplSW5CeXRlcyA9IHN0YXRzLnNpemU7XHJcblx0Y29uc3QgZmQgICAgICAgICAgICAgID0gZnMub3BlblN5bmMoZW5jcnlwdGVkSW5wdXRQYXRoLCBcInJcIik7XHJcblx0dmFyIGVuY3J5cHRlZEF1dGhEYXRhID0gQnVmZmVyLmFsbG9jKDgwKTtcclxuXHJcblx0ZnMucmVhZFN5bmMoZmQsIGVuY3J5cHRlZEF1dGhEYXRhLCAwLCA4MCwgZmlsZVNpemVJbkJ5dGVzIC0gODApO1xyXG5cdHZhciBzYWx0ICAgICAgID0gZW5jcnlwdGVkQXV0aERhdGEuc2xpY2UoMCwgNjQpO1xyXG5cdHZhciBrZXlTYWx0ICAgID0gc2FsdC5zbGljZSgwLCAzMik7XHJcblx0dmFyIGFhZFNhbHQgICAgPSBzYWx0LnNsaWNlKC0zMik7XHJcblxyXG5cdHZhciBpdiAgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIHNhbHQsIDEwMDAwLCAxMiwgJ3NoYTUxMicpO1xyXG5cdHZhciBrZXkgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIGtleVNhbHQsIDEwMDAwLCAzMiwgJ3NoYTUxMicpO1xyXG5cdHZhciBhYWQgICAgICAgID0gY3J5cHRvLnBia2RmMlN5bmMocGFzc3dvcmQsIGFhZFNhbHQsIDEwMDAwLCAzMiwgJ3NoYTUxMicpO1xyXG5cdHZhciB0YWcgICAgICAgID0gZW5jcnlwdGVkQXV0aERhdGEuc2xpY2UoLTE2KTtcclxuXHJcblx0dmFyIGRlY2lwaGVyICAgPSBjcnlwdG8uY3JlYXRlRGVjaXBoZXJpdihhbGdvcml0aG0sIGtleSwgaXYpO1xyXG5cclxuXHRkZWNpcGhlci5zZXRBQUQoYWFkKTtcclxuXHRkZWNpcGhlci5zZXRBdXRoVGFnKHRhZyk7XHJcblx0dmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbShlbmNyeXB0ZWRJbnB1dFBhdGgsIHtzdGFydDogMCwgZW5kOiBmaWxlU2l6ZUluQnl0ZXMgLSA4MX0pO1xyXG5cdGlmKCFmcy5leGlzdHNTeW5jKHRlbXBGb2xkZXIpKXtcclxuXHRcdGZzLm1rZGlyU3luYyh0ZW1wRm9sZGVyKTtcclxuXHR9XHJcblx0dmFyIHRlbXBBcmNoaXZlUGF0aCA9IHBhdGguam9pbih0ZW1wRm9sZGVyLCBwYXRoLmJhc2VuYW1lKGVuY3J5cHRlZElucHV0UGF0aCkrXCIuemlwXCIpO1xyXG5cdGlmKCFmcy5leGlzdHNTeW5jKHRlbXBBcmNoaXZlUGF0aCkpe1xyXG5cdFx0ZnMud3JpdGVGaWxlU3luYyh0ZW1wQXJjaGl2ZVBhdGgpO1xyXG5cdH1cclxuXHR2YXIgd3MgPSBmcy5jcmVhdGVXcml0ZVN0cmVhbSh0ZW1wQXJjaGl2ZVBhdGgsIHthdXRvQ2xvc2U6IGZhbHNlfSk7XHJcblx0d3Mub24oXCJmaW5pc2hcIiwgZnVuY3Rpb24gKGVycikge1xyXG5cdFx0aWYoZXJyKXtcclxuXHRcdFx0dGhyb3cgZXJyO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHdzLmNsb3NlKCk7XHJcblx0XHRcdC8vIGRlbGV0ZUZvbGRlcih0ZW1wRm9sZGVyKTtcclxuXHRcdFx0dmFyIG5ld1BhdGggPSBwYXRoLmpvaW4ocGF0aC5ub3JtYWxpemUoZW5jcnlwdGVkSW5wdXRQYXRoK1wiLy4uXCIpLCBlbmNvZGUoY3J5cHRvLnJhbmRvbUJ5dGVzKDMyKSkpO1xyXG5cdFx0XHRmcy5yZW5hbWVTeW5jKGVuY3J5cHRlZElucHV0UGF0aCwgbmV3UGF0aCk7XHJcblx0XHRcdGZzLnVubGlua1N5bmMobmV3UGF0aCk7XHJcblx0XHRcdC8vIGZzLnVubGlua1N5bmModGVtcEFyY2hpdmVQYXRoKTtcclxuXHRcdFx0Y2FsbGJhY2sobnVsbCwgdGVtcEFyY2hpdmVQYXRoKTtcclxuXHJcblx0XHR9XHJcblx0fSk7XHJcblx0cnMucGlwZShkZWNpcGhlcikucGlwZSh3cyk7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVQc2tIYXNoKGRhdGEpe1xyXG5cdHZhciBoYXNoNTEyID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTUxMicpO1xyXG5cdHZhciBoYXNoMjU2ID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTI1NicpO1xyXG5cdGhhc2g1MTIudXBkYXRlKGRhdGEpO1xyXG5cdGhhc2gyNTYudXBkYXRlKGhhc2g1MTIuZGlnZXN0KCkpO1xyXG5cdHJldHVybiBoYXNoMjU2LmRpZ2VzdCgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0pzb24oZGF0YSl7XHJcblx0dHJ5e1xyXG5cdFx0SlNPTi5wYXJzZShkYXRhKTtcclxuXHR9Y2F0Y2goZSl7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZW5lcmF0ZVNhbHQoaW5wdXREYXRhLCBzYWx0TGVuKXtcclxuXHR2YXIgaGFzaCAgID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTUxMicpO1xyXG5cdGhhc2gudXBkYXRlKGlucHV0RGF0YSk7XHJcblx0dmFyIGRpZ2VzdCA9IEJ1ZmZlci5mcm9tKGhhc2guZGlnZXN0KCdoZXgnKSwgJ2JpbmFyeScpO1xyXG5cclxuXHRyZXR1cm4gZGlnZXN0LnNsaWNlKDAsIHNhbHRMZW4pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBlbmNyeXB0KGRhdGEsIHBhc3N3b3JkKXtcclxuXHR2YXIga2V5U2FsdCAgICAgICA9IGNyeXB0by5yYW5kb21CeXRlcygzMik7XHJcblx0dmFyIGtleSAgICAgICAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwga2V5U2FsdCwgMTAwMDAsIDMyLCAnc2hhNTEyJyk7XHJcblxyXG5cdHZhciBhYWRTYWx0ICAgICAgID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDMyKTtcclxuXHR2YXIgYWFkICAgICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBhYWRTYWx0LCAxMDAwMCwgMzIsICdzaGE1MTInKTtcclxuXHJcblx0dmFyIHNhbHQgICAgICAgICAgPSBCdWZmZXIuY29uY2F0KFtrZXlTYWx0LCBhYWRTYWx0XSk7XHJcblx0dmFyIGl2ICAgICAgICAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwgc2FsdCwgMTAwMDAsIDEyLCAnc2hhNTEyJyk7XHJcblxyXG5cdHZhciBjaXBoZXIgICAgICAgID0gY3J5cHRvLmNyZWF0ZUNpcGhlcml2KGFsZ29yaXRobSwga2V5LCBpdik7XHJcblx0Y2lwaGVyLnNldEFBRChhYWQpO1xyXG5cdHZhciBlbmNyeXB0ZWRUZXh0ID0gY2lwaGVyLnVwZGF0ZShkYXRhLCdiaW5hcnknKTtcclxuXHR2YXIgZmluYWwgPSBCdWZmZXIuZnJvbShjaXBoZXIuZmluYWwoJ2JpbmFyeScpLCdiaW5hcnknKTtcclxuXHR2YXIgdGFnID0gY2lwaGVyLmdldEF1dGhUYWcoKTtcclxuXHJcblx0ZW5jcnlwdGVkVGV4dCA9IEJ1ZmZlci5jb25jYXQoW2VuY3J5cHRlZFRleHQsIGZpbmFsXSk7XHJcblxyXG5cdHJldHVybiBCdWZmZXIuY29uY2F0KFtzYWx0LCBlbmNyeXB0ZWRUZXh0LCB0YWddKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGVjcnlwdChlbmNyeXB0ZWREYXRhLCBwYXNzd29yZCl7XHJcblx0dmFyIHNhbHQgICAgICAgPSBlbmNyeXB0ZWREYXRhLnNsaWNlKDAsIDY0KTtcclxuXHR2YXIga2V5U2FsdCAgICA9IHNhbHQuc2xpY2UoMCwgMzIpO1xyXG5cdHZhciBhYWRTYWx0ICAgID0gc2FsdC5zbGljZSgtMzIpO1xyXG5cclxuXHR2YXIgaXYgICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBzYWx0LCAxMDAwMCwgMTIsICdzaGE1MTInKTtcclxuXHR2YXIga2V5ICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBrZXlTYWx0LCAxMDAwMCwgMzIsICdzaGE1MTInKTtcclxuXHR2YXIgYWFkICAgICAgICA9IGNyeXB0by5wYmtkZjJTeW5jKHBhc3N3b3JkLCBhYWRTYWx0LCAxMDAwMCwgMzIsICdzaGE1MTInKTtcclxuXHJcblx0dmFyIGNpcGhlcnRleHQgPSBlbmNyeXB0ZWREYXRhLnNsaWNlKDY0LCBlbmNyeXB0ZWREYXRhLmxlbmd0aCAtIDE2KTtcclxuXHR2YXIgdGFnICAgICAgICA9IGVuY3J5cHRlZERhdGEuc2xpY2UoLTE2KTtcclxuXHJcblx0dmFyIGRlY2lwaGVyICAgPSBjcnlwdG8uY3JlYXRlRGVjaXBoZXJpdihhbGdvcml0aG0sIGtleSwgaXYpO1xyXG5cdGRlY2lwaGVyLnNldEF1dGhUYWcodGFnKTtcclxuXHRkZWNpcGhlci5zZXRBQUQoYWFkKTtcclxuXHJcblx0dmFyIHBsYWludGV4dCAgPSBCdWZmZXIuZnJvbShkZWNpcGhlci51cGRhdGUoY2lwaGVydGV4dCwgJ2JpbmFyeScpLCAnYmluYXJ5Jyk7XHJcblx0dmFyIGZpbmFsICAgICAgPSBCdWZmZXIuZnJvbShkZWNpcGhlci5maW5hbCgnYmluYXJ5JyksICdiaW5hcnknKTtcclxuXHRwbGFpbnRleHQgICAgICA9IEJ1ZmZlci5jb25jYXQoW3BsYWludGV4dCwgZmluYWxdKTtcclxuXHJcblx0cmV0dXJuIHBsYWludGV4dDtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGRlcml2ZUtleShwYXNzd29yZCwgaXRlcmF0aW9ucywgZGtMZW4pIHtcclxuXHRpdGVyYXRpb25zID0gaXRlcmF0aW9ucyB8fCAxMDAwMDtcclxuXHRka0xlbiAgICAgID0gZGtMZW4gfHwgMzI7XHJcblx0dmFyIHNhbHQgICA9IGdlbmVyYXRlU2FsdChwYXNzd29yZCwgMzIpO1xyXG5cdHZhciBkayAgICAgPSBjcnlwdG8ucGJrZGYyU3luYyhwYXNzd29yZCwgc2FsdCwgaXRlcmF0aW9ucywgZGtMZW4sICdzaGE1MTInKTtcclxuXHRyZXR1cm4gQnVmZmVyLmZyb20oZGspO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRjcmVhdGVQc2tIYXNoLFxyXG5cdGVuY3J5cHQsXHJcblx0ZW5jcnlwdEZpbGUsXHJcblx0ZGVjcnlwdCxcclxuXHRkZWNyeXB0RmlsZSxcclxuXHRkZWxldGVGb2xkZXIsXHJcblx0ZGVyaXZlS2V5LFxyXG5cdGVuY29kZSxcclxuXHRpc0pzb24sXHJcbn07XHJcblxyXG5cclxuIiwidmFyIHN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpXHJcblxyXG5cclxuZnVuY3Rpb24gaXNTdHJlYW0gKG9iaikge1xyXG5cdHJldHVybiBvYmogaW5zdGFuY2VvZiBzdHJlYW0uU3RyZWFtXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBpc1JlYWRhYmxlIChvYmopIHtcclxuXHRyZXR1cm4gaXNTdHJlYW0ob2JqKSAmJiB0eXBlb2Ygb2JqLl9yZWFkID09ICdmdW5jdGlvbicgJiYgdHlwZW9mIG9iai5fcmVhZGFibGVTdGF0ZSA9PSAnb2JqZWN0J1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gaXNXcml0YWJsZSAob2JqKSB7XHJcblx0cmV0dXJuIGlzU3RyZWFtKG9iaikgJiYgdHlwZW9mIG9iai5fd3JpdGUgPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb2JqLl93cml0YWJsZVN0YXRlID09ICdvYmplY3QnXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBpc0R1cGxleCAob2JqKSB7XHJcblx0cmV0dXJuIGlzUmVhZGFibGUob2JqKSAmJiBpc1dyaXRhYmxlKG9iailcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzICAgICAgICAgICAgPSBpc1N0cmVhbTtcclxubW9kdWxlLmV4cG9ydHMuaXNSZWFkYWJsZSA9IGlzUmVhZGFibGU7XHJcbm1vZHVsZS5leHBvcnRzLmlzV3JpdGFibGUgPSBpc1dyaXRhYmxlO1xyXG5tb2R1bGUuZXhwb3J0cy5pc0R1cGxleCAgID0gaXNEdXBsZXg7IiwiLypcclxuIFNpZ25TZW5zIGhlbHBlciBmdW5jdGlvbnNcclxuICovXHJcbmNvbnN0IGNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xyXG5cclxuZXhwb3J0cy53aXBlT3V0c2lkZVBheWxvYWQgPSBmdW5jdGlvbiB3aXBlT3V0c2lkZVBheWxvYWQoaGFzaFN0cmluZ0hleGEsIHBvcywgc2l6ZSl7XHJcbiAgICB2YXIgcmVzdWx0O1xyXG4gICAgdmFyIHN6ID0gaGFzaFN0cmluZ0hleGEubGVuZ3RoO1xyXG5cclxuICAgIHZhciBlbmQgPSAocG9zICsgc2l6ZSkgJSBzejtcclxuXHJcbiAgICBpZihwb3MgPCBlbmQpe1xyXG4gICAgICAgIHJlc3VsdCA9ICcwJy5yZXBlYXQocG9zKSArICBoYXNoU3RyaW5nSGV4YS5zdWJzdHJpbmcocG9zLCBlbmQpICsgJzAnLnJlcGVhdChzeiAtIGVuZCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXN1bHQgPSBoYXNoU3RyaW5nSGV4YS5zdWJzdHJpbmcoMCwgZW5kKSArICcwJy5yZXBlYXQocG9zIC0gZW5kKSArIGhhc2hTdHJpbmdIZXhhLnN1YnN0cmluZyhwb3MsIHN6KTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcblxyXG5cclxuZXhwb3J0cy5leHRyYWN0UGF5bG9hZCA9IGZ1bmN0aW9uIGV4dHJhY3RQYXlsb2FkKGhhc2hTdHJpbmdIZXhhLCBwb3MsIHNpemUpe1xyXG4gICAgdmFyIHJlc3VsdDtcclxuXHJcbiAgICB2YXIgc3ogPSBoYXNoU3RyaW5nSGV4YS5sZW5ndGg7XHJcbiAgICB2YXIgZW5kID0gKHBvcyArIHNpemUpICUgc3o7XHJcblxyXG4gICAgaWYoIHBvcyA8IGVuZCl7XHJcbiAgICAgICAgcmVzdWx0ID0gaGFzaFN0cmluZ0hleGEuc3Vic3RyaW5nKHBvcywgcG9zICsgc2l6ZSk7XHJcbiAgICB9IGVsc2V7XHJcblxyXG4gICAgICAgIGlmKDAgIT0gZW5kKXtcclxuICAgICAgICAgICAgcmVzdWx0ID0gaGFzaFN0cmluZ0hleGEuc3Vic3RyaW5nKDAsIGVuZClcclxuICAgICAgICB9ICBlbHNlIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0ICs9IGhhc2hTdHJpbmdIZXhhLnN1YnN0cmluZyhwb3MsIHN6KTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcblxyXG5cclxuZXhwb3J0cy5maWxsUGF5bG9hZCA9IGZ1bmN0aW9uIGZpbGxQYXlsb2FkKHBheWxvYWQsIHBvcywgc2l6ZSl7XHJcbiAgICB2YXIgc3ogPSA2NDtcclxuICAgIHZhciByZXN1bHQgPSBcIlwiO1xyXG5cclxuICAgIHZhciBlbmQgPSAocG9zICsgc2l6ZSkgJSBzejtcclxuXHJcbiAgICBpZiggcG9zIDwgZW5kKXtcclxuICAgICAgICByZXN1bHQgPSAnMCcucmVwZWF0KHBvcykgKyBwYXlsb2FkICsgJzAnLnJlcGVhdChzeiAtIGVuZCk7XHJcbiAgICB9IGVsc2V7XHJcbiAgICAgICAgcmVzdWx0ID0gcGF5bG9hZC5zdWJzdHJpbmcoMCxlbmQpO1xyXG4gICAgICAgIHJlc3VsdCArPSAnMCcucmVwZWF0KHBvcyAtIGVuZCk7XHJcbiAgICAgICAgcmVzdWx0ICs9IHBheWxvYWQuc3Vic3RyaW5nKGVuZCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5cclxuXHJcbmV4cG9ydHMuZ2VuZXJhdGVQb3NIYXNoWFRpbWVzID0gZnVuY3Rpb24gZ2VuZXJhdGVQb3NIYXNoWFRpbWVzKGJ1ZmZlciwgcG9zLCBzaXplLCBjb3VudCl7IC8vZ2VuZXJhdGUgcG9zaXRpb25hbCBoYXNoXHJcbiAgICB2YXIgcmVzdWx0ICA9IGJ1ZmZlci50b1N0cmluZyhcImhleFwiKTtcclxuXHJcbiAgICAvKmlmKHBvcyAhPSAtMSApXHJcbiAgICAgICAgcmVzdWx0W3Bvc10gPSAwOyAqL1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKXtcclxuICAgICAgICB2YXIgaGFzaCA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGEyNTYnKTtcclxuICAgICAgICByZXN1bHQgPSBleHBvcnRzLndpcGVPdXRzaWRlUGF5bG9hZChyZXN1bHQsIHBvcywgc2l6ZSk7XHJcbiAgICAgICAgaGFzaC51cGRhdGUocmVzdWx0KTtcclxuICAgICAgICByZXN1bHQgPSBoYXNoLmRpZ2VzdCgnaGV4Jyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZXhwb3J0cy53aXBlT3V0c2lkZVBheWxvYWQocmVzdWx0LCBwb3MsIHNpemUpO1xyXG59XHJcblxyXG5leHBvcnRzLmhhc2hTdHJpbmdBcnJheSA9IGZ1bmN0aW9uIChjb3VudGVyLCBhcnIsIHBheWxvYWRTaXplKXtcclxuXHJcbiAgICBjb25zdCBoYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTI1NicpO1xyXG4gICAgdmFyIHJlc3VsdCA9IGNvdW50ZXIudG9TdHJpbmcoMTYpO1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDAgOyBpIDwgNjQ7IGkrKyl7XHJcbiAgICAgICAgcmVzdWx0ICs9IGV4cG9ydHMuZXh0cmFjdFBheWxvYWQoYXJyW2ldLGksIHBheWxvYWRTaXplKTtcclxuICAgIH1cclxuXHJcbiAgICBoYXNoLnVwZGF0ZShyZXN1bHQpO1xyXG4gICAgdmFyIHJlc3VsdCA9IGhhc2guZGlnZXN0KCdoZXgnKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gZHVtcE1lbWJlcihvYmope1xyXG4gICAgdmFyIHR5cGUgPSBBcnJheS5pc0FycmF5KG9iaikgPyBcImFycmF5XCIgOiB0eXBlb2Ygb2JqO1xyXG4gICAgaWYob2JqID09PSBudWxsKXtcclxuICAgICAgICByZXR1cm4gXCJudWxsXCI7XHJcbiAgICB9XHJcbiAgICBpZihvYmogPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgcmV0dXJuIFwidW5kZWZpbmVkXCI7XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoKHR5cGUpe1xyXG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcclxuICAgICAgICBjYXNlIFwic3RyaW5nXCI6cmV0dXJuIG9iai50b1N0cmluZygpOyBicmVhaztcclxuICAgICAgICBjYXNlIFwib2JqZWN0XCI6IHJldHVybiBleHBvcnRzLmR1bXBPYmplY3RGb3JIYXNoaW5nKG9iaik7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJib29sZWFuXCI6IHJldHVybiAgb2JqPyBcInRydWVcIjogXCJmYWxzZVwiOyBicmVhaztcclxuICAgICAgICBjYXNlIFwiYXJyYXlcIjpcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaT0wOyBpIDwgb2JqLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBleHBvcnRzLmR1bXBPYmplY3RGb3JIYXNoaW5nKG9ialtpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVHlwZSBcIiArICB0eXBlICsgXCIgY2Fubm90IGJlIGNyeXB0b2dyYXBoaWNhbGx5IGRpZ2VzdGVkXCIpO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuXHJcbmV4cG9ydHMuZHVtcE9iamVjdEZvckhhc2hpbmcgPSBmdW5jdGlvbihvYmope1xyXG4gICAgdmFyIHJlc3VsdCA9IFwiXCI7XHJcblxyXG4gICAgaWYob2JqID09PSBudWxsKXtcclxuICAgICAgICByZXR1cm4gXCJudWxsXCI7XHJcbiAgICB9XHJcbiAgICBpZihvYmogPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgcmV0dXJuIFwidW5kZWZpbmVkXCI7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGJhc2ljVHlwZXMgPSB7XHJcbiAgICAgICAgXCJhcnJheVwiICAgICA6IHRydWUsXHJcbiAgICAgICAgXCJudW1iZXJcIiAgICA6IHRydWUsXHJcbiAgICAgICAgXCJib29sZWFuXCIgICA6IHRydWUsXHJcbiAgICAgICAgXCJzdHJpbmdcIiAgICA6IHRydWUsXHJcbiAgICAgICAgXCJvYmplY3RcIiAgICA6IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHR5cGUgPSBBcnJheS5pc0FycmF5KG9iaikgPyBcImFycmF5XCIgOiB0eXBlb2Ygb2JqO1xyXG4gICAgaWYoIGJhc2ljVHlwZXNbdHlwZV0pe1xyXG4gICAgICAgIHJldHVybiBkdW1wTWVtYmVyKG9iaik7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xyXG4gICAga2V5cy5zb3J0KCk7XHJcblxyXG5cclxuICAgIGZvcih2YXIgaT0wOyBpIDwga2V5cy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgcmVzdWx0ICs9IGR1bXBNZW1iZXIoa2V5c1tpXSk7XHJcbiAgICAgICAgcmVzdWx0ICs9IGR1bXBNZW1iZXIob2JqW2tleXNbaV1dKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5cclxuZXhwb3J0cy5oYXNoVmFsdWVzICA9IGZ1bmN0aW9uICh2YWx1ZXMpe1xyXG4gICAgY29uc3QgaGFzaCA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGEyNTYnKTtcclxuICAgIHZhciByZXN1bHQgPSBleHBvcnRzLmR1bXBPYmplY3RGb3JIYXNoaW5nKHZhbHVlcyk7XHJcbiAgICBoYXNoLnVwZGF0ZShyZXN1bHQpO1xyXG4gICAgcmV0dXJuIGhhc2guZGlnZXN0KCdoZXgnKTtcclxufTtcclxuXHJcbmV4cG9ydHMuZ2V0SlNPTkZyb21TaWduYXR1cmUgPSBmdW5jdGlvbiBnZXRKU09ORnJvbVNpZ25hdHVyZShzaWduYXR1cmUsIHNpemUpe1xyXG4gICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgICBwcm9vZjpbXVxyXG4gICAgfTtcclxuICAgIHZhciBhID0gc2lnbmF0dXJlLnNwbGl0KFwiOlwiKTtcclxuICAgIHJlc3VsdC5hZ2VudCAgICAgICAgPSBhWzBdO1xyXG4gICAgcmVzdWx0LmNvdW50ZXIgICAgICA9ICBwYXJzZUludChhWzFdLCBcImhleFwiKTtcclxuICAgIHJlc3VsdC5uZXh0UHVibGljICAgPSAgYVsyXTtcclxuXHJcbiAgICB2YXIgcHJvb2YgPSBhWzNdXHJcblxyXG5cclxuICAgIGlmKHByb29mLmxlbmd0aC9zaXplICE9IDY0KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBzaWduYXR1cmUgXCIgKyBwcm9vZik7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IDY0OyBpKyspe1xyXG4gICAgICAgIHJlc3VsdC5wcm9vZi5wdXNoKGV4cG9ydHMuZmlsbFBheWxvYWQocHJvb2Yuc3Vic3RyaW5nKGkgKiBzaXplLChpKzEpICogc2l6ZSApLCBpLCBzaXplKSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnRzLmNyZWF0ZVNpZ25hdHVyZSA9IGZ1bmN0aW9uIChhZ2VudCxjb3VudGVyLCBuZXh0UHVibGljLCBhcnIsIHNpemUpe1xyXG4gICAgdmFyIHJlc3VsdCA9IFwiXCI7XHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgcmVzdWx0ICs9IGV4cG9ydHMuZXh0cmFjdFBheWxvYWQoYXJyW2ldLCBpICwgc2l6ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFnZW50ICsgXCI6XCIgKyBjb3VudGVyICsgXCI6XCIgKyBuZXh0UHVibGljICsgXCI6XCIgKyByZXN1bHQ7XHJcbn0iLCIiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRcdFx0XHRcdGJlZXNIZWFsZXI6IHJlcXVpcmUoXCIuL2xpYi9iZWVzSGVhbGVyXCIpLFxyXG5cdFx0XHRcdFx0c291bmRQdWJTdWI6IHJlcXVpcmUoXCIuL2xpYi9zb3VuZFB1YlN1YlwiKS5zb3VuZFB1YlN1YlxyXG5cdFx0XHRcdFx0Ly9mb2xkZXJNUTogcmVxdWlyZShcIi4vbGliL2ZvbGRlck1RXCIpXHJcbn07IiwiZnVuY3Rpb24gUXVldWVFbGVtZW50KGNvbnRlbnQpIHtcclxuXHR0aGlzLmNvbnRlbnQgPSBjb250ZW50O1xyXG5cdHRoaXMubmV4dCA9IG51bGw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFF1ZXVlKCkge1xyXG5cdHRoaXMuaGVhZCA9IG51bGw7XHJcblx0dGhpcy50YWlsID0gbnVsbDtcclxuXHJcblx0dGhpcy5wdXNoID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcblx0XHRsZXQgbmV3RWxlbWVudCA9IG5ldyBRdWV1ZUVsZW1lbnQodmFsdWUpO1xyXG5cdFx0aWYgKCF0aGlzLmhlYWQpIHtcclxuXHRcdFx0dGhpcy5oZWFkID0gbmV3RWxlbWVudDtcclxuXHRcdFx0dGhpcy50YWlsID0gbmV3RWxlbWVudDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMudGFpbC5uZXh0ID0gbmV3RWxlbWVudDtcclxuXHRcdFx0dGhpcy50YWlsID0gbmV3RWxlbWVudFxyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdHRoaXMucG9wID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0aWYgKCF0aGlzLmhlYWQpIHtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblx0XHRjb25zdCBoZWFkQ29weSA9IHRoaXMuaGVhZDtcclxuXHRcdHRoaXMuaGVhZCA9IHRoaXMuaGVhZC5uZXh0O1xyXG5cdFx0cmV0dXJuIGhlYWRDb3B5LmNvbnRlbnQ7XHJcblx0fTtcclxuXHJcblx0dGhpcy5mcm9udCA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiB0aGlzLmhlYWQgPyB0aGlzLmhlYWQuY29udGVudCA6IHVuZGVmaW5lZDtcclxuXHR9O1xyXG5cclxuXHR0aGlzLmlzRW1wdHkgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5oZWFkID09IG51bGw7XHJcblx0fTtcclxuXHJcblx0dGhpc1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24qICgpIHtcclxuXHRcdGxldCBoZWFkID0gdGhpcy5oZWFkO1xyXG5cdFx0d2hpbGUoaGVhZCAhPT0gbnVsbCkge1xyXG5cdFx0XHR5aWVsZCBoZWFkLmNvbnRlbnQ7XHJcblx0XHRcdGhlYWQgPSBoZWFkLm5leHQ7XHJcblx0XHR9XHJcblx0fS5iaW5kKHRoaXMpO1xyXG59XHJcblxyXG5RdWV1ZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcblx0bGV0IHN0cmluZ2lmaWVkUXVldWUgPSAnJztcclxuXHRsZXQgaXRlcmF0b3IgPSB0aGlzLmhlYWQ7XHJcblx0d2hpbGUgKGl0ZXJhdG9yKSB7XHJcblx0XHRzdHJpbmdpZmllZFF1ZXVlICs9IGAke0pTT04uc3RyaW5naWZ5KGl0ZXJhdG9yLmNvbnRlbnQpfSBgO1xyXG5cdFx0aXRlcmF0b3IgPSBpdGVyYXRvci5uZXh0O1xyXG5cdH1cclxuXHRyZXR1cm4gc3RyaW5naWZpZWRRdWV1ZVxyXG59O1xyXG5cclxuUXVldWUucHJvdG90eXBlLmluc3BlY3QgPSBRdWV1ZS5wcm90b3R5cGUudG9TdHJpbmc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXVlOyIsIlxyXG4vKlxyXG4gICAgUHJlcGFyZSB0aGUgc3RhdGUgb2YgYSBzd2FybSB0byBiZSBzZXJpYWxpc2VkXHJcbiovXHJcblxyXG5leHBvcnRzLmFzSlNPTiA9IGZ1bmN0aW9uKHZhbHVlT2JqZWN0LCBwaGFzZU5hbWUsIGFyZ3MsIGNhbGxiYWNrKXtcclxuXHJcbiAgICAgICAgdmFyIHZhbHVlT2JqZWN0ID0gdmFsdWVPYmplY3QudmFsdWVPZigpO1xyXG4gICAgICAgIHZhciByZXMgPSB7fTtcclxuICAgICAgICByZXMucHVibGljVmFycyAgICAgICAgICA9IHZhbHVlT2JqZWN0LnB1YmxpY1ZhcnM7XHJcbiAgICAgICAgcmVzLnByaXZhdGVWYXJzICAgICAgICAgPSB2YWx1ZU9iamVjdC5wcml2YXRlVmFycztcclxuICAgICAgICByZXMubWV0YSAgICAgICAgICAgICAgICA9IHt9O1xyXG5cclxuICAgICAgICByZXMubWV0YS5zd2FybVR5cGVOYW1lICA9IHZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1UeXBlTmFtZTtcclxuICAgICAgICByZXMubWV0YS5zd2FybUlkICAgICAgICA9IHZhbHVlT2JqZWN0Lm1ldGEuc3dhcm1JZDtcclxuICAgICAgICByZXMubWV0YS50YXJnZXQgICAgICAgICA9IHZhbHVlT2JqZWN0Lm1ldGEudGFyZ2V0O1xyXG5cclxuICAgICAgICBpZighcGhhc2VOYW1lKXtcclxuICAgICAgICAgICAgcmVzLm1ldGEuY29tbWFuZCAgICA9IFwic3RvcmVkXCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVzLm1ldGEucGhhc2VOYW1lICA9IHBoYXNlTmFtZTtcclxuICAgICAgICAgICAgcmVzLm1ldGEuYXJncyAgICAgICA9IGFyZ3M7XHJcbiAgICAgICAgICAgIHJlcy5tZXRhLmNvbW1hbmQgICAgPSB2YWx1ZU9iamVjdC5tZXRhLmNvbW1hbmQgfHwgXCJleGVjdXRlU3dhcm1QaGFzZVwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzLm1ldGEud2FpdFN0YWNrICA9IHZhbHVlT2JqZWN0Lm1ldGEud2FpdFN0YWNrOyAvL1RPRE86IHRoaW5rIGlmIGlzIG5vdCBiZXR0ZXIgdG8gYmUgZGVlcCBjbG9uZWQgYW5kIG5vdCByZWZlcmVuY2VkISEhXHJcblxyXG4gICAgICAgIGlmKGNhbGxiYWNrKXtcclxuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcImFzSlNPTjpcIiwgcmVzLCB2YWx1ZU9iamVjdCk7XHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxufVxyXG5cclxuZXhwb3J0cy5qc29uVG9OYXRpdmUgPSBmdW5jdGlvbihzZXJpYWxpc2VkVmFsdWVzLCByZXN1bHQpe1xyXG5cclxuICAgIGZvcih2YXIgdiBpbiBzZXJpYWxpc2VkVmFsdWVzLnB1YmxpY1ZhcnMpe1xyXG4gICAgICAgIHJlc3VsdC5wdWJsaWNWYXJzW3ZdID0gc2VyaWFsaXNlZFZhbHVlcy5wdWJsaWNWYXJzW3ZdO1xyXG5cclxuICAgIH07XHJcbiAgICBmb3IodmFyIHYgaW4gc2VyaWFsaXNlZFZhbHVlcy5wcml2YXRlVmFycyl7XHJcbiAgICAgICAgcmVzdWx0LnByaXZhdGVWYXJzW3ZdID0gc2VyaWFsaXNlZFZhbHVlcy5wcml2YXRlVmFyc1t2XTtcclxuICAgIH07XHJcblxyXG4gICAgZm9yKHZhciB2IGluIHNlcmlhbGlzZWRWYWx1ZXMubWV0YSl7XHJcbiAgICAgICAgcmVzdWx0Lm1ldGFbdl0gPSBzZXJpYWxpc2VkVmFsdWVzLm1ldGFbdl07XHJcbiAgICB9O1xyXG5cclxufSIsIi8qXHJcbkluaXRpYWwgTGljZW5zZTogKGMpIEF4aW9sb2dpYyBSZXNlYXJjaCAmIEFsYm9haWUgU8OubmljxIMuXHJcbkNvbnRyaWJ1dG9yczogQXhpb2xvZ2ljIFJlc2VhcmNoICwgUHJpdmF0ZVNreSBwcm9qZWN0XHJcbkNvZGUgTGljZW5zZTogTEdQTCBvciBNSVQuXHJcbiovXHJcblxyXG5cclxuLyoqXHJcbiAqICAgVXN1YWxseSBhbiBldmVudCBjb3VsZCBjYXVzZSBleGVjdXRpb24gb2Ygb3RoZXIgY2FsbGJhY2sgZXZlbnRzIC4gV2Ugc2F5IHRoYXQgaXMgYSBsZXZlbCAxIGV2ZW50IGlmIGlzIGNhdXNlZWQgYnkgYSBsZXZlbCAwIGV2ZW50IGFuZCBzbyBvblxyXG4gKlxyXG4gKiAgICAgIFNvdW5kUHViU3ViIHByb3ZpZGVzIGludHVpdGl2ZSByZXN1bHRzIHJlZ2FyZGluZyB0byBhc3luY2hyb25vdXMgY2FsbHMgb2YgY2FsbGJhY2tzIGFuZCBjb21wdXRlZCB2YWx1ZXMvZXhwcmVzc2lvbnM6XHJcbiAqICAgd2UgcHJldmVudCBpbW1lZGlhdGUgZXhlY3V0aW9uIG9mIGV2ZW50IGNhbGxiYWNrcyB0byBlbnN1cmUgdGhlIGludHVpdGl2ZSBmaW5hbCByZXN1bHQgaXMgZ3VhcmFudGVlZCBhcyBsZXZlbCAwIGV4ZWN1dGlvblxyXG4gKiAgIHdlIGd1YXJhbnRlZSB0aGF0IGFueSBjYWxsYmFjayBmdW5jdGlvbiBpcyBcInJlLWVudHJhbnRcIlxyXG4gKiAgIHdlIGFyZSBhbHNvIHRyeWluZyB0byByZWR1Y2UgdGhlIG51bWJlciBvZiBjYWxsYmFjayBleGVjdXRpb24gYnkgbG9va2luZyBpbiBxdWV1ZXMgYXQgbmV3IG1lc3NhZ2VzIHB1Ymxpc2hlZCBieVxyXG4gKiAgIHRyeWluZyB0byBjb21wYWN0IHRob3NlIG1lc3NhZ2VzIChyZW1vdmluZyBkdXBsaWNhdGUgbWVzc2FnZXMsIG1vZGlmeWluZyBtZXNzYWdlcywgb3IgYWRkaW5nIGluIHRoZSBoaXN0b3J5IG9mIGFub3RoZXIgZXZlbnQgLGV0YylcclxuICpcclxuICogICAgICBFeGFtcGxlIG9mIHdoYXQgY2FuIGJlIHdyb25nIHdpdGhvdXQgbm9uLXNvdW5kIGFzeW5jaHJvbm91cyBjYWxsczpcclxuXHJcbiAqICBTdGVwIDA6IEluaXRpYWwgc3RhdGU6XHJcbiAqICAgYSA9IDA7XHJcbiAqICAgYiA9IDA7XHJcbiAqXHJcbiAqICBTdGVwIDE6IEluaXRpYWwgb3BlcmF0aW9uczpcclxuICogICBhID0gMTtcclxuICogICBiID0gLTE7XHJcbiAqXHJcbiAqICAvLyBhbiBvYnNlcnZlciByZWFjdHMgdG8gY2hhbmdlcyBpbiBhIGFuZCBiIGFuZCBjb21wdXRlIENPUlJFQ1QgbGlrZSB0aGlzOlxyXG4gKiAgIGlmKCBhICsgYiA9PSAwKSB7XHJcbiAqICAgICAgIENPUlJFQ1QgPSBmYWxzZTtcclxuICogICAgICAgbm90aWZ5KC4uLik7IC8vIGFjdCBvciBzZW5kIGEgbm90aWZpY2F0aW9uIHNvbWV3aGVyZS4uXHJcbiAqICAgfSBlbHNlIHtcclxuICogICAgICBDT1JSRUNUID0gZmFsc2U7XHJcbiAqICAgfVxyXG4gKlxyXG4gKiAgICBOb3RpY2UgdGhhdDogQ09SUkVDVCB3aWxsIGJlIHRydWUgaW4gdGhlIGVuZCAsIGJ1dCBtZWFudGltZSwgYWZ0ZXIgYSBub3RpZmljYXRpb24gd2FzIHNlbnQgYW5kIENPUlJFQ1Qgd2FzIHdyb25nbHksIHRlbXBvcmFyaWx5IGZhbHNlIVxyXG4gKiAgICBzb3VuZFB1YlN1YiBndWFyYW50ZWUgdGhhdCB0aGlzIGRvZXMgbm90IGhhcHBlbiBiZWNhdXNlIHRoZSBzeW5jcm9ub3VzIGNhbGwgd2lsbCBiZWZvcmUgYW55IG9ic2VydmVyIChib3QgYXNpZ25hdGlvbiBvbiBhIGFuZCBiKVxyXG4gKlxyXG4gKiAgIE1vcmU6XHJcbiAqICAgeW91IGNhbiB1c2UgYmxvY2tDYWxsQmFja3MgYW5kIHJlbGVhc2VDYWxsQmFja3MgaW4gYSBmdW5jdGlvbiB0aGF0IGNoYW5nZSBhIGxvdCBhIGNvbGxlY3Rpb24gb3IgYmluZGFibGUgb2JqZWN0cyBhbmQgYWxsXHJcbiAqICAgdGhlIG5vdGlmaWNhdGlvbnMgd2lsbCBiZSBzZW50IGNvbXBhY3RlZCBhbmQgcHJvcGVybHlcclxuICovXHJcblxyXG4vLyBUT0RPOiBvcHRpbWlzYXRpb24hPyB1c2UgYSBtb3JlIGVmZmljaWVudCBxdWV1ZSBpbnN0ZWFkIG9mIGFycmF5cyB3aXRoIHB1c2ggYW5kIHNoaWZ0IT9cclxuLy8gVE9ETzogc2VlIGhvdyBiaWcgdGhvc2UgcXVldWVzIGNhbiBiZSBpbiByZWFsIGFwcGxpY2F0aW9uc1xyXG4vLyBmb3IgYSBmZXcgaHVuZHJlZHMgaXRlbXMsIHF1ZXVlcyBtYWRlIGZyb20gYXJyYXkgc2hvdWxkIGJlIGVub3VnaFxyXG4vLyogICBQb3RlbnRpYWwgVE9ET3M6XHJcbi8vICAgICogICAgIHByZXZlbnQgYW55IGZvcm0gb2YgcHJvYmxlbSBieSBjYWxsaW5nIGNhbGxiYWNrcyBpbiB0aGUgZXhwZWN0ZWQgb3JkZXIgIT9cclxuLy8qICAgICBwcmV2ZW50aW5nIGluZmluaXRlIGxvb3BzIGV4ZWN1dGlvbiBjYXVzZSBieSBldmVudHMhP1xyXG4vLypcclxuLy8qXHJcbi8vIFRPRE86IGRldGVjdCBpbmZpbml0ZSBsb29wcyAob3IgdmVyeSBkZWVwIHByb3BhZ2F0aW9uKSBJdCBpcyBwb3NzaWJsZSE/XHJcblxyXG5jb25zdCBRdWV1ZSA9IHJlcXVpcmUoJy4vUXVldWUnKTtcclxuXHJcbmZ1bmN0aW9uIFNvdW5kUHViU3ViKCl7XHJcblxyXG5cdC8qKlxyXG5cdCAqIHB1Ymxpc2hcclxuXHQgKiAgICAgIFB1Ymxpc2ggYSBtZXNzYWdlIHtPYmplY3R9IHRvIGEgbGlzdCBvZiBzdWJzY3JpYmVycyBvbiBhIHNwZWNpZmljIHRvcGljXHJcblx0ICpcclxuXHQgKiBAcGFyYW1zIHtTdHJpbmd8TnVtYmVyfSB0YXJnZXQsICB7T2JqZWN0fSBtZXNzYWdlXHJcblx0ICogQHJldHVybiBudW1iZXIgb2YgY2hhbm5lbCBzdWJzY3JpYmVycyB0aGF0IHdpbGwgYmUgbm90aWZpZWRcclxuXHQgKi9cclxuXHR0aGlzLnB1Ymxpc2ggPSBmdW5jdGlvbih0YXJnZXQsIG1lc3NhZ2Upe1xyXG5cdFx0aWYoIWludmFsaWRDaGFubmVsTmFtZSh0YXJnZXQpICYmICFpbnZhbGlkTWVzc2FnZVR5cGUobWVzc2FnZSkgJiYgY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF0gIT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0Y29tcGFjdEFuZFN0b3JlKHRhcmdldCwgbWVzc2FnZSk7XHJcblx0XHRcdGRpc3BhdGNoTmV4dCgpO1xyXG5cdFx0XHRyZXR1cm4gY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF0ubGVuZ3RoO1xyXG5cdFx0fSBlbHNle1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQvKipcclxuXHQgKiBzdWJzY3JpYmVcclxuXHQgKiAgICAgIFN1YnNjcmliZSAvIGFkZCBhIHtGdW5jdGlvbn0gY2FsbEJhY2sgb24gYSB7U3RyaW5nfE51bWJlcn10YXJnZXQgY2hhbm5lbCBzdWJzY3JpYmVycyBsaXN0IGluIG9yZGVyIHRvIHJlY2VpdmVcclxuXHQgKiAgICAgIG1lc3NhZ2VzIHB1Ymxpc2hlZCBpZiB0aGUgY29uZGl0aW9ucyBkZWZpbmVkIGJ5IHtGdW5jdGlvbn13YWl0Rm9yTW9yZSBhbmQge0Z1bmN0aW9ufWZpbHRlciBhcmUgcGFzc2VkLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtcyB7U3RyaW5nfE51bWJlcn10YXJnZXQsIHtGdW5jdGlvbn1jYWxsQmFjaywge0Z1bmN0aW9ufXdhaXRGb3JNb3JlLCB7RnVuY3Rpb259ZmlsdGVyXHJcblx0ICpcclxuXHQgKiAgICAgICAgICB0YXJnZXQgICAgICAtIGNoYW5uZWwgbmFtZSB0byBzdWJzY3JpYmVcclxuXHQgKiAgICAgICAgICBjYWxsYmFjayAgICAtIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIGEgbWVzc2FnZSB3YXMgcHVibGlzaGVkIG9uIHRoZSBjaGFubmVsXHJcblx0ICogICAgICAgICAgd2FpdEZvck1vcmUgLSBhIGludGVybWVkaWFyeSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgY2FsbGVkIGFmdGVyIGEgc3VjY2Vzc2Z1bHkgbWVzc2FnZSBkZWxpdmVyeSBpbiBvcmRlclxyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgICAgICB0byBkZWNpZGUgaWYgYSBuZXcgbWVzc2FnZXMgaXMgZXhwZWN0ZWQuLi5cclxuXHQgKiAgICAgICAgICBmaWx0ZXIgICAgICAtIGEgZnVuY3Rpb24gdGhhdCByZWNlaXZlcyB0aGUgbWVzc2FnZSBiZWZvcmUgaW52b2NhdGlvbiBvZiBjYWxsYmFjayBmdW5jdGlvbiBpbiBvcmRlciB0byBhbGxvd1xyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgICAgICByZWxldmFudCBtZXNzYWdlIGJlZm9yZSBlbnRlcmluZyBpbiBub3JtYWwgY2FsbGJhY2sgZmxvd1xyXG5cdCAqIEByZXR1cm5cclxuXHQgKi9cclxuXHR0aGlzLnN1YnNjcmliZSA9IGZ1bmN0aW9uKHRhcmdldCwgY2FsbEJhY2ssIHdhaXRGb3JNb3JlLCBmaWx0ZXIpe1xyXG5cdFx0aWYoIWludmFsaWRDaGFubmVsTmFtZSh0YXJnZXQpICYmICFpbnZhbGlkRnVuY3Rpb24oY2FsbEJhY2spKXtcclxuXHJcblx0XHRcdHZhciBzdWJzY3JpYmVyID0ge1wiY2FsbEJhY2tcIjpjYWxsQmFjaywgXCJ3YWl0Rm9yTW9yZVwiOndhaXRGb3JNb3JlLCBcImZpbHRlclwiOmZpbHRlcn07XHJcblx0XHRcdHZhciBhcnIgPSBjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XTtcclxuXHRcdFx0aWYoYXJyID09IHVuZGVmaW5lZCl7XHJcblx0XHRcdFx0YXJyID0gW107XHJcblx0XHRcdFx0Y2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF0gPSBhcnI7XHJcblx0XHRcdH1cclxuXHRcdFx0YXJyLnB1c2goc3Vic2NyaWJlcik7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogdW5zdWJzY3JpYmVcclxuXHQgKiAgICAgIFVuc3Vic2NyaWJlL3JlbW92ZSB7RnVuY3Rpb259IGNhbGxCYWNrIGZyb20gdGhlIGxpc3Qgb2Ygc3Vic2NyaWJlcnMgb2YgdGhlIHtTdHJpbmd8TnVtYmVyfSB0YXJnZXQgY2hhbm5lbFxyXG5cdCAqXHJcblx0ICogQHBhcmFtcyB7U3RyaW5nfE51bWJlcn0gdGFyZ2V0LCB7RnVuY3Rpb259IGNhbGxCYWNrLCB7RnVuY3Rpb259IGZpbHRlclxyXG5cdCAqXHJcblx0ICogICAgICAgICAgdGFyZ2V0ICAgICAgLSBjaGFubmVsIG5hbWUgdG8gdW5zdWJzY3JpYmVcclxuXHQgKiAgICAgICAgICBjYWxsYmFjayAgICAtIHJlZmVyZW5jZSBvZiB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gdGhhdCB3YXMgdXNlZCBhcyBzdWJzY3JpYmVcclxuXHQgKiAgICAgICAgICBmaWx0ZXIgICAgICAtIHJlZmVyZW5jZSBvZiB0aGUgb3JpZ2luYWwgZmlsdGVyIGZ1bmN0aW9uXHJcblx0ICogQHJldHVyblxyXG5cdCAqL1xyXG5cdHRoaXMudW5zdWJzY3JpYmUgPSBmdW5jdGlvbih0YXJnZXQsIGNhbGxCYWNrLCBmaWx0ZXIpe1xyXG5cdFx0aWYoIWludmFsaWRGdW5jdGlvbihjYWxsQmFjaykpe1xyXG5cdFx0XHR2YXIgZ290aXQgPSBmYWxzZTtcclxuXHRcdFx0aWYoY2hhbm5lbFN1YnNjcmliZXJzW3RhcmdldF0pe1xyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBjaGFubmVsU3Vic2NyaWJlcnNbdGFyZ2V0XS5sZW5ndGg7aSsrKXtcclxuXHRcdFx0XHRcdHZhciBzdWJzY3JpYmVyID0gIGNoYW5uZWxTdWJzY3JpYmVyc1t0YXJnZXRdW2ldO1xyXG5cdFx0XHRcdFx0aWYoc3Vic2NyaWJlci5jYWxsQmFjayA9PT0gY2FsbEJhY2sgJiYgKGZpbHRlciA9PSB1bmRlZmluZWQgfHwgc3Vic2NyaWJlci5maWx0ZXIgPT09IGZpbHRlciApKXtcclxuXHRcdFx0XHRcdFx0Z290aXQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRzdWJzY3JpYmVyLmZvckRlbGV0ZSA9IHRydWU7XHJcblx0XHRcdFx0XHRcdHN1YnNjcmliZXIuY2FsbEJhY2sgPSBudWxsO1xyXG5cdFx0XHRcdFx0XHRzdWJzY3JpYmVyLmZpbHRlciA9IG51bGw7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmKCFnb3RpdCl7XHJcblx0XHRcdFx0d3ByaW50KFwiVW5hYmxlIHRvIHVuc3Vic2NyaWJlIGEgY2FsbGJhY2sgdGhhdCB3YXMgbm90IHN1YnNjcmliZWQhXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogYmxvY2tDYWxsQmFja3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbXNcclxuXHQgKiBAcmV0dXJuXHJcblx0ICovXHJcblx0dGhpcy5ibG9ja0NhbGxCYWNrcyA9IGZ1bmN0aW9uKCl7XHJcblx0XHRsZXZlbCsrO1xyXG5cdH07XHJcblxyXG5cdC8qKlxyXG5cdCAqIHJlbGVhc2VDYWxsQmFja3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbXNcclxuXHQgKiBAcmV0dXJuXHJcblx0ICovXHJcblx0dGhpcy5yZWxlYXNlQ2FsbEJhY2tzID0gZnVuY3Rpb24oKXtcclxuXHRcdGxldmVsLS07XHJcblx0XHQvL2hhY2svb3B0aW1pc2F0aW9uIHRvIG5vdCBmaWxsIHRoZSBzdGFjayBpbiBleHRyZW1lIGNhc2VzIChtYW55IGV2ZW50cyBjYXVzZWQgYnkgbG9vcHMgaW4gY29sbGVjdGlvbnMsZXRjKVxyXG5cdFx0d2hpbGUobGV2ZWwgPT0gMCAmJiBkaXNwYXRjaE5leHQodHJ1ZSkpe1xyXG5cdFx0XHQvL25vdGhpbmdcclxuXHRcdH1cclxuXHJcblx0XHR3aGlsZShsZXZlbCA9PSAwICYmIGNhbGxBZnRlckFsbEV2ZW50cygpKXtcclxuXHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogYWZ0ZXJBbGxFdmVudHNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbXMge0Z1bmN0aW9ufSBjYWxsYmFja1xyXG5cdCAqXHJcblx0ICogICAgICAgICAgY2FsbGJhY2sgLSBmdW5jdGlvbiB0aGF0IG5lZWRzIHRvIGJlIGludm9rZWQgb25jZSBhbGwgZXZlbnRzIGFyZSBkZWxpdmVyZWRcclxuXHQgKiBAcmV0dXJuXHJcblx0ICovXHJcblx0dGhpcy5hZnRlckFsbEV2ZW50cyA9IGZ1bmN0aW9uKGNhbGxCYWNrKXtcclxuXHRcdGlmKCFpbnZhbGlkRnVuY3Rpb24oY2FsbEJhY2spKXtcclxuXHRcdFx0YWZ0ZXJFdmVudHNDYWxscy5wdXNoKGNhbGxCYWNrKTtcclxuXHRcdH1cclxuXHRcdHRoaXMuYmxvY2tDYWxsQmFja3MoKTtcclxuXHRcdHRoaXMucmVsZWFzZUNhbGxCYWNrcygpO1xyXG5cdH07XHJcblxyXG5cdC8qKlxyXG5cdCAqIGhhc0NoYW5uZWxcclxuXHQgKlxyXG5cdCAqIEBwYXJhbXMge1N0cmluZ3xOdW1iZXJ9IGNoYW5uZWxcclxuXHQgKlxyXG5cdCAqICAgICAgICAgIGNoYW5uZWwgLSBuYW1lIG9mIHRoZSBjaGFubmVsIHRoYXQgbmVlZCB0byBiZSB0ZXN0ZWQgaWYgcHJlc2VudFxyXG5cdCAqIEByZXR1cm5cclxuXHQgKi9cclxuXHR0aGlzLmhhc0NoYW5uZWwgPSBmdW5jdGlvbihjaGFubmVsKXtcclxuXHRcdHJldHVybiAhaW52YWxpZENoYW5uZWxOYW1lKGNoYW5uZWwpICYmIGNoYW5uZWxTdWJzY3JpYmVyc1tjaGFubmVsXSAhPSB1bmRlZmluZWQgPyB0cnVlIDogZmFsc2U7XHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogYWRkQ2hhbm5lbFxyXG5cdCAqXHJcblx0ICogQHBhcmFtcyB7U3RyaW5nfSBjaGFubmVsXHJcblx0ICpcclxuXHQgKiAgICAgICAgICBjaGFubmVsIC0gbmFtZSBvZiBhIGNoYW5uZWwgdGhhdCBuZWVkcyB0byBiZSBjcmVhdGVkIGFuZCBhZGRlZCB0byBzb3VuZHB1YnN1YiByZXBvc2l0b3J5XHJcblx0ICogQHJldHVyblxyXG5cdCAqL1xyXG5cdHRoaXMuYWRkQ2hhbm5lbCA9IGZ1bmN0aW9uKGNoYW5uZWwpe1xyXG5cdFx0aWYoIWludmFsaWRDaGFubmVsTmFtZShjaGFubmVsKSAmJiAhdGhpcy5oYXNDaGFubmVsKGNoYW5uZWwpKXtcclxuXHRcdFx0Y2hhbm5lbFN1YnNjcmliZXJzW2NoYW5uZWxdID0gW107XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0LyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBwcm90ZWN0ZWQgc3R1ZmYgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xyXG5cdHZhciBzZWxmID0gdGhpcztcclxuXHQvLyBtYXAgY2hhbm5lbE5hbWUgKG9iamVjdCBsb2NhbCBpZCkgLT4gYXJyYXkgd2l0aCBzdWJzY3JpYmVyc1xyXG5cdHZhciBjaGFubmVsU3Vic2NyaWJlcnMgPSB7fTtcclxuXHJcblx0Ly8gbWFwIGNoYW5uZWxOYW1lIChvYmplY3QgbG9jYWwgaWQpIC0+IHF1ZXVlIHdpdGggd2FpdGluZyBtZXNzYWdlc1xyXG5cdHZhciBjaGFubmVsc1N0b3JhZ2UgPSB7fTtcclxuXHJcblx0Ly8gb2JqZWN0XHJcblx0dmFyIHR5cGVDb21wYWN0b3IgPSB7fTtcclxuXHJcblx0Ly8gY2hhbm5lbCBuYW1lc1xyXG5cdHZhciBleGVjdXRpb25RdWV1ZSA9IG5ldyBRdWV1ZSgpO1xyXG5cdHZhciBsZXZlbCA9IDA7XHJcblxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogcmVnaXN0ZXJDb21wYWN0b3JcclxuXHQgKlxyXG5cdCAqICAgICAgIEFuIGNvbXBhY3RvciB0YWtlcyBhIG5ld0V2ZW50IGFuZCBhbmQgb2xkRXZlbnQgYW5kIHJldHVybiB0aGUgb25lIHRoYXQgc3Vydml2ZXMgKG9sZEV2ZW50IGlmXHJcblx0ICogIGl0IGNhbiBjb21wYWN0IHRoZSBuZXcgb25lIG9yIHRoZSBuZXdFdmVudCBpZiBjYW4ndCBiZSBjb21wYWN0ZWQpXHJcblx0ICpcclxuXHQgKiBAcGFyYW1zIHtTdHJpbmd9IHR5cGUsIHtGdW5jdGlvbn0gY2FsbEJhY2tcclxuXHQgKlxyXG5cdCAqICAgICAgICAgIHR5cGUgICAgICAgIC0gY2hhbm5lbCBuYW1lIHRvIHVuc3Vic2NyaWJlXHJcblx0ICogICAgICAgICAgY2FsbEJhY2sgICAgLSBoYW5kbGVyIGZ1bmN0aW9uIGZvciB0aGF0IHNwZWNpZmljIGV2ZW50IHR5cGVcclxuXHQgKiBAcmV0dXJuXHJcblx0ICovXHJcblx0dGhpcy5yZWdpc3RlckNvbXBhY3RvciA9IGZ1bmN0aW9uKHR5cGUsIGNhbGxCYWNrKSB7XHJcblx0XHRpZighaW52YWxpZEZ1bmN0aW9uKGNhbGxCYWNrKSl7XHJcblx0XHRcdHR5cGVDb21wYWN0b3JbdHlwZV0gPSBjYWxsQmFjaztcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQvKipcclxuXHQgKiBkaXNwYXRjaE5leHRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBmcm9tUmVsZWFzZUNhbGxCYWNrczogaGFjayB0byBwcmV2ZW50IHRvbyBtYW55IHJlY3Vyc2l2ZSBjYWxscyBvbiByZWxlYXNlQ2FsbEJhY2tzXHJcblx0ICogQHJldHVybiB7Qm9vbGVhbn1cclxuXHQgKi9cclxuXHRmdW5jdGlvbiBkaXNwYXRjaE5leHQoZnJvbVJlbGVhc2VDYWxsQmFja3Mpe1xyXG5cdFx0aWYobGV2ZWwgPiAwKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGxldCBjaGFubmVsTmFtZSA9IGV4ZWN1dGlvblF1ZXVlLmZyb250KCk7XHJcblx0XHRpZihjaGFubmVsTmFtZSAhPSB1bmRlZmluZWQpe1xyXG5cdFx0XHRzZWxmLmJsb2NrQ2FsbEJhY2tzKCk7XHJcblx0XHRcdHRyeXtcclxuXHRcdFx0XHRsZXQgbWVzc2FnZTtcclxuXHRcdFx0XHRpZighY2hhbm5lbHNTdG9yYWdlW2NoYW5uZWxOYW1lXS5pc0VtcHR5KCkpIHtcclxuXHRcdFx0XHRcdG1lc3NhZ2UgPSBjaGFubmVsc1N0b3JhZ2VbY2hhbm5lbE5hbWVdLmZyb250KCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmKG1lc3NhZ2UgPT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0XHRcdGlmKCFjaGFubmVsc1N0b3JhZ2VbY2hhbm5lbE5hbWVdLmlzRW1wdHkoKSl7XHJcblx0XHRcdFx0XHRcdHdwcmludChcIkNhbid0IHVzZSBhcyBtZXNzYWdlIGluIGEgcHViL3N1YiBjaGFubmVsIHRoaXMgb2JqZWN0OiBcIiArIG1lc3NhZ2UpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZXhlY3V0aW9uUXVldWUucG9wKCk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGlmKG1lc3NhZ2UuX190cmFuc21pc2lvbkluZGV4ID09IHVuZGVmaW5lZCl7XHJcblx0XHRcdFx0XHRcdG1lc3NhZ2UuX190cmFuc21pc2lvbkluZGV4ID0gMDtcclxuXHRcdFx0XHRcdFx0Zm9yKHZhciBpID0gY2hhbm5lbFN1YnNjcmliZXJzW2NoYW5uZWxOYW1lXS5sZW5ndGgtMTsgaSA+PSAwIDsgaS0tKXtcclxuXHRcdFx0XHRcdFx0XHR2YXIgc3Vic2NyaWJlciA9ICBjaGFubmVsU3Vic2NyaWJlcnNbY2hhbm5lbE5hbWVdW2ldO1xyXG5cdFx0XHRcdFx0XHRcdGlmKHN1YnNjcmliZXIuZm9yRGVsZXRlID09IHRydWUpe1xyXG5cdFx0XHRcdFx0XHRcdFx0Y2hhbm5lbFN1YnNjcmliZXJzW2NoYW5uZWxOYW1lXS5zcGxpY2UoaSwxKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZXtcclxuXHRcdFx0XHRcdFx0bWVzc2FnZS5fX3RyYW5zbWlzaW9uSW5kZXgrKztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vVE9ETzogZm9yIGltbXV0YWJsZSBvYmplY3RzIGl0IHdpbGwgbm90IHdvcmsgYWxzbywgZml4IGZvciBzaGFwZSBtb2RlbHNcclxuXHRcdFx0XHRcdGlmKG1lc3NhZ2UuX190cmFuc21pc2lvbkluZGV4ID09IHVuZGVmaW5lZCl7XHJcblx0XHRcdFx0XHRcdHdwcmludChcIkNhbid0IHVzZSBhcyBtZXNzYWdlIGluIGEgcHViL3N1YiBjaGFubmVsIHRoaXMgb2JqZWN0OiBcIiArIG1lc3NhZ2UpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0dmFyIHN1YnNjcmliZXIgPSBjaGFubmVsU3Vic2NyaWJlcnNbY2hhbm5lbE5hbWVdW21lc3NhZ2UuX190cmFuc21pc2lvbkluZGV4XTtcclxuXHRcdFx0XHRcdGlmKHN1YnNjcmliZXIgPT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0XHRcdFx0ZGVsZXRlIG1lc3NhZ2UuX190cmFuc21pc2lvbkluZGV4O1xyXG5cdFx0XHRcdFx0XHRjaGFubmVsc1N0b3JhZ2VbY2hhbm5lbE5hbWVdLnBvcCgpO1xyXG5cdFx0XHRcdFx0fSBlbHNle1xyXG5cdFx0XHRcdFx0XHRpZihzdWJzY3JpYmVyLmZpbHRlciA9PSB1bmRlZmluZWQgfHwgKCFpbnZhbGlkRnVuY3Rpb24oc3Vic2NyaWJlci5maWx0ZXIpICYmIHN1YnNjcmliZXIuZmlsdGVyKG1lc3NhZ2UpKSl7XHJcblx0XHRcdFx0XHRcdFx0aWYoIXN1YnNjcmliZXIuZm9yRGVsZXRlKXtcclxuXHRcdFx0XHRcdFx0XHRcdHN1YnNjcmliZXIuY2FsbEJhY2sobWVzc2FnZSk7XHJcblx0XHRcdFx0XHRcdFx0XHRpZihzdWJzY3JpYmVyLndhaXRGb3JNb3JlICYmICFpbnZhbGlkRnVuY3Rpb24oc3Vic2NyaWJlci53YWl0Rm9yTW9yZSkgJiZcclxuXHRcdFx0XHRcdFx0XHRcdFx0IXN1YnNjcmliZXIud2FpdEZvck1vcmUobWVzc2FnZSkpe1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdFx0c3Vic2NyaWJlci5mb3JEZWxldGUgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBjYXRjaChlcnIpe1xyXG5cdFx0XHRcdHdwcmludChcIkV2ZW50IGNhbGxiYWNrIGZhaWxlZDogXCIrIHN1YnNjcmliZXIuY2FsbEJhY2sgK1wiZXJyb3I6IFwiICsgZXJyLnN0YWNrKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvL1xyXG5cdFx0XHRpZihmcm9tUmVsZWFzZUNhbGxCYWNrcyl7XHJcblx0XHRcdFx0bGV2ZWwtLTtcclxuXHRcdFx0fSBlbHNle1xyXG5cdFx0XHRcdHNlbGYucmVsZWFzZUNhbGxCYWNrcygpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fSBlbHNle1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb21wYWN0QW5kU3RvcmUodGFyZ2V0LCBtZXNzYWdlKXtcclxuXHRcdHZhciBnb3RDb21wYWN0ZWQgPSBmYWxzZTtcclxuXHRcdHZhciBhcnIgPSBjaGFubmVsc1N0b3JhZ2VbdGFyZ2V0XTtcclxuXHRcdGlmKGFyciA9PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRhcnIgPSBuZXcgUXVldWUoKTtcclxuXHRcdFx0Y2hhbm5lbHNTdG9yYWdlW3RhcmdldF0gPSBhcnI7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYobWVzc2FnZSAmJiBtZXNzYWdlLnR5cGUgIT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0dmFyIHR5cGVDb21wYWN0b3JDYWxsQmFjayA9IHR5cGVDb21wYWN0b3JbbWVzc2FnZS50eXBlXTtcclxuXHJcblx0XHRcdGlmKHR5cGVDb21wYWN0b3JDYWxsQmFjayAhPSB1bmRlZmluZWQpe1xyXG5cdFx0XHRcdGZvcihsZXQgY2hhbm5lbCBvZiBhcnIpIHtcclxuXHRcdFx0XHRcdGlmKHR5cGVDb21wYWN0b3JDYWxsQmFjayhtZXNzYWdlLCBjaGFubmVsKSA9PT0gY2hhbm5lbCkge1xyXG5cdFx0XHRcdFx0XHRpZihjaGFubmVsLl9fdHJhbnNtaXNpb25JbmRleCA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRcdFx0Z290Q29tcGFjdGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmKCFnb3RDb21wYWN0ZWQgJiYgbWVzc2FnZSl7XHJcblx0XHRcdGFyci5wdXNoKG1lc3NhZ2UpO1xyXG5cdFx0XHRleGVjdXRpb25RdWV1ZS5wdXNoKHRhcmdldCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR2YXIgYWZ0ZXJFdmVudHNDYWxscyA9IG5ldyBRdWV1ZSgpO1xyXG5cdGZ1bmN0aW9uIGNhbGxBZnRlckFsbEV2ZW50cyAoKXtcclxuXHRcdGlmKCFhZnRlckV2ZW50c0NhbGxzLmlzRW1wdHkoKSl7XHJcblx0XHRcdHZhciBjYWxsQmFjayA9IGFmdGVyRXZlbnRzQ2FsbHMucG9wKCk7XHJcblx0XHRcdC8vZG8gbm90IGNhdGNoIGV4Y2VwdGlvbnMgaGVyZS4uXHJcblx0XHRcdGNhbGxCYWNrKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gIWFmdGVyRXZlbnRzQ2FsbHMuaXNFbXB0eSgpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaW52YWxpZENoYW5uZWxOYW1lKG5hbWUpe1xyXG5cdFx0dmFyIHJlc3VsdCA9IGZhbHNlO1xyXG5cdFx0aWYoIW5hbWUgfHwgKHR5cGVvZiBuYW1lICE9IFwic3RyaW5nXCIgJiYgdHlwZW9mIG5hbWUgIT0gXCJudW1iZXJcIikpe1xyXG5cdFx0XHRyZXN1bHQgPSB0cnVlO1xyXG5cdFx0XHR3cHJpbnQoXCJJbnZhbGlkIGNoYW5uZWwgbmFtZTogXCIgKyBuYW1lKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaW52YWxpZE1lc3NhZ2VUeXBlKG1lc3NhZ2Upe1xyXG5cdFx0dmFyIHJlc3VsdCA9IGZhbHNlO1xyXG5cdFx0aWYoIW1lc3NhZ2UgfHwgdHlwZW9mIG1lc3NhZ2UgIT0gXCJvYmplY3RcIil7XHJcblx0XHRcdHJlc3VsdCA9IHRydWU7XHJcblx0XHRcdHdwcmludChcIkludmFsaWQgbWVzc2FnZXMgdHlwZXM6IFwiICsgbWVzc2FnZSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaW52YWxpZEZ1bmN0aW9uKGNhbGxiYWNrKXtcclxuXHRcdHZhciByZXN1bHQgPSBmYWxzZTtcclxuXHRcdGlmKCFjYWxsYmFjayB8fCB0eXBlb2YgY2FsbGJhY2sgIT0gXCJmdW5jdGlvblwiKXtcclxuXHRcdFx0cmVzdWx0ID0gdHJ1ZTtcclxuXHRcdFx0d3ByaW50KFwiRXhwZWN0ZWQgdG8gYmUgZnVuY3Rpb24gYnV0IGlzOiBcIiArIGNhbGxiYWNrKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnRzLnNvdW5kUHViU3ViID0gbmV3IFNvdW5kUHViU3ViKCk7Il19
