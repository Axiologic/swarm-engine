require("../../engine/core").enableTesting();
var fs = require("fs");
const fsExt = require('../../libraries/utils/FSExtension').fsExt;

var fsm = require("../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();

var dummyTargetDir = "./save-state-dummy";
var f = $$.flow.create("saveState", {
    start:function() {
        this.beforeExecution();
        this.act();
        this.assert();
        this.afterExecution();
    },
    beforeExecution:function() {
        // create dummy empty directory
        fsExt.createDir(dummyTargetDir);
        fsExt.createFile(`${dummyTargetDir}/file1.js`, "alert('test1')!");
        fsExt.createDir(`${dummyTargetDir}/sub-dir`);
        fsExt.createFile(`${dummyTargetDir}/sub-dir/file2.js`, "alert('test2')!");
    },
    act: function() {
        fileStateManager.saveState([dummyTargetDir]);
        fileStateManager.restoreState();
    },
    assert: function() {
        let dirPath = fsExt.resolvePath(dummyTargetDir);
        if(fs.existsSync(dirPath) === true) {
            console.log(`[PASS] Dir "${dirPath}" exists after restore!`);
        } else {
            console.error(`[FAIL] Dir "${dirPath}" does not exist after restore!`);
        }
    },
    afterExecution: function() {
        fsExt.rmDir(dummyTargetDir);
    }
});

f.start();

