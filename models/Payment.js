const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    loan: {
      appliedDate: { type: Date },
      paybackDate: { type: Date },
      duration: { type: String },
      paybackAmount: { type: Number },
    },
    amount: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
      required: true,
    },
    paidAt: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
