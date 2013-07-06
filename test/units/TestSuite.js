var assert = require('assert');
var testSuite;
var results;
var prefix="_";
var className="foo.Foo";
//these are here to support the evaled code from the toString() method.
var _store;
var _reset;
var _testSuiteResults;
var testFn;
var sampleSuite=[
   '/*',
   '//Test',
   'function it_should_not_be_considered_when_commented_by_a_block_comment(){}',
   '*/',
   '//Test',
   'function it_should_be_cool(){testFn(5);}',
   '//Test',
   'function it_should_be_cool(){testFn(5);throw 5;}',
   '//Test',
   'function $it_should_be_cool(){testFn(5);asdfasdf}',
   '//Test',
   'function $it_should_be_cool(){assert(false);}'
].join('\n');

function before(){
   _store=function(){};
   _reset=function(){};
   _testSuiteResults={};
   testFn=function(){};
}
function test_constructor_should_force_prefix_as_string(){
   assert['throws'](function(){
      new TestSuite(null, className, "asdf");
   });
   assert.doesNotThrow(function(){
      new TestSuite(prefix, className, "asdf");
   });
}
function test_constructor_should_force_className_as_string(){
   assert['throws'](function(){
      new TestSuite(prefix, null, "asdf");
   });
   assert.doesNotThrow(function(){
      new TestSuite(prefix, "asdf", "asdf");
   });
}
function test_constructor_should_force_valid_className(){
   assert['throws'](function(){
      new TestSuite(prefix, "-------", "asdf");
   });
   assert['throws'](function(){
      new TestSuite(prefix, "asdf.", "asdf");
   });
   assert['throws'](function(){
      new TestSuite(prefix, ".asdf", "asdf");
   });
   assert['throws'](function(){
      new TestSuite(prefix, "", "asdf");
   });
}
function test_constructor_should_force_source_as_string(){
   assert['throws'](function(){
      new TestSuite(prefix, className, null);
   });
   assert.doesNotThrow(function(){
      new TestSuite(prefix, className, "asdf");
   });
}
function test_hasAfter_should_be_set_appropriately(){
   assert(
      !new TestSuite(prefix, className, sampleSuite).hasAfter(),
      "hasAfter should be false by default"
   );
   assert(
      new TestSuite(prefix, className, sampleSuite+"\nfunction after(){}").hasAfter(),
      "hasAfter should be true when after is defined in suite."
   );
}
function test_hasBefore_should_be_set_appropriately(){
   assert(
      !new TestSuite(prefix, className, sampleSuite).hasBefore(),
      "hasBefore should be false by default"
   );
   assert(
      new TestSuite(prefix, className, sampleSuite+"\nfunction before(){}").hasBefore,
      "hasBefore should be true when before is defined in suite."
   );
}
function test_no_tests_should_be_defined_by_default(){
   testSuite = new TestSuite(prefix, className, "asdf");
   assert(
      !testSuite.hasTestCases() &&
      testSuite.numberOfTestCases() === 0,
      "no test should exist."
   );
}
function test_tests_should_be_added_when_defined_in_a_suite(){
   testSuite = new TestSuite(prefix, className, sampleSuite);
   assert(testSuite.hasTestCases(),"there were no test cases defined.");
   assert.equal(testSuite.numberOfTestCases(), 4, "there were "+testSuite.numberOfTestCases()+" cases. Expected 4.");
}
function test_resulting_source_should_execute_test(){
   var expected=0;
   var testCases;
   var testFn = function(a){
      expected+=1;
   };
   testSuite=new TestSuite(prefix, className, sampleSuite);
   eval(testSuite.toString());
   testCases=_testSuiteResults.testCases;
   [
      testCases[1],
      testCases[3]
   ].forEach(function(v){
      assert(v.failure, "Errors with assert in Error.prototype.constructor.name.toLowerCase(), or that aren't an instanceof Error should be considered a failure.");
   });
   assert(testCases[2].error, "Errors that are an instanceof Error should be considered an error.");
   assert.equal(testCases[1].name, "duplicate_0_it_should_be_cool", "duplicate tests are prefixed with duplicate.");
   assert.equal(testCases[3].name, "duplicate_1_$it_should_be_cool", "duplicate tests with $ are prefixed with duplicate.");
   assert.equal(expected, 3, "tests aren't calling the testFn.");
   assert.equal(_testSuiteResults.package, "foo", "package set when package exists.");
   assert.equal(_testSuiteResults.name, "Foo", "name set when package and Class exists.");
   assert.equal(testCases[0].name, "it_should_be_cool", "name set when package and Class exists.");
   assert.equal(testCases[0].className, "foo.Foo", "name set when package and Class exists.");

   testSuite=new TestSuite(prefix, "Foo", sampleSuite);
   eval(testSuite.toString());
   assert.equal(_testSuiteResults.package, "", "package not set when package does not exist.");
}