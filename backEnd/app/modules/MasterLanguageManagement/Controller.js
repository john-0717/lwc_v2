const _ = require("lodash");

const Controller = require("../Base/Controller");
const Languages = require("./Schema").Languages;
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const masterProjection = require("./Projection.json");
const { HTTP_CODE } = require("../../services/constant");
const ObjectId = require("mongoose").Types.ObjectId;

class LanguageController extends Controller {
  constructor() {
    super();
  }
  /********************************************************
    @Purpose Add/Update Language 
    @Parameter
    {
       "languageId":"",
       "language":"",
       "country":""
    }
    @Return JSON String
    ********************************************************/
  async addUpdateLanguage() {
    try {
      let data = this.req.body;
      if (data.languageId) {
        /********************************************************
        Find Languages details and validate
        ********************************************************/
        let checkingLanguage = await Languages.findOne({
          _id: { $ne: data.languageId },
          language: data.language,
          country: data.country,
          isDeleted: false,
        }).exec();
        if (!_.isEmpty(checkingLanguage)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "LANGUAGE_ALREADY_EXISTS_WITH_COUNTRY"
            )
          );
        }
        /********************************************************
        Update Languages details and validate
        ********************************************************/
        const languageData = await Languages.findByIdAndUpdate(
          data.languageId,
          data,
          { new: true }
        ).exec();
        if (_.isEmpty(languageData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "LANGUAGE_NOT_UPDATED"
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
            "LANGUAGE_UPDATED_SUCCESSFULLY"
          )
        );
      } else {
        /********************************************************
        Check Language details and validate
        ********************************************************/
        let checkingLanguage = await Languages.findOne({
          language: data.language,
          country: data.country,
          isDeleted: false,
        }).exec();
        if (!_.isEmpty(checkingLanguage)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "LANGUAGE_ALREADY_EXISTS_WITH_COUNTRY"
            )
          );
        }

        /********************************************************
        Save Language details and validate
        ********************************************************/
        const languageData = await new Model(Languages).store(data);
        if (_.isEmpty(languageData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "LANGUAGE_NOT_SAVED"
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
            "LANGUAGE_ADDED_SUCCESSFULLY"
          )
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error addUpdateLanguage()", error);
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
    @Purpose Language Listing
    @Parameter
    {
       "page":1,
       "pagesize":10,
       "sort":{"language":1/-1},
       "filter": [{"language": [""]}]
       "searchText":""
    }
    @Return JSON String
  ********************************************************/
  async languageListing() {
    try {
      /********************************************************
      Set Modal for listing
      ********************************************************/
      this.req.body["model"] = Languages;
      let result;
      if (this.req.body.searchText) {
        /********************************************************
        Listing for Search Functionality
        ********************************************************/
        this.req.body["filter"] = ["language", "languageCode", "country"];
        let data = {
          bodyData: this.req.body,
          selectObj: masterProjection.languageListing,
        };
        result = await LanguageController.languageSearching(data);
      } else {
        /********************************************************
        Listing for filter functionality
        ********************************************************/
        let data = {
          bodyData: this.req.body,
          selectObj: masterProjection.languageListing,
        };
        result = await LanguageController.languageListing(data);
      }

      /********************************************************
        Generate and return response
      ********************************************************/
      return this.res.send(result);
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error languageListing()", error);
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
     @PurposeTimezone delete
     @Parameter
     {
        "languageIds":[],
     }
     @Return JSON String
  ********************************************************/
  async deleteLanguages() {
    try {
      /********************************************************
      Update Delete Status
      ********************************************************/
      await Languages.updateMany(
        { _id: { $in: this.req.body.languageIds } },
        { $set: { isDeleted: true } }
      ).exec();

      /********************************************************
        Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "LANGUAGE_DELETED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteLanguages()", error);
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
      @Purpose Language Change Status
      @Parameter
      {
         "languageIds":[],
         "status":true/false
      }
      @Return JSON String
  ********************************************************/
  async changeLanguageStatus() {
    try {
      /********************************************************
      Update Language Status
      ********************************************************/
      await Languages.updateMany(
        { _id: { $in: this.req.body.languageIds } },
        { $set: { status: this.req.body.status } }
      ).exec();
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
      console.log("error changeLanguageStatus()", error);
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
     @Purpose get language details for edit
     @Parameter {id}
     @Return JSON String
     ********************************************************/
  async getLanguagedetails() {
    try {
      /********************************************************
      Validate request parameters
      ********************************************************/
      if (
        _.isEmpty(this.req.params.languageId) ||
        !ObjectId.isValid(this.req.params.languageId)
      ) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "REQUEST_PARAMETERS"
          )
        );
      }
      /********************************************************
        Find Timezone details and validate
      ********************************************************/
      let stages = [
        {
          $match: {
            _id: ObjectId(this.req.params.languageId),
            isDeleted: false,
          },
        },
        {
          $project: masterProjection.languageListing,
        },
      ];

      const languageDetails = await Languages.aggregate(stages).exec();

      if (_.isEmpty(languageDetails)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
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
        languageDetails
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getLanguagedetails()", error);
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
   @Purpose get Language List
   @Parameter {}
   @Return JSON String
   ********************************************************/
  async getLanguageList() {
    try {
      /********************************************************
        Find language details and validate
      ********************************************************/
      const languageListDetails = await Languages.find({
        isDeleted: false,
        status: true,
      })
        .select(masterProjection.list)
        .exec();

      if (_.isEmpty(languageListDetails)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_FOUND"
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
        languageListDetails
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getLanguageList()", error);
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
    @Purpose Service for timezone listing records
    @Parameter
    {
        data:{
            bodyData:{},
            model:{}
        }
    }
    @Return JSON String
  ********************************************************/
  static languageListing(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let bodyData = data.bodyData;
          let model = data.bodyData.model;
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          let commonFilter = { isDeleted: false };
          let filter1 = commonFilter;
          let f = [];
          /********************************************************
        Check page and pagesize
        ********************************************************/
          if (bodyData.page && bodyData.pagesize) {
            let skip =
              (parseInt(bodyData.page) - 1) * parseInt(bodyData.pagesize);
            let sort = bodyData.sort ? bodyData.sort : { createdAt: -1 };

            if (bodyData.filter && Array.isArray(bodyData.filter)) {
              let filter = bodyData.filter;
              /********************************************************
            Generate Query Object from given filters
            ********************************************************/
              for (let index in filter) {
                let ar = filter[index];
                for (let key in ar) {
                  let filterObj =
                    ar[key] && Array.isArray(ar[key]) ? ar[key] : [];
                  let valueArr = [];
                  filterObj.filter((value) => {
                    let obj;
                    if (
                      data.schema &&
                      !_.isEmpty(data.schema) &&
                      data.schema.path(key) &&
                      data.schema.path(key).instance == "Embedded"
                    ) {
                      obj = { [key + "." + key]: value };
                    } else {
                      obj = data.search
                        ? {
                            [key]:
                              typeof value === "string"
                                ? new RegExp(
                                    value.toString().toLowerCase(),
                                    "i"
                                  )
                                : value,
                          }
                        : { [key]: value };
                    }
                    valueArr.push(obj);
                  });
                  if (valueArr.length) {
                    f.push({ $or: valueArr });
                  }
                }
                filter1 = { $and: [...f, commonFilter] };
              }
            }

            let stages = [
              { $match: filter1 },
              {
                $project: selectObj,
              },
              { $sort: sort },
              {
                $skip: skip,
              },
              {
                $limit: parseInt(bodyData.pagesize),
              },
            ];

            let totalCountFilter = [
              {
                $match: filter1,
              },
              {
                $count: "count",
              },
            ];
            let listing;
            /********************************************************
          list and count data according to filter query
          ********************************************************/
            listing = await model.aggregate(stages);
            const total = await model.aggregate(totalCountFilter);
            let columnKey = data.bodyData.columnKey;
            if (columnKey) {
              let columnSettings = await ColumnSettings.findOne({
                key: columnKey,
              }).select({ _id: 0, "columns._id": 0 });
              columnSettings =
                columnSettings &&
                columnSettings.columns &&
                Array.isArray(columnSettings.columns)
                  ? columnSettings.columns
                  : [];
              return resolve({
                status: 1,
                data: { listing, columnSettings },
                page: bodyData.page,
                perPage: bodyData.pagesize,
                total: total,
              });
            } else {
              return resolve({
                status: 1,
                data: { listing },
                page: bodyData.page,
                perPage: bodyData.pagesize,
                total: total.length > 0 ? total[0].count : 0,
              });
            }
          } else {
            return resolve({
              status: 0,
              message: "Page and pagesize required.",
            });
          }
        } catch (error) {
          return reject(error);
        }
      })();
    });
  }

  /********************************************************
     @Purpose Service for searching records
     @Parameter
     {
        data:{
            bodyData:{},
            model:{}
        }
     }
     @Return JSON String
     ********************************************************/
  static languageSearching(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          let model = data.bodyData.model;
          let bodyData = data.bodyData;
          let filter = bodyData.filter;
          let sort = bodyData.sort ? bodyData.sort : { createdAt: -1 };
          let skip =
            (parseInt(bodyData.page) - 1) * parseInt(bodyData.pagesize);
          let searchfilter;
          let totalCountFilter;
          /********************************************************
          Check data filter
        ********************************************************/
          if (filter) {
            let ar = [];
            /********************************************************
          Generate Query Object from given filters
          ********************************************************/
            for (let index in filter) {
              let Obj;
              Obj = {
                [filter[index]]: new RegExp(data.bodyData.searchText, "i"),
              };
              if (
                bodyData.schema &&
                !_.isEmpty(bodyData.schema) &&
                bodyData.schema.path(key) &&
                bodyData.schema.path(key).instance == "Embedded"
              ) {
                // For searching Role
                Obj = {
                  [filter[index]]: new RegExp(data.bodyData.searchText, "i"),
                };
              }
              ar.push(Obj);
            }
            /********************************************************
          Generate search filters
          ********************************************************/
            searchfilter = [
              {
                $match: {
                  $or: ar,
                  isDeleted: false,
                },
              },
              {
                $project: selectObj,
              },
              { $sort: sort },
              {
                $skip: skip,
              },
              {
                $limit: parseInt(bodyData.pagesize),
              },
            ];
            totalCountFilter = [
              {
                $match: {
                  $or: ar,
                  isDeleted: false,
                },
              },
              {
                $count: "count",
              },
            ];
          }
          /********************************************************
          Aggregate data for Search filters
        ********************************************************/
          const listing = await model.aggregate(searchfilter);
          const totalCount = await model.aggregate(totalCountFilter);

          return resolve({
            status: 1,
            data: { listing },
            page: bodyData.page,
            perPage: bodyData.pagesize,
            total: totalCount.length > 0 ? totalCount[0].count : 0,
          });
        } catch (error) {
          return reject(error);
        }
      })();
    });
  }
}

module.exports = LanguageController;
