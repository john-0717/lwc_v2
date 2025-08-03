const _ = require("lodash");

const Controller = require("../Base/Controller");
const { EmailTemplate, CampaignTemplate } = require("./Schema");
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const Projection = require("./Projection.json");
const { HTTP_CODE } = require("../../services/constant");
const { Languages } = require("../MasterLanguageManagement/Schema");
const ObjectId = require("mongoose").Types.ObjectId;
const path = require("path");
const fs = require("fs");
const {
  socialMediaSDKSchema,
  siteSettingSchema,
  smtpSettingsSchema,
} = require("../Settings/Schema");
const mustache = require("mustache");
const Email = require("../../services/Email");
const { userSchema } = require("../Users/Schema");
const config = require("../../../configs/configs");

class EmailTemplateController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
		 @Purpose Add Email Templates
		 @Parameter {
				"languageId":"",
				"emailKey":"",
				"emailTitle":"",
				"subject":"",
				"emailContent":""
		 }
		 @ReturnJSON String
		 ********************************************************/
  async addEmailTemplate() {
    try {
      /********************************************************
			Generate Field Array and process the request body
			********************************************************/
      let fieldsArray = [
        "emailKey",
        "emailTitle",
        "subject",
        "emailContent",
        "languageId",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      /********************************************************
			Check Email Template in DB and validate
			********************************************************/
      let checkingEmailTemplate = await EmailTemplate.findOne({
        emailKey: data.emailKey,
        languageId: data.languageId,
        isDeleted: false,
      }).exec();
      if (!_.isEmpty(checkingEmailTemplate)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "EMAIL_TEMPLATE_ALREADY_EXISTS"
          )
        );
      }
      data.contentTags = [
        {
          field: "{{CommentBy_Firstname}}",
          key: "CommentBy_Firstname",
          description:
            "Ipsum et et sed no et dolore, sadipscing vero sit ipsum at dolores no et labore, et no eos ipsum.",
        },
        {
          field: "{{CommentBy_Lastname}}",
          key: "CommentBy_Lastname",
          description:
            "Ipsum et et sed no et dolore, sadipscing vero sit ipsum at dolores no et labore, et no eos ipsum.",
        },
      ];
      data.createdBy = this.req.currentUser && this.req.currentUser._id;
      /********************************************************
			Update email template data into DB and validate
			********************************************************/
      const emailTemplateData = await new Model(EmailTemplate).store(data);
      if (_.isEmpty(emailTemplateData)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "EMAIL_TEMPLATE_NOT_SAVED"
          )
        );
      }
      /********************************************************
			Generate and return response
			********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "EMAIL_TEMPLATE_SAVED"
        )
      );
    } catch (error) {
      /********************************************************
			Manage Error logs and Response
			********************************************************/
      console.log("error addEmailTemplate()", error);
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
	 @Purpose Update Email Template 
	 @Parameter {
				"id":"",
				"emailTitle":"",
				"subject":"",
				"emailContent":""
		 }
	 @ReturnJSON String
	 ********************************************************/
  async updateEmailTemplate() {
    try {
      /********************************************************
			Generate Field Array and process the request body
			********************************************************/
      let fieldsArray = ["emailTitle", "subject", "emailContent", "emailType"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      console.log(data);
      /********************************************************
			Check Email Template in DB and validate
			********************************************************/
      let checkingEmailTemplate = await EmailTemplate.findOne({
        _id: ObjectId(this.req.params.id),
      }).exec();
      if (_.isEmpty(checkingEmailTemplate)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "EMAIL_TEMPLATE_NOT_FOUND"
          )
        );
      }

      data.modifiedBy = this.req.currentUser?._id;
      /********************************************************
			Update emailTemplate data into DB and validate
			********************************************************/
      const emailTemplateData = await EmailTemplate.findByIdAndUpdate(
        ObjectId(this.req.params.id),
        data,
        { new: true }
      ).exec();

      if (_.isEmpty(emailTemplateData)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "EMAIL_TEMPLATE_NOT_UPDATED"
          )
        );
      }

      /********************************************************
			Generate and return response
			********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "EMAIL_TEMPLATE_UPDATED"
        )
      );
    } catch (error) {
      /********************************************************
			Manage Error logs and Response
			********************************************************/
      console.log("error updateEmailTemplate()", error);
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
		@Purpose Email Template Listing
		@Parameter
		{
			 "languageId":"",
			 "page":1,
			 "pagesize":10,
			 "searchText":""
		}
		@Return JSON String
		********************************************************/
  async emailTemplateListing() {
    try {
      /********************************************************
			Set Modal for listing
			********************************************************/
      this.req.body["model"] = EmailTemplate;

      /********************************************************
			Validate request parameters
			********************************************************/
      if (_.isEmpty(this.req.body.languageId)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "VALID_LANGUAGE_ID"
          )
        );
      }

      this.req.body["lang"] = this.req.body.languageId;

      let result;
      if (this.req.body.searchText) {
        /********************************************************
				Listing for Search Functionality
				********************************************************/
        this.req.body["filter"] = ["emailTitle", "subject"];
        let data = {
          bodyData: this.req.body,
          selectObj: Projection.emailSearching,
        };
        result = await EmailTemplateController.searchMultilingual(data);
      } else {
        /********************************************************
				Listing for filter functionality
				********************************************************/
        let data = {
          bodyData: this.req.body,
          selectObj: Projection.email,
        };
        result = await EmailTemplateController.listingMultilingual(data);
      }

      /********************************************************
				Generate and return response
			********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        result.data,
        null,
        result.page,
        result.perPage,
        result.total
      );
    } catch (error) {
      /********************************************************
			Manage Error logs and Response
			********************************************************/
      console.log("error emailTemplateListing()", error);
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
		 @PurposeCountry delete
		 @Parameter
		 {
				"emailIds":[""],
		 }
		 @Return JSON String
		 ********************************************************/
  async deleteEmailTemplates() {
    try {
      /********************************************************
			Update Delete Status
			********************************************************/
      await EmailTemplate.updateMany(
        { _id: { $in: this.req.body.emailIds } },
        { $set: { isDeleted: true } }
      ).exec();
      /********************************************************
				Generate and return response
			********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "EMAIL_TEMPLATE_DELETED"
        )
      );
    } catch (error) {
      /********************************************************
			Manage Error logs and Response
			********************************************************/
      console.log("error deleteEmailTemplates()", error);
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
		 @Purpose Email Template Change Status
		 @Parameter
		 {
				"emailIds":[],
				"status":true/false
		 }
		 @Return JSON String
	********************************************************/
  async changeEmailStatus() {
    try {
      /********************************************************
			Update Status
			********************************************************/
      await EmailTemplate.updateMany(
        { _id: { $in: this.req.body.emailIds } },
        { $set: { status: this.req.body.status } }
      ).exec();
      /********************************************************
				Generate and return response
			********************************************************/
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
      console.log("error changeEmailStatus()", error);
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
		 @Purpose get Email details
		 @Parameter {id}
		 @Return JSON String
		 ********************************************************/
  async getEmailDetails() {
    try {
      /********************************************************
			Validate request parameters
			********************************************************/
      if (
        _.isEmpty(this.req.query.emailKey) ||
        _.isEmpty(this.req.query.languageId)
      ) {
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

      /********************************************************
			Find Email details and validate
			********************************************************/
      const emailDetails = await EmailTemplate.findOne({
        emailKey: this.req.query.emailKey,
        languageId: this.req.query.languageId,
        isDeleted: false,
      })
        .select(Projection.email)
        .populate("createdBy", "firstname lastname")
        .populate("modifiedBy", "firstname lastname")
        .exec();

      if (_.isEmpty(emailDetails)) {
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

      let invoiceHTMLFilePath = path.join(
        appRoot,
        "/public/html/emailTemplate.html"
      );
      fs.readFile(invoiceHTMLFilePath, "utf-8", (err, html) => {
        return new Promise((resolve, reject) => {
          (async () => {
            if (err) {
              console.log("err", err);
              return resolve(
                this.res.send({
                  status: 0,
                  message: i18n.__("NOT_FOUND"),
                  data: err,
                })
              );
            }
            let socialMediaLinks = await socialMediaSDKSchema.findOne();
            console.log(socialMediaLinks);
            //get site settings
            let siteSettings = await siteSettingSchema.findOne({
              languageId: ObjectId(this.req.query.languageId),
            });
            let configuration = await smtpSettingsSchema.find();
            let replaceEmailDataObj = {
              fbUrl: socialMediaLinks.socialMediaLink.fbUrl
                ? socialMediaLinks.socialMediaLink.fbUrl
                : "https://www.facebook.com/",
              instagramUrl: socialMediaLinks.socialMediaLink.instagramUrl
                ? socialMediaLinks.socialMediaLink.instagramUrl
                : "https://www.instagram.com/",
              twitterUrl: socialMediaLinks.socialMediaLink.twitterUrl
                ? socialMediaLinks.socialMediaLink.twitterUrl
                : "https://twitter.com/",
              linkedinUrl: socialMediaLinks.socialMediaLink.linkedInUrl
                ? socialMediaLinks.socialMediaLink.linkedInUrl
                : "https://www.linkedin.com/",
              youtubeUrl: socialMediaLinks.socialMediaLink.youtubeUrl
                ? socialMediaLinks.socialMediaLink.youtubeUrl
                : "https://youtube.com/",
              email: siteSettings?.siteEmail,
              address: siteSettings?.siteAddress,
              phone: siteSettings?.sitePhoneNo,
              siteName: siteSettings?.siteName,
              siteLogo: config.s3Endpoint + siteSettings?.siteLogoSmall,
              siteUrl: config.frontUrl,
              supportEmail: configuration.length
                ? configuration[0].smtpSettings.userName
                : "",
              youtubeImg: `${config.apiUrl}/public/icon/youtube.svg`,
              instagramImg: `${config.apiUrl}/public/icon/instagram.svg`,
              facebookImg: `${config.apiUrl}/public/icon/facebook.svg`,
              twitterImg: `${config.apiUrl}/public/icon/twitter.svg`,
              linkedinImg: `${config.apiUrl}/public/icon/linkdin.svg`,
              cancelledImg: `${config.apiUrl}/public/icon/cancelled.png`,
              expiredImg: `${config.apiUrl}/public/icon/expired.png`,
              userImg: `${config.apiUrl}/public/icon/user.png`,
              subscribeImg: `${config.apiUrl}/public/icon/subscribe.png`,
              trailImg: `${config.apiUrl}/public/icon/trail.png`,
            };
            let previewTemplate = mustache.render(
              emailDetails.emailContent,
              replaceEmailDataObj
            );

            /********************************************************
              Generate and return response
              ********************************************************/
            return resolve(
              new CommonService().handleResolve(
                this.res,
                HTTP_CODE.SUCCESS,
                HTTP_CODE.SUCCESS_CODE,
                await new CommonService().setMessage(
                  this.req.currentUserLang,
                  "GET_DETAIL_SUCCESSFULLY"
                ),
                {
                  _id: emailDetails._id,
                  languageId: emailDetails.languageId,
                  emailTitle: emailDetails.emailTitle,
                  emailContent: emailDetails.emailContent,
                  subject: emailDetails.subject,
                  status: emailDetails.status,
                  contentTags: emailDetails.contentTags,
                  createdAt: emailDetails.createdAt,
                  updatedAt: emailDetails.updatedAt,
                  modifiedBy: emailDetails.modifiedBy,
                  emailType: emailDetails.emailType,
                  previewTemplate,
                }
              )
            );
          })();
        });
      });
    } catch (error) {
      /********************************************************
			Manage Error logs and Response
			********************************************************/
      console.log("error getEmailDetails()", error);
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
		 @Purpose add campaign email
		 @Parameter {}
		 @Return JSON String
		 ********************************************************/
  async addCampaignTemplate() {
    try {
      /********************************************************
			Generate Field Array and process the request body
			********************************************************/
      let fieldsArray = [
        "campaignSubject",
        "title",
        "buttons",
        "heading",
        "leftImage",
        "description",
        "topic1",
        "topic2",
        "topic3",
        "footer",
        "fBUrl",
        "twitterUrl",
        "linkedinUrl",
        "instagramUrl",
        "email",
        "phone",
        "address",
        "applicantColor",
        "employerColor",
        "sendTo",
        "languageId",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      //get site settings
      let siteSettings = await siteSettingSchema
        .findOne({ languageId: ObjectId(data.languageId) })
        .select({ siteEmail: 1, siteAddress: 1, sitePhoneNo: 1 });
      //get socialMedia
      let socialMedia = await socialMediaSDKSchema.find();
      data.fbUrl = socialMedia[0]?.socialMediaLink.fbUrl;
      data.twitterUrl = socialMedia[0]?.socialMediaLink.twitterUrl;
      data.linkedinUrl = socialMedia[0]?.socialMediaLink.linkedinUrl;
      data.instagramUrl = socialMedia[0]?.socialMediaLink.instagramUrl;
      data.email = siteSettings?.siteEmail;
      data.address = siteSettings?.siteAddress;
      data.phone = siteSettings?.sitePhoneNo;

      /********************************************************
			Check Email Template in DB and validate
			********************************************************/
      let checkingEmailTemplate = await CampaignTemplate.findOne({
        title: data.title,
        languageId: data.languageId,
        isDeleted: false,
      }).exec();
      if (!_.isEmpty(checkingEmailTemplate)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "EMAIL_TEMPLATE_ALREADY_EXISTS"
          )
        );
      }
      data.createdBy = this.req.currentUser?._id;
      data.updatedBy = this.req.currentUser?._id;

      /********************************************************
			Update email template data into DB and validate
			********************************************************/
      const emailTemplateData = await new Model(CampaignTemplate).store(data);
      if (_.isEmpty(emailTemplateData)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "EMAIL_TEMPLATE_NOT_SAVED"
          )
        );
      }
      /********************************************************
			Generate and return response
			********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "EMAIL_TEMPLATE_SAVED"
        )
      );
    } catch (error) {
      /********************************************************
			Manage Error logs and Response
			********************************************************/
      console.log("error addEmailTemplate()", error);
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
		 @Purpose edit campaign email
		 @Parameter {}
		 @Return JSON String
		 ********************************************************/
  async editCampaignTemplate() {
    try {
      /********************************************************
			Generate Field Array and process the request body
			********************************************************/
      let fieldsArray = [
        "id",
        "campaignSubject",
        "title",
        "buttons",
        "heading",
        "leftImage",
        "description",
        "topic1",
        "topic2",
        "topic3",
        "footer",
        "applicantColor",
        "employerColor",
        "sendTo",
        "languageId",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      /********************************************************
			Check Email Template in DB and validate
			********************************************************/
      let checkingEmailTemplate = await CampaignTemplate.findOne({
        title: data.title,
        languageId: data.languageId,
        isDeleted: false,
        _id: { $ne: ObjectId(data.id) },
      }).exec();
      if (!_.isEmpty(checkingEmailTemplate)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "EMAIL_TEMPLATE_ALREADY_EXISTS"
          )
        );
      }
      data.updatedBy = this.req.currentUser?._id;
      data.updatedAt = new Date().getTime();
      /********************************************************
			Update email template data into DB and validate
			********************************************************/
      await CampaignTemplate.updateOne(
        { _id: ObjectId(data.id) },
        { $set: data }
      );

      /********************************************************
			Generate and return response
			********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "EMAIL_TEMPLATE_UPDATED"
        )
      );
    } catch (error) {
      /********************************************************
			Manage Error logs and Response
			********************************************************/
      console.log("error editEmailTemplate()", error);
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
		 @Purpose edit campaign email
		 @Parameter {}
		 @Return JSON String
		 ********************************************************/
  async deleteCampaignTemplate() {
    try {
      /********************************************************
			Generate Field Array and process the request body
			********************************************************/
      let fieldsArray = ["campaignIds"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      let body = {
        updatedBy: this.req.currentUser?._id,
        updatedAt: new Date().getTime(),
        isDeleted: true,
      };

      /********************************************************
			Update email template data into DB and validate
			********************************************************/
      await CampaignTemplate.updateOne(
        { _id: { $in: data.campaignIds } },
        { $set: body }
      );

      /********************************************************
			Generate and return response
			********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "EMAIL_TEMPLATE_DELETED"
        )
      );
    } catch (error) {
      /********************************************************
			Manage Error logs and Response
			********************************************************/
      console.log("error deleteEmailTemplate()", error);
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
		 @Purpose edit campaign email
		 @Parameter {}
		 @Return JSON String
		 ********************************************************/
  async listCampaignTemplate() {
    try {
      /********************************************************
			Set Modal for listing
			********************************************************/
      this.req.body["model"] = CampaignTemplate;

      /********************************************************
			Validate request parameters
			********************************************************/
      if (_.isEmpty(this.req.body.languageId)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "VALID_LANGUAGE_ID"
          )
        );
      }

      this.req.body["lang"] = this.req.body.languageId;

      let result;
      if (this.req.body.searchText) {
        /********************************************************
				Listing for Search Functionality
				********************************************************/
        this.req.body["filter"] = ["title"];
        let data = {
          bodyData: this.req.body,
          selectObj: Projection.emailSearching,
        };
        result = await EmailTemplateController.searchMultilingual(data);
      } else {
        /********************************************************
				Listing for filter functionality
				********************************************************/
        let data = {
          bodyData: this.req.body,
          selectObj: Projection.email,
        };
        result = await EmailTemplateController.listingMultilingual(data);
      }

      /********************************************************
				Generate and return response
			********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        result.data,
        null,
        result.page,
        result.perPage,
        result.total
      );
    } catch (error) {
      /********************************************************
			Manage Error logs and Response
			********************************************************/
      console.log("error campaignEmailTemplateListing()", error);
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
		 @Purpose Campaign Email Template Change Status
		 @Parameter
		 {
				"emailIds":[],
				"status":true/false
		 }
		 @Return JSON String
	********************************************************/
  async changeCampaignEmailStatus() {
    try {
      /********************************************************
			Update Status
			********************************************************/
      await CampaignTemplate.updateMany(
        { _id: { $in: this.req.body.campaignIds } },
        { $set: { status: this.req.body.status } }
      ).exec();
      /********************************************************
				Generate and return response
			********************************************************/
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
      console.log("error changeCampaignEmailStatus()", error);
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
		 @Purpose details campaign email
		 @Parameter {}
		 @Return JSON String
		 ********************************************************/
  async detailsCampaignTemplate() {
    try {
      /********************************************************
			Generate Field Array and process the request body
			********************************************************/
      let fieldsArray = ["id", "languageId"];
      let data = await new RequestBody().processRequestBody(
        this.req.query,
        fieldsArray
      );

      let result = await CampaignTemplate.findOne({
        _id: ObjectId(data.id),
        languageId: this.req.query.languageId,
        isDeleted: false,
      })
        .select(Projection.email)
        .populate("createdBy", "firstname lastname")
        .populate("modifiedBy", "firstname lastname")
        .lean();
      if (_.isEmpty(result)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "EMAIL_TEMPLATE_NOT_FOUND"
          )
        );
      }
      let invoiceHTMLFilePath = path.join(
        appRoot,
        "/public/html/newsLetter.html"
      );
      fs.readFile(invoiceHTMLFilePath, "utf-8", (err, html) => {
        return new Promise((resolve, reject) => {
          (async () => {
            if (err) {
              console.log("err", err);
              return resolve(
                this.res.send({
                  status: 0,
                  message: i18n.__("NOT_FOUND"),
                  data: err,
                })
              );
            }

            let replaceEmailDataObj = {
              campaignSubject: result.campaignSubject,
              title: result.title,
              buttons: result.buttons,
              heading: result.heading,
              leftImage: result.leftImage,
              description: result.description,
              topic1: result.topic1,
              topic2: result.topic2,
              topic3: result.topic3,
              footer: result.footer,
              fBUrl: result.fBUrl,
              twitterUrl: result.twitterUrl,
              linkedinUrl: result.linkedinUrl,
              instagramUrl: result.instagramUrl,
              email: result.email,
              phone: result.phone,
              address: result.address,
            };
            let previewTemplate = mustache.render(html, replaceEmailDataObj);

            /********************************************************
              Generate and return response
              ********************************************************/
            return resolve(
              new CommonService().handleResolve(
                this.res,
                HTTP_CODE.SUCCESS,
                HTTP_CODE.SUCCESS_CODE,
                await new CommonService().setMessage(
                  this.req.currentUserLang,
                  "GET_DETAIL_SUCCESSFULLY"
                ),
                {
                  ...result,
                  previewTemplate,
                }
              )
            );
          })();
        });
      });
    } catch (error) {
      /********************************************************
			Manage Error logs and Response
			********************************************************/
      console.log("error detailsCampaignTemplate()", error);
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
		 @Purpose send campaign email
		 @Parameter {}
		 @Return JSON String
		 ********************************************************/
  async sendCampaignTemplate() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = ["id", "languageId"];
      let data = await new RequestBody().processRequestBody(
        this.req.query,
        fieldsArray
      );

      let result = await CampaignTemplate.findOne({
        _id: ObjectId(data.id),
        languageId: this.req.query.languageId,
        isDeleted: false,
      })
        .select(Projection.email)
        .populate("createdBy", "firstname lastname")
        .populate("modifiedBy", "firstname lastname")
        .lean();
      if (_.isEmpty(result)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "EMAIL_TEMPLATE_NOT_FOUND"
          )
        );
      }
      let emails = await userSchema
        .find({
          role: { $in: result?.sendTo },
          isDeleted: false,
          isEmailVerified: true,
        })
        .select({ email: 1 });
      emails.forEach((e) => {
        (async () => {
          let obj = {
            emailId: e.email,
            replaceDataObj: result,
          };
          new Email().sendNewsLetter(obj);
        })();
      });
      new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "MAILS_ARE_IN_QUE"
        )
      );
    } catch (error) {
      /********************************************************
			Manage Error logs and Response
			********************************************************/
      console.log("error sendCampaignTemplate()", error);
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
	 @Purpose Service for listing records
	 @Parameter
	 {
			data:{
					bodyData:{},
					model:{}
			}
	 }
	 @Return JSON String
	 ********************************************************/
  static listing(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let bodyData = data.bodyData;
          let model = data.bodyData.model;
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          /********************************************************
				Check page and pagesize
				********************************************************/
          if (bodyData.page && bodyData.pagesize) {
            let skip = (bodyData.page - 1) * bodyData.pagesize;
            let sort = bodyData.sort ? bodyData.sort : { createdAt: -1 };
            /********************************************************
					Construct filter query
					********************************************************/
            let filter = await new CommonService().constructFilter({
              filter: bodyData.filter,
              searchText: bodyData.searchText,
              search: data.bodyData.search ? data.bodyData.search : false,
              schema: data.schema,
              staticFilter: data.staticFilter,
            });
            let listing;
            /********************************************************
					list and count data according to filter query
					********************************************************/
            listing = await model
              .find(filter)
              .populate("createdBy", "firstname lastname")
              .populate("modifiedBy", "firstname lastname")
              .sort(sort)
              .skip(skip)
              .limit(bodyData.pagesize)
              .select(selectObj);
            const total = await model.find(filter).countDocuments();
            let columnKey = data.bodyData.columnKey;
            if (columnKey) {
              let columnSettings = await ColumnSettings.findOne({
                key: columnKey,
              }).select({ _id: 0, "columns._id": 0 });
              columnSettings =
                columnSettings &&
                columnSettings.columns &&
                Array.isArray(columnSettings.columns)
                  ? columnSettings.columns
                  : [];
              return resolve({
                status: 1,
                data: { listing, columnSettings },
                page: bodyData.page,
                perPage: bodyData.pagesize,
                total: total,
              });
            } else {
              return resolve({
                status: 1,
                data: { listing },
                page: bodyData.page,
                perPage: bodyData.pagesize,
                total: total,
              });
            }
          } else {
            return resolve({
              status: 0,
              message: "Page and pagesize required.",
            });
          }
        } catch (error) {
          return reject(error);
        }
      })();
    });
  }

  /********************************************************
		 @Purpose Service for searching records
		 @Parameter
		 {
				data:{
						bodyData:{},
						model:{}
				}
		 }
		 @Return JSON String
		 ********************************************************/
  static search(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          let model = data.bodyData.model;
          let bodyData = data.bodyData;
          let filter = bodyData.filter;
          let sort = bodyData.sort ? bodyData.sort : { createdAt: -1 };
          let skip = (bodyData.page - 1) * bodyData.pagesize;
          let searchfilter;
          let totalCountFilter;
          /********************************************************
					Check data filter
				********************************************************/
          if (filter) {
            let ar = [];
            /********************************************************
					Generate Query Object from given filters
					********************************************************/
            for (let index in filter) {
              let Obj;
              Obj = {
                [filter[index]]: new RegExp(data.bodyData.searchText, "i"),
              };
              if (
                bodyData.schema &&
                !_.isEmpty(bodyData.schema) &&
                bodyData.schema.path(key) &&
                bodyData.schema.path(key).instance == "Embedded"
              ) {
                // For searching Role
                Obj = {
                  [filter[index]]: new RegExp(data.bodyData.searchText, "i"),
                };
              }
              ar.push(Obj);
            }
            /********************************************************
					Generate search filters
					********************************************************/
            searchfilter = [
              {
                $match: {
                  $or: ar,
                  isDeleted: false,
                },
              },
              {
                $lookup: {
                  from: "admins",
                  localField: "createdBy",
                  foreignField: "_id",
                  as: "adminCreatedBy",
                },
              },
              {
                $unwind: {
                  path: "$adminCreatedBy",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "admins",
                  localField: "modifiedBy",
                  foreignField: "_id",
                  as: "adminModifiedBy",
                },
              },
              {
                $unwind: {
                  path: "$adminModifiedBy",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: selectObj,
              },
              { $sort: sort },
              {
                $limit: bodyData.pagesize,
              },
              {
                $skip: skip,
              },
            ];
            totalCountFilter = [
              {
                $match: {
                  $or: ar,
                  isDeleted: false,
                },
              },
              {
                $count: "count",
              },
            ];
          }
          /********************************************************
					Aggregate data for Search filters
				********************************************************/
          const listing = await model.aggregate(searchfilter);
          const totalCount = await model.aggregate(totalCountFilter);

          return resolve({
            status: 1,
            data: { listing },
            page: bodyData.page,
            perPage: bodyData.pagesize,
            total: totalCount.length > 0 ? totalCount[0].count : 0,
          });
        } catch (error) {
          return reject(error);
        }
      })();
    });
  }

  /********************************************************
	@Purpose Service for listing Multilingual records
	@Parameter
	{
		data:{
				bodyData:{},
				model:{}
		}
	}
	@Return JSON String
	********************************************************/
  static listingMultilingual(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let bodyData = data.bodyData;
          let model = data.bodyData.model;
          let lang = data.bodyData.lang;
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          const languageEN = await Languages.findOne({
            isPrimary: true,
          }).exec();
          const language = await Languages.findOne({ _id: lang }).exec();
          data.staticFilter =
            bodyData.filter && bodyData.filter.length === 0
              ? {}
              : { languageId: languageEN._id };
          /********************************************************
				Check page and pagesize
				********************************************************/
          if (bodyData.page && bodyData.pagesize) {
            let skip = (bodyData.page - 1) * bodyData.pagesize;
            let sort = bodyData.sort ? bodyData.sort : { createdAt: -1 };
            let filter = await new CommonService().constructCustomFilter({
              filter: bodyData.filter,
              condition: bodyData.condition ? bodyData.condition : "$and",
              staticFilter: data.staticFilter,
            });

            let listing;
            /********************************************************
					list and count data according to filter query
					********************************************************/
            listing = await model
              .find(filter)
              .sort(sort)
              .populate("createdBy", "firstname lastname")
              .populate("modifiedBy", "firstname lastname")
              .skip(skip)
              .limit(bodyData.pagesize)
              .select(selectObj);
            let total = await model.find(filter);
            total = total.length;
            let columnKey = data.bodyData.columnKey;
            if (columnKey) {
              let columnSettings = await ColumnSettings.findOne({
                key: columnKey,
              }).select({ _id: 0, "columns._id": 0 });
              columnSettings =
                columnSettings &&
                columnSettings.columns &&
                Array.isArray(columnSettings.columns)
                  ? columnSettings.columns
                  : [];
              return resolve({
                status: 1,
                data: { listing, columnSettings },
                page: bodyData.page,
                perPage: bodyData.pagesize,
                total: total,
              });
            } else {
              if (language.isPrimary === true) {
                return resolve({
                  status: 1,
                  data: { listing },
                  page: bodyData.page,
                  perPage: bodyData.pagesize,
                  total: total,
                });
              } else {
                let newListing = [];
                await this.asyncForEach(listing, async (data) => {
                  const emailTemplate = await model
                    .findOne({
                      languageId: language._id,
                      isDeleted: false,
                      emailKey: data.emailKey,
                    })
                    .populate("createdBy", "firstname lastname")
                    .populate("modifiedBy", "firstname lastname")
                    .select(selectObj)
                    .exec();
                  if (emailTemplate) {
                    newListing.push(emailTemplate);
                  } else {
                    newListing.push(data);
                  }
                });

                return resolve({
                  status: 1,
                  data: { listing: _.uniqBy(newListing, "emailKey") },
                  page: bodyData.page,
                  perPage: bodyData.pagesize,
                  total: total,
                });
              }
            }
          } else {
            return resolve({
              status: 0,
              message: "Page and pagesize required.",
            });
          }
        } catch (error) {
          return reject(error);
        }
      })();
    });
  }

  /********************************************************
		 @Purpose Service for searching Multilingual records
		 @Parameter
		 {
				data:{
						bodyData:{},
						model:{}
				}
		 }
		 @Return JSON String
		 ********************************************************/
  static searchMultilingual(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          let model = data.bodyData.model;
          let bodyData = data.bodyData;
          let filter = bodyData.filter;
          let sort = bodyData.sort ? bodyData.sort : { createdAt: -1 };
          let skip = (bodyData.page - 1) * bodyData.pagesize;
          let searchfilter;
          let totalCountFilter;
          /********************************************************
					Check data filter
				********************************************************/
          if (filter) {
            let ar = [];
            /********************************************************
					Generate Query Object from given filters
					********************************************************/
            for (let index in filter) {
              let Obj;
              Obj = {
                [filter[index]]: new RegExp(data.bodyData.searchText, "i"),
              };
              if (
                bodyData.schema &&
                !_.isEmpty(bodyData.schema) &&
                bodyData.schema.path(key) &&
                bodyData.schema.path(key).instance == "Embedded"
              ) {
                // For searching Role
                Obj = {
                  [filter[index]]: new RegExp(data.bodyData.searchText, "i"),
                };
              }
              ar.push(Obj);
            }
            /********************************************************
					Generate search filters
					********************************************************/
            console.log(ar);
            searchfilter = [
              {
                $match: {
                  $or: ar,
                  isDeleted: false,
                },
              },
              {
                $lookup: {
                  from: "admins",
                  localField: "createdBy",
                  foreignField: "_id",
                  as: "adminCreatedBy",
                },
              },
              {
                $unwind: {
                  path: "$adminCreatedBy",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "admins",
                  localField: "modifiedBy",
                  foreignField: "_id",
                  as: "adminModifiedBy",
                },
              },
              {
                $unwind: {
                  path: "$adminModifiedBy",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: selectObj,
              },
              { $sort: sort },
              {
                $skip: skip,
              },
              {
                $limit: bodyData.pagesize,
              },
            ];
            totalCountFilter = [
              {
                $match: {
                  $or: ar,
                  isDeleted: false,
                },
              },
            ];
          }
          /********************************************************
					Aggregate data for Search filters
				********************************************************/
          const listing = await model.aggregate(searchfilter);
          const totalCount = await model.aggregate(totalCountFilter);

          return resolve({
            status: 1,
            data: { listing: _.uniqBy(listing, "emailKey") },
            page: bodyData.page,
            perPage: bodyData.pagesize,
            total:
              totalCount.length > 0
                ? _.uniqBy(totalCount, "emailKey").length
                : 0,
          });
        } catch (error) {
          return reject(error);
        }
      })();
    });
  }

  static async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}

module.exports = EmailTemplateController;
