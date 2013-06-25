/**
 * @constructor
 * @param {Object} fsModule
 * @param {Object} pathModule
 */
function AppFactory(fsModule, pathModule){

   /** @return {TDDforJSEvaluator} */
   this.makeTDDforJSEvaluator=function(){
      return new TDDforJSEvaluator();
   };

   /**
    * @param {string} sourcePath
    * @param {string} unitPath
    * @return {TDDforJSEvaluator}
    */
   this.makeFileResolver=function(sourcePath, unitPath){
      return new FileResolver(
         fsModule,
         pathModule,
         sourcePath,
         unitPath
      );
   };

   /**
    * @param {Array} sources
    * @param {Array} units
    * @return {UnitTestReporter}
    */
   this.makeUnitTestReporter=function(sources, units){
      return new UnitTestReporter(sources, units);
   };

   /**
    * @param {TDDforJSEvaluator} evaluator
    * @param {UnitTestReporter} reporter
    * @param {FileResolver} resolver
    * @returns {UnitTestRunner}
    */
   this.makeUnitTestRunner=function(evaluator, reporter, resolver){
      return new UnitTestRunner(evaluator, reporter, resolver);
   };
}