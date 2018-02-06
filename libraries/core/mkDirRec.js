var fs = require("fs");
var path = require("path");


$$.flow.describe("mkDirRec", {
   make:function(folder, callback){
    folder = path.normalize(folder);

       var join = this.join(callback);
       var folders = folder.split(path.sep);

       var currentFolder = folders[0];
       this.__mkOneStep(currentFolder, join.progress);


        for(var i = 1; i < folders.length; i++){
            currentFolder += path.sep;
            currentFolder += folders[i];
            console.log(currentFolder);
            join.__mkOneStep(currentFolder, join.progress);
        }

   },

    makeLink: function(existingPath, newPath, callback){
        //console.log("Link: ", existingPath, newPath);
        fs.exists(newPath, function(res) {
            if (!res) {
                fs.symlink(existingPath, newPath,'dir', callback);
            } else {
                callback(null, newPath);
            }
        })
    },
   __mkOneStep:function(folder, callback){
       fs.exists(folder, function(res){
           if(!res){
               fs.mkdir(folder, callback);
           } else {
               callback(null, true);
           }
       });
   }
});




