const Validator = require("validator");
const isEmpty = require("./empty-error");

module.exports = function validatorPostInput(data) {
  const errors = {};

  data.text = !isEmpty(data.text) ? data.text : '';
  

  if (!Validator.isLength(data.text,{min:10,max:300})) {
    errors.text = "PostText must be between 10 and 300";
  }
  

  if (Validator.isEmpty(data.text)) {
    errors.text = "PostText field is required";
  }else{
    
  }
  
  

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
