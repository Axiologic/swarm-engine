require("../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../libraries/utils/FSExtension').fsExt;

var deployer = $$.loadLibrary("deployer", __dirname + "/../../libraries/deployer");

var dependencyName = "file1.js";
var dummySrcDir = "./copy-source";
var dummyTargetDir = "./copy-destination";
var configObject = {
    "dependencies": [
        {
            "name": dependencyName,
            "src": dummySrcDir,
            "actions": [{
                "type": "copy",
                "target": dummyTargetDir
            }]
        }
    ]
}

var fsm = require("../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

// arrange
fileStateManager.saveState([dummySrcDir, dummyTargetDir]);

// create dummy test files/dirs
fsExt.createDir(dummySrcDir);
fsExt.createFile(`${dummySrcDir}/file1.js`, "alert('test')!");

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
            message = `[PASS] Dependency "${dependencyName}" exists in ${targetPath}`;
        } else {
            testFailed = true;
            message = `[FAIL] Dependency "${dependencyName}" does not exist in ${targetPath}`;
        }
    }

    let logger = testFailed ? console.error : console.log;
    logger(message);

    fileStateManager.restoreState();
}

