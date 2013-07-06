/**
 * This analyzes test code, looking for test cases to run, imports defined, and
 * any before or after methods that need to be run.
 *
 * @constructor
 */
function TestAnalyzer(){

   /** @type {RegExp} */
   var reg_test=/^\/\/Test[^\r\n]*\r?\nfunction\s+([a-zA-Z0-9_$]+)/gm;
   /** @type {RegExp} */
   var reg_testAfter=/^function\s+after[^a-zA-Z0-9_$]+/m;
   /** @type {RegExp} */
   var reg_testBefore=/^function\s+before[^a-zA-Z0-9_$]+/m;
   var reg_blockComments=/\/\*(?:(?!\*\/)[\s\S])*\*\//g;

   /**
    * Pass in a string representing a TestSuite to obtain information, such as
    * the number of tests defined, etc.
    *
    * @param {string} suite
    * @returns {Object}
    */
   this.analyzeTestSuite=function(suite){
      var tests = [];
      var hasAfter=false;
      var hasBefore=false;
      var testMatch;


      if(suite && typeof suite === 'string'){
         suite=suite.replace(reg_blockComments, "");
         hasAfter=reg_testAfter.test(suite);
         hasBefore=reg_testBefore.test(suite);
         while(testMatch=reg_test.exec(suite)){
            tests.push({
               name:testMatch[1],
               time:0,
               pass:true,
               error:false,
               skipped:false
            });
         }
      }

      return {
         tests:tests,
         hasBefore:hasBefore,
         hasAfter:hasAfter
      };
   };
}