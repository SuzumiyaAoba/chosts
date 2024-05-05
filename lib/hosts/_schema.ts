import { z } from "zod";

const hostEntrySchema = z.object({
  type: z.literal("entry"),
  ip: z.string(),
  hostname: z.string(),
  aliases: z.array(z.string()).default([]),
  comment: z.string().optional(),
});

const hostCommentSchema = z.object({
  type: z.literal("comment"),
  comment: z.string(),
  level: z.number().default(1),
});

const hostEmptySchema = z.object({
  type: z.literal("empty"),
});

const hostsLineSchema = z.union([
  hostEntrySchema,
  hostEmptySchema,
  hostCommentSchema,
]);

const hostsSchema = z.object({
  lines: z.array(hostsLineSchema),
});

export { hostCommentSchema, hostEntrySchema, hostsLineSchema, hostsSchema };
