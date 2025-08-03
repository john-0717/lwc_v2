/****************************
 Validators
 ****************************/
const _ = require("lodash");
let i18n = require("i18n");
const Joi = require('joi');
const { Listing } = require('../../services/validators/Common');
const CommonService = require("../../services/Common");

class Validators {

  /********************************************************
   @Purpose Function for timezone add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static timezoneAddEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          timezoneId: Joi.string().trim().allow(null, "").default(null),
          timeZone: Joi.alternatives().conditional('timezoneId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_COUNTRY_NAME"))), otherwise: Joi.string().allow(null, "") }),
          countryId: Joi.alternatives().conditional('timezoneId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_COUNTRY_ID"))), otherwise: Joi.string().allow(null, "") })
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for timezone listing
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static timezoneListingValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Listing.keys({
          filter: Joi.array()
            .items({
              timeZone: Joi.array().items(Joi.string())
            }),
          sort: Joi.object({
            timeZone: Joi.number().valid(1, -1).strict()
          })
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for timezone delete
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static timezoneDeleteValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          timezoneIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_TIMEZONE_ID"))),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
  @Purpose Function for timezone change status
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static timezoneChangeStatusValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          timezoneIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_TIMEZONE_ID"))),
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