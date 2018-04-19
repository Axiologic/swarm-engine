var pdsFake = require("../../../../modules/signsensus/lib/InMemoryPDS");
const cutil = require("../../../../modules/signsensus/lib/consUtil");

var pds = pdsFake.newPDS();

var h = pds.getHandler();


var swarm = {
    swarmName: "Swarm"
};

console.log("No transactions:");
console.log(pds.getVSD(), "main PDS should be: 1e18358790dea0c86c7b87ac41abe9eeaa34e9bed0e165543daec044b1e4b016");
console.log(h.getVSD(), "handler should be: 1e18358790dea0c86c7b87ac41abe9eeaa34e9bed0e165543daec044b1e4b016");  //unchanged

h.writeKey("testKey", "value1");
h.writeKey("testKey", "value2");
h.writeKey("testKey", "value3");
h.readKey("READKeyM");
h.readKey("READKeyM");
h.readKey("READKeyM");
h.readKey("READKeyOnce");
h.writeKey("anotherKey", "value4");

var diff = pds.computeSwarmTransactionDiff(swarm, h);


console.log("After some transactions:");
console.log(pds.getVSD(), "main PDS should be: 1e18358790dea0c86c7b87ac41abe9eeaa34e9bed0e165543daec044b1e4b016");
console.log(h.getVSD(), "handler should be: 1e18358790dea0c86c7b87ac41abe9eeaa34e9bed0e165543daec044b1e4b016");  //unchanged

var t = cutil.createTransaction(0, diff);
var set = {};
set[t.digest] = t;
pds.commit(set);

console.log("After commit:");
console.log(pds.getVSD(), "main PDS should be: 6ef0699d6495296c7bc6447ddc2a51dcc48c3f355dfd7f09ae86829f29735559");
console.log(h.getVSD(), "handler should be: 1e18358790dea0c86c7b87ac41abe9eeaa34e9bed0e165543daec044b1e4b016");  //unchanged
