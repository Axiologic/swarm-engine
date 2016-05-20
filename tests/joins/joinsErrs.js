
require("../../engine/core").enableTesting();
var f = $$.callflow.create("joinsExample", {
    public:{
        result:"int"
    },
    start:function(){
        this.result = 0;
        var join = this.join(this.doJoin, "\nbut also the join args -------");
        join.doStep(1);
        join.doStepErr("Intentional error");
    },
    doStep:function(value){
        this.result += value;
    },
    doStepErr:function(value){
        throw new Error(value);
    },
    doJoin:function(err, text){
        if(err){
            console.log("Error as expected:", err, text);
        } else {
            console.log("Why there is not an error!!!!?");
        }
    }
});

f.start();

