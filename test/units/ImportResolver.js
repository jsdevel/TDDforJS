//import lib/jsmockito

var resolver;
var mockFsModule;
var mockPathModule;
var pathModule;
var sourceBase = "/src";
var testBase = "/test";
var result;

function before(){
   mockFsModule=mock({
      statSync:function(){},
      readFileSync:function(){}
   });
   mockPathModule=mock({
      resolve:function(){}
   });
   when(mockFsModule).statSync(string()).thenReturn({
      isFile:function(){return true;}
   });
   resolver = new ImportResolver(
      mockFsModule,
      mockPathModule,
      sourceBase,
      testBase
   );
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
function files_under_the_test_dir_should_be_imported_over_files_under_the_source_dir(){
   result=resolver.getImportsFrom("foo");
   //verify(mockFsModule, times(1)).readFileSync("/test/foo.js", "UTF8");
}
//Test
function non_existant_files_under_the_test_dir_should_not_be_imported_over_files_under_the_source_dir(){
   //when(mockFsModule).existsSync("/test/foo.js").thenReturn(false);
   //when(mockFsModule).existsSync("/src/foo.js").thenReturn(true);
   resolver.getImportsFrom("foo");
   //verify(mockFsModule, times(1)).readFileSync("/src/foo.js", "UTF8");
}
//Test
function an_exception_should_be_thrown_when_the_file_does_not_exist_in_either_src_or_test(){
   //when(mockFsModule).existsSync("/test/foo.js").thenReturn(false);
   //when(mockFsModule).existsSync("/src/foo.js").thenReturn(false);
   //resolver.getImportsFrom("foo");
}