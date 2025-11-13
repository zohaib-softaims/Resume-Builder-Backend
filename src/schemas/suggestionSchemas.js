/**
 * Suggestion Schemas
 * Defines the structure for AI-generated resume optimization suggestions
 */

import { z } from "zod";

/**
 * Individual Suggestion Schema (Simplified)
 */
export const suggestionItemSchema = z.object({
  section: z
    .enum(["summary", "skills", "experience", "projects", "achievements", "education", "certifications"])
    .describe("Which resume section this suggestion applies to"),
  type: z
    .enum(["add", "remove", "enhance", "rewrite"])
    .describe("Type of change suggested"),

  // What to change
  target: z.object({
    field: z
      .string()
      .describe(
        "JSON path to the field (e.g., 'skills.technical', 'experience[0].description_points[2]')"
      ),
    current: z
      .string()
      .describe("Current content in this field (empty if adding new content)"),
  }),

  // Proposed change
  proposed: z.string().describe("New or modified content"),

  // Preview
  preview: z
    .string()
    .describe(
      "One-sentence human-readable description for UI (e.g., 'Add Kubernetes to Cloud Skills')"
    ),
});

/**
 * Full Suggestions Response Schema
 */
export const suggestionsResponseSchema = z.object({
  suggestions: z
    .array(suggestionItemSchema)
    .describe("Array of all suggestions across all sections"),
  summary: z.object({
    total_suggestions: z.number(),
    estimated_match_improvement: z
      .string()
      .describe("e.g., '72% → 87%' showing before and after match rate"),
  }),
});

/**
 * OpenAI Structured Output Schema
 * Used for getLLMResponse with responseSchema parameter
 */
export const suggestionOpenAISchema = {
  type: "object",
  properties: {
    suggestions: {
      type: "array",
      description: "Array of all suggestions across all sections",
      items: {
        type: "object",
        properties: {
          section: {
            type: "string",
            enum: ["summary", "skills", "experience", "projects", "achievements", "education", "certifications"],
            description: "Resume section this suggestion applies to",
          },
          type: {
            type: "string",
            enum: ["add", "remove", "enhance", "rewrite"],
            description:
              "Type of change: add = add new content, remove = remove content, enhance = improve existing, rewrite = rewrite section",
          },
          target: {
            type: "object",
            properties: {
              field: {
                type: "string",
                description:
                  "JSON path to the field (e.g., 'skills.technical', 'experience[0].description_points[2]')",
              },
              current: {
                type: "string",
                description:
                  "Current content in this field (empty string if adding new content)",
              },
            },
            required: ["field", "current"],
            additionalProperties: false,
          },
          proposed: {
            type: "string",
            description: "New or modified content",
          },
          preview: {
            type: "string",
            description:
              "One-sentence human-readable summary for UI (e.g., 'Add Kubernetes and Redis to skills section')",
          },
        },
        required: ["section", "type", "target", "proposed", "preview"],
        additionalProperties: false,
      },
    },
  },
  required: ["suggestions"],
  additionalProperties: false,
};

/**
 * Accepted Suggestions Schema
 * Used when user submits their selections
 */
export const acceptedSuggestionsSchema = z.object({
  job_id: z.string(),
  accepted_suggestion_ids: z.array(z.string()),
});

/**
 * Type definitions for TypeScript-like autocomplete
 */
export const SuggestionTypes = {
  ADD: "add",
  REMOVE: "remove",
  ENHANCE: "enhance",
  REWRITE: "rewrite",
};

export const SuggestionSections = {
  SUMMARY: "summary",
  SKILLS: "skills",
  EXPERIENCE: "experience",
  PROJECTS: "projects",
  ACHIEVEMENTS: "achievements",
  EDUCATION: "education",
  CERTIFICATIONS: "certifications",
};
