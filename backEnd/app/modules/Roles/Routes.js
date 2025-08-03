module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const RoleController = require("./Controller");
  const config = require("../../../configs/configs");
  const permission = require("../../services/permissions");

  /********************************************************
  Roles Permission Category Add/Edit (frontend not using)
  ********************************************************/
  router.post("/role/permission-category", Globals.setLanguage(), Validators.permissionCategoryAddEditValidator(), Middleware.validateBody, Globals.isAdminAuthorized(), (req, res) => {
    const roleObj = new RoleController().boot(req, res);
    return roleObj.addPermissionCategory();
  });

  /********************************************************
  Roles Permission Category List
  ********************************************************/
  router.get("/role/permission-category", Globals.setLanguage(), Globals.isAdminAuthorized([permission.ROLE.PERMISSIONS_KEY.VIEW]), (req, res) => {
    const roleObj = new RoleController().boot(req, res);
    return roleObj.getCategory();
  });

  /********************************************************
  Roles Permission Add/Edit
  ********************************************************/
  router.post("/role/permission", Globals.setLanguage(), Validators.permissionAddEditValidator(), Middleware.validateBody, Globals.isAdminAuthorized(), (req, res) => {
    const roleObj = new RoleController().boot(req, res);
    return roleObj.addPermissions();
  });

  /********************************************************
  Roles Get All Permission
  ********************************************************/
  router.get("/role/get-all-permission", Globals.setLanguage(), Globals.isAdminAuthorized([permission.ROLE.PERMISSIONS_KEY.VIEW]), (req, res) => {
    const roleObj = new RoleController().boot(req, res);
    return roleObj.getAllPermission();
  });

  /********************************************************
  Role Add/Edit
  ********************************************************/
  router.post("/role", Globals.setLanguage(), Validators.roleAddEditValidator(), Middleware.validateBody, Globals.isAdminAuthorizedWithPermissions([permission.ROLE.PERMISSIONS_KEY.CREATE,permission.ROLE.PERMISSIONS_KEY.EDIT],'ROLE','roleId'), (req, res) => {
    const roleObj = new RoleController().boot(req, res);
    return roleObj.addUpdateRole();
  });

  /********************************************************
  Role Listing
  ********************************************************/
  router.post("/role/listing", Globals.setLanguage(), Globals.isAdminAuthorized([permission.ROLE.PERMISSIONS_KEY.VIEW]), Validators.roleListingValidator(), Middleware.validateBody, (req, res) => {
    const roleObj = new RoleController().boot(req, res);
    return roleObj.listRoles();
  });

  /********************************************************
  Role Get user detail list by ID
  ********************************************************/
  router.get("/role/user-list/:roleId", Globals.setLanguage(), Globals.isAdminAuthorized([permission.ROLE.PERMISSIONS_KEY.VIEW]), (req, res) => {
    const roleObj = new RoleController().boot(req, res);
    return roleObj.getUserListByRole();
  });

  /********************************************************
  Role Get details by ID
  ********************************************************/
  router.get("/role/:roleId", Globals.setLanguage(), Globals.isAdminAuthorized([permission.ROLE.PERMISSIONS_KEY.VIEW]), (req, res) => {
    const roleObj = new RoleController().boot(req, res);
    return roleObj.getRolePermission();
  });

  /********************************************************
  Role Get detail
  ********************************************************/
  router.get("/role", Globals.setLanguage(), Globals.isAdminAuthorized([permission.ROLE.PERMISSIONS_KEY.VIEW]), (req, res) => {
    const roleObj = new RoleController().boot(req, res);
    return roleObj.getRolesList();
  });

  /********************************************************
  Role Delete
  ********************************************************/
  router.delete("/role", Globals.setLanguage(), Globals.isAdminAuthorized([permission.ROLE.PERMISSIONS_KEY.DELETE]), Validators.roleDeleteValidator(), Middleware.validateBody, (req, res) => {
    const roleObj = new RoleController().boot(req, res);
    return roleObj.deleteRole();
  });

  /********************************************************
  Change Admin Role
  ********************************************************/
  router.patch("/role/change-role", Globals.setLanguage(), Globals.isAdminAuthorized([permission.ROLE.PERMISSIONS_KEY.CHANGE_PERMISSION]), Validators.changeRoleValidator(), Middleware.validateBody, (req, res) => {
    const roleObj = new RoleController().boot(req, res);
    return roleObj.changeAdminRole();
  });

  app.use(config.baseApiUrl, router);
};
