import { createUser, updateUser, deleteUser } from "../services/auth.service.js";

export const clerkWebhook = async (req, res, next) => {
  const { type, data } = req.body;
  console.log("body", req.body);
  switch (type) {
    case "user.created":
      await createUser(data);
      console.log(`User created: ${data.id}`);
      break;

    case "user.updated":
      await updateUser(data);
      console.log(`User updated: ${data.id}`);
      break;

    case "user.deleted":
      await deleteUser(data.id);
      console.log(`User deleted: ${data.id}`);
      break;

    default:
      console.log(`Unhandled webhook event type: ${type}`);
  }

  return res.status(200).json({ success: true, message: "Webhook processed" });
};
