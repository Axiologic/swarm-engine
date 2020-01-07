if(typeof $$ === "undefined"){
    $$ = {};
}
$$.browserRuntime = true;
require("../../modules/overwrite-require");
require("../../modules/callflow/standardGlobalSymbols");

require("./swBrowserified_intermediar");

require("callflow");

console.log("Loading runtime: callflow module ready");