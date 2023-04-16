const mongoose = require("mongoose");

const SchoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    capacity: { type: number, required: true},
    enrolment: { type: number, required: true },
    attendance: { type: number, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model("School", SchoolSchema);