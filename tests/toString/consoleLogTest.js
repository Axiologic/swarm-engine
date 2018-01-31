
require("../../engine/core").enableTesting();
var f = $$.callflow.create("dummy", {
    public:{
        result:"int"
    },
    start:function(){
        this.result = 0;
    }
});

f.start();
f.__self = f;
console.log(f);
