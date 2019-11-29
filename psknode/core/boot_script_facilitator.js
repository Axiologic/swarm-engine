//To be used in case of loading boot scripts from specific modules

if( process.argv.length<5 ){
    console.log("\n\nUsage: node boot_script_facilitator.js <bundleName> [<bundleName2> <bundleName3> ...] <moduleName> <functionName>\n");
    throw new Error("Misuse of script.");
}

//duplicate of process.argv
const args = Array.from(process.argv);

//removing first 2 args
args.splice(0,2);

//reading name of the function to call
const functionToCall = args.pop();
//reading name of the module to load
const moduleToLoad = args.pop();

//rest of the args will be treated as bundles
const bundles = args;

//load all the bundles in the given order
for(let i=0; i<bundles.length; i++){
    const bundle = bundles[i];
    require(bundle);
}

//console.log(bundles , moduleToLoad, functionToCall);
let mod = require(moduleToLoad);

if(typeof mod[functionToCall] !== "function"){
    console.log(`The arg <${functionToCall}> given is not a valid exposed function of module <${moduleToLoad}>. Will be ignored`);
}else{
    //calling the initialise function from the module
    mod[functionToCall]();
}