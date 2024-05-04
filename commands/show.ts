import { defineCommand } from "citty";
import boxen from "boxen";
import chalk from "chalk";
import { chostsSettingToHostsString, getChosts } from "@/lib/chosts.ts";
import { readCurrentHosts } from "@/lib/hosts/_hosts.ts";
import { log } from "@/lib/log.ts";
import { configArgs } from "@/commands/args.ts";

export default defineCommand({
  meta: {
    name: "show",
    description: "Show a specific host",
  },
  args: {
    config: configArgs,
  },
  run({ args, rawArgs }) {
    const chosts = getChosts(args.config);

    if (rawArgs.length === 0) {
      log(chalk.inverse(" File:", chalk.bold("/etc/hosts ")));
      log(boxen(readCurrentHosts(), { borderStyle: "double" }));
      return;
    }

    for (const arg of rawArgs) {
      const config = chosts.settings.find((config) => config.name === arg);
      if (config === undefined) {
        console.error(`Host ${arg} not found.`);
        continue;
      }

      log(chalk.bold.inverse(" Name "));
      log(config.name);
      log();
      log(chalk.bold.inverse(" Description "));
      log(config.description);
      log();

      log(chalk.bold.inverse(" hosts "));
      log(
        boxen(chostsSettingToHostsString(chosts, config), {
          borderStyle: "double",
        })
      );
    }
  },
});
