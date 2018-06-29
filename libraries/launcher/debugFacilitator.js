var child_process = require("child_process");
var debugArg = (process.platform == 'win32') ? "--inspect=" : "--debug-brk=";
var multiplier = 0;
function prepareDebugPortOnFork(execArgv){
    multiplier++;
    var portIncreaseNumber = 10*multiplier;
    var newArgv = [];
    for(var i = 0; i < execArgv.length; i++){
        var argv = execArgv[i];
        newArgv.push(argv);
        if(argv.indexOf(debugArg)!=-1){
            newArgv[i] = argv.replace(process.debugPort, process.debugPort+portIncreaseNumber);
        }
    }
    return newArgv;
}

function argumentsMakeover(args){
    if(process.debugPort>0){
        //ensure that args 1 and 2 are defined
        args[1] = Array.apply(this, [args[1]]);
        args[2] = Object.apply(this, [args[2]]);

        //increase debug port for child process
        var execArgv = prepareDebugPortOnFork(args[2].execArgv || process.execArgv);
        args[2].execArgv = execArgv;
    }

    return args;
}

//save the original function ref for later use
var initial_fork_function = child_process.fork;

module.exports.debugForks = function(enable){
    if(enable){
        child_process.fork = function(...args){
            return initial_fork_function.apply(this, argumentsMakeover(args));
        }
    }else{
        child_process.fork = initial_fork_function;
    }
};
