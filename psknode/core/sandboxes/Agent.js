const AgentStrategies = require('./util/AgentStrategies');
const Syndicate = require('../../../modules/syndicate');
const fs = require('fs');

/**
 *
 * @param {AgentConfig&AgentConfigStorage} config
 * @returns {AbstractPool}
 */
function getAgent(config) {
    if (!fs.existsSync(config.workingDir)) {
        throw new Error(`The provided working directory does not exists ${config.workingDir}`);
    }

    return Syndicate.createWorkerPool(config);
}

function doesStrategyExists(strategy) {
    return strategy === AgentStrategies.THREADS || strategy === AgentStrategies.ISOLATES;
}



module.exports = {getAgent};
