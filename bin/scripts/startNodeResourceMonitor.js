const PSKLoggerModule = require('../../modules/psklogger');
const PSKLogger = PSKLoggerModule.PSKLogger;

const logger = PSKLogger.getLogger();

const os = require('os');

setInterval(() => {
    usagePercent((err, cpuPercentage) => {
        cpuPercentage = Number(cpuPercentage.toFixed(1));
        const nodeInfo = {
            freeMemory: os.freemem(),
            totalMemory: os.totalmem(),
            machineUptime: os.uptime(),
            cpuPercentage: cpuPercentage
        };

        // nodeInfo.memoryPercentage = ((nodeInfo.freeMemory * 100) / nodeInfo.totalMemory).toFixed(2);

        logger.event('resources', nodeInfo);
    });

}, 5000);

function usagePercent(opts, cb) {
    const cpus = os.cpus();

    let timeUsed;
    let timeUsed0 = 0;
    let timeUsed1 = 0;

    let timeIdle;
    let timeIdle0 = 0;
    let timeIdle1 = 0;

    let cpu1;
    let cpu0;

    let time;

    //opts is optional
    if (typeof opts === 'function') {
        cb = opts;
        opts = {
            coreIndex: -1,
            sampleMs: 1000,
        };
    } else {
        opts.coreIndex = opts.coreIndex || -1;
        opts.sampleMs = opts.sampleMs || 1000;
    }

    //check core exists
    if (opts.coreIndex < -1 ||
        opts.coreIndex >= cpus.length ||
        typeof opts.coreIndex !== 'number' ||
        Math.abs(opts.coreIndex % 1) !== 0
    ) {
        console.error(opts.coreIndex, cpus.length);
        return cb('coreIndex "' + opts.coreIndex + '" out of bounds, ' +
            'should be [0, ' + (cpus.length - 1) + ']');
    }

    //all cpu's average
    if (opts.coreIndex === -1) {
        //take first measurement
        cpu0 = os.cpus();
        time = process.hrtime();

        setTimeout(function() {
            //take second measurement
            cpu1 = os.cpus();

            const diff = process.hrtime(time);
            const diffSeconds = diff[0] + diff[1] * 1e-9;

            //do the number crunching below and return
            for (let i = 0; i < cpu1.length; i++) {
                timeUsed1 += cpu1[i].times.user;
                timeUsed1 += cpu1[i].times.nice;
                timeUsed1 += cpu1[i].times.sys;
                timeIdle1 += cpu1[i].times.idle;
            }

            for (let i = 0; i < cpu0.length; i++) {
                timeUsed0 += cpu0[i].times.user;
                timeUsed0 += cpu0[i].times.nice;
                timeUsed0 += cpu0[i].times.sys;
                timeIdle0 += cpu0[i].times.idle;
            }

            timeUsed = timeUsed1 - timeUsed0;
            timeIdle = timeIdle1 - timeIdle0;

            const percent = (timeUsed / (timeUsed + timeIdle)) * 100;

            return cb(null, percent, diffSeconds);
        }, opts.sampleMs);

        //only one cpu core
    } else {
        //take first measurement
        cpu0 = os.cpus();
        time = process.hrtime();

        setTimeout(function() {
            //take second measurement
            cpu1 = os.cpus();

            const diff = process.hrtime(time);
            const diffSeconds = diff[0] + diff[1] * 1e-9;

            //do the number crunching below and return
            timeUsed1 += cpu1[opts.coreIndex].times.user;
            timeUsed1 += cpu1[opts.coreIndex].times.nice;
            timeUsed1 += cpu1[opts.coreIndex].times.sys;
            timeIdle1 += cpu1[opts.coreIndex].times.idle;

            timeUsed0 += cpu0[opts.coreIndex].times.user;
            timeUsed0 += cpu0[opts.coreIndex].times.nice;
            timeUsed0 += cpu0[opts.coreIndex].times.sys;
            timeIdle0 += cpu0[opts.coreIndex].times.idle;

            const timeUsed = timeUsed1 - timeUsed0;
            const timeIdle = timeIdle1 - timeIdle0;

            const percent = (timeUsed / (timeUsed + timeIdle)) * 100;

            return cb(null, percent, diffSeconds);
        }, opts.sampleMs);

    }
}
