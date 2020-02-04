if(typeof $$ === "undefined" || !$$.environmentType) {
    const or = require('overwrite-require');
    or.enableForEnvironment(or.constants.NODEJS_ENVIRONMENT_TYPE);
} else {
    console.log('VirtualMQ running in test environment');
}

require("./virtualMQ_intermediar");