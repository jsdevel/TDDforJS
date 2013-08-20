TDDforJS
========

A Test Driven Development framework for Javascript.  TDD aims to provide a very
simple test running environment, that mimics jUnit.  It doesn't provide any sort
of assertion framework, and it's not going to fold your clothes either.  Just a
few nice conventions to make testing JS a bit easier.

Requirements
========
node and npm

Setup
========
1. `npm install tddforjs`
2. `$(npm bin)/tddforjs`
3. Set the appropritate values in `config/tddforjs.json`
4. `$(npm bin)/tddforjs`

It's really that simple.

Config
========
TDD uses config-tools to look for a `config/tddforjs.json` file within your
project root.

The following is a default config file:
`````
{
   "reporting":{
      "mode":"cli",
      "available":[
         "cli",
         "junit",
         "testng"
      ],  
      "base":"../reports",
      "output":{
         "types":{
            "junit":true,
            "testng":false
         }
      }   
   },  
   "src":{
      "base":"../src",
      "js":"./js",
      "names":[
         ".*\\.js"
      ]   
   },  
   "test":{
      "base":"../test",
      "integrations":"./integrations",
      "units":"./units",
      "names":{
         "units":[".*\\.js"],
         "integrations":[".*\\.js"]
      }   
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
TDD will run tests in `units/MyFile.js` against `src/MyFile.js`.
All suites found in `integrations/` will be run as well.

Sample Test Suite
========
Here is a sample test suite.  The inspiration comes from jUnit 4.x, so the following holds true:
* if a function marked `before` exists within your Test Suite, it will be executed before any test
* if a function marked `after` exists within your Test Suite, it will be executed after any test
* any function prefixed with `//Test` is considered a test.
* Errors with the term `assert` in their constructor show as a failure.
* Errors not an instanceof Error show as a failure.
* Errors that are an instance of Error show as an error.

``````
var assert = require('assert');
var factory;
function before(){
   factory = new AppFactory();
}
function after(){
}

//Test
function ImportResolver_should_be_creatable(){
   ImportResolver = function(){};
   if(!(factory.makeImportResolver() instanceof ImportResolver)){
      throw "ImportResolver wasn't created.";
   }
}
//Test
function TDDforJSEvaluator_should_be_creatable(){
   TDDforJSEvaluator = function(){};
   if(!(factory.makeTDDforJSEvaluator() instanceof TDDforJSEvaluator)){
      throw "TDDforJSEvaluator wasn't created.";
   }
}
//Test
function TestSuite_should_be_creatable(){
   TestSuite = function(){};
   if(!(factory.makeTestSuite() instanceof TestSuite)){
      assert.fail("TestSuite wasn't created.");
   }
}
//Test
function TestSuites_should_be_creatable(){
   TestSuites = function(){};
   if(!(factory.makeTestSuites() instanceof TestSuites)){
      assert.fail("TestSuites wasn't created.");
   }
}
//Test
function SuiteFileResolver_should_be_creatable(){
   SuiteFileResolver = function(){};
   if(!(factory.makeSuiteFileResolver() instanceof SuiteFileResolver)){
      assert.fail("SuiteFileResolver wasn't created.");
   }
}
``````

And here's the source file:

``````
/**
 * @constructor
 * @param {Object} fsModule
 * @param {Object} pathModule
 * @param {string} hostname
 */
function AppFactory(
   fsModule,
   pathModule,
   hostname
){
   var instance = this;

   /**
    * @param {string} sourceBase
    * @param {string} testBase
    * @return {ImportResolver}
    */
   this.makeImportResolver=function(sourceBase, testBase){
      return new ImportResolver(fsModule, pathModule, sourceBase, testBase);
   };

   /** @return {TDDforJSEvaluator} */
   this.makeTDDforJSEvaluator=function(){
      return new TDDforJSEvaluator();
   };

   /**
    * @param {string} className
    * @param {string} hostname
    * @param {number} id
    * @param {string} source
    * @returns {TestSuite}
    */
   this.makeTestSuite=function(
      className,
      hostname,
      id,
      source
   ){
      return new TestSuite(
         "__$$__",
         className,
         hostname,
         id,
         source
      );
   };

   /**
    * @param {Array.<string>} files
    * @param {SuiteFileResolver} fileResolver
    * @param {ImportResolver} importResolver
    * @param {TDDforJSEvaluator} evaluator
    * @param {function(string): string} extraSourceFn
    * @returns {TestSuites}
    */
   this.makeTestSuites=function(
      files,
      fileResolver,
      importResolver,
      evaluator,
      extraSourceFn
   ){
      return new TestSuites(
            files,
            instance,
            hostname,
            fileResolver,
            importResolver,
            pathModule,
            evaluator,
            extraSourceFn
      );
   };

   /**
    * @param {string} baseDir
    * @returns {SuiteFileResolver}
    */
   this.makeSuiteFileResolver=function(baseDir){
      return new SuiteFileResolver(
         fsModule,
         pathModule,
         baseDir
      );
   };
}

``````

Importing
========
TDD allows your test suites to import any javascript file for the duration of
your test.  The following paths are searched for a match in order:
`test/`
`src/`
To define imports, you specify comments at the top of your suite like this:
````
//import foo
//import lib/jsmockito
function before(){
}
//continue testing...
``````

Errors in Source
========
Because TDD is declarative in the sense that you follow a convention to define
test cases, TDD can report the number of test cases defined in a suite even
when they can't be run due to an uncaught error in your source, suite, or any
import.

Let's say we have the following source:
````````
//import foo
throw 5;
````````
And we're testing it with a unit test:
````````
//Test
function foo_should_foo(){
}
````````
We would report 1 test and 1 failure for our unit test, despite the fact that
there's clearly an error in our source file when the unit test is run.

This feature extends to suites and imported files.

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
UNIT TEST REPORT
========================================
Suites      : 6
Tests       : 50
Failures    : 0
Errors      : 0

========================================
INTEGRATION TEST REPORT
========================================
Suites      : 1
Tests       : 0
Failures    : 0
Errors      : 0
``````
Here's what a junit report looks like for hudson and jenkins:
``````
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
   <testsuite name="AppFactory"
              timestamp="2013-07-10T20:29:06.617Z"
              hostname="JHP"
              tests="5"
              failures="0"
              errors="0"
              time="0.018"
              package=""
              id="0">
      <testcase name="ImportResolver_should_be_creatable"
                classname="AppFactory"
                time="0.001">

      </testcase>
      <testcase name="TDDforJSEvaluator_should_be_creatable"
                classname="AppFactory"
                time="0">

      </testcase>
      <testcase name="TestSuite_should_be_creatable"
                classname="AppFactory"
                time="0.001">

      </testcase>
      <testcase name="TestSuites_should_be_creatable"
                classname="AppFactory"
                time="0">

      </testcase>
      <testcase name="SuiteFileResolver_should_be_creatable"
                classname="AppFactory"
                time="0">

      </testcase>

      <system-out>

      </system-out>
      <system-err>

      </system-err>
   </testsuite>
</testsuites>
``````
TDD only reports errors and failures, so if we were to do something in our
sample suite that would fail a test, the output would look like this for the
CLI:
``````
========================================
UNIT TEST REPORT
========================================
Suites      : 6
Tests       : 50
Failures    : 1
Errors      : 0

Suite: AppFactory
  Tests     : 5
  Failures  : 1
  Errors    : 0
  Case      : ImportResolver_should_be_creatable
    Failure : unknown
            : boo

========================================
INTEGRATION TEST REPORT
========================================
Suites      : 1
Tests       : 0
Failures    : 0
Errors      : 0
``````
And in the JUnit report:
``````
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
   <testsuite name="AppFactory"
              timestamp="2013-07-10T20:33:05.130Z"
              hostname="JHP"
              tests="5"
              failures="1"
              errors="0"
              time="0.018"
              package=""
              id="0">
      <testcase name="ImportResolver_should_be_creatable"
                classname="AppFactory"
                time="0">

         <failure message="boo"
                  type="unknown">
         </failure>

      </testcase>
      <testcase name="TDDforJSEvaluator_should_be_creatable"
                classname="AppFactory"
                time="0">

      </testcase>
      <testcase name="TestSuite_should_be_creatable"
                classname="AppFactory"
                time="0">

      </testcase>
      <testcase name="TestSuites_should_be_creatable"
                classname="AppFactory"
                time="0">

      </testcase>
      <testcase name="SuiteFileResolver_should_be_creatable"
                classname="AppFactory"
                time="0">

      </testcase>

      <system-out>

      </system-out>
      <system-err>

      </system-err>
   </testsuite>
</testsuites>
``````

Console Logging
==========
Console logging can come in handy for debugging purposes.  It can also be very
difficult to decipher it's output without any context.

TDD overrides console and places the messages in the reports.
Let's add a `console.log` statement to a test case:
``````
//Test
function ImportResolver_should_be_creatable(){
   ImportResolver = function(){};
   if(!(factory.makeImportResolver() instanceof ImportResolver)){
      throw "ImportResolver wasn't created.";
   }
   console.log("calling console.log", "with some arguments", 5, 6, 7)
}
``````
Here's what the CLI report shows:
``````
========================================
UNIT TEST REPORT
========================================
Suites      : 6
Tests       : 50
Failures    : 0
Errors      : 0

Suite: AppFactory
  Tests     : 5
  Failures  : 0
  Errors    : 0
  Stdout    :
         console.log(calling console.log , with some arguments , 5 , 6 , 7)


========================================
INTEGRATION TEST REPORT
========================================
Suites      : 1
Tests       : 0
Failures    : 0
Errors      : 0
``````
Here's what the JUnit report shows:
```````
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
   <testsuite name="AppFactory"
              timestamp="2013-07-10T20:35:27.737Z"
              hostname="JHP"
              tests="5"
              failures="0"
              errors="0"
              time="0.019"
              package=""
              id="0">
      <testcase name="ImportResolver_should_be_creatable"
                classname="AppFactory"
                time="0">

      </testcase>
      <testcase name="TDDforJSEvaluator_should_be_creatable"
                classname="AppFactory"
                time="0">

      </testcase>
      <testcase name="TestSuite_should_be_creatable"
                classname="AppFactory"
                time="0">

      </testcase>
      <testcase name="TestSuites_should_be_creatable"
                classname="AppFactory"
                time="0">

      </testcase>
      <testcase name="SuiteFileResolver_should_be_creatable"
                classname="AppFactory"
                time="0">

      </testcase>

      <system-out>
console.log(calling console.log , with some arguments , 5 , 6 , 7);

      </system-out>
      <system-err>

      </system-err>
   </testsuite>
</testsuites>
``````
