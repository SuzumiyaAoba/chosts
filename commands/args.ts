import { StringArgDef } from "citty";

const configArgs = {
  type: "string",
  description: "Path to the config file",
  alias: "c",
  default: `${Deno.env.get("HOME")}/.config/chosts/config.yaml`,
  valueHint: "FILE",
} satisfies StringArgDef;

export { configArgs };
