import express from "express";

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  senstiveInfo,
  protect,
  restrictTo,
} = require("../controllers/userController");

const { signup, login } = require("../controllers/authController");

const router = express.Router();

//auth
router.post("/users/signup", signup);
router.post("/users/login", login);

//users
router.get("/users", getUsers);
//.post("/users", createUser);
router
  .get("/users/:id", getUser)
  .put("/users/:id", updateUser)

  //the roles we pass as argument in roles array will have access
  //as admin is passed here so admin will have access to perfrom actions
  .delete("/users/:id", protect, restrictTo("admin"), deleteUser);

// authorized is a middleware function that checks if the user is logged in
// if not user cannot access the senstiveInfo route
router.get("/senstiveInfo", protect, senstiveInfo);

export default router;
