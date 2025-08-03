const _ = require("lodash");

const Controller = require("../Base/Controller");
const BlogCategories = require("./Schema").BlogCategories;
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const Projection = require("./Projection.json");
const { HTTP_CODE } = require("../../services/constant");
const { Languages } = require("../MasterLanguageManagement/Schema");
const { ColumnSettings } = require("../Common/Schema");

class BlogCategoriesController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
     @Purpose Add/Update Blog Categories
     @Parameter {
        "blogCategoriesId":"",
        "category":"",
        "color":"",
        "status":"",
        "blogCategoryCode":"",
        "languageId":""
     }
     @ReturnJSON String
  ********************************************************/
  async addUpdateBlogCategories() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = [
        "blogCategoriesId",
        "category",
        "color",
        "status",
        "blogCategoryCode",
        "languageId",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      /********************************************************
      Check blogCategoriesId for edit 
      ********************************************************/
      if (data.blogCategoriesId) {
        data.updatedBy = this.req.currentUser._id;
        /********************************************************
        Update blog Categories data into DB and validate
        ********************************************************/
        const blogCategoriesData = await BlogCategories.findByIdAndUpdate(
          data.blogCategoriesId,
          data,
          { new: true }
        ).exec();

        if (_.isEmpty(blogCategoriesData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNPROCESSABLE_ENTITY,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "BLOG_CATEGORY_NOT_UPDATED"
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
            "BLOG_CATEGORY_UPDATED_SUCCESSFULLY"
          )
        );
      } else {
        if (data.category) {
          let checkCategory = await BlogCategories.findOne({
            category: data.category,
            languageId: data.languageId,
            isDeleted: false,
          }).exec();
          if (!_.isEmpty(checkCategory)) {
            return new CommonService().handleReject(
              this.res,
              HTTP_CODE.FAILED,
              HTTP_CODE.CONFLICT_CODE,
              await new CommonService().setMessage(
                this.req.currentUserLang,
                "BLOG_CATEGORY_ALREADY_EXISTS"
              )
            );
          }
        }

        if (data && !data.blogCategoryCode) {
          data.blogCategoryCode =
            await new CommonService().generateRandomString(
              BlogCategories,
              "blogCategoryCode"
            );
        }
        data.addedBy = this.req.currentUser._id;
        /********************************************************
        Update blog Categories data into DB and validate
        ********************************************************/
        const blogCategoriesData = await new Model(BlogCategories).store(data);
        if (_.isEmpty(blogCategoriesData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNPROCESSABLE_ENTITY,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "BLOG_CATEGORY_NOT_SAVED"
            )
          );
        }
        /********************************************************
        Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.RESOURCE_CREATED_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "BLOG_CATEGORY_ADDED_SUCCESSFULLY"
          )
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error addUpdateBlogCategories()", error);
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
    @Purpose Blog Categories Listing
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
  async blogCategoriesListing() {
    try {
      /********************************************************
      Set Modal for listing
      ********************************************************/
      this.req.body["model"] = BlogCategories;

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
        this.req.body["filter"] = ["category"];
        let data = {
          bodyData: this.req.body,
          selectObj: Projection.blogCategories,
        };
        result = await BlogCategoriesController.searchMultilingual(data);
      } else {
        /********************************************************
        Listing for filter functionality
        ********************************************************/
        let data = {
          bodyData: this.req.body,
          selectObj: Projection.blogCategories,
        };
        result = await BlogCategoriesController.listingMultilingual(data);
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
      console.log("error blogCategoriesListing()", error);
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
     @Purpose delete Blog Categories
     @Parameter
     {
        "blogCategoriesIds":[""],
     }
     @Return JSON String
     ********************************************************/
  async deleteBlogCategories() {
    try {
      /********************************************************
      Update Delete Status
      ********************************************************/
      await BlogCategories.updateMany(
        { _id: { $in: this.req.body.blogCategoriesIds } },
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
          "BLOG_CATEGORY_DELETED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteBlogCategories()", error);
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
     @Purpose Blog Categories Change Status
     @Parameter
     {
        "blogCategoriesIds":[],
        "status":true/false
     }
     @Return JSON String
  ********************************************************/
  async changeBlogCategoriesStatus() {
    try {
      /********************************************************
      Update Status
      ********************************************************/
      await BlogCategories.updateMany(
        { _id: { $in: this.req.body.blogCategoriesIds } },
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
      console.log("error changeBlogCategoriesStatus()", error);
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
     @Purpose get Blog Categories details
     @Parameter {id}
     @Return JSON String
  ********************************************************/
  async getBlogCategoriesDetails() {
    try {
      /********************************************************
      Validate request parameters
      ********************************************************/
      if (
        _.isEmpty(this.req.query.blogCategoryCode) ||
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
        Find blogCategories details and validate
      ********************************************************/
      const blogCategoriesDetails = await BlogCategories.findOne({
        blogCategoryCode: this.req.query.blogCategoryCode,
        languageId: this.req.query.languageId,
        isDeleted: false,
      })
        .select(Projection.blogCategories)
        .exec();

      if (_.isEmpty(blogCategoriesDetails)) {
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
        blogCategoriesDetails
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getBlogCategoriesDetails()", error);
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
     @Purpose get Blog Categories List
     @Parameter {}
     @Return JSON String
     ********************************************************/
  async getBlogCategoriesList() {
    try {
      /********************************************************
      Validate request parameters
      ********************************************************/
      if (_.isEmpty(this.req.query.languageId)) {
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

      const languageEN = await Languages.findOne({ isPrimary: true }).exec();
      const listing = await BlogCategories.find({
        languageId: languageEN._id,
        isDeleted: false,
        status: true,
      })
        .select(Projection.list)
        .exec();
      const language = await Languages.findOne({
        _id: this.req.query.languageId,
      }).exec();
      if (language.isPrimary) {
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
          listing
        );
      } else {
        let newListing = [];
        await BlogCategoriesController.asyncForEach(listing, async (data) => {
          const blogCategories = await BlogCategories.findOne({
            languageId: this.req.query.languageId,
            isDeleted: false,
            blogCategoryCode: data.blogCategoryCode,
          })
            .select(Projection.list)
            .exec();
          if (blogCategories) {
            newListing.push(blogCategories);
          } else {
            newListing.push(data);
          }
        });
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
          newListing
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getBlogCategoriesList()", error);
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
     @Purpose get Blog Category details
     @Parameter {type}
     @Return JSON String
     ********************************************************/
  async downloadBlogCategoryDetails() {
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
          $project: Projection.blogCategories,
        },
      ];

      const blogCategoryDetails = await BlogCategories.aggregate(
        searchfilter
      ).exec();

      const download = await new CommonService().downloadFile(
        [
          "category",
          "slug",
          "metaKeywords",
          "tags",
          "color",
          "status",
          "status",
          "createdAt",
        ],
        "blog-category",
        this.req.params.type,
        blogCategoryDetails
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
      console.log("error downloadBlogCategoryDetails()", error);
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
            const searchfilter = [
              {
                $match: filter,
              },
              {
                $lookup: {
                  from: "blogs",
                  localField: "_id",
                  foreignField: "category",
                  as: "blogsDetails",
                },
              },
              {
                $unwind: {
                  path: "$blogsDetails",
                  includeArrayIndex: "arrayIndex",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $group: {
                  _id: "$_id",
                  category: {
                    $first: "$category",
                  },
                  status: {
                    $first: "$status",
                  },
                  color: {
                    $first: "$color",
                  },
                  count: {
                    $sum: {
                      $cond: {
                        if: {
                          $eq: [false, "$blogsDetails.isDeleted"],
                        },
                        then: 1,
                        else: 0,
                      },
                    },
                  },
                  createdAt: {
                    $first: "$createdAt",
                  },
                },
              },
              { $sort: sort },
              {
                $limit: bodyData.pagesize,
              },
              {
                $skip: skip,
              },
            ];
            listing = await model.aggregate(searchfilter);
            /********************************************************
          list and count data according to filter query
          ********************************************************/
            const total = await model.find(filter).countDocuments();
            let columnKey = data.bodyData.columnKey;
            if (columnKey) {
              let columnSettings = await ColumnSettings.findOne({
                key: columnKey,
              }).select({ _id: 0, "columns._id": 0 });
              columnSettings =
                columnSettings &&
                columnSettings.column &&
                Array.isArray(columnSettings.column)
                  ? columnSettings.column
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
                  from: "blogs",
                  localField: "_id",
                  foreignField: "category",
                  as: "blogsDetails",
                },
              },
              {
                $unwind: {
                  path: "$blogsDetails",
                  includeArrayIndex: "arrayIndex",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $group: {
                  _id: "$_id",
                  category: {
                    $first: "$category",
                  },
                  status: {
                    $first: "$status",
                  },
                  color: {
                    $first: "$color",
                  },
                  count: {
                    $sum: {
                      $cond: {
                        if: {
                          $eq: [false, "$blogsDetails.isDeleted"],
                        },
                        then: 1,
                        else: 0,
                      },
                    },
                  },
                  createdAt: {
                    $first: "$createdAt",
                  },
                },
              },
              {
                $skip: skip,
              },
              { $sort: sort },
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
          const languageEN = await Languages.findOne({
            isPrimary: true,
          }).exec();
          const language = await Languages.findOne({ _id: lang }).exec();
          data.staticFilter = { languageId: languageEN._id };
          /********************************************************
        Check page and pagesize
        ********************************************************/
          if (bodyData.page && bodyData.pagesize) {
            let skip = (bodyData.page - 1) * bodyData.pagesize;
            let sort = bodyData.sort ?? { createdAt: -1 };
            let filter = await new CommonService().constructCustomFilter({
              filter: bodyData.filter,
              condition: bodyData.condition ?? "$and",
              staticFilter: data.staticFilter,
            });

            let listing;
            /********************************************************
          list and count data according to filter query
          ********************************************************/
            const searchfilter = [
              {
                $match: filter,
              },
              {
                $lookup: {
                  from: "blogs",
                  localField: "_id",
                  foreignField: "category",
                  as: "blogsDetails",
                },
              },
              {
                $unwind: {
                  path: "$blogsDetails",
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
                $group: {
                  _id: "$_id",
                  category: {
                    $first: "$category",
                  },
                  status: {
                    $first: "$status",
                  },
                  color: {
                    $first: "$color",
                  },
                  blogCategoryCode: {
                    $first: "$blogCategoryCode",
                  },
                  count: {
                    $sum: {
                      $cond: {
                        if: {
                          $eq: [false, "$blogsDetails.isDeleted"],
                        },
                        then: 1,
                        else: 0,
                      },
                    },
                  },
                  createdAt: {
                    $first: "$createdAt",
                  },
                  updatedAt: {
                    $first: "$updatedAt",
                  },
                  createdBy: {
                    $first: "$addedBy.firstname",
                  },
                  updatedBy: {
                    $first: "$updatedBy.firstname",
                  },
                  languageId: {
                    $first: "$languageId",
                  },
                },
              },
              { $sort: sort },
              {
                $skip: skip,
              },
              {
                $limit: bodyData.pagesize,
              },
            ];
            listing = await model.aggregate(searchfilter);

            let total = await model.find(filter).distinct("blogCategoryCode");
            total = total.length;
            if (language.isPrimary) {
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
                const searchfilter = [
                  {
                    $match: {
                      languageId: language._id,
                      isDeleted: false,
                      blogCategoryCode: data.blogCategoryCode,
                    },
                  },
                  {
                    $lookup: {
                      from: "blogs",
                      localField: "_id",
                      foreignField: "category",
                      as: "blogsDetails",
                    },
                  },
                  {
                    $unwind: {
                      path: "$blogsDetails",
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
                    $group: {
                      _id: "$_id",
                      category: {
                        $first: "$category",
                      },
                      status: {
                        $first: "$status",
                      },
                      color: {
                        $first: "$color",
                      },
                      blogCategoryCode: {
                        $first: "$blogCategoryCode",
                      },
                      count: {
                        $sum: {
                          $cond: {
                            if: {
                              $eq: [false, "$blogsDetails.isDeleted"],
                            },
                            then: 1,
                            else: 0,
                          },
                        },
                      },
                      createdAt: {
                        $first: "$createdAt",
                      },
                      updatedAt: {
                        $first: "$updatedAt",
                      },
                      createdBy: {
                        $first: "$addedBy.firstname",
                      },
                      updatedBy: {
                        $first: "$updatedBy.firstname",
                      },
                      languageId: {
                        $first: "$languageId",
                      },
                    },
                  },
                  { $sort: sort },
                  {
                    $limit: bodyData.pagesize,
                  },
                  {
                    $skip: skip,
                  },
                ];
                const blogCategory = await model.aggregate(searchfilter);

                if (blogCategory.length) {
                  newListing.push(blogCategory[0]);
                } else {
                  newListing.push(data);
                }
              });

              return resolve({
                status: 1,
                data: {
                  listing: _.uniqBy(newListing, "blogCategoryCode"),
                },
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
                  from: "blogs",
                  localField: "_id",
                  foreignField: "category",
                  as: "blogsDetails",
                },
              },
              {
                $unwind: {
                  path: "$blogsDetails",
                  includeArrayIndex: "arrayIndex",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $group: {
                  _id: "$_id",
                  category: {
                    $first: "$category",
                  },
                  status: {
                    $first: "$status",
                  },
                  blogCategoryCode: {
                    $first: "$blogCategoryCode",
                  },
                  color: {
                    $first: "$color",
                  },
                  count: {
                    $sum: {
                      $cond: {
                        if: {
                          $eq: [false, "$blogsDetails.isDeleted"],
                        },
                        then: 1,
                        else: 0,
                      },
                    },
                  },
                  createdAt: {
                    $first: "$createdAt",
                  },
                },
              },
              {
                $skip: skip,
              },
              { $sort: sort },
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
            data: { listing: _.uniqBy(listing, "blogCategoryCode") },
            page: bodyData.page,
            perPage: bodyData.pagesize,
            total:
              totalCount.length > 0
                ? _.uniqBy(totalCount, "blogCategoryCode").length
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

module.exports = BlogCategoriesController;
