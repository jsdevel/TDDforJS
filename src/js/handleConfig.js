/**
 * @param {Object} result
 * @param {AppFactory} appFactory
 * @param {Object} templates
 */
function handleConfig(result, appFactory, templates){
   var logger = result.logger;
   var config = result.config;
   var sourceFileNamePatterns=config.src.names instanceof Array?
      config.src.names:
      [".*\\.js"];
   /** @type {Array} */
   var testFileNamePatterns=
      config.test.names instanceof Object?
         config.test.names:
         {
            "units":[".*\\.js"],
            "integrations":[".*\\.js"]
         };
   /** @type {Array} */
   var unitFileNamePatterns=
      testFileNamePatterns.units instanceof Array?
         testFileNamePatterns.units:
         [".*\\.js"];
   /** @type {Array} */
   var integrationFileNamePatterns=
      testFileNamePatterns.integrations instanceof Array?
         testFileNamePatterns.integrations:
         [".*\\.js"];
   var src_dir;
   var test_dir;
   var js_dir;
   var units_dir;
   var integrations_dir;
   var reporting_dir;
   var sources;
   var units;
   var integrations;
   /** @type {SuiteFileResolver} */
   var unitTestSuiteFileResolver;
   /** @type {SuiteFileResolver} */
   var integrationTestSuiteFileResolver;
   /** @type {TestSuites} */
   var unitTestSuites;
   /** @type {TestSuites} */
   var integrationTestSuites;
   /** @type {ImportResolver} */
   var importResolver;
   /** @type {TDDforJSEvaluator} */
   var evaluator;
   /** @type {string} */
   var report;
   /** @type {boolean} */
   var shouldOutputJunit;
   /** @type {boolean} */
   var shouldOutputTestNg;
   /** @type {Object} */
   var unitTestResults;
   /** @type {Object} */
   var integrationTestResults;

   src_dir=getMainDir('src');
   test_dir=getMainDir('test');
   js_dir=getSubDir(config.src, src_dir, 'js', 'src', false);
   units_dir=getSubDir(config.test, test_dir, 'units', 'test', false);
   integrations_dir=getSubDir(config.test, test_dir, 'integrations', 'test', true);

   importResolver=appFactory.makeImportResolver(src_dir, test_dir);
   evaluator = appFactory.makeTDDforJSEvaluator();

   sources        = getFiles(js_dir,          sourceFileNamePatterns, 100)
                     .map(getRelativePathFn(js_dir));
   units          = getFiles(units_dir,        unitFileNamePatterns,   100)
                     .map(getRelativePathFn(units_dir));
   integrations   = getFiles(integrations_dir, integrationFileNamePatterns, 100)
                     .map(getRelativePathFn(integrations_dir));

   unitTestSuiteFileResolver=appFactory.makeSuiteFileResolver(units_dir);
   integrationTestSuiteFileResolver=appFactory.makeSuiteFileResolver(integrations_dir);
   unitTestSuites=appFactory.makeTestSuites(
      units,
      unitTestSuiteFileResolver,
      importResolver,
      evaluator,
      function(unit){
         var unitPath=path.resolve(js_dir, unit);
         return fs.readFileSync(unitPath, "UTF8");
      }
   );
   integrationTestSuites=appFactory.makeTestSuites(
      integrations,
      integrationTestSuiteFileResolver,
      importResolver,
      evaluator,
      function(unit){
         //do nothing for integration tests.  They're not backed by a unit.
      }
   );
   unitTestResults=unitTestSuites.getResults();
   integrationTestResults=integrationTestSuites.getResults();

   if(config.reporting){
      if(config.reporting.mode === 'cli'){
         report = templates.reporting.cli({
            units:units.length&&unitTestResults,
            integrations:integrations.length&&integrationTestResults
         });
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
            if(units.length){
               fs.writeFileSync(
                    path.resolve(
                        reporting_dir,
                        "Test-Units-TDDforJS.xml"
                     ),
                     templates.reporting.junit(unitTestResults),
                     "UTF8"
               );
            }
            if(integrations.length){
               fs.writeFileSync(
                    path.resolve(
                        reporting_dir,
                        "Test-Integrations-TDDforJS.xml"
                     ),
                     templates.reporting.junit(integrationTestResults),
                     "UTF8"
               );

            }
         }
      }
   }

   function getRelativePathFn(base){
      return function(v){
         return v.
            substring(base.length+1);
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
}