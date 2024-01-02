import express from "express";
require("dotenv").config();
import router from "./routes/UserRoutes";

const app = express();
app.use(express.json());

// Connect to MongoDB function from db/dbConnection.ts
const mongooseConnectDB = require("./db/dbConnection");
mongooseConnectDB();

// Routes
app.use("/", router);

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
