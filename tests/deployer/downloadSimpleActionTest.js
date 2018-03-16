require("../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../libraries/utils/FSExtension').fsExt;

var deployer = $$.loadLibrary("deployer", __dirname + "/../../libraries/deployer");

var dependencyName = "acl.js";
var dummyTargetDir = "./modules";
var configObject = {
    "dependencies": [
        {
            "name": dependencyName,
            "src": "https://raw.githubusercontent.com/PrivateSky/acl-magic/master/lib/acl.js",
            "actions": [{
                "type": "download",
                "target": dummyTargetDir
            }]
        }
    ]
}

var fsm = require("../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

// arrange
fileStateManager.saveState([dummyTargetDir]);

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

        let targetPath = fsExt.resolvePath(dummyTargetDir + "/" + dependencyName)
        if(fs.existsSync(targetPath) === true) {
            message = `[PASS] Dependency "${targetPath}" exists!`;
        } else {
            testFailed = true;
            message = `[FAIL] Dependency "${targetPath}" does not exist!`;
        }
    }

    let logger = testFailed ? console.error : console.log;
    logger(message);

    fileStateManager.restoreState();
}