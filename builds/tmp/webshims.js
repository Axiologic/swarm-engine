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
or.enableForEnvironment(or.constants.BROWSER_ENVIRONMENT_TYPE);


if (typeof($$.__runtimeModules) == "undefined") {
    $$.__runtimeModules = {};
}
require("./webshims_intermediar");
