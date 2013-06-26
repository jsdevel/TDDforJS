var factory;
function before(){
   factory = new AppFactory();
}
function after(){
}

function test_TDDforJSEvaluator_should_be_creatable(){
   TDDforJSEvaluator = function(){};
   if(!(factory.makeTDDforJSEvaluator() instanceof TDDforJSEvaluator)){
      throw 5
   }
}
function test_FileResolver_should_be_creatable(){
   FileResolver = function(){};
   if(!(factory.makeFileResolver() instanceof FileResolver)){
      throw 5
   }
}
function test_UnitTestReporter_should_be_creatable(){
   UnitTestReporter = function(){};
   if(!(factory.makeUnitTestReporter() instanceof UnitTestReporter)){
      throw 5
   }
}
function test_UnitTestRunner_should_be_creatable(){
   UnitTestRunner = function(){};
   if(!(factory.makeUnitTestRunner() instanceof UnitTestRunner)){
      throw 5
   }
}