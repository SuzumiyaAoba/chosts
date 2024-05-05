import { z } from "zod";
import {
  chostsConfigSchema,
  chostsSchema,
  combinedChostsSchema,
  hostEntrySchema,
  hostsChostsSchema,
} from "./_schema.ts";

type HostEntry = z.infer<typeof hostEntrySchema>;

type HostsChosts = z.infer<typeof hostsChostsSchema>;

type CombinedChosts = z.infer<typeof combinedChostsSchema>;

type Chosts = z.infer<typeof chostsSchema>;

type ChostsConfig = z.infer<typeof chostsConfigSchema>;

export type { ChostsConfig, Chosts, CombinedChosts, HostEntry, HostsChosts };
