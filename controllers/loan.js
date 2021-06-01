const User = require("../models/User");
const Portfolio = require("../models/Portfolio");
const Loan = require("../models/Loan");
const Payment = require("../models/Payment");
const portfolios = require("../data/index");

const getLoanDetails = async (req, res) => {
  try {
    const loanDetails = await Loan.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);
    user.totalPortfolioValue(portfolios);

    let portfolioValue = user.portfolioValue;

    if (loanDetails.active) {
      return res.status(200).send({
        status: "success",
        data: {
          email: user.email,
          amount: loanDetails.amount,
          paybackAmount: loanDetails.paybackAmount,
          balance: loanDetails.balance,
          duration: loanDetails.duration,
          percentage: loanDetails.percentage,
          active: loanDetails.active,
          portfolioValue,
          appliedDate: loanDetails.appliedDate,
          paybackDate: loanDetails.paybackDate,
        },
      });
    } else {
      if (portfolioValue >= 10000) {
        return res.status(200).send({
          status: "success",
          message: "No Active Loan",
          data: {
            active: false,
            portfolioValue,
          },
        });
      } else {
        return res.status(200).send({
          status: "success",
          message: "You Are Not Eligible for a Loan Now",
          data: {
            active: false,
            portfolioValue,
          },
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const applyForLoan = async (req, res) => {
  const { amount, percentage, duration, appliedDate, paybackDate } = req.body;

  if (!amount || !percentage || !duration || !appliedDate || !paybackDate) {
    return res.status(400).send({
      message: "All fields are required",
      status: "failed",
      data: null,
    });
  }

  let paybackAmount = (amount * percentage).toFixed(0);

  try {
    const loan = await Loan.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);

    user.totalPortfolioValue(portfolios);

    let portfolioValue = user.portfolioValue;

    if (loan.active === false) {
      if (portfolioValue >= 10000) {
        loan.amount = amount;
        loan.paybackAmount = paybackAmount;
        loan.balance = paybackAmount;
        loan.percentage = percentage;
        loan.duration = duration;
        loan.active = true;
        loan.appliedDate = appliedDate;
        loan.paybackDate = paybackDate;

        await loan.save();

        return res.status(201).send({
          status: "success",
          message: "You Loan Has Been Activated",
        });
      } else {
        return res.status(401).send({
          status: "failed",
          message: "You are not eligible to apply for Loan",
        });
      }
    } else {
      return res.status(401).send({
        status: "failed",
        message:
          "You have an Active Loan Already. Payback the loan to be eligible",
      });
    }
  } catch (error) {}
};

const paybackLoan = async (req, res) => {
  const { amount, paidAt } = req.body;

  if (!amount || !paidAt) {
    return res.status(400).send({
      message: "All fields are required",
      status: "failed",
      data: null,
    });
  }
  try {
    const loan = await Loan.findOne({ user: req.user._id });

    if (loan.active) {
      const payment = new Payment({
        user: req.user._id, 
        loan: {
          appliedDate: loan.appliedDate,
          paybackDate: loan.paybackDate,
          duration: loan.duration,
          paybackAmount: loan.paybackAmount,
        },
        amount,
        completed: amount === loan.paybackAmount,
        paidAt,
      });

      await payment.save();

      if (amount === loan.paybackAmount) {
        loan.amount = 0;
        loan.paybackAmount = 0;
        loan.balance = 0;
        loan.percentage = 0;
        loan.duration = "none";
        loan.active = false;
        loan.appliedDate = "none";
        loan.paybackDate = "none";

        await loan.save();

        return res.status(201).send({
          status: "success",
          message: `${amount} has been paid`,
        });
      } else {
        loan.amount = loan.amount;
        loan.paybackAmount = loan.paybackAmount;
        loan.balance = loan.paybackAmount - Number(amount);
        loan.percentage = loan.percentage;
        loan.duration = loan.duration;
        loan.active = true;
        loan.paybackDate = loan.paybackDate;
        loan.appliedDate = loan.appliedDate;

        await loan.save();
        return res.status(201).send({
          status: "success",
          message: `${amount} has been paid`,
        });
      }
    } else {
      return res.status(422).send({
        status: "failed",
        message: "You have no Active Loan.",
      });
    }
  } catch (error) {
    console.log(error)
  }
};

module.exports = { getLoanDetails, applyForLoan, paybackLoan };
