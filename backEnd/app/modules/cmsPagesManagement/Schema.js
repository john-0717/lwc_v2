const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const cmspages = new mongoose.Schema({
        pageData: [{
                title: { type: String },
                slug: { type: String },
                content: { type: String },
                image: { type: String }
            }],  
        title:{ type: String },
        slug:{ type: String , unique:false },
        metaTitle:{ type: String },
        metaDescription:{ type: String },
        metaKeywords:{ type: String },
        isDeleted: {type:Boolean, default:false},        
        status:{type:Boolean, default:true},
        deletedBy:{ type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    },
    {
      timestamps: true,
    }
  );

const CMSPages = mongoose.model("cmspages", cmspages);

module.exports = {
    CMSPages
};