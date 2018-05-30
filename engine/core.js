/*
Initial License: (c) Axiologic Research & Alboaie Sînică.
Contributors: Axiologic Research , PrivateSky project
Code License: LGPL or MIT.
*/

var path = require("path");
var callflowModule = require("modules/callflow");

$$.registerSwarmDescription =  function(libraryName,shortName, description){
    if(!$$.libraries[libraryName]){
        $$.libraries[libraryName] = {};
    }
    $$.libraries[libraryName][shortName] = description;
}

var utils = require("./choreographies/utilityFunctions");

$$.callflows        = callflowModule.createSwarmEngine("callflow");
$$.callflow         = $$.callflows;
$$.flow             = $$.callflows;
$$.flows            = $$.callflows;
$$.swarms           = callflowModule.createSwarmEngine("swarm", utils);
$$.swarm            = $$.swarms;
$$.contracts        = callflowModule.createSwarmEngine("contract", utils);
$$.contract         = $$.contracts;

$$.loadLibrary      = require("./util/loadLibrary").loadLibrary;

var loadedModules = {};

$$.requireModule = function(name){
    var existingModule = loadedModules[name];
    if(!existingModule){
        var absolutePath = path.resolve( __dirname + "/../modules/" + name);
        existingModule = require(absolutePath);
        loadedModules[name] = existingModule;
    } else {
        return existingModule;
    }
};

$$.requireLibrary = function(name){
    var absolutePath = path.resolve( __dirname + "/../libraries/" + name);
    return $$.loadLibrary(name,absolutePath);
};


var core = $$.requireLibrary("core");


$$.ensureFolderExists = function(folder, callback){

    var flow = $$.flow.start(core.mkDirRec);
    flow.make(folder, callback);
};

$$.ensureLinkExists = function(existingPath, newPath, callback){

    var flow = $$.flow.start(core.mkDirRec);
    flow.makeLink(existingPath, newPath, callback);
};