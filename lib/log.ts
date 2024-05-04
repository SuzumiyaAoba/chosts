import chalk from "chalk";

const log = console.log;
const error = (...args: unknown[]) =>
  console.error(chalk.bgRed(" ERROR "), ...args);

export { error, log };
