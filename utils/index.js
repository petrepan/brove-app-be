const jwt = require("jsonwebtoken");

const validateEmail = (email) => {
 //use the epression to check if the email field contains an @, just to verify email
 const expression = /\S+@\S+/;
 return expression.test(String(email).toLowerCase());
};

//generate token
const generateToken = (id) => {
 return jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: "30d",
 });
}; 

module.exports = {validateEmail, generateToken};
