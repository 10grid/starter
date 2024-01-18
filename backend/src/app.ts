import express, { Request, Response, NextFunction } from "express";
import router from "./routes/userRoutes";

require("dotenv").config();

const app = express();

app.use(express.json());

// Connect to MongoDB function from db/dbConnection.ts
// todo: put in import
const mongooseConnectDB = require("./db/dbConnection");
mongooseConnectDB();

// Routes
app.use("/api/v1/", router);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(res.status(404).json(`Can't find ${req.originalUrl} on this server!`));
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
