
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
    },
    result:function(){
        return this.result;
    }
})();

f.begin();
console.log(f.result());
