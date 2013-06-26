/**
 * @constructor
 * @param {Array.<string>} sources
 * @param {Array.<string>} units
 */
function UnitTestReporter(sources, units){
   /** @type {boolean} */
   var isAnalyzed=false;
   /** @type {boolean} */
   var isCoverageMapFilled=false;
   /** @type {boolean} */
   var hasMissingTests=false;
   /** @enum {string} */
   var coverageMap = {};
   /** @type {Array.<string>} */
   var unitTestsBackedBySource = [];
   /** @type {Array.<string>} */
   var unitTestsNotBackedBySource = [];
   /** @type {number} */
   var numberOfSources=0;
   /** @type {Object} */
   var sourceErrors={};
   /** @type {Object} */
   var testErrors={};
   /** @type {Object} */
   var testResults={};
   /** @type {number} */
   var testsRun=0;
   /** @type {number} */
   var testsFailed=0;
   /** @type {number} */
   var testsPassed=0;

   /**
    * @returns {number}
    */
   this.getNumberOfTestSuites=function(){
      fillCoverageMap();
      return unitTestsBackedBySource.length;
   };

   /**
    * @returns {number}
    */
   this.getNumberOfTestsFailed=function(){
      analyzeOnce();
      return testsFailed;
   };

   /**
    * @returns {number}
    */
   this.getNumberOfTestsPassed=function(){
      analyzeOnce();
      return testsPassed;
   };

   /**
    * @returns {number}
    */
   this.getNumberOfTestsRun=function(){
      analyzeOnce();
      return testsRun;
   };

   /**
    * @returns {number}
    */
   this.getPercentUnitTested=function(){
      fillCoverageMap();
      return (unitTestsBackedBySource.length/numberOfSources)*100||0;
   };
   /**
    *
    * @returns {Object}  This is a reference.  Modify it at your own peril.
    */
   this.getResults=function(){
      return testResults;
   };
   /**
    * @returns {Array}
    */
   this.getSourcesToTest=function(){
      fillCoverageMap();
      return [].concat(unitTestsBackedBySource);
   };
   /**
    * @returns {boolean}
    */
   this.hasMissingTests=function(){
      fillCoverageMap();
      return hasMissingTests;
   };

   /**
    * @param {string} source
    * @param {string} error
    */
   this.reportErrorInSource=function(source, error){
      sourceErrors[source] = error;
   };

   /**
    * @param {string} test
    * @param {string} error
    */
   this.reportErrorInTest=function(test, error){
      testErrors[test] = error;
   };

   this.setTestResults=function(test, results){
      testResults[test]=results;
   };

   /**
    * This should be cached to only run once.  It sets the internal state of
    * the Reporter.
    */
   function analyzeOnce(){
      fillCoverageMap();
      if(!isAnalyzed){
         isAnalyzed=true;
         unitTestsBackedBySource.forEach(function(v1){
            var results=testResults[v1];
            testsRun += results.testsRun;
            testsFailed += results.testsFailed;
            testsPassed += results.testsPassed;
         });
      }
   }

   function fillCoverageMap(){
      var source;
      if(!isCoverageMapFilled){
         isCoverageMapFilled=true;
         numberOfSources=sources.length;
         sources.forEach(function(v){
            coverageMap[v] = false;
         });
         units.forEach(function(v){
            if(v in coverageMap){
               coverageMap[v] = true;
               unitTestsBackedBySource.push(v);
            }
            if(!(v in coverageMap)){
               unitTestsNotBackedBySource.push(v);
            }
         });
         for(source in coverageMap){
            if(!coverageMap[source]){
               hasMissingTests=true;
               break;
            }
         }
      }
   }
}