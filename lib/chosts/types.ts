import { z } from "zod";
import {
  chostsSchema,
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

type Chosts = z.infer<typeof chostsSchema>;

export type {
  Chosts,
  ChostsSetting,
  CombinedSetting,
  HostEntry,
  HostsSetting,
  RemoteSetting,
};
