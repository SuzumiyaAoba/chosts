import { defineCommand } from "citty";
import boxen from "boxen";
import chalk from "chalk";
import { ChostsManager } from "../lib/chosts/manager.ts";
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
    const manager = new ChostsManager(args.config);
    const names = rawArgs.filter((arg) => !arg.startsWith("-"));

    if (names.length === 0) {
      log(chalk.inverse(" File:", chalk.bold("/etc/hosts ")));
      log(
        boxen(readCurrentHosts(manager.getConfig().hosts), {
          borderStyle: "double",
        })
      );
      return;
    }

    for (const name of names) {
      const setting = manager.getChosts(name);
      if (setting === undefined) {
        console.error(chalk.bold(name), `not found.`);
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
        boxen(manager.getHostsAsString(name), {
          borderStyle: "double",
        })
      );
    }
  },
});
