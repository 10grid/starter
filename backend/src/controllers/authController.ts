import express, { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/User";

exports.signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await UserModel.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(res.json(error));
  }
};
