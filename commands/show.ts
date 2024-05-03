import { boxen, chalk, defineCommand } from "../deps.ts";
import { chostsSettingToHostsString, getChosts } from "../lib/chosts.ts";
import { readCurrentHosts } from "../lib/hosts.ts";
import { log } from "../lib/log.ts";

export default defineCommand({
  meta: {
    name: "show",
    description: "Show a specific host",
  },
  args: {
    name: {
      type: "string",
      description: "The name of the host to show.",
    },
  },
  run({ rawArgs }) {
    const chosts = getChosts();

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
