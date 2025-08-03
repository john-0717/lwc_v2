/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require('joi');
const { Listing } = require('../../services/validators/Common');
const CommonService = require("../../services/Common");

class Validators {

  /********************************************************
   @Purpose Function for faq add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static faqAddEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          faqId: Joi.string().trim().allow(null, "").default(null),
          question: Joi.alternatives().conditional('timezoneId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_COUNTRY_NAME"))), otherwise: Joi.string().allow(null, "") }),
          answer: Joi.alternatives().conditional('timezoneId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_COUNTRY_NAME"))), otherwise: Joi.string().allow(null, "") }),
          category: Joi.alternatives().conditional('faqId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_CATEGORY"))), otherwise: Joi.string().allow(null, "") }),
          faqCode: Joi.allow(null, ""),
          languageId: Joi.allow(null, ""),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for faq listing
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static faqListingValidator() {
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
   @Purpose Function for faq delete
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static faqDeleteValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          faqIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DATA_ID"))),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
  @Purpose Function for faq change status
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static faqChangeStatusValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          faqIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DATA_ID"))),
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