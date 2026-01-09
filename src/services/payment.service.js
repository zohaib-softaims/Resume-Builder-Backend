import Stripe from "stripe";
import { getResumeById, updateResume } from "./resume.service.js";
import logger from "../lib/logger.js";

// Initialize Stripe - will throw error if key is missing
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout Session for a resume
 * @param {string} resumeId - The resume ID
 * @param {string} userId - The user ID
 * @param {string} successUrl - URL to redirect after successful payment
 * @param {string} cancelUrl - URL to redirect if payment is cancelled
 * @returns {Promise<Object>} Checkout session object
 */
export const createCheckoutSession = async (
  resumeId,
  userId,
  successUrl,
  cancelUrl
) => {
  try {
    // Verify resume exists and belongs to user
    const resume = await getResumeById(resumeId);

    if (!resume) {
      throw new Error("Resume not found");
    }

    if (resume.user_id !== userId) {
      throw new Error("Unauthorized: Resume does not belong to user");
    }

    // Check if already paid
    if (resume.is_paid) {
      throw new Error("Resume has already been paid for");
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "AI Resume Builder - Optimized Resume",
              description: "Unlock your optimized resume with AI Resume Builder Pro",
            },
            unit_amount: 500, // $5.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        resume_id: resumeId,
        user_id: userId,
      },
    });

    logger.info("Checkout session created", {
      resume_id: resumeId,
      session_id: session.id,
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    logger.error("Error creating checkout session", {
      resume_id: resumeId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Verify and update payment status from checkout session
 * @param {string} sessionId - The Stripe checkout session ID
 * @returns {Promise<Object>} Updated resume
 */
export const verifyCheckoutSession = async (sessionId) => {
  try {
    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      throw new Error(
        `Payment not completed. Status: ${session.payment_status}`
      );
    }

    const resumeId = session.metadata.resume_id;
    const userId = session.metadata.user_id;

    if (!resumeId || !userId) {
      throw new Error("Missing metadata in checkout session");
    }

    // Get the payment intent ID from the session
    const paymentIntentId = session.payment_intent;

    // Update resume with payment information
    const updatedResume = await updateResume(resumeId, {
      is_paid: true,
      paid_at: new Date(),
      stripe_payment_intent: paymentIntentId,
    });

    logger.info("Payment verified and resume updated", {
      resume_id: resumeId,
      session_id: sessionId,
      payment_intent_id: paymentIntentId,
    });

    return updatedResume;
  } catch (error) {
    logger.error("Error verifying checkout session", {
      session_id: sessionId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get payment status for a resume
 * @param {string} resumeId - The resume ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} Payment status
 */
export const getPaymentStatus = async (resumeId, userId) => {
  try {
    const resume = await getResumeById(resumeId);

    if (!resume) {
      throw new Error("Resume not found");
    }

    if (resume.user_id !== userId) {
      throw new Error("Unauthorized: Resume does not belong to user");
    }

    return {
      is_paid: resume.is_paid || false,
      paid_at: resume.paid_at,
      stripe_payment_intent: resume.stripe_payment_intent,
    };
  } catch (error) {
    logger.error("Error getting payment status", {
      resume_id: resumeId,
      error: error.message,
    });
    throw error;
  }
};

