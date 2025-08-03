module.exports = (app, express) => {
    const router = express.Router();
    const Globals = require("../../../configs/Globals");
    const TestimonialManagementController = require("./Controller");
    const Middleware = require("../../services/middleware");
    const Validators = require("./Validator");
    const config = require("../../../configs/configs");
    const permission = require("../../services/permissions");
  
    /********************************************************
    Testimonial Add
    ********************************************************/
    router.post("/testimonial/add", Globals.setLanguage(), Globals.isAdminAuthorized([permission.TESTIMONIAL_MANAGEMENT.PERMISSIONS_KEY.CREATE]), Validators.testimonialAddValidator(), Middleware.validateBody, (req, res) => {
      const testimonialObj = new TestimonialManagementController().boot(req, res);
      return testimonialObj.addTestimonial();
    });

     /********************************************************
    Testimonial Edit
    ********************************************************/
    router.post("/testimonial/edit", Globals.setLanguage(), Globals.isAdminAuthorized([permission.TESTIMONIAL_MANAGEMENT.PERMISSIONS_KEY.EDIT]), Validators.testimonialEditValidator(), Middleware.validateBody, (req, res) => {
        const testimonialObj = new TestimonialManagementController().boot(req, res);
        return testimonialObj.editTestimonial();
      });
  
    /********************************************************
    Testimonial Listing
    ********************************************************/
    router.get("/testimonial/listing", Globals.setLanguage(), Globals.isAdminAuthorized([permission.TESTIMONIAL_MANAGEMENT.PERMISSIONS_KEY.VIEW]), (req, res) => {
      const testimonialObj = new TestimonialManagementController().boot(req, res);
      return testimonialObj.testimonialListing();
    });
  
    /********************************************************
    Testimonial Delete 
    ********************************************************/
    router.delete("/testimonial/delete", Globals.setLanguage(), Globals.isAdminAuthorized([permission.TESTIMONIAL_MANAGEMENT.PERMISSIONS_KEY.DELETE]), Validators.testimonialDeleteValidator(), Middleware.validateBody, (req, res) => {
      const testimonialObj = new TestimonialManagementController().boot(req, res);
      return testimonialObj.deleteTestimonial();
    });
    
    /********************************************************
    Get testimonial details
    ********************************************************/
    router.get("/testimonial/details", Globals.setLanguage(), Globals.isAdminAuthorized([permission.TESTIMONIAL_MANAGEMENT.PERMISSIONS_KEY.VIEW]), (req, res) => {
      const testimonialObj = new TestimonialManagementController().boot(req, res);
      return testimonialObj.testimonialDetails();
    }); 

    app.use(config.baseApiUrl, router);
}