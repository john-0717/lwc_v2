module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const MasterController = require("./Controller");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const config = require("../../../configs/configs");
  const permission = require("../../services/permissions");

  /********************************************************
      Subscription Listing
    ********************************************************/
  router.get(
    "/admin/subscription-listing",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.SUBSCRIPTION.PERMISSIONS_KEY.VIEW]),

    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.subscriptionListing();
    }
  );

  /********************************************************
      Edit Subscription
    ********************************************************/
  router.post(
    "/admin/edit-subscription",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.SUBSCRIPTION.PERMISSIONS_KEY.EDIT]),
    Validators.editSubscriptionValidator(),
    Middleware.validateBody,
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.editSubscription();
    }
  );

  /********************************************************
       Subscription Details
    ********************************************************/
  router.get(
    "/admin/subscription/details",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.SUBSCRIPTION.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.subscriptionDetails();
    }
  );

  /********************************************************
       Add Master (Add Ons, Industry, Skills)
    ********************************************************/
  router.post(
    "/admin/master/add",
    Globals.setLanguage(),
    Globals.isAdminAuthorizedMastersWithPermissions("CREATE"),
    Validators.addMasterValidator(),
    Middleware.validateBody,
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.addMaster();
    }
  );

  /********************************************************
       Edit Master (Add Ons,Industry, Skills)
    ********************************************************/
  router.post(
    "/admin/master/edit",
    Globals.setLanguage(),
    Globals.isAdminAuthorizedMastersWithPermissions("EDIT"),
    Validators.editMasterValidator(),
    Middleware.validateBody,
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.editMaster();
    }
  );

  /********************************************************
       Master Details
    ********************************************************/
  router.post(
    "/admin/master/details",
    Globals.setLanguage(),
    Globals.isAdminAuthorizedMastersWithPermissions("VIEW"),
    Validators.masterDetailsValidator(),
    Middleware.validateBody,
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.masterDetails();
    }
  );

  /********************************************************
       Add Master coupons
    ********************************************************/
  router.post(
    "/admin/add-coupon",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.COUPONS.PERMISSIONS_KEY.CREATE]),
    Validators.addMasterCouponValidator(),
    Middleware.validateBody,
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.addMasterCoupon();
    }
  );

  /********************************************************
       list Master coupons
    ********************************************************/
  router.get(
    "/admin/coupon-listing",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.COUPONS.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.listMasterCoupon();
    }
  );

  /********************************************************
       list Master coupons delete (hard)
    ********************************************************/
  router.delete(
    "/admin/coupon-delete",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.COUPONS.PERMISSIONS_KEY.DELETE]),
    Validators.masterCouponDeleteValidator(),
    Middleware.validateBody,
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.deleteMasterCoupon();
    }
  );

  /********************************************************
       edit master coupons
    ********************************************************/
  router.post(
    "/admin/edit-coupon",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.COUPONS.PERMISSIONS_KEY.EDIT]),
    Validators.editMasterCouponValidator(),
    Middleware.validateBody,
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.addMasterCoupon();
    }
  );

  /********************************************************
       edit master coupons
    ********************************************************/
  router.patch(
    "/admin/coupon-status-update",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.COUPONS.PERMISSIONS_KEY.CHANGE_STATUS,
    ]),
    Validators.masterCouponChangeStatusValidator(),
    Middleware.validateBody,
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.masterCouponChangeStatus();
    }
  );

  /********************************************************
       get coupons details
    ********************************************************/
  router.get(
    "/admin/coupon-details",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.COUPONS.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.getCouponDetails();
    }
  );
  /********************************************************
       get coupons details
    ********************************************************/
  router.post(
    "/admin/coupon-download",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.COUPONS.PERMISSIONS_KEY.DOWNLOAD]),
    Validators.masterCouponDownloadValidator(),
    Middleware.validateBody,
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.couponDownload();
    }
  );
  /********************************************************
       Change Master status
    ********************************************************/
  router.patch(
    "/admin/master/status-update",
    Globals.setLanguage(),
    Globals.isAdminAuthorizedMastersWithPermissions("CHANGE_STATUS"),
    Validators.masterChangeStatusValidator(),
    Middleware.validateBody,
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.changeMasterDataStatus();
    }
  );

  /********************************************************
       Master Listing Api
    ********************************************************/
  router.get(
    "/admin/master/listing",
    Globals.setLanguage(),
    Globals.isAdminAuthorizedMastersWithPermissions("VIEW"),
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.masterListing();
    }
  );

  /********************************************************
       Master Import Industry, Skills
    ********************************************************/
  router.post(
    "/admin/master/import",
    Globals.setLanguage(),
    Globals.isAdminAuthorizedMastersWithPermissions("IMPORT"),
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.importMaster();
    }
  );

  /********************************************************
       Download Master Industry, Skills
    ********************************************************/
  router.post(
    "/admin/master/download",
    Globals.setLanguage(),
    Globals.isAdminAuthorizedMastersWithPermissions("DOWNLOAD"),
    Validators.masterDownloadValidator(),
    Middleware.validateBody,
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.masterDownload();
    }
  );

  /********************************************************
       Add Ansco
    ********************************************************/
  router.post(
    "/admin/master/ansco-add",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.MASTER_ANSCO.PERMISSIONS_KEY.CREATE]),
    Validators.masterAnscoAddValidator(),
    Middleware.validateBody,
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.addAnsco();
    }
  );

  /********************************************************
       Edit Ansco
    ********************************************************/
  router.post(
    "/admin/master/ansco-edit",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.MASTER_ANSCO.PERMISSIONS_KEY.EDIT]),
    Validators.masterAnscoEditValidator(),
    Middleware.validateBody,
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.editAnsco();
    }
  );

  /********************************************************
       Ansco Details
    ********************************************************/
  router.get(
    "/admin/master/ansco-details",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.MASTER_ANSCO.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.anscoDetails();
    }
  );

  /********************************************************
      Master Ansco Listing
    ********************************************************/
  router.get(
    "/admin/master/ansco-listing",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.MASTER_ANSCO.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.anscoListing();
    }
  );

  /********************************************************
       Download Ansco
    ********************************************************/
  router.post(
    "/admin/master/ansco-download",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.MASTER_ANSCO.PERMISSIONS_KEY.DOWNLOAD,
    ]),
    Validators.anscoDownloadValidator(),
    Middleware.validateBody,
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.anscoDownload();
    }
  );

  /********************************************************
       Import Ansco
    ********************************************************/
  router.post(
    "/admin/master/import-ansco",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.MASTER_ANSCO.PERMISSIONS_KEY.IMPORT]),
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.importAnsco();
    }
  );

  /********************************************************
       Change Ansco status
    ********************************************************/
  router.patch(
    "/admin/master/ansco-status-update",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([
      permission.MASTER_ANSCO.PERMISSIONS_KEY.CHANGE_STATUS,
    ]),
    Validators.masterChangeAnscoStatusValidator(),
    Middleware.validateBody,
    (req, res) => {
      const masterObj = new MasterController().boot(req, res);
      return masterObj.changeAnscoStatus();
    }
  );

  /********************************************************
      get states by country code
    ********************************************************/
  router.get("/admin/master/states", Globals.setLanguage(), (req, res) => {
    const masterObj = new MasterController().boot(req, res);
    return masterObj.masterStates();
  });

  /********************************************************
      get cities by state code
    ********************************************************/
  router.get("/admin/master/cities", Globals.setLanguage(), (req, res) => {
    const masterObj = new MasterController().boot(req, res);
    return masterObj.masterCities();
  });

  app.use(config.baseApiUrl, router);
};
