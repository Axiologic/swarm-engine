const path = require('path');

/**
 * These need to be first to allow customization of behavior of libraries in bundles
 * Currently PSKLogger (used inside callflow) uses this
 */
process.env.PRIVATESKY_DOMAIN_NAME = process.argv[2] || "AnonymousDomain"+process.pid;
process.env.PRIVATESKY_DOMAIN_BUILD = "../bundles/domain.js";
process.env.PRIVATESKY_TMP = process.env.PRIVATESKY_TMP || path.resolve("../tmp");
process.env.DOMAIN_WORKSPACE = path.resolve(process.env.PRIVATESKY_TMP, "domainsWorkspace", process.env.PRIVATESKY_DOMAIN_NAME);

require('../../bundles/pskruntime');
require('../../bundles/psknode');

require('psk-http-client');
const folderMQ = require("foldermq");
const fs = require('fs');
const msgpack = require('@msgpack/msgpack');

require('launcher');

const oldLogFnc = console.log;
console.log = function(...args){
    oldLogFnc(`[${process.env.PRIVATESKY_DOMAIN_NAME}]`, ...args);
};

$$.container = require('dicontainer').newContainer($$.errorHandler);
$$.PSK_PubSub = require('domainBase').domainPubSub.create(process.env.PRIVATESKY_TMP, path.resolve('..'));

console.log(`Booting domain sandbox...`);
var domain = JSON.parse(process.env.config);

if(typeof domain.constitution !== "undefined" && domain.constitution !== "undefined"){
    process.env.PRIVATESKY_DOMAIN_BUILD = domain.constitution;
}

if(typeof domain.workspace !== "undefined" && domain.workspace !== "undefined") {
    process.env.DOMAIN_WORKSPACE = domain.workspace;
}

//enabling blockchain from confDir
//validate path exists
console.log("Using workspace", path.resolve(process.env.DOMAIN_WORKSPACE));
require('pskdb').startDB(path.resolve(process.env.DOMAIN_WORKSPACE));

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
        fs.mkdir(path2folder, {recursive: true}, (err, res)=>{
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
       console.log(`Alias ${alias} has already a local queue attached.`);
    }

    if(!localReplyHandlerSet){
        $$.PSK_PubSub.subscribe($$.CONSTANTS.SWARM_RETURN, (swarm) => {
            const urlRegex = new RegExp(/^(www|http:|https:)+[^\s]+[\w]/);
            if (swarm && swarm.meta && swarm.meta.target && !urlRegex.test(swarm.meta.target)) {
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
            const urlRegex = new RegExp(/^(www|http:|https:)+[^\s]+[\w]/);
            if (swarm && swarm.meta && swarm.meta.target && urlRegex.test(swarm.meta.target)) {
                $$.remote.doHttpPost(swarm.meta.target, msgpack.encode(swarm), function(err, res){
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
