import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";

export const createFreePlanSubscription = async (userId) => {
  const existingSubscription = await prisma.subscription.findUnique({
    where: {
      user_id: userId,
    },
  });
  if (existingSubscription) {
    logger.info("User already has a subscription, skipping free plan creation", { userId });
    return existingSubscription;
  }

  const freePlan = await prisma.plan.findFirst({
    where: {
      OR: [
        { type: "free" },
        { type: "Free" },
      ],
      is_active: true,
    },
  });

  if (!freePlan) {
    logger.error("Free plan not found in database", { userId });
    throw new Error("Free plan not found. Please ensure a free plan exists in the database.");
  }

  const subscription = await prisma.subscription.create({
    data: {
      user_id: userId,
      plan_id: freePlan.id,
      stripe_status: "active",
      stripe_subscription_id: null,
      stripe_customer_id: null,
    },
  });

  logger.info("Free plan subscription created for new user", {
    userId,
    subscriptionId: subscription.id,
    planId: freePlan.id,
  });

  return subscription;
};

export const findSubscriptionByUserId = async (userId) => {
  const subscription = await prisma.subscription.findUnique({
    where: { user_id: userId },
    include: {
      plan: true,
    },
  });
  return subscription;
};

export const completeUserSubscription = async (userId, planId, stripeStatus, stripeSubscriptionId, stripeCustomerId = null) => {
  if (!stripeCustomerId) {
    throw new Error("stripeCustomerId is required for subscription creation");
  }

  // Idempotency check: If subscription already exists with this Stripe subscription ID, return it
  const existingByStripeId = await prisma.subscription.findUnique({
    where: { stripe_subscription_id: stripeSubscriptionId },
  });

  if (existingByStripeId) {
    logger.info("Subscription already processed (idempotency check)", {
      userId,
      stripeSubscriptionId,
      existingUserId: existingByStripeId.user_id,
    });
    return existingByStripeId;
  }

  const existingSubscription = await prisma.subscription.findUnique({
    where: { user_id: userId },
  });

  const subscriptionData = {
    plan_id: planId,
    stripe_status: stripeStatus,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_customer_id: stripeCustomerId,
  };

  let subscription;
  if (existingSubscription) {
    subscription = await prisma.subscription.update({
      where: { user_id: userId },
      data: subscriptionData,
    });
  } else {
    subscription = await prisma.subscription.create({
      data: {
        user_id: userId,
        ...subscriptionData,
      },
    });
  }

  return subscription;
};

export const updateUserSubscription = async (stripeCustomerId, stripePriceId, subscriptionStatus, stripeSubscriptionId) => {
  const subscription = await prisma.subscription.findFirst({
    where: { stripe_customer_id: stripeCustomerId },
    include: { user: true },
  });

  if (!subscription || !subscription.user) {
    throw new Error(`Subscription not found for Stripe customer ID: ${stripeCustomerId}`);
  }

  const plan = await prisma.plan.findFirst({
    where: { stripePriceId },
  });

  if (!plan) {
    throw new Error(`Plan not found for Stripe price ID: ${stripePriceId}`);
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { user_id: subscription.user_id },
    data: {
      plan_id: plan.id,
      stripe_status: subscriptionStatus,
      stripe_subscription_id: stripeSubscriptionId,
    },
  });

  return updatedSubscription;
};

export const createPayment = async (userId, jobId, amount, currency, stripePaymentIntentId, status = "pending") => {
  const existingPayment = await prisma.payment.findUnique({
    where: { stripe_payment_intent_id: stripePaymentIntentId },
  });

  if (existingPayment) {
    logger.info("Payment already exists (idempotency check)", {
      paymentIntentId: stripePaymentIntentId,
      existingStatus: existingPayment.status,
    });
    return existingPayment;
  }

  const payment = await prisma.payment.create({
    data: {
      user_id: userId,
      job_id: jobId,
      amount: amount,
      currency: currency,
      status: status,
      stripe_payment_intent_id: stripePaymentIntentId,
    },
  });

  return payment;
};

export const updatePaymentStatus = async (stripePaymentIntentId, status, paidAt = null) => {
  const updateData = {
    status: status,
  };

  if (paidAt) {
    updateData.paid_at = paidAt;
  }

  const payment = await prisma.payment.update({
    where: { stripe_payment_intent_id: stripePaymentIntentId },
    data: updateData,
  });

  return payment;
};

export const getPaymentByStripeIntentId = async (stripePaymentIntentId) => {
  return prisma.payment.findUnique({
    where: { stripe_payment_intent_id: stripePaymentIntentId },
    include: {
      job: true,
      user: true,
    },
  });
};

export const handleSubscriptionCancellation = async (stripeSubscriptionId) => {
  if (!stripeSubscriptionId) {
    logger.info("Skipping cancellation for free plan subscription (null subscription ID)", { stripeSubscriptionId });
    return null;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { stripe_subscription_id: stripeSubscriptionId },
    include: {
      user: true,
      plan: true,
    },
  });

  if (!subscription) {
    logger.warn("Subscription not found for cancellation", { stripeSubscriptionId });
    return null;
  }

  const freePlan = await prisma.plan.findFirst({
    where: {
      OR: [
        { type: "free" },
        { type: "Free" },
      ],
      is_active: true,
    },
  });

  if (!freePlan) {
    logger.error("Free plan not found for downgrade", { userId: subscription.user_id });
    throw new Error("Free plan not found");
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { user_id: subscription.user_id },
    data: {
      plan_id: freePlan.id,
      stripe_status: "active",
    },
  });

  logger.info("Subscription canceled and downgraded to free plan", {
    userId: subscription.user_id,
    oldPlanId: subscription.plan_id,
    newPlanId: freePlan.id,
    oldStripeSubscriptionId: stripeSubscriptionId,
    keptStripeCustomerId: subscription.stripe_customer_id,
  });

  return updatedSubscription;
};

export const updateSubscriptionStatus = async (stripeSubscriptionId, stripeStatus) => {
  const subscription = await prisma.subscription.findUnique({
    where: { stripe_subscription_id: stripeSubscriptionId },
  });

  if (!subscription) {
    logger.warn("Subscription not found for status update", { stripeSubscriptionId });
    return null;
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { stripe_subscription_id: stripeSubscriptionId },
    data: {
      stripe_status: stripeStatus,
    },
  });

  logger.info("Subscription status updated", {
    stripeSubscriptionId,
    stripeStatus,
    userId: subscription.user_id,
  });

  return updatedSubscription;
};


export const getAllPlans = async () => {
  const plans = await prisma.plan.findMany({
    where: {
      is_active: true,
    },
    orderBy: {
      price: "asc",
    },
  });

  logger.info("Retrieved all active plans", {plans});

  return plans;
}