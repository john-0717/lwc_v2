const config = require("../../configs/configs");
const { Employer } = require("../modules/Employer/Schema");
const { userSchema } = require("../modules/Users/Schema");
const Applicant = require("../modules/Applicant/Schema").applicantSchema;
const masterSubscriptions =
  require("../modules/MasterDataManagement/Schema").masterSubscriptions;
const ObjectId = require("mongoose").Types.ObjectId;
const _ = require("lodash");
const Email = require("./Email");
const ActivityLog = require("../modules/Users/Schema").activityLogSchema;
const AppliedJobs = require("../modules/Articles/Schema").AppliedJobs;
const UserNotification = require("../modules/Users/Schema").userNotification;
const Jobs = require("../modules/Articles/Schema").Jobs;
const EmailService = require("./Email");
const { AdvisorSchema } = require("../modules/Advisor/Schema");

class UserService {
  constructor() {
    this.EmailService = new EmailService();
  }
  /**
   * Function to log activity of employer/applicant
   * @param {*} data
   * @returns
   */
  async activityLog(data) {
    try {
      let applicantInfo;
      let subscriptionInfo;
      // get userInfo
      let userInfo = await userSchema.findOne({ _id: ObjectId(data.userId) });

      // get companyInfo
      let companyInfo = await Employer.findOne({
        userId: ObjectId(data.userId),
      });
      if (_.isEmpty(companyInfo)) {
        companyInfo = await AdvisorSchema.findOne({
          userId: ObjectId(data.userId),
        });
      }
      // get subscriptionInfo
      if (data.subscriptionId) {
        subscriptionInfo = await masterSubscriptions.findOne({
          _id: ObjectId(data.subscriptionId),
        });
      }
      // get applicantInfo
      if (data.applicantId) {
        applicantInfo = await AppliedJobs.findOne({
          userId: ObjectId(data.applicantId),
          jobId: ObjectId(data.jobId),
        });
      }
      // create activity log

      let activityObj = {
        jobId: data.jobId,
        userId: data.userId,
        event: data.event,
        log: data.log,
        data: {
          name: userInfo.firstName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : companyInfo.companyName,
          contactPersonName: companyInfo?.contactPersonFullName
            ? companyInfo.contactPersonFullName
            : "",
          profileUrl: userInfo?.photo ? userInfo.photo : "",
          city: companyInfo?.addressRegion ? companyInfo.addressRegion : "",
          plan: subscriptionInfo?.name ? subscriptionInfo.name : "",
          applicantName: applicantInfo?.firstName
            ? `${applicantInfo.firstName} ${applicantInfo.lastName}`
            : "",
          applicantProfileUrl: applicantInfo?.profileUrl
            ? `${applicantInfo.profileUrl}`
            : "",
        },
      };

      await ActivityLog.create(activityObj);
      return {
        status: 1,
        message: "Activity logged",
      };
    } catch (e) {
      console.log(e);
      console.log("error-while creating activity log");
      return 0;
    }
  }

  /**
   * Function to log notification of employer/applicant/admin
   * @param {*} data
   * @returns
   */
  async logUserNotifications(data) {
    try {
      //send email
      await UserNotification.create(data);
      if (data.length > 0) {
        await UserService.asyncForEach(data, async (data) => {
          let dataObj = data.sendEmailDataObj;

          if (data.sendEmailTo.length > 1) {
            await UserService.asyncForEach(
              data.sendEmailTo,
              async (dataEmail) => {
                if (dataEmail?.emailId) {
                  // send email verification code
                  this.EmailService.sendNotification({
                    emailId: dataEmail.emailId,
                    ...dataObj,
                  });
                }
              }
            );
          } else {
            if (data.sendEmailTo[0]?.emailId) {
              // send email verification code
              this.EmailService.sendNotification({
                emailId: data.sendEmailTo[0].emailId,
                ...dataObj,
              });
            }
          }
        });
      } else {
        let dataObj = data.sendEmailDataObj;
        if (data.sendEmailTo.length > 1) {
          await UserService.asyncForEach(data.sendEmailTo, async (data) => {
            if (data?.emailId) {
              // send email verification code
              this.EmailService.sendNotification({
                emailId: data.emailId,
                ...dataObj,
              });
            }
          });
        } else {
          let dataObj = data.sendEmailDataObj;
          if (data.sendEmailTo[0]?.emailId) {
            // send email verification code
            this.EmailService.sendNotification({
              emailId: data.sendEmailTo[0].emailId,
              ...dataObj,
            });
          }
        }
      }

      // send email
      return {
        status: 1,
        message: "Notification logged",
      };
    } catch (e) {
      console.log(e);
      console.log("error-while creating notication log");
      return 0;
    }
  }

  static async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}

module.exports = UserService;
