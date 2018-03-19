var pdsFake = require("../../../../modules/signsensus/lib/InMemoryPDS");
const cutil = require("../../../../modules/signsensus/lib/consUtil");

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
    input: { testKey: 0, READKeyM: 0, READKeyOnce: 0, anotherKey: 0 },
    output: { testKey: 'value1', anotherKey: 'value4' } }


console.log(diff);
console.log("Expected: ", expected);

var t = cutil.createTransaction(0, diff);
var set = {};
set[t.digest] = t;
pds.commit(set);

var h = pds.getHandler();
h.writeKey("testKey", "value5");     //version 1
h.writeKey("anotherKey", "value6");  //version 1
h.writeKey("anotherKey2", "value7"); //version 0

var diff = pds.computeSwarmTransactionDiff(swarm, h);


console.log("Without commit", diff);


var h = pds.getHandler();
h.writeKey("testKey", "value8");
var diff = pds.computeSwarmTransactionDiff(swarm, h);
console.log("Should be version 2 for input testKey ", diff);
