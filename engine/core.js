/*
 Initial License: (c) Axiologic Research & Alboaie Sînică.
 Contributors: Axiologic Research , PrivateSky project
 Code License: LGPL or MIT.
 */

var path = require("path");
var callflowModule = require("./../modules/callflow");

$$.securityContext = "system";
$$.libraryPrefix = "global";
$$.libraries = {
    global:{

    }
};

var loadedModules = {};

$$.requireModule = function(name){
    var existingModule = loadedModules[name];
    if(!existingModule){
        var absolutePath = path.resolve( __dirname + "/../modules/" + name);
        existingModule = require(absolutePath);
        loadedModules[name] = existingModule;
    }
    return existingModule;
};

$$.requireLibrary = function(name){
    var absolutePath = path.resolve( __dirname + "/../libraries/" + name);
    return $$.loadLibrary(name,absolutePath);
};

$$.registerSwarmDescription =  function(libraryName,shortName, description){
    if(!$$.libraries[libraryName]){
        $$.libraries[libraryName] = {};
    }
    $$.libraries[libraryName][shortName] = description;
}

var utils = require("./choreographies/utilityFunctions");

$$.swarms           = callflowModule.createSwarmEngine("swarm", utils);
$$.swarm            = $$.swarms;
$$.contracts        = callflowModule.createSwarmEngine("contract", utils);
$$.contract         = $$.contracts;

$$.loadLibrary      = require("./util/loadLibrary").loadLibrary;

require("./choreographies/swarmInstancesManager");

exports.enableTesting = function() {
    require("./fakes/dummyVM");
}

var core = $$.requireLibrary("core");

$$.ensureFolderExists = function(folder, callback){

    var flow = $$.flow.start(core.mkDirRec);
    flow.make(folder, callback);
};

$$.ensureLinkExists = function(existingPath, newPath, callback){

    var flow = $$.flow.start(core.mkDirRec);
    flow.makeLink(existingPath, newPath, callback);
};