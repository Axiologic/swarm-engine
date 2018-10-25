/*
  Rebuild sources
  Start A Virtual MQ
  Start a Launcher
 */

const {spawnSync, fork, spawn} = require('child_process');

console.log("Start building...");
spawnSync('node', ['./bin/scripts/pskbuild.js', './builds/build.json']);
console.log("Build done!");


let shouldRestart = true;
const forkedProcesses = {};


function startProcess(filePath) {
    console.log("Booting", filePath);
    forkedProcesses[filePath] = spawn('node', [filePath], {detached: true, setsid: true, stdio: 'inherit'});

    console.log('SPAWNED ', forkedProcesses[filePath].pid);

    function errorHandler(error) {
        console.log("Exception caught", error ? error : "");
        if (shouldRestart) {
            startProcess(filePath);
        }
    }

    forkedProcesses[filePath].on('error', errorHandler);
    forkedProcesses[filePath].on('exit', errorHandler);
}


startProcess('./bin/scripts/virtualMq.js');
startProcess('./engine/launcher.js');


[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
    process.on(eventType, () => {
        console.log('Shutting down...');
        shouldRestart = false;
        Object.keys(forkedProcesses).forEach(childProcess => {
            console.log('KILLING ', -forkedProcesses[childProcess].pid);
            process.kill(-forkedProcesses[childProcess].pid);
        });
    })
});
