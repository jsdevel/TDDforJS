module.exports = {
   'testCase':testCase,
   'test':test
};

/** @const @type {string} */
var FAIL = "  FAIL | ";
/** @const @type {string} */
var PASS = "  PASS | ";
/** @const @type {string} */
var HR = "=================";
/** @const @type {string} */
var beforeRunMsg          = HR+'\nTestCase: "@"\n'+HR;
/** @const @type {string} */
var afterRunErrorMsg      = 'FAILED    SCRIPT "@"';
/** @const @type {string} */
var numberOfSuccessesMsg  = 'PASSES   : @';
/** @const @type {string} */
var numberOfFailuresMsg   = 'FAILURES : @';
/** @type {Array} */
var tests;
/** @type {boolean} */
var _showResults=true;


/**
 * @param {string} description
 * @param {function} fn
 * @param {boolean} showResults
 */
function testCase(description, fn, showResults){
   var results;
   tests = [];
   if(typeof showResults === 'boolean'){
      _showResults = showResults;
   }

   log(beforeRunMsg.replace("@", description));

   try {
      fn();
      if(tests.length){
         results = getTestResults(tests);
         log(numberOfSuccessesMsg.replace("@", results.successes));
         log(numberOfFailuresMsg.replace("@", results.failures));
      } else {
         log("No tests found.");
      }
   } catch (e) {
      log(afterRunErrorMsg.replace("@", description));
      log("For the following reason: "+e);
   }
   tests=void 0;
   _showResults = true;
}

/**
 * @param {string} description
 * @param {function} fn
 * @param {boolean} verbose
 * @param {array|undefined} tests
 */
function test(description, fn, verbose){
   if(tests instanceof Array){
      tests.push({
         description:description,
         fn:fn,
         verbose:verbose
      });
   } else {
      runTest(description, fn, verbose);
   }
}

/**
 * @param {string} description
 * @param {function} fn
 * @param {boolean} verbose
 */
function runTest(description, fn, verbose){
   var fail;
   try {
      fn();
   } catch (e){
      fail = FAIL + description;
      if(verbose){
         throw  fail + "\n"+e;
      } else {
         throw fail; 
      }
   }
}

/**
 * @param {Array} tests
 * @return {object}
 */
function getTestResults(tests){
   var results = {
      failures:0,
      successes:0
   };
   var len;
   var i;
   var test;
   var verbose;
   var description;
   if(tests instanceof Array){
      len = tests.length;
      i=0;
      for(;i<len;i++){
         test = tests[i];
         verbose = test.verbose;
         description = test.description;
         try {
            runTest(description, test.fn, verbose);
            showResult(PASS+description);
            results.successes++;
         } catch (e) {
            showResult(e);
            results.failures++;
         }
      }
   }
   return results;
}

function log(a){
   console.log(a);
}

function showResult(result){
   if(_showResults){
      log(result);
   }
}
