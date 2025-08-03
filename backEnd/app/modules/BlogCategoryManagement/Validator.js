/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require('joi');
const { Listing } = require('../../services/validators/Common');
const CommonService = require("../../services/Common");

class Validators {

  /********************************************************
   @Purpose Function for blogCategories add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static blogCategoriesAddEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          blogCategoriesId: Joi.string().trim().allow(null, "").default(null),
          category: Joi.alternatives().conditional('blogCategoriesId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_CATEGORY"))), otherwise: Joi.string().allow(null, "") }),
          color: Joi.string().allow(null, ""),
          status: Joi.string().allow(null, ""),
          blogCategoryCode: Joi.string().allow(null, ""),
          languageId: Joi.string().allow(null, ""),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for blogCategories listing
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static blogCategoriesListingValidator() {
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
   @Purpose Function for blogCategories delete
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static blogCategoriesDeleteValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          blogCategoriesIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DATA_ID"))),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
  @Purpose Function for blogCategories change status
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static blogCategoriesChangeStatusValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          blogCategoriesIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DATA_ID"))),
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