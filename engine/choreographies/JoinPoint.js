
var joinCounter;

function JoinPoint(swarm, callback, args){
    joinCounter++;
    var channelId = "JoinPoint" + joinCounter;
    var self = this;
    var counter = 0;
    var allreadyJoined = false;
    var triggerJoinFailureError = [];


    if(typeof callback !== "function"){
        $$.errorHandler.syntaxError("invalid join",swarm, "invalid function at join in swarm");
        return;
    }

    function asyncCheckForRun(){
        if(allreadyJoined){
          return ;
        }

        if(triggerJoinFailureError.length != 0){
            setTimeout(function(){
                allreadyJoined = true;
                args.unshift(triggerJoinFailureError);
                callback.apply(swarm,args);
            })
        } else
        if(counter == 0){
            args.unshift(null);
            callback.apply(swarm,args);
            allreadyJoined = true;
        }
    }

    $$.PSK_PubSub.subscribe(channelId,asyncCheckForRun); // force it to be "sound"

    function incCounter(){
        counter++;
    }

    function decCounter(){
        counter--;
        if(counter == 0) {
            $$.PSK_PubSub.publish(channelId, self);
        }
    }

    var inner = swarm.getInnerValue();



    function defaultProgressReport(err, res){
        if(err) {
            throw err;
        }
        return res;
    }


    function mkFunction(name){
        return function(){
            var f = defaultProgressReport;
            if(name){
                f = inner.myFunctions[name];
            }
            var ret;
            try{
                ret = f.apply(self,arguments);
            } catch(err){
                decCounter();
                triggerJoinFailureError.push(err);
                $$.PSK_PubSub.publish(channelId, self);
                //console.log("Join failed ", err);
                //throw err;
                return ;
            }
            decCounter();
            return ret;
        }
    }

    var proxiedFUnctions = {};
    for(var v in inner.myFunctions){
        proxiedFUnctions[v] = mkFunction(v);
    }

    proxiedFUnctions["progress"] = mkFunction();

    this.get = function(target, prop, receiver){
        if(proxiedFUnctions.hasOwnProperty(prop)){
            incCounter();
            return proxiedFUnctions[prop];
        }
        return swarm[prop];
    }
}


exports.createJoinPoint = function(swarm, callback, args){
    var jp = new JoinPoint(swarm, callback, args);
    var inner = swarm.getInnerValue();
    return new Proxy(inner, jp);
}