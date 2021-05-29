const router = require("express").Router();
const { getLoan, applyForLoan, payBackLoan } = require("../controllers/loan");
const auth = require("../middlewares/auth");

router.get("/get-user-loan", auth, getLoan);
router.post("/apply-for-loan", auth, applyForLoan);
router.put("/payback-loan", auth, payBackLoan);

module.exports = router;
