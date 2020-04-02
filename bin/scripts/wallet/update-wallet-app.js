const path = require("path");
let updater = require("updater");
let walletApp;
let loaderApp;
let seed;
if (process.argv && process.argv[2]) {
    loaderApp = path.resolve(process.argv[2]);
}

if(process.argv && process.argv[3]){
    walletApp = path.resolve(process.argv[3])
}

if(process.argv && process.argv[4]){
    seed = process.argv[4]
}

else {
    throw Error("Invalid arguments. Usage: \n npm run update-wallet-app </path/to/loader-app>  </path/to/wallet-app> <seed>");
}

let walletAppSrcPath = path.resolve(walletApp,"src");
let walletAppReleasePath = path.resolve(walletApp,"release");

const config = {
    workDir: '.',
    dependencies: [
        {
            "name": "privatesky",
            "src": "",
            "actions":[
                {
                    "type":"executeAsync",
                    "cmd": "npm run build -- --prod"
                },
                {
                    "type": "executeAsync",
                    "cmd": `node ./bin/scripts/copyBrowserBootScripts.js ${loaderApp}`
                },
                {
                    "type":"executeAsync",
                    "cmd": `node ./bin/scripts/copyBrowserBootScripts.js ${walletAppSrcPath} scripts`
                },
                {
                    "type":"executeAsync",
                    "cmd": `cd ${walletApp} && npm run build`
                },
                {
                    "type": "executeAsync",
                    "cmd": `node ./psknode/bundles/walletBoot.js set app ${seed} ${walletAppReleasePath}`
                }

            ]
        },
    ]
};

updater.setTag("[Update wallet]");
updater.run(config, function(err){
    if(err){
        throw err;
    }
    console.log("Finished updating privatesky")
});



