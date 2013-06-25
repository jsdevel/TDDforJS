/**
 * @constructor
 * @param {TDDforJSEvaluator} evaluator
 * @param {UnitTestReporter} reporter
 * @param {FileResolver} resolver
 */
function UnitTestRunner(
   evaluator,
   reporter,
   resolver
){
   /** @type {boolean} */
   var hasRun=false;

   /** @type {RegExp} */
   var reg_test=/^function\s+(test_[a-zA-Z0-9_$]+)/gm;
   /** @type {RegExp} */
   var reg_testAfter=/^function\s+after[^a-zA-Z0-9_$]+/m;
   /** @type {RegExp} */
   var reg_testBefore=/^function\s+before[^a-zA-Z0-9_$]+/m;

   this.run=function(){
      if(hasRun){
         return;
      }
      hasRun=true;

      reporter.getSourcesToTest().forEach(function(path){
         /** @type {string} */
         var src=resolver.getSource(path);
         /** @type {string} */
         var unit=resolver.getUnit(path);
         /** @type {Array} */
         var testMatch;
         /** @type {Array} */
         var tests = [];
         /** @type {string} */
         var taintedSrcError="";
         /** @type {string} */
         var taintedTestError="";
         /** @type {string} */
         var testString="";
         /** @type {boolean} */
         var hasAfter=false;
         /** @type {boolean} */
         var hasBefore=false;
         /** @type {Object} */
         var results={
            taintedSrcError:"",
            taintedTestError:"",
            tests:{},
            testsRun:0,
            testsPassed:0,
            testsFailed:0
         };

         if(taintedSrcError=tainted(src)){
            reporter.reportErrorInSource(path, taintedSrcError);
         }
         if(taintedTestError=tainted(src)){
            reporter.reportErrorInSource(path, taintedTestError);
         }
         if(taintedSrcError || taintedTestError){
            if(taintedSrcError){
               results.taintedSrcError=taintedSrcError;
            }
            if(taintedTestError){
               results.taintedTestError=taintedTestError;
            }
         } else {
            hasAfter=reg_testAfter.test(unit);
            hasBefore=reg_testBefore.test(unit);

            while(testMatch=reg_test.exec(unit)){
               tests.push(testMatch[1]);
            }

            if(tests.length){
               tests.forEach(function(test){
                  testString+=[
                     "mappedResults.testsRun++;",
                     "try{",
                     hasBefore?"before();":"",
                     test+"();",
                     hasAfter?"after();":"",
                     "mappedResults.tests['"+test+"']=true;",
                     "mappedResults.testsPassed++;",
                     "}catch(e){",
                     "mappedResults.tests['"+test+"']=e;",
                     "mappedResults.testsFailed++;",
                     "}"
                  ].join('\n');
               });
               testString = [
                  src,
                  ";(function(){",
                  unit,
                  ";(function(){",
                  testString,
                  "})();",
                  "})();"
               ].join('\n');
               evaluator.eval(testString, results);
            }
         }
         reporter.setTestResults(path, results);
      });
   };

   /**
    * Tests to see if any type / runtime errors exist in the code.
    * @param {string} code
    * @return {string} error message if one exists, empty string if all is well.
    */
   function tainted(code){
      try {
         eval(code);
         return "";
      } catch(e){
         return ""+e;
      }
   }
}