
require("../../engine/core").enableTesting();
var f = $$.callflow.create("serialExample", {
    public:{
        result:"int"
    },
    start:function(){
        this.result = 0;
        var serial = this.serial(this.onResults, "Hello serial execution!")

        serial.doStep1(1000);
        serial.doAsync(serial.asyncStep);
        serial.doStep1(1).doStep2(2);

        //echivalent: this.serial(this.onResults, "Hello serial execution!").doAsync(serial.asyncStep).doStep1(1).doStep2(2)
    },
    doStep1:function(value){
        console.log("Executing step 1!", value);
        this.result += value;
    },
    doStep2:function(value){
        console.log("Executing step 2!", value);
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
        console.log("Serial execution result (should be 1103):", this.result, res);
    }
});

f.start();
//console.log(f.result); //should be 0... nothing got executed
