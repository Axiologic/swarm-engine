const cutil   = require("../../../../modules/signsensus/lib/consUtil");
const ssutil  = require("../../../../modules/signsensus/lib/ssutil");

var pset = {};

var s1 = { swarmName: 'Swarm',
    input: { testKey: 0, READKeyM: 0},
    output: { testKey: 'value1', anotherKey: 'value4' } };


var t1 = cutil.createTransaction(1, s1)

pset[t1.digest] = t1;
console.log("T1:", t1.digest, t1.input);

var s2 = { swarmName: 'Swarm',
    input: { testKey: 0},
    output: { testKey: 'value1'} };


var t2 = cutil.createTransaction(1, s2);

pset[t2.digest] = t2;
console.log("T2:", t2.digest, t2.input);

var t3 = {};

for(var v in t2){
    t3[v] = t2[v];
    t3.nanosecod = t1.nanosecod;
}

delete t3.digest;

t3.digest     = ssutil.hashValues(t3); //faking t3
pset[t3.digest] = t3;
console.log("T3:", t3.digest, t3.input);



var s4 = { swarmName: 'Swarm',
    input: { testKey:1, testKeyOther: 0},  //TODO: more testing, play with versions
    output: { testKeyOther: 'value4'} };


var t4 = cutil.createTransaction(2, s4);

pset[t4.digest] = t4;
console.log("T4:", t4.digest, t4.input);

exports.set = pset;