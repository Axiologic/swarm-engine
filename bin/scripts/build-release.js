/*
 * script to prepare the release of PrivateSky
 */

const path = require("path");
const deployer = require(path.resolve(path.join(__dirname, "./../../deployer/Deployer.js")));
const TAG = "[Prepare Release]";
deployer.setTag(TAG);

const PSK_RELEASE_REPO_NAME = "pskruntime";

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
                    "target": `../${PSK_RELEASE_REPO_NAME}/psknode`
                },
                {
                    "type": "copy",
                    "src": "./psknode",
                    "target": `../${PSK_RELEASE_REPO_NAME}/psknode`,
                    "options":{
                        "overwrite": true
                    }
                },
                {
                    "type": "copy",
                    "src": "./conf",
                    "target": `../${PSK_RELEASE_REPO_NAME}/conf`,
                    "options":{
                        "overwrite": true
                    }
                }
            ]
        }
    ]};

console.log("");
deployer.run(config, function (error, result) {
    if (error) {
        console.log(TAG, "Error", error);
        process.exit(1);
    } else {
        console.log(TAG, result);
    }
});

