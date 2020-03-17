/*
* script to install all PSK deployment deps
*/

const path = require("path");
const updater = require("updater");

const baseDeps = [
    {
        "name": "swarm-engine",
        "src": "https://github.com/PrivateSky/swarm-engine.git"
    },
    {
        "name": "swarmutils",
        "src": "https://github.com/PrivateSky/swarmutils.git"
    },
    {
        "name": "soundpubsub",
        "src": "https://github.com/PrivateSky/soundpubsub.git"
    },
    {
        "name": "callflow",
        "src": "https://github.com/PrivateSky/callflow.git"
    },
    {
        "name": "choreo",
        "src": "https://github.com/PrivateSky/choreo.git"
    },
    {
        "name": "browser-server",
        "src": "https://github.com/PrivateSky/browser-server"
    },
    {
        "name": "pskcrypto",
        "src": "https://github.com/PrivateSky/pskcrypto.git"
    },
    {
        "name": "pskdb",
        "src": "https://github.com/PrivateSky/pskdb.git"
    },
    {
        "name": "psk-http-client",
        "src": "https://github.com/PrivateSky/psk-http-client.git"
    },
    {
        "name": "ssapp-middleware",
        "src": "https://github.com/PrivateSky/ssapp-middleware.git"
    },
    {
        "name": "buffer-crc32",
        "src": "https://github.com/PrivateSky/buffer-crc32.git"
    },
    {
        "name": "node-fd-slicer",
        "src": "https://github.com/PrivateSky/node-fd-slicer.git"
    },
    {
        "name": "csb-wizard",
        "src": "https://github.com/PrivateSky/csb-wizard.git"
    },
	{
		"name": "pskbuffer",
		"src": "https://github.com/PrivateSky/pskbuffer.git"
	},
    {
        "name": "edfs-middleware",
        "src": "https://github.com/PrivateSky/edfs-middleware.git"
    },
    {
        "name": "blockchain",
        "src": "https://github.com/PrivateSky/blockchain.git"
    },
    {
        "name": "bar",
        "src": "https://github.com/PrivateSky/bar.git"
    },
    {
        "name": "edfs-brick-storage",
        "src": "https://github.com/PrivateSky/edfs-brick-storage.git"
    },
    {
        "name": "edfs",
        "src": "https://github.com/PrivateSky/edfs.git"
    },
    {
        "name": "dossier",
        "src": "https://github.com/PrivateSky/dossier.git"
    },
    {
        "name": "psklogger",
        "src": "https://github.com/PrivateSky/psklogger.git"
    },
    {
        "name": "pskisolates",
        "src": "https://github.com/PrivateSky/pskisolates.git"
    },
    {
        "name": "pskbuffer",
        "src": "https://github.com/PrivateSky/pskbuffer.git"
    },
    {
        "name": "zmq_adapter",
        "src": "https://github.com/PrivateSky/zmq_adapter.git"
    },
    {
        "name": "psk-security-context",
        "src": "https://github.com/PrivateSky/psk-security-context.git"
    },
    {
        "name": "adler32",
        "src": "https://github.com/PrivateSky/adler.git"
    },
    {
        "name": "syndicate",
        "src": "https://github.com/PrivateSky/syndicate.git"
    },
    {
        "name": "bar-fs-adapter",
        "src": "https://github.com/PrivateSky/bar-fs-adapter.git"
    },
    {
        "name": "overwrite-require",
        "src": "https://github.com/PrivateSky/overwrite-require.git"
    },
    {
        "name": "psk-bindable-model",
        "src": "https://github.com/PrivateSky/psk-bindable-model.git"
    },
    {
        "name": "pskisolates",
        "src": "https://github.com/PrivateSky/pskisolates.git"
    },
    {
        "name": "pskwallet",
        "src": "https://github.com/PrivateSky/pskwallet.git"
    }

];


const config = {
    "workDir": ".",
    "dependencies": [
        {
            "name": "double-check",
            "src": "https://github.com/PrivateSky/double-check.git"
        },
        {
            "name": "whys",
            "src": "https://github.com/PrivateSky/whys.git"
        },
        {
            "name": "psk-integration-testing",
            "src": "https://github.com/PrivateSky/psk-integration-testing.git",
            "actions": [
                {
                    "type": "smartClone",
                    "target": "tests"
                }
            ]
        },
        {
            "name": "psk-smoke-testing",
            "src": "https://github.com/PrivateSky/psk-smoke-testing.git",
            "actions": [
                {
                    "type": "smartClone",
                    "target": "tests"
                }
            ]
        },
        {
            "name": "psk-unit-testing",
            "src": "https://github.com/PrivateSky/psk-unit-testing.git",
            "actions": [
                {
                    "type": "smartClone",
                    "target": "tests"
                }
            ]
        }
    ]
};

const virtualMQConfig = {
    workDir: '.',
    dependencies: [
        {
            "name": "virtualmq",
            "src": "https://github.com/PrivateSky/virtualmq.git"
        }
    ]
};

config.dependencies = baseDeps.concat(config.dependencies, virtualMQConfig.dependencies);

const argv = process.argv;
argv.shift();
argv.shift();

updater.setTag("[Updater]");

function runUpdater(config, callback = () => {}) {
    updater.run(config, function (error, result) {
        if (error) {
            console.log("[Updater - Error]", error);
            process.exit(1);
        } else {
            console.log("[Updater - Result]", result);
        }
        callback();
    });
}

const configs = {};

configs['--virtualmq'] = virtualMQConfig;
configs['--all']       = config;


function handleArguments(index = 0) {
    if (index >= argv.length) {
        return;
    }

    const configForArgument = configs[argv[index]];

    if(configForArgument) {
        console.log("Running build for argument", argv[index]);
        runUpdater(configForArgument, () => handleArguments(index + 1));
    } else {
        throw new Error("Wrong argument found: "+argv[index]);
        handleArguments(index + 1);
    }
}

if (argv.length > 0) {
    handleArguments();
} else {
    console.log("Running build for argument --all");
    runUpdater(config);
}
