import { catchAsync } from "../utils/error.js";
import { getUserStats, getUserOverviewStats, getUsersList, markConsiliariClicked } from "../services/user.service.js";
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

export const markConsiliariClickedController = catchAsync(async (req, res) => {
  const userId = req.auth.userId;

  logger.info("User clicked consiliari button", { userId });

  await markConsiliariClicked(userId);

  return res.status(200).json({
    success: true,
    message: "Consiliari click tracked successfully",
  });
});

//Admin Controllers
export const getOverviewStats = catchAsync(async (req, res) => {
  logger.info("Admin fetching user overview stats", {
    adminId: req.admin.id,
  });

  const stats = await getUserOverviewStats();

  return res.status(200).json({
    success: true,
    message: "User overview statistics fetched successfully",
    data: stats,
  });
});

export const getUsers = catchAsync(async (req, res) => {
  const {
    page,
    limit,
    search,
    tab,
    timeRange,
    monthFilter,
    subscriptionFilter,
  } = req.query;

  logger.info("Admin fetching users list", {
    adminId: req.admin.id,
    filters: {
      page,
      limit,
      search,
      tab,
      timeRange,
      monthFilter,
      subscriptionFilter,
    },
  });

  const options = {
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
    search: search || "",
    tab: tab || "all",
    timeRange: timeRange || "7days",
    monthFilter: monthFilter || "",
    subscriptionFilter: subscriptionFilter || "all",
  };

  const result = await getUsersList(options);

  return res.status(200).json({
    success: true,
    message: "Users list fetched successfully",
    data: result,
  });
});