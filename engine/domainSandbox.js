require('../builds/devel/pskruntime');
require('../builds/devel/psknode');
require('../engine/core');
require('../modules/psk-http-client');
const folderMQ = require("foldermq");
const path = require('path');

process.env.PRIVATESKY_DOMAIN_NAME = "AnonymousDomain";
process.env.PRIVATESKY_TMP = path.resolve("../tmp");
let confDir = path.resolve("../conf");

if(process.argv.length > 3){
    process.env.PRIVATESKY_DOMAIN_NAME = process.argv[2];
}

if(process.argv.length > 4){
    confDir = process.argv[3];
}

$$.container = require('../modules/dicontainer').newContainer($$.errorHandler);
$$.PSK_PubSub = require('../engine/pubSub/launcherPubSub').create(process.env.PRIVATESKY_TMP, path.resolve('..'));

console.log(`Booting ${process.env.PRIVATESKY_DOMAIN_NAME} domain sandbox...`);

//enabling blockchain
require('pskdb').startDB(confDir);

let transaction = $$.blockchain.beginTransaction({});
var domain = transaction.lookup('global.DomainReference', process.env.PRIVATESKY_DOMAIN_NAME);
process.env.PRIVATESKY_DOMAIN_BUILD = domain.constitution;
//loading swarm definitions
if(process.env.PRIVATESKY_DOMAIN_BUILD){
    console.log("Loading...", process.env.PRIVATESKY_DOMAIN_BUILD);
    require(domain.constitution);
}else{
    //require("../builds/devel/domain");
}

for(let alias in domain.remoteInterfaces){
    let remoteUrl = domain.remoteInterfaces[alias];
    connectToRemote(alias, remoteUrl);
}

var queues = {};
setTimeout(()=>{
    for(let alias in domain.localInterfaces){
        let path = domain.localInterfaces[alias];
        connectLocally(alias, path);
    }
}, 100);


var localReplyHandlerSet = false;
function connectLocally(alias, path2folder){
    if(!queues[alias]){
        path2folder = path.resolve(path2folder);
        var flow = $$.flow.start("mkDirRec");
        flow.make(path2folder, (err, res)=>{
            console.log("ERR RES", err, res);
            var que = folderMQ.createQue(path2folder, (err, res) => {
                    if(!err){
                        console.log(`\n[***]Alias <${alias}> listening local on ${path2folder}\n`);
                    }
                });
            que.registerConsumer((swarm) => {
                $$.PSK_PubSub.publish($$.CONSTANTS.SWARM_FOR_EXECUTION, swarm);
            });
            queues[alias] = que;
        });
    }else{
       console.log("Alias ${alias} has allready a local queue attached.");
    }

    if(!localReplyHandlerSet){
        $$.PSK_PubSub.subscribe($$.CONSTANTS.SWARM_RETURN, (swarm) => {
            if(swarm && swarm.meta && swarm.meta.target  && swarm.meta.target.indexOf("http:") == -1){
                var q = folderMQ.createQue(swarm.meta.target, (err, res)=>{
                        if(!err){
                            q.getHandler().sendSwarmForExecution(swarm)
                        }else{
                            console.log(`Unable to send to folder ${swarm.meta.target} swarm with id $swarm.meta.id`);
                        }
                    });
            }
        }, () => true);
        localReplyHandlerSet = true;
    }
}

var virtualReplyHandlerSet = false;
function connectToRemote(alias, remoteUrl){
    $$.remote.createRequestManager(1000);

    console.log(`\n[***]Alias <${alias}> listening on ${remoteUrl} channel ${process.env.PRIVATESKY_DOMAIN_NAME}/agent/system\n`);
    $$.remote.newEndPoint(alias, `${remoteUrl}`, `${process.env.PRIVATESKY_DOMAIN_NAME}/agent/system`);

    //we need only one subscriber to send all answers back to the network...
    if(!virtualReplyHandlerSet){
        //subscribe on PubSub to catch all returning swarms and push them to network accordingly
        $$.PSK_PubSub.subscribe($$.CONSTANTS.SWARM_RETURN, (swarm) => {
            if(swarm && swarm.meta && swarm.meta.target  && swarm.meta.target.indexOf("http:") != -1){
                $$.remote.doHttpPost(swarm.meta.target, swarm, function(err, res){
                    if(err){
                        console.log(err);
                    }
                });
            }
        }, () => true);
        virtualReplyHandlerSet = true;
    }

    $$.remote[alias].on('*', '*', function (err, res) {
        $$.PSK_PubSub.publish($$.CONSTANTS.SWARM_FOR_EXECUTION, res);
    });
}