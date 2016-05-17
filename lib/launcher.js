
//command line script
//the first argument is a path to a configuration file


var config = require("util/configLoader.js")(process.args[1]);
var core = require("./core");

__swarmGlobals.PSK_PubSub = require("./pubSub/launcherMQ.js");


exports.CRL = require("./fakes/dummyCRL");  //TODO: used by tests, but this should be removed soon...
exports.PDS = require("./fakes/dummyPDS");  //TODO: used by tests, but this should be removed soon...