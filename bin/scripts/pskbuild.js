var fs = require("fs");
var path = require("path");
var browserify = require('browserify');
var fsExt = require("../../libraries/utils/FSExtension").fsExt;

var args = process.argv.slice(2);
var defaultMap = {
    browser: "assert,crypto,zlib,util,path",
    runtime: "soundpubsub,callflow",
    domain: ""
}

var targets = {
    forBrowser: true,
    forRuntime: true,
    forDomain: true
}
var mapJson = {};

function checkTarget(projectMap, propertyInTargets, propertyInMap) {
    if (projectMap.propertyInMap) {
        targets[propertyInTargets] = true;
    }
}

function concatDependencyMaps(d1, d2) {
    if (!d1 || d1.length == 0) return d2;
    if (!d2 || d2.length == 0) return d1;

    let d3Arr = splitStrToArray(d2);
    for(let i=0; i<d3Arr.length; i++){
        if(d1.indexOf(d3Arr[i])!==-1){
            //removing duplicates deps from map
            d2 = d2.replace(new RegExp(d3Arr[i]), "");
        }
    }
    return (d1+","+d2).replace(/(,+(\s+,+)+)|,+/g, ',');
}

if (args.length == 0) {
    console.log("pskbuild is used to build the runtime or the code for running a privatesky domain");
    console.log("Usage: pskbuild <projectmap>");
    console.log("projectmap is a JSON file that contains the lists of dependencies for runtime or for domain's constitutions ");
    console.log("Using default configuration, normally used for building a runtime");
} else {
    var projectMap = fs.readFileSync(args[0])
    if (!projectMap) {
        console.log("Invalid project map file:", args[0]);
    }
    mapJson = JSON.parse(projectMap);
}


defaultMap.browser = concatDependencyMaps(defaultMap.browser, mapJson.browser);
defaultMap.runtime = concatDependencyMaps(defaultMap.runtime, mapJson.runtime);


defaultMap.domain = concatDependencyMaps(defaultMap.domain, mapJson.domain);


if (mapJson.input) {
    defaultMap.input = path.join(process.cwd(), mapJson.input);
} else {
    defaultMap.input = path.join(process.cwd(), "engine", "pskbuildtemp");
}

if (mapJson.output) {
    defaultMap.output = path.join(process.cwd(), mapJson.output);
} else {
    defaultMap.output = path.join(process.cwd(), "builds", "devel");
}

function detectAlias(str){
    var a = str.trim().split(/\s*:\s*/);
    var res = {};
    res.module = a[0].trim();
    if(a[1]){
        res.alias = a[1].trim();
    } else{
        res.alias = res.module;
    }
    return res;
}

function doBrowserify(targetName, src, dest, opt, externalModules, exportsModules) {

    function scanExports(callback) {
        var stream = require("stream");
        var writable = new stream.Writable({
            write: function (chunk, encoding, next) {
                //ignore
                next();
            }
        });

        var package = browserify(src, opt);
        var mapForExpose = {};

        exportsModules.map(function (item) {
            var i = detectAlias(item);
            mapForExpose[i.module] = i;
        })

        package.on('file', function (file, id, parent) {

            var i = mapForExpose[id];
            //console.log(file, id, i);
            if (i && i.module == id) {
                //console.log("Found entry", file, "for", id);
                mapForExpose[id] = file;
                mapForExpose[i.alias] = file;
            }
        })
        package.bundle().pipe(writable).on("finish", function (err, res) {
            //console.log(mapForExpose);
            callback(null, mapForExpose);
        });
    }

    function doWork(err, mapForExpose) {
        //console.log("Processing ", src, "into", dest, "\n" /*, JSON.stringify(mapForExpose, 2)*/);

        var package = browserify(src, opt);

        if (externalModules) {
            package.external(externalModules);
        }

        for (var v in mapForExpose) {
            //console.log("Expose:", v, mapForExpose[v]);
            package.require(mapForExpose[v], {
                expose: v
            });
        }
        //ensure dir struct exists
        fsExt.createDir(path.dirname(dest));

        var out = fs.createWriteStream(dest);
        package.bundle().pipe(out);
        endCallback(targetName);
    }

    if (targets[targetName]) {
        scanExports(doWork);
    }
}


function buildDependencyMap(targetName, configProperty, output) {
    var cfg = defaultMap[configProperty];
    var result = ";"
    splitStrToArray(cfg).map(function (item) {
        var ia = detectAlias(item);
        var line = `$$.__runtimeModules["${ia.alias}"] = require("${ia.module}");\n`;

        result += line;
    })

    //ensure dir struct exists
    fsExt.createDir(path.dirname(output));

    fs.writeFileSync(output, result);
}

var modulesPath = [path.resolve(process.cwd(), "modules"), path.resolve(process.cwd(), "libraries")];


var browserOptions = {
    paths: modulesPath,
    "fullPaths": true,
    externalRequireName: "browserRequire"
}

var runtimeOptions = {
    paths: modulesPath,
    "bare": true,
    "debug": true,
    "fullPaths": true,
    externalRequireName: "pskruntimeRequire"
}


var domainOptions = {
    paths: modulesPath,
    "bare": true,
    "debug": true,
    "fullPaths": true,
    externalRequireName: "domainRequire"
}

function splitStrToArray(str){
    return str.split(/\s*,\s*/);
}

var externalForDomain = splitStrToArray(defaultMap.browser).join(splitStrToArray(defaultMap.runtime));

console.log("Starts rebuilding");

var counter = 0;
function endCallback(str){
    counter++;
    console.log(str, "done ");
    if(counter == 3) {
        console.log("Finished rebuilding");
    }
}

buildDependencyMap("forBrowser", "browser", path.join(defaultMap.input, "nodeShims.js"));
doBrowserify("forBrowser",
    path.join(defaultMap.input, "webruntime.js"),
    path.join(defaultMap.output, "webruntime.js"),
    browserOptions,
    null,
    splitStrToArray(defaultMap.browser));

buildDependencyMap("forRuntime", "runtime", path.join(defaultMap.input, "pskModules.js"));
doBrowserify("forRuntime",
    path.join(defaultMap.input, "pskruntime.js"),
    path.join(defaultMap.output, "pskruntime.js"),
    runtimeOptions,
    splitStrToArray(defaultMap.browser),
    splitStrToArray(defaultMap.runtime));

buildDependencyMap("forDomain", "domain", path.join(defaultMap.input, "domain.js"));
doBrowserify("forDomain",
    path.join(defaultMap.input, "domain.js"),
    path.join(defaultMap.output, "domain.js"),
    domainOptions,
    null,
    splitStrToArray(defaultMap.domain));


