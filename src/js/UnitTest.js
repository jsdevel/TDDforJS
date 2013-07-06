/**
 * @constructor
 * @param {string} relativePath relative to both unit and src dirs.
 * @param {UnitTestFileResolver} fileResolver
 * @param {Object} fsModule
 * @param {TDDforJSEvaluator} evaluator
 * @param {TestAnalyzer} analyzer
 */
function UnitTest(
   relativePath,
   fileResolver,
   fsModule,
   evaluator,
   analyzer
){
   if(typeof relativePath !== 'string' || !relativePath){
      throw "relativePath must be a non empty string.";
   }
   if(
      !(fileResolver instanceof Object) ||
      typeof fileResolver.getFilePaths !== 'function'
   ){
      throw "fileResolver wasn't a resolver.";
   }
   if(
      !(fsModule instanceof Object) ||
      typeof fsModule.readFileSync !== 'function'
   ){
      throw "fsModule wasn't an fs module.";
   }
   if(
      !(evaluator instanceof Object) ||
      typeof evaluator.eval !== 'function'
   ){
      throw "evaluator wasn't a TDDforJSEvaluator.";
   }
   if(
      !(analyzer instanceof Object) ||
      typeof analyzer.analyzeTestSuite !== 'function'
   ){
      throw "analyzer wasn't a TestAnalyzer .";
   }

   var results;
   this.getResults=function(){
      var tempResults;
      var src;
      var unit;
      var srcPath;
      var unitPath;
      var suite;
      var analysisResult;
      var sourceErrors;
      if(!results){
         sourceErrors=[];
         tempResults = fileResolver.getFilePaths(relativePath);
         srcPath=tempResults.srcPath;
         unitPath=tempResults.unitPath;
         results={
            setup:{
               srcPath:srcPath,
               unitPath:unitPath,
               errors:[].concat(tempResults.errors)
            },
            source:{
               errors:sourceErrors
            },
            suite:{
               run:0,
               tests:0,
               failures:0,
               errors:0,
               testCases:[]
            }
         };
         if(srcPath && unitPath){
            src=fsModule.readFileSync(tempResults.srcPath, "UTF8");
            if(evaluator.__$$__checkScriptForError(src)){
               sourceErrors.push(
                  "The following error occurred while dry running "+
                  tempResults.srcPath+": "+
                  evaluator.__$$__getEarlyErrorFromScript(src)
               );
            }
            unit=fsModule.readFileSync(tempResults.unitPath, "UTF8");
            analysisResult=results.suite=analyzer.analyzeTestSuite(unit);
         } else {
            if(!srcPath){
               results.setup.errors.push(
                  "No source"
               );
            }
         }
      }
      return results;
   };
}