const path = require("path");
const argumentsParser = require(path.join(__dirname, './argumentsParserUtil'));

require("../../core/utils/pingpongFork").enableLifeLine();

const config = {
    port: 8080,
    folder: path.join(__dirname, '../../../tmp'),
    sslFolder: path.resolve(__dirname, '../../conf/ssl')
};

argumentsParser.populateConfig(config);

require(path.join(__dirname, '../../bundles/pskruntime.js'));
require(path.join(__dirname, '../../bundles/virtualMQ.js'));
require(path.join(__dirname, '../../bundles/psknode'));
require(path.join(__dirname, '../../bundles/consoleTools'));

const VirtualMQ = require('virtualmq');
const fs = require('fs');

function startServer(config) {
    let sslConfig = undefined;
    if (config.sslFolder) {
        console.log('[VirtualMQ] Using certificates from path', path.resolve(config.sslFolder));

        try {
            sslConfig = {
                cert: fs.readFileSync(path.join(config.sslFolder, 'server.cert')),
                key: fs.readFileSync(path.join(config.sslFolder, 'server.key'))
            };
        } catch (e) {
            console.log('[VirtualMQ] No certificates found, VirtualMQ will start using HTTP');
        }
    }

    const virtualMqConfig = {
        listeningPort: Number.parseInt(config.port),
        rootFolder: path.resolve(config.folder),
        sslConfig: sslConfig
    };

    const virtualMq = VirtualMQ.createVirtualMQ(virtualMqConfig);
}

startServer(config);
