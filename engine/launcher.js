


//command line script
//the first argument is a path to a configuration file


//var config = require("util/configLoader.js")(process.args[1]);
exports.core = require("./core");

var tmpDir ;

if(process.env.PRIVATESKY_TMP){
    tmpDir = process.env.PRIVATESKY_TMP;
}
else
if(process.argv.length == 1){
    tmpDir = process.argv[1];
    process.env.PRIVATESKY_TMP = tmpDir;

} else {
    tmpDir = require("os").tmpdir();
    process.env.PRIVATESKY_TMP = tmpDir;
}


var fs = require("fs");
var path = require("path");

var basePath =  tmpDir ;
fs.mkdir(basePath, function(){});

var cfgPath = basePath + "psk.config";


var codeFolder =  path.normalize(__dirname + "/../");

$$.container = require("../modules/dicontainer").newContainer($$.errorHandler);

$$.PSK_PubSub = require("./pubSub/launcherPubSub.js").create(basePath, codeFolder);


$$.loadLibrary("crl", __dirname+"/../libraries/crl");
$$.loadLibrary("pds", __dirname+"/../libraries/pds");

var launcher = $$.loadLibrary("launcher", __dirname + "/../libraries/launcher");

$$.container.declareDependency("nimic", [$$.DI_components.sandBoxReady], function(fail, ready){
    if(!fail){
        $$.callflow.start(launcher.FileSerializer).load(launcher.Config, cfgPath, function(err, config){
            config.start("self/agent/root", ["space1", "space2", "space3"]);
            $$.container.resolve($$.DI_components.configLoaded, true);
        });
    }
});

$$.container.declareDependency($$.DI_components.swarmIsReady, [$$.DI_components.configLoaded, $$.DI_components.sandBoxReady], function(fail, x, y ){
    if(!fail){
        console.log("Node launching...");
    }
});