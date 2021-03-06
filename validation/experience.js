const Validator = require("validator");
const isEmpty = require("./empty-error");

module.exports = function validatorExperienceInput(data) {
  const errors = {};

  data.title = !isEmpty(data.title) ? data.title : '';
  data.company = !isEmpty(data.company) ? data.company : '';
  data.from = !isEmpty(data.from) ? data.from : '';

  if (Validator.isEmpty(data.title)) {
    errors.title = "Job title field is required";
  }
  
  if (Validator.isEmpty(data.company)) {
    errors.company = "Company field is required";
  }
  
  if (Validator.isEmpty(data.from)) {
    errors.from = "From data field is required";
  }
  

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
