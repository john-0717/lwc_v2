module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const BlogCategoriesController = require("./Controller");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const config = require("../../../configs/configs");

  /********************************************************
  Blog Categories Add/Edit
  ********************************************************/
  router.post("/blog-categories", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.blogCategoriesAddEditValidator(), Middleware.validateBody, (req, res) => {
    const blogCategoriesObj = new BlogCategoriesController().boot(req, res);
    return blogCategoriesObj.addUpdateBlogCategories();
  });

  /********************************************************
  Blog Categories Listing
  ********************************************************/
  router.post("/blog-categories/listing", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.blogCategoriesListingValidator(), Middleware.validateBody, (req, res) => {
    const blogCategoriesObj = new BlogCategoriesController().boot(req, res);
    return blogCategoriesObj.blogCategoriesListing();
  });

  /********************************************************
  Blog Categories Delete 
  ********************************************************/
  router.delete("/blog-categories", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.blogCategoriesDeleteValidator(), Middleware.validateBody, (req, res) => {
    const blogCategoriesObj = new BlogCategoriesController().boot(req, res);
    return blogCategoriesObj.deleteBlogCategories();
  });

  /********************************************************
  Blog Categories change Status
  ********************************************************/
  router.patch("/blog-categories", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.blogCategoriesChangeStatusValidator(), Middleware.validateBody, (req, res) => {
    const blogCategoriesObj = new BlogCategoriesController().boot(req, res);
    return blogCategoriesObj.changeBlogCategoriesStatus();
  });

  /********************************************************
  Get Blog Categories details
  ********************************************************/
  router.get("/blog-categories", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const blogCategoriesObj = new BlogCategoriesController().boot(req, res);
    return blogCategoriesObj.getBlogCategoriesDetails();
  });

  /********************************************************
  Get Blog Categories List for add Category dropdown
  ********************************************************/
  router.get("/blog-categories/dropdown", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const blogCategoriesObj = new BlogCategoriesController().boot(req, res);
    return blogCategoriesObj.getBlogCategoriesList();
  });

  /********************************************************
    Admin User Get details
  ********************************************************/
  router.get("/blog-categories/download/:type", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const adminObj = new BlogCategoriesController().boot(req, res);
    return adminObj.downloadBlogCategoryDetails();
  });

  app.use(config.baseApiUrl, router);
};
