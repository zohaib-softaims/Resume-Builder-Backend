export const requireAuth = (req, res, next) => {
  if (!req.auth?.userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Please sign in",
    });
  }
  next();
};
