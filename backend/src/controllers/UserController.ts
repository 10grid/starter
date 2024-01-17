import express, { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { promisify } from "util";
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

exports.createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      email,
      password,
      passwordConfirm,
      dateofbirth,
      passwordChangedAt,
    } = req.body;
    const user = new User({
      name,
      email,
      password,
      passwordConfirm,
      dateofbirth,
      passwordChangedAt,
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

exports.senstiveInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({ message: "This is senstive information" });
};

exports.protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;
  //1) Getting token and check if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      res
        .status(401)
        .json({ message: "You are not logged in, Please login to get access." })
    );
  }

  try {
    //2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(res.status(401).json({ message: "Invalid signature" }));
    }

    //3) Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return next(
        res
          .status(401)
          .json({ message: "The user belonging to this token does not exist" })
      );
    }
    //4) Check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return next(
        res.status(401).json({
          message: "User changed password recently, Please log in again.",
        })
      );
    }
  } catch (error) {
    return next(res.status(401).json({ error }));
  }

  //grant access to protected route
  // req.user = freshUser;
  next();
};
