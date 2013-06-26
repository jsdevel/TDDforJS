/**
 * @constructor
 * @param {Object} fsModule
 * @param {Object} pathModule
 * @param {string} src base path to source dir
 * @param {string} unit base path to unit test dir
 */
function UnitTestResolver(
   fsModule,
   pathModule,
   src,
   unit
){
   /**
    * @param {string} file
    * @returns {string}
    */
   this.getSource=function(file){
      return fsModule.readFileSync(pathModule.resolve(src, file), "UTF8");
   };
   /**
    * @param {string} file
    * @returns {string}
    */
   this.getUnit=function(file){
      return fsModule.readFileSync(pathModule.resolve(unit, file), "UTF8");
   };
}