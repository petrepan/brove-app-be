const User = require("../models/User");
const Portfolio = require("../models/Portfolio");
const Loan = require("../models/Loan");
const portfolios = require("../data/index");

const getLoan = async (req, res) => {
  try {
    const loanDetails = await Loan.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);
    user.totalPortfolioValue(portfolios);

    let portfolioValue = user.portfolioValue;

    if (loanDetails.active) {
      return res.status(200).send({
        status: "success",
        data: {
          user: loanDetails.user,
          amount: loanDetails.amount,
          balance: loanDetails.balance,
          duration: loanDetails.duration,
          active: loanDetails.active,
          portfolioValue,
          date: loanDetails.updatedAt,
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
  const { amount, percentage, duration } = req.body;

  if (!amount || !percentage || !duration) {
    return res.status(400).send({
      message: "All fields are required",
      status: "failed",
      data: null,
    });
  }

  try {
    const loan = await Loan.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);

    user.totalPortfolioValue(portfolios);

    let portfolioValue = user.portfolioValue;

    if (loan.active === false) {
      if (portfolioValue >= 10000) {
        loan.amount = amount;
        loan.balance = amount;
        loan.percentage = percentage;
        loan.duration = duration;
        loan.active = true;

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

const payBackLoan = async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).send({
      message: "All fields are required",
      status: "failed",
      data: null,
    });
  }
  try {
    const loan = await Loan.findOne({ user: req.user._id });

    if (loan.active) {
      if (amount === loan.amount) {
        loan.amount = 0;
        loan.balance = 0;
        loan.percentage = 0;
        loan.duration = "None";
        loan.active = false;

        await loan.save();

        return res.status(201).send({
          status: "success",
          message: `${amount} has been paid`,
        });
      } else {
        loan.amount = loan.amount;
        loan.balance = loan.amount - Number(amount);
        loan.percentage = loan.percentage;
        loan.duration = loan.duration;
        loan.active = true;

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
  } catch (error) {}
};

module.exports = { getLoan, applyForLoan, payBackLoan };
