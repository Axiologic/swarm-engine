const AgentStrategies = require('./AgentStrategies');
const os = require('os');
const util = require('util');
const {EventEmitter} = require('events');

const PoolManagerEvents = {
    RELEASED_WORKER: 'releasedWorker'
};

function PoolManager(options, agentStrategy, numberOfWorkers = os.cpus().length) {
    EventEmitter.call(this);

    let pool = [];

    /** @returns {Worker|null} */
    this.getAvailableWorker = function () {
        // find first free worker
        const freeWorkerIndex = pool.findIndex(el => !el.isWorking);

        let worker = null;

        // if no free worker is available, try creating one
        if (freeWorkerIndex === -1) {
            createNewWorker();
        } else {
            worker = pool[freeWorkerIndex];
        }

        if (worker === null) {
            return null;
        }

        // if free worker exists, set its state to working
        worker.isWorking = true;
        return worker.worker;
    };

    /** @param {Worker} worker */
    this.returnWorker = function (worker) {
        // find worker that matches one in the pool
        const freeWorkerIndex = pool.findIndex(el => el.worker === worker);

        if (freeWorkerIndex === -1) {
            console.error('Tried to return a worker that is not owned by the pool');
            return;
        }

        // if worker is found, set its state to not working
        pool[freeWorkerIndex].isWorking = false;
        this.emit(PoolManagerEvents.RELEASED_WORKER);
    };

    /** @param {Worker} worker */
    this.removeWorker = function (worker) {
        pool = pool.filter(poolWorker => poolWorker.worker === worker);
    };


    function createNewWorker() {
        if (agentStrategy === AgentStrategies.THREADS) {
            createThreadsWorker();
        } else if (agentStrategy === AgentStrategies.ISOLATES) {
            createIsolatesWorker();
        } else {
            $$.error(`Unknown strategy ${agentStrategy}`);
        }
    }

    const createThreadsWorker = () => {
        const {Worker} = require('worker_threads');

        if (pool.length >= numberOfWorkers) {
            return null;
        }

        const {fileName, workerOptions} = options;
        const worker = new Worker(fileName, workerOptions);

        const workerObj = {
            isWorking: false,
            worker: worker
        };

        pool.push(workerObj);

        // delay this, otherwise is synchronous and tasks will be delayed too much
        setImmediate(() => {
            this.emit(PoolManagerEvents.RELEASED_WORKER);
        });
    };

    const createIsolatesWorker = () => {
        const getAgentIsolatesWorker = require('./ConcreteIsolatesWorker/AgentIsolatesWorker');

        getAgentIsolatesWorker(options.workerOptions)
            .then(worker => {
                const workerObj = {
                    isWorking: false,
                    worker: worker
                };

                pool.push(workerObj);

                this.emit(PoolManagerEvents.RELEASED_WORKER);
            })
            .catch(err => {
                $$.error('Failed creating isolates worker', err);
            });
    }
}

util.inherits(PoolManager, EventEmitter);
PoolManager.prototype.events = PoolManagerEvents;

module.exports = PoolManager;
