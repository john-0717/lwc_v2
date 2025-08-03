const EmployerController = require("../Employer/Controller");

module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const UserController = require("./Controller");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const config = require("../../../configs/configs");

  /********************************************************
      Sign up applicant
    ********************************************************/
  router.post(
    "/user/send-feedback",
    Validators.contactUsValidator(),
    Middleware.validateBody,
    (req, res) => {
      const userObj = new UserController().boot(req, res);
      return userObj.sendFeedback();
    }
  );

  /********************************************************
     verify code
    ********************************************************/
  router.post(
    "/user/verify-code",
    Validators.verifyCodeValidator(),
    Middleware.validateBody,
    (req, res) => {
      const userObj = new UserController().boot(req, res);
      return userObj.verifyEmailOTP();
    }
  );

  /********************************************************
     send code
    ********************************************************/
  router.post(
    "/user/send-code",
    Validators.sendCodeValidator(),
    Middleware.validateBody,
    (req, res) => {
      const userObj = new UserController().boot(req, res);
      return userObj.sendOTP();
    }
  );
  /********************************************************
	 user login api
	*********************************************************/
  router.post(
    "/user/sign-in",
    Validators.verifySignIn(),
    Middleware.validateBody,
    (req, res, next) => {
      const userObj = new UserController().boot(req, res);
      return userObj.userSignIn();
    }
  );

  /********************************************************
	 user signup complete
	*********************************************************/
  router.post(
    "/user/finish-sign-up",
    Validators.verifySignUp(),
    Globals.isUserAuthorized(),
    (req, res, next) => {
      const userObj = new UserController().boot(req, res);
      return userObj.userSignUp();
    }
  );



  /********************************************************
	 user update popup model status to false
	*********************************************************/
  router.post(
    "/user/popup",
    Globals.isAdviserAuthorizedAsEmployer(),
    Validators.verifyPopup(),
    Middleware.validateBody,
    (req, res, next) => {
      const userObj = new UserController().boot(req, res);
      return userObj.userPopup();
    }
  );
  /********************************************************
	 user forgot password
*********************************************************/
  router.post(
    "/user/forgot-password",
    Validators.verifyForgotPassword(),
    Middleware.validateBody,
    (req, res, next) => {
      const userObj = new UserController().boot(req, res);
      return userObj.sendOTP();
    }
  );

  /********************************************************
	 user reset password
*********************************************************/
  router.post(
    "/user/reset-password",
    Validators.verifyResetPassword(),
    Middleware.validateBody,
    (req, res, next) => {
      const userObj = new UserController().boot(req, res);
      return userObj.resetPassword();
    }
  );

  /********************************************************
	 user change password
*********************************************************/
  router.post(
    "/user/change-password",
    Globals.isUserAuthorized(),
    Validators.verifyChangePassword(),
    Middleware.validateBody,
    (req, res, next) => {
      const userObj = new UserController().boot(req, res);
      return userObj.changePassword();
    }
  );

  /********************************************************
	 user get master data
*********************************************************/
  router.post(
    "/user/master-data",
    Validators.masterData(),
    Middleware.validateBody,
    (req, res, next) => {
      const userObj = new UserController().boot(req, res);
      return userObj.getMasterData();
    }
  );

  /********************************************************
	 user get search suggestions of job titles
*********************************************************/
  router.get("/user/search-suggestions", (req, res, next) => {
    const userObj = new UserController().boot(req, res);
    return userObj.getJobTitles();
  });
  /********************************************************
	 logout user
*********************************************************/

  router.get("/user/logout", Globals.isAuthorized(), (req, res, next) => {
    const userObj = new UserController().boot(req, res);
    return userObj.logout();
  });

  /********************************************************
    File Upload (pdf)
  ********************************************************/
  router.post(
    "/user/file-upload",
    Globals.setLanguage(),
    Globals.isUserAuthorized(),
    (req, res) => {
      const adminObj = new UserController().boot(req, res);
      return adminObj.fileUpload();
    }
  );
  /********************************************************
	 delete user
*********************************************************/

  router.delete(
    "/user/delete-account",
    Globals.isUserAuthorized(),
    (req, res, next) => {
      const userObj = new UserController().boot(req, res);
      return userObj.deleteAccount();
    }
  );

  /********************************************************
	 user create password ( imported by admin)
  *********************************************************/
  router.post(
    "/user/create-password",
    Validators.verifyCreatePassword(),
    Middleware.validateBody,
    (req, res, next) => {
      const userObj = new UserController().boot(req, res);
      return userObj.createPassword();
    }
  );

  /********************************************************
     user activity log
    ********************************************************/
  router.get("/user/activity-log", Globals.isUserAuthorized(), (req, res) => {
    const userObj = new UserController().boot(req, res);
    return userObj.activityLogListing();
  });

  /********************************************************
  Mark as Read Notifications ( for applicant , employer )
  ********************************************************/
  router.post(
    "/user/mark-notification",
    Globals.isUserAuthorized(),
    Validators.readNotificationValidator(),
    Middleware.validateBody,
    (req, res) => {
      const userObj = new UserController().boot(req, res);
      return userObj.markAsReadNotification();
    }
  );

  /********************************************************
  Get Users Notifications
  ********************************************************/
  router.get("/user/notifications", Globals.isUserAuthorized(), (req, res) => {
    const userObj = new UserController().boot(req, res);
    return userObj.userNotificationList();
  });

  /********************************************************
  share stripe publishable key with front side
  ********************************************************/
  router.get(
    "/stripe/publishable-key",
    Globals.isUserAuthorized(),
    (req, res) => {
      const userObj = new UserController().boot(req, res);
      return userObj.getStripePublishableKey();
    }
  );

  router.get("/user/public-pricing", (req, res) => {
    const userObj = new EmployerController().boot(req, res);
    return userObj.employerSubscriptionList();
  });

  app.use(config.baseApiUrl, router);
};
