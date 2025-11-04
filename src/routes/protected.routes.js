import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/profile", requireAuth, (req, res) => {
  // req.auth().userId contains the Clerk user ID
  res.json({
    success: true,
    userId: req.auth.userId,
    message: "This is a protected route",
  });
});

export default router;
