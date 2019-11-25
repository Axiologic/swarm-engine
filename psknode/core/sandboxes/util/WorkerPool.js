const Queue = require('swarmutils').Queue;
const {Worker} = require('worker_threads');

/** @type {PoolManager} */
function WorkerPool(poolManager) {

    const PoolManagerEvents = poolManager.events;
    const taskQueue = new Queue();

    this.addTask = function (task, callback) {
        const worker = poolManager.getAvailableWorker();

        if (!worker) {
            taskQueue.push({task, callback});
            return false;
        }

        addWorkerListeners(worker, callback);

        worker.postMessage(task);
        return true;
    };

    poolManager.on(PoolManagerEvents.RELEASED_WORKER, () => {
        if(taskQueue.isEmpty()) {
           return;
        }

        const nextTask = taskQueue.front();

        const taskWasAcceptedByAWorker = this.addTask(nextTask.task, nextTask.callback);

        if (taskWasAcceptedByAWorker) {
            taskQueue.pop();
        }
    });

    /**
     * @param {Worker} worker
     * @param {function} callbackForListeners
     */
    function addWorkerListeners(worker, callbackForListeners) {

        function callbackWrapper(...args) {
            callbackForListeners(...args);
            removeListeners();
            poolManager.returnWorker(worker);
        }

        function onMessage(...args) {
            if (args[0] instanceof Error) {
                callbackWrapper(...args);
            } else {
                callbackWrapper(undefined, ...args);
            }
        }

        function onError(err) {
            poolManager.removeWorker(worker);
            callbackWrapper(err);
        }

        function onExit(code) {
            poolManager.removeWorker(worker);
            if (code !== 0) {
                callbackWrapper(new Error('Operation could not be successfully executed'));
            }
        }

        worker.once('message', onMessage);
        worker.once('error', onError);
        worker.once('exit', onExit);

        function removeListeners() {
            worker.removeListener('message', onMessage);
            worker.removeListener('error', onError);
            worker.removeListener('exit', onExit);
        }
    }
}

module.exports = WorkerPool;
