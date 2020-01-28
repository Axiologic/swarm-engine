const path = require('path');
require("../utils/pingpongFork").enableLifeLine(1000);

/**
 * These need to be first to allow customization of behavior of libraries in bundles
 * Currently PSKLogger (used inside callflow) uses this
 */
process.env.PRIVATESKY_DOMAIN_NAME = process.argv[2] || "AnonymousDomain" + process.pid;
process.env.PRIVATESKY_DOMAIN_CONSTITUTION = path.resolve(path.join(__dirname, "../bundles/domain.js"));
process.env.PRIVATESKY_TMP = path.resolve(process.env.PRIVATESKY_TMP || "../tmp");
process.env.DOMAIN_WORKSPACE = path.resolve(process.env.PRIVATESKY_TMP, "domainsWorkspace", process.env.PRIVATESKY_DOMAIN_NAME);
process.env.vmq_zeromq_sub_address = process.env.vmq_zeromq_sub_address || 'tcp://127.0.0.1:5000';

require('../../bundles/domainBoot');
