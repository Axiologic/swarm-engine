
require("../../engine/core").enableTesting();
var f = $$.callflow.create("joinsExample", {
    public:{
        result:"int"
    },
    start:function(){
        this.result = 0;
        var join = this.join(this.doJoin);

        for(var i = 0; i < 10; i++ ){
            join.doStep(1, join.asyncCode);
        }
    },
    doStep:function(value, callback){
        this.result += value;
        setTimeout(callback,1);
    },

    doJoin:function(name){
        console.log("Joins result:", this.result); //should print 1010
    },
    asyncCode: function(){
        this.result += 100;
    }
});

f.start();

//setTimeout(f.doJoin, 2);

