require("../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../libraries/utils/FSExtension').fsExt;

var deployer = $$.loadLibrary("deployer", __dirname + "/../../libraries/deployer");

var dependencyName = "whys";
var dependencyTarget = "./git";
var configObject = {
    "dependencies": [
        {
            "name": dependencyName,
            "src": "https://github.com/PrivateSky/whys.git",
            "actions": [{
                "type": "clone",
                "options": {
                    "depth": "1",
                    "branch": "master"
                },
                "target": dependencyTarget
            }]
        }
    ]
}

var fsm = require("../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

// arrange
fileStateManager.saveState(["git"]);

// act + assert
$$.callflow.start("deployer.Deployer").run(configObject, callback);

function callback(error, result) {
    var testFailed = false;
    var message = "";

    if(error) {
        testFailed = true;
        message = "[FAIL] " + JSON.stringify(error);
    } else {
        console.log(JSON.stringify(result));

        let dependencyPath = fsExt.resolvePath(dependencyTarget + "/" + dependencyName);
        if(fs.existsSync(dependencyPath) === true) {
            message = `[PASS] Dependency "${dependencyPath}" exists!`;
        } else {
            testFailed = true;
            message = `[FAIL] Dependency "${dependencyPath}" does not exist!`;
        }
    }

    let logger = testFailed ? console.error : console.log;
    logger(message);

    fileStateManager.restoreState();
}

