module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const PrayerRequestController = require("./Controller");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const config = require("../../../configs/configs");
  const permission = require("../../services/permissions");


  /********************************************************
       Add Partners
  ********************************************************/
  router.post(
    "/user/add-prayer-request",
    Globals.isUserAuthorized(),
    Validators.addPartnerValidator(),
    (req, res) => {
      const partnerObj = new PrayerRequestController().boot(req, res);
      return partnerObj.addPrayer();
    }
  );


  /********************************************************
       Edit Partners
  ********************************************************/
  router.post(
    "/user/prayer-request-edit",
    Globals.isUserAuthorized(),
    Validators.editPrayerRequestValidator(),
    Middleware.validateBody,
    (req, res) => {
      const partnerObj = new PrayerRequestController().boot(req, res);
      return partnerObj.editPartner();
    }
  );
//add prayer member
  router.post(
    "/user/update-prayer",
    Globals.isUserAuthorized(),
    Validators.editPrayerRequestValidator(),
    Middleware.validateBody,
    (req, res) => {
      const partnerObj = new PrayerRequestController().boot(req, res);
      return partnerObj.addPrayMember();
    }
  );

  /********************************************************
     Partner Details
  ********************************************************/
  router.get(
    "/user/partner-details",
    Globals.setLanguage(),
    Globals.isAdminAuthorized([permission.MASTER_PARTNERS.PERMISSIONS_KEY.VIEW]),
    (req, res) => {
      const partnerObj = new PrayerRequestController().boot(req, res);
      return partnerObj.partnerDetails();
    }
  );

  /********************************************************
  Partners Listing
********************************************************/
  router.get(
    "/user/prayer-listing",
        Globals.isUserAuthorized(),
    (req, res) => {
      const masterObj = new PrayerRequestController().boot(req, res);
      return masterObj.prayerListing();
    }
  );

  router.get(
    "/public/prayer-listing",
    (req, res) => {
      const masterObj = new PrayerRequestController().boot(req, res);
      return masterObj.prayerListing();
    }
  );
    router.get(
    "/public/prayer-stats",
    (req, res) => {
      const masterObj = new PrayerRequestController().boot(req, res);
      return masterObj.prayerStats();
    }
  );


  app.use(config.baseApiUrl, router);
};
