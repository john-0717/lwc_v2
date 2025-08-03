/****************************
SCHEDULE CRON JOBS
****************************/
const cron = require("node-cron");
const _ = require("lodash");
const config = require("../../configs/configs");
const fs = require("fs");
const { Jobs, AppliedJobs } = require("../modules/Articles/Schema");
const { Subscriptions } = require("../modules/Employer/Schema");
const { Languages } = require("../modules/MasterLanguageManagement/Schema");
const {
  siteSettingSchema,
  socialMediaSDKSchema,
} = require("../modules/Settings/Schema");
const EmployerService = require("./Employer");
const UserNotifications = require("../modules/Users/Schema").userNotification;
const ActivityLog = require("../modules/Users/Schema").activityLogSchema;
const Email = require("./Email");
const Todo = require("../modules/Advisor/Schema").TodoSchema;
const ObjectId = require("mongoose").Types.ObjectId;
const Admin = require("../modules/Admin/Schema").Admin;
const UserService = require("../services/User");
const { userSchema } = require("../modules/Users/Schema");
const { AdviserReports, AdvisorSchema } = require("../modules/Advisor/Schema");
class Cron {
  constructor() {
    this.test = new Email();
  }
  scheduleCronJobs() {
    // Manage Logs for last 30 days
    cron.schedule("0 0 * * *", async () => {
      try {
        //get today timestamp
        let today = new Date();
        let timestamp = today.getTime();
        //expire the jobs and trigger notification
        this.expireJobs(timestamp);
        this.expireSubscription(timestamp);
        this.deleteData();
        this.createCommissionBill();

      } catch (error) {
        console.log("error in cron", error);
      }
    });

    // Sending todo reminder everyday at 8:00 AM
    cron.schedule("0 8 * * *", async () => {
      try {
        await this.sendTodoReminder();
      } catch (error) {
        console.log({ error });
        console.log("Error in todo reminder cron.");
      }
    });

    // Schedule a task to run on the 1st day of every month at 12:00 AM
    //every 10min - */10 * * * *
    //every month 1st midnight - 0 0 1 * *
    // cron.schedule('*/10 * * * *', async() => {
    //   // Your code to run at midnight on the 1st day of every month
    //   console.log('Running task on the 1st day of every month at midnight');
    // });
  }

  async expireJobs(timestamp) {
    try {
      let jobIds = await Jobs.aggregate([
        {
          $match: {
            status: "Published",
            endDate: { $lte: timestamp },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userData",
          },
        },
        {
          $lookup: {
            from: "employers",
            localField: "userId",
            foreignField: "userId",
            as: "employerData",
          },
        },
        { $unwind: "$userData" },
        { $unwind: "$employerData" },
      ]);
      let jobsData = jobIds;
      jobIds = jobIds.map((e) => {
        return e._id;
      });
      //expire the jobs
      await Jobs.updateMany({ _id: { $in: jobIds } }, { status: "Expired" });
      //block the applicant to make inactive the chat
      await AppliedJobs.updateMany(
        { jobId: { $in: jobIds } },
        { isBlocked: true }
      );
      //create system notifications to employer and applicants, admin as well
      jobsData.forEach((e) => {
        (async () => {
          //notification data for admin
          let adminNotifyData = {
            senderId: e.userId,
            event: "Job Expired",
            log: `${e.jobTitle} job was expired and published by ${e.employerData.companyName} with this email ${e.userData.email}.`,
            isVisibleToAdmin: true,
          };
          //create system notification to admin
          await UserNotifications.create(adminNotifyData);

          //notification data for employer
          let employerNotifyData = {
            senderId: e.userId,
            recieverId: e.userId,
            event: "Job Expired",
            log: `${e.jobTitle} job was expired from your published jobs list.`,
            isVisibleToAdmin: false,
          };
          //create system notification to Employer
          await UserNotifications.create(employerNotifyData);

          //trigger email to employer
          let replaceDataObj = {
            companyName: e.employerData.companyName,
            jobTitle: e.jobTitle,
          };
          await this.test.sendNotification({
            emailId: e.userData.email,
            emailKey: "job_expired_mail_to_employer",
            replaceDataObj,
          });
        })();
      });
      //get applicants
      let applicants = await AppliedJobs.aggregate([
        {
          $match: {
            jobId: { $in: jobIds },
          },
        },
        {
          $lookup: {
            from: "jobs",
            foreignField: "_id",
            localField: "jobId",
            as: "jobInfo",
          },
        },
        {
          $unwind: "$jobInfo",
        },
      ]);
      applicants.forEach((e) => {
        (async () => {
          let applicantNotifyData = {
            senderId: e.jobInfo.userId,
            recieverId: e.userId,
            event: "Job Expired",
            log: `${e.jobTitle} job was expired from your applied jobs list.`,
            isVisibleToAdmin: false,
          };
          //create system notification to admin
          await UserNotifications.create(applicantNotifyData);
          //trigger email to applicant about job expire
          let replaceDataObj = {
            applicantName:
              `${e.firstName || ""} ${e.lastName || ""}`?.toUpperCase() ||
              "N/A",
            jobTitle: e.jobInfo?.jobTitle,
          };
          await this.test.sendNotification({
            emailId: e.email,
            emailKey: "job_expired_mail_to_applicant",
            replaceDataObj,
          });
        })();
      });
    } catch (e) {
      console.log(
        "\n----------------error in expiring the jobs---------------------\n"
      );
      console.log(e);
      console.log("\n-------------------------------------\n");
    }
  }
  async expireSubscription(timestamp) {
    try {
      //get all exiparable and active subscription data
      let subscriptionData = await Subscriptions.aggregate([
        {
          $match: {
            $and: [
              {
                $expr: {
                  $lte: [
                    { $toLong: { $toDate: "$endDate" } },
                    { $toLong: timestamp },
                  ],
                },
              },
              { isExpired: false },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userData",
          },
        },
        {
          $lookup: {
            from: "employers",
            localField: "userId",
            foreignField: "userId",
            as: "employerData",
          },
        },
        {
          $lookup: {
            from: "mastersubscriptions",
            localField: "subscriptionId",
            foreignField: "_id",
            as: "masterSubscriptionData",
          },
        },
        {
          $unwind: "$userData",
        },
        {
          $unwind: "$employerData",
        },
        {
          $unwind: "$masterSubscriptionData",
        },
        {
          $group: {
            _id: "$_id",
            email: { $first: "$userData.email" },
            companyName: { $first: "$employerData.companyName" },
            planName: { $first: "$masterSubscriptionData.name" },
            endDate: { $first: "$endDate" },
            userId: { $first: "$userId" },
          },
        },
      ]);
      let ids = subscriptionData.map((e) => e._id);
      //do the expiry for that ids
      await Subscriptions.updateMany(
        { _id: { $in: ids } },
        { isExpired: true }
      );

      //create email template requirements
      let replaceDataObj = {};

      //notification should trigger here
      subscriptionData.forEach((e) => {
        (async () => {
          //notification data for admin
          let adminNotifyData = {
            senderId: e.userId,
            event: "Plan Expired",
            log: `${e.planName} plan was expired for ${e.companyName} with this email ${e.email}.`,
            isVisibleToAdmin: true,
          };
          //create system notification to admin
          await UserNotifications.create(adminNotifyData);

          //send email to employer
          replaceDataObj.companyName = e.companyName;
          replaceDataObj.planName = e.planName;
          replaceDataObj.endDate = await new EmployerService().getDateTime(
            new Date(e.endDate).getTime()
          );
          if (e.planName == "Trial Plan") {
            let emailData = {
              emailId: e.email,
              emailKey: "trial_plan_about_to_end",
              replaceDataObj,
            };
            await this.test.sendNotification(emailData);
          } else {
            let emailData = {
              emailId: e.email,
              emailKey: "subscription_expired",
              replaceDataObj,
            };
            await this.test.sendNotification(emailData);
          }
        })();
      });
      console.log("\n----------subscriptions expired----------------\n");
    } catch (e) {
      console.log(
        "\n----------------error in expiring the jobs---------------------\n"
      );
      console.log(e);
      console.log("\n-------------------------------------\n");
    }
  }
  async deleteData() {
    try {
      //create last 1 month timestamp
      let today = new Date();
      today.setDate(today.getDate() - 30);
      today = new Date(today).getTime();
      //delete user notifications
      await UserNotifications.deleteMany({ createdAt: { $lte: today } });
      //delete activity log as well
      await ActivityLog.deleteMany({ createdAt: { $lte: today } });
      console.log(
        "\n---------------last 1 month data stored and remaining cleared-------------\n"
      );
    } catch (e) {
      console.log("\n--------------deletion of data error------------\n");
      console.log(e);
      console.log("\n-----------------------\n");
    }
  }

  async sendNewsLetter() {
    try {
    } catch (e) {
      console.log(e);
      console.log(
        "\n--------------------failed to send newLetter--------------\n"
      );
    }
  }

  // To get user wise today's todo(inCompleted) & send the reminder mail
  async sendTodoReminder() {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todosOfTodayGrouped = await Todo.aggregate([
        {
          $match: {
            isDeleted: false,
            isDone: false,
            toBeDoneAt: {
              $gte: +todayStart.getTime(),
              $lte: +todayEnd.getTime(),
            },
          },
        },
        {
          $group: {
            _id: "$userId",
            todos: { $push: "$$ROOT" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $project: {
            _id: 1,
            userDetails: { $first: "$userDetails" },
            tasks: "$todos.task",
          },
        },
        {
          $project: {
            _id: 1,
            userDetails: { _id: 1, email: 1, role: 1, status: 1 },
            tasks: 1,
          },
        },
      ]);

      const superAdmin = await Admin.findOne({
        isDeleted: false,
        status: true,
      });
      for (const user of todosOfTodayGrouped) {
        let adviserNotifyData = {
          senderId: superAdmin._id,
          event: "To-do list reminder",
          log: `Reminder of todos has been send to ${user.userDetails.email}`,
          data: {
            id: user.userDetails._id,
            type: "adviser",
          },
          isVisibleToAdmin: true,
          sendEmailTo: [{ emailId: user.userDetails.email }],
          subject: "New Employer Created - Job Check",
          sendEmailDataObj: {
            emailKey: "todo_reminder_to_adviser_from_admin",
            replaceDataObj: {
              role: "Adviser",
              todo: user.tasks,
            },
          },
        };

        await new UserService().logUserNotifications([adviserNotifyData]);
      }

      console.log(
        `---------------Cron the send todo reminder run successfully at ${new Date()}-----------------------`
      );
    } catch (error) {
      console.log(error);
      console.log(
        "\n--------------------Failed to send Todo reminder--------------\n"
      );
    }
  }
  async createCommissionBill(){
    try{
        //get all advisers
        //create time stamps for last month start and end dates
        // Get the current date
        let currentDate = new Date();

        // Set the date to the first day of the current month
        currentDate.setDate(1);

        // Subtract one day to get the last day of the last month
        let lastMonthEndDate = new Date(currentDate);
        lastMonthEndDate.setDate(0);

        // Set the date to the first day of the last month
        currentDate.setMonth(currentDate.getMonth() - 1);

        // Get the first day of the last month
        let lastMonthStartDate = new Date(currentDate).getTime() 
      lastMonthEndDate = new Date(lastMonthEndDate).getTime()
      let today = new Date().getTime()
        //get all comissions from database
        let commissions = await userSchema.aggregate([
          {
            $match: {
              role: "Adviser",
              isDeleted: false,
            },
          },
          {
            $lookup: {
              from: "advisors",
              localField: "_id",
              foreignField: "userId",
              as: "adviserInfo",
            },
          },
          {
            $unwind: {
              path: "$adviserInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "createdBy",
              as: "employersList",
            },
          },
          {
            $unwind: {
              path: "$employersList",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "transactions",
              let: {
                empId: "$employersList._id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$userId", "$$empId"],
                    },
                  },
                },
              ],
              as: "transactions",
            },
          },
          {
            $unwind: {
              path: "$transactions",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: "$_id",
              commission: {
                $sum: "$transactions.paymentDetails.totalFee",
              },
              email: {
                $first: "$email",
              },
              companyName: {
                $first: "$adviserInfo.companyName",
              },
              licenseNumber: {
                $first: "$adviserInfo.licenseNumber",
              },
              isDeleted:{$first:"$isDeleted"}
            },
          },
        ])
        //add bill date to listing.
        await Cron.asyncForEach(commissions,async (e)=>{
          // Get the current date
          let currentDate = new Date();

          // Set the date to the first day of the current month
          currentDate.setDate(1);
          //get advisor data
          let advisorInfo = await AdvisorSchema.findOne({userId:ObjectId(e._id)})
          // Get the month and add 1 (months are zero-based)
          var month = (new Date().getMonth() + 1).toString().padStart(2, '0');
          // Get the year
          var year = new Date().getFullYear();
          e.billId = `01${month}${year}`
          e.billDate = new Date(currentDate).getTime()
          e.status = "Pending"
          e.userId = e._id
          e.amount = e.commission
          e.commission = e.commission * ((advisorInfo?.commission || 0)/100)
          delete e._id
          let checkBill = await AdviserReports.findOne({billId:e.billId})
          if(checkBill){
            await AdviserReports.updateOne({userId:ObjectId(e.userId)},{
              $set:{
                ...e
              }
            })
          }else{
            await AdviserReports.create(e)
          }
          //get total revenue for advisor and update the profile table
          let totalRevenue = await AdviserReports.aggregate([
              {
                $match:{
                  userId:ObjectId(e.userId)
                }
              },
              {
                $group:{
                  _id:"$_id",
                  commission:{$sum:"$commission"}
                }
              }
          ])
          await AdvisorSchema.updateOne({userId:ObjectId(e.userId)},{$set:{commissionEarned:totalRevenue[0]?.commission || 0}})

          //get all the advisors who doesn't have a single employer
        })
    }catch(e){
      console.log(e)
    }
  }

  static async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}

module.exports = Cron;
