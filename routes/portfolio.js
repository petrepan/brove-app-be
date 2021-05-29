const router = require("express").Router();
const { getUserPortfolio } = require("../controllers/portfolio");
const auth = require("../middlewares/auth");

router.get("/get-user-portfolio", auth, getUserPortfolio);

module.exports = router 