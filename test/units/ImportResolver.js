//import lib/jsmockito

var resolver;
var fsModule;
var pathModule;
var sourceBase = "/src";
var testBase = "/test";

function before(){
   fsModule=mock({
      existsSync:function(){},
      readFileSync:function(){}
   });
   resolver = new ImportResolver(
      fsModule,
      require('path'),
      sourceBase,
      testBase
   );
}

function test_files_under_the_test_dir_should_be_imported_over_files_under_the_source_dir(){
   when(fsModule).existsSync("/test/foo.js").thenReturn(true);
   resolver.resolve("foo");
   verify(fsModule, times(1)).readFileSync("/test/foo.js", "UTF8");
}
function test_non_existant_files_under_the_test_dir_should_not_be_imported_over_files_under_the_source_dir(){
   when(fsModule).existsSync("/test/foo.js").thenReturn(false);
   when(fsModule).existsSync("/src/foo.js").thenReturn(true);
   resolver.resolve("foo");
   verify(fsModule, times(1)).readFileSync("/src/foo.js", "UTF8");
}
function test_an_exception_should_be_thrown_when_the_file_does_not_exist_in_either_src_or_test(){
   when(fsModule).existsSync("/test/foo.js").thenReturn(false);
   when(fsModule).existsSync("/src/foo.js").thenReturn(false);
   assert['throws'](function(){
      resolver.resolve("foo");
   });
}