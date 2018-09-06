/*

Run testSwarm.js
 */

require("../devel/pskruntime.js");

var Module = require('module');

var originalLoader   = Module._load;
function newLoader(request) {
    var result;

    try{
        result  = browserifyRequire(request);
    }catch(err){
        result = originalLoader.apply(this, arguments);
    }
    return result;
};
Module._load = newLoader;

/*
var originalRequire = Module.prototype.require;

function createWrapper() {
    var browserifiedRequire = require("../devel/pskruntime.js").requireX;

    return function requireWrapper(modul) {
        var result;

        try {
            console.log("starting");
            Module.prototype.require = function(module){

               return originalRequire(module);
            }
            result = browserifiedRequire(modul);
        } catch (err) {
            result = originalRequire(modul);
        }

        console.log(result);
        Module.prototype.require = requireWrapper;
        return result;
    }
}



Module.prototype.require = createWrapper();*/
require("./testSwarm.js");