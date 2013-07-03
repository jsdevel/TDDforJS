var assert=require('assert');
var error;

function after(){
   error = void 0;
}

function test_should_be_instanceof_error(){
   error = new RunTimeError();
   assert(error instanceof Error);
}
function test_error_name_should_be_name_of_error(){
   error = new RunTimeError();
   assert.equal(error.name, RunTimeError.name);
}
function test_string_message_should_be_used_if_truthy(){
   error = new RunTimeError("foo");
   assert.equal(error.message, 'foo');
}
function test_error_message_should_not_be_used_if_falsey(){
   error = new RunTimeError(new Error());
   assert.notEqual(error.message, "undefined");
}
function test_error_message_should_be_used_if_truthy(){
   error = new RunTimeError(new Error(true));
   assert.equal(error.message, "true");
}
function test_constructor_in_prototype_should_equal_constructor(){
   assert.equal(RunTimeError.prototype.constructor, RunTimeError);
}
function test_stack_of_error_argument_should_be_set_when_truthy(){
   var error1 = new Error(true)
   error1.stack=true;
   error = new RunTimeError(error1);
   assert.equal(error.stack, true);
}