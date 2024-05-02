import { $, defineCommand } from "../deps.ts";

export default defineCommand({
  meta: {
    name: "edit",
    description: "Edit the hosts file",
  },
  async run() {
    const editor = Deno.env.get("EDITOR")?.split(" ") ?? "open";
    const home = Deno.env.get("HOME") ?? "~";

    await $`${editor} ${home}/.config/chosts/config.yaml`;
  },
});
