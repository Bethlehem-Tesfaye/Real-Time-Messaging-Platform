import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { httpLogger } from "./httpLogger";
import { notFound } from "../middleware/notFound.middleware";
import { errorHandler } from "../middleware/error.middleware";
import authRouter from "../modules/auth/auth.routes";
import emailRouter from "../routes/emailRoute";
import { router } from "../routes/routes";

const app = express();

// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));

// Logging
app.use(httpLogger);

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("server is running");
});
app.use("/api/auth", authRouter);
app.use("/", emailRouter);
app.use("/api", router);

// Errors
app.use(notFound);
app.use(errorHandler);

export default app;
