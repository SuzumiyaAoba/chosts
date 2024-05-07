import { defineCommand } from "citty";
import { configArgs } from "@/commands/args.ts";
import { ChostsManager } from "../lib/chosts/manager.ts";
import { Chosts } from "@/lib/chosts/types.ts";

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
      valueHint: "all|hosts|combined",
    },
  },
  run({ args }) {
    const manager = new ChostsManager(args.config);
    const settings = Object.entries(manager.getAllChosts()).filter(
      ([_, config]) => {
        if (args.type === "all") {
          return true;
        }

        return config.type === args.type;
      },
    );

    if (args.long) {
      longFormat(settings);
    } else {
      defaultFormat(settings);
    }
  },
});

const longFormat = (_settings: [string, Chosts][]) => {
  console.log("TODO");
};

const defaultFormat = (settings: [string, Chosts][]) => {
  console.log(settings.map(([name, _]) => name).join(" "));
};
