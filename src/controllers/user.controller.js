import { catchAsync } from "../utils/error.js";
import { getUserStats } from "../services/user.service.js";
import logger from "../lib/logger.js";

export const getOverallStats = catchAsync(async (req, res) => {
  const user_id = req.auth.userId;

  logger.info("Fetching user overall stats", { user_id });

  const stats = await getUserStats(user_id);

  return res.status(200).json({
    success: true,
    message: "User stats fetched successfully",
    data: stats,
  });
});
