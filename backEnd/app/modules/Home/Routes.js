module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const HomeController = require("./Controller");
  const config = require("../../../configs/configs");

  /********************************************************
   home get partnerList and statistics
  ********************************************************/
  router.get("/homepage/count", (req, res, next) => {
    const employer = new HomeController().boot(req, res);
    return employer.partnerAndStatistics();
  });

  /********************************************************
   home get recent job-listing
  ********************************************************/
  router.get("/homepage/recent-job", (req, res, next) => {
    const employer = new HomeController().boot(req, res);
    return employer.homePageRecentJob();
  });

  /********************************************************
   home get cms page
  ********************************************************/
  router.get("/cms", (req, res, next) => {
    const employer = new HomeController().boot(req, res);
    return employer.homeCmsPage();
  });

   /********************************************************
   home faq page
  ********************************************************/
   router.get("/faq/list", (req, res, next) => {
    const faq = new HomeController().boot(req, res);
    return faq.faqListing();
  });

  /********************************************************
   home testimonial page
  ********************************************************/
   router.get("/testimonial/list", (req, res, next) => {
    const faq = new HomeController().boot(req, res);
    return faq.testimonialListing();
  });



  app.use(config.baseApiUrl, router);
};
