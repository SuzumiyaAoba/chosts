import { z } from "#deps";
import * as schema from "./_schema.ts";

type HostEntry = z.infer<typeof schema.hostEntrySchema>;

type HostsComment = z.infer<typeof schema.hostCommentSchema>;

type HostsLine = z.infer<typeof schema.hostsLineSchema>;

type Hosts = z.infer<typeof schema.hostsSchema>;

export type { HostEntry, HostsComment, HostsLine, Hosts };
