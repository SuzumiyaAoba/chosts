import { z } from "#deps";
import { yaml } from "#deps";
import { produce } from "#deps";
import { readCache, saveCache } from "./cache.ts";
import { hostsToString } from "./hosts/_hosts.ts";
import { Hosts, HostsLine } from "./hosts/types.ts";

//
// Schema
//

const hostEntrySchema = z.object({
  ip: z.string(),
  hostnames: z.array(z.string()),
  description: z.string().optional(),
});

type HostEntry = z.infer<typeof hostEntrySchema>;

const hostsSettingSchema = z.object({
  type: z.literal("hosts"),
  name: z.string(),
  description: z.string().optional(),
  entries: z.array(hostEntrySchema),
});

type HostsSetting = z.infer<typeof hostsSettingSchema>;

const remoteSettingSchema = z.object({
  type: z.literal("remote"),
  name: z.string(),
  description: z.string().optional(),
  url: z.string(),
});

type RemoteSetting = z.infer<typeof remoteSettingSchema>;

const combinedSettingSchema = z.object({
  type: z.literal("combined"),
  name: z.string(),
  description: z.string().optional(),
  settings: z.array(z.string()),
});

type CombinedSetting = z.infer<typeof combinedSettingSchema>;

const chostsSettingSchema = z.union([
  hostsSettingSchema,
  remoteSettingSchema,
  combinedSettingSchema,
]);

type ChostsSetting = z.infer<typeof chostsSettingSchema>;

const chostsSchema = z.object({
  version: z.literal(1),
  settings: z.array(chostsSettingSchema),
});

type Chosts = z.infer<typeof chostsSchema>;

//
// Chosts
//

type ChostsConfig = {
  configDir: string;
};

const DEFAULT_CHOSTS_CONFIG: ChostsConfig = {
  configDir: `${Deno.env.get("HOME")}/.config/chosts`,
} as const;

const getChosts = (
  chostsConfig: ChostsConfig = DEFAULT_CHOSTS_CONFIG
): Chosts => {
  const configPath = `${chostsConfig.configDir}/config.yaml`;

  if (!Deno.stat(configPath)) {
    console.error(`Config file not found: ${configPath}`);
    Deno.exit(1);
  }

  const configText = Deno.readTextFileSync(configPath);

  return chostsSchema.parse(yaml.parse(configText));
};

const deleteChostsConfig = (chostsConfig: ChostsConfig) => {
  const configPath = `${chostsConfig.configDir}/config.yaml`;

  if (!Deno.stat(configPath)) {
    console.error(`Config file not found: ${configPath}`);
    Deno.exit(1);
  }

  Deno.removeSync(configPath);
};

const deleteChosts = (chosts: Chosts, name: string) => {
  return produce(chosts, (draft) => {
    draft.settings = chosts.settings.filter((config) => config.name !== name);
  });
};

const addChosts = (
  chosts: Chosts,
  config: HostsSetting | RemoteSetting | CombinedSetting
) => {
  return produce(chosts, (draft) => {
    draft.settings.push(config);
  });
};

const updateChosts = (
  chosts: Chosts,
  name: string,
  config: HostsSetting | RemoteSetting | CombinedSetting
) => {
  return produce(chosts, (draft) => {
    const index = draft.settings.findIndex((config) => config.name === name);
    draft.settings[index] = config;
  });
};

//
// Remote
//

const fetchRemoteHosts = async (setting: RemoteSetting): Promise<string> => {
  const response = await fetch(setting.url);
  const text = await response.text();

  saveCache(setting.name, text);

  return text;
};

const readCachedRemoteHosts = (name: string): string | undefined => {
  return readCache(name);
};

//
// Chosts to Hosts
//

const entryToLine = (entry: HostEntry): HostsLine => {
  return {
    type: "entry",
    ip: entry.ip,
    hostnames: entry.hostnames,
    comment: entry.description,
  };
};

const hostsSettingToHosts = (setting: HostsSetting): Hosts => {
  return {
    comment: setting.description,
    lines: setting.entries.map((entry) => entryToLine(entry)),
  };
};

const remoteSettingToHosts = (settings: RemoteSetting): Hosts => {
  return {
    comment: settings.description,
    lines: [
      {
        type: "raw",
        raw: readCachedRemoteHosts(settings.name) ?? "",
      },
    ],
  };
};

const combinedSettingToHosts = (
  chosts: Chosts,
  setting: CombinedSetting
): Hosts[] => {
  const hosts: Hosts = {
    comment: setting.description,
    lines: [],
  } as const;

  const names = new Set(setting.settings);
  const settings = chosts.settings.filter((config) => names.has(config.name));

  if (settings.some((config) => config.type === "combined")) {
    throw new Error(
      "Combined settings cannot contain other combined settings."
    );
  }

  const combinedHosts = settings.flatMap((config) =>
    chostsSettingToHosts(chosts, config)
  );

  return [hosts, ...combinedHosts];
};

const chostsSettingToHosts = (
  chosts: Chosts,
  setting: ChostsSetting
): Hosts[] => {
  switch (setting.type) {
    case "hosts":
      return [hostsSettingToHosts(setting)];
    case "remote":
      return [remoteSettingToHosts(setting)];
    case "combined":
      return combinedSettingToHosts(chosts, setting);
  }
};

const chostsSettingToHostsString = (
  chosts: Chosts,
  setting: ChostsSetting
): string => {
  const hosts = chostsSettingToHosts(chosts, setting);

  return hosts.map((hosts) => hostsToString(hosts)).join("\n\n");
};

//
// exports
//

export type {
  Chosts,
  ChostsConfig,
  ChostsSetting,
  CombinedSetting,
  HostsSetting,
  RemoteSetting,
};
export {
  addChosts,
  chostsSettingToHosts,
  chostsSettingToHostsString,
  readCachedRemoteHosts,
  fetchRemoteHosts,
  DEFAULT_CHOSTS_CONFIG,
  deleteChosts,
  deleteChostsConfig,
  getChosts,
  updateChosts,
};
