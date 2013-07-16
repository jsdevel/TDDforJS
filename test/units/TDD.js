/*!
 * Copyright 2013 Joseph Spencer.
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
 */
var assert;
var tdd;
var session;

function before(){
   session={};
   assert=require('assert');
   tdd=new TDD(session);
}

//Test
function session_must_be_an_object(){
   assert['throws'](function(){
      new TDD(null);
   }, "session wasn't required to be an object.");
}
function session_data_should_be_available(){
   session.foo=5;
   assert.equal(tdd.session.foo, 5, "session data wasn't available.");
}

//Test
function calling_setTimeout_should_return_code_and_add_callback(){
   var isCalled=false;
   var code=tdd.overrides.setTimeout(function(){
      isCalled=true;
   },5);
   tdd.async.flush();
   assert(code > 0, "no return code is given.");
   assert(isCalled, "wasn't called.");
}
//Test
function calling_setInterval_should_return_code_and_add_callback(){
   var isCalled=false;
   var code=tdd.overrides.setInterval(function(){
      isCalled=true;
   },5);
   tdd.async.flush();
   assert(code > 0, "no return code is given.");
   assert(isCalled, "wasn't called.");
}
//Test
function calling_clear_interval_with_returned_code_should_remove_callback(){
   var isNotCalled=true;
   var code=tdd.overrides.setInterval(function(){
      isNotCalled=false;
   },5);
   tdd.overrides.clearInterval(code);
   tdd.async.flush();
   assert(code > 0, "no return code is given.");
   assert(isNotCalled, "was called.");
}
//Test
function calling_clear_timeout_with_returned_code_should_remove_callback(){
   var isNotCalled=true;
   var code=tdd.overrides.setTimeout(function(){
      isNotCalled=false;
   },5);
   tdd.overrides.clearTimeout(code);
   tdd.async.flush();
   assert(code > 0, "no return code is given.");
   assert(isNotCalled, "was called.");
}
function adding_multiple_callbacks_should_increment_code_accordingly(){
   var code;
   tdd.overrides.setTimeout(function(){},5);
   code=tdd.overrides.setTimeout(function(){},5);
   assert.equal(code, 2, "setTimeout didn't increment the code properly.");
   tdd.overrides.setInterval(function(){},5);
   code=tdd.overrides.setInterval(function(){},5);
   assert.equal(code, 2, "setInterval didn't increment the code properly.");
}