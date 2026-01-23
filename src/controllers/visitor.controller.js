import { catchAsync } from "../utils/error.js";
import {
  getVisitorStats,
  incrementAppVisits,
  incrementGuestResumeAnalysis,
  incrementFixAtsOrCustomizeClicked,
  incrementSignupButtonClicked,
} from "../services/visitor.service.js";
import logger from "../lib/logger.js";

export const getVisitorStatsController = catchAsync(async (req, res) => {
  logger.info("Admin fetching visitor stats", {
    adminId: req.admin.id,
  });

  const stats = await getVisitorStats();

  return res.status(200).json({
    success: true,
    message: "Visitor statistics fetched successfully",
    data: stats,
  });
});

export const trackAppVisitController = catchAsync(async (req, res) => {
  logger.info("Tracking app visit");

  await incrementAppVisits();

  return res.status(200).json({
    success: true,
    message: "App visit tracked successfully",
  });
});

export const trackGuestResumeAnalysisController = catchAsync(async (req, res) => {
  logger.info("Tracking guest resume analysis");

  await incrementGuestResumeAnalysis();

  return res.status(200).json({
    success: true,
    message: "Guest resume analysis tracked successfully",
  });
});

export const trackFixAtsOrCustomizeClickedController = catchAsync(async (req, res) => {
  logger.info("Tracking fix ATS or customize clicked");

  await incrementFixAtsOrCustomizeClicked();

  return res.status(200).json({
    success: true,
    message: "Fix ATS or customize click tracked successfully",
  });
});

export const trackSignupButtonClickedController = catchAsync(async (req, res) => {
  logger.info("Tracking signup button clicked");

  await incrementSignupButtonClicked();

  return res.status(200).json({
    success: true,
    message: "Signup button click tracked successfully",
  });
});
