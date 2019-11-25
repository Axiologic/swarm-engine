const beesHealer = require('swarmutils').beesHealer;
const IsolatedVM = require('../../../../../modules/pskisolates');
const {EventEmitter} = require('events');
const swarmUtils = require('swarmutils');
const OwM = swarmUtils.OwM;
const SwarmPacker = swarmUtils.SwarmPacker;

async function getAgentIsolatesWorker({shimsBundle, constitutions}, workingDir) {

    const config = IsolatedVM.IsolateConfig.defaultConfig;
    config.logger = {
        send([logChannel, logObject]) {
            $$.redirectLog(logChannel, logObject)
        }
    };

    const isolate = await IsolatedVM.getDefaultIsolate({
        shimsBundle: shimsBundle,
        browserifyBundles: constitutions,
        config: config
    });

    class IsolatesWrapper extends EventEmitter {
        postMessage(packedSwarm) {
            const swarm = SwarmPacker.unpack(packedSwarm);

            const phaseName = OwM.prototype.getMetaFrom(swarm, 'phaseName');
            const args = OwM.prototype.getMetaFrom(swarm, 'args');
            const serializedSwarm = beesHealer.asJSON(swarm, phaseName, args);
            const stringifiedSwarm = JSON.stringify(serializedSwarm);

            isolate.run(`
				global.$$.swarmsInstancesManager.revive_swarm(JSON.parse('${stringifiedSwarm}'));
			`).catch((err) => {
                this.emit('error', err);
            });
        }
    }

    const isolatesWrapper = new IsolatesWrapper();

    isolate.globalSetSync('returnSwarm', (swarm) => {
        const newSwarm = new OwM(JSON.parse(swarm));
        const packedSwarm = SwarmPacker.pack(newSwarm);

        isolatesWrapper.emit('message', packedSwarm);
    });


    await isolate.run(`
            require("callflow").swarmInstanceManager;
            const swarmutils = require('swarmutils');
            const beesHealer = swarmutils.beesHealer;
            const OwM = swarmutils.OwM;
        
            global.$$.PSK_PubSub.subscribe($$.CONSTANTS.SWARM_FOR_EXECUTION, function(swarm){
                const phaseName = OwM.prototype.getMetaFrom(swarm, 'phaseName');
                const args = OwM.prototype.getMetaFrom(swarm, 'args');
                const serializedSwarm = beesHealer.asJSON(swarm, phaseName, args);
                const stringifiedSwarm = JSON.stringify(serializedSwarm);
               
                returnSwarm.apply(undefined, [stringifiedSwarm]);
            });
		`);

    //TODO: this might cause a memory leak
    setInterval(async () => {
        const rawIsolate = isolate.rawIsolate;
        const cpuTime = rawIsolate.cpuTime;
        const wallTime = rawIsolate.wallTime;

        const heapStatistics = await rawIsolate.getHeapStatistics();
        const activeCPUTime = (cpuTime[0] + cpuTime[1] / 1e9) * 1000;
        const totalCPUTime = (wallTime[0] + wallTime[1] / 1e9) * 1000;
        const idleCPUTime = totalCPUTime - activeCPUTime;
        $$.event('sandbox.metrics', {heapStatistics, activeCPUTime, totalCPUTime, idleCPUTime});

    }, 10 * 1000); // 10 seconds



    return isolatesWrapper;
}


module.exports = getAgentIsolatesWorker;
