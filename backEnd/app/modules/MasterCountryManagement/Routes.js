module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const MasterController = require("./Controller");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const config = require("../../../configs/configs");

  /********************************************************
    Master Country Add/Edit
  ********************************************************/
  router.post("/master/country", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.countryAddEditValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.addUpdateCountry();
  });

  /********************************************************
    Master Country Listing
  ********************************************************/
  router.post("/master/country/listing", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.countryListingValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.countryListing();
  });

  /********************************************************
    Master Delete deleteCountries
  ********************************************************/
  router.delete("/master/country", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.countryDeleteValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.deleteCountries();
  });

  /********************************************************
    Master change Country Status
  ********************************************************/
  router.patch("/master/country", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.countryChangeStatusValidator(), Middleware.validateBody, (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.changeCountriesStatus();
  });

  /********************************************************
    Master Get Country details
  ********************************************************/
  router.get("/master/country/:countryId", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.getCountrydetails();
  });

  /********************************************************
    Master Get Country List for add timezone
  ********************************************************/
  router.get("/master/country", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.getCountriesList();
  });

  /********************************************************
   Master Get Currency List for add timezone
 ********************************************************/
  router.get("/master/currency", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const adminObj = new MasterController().boot(req, res);
    return adminObj.getCurrencyList();
  });


  app.use(config.baseApiUrl, router);
};
