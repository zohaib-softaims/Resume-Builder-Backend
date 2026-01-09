import { catchAsync, AppError } from "../utils/error.js";
import {
  createCheckoutSession,
  verifyCheckoutSession,
  getPaymentStatus,
} from "../services/payment.service.js";
import logger from "../lib/logger.js";

/**
 * Create a Stripe Checkout Session for a resume
 * POST /api/payment/create-checkout
 */
export const createCheckoutHandler = catchAsync(async (req, res) => {
  const { resume_id } = req.body;
  const userId = req.auth.userId;

  logger.info("Creating checkout session", { resume_id, user_id: userId });

  // Build success and cancel URLs
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const successUrl = `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&resume_id=${resume_id}`;
  const cancelUrl = `${baseUrl}/resume/${resume_id}`;

  const { sessionId, url } = await createCheckoutSession(
    resume_id,
    userId,
    successUrl,
    cancelUrl
  );

  res.status(200).json({
    success: true,
    message: "Checkout session created successfully",
    data: {
      session_id: sessionId,
      checkout_url: url,
    },
  });
});

/**
 * Verify payment from checkout session
 * GET /api/payment/verify-checkout
 */
export const verifyCheckoutHandler = catchAsync(async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    throw new AppError(400, "session_id is required");
  }

  logger.info("Verifying checkout session", { session_id });

  const updatedResume = await verifyCheckoutSession(session_id);

  res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    data: {
      resume_id: updatedResume.id,
      is_paid: updatedResume.is_paid,
      paid_at: updatedResume.paid_at,
    },
  });
});

/**
 * Get payment status for a resume
 * GET /api/payment/status/:resume_id
 */
export const getPaymentStatusHandler = catchAsync(async (req, res) => {
  const { resume_id } = req.params;
  const userId = req.auth.userId;

  logger.info("Getting payment status", { resume_id, user_id: userId });

  const paymentStatus = await getPaymentStatus(resume_id, userId);

  res.status(200).json({
    success: true,
    message: "Payment status retrieved successfully",
    data: paymentStatus,
  });
});

