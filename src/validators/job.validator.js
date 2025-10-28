import { z } from "zod";

const jobUrlSchema = z
  .string({
    required_error: "job_url is required",
    invalid_type_error: "job_url must be a string",
  })
  .url("Please provide a valid URL");

export const scrapJobSchema = z.object({
  job_url: jobUrlSchema,
});
