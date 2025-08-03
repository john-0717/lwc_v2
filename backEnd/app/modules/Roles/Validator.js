/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require('joi');
const { Listing } = require('../../services/validators/Common');
const CommonService = require("../../services/Common");

class Validators {

  /********************************************************
   @Purpose Function for Permission Category add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static permissionCategoryAddEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          categoryId: Joi.string().trim().allow(null, "").default(null),
          category: Joi.alternatives().conditional('categoryId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_CATEGORY"))), otherwise: Joi.string().allow(null, "") }),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for Permission add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static permissionAddEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          permissionId: Joi.string().trim().allow(null, "").default(null),
          categoryId: Joi.alternatives().conditional('permissionId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_CATEGORY"))), otherwise: Joi.string().allow(null, "") }),
          permission: Joi.alternatives().conditional('permissionId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_PERMISSION"))), otherwise: Joi.string().allow(null, "") })
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for Role add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static roleAddEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          roleId: Joi.string().trim().allow(null, "").default(null),
          role: Joi.alternatives().conditional('roleId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_ROLE"))), otherwise: Joi.string().allow(null, "") }),
          description: Joi.alternatives().conditional('roleId', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DESCRIPTION"))), otherwise: Joi.string().allow(null, "") }),
          permissions: Joi.alternatives().conditional('roleId', {
            is: null, then: Joi.array().min(1).required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_PERMISSION"))), otherwise: Joi.array().allow(null, "")
          })
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for Role listing
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static roleListingValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Listing.keys({
          sort: Joi.object({
            role: Joi.number().valid(1, -1).strict(),
            slug: Joi.number().valid(1, -1).strict(),
            description: Joi.number().valid(1, -1).strict(),
            userCount: Joi.number().valid(1, -1).strict(),
          })
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for role delete
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static roleDeleteValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          roleIds: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_ROLE"))),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for role delete
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static changeRoleValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          oldRoleId: Joi.array().min(1).required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_OLD_ROLE_ID")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }
}

module.exports = Validators;