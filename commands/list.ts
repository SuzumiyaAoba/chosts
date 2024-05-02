import { defineCommand } from "../deps.ts";
import { Chosts, getChosts } from "../lib/chosts.ts";

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
  },
  run({ args }) {
    const chosts = getChosts();

    if (args.long) {
      longFormat(chosts);
    } else {
      defaultFormat(chosts);
    }
  },
});

const longFormat = (chosts: Chosts) => {
  console.log("TODO");
};

const defaultFormat = (chosts: Chosts) => {
  console.log(chosts.settings.map((config) => config.name).join(" "));
};
