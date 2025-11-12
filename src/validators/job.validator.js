import { z } from "zod";

const jobUrlSchema = z
  .string({
    required_error: "job_url is required",
    invalid_type_error: "job_url must be a string",
  })
  .min(1, "job_url cannot be empty")
  .refine(
    (url) => {
      // Allow URLs with or without protocol
      // Valid: https://example.com, www.example.com, example.com
      const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(\/[^\s]*)?$/;
      return urlPattern.test(url);
    },
    { message: "Please provide a valid URL" }
  );

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

const jobIdSchema = z
  .string({
    required_error: "job_id is required",
    invalid_type_error: "job_id must be a string",
  })
  .min(1, "job_id cannot be empty");

export const optimizeJobResumeSchema = z.object({
  job_id: jobIdSchema,
});

export const generateResumeFromJsonSchema = z.object({
  job_id: jobIdSchema,
  resume_json: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    linkedin: z.string().optional(),
    location: z.string().optional(),
    summary: z.string().optional(),
    skills: z.array(z.any()).optional(),
    experience: z.array(z.any()).optional(),
    education: z.array(z.any()).optional(),
    certifications: z.array(z.any()).optional(),
    projects: z.array(z.any()).optional(),
    achievements: z.array(z.any()).optional(),
    awards: z.array(z.any()).optional(),
    interests: z.array(z.any()).optional(),
  }).passthrough(),
});
