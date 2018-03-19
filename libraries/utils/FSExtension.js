const fs = require("fs");
const path = require("path");
const os = require("os");
const child_process = require('child_process');
const crypto = require('crypto');

function FSExtention(){

    var basePath = path.join(__dirname, "../../");

    var __resolvePath = function(filename) {
        if(path.isAbsolute(filename)) {
            return filename;
        }

        return path.resolve(basePath, filename);
    }

    var __createDir = function(dir) {
        dir = __resolvePath(dir);
        if (fs.existsSync(dir)) {
            console.log(dir + " already exist! Continuing ...")
            return;
        }

        var isWin = (os.platform() === 'win32');
        var cmd = isWin ? "mkdir " : "mkdir -p ";

        child_process.execSync(cmd + dir, {stdio:[0,1,2]});
    }

    var __copy = function (src, dest, callback) {
        src = __resolvePath(src);
        dest = __resolvePath(dest);

        if (!fs.existsSync(src)) {
            let msg = `Directory ${src} does not exists! Continuing...`;
            if(callback) {
                callback(msg);
            }
            return;
        }

        try{
            let current = fs.lstatSync(src);
            if(current.isDirectory()) {
                __copyDir(src, dest);
            } else if(current.isFile()) {
                __copyFile(src, dest);
            }
        } catch (err) {
            console.error(err);
            callback(err);
            return;
        }

        if(callback) {
            callback();
        }
    }

    var __copyDir = function(src, dest) {
        src = __resolvePath(src);
        dest = __resolvePath(dest);

        __createDir(dest);

        var files = fs.readdirSync(src);
        for(var i = 0; i < files.length; i++) {
            let current = fs.lstatSync(path.join(src, files[i]));
            let newSrc = path.join(src, files[i]);
            let newDest = path.join(dest, files[i]);

            if(current.isDirectory()) {
                // TODO here maybe we save the state before executing copy and if there is a failure, then restore state
                __rmDir(newDest); // clean copy instead of override
                __copyDir(newSrc, newDest);
            } else if(current.isSymbolicLink()) {
                var symlink = fs.readlinkSync(newSrc);
                fs.symlinkSync(symlink, newDest);
            } else {
                __copyFile(newSrc, newDest);
            }
        }
    };

    var __copyFile = function(src, dest) {
        src = __resolvePath(src);
        dest = __resolvePath(dest);

        __createDir(path.dirname(dest));

        var content = fs.readFileSync(src, "utf8");
        fs.writeFileSync(dest, content);
    }

    var __remove = function(src, callback) {
        src = __resolvePath(src);
        console.log(`Removing ${src}`);

        try{
            let current = fs.lstatSync(src);
            if(current.isDirectory()) {
                __rmDir(src);
            } else if(current.isFile()) {
                __rmFile(src);
            }
        } catch (err) {
            console.error(err);
            callback(err);
            return;
        }

        if(callback) {
            callback();
        }
    }

    var __rmDir = function (dir) {
        dir = __resolvePath(dir);

        if (!fs.existsSync(dir)) {
            console.error(`Directory ${dir} does not exist!`);
            return;
        }

        var list = fs.readdirSync(dir);
        for (var i = 0; i < list.length; i++) {
            var filename = path.join(dir, list[i]);
            var stat = fs.lstatSync(filename);

            if (stat.isDirectory()) {
                __rmDir(filename, null);
            } else {
                // rm filename
                fs.unlinkSync(filename);
            }
        }

        fs.rmdirSync(dir);
    }

    var __rmFile = function(file) {
        file = __resolvePath(file);
        if (!fs.existsSync(file)) {
            console.error(`File ${file} does not exist!`);
            return;
        }

        fs.unlinkSync(file);
    }


    var __createFile = function(file, content) {
        file = __resolvePath(file)
        fs.writeFileSync(file, content);
    }

    var __move = function(src, dest, callback) {
        src = __resolvePath(src);
        dest = __resolvePath(dest);

        try {
            __rmDir(dest);
            __copyDir(src, dest);
            __rmDir(src);
        } catch(err) {
            if(callback) {
                callback(err);
            }
        }

        if(callback) {
            callback();
        }
    }

    var __checksum = function(src, algorithm, encoding) {
        src = __resolvePath(src);

        if (!fs.existsSync(src)) {
            throw `Path ${src} does not exists!`;
        }

        var checksum = "";
        let current = fs.lstatSync(src);
        if(current.isDirectory()) {
            let hashDir = __hashDir(src, algorithm, encoding);
            checksum = hashDir["hash"];
        } else if(current.isFile()) {
            checksum = __hashFile(src, algorithm, encoding);
        }

        return checksum;
    }

    var __hash =  function(str, algorithm, encoding) {
        return crypto
            .createHash(algorithm || 'md5')
            .update(str, 'utf8')
            .digest(encoding || 'hex')
    }

    var __hashFile = function(src, algorithm, encoding) {
        src = __resolvePath(src);
        if (!fs.existsSync(src)) {
            throw `${src} does not exist!`;
        }

        var content = fs.readFileSync(src, "utf8");
        return __hash(content, algorithm, encoding);
    }

    var __hashDir = function(dir, algorithm, encoding) {
        dir = __resolvePath(dir);
        if (!fs.existsSync(dir)) {
            throw `Directory ${dir} does not exist!`;
        }
        var hashes = {};
        var list = fs.readdirSync(dir);
        for (var i = 0; i < list.length; i++) {
            var filename = path.join(dir, list[i]);
            var stat = fs.lstatSync(filename);

            if (stat.isDirectory()) {
                let tempHashes = __hashDir(filename, algorithm, encoding);
                hashes = Object.assign(hashes, tempHashes["sub-hashes"]);
            } else {
                let tempHash = __hashFile(filename, algorithm, encoding);
                hashes[filename] = tempHash;
            }
        }

        // compute dir hash
        let dirContent = Object.keys(hashes).reduce(function (previous, key) {
            return previous += hashes[key];
        }, "");

        let dirHash = __hash(dirContent, algorithm, encoding);

        return {
            "hash": dirHash,
            "sub-hashes": hashes
        }
    }

    return {
        resolvePath: __resolvePath,
        createDir: __createDir,
        copyDir: __copyDir,
        rmDir: __rmDir,
        rmFile: __rmFile,
        createFile: __createFile,
        copy: __copy,
        move: __move,
        remove: __remove,
        checksum: __checksum
    }
}

module.exports.fsExt = new FSExtention();