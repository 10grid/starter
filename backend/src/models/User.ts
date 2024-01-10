import mongoose from "mongoose";

const User = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    dateofbirth: {
      type: String,
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", User);
