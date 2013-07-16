var assert = require('assert');
var factory;
function before(){
   factory = new AppFactory();
}
function after(){
}

//Test
function ImportResolver_should_be_creatable(){
   ImportResolver = function(){};
   if(!(factory.makeImportResolver() instanceof ImportResolver)){
      throw "ImportResolver wasn't created.";
   }
}
//Test
function TDDforJSEvaluator_should_be_creatable(){
   TDDforJSEvaluator = function(){};
   if(!(factory.makeTDDforJSEvaluator() instanceof TDDforJSEvaluator)){
      throw "TDDforJSEvaluator wasn't created.";
   }
}
//Test
function TestSuite_should_be_creatable(){
   TestSuite = function(){};
   if(!(factory.makeTestSuite() instanceof TestSuite)){
      assert.fail("TestSuite wasn't created.");
   }
}
//Test
function TestSuites_should_be_creatable(){
   TestSuites = function(){};
   if(!(factory.makeTestSuites() instanceof TestSuites)){
      assert.fail("TestSuites wasn't created.");
   }
}
//Test
function SuiteFileResolver_should_be_creatable(){
   SuiteFileResolver = function(){};
   if(!(factory.makeSuiteFileResolver() instanceof SuiteFileResolver)){
      assert.fail("SuiteFileResolver wasn't created.");
   }
}
//Test
function TDD_should_be_createble(){
   TDD = function(){};
   if(!(factory.makeTDD() instanceof TDD)){
      assert.fail("TDD wasn't created.");
   }
}