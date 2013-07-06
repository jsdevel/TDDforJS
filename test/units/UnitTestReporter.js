var assert=require('assert');
var sources;
var units;
var reporter;

function before(){
}

function number_of_suites_should_reflect_number_of_units(){
   units=['foo'];
   sources=['foo'];
   reporter = new UnitTestReporter(units, sources);
   console.log(reporter.getNumberOfTestSuites());
}