var fs = require("fs");
var path = require("path");
var browserify = require('browserify');

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

function concatDependency(d1, d2) {
    if (!d1 || d1.length == 0) return d2;
    if (!d2 || d2.length == 0) return d1;
    return d1 + "," + d2;
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


defaultMap.browser = concatDependency(defaultMap.browser, mapJson.browser);
defaultMap.runtime = concatDependency(defaultMap.runtime, mapJson.runtime);


defaultMap.domain = concatDependency(defaultMap.domain, mapJson.domain);


if (mapJson.input) {
    defaultMap.input = process.cwd() + mapJson.input;
} else {
    defaultMap.input = process.cwd() + "/engine/pskbuildtemp/";
}

if (mapJson.output) {
    defaultMap.output = process.cwd() + mapJson.output;
} else {
    defaultMap.output = process.cwd() + "/builds/devel/";
}

function detectAlias(str){
    var a = str.trim().split(":");
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
            var i = detectAlias(item)
            mapForExpose[i.module] = i.alias;
        })

        package.on('file', function (file, id, parent) {

            if (mapForExpose[id] == id) {
                //console.log("Found entry", file, "for", id);
                mapForExpose[id] = file;
            }
        })
        package.bundle().pipe(writable).on("finish", function (err, res) {
            callback(null, mapForExpose);
        });
    }

    function doWork(err, mapForExpose) {
        console.log("Processing ", src, "into", dest, "\n" /*, JSON.stringify(mapForExpose, 2)*/);

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

        var out = fs.createWriteStream(dest);
        package.bundle().pipe(out);
    }


    if (targets[targetName]) {
        scanExports(doWork);
    }
}


function buildDependencyMap(targetName, configProperty, output) {
    var cfg = defaultMap[configProperty];
    var result = ";"
    cfg.split(",").map(function (item) {
        var ia = detectAlias(item)
        var line = `$$.__runtimeModules["${ia.alias}"] = require("${ia.alias}");\n`;
        result += line;
    })
    fs.writeFileSync(output, result);
}

var modulesPath = [path.resolve(process.cwd() + "/modules/"), path.resolve(process.cwd() + "/libraries/")];


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

var externalForDomain = defaultMap.browser.split(",").join(defaultMap.runtime.split(","));

buildDependencyMap("forBrowser", "browser", defaultMap.input + "/nodeShims.js");
doBrowserify("forBrowser",
    defaultMap.input + "/webruntime.js",
    defaultMap.output + "/webruntime.js",
    browserOptions,
    null,
    defaultMap.browser.split(","));

buildDependencyMap("forRuntime", "runtime", defaultMap.input + "/pskModules.js");
doBrowserify("forRuntime",
    defaultMap.input + "/pskruntime.js",
    defaultMap.output + "/pskruntime.js",
    runtimeOptions,
    defaultMap.browser.split(","),
    defaultMap.runtime.split(","));

buildDependencyMap("forDomain", "domain", defaultMap.input + "/domain.js");
doBrowserify("forDomain",
    defaultMap.input + "/domain.js",
    defaultMap.output + "/domain.js",
    domainOptions,
    null,
    defaultMap.domain.split(","));

