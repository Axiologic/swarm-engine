/*
* script to install all PSK deployment deps
*/

const path = require("path");
const deployer = require(path.resolve(path.join(__dirname, "./../../deployer/Deployer.js")));

const baseDeps = [
    {
        "name": "foldermq",
        "src": "https://github.com/PrivateSky/foldermq.git"
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
        "name": "browserfs-dist",
        "src": "https://github.com/PrivateSky/browserfs-dist"
    },
    {
        "name": "pskwebfs",
        "src": "https://github.com/PrivateSky/pskwebfs.git"
    },
    {
        "name": "pskcrypto",
        "src": "https://github.com/PrivateSky/pskcrypto.git"
    },
    {
        "name": "interact",
        "src": "https://github.com/PrivateSky/interact.git"
    },
    {
        "name": "pskdb",
        "src": "https://github.com/PrivateSky/pskdb.git"
    },
    {
        "name": "psk-http-client",
        "src": "https://github.com/PrivateSky/psk-http-clielaunnt.git"
    },
    {
        "name": "psk-browser-utils",
        "src": "https://github.com/PrivateSky/psk-browser-utils.git"
    },
    {
        "name": "yazl",
        "src": "https://github.com/PrivateSky/yazl.git"
    },
    {
        "name": "yauzl",
        "src": "https://github.com/PrivateSky/yauzl.git"
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
        "name": "pskadmin",
        "src": "https://github.com/PrivateSky/pskadmin.git"
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
		"name": "csb-core",
		"src": "https://github.com/PrivateSky/csb-core.git"
	}];

const config = {
    "workDir": ".",
    "dependencies": [
        {
            "name": "signsensus",
            "src": "https://github.com/PrivateSky/signsensus.git"
        },
        {
            "name": "dicontainer",
            "src": "https://github.com/PrivateSky/dicontainer.git"
        },
        {
            "name": "double-check",
            "src": "https://github.com/PrivateSky/double-check.git"
        },
        {
            "name": "whys",
            "src": "https://github.com/PrivateSky/whys.git"
        },
        {
            "name": "swarmutils",
            "src": "https://github.com/PrivateSky/swarmutils.git"
        },
		{
			"name": "psk-combo-utils",
			"src": "https://github.com/PrivateSky/psk-combo-utils.git",
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
        },
        {
            "name": "psk-browser-tests",
            "src": "https://github.com/PrivateSky/psk-browser-tests.git",
            "actions": [
                {
                    "type": "smartClone",
                    "target": "tests"
                }
            ]
        },
        {
            "name": "",
            "src": "npm",
            "actions": ["install"],
            "workDir": "tests/psk-browser-tests"
        },
        {
            "name": "browserify chokidar qr-image",
            "src": "npm",
            "actions": ["install"]
        }
    ]
};

const virtualMQConfig = {
    workDir: '.',
    dependencies: [
        {
            "name": "virtualmq",
            "src": "https://github.com/PrivateSky/virtualmq.git"
        },
        {
            "name": "soundpubsub",
            "src": "https://github.com/PrivateSky/soundpubsub.git"
        }
    ]
};

const pskWalletConfig = {
    workDir: '.',
    dependencies: [
        {
            "name": "pskwallet",
            "src": "https://github.com/PrivateSky/pskwallet.git"
        }
    ]
};

config.dependencies = baseDeps.concat(config.dependencies, pskWalletConfig.dependencies, virtualMQConfig.dependencies);

pskWalletConfig.dependencies = baseDeps.concat(pskWalletConfig.dependencies);


const argv = process.argv;
argv.shift();
argv.shift();

deployer.setTag("[Builder]");

function runDeployer(config, callback = () => {}) {
    deployer.run(config, function (error, result) {
        if (error) {
            console.log("[Builder - Error]", error);
            process.exit(1);
        } else {
            console.log("[Builder - Result]", result);
        }
        callback();
    });
}

const configs = {};


configs['--pskwallet'] = pskWalletConfig;
configs['--virtualmq'] = virtualMQConfig;
configs['--all']       = config;


function handleArguments(index = 0) {
    if (index >= argv.length) {
        return;
    }

    const configForArgument = configs[argv[index]];

    if(configForArgument) {
        console.log("Running build for argument", argv[index]);
        runDeployer(configForArgument, () => handleArguments(index + 1));
    } else {
        throw new Error("Wrong argument found: "+argv[index]);
        handleArguments(index + 1);
    }
}

if (argv.length > 0) {
    handleArguments();
} else {
    console.log("Running build for argument --all");
    runDeployer(config);
}
