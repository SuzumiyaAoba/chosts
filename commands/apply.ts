import { chalk, defineCommand } from "../deps.ts";
import { chostsSettingToHostsString, getChosts } from "../lib/chosts.ts";
import { writeHosts } from "../lib/hosts/_hosts.ts";
import { clearDnsCache } from "./lib/hosts/darwin.ts";
import { error } from "../lib/log.ts";

export default defineCommand({
  meta: {
    name: "apply",
    description: "Apply a specific host",
  },
  run({ rawArgs }) {
    if (rawArgs.length === 0) {
      error("You must specify a host to apply.");
      return;
    }

    if (rawArgs.length > 1) {
      error("You can only apply one host at a time.");
      return;
    }

    const chosts = getChosts();
    const setting = chosts.settings.find(
      (config) => config.name === rawArgs[0]
    );

    if (setting === undefined) {
      error(chalk.bold(rawArgs[0]), `not found.`);
      return;
    }

    writeHosts(chostsSettingToHostsString(chosts, setting));

    clearDnsCache();
  },
});
