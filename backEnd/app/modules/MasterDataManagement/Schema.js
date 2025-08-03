const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const masterPartners = require("../PrayerRequest/Schema").PrayerRequest;
const { Countries } = require("../MasterCountryManagement/Schema");
const mastersubscriptions = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    description: { type: String },
    price: { type: Number },
    maxNumListing: { type: Number },
    isUnlimitedListing: { type: Boolean, default: false },
    planDuration: { type: Number },
    listingDuration: { type: Number, default: 15 },
    topSearch: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["Default", "Custom", "Plan", "Static"],
    },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const masterSubscriptions = mongoose.model(
  "mastersubscriptions",
  mastersubscriptions
);

const masteraddons = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    price: { type: Number },
    status: { type: Boolean },
    duration: { type: Number },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const masterAddOns = mongoose.model("masteraddons", masteraddons);

const masterpromocodes = new mongoose.Schema(
  {
    couponName: { type: String, unique: true },
    price: { type: Number },
    discountType: { type: String, enum: ["Percentage", "Price"] },
    status: { type: Boolean, default: true },
    expiryDate: { type: Number },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    createdAt: { type: Number },
    updatedAt: { type: Number },
  },
  {
    timestamps: true,
  }
);

const masterPromoCodes = mongoose.model("masterpromocodes", masterpromocodes);

const masterindustry = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    status: { type: Boolean },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const masterIndustry = mongoose.model("masterindustry", masterindustry);

const masterskills = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    status: { type: Boolean },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const masterSkills = mongoose.model("masterskills", masterskills);

const masterjobtitles = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    status: { type: Boolean },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const masterJobTitles = mongoose.model("masterjobtitles", masterjobtitles);

const masterlevels = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    status: { type: Boolean },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const masterLevels = mongoose.model("masterlevels", masterlevels);

const masterimmigrationstatus = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    status: { type: Boolean },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const masterImmigrationStatus = mongoose.model(
  "masterimmigrationstatus",
  masterimmigrationstatus
);

const masteravailabilities = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    status: { type: Boolean },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const masterAvailabilities = mongoose.model(
  "masteravailabilities",
  masteravailabilities
);

const masterexperience = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    status: { type: Boolean },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const masterExperience = mongoose.model("masterexperience", masterexperience);

const masterqualificationduration = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    status: { type: Boolean },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const masterQualificationDuration = mongoose.model(
  "masterqualificationduration",
  masterqualificationduration
);

const masteraccreditation = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    status: { type: Boolean },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const masterAccreditation = mongoose.model(
  "masteraccreditation",
  masteraccreditation
);

const masterhourlyrate = new mongoose.Schema(
  {
    from: { type: Number },
    to: { type: Number },
    status: { type: Boolean },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const masterHourlyRate = mongoose.model("masterhourlyrate", masterhourlyrate);

const masteryearlyrate = new mongoose.Schema(
  {
    from: { type: Number },
    to: { type: Number },
    status: { type: Boolean },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const masterYearlyRate = mongoose.model("masteryearlyrate", masteryearlyrate);

const masteransco = new mongoose.Schema(
  {
    code: { type: String },
    codeTitle: { type: String, unique: true },
    skillLevel: { type: Schema.Types.ObjectId, ref: "masterskilllevels" },
    skills: [{ type: String }],
    roleDescription: { type: String },
    experience: { type: String },
    qualification: { type: String },
    registration: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    status: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

const masterAnsco = mongoose.model("masteransco", masteransco);

const mastercountries = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    name: { type: String },
    country_code: { type: String },
    phone_code: { type: String },
    currency: { type: String },
  },
  {
    timestamps: true,
  }
);

const masterCountries = mongoose.model("mastercountries", mastercountries);

const masterregions = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    status: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

const masterRegions = mongoose.model("masterregions", masterregions);
const mastervisatypes = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    status: { type: Boolean },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const masterVisaTypes = mongoose.model("mastervisatypes", mastervisatypes);

const masterstates = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    name: { type: String },
    country_id: { type: Number },
    country_code: { type: String },
    state_code: { type: String },
  },
  {
    timestamps: true,
  }
);

const masterStates = mongoose.model("masterstates", masterstates);

const mastercities = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    name: { type: String },
    state_id: { type: Number },
    state_code: { type: String },
    country_id: { type: Number },
    country_code: { type: String },
  },
  {
    timestamps: true,
  }
);

const masterCities = mongoose.model("mastercities", mastercities);

const masterskilllevels = new mongoose.Schema(
  {
    levelName: { type: String, unique: true },
    status: { type: Boolean },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);

const masterSkillLevels = mongoose.model(
  "masterskilllevels",
  masterskilllevels
);

const masterprofeesionalbody = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    status: { type: Boolean },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);
const masterProffessionalBody = mongoose.model(
  "mastersproffessionalbody",
  masterprofeesionalbody
);

/********************************************************
  masterLicense collection schema to store the license data.
  ********************************************************/
const masterLicenseNumber = new mongoose.Schema(
  {
    name: {
      type: String,
      validate: {
        validator: function (value) {
          const regex = /^\d{9}$/;
          return regex.test(value);
        },
        message: "The licence number must be a 9-character numerical string.",
      },
    },
    companyName: { type: String },
    status: { type: Boolean },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  {
    timestamps: true,
  }
);
const masterLicense = mongoose.model("masterLicense", masterLicenseNumber);
module.exports = {
  masterSubscriptions,
  masterAddOns,
  masterPromoCodes,
  masterIndustry,
  masterSkills,
  masterJobTitles,
  masterLevels,
  masterImmigrationStatus,
  masterAvailabilities,
  masterExperience,
  masterQualificationDuration,
  masterAccreditation,
  masterHourlyRate,
  masterYearlyRate,
  masterAnsco,
  masterCountries,
  masterStates,
  masterCities,
  masterPartners,
  masterSkillLevels,
  masterProffessionalBody,
  masterRegions,
  masterVisaTypes,
  masterLicense,
  countries: Countries,
};
