/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require("joi");
const { Listing } = require("../../services/validators/Common");
const CommonService = require("../../services/Common");

class Validators {
  /********************************************************
    @Purpose Function for cms Page add
    @Parameter 
    {}
    @Return JSON String
    ********************************************************/
  static cmsPageAddValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          pageData: Joi.array().items({
            title: Joi.string().required().allow(null, ""),
            slug: Joi.string().required().allow(null, ""),
            content: Joi.string().required().allow(null, ""),
            image: Joi.string().allow(null, ""),
          }),
          title: Joi.string().required(),
          slug: Joi.string().required(),
          metaTitle: Joi.string().allow(null, ""),
          metaKeywords: Joi.string().allow(null, ""),
          metaDescription: Joi.string().allow(null, ""),
          status: Joi.bool(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
    @Purpose Function for cms Page edit
    @Parameter 
    {}
    @Return JSON String
    ********************************************************/
  static cmsPageEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          pageData: Joi.array().items({
            title: Joi.string().allow(null, ""),
            slug: Joi.string().allow(null, ""),
            content: Joi.string().allow(null, ""),
            image: Joi.string().allow(null, ""),
          }),
          title: Joi.string(),
          metaTitle: Joi.string().allow(null, ""),
          metaKeywords: Joi.string().allow(null, ""),
          metaDescription: Joi.string().allow(null, ""),
          status: Joi.bool(),
          id: Joi.string().required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
    @Purpose Function for cms Page delete
    @Parameter 
    {}
    @Return JSON String
    ********************************************************/
  static cmsPageDeleteValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          ids: Joi.array()
            .items(Joi.string())
            .min(1)
            .error(
              new Error(
                await new CommonService().setMessage(
                  req.currentUserLang,
                  "VALID_DATA_ID"
                )
              )
            ),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
   @Purpose Function for cms Page change status
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static cmsPageChangeStatusValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          ids: Joi.array()
            .items(Joi.string())
            .min(1)
            .error(
              new Error(
                await new CommonService().setMessage(
                  req.currentUserLang,
                  "VALID_DATA_ID"
                )
              )
            ),
          status: Joi.bool()
            .strict()
            .required()
            .error(
              new Error(
                await new CommonService().setMessage(
                  req.currentUserLang,
                  "VALID_STATUS"
                )
              )
            ),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
}

module.exports = Validators;
