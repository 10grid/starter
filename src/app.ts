import express from "express";
require("dotenv").config();
import mongoose from "mongoose";

const app = express();
app.use(express.json());

const MONGO_URL = process.env.MONGO_CONNECTION;
mongoose
  .connect(MONGO_URL, { dbName: "starter" })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
