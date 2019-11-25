require('../../bundles/pskruntime');
require('../../bundles/psknode');

const integration = require('zmq_adapter');
const enableSignatureCheck = process.env.enable_signature_check || true;

require('../../core/utils/pingpongFork').enableLifeLine(1000);

if(enableSignatureCheck){
    console.log('Starting ZeroMQ Proxy with signature check');

    integration.createZeromqProxyNode(null, null, (channel, signature, callback)=>{
        if(callback){
            callback(null, true);
        }
    });
}else{
    console.log('Starting ZeroMQ Proxy without signature check');

    integration.createZeromqProxyNode();
}
