const _ = require("lodash");

const Controller = require("../Base/Controller");
const StaticPages = require("./Schema").StaticPages;
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const Projection = require("./Projection.json");
const { HTTP_CODE } = require("../../services/constant");
const { Languages } = require("../MasterLanguageManagement/Schema");

class StaticPageController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
     @Purpose Add/Update StaticPages
     @Parameter {
        "staticPageId":"",
        "languageId":"",
        "staticCode":"",
        "title":"",
        "slug":"",
        "metaKeywords":"",
        "content":"",
        "postDateTime":"",
        "status":""
     }
     @Return JSON String
  ********************************************************/
  async addUpdateStaticPages() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = [
        "staticPageId",
        "title",
        "slug",
        "metaKeywords",
        "metaDescription",
        "content",
        "postDateTime",
        "status",
        "languageId",
        "staticCode",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      /********************************************************
      Check Static Page for edit 
      ********************************************************/
      if (data.staticPageId) {
        data.updatedBy = this.req.currentUser._id;
        /********************************************************
        Update Static Page data into DB and validate
        ********************************************************/
        const staticPagesData = await StaticPages.findByIdAndUpdate(
          data.staticPageId,
          data,
          { new: true }
        ).exec();

        if (_.isEmpty(staticPagesData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "STATIC_PAGES_NOT_UPDATED"
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
            "STATIC_PAGES_UPDATED_SUCCESSFULLY"
          )
        );
      } else {
        /********************************************************
        Check static Pages title in DB and validate
        ********************************************************/
        if (data.slug) {
          let checkingStaticPage = await StaticPages.findOne({
            slug: data.slug,
            isDeleted: false,
            languageId: data.languageId,
          }).exec();
          if (!_.isEmpty(checkingStaticPage)) {
            return new CommonService().handleReject(
              this.res,
              HTTP_CODE.FAILED,
              HTTP_CODE.SUCCESS_CODE,
              await new CommonService().setMessage(
                this.req.currentUserLang,
                "STATIC_PAGES_ALREADY_EXISTS"
              )
            );
          }
        }

        if (data && !data.staticCode) {
          data.staticCode = await new CommonService().generateRandomString(
            StaticPages,
            "staticCode"
          );
        }
        data.addedBy = this.req.currentUser._id;
        /********************************************************
        Create Static Pages data into DB and validate
        ********************************************************/
        const staticPagesData = await new Model(StaticPages).store(data);
        if (_.isEmpty(staticPagesData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "STATIC_PAGES_NOT_SAVED"
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
            "STATIC_PAGES_ADDED_SUCCESSFULLY"
          )
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error addUpdateStaticPages()", error);
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
    @Purpose Static Page Listing
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
  async staticPageListing() {
    try {
      /********************************************************
      Set Modal for listing
      ********************************************************/
      this.req.body["model"] = StaticPages;

      /********************************************************
      Validate request parameters
      ********************************************************/
      if (_.isEmpty(this.req.body.languageId)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "VALID_LANGUAGE_ID"
          )
        );
      }

      this.req.body["lang"] = this.req.body.languageId;
      let result;
      if (this.req.body.searchText) {
        /********************************************************
        Listing for Search Functionality
        ********************************************************/
        this.req.body["filter"] = ["title"];
        let data = {
          bodyData: this.req.body,
          selectObj: Projection.staticPage,
        };
        result = await StaticPageController.searchMultilingual(data);
      } else {
        /********************************************************
        Listing for filter functionality
        ********************************************************/
        let data = {
          bodyData: this.req.body,
          selectObj: Projection.staticPage,
        };
        result = await StaticPageController.listingMultilingual(data);
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
      console.log("error staticPageListing()", error);
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
     @Purpose delete Static Page
     @Parameter
     {
        "staticPageIds":[""],
     }
     @Return JSON String
     ********************************************************/
  async deleteStaticPage() {
    try {
      /********************************************************
      Update Delete Status
      ********************************************************/
      await StaticPages.updateMany(
        { _id: { $in: this.req.body.staticPageIds } },
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
          "STATIC_PAGES_DELETED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteStaticPage()", error);
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
     @Purpose Static Page Change Status
     @Parameter
     {
        "staticPagesIds":[],
        "status":true/false
     }
     @Return JSON String
     ********************************************************/
  async changeStaticPagesStatus() {
    try {
      /********************************************************
      Update Status
      ********************************************************/
      await StaticPages.updateMany(
        { _id: { $in: this.req.body.staticPagesIds } },
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
      console.log("error changeStaticPagesStatus()", error);
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
     @Purpose get Static Pages details
     @Parameter {id}
     @Return JSON String
     ********************************************************/
  async getStaticPagesDetails() {
    try {
      /********************************************************
      Validate request parameters
      ********************************************************/
      if (
        _.isEmpty(this.req.query.staticCode) ||
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
        Find Static Page details and validate
      ********************************************************/
      const staticPageDetails = await StaticPages.findOne({
        staticCode: this.req.query.staticCode,
        isDeleted: false,
        languageId: this.req.query.languageId,
      })
        .select(Projection.staticPage)
        .exec();

      if (_.isEmpty(staticPageDetails)) {
        const languagePrimary = await Languages.findOne({
          isPrimary: true,
        }).exec();

        const staticPageDetailsOfPrimary = await StaticPages.findOne({
          staticCode: this.req.query.staticCode,
          isDeleted: false,
          languageId: languagePrimary._id,
        })
          .select(Projection.staticPage)
          .exec();

        if (_.isEmpty(staticPageDetailsOfPrimary)) {
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
          {
            slug: staticPageDetailsOfPrimary.slug,
            staticCode: staticPageDetailsOfPrimary.staticCode,
          }
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
        staticPageDetails
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getStaticPagesDetails()", error);
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
     @Purpose get Static Page details
     @Parameter {type}
     @Return JSON String
     ********************************************************/
  async downloadStaticPageDetails() {
    try {
      /********************************************************
        Validate request parameters
        ********************************************************/
      if (
        _.isEmpty(this.req.params.type) ||
        (this.req.params.type !== "csv" && this.req.params.type !== "excel")
      ) {
        return this.res.send({
          status: 0,
          message: await new CommonService().setMessage(
            this.req.currentUserLang,
            "REQUEST_PARAMETERS"
          ),
        });
      }

      const searchfilter = [
        {
          $match: {
            isDeleted: false,
            languageId: this.req.currentUserLang,
          },
        },
        {
          $project: Projection.staticPage,
        },
      ];

      const staticPageDetails = await StaticPages.aggregate(
        searchfilter
      ).exec();

      const download = await new CommonService().downloadFile(
        ["title", "slug", "metaKeywords", "content", "status", "createdAt"],
        "static-page",
        this.req.params.type,
        staticPageDetails
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
      console.log("error downloadStaticPageDetails()", error);
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
              .sort(sort)
              .populate("addedBy", "firstname lastname")
              .populate("updatedBy", "firstname lastname")
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
                  localField: "createdBy",
                  foreignField: "_id",
                  as: "adminCreatedBy",
                },
              },
              {
                $unwind: {
                  path: "$adminCreatedBy",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "admins",
                  localField: "modifiedBy",
                  foreignField: "_id",
                  as: "adminModifiedBy",
                },
              },
              {
                $unwind: {
                  path: "$adminModifiedBy",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: selectObj,
              },
              { $sort: sort },
              {
                $limit: bodyData.pagesize,
              },
              {
                $skip: skip,
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
              .populate("updatedBy", "firstname lastname")
              .skip(skip)
              .limit(bodyData.pagesize)
              .select(selectObj);
            let total = await model.find(filter).distinct("slug");
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
                  const staticPage = await model
                    .findOne({
                      languageId: language._id,
                      isDeleted: false,
                      slug: data.slug,
                    })
                    .populate("addedBy", "firstname lastname")
                    .populate("updatedBy", "firstname lastname")
                    .select(selectObj)
                    .exec();
                  if (staticPage) {
                    newListing.push(staticPage);
                  } else {
                    newListing.push(data);
                  }
                });

                return resolve({
                  status: 1,
                  data: { listing: _.uniqBy(newListing, "slug") },
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
                  localField: "createdBy",
                  foreignField: "_id",
                  as: "adminCreatedBy",
                },
              },
              {
                $unwind: {
                  path: "$adminCreatedBy",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "admins",
                  localField: "modifiedBy",
                  foreignField: "_id",
                  as: "adminModifiedBy",
                },
              },
              {
                $unwind: {
                  path: "$adminModifiedBy",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: selectObj,
              },
              { $sort: sort },
              {
                $limit: bodyData.pagesize,
              },
              {
                $skip: skip,
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
            data: { listing: _.uniqBy(listing, "slug") },
            page: bodyData.page,
            perPage: bodyData.pagesize,
            total:
              totalCount.length > 0 ? _.uniqBy(totalCount, "slug").length : 0,
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

module.exports = StaticPageController;
