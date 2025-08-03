const _ = require("lodash");

const Controller = require("../Base/Controller");
const User = require("./Schema").userSchema;
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const userProjection = require("./Projection.json");
const { HTTP_CODE } = require("../../services/constant");
const { Languages } = require("../MasterLanguageManagement/Schema");
const ObjectId = require("mongodb").ObjectId;

class UserController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
     @Purpose Add/Update User 
     @Parameter {
        "userId":"",
        "firstname":"",
        "lastname":"",
        "emailId":"",
        "mobile":"",
        "dateofbirth": ""
     }
     @Return JSON String
     ********************************************************/
  async addUpdateUser() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = [
        "userId",
        "firstname",
        "lastname",
        "emailId",
        "mobile",
        "dateofbirth",
        "countryCode",
        "languageId",
        "photo",
        "userCode",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      /********************************************************
        Check User in DB and validate
      ********************************************************/
      if (data.emailId) {
        let checkingUser = await User.findOne({
          emailId: data.emailId,
          isDeleted: false,
          languageId: data.languageId,
        }).exec();
        if (!_.isEmpty(checkingUser)) {
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
      }

      /********************************************************
      Check User for Edit 
      ********************************************************/
      if (data.userId) {
        /********************************************************
        Check User in DB and validate
        ********************************************************/
        let checkingUserId = await User.findOne({
          _id: ObjectId(data.userId),
          isDeleted: false,
          languageId: ObjectId(data.languageId),
        }).exec();
        if (_.isEmpty(checkingUserId)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "VALID_USER_ID"
            )
          );
        }

        /********************************************************
        Update User data into DB and validate
        ********************************************************/
        const userData = await User.findByIdAndUpdate(data.userId, data, {
          new: true,
        }).exec();

        if (data.mobile || data.dateofbirth || data.photo) {
          await User.updateMany(
            { emailId: userData.emailId },
            {
              mobile: data.mobile ?? userData.mobile,
              dateofbirth: data.dateofbirth ?? userData.dateofbirth,
              photo: data.photo ?? userData.photo,
            }
          ).exec();
        }

        if (_.isEmpty(userData)) {
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
            "USER_UPDATED_SUCCESSFULLY"
          )
        );
      } else {
        if (data && !data.userCode) {
          data.userCode = await new CommonService().generateRandomString(
            User,
            "userCode"
          );
        }
        data.addedBy = this.req.currentUser._id;
        /********************************************************
        Add User data into DB and validate
        ********************************************************/
        const userData = await new Model(User).store(data);
        if (_.isEmpty(userData)) {
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
        Generate and return response
        ********************************************************/
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "USER_ADDED_SUCCESSFULLY"
          )
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error addUpdateUser()", error);
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
    @Purpose User Listing
    @Parameter
    {
       "page":1,
       "pagesize":10,
       "sort":{"firstname":1/-1,"lastname":1/-1,"emailId":1/-1,"dateofbirth":1/-1,"mobile":1/-1},
       "filter": []
       "searchText":""
    }
    @Return JSON String
    ********************************************************/
  async userListing() {
    try {
      /********************************************************
      Set Modal for listing
      ********************************************************/
      this.req.body["model"] = User;
      this.req.body["lang"] = this.req.body.languageId;
      let result;
      if (this.req.body.searchText) {
        /********************************************************
        Listing for Search Functionality
        ********************************************************/
        this.req.body["filter"] = [
          "firstname",
          "lastname",
          "emailId",
          "mobile",
        ];
        let data = {
          bodyData: this.req.body,
          selectObj: userProjection.userList,
        };
        result = await UserController.search(data);
      } else {
        /********************************************************
        Listing for filter functionality
        ********************************************************/
        let data = {
          bodyData: this.req.body,
          selectObj: userProjection.userList,
        };
        result = await UserController.listing(data);
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
      console.log("error userListing()", error);
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
     @PurposeCountry delete Users
     @Parameter
     {
        "userIds":[""],
     }
     @Return JSON String
     ********************************************************/
  async deleteUsers() {
    try {
      /********************************************************
      Update Delete Status
      ********************************************************/
      await User.updateMany(
        { _id: { $in: this.req.body.userIds } },
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
          "USER_DELETED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteUsers()", error);
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
     @Purpose User Change Status
     @Parameter
     {
        "userIds":[],
        "status":true/false
     }
     @Return JSON String
     ********************************************************/
  async changeStatusUser() {
    try {
      /********************************************************
      Update Status
      ********************************************************/
      await User.updateMany(
        { _id: { $in: this.req.body.userIds } },
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
      console.log("error changeStatusUser()", error);
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
     @Purpose get details
     @Parameter {userId}
     @Return JSON String
     ********************************************************/
  async getUserDetails() {
    try {
      /********************************************************
      Validate request parameters
      ********************************************************/
      if (
        _.isEmpty(this.req.query.userCode) ||
        _.isEmpty(this.req.query.languageId)
      ) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "REQUEST_PARAMETERS"
          )
        );
      }

      /********************************************************
        Find User details and validate
      ********************************************************/
      const userDetails = await User.findOne({
        userCode: this.req.query.userCode,
        isDeleted: false,
        languageId: this.req.query.languageId,
      })
        .select(userProjection.profile)
        .exec();

      if (_.isEmpty(userDetails)) {
        const languagePrimary = await Languages.findOne({
          isPrimary: true,
        }).exec();

        const userDetailsOfPrimary = await User.findOne({
          userCode: this.req.query.userCode,
          isDeleted: false,
          languageId: languagePrimary._id,
        })
          .select(userProjection.profile)
          .exec();

        if (_.isEmpty(userDetailsOfPrimary)) {
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
            countryCode: userDetailsOfPrimary.countryCode,
            emailId: userDetailsOfPrimary.emailId,
            mobile: userDetailsOfPrimary.mobile,
            userCode: userDetailsOfPrimary.userCode,
            dateofbirth: userDetailsOfPrimary.dateofbirth,
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
        userDetails
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getUserDetails()", error);
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
     @Purpose get User details
     @Parameter {type}
     @Return JSON String
     ********************************************************/
  async downloadUserDetails() {
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

      /********************************************************
         Construct filter query
      ********************************************************/
      const languageEN = await Languages.findOne({ languageCode: "en" }).exec();
      const language = await Languages.findOne({
        _id: this.req.currentUserLang,
      }).exec();
      const staticFilter =
        languageEN._id.toString() !== this.req.currentUserLang &&
        filter &&
        filter.filter(
          (data) => data.key === "firstname" || data.key === "lastname"
        ).length
          ? {}
          : { languageId: languageEN._id };
      /********************************************************
      Check page and pagesize
      ********************************************************/
      let customFilter = await new CommonService().constructCustomFilter({
        filter: filter,
        staticFilter: staticFilter,
      });

      let listing;
      /********************************************************
      list and count data according to filter query
      ********************************************************/
      listing = await User.find(customFilter)
        .select(userProjection.userList)
        .exec();
      if (language.languageCode === "en") {
        const download = await new CommonService().downloadFile(
          columnSettings,
          "user",
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
      } else {
        let newListing = [];
        await this.asyncForEach(listing, async (data) => {
          const user = await model
            .findOne({
              languageId: language._id,
              isDeleted: false,
              emailId: data.emailId,
            })
            .select(selectObj)
            .exec();
          if (user) {
            newListing.push(user);
          } else {
            newListing.push(data);
          }
        });

        const download = await new CommonService().downloadFile(
          columnSettings,
          "user",
          this.req.params.type,
          _.uniqBy(newListing, "emailId")
        );

        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          download
        );
      }
    } catch (error) {
      /********************************************************
        Manage Error logs and Response
        ********************************************************/
      console.log("error downloadUserDetails()", error);
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
          let lang = data.bodyData.lang;
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          const languageEN = await Languages.findOne({
            languageCode: "en",
          }).exec();
          const language = await Languages.findOne({ _id: lang }).exec();
          data.staticFilter =
            languageEN._id.toString() !== lang &&
            bodyData.filter &&
            bodyData.filter.filter(
              (data) => data.key === "firstname" || data.key === "lastname"
            ).length
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
              .skip(skip)
              .limit(bodyData.pagesize)
              .select(selectObj);
            let total = await model.find(filter).distinct("emailId");
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
              if (language.languageCode === "en") {
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
                  const user = await model
                    .findOne({
                      languageId: language._id,
                      isDeleted: false,
                      emailId: data.emailId,
                    })
                    .select(selectObj)
                    .exec();
                  if (user) {
                    newListing.push(user);
                  } else {
                    newListing.push(data);
                  }
                });

                return resolve({
                  status: 1,
                  data: { listing: _.uniqBy(newListing, "emailId") },
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
            data: { listing: _.uniqBy(listing, "emailId") },
            page: bodyData.page,
            perPage: bodyData.pagesize,
            total:
              totalCount.length > 0
                ? _.uniqBy(totalCount, "emailId").length
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

module.exports = UserController;
