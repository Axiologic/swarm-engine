const or = require('overwrite-require');
or.enableForEnvironment(or.constants.SERVICE_WORKER_ENVIRONMENT_TYPE);

require("../../modules/callflow/standardGlobalSymbols");
require("./swBoot_intermediar");

