
var assert = require("double-check").assert;

require("../../engine/core").enableTesting();
var f = $$.callflow.create("callbacksExample", {
    public:{
        result:"int"
    },
    start:function(callback){
        this.result = 0;
        this.callback = callback;
        var join = this.parallel(this.doJoin);

        for(var i = 0; i < 10; i++ ){
            join.doStep(1, join.asyncCode);
        }
    },
    doStep:function(value, callback){
        this.result += value;
        setTimeout(callback,1);
    },

    doJoin:function(err){
        this.callback();
    },
    asyncCode: function(){
        this.result += 100;
    }
});

assert.callback("test callback final", function(callback){
    f.start(callback);
})


//setTimeout(f.doJoin, 2);

