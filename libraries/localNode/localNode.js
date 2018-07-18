/* define functions for working with the local node*/

var ss = requireModule("signsensus");

$$.flow.describe("localNode", {
    public:{
        pdsCfgInstance: "native",
        domainCache: "array"
    },
    launch:function(){
        var self = this;
        this.pdsCfgInstance = new Pds();

        $$.container.declareDependency($$.DI_components.localNodeAPIs, [$$.DI_components.sandBoxReady], function(fail, ready){
            if(!fail){
                $$.container.resolve($$.DI_components.localNodeAPIs, self);
            }
        });

    },
    getAgentsForDomain:function(domain, callflow){        //give the list of replication agents for a domain
        var d = domainCache[d];
        if(d){
            callflow(null, d.getReplicas());
        } else {
            callflow($$.errorHandler.error() );
        }

    },
    replicateDomain:function(domain, callflow){        // start replication for this domain

    },
    addRemoteEndPoint:function(address, callflow){     //add a VirtualMQ topic for the current node

    }

});
