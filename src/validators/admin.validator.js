import { z } from "zod";

export const emailSchema = z
  .string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  })
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(254, "Email must not exceed 254 characters");


export const passwordSchema = z
  .string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  })
  .min(1, "Password is required")
  .max(128, "Password must not exceed 128 characters");


export const adminLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
