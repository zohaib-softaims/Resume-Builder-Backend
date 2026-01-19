import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import protectedRoutes from "./routes/protected.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import jobRoutes from "./routes/job.routes.js";
import userRoutes from "./routes/user.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import { errorHandler } from "./utils/error.js";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";
import logger from "./lib/logger.js";
import { scheduleGuestCleanup } from "./jobs/cleanupGuestResumes.js";

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
app.use(cookieParser());

app.use("/api/webhooks", webhookRoutes);

// Now apply JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());
app.use("/api/protected", protectedRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/user", userRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);

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

  // Start guest resume cleanup job
  scheduleGuestCleanup();
});
