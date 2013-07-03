/**
 * @constructor
 * @param {Object} fsModule
 * @param {Object} pathModule
 */
function AppFactory(fsModule, pathModule){

   /**
    * @param {string} sourceBase
    * @param {string} testBase
    * @return {ImportResolver}
    */
   this.makeImportResolver=function(sourceBase, testBase){
      return new ImportResolver(fsModule, pathModule, sourceBase, testBase);
   };

   /** @return {TDDEvaluator} */
   this.makeTDDEvaluator=function(){
      return new TDDEvaluator();
   };

   /**
    * @param {string} sourcePath
    * @param {string} unitPath
    * @return {TDDEvaluator}
    */
   this.makeUnitTestResolver=function(sourcePath, unitPath){
      return new UnitTestResolver(
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
    * @param {TDDEvaluator} evaluator
    * @param {UnitTestReporter} reporter
    * @param {UnitTestResolver} unitTestResolver
    * @param {ImportResolver} importResolver
    * @returns {UnitTestRunner}
    */
   this.makeUnitTestRunner=function(
      evaluator,
      reporter,
      unitTestResolver,
      importResolver
   ){
      return new UnitTestRunner(
         evaluator,
         reporter,
         unitTestResolver,
         importResolver
      );
   };
}