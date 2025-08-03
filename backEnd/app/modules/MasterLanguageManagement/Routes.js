module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const MasterController = require("./Controller");
  const config = require("../../../configs/configs");

  /********************************************************
    Master language Add/Edit
  ********************************************************/
  router.post("/master/language", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.languageAddEditValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.addUpdateLanguage();
  });

  /********************************************************
    Master language Listing
  ********************************************************/
  router.post("/master/language/listing", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.languageListingValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.languageListing();
  });

  /********************************************************
    Master Delete deletelanguages
  ********************************************************/
  router.delete("/master/language", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.languageDeleteValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.deleteLanguages();
  });

  /********************************************************
   Master change language Status
  ********************************************************/
  router.patch("/master/language", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.languageChangeStatusValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.changeLanguageStatus();
  });

  /********************************************************
    Master Get language details
  ********************************************************/
  router.get("/master/language/:languageId", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.getLanguagedetails();
  });

  /********************************************************
    Master Get language List for select options
  ********************************************************/
  router.get("/master/language", Globals.setLanguage(), (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.getLanguageList();
  });

  app.use(config.baseApiUrl, router);
};
