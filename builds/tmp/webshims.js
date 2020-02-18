if (typeof(window) !== "undefined") {
    if (typeof(global) !== "undefined") {
        global = window;
    }else
    {
        window.global = window;
    }
}

if (typeof(global.$$) == "undefined") {
    global.$$ = {};
    $$.requireBundle = function () {
    };
}
const or = require('overwrite-require');
let allowedEnvTypes = [or.constants.BROWSER_ENVIRONMENT_TYPE, or.constants.SERVICE_WORKER_ENVIRONMENT_TYPE];

if(allowedEnvTypes.indexOf($$.environmentType)!==-1){
    console.log(`webshims already loaded in ${$$.environmentType}`)
}
else{
    or.enableForEnvironment(or.constants.BROWSER_ENVIRONMENT_TYPE);
}

if (typeof($$.__runtimeModules) == "undefined") {
    $$.__runtimeModules = {};
}
require("./webshims_intermediar");
