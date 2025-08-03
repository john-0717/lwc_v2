const mongoose = require("mongoose");

const staticPages = new mongoose.Schema(
    {
        languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'languages', required: true },
        title: { type: String },
        slug: { type: String },
        metaKeywords: { type: String },
        metaDescription: { type: String },
        staticCode: { type: String },
        content: { type: String },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        status: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);


const StaticPages = mongoose.model("staticPages", staticPages);

module.exports = {
    StaticPages
};
