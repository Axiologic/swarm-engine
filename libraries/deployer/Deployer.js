const fs = require("fs")
const actionsRegistry = require("./ActionsRegistry")

const TAG = "[Deployer]";

$$.callflow.describe("Deployer", {
    run: function(configFileOrObject, callback) {
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
    },
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

        for(var c in config.dependencies) {
            let dep = config.dependencies[c];
            if(!dep.actions || !Array.isArray(dep.actions) || dep.actions.length == 0){
                throw `No actions available for ${dep.name} dependecy or wrong format.`;
            }
        }

        return config;
    },
    __readConfig: function(configFilePath){
        let config = require(configFilePath);
        return config;
    },
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
    __runAction: function(depIndex, actionIndex) {

        var self = this;

        function next(error, result){
            if(error) {
                if(self.callback) {
                    self.callback(error, null);
                }
            } else {
                console.log(JSON.stringify(result));
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
