/**
 * @constructor
 * @param {TDDforJSEvaluator} evaluator
 * @param {UnitTestReporter} reporter
 * @param {UnitTestResolver} unitTestResolver
 * @param {ImportResolver} importResolver
 */
function UnitTestRunner(
   evaluator,
   reporter,
   unitTestResolver,
   importResolver
){
   /** @type {boolean} */
   var hasRun=false;

   /** @type {RegExp} */
   var reg_imports=/^\/\/import\s+(.+)/gm;
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
         var src=unitTestResolver.getSource(path.replace(/\./g, '/')+".js");
         /** @type {string} */
         var unit=unitTestResolver.getUnit(path.replace(/\./g, '/')+".js");
         /** @type {string} */
         var imports="";
         /** @type {Array} */
         var importMatch;
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
         if(taintedTestError=tainted(unit)){
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
            while(importMatch=reg_imports.exec(unit)){
               imports+=importResolver.resolve(importMatch[1]);
            }

            if(tests.length){
               tests.forEach(function(test){
                  testString+=[
                     "__$$__mappedResults.testsRun++;",
                     "__$$__store();",
                     "try{",
                     hasBefore?"before();":"",
                     test+"();",
                     hasAfter?"after();":"",
                     "__$$__mappedResults.tests['"+test+"']=true;",
                     "__$$__mappedResults.testsPassed++;",
                     "}catch(e){",
                     "if(!(e instanceof Error)){",
                     "e=new __$$__RunTimeError(e);",
                     "}",
                     "__$$__mappedResults.tests['"+test+"']=e;",
                     "__$$__mappedResults.testsFailed++;",
                     "}",
                     "__$$__reset();"
                  ].join('\n');
               });
               testString = [
                  src,
                  ";(function(){",
                  imports,
                  ";(function(){",
                  unit,
                  ";(function(){",
                  testString,
                  "})();",
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