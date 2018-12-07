const config = {
    port: 8080,
    folder: '../tmp'
};


const path = require("path");
require('../../builds/devel/pskruntime');
require('../../builds/devel/psknode');
require('../../builds/devel/virtualMQ');
const VirtualMQ  = require('virtualmq');

function startServer (config) {
    const virtualMq = VirtualMQ.createVirtualMQ(Number.parseInt(config.port), path.resolve(config.folder));
}

const argv = process.argv;
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
    if(!config[key]) {
        throw new Error(`Invalid argument ${key}`);
    }

    config[key] = value;
}

startServer(config);
