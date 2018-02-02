
require("../../engine/core").enableTesting();
var f = $$.flow.describe("FlowExample", {
    private:{
        a1:"int",
        a2:"int"
    },
    public:{
        result:"int"
    },
    begin:function(a1,a2){
        this.result = a1 + a2;
    }
})();

f.begin(1, 2);
console.log("Result should be 3 and is: ", f.result);
