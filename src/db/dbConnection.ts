import mongoose from "mongoose";

const mongooseConnectDB = () => {
  const MONGO_URL = process.env.MONGO_CONNECTION;
  mongoose
    .connect(MONGO_URL, { dbName: "starter" })
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = mongooseConnectDB;
