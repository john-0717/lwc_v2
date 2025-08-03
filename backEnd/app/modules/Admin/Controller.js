const _ = require("lodash");

const Controller = require("../Base/Controller");
const Globals = require("../../../configs/Globals");
const Admin = require("./Schema").Admin;
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const Authentication = require("../Authentication/Schema").Authtokens;
const adminProjection = require("./Projection");
const config = require("../../../configs/configs");
const AdminOtpInfos = require("../Otp/Schema").AdminOtpInfos;
const Email = require("../../services/Email");
const Form = require("../../services/Form");
const File = require("../../services/File");
const { RolesSchema, PermissionsSchema } = require("../Roles/Schema");
const { generalSettingsSchema } = require("../Settings/Schema");
const { HTTP_CODE, EMAIL_TEMPLATE_KEYS } = require("../../services/constant");
const { userSchema } = require("../Users/Schema");
const { Jobs, AppliedJobs } = require("../Articles/Schema");
const {
  Subscriptions,
  Transaction,
  subscriptions,
  Employer,
} = require("../Employer/Schema");
const EmployerService = require("../../services/Employer");
const { masterSubscriptions } = require("../MasterDataManagement/Schema");
const ObjectId = require("mongoose").Types.ObjectId;
const ColumSettings =
  require("../EmployerManagement/Schema").columnPreferencesSchema;
const UserNotifications = require("../Users/Schema").userNotification;
const EmailService = require("../../services/Email");
class AdminController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
     @Purpose Get Admin profile details
     @Parameter
     {}
     @Return JSON String
     ********************************************************/
  async profile() {
    try {
      const currentUser = this.req.currentUser?._id ?? "";

      const stages = await this.permissionAggregationStages();
      const categoryPermissions = await PermissionsSchema.aggregate(
        stages
      ).exec();

      categoryPermissions.forEach((permission) => {
        permission.category = permission._id.category;
        delete permission._id;
      });

      if (currentUser) {
        let admin = await Admin.aggregate([
          { $match: { _id: ObjectId(currentUser), isDeleted: false } },
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

        if (!admin) {
          return this.res.send({
            status: 0,
            message: i18n.__("ROLE_NOT_FOUND"),
          });
        }

        const rolePermissions = _.map(admin[0].role.permissions, (permission) =>
          permission.toString()
        );

        categoryPermissions.forEach((permission) => {
          permission.permissions.forEach((per) => {
            if (_.includes(rolePermissions, per._id.toString())) {
              per.isSelected = true;
            }
          });
        });

        const settings = await generalSettingsSchema
          .findOne()
          .select({ dateTimeSettings: 1 })
          .exec();

        const adminDetails = {
          _id: admin[0]?._id,
          firstname: admin[0]?.firstname,
          lastname: admin[0]?.lastname,
          mobile: admin[0]?.mobile,
          emailId: admin[0]?.emailId,
          photo: admin[0]?.photo,
          emailVerificationStatus: admin[0]?.emailVerificationStatus,
          status: admin[0]?.status,
          role: {
            role: admin[0]?.role?.role,
            slug: admin[0]?.role?.slug,
            permissions: categoryPermissions,
            _id: admin[0]?.role?._id,
          },
          dateofbirth: admin[0]?.dateofbirth,
          gender: admin[0]?.gender,
          website: admin[0]?.website,
          address: admin[0]?.address,
          fbId: admin[0]?.fbId,
          twitterId: admin[0]?.twitterId,
          instagramId: admin[0]?.instagramId,
          githubId: admin[0]?.githubId,
          codepen: admin[0]?.codepen,
          slack: admin[0]?.slack,
          createdAt: admin[0]?.createdAt,
          isThemeDark: admin[0]?.isThemeDark,
          countryCode: admin[0]?.countryCode,
          currency: admin[0]?.currency ?? settings?.dateTimeSettings?.currency,
          dateFormat:
            admin[0]?.dateFormat ?? settings?.dateTimeSettings?.dateFormat,
          timeFormat:
            admin[0]?.timeFormat ?? settings?.dateTimeSettings?.timeFormat,
          timeZone: admin[0]?.timeZone ?? settings?.dateTimeSettings?.timeZone,
        };

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
        const roleDetails = { categoryPermissions };
        return this.res.send({ status: 1, data: roleDetails });
      }
    } catch (error) {
      console.log("error profile()", error);
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
     @Purpose Edit Admin Profile
     @Parameter
     {
        "firstname": "Admin",
        "lastname": "Admin",
        "mobile": "+91-0000000000",
        "photo": "",
        "role": "SuperAdmin",
        "dateofbirth": "2000-01-20",
        "gender": "Male",
        "website": "https://www.indianic.com/",
        "address": "201, Dev Arc, SG Road, Ahmadabad 380015, Gujarat, India",
        "fbId": "https://www.facebook.com/indianicinfotechlimited/",
        "twitterId": "https://twitter.com/indianic?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor",
        "instagramId": "https://www.instagram.com/indianic/?hl=en",
        "githubId": "https://github.com/indianic/awesome-design-systems",
        "codepen": "https://codepen.io/IndiaNIC/",
        "slack": "https://www.indianic.com/blog/management-leadership/business-benefits-of-slack.html"
      }
     @Return JSON String
     ********************************************************/
  async editProfile() {
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
        "firstname",
        "lastname",
        "mobile",
        "photo",
        "role",
        "dateofbirth",
        "gender",
        "website",
        "address",
        "fbId",
        "twitterId",
        "instagramId",
        "githubId",
        "codepen",
        "slack",
        "isThemeDark",
        "countryCode",
        "timeZone",
        "dateFormat",
        "currency",
        "timeFormat",
      ];
      let userData = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      if (userData.role) {
        let role = await RolesSchema.findOne(
          { _id: userData.role },
          adminProjection.roleList
        ).exec();
        userData.role = role;
      }
      /********************************************************
      Update Data in DB
      ********************************************************/
      const updatedAdmin = await Admin.findByIdAndUpdate(
        currentUser,
        userData,
        { new: true }
      ).select(adminProjection.admin);

      /********************************************************
      Generate and return response
      ********************************************************/
      return _.isEmpty(updatedAdmin)
        ? new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "USER_NOT_EXIST"
            )
          )
        : new CommonService().handleResolve(
            this.res,
            HTTP_CODE.SUCCESS,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              this.req.body.isThemeDark == null ||
                this.req.body.isThemeDark == undefined
                ? "ADMIN_PROFILE_UPDATE_SUCCESSFULLY"
                : "THEME_UPDATED"
            ),
            updatedAdmin
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
     @Purpose Login
     @Parameter
     {
            "emailId": "",
            "password":""
     }
     @Return JSON String
     ********************************************************/
  async adminLogin() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = ["emailId", "password"];
      let emptyFields = await new RequestBody().checkEmptyWithFields(
        this.req.body,
        fieldsArray
      );
      if (emptyFields.length) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          (await new CommonService().setMessage(
            this.req.currentUserLang,
            "SEND_PROPER_DATA"
          )) +
            " " +
            emptyFields.toString() +
            " fields required."
        );
      }
      fieldsArray = [...fieldsArray, "deviceToken", "device"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      let emailId = data.emailId.toString().toLowerCase();
      /********************************************************
      Check Admin exists in DB or not
      ********************************************************/
      const user = await Admin.findOne({ emailId: emailId, isDeleted: false });
      if (_.isEmpty(user)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNAUTHORIZED_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "INVALID_PASSWORD"
          )
        );
      }
      if (!user.emailVerificationStatus) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNAUTHORIZED_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "VERIFY_EMAIL"
          )
        );
      }
      if (!user.status) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.FORBIDDEN_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "BLOCKED_BY_ADMIN"
          )
        );
      }
      if (!user.password) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNAUTHORIZED_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "SET_PASSWORD"
          )
        );
      }
      /********************************************************
      Verify Password 
      ********************************************************/
      const status = await new CommonService().verifyPassword({
        password: data.password,
        savedPassword: user.password,
      });
      if (!status) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNAUTHORIZED_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "INVALID_PASSWORD"
          )
        );
      }

      const maskedEmail = await new CommonService().maskEmail(user.emailId);
      const maskedPhone = await new CommonService().maskPhoneNumber(
        user.mobile
      );
      const sendOTPToken = await new Globals().sendOTPToken(user.emailId);

      const check2FA = await generalSettingsSchema
        .findOne()
        .select({ is2FA: 1 })
        .exec();

      if (!check2FA?.is2FA) {
        let tokenData = { id: user._id };
        tokenData["ipAddress"] = this.req.ip;
        tokenData["device"] = this.req.headers.deviceid;

        await Admin.findByIdAndUpdate(
          { _id: user._id },
          { sendOTPToken: null }
        ).select(adminProjection.admin);

        let adminDetails;
        /********************************************************
          Find Permission details and validate
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
        if (user._id) {
          let admin = await Admin.aggregate([
            { $match: { _id: ObjectId(user._id), isDeleted: false } },
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
            // find column preferences
            let columnPreferences = await ColumSettings.find({
              adminId: ObjectId(user._id),
            }).select("preferences moduleName");

            adminDetails = {
              _id: admin[0]._id,
              firstname: admin[0].firstname,
              lastname: admin[0].lastname,
              mobile: admin[0].mobile,
              emailId: admin[0].emailId,
              photo: admin[0].photo,
              emailVerificationStatus: admin[0].emailVerificationStatus,
              status: admin[0].status,
              role: {
                role: admin[0].role.role,
                slug: admin[0]?.role?.slug,
                permissions: categoryPermissions,
                _id: admin[0].role._id,
              },
              dateofbirth: admin[0].dateofbirth,
              gender: admin[0].gender,
              website: admin[0].website,
              address: admin[0].address,
              fbId: admin[0].fbId,
              twitterId: admin[0].twitterId,
              instagramId: admin[0].instagramId,
              githubId: admin[0].githubId,
              codepen: admin[0].codepen,
              slack: admin[0].slack,
              createdAt: admin[0].createdAt,
              isThemeDark: admin[0].isThemeDark,
              countryCode: admin[0].countryCode,
              currency: admin[0].currency,
              dateFormat: admin[0].dateFormat,
              timeFormat: admin[0].timeFormat,
              timeZone: admin[0].timeZone,
              columnPreferences: columnPreferences,
            };
          } else {
            return this.res.send({
              status: 0,
              message: i18n.__("ROLE_NOT_FOUND"),
            });
          }
        }

        if (config.useRefreshToken && config.useRefreshToken == "true") {
          let { token, refreshToken } =
            await new Globals().getTokenWithRefreshToken(tokenData);

          return new CommonService().handleResolve(
            this.res,
            HTTP_CODE.SUCCESS,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "LOGIN_SUCCESS"
            ),
            adminDetails,
            {
              access_token: token,
              refreshToken,
            }
          );
        } else {
          let token = await new Globals().AdminToken(tokenData);
          return new CommonService().handleResolve(
            this.res,
            HTTP_CODE.SUCCESS,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "LOGIN_SUCCESS"
            ),
            adminDetails,
            {
              access_token: token,
            }
          );
        }
      } else {
        /********************************************************
        Update details in Admin 
        ********************************************************/
        let obj = { lastSeen: new Date(), sendOTPToken };
        await Admin.findByIdAndUpdate(user._id, obj, {
          new: true,
        }).select(adminProjection.admin);

        /********************************************************
        Generate and return response
        ********************************************************/
        const resData = {
          maskedEmail,
          maskedPhone,
          sendOTPToken,
        };
        new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "TWO_FACTOR_MODE"
          ),
          resData
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
     @Purpose Logout Admin
     @Parameter
     {}
     @Return JSON String
     ********************************************************/
  async logout() {
    try {
      /********************************************************
      Get current admin user id
      ********************************************************/
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";

      /********************************************************
      Update token details in authtoken
      ********************************************************/
      let filter = {
        adminId: currentUser,
        "access_tokens.deviceId": this.req.currentUser.deviceId,
      };
      await Authentication.updateOne(filter, {
        $pull: { access_tokens: { deviceId: this.req.currentUser.deviceId } },
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
          "LOGOUT_SUCCESS"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error logout()", error);
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
    @Purpose For send OTP
    @Parameter {
      "sendOTPToken": ""
      "mode": "email/phone"
    }
    @Return JSON String
  ********************************************************/
  async sendOtp() {
    try {
      if (this.req.body.mode !== "email" && this.req.body.mode !== "phone") {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "SEND_PROPER_DATA"
          )
        );
      }
      let { sendOTPToken, mode } = this.req.body;
      let query;
      let otpObject = {};
      let adminData;
      if (!_.isEmpty(sendOTPToken)) {
        query = { sendOTPToken: sendOTPToken };
        adminData = await Admin.findOne({ ...query, isDeleted: false });
        if (_.isEmpty(adminData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "INVALID_SENDOTP_TOKEN"
            )
          );
        }
        query = { adminId: adminData._id };
      }

      let otpData = Number(Math.floor(100000 + Math.random() * 900000));
      otpObject.otp = otpData;
      otpObject.otpExpiryTime = AdminController.addMintues(1);
      if (adminData.emailId && mode === "email") {
        const emailData = {
          emailId: adminData.emailId,
          emailKey: EMAIL_TEMPLATE_KEYS.OTP_MAIL,
          replaceDataObj: {
            otp: otpData,
            name:
              (
                adminData.firstname ||
                "" + " " + adminData.lastname ||
                ""
              )?.toUpperCase() || "N/A",
          },
        };
        await new Email().sendNotification(emailData);
      }
      const otpVerficationToken = await new Globals().otpVerficationToken(mode);
      otpObject.otpVerficationToken = otpVerficationToken;
      await AdminOtpInfos.findOneAndUpdate(
        query,
        { $set: otpObject },
        { new: true, upsert: true }
      ).exec();

      const resData =
        mode === "email"
          ? {
              sendOTPToken,
              otpVerficationToken,
              expirationTime: otpObject.otpExpiryTime,
            }
          : {
              sendOTPToken,
              otpVerficationToken,
              expirationTime: otpObject.otpExpiryTime,
              otp: otpData,
            };

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "OTP_SENT"
        ),
        resData
      );
    } catch (error) {
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
         @Purpose for OTP verification
         @Parameter
         {
                "mobile": "",
                "emailId":"",
                "otp": ""
         }
         @Return JSON String
    ********************************************************/
  async verifyOtp() {
    try {
      if (
        !this.req.body.otpVerficationToken ||
        !this.req.body.deviceId ||
        !this.req.body.otp
      ) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "SEND_PROPER_DATA"
          )
        );
      }

      let otpVerficationToken = this.req.body.otpVerficationToken;
      let otp = this.req.body.otp;
      let query = {
        otpVerficationToken: otpVerficationToken,
        isDeleted: false,
      };
      let timestamp = Date.now();
      let otpData = await AdminOtpInfos.findOne(query).exec();
      if (_.isEmpty(otpData)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "INVALID_OTP_VERIFICATION_CODE_TOKEN"
          )
        );
      }
      if (otpData.otp != otp) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "INVALID_OTP"
          )
        );
      }
      let expiredDate = otpData.otpExpiryTime;
      if (timestamp > expiredDate) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "OTP_EXPIRED"
          )
        );
      }

      let user = await Admin.findOne({
        _id: otpData.adminId,
        isDeleted: false,
      });
      let tokenData = { id: user._id };
      tokenData["ipAddress"] = this.req.ip;
      tokenData["device"] = this.req.body.deviceId;

      await Admin.findByIdAndUpdate(
        { _id: user._id },
        { sendOTPToken: null }
      ).select(adminProjection.admin);

      let adminDetails;
      /********************************************************
        Find Permission details and validate
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
      if (user._id) {
        let admin = await Admin.findOne(
          {
            _id: user._id,
            isDeleted: false,
          },
          adminProjection.profile
        );
        if (admin) {
          if (admin.role.permissions) {
            let rolePermissions = _.map(
              admin.role.permissions,
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
          adminDetails = {
            _id: admin._id,
            firstname: admin.firstname,
            lastname: admin.lastname,
            mobile: admin.mobile,
            emailId: admin.emailId,
            photo: admin.photo,
            emailVerificationStatus: admin.emailVerificationStatus,
            status: admin.status,
            role: {
              role: admin.role.role,
              slug: admin?.role?.slug,
              permissions: categoryPermissions,
              _id: admin.role._id,
            },
            dateofbirth: admin.dateofbirth,
            gender: admin.gender,
            website: admin.website,
            address: admin.address,
            fbId: admin.fbId,
            twitterId: admin.twitterId,
            instagramId: admin.instagramId,
            githubId: admin.githubId,
            codepen: admin.codepen,
            slack: admin.slack,
            createdAt: admin.createdAt,
            isThemeDark: admin.isThemeDark,
            countryCode: admin.countryCode,
            currency: admin.currency,
            dateFormat: admin.dateFormat,
            timeFormat: admin.timeFormat,
            timeZone: admin.timeZone,
          };
        } else {
          return this.res.send({
            status: 0,
            message: i18n.__("ROLE_NOT_FOUND"),
          });
        }
      }

      if (config.useRefreshToken && config.useRefreshToken == "true") {
        let { token, refreshToken } =
          await new Globals().getTokenWithRefreshToken(tokenData);

        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "LOGIN_SUCCESS"
          ),
          adminDetails,
          {
            access_token: token,
            refreshToken,
          }
        );
      } else {
        let token = await new Globals().AdminToken(tokenData);

        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "LOGIN_SUCCESS"
          ),
          adminDetails,
          {
            access_token: token,
          }
        );
      }
    } catch (error) {
      console.log("error verifyOtp()", error);
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
    @Purpose Refresh AccessToken
    @Parameter
    {}
    @Return JSON String
    ********************************************************/
  async refreshAccessToken() {
    try {
      if (!this.req.headers.refreshtoken) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "SEND_PROPER_DATA"
          )
        );
      }
      if (!this.req.headers.deviceid) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "SEND_PROPER_DATA"
          )
        );
      }
      let tokenData = {
        refreshToken: this.req.headers.refreshtoken,
        ipAddress: this.req.ip,
        deviceId: this.req.headers.deviceid,
        currentUserLang: this.req.currentUserLang,
      };
      let token = await new Globals().refreshAccessToken(tokenData);
      if (token.status) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          token.message,
          { accessToken: token.accessToken, refreshToken: token.refreshToken }
        );
      } else {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          token.message
        );
      }
    } catch (error) {
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
         @Purpose Admin Change Password
         @Parameter
         {
                "currentPassword": "",
                "newPassword":"",
         }
         @Return JSON String
    ********************************************************/
  async changePassword() {
    try {
      let fieldsArray = ["currentPassword", "newPassword"];
      let emptyFields = await new RequestBody().checkEmptyWithFields(
        this.req.body,
        fieldsArray
      );
      if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          (await new CommonService().setMessage(
            this.req.currentUserLang,
            "SEND_PROPER_DATA"
          )) +
            " " +
            emptyFields.toString() +
            " fields required."
        );
      }
      fieldsArray = [...fieldsArray, "deviceToken", "device"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      /********************************************************
      Check both current password and new password are same or not
      ********************************************************/
      if (data.currentPassword === data.newPassword) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "BOTH_PASSWORDS_ARE_SAME_PLEASE_CHOOSE_ANOTHER_PASSWORD"
          )
        );
      }
      let admin = await Admin.findOne({ _id: this.req.currentUser._id });
      /********************************************************
      Check admin user exists
      ********************************************************/
      if (_.isEmpty(admin) || admin.isDeleted) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNAUTHORIZED_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "USER_NOT_EXIST"
          )
        );
      }
      /********************************************************
      Verify current password 
      ********************************************************/
      const status = await new CommonService().verifyPassword({
        password: data.currentPassword,
        savedPassword: admin.password,
      });
      if (!status) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "INVALID_CURRENT_PASSWORD"
          )
        );
      }
      /********************************************************
      Encrypt New Password and update in DB
      ********************************************************/
      let password = await new CommonService().ecryptPassword({
        password: data.newPassword,
      });
      const updatedAdmin = await Admin.findByIdAndUpdate(
        this.req.currentUser._id,
        { password: password }
      );
      if (!updatedAdmin) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_UPDATED"
          )
        );
      }
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "PASSWORD_CHANGED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      console.log("error changePassword()", error);
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
     @Purpose Forgot password
     @Parameter
     {
        "emailId":""
     }
     @Return JSON String
     ********************************************************/
  async adminForgotPasswordMail() {
    try {
      /********************************************************
      validate request params
      ********************************************************/
      let fieldsArray = ["emailId"];
      let emptyFields = await new RequestBody().checkEmptyWithFields(
        this.req.body,
        fieldsArray
      );
      if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          (await new CommonService().setMessage(
            this.req.currentUserLang,
            "SEND_PROPER_DATA"
          )) +
            " " +
            emptyFields.toString() +
            " fields required."
        );
      }
      /********************************************************
      Check Admin User in DB
      ********************************************************/
      let emailId = this.req.body.emailId;
      let user = await Admin.findOne({ emailId: emailId, isDeleted: false });
      if (_.isEmpty(user)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "REGISTERED_EMAIL"
          )
        );
      }

      /********************************************************
      Generate Forgot Password token and update in DB
      ********************************************************/
      const token = await new Globals().generateToken(user._id);
      await Admin.findByIdAndUpdate(user._id, {
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
        name: user.firstname + " " + user.lastname,
        resetPasswordLink: resetPasswordLink,
      };
      // send email verification code
      const sendingMail = new EmailService().sendNotification({
        emailId: emailId,
        emailKey: "forgot_password_mail",
        replaceDataObj,
      });
      console.log(sendingMail, "-----send");
      if (sendingMail) {
        if (sendingMail.status == 0) {
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
      Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "CHECK_EMAIL"
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
   @Purpose Reset password
   @Parameter
   {
      "token": "",
      "password":""
   }
   @Return JSON String
   ********************************************************/
  async resetPasswordAdmin() {
    try {
      /********************************************************
       validate request params
      ********************************************************/
      let fieldsArray = ["token", "password"];
      let emptyFields = await new RequestBody().checkEmptyWithFields(
        this.req.body,
        fieldsArray
      );
      if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          (await new CommonService().setMessage(
            this.req.currentUserLang,
            "SEND_PROPER_DATA"
          )) +
            " " +
            emptyFields.toString() +
            " fields required."
        );
      }
      /********************************************************
      Find Admin from forgotToken
      ********************************************************/
      let user = await Admin.findOne({ forgotToken: this.req.body.token });
      if (_.isEmpty(user)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNAUTHORIZED_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "INVALID_TOKEN"
          )
        );
      }

      /********************************************************
      Decode Forgot Token
      ********************************************************/
      const decoded = await new Globals().decodeAdminForgotToken(
        this.req.body.token
      );
      if (!decoded) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNAUTHORIZED_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "LINK_EXPIRED"
          )
        );
      }

      /********************************************************
      Validate Password
      ********************************************************/
      let isPasswordValid = await new CommonService().validatePassword({
        password: this.req.body.password,
      });
      if (isPasswordValid && !isPasswordValid.status) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNAUTHORIZED_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            isPasswordValid.message
          )
        );
      }

      /********************************************************
      Encrypt Password and Update it in DB
      ********************************************************/
      let password = await new CommonService().ecryptPassword({
        password: this.req.body.password,
      });
      const updateUser = await Admin.findByIdAndUpdate(
        user._id,
        { password: password },
        { new: true }
      );

      /********************************************************
      Generate and return response
      ********************************************************/
      if (_.isEmpty(updateUser)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "PASSWORD_NOT_UPDATED"
          )
        );
      }
      await Admin.findByIdAndUpdate(user._id, {
        forgotToken: "",
        forgotTokenCreationTime: "",
      });
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "PASSWORD_UPDATED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error resetPasswordAdmin()", error);
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

  static addMintues(minutes) {
    let date = new Date();
    return date.getTime() + minutes * 60000;
  }

  /********************************************************
    @Purpose Single Image File uploading
    @Parameter
    {
           "file":
    }
    @Return JSON String
    ********************************************************/
  async imageFileUpload() {
    try {
      let form = new Form(this.req);
      let formObject = await form.parse();
      //set width and height
      let width = parseInt(formObject.fields?.width?.[0]) || undefined;
      let height = parseInt(formObject.fields?.height?.[0]) || undefined;
      // Array of allowed files
      const array_of_allowed_files = ["png", "jpeg", "jpg", "ico", "gif"];
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
            "VALID_IMAGE_FILE_FORMAT"
          )
        );
      }
      if (
        _.isEmpty(formObject.files) ||
        (formObject.files.file && formObject.files.file[0].size == 0)
      ) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "%s REQUIRED"
          )
        );
      }
      const file = new File(formObject.files);
      let filePath = "";
      let fileObject = await file.storeImage(file_extension, width, height);
      filePath = fileObject.filePath;
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "IMAGE_UPLOAD_SUCCESSFULLY"
        ),
        { filePath }
      );
    } catch (error) {
      console.log("error imageFileUpload()", error);
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
    @Purpose Single Video File uploading
    @Parameter
    {
           "file":
    }
    @Return JSON String
    ********************************************************/
  async videoFileUpload() {
    try {
      let form = new Form(this.req);
      let formObject = await form.parse();
      // Array of allowed files
      const array_of_allowed_files = ["mp4", "mov", "avi"];
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
            "VALID_VIDEO_FILE_FORMAT"
          )
        );
      }
      if (
        _.isEmpty(formObject.files) ||
        (formObject.files.file && formObject.files.file[0].size == 0)
      ) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "%s REQUIRED"
          )
        );
      }
      const file = new File(formObject.files);
      let filePath = "";
      let fileObject = await file.storeVideo();
      filePath = fileObject.filePath;
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "VIDEO_UPLOAD_SUCCESSFULLY"
        ),
        { filePath }
      );
    } catch (error) {
      console.log("error videoFileUpload()", error);
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
   @Purpose Get admin Global Config
   @Parameter
   {
     "key": ""
   }
   @Return JSON String
   ********************************************************/
  async getAdminGlobalConfig() {
    try {
      const userDetails = await Admin.findOne({
        _id: this.req.currentUser._id,
      }).select({ timeZone: 1, dateFormat: 1, currency: 1, timeFormat: 1 });
      const settings = await generalSettingsSchema
        .findOne()
        .select({ dateTimeSettings: 1 })
        .exec();
      const data = {
        currency: userDetails?.currency ?? settings?.dateTimeSettings?.currency,
        dateFormat:
          userDetails?.dateFormat ?? settings?.dateTimeSettings?.dateFormat,
        timeFormat:
          userDetails?.timeFormat ?? settings?.dateTimeSettings?.timeFormat,
        timeZone: userDetails?.timeZone ?? settings?.dateTimeSettings?.timeZone,
      };
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        data
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
  @Purpose Delete Sub Admin
  @Parameter
  {}
  @Return JSON String
  ********************************************************/
  async deleteSubAdmin() {
    try {
      const adminDetails = await Admin.findOne({
        _id: this.req.currentUser._id,
      })
        .select({ role: 1 })
        .exec();
      if (adminDetails.role.role === "Super Admin") {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "SUPER_ADMIN_CANNOT_BE_DELETE"
          )
        );
      }
      await Admin.updateOne(
        { _id: this.req.currentUser._id },
        { isDeleted: true }
      );
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
      console.log("error getAdminGlobalConfig()", error);
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
    @Purpose admin dashboard counts
    @Parameter
    {}
    @Return JSON String
  ********************************************************/
  async adminDashboardCount() {
    try {
      // Get today's date
      let today = await new EmployerService().getTodayTimestampWithoutTime();

      //parse req.params
      let data = this.req.query;
      let filter = {};
      if (data.filter) {
        let today = new Date().getTime();
        let cond = await new EmployerService().getTodayTimestampWithoutTime(
          data.filter
        );
        filter = {
          createdAt: {
            $gte: cond,
            $lte: today,
          },
        };
      }
      //response Object
      let result = {
        totalEmployer: 0,
        totalApplicant: 0,
      };
      //get count from database
      let userCount = await userSchema.aggregate([
        {
          $match: filter,
        },
        {
          $facet: {
            employerCount: [
              { $match: { role: "Employer", isEmailVerified: true } },
              { $group: { _id: null, count: { $sum: 1 } } },
            ],
            applicantCount: [
              { $match: { role: "Applicant", isEmailVerified: true } },
              { $group: { _id: null, count: { $sum: 1 } } },
            ],
          },
        },
        {
          $project: {
            _id: 0,
            employerCount: { $arrayElemAt: ["$employerCount.count", 0] },
            applicantCount: { $arrayElemAt: ["$applicantCount.count", 0] },
          },
        },
      ]);
      if (userCount.length) {
        result.totalApplicant = userCount[0].applicantCount
          ? userCount[0].applicantCount
          : 0;
        result.totalEmployer = userCount[0].employerCount
          ? userCount[0].employerCount
          : 0;
      }
      //get active and expired job count
      let jobsCount = await Jobs.aggregate([
        { $match: filter },
        {
          $facet: {
            activeJobCount: [
              { $match: { status: "Published", isDeleted: false } },
              { $group: { _id: null, count: { $sum: 1 } } },
            ],
            expiredJobCount: [
              { $match: { status: "Expired", isDeleted: false } },
              { $group: { _id: null, count: { $sum: 1 } } },
            ],
          },
        },
        {
          $project: {
            _id: 0,
            activeJobCount: { $arrayElemAt: ["$activeJobCount.count", 0] },
            expiredJobCount: { $arrayElemAt: ["$expiredJobCount.count", 0] },
          },
        },
      ]);
      if (jobsCount.length) {
        result.activeJobCount = jobsCount[0].activeJobCount
          ? jobsCount[0].activeJobCount
          : 0;
        result.expiredJobCount = jobsCount[0].expiredJobCount
          ? jobsCount[0].expiredJobCount
          : 0;
      }
      //get shortListed Count
      let shortListed = await AppliedJobs.aggregate([
        {
          $match: {
            applicantStatus: "Shortlisted",
            ...filter,
          },
        },
      ]);
      if (shortListed.length) {
        result.shortListedCount = shortListed.length;
      }
      //today published jobs
      let todayPublishedJobs = await Jobs.aggregate([
        {
          $match: {
            createdAt: { $gte: today },
            status: { $in: ["Published", "Expired"] },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]);
      result.todayPublishedJobs = todayPublishedJobs[0]
        ? todayPublishedJobs[0].count
        : 0;
      //yesterday published jobs
      let yesterday = await new EmployerService().getTodayTimestampWithoutTime(
        1
      );

      // Get entries posted yesterday
      let yesterdayPublishedJobs = await Jobs.aggregate([
        {
          $match: {
            createdAt: {
              $gte: yesterday,
              $lt: today,
            },
            status: { $in: ["Published", "Expired"] },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]);
      result.yesterdayPublishedJobs = yesterdayPublishedJobs[0]
        ? yesterdayPublishedJobs[0].count
        : 0;
      //get 1 week published jobs
      // Get date 1 week ago
      let oneWeekAgo = await new EmployerService().getTodayTimestampWithoutTime(
        7
      );
      today = new Date().getTime();
      let weekPublishedJobs = await Jobs.aggregate([
        {
          $match: {
            createdAt: {
              $lt: today,
              $gte: oneWeekAgo,
            },
            status: { $in: ["Published", "Expired"] },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]);
      result.weekPublishedJobs = weekPublishedJobs[0]
        ? weekPublishedJobs[0].count
        : 0;
      // Get date 1 month ago
      let oneMonthAgo =
        await new EmployerService().getTodayTimestampWithoutTime(30);
      let monthPublishedJobs = await Jobs.aggregate([
        {
          $match: {
            createdAt: {
              $gte: oneMonthAgo,
              $lt: today,
            },
            status: { $in: ["Published", "Expired"] },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]);
      result.monthPublishedJobs = monthPublishedJobs[0]
        ? monthPublishedJobs[0].count
        : 0;
      //get subscription cost sum to display revenue
      //get registered employerId's and get transactions for them
      let employers = await userSchema.find({
        role: "Employer",
        // isEmailVerified:true
      });
      employers = employers.map((e) => {
        return ObjectId(e._id);
      });

      let revenue = await Transaction.aggregate([
        { $match: { userId: { $in: employers } } },
        {
          $group: {
            _id: null,
            totalCost: { $sum: "$paymentDetails.totalFee" },
          },
        },
      ]);
      result.revenue = revenue[0] ? revenue[0].totalCost : 0;
      //add advisers count as well
      let advisersCount = await userSchema.countDocuments({
        role: "Adviser",
        isEmailVerified: true,
      });
      result["advisersCount"] = advisersCount;
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        result
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getAdminDashboardcount", error);
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
    @Purpose Admin top 10 employers list
    @Parameter
    {}
    @Return JSON String
  ********************************************************/
  async adminTopEmployers() {
    try {
      //employers
      let employers = await userSchema.aggregate([
        {
          $match: {
            role: "Employer",
          },
        },
        {
          $lookup: {
            from: "jobs",
            let: {
              userId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$userId", "$$userId"],
                  },
                  status: "Published",
                },
              },
              {
                $group: {
                  _id: "$userId",
                  jobCount: {
                    $sum: 1,
                  },
                },
              },
            ],
            as: "jobs",
          },
        },
        {
          $unwind: {
            path: "$jobs",
            includeArrayIndex: "string",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "transactions",
            let: {
              userId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$userId", "$$userId"],
                  },
                },
              },
              {
                $group: {
                  _id: "$userId",
                  revenue: {
                    $sum: "$paymentDetails.totalFee",
                  },
                },
              },
            ],
            as: "revenue",
          },
        },
        {
          $unwind: {
            path: "$revenue",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "employers",
            localField: "_id",
            foreignField: "userId",
            as: "employer",
          },
        },
        {
          $unwind: {
            path: "$employer",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            email: 1,
            phone: 1,
            companyName: "$employer.companyName",
            nzbn: "$employer.nzbn",
            jobCount: { $ifNull: ["$jobs.jobCount", 0] },
            revenue: { $ifNull: ["$revenue.revenue", 0] },
          },
        },
        {
          $sort: { revenue: -1, jobCount: -1 },
        },
        { $limit: 10 },
      ]);
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        { listing: employers }
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
    @Purpose Admin dashboard chart data
    @Parameter
    {}
    @Return JSON String
  ********************************************************/
  async adminChartData() {
    try {
      //process req.query params
      let fieldsArray = ["filterBy", "year", "week", "month"];
      let data = await new RequestBody().processRequestBody(
        this.req.query,
        fieldsArray
      );
      let today = new Date();
      // Get the current year
      var currentYear = today.getFullYear();
      var currentMonth = today.getMonth();
      let months = [
        "",
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      // Generate an array of all months with the corresponding revenue set to 0
      var allMonthsData = months.map(function (month, index) {
        return {
          _id: index,
          month: month,
          "Subscriptions Revenue": 0,
          "Pay as you Go Revenue": 0,
        };
      });
      let match = {
        year: data.year ? parseInt(data.year) : currentYear,
      };
      let masterSubId = await masterSubscriptions
        .findOne({
          name: "Pay as you Go",
        })
        .sort({ createdAt: -1 });
      masterSubId = masterSubId?._id;
      if (data.filterBy == "byWeek") {
        // weeks in month
        const year = data.year ? parseInt(data.year) : currentYear;
        const month = data.month ? parseInt(data.month) - 1 : currentMonth; // January is 0, so June is 5
        const week = data.week ? parseInt(data.week) : 1; //week 1 or 2,3,4,5
        const weeksInMonth = await new EmployerService().getWeeksInMonth(
          year,
          month
        );
        const weekDates = weeksInMonth[`week${week}`];
        const from = weekDates[0];
        const to = weekDates[weekDates.length - 1];
        let match = {
          "_id.year": year,
          "_id.month": month + 1,
          "_id.date": { $gte: from, $lte: to },
        };
        let result = await Subscriptions.aggregate([
          {
            $project: {
              year: { $year: { $toDate: "$createdAt" } },
              month: { $month: { $toDate: "$createdAt" } },
              date: {
                $dateToString: {
                  format: "%d-%m-%Y",
                  date: { $toDate: "$createdAt" },
                },
              },
              price: 1,
              subscriptionId: 1,
              jobRevenue: 1,
              transactionNo: 1,
            },
          },
          {
            $lookup: {
              from: "transactions",
              localField: "transactionNo",
              foreignField: "transactionNo",
              as: "transactionData",
            },
          },
          {
            $unwind: {
              path: "$transactionData",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $group: {
              _id: {
                year: "$year",
                month: "$month",
                date: "$date",
              },
              revenue: {
                $sum: {
                  $cond: [
                    {
                      $ne: ["$subscriptionId", ObjectId(masterSubId)],
                    },
                    "$transactionData.paymentDetails.totalFee",
                    0,
                  ],
                },
              },
              jobRevenue: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$subscriptionId", ObjectId(masterSubId)],
                    },
                    "$transactionData.paymentDetails.totalFee",
                    0,
                  ],
                },
              },
            },
          },
          {
            $match: match,
          },
          {
            $group: {
              _id: "$_id.date",
              date: { $first: "$_id.date" },
              revenue: { $first: "$revenue" },
              jobRevenue: { $first: "$jobRevenue" },
            },
          },
        ]);
        result = weekDates.map(function (dt) {
          let dataObj = {
            date: dt,
            "Subscriptions Revenue": 0,
            "Pay as you Go Revenue": 0,
          };
          result.forEach(function (revenueData) {
            if (revenueData.date === dt) {
              dataObj["Subscriptions Revenue"] = revenueData.revenue;
              dataObj["Pay as you Go Revenue"] = revenueData.jobRevenue;
            }
          });
          return dataObj;
        });
        let weeks = Object.keys(weeksInMonth).map((e) => {
          return `${e} (${weeksInMonth[e][0]} - ${
            weeksInMonth[e][weeksInMonth[e].length - 1]
          } )`;
        });
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          { listing: result, xAxis: weekDates, weeks }
        );
      }
      if (data.filterBy == "last1Day") {
        let lastDay = today;
        lastDay.setDate(today.getDate() - 1);
        lastDay = new Date(lastDay).getDay();
        console.log(lastDay);
        // lastDay = lastDay.toString().padStart(2, "0");
        let xAxis = [
          `${lastDay.toString().padStart(2, "0")}-${currentMonth
            .toString()
            .padStart(2, "0")}-${currentYear}`,
        ];
        let output = [
          {
            date: xAxis[0],
            revenue: 0,
            jobRevenue: 0,
          },
        ];
        let result = await Subscriptions.aggregate([
          {
            $project: {
              year: {
                $year: {
                  $toDate: "$createdAt",
                },
              },
              month: {
                $month: {
                  $toDate: "$createdAt",
                },
              },
              day: {
                $dayOfMonth: {
                  $toDate: "$createdAt",
                },
              },
              date: {
                $dateToString: {
                  format: "%d-%m-%Y",
                  date: {
                    $toDate: "$createdAt",
                  },
                },
              },
              price: 1,
              subscriptionId: 1,
              jobRevenue: 1,
            },
          },
          {
            $group: {
              _id: {
                year: "$year",
                month: "$month",
                date: "$date",
                day: "$day",
              },
              revenue: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$subscriptionId", ObjectId(masterSubId)],
                    },
                    "$jobRevenue",
                    "$price",
                  ],
                },
              },
              jobRevenue: {
                $sum: {
                  $cond: [
                    {
                      $ne: ["$subscriptionId", ObjectId(masterSubId)],
                    },
                    "$jobRevenue",
                    "$price",
                  ],
                },
              },
            },
          },
          {
            $match: {
              "_id.day": lastDay,
            },
          },
          {
            $group: {
              _id: "$_id.date",
              date: {
                $first: "$_id.date",
              },
              revenue: {
                $first: "$revenue",
              },
              jobRevenue: {
                $first: "$jobRevenue",
              },
            },
          },
        ]);
        if (result.length) {
          output = result;
        }
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          {
            listing: output,
            xAxis,
          }
        );
      }
      let sub = await Subscriptions.aggregate([
        {
          $project: {
            year: { $year: { $toDate: "$createdAt" } },
            month: { $month: { $toDate: "$createdAt" } },
            date: {
              $dateToString: {
                format: "%d-%m-%Y",
                date: { $toDate: "$createdAt" },
              },
            },
            price: 1,
            subscriptionId: 1,
            jobRevenue: 1,
            transactionNo: 1,
          },
        },
        {
          $lookup: {
            from: "transactions",
            localField: "transactionNo",
            foreignField: "transactionNo",
            as: "transactionData",
          },
        },
        {
          $unwind: {
            path: "$transactionData",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: match,
        },
        {
          $group: {
            _id: {
              year: "$year",
              month: "$month",
              date: "$date",
            },
            revenue: {
              $sum: {
                $cond: [
                  {
                    $ne: ["$subscriptionId", ObjectId(masterSubId)],
                  },
                  "$transactionData.paymentDetails.totalFee",
                  0,
                ],
              },
            },
            jobRevenue: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$subscriptionId", ObjectId(masterSubId)],
                  },
                  "$transactionData.paymentDetails.totalFee",
                  0,
                ],
              },
            },
          },
        },
        {
          $group: {
            _id: "$_id.month",
            revenue: { $sum: "$revenue" },
            jobRevenue: { $sum: "$jobRevenue" },
            year: { $first: "$_id.year" },
            month: { $first: "$_id.month" },
          },
        },
        {
          $project: {
            _id: "$_id",
            year: 1,
            revenue: 1,
            jobRevenue: 1,
          },
        },
      ]);

      let revenueByMonth = sub;
      // Combine the revenue data for months with data and months without data
      var combinedData = allMonthsData.map(function (monthData, index) {
        revenueByMonth.forEach(function (revenueData) {
          if (revenueData._id === monthData._id) {
            monthData["Subscriptions Revenue"] = revenueData.revenue;
            monthData["Pay as you Go Revenue"] = revenueData.jobRevenue;
          }
        });
        return monthData;
      });

      combinedData = combinedData.slice(1);
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        { listing: combinedData, xAxis: months.slice(1) }
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
    @Purpose Admin notifications
    @Parameter
    {}
    @Return JSON String
  ********************************************************/
  async adminNotificationList() {
    try {
      // page
      let page = this.req.query.page ? this.req.query.page : 1;
      let pageSize = this.req.query.pageSize ? this.req.query.pageSize : 10;

      let skip = (parseInt(page) - 1) * parseInt(pageSize);
      let where = { isVisibleToAdmin: true, isDeleted: false };

      // search by event and log
      if (this.req.query.search) {
        let modifiedString = this.req.query.search
          .toLowerCase()
          .replace(/ /g, "");
        where = {
          ...where,
          $or: [
            // partial search
            {
              event: {
                $regex: Globals.escapeRegExp(this.req.query.search),
                $options: "i",
              },
            },
            {
              $expr: {
                $eq: [
                  {
                    $toLower: {
                      $replaceAll: {
                        input: "event",
                        find: " ",
                        replacement: "",
                      },
                    },
                  },
                  modifiedString,
                ],
              },
            },
            {
              log: {
                $regex: Globals.escapeRegExp(this.req.query.search),
                $options: "i",
              },
            },
            {
              $expr: {
                $eq: [
                  {
                    $toLower: {
                      $replaceAll: {
                        input: "log",
                        find: " ",
                        replacement: "",
                      },
                    },
                  },
                  modifiedString,
                ],
              },
            },
          ],
        };
      }

      // date filter
      if (this.req.query.fromDate && this.req.query.toDate) {
        const fromDate = new Date(this.req.query.fromDate);
        const endDate = new Date(this.req.query.toDate);
        endDate.setDate(endDate.getDate() + 1); // next day

        const fromDateTimestamp = fromDate.getTime();
        const endateTimestamp = endDate.getTime();
        console.log(where);
        where = {
          ...where,
          createdAt: {
            $gte: fromDateTimestamp,
            $lt: endateTimestamp,
          },
        };
      }
      console.log(where);

      let notificationList = await UserNotifications.aggregate([
        { $match: where },
        { $sort: { createdAt: -1 } },
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
            unreadCount: [
              { $match: { isRead: false } }, // Filter unread notifications
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            data: [{ $skip: skip }, { $limit: parseInt(pageSize) }],
          },
        },
        {
          $project: {
            count: { $arrayElemAt: ["$count.count", 0] },
            unreadCount: {
              $ifNull: [{ $arrayElemAt: ["$unreadCount.count", 0] }, 0],
            },
            data: 1,
          },
        },
      ]);

      if (_.isEmpty(notificationList[0].data)) {
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

      let period = notificationList[0].data.map(async (element) => {
        element.period = await new EmployerService().convertTimestampToAgo(
          element.createdAt
        );
        return element;
      });
      Promise.all(period).then(async (data) => {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "GET_DETAIL_SUCCESSFULLY"
          ),
          notificationList[0].data,
          { unreadCount: notificationList[0].unreadCount },
          parseInt(page),
          parseInt(pageSize),
          notificationList[0].count
        );
      });
    } catch (e) {
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
     @Purpose Admin Delete Notification
     @Parameter
     {
        "ids":[]
     }
     @Return JSON String
     ********************************************************/
  async deleteNotification() {
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
      await UserNotifications.updateMany(
        { _id: { $in: this.req.body.ids } },
        { $set: { isDeleted: true, deletedBy: currentUser } }
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
          "NOTIFICATION_DELETED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
           Manage Error logs and Response
           ********************************************************/
      console.log("error deleteNotifications()", error);
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
  @Purpose download Notifications Data 
  @Parameter { columnName : ""}
  @Return JSON String
  ********************************************************/
  async notificationsDownload() {
    try {
      let columnSettings = this.req.body.column;

      columnSettings = columnSettings.map((col) =>
        col === "log" ? "description" : col
      );

      console.log(columnSettings);
      /********************************************************
      list data
      ********************************************************/
      let where = { isVisibleToAdmin: true, isDeleted: false };

      let notificationList = await UserNotifications.aggregate([
        { $match: where },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            event: "$event",
            description: "$log",
            createdAt: "$createdAt",
          },
        },
      ]);

      if (_.isEmpty(notificationList)) {
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

      await this.asyncForEach(notificationList, async (data) => {
        // convert timestamp to date
        const date = new Date(data.createdAt);
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        const formattedDate = date.toLocaleDateString("en-GB", options);

        data.createdAt = formattedDate;
      });

      const download = await new CommonService().downloadFile(
        columnSettings,
        "Notifications",
        this.req.body.type,
        notificationList
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
      console.log(error);
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
     @Purpose Mark as Read Notification
     @Parameter
     {
        "ids":[]
     }
     @Return JSON String
     ********************************************************/
  async markAsReadNotification() {
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
      await UserNotifications.updateMany(
        { _id: { $in: this.req.body.ids } },
        { $set: { isRead: true } }
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
          "MARKED_AS_READ_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
           Manage Error logs and Response
           ********************************************************/
      console.log("error markAsRead()", error);
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
     @Purpose Get Shortlisted Applicants
     @Parameter
     {
     }
     @Return JSON String
     ********************************************************/
  async adminGetShortlistApplicant() {
    try {
      // page
      let page = this.req.query.page ? this.req.query.page : 1;
      let pageSize = this.req.query.pageSize ? this.req.query.pageSize : 10;

      let sorting = { createdAt: -1 };

      let skip = (parseInt(page) - 1) * parseInt(pageSize);
      let where = { employerStatus: "Shortlisted" };
      let mwhere = {};
      // for searching - firstName , lastName, companyEmail, company Name, job Title
      if (this.req.query.search) {
        let modifiedString = this.req.query.search
          .toLowerCase()
          .replace(/ /g, "");
        mwhere = {
          $or: [
            // partial search
            {
              firstName: {
                $regex: Globals.escapeRegExp(this.req.query.search),
                $options: "i",
              },
            },
            {
              $expr: {
                $eq: [
                  {
                    $toLower: {
                      $replaceAll: {
                        input: "firstName",
                        find: " ",
                        replacement: "",
                      },
                    },
                  },
                  modifiedString,
                ],
              },
            },
            {
              lastName: {
                $regex: Globals.escapeRegExp(this.req.query.search),
                $options: "i",
              },
            },
            {
              $expr: {
                $eq: [
                  {
                    $toLower: {
                      $replaceAll: {
                        input: "lastName",
                        find: " ",
                        replacement: "",
                      },
                    },
                  },
                  modifiedString,
                ],
              },
            },
            {
              companyEmail: {
                $regex: Globals.escapeRegExp(this.req.query.search),
                $options: "i",
              },
            },
            {
              $expr: {
                $eq: [
                  {
                    $toLower: {
                      $replaceAll: {
                        input: "companyEmail",
                        find: " ",
                        replacement: "",
                      },
                    },
                  },
                  modifiedString,
                ],
              },
            },
            {
              companyName: {
                $regex: Globals.escapeRegExp(this.req.query.search),
                $options: "i",
              },
            },
            {
              $expr: {
                $eq: [
                  {
                    $toLower: {
                      $replaceAll: {
                        input: "companyName",
                        find: " ",
                        replacement: "",
                      },
                    },
                  },
                  modifiedString,
                ],
              },
            },
            {
              jobTitle: {
                $regex: Globals.escapeRegExp(this.req.query.search),
                $options: "i",
              },
            },
            {
              $expr: {
                $eq: [
                  {
                    $toLower: {
                      $replaceAll: {
                        input: "jobTitle",
                        find: " ",
                        replacement: "",
                      },
                    },
                  },
                  modifiedString,
                ],
              },
            },
          ],
        };
      }

      let applicantList = await AppliedJobs.aggregate([
        { $match: where },
        {
          $lookup: {
            from: "jobs",
            let: { jobId: "$jobId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$jobId"] },
                },
              },

              {
                $project: {
                  _id: 1,
                  jobTitle: 1,
                  userId: 1,
                },
              },
            ],
            as: "job",
          },
        },
        {
          $lookup: {
            from: "employers",
            let: { userId: { $arrayElemAt: ["$job.userId", 0] } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$userId", "$$userId"] },
                },
              },
              {
                $project: {
                  _id: 0,
                  companyName: 1,
                  userId: 1,
                },
              },
            ],
            as: "employer",
          },
        },
        {
          $lookup: {
            from: "users",
            let: { userId: { $arrayElemAt: ["$employer.userId", 0] } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$userId"] },
                },
              },
              {
                $project: {
                  _id: 0,
                  email: 1,
                },
              },
            ],
            as: "user",
          },
        },
        {
          $addFields: {
            jobTitle: { $arrayElemAt: ["$job.jobTitle", 0] },
            companyName: { $arrayElemAt: ["$employer.companyName", 0] },
            companyEmail: { $arrayElemAt: ["$user.email", 0] },
          },
        },
        {
          $project: {
            job: 0,
            employer: 0,
          },
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            jobId: 1,
            jobTitle: 1,
            companyName: 1,
            companyEmail: 1,
          },
        },
        { $match: mwhere },

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

      if (_.isEmpty(applicantList[0].data)) {
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
        applicantList[0].data,
        null,
        page,
        pageSize,
        applicantList[0].count[0].count
      );
    } catch (error) {
      /********************************************************
           Manage Error logs and Response
           ********************************************************/
      console.log("error adminGetShortlistApplicant()", error);
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
    @Purpose Admin total earning chart data
    @Parameter
    {}
    @Return JSON String
  ********************************************************/
  async totalEarningChartData() {
    try {
      //process req.query params
      let fieldsArray = ["year", "month"];
      let data = await new RequestBody().processRequestBody(
        this.req.query,
        fieldsArray
      );
      let today = new Date();
      // Get the current year
      let currentYear = today.getFullYear();
      let currentMonth = today.getMonth() + 1;

      let year = data.year ? data.year : currentYear;
      let month = data.month ? data.month : currentMonth;

      const revenueByDay = await Subscriptions.aggregate([
        {
          $match: {
            startDate: {
              $gte: new Date(year, month - 1, 1), // get 1st day of month
              $lt: new Date(year, month, 1), // get first day of next month
            },
          },
        },
        {
          $lookup: {
            from: "transactions",
            localField: "userId",
            foreignField: "userId",
            as: "transactions",
          },
        },
        {
          $unwind: "$transactions",
        },
        {
          $match: {
            "transactions.createdAt": {
              $gte: new Date(year, month - 1, 1).getTime(),
              $lt: new Date(year, month, 1).getTime(),
            },
            "transactions.paymentStatus": true,
          },
        },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: { $toDate: "$transactions.createdAt" } },
            },
            revenue: { $sum: "$transactions.paymentDetails.totalFee" },
          },
        },
        {
          $sort: { "_id.day": 1 }, // Sort by day number in ascending order
        },
        {
          $project: {
            _id: 0,
            day: { $concat: ["day", { $toString: "$_id.day" }] },
            revenue: 1,
          },
        },

        {
          $group: {
            _id: null,
            dailyRevenue: { $push: { k: "$day", v: "$revenue" } },
          },
        },
        {
          $replaceRoot: { newRoot: { $arrayToObject: "$dailyRevenue" } },
        },
      ]);

      // Create an object with all days of the month and set default revenue to 0
      const allDaysObject = {};
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dayKey = `day${day}`;
        allDaysObject[dayKey] = 0;
      }

      // Merge the actual revenue data with the object containing all days
      const finalRevenueByDay = { ...allDaysObject, ...revenueByDay[0] };

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        finalRevenueByDay
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log(error);
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

  async totalEarningEmployerList() {
    try {
      // page
      let page = this.req.query.page ? this.req.query.page : 1;
      let pageSize = this.req.query.pageSize ? this.req.query.pageSize : 10;

      let skip = (parseInt(page) - 1) * parseInt(pageSize);

      let today = new Date();
      // Get the current year
      let currentYear = today.getFullYear();
      let currentMonth = today.getMonth() + 1;

      let year = this.req.query.year ? this.req.query.year : currentYear;
      let month = this.req.query.month ? this.req.query.month : currentMonth;

      const employerListByRevenue = await Employer.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $addFields: {
            companyEmail: { $arrayElemAt: ["$user.email", 0] },
          },
        },
        {
          $lookup: {
            from: "jobs",
            let: {
              userId: "$userId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$userId", "$$userId"],
                  },
                  status: { $in: ["Published", "Expired"] },
                },
              },
              {
                $group: {
                  _id: "$userId",
                  jobCount: {
                    $sum: 1,
                  },
                },
              },
            ],
            as: "jobs",
          },
        },
        {
          $unwind: {
            path: "$jobs",
            includeArrayIndex: "string",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            jobCount: { $ifNull: ["$jobs.jobCount", 0] },
          },
        },
        {
          $lookup: {
            from: "employersubscriptions",
            localField: "userId",
            foreignField: "userId",
            as: "subscriptions",
          },
        },
        {
          $unwind: "$subscriptions",
        },
        {
          $match: {
            "subscriptions.startDate": {
              $gte: new Date(year, month - 1, 1),
              $lt: new Date(year, month, 1),
            },
          },
        },
        {
          $lookup: {
            from: "transactions",
            localField: "subscriptions.userId",
            foreignField: "userId",
            as: "transactions",
          },
        },
        {
          $unwind: "$transactions",
        },
        {
          $match: {
            "transactions.createdAt": {
              $gte: new Date(year, month - 1, 1).getTime(),
              $lt: new Date(year, month, 1).getTime(),
            },
            "transactions.paymentStatus": true,
          },
        },
        {
          $group: {
            _id: "$_id",
            employerName: { $first: "$companyName" },
            totalRevenue: { $sum: "$transactions.paymentDetails.totalFee" },
            jobCount: { $first: "$jobCount" },
            companyEmail: { $first: "$companyEmail" },
            nzbn: { $first: "$nzbn" },
          },
        },
        {
          $sort: { totalRevenue: -1 }, // Sort by totalRevenue in descending order (highest revenue first)
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
            data: [{ $skip: skip }, { $limit: parseInt(pageSize) }],
          },
        },
      ]);

      if (_.isEmpty(employerListByRevenue[0].data)) {
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
        employerListByRevenue[0].data,
        null,
        page,
        pageSize,
        employerListByRevenue[0].count[0].count
      );
    } catch (error) {
      /********************************************************
         Manage Error logs and Response
         ********************************************************/
      console.log("error totalEarningEmployerList()", error);
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

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}

module.exports = AdminController;
