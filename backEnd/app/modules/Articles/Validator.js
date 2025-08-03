/****************************
 Validators
 ****************************/
const _ = require("lodash");
const Joi = require("joi");
const CommonService = require("../../services/Common");

class Validators {
  /********************************************************
   @Purpose Function for ADD NEW JOB Validator
   @Parameter 
   {cardId}
   @Return JSON String
  ********************************************************/
  static addNewArticle() {
  return async (req, res, next) => {
    try {
      req.schema = Joi.object().keys({
        id: Joi.string().allow(null, "").default(null),

        title: Joi.string().trim().required(),
        slug: Joi.string().trim().allow(null, ""),
        content: Joi.string().trim().required(),
        tags: Joi.array().items(Joi.string().trim()).default([]),
        category: Joi.string().trim().allow(null, ""),
        status: Joi.string()
          .trim()
          .valid("Draft", "Published", "Archived")
          .required(),

        isFeatured: Joi.boolean().default(false),
        createdBy: Joi.string().required(),
        updatedBy: Joi.string().allow(null, ""),
        approvedBy: Joi.string().allow(null, ""),
        isApproved: Joi.boolean().default(false),
        publishedAt: Joi.date().allow(null, ""),
        approvedAt: Joi.date().allow(null, ""),
        isDeleted: Joi.boolean().default(false),
        otherInfo: Joi.string().trim().allow(null, ""),
      });

      next();
    } catch (error) {
      throw new Error(error);
    }
  };
}
  /********************************************************
   @Purpose Function for ADD NEW JOB Validator
   @Parameter 
   {cardId}
   @Return JSON String
  ********************************************************/
  static draftJob() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          id: Joi.string().allow(null, "").default(null),
          ansco: Joi.string().trim().allow(null, ""),
          jobTitle: Joi.string().trim().allow(null, ""),
          jobType: Joi.string().trim().required(),
          location: Joi.array().min(1).required(),
          country: Joi.string().trim().required(),
          industry: Joi.string().trim().required(),
          salary: Joi.boolean(),
          payRateFrom: Joi.number().allow(null),
          payRateTo: Joi.number().allow(null),
          hoursPerWeek: Joi.number().allow(null),
          isBonusAllowed: Joi.boolean().allow(null),
          bonusAmount: Joi.string().allow(null),
          earningPerWeek: Joi.number().allow(null),
          paymentFrequency: Joi.string().trim().required(),
          mandatoryQualificationName: Joi.string().trim().allow(null, ""),
          mandatoryQualificationLevel: Joi.string().trim().required(),
          optionalQualificationName: Joi.string().trim().allow(null, ""),
          optionalQualificationLevel: Joi.string().trim().allow(null, ""),
          mandatoryExperience: Joi.string().trim().allow(null, ""),
          optionalExperience: Joi.string().trim().allow(null, ""),
          isQualificationExpRequired: Joi.boolean(),
          qualificationDescription: Joi.string().trim().allow(null, ""),
          isNzRegistration: Joi.boolean(),
          nzRegistrationDetails: Joi.string().trim().allow(null, ""),
          jobDuties: Joi.string().trim().allow(null, ""),
          jobSkills: Joi.array(),
          skillLevel: Joi.string().trim().allow(null, ""),
          isDeleted: Joi.boolean(),
          status: Joi.string().trim().valid("Draft").required(),
          otherInfo: Joi.string().trim().allow(null, ""),
          aboutUs: Joi.string().trim().allow(null, ""),
          //payment related keys
          addOnId: Joi.string().trim().allow(null, ""),
          addOnFee: Joi.number().strict(),
          totalFee: Joi.number().strict(),
          stripeResponse: Joi.object(),
          stripeResponseMessage: Joi.string().trim(),
          taxFee: Joi.number().strict(),
          gst: Joi.number().strict(),
        }); //
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
  /********************************************************
   @Purpose Function for ansco search Validator
   @Parameter 
   {cardId}
   @Return JSON String
  ********************************************************/
  static anscoValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          id: Joi.string().trim(),
          searchText: Joi.alternatives().conditional("id", {
            is: null,
            then: Joi.string().trim().required(),
            otherwise: Joi.string().trim(),
          }),
        }); //
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
  /********************************************************
   @Purpose Function for edit job Validator
   @Parameter 
   {cardId}
   @Return JSON String
  ********************************************************/
  static editJobValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          id: Joi.string().required(),
          ansco: Joi.string().trim().allow(null, ""),
          jobTitle: Joi.string().trim().allow(null, ""),
          jobType: Joi.string().trim().required(),
          location: Joi.array().min(1).required(),
          country: Joi.string().trim().required(),
          industry: Joi.string().trim().required(),
          salary: Joi.boolean(),
          payRateFrom: Joi.number().allow(null),
          payRateTo: Joi.number().allow(null),
          hoursPerWeek: Joi.number().allow(null),
          isBonusAllowed: Joi.boolean(),
          bonusAmount: Joi.string().allow(null),
          earningPerWeek: Joi.number().allow(null),
          paymentFrequency: Joi.string().trim().required(),
          mandatoryQualificationName: Joi.string().trim().allow(null, ""),
          mandatoryQualificationLevel: Joi.string().trim().required(),
          optionalQualificationName: Joi.string().trim().allow(null, ""),
          optionalQualificationLevel: Joi.string().trim().allow(null, ""),
          mandatoryExperience: Joi.string().trim().allow(null, ""),
          optionalExperience: Joi.string().trim().allow(null, ""),
          isQualificationExpRequired: Joi.boolean(),
          qualificationDescription: Joi.string().trim().allow(null, ""),
          isNzRegistration: Joi.boolean(),
          nzRegistrationDetails: Joi.string().trim().allow(null, ""),
          jobDuties: Joi.string().trim().allow(null, ""),
          jobSkills: Joi.array(),
          skillLevel: Joi.string().trim().allow(null, ""),
          isDeleted: Joi.boolean(),
          status: Joi.string().trim().valid("Draft", "Published"),
          otherInfo: Joi.string().trim().allow(null, ""),
          aboutUs: Joi.string().trim().allow(null, ""),
        }); //
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }
}

module.exports = Validators;
