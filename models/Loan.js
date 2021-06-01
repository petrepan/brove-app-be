const mongoose = require("mongoose");

const loanSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  amount: {
    type: Number,
    required: true,
  },
  paybackAmount: {
    type: Number,
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
  appliedDate: {
    type: String,
    required: true,
  },
  paybackDate: {
    type: String,
    required: true,
  },
});

const Loan = mongoose.model("Loan", loanSchema);

module.exports = Loan;
