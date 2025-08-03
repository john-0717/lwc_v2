module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const BlogController = require("./Controller");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const config = require("../../../configs/configs");

  /********************************************************
  Blog Add/Edit
  ********************************************************/
  router.post("/blog", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.blogAddEditValidator(), Middleware.validateBody, (req, res) => {
    const blogObj = new BlogController().boot(req, res);
    return blogObj.addUpdateBlog();
  });

  /********************************************************
  Blog Listing
  ********************************************************/
  router.post("/blog/listing", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.blogListingValidator(), Middleware.validateBody, (req, res) => {
    const blogObj = new BlogController().boot(req, res);
    return blogObj.blogListing();
  });

  /********************************************************
  Blog Delete 
  ********************************************************/
  router.delete("/blog", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.blogDeleteValidator(), Middleware.validateBody, (req, res) => {
    const blogObj = new BlogController().boot(req, res);
    return blogObj.deleteBlog();
  });

  /********************************************************
  Blog change Status
  ********************************************************/
  router.patch("/blog", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.blogChangeStatusValidator(), Middleware.validateBody, (req, res) => {
    const blogObj = new BlogController().boot(req, res);
    return blogObj.changeBlogStatus();
  });

  /********************************************************
  Blog change Status
  ********************************************************/
  router.patch("/blog/publish", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.blogChangeStatusValidator(), Middleware.validateBody, (req, res) => {
    const blogObj = new BlogController().boot(req, res);
    return blogObj.changePublishStatus();
  });

  /********************************************************
  Get Blog details
  ********************************************************/
  router.get("/blog", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const blogObj = new BlogController().boot(req, res);
    return blogObj.getBlogDetails();
  });


  /********************************************************
    Blog Get details
  ********************************************************/
  router.get("/blog/download/:type", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const adminObj = new BlogController().boot(req, res);
    return adminObj.downloadBlogDetails();
  });
  app.use(config.baseApiUrl, router);
};
