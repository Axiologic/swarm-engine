const config = {
    addressForPublishers: process.env.PSK_PUBLISH_LOGS_ADDR || 'tcp://127.0.0.1:7000',
    addressForSubscribers: process.env.PSK_SUBSCRIBE_FOR_LOGS_ADDR || 'tcp://127.0.0.1:7001',
    addressToCollector: process.env.PSK_COLLECTOR_ADDR || 'tcp://127.0.0.1:5558'
};

const path = require("path");
const PSKLogger = require(path.join(__dirname, '../../modules/psklogger'));
const cluster = require('cluster');
const {fork} = require('child_process');

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
    fork(path.join(__dirname, './startNodeResourceMonitor'));
    fork(path.join(__dirname, './localLogsCollector'));

} else {
    const NODE_NAME = process.env.NODE_NAME || 'anon';

    const zmq = require('zeromq');
    const sender = zmq.socket('push');
    sender.connect(config.addressToCollector);

    const MessageSubscriber = PSKLogger.MessageSubscriberModule.MessageSubscriber;

    new MessageSubscriber(config.addressForSubscribers, ['logs', ''], (topic, message) => {
        sender.send(JSON.stringify({nodeName: NODE_NAME, topic: topic.toString(), envelopedMessage: JSON.parse(message.toString())}));
    });

    console.log('LocalMonitor started');

    // without these the child process won't close when the master is terminated

    process.on('SIGHUP', () => process.exit(128 + 1));
    process.on('SIGINT', () => process.exit(128 + 2));
    process.on('SIGTERM', () => process.exit(128 + 15));
}
