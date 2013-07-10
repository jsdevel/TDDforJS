//import lib/jsmockito
var assert=require('assert');
var resolver;
var mockFsModule;
var mockPathModule;
var baseDir;

function before(){
   mockFsModule=mock({
      readFileSync:function(){},
      statSync:function(){}
   });
   mockPathModule=mock({
      resolve:function(){}
   });
}

function test_constructor_should_require_arguments_and_validate_them(){
   var isDirectory=true;
   when(mockFsModule).statSync.call(mockFsModule, "asdf").thenReturn({
      isDirectory:function(){return isDirectory;}
   });
   assert['throws'](function(){
      new SuiteFileResolver(null, mockPathModule, "asdf");
   }, "fsModule was allowed to not be an object");
   assert['throws'](function(){
      new SuiteFileResolver(mockFsModule, null, "asdf");
   }, "pathModule was allowed to not be an object");
   assert['throws'](function(){
      new SuiteFileResolver(mockFsModule, mockPathModule, 5);
   }, "baseDir was allowed to not be a string");
   isDirectory=false;
   assert['throws'](function(){
      new SuiteFileResolver(mockFsModule, mockPathModule, "asdf");
   }, "baseDir wasn't required to exist.");
}
function test_constructor_should_be_ok_with_good_arguments(){
   when(mockFsModule).statSync.call(mockFsModule, "asdf").thenReturn({
      isDirectory:function(){return true;}
   });
   new SuiteFileResolver(mockFsModule, mockPathModule, "asdf");
}
function test_getSuite_should_throw_exception_when_suite_does_not_exist(){
   when(mockFsModule).statSync.call(mockFsModule, "/asdf").thenReturn({
      isDirectory:function(){return true;}
   });
   when(mockPathModule).resolve.call(mockPathModule, "/asdf", "foo.js").
      thenReturn("/asdf/foo.js");
   when(mockFsModule).statSync.call(mockFsModule, "/asdf/foo.js").thenReturn({
      isFile:function(){return false;}
   });
   resolver=new SuiteFileResolver(mockFsModule, mockPathModule, "/asdf");
   assert['throws'](function(){
      resolver.getSuite("foo.js");
   });
}
function test_getSuite_should_not_throw_an_exception_when_suite_exists(){
   var contents;
   when(mockFsModule).statSync.call(mockFsModule, "/asdf").thenReturn({
      isDirectory:function(){return true;},
      readFileSync:function(){}
   });
   when(mockPathModule).resolve.call(mockPathModule, "/asdf", "foo.js").
      thenReturn("/asdf/foo.js");
   when(mockFsModule).statSync.call(mockFsModule, "/asdf/foo.js").thenReturn({
      isFile:function(){return true;}
   });
   resolver=new SuiteFileResolver(mockFsModule, mockPathModule, "/asdf");
   when(mockFsModule).readFileSync.call(mockFsModule, "/asdf/foo.js", "UTF8").
      thenReturn("foo.js contents");
   contents=resolver.getSuite("foo.js");
   verify(mockFsModule).readFileSync("/asdf/foo.js", "UTF8");
   assert.equal(contents, "foo.js contents", "the wrong contents were returned.");
}