
//command line script
//the first argument is a path to a configuration file


//var config = require("util/configLoader.js")(process.args[1]);
var fs = require("fs");
var path = require("path");
exports.core = require("./core");


var spaceName = "self";
if(process.argv.length < 1) {
    console.log("Failed to start sandbox with a space name");
    return;
} else {
    spaceName = process.argv[2];
}

console.log("Booting sandbox:", spaceName );


var baseFolder =  path.normalize(process.env.PRIVATESKY_TMP + "/sandboxes/");
/*console.log(baseFolder);*/
/*$$.PSK_PubSub = require("./pubSub/sandboxPubSub.js").create(baseFolder,spaceName, function(err,res){

});*/

$$.PSK_PubSub = require("./pubSub/sandboxPubSub.js").create(baseFolder+spaceName);

$$.requireLibrary("sandbox");
$$.requireLibrary("testSwarms");



