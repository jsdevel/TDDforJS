/**
 * @param {Object} result
 * @param {AppFactory} appFactory
 */
function handleConfig(result, appFactory, templates){
   var logger = result.logger;
   var config = result.config;
   var src_dir;
   var test_dir;
   var units_dir;
   var integrations_dir;
   var sources;
   var units;
   var integrations;
   var sourceFilePatterns = ['.*\\.js$'];
   var testFilePatterns   = sourceFilePatterns;
   /** @type {UnitTestReporter} */
   var unitReporter;
   /** @type {UnitTestRunner} */
   var unitRunner;
   /** @type {FileResolver} */
   var fileResolver;
   /** @type {TDDforJSEvaluator} */
   var evaluator;
   /** @type {string} */
   var report;

   src_dir=getMainDir('src');
   test_dir=getMainDir('test');
   units_dir=getTestDir(config.test, test_dir, 'units');
   integrations_dir=getTestDir(config.test, test_dir, 'integrations');

   fileResolver=appFactory.makeFileResolver(src_dir, units_dir);
   evaluator = appFactory.makeTDDforJSEvaluator();

   sources        = getFiles(src_dir,          sourceFilePatterns, 100)
                     .map(getRelativePathFn(src_dir));
   units          = getFiles(units_dir,        testFilePatterns,   100)
                     .map(getRelativePathFn(units_dir));
   integrations   = getFiles(integrations_dir, testFilePatterns,   100)
                     .map(getRelativePathFn(integrations_dir));

   unitReporter = appFactory.makeUnitTestReporter(sources, units);
   unitRunner = appFactory.makeUnitTestRunner(
      evaluator,
      unitReporter,
      fileResolver
   );

   unitRunner.run();

   if(config.reporting.mode === 'cli'){
      report = templates.reporting.cli(unitReporter);
      console.log(report);
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
   function getTestDir(obj, base_dir, prop){
      var dir;
      var default_dir = prop;
      if(obj[prop]){
         dir = path.resolve(base_dir, obj[prop]);
         logger.debug("\"test."+prop+"\" is: "+dir);
      } else {
         dir = path.resolve(base_dir, default_dir);
         logger.info("\"test."+prop+"\" wasn't defined in the config.");
         logger.info("Using '"+prop+"' by default.");
      }
      if(!fs.existsSync(dir)){
         logger.error("'"+dir+"' doesn't exist!");
         process.exit(1);
      }
      return dir;
   }
}