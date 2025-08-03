/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require('joi');
const CommonService = require("../../services/Common");
let commonlyUsedPasswords = require('../../../configs/commonlyUsedPassword').passwords;

class Validators {

  /********************************************************
   @Purpose Function for login validator
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static loginValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          emailId: Joi.string().trim().email().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_EMAIL"))),
          password: Joi.string().invalid(...commonlyUsedPasswords).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d].*/).min(8).required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "PASSWORD_VALIDATION")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for sendOtp validator
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static sendOtpValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          sendOTPToken: Joi.string().trim().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "INVALID_SENDOTP_TOKEN"))),
          mode: Joi.string().valid("email", "phone").required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "INVALID_MODE")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for verify Otp validator
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static verifyOtpValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          otpVerficationToken: Joi.string().trim().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "INVALID_OTP_VERIFICATION_CODE_TOKEN"))),
          otp: Joi.string().min(6).max(6).required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "INVALID_OTP"))),
          deviceId: Joi.string().valid("android", "ios", "web").required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "WRONG_DEVICE_ID")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for edit profile validator
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static editProfileValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          firstname: Joi.string().trim().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_FIRST_NAME"))),
          lastname: Joi.string().trim().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_LAST_NAME"))),
          mobile: Joi.string().trim().min(10).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_NUMBER_NAME"))),
          photo: Joi.string().trim().allow(null, "").error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_PHOTO_URL_NAME"))),
          role: Joi.string().trim().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_ROLE"))),
          dateofbirth: Joi.string().trim().allow(null, "").error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DOB"))),
          gender: Joi.string().trim().valid("Male", "Female").error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_GENDER"))),
          website: Joi.string().allow(null, "").uri().trim().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_URL"))),
          address: Joi.string().trim().allow(null, "").error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_ADDRESS"))),
          fbId: Joi.string().allow(null, "").uri().trim().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_URL"))),
          twitterId: Joi.string().allow(null, "").uri().trim().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_URL"))),
          instagramId: Joi.string().allow(null, "").uri().trim().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_URL"))),
          githubId: Joi.string().allow(null, "").uri().trim().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_URL"))),
          codepen: Joi.string().allow(null, "").uri().trim().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_URL"))),
          slack: Joi.string().allow(null, "").uri().trim().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_URL"))),
          isThemeDark: Joi.bool().sensitive().strict().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_THEME_BOOLEAN_VALUE"))),
          countryCode: Joi.string().trim(),
          timeZone: Joi.string().trim(),
          dateFormat: Joi.string().trim(),
          currency: Joi.string().trim(),
          timeFormat: Joi.string().trim(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for change password validator
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static changePasswordValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          currentPassword: Joi.string().invalid(...commonlyUsedPasswords).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d].*/).min(8).required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "CURRENT_PASSWORD_VALIDATION"))),
          newPassword: Joi.string().invalid(...commonlyUsedPasswords).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d].*/).min(8).required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "NEW_PASSWORD_VALIDATION")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for forgot Password Validator
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static forgotPasswordValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          emailId: Joi.string().trim().email().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_EMAIL")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for reset Password Validator
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static resetPasswordValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          token: Joi.string().trim().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "INVALID_TOKEN"))),
          password: Joi.string().invalid(...commonlyUsedPasswords).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d].*/).min(8).required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "NEW_PASSWORD_VALIDATION")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

   /********************************************************
   @Purpose Function for delete notifications
   @Parameter 
   {ids}
   @Return JSON String
  ********************************************************/
   static admindeleteNotificationValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({  
          ids:  Joi.array().min(1).required()
        }); //
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
          ids:  Joi.array().min(1).required()
        }); //
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  } 

}

module.exports = Validators;