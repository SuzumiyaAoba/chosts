import * as yaml from "yaml";
import { produce } from "immer";
import { readCache, saveCache } from "@/lib/cache.ts";
import { hostsToString } from "@/lib/hosts/_hosts.ts";
import { Hosts, HostsLine } from "@/lib/hosts/types.ts";
import {
  Chosts,
  ChostsSetting,
  CombinedSetting,
  HostEntry,
  HostsSetting,
  RemoteSetting,
} from "./types.ts";
import { chostsSchema } from "./_schema.ts";

type ChostsConfig = {
  configDir: string;
};

const getChosts = (
  configPath = `${Deno.env.get("HOME")}/.config/chosts/config.yaml`
): Chosts => {
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
    delete draft.chosts[name];
  });
};

const addChosts = (
  name: string,
  chosts: Chosts,
  config: HostsSetting | RemoteSetting | CombinedSetting
) => {
  return produce(chosts, (draft) => {
    draft.chosts[name] = config;
  });
};

const updateChosts = (
  name: string,
  chosts: Chosts,
  config: HostsSetting | RemoteSetting | CombinedSetting
) => {
  return produce(chosts, (draft) => {
    draft.chosts[name] = config;
  });
};

//
// Remote
//

const fetchRemoteHosts = async (
  name: string,
  setting: RemoteSetting
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

const remoteSettingToHosts = (name: string, settings: RemoteSetting): Hosts => {
  return {
    comment: settings.description,
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
  chosts: Chosts
): Hosts[] => {
  const hosts: Hosts = {
    comment: setting.description,
    lines: [],
  } as const;

  const settings = setting.settings.map((name) => chosts.chosts[name]);
  if (settings.some((config) => config.type === "combined")) {
    throw new Error(
      "Combined settings cannot contain other combined settings."
    );
  }

  const combinedHosts = setting.settings.flatMap((name) =>
    chostsSettingToHosts(name, setting, chosts)
  );

  return [hosts, ...combinedHosts];
};

const chostsSettingToHosts = (
  name: string,
  setting: ChostsSetting,
  chosts: Chosts
): Hosts[] => {
  switch (setting.type) {
    case "hosts":
      return [hostsSettingToHosts(setting)];
    case "remote":
      return [remoteSettingToHosts(name, setting)];
    case "combined":
      return combinedSettingToHosts(setting, chosts);
  }
};

const chostsSettingToHostsString = (
  name: string,
  setting: ChostsSetting,
  chosts: Chosts
): string => {
  const hosts = chostsSettingToHosts(name, setting, chosts);

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
  getChosts,
  readCachedRemoteHosts,
  updateChosts,
};
