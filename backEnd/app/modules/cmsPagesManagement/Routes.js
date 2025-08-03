module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const CMSPagesController = require("./Controller");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const config = require("../../../configs/configs");
  const permission = require("../../services/permissions");

  /********************************************************
    CMS Page Add
    ********************************************************/
  router.post(
    "/cms/add",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.CMS.PERMISSIONS_KEY.CREATE]),
    Validators.cmsPageAddValidator(),
    Middleware.validateBody,
    (req, res) => {
      const cmsPageObj = new CMSPagesController().boot(req, res);
      return cmsPageObj.addPage();
    }
  );

  /********************************************************
    CMS Page Edit
    ********************************************************/
  router.post(
    "/cms/edit",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.CMS.PERMISSIONS_KEY.EDIT]),
    Validators.cmsPageEditValidator(),
    Middleware.validateBody,
    (req, res) => {
      const cmsPageObj = new CMSPagesController().boot(req, res);
      return cmsPageObj.editPage();
    }
  );

  /********************************************************
    cmsPage Listing
    ********************************************************/
  router.get(
    "/cms/listing",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.CMS.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const cmsPageObj = new CMSPagesController().boot(req, res);
      return cmsPageObj.cmsPagesListing();
    }
  );

  /********************************************************
    cms Page Delete 
    ********************************************************/
  router.delete(
    "/cms/delete",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.CMS.PERMISSIONS_KEY.DELETE]),
    Validators.cmsPageDeleteValidator(),
    Middleware.validateBody,
    (req, res) => {
      const cmsPageObj = new CMSPagesController().boot(req, res);
      return cmsPageObj.deleteCMSPage();
    }
  );

  /********************************************************
    cmsPage change Status
    ********************************************************/
  router.patch(
    "/cms/status-update",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.CMS.PERMISSIONS_KEY.CHANGE_STATUS]),
    Validators.cmsPageChangeStatusValidator(),
    Middleware.validateBody,
    (req, res) => {
      const cmsPageObj = new CMSPagesController().boot(req, res);
      return cmsPageObj.changeCMSPagesStatus();
    }
  );

  /********************************************************
    Get StaticPage details
    ********************************************************/
  router.get(
    "/cms/details",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.CMS.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const cmsPageObj = new CMSPagesController().boot(req, res);
      return cmsPageObj.cmsPageDetails();
    }
  );

  app.use(config.baseApiUrl, router);
};
