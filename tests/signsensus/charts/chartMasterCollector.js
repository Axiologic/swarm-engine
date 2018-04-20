var cfg = require("./../fakes/simulationConfig").config;
var child_process = require('child_process');
var cutil = require("../../../modules/signsensus/lib/consUtil");
const os = require("os");

const maxParallelSimulations = os.cpus().length;

var configPossibilities = {
	MAX_NODES: [5, 10/*, 20, 50*/],
	SIMULATION_TIMEOUT: [10000],
	PULSE_PERIODICITY: [1000],
	MAX_KEYS_COUNT: [100],
	MAX_TRANSACTIONS: [200],
	MAX_TRANSACTION_TIME: [150]
};

var generatedCombinations = {};
var generator = require("combos");
generatedCombinations = generator(configPossibilities);

var inProgressSimulations = 0;
var stats = {};

function allSimulationFinished(){
	return !inProgressSimulations;
}

function createSimulation(){
	inProgressSimulations++;

	let config = generatedCombinations.pop();

	let child = child_process.fork("./simulationSlave.js", [JSON.stringify({cfg:config})], {stdio:[0, 1, 2, 'ipc']});

	child.on('error', function(err){
		console.log('Something happened in child process!');
	});

	child.on("message", function(report){
		inProgressSimulations--;
		stats[report.pid] = {config: config, stats: report.stats};
		//console.log("Received from", child.pid, "report", report);
		if(allSimulationFinished()){
			saveReportsToFile();
		}
	});
}

function saveReportsToFile(){

	console.log(stats);

	/*var sep = ";";
	var childrenPIDS = Object.keys(stats);
	console.log("stats", stats);
	console.log("childrenPIDS",childrenPIDS);
	if(childrenPIDS.length<0){
		return;
	}
	var fs = require("fs");
	var path = require("path");
	var timestamp = new Date().getTime();
	var filename = path.join("./simulationResults", timestamp.toString());

	var csvContent = "PID"+sep+"Node"+sep;
	var columns = Object.keys(stats[childrenPIDS[0]][0]);
	console.log("columns",columns);
	if(columns.length<0){
		return;
	}

	for(var i=0; i < columns.length; i++){
		csvContent+=columns[i];
		if(i+1 < columns.length){
			csvContent +=sep;
		}else{
			csvContent += "\n";
		}
	}
	for(var j=0; j < childrenPIDS.length; j++){
		var pid = childrenPIDS[j];

		for(var z=0; z < stats[pid].length; z++){

			var nodeStat = stats[pid][z];
			var contentRow = pid.toString()+sep+z+sep;
			for(var i = 0; i < columns.length; i++){
				var column = columns[i];
				contentRow += nodeStat[column];
				if(i+1<columns.length){
					contentRow +=sep;
				}else{
					contentRow += "\n";
				}
			}
			csvContent +=contentRow;
		}
	}

	fs.writeFileSync(filename, csvContent);*/
}

while(generatedCombinations.length>0){
	if(inProgressSimulations<maxParallelSimulations){
		createSimulation();
	}
}