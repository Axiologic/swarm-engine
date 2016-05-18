require("../../engine/core").enableTesting();


var lib1 = $$.loadLibrary("library1","./lib1");
var lib2 = $$.loadLibrary("library2","./lib2");
var lib3 = $$.loadLibrary("library2");  //should be == lib2

//$$.callflow.start("wrongName"); //should send errors
$$.callflow.start("library1.f1");

//console.log(lib2);
$$.callflow.start(lib3.f2);