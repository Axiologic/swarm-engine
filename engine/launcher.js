
//command line script
//the first argument is a path to a configuration file


//var config = require("util/configLoader.js")(process.args[1]);
var core = require("./core");

$$.PSK_PubSub = require("./pubSub/launcherMQ.js").pubSub;


exports.CRL = require("./fakes/dummyCRL");  //TODO: used by tests, but this should be removed soon...
exports.PDS = require("./fakes/dummyPDS");  //TODO: used by tests, but this should be removed soon...

$$.loadLibrary("crl", "../libraries/crl");
$$.loadLibrary("pds", "../libraries/pds");
var core = $$.loadLibrary("core", "../libraries/launcher");

var folder = require("os").tmpdir() + "/psk.config";
console.log(folder);
var test = $$.callflow.start(core.Serializer);
test.store(test, folder);