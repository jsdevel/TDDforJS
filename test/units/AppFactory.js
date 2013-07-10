var assert = require('assert');
var factory;
function before(){
   factory = new AppFactory();
}
function after(){
}

function test_ImportResolver_should_be_creatable(){
   ImportResolver = function(){};
   if(!(factory.makeImportResolver() instanceof ImportResolver)){
      throw "ImportResolver wasn't created.";
   }
}
function test_TDDforJSEvaluator_should_be_creatable(){
   TDDforJSEvaluator = function(){};
   if(!(factory.makeTDDforJSEvaluator() instanceof TDDforJSEvaluator)){
      throw "TDDforJSEvaluator wasn't created.";
   }
}
function test_UnitTestResolver_should_be_creatable(){
   UnitTestResolver = function(){};
   if(!(factory.makeUnitTestResolver() instanceof UnitTestResolver)){
      throw "UnitTestResolver wasn't created.";
   }
}
function test_UnitTestReporter_should_be_creatable(){
   UnitTestReporter = function(){};
   if(!(factory.makeUnitTestReporter() instanceof UnitTestReporter)){
      throw "UnitTestReporter wasn't created.";
   }
}
function test_UnitTestRunner_should_be_creatable(){
   UnitTestRunner = function(){};
   if(!(factory.makeUnitTestRunner() instanceof UnitTestRunner)){
      throw "UnitTestRunner wasn't created.";
   }
}
function test_TestSuite_should_be_creatable(){
   TestSuite = function(){};
   if(!(factory.makeTestSuite() instanceof TestSuite)){
      assert.fail("TestSuite wasn't created.");
   }
}
function test_TestSuites_should_be_creatable(){
   TestSuites = function(){};
   if(!(factory.makeTestSuites() instanceof TestSuites)){
      assert.fail("TestSuites wasn't created.");
   }
}
function test_SuiteFileResolver_should_be_creatable(){
   SuiteFileResolver = function(){};
   if(!(factory.makeSuiteFileResolver() instanceof SuiteFileResolver)){
      assert.fail("SuiteFileResolver wasn't created.");
   }
}