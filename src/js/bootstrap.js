var configTools = require('config-tools');
var fs   = require('fs');
var path = require('path');
var templates = eval(fs.readFileSync(path.resolve(__dirname, "reporting.js"), "UTF8"));
var session={};

configTools.getConfig(
   'tddforjs',
   function(config){
      process.chdir(
         path.resolve(
            config.dir,
            config.project && config.project.base || process.cwd()
         )
      );

      handleConfig(
         config,
         new AppFactory(
            fs,
            path,
            require('os').hostname(),
            session
         ),
         templates
      );
   },
   function(fileName, logger, isFound){
      if(!isFound){
         handleNoConfig(
            fileName,
            logger,
            fs,
            path,
            process,
            fs.readFileSync(
               path.resolve(__dirname, "../src/js/default-config.json"),
               "UTF8"
            )
         );
      }
   }
);

