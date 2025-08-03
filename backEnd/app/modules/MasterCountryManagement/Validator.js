/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require('joi');
const { Listing } = require('../../services/validators/Common');
const CommonService = require("../../services/Common");

class Validators {

  /********************************************************
   @Purpose Function for country add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static countryAddEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          countryId: Joi.string().trim().allow(null, "").default(null),
          countryName: Joi.alternatives().conditional('countryId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_COUNTRY_NAME"))), otherwise: Joi.string().allow(null, "") }),
          countryCode: Joi.alternatives().conditional('countryId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_COUNTRY_CODE"))), otherwise: Joi.string().allow(null, "") }),
          phoneCode: Joi.alternatives().conditional('countryId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_PHONE_CODE"))), otherwise: Joi.string().allow(null, "") }),
          currency: Joi.alternatives().conditional('countryId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_CURRENCY"))), otherwise: Joi.string().allow(null, "") })
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for country listing
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static countryListingValidator() {
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
   @Purpose Function for country delete
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static countryDeleteValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          countriesIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_COUNTRY_ID"))),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
  @Purpose Function for country change status
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static countryChangeStatusValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          countriesIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_COUNTRY_ID"))),
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