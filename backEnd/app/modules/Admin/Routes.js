module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const AdminController = require("./Controller");
  const config = require("../../../configs/configs");
  const permission = require("../../services/permissions");

  /********************************************************
    Admin Login route
  ********************************************************/
  router.post(
    "/admin/login",
    Globals.setLanguage(),
    Validators.loginValidator(),
    Middleware.validateBody,
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.adminLogin();
    }
  );

  /********************************************************
    Admin send otp route
  ********************************************************/
  router.post(
    "/admin/send-otp",
    Globals.setLanguage(),
    Validators.sendOtpValidator(),
    Middleware.validateBody,
    (req, res, next) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.sendOtp();
    }
  );

  /********************************************************
    Admin verifyOtp route
  ********************************************************/
  router.post(
    "/admin/verify-otp",
    Globals.setLanguage(),
    Validators.verifyOtpValidator(),
    Middleware.validateBody,
    (req, res, next) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.verifyOtp();
    }
  );

  /********************************************************
    Admin view profile route
  ********************************************************/
  router.get(
    "/admin/profile",
    Globals.setLanguage(),
    Globals.isAdminAuthorized(),
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.profile();
    }
  );

  /********************************************************
    Admin edit profile route
  ********************************************************/
  router.post(
    "/admin/edit-profile",
    Globals.setLanguage(),
    Globals.isAdminAuthorized(),
    Validators.editProfileValidator(),
    Middleware.validateBody,
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.editProfile();
    }
  );

  /********************************************************
    Admin logout route
  ********************************************************/
  router.get(
    "/admin/logout",
    Globals.setLanguage(),
    Globals.isAdminAuthorized(),
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.logout();
    }
  );

  /********************************************************
    Admin refresh access token route
  ********************************************************/
  router.get(
    "/admin/refresh-access-token",
    Globals.setLanguage(),
    Globals.isValid,
    (req, res, next) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.refreshAccessToken();
    }
  );

  /********************************************************
    Admin change password route
  ********************************************************/
  router.post(
    "/admin/change-password",
    Globals.setLanguage(),
    Globals.isAdminAuthorized(),
    Validators.changePasswordValidator(),
    Middleware.validateBody,
    (req, res, next) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.changePassword();
    }
  );

  /********************************************************
    Admin forgot password email route route
  ********************************************************/
  router.post(
    "/admin/forgot-password",
    Globals.setLanguage(),
    Globals.getTechnology(),
    Validators.forgotPasswordValidator(),
    Middleware.validateBody,
    (req, res, next) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.adminForgotPasswordMail();
    }
  );

  /********************************************************
    Admin reset Password route
  ********************************************************/
  router.post(
    "/admin/reset-password",
    Globals.setLanguage(),
    Validators.resetPasswordValidator(),
    Middleware.validateBody,
    (req, res, next) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.resetPasswordAdmin();
    }
  );

  /********************************************************
    Admin Image File Upload
  ********************************************************/
  router.post(
    "/admin/image-file-upload",
    Globals.setLanguage(),
    Globals.isAuthorized(),
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.imageFileUpload();
    }
  );

  /********************************************************
    Admin Video File Upload
  ********************************************************/
  router.post(
    "/admin/video-file-upload",
    Globals.setLanguage(),
    Globals.isAdminAuthorized(),
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.videoFileUpload();
    }
  );

  /********************************************************
  Get Admin Global Settings
  ********************************************************/
  router.get(
    "/admin/global-config",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.GENERAL_SETTINGS.PERMISSIONS_KEY.VIEW,
    ]),
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.getAdminGlobalConfig();
    }
  );

  /********************************************************
  Get Admin Global Settings
  ********************************************************/
  router.delete(
    "/admin",
    Globals.setLanguage(),
    Globals.isAdminAuthorized(),
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.deleteSubAdmin();
    }
  );
  /********************************************************
  Get Admin dashboard-count
  ********************************************************/
  router.get(
    "/admin/dashboard-count",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.DASHBOARD.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.adminDashboardCount();
    }
  );

  /********************************************************
  Get Admin top 10 employers of jobs listed
  ********************************************************/
  router.get(
    "/admin/dashboard/top-ten-employer",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.DASHBOARD.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.adminTopEmployers();
    }
  );

  /********************************************************
  Get Admin chart data
  ********************************************************/
  router.get(
    "/admin/dashboard-chart",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.DASHBOARD.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.adminChartData();
    }
  );

  /********************************************************
  Get Admin Notifications
  ********************************************************/
  router.get(
    "/admin/notifications",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.NOTIFICATION.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.adminNotificationList();
    }
  );

  /********************************************************
  Delete Notifications
  ********************************************************/
  router.delete(
    "/admin/delete-notification",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.NOTIFICATION.PERMISSIONS_KEY.DELETE]),
    Validators.admindeleteNotificationValidator(),
    Middleware.validateBody,
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.deleteNotification();
    }
  );

  /********************************************************
        Download Notification list ( excel , csv , pdf) 
    ********************************************************/

  router.post(
    "/admin/notifications-download",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.NOTIFICATION.PERMISSIONS_KEY.DOWNLOAD,
    ]),
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.notificationsDownload();
    }
  );

  /********************************************************
  Mark as Read Notifications
  ********************************************************/
  router.post(
    "/admin/mark-notification",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.NOTIFICATION.PERMISSIONS_KEY.MARK_AS_READ,
    ]),
    Validators.readNotificationValidator(),
    Middleware.validateBody,
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.markAsReadNotification();
    }
  );

  /********************************************************
  Get Admin Total Earning chart data (by month and year)
  ********************************************************/
  router.get(
    "/admin/total-earning/chart",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.DASHBOARD.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.totalEarningChartData();
    }
  );

  /********************************************************
  Get List of Total Earning employer (by month and year)
  ********************************************************/
  router.get(
    "/admin/total-earning/employer-list",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.DASHBOARD.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.totalEarningEmployerList();
    }
  );

  /********************************************************
  Get List of shortlist applicant
  ********************************************************/
  router.get(
    "/admin/dashboard/shortlist-applicant",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.DASHBOARD.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.adminGetShortlistApplicant();
    }
  );

  app.use(config.baseApiUrl, router);
};
