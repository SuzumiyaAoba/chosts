import { defineCommand } from "../deps.ts";
import { ChostsSetting, getChosts } from "../lib/chosts.ts";

export default defineCommand({
  meta: {
    name: "list",
    description: "List all hosts",
  },
  args: {
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
    const chosts = getChosts();
    const settings = (chosts.settings = chosts.settings.filter((config) => {
      if (args.type === "all") {
        return true;
      }

      return config.type === args.type;
    }));

    if (args.long) {
      longFormat(settings);
    } else {
      defaultFormat(settings);
    }
  },
});

const longFormat = (settings: ChostsSetting[]) => {
  console.log("TODO");
};

const defaultFormat = (settings: ChostsSetting[]) => {
  console.log(settings.map((config) => config.name).join(" "));
};
