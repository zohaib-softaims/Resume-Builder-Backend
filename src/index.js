import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import protectedRoutes from "./routes/protected.routes.js";
import { errorHandler } from "./utils/error.js";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";

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

app.use("/api/auth", authRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/protected", protectedRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Resume Builder Backend is running!",
  });
});

const PORT = process.env.PORT || 9000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
