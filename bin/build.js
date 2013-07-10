#!/bin/env node
/*!
 * Copyright 2012 Joseph Spencer.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * For more info, visit http://jsdevel.github.com/TDDforJS/
 */
var path = require('path');
var fs = require('fs');
var DIRS={
   BUILD:path.resolve(__dirname, "../build"),
   SRC:path.resolve(__dirname, "../src")
};
var i,len;
var outputFile;
if(!fs.existsSync(DIRS.BUILD)){
   fs.mkdir(DIRS.BUILD);
}

outputFile=[
   "#!/bin/env node",
   "!function(){",
   getContentsOf("TDDforJSEvaluator"),
   "!function(){",
   buildFileParts([
      'AppFactory',
      'ImportResolver',
      'SuiteFileResolver',
      'TestSuites',
      'TestSuite',
      'getFiles',
      'handleConfig',
      'handleNoConfig',
      'bootstrap'
   ]),
   "}();",
   "}();"
].join('\n');

fs.writeFileSync(path.resolve(DIRS.BUILD, "TDDforJS.js"), outputFile, "UTF8");

function buildFileParts(array){
   var result=[];
   array.forEach(function(v){
      result.push(getContentsOf(v));
   });
   return result.join('\n');
}
function getContentsOf(file){
   return fs.readFileSync(path.resolve(DIRS.SRC, 'js', file+".js"), "UTF8");
}