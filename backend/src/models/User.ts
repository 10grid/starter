import mongoose from "mongoose";
import express, { Request, Response, NextFunction } from "express";
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
      validate: {
        //This works only on save and create
        validator: function (el: string) {
          return el === this.password;
        },
        message: "Passwords are not the same",
      },
    },
    dateofbirth: {
      type: String,
    },
  },
  { timestamps: true }
);

User.pre("save", async function (next: NextFunction) {
  //Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete passwordConfirm field
  this.passwordConfirm = undefined;
});

export const UserModel = mongoose.model("User", User);
