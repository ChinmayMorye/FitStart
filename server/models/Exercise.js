const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide exercise name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    description: {
      type: String,
      required: [true, "Please provide exercise description"],
      maxlength: [500, "Description cannot exceed 500 characters"]
    },
    category: {
      type: String,
      required: [true, "Please provide exercise category"],
      enum: ["cardio", "strength", "flexibility", "balance"],
      default: "cardio"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Exercise", exerciseSchema);