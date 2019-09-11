const os = require('os');
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const argumentsParser = require('./argumentsParserUtil');

const config = {
    unlink: false
};

argumentsParser.populateConfig(config);

const platform = os.platform();
const privateSkyRoot = path.resolve(path.join(__dirname, '../../../'));
const packageJSONPath = path.join(privateSkyRoot, 'package.json');
const packageJSON = require(packageJSONPath);
const bin = packageJSON['bin'];

if (platform === 'linux') {
    try {
        linkOnLinux();
    } catch (err) {
        if (err.code === 'EACCES') {
            err.message = "You don't have permissions writing to /usr/local/bin, try running with sudo";
        }

        throw err;
    }
} else {
    if(config.unlink) {
        childProcess.execSync('npm unlink', {stdio: "inherit"});
    } else {
        childProcess.execSync('npm link', {stdio: "inherit"});
    }
}

function linkOnLinux() {
    const destinationBasePath = '/usr/local/bin';

    Object.entries(bin).forEach(([scriptName, scriptPath]) => {
        const sourcePath = path.join(privateSkyRoot, scriptPath);
        const destinationPath = path.join(destinationBasePath, scriptName);
        if(config.unlink) {
            if(fs.existsSync(destinationPath)) {
                fs.unlinkSync(destinationPath)
            }
        } else {
            fs.symlinkSync(sourcePath, destinationPath);
        }
    });
}
