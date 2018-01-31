
//command line script
//the first argument is a path to a configuration file


//var config = require("util/configLoader.js")(process.args[1]);
var core = require("./core");

$$.PSK_PubSub = require("./pubSub/launcherMQ.js").pubSub;


exports.CRL = require("./fakes/dummyCRL");  //TODO: used by tests, but this should be removed soon...
exports.PDS = require("./fakes/dummyPDS");  //TODO: used by tests, but this should be removed soon...


var tmpDir = require("os").tmpdir();

var filePath =  tmpDir + "/psk.config";
console.log(filePath);


$$.loadLibrary("crl", "../libraries/crl");
$$.loadLibrary("pds", "../libraries/pds");
var launcher = $$.loadLibrary("launcher", "../libraries/launcher");




$$.callflow.start(launcher.FileSerializer).load(launcher.Config, filePath, function(err, config){
   //console.log(config.valueOf());
    //console.log(config);
   config.start();
});