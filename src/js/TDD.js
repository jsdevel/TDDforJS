/*!
 * @constructor
 * @param {Object} session An object to store session data that persists
 * between unit and integration suites.
 */
function TDD(session){
   if(!(session instanceof Object)){
      throw new Error("session must be an object.");
   }
   this.session=session;
   var async;
   this.async={
      /** @type {Array} */
      intervals:[],
      /** @type {number} */
      intervalCounter:0,
      /** @type {Array} */
      timeouts:[],
      /** @type {number} */
      timeoutCounter:0,
      empty:function(){
         async.intervals.length=0;
         async.timeouts.length=0;
      },
      flush:function(){
         async.intervals.forEach(function(asyncItem){
            asyncItem.callback();
         });
         async.timeouts.forEach(function(asyncItem){
            asyncItem.callback();
         });
         async.empty();
      }
   };
   async=this.async;
   this.overrides={
      setTimeout:function(fn, timeout){
         var counter=++async.timeoutCounter;
         addAsync(counter, async.timeouts, fn, timeout);
         return counter;
      },
      setInterval:function(fn, interval){
         var counter=++async.intervalCounter;
         addAsync(counter, async.intervals, fn, interval);
         return counter;
      },
      clearTimeout:function(counter){
         removeAsync(counter, async.timeouts);
      },
      clearInterval:function(counter){
         removeAsync(counter, async.intervals);
      }
   };
   function addAsync(counter, array, fn, time){
      array.push({
         counter:counter,
         time:time,
         callback:function(){
            fn();
         }
      });
   }
   function removeAsync(counter, array){
      var asyncs=array;
      var async;
      var i;
      var len=asyncs.length;
      for(i=0;i<len;i++){
         async=asyncs[i];
         if(async.counter === counter){
            asyncs.splice(i, 1);
         }
         break;
      }
   }
}

