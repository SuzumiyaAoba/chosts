import stripAnsiCode from "strip-ansi";
import chalk from "chalk";
import { Hosts, HostsLine } from "./types.ts";

const readCurrentHosts = (path: string): string => {
  const hosts = Deno.readTextFileSync(path);

  return hosts;
};

const writeHosts = (hosts: string, path: string): void => {
  Deno.writeTextFileSync(path, stripAnsiCode(hosts));
};

const hostsToString = (hosts: Hosts): string => {
  if (typeof hosts === "string") {
    return hosts;
  }

  const longest = longestLength(hosts.lines);
  const lines = hosts.lines
    .map((line) => {
      switch (line.type) {
        case "entry": {
          const ip = chalk.green(line.ip.padEnd(longest.ip));
          const hostnames = chalk.magenta(
            [line.hostname, ...line.aliases].join(" ").padEnd(
              longest.hostnames,
            ),
          );
          const comment = line.comment ? chalk.gray(`# ${line.comment}`) : "";

          return `${ip} ${hostnames} ${comment}`;
        }
        case "comment":
          return chalk.gray(`# ${line.comment}`);
      }
    })
    .join("\n");

  return lines;
};

const longestLength = (
  lines: HostsLine[],
): {
  ip: number;
  hostnames: number;
} => {
  return lines.reduce(
    (acc, line) => {
      switch (line.type) {
        case "entry":
          return {
            ip: Math.max(acc.ip, line.ip.length),
            hostnames: Math.max(
              acc.hostnames,
              [line.hostname, ...line.aliases].join(" ").length,
            ),
          };
        case "comment":
          return acc;
        case "empty":
          return acc;
      }
    },
    { ip: 0, hostnames: 0 },
  );
};

export { hostsToString, readCurrentHosts, writeHosts };
