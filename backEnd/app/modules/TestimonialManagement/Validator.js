/****************************
 Validators
 ****************************/
 const _ = require("lodash");
 const Joi = require('joi');
 const { Listing } = require('../../services/validators/Common');
 const CommonService = require("../../services/Common");
 
 class Validators {
 
   /********************************************************
    @Purpose Function for testimonial add
    @Parameter 
    {}
    @Return JSON String
    ********************************************************/
   static testimonialAddValidator() {
     return async (req, res, next) => {
       try {
         req.schema = Joi.object().keys({           
           title: Joi.string().required(),
           imageUrl: Joi.string().required().error(
            new Error(
              await new CommonService().setMessage(
                req.currentUserLang,
                'IMAGE_REQUIRED'
              )
            )
          ),
           description:Joi.string().required(),
           testimonialDesignation:Joi.string().required(),
         });
         next();
       } catch (error) {
         throw new Error(error);
       }
     }
   }

   /********************************************************
    @Purpose Function for testimonial edit
    @Parameter 
    {}
    @Return JSON String
    ********************************************************/
    static testimonialEditValidator() {
        return async (req, res, next) => {
          try {
            req.schema = Joi.object().keys({
                title: Joi.string().required(),
                imageUrl: Joi.string().required().error(
                  new Error(
                    await new CommonService().setMessage(
                      req.currentUserLang,
                      'IMAGE_REQUIRED'
                    )
                  )
                ),
                description:Joi.string().required(),
                testimonialDesignation:Joi.string().required(),
                id:Joi.string().required()
            });
            next();
          } catch (error) {
            throw new Error(error);
          }
        }
      }
  
 
   /********************************************************
    @Purpose Function for testimonial delete
    @Parameter 
    {}
    @Return JSON String
    ********************************************************/
   static testimonialDeleteValidator() {
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
 
 
 }
 
 module.exports = Validators;