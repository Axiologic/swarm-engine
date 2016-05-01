
var flow = require("../lib/index.js");
var f = flow.describeSwarm("FlowExample", {
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
console.log(f.result);
