
var joinCounter;



function ParallelJoinPoint(swarm, callback, args){
    joinCounter++;
    var channelId = "ParallelJoinPoint" + joinCounter;
    var self = this;
    var counter = 0;
    var finishedInError = false;


    function executionStep(funct, localArgs){

        this.doExecute = function(){
            try{
                return funct.apply(swarm, localArgs);
            } catch(err){
                args.unshift(err);
                callback.apply(swarm,args);
            }
        }
    }


    if(typeof callback !== "function"){
        $$.errorHandler.syntaxError("invalid join",swarm, "invalid function at join in swarm");
        return;
    }


    $$.PSK_PubSub.subscribe(channelId,function(forExecution){
        if(finishedInError){
            return ;
        }

        try{
            forExecution.doExecute();
        } catch(err){
            args.unshift(err);
            finishedInError = true;
            callback.apply(swarm, args);
            return ;
        }
        decCounter();
    });

    function incCounter(){
        counter++;
    }

    function sendForSoundExecution(funct, args){
        var obj = new executionStep(funct, args);
        $$.PSK_PubSub.publish(channelId, obj); // force execution to be "sound"
    }

    function decCounter(){
        counter--;
        if(counter == 0) {
            args.unshift(null);
            callback.apply(swarm, args);
        }
    }

    var inner = swarm.getInnerValue();


    function defaultProgressReport(err, res){
        if(err) {
            throw err;
        }
        return {
            text:"Parallel execution progress event",
            swarm:swarm,
            args:args,
            currentResult:res
        };
    }


    function mkFunction(name){
        return function(){
            var f = defaultProgressReport;
            if(name != "progress"){
                f = inner.myFunctions[name];
            }
            sendForSoundExecution(f, $$.__intern.mkArgs(arguments));
            return __proxyObject;
        }
    }


    this.get = function(target, prop, receiver){
        if(inner.myFunctions.hasOwnProperty(prop) || prop == "progress"){
            incCounter();
            return mkFunction(prop);
        }
        return swarm[prop];
    }

    var __proxyObject;

    this.__setProxyObject = function(p){
        __proxyObject = p;
    }

}


exports.createJoinPoint = function(swarm, callback, args){
    var jp = new ParallelJoinPoint(swarm, callback, args);
    var inner = swarm.getInnerValue();
    var p = new Proxy(inner, jp);
    jp.__setProxyObject(p);
    return p;
}