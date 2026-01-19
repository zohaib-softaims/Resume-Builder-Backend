import { createUser, updateUser, deleteUser } from "../services/auth.service.js";
import { catchAsync } from "../utils/error.js";
import logger from "../lib/logger.js";
import Stripe from "stripe";
import { getPaymentByStripeIntentId, updatePaymentStatus, createPayment, completeUserSubscription, updateUserSubscription, handleSubscriptionCancellation, updateSubscriptionStatus } from "../services/payment.service.js";
import { markJobAsPaid, markAllUserJobsAsPaid } from "../services/job.service.js";
import prisma from "../lib/prisma.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const clerkWebhook = catchAsync(async (req, res, next) => {
  const { type, data } = req.body;
  switch (type) {
    case "user.created":
      await createUser(data);
      logger.info("User created via webhook", { userId: data.id, email: data.email_addresses?.[0]?.email_address });
      break;

    case "user.updated":
      await updateUser(data);
      logger.info("User updated via webhook", { userId: data.id, email: data.email_addresses?.[0]?.email_address });
      break;

    case "user.deleted":
      await deleteUser(data.id);
      logger.info("User deleted via webhook", { userId: data.id });
      break;

    default:
      logger.warn("Unhandled webhook event type", { type, userId: data.id });
  }

  return res.status(200).json({ success: true, message: "Webhook processed" });
});


export const stripeWebhook = catchAsync(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    logger.error("Invalid webhook signature", { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const eventType = event.type;
  const data = event.data.object;

  switch (eventType) {
    case "checkout.session.completed": {
      const session = data;

      if (session.mode === "subscription") {
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const subscriptionId = session.subscription;

        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customerId = stripeSubscription.customer;
        const status = stripeSubscription.status;

        await completeUserSubscription(userId, planId, status, subscriptionId, customerId);

        const plan = await prisma.plan.findUnique({
          where: { id: planId },
        });

        if (plan?.jobOptimization) {
          await markAllUserJobsAsPaid(userId);
        }

        logger.info("Subscription checkout completed", { userId, planId, subscriptionId });
      } else if (session.mode === "payment" && session.metadata?.paymentType === "one_time_job_payment") {
        const userId = session.metadata?.userId;
        const jobId = session.metadata?.jobId;
        const paymentIntentId = session.payment_intent;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        const existingPayment = await getPaymentByStripeIntentId(paymentIntentId);
        if (!existingPayment) {
          await createPayment(
            userId,
            jobId,
            paymentIntent.amount / 100,
            paymentIntent.currency,
            paymentIntentId,
            "succeeded"
          );
        } else if (existingPayment.status !== "succeeded") {
          await updatePaymentStatus(paymentIntentId, "succeeded", new Date());
        }

        if (jobId) {
          await markJobAsPaid(jobId, "one_time_payment");
        }

        logger.info("Payment checkout completed", { userId, jobId, paymentIntentId });
      }
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = data;
      const payment = await getPaymentByStripeIntentId(paymentIntent.id);

      if (payment && payment.status !== "succeeded") {
        await updatePaymentStatus(paymentIntent.id, "succeeded", new Date());

        if (payment.job_id) {
          await markJobAsPaid(payment.job_id, "one_time_payment");
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = data;
      const payment = await getPaymentByStripeIntentId(paymentIntent.id);

      if (payment) {
        await updatePaymentStatus(paymentIntent.id, "failed");
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = data;
      await handleSubscriptionCancellation(subscription.id);
      logger.info("Subscription deleted", { subscriptionId: subscription.id });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = data;
      const status = subscription.status;
      const stripeSubscriptionId = subscription.id;

      await updateSubscriptionStatus(stripeSubscriptionId, status);

      if (status === "canceled" || status === "unpaid") {
        await handleSubscriptionCancellation(stripeSubscriptionId);
      }

      logger.info("Subscription updated", { subscriptionId: stripeSubscriptionId, status });
      break;
    }

    default:
      logger.info("Unhandled Stripe webhook event type", { type: eventType });
  }

  res.status(200).json({ received: true });
});