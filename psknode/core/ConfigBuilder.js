const fs = require('fs');
const path = require('path');

let confFolder = process.env.PSK_CONF_FOLDER || path.resolve(path.join(__dirname, '../../conf/'));
const seedFileName = 'confSeed';
const vmqPort = process.env.vmq_port || 8080;
const vmqAddress = `http://127.0.0.1:${vmqPort}`;
const identity = "launcherIdentity";
const defaultDomainName = "demo";

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

const communicationInterfaces = {
	system: {
		virtualMQ: vmqAddress,
		zeroMQ: process.env.vmq_zeromq_sub_address
	}
};

const dossier = require('dossier');
const EDFS = require('edfs');
let edfs;

function ensureEnvironmentIsReady(edfsURL) {

	if (!$$.securityContext) {
		$$.securityContext = require("psk-security-context").createSecurityContext();
	}

	edfs = EDFS.attachToEndpoint(edfsURL);
}

function createOrUpdateConfiguration(fileConfiguration, callback) {
	ensureEnvironmentIsReady(vmqAddress);

	$$.securityContext.generateIdentity((err) => {
		if (err) throw err;
		console.log("FileConfiguration", fileConfiguration);
		if (fileConfiguration) {
			let constitutionBar = edfs.loadBar(fileConfiguration.constitutionSeed);
			console.log("bar loaded");
			constitutionBar.deleteFile("/", (err) => {
				if (err) {
					throw err;
				}
				constitutionBar.addFolder(constitutionFolder, "/", {encrypt: true}, (err) => {
					callback(err, fileConfiguration.launcherSeed);
				});
			});
		} else {
			let fileConfiguration = {};
			let constitutionBar = edfs.createBar();
			console.log("Bar created")
			constitutionBar.addFolder(constitutionFolder, "/", {encrypt: true}, (err) => {
				if (err) {
					throw err;
				}
				fileConfiguration.constitutionSeed = constitutionBar.getSeed();
				buildDossierInfrastructure(fileConfiguration);
			});
		}

		function buildDossierInfrastructure(fileConfiguration) {
			let launcherConfigDossier = edfs.createCSB();
			launcherConfigDossier.writeFile(EDFS.constants.CSB.DOMAIN_IDENTITY_FILE, " ", 0, (err) => {
				fileConfiguration.launcherSeed = launcherConfigDossier.getSeed();
				console.log("finish writing to launcher")
				if (err) {
					throw err;
				}

				let domainConfigDossier = edfs.createCSB();
				domainConfigDossier.writeFile(EDFS.constants.CSB.DOMAIN_IDENTITY_FILE, defaultDomainName, 0, (err) => {
					fileConfiguration.domainSeed = domainConfigDossier.getSeed();
					console.log("File Configuration completed", fileConfiguration);


					launcherConfigDossier.mount("/", EDFS.constants.CSB.CONSTITUTION_FOLDER, fileConfiguration.constitutionSeed, function (err) {
						console.log("finish mounting to launcher")
						if (err) {
							throw err;
						}

						domainConfigDossier.mount("/", EDFS.constants.CSB.CONSTITUTION_FOLDER, fileConfiguration.constitutionSeed, function (err) {
							console.log("finish mounting to domain")
							if (err) {
								throw err;
							}

							domainConfigDossier.readFile(EDFS.constants.CSB.MANIFEST_FILE, function (err, content) {
								console.log("Getting", err, content.toString());

								console.log("finish writing to domain");
								if (err) {
									throw err;
								}
							});
console.log("trying to boot dossier with seed", fileConfiguration.launcherSeed);
							dossier.load(fileConfiguration.launcherSeed, identity, (err, launcherCSB) => {
								console.log("finish booting dossier to launcher")
								if (err) {
									throw err;
								}

								launcherCSB.startTransaction("Domain", "getDomainDetails", defaultDomainName)
									.onReturn((err, domainDetails) => {
										if (err) {
											//means no demo domain found... let's build it
											dossier.load(fileConfiguration.domainSeed, identity, (err, domainCSB) => {
												if (err) {
													throw err;
												}

												launcherCSB.startTransaction("Domain", "add", defaultDomainName, "system", '../../', fileConfiguration.domainSeed)
													.onReturn((err) => {
														if (err) {
															throw err;
														}

														domainCSB.startTransaction('DomainConfigTransaction', 'add', defaultDomainName, communicationInterfaces)
															.onReturn((err) => {
																if (err) {
																	throw err;
																}

																fs.writeFileSync(seedFileLocation, JSON.stringify(fileConfiguration), 'utf8');
																callback(undefined, fileConfiguration.launcherSeed);
															});
													});
											});
										}

									});
							});
						});
					});

				});
			});

		}

	});
}

function getSeed(callback) {
	let fileConfiguration;
	try {
		fileConfiguration = fs.readFileSync(seedFileLocation, 'utf8');
		fileConfiguration = JSON.parse(fileConfiguration);
	} catch (err) {
		// no need to treat here errors ... i think...
	} finally {
		createOrUpdateConfiguration(fileConfiguration, callback);
	}
}

module.exports = {
	getSeed
};