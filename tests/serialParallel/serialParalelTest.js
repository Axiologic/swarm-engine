

require("../../engine/core").enableTesting();



var worker = $$.flow.describe("worker", {
    makeSerialTask:function(value, bag, callback){
        this.bag = bag;
        var serialExecution = this.serial(callback);

        serialExecution.__mkOneStep(value, serialExecution.progress);
        for(var i = 1; i < 3; i++){
            serialExecution.__mkOneStep(value + i, serialExecution.progress);
        }
    },
    makeParallelTask: function(value, bag, callback){
        bag.result += value;
        console.log("makeParallelTask: ", value)
        setTimeout(callback,2);
    },
    __mkOneStep:function(value, callback){
        this.bag.result += value;
        console.log("__mkOneStep ", value)
        setTimeout(callback,3);
    }
});


var f = $$.callflow.create("paralelSerialExample", {
    public:{
      result:"int"
    },
    doSerial:function(){
        this.result = 0;
        var serial = this.serial(this.doParallel, "Hello serial execution!")
        worker().makeSerialTask(10, this, serial.progress);
        worker().makeSerialTask(20, this, serial.progress);
    },
    __dummy:function(number, callback){
        console.log("__dummy paralel: ", number);
        this.result += number;
        //throw new Error("__dummy paralel");
        setTimeout(callback,5);
    },
    doParallel:function(err, res){
        var parallel = this.parallel(this.printResults, "Hello parallel execution!");
        parallel.__dummy(1, parallel.progress);
        parallel.__dummy(2, parallel.progress);
        parallel.__dummy(3, parallel.progress);
        worker().makeParallelTask(1, this, parallel.progress);
        worker().makeParallelTask(2, this, parallel.progress);
    },
    printResults:function(err, res){
        //err should be null or not
        console.log("Serial execution result (should be 105):", this.result, "Error:", err, res);
    }
});

f.doSerial(); //sorry for complexity, is a crush form an actual use cases from sandboxmanager...

