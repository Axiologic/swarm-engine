var flow = require("../../lib/core").enableTesting();
var mq = require("../../lib/pubSub/core/folderMQ")

var queue = mq.getFolderQueue("../temp/testFolderMQ");

var flow1 = flow.createSwarm("test", {
    public:{
        value:"int"
    },
    init:function(value){
        this.value = value;
    }
});


var flow2 = flow.startSwarm("test");
flow2.init(2);

var producerHandler = queue.getHandler();

function filter(){
    return flow1.getInnerValue().meta.swarmId;
}


flow1.observe(function(){
            flow1.init(1);
            producerHandler.addSwarm(flow1);
            producerHandler.addSwarm(flow2);
            queue.registerConsumer(function(result){
                console.log("Consuming:", J(result));
            });
        }, null,filter);

setTimeout(function(){
    process.exit();
}, 1000);