require("../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../libraries/utils/FSExtension').fsExt;

var deployer = $$.loadLibrary("deployer", __dirname + "/../../libraries/deployer");

var dependencyName = "dummy-dependency";
var dummyTargetDir = "./remove-source";
var configObject = {
    "dependencies": [
        {
            "name": dependencyName,
            "src": "npm",
            "actions": [{
                "type": "remove",
                "target": dummyTargetDir
            }]
        }
    ]
}

var fsm = require("../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

// arrange
fileStateManager.saveState([dummyTargetDir]);

// create dummy test files/dirs
fsExt.createDir(dummyTargetDir);
fsExt.createDir(`${dummyTargetDir}/dummy-dependency`);
fsExt.createDir(`${dummyTargetDir}/dummy-dependency/sub-dir`);
fsExt.createFile(`${dummyTargetDir}/dummy-dependency/file1.js`, "alert('test1')!");

// act + assert
$$.callflow.start("deployer.Deployer").run(configObject, callback);

function callback(error, result) {
    var testFailed = false;
    var message = "";

    if (error) {
        testFailed = true;
        message = JSON.stringify(error);
    } else {
        console.log(JSON.stringify(result));

        let targetPath = fsExt.resolvePath(dummyTargetDir);
        if (!fs.existsSync(targetPath) === true) {
            message = `[PASS] Dependency ${targetPath} removed!`;
        } else {
            testFailed = true;
            message = `[FAIL] Dependency ${targetPath} still exists!`;
        }
    }

    let loger = testFailed ? console.error : console.log;
    loger(message);

    fileStateManager.restoreState();
}

