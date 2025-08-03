const _ = require("lodash");

const Controller = require("../Base/Controller");
const Countries = require("./Schema").Countries;
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const masterProjection = require("./Projection.json");
const { HTTP_CODE } = require("../../services/constant");

class CountriesController extends Controller {
  constructor() {
    super();
  }
  /********************************************************
     @Purpose Add/Update Country 
     @Parameter {
        "countryName":"",
        "countryCode":"",
        "phoneCode":"",
        "currency":"",
        "countryId":""
     }
     @ReturnJSON String
     ********************************************************/
  async addUpdateCountry() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = [
        "countryName",
        "countryCode",
        "phoneCode",
        "currency",
        "countryId",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      /********************************************************
      Check countryId for edit 
      ********************************************************/
      if (data.countryId) {
        /********************************************************
        Check Country Name in DB and validate
        ********************************************************/
        if (data.countryName) {
          let checkingCountryName = await Countries.findOne({
            countryName: data.countryName,
            _id: { $ne: data.countryId },
            isDeleted: false,
          }).exec();
          if (!_.isEmpty(checkingCountryName)) {
            return new CommonService().handleReject(
              this.res,
              HTTP_CODE.FAILED,
              HTTP_CODE.SUCCESS_CODE,
              await new CommonService().setMessage(
                this.req.currentUserLang,
                "COUNTRYNAME_ALREADY_EXISTS"
              )
            );
          }
        }
        /********************************************************
        Check Country Code in DB and validate
        ********************************************************/
        if (data.countryCode) {
          let checkCountryCode = await Countries.findOne({
            countryCode: data.countryCode,
            _id: { $ne: data.countryId },
            isDeleted: false,
          }).exec();
          if (!_.isEmpty(checkCountryCode)) {
            return new CommonService().handleReject(
              this.res,
              HTTP_CODE.FAILED,
              HTTP_CODE.SUCCESS_CODE,
              await new CommonService().setMessage(
                this.req.currentUserLang,
                "COUNTRYCODE_ALREADY_EXISTS"
              )
            );
          }
        }
        /********************************************************
        Check Country Phone Code in DB and validate
        ********************************************************/
        if (data.phoneCode) {
          let checkPhoneCode = await Countries.findOne({
            phoneCode: data.phoneCode,
            _id: { $ne: data.countryId },
            isDeleted: false,
          }).exec();
          if (!_.isEmpty(checkPhoneCode)) {
            return new CommonService().handleReject(
              this.res,
              HTTP_CODE.FAILED,
              HTTP_CODE.SUCCESS_CODE,
              await new CommonService().setMessage(
                this.req.currentUserLang,
                "PHONECODE_ALREADY_EXISTS"
              )
            );
          }
        }
        /********************************************************
        Update country data into DB and validate
        ********************************************************/
        const countryData = await Countries.findByIdAndUpdate(
          data.countryId,
          data,
          { new: true }
        ).exec();

        if (_.isEmpty(countryData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "COUNTRY_NOT_UPDATED"
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
            "COUNTRY_UPDATED_SUCCESSFULLY"
          )
        );
      } else {
        /********************************************************
        Check Country Name in DB and validate
        ********************************************************/
        let checkingCountryName = await Countries.findOne({
          countryName: data.countryName,
          isDeleted: false,
        }).exec();
        if (!_.isEmpty(checkingCountryName)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "COUNTRYNAME_ALREADY_EXISTS"
            )
          );
        }
        /********************************************************
        Check Country Code in DB and validate
        ********************************************************/
        let checkCountryCode = await Countries.findOne({
          countryCode: data.countryCode,
          isDeleted: false,
        }).exec();
        if (!_.isEmpty(checkCountryCode)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "COUNTRYCODE_ALREADY_EXISTS"
            )
          );
        }
        /********************************************************
        Check Country Phone Code in DB and validate
        ********************************************************/
        let checkPhoneCode = await Countries.findOne({
          phoneCode: data.phoneCode,
          isDeleted: false,
        }).exec();
        if (!_.isEmpty(checkPhoneCode)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "PHONECODE_ALREADY_EXISTS"
            )
          );
        }
        /********************************************************
        Update country data into DB and validate
        ********************************************************/
        const countryData = await new Model(Countries).store(data);
        if (_.isEmpty(countryData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "COUNTRY_NOT_SAVED"
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
            "COUNTRY_ADDED_SUCCESSFULLY"
          )
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error addUpdateCountry()", error);
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
    @Purpose Country Listing
    @Parameter
    {
       "page":1,
       "pagesize":10,
       "sort":{"countryName":1/-1,"countryCode":1/-1,"phoneCode":1/-1,"currency":1/-1,"status":1/-1},
       "filter": [{"countryName": [""]},{"countryCode":[""]},{"phoneCode":[""]},{"currency":[""]}]}]
       "searchText":""
    }
    @Return JSON String
    ********************************************************/
  async countryListing() {
    try {
      /********************************************************
      Set Modal for listing
      ********************************************************/
      this.req.body["model"] = Countries;
      let result;
      if (this.req.body.searchText) {
        /********************************************************
        Listing for Search Functionality
        ********************************************************/
        this.req.body["filter"] = [
          "countryName",
          "countryCode",
          "phoneCode",
          "currency",
        ];
        let data = {
          bodyData: this.req.body,
          selectObj: masterProjection.country,
        };
        result = await CountriesController.search(data);
      } else {
        /********************************************************
        Listing for filter functionality
        ********************************************************/
        let data = {
          bodyData: this.req.body,
          selectObj: masterProjection.country,
        };
        result = await CountriesController.listing(data);
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
      console.log("error countryListing()", error);
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
     @PurposeCountry delete
     @Parameter
     {
        "countriesIds":[""],
     }
     @Return JSON String
     ********************************************************/
  async deleteCountries() {
    try {
      /********************************************************
      Update Delete Status
      ********************************************************/
      await Countries.updateMany(
        { _id: { $in: this.req.body.countriesIds } },
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
          "COUNTRY_DELETED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteCountries()", error);
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
     @Purpose Country Change Status
     @Parameter
     {
        "countriesIds":[],
        "status":true/false
     }
     @Return JSON String
     ********************************************************/
  async changeCountriesStatus() {
    try {
      /********************************************************
      Update Status
      ********************************************************/
      await Countries.updateMany(
        { _id: { $in: this.req.body.countriesIds } },
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
      console.log("error changeCountriesStatus()", error);
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
     @Purpose get Country details
     @Parameter {id}
     @Return JSON String
     ********************************************************/
  async getCountrydetails() {
    try {
      /********************************************************
      Validate request parameters
      ********************************************************/
      if (_.isEmpty(this.req.params.countryId)) {
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
      const countryDetails = await Countries.findOne({
        _id: this.req.params.countryId,
        isDeleted: false,
      })
        .select(masterProjection.country)
        .exec();

      if (_.isEmpty(countryDetails)) {
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
        countryDetails
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getCountrydetails()", error);
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
     @Purposeget Countries List
     @Parameter {}
     @Return JSON String
     ********************************************************/
  async getCountriesList() {
    try {
      /********************************************************
        Find Country details and validate
      ********************************************************/
      const countryListDetails = await Countries.find({
        isDeleted: false,
        status: true,
      })
        .select(masterProjection.list)
        .exec();

      if (_.isEmpty(countryListDetails)) {
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
        countryListDetails
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getCountriesList()", error);
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
    @Purposeget Currency List
    @Parameter {}
    @Return JSON String
    ********************************************************/
  async getCurrencyList() {
    try {
      /********************************************************
        Find Country details and validate
      ********************************************************/
      const currencyListDetails = await Countries.find({
        isDeleted: false,
        status: true,
      })
        .select(masterProjection.currencyList)
        .exec();

      if (_.isEmpty(currencyListDetails)) {
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
        currencyListDetails
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getCurrencyList()", error);
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
}

module.exports = CountriesController;
