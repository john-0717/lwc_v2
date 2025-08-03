const _ = require("lodash");

const Controller = require("../Base/Controller");
const FaqCategories = require("./Schema").FaqCategories;
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const Projection = require("./Projection.json");
const { HTTP_CODE } = require("../../services/constant");
const { Languages } = require("../MasterLanguageManagement/Schema");

class FaqCategoriesController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
     @Purpose Add/Update FAQs Categories
     @Parameter {
        "faqCategoryId":"",
        "languageId":"",
        "faqCategoryCode":"",
        "category":""
     }
     @Return JSON String
  ********************************************************/
  async addUpdateFaqCategories() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = ["faqCategoryId", "category", "faqCategoryCode"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      /********************************************************
      Check faqCategoryId for edit 
      ********************************************************/
      if (data.faqCategoryId) {
        data.updatedBy = this.req.currentUser._id;
        /********************************************************
        Update Faq Categories data into DB and validate
        ********************************************************/
        const FaqCategoriesData = await FaqCategories.findByIdAndUpdate(
          data.faqCategoryId,
          data,
          { new: true }
        ).exec();

        if (_.isEmpty(FaqCategoriesData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "FAQ_CATEGORY_NOT_UPDATED"
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
            "FAQ_CATEGORY_UPDATED_SUCCESSFULLY"
          )
        );
      } else {
        /********************************************************
        Update faqs Categories data into DB and validate
        ********************************************************/
        if (data.category) {
          let checkCategory = await FaqCategories.findOne({
            category: data.category,
            //   languageId: data.languageId,
            isDeleted: false,
          }).exec();
          if (!_.isEmpty(checkCategory)) {
            return new CommonService().handleReject(
              this.res,
              HTTP_CODE.FAILED,
              HTTP_CODE.SUCCESS_CODE,
              await new CommonService().setMessage(
                this.req.currentUserLang,
                "FAQ_CATEGORY_ALREADY_EXISTS"
              )
            );
          }
        }

        if (data && !data.faqCategoryCode) {
          data.faqCategoryCode = await new CommonService().generateRandomString(
            FaqCategories,
            "faqCategoryCode"
          );
        }
        data.addedBy = this.req.currentUser._id;
        const FaqCategoriesData = await new Model(FaqCategories).store(data);
        if (_.isEmpty(FaqCategoriesData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "FAQ_CATEGORY_NOT_SAVED"
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
            "FAQ_CATEGORY_ADDED_SUCCESSFULLY"
          )
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error addUpdateFaqCategories()", error);
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
    @Purpose Faqs Categories Listing
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
  async FaqCategoriesListing() {
    try {
      /********************************************************
      Set Modal for listing
      ********************************************************/
      this.req.body["model"] = FaqCategories;

      /********************************************************
      Validate request parameters
      ********************************************************/

      this.req.body["lang"] = this.req.body.languageId;

      let result;
      if (this.req.body.searchText) {
        /********************************************************
        Listing for Search Functionality
        ********************************************************/
        this.req.body["filter"] = ["category"];
        let data = {
          bodyData: this.req.body,
          selectObj: Projection.faqCategories,
        };
        result = await FaqCategoriesController.search(data);
      } else {
        /********************************************************
        Listing for filter functionality
        ********************************************************/
        let data = {
          bodyData: this.req.body,
          selectObj: Projection.faqCategories,
        };
        result = await FaqCategoriesController.listing(data);
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
      console.log("error FaqCategoriesListing()", error);
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
     @Purpose delete faqs Categories
     @Parameter
     {
        "faqCategoriesIds":[""],
     }
     @Return JSON String
     ********************************************************/
  async deleteFaqCategories() {
    try {
      /********************************************************
      Update Delete Status
      ********************************************************/
      await FaqCategories.updateMany(
        { _id: { $in: this.req.body.faqCategoriesIds } },
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
          "FAQ_CATEGORY_DELETED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteFaqCategories()", error);
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
     @Purpose Faq Categories Change Status
     @Parameter
     {
        "faqCategoriesIds":[],
        "status":true/false
     }
     @Return JSON String
     ********************************************************/
  async changeFaqCategoriesStatus() {
    try {
      /********************************************************
      Update Status
      ********************************************************/
      await FaqCategories.updateMany(
        { _id: { $in: this.req.body.faqCategoriesIds } },
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
      console.log("error changeFaqCategoriesStatus()", error);
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
     @Purpose get Faq Categories details
     @Parameter {faqCategoryCode,languageId}
     @Return JSON String
     ********************************************************/
  async getFaqCategoriesDetails() {
    try {
      /********************************************************
      Validate request parameters
      ********************************************************/
      if (
        _.isEmpty(this.req.query.faqCategoryCode) ||
        _.isEmpty(this.req.query.languageId)
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
        Find FaqCategories details and validate
      ********************************************************/
      const FaqCategoriesDetails = await FaqCategories.findOne({
        faqCategoryCode: this.req.query.faqCategoryCode,
        languageId: this.req.query.languageId,
        isDeleted: false,
      })
        .populate("addedBy", "firstname lastname")
        .select(Projection.faqCategories)
        .exec();

      if (_.isEmpty(FaqCategoriesDetails)) {
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
        FaqCategoriesDetails
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getFaqCategoriesDetails()", error);
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
     @Purpose get Faq Categories List
     @Parameter {}
     @Return JSON String
     ********************************************************/
  async getFaqCategoriesList() {
    try {
      /********************************************************
        Find Faq Categories details and validate
      ********************************************************/
      const FaqCategoriesListDetails = await FaqCategories.find({
        languageId: this.req.currentUserLang,
        isDeleted: false,
        status: true,
      })
        .select(Projection.list)
        .exec();

      if (_.isEmpty(FaqCategoriesListDetails)) {
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
        FaqCategoriesListDetails
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getFaqCategoriesList()", error);
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
          data.staticFilter = {};
          let bodyData = data.bodyData;
          let model = data.bodyData.model;
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          /********************************************************
        Check page and pagesize
        ********************************************************/
          if (bodyData.page && bodyData.pagesize) {
            let skip = (bodyData.page - 1) * bodyData.pagesize;
            let sort = bodyData.sort ? bodyData.sort : { createdAt: -1 };
            /********************************************************
          Construct filter query
          ********************************************************/
            let filter = await new CommonService().constructFilter({
              filter: bodyData.filter,
              searchText: bodyData.searchText,
              search: data.bodyData.search ? data.bodyData.search : false,
              schema: data.schema,
              staticFilter: data.staticFilter,
            });
            let listing;
            /********************************************************
          list and count data according to filter query
          ********************************************************/
            listing = await model
              .find(filter)
              .populate("addedBy", "firstname lastname")
              .sort(sort)
              .skip(skip)
              .limit(bodyData.pagesize)
              .select(selectObj);
            const total = await model.find(filter).countDocuments();
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
                total: total,
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
                $project: selectObj,
              },
              { $sort: sort },
              {
                $skip: skip,
              },
              {
                $limit: bodyData.pagesize,
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
          const languageEN = await Languages.findOne({ isPrimary: true });
          const language = await Languages.findOne({ _id: lang });
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
              .populate("updatedBy", "firstname lastname")
              .skip(skip)
              .limit(bodyData.pagesize)
              .select(selectObj);
            let total = await model.find(filter).distinct("faqCategoryCode");
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
                  const faqCategory = await model
                    .findOne({
                      languageId: language._id,
                      isDeleted: false,
                      faqCategoryCode: data.faqCategoryCode,
                    })
                    .populate("addedBy", "firstname lastname")
                    .populate("updatedBy", "firstname lastname")
                    .select(selectObj)
                    .exec();
                  if (faqCategory) {
                    newListing.push(staticPage);
                  } else {
                    newListing.push(data);
                  }
                });

                return resolve({
                  status: 1,
                  data: {
                    listing: _.uniqBy(newListing, "faqCategoryCode"),
                  },
                  page: bodyData.page,
                  perPage: bodyData.pagesize,
                  total: total,
                });
              }
            }
          } else {
            return resolve({
              status: 0,
              message: "page and pagesize required.",
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
                $limit: bodyData.pagesize,
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
            data: { listing: _.uniqBy(listing, "faqCategoryCode") },
            page: bodyData.page,
            perPage: bodyData.pagesize,
            total:
              totalCount.length > 0
                ? _.uniqBy(totalCount, "faqCategoryCode").length
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

module.exports = FaqCategoriesController;
