/**
 * @constructor
 * @param {Object} fsModule
 * @param {Object} pathModule
 * @param {string} baseDir
 */
function SuiteFileResolver(
   fsModule,
   pathModule,
   baseDir
){
   if(!(fsModule instanceof Object)){
      throw new Error("fsModule wasn't an fs module.");
   }
   if(!(pathModule instanceof Object)){
      throw new Error("pathModule wasn't an fs module.");
   }
   if(!baseDir || typeof baseDir !== 'string'){
      throw new Error("baseDir wasn't a non empty string.");
   }
   if(!fsModule.statSync(baseDir).isDirectory()){
      throw new Error(
         "baseDir didn't refer to a directory.  The path was: "+
         baseDir
      );
   }

   this.getSuite=function(suite){
      var suitePath=pathModule.resolve(baseDir, suite);
      if(!fsModule.statSync(suitePath).isFile()){
         throw new Error(
            "suite wasn't an existing file.  The path was: "+
            suitePath
         );
      }
      return fsModule.readFileSync(suitePath, "UTF8");
   };
}