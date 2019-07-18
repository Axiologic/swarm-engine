/*
 * script to prepare the release of PrivateSky
 */

const path = require("path");
const deployer = require(path.resolve(path.join(__dirname, "./../../deployer/Deployer.js")));

const PSK_RELEASE_REPO_NAME = "pskruntime"

const config = {
    workingDir:".",
    dependencies: [
        {
            "name": PSK_RELEASE_REPO_NAME,
            "src": `https://github.com/PrivateSky/${PSK_RELEASE_REPO_NAME}.git`,
            "actions": [
                {
                    "type": "smartClone",
                    "target": ".."
                }
            ]
        },
        {
            "name": "privatesky",
            "src": `https://github.com/PrivateSky/privatesky.git`,
            "actions": [
                {
                    "type": "remove",
                    "target": "./psknode/builds"
                },
                {
                    "type": "copy",
                    "src": "./psknode",
                    "target": `../${PSK_RELEASE_REPO_NAME}/psknode`,
                    "options":{
                        "overwrite": true
                    }
                }
            ]
        }
    ]};

/*
 {
 "type": "copy",
 "src": "tests/psk-integration-testing/core/testSwarms",
 "target": "libraries/testSwarms",
 "options": {
 "overwrite": true
 }
 }

*/

deployer.run(config, function (error, result) {
    if (error) {
        console.log("[Prepare Release - Error]", error);
        process.exit(1);
    } else {
        console.log("[Prepare Release - Result]", result);
    }
});

