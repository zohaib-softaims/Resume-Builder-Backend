import { updateLastLogin } from "../services/auth.service.js";

export const requireAuth = (req, res, next) => {
  // Development bypass mode
  // if (process.env.BYPASS_AUTH === "true") {
  //   req.auth = {
  //     userId: process.env.DEV_USER_ID || "test_user_123",
  //   };
  //   return next();
  // }

  // Production Clerk auth check
  const session = req.auth ? req.auth() : null;
  if (!session || !session.userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Please sign in",
    });
  }

  updateLastLogin(req.auth.userId);

  next();
};

/**
 * Optional auth middleware - doesn't block if not authenticated
 * Useful for endpoints that support both guest and authenticated users
 */
export const optionalAuth = (req, res, next) => {
  // Just pass through - req.auth will be populated if user is authenticated
  // Otherwise req.auth?.userId will be undefined
  next();
};
