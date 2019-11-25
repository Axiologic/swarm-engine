const AgentStrategies = require('./AgentStrategies');
const os = require('os');
const util = require('util');

function AgentConfigStorage() {
    this.constitutions = [];
    this.workingDir = '.';
    this.workerStrategy = AgentStrategies.THREADS;
    this.maximumNumberOfWorkers = os.cpus().length;
}

/** @constructor */
function AgentConfig() {
    const storage = new AgentConfigStorage();

    return {
        get constitutions() {
            return storage.constitutions;
        },
        set constitutions(value) {
            if(!Array.isArray(value)) {
                throw new TypeError('constitutions is expected to be an array, tried changing it to ' + typeof value);
            }

            storage.constitutions = value;
        },

        get workingDir() {
            return storage.workingDir;
        },
        set workingDir(value) {
            // check if file is url
            storage.workingDir = value;
        },

        get workerStrategy() {
            return storage.workerStrategy
        },
        set workerStrategy(value) {
            if(!Object.values(AgentStrategies).includes(value)) {
                throw new TypeError(`Value ${value} not allowed for workerStrategy attribute`);
            }

            return storage.workerStrategy;
        },

        get maximumNumberOfWorkers() {
            return storage.maximumNumberOfWorkers;
        },
        set maximumNumberOfWorkers(value) {
            if(!Number.isFinite(value)) {
                throw new TypeError(`Attribute maximumNumberOfWorkers should be a finite number, got ${typeof value}`);
            }

            if(value <= 0) {
                throw new RangeError(`Attribute maximumNumberOfWorkers should have a value bigger than 0, got ${value}`);
            }

            storage.maximumNumberOfWorkers = value;
        },

        toJSON: function () {
            return JSON.stringify(storage);
        },
        [Symbol.toStringTag]: function() {
            return storage.toString()
        },
        [util.inspect.custom]: function() {
            return util.inspect(storage, {colors: true});
        }
    }
}

/** @returns {AgentConfig} */
AgentConfig.createByOverwritingDefaults = function (config, options = {allowNewKeys: false, allowUndefined: false}) {
    const defaultConfig = new AgentConfig();

    Object.keys(config).forEach(key => {

        if (!options.allowNewKeys && !defaultConfig.hasOwnProperty(key)) {
            throw new Error(`Tried overwriting property ${key} that does not exist on AgentConfig. ` +
                `If this is intentional, set in options argument "allowNewKeys" to true'`);
        }

        if (!options.allowUndefined && typeof config[key] === 'undefined') {
            throw new Error(`Tried setting value of ${key} to undefined. ` +
                'If this is intentional, set in options argument "allowUndefined" to true');
        }

        defaultConfig[key] = config[key];
    });

    return defaultConfig;
};

module.exports = AgentConfig;