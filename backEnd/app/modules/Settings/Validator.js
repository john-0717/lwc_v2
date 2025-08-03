/****************************
 Validators
 ****************************/
const _ = require("lodash");
let i18n = require("i18n");
const { validationResult } = require("express-validator");
const Joi = require("joi");
const { body, check, query, header, param } = require("express-validator");

class Validators {
  /********************************************************
     Purpose:Function for add/update meta settings validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
  static metaSettingsValidator() {
    try {
      return [
        check("metaTitle")
          .exists()
          .withMessage(i18n.__("%s REQUIRED", "metaTitle")),
        check("metaDecscription")
          .exists()
          .withMessage(i18n.__("%s REQUIRED", "metaDecscription")),
        check("metaKeywords")
          .exists()
          .withMessage(i18n.__("%s REQUIRED", "metaKeywords")),
      ];
    } catch (error) {
      return error;
    }
  }
  /********************************************************
   @Purpose Function to validate payment settings
   @Parameter 
   isLive,prodSk,prodPk,testSk,testPk
   @Return JSON String
  ********************************************************/
  static addEditPaymentSettings() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          status: Joi.boolean(),
          isLive: Joi.boolean().required(),
          prodSk: Joi.alternatives().conditional("isLive", {
            is: Joi.boolean().valid(true),
            then: Joi.string().trim().required(),
            otherwise: Joi.string().trim().allow(null, ""),
          }),
          prodPk: Joi.alternatives().conditional("isLive", {
            is: Joi.boolean().valid(true),
            then: Joi.string().trim().required(),
            otherwise: Joi.string().trim().allow(null, ""),
          }),
          testSk: Joi.alternatives().conditional("isLive", {
            is: Joi.boolean().valid(false),
            then: Joi.string().trim().required(),
            otherwise: Joi.string().trim().allow(null, ""),
          }),
          testPk: Joi.alternatives().conditional("isLive", {
            is: Joi.boolean().valid(false),
            then: Joi.string().trim().required(),
            otherwise: Joi.string().trim().allow(null, ""),
          }),
          isGst: Joi.boolean(),
          gst: Joi.alternatives().conditional("isGst", {
            is: Joi.boolean().valid(true),
            then: Joi.number().required(),
            otherwise: Joi.number().allow(null, ""),
          }),
        }); //
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
  static validate(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: 0, message: errors.array() });
      }
      next();
    } catch (error) {
      return res.send({ status: 0, message: error });
    }
  }
  /********************************************************
   @Purpose Function to validate the add bank
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static accountValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          accountHolderName: Joi.string().trim().required(),
          accountHolderType: Joi.string().trim().required(),
          accountNumber: Joi.string()
            .trim()
            .required()
            .regex(/^\d+$/)
            .message("Account number must be a numerical"),
          routingNumber: Joi.string().trim().required(),
          country: Joi.string().trim().valid("NZD", "IND").required(),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
  static smtpAddEdit() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          type: Joi.string()
            .trim()
            .valid(
              "smtpSettings",
              "smtpFeedbacks",
              "smtpAccounts",
              "smtpSupport"
            )
            .required(),
          smtpSettings: Joi.when("type", {
            is: "smtpSettings",
            then: Joi.object()
              .keys({
                host: Joi.string().required(),
                port: Joi.number().required(),
                encryption: Joi.string().required(),
                userName: Joi.string().required(),
                password: Joi.string().required(),
                fromEmail: Joi.string().required(),
                fromName: Joi.string().required(),
                // Add more keys as needed
              })
              .required(),
            otherwise: Joi.forbidden(), // smtpSettings is not allowed for other types
          }),
          smtpSupport: Joi.when("type", {
            is: "smtpSupport",
            then: Joi.object()
              .keys({
                host: Joi.string().required(),
                port: Joi.number().required(),
                encryption: Joi.string().required(),
                userName: Joi.string().required(),
                password: Joi.string().required(),
                fromEmail: Joi.string().required(),
                fromName: Joi.string().required(),
                // Add more keys as needed
              })
              .required(),
            otherwise: Joi.forbidden(), // smtpSupport is not allowed for other types
          }),
          smtpAccounts: Joi.when("type", {
            is: "smtpAccounts",
            then: Joi.object()
              .keys({
                host: Joi.string().required(),
                port: Joi.number().required(),
                encryption: Joi.string().required(),
                userName: Joi.string().required(),
                password: Joi.string().required(),
                fromEmail: Joi.string().required(),
                fromName: Joi.string().required(),
                // Add more keys as needed
              })
              .required(),
            otherwise: Joi.forbidden(), // smtpSupport is not allowed for other types
          }),
          smtpFeedbacks: Joi.when("type", {
            is: "smtpFeedbacks",
            then: Joi.object()
              .keys({
                host: Joi.string().required(),
                port: Joi.number().required(),
                encryption: Joi.string().required(),
                userName: Joi.string().required(),
                password: Joi.string().required(),
                fromEmail: Joi.string().required(),
                fromName: Joi.string().required(),
                // Add more keys as needed
              })
              .required(),
            otherwise: Joi.forbidden(), // smtpSupport is not allowed for other types
          }),
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
}

module.exports = Validators;
