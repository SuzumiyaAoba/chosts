import { z } from "zod";
import {
  chostsConfigSchema,
  chostsSettingSchema,
  combinedSettingSchema,
  hostEntrySchema,
  hostsSettingSchema,
  remoteSettingSchema,
} from "./_schema.ts";

type HostEntry = z.infer<typeof hostEntrySchema>;

type HostsSetting = z.infer<typeof hostsSettingSchema>;

type RemoteSetting = z.infer<typeof remoteSettingSchema>;

type CombinedSetting = z.infer<typeof combinedSettingSchema>;

type ChostsSetting = z.infer<typeof chostsSettingSchema>;

type ChostsConfig = z.infer<typeof chostsConfigSchema>;

export type {
  ChostsConfig,
  ChostsSetting,
  CombinedSetting,
  HostEntry,
  HostsSetting,
  RemoteSetting,
};
