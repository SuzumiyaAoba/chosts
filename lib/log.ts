import { chalk } from "../deps.ts";

const log = console.log;
const error = (...args: unknown[]) =>
  console.error(chalk.bgRed(" ERROR "), ...args);

export { log, error };
