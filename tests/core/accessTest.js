var flow = require("../../engine/index.js");

var f = flow.createSwarm("simpleSwarm", {
    protected:{
        prot_count:"int"
    },
    public:{
        pub_count:"int"
    },
    begin:function(){
        this.count = 3; //added in private
    }
});

f.begin();
f.pub_count = 1;
f.prot_count = 2;
f.priv_count = 3; //not declared
console.log(f);
