require("../../engine/core").enableTesting();
const fsExt = require('../../libraries/utils/FSExtension').fsExt;

var deployer = $$.loadLibrary("deployer", __dirname + "/../../libraries/deployer");

var dummyTargetDir = "./checksum-dummy";
var dummyTargetFile = `${dummyTargetDir}/file1.js`;
var f = $$.flow.create("checksumActionTest", {
    start:function() {
        this.beforeExecution();
        this.act();
    },
    beforeExecution:function() {
        this.configObject = {
            "dependencies": [
                {
                    "name": "file1.js",
                    "actions": [{
                        "type": "checksum",
                        "src": dummyTargetFile,
                        "expectedChecksum": "403d91e9d3a8b6ce17435995882a4dba",
                        "algorithm": "md5",
                        "encoding": "hex"
                    }]
                }
            ]
        }

        // create dummy file structure
        fsExt.createDir(dummyTargetDir);
        fsExt.createFile(dummyTargetFile, "alert('test1')!");
    },
    act: function() {
        $$.callflow.start("deployer.Deployer").run(this.configObject, this.assert);
    },
    assert: function(error, result) {

        var testFailed = false;
        var message = "";

        if(error) {
            testFailed = true;
            message = error.message || JSON.stringify(error);
        } else {
            console.log(JSON.stringify(result));
            message = `[PASS] Checksum is valid!`;
        }

        let logger = testFailed ? console.error : console.log;
        logger(message);

        this.afterExecution();
    },
    afterExecution: function() {
        fsExt.rmDir(dummyTargetDir);
    }
});

f.start();

