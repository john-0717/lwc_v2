module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const MasterController = require("./Controller");
  const config = require("../../../configs/configs");

  /********************************************************
    Master Timezone Add/Edit
  ********************************************************/
  router.post("/master/timezone", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.timezoneAddEditValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.addUpdateTimezone();
  });

  /********************************************************
    Master Timezone Listing
  ********************************************************/
  router.post("/master/timezone/listing", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.timezoneListing();
  });

  /********************************************************
    Master Delete deleteTimezones
  ********************************************************/
  router.delete("/master/timezone", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.timezoneDeleteValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.deleteTimezones();
  });

  /********************************************************
   Master change Timezone Status
  ********************************************************/
  router.patch("/master/timezone", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.timezoneChangeStatusValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.changeTimezoneStatus();
  });

  /********************************************************
    Master Get Timezone details
  ********************************************************/
  router.get("/master/timezone/:timezoneId", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.getTimezonedetails();
  });

  /********************************************************
    Master Get Timezone List for add timezone
  ********************************************************/
  router.get("/master/timezone", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.getTimezoneList();
  });

  app.use(config.baseApiUrl, router);
};
