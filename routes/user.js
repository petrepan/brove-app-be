const router = require("express").Router();
const {
  register,
  login,
  singleUser,
  updateUserProfile,
  updateUserPassword,
} = require("../controllers/user");
const auth = require("../middlewares/auth");

//user register route
router.post("/register", register);

//user login route
router.post("/login", login);

//user login route
router.get("/", auth, singleUser);

//update user information route
router.put("/update/profile", auth, updateUserProfile);
router.put("/update/password", auth, updateUserPassword);

//get all users route
// Added auth middleware to make sure only an authenticated user can access this route
// router.get("/allusers", auth, getAllUsers);

module.exports = router;
