const events = ["exit", "SIGINT", "SIGUSR1", "SIGUSR2", "uncaughtException", "SIGTERM", "SIGHUP"];
const os = require("os");

module.exports = function manageShutdownProcess(childrenList){

    let shutting = false;
    function handler(){
        //console.log("Handling exit event on", process.pid, "arguments:", arguments);
        var childrenNames = Object.keys(childrenList);
        for(let j=0; j<childrenNames.length; j++){
            var child = childrenList[childrenNames[j]];
            //console.log(`[${process.pid}]`, "Sending kill signal to PID:", child.pid);
            try{
                process.kill(child.pid);
            }catch(err){
                //...
            }
        }

        if(!shutting){
            try{
                process.stdout.cursorTo(0);
                process.stdout.write(`[PID: ${process.pid}] [Timestamp: ${new Date().getTime()}] [Process argv: ${process.argv}]- Shutting down...\n`);
            }catch(err)
            {
                //...
            }
            shutting = true;
        }

        setTimeout(()=>{
            process.exit(0);
        }, 0);
    }

    //TODO: find a better solution to replace process.stdin.resume()
    if(os.patform === "win32" && process.env.SHELL === "/bin/bash"){
        console.log("Could not execute resume() on stdin. Please use command prompt on windows to run PSK!!!\n\n\n");
    }else{
        process.stdin.resume();
    }

    for(let i=0; i<events.length; i++){
        var eventType = events[i];
        process.on(eventType, handler);
    }
    //console.log("Exit handler setup!", `[${process.pid}]`);
};