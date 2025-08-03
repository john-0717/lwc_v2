module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../../configs/Globals");
  const Middleware = require("../../services/middleware");
  const Validators = require("./Validator");
  const SupportController = require("./Controller");
  const config = require("../../../configs/configs");

  /********************************************************
  Add Support Ticket
  ********************************************************/
  router.post("/support", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.supportAddValidator(), Middleware.validateBody, (req, res) => {
    const supportObj = new SupportController().boot(req, res);
    return supportObj.addSupportTicket();
  });

  /********************************************************
  Support Ticket Listing
  ********************************************************/
  router.get("/support", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const supportObj = new SupportController().boot(req, res);
    return supportObj.SupportTicketListing();
  });

  /********************************************************
  Change Support Ticket Status
  ********************************************************/
  router.patch("/support", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.supportChangeStatusValidator(), Middleware.validateBody, (req, res) => {
    const supportObj = new SupportController().boot(req, res);
    return supportObj.changeSupportTicketStatus();
  });

  /********************************************************
  Delete Support Ticket
  ********************************************************/
  router.delete("/support", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.supportPageDeleteValidator(), Middleware.validateBody, (req, res) => {
    const supportObj = new SupportController().boot(req, res);
    return supportObj.deleteSupportTicket();
  });

  /********************************************************
  Add Support Ticket Reply
  ********************************************************/
  router.post("/support/reply", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.supportReplyAddValidator(), Middleware.validateBody, (req, res) => {
    const supportObj = new SupportController().boot(req, res);
    return supportObj.addSupportReplyTicket();
  });

  /********************************************************
  Add Support Ticket Reply
  ********************************************************/
  router.get("/support/:id", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const supportObj = new SupportController().boot(req, res);
    return supportObj.getSupportReplyDetails();
  });

  /********************************************************
  Edit Support Ticket Reply
  ********************************************************/
  router.put("/support/reply/:id", Globals.setLanguage(), Globals.isAdminAuthorized(), Validators.supportReplyEditValidator(), Middleware.validateBody, (req, res) => {
    const supportObj = new SupportController().boot(req, res);
    return supportObj.editSupportTicketReplyStatus();
  });

  /********************************************************
  Add Support Ticket Reply
  ********************************************************/
  router.delete("/support/reply/:id", Globals.setLanguage(), Globals.isAdminAuthorized(), (req, res) => {
    const supportObj = new SupportController().boot(req, res);
    return supportObj.deleteSupportReply();
  });

  app.use(config.baseApiUrl, router);
};
