/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require('joi');
const CommonService = require("../../services/Common");

class Validators {

  /********************************************************
   @Purpose Function for support add
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static supportAddValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          title: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_TITLE"))),
          description: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DESCRIPTION"))),
          openBy: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_USER_ID")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
  @Purpose Function for support change status
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static supportChangeStatusValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          ticketId: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_SUPPORT_ID"))),
          status: Joi.string().allow("Open", "Rejected", "Closed").strict().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_STATUS")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for Support ticket delete
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static supportPageDeleteValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          ids: Joi.array().items(Joi.string()).min(1).error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DATA_ID"))),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for support reply add
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static supportReplyAddValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          supportId: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_SUPPORT_ID"))),
          message: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_MESSAGE"))),
          media: Joi.string().allow("", null)
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for support reply edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static supportReplyEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          message: Joi.string().allow("", null),
          media: Joi.string().allow("", null)
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

}

module.exports = Validators;