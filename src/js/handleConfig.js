/**
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

   src_dir=getMainDir('src');
   test_dir=getMainDir('test');
   js_dir=getSubDir(config.src, src_dir, 'js', 'src');
   units_dir=getSubDir(config.test, test_dir, 'units', 'test');
   integrations_dir=getSubDir(config.test, test_dir, 'integrations', 'test');

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
   function getSubDir(obj, base_dir, prop, name){
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
         logger.error("'"+dir+"' doesn't exist!");
         process.exit(1);
      }
      return dir;
   }
}