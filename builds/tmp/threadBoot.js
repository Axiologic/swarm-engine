const or = require('overwrite-require');
or.enableForEnvironment(or.constants.THREAD_ENVIRONMENT_TYPE);
require("../../modules/callflow/standardGlobalSymbols");

require("./threadBoot_intermediar");

require("boot-script");