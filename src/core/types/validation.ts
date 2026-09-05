// Zod runtime validation for inputs crossing a trust boundary
// (MCP tool args, dashboard form submissions).

import { z } from "zod";

const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, hyphen-separated");

export const postStatusSchema = z.enum(["draft", "scheduled", "published"]);

// --- Auth ---

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Username can only contain lowercase letters, numbers, and hyphens");

export const signupSchema = z.object({
  email: z.string().email(),
  username: usernameSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
export type LoginSchemaInput = z.infer<typeof loginSchema>;

// --- Posts ---

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  contentMd: z.string().max(200_000).optional().default(""),
  slug: slugSchema.optional(),
});
export type CreatePostSchemaInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = z
  .object({
    title: z.string().min(1).max(300).optional(),
    contentMd: z.string().max(200_000).optional(),
    slug: slugSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
export type UpdatePostSchemaInput = z.infer<typeof updatePostSchema>;

export const publishPostSchema = z.object({
  id: z.string().min(1),
});

export const schedulePostSchema = z.object({
  id: z.string().min(1),
  scheduledAt: z.string().datetime({ message: "scheduledAt must be ISO 8601" }),
});

export const unpublishPostSchema = z.object({
  id: z.string().min(1),
});

// --- SEO ---

export const manageSeoSchema = z
  .object({
    id: z.string().min(1),
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(200).optional(),
    slug: slugSchema.optional(),
  })
  .refine(
    (data) =>
      data.metaTitle !== undefined ||
      data.metaDescription !== undefined ||
      data.slug !== undefined,
    { message: "At least one SEO field must be provided" }
  );
export type ManageSeoSchemaInput = z.infer<typeof manageSeoSchema>;

// --- Analytics ---

export const getAnalyticsSchema = z.object({
  postId: z.string().min(1).optional(),
  rangeStart: z.string().datetime().optional(),
  rangeEnd: z.string().datetime().optional(),
});
export type GetAnalyticsSchemaInput = z.infer<typeof getAnalyticsSchema>;