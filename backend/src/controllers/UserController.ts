import express, { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/User";
const catchAsync = require("../utils/catchAsync");

exports.getUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await UserModel.find();
    return res.status(200).json({ data: users });
  }
);

exports.getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    return res.status(200).json({ data: user });
  }
);

exports.createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, passwordConfirm, dateofbirth } = req.body;
    const user = new UserModel({
      name,
      email,
      password,
      passwordConfirm,
      dateofbirth,
    });
    await user.save();
    return res
      .status(201)
      .json({ message: `User ${name} created`, data: user });
  }
);

exports.updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, email, dateofbirth } = req.body;
    const user = await UserModel.findById(id);
    if (user) {
      user.name = name;
      user.email = email;
      user.dateofbirth = dateofbirth;
      await user.save();
      return res
        .status(200)
        .json({ message: `User ${name} updated`, data: user });
    }
    return res.status(400).json({ message: "User not found" });
  }
);

exports.deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (user) {
      await user.deleteOne();
      return res.status(200).json({ message: `User ${user.name} deleted` });
    }
    return res.status(400).json({ message: "User not found" });
  }
);
