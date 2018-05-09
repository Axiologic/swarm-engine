const fs = require("fs")
const actionsRegistry = require("./ActionsRegistry")

const TAG = "[Deployer]";
$$.callflow.describe("Deployer", {
    /**
     * run
     *
     * @param configFileOrObject
     * @param callback
     */
    run: function(configFileOrObject, callback) {

        if(typeof callback !== "function") {
            throw "Callback provided is not a function!";
        }

        this.callback = callback;
        try{
            this.__init(configFileOrObject);
            console.info(TAG, "Start checking dependencies...");
            console.info(TAG, `Found ${this.dependencies.length} dependencies...`);
            if(this.dependencies.length > 0) {
                this.__runDependency(0);
            } else {
                let response = "No dependency to process!";
                if(this.callback) {
                    this.callback(null, response);
                }
            }
        } catch(error) {
            if(this.callback)
                this.callback(error, null);
        }
    },
    __init: function(configFileOrObject) {
        this.actionsRegistry = actionsRegistry.getRegistry();
        this.configJson = {};
        this.dependencies = [];

        var config = this.__checkConfig(configFileOrObject);
        if(config) {
            this.configJson = config;
            this.dependencies = config.dependencies;
        }

        if(this.configJson.workDir) {
            this.actionsRegistry.setWorkDir(this.configJson.workDir);
        }
    },
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
    __checkConfig: function(configFileOrObject) {
        if(!configFileOrObject) {
            throw "Config file path or config object not provided!";
        }

        let config = {};
        if(typeof configFileOrObject === "object") {
            config = configFileOrObject;
        } else {
            config = this.__readConfig(configFileOrObject)
        }

        if(!config.dependencies){
            throw "No dependencies found!";
        }

        if(!Array.isArray(config.dependencies)){
            throw "Dependencies prop is not Array!";
        }

        for(let i = 0, len = config.dependencies.length; i< len; i++) {
            let dep = config.dependencies[i];
            if(!dep.actions || !Array.isArray(dep.actions) || dep.actions.length == 0){
                throw `No actions available for ${dep.name} dependency or wrong format.`;
            }
        }
        return config;
    },
    /**
     *  __readConfig
     *  ReadConfig function that takes a .JSON file path, creates and  returns an Object.
     *
     * @param {File path}configFilePath
     * @returns {*}
     *@private __readConfig
     */
    __readConfig: function(configFilePath){
        let config = require(configFilePath);
        return config;
    },
    /**
     *__runDependency
     *
     * RunDependency checks if all the dependencies have been deployed, if not it deploys the next dependency
     * @param {Number}index
     *@private __runDependency
     */
    __runDependency: function(index) {

        // done with all dependencies
        if(index >= this.dependencies.length){
            let response = "Finishing checking dependencies...";
            if(this.callback) {
                this.callback(null, response);
            }
            return;
        }

        // deploying dependency
        var dep = this.dependencies[index];
        console.info(TAG, "Running dependency: [" + index + "] " + dep.name);
        this.__runAction(index, 0);
    },
    /**
     * __runAction
     *
     * @param {Number}depIndex
     * @param {Number}actionIndex
     * @private__runAction
     */
    __runAction: function(depIndex, actionIndex) {

        var self = this;

        function next(error, result){
            if(error) {
                if(self.callback) {
                    self.callback(error, null);
                }
            } else {
                if(result){
                    console.log("depIndex:", depIndex, "actionIndex:", actionIndex, "result:", JSON.stringify(result));
                }
                actionIndex++;
                if(actionIndex < dep.actions.length){
                    self.__runAction(depIndex, actionIndex);
                }else{
                    if(depIndex < self.dependencies.length){
                        self.__runDependency(++depIndex);
                    }
                }
            }
        }

        let dep =  this.dependencies[depIndex];
        let action = dep.actions[actionIndex];
        let actionName = typeof action === "object" ? action.type : action;
        let handler = this.actionsRegistry.getActionHandler(actionName, true);

        if(handler){
            handler(action, dep, next);
        }else{
            next("No handler");
        }
    }
});