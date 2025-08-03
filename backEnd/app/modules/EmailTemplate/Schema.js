const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
  {
    languageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "languages",
      required: true,
    },
    emailTitle: { type: String, required: true },
    emailKey: { type: String, required: true },
    emailContent: { type: String, required: true },
    subject: { type: String, required: true },
    status: { type: Boolean, default: true },
    emailType: { type: String, default: "smtpSettings" },
    contentTags: [
      {
        name: { type: String },
        tag: { type: String },
        description: { type: String },
      },
    ],
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    createdAt: { type: Number },
  },
  {
    timestamps: { createdAt: "createdAt" },
  }
);
const campaignSchema = new mongoose.Schema(
  {
    languageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "languages",
      required: true,
    },
    title: { type: String, required: true },
    campaignSubject: { type: String, required: true },
    buttons: {
      type: [{ button: { type: String }, link: { type: String } }],
      default: [],
    },
    heading: { type: Object, default: null, required: true },
    leftImage: { type: String, default: "" },
    description: { type: String, required: true },
    topic1: { type: String },
    topic2: { type: String },
    topic3: { type: String },
    footer: { type: String },
    fbUrl: { type: String },
    twitterUrl: { type: String },
    linkedinUrl: { type: String },
    instagramUrl: { type: String },
    email: { type: String },
    address: { type: String },
    phone: { type: String },
    status: { type: Boolean, default: true },
    applicantColor: { type: String },
    employerColor: { type: String },
    sendTo: { type: Array },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    createdAt: { type: Number },
    updatedAt: { type: Number },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);
let CampaignTemplate = mongoose.model("campaignTemplate", campaignSchema);
let EmailTemplate = mongoose.model("emailTemplate", emailSchema);
module.exports = {
  EmailTemplate,
  CampaignTemplate,
};
