if(!$$){
	$$ = {};
}

$$.PSK_PubSub = require("./lib/soundPubSub");

module.exports = {
    				createSwarmEngine: require("./lib/swarmDescription").createSwarmEngine,
					createJoinPoint: require("./lib/parallelJoinPoint").createJoinPoint,
					createSerialJoinPoint: require("./lib/serialJoinPoint").createSerialJoinPoint,
					"safe-uuid": require("./lib/safe-uuid"),
					beesHealer: require("./lib/beesHealer")
				};