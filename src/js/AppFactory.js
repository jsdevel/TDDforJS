/**
 * @constructor
 * @param {Object} fsModule
 * @param {Object} pathModule
 * @param {string} hostname
 */
function AppFactory(
   fsModule,
   pathModule,
   hostname
){
   var instance = this;

   /**
    * @param {string} sourceBase
    * @param {string} testBase
    * @return {ImportResolver}
    */
   this.makeImportResolver=function(sourceBase, testBase){
      return new ImportResolver(fsModule, pathModule, sourceBase, testBase);
   };

   /** @return {TDDforJSEvaluator} */
   this.makeTDDforJSEvaluator=function(){
      return new TDDforJSEvaluator();
   };

   /**
    * @param {string} sourcePath
    * @param {string} unitPath
    * @return {TDDforJSEvaluator}
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
    * @param {TDDforJSEvaluator} evaluator
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

   /**
    * @param {string} className
    * @param {string} hostname
    * @param {number} id
    * @param {string} source
    * @returns {TestSuite}
    */
   this.makeTestSuite=function(
      className,
      hostname,
      id,
      source
   ){
      return new TestSuite(
         "__$$__",
         className,
         hostname,
         id,
         source
      );
   };

   /**
    * @param {Array.<string>} files
    * @param {SuiteFileResolver} fileResolver
    * @param {ImportResolver} importResolver
    * @param {TDDforJSEvaluator} evaluator
    * @param {function(string): string} extraSourceFn
    * @returns {TestSuites}
    */
   this.makeTestSuites=function(
      files,
      fileResolver,
      importResolver,
      evaluator,
      extraSourceFn
   ){
      return new TestSuites(
            files,
            instance,
            hostname,
            fileResolver,
            importResolver,
            pathModule,
            evaluator,
            extraSourceFn
      );
   };

   /**
    * @param {string} baseDir
    * @returns {SuiteFileResolver}
    */
   this.makeSuiteFileResolver=function(baseDir){
      return new SuiteFileResolver(
         fsModule,
         pathModule,
         baseDir
      );
   };
}