

var simpleFlow = $$.callflow.create("testSwarm",{
    start:function(end){
        this.end = end;
        console.log("In 'start'");
        this.firstPhase();
    },
    firstPhase:function(){
        console.log("In 'nextPhase'");
        this.secondPhase();
    },
    secondPhase:function(){
        console.log("In 'secondPhase'");
        this.end();
    }
});

simpleFlow.start(function(){
    console.log("Callback called")
});

