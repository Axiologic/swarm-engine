
if(typeof(global.$$) == "undefined"){
    global.$$ = {};
    window.$$ = global.$$;
    $$.browserRuntime = true;
}

if(typeof($$.__runtimeModules) == "undefined"){
    $$.__runtimeModules = {};
}
require("./nodeShims");
var c = require("crypto");
console.log("Am incarcat dependentele", c);
