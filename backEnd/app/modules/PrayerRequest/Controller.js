const Controller = require("../Base/Controller");
const Globals = require("../../../configs/Globals");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const Email = require("../../services/Email");
const { HTTP_CODE } = require("../../services/constant");
const ObjectId = require("mongoose").Types.ObjectId;
const _ = require("lodash");
const Form = require("../../services/Form");
const File = require("../../services/File");
const fs = require("fs");
const PrayerRequest = require("./Schema").PrayerRequest;

class PrayerRequestController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
     @Purpose Add Partners Data  
     @Parameter {
        "name":"",
        "status":"",
        "image":""
     }
     @Return JSON String
     ********************************************************/
  async addPrayer() {
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

      let data = this.req.body;
      data.createdBy = currentUser;

      let partnersInfo = await PrayerRequest.create(data);

      if (!partnersInfo) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DATA_NOT_ADDED"
          )
        );
      }

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "DATA_ADDED"
        )
      );
    } catch (error) {
      console.log(error);

      if (error.code == "11000") {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DUPLICATE_NAME"
          )
        );
      }

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
     @Purpose Add Partners Data  
     @Parameter {
        "name":"",
        "status":"",
        "image":""
     }
     @Return JSON String
     ********************************************************/
  async editPartner() {
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
      // let fieldsArray = ["name", "image", "status", "id"];

      // let data = await new RequestBody().processRequestBody(
      //   this.req.body,
      //   fieldsArray
      // );
      let data = this.req.body;
      data.modifiedBy = currentUser;

      let updateData = await PrayerRequest.updateOne(
        { _id: data.id },
        {
          $set: data,
        }
      );

      if (updateData.matchedCount == 0) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DATA_NOT_UPDATED"
          )
        );
      }

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "DATA_UPDATED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      console.log(error);

      if (error.code == "11000") {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DUPLICATE_NAME"
          )
        );
      }

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


  async addPrayMember() {
    try {
      /********************************************************
            Get current admin user id
          ********************************************************/
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";
      let data = this.req.body;
      data.modifiedBy = currentUser;
      let obj = {}
      if (data.markAsAnswered) {
        obj = { markAsAnswered: data.markAsAnswered, tagTestimony: data.tagTestimony }
        //send notifications to the prayed persons
      } else {
        let getPrayer = await PrayerRequest.findOne({ _id: ObjectId(data.id) })
        let members = [...getPrayer.usersPrayed, currentUser._id]
        obj = { usersPrayed: members }
      }

      let updateData = await PrayerRequest.updateOne(
        { _id: data.id },
        {
          $set: obj,
        }
      );

      if (updateData.matchedCount == 0) {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DATA_NOT_UPDATED"
          )
        );
      }

      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "DATA_UPDATED_SUCCESSFULLY"
        )
      );
    } catch (error) {
      console.log(error);

      if (error.code == "11000") {
        return new CommonService().handleResolve(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          await new CommonService().setMessage(
            this.req.currentUserLang,
            "DUPLICATE_NAME"
          )
        );
      }

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
     @Purpose Partner Details
     @Parameter {id}
     @Return JSON String
     ********************************************************/
  async partnerDetails() {
    try {
      const partnerDetails = await Partners.findOne({
        _id: this.req.query.id,
      })
        .populate("createdBy", "firstname lastname")
        .populate("modifiedBy", "firstname lastname");

      if (!partnerDetails) {
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
        partnerDetails
      );
    } catch (error) {
      /********************************************************
          Manage Error logs and Response
          ********************************************************/
      console.log("error partnerDetails()", error);
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
    @Purpose Partners Listing
    @Parameter
    {
       "page":1,
       "pagesize":10,
       "sort":{},
       "search":""
    }
    @Return JSON String
    ********************************************************/
  async prayerListing() {
    try {
      // page
      let page = this.req.query.page ? this.req.query.page : 1;
      let pageSize = this.req.query.pageSize ? this.req.query.pageSize : 10;

      let sorting = { isUrgent: -1, createdAt: -1 };
      if (!_.isEmpty(this.req.query.sort))
        sorting = JSON.parse(this.req.query.sort);

      let skip = (parseInt(page) - 1) * parseInt(pageSize);
      let where = {};
      // for searching
      if (this.req.query.search) {
        where = {
          name: {
            $regex: Globals.escapeRegExp(this.req.query.search),
            $options: "i",
          },
        };
      }

      if (this.req.currentUser) {
        where = {
          createdBy: ObjectId(this.req.currentUser._id)
        }
      }

      const dataPipeline = [
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "authorInfo"
          }
        },
        {
          $unwind: {
            path: "$authorInfo",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            id: { $toString: "$_id" },
            title: 1,
            content: "$description",
            author: {
              $cond: {
                if: "$isAnonymous",
                then: "Anonymous",
                else: {
                  $concat: ["$authorInfo.firstName", " ", "$authorInfo.lastName"]
                }
              }
            },
            isUrgent: 1,
            isAnonymous: 1,
            prayerCount: { $size: { $ifNull: ["$usersPrayed", []] } },
            timestamp: "$createdAt",
            usersPrayed: 1
          }
        },
        { $sort: sorting }
      ];

      // Add optional pagination
      if (this.req.query.page && this.req.query.pageSize) {
        dataPipeline.push({ $skip: skip });
        dataPipeline.push({ $limit: pageSize });
      }



      let partnersList = await PrayerRequest.aggregate([
        { $match: where },
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
            data: dataPipeline,
          },
        },
      ]);

      if (_.isEmpty(partnersList[0].data)) {
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
        partnersList[0].data,
        null,
        page,
        pageSize,
        partnersList[0].count[0].count
      );
    } catch (error) {
      /********************************************************
           Manage Error logs and Response
           ********************************************************/
      console.log("error partnerslisting()", error);
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

  async prayerStats() {
    try {
      let query = [
        {
          $facet: {
            answeredCount: [
              { $match: { markAsAnswered: true } },
              { $count: "count" }
            ],
            activeCount: [
              { $match: { markAsAnswered: false } },
              { $count: "count" }
            ],
            prayerWarriors: [
              {
                $project: {
                  usersPrayed: 1
                }
              },
              {
                $unwind: "$usersPrayed"
              },
              {
                $group: {
                  _id: "$usersPrayed"
                }
              },
              {
                $count: "count"
              }
            ]
          }
        },
        {
          $project: {
            answeredCount: {
              $ifNull: [{ $arrayElemAt: ["$answeredCount.count", 0] }, 0]
            },
            activeCount: {
              $ifNull: [{ $arrayElemAt: ["$activeCount.count", 0] }, 0]
            },
            prayerWarriorsCount: {
              $ifNull: [{ $arrayElemAt: ["$prayerWarriors.count", 0] }, 0]
            }
          }
        }
      ]
      let result = await PrayerRequest.aggregate(query)
      return new CommonService().handleResolve(
        this.res,
        HTTP_CODE.SUCCESS,
        HTTP_CODE.SUCCESS_CODE,
        await new CommonService().setMessage(
          this.req.currentUserLang,
          "GET_DETAIL_SUCCESSFULLY"
        ),
        result?.[0] || {
            "answeredCount": 0,
            "activeCount": 0,
            "prayerWarriorsCount": 0
        }
      );
    } catch (e) {
      console.log(e)
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

module.exports = PrayerRequestController;
