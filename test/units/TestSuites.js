//import lib/jsmockito
//import mocks/AppFactory
//import mocks/SuiteFileResolver
//import mocks/ImportResolver
//import mocks/TDDforJSEvaluator

var assert = require('assert');
var files = [
   "foo.js",
   "asdf/basd==oo"
];
var suiteMock;
var suites;
var hostname="localhost";
var appFactory;
var fileResolver;
var importResolver;
var pathModule;
var evaluator;
var evaluatorCalls;
var fooTests=3;
var booTests=4;
var isFooFailed=false;
var isFooError=false;
var isBooFailed=false;
var isBooError=false;
var isFooImportBad=false;
var isBooImportBad=false;
var isFooSourceBad=false;
var isBooSourceBad=false;
var badFooImportError="";
var badBooImportError="";
var badFooSourceError="";
var badBooSourceError="";
var extraCallbackFnDelegate;
var extraCallbackFn;
var fooSuite={
   toString:function(){
      return "fooSource";
   },
   getClassName:function(){
      return "boo.Suite";
   },
   getPackage:function(){
      return "boo";
   },
   getSimpleClassName:function(){
      return "Suite";
   },
   getTestCases:function(){
      return [
         'foo1',
         'foo2',
         'foo3'
      ];
   },
   numberOfTestCases:function(){
      return 3;
   }
};
var booSuite={
   toString:function(){
      return "booSource";
   },
   getClassName:function(){
      return "foo.Suite";
   },
   getPackage:function(){
      return "foo";
   },
   getSimpleClassName:function(){
      return "Suite";
   },
   getTestCases:function(){
      return [
         'boo1',
         'boo2',
         'boo3',
         'boo4'
      ];
   },
   numberOfTestCases:function(){
      return 4;
   }
};
var fooTdd={overrides:{}};

function before(){
   extraCallbackFnDelegate=function(){};
   extraCallbackFn=function(file){return extraCallbackFnDelegate(file);};
   isFooFailed=false;
   isFooError=false;
   isBooFailed=false;
   isBooError=false;
   isFooImportBad=false;
   isBooImportBad=false;
   isFooSourceBad=false;
   isBooSourceBad=false;
   badFooImportError="";
   badBooImportError="";
   badFooSourceError="";
   badBooSourceError="";
   suiteMock={};
   pathModule=require('path');
   appFactory=mock(_AppFactory);
   appFactory.constructor={name:"AppFactory"};
   when(appFactory).makeTestSuite.call(
      appFactory,
      "foo",
      hostname,
      0,
      "fooSource"
   ).thenReturn(fooSuite);
   when(appFactory).makeTestSuite.call(
      appFactory,
      "asdf.basdOo",
      hostname,
      1,
      "booSource"
   ).thenReturn(booSuite);
   when(appFactory).makeTDD.call(appFactory).thenReturn(fooTdd);

   fileResolver=mock(_SuiteFileResolver);
   fileResolver.constructor={name:"SuiteFileResolver"};
   when(fileResolver).getSuite.call(fileResolver, files[0]).thenReturn("fooSource");
   when(fileResolver).getSuite.call(fileResolver, files[1]).thenReturn("booSource");
   importResolver=mock(_ImportResolver);
   importResolver.constructor={name:"ImportResolver"};
   when(importResolver).getImportsFrom.call(importResolver, fooSuite.toString()).
      thenReturn("fooImports");
   when(importResolver).getImportsFrom.call(importResolver, booSuite.toString()).
      thenReturn("booImports");
   evaluatorCalls=[];
   evaluator={
      __$$__checkScriptForError:function(script){
         if(
            script.indexOf("fooSource") > -1 && isFooSourceBad ||
            script.indexOf("fooImports") > -1 && isFooImportBad ||
            script.indexOf("booSource") > -1 && isBooSourceBad ||
            script.indexOf("booImports") > -1 && isBooImportBad
         ){
            return true;
         }
         return false;
      },
      __$$__getEarlyErrorFromScript:function(script){
         switch(script){
         case "fooSource":
            return badFooSourceError;
         case "fooImports":
            return badFooImportError;
         case "booSource":
            return badBooSourceError;
         case "booImports":
            return badBooImportError;
         }
         if(
            script.indexOf("fooSource") > -1 && isFooSourceBad ||
            script.indexOf("fooImports") > -1 && isFooImportBad ||
            script.indexOf("booSource") > -1 && isBooSourceBad ||
            script.indexOf("booImports") > -1 && isBooImportBad
         ){
            return true;
         }
         return false;

      },
      __$$__eval:function(source, results){
         results.failures=0;
         results.errors=0;
         results.tests=0;
         if(source.indexOf('foo')>-1){
            if(isFooFailed){
               results.failures++;
            }
            if(isFooError){
               results.errors++;
            }
            results.tests=fooTests;
         } else {
            if(isBooFailed){
               results.failures++;
            }
            if(isBooError){
               results.errors++;
            }
            results.tests=booTests;
         }
         evaluatorCalls.push([source, results]);
      },
      constructor:{name:"TDDforJSEvaluator"}
   };
   suites=new TestSuites(files, appFactory, hostname, fileResolver, importResolver, pathModule, evaluator, extraCallbackFn);
};

//Test
function constructor_should_typecheck_arguments(){
   assert['throws'](function(){
      new TestSuites(null, appFactory, hostname, fileResolver, importResolver, pathModule, evaluator, extraCallbackFn);
   }, "files wasn't forced to be an array.");
   assert['throws'](function(){
      new TestSuites(files, null, hostname, fileResolver, importResolver, pathModule, evaluator, extraCallbackFn);
   }, "appFactory wasn't forced to be an AppFactory.");
   assert['throws'](function(){
      new TestSuites(files, appFactory, false, fileResolver, importResolver, pathModule, evaluator, extraCallbackFn);
   }, "hostname wasn't forced to be a string.");
   assert['throws'](function(){
      new TestSuites(files, appFactory, "", fileResolver, importResolver, pathModule, evaluator, extraCallbackFn);
   }, "hostname wasn't forced to non empty.");
   assert['throws'](function(){
      new TestSuites(files, appFactory, hostname, null, importResolver, pathModule, evaluator, extraCallbackFn);
   }, "fileResolver wasn't forced to be an instanceof SuiteFileResolver.");
   assert['throws'](function(){
      new TestSuites(files, appFactory, hostname, fileResolver, null, pathModule, evaluator, extraCallbackFn);
   }, "importResolver wasn't forced to be an instanceof ImportResolver.");
   assert['throws'](function(){
      new TestSuites(files, appFactory, hostname, fileResolver, importResolver, pathModule, null, extraCallbackFn);
   }, "evaluator wasn't forced to be an instanceof TDDforJSEvaluator.");
   assert['throws'](function(){
      new TestSuites(files, appFactory, hostname, fileResolver, importResolver, pathModule, evaluator, null);
   }, "extraSourceFn wasn't forced to be a function.");
}
//Test
function getResults_should_return_an_Object(){
   var results=suites.getResults();
   assert(results instanceof Object, "getResults didn't return an object.");
   assert.equal(results.total.tests, fooTests+booTests, "getResults didn't contain the number of suites run.");
}
//Test
function appFactory_should_be_called_appropriately(){
   suites.getResults();
   verify(appFactory, times(1)).makeTestSuite.call(appFactory,
      "foo",
      hostname,
      0,
      "fooSource"
   );
   verify(appFactory, times(1)).makeTestSuite.call(appFactory,
      "asdf.basdOo",
      hostname,
      1,
      "booSource"
   );
   verify(appFactory, times(2)).makeTDD.call(appFactory);
}
//Test
function evaluator_should_be_called_appropriately(){
   suites.getResults();
   assert.deepEqual(
      evaluatorCalls,
      [
         [
            '!function(){\nfooImports\n!function(){\n\n!function(){\nfooSource\n}();\n}();\n}();',
            {stdErr:[],stdOut:[],failures:0,errors:0,tests:fooTests}
         ],
         [
            '!function(){\nbooImports\n!function(){\n\n!function(){\nbooSource\n}();\n}();\n}();',
            {stdErr:[],stdOut:[],failures:0,errors:0,tests:booTests}
         ]
      ],
      "evaluator isn't called with the proper arguments."
   );
}
//Test
function evaluator_should_be_called_appropriately_when_extraCallBackFn_returns_source(){
   extraCallbackFnDelegate=function(file){
      if(file === "foo.js"){
         return "fooExternal source.";
      }
   };
   suites.getResults();
   assert.deepEqual(
      evaluatorCalls,
      [
         [
            '!function(){\nfooImports\n!function(){\nfooExternal source.\n!function(){\nfooSource\n}();\n}();\n}();',
            {stdErr:[],stdOut:[],failures:0,errors:0,tests:fooTests}
         ],
         [
            '!function(){\nbooImports\n!function(){\n\n!function(){\nbooSource\n}();\n}();\n}();',
            {stdErr:[],stdOut:[],failures:0,errors:0,tests:booTests}
         ]
      ],
      "evaluator isn't called with the proper arguments."
   );
}

//Test
function results_should_get_updated_by_test_suites(){
   isFooFailed=true;
   isBooError=true;
   var results=suites.getResults();
   assert.equal(results.total.failures, 1, "failures aren't recorded.");
   assert.equal(results.total.errors, 1, "errors aren't recorded.");
   assert.equal(results.total.tests, 7, "tests aren't recorded.");
}
//Test
function results_should_show_errors_from_bad_imports(){
   isBooImportBad=true;
   badBooImportError="error in import";
   var results=suites.getResults();
   assert.equal(results.total.errors, 4, "errors in imports don't stop the tests.");
}
//Test
function results_should_show_errors_from_bad_sources(){
   isFooSourceBad=true;
   badFooSourceError="error in source";
   var results=suites.getResults();
   assert.equal(results.total.errors, 3, "errors in sources don't stop the tests.");
}
//Test
function extraCallBackFn_should_get_called_with_each_file_in_suites(){
   extraCallbackFnDelegate=mockFunction();
   suites.getResults();
   verify(extraCallbackFnDelegate)("foo.js");
   verify(extraCallbackFnDelegate)("asdf/basd==oo");
   verifyNoMoreInteractions(extraCallbackFnDelegate);
}
//Test
function extraCallBackFn_should_cause_suite_to_fail_when_an_error_is_thrown(){
   extraCallbackFnDelegate=function(file){
      if(file === "foo.js"){
         throw "foo external source error.";
      }
   };
   var results=suites.getResults();
   assert.equal(results.total.errors, 3, "errors from external callback fn don't cause suite to fail.");
}