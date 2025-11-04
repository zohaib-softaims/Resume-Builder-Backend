import { createUser, updateUser, deleteUser } from "../services/auth.service.js";
import { catchAsync } from "../utils/error.js";
import logger from "../lib/logger.js";

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
