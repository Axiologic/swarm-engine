
//command line script
//the first argument is a path to a configuration file


//var config = require("util/configLoader.js")(process.args[1]);
var fs = require("fs");
var path = require("path");
exports.core = require("./core");

console.log("Booting sandbox:", process.argv);

var spaceName = "self";
if(process.argv.length < 1) {
    console.log("Failed tostart sandbox with a space name");
    return;
} else {
    spaceName = process.argv[1];
}

var baseFolder =  path.normalize(__dirname + "/../");
$$.PSK_PubSub = require("./pubSub/sandboxPubSub.js").create(baseFolder,spaceName);



$$.loadLibrary("sandbox", baseFolder +"/libraries/sandbox");
//$$.loadLibrary("pds", __dirname+"/../libraries/pds");
//var launcher = $$.loadLibrary("launcher", __dirname+"/../libraries/launcher");



