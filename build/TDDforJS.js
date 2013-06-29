#!/bin/env node
/**
 * @constructor
 */
function TDDforJSEvaluator(){
   var __$$__originalGlobalScope={};
   var __$$__globalScope=(function(){return this;})();
   var __$$__reset=function(){
      var __$$__name;
      for(__$$__name in __$$__globalScope){
         if(!(__$$__name in __$$__originalGlobalScope)){
            __$$__globalScope[__$$__name]=void 0;
         } else {
            __$$__globalScope[__$$__name]=__$$__originalGlobalScope[__$$__name];
         }
      }
   };
   var __$$__store=function(){
      var __$$__name;
      for(__$$__name in __$$__globalScope){
         __$$__originalGlobalScope[__$$__name]=__$$__globalScope[__$$__name];
      }
   };
   /**
    * @param {string} code
    * @param {Object} mappedResults
    * @returns {unresolved}
    */
   this.eval=function(code, __$$__mappedResults){
      return eval(code);
   };
}
!function(){/**
 * @constructor
 * @param {Object} fsModule
 * @param {Object} pathModule
 */
function AppFactory(fsModule, pathModule){

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
    * @param {string} sourcePath
    * @param {string} unitPath
    * @return {TDDforJSEvaluator}
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
    * @param {TDDforJSEvaluator} evaluator
    * @param {UnitTestReporter} reporter
    * @param {UnitTestResolver} unitTestResolver
    * @param {ImportResolver} importResolver
    * @returns {UnitTestRunner}
    */
   this.makeUnitTestRunner=function(
      evaluator,
      reporter,
      unitTestResolver,
      importResolver
   ){
      return new UnitTestRunner(
         evaluator,
         reporter,
         unitTestResolver,
         importResolver
      );
   };
}/**
 * @constructor
 * @param {Object} fsModule
 * @param {Object} pathModule
 * @param {string} sourceBase
 * @param {string} testBase
 */
function ImportResolver(
   fsModule,
   pathModule,
   sourceBase,
   testBase
){
   /**
    * @param {string} path
    * @returns {string} contents of the path
    */
   this.resolve=function(path){
      var file;
      file = pathModule.resolve(testBase, path+".js");
      if(fsModule.existsSync(file)){
         return fsModule.readFileSync(file, "UTF8");
      }

      file = pathModule.resolve(sourceBase, path+".js");
      if(fsModule.existsSync(file)){
         return fsModule.readFileSync(file, "UTF8");
      }

      throw "Couldn't find the following path: "+path+".js";
   };
}/**
 * @constructor
 * @param {Object} fsModule
 * @param {Object} pathModule
 * @param {string} src base path to source dir
 * @param {string} unit base path to unit test dir
 */
function UnitTestResolver(
   fsModule,
   pathModule,
   src,
   unit
){
   /**
    * @param {string} file
    * @returns {string}
    */
   this.getSource=function(file){
      return fsModule.readFileSync(pathModule.resolve(src, file), "UTF8");
   };
   /**
    * @param {string} file
    * @returns {string}
    */
   this.getUnit=function(file){
      return fsModule.readFileSync(pathModule.resolve(unit, file), "UTF8");
   };
}/**
 * @constructor
 * @param {Array.<string>} sources
 * @param {Array.<string>} units
 */
function UnitTestReporter(sources, units){
   /** @type {boolean} */
   var isAnalyzed=false;
   /** @type {boolean} */
   var isCoverageMapFilled=false;
   /** @type {boolean} */
   var hasMissingTests=false;
   /** @enum {string} */
   var coverageMap = {};
   /** @type {Array.<string>} */
   var unitTestsBackedBySource = [];
   /** @type {Array.<string>} */
   var unitTestsNotBackedBySource = [];
   /** @type {number} */
   var numberOfSources=0;
   /** @type {Object} */
   var sourceErrors={};
   /** @type {Object} */
   var testErrors={};
   /** @type {Object} */
   var testResults={};
   /** @type {number} */
   var testsRun=0;
   /** @type {number} */
   var testsFailed=0;
   /** @type {number} */
   var testsPassed=0;

   /**
    * @returns {number}
    */
   this.getNumberOfTestSuites=function(){
      fillCoverageMap();
      return unitTestsBackedBySource.length;
   };

   /**
    * @returns {number}
    */
   this.getNumberOfTestsFailed=function(){
      analyzeOnce();
      return testsFailed;
   };

   /**
    * @returns {number}
    */
   this.getNumberOfTestsPassed=function(){
      analyzeOnce();
      return testsPassed;
   };

   /**
    * @returns {number}
    */
   this.getNumberOfTestsRun=function(){
      analyzeOnce();
      return testsRun;
   };

   /**
    * @returns {number}
    */
   this.getPercentUnitTested=function(){
      fillCoverageMap();
      return (unitTestsBackedBySource.length/numberOfSources)*100||0;
   };
   /**
    *
    * @returns {Object}  This is a reference.  Modify it at your own peril.
    */
   this.getResults=function(){
      return testResults;
   };
   /**
    * @returns {Array}
    */
   this.getSourcesToTest=function(){
      fillCoverageMap();
      return [].concat(unitTestsBackedBySource);
   };
   /**
    * @returns {boolean}
    */
   this.hasMissingTests=function(){
      fillCoverageMap();
      return hasMissingTests;
   };

   /**
    * @param {string} source
    * @param {string} error
    */
   this.reportErrorInSource=function(source, error){
      sourceErrors[source] = error;
   };

   /**
    * @param {string} test
    * @param {string} error
    */
   this.reportErrorInTest=function(test, error){
      testErrors[test] = error;
   };

   this.setTestResults=function(test, results){
      testResults[test]=results;
   };

   /**
    * This should be cached to only run once.  It sets the internal state of
    * the Reporter.
    */
   function analyzeOnce(){
      fillCoverageMap();
      if(!isAnalyzed){
         isAnalyzed=true;
         unitTestsBackedBySource.forEach(function(v1){
            var results=testResults[v1];
            testsRun += results.testsRun;
            testsFailed += results.testsFailed;
            testsPassed += results.testsPassed;
         });
      }
   }

   function fillCoverageMap(){
      var source;
      if(!isCoverageMapFilled){
         isCoverageMapFilled=true;
         numberOfSources=sources.length;
         sources.forEach(function(v){
            coverageMap[v] = false;
         });
         units.forEach(function(v){
            if(v in coverageMap){
               coverageMap[v] = true;
               unitTestsBackedBySource.push(v);
            }
            if(!(v in coverageMap)){
               unitTestsNotBackedBySource.push(v);
            }
         });
         for(source in coverageMap){
            if(!coverageMap[source]){
               hasMissingTests=true;
               break;
            }
         }
      }
   }
}/**
 * @constructor
 * @param {TDDforJSEvaluator} evaluator
 * @param {UnitTestReporter} reporter
 * @param {UnitTestResolver} unitTestResolver
 * @param {ImportResolver} importResolver
 */
function UnitTestRunner(
   evaluator,
   reporter,
   unitTestResolver,
   importResolver
){
   /** @type {boolean} */
   var hasRun=false;

   /** @type {RegExp} */
   var reg_imports=/^\/\/import\s+(.+)/gm;
   /** @type {RegExp} */
   var reg_test=/^function\s+(test_[a-zA-Z0-9_$]+)/gm;
   /** @type {RegExp} */
   var reg_testAfter=/^function\s+after[^a-zA-Z0-9_$]+/m;
   /** @type {RegExp} */
   var reg_testBefore=/^function\s+before[^a-zA-Z0-9_$]+/m;

   this.run=function(){
      if(hasRun){
         return;
      }
      hasRun=true;

      reporter.getSourcesToTest().forEach(function(path){
         /** @type {string} */
         var src=unitTestResolver.getSource(path);
         /** @type {string} */
         var unit=unitTestResolver.getUnit(path);
         /** @type {Array} */
         var importMatch;
         /** @type {Array} */
         var testMatch;
         /** @type {Array} */
         var tests = [];
         /** @type {string} */
         var taintedSrcError="";
         /** @type {string} */
         var taintedTestError="";
         /** @type {string} */
         var testString="";
         /** @type {boolean} */
         var hasAfter=false;
         /** @type {boolean} */
         var hasBefore=false;
         /** @type {Object} */
         var results={
            taintedSrcError:"",
            taintedTestError:"",
            tests:{},
            testsRun:0,
            testsPassed:0,
            testsFailed:0
         };

         if(taintedSrcError=tainted(src)){
            reporter.reportErrorInSource(path, taintedSrcError);
         }
         if(taintedTestError=tainted(src)){
            reporter.reportErrorInSource(path, taintedTestError);
         }
         if(taintedSrcError || taintedTestError){
            if(taintedSrcError){
               results.taintedSrcError=taintedSrcError;
            }
            if(taintedTestError){
               results.taintedTestError=taintedTestError;
            }
         } else {
            hasAfter=reg_testAfter.test(unit);
            hasBefore=reg_testBefore.test(unit);

            while(testMatch=reg_test.exec(unit)){
               tests.push(testMatch[1]);
            }
            while(importMatch=reg_imports.exec(unit)){
               testString+=importResolver.resolve(importMatch[1]);
            }

            if(tests.length){
               tests.forEach(function(test){
                  testString+=[
                     "__$$__mappedResults.testsRun++;",
                     "__$$__store();",
                     "try{",
                     hasBefore?"before();":"",
                     test+"();",
                     hasAfter?"after();":"",
                     "__$$__mappedResults.tests['"+test+"']=true;",
                     "__$$__mappedResults.testsPassed++;",
                     "}catch(e){",
                     "__$$__mappedResults.tests['"+test+"']=e;",
                     "__$$__mappedResults.testsFailed++;",
                     "}",
                     "__$$__reset();"
                  ].join('\n');
               });
               testString = [
                  src,
                  ";(function(){",
                  unit,
                  ";(function(){",
                  testString,
                  "})();",
                  "})();"
               ].join('\n');
               evaluator.eval(testString, results);
            }
         }
         reporter.setTestResults(path, results);
      });
   };

   /**
    * Tests to see if any type / runtime errors exist in the code.
    * @param {string} code
    * @return {string} error message if one exists, empty string if all is well.
    */
   function tainted(code){
      try {
         eval(code);
         return "";
      } catch(e){
         return ""+e;
      }
   }
}/**
 *
 * @param {string} base
 * @param {Array.<string>} patternStrings
 * @param {number} maxRecursion
 * @param {number=} timesCalled <b>Note: Internal only.</b>
 * @param {Array.<RegExp>=} patterns <b>Note: Internal only.</b>
 * @returns {Array.<string>}
 */
function getFiles(base, patternStrings, maxRecursion, timesCalled, patterns){
   /** @type {Array}*/
   var called = (++timesCalled || 0);
   /** @type {Array}*/
   var filesToReturn = [];
   if(!base){
      return filesToReturn;
   }
   if(called > maxRecursion){
      throw (
         "getFiles - It looks like there's a circular link somewhere in: "+base
      );
   }
   if(!patterns){
      patterns = [];
      patternStrings.forEach(function(v){
         patterns.push(new RegExp(v));
      });
   }

   fs.readdirSync(base).forEach(function(v){
      var file = path.resolve(base, v);
      var stats = fs.statSync(file);
      var moreFiles;
      var i;
      if(stats.isDirectory()){
         moreFiles=getFiles(
            file,
            patternStrings,
            maxRecursion,
            called,
            patterns
         );
         filesToReturn = filesToReturn.concat(moreFiles);
      } else {
         if(!patterns.length){
            filesToReturn.push(file);
         } else {
            for(i=0;i<patterns.length;i++){
               if(patterns[i].test(file)){
                  filesToReturn.push(file);
                  break;
               }
            }
         }
      }
   });

   return filesToReturn;
}/**
 * @param {Object} result
 * @param {AppFactory} appFactory
 * @param {Object} templates
 */
function handleConfig(result, appFactory, templates){
   var logger = result.logger;
   var config = result.config;
   var src_dir;
   var test_dir;
   var js_dir;
   var units_dir;
   var integrations_dir;
   var reporting_dir;
   var sources;
   var units;
   var integrations;
   var sourceFilePatterns = ['.*\\.js$'];
   var testFilePatterns   = sourceFilePatterns;
   /** @type {UnitTestReporter} */
   var unitReporter;
   /** @type {UnitTestRunner} */
   var unitRunner;
   /** @type {UnitTestResolver} */
   var unitTestResolver;
   /** @type {ImportResolver} */
   var importResolver;
   /** @type {TDDforJSEvaluator} */
   var evaluator;
   /** @type {string} */
   var report;
   /** @type {string} */
   var testSuiteName;
   /** @type {boolean} */
   var shouldOutputJunit;
   /** @type {boolean} */
   var shouldOutputTestNg;

   src_dir=getMainDir('src');
   test_dir=getMainDir('test');
   js_dir=getSubDir(config.src, src_dir, 'js', 'src', false);
   units_dir=getSubDir(config.test, test_dir, 'units', 'test', false);
   integrations_dir=getSubDir(config.test, test_dir, 'integrations', 'test', true);

   unitTestResolver=appFactory.makeUnitTestResolver(js_dir, units_dir);
   importResolver=appFactory.makeImportResolver(src_dir, test_dir);
   evaluator = appFactory.makeTDDforJSEvaluator();

   sources        = getFiles(js_dir,          sourceFilePatterns, 100)
                     .map(getRelativePathFn(js_dir));
   units          = getFiles(units_dir,        testFilePatterns,   100)
                     .map(getRelativePathFn(units_dir));
   integrations   = getFiles(integrations_dir, testFilePatterns,   100)
                     .map(getRelativePathFn(integrations_dir));

   unitReporter = appFactory.makeUnitTestReporter(sources, units);
   unitRunner = appFactory.makeUnitTestRunner(
      evaluator,
      unitReporter,
      unitTestResolver,
      importResolver
   );

   unitRunner.run();

   if(config.reporting){
      if(config.reporting.mode === 'cli'){
         report = templates.reporting.cli(unitReporter);
         console.log(report);
      }
      if(config.reporting.output && config.reporting.base){
         if(config.reporting.output.types){
            shouldOutputJunit = config.reporting.output.types.junit;
            shouldOutputTestNg = config.reporting.output.types.testng;
         }
         reporting_dir = path.resolve(result.dir, config.reporting.base);
         if(
            (
               shouldOutputJunit ||
               shouldOutputTestNg
            ) &&
            !fs.existsSync(reporting_dir)){
            logger.warn(
               "The following reports directory wasn't found: "+reporting_dir+
               "\nCreating it now..."
            );
            fs.mkdir(reporting_dir);
         }
         if(shouldOutputJunit){
            var results = unitReporter.getResults();
            for(testSuiteName in results){
               fs.writeFileSync(
                    path.resolve(
                        reporting_dir,
                        testSuiteName.
                           replace(/\//g, ".").
                           replace(/\.js$/, ".xml")
                     ),
                     templates.reporting.junit(
                        results[testSuiteName],
                        {name:testSuiteName}
                     ),
                     "UTF8"
               );
            }
         }
      }
   }

   function getRelativePathFn(base){
      return function(v){
         return v.substring(base.length+1);
      };
   }
   function getMainDir(ns){
      var dir;
      if(!config[ns]){
         logger.error("\""+ns+"\" wasn't defined in the config.  Exiting...");
         process.exit(1);
      } else if(!config[ns].base){
         logger.error("\""+ns+".base\" wasn't defined in the config.  Exiting...");
         process.exit(1);
      } else {
         dir = path.resolve(result.dir, config[ns].base);
         logger.debug("\""+ns+"\" is: "+dir);
         if(!fs.existsSync(dir)){
            logger.error("'"+dir+"' doesn't exist!");
            process.exit(1);
         }
         return dir;
      }
   }
   function getSubDir(obj, base_dir, prop, name, canIgnore){
      var dir;
      var default_dir = prop;
      if(obj[prop]){
         dir = path.resolve(base_dir, obj[prop]);
         logger.debug("\""+name+"."+prop+"\" is: "+dir);
      } else {
         dir = path.resolve(base_dir, default_dir);
         logger.info("\""+name+"."+prop+"\" wasn't defined in the config.");
         logger.info("Using '"+prop+"' by default.");
      }
      if(!fs.existsSync(dir)){
         logger.error(
            "'"+dir+"' doesn't exist!  "+
            "You should create it, or "+
            "change the location in the config!"
         );
         if(canIgnore){
            dir = "";
         } else {
            process.exit(1);
         }
      }
      return dir;
   }
}var configTools = require('config-tools');
var fs   = require('fs');
var path = require('path');
var templates = eval(fs.readFileSync(path.resolve(__dirname, "reporting.js"), "UTF8"));

configTools.getConfig('tddforjs', function(config){
   handleConfig(config, new AppFactory(fs, path), templates);
});

}();