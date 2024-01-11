import express, { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/User";

exports.getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.find();
    return res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findById(req.params.id);
    return res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
    const user = await UserModel.findById(id);
    await user.deleteOne();
    return res.status(200).json({ message: `User ${user.name} deleted` });
  } catch (error) {
    next(error);
  }
};
