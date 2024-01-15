import express, { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/User";
const jwt = require("jsonwebtoken");

exports.signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await UserModel.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      dateofbirth: req.body.dateofbirth,
    });

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

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
