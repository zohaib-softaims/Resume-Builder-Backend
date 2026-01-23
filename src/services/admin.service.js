import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/error.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const findAdminByEmail = async (email) => {
  const admin = await prisma.admin.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password_hash: true,
      name: true,
      is_active: true,
    },
  });
  return admin;
};

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateAdminToken = (adminId, email) => {
  const payload = {
    id: adminId,
    email: email,
    role: "admin",
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return token;
};

export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};
