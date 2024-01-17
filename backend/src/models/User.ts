const validator = require("validator");
import express, { Request, Response, NextFunction } from "express";
const bcrypt = require("bcryptjs");

import { Model, Schema, model } from "mongoose";

interface IUser {
  name: string;
  email: string;
  role: string;
  password: string;
  passwordConfirm: string;
  dateofbirth: string;
  passwordChangedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Put all user instance methods in this interface:
interface IUserMethods {
  fullName(): string;
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: string): Promise<boolean>;
}

// Create a new Model type that knows about IUserMethods...
type UserModel = Model<IUser, {}, IUserMethods>;

// And a schema that knows about IUserMethods
const userSchema = new Schema<IUser, UserModel, IUserMethods>({
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
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [8, "Your password must be at least 8 characters long"],
    // To not show password in any output
    select: false,
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
  passwordChangedAt: { type: Date, default: () => new Date() },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next: NextFunction) {
  //Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete passwordConfirm field
  this.passwordConfirm = undefined;
});

// methods

userSchema.method(
  "correctPassword",
  async function correctPassword(
    candidatePassword: string,
    userPassword: string
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  }
);

userSchema.method("changedPasswordAfter", function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = (
      this.passwordChangedAt.getTime() / 1000
    ).toString();
    console.log(changedTimeStamp, JWTTimestamp);
    // not changed means that time at which token was issued is less than changed timestamp
    // e.g if token was issued on 1st january and password was changed 5th january, so below statement returns true
    return JWTTimestamp < changedTimeStamp;
  }

  // false means not changed
  return false;
});

const User = model<IUser, UserModel>("User", userSchema);

export default User;
