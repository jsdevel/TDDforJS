/**
 * @constructor
 */
function TDDforJSEvaluator(){
   /**
    * @param {string} code
    * @param {Object} mappedResults
    * @returns {unresolved}
    */
   this.eval=function(code, mappedResults){
      return eval(code);
   };
}