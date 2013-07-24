//import lib/jsmockito

var resolver;
var mockFsModule;
var mockPathModule;
var pathModule;
var sourceBase = "/src";
var testBase = "/test";
var result;

function before(){
   createFsMock();
   mockPathModule={
      resolve:function(base, last){return base+"/"+last;}
   };
   when(mockFsModule).statSync(string()).thenReturn({
      isFile:function(){return true;}
   });
   createResolver();
}

//Test
function fsModule_must_be_an_instance_of_the_fs_module(){
   assert['throws'](function(){
      new ImportResolver(null, mockPathModule, sourceBase, testBase);
   });
   new ImportResolver(mockFsModule, mockPathModule, sourceBase, testBase);
}
//Test
function pathModule_must_be_an_instance_of_the_path_module(){
   assert['throws'](function(){
      new ImportResolver(mockFsModule, null, sourceBase, testBase);
   });
   new ImportResolver(mockFsModule, mockPathModule, sourceBase, testBase);
}
//Test
function sourceBase_must_be_a_string(){
   assert['throws'](function(){
      new ImportResolver(mockFsModule, mockPathModule, null, testBase);
   });
   new ImportResolver(mockFsModule, mockPathModule, sourceBase, testBase);
}
//Test
function sourceBase_must_not_be_empty(){
   assert['throws'](function(){
      new ImportResolver(mockFsModule, mockPathModule, "", testBase);
   });
   new ImportResolver(mockFsModule, mockPathModule, sourceBase, testBase);
}
//Test
function testBase_must_be_a_string(){
   assert['throws'](function(){
      new ImportResolver(mockFsModule, mockPathModule, sourceBase, null);
   });
   new ImportResolver(mockFsModule, mockPathModule, sourceBase, testBase);
}
//Test
function testBase_must_not_be_empty(){
   assert['throws'](function(){
      new ImportResolver(mockFsModule, mockPathModule, sourceBase, "");
   });
   new ImportResolver(mockFsModule, mockPathModule, sourceBase, testBase);
}
//Test
function empty_string_should_be_returned_if_source_is_not_a_string(){
   assert.equal(resolver.getImportsFrom(5), "");
   assert.equal(resolver.getImportsFrom(null), "");
}
//Test
function empty_string_should_be_returned_if_source_is_an_empty_string(){
   assert.equal(resolver.getImportsFrom(""), "");
}
//Test
function empty_string_should_be_returned_if_no_imports_are_defined_in_source(){
   assert.equal(resolver.getImportsFrom([
      "function asdfasdf(){}",
      "var foooooooo;"
   ]), "");
}
//Test
function files_under_the_test_dir_should_be_imported_over_files_under_the_source_dir_when_files_exist_in_both_locations(){
   when(mockFsModule).existsSync(startsWith(testBase)).thenReturn(true);
   result=resolver.getImportsFrom("//import foo\n//import boo");
   verify(mockFsModule, times(1)).existsSync("/test/foo.js");
   verify(mockFsModule, times(0)).existsSync("/src/foo.js");
   verify(mockFsModule, times(1)).statSync("/test/foo.js");
   verify(mockFsModule, times(0)).statSync("/src/foo.js");
   verify(mockFsModule, times(1)).readFileSync("/test/foo.js", "UTF8");
   verify(mockFsModule, times(0)).readFileSync("/src/foo.js", "UTF8");
}
//Test
function non_existant_files_under_the_test_dir_should_not_be_imported_over_files_under_the_source_dir(){
   when(mockFsModule).statSync("/test/foo.js").thenReturn({
      isFile:function(){return false;}
   });
   when(mockFsModule).readFileSync("/src/foo.js", "UTF8").thenReturn("foo source");
   when(mockFsModule).existsSync(startsWith(testBase)).thenReturn(false);
   when(mockFsModule).existsSync(startsWith(sourceBase)).thenReturn(true);
   result=resolver.getImportsFrom("//import foo\n//import boo\n");
   verify(mockFsModule, times(1)).existsSync("/test/foo.js");
   verify(mockFsModule, times(1)).existsSync("/src/foo.js");
   verify(mockFsModule, times(0)).statSync("/test/foo.js");
   verify(mockFsModule, times(1)).statSync("/src/foo.js");
   verify(mockFsModule, times(1)).readFileSync("/src/foo.js", "UTF8");
   assert(result.indexOf("foo source") > -1, "source was not added to imports");
}
//Test
function an_exception_should_be_thrown_when_the_file_does_not_exist_in_either_src_or_test(){
   when(mockFsModule).existsSync(startsWith(testBase)).thenReturn(false);
   when(mockFsModule).existsSync(startsWith(sourceBase)).thenReturn(false);
   result=resolver.getImportsFrom("//import foo\n//import boo\n");
   verify(mockFsModule, times(2)).existsSync(startsWith(testBase));
   verify(mockFsModule, times(2)).existsSync(startsWith(sourceBase));
   verify(mockFsModule, times(0)).statSync(startsWith(testBase));
   verify(mockFsModule, times(0)).statSync(startsWith(sourceBase));
   assert(result.indexOf('throw new Error') > -1, "no error js was added to the imports.");
}

function createFsMock(){
   mockFsModule=mock({
      existsSync:function(){},
      statSync:function(){},
      readFileSync:function(){}
   });
}
function createResolver(){
   resolver = new ImportResolver(
      mockFsModule,
      mockPathModule,
      sourceBase,
      testBase
   );
}