//command line script
//the first argument is a path to a configuration folder
//the second argument is a path to a temporary folder
const path = require('path');

require("./utils/pingpongFork").enableLifeLine(1000);

require(path.join(__dirname, '../bundles/launcherBoot.js'));
require(path.join(__dirname, "../bundles/edfsBar.js"));


const fs = require('fs');
const beesHealer = require('swarmutils').beesHealer;

// require("callflow");

let tmpDir = path.join(__dirname, "../../tmp");
let confDir = path.resolve(path.join(__dirname, "../../conf"));

if (process.argv.length >= 3) {
    confDir = path.resolve(process.argv[2]);
}

if (process.argv.length >= 4) {
    tmpDir = path.resolve(process.argv[3]);
}

if (!process.env.PRIVATESKY_TMP) {
    process.env.PRIVATESKY_TMP = tmpDir;
}

const basePath = tmpDir;
fs.mkdirSync(basePath, {recursive: true});

const codeFolder = path.normalize(__dirname + "/../");

if (!process.env.PRIVATESKY_ROOT_FOLDER) {
    process.env.PRIVATESKY_ROOT_FOLDER = codeFolder;
}


//TODO: cum ar fi mai bine oare sa tratam cazul in care nu se gaseste configuratia nodului PSK????
if (!fs.existsSync(confDir)) {
    console.log(`\n[::] Could not find conf <${confDir}> directory!\n`);
}

process.env.PSK_CONF_FOLDER = confDir;
if(!process.env.PSK_CONF_FOLDER.endsWith('/')) { process.env.PSK_CONF_FOLDER += '/'; }
const ConfigBox = require('./ConfigBox');
loadConfigThenLaunch();

/************************ HELPER METHODS ************************/

function loadConfigThenLaunch() {
    ConfigBox.getSeed((err, seed) => {
       if(err) {
           throw err;
       }

        loadConfigCSB(seed);
    });
}

function loadConfigCSB(seed) {
    const pskdomain = require('pskdomain');
    pskdomain.loadCSB(seed, (err, csb) => {
        if (err) {
            throw err;
        }

        launch(csb);
    });
}

function launch(blockchain) {
    const domains = {};

    let domainReferences = blockchain.loadAssets("DomainReference");
    domainReferences.forEach(domainReference => {
        launchDomain(domainReference.alias, domainReference);
    });


    if (domains.length === 0) {
        console.log(`\n[::] No domains were deployed.\n`);
    }

    function launchDomain(name, configuration) {
        if (!domains.hasOwnProperty(name)) {
            const env = {config: JSON.parse(JSON.stringify(beesHealer.asJSON(configuration).publicVars))};
            const child_env = JSON.parse(JSON.stringify(process.env));

            child_env.PRIVATESKY_TMP = process.env.PRIVATESKY_TMP;
            child_env.PRIVATESKY_ROOT_FOLDER = process.env.PRIVATESKY_ROOT_FOLDER;
            child_env.PSK_DOMAIN_SEED = env.config.constitution;
            child_env.config = JSON.stringify({
                workspace: env.config.workspace
            });

            Object.keys(process.env).forEach(envVar => {
                if (envVar && envVar.startsWith && envVar.startsWith('PSK')) {
                    child_env[envVar] = process.env[envVar];
                }
            });

            const child = require("./utils/pingpongFork").fork(path.join(__dirname, '../bundles/domainBoot.js'), [name], {
                cwd: __dirname,
                env: child_env
            });

            child.on('exit', (code, signal) => {
                setTimeout(() => {
                    console.log(`DomainSandbox [${name}] got an error code ${code}. Restarting...`);
                    delete domains[name];
                    $$.event('status.domains.restart', {name: name});
                    launchDomain(name, configuration);
                }, 100);
            });

            domains[name] = child;
        } else {
            console.log('Trying to start a sandbox for a domain that already has a sandbox');
        }
    }
}
