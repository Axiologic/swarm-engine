const AgentStrategies = require('../AgentStrategies');
const path = require('path');
const PoolManager = require('../PoolManager');
const SwarmPacker = require("swarmutils").SwarmPacker;
const WorkerPool = require('../WorkerPool');

/**
 *
 * @param {AgentConfigStorage} config
 * @constructor
 */
function AgentWithThreads(config) {
    const workerOptions = {
        cwd: config.workingDir,
        workerData: {
            constitutions: config.constitutions
        }
    };

    const poolOptions = {
        fileName: path.resolve(path.join(__dirname, './AgentThreadWorker.js')),
        workerOptions: workerOptions
    };

    const poolManager = new PoolManager(poolOptions, AgentStrategies.THREADS, config.maximumNumberOfWorkers);
    const workerPool = new WorkerPool(poolManager);

    this.executeSwarm = function(packedSwarm, callback) {
        workerPool.addTask(packedSwarm, callback);
    };
}

module.exports = AgentWithThreads;
