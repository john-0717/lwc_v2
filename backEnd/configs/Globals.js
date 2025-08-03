/****************************
 SECURITY TOKEN HANDLING
 ****************************/
const _ = require("lodash");
const Moment = require("moment");
let jwt = require("jsonwebtoken");

const config = require("./configs");
const Authentication =
  require("../app/modules/Authentication/Schema").Authtokens;
const Admin = require("../app/modules/Admin/Schema").Admin;
const CommonService = require("../app/services/Common");
const { Languages } = require("../app/modules/MasterLanguageManagement/Schema");
const { HTTP_CODE } = require("../app/services/constant");
const { RolesSchema } = require("../app/modules/Roles/Schema");
const Users = require("../app/modules/Users/Schema").userSchema;
const Role = require("../app/modules/Roles/Schema").RolesSchema;
const permissions = require("../app/services/permissions");
const permission = require("../app/services/permissions");
const Form = require("../app/services/Form");
const ObjectId = require("mongoose").Types.ObjectId;

class Globals {
  sendOTPToken(emailId) {
    return new Promise((resolve, reject) => {
      try {
        /********************************************************
         Generate header
        ********************************************************/
        let token = jwt.sign(
          {
            emailId: emailId,
            algorithm: "HS256",
            exp: Math.floor(Date.now() / 1000) + parseInt(config.tokenExpiry),
          },
          config.securityToken
        );

        return resolve(token);
      } catch (err) {
        console.log("Get token", err);
        return reject({ message: err, status: 0 });
      }
    });
  }

  otpVerficationToken(mode) {
    return new Promise((resolve, reject) => {
      try {
        /********************************************************
         Generate header
        ********************************************************/
        let token = jwt.sign(
          {
            mode: mode,
            algorithm: "HS256",
            exp: Math.floor(Date.now() / 1000) + parseInt(config.tokenExpiry),
          },
          config.securityToken
        );

        return resolve(token);
      } catch (err) {
        console.log("Get token", err);
        return reject({ message: err, status: 0 });
      }
    });
  }

  AdminToken(params) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          /********************************************************
         Generate header
        ********************************************************/
          let token = jwt.sign(
            {
              id: params.id,
              algorithm: "HS256",
              exp: Math.floor(Date.now() / 1000) + parseInt(config.tokenExpiry),
            },
            config.securityToken
          );
          params.token = token;
          params.adminId = params.id;
          params.tokenExpiryTime = Moment().add(
            parseInt(config.tokenExpirationTime),
            "minutes"
          );

          /********************************************************
         Set Device params
        ********************************************************/
          if (
            params.device &&
            (params.device === "android" || params.device === "ios")
          ) {
            params.device = "mobile";
          }
          delete params.id;

          /********************************************************
         Fetch admin details from the server and update authtoken details
        ********************************************************/
          let fetchAdmin = await Authentication.findOne({
            adminId: params.adminId,
            "access_tokens.deviceId": params.device,
          }).exec();
          if (fetchAdmin) {
            await Authentication.updateOne(
              {
                adminId: params.adminId,
                "access_tokens.deviceId": params.device,
              },
              {
                $set: {
                  "access_tokens.$.token": token,
                  "access_tokens.$.tokenExpiryTime": params.tokenExpiryTime,
                  "access_tokens.$.deviceId": params.deviceId,
                  "access_tokens.$.ipAddress": params.ipAddress,
                },
              },
              { new: true, upsert: true }
            ).exec();
          } else {
            await Authentication.findOneAndUpdate(
              { adminId: params.adminId },
              {
                $push: {
                  access_tokens: {
                    token: token,
                    tokenExpiryTime: params.tokenExpiryTime,
                    deviceId: params.device,
                    ipAddress: params.ipAddress,
                  },
                },
              },
              { new: true, upsert: true }
            ).exec();
          }
          return resolve(token);
        } catch (err) {
          console.log("Get token", err);
          return reject({ message: err, status: 0 });
        }
      })();
    });
  }

  UserToken(params) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          /********************************************************
         Generate header
        ********************************************************/
          let token = jwt.sign(
            {
              id: params.id,
              algorithm: "HS256",
              exp: Math.floor(Date.now() / 1000) + parseInt(config.tokenExpiry),
            },
            config.securityToken
          );
          params.token = token;
          params.userId = params.id;
          params.tokenExpiryTime = Moment().add(
            parseInt(config.tokenExpirationTime),
            "minutes"
          );
          delete params.id;

          /********************************************************
         Fetch user details from the server and update authtoken details
        ********************************************************/
          let fetchUser = await Authentication.findOne({
            userId: params.userId,
          });
          console.log(fetchUser?._doc)
          if (fetchUser) {
            let res = await Authentication.updateOne(
              { userId: params.userId },
              {
                $set: {
                  "access_tokens.0.token": token,
                  "access_tokens.0.tokenExpiryTime": params.tokenExpiryTime,
                  "access_tokens.0.deviceId": "web",
                },
              },
              { new: true, upsert: true }
            ).exec();
            console.log(res)
          } else {
            await Authentication.findOneAndUpdate(
              { userId: params.userId },
              {
                $push: {
                  access_tokens: {
                    token: token,
                    tokenExpiryTime: params.tokenExpiryTime,
                    deviceId: "web",
                  },
                },
              },
              { new: true, upsert: true }
            ).exec();
          }
          return resolve(token);
        } catch (err) {
          console.log("Get token", err);
          return reject({ message: err, status: 0 });
        }
      })();
    });
  }

  static isAdminAuthorized(validatePermissions) {
    return async (req, res, next) => {
      try {
        /********************************************************
         Get auth token from header
        ********************************************************/
        const token = req.headers.authorization;
        if (!token) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TOKEN_WITH_API"
            )
          );
        }

        /********************************************************
         Get Device Id from header and valid it
        ********************************************************/
        let deviceId = req.headers.deviceid;
        if (!deviceId) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "DEVICE_ID_WITH_API"
            )
          );
        }

        if (deviceId && (deviceId === "android" || deviceId === "ios")) {
          deviceId = "mobile";
        } else if (deviceId && deviceId === "web") {
          deviceId = "web";
        } else {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "WRONG_DEVICE_ID"
            )
          );
        }

        const authenticate = new Globals();

        /********************************************************
         Check token in DB
        ********************************************************/
        const tokenCheck = await authenticate.checkTokenInDB(token, deviceId);
        if (!tokenCheck) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "INVALID_TOKEN"
            )
          );
        }

        /********************************************************
         Check token Expiration
        ********************************************************/
        const tokenExpire = await authenticate.checkExpiration(token, deviceId);

        if (!tokenExpire) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TOKEN_EXPIRED"
            )
          );
        }

        /********************************************************
         Check Admin in DB
        ********************************************************/
        const userExist = await authenticate.checkAdminInDB(token);
        if (!userExist) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "ADMIN_NOT_EXIST"
            )
          );
        }

        if (userExist._id) {
          userExist.deviceId = deviceId;
          req.currentUser = userExist;

          if (userExist.role) {
            //get role details
            let role = await RolesSchema.findOne({
              _id: userExist.role,
            }).populate("permissions", "permissionKey");
            let userPermissions = role.permissions.map((p) => {
              return p.permissionKey;
            });

            let havePermissions = true;
            //Process if api need to check any permissions based on permissionKey
            if (validatePermissions) {
              if (role.role != "Super Admin") {
                let modulePermissions = userPermissions;

                //Check user must have required all permissions.
                havePermissions = validatePermissions.every((value) => {
                  return modulePermissions.includes(value);
                });
              }
            }
            //send error if user is not have all required permission
            if (!havePermissions) {
              return res
                .status(401)
                .json({ status: 0, message: "Unauthorized to access" });
            }
          }
        }
        next();
      } catch (err) {
        console.log("Token authentication", err);
        return res.send({ status: 0, message: err });
      }
    };
  }

  /**
   * route authorization with roles and permission
   *
   *
   */

  static isAdminAuthorizedWithPermissions(
    validatePermissions,
    category,
    param,
    key
  ) {
    return async (req, res, next) => {
      try {
        /********************************************************
         Get auth token from header
        ********************************************************/
        const token = req.headers.authorization;
        if (!token) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TOKEN_WITH_API"
            )
          );
        }

        /********************************************************
         Get Device Id from header and valid it
        ********************************************************/
        let deviceId = req.headers.deviceid;
        if (!deviceId) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "DEVICE_ID_WITH_API"
            )
          );
        }

        if (deviceId && (deviceId === "android" || deviceId === "ios")) {
          deviceId = "mobile";
        } else if (deviceId && deviceId === "web") {
          deviceId = "web";
        } else {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "WRONG_DEVICE_ID"
            )
          );
        }

        const authenticate = new Globals();

        /********************************************************
         Check token in DB
        ********************************************************/
        const tokenCheck = await authenticate.checkTokenInDB(token, deviceId);
        if (!tokenCheck) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "INVALID_TOKEN"
            )
          );
        }

        /********************************************************
         Check token Expiration
        ********************************************************/
        const tokenExpire = await authenticate.checkExpiration(token, deviceId);

        if (!tokenExpire) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TOKEN_EXPIRED"
            )
          );
        }

        /********************************************************
         Check Admin in DB
        ********************************************************/
        const userExist = await authenticate.checkAdminInDB(token);
        if (!userExist) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "ADMIN_NOT_EXIST"
            )
          );
        }

        if (userExist._id) {
          userExist.deviceId = deviceId;
          req.currentUser = userExist;

          if (userExist.role) {
            //get role details
            let role = await RolesSchema.findOne({
              _id: userExist.role,
            }).populate("permissions", "permissionKey");
            let userPermissions = role.permissions.map((p) => {
              return p.permissionKey;
            });

            let havePermissions = true;
            //Process if api need to check any permissions based on permissionKey
            if (validatePermissions) {
              if (role.role != "Super Admin") {
                let modulePermissions = userPermissions;

                //get req body
                let body;
                let bodyData;
                if (!_.isEmpty(key)) {
                  body = req.body[key];
                  if (!_.isEmpty(body)) {
                    bodyData = body[0][param];
                  }
                } else {
                  body = req.body;
                  bodyData = body[param];
                }
                if (_.isEmpty(bodyData)) {
                  validatePermissions = validatePermissions.filter(
                    (permission) => {
                      if (
                        permission != permissions[category].PERMISSIONS_KEY.EDIT
                      ) {
                        return permission;
                      }
                    }
                  );
                } else {
                  validatePermissions = validatePermissions.filter(
                    (permission) => {
                      if (
                        permission !=
                        permissions[category].PERMISSIONS_KEY.CREATE
                      ) {
                        return permission;
                      }
                    }
                  );
                }

                //Check user must have required all permissions.
                havePermissions = validatePermissions.every((value) => {
                  return modulePermissions.includes(value);
                });
              }
            }
            //send error if user is not have all required permission
            if (!havePermissions) {
              return res
                .status(401)
                .json({ status: 0, message: "Unauthorized to access" });
            }
          }
        }
        next();
      } catch (err) {
        console.log("Token authentication", err);
        return res.send({ status: 0, message: err });
      }
    };
  }

  /**
   * route authorization for masters common api with roles and permission
   *
   *
   */

  static isAdminAuthorizedMastersWithPermissions(permission) {
    return async (req, res, next) => {
      try {
        let masterModules = {
          masterAddons: "ADDONS",
          masterIndustry: "MASTER_INDUSTRY",
          masterSkills: "MASTER_SKILLS",
          masterJobTitles: "MASTER_JOB_TITLE",
          masterLevels: "MASTER_LEVELS",
          masterImmigration: "MASTER_IMMIGRATION_STATUS",
          masterAvailabilty: "MASTER_AVAILABILITY",
          masterExperience: "MASTER_EXPERIENCE",
          masterQualificationDuration: "MASTER_QUALIFICATION",
          masterAccreditation: "MASTER_ACCREDITATION",
          masterHourlyRate: "MASTER_HOURLY_RATE",
          masterYearlyRate: "MASTER_YEARLY_RATE",
          masterProffessionalBody: "MASTER_PROFFESSIONAL_BODY",
          masterLicense: "MASTER_LICENSE",
          masterSkillLevel: "MASTER_SKILL_LEVELS",
        };

        /********************************************************
         Get auth token from header
        ********************************************************/
        const token = req.headers.authorization;
        if (!token) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TOKEN_WITH_API"
            )
          );
        }

        /********************************************************
         Get Device Id from header and valid it
        ********************************************************/
        let deviceId = req.headers.deviceid;
        if (!deviceId) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "DEVICE_ID_WITH_API"
            )
          );
        }

        if (deviceId && (deviceId === "android" || deviceId === "ios")) {
          deviceId = "mobile";
        } else if (deviceId && deviceId === "web") {
          deviceId = "web";
        } else {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "WRONG_DEVICE_ID"
            )
          );
        }

        const authenticate = new Globals();

        /********************************************************
         Check token in DB
        ********************************************************/
        const tokenCheck = await authenticate.checkTokenInDB(token, deviceId);
        if (!tokenCheck) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "INVALID_TOKEN"
            )
          );
        }

        /********************************************************
         Check token Expiration
        ********************************************************/
        const tokenExpire = await authenticate.checkExpiration(token, deviceId);
        if (!tokenExpire) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TOKEN_EXPIRED"
            )
          );
        }

        /********************************************************
         Check Admin in DB
        ********************************************************/
        const userExist = await authenticate.checkAdminInDB(token);
        if (!userExist) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "ADMIN_NOT_EXIST"
            )
          );
        }

        if (userExist._id) {
          userExist.deviceId = deviceId;
          req.currentUser = userExist;

          if (userExist.role) {
            //get role details
            let role = await RolesSchema.findOne({
              _id: userExist.role,
            }).populate("permissions", "permissionKey");
            let userPermissions = role.permissions.map((p) => {
              return p.permissionKey;
            });

            let havePermissions = true;
            //Process if api need to check any permissions based on permissionKey
            if (permission) {
              if (role.role != "Super Admin") {
                let modulePermissions = userPermissions;

                let body = req.body;

                let category;

                if (permission == "IMPORT") {
                  let formObject = await new Form(req).parse();
                  req.form = formObject;
                  body = { moduleName: formObject.fields.moduleName[0] };
                } else {
                  body = _.isEmpty(body) ? req.query : body;
                }
                category =
                  masterModules[
                    body["tabName"] ? body["tabName"] : body["moduleName"]
                  ];

                let validatePermissions = [
                  permissions[category].PERMISSIONS_KEY[permission],
                ];

                //Check user must have required all permissions.
                havePermissions = validatePermissions.every((value) => {
                  return modulePermissions.includes(value);
                });
              } else {
                if (permission == "IMPORT") {
                  let formObject = await new Form(req).parse();
                  req.form = formObject;
                }
              }
            }
            //send error if user is not have all required permission
            if (!havePermissions) {
              return res
                .status(401)
                .json({ status: 0, message: "Unauthorized to access" });
            }
          }
        }
        next();
      } catch (err) {
        console.log("Token authentication", err);
        return res.send({ status: 0, message: err });
      }
    };
  }

  static isUserAuthorized(resource) {
    return async (req, res, next) => {
      try {
        /********************************************************
         Get auth token from header
        ********************************************************/
        const token = req.headers.authorization;
        if (!token) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TOKEN_WITH_API"
            )
          );
        }

        /********************************************************
         deviceId is web for users token
        ********************************************************/
        let deviceId = "web";
        if (!deviceId) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "DEVICE_ID_WITH_API"
            )
          );
        }

        const authenticate = new Globals();

        /********************************************************
         Check token in DB
        ********************************************************/
        const tokenCheck = await authenticate.checkTokenInDB(token, deviceId);

        if (!tokenCheck) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "INVALID_TOKEN"
            )
          );
        }

        /********************************************************
         Check token Expiration
        ********************************************************/
        const tokenExpire = await authenticate.checkExpiration(token, deviceId);
        if (!tokenExpire) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TOKEN_EXPIRED"
            )
          );
        }

        /********************************************************
         Check User in DB
        ********************************************************/
        const userExist = await authenticate.checkUserInDB(token);
        if (!userExist) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "USER_NOT_EXIST"
            )
          );
        }
        // if (userExist?._id && !userExist?.status) {
        //   let filter = {
        //     userId: userExist?._id,
        //     "access_tokens.deviceId": "web",
        //   };
        //   await Authentication.updateOne(filter, {
        //     $pull: { access_tokens: { deviceId: "web" } },
        //   }).exec();

        //   return new CommonService().handleReject(
        //     res,
        //     HTTP_CODE.FAILED,
        //     HTTP_CODE.UNAUTHORIZED_CODE,
        //     await new CommonService().setMessage(
        //       req.currentUserLang,
        //       "TOKEN_EXPIRED"
        //     )
        //   );
        // }
        console.log(userExist)
        if (userExist._id) {
          userExist.deviceId = deviceId;
          req.currentUser = userExist;
        }
        next();
      } catch (err) {
        console.log("Token authentication", err);
        return res.send({ status: 0, message: err });
      }
    };
  }
  static isAdviserAuthorizedAsEmployer() {
    return async (req, res, next) => {
      try {
        /********************************************************
         Get auth token from header
        ********************************************************/
        const token = req.headers.authorization;
        if (!token) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TOKEN_WITH_API"
            )
          );
        }

        /********************************************************
         deviceId is web for users token
        ********************************************************/
        let deviceId = "web";
        if (!deviceId) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "DEVICE_ID_WITH_API"
            )
          );
        }

        const authenticate = new Globals();

        /********************************************************
         Check token in DB
        ********************************************************/
        const tokenCheck = await authenticate.checkTokenInDB(token, deviceId);

        if (!tokenCheck) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "INVALID_TOKEN"
            )
          );
        }

        /********************************************************
         Check token Expiration
        ********************************************************/
        const tokenExpire = await authenticate.checkExpiration(token, deviceId);
        if (!tokenExpire) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TOKEN_EXPIRED"
            )
          );
        }

        /********************************************************
         Check User in DB
        ********************************************************/
        const userExist = await authenticate.checkUserInDB(token);
        if (!userExist) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "USER_NOT_EXIST"
            )
          );
        }
        if (userExist?._id && !userExist?.status) {
          let filter = {
            userId: userExist?._id,
            "access_tokens.deviceId": "web",
          };
          await Authentication.updateOne(filter, {
            $pull: { access_tokens: { deviceId: "web" } },
          }).exec();

          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TOKEN_EXPIRED"
            )
          );
        }
        if (userExist._id) {
          userExist.deviceId = deviceId;
          req.currentUser = userExist;
          if (userExist.role == "Adviser") {
            let employerId = null;
            if (req.query.employerId) {
              employerId = req.query.employerId;
            } else if (req.headers.employerid) {
              employerId = req.headers.employerid;
            } else {
              return new CommonService().handleReject(
                res,
                HTTP_CODE.FAILED,
                HTTP_CODE.UNAUTHORIZED_CODE,
                await new CommonService().setMessage(
                  req.currentUserLang,
                  "EMPLOYER_HEADERS_MISSING"
                )
              );
            }
            req.currentUser = await Users.findOne({
              _id: ObjectId(employerId),
            }).select({ password: 0 });
            if (_.isEmpty(req.currentUser)) {
              return new CommonService().handleReject(
                res,
                HTTP_CODE.FAILED,
                HTTP_CODE.UNAUTHORIZED_CODE,
                await new CommonService().setMessage(
                  req.currentUserLang,
                  "USER_NOT_EXIST"
                )
              );
            }
            req.adviser = userExist;
            req.isAdviser = true;
          }
        }
        next();
      } catch (err) {
        console.log("Token authentication", err);
        return res.send({ status: 0, message: err });
      }
    };
  }
  isEmailTokenVerified(tokenData) {
    return async (req, res, next) => {
      try {
        const token = tokenData;
        if (!token) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TOKEN_WITH_API"
            )
          );
        }
        /********************************************************
         Check token Expiration
        ********************************************************/
        let tokenExpire = (token) => {
          return new Promise((resolve, reject) => {
            /********************************************************
          Convert token into buffer and decode the token
      ********************************************************/
            let tokenDetails = Buffer.from(token, "binary").toString();
            let status = false;
            /********************************************************
          Check token Expiration
      ********************************************************/
            let expiryDate = Moment(tokenDetails.exp, "YYYY-MM-DD HH:mm:ss");
            let now = Moment(new Date(), "YYYY-MM-DD HH:mm:ss");

            if (expiryDate > now) {
              status = true;
              resolve(status);
            }

            resolve(status);
          });
        };
        tokenExpire = tokenExpire(token);
        if (!tokenExpire) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TOKEN_EXPIRED"
            )
          );
        }
        let userExist = await Users.findOne({
          _id: ObjectId(tokenDetails.id),
        });
        if (userExist._id) {
          userExist.deviceId = deviceId;
          req.currentUser = userExist;
        }
        next();
      } catch (err) {
        console.log("Token authentication", err);
        return res.send({ status: 0, message: err });
      }
    };
  }
  /**
   * To verify both user and admin for common API
   *
   */
  static isAuthorized(resource) {
    return async (req, res, next) => {
      try {
        /********************************************************
         Get auth token from header
        ********************************************************/
        const token = req.headers.authorization;
        if (!token) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TOKEN_WITH_API"
            )
          );
        }

        /********************************************************
         deviceId is web for users token
        ********************************************************/
        let deviceId = "web";
        if (!deviceId) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "DEVICE_ID_WITH_API"
            )
          );
        }

        const authenticate = new Globals();

        /********************************************************
         Check token in DB
        ********************************************************/
        const tokenCheck = await authenticate.checkTokenInDB(token, deviceId);

        if (!tokenCheck) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "INVALID_TOKEN"
            )
          );
        }

        /********************************************************
         Check token Expiration
        ********************************************************/
        const tokenExpire = await authenticate.checkExpiration(token, deviceId);
        if (!tokenExpire) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TOKEN_EXPIRED"
            )
          );
        }

        /********************************************************
         Check User in DB
        ********************************************************/
        const userExist = await authenticate.checkBothUserInDB(token);
        if (!userExist) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "ADMIN_NOT_EXIST"
            )
          );
        }
        if (userExist?.role == "Employer" || userExist?.role == "Applicant") {
          if (!userExist?.status) {
            let filter = {
              userId: !userExist?._id,
              "access_tokens.deviceId": "web",
            };
            await Authentication.updateOne(filter, {
              $pull: { access_tokens: { deviceId: "web" } },
            }).exec();

            return new CommonService().handleReject(
              res,
              HTTP_CODE.FAILED,
              HTTP_CODE.UNAUTHORIZED_CODE,
              await new CommonService().setMessage(
                req.currentUserLang,
                "TOKEN_EXPIRED"
              )
            );
          }
        }

        if (userExist._id) {
          userExist.deviceId = deviceId;
          req.currentUser = userExist;
        }
        next();
      } catch (err) {
        console.log("Token authentication", err);
        return res.send({ status: 0, message: err });
      }
    };
  }

  static getTechnology() {
    return async (req, res, next) => {
      try {
        /********************************************************
         Get technology from header and validate
        ********************************************************/
        const tech = req.headers.technology;
        if (!tech) {
          return new CommonService().handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            await new CommonService().setMessage(
              req.currentUserLang,
              "TECHNOLOGY_WITH_API"
            )
          );
        }
        if (tech) {
          req.currentUserTech = tech;
        }
        next();
      } catch (err) {
        console.log("Technology authentication", err);
        return res.send({ status: 0, message: err });
      }
    };
  }

  static setLanguage() {
    return async (req, res, next) => {
      try {
        /********************************************************
         Get Language from header and validate
        ********************************************************/
        const langId = req.headers.language;
        let checkLang;
        if (langId) {
          checkLang = await Languages.findOne({
            _id: langId,
            status: true,
            isDeleted: false,
          }).exec();
          if (!checkLang) {
            return new CommonService().handleReject(
              res,
              HTTP_CODE.FAILED,
              HTTP_CODE.BAD_REQUEST_CODE,
              await new CommonService().setMessage(
                req.currentUserLang,
                "LANGUAGE_WITH_API"
              )
            );
          }
        } else {
          checkLang = await Languages.findOne({ isPrimary: true }).exec();
        }
        req.currentUserLang = checkLang._id;
        next();
      } catch (err) {
        console.log("Technology authentication", err);
        return res.send({ status: 0, message: err });
      }
    };
  }

  generateToken(id, time, redirectLink) {
    return new Promise((resolve, reject) => {
      try {
        let expTime = time ? time : config.tokenExpiry;
        let token = jwt.sign(
          {
            id: id,
            algorithm: "HS256",
            exp: Math.floor(Date.now() / 1000) + parseInt(expTime),
            // redirectLink: redirectLink,
          },
          config.securityToken
        );
        return resolve(token);
      } catch (err) {
        console.log("Get token", err);
        return reject({ message: err, status: 0 });
      }
    });
  }

  generateTokenWithoutExpiry(id, redirectLink) {
    return new Promise((resolve, reject) => {
      try {
        let token = jwt.sign(
          {
            id: id,
            algorithm: "HS256",
            redirectLink: redirectLink,
          },
          config.securityToken
        );
        return resolve(token);
      } catch (err) {
        console.log("Get token", err);
        return reject({ message: err, status: 0 });
      }
    });
  }

  decodeAdminForgotToken(token) {
    return new Promise((resolve, reject) => {
      (async () => {
        const admin = await Admin.findOne({ forgotToken: token });
        if (
          admin &&
          admin.forgotTokenCreationTime &&
          parseInt(config.forgotTokenExpireTime)
        ) {
          let expiryDate = Moment(admin.forgotTokenCreationTime).add(
            parseInt(config.forgotTokenExpireTime),
            "minutes"
          );
          let now = Moment();
          if (expiryDate < now) {
            return resolve(false);
          }
        }
        return resolve(true);
      })();
    });
  }

  //Check admin in db
  checkAdminInDB(token) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          /********************************************************
         Decode token
        ********************************************************/
          let decoded = jwt.decode(token);
          if (!decoded) {
            return resolve(false);
          }
          let adminId = decoded.id;

          /********************************************************
         Check admin in DB
        ********************************************************/
          const user = await Admin.findOne({ _id: adminId, isDeleted: false });
          if (user) {
            return resolve(user);
          }
          return resolve(false);
        } catch (err) {
          console.log("Check ADMIN in db");
          return reject({ message: err, status: 0 });
        }
      })();
    });
  }

  //Check Admin and other User( Applicant,Employer) in DB

  checkBothUserInDB(token) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          /********************************************************
         Decode token
        ********************************************************/
          let decoded = jwt.decode(token);
          if (!decoded) {
            return resolve(false);
          }
          let userId = decoded.id;

          /********************************************************
         Check user in DB
        ********************************************************/
          let user;
          user = await Users.findOne({ _id: userId, isDeleted: false });
          if (_.isEmpty(user))
            user = await Admin.findOne({ _id: userId, isDeleted: false });

          if (user) {
            return resolve(user);
          }
          return resolve(false);
        } catch (err) {
          console.log("Check USER in db");
          return reject({ message: err, status: 0 });
        }
      })();
    });
  }
  //Check user in db
  checkUserInDB(token) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          /********************************************************
         Decode token
        ********************************************************/
          let decoded = jwt.decode(token);
          if (!decoded) {
            return resolve(false);
          }
          let userId = decoded.id;

          /********************************************************
         Check user in DB
        ********************************************************/
          const user = await Users.findOne({ _id: userId, isDeleted: false });
          if (user) {
            return resolve(user);
          }
          return resolve(false);
        } catch (err) {
          console.log("Check USER in db");
          return reject({ message: err, status: 0 });
        }
      })();
    });
  }

  // Check token in DB
  checkTokenInDB(token, deviceId) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          /********************************************************
         Convert token into buffer and decode the token
        ********************************************************/
          let tokenDetails = Buffer.from(token, "binary").toString();
          let decoded = jwt.verify(tokenDetails, config.securityToken, {
            ignoreExpiration: true,
          });
          if (!decoded) {
            return resolve(false);
          }
          /********************************************************
         Check token is authorized or not
        ********************************************************/
          // device id not storing in db
          // const authenticate = await Authentication.findOne({ 'access_tokens': { $elemMatch: { 'token': tokenDetails, 'deviceId': deviceId } } }).exec();
          const authenticate = await Authentication.findOne({
            access_tokens: { $elemMatch: { token: tokenDetails } },
          }).exec();
          if (authenticate) return resolve(true);
          return resolve(false);
        } catch (err) {
          console.log("Check token in db", err);
          return resolve({ message: err, status: 0 });
        }
      })();
    });
  }
  // Check Token Expiration
  checkExpiration(token, deviceId) {
    return new Promise((resolve, reject) => {
      (async () => {
        /********************************************************
          Convert token into buffer and decode the token
      ********************************************************/
        let tokenDetails = Buffer.from(token, "binary").toString();
        let status = false;

        /********************************************************
          Check token Expiration
      ********************************************************/
        // device id not stpred in db
        // const authenticate = await Authentication.findOne({ 'access_tokens.token': tokenDetails, 'access_tokens.deviceId': deviceId }).exec()

        const authenticate = await Authentication.findOne({
          "access_tokens.token": tokenDetails,
        }).exec();

        if (authenticate && authenticate.access_tokens) {
          for (const token of authenticate.access_tokens) {
            let expiryDate = Moment(
              token.tokenExpiryTime,
              "YYYY-MM-DD HH:mm:ss"
            );
            let now = Moment(new Date(), "YYYY-MM-DD HH:mm:ss");

            if (expiryDate > now) {
              status = true;
              resolve(status);
            }
          }
        }
        resolve(status);
      })();
    });
  }

  // Check refreshToken in DB
  checkRefreshTokenInDB(token) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let tokenDetails = Buffer.from(token, "binary").toString();
          // Initialization of variables
          let decoded = jwt.verify(tokenDetails, config.securityRefreshToken, {
            ignoreExpiration: true,
          });
          if (!decoded) {
            return resolve(false);
          }

          const authenticate = await Authentication.findOne({
            refreshToken: tokenDetails,
          }).exec();
          if (!authenticate) {
            return resolve(false);
          }
          return resolve(true);
        } catch (err) {
          console.log("Check refreshtoken in db", err);
          return resolve(false);
        }
      })();
    });
  }

  //refreshAccessToken
  refreshAccessToken(params) {
    return new Promise((resolve, reject) => {
      (async () => {
        let deviceId = params.deviceId;
        const refreshToken = params.refreshToken;
        /********************************************************
          Set device Id
      ********************************************************/
        if (deviceId === "android" || deviceId === "ios") {
          deviceId = "mobile";
        } else if (deviceId === "web") {
          deviceId = "web";
        } else {
          return reject({
            status: 0,
            message: await new CommonService().setMessage(
              params.currentUserLang,
              "WRONG_DEVICE_ID"
            ),
          });
        }

        /********************************************************
         decode authtoken
      ********************************************************/
        const decoded = jwt.decode(refreshToken);
        if (!decoded) {
          return resolve({ status: 0, message: "Invalid refresh token." });
        }

        const adminId = decoded.id;
        const authenticationData = await Authentication.findOne({
          adminId: adminId,
          "access_tokens.deviceId": deviceId,
        }).exec();

        if (authenticationData?.access_tokens) {
          for (const token of authenticationData.access_tokens) {
            if (token.deviceId === deviceId) {
              const expiryDate = Moment(
                token.tokenExpiryTime,
                "YYYY-MM-DD HH:mm:ss"
              );
              const now = Moment(new Date(), "YYYY-MM-DD HH:mm:ss");

              if (expiryDate > now) {
                return resolve({
                  status: 0,
                  message: "Access token is not expired yet.",
                });
              } else {
                const authenticate = new Globals();
                const { token, refreshToken } =
                  await authenticate.getTokenWithRefreshToken({
                    id: authenticationData.adminId,
                    device: deviceId,
                  });
                return resolve({
                  status: 1,
                  message: "Token refreshed.",
                  accessToken: token,
                  refreshToken: refreshToken,
                });
              }
            }
          }
        } else {
          return resolve({ status: 0, message: "Wrong refresh token." });
        }
      })();
    });
  }

  // Generate RefreshToken
  getTokenWithRefreshToken(params) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          /********************************************************
        Generate Token
        ********************************************************/
          let token = jwt.sign(
            {
              id: params.id,
              algorithm: "HS256",
              exp: Math.floor(Date.now() / 1000) + parseInt(config.tokenExpiry),
            },
            config.securityToken
          );
          /********************************************************
        Generate refreshToken            
        *******************************************************/
          let refreshToken = jwt.sign(
            {
              id: params.id,
              algorithm: "HS256",
              exp:
                Math.floor(Date.now() / 1000) +
                parseInt(config.refreshTokenExpiry),
            },
            config.securityRefreshToken
          );

          /********************************************************
        set device params            
        *******************************************************/
          if (
            params.device &&
            (params.device === "android" || params.device === "ios")
          ) {
            params.device = "mobile";
          }
          params.adminId = params.id;
          params.refreshToken = refreshToken;
          params.tokenExpiryTime = Moment().add(
            parseInt(config.tokenExpirationTime),
            "minutes"
          );
          delete params.id;
          params.token = token;
          /********************************************************
        Fetch Admin User from the DB and update the token details             
        *******************************************************/
          let filter = {
            adminId: params.adminId,
            "access_tokens.deviceId": params.device,
          };
          let filter2 = {
            adminId: params.adminId,
          };
          if (params.type && params.type == "user") {
            filter = {
              userId: params.adminId,
              "access_tokens.deviceId": params.device,
            };
            params.device = "web";
            filter2 = {
              userId: params.adminId,
            };
          }
          let fetchUser = await Authentication.findOne(filter).exec();

          if (fetchUser) {
            await Authentication.updateOne(
              filter,
              {
                $set: {
                  "access_tokens.$.token": token,
                  "access_tokens.$.refreshToken": refreshToken,
                  "access_tokens.$.tokenExpiryTime": params.tokenExpiryTime,
                  "access_tokens.$.deviceId": params.deviceId,
                },
              },
              { new: true, upsert: true }
            ).exec();
          } else {
            await Authentication.findOneAndUpdate(
              filter2,
              {
                $push: {
                  access_tokens: {
                    token: token,
                    tokenExpiryTime: params.tokenExpiryTime,
                    deviceId: params.device,
                    refreshToken: refreshToken,
                  },
                },
              },
              { new: true, upsert: true }
            ).exec();
          }

          return resolve({ token, refreshToken });
        } catch (err) {
          console.error("Get token", err);
          return reject({ message: err, status: 0 });
        }
      })();
    });
  }

  static async isValid(req, res, next) {
    try {
      if (config.useRefreshToken && config.useRefreshToken != "true") {
        return new CommonService().handleReject(
          req,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNAUTHORIZED_CODE,
          "Not authorized to refresh token."
        );
      }
      next();
    } catch (err) {
      console.error("isValid", err);
      return new CommonService().handleReject(
        req,
        HTTP_CODE.FAILED,
        HTTP_CODE.UNAUTHORIZED_CODE,
        err
      );
    }
  }

  static escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }
}

module.exports = Globals;
