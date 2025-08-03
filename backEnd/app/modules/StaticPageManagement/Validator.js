/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require('joi');
const { Listing } = require('../../services/validators/Common');
const CommonService = require("../../services/Common");

class Validators {

  /********************************************************
   @Purpose Function for static Page add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static staticPageAddEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          staticPageId: Joi.string().trim().allow(null, "").default(null),
          languageId: Joi.alternatives().conditional('userId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_LANGUAGE_ID"))), otherwise: Joi.string().allow(null, "") }),
          title: Joi.alternatives().conditional('staticPageId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_TITLE"))), otherwise: Joi.string().allow(null, "") }),
          slug: Joi.alternatives().conditional('staticPageId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_SLUG"))), otherwise: Joi.string().allow(null, "") }),
          metaKeywords: Joi.alternatives().conditional('staticPageId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_META_KEYWORD"))), otherwise: Joi.string().allow(null, "") }),
          metaDescription: Joi.alternatives().conditional('staticPageId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_META_KEYWORD"))), otherwise: Joi.string().allow(null, "") }),
          content: Joi.alternatives().conditional('staticPageId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_CONTENT"))), otherwise: Joi.string().allow(null, "") }),
          status: Joi.allow(null, ""),
          staticCode: Joi.allow(null, ""),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for static Page listing
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static staticPageListingValidator() {
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
   @Purpose Function for static Page delete
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static staticPageDeleteValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          staticPageIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DATA_ID"))),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
  @Purpose Function for static Page change status
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static staticPageChangeStatusValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          staticPagesIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DATA_ID"))),
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