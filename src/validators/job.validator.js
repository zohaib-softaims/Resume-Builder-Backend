import { z } from "zod";

const jobUrlSchema = z
  .string({
    required_error: "job_url is required",
    invalid_type_error: "job_url must be a string",
  })
  .url("Please provide a valid URL");

const resumeIdSchema = z
  .string({
    required_error: "resume_id is required",
    invalid_type_error: "resume_id must be a string",
  })
  .min(1, "resume_id cannot be empty");

export const scrapJobSchema = z.object({
  job_url: jobUrlSchema,
  resume_id: resumeIdSchema.optional(),
});
