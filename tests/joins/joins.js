
require("../../engine/core").enableTesting();
var f = $$.callflow.create("joinsExample", {
    public:{
        result:"int"
    },
    start:function(){
        this.result = 0;
        var join = this.join(this.doJoin, "call var args");
        join.doStep1(1);
        join.doStep1(2);
    },
    doStep1:function(value){

        this.result += value;
    },
    doStep2:function(value){
        this.result += value;
    },
    doJoin:function(err, res){
        console.log("Joins result:", this.result, res);
    }
});

f.start();
console.log(f.result);
