const _ = require("lodash");
const Controller = require("../Base/Controller");
const Globals = require("../../../configs/Globals");
const ContactUs = require("./Schema").contactUsSchema;
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const Users = require("./Schema").userSchema;
const Applicant = require("../Applicant/Schema").applicantSchema;
const config = require("../../../configs/configs");
const { Employer, Subscriptions } = require("../Employer/Schema");
const { HTTP_CODE, EMAIL_TEMPLATE_KEYS } = require("../../services/constant");
const EmployerService = require("../../services/Employer");
const ObjectId = require("mongoose").Types.ObjectId;
const Models = require("../MasterDataManagement/Schema");
const Email = require("../../services/Email");
const { Jobs, AppliedJobs } = require("../Articles/Schema");
const Authentication = require("../Authentication/Schema").Authtokens;
const File = require("../../services/File");
const Form = require("../../services/Form");
const ApplicantService = require("../../services/Applicant");
const UserService = require("../../services/User");
const Admin = require("../Admin/Schema").Admin;
const UserNotifications = require("../Users/Schema").userNotification;
const ActivityLog = require("./Schema").activityLogSchema;
const EmailService = require("../../services/Email");
const { paymentGatewaySchema } = require("../Settings/Schema");
const { AdvisorSchema } = require("../Advisor/Schema");
class UserController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
     @Purpose Send Feedback ( Contact Us)
     @Parameter {
            "name": "John",
            "city": "city name",
            "email": "john@gmail.com",
            "phoneCode": 91,
            "phone": 09877676765,
            "queryType": "Complaint/Suggestion/Tech Issue/Others",
            "queryMessage": "message"
        }
     @Return JSON String
     ********************************************************/
  async sendFeedback() {
    try {
      /********************************************************
             Generate Field Array and process the request body
            ********************************************************/

      let fieldsArray = [
        "name",
        "city",
        "email",
        "phonecCode",
        "phone",
        "queryType",
        "queryMessage",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      //find super admin
      let adminInfo = await Admin.aggregate([
        { $match: { isDeleted: false } },
        {
          $lookup: {
            from: "roles",
            let: { roleId: "$role" }, // Store the role field value in a variable roleId
            pipeline: [
              {
                $match: { $expr: { $eq: ["$_id", "$$roleId"] } }, // Match the _id of "roles" with roleId
              },
              {
                $match: { role: "Super Admin" },
              },
            ],
            as: "role",
          },
        },
        { $match: { "role.0": { $exists: true } } },
      ]);

      const validateEmail = await new CommonService().validateEmail(data.email);

      if (validateEmail.status == false) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "INVALID_EMAIL"
          )
        );
      }

      let contactUsData = await ContactUs.create(data);
      if (_.isEmpty(contactUsData)) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "FEEDBACK_NOT_SENT"
          )
        );
      }

      // log notification to admin after feedback sent

      let adminNotifyData = {
        event: "Feedback Received",
        log: `${data.name} with this email ${data.email} has sent you ${data.queryType} feedback`,
        data: {
          id: contactUsData._id,
          type: "feedback",
        },
        isVisibleToAdmin: true,
        sendEmailTo: adminInfo,
        sendEmailDataObj: {
          emailKey: "feedback_received_email_to_admin",
          replaceDataObj: {
            name: data?.name?.toUpperCase() || "N/A",
            email: data.email,
            queryType: data.queryType,
            message: data.queryMessage,
          },
        },
      };
      new UserService().logUserNotifications(adminNotifyData);

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "FEEDBACK_SENT"
        )
      );
    } catch (error) {
      console.log(error);
      return new CommonService().handleResolve(
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
     @Purpose Verify Email OTP
     @Parameter {
            "OTP": "",
            "id":""
        }
     @Return JSON String
     ********************************************************/
  async verifyEmailOTP() {
    try {
      /********************************************************
             Generate Field Array and process the request body
            ********************************************************/
      let fieldsArray = ["OTP", "id"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      //find user

      let user = await Users.findById(data.id);
      if (data.OTP != user.emailOTP) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "INVALID_OTP"
          )
        );
      }

      // get current timestamp
      let currentTime = new Date().getTime();
      let expiryTime =
        user.otpCreatedAt + config.verificationEmailOTPExpireTime * 60000;

      if (expiryTime >= currentTime) {
        //stripe user creation and store id
        if (user.role == "Employer") {
          let stripe = await new EmployerService().createStripeUser(user.email);
          if (!stripe.status) {
            console.log(
              `\n-------stripe user creation failed--------\n${stripe}\n-----------------\n`
            );
          } else {
            await Employer.updateOne(
              { userId: user._id },
              { stripeCustomerId: stripe.data.id }
            );
          }
        }

        await Users.updateOne(
          { _id: data.id },
          { $set: { isEmailVerified: true, status: true } }
        );

        // send welcome email
        const emailStatus = new EmailService().sendNotification({
          emailId: user.email,
          emailKey: "signup_mail",
        });

        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "OTP_VERIFIED"
          ),
          {
            id: data.id,
          }
        );
      }

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "OTP_EXPIRED"
        )
      );
    } catch (error) {
      console.log(error);
      return new CommonService().handleResolve(
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
     @Purpose Send OTP
     @Parameter {
            "email": ""
        }
     @Return JSON String
     ********************************************************/
  async sendOTP() {
    try {
      let fieldsArray = ["email"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      data.email = data.email.toString().toLowerCase();

      let userData = await Users.findOne({ email: data.email });

      if (_.isEmpty(userData)) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "USER_NOT_EXIST"
          )
        );
      }

      //check account was deleted or not
      if (userData.isDeleted && userData.isOldAccount) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "NOT_REGISTERED"
          )
        );
      }

      // validate email

      const validateEmail = await new CommonService().validateEmail(data.email);

      if (validateEmail.status == false) {
        return this.res.send({
          data: [],
          status: 0,
          message: validateEmail.message,
        });
      }
      let name = `${userData.firstName} ${userData.lastName}`;
      if (userData.role == "Employer") {
        let user = await Employer.findOne({
          userId: ObjectId(userData._id),
        }).select({ compnayName: 1 });
        name = userData.companyName ? user.companyName : user._doc.companyName;
      }
      if (userData.role == "Adviser") {
        let user = await AdvisorSchema.findOne({
          userId: ObjectId(userData._id),
        }).select({ compnayName: 1 });
        name = user.companyName ? user.companyName : user._doc.companyName;
      }
      // create email verification code
      const emailVerificationCode =
        await new CommonService().generateRandomString(Users, "emailOTP");
      let replaceDataObj = {
        otp: emailVerificationCode,
        name: name,
      };

      // send email verification code
      const emailStatus = await new Email().sendNotification({
        emailId: data.email,
        emailKey: "otp_mail",
        replaceDataObj,
      });
      console.log(emailStatus);
      if (emailStatus) {
        if (emailStatus.status == 0) {
          console.log(
            `\n---------------Applicant SIGN-UP OTP SENT ERROR----------------\n${emailStatus}\n------------------------------\n`
          );
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.BAD_REQUEST_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "OTP_SENT_FAILED"
            ),
            emailStatus
          );
        }

        data.otpCreatedAt = new Date().getTime();

        await Users.updateOne(
          { _id: userData._id },
          {
            $set: {
              emailOTP: emailVerificationCode,
              otpCreatedAt: data.otpCreatedAt,
            },
          }
        );

        const sendUserObj = {
          id: userData._id,
          email: userData.email,
        };

        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "OTP_SENT"
          ),
          sendUserObj
        );
      } else {
        console.log(
          `\n---------------Applicant SIGN-UP OTP SENT ERROR----------------\n${emailStatus}\n------------------------------\n`
        );
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "OTP_SENT_FAILED"
          ),
          emailStatus
        );
      }
    } catch (error) {
      console.log(error);
      return new CommonService().handleResolve(
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
  @Purpose User Sign In
    @Parameter
    {
    email:"test@email.com",
    password:"Test@123"
    }
    @Return JSON String
********************************************************/
  async userSignIn() {
    try {
      //Generate Field Array and process the request body
      let fieldsArray = ["email"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      data.email = data.email.toString().toLowerCase();

      //check user exist or not
      const user = await Users.findOne({ email: data.email });
      if (_.isEmpty(user)) {

        //no user found so create a user and ask him to fill the details
        let userInfo = await Users.create(data);

        let tokenData = { id: userInfo._id, type: "user" };
        let responseData = {
          email: data.email,
          role: 'user',
          isPopup: true,
        };

        let token = await new Globals().UserToken(tokenData);
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "LOGIN_SUCCESS"
          ),
          responseData,
          {
            access_token: token,
          }
        );
      }


      if (user.isPopup) {
        let tokenData = { id: user._id, type: "user" };
        let responseData = {
          email: data.email,
          role: 'user',
          isPopup: true,
        };

        let token = await new Globals().UserToken(tokenData);
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "LOGIN_SUCCESS"
          ),
          responseData,
          {
            access_token: token,
          }
        );
      }


      //check inactive was deleted or not
      if (!user.status) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "INACTIVE_ACCOUNT"
          )
        );
      }

      let tokenData = { id: user._id, type: "user" };
      let responseData = {
        userId: user._id,
        email: user.email,
        role: user.role,
        isPopup: user.isPopup ? user.isPopup : false,
        ...user._doc
      };
      //get the subscription details


      let token = await new Globals().UserToken(tokenData);
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "LOGIN_SUCCESS"
        ),
        responseData,
        {
          access_token: token,
        }
      );

    } catch (e) {
      console.log(e);
      console.log(
        `\n---------------user login Error----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        { error: e }
      );
    }
  }

  /********************************************************
  @Purpose User Sign Up
  @Return JSON String
********************************************************/
  async userSignUp() {
    try {

      // console.log(this.req['currentUser'])
      let currentUser = this.req['currentUser']
      let data = this.req.body
      await Users.updateOne(
        { _id: currentUser.id },
        { $set: { ...data,isPopup:false } }
      );

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "LOGIN_SUCCESS"
        )
      );

    } catch (e) {
      console.log(e);
      console.log(
        `\n---------------user finish sign up Error----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        { error: e }
      );
    }

  }



  /********************************************************
  @Purpose User popup close
    @Parameter
    {
    isPopup:true
    }
    @Return JSON String
********************************************************/
  async userPopup() {
    try {
      //Generate Field Array and process the request body
      let fieldsArray = ["isPopup"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      let userId = this.req.currentUser ? this.req.currentUser._id : "";
      await Users.updateOne(
        { _id: ObjectId(userId) },
        {
          $set: {
            isPopup: data.isPopup,
          },
        }
      );
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "POPUP_CLOSED"
        )
      );
    } catch (e) {
      console.log(e);
      console.log(
        `\n---------------user popup Error----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        { error: e }
      );
    }
  }
  /********************************************************
  @Purpose User reset password
    @Parameter
    {
    password:"Test@123",
    confirmPassword:"Test@123"
    }
    @Return JSON String
********************************************************/
  async resetPassword() {
    try {
      //Generate Field Array and process the request body
      let fieldsArray = ["confirmPassword", "password", "id"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      let userId = data.id;

      //check user exist or not
      const user = await Users.findOne({ _id: userId });
      if (_.isEmpty(user)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "USER_NOT_EXIST"
          )
        );
      }

      //check both passwords should be equal
      if (!(data.password === data.confirmPassword)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "PASSWORD_NOT_MATCHED"
          )
        );
      }

      // validate password
      const validatePassword =
        await new CommonService().validatePasswordCombination(data.password);
      if (validatePassword.status == false) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "USER_PASSWORD_VALIDATION"
          )
        );
      }

      // encrypt password
      const encryptPassword = await new CommonService().ecryptPassword({
        password: data.password,
      });
      data.password = encryptPassword;
      await Users.updateOne(
        { _id: ObjectId(userId) },
        {
          updatedAt: new Date().getTime(),
          password: data.password,
        }
      );
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "PASSWORD_UPDATED_SUCCESSFULLY"
        )
      );
    } catch (e) {
      console.log(
        `\n---------------user reset password Error----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        e
      );
    }
  }

  /********************************************************
  @Purpose User change password
    @Parameter
    {
    currentPassword:"Test@1234"
    password:"Test@123",
    confirmPassword:"Test@123"
    }
    @Return JSON String
********************************************************/
  async changePassword() {
    try {
      //Generate Field Array and process the request body
      let fieldsArray = ["currentPassword", "confirmPassword", "password"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      let userId = this.req.currentUser._id;

      //check user exist or not
      const user = await Users.findOne({ _id: userId });
      if (_.isEmpty(user)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "USER_NOT_EXIST"
          )
        );
      }

      //Verify Password
      const status = await new CommonService().verifyPassword({
        password: data.currentPassword,
        savedPassword: user.password,
      });
      if (!status) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "INVALID_CURRENT_PASSWORD"
          )
        );
      }

      //check both passwords should be equal
      if (!(data.password === data.confirmPassword)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "PASSWORD_NOT_MATCHED"
          )
        );
      }

      // validate password
      const validatePassword =
        await new CommonService().validatePasswordCombination(data.password);
      if (validatePassword.status == false) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "USER_PASSWORD_VALIDATION"
          )
        );
      }

      // encrypt password
      const encryptPassword = await new CommonService().ecryptPassword({
        password: data.password,
      });
      data.password = encryptPassword;
      await Users.updateOne(
        { _id: ObjectId(userId) },
        {
          $set: {
            updatedAt: new Date().getTime(),
            password: data.password,
          },
        }
      );
      // log activity to user
      let activityObj = {
        userId: userId,
        event: "Changed Password",
        log: "You have changed your password.",
      };
      new UserService().activityLog(activityObj);

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "PASSWORD_UPDATED_SUCCESSFULLY"
        )
      );
    } catch (e) {
      console.log(
        `\n---------------user login Error----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        e
      );
    }
  }

  /********************************************************
  @Purpose User get master data
  @Parameter
  @Return JSON String
********************************************************/
  async getMasterData() {
    try {
      let data = this.req.body;
      const keys = Object.keys(data);
      let response = await Promise.all(
        keys.map(async (e) => {
          if (data[e]) {
            if (e == "masterCities" || e == "masterRegions") {
              data[e] = await Models[e]
                .aggregate([
                  { $match: { status: true } },
                  {
                    $addFields: {
                      customSort: {
                        $switch: {
                          branches: [
                            {
                              case: { $eq: ["$name", "All New Zealand"] },
                              then: 0,
                            },
                            {
                              case: { $eq: ["$name", "North Island"] },
                              then: 1,
                            },
                            {
                              case: { $eq: ["$name", "South Island"] },
                              then: 2,
                            },
                          ],
                          default: 3,
                        },
                      },
                    },
                  },
                  {
                    $sort: {
                      customSort: 1,
                      name: 1,
                    },
                  },
                  {
                    $project: {
                      customSort: 0,
                    },
                  },
                ])
                .collation({ locale: "en", strength: 2 })
                .exec();
            } else if (e == "masterHourlyRate") {
              data[e] = await Models[e]
                .find({ status: true })
                .sort({ from: 1, to: 1 })
                .lean();
            } else {
              console.log(Models[e]);
              data[e] = await Models[e]
                .find({ status: true })
                .sort({ createdAt: -1 })
                .lean();
            }
          } else {
            delete data[e];
          }
        })
      );
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
    } catch (e) {
      console.log(
        `\n---------------user get master data Error----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        e
      );
    }
  }

  /********************************************************
  @Purpose User get job title suggesions
  @Parameter
  @Return JSON String
********************************************************/
  async getJobTitles() {
    try {
      //process req.query params
      let fieldsArray = ["searchText"];
      let data = await new RequestBody().processRequestBody(
        this.req.query,
        fieldsArray
      );
      let result = [];
      if (data.searchText) {
        //create match regex
        let match = { jobTitle: { $regex: data.searchText, $options: "i" } };
        result = await Jobs.aggregate([
          { $match: { ...match } },
          {
            $group: {
              _id: "",
              listing: { $addToSet: "$jobTitle" },
            },
          },
        ]);
      }
      if (result.length) {
        result = result[0].listing;
      }
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        { listing: result }
      );
    } catch (e) {
      console.log(
        `\n---------------user get master data Error----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        e
      );
    }
  }

  /********************************************************
 Purpose: Logout User
 Parameter:
 {}
 Return: JSON String
 ********************************************************/
  async logout() {
    try {
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";
      if (currentUser) {
        let filter = { userId: currentUser, "access_tokens.deviceId": "web" };
        await Authentication.updateOne(filter, {
          $pull: { access_tokens: { deviceId: "web" } },
        }).exec();

        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "LOGOUT_SUCCESS"
          )
        );
      } else {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "USER_NOT_EXIST"
          )
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
    @Purpose File upload (pdf)
    @Parameter
    {
           "file":
    }
    @Return JSON String
    ********************************************************/
  async fileUpload() {
    try {
      let form = new Form(this.req);
      let formObject = await form.parse();
      // Array of allowed files
      const array_of_allowed_files = ["pdf"];

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
      let fileObject = await file.storeFile(file_extension);
      filePath = fileObject.filePath;
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "FILE_UPLOAD_SUCCESSFULLY"
        ),
        { filePath }
      );
    } catch (error) {
      console.log("error docFileUpload()", error);
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
    @Purpose delete account
    @Parameter
    @Return JSON String
    ********************************************************/
  async deleteAccount() {
    try {
      const user = this.req.currentUser ? this.req.currentUser : {};
      let deleteRes = {};
      if (user.role == "Applicant") {
        //delete applicant
        deleteRes = await new ApplicantService().deleteApplicant(user);
      } else if (user.role == "Employer") {
        //delete employer
        deleteRes = await new EmployerService().deleteEmployer(user);
      } else {
        //delete employer
        deleteRes = await new EmployerService().deleteAdviser(user);
      }
      if (!_.isEmpty(deleteRes) && deleteRes.status) {
        // activity log
        // create activity log of delete account
        let logData = {
          userId: user._id,
          event: "Account Deleted",
          log: "You have deleted your account",
        };
        new UserService().activityLog(logData);

        // log notification
        //get userinfo
        let userInfo = await Users.findOne({ _id: ObjectId(user._id) });

        //find super admin
        let adminInfo = await Admin.aggregate([
          { $match: { isDeleted: false } },
          {
            $lookup: {
              from: "roles",
              let: { roleId: "$role" }, // Store the role field value in a variable roleId
              pipeline: [
                {
                  $match: { $expr: { $eq: ["$_id", "$$roleId"] } }, // Match the _id of "roles" with roleId
                },
                {
                  $match: { role: "Super Admin" },
                },
              ],
              as: "role",
            },
          },
          { $match: { "role.0": { $exists: true } } },
        ]);

        if (userInfo.role == "Applicant") {
          // get all employer list associated with this applicant from applied jobs
          let appliedJobsData = await AppliedJobs.find({
            userId: ObjectId(user._id),
          }).select("jobId");

          if (!_.isEmpty(appliedJobsData)) {
            await UserController.asyncForEach(appliedJobsData, async (data) => {
              let employerInfo = await Jobs.findOne({
                _id: ObjectId(data.jobId),
              }).select("userId");

              let companyInfo = await Employer.findOne({
                userId: employerInfo.userId,
              });

              let notificationData;

              if (data.email) {
                notificationData = {
                  senderId: user._id,
                  receiverId: employerInfo.userId,
                  event: "Applicant Account Deleted",
                  sendEmailTo: [{ emailId: data.email }],
                  log: `${userInfo.firstName} ${userInfo.lastName} has deleted account.You won't be able to contact this applicant again until account recovers.`,
                  sendEmailDataObj: {
                    emailKey: "applicant_account_deleted_mail_to_employer",
                    replaceDataObj: {
                      companyName: companyInfo.companyName,
                      applicantName:
                        `${userInfo.firstName || ""} ${userInfo.lastName || ""
                          }`?.toUpperCase() || "N/A",
                    },
                  },
                };
              } else {
                notificationData = {
                  senderId: user._id,
                  receiverId: employerInfo.userId,
                  event: "Applicant Account Deleted",
                  sendEmailTo: [],
                  log: `${userInfo.firstName} ${userInfo.lastName} has deleted account.You won't be able to contact this applicant again until account recovers.`,
                };
              }
              new UserService().logUserNotifications(notificationData);
            });
          }

          let adminNotifyData = {
            senderId: user._id,
            event: "Applicant Account Deleted",
            log: `${userInfo.firstName} ${userInfo.lastName} with this email ${userInfo.email} has deleted account.`,
            data: {
              id: user._id,
              type: "applicant",
            },
            isVisibleToAdmin: true,
            sendEmailTo: adminInfo,
            subject: "Applicant Account Deleted",
            sendEmailDataObj: {
              emailKey: "account_deleted_mail_to_admin",
              replaceDataObj: {
                applicantName:
                  `${userInfo.firstName || ""} ${userInfo.lastName || ""
                    }`?.toUpperCase() || "N/A",
                adminName: "Admin",
              },
            },
          };
          new UserService().logUserNotifications(adminNotifyData);
        } else if (userInfo.role == "Employer") {
          // get job posted by emoloyer
          let jobList = await Jobs.find({
            userId: ObjectId(user._id),
            isDeleted: false,
            status: "Published",
          }).select("jobId");

          // employer info
          let employerInfo = await Employer.findOne({
            userId: ObjectId(user._id),
          });
          if (!_.isEmpty(jobList)) {
            await UserController.asyncForEach(jobList, async (data) => {
              let applicantInfo = await AppliedJobs.findOne({
                jobId: ObjectId(data._id),
              });
              if (!_.isEmpty(applicantInfo)) {
                // get jobINfo
                let jobInfo = await Jobs.findOne({
                  _id: ObjectId(applicantInfo.jobId),
                });
                let notificationData = {
                  senderId: user._id,
                  receiverId: applicantInfo.userId,
                  event: "Employer Account Deleted",
                  sendEmailTo: [{ emailId: applicantInfo.email }],
                  log: `${employerInfo.companyName} has deleted account.You wont be able to contact this employer again until account recovers.`,
                  sendEmailDataObj: {
                    emailKey: "employer_account_deleted_mail_to_applicant",
                    replaceDataObj: {
                      applicantName:
                        `${applicantInfo.firstName || ""} ${applicantInfo.lastName || ""
                          }`?.toUpperCase() || "N/A",
                      jobTitle: jobInfo.jobTitle,
                    },
                  },
                };
                new UserService().logUserNotifications(notificationData);
              }
            });
          }

          let adminNotifyData = {
            senderId: user._id,
            event: "Employer Account Deleted",
            log: `${employerInfo.companyName} with this email ${userInfo.email} has deleted account.`,
            data: {
              id: user._id,
              type: "employer",
            },
            isVisibleToAdmin: true,
            sendEmailTo: adminInfo,
            subject: "Employer Account Deleted",
            sendEmailDataObj: {
              emailKey: "employer_account_deleted_mail_to_admin",
              replaceDataObj: {
                companyName: employerInfo.companyName,
                adminName: "Admin",
              },
            },
          };
          new UserService().logUserNotifications(adminNotifyData);
        } else {
          // adviser info
          let adviserInfo = await AdvisorSchema.findOne({
            userId: ObjectId(user._id),
          });

          let adminNotifyData = {
            senderId: user._id,
            event: "Adviser Account Deleted",
            log: `${adviserInfo.companyName} with this email ${userInfo.email} has deleted account.`,
            data: {
              id: user._id,
              type: "adviser",
            },
            isVisibleToAdmin: true,
            sendEmailTo: adminInfo,
            subject: "Adviser Account Deleted",
            sendEmailDataObj: {
              emailKey: "adviser_account_deleted_mail_to_admin",
              replaceDataObj: {
                companyName: adviserInfo.companyName,
                adminName: "Admin",
              },
            },
          };
          new UserService().logUserNotifications(adminNotifyData);
        }

        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.SUCCESS,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            deleteRes.message
          )
        );
      } else {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            deleteRes.message,
            deleteRes.data
          )
        );
      }
    } catch (error) {
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
  @Purpose User create password
    @Parameter
    {
    password:"Test@123",
    confirmPassword:"Test@123"
    }
    @Return JSON String
********************************************************/
  async createPassword() {
    try {
      //Generate Field Array and process the request body
      let fieldsArray = ["confirmPassword", "password", "userCode"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      let userCode = data.userCode;
      //check user exist or not
      const user = await Users.findOne({ userCode: userCode });
      if (_.isEmpty(user)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "USER_NOT_EXIST"
          )
        );
      }

      //check both passwords should be equal
      if (!(data.password === data.confirmPassword)) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "PASSWORD_NOT_MATCHED"
          )
        );
      }

      // validate password
      const validatePassword =
        await new CommonService().validatePasswordCombination(data.password);
      if (validatePassword.status == false) {
        return new CommonService().handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.BAD_REQUEST_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "USER_PASSWORD_VALIDATION"
          )
        );
      }

      // encrypt password
      const encryptPassword = await new CommonService().ecryptPassword({
        password: data.password,
      });
      data.password = encryptPassword;
      await Users.updateOne(
        { userCode: userCode },
        {
          updatedAt: new Date().getTime(),
          password: data.password,
          status: true,
          isEmailVerified: true,
        }
      );
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "PASSWORD_CREATED_SUCCESSFULLY"
        )
      );
    } catch (e) {
      console.log(
        `\n---------------user create password Error----------------\n${e}\n------------------------------\n`
      );
      return new CommonService().handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SERVER_ERROR"
        ),
        e
      );
    }
  }

  /********************************************************
  @Purpose Employer Listing
    @Parameter
    {
        }
    @Return JSON String
********************************************************/

  async activityLogListing() {
    try {
      let userId = this.req.currentUser ? this.req.currentUser._id : "";
      // page
      let page = this.req.query.page ? this.req.query.page : 1;
      let pageSize = this.req.query.pageSize ? this.req.query.pageSize : 10;

      let sorting = { createdAt: -1 };

      let skip = (parseInt(page) - 1) * parseInt(pageSize);
      let where = { userId: ObjectId(userId) };

      let activityLogList = await ActivityLog.aggregate([
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
            ],
            as: "jobs",
          },
        },
        {
          $lookup: {
            from: "employers",
            localField: "jobs.userId",
            foreignField: "userId",
            as: "employer",
          },
        },
        {
          $addFields: {
            jobs: {
              $map: {
                input: "$jobs",
                as: "job",
                in: {
                  $mergeObjects: [
                    "$$job",
                    {
                      companyLogo: {
                        $arrayElemAt: ["$employer.profileUrl", 0],
                      },
                      companyName: {
                        $arrayElemAt: ["$employer.companyName", 0],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            employer: 0,
          },
        },
        { $sort: sorting },
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
            list: [{ $skip: skip }, { $limit: parseInt(pageSize) }],
          },
        },
      ]);

      if (_.isEmpty(activityLogList[0].list)) {
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

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        activityLogList[0].list,
        null,
        parseInt(page),
        parseInt(pageSize),
        activityLogList[0].count[0].count
      );
    } catch (e) {
      console.log(
        `\n---------------activity Listing Error----------------\n${e}\n------------------------------\n`
      );
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
      console.log(currentUser);
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
    @Purpose User notifications
    @Parameter
    {}
    @Return JSON String
  ********************************************************/
  async userNotificationList() {
    try {
      let userId = this.req.currentUser ? this.req.currentUser._id : "";
      // page
      let page = this.req.query.page ? this.req.query.page : 1;
      let pageSize = this.req.query.pageSize ? this.req.query.pageSize : 10;

      let skip = (parseInt(page) - 1) * parseInt(pageSize);
      let where = { receiverId: ObjectId(userId), isVisibleToAdmin: false };

      let notificationList = await UserNotifications.aggregate([
        { $match: where },
        {
          $lookup: {
            from: "jobs",
            let: {
              localId: {
                $toObjectId: "$data.id",
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$localId"],
                  },
                },
              },
            ],
            as: "jobData",
          },
        },
        {
          $group: {
            _id: "$_id",
            data: { $first: "$data" },
            log: {
              $first: "$log",
            },
            event: {
              $first: "$event",
            },
            jobData: {
              $first: {
                $arrayElemAt: ["$jobData", 0],
              },
            },
            isRead: {
              $first: "$isRead",
            },
            createdAt: {
              $first: "$createdAt",
            },
            updatedAt: {
              $first: "$updatedAt",
            },
            isVisibleToAdmin: {
              $first: "$isVisibleToAdmin",
            },
            isDeleted: {
              $first: "$isDeleted",
            },
            senderId: {
              $first: "$senderId",
            },
            receiverId: {
              $first: "$receiverId",
            },
          },
        },
        {
          $addFields: {
            isAdviser: {
              $cond: {
                if: {
                  $and: [
                    {
                      $eq: ["$jobData.createdBy", "$senderId"],
                    },
                    { $ne: ["$jobData.status", "Published"] },
                  ],
                },
                then: false,
                else: true,
              },
            },
          },
        },
        { $project: { jobData: 0 } },
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
          data,
          { unreadCount: notificationList[0].unreadCount },
          parseInt(page),
          parseInt(pageSize),
          notificationList[0].count
        );
      });
    } catch (e) {
      console.log(e);
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
    @Purpose get stripe publishable key
    @Parameter
    {}
    @Return JSON String
  ********************************************************/
  async getStripePublishableKey() {
    try {
      //get payment-gateway settings and get key
      const gatewaySettingsRes = await paymentGatewaySchema.findOne({
        status: true,
      });
      let publicKey = "";
      if (gatewaySettingsRes?.isLive) {
        publicKey = gatewaySettingsRes.prodPk;
      } else {
        publicKey = gatewaySettingsRes.testPk;
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
          publicKey,
          gst: gatewaySettingsRes?.isGst ? gatewaySettingsRes?.gst : 0,
        }
      );
    } catch (e) {
      console.log(e);
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
  static async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}

module.exports = UserController;
