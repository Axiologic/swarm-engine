var pdsFake = require("../../../../modules/signsensus/lib/InMemoryPDS");


var pds = pdsFake.newPDS();

var h = pds.getHandler();


var swarm = {
    swarmName: "Swarm"
};

h.writeKey("testKey", "value1");
h.writeKey("testKey", "value2");
h.writeKey("testKey", "value3");
h.readKey("READKeyM");
h.readKey("READKeyM");
h.readKey("READKeyM");
h.readKey("READKeyOnce");
h.writeKey("anotherKey", "value4");

var diff = pds.computeSwarmTransactionDiff(swarm, h);

var expected = { swarmName: 'Swarm',
    input: { testKey: 1, READKeyM: 0, READKeyOnce: 0, anotherKey: 1 },
    output: { testKey: 'value1', anotherKey: 'value4' } }


console.log(diff);
console.log("Expected: ", expected);

