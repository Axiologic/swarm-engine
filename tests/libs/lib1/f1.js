
//console.log("F1:", $$.libraryPrefix);
var myLib = $$.loadLibrary("library1");

$$.callflows.describe("f1", {
    public:{
        value:"int"
    },
    init:function(value){
        this.value = value;
    }
});