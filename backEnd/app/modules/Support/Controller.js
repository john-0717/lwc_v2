const _ = require("lodash");

const Controller = require("../Base/Controller");
const SupportTicket = require("./Schema").SupportTicketSchema;
const SupportTicketReplies = require("./Schema").SupportTicketRepliesSchema;
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const Projection = require("./Projection.json");
const { HTTP_CODE } = require("../../services/constant");

class SupportController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
    @Purpose Add Support Ticket
    @Parameter
    {
       "title":"",
       "description":"",
       "openBy":""
    }
    @Return JSON String
    ********************************************************/
  async addSupportTicket() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = ["title", "description", "openBy"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      data.supportId = await new CommonService().generateRandomNumber(
        SupportTicket,
        "supportId"
      );
      /********************************************************
      Save Support Ticket details and validate
      ********************************************************/
      await new Model(SupportTicket).store(data);

      /********************************************************
      Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.RESOURCE_CREATED_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "SUPPORT_TICKET_ADDED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error addSupportTicket()", error);
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
    @Purpose Support Ticket Listing
    @Parameter
    {
       "page":1,
       "pageSize":10,
       "sort":{"supportId":1/-1,"title":1/-1,"status":1/-1,"firstName":1/-1,"createdAt":1/-1},
       "searchText":""
    }
    @Return JSON String
  ********************************************************/
  async SupportTicketListing() {
    try {
      /********************************************************
      Validate request parameters
      ********************************************************/
      if (
        _.isEmpty(this.req.query.page) ||
        _.isEmpty(this.req.query.pageSize)
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
      this.req.query.sort = this.req.query.sort
        ? JSON.parse(this.req.query.sort)
        : { createdAt: 1 };
      /********************************************************
      Set Modal for listing
      ********************************************************/
      this.req.query["model"] = SupportTicket;
      let result;
      if (this.req.query.searchText) {
        /********************************************************
        Listing for Search Functionality
        ********************************************************/
        this.req.query["filter"] = ["supportId", "title", "status"];
        let data = {
          bodyData: this.req.query,
          selectObj: Projection.supportTicketListing,
        };
        result = await SupportController.Searching(data);
      } else {
        /********************************************************
        Listing for filter functionality
        ********************************************************/
        let data = {
          bodyData: this.req.query,
          selectObj: Projection.supportTicketListing,
        };
        result = await SupportController.Listing(data);
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
      console.log("error SupportTicketListing()", error);
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
      @Purpose Change Support Ticket Status
      @Parameter
      {
         "ticketId":"",
         "status":"Open" / "Rejected" / "Closed"
      }
      @Return JSON String
  ********************************************************/
  async changeSupportTicketStatus() {
    try {
      /********************************************************
      Update Support Ticket Status
      ********************************************************/
      await SupportTicket.updateOne(
        { _id: { $in: this.req.body.ticketId } },
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
      console.log("error changeSupportTicketStatus()", error);
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
        @Purpose delete Support Ticket
        @Parameter
        {
           "ids":[""]
        }
        @Return JSON String
  ********************************************************/
  async deleteSupportTicket() {
    try {
      this.req.body.ids.forEach(async (element) => {
        let checkSupportExist = await SupportTicket.findOne({
          _id: element,
        }).exec();
        /********************************************************
        Delete Support Ticket Status
        ********************************************************/
        if (checkSupportExist) {
          await SupportTicket.deleteOne({ _id: element }).exec();
        } else {
          return new CommonService().handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.NOT_FOUND_CODE,
            await new CommonService().setMessage(
              this.req.currentUserLang,
              "SUPPORT_TICKET_NOT_EXIST"
            )
          );
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
          "SUPPORT_TICKET_DELETE_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteSupportTicket()", error);
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
    @Purpose Add Support Ticket Reply
    @Parameter
    {
       "supportId":"",
       "message":"",
       "media":""
    }
    @Return JSON String
  ********************************************************/
  async addSupportReplyTicket() {
    try {
      /********************************************************
       Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = ["supportId", "message", "media"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      data.ipAddress = this.req.ip;
      const ua = this.req.headers["user-agent"];
      if (/firefox/i.test(ua)) data.browser = "Firefox";
      else if (/chrome/i.test(ua)) data.browser = "Google Chrome";
      else if (/safari/i.test(ua)) data.browser = "Safari";
      else if (/msie/i.test(ua)) data.browser = "msie";
      else data.browser = "unknown";

      data.repliedByAdmin = this.req.currentUser._id;
      /********************************************************
      Save Support Ticket details and validate
      ********************************************************/
      await new Model(SupportTicketReplies).store(data);

      /********************************************************
      Generate and return response
      ********************************************************/
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "REPLY_ADDED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error addSupportReplyTicket()", error);
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
     @Purpose get Static Pages details
     @Parameter {id}
     @Return JSON String
     ********************************************************/
  async getSupportReplyDetails() {
    try {
      /********************************************************
      Validate request parameters
      ********************************************************/
      if (_.isEmpty(this.req.params.id)) {
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
        Find Static Pages details and validate
      ********************************************************/
      const SupportTicketDetails = await SupportTicket.findOne({
        _id: this.req.params.id,
        isDeleted: false,
      })
        .populate("openBy", "firstname lastname emailId")
        .select(Projection.supportTicket)
        .exec();

      let stages = [
        { $match: { supportId: SupportTicketDetails._id } },
        {
          $lookup: {
            from: "users",
            localField: "repliedByUser",
            foreignField: "_id",
            as: "userData",
          },
        },
        {
          $unwind: {
            path: "$userData",
            includeArrayIndex: "arrayIndex",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "admins",
            localField: "repliedByAdmin",
            foreignField: "_id",
            as: "adminUserData",
          },
        },
        {
          $unwind: {
            path: "$adminUserData",
            includeArrayIndex: "arrayIndex",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: Projection.supportTicketReplyListing,
        },
      ];

      let totalCountFilter = [
        { $match: { supportId: SupportTicketDetails._id } },
        {
          $count: "count",
        },
      ];
      /********************************************************
      list and count data according to filter query
      ********************************************************/
      const listing = await SupportTicketReplies.aggregate(stages).exec();

      await SupportController.asyncForEach(listing, async (data, index) => {
        if (data.adminUser?.firstName) {
          listing[index].firstName = data.adminUser?.firstName;
          listing[index].lastName = data.adminUser?.lastName;
          listing[index].emailId = data.adminUser?.emailId;
          listing[index].photo = data.adminUser?.photo;
        } else {
          listing[index].firstName = data.user?.firstName;
          listing[index].lastName = data.user?.lastName;
          listing[index].emailId = data.user?.emailId;
          listing[index].photo = data.user?.photo;
        }
        delete listing[index].adminUser;
        delete listing[index].user;
      });

      const total = await SupportTicketReplies.aggregate(
        totalCountFilter
      ).exec();

      if (_.isEmpty(SupportTicketDetails)) {
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
        { data: SupportTicketDetails, repliesListing: listing },
        null,
        null,
        null,
        total.length > 0 ? total[0].count : 0
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error getSupportReplyDetails()", error);
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
      @Purpose Edit Support Ticket Status
      @Parameter
      {
         "replyId":"",
         "message":"",
         "media":""
      }
      @Return JSON String
  ********************************************************/
  async editSupportTicketReplyStatus() {
    try {
      /********************************************************
      Validate request parameters
      ********************************************************/
      if (_.isEmpty(this.req.params.id)) {
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
       Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = ["message", "media"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      const checkSupportReply = await SupportTicketReplies.findOne({
        _id: this.req.params.id,
      }).exec();

      if (!checkSupportReply) {
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
      Update Support Ticket Status
      ********************************************************/
      await SupportTicketReplies.updateOne(
        { _id: this.req.params.id },
        { $set: { message: data.message, media: data.media } }
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
          "REPLY_EDITED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error changeSupportTicketStatus()", error);
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
        @Purpose delete Support Ticket
        @Parameter
        {
           "ticketIds":[""]
        }
        @Return JSON String
  ********************************************************/
  async deleteSupportReply() {
    try {
      /********************************************************
      Validate request parameters
      ********************************************************/
      if (_.isEmpty(this.req.params.id)) {
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

      const checkSupportReply = await SupportTicketReplies.findById(
        this.req.params.id
      ).exec();

      if (!checkSupportReply) {
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

      await SupportTicketReplies.deleteOne({
        _id: checkSupportReply._id,
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
          "REPLY_DELETE_SUCCESSFULLY"
        )
      );
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.log("error deleteSupportReply()", error);
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
  static Listing(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let bodyData = data.bodyData;
          let model = data.bodyData.model;
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          let commonFilter = { isDeleted: false };
          let skip =
            (parseInt(bodyData.page) - 1) * parseInt(bodyData.pageSize);
          let filter1 = commonFilter;
          let sort = data.bodyData.sort ?? { createdAt: -1 };
          let f = [];

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
          let stages = [
            { $match: filter1 },
            {
              $lookup: {
                from: "users",
                localField: "openBy",
                foreignField: "_id",
                as: "userData",
              },
            },
            {
              $unwind: {
                path: "$userData",
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
              $limit: parseInt(bodyData.pageSize),
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
              perPage: bodyData.pageSize,
              total: total,
            });
          } else {
            return resolve({
              status: 1,
              data: { listing },
              page: bodyData.page,
              perPage: bodyData.pageSize,
              total: total.length > 0 ? total[0].count : 0,
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
  static Searching(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let selectObj = data.selectObj ? data.selectObj : { __v: 0 };
          let model = data.bodyData.model;
          let bodyData = data.bodyData;
          let filter = bodyData.filter;
          let skip =
            (parseInt(bodyData.page) - 1) * parseInt(bodyData.pageSize);
          let sort = data.bodyData.sort ?? { createdAt: -1 };
          let searchFilter;
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
            searchFilter = [
              {
                $match: {
                  $or: ar,
                  isDeleted: false,
                },
              },
              {
                $lookup: {
                  from: "users",
                  localField: "openBy",
                  foreignField: "_id",
                  as: "userData",
                },
              },
              {
                $unwind: {
                  path: "$userData",
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
                $limit: parseInt(bodyData.pageSize),
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
          const listing = await model.aggregate(searchFilter);
          const totalCount = await model.aggregate(totalCountFilter);

          return resolve({
            status: 1,
            data: { listing },
            page: bodyData.page,
            perPage: bodyData.pageSize,
            total: totalCount.length > 0 ? totalCount[0].count : 0,
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

module.exports = SupportController;
