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
var fileParts = [
   'AppFactory',
   'ImportResolver',
   'RunTimeError',
   'UnitTestResolver',
   'UnitTestReporter',
   'UnitTestRunner',
   'getFiles',
   'handleConfig',
   'handleNoConfig',
   'bootstrap'
];
var i,len;
var outputFile=[
   "#!/bin/env node",
   getContentsOf("TDDforJSEvaluator"),
   "!function(){"
].join('\n');

if(!fs.existsSync(DIRS.BUILD)){
   fs.mkdir(DIRS.BUILD);
}

fileParts.forEach(function(v){
   outputFile+=getContentsOf(v);
});
outputFile+=("}();");

fs.writeFileSync(path.resolve(DIRS.BUILD, "TDDforJS.js"), outputFile, "UTF8");

function getContentsOf(file){
   return fs.readFileSync(path.resolve(DIRS.SRC, 'js', file+".js"), "UTF8");
}