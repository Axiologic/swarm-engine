#New concept that takes the put the swarmcore and callflow together:  control your asynchronous code with explicit flows and have executable choreographies

### This library purpose a concept of flows based on explicit continuations.
    
The idea of the library is to represent asynchronous code (or even synchronous but complex code) as a set pf phases in a workflow. 
The code using asynchron avoids the infamous pyramid of callbacks by structuring code in a list of functions (phases) that also control the transitions between phases using "next" and "continue" primitives.
Transitions between  phases can get triggered by directly calls to other phases, by asynchronous calls (next) and by a continuations given in place of a asynchronous callback.
The flows have also the concept of "join" that  are dormant phases that get called only when the whole list of declared phases got executed.
        

### Syntax & primitives: The syntax of a flow is a JSON with values as functions phases and join phases 

The flow can be seen as a set of phases and the computation will pass through each one (synchronously and asynchronously)
Each phase has a name. Phases can be function phases or join phases. If a phase is a function phase, the field value in the JSON is a function. 
If a phase is a join phase, the value of the field is an object with a member "join" containing a list with the names of the phases that are waited until the join phase get called (see examples).
Two special functions, called flow primitives, are available in all   

### Flow variables     

When a flow is created, a Java Script object is created. This object beside containing as members all the functions of the flow, the "next" and "continue" functions, it can also contain arbitrary variables.
    
    
### Basic example:
    var f = flow.describeSwarm("FlowExample", {
        private:{
            a1:"int",
            a2:"int"
        },
        public:{
            result:"int"
        },
        begin:function(a1,a2){
            this.result = a1 + a2;
        },
        result:function(){
            return this.result;
        }
    })();

    f.begin();
    console.log(f.result());


### Example with a  asyncronous code:

var f = flow.createSwarm("asyncExample", {
    private:{
        a1:"int",
        a2:"int"
    },
    public:{
        result:"int"
    },
    begin:function(a1,a2){
        this.a1 = a1;
        this.a2 = a2;
        setTimeout(this.doStep, 1);
    },
    doStep:function(){
        this.result = this.a1 + this.a2;
    }
});


f.begin();
setTimeout(function(){
    console.log(f.result());
}, 2);



### Example with swarm primitive :
         
     var f = flow.createSwarm("simpleSwarm", {
         private:{
             a1:"int",
             a2:"int"
         },
         public:{
             result:"int"
         },
         begin:function(a1,a2){
             this.a1 = a1;
             this.a2 = a2;
         },
         doStep:function(a){
             this.result = this.a1 + this.a2 + a;
         }
     });


     var storage = flow.createMemoryStorage();

     f.begin();
     storage.save(f);

     var flowId = f.meta.swarmId()
     f.dispose();


     var newF = storage.revive(flowId);

     newF.doStep(1);

     setTimeout(function(){
         console.log(newF.result());
     }, 2);

###   Integration with the "whys" module (https://github.com/salboaie/whys)

From the beginning, we created flows with the idea to have automated integration with the "whys" module. Each phase transitions is automatically logged with a "why" call explaining the transition.  
Beside automated integration, why calls can be performed at will anywhere and the why system will compact the tracking logs for each call.
"next" and "continue" functions have the second argument an string that is automatically passed to the why.
 
      var flow = require("callflow");
           var f = flow.createFlow("Flow example", {
                 begin:function(a1,a2){
                     //.. code
                     this.step.why("explanantions...")();                     
                 }.why("Additional info"),
                 step:function(a){
                     //.. code                
                 }.why("Additional info")
             });
             f.why("Additional info")();

