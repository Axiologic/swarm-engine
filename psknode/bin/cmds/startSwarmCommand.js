#!/usr/bin/env node

const [,, swarmName, swarmPhase, ...args] = process.argv;

const base = require("./pskShellBase.js");
const path = require("path");

const remote = base.getEnvVariable("SELECTED_PSK_REMOTE");
const channel = base.getEnvVariable("SELECTED_PSK_CHANNEL");
console.log(`Using remote <${remote}> and channel <${channel}>`);

console.log(`Trying to run swarm <${swarmName}> on phase <${swarmPhase}>`);
if(typeof swarmName === "undefined" || typeof swarmPhase === "undefined"){
    console.log("Swarm name or phase is missing");
    process.exit(1);
}

const pskTarget = path.resolve(path.join(__dirname, "..", "..", "bundles", "httpinteract.js"));

require(pskTarget);

const interact = httpinteractRequire("interact");

const ris = interact.createRemoteInteractionSpace('noalias', remote, channel);

ris.startSwarm(swarmName, swarmPhase, ...args).onReturn(function(...args) {
    setTimeout(()=>{
        console.log("\nResult\n", ...args);
    }, 0);
});