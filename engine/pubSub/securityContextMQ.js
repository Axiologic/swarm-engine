exports.pubSub = require("./core/soundPubSub");

var mq = require("./core/folderMQ")


exports.create = function(folder, agentId, callback){
    //create
    var myQueue = mq.getFolderQueue(folder + "/"+ agentId);
    var pdsQueue = mq.getFolderQueue(folder + "/"+ agentId+".pds");
    var crlQueue = mq.getFolderQueue(folder + "/"+ agentId+".crl");
    //create temp folder

    myQueue.registerConsumer(function(result){
       //restore swarm
    });

    $$.PSK_PubSub.subscribe("pds", function(swarm){
        pdsQueue.addSwarm(swarm);
    });

    $$.PSK_PubSub.subscribe("crl", function(swarm){
        crlQueue.addSwarm(swarm);
    });
};
