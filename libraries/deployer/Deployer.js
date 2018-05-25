const fs = require("fs");
const actionsRegistry = require("./ActionsRegistry");

const TAG = "[Deployer]";

function Deployer() {

    var self = {};
    /**
     * run
     *
     * @param configFileOrObject
     * @param callback
     */
    self.run = function (configFileOrObject, callback) {

        if (typeof callback !== "function") {
            throw "Callback provided is not a function!";
        }

        this.callback = callback;
        try {
            __init(configFileOrObject);
            console.info(TAG, "Start checking dependencies...");
            console.info(TAG, `Found ${self.dependencies.length} dependencies...`);
            if (self.dependencies.length > 0) {
                __runDependency(0);
            } else {
                let response = "No dependency to process!";
                if (self.callback) {
                    self.callback(null, response);
                }
            }
        } catch (error) {
            if (self.callback)
                self.callback(error, null);
        }
    };

    function __init(configFileOrObject) {
        self.actionsRegistry = actionsRegistry.getRegistry();
        self.configJson = {};
        self.dependencies = [];

        var config = __checkConfig(configFileOrObject);
        if (config) {
            self.configJson = config;
            self.dependencies = config.dependencies;
        }

        if (self.configJson.workDir) {
            self.actionsRegistry.setWorkDir(self.configJson.workDir);
        }
    }

    /**
     *__checkConfig
     *    CheckConfig takes {Object/File path}configFileOrObject as a parameter ,if it
     *    is a file it reads the .JSON file, creates and validates an Object containing an Array of dependencies.
     *    Object.dependencies should be an Array anything else is rejected
     *
     * @param {Object|File}configFileOrObject
     * @returns {{}} config
     *@private__checkConfig
     */
    function __checkConfig(configFileOrObject) {
        if (!configFileOrObject) {
            throw "Config file path or config object not provided!";
        }

        let config = {};
        if (typeof configFileOrObject === "object") {
            config = configFileOrObject;
        } else {
            config = __readConfig(configFileOrObject)
        }

        if (!config.dependencies) {
            throw "No dependencies found!";
        }

        if (!Array.isArray(config.dependencies)) {
            throw "Dependencies prop is not Array!";
        }

        for (let i = 0, len = config.dependencies.length; i < len; i++) {
            let dep = config.dependencies[i];
            if (!dep.actions || !Array.isArray(dep.actions) || dep.actions.length === 0) {
                throw `No actions available for ${dep.name} dependency or wrong format.`;
            }
        }
        return config;
    }

    /**
     *  __readConfig
     *  ReadConfig function that takes a .JSON file path, creates and  returns an Object.
     *
     * @param {File path}configFilePath
     * @returns {*}
     *@private __readConfig
     */
    function __readConfig(configFilePath) {
        return require(configFilePath);
    }

    /**
     *__runDependency
     *
     * RunDependency checks if all the dependencies have been deployed, if not it deploys the next dependency
     * @param {Number}index
     *@private __runDependency
     */
    function __runDependency(index) {

        // done with all dependencies
        if (index >= self.dependencies.length) {
            let response = "Finishing checking dependencies...";
            if (self.callback) {
                self.callback(null, response);
            }
            return;
        }

        // deploying dependency
        var dep = self.dependencies[index];
        console.info(TAG, "Running dependency: [" + index + "] " + dep.name);
        __runAction(index, 0);
    }

    /**
     * __runAction
     *
     * @param {Number}depIndex
     * @param {Number}actionIndex
     * @private__runAction
     */
    function __runAction(depIndex, actionIndex) {

        //var self = this;

        function next(error, result) {
            if (error) {
                if (self.callback) {
                    self.callback(error, null);
                }
            } else {
                if (result) {
                    console.log("depIndex:", depIndex, "actionIndex:", actionIndex, "result:", JSON.stringify(result));
                }
                actionIndex++;
                if (actionIndex < dep.actions.length) {
                    __runAction(depIndex, actionIndex);
                } else {
                    if (depIndex < self.dependencies.length) {
                        __runDependency(++depIndex);
                    }
                }
            }
        }

        let dep = self.dependencies[depIndex];
        let action = dep.actions[actionIndex];
        let actionName = typeof action === "object" ? action.type : action;
        let handler = self.actionsRegistry.getActionHandler(actionName, true);

        if (handler) {
            handler(action, dep, next);
        } else {
            next("No handler");
        }
    }

    return self;
}

module.exports = new Deployer();