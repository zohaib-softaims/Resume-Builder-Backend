import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Example protected route
router.get("/profile", requireAuth, (req, res) => {
  // req.auth.userId contains the Clerk user ID
  res.json({
    success: true,
    userId: req.auth.userId,
    message: "This is a protected route",
  });
});

// Another example
router.post("/data", requireAuth, (req, res) => {
  // User is authenticated, req.auth.userId is available
  res.json({
    success: true,
    userId: req.auth.userId,
    data: "Your protected data",
  });
});

export default router;
