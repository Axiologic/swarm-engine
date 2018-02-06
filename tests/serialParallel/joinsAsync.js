
require("../../engine/core").enableTesting();
var f = $$.callflow.create("joinsExample", {
    public:{
        result:"int"
    },
    start:function(){
        this.result = 0;
        var join = this.join(this.doJoin);

        join.doStep1(1, join.asyncCode);
        join.doStep2(2);
        join.doStep1(8, this.asyncCode);
    },
    doStep1:function(value, callback){
        this.result += value;
        setTimeout(callback,1);
    },
    doStep2:function(value){
        this.result += value;
    },
    doJoin:function(){
        console.log("Joins result:", this.result); //should print 111 because the callback from the second doStep1 is not from the join...
    },
    asyncCode: function(){
        this.result += 100;
    }
});

f.start();

setTimeout(f.doJoin, 2); //should print 211

