const fs = require('fs');
const path = require('path');

function isPathToOwnAgentSpace(pathToTest) {
    if (!pathToTest || pathToTest === '') {
        return false;
    }

    pathToTest = path.normalize(pathToTest);
    pathToTest = path.resolve(pathToTest);

    return pathToTest.startsWith(process.cwd());
}

function isPathToOwnAgentMqOutbound(pathToTest) {
    if (!pathToTest || pathToTest === '') {
        return false;
    }

    pathToTest = path.normalize(pathToTest);
    pathToTest = path.resolve(pathToTest);

    return pathToTest.startsWith(path.join(process.cwd(), 'mq', 'outbound'));
}

function isPathToOwnAgentMqInbound(pathToTest) {
    if (!pathToTest || pathToTest === '') {
        return false;
    }

    pathToTest = path.normalize(pathToTest);
    pathToTest = path.resolve(pathToTest);

    return pathToTest.startsWith(path.join(process.cwd(), 'mq', 'inbound'));
}

function isPathToOwnAgentMqFolders(originPath, destinationPath) {
    if (!originPath || !destinationPath || originPath === '' || destinationPath === '') {
        return false;
    }

    originPath = path.normalize(originPath);
    originPath = path.resolve(originPath);

    destinationPath = path.normalize(destinationPath);
    destinationPath = path.resolve(destinationPath);

    const inboundPath  = path.join(process.cwd(), 'mq', 'inbound', path.sep);
    const outboundPath = path.join(process.cwd(), 'mq', 'outbound', path.sep);

    const isInboundPath  = (originPath.startsWith(inboundPath) && destinationPath.startsWith(inboundPath));
    const isOutboundPath = (originPath.startsWith(outboundPath) && destinationPath.startsWith(outboundPath));

    return isInboundPath || isOutboundPath;
}

const fsProxyHandler = {
    get(target, prop) {
        const self = this;

        return function (...params) {
            if (self.allowedMethods.includes(prop)) {
                for (const validatorDefinition of self.customValidatorsDefinition[prop]) {

                    const paramsToPass = [];
                    for (const position of validatorDefinition.argumentsPositionsToValidate) {
                        paramsToPass.push(params[position])
                    }

                    if (!validatorDefinition.validator(...paramsToPass)) {
                        throw new Error(`sandbox tried running method ${prop} with illegal arguments ${paramsToPass}`);
                    }
                }
                return target[prop](...params);
            } else {
                console.warn('sandbox tried accessing unallowed or inexistent property', prop);
            }
        }
    }
};

Object.defineProperty(fsProxyHandler, 'customValidatorsDefinition', {
    value: Object.freeze({
        mkdir: [{argumentsPositionsToValidate: [0], validator: isPathToOwnAgentSpace}],
        exists: [{argumentsPositionsToValidate: [0], validator: isPathToOwnAgentSpace}],
        existsSync: [{argumentsPositionsToValidate: [0], validator: isPathToOwnAgentSpace}],
        unlink: [{argumentsPositionsToValidate: [0], validator: isPathToOwnAgentSpace}],
        readFile: [{argumentsPositionsToValidate: [0], validator: isPathToOwnAgentSpace}],
        readdir: [{argumentsPositionsToValidate: [0], validator: isPathToOwnAgentSpace}],
        readdirSync: [{argumentsPositionsToValidate: [0], validator: isPathToOwnAgentSpace}],
        writeFile: [{argumentsPositionsToValidate: [0], validator: isPathToOwnAgentMqOutbound}],
        writeFileSync: [{argumentsPositionsToValidate: [0], validator: isPathToOwnAgentMqOutbound}],
        rename: [{argumentsPositionsToValidate: [0, 1], validator: isPathToOwnAgentMqFolders}],
        watch: [{argumentsPositionsToValidate: [0], validator: isPathToOwnAgentMqInbound}]
    })
});


Object.defineProperty(fsProxyHandler, 'allowedMethods', {
    value: Object.freeze(Object.keys(fsProxyHandler.customValidatorsDefinition))
});

const fsProxy = new Proxy(fs, fsProxyHandler);
const VM = require("../modules/vm2").NodeVM;

module.exports = {
    createVM: function(allowedBuiltinModules) {
        const config = {
            require: {
                external: true,
                builtin: ['path', 'util', 'crypto', 'child_process'].concat(allowedBuiltinModules),
                root: process.cwd(), // needs further tests
                context: 'sandbox',
                mock: {
                    fs: fsProxy
                }
            },
            sandbox: {
                process: {
                    env: {}, // needed for RUN_WITH_WHYS
                    cwd: function () {
                        return process.cwd()
                    },
                    chdir: process.chdir
                }
            },
            wrapper: 'none'
        };

        return new VM(config);
    }
};