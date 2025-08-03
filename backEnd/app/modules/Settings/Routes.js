const Middleware = require("../../services/middleware");
const Validators = require("./Validator");

module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const SettingsController = require("./Controller");
  const config = require("../../../configs/configs");
  const permission = require("../../services/permissions");
  /********************************************************
    Add/edit General settings site settings data (no create is there)
  ********************************************************/
  router.post(
    "/settings/general/site-settings",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.GENERAL_SETTINGS.PERMISSIONS_KEY.EDIT,
    ]),
    (req, res) => {
      const siteSettings = new SettingsController().boot(req, res);
      return siteSettings.addSiteSetting();
    }
  );

  /********************************************************
    Add/Edit general settings metadata ( no create is there)
  ********************************************************/
  router.post(
    "/settings/general/meta-data",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.GENERAL_SETTINGS.PERMISSIONS_KEY.EDIT,
    ]),
    (req, res) => {
      const metaInfoObj = new SettingsController().boot(req, res);
      return metaInfoObj.addMetaDataSettings();
    }
  );

  /********************************************************
    Add/Edit general settings analytical data (no create is there)
  ********************************************************/
  router.post(
    "/settings/general/analytical-data",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.GENERAL_SETTINGS.PERMISSIONS_KEY.EDIT,
    ]),
    (req, res) => {
      const analiticDataSettings = new SettingsController().boot(req, res);
      return analiticDataSettings.addAnalyticalData();
    }
  );

  /********************************************************
    Add/Edit general settings site under maintenance data (no create is there)
  ********************************************************/
  router.post(
    "/settings/general/site-un-maintenance",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.GENERAL_SETTINGS.PERMISSIONS_KEY.EDIT,
    ]),
    (req, res) => {
      const siteUnMaintainance = new SettingsController().boot(req, res);
      return siteUnMaintainance.addSiteUnMaintainance();
    }
  );

  /********************************************************
    Get general settings site settings data
  ********************************************************/
  router.get(
    "/settings/general/site-settings",
    Globals.setLanguage(),
    (req, res) => {
      const siteSettings = new SettingsController().boot(req, res);
      return siteSettings.getSiteSetting();
    }
  );

  /********************************************************
    Get General settings metadata
  ********************************************************/
  router.get(
    "/settings/general/meta-data",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.GENERAL_SETTINGS.PERMISSIONS_KEY.VIEW,
    ]),
    (req, res) => {
      const metaInfoObj = new SettingsController().boot(req, res);
      return metaInfoObj.getMetaSettings();
    }
  );
  /********************************************************
    Get General settings metadata
  ********************************************************/
  router.get("/user/general/meta-data", Globals.setLanguage(), (req, res) => {
    const metaInfoObj = new SettingsController().boot(req, res);
    return metaInfoObj.getMetaSettings();
  });
  /********************************************************
    Get General settings analytical data
  ********************************************************/
  router.get(
    "/settings/general/analytical-data",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.GENERAL_SETTINGS.PERMISSIONS_KEY.VIEW,
    ]),
    (req, res) => {
      const analiticDataSettings = new SettingsController().boot(req, res);
      return analiticDataSettings.getAnalyticalData();
    }
  );

  /********************************************************
    Get general settings analitical data
  ********************************************************/
  router.get(
    "/settings/general/site-un-maintenance",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.GENERAL_SETTINGS.PERMISSIONS_KEY.VIEW,
    ]),
    (req, res) => {
      const siteUnMaintainance = new SettingsController().boot(req, res);
      return siteUnMaintainance.getSiteUnMaintainance();
    }
  );

  /********************************************************
    Add/Edit date and time settings ( no create is there)
  ********************************************************/
  router.post(
    "/settings/general/date-time",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.GENERAL_SETTINGS.PERMISSIONS_KEY.EDIT,
    ]),
    (req, res) => {
      const dateTImeSettings = new SettingsController().boot(req, res);
      return dateTImeSettings.addUpdateDateTimeSettings();
    }
  );

  /********************************************************
    Get general datetime settings
  ********************************************************/
  router.get(
    "/settings/general/date-time",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.GENERAL_SETTINGS.PERMISSIONS_KEY.VIEW,
    ]),
    (req, res) => {
      const dateTImeSettings = new SettingsController().boot(req, res);
      return dateTImeSettings.getDateTimeSettings();
    }
  );

  /********************************************************
    Change general settings 2FA
  ********************************************************/
  router.patch(
    "/settings/general/change-2fa-status",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.GENERAL_SETTINGS.PERMISSIONS_KEY.EDIT,
    ]),
    (req, res) => {
      const dateTImeSettings = new SettingsController().boot(req, res);
      return dateTImeSettings.change2FAStatus();
    }
  );

  /********************************************************
    Post social Media SDK settings data ( cannot add permission here)
  ********************************************************/
  router.post(
    "/settings/social-media/social-media-sdk",
    Globals.setLanguage(),
    Globals.isAdminAuthorized(),
    (req, res) => {
      const socialmediaSDK = new SettingsController().boot(req, res);
      return socialmediaSDK.addUpdateSocialMediaSDK();
    }
  );

  /********************************************************
    Get social Media SDK settings data
  ********************************************************/
  router.get(
    "/settings/social-media/social-media-sdk",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.SOCIAL_MEDIA_SETTINGS.PERMISSIONS_KEY.VIEW,
    ]),
    (req, res) => {
      const socialmediaSDK = new SettingsController().boot(req, res);
      return socialmediaSDK.getSocialMediaSDK();
    }
  );

  /********************************************************
    Post Payment Gateway settings data ( no create is there)
  ********************************************************/
  router.post(
    "/settings/payment-gateway",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.PAYMENT_GATEWAY_SETTINGS.PERMISSIONS_KEY.EDIT,
    ]),
    Validators.addEditPaymentSettings(),
    Middleware.validateBody,
    (req, res) => {
      const paymentGateway = new SettingsController().boot(req, res);
      return paymentGateway.addPaymentGateway();
    }
  );

  /********************************************************
    Get Payment Gateway settings data
  ********************************************************/
  router.get(
    "/settings/payment-gateway",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.PAYMENT_GATEWAY_SETTINGS.PERMISSIONS_KEY.VIEW,
    ]),
    (req, res) => {
      const paymentGateway = new SettingsController().boot(req, res);
      return paymentGateway.getPaymentGateway();
    }
  );

  /********************************************************
    Add/Edit social Media link  data ( no create is here)
  ********************************************************/
  router.post(
    "/settings/social-media/social-media-link",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.SOCIAL_MEDIA_SETTINGS.PERMISSIONS_KEY.EDIT,
    ]),
    (req, res) => {
      const socialmediaLink = new SettingsController().boot(req, res);
      return socialmediaLink.addUpdatesocialMediaLink();
    }
  );

  /********************************************************
   Get social Media link  data
 ********************************************************/
  router.get(
    "/settings/social-media/social-media-link",
    Globals.setLanguage(),
    (req, res) => {
      const socialmediaLink = new SettingsController().boot(req, res);
      return socialmediaLink.getSocialMediaLink();
    }
  );

  /********************************************************
     Add/Edit social media twitter Stataus change
   ********************************************************/
  router.patch(
    "/settings/social-media/sdk",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.SOCIAL_MEDIA_SETTINGS.PERMISSIONS_KEY.CHANGE_STATUS,
    ]),
    (req, res) => {
      const socialmediaLink = new SettingsController().boot(req, res);
      return socialmediaLink.changeSocialSDKStatus();
    }
  );

  /********************************************************
    Add/Edit smtp details ( no create is here)
  ********************************************************/
  router.post(
    "/settings/smtp",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.SMTP_SETTINGS.PERMISSIONS_KEY.EDIT]),
    Validators.smtpAddEdit(),
    Middleware.validateBody,
    (req, res) => {
      const smtpSettings = new SettingsController().boot(req, res);
      return smtpSettings.addsmtpSettings();
    }
  );

  /********************************************************
   Get smtp settings details
 ********************************************************/
  router.get(
    "/settings/smtp",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.SMTP_SETTINGS.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const smtpSettings = new SettingsController().boot(req, res);
      return smtpSettings.getsmtpSettings();
    }
  );

  /********************************************************
    Add/Edit sms settings details
  ********************************************************/
  router.post(
    "/settings/sms",
    Globals.setLanguage(),
    Globals.isAdminAuthorized(),
    (req, res) => {
      const smtpSettings = new SettingsController().boot(req, res);
      return smtpSettings.addSMSdetails();
    }
  );

  /********************************************************
   Get sms settings details
   ********************************************************/
  router.get(
    "/settings/sms",
    Globals.setLanguage(),
    Globals.isAdminAuthorized(),
    (req, res) => {
      const smtpSettings = new SettingsController().boot(req, res);
      return smtpSettings.getSMSsettings();
    }
  );

  /********************************************************
    change status for email settings notifications
  ********************************************************/
  router.patch(
    "/settings/email-settings/notifications",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.EMAIL_SETTINGS.PERMISSIONS_KEY.CHANGE_STATUS,
    ]),
    (req, res) => {
      const emailSettings = new SettingsController().boot(req, res);
      return emailSettings.emailSettingStatusChange();
    }
  );

  /********************************************************
    Get email settings notifications status
  ********************************************************/
  router.get(
    "/settings/email-settings/notifications",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.EMAIL_SETTINGS.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const emailSettings = new SettingsController().boot(req, res);
      return emailSettings.getEmailSettingsNotification();
    }
  );
  /********************************************************
  add bank account for admin and need to maintain account_id in env
  ********************************************************/
  router.post(
    "/admin/add-bank-details",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.PAYMENT_GATEWAY_SETTINGS.PERMISSIONS_KEY.EDIT,
    ]),
    Validators.accountValidator(),
    Middleware.validateBody,
    (req, res) => {
      const adminObj = new SettingsController().boot(req, res);
      return adminObj.addBankAccount();
    }
  );
  /********************************************************
  list bank accounts and 
  ********************************************************/
  router.get(
    "/admin/bank-details-listing",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.PAYMENT_GATEWAY_SETTINGS.PERMISSIONS_KEY.VIEW,
    ]),
    (req, res) => {
      const adminObj = new SettingsController().boot(req, res);
      return adminObj.bankAccountListing();
    }
  );
  app.use(config.baseApiUrl, router);
};
