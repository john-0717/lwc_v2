module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const MasterController = require("./Controller");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const config = require("../../../configs/configs");
  const permission = require("../../services/permissions");
  /********************************************************
    Language Preferences Message Add/Edit
  ********************************************************/
  router.post("/settings/language-preferences/messages/add-edit", Globals.setLanguage(), Globals.isAdminAuthorizedWithPermissions([permission.ERROR_MESSAGES_SETTINGS.PERMISSIONS_KEY.CREATE,permission.ERROR_MESSAGES_SETTINGS.PERMISSIONS_KEY.EDIT],'ERROR_MESSAGES_SETTINGS','dataId','editMessage'), Validators.messagesAddEditValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.addUpdateMessages();
  });

  /********************************************************
    Language List messages
  ********************************************************/
  router.post("/settings/language-preferences/messages", Globals.setLanguage(), Globals.isAdminAuthorized([permission.ERROR_MESSAGES_SETTINGS.PERMISSIONS_KEY.VIEW]), Validators.listingValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.getMessagesListing();
  });

  /********************************************************
    Language Preferences Label Add/Edit
  ********************************************************/
  router.post("/settings/language-preferences/label/add-edit", Globals.setLanguage(), Globals.isAdminAuthorizedWithPermissions([permission.STATIC_LABEL_SETTINGS.PERMISSIONS_KEY.CREATE,permission.STATIC_LABEL_SETTINGS.PERMISSIONS_KEY.EDIT],'STATIC_LABEL_SETTINGS','dataId','editLabel'), Validators.labelAddEditValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.addUpdateLabel();
  });

  /********************************************************
    Language List Labels with pagination
  ********************************************************/
  router.post("/settings/language-preferences/label", Globals.setLanguage(), Globals.isAdminAuthorized([permission.STATIC_LABEL_SETTINGS.PERMISSIONS_KEY.VIEW]), Validators.listingValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.getLabelListing();
  });

  /********************************************************
    Language List Labels
  ********************************************************/
  router.get("/labels", Globals.setLanguage(), (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.getLabel();
  });

  app.use(config.baseApiUrl, router);
};
