import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import webhookRoutes from "./routes/webhook.routes.js";
import protectedRoutes from "./routes/protected.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import jobRoutes from "./routes/job.routes.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./utils/error.js";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";
import logger from "./lib/logger.js";

const app = express();
const httpServer = createServer(app);

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(clerkMiddleware());

app.use("/api/webhooks", webhookRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/user", userRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Resume Builder Backend is running!",
  });
});

const PORT = process.env.PORT || 9000;
httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});