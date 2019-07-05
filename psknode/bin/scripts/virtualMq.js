const path = require("path");

const config = {
    port: 8080,
    folder: '../tmp',
    sslFolder: path.resolve(__dirname, '../../conf/ssl')
};



require('../../../builds/devel/pskruntime');
require('../../../builds/devel/psknode');
require('../../../builds/devel/virtualMQ');
const VirtualMQ = require('virtualmq').VirtualMQ;
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

    const virtualMq = new VirtualMQ(virtualMqConfig);
}

const argv = Object.assign([], process.argv);
argv.shift();
argv.shift();

for(let i = 0; i < argv.length; ++i) {
    if(!argv[i].startsWith('--')) {
        throw new Error(`Invalid argument ${argv[i]}`);
    }

    const argument = argv[i].substr(2);

    const argumentPair = argument.split('=');
    if(argumentPair.length > 1) {
        editConfig(argumentPair[0], argumentPair[1]);
    } else {
        if(argv[i + 1].startsWith('--')) {
            throw new Error(`Missing value for argument ${argument}`);
        }

        editConfig(argument, argv[i + 1]);
        i += 1;
    }
}

function editConfig(key, value) {
    if(!config.hasOwnProperty(key)) {
        throw new Error(`Invalid argument ${key}`);
    }

    config[key] = value;
}

startServer(config);
