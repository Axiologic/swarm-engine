const config = {
	port: 8081,
	folder: '../tmp',
	sslFolder: undefined
};


require('../../bundles/pskruntime');
require('../../bundles/psknode');
require('../../bundles/virtualMQ');
require('../../bundles/consoleTools');

const CSBWizard  = require('csb-wizard');
const path = require("path");
const fs = require('fs');


function startServer (config) {
	let sslConfig = undefined;
	if(config.sslFolder) {
		console.log('[CSBWizard] Using certificates from path', path.resolve(config.sslFolder));

		try {
			sslConfig = {
				cert: fs.readFileSync(path.join(config.sslFolder, 'server.cert')),
				key: fs.readFileSync(path.join(config.sslFolder, 'server.key'))
			};
		} catch (e) {
			console.log('[CSBWizard] No certificates found, CSBWizard will start using HTTP');
		}
	}

	const csbWizardConfig = {
		listeningPort: 	Number.parseInt(config.port),
		rootFolder: path.resolve(config.folder),
		sslConfig: sslConfig
	};

	const csbServer = new CSBWizard(csbWizardConfig);
}

const argv = Object.assign([], process.argv);
argv.shift();
argv.shift();

for(let i = 0; i < argv.length; ++i) {
	if(!argv[i].startsWith('--')) {
		throw new Error(`Invalid argument ${argv[i]}`);
	}

	const argument = argv[i].substr(2);

	const argumentPair = argument.split('=');
	if(argumentPair.length > 1) {
		editConfig(argumentPair[0], argumentPair[1]);
	} else {
		if(argv[i + 1].startsWith('--')) {
			throw new Error(`Missing value for argument ${argument}`);
		}

		editConfig(argument, argv[i + 1]);
		i += 1;
	}
}

function editConfig(key, value) {
	if(!config.hasOwnProperty(key)) {
		throw new Error(`Invalid argument ${key}`);
	}

	config[key] = value;
}

startServer(config);
