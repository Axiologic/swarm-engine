const path = require("path");
const argumentsParser = require(path.join(__dirname, './argumentsParserUtil'));
const PORT = process.env.vmq_port || 8080;
require("../../core/utils/pingpongFork").enableLifeLine();

const config = {
    port: PORT,
    folder: path.join(__dirname, '../../../tmp'),
    sslFolder: path.resolve(__dirname, '../../conf/ssl')
};

argumentsParser.populateConfig(config);
//just in case somebody really need it to change the port from command line arg
process.env.vmq_port = config.port;

require(path.join(__dirname, '../../bundles/virtualMQ.js'));
require(path.join(__dirname, '../../bundles/pskruntime.js'));
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

    const listeningPort = Number.parseInt(config.port);
    const rootFolder = path.resolve(config.folder);

    const virtualMq = VirtualMQ.createVirtualMQ(listeningPort, rootFolder, sslConfig, (err) => {
        if(err) {
            console.error(err);
        }
    });
}

startServer(config);
