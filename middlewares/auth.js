const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
 let token;
 //check header for token
 if (
  req.headers.authorization &&
  req.headers.authorization.startsWith("Bearer")
 ) {
  try {
   token = req.headers.authorization.split(" ")[1];

   //verify secret
   const decoded = jwt.verify(token, process.env.JWT_SECRET);

   // if everything is good, save user detail to request for use in other routes
   req.user = await User.findById(decoded.id).select("-password");

   next();
  } catch (error) {
   return res
    .status(401)
    .send({ message: "Please login", status: "failed", data: null });
  }
 }

 if (!token) {
  return res
   .status(401)
   .send({ message: "Please login", status: "failed", data: null });
 }
};

module.exports = auth;
