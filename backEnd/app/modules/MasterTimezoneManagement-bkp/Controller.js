const _ = require("lodash");

const Controller = require("../Base/Controller");
const Timezones = require("./Schema").Timezones;
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const masterProjection = require("./Projection.json");
const { HTTP_CODE } = require("../../services/constant");
const ObjectId = require("mongoose").Types.ObjectId;

class TimezoneController extends Controller {
  constructor() {
    super();
  }
  /********************************************************
    @Purpose Add/Update Timezone 
    @Parameter
    {
       "timezoneId":"",
       "timeZone":"",
       "countryId":""
    }
    @Return JSON String
    ********************************************************/
  async addUpdateTimezone() {
    try {
      let data = this.req.body;
      if (data.timezoneId) {
        /********************************************************
        Find Timezone details and validate
        ********************************************************/
        let checkingTimezone = await Timezones.findOne({
          _id: { $ne: data.timezoneId },
          countryId: data.countryId,
          timeZone: data.timeZone,
          isDeleted: false,
        }).exec();
        if (!_.isEmpty(checkingTimezone)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "TIMEZONE_ALREADY_EXISTS_WITH_COUNTRY"
            )
          );
        }
        /********************************************************
        Update Timezone details and validate
        ********************************************************/
        const timezoneData = await Timezones.findByIdAndUpdate(
          data.timezoneId,
          data,
          { new: true }
        ).exec();
        if (_.isEmpty(timezoneData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "NOT_UPDATED"
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
            "TIMEZONE_UPDATED_SUCCESSFULLY"
          )
        );
      } else {
        /********************************************************
        Check Timezone details and validate
        ********************************************************/
        let checkingTimezone = await Timezones.findOne({
          countryId: data.countryId,
          timeZone: data.timeZone,
          isDeleted: false,
        }).exec();
        if (!_.isEmpty(checkingTimezone)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "TIMEZONE_ALREADY_EXISTS_WITH_COUNTRY"
            )
          );
        }

        /********************************************************
        Save Timezone details and validate
        ********************************************************/
        const timezoneData = await new Model(Timezones).store(data);
        if (_.isEmpty(timezoneData)) {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.SUCCESS_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "TIMEZONE_NOT_SAVED"
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
            "TIMEZONE_ADDED_SUCCESSFULLY"
          )
        );
      }
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error addUpdateTimezone()", error);
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
    @Purpose Timezone Listing
    @Parameter
    {
       "page":1,
       "pagesize":10,
       "sort":{"timeZone":1/-1},
       "filter": [{"timeZone": [""]}]
       "searchText":""
    }
    @Return JSON String
  ********************************************************/
  async timezoneListing() {
    try {
      /********************************************************
      Set Modal for listing
      ********************************************************/
      this.req.body["model"] = Timezones;
      let result;
      if (this.req.body.searchText) {
        /********************************************************
        Listing for Search Functionality
        ********************************************************/
        this.req.body["filter"] = ["timeZone"];
        let data = {
          bodyData: this.req.body,
          selectObj: masterProjection.timezoneListing,
        };
        result = await TimezoneController.timezoneSearching(data);
      } else {
        /********************************************************
        Listing for filter functionality
        ********************************************************/
        let data = {
          bodyData: this.req.body,
          selectObj: masterProjection.timezoneListing,
        };
        result = await TimezoneController.timezoneListing(data);
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
      console.log("error timezoneListing()", error);
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
     @PurposeTimezone delete
     @Parameter
     {
        "timezoneIds":[],
     }
     @Return JSON String
  ********************************************************/
  async deleteTimezones() {
    try {
      /********************************************************
      Update Delete Status
      ********************************************************/
      await Timezones.updateMany(
        { _id: { $in: this.req.body.timezoneIds } },
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
          "TIMEZONE_DELETED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteTimezones()", error);
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
      @Purpose Timezone Change Status
      @Parameter
      {
         "timezoneIds":[],
         "status":true/false
      }
      @Return JSON String
  ********************************************************/
  async changeTimezoneStatus() {
    try {
      /********************************************************
      Update Timezone Status
      ********************************************************/
      await Timezones.updateMany(
        { _id: { $in: this.req.body.timezoneIds } },
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
      console.log("error changeTimezoneStatus()", error);
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
     @Purpose get Timezone details for edit
     @Parameter {id}
     @Return JSON String
     ********************************************************/
  async getTimezonedetails() {
    try {
      /********************************************************
      Validate request parameters
      ********************************************************/
      if (
        _.isEmpty(this.req.params.timezoneId) ||
        !ObjectId.isValid(this.req.params.timezoneId)
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
        Find Timezone details and validate
      ********************************************************/
      let stages = [
        {
          $match: {
            _id: ObjectId(this.req.params.timezoneId),
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: "countries",
            localField: "countryId",
            foreignField: "_id",
            as: "countryData",
          },
        },
        {
          $unwind: {
            path: "$countryData",
            includeArrayIndex: "arrayIndex",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            timeZone: 1,
            status: 1,
            countryId: "$countryData._id",
            countryName: "$countryData.countryName",
          },
        },
      ];

      const timezoneDetails = await Timezones.aggregate(stages).exec();

      if (_.isEmpty(timezoneDetails)) {
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
        timezoneDetails
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getTimezonedetails()", error);
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
   @Purpose Service for timezone listing records
  @Parameter
  {
      data:{
          bodyData:{},
          model:{}
      }
  }
  @Return JSON String
  ********************************************************/
  static timezoneListing(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let bodyData = data.bodyData;
          let model = data.bodyData.model;
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          let commonFilter = { isDeleted: false };
          let filter1 = commonFilter;
          let f = [];
          /********************************************************
        Check page and pagesize
        ********************************************************/
          if (bodyData.page && bodyData.pagesize) {
            let skip =
              (parseInt(bodyData.page) - 1) * parseInt(bodyData.pagesize);
            let sort = bodyData.sort ? bodyData.sort : { createdAt: -1 };

            if (bodyData.filter && Array.isArray(bodyData.filter)) {
              let filter = bodyData.filter;
              /********************************************************
            Generate Query Object from given filters
            ********************************************************/
              for (let index in filter) {
                let ar = filter[index];
                for (let key in ar) {
                  let filterObj =
                    ar[key] && Array.isArray(ar[key]) ? ar[key] : [];
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
                                ? new RegExp(
                                    value.toString().toLowerCase(),
                                    "i"
                                  )
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

            let stages = [
              { $match: filter1 },
              {
                $lookup: {
                  from: "countries",
                  localField: "countryId",
                  foreignField: "_id",
                  as: "countryData",
                },
              },
              {
                $unwind: {
                  path: "$countryData",
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
                $limit: parseInt(bodyData.pagesize),
              },
            ];

            let totalCountFilter = [
              {
                $match: filter1,
              },
              {
                $count: "count",
              },
            ];
            let listing;
            /********************************************************
          list and count data according to filter query
          ********************************************************/
            listing = await model.aggregate(stages);
            const total = await model.aggregate(totalCountFilter);
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
                total: total.length > 0 ? total[0].count : 0,
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
  static timezoneSearching(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          let model = data.bodyData.model;
          let bodyData = data.bodyData;
          let filter = bodyData.filter;
          let sort = bodyData.sort ? bodyData.sort : { createdAt: -1 };
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
              {
                $lookup: {
                  from: "countries",
                  localField: "countryId",
                  foreignField: "_id",
                  as: "countryData",
                },
              },
              {
                $unwind: {
                  path: "$countryData",
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
                $limit: parseInt(bodyData.pagesize),
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
  /********************************************************
   @Purposeget Timezone List
   @Parameter {}
   @Return JSON String
   ********************************************************/
  async getTimezoneList() {
    try {
      /********************************************************
        Find timezone details and validate
      ********************************************************/
      const timezoneListDetails = await Timezones.find({
        isDeleted: false,
        status: true,
      })
        .select(masterProjection.list)
        .exec();

      if (_.isEmpty(timezoneListDetails)) {
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
        timezoneListDetails
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getTimezoneList()", error);
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
}

module.exports = TimezoneController;
