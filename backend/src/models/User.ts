// import mongoose from "mongoose";
// import express, { Request, Response, NextFunction } from "express";
// const validator = require("validator");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Please enter your name"],
//     },
//     email: {
//       type: String,
//       required: [true, "Please enter your email address"],
//       unique: true,
//       lowercase: true,
//       validate: [validator.isEmail, "Please enter a valid email address"],
//     },
//     password: {
//       type: String,
//       required: [true, "Please enter your password"],
//       minlength: [8, "Your password must be at least 8 characters long"],
//       // To not show password in any output
//       select: false,
//     },
//     passwordConfirm: {
//       type: String,
//       required: [true, "Please confirm your password"],
//       validate: {
//         //This works only on save and create
//         validator: function (el: string) {
//           return el === this.password;
//         },
//         message: "Passwords are not the same",
//       },
//     },
//     dateofbirth: {
//       type: String,
//     },

//     // methods: {
//     //   correctPassword: async function (
//     //     candidatePassword: string,
//     //     userPassword: string
//     //   ) {
//     //     return await bcrypt.compare(candidatePassword, userPassword);
//     //   },
//     // },
//   },
//   { timestamps: true }
// );

// userSchema.pre("save", async function (next: NextFunction) {
//   //Only run this function if password was actually modified
//   if (!this.isModified("password")) return next();

//   //Hash the password with cost of 12
//   this.password = await bcrypt.hash(this.password, 12);

//   //Delete passwordConfirm field
//   this.passwordConfirm = undefined;
// });

// userSchema.methods.correctPassword = async function (
//   candidatePassword: string,
//   userPassword: string
// ) {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };

// userSchema.method("fullName", function fullName(): string {
//   return this.name + " " + this.name;
// });

// export default mongoose.model("User", userSchema);

const validator = require("validator");
import express, { Request, Response, NextFunction } from "express";
const bcrypt = require("bcryptjs");

import { Model, Schema, model } from "mongoose";

interface IUser {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  dateofbirth: string;
}

// Put all user instance methods in this interface:
interface IUserMethods {
  fullName(): string;
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
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
});

userSchema.pre("save", async function (next: NextFunction) {
  //Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete passwordConfirm field
  this.passwordConfirm = undefined;
});

userSchema.method("fullName", function fullName() {
  return this.name + " " + this.email;
});

userSchema.method(
  "correctPassword",
  async function correctPassword(
    candidatePassword: string,
    userPassword: string
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  }
);

// userSchema.methods.correctPassword = async function (
//   candidatePassword: string,
//   userPassword: string
// ) {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };

const User = model<IUser, UserModel>("User", userSchema);

export default User;
