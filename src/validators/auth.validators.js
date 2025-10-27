import { z } from "zod";

const passwordSchema = z
  .string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  })
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
  .max(100, "Password must not exceed 100 characters");

const nameSchema = z
  .string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  })
  .min(2, "Name must be at least 2 characters long")
  .max(50, "Name must not exceed 50 characters")
  .regex(/^[a-zA-Z\s-']+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

const emailSchema = z
  .string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  })
  .email("Please enter a valid email address")
  .transform((email) => email.toLowerCase().trim());

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: nameSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const confirmResetPasswordSchema = z.object({
  newPassword: passwordSchema,
  url: z.string({
    required_error: "url is required",
    invalid_type_error: "url must be a string",
  }),
});

export const updateProfileSchema = z.object({
  full_name: z
    .string({
      invalid_type_error: "Full name must be a string",
    })
    .min(1, "Full name cannot be empty")
    .max(50, "Full name is too long")
    .optional(),
});

export const profilePictureValidator = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
  const maxSize = 2 * 1024 * 1024; // 5MB

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "Invalid file type. Only JPEG, PNG images are allowed.",
    });
  }

  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: "File size too large. Maximum size is 2MB.",
    });
  }

  next();
};
