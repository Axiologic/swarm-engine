const config = {
    endpoint:'http://127.0.0.1',
    port: 8080,
    agentUrl: 'localhost/agent/system'
};

if(process.argv.length > 2) {
    //config.agentUrl = process.argv[2];
    // config.domain = config.agentUrl.split('/')[0];
}

require('../builds/devel/pskruntime');
require('../engine/core');
require('../modules/psk-http-client/index');
require('../builds/devel/domain');
const path = require('path');



// console.log(`Domainsandbox ${config.domain} is loading.`);



process.env.PRIVATESKY_TMP = path.resolve('../tmp');

$$.container = require('../modules/dicontainer').newContainer($$.errorHandler);
$$.PSK_PubSub = require('../engine/pubSub/launcherPubSub').create(path.resolve('../tmp'), path.resolve('..'));

//$$.loadLibrary('testSwarms', '../libraries/testSwarms');

$$.remote.createRequestManager(1000);

console.log('virtualmqEndpoint', `${config.endpoint}:${config.port}`, `${config.agentUrl}`);
$$.remote.newEndPoint('virtualmqEndpoint', `${config.endpoint}:${config.port}`, `${config.agentUrl}`);


$$.remote.virtualmqEndpoint.on('*', '*', function (err, res) {
    $$.PSK_PubSub.subscribe($$.CONSTANTS.SWARM_RETURN, (swarm) => {
        if(swarm && swarm.meta && swarm.meta.target && res.meta.homeSecurityContext == swarm.meta.target){
        $$.remote.doHttpPost(swarm.meta.target, swarm, function(err, res){
            if(err){
                console.log(err);
            }
        });
    }
        // TODO: send swarm home
    }, () => false);
    $$.PSK_PubSub.publish($$.CONSTANTS.SWARM_FOR_EXECUTION, res);
});
