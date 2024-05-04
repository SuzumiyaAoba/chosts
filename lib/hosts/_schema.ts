import { z } from "zod";

const hostEntrySchema = z.object({
  type: z.literal("entry"),
  ip: z.string(),
  hostnames: z.array(z.string()),
  comment: z.string().optional(),
});

const hostCommentSchema = z.object({
  type: z.literal("comment"),
  comment: z.string(),
});

const hostRawSchema = z.object({
  type: z.literal("raw"),
  raw: z.string(),
});

const hostsLineSchema = z.union([
  hostEntrySchema,
  hostCommentSchema,
  hostRawSchema,
]);

const hostsSchema = z.object({
  comment: z.string().optional(),
  lines: z.array(hostsLineSchema),
});

export { hostCommentSchema, hostEntrySchema, hostsLineSchema, hostsSchema };
