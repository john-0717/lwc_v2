/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require("joi");
const { Listing } = require("../../services/validators/Common");
const CommonService = require("../../services/Common");

class Validators {
  /********************************************************
   @Purpose Function for campaign template add
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static campaignAddValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          languageId: Joi.string().trim().required(),
          title: Joi.string().trim().required(),
          campaignSubject: Joi.string().trim().required(),
          buttons: Joi.array(),
          heading: Joi.object().keys({
            heading: Joi.string().required(),
            button: Joi.string().required(),
            link: Joi.string().required(),
          }),
          leftImage: Joi.string().trim().required(),
          description: Joi.string().trim().required(),
          topic1: Joi.string().trim().allow(null,""),
          topic2: Joi.string().trim().allow(null,""),
          topic3: Joi.string().trim().allow(null,""),
          footer: Joi.string().trim().required(),
          sendTo: Joi.array()
            .items(Joi.string().valid("Applicant", "Employer"))
            .min(1)
            .required(),
          applicantColor: Joi.alternatives().conditional("sendTo", {
            is: Joi.array().items(Joi.string().valid("Applicant")).required(),
            then: Joi.string().required(),
            otherwise: Joi.string().trim().allow(null,""),
          }),
          employerColor: Joi.alternatives().conditional("sendTo", {
            is: Joi.array().items(Joi.string().valid("Employer")).required(),
            then: Joi.string().required(),
            otherwise: Joi.string().trim().allow(null,""),
          }),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
  /********************************************************
   @Purpose Function for faq add/edit
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static campaignEditValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          id: Joi.string().trim().required(),
          languageId: Joi.string().trim().required(),
          title: Joi.string().trim().required(),
          campaignSubject: Joi.string().trim().required(),
          buttons: Joi.array(),
          heading: Joi.object().keys({
            heading: Joi.string().required(),
            button: Joi.string().required(),
            link: Joi.string().required(),
          }),
          leftImage: Joi.string().trim().required(),
          description: Joi.string().trim().required(),
          topic1: Joi.string().trim().allow(null,""),
          topic2: Joi.string().trim().allow(null,""),
          topic3: Joi.string().trim().allow(null,""),
          footer: Joi.string().trim().required(),
          sendTo: Joi.array()
            .items(Joi.string().valid("Applicant", "Employer"))
            .min(1)
            .required(),
          applicantColor: Joi.alternatives().conditional("sendTo", {
            is: Joi.array().items(Joi.string().valid("Applicant")).required(),
            then: Joi.string().required(),
            otherwise: Joi.string().trim().allow(null,""),
          }),
          employerColor: Joi.alternatives().conditional("sendTo", {
            is: Joi.array().items(Joi.string().valid("Employer")).required(),
            then: Joi.string().required(),
            otherwise: Joi.string().trim().allow(null,""),
          }),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

  /********************************************************
   @Purpose Function for feedback delete
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static campaignDeleteValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          campaignIds: Joi.array()
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
   @Purpose Function for feedback list
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static campaignListValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          searchText: Joi.string().trim(),
          page: Joi.number().required(),
          pagesize: Joi.number().required(),
          languageId: Joi.string().required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
}

module.exports = Validators;
