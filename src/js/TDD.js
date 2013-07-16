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
   var asyncs;
   this.asyncs={
      /** @type {Array} */
      intervals:[],
      /** @type {number} */
      intervalCounter:0,
      /** @type {Array} */
      timeouts:[],
      /** @type {number} */
      timeoutCounter:0,
      empty:function(){
         asyncs.intervals.length=0;
         asyncs.timeouts.length=0;
      },
      flush:function(){
         asyncs.intervals.forEach(function(async){
            async.callback();
         });
         asyncs.timeouts.forEach(function(async){
            async.callback();
         });
         asyncs.empty();
      }
   };
   asyncs=this.asyncs;
   this.overrides={
      setTimeout:function(fn, timeout){
         var counter=++asyncs.timeoutCounter;
         addAsync(counter, asyncs.timeouts, fn, timeout);
         return counter;
      },
      setInterval:function(fn, interval){
         var counter=++asyncs.intervalCounter;
         addAsync(counter, asyncs.intervals, fn, interval);
         return counter;
      },
      clearTimeout:function(counter){
         removeAsync(counter, asyncs.timeouts);
      },
      clearInterval:function(counter){
         removeAsync(counter, asyncs.intervals);
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

