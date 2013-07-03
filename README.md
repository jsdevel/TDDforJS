TDD
========

A Test Driven Development framework for Javascript.  TDD aims to provide a very
simple test running environment, that mimics jUnit.  It doesn't provide any sort
of assertion framework, and it's not going to fold your clothes either.  Just a
few nice conventions to make testing JS a bit simpler.

Requirements
========
node and npm

Setup
========
1. `npm install tdd`
2. Create `config/tdd.json` within your project root.
3. Set the appropritate values within the config file.
4. `$(npm bin)/tdd`

It's really that simple.

Config
========
TDD uses config-tools to look for a `config/tdd.json` file within your project root.

The following is an example config file:
`````
{
   "reporting":{
      "mode":"cli",
      "available":[
         "cli",
         "junit",
         "testng"
      ]
   },
   "src":{
      "base":"../src",
      "js":"./js"
   },
   "test":{
      "base":"../test",
      "integrations":"./integrations",
      "units":"./units"
   }
}
`````
Convention
=========
By default, TDD assumes that each file under `src/js` will have an accompanying
unit test under the `test/units` directory.
A default project structure looks like this:
``````
$ProjectRoot/
            |
            |
            |____src/
            |       |
            |       |____js/
            |              |
            |              |__MyFile.js
            |
            |
            |____test/
                     |
                     |____units/
                     |         |
                     |         |__MyFile.js
                     |
                     |
                     |____integrations/
```````
TDD is then able to report that you have 100% code coverage, and will run tests in `units/MyFile.js` against `src/MyFile.js`

Sample Test Suite
========
Here is a sample test suite.  The inspiration comes from jUnit 3.x, so the following holds true:
* if a function marked `before` exists within your Test Suite, it will be executed before any test
* if a function marked `after` exists within your Test Suite, it will be executed after any test
* any function prefixed with `test_` is considered a test.
* throwing an error of any sort fails a test.

``````
var factory;
function before(){
   factory = new AppFactory();
}
function after(){
}

function test_TDDEvaluator_should_be_creatable(){
   TDDEvaluator = function(){};
   if(!(factory.makeTDDEvaluator() instanceof TDDEvaluator)){
      throw 5
   }
}
function test_UnitTestResolver_should_be_creatable(){
   UnitTestResolver = function(){};
   if(!(factory.makeUnitTestResolver() instanceof UnitTestResolver)){
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
``````
And here's the source file:
``````
/**
 * @constructor
 * @param {Object} fsModule
 * @param {Object} pathModule
 */
function AppFactory(fsModule, pathModule){

   /** @return {TDDEvaluator} */
   this.makeTDDEvaluator=function(){
      return new TDDEvaluator();
   };

   /**
    * @param {string} sourcePath
    * @param {string} unitPath
    * @return {TDDEvaluator}
    */
   this.makeUnitTestResolver=function(sourcePath, unitPath){
      return new UnitTestResolver(
         fsModule,
         pathModule,
         sourcePath,
         unitPath
      );
   };

   /**
    * @param {Array} sources
    * @param {Array} units
    * @return {UnitTestReporter}
    */
   this.makeUnitTestReporter=function(sources, units){
      return new UnitTestReporter(sources, units);
   };

   /**
    * @param {TDDEvaluator} evaluator
    * @param {UnitTestReporter} reporter
    * @param {UnitTestResolver} resolver
    * @returns {UnitTestRunner}
    */
   this.makeUnitTestRunner=function(evaluator, reporter, resolver){
      return new UnitTestRunner(evaluator, reporter, resolver);
   };
}
``````
Reporting
========
TDD aims to provide support for three types of reports:

* CLI
* jUnit XML
* TestNG XML

The two latter types would enable integration with a CI server like Hudson or Jenkins.

Here's what a sample report looks like from the CLI:
``````
========================================
TEST SUITE REPORT
========================================
Sources Tested: 30%
Suites  Run   : 3
Tests   Run   : 11, Tests Failed: 1, Tests Passed: 10

TEST SUITE RESULTS

Testsuite : AppFactory.js
Tests run : 5, Failures : 1, Successes : 4
   FAILED : test_ImportResolver_should_be_creatable
          : asdf

Testsuite : ImportResolver.js
Tests run : 3, Failures : 0, Successes : 3

Testsuite : TDDEvaluator.js
Tests run : 3, Failures : 0, Successes : 3
``````
Here's what a junit report looks like for hudson and jenkins:
``````
<?xml version="1.0" encoding="UTF-8" ?>
<testsuite errors="0" failures="1" name="AppFactory.js" tests="5">
   <testcase classname="AppFactory.js"
name="test_ImportResolver_should_be_creatable">

      <failure type="undefined">asdf</failure>

   </testcase>
   <testcase classname="AppFactory.js"
name="test_TDDEvaluator_should_be_creatable">

   </testcase>
   <testcase classname="AppFactory.js"
name="test_UnitTestResolver_should_be_creatable">

   </testcase>
   <testcase classname="AppFactory.js"
name="test_UnitTestReporter_should_be_creatable">

   </testcase>
   <testcase classname="AppFactory.js"
name="test_UnitTestRunner_should_be_creatable">

   </testcase>

   <system-out><![CDATA[]]></system-out>
   <system-err><![CDATA[]]></system-err>
</testsuite>
``````