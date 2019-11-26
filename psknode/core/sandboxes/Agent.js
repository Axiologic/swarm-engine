const fs = require('fs');
const Syndicate = require('../../../modules/syndicate');

/**
 *
 * @param {PoolConfig&PoolConfigStorage} config
 * @returns {AbstractPool}
 */
function getAgent(config) {
    if (!fs.existsSync(config.workingDir)) {
        throw new Error(`The provided working directory does not exists ${config.workingDir}`);
    }

    return Syndicate.createWorkerPool(config);
}


module.exports = {getAgent};
