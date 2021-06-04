const axios = require("axios");
const User = require("../models/User");
const Portfolio = require("../models/Portfolio");
const Loan = require("../models/Loan");
const Payment = require("../models/Payment");
const portfolios = require("../data/index");

// @desc    Get a User's Loan Informations
// @route   GET /api/loans/get-user-loan
// @access  Private
const getLoanDetails = async (req, res) => {
  try {
    const loanDetails = await Loan.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);
    user.totalPortfolioValue(portfolios);

    let portfolioValue = user.portfolioValue;

    //check if there's an active loan, then return the data
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
      //@desc    if there's no active loan, check if the user is eligible or not
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
    return res.status(500).send(error.message);
  }
};

//@desc   processing payment with paystack api
const paystack = async (accountNumber, bankCode, amount) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    };

    const res = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      config
    );

    const data = res.data;

    const recipient = await axios.post(
      "https://api.paystack.co/transferrecipient",
      {
        account_number: data.data.account_number,
        type: "nuban",
        bank_code: bankCode,
        currency: "NGN",
      },
      config
    );

    const data2 = recipient.data;

    const transfer = await axios.post(
      "https://api.paystack.co/transfer",
      {
        recipient: data2.data.recipient_code,
        source: "balance",
        amount: amount * 100 * 450,
        currency: "NGN",
      },
      config
    );

    transfer.data;
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

// @desc    Apply for a loan
// @route   POST /api/loans/apply-for-loan
// @access  Private
const applyForLoan = async (req, res) => {
  const {
    amount,
    percentage,
    duration,
    appliedDate,
    paybackDate,
    bankCode,
    accountNumber,
  } = req.body;

  if (!amount || !percentage || !duration || !appliedDate || !paybackDate) {
    return res.status(400).send({
      message: "All fields are required",
      status: "failed",
      data: null,
    });
  }

  //calculate total amount to payback using percentage and amount
  let paybackAmount = (amount * percentage).toFixed(0);

  try {
    const loan = await Loan.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);

    //calculate total portfolio value
    user.totalPortfolioValue(portfolios);

    let portfolioValue = user.portfolioValue;

    //check if a user has an active loan
    if (loan.active === false) {
      /*if there's no active loan, check if they are eligible for a loan. 
     Activate a loan if they are eligible and return an error status code if they are not
      */
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

        paystack(accountNumber, bankCode, amount);

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
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

// @desc    Payback a loan
// @route   POST /api/loans/payback-loan
// @access  Private
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

    //check if a user has an active loan to payback
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
        completed: amount === loan.balance,
        paidAt,
      });

      await payment.save();

      //check if a user is paying back fully or part of the loan
      if (amount === loan.balance) {
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
        loan.balance = loan.balance - Number(amount);
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
    return res.status(500).send(error.message);
  }
};

module.exports = { getLoanDetails, applyForLoan, paybackLoan };
