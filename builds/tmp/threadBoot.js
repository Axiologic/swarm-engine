const or = require('overwrite-require');
process.env.NO_LOGS = true;
or.enableForEnvironment(or.constants.THREAD_ENVIRONMENT_TYPE);

require("./threadBoot_intermediar");