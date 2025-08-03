/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require('joi');
const CommonService = require("../../services/Common");

class Validators {

  /********************************************************
   @Purpose Function for Common save Filter
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static saveFilterValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          key: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_KEY"))),
          filterName: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_FILTER_NAME"))),
          filter: Joi.array().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_FILTER")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for Common get Filter
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static getFilterValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          key: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_KEY")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for Common save Column
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static saveColumnValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          key: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_KEY"))),
          name: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_COLUMN_NAME"))),
          column: Joi.array().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_COLUMN")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }


}

module.exports = Validators;