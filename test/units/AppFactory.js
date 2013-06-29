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
   throw "asdf";
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