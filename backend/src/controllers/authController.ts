import express, { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");
import { promisify } from "util";
import User from "../models/User"; // Fix the import statement
import { Types, Document } from "mongoose";
const { sendEmail } = require("../utils/email");
const crypto = require("crypto");

interface IUser {}

interface CustomRequest extends Request {
  user: any;
}

const signToken = (id: Types.ObjectId) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (
  user: Document<IUser>,
  statusCode: number,
  res: Response
) => {
  // todo: Correct later
  const token = signToken(user.id);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
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

    createSendToken(newUser, 201, res);
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
    user.password = "";
    createSendToken(user, 200, res);
  } catch (error) {
    next(res.json(error));
  }
};

exports.senstiveInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({
    message:
      "This is senstive information and you are authorized with a verified token",
  });
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

    //grant access to protected route
    const customReq = req as CustomRequest;
    customReq.user = freshUser;
  } catch (error) {
    return next(res.status(401).json({ error }));
  }

  next();
};

exports.restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const customReq = req as CustomRequest;
    //yet roles array contain ['admin']. If some user access this route whose role = 'user' then
    //the below condition returns true and user does not have access
    //as only roles which are received in array have access
    if (!roles.includes(customReq.user.role)) {
      return next(
        res.status(403).json({
          message: "You do not have permission to perform this action",
        })
      );
    }
    next();
  };
};

exports.forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //1. get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      res.status(404).json({ message: "No user found with email address" })
    );
  }
  //2. generate the random reset token. Note: This token is not jwt
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3. send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token (valid for 10 mins)",
      message,
    });

    res.status(200).json({ status: "success", message: "Token sent to email" });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      res.status(500).json({
        status: error,
        message: "There was an error sending the email, Try again later!",
      })
    );
  }
};

exports.resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //1. get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    //check if passwordResetExpires is greater than right now, if true it means its in future and has not yet expired
    passwordResetExpires: { $gt: Date.now() },
  });

  //2. if token is not expired, and there is user, then set the new password
  if (!user) {
    return next(
      res.status(400).json({ message: "Token is invalid or expired" })
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3. update changedPasswordAt property for user. (handled in User model)

  //4. login the user, send JWT
  createSendToken(user, 200, res);
};

exports.updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //1. get user from collection
  const customReq = req as CustomRequest;
  const user = await User.findById(customReq.user.id).select("+password");

  //2. check if posted current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(
      res.status(401).json({ message: "Your current password is wrong!" })
    );
  }
  //3. if so, update password
  //User.findByIdAndUpdate does not work here as intended
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4. log user in, send jwt
  createSendToken(user, 200, res);
};
