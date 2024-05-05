import { z } from "zod";

const hostEntrySchema = z.object({
  ip: z.string(),
  hostname: z.string(),
  aliases: z.array(z.string()).default([]),
  description: z.string().optional(),
});

const hostsSettingSchema = z.object({
  type: z.literal("hosts"),
  description: z.string().optional(),
  entries: z.array(hostEntrySchema),
});

const remoteSettingSchema = z.object({
  type: z.literal("remote"),
  description: z.string().optional(),
  url: z.string(),
});

const combinedSettingSchema = z.object({
  type: z.literal("combined"),
  description: z.string().optional(),
  settings: z.array(z.string()),
});

const chostsSettingSchema = z.union([
  hostsSettingSchema,
  remoteSettingSchema,
  combinedSettingSchema,
]);

const chostsConfigSchema = z.object({
  version: z.literal(1),
  hosts: z.string().default("/etc/hosts"),
  chosts: z.record(chostsSettingSchema),
});

export {
  chostsConfigSchema,
  chostsSettingSchema,
  combinedSettingSchema,
  hostEntrySchema,
  hostsSettingSchema,
  remoteSettingSchema,
};
