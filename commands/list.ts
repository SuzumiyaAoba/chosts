import { defineCommand } from "citty";
import { configArgs } from "@/commands/args.ts";
import { getChostsConfig } from "@/lib/chosts/chosts.ts";
import { ChostsSetting } from "@/lib/chosts/types.ts";

export default defineCommand({
  meta: {
    name: "list",
    description: "List all hosts",
  },
  args: {
    config: configArgs,
    long: {
      type: "boolean",
      description: "List hosts in the long format.",
      alias: "l",
      default: false,
    },
    type: {
      type: "string",
      description: "List hosts of a specific type.",
      alias: "t",
      default: "all",
      valueHint: "all|hosts|remote|combined",
    },
  },
  run({ args }) {
    const config = getChostsConfig(args.config);
    const settings = Object.entries(config.chosts).filter(([_, config]) => {
      if (args.type === "all") {
        return true;
      }

      return config.type === args.type;
    });

    if (args.long) {
      longFormat(settings);
    } else {
      defaultFormat(settings);
    }
  },
});

const longFormat = (_settings: [string, ChostsSetting][]) => {
  console.log("TODO");
};

const defaultFormat = (settings: [string, ChostsSetting][]) => {
  console.log(settings.map(([name, _]) => name).join(" "));
};
