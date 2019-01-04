const os = require("os");
const path = require("path");
const fsExt = require('./FSExtension').fsExt;

function FileStateManager(){
	var tempDirName = fsExt.guid();

	// default sources
	var sources = [
	];

	var actions = {};
	actions.saveState = function(files, callback){
		var dest = _getStateDir();
		console.log(`Starting saving state in ${dest}.`);

		sources = _mergeArrays(sources, files);
		fsExt.rmDir(dest);

		for(var i=0; i < sources.length; i++) {
			let item = sources[i];
			let src = item;
			let target = path.join(dest, item, "/");

			fsExt.rmDir(target);
			try{
                fsExt.copy(src, target);
			}catch(err){
				//console.log("ignoring...", err);
			}

		}

		if(typeof(callback) === 'function') {
			callback();
		}
	};

	actions.restoreState = function(callback){
		var dest = _getStateDir();
		console.log(`Starting restoring state from ${dest}.`);

		try{
			for(var i=0; i < sources.length; i++) {
				let item = sources[i];
				fsExt.rmDir(item);
				fsExt.copy(path.join(dest, item), item)
			}
		}catch(err){
			//console.log("ignoring...", err);
		}

		fsExt.rmDir(dest);

		if(typeof(callback) === 'function') {
			callback();
		}
	};


	var _getStateDir = function () {
		return path.join(os.tmpdir(), tempDirName);
	};

	var _mergeArrays = function (array1, array2) {
		if(!Array.isArray(array1) || !Array.isArray(array2)) {
			console.log(JSON.stringify(array1) + " OR " + JSON.stringify(array2) + " are not arrays!");
			return [];
		}

		var result = array1.concat(array2);

		var seen = {};
		return result.filter(function(item) {
			return seen.hasOwnProperty(item) ? false : (seen[item] = true);
		});
	}

	return actions;
}

var stateManager = new FileStateManager();

exports.getFileStateManager = function(){
	return stateManager;
};