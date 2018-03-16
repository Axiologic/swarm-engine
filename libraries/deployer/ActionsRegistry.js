const child_process = require('child_process');
const os = require("os");
const fs = require("fs");
const path = require("path");
const urlUtil = require('url');
const http = require('http');
const https = require('https');

const fsExt = require('../utils/FSExtension').fsExt;

const accessSync = fs.accessSync;
const constants = fs.constants || fs;

function ActionsRegistry(){
    var actions = {};
    
    // default actions
    actions.install = function(action, dependency, callback){
        if(!dependency || !dependency.src){
            throw  "No source (src) attribute found on: " + JSON.stringify(dependency);
        }

        let target = dependency.src;
        let src = dependency.src.toLowerCase();
        if(src.indexOf("npm") === 0){
            target = dependency.name;
        }

        console.log("npm install " + target);
        child_process.execSync("npm install " + target, {stdio:[0,1,2]});

        callback(null, `Finished install action on dependency ${dependency.name}`);
    };

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
    }

    var _downloadAsync = function(url, dest, callback) {
        var file = fs.createWriteStream(dest);

        performRequest(url, file, callback);

        function performRequest(url, file, callback) {
            var maxNumRedirects = 5;

            function doRequest(url, callback, redirectCount) {
                if(redirectCount > maxNumRedirects) {
                    throw "Max number of redirects for URL: " + url + " has reached!"
                }

                var protocol = resolveProtocol(url);
                if(typeof protocol === "string") {
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
                        res.pipe(file);
                        file.on('finish', function() {
                            file.close(callback);  // async
                        });
                    }
                }).on('error', function(error) {
                    fs.unlink(dest); // async
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

    actions.move = function(action, dependency, callback){
        if(!action.src){
           throw "No source (src) attribute found on: " + JSON.stringify(action);
        }

        var target = os.tmpdir();
        if(action.target){
            target = action.target;
        }

        console.log(`Start moving ${action.src} to ${target}`);
        fsExt.move(action.src, target, callback);
    }

    actions.clone = function(action, dependency, callback) {
        if(!dependency || !dependency.src){
            throw "No source (src) attribute found on: " + JSON.stringify(dependency);
        }

        var target = os.tmpdir();
        if(action.target){
            target =  fsExt.resolvePath(path.join(action.target, dependency.name));
        }

        var options = {};
        if(action && typeof action.options === "object") {
            options = action.options;
        }

        _cloneSync(dependency.src, target, options);
        callback(null, `Finished clone action on dependency ${dependency.name}`);
    }

    var _cloneSync = function (remote, tmp, options) {
        var commandExists = _commandExistsSync("git");
        if(!commandExists) {
            throw "git command does not exist! Please install git and run again the program!"
        }

        let optionsCmd = "";
        for(let op in options) {
            optionsCmd += " --" + op + "=" + options[op];
        }

        let cmd = "git clone" + optionsCmd + " " + remote + " " + tmp;
        console.log(`Running command ${cmd}`);
        child_process.execSync(cmd, {stdio:[0,1,2]});
    }

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

    }

    var _localExecutableSync = function(commandName){
        try{
            accessSync(commandName, constants.F_OK | constants.X_OK);
            return true;
        }catch(e){
            return false;
        }
    }

    actions.copy = function (action, dependency, callback) {
        if(!dependency.src){
           throw "No source (src) attribute found on: " + JSON.stringify(dependency);
        }

        if(!action.target){
            throw "No target attribute found on: " + JSON.stringify(action);
        }

        let src = path.join(dependency.src, dependency.name);
        let target = path.join(action.target, dependency.name);

        console.log("Start copying " + src + " to folder " + target);
        fsExt.copy(src, target, callback);
    }

    actions.remove = function (action, dependency, callback) {
        if(!action.target){
            throw "No target attribute found on: " + JSON.stringify(action);
        }

        fsExt.remove(action.target, callback);
    }

    actions.extract = function(action, dependency, callback) {
        if(!action.src || !action.target){
           throw "No source (src) or target attribute found on: " + JSON.stringify(action);
        }

        let src = fsExt.resolvePath(action.src);
        let target = fsExt.resolvePath(action.target);

        console.info(`Start extracting ${src} to folder ${target}`);
        _extractSync(src, target);
        callback(null, `Finished extract action on dependency ${dependency.name}`);
    }

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
    }

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
    }

    
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
    }

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
    }

}

var defaultActionsRegistry = new ActionsRegistry();

exports.getRegistry = function(){
    return defaultActionsRegistry;
}