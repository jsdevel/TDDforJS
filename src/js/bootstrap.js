var configTools = require('config-tools');
var fs   = require('fs');
var path = require('path');
var templates = eval(fs.readFileSync(path.resolve(__dirname, "reporting.js"), "UTF8"));

configTools.getConfig('tddforjs', function(config){
   handleConfig(config, new AppFactory(fs, path), templates);
});

