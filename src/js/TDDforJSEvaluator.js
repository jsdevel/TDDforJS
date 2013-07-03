/**
 * @constructor
 */
function TDDforJSEvaluator(){
   //prevent the constructor from being overridden;
   var TDDforJSEvaluator;
   var __$$__originalGlobalScope={};
   var __$$__globalScope=(function(){return this;})();
   var __$$__reset=function(){
      var __$$__name;
      for(__$$__name in __$$__globalScope){
         if(!(__$$__name in __$$__originalGlobalScope)){
            __$$__globalScope[__$$__name]=void 0;
         } else {
            __$$__globalScope[__$$__name]=__$$__originalGlobalScope[__$$__name];
         }
      }
   };
   var __$$__store=function(){
      var __$$__name;
      for(__$$__name in __$$__globalScope){
         __$$__originalGlobalScope[__$$__name]=__$$__globalScope[__$$__name];
      }
   };
   /**
    * @param {string} code
    * @param {Object} mappedResults
    * @returns {unresolved}
    */
   this.eval=function(code, __$$__mappedResults){
      return eval(code);
   };
}