const { AdvisorSchema, AdviserReports } = require("../modules/Advisor/Schema");
const {
  Employer,
  Subscriptions,
  Transaction,
} = require("../modules/Employer/Schema");
const { userSchema } = require("../modules/Users/Schema");
const ObjectId = require("mongoose").Types.ObjectId;
const _ = require("lodash");
const { asyncForEach } = require("./User");

class AdviserService {
  constructor() {}

  /**
        @purpose verify nzbn
        @params nzbn 
        @response json
    **/
  async getCommission(startDate, endDate, userId, adviserId) {
    try {
      //get adviser
      let adviser = await AdvisorSchema.findOne({
        userId: ObjectId(adviserId),
      });

      let match = {
        role: "Employer",
        createdBy: ObjectId(adviserId),
      };
      if (userId) {
        match["_id"] = ObjectId(userId);
      }
      let dateMatch = {};
      if (startDate) {
        // Get the first day of the current month
        let firstDay = startDate;
        firstDay = new Date(firstDay).getTime();
        // Get the last day of the current month
        let lastDay = endDate;
        lastDay.setHours(23, 59, 59, 999); // Set time to 23:59:59:999
        lastDay = new Date(lastDay).getTime();
        dateMatch = {
          $and: [
            { "subscriptions.createdAt": { $gte: firstDay } },
            { "subscriptions.createdAt": { $lte: lastDay } },
          ],
        };
      }
      //get all associated employer-ids along with their subscription list amounts
      let subscriptions = await userSchema.aggregate([
        {
          $match: match,
        },
        {
          $lookup: {
            from: "employersubscriptions",
            localField: "_id",
            foreignField: "userId",
            as: "subscriptions",
          },
        },
        {
          $unwind: {
            path: "$subscriptions",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: dateMatch,
        },
        {
          $lookup: {
            from: "mastersubscriptions",
            localField: "subscriptions.subscriptionId",
            foreignField: "_id",
            as: "master",
          },
        },
        {
          $unwind: {
            path: "$master",
            includeArrayIndex: "string",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$master.name",
            plan: { $first: "$master.name" },
            price: { $sum: "$subscriptions.price" },
          },
        },
        {
          $project: {
            _id: 0,
            plan: 1,
            price: 1,
          },
        },
        {
          $group: {
            _id: null,
            data: { $push: { k: "$plan", v: "$price" } },
          },
        },
        {
          $replaceRoot: {
            newRoot: { $arrayToObject: "$data" },
          },
        },
      ]);
      console.log(subscriptions);
      if (!_.isEmpty(subscriptions)) {
        let price = Object.values(subscriptions[0]);
        let commission = price.reduce((a, b) => a + b, 0);
        console.log(commission);
        return commission * (adviser.commission / 100);
      } else {
        return 0;
      }
    } catch (e) {
      console.log("error in commission calculation", e);
      return { status: 0, data: [e] };
    }
  }

  async listCommission(startDate=null, endDate=null, adviserId) {
    try {
      //get adviser
      let adviser = await AdvisorSchema.findOne({
        userId: adviserId,
      });

      let match = {
        role: "Employer",
        createdBy: ObjectId(adviserId),
      };
      let dateMatch = {};
      if (startDate) {
        // Get the first day of the current month
        let firstDay = startDate;
        firstDay = new Date(firstDay).getTime();

        dateMatch = {
          $and: [
            { "subscriptions.createdAt": { $gte: firstDay } },
          ],
        };
      }
      if (endDate){
        // Get the last day of the current month
        let lastDay = endDate;
        lastDay.setHours(23, 59, 59, 999); // Set time to 23:59:59:999
        lastDay = new Date(lastDay).getTime();
        if(dateMatch['$and']){
          dateMatch['$and'].push({ "subscriptions.createdAt": { $lte: lastDay } })
        }else{
          dateMatch={'$and':[{ "subscriptions.createdAt": { $lte: lastDay } }]}
        }
      }
      //get all associated employer-ids along with their subscription list amounts
      // let subscriptions = await userSchema.aggregate([
      //   {
      //     $match: match,
      //   },
      //   {
      //     $lookup: {
      //       from: "transactions",
      //       localField: "_id",
      //       foreignField: "userId",
      //       as: "transactions",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$transactions",
      //       preserveNullAndEmptyArrays: false,
      //     },
      //   },
      //   {
      //     $project: {
      //       month: {
      //         $month: {
      //           $toDate: "$transactions.createdAt",
      //         },
      //       },
      //       year: {
      //         $year: {
      //           $toDate: "$transactions.createdAt",
      //         },
      //       },
      //       price:
      //         "$transactions.paymentDetails.totalFee",
      //     },
      //   },
      
      //   {$facet: {
      //     count:[{$group:{
      //         _id: {
      //           month: "$month",
      //           year: "$year",
      //         },
      //         billDate: {
      //           $first: {
      //             $concat: [
      //               "01",
      //               "-",
      //               {
      //                 $toString: "$month",
      //               },
      //               "-",
      //               {
      //                 $toString: "$year",
      //               },
      //             ],
      //           },
      //         },
      //         commission: {
      //           $sum: "$price",
      //         },
      //       }},],
      //     data: [   {
      //     $group:
      //       {
      //         _id: {
      //           month: "$month",
      //           year: "$year",
      //         },
      //         billDate: {
      //           $first: {
      //             $concat: [
      //               "01",
      //               "-",
      //               {
      //                 $toString: "$month",
      //               },
      //               "-",
      //               {
      //                 $toString: "$year",
      //               },
      //             ],
      //           },
      //         },
      //         commission: {
      //           $sum: "$price",
      //         },
      //       },
      //   }, {$sort:{"_id.month":1,"_id.year":1}},{$skip:0},{$limit:10} ]
      //   }}]);
      let subscriptions = await AdviserReports.find({userId:ObjectId(adviserId)})
      let listing = subscriptions[0]?.data || [];
      await AdviserService.asyncForEach(listing,async (e)=>{
        e.commission = e.commission * ((adviser?.commission || 0)/100)
      })

        return {total:subscriptions[0]?.count?.length || 0,data:listing||[]}

    } catch (e) {
      console.log("error in commission listing", e);
      return { status: 0, data: [e] };
    }
  }
  static async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}
module.exports = AdviserService;
