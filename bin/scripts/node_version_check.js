let requiredVersion="6.4.0";
let currentVersion=process.version.slice(1);

function matchRequiredVersion(requiredVersion, version){
    let arr = requiredVersion.split(".");
    let brr = version.split(".");
    let result = true;
    for (let i=0; i<arr.length; i++){
        if(Number(arr[i])>Number(brr[i])){
            result = false;
        }
    }

    return result;
}

let exitCode = 0;

if(!matchRequiredVersion(requiredVersion, currentVersion)){
    console.log("Install or update Node to version "+requiredVersion);
    exitCode = 1;
}

process.exit(exitCode);