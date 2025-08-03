/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require('joi');
const { Listing } = require('../../services/validators/Common');
const CommonService = require("../../services/Common");

class Validators {

  /********************************************************
   @Purpose Function for language add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static languageAddEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          languageId: Joi.string().trim().allow(null, "").default(null),
          language: Joi.alternatives().conditional('languageId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_LANGUAGE_NAME"))), otherwise: Joi.string().allow(null, "") }),
          languageCode: Joi.alternatives().conditional('languageId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_LANGUAGE_CODE"))), otherwise: Joi.string().allow(null, "") }),
          country: Joi.alternatives().conditional('languageId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_COUNTRY_NAME"))), otherwise: Joi.string().allow(null, "") })
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for language listing
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static languageListingValidator() {
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
   @Purpose Function for language delete
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static languageDeleteValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          languageIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_LANGUAGE_ID"))),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
  @Purpose Function for language change status
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static languageChangeStatusValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          languageIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_LANGUAGE_ID"))),
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