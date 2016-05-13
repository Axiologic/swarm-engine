/*
Initial License: (c) Axiologic Research & Alboaie Sînică.
Contributors: Axiologic Research , PrivateSky project
Code License: LGPL or MIT.
*/

__swarmGlobals = {
    errorHandler: {
        error:function(err, args, msg){
            console.log(err, "Unknown error from function call with arguments:", args, "Message:", msg);
        },
        syntaxError:function(property, swarm){
            //throw new Error("Misspelled member name or other internal error!");
            try{
                var swarmName = swarm.meta.swarmTypeName;

            } catch(err){
                var swarmName = swarm.getInnerValue().meta.swarmTypeName;
            }

            console.log("Unknown member ", property,  " in swarm ", swarmName);
            /*try{

            } catch(err){
                throw new Error("Misspelled member name or other internal error!");
            }*/
            //console.log("Error: ", property);
        },
        warning:function(msg){
            console.log(msg);
        }
    },
    securityContext:"system",
    uidGenerator: require("./chore/safe-uuid.js")
};


__swarmGlobals.PSK_PubSub = require("./chore/InternalPubSub").internalBus;

var swarmDescr = require("./chore/swarmDescription");


var vms = require("./chore/dummyVM");



exports.setErrorHandler = function(errorHandler){
    __swarmGlobals.errorHandler = errorHandler;
}

exports.setSecurityContext = function(securityContext) {
    __swarmGlobals.securityContext = securityContext;
}


exports.describeSwarm    = swarmDescr.describeSwarm;
exports.createSwarm      = swarmDescr.createSwarm;
exports.startSwarm       = swarmDescr.startSwarm;
exports.restartSwarm     = swarmDescr.restartSwarm;
