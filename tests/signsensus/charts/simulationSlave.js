const consensus = require("../../../modules/signsensus/lib/consensusManager");
//default config
var cfg = require("./../fakes/simulationConfig").config;
var args = process.argv;
if(args && args.length>2){
	for(var i=2; i<args.length; i++){
		try{
			var arg = JSON.parse(args[i]);
			if(arg.cfg){
				//getting config from parent proc
				cfg = arg.cfg;
			}
		}catch(e){
			//...ignore it
		}

	}
}

var network = require("./../fakes/comunicationFake");

var cutil = require("../../../modules/signsensus/lib/consUtil");

network.init(cfg);

var numberTransactions = cfg.MAX_TRANSACTIONS;

while(numberTransactions > 0){
	setTimeout(function () {
		network.generateRandomTransaction();
		//console.log("New transaction!");
	}, cutil.getRandomInt(cfg.MAX_TRANSACTION_TIME));
	numberTransactions--;
}

/*setTimeout(function(){
	process.send({pid: process.pid, stats: network.exportStatistics()});
	network.dumpVSDs();
	process.exit();
}, cfg.SIMULATION_TIMEOUT + 1000);*/

