/*************************************************************************************
    Services for Employer only
**************************************************************************************/

const config = require("../../configs/configs");
const { Employer } = require("../modules/Employer/Schema");
const { userSchema } = require("../modules/Users/Schema");
const Applicant = require("../modules/Applicant/Schema").applicantSchema;
const ObjectId = require("mongoose").Types.ObjectId;
const _ = require("lodash");
const Email = require("./Email");
const { Admin } = require("../modules/Admin/Schema");

class ApplicantService {
  /**
   * Function to calculate personal details profile completion
   * @param {*} userId
   * @returns
   */
  async personalDetailsProfileCompletion(userId) {
    try {
      let profileCompletion = await Applicant.aggregate([
        { $match: { userId: ObjectId(userId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            personalDetails: {
              $subtract: [
                1,
                {
                  $divide: [
                    {
                      $sum: [
                        { $cond: [{ $ne: ["$nameTitle", null] }, 0, 1] },
                        { $cond: [{ $ne: ["$user.firstName", null] }, 0, 1] },
                        { $cond: [{ $ne: ["$user.lastName", null] }, 0, 1] },
                        { $cond: [{ $ne: ["$middleName", null] }, 0, 1] },
                        // { $cond: [{ $ne: ["$position", null] }, 0, 1] },
                        { $cond: [{ $ne: ["$citizenship", null] }, 0, 1] },
                        { $cond: [{ $ne: ["$dateOfBirth", null] }, 0, 1] },
                        { $cond: [{ $ne: ["$maritalStatus", null] }, 0, 1] },
                        { $cond: [{ $ne: ["$user.email", null] }, 0, 1] },
                        { $cond: [{ $ne: ["$user.phone", null] }, 0, 1] },
                        { $cond: [{ $ne: ["$user.phoneCode", null] }, 0, 1] },
                        { $cond: [{ $ne: ["$user.photo", null] }, 0, 1] },
                      ],
                    },
                    11,
                  ],
                },
              ],
            },
            address: {
              $subtract: [
                1,
                {
                  $divide: [
                    {
                      $sum: [
                        { $cond: [{ $ne: ["$addressLine", null] }, 0, 1] },
                        { $cond: [{ $ne: ["$addressCountry", null] }, 0, 1] },
                        { $cond: [{ $ne: ["$addressLine2", null] }, 0, 1] },
                      ],
                    },
                    11,
                  ],
                },
              ],
            },
            migran: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$isMigran", true] },
                    { $eq: ["$isMigran", false] },
                  ],
                },
                1,
                0,
              ],
            },
            aboutMe: {
              $cond: [{ $ne: ["$about", null] }, 1, 0],
            },
            contactMethod: {
              $cond: [
                {
                  $and: [
                    { $isArray: "$preferedContactMethod" },
                    { $ne: [{ $size: "$preferedContactMethod" }, 0] },
                  ],
                },
                1,
                0,
              ],
            },
            health: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$healthIssue", true] },
                    { $eq: ["$healthIssue", false] },
                  ],
                },
                1,
                0,
              ],
            },
            past: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$pastConviction", true] },
                    { $eq: ["$pastConviction", false] },
                  ],
                },
                1,
                0,
              ],
            },
            applicantAvailability: {
              $cond: [{ $ne: ["$availability", null] }, 1, 0],
            },
          },
        },
        {
          $project: {
            personalDetails: 1,
            address: 1,
            migran: 1,
            aboutMe: 1,
            contactMethod: 1,
            // timeToContact: 1,
            health: 1,
            past: 1,
            applicantAvailability: 1,
            personalDetailsWeightage: {
              $multiply: ["$personalDetails", 5.56],
            },
            addressWeightage: {
              $multiply: ["$address", 5.56],
            },
            migranWeightage: {
              $multiply: ["$migran", 5.56],
            },
            aboutMeWeightage: {
              $multiply: ["$aboutMe", 5.56],
            },
            contactMethodWeightage: {
              $multiply: ["$contactMethod", 5.56],
            },
            timeToContactWeightage: {
              $multiply: [1, 5.56],
            },
            healthWeightage: {
              $multiply: ["$health", 5.56],
            },
            pastWeightage: {
              $multiply: ["$past", 5.56],
            },
            applicantAvailabilityWeightage: {
              $multiply: ["$applicantAvailability", 5.56],
            },
          },
        },
        {
          $project: {
            profileCompletion: {
              $add: [
                "$personalDetailsWeightage",
                "$addressWeightage",
                "$migranWeightage",
                "$aboutMeWeightage",
                "$contactMethodWeightage",
                "$timeToContactWeightage",
                "$healthWeightage",
                "$pastWeightage",
                "$applicantAvailabilityWeightage",
              ],
            },
          },
        },
        {
          $project: {
            profileDetailsCompletion: {
              $cond: [
                { $gt: ["$profileCompletion", 50.0] },
                {
                  $toDouble: { $trunc: { $add: ["$profileCompletion", 0.5] } },
                },
                { $toDouble: "$profileCompletion" },
              ],
            },
          },
        },
      ]);

      let profileCompletionPercentage = Math.floor(
        profileCompletion[0].profileDetailsCompletion
      );
      return profileCompletionPercentage;
    } catch (e) {
      console.log("error-while calculating profile completion");
      return 0;
    }
  }

  /**
   * Function to calculate qualification profile completion
   * @param {*} userId
   * @returns
   */

  async qualificationDetailsProfileCompletion(userId) {
    try {
      let profileCompletion = await Applicant.aggregate([
        { $match: { userId: ObjectId(userId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            qualificationWeightage: {
              $cond: [
                { $eq: ["$isQualification", true] },
                10, // Set qualificationWeightage to 10
                0,
              ],
            },
          },
        },
        {
          $project: {
            profileCompletion: { $add: ["$qualificationWeightage", 0] },
          },
        },
      ]);
      let qualificationProfileCompletion =
        profileCompletion[0].profileCompletion;
      return qualificationProfileCompletion;
    } catch (e) {
      console.log("error-while calculating profile completion");
      return 0;
    }
  }

  /**
   * Function to calculate experience profile completion
   * @param {*} userId
   * @returns
   */

  async experienceDetailsProfileCompletion(userId) {
    try {
      let profileCompletion = await Applicant.aggregate([
        { $match: { userId: ObjectId(userId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            experienceWeightage: {
              $cond: [
                { $eq: ["$isExperienced", true] },
                10, // Set experienceWeightage to 10
                0,
              ],
            },
          },
        },
        {
          $project: {
            profileCompletion: { $add: ["$experienceWeightage", 0] },
          },
        },
      ]);
      let experienceProfileCompletion = profileCompletion[0].profileCompletion;
      return experienceProfileCompletion;
    } catch (e) {
      console.log("error-while calculating profile completion");
      return 0;
    }
  }

  /**
   * Function to calculate certification profile completion
   * @param {*} userId
   * @returns
   */

  async certificationDetailsProfileCompletion(userId) {
    try {
      let profileCompletion = await Applicant.aggregate([
        { $match: { userId: ObjectId(userId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            certificationWeightage: {
              $cond: [
                { $eq: ["$isCertified", true] },
                10, // Set certificationWeightage to 10
                0,
              ],
            },
          },
        },
        {
          $project: {
            profileCompletion: { $add: ["$certificationWeightage", 0] },
          },
        },
      ]);
      let certificationProfileCompletion =
        profileCompletion[0].profileCompletion;
      return certificationProfileCompletion;
    } catch (e) {
      console.log("error-while calculating profile completion");
      return 0;
    }
  }

  /**
   * Function to calculate registration profile completion
   * @param {*} userId
   * @returns
   */

  async registrationDetailsProfileCompletion(userId) {
    try {
      let profileCompletion = await Applicant.aggregate([
        { $match: { userId: ObjectId(userId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            isRegisteredInNZWeightage: {
              $cond: [
                { $eq: ["$isRegisteredInNZ", true] },
                5, // Set isRegisteredInNZWeightage to 5
                0,
              ],
            },
            isRegisteredOutsideNZWeightage: {
              $cond: [
                { $eq: ["$isRegisteredOutsideNZ", true] },
                5, // Set isRegisteredOutsideNZWeightage to 5
                0,
              ],
            },
          },
        },
        {
          $project: {
            profileCompletion: {
              $add: [
                "$isRegisteredInNZWeightage",
                "$isRegisteredOutsideNZWeightage",
              ],
            },
          },
        },
      ]);
      let registrationProfileCompletion =
        profileCompletion[0].profileCompletion;
      return registrationProfileCompletion;
    } catch (e) {
      console.log("error-while calculating profile completion");
      return 0;
    }
  }

  /**
   * Function to calculate skills profile completion
   * @param {*} userId
   * @returns
   */

  async skillsDetailsProfileCompletion(userId) {
    try {
      let profileCompletion = await Applicant.aggregate([
        { $match: { userId: ObjectId(userId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            skillsWeightage: {
              $cond: [
                { $ne: [{ $size: "$skills" }, 0] }, // Check if skills array is not empty
                10, // Set skillsWeightage to 10 if skills array is not empty
                0, // Set skillsWeightage to 0 if skills array is empty
              ],
            },
          },
        },
        {
          $project: {
            profileCompletion: "$skillsWeightage",
          },
        },
      ]);
      let skillsProfileCompletion = profileCompletion[0].profileCompletion;
      return skillsProfileCompletion;
    } catch (e) {
      console.log("error-while calculating profile completion");
      return 0;
    }
  }
  /**
   * Function to delete applicant
   * @param {*} userId
   * @returns
   */

  async deleteApplicant(user, role = "Applicant") {
    try {
      let userId = user._id;
      // find user info
      let userInfo = await userSchema.findOne({ _id: ObjectId(userId) });
      //change status of his account
      await userSchema.updateOne(
        { _id: ObjectId(userId) },
        {
          $set: {
            isDeleted: true,
            isOldAccount: true,
            isEmailVerified: false,
          },
        }
      );
      await Applicant.updateOne(
        { userId: ObjectId(userId) },
        {
          $set: {
            isDeleted: true,
          },
        }
      );
      //trigger email to admin
      //find super admins
      let adminInfo = await Admin.aggregate([
        { $match: { isDeleted: false } },
        {
          $lookup: {
            from: "roles",
            let: { roleId: "$role" }, // Store the role field value in a variable roleId
            pipeline: [
              {
                $match: { $expr: { $eq: ["$_id", "$$roleId"] } }, // Match the _id of "roles" with roleId
              },
              {
                $match: { role: "Super Admin" },
              },
            ],
            as: "role",
          },
        },
        { $match: { "role.0": { $exists: true } } },
      ]);
      adminInfo.forEach(async (e) => {
        let replaceDataObj = {
          applicantName:
            `${userInfo.firstName || ""} ${
              userInfo.lastName || ""
            }`?.toUpperCase() || "N/A",
          adminName: `${e.firstName} ${e.lastName}`,
        };
        // send email regarding account deletion
        await new Email().sendNotification({
          emailId: e.emailId,
          emailKey: "account_deleted_mail_to_admin",
          replaceDataObj,
        });
      });
      //trigger email to applicant
      let replaceDataObj = {
        applicantName:
          `${userInfo.firstName || ""} ${
            userInfo.lastName || ""
          }`?.toUpperCase() || "N/A",
      };
      // send email regarding account deletion
      await new Email().sendNotification({
        emailId: userInfo.email,
        emailKey:
          role == "Applicant"
            ? "account_deleted_mail_to_applicant"
            : "account_deleted_by_admin_mail_to_applicant",
        replaceDataObj,
      });

      return { status: 1, message: "ACCOUNT_DELETE_SUCCESS" };
    } catch (e) {
      console.log("\napplicant deletion:\n", e);
      return {
        status: 0,
        message: "ACCOUNT_DELETE_FAILED",
        data: JSON.stringify(e),
      };
    }
  }
}
module.exports = ApplicantService;
