const {
  masterVisaTypes,
  masterLicense,
} = require("../modules/MasterDataManagement/Schema");

const masterProffessionalBody =
  require("../modules/MasterDataManagement/Schema").masterProffessionalBody;

const MasterAddOns =
  require("../modules/MasterDataManagement/Schema").masterAddOns;
const MasterIndustry =
  require("../modules/MasterDataManagement/Schema").masterIndustry;
const MasterSkills =
  require("../modules/MasterDataManagement/Schema").masterSkills;
const MasterJobTitles =
  require("../modules/MasterDataManagement/Schema").masterJobTitles;
const MasterLevels =
  require("../modules/MasterDataManagement/Schema").masterLevels;
const MasterImmigration =
  require("../modules/MasterDataManagement/Schema").masterImmigrationStatus;
const MasterAvailabilty =
  require("../modules/MasterDataManagement/Schema").masterAvailabilities;
const MasterExperience =
  require("../modules/MasterDataManagement/Schema").masterExperience;
const MasterQualificationDuration =
  require("../modules/MasterDataManagement/Schema").masterQualificationDuration;
const MasterAccreditation =
  require("../modules/MasterDataManagement/Schema").masterAccreditation;
const MasterHourlyRate =
  require("../modules/MasterDataManagement/Schema").masterHourlyRate;
const MasterYearlyRate =
  require("../modules/MasterDataManagement/Schema").masterYearlyRate;
const MasterAnsco =
  require("../modules/MasterDataManagement/Schema").masterAnsco;
const MasterPartners = require("../modules/PrayerRequest/Schema").PrayerRequest;
const MasterSkillLevel =
  require("../modules/MasterDataManagement/Schema").masterSkillLevels;
const MasterLicense =
  require("../modules/MasterDataManagement/Schema").masterLicense;

let models = {
  masterAddons: MasterAddOns,
  masterIndustry: MasterIndustry,
  masterSkills: MasterSkills,
  masterJobTitles: MasterJobTitles,
  masterLevels: MasterLevels,
  masterImmigration: MasterImmigration,
  masterAvailabilty: MasterAvailabilty,
  masterExperience: MasterExperience,
  masterQualificationDuration: MasterQualificationDuration,
  masterAccreditation: MasterAccreditation,
  masterHourlyRate: MasterHourlyRate,
  masterYearlyRate: MasterYearlyRate,
  masterAnsco: MasterAnsco,
  masterPartners: MasterPartners,
  masterSkillLevel: MasterSkillLevel,
  masterProffessionalBody: masterProffessionalBody,
  masterVisaTypes: masterVisaTypes,
  masterLicense: MasterLicense,
};
module.exports = models;
