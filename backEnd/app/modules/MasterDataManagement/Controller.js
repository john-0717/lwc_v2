const Controller = require("../Base/Controller");
const Globals = require("../../../configs/Globals");
const MasterSubscriptions = require("./Schema").masterSubscriptions;
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const Email = require("../../services/Email");
const { HTTP_CODE } = require("../../services/constant");
const { sortBy } = require("lodash");
const models = require("../../services/Models");
const {
  masterPromoCodes,
  masterHourlyRate,
  masterYearlyRate,
  masterExperience,
} = require("./Schema");
const ObjectId = require("mongoose").Types.ObjectId;
const _ = require("lodash");
const Form = require("../../services/Form");
const File = require("../../services/File");
var xlsx2json = require("xlsx2json");
const fs = require("fs");
const MasterIndustry = require("./Schema").masterIndustry;
const MasterSkills = require("./Schema").masterSkills;
const MasterSkillLevels = require("./Schema").masterSkillLevels;
const MasterAnsco = require("./Schema").masterAnsco;
const MasterStates = require("./Schema").masterStates;
const MasterCities = require("./Schema").masterCities;
const { parse } = require("csv-parse");
const EmployerService = require("../../services/Employer");
const frs = require("fs").promises;
const XLSX = require("xlsx");
class MasterDataController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
    @Purpose Subscription Listing
    @Parameter
    {
       "page":1,
       "pagesize":10,
       "sort":{},
       "search":""
    }
    @Return JSON String
    ********************************************************/
  async subscriptionListing() {
    try {
      // page
      let page = this.req.query.page ? this.req.query.page : 1;
      let pageSize = this.req.query.pageSize ? this.req.query.pageSize : 10;

      let sorting = { createdAt: -1 };
      if (!_.isEmpty(this.req.query.sort))
        sorting = JSON.parse(this.req.query.sort);

      let skip = (parseInt(page) - 1) * parseInt(pageSize);
      let where = {};
      // for searching
      if (this.req.query.search) {
        where = {
          name: {
            $regex: Globals.escapeRegExp(this.req.query.search),
            $options: "i",
          },
        };
      } else {
        where = {};
      }

      let subscriptionList = await MasterSubscriptions.aggregate([
        { $match: where },
        {
          $facet: {
            count: [
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            data: [
              { $skip: skip },
              { $limit: parseInt(pageSize) },
              { $sort: sorting },
            ],
          },
        },
      ]);
      console.log(subscriptionList);

      if (_.isEmpty(subscriptionList[0].data)) {
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
        subscriptionList[0].data,
        null,
        page,
        pageSize,
        subscriptionList[0].count[0].count
      );
    } catch (error) {
      /********************************************************
         Manage Error logs and Response
         ********************************************************/
      console.log("error subscriptionlisting()", error);
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
    @Purpose Edit Subscription
    @Parameter
    {
        "name":""
        "description":""
        "price":""
        "maxNumListing":""
        "isUnlimitedListing":""
        "planDuration":""
        "topSearch":""
    }
    @Return JSON String
    ********************************************************/
  async editSubscription() {
    try {
      /********************************************************
             Get current admin user id
            ********************************************************/
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";

      let fieldsArray = [
        "description",
        "price",
        "maxNumListing",
        "isUnlimitedListing",
        "planDuration",
        "listingDuration",
        "topSearch",
        "id",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      data.modifiedBy = currentUser;

      let updateData = await MasterSubscriptions.updateOne(
        { _id: data.id },
        {
          $set: data,
        }
      );

      if (updateData.matchedCount == 0) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DATA_NOT_UPDATED"
          )
        );
      }

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "DATA_UPDATED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "INTERNAL_SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose Add Master Data  
     @Parameter {
        "name":"",
        "status":"",
        "tabName":""
     }
     @Return JSON String
     ********************************************************/
  async addMaster() {
    try {
      /********************************************************
               Get current admin user id
        ********************************************************/
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";
      /********************************************************
          Generate Field Array and process the request body
        ********************************************************/
      let fieldsArray;
      if (this.req.body.tabName == "masterAddons") {
        fieldsArray = ["name", "price", "status", "duration", "tabName"];
      } else if (
        this.req.body.tabName == "masterHourlyRate" ||
        this.req.body.tabName == "masterYearlyRate"
      ) {
        fieldsArray = ["from", "to", "status", "tabName"];
      } else if (this.req.body.tabName == "masterSkillLevel") {
        fieldsArray = ["levelName", "status", "tabName"];
      } else {
        fieldsArray = ["name", "status", "tabName", "companyName"];
      }

      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      data.createdBy = currentUser;

      let modelName = data.tabName;

      if (this.req.body.tabName == "masterHourlyRate") {
        let isNameAvailable = await masterHourlyRate.find({
          from: data.from,
          to: data.to,
        });
        if (!_.isEmpty(isNameAvailable)) {
          return new CommonService().handleResolve(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "PAYRATE_ALREADY_EXIST"
            )
          );
        }
      } else if (this.req.body.tabName == "masterYearlyRate") {
        let isNameAvailable = await masterYearlyRate.find({
          from: data.from,
          to: data.to,
        });
        if (!_.isEmpty(isNameAvailable)) {
          return new CommonService().handleResolve(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "PAYRATE_ALREADY_EXIST"
            )
          );
        }
      } else if (this.req.body.tabName == "masterSkillLevel") {
        let isNameAvailable = await new CommonService().nameValidator({
          model: models[modelName],
          searchString: data.levelName,
          field: "levelName",
        });
        if (!_.isEmpty(isNameAvailable)) {
          return new CommonService().handleResolve(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "NAME_ALREADY_EXIST"
            )
          );
        }
      } else {
        let isNameAvailable = await new CommonService().nameValidator({
          model: models[modelName],
          searchString: data.name,
          field: "name",
        });
        if (!_.isEmpty(isNameAvailable)) {
          return new CommonService().handleResolve(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "NAME_ALREADY_EXIST"
            )
          );
        }
      }

      let masterInfo = await models[modelName].create(data);

      if (!masterInfo) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DATA_NOT_ADDED"
          )
        );
      }

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "DATA_ADDED"
        )
      );
    } catch (error) {
      console.log(error._message);

      if (error.code == "11000") {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DUPLICATE_NAME"
          )
        );
      }
      if (error._message == "masterLicense validation failed") {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          "masterLicense validation failed"
        );
      }
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "INTERNAL_SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose Edit Master Data  
     @Parameter {
        "name":"",
        "status":"",
        "tabName":""
     }
     @Return JSON String
     ********************************************************/
  async editMaster() {
    try {
      /********************************************************
               Get current admin user id
        ********************************************************/
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";
      /********************************************************
          Generate Field Array and process the request body
        ********************************************************/

      let fieldsArray;
      if (this.req.body.tabName == "masterAddons") {
        fieldsArray = ["name", "price", "status", "duration", "tabName", "id"];
      } else if (
        this.req.body.tabName == "masterHourlyRate" ||
        this.req.body.tabName == "masterYearlyRate"
      ) {
        fieldsArray = ["from", "to", "status", "tabName", "id"];
      } else if (this.req.body.tabName == "masterSkillLevel") {
        fieldsArray = ["levelName", "status", "tabName", "id"];
      } else {
        fieldsArray = ["name", "status", "tabName", "id"];
      }

      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      data.modifiedBy = currentUser;

      let modelName = this.req.body.tabName;

      let updateData = await models[modelName].updateOne(
        { _id: ObjectId(data.id) },
        {
          $set: data,
        }
      );

      if (updateData.matchedCount == 0) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DATA_NOT_UPDATED"
          )
        );
      }

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "DATA_UPDATED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      console.log(error);

      if (error.code == "11000") {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DUPLICATE_NAME"
          )
        );
      }

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "INTERNAL_SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose Master Change Status
     @Parameter
     {
        "ids":[],
        "status":true/false,
        "tabName":""
     }
     @Return JSON String
     ********************************************************/
  async changeMasterDataStatus() {
    try {
      /********************************************************
               Get current admin user id
        ********************************************************/
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";

      /********************************************************
      Update Status
      ********************************************************/
      let modelName = this.req.body.tabName;
      await models[modelName].updateMany(
        { _id: { $in: this.req.body.ids } },
        { $set: { status: this.req.body.status, modifiedBy: currentUser } }
      );
      /********************************************************
        Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "STATUS_UPDATED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
       Manage Error logs and Response
       ********************************************************/
      console.log("error changeStatus", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "INTERNAL_SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
    @Purpose Master Data Listing
    @Parameter
    {
       "page":1,
       "pagesize":10,
       "sort":{},
       "search":""
    }
    @Return JSON String
    ********************************************************/
  async masterListing() {
    try {
      // page
      let page = this.req.query.page ? this.req.query.page : 1;
      let pageSize = this.req.query.pageSize ? this.req.query.pageSize : 10;

      let skip = (parseInt(page) - 1) * parseInt(pageSize);
      let where = {};

      let modelName = this.req.query.tabName;
      let search;
      // for searching
      if (this.req.query.search) {
        if (
          modelName == "masterHourlyRate" ||
          modelName == "masterYearlyRate"
        ) {
          // Replace spaces with an empty string
          search = this.req.query.search.replace(/\s/g, "");

          let splitSearch = search.split("-");

          let from = splitSearch[0] ? splitSearch[0].replace(/\$/g, "#") : "";
          let to = splitSearch[1] ? splitSearch[1].replace(/\$/g, "#") : "";
          where = {
            $and: [
              {
                mFrom: {
                  $regex: from,
                  $options: "i",
                },
              },
              {
                mTo: {
                  $regex: to,
                  $options: "i",
                },
              },
            ],
          };
        } else if (modelName == "masterSkillLevel") {
          where = {
            levelName: {
              $regex: Globals.escapeRegExp(this.req.query.search),
              $options: "i",
            },
          };
        } else {
          where = {
            name: {
              $regex: Globals.escapeRegExp(this.req.query.search),
              $options: "i",
            },
          };
        }
      }

      if (_.isEmpty(modelName)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SERVER_ERROR_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "TABNAME_REQUIRED"
          )
        );
      }
      let sorting = { createdAt: -1 };
      if (!_.isEmpty(this.req.query.sort))
        sorting = JSON.parse(this.req.query.sort);
      let masterList;
      if (modelName == "masterHourlyRate" || modelName == "masterYearlyRate") {
        masterList = await models[modelName].aggregate([
          {
            $addFields: {
              mFrom: {
                $concat: [
                  "#",
                  {
                    $toString: "$from",
                  },
                ],
              },
              mTo: {
                $concat: [
                  "#",
                  {
                    $toString: "$to",
                  },
                ],
              },
            },
          },
          { $match: where },
          {
            $facet: {
              count: [
                {
                  $group: {
                    _id: null,
                    count: {
                      $sum: 1,
                    },
                  },
                },
              ],
              data: [
                { $sort: sorting },
                { $skip: skip },
                { $limit: parseInt(pageSize) },
              ],
            },
          },
        ]);
      } else {
        masterList = await models[modelName].aggregate([
          { $match: where },
          {
            $facet: {
              count: [
                {
                  $group: {
                    _id: null,
                    count: {
                      $sum: 1,
                    },
                  },
                },
              ],
              data: [
                { $sort: sorting },
                { $skip: skip },
                { $limit: parseInt(pageSize) },
              ],
            },
          },
        ]);
      }

      if (_.isEmpty(masterList[0].data)) {
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
        masterList[0].data,
        null,
        page,
        pageSize,
        masterList[0].count[0].count
      );
    } catch (error) {
      /********************************************************
           Manage Error logs and Response
           ********************************************************/
      console.log("error masterlisting()", error);
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
     @Purpose Add ANSCO  
     @Parameter {
        "codeTitle":"",
        "skillLevel":"",
        "roleDescription":"",
        "experience":"",
        "qualification":"",
        "registration":"",
        "status":""
 
     }
     @Return JSON String
    ********************************************************/
  async addAnsco() {
    try {
      /********************************************************
               Get current admin user id
        ********************************************************/
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";
      /********************************************************
          Generate Field Array and process the request body
        ********************************************************/

      let fieldsArray = [
        "code",
        "codeTitle",
        "skillLevel",
        "skills",
        "roleDescription",
        "experience",
        "qualification",
        "registration",
        "status",
      ];

      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      data.createdBy = currentUser;
      // check code already exists or not
      let anscoInfo = await MasterAnsco.find({ code: data.code });
      if (!_.isEmpty(anscoInfo)) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "CODE_ALREADY_EXIST"
          )
        );
      }

      let isNameAvailable = await new CommonService().nameValidator({
        model: MasterAnsco,
        searchString: data.codeTitle,
        field: "codeTitle",
      });
      if (!_.isEmpty(isNameAvailable)) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "CODE_TITLE_ALREADY_EXIST"
          )
        );
      }

      let masterAnscoInfo = await MasterAnsco.create(data);

      if (!masterAnscoInfo) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DATA_NOT_ADDED"
          )
        );
      }

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "DATA_ADDED"
        )
      );
    } catch (error) {
      console.log(error);

      if (error.code == "11000") {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SERVER_ERROR_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DUPLICATE_TITLE"
          )
        );
      }

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "INTERNAL_SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose Edit ANSCO  
     @Parameter {
        "codeTitle":"",
        "skillLevel":"",
        "skills":""
        "roleDescription":"",
        "experience":"",
        "qualification":"",
        "registration":"",
        "status":"",
        "id":""
     }
     @Return JSON String
    ********************************************************/
  async editAnsco() {
    try {
      /********************************************************
               Get current admin user id
        ********************************************************/
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";
      /********************************************************
          Generate Field Array and process the request body
        ********************************************************/

      let fieldsArray = [
        "code",
        "codeTitle",
        "skillLevel",
        "skills",
        "roleDescription",
        "experience",
        "qualification",
        "registration",
        "status",
        "id",
      ];

      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      data.modifiedBy = currentUser;
      let nameFilter = {
        _id: { $ne: ObjectId(data.id) },
      };

      // check code already exists or not
      let anscoInfo = await MasterAnsco.find({
        code: data.code,
        _id: { $ne: ObjectId(data.id) },
      });

      if (!_.isEmpty(anscoInfo)) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "CODE_ALREADY_EXIST"
          )
        );
      }

      let isNameAvailable = await new CommonService().nameValidator({
        model: MasterAnsco,
        searchString: data.codeTitle,
        field: "codeTitle",
        filter: nameFilter,
      });
      if (!_.isEmpty(isNameAvailable)) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NAME_ALREADY_EXIST"
          )
        );
      }

      let updateData = await MasterAnsco.updateOne(
        { _id: data.id },
        {
          $set: data,
        }
      );

      if (updateData.matchedCount == 0) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DATA_NOT_UPDATED"
          )
        );
      }

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "DATA_UPDATED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      console.log(error);

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "INTERNAL_SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
    @Purpose Ansco Listing
    @Parameter
    {
       "page":1,
       "pagesize":10,
       "sort":{},
       "search":""
    }
    @Return JSON String
    ********************************************************/
  async anscoListing() {
    try {
      // page
      let page = this.req.query.page ? this.req.query.page : 1;
      let pageSize = this.req.query.pageSize ? this.req.query.pageSize : 10;

      let sorting = { createdAt: -1 };
      if (!_.isEmpty(this.req.query.sort))
        sorting = JSON.parse(this.req.query.sort);

      let skip = (parseInt(page) - 1) * parseInt(pageSize);
      let where = {};
      // for searching
      if (this.req.query.search) {
        where = {
          $or: [
            {
              codeTitle: {
                $regex: Globals.escapeRegExp(this.req.query.search),
                $options: "i",
              },
            },
            {
              code: {
                $regex: Globals.escapeRegExp(this.req.query.search),
                $options: "i",
              },
            },
          ],
        };
      } else {
        where = {};
      }

      let anscoList = await MasterAnsco.aggregate([
        { $match: where },
        {
          $lookup: {
            from: "masterskilllevels",
            let: { skillLevelId: "$skillLevel" },
            as: "skillLevels",
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$skillLevelId"] },
                },
              },
              {
                $project: {
                  _id: 0,
                  levelName: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            skillLevelName: { $arrayElemAt: ["$skillLevels", 0] },
          },
        },
        {
          $addFields: {
            skillLevel: "$skillLevelName.levelName", // Extract levelName from the skillLevelName object
          },
        },
        {
          $project: {
            skillLevels: 0,
            skillLevelName: 0,
          },
        },
        {
          $facet: {
            count: [
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            data: [
              { $sort: sorting },
              { $skip: skip },
              { $limit: parseInt(pageSize) },
            ],
          },
        },
      ]);

      if (_.isEmpty(anscoList[0].data)) {
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
        anscoList[0].data,
        null,
        page,
        pageSize,
        anscoList[0].count[0].count
      );
    } catch (error) {
      /********************************************************
           Manage Error logs and Response
           ********************************************************/
      console.log("error anscoList()", error);
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
     @Purpose download ansco
     @Parameter {type}
     @Return JSON String
     ********************************************************/
  async anscoDownload() {
    try {
      const columnSettings = this.req.body.column;

      let listing;
      /********************************************************
        list data
        ********************************************************/

      listing = await MasterAnsco.find({})
        .populate("skillLevel", "levelName")
        .populate("createdBy", "firstname lastname")
        .populate("modifiedBy", "firstname lastname")
        .sort({ createdAt: -1 })
        .exec();
      let modifiedListing = [];
      listing.forEach(async (element) => {
        let data = {
          code: element.code,
          codeTitle: element.codeTitle,
          skillLevel: element.skillLevel?.levelName
            ? element.skillLevel.levelName
            : "",
          skills: element.skills.join(","),
          roleDescription: element.roleDescription,
          experience: element.experience,
          qualification: element.qualification,
          registration: element.registration,
          status: element.status,
          createdBy: `${element.createdBy.firstname} ${element.createdBy.lastname}`,
          modifiedBy: element.hasOwnProperty("modifiedBy")
            ? `${element.modifiedBy.firstname} ${element.modifiedBy.lastname}`
            : "",
          createdAt: new Date(element.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          updatedAt: new Date(element.updatedAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
        };
        modifiedListing.push(data);
      });

      const download = await new CommonService().downloadFile(
        columnSettings,
        "MasterAnsco",
        this.req.body.type,
        modifiedListing
      );

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
    } catch (error) {
      /********************************************************
          Manage Error logs and Response
          ********************************************************/
      console.log("error masterDownload()", error);
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
    @Purpose Import Ansco
    @Parameter
    {
       "file":""
    }
    @Return JSON String  
    ********************************************************/
  async importAnsco() {
    try {
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";
      let formObject = await new Form(this.req).parse();
      // Array of allowed files
      const array_of_allowed_files = ["xlsx", "xls", "csv"];

      //check file size and files
      if (
        _.isEmpty(formObject.files) ||
        (formObject.files.file && formObject.files.file[0].size == 0)
      ) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SERVER_ERROR_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "FILE_REQUIRE"
          )
        );
      }

      // Get the extension of the uploaded file
      const file_extension = formObject.files.file[0].originalFilename.slice(
        ((formObject.files.file[0].originalFilename.lastIndexOf(".") - 1) >>>
          0) +
          2
      );

      // Check if the uploaded file is allowed
      if (!array_of_allowed_files.includes(file_extension)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNSUPPORTED_MEDIA_TYPE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "VALID_FILE_FORMAT"
          )
        );
      }

      //get file
      const file = new File(formObject.files.file[0]);
      let filePath = "";
      let fileObject = await file.store({
        imagePath: "/public/upload/imports/",
      });
      filePath = fileObject.filePath;
      //convert excel data to json to insert them in database

      let jsonData;
      let csvColumnHeaders;
      if (file_extension == "xlsx" || file_extension == "xls") {
        const jsonResult = await xlsx2json(
          `./public/upload/imports/${filePath}`
        );
        jsonData = jsonResult[0];

        if (jsonData && jsonData.length > 0) {
          csvColumnHeaders = Object.values(jsonData[0]).map((header) =>
            header.trim()
          );
        }
        // Filter out empty rows
        jsonData = jsonData.filter((row) => {
          return Object.values(row).some((value) => value !== "");
        });
      }

      //convert csv data to json to insert them in database
      if (file_extension == "csv") {
        const fileContent = fs.readFileSync(
          `./public/upload/imports/${filePath}`,
          "utf-8"
        );
        jsonData = await (() => {
          return new Promise((resolve, reject) => {
            (async () => {
              parse(fileContent, { columns: true }, (err, json) => {
                if (err) {
                  console.error("Error parsing CSV:", err);
                  resolve([]);
                }
                resolve(json);
              });
            })();
          });
        })();
        csvColumnHeaders = Object.keys(jsonData[0]).map((header) =>
          header.trim()
        );
      }

      let allowedColumns = [
        "code",
        "codetitle",
        "skill",
        "roledescription",
        "experience",
        "qualification",
        "registration",
        "status",
        "skilllevel",
        "primaryaim",
      ];

      const isColumnMatching = allowedColumns.every((column) =>
        csvColumnHeaders.includes(column)
      );

      if (!isColumnMatching) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "INVALID_COLUMNS"
          )
        );
      }
      let dataArray = [];
      if (file_extension == "csv") {
        for (let i = 0; i < jsonData.length; i++) {
          // find skillLevel in skillLevel table by skill level name
          let data = {};
          let isNameAvailable = await new CommonService().nameValidator({
            model: MasterSkillLevels,
            searchString: jsonData[i].skilllevel,
            field: "levelName",
          });
          if (!_.isEmpty(isNameAvailable)) {
            data.skillLevel = isNameAvailable[0]._id;
          } else {
            let obj = {
              levelName: jsonData[i].skillLevel,
              status: true,
            };
            let skillLevelAdd = await MasterSkillLevels.create(obj);
            data.skillLevel = skillLevelAdd._id;
          }

          const skillList = jsonData[i].skill;
          let skills = skillList.split(",");
          skills = skills.filter((e) => {
            return e.trim() !== "";
          });
          const roleDescription = (
            (jsonData[i].primaryaim ? jsonData[i].primaryaim + "\n\n" : "") +
            (jsonData[i].roledescription || "")
          ).replace(/\n/g, "<br>");
          // find skills in skills table by skill name
          await this.asyncForEach(skills, async (dataArray, i) => {
            let isSkillAvailable = await new CommonService().nameValidator({
              model: MasterSkills,
              searchString: dataArray.trim(),
              field: "name",
            });
            if (_.isEmpty(isSkillAvailable)) {
              let obj = {
                name: dataArray.trim(),
                status: true,
              };
              await MasterSkills.create(obj);
            }
          });
          data.code = jsonData[i].code;
          data.codeTitle = jsonData[i].codetitle;
          data.skills = skills;
          data.roleDescription = roleDescription;
          data.experience = jsonData[i].experience;
          data.qualification = jsonData[i].qualification;
          data.registration = jsonData[i].registration;
          data.status = /^true$/i.test(jsonData[i].status);
          data.createdBy = currentUser;
          dataArray.push(data);
        }
      } else {
        for (let i = 1; i < jsonData.length; i++) {
          let data = {};
          const row = jsonData[i];
          const roleDescription = (
            (row.J ? row.J + "\n\n" : "") + (row.D || "")
          ).replace(/\n/g, "<br>");
          const skillList = row.C;
          let skills = skillList.split(",");
          skills = skills.filter((e) => {
            return e.trim() !== "";
          });

          // find skillLevel in skillLevel table by skill level name
          let isNameAvailable = await new CommonService().nameValidator({
            model: MasterSkillLevels,
            searchString: row.I,
            field: "levelName",
          });
          if (!_.isEmpty(isNameAvailable)) {
            data.skillLevel = isNameAvailable[0]._id;
          } else {
            let obj = {
              levelName: row.I,
              status: true,
            };
            let skillLevelAdd = await MasterSkillLevels.create(obj);
            data.skillLevel = skillLevelAdd._id;
          }

          // find skills in skills table by skill name
          await this.asyncForEach(skills, async (dataArray, i) => {
            let isSkillAvailable = await new CommonService().nameValidator({
              model: MasterSkills,
              searchString: dataArray.trim(),
              field: "name",
            });
            if (_.isEmpty(isSkillAvailable)) {
              let obj = {
                name: dataArray.trim(),
                status: true,
              };
              await MasterSkills.create(obj);
            }
          });

          data = {
            ...data,
            code: row.A,
            codeTitle: row.B,
            skills: skills,
            roleDescription: roleDescription,
            experience: row.E,
            qualification: row.F,
            registration: row.G,
            status: /^true$/i.test(row.H),
            skilllevel: row.I,
            createdBy: currentUser,
          };
          dataArray.push(data);
        }
      }

      await this.asyncForEach(dataArray, async (dataArray, i) => {
        let anscoData = await MasterAnsco.findOne({
          code: dataArray.code,
          codeTitle: dataArray.codeTitle,
        });
        //check and insert experience master
        let experience = await masterExperience.findOne({
          name: { $regex: dataArray.experience.trim(), $options: "i" },
        });
        if (experience == null || _.isEmpty(experience)) {
          dataArray.experience = "";
        }
        if (anscoData == null) {
          await MasterAnsco.create(dataArray);
        } else {
          await MasterAnsco.updateMany(
            {
              _id: ObjectId(anscoData._id),
            },
            { $set: dataArray }
          );
        }
        //check and insert qualification master
      });

      fs.unlink(
        `./public/upload/imports/${filePath}`,
        (data) => {
          console.log("removed file", data);
        },
        (err) => {
          console.log("-=-=-=-=-=-=\n", err);
        }
      );
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "FILE_IMPORTED"
        )
      );
    } catch (error) {
      /********************************************************
             Manage Error logs and Response
             ********************************************************/
      console.log("error importansco()", error);

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
     @Purpose Master Change Status
     @Parameter
     {
        "ids":[],
        "status":true/false,
        "tabName":""
     }
     @Return JSON String
     ********************************************************/
  async changeAnscoStatus() {
    try {
      /********************************************************
               Get current admin user id
        ********************************************************/
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";

      /********************************************************
      Update Status
      ********************************************************/

      await MasterAnsco.updateMany(
        { _id: { $in: this.req.body.ids } },
        { $set: { status: this.req.body.status, modifiedBy: currentUser } }
      );
      /********************************************************
        Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "STATUS_UPDATED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
       Manage Error logs and Response
       ********************************************************/
      console.log("error changeAnscoStatus", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "INTERNAL_SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose Subscription Details
     @Parameter {id}
     @Return JSON String
     ********************************************************/
  async subscriptionDetails() {
    try {
      const subscriptionDetails = await MasterSubscriptions.findOne({
        _id: this.req.query.id,
      }).populate("modifiedBy", "firstname lastname");

      if (!subscriptionDetails) {
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

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        subscriptionDetails
      );
    } catch (error) {
      /********************************************************
          Manage Error logs and Response
          ********************************************************/
      console.log("error subscriptionDetails()", error);
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
    @Purpose Import Master Data (masterIndustry,masterSkills)
    @Parameter
    {
       "file":""
    }
    @Return JSON String  
    ********************************************************/
  async importMaster() {
    try {
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";
      let formObject = this.req.form;
      let csvColumnHeaders;
      let modelName = formObject.fields.moduleName;
      if (_.isEmpty(modelName[0])) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SERVER_ERROR_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "MODEL_NAME_REQUIRED"
          )
        );
      }

      // Array of allowed files
      const array_of_allowed_files = ["xlsx", "xls", "csv"];
      //check file size and files
      if (
        _.isEmpty(formObject.files) ||
        (formObject.files.file && formObject.files.file[0].size == 0)
      ) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SERVER_ERROR_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "FILE_REQUIRE"
          )
        );
      }

      // Get the extension of the uploaded file
      const file_extension = formObject.files.file[0].originalFilename.slice(
        ((formObject.files.file[0].originalFilename.lastIndexOf(".") - 1) >>>
          0) +
          2
      );

      // Check if the uploaded file is allowed
      if (!array_of_allowed_files.includes(file_extension)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNSUPPORTED_MEDIA_TYPE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "VALID_FILE_FORMAT"
          )
        );
      }

      //get file
      const file = new File(formObject.files.file[0]);
      let filePath = "";
      let fileObject = await file.store({
        imagePath: "/public/upload/imports/",
      });
      filePath = fileObject.filePath;
      //convert excel data to json to insert them in database
      let jsonData;
      if (file_extension == "xlsx" || file_extension == "xls") {
        console.log("in");

        const workbook = XLSX.readFile(`./public/upload/imports/${filePath}`);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData && jsonData.length > 0) {
          csvColumnHeaders = Object.values(jsonData[0]).map((header) =>
            header.trim()
          );
        }
        // Filter out empty rows
        jsonData = jsonData.filter((row) => {
          return Object.values(row).some((value) => value !== "");
        });
        console.log(jsonData);
      }

      //convert csv data to json to insert them in database
      if (file_extension == "csv") {
        const fileContent = fs.readFileSync(
          `./public/upload/imports/${filePath}`,
          "utf-8"
        );
        jsonData = await (() => {
          return new Promise((resolve, reject) => {
            (async () => {
              parse(fileContent, { columns: true }, (err, json) => {
                if (err) {
                  console.error("Error parsing CSV:", err);
                  resolve([]);
                }
                resolve(json);
              });
            })();
          });
        })();
        csvColumnHeaders = Object.keys(jsonData[0]).map((header) =>
          header.trim()
        );
      }
      let allowedColumns;

      // Check if the CSV column headers match the allowed columns
      if (
        modelName[0] == "masterHourlyRate" ||
        modelName[0] == "masterYearlyRate"
      ) {
        allowedColumns = ["from", "to", "status"]; // Modify this with your allowed column names
      } else if (modelName[0] == "masterSkillLevel") {
        allowedColumns = ["levelname", "status"];
      } else if (modelName[0] == "masterLicense") {
        allowedColumns = ["LicenseNumber", "Name", "Status"];
      } else {
        allowedColumns = ["name", "status"];
      }
      const isColumnMatching = allowedColumns.every((column) =>
        csvColumnHeaders.includes(column)
      );

      if (!isColumnMatching) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "INVALID_COLUMNS"
          )
        );
      }

      let dataArray = [];
      //insert to dataBase by looping
      if (file_extension == "csv") {
        if (
          modelName[0] == "masterHourlyRate" ||
          modelName[0] == "masterYearlyRate"
        ) {
          for (let i = 0; i < jsonData.length; i++) {
            let data = {};
            data.from = jsonData[i].from;
            data.to = jsonData[i].to;
            data.status = /^true$/i.test(jsonData[i].status);
            data.createdBy = currentUser;
            dataArray.push(data);
          }
        } else if (modelName[0] == "masterSkillLevel") {
          for (let i = 0; i < jsonData.length; i++) {
            let data = {};
            data.levelName = jsonData[i].levelname;
            data.status = /^true$/i.test(jsonData[i].status);
            data.createdBy = currentUser;
            dataArray.push(data);
          }
        } else if (modelName[0] == "masterLicense") {
          for (let i = 0; i < jsonData.length; i++) {
            let data = {};
            data.name = jsonData[i].LicenseNumber;
            data.companyName = jsonData[i].Name;
            data.status = /^true$/i.test(jsonData[i].status);
            data.createdBy = currentUser;
            dataArray.push(data);
          }
        } else {
          for (let i = 0; i < jsonData.length; i++) {
            let data = {};
            data.name = jsonData[i].name;
            data.status = /^true$/i.test(jsonData[i].status);
            data.createdBy = currentUser;
            dataArray.push(data);
          }
        }
      } else {
        if (
          modelName[0] == "masterHourlyRate" ||
          modelName[0] == "masterYearlyRate"
        ) {
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            let data = {
              from: row[0],
              to: row[1],
              status: /^true$/i.test(row.C),
              createdBy: currentUser,
            };
            dataArray.push(data);
          }
        } else if (modelName[0] == "masterSkillLevel") {
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            let data = {
              levelName: row[0],
              status: /^true$/i.test(row[1]),
              createdBy: currentUser,
            };
            dataArray.push(data);
          }
        } else if (modelName[0] == "masterLicense") {
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];

            let data = {
              name: row[0],
              companyName: row[1],
              status: /^true$/i.test(row[2]),
              createdBy: currentUser,
            };
            dataArray.push(data);
          }
        } else {
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];

            let data = {
              name: row[0],
              status: /^true$/i.test(row[1]),
              createdBy: currentUser,
            };
            dataArray.push(data);
          }
        }
      }
      let industryName;
      await this.asyncForEach(dataArray, async (dataArray, i) => {
        if (
          modelName[0] == "masterHourlyRate" ||
          modelName[0] == "masterYearlyRate"
        ) {
          let rateData = await models[modelName[0]].findOne({
            from: dataArray.from,
            to: dataArray.to,
          });
          if (rateData == null) {
            await models[modelName[0]].create(dataArray);
          }
        } else if (modelName[0] == "masterSkillLevel") {
          let levelName = await models[modelName[0]].findOne({
            levelName: dataArray.levelname,
          });
          if (levelName == null) {
            await models[modelName[0]].create(dataArray);
          }
        } else if (modelName[0] == "masterLicense") {
          let license = await models[modelName[0]].findOne({
            name: dataArray.name,
          });
          if (license == null) {
            await models[modelName[0]].create(dataArray);
          }
        } else {
          industryName = await models[modelName[0]].findOne({
            name: dataArray.name,
          });
          if (industryName == null) {
            await models[modelName[0]].create(dataArray);
          }
        }
      });

      fs.unlink(
        `./public/upload/imports/${filePath}`,
        (data) => {
          console.log("removed file", data);
        },
        (err) => {
          console.log("-=-=-=-=-=-=\n", err);
        }
      );
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "FILE_IMPORTED"
        )
      );
    } catch (error) {
      /********************************************************
             Manage Error logs and Response
             ********************************************************/
      console.log("error masterImport()", error);

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
     @Purpose download Master Data (Industry, Skills)
     @Parameter {moduleName: "" , columnName : ""}
     @Return JSON String
     ********************************************************/
  async masterDownload() {
    try {
      const columnSettings = this.req.body.column;

      let listing;
      /********************************************************
      list data
      ********************************************************/

      let modelName = this.req.body.moduleName;

      listing = await models[modelName]
        .find({})
        .populate("createdBy", "firstname lastname")
        .populate("modifiedBy", "firstname lastname")
        .populate("createdAt")
        .populate("updatedAt")
        .sort({ createdAt: -1 })
        .exec();

      let modifiedListing = [];
      let data;
      if (
        modelName === "masterHourlyRate" ||
        modelName === "masterYearlyRate"
      ) {
        listing.forEach((element) => {
          data = {
            from: element.from,
            to: element.to,
            status: element.status,
            createdBy: `${element.createdBy?.firstname} ${element.createdBy?.lastname}`,
            modifiedBy: element.hasOwnProperty("modifiedBy")
              ? `${element.modifiedBy?.firstname} ${element.modifiedBy?.lastname}`
              : "",
            createdAt: new Date(element.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            updatedAt: element.updatedAt,
          };
          modifiedListing.push(data);
        });
      } else if (modelName === "masterSkillLevel") {
        listing.forEach((element) => {
          data = {
            levelName: element.levelName,
            status: element.status,
            createdBy: `${element.createdBy?.firstname} ${element.createdBy?.lastname}`,
            modifiedBy: element.hasOwnProperty("modifiedBy")
              ? `${element.modifiedBy?.firstname} ${element.modifiedBy?.lastname}`
              : "",
            createdAt: new Date(element.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            updatedAt: element.updatedAt,
          };
          modifiedListing.push(data);
        });
      } else {
        listing.forEach((element) => {
          console.log(element);
          data = {
            name: element.name,
            status: element.status,
            createdBy: `${element.createdBy?.firstname} ${element.createdBy?.lastname}`,
            modifiedBy: element.hasOwnProperty("modifiedBy")
              ? `${element.modifiedBy?.firstname} ${element.modifiedBy?.lastname}`
              : "",
            createdAt: new Date(element.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            updatedAt: element.updatedAt,
          };
          modifiedListing.push(data);
        });
      }

      const download = await new CommonService().downloadFile(
        columnSettings,
        modelName,
        this.req.body.type,
        modifiedListing
      );

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
    } catch (error) {
      /********************************************************
        Manage Error logs and Response
        ********************************************************/
      console.log("error masterDownload()", error);
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
     @Purpose Ansco Details
     @Parameter {id}
     @Return JSON String
     ********************************************************/
  async anscoDetails() {
    try {
      const anscoDetails = await MasterAnsco.findOne({
        _id: this.req.query.id,
      })
        .populate("createdBy", "firstname lastname")
        .populate("modifiedBy", "firstname lastname")
        .populate("skillLevel", "levelName");

      if (!anscoDetails) {
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

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        anscoDetails
      );
    } catch (error) {
      /********************************************************
            Manage Error logs and Response
            ********************************************************/
      console.log("error anscoDetails()", error);
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
     @Purpose Master Details
     @Parameter {
        moduleName:"" ,
        id:""
      }
     @Return JSON String
     ********************************************************/
  async masterDetails() {
    try {
      let fieldsArray = ["moduleName", "id"];

      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      let modelName = data.moduleName;

      const masterDetails = await models[modelName]
        .findOne({
          _id: data.id,
        })
        .populate("createdBy", "firstname lastname")
        .populate("modifiedBy", "firstname lastname");

      if (!masterDetails) {
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

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        masterDetails
      );
    } catch (error) {
      /********************************************************
          Manage Error logs and Response
          ********************************************************/
      console.log("error masterDetails()", error);
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
    @Purpose Master Data States
    @Parameter
    {
       "country_code":""
    }
    @Return JSON String
    ********************************************************/
  async masterStates() {
    try {
      // page
      let countryId = this.req.query.countryCode;

      // for searching
      if (_.isEmpty(countryId)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "COUNTRY_ID_REQUIRED"
          )
        );
      }

      let masterStates = await MasterStates.find();

      if (_.isEmpty(masterStates)) {
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
        masterStates
      );
    } catch (error) {
      /********************************************************
             Manage Error logs and Response
             ********************************************************/
      console.log("error masterStates()", error);
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
    @Purpose Get Master Cities
    @Parameter
    {
       "stateCode":""
    }
    @Return JSON String
    ********************************************************/
  async masterCities() {
    try {
      // page
      let countryCode = this.req.query.countryCode;

      // for searching
      if (_.isEmpty(countryCode)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "COUNTRY_ID_REQUIRED"
          )
        );
      }

      let masterCities = await MasterCities.find({ country_code: countryCode });

      if (_.isEmpty(masterCities)) {
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
        masterCities
      );
    } catch (error) {
      /********************************************************
             Manage Error logs and Response
             ********************************************************/
      console.log("error masterCities()", error);
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
     @Purpose Add Master coupon Data  
     @Parameter {
        "name":"",
        "status":"",
        "tabName":""
     }
     @Return JSON String
    ********************************************************/
  async addMasterCoupon() {
    try {
      let userId = this.req.currentUser ? this.req.currentUser._id : "";
      let fieldsArray = [
        "couponName",
        "price",
        "status",
        "expiryDate",
        "discountType",
        "id",
      ];

      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      if (!data.id) {
        let isNameAvailable = await new CommonService().nameValidator({
          model: masterPromoCodes,
          searchString: data.couponName,
          field: "couponName",
        });
        if (!_.isEmpty(isNameAvailable)) {
          return new CommonService().handleResolve(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "NAME_ALREADY_EXIST"
            )
          );
        }
        data.createdAt = new Date().getTime();
        data.createdBy = userId;
        data.updatedBy = userId;

        let masterInfo = await masterPromoCodes.create(data);

        if (!masterInfo) {
          return new CommonService().handleResolve(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "DATA_NOT_ADDED"
            )
          );
        }

        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DATA_ADDED"
          )
        );
      } else {
        //name validation
        if (data.couponName) {
          let nameAvailable = await masterPromoCodes.findOne({
            couponName: { $regex: data.couponName, $options: "i" },
            _id: { $ne: ObjectId(data.id) },
          });
          if (!_.isEmpty(nameAvailable)) {
            return new CommonService().handleResolve(
              this.res,
              HTTP_CODE.FAILED,
              HTTP_CODE.SUCCESS_CODE,
              await new CommonService().setMessage(
                this.req.currentUserLang,
                "NAME_ALREADY_EXIST"
              )
            );
          }
        }
        data.updatedAt = new Date().getTime();
        data.updatedBy = userId;
        let masterCoupon = await masterPromoCodes.findOne({
          _id: ObjectId(data.id),
        });
        if (_.isEmpty(masterCoupon)) {
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
        let masterInfo = await masterPromoCodes.updateOne(
          { _id: ObjectId(data.id) },
          { $set: data }
        );

        if (!masterInfo) {
          return new CommonService().handleResolve(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "DATA_NOT_UPDATED"
            )
          );
        }

        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DATA_UPDATED_SUCCESSFULLY"
          )
        );
      }
    } catch (error) {
      console.log(error);

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "INTERNAL_SERVER_ERROR"
        )
      );
    }
  }

  /********************************************************
     @Purpose Master coupon list 
     @params search,page,pageSize 
     @Return JSON String
    ********************************************************/
  async listMasterCoupon() {
    try {
      // page
      let page = this.req.query.page ? this.req.query.page : 1;
      let pageSize = this.req.query.pageSize ? this.req.query.pageSize : 10;

      let skip = (parseInt(page) - 1) * parseInt(pageSize);
      let where = {};
      // for searching
      if (this.req.query.search) {
        where = {
          couponName: { $regex: this.req.query.search, $options: "i" },
        };
      }

      let sorting = { createdAt: -1 };

      let masterList = await masterPromoCodes.aggregate([
        { $match: where },
        {
          $facet: {
            count: [
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            data: [
              { $sort: sorting },
              { $skip: skip },
              { $limit: parseInt(pageSize) },
            ],
          },
        },
      ]);
      if (_.isEmpty(masterList[0].data)) {
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
        masterList[0].data,
        null,
        page,
        pageSize,
        masterList[0].count[0].count
      );
    } catch (error) {
      console.log(error);

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "INTERNAL_SERVER_ERROR"
        )
      );
    }
  }
  /********************************************************
     @Purpose Master coupon delete (hard)
     @params id 
     @Return JSON String
    ********************************************************/
  async deleteMasterCoupon() {
    try {
      if (this.req.body.ids) {
        let data = this.req.body.ids.map((e) => {
          return ObjectId(e);
        });
        await masterPromoCodes.deleteMany({ _id: { $in: data } });
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "COUPON_DELETED"
          )
        );
      }
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.BAD_REQUEST_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "REQUIRED_ID"
        )
      );
    } catch (e) {
      console.log(error);

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "INTERNAL_SERVER_ERROR"
        )
      );
    }
  }
  /********************************************************
     @Purpose Master chnage coupon status
     @params ids,status 
     @Return JSON String
    ********************************************************/
  async masterCouponChangeStatus() {
    try {
      /********************************************************
               Get current admin user id
        ********************************************************/
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";

      /********************************************************
      Update Status
      ********************************************************/
      await masterPromoCodes.updateMany(
        { _id: { $in: this.req.body.ids } },
        { $set: { status: this.req.body.status, modifiedBy: currentUser } }
      );
      /********************************************************
        Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "STATUS_UPDATED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
       Manage Error logs and Response
       ********************************************************/
      console.log("error changeStatus", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "INTERNAL_SERVER_ERROR"
        )
      );
    }
  }
  /********************************************************
     @Purpose Master coupon details
     @params id 
     @Return JSON String
    ********************************************************/
  async getCouponDetails() {
    try {
      /********************************************************
               Get current admin user id
        ********************************************************/
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";

      /********************************************************
      Update Status
      ********************************************************/
      let couponData = await masterPromoCodes
        .findOne({
          _id: ObjectId(this.req.query.id),
        })
        .populate("createdBy", "firstname lastname")
        .populate("modifiedBy", "firstname lastname")
        .populate("createdAt")
        .populate("updatedAt")
        .exec();
      if (_.isEmpty(couponData)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.NOT_FOUND_CODE,
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
        couponData
      );
    } catch (error) {
      /********************************************************
       Manage Error logs and Response
       ********************************************************/
      console.log("error details", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "INTERNAL_SERVER_ERROR"
        )
      );
    }
  }
  /********************************************************
     @Purpose Master coupon download
     @params id 
     @Return JSON String
    ********************************************************/
  async couponDownload() {
    try {
      /********************************************************
               Get current admin user id
        ********************************************************/
      const columnSettings = this.req.body.column
        ? this.req.body.column
        : [
            "name",
            "status",
            "discountType",
            "price",
            "expiryDate",
            "createdBy",
            "modifiedBy",
            "createdAt",
          ];

      /********************************************************
      Update Status
      ********************************************************/
      let listing = await masterPromoCodes
        .find()
        .populate("createdBy", "firstname lastname")
        .populate("modifiedBy", "firstname lastname")
        .populate("createdAt")
        .populate("updatedAt")
        .sort({ createdAt: -1 })
        .exec();
      let data;
      let modifiedListing = [];
      listing.forEach(async (element) => {
        data = {
          name: element.couponName,
          status: element.status,
          discountType: element.discountType,
          price: element.price,
          expiryDate: new Date(element.expiryDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          createdBy: `${element.createdBy?.firstname} ${element.createdBy?.lastname}`,
          modifiedBy: element.hasOwnProperty("modifiedBy")
            ? `${element.modifiedBy?.firstname} ${element.modifiedBy?.lastname}`
            : "",
          createdAt: new Date(element.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          updatedAt: element.updatedAt,
        };
        modifiedListing.push(data);
      });
      const download = await new CommonService().downloadFile(
        columnSettings,
        "masterPromoCodes",
        this.req.body.type,
        modifiedListing
      );
      if (_.isEmpty(listing)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.NOT_FOUND_CODE,
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
          "FILE_DOWNLOADED"
        ),
        download
      );
    } catch (error) {
      /********************************************************
       Manage Error logs and Response
       ********************************************************/
      console.log("error details", error);
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "INTERNAL_SERVER_ERROR"
        )
      );
    }
  }
  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}
module.exports = MasterDataController;
