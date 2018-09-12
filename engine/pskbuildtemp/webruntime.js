if (typeof(window) !== "undefined") {
    if (typeof(global) !== "undefined") {
        global = window;
    }
}

if(typeof(global.$$) == "undefined"){
    global.$$ = {};
    $$.browserRuntime = true;
}

if(typeof($$.__runtimeModules) == "undefined"){
    $$.__runtimeModules = {};
}
require("./nodeShims");


console.log($$.__runtimeModules["fs"])