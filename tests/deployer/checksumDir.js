require("../../engine/core").enableTesting();
const fsExt = require('../../libraries/utils/FSExtension').fsExt;

var dummyTargetDir = "./checksum-dummy";
var dummyTargetFile = `${dummyTargetDir}/file1.js`;
var f = $$.flow.create("fileChecksum", {
    start:function() {
        this.beforeExecution();
        this.assert();
        this.afterExecution();
    },
    beforeExecution:function() {
        // create dummy file structure
        fsExt.createDir(dummyTargetDir);
        fsExt.createFile(`${dummyTargetDir}/file1.js`, "alert('test1')!");
        fsExt.createDir(`${dummyTargetDir}/sub-dir`);
        fsExt.createFile(`${dummyTargetDir}/sub-dir/file2.js`, "alert('test2')!");
    },
    assert: function() {
        let expectedChecksum = "00b9bf7a422e20bff93b14169e1a0842";
        let checksum = fsExt.checksum(dummyTargetDir);

        if(expectedChecksum === checksum) {
            console.log(`[PASS] Checksum was calculated correctly! The checksum was ${checksum}`);
        } else {
            console.error(`[FAIL] Checksum was not calculated correctly! The result was ${checksum} and it should have been ${expectedChecksum}!`);
        }
    },
    afterExecution: function() {
        fsExt.rmDir(dummyTargetDir);
    }
});

f.start();

