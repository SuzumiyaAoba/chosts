import { chalk } from "#deps";

const log = console.log;
const error = (...args: unknown[]) =>
  console.error(chalk.bgRed(" ERROR "), ...args);

export { error, log };
