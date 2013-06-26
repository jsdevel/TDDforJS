//import lib/jsmockito

/** @type {TDDforJSEvaluator} */
var evaluator;

function before(){
   evaluator = new TDDforJSEvaluator();
}

function test_mappedResults_should_not_be_accessible(){
   evaluator.eval("mappedResultsExisted=typeof mappedResults!== 'undefined';", {});
   if(mappedResultsExisted){
      throw "mappedResults was accessible.";
   }
}
function test_globally_defined_variables_should_be_accessible(){
   evaluator.eval("asdf=5;");
   assert.equal(asdf, 5);
}
function test_previously_defined_global_variables_should_not_be_accessible(){
   assert(typeof asdf === 'undefined');
}