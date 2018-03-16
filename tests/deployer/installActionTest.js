require("../../engine/core").enableTesting();
var fs = require("fs");
var path = require("path");
const fsExt = require('../../libraries/utils/FSExtension').fsExt;

var deployer = $$.loadLibrary("deployer", __dirname + "/../../libraries/deployer");

var dependencyName = "whys";
var nodeModulesPath = fsExt.resolvePath("./node_modules/");
var configObject = {
    "dependencies": [
        {
            "name": dependencyName,
            "src": "https://github.com/PrivateSky/whys.git",
            "actions": ["install"]
        }
    ]
}

var fsm = require("../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

// arrange
fileStateManager.saveState([nodeModulesPath]);

// act + assert
$$.callflow.start("deployer.Deployer").run(configObject, callback);

function callback(error, result) {

    var testFailed = false;
    var message = "";

    if(error) {
        testFailed = true;
        message = JSON.stringify(error);
    } else {
        console.log(JSON.stringify(result));

        let targetPath = path.join(nodeModulesPath, "/", dependencyName);
        if(fs.existsSync(targetPath) === true) {
            message = `[PASS] Dependency "${dependencyName}" exists in ${nodeModulesPath}`;
        } else {
            testFailed = false;
            message = `[FAIL] Dependency "${dependencyName}" does not exist in ${nodeModulesPath}`;
        }
    }

    let logger = testFailed ? console.error : console.log;
    logger(message);

    fileStateManager.restoreState();
}

