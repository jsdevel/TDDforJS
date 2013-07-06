var assert = require('assert');
var testSuite;
var results;
var sampleSuite=[
   '/*',
   '//Test',
   'function it_should_not_be_considered_when_commented_by_a_block_comment(){}',
   '*/',
   '//Test',
   'function it_should_be_cool(){test(5);}'
].join('\n');

function test_constructor_should_force_string(){
   assert['throws'](function(){
      new TestSuite(null);
   });
   assert.doesNotThrow(function(){
      new TestSuite("asdf");
   });
}
function test_hasAfter_should_be_set_appropriately(){
   assert(
      !new TestSuite(sampleSuite).hasAfter(),
      "hasAfter should be false by default"
   );
   assert(
      new TestSuite(sampleSuite+"\nfunction after(){}").hasAfter(),
      "hasAfter should be true when after is defined in suite."
   );
}
function test_hasBefore_should_be_set_appropriately(){
   assert(
      !new TestSuite(sampleSuite).hasBefore(),
      "hasBefore should be false by default"
   );
   assert(
      new TestSuite(sampleSuite+"\nfunction before(){}").hasBefore,
      "hasBefore should be true when before is defined in suite."
   );
}
function test_no_tests_should_be_defined_by_default(){
   testSuite = new TestSuite("asdf");
   assert(
      !testSuite.hasTestCases() &&
      testSuite.numberOfTestCases() === 0,
      "no test should exist."
   );
}
function test_tests_should_be_added_when_defined_in_a_suite(){
   testSuite = new TestSuite(sampleSuite);
   assert(
      testSuite.hasTestCases() &&
      testSuite.numberOfTestCases() === 1
   );
}
function test_resulting_source_should_execute_test(){
   var expected;
   var test = function(a){
      expected=a+2;
   };
   testSuite=new TestSuite(sampleSuite);
   eval(sampleSuite+"\n"+testSuite.getTestCases()[0].source);
   assert.equal(expected, 7);
}