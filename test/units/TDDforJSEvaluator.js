var assert=require('assert');
/** @type {TDDforJSEvaluator} */
var evaluator;

function before(){
   evaluator = new TDDforJSEvaluator();
}

function test_the_Evaluator_should_not_be_overrideable_by_test_code(){
   evaluator.__$$__eval("TDDforJSEvaluator=void 0;", {});
   assert(TDDforJSEvaluator, "TDDforJSEvaluator was undefined.");
   assertNoGlobalVarsAcrossTests();
}
function test_mappedResults_should_not_be_accessible(){
   evaluator.__$$__eval("mappedResultsExisted=typeof mappedResults!== 'undefined';", {});
   if(mappedResultsExisted){
      throw "mappedResults was accessible.";
   }
   assertNoGlobalVarsAcrossTests();
}
function test_globally_defined_variables_should_be_accessible(){
   evaluator.__$$__eval("asdf=5;");
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

function assertNoGlobalVarsAcrossTests(){
   assert(typeof asdf === 'undefined', "global vars should not cross tests.");
}