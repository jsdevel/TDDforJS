var assert = require('assert');
var resolver;

var resolveFn=function(){};
var statSyncFn=function(){};
var fsModule={
   statSync:function(path){
      return statSyncFn(path);
   }
};
var pathModule={
   resolve:function(path, path1){
      return resolveFn(path, path1);
   }
};

function before(){
   resolveFn=function(path, path1){
      return path+"/"+path1;
   };
   statSyncFn=function(){
      return {
         isFile:function(){
            return true;
         }
      };
   };
}

function test_src_should_be_required(){
   assert['throws'](function(){
      new UnitTestFileResolver(null, "asdf", pathModule, fsModule);
   }, "source base must be a string");
}
function test_unit_should_be_required(){
   assert['throws'](function(){
      new UnitTestFileResolver("asdf", null, pathModule, fsModule);
   }, "unit base must be a string");
}
function test_pathModule_should_be_the_path_module(){
   assert['throws'](function(){
      new UnitTestFileResolver("asdf", "asdf", {}, fsModule);
   });
}
function test_fsModule_should_be_the_fs_module(){
   assert['throws'](function(){
      new UnitTestFileResolver("asdf", "asdf", pathModule, {});
   });
}
function test_test_must_be_a_non_empty_string(){
   resolver = new UnitTestFileResolver(
      "/sourceBase",
      "/testBase",
      pathModule,
      fsModule
   );
   assert['throws'](function(){
      resolver.getFilePaths();
   }, "test was empty when it should not have been.");
}
function test_srcPath_and_unitPath_should_not_be_empty_when_they_exist(){
   resolver = new UnitTestFileResolver(
      "/sourceBase",
      "/testBase",
      pathModule,
      fsModule
   );
   var results = resolver.getFilePaths("foo");
   assert(results.srcPath, "srcPath was falsey.");
   assert(results.unitPath, "unitPath was falsey.");
   assert(!results.errors.length, "there were errors: "+results.errors);
}
function test_srcPath_and_unitPath_should_be_empty_when_they_do_not_exist(){
   statSyncFn=function(){
      return {
         isFile:function(){
            return false;
         }
      };
   };
   resolver = new UnitTestFileResolver(
      "/sourceBase",
      "/testBase",
      pathModule,
      fsModule
   );
   var results = resolver.getFilePaths("foo");
   assert(!results.srcPath, "srcPath was truthy.");
   assert(!results.unitPath, "unitPath was truthy.");
   assert(results.errors.length, "there were no errors: "+results.errors);
}
function test_srcPath_should_not_be_empty_if_unitPath_does_not_exist(){
   statSyncFn=function(path){
      var obj={};
      if(path === "/sourceBase/foo"){
         obj.isFile=function(){return true;};
      } else {
         obj.isFile=function(){return false;};
      }
      return obj;
   };
   resolver = new UnitTestFileResolver(
      "/sourceBase",
      "/testBase",
      pathModule,
      fsModule
   );
   var results = resolver.getFilePaths("foo");
   assert(results.srcPath, "srcPath was falsey.");
   assert(!results.unitPath, "unitPath was truthy.");
   assert(
      results.errors.length === 1,
      "there were no errors: "+results.errors
   );
}
function test_unitPath_should_not_be_empty_if_srcPath_does_not_exist(){
   statSyncFn=function(path){
      var obj={};
      if(path === "/sourceBase/foo"){
         obj.isFile=function(){return false;};
      } else {
         obj.isFile=function(){return true;};
      }
      return obj;
   };
   resolver = new UnitTestFileResolver(
      "/sourceBase",
      "/testBase",
      pathModule,
      fsModule
   );
   var results = resolver.getFilePaths("foo");
   assert(!results.srcPath, "srcPath was truthy.");
   assert(results.unitPath, "unitPath was falsey.");
   assert(
      results.errors.length === 1,
      "there were no errors: "+results.errors
   );
}