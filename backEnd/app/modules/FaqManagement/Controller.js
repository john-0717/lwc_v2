const _ = require("lodash");

const Controller = require("../Base/Controller");
const Faqs = require("./Schema").Faqs;
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const Projection = require("./Projection.json");
const { HTTP_CODE } = require("../../services/constant");
const { Languages } = require("../MasterLanguageManagement/Schema");

class FaqsController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
     @Purpose Add/Update Faq
     @Parameter {
        "faqId":"",
        "languageId":"",
        "faqCode":"",
        "question":"",
        "answer":"",
     }
     @Return JSON String
  ********************************************************/
  async addUpdateFaq() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = ["faqId", "question", "answer", "faqCode", "category"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      /********************************************************
      Check Faq for edit 
      ********************************************************/
      if (data.faqId) {
        data.updatedBy = this.req.currentUser._id;
        /********************************************************
        Update Faq data into DB and validate
        ********************************************************/
        const FaqData = await Faqs.findByIdAndUpdate(data.faqId, data, {
          new: true,
        }).exec();

        if (_.isEmpty(FaqData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "FAQ_NOT_UPDATED"
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
            "FAQ_UPDATED_SUCCESSFULLY"
          )
        );
      } else {
        /********************************************************
         Check Faq title in DB and validate
        ********************************************************/
        if (data.question) {
          let checkQuestion = await Faqs.findOne({
            question: data.question,
            languageId: data.languageId,
            isDeleted: false,
          }).exec();
          if (!_.isEmpty(checkQuestion)) {
            return new CommonService().handleReject(
              this.res,
              HTTP_CODE.FAILED,
              HTTP_CODE.SUCCESS_CODE,
              await new CommonService().setMessage(
                this.req.currentUserLang,
                "FAQ_ALREADY_EXISTS"
              )
            );
          }
        }

        if (data && !data.faqCode) {
          data.faqCode = await new CommonService().generateRandomString(
            Faqs,
            "faqCode"
          );
        }
        data.addedBy = this.req.currentUser._id;
        /********************************************************
        Update Faq data into DB and validate
        ********************************************************/
        const FaqData = await new Model(Faqs).store(data);
        if (_.isEmpty(FaqData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "FAQ_NOT_SAVED"
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
            "FAQ_ADDED_SUCCESSFULLY"
          )
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error addUpdateFaq()", error);
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
    @Purpose Faq Listing
    @Parameter
    {
       "page":1,
       "pagesize":10,
       "sort":{},
       "filter": []
       "searchText":""
    }
    @Return JSON String
    ********************************************************/
  async FaqListing() {
    try {
      /********************************************************
      Set Modal for listing
      ********************************************************/
      this.req.body["model"] = Faqs;

      /********************************************************
      Validate request parameters
      ********************************************************/

      let result;
      if (this.req.body.searchText) {
        /********************************************************
        Listing for Search Functionality
        ********************************************************/
        this.req.body["filter"] = ["question", "answer"];
        let data = {
          bodyData: this.req.body,
          selectObj: Projection.faqListing,
        };
        result = await FaqsController.search(data);
      } else {
        /********************************************************
        Listing for filter functionality
        ********************************************************/
        let data = {
          bodyData: this.req.body,
          selectObj: Projection.faqListing,
        };
        result = await FaqsController.listing(data);
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
        result.data,
        null,
        result.page,
        result.perPage,
        result.total
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error FaqListing()", error);
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
     @Purpose delete Faq
     @Parameter
     {
        "faqIds":[""],
     }
     @Return JSON String
     ********************************************************/
  async deleteFaq() {
    try {
      /********************************************************
      Update Delete Status
      ********************************************************/
      await Faqs.updateMany(
        { _id: { $in: this.req.body.faqIds } },
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
          "FAQ_DELETED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteFaq()", error);
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
     @Purpose Faq Change Status
     @Parameter
     {
        "faqIds":[],
        "status":true/false
     }
     @Return JSON String
     ********************************************************/
  async changeFaqStatus() {
    try {
      /********************************************************
      Update Status
      ********************************************************/
      await Faqs.updateMany(
        { _id: { $in: this.req.body.faqIds } },
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
      console.log("error changeFaqStatus()", error);
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
     @Purpose get Faq details
     @Parameter {id}
     @Return JSON String
     ********************************************************/
  async getFaqDetails() {
    try {
      /********************************************************
      Validate request parameters
      ********************************************************/
      if (
        _.isEmpty(this.req.query.faqCode)
        //|| _.isEmpty(this.req.query.languageId)
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
        Find Faq details and validate
      ********************************************************/
      const FaqDetails = await Faqs.findOne({
        faqCode: this.req.query.faqCode,
        //languageId: this.req.query.languageId,
        isDeleted: false,
      })
        .populate("addedBy", "firstname lastname")
        .populate("category", "faqCategoryCode category status")
        .select(Projection.faqListing)
        .exec();

      if (_.isEmpty(FaqDetails)) {
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
        FaqDetails
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getFaqDetails()", error);
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
   @Purpose Service for listing records
   @Parameter
   {
      data:{
          bodyData:{},
          model:{}
      }
   }
   @Return JSON String
   ********************************************************/
  static listing(data) {
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
                $lookup: {
                  from: "faqcategories",
                  localField: "category",
                  foreignField: "_id",
                  as: "categoryData",
                },
              },
              {
                $unwind: {
                  path: "$categoryData",
                  includeArrayIndex: "arrayIndex",
                  preserveNullAndEmptyArrays: true,
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
  static search(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          let model = data.bodyData.model;
          let bodyData = data.bodyData;
          let filter = bodyData.filter;
          let lang = data.bodyData.lang;
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
                  languageId: lang,
                },
              },
              {
                $lookup: {
                  from: "faqcategories",
                  localField: "category",
                  foreignField: "_id",
                  as: "categoryData",
                },
              },
              {
                $unwind: {
                  path: "$categoryData",
                  includeArrayIndex: "arrayIndex",
                  preserveNullAndEmptyArrays: true,
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
                  languageId: lang,
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

  /********************************************************
   @Purpose Service for listing Multilingual records
   @Parameter
   {
      data:{
          bodyData:{},
          model:{}
      }
   }
   @Return JSON String
   ********************************************************/
  static listingMultilingual(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let bodyData = data.bodyData;
          let model = data.bodyData.model;
          let lang = data.bodyData.lang;
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          const languageEN = await Languages.findOne({
            isPrimary: true,
          }).exec();
          const language = await Languages.findOne({ _id: lang }).exec();
          data.staticFilter =
            bodyData.filter && bodyData.filter.length === 0
              ? {}
              : { languageId: languageEN._id };
          /********************************************************
        Check page and pagesize
        ********************************************************/
          if (bodyData.page && bodyData.pagesize) {
            let skip = (bodyData.page - 1) * bodyData.pagesize;
            let sort = bodyData.sort ? bodyData.sort : { createdAt: -1 };
            let filter = await new CommonService().constructCustomFilter({
              filter: bodyData.filter,
              condition: bodyData.condition ? bodyData.condition : "$and",
              staticFilter: data.staticFilter,
            });

            let listing;
            /********************************************************
          list and count data according to filter query
          ********************************************************/
            listing = await model
              .find(filter)
              .sort(sort)
              .populate("addedBy", "firstname lastname")
              .skip(skip)
              .limit(bodyData.pagesize)
              .select(selectObj);
            let total = await model.find(filter).distinct("faqCode");
            total = total.length;
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
              if (language.isPrimary === true) {
                return resolve({
                  status: 1,
                  data: { listing },
                  page: bodyData.page,
                  perPage: bodyData.pagesize,
                  total: total,
                });
              } else {
                let newListing = [];
                await this.asyncForEach(listing, async (data) => {
                  const faq = await model
                    .findOne({
                      languageId: language._id,
                      isDeleted: false,
                      faqCode: data.faqCode,
                    })
                    .populate("addedBy", "firstname lastname")
                    .select(selectObj)
                    .exec();
                  if (faq) {
                    newListing.push(faq);
                  } else {
                    newListing.push(data);
                  }
                });

                return resolve({
                  status: 1,
                  data: { listing: _.uniqBy(newListing, "faqCode") },
                  page: bodyData.page,
                  perPage: bodyData.pagesize,
                  total: total,
                });
              }
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
     @Purpose Service for searching Multilingual records
     @Parameter
     {
        data:{
            bodyData:{},
            model:{}
        }
     }
     @Return JSON String
     ********************************************************/
  static searchMultilingual(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          let model = data.bodyData.model;
          let bodyData = data.bodyData;
          let filter = bodyData.filter;
          let sort = bodyData.sort ? bodyData.sort : { createdAt: -1 };
          let skip = (bodyData.page - 1) * bodyData.pagesize;
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
                $lookup: {
                  from: "admins",
                  localField: "addedBy",
                  foreignField: "_id",
                  as: "addedBy",
                },
              },
              {
                $unwind: {
                  path: "$addedBy",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "admins",
                  localField: "updatedBy",
                  foreignField: "_id",
                  as: "updatedBy",
                },
              },
              {
                $unwind: {
                  path: "$updatedBy",
                  preserveNullAndEmptyArrays: true,
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
            ];
          }
          /********************************************************
          Aggregate data for Search filters
        ********************************************************/
          const listing = await model.aggregate(searchfilter);
          const totalCount = await model.aggregate(totalCountFilter);

          return resolve({
            status: 1,
            data: { listing: _.uniqBy(listing, "faqCode") },
            page: bodyData.page,
            perPage: bodyData.pagesize,
            total:
              totalCount.length > 0
                ? _.uniqBy(totalCount, "faqCode").length
                : 0,
          });
        } catch (error) {
          return reject(error);
        }
      })();
    });
  }

  static async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}

module.exports = FaqsController;
