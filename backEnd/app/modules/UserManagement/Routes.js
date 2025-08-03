module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const UserController = require("./Controller");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const config = require("../../../configs/configs");

  /********************************************************
    User Management Add/Edit
  ********************************************************/
  router.post("/user-management", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.userAddEditValidator(), Middleware.validateBody, (req, res) => {
    const userObj = new UserController().boot(req, res);
    return userObj.addUpdateUser();
  });

  /********************************************************
    User Listing
  ********************************************************/
  router.post("/user-management/listing", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.UserListingValidator(), Middleware.validateBody, (req, res) => {
    const userObj = new UserController().boot(req, res);
    return userObj.userListing();
  });

  /********************************************************
    Delete User
  ********************************************************/
  router.delete("/user-management", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.userDeleteValidator(), Middleware.validateBody, (req, res) => {
    const userObj = new UserController().boot(req, res);
    return userObj.deleteUsers();
  });

  /********************************************************
    User change Status
  ********************************************************/
  router.patch("/user-management", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.userChangeStatusValidator(), Middleware.validateBody, (req, res) => {
    const userObj = new UserController().boot(req, res);
    return userObj.changeStatusUser();
  });

  /********************************************************
    User Get details
  ********************************************************/
  router.get("/user-management", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const userObj = new UserController().boot(req, res);
    return userObj.getUserDetails();
  });

  /********************************************************
    User Download details
  ********************************************************/
  router.get("/user-management/download/:type", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const userObj = new UserController().boot(req, res);
    return userObj.downloadUserDetails();
  });

  app.use(config.baseApiUrl, router);
};
