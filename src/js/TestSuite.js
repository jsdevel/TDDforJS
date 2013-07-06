/**
 * This analyzes test code, looking for test cases to run, imports defined, and
 * any before or after methods that need to be run.
 *
 * @constructor
 * @param {string} source
 */
function TestSuite(
   source
){
   /** @type {RegExp} */
   var reg_test=/^\/\/Test[^\r\n]*\r?\nfunction\s+([a-zA-Z0-9_$]+)/gm;
   /** @type {RegExp} */
   var reg_testAfter=/^function\s+after[^a-zA-Z0-9_$]+/m;
   /** @type {RegExp} */
   var reg_testBefore=/^function\s+before[^a-zA-Z0-9_$]+/m;
   /** @type {RegExp} */
   var reg_blockComments=/\/\*(?:(?!\*\/)[\s\S])*\*\//g;

   //INTERNAL STATE
   /** @type {boolean} */
   var isAnalyzed=false;

   /** @type {boolean} */
   var hasAfter=false;
   /** @type {boolean} */
   var hasBefore=false;
   var testCases=[];

   if(typeof source !== 'string'){
      throw "source must be a string representing the contents of a suite.";
   }

   /**
    * Inform the caller if the testSuite had an "after" method defined.
    * @returns {boolean}
    */
   this.hasAfter=function(){
      analyzeTestSuite();
      return hasAfter;
   };

   /**
    * Inform the caller if the testSuite had a "before" method defined.
    * @returns {boolean}
    */
   this.hasBefore=function(){
      analyzeTestSuite();
      return hasBefore;
   };

   /**
    * Inform the caller if the testSuite had test cases defined.
    * @returns {boolean}
    */
   this.hasTestCases=function(){
      analyzeTestSuite();
      return !!testCases.length;
   };

   /**
    * Inform the caller how many test cases the suite has.
    * @returns {number}
    */
   this.numberOfTestCases=function(){
      analyzeTestSuite();
      return testCases.length;
   };

   /**
    * Returns the test cases.  Each test case has a name and source to execute
    * against the source of the test suite.
    *
    * @returns {Array.<Object>}
    */
   this.getTestCases=function(){
      analyzeTestSuite();
      return [].concat(testCases);
   };

   /**
    * Sets up the internal state of this object appropriately.
    */
   function analyzeTestSuite(){
      var sourceWithoutComments;
      var testMatch;
      var testCaseName;
      if(!isAnalyzed){
         if(source && typeof source === 'string'){
            sourceWithoutComments=source.replace(reg_blockComments, "");
            hasAfter=reg_testAfter.test(sourceWithoutComments);
            hasBefore=reg_testBefore.test(sourceWithoutComments);
            while(testMatch=reg_test.exec(sourceWithoutComments)){
               testCaseName=testMatch[1];
               testCases.push({
                  name:testCaseName,
                  source:[
                     hasBefore?"before();":"",
                     testCaseName+"();",
                     hasAfter?"after();":""
                  ].join('\n')
               });
            }
         }
         isAnalyzed=true;
      }
   };
}