/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require('joi');
const { Listing } = require('../../services/validators/Common');
const CommonService = require("../../services/Common");

class Validators {

  /********************************************************
   @Purpose Function for Admin add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static adminAddEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          adminId: Joi.string().trim().allow(null, "").default(null),
          firstname: Joi.alternatives().conditional('adminId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_FIRST_NAME"))), otherwise: Joi.string().allow(null, "") }),
          lastname: Joi.alternatives().conditional('adminId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_LAST_NAME"))), otherwise: Joi.string().allow(null, "") }),
          emailId: Joi.alternatives().conditional('adminId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_EMAIL"))), otherwise: Joi.string().allow(null, "") }),
          mobile: Joi.alternatives().conditional('adminId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_PHONE_CODE"))), otherwise: Joi.string().allow(null, "") }),
          role: Joi.alternatives().conditional('adminId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_ROLE"))), otherwise: Joi.string().allow(null, "") }),
          dateofbirth: Joi.alternatives().conditional('adminId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DOB"))), otherwise: Joi.string().allow(null, "") }),
          permissions: Joi.array().allow(null, ""),
          countryCode: Joi.string().trim(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for Admin listing
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static AdminListingValidator() {
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
   @Purpose Function for Admin delete
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static adminDeleteValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          adminIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_ADMIN_ID"))),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
  @Purpose Function for admin change status
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static adminChangeStatusValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          adminIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_ADMIN_ID"))),
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