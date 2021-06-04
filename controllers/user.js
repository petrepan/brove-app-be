const bcrypt = require("bcryptjs");
const { generateToken, validateEmail } = require("../utils");
const portfolios = require("../data/index");
const User = require("../models/User");
const Portfolio = require("../models/Portfolio");
const Loan = require("../models/Loan");

/* @desc   For User registration. This also generate a default loan document for users.
This is useful later on for checking if a user has an active loan or not.
It also inserts a default portfolio for users.*/
// @route   POST /api/users/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password } = req.body;

  //validate if fields are empty and return an error
  if (!name || !email || !password) {
    return res.status(400).send({
      message: "All fields are required",
      status: "failed",
      data: null,
    });
  }

  //check if email field is valid
  if (!validateEmail(email)) {
    return res.status(400).send({
      message: "Email field is not valid",
      status: "failed",
      data: null,
    });
  }

  //validate password field
  if (password.length < 5) {
    return res.status(400).send({
      message: "Password must be more than 4 characters",
      status: "failed",
      data: null,
    });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .send({ message: "User already exist", status: "failed", data: null });
    }

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });

    const samplePortfolio = portfolios.map((portfolio) => {
      return { ...portfolio, user: user._id };
    });

    await Portfolio.insertMany(samplePortfolio);

    const loanDetails = {
      user: user._id,
      amount: 0,
      balance: 0,
      percentage: 0,
      paybackAmount: 0,
      duration: "none",
      active: false,
      appliedDate: "none",
      paybackDate: "none",
    };

    await Loan.create(loanDetails);

    if (user) {
      res.status(201).send({
        status: "success",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    } else {
      res
        .status(400)
        .send({ message: "Invalid user data", status: "failed", data: null });
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

/* @desc   User Login Route. Authentication of user.*/
// @route   POST /api/users/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      error: "Invalid email or password",
      status: "failed",
      data: null,
    });
  }

  //check if email field is valid
  if (!validateEmail(email)) {
    return res.status(400).send({
      message: "Email field is not valid",
      status: "failed",
      data: null,
    });
  }

  //validate password field
  if (password.length < 5) {
    return res.status(400).send({
      message: "Password must be more than 4 characters",
      status: "failed",
      data: null,
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .send({ message: "User not found", status: "failed", data: null });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).send({
        message: "Invalid Credentials!",
        status: "failed",
        data: null,
      });
    }

    return res.status(200).send({
      status: "success",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

// @desc    Get user details
// @route   GET /api/users
// @access  Private
const singleUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const loanDetails = await Loan.findOne({ user: req.user._id });
    const userPortfolio = await Portfolio.find({ user: req.user._id });

    user.totalPortfolioValue(portfolios);

    let portfolioValue = user.portfolioValue;

    return res.status(200).send({
      status: "success",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        userPortfolio,
        portfolioValue,
        loanDetails,
      },
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

// @desc    Update user informaion
// @route   PUT /api/users/update/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const { name, email } = req.body;

  //check if email field is valid
  if (!validateEmail(email)) {
    return res.status(400).send({
      message: "Email field is not valid",
      status: "failed",
      data: null,
    });
  }

  try {
    const user = await User.findById(req.user._id);

    const userExists = await User.findOne({ email });

    if (userExists && email !== user.email) {
      return res
        .status(400)
        .send({ message: "Email already taken", status: "failed", data: null });
    }

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;

      const updatedUser = await user.save();

      return res.status(200).send({
        status: "success",
        message: "Profile updated successfully",
        data: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      });
    } else {
      return res
        .status(400)
        .send({ message: "User not found", status: "failed", data: null });
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};


// @desc    Update user password
// @route   PUT /api/users/update/password
// @access  Private
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    const passwordMatch = await bcrypt.compare(
      oldPassword || user.password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).send({
        message: "Previous password doesn't match",
        status: "failed",
        data: null,
      });
    }

    if (newPassword.length < 5) {
      return res.status(400).send({
        message: "New Password must be more than 4 characters",
        status: "failed",
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(newPassword || user.password, salt);

    if (user) {
      user.password = hashPassword || user.password;

      const updatedUser = await user.save();

      return res.status(200).send({
        status: "success",
        message: "Password successfully updated",
      });
    } else {
      return res
        .status(400)
        .send({ message: "User not found", status: "failed", data: null });
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

module.exports = {
  register,
  login,
  updateUserProfile,
  singleUser,
  updateUserPassword,
};
