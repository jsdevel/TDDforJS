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
   var pathToCreateConfig = pathModule.resolve(
      process.cwd(),
      'config',
      fileName
   );
   logger.warn("Creating the default config file now at: ");
   logger.warn(pathToCreateConfig);
   logger.warn("You may want to inspect it's values before running again.");
   fsModule.writeFileSync(
      pathToCreateConfig,
      defaultConfig,
      "UTF8"
   );
}