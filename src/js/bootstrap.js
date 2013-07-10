var configTools = require('config-tools');
var fs   = require('fs');
var path = require('path');
var templates = eval(fs.readFileSync(path.resolve(__dirname, "reporting.js"), "UTF8"));

configTools.getConfig(
   'tddforjs',
   function(config){
      handleConfig(config, new AppFactory(fs, path, require('os').hostname()), templates);
   },
   function(fileName, logger){
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
);

