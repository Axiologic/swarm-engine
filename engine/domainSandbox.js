require('../builds/devel/pskruntime');
require('../builds/devel/psknode');
require('../engine/core');
require('../modules/psk-http-client');
const folderMQ = require("foldermq");
const path = require('path');

process.env.PRIVATESKY_DOMAIN_NAME = process.argv[2] || "AnonymousDomain"+process.pid;
process.env.PRIVATESKY_DOMAIN_BUILD = "../builds/devel/domain";
process.env.PRIVATESKY_TMP = path.resolve("../tmp");

const oldLogFnc = console.log;
console.log = function(...args){
    oldLogFnc(`[${process.env.PRIVATESKY_DOMAIN_NAME}]`, ...args);
}

$$.container = require('../modules/dicontainer').newContainer($$.errorHandler);
$$.PSK_PubSub = require('../engine/pubSub/launcherPubSub').create(process.env.PRIVATESKY_TMP, path.resolve('..'));

console.log(`Booting domain sandbox...`);
var domain = JSON.parse(process.env.config);

if(typeof domain.constitution != "undefined" && domain.constitution != "undefined"){
    process.env.PRIVATESKY_DOMAIN_BUILD = domain.constitution;
}

//enabling blockchain from confDir
console.log("COnfig", path.resolve(domain.workspace));
require('pskdb').startDB(path.resolve(domain.workspace));

//loading swarm definitions
console.log("Loading constitution file", process.env.PRIVATESKY_DOMAIN_BUILD);
require(process.env.PRIVATESKY_DOMAIN_BUILD);

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
            var que = folderMQ.createQue(path2folder, (err, res) => {
                    if(!err){
                        console.log(`\n[***]Alias <${alias}> listening local on ${path2folder}\n`);
                    }
                });
            que.registerConsumer((err, swarm) => {
				if(!err){
					$$.PSK_PubSub.publish($$.CONSTANTS.SWARM_FOR_EXECUTION, swarm);
				}
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