const mongoose = require("mongoose");

const portfolioSchema = mongoose.Schema(
 {
  user: {
   type: mongoose.Schema.Types.ObjectId,
   required: true,
   ref: "User",
  },
  symbol: {
   type: String,
   required: true,
  },
  totalQuantity: {
   type: Number,
   required: true,
  },
  equityValue: {
   type: Number,
   required: true,
  },
  pricePerShare: {
   type: Number,
   required: true,
  },
 },
 {
  timestamps: true,
 }
);

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

module.exports = Portfolio;
