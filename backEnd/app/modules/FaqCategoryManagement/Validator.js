/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require('joi');
const { Listing } = require('../../services/validators/Common');
const CommonService = require("../../services/Common");

class Validators {

  /********************************************************
   @Purpose Function for faqCategories add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static faqCategoriesAddEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          faqCategoryId: Joi.string().trim().allow(null, "").default(null),
          category: Joi.alternatives().conditional('faqCategoryId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_CATEGORY"))), otherwise: Joi.string().allow(null, "") }),
          faqCategoryCode: Joi.allow(null, ""),
          languageId: Joi.allow(null, ""),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for faqCategories listing
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static faqCategoriesListingValidator() {
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
   @Purpose Function for faqCategories delete
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static faqCategoriesDeleteValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          faqCategoriesIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DATA_ID"))),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
  @Purpose Function for faqCategories change status
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static faqCategoriesChangeStatusValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          faqCategoriesIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DATA_ID"))),
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