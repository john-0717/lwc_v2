module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const FaqCategoriesController = require("./Controller");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const config = require("../../../configs/configs");
  const permission = require("../../services/permissions");

  /********************************************************
  Faq Categories Add/Edit
  ********************************************************/
  router.post("/faq-categories", Globals.setLanguage(), Globals.isAdminAuthorizedWithPermissions([permission.FAQ_CATEGORY.PERMISSIONS_KEY.CREATE,permission.FAQ_CATEGORY.PERMISSIONS_KEY.EDIT],'FAQ_CATEGORY','faqCategoryId'), Validators.faqCategoriesAddEditValidator(), Middleware.validateBody, (req, res) => {
    const faqCategoriesObj = new FaqCategoriesController().boot(req, res);
    return faqCategoriesObj.addUpdateFaqCategories();
  });

  /********************************************************
  Faq Categories Listing
  ********************************************************/
  router.post("/faq-categories/listing", 
  Globals.setLanguage(),
   Globals.isAdminAuthorized([permission.FAQ_CATEGORY.PERMISSIONS_KEY.VIEW]), Validators.faqCategoriesListingValidator(), Middleware.validateBody, (req, res) => {
    const faqCategoriesObj = new FaqCategoriesController().boot(req, res);
    return faqCategoriesObj.FaqCategoriesListing();
  });

  /********************************************************
  Faq Categories Delete 
  ********************************************************/
  router.delete("/faq-categories", Globals.setLanguage(), Globals.isAdminAuthorized([permission.FAQ_CATEGORY.PERMISSIONS_KEY.DELETE]), Validators.faqCategoriesDeleteValidator(), Middleware.validateBody, (req, res) => {
    const faqCategoriesObj = new FaqCategoriesController().boot(req, res);
    return faqCategoriesObj.deleteFaqCategories();
  });

  /********************************************************
  Faq Categories change Status
  ********************************************************/
  router.patch("/faq-categories", Globals.setLanguage(), Globals.isAdminAuthorized([permission.FAQ_CATEGORY.PERMISSIONS_KEY.CHANGE_STATUS]), Validators.faqCategoriesChangeStatusValidator(), Middleware.validateBody, (req, res) => {
    const faqCategoriesObj = new FaqCategoriesController().boot(req, res);
    return faqCategoriesObj.changeFaqCategoriesStatus();
  });

  /********************************************************
  Get Faq Categories details
  ********************************************************/
  router.get("/faq-categories", Globals.setLanguage(), Globals.isAdminAuthorized([permission.FAQ_CATEGORY.PERMISSIONS_KEY.VIEW]), (req, res) => {
    const faqCategoriesObj = new FaqCategoriesController().boot(req, res);
    return faqCategoriesObj.getFaqCategoriesDetails();
  });

  /********************************************************
  Get Faq Categories List for add Category dropdown
  ********************************************************/
  router.get("/faq-categories/dropdown", Globals.setLanguage(), Globals.isAdminAuthorized([permission.FAQ_CATEGORY.PERMISSIONS_KEY.VIEW]), (req, res) => {
    const faqCategoriesObj = new FaqCategoriesController().boot(req, res);
    return faqCategoriesObj.getFaqCategoriesList();
  });

  app.use(config.baseApiUrl, router);
};
