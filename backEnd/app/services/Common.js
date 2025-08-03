/****************************
 Common services
 ****************************/
const _ = require("lodash");
const bcrypt = require("bcrypt");
const Config = require("../../configs/configs");
const {
  LanguageMessages,
} = require("../modules/SettingsLanguagePreferences/Schema");
const moment = require("moment");
const { FilterSettings, ColumnSettings } = require("../modules/Common/Schema");
const fs = require("fs");
const path = require("path");
const json2csv = require("json2csv").parse;
const json2xls = require("json2xls");
const Users = require("../modules/Users/Schema").userSchema;
const i18n = require("i18n");
const pdf = require("pdf-creator-node");
const Handlebars = require("handlebars");
const pdfPackage = require("html-pdf");
Handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});
const options = {
  format: "A3",
  orientation: "portrait",
  border: "10mm",
  header: {
    height: "45mm",
    contents: '<div style="text-align: center;">Author: ITGL</div>',
  },
  footer: {
    height: "28mm",
    contents: {
      first: "Cover page",
      2: "Second page", // Any page number is working. 1-based index
      default:
        '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
      last: "Last Page",
    },
  },
  childProcessOptions: {
    env: {
      OPENSSL_CONF: "/dev/null",
    },
  },
};

class Common {
  /********************************************************
   @PurposeService for error handling
   @Parameter
   {
       errObj: {},
       schema: {}
   }
   @Return JSON String
   ********************************************************/
  errorHandle(errObj, schema = null) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let errorMessage = "Internal server error.";
          if (errObj && errObj.code) {
            switch (errObj.code) {
              case 11000:
                errorMessage = "Duplicate key error";
                if (schema) {
                  const indexes = [[{ _id: 1 }, { unique: true }]].concat(
                    schema.indexes()
                  );
                  indexes.forEach(async (index) => {
                    const paths = Object.keys(index[0]);
                    if (errObj.message.includes(paths[0])) {
                      errorMessage = ` ${paths[0]} expects to be unique. `;
                    }
                  });
                }
                break;
              case 0:
                errorMessage = "";
                break;
              case 1:
                errorMessage = "";
                break;
              default:
                break;
            }
          } else if (errObj && errObj.message && errObj.message.errmsg) {
            errorMessage = errObj.message.errmsg;
          } else if (errObj && errObj.errors) {
            if (schema) {
              schema.eachPath(function (path) {
                if (_.has(errObj.errors, path) && errObj.errors[path].message) {
                  errorMessage = errObj.errors[path].message;
                }
              });
            }
          } else if (errObj && errObj.message && errObj.message.errors) {
            if (schema) {
              schema.eachPath(function (path) {
                if (
                  _.has(errObj.message.errors, path) &&
                  errObj.message.errors[path].message
                ) {
                  errorMessage = errObj.message.errors[path].message;
                }
              });
            }
          }
          return resolve(errorMessage);
        } catch (error) {
          return reject({ status: 0, message: error });
        }
      })();
    });
  }

  /********************************************************
  @Purpose Encrypt password
  @Parameter
      {
          "data":{
              "password" : "test123"
          }
      }
  @Return JSON String
  ********************************************************/
  ecryptPassword(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          if (data && data.password) {
            let password = bcrypt.hashSync(data.password, 10);
            return resolve(password);
          }
          return resolve();
        } catch (error) {
          reject(error);
        }
      })();
    });
  }
  /********************************************************
  @Purpose Compare password
  @Parameter
      {
          "data":{
              "password" : "Buffer data", // Encrypted password
              "savedPassword": "Buffer data" // Encrypted password
          }
      }
  @Return JSON String
  ********************************************************/
  verifyPassword(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let isVerified = false;
          if (data && data.password && data.savedPassword) {
            let base64data = Buffer.from(
              data.savedPassword,
              "binary"
            ).toString();
            isVerified = await bcrypt.compareSync(data.password, base64data);
          }
          return resolve(isVerified);
        } catch (error) {
          reject(error);
        }
      })();
    });
  }
  /********************************************************
  @Purpose Validate password
  @Parameter
      {
          "data":{
              "password" : "test123",
              "userObj": {}
          }
      }
  @Return JSON String
  ********************************************************/
  validatePassword(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          if (data && data.password) {
            if (
              data.userObj &&
              _.isEqual(data.password, data.userObj.firstname)
            ) {
              return resolve({
                status: 0,
                message: "PASSWORD_NOT_SAME_FIRSTNAME",
              });
            }
            // Check new password is already used or not
            if (
              Config.dontAllowPreviouslyUsedPassword &&
              Config.dontAllowPreviouslyUsedPassword == "true" &&
              data.userObj &&
              data.userObj.previouslyUsedPasswords &&
              Array.isArray(data.userObj.previouslyUsedPasswords) &&
              data.userObj.previouslyUsedPasswords.length
            ) {
              let isPreviouslyUsed = _.filter(
                data.userObj.previouslyUsedPasswords,
                (previouslyUsedPassword) => {
                  let base64data = Buffer.from(
                    previouslyUsedPassword,
                    "binary"
                  ).toString();
                  return bcrypt.compareSync(data.password, base64data);
                }
              );
              if (
                isPreviouslyUsed &&
                Array.isArray(isPreviouslyUsed) &&
                isPreviouslyUsed.length
              ) {
                return resolve({
                  status: 0,
                  message: "ALREADY_USED_PASSWORD",
                });
              }
            }
            return resolve({
              status: 1,
              message: "GET_DETAIL_SUCCESSFULLY",
            });
          } else {
            return resolve({ status: 0, message: "PASSWORD_VALIDATION" });
          }
        } catch (error) {
          reject(error);
        }
      })();
    });
  }

  /********************************************************
  @Purpose email masking
  @Parameter
      {email}
  @Return r...r@example.com
  ********************************************************/
  maskEmail(email) {
    return new Promise((resolve, reject) => {
      try {
        const [name, domain] = email.split("@");
        const { length: len } = name;
        const maskedName = name[0] + "*".repeat(len - 1);
        const maskedEmail = maskedName + "@" + domain;
        resolve(maskedEmail);
      } catch (error) {
        reject(error);
      }
    });
  }

  /********************************************************
  @Purpose Phone Number masking
  @Parameter
      {phoneNumber}
  @Return 00*********
  ********************************************************/
  maskPhoneNumber(phoneNumber) {
    return new Promise((resolve, reject) => {
      try {
        const [, number] = phoneNumber.split("-");
        const { length: len } = number;
        const maskedNumber =
          number.slice(0, 2).toString() + "*".repeat(len - 1);
        resolve(maskedNumber);
      } catch (error) {
        reject(error);
      }
    });
  }

  /********************************************************
    @Purpose Generate random string/characters of 6 char length
    @Parameter
        {model,key}
    @Return dzy9dT
    ********************************************************/
  generateRandomString(model, key) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let result = "";
          const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
          const charactersLength = characters.length;
          let counter = 0;
          while (counter < 6) {
            result += characters.charAt(
              Math.floor(Math.random() * charactersLength)
            );
            counter += 1;
          }
          let checkingCode = await model
            .find({
              [key]: result,
              isDeleted: false,
            })
            .exec();
          if (checkingCode.length > 0) {
            this.generateRandomString();
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      })();
    });
  }
  /********************************************************
    @Purpose Generate random password of 8 char length
    @Parameter
    @Return Tester1!
    ********************************************************/
  generateRandomPassword() {
    const length = 8; // Adjust the password length as needed
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?";
    const numericChars = "0123456789";

    const getRandomChar = (charSet) => {
      const randomIndex = Math.floor(Math.random() * charSet.length);
      return charSet[randomIndex];
    };

    let password = "";
    password += getRandomChar(uppercaseChars);
    password += getRandomChar(lowercaseChars);
    password += getRandomChar(specialChars);
    password += getRandomChar(numericChars);

    for (let i = 4; i < length; i++) {
      const charSet =
        uppercaseChars + lowercaseChars + specialChars + numericChars;
      password += getRandomChar(charSet);
    }

    // Shuffle the password to randomize the character positions
    password = password.split("");
    for (let i = password.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join("");
  }
  /********************************************************
    @Purpose Generate random number of 6 char length
    @Parameter
        {model,key}
    @Return 482810
    ********************************************************/
  generateRandomNumber(model, key) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const number = Number(Math.floor(100000 + Math.random() * 900000));

          let checkingCode = await model
            .find({
              [key]: number,
              isDeleted: false,
            })
            .exec();
          if (checkingCode.length > 0) {
            this.generateRandomNumber();
          } else {
            resolve(number);
          }
        } catch (error) {
          reject(error);
        }
      })();
    });
  }

  /********************************************************
  @Purpose set Message
  @Parameter
      {data,filterKey}
  @Return msg
  ********************************************************/
  setMessage(data, filterKey) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const message = await LanguageMessages.findOne({
            languageId: data,
            messageKey: filterKey,
            isDeleted: false,
          }).exec();
          let messageEN;
          if (!message) {
            messageEN = await LanguageMessages.findOne({
              languageCode: "en",
              messageKey: filterKey,
              isDeleted: false,
            }).exec();
          }
          let finalMessage =
            (message && message.message) ?? (messageEN && messageEN.message);
          resolve(finalMessage);
        } catch (error) {
          reject(error);
        }
      })();
    });
  }

  /********************************************************
  @Purpose Service for construct listing 
  @Parameter
  {
     data
  }
  @Return JSON String
  ********************************************************/
  constructCustomFilter(data) {
    return new Promise((resolve, reject) => {
      try {
        let commonFilter = {
          ...data.staticFilter,
          $or: [
            { isDeleted: { $exists: false } },
            { $and: [{ isDeleted: { $exists: true } }, { isDeleted: false }] },
          ],
        };

        let filters = [];
        let filter1 = commonFilter;
        if (data.filter && Array.isArray(data.filter)) {
          let filter = data.filter;
          for (let index in filter) {
            let details = filter[index];
            let keyValue = details.value;
            let filterQuery;
            if (details.type == "contains") {
              let regex = { $regex: `.*${[keyValue]}.*`, $options: "i" };
              filterQuery = { [details.key]: regex };
            } else if (details.type == "greaterThan") {
              filterQuery = { [details.key]: { $gt: parseInt(keyValue) } };
            } else if (details.type == "greaterThanOrEqualTo") {
              filterQuery = { [details.key]: { $gte: parseInt(keyValue) } };
            } else if (details.type == "lessThan") {
              filterQuery = { [details.key]: { $lt: parseInt(keyValue) } };
            } else if (details.type == "lessThanOrEqualTo") {
              filterQuery = { [details.key]: { $lt: parseInt(keyValue) } };
            } else if (details.type == "notEqualTo") {
              filterQuery = { [details.key]: { $ne: parseInt(keyValue) } };
            } else {
              /**** getting details  ****/

              if (keyValue.presentDate) {
                /**** converting date of string values into date format ****/
                let presentDate = new Date(keyValue.presentDate);
                let count = keyValue.calendarSpecificCount
                  ? keyValue.calendarSpecificCount
                  : -1;
                let calendarType = keyValue.calendarSpecificType
                  ? keyValue.calendarSpecificType
                  : "days";
                /***** adding 5:30 hrs to the date to get exact date from the server *****/
                let newDate = new Date(
                  moment(presentDate).add(5, "hours").add(30, "minutes")
                );
                let finalDate = new Date(
                  moment(newDate).add(-count, calendarType)
                );
                filterQuery = {
                  [details.key]: { $gte: finalDate, $lte: newDate },
                };
              } else {
                /**** converting date of string values into date format for custom date****/
                let startDate = new Date(keyValue.startDate);
                let endDate = new Date(keyValue.endDate);
                /***** adding 5:30 hrs to the date to get exact date from the server *****/
                let fromDate = new Date(
                  moment(startDate).add(5, "hours").add(30, "minutes")
                );
                let toDate = new Date(
                  moment(endDate).add(5, "hours").add(30, "minutes")
                );
                if (keyValue.startDate && keyValue.endDate) {
                  filterQuery = {
                    [details.key]: { $gte: fromDate, $lte: toDate },
                  };
                } else if (keyValue.startDate && !keyValue.endDate) {
                  filterQuery = {
                    [details.key]: { $gte: fromDate },
                  };
                } else if (keyValue?.endDate && keyValue?.startDate) {
                  filterQuery = {
                    [details.key]: { $lte: toDate },
                  };
                } else {
                  filterQuery = {};
                }
                /****** date picker is pending ******/
              }
            }

            filters.push(filterQuery);
          }

          let query = "";
          if (filters.length === 5) {
            query = {
              [data.filter[3].condition]: [
                filters[4],
                {
                  [data.filter[2].condition]: [
                    filters[3],
                    {
                      [data.filter[1].condition]: [
                        filters[2],
                        {
                          [data.filter[0].condition]: [filters[0], filters[1]],
                        },
                      ],
                    },
                  ],
                },
              ],
            };
          } else if (filters.length === 4) {
            query = {
              [data.filter[2].condition]: [
                filters[3],
                {
                  [data.filter[1].condition]: [
                    filters[2],
                    { [data.filter[0].condition]: [filters[0], filters[1]] },
                  ],
                },
              ],
            };
          } else if (filters.length === 3) {
            query = {
              [data.filter[1].condition]: [
                filters[2],
                { [data.filter[0].condition]: [filters[0], filters[1]] },
              ],
            };
          } else if (filters.length === 2) {
            query = { [data.filter[0].condition]: [...filters] };
          } else if (filters.length === 1) {
            query = filters[0];
          } else {
            query = { [data.filter[0].condition]: [...filters] };
          }
          filter1 = { $and: [query, commonFilter] };
        }
        resolve(filter1);
      } catch (error) {
        reject(error);
      }
    });
  }

  /********************************************************
    @Purpose Get filters
    @Parameter {}
    @Return JSON String
  ********************************************************/
  getFilters(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let bodyData = data.bodyData;
          let query = { key: bodyData.key, adminId: bodyData.adminId };
          let filterSettings = await FilterSettings.find(query)
            .select({
              createdAt: 0,
              updatedAt: 0,
              __v: 0,
              key: 0,
              adminId: 0,
            })
            .exec();
          return resolve({ status: 1, data: filterSettings });
        } catch (error) {
          reject(error);
        }
      })();
    });
  }

  /********************************************************
  @Purpose Get Column Settings
  @Parameter {}
  @Return JSON String
  ********************************************************/
  getColumn(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let bodyData = data.bodyData;
          let query = { key: bodyData.key, adminId: bodyData.adminId };
          let columnSettings = await ColumnSettings.find(query)
            .select({
              createdAt: 0,
              updatedAt: 0,
              __v: 0,
              key: 0,
              adminId: 0,
            })
            .exec();
          return resolve({ status: 1, data: columnSettings });
        } catch (error) {
          reject(error);
        }
      })();
    });
  }

  /********************************************************
   @Purpose Service for construct listing 
   @Parameter
   {
      data
   }
   @Return JSON String
   ********************************************************/
  constructFilter(data) {
    return new Promise((resolve, reject) => {
      try {
        let commonFilter = {
          ...data.staticFilter,
          $or: [
            { isDeleted: { $exists: false } },
            { $and: [{ isDeleted: { $exists: true } }, { isDeleted: false }] },
          ],
        };
        let f = [];
        let filter1 = commonFilter;
        /********************************************************
          Check data filter
        ********************************************************/
        if (data.filter && Array.isArray(data.filter)) {
          let filter = data.filter;
          /********************************************************
          Generate Query Object from given filters
          ********************************************************/
          for (let index in filter) {
            let ar = filter[index];
            for (let key in ar) {
              let filterObj = ar[key] && Array.isArray(ar[key]) ? ar[key] : [];
              let valueArr = [];
              filterObj.filter((value) => {
                let obj;
                if (
                  data.schema &&
                  !_.isEmpty(data.schema) &&
                  data.schema.path(key) &&
                  data.schema.path(key).instance == "Embedded"
                ) {
                  obj = { [key + "." + key]: value };
                } else {
                  obj = data.search
                    ? {
                        [key]:
                          typeof value === "string"
                            ? new RegExp(value.toString().toLowerCase(), "i")
                            : value,
                      }
                    : { [key]: value };
                }
                valueArr.push(obj);
              });
              if (valueArr.length) {
                f.push({ $or: valueArr });
              }
            }
            filter1 = { $and: [...f, commonFilter] };
          }
        }
        resolve(filter1);
      } catch (error) {
        reject(error);
      }
    });
  }

  /********************************************************
   @Purpose Handle Success Response
   @Parameter
   {
      res, status, statusCode, message, data,meta, page, perPage, total
   }
   @Return JSON String
   ********************************************************/
  handleResolve(
    res,
    status,
    statusCode,
    message,
    data,
    meta,
    page,
    perPage,
    total
  ) {
    return res.status(statusCode).send({
      status: status,
      statusCode: statusCode,
      message: message,
      data: data,
      page: page,
      perPage: perPage,
      total: total,
      extra_meta: meta,
    });
  }

  /********************************************************
   @Purpose Handle Error Response
   @Parameter
   {
      res, status, statusCode, message
   }
   @Return JSON String
   ********************************************************/
  handleReject(res, status, statusCode, message) {
    return res.status(statusCode).send({
      status: status,
      statusCode: statusCode,
      message: message,
    });
  }

  /********************************************************
   @PurposeService for error handling
   @Parameter
   {
       filteredFields:[],
       file:"admin",
       type:"excel/csv",
       listing:[{}]
   }
   @Return JSON String
   ********************************************************/

  downloadFile(filteredFields, file, type, listing) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let ext =
            type === "csv" ? ".csv" : type === "xlsx" ? ".xlsx" : ".pdf";

          let fields = filteredFields;
          const opts = { fields };
          const filePathAndName = file + "-" + type + "-" + Date.now() + ext;
          const filePath = path.join(
            appRoot,
            `/public/${type}/`,
            filePathAndName
          );
          if (type === "csv") {
            const csv = json2csv(listing, opts);
            if (!fs.existsSync(path.join(appRoot, `/public/${type}`))) {
              await fs.mkdirSync(path.join(appRoot, `/public/${type}`));
            }
            fs.writeFile(filePath, csv, function (err) {
              if (err)
                return resolve({
                  status: 0,
                });
            });
            return resolve({ filePath });
          } else if (type === "xlsx") {
            var excel = json2xls(listing, opts);
            if (!fs.existsSync(path.join(appRoot, `/public/${type}`))) {
              await fs.mkdirSync(path.join(appRoot, `/public/${type}`));
            }
            fs.writeFileSync(filePath, excel, "binary");
            return resolve({ filePath });
          } else if (type === "pdf") {
            // removing column keys which not needed
            listing.forEach((obj) => {
              Object.keys(obj).forEach((key) => {
                if (!opts.fields.includes(key)) {
                  delete obj[key];
                }
              });
            });

            if (!fs.existsSync(path.join(appRoot, `/public/${type}`))) {
              await fs.mkdirSync(path.join(appRoot, `/public/${type}`));
            }
            fs.writeFileSync(filePath, "", "binary");
            let htmlPath = path.join(appRoot, `/public/html/pdf.html`);
            // Read HTML Template
            let html = fs.readFileSync(htmlPath, "utf8");
            let document = {
              html: html,
              data: {
                lists: listing,
                masterName: file,
                siteUrl: Config.frontUrl,
                supportEmail: "support@jobcheck.online",
              },
              path: filePath,
              type: "",
            };

            const pdfData = await pdf.create(document, options);
            if (_.isEmpty(pdfData.filename)) {
              return resolve({
                status: 0,
                message: "File cant be downloaded",
              });
            }
            return resolve({ filePath });
          } else {
            /*********  code for csv and excel download ends **********/
            return resolve({
              status: 0,
              message: i18n.__("BAD_REQUEST") + " of type value",
            });
          }
        } catch (error) {
          return reject({ status: 0, message: error });
        }
      })();
    });
  }

  /********************************************************
   @Purpose to validate password combination and length
   @Parameter
   {
       inputText
   }
   @Return JSON String
   ********************************************************/

  validatePasswordCombination(inputText) {
    return new Promise((resolve, reject) => {
      try {
        let regex = /^(?=.*[!,@,#,$])(?=.*[a-z])(?=.*[A-Z]).{8,12}$/;
        if (inputText.match(regex)) {
          return resolve({ status: true });
        } else {
          return resolve({
            status: false,
            message:
              "Password must contain combination of upper and lowercase letters , numbers and special characters such as !,@,#,$ and it should be 8 to 12 characters long",
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /********************************************************
   @Purpose to validate email
   @Parameter
   {
       inputText
   }
   @Return JSON String
   ********************************************************/

  validateEmail(inputEmail) {
    return new Promise((resolve, reject) => {
      try {
        let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (inputEmail.match(regex)) {
          return resolve({ status: true });
        } else {
          return resolve({ status: false, message: "Invalid Email" });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /********************************************************
   @Purpose to match password
   @Parameter
   {
       inputText
   }
   @Return JSON String
   ********************************************************/

  matchPassword(password, confirmPassword) {
    return new Promise((resolve, reject) => {
      try {
        if (password != confirmPassword) {
          return resolve({ status: false, message: "Password didnt match" });
        } else {
          return resolve({ status: true });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /********************************************************
   @Purpose check duplicate name
   @Parameter
   {
       data:{}
   }
   @Return JSON String
   ********************************************************/

  nameValidator(data) {
    /**
        data={model,searchString,field,filter } 
    */

    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let modifiedString = data.searchString
            .toString()
            .toLowerCase()
            .replace(/ /g, "");

          let isNameAvailable = await data.model.aggregate([
            {
              $match: {
                $expr: {
                  $eq: [
                    {
                      $toLower: {
                        $replaceAll: {
                          input: `$${data.field}`,
                          find: " ",
                          replacement: "",
                        },
                      },
                    },
                    modifiedString,
                  ],
                },
                ...data.filter,
              },
            },
          ]);
          resolve(isNameAvailable);
        } catch (e) {
          console.log(e);
          resolve({ status: 0, message: e });
        }
      })();
    });
  }
  async getInvoicePdf(jsonData, type) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let ext =
            type === "csv" ? ".csv" : type === "xlsx" ? ".xlsx" : ".pdf";

          const filePathAndName =
            "Employer" + "-" + type + "-" + Date.now() + ext;
          const filePath = path.join(
            appRoot,
            `/public/${type}/`,
            filePathAndName
          );
          if (!fs.existsSync(path.join(appRoot, `/public/${type}`))) {
            await fs.mkdirSync(path.join(appRoot, `/public/${type}`));
          }
          fs.writeFileSync(filePath, "", "binary");
          let htmlPath = path.join(appRoot, `/public/html/invoice.html`);
          // Read HTML Template
          let html = fs.readFileSync(htmlPath, "utf8");
          let document = {
            html: html,
            data: jsonData,
            path: filePath,
            type: "",
          };
          // return resolve({ jsonData });

          const pdfData = await pdf.create(document, options);
          if (_.isEmpty(pdfData.filename)) {
            return resolve({
              status: 0,
              message: "File cant be downloaded",
            });
          }
          return resolve(pdfData);
        } catch (error) {
          console.log(error);
          return `<h1>PDF generation failed</h1><p>${JSON.stringify(
            error
          )}</p>`;
        }
      })();
    });
  }
  async generatePdf(filteredFields, fileData, template, file, orientation) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let ext = ".pdf";
          const filePathAndName = file + "-" + "pdf" + "-" + Date.now() + ext;
          const filePath = path.join(appRoot, `/public/pdf/`, filePathAndName);
          if (!fs.existsSync(path.join(appRoot, `/public/pdf`))) {
            await fs.mkdirSync(path.join(appRoot, `/public/pdf`));
          }
          fs.writeFileSync(filePath, "", "binary");
          let htmlPath = path.join(appRoot, `/public/html/${template}`);
          // Read HTML Template
          let html = fs.readFileSync(htmlPath, "utf8");
          let document = {
            html: html,
            data: fileData,
            path: filePath,
            type: "",
          };
          //select orientation
          options.orientation = orientation;

          const pdfData = await pdf.create(document, options);
          if (_.isEmpty(pdfData.filename)) {
            return resolve({
              status: 0,
              message: "File cant be downloaded",
            });
          }
          return resolve(pdfData);
        } catch (error) {
          console.log(error);
          return reject({ status: 0, message: error });
        }
      })();
    });
  }
  async getHtmlTable(heading, columnNames, jsonData, content) {
    try {
      let html = `<html>
<head>
  <style>
  	body{
    	display:flex;
    	justify-content:center;
        flex-direction:column;
    }
    table {
      width: auto;
      border-collapse: collapse;
      font-size:9px !important;
      border: 1px solid #aaa;
    }
    th, td {
      border: 1px solid #aaa;
      padding: 0.3em;
      width:100px;
    }
    li {
      font-size:10px;
    }
  </style>
</head>
<body>
<ul>
`;
      //create content
      Object.keys(content).forEach((columnName) => {
        html += `<li><b>${columnName}:</b>${content[columnName]}</li>`;
      });
      html += `</ul><h3>${heading}</h3>
  <table>
    <tr>`;
      // Generate table header
      columnNames.forEach((columnName) => {
        html += `
      <th style="padding: 8px; border: 1px solid #ddd;">${columnName}</th>
    `;
      });
      html += `
        </tr>`;
      //generate body now
      // Generate table rows with data
      for (const data of jsonData) {
        html += "<tr>\n";
        for (const columnName of columnNames) {
          if (columnName == "ApplicantName") {
            html += `<td><img src="https://drez1rmnikxoe.cloudfront.net/${
              data[columnName] ? data[columnName].profileUrl : "-"
            }" width="100%" height="100%"></img>${
              data[columnName] ? data[columnName].name : "-"
            }</td>\n`;
          } else {
            html += `<td>${data[columnName] ? data[columnName] : "-"}</td>\n`;
          }
        }
        html += "</tr>\n\n";
      }
      //end table
      html += `  </table>
</body>
</html>`;
      return html;
    } catch {
      return `<h1>PDF generation failed</h1><p>${JSON.stringify(error)}</p>`;
    }
  }
}

module.exports = Common;
