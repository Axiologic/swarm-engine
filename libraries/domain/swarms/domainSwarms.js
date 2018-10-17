console.log("loading domain config swarm");

$$.swarms.describe("domain", {
    initialize:function(name){
        console.log("Initializing domain ", name);
        this.return();
    }
});