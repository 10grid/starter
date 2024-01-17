import express, { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");
import User from "../models/User"; // Fix the import statement
import { Types } from "mongoose";

const signToken = (id: Types.ObjectId) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      dateofbirth: req.body.dateofbirth,
      role: req.body.role,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(res.json(error));
  }
};

exports.login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(res.status(400).json("Please provide email and password!"));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(res.status(401).json("Incorrect email or password"));
    }
    // 3) If everything ok, send token to client
    const token = signToken(user._id);
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    next(res.json(error));
  }
};
