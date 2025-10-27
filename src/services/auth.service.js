import prisma from "../lib/prisma.js";

export const createUser = async (userData) => {
  const email = userData.email_addresses?.[0]?.email_address || userData.email;
  const name = `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || null;
  const imageUrl = userData.image_url || userData.profile_image_url || null;

  const user = await prisma.user.create({
    data: {
      id: userData.id,
      email: email,
      name: name,
      imageUrl: imageUrl,
    },
  });

  return user;
};

export const updateUser = async (userData) => {
  const email = userData.email_addresses?.[0]?.email_address || userData.email;
  const name = `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || null;
  const imageUrl = userData.image_url || userData.profile_image_url || null;

  const user = await prisma.user.upsert({
    where: { id: userData.id },
    update: {
      email: email,
      name: name,
      imageUrl: imageUrl,
    },
    create: {
      id: userData.id,
      email: email,
      name: name,
      imageUrl: imageUrl,
    },
  });

  return user;
};

export const deleteUser = async (userId) => {
  const user = await prisma.user.delete({
    where: { id: userId },
  });

  return user;
};
