module.exports = {
   'testCase':testCase,
   'test':test
};

/** @const @type {string} */
var INDENT = "   ";
/** @const @type {string} */
var GREEN = "\u001b[32m";
/** @const @type {string} */
var RED = "\u001b[31m";
/** @const @type {string} */
var RESET = "\u001b[0m";
/** @const @type {string} */
var FAIL = INDENT+RED+"FAIL | ";
/** @const @type {string} */
var PASS = INDENT+GREEN+"PASS | ";
/** @const @type {string} */
var HR = "=================";
/** @const @type {string} */
var beforeRunMsg          = HR+'\nTestCase: "@"\n'+HR;
/** @const @type {string} */
var afterRunErrorMsg      = INDENT+RED+'FAILED    SCRIPT "@"';
/** @const @type {string} */
var numberOfSuccessesMsg  = INDENT+GREEN+'PASSES   : @';
/** @const @type {string} */
var numberOfFailuresMsg   = INDENT+RED+'FAILURES : @';
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
         log(RESET+INDENT+HR);
         log(numberOfSuccessesMsg.replace("@", results.successes)+RESET);
         if(results.failures > 0){
            log(numberOfFailuresMsg.replace("@", results.failures)+RESET);
         }
      } else {
         log("No tests found.");
      }
   } catch (e) {
      log(afterRunErrorMsg.replace("@", description)+RESET);
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
