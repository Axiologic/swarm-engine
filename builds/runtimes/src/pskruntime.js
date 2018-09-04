if(typeof(global) == "undefined"){
    if(typeof(window) !== "undefined") {
        global = window;
    }
}

if(typeof(global.$$) == "undefined"){
    global.$$ = {};

    if(typeof(window) == "undefined") {
        window = global;
    }
    window.$$ = global.$$;
}

if(typeof($$["__runtimeModules"]) == "undefined"){
    $$.__runtimeModules = {};
    console.log("Defining $$.__runtimeModules", $$.__runtimeModules)
}

if(typeof($$["browserRuntime"]) == "undefined") {
    require("./nodeModules")
}

$$.__runtimeModules["soundpubsub"] = require("soundpubsub");
$$.__runtimeModules["callflow"] = require("callflow");
$$.__runtimeModules["dicontainer"] = require("dicontainer");
$$.__runtimeModules["double-check"] = require("double-check");
$$.__runtimeModules["pskcrypto"] = require("pskcrypto");




