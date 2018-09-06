
if(typeof(global.$$) == "undefined"){
    global.$$ = {};
    window.$$ = global.$$;
    $$.browserRuntime = true;
}

if(typeof($$.__runtimeModules) == "undefined"){
    $$.__runtimeModules = {};
}
require("./nodeShims")