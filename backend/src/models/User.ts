import mongoose from "mongoose";
const validator = require("validator");

const User = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email address"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [8, "Your password must be at least 8 characters long"],
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
    },
    dateofbirth: {
      type: String,
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", User);
