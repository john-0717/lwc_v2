module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const CommonController = require("./Controller");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const config = require("../../../configs/configs");

  /********************************************************
  Save Filter
  ********************************************************/
  router.post("/common/filter", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.saveFilterValidator(), Middleware.validateBody, (req, res) => {
    const commonObj = new CommonController().boot(req, res);
    return commonObj.saveFilter();
  });

  /********************************************************
  Get Filter with key
  ********************************************************/
  router.get("/common/filter/:key", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const commonObj = new CommonController().boot(req, res);
    return commonObj.getFilters();
  });

  /********************************************************
  Delete Filter
  ********************************************************/
  router.delete("/common/filter/:filterId", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const commonObj = new CommonController().boot(req, res);
    return commonObj.deleteFilter();
  });

  /********************************************************
   Save Column
  ********************************************************/
  router.post("/common/column", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.saveColumnValidator(), Middleware.validateBody, (req, res) => {
    const commonObj = new CommonController().boot(req, res);
    return commonObj.saveColumn();
  });

  /********************************************************
  Get Column with key
  ********************************************************/
  router.get("/common/column/:key", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const commonObj = new CommonController().boot(req, res);
    return commonObj.getColumn();
  });

  /********************************************************
  Delete Column
  ********************************************************/
  router.delete("/common/column/:columnId", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const commonObj = new CommonController().boot(req, res);
    return commonObj.deleteColumn();
  });



  app.use(config.baseApiUrl, router);
};
