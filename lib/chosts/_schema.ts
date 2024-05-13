import { z } from "zod";

const hostEntrySchema = z.object({
  ip: z.string(),
  hostname: z.string(),
  aliases: z.array(z.string()).default([]),
  description: z.string().optional(),
});

const hostsChostsSchema = z.object({
  type: z.literal("hosts"),
  description: z.string().optional(),
  url: z.string().optional(),
  entries: z.array(hostEntrySchema),
});

const combinedChostsSchema = z.object({
  type: z.literal("combined"),
  description: z.string().optional(),
  settings: z.array(z.string()),
});

const chostsSchema = z.union([hostsChostsSchema, combinedChostsSchema]);

const chostsConfigSchema = z.object({
  version: z.literal(1),
  hosts: z.string().default("/etc/hosts"),
  chosts: z.string().default("./chosts"),
});

export {
  chostsConfigSchema,
  chostsSchema,
  combinedChostsSchema,
  hostEntrySchema,
  hostsChostsSchema,
};
