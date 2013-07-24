//import js/ImportResolver
//import js/AppFactory

var factory;

function before(){
   factory = new AppFactory({}, {}, "hostname", {});
}

//Test
function imports_should_work(){
   factory.makeImportResolver("/test", "/src");
}