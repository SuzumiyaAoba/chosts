import { defineCommand } from "citty";
import chalk from "chalk";
import {
  chostsSettingToHostsString,
  getChostsConfig,
} from "@/lib/chosts/chosts.ts";
import { writeHosts } from "@/lib/hosts/_hosts.ts";
import { clearDnsCache } from "@/lib/hosts/darwin.ts";
import { error } from "@/lib/log.ts";
import { configArgs } from "@/commands/args.ts";

export default defineCommand({
  meta: {
    name: "apply",
    description: "Apply a specific host",
  },
  args: {
    config: configArgs,
  },
  run({ args, rawArgs }) {
    if (rawArgs.length === 0) {
      error("You must specify a host to apply.");
      return;
    }

    if (rawArgs.length > 1) {
      error("You can only apply one host at a time.");
      return;
    }

    const config = getChostsConfig(args.config);
    const name = rawArgs[0];
    const setting = config.chosts[name];

    if (setting === undefined) {
      error(chalk.bold(rawArgs[0]), `not found.`);
      return;
    }

    writeHosts(chostsSettingToHostsString(name, setting, config), config.hosts);

    clearDnsCache();
  },
});
