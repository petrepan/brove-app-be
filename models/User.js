const mongoose = require("mongoose");
const { validateEmail } = require("../utils");

const userSchema = mongoose.Schema(
 {
  name: {
   type: String,
   required: true,
   trim: true,
  },
  email: {
   type: String,
   required: true,
   trim: true,
   unique: true,
   lowercase: true,
   validate(value) {
    if (!validateEmail(value)) {
     throw new Error("Invalid Email");
    }
   },
  },
  password: {
   type: String,
   required: true,
   unique: true,
   trim: true,
   minlength: 5,
  },
  portfolioValue: {
   type: Number,
  },
 },
 {
  timestamps: true,
 }
);

userSchema.methods.totalPortfolioValue = function (portfolios) {
 const portfolioValue = portfolios.reduce((acc, total) => {
  return acc + total.equityValue;
 }, 0);
 this.portfolioValue = portfolioValue;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
