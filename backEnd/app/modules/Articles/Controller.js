const _ = require("lodash");
const Controller = require("../Base/Controller");
const Globals = require("../../../configs/Globals");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const config = require("../../../configs/configs");
const { HTTP_CODE, EMAIL_TEMPLATE_KEYS } = require("../../services/constant");
const ObjectId = require("mongoose").Types.ObjectId;
const {
  Employer,
  Subscriptions,
  AddOns,
  Transaction,
} = require("../Employer/Schema");
const { Jobs, AppliedJobs } = require("./Schema");
const JobProjection = require("./Projection.json");
const { masterAnsco, masterAddOns } = require("../MasterDataManagement/Schema");
const EmployerService = require("../../services/Employer");
const UserService = require("../../services/User");
const {
  applicantswishlistjobsSchema,
  previousSearchSchema,
} = require("../Applicant/Schema");
const { userSchema } = require("../Users/Schema");
const UserChat = require("../Chat/Schema").UserChat;
const ActivityLog = require("../Users/Schema").activityLogSchema;
const { Admin } = require("../Admin/Schema");
const Email = require("../../services/Email");
const doc = require("pdfkit");
const { ArticleSchema } = require("./Schema");
class JobsController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
  @Purpose add new job
  @param check validator function
  @Return JSON String
********************************************************/
  async addNewArticle() {
    try {
      //get current user
      let userId = this.req.currentUser ? this.req.currentUser._id : "";
      let data = this.req.body;
      data.userId = userId;
      data.articleId = "#" + Math.floor(new Date().getTime() / 1000);
      data.createdBy = userId;

      let message = "JOB_PUBLISHED";
      let jobInfo = await ArticleSchema.create(data);

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(this.req.currentUserLang, message),
        { jobInfo }
      );
    } catch (e) {
      console.log(e);
      console.log(
        `\n---------------Employer add new job ERROR----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        e
      );
    }
  }
  /********************************************************
  @Purpose save draft job
  @param check validator function
  @Return JSON String
********************************************************/
  async saveDraftJob() {
    try {
      //get current user
      let userId = this.req.currentUser ? this.req.currentUser._id : "";
      let userInfo = this.req.currentUser;
      let data = this.req.body;
      data.userId = userId;
      //check subscription and listing count
      data.jobId = "#JD" + Math.floor(new Date().getTime() / 1000);

      //check account active or not
      if (!userInfo.isEmailVerified) {
        data.status = "Draft";
        data.endDate = null;
        delete data._id;
        await Jobs.create(data);
        let msg = "VERIFY_EMAIL";
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(this.req.currentUserLang, msg)
        );
      }
      if (data.id) {
        let jobData = await Jobs.findOne({
          _id: ObjectId(data.id),
        }).select(JobProjection.jobProjection);
        if (_.isEmpty(jobData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.BAD_REQUEST_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "JOB_NOT_FOUND"
            )
          );
        }
        data = jobData;
        data.id = this.req.body.id;
        data = { ...data._doc, ...this.req.body };
        data.status = "Draft";
      }
      data.endDate = null;
      delete data._id;
      let jobInfo = {};
      if (this.req.adviser) {
        data.createdBy = this.req.adviser._id;
      } else {
        data.createdBy = userId;
      }
      if (data.id) {
        await Jobs.updateOne({ _id: ObjectId(data.id) }, { $set: data });
        jobInfo = await Jobs.findOne({
          _id: ObjectId(data.id),
        });
      } else {
        jobInfo = await Jobs.create(data);
      }
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "DRAFT_SAVED"
        ),
        { jobInfo }
      );
    } catch (e) {
      console.log(e);
      console.log(
        `\n---------------Employer draft a job ERROR----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        e
      );
    }
  }
  /********************************************************
  @Purpose ansco search or listing
  @param {searchText,id}
  @Return JSON String
********************************************************/
  async anscoSearch() {
    try {
      let fieldsArray = ["searchText", "id"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      let filter = {
        $or: [
          { codeTitle: { $regex: data.searchText, $options: "i" } },
          { code: { $regex: data.searchText, $options: "i" } },
        ],
        status: true,
      };
      if (data.id) {
        filter = {
          _id: ObjectId(data.id),
        };
      }

      let ansco = await masterAnsco
        .find(filter)
        .populate("skillLevel", "levelName");
      if (data.id) {
        let msg = "NOT-FOUND";
        let data = {};
        if (ansco.length) {
          msg = "GET_DETAIL_SUCCESSFULLY";
          data = ansco[0];
        }
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(this.req.currentUserLang, msg),
          data
        );
      }
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        { listing: ansco }
      );
    } catch (e) {
      console.log(
        `\n---------------Employer ansco search ERROR----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        { error: e }
      );
    }
  }

  /********************************************************
  @Purpose get job details by id
  @param id
  @Return JSON String
********************************************************/
  async getJobDetails() {
    try {
      let jobId = this.req.query ? this.req.query.id : "";
      let jobInfo = await Jobs.findOne({
        _id: ObjectId(jobId),
        isDeleted: false,
      }).select(JobProjection.jobProjection);
      if (_.isEmpty(jobInfo)) {
        jobInfo = await JobVersionsSchema.findOne({
          _id: ObjectId(jobId),
          isDeleted: false,
        }).select(JobProjection.jobProjection);
      }
      if (_.isEmpty(jobInfo)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.NOT_FOUND_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "JOB_NOT_FOUND"
          )
        );
      }
      //get company details
      let user = await userSchema.findOne({
        _id: ObjectId(jobInfo.userId),
      });
      //get company details
      let company = await Employer.findOne({
        userId: ObjectId(jobInfo.userId),
      });
      //get applications
      let applications = await AppliedJobs.find({
        jobId: ObjectId(jobInfo._id),
      }).count();
      //convert to ago
      let jobPeriod = await new EmployerService().convertTimestampToAgo(
        jobInfo.startDate ? jobInfo.startDate : jobInfo.createdAt
      );
      let result = {
        ...jobInfo._doc,
        companyName: company?.companyName,
        aboutCompany: company?.aboutCompany,
        profileUrl: user?.photo,
        applications,
        jobPeriod,
      };

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        result
      );
    } catch (e) {
      console.log(
        `\n---------------User get job details ERROR----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        { error: e }
      );
    }
  }

  /********************************************************
  @Purpose get job list
  @param searchText,location,jobType
  @Return JSON String
********************************************************/
  async jobListing() {
    try {
      let userId = this.req.currentUser ? this.req.currentUser._id : "";
      let fieldsArray = [
        "searchText",
        "location",
        "jobType",
        "experience",
        "industry",
        "sortBy",
        "payRate",
        "status",
        "pageSize",
        "page",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.query,
        fieldsArray
      );
      data.userId = ObjectId(userId);
      let { searchText, pageSize, page, sortBy, ...filter } = data;
      page = parseInt(page) || 1;
      pageSize = parseInt(pageSize) || 10;
      filter.isDeleted = false;
      //search criteria
      if (data.searchText) {
        filter["$or"] = [
          { jobTitle: { $regex: data.searchText, $options: "i" } },
          {
            jobId: { $regex: data.searchText, $options: "i" },
          },
        ];
      }
      //experience filter
      if (data.experience) {
        filter.mandatoryExperience = { $regex: data.experience, $options: "i" };
      }
      //experience filter
      if (data.industry) {
        filter.industry = { $regex: data.experience, $options: "i" };
      }
      //payRate filter
      if (data.payRate) {
        filter["$or"] = [
          { payRateFrom: data.payRate },
          { payRateTo: data.payRate },
        ];
        delete filter.payRate;
      }

      //location
      if (data.location) {
        // Remove the '[' and ']' characters from the string
        data.location = data.location.replace(/\[|\]/g, "");
        data.location = data.location.replace(/\"|\"/g, "");

        // Split the cleaned string into an array using ',' as the delimiter
        data.location = data.location.split(",");
        filter.location = { $in: data.location };
      }
      let listing = [];
      if (sortBy == "relevance") {
        let matchCount = { $sum: [0] };
        if (data.searchText) {
          matchCount.$sum = [
            ...matchCount.$sum,
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$jobTitle",
                    regex: data.searchText,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$jobId",
                    regex: data.searchText,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$industry",
                    regex: data.searchText,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$jobType",
                    regex: data.searchText,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$location",
                    regex: data.searchText,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
          ];
        }
        if (data.experience) {
          matchCount.$sum = [
            ...matchCount.$sum,
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$mandatoryExperience",
                    regex: data.experience,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
          ]; //mandatoryExperience
        }
        if (data.industry) {
          matchCount.$sum = [
            ...matchCount.$sum,
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$industry",
                    regex: data.industry,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
          ]; //industry
        }
        if (data.location) {
          matchCount.$sum = [
            ...matchCount.$sum,
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$location",
                    regex: data.location,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
          ]; //location
        }
        if (data.payRate) {
          matchCount.$sum = [
            ...matchCount.$sum,
            {
              $cond: {
                if: {
                  $or: [
                    { payRateFrom: data.payRate },
                    { payRateTo: data.payRate },
                  ],
                },
                then: 1,
                else: 0,
              },
            },
          ]; //payRate
        }
        listing = await Jobs.aggregate([
          {
            $match: filter,
          },
          {
            $project: {
              ...JobProjection.jobProjection,
              matchCount: matchCount,
            },
          },
          {
            $sort: {
              matchCount: -1,
              createdAt: -1,
            },
          },
          {
            $skip: (page - 1) * pageSize,
          },
          {
            $limit: pageSize,
          },
        ]);
      } else {
        //implement sort By
        if (!sortBy) {
          sortBy = await new EmployerService().sorting["latest"];
        } else {
          sortBy = await new EmployerService().sorting[sortBy];
        }
        // delete filter.location;
        delete filter.userId;
        delete filter.isDeleted;

        listing = await Jobs.aggregate([
          {
            $match: {
              userId: ObjectId(userId),
              isDeleted: false,
              $or: [
                {
                  createdBy: ObjectId(userId),
                },
                {
                  isApproved: true,
                },
              ],
            },
          },
          { $match: filter },
          {
            $facet: {
              data: [
                {
                  $project: {
                    ...JobProjection.jobProjection,
                  },
                },
                { $sort: sortBy },
                { $skip: (page - 1) * pageSize },
                { $limit: pageSize },
              ],
              total: [{ $count: "total" }],
            },
          },
        ]);
      }
      //initialize emploer service method to convert timestamp to ago
      let total = listing[0].total[0] ? listing[0].total[0].total : 0;
      listing = listing[0].data;
      let period = [];
      listing.forEach((element) => {
        period.push(
          new Promise((resolve, reject) => {
            (async () => {
              element.jobPeriod =
                await new EmployerService().convertTimestampToAgo(
                  element.createdAt
                );
              resolve(element);
            })();
          })
        );
      });
      Promise.all(period);
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        { listing, total, page: parseInt(page), pageSize: parseInt(pageSize) }
      );
    } catch (e) {
      console.log(e);
      console.log(
        `\n---------------Employer job Listing ERROR----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        { error: e }
      );
    }
  }

  /********************************************************
  @Purpose get job list
  @param check editJobValidator
  @Return JSON String
********************************************************/
  async editJob() {
    try {
      let userId = this.req.currentUser ? this.req.currentUser._id : "";
      let jobId = this.req.body.id;
      let data = this.req.body;
      let jobInfo = await Jobs.findOne({
        _id: ObjectId(jobId),
        isDeleted: false,
      }).select(JobProjection.jobProjection);
      if (_.isEmpty(jobInfo)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.NOT_FOUND_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      }
      data.isRequestSent = false;
      await Jobs.updateOne({ _id: jobId }, { $set: data });
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "DATA_UPDATED_SUCCESSFULLY"
        )
      );
    } catch (e) {
      console.log(
        `\n---------------User get job details ERROR----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        { error: e }
      );
    }
  }

  /********************************************************
  @Purpose jobApplication listing for employer job
  @param ?id & search & sortBy & page & pageSize
  @Return JSON String
********************************************************/
  async jobApplicantListing() {
    try {
      let userId = this.req.currentUser ? this.req.currentUser._id : "";

      let data = this.req.query;
      if (!data.jobId) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "ID_REQUIRED"
          )
        );
      }
      //get saved jobs count
      let totalSaved = await applicantswishlistjobsSchema.countDocuments({
        jobId: ObjectId(data.jobId),
        type: "Saved",
      });
      //get listing start and end date
      let subscribed = await new EmployerService().getSubscriptionList(userId);
      let startDate = null;
      let endDate = null;
      if (subscribed.length) {
        startDate = subscribed[0].startDate;
        endDate = subscribed[0].endDate;
      }
      data.jobId = ObjectId(data.jobId);
      data.page = data.page ? data.page : 1;
      data.pageSize = data.pageSize ? data.pageSize : 10;
      let { page, pageSize, sortBy, immigrationStatus, ...filter } = data;
      if (data.searchText) {
        filter["$or"] = [
          { email: { $regex: data.searchText, $options: "i" } },
          { applicationId: { $regex: data.searchText, $options: "i" } },
          { firstName: { $regex: data.searchText, $options: "i" } },
          { lastName: { $regex: data.searchText, $options: "i" } },
          { addressCity: { $regex: data.searchText, $options: "i" } },
          { position: { $regex: data.searchText, $options: "i" } },
          { employerStatus: { $regex: data.searchText, $options: "i" } },
        ];
      }
      delete filter.searchText;
      if (!sortBy) {
        sortBy = await new EmployerService().sorting["oldest"];
      } else {
        sortBy = await new EmployerService().sorting[sortBy];
      }
      if (immigrationStatus) {
        filter.immigrationStatus = immigrationStatus;
      }
      // console.log(filter, sortBy);
      let jobInfo = await AppliedJobs.find(filter)
        .sort(sortBy)
        .skip((page - 1) * pageSize)
        .limit(pageSize);
      let today = new Date();
      today.setHours(0, 0, 0, 0);
      let tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      jobInfo = jobInfo.map((e) => {
        e._doc.isLatest = false;
        if (e.createdAt < tomorrow.getTime() && e.createdAt > today.getTime()) {
          e._doc.isLatest = true;
          return e;
        }
        return e;
      });
      let result = {
        listing: jobInfo,
        total: jobInfo.length,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalSaved,
        startDate,
        endDate,
      };

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        result
      );
    } catch (e) {
      console.log(
        `\n---------------User get job details ERROR----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        { error: e }
      );
    }
  }

  /********************************************************
  @Purpose delete job
  @param ?id
  @Return JSON String
********************************************************/
  async jobDelete() {
    try {
      let userId = this.req.currentUser ? this.req.currentUser._id : "";
      let jobId = this.req.query.id;
      let jobInfo = await Jobs.findOne({
        _id: ObjectId(jobId),
        isDeleted: false,
      }).select(JobProjection.jobProjection);

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
      if (_.isEmpty(jobInfo)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.NOT_FOUND_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      }
      await Jobs.updateOne({ _id: jobId }, { $set: { isDeleted: true } });

      // get all applied applicants
      let appliedApplicants = await AppliedJobs.find({ jobId: jobId });
      // log notification to admin after job delete

      let employerInfo = await userSchema.findOne({ _id: ObjectId(userId) });

      // get company name
      let company = await Employer.findOne({ userId: ObjectId(userId) });

      //trigger email to employer
      let replaceDataObj = {
        companyName: company?.companyName,
        jobTitle: jobInfo?.jobTitle,
      };
      await new Email().sendNotification({
        emailId: employerInfo.email,
        emailKey: "job_deleted_mail_to_employer",
        replaceDataObj,
      });

      let notificationData = [
        {
          senderId: userId,
          event: "Job Deleted",
          log: `${company.companyName} (${employerInfo.email}) has deleted ${jobInfo.jobTitle} job`,
          data: {
            id: jobInfo._id,
            type: "job",
          },
          isVisibleToAdmin: true,
          sendEmailTo: adminInfo,
          sendEmailDataObj: {
            emailKey: "job_deleted_mail_to_admin",
            replaceDataObj: {
              companyName: company?.companyName,
              jobTitle: jobInfo?.jobTitle,
              adminName: `Admin`,
            },
          },
        },
      ];

      if (!_.isEmpty(appliedApplicants)) {
        await JobsController.asyncForEach(appliedApplicants, async (data) => {
          let applicantObj = {
            senderId: userId,
            receiverId: data.userId,
            event: "Job Deleted",
            log: `${jobInfo.jobTitle} is deleted by ${company.companyName} (${employerInfo.email})`,
            data: {
              id: jobInfo._id,
              type: "job",
            },
            sendEmailTo: [{ emailId: data.email }],
            subject: "Job Deleted - Job Check To",
            sendEmailDataObj: {
              emailKey: "job_deleted_mail_to_applicant",
              replaceDataObj: {
                companyName: company?.companyName,
                jobTitle: jobInfo?.jobTitle,
                applicantName: `${data.firstName} ${data.lastName}`,
              },
            },
          };
          notificationData.push(applicantObj);
        });
      }

      // hard delete associated applicants with this job
      await AppliedJobs.deleteMany({ jobId: jobId });

      // hard delete associated chats with this job
      await UserChat.deleteMany({ jobId: jobId });

      new UserService().logUserNotifications(notificationData);

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "JOB_DELETED"
        )
      );
    } catch (e) {
      console.log(
        `\n---------------Employer delete job ERROR----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        { error: e }
      );
    }
  }
  /********************************************************
  @purpose Employer download report
  @params 
          {
          searchText,jobId,filter
          }
  @return JSON String
  ********************************************************/
  async employerDownloadReport() {
    try {
      let userId = this.req.currentUser ? this.req.currentUser._id : "";

      let fieldsArray = ["searchText", "sortBy", "jobId", "type", "webUrl"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      let { jobId, sortBy, type, webUrl, ...filter } = data;

      let jobDetails = await Jobs.findOne({
        _id: ObjectId(jobId),
      }).select({
        jobTitle: 1,
        jobId: 1,
        mandatoryExperience: 1,
        mandatoryQualificationName: 1,
      });
      if (_.isEmpty(jobDetails)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.NOT_FOUND_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      }
      jobDetails = jobDetails._doc;
      delete jobDetails._id;
      //get saved jobs count
      let totalSaved = await applicantswishlistjobsSchema.countDocuments({
        jobId: ObjectId(data.jobId),
        type: "Saved",
      });
      //get listing start and end date
      let startDate = null;
      let endDate = null;
      if (jobDetails.subscriptionId) {
        const subscriptionData = await Subscriptions.findOne({
          subscriptionId: ObjectId(jobDetails.subscriptionId),
        }).sort({ createdAt: -1 });
        if (!_.isEmpty(subscriptionData)) {
          startDate = subscriptionData.startDate;
          endDate = subscriptionData.endDate;
        } else {
          let subscribed = await new EmployerService().getSubscriptionList(
            userId
          );

          if (subscribed.length) {
            startDate = subscribed[0].startDate;
            endDate = subscribed[0].endDate;
          }
        }
      } else {
        let subscribed = await new EmployerService().getSubscriptionList(
          userId
        );

        if (subscribed.length) {
          startDate = subscribed[0].startDate;
          endDate = subscribed[0].endDate;
        }
      }
      if (data.searchText) {
        filter["$or"] = [
          { email: { $regex: data.searchText, $options: "i" } },
          { applicationId: { $regex: data.searchText, $options: "i" } },
          { firstName: { $regex: data.searchText, $options: "i" } },
          { lastName: { $regex: data.searchText, $options: "i" } },
        ];
      }
      delete filter.searchText;
      if (!sortBy) {
        sortBy = await new EmployerService().sorting["oldest"];
      } else {
        sortBy = await new EmployerService().sorting[sortBy];
      }

      filter.jobId = ObjectId(jobId);

      let experience = jobDetails.mandatoryExperience.match(/\d+/g)
        ? jobDetails.mandatoryExperience.match(/\d+/g)?.map(Number)
        : [0, 1];
      let jobInfo = await AppliedJobs.aggregate([
        { $match: filter },
        {
          $project: {
            _id: 0,
            ApplicantName: {
              profile: "$profileUrl",
              name: { $concat: ["$firstName", "$lastName"] },
            },
            shortListed: {
              $cond: {
                if: { $eq: ["$employerStatus", "Shortlisted"] },
                then: "Yes",
                else: "No",
              },
            },
            modeOfContact: "$modeOfContactByEmployer",
            comments: "$note",
            dateOfContact: "$updatedAt",
            SpecificJobRequirements: "No",
            ExperienceMet: {
              $cond: {
                if: {
                  $anyElementTrue: {
                    $map: {
                      input: "$experienceDetails",
                      as: "obj",
                      in: {
                        $and: [
                          { $gte: ["$$obj.duration", experience[0]] },
                          { $lte: ["$$obj.duration", experience[1]] },
                        ],
                      },
                    },
                  },
                },
                then: "Yes",
                else: "No",
              },
            },
            QualificationMet: {
              $cond: {
                if: {
                  $in: [
                    jobDetails.mandatoryQualificationName,
                    {
                      $map: {
                        input: "$qualificationDetails",
                        as: "item",
                        in: "$$item.qualificationName",
                      },
                    },
                  ],
                },
                then: "Yes",
                else: "No",
              },
            },
            ImmigrationStatus: {
              $cond: {
                if: { $ne: ["$immigrationStatus", null] },
                then: "Yes",
                else: "No",
              },
            },
            immigrationName: { $ifNull: ["$immigrationStatus", null] },
            createdAt: 1,
            experienceDetails: 1,
          },
        },
        { $sort: sortBy },
      ]);
      let columns = [
        "ApplicantName",
        "ImmigrationStatus",
        "QualificationMet",
        "ExperienceMet",
        "SpecificJobRequirements",
        "shortListed",
        "dateOfContact",
        "modeOfContact",
        "comments",
      ];
      let fileType = type == "pdf" ? "pdf" : "csv";
      jobInfo = jobInfo.map(async (e, index) => {
        e.dateOfContact = await new EmployerService().getDateTime(
          e.dateOfContact,
          "DD MMMM YYYY"
        );
        e.ApplicantName.profile = config.s3Endpoint + e.ApplicantName?.profile;
        e.sr = index + 1;
        e.modeOfContact = e.modeOfContact ? e.modeOfContact : "-";
        e.comments = e.comments ? e.comments : "-";
        return e;
      });
      //get search appearances
      let appearedInSearch = await previousSearchSchema.aggregate([
        {
          $match: {
            jobId: ObjectId(jobId),
          },
        },
        {
          $group: {
            _id: "$jobId",
            count: { $push: "$viewsCount" },
          },
        },
        {
          $project: {
            count: { $sum: "$count" },
          },
        },
      ]);
      //get companyProfile
      let company = await Employer.findOne({ userId: ObjectId(userId) });
      let content = {
        listedBy: company.companyName ? company.companyName : "-",
        numberOfApplicants: jobInfo.length,
        jobTitle: jobDetails.jobTitle,
        totalPublicView: appearedInSearch.length
          ? appearedInSearch[0].count
          : 0,
        listingStartDate: startDate
          ? await new EmployerService().getDateTime(
            new Date(startDate).getTime(),
            "DD MMMM YYYY"
          )
          : null,
        listingEndDate: endDate
          ? await new EmployerService().getDateTime(
            new Date(endDate).getTime(),
            "DD MMMM YYYY"
          )
          : null,
        totalSaved: totalSaved,
        appearedInSearch: appearedInSearch.length
          ? appearedInSearch[0].count
          : 0,
        jobId: jobDetails.jobId,
        webUrl,
        reportTime: await new EmployerService().getDateTime(
          new Date().getTime(),
          "h.mmA, DD MMMM YYYY"
        ),
      };
      let download = {};

      await Promise.all(jobInfo).then(async (data) => {
        console.log(data);
        if (fileType == "pdf") {
          content.data = data;
          download = await new CommonService().generatePdf(
            columns,
            content,
            "applicants.html",
            "Applicant List",
            "landscape"
          );
        }
        if (fileType == "csv") {
          download = await new CommonService().downloadFile(
            columns,
            "Applicant",
            fileType,
            data
          );
        }
      });

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "FILE_DOWNLOADED"
        ),
        download
      );
    } catch (e) {
      console.log(e);
      console.log(
        `\n---------------Employer Download report ERROR----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        { error: e }
      );
    }
  }
  /********************************************************
  @purpose Employer download report
  @params 
          {
          searchText,jobId,filter
          }
  @return JSON String
  ********************************************************/
  async employerViewReport() {
    try {
      let userId = this.req.currentUser ? this.req.currentUser._id : "";

      let fieldsArray = ["searchText", "sortBy", "jobId"];
      let data = await new RequestBody().processRequestBody(
        this.req.query,
        fieldsArray
      );

      let { jobId, sortBy, type, ...filter } = data;
      if (data.searchText) {
        filter["$or"] = [
          { email: { $regex: data.searchText, $options: "i" } },
          { applicationId: { $regex: data.searchText, $options: "i" } },
          { firstName: { $regex: data.searchText, $options: "i" } },
          { lastName: { $regex: data.searchText, $options: "i" } },
          { addressCity: { $regex: data.searchText, $options: "i" } },
          { position: { $regex: data.searchText, $options: "i" } },
          { employerStatus: { $regex: data.searchText, $options: "i" } },
        ];
      }
      delete filter.searchText;
      if (!sortBy) {
        sortBy = await new EmployerService().sorting["oldest"];
      } else {
        sortBy = await new EmployerService().sorting[sortBy];
      }

      filter.jobId = ObjectId(jobId);
      let jobDetails = await Jobs.findOne({ _id: ObjectId(jobId) }).select({
        jobTitle: 1,
        jobId: 1,
        mandatoryExperience: 1,
        mandatoryQualificationName: 1,
      });
      if (_.isEmpty(jobDetails)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.NOT_FOUND_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
          )
        );
      }
      jobDetails = jobDetails._doc;
      delete jobDetails._id;
      let experience = jobDetails.mandatoryExperience.match(/\d+/g)
        ? jobDetails.mandatoryExperience.match(/\d+/g)?.map(Number)
        : [0, 1];
      //get saved jobs count
      let totalSaved = await applicantswishlistjobsSchema.countDocuments({
        jobId: ObjectId(data.jobId),
        type: "Saved",
      });
      //get listing start and end date
      let startDate = null;
      let endDate = null;
      if (jobDetails.subscriptionId) {
        const subscriptionData = await Subscriptions.findOne({
          subscriptionId: ObjectId(jobDetails.subscriptionId),
        }).sort({ createdAt: -1 });
        if (!_.isEmpty(subscriptionData)) {
          startDate = new Date(subscriptionData.startDate).getTime();
          endDate = new Date(subscriptionData.endDate).getTime();
        } else {
          let subscribed = await new EmployerService().getSubscriptionList(
            userId
          );

          if (subscribed.length) {
            startDate = new Date(subscribed[0].startDate).getTime();
            endDate = new Date(subscribed[0].endDate).getTime();
          }
        }
      } else {
        let subscribed = await new EmployerService().getSubscriptionList(
          userId
        );

        if (subscribed.length) {
          startDate = new Date(subscribed[0].startDate).getTime();
          endDate = new Date(subscribed[0].endDate).getTime();
        }
      }

      let jobInfo = await AppliedJobs.aggregate([
        { $match: filter },
        {
          $project: {
            _id: 0,
            ApplicantName: {
              profile: "$profileUrl",
              name: { $concat: ["$firstName", "$lastName"] },
            },
            shortListed: {
              $cond: {
                if: { $eq: ["$employerStatus", "Shortlisted"] },
                then: "Yes",
                else: "No",
              },
            },
            modeOfContact: "$modeOfContactByEmployer",
            comments: "$note",
            dateOfContact: "$updatedAt",
            SpecificJobRequirements: "No",
            ExperienceMet: {
              $cond: {
                if: {
                  $anyElementTrue: {
                    $map: {
                      input: "$experienceDetails",
                      as: "obj",
                      in: {
                        $and: [
                          { $gte: ["$$obj.duration", experience[0]] },
                          { $lte: ["$$obj.duration", experience[1]] },
                        ],
                      },
                    },
                  },
                },
                then: "Yes",
                else: "No",
              },
            },
            QualificationMet: {
              $cond: {
                if: {
                  $in: [
                    jobDetails.mandatoryQualificationName,
                    {
                      $map: {
                        input: "$qualificationDetails",
                        as: "item",
                        in: "$$item.qualificationName",
                      },
                    },
                  ],
                },
                then: "Yes",
                else: "No",
              },
            },
            ImmigrationStatus: {
              $cond: {
                if: { $ne: ["$immigrationStatus", null] },
                then: "Yes",
                else: "No",
              },
            },
            immigrationName: { $ifNull: ["$immigrationStatus", null] },
            createdAt: 1,
            experienceDetails: 1,
          },
        },
        { $sort: sortBy },
      ]);
      //get search appearances
      let appearedInSearch = await previousSearchSchema.aggregate([
        {
          $match: {
            jobId: ObjectId(jobId),
          },
        },
        {
          $group: {
            _id: "$jobId",
            count: { $push: "$viewsCount" },
          },
        },
        {
          $project: {
            count: { $sum: "$count" },
          },
        },
      ]);
      //get companyProfile
      let company = await Employer.findOne({ userId: ObjectId(userId) });
      let content = {
        listedBy: company.companyName ? company.companyName : "-",
        numberOfApplicants: jobInfo.length,
        jobTitle: jobDetails.jobTitle,
        totalPublicView: appearedInSearch.length
          ? appearedInSearch[0].count
          : 0,
        listingStartDate: startDate ? startDate : null,
        listingEndDate: endDate ? endDate : null,
        totalSaved: totalSaved,
        appearedInSearch: appearedInSearch.length
          ? appearedInSearch[0].count
          : 0,
        jobId: jobDetails.jobId,
      };

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        { listing: jobInfo, content }
      );
    } catch (e) {
      console.log(e);
      console.log(
        `\n---------------Employer Download report ERROR----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        { error: e }
      );
    }
  }

  /********************************************************
  @Purpose get job list of the adviser
  @param searchText,location,jobType
  @Return JSON 
********************************************************/
  async adviserJobs() {
    try {
      let userId = this.req.currentUser ? this.req.currentUser._id : "";
      let fieldsArray = [
        "searchText",
        "location",
        "jobType",
        "experience",
        "industry",
        "sortBy",
        "payRate",
        "status",
        "pageSize",
        "page",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.query,
        fieldsArray
      );

      //data.userId = ObjectId(userId);
      let { searchText, pageSize, page, sortBy, ...filter } = data;
      filter.createdBy = ObjectId(userId);

      page = page ? parseInt(page) : 1;
      pageSize = pageSize ? parseInt(pageSize) : 10;
      filter.isDeleted = false;
      //search criteria
      if (data.searchText) {
        filter["$or"] = [
          { jobTitle: { $regex: data.searchText, $options: "i" } },
          {
            jobId: { $regex: data.searchText, $options: "i" },
          },
        ];
      }
      //experience filter
      if (data.experience) {
        filter.mandatoryExperience = { $regex: data.experience, $options: "i" };
      }
      //experience filter
      if (data.industry) {
        filter.industry = { $regex: data.experience, $options: "i" };
      }
      //payRate filter
      if (data.payRate) {
        filter["$or"] = [
          { payRateFrom: data.payRate },
          { payRateTo: data.payRate },
        ];
        delete filter.payRate;
      }

      //location
      if (data.location) {
        // Remove the '[' and ']' characters from the string
        data.location = data.location.replace(/\[|\]/g, "");
        data.location = data.location.replace(/\"|\"/g, "");

        // Split the cleaned string into an array using ',' as the delimiter
        data.location = data.location.split(",");
        filter.location = { $in: data.location };
      }
      let listing = [];
      if (sortBy == "relevance") {
        let matchCount = { $sum: [0] };
        if (data.searchText) {
          matchCount.$sum = [
            ...matchCount.$sum,
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$jobTitle",
                    regex: data.searchText,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$jobId",
                    regex: data.searchText,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$industry",
                    regex: data.searchText,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$jobType",
                    regex: data.searchText,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$location",
                    regex: data.searchText,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
          ];
        }
        if (data.experience) {
          matchCount.$sum = [
            ...matchCount.$sum,
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$mandatoryExperience",
                    regex: data.experience,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
          ]; //mandatoryExperience
        }
        if (data.industry) {
          matchCount.$sum = [
            ...matchCount.$sum,
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$industry",
                    regex: data.industry,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
          ]; //industry
        }
        if (data.location) {
          matchCount.$sum = [
            ...matchCount.$sum,
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$location",
                    regex: data.location,
                    options: "i",
                  },
                },
                then: 1,
                else: 0,
              },
            },
          ]; //location
        }
        if (data.payRate) {
          matchCount.$sum = [
            ...matchCount.$sum,
            {
              $cond: {
                if: {
                  $or: [
                    { payRateFrom: data.payRate },
                    { payRateTo: data.payRate },
                  ],
                },
                then: 1,
                else: 0,
              },
            },
          ]; //payRate
        }
        listing = await Jobs.aggregate([
          {
            $match: filter,
          },
          {
            $project: {
              ...JobProjection.jobProjection,
              matchCount: matchCount,
            },
          },
          {
            $sort: {
              matchCount: -1,
              createdAt: -1,
            },
          },
          {
            $skip: (page - 1) * pageSize,
          },
          {
            $limit: pageSize,
          },
        ]);
      } else {
        //implement sort By
        if (!sortBy) {
          sortBy = await new EmployerService().sorting["latest"];
        } else {
          sortBy = await new EmployerService().sorting[sortBy];
        }
        listing = await Jobs.aggregate([
          { $match: filter },
          {
            $lookup: {
              from: "employers",
              localField: "userId",
              foreignField: "userId",
              as: "employerInfo",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userInfo",
            },
          },
          {
            $addFields: {
              companyName: { $arrayElemAt: ["$employerInfo.companyName", 0] },
              profileUrl: { $arrayElemAt: ["$userInfo.companyName", 0] },
            },
          },
          {
            $project: {
              companyName: 1,
              ...JobProjection.jobProjection,
            },
          },
          {
            $sort: sortBy,
          },
          { $skip: (page - 1) * pageSize },
          {
            $limit: pageSize,
          },
        ]);
      }
      //initialize emploer service method to convert timestamp to ago
      let total = (await Jobs.find(filter)).length;
      let period = [];
      listing.forEach((element) => {
        period.push(
          new Promise((resolve, reject) => {
            (async () => {
              element.jobPeriod =
                await new EmployerService().convertTimestampToAgo(
                  element.createdAt
                );
              resolve(element);
            })();
          })
        );
      });
      Promise.all(period);
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        { listing, total, page: parseInt(page), pageSize: parseInt(pageSize) }
      );
    } catch (e) {
      console.log(e);
      console.log(
        `\n---------------Adviser job Listing ERROR----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        { error: e }
      );
    }
  }
  static async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}
module.exports = JobsController;
