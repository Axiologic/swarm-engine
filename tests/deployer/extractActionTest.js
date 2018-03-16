require("../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../libraries/utils/FSExtension').fsExt;

var deployer = $$.loadLibrary("deployer", __dirname + "/../../libraries/deployer");

var dependencyName = "acl-magic.zip";
var dummyTargetDir = "./extract";
var dummyTargetDir2 = "./extract/acl-magic";
var configObject = {
    "dependencies": [
        {
            "name": dependencyName,
            "src": "https://github.com/PrivateSky/acl-magic/archive/master.zip",
            "actions": [{
                "type": "download",
                "target": dummyTargetDir
            }, {
                "type": "extract",
                "src": "./extract/acl-magic.zip",
                "target": dummyTargetDir2
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

        let targetPath = fsExt.resolvePath(dummyTargetDir2)
        if(fs.existsSync(targetPath) === true) {
            message = `[PASS] Dependency exists in ${targetPath}`;
        } else {
            testFailed = true;
            message = `[FAIL] Dependency does not exist in ${targetPath}`;
        }
    }

    let logger = testFailed ? console.error : console.log;
    logger(message);

    fileStateManager.restoreState();
}