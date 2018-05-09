var config = {
    "workDir": ".",
    "dependencies": [
        {
            "name": "signsensus",
            "src": "https://github.com/PrivateSky/signsensus.git",
            "actions": [
                {
                    "type": "remove",
                    "target": "modules/signsensus"
                },
                {
                    "type": "clone",
                    "options": {
                        "depth": "1",
                        "branch": "master"
                    },
                    "target": "modules"
                }
            ]
        },
        {
            "name": "dicontainer",
            "src": "https://github.com/PrivateSky/dicontainer.git",
            "actions": [
                {
                    "type": "remove",
                    "target": "modules/dicontainer"
                },
                {
                    "type": "clone",
                    "options": {
                        "depth": "1",
                        "branch": "master"
                    },
                    "target": "modules"
                }
            ]
        },
        {
            "name": "pskcrypto",
            "src": "https://github.com/PrivateSky/pskcrypto.git",
            "actions": [
                {
                    "type": "remove",
                    "target": "modules/pskcrypto"
                },
                {
                    "type": "clone",
                    "options": {
                        "depth": "1",
                        "branch": "master"
                    },
                    "target": "modules"
                }
            ]
        },
        {
            "name": "double-check",
            "src": "https://github.com/PrivateSky/double-check.git",
            "actions": [
                {
                    "type": "remove",
                    "target": "node_modules/double-check"
                },
                {
                    "type": "clone",
                    "options": {
                        "depth": "1",
                        "branch": "master"
                    },
                    "target": "node_modules"
                }
            ]
        },
        {
            "name": "combos",
            "src": "https://github.com/jfairbank/combos.git",
            "actions": [
                {
                    "type": "remove",
                    "target": "node_modules/combos"
                },
                {
                    "type": "clone",
                    "options": {
                        "depth": "1",
                        "branch": "master"
                    },
                    "target": "node_modules"
                }
            ]
        },
        {
            "name": "whys",
            "src": "https://github.com/PrivateSky/whys.git",
            "actions": [
                {
                    "type": "remove",
                    "target": "node_modules/whys"
                },
                {
                    "type": "clone",
                    "options": {
                        "depth": "1",
                        "branch": "master"
                    },
                    "target": "node_modules"
                }
            ]
        }
    ]
}

require("./engine/core").enableTesting();
var deployer = $$.loadLibrary("deployer", "./libraries/deployer");

$$.callflow.start("deployer.Deployer").run(config, function (error, result) {
    if(error){
        console.log("[Deployer - Error]", error);
    }else{
        console.log("[Deployer - Result]", result);
    }
});
