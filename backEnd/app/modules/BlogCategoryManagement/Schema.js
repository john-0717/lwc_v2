const mongoose = require("mongoose");

const blogCategories = new mongoose.Schema(
    {
        languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'languages', required: true },
        category: { type: String },
        color: { type: String },
        blogCategoryCode: { type: String },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        status: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);


const BlogCategories = mongoose.model("blogCategories", blogCategories);

module.exports = {
    BlogCategories
};
