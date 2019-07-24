const config = {
    addressForPublishers: 'tcp://127.0.0.1:7000',
    addressForSubscribers: 'tcp://127.0.0.1:7001',
    addressForCollector: 'tcp://127.0.0.1:5558'
};

const PSKLogger = require('../../modules/psklogger');
const cluster = require('cluster');

/**
 * This script starts two processes.
 *
 * The first one is a Pub/Sub Proxy where all processes connect/publish to.
 * This is important because it allows to configure only the address of this proxy in case multiple subscribers are
 * present, otherwise, each process/publisher would know the address of every subscriber
 *
 * The second process is a subscriber of the proxy that redirects all traffic to the "Collector" node
 */

if(cluster.isMaster) {
    // needs to be different process, otherwise it might lose messages if subscribers are slow

    const PubSubProxy = PSKLogger.PubSubProxyModule.PubSubProxy;
    new PubSubProxy(config);

    console.log('PubSubProxy started');
    
    cluster.fork();

} else {
    const NODE_NAME = process.env.NODE_NAME || 'anon';

    const zmq = require('zeromq');
    const sender = zmq.socket('push');
    sender.connect(config.addressForCollector);

    const MessageSubscriber = PSKLogger.MessageSubscriberModule.MessageSubscriber;

    new MessageSubscriber(config.addressForSubscribers, ['logs', ''], (topic, message) => {
        sender.send(JSON.stringify({nodeName: NODE_NAME, topic: topic.toString(), message: JSON.parse(message.toString())}));
    });

    console.log('LocalMonitor started');

    // without these the child process won't close when the master is terminated

    process.on('SIGHUP', () => process.exit(128 + 1));
    process.on('SIGINT', () => process.exit(128 + 2));
    process.on('SIGTERM', () => process.exit(128 + 15));
}
