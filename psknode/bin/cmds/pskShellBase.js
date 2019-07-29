const PSK_SHELL_CONFIG_DIR = "PSK_SHELL_CONFIG_DIR";
const path = require("path");
const os = require("os");
const fs = require("fs");

function getTmpDir(){
    return path.join(require("os").tmpdir(), PSK_SHELL_CONFIG_DIR);
}

function getFilePathForEnvVariable(name){
    return path.join(getTmpDir(), `PSK_SHELL_ENV_${name}`);
}

function setEnvVariable(name, value){

    const tmpDir = getTmpDir();
    const packageJSONFilePath = getFilePathForEnvVariable(name);

    fs.mkdirSync(tmpDir, {recursive: true});

    fs.writeFileSync(packageJSONFilePath, JSON.stringify(value));
}

function getEnvVariable(name){
    const filePath = getFilePathForEnvVariable(name);
    let value;
    try{
        value = fs.readFileSync(filePath);
        value = JSON.parse(value);
    }catch(err){
        value = undefined;
    }
    return value;
}

module.exports = {
    getTmpDir: getTmpDir,
    getFilePathForEnvVariable: getFilePathForEnvVariable,
    setEnvVariable: setEnvVariable,
    getEnvVariable: getEnvVariable
}