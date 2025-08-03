/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require("joi");
const { masterListing } = require("../../services/validators/Common");
const CommonService = require("../../services/Common");

class Validators {
  /********************************************************
   @Purpose Function for subscription listing
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static SubscriptionListingValidator() {
    return async (req, res, next) => {
      try {
        req.schema = masterListing.keys();
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
   @Purpose Function for edit subscription 
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static editSubscriptionValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          description: Joi.string(),
          price: Joi.number().integer().strict().allow(0),
          maxNumListing: Joi.number().integer().strict().allow(0),
          isUnlimitedListing: Joi.bool(),
          planDuration: Joi.number().integer().strict().allow(0),
          listingDuration: Joi.number().integer().strict().allow(0),
          topSearch: Joi.bool(),
          id: Joi.string(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
   @Purpose Function for add master 
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static addMasterValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          name: Joi.string(),
          levelName: Joi.string(),
          companyName: Joi.string(),
          price: Joi.number().integer().strict(),
          status: Joi.bool().required(),
          tabName: Joi.string().required(),
          duration: Joi.number().integer().strict(),
          from: Joi.number().integer().strict(),
          to: Joi.number().integer().strict(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  static addMasterCouponValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          couponName: Joi.string().required(),
          price: Joi.number().integer().strict().required(),
          status: Joi.bool().required(),
          expiryDate: Joi.number().integer().strict().required(),
          discountType: Joi.string().required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  static listCouponValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          page: Joi.number().required(),
          pageSize: Joi.number().integer().strict().required(),
          search: Joi.string(),
          filter: Joi.object(),
          sort: Joi.string(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
  static editMasterCouponValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          couponName: Joi.string(),
          price: Joi.number().integer().strict(),
          status: Joi.bool(),
          expiryDate: Joi.number().integer().strict(),
          discountType: Joi.string(),
          id: Joi.string().required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
  /********************************************************
   @Purpose Function for edit master 
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static editMasterValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          name: Joi.string(),
          levelName: Joi.string(),
          price: Joi.number().integer().strict(),
          status: Joi.bool(),
          tabName: Joi.string().required(),
          duration: Joi.number().integer().strict(),
          id: Joi.string().required(),
          from: Joi.number().integer().strict(),
          to: Joi.number().integer().strict(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
  @Purpose Function for master change status
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static masterChangeStatusValidator() {
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
                  "VALID_MASTER_ID"
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
          tabName: Joi.string().required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
  static masterCouponDeleteValidator() {
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
                  "VALID_MASTER_ID"
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
  static masterCouponChangeStatusValidator() {
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
                  "VALID_MASTER_ID"
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
  /********************************************************
  @Purpose Function for master details
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static masterDetailsValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          id: Joi.string().required(),
          moduleName: Joi.string().required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
   @Purpose Function for master listing
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static masterListingValidator() {
    return async (req, res, next) => {
      try {
        req.schema = masterListing.keys();
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
  @Purpose Function for master download
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static masterDownloadValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          moduleName: Joi.string().required(),
          type: Joi.string().valid("csv", "xlsx", "pdf").required(),
          column: Joi.array().required(),
        });

        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
  @Purpose Function for master download
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static masterCouponDownloadValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          type: Joi.string().valid("csv", "xlsx", "pdf").required(),
          column: Joi.array().allow(null),
        });

        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
   @Purpose Function for master ansco add 
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static masterAnscoAddValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          code: Joi.string().required(),
          codeTitle: Joi.string().required(),
          skillLevel: Joi.string().required(),
          skills: Joi.array(),
          roleDescription: Joi.string().required(),
          experience: Joi.string().required(),
          qualification: Joi.string().required(),
          registration: Joi.string().required(),
          status: Joi.bool().required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
   @Purpose Function for master ansco edit 
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static masterAnscoEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          code: Joi.string(),
          codeTitle: Joi.string(),
          skillLevel: Joi.string(),
          skills: Joi.array(),
          roleDescription: Joi.string(),
          experience: Joi.string(),
          qualification: Joi.string(),
          registration: Joi.string(),
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
  @Purpose Function for ansco download
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static anscoDownloadValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          type: Joi.string().valid("csv", "xlsx", "pdf").required(),
          column: Joi.array().required(),
        });

        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
  @Purpose Function for master change status
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static masterChangeAnscoStatusValidator() {
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
                  "VALID_MASTER_ID"
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
