import { z } from "zod";
import {
  hostCommentSchema,
  hostEntrySchema,
  hostsLineSchema,
  hostsSchema,
} from "./_schema.ts";

type HostEntry = z.infer<typeof hostEntrySchema>;

type HostsComment = z.infer<typeof hostCommentSchema>;

type HostsLine = z.infer<typeof hostsLineSchema>;

type Hosts = z.infer<typeof hostsSchema>;

export type { HostEntry, Hosts, HostsComment, HostsLine };
