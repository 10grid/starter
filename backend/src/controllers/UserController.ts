import express, { Request, Response, NextFunction } from "express";
import User from "../models/User";
const jwt = require("jsonwebtoken");

exports.getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();
    if (users.length == 0) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json({ status: "success", data: { users } });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    return res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

// exports.createUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       passwordConfirm,
//       dateofbirth,
//       passwordChangedAt,
//     } = req.body;
//     const user = new User({
//       name,
//       email,
//       password,
//       passwordConfirm,
//       dateofbirth,
//       passwordChangedAt,
//     });
//     await user.save();
//     return res
//       .status(201)
//       .json({ message: `User ${name} created`, data: user });
//   } catch (error) {
//     next(error);
//   }
// };

exports.updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, email, dateofbirth } = req.body;
    const user = await User.findById(id);
    if (user) {
      user.name = name;
      user.email = email;
      user.dateofbirth = dateofbirth;
      await user.save();
      return res
        .status(200)
        .json({ message: `User ${name} updated`, data: user });
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    await user.deleteOne();
    return res.status(200).json({ message: `User ${user.name} deleted` });
  } catch (error) {
    next(error);
  }
};
