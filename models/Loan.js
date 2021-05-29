const mongoose = require("mongoose");

const loanSchema = mongoose.Schema(
 {
  user: {
   type: mongoose.Schema.Types.ObjectId,
   required: true,
   ref: "User",
  },
  amount: {
   type: Number,
   required: true,
  },
  balance: {
   type: Number,
  },
  percentage: {
   type: Number,
   required: true,
  },
  duration: {
   type: String,
   required: true,
  },
  active: {
   type: Boolean,
   default: false,
   required: true,
  },
 },
 {
  timestamps: true,
 }
);

const Loan = mongoose.model("Loan", loanSchema);

module.exports = Loan;
