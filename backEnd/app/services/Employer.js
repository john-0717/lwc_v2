/*************************************************************************************
    Services for Employer only
**************************************************************************************/

const Axios = require("axios");
const config = require("../../configs/configs");
const _ = require("lodash");
const Email = require("./Email");

const {
  Employer,
  Subscriptions,
  Transaction,
} = require("../modules/Employer/Schema");
const { Jobs, AppliedJobs } = require("../modules/Articles/Schema");
const {
  masterSubscriptions,
} = require("../modules/MasterDataManagement/Schema");
const { userSchema } = require("../modules/Users/Schema");
const {
  generalSettingsSchema,
  paymentGatewaySchema,
} = require("../modules/Settings/Schema");
const ObjectId = require("mongoose").Types.ObjectId;
const moment = require("moment-timezone");
let stripe = require("stripe");
const { Admin } = require("../modules/Admin/Schema");
const { AdvisorSchema } = require("../modules/Advisor/Schema");

class EmployerService {
  constructor() {
    this.stripe = this.initializeStripe();
  }

  /**
   @perpose init stripe
   @params 
   @response 
   */
  async initializeStripe() {
    // Fetch the Stripe API key from the database
    const stripeKey = await paymentGatewaySchema.find();
    try {
      if (!_.isEmpty(stripeKey) && stripeKey.length) {
        return stripe(
          stripeKey[0].isLive ? stripeKey[0].prodSk : stripeKey[0].testSk
        );
      }
    } catch (e) {
      console.log("\n--------stripe initialization failed-------\n");
      console.log(e);
      console.log("\n-----------------------\n");
    }
  }

  /**
        @purpose verify nzbn
        @params nzbn 
        @response json
    **/
  async nzbnVerification(nzbn) {
    try {
      //set the headers
      const headers = {
        "Ocp-Apim-Subscription-Key": `${process.env.nzbnKey}`,
        "Cache-Control": "no-cache",
        // Add other headers as needed
      };
      //get the url and key from .env
      let response = await Axios.get(
        `${process.env.nzbnURL}/entities/${nzbn}`,
        { headers: headers }
      );
      response = response.data ? response.data : {};
      if (response.nzbn && response.entityStatusCode) {
        let gst = response.gstNumbers[0]
          ? response.gstNumbers[0].gstNumber
          : "";
        let companyName = response.entityName;
        return {
          status: 1,
          data: { gstNumber: gst, companyName },
        };
      } else {
        return { status: 0, data: {} };
      }
    } catch (e) {
      console.log("error in nzbn verification", e);
      return { status: 0, data: [e] };
    }
  }
  /**---------------------------------**
   *          STRIPE API'S              *
   **---------------------------------**/
  /**
        @purpose create stripe user 
        @params nzbn 
        @response json
    **/
  async createStripeUser(email) {
    try {
      const customer = await (
        await this.stripe
      ).customers.create({
        email: email,
      });
      return {
        status: 1,
        data: customer,
      };
    } catch (error) {
      console.error("Error creating Stripe user:", error);
      return {
        status: 0,
        data: error,
      };
    }
  }
  /**
        @purpose create a payment intent
        @params {price, currency, paymentMethodId}
        @response json
    **/
  async createPaymentIntent({ customer, price, currency, paymentMethodId }) {
    try {
      const paymentIntent = await (
        await this.stripe
      ).paymentIntents.create({
        amount: price ? Math.round(price) : 0,
        currency: currency,
        payment_method: paymentMethodId,
        customer: customer,
        description: "Payment for NZD",
        confirm: true,
        confirmation_method: "automatic",
        payment_method_types: ["card"],
      });

      return { status: 1, data: paymentIntent };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      return { status: 0, data: error };
    }
  }
  /**
        @purpose create a token to add card  
        @params {card:{cardNumber, holderName, validity, CVV}}
        @response json
    **/
  async stripeCreateToken(cardObject) {
    try {
      const stripeToken = await (await this.stripe).tokens.create(cardObject);
      return {
        status: 1,
        data: stripeToken,
      };
    } catch (error) {
      console.error("Error creating card token Stripe:", error);
      return {
        status: 0,
        data: error,
      };
    }
  }
  /**
        @purpose add bank to cutomer  
        @params {stripeCustomerId, bank token}
        @response json
    **/
  async stripeCreateBank(stripeUser, token) {
    try {
      const stripeRes = await (
        await this.stripe
      ).customers.update(stripeUser, { source: token });
      return {
        status: 1,
        data: stripeRes,
      };
    } catch (error) {
      console.error("Error creating bank account Stripe:", error);
      return {
        status: 0,
        data: error,
      };
    }
  }
  /**
        @purpose add bank to admin account  
        @params {stripeCustomerId, bank token}
        @response json
    **/
  async stripeCreateAdminBank(accountId, token) {
    try {
      const stripeRes = await (
        await this.stripe
      ).accounts.createExternalAccount(accountId, { source: token });
      return {
        status: 1,
        data: stripeRes,
      };
    } catch (error) {
      console.error("Error creating bank account Stripe:", error);
      return {
        status: 0,
        data: error,
      };
    }
  }
  /**
        @purpose list bank accounts  
        @params {accountId}
        @response json
    **/
  async listBankAccount(accountId) {
    try {
      console.log(accountId);
      const stripeRes = await (
        await this.stripe
      ).accounts.listExternalAccounts(accountId, {
        object: "bank_account",
        limit: 1,
      });
      console.log("\n");
      console.log(stripeRes);
      return {
        status: 1,
        data: stripeRes,
      };
    } catch (error) {
      console.error("Error creating bank account Stripe:", error);
      return {
        status: 0,
        data: error,
      };
    }
  }
  /**
        @purpose add card to stripe  
        @params {cardNumber, holderName, validity, CVV}
        @response json
    **/
  async addCardToStripe(stripeUserId, cardObject) {
    try {
      const customer = await (
        await this.stripe
      ).customers.createSource(stripeUserId, {
        source: cardObject,
      });
      return {
        status: 1,
        data: customer,
      };
    } catch (error) {
      console.error("Error adding card to Stripe:", error);
      return {
        status: 0,
        data: error,
      };
    }
  }

  /**
        @purpose stripe card listing  
        @params stripeUserId
        @response json
    **/
  async cardListingFromStripe(stripeUserId, cardObject) {
    try {
      const cards = await (
        await this.stripe
      ).customers.listSources(stripeUserId, {
        object: "card",
      });
      return {
        status: 1,
        data: cards,
      };
    } catch (error) {
      console.error("Error listing card from Stripe:", error);
      return {
        status: 0,
        data: error,
      };
    }
  }

  /**
        @purpose stripe delete card 
        @params stripeUserId,cardId
        @response json
    **/
  async deleteCard(stripeUserId, cardId) {
    try {
      const cardStatus = await (
        await this.stripe
      ).customers.deleteSource(stripeUserId, cardId);
      return {
        status: 1,
        data: cardStatus,
      };
    } catch (error) {
      console.error("Error listing card from Stripe:", error);
      return {
        status: 0,
        data: error,
      };
    }
  }

  /**
        @purpose stripe setting default card 
        @params stripeUserId
        @response json
  **/
  async setDefaultCard(stripeUserId, cardId) {
    try {
      const defaultCard = await (
        await this.stripe
      ).customers.update(stripeUserId, {
        invoice_settings: { default_payment_method: cardId },
      });
      console.log(defaultCard);
      return {
        status: 1,
        data: defaultCard,
      };
    } catch (error) {
      console.error("Error listing card from Stripe:", error);
      return {
        status: 0,
        data: error,
      };
    }
  }
  /**
  @purpose stripe get token details 
        @params cardToken
        @response json
 */
  async getCardFromToken(token) {
    try {
      const defaultCard = await (await this.stripe).tokens.retrieve(token);

      return {
        status: 1,
        data: defaultCard,
      };
    } catch (error) {
      console.error("Error listing card from Stripe:", error);
      return {
        status: 0,
        data: error,
      };
    }
  }
  /**
        @purpose check subscriptions of employer  give listing count and isSubscribed
        @params userId
        @response json
  **/
  async getSubscriptionInfo(userId) {
    try {
      //check subscription expiry and listing
      let subscriptions = await Subscriptions.aggregate([
        {
          $match: {
            userId: ObjectId(userId),
            isExpired: false,
          },
        },
        {
          $lookup: {
            from: "mastersubscriptions",
            localField: "subscriptionId",
            foreignField: "_id",
            as: "details",
          },
        },
        {
          $unwind: {
            path: "$details",
            includeArrayIndex: "string",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $addFields: {
            isSubscribed: true,
          },
        },
        {
          $limit: 1,
        },
        {
          $project: {
            listingCount: "$listingCount",
            isUnlimitedListing: "$isUnlimitedListing",
            subscriptionData: [
              {
                listingCount: "$listingCount",
                _id: "$_id",
              },
            ],
            isSubscribed: 1,
            _id: "$userId",
          },
        },
        {
          $project: {
            userId: "$_id",
            listingCount: {
              $sum: "$listingCount",
            },
            isSubscribed: true,
            isUnlimitedListing: 1,
            subscriptionData: 1,
          },
        },
      ]);
      if (subscriptions.length) {
        subscriptions = subscriptions[0];
      } else {
        subscriptions = {
          isSubscribed: false,
          listingCount: 0,
        };
      }
      return {
        status: 1,
        data: subscriptions,
      };
    } catch (error) {
      console.error("Error in get subscriptionInfo:", error);
      return {
        status: 0,
        data: error,
      };
    }
  }

  /**
        @purpose check subscriptions of employer  give subscribed list
        @params userId
        @response json
  **/
  async getSubscriptionList(userId) {
    try {
      let list = await Subscriptions.aggregate([
        {
          $match: {
            userId: ObjectId(userId),
            isExpired: false,
          },
        },
        {
          $lookup: {
            from: "mastersubscriptions",
            localField: "subscriptionId",
            foreignField: "_id",
            as: "details",
          },
        },
        {
          $unwind: {
            path: "$details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);
      return list;
    } catch (error) {
      console.error("Error in get subscriptionInfo:", error);
      return {
        status: 0,
        data: error,
      };
    }
  }
  // end of subscription info

  // sort options and values
  sorting = {
    latest: { createdAt: -1 },
    experienceHighToLow: { "experienceDetails.duration": -1 },
    experienceLowToHigh: { "experienceDetails.duration": 1 },
    oldest: { createdAt: 1 },
    payRateHighToLow: {
      payRateFrom: -1,
      payRateTo: -1,
    },
    payRateLowToHigh: {
      payRateFrom: 1,
      payRateTo: 1,
    },
    AtoZ: { jobTitle: 1 },
  };

  /**
        @purpose converting timestamp to AGO ex:2days ago
        @params userId
        @response json
  **/
  async convertTimestampToAgo(createdAt) {
    const currentDate = new Date().getTime();
    const timestamp = createdAt;
    const elapsedMilliseconds = currentDate - timestamp;
    const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    const elapsedDays = Math.floor(elapsedHours / 24);
    const elapsedWeeks = Math.floor(elapsedDays / 7);
    const elapsedMonths = Math.floor(elapsedDays / 30);
    if (elapsedHours < 1) {
      return `${elapsedMinutes} minute${elapsedMinutes > 1 ? "s" : ""} ago`;
    } else if (elapsedDays < 1) {
      return `${elapsedHours} hour${elapsedHours > 1 ? "s" : ""} ago`;
    } else if (elapsedDays < 7) {
      return `${elapsedDays} day${elapsedDays > 1 ? "s" : ""} ago`;
    } else if (elapsedMonths < 1) {
      return `${elapsedWeeks} week${elapsedWeeks > 1 ? "s" : ""} ago`;
    } else {
      return `${elapsedMonths} month${elapsedMonths > 1 ? "s" : ""} ago`;
    }
  }
  /**
        @purpose employer profile completion
        @params userId
        @response json
  **/
  async profileCompletion(userId) {
    try {
      //calculation of profile completion
      let profileCompletion = await Employer.aggregate([
        { $match: { userId: userId } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            personalDetail: {
              companyName: {
                $ifNull: ["$companyName", undefined],
              },
              nzbn: { $ifNull: ["$nzbn", undefined] },
              tradingName: {
                $ifNull: ["$tradingName", undefined],
              },
              industry: { $ifNull: ["$industry", undefined] },
              email: { $ifNull: ["$user.email", undefined] },
              phone: { $ifNull: ["$user.phone", undefined] },
              profileUrl: "$profileUrl",
            },
            address: {
              addressLine1: { $ifNull: ["$addressLine1", undefined] },
              addressLine2: { $ifNull: ["$addressLine2", undefined] },
              addressRegion: {
                $ifNull: ["$addressRegion", undefined],
              },
            },
            contactPerson: {
              contactPersonFullName: {
                $ifNull: ["$contactPersonFullName", undefined],
              },
              contactPersonPosition: {
                $ifNull: ["$contactPersonPosition", undefined],
              },
              contactPersonEmail: {
                $ifNull: ["$contactPersonEmail", undefined],
              },
              contactPersonPhone: {
                $ifNull: ["$contactPersonPhone", undefined],
              },
            },
            accreditationDetails: {
              gstNumber: {
                $ifNull: ["$gstNumber", undefined],
              },
              accreditationDetails: {
                $ifNull: ["$accreditationDetails", undefined],
              },
              accreditationExpiryDate: {
                $ifNull: ["$accreditationExpiryDate", undefined],
              },
              accreditationEmployes: {
                $ifNull: ["$accreditationEmployes", undefined],
              },
              accreditationNzers: {
                $ifNull: ["$accreditationNzers", undefined],
              },
            },
            aboutCompany: {
              aboutCompany: {
                $ifNull: ["$aboutCompany", undefined],
              },
            },
          },
        },
      ]);
      let counts = [];
      let statistics = function processData(data) {
        return new Promise((resolve, reject) => {
          let re = {};
          Object.keys(data).forEach((key) => {
            let obj = data[key];
            let totalFields = Object.keys(obj).length;
            let notFilled = Object.keys(obj).filter((e) => {
              if (!obj[e]) {
                return e;
              }
            }).length;
            let filled = totalFields - notFilled;
            let percentage = Math.floor((filled / totalFields) * 100);
            re[key] = percentage;
            counts.push(re);
          });
          resolve(counts);
        });
      };
      profileCompletion = profileCompletion.length ? profileCompletion[0] : {};
      delete profileCompletion._id;
      // Call the function and handle the returned promise
      statistics(profileCompletion);
      counts = counts.length ? counts[0] : {};
      //calculation of total subsection percentage
      let vals = Object.values(counts);
      vals = vals.reduce((total, val) => total + val, 0);
      profileCompletion = Math.floor(
        (vals / (Object.values(counts).length * 100)) * 100
      );
      return profileCompletion;
    } catch (e) {
      console.log("error-while calculating profile completion");
      return 0;
    }
  }
  /**
        @purpose employer profile incomplete count
        @params userId
        @response json
  **/
  async profilePendingCount(userId) {
    try {
      //calculation of profile completion
      let profileCompletion = await Employer.aggregate([
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
          $unwind: "$user",
        },
        {
          $project: {
            personalDetail: {
              companyName: {
                $ifNull: ["$companyName", undefined],
              },
              nzbn: { $ifNull: ["$nzbn", undefined] },
              tradingName: {
                $ifNull: ["$tradingName", undefined],
              },
              industry: { $ifNull: ["$industry", undefined] },
              email: { $ifNull: ["$user.email", undefined] },
              phone: { $ifNull: ["$user.phone", undefined] },
              profileUrl: "$profileUrl",
            },
            address: {
              addressLine1: { $ifNull: ["$addressLine1", undefined] },
              addressLine2: { $ifNull: ["$addressLine2", undefined] },
              addressCountry: {
                $ifNull: ["$addressRegion", undefined],
              },
            },
            contactPerson: {
              contactPersonFullName: {
                $ifNull: ["$contactPersonFullName", undefined],
              },
              contactPersonPosition: {
                $ifNull: ["$contactPersonPosition", undefined],
              },
              contactPersonEmail: {
                $ifNull: ["$contactPersonEmail", undefined],
              },
              contactPersonPhone: {
                $ifNull: ["$contactPersonPhone", undefined],
              },
            },
            accreditationDetails: {
              gstNumber: {
                $ifNull: ["$gstNumber", undefined],
              },
              accreditationDetails: {
                $ifNull: ["$accreditationDetails", undefined],
              },
              accreditationExpiryDate: {
                $ifNull: ["$accreditationExpiryDate", undefined],
              },
              accreditationEmployes: {
                $ifNull: ["$accreditationEmployes", undefined],
              },
              accreditationNzers: {
                $ifNull: ["$accreditationNzers", undefined],
              },
            },
            aboutCompany: {
              aboutCompany: {
                $ifNull: ["$aboutCompany", undefined],
              },
            },
          },
        },
      ]);
      let counts = [];
      let statistics = function processData(data) {
        return new Promise((resolve, reject) => {
          let re = {};
          Object.keys(data).forEach((key) => {
            let obj = data[key];
            let notFilled = Object.keys(obj).filter((e) => {
              if (!obj[e]) {
                return e;
              }
            }).length;
            re[key] = notFilled;
            counts.push(re);
          });
          resolve(counts);
        });
      };
      profileCompletion = profileCompletion.length ? profileCompletion[0] : {};
      delete profileCompletion._id;
      // Call the function and handle the returned promise
      statistics(profileCompletion);
      counts = counts.length ? counts[0] : {};
      //calculation of total subsection percentage
      let vals = Object.values(counts);
      vals = vals.reduce((total, val) => total + val, 0);

      return vals;
    } catch (e) {
      console.log("error while counting un filled fields", e);
      return 0;
    }
  }
  /**
        @purpose employer convert number to format 800K, 2.5M
        @params userId
        @response json
  **/
  async convertNumberToFormat(number) {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + "M+";
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + "K+";
    } else {
      return number;
    }
  }
  /**
        @purpose employer get timestamp without time
        @params userId
        @response json
  **/
  async getTodayTimestampWithoutTime(days) {
    let today = new Date();
    if (days) {
      today.setDate(today.getDate() - days);
    }
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    var day = String(today.getDate()).padStart(2, "0");

    var formattedDate = new Date(`${year}-${month}-${day}`).getTime();

    return formattedDate;
  }
  /**
        @purpose employer get weeks in month
        @params userId
        @response json
  **/
  async getWeeksInMonth(year, month) {
    const weeks = {};
    // Determine the last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Calculate the number of days in the month
    const totalDays = lastDay.getDate();

    // Loop through the days of the month
    for (let day = 1; day <= totalDays; day++) {
      // Determine the current week number
      const weekNumber = Math.ceil(day / 7);

      // Add the current date to the corresponding week array
      if (!weeks[`week${weekNumber}`]) {
        weeks[`week${weekNumber}`] = [];
      }

      weeks[`week${weekNumber}`].push(
        `${day.toString().padStart(2, "0")}-${(month + 1)
          .toString()
          .padStart(2, "0")}-${year}`
      );
    }
    return weeks;
  }
  /**
        @purpose get time stamp for mentioned days
        @params userId
        @response json
  **/
  async getTimestamp(number) {
    let today = new Date();
    today.setDate(today.getDate() + number);
    return today.getTime();
  }

  /**
        @purpose delete employer
        @params userId
        @response json
  **/
  async deleteEmployer(user, role = "Employer") {
    try {
      let userId = user._id;
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
      await Employer.updateOne(
        { userId: ObjectId(userId) },
        {
          $set: {
            isDeleted: true,
          },
        }
      );

      //get company details
      let company = await Employer.findOne({ userId: ObjectId(userId) });
      //trigger email to employer
      let replaceDataObj = {
        companyName: company.companyName,
      };
      // send email regarding account deletion
      const emailStatus = await new Email().sendNotification({
        emailId: user.email,
        emailKey:
          role == "Employer"
            ? "employer_account_deleted_mail_to_employer"
            : "employer_account_deleted_by_admin_mail_to_employer",
        replaceDataObj,
      });

      //get all applicants applied job details
      let applicants = await AppliedJobs.aggregate([
        [
          {
            $lookup: {
              from: "jobs",
              localField: "jobId",
              foreignField: "_id",
              as: "jobInfo",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "applicant",
            },
          },
          {
            $unwind: {
              path: "$jobInfo",
            },
          },
          {
            $unwind: {
              path: "$applicant",
            },
          },
          {
            $match: {
              "jobInfo.userId": { $eq: ObjectId(userId) },
            },
          },
        ],
      ]);
      applicants.forEach(async (e) => {
        //trigger email to applicants
        let replaceDataObj = {
          companyName: company.companyName,
          applicantName:
            `${e.applicant.firstName || ""} ${
              e.applicant.lastName || ""
            }`?.toUpperCase() || "N/A",
          jobTitle: e.jobInfo.jobTitle,
        };
        // send email regarding account deletion
        if (e.applicant.email) {
          await new Email().sendNotification({
            emailId: e.applicant.email,
            emailKey: "employer_account_deleted_mail_to_applicant",
            replaceDataObj,
          });
        }
      });

      //send email to all super admins
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
          companyName: company.companyName,
          adminName: `${e.firstName} ${e.lastName}`,
        };
        await new Email().sendNotification({
          emailId: e.emailId,
          emailKey: "employer_account_deleted_mail_to_admin",
          replaceDataObj,
        });
      });
      if (emailStatus) {
        if (emailStatus.status == 0) {
          console.log(
            `\n---------------employer delete email sending failed----------------\n${emailStatus}\n------------------------------\n`
          );
          return {
            status: 0,
            message: "FAILED_TO_SEND_EMAIL_BUT_ACCOUNT_DELETED",
            data: emailStatus,
          };
        } else {
          return { status: 1, message: "ACCOUNT_DELETE_SUCCESS" };
        }
      } else {
        console.log(
          `\n---------------employer delete email sending error----------------\n${emailStatus}\n------------------------------\n`
        );
        return {
          status: 0,
          message: "FAILED_TO_SEND_EMAIL_BUT_ACCOUNT_DELETED",
          data: emailStatus,
        };
      }
    } catch (e) {
      console.log("\n employer deletion:\n", e);
      return {
        status: 0,
        message: "ACCOUNT_DELETE_FAILED",
        data: JSON.stringify(e),
      };
    }
  }
  /**
        @purpose delete adviser
        @params userId
        @response json
  **/
  async deleteAdviser(user, role = "Adviser") {
    try {
      let userId = user._id;
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
      await AdvisorSchema.updateOne(
        { userId: ObjectId(userId) },
        {
          $set: {
            isDeleted: true,
          },
        }
      );

      //get company details
      let company = await AdvisorSchema.findOne({ userId: ObjectId(userId) });
      //trigger email to employer
      let replaceDataObj = {
        adviserCompanyName: company.companyName,
      };
      // send email regarding account deletion
      const emailStatus = await new Email().sendNotification({
        emailId: user.email,
        emailKey:
          role == "Adviser"
            ? "adviser_account_deleted_mail_to_adviser"
            : "adviser_account_deleted_by_admin_mail_to_adviser",
        replaceDataObj,
      });

      //get all employers
      let applicants = await userSchema.aggregate([
        [
          {
            $match: {
              createdBy: ObjectId(userId),
            },
          },
          {
            $lookup: {
              from: "employers",
              localField: "_id",
              foreignField: "userId",
              as: "employers",
            },
          },
          { $unwind: "$employers" },
        ],
      ]);
      applicants.forEach(async (e) => {
        //trigger email to employer
        let replaceDataObj = {
          companyName: e.employers?.companyName?.toUpperCase() || "N/A",
          adviserCompanyName: company.companyName?.toUpperCase() || "N/A",
        };
        // send email regarding account deletion
        if (e.email) {
          await new Email().sendNotification({
            emailId: e.email,
            emailKey: "adviser_account_deleted_mail_to_employer",
            replaceDataObj,
          });
        }
      });

      //send email to all super admins
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
          companyName: company.companyName,
          adminName: `${e.firstName} ${e.lastName}`,
        };
        await new Email().sendNotification({
          emailId: e.emailId,
          emailKey: "employer_account_deleted_mail_to_admin",
          replaceDataObj,
        });
      });
      if (emailStatus) {
        if (emailStatus.status == 0) {
          console.log(
            `\n---------------employer delete email sending failed----------------\n${emailStatus}\n------------------------------\n`
          );
          return {
            status: 0,
            message: "FAILED_TO_SEND_EMAIL_BUT_ACCOUNT_DELETED",
            data: emailStatus,
          };
        } else {
          return { status: 1, message: "ACCOUNT_DELETE_SUCCESS" };
        }
      } else {
        console.log(
          `\n---------------employer delete email sending error----------------\n${emailStatus}\n------------------------------\n`
        );
        return {
          status: 0,
          message: "FAILED_TO_SEND_EMAIL_BUT_ACCOUNT_DELETED",
          data: emailStatus,
        };
      }
    } catch (e) {
      console.log("\n employer deletion:\n", e);
      return {
        status: 0,
        message: "ACCOUNT_DELETE_FAILED",
        data: JSON.stringify(e),
      };
    }
  }
  /**
              @purpose create subscription
              @params userId
              @response json
        **/
  async createSubscription(userId, price, plan) {
    try {
      // cancel the current subscription for user
      await Subscriptions.updateMany(
        { userId: ObjectId(userId) },
        {
          $set: {
            isExpired: true,
          },
        }
      );
      //get enterprice deal plan data
      const enterprisePlan = await masterSubscriptions.findOne({
        _id: ObjectId(plan),
      });
      if (_.isEmpty(enterprisePlan)) {
        return {
          status: 0,
          message: "PLAN_NOT_FOUND",
        };
      }
      //generate 10 digit number as transactionNo
      let transactionNo = Math.floor(new Date().getTime() / 1000);
      //create transaction and subscription Objects
      let transactionData = {
        paymentDetails: {
          subscriptionId: plan,
          listingFee: price,
          totalFee: price,
        },
        paymentStatus: true,
        stripeResponse: { createdBy: "Admin" },
        stripeResponseMessage: "Success",
        userId: userId,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        price: 0,
        transactionNo,
      };

      //create employer subscription data
      let today = new Date();
      today.setDate(today.getDate() + enterprisePlan.planDuration);
      let subscriptionData = {
        userId: userId,
        isExpired: false,
        price: price,
        listingCount: enterprisePlan.maxNumListing,
        isUnlimitedListing: enterprisePlan.isUnlimitedListing,
        subscriptionId: plan,
        startDate: new Date(),
        endDate: today,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        transactionNo,
      };
      //create the transaction 1st
      await Transaction.create(transactionData);
      //create the employer subscription
      await Subscriptions.create(subscriptionData);
      return {
        status: 1,
        message: "DATA_UPDATED_SUCCESSFULLY",
      };
    } catch (e) {
      return {
        status: 0,
        message: "DATA_NOT_UPDATED",
        data: JSON.stringify(e),
      };
    }
  }

  async getDateTime(timestamp, format) {
    let tzFromDb = await generalSettingsSchema.findOne();
    let tz = "(GMT+05:30) Asia/Kolkata";
    if (!_.isEmpty(tzFromDb)) {
      tz = tzFromDb.dateTimeSettings?.timeZone;
    }
    tz = tz.split(" ");
    //add timezone
    format = format ? format : "DD/MM/YYYY";
    let newDate = moment(new Date(timestamp)).tz(tz[1]).format(`${format}`);

    return newDate;
  }
  async assignDefaultPlan(userId, createdBy) {
    try {
      //generate 10 digit number as transactionNo
      let transactionNo = Math.floor(new Date().getTime() / 1000);

      //create subscription
      let subInfo = await masterSubscriptions.findOne({
        name: "Pay as you Go",
      });
      let today = new Date();
      today.setDate(today.getDate() + subInfo.planDuration);
      let subscriptionData = {
        userId,
        subscriptionId: subInfo._id,
        price: subInfo.price,
        isExpired: false,
        startDate: new Date(),
        endDate: today,
        listingCount: 0,
        listingDuration: subInfo.listingDuration || 15,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        transactionNo,
        purchasedBy: createdBy,
      };
      await Subscriptions.updateMany(
        { userId: ObjectId(userId) },
        {
          $set: {
            isExpired: true,
          },
        }
      );
      let res = await Subscriptions.create(subscriptionData);

      return res;
    } catch (e) {
      console.log(e);
      return {
        status: 0,
        message: "DATA_NOT_UPDATED",
        data: JSON.stringify(e),
      };
    }
  }
  async formatDate(inputDate) {
    const date = new Date(inputDate);
    const options = { day: "numeric", month: "short", year: "numeric" };
    const formattedDate = date.toLocaleDateString("en-GB", options);
    return formattedDate;
  }
}
module.exports = EmployerService;
