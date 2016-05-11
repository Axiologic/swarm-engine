
/*
    Prepare the state of a swarm to be serialised
*/

exports.asJSON = function(valueObject, phaseName, args){

    var res = {};
    res.publicVars      = valueObject.publicVars;
    res.privateVars     = valueObject.privateVars;
    res.meta            = {};

    res.meta.swarmTypeName  = valueObject.meta.swarmTypeName;

    res.meta.swarmId    = valueObject.meta.swarmId;
    res.meta.phaseId    = valueObject.meta.phaseId;
    res.meta.phaseName  = phaseName;

    res.meta.args       = args;
    res.meta.command    = "executeSwarmPhase";

    return res;
}

exports.jsonToNative = function(valueObject, phaseName, args){
//

}