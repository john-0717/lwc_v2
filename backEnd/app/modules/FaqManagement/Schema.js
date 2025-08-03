const mongoose = require("mongoose");

const faqs = new mongoose.Schema(
  {
    faqCode: { type: String },
    question: { type: String },
    answer: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "faqCategories" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Faqs = mongoose.model("Faqs", faqs);

module.exports = {
  Faqs,
};
