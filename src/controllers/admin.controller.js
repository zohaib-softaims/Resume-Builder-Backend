import { catchAsync } from "../utils/error.js";
import {
  findAdminByEmail,
  verifyPassword,
  generateAdminToken,
} from "../services/admin.service.js";
import { AppError } from "../utils/error.js";
import logger from "../lib/logger.js";

export const adminLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  logger.info("Admin login attempt", { email });

  const admin = await findAdminByEmail(email);

  if (!admin) {
    throw new AppError(401, "Invalid email or password");
  }

  if (!admin.is_active) {
    throw new AppError(403, "Admin account is deactivated");
  }

  const isPasswordValid = await verifyPassword(password, admin.password_hash);

  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = generateAdminToken(admin.id, admin.email);

  const adminData = {
    email: admin.email,
    name: admin.name,
  };

  logger.info("Admin logged in successfully", { email: admin.email });

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      admin: adminData,
      token,
    },
    user: adminData,
  });
});

export const getMe = catchAsync(async (req, res) => {
  const admin = req.admin;

  const adminData = {
    email: admin.email,
    name: admin.name,
  };

  return res.status(200).json({
    success: true,
    user: adminData,
    data: adminData,
  });
});
