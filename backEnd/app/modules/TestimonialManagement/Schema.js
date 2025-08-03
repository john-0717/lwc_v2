const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const testimonialsSchema = new mongoose.Schema(
    {
      title: { type: String, unique: true },
      imageUrl: { type: String },
      description: { type: String },
      testimonialDesignation: { type: String },
      isDeleted: { type: Boolean, default: false },
      createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
      modifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
      deletedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
      createdAt: { type: Number },
      updatedAt: { type: Number },
    },
    {
      timestamps: true,
    }
  );
  
  const testimonials = mongoose.model("testimonials", testimonialsSchema);

  module.exports = {
    testimonials
  };