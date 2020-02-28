let browserBootScripts = [
    {src: "swBoot.js", target: "/"},
    {src: "swHostBoot.js", target: "/"},
    {src: "ssappBoot.js", target: "/bundles"},
    {src: "edfsBar.js", target: "/bundles"},
    {src: "webshims.js", target: "/bundles"}
];


let path = require("path");
let destinationFolder = null;

if (process.argv && process.argv[2]) {
    destinationFolder = path.resolve(process.argv[2]);
}
else {
    throw Error("Destination path was not provided!");
}


let browserBootScriptsPaths = [];

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
