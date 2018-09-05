var browserify = require('browserify');
var fs = require("fs");
var out;


var common = browserify("../engine/pskbuildtemp/webruntime.js");
out = fs.createWriteStream("../builds/devel/webruntime.js")
common.bundle().pipe(out);

/*

var pskModules = browserify("./runtimes/src/pskruntime.js", {
    paths:__dirname+ "/../modules/",
    "bare":true,
    "debug":true
});
out = fs.createWriteStream("./runtimes/runtime.js")
pskModules.bundle().pipe(out);
*/

/*
var pskModules = browserify("./runtimes/quickTest/testSwarm.js", {ignoreMissing:true});

var out = fs.createWriteStream("./runtimes/runTest.js")
pskModules.bundle().pipe(out);
*/


/*
var pskModules = browserify("./runtimes/quicktest/learn/main.js", {debug:true});

var out = fs.createWriteStream("./mainX.js")
pskModules.bundle().pipe(out); */