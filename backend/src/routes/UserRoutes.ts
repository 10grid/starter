import express from "express";

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
} = require("../controllers/userController");

const {
  signup,
  login,
  senstiveInfo,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require("../controllers/authController");

const router = express.Router();

//auth
router.post("/users/signup", signup);
router.post("/users/login", login);
//the roles we pass as argument in roles array will have access
//as admin is passed here so admin will have access to perfrom actions
router.delete("/users/:id", protect, restrictTo("admin"), deleteUser);

// authorized is a middleware function that checks if the user is logged in
// if not user cannot access the senstiveInfo route
router.get("/senstiveInfo", protect, senstiveInfo);

router.post("/users/forgot-password", forgotPassword);
router.patch("/users/reset-password/:token", resetPassword);
router.patch("/users/update-password", protect, updatePassword);

//users
router.get("/users", getUsers);
//.post("/users", createUser);
router.get("/users/:id", getUser).put("/users/:id", updateUser);
router.patch("/users/update-profile", protect, updateProfile);

export default router;
