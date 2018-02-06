
require("../../engine/core").enableTesting();
var f = $$.callflow.create("joinsExample", {
    public:{
        result:"int"
    },
    start:function(){
        this.result = 0;
        var serial = this.serial(this.onResults, "Hello serial execution!");
        var res = serial.doAsync(serial.asyncStep);
        serial.doStep1(1).doStep2(2);
    },
    doStep1:function(value){
        console.log("Executing step 1!");
        this.result += value;
    },
    doStep2:function(value){
        console.log("Executing step 2!");
        this.result += value;
    },
    asyncStep:function(value){
        console.log("Executing async step!", value);
        this.result += value;
    },
    doAsync:function(callback){
        console.log("Executing async!");
        setTimeout(function(){
            callback(100);
        }, 100);
    },
    onResults:function(err, res){
        //err should be null
        console.log("Serial execution result:", this.result, res);
    }
});

f.start();
//console.log(f.result); //should be 0... nothing got executed
