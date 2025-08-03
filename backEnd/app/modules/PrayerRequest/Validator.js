/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require("joi");
const { masterListing } = require("../../services/validators/Common");
const CommonService = require("../../services/Common");

class Validators {

  /********************************************************
  @Purpose Function for add partner 
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static addPartnerValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          title: Joi.string().required(),
          description: Joi.string().required(),
          isAnonymous: Joi.bool().required(),
          isUrgent: Joi.bool().required()
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
    @Purpose Function for edit partner 
    @Parameter 
    {}
    @Return JSON String
    ********************************************************/
  static editPrayerRequestValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          markAsAnswered: Joi.bool(),
          tagTestimony:Joi.string(),
          isAnonymous: Joi.bool(),
          isUrgent: Joi.bool(),
          id: Joi.string().required()
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }



}
module.exports = Validators;
