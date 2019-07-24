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

$$.browserRuntime = true;

if (typeof($$.__runtimeModules) == "undefined") {
    $$.__runtimeModules = {};
}
require("./webshims_intermediar");
$$.__runtimeModules["fs"] = require("pskwebfs");