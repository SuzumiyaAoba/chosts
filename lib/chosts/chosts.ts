import * as yaml from "yaml";
import { produce } from "immer";
import { readCache, saveCache } from "@/lib/cache.ts";
import { hostsToString } from "@/lib/hosts/_hosts.ts";
import { Hosts, HostsLine } from "@/lib/hosts/types.ts";
import {
  ChostsConfig,
  ChostsSetting,
  CombinedSetting,
  HostEntry,
  HostsSetting,
  RemoteSetting,
} from "./types.ts";
import { chostsConfigSchema } from "./_schema.ts";

const getChostsConfig = (
  configPath = `${Deno.env.get("HOME")}/.config/chosts/config.yaml`,
): ChostsConfig => {
  if (!Deno.stat(configPath)) {
    console.error(`Config file not found: ${configPath}`);
    Deno.exit(1);
  }

  const configText = Deno.readTextFileSync(configPath);

  return chostsConfigSchema.parse(yaml.parse(configText));
};

const deleteChostsConfig = (configPath: string) => {
  if (!Deno.stat(configPath)) {
    console.error(`Config file not found: ${configPath}`);
    Deno.exit(1);
  }

  Deno.removeSync(configPath);
};

const deleteChosts = (config: ChostsConfig, name: string) => {
  return produce(config, (draft) => {
    delete draft.chosts[name];
  });
};

const addChosts = (
  name: string,
  config: ChostsConfig,
  setting: HostsSetting | RemoteSetting | CombinedSetting,
) => {
  return produce(config, (draft) => {
    draft.chosts[name] = setting;
  });
};

const updateChosts = (
  name: string,
  config: ChostsConfig,
  setting: HostsSetting | RemoteSetting | CombinedSetting,
) => {
  return produce(config, (draft) => {
    draft.chosts[name] = setting;
  });
};

//
// Remote
//

const fetchRemoteHosts = async (
  name: string,
  setting: RemoteSetting,
): Promise<string> => {
  const response = await fetch(setting.url);
  const text = await response.text();

  saveCache(name, text);

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

const remoteSettingToHosts = (name: string, setting: RemoteSetting): Hosts => {
  return {
    comment: setting.description,
    lines: [
      {
        type: "raw",
        raw: readCachedRemoteHosts(name) ?? "",
      },
    ],
  };
};

const combinedSettingToHosts = (
  setting: CombinedSetting,
  config: ChostsConfig,
): Hosts[] => {
  const hosts: Hosts = {
    comment: setting.description,
    lines: [],
  } as const;

  const settings = setting.settings.map((name) => config.chosts[name]);
  if (settings.some((config) => config.type === "combined")) {
    throw new Error(
      "Combined settings cannot contain other combined settings.",
    );
  }

  const combinedHosts = setting.settings.flatMap((name) =>
    chostsSettingToHosts(name, setting, config)
  );

  return [hosts, ...combinedHosts];
};

const chostsSettingToHosts = (
  name: string,
  setting: ChostsSetting,
  config: ChostsConfig,
): Hosts[] => {
  switch (setting.type) {
    case "hosts":
      return [hostsSettingToHosts(setting)];
    case "remote":
      return [remoteSettingToHosts(name, setting)];
    case "combined":
      return combinedSettingToHosts(setting, config);
  }
};

const chostsSettingToHostsString = (
  name: string,
  setting: ChostsSetting,
  config: ChostsConfig,
): string => {
  const hosts = chostsSettingToHosts(name, setting, config);

  return hosts.map((hosts) => hostsToString(hosts)).join("\n\n");
};

//
// exports
//

export {
  addChosts,
  chostsSettingToHosts,
  chostsSettingToHostsString,
  deleteChosts,
  deleteChostsConfig,
  fetchRemoteHosts,
  getChostsConfig,
  readCachedRemoteHosts,
  updateChosts,
};
