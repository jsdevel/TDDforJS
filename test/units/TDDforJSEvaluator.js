var assert=require('assert');
/** @type {TDDforJSEvaluator} */
var evaluator;
var results;

function before(){
   evaluator = new TDDforJSEvaluator();
   results={
      stdOut:[],
      stdErr:[]
   };
}
function test___$$__eval_expects_code_to_be_a_non_string(){
   assert['throws'](function(){
      evaluator.__$$__eval("", results);
   });
   assert['throws'](function(){
      evaluator.__$$__eval(null, results);
   });
   assertNoGlobalVarsAcrossTests();
}
function test___$$__eval_expects___$$__testSuiteResults_to_be_an_instanceof_Object(){
   assert['throws'](function(){
      evaluator.__$$__eval("true", null);
   });
   assert['throws'](function(){
      evaluator.__$$__eval("true", "asdf");
   });
   assertNoGlobalVarsAcrossTests();
}
function test_the_Evaluator_should_not_be_overrideable_by_test_code(){
   evaluator.__$$__eval("TDDforJSEvaluator=void 0;", results);
   assert(TDDforJSEvaluator, "TDDforJSEvaluator was undefined.");
   assertNoGlobalVarsAcrossTests();
}
function test_globally_defined_variables_should_be_accessible(){
   evaluator.__$$__eval("asdf=5;", results);
   assert.equal(asdf, 5);
}
function test_check_early_script_error(){
   var hasError;
   hasError=evaluator.__$$__checkScriptForError("asdfasdfasdfasdf");
   assert(hasError, "check early returned false for an error.");
   hasError=evaluator.__$$__checkScriptForError("true");
   assert(!hasError, "check early works true for no error.");
}
function test_get_script_error(){
   var error;
   error=evaluator.__$$__getEarlyErrorFromScript("asdfasdfasdfasdf");
   assert(error instanceof Error, "no error was thrown on bad code.");
   error=evaluator.__$$__getEarlyErrorFromScript("true");
   assert(error instanceof Error, "no error was thrown on good code.");
}
function test_console_methods_should_be_overridden(){
   evaluator.__$$__eval(
      "console.log(5);console.info(2);console.dir({a:5});console.error(66);console.warn(666);",
      results
   );
   assert.equal(results.stdErr.length, 2, "stdErr didn't get populated accordingly.");
   assert.equal(results.stdOut.length, 3, "stdOut didn't get populated accordingly.");

   assert.equal(results.stdErr[0].type, "error", "the type of console.error isn't set correctly.");
   assert.equal(results.stdErr[1].type, "warn", "the type of console.warn isn't set correctly.");
   assert.equal(results.stdOut[0].type, "log", "the type of console.log isn't set correctly.");
   assert.equal(results.stdOut[1].type, "info", "the type of console.info isn't set correctly.");
   assert.equal(results.stdOut[2].type, "dir", "the type of console.dir isn't set correctly.");

   assert.equal(results.stdErr[0].arguments[0], 66, "the type of console.error isn't set correctly.");
   assert.equal(results.stdErr[1].arguments[0], 666, "the type of console.warn isn't set correctly.");
   assert.equal(results.stdOut[0].arguments[0], 5, "the type of console.log isn't set correctly.");
   assert.equal(results.stdOut[1].arguments[0], 2, "the type of console.info isn't set correctly.");
   assert.deepEqual(results.stdOut[2].arguments[0], {a:5}, "the type of console.dir isn't set correctly.");
}

function assertNoGlobalVarsAcrossTests(){
   assert(typeof asdf === 'undefined', "global vars should not cross tests.");
}