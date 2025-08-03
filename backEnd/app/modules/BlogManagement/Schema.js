const mongoose = require("mongoose");

const blogs = new mongoose.Schema(
    {
        languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'languages', required: true },
        blogCode: { type: String },
        title: { type: String },
        slug: { type: String },
        metaKeywords: { type: String },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'blogCategories' },
        metaDescription: { type: String },
        media: { type: String },
        content: { type: String },
        tags: { type: Array },
        publishDateTime: { type: Date },
        publishStatus: { type: Boolean, default: false },
        publishBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        status: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);


const Blogs = mongoose.model("blogs", blogs);

module.exports = {
    Blogs
};
