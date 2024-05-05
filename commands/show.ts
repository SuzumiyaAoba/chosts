import { defineCommand } from "citty";
import boxen from "boxen";
import chalk from "chalk";
import {
  chostsSettingToHostsString,
  getChostsConfig,
} from "../lib/chosts/chosts.ts";
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
    const names = rawArgs.filter((arg) => !arg.startsWith("-"));
    if (names.length === 0) {
      log(chalk.inverse(" File:", chalk.bold("/etc/hosts ")));
      log(boxen(readCurrentHosts(), { borderStyle: "double" }));
      return;
    }

    const config = getChostsConfig(args.config);
    for (const name of names) {
      const setting = config.chosts[name];
      if (config === undefined) {
        console.error(`Host ${name} not found.`);
        continue;
      }

      log(chalk.bold.inverse(" Name "));
      log(name);
      log();
      log(chalk.bold.inverse(" Description "));
      log(setting.description);
      log();

      log(chalk.bold.inverse(" hosts "));
      log(
        boxen(chostsSettingToHostsString(name, setting, config), {
          borderStyle: "double",
        }),
      );
    }
  },
});
