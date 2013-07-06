/**
 * This analyzes test code, looking for test cases to run, imports defined, and
 * any before or after methods that need to be run.
 *
 * @constructor
 * @param {string} prefix Prefix of the testSuiteResults variable used in the
 * evaled code.  This allows us to unit test this class.
 * @param {string} className E.G. foo.Foo
 * @param {string} hostname
 * @param {number} id
 * @param {string} source
 */
function TestSuite(
   prefix,
   className,
   hostname,
   id,
   source
){
   /** @type {RegExp} */
   var reg_test=/^\/\/Test[^\r\n]*\r?\nfunction\s+([a-zA-Z0-9_$]+)/gm;
   /** @type {RegExp} */
   var reg_testAfter=/^function\s+after[^a-zA-Z0-9_$]+/m;
   /** @type {RegExp} */
   var reg_testBefore=/^function\s+before[^a-zA-Z0-9_$]+/m;
   /** @type {RegExp} */
   var reg_blockComments=/\/\*(?:(?!\*\/)[\s\S])*\*\//g;
   /** @type {RegExp} */
   var reg_preprocessedComment=/PREPROCESSED_COMMENT[0-9]+/g;
   /** @type {RegExp} */
   var reg_className=/^(?:(?:[a-z][a-z0-9]*)\.)*[a-z][a-z0-9]*$/i;
   /** @type {RegExp} */
   var reg_simpleClassName=/^(?:.+\.)?([a-z][a-z0-9]*)$/i;
   /** @type {RegExp} */
   var reg_package=/^(?:(.+)\.)?[a-z][a-z0-9]*$/i;


   //INTERNAL STATE
   /** @type {boolean} */
   var isAnalyzed=false;

   /** @type {boolean} */
   var hasAfter=false;
   /** @type {boolean} */
   var hasBefore=false;
   /** @type {string} */
   var testCases=[];
   /** @type {string} */
   var testSuiteString="";
   /** @type {string} */
   var simpleClassName="";
   /** @type {string} */
   var package="";

   if(typeof prefix !== 'string'){
      throw new Error("prefix must be a string to prepend to the testSuiteResults var.");
   }
   if(typeof className !== 'string'){
      throw new Error("className must be a string representing the full classname of the suite.");
   }
   if(!hostname || typeof hostname !== 'string'){
      throw new Error("hostname must be a string representing the hostname of the machine that the test is curently running on.");
   }
   //this catches NaN
   if(!(id>=0)){
      throw new Error("id must be a number above or equal to zero.  It represents the current index of the test suite.");
   }
   if(!source || typeof source !== 'string'){
      throw new Error("source must be a non empty string representing the contents of a suite.");
   }


   if(!reg_className.test(className)){
      throw new Error("A valid className must be given: "+className);
   }

   /**
    * Inform the caller if the testSuite had an "after" method defined.
    * @returns {boolean}
    */
   this.hasAfter=function(){
      analyzeTestSuite();
      return hasAfter;
   };

   /**
    * Inform the caller if the testSuite had a "before" method defined.
    * @returns {boolean}
    */
   this.hasBefore=function(){
      analyzeTestSuite();
      return hasBefore;
   };

   /**
    * Inform the caller if the testSuite had test cases defined.
    * @returns {boolean}
    */
   this.hasTestCases=function(){
      analyzeTestSuite();
      return !!testCases.length;
   };

   /**
    * Inform the caller how many test cases the suite has.
    * @returns {number}
    */
   this.numberOfTestCases=function(){
      analyzeTestSuite();
      return testCases.length;
   };

   /**
    * Returns the runnable source of the test suite including setup and tear
    * down of the test cases.
    *
    * @returns {string}
    */
   this.toString=function(){
      var i;
      var numberOfTestCases;
      var testCaseName;
      var testCase;
      var results=prefix+"testSuiteResults";
      analyzeTestSuite();
      if(!testSuiteString){
         numberOfTestCases=testCases.length;
         testSuiteString=[
            "!function(){",
            source,
            "!function(){",
            results+".testCases=[];",
            results+".name='"+simpleClassName+"';",
            results+".package='"+package+"';",
            results+".tests="+numberOfTestCases+";",
            results+".hostname='"+hostname+"';",
            results+".id="+id+";",
            results+".errors=0;",
            results+".failures=0;",
            //this is just for starters.  Replace it after running the cases.
            results+".time=Date.now();",
            results+".timestamp=new Date().toISOString();"
         ].join('\n');
         for(i=0;i<numberOfTestCases;i++){
            testCaseName=testCases[i];
            testCase=results+".___currentTestCase";
            testSuiteString+=[
               '',
               testCase+"={name:'"+testCaseName+"',className:'"+className+"'};",
               results+".testCases.push("+testCase+");",
               prefix+"store();",
               "!function(){",
                  testCase+".time=Date.now();",
                  "try{",
                     hasBefore?"before();":"",
                     testCaseName+"();",
                     hasAfter?"after();":"",
                  "}catch(e){",
                     "if(e instanceof Error){",
                        "if(e.constructor.name.toLowerCase().indexOf('assert') > -1){",
                           results+".failures++;",
                           testCase+".failure={",
                              "message:e.message,",
                              "type:e.constructor.name,",
                              "stack:e.stack",
                           "};",
                        "} else {",
                           results+".errors++;",
                           testCase+".error={",
                              "message:e.message,",
                              "type:e.constructor.name,",
                              "stack:e.stack",
                           "};",
                        "}",
                     "} else {",
                        results+".failures++;",
                        testCase+".failure={",
                           "message:e,",
                           "type:'unknown'",
                        "};",
                     "}",
                  "}",
                  testCase+".time=(Date.now()-"+testCase+".time)/1000;",
               "}();",
               prefix+"reset();",
               ''
            ].join('\n');
         }
         testSuiteString+=[
            '',
               results+".time=(Date.now()-"+results+".time)/1000;",
            "}();",
            "}();",
            ''
         ].join('\n');
      }
      return testSuiteString;
   };

   /**
    * Sets up the internal state of this object appropriately.
    */
   function analyzeTestSuite(){
      var duplicateTestCases={};
      var comments = {};
      var commentCounter=0;
      var duplicateCounter=0;
      if(!isAnalyzed){
         package=className.replace(reg_package, "$1");
         simpleClassName=className.replace(reg_simpleClassName, "$1");
         source=source.replace(reg_blockComments, function(match){
            var id = "PREPROCESSED_COMMENT"+commentCounter;
            comments[id]=match;
            commentCounter++;
            return id;
         });
         hasAfter=reg_testAfter.test(source);
         hasBefore=reg_testBefore.test(source);
         source=source.replace(reg_test, function(match, name){
            var duplicate;
            if(name in duplicateTestCases){
               duplicate="duplicate_"+duplicateCounter+"_"+name;
               duplicateCounter++;
               match=match.replace(name, duplicate);
               testCases.push(duplicate);
            } else {
               testCases.push(name);
            }
            duplicateTestCases[name]=name;
            return match;
         });
         source=source.replace(
            reg_preprocessedComment,
            function(match){
               return comments[match];
            }
         );
         isAnalyzed=true;
      }
   };
}