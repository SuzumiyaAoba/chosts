import { defineCommand, runMain } from "citty";

//
// CLI
//

const main = defineCommand({
  meta: {
    name: "chosts",
    version: "0.0.2",
    description: "Manage your hosts file",
  },
  subCommands: {
    list: () => import("./commands/list.ts").then((r) => r.default),
    show: () => import("./commands/show.ts").then((r) => r.default),
    apply: () => import("./commands/apply.ts").then((r) => r.default),
    edit: () => import("./commands/edit.ts").then((r) => r.default),
  },
});

runMain(main);
