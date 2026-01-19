import prisma from "../lib/prisma.js";
import { createFreePlanSubscription } from "./payment.service.js";
import logger from "../lib/logger.js";

export const createUser = async (userData) => {
  const email = userData.email_addresses?.[0]?.email_address || userData.email;
  const name = `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || null;
  const image_url = userData.image_url || userData.profile_image_url || null;

  const user = await prisma.user.create({
    data: {
      id: userData.id,
      email: email,
      name: name,
      image_url: image_url,
    },
  });

  await createFreePlanSubscription(user.id);

  return user;
};

export const updateUser = async (userData) => {
  const email = userData.email_addresses?.[0]?.email_address || userData.email;
  const name = `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || null;
  const image_url = userData.image_url || userData.profile_image_url || null;

  const user = await prisma.user.upsert({
    where: { id: userData.id },
    update: {
      email: email,
      name: name,
      image_url: image_url,
    },
    create: {
      id: userData.id,
      email: email,
      name: name,
      image_url: image_url,
    },
  });

  return user;
};

export const findUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user;
};

export const deleteUser = async (userId) => {
  // Check if user exists first
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    // User doesn't exist, return null (no error)
    return null;
  }

  const user = await prisma.user.delete({
    where: { id: userId },
  });

  return user;
};
