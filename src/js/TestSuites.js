/**
 * @constructor
 * @param {Array.<string>} files
 * @param {AppFactory} appFactory
 * @param {string} hostname
 * @param {SuiteFileResolver} fileResolver
 * @param {ImportResolver} importResolver
 * @param {Object} pathModule
 * @param {TDDforJSEvaluator} evaluator
 * @param {function(string):string} extraSourceFn Receives a file name for each
 * test suite in the files array.  The returned string is appended to the test
 * suite, unless the function throws an error.  Any errors thrown from this
 * function fail the test suite and will be output with the test suite results.
 */
function TestSuites(
   files,
   appFactory,
   hostname,
   fileResolver,
   importResolver,
   pathModule,
   evaluator,
   extraSourceFn
){
   var results;

   if(!(files instanceof Array)){
      throw new Error("files must be an array.");
   }
   if(
      !(appFactory instanceof Object) ||
      appFactory.constructor.name !== 'AppFactory'
   ){
      throw new Error("appFactory must be an instanceof AppFactory.");
   }
   if(!hostname || typeof hostname !== 'string'){
      throw new Error("hostname must be a non empty string.");
   }
   if(
      !(fileResolver instanceof Object) ||
      fileResolver.constructor.name !== 'SuiteFileResolver'
   ){
      throw new Error("fileResolver must be an instanceof SuiteFileResolver.");
   }
   if(
      !(importResolver instanceof Object) ||
      importResolver.constructor.name !== 'ImportResolver'
   ){
      throw new Error("importResolver must be an instanceof ImportResolver.");
   }
   if(
      !(pathModule instanceof Object) ||
      typeof pathModule.basename !== 'function'
   ){
      throw new Error("pathModule must be an instanceof the path module.");
   }
   if(
      !(evaluator instanceof Object) ||
      typeof evaluator.__$$__eval !== 'function'
   ){
      throw new Error("evaluator must be an instanceof TDDforJSEvaluator.");
   }
   if(typeof extraSourceFn !== 'function'){
      throw new Error("extraSourceFn must be a callback.");
   }

   /**
    * Returns the results of running all the TestSuites.
    *
    * @returns {Object}
    */
   this.getResults=function(){
      if(!results){
         results={
            total:{
               tests:0,
               failures:0,
               errors:0
            },
            suites:[]
         };
         files.forEach(function(file, index){
            var extension=pathModule.extname(file);
            var filename=pathModule.basename(file, extension);
            var path=file.substring(
               0,
               file.length-
                  extension.length-
                  filename.length-
                  pathModule.sep.length
            );
            var className="";
            var parts=path?path.split('/'):[];
            var suite;
            var source=fileResolver.getSuite(file);
            var imports=importResolver.getImportsFrom(source);
            var suiteResults={
               stdErr:[],
               stdOut:[]
            };
            var errors=[];
            var extraSource;

            parts.forEach(function(part){
               className+=cleanPackagePart(part)+".";
            });
            className+=cleanPackagePart(filename);

            suite=appFactory.makeTestSuite(
               className,
               hostname,
               index,
               source
            );

            try {
               extraSource=extraSourceFn(file);
               if(typeof extraSource !== 'string'){
                  extraSource = "";
               }
            } catch(e){
               errors.push(e);
            }
            if(evaluator.__$$__checkScriptForError(imports)){
               errors.push(evaluator.__$$__getEarlyErrorFromScript(imports));
            }

            if(evaluator.__$$__checkScriptForError(source)){
               errors.push(evaluator.__$$__getEarlyErrorFromScript(source));
            }

            if(!errors.length){
               evaluator.__$$__eval(
                  [
                     "!function(){",
                     extraSource,
                     "!function(){",
                     imports,
                     suite.toString(),
                     "}();",
                     "}();"
                  ].join('\n'),
                  suiteResults,
                  appFactory.makeTDD()
               );
            } else {
               suiteResults.testCases=[];
               suiteResults.name=suite.getSimpleClassName();
               suiteResults.package=suite.getPackage();
               suiteResults.tests=suite.numberOfTestCases();
               suiteResults.hostname=hostname;
               suiteResults.id=index;
               suiteResults.errors=suite.numberOfTestCases();
               suiteResults.failures=0;
               suiteResults.time=0;
               suiteResults.timestamp=new Date().toISOString();

               suite.getTestCases().forEach(function(testCase){
                  var testCaseResults={
                     name:testCase,
                     className:suite.getClassName(),
                     time:0,
                     errors:[].concat(errors)
                  };
                  suiteResults.testCases.push(testCaseResults);
               });
            }
            results.total.failures+=suiteResults.failures;
            results.total.errors+=suiteResults.errors;
            results.total.tests+=suiteResults.tests;
            results.suites.push(suiteResults);
         });
      }
      return results;
   };

   function cleanPackagePart(part){
      if(/^[^a-z]/i.test(part)){
         part="_"+part;
      }
      while(/[^a-z0-9_]/i.test(part)){
         part=part.replace(/([^a-z0-9_])(.)/g, function(match, g1, g2){
            return g2.toUpperCase();
         });
      }
      return part;
   }
}