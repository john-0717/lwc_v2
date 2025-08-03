/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require('joi');
const { Listing } = require('../../services/validators/Common');
const CommonService = require("../../services/Common");

class Validators {

  /********************************************************
   @Purpose Function for User add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static userAddEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          userId: Joi.string().trim().allow(null, "").default(null),
          languageId: Joi.alternatives().conditional('userId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_LANGUAGE_ID"))), otherwise: Joi.string().allow(null, "") }),
          firstname: Joi.alternatives().conditional('userId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_FIRST_NAME"))), otherwise: Joi.string().allow(null, "") }),
          lastname: Joi.alternatives().conditional('userId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_LAST_NAME"))), otherwise: Joi.string().allow(null, "") }),
          emailId: Joi.alternatives().conditional('userId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_EMAIL"))), otherwise: Joi.string().allow(null, "") }),
          mobile: Joi.alternatives().conditional('userId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_PHONE_CODE"))), otherwise: Joi.string().allow(null, "") }),
          dateofbirth: Joi.alternatives().conditional('userId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DOB"))), otherwise: Joi.string().allow(null, "") }),
          countryCode: Joi.string().trim(),
          photo: Joi.string().trim().allow(null, ""),
          userCode: Joi.string().trim().allow(null, ""),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for User listing
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static UserListingValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Listing.keys();
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for User delete
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static userDeleteValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          userIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_USER_ID"))),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
  @Purpose Function for User change status
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static userChangeStatusValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          userIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_USER_ID"))),
          status: Joi.bool().strict().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_STATUS")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

}

module.exports = Validators;