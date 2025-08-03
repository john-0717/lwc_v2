/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require("joi");
const Models = require("../MasterDataManagement/Schema");

class Validators {
  /********************************************************
   @Purpose Function for User Contact Us
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static contactUsValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          email: Joi.string().required(),
          name: Joi.string().required(),
          city: Joi.string().trim().allow(null, ""),
          phoneCode: Joi.number().integer().strict().allow(null, ""),
          phone: Joi.number().integer().strict().allow(null, ""),
          queryType: Joi.string()
            .valid("Complaint", "Suggestion", "Tech Issue", "Others")
            .required(),
          queryMessage: Joi.string().required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
   @Purpose Function for Verify Code
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static verifyCodeValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          OTP: Joi.string().required(),
          id: Joi.string().required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
   @Purpose Function to send code
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static sendCodeValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          email: Joi.string().required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
   @Purpose Function for user sign in Validator
   @Parameter 
   {}
   @Return JSON String
********************************************************/
  static verifySignIn() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          email: Joi.string().trim().required()
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }


  /********************************************************
   @Purpose Function for user sign in Validator
   @Parameter 
   {}
   @Return JSON String
********************************************************/
static verifySignUp() {
  return async (req, res, next) => {
    try {
      req.schema = Joi.object().keys({
        phone: Joi.string().trim().required(),
        dob: Joi.string().trim().required(),
        address: Joi.string().trim().required(),
        occupation: Joi.string().trim().required(),
        currentChurch: Joi.string().trim().optional(),
        interests: Joi.array().min(1).required(),
        testimony: Joi.string().trim().optional(),
        isPopup: Joi.boolean().required()
      });
      next();
    } catch (error) {
      throw new Error(error);
    }
  };
}


  /********************************************************
   @Purpose Function for popup status validator
   @Parameter 
   {}
   @Return JSON String
********************************************************/
  static verifyPopup() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          isPopup: Joi.boolean().required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
  static verifyForgotPassword() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          email: Joi.string().trim().required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  static verifyResetPassword() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          password: Joi.string().trim().required(),
          confirmPassword: Joi.string().trim().required(),
          id: Joi.string().trim().required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
  static verifyChangePassword() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          currentPassword: Joi.string().trim().required(),
          password: Joi.string().trim().required(),
          confirmPassword: Joi.string().trim().required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  static createDynamicValidation(dynamicValues) {
    const keysSchema = {};
    // Create a Joi schema for each dynamic value
    dynamicValues.forEach((value) => {
      keysSchema[value] = Joi.number().valid(0, 1);
    });
    // Create the dynamic validation schema
    const schema = Joi.object().keys(keysSchema).min(1);
    return schema;
  }
  static masterData() {
    return async (req, res, next) => {
      try {
        let keys = Object.keys(Models);
        req.schema = this.createDynamicValidation(keys);
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
  @Purpose Function for create password
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/

  static verifyCreatePassword() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          password: Joi.string().trim().required(),
          confirmPassword: Joi.string().trim().required(),
          userCode: Joi.string().trim().required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
  /********************************************************
   @Purpose Function for read notifications
   @Parameter 
   {cardId}
   @Return JSON String
  ********************************************************/
  static readNotificationValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          ids: Joi.array().min(1).required(),
        }); //
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
}

module.exports = Validators;
