const or = require('overwrite-require');
or.enableForEnvironment(or.constants.NODEJS_ENVIRONMENT_TYPE);
require("../../modules/callflow/standardGlobalSymbols");

require("./walletBoot_intermediar");
