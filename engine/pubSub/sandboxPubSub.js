var pubSub = require("./core/soundPubSub").soundPubSub;

var mq = require("./core/folderMQ")


exports.create = function(folder, spaceId){
    //create



    var myQueue = mq.getFolderQueue(folder + "/"    + spaceId);
    var pdsQueue = mq.getFolderQueue(folder + "/"   + spaceId  +".pds");
    var crlQueue = mq.getFolderQueue(folder + "/"   + spaceId  +".crl");
    //create temp folder

    myQueue.registerConsumer(function(result){
       //restore swarm
    });

    pubSub.subscribe("pds", function(swarm){
        pdsQueue.addSwarm(swarm);
    });

    pubSub.subscribe("crl", function(swarm){
        crlQueue.addSwarm(swarm);
    });
    return pubSub;
};
