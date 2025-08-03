/****************************
 Validators
 ****************************/
const _ = require("lodash");
let i18n = require("i18n");
const Joi = require('joi');
const CommonService = require("../../services/Common");
const { Listing } = require("../../services/validators/Common");

class Validators {

  /********************************************************
   @Purpose Function for Language Messages add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static messagesAddEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          editMessage: Joi.array()
            .items({
              dataId: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DATA_ID"))),
              message: Joi.string().allow(null, "").error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_MESSAGE")))
            }).default(null),
          languageId: Joi.alternatives().conditional('editMessage', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_LANGUAGE_ID"))), otherwise: Joi.string().allow(null, "") }),
          messageKey: Joi.alternatives().conditional('editMessage', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_MESSAGE_KEY"))), otherwise: Joi.string().allow(null, "") }),
          message: Joi.alternatives().conditional('editMessage', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_MESSAGE"))), otherwise: Joi.string().allow(null, "") })
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for Language Label add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static labelAddEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          editLabel: Joi.array()
            .items({
              dataId: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_DATA_ID"))),
              label: Joi.string().allow(null, "").error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_LABEL")))
            }).default(null),
          languageId: Joi.alternatives().conditional('editLabel', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_LANGUAGE_ID"))), otherwise: Joi.string().allow(null, "") }),
          labelKey: Joi.alternatives().conditional('editLabel', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_LABEL_KEY"))), otherwise: Joi.string().allow(null, "") }),
          label: Joi.alternatives().conditional('editLabel', { is: null, then: Joi.string().required().error(new Error(await new CommonService().setMessage(req.currentUserLang, "VALID_LABEL"))), otherwise: Joi.string().allow(null, "") })
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
  @Purpose Function for message change active status
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static listingValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Listing.keys();
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

}

module.exports = Validators;