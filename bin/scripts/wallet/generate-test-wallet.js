const path = require("path");
require(path.join(__dirname, "../../../psknode/bundles/csbBoot"));
require(path.join(__dirname, "../../../psknode/bundles/edfsBar"));
require(path.join(__dirname, "../../../psknode/bundles/pskruntime"));

let appFolder;
if (process.argv && process.argv[2]) {
   appFolder = path.resolve(process.argv[2]);
}
else {
    throw Error("App path was not provided!");
}
generateTestWallet("http://localhost:8080",appFolder);

function generateTestWallet(endpoint, webappFolder, callback) {
    const EDFS = require("edfs");
    let edfs = EDFS.attachToEndpoint(endpoint);

    let walletTemplate = edfs.createCSB();

    walletTemplate.addFolder("psknode/bundles", "/", {encrypt: true, depth: 0}, (err) => {
        if (err) {
            throw err;
        }

        let wallet = edfs.createCSB();
        wallet.mount("/", "constitution", walletTemplate.getSeed(), function (err) {
            if (err) {
                throw err;
            }
        });
        wallet.addFolder(webappFolder, "app", {encrypt: true, depth: 0}, function (err) {
            if (err) {
                throw err;
            }

            const seed = wallet.getSeed();
            console.log("Your test wallet seed is:", seed);
        });
    });
}
