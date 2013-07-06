var assert = require('assert');
var test;
var results;
var getFilePathsFn;
var readFileSyncFn;
var evalFn;
var analyzeTestSuiteFn;
var resolver={getFilePaths:function(path){return getFilePathsFn(path);}};
var fsModule={
   readFileSync:function(path, encoding){
      return readFileSyncFn(path, encoding);
   }
};
var evaluator={
   eval:function(code){return evalFn(code);},
   __$$__checkScriptForError:function(script){return false;},
   __$$__getEarlyErrorFromScript:function(script){return "asdf";}
};
var analyzer={
   analyzeTestSuite:function(suite){
      return analyzeTestSuiteFn(suite);
   }
};

function before(){
   getFilePathsFn=function(path){
      return {
         srcPath:"src/"+path,
         unitPath:"unit/"+path,
         errors:[]
      };
   };
   readFileSyncFn=function(){};
   evalFn=function(code){};
   analyzeTestSuiteFn=function(suite){return {};};
}

function test_relative_path_must_be_required(){
   assert['throws'](function(){
      test = new UnitTest(null, resolver, fsModule, evaluator, analyzer);
   }, "relativePath should be required.");
}
function test_resolver_must_be_required(){
   assert['throws'](function(){
      test = new UnitTest("asdf", null, fsModule, evaluator, analyzer);
   }, "resolver should be required.");
}
function test_fsModule_must_be_required(){
   assert['throws'](function(){
      test = new UnitTest("asdf", resolver, null, evaluator, analyzer);
   }, "fsModule should be required.");
}
function test_evaluator_must_be_required(){
   assert['throws'](function(){
      test = new UnitTest("asdf", resolver, fsModule, null, analyzer);
   }, "evaluator should be required.");
}
function test_evaluator_must_be_required(){
   assert['throws'](function(){
      test = new UnitTest("asdf", resolver, fsModule, evaluator, null);
   }, "analyzer should be required.");
}
function test_construction_with_good_params_should_be_OK(){
   new UnitTest("asdf", resolver, fsModule, evaluator, analyzer);
}
function test_test_should_be_skipped_if_errors_exist(){
   test=new UnitTest("asdf", resolver, fsModule, evaluator, analyzer);
   getFilePathsFn=function(path){
      return {
         srcPath:"asdf",
         unitPath:"asdf",
         errors:['no source']
      };
   };
   results=test.getResults();
   assert(results.setup.errors.length, "no import errors defined.");
}
function test_test_should_not_be_skipped_if_errors_do_not_exist(){
   test=new UnitTest("asdf", resolver, fsModule, evaluator, analyzer);
   getFilePathsFn=function(path){
      return {
         srcPath:"asdf",
         unitPath:"asdf",
         errors:[]
      };
   };
   results=test.getResults();
   assert(!results.setup.errors.length, "import errors defined.");
}
function test_the_correct_test_analysis_should_be_published(){
   var suite;
   test=new UnitTest("asdf", resolver, fsModule, evaluator, analyzer);
   analyzeTestSuiteFn=function(suite){
      return {
         hasAfter:true,
         hasBefore:true,
         tests:["test_foo"]
      };
   };
   results=test.getResults();
   suite=results.suite;
   assert.equal(suite.tests.length, 1, "tests aren't counted properly.");
   assert(suite.hasAfter, "hasAfter didn't get published.");
   assert(suite.hasBefore, "hasBefore didn't get published.");
}