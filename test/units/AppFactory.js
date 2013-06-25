var factory;
function before(){
   factory = new AppFactory();
   UnitTestReporter = function(){};
}
function after(){
}

function test_UnitTestReporter_should_be_creatable(){
   if(!(factory.makeUnitTestReporter() instanceof UnitTestReporter)){
      throw 5
   }
}