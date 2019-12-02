const fs = require('fs');
const Syndicate = require('syndicate');

/**
 *
 * @param {PoolConfig&PoolConfigStorage} config
 * @returns {AbstractPool}
 */
function getAgent(config) {
    return Syndicate.createWorkerPool(config);
}


module.exports = {getAgent};
