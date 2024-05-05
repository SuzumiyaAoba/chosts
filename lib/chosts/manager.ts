import * as path from "std/path/mod.ts";
import * as yaml from "yaml";
import { hostsToString } from "@/lib/hosts/_hosts.ts";
import { Hosts, HostsLine } from "@/lib/hosts/types.ts";
import {
  ChostsConfig,
  Chosts,
  CombinedChosts,
  HostEntry,
  HostsChosts,
} from "./types.ts";
import { chostsConfigSchema, chostsSchema } from "./_schema.ts";
import { error } from "@/lib/log.ts";

class ChostsManager {
  readonly #configDir: string;
  readonly #config: ChostsConfig;

  constructor(configPath: string) {
    this.#configDir = path.dirname(configPath);
    this.#config = this.readChostsConfig(configPath);
  }

  names(): string[] {
    return Array.from(Deno.readDirSync(this.chostsDir())).map(
      (entry) => path.parse(entry.name).name
    );
  }

  getConfig(): ChostsConfig {
    return this.#config;
  }

  getChosts(name: string): Chosts {
    const path = this.chostsPath(name);
    if (!Deno.statSync(path)) {
      error(`Chosts file not found: ${path}`);
      Deno.exit(1);
    }

    const chostsText = Deno.readTextFileSync(path);

    return chostsSchema.parse(yaml.parse(chostsText));
  }

  getAllChosts(): Record<string, Chosts> {
    return Object.fromEntries(
      this.names().map((name) => [name, this.getChosts(name)])
    );
  }

  addChosts(name: string, chosts: Chosts): void {
    const chostsPath = this.chostsPath(name);
    if (Deno.statSync(chostsPath)) {
      error(`Chosts file already exists: ${chostsPath}`);
      Deno.exit(1);
    }

    Deno.writeTextFileSync(chostsPath, yaml.stringify(chosts));
  }

  updateChosts(name: string, chosts: Chosts): void {
    const chostsPath = this.chostsPath(name);
    if (!Deno.statSync(chostsPath)) {
      error(`Chosts file not found: ${chostsPath}`);
      Deno.exit(1);
    }

    Deno.writeTextFileSync(chostsPath, yaml.stringify(chosts));
  }

  deleteChosts(name: string): void {
    const chostsPath = this.chostsPath(name);
    if (!Deno.statSync(chostsPath)) {
      error(`Chosts file not found: ${chostsPath}`);
      Deno.exit(1);
    }

    Deno.removeSync(chostsPath);
  }

  getHosts(name: string): Hosts[] {
    return chostsSettingToHosts(name, this);
  }

  getHostsAsString(name: string): string {
    const hosts = this.getHosts(name);
    return hosts.map((hosts) => hostsToString(hosts)).join("\n\n");
  }

  private readChostsConfig = (
    configPath = `${Deno.env.get("HOME")}/.config/chosts/config.yaml`
  ): ChostsConfig => {
    if (!Deno.statSync(configPath)) {
      error(`Config file not found: ${configPath}`);
      Deno.exit(1);
    }

    const configText = Deno.readTextFileSync(configPath);

    return chostsConfigSchema.parse(yaml.parse(configText));
  };

  chostsDir = (): string => {
    return path.resolve(this.#configDir, this.#config.chosts);
  };

  chostsPath = (name: string): string => {
    return path.resolve(this.chostsDir(), `${name}.yaml`);
  };
}

//
// Chosts to Hosts
//

const hostsEntryToLine = (entry: HostEntry): HostsLine => {
  return {
    type: "entry",
    ip: entry.ip,
    hostname: entry.hostname,
    aliases: entry.aliases,
    comment: entry.description,
  };
};

const hostsSettingToHosts = (chosts: HostsChosts): Hosts => {
  const header =
    chosts.description
      ?.split("\n")
      .map((comment) => ({ type: "comment", comment, level: 1 } as const)) ??
    [];
  return {
    lines: [
      ...header,
      ...chosts.entries.map((entry) => hostsEntryToLine(entry)),
    ],
  };
};

const combinedSettingToHosts = (
  chosts: CombinedChosts,
  manager: ChostsManager
): Hosts[] => {
  const hosts = {
    type: "hosts",
    lines:
      chosts.description?.split("\n").map(
        (comment) =>
          ({
            type: "comment",
            comment,
            level: 1,
          } as const)
      ) ?? [],
  };

  const settings = chosts.settings.map((name) => manager.getChosts(name));
  if (settings.some((config) => config.type === "combined")) {
    throw new Error(
      "Combined settings cannot contain other combined settings."
    );
  }

  const combinedHosts = chosts.settings.flatMap((name) =>
    chostsSettingToHosts(name, manager)
  );

  return [hosts, ...combinedHosts];
};

const chostsSettingToHosts = (
  name: string,
  manager: ChostsManager
): Hosts[] => {
  const chosts = manager.getChosts(name);

  switch (chosts.type) {
    case "hosts":
      return [hostsSettingToHosts(chosts)];
    case "combined":
      return combinedSettingToHosts(chosts, manager);
  }
};

//
// exports
//

export { ChostsManager };
