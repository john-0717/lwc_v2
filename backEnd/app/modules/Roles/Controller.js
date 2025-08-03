const _ = require("lodash");

const Controller = require("../Base/Controller");
const Projection = require("./Projection.json");
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const {
  PermissionsSchema,
  RolesSchema,
  PermissionCategoriesSchema,
} = require("./Schema");
const { Admin } = require("../Admin/Schema");
const { HTTP_CODE } = require("../../services/constant");
const ObjectId = require("mongoose").Types.ObjectId;

class RolesController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
    @Purpose Permission Category add/update
    @Parameter
    {
      "categoryId":"",
      "category": ""
    }
    @Return JSON String
  ********************************************************/
  async addPermissionCategory() {
    try {
      let filter = this.req.body.categoryId
        ? {
            category: this.req.body.category,
            _id: { $ne: this.req.body.categoryId },
          }
        : { category: this.req.body.category };
      let categoryExist = await PermissionCategoriesSchema.findOne(
        filter
      ).exec();
      if (categoryExist) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "CATEGORY_EXIST"
          )
        );
      }
      if (this.req.body.categoryId) {
        let updatedCategory = await PermissionCategoriesSchema.findOneAndUpdate(
          { _id: this.req.body.categoryId },
          { category: this.req.body.category },
          { new: true }
        ).exec();
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          updatedCategory
        );
      } else {
        let category = await new Model(PermissionCategoriesSchema).store({
          category: this.req.body.category,
        });
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          category
        );
      }
    } catch (error) {
      console.log("error addPermissionCategory()", error);
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
    @Purpose Get Permission Category 
    @Parameter
    {}
    @Return JSON String
  ********************************************************/
  async getCategory() {
    try {
      let categories = await PermissionCategoriesSchema.find({
        status: true,
      })
        .select(Projection.permissionCategory)
        .exec();
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        categories
      );
    } catch (error) {
      console.log("error getCategory()", error);
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
    @Purpose Role permissions add/update
    @Parameter
    {
        "permissionId":""
        "categoryId": "",
        "permission": ""
    }
    @Return JSON String
  ********************************************************/
  async addPermissions() {
    try {
      let isCategoryExist = await PermissionCategoriesSchema.findOne({
        _id: this.req.body.categoryId,
      }).exec();
      if (isCategoryExist) {
        let filter = this.req.body.permissionId
          ? {
              categoryId: this.req.body.categoryId,
              permission: this.req.body.permission,
              _id: { $ne: this.req.body.permissionId },
            }
          : {
              categoryId: this.req.body.categoryId,
              permission: this.req.body.permission,
            };
        const isPermissionExist = await PermissionsSchema.findOne(
          filter
        ).exec();
        if (isPermissionExist) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "PERMISSION_EXIST_FOR_THIS_CATEGORY"
            )
          );
        }
        this.req.body["permissionKey"] =
          isCategoryExist.category.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() +
          "_" +
          this.req.body["permission"]
            .replace(/[^a-zA-Z0-9]/g, "_")
            .toLowerCase();
        if (this.req.body.permissionId) {
          let id = this.req.body.permissionId;
          delete this.req.body.permissionId;
          let updatedPermission = await PermissionsSchema.findOneAndUpdate(
            { _id: id, categoryId: this.req.body.categoryId },
            this.req.body,
            { new: true }
          ).exec();
          return new CommonService().handleResolve(
            this.res,
            HTTP_CODE.SUCCESS,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "GET_DETAIL_SUCCESSFULLY"
            ),
            updatedPermission
          );
        } else {
          let permission = await new Model(PermissionsSchema).store(
            this.req.body
          );
          return new CommonService().handleResolve(
            this.res,
            HTTP_CODE.SUCCESS,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "GET_DETAIL_SUCCESSFULLY"
            ),
            permission
          );
        }
      } else {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "CATEGORY_NOT_FOUND"
          )
        );
      }
    } catch (error) {
      console.log("error addPermissions()", error);
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
    @Purpose Get All Role permissions
    @Parameter
    {}
    @Return JSON String
    ********************************************************/
  async getAllPermission() {
    try {
      let stages = await this.permissionAggregationStages();
      let permissions = await PermissionsSchema.aggregate(stages).exec();
      /********************************************************
        Map Permission Based on Category
      ********************************************************/
      _.map(permissions, (permission) => {
        permission.category = permission._id.category;
        permission.categoryId = permission._id._id;
        delete permission._id;
      });
      permissions = _.sortBy(permissions, ["category"]);
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
        permissions
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getAllPermission()", error);
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
  @Purpose Role add/update
  @Parameter
  {
      "roleId":"",
      "role": "",
      "description":"",
      "permissions": [""]
  }
  @Return JSON String
  ********************************************************/
  async addUpdateRole() {
    try {
      let data = this.req.body;
      /********************************************************
      Check Role ID for edit 
      ********************************************************/
      if (data.roleId) {
        /********************************************************
        Update Role data into DB and validate
        ********************************************************/
        data.modifiedBy = this.req.currentUser._id;
        const role = await RolesSchema.findOneAndUpdate(
          { _id: data.roleId },
          data,
          { new: true }
        ).exec();

        if (_.isEmpty(role)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "ROLE_NOT_FOUND"
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
            "ROLE_UPDATED_SUCCESSFULLY"
          )
        );
      } else {
        /********************************************************
        Check Role in DB and validate
        ********************************************************/
        let roleExist = await RolesSchema.findOne({
          role: data.role,
          addedBy: this.req.currentUser._id,
          isDeleted: false,
        }).exec();
        if (roleExist) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "ROLE_EXIST"
            )
          );
        }
        /********************************************************
        Add Role data into DB and validate
        ********************************************************/
        data.addedBy = this.req.currentUser._id;
        // add dashboard view permission to default role
        let permission = await PermissionsSchema.findOne({
          category: "Dashboard",
          permissionKey: "dashboard_view",
        });
        let defaultPermission = [];
        defaultPermission.push(permission._id);
        data.permissions = defaultPermission;
        const roleData = await new Model(RolesSchema).store(data);
        if (_.isEmpty(roleData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "ROLE_NOT_FOUND"
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
            "ROLE_ADDED_SUCCESSFULLY"
          )
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error addUpdateRole()", error);
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
   @Purpose Role Listing
   @Parameter
   {
      "page":1,
      "pagesize":10,
      "sort":{"role":1/-1},
      "searchText":""
   }
   @Return JSON String
 ********************************************************/
  async listRoles() {
    try {
      this.req.body["model"] = RolesSchema;
      this.req.body["filter"] = ["role"];
      let query = { role: { $nin: ["Super Admin"] } };
      /********************************************************
       Role Listing Stage
      ********************************************************/
      let stages = [
        { $match: query },
        {
          $lookup: {
            from: "admins",
            localField: "addedBy",
            foreignField: "_id",
            as: "admin",
          },
        },
        {
          $unwind: {
            path: "$admin",
            includeArrayIndex: "arrayIndex",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "admins",
            localField: "_id",
            foreignField: "role",
            as: "roleDetails",
          },
        },
        {
          $unwind: {
            path: "$roleDetails",
            includeArrayIndex: "arrayIndex",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$_id",
            role: { $first: "$role" },
            description: { $first: "$description" },
            status: { $first: "$status" },
            addedBy: { $first: "$admin.firstname" },
            userCount: {
              $sum: {
                $cond: {
                  if: { $eq: [false, "$roleDetails.isDeleted"] },
                  then: 1,
                  else: 0,
                },
              },
            },
            createdAt: { $first: "$createdAt" },
            isDefault: { $first: "$isDefault" },
          },
        },
        { $sort: this.req.body.sort ? this.req.body.sort : { createdAt: 1 } },
      ];

      let data = {
        bodyData: this.req.body,
        selectObj: Projection.roleListing,
        stages,
      };
      let result = await RolesController.rolesSearching(data);
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
      console.log("error listRoles()", error);
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
    @Purpose get User List By Role
    @Parameter {}
    @Return JSON String
  ********************************************************/
  async getUserListByRole() {
    try {
      if (
        _.isEmpty(this.req.params.roleId) ||
        _.isEmpty(this.req.query.page) ||
        _.isEmpty(this.req.query.pageSize)
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
      const sort = this.req.query.sort
        ? JSON.parse(this.req.query.sort)
        : { createdAt: 1 };
      const data = this.req.query;
      const roleId = ObjectId(this.req.params.roleId);
      const skip = parseInt(data.page - 1) * parseInt(data.pageSize);
      /********************************************************
      Find Role details and validate
      ********************************************************/
      const adminList = await Admin.aggregate([
        {
          $match: { role: roleId, isDeleted: false },
        },
        {
          $lookup: {
            from: "roles",
            localField: "role",
            foreignField: "_id",
            as: "role", // Rename the populated field to avoid collision
          },
        },
        {
          $unwind: "$role", // Unwind the populated field if necessary
        },
        {
          $sort: sort,
        },
        {
          $skip: skip,
        },
        {
          $limit: parseInt(data.pageSize),
        },
        {
          $project: Projection.adminList,
        },
      ]);
      // get
      const adminListTotal = await Admin.find({
        role: roleId,
        isDeleted: false,
      }).exec();

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
        adminList,
        null,
        parseInt(data.page),
        parseInt(data.pageSize),
        adminListTotal.length
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getUserListByRole()", error);
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
   @Purpose Role details
   @Parameter
   {
       "roleId": ""
   }
   @Return JSON String
   *******************************************************/
  async getRolePermission() {
    try {
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
      if (this.req.params.roleId) {
        let role = await RolesSchema.findOne({
          _id: this.req.params.roleId,
          isDeleted: false,
        })
          .populate("addedBy", "firstname lastname")
          .populate("modifiedBy", "firstname lastname")
          .exec();
        if (role) {
          if (role.permissions) {
            let rolePermissions = _.map(role.permissions, (permission) => {
              return permission.toString();
            });
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
          let roleDetails = {
            _id: role._id,
            role: role.role,
            description: role.description,
            status: role.status,
            slug: role.slug,
            addedBy: role.addedBy,
            modifiedBy: role.modifiedBy,
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
            roleDetails
          );
        } else {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "ROLE_NOT_FOUND"
            )
          );
        }
      } else {
        /********************************************************
          Generate and return response
        ********************************************************/
        let roleDetails = { categoryPermissions: categoryPermissions };
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          roleDetails
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getRolePermission()", error);
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
     @Purpose get Roles List
     @Parameter {}
     @Return JSON String
  ********************************************************/
  async getRolesList() {
    try {
      /********************************************************
      Find Role details and validate
      ********************************************************/
      const roleListDetails = await RolesSchema.find({
        isDeleted: false,
        status: true,
      })
        .select(Projection.list)
        .exec();

      if (_.isEmpty(roleListDetails)) {
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
        roleListDetails
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getRolesList()", error);
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
    @Purpose Delete Roles
    @Parameter
     {
        roleIds:[""]
     }
    @Return JSON String
  ********************************************************/
  async deleteRole() {
    try {
      await RolesSchema.updateMany(
        { _id: { $in: this.req.body.roleIds } },
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
          "ROLE_DELETED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteRole()", error);
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
    @Purpose Change Admin user role
    @Parameter
     {
        newRoleId:[]
     }
    @Return JSON String
  ********************************************************/
  async changeAdminRole() {
    try {
      const data = this.req.body;
      const newRoleDetails = await RolesSchema.findOne({
        isDefault: true,
      }).exec();
      console.log(newRoleDetails);
      if (newRoleDetails) {
        await Admin.updateMany(
          { role: data.oldRoleId },
          { $set: { role: newRoleDetails._id } }
        ).exec();

        await RolesSchema.updateMany(
          { _id: { $in: this.req.body.oldRoleId } },
          { $set: { isDeleted: true } }
        ).exec();
      } else {
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
        Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "ROLE_SWITCHED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error changeAdminRole()", error);
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
          { $project: Projection.permissionAggregate },
          { $sort: { createdAt: 1 } },
        ];
        return resolve(stages);
      } catch (error) {
        return reject(error);
      }
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
  static rolesSearching(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          let model = data.bodyData.model;
          let bodyData = data.bodyData;
          let filter = bodyData.filter;
          let sort = bodyData.sort ? bodyData.sort : { createdAt: 1 };
          let stages = data.stages ? data.stages : "";
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
              ...stages,
              {
                $project: selectObj,
              },
              {
                $skip: skip,
              },
              {
                $limit: parseInt(bodyData.pagesize),
              },
              { $sort: sort },
            ];
            totalCountFilter = [
              {
                $match: {
                  $or: ar,
                  isDeleted: false,
                },
              },
              ...stages,
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

module.exports = RolesController;
