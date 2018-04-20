var cfg = require("./../fakes/simulationConfig").config;
var child_process = require('child_process');
var cutil = require("../../../modules/signsensus/lib/consUtil");
const os = require("os");

const maxParallelSimulations = os.cpus().length;

var configPossibilities = {
	MAX_NODES: [5, 10, 20, 50],
	SIMULATION_TIMEOUT: [10000, 20000, 30000],
	PULSE_PERIODICITY: [1000, 2000],
	MAX_KEYS_COUNT: [100, 200],
	MAX_TRANSACTIONS: [100, 200, 500, 1000, 2000],
	MAX_TRANSACTION_TIME: [50, 150, 200, 800, 1500],
	NETWORK_DELAY: [500, 1000, 2000, 3000, 4000]
};

var generatedCombinations = {};
var generator = require("combos");
generatedCombinations = generator(configPossibilities);
console.log(generatedCombinations.length, "Combination generated");

var inProgressSimulations = 0;
var stats = {};

function allSimulationFinished(){
	return !inProgressSimulations && !generatedCombinations.length;
}

function createSimulation(){

	inProgressSimulations++;
	console.log("generating simulation");

	let config = generatedCombinations.pop();

	var child = child_process.fork("./simulationSlave.js", [JSON.stringify({cfg:config})], {stdio:[0, 1, 2, 'ipc']});

	child.on('error', function(err){
		console.log('Something happened in child process!');
	});

	child.on("message", function(report){
		inProgressSimulations--;
		stats[report.pid] = {config: config, stats: report.stats};
		console.log(generatedCombinations.length, "simulations to be runned");
		//if(allSimulationFinished()){
			initFile();
			saveReportsToFile();
		//}
	});
}

var sep = ",";
function itterateOverArray(content, arr, includeEOL){
	for(var i=0; i < arr.length; i++){
		content+=arr[i];

		if(i+1<arr.length||!includeEOL){
			content+=sep;
		}else{
			content+="\n";
		}
	}
	return content;
}

function itterateOverObjectWithArray(content, keys, obj, includeEOL){
	for(var i=0; i < keys.length; i++){
		if(!obj[keys[i]]){
			console.log(i, keys[i], obj[keys[i]], obj);
		}
		content+=obj[keys[i]];
		if(i+1<keys.length||!includeEOL){
			content+=sep;
		}else{
			content+="\n";
		}
	}
	return content;
}

var fs = require("fs");
var path = require("path");
var timestamp = new Date().getTime();
var filename = path.join("./simulationResults", timestamp+".csv");
var fileInit = 0;

function initFile(){
	if(!fileInit){
		fileInit = true;
		var simulations = Object.keys(stats);
		if(simulations.length<0){
			console.log("No stats to be written.")
			return;
		}

		var configColumns = Object.keys(configPossibilities);
		var statsColumns = Object.keys(stats[simulations[0]].stats);

		var csvContent = "";

		csvContent = itterateOverArray(csvContent, configColumns);
		csvContent = itterateOverArray(csvContent, statsColumns, true);

		try{
			fs.appendFileSync(filename, csvContent);
		}catch(err)
		{
			console.log("Error writing the file on disk");
		}
	}
}

function saveReportsToFile(){
	var simulations = Object.keys(stats);
	var configColumns = Object.keys(configPossibilities);
	var statsColumns = Object.keys(stats[simulations[0]].stats);

	var csvContent = "";
	var toBeDeleted = [];
	for(var i=0; i < simulations.length; i++){
		var stat = stats[simulations[i]];
		//delete stats[simulations[i]];
		toBeDeleted.push(simulations[i]);
		csvContent = itterateOverObjectWithArray(csvContent, configColumns, stat.config);
		csvContent = itterateOverObjectWithArray(csvContent, statsColumns, stat.stats, true);
	}

	try{
		fs.appendFileSync(filename, csvContent);
		for(var i=0; i<toBeDeleted.length; i++){
			delete stats[toBeDeleted[i]];
		}
	}catch(err){
		console.log("Error appending file... trying later");
	}
}

function start(){
	if(generatedCombinations.length>0){
		if(inProgressSimulations<maxParallelSimulations){
			createSimulation();
			start();
		}else{
			setTimeout(start, 2000);
		}
	}
}

start();
