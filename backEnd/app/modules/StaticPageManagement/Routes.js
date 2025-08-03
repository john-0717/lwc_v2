module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const StaticPageController = require("./Controller");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const config = require("../../../configs/configs");

  /********************************************************
  StaticPage Add/Edit
  ********************************************************/
  router.post("/static-page", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.staticPageAddEditValidator(), Middleware.validateBody, (req, res) => {
    const staticPageObj = new StaticPageController().boot(req, res);
    return staticPageObj.addUpdateStaticPages();
  });

  /********************************************************
  StaticPage Listing
  ********************************************************/
  router.post("/static-page/listing", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.staticPageListingValidator(), Middleware.validateBody, (req, res) => {
    const staticPageObj = new StaticPageController().boot(req, res);
    return staticPageObj.staticPageListing();
  });

  /********************************************************
  StaticPage Delete 
  ********************************************************/
  router.delete("/static-page", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.staticPageDeleteValidator(), Middleware.validateBody, (req, res) => {
    const staticPageObj = new StaticPageController().boot(req, res);
    return staticPageObj.deleteStaticPage();
  });

  /********************************************************
  StaticPage change Status
  ********************************************************/
  router.patch("/static-page", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.staticPageChangeStatusValidator(), Middleware.validateBody, (req, res) => {
    const staticPageObj = new StaticPageController().boot(req, res);
    return staticPageObj.changeStaticPagesStatus();
  });

  /********************************************************
  Get StaticPage details
  ********************************************************/
  router.get("/static-page", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const staticPageObj = new StaticPageController().boot(req, res);
    return staticPageObj.getStaticPagesDetails();
  });

  /********************************************************
  Static Page Download Get details
  ********************************************************/
  router.get("/static-page/download/:type", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const adminObj = new StaticPageController().boot(req, res);
    return adminObj.downloadStaticPageDetails();
  });

  app.use(config.baseApiUrl, router);
};
