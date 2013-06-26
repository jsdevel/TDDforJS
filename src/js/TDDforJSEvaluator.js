/**
 * @constructor
 */
function TDDforJSEvaluator(){
   /**
    * @param {string} code
    * @param {Object} mappedResults
    * @returns {unresolved}
    */
   this.eval=function(code, __$$__mappedResults){
      return eval(code);
   };
}