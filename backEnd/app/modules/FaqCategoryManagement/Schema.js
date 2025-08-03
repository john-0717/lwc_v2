const mongoose = require("mongoose");

const faqCategories = new mongoose.Schema(
  {
    category: { type: String },
    faqCategoryCode: { type: String },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const FaqCategories = mongoose.model("faqCategories", faqCategories);

module.exports = {
  FaqCategories,
};
