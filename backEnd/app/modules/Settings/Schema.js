const mongoose = require("mongoose");
let schema = mongoose.Schema;
const _ = require("lodash");
const { ObjectId } = require("mongoose");

let siteSetting = new schema(
  {
    siteName: { type: String },
    siteFevicon: { type: String, default: null },
    siteLogoSmall: { type: String, default: null },
    siteLogoLarge: { type: String, default: null },
    siteCity: { type: String, default: null },
    siteAddress: { type: String, default: null },
    sitePhoneNo: { type: String },
    siteEmail: { type: String, default: null },
    siteLatitude: { type: Number, default: null },
    siteLongitude: { type: Number, default: null },
    siteFooterWebsiteName: { type: String, default: null },
    siteFooterCompanyName: { type: String, default: null },
    languageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "languages",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

let siteUnMaintenance = new schema(
  {
    siteOfflineMsg: { type: String },
    languageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "languages",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

let paymentGateway = new schema(
  {
    status: { type: Boolean, default: true },
    environment: { type: String },
    loginId: { type: String },
    transactionTestKeyStatus: { type: Boolean, default: true },
    transactionTestKey: { type: String },
    transactionPublicKey: { type: String },
    isLive: { type: Boolean },
    prodSk: { type: String },
    prodPk: { type: String },
    testSk: { type: String },
    testPk: { type: String },
    isGst: { type: Boolean, default: false },
    gst: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

let metaData = new schema(
  {
    metaTitle: { type: String },
    metaDecscription: { type: String },
    metaKeywords: { type: String },
    languageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "languages",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

let genSettingsSchema = new schema(
  {
    analyticalData: {
      analyticalSnippet: { type: String },
      headerSnippet: { type: String },
      footerSnippet: { type: String },
    },
    dateTimeSettings: {
      timeZone: { type: String },
      dateFormat: { type: String },
      currency: { type: String },
      timeFormat: { type: String },
    },
    siteUnMaintenance: {
      siteStatus: { type: Boolean, default: false },
      siteOfflineStartDate: { type: Date },
      siteOfflineEndDate: { type: Date },
    },
    is2FA: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

let socialMediaSchema = new schema({
  socialMediaSDK: {
    facebookAppId: { type: String },
    facebookAppSecret: { type: String },
    fbSDKStatus: { type: Boolean, default: true },
    twitterAppId: { type: String },
    twitterAppSecret: { type: String },
    twitterSDKStatus: { type: Boolean, default: true },
    linkedInAppId: { type: String },
    linkedInAppSecret: { type: String },
    linkinedSDKStatus: { type: Boolean, default: true },
  },
  socialMediaLink: {
    fbUrl: { type: String },
    twitterUrl: { type: String },
    linkedinUrl: { type: String },
    instagramUrl: { type: String },
    youtubeUrl: { type: String },
  },
});

let smtpSchema = new schema(
  {
    smtpSettings: {
      host: { type: String },
      port: { type: Number },
      encryption: { type: String },
      userName: { type: String },
      password: { type: String },
      fromEmail: { type: String },
      fromName: { type: String },
    },
    smtpSupport: {
      host: { type: String },
      port: { type: Number },
      encryption: { type: String },
      userName: { type: String },
      password: { type: String },
      fromEmail: { type: String },
      fromName: { type: String },
    },
    smtpAccounts: {
      host: { type: String },
      port: { type: Number },
      encryption: { type: String },
      userName: { type: String },
      password: { type: String },
      fromEmail: { type: String },
      fromName: { type: String },
    },
    smtpFeedbacks: {
      host: { type: String },
      port: { type: Number },
      encryption: { type: String },
      userName: { type: String },
      password: { type: String },
      fromEmail: { type: String },
      fromName: { type: String },
    },
    smsSettings: {
      userName: { type: String },
      password: { type: String },
      appId: { type: String },
    },
  },

  {
    timestamps: true,
  }
);

const emailSettingSchema = new schema(
  {
    title: { type: String },
    type_description: { type: String },
    type: { type: String },
    description: { type: String },
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

let siteSettingSchema = mongoose.model("siteSetting", siteSetting);
let paymentGatewaySchema = mongoose.model("paymentGateway", paymentGateway);
let siteUnMaintenanceSchema = mongoose.model(
  "siteUnMaintenance",
  siteUnMaintenance
);
let metaDataSchema = mongoose.model("metaData", metaData);
let generalSettingsSchema = mongoose.model("settings", genSettingsSchema);
let socialMediaSDKSchema = mongoose.model("socialMedia", socialMediaSchema);
let smtpSettingsSchema = mongoose.model("smtpSettings", smtpSchema);
let emailSettingsSchema = mongoose.model("emailSettings", emailSettingSchema);

module.exports = {
  siteSettingSchema,
  siteUnMaintenanceSchema,
  metaDataSchema,
  paymentGatewaySchema,
  generalSettingsSchema,
  socialMediaSDKSchema,
  smtpSettingsSchema,
  emailSettingsSchema,
};
