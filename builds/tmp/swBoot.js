const or = require('overwrite-require');
or.enableForEnvironment(or.constants.SERVICE_WORKER_ENVIRONMENT_TYPE);

require("./swBoot_intermediar");