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
        fsExt.createFile(dummyTargetFile, "alert('test1')!");
    },
    assert: function() {
        let expectedChecksum = "403d91e9d3a8b6ce17435995882a4dba";
        let checksum = fsExt.checksum(dummyTargetFile);

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

