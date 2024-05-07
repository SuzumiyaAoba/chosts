import * as path from "std/path/mod.ts";
import * as yaml from "yaml";
import { hostsToString } from "@/lib/hosts/_hosts.ts";
import { Hosts } from "@/lib/hosts/types.ts";
import { Chosts, ChostsConfig } from "./types.ts";
import { chostsConfigSchema, chostsSchema } from "./_schema.ts";
import { error } from "@/lib/log.ts";
import { chostsToHosts, hashSync } from "./_utils.ts";

class ChostsManager {
  readonly #configDir: string;
  readonly #config: ChostsConfig;

  constructor(configPath: string) {
    this.#configDir = path.dirname(configPath);
    this.#config = this.readChostsConfig(configPath);
  }

  names(): string[] {
    return Array.from(Deno.readDirSync(this.chostsDir())).map(
      (entry) => path.parse(entry.name).name,
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
      this.names().map((name) => [name, this.getChosts(name)]),
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
    return chostsToHosts(name, this);
  }

  getHostsAsString(name: string): string {
    const hosts = this.getHosts(name);
    const hostsString = hosts.map((hosts) => hostsToString(hosts)).join("\n\n");
    const header = `# ---\n# name: ${name}\n# hash: ${
      hashSync(
        hostsString,
      )
    }\n# --- \n\n`;

    return header + hostsString;
  }

  private readChostsConfig = (
    configPath = `${Deno.env.get("HOME")}/.config/chosts/config.yaml`,
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

export { ChostsManager };
