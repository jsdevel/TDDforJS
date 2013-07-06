/**
 * @constructor
 * @param {string} srcBase
 * @param {string} unitBase
 * @param {Object} pathModule
 * @param {Object} fsModule
 */
function UnitTestFileResolver(
   srcBase,
   unitBase,
   pathModule,
   fsModule
){
   if(typeof srcBase !== 'string'){
      throw "srcBase wasn't a string.";
   }
   if(typeof unitBase !== 'string'){
      throw "testBase wasn't a string.";
   }
   if(
      !(pathModule instanceof Object) ||
      typeof pathModule.resolve !== 'function'
   ){
      throw "pathModule wasn't the path module.";
   }
   if(
      !(fsModule instanceof Object) ||
      typeof fsModule.statSync !== 'function'
   ){
      throw "fsModule wasn't the fs module.";
   }

   /**
    * Returns an object containing the file path for both the source file and
    * the unit file.  The returned object will also contain errors if any
    * occurred while trying to locate the sources.
    *
    * @param {string} test relative path to test and src.
    * @returns {Object}
    */
   this.getFilePaths=function(test){
      if(!test || typeof test !== 'string'){
         throw "test must be a non empty string.";
      }
      var src=pathModule.resolve(srcBase, test);
      var unit=pathModule.resolve(unitBase, test);
      var errors=[];
      var results={
         "srcPath":src,
         "unitPath":unit,
         "errors":errors
      };
      if(!fsModule.statSync(src).isFile()){
         results.srcPath="";
         errors.push("src isn't a file: "+src);
      }
      if(!fsModule.statSync(unit).isFile()){
         results.unitPath="";
         errors.push("unit isn't a file: "+unit);
      }
      return results;
   };
}