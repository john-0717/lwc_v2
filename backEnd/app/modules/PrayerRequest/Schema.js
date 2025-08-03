const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const schemaDef = new mongoose.Schema(
    {
      title:{ type: String },
      description:{ type: String },
      createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
      modifiedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
      isAnonymous:{ type: Boolean,default:false},
      isUrgent:{type:Boolean,default:false},
      markAsAnswered:{type:Boolean,default:false},
      tagTestimony:{type:String},
      usersPrayed:{type:Array,default:[]},

    },
      {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
  );
  
const PrayerRequest = mongoose.model("prayerRequests", schemaDef);

module.exports = {
    PrayerRequest
}