var browserify = require('browserify');

var common = browserify();
b.add('./runtimes/node-node-browser.js');
b.require().pipe(process.stdout);




var b = browserify();
b.add('./runtimes/runtime.js');
b.bundle().pipe(process.stdout);