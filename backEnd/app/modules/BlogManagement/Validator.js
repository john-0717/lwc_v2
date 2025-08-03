/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require('joi');
const { Listing } = require('../../services/validators/Common');
const CommonService = require("../../services/Common");

class Validators {

  /********************************************************
   @Purpose Function for blog add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static blogAddEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          blogId: Joi.string().trim().allow(null, "").default(null),
          title: Joi.alternatives().conditional('blogId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_TITLE"))), otherwise: Joi.string().allow(null, "") }),
          slug: Joi.alternatives().conditional('blogId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_SLUG"))), otherwise: Joi.string().allow(null, "") }),
          metaKeywords: Joi.alternatives().conditional('blogId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_META_KEYWORD"))), otherwise: Joi.string().allow(null, "") }),
          category: Joi.alternatives().conditional('blogId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_CATEGORY"))), otherwise: Joi.string().allow(null, "") }),
          metaDescription: Joi.alternatives().conditional('blogId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DESCRIPTION"))), otherwise: Joi.string().allow(null, "") }),
          content: Joi.alternatives().conditional('blogId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_CONTENT"))), otherwise: Joi.string().allow(null, "") }),
          media: Joi.string().allow(null, ""),
          tags: Joi.array().allow(null, ""),
          publishStatus: Joi.allow(null, ""),
          blogCode: Joi.allow(null, ""),
          languageId: Joi.allow(null, ""),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for blog listing
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static blogListingValidator() {
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
   @Purpose Function for blog delete
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static blogDeleteValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          blogIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DATA_ID"))),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
  @Purpose Function for blog change status
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static blogChangeStatusValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          blogIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DATA_ID"))),
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