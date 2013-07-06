var assert = require('assert');
var analyzer;
var results;
var samplsSuite=[
   '/*',
   '//Test',
   'function it_should_not_be_considered_when_commented_by_a_block_comment(){}',
   '*/',
   '//Test',
   'function it_should_be_cool(){}'
].join('\n');

function before(){
   analyzer=new TestAnalyzer();
}
function test_hasAfter_should_be_set_appropriately(){
   assert(
      !analyzer.analyzeTestSuite("").hasAfter,
      "hasAfter should be false by default"
   );
   assert(
      analyzer.analyzeTestSuite("function after(){}").hasAfter,
      "hasAfter should be true when after is defined in suite."
   );
}
function test_hasBefore_should_be_set_appropriately(){
   assert(
      !analyzer.analyzeTestSuite("").hasBefore,
      "hasBefore should be false by default"
   );
   assert(
      analyzer.analyzeTestSuite("function before(){}").hasBefore,
      "hasBefore should be true when before is defined in suite."
   );
}
function test_no_tests_should_be_defined_by_default(){
   assert(
      !analyzer.analyzeTestSuite("asdf").tests.length,
      "no test should exist."
   );
}
function test_tests_should_be_added_when_defined_in_a_suite(){
   assert.equal(
      analyzer.analyzeTestSuite(samplsSuite).tests.length,
      1
   );
}