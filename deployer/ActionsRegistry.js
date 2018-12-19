const child_process = require('child_process');
const os = require("os");
const fs = require("fs");
const path = require("path");
const urlUtil = require('url');
const http = require('http');
const https = require('https');

const fsExt = require('../libraries/utils/FSExtension').fsExt

const accessSync = fs.accessSync;
const constants = fs.constants || fs;
const changeSet = "latest-change-set.txt";
const mergeChangeSet = "Merge";
const changeSetDefaultSize = 3;


/**
 * Contains default actions
 * @constructor
 */
function ActionsRegistry(){
    var actions = {};

    // default actions
    /**
     *install
     *Install function that installs a dependency from a source(npm or URL package)
     *
     * @param {String} action
     * @param {Object} dependency: has attributes: src that can be either npm or a Git Repository, name of the package,
     * and workDir (optional) where the package will be installed
     * @param {Function} callback
     */
    actions.install = function(action, dependency, callback){
        if(!dependency || !dependency.src){
            throw  "No source (src) attribute found on: " + JSON.stringify(dependency);
        }

        let target = dependency.src;
        let src = dependency.src.toLowerCase();
        if(src.indexOf("npm") === 0){
            target = dependency.name;
        }

        let commandOpts = {stdio:[0, "pipe", "pipe"]};
        if(dependency.workDir) {
            commandOpts.cwd = dependency.workDir;
        }

        var cmd = "npm install " + target + " --no-save"
        console.log(cmd);
        let error = null;
        let response = `Finished install action on dependency ${dependency.name}`;
        try {
            child_process.execSync(cmd, commandOpts);
        } catch(e) {
            error = e;
            response = null
        }

        callback(error, response);
    };

    /**
     *download
     *Download function, downloads from a source dependency.src to a target action.target
     * @param {Object}action
     * @param {Object}dependency
     * @param {Function}callback
     */
    actions.download = function(action, dependency, callback){

        if(!dependency || !dependency.src){
            throw "No source (src) attribute found on: " + JSON.stringify(action);
        }

        if(!action || !action.target){
            throw  "No target attribute found on: " + JSON.stringify(action);
        }

        var src = dependency.src;
        var target = fsExt.resolvePath(path.join(action.target, dependency.name));
        fsExt.createDir(action.target);

        console.info(`Start downloading ${src} to folder ${target}`);
        _downloadAsync(src, target, callback);
    };

    var _downloadAsync = function(url, dest, callback) {

        performRequest(url, dest, callback);

        function performRequest(url, dest, callback) {
            var maxNumRedirects = 5;

            function doRequest(url, callback, redirectCount) {
                if(redirectCount > maxNumRedirects) {
                    throw "Max number of redirects for URL: " + url + " has reached!"
                }

                var protocol = resolveProtocol(url);
                if(typeof protocol === "string" || protocol == null) {
                    throw "URL Protocol " + protocol + " not supported! Supported protocols are http and https!"
                }

                protocol.get(url, function (res) {
                    // check for redirect
                    if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
                        // The location for some (most) redirects will only contain the path, not the hostname;
                        // detect this and add the host to the path.
                        if (urlUtil.parse(res.headers.location).hostname) {
                            console.log(`Redirect(${res.statusCode}): from ${url} to ${res.headers.location}`);
                            doRequest(res.headers.location, callback, redirectCount + 1)
                        } else {
                            // Hostname not included; get host from requested URL (url.parse()) and prepend to location.
                            res.headers.location = urlUtil.parse(url).hostname

                            console.log(`Scenario not tested: ${res.headers.location}`);
                        }

                    } else {
                        // no redirect; capture the response as normal and invoke the success callback
                        var file = fs.createWriteStream(dest);
                        res.pipe(file);
                        file.on('finish', function() {
                            file.close(callback);  // async
                        }).on('error', function(error) {
                            fs.unlink(dest, callback); // async
                        });
                    }
                }).on('error', function(error) {
                    callback(error, null);
                });
            }

            doRequest(url, callback, 0);
        }

        function resolveProtocol(url) {
            const parsedUrl = urlUtil.parse(url);
            switch (parsedUrl.protocol) {
                case "http:":
                    return http;
                case "https:":
                    return https;
                default:
                    console.log(parsedUrl.protocol + " not supported!")
                    return parsedUrl.protocol;
            }
        }
    };

    /**
     * move
     * Moves file or directory from actions.src to action.target
     * @param {Object}action. The available options are:
     * - overwrite <boolean>: overwrite existing file or directory, default is false. Note that the move operation will silently fail if you set this to true and the destination exists.
     * @param {Object}dependency
     * @param {Function}callback
     */
    actions.move = function(action, dependency, callback){
        if(!action.src){
            throw "No source (src) attribute found on: " + JSON.stringify(action);
        }

        var target = os.tmpdir();
        if(action.target){
            target = action.target;
        }

        let options = action.options || {};
        options.overwrite =  options.overwrite ? options.overwrite : false;

        console.log(`Start moving ${action.src} to ${target}`);
        fsExt.move(action.src, target, options, callback);
    };

    /**
     *clone
     * Clone function used to make a git clone of repo dependency.src in a specific location action.target
     * Optional clone options can be specified in {Object}action.options
     * Optional credentials: username and password can be specified in {Object}dependency.credentials
     * @param {Object}action
     * @param {Object}dependency
     * @param {Function}callback
     */
    actions.clone = function(action, dependency, callback) {
        if(!dependency || !dependency.src){
            throw "No source (src) attribute found on: " + JSON.stringify(dependency);
        }

        var target = os.tmpdir();
        if(action.target){
            target =  fsExt.resolvePath(path.join(action.target, dependency.name));
        }

        // the target if exists, should be empty
        if(fs.existsSync(target) && fs.readdirSync(target).length > 0) {
            throw `Destination path (target) ${target} already exists and is not an empty directory.`;
        }

        var options = {
            "depth": "1",
            "branch": "master"
        };
        if(action && typeof action.options === "object") {
            options = action.options;
        }

        global.collectLog = action.collectLog || true;

        _clone(dependency.src, target, options, dependency.credentials, function(err, res){
            if(!err){
                callback(err, `Finished clone action on dependency "${dependency.name}"`);
            }
        });
    };

    actions.smartClone = function(action, dependency, callback) {
        if(!dependency || !dependency.src){
            throw "No source (src) attribute found on: " + JSON.stringify(dependency);
        }

        var target = os.tmpdir();
        if(action.target){
            target =  fsExt.resolvePath(path.join(action.target, dependency.name));
        }

        // the target if exists and it's a git repo we try update
        if(fs.existsSync(target) && fs.readdirSync(target).length > 0 && fs.existsSync(path.join(target, ".git"))) {

            basicProcOptions = {cwd: path.resolve(target), stdio:[0, "pipe", "pipe"]};

            child_process.exec("git remote -v", basicProcOptions, function(err, stdout, stderr) {
                var next = true;
                if (err) {
                    console.log(err);
                }else{
                    var originFetchRegex = new RegExp('^[origin]*\\s*'+dependency.src+'[.git]*\\s*\\(fetch\\)', 'g');
                    var matchedArr = stdout.match(originFetchRegex)
                    if(!matchedArr){
                        throw new Error(`Different remotes found on repo ${target}`);
                    }

                    try{
                        child_process.execSync("git stash", basicProcOptions);
                        var pullResult = child_process.execSync("git pull", basicProcOptions);
                        pullResult = pullResult.toString();
                        if(pullResult.indexOf("Already up-to-date") == -1){
                            try{
                                console.log("pullResult", pullResult.indexOf("Already up-to-date"));
								let log = child_process.execSync("git log --max-count=1", basicProcOptions).toString().split("\n").slice(4).join("\n");
								fs.appendFileSync(changeSet, log);
                            }catch(err){
                                console.log(err);
                            }
                        }
                        var finalResult = child_process.execSync("git stash apply", basicProcOptions);
                        if(finalResult.indexOf("Unmerged") != -1){
                            callback(new Error(`Repo ${target} needs attention! (Merging issues)`), `Finished update action on dependency ${dependency.name}`)
                        }
                    }catch(err){
                        if(err.message.indexOf("No stash") != -1){
                            //ignore
                        }else{
                            console.log(err);
                        }
                    }
                    callback(err, `Finished update action on dependency ${dependency.name}`);
                }
            });
            //throw `Destination path (target) ${target} already exists and is not an empty directory.`;
        }else{

            var options = {
                "depth": "1",
                "branch": "master"
            };
            if(action && typeof action.options === "object") {
                options = action.options;
            }

            global.collectLog = action.collectLog || true;

            _clone(dependency.src, target, options, dependency.credentials, function(err, res){
                if(!err){
                    callback(err, `Finished clone action on dependency ${dependency.name}`);
                }
            });
        }
    };

    var _clone = function (remote, tmp, options, credentials, callback) {
        var commandExists = _commandExistsSync("git");
        if(!commandExists) {
            throw "git command does not exist! Please install git and run again the program!"
        }

        let optionsCmd = "";
        for(let op in options) {
            optionsCmd += " --" + op + "=" + options[op];
        }

        remote = _parseRemoteHttpUrl(remote, credentials);

        let cmd = "git clone" + optionsCmd + " " + remote + " \"" + tmp+"\"";

        console.log(`Running command ${cmd}`);

        var errorHandlers = {
            "warning: You appear to have cloned an empty repository": function(){
                console.log("Empty repo. Nothing to worry. Continue...")
                return true;
            }
        };

        child_process.exec(cmd,{stdio:[0, "pipe", "pipe"]}, function(err, stdout, stderr){
            var next = true;
            if(err){
                for (var prop in errorHandlers){
                    if(stdout && stdout.indexOf(prop) != -1 || stderr && stderr.indexOf(prop) != -1){
                        next = errorHandlers[prop]();
                        if(!next){
                            callback(err, "");
                            break;
                        }
                    }
                }
            }
            if(next && global.collectLog){
                cmd = "git log --max-count=1";

                child_process.exec(cmd,{cwd: path.resolve(tmp), stdio:[0, "pipe", "pipe"]}, function(err, stdout, stderr){
                    if(!err){
                        var index = stdout.indexOf("\n\n");
                        if(index!=-1){
                            index+=2;
                        }
                        msg = stdout.substring(index);

                        if(msg.indexOf("#") ==-1)
                        {
                            fs.appendFileSync(changeSet, msg);
                        }
                    }

                    callback(null, "");
                });
            }else{
                callback(null, "");
            }
        });
    };

    var _parseRemoteHttpUrl = function(remote, credentials) {

        // if credentials are given, add them in the URL
        if(credentials && credentials.username && credentials.password) {

            const parsedUrl = urlUtil.parse(remote);
            if(parsedUrl.protocol == "http:" || parsedUrl.protocol == "https:") {

                // clean existing username, if any
                let currentUsername = "";
                let endOfUsername = remote.indexOf("@");

                if(endOfUsername != -1) {
                    currentUsername = remote.slice(parsedUrl.protocol.length + 2, endOfUsername +1); // + 2 for // and + 1 for @
                }

                let encodedUsername= encodeURIComponent(credentials.username);
                let encodedPassword = encodeURIComponent(credentials.password);

                let urlCredentials = `${parsedUrl.protocol}//${encodedUsername}:${encodedPassword}@`;
                remote = remote.replace(`${parsedUrl.protocol}//${currentUsername}`, urlCredentials);
            }
        }

        return remote;
    };

    /**
     * commit
     * Commit function used to make a git add -A, commit and push into a repo dependency.src in a specific location action.target
     * Optional clone options can be specified in {Object}action.options
     * Optional credentials: username and password can be specified in {Object}dependency.credentials
     * @param {Object}action
     * @param {Object}dependency
     * @param {Function}callback
     */
    actions.commit = function(action, dependency, callback) {
        if(!dependency || !dependency.src){
            throw "No source (src) attribute found on: " + JSON.stringify(dependency);
        }

        if(!action || !action.target){
            throw "No target attribute found on: " + JSON.stringify(action);
        }

        if(!action.message){
            try{
                action.message = fs.readFileSync(changeSet, 'utf8');
                if((action.message.match(new RegExp("\n", "g")) || []).length > changeSetDefaultSize){
                    action.message = mergeChangeSet;
                }
            }catch(err){
                action.message = mergeChangeSet;
            }finally{
                fs.unlink(changeSet, (err) => {
                    if(err){
                        console.log(err);
                    }
                });
            }
        }

        var commandExists = _commandExistsSync("git");
        if(!commandExists) {
            throw "git command does not exist! Please install git and run again the program!"
        }

        _commit(dependency.src, action.target, action.message, dependency.credentials, action.options.branch, callback);
    };

    var _commit = function(remote, workDir, message, credentials, branch, callback) {

        var errorHandlers = {
            "nothing to commit, working directory clean": function(){
                console.log("Nothing to commit.");
                return false;
            },
            "push.default is unset": function(){
                console.log("You can define options.branch in order to fix this");
                return true;
            }
        };

        remote = _parseRemoteHttpUrl(remote, credentials);

        var commands = [];

        if(credentials){
            let username = credentials.username || "unassigned";
            let email = credentials.email || "unassigned";

            commands.push("git config user.username "+username);
            commands.push("git config user.email "+email);
        }

        commands.push("git status");
        commands.push("git add .");
        commands.push(`git commit -m "${message}"`);
        if(!branch){
            commands.push("git push");
        }else{
            commands.push(`git push origin ${branch}`);
        }

        function executeCommand(cmd){
            child_process.exec(cmd,{cwd: path.resolve(workDir), stdio:[0, "pipe", "pipe"]}, function(err, stdout, stderr){
                var next = true;
                if(err){
                    console.log("Commit command encountered next error", err);
                }
                for (var prop in errorHandlers){
                    if(stdout && stdout.indexOf(prop) != -1 || stderr && stderr.indexOf(prop) != -1){
                        next = errorHandlers[prop]();
                    }
                }
                if(next){
                    execute();
                }else{
                    callback(err);
                }
            });
        }

        function execute(){
            if(commands.length>0){
                executeCommand(commands.shift());
            }else{
                callback(null, "Commit done.");
            }
        }

        execute();

    };

    var _commandExistsSync = function(commandName) {
        var isWin = (os.platform() === 'win32');

        try {
            let cmd = isWin ?
                'where.exe ' + commandName
                :
                'command -v ' + commandName + ' 2>/dev/null && { echo >&1 \'' + commandName + ' found\'; exit 0; }';

            let stdout = child_process.execSync(cmd);

            return !!stdout;
        } catch (error) {
            return false;
        }

        return _localExecutableSync(commandName);

    };

    var _localExecutableSync = function(commandName){
        try{
            accessSync(commandName, constants.F_OK | constants.X_OK);
            return true;
        }catch(e){
            return false;
        }
    };

    /**
     * copy
     * Copy a file or a directory, from{String}dependency.src to {String}action.target
     * NOTE: If src is a directory it will copy everything inside of the directory, not the entire directory itself.
     * NOTE: If src is a file, target cannot be a directory.
     * @param {Object} action. The available options are:
     * - overwrite <boolean>: overwrite existing file or directory, default is true. Note that the copy operation will silently fail if you set this to false and the destination exists.
     * @param {Object} dependency.
     * @param {Function}callback
     */
    actions.copy = function (action, dependency, callback) {
        var src = action.src || dependency.src;
        if(!src){
            throw "No source (src) attribute found on: " + JSON.stringify(dependency);
        }

        if(!action.target){
            throw "No target attribute found on: " + JSON.stringify(action);
        }

        let options = action.options || {};
        options.overwrite =  !!options.overwrite;

        console.log("Start copying " + src + " to folder " + action.target);
        fsExt.copy(src, action.target, options, callback);
    };

    /**
     *remove
     * Remove, remove a file/directory from  a specified path {String}action.target;
     * @param {Object}action
     * @param {Object}dependency
     * @param {Function}callback
     */
    actions.remove = function (action, dependency, callback) {
        if(!action.target){
            throw "No target attribute found on: " + JSON.stringify(action);
        }

        fsExt.remove(action.target, callback);
    };

    /**
     *extract
     * Extracts a .zip file from a source path {String}action.src to a specific path {String}action.target
     * @param {Object}action
     * @param {Object}dependency
     * @param {Function}callback
     */
    actions.extract = function(action, dependency, callback) {
        if(!action.src || !action.target){
            throw "No source (src) or target attribute found on: " + JSON.stringify(action);
        }

        let src = fsExt.resolvePath(action.src);
        let target = fsExt.resolvePath(action.target);

        console.info(`Start extracting ${src} to folder ${target}`);
        _extractSync(src, target);
        callback(null, `Finished extract action on dependency ${dependency.name}`);
    };

    var _extractSync = function(src, dest) {
        if(!fs.existsSync(src)) {
            throw `Archive ${src} does not exist!`;
        }

        var isWin = (os.platform() === 'win32');
        var cmdName= isWin ? "powershell": "unzip";

        var commandExists = _commandExistsSync(cmdName);
        if(!commandExists) {
            throw `Command ${cmdName} does not exist! Please install it, before running again!`;
        }

        let cmd = "";
        if(os.platform() === 'win32') {
            cmd = `${cmdName} Expand-Archive -Path ${src} -DestinationPath ${dest}`;
        } else {
            cmd = `${cmdName} ${src} -d ${dest}`;
        }

        child_process.execSync(cmd);
    };

    /**
     *checksum
     * Checksum, used to calculate the checksum of a specific file/Dir {String}action.src and compare the result with
     * a pre-recorded attribute action.expectedChecksum
     * The checksum can be calculated with specific options {String}action.algorithm, {String}action.encoding
     *
     * @param {Object}action
     * @param {OBject}dependency
     * @param {Function}callback
     */
    actions.checksum = function(action, dependency, callback) {
        if(!action.src){
            throw "No source (src) attribute found on: " + JSON.stringify(action);
        }

        if(!action.expectedChecksum){
            throw "No expectedChecksum attribute found on: " + JSON.stringify(action);
        }

        let src = fsExt.resolvePath(action.src);

        var checksum = fsExt.checksum(src, action.algorithm, action.encoding);
        if(checksum !== action.expectedChecksum) {
            throw `Calculated checksum for ${src} was ${checksum} and it was expected ${action.expectedChecksum}`;
        }

        callback(null, `Finished checksum action on dependency ${dependency.name}`);
    };

    actions.execute = function(action, dependency, callback) {
        if(!action.cmd){
            throw "No command given";
        }
        try{
            console.log("Running command:", action.cmd, "with opts:", action.options);
            child_process.execSync(action.cmd, action.options);
        }catch(err){
            if(callback){
                callback(err);
            }
        }
        if(callback){
            callback();
        }
    };

    this.registerActionHandler = function(name, handler, overwrite) {
        if(!name){
            throw "No action name provided!";
        }

        if(!handler){
            throw "Trying to register an action without any handler!";
        }

        if(actions[name]){
            if(overwrite){
                actions[name] = handler;
                console.log("Action " + name + " was overwritten.");
            }
        } else {
            actions[name] = handler;
            console.log("Action " + name + " was registered.");
        }
    };

    this.getActionHandler = function(name, logIfMissing) {
        if(!name){
            throw "No action name provided!";
        }

        if(logIfMissing && !actions[name]){
            throw "No handler found for action: " + name;
        }


        // for sync calls/checks, the exceptions by can be caught here
        // for async calls, the callback(error, response) should be used instead
        function wrapper(action, dependency, callback) {
            try {
                actions[name](action, dependency, callback);
            } catch (error){
                callback(error, null);
            }
        }

        return wrapper;
    };

    this.setWorkDir = function(wd) {
        fsExt.setBasePath(wd);
    }

}

var defaultActionsRegistry = new ActionsRegistry();

exports.getRegistry = function(){
    return defaultActionsRegistry;
};