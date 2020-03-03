const fs = require('fs');
const path = require('path');

let confFolder = process.env.PSK_CONF_FOLDER || path.resolve(path.join(__dirname, '../../conf/'));
const seedFileName = 'confSeed';
const vmqPort = process.env.vmq_port || 8080;
const vmqAddress = `http://127.0.0.1:${vmqPort}`;
const identity = "launcherIdentity";

if(!confFolder.endsWith('/')) {
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
        createCSB(callback);
    }

}

function createCSB(callback) {
    const pskdomain = require('pskdomain');
    const dossier = require('dossier');
    pskdomain.ensureEnvironmentIsReady(vmqAddress);
    $$.securityContext.generateIdentity((err) => {
        if(err) throw err;

        pskdomain.deployConstitutionFolderCSB(constitutionFolder, "localDomain", (err, csbSeedBuffer) => {
            if(err) {
                throw err;
            }

            const constitutionCSBSeed = csbSeedBuffer.toString();
            pskdomain.deployConstitutionFolderCSB(constitutionFolder, 'launcher', (err, launcherCSBSeed) => {
                if (err) {
                    throw err;
                }

                dossier.load(launcherCSBSeed, identity, (err, launcherCSB) => {
                   if(err) {
                       throw err;
                   }

                    dossier.load(constitutionCSBSeed, identity, (err, domainCSB) => {
                        if(err) {
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

                                        launcherCSB.listFiles('',(err, fileContent) => {
                                            if(err) throw err;
                                            const seed = launcherCSB.getSeed();

                                            fs.writeFileSync(seedFileLocation, seed, 'utf8');

                                            callback(undefined, seed);
                                        })

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