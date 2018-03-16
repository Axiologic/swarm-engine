require("../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../libraries/utils/FSExtension').fsExt;

var deployer = $$.loadLibrary("deployer", __dirname + "/../../libraries/deployer");

var configObject = {
    "dependencies": [
        {
            "name": "transrest",
            "src": "npm",
            "actions": ["install", {
                "type": "move",
                "src": "./node_modules/transrest",
                "target": "./modules/transrest"
            }]
        },
        {
            "name": "whys",
            "src": "npm",
            "actions": ["install", {
                "type": "move",
                "src": "./node_modules/whys",
                "target": "./modules/whys"
            }]
        }
    ]
}

var fsm = require("../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

// arrange
fileStateManager.saveState(["./modules", "./node_modules"]);

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

        for(let i in configObject.dependencies) {
            let targetPath = fsExt.resolvePath(configObject.dependencies[i].actions[1].target);
            if(fs.existsSync(targetPath) === true) {
                message += `[PASS] Dependency "${targetPath}" exists!\n`;
            } else {
                message += `[FAIL] Dependency "${targetPath}" does not exist!}\n`;
            }
        }
    }

    let logger = testFailed ? console.error : console.log;
    logger(message);

    fileStateManager.restoreState();
}

