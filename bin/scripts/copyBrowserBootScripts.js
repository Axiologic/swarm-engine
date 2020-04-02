let path = require("path");
let destinationFolder = null;
let bundlesFolder = "/bundles";

if (process.argv && process.argv[2]) {
    destinationFolder = path.resolve(process.argv[2]);
}
else {
    throw Error("Destination path was not provided!");
}

if (process.argv && process.argv[3]) {
    let bundlesSubFolder = process.argv[3];
    bundlesFolder = path.join(bundlesSubFolder, bundlesFolder);
}


let browserBootScriptsPaths = [];

let browserBootScripts = [
    {src: "swBoot.js", target: "/"},
    {src: "swHostBoot.js", target: "/"},
    {src: "ssappBoot.js", target: bundlesFolder},
    {src: "hostBoot.js", target: bundlesFolder},
    {src: "edfsBar.js", target: bundlesFolder},
    {src: "webshims.js", target: bundlesFolder}
];

browserBootScripts.forEach(bootScript => {
    let bootScriptPath = path.resolve(path.join(__dirname, `../../psknode/bundles/${bootScript.src}`));
    let destinationScriptPath = path.resolve(path.join(destinationFolder, path.join(bootScript.target, bootScript.src)));
    browserBootScriptsPaths.push({src: bootScriptPath, dest: destinationScriptPath});
});


const fs = require("fs");
browserBootScriptsPaths.forEach(file => {
    fs.copyFileSync(file.src, file.dest);
});

console.log(`${browserBootScriptsPaths.length} files were copied.`);
