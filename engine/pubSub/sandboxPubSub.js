var pubSub = require("./core/soundPubSub").soundPubSub;

var mq = require("./core/folderMQ")


exports.create = function(folder, core){

    var inbound = mq.getFolderQueue(this.folder + "/mq/inbound/", $$.defaultErrorHandlingImplementation);
    var outbound = mq.getFolderQueue(this.folder + "/mq/outbound/", $$.defaultErrorHandlingImplementation).getHandler();


    inbound.registerConsumer(function(swarm){
       //restore and execute this tasty swarm
        $$.swarms.revive_swarm(swarm);
    });

    pubSub.subscribe($$.CONSTANTS.SWARM_FOR_EXECUTION, function(swarm){
        outbound.addSwarm(swarm);
    });


    return pubSub;
};
