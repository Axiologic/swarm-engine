//TODO: SHOULD be moved in $$.__globals
$$.ensureFolderExists = function(folder, callback){

    var flow = $$.flow.start("mkDirRec");
    flow.make(folder, callback);
};

$$.ensureLinkExists = function(existingPath, newPath, callback){

    var flow = $$.flow.start("mkDirRec");
    flow.makeLink(existingPath, newPath, callback);
};

$$.pathNormalize = function (pathToNormalize) {
    const path = require("path");
    pathToNormalize = path.normalize(pathToNormalize);
    return pathToNormalize.replace(/[\/\\]/g, path.sep);
};