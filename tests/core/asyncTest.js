
require("../../engine/core").enableTesting();
var f = $$.flow.create("asyncExample", {
    private:{
        a1:"int",
        a2:"int"
    },
    public:{
        result:"int"
    },
    begin:function(a1,a2){
        this.a1 = a1;
        this.a2 = a2;
        setTimeout(this.doStep, 1);
    },
    doStep:function(){
        this.result = this.a1 + this.a2;
    }
});


f.begin(1, 2);
setTimeout(function(){
    console.log("Result should be 3 and is: ", f.result);
}, 2);

