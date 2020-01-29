const fs = require("fs");
const path = require("path");
const browserify = require('browserify');
const argumentsParser = require(path.join(__dirname, './argumentsParserUtil'));


/** Arguments processing **/

const config = {
    externalTarget: undefined,
    prod: false,
    quick: false,
    projectMap: undefined,
    input: path.join(process.cwd(), "builds", "tmp"),
    output: path.join(process.cwd(), "psknode", "bundles"),
    source: [path.resolve(process.cwd(), "modules"), path.resolve(process.cwd(), "libraries")]
};

try {
    argumentsParser.populateConfig(config);
} catch (e) {
    if(e instanceof argumentsParser.Errors.InvalidArgumentError) {
        console.warn(`Invalid argument found: ${e.argumentName}`);
        console.warn('If running with npm run, try preceding argument list with -- (ex: npm run build -- --quick=true)');
        process.exit(1);
    }

    throw e;
}

if (typeof config.source === 'string') {
    config.source = config.source.split(',');
}

// translating arguments in properties with more suitable names
config.isProduction = config.prod;
config.skipShims = config.quick;

if(!config.hasOwnProperty('projectMap')) {
    console.log("pskbuild is used to build the runtime or the code for running a privatesky domain");
    console.log(`Usage: pskbuild --projectMap=<projectmap> [--input=<inputPath>] [--output=<outputPath>] [--quick=<boolean>] [--prod=<boolean>]`);
    console.log("projectmap is a JSON file that contains the lists of targets and their dependencies that will be built.");
    console.log("Using default configuration, normally used for building a runtime");
}

if(config.externalTarget) {
    const isExternalTargetAccessible = fs.existsSync(config.externalTarget) && fs.lstatSync(config.externalTarget).isDirectory();

    if(!isExternalTargetAccessible) {
        console.error("ERROR", config.externalTarget, "is not accessible!" );
        config.externalTarget = undefined;
    }
}

/** Preparing needed global variables **/

const skipList = config.skipShims ? ["webshims", "reactClient", "httpinteract", "pskclient", "swBrowserified"] : [];
const modulesPath = config.source;
const externals = {
    pskruntime: "webshims"
};


/** Preparing "projectMap" object used to describe targets and their dependencies **/

let projectMap = {};

if(config.hasOwnProperty('projectMap')) {
    const projectMapAsString = fs.readFileSync(config.projectMap, 'utf8');
    if (!projectMapAsString) {
        console.log("Invalid project map file:", config.projectMap);
    }else{
        console.log("Found project map", config.projectMap);
        projectMap = JSON.parse(projectMapAsString);
    }
}


/** Preparing targets **/

console.log("Reading targets and their dependencies list...");

const targets = {};
const depsNameProp = "deps";

//TODO: maybe we should put here all the neccessary modules and the xtras on build,json ?!
const defaultMap = {
    webshims: "",
    pskruntime: "",
    psknode: "",
    pskclient: ""
};

const sharedDefaultMapForDebugMode = 'source-map-support, source-map, buffer-from';

const cachedExternalValues = Object.values(externals);
function getDefaultMapForTarget(targetName) {
    let mapForTarget = '';

    if(defaultMap.hasOwnProperty(targetName)) {
        mapForTarget = defaultMap[targetName];
    }

    if(!config.isProduction) {
        if(!cachedExternalValues.includes(targetName)) {
            mapForTarget = concatDependencyMaps(sharedDefaultMapForDebugMode, mapForTarget);
        }
    }

    return mapForTarget;
}


// removing dependencies duplicates in target and uniformize targets,
// meaning tansforming targets that are strings in object with properties as needed by browserify
for (const targetName in projectMap) {
    if(!projectMap.hasOwnProperty(targetName)) {
        console.error('skipping target with name', targetName);
        continue;
    }

    const target = projectMap[targetName];
    if (typeof target === 'string' || target instanceof String) {
        const targetObject = {};
        targetObject[depsNameProp] = concatDependencyMaps(getDefaultMapForTarget(targetName), projectMap[targetName]);
        targets[targetName] = targetObject;
    } else {
        if (target instanceof Object && !Array.isArray(target)) {
            const targetObject = {};
            for (const p in projectMap[targetName]) {
                if(!projectMap[targetName].hasOwnProperty(p)) {
                    console.error('skipping target with name', targetName);
                    continue;
                }

                if (p === depsNameProp) {
                    targetObject[p] = concatDependencyMaps(getDefaultMapForTarget(targetName), projectMap[targetName][p]);
                } else {
                    targetObject[p] = projectMap[targetName][p];
                }
            }
            targets[targetName] = targetObject;
        } else {
            throw new Error(`Wrong format of target <${targetName}> found in project map file!`);
        }
    }

    // console.log("Identified and prepared target", targetName, targets[targetName]);
}


/** Cleanup output folder if in production mode **/

if(config.isProduction) {
    console.log('Cleaning output folder');

    try {
        const files = fs.readdirSync(config.output);

        for (const file of files) {
            fs.unlinkSync(path.join(config.output, file));
        }

    } catch (err) {
        if(err.code !== 'ENOENT') {
            throw err;
        }
    }
}


/** BUILDING IS AT THE END OF THE FILE **/

/** Utility functions **/

function splitStrToSet(str, set) {
    const arr = str.split(',')
        .map((str) => str.trim())
        .filter(str => str !== '');

    for (let i = 0; i < arr.length; ++i) {
        set.add(arr[i]);
    }
}

function concatDependencyMaps(dep1, dep2) {
    if (!dep1 || dep1.length === 0) return dep2;
    if (!dep2 || dep2.length === 0) return dep1;

    const resultingSet = new Set();
    splitStrToSet(dep1, resultingSet);
    splitStrToSet(dep2, resultingSet);

    return Array.from(resultingSet.values()).join(', ');
}

function detectAlias(str){
    const a = str.trim().split(/\s*:\s*/);
    const res = {};
    res.module = a[0].trim();
    if(a[1]){
        res.alias = a[1].trim();
    } else{
        res.alias = res.module;
    }
    return res;
}

function doBrowserify(targetName, src, dest, opt, externalModules, exportsModules) {
    expected++;
    function scanExports(callback) {
        const stream = require("stream");
        const writable = new stream.Writable({
            write: function (chunk, encoding, next) {
                //ignore
                next();
            }
        });

        const browserifyPackage = browserify(src, opt);
        const mapForExpose = {};

        exportsModules.map(function (item) {
            const i = detectAlias(item);
            mapForExpose[i.module] = i;
        })

        browserifyPackage.on('file', function (file, id, parent) {

            const i = mapForExpose[id];
            //console.log(file, id, i);
            if (i && i.module === id) {
                //console.log("Found entry", file, "for", id);
                mapForExpose[id] = file;
                mapForExpose[i.alias] = file;
            }
        });

        browserifyPackage.bundle()
            .on("error", (error)=>{
                throw new Error(`${error.message} while processing target '${targetName}'`);
            })
            .pipe(writable)
            .on("finish", function (err, res) {
                //console.log(mapForExpose);
                callback(null, mapForExpose);
            });
    }

    function doWork(err, mapForExpose) {
        //console.log("Processing ", src, "into", dest, "\n" /*, JSON.stringify(mapForExpose, 2)*/);

        const browserifyPackage = browserify(src, opt);

        if (externalModules) {
            browserifyPackage.external(externalModules);
        }

        for (const v in mapForExpose) {
            //console.log("Expose:", v, mapForExpose[v]);
            browserifyPackage.require(mapForExpose[v], {
                expose: v
            });
        }
        //ensure dir struct exists
        try {
            fs.mkdirSync(path.dirname(dest), {recursive: true});
        } catch (err) {
            if (err.code !== "EEXIST") {
                console.log(err);
            }
        }

        /** Code for extracting source maps from bundles and writing them on disk **/

        const {Transform} = require('stream');

        function SourceMapExtractor() {
            Transform.call(this);
        }

        const util = require('util');
        util.inherits(SourceMapExtractor, Transform);

        function getTransformFunctionForCurrentEnv() {
            if (config.isProduction) {
                return function (chunk, enc, callback) {
                    const data = chunk.toString();
                    let sourceMapIndex = data.indexOf('//# sourceMappingURL');

                    if (sourceMapIndex === -1) {
                        // no source map was found in this chunk, passing it further as is
                        this.push(chunk);
                    } else {
                        // skip this chunk in order to delete the source map from bundle
                    }

                    callback()
                }
            } else {
                return function (chunk, encoding, callback) {
                    const data = chunk.toString();
                    let sourceMapIndex = data.indexOf('//# sourceMappingURL');

                    if (sourceMapIndex !== -1) {
                        // finding source map location in bundle, it assumes a chunk will contain the entire source map
                        const separatorPos = data.indexOf(',') + 1;
                        const encodedSourceMap = data.substring(separatorPos);

                        // decoding source map from base64 and parsing it as JSON
                        const decodedSourceMap = Buffer.from(encodedSourceMap, 'base64').toString('utf8');
                        const sourceMapAsObject = JSON.parse(decodedSourceMap);

                        // source map is relative to PrivateSky root when building so it must specify a path back to it
                        // relative to the folder where it will be written to
                        sourceMapAsObject.sourceRoot = path.relative(path.dirname(dest), process.cwd());
                        const sourceMapFileName = path.basename(dest) + '.map';

                        // replace the source map data with the name of the file inside the bundle
                        // this is how source map standard has support for external source maps
                        this.push(`\n//# sourceMappingURL=${sourceMapFileName}`);

                        // relative path from where source map will be written to PrivateSky root folder
                        const pathToWriteSourceMapTo = path.join(path.dirname(dest), sourceMapFileName);

                        // writing source map to the same folder as the bundle
                        fs.writeFile(pathToWriteSourceMapTo, JSON.stringify(sourceMapAsObject), (err) => {
                            if (err) {
                                console.error('Error writing the source map file', err);
                            }
                        });
                    } else {
                        // no source map was found in this chunk, passing it further as is
                        this.push(chunk);
                    }

                    callback()
                };
            }
        }


        SourceMapExtractor.prototype._transform = getTransformFunctionForCurrentEnv();

        /** Generating bundles and writing them to disk **/

        const sourceMapExtractor = new SourceMapExtractor();
        const out = fs.createWriteStream(dest);
        browserifyPackage.bundle().pipe(sourceMapExtractor).pipe(out);
        endCallback(targetName);

        if (config.externalTarget) {
            ((dest) => {
                out.on('finish', () => {
                    copyToExternalDirectory(dest);
                });
            })(dest);
        }


    }

    scanExports(doWork);

}

function buildDependencyMap(targetName, configProperty, output) {
    const cfg = targets[targetName][depsNameProp];
    const autoLoad = configProperty.autoLoad || false;
    let result = `global.${targetName}LoadModules = function(){ \n`;
    splitStrToArray(cfg).map(function (item) {
        const ia = detectAlias(item);
        const line = `\n\tif(typeof $$.__runtimeModules["${ia.alias}"] === "undefined"){\n\t\t$$.__runtimeModules["${ia.alias}"] = require("${ia.module}");\n\t}\n`;
        result += line;
    });
    result += `}\nif (${autoLoad}) {\n\t${targetName}LoadModules();\n}; \nglobal.` + `${targetName}Require = require;\n` +
    `if (typeof $$ !== "undefined") {            
    $$.requireBundle("${targetName}");
    };
    ${config.isProduction ? '' : "require('source-map-support').install({});"}
    `;

    //ensure dir struct exists
    try {
        fs.mkdirSync(path.dirname(output), {recursive: true});
    } catch (err) {
        if (err.code !== "EEXIST") {
            console.log(err);
        }
    }


    fs.writeFileSync(output, result);
}

function constructOptions(targetName, opts){
    const options = {
        paths : modulesPath,
        fullPaths : true,
        bundleExternal: false,
        debug: true,
        externalRequireName : targetName+"Require"
    };

    if(typeof opts == "undefined"){
        options.bare = true;
    }else{
        for(const prop in opts){
            if(prop !== depsNameProp){
                options[prop] = opts[prop];
            }
        }
    }
    return options;
}

function splitStrToArray(str){
    if(!(typeof str === 'string' || str instanceof String)) {
        return [];
    }

    return str.split(',')
        .map((str) => str.trim())
        .filter(str => str !== '');
}

let counter = 0;
let expected = 0;
function endCallback(str){
    counter++;
    console.log(str, "done");
    if(counter === expected) {
        console.log("Finished rebuilding");
    }
}
let external_counter = 0;
function  copyToExternalDirectory(src){
    const filename = path.basename(src);
    const dest = path.join(config.externalTarget, filename);
    const writableStream = fs.createWriteStream(dest);

    fs.createReadStream(src).pipe(writableStream);
    writableStream.on("finish",function(){
        external_counter++;
        if(external_counter === expected){
            console.log("All targets were successfully copied to", config.externalTarget);
        }
    });

}

function buildTarget(targetName){
    if(skipList.includes(targetName)) return;
    console.log("Building target", targetName);

    buildDependencyMap(targetName, constructOptions(targetName, targets[targetName]), path.join(config.input, targetName+"_intermediar.js"));

    const overrideFile = path.join(config.input, targetName + ".js");
    const overrideFileExists = fs.existsSync(overrideFile);

    doBrowserify(targetName,
        path.join(config.input, targetName + (overrideFileExists ? "" : "_intermediar")+".js"),
        path.join(config.output, targetName + ".js"),
        constructOptions(targetName, targets[targetName]),
        externals[targetName] && targets[externals[targetName]] ? splitStrToArray(targets[externals[targetName]][depsNameProp]) : null,
        splitStrToArray(targets[targetName][depsNameProp]));
}


/** Building and writing target bundles **/

console.log("Starts rebuilding");

for(const target in targets){
    if(targets.hasOwnProperty(target)) {
        buildTarget(target);
    }
}
