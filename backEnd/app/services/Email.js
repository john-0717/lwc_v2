/*************************************************************************************
    EMAIL HANDLING OPERATIONS
**************************************************************************************/
const _ = require("lodash");
const mustache = require("mustache");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const config = require("../../configs/configs");
const { EmailTemplate } = require("../modules/EmailTemplate/Schema");
const { Languages } = require("../modules/MasterLanguageManagement/Schema");
const {
  socialMediaSDKSchema,
  smtpSettingsSchema,
  siteSettingSchema,
} = require("../modules/Settings/Schema");
const { EnvironmentCredentials } = require("aws-sdk");
const ObjectId = require("mongoose").Types.ObjectId;

const smtpObj = {
  pool: true,
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use TLS,
  auth: {
    user: config.smtpAuthEmail,
    pass: config.smtpAuthPassword,
  },
  debug: true,
  tls: {
    rejectUnauthorized: false,
    ciphers: "SSLv3",
  },
};

class Email {
  async getSettings() {
    let smtpSettings = await smtpSettingsSchema.findOne();
    return smtpSettings;
  }
  constructor() {
    this.configuration = {};
    this.smtpData = {};
    this.getSettings().then((data) => {
      let smtpSettings = data;
      this.smtpData = data;
      this.configuration = {
        smtpAccounts: nodemailer.createTransport({
          port: smtpSettings?.smtpAccounts?.port,
          host: smtpSettings?.smtpAccounts?.host,
          auth: {
            user: smtpSettings?.smtpAccounts?.userName,
            pass: smtpSettings?.smtpAccounts?.password,
          },
          secureConnection: false,
          debug: true,
          pool: true,
        }),
        smtpFeedbacks: nodemailer.createTransport({
          port: smtpSettings?.smtpFeedbacks?.port,
          host: smtpSettings?.smtpFeedbacks?.host,
          auth: {
            user: smtpSettings?.smtpFeedbacks?.userName,
            pass: smtpSettings?.smtpFeedbacks?.password,
          },
          secureConnection: false,
          debug: true,
          pool: true,
        }),
        smtpSettings: nodemailer.createTransport({
          port: smtpSettings?.smtpSettings?.port,
          host: smtpSettings?.smtpSettings?.host,
          auth: {
            user: smtpSettings?.smtpSettings?.userName,
            pass: smtpSettings?.smtpSettings?.password,
          },
          secureConnection: false,
          debug: true,
          pool: true,
        }),
        smtpSupport: nodemailer.createTransport({
          port: smtpSettings?.smtpSupport?.port,
          host: smtpSettings?.smtpSupport?.host,
          auth: {
            user: smtpSettings?.smtpSupport?.userName,
            pass: smtpSettings?.smtpSupport?.password,
          },
          secureConnection: false,
          debug: true,
          pool: true,
        }),
      };
    });
  }

  /********************************************************
        @Purpose send mail
    ********************************************************/
  send(mailOption, emailKey = "smtpSettings") {
    return new Promise((resolve, reject) => {
      (async () => {
        let smtpTransport = this.configuration[emailKey];
        console.log(this.smtpData[emailKey]?.userName);
        mailOption.from =
          this.smtpData[emailKey]?.userName || "noreply@jobcheck.online";
        smtpTransport.sendMail(mailOption, (err, result) => {
          if (err) {
            console.log("er =", err);
            reject({ status: 0, message: err });
          }
          return resolve({ status: 1, message: result });
        });
      })();
    });
  }

  sendSubscriptionReqToAdmin({ emailId, emailKey, replaceDataObj }) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          //  Get the Email Template
          const languageId = await Languages.findOne({
            isPrimary: true,
          }).exec();
          const emailTemplate = await EmailTemplate.findOne({
            emailKey,
            languageId: languageId._id,
          }).exec();
          if (_.isEmpty(emailTemplate))
            return resolve({
              status: 0,
              error: "No Email Template Found",
            });
          const { subject: emailSubject, emailContent } = emailTemplate;
          const content = mustache.render(emailContent, replaceDataObj);
          const subject = mustache.render(emailSubject, replaceDataObj);
          let invoiceHTMLFilePath = path.join(
            appRoot,
            "/public/html/adminEmailTemplate.html"
          );
          let dynamicHTML;
          fs.readFile(invoiceHTMLFilePath, "utf-8", async (err, html) => {
            if (err) {
              return _this.res.send({
                status: 0,
                message: i18n.__("NOT_FOUND"),
                data: err,
              });
            }
            let socialMediaLinks = await socialMediaSDKSchema
              .findOne({}, { socialMediaLink: 1 })
              .exec();
            let replaceEmailDataObj = {
              content: content,
              title: emailTemplate.emailTitle,
            };

            dynamicHTML = mustache.render(html, replaceEmailDataObj);
            const mailOptions = {
              from: `no reply <no-reply@test.com>`,
              to: emailId,
              subject,
              html: dynamicHTML,
            };
            // Send the email
            const sendEmail = await this.send(mailOptions, emailKey);
            if (!sendEmail?.status)
              return resolve({ status: 0, error: sendEmail.error });
            return resolve(sendEmail);
          });
        } catch (error) {
          console.error("error In ====>>>> sendEmailToAdmin <<<<====", error);
          return reject({ status: 0, error });
        }
      })();
    });
  }

  async sendNotification({ emailId, emailKey, replaceDataObj }) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          //  Get the Email Template
          const languageId = await Languages.findOne({
            isPrimary: true,
          }).exec();
          //create email template requirements
          //get site settings
          let siteSettings = await siteSettingSchema.findOne({
            languageId: ObjectId(languageId._id),
          });
          //get smtp data
          let { smtpSupport } = await smtpSettingsSchema.findOne();
          //get socialMedia
          let socialMedia = await socialMediaSDKSchema.find();
          let obj = {
            fbUrl: socialMedia[0]?.socialMediaLink.fbUrl
              ? socialMedia[0]?.socialMediaLink.fbUrl
              : "https://www.facebook.com/",
            twitterUrl: socialMedia[0]?.socialMediaLink.twitterUrl
              ? socialMedia[0]?.socialMediaLink.twitterUrl
              : "https://twitter.com",
            linkedinUrl: socialMedia[0]?.socialMediaLink.linkedinUrl
              ? socialMedia[0]?.socialMediaLink.linkedinUrl
              : "https://www.linkedin.com/",
            instagramUrl: socialMedia[0]?.socialMediaLink.instagramUrl
              ? socialMedia[0]?.socialMediaLink.instagramUrl
              : "https://www.instagram.com/",
            youtubeUrl: socialMedia[0]?.socialMediaLink.youtubeUrl
              ? socialMedia[0]?.socialMediaLink.youtubeUrl
              : "https://youtube.com/",
            email: siteSettings?.siteEmail,
            address: siteSettings?.siteAddress,
            phone: siteSettings?.sitePhoneNo,
            siteName: siteSettings?.siteName,
            siteLogo: config.s3Endpoint + siteSettings?.siteLogoSmall,
            siteUrl: config.frontUrl,
            supportEmail: smtpSupport
              ? smtpSupport?.userName
              : "support@jobcheck.online",
            youtubeImg: `${config.apiUrl}/public/icon/youtube.png`,
            instagramImg: `${config.apiUrl}/public/icon/instagram.png`,
            facebookImg: `${config.apiUrl}/public/icon/facebook.png`,
            twitterImg: `${config.apiUrl}/public/icon/twitter.png`,
            linkedinImg: `${config.apiUrl}/public/icon/linkdin.png`,
            cancelledImg: `${config.apiUrl}/public/icon/cancelled.png`,
            expiredImg: `${config.apiUrl}/public/icon/expired.png`,
            userImg: `${config.apiUrl}/public/icon/user.png`,
            subscribeImg: `${config.apiUrl}/public/icon/subscribe.png`,
            trailImg: `${config.apiUrl}/public/icon/trail.png`,
          };
          replaceDataObj = { ...replaceDataObj, ...obj };
          const emailTemplate = await EmailTemplate.findOne({
            emailKey,
            languageId: languageId._id,
          }).exec();
          if (_.isEmpty(emailTemplate))
            return resolve({
              status: 0,
              error: "No Email Template Found",
            });
          const { subject: emailSubject, emailContent } = emailTemplate;
          const content = mustache.render(emailContent, replaceDataObj);
          const subject = mustache.render(emailSubject, replaceDataObj);
          const mailOptions = {
            from: `no reply <no-reply@test.com>`,
            to: emailId,
            subject,
            html: content,
          };
          console.log(emailTemplate.emailType);
          // Send the email
          const sendEmail = await this.send(
            mailOptions,
            emailTemplate.emailType ? emailTemplate.emailType : "smtpSettings"
          );
          if (!sendEmail.status)
            return resolve({ status: 0, error: sendEmail.error });
          return resolve(sendEmail);
        } catch (error) {
          console.error(
            "error In ====>>>> sendEmailNotification<<<<====",
            error
          );
          return reject({ status: 0, error });
        }
      })();
    });
  }

  async sendNewsLetter({ emailId, replaceDataObj }) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          //  Get the Email Template
          const languageId = await Languages.findOne({
            isPrimary: true,
          }).exec();
          //create email template requirements
          //get site settings
          let siteSettings = await siteSettingSchema.findOne({
            languageId: ObjectId(languageId._id),
          });

          //get socialMedia
          let socialMedia = await socialMediaSDKSchema.find();
          let obj = {
            fbUrl: socialMedia[0]?.socialMediaLink.fbUrl,
            twitterUrl: socialMedia[0]?.socialMediaLink.twitterUrl,
            linkedinUrl: socialMedia[0]?.socialMediaLink.linkedinUrl,
            instagramUrl: socialMedia[0]?.socialMediaLink.instagramUrl,
            youtubeUrl: socialMedia[0]?.socialMediaLink.youtubeUrl,
            email: siteSettings?.siteEmail,
            address: siteSettings?.siteAddress,
            phone: siteSettings?.sitePhoneNo,
            siteName: siteSettings?.siteName,
            siteLogo: config.s3Endpoint + siteSettings?.siteLogoSmall,
            siteUrl: config.frontUrl,
            supportEmail:
              this.smtpData["smtpSupport"]?.auth?.user ||
              "support@jobcheck.online",
            youtubeImg: `${config.apiUrl}/public/icon/youtube.png`,
            instagramImg: `${config.apiUrl}/public/icon/instagram.png`,
            facebookImg: `${config.apiUrl}/public/icon/facebook.png`,
            twitterImg: `${config.apiUrl}/public/icon/twitter.png`,
            linkedinImg: `${config.apiUrl}/public/icon/linkdin.png`,
          };
          replaceDataObj = { ...replaceDataObj, ...obj };
          let htmlPath = path.join(appRoot, `/public/html/newsLetter.html`);
          // Read HTML Template
          let html = fs.readFileSync(htmlPath, "utf8");
          const content = mustache.render(html, replaceDataObj);
          const mailOptions = {
            from: `no reply <no-reply@test.com>`,
            to: emailId,
            subject: replaceDataObj.campaignSubject,
            html: content,
          };
          // Send the email
          const sendEmail = await this.send(mailOptions);
          if (!sendEmail.status)
            return resolve({ status: 0, error: sendEmail.error });
          return resolve(sendEmail);
        } catch (error) {
          console.error(
            "error In ====>>>> sendEmailNotification<<<<====",
            error
          );
          return reject({ status: 0, error });
        }
      })();
    });
  }
}

module.exports = Email;
