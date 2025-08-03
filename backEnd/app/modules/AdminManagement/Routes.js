module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const AdminController = require("./Controller");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const config = require("../../../configs/configs");
  const permission = require("../../services/permissions");

  /********************************************************
    Admin Management Add/Edit
  ********************************************************/
 
  router.post("/admin-management", Globals.setLanguage(), Globals.isAdminAuthorizedWithPermissions([permission.ADMIN_USER.PERMISSIONS_KEY.CREATE,permission.ADMIN_USER.PERMISSIONS_KEY.EDIT],'ADMIN_USER','adminId'), Globals.getTechnology(), Validators.adminAddEditValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.addUpdateAdmin();
  });

  /********************************************************
    Admin User Listing
  ********************************************************/
  router.post("/admin-management/listing", Globals.setLanguage(), Globals.isAdminAuthorized([permission.ADMIN_USER.PERMISSIONS_KEY.VIEW]), Validators.AdminListingValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.adminListing();
  });

  /********************************************************
    Delete Admin User
  ********************************************************/
  router.delete("/admin-management", Globals.setLanguage(), Globals.isAdminAuthorized([permission.ADMIN_USER.PERMISSIONS_KEY.DELETE]), Validators.adminDeleteValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.deleteAdmins();
  });

  /********************************************************
    Admin User change Status
  ********************************************************/
  router.patch("/admin-management", Globals.setLanguage(), Globals.isAdminAuthorized([permission.ADMIN_USER.PERMISSIONS_KEY.CHANGE_STATUS]), Validators.adminChangeStatusValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.changeAdminStatus();
  });

  /********************************************************
    Admin User Get details
  ********************************************************/
  router.get("/admin-management/:adminId", Globals.setLanguage(), Globals.isAdminAuthorized([permission.ADMIN_USER.PERMISSIONS_KEY.VIEW]), (req, res) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.getAdmindetails();
  });

  /********************************************************
    Admin User Get details
  ********************************************************/
  router.get("/admin-management/download/:type", Globals.setLanguage(), Globals.isAdminAuthorized([permission.ADMIN_USER.PERMISSIONS_KEY.DOWNLOAD]), (req, res) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.downloadAdminDetails();
  });

  app.use(config.baseApiUrl, router);
};
