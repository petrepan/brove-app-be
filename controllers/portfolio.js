const Portfolio = require("../models/Portfolio");

//get a user portfolio
const getUserPortfolio = async (req, res) => {
 try {
  const userPortfolio = await Portfolio.find({ user: req.user._id });
  const portfolioValue = userPortfolio.reduce((acc, total) => {
   return acc + total.equityValue;
  }, 0);
  
  return res.status(200).send({
   status: "success",
   data: {
    userPortfolio,
    portfolioValue,
   },
  });
 } catch (error) {
  return res.status(500).send(error.message);
 }
};

module.exports = { getUserPortfolio };
