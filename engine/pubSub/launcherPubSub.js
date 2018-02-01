var pubSub = require("./core/soundPubSub").soundPubSub;

exports.create = function(folder, codeFolder ){

    var sandBoxesRoot = folder+"/sandboxes/";
    $$.ensureFolderExists(sandBoxesRoot, function(err, res){
        $$.__sandBoxManager = require("../util/SandBoxManager").create(sandBoxesRoot, codeFolder);
    });
    return pubSub;
};
