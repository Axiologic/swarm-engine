
var oldRequire = global.require;

console.log("...");
global.require = function(name){
    console.log("Called for ", name);
}