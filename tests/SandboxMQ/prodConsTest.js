var flow = require("../../lib/index");
var mq = require("../../lib/pubSub/folderMQ")

var queue = mq.getFolderQueue("../temp/testFolderMQ");

var flow = flow.createSwarm("test", {
    public:{
        value:"int"
    }
});


queue.registerConsumer(function(result){
    console.log("Consuming:", J(result));
    //queue.destroy();
});

var producerHandler = queue.getHandler();
//TODO test ony one consumer and only one producer


function filter(){
    return flow.getInnerValue().meta.swarmId;
}


flow.observe(function(){
            producerHandler.addSwarm(flow, function(){});
        }, null,filter);


setTimeout(function(){
    process.exit();
}, 1000);