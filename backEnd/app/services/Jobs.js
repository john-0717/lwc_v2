/*************************************************************************************
    Services for Employer only
**************************************************************************************/

const Axios = require("axios");
const config = require("../../configs/configs");
const _ = require("lodash");
const Email = require("./Email");
const { Jobs, AppliedJobs } = require("../modules/Articles/Schema");
const Users = require("../modules/Users/Schema").userSchema;
const Employer = require("../modules/Employer/Schema").Employer;
const employerSubscriptions =
  require("../modules/Employer/Schema").Subscriptions;
const ObjectId = require("mongoose").Types.ObjectId;
const moment = require("moment-timezone");
const UserService = require("./User");

class JobService {
  constructor() {}

  /**
        @purpose Update Job Status by admin
        @params jobId
        @response json
  **/
  async updateJobStatus(jobInfo) {
    try {
      // current subscription of employer
      //subscription plan
      let employerCurrentSubscription = await employerSubscriptions
        .findOne({ userId: jobInfo.userId })
        .sort({ startDate: -1 })
        .limit(1);

      //get company details and user details
      let company = await Employer.findOne({
        userId: ObjectId(jobInfo.userId),
      });
      let user = await Users.findOne({ _id: ObjectId(jobInfo.userId) });

      // get all applied applicants
      let appliedApplicants = await AppliedJobs.find({ jobId: jobInfo._id });

      if (jobInfo.status == "Published") {
        if (_.isEmpty(employerCurrentSubscription)) {
          // give error message
          return {
            status: 0,
            message: "NO_CURRENT_SUBSCRIPTION_PLAN",
          };
        }

        // change start date and end date of job
        let startDate = new Date();
        jobInfo.startDate = startDate.getTime();

        let endDate = new Date(employerCurrentSubscription.endDate);
        jobInfo.endDate = endDate.getTime();

        // update job
        await Jobs.updateOne({ _id: jobInfo._id }, { $set: jobInfo });

        // check applied jobs and update isChatActive to true and isBlocked to false
        await AppliedJobs.updateMany(
          { jobId: jobInfo._id },
          { $set: { isChatActive: true, isBlocked: false } }
        );

        // trigger notification to applicant and employer

        let notificationData = [
          {
            senderId: jobInfo.currentUser,
            receiverId: company.userId,
            event: "Job Published",
            log: `Admin published your job ${jobInfo.jobTitle}`,
            data: {
              id: jobInfo._id,
              type: "job",
            },
            sendEmailTo: [{ emailId: user.email }],
            sendEmailDataObj: {
              emailKey: "job_published_by_admin_mail_to_employer",
              replaceDataObj: {
                companyName: company.companyName,
                jobTitle: jobInfo.jobTitle,
                jobId: jobInfo.jobId,
              },
            },
          },
        ];

        // using same template for this by admin also
        if (!_.isEmpty(appliedApplicants)) {
          await JobService.asyncForEach(appliedApplicants, async (data) => {
            let applicantObj = {
              senderId: jobInfo.currentUser,
              receiverId: data.userId,
              event: "Job Published",
              log: `${jobInfo.jobTitle} job posted by ${company.companyName} is published by admin.You can now contact the employer`,
              data: {
                id: jobInfo._id,
                type: "job",
              },
              sendEmailTo: [{ emailId: data.email }],
              sendEmailDataObj: {
                emailKey: "job_published_by_employer_mail_to_applicant",
                replaceDataObj: {
                  companyName: company.companyName,
                  jobTitle: jobInfo.jobTitle,
                  jobId: jobInfo.jobId,
                  applicantName:
                    `${data.firstName || ""} ${
                      data.lastName || ""
                    }`?.toUpperCase() || "N/A",
                },
              },
            };
            notificationData.push(applicantObj);
          });
        }

        new UserService().logUserNotifications(notificationData);

        return {
          status: 1,
          message: "STATUS_UPDATED_SUCCESSFULLY",
        };
      } else {
        let endDate = new Date();
        jobInfo.endDate = endDate.getTime();
        // update job
        await Jobs.updateOne(
          { _id: jobInfo._id },
          { $set: { status: jobInfo.status } }
        );
        // check applied jobs and update isChatActive to false and isBlocked to true
        await AppliedJobs.updateMany(
          { jobId: jobInfo._id },
          { $set: { isChatActive: true, isBlocked: true } }
        );

        // trigger notification to applicant and employer

        let notificationData = [
          {
            senderId: jobInfo.currentUser,
            receiverId: company.userId,
            event: "Job Expired",
            log: `Admin changed your job ${jobInfo.jobTitle} status to expired`,
            data: {
              id: jobInfo._id,
              type: "job",
            },
            sendEmailTo: [{ emailId: user.email }],
            sendEmailDataObj: {
              emailKey: "job_expired_by_admin_mail_to_employer",
              replaceDataObj: {
                companyName: company.companyName,
                jobTitle: jobInfo.jobTitle,
                jobId: jobInfo.jobId,
              },
            },
          },
        ];

        if (!_.isEmpty(appliedApplicants)) {
          await JobService.asyncForEach(appliedApplicants, async (data) => {
            let applicantObj = {
              senderId: jobInfo.currentUser,
              receiverId: data.userId,
              event: "Job Expired",
              log: `Admin changed status of ${jobInfo.jobTitle} job posted by ${company.companyName} to expire.`,
              data: {
                id: jobInfo._id,
                type: "job",
              },
              sendEmailTo: [{ emailId: data.email }],
              sendEmailDataObj: {
                emailKey: "job_expired_by_admin_mail_to_applicant",
                replaceDataObj: {
                  companyName: company.companyName,
                  jobTitle: jobInfo.jobTitle,
                  jobId: jobInfo.jobId,
                  name: `${data.firstName} ${data.lastName}`,
                },
              },
            };
            notificationData.push(applicantObj);
          });
        }

        new UserService().logUserNotifications(notificationData);

        return {
          status: 1,
          message: "STATUS_UPDATED_SUCCESSFULLY",
        };
      }
    } catch (e) {
      console.log("\n job status update:\n", e);
      return {
        status: 0,
        message: "JOB_STATUS_NOT_UPDATED",
        jobInfo: JSON.stringify(e),
      };
    }
  }

  static async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}
module.exports = JobService;
