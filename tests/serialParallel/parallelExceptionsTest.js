
require("../../engine/core").enableTesting();
var f = $$.callflow.create("parallelExceptionCase", {
    public:{
        result:"int",
        resultCount:"int"

    },
    start:function(){
        this.result = 0;
        this.resultCount = 0;
        var join = this.join(this.doJoin, "\nbut also the args should be fine");
        join.doStep(1);
        join.doStep(2);
        join.doStepErr("Intentional error");
    },
    doStep:function(value){
        this.result += value;
    },
    doStepErr:function(value){
        throw new Error(value);
    },
    doJoin:function(err, text){
        this.resultCount++;
        if(this.resultCount == 1){
            if(err){
                console.log("Error as expected:", err, text);
            } else {
                console.log("Why there is not an error!!!!?");
            }
        }  else {
            console.log("Error is expected, but only once!", this.resultCount );
        }

    }
});

f.start();

