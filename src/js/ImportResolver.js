/**
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
}