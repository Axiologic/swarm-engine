const fs = require('fs');
const path = require('path');

let confFolder = process.env.PSK_CONF_FOLDER || path.resolve(path.join(__dirname, '../../conf/'));
const seedFileName = 'confSeed';
const vmqPort = process.env.vmq_port || 8080;
const vmqAddress = `http://127.0.0.1:${vmqPort}`;
const identity = "launcherIdentity";

const brickStorageStrategyName = "ConfigBoxStrategy";

if (!confFolder.endsWith('/')) {
    confFolder += '/';
}

const constitutionFolder = path.resolve(path.join(__dirname, '../bundles/'));
const seedFileLocation = `${confFolder}${seedFileName}`;


if (typeof process.env.vmq_zeromq_forward_address === "undefined") {
    process.env.vmq_zeromq_forward_address = "tcp://127.0.0.1:5001";
}
if (typeof process.env.vmq_zeromq_sub_address === "undefined") {
    process.env.vmq_zeromq_sub_address = "tcp://127.0.0.1:5000";
}
if (typeof process.env.vmq_zeromq_pub_address === "undefined") {
    process.env.vmq_zeromq_pub_address = "tcp://127.0.0.1:5001";
}

function getSeed(callback) {
    const existsConfSeedFile = fs.existsSync(seedFileLocation);
    if (existsConfSeedFile) {
        const seed = fs.readFileSync(seedFileLocation, 'utf8');
        callback(undefined, seed);
    } else {
        createConfiguration(callback);
    }
}

let edfs;
function ensureEnvironmentIsReady(edfsURL) {
    const EDFS = require('edfs');

    if (!$$.securityContext) {
        $$.securityContext = require("psk-security-context").createSecurityContext();
    }


     edfs = EDFS.attachToEndpoint(edfsURL);
}

function createBarWithConstitution(constitutionSourceFolder, domainName, callback) {
    const EDFS = require('edfs');
    if (typeof domainName === "function" && typeof callback === "undefined") {
        callback = domainName;
        domainName = "";
    }

    let barHandler = edfs.createBar();

    const finish = function (err) {
        if (err) {
            return callback(err);
        }
        callback(undefined, barHandler.getSeed());
    };

    barHandler.addFolder(constitutionSourceFolder, EDFS.constants.CSB.CONSTITUTION_FOLDER, (err) => {
        if (err) {
            return callback(err);
        }

        if (domainName !== "") {
            barHandler.writeFile(EDFS.constants.CSB.DOMAIN_IDENTITY_FILE, domainName, finish);
        } else {
            finish();
        }
    });
}

function createConfiguration(callback) {
    const dossier = require('dossier');
    ensureEnvironmentIsReady(vmqAddress);
    $$.securityContext.generateIdentity((err) => {
        if (err) throw err;

        createBarWithConstitution(constitutionFolder, "localDomain", (err, constitutionCSBSeed) => {
            if (err) {
                throw err;
            }

            createBarWithConstitution(constitutionFolder, 'launcher', (err, launcherCSBSeed) => {
                if (err) {
                    throw err;
                }

                dossier.load(launcherCSBSeed, identity, (err, launcherCSB) => {
                    if (err) {
                        throw err;
                    }

                    dossier.load(constitutionCSBSeed, identity, (err, domainCSB) => {
                        if (err) {
                            throw err;
                        }

                        launcherCSB.startTransaction("Domain", "add", 'local', "system", '../../', constitutionCSBSeed)
                            .onReturn((err) => {
                                if (err) {
                                    throw err;
                                }

                                const communicationInterfaces = {
                                    system: {
                                        virtualMQ: vmqAddress,
                                        zeroMQ: process.env.vmq_zeromq_sub_address
                                    }
                                };

                                domainCSB.startTransaction('DomainConfigTransaction', 'add', 'local', communicationInterfaces)
                                    .onReturn((err) => {
                                        if (err) {
                                            throw err;
                                        }

                                        fs.writeFileSync(seedFileLocation, launcherCSBSeed, 'utf8');
                                        callback(undefined, launcherCSBSeed);
                                    });
                            });
                    })
                });

            });
        });
    });
}

module.exports = {
    getSeed
};