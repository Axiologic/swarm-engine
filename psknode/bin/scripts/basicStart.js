const pingFork = require("../../core/utils/pingpongFork").fork;

if(process.argv.length < 3){
    console.log("Wrong usage. This script enables fork of process received as param no.3");
    process.exit(1);
}
const forkExtraArgs = process.argv.slice(2);
pingFork(process.argv[2], forkExtraArgs);