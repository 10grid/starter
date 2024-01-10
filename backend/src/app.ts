import express, { Request, Response, NextFunction } from "express";
import router from "./routes/userRoutes";

require("dotenv").config();

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const app = express();

app.use(express.json());

// Connect to MongoDB function from db/dbConnection.ts
const mongooseConnectDB = require("./db/dbConnection");
mongooseConnectDB();

// Routes
app.use("/api/v1/", router);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
