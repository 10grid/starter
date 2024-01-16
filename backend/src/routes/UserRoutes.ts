import express from "express";

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const { signup, login } = require("../controllers/authController");

const router = express.Router();

//auth
router.post("/users/signup", signup);
router.post("/users/login", login);

//users
router.get("/users", getUsers).post("/users", createUser);
router
  .get("/users/:id", getUser)
  .put("/users/:id", updateUser)
  .delete("/users/:id", deleteUser);

export default router;
