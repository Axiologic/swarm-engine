var pubSub = $$.requireModule("soundpubsub").soundPubSub;
var mq = $$.requireModule("soundpubsub").folderMQ;
var path = require("path");

exports.create = function(folder, core){
    var inbound = mq.getFolderQueue(path.join(folder, "/mq/inbound/"), $$.defaultErrorHandlingImplementation);
    var outbound = mq.getFolderQueue(path.join(folder, "/mq/outbound/"), $$.defaultErrorHandlingImplementation).getHandler();

    inbound.registerConsumer(function(err, swarm){
       //restore and execute this tasty swarm
        global.$$.swarmsInstancesManager.revive_swarm(swarm);
    });

    pubSub.subscribe($$.CONSTANTS.SWARM_FOR_EXECUTION, function(swarm){
        outbound.sendSwarmForExecution(swarm);
    });

    return pubSub;
};
