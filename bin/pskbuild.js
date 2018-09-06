var fs = require("fs");
var path = require("path");
var browserify = require('browserify');

var args = process.argv.slice(2);
var defaultMap = {
    browser:"assert,crypto,zlib,util,path",
    runtime:"soundpubsub,callflow,dicontainer,signsensus",
    domain:"localNode, pds, domain"
}


var targets = {
    forBrowser:true,
    forRuntime:true,
    forDomain:true
}
var mapJson = {};

function checkTarget(projectMap, propertyInTargets, propertyInMap){
    if(projectMap.propertyInMap){
        targets[propertyInTargets] = true;
    }
}

function concatDependency(d1, d2){
    if(!d1 || d1.length == 0) return d2;
    if(!d2 || d2.length == 0) return d1;
    return d1 + "," + d2;
}

if(args.length ==0 ){
    console.log("pskbuild is used to build the runtime or the code for running a privatesky domain");
    console.log("Usage: pskbuild <projectmap>");
    console.log("projectmap is a JSON file that contains the lists of dependencies for runtime or for domain's constitutions ");
    console.log("Using default configuration, normally used for building a runtime");
} else {
    var projectMap = fs.readFileSync(args[0])
    if(!projectMap){
        console.log("Invalid project map file:", args[0]);
    }
    mapJson = JSON.parse(projectMap);
}


    defaultMap.browser  = concatDependency(defaultMap.browser,mapJson.browser);
    defaultMap.runtime  = concatDependency(defaultMap.runtime,mapJson.runtime);
    defaultMap.libraries = concatDependency(defaultMap.libraries,mapJson.libraries);

    defaultMap.app  = concatDependency(defaultMap.app,mapJson.app);
    defaultMap.libs  = concatDependency(defaultMap.libs,mapJson.libs);
    if(mapJson.input){
        defaultMap.input = process.cwd() + mapJson.input;
    } else {
        defaultMap.input = __dirname + "/../engine/pskbuildtemp/";
    }

    if(mapJson.output){
        defaultMap.output = process.cwd() + mapJson.output;
    } else {
        defaultMap.output = process.cwd() + "/../builds/devel/";
    }



function doBrowserify(targetName, src, dest, opt, externalModules, exportsModules){
    if(targets[targetName]){
        console.log("Processing ", src, "into", dest);
        var package = browserify(src,opt);

        if(externalModules){
            //package.add(src);
            package.external(externalModules);
        }else{
         //
        }

        var optRequire = {};
        if(exportsModules){
            optRequire.expose = exportsModules;
        }

        //package.require(src, optRequire);
        var out = fs.createWriteStream(dest);
        package.on('file', function(file, id, parent){
            console.log(file, id, parent);
            /*if(id == "callflow"){
                package.require(file,{
                    expose:"callflow"
                })
            }*/
        })
        package.require("C:\\work\\PrivateSky\\privatesky\\modules\\callflow\\index.js", {
            expose:"callflow"
        })
        package.bundle().pipe(out);
    }
}


function buildDependencyMap(targetName, configProperty, output){
    var cfg = defaultMap[configProperty];
    var result = ";"
    cfg.split(",").map(function(item){
        item = item.trim();
        var line = `$$.__runtimeModules["${item}"] = require("${item}");\n`;
        result += line;
    })
    fs.writeFileSync(output,result);
}

var modulesPath = [path.resolve(process.cwd() + "/../modules/"), path.resolve(process.cwd() + "/../libraries/")];

var externalModules = defaultMap.browser.split(",");
var exportsModules = defaultMap.runtime.split(",");


console.log(modulesPath);
buildDependencyMap("forBrowser","browser", defaultMap.input + "/nodeShims.js");
doBrowserify("forBrowser", defaultMap.input + "/webruntime.js",     defaultMap.output + "/webruntime.js", {"fullPaths": true,
    externalRequireName:"browserifyRequire"});
buildDependencyMap("forRuntime","runtime", defaultMap.input + "/pskModules.js");
doBrowserify("forRuntime", defaultMap.input + "/pskruntime.js",     defaultMap.output + "/pskruntime.js", {
                paths:modulesPath,
                "bare":true,
                "debug":true,
                "fullPaths": true,
                externalRequireName:"browserifyRequire"
            }, externalModules, exportsModules);
buildDependencyMap("forDomain","domain", defaultMap.input + "/domain.js");
doBrowserify("forDomain", defaultMap.input + "/domain.js",   defaultMap.output + "/domain.js", {
    paths:modulesPath,
    "bare":true,
    "debug":true
});


