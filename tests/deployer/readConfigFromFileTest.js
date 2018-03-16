require("../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../libraries/utils/FSExtension').fsExt;

$$.loadLibrary("deployer", __dirname + "/../../libraries/deployer");

var fsm = require("../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();


var dummyTargetDir = "./dummy-config-file-dir";
var dummyConfigFile = fsExt.resolvePath(`${dummyTargetDir}/config.json`);
var dummyDownloadDir = "./dummy-download-dir";
var f = $$.flow.create("readConfigFromTestFile", {
    start:function() {
        this.beforeExecution();
        this.act();
    },
    beforeExecution:function() {
        fileStateManager.saveState([dummyTargetDir, dummyDownloadDir]);
        // create dummy empty directory
        fsExt.createDir(dummyTargetDir);

        fsExt.createFile(dummyConfigFile, `
        {
            "dependencies": [
                {
                    "name": "acl.js",
                    "src": "https://raw.githubusercontent.com/PrivateSky/acl-magic/master/lib/acl.js",
                    "actions": [{
                        "type": "download",
                        "target": "${dummyDownloadDir}"
                    }]
                }
            ]
        }`);
    },
    act: function() {
        $$.callflow.start("deployer.Deployer").run(dummyConfigFile, this.assert);
    },
    assert: function(error, result) {
        var testFailed = false;
        var message = "";

        if(error) {
            testFailed = true;
            message = JSON.stringify(error);
        } else {
            console.log(JSON.stringify(result));
            message = `[PASS] Reading config from file works!`;
        }

        let logger = testFailed ? console.error : console.log;
        logger(message);

        this.afterExecution();

    },
    afterExecution: function() {
        fileStateManager.restoreState();
    }
});

f.start();

