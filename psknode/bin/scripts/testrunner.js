require("../../bundles/pskruntime");
const argvParser = require("./argumentsParserUtil");
process.processedArgv = {
    "directory": process.cwd(),
    "config": undefined
};
argvParser.populateConfig(process.processedArgv);

require("../../../modules/double-check/bin/testRunner");