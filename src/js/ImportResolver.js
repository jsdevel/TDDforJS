/**
 * This class imports sources from the source and test path given.
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
   if(!(fsModule instanceof Object)){
      throw new Error("fsModule wasn't an instance of the fs module.");
   }
   if(!(pathModule instanceof Object)){
      throw new Error("pathModule wasn't an instance of the path module.");
   }
   if(typeof sourceBase !== "string"){
      throw new Error("sourceBase wasn't a string.");
   }
   if(!sourceBase){
      throw new Error("sourceBase was empty.");
   }
   if(typeof testBase !== "string"){
      throw new Error("testBase wasn't a string.");
   }
   if(!testBase){
      throw new Error("testBase was empty.");
   }

   /** @type {RegExp} */
   var reg_imports=/^((?:\/\/import\s+[^\r\n]+\r?\n)+)/;
   var reg_import=/^\/\/import\s+(.+)/gm;

   /**
    * @param {string} path
    * @returns {string} contents of the path
    */
   this.getImportsFrom=function(source){
      var importBlockMatch=reg_imports.exec(source);
      var importBlock;
      var imports=[];
      var importPath;

      if(!source || typeof source !== "string"){
         return "";
      }
      if(!importBlockMatch){
         return "";
      } else {
         importBlock=importBlockMatch[1];
      }

      while(importPath=reg_import.exec(importBlock)){
         imports.push(importPath[1]);
      }
      if(!imports.length){
         return "";
      }

      imports.forEach(function(path, index){
         var file;
         file = pathModule.resolve(testBase, path+".js");
         if(fsModule.existsSync(file) && fsModule.statSync(file).isFile()){
            imports[index]=fsModule.readFileSync(file, "UTF8");
            return;
         }
         file = pathModule.resolve(sourceBase, path+".js");
         if(fsModule.existsSync(file) && fsModule.statSync(file).isFile()){
            imports[index]=fsModule.readFileSync(file, "UTF8");
            return;
         }
         imports[index]=[
            "throw new Error(\"Couldn't find '",
            path.replace(/"/g, "\\\""),
            ".js' searching in '",
            testBase.replace(/"/g, "\\\""),
            "' and '",
            sourceBase.replace(/"/g, "\\\""),
            "'.\");"
         ].join('');
      });

      return imports.join('\n');
   };
}