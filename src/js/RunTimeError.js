function RunTimeError(error){
   var message=error;
   if(error instanceof Error){
      message = error.message;
      if(error.stack){
         this.stack=error.stack;
      }
   }
   this.name=RunTimeError.name;
   this.message = message ||
           "An unknown error occurred while evaluating the test case.";
}
RunTimeError.prototype = new Error();
RunTimeError.prototype.constructor = RunTimeError;
__$$__RunTimeError=RunTimeError;