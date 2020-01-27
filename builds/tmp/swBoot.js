if(typeof $$ === "undefined"){
    $$ = {};
}
$$.browserRuntime = true;
require("../../modules/overwrite-require");
require("../../modules/callflow/standardGlobalSymbols");
require("./swBoot_intermediar");

