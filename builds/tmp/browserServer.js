if(typeof $$ === "undefined"){
    $$ = {};
}
$$.browserRuntime = true;
require("../../modules/overwrite-require");
require("./browserServer_intermediar");