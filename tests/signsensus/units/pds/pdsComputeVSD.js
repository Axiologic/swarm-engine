var pdsFake = require("../../../../modules/signsensus/lib/InMemoryPDS");


var pds = pdsFake.newPDS();

var h = pds.getHandler();


var swarm = {
    swarmName: "Swarm"
};

console.log("No transactions:");
console.log(pds.computeVSD(), "should be: 1e18358790dea0c86c7b87ac41abe9eeaa34e9bed0e165543daec044b1e4b016");
console.log(h.getVSD(), "should be: 1e18358790dea0c86c7b87ac41abe9eeaa34e9bed0e165543daec044b1e4b016");

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
console.log(pds.computeVSD(), "should be: 1e18358790dea0c86c7b87ac41abe9eeaa34e9bed0e165543daec044b1e4b016");
console.log(h.getVSD(), "should be: 1e18358790dea0c86c7b87ac41abe9eeaa34e9bed0e165543daec044b1e4b016");

console.log(diff);
h.commit(diff); //wrong...

console.log("After commit:");
console.log(pds.computeVSD(), "should be: 1e18358790dea0c86c7b87ac41abe9eeaa34e9bed0e165543daec044b1e4b016");
console.log(h.getVSD(), "should be: c9b3a1067c1d7632efc8ad0cddd3472096d93be696a911300b55e22dfeba0444");
