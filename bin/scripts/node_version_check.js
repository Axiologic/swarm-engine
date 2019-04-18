const correctionSizeForSubVersion = 2;

let requiredVersion="10.15.3";
let currentVersion=process.version.slice(1);

function matchRequiredVersion(requiredVersion, version){
    let req = convertToNumber(requiredVersion.split("."));
    let ver = convertToNumber(version.split("."));

    function convertToNumber(arr){
        var result = "";
        for (var i=0; i<arr.length; i++){
            let correction = "";
            var value = arr[i];
            if(value.length<correctionSizeForSubVersion){
                correction = 0;
            }
            result += correction+value;
        }
        return Number(result);
    }

    return req <= ver;
}

let exitCode = 0;

if(!matchRequiredVersion(requiredVersion, currentVersion)){
    console.log("Install or update Node to version "+requiredVersion);
    exitCode = 1;
}

process.exit(exitCode);