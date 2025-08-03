const _ = require("lodash");

const Controller = require("../Base/Controller");
const Blogs = require("./Schema").Blogs;
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const Projection = require("./Projection.json");
const { HTTP_CODE } = require("../../services/constant");
const { Languages } = require("../MasterLanguageManagement/Schema");

class BlogsController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
     @Purpose Add/Update Blog
     @Parameter {
        "blogId":"",
        "blogCode":"",
        "languageId":"",
        "title":"",
        "slug":"",
        "metaKeywords":"",
        "category":"",
        "metaDescription":"",
        "content":"",
        "media":"",
        "tags":"",
        "publishStatus":""
     }
     @Return JSON String
  ********************************************************/
  async addUpdateBlog() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = [
        "blogId",
        "title",
        "slug",
        "metaKeywords",
        "category",
        "metaDescription",
        "content",
        "media",
        "tags",
        "publishStatus",
        "blogCode",
        "languageId",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      /********************************************************
      Check Blog for edit 
      ********************************************************/
      if (data.blogId) {
        data.updatedBy = this.req.currentUser._id;
        /********************************************************
        Update Blog data into DB and validate
        ********************************************************/
        const blogData = await Blogs.findByIdAndUpdate(data.blogId, data, {
          new: true,
        }).exec();

        if (_.isEmpty(blogData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "BLOG_NOT_UPDATED"
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
            "BLOG_UPDATED_SUCCESSFULLY"
          )
        );
      } else {
        /********************************************************
        Check Blog title in DB and validate
        ********************************************************/
        if (data.title) {
          let checkTitle = await Blogs.findOne({
            title: data.title,
            isDeleted: false,
            languageId: data.languageId,
          }).exec();
          if (!_.isEmpty(checkTitle)) {
            return new CommonService().handleReject(
              this.res,
              HTTP_CODE.FAILED,
              HTTP_CODE.SUCCESS_CODE,
              await new CommonService().setMessage(
                this.req.currentUserLang,
                "BLOG_ALREADY_EXISTS"
              )
            );
          }
        }

        if (data && !data.blogCode) {
          data.blogCode = await new CommonService().generateRandomString(
            Blogs,
            "blogCode"
          );
        }
        data.addedBy = this.req.currentUser._id;
        /********************************************************
        Update blog data into DB and validate
        ********************************************************/
        const blogData = await new Model(Blogs).store(data);
        if (_.isEmpty(blogData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "BLOG_NOT_SAVED"
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
            "BLOG_ADDED_SUCCESSFULLY"
          )
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error addUpdateBlog()", error);
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
    @Purpose Blog Listing
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
  async blogListing() {
    try {
      /********************************************************
      Set Modal for listing
      ********************************************************/
      this.req.body["model"] = Blogs;

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
          selectObj: Projection.blog,
        };
        result = await BlogsController.searchMultilingual(data);
      } else {
        /********************************************************
        Listing for filter functionality
        ********************************************************/
        let data = {
          bodyData: this.req.body,
          selectObj: Projection.blog,
        };
        result = await BlogsController.listingMultilingual(data);
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
      console.log("error blogListing()", error);
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
     @Purpose delete Blog
     @Parameter
     {
        "blogIds":[""],
     }
     @Return JSON String
     ********************************************************/
  async deleteBlog() {
    try {
      /********************************************************
      Update Delete Status
      ********************************************************/
      await Blogs.updateMany(
        { _id: { $in: this.req.body.blogIds } },
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
          "BLOG_DELETED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteBlog()", error);
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
     @Purpose Blog Change Status
     @Parameter
     {
        "blogIds":[],
        "status":true/false
     }
     @Return JSON String
     ********************************************************/
  async changeBlogStatus() {
    try {
      /********************************************************
      Update Status
      ********************************************************/
      await Blogs.updateMany(
        { _id: { $in: this.req.body.blogIds } },
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
      console.log("error changeBlogStatus()", error);
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
     @Purpose Blog Change Status
     @Parameter
     {
        "blogIds":[],
        "status":true/false
     }
     @Return JSON String
     ********************************************************/
  async changePublishStatus() {
    try {
      /********************************************************
      Update Status
      ********************************************************/
      if (this.req.body.status) {
        await Blogs.updateMany(
          { _id: { $in: this.req.body.blogIds } },
          {
            $set: {
              publishStatus: this.req.body.status,
              publishDateTime: new Date(),
              publishBy: this.req.currentUser._id,
            },
          }
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
            "BLOG_PUBLISH_SUCCESSFULLY"
          )
        );
      } else {
        await Blogs.updateMany(
          { _id: { $in: this.req.body.blogIds } },
          { $set: { publishStatus: this.req.body.status } }
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
            "BLOG_UN_PUBLISH_SUCCESSFULLY"
          )
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error changeBlogStatus()", error);
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
     @Purpose get Blog details
     @Parameter {blogCode,languageId}
     @Return JSON String
     ********************************************************/
  async getBlogDetails() {
    try {
      /********************************************************
      Validate request parameters
      ********************************************************/
      if (
        _.isEmpty(this.req.query.blogCode) ||
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
        Find blog details and validate
      ********************************************************/
      const blogDetails = await Blogs.findOne({
        blogCode: this.req.query.blogCode,
        languageId: this.req.query.languageId,
        isDeleted: false,
      })
        .populate("category", "category color")
        .populate("addedBy", "firstname lastname")
        .select(Projection.blog)
        .exec();

      if (_.isEmpty(blogDetails)) {
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
        blogDetails
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getBlogDetails()", error);
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
     @Purpose get Blog details
     @Parameter {type}
     @Return JSON String
     ********************************************************/
  async downloadBlogDetails() {
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
          $lookup: {
            from: "blogcategories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: {
            path: "$category",
            includeArrayIndex: "arrayIndex",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: Projection.blog,
        },
      ];

      const blogDetails = await Blogs.aggregate(searchfilter).exec();

      const download = await new CommonService().downloadFile(
        [
          "title",
          "slug",
          "metaKeywords",
          "category",
          "description",
          "media",
          "content",
          "tags",
          "publishDateTime",
          "publish",
          "createdAt",
        ],
        "blog",
        this.req.params.type,
        blogDetails
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
      console.log("error downloadBlogDetails()", error);
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
          let lang = data.bodyData.lang;
          data.staticFilter = { languageId: lang };
          let bodyData = data.bodyData;
          let model = data.bodyData.model;
          let selectObj = data.selectObj ?? { __v: 0 };
          /********************************************************
        Check page and pagesize
        ********************************************************/
          if (bodyData.page && bodyData.pagesize) {
            let skip = (bodyData.page - 1) * bodyData.pagesize;
            let sort = bodyData.sort ?? { createdAt: -1 };
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
              .populate("category", "category color")
              .populate("addedBy", "firstname lastname")
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
          let lang = data.bodyData.lang;
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
                  languageId: lang,
                  isDeleted: false,
                },
              },
              {
                $lookup: {
                  from: "blogcategories",
                  localField: "category",
                  foreignField: "_id",
                  as: "category",
                },
              },
              {
                $unwind: {
                  path: "$category",
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
                $limit: bodyData.pagesize,
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
              .populate("category", "category color")
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
                await this.asyncForEach(listing, async (dataListing) => {
                  const blog = await model
                    .findOne({
                      languageId: language._id,
                      isDeleted: false,
                      blogCode: dataListing.blogCode,
                    })
                    .populate("category", "category color")
                    .populate("addedBy", "firstname lastname")
                    .populate("updatedBy", "firstname lastname")
                    .select(selectObj)
                    .exec();
                  if (blog) {
                    newListing.push(blog);
                  } else {
                    newListing.push(dataListing);
                  }
                });

                return resolve({
                  status: 1,
                  data: { listing: _.uniqBy(newListing, "blogCode") },
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
                  from: "blogcategories",
                  localField: "category",
                  foreignField: "_id",
                  as: "category",
                },
              },
              {
                $unwind: {
                  path: "$category",
                  includeArrayIndex: "arrayIndex",
                  preserveNullAndEmptyArrays: true,
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
            data: { listing: _.uniqBy(listing, "blogCode") },
            page: bodyData.page,
            perPage: bodyData.pagesize,
            total:
              totalCount.length > 0
                ? _.uniqBy(totalCount, "blogCode").length
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

module.exports = BlogsController;
