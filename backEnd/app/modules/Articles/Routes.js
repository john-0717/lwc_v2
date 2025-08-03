module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const JobsController = require("./Controller");
  const config = require("../../../configs/configs");

  /********************************************************
    Employer get coupon details
  ********************************************************/
  router.post(
    "/articles/add-new-article",
    Globals.isUserAuthorized(),
    Validators.addNewArticle(),
    Middleware.validateBody,
    (req, res, next) => {
      const job = new JobsController().boot(req, res);
      return job.addNewArticle();
    }
  );

  /********************************************************
    Employer get coupon details
  ********************************************************/
  router.post(
    "/employer/save-draft-job",
    Globals.isAdviserAuthorizedAsEmployer(),
    Validators.draftJob(),
    Middleware.validateBody,
    (req, res, next) => {
      const job = new JobsController().boot(req, res);
      return job.saveDraftJob();
    }
  );

  /********************************************************
    Employer get ansco list / details
  ********************************************************/
  router.post(
    "/employer/ansco-search",
    Globals.isUserAuthorized(),
    Validators.anscoValidator(),
    Middleware.validateBody,
    (req, res, next) => {
      const job = new JobsController().boot(req, res);
      return job.anscoSearch();
    }
  );

  /********************************************************
    Employer get job details
  ********************************************************/
  router.get("/user/job-details", (req, res, next) => {
    const job = new JobsController().boot(req, res);
    return job.getJobDetails();
  });

  /********************************************************
    Employer job listing based on filters  provided
  ********************************************************/
  router.get(
    "/employer/job-listing",
    Globals.isAdviserAuthorizedAsEmployer(),
    (req, res, next) => {
      const job = new JobsController().boot(req, res);
      return job.jobListing();
    }
  );

  /********************************************************
    Employer edit job details
  ********************************************************/
  router.post(
    "/employer/edit-job",
    Globals.isAdviserAuthorizedAsEmployer(),
    Validators.editJobValidator(),
    Middleware.validateBody,
    (req, res, next) => {
      const job = new JobsController().boot(req, res);
      return job.editJob();
    }
  );

  /********************************************************
    Employer get applicants list for job
  ********************************************************/
  router.get(
    "/employer/job-details/applicant-listing",
    Globals.isAdviserAuthorizedAsEmployer(),
    (req, res, next) => {
      const job = new JobsController().boot(req, res);
      return job.jobApplicantListing();
    }
  );

  /********************************************************
    Employer delete job
  ********************************************************/
  router.delete(
    "/employer/job-delete",
    Globals.isUserAuthorized(),
    (req, res, next) => {
      const job = new JobsController().boot(req, res);
      return job.jobDelete();
    }
  );
  /********************************************************
    Employer view report
  ********************************************************/
  router.get(
    "/employer/view-report",
    Globals.isUserAuthorized(),
    (req, res, next) => {
      const employer = new JobsController().boot(req, res);
      return employer.employerViewReport();
    }
  );
  /********************************************************
    Employer download report
  ********************************************************/
  router.post(
    "/employer/download-report",
    Globals.isUserAuthorized(),
    (req, res, next) => {
      const employer = new JobsController().boot(req, res);
      return employer.employerDownloadReport();
    }
  );
  app.use(config.baseApiUrl, router);
};
