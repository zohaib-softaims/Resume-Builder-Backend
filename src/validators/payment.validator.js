import { z } from "zod";

export const createCheckoutSchema = z.object({
  resume_id: z
    .string({
      required_error: "resume_id is required",
      invalid_type_error: "resume_id must be a string",
    })
    .min(1, "resume_id cannot be empty"),
});

export const getPaymentStatusSchema = z.object({
  resume_id: z
    .string({
      required_error: "resume_id is required",
      invalid_type_error: "resume_id must be a string",
    })
    .min(1, "resume_id cannot be empty"),
});

