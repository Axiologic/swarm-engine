/* define functions for working with the local node*/

$$.flow.describe("localNode", {
    public:{
        pdsCfgInstance: "native",
        domainCache: "array"
    },
    launch:function(){
        var self = this;
        this.pdsCfgInstance = new Pds();

        $$.container.declareDependency($$.DI_components.locatorReady, [$$.DI_components.sandBoxReady], function(fail, ready){
            if(!fail){
                $$.container.resolve($$.DI_components.locatorReady, self);
            }
        });

    },
    getAgentsForDomain:function(domain, callflow){        //give a list of agents for nodes replicating a domain
        var d = domainCache[d];
        if(d){
            callflow(null, d.getReplicas());
        } else {
            callflow($$.errorHandler.error() );
        }

    },
    replicateDomain:function(domain){           // start replication for this domain

    },
    addRemoteVMQTopic:function(address){     //add a VirtualMQ topic for the current domain

    }

});
