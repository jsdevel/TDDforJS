/**
 * @param {string} fileName
 * @param {Logger} logger
 * @param {Object} fsModule
 * @param {Object} pathModule
 * @param {Object} process
 * @param {string} defaultConfig
 */
function handleNoConfig(
   fileName,
   logger,
   fsModule,
   pathModule,
   process,
   defaultConfig
){
   var cwd=process.cwd();
   var configDir=pathModule.resolve(
      cwd,
      'config'
   );
   var pathToCreateConfig = pathModule.resolve(
      configDir,
      fileName
   );
   if(!fsModule.existsSync(configDir)){
      fsModule.mkdirSync(configDir);
   }

   if(!fsModule.statSync(configDir).isDirectory()){
      logger.error("configDir wasn't a directory at: "+configDir);
   } else {
      logger.warn("Creating the default config file now at: ");
      logger.warn(pathToCreateConfig);
      logger.warn("You may want to inspect it's values before running again.");
      fsModule.writeFileSync(
         pathToCreateConfig,
         defaultConfig,
         "UTF8"
      );
   }
}