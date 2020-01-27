const or = require('overwrite-require');
or.enableForEnvironment(or.constants.BROWSER_ENVIRONMENT_TYPE);
$$.log = $$.err = $$.fixMe = console.log;
require("./ssappBoot_intermediar");
