const router = require("express").Router();
const { getLoanDetails, applyForLoan, paybackLoan } = require("../controllers/loan");
const auth = require("../middlewares/auth");

router.get("/get-user-loan", auth, getLoanDetails);
router.post("/apply-for-loan", auth, applyForLoan);
router.put("/payback-loan", auth, paybackLoan);

module.exports = router;
