var pubSub = $$.require("soundpubsub").soundPubSub;

exports.create = function(folder, codeFolder ){

    $$.PSK_PubSub = pubSub;
    var sandBoxesRoot = folder+"/sandboxes/";
    $$.ensureFolderExists(sandBoxesRoot, function(err, res){
        $$.SandBoxManager = require("../util/SandBoxManager").create(sandBoxesRoot, codeFolder, function(err, res){
            console.log($$.DI_components.sandBoxReady, err, res);
            $$.container.resolve($$.DI_components.sandBoxReady, true);
        });
    });
    return pubSub;
};
