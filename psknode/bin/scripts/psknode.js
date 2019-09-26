/*
  Rebuild sources
  Start A Virtual MQ
  Start a Launcher
 */

const {spawnSync, fork, spawn} = require('child_process');
const path = require('path');
const max_timeout = 10*60*1000; // 10 minutes
const restartDelays = {};

let shouldRestart = true;
const forkedProcesses = {};


function startProcess(filePath) {
    console.log("Booting", filePath);
    forkedProcesses[filePath] = spawn('node', [filePath], {detached: process.platform === "win32" ? false : true, setsid: true, stdio: 'inherit'});

    console.log('SPAWNED ', forkedProcesses[filePath].pid);

    function restartWithDelay(filePath){
        let timeout = restartDelays[filePath] || 100;
        console.log(`Process will restart in ${timeout} ms ...`);
        setTimeout(()=>{
            restartDelays[filePath] = (timeout * 2) % max_timeout;
            startProcess(filePath);
        }, timeout);
    }

    function errorHandler(filePath) {
        let timeout = 100;
        return function (error) {
            console.log(`\x1b[31mException caught on spawning file ${filePath} `, error ? error : "", "\x1b[0m"); //last string is to reset terminal colours
            if (shouldRestart) {
                restartWithDelay(filePath);
            }
        }
    }

    function exitHandler(filePath) {
        return function () {
            console.log(`\x1b[33mExit caught on spawned file ${filePath}`, "\x1b[0m"); //last string is to reset terminal colours
            if (shouldRestart) {
                restartWithDelay(filePath);
            }
        }
    }

    forkedProcesses[filePath].on('error', errorHandler(filePath));
    forkedProcesses[filePath].on('exit', exitHandler(filePath));
}

startProcess(path.join(__dirname, 'virtualMq.js'));
startProcess(path.join(__dirname, '../../core/launcher.js'));

require('./../../core/utils/exitHandler.js')(forkedProcesses);
