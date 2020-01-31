const fs = require('fs');
const path = require('path');

const confFolder = process.env.PSK_CONF_FOLDER || path.resolve(path.join(__dirname, '../../conf/'));
const seedFileName = 'confSeed';
const vmqPort = process.env.vmq_port || 8080;
const vmqAddress = `http://127.0.0.1:${vmqPort}`;


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

    pskdomain.ensureEnvironmentIsReady(vmqAddress);
    $$.securityContext.generateIdentity((err) => {
        if(err) throw err;

        pskdomain.deployConstitutionFolderCSB(constitutionFolder, "localDomain", (err, csbSeedBuffer) => {
            if(err) {
                throw err;
            }

            const constitutionCSBSeed = csbSeedBuffer.toString();
            console.log("DomainSeed", constitutionCSBSeed);
            pskdomain.createCSB((err, launcherCSB) => {
                if (err) {
                    throw err;
                }

                pskdomain.loadCSB(constitutionCSBSeed, (err, domainCSB) => {
                    if(err) {
                        throw err;
                    }

                    launcherCSB.startTransactionAs("secretAgent", "Domain", "add", 'local', "system", '../../', constitutionCSBSeed)
                        .onCommit((err) => {
                            if (err) {
                                throw err;
                            }

                            const communicationInterfaces = {
                                system: {
                                    virtualMQ: vmqAddress,
                                    zeroMQ: process.env.vmq_zeromq_sub_address
                                }
                            };

                            domainCSB.startTransactionAs('secretAgent', 'DomainConfigTransaction', 'add', 'local', communicationInterfaces)
                                .onCommit((err) => {
                                    if (err) {
                                        throw err;
                                    }


                                    launcherCSB.readFile('/worldStateCache',(err, fileContent) => {
                                        if(err) throw err;
                                        console.log('FILES IN CONFIGBOX', fileContent.toString());
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
}


module.exports = {
    getSeed
};