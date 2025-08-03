const i18n = require("i18n");
const _ = require("lodash");

const Controller = require("../Base/Controller");
const RequestBody = require("../../services/RequestBody");
const Projection = require("./Projection.json");
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const { HTTP_CODE } = require("../../services/constant");
const { paymentGatewaySchema, generalSettingsSchema } = require("./Schema");
const EmployerService = require("../../services/Employer");
const { Admin } = require("../Admin/Schema");
const configs = require("../../../configs/configs");
const siteSettingSchema = require("./Schema").siteSettingSchema;
const siteUnMaintenanceSchema = require("./Schema").siteUnMaintenanceSchema;
const metaDataSchema = require("./Schema").metaDataSchema;
const GenSettingsSchema = require("./Schema").generalSettingsSchema;
const SocialMediaSchema = require("./Schema").socialMediaSDKSchema;
const SmtpSchema = require("./Schema").smtpSettingsSchema;
const EmailSettingSchema = require("./Schema").emailSettingsSchema;

class SettingsController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
      @Purpose: Add/Edit Site Settings
      @Parameter: 
      {
         "siteName": "",
         "siteFevicon": "",
         "siteLogoSmall":"",
         "siteLogoLarge":""
      }
      @Return: JSON String
     ********************************************************/
  async addSiteSetting() {
    try {
      let data = this.req.body;
      const siteSetting = await siteSettingSchema
        .findOne({ languageId: data.languageId })
        .exec();
      if (siteSetting) {
        /********************************************************
        Update Site Setting details and validate
        ********************************************************/
        await siteSettingSchema
          .updateOne({ languageId: data.languageId }, data, { new: true })
          .exec();

        /********************************************************
        Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "SITE_SETTINGS_DATA_UPDATE"
          )
        );
      } else {
        /********************************************************
        Save Language details and validate
        ********************************************************/
        await new Model(siteSettingSchema).store(data);
        /********************************************************
        Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "SITE_SETTINGS_DATA_UPDATE"
          )
        );
      }
    } catch (error) {
      console.log("error addSiteSetting()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }
  /********************************************************
    @Purpose: Add/Edit Metadata
    @Parameter: 
    {
       "metaTitle": "metaTitle"
       "metaDecscription": "metaDecscription",
       "metaKeywords":"metaKeywords"
    }
    @Return: JSON String
   ********************************************************/
  async addMetaDataSettings() {
    try {
      let data = this.req.body;
      const metaData = await metaDataSchema
        .findOne({ languageId: data.languageId })
        .exec();
      if (metaData) {
        /********************************************************
        Update Site Setting details and validate
        ********************************************************/
        await metaDataSchema
          .updateOne({ languageId: data.languageId }, data, { new: true })
          .exec();

        /********************************************************
        Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "META_DETA_SUCCESSFULLY_UPDATED"
          )
        );
      } else {
        /********************************************************
        Save Language details and validate
        ********************************************************/
        await new Model(metaDataSchema).store(data);
        /********************************************************
        Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "META_DETA_SUCCESSFULLY_UPDATED"
          )
        );
      }
    } catch (error) {
      console.log("error addMetaDataSettings()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose: Add/Edit Site Settings
     @Parameter: 
     {
        "siteName": "",
        "siteFevicon": "",
        "siteLogoSmall":"",
        "siteLogoLarge":""
     }
     @Return: JSON String
    ********************************************************/
  async addSiteUnMaintainance() {
    try {
      let data = this.req.body;
      const siteUnMaintenance = await siteUnMaintenanceSchema
        .findOne({ languageId: data.languageId })
        .exec();
      if (siteUnMaintenance) {
        let siteUnMaintenanceSettings = {
          siteUnMaintenance: {
            siteStatus: this.req.body.siteStatus,
            siteOfflineStartDate: this.req.body.siteOfflineStartDate,
            siteOfflineEndDate: this.req.body.siteOfflineEndDate,
          },
        };
        await this.addDefaultSettings(
          siteUnMaintenanceSettings,
          GenSettingsSchema
        );
        /********************************************************
        Update Site Setting details and validate
        ********************************************************/
        await siteUnMaintenanceSchema
          .updateOne(
            { languageId: data.languageId },
            { siteOfflineMsg: data.siteOfflineMsg },
            { new: true }
          )
          .exec();

        /********************************************************
        Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "SITE_MAIN_DATA_UPDATED"
          )
        );
      } else {
        let siteUnMaintenanceSettings = {
          siteUnMaintenance: {
            siteStatus: this.req.body.siteStatus,
            siteOfflineStartDate: this.req.body.siteOfflineStartDate,
            siteOfflineEndDate: this.req.body.siteOfflineEndDate,
          },
        };
        await this.addDefaultSettings(
          siteUnMaintenanceSettings,
          GenSettingsSchema
        );
        /********************************************************
        Save Language details and validate
        ********************************************************/
        await new Model(siteUnMaintenanceSchema).store({
          siteOfflineMsg: data.siteOfflineMsg,
          languageId: data.languageId,
        });
        /********************************************************
        Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "SITE_MAIN_DATA_UPDATED"
          )
        );
      }
    } catch (error) {
      console.log("error addSiteUnMaintainance()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
   @Purpose: Get site settings data
    @Parameter: 
    {}    
    @Return: JSON String
  ********************************************************/
  async getSiteSetting() {
    try {
      if (_.isEmpty(this.req.query.languageId)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "REQUEST_PARAMETERS"
          )
        );
      }
      const siteData = await siteSettingSchema
        .findOne({ languageId: this.req.query.languageId })
        .select(Projection.settings)
        .exec();
      const generalSettings = await generalSettingsSchema
        .findOne()
        .select({ dateTimeSettings: 1 });
      let result = siteData?._doc || {};
      result = { ...generalSettings.dateTimeSettings, ...result };
      if (_.isEmpty(siteData)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      } else {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          result
        );
      }
    } catch (error) {
      console.log("error getSiteSetting()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose: Get Metadata
      @Parameter: 
      {}    
      @Return: JSON String
   ********************************************************/
  async getMetaSettings() {
    try {
      if (_.isEmpty(this.req.query.languageId)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "REQUEST_PARAMETERS"
          )
        );
      }
      let metaData = await metaDataSchema
        .findOne({ languageId: this.req.query.languageId })
        .select(Projection.settings)
        .exec();
      if (_.isEmpty(metaData)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      } else {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          metaData
        );
      }
    } catch (error) {
      console.log("error getMetaSettings()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
       @Purpose: Add/Edit analitic data
       @Parameter: 
       {
          "analyticalDataSnippet": "analyticalDataSnippet"
          "analyticalHeaderSnippet": "analyticalHeaderSnippet",
          "analyticalFooterSnippet":"analyticalFooterSnippet"
       }
       @Return: JSON String
      ********************************************************/
  async addAnalyticalData() {
    try {
      let fieldsArrays = ["headerSnippet", "footerSnippet"];
      let emptyFields = await new RequestBody().checkEmptyWithFields(
        this.req.body,
        fieldsArrays
      );
      if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          i18n.__("SEND_PROPER_DATA") +
            " " +
            emptyFields.toString() +
            " fields required."
        );
      }

      let analiticDataSettings = {
        analyticalData: {
          analyticalSnippet: this.req.body.analyticalSnippet,
          headerSnippet: this.req.body.headerSnippet,
          footerSnippet: this.req.body.footerSnippet,
        },
      };
      await this.addDefaultSettings(analiticDataSettings, GenSettingsSchema);
      /********************************************************
         Generate and return response
       ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "ANALITIC_DATA_UPDATED"
        )
      );
    } catch (error) {
      console.log("error addAnalyticalData()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }
  /********************************************************
    @Purpose: Get analytical data
     @Parameter: 
     {}    
     @Return: JSON String
  ********************************************************/
  async getAnalyticalData() {
    try {
      let data = await GenSettingsSchema.findOne()
        .select(Projection.analyticalData)
        .exec();
      if (_.isEmpty(data)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      } else {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          data
        );
      }
    } catch (error) {
      console.log("error getAnalyticalData()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose: Get analytical data
      @Parameter: 
      {}    
      @Return: JSON String
   ********************************************************/
  async getSiteUnMaintainance() {
    try {
      if (_.isEmpty(this.req.query.languageId)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "REQUEST_PARAMETERS"
          )
        );
      }
      let data = await siteUnMaintenanceSchema
        .findOne({ languageId: this.req.query.languageId })
        .select(Projection.settings)
        .exec();
      let SiteUnMaintainance = await GenSettingsSchema.findOne()
        .select(Projection.siteUnMaintainance)
        .exec();
      SiteUnMaintainance =
        SiteUnMaintainance && SiteUnMaintainance.siteUnMaintenance;
      data = {
        _id: data?._id,
        siteOfflineMsg: data?.siteOfflineMsg,
        languageId: data?.languageId,
        ...SiteUnMaintainance,
      };
      if (_.isEmpty(data)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      } else {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          data
        );
      }
    } catch (error) {
      console.log("error getSiteUnMaintainance()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose: Add/Edit Social media sdk details
      @Parameter: 
      {
        "facebookAppId":"facebookAppId", 
        "facebookAppSecret":"facebookAppSecret",
        "fbSDKactiveStatus":true,
        "twitterAppId":"twitterAppId",
        "twitterAppSecret":"twitterAppSecret",
        "twitterSDKactiveStatus":true,
        "linkedInAppId":"linkedInAppId",
        "linkedInAppSecret":"linkedInAppSecret",
        "linkinedSDKactiveStatus":true
      }
      @Return: JSON String
    ********************************************************/
  async addUpdateSocialMediaSDK() {
    try {
      let fieldsArray = [
        "facebookAppId",
        "facebookAppSecret",
        "fbSDKStatus",
        "twitterAppId",
        "twitterAppSecret",
        "twitterSDKStatus",
        "linkedInAppId",
        "linkedInAppSecret",
        "linkinedSDKStatus",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      let socialMediaSDKData = {
        socialMediaSDK: {
          ...data,
        },
      };

      await this.addDefaultSettings(socialMediaSDKData, SocialMediaSchema);
      /********************************************************
        Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SOCIAL_MEDIA_SDK_UPDATED"
        )
      );
    } catch (error) {
      console.log("error addUpdateSocialMediaSDK()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
      @Purpose: Add/Edit Payment Gateway
      @Parameter: 
      {
          status: "",
          environment: "",
          loginId: "",
          transactionTestKeyStatus: "",
          transactionTestKey: "",
          transactionPublicKey: "",
      }
      @Return: JSON String
     ********************************************************/
  async addPaymentGateway() {
    try {
      let data = this.req.body;
      const paymentGateway = await paymentGatewaySchema.findOne().exec();
      if (paymentGateway) {
        /********************************************************
        Update payment gateway and validate
        ********************************************************/
        await paymentGatewaySchema
          .updateOne({ _id: paymentGateway._id }, data, { new: true })
          .exec();

        /********************************************************
        Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "PAYMENT_GATEWAY_DATA_UPDATE"
          )
        );
      } else {
        /********************************************************
        Save Language details and validate
        ********************************************************/
        await new Model(paymentGatewaySchema).store(data);
        /********************************************************
        Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "PAYMENT_GATEWAY_DATA_UPDATE"
          )
        );
      }
    } catch (error) {
      console.log("error addPaymentGateway()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
   @Purpose: Get social media sdk settings
    @Parameter: 
    {}    
    @Return: JSON String
 ********************************************************/
  async getSocialMediaSDK() {
    try {
      let data = await SocialMediaSchema.findOne()
        .select(Projection.socialMediaSDK)
        .exec();
      if (_.isEmpty(data)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      } else {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          data
        );
      }
    } catch (error) {
      console.log("error getSocialMediaSDK()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose: Get Payment Gateway
      @Parameter: 
      {}    
      @Return: JSON String
   ********************************************************/
  async getPaymentGateway() {
    try {
      let data = await paymentGatewaySchema
        .findOne()
        .select(Projection.settings)
        .exec();

      if (_.isEmpty(data)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      } else {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          data
        );
      }
    } catch (error) {
      console.log("error getPaymentGateway()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose: Add/Edit Social media link details
      @Parameter: 
      {
        "fbUrl":"facebookAppId", 
        "twitterUrl":"facebookAppSecret",      
        "linkedinUrl":"twitterAppId",
        "instagramUrl":"twitterAppSecret"     
      }
      @Return: JSON String
    ********************************************************/
  async addUpdatesocialMediaLink() {
    try {
      let fieldsArray = [
        "fbUrl",
        "twitterUrl",
        "linkedinUrl",
        "instagramUrl",
        "youtubeUrl",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      let socialMediaLinkData = {
        socialMediaLink: {
          ...data,
        },
      };

      await this.addDefaultSettings(socialMediaLinkData, SocialMediaSchema);
      /********************************************************
        Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SOCIAL_MEDIA_LINK_UPDATED"
        )
      );
    } catch (error) {
      console.log("error addUpdatesocialMediaLink()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose: Get social media sdk settings
      @Parameter: 
      {}    
      @Return: JSON String
   ********************************************************/
  async getSocialMediaLink() {
    try {
      let data = await SocialMediaSchema.findOne()
        .select(Projection.socialMediaLink)
        .exec();
      if (_.isEmpty(data)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      } else {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          data
        );
      }
    } catch (error) {
      console.log("error getSocialMediaLink()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose: Add/Edit General Datetime Settings
      @Parameter: 
      {
        "timeZone":"Asia/Kolkata", 
        "dateFormat":"DD/MM/YYYY",      
        "currency":"INR",
        "timeFormat":"12 hours"     
      }
      @Return: JSON String
    ********************************************************/
  async addUpdateDateTimeSettings() {
    try {
      let fieldsArray = ["timeZone", "dateFormat", "currency", "timeFormat"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      let dateTimeSettingsData = {
        dateTimeSettings: {
          ...data,
        },
      };

      await this.addDefaultSettings(dateTimeSettingsData, GenSettingsSchema);
      /********************************************************
        Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "DATE_TIME_SETTINGS_UPDATE"
        )
      );
    } catch (error) {
      console.log("error addUpdateDateTimeSettings()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
   @Purpose: Get general datetime settings
    @Parameter: 
    {}    
    @Return: JSON String
 ********************************************************/
  async getDateTimeSettings() {
    try {
      let data = await GenSettingsSchema.findOne()
        .select(Projection.dateTimeSettings)
        .exec();
      if (_.isEmpty(data)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      } else {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          data
        );
      }
    } catch (error) {
      console.log("error getDateTimeSettings()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
 @Purpose: change status for social media SDK
  @Parameter: 
  {
    "id":"6385f253094ada106baab5a3,
    "fbSDKStatus":false,
    "twitterSDKStatus":false,
    "linkinedSDKStatus":false  
  }
  @Return: JSON String
********************************************************/
  async changeSocialSDKStatus() {
    try {
      const socialMediaSDK = await SocialMediaSchema.findOne({
        _id: this.req.body.id,
      }).exec();

      if (_.isEmpty(socialMediaSDK)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      }

      let paramKey = Object.keys(this.req.body)[1];
      let smKey = "socialMediaSDK." + paramKey;
      let key = smKey;
      let smParam = {};
      smParam[key] = this.req.body[paramKey];

      await SocialMediaSchema.findByIdAndUpdate(
        { _id: this.req.body.id },
        smParam,
        { new: true }
      ).exec();
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "STATUS_CHANGE"
        )
      );
    } catch (error) {
      console.log("error changeSocialSDKStatus()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
  @Purpose: change status for 2FA
  @Parameter: 
  {
    status
  }
  @Return: JSON String
  ********************************************************/
  async change2FAStatus() {
    try {
      const generalSettings = await GenSettingsSchema.findOne().exec();

      if (_.isEmpty(generalSettings)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      }

      await GenSettingsSchema.findByIdAndUpdate(
        { _id: generalSettings.id },
        { is2FA: this.req.body.status }
      ).exec();
      if (this.req.body.status) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "ENABLE_TWO_FACTOR_MODE"
          )
        );
      } else {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DISABLE_TWO_FACTOR_MODE"
          )
        );
      }
    } catch (error) {
      console.log("error change2FAStatus()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
   @Purpose: Add/Edit smtp settings details
    @Parameter: 
    {
      "host":"smtp.gmail.com", 
      "port":567,
      "encryption":encryption,
      "userName":"userName",
      "password":"password@123",
      "fromEmail":fromEmail,
      "fromName":"fromName"      
    }
    @Return: JSON String
  ********************************************************/
  async addsmtpSettings() {
    try {
      let fieldsArrays = ["type"];
      let emptyFields = await new RequestBody().checkEmptyWithFields(
        this.req.body,
        fieldsArrays
      );
      if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          i18n.__("SEND_PROPER_DATA") +
            " " +
            emptyFields.toString() +
            " fields required."
        );
      }

      let smtpSettingsData = {
        smtpSettings: {
          host: this.req.body.host,
          port: this.req.body.port,
          encryption: this.req.body.encryption,
          userName: this.req.body.userName,
          password: this.req.body.password,
          fromEmail: this.req.body.fromEmail,
          fromName: this.req.body.fromName,
        },
      };
      await this.addDefaultSettings(this.req.body, SmtpSchema);
      /********************************************************
         Generate and return response
       ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SMTP_DATA_UPDATED"
        )
      );
    } catch (error) {
      console.log("error addsmtpSettings()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
  @Purpose: Get smtp settings details
   @Parameter: 
   {}    
   @Return: JSON String
 ********************************************************/
  async getsmtpSettings() {
    try {
      let key = this.req.query.type;
      let select = {};
      select[key] = 1;
      let data = await SmtpSchema.findOne().select(select).exec();
      if (_.isEmpty(data)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      } else {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          data
        );
      }
    } catch (error) {
      console.log("error getsmtpSettings()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose: Add/Edit smtp settings details
      @Parameter: 
      {         
        "userName":"userName",
        "password":"password@123",
        "appId":appId           
      }
      @Return: JSON String
********************************************************/
  async addSMSdetails() {
    try {
      let fieldsArrays = ["userName", "password", "appId"];
      let emptyFields = await new RequestBody().checkEmptyWithFields(
        this.req.body,
        fieldsArrays
      );
      if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          i18n.__("SEND_PROPER_DATA") +
            " " +
            emptyFields.toString() +
            " fields required."
        );
      }

      let smsSettingsData = {
        smsSettings: {
          userName: this.req.body.userName,
          password: this.req.body.password,
          appId: this.req.body.appId,
        },
      };
      await this.addDefaultSettings(smsSettingsData, SmtpSchema);
      /********************************************************
         Generate and return response
       ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SMS_DATA_UPDATE"
        )
      );
    } catch (error) {
      console.log("error addSMSdetails()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose: Get sms settings details
      @Parameter: 
      {}    
      @Return: JSON String
  ********************************************************/
  async getSMSsettings() {
    try {
      let data = await SmtpSchema.findOne()
        .select(Projection.smsSettings)
        .exec();
      if (_.isEmpty(data)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      } else {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          data
        );
      }
    } catch (error) {
      console.log("error getSMSsettings()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
   @Purpose: Get emails settings status
    @Parameter: 
    {}    
    @Return: JSON String
  ********************************************************/
  async getEmailSettingsNotification() {
    try {
      let data = await EmailSettingSchema.find({ isDeleted: false })
        .select(Projection.emailSettings)
        .exec();
      if (_.isEmpty(data)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      } else {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          data
        );
      }
    } catch (error) {
      console.log("error getEmailSettingsNotification()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
   @Purpose: emails settings notification status change
    @Parameter: 
    {
      "notificationId":"639965ef06232d7c44e8d475"      
    }    
    @Return: JSON String
  ********************************************************/
  async emailSettingStatusChange() {
    try {
      const notificatonId = await EmailSettingSchema.findOne({
        _id: this.req.body.notificationId,
      }).exec();
      if (_.isEmpty(notificatonId)) {
        return this.res.send({ sttaus: 0, message: i18n._("NOT_FOUND") });
      }
      await EmailSettingSchema.findByIdAndUpdate(notificatonId._id, {
        status: !notificatonId.status,
      }).exec();
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "STATUS_UPDATED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error emailSettingStatusChange()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
    @Purpose: Function to add default settings
    @Parameter:
    {
            defaultSettings: {}
    }
    @Return: JSON String
    ********************************************************/
  async addDefaultSettings(settings, schemaObj) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let select = {};
          select[settings.type] = 1;
          let defaultSettings = await schemaObj.findOne().select(select);
          if (defaultSettings) {
            defaultSettings = await schemaObj.findOneAndUpdate(
              { _id: defaultSettings._id },
              settings,
              { new: true }
            );
          } else {
            defaultSettings = await new Model(schemaObj).store(settings);
          }
          return resolve(defaultSettings);
        } catch (error) {
          return reject(error);
        }
      })();
    });
  }
  /********************************************************
    @Purpose: Function to add stripe bank account
    @Parameter:
    {
           check validator
    }
    @Return: JSON String
    ********************************************************/
  async addBankAccount() {
    try {
      let currentUser = this.req.currentUser ? this.req.currentUser._id : "";
      let fieldsArray = [
        "accountHolderName",
        "accountHolderType",
        "accountNumber",
        "routingNumber",
        "country",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      let currency = { IND: "inr", NZD: "nzd" };
      let bank = {
        bank_account: {
          account_holder_name: data.accountHolderName,
          account_type: data.accountHolderType,
          account_number: data.accountNumber,
          routing_number: data.routingNumber,
          country: data.country,
          currency: currency[data.country],
        },
      };
      let bankToken = await new EmployerService().stripeCreateToken(bank);
      console.log(bankToken);
      let createAccount = await new EmployerService().stripeCreateAdminBank(
        configs.stripeId,
        bankToken.data.id
      );
      console.log(createAccount);
      if (createAccount.status) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DATA_ADDED"
          )
        );
      } else {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SERVER_ERROR_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "SERVER_ERROR"
          ),
          { error: createAccount }
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error adding bank", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }
  /********************************************************
    @Purpose: Function to add stripe bank account
   
    @Return: JSON String
    ********************************************************/
  async bankAccountListing() {
    try {
      let currentUser = this.req.currentUser ? this.req.currentUser._id : "";

      let bankList = await new EmployerService().listBankAccount(
        configs.stripeId
      );
      bankList = bankList.status ? bankList.data.data : [];
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        bankList
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error adding bank", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }
}

module.exports = SettingsController;
