var assert = require('assert');
var testSuite;
var results;
var prefix="_";
var className="foo.Foo";
var hostname="localhost";
var id=0;
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
   console.log(6);
   _store=function(){};
   _reset=function(){};
   _testSuiteResults={};
   testFn=function(){};
}
//Test
function constructor_should_force_prefix_as_string(){
   assert['throws'](function(){
      new TestSuite(null, className, hostname, id, "asdf");
   });
   assert.doesNotThrow(function(){
      new TestSuite(prefix, className, hostname, id, "asdf");
   });
}
//Test
function constructor_should_force_className_as_string(){
   assert['throws'](function(){
      new TestSuite(prefix, null, hostname, id, "asdf");
   });
   assert.doesNotThrow(function(){
      new TestSuite(prefix, "asdf", hostname, id, "asdf");
   });
}
//Test
function constructor_should_force_valid_className(){
   assert['throws'](function(){
      new TestSuite(prefix, "-------", hostname, id, "asdf");
   });
   assert['throws'](function(){
      new TestSuite(prefix, "asdf.", hostname, id, "asdf");
   });
   assert['throws'](function(){
      new TestSuite(prefix, ".asdf", hostname, id, "asdf");
   });
   assert['throws'](function(){
      new TestSuite(prefix, "", hostname, id, "asdf");
   });
   assert.doesNotThrow(function(){
      new TestSuite(prefix, "foo.boo.Foo", hostname, id, "asdf");
   });
}
//Test
function constructor_should_force_hostname_as_string(){
   assert['throws'](function(){
      new TestSuite(prefix, className, "", id, "asdf");
   });
   assert['throws'](function(){
      new TestSuite(prefix, className, null, id, "asdf");
   });
   assert.doesNotThrow(function(){
      new TestSuite(prefix, className, hostname, id, "asdf");
   });
}
//Test
function constructor_should_force_id_as_number_above_or_equal_to_0(){
   assert['throws'](function(){
      new TestSuite(prefix, className, hostname, -1, "asdf");
   });
   assert['throws'](function(){
      new TestSuite(prefix, className, hostname, ""/0, "asdf");
   });
   assert.doesNotThrow(function(){
      new TestSuite(prefix, className, hostname, id, "asdf");
   });
}
//Test
function constructor_should_force_source_as_string(){
   assert['throws'](function(){
      new TestSuite(prefix, className, hostname, id, null);
   });
   assert.doesNotThrow(function(){
      new TestSuite(prefix, className, hostname, id, "asdf");
   });
}
//Test
function hasAfter_should_be_set_appropriately(){
   assert(
      !new TestSuite(prefix, className, hostname, id, sampleSuite).hasAfter(),
      "hasAfter should be false by default"
   );
   assert(
      new TestSuite(prefix, className, hostname, id, sampleSuite+"\nfunction after(){}").hasAfter(),
      "hasAfter should be true when after is defined in suite."
   );
}
//Test
function hasAfterSuite_should_be_set_appropriately(){
   assert(
      !new TestSuite(prefix, className, hostname, id, sampleSuite).hasAfterSuite(),
      "hasAfter should be false by default"
   );
   assert(
      new TestSuite(prefix, className, hostname, id, sampleSuite+"\nfunction afterSuite(){}").hasAfterSuite(),
      "hasAfter should be true when after is defined in suite."
   );
}
//Test
function hasBefore_should_be_set_appropriately(){
   assert(
      !new TestSuite(prefix, className, hostname, id, sampleSuite).hasBefore(),
      "hasBefore should be false by default"
   );
   assert(
      new TestSuite(prefix, className, hostname, id, sampleSuite+"\nfunction before(){}").hasBefore(),
      "hasBefore should be true when before is defined in suite."
   );
}
//Test
function hasBeforeSuite_should_be_set_appropriately(){
   assert(
      !new TestSuite(prefix, className, hostname, id, sampleSuite).hasBeforeSuite(),
      "hasBefore should be false by default"
   );
   assert(
      new TestSuite(prefix, className, hostname, id, sampleSuite+"\nfunction beforeSuite(){}").hasBeforeSuite(),
      "hasBefore should be true when before is defined in suite."
   );
}
//Test
function no_tests_should_be_defined_by_default(){
   testSuite = new TestSuite(prefix, className, hostname, id, "asdf");
   assert(
      !testSuite.hasTestCases() &&
      testSuite.numberOfTestCases() === 0,
      "no test should exist."
   );
}
//Test
function tests_should_be_added_when_defined_in_a_suite(){
   testSuite = new TestSuite(prefix, className, hostname, id, sampleSuite);
   assert(testSuite.hasTestCases(),"there were no test cases defined.");
   assert.equal(testSuite.numberOfTestCases(), 4, "there were "+testSuite.numberOfTestCases()+" cases. Expected 4.");
}
//Test
function resulting_source_should_execute_test(){
   var expected=0;
   var testCases;
   var testFn = function(a){
      expected+=1;
   };
   testSuite=new TestSuite(prefix, className, hostname, 5, sampleSuite);
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
   assert.equal(_testSuiteResults.hostname, "localhost", "hostname isn't set properly.");
   assert.equal(_testSuiteResults.id, 5, "id isn't et properly.");
   assert.equal(testCases[0].name, "it_should_be_cool", "name set when package and Class exists.");
   assert.equal(testCases[0].className, "foo.Foo", "name set when package and Class exists.");

   testSuite=new TestSuite(prefix, "Foo", hostname, id, sampleSuite);
   eval(testSuite.toString());
   assert.equal(_testSuiteResults.package, "", "package not set when package does not exist.");
}
//Test
function testSuite_should_return_appropriate_values(){
   testSuite=new TestSuite(prefix, className, hostname, id, sampleSuite);
   assert.deepEqual(
      testSuite.getTestCases(),
      [
         'it_should_be_cool',
         'duplicate_0_it_should_be_cool',
         '$it_should_be_cool',
         'duplicate_1_$it_should_be_cool'
      ],
      "getTestCases didn't return the correct test cases."
   );
   assert.equal(
      testSuite.getPackage(),
      "foo",
      "getPackage didn't return the right package name."
   );
   assert.equal(
      testSuite.getClassName(),
      "foo.Foo",
      "getClassName didn't return the right class name."
   );
   assert.equal(
      testSuite.getSimpleClassName(),
      "Foo",
      "getSimpleClassName didn't return the right simple class name."
   );

}