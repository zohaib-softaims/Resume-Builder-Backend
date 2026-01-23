import jwt from "jsonwebtoken";
import { AppError } from "../utils/error.js";
import { findAdminByEmail } from "../services/admin.service.js";
import logger from "../lib/logger.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const requireAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Authorization token required");
    }

    const token = authHeader.substring(7); 

    let decoded;
    decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      throw new AppError(403, "Access denied. Admin role required");
    }

    // Fetch admin from database
    const admin = await findAdminByEmail(decoded.email);
    if (!admin) {
      throw new AppError(401, "Admin not found");
    }
    if (!admin.is_active) {
      throw new AppError(403, "Admin account is deactivated");
    }

    req.admin = admin;

    next();
  } catch (error) {
    logger.error("Admin auth middleware error", {
      error: error.message,
      stack: error.stack,
    });

    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token.",
    });
  }
};
