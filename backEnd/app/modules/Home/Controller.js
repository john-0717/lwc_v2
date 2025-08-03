const _ = require("lodash");
const Controller = require("../Base/Controller");
const Globals = require("../../../configs/Globals");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const config = require("../../../configs/configs");
const { HTTP_CODE, EMAIL_TEMPLATE_KEYS } = require("../../services/constant");
const ObjectId = require("mongoose").Types.ObjectId;
const homeProjection = require("./Projection.json");
const JobProjection = require("../Articles/Projection.json");
const { AppliedJobs, Jobs } = require("../Articles/Schema");
const { Employer } = require("../Employer/Schema");
const { PrayerRequest } = require("../PrayerRequest/Schema");
const Faqs = require("../FaqManagement/Schema").Faqs;
const testimonial = require("../TestimonialManagement/Schema").testimonials;
const {
  applicantSchema,
  searchedKeywordsSchema,
} = require("../Applicant/Schema");
const EmployerService = require("../../services/Employer");
const { CMSPages } = require("../cmsPagesManagement/Schema");
const masterSubscriptions =
  require("../MasterDataManagement/Schema").masterSubscriptions;
const FaqCategories = require("../FaqCategoryManagement/Schema").FaqCategories;
class HomeController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
	@Purpose get partner and statistics
  	@Return JSON String
********************************************************/
  async partnerAndStatistics() {
    try {
      //statistics of home page
      let shortListed = (
        await AppliedJobs.find({
          employerStatus: "Shortlisted",
        })
      ).length;
      let applications = (await AppliedJobs.find()).length;
      let totalJobs = (
        await Jobs.find({
          isDeleted: false,
          status: "Published",
        })
      ).length;
      let shortListedRatio = 0;

      let totalEmployer = (await Employer.find({ isDeleted: false })).length;
      let totalApplicant = (await applicantSchema.find({ isDeleted: false }))
        .length;
      if (totalJobs && totalEmployer && shortListed) {
        shortListedRatio = (applications / totalJobs) * 100;
      }
      //partner listing
      const partners = await PrayerRequest.find({ status: true });
      let result = {
        listing: partners,
        totalJobs: await new EmployerService().convertNumberToFormat(totalJobs),
        totalEmployer,
        shortListed: await new EmployerService().convertNumberToFormat(
          shortListed
        ),
        shortListedRatio,
        totalApplicant: await new EmployerService().convertNumberToFormat(
          totalApplicant
        ),
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
      console.log(e);
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
	@Purpose get recent 9 jobs , popular searched key words
  	@Return JSON String
********************************************************/
  async homePageRecentJob() {
    try {
      //process req.query params
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
        "keywords",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.query,
        fieldsArray
      );
      data.status = "Published";
      let { searchText, pageSize, page, sortBy, keywords, ...filter } = data;
      page = page ? parseInt(page) : 1;
      pageSize = pageSize ? parseInt(pageSize) : 10;
      filter.isDeleted = false;
      //search criteria
      if (data.searchText) {
        filter.jobTitle = { $regex: data.searchText, $options: "i" };
      }
      //experience filter
      if (data.experience) {
        delete filter.experience;
        // Remove the '[' and ']' characters from the string
        data.experience = data.experience.replace(/[\[\]"']/g, "");
        // Split the cleaned string into an array using ',' as the delimiter
        data.experience = data.experience.split(",");

        filter.mandatoryExperience = {
          $in: data.experience,
        };
      }
      //experience filter
      if (data.industry) {
        filter.industry = { $regex: data.industry, $options: "i" };
      }
      let payRateData;
      if (data.payRate) {
        payRateData = data.payRate.split("-");
      }

      //payRate filter
      if (data.payRate) {
        filter["$and"] = [
          { payRateFrom: { $gte: parseInt(payRateData[0]) } },
          { payRateTo: { $lte: parseInt(payRateData[1]) } },
        ];
        delete filter.payRate;
      }
      //location
      if (data.location) {
        filter.location = { $regex: data.location, $options: "i" };
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
            $lookup: {
              from: "employers",
              localField: "userId",
              foreignField: "userId",
              as: "company",
            },
          },
          {
            $unwind: "$company",
          },
          {
            $project: {
              ...JobProjection.jobProjection,
              matchCount: matchCount,
              profileUrl: "$company.profileUrl",
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
          {
            $collation: { locale: "en", strength: 2 },
          },
        ]).collation({ locale: "en", strength: 2 });
      } else {
        if (!sortBy) {
          sortBy = await new EmployerService().sorting["latest"];
        } else {
          sortBy = await new EmployerService().sorting[sortBy];
        }
        listing = await Jobs.aggregate([
          {
            $match: filter,
          },
          {
            $lookup: {
              from: "employers",
              localField: "userId",
              foreignField: "userId",
              as: "company",
            },
          },
          {
            $unwind: "$company",
          },
          {
            $project: {
              ...JobProjection.jobProjection,
              profileUrl: "$company.profileUrl",
            },
          },
          {
            $sort: sortBy,
          },
          {
            $skip: (page - 1) * pageSize,
          },
          {
            $limit: pageSize,
          },
        ]).collation({ locale: "en", strength: 2 });
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
      let result = {
        listing,
        page,
        pageSize,
        total,
      };
      if (data.keywords) {
        let keywords = await searchedKeywordsSchema
          .find()
          .sort({ searchCount: -1 })
          .limit(6);
        keywords = keywords.map((e) => {
          return e.keyword;
        });
        result.keywords = keywords;
      }

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
      console.log(e);
      console.log(
        "\n------------home page recentjobs error------\n",
        e,
        "\n----------\n"
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
	@Purpose get cms page data by slug
  	@Return JSON String
********************************************************/
  async homeCmsPage() {
    try {
      //process req.query params
      let fieldsArray = ["slug"];
      let data = await new RequestBody().processRequestBody(
        this.req.query,
        fieldsArray
      );
      if (data.slug) {
        let cms = await CMSPages.find({ slug: data.slug, isDeleted: false });
        cms = cms.length ? cms[0] : null;
        if (cms) {
          return new CommonService().handleResolve(
            this.res,
            HTTP_CODE.SUCCESS,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "GET_DETAIL_SUCCESSFULLY"
            ),
            cms
          );
        } else {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.BAD_REQUEST_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "BAD_REQUEST"
            )
          );
        }
      } else {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "BAD_REQUEST"
          )
        );
      }
    } catch (e) {
      console.log(
        "\n------------home cms page error------\n",
        e,
        "\n----------\n"
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
    @Purpose Faq Listing
    @Parameter
    {
       "page":1,
       "pagesize":20,
       "search":""
    }
    @Return JSON String
    ********************************************************/
  async faqListing() {
    try {
      // page
      let where = { status: true, isDeleted: false };
      // for searching
      if (this.req.query.search) {
        where = {
          ...where,
          question: {
            $regex: Globals.escapeRegExp(this.req.query.search),
            $options: "i",
          },
        };
      }

      let faqList = await Faqs.aggregate([
        { $match: where },
        {
          $lookup: {
            from: "faqcategories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $unwind: "$categoryDetails",
        },
        {
          $group: {
            _id: "$category",
            categoryName: { $first: "$categoryDetails.category" },
            count: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
      ]);

      if (_.isEmpty(faqList)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NO_DATA_FOUND"
          )
        );
      }
      /********************************************************
          Generate and return response
          ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        faqList,
        null
      );
    } catch (error) {
      /********************************************************
           Manage Error logs and Response
           ********************************************************/
      console.log("error faqList()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
    @Purpose Testimonial Listing
    @Parameter
    {
    }
    @Return JSON String
    ********************************************************/
  async testimonialListing() {
    try {
      let sorting = { createdAt: -1 };
      let where = { isDeleted: false };

      // latest 10

      let testimonialList = await testimonial.aggregate([
        { $match: where },
        { $sort: sorting },
      ]);

      if (_.isEmpty(testimonialList)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NO_DATA_FOUND"
          )
        );
      }
      /********************************************************
          Generate and return response
          ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        testimonialList
      );
    } catch (error) {
      /********************************************************
           Manage Error logs and Response
           ********************************************************/
      console.log("error testimonialList()", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        )
      );
    }
  }
}
module.exports = HomeController;
