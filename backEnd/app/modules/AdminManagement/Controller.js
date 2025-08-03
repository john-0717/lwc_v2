const i18n = require("i18n");
const _ = require("lodash");

const Controller = require("../Base/Controller");
const Admin = require("../Admin/Schema").Admin;
const Model = require("../Base/Model");
const Globals = require("../../../configs/Globals");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const adminProjection = require("./Projection.json");
const { RolesSchema, PermissionsSchema } = require("../Roles/Schema");
const Email = require("../../services/Email");
const config = require("../../../configs/configs");
const { HTTP_CODE, EMAIL_TEMPLATE_KEYS } = require("../../services/constant");
const ObjectId = require("mongoose").Types.ObjectId;
const EmailService = require("../../services/Email");
const { ColumnSettings } = require("../Common/Schema");
class AdminController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
     @Purpose Add/Update Admin 
     @Parameter {
        "adminId":"",
        "firstname":"",
        "lastname":"",
        "emailId":"",
        "mobile":"",
        "role":"",
        "dateofbirth": "",
        "permissions": [""]
     }
     @Return JSON String
     ********************************************************/
  async addUpdateAdmin() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = [
        "adminId",
        "firstname",
        "lastname",
        "emailId",
        "mobile",
        "role",
        "dateofbirth",
        "permissions",
        "countryCode",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      let role = await RolesSchema.findOne(
        { _id: data.role },
        adminProjection.roleList
      ).exec();
      data.role = role;
      delete data.permissions;
      /********************************************************
      Check Admin for Edit 
      ********************************************************/
      if (data.adminId) {
        /********************************************************
        Check Admin in DB and validate
        ********************************************************/
        let checkingAdminId = await Admin.findOne({
          _id: data.adminId,
          isDeleted: false,
        });
        if (_.isEmpty(checkingAdminId)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "VALID_ADMIN_ID"
            )
          );
        }

        /********************************************************
        Check Admin in DB and validate
        ********************************************************/
        if (data.emailId) {
          let checkingAdmin = await Admin.findOne({
            _id: { $ne: data.adminId },
            emailId: data.emailId,
            isDeleted: false,
          });
          if (!_.isEmpty(checkingAdmin)) {
            return new CommonService().handleReject(
              this.res,
              HTTP_CODE.FAILED,
              HTTP_CODE.SUCCESS_CODE,
              await new CommonService().setMessage(
                this.req.currentUserLang,
                "USER_ALREADY_EXISTS_WITH_ABOVE_EMAILID"
              )
            );
          }
        }

        /********************************************************
        Update admin data into DB and validate
        ********************************************************/
        const adminData = await Admin.findByIdAndUpdate(data.adminId, data, {
          new: true,
        });

        if (_.isEmpty(adminData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "ALREADY_EXISTS_WITH_ABOVE_EMAILID"
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
            "ADMIN_UPDATED_SUCCESSFULLY"
          )
        );
      } else {
        /********************************************************
        Check Admin in DB and validate
        ********************************************************/
        let checkingAdmin = await Admin.findOne({
          emailId: data.emailId,
          isDeleted: false,
        });
        if (!_.isEmpty(checkingAdmin)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "USER_ALREADY_EXISTS_WITH_ABOVE_EMAILID"
            )
          );
        }
        data.addedBy = this.req.currentUser._id;
        /********************************************************
        Add Admin data into DB and validate
        ********************************************************/
        const adminData = await new Model(Admin).store(data);
        if (_.isEmpty(adminData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "USER_NOT_SAVED"
            )
          );
        }

        /********************************************************
        Generate Forgot Password token and update in DB
        ********************************************************/
        const token = await new Globals().generateToken(adminData._id);
        await Admin.findByIdAndUpdate(adminData._id, {
          forgotToken: token,
          forgotTokenCreationTime: new Date(),
        });

        /********************************************************
        Send Email to admin for reset password and technology header middleware is maintained for conditional reset password url rendering
        ********************************************************/
        let resetPasswordLink =
          this.req.currentUserTech === "react"
            ? config.frontUrlAdmin + "/reset-password?token=" + token
            : config.frontUrlAngular + "/auth/reset-password?token=" + token;

        let replaceDataObj = {
          name: adminData.firstname + " " + adminData.lastname,
          resetPasswordLink: resetPasswordLink,
          role: role.role,
        };
        // send email verification code
        const sendingMail = new EmailService().sendNotification({
          emailId: adminData.emailId,
          emailKey: "admin_invite",
          replaceDataObj,
        });

        /********************************************************
        Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.RESOURCE_CREATED_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "ADMIN_ADDED_SUCCESSFULLY"
          )
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
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
    @Purpose Admin User Listing
    @Parameter
    {
       "page":1,
       "pagesize":10,
       "sort":{"firstname":1/-1,"lastname":1/-1,"emailId":1/-1,"dateofbirth":1/-1,"mobile":1/-1},
       "filter": [{"countryName": [""]},{"countryCode":[""]},{"phoneCode":[""]},{"currency":[""]}]}]
       "searchText":""
    }
    @Return JSON String
    ********************************************************/
  async adminListing() {
    try {
      /********************************************************
      Set Modal for listing
      ********************************************************/
      this.req.body["model"] = Admin;
      let result;
      if (this.req.body.searchText) {
        /********************************************************
        Listing for Search Functionality
        ********************************************************/
        this.req.body["filter"] = ["firstname", "lastname", "emailId"];
        let data = {
          bodyData: this.req.body,
          selectObj: adminProjection.adminList,
        };
        result = await AdminController.search(data);
      } else {
        /********************************************************
        Listing for filter functionality
        ********************************************************/
        let data = {
          bodyData: this.req.body,
          selectObj: adminProjection.adminList,
        };
        result = await AdminController.listing(data);
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
      console.log("error adminListing()", error);
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
     @PurposeCountry delete Admin Users
     @Parameter
     {
        "adminIds":[""],
     }
     @Return JSON String
     ********************************************************/
  async deleteAdmins() {
    try {
      /********************************************************
      Update Delete Status
      ********************************************************/
      await Admin.updateMany(
        { _id: { $in: this.req.body.adminIds } },
        { $set: { isDeleted: true } }
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
          "ADMIN_DELETED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
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
     @Purpose Admin User Change Status
     @Parameter
     {
        "adminIds":[],
        "status":true/false
     }
     @Return JSON String
     ********************************************************/
  async changeAdminStatus() {
    try {
      /********************************************************
      Update Status
      ********************************************************/
      await Admin.updateMany(
        { _id: { $in: this.req.body.adminIds } },
        { $set: { status: this.req.body.status } }
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
      console.log("error changeAdminStatus()", error);
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
     @Purpose get Admin details
     @Parameter {adminId}
     @Return JSON String
     ********************************************************/
  async getAdmindetails() {
    try {
      /********************************************************
      Validate request parameters
      ********************************************************/
      if (_.isEmpty(this.req.params.adminId)) {
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
        Find Country details and validate
      ********************************************************/
      let stages = await this.permissionAggregationStages();
      let categoryPermissions = await PermissionsSchema.aggregate(
        stages
      ).exec();
      /********************************************************
      Map Permission Based on Category
      ********************************************************/
      _.map(categoryPermissions, (permission) => {
        permission.category = permission._id.category;
        delete permission._id;
      });
      if (this.req.params.adminId) {
        let admin = await Admin.aggregate([
          {
            $match: {
              _id: ObjectId(this.req.params.adminId),
              isDeleted: false,
            },
          },
          {
            $lookup: {
              from: "roles",
              let: { roleId: "$role" }, // Store the role field value in a variable roleId
              pipeline: [
                {
                  $match: { $expr: { $eq: ["$_id", "$$roleId"] } }, // Match the _id of "roles" with roleId
                },
              ],
              as: "role",
            },
          },
          { $unwind: "$role" },
        ]);
        if (admin) {
          if (admin[0].role.permissions) {
            let rolePermissions = _.map(
              admin[0].role.permissions,
              (permission) => {
                return permission.toString();
              }
            );
            /********************************************************
            Check if this permission is assigned to the role or not
            ********************************************************/
            _.map(categoryPermissions, (permission) => {
              _.map(permission.permissions, (per) => {
                if (_.includes(rolePermissions, per._id.toString())) {
                  per.isSelected = true;
                }
              });
            });
          }
          let adminDetails = {
            admin: admin[0],
            categoryPermissions,
          };
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
            adminDetails
          );
        } else {
          return this.res.send({
            status: 0,
            message: i18n.__("ROLE_NOT_FOUND"),
          });
        }
      } else {
        /********************************************************
          Generate and return response
        ********************************************************/
        let roleDetails = { categoryPermissions: categoryPermissions };
        return this.res.send({ status: 1, data: roleDetails });
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
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
     @Purpose get Admin details
     @Parameter {type}
     @Return JSON String
     ********************************************************/
  async downloadAdminDetails() {
    try {
      const filter =
        this.req.query.filter &&
        this.req.query.filter !== "null" &&
        JSON.parse(this.req.query.filter);
      const columnSettings = JSON.parse(this.req.query.column);
      /********************************************************
        Validate request parameters
        ********************************************************/
      if (
        _.isEmpty(this.req.params.type) ||
        _.isEmpty(columnSettings) ||
        columnSettings.length === 0 ||
        (this.req.params.type !== "csv" && this.req.params.type !== "excel")
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

      const staticFilter = {
        "role.role": { $nin: ["Super Admin"] },
      };

      /********************************************************
      list and count data according to filter query
      ********************************************************/
      const customFilter = await new CommonService().constructCustomFilter({
        filter: filter,
        staticFilter: staticFilter,
      });
      let listing;
      /********************************************************
      list and count data according to filter query
      ********************************************************/
      listing = await Admin.find(customFilter)
        .select(adminProjection.adminList)
        .exec();

      const download = await new CommonService().downloadFile(
        columnSettings,
        "admin",
        this.req.params.type,
        listing
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
      console.log("error downloadAdminDetails()", error);
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
    @Purpose Role permissions Aggregation
    @Parameter
    {}
    @Return JSON String
  ********************************************************/
  async permissionAggregationStages() {
    return new Promise((resolve, reject) => {
      try {
        let stages = [
          {
            $lookup: {
              from: "permissioncategories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: "$category" },
          { $match: { "category.status": true, status: true } },
          {
            $group: {
              _id: "$category",
              permissions: {
                $push: {
                  permission: "$permission",
                  _id: "$_id",
                  permissionKey: "$permissionKey",
                },
              },
            },
          },
          { $project: adminProjection.permissionAggregate },
        ];
        return resolve(stages);
      } catch (error) {
        return reject(error);
      }
    });
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
          data.staticFilter = {
            "role.role": { $nin: ["Super Admin"] },
          };
          /********************************************************
        Check page and pagesize
        ********************************************************/
          if (bodyData.page && bodyData.pagesize) {
            let skip = (bodyData.page - 1) * bodyData.pagesize;
            let sort = bodyData.sort ?? { createdAt: -1 };
            /********************************************************
          Construct filter query
          ********************************************************/
            let filter = await new CommonService().constructCustomFilter({
              filter: bodyData.filter,
              condition: bodyData.condition ? bodyData.condition : "$and",
              staticFilter: data.staticFilter,
            });
            let listing;
            /********************************************************
          list and count data according to filter query
          ********************************************************/
            listing = await model.aggregate([
              {
                $lookup: {
                  from: "roles",
                  let: { roleId: "$role" }, // Store the role field value in a variable roleId
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ["$_id", "$$roleId"] } }, // Match the _id of "roles" with roleId
                    },
                  ],
                  as: "role",
                },
              },
              { $unwind: "$role" },
              {
                $match: filter,
              },
              {
                $sort: sort,
              },
              {
                $facet: {
                  paginatedResults: [
                    { $skip: skip },
                    { $limit: bodyData.pagesize },
                  ],
                  totalCount: [{ $count: "count" }],
                },
              },
              {
                $project: {
                  paginatedResults: 1,
                  totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
                },
              },
            ]);
            await model.find(filter).countDocuments();

            let columnKey = data.bodyData.columnKey;
            if (columnKey) {
              let columnSettings = await ColumnSettings.findOne({
                key: columnKey,
              }).select({ _id: 0, "columns._id": 0 });
              columnSettings =
                columnSettings?.column && Array.isArray(columnSettings.column)
                  ? columnSettings.column
                  : [];
              return resolve({
                status: 1,
                data: {
                  listing: listing.paginatedResults,
                  columnSettings,
                },
                page: bodyData.page,
                perPage: bodyData.pagesize,
                total: listing.totalCount,
              });
            } else {
              return resolve({
                status: 1,
                data: { listing: listing[0].paginatedResults },
                page: bodyData.page,
                perPage: bodyData.pagesize,
                total: listing[0].totalCount,
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
                $lookup: {
                  from: "roles",
                  localField: "role",
                  foreignField: "_id",
                  as: "role",
                },
              },
              { $unwind: "$role" },
              {
                $match: {
                  $or: ar,
                  isDeleted: false,
                  "role.role": { $nin: ["Super Admin"] },
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
                  "role.role": { $nin: ["Super Admin"] },
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

module.exports = AdminController;
