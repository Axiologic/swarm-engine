/*
Initial License: (c) Axiologic Research & Alboaie Sînică.
Contributors: Axiologic Research , PrivateSky project
Code License: LGPL or MIT.
*/


/**
 * *   Usually an event could cause execution of other callback events . We say that is a level 1 event if is causeed by a level 0 event and soon
 *
 *  SoundPubSub provides intuitive results regarding to asynchronous calls of callbacks and computed values/expressions:
 *   we prevent immediate execution of event callbacks to ensure the intuitive final result is guaranteed as level 0 execution
 *   we guarantee that any callback function is "re-entrant"
 *   we are also trying to reduce the number of callback execution by looking in queues at new messages published by
 *   trying to compact those messages (removing duplicate messages, modifying messages, or adding in the history of another event ,etc)
 *
 *  Example of what can be wrong without non-sound asynchronous calls:

 *  Step 0: Initial state:
 *   a = 0;
 *   b = 0;
 *
 *  Step 1: Initial operations:
 *   a = 1;
 *   b = -1;
 *
 *  // an observer reacts to changes in a and b and compute CORRECT like this:
 *   if( a + b == 0) {
 *       CORRECT = false;
 *       notify(...); // act or send a notification somewhere..
 *       } else {
 *   CORRECT = false;
 *   }
 *
 *    Notice that: CORRECT will be true in the end , but meantime, after a notification was sent and CORRECT was wrongly, temporarily false!
 *    soundPubSub guarantee that this does not happen because the syncronous call will before any observer (bot asignation on a and b)
 *
 *   More:
 *   you can use blockCallBacks and releaseCallBacks in a function that change a lot a collection or bindable objects and all
 *   the notifications will be sent compacted and properly
 */

// TODO: optimisation!? use a more efficient queue instead of arrays with push and shift!?
// TODO: see how big those queues can be in real applications
// for a few hundreds items, queues made from array should be enough
//*   Potential TODOs:
//    *     prevent any form of problem by calling callbacks in the expected order !?
//*     preventing infinite loops execution cause by events!?
//*
//*
// TODO: detect infinite loops (or very deep propagation) It is possible!?


function SoundPubSub(){
    /**
     * publish
     * @params target,  message
     * @return
     */
    this.publish = function(target, message){
        if(channelSubscribers[target] != undefined){
            //console.log("SPS: Pub for "+ target);
            compactAndStore(target, message);
            dispatchNext();
            return channelSubscribers[target];
        } else{
            /*wprint("No one is subscribed to "+ J(target));*/
            return null;
        }
    }

    /**
     * publish
     * @params target, callBack, filter
     * @return
     */
    this.subscribe = function(target, callBack, waitForMore, filter){
        if(!callBack && typeof callBack != "function"){
            wprint("Can't subscribe to an invalid callback! " + callBack );
            return;
        }
        var subscriber = {"callBack":callBack, "waitForMore":waitForMore, "filter":filter};
        var arr = channelSubscribers[target];
        if(arr == undefined){
            arr = [];
            channelSubscribers[target] = arr;
        }
        arr.push(subscriber);
    }

    /**
     * publish
     * @params target, callBack, filter
     * @return
     */
    this.unsubscribe = function(target, callBack, filter){
        if(callBack){
            var gotit = false;
            for(var i = 0; i < channelSubscribers[target].length;i++){
                var subscriber =  channelSubscribers[target][i];
                if(subscriber.callBack == callBack && (filter == undefined || subscriber.filter == filter )){
                    gotit = true;
                    subscriber.forDelete = true;
                    subscriber.callBack = null;
                    subscriber.filter = null;
                }
            }
            if(!gotit){
                wprint("Unable to unsubscribe a callback that was not subscribed!");
            }
        }
    }


    /* ---------------------------------------- protected stuff ---------------------------------------- */
    var self = this;
    // map channelName (object local id) -> array with subscribers
    var channelSubscribers = [];

    // map channelName (object local id) -> queue with waiting messages
    var channelsStorage = {};

    // object
    var typeCompactor = {};

    // channel names
    var executionQueue = [];
    var level = 0;

    //an compactor take a newEvent and and oldEvent and return the one that survives (oldEvent if
    // it can compact the new one or the newEvent if can't be compacted)
    this.registerCompactor = function(type, callBack) {
        typeCompactor[type] = callBack;
    }

    /**
     *
     * @param fromReleaseCallBacks: hack to prevent too many recursive calls on releaseCallBacks
     * @return {Boolean}
     */
    function dispatchNext(fromReleaseCallBacks){
        if(level >0) {
            return false;
        }
        var channelName = executionQueue[0];
        if(channelName != undefined){
            self.blockCallBacks();
            try{
                var message = channelsStorage[channelName][0];
                if(message == undefined){
                    executionQueue.shift();
                } else {
                    if(message.__transmisionIndex == undefined){
                        message.__transmisionIndex = 0;
                        for(var i = channelSubscribers[channelName].length-1; i >= 0 ; i--){
                            var subscriber =  channelSubscribers[channelName][i];
                            if(subscriber.forDelete == true){
                                channelSubscribers[channelName].splice(i,1);
                            }
                        }
                    } else{
                        message.__transmisionIndex++;
                    }
                    //TODO: for immutable objects it will not work also, fix for shape models
                    if(message.__transmisionIndex == undefined){
                        wprint("Can't use as message in a pub/sub channel this object: " + message);
                    }
                    var subscriber = channelSubscribers[channelName][message.__transmisionIndex];
                    if(subscriber == undefined){
                        delete message.__transmisionIndex;
                        channelsStorage[channelName].shift();
                    } else{
                        if(subscriber.filter == undefined || subscriber.filter(message)){
                            if(!subscriber.forDelete){
                                subscriber.callBack(message);
                                if(subscriber.waitForMore && !subscriber.waitForMore(message)){
                                    subscriber.forDelete = true;
                                }
                            }
                        }
                    }
                }
            } catch(err){
                wprint("Event callback failed: "+ subscriber.callBack +"error: " + err.stack);
            }
            //
            if(fromReleaseCallBacks){
                level--;
            } else{
                self.releaseCallBacks();
            }
            return true;
        } else{
            return false;
        }
    }

    function compactAndStore(target, message){
        var gotCompacted = false;
        var arr = channelsStorage[target];
        if(arr == undefined){
            arr = [];
            channelsStorage[target] = arr;
        }
        if(message.type != undefined){
            var typeCompactorCallBack = typeCompactor[message.type];
            if(typeCompactorCallBack != undefined){
                for(var i = 0; i < arr.length; i++ ){
                    if(typeCompactorCallBack(message,arr[i]) == arr[i]){
                        // got compacted, bye bye message  but prevent loosing callbacks notifications
                        if(arr[i].__transmisionIndex == undefined) {
                            gotCompacted = true;
                            break;
                        }
                    }
                }
            }
        }

        if(!gotCompacted){
            arr.push(message);
            executionQueue.push(target);
        }
    }




    this.blockCallBacks = function(){
        level++;
    }

    this.releaseCallBacks = function(){
        level--;
        //hack/optimisation to not fill the stack in extreme cases (many events caused by loops in collections,etc)
        while( level == 0 && dispatchNext(true)){
            //nothing
        }

        while(level == 0 && callAfterAllEvents()){

        }
    }

    var afterEventsCalls =  [];

    this.afterAllEvents = function(callBack){
        afterEventsCalls.push(callBack);
        this.blockCallBacks();
        this.releaseCallBacks();
    }

    function callAfterAllEvents (){
        if(afterEventsCalls.length){
            var callBack = afterEventsCalls[0];
            afterEventsCalls.shift();
            //do not catch exceptions here..
            callBack();
        }
        return afterEventsCalls.length;
    }


    this.hasChannel = function(channel){
        if(channelSubscribers[channel]!=undefined){
            return true;
        }
        return false;
    }

    this.addChannel = function(channel){
        if(!this.hasChannel(channel)){
            channelSubscribers[channel] = [];
        }
    }
}

exports.soundPubSub = new SoundPubSub();

/*
//function CollectionChangeEvent(data){
//    this.type = SHAPEEVENTS.COLLECTION_CHANGE;
//    this.history = [];
//    this.history.push(data);
//}
//
//function PropertyChangeEvent(model,property,newValue, oldValue){
//    this.type = SHAPEEVENTS.PROPERTY_CHANGE;
//    this.property = property;
//    this.newValue = newValue;
//    this.oldValue = oldValue;
//}

this.registerCompactor(SHAPEEVENTS.PROPERTY_CHANGE, function(newEvent, oldEvent){
    if(newEvent.type ==  oldEvent.type && newEvent.property == oldEvent.property ){
        oldEvent.newValue = newEvent.newValue;
        return oldEvent;
    }
    return newEvent;
});

this.registerCompactor(SHAPEEVENTS.COLLECTION_CHANGE,function(newEvent, oldEvent){
    if(newEvent.type ==  oldEvent.type){
        for(var i = 0; i< newEvent.history.length; i++){
            oldEvent.history.push(newEvent.history[i]);
        }
        return oldEvent; // succes compacting
    }
    return newEvent; // not this time
}); */