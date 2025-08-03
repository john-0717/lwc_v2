module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const FaqController = require("./Controller");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const config = require("../../../configs/configs");
  const permission = require("../../services/permissions");

  /********************************************************
  Faq Add/Edit
  ********************************************************/
  router.post(
    "/faq",
    Globals.setLanguage(),
    Globals.isAdminAuthorizedWithPermissions(
      [
        permission.FAQ.PERMISSIONS_KEY.CREATE,
        permission.FAQ.PERMISSIONS_KEY.EDIT,
      ],
      "FAQ",
      "faqId"
    ),
    Validators.faqAddEditValidator(),
    Middleware.validateBody,
    (req, res) => {
      const FaqObj = new FaqController().boot(req, res);
      return FaqObj.addUpdateFaq();
    }
  );

  /********************************************************
  Faq Listing
  ********************************************************/
  router.post(
    "/faq/listing",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.FAQ.PERMISSIONS_KEY.VIEW]),
    Validators.faqListingValidator(),
    Middleware.validateBody,
    (req, res) => {
      const FaqObj = new FaqController().boot(req, res);
      return FaqObj.FaqListing();
    }
  );

  /********************************************************
  Faq Delete 
  ********************************************************/
  router.delete(
    "/faq",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.FAQ.PERMISSIONS_KEY.DELETE]),
    Validators.faqDeleteValidator(),
    Middleware.validateBody,
    (req, res) => {
      const FaqObj = new FaqController().boot(req, res);
      return FaqObj.deleteFaq();
    }
  );

  /********************************************************
  Faq change Status
  ********************************************************/
  router.patch(
    "/faq",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.FAQ.PERMISSIONS_KEY.CHANGE_STATUS]),
    Validators.faqChangeStatusValidator(),
    Middleware.validateBody,
    (req, res) => {
      const FaqObj = new FaqController().boot(req, res);
      return FaqObj.changeFaqStatus();
    }
  );

  /********************************************************
  Get Faq details
  ********************************************************/
  router.get(
    "/faq",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.FAQ.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const FaqObj = new FaqController().boot(req, res);
      return FaqObj.getFaqDetails();
    }
  );

  app.use(config.baseApiUrl, router);
};
