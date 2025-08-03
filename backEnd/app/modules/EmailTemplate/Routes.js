module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const EmailTemplateController = require("./Controller");
  const config = require("../../../configs/configs");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const permission = require("../../services/permissions");
  /********************************************************
    Email Template Add
    ********************************************************/
  router.post(
    "/email-template",
    Globals.setLanguage(),
    Globals.isAdminAuthorized(),
    (req, res) => {
      const Obj = new EmailTemplateController().boot(req, res);
      return Obj.addEmailTemplate();
    }
  );

  /********************************************************
    Email Template Edit
    ********************************************************/
  router.put(
    "/email-template/:id",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.GENERAL_EMAIL_TEMPLATES.PERMISSIONS_KEY.EDIT,
    ]),
    (req, res) => {
      const Obj = new EmailTemplateController().boot(req, res);
      return Obj.updateEmailTemplate();
    }
  );

  /********************************************************
    Email Template Listing
    ********************************************************/
  router.post(
    "/email-template/listing",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.GENERAL_EMAIL_TEMPLATES.PERMISSIONS_KEY.VIEW,
    ]),
    (req, res) => {
      const Obj = new EmailTemplateController().boot(req, res);
      return Obj.emailTemplateListing();
    }
  );

  /********************************************************
    Email Template Delete
    ********************************************************/
  router.delete(
    "/email-template",
    Globals.setLanguage(),
    Globals.isAdminAuthorized(),
    (req, res) => {
      const Obj = new EmailTemplateController().boot(req, res);
      return Obj.deleteEmailTemplates();
    }
  );

  /********************************************************
    Email Template Change Status
    ********************************************************/
  router.patch(
    "/email-template/change-status",
    Globals.setLanguage(),
    Globals.isAdminAuthorized(),
    (req, res) => {
      const Obj = new EmailTemplateController().boot(req, res);
      return Obj.changeEmailStatus();
    }
  );

  /********************************************************
    Email Template Details
    ********************************************************/
  router.get(
    "/email-template",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.GENERAL_EMAIL_TEMPLATES.PERMISSIONS_KEY.VIEW,
    ]),
    (req, res) => {
      const Obj = new EmailTemplateController().boot(req, res);
      return Obj.getEmailDetails();
    }
  );

  /********************************************************
    Email News Letter Template Add
    ********************************************************/
  router.post(
    "/campaign-template/add",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.CAMPAIGN_EMAIL_TEMPLATES.PERMISSIONS_KEY.CREATE,
    ]),
    Validators.campaignAddValidator(),
    Middleware.validateBody,
    (req, res) => {
      const Obj = new EmailTemplateController().boot(req, res);
      return Obj.addCampaignTemplate();
    }
  );

  /********************************************************
    Email News Letter Template Edit
    ********************************************************/
  router.post(
    "/campaign-template/edit",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.CAMPAIGN_EMAIL_TEMPLATES.PERMISSIONS_KEY.EDIT,
    ]),
    Validators.campaignEditValidator(),
    Middleware.validateBody,
    (req, res) => {
      const Obj = new EmailTemplateController().boot(req, res);
      return Obj.editCampaignTemplate();
    }
  );

  /********************************************************
    Email News Letter Template delete
    ********************************************************/
  router.delete(
    "/campaign-template/delete",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.CAMPAIGN_EMAIL_TEMPLATES.PERMISSIONS_KEY.DELETE,
    ]),
    Validators.campaignDeleteValidator(),
    Middleware.validateBody,
    (req, res) => {
      const Obj = new EmailTemplateController().boot(req, res);
      return Obj.deleteCampaignTemplate();
    }
  );
  /********************************************************
    Email News Letter Template listing
    ********************************************************/
  router.post(
    "/campaign-template/listing",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.CAMPAIGN_EMAIL_TEMPLATES.PERMISSIONS_KEY.VIEW,
    ]),
    Validators.campaignListValidator(),
    Middleware.validateBody,
    (req, res) => {
      const Obj = new EmailTemplateController().boot(req, res);
      return Obj.listCampaignTemplate();
    }
  );
  /********************************************************
    Email Template Change Status
    ********************************************************/
  router.patch(
    "/campaign-template/change-status",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.CAMPAIGN_EMAIL_TEMPLATES.PERMISSIONS_KEY.CHANGE_STATUS,
    ]),
    (req, res) => {
      const Obj = new EmailTemplateController().boot(req, res);
      return Obj.changeCampaignEmailStatus();
    }
  );
  /********************************************************
    Email News Letter Template details
    ********************************************************/
  router.get(
    "/campaign-template",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.CAMPAIGN_EMAIL_TEMPLATES.PERMISSIONS_KEY.VIEW,
    ]),
    (req, res) => {
      const Obj = new EmailTemplateController().boot(req, res);
      return Obj.detailsCampaignTemplate();
    }
  );
  /********************************************************
    Email News Letter Template details
    ********************************************************/
  router.get(
    "/campaign-template/send",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.CAMPAIGN_EMAIL_TEMPLATES.PERMISSIONS_KEY.SEND,
    ]),
    (req, res) => {
      const Obj = new EmailTemplateController().boot(req, res);
      return Obj.sendCampaignTemplate();
    }
  );
  app.use(config.baseApiUrl, router);
};
