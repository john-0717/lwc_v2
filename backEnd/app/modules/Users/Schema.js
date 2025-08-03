let mongoose = require("mongoose");
let schema = mongoose.Schema;
const _ = require("lodash");
const { object } = require("joi");

let user = new schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    phoneCode: { type: Number },
    phone: { type: Number },
    email: { type: String, required: true },
    password: { type: Buffer },
    picture: { type: String },
    role: {
      type: String,
      enum: ["user"],
      required: true,
      default: 'user'
    },
    isEmailVerified: { type: Boolean, default: true },
    isPhoneVerified: { type: Boolean, default: false },
    forgotToken: { type: String },
    forgotTokenCreationTime: { type: Date },
    status: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenCreationTime: { type: Date },
    emailOTP: { type: String },
    otpCreatedAt: { type: Number },
    userCode: { type: String },
    isOldAccount: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Number },
    deletedBy: { type: schema.Types.ObjectId },
    updatedAt: { type: Number },
    createdAt: { type: Number },
    isPopup: { type: Boolean, default: true },
    createdBy: { type: schema.Types.ObjectId, ref: "users" },
    dateOfBirth: { type: String, required: true },
    address: { type: String, required: true },
    occupation: { type: String, required: true },
    church: { type: String },
    interests: [{ type: String, required: true }],
    testimony: { type: String },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

let userSchema = mongoose.model("users", user);

let contact = new schema(
  {
    name: { type: String },
    city: { type: String },
    email: { type: String },
    phoneCode: { type: Number },
    phone: { type: Number },
    queryType: {
      type: String,
      enum: ["Complaint", "Suggestion", "Tech Issue", "Others"],
      required: true,
    },
    queryMessage: { type: String },
    answeredBy: { type: schema.Types.ObjectId, ref: "adminusers" },
    replyMessage: { type: Array, default: [] },
    replyStatus: {
      type: String,
      enum: ["Sent", "Pending"],
      default: "Pending",
    },
    queryStatus: {
      type: String,
      enum: ["Sent", "Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    isArchived: { type: Boolean, default: false },
    updatedAt: { type: Number },
    createdAt: { type: Number },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

let contactUsSchema = mongoose.model("contactus", contact);

let activitylog = new schema(
  {
    jobId: { type: schema.Types.ObjectId, ref: "jobs" },
    userId: { type: schema.Types.ObjectId, ref: "users" },
    subscriptionId: { type: schema.Types.ObjectId, ref: "mastersubscriptions" },
    applicantId: { type: schema.Types.ObjectId, ref: "appliedjobs" },
    event: { type: String },
    log: { type: String },
    data: { type: Object },
    createdAt: { type: Number },
    updatedAt: { type: Number },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

let activityLogSchema = mongoose.model("activitylogs", activitylog);

let usernotification = new schema(
  {
    senderId: { type: schema.Types.ObjectId, ref: "users" },
    receiverId: { type: schema.Types.ObjectId, ref: "users" },
    event: { type: String },
    log: { type: String },
    data: { type: Object },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: schema.Types.ObjectId, ref: "admins" },
    isVisibleToAdmin: { type: Boolean, default: false },
    createdAt: { type: Number },
    updatedAt: { type: Number },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

let userNotification = mongoose.model("usernotifications", usernotification);

module.exports = {
  userSchema,
  contactUsSchema,
  activityLogSchema,
  userNotification,
};
