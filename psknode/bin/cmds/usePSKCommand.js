#!/usr/bin/env node

const [,, remote, channel, ...args] = process.argv;

const base = require("./pskShellBase.js");

base.setEnvVariable("SELECTED_PSK_REMOTE", remote);
base.setEnvVariable("SELECTED_PSK_CHANNEL", channel);
console.log(`Selecting for following commands the remote ${remote} and channel ${channel}`);