require("../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../libraries/utils/FSExtension').fsExt;

var deployer = $$.loadLibrary("deployer", __dirname + "/../../libraries/deployer");

var dependencyName = "dummy-dependency";
var dummySrcDir = "./move-source";
var dummyTargetDirBase = "./move-destination";
var dummyTargetDir = `${dummyTargetDirBase}/dummy-dependency`;
var configObject = {
    "dependencies": [
        {
            "name": dependencyName,
            "src": "npm",
            "actions": [{
                "type": "move",
                "src": `${dummySrcDir}/dummy-dependency`,
                "target": dummyTargetDir
            }]
        }
    ]
}

var fsm = require("../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

// arrange
fileStateManager.saveState([dummySrcDir, dummyTargetDirBase]);

// create dummy test files/dirs
fsExt.createDir(`${dummySrcDir}`);
fsExt.createDir(`${dummySrcDir}/dummy-dependency`);
fsExt.createDir(`${dummySrcDir}/dummy-dependency/sub-dir`);
fsExt.createFile(`${dummySrcDir}/dummy-dependency/file1.js`, "alert('test1')!");

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

        // TODO here maybe we can check all source files to match the ones from the destination files
        let targetPath = fsExt.resolvePath(dummyTargetDir);
        if (fs.existsSync(targetPath) === true) {
            message = `[PASS] Dependency "${dependencyName}" exists in ${targetPath}`;
        } else {
            testFailed = true;
            message = `[FAIL] Dependency "${dependencyName}" does not exist in ${targetPath}`;
        }
    }

    let loger = testFailed ? console.error : console.log;
    loger(message);

    fileStateManager.restoreState();
}

