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