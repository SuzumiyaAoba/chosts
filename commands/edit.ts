import { defineCommand } from "citty";
import { $ } from "dax";
import { configArgs } from "@/commands/args.ts";

export default defineCommand({
  meta: {
    name: "edit",
    description: "Edit the hosts file",
  },
  args: {
    config: configArgs,
  },
  async run({ args }) {
    const editor = Deno.env.get("EDITOR")?.split(" ") ?? "open";

    await $`${editor} ${args.config}`;
  },
});
