export const requireAuth = (req, res, next) => {
  // Development bypass mode
  if (process.env.BYPASS_AUTH === "true") {
    req.auth = {
      userId: process.env.DEV_USER_ID || "test_user_123",
    };
    return next();
  }

  // Production Clerk auth check
  if (!req.auth?.userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Please sign in",
    });
  }
  next();
};
