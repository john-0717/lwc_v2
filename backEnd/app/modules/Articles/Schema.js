let mongoose = require("mongoose");
let schema = mongoose.Schema;
const _ = require("lodash");

let jobs = new schema(
  {
    ansco: {
      type: String,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    jobType: {
      type: String,
      trim: true,
      required: true,
    },
    location: {
      type: [String],
      trim: true,
      required: true,
    },
    country: {
      type: String,
      trim: true,
      required: true,
    },
    industry: {
      type: String,
      trim: true,
      required: true,
    },
    salary: {
      type: Boolean,
    },
    payRateFrom: {
      type: Number,
    },
    payRateTo: {
      type: Number,
    },
    hoursPerWeek: {
      type: Number,
    },
    isBonusAllowed: {
      type: Boolean,
    },
    bonusAmount: {
      type: String,
    },
    earningPerWeek: {
      type: Number,
    },
    paymentFrequency: {
      type: String,
      trim: true,
      required: true,
    },
    mandatoryQualificationName: {
      type: String,
      trim: true,
    },
    mandatoryQualificationLevel: {
      type: String,
      trim: true,
      required: true,
    },
    optionalQualificationName: {
      type: String,
      trim: true,
    },
    optionalQualificationLevel: {
      type: String,
      trim: true,
    },
    mandatoryExperience: {
      type: String,
      trim: true,
    },
    optionalExperience: {
      type: String,
      trim: true,
    },
    isQualificationExpRequired: {
      type: Boolean,
    },
    qualificationDescription: {
      type: String,
      trim: true,
    },
    isNzRegistration: {
      type: Boolean,
    },
    nzRegistrationDetails: {
      type: String,
      trim: true,
    },
    jobDuties: {
      type: String,
      trim: true,
    },
    jobSkills: {
      type: [String],
      default: [],
    },
    skillLevel: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      required: true,
      enum: ["Draft", "Expired", "Published"],
    },
    otherInfo: {
      type: String,
      trim: true,
    },
    jobId: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    isFeaturedByEmployer: {
      type: Boolean,
      default: false,
    },
    isFeaturedByAdmin: {
      type: Boolean,
      default: false,
    },
    updatedAt: { type: Number },
    createdAt: { type: Number },
    startDate: { type: Number },
    endDate: { type: Number },
    aboutUs: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    isApproved: { type: Boolean, default: false },
    approvedAt: { type: Number, default: null },
    isRequestSent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const appliedjobs = new schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "jobs",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    addressLine: {
      type: String,
    },
    addressCountry: {
      type: String,
    },
    addressRegion: {
      type: String,
    },
    addressCity: {
      type: String,
    },
    position: {
      type: String,
    },
    email: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    phone: {
      type: Number,
    },
    phoneCode: {
      type: String,
    },
    about: {
      type: String,
    },
    immigrationStatus: {
      type: String,
    },
    immigrationCountry: { type: String },
    preferedContactTime: {
      type: Array,
    },
    preferedContactMethod: {
      type: [String],
    },
    coverLetter: {
      type: String,
    },
    availability: {
      type: String,
    },
    healthIssue: {
      type: Boolean,
    },
    pastConviction: {
      type: Boolean,
    },
    qualificationDetails: {
      type: [
        {
          qualificationName: { type: String },
          universityName: { type: String },
          location: { type: String },
          areaOfStudy: { type: String },
          levelOfStudy: { type: String },
          duration: { type: String },
          yearOfObtained: { type: String },
          logo: { type: String },
        },
      ],
    },
    experienceDetails: {
      type: [
        {
          companyName: { type: String },
          location: { type: String },
          jobTitle: { type: String },
          industry: { type: String },
          duration: { type: Number },
          current: { type: Boolean, default: false },
          startDate: { type: Date },
          endDate: { type: Date },
          logo: { type: String },
        },
      ],
    },
    certificationDetails: {
      type: [
        {
          certificateName: { type: String },
          authorityName: { type: String },
          authorityLocation: { type: String },
          yearOfObtained: { type: Number },
          logo: { type: String },
        },
      ],
    },
    isRegisteredInNZ: { type: Boolean, default: false },
    NZRegistrationDetails: [
      {
        certificateName: { type: String },
        professionalBodyName: { type: String },
        expiryDate: { type: Date },
        yearOfObtained: { type: Number },
        logo: { type: String },
      },
    ],
    isRegisteredOutsideNZ: { type: Boolean, default: false },
    OutsideNZRegistrationDetails: [
      {
        certificateName: { type: String },
        professionalBodyName: { type: String },
        expiryDate: { type: Date },
        yearOfObtained: { type: Number },
        logo: { type: String },
        industry: { type: Number },
      },
    ],
    skills: {
      type: [String],
    },
    isChatActive: {
      type: Boolean,
      default: false,
    },
    applicantStatus: {
      type: String,
      enum: ["Seen", "Applied", "Under Review", "Rejected", "Shortlisted"],
      default: "Applied",
    },
    employerStatus: {
      type: String,
      enum: [
        "View Profile",
        "May be Shortlisted",
        "Shortlisted",
        "Not Shortlisted",
      ],
      default: "View Profile",
    },
    profileUrl: {
      type: String,
    },
    modeOfContactByEmployer: {
      type: String,
      enum: ["Email", "Phone", "Not contacted yet"],
    },
    note: { type: String },
    isBlocked: { type: Boolean, default: false },
    applicationId: {
      type: String,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);


const articleSchema = new schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
    },
    articleId: {
      type: String,
      trim: true,
      unique: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    otherInfo: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


let models = mongoose.modelNames();

let Jobs = !_.includes(models, "Jobs")
  ? mongoose.model("Jobs", jobs)
  : mongoose.models["Jobs"];

let AppliedJobs = !_.includes(models, "appliedjobs")
  ? mongoose.model("appliedjobs", appliedjobs)
  : mongoose.models["appliedjobs"];

let ArticleSchema = !_.includes(models, "articles")
  ? mongoose.model("articles", articleSchema)
  : mongoose.models["articles"];

module.exports = {
  Jobs,
  jobs,
  AppliedJobs,
  appliedjobs,
  articleSchema,
  ArticleSchema
};
