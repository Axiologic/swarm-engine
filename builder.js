var config = {
    "workDir": ".",
    "dependencies": [
        {
            "name": "soundpubsub",
            "src": "https://github.com/PrivateSky/soundpubsub.git"
        },
        {
            "name": "callflow",
            "src": "https://github.com/PrivateSky/callflow.git"
        },
        {
            "name": "signsensus",
            "src": "https://github.com/PrivateSky/signsensus.git"
        },
        {
            "name": "dicontainer",
            "src": "https://github.com/PrivateSky/dicontainer.git"
        },
        {
            "name": "pskcrypto",
            "src": "https://github.com/PrivateSky/pskcrypto.git"
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
            "name": "psk-integration-testing",
            "src": "https://github.com/PrivateSky/psk-integration-testing.git",
            "actions": [
                {
                    "type": "remove",
                    "target": "tests/psk-integration-testing"
                },
                {
                    "type": "clone",
                    "target": "tests"
                },
                {
                    "type": "copy",
                    "src" : "tests/psk-integration-testing/core/testSwarms",
                    "target": "libraries/testSwarms",
                    "options": {
                        "overwrite" : true
                    }
                }
            ]
        },
        {
            "name": "psk-smoke-testing",
            "src": "https://github.com/PrivateSky/psk-smoke-testing.git",
            "actions": [
                {
                    "type": "remove",
                    "target": "tests/psk-smoke-testing"
                },
                {
                    "type": "clone",
                    "target": "tests"
                }
            ]
        },
        {
            "name": "psk-unit-testing",
            "src": "https://github.com/PrivateSky/psk-unit-testing.git",
            "actions": [
                {
                    "type": "remove",
                    "target": "tests/psk-unit-testing"
                },
                {
                    "type": "clone",
                    "target": "tests"
                }
            ]
        },
        {
            "name": "combos",
            "src": "https://github.com/jfairbank/combos.git",
            "actions": [
                {
                    "type": "remove",
                    "target": "modules/combos"
                },
                {
                    "type": "clone",
                    "options": {
                        "depth": "1",
                        "branch": "master"
                    },
                    "target": "modules"
                },
                {
                    "type": "move",
                    "src" : "modules/combos/src",
                    "target": "modules/combos/lib",
                    "options": {
                        "overwrite" : true
                    }
                }
            ]
        },
        {
            "name": "virtualmq",
            "src": "https://github.com/PrivateSky/virtualmq.git"
        },
		{
			"name": "psk-http-client",
			"src": "https://github.com/PrivateSky/psk-http-client.git"
		},
        {
			"name": "vm2",
			"src": "https://github.com/patriksimek/vm2.git"
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
			"src": "https://github.com/patriksimek/buffer-crc32.git"
		},
		{
			"name": "fd-slicer",
			"src": "https://github.com/patriksimek/node-fd-slicer.git"
		}

    ]
}

//require("./engine/core").enableTesting();
var deployer = require("./deployer/Deployer.js");

deployer.run(config, function (error, result) {
    if(error){
        console.log("[Deployer - Error]", error);
    }else{
        console.log("[Deployer - Result]", result);
    }
});
