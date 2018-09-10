if (typeof(global) == "undefined") {
    if (typeof(window) !== "undefined") {
        global = window;
    }
}

if (typeof(global.$$) == "undefined") {
    global.$$ = {};

    if (typeof(window) == "undefined") {
        window = global;
    }
    window.$$ = global.$$;
}


$$.__global = {

};

require("../../modules/callflow/lib/overwriteRequire")
require("./pskModules");

console.log("Loading runtime");



