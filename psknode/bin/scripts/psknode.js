/*
  Rebuild sources
  Start A Virtual MQ
  Start a Launcher
 */

const {spawnSync, fork, spawn} = require('child_process');

const builderProcess = spawnSync('node', ['./bin/scripts/pskbuild.js', './builds/build.json'], {stdio: ['inherit', 'inherit', null]});
if(builderProcess.stderr && builderProcess.stderr.length !== 0) {
    console.error(builderProcess.stderr.toString('utf8'));
    process.exit();
}

console.log("Build done!");


let shouldRestart = true;
const forkedProcesses = {};


function startProcess(filePath) {
    console.log("Booting", filePath);
    forkedProcesses[filePath] = spawn('node', [filePath], {detached: process.platform === "win32" ? false : true, setsid: true, stdio: 'inherit'});

    console.log('SPAWNED ', forkedProcesses[filePath].pid);

    function errorHandler(filePath) {
        return function (error) {
            console.log(`\x1b[31mException caught on spawning file ${filePath} `, error ? error : "", "\x1b[0m"); //last string is to reset terminal colours
            if (shouldRestart) {
                startProcess(filePath);
            }
        }
    }

    function exitHandler(filePath) {
        return function () {
            console.log(`\x1b[33mExit caught on spawned file ${filePath}`, "\x1b[0m"); //last string is to reset terminal colours
            if (shouldRestart) {
                startProcess(filePath);
            }
        }
    }

    forkedProcesses[filePath].on('error', errorHandler(filePath));
    forkedProcesses[filePath].on('exit', exitHandler(filePath));
}

startProcess('./psknode/bin/scripts/virtualMq.js');
startProcess('./psknode/core/launcher.js');

require('./../../core/utils/exitHandler.js')(forkedProcesses);
