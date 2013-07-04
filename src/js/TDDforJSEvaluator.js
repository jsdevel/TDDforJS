/**
 * @constructor
 */
function TDDforJSEvaluator(){
   //prevent the constructor from being overridden;
   var TDDforJSEvaluator;
   var __$$__instance=this;
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
    * @param {Object} __$$__mappedResults
    * @returns {unresolved}
    */
   this.__$$__eval=function(code, __$$__mappedResults){
      return eval(code);
   };

   /**
    * Checks a script to see if it has errors.
    * @param {string} code
    * @returns {Boolean}
    */
   this.__$$__checkScriptForError=function(code){
      try {
         eval(code);
         return false;
      } catch(e){
         return true;
      }
   };

   /**
    * Returns an error from a bad script.
    * @param {string} code
    * @returns {Error}
    */
   this.__$$__getEarlyErrorFromScript=function(code){
      try {
         eval(code);
         if_you_see_this_error_it_means_TDD_is_flawed_please_report_it;
      } catch(e){
         return e;
      }
   };
}