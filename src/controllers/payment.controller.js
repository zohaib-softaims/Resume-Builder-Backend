import Stripe from "stripe";
import dotenv from "dotenv";
import { catchAsync, AppError } from "../utils/error.js";
import { createError } from "../utils/createError.js";
import { findSubscriptionByUserId } from "../services/payment.service.js";
import { getJobById } from "../services/job.service.js";
import { getAllPlans } from "../services/payment.service.js";
import logger from "../lib/logger.js";
import{ one_time_amount, CURRENCY } from "../constants/jobConstants.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = catchAsync(async (req, res, next) => {
  const { stripeProductId, stripePriceId, planId, source, jobId } = req.body;
  const userId = req.auth.userId;
  let success_url, cancel_url;
  
  if(source === 'manage-subscriptions'){
    success_url = `${process.env.CLIENT_URL}/manage-subscriptions`;
    cancel_url = `${process.env.CLIENT_URL}/manage-subscriptions?canceled=true`;
  }else{
    const jobIdParam = jobId ? `&jobId=${jobId}` : '';
    success_url = `${process.env.CLIENT_URL}/job-payment/success?session_id={CHECKOUT_SESSION_ID}${jobIdParam}`;
    cancel_url = jobId ? `${process.env.CLIENT_URL}/job/${jobId}` : `${process.env.CLIENT_URL}/job-analysis`;
  }
  
  const subscription = await findSubscriptionByUserId(userId);
  const stripeCustomerId = subscription?.stripe_customer_id || null;
  
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    ...(stripeCustomerId && { customer: stripeCustomerId }),
    line_items: [
      {
        price: stripePriceId,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    success_url: success_url,
    cancel_url: cancel_url,
    metadata: {
      userId: userId,
      stripeProductId: stripeProductId,
      stripePriceId: stripePriceId,
      planId: planId,
    },
  });

  res.json({
    success: true,
    url: session.url,
  });
});

/**
 * Create one-time payment checkout session for job optimization
 */
export const createOneTimePaymentSession = catchAsync(async (req, res, next) => {
  const { jobId } = req.body;
  const userId = req.auth.userId;

  const job = await getJobById(jobId);
  if (!job) {
    throw new AppError(404, "Job not found");
  }

  const { getResumeById } = await import("../services/resume.service.js");
  const resume = await getResumeById(job.resume_id);
  
  if (!resume) {
    throw new AppError(404, "Resume not found for this job");
  }
  
  if (resume.user_id !== userId) {
    throw new AppError(403, "You don't have permission to pay for this job");
  }

  if (job.is_paid) {
    throw new AppError(400, "This job has already been paid for");
  }

  const subscription = await findSubscriptionByUserId(userId);
  const stripeCustomerId = subscription?.stripe_customer_id || null;

  const session = await stripe.checkout.sessions.create({
    mode: "payment", 
    customer: stripeCustomerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: CURRENCY,
          product_data: {
            name: `Job Optimization - ${job.job_title || "Resume & Cover Letter"}`,
            description: "One-time payment for optimized resume and cover letter",
          },
          unit_amount: one_time_amount * 100, 
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/job-payment/success?session_id={CHECKOUT_SESSION_ID}&jobId=${jobId}`,
    cancel_url: `${process.env.CLIENT_URL}/job/${jobId}`,
    metadata: {
      userId: userId,
      jobId: jobId,
      paymentType: "one_time_job_payment",
    },
  });

  res.json({
    success: true,
    url: session.url,
    sessionId: session.id,
  });
});

export const getUserSubscriptionPackage = catchAsync(async (req, res, next) => {
  const userId = req.auth.userId;
  const subscription = await findSubscriptionByUserId(userId);

  res.json({
    success: true,
    data: {
      subscription: subscription,
    },
  });
});

export const getPlans = catchAsync(async (req, res, next) => {
  const plans = await getAllPlans();

  res.json({
    success: true,
    data: plans,
  });
});

export const createCustomerPortalSession = catchAsync(async (req, res, next) => {
  const userId = req.auth.userId;
  const { returnUrl } = req.body;

  const subscription = await findSubscriptionByUserId(userId);

  if (!subscription?.stripe_customer_id) {
    return next(createError(400, "Stripe customer ID not found. Please subscribe first."));
  }

  const finalReturnUrl = returnUrl || `${process.env.CLIENT_URL}/manage-subscriptions`;

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: finalReturnUrl,
  });

  res.json({ success: true, url: session.url });
});
